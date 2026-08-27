/**
 * src/database/db-accounts.js
 * Contas bancárias, carteiras, cartões benefício e importação OFX/CSV.
 */
const { parseOfxStatement } = require('./importers/ofxParser');
const { parseCsvStatement } = require('./importers/csvParser');

module.exports = (Base) => class extends Base {
  getAccounts(userId) {
    if (typeof userId === 'object' && userId !== null) {
      userId = userId.userId || userId.id;
    }
    userId = userId || 1;
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    let accounts = [];
    if (profileType === 1) {
      // ADM Geral
      accounts = this.db.prepare(`
        SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
        FROM accounts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.is_active = 1
        ORDER BY a.type, a.name
      `).all();
    } else {
      const perm = this.getUserPermissions(userId);
      if (perm.can_view_all === 1 && familyId) {
        accounts = this.db.prepare(`
          SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
          FROM accounts a
          LEFT JOIN users u ON a.user_id = u.id
          WHERE a.is_active = 1 AND u.family_id = ?
          ORDER BY a.type, a.name
        `).all(familyId);
      } else {
        accounts = this.db.prepare(`
          SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
          FROM accounts a
          LEFT JOIN users u ON a.user_id = u.id
          WHERE a.is_active = 1 AND a.user_id = ?
          ORDER BY a.type, a.name
        `).all(userId);
      }
    }

    return accounts.map(acc => {
      let banricompras_used = 0;
      try {
        banricompras_used = this.db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE account_id = ? AND credit_product = 'banricompras' AND is_paid = 0
        `).get(acc.id).total;
      } catch (e) { banricompras_used = 0; }

      const banricompras_available = Math.max(0, (acc.banricompras_limit || 0) - banricompras_used);
      const available_balance = (acc.balance || 0) + (acc.overdraft_limit || 0);

      let credit_used = 0;
      if (acc.type === 'credit') {
        try {
          // 1. Transações de despesas pendentes no cartão de crédito
          const pendingTxTotal = this.db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE account_id = ? AND type = 'expense' AND is_paid = 0 AND is_avulso != 2
          `).get(acc.id).total;

          // 2. Itens de despesas recorrentes/planejamento ativos vinculados ao cartão que ainda não viraram transação no mês
          const now = new Date();
          const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
          const currentYear = String(now.getFullYear());

          const pendingRecurringTotal = this.db.prepare(`
            SELECT COALESCE(SUM(ri.amount), 0) as total
            FROM recurring_items ri
            WHERE ri.account_id = ? AND ri.type = 'expense' AND ri.is_active = 1
            AND NOT EXISTS (
              SELECT 1 FROM transactions t
              WHERE t.recurring_item_id = ri.id
              AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
            )
          `).get(acc.id, currentMonth, currentYear).total;

          credit_used = pendingTxTotal + pendingRecurringTotal;
        } catch (err) {
          credit_used = 0;
        }
      }

      const available_limit = acc.type === 'credit' ? ((acc.credit_limit || 0) - credit_used) : 0;

      return {
        ...acc,
        credit_used,
        available_limit,
        banricompras_used,
        banricompras_available,
        available_balance
      };
    });
  }

  createAccount(data) {
    const { user_id } = data;
    const user = this.db.prepare("SELECT family_id FROM users WHERE id = ?").get(user_id);
    if (user && user.family_id) {
      const fam = this.db.prepare("SELECT quota_accounts FROM families WHERE id = ?").get(user.family_id);
      if (fam) {
        const currentAccounts = this.db.prepare("SELECT COUNT(*) as count FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.family_id = ? AND a.is_active = 1").get(user.family_id).count;
        if (currentAccounts >= fam.quota_accounts) {
          throw new Error(`Quota de contas excedida para esta família (Máximo: ${fam.quota_accounts}). Fale com o administrador!`);
        }
      }
    }

    const payload = {
      bank: 'outro',
      balance: 0,
      color: '#10b981',
      credit_limit: null,
      closing_day: null,
      due_day: null,
      agency: null,
      account_number: null,
      overdraft_limit: 0,
      banricompras_limit: 0,
      credit_minuto_limit: 0,
      benefit_type: 'va',
      benefit_monthly_credit: 0,
      benefit_credit_day: 1,
      card_last_digits: null,
      ...data
    };

    const r = this.db.prepare(`
      INSERT INTO accounts (user_id, name, type, bank, balance, color, credit_limit, closing_day, due_day, agency, account_number, overdraft_limit, banricompras_limit, credit_minuto_limit, benefit_type, benefit_monthly_credit, benefit_credit_day, card_last_digits)
      VALUES (@user_id, @name, @type, @bank, @balance, @color, @credit_limit, @closing_day, @due_day, @agency, @account_number, @overdraft_limit, @banricompras_limit, @credit_minuto_limit, @benefit_type, @benefit_monthly_credit, @benefit_credit_day, @card_last_digits)
    `).run(payload);
    const familyId = user ? user.family_id : null;
    this.logEvent('account:create', `Conta bancária "${data.name}" criada (Saldo inicial: R$ ${data.balance || 0}).`, familyId);
    this.logAudit({
      userId: data.user_id,
      familyId,
      action: 'ACCOUNT_CREATE',
      entityType: 'account',
      entityId: r.lastInsertRowid,
      description: `Criou conta: "${data.name}" (${data.type}, Saldo: R$ ${data.balance || 0})`,
      newValues: { name: data.name, type: data.type, bank: data.bank, balance: data.balance, credit_limit: data.credit_limit }
    });
    return { success: true, id: r.lastInsertRowid };
  }

  updateAccount(data) {
    const old = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(data.id);
    const payload = {
      bank: 'outro',
      balance: 0,
      color: '#10b981',
      credit_limit: null,
      closing_day: null,
      due_day: null,
      agency: null,
      account_number: null,
      overdraft_limit: 0,
      banricompras_limit: 0,
      credit_minuto_limit: 0,
      benefit_type: 'va',
      benefit_monthly_credit: 0,
      benefit_credit_day: 1,
      card_last_digits: null,
      ...old,
      ...data
    };
    this.db.prepare(`
      UPDATE accounts SET user_id=@user_id, name=@name, type=@type, bank=@bank, balance=@balance, color=@color,
      credit_limit=@credit_limit, closing_day=@closing_day, due_day=@due_day,
      agency=@agency, account_number=@account_number,
      overdraft_limit=@overdraft_limit, banricompras_limit=@banricompras_limit, credit_minuto_limit=@credit_minuto_limit,
      benefit_type=@benefit_type, benefit_monthly_credit=@benefit_monthly_credit, benefit_credit_day=@benefit_credit_day, card_last_digits=@card_last_digits
      WHERE id=@id
    `).run(payload);

    if (old) {
      this.logAudit({
        userId: data.user_id || old.user_id,
        action: 'ACCOUNT_UPDATE',
        entityType: 'account',
        entityId: data.id,
        description: `Alterou conta: "${old.name}" ➔ "${data.name}"`,
        oldValues: { name: old.name, balance: old.balance, credit_limit: old.credit_limit },
        newValues: { name: data.name, balance: data.balance, credit_limit: data.credit_limit }
      });
    }

    return { success: true };
  }

  deleteAccount(id) {
    const acc = this.db.prepare('SELECT a.name, a.user_id, u.family_id FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = ?').get(id);
    this.db.prepare('UPDATE accounts SET is_active = 0 WHERE id = ?').run(id);
    if (acc) {
      this.logEvent('account:delete', `Conta bancária "${acc.name}" foi arquivada.`, acc.family_id);
      this.logAudit({
        userId: acc.user_id,
        familyId: acc.family_id,
        action: 'ACCOUNT_DELETE',
        entityType: 'account',
        entityId: id,
        description: `Arquivou conta bancária: "${acc.name}"`,
        oldValues: { name: acc.name, is_active: 1 },
        newValues: { is_active: 0 }
      });
    }
    return { success: true };
  }

  transferBetweenAccounts({ from_account_id, to_account_id, amount, date, description, user_id }) {
    const t = this.db.transaction(() => {
      this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, from_account_id);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, to_account_id);
      this.db.prepare(`INSERT INTO transactions (user_id, account_id, type, amount, description, date, is_paid, is_avulso) VALUES (?, ?, 'transfer', ?, ?, ?, 1, 1)`).run(user_id, from_account_id, amount, description || 'Transferência', date);
    });
    t();

    const fromAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(from_account_id);
    const toAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(to_account_id);
    this.logAudit({
      userId: user_id,
      action: 'ACCOUNT_TRANSFER',
      entityType: 'account',
      description: `Transferência de R$ ${amount} de "${fromAcc ? fromAcc.name : from_account_id}" para "${toAcc ? toAcc.name : to_account_id}"`,
      newValues: { from_account_id, to_account_id, amount, date, description }
    });

    return { success: true };
  }

  // ── CATEGORIES ───────────────────────────────────────────────
  getCategories(userId) {
    if (typeof userId === 'object' && userId !== null) {
      userId = userId.userId || userId.id;
    }
    userId = userId || 1;
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`SELECT * FROM categories ORDER BY type, name`).all();
    }

    const perm = this.getUserPermissions(userId);
    if (perm.can_view_all === 1 && familyId) {
      return this.db.prepare(`
        SELECT c.* FROM categories c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.user_id IS NULL OR u.family_id = ?
        ORDER BY c.type, c.name
      `).all(familyId);
    } else {
      return this.db.prepare(`SELECT * FROM categories WHERE (user_id = ? OR user_id IS NULL) ORDER BY type, name`).all(userId);
    }
  }

  createCategory(data) {
    const existing = this.db.prepare(`
      SELECT id FROM categories 
      WHERE lower(trim(name)) = lower(trim(?)) 
      AND (type = ? OR type = 'both' OR ? = 'both')
      AND (user_id = ? OR user_id IS NULL)
    `).get(data.name, data.type, data.type, data.user_id);
    if (existing) {
      return { success: false, error: `Já existe uma categoria com o nome "${data.name}".` };
    }
    const r = this.db.prepare(`INSERT INTO categories (user_id, name, type, color, icon) VALUES (@user_id, @name, @type, @color, @icon)`).run(data);
    return { success: true, id: r.lastInsertRowid };
  }

  updateCategory(data) {
    this.db.prepare(`UPDATE categories SET name=@name, type=@type, color=@color, icon=@icon WHERE id=@id`).run(data);
    return { success: true };
  }

  deleteCategory(id) {
    this.db.prepare('DELETE FROM categories WHERE id = ? AND is_default = 0').run(id);
    return { success: true };
  }

  cleanDuplicateCategories() {
    try {
      // Find custom categories that match a default category by name and type
      const duplicates = this.db.prepare(`
        SELECT c_custom.id as custom_id, c_default.id as default_id, c_custom.name
        FROM categories c_custom
        JOIN categories c_default ON lower(trim(c_custom.name)) = lower(trim(c_default.name)) AND (c_custom.type = c_default.type OR c_custom.type = 'both' OR c_default.type = 'both')
        WHERE c_custom.is_default = 0 AND c_default.is_default = 1 AND c_custom.id != c_default.id
      `).all();

      if (duplicates.length > 0) {
        const cleanup = this.db.transaction(() => {
          for (const d of duplicates) {
            this.db.prepare('UPDATE transactions SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('UPDATE recurring_items SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('UPDATE OR IGNORE budgets SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('DELETE FROM categories WHERE id = ?').run(d.custom_id);
          }
        });
        cleanup();
        console.log(`[Auto-Clean] Removidas ${duplicates.length} categorias duplicadas do banco.`);
      }
    } catch (e) {
      console.error('Erro na limpeza de categorias duplicadas:', e);
    }
  }

  // ── RECURRING ITEMS ──────────────────────────────────────────
  parseOfxStatement(ofxString) {
    const { parseOfx } = require('./importers/ofxParser');
    return parseOfx(ofxString);
  }

  parseCsvStatement(csvString) {
    const { parseCsv } = require('./importers/csvParser');
    return parseCsv(csvString);
  }

  importBankTransactions({ userId, accountId, transactions }) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return { success: true, count: 0 };
    }

    const stmt = this.db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, category_id, type, amount, description, date, is_paid, is_avulso, payment_date
      ) VALUES (
        @user_id, @account_id, @category_id, @type, @amount, @description, @date, 1, 1, @payment_date
      )
    `);

    const updateAccountBal = this.db.prepare(`
      UPDATE accounts 
      SET balance = balance + ? 
      WHERE id = ?
    `);

    let count = 0;
    const insertMany = this.db.transaction((txs) => {
      for (const t of txs) {
        const paymentDate = t.date || new Date().toISOString().split('T')[0];
        stmt.run({
          user_id: userId,
          account_id: accountId,
          category_id: t.category_id || null,
          type: t.type || 'expense',
          amount: Math.abs(Number(t.amount) || 0),
          description: t.description || 'Lançamento Importado',
          date: paymentDate,
          payment_date: paymentDate
        });

        // Atualiza saldo da conta para lançamentos conciliados
        const delta = t.type === 'income' ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount));
        updateAccountBal.run(delta, accountId);
        count++;
      }
    });

    insertMany(transactions);
    return { success: true, count };
  }

  // ── SMART DEDUPLICATION & SYNC ENGINE ─────────────────────────

  // ── SMART DEDUPLICATION & SYNC ENGINE ─────────────────────────

};
