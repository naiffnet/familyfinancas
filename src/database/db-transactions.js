/**
 * src/database/db-transactions.js
 * Lançamentos avulsos, baixas/quitação com juros/descontos e ordenação.
 */
module.exports = (Base) => class extends Base {
  getTransactions({ userId, month, year, type, accountId, search, avulsoOnly }) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    let q = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name, a.color as account_color, a.bank as account_bank,
             ri.name as recurring_name, ri.is_priority as is_priority
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (profileType !== 1) {
      if (perm.can_view_all === 0) {
        q += ` AND t.user_id = ?`;
        params.push(userId);
      } else {
        q += ` AND u.family_id = ?`;
        params.push(familyId);
      }
    }
    
    if (month && year) { q += ` AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?`; params.push(String(month).padStart(2,'0'), String(year)); }
    if (type) { q += ` AND t.type = ?`; params.push(type); }
    if (accountId) { q += ` AND t.account_id = ?`; params.push(accountId); }
    if (search) { q += ` AND t.description LIKE ?`; params.push(`%${search}%`); }
    if (avulsoOnly) { 
      q += ` AND t.is_avulso = 1`; 
    } else {
      q += ` AND t.is_avulso != 2`;
    }
    q += ` ORDER BY t.position ASC, COALESCE(ri.is_priority, 0) DESC, t.date DESC, t.id DESC`;
    return this.db.prepare(q).all(...params);
  }

  getMonthlyTransactionsByRecurring(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const m = String(month).padStart(2,'0');
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.is_avulso = 0
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(m, String(year));
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.is_avulso = 0 AND u.family_id = ?
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(familyId, m, String(year));
    } else {
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ? AND t.is_avulso = 0
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(userId, m, String(year));
    }
  }

  createTransaction(data) {
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const familyId = user ? user.family_id : null;
    const txData = {
      category_id: null,
      recurring_item_id: null,
      notes: null,
      is_avulso: 0,
      competence_date: null,
      credit_product: 'normal',
      due_date: null,
      ...data,
      payment_date: data.is_paid ? (data.payment_date || data.date) : null
    };
    const t = this.db.transaction(() => {
      const r = this.db.prepare(`
        INSERT INTO transactions (user_id, account_id, category_id, recurring_item_id, type, amount, description, date, payment_date, competence_date, is_paid, is_avulso, notes, credit_product, due_date)
        VALUES (@user_id, @account_id, @category_id, @recurring_item_id, @type, @amount, @description, @date, @payment_date, @competence_date, @is_paid, @is_avulso, @notes, @credit_product, @due_date)
      `).run(txData);
      if (txData.is_paid) {
        const delta = txData.type === 'income' ? txData.amount : -txData.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, txData.account_id);
      }
      return r.lastInsertRowid;
    });
    const id = t();
    const cleanType = data.type === 'income' ? 'receita' : 'despesa';
    this.logEvent('transaction:create', `Usuário "${user ? user.name : 'Desconhecido'}" lançou uma ${cleanType}: "${data.description}" (Valor: R$ ${data.amount}).`, familyId);
    return { success: true, id };
  }

  updateTransaction(data) {
    const old = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(data.id);
    if (!old) return { success: false, error: 'Lançamento não encontrado' };
    const txData = {
      ...old,
      ...data,
      payment_date: (data.is_paid !== undefined ? data.is_paid : old.is_paid) ? (data.payment_date || old.payment_date || data.date || old.date) : null
    };
    this.db.transaction(() => {
      if (old.is_paid) {
        const d = old.type === 'income' ? -old.amount : old.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, old.account_id);
      }
      this.db.prepare(`
        UPDATE transactions SET account_id=@account_id, category_id=@category_id, type=@type,
        amount=@amount, description=@description, date=@date, payment_date=@payment_date, competence_date=@competence_date, is_paid=@is_paid, notes=@notes, credit_product=@credit_product, due_date=@due_date WHERE id=@id
      `).run(txData);
      if (txData.is_paid) {
        const d = txData.type === 'income' ? txData.amount : -txData.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, txData.account_id);
      }
    })();
    return { success: true };
  }

  deleteTransaction(idPayload) {
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) {
      id = idPayload.id || idPayload.txId;
    }
    id = parseInt(id);
    if (!id || isNaN(id)) return { success: false, error: 'ID de lançamento inválido' };

    const t = this.db.prepare('SELECT t.*, u.family_id, u.name as user_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado ou já excluído' };

    this.db.transaction(() => {
      if (t.is_paid && t.type !== 'transfer') {
        const d = t.type === 'income' ? -t.amount : t.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, t.account_id);
      }
      // Sempre deleta de verdade quando o usuário clica em excluir.
      // A marcação [PULADA] (is_avulso=2) é usada apenas internamente pelo sistema de postergação.
      this.db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    })();

    if (t.family_id) {
      this.logEvent('transaction:delete', `Usuário "${t.user_name || 'Desconhecido'}" excluiu o lançamento: "${t.description}" (Valor original: R$ ${t.amount}).`, t.family_id);
    }
    return { success: true };
  }

  toggleTransactionPaid(id) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado' };
    const newPaid = t.is_paid ? 0 : 1;
    const todayStr = new Date().toISOString().slice(0, 10);
    this.db.transaction(() => {
      const netAmount = (t.amount + (t.penalty_amount || 0) - (t.discount_amount || 0));
      const delta = (t.type === 'income' ? netAmount : -netAmount) * (newPaid ? 1 : -1);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      this.db.prepare('UPDATE transactions SET is_paid = ?, payment_date = ? WHERE id = ?').run(newPaid, newPaid ? (t.payment_date || t.date || todayStr) : null, id);
    })();
    return { success: true };
  }

  toggleTransactionPaidWithDate(id, paymentDate, options = {}) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado' };
    
    const penalty = options && options.penalty_amount ? parseFloat(options.penalty_amount) : 0;
    const discount = options && options.discount_amount ? parseFloat(options.discount_amount) : 0;
    const newPaid = t.is_paid ? 0 : 1;

    this.db.transaction(() => {
      const oldNet = (t.amount + (t.penalty_amount || 0) - (t.discount_amount || 0));
      const newNet = (t.amount + penalty - discount);

      let delta = 0;
      if (newPaid && !t.is_paid) {
        delta = (t.type === 'income' ? newNet : -newNet);
      } else if (!newPaid && t.is_paid) {
        delta = (t.type === 'income' ? -oldNet : oldNet);
      } else if (newPaid && t.is_paid) {
        const oldDelta = (t.type === 'income' ? oldNet : -oldNet);
        const newDelta = (t.type === 'income' ? newNet : -newNet);
        delta = newDelta - oldDelta;
      }

      if (delta !== 0) {
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      }

      if (newPaid) {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 1, payment_date = ?, penalty_amount = ?, discount_amount = ? 
          WHERE id = ?
        `).run(paymentDate, penalty, discount, id);
      } else {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 0, payment_date = NULL, penalty_amount = 0, discount_amount = 0 
          WHERE id = ?
        `).run(id);
      }
    })();
    return { success: true };
  }

  updateTransactionPositions(userId, positions) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const familyId = user.family_id;
    const profileType = user.profile_type;

    const update = this.db.transaction(() => {
      const checkStmt = this.db.prepare(`
        SELECT 1 FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND (u.family_id = ? OR t.user_id = ?)
      `);
      const updateStmt = this.db.prepare('UPDATE transactions SET position = ? WHERE id = ?');
      
      for (const item of positions) {
        if (profileType === 1 || checkStmt.get(item.id, familyId, userId)) {
          updateStmt.run(item.position, item.id);
        }
      }
    });
    update();
    return { success: true };
  }

  // ── DASHBOARD ────────────────────────────────────────────────
};
