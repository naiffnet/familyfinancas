/**
 * src/database/db-recurring.js
 * Despesas e receitas fixas/recorrentes, prioridades, ordenação e adiamento.
 */
module.exports = (Base) => class extends Base {
  getRecurringItems(userId, type, month, year) {
    if (userId && typeof userId === 'object') {
      type = type || userId.type;
      month = month || userId.month;
      year = year || userId.year;
      userId = userId.userId || userId.id;
    }
    if (!userId) return [];

    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    let q = `
      SELECT ri.*, c.name as category_name, c.color as cat_color, c.icon as cat_icon,
             a.name as account_name, a.bank as account_bank, a.type as account_type
      FROM recurring_items ri
      LEFT JOIN categories c ON ri.category_id = c.id
      LEFT JOIN accounts a ON ri.account_id = a.id
      LEFT JOIN users u ON ri.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (profileType !== 1) {
      if (perm.can_view_all === 0) {
        q += ` AND ri.user_id = ?`;
        params.push(userId);
      } else {
        q += ` AND u.family_id = ?`;
        params.push(familyId);
      }
    }
    
    if (type) { q += ` AND ri.type = ?`; params.push(type); }
    q += ` ORDER BY ri.position ASC, ri.is_priority DESC, ri.due_day ASC, ri.name ASC`;
    
    const allItems = this.db.prepare(q).all(...params);
    
    if (month && year) {
      const targetMonth = month;
      const targetYear = year;
      const now = new Date();
      
      return allItems.filter(item => {
        // 0. Se possui transação pulada/postergada (is_avulso = 2) no mês alvo, não exibe neste mês
        const isSoftDeleted = this.db.prepare(`
          SELECT 1 FROM transactions t
          WHERE t.recurring_item_id = ? 
          AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          AND t.is_avulso = 2
        `).get(item.id, String(targetMonth).padStart(2, '0'), String(targetYear));
        
        if (isSoftDeleted) return false;

        // 1. Sempre exibe se já possuir transação física gerada no mês alvo (integridade histórica)
        const hasTx = this.db.prepare(`
          SELECT 1 FROM transactions t
          WHERE t.recurring_item_id = ? 
          AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          AND t.is_avulso = 0
        `).get(item.id, String(targetMonth).padStart(2, '0'), String(targetYear));
        
        if (hasTx) return true;
        
        // 2. Senão, avalia a vigência ativa do item
        let createdYear, createdMonth;
        if (item.created_at) {
          const parts = item.created_at.split('-');
          createdYear = parseInt(parts[0], 10);
          createdMonth = parseInt(parts[1], 10);
        } else {
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }
        
        const monthsDiff = (targetYear - createdYear) * 12 + (targetMonth - createdMonth);
        
        // Não pode estar ativo antes de sua criação
        if (monthsDiff < 0) return false;
        
        // Count skipped/soft-deleted transactions between created_at and target month to subtract them
        const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
        const targetMonthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        let skippedCount = 0;
        if (createdAtStart < targetMonthStart) {
          skippedCount = this.db.prepare(`
            SELECT COUNT(*) as c FROM transactions 
            WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
          `).get(item.id, createdAtStart, targetMonthStart).c;
        }
        
        const startInstallment = item.start_installment || 1;
        const currentInstallment = monthsDiff + startInstallment - skippedCount;
        
        // Se tem limite de repetições, não pode estar ativo após expirar
        if (item.repeat_months && item.repeat_months > 0) {
          if (currentInstallment > item.repeat_months) {
            return false;
          }
        }
        
        // Só exibe se estiver ativo
        return item.is_active === 1;
      });
    }
    
    return allItems;
  }

  createRecurringItem(data) {
    const { is_paid, ...rawInsert } = data;
    const insertData = {
      category_id: null,
      is_priority: 0,
      icon: null,
      color: null,
      notes: null,
      repeat_months: 0,
      start_installment: 1,
      competence_offset: 0,
      interest_rate: 0,
      interest_type: 'daily',
      penalty_fixed_rate: 0,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      ...rawInsert
    };
    insertData.interest_rate = insertData.interest_rate !== undefined ? parseFloat(insertData.interest_rate) || 0 : 0;
    insertData.interest_type = insertData.interest_type || 'daily';
    insertData.penalty_fixed_rate = insertData.penalty_fixed_rate !== undefined ? parseFloat(insertData.penalty_fixed_rate) || 0 : 0;

    const r = this.db.prepare(`
      INSERT INTO recurring_items (user_id, name, type, amount, category_id, account_id, due_day, is_priority, icon, color, notes, repeat_months, start_installment, competence_offset, interest_rate, interest_type, penalty_fixed_rate, created_at)
      VALUES (@user_id, @name, @type, @amount, @category_id, @account_id, @due_day, @is_priority, @icon, @color, @notes, @repeat_months, @start_installment, @competence_offset, @interest_rate, @interest_type, @penalty_fixed_rate, @created_at)
    `).run(insertData);
    const newId = r.lastInsertRowid;

    // Immediately generate this and future/past relevant months if created_at specified
    let genMonth, genYear;
    if (insertData.created_at) {
      const parts = insertData.created_at.split('-');
      genYear = parseInt(parts[0], 10);
      genMonth = parseInt(parts[1], 10);
    }
    const now = new Date();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();

    if (genMonth && genYear) {
      let bM = genMonth;
      let bY = genYear;
      while (bY < currYear || (bY === currYear && bM <= currMonth)) {
        this.generateMonthlyRecurrences(bM, bY);
        bM++;
        if (bM > 12) { bM = 1; bY++; }
      }
    } else {
      this.generateMonthlyRecurrences(currMonth, currYear);
    }

    // If it's already marked as paid/received this month:
    if (is_paid) {
      const month = genMonth || currMonth;
      const year = genYear || currYear;
      const m = String(month).padStart(2, '0');
      const y = String(year);

      const tx = this.db.prepare(`
        SELECT id, date FROM transactions
        WHERE recurring_item_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `).get(newId, m, y);

      if (tx) {
        this.db.transaction(() => {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, data.account_id);
          this.db.prepare('UPDATE transactions SET is_paid = 1, payment_date = ? WHERE id = ?').run(tx.date, tx.id);
        })();
      }
    }

    this.logAudit({
      userId: data.user_id,
      action: 'RECURRING_CREATE',
      entityType: 'recurring_item',
      entityId: newId,
      description: `Criou item de planejamento: "${data.name}" (${data.type}, R$ ${data.amount})`,
      newValues: { name: data.name, type: data.type, amount: data.amount, due_day: data.due_day, repeat_months: data.repeat_months }
    });

    return { success: true, id: newId };
  }

  updateRecurringItem(data) {
    const existing = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(data.id);
    if (!existing) return { success: false, error: 'Item não encontrado' };

    const payload = {
      ...existing,
      ...data,
      competence_offset: data.competence_offset !== undefined ? data.competence_offset : (existing.competence_offset || 0),
      interest_rate: data.interest_rate !== undefined ? (parseFloat(data.interest_rate) || 0) : (existing.interest_rate || 0),
      interest_type: data.interest_type || existing.interest_type || 'daily',
      penalty_fixed_rate: data.penalty_fixed_rate !== undefined ? (parseFloat(data.penalty_fixed_rate) || 0) : (existing.penalty_fixed_rate || 0),
    };

    const runUpdate = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE recurring_items SET name=@name, type=@type, amount=@amount, category_id=@category_id,
        account_id=@account_id, due_day=@due_day, is_priority=@is_priority, icon=@icon, color=@color, notes=@notes, repeat_months=@repeat_months,
        start_installment=@start_installment,
        competence_offset=@competence_offset,
        interest_rate=@interest_rate,
        interest_type=@interest_type,
        penalty_fixed_rate=@penalty_fixed_rate,
        created_at=@created_at
        WHERE id=@id
      `).run(payload);

      const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(data.id);
      if (!item) return;

      let createdYear, createdMonth;
      if (item.created_at) {
        const partsC = item.created_at.split('-');
        createdYear = parseInt(partsC[0], 10);
        createdMonth = parseInt(partsC[1], 10);
      } else {
        const now = new Date();
        createdYear = now.getFullYear();
        createdMonth = now.getMonth() + 1;
      }

      // Sync unpaid transactions
      const unpaidTxs = this.db.prepare('SELECT * FROM transactions WHERE recurring_item_id = ? AND is_paid = 0 AND is_avulso != 2').all(item.id);
      for (const t of unpaidTxs) {
        const parts = t.date.split('-');
        const txYear = parseInt(parts[0], 10);
        const txMonth = parseInt(parts[1], 10);

        const monthsDiff = (txYear - createdYear) * 12 + (txMonth - createdMonth);
        
        // Count skipped/soft-deleted transactions between created_at and this transaction's month to subtract them
        const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
        const targetMonthStart = `${parts[0]}-${parts[1]}-01`;
        let skippedCount = 0;
        if (createdAtStart < targetMonthStart) {
          skippedCount = this.db.prepare(`
            SELECT COUNT(*) as c FROM transactions 
            WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
          `).get(item.id, createdAtStart, targetMonthStart).c;
        }

        const startInstallment = item.start_installment || 1;
        const currentInstallment = monthsDiff + startInstallment - skippedCount;

        if (monthsDiff < 0 || (item.repeat_months > 0 && currentInstallment > item.repeat_months)) {
          this.db.prepare('DELETE FROM transactions WHERE id = ?').run(t.id);
        } else {
          const suffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const newDesc = item.name + suffix;

          // Reconstruct date using new due_day in case it changed
          const day = Math.min(item.due_day, new Date(txYear, txMonth, 0).getDate());
          const newDateStr = `${parts[0]}-${parts[1]}-${String(day).padStart(2, '0')}`;

          // Reconstruct competence_date
          const offset = item.competence_offset || 0;
          let compMonth = txMonth + offset;
          let compYear = txYear + Math.floor((compMonth - 1) / 12);
          compMonth = ((compMonth - 1) % 12 + 12) % 12 + 1;
          const compDateStr = `${compYear}-${String(compMonth).padStart(2, '0')}-01`;

          this.db.prepare(`
            UPDATE transactions 
            SET description = ?, amount = ?, date = ?, competence_date = ?
            WHERE id = ?
          `).run(newDesc, item.amount, newDateStr, compDateStr, t.id);
        }
      }
    });

    runUpdate();

    const updated = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(data.id);
    if (updated) {
      this.logAudit({
        userId: updated.user_id,
        action: 'RECURRING_UPDATE',
        entityType: 'recurring_item',
        entityId: data.id,
        description: `Alterou item de planejamento: "${updated.name}" (R$ ${updated.amount})`,
        newValues: { name: updated.name, type: updated.type, amount: updated.amount, due_day: updated.due_day }
      });
    }

    return { success: true };
  }

  deleteRecurringItem(id, fromDate) {
    const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(id);
    this.db.transaction(() => {
      if (item && fromDate) {
        let createdYear, createdMonth;
        if (item.created_at) {
          const parts = item.created_at.split('-');
          createdYear = parseInt(parts[0], 10);
          createdMonth = parseInt(parts[1], 10);
        } else {
          const now = new Date();
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }

        const partsDel = fromDate.split('-');
        const deleteYear = parseInt(partsDel[0], 10);
        const deleteMonth = parseInt(partsDel[1], 10);

        const monthsDiff = (deleteYear - createdYear) * 12 + (deleteMonth - createdMonth);

        if (monthsDiff > 0) {
          // Keep active = 1 but set repeat_months to monthsDiff to cancel future and preserve past
          this.db.prepare('UPDATE recurring_items SET repeat_months = ? WHERE id = ?').run(monthsDiff, id);
        } else {
          // Deactivating on start month or earlier - deactivate globally
          this.db.prepare('UPDATE recurring_items SET is_active = 0 WHERE id = ?').run(id);
        }
      } else {
        this.db.prepare('UPDATE recurring_items SET is_active = 0 WHERE id = ?').run(id);
      }

      if (fromDate) {
        const txsToDelete = this.db.prepare(`
          SELECT * FROM transactions 
          WHERE recurring_item_id = ? AND date >= ?
        `).all(id, fromDate);

        for (const t of txsToDelete) {
          if (t.is_paid && t.type !== 'transfer') {
            const d = t.type === 'income' ? -t.amount : t.amount;
            this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, t.account_id);
          }
        }

        this.db.prepare(`
          DELETE FROM transactions 
          WHERE recurring_item_id = ? AND date >= ?
        `).run(id, fromDate);
      }
    })();

    if (item) {
      this.logAudit({
        userId: item.user_id,
        action: 'RECURRING_DELETE',
        entityType: 'recurring_item',
        entityId: id,
        description: `Excluiu/encerrou item de planejamento: "${item.name}" (a partir de ${fromDate || 'início'})`,
        oldValues: { name: item.name, amount: item.amount, is_active: 1 }
      });
    }

    return { success: true };
  }

  postponeRecurringInstallment({ txId, itemId }) {
    const t = this.db.transaction(() => {
      const tx = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
      if (tx) {
        if (tx.is_paid && tx.type !== 'transfer') {
          const d = tx.type === 'income' ? -tx.amount : tx.amount;
          this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, tx.account_id);
        }
        // Soft-delete: mark is_avulso = 2 (invisible), amount = 0, is_paid = 0, description updated
        this.db.prepare(`
          UPDATE transactions 
          SET is_avulso = 2, amount = 0, is_paid = 0, description = '[POSTERGADA] ' || description
          WHERE id = ?
        `).run(txId);
      }

      const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(itemId);
      if (item && item.created_at) {
        // Push created_at (start month) forward by 1 month to prevent regeneration and shift subsequent numbering
        const parts = item.created_at.split('-');
        let year = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        const newCreatedAt = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
        this.db.prepare('UPDATE recurring_items SET created_at = ? WHERE id = ?').run(newCreatedAt, itemId);

        const updatedItem = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(itemId);
        
        let createdYear, createdMonth;
        if (updatedItem.created_at) {
          const partsC = updatedItem.created_at.split('-');
          createdYear = parseInt(partsC[0], 10);
          createdMonth = parseInt(partsC[1], 10);
        } else {
          const now = new Date();
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }

        // Sync remaining unpaid transactions
        const unpaidTxs = this.db.prepare('SELECT * FROM transactions WHERE recurring_item_id = ? AND is_paid = 0 AND is_avulso != 2').all(itemId);
        for (const ut of unpaidTxs) {
          const parts = ut.date.split('-');
          const txYear = parseInt(parts[0], 10);
          const txMonth = parseInt(parts[1], 10);

          const monthsDiff = (txYear - createdYear) * 12 + (txMonth - createdMonth);

          // Count skipped/soft-deleted transactions between created_at and this transaction's month to subtract them
          const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
          const targetMonthStart = `${parts[0]}-${parts[1]}-01`;
          let skippedCount = 0;
          if (createdAtStart < targetMonthStart) {
            skippedCount = this.db.prepare(`
              SELECT COUNT(*) as c FROM transactions 
              WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
            `).get(itemId, createdAtStart, targetMonthStart).c;
          }

          const startInstallment = updatedItem.start_installment || 1;
          const currentInstallment = monthsDiff + startInstallment - skippedCount;

          if (monthsDiff < 0 || (updatedItem.repeat_months > 0 && currentInstallment > updatedItem.repeat_months)) {
            this.db.prepare('DELETE FROM transactions WHERE id = ?').run(ut.id);
          } else {
            const suffix = updatedItem.repeat_months && updatedItem.repeat_months > 0
              ? ` ${currentInstallment}/${updatedItem.repeat_months}`
              : '';
            const newDesc = updatedItem.name + suffix;

            const day = Math.min(updatedItem.due_day, new Date(txYear, txMonth, 0).getDate());
            const newDateStr = `${parts[0]}-${parts[1]}-${String(day).padStart(2, '0')}`;

            this.db.prepare(`
              UPDATE transactions 
              SET description = ?, amount = ?, date = ?
              WHERE id = ?
            `).run(newDesc, updatedItem.amount, newDateStr, ut.id);
          }
        }
      }
    });

    t();
    return { success: true };
  }

  toggleRecurringPriority(id) {
    const item = this.db.prepare('SELECT is_priority FROM recurring_items WHERE id = ?').get(id);
    this.db.prepare('UPDATE recurring_items SET is_priority = ? WHERE id = ?').run(item.is_priority ? 0 : 1, id);
    return { success: true };
  }

  updateRecurringPositions(userId, positions) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const familyId = user.family_id;
    const profileType = user.profile_type;

    const update = this.db.transaction(() => {
      const checkStmt = this.db.prepare(`
        SELECT 1 FROM recurring_items ri
        LEFT JOIN users u ON ri.user_id = u.id
        WHERE ri.id = ? AND (u.family_id = ? OR ri.user_id = ?)
      `);
      const updateStmt = this.db.prepare('UPDATE recurring_items SET position = ? WHERE id = ?');
      
      for (const item of positions) {
        if (profileType === 1 || checkStmt.get(item.id, familyId, userId)) {
          updateStmt.run(item.position, item.id);
        }
      }
    });
    update();
    return { success: true };
  }

  getSubscriptionRadar(userId) {
    if (!userId) return { subscriptions: [], totalMonthly: 0, totalAnnual: 0 };
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { subscriptions: [], totalMonthly: 0, totalAnnual: 0 };

    const items = this.db.prepare(`
      SELECT ri.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name, a.type as account_type
      FROM recurring_items ri
      LEFT JOIN categories c ON ri.category_id = c.id
      LEFT JOIN accounts a ON ri.account_id = a.id
      LEFT JOIN users u ON ri.user_id = u.id
      WHERE (u.family_id = ? OR ri.user_id = ?) AND ri.type = 'expense'
      AND (ri.repeat_months IS NULL OR ri.repeat_months <= 1)
      ORDER BY ri.amount DESC
    `).all(user.family_id, userId);

    let totalMonthly = 0;
    const subscriptions = items.map(item => {
      const monthly = item.amount || 0;
      const annual = monthly * 12;
      totalMonthly += monthly;

      // Buscar histórico dos últimos 6 meses para detectar reajustes de preço
      const pastTxs = this.db.prepare(`
        SELECT amount, date FROM transactions
        WHERE recurring_item_id = ? AND is_avulso != 2
        ORDER BY date DESC LIMIT 6
      `).all(item.id);

      let priceChangeAlert = null;
      if (pastTxs.length >= 2) {
        const oldest = pastTxs[pastTxs.length - 1].amount;
        const newest = pastTxs[0].amount;
        if (newest > oldest) {
          const diff = newest - oldest;
          priceChangeAlert = `Reajuste detectado: aumento de R$ ${diff.toFixed(2)} (+${((diff / oldest) * 100).toFixed(1)}%)`;
        }
      }

      return {
        id: item.id,
        name: item.name,
        monthly_amount: monthly,
        annual_cost: annual,
        due_day: item.due_day,
        category_name: item.category_name || 'Assinaturas & Serviços',
        category_color: item.category_color || '#8b5cf6',
        category_icon: item.category_icon || '📱',
        account_name: item.account_name || 'Conta Padrão',
        account_type: item.account_type || 'checking',
        price_change_alert: priceChangeAlert
      };
    });

    return {
      subscriptions,
      totalMonthly,
      totalAnnual: totalMonthly * 12,
      count: subscriptions.length
    };
  }

  // ── TRANSACTIONS ─────────────────────────────────────────────
};

