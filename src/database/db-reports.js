/**
 * src/database/db-reports.js
 * Orçamentos, metas, fluxos de caixa, patrimônio e resumos do Dashboard.
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
  getDashboardSummary(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const m = String(month).padStart(2,'0');
    const y = String(year);
    const now = new Date();
    const today = now.getDate();

    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const settings = this.getSettings(userId);
    const alertDays = settings.alert_days_before || 3;
    const perm = this.getUserPermissions(userId);

    let income, expense, pending, priorityItems, alertItems, totalRecurring, paidRecurring;

    if (profileType === 1) {
      // ADM Geral
      income = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
    } else if (perm.can_view_all === 1) {
      income = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.type='income' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(familyId, familyId, m, y).v;
      expense = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(familyId, familyId, m, y).v;
      pending = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.type='expense' AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(familyId, familyId, m, y).v;
    } else {
      income = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.type='income' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(userId, userId, m, y).v;
      expense = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(userId, userId, m, y).v;
      pending = this.db.prepare(`
        SELECT COALESCE(SUM(t.amount),0) as v 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.type='expense' AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(userId, userId, m, y).v;
    }

    const accounts = this.getAccounts(userId);

    // Dynamic monthly balance & card spending
    const cardSpending = {};
    const cardMonthlyInvoices = {};
    for (const acc of accounts) {
      if (acc.type === 'credit') {
        const cycle = getCardBillingCycle(acc.closing_day, acc.due_day, month, year);
        const cycleSpent = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='expense' 
          AND date >= ? AND date <= ?
        `).get(acc.id, cycle.start, cycle.end).v;

        // 1. Soma de todas as faturas abertas / não pagas do cartão
        const openInvoicesSum = this.db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as v 
          FROM invoices 
          WHERE card_account_id = ? AND is_paid = 0 AND is_renegotiated = 0 AND amount > 0
        `).get(acc.id).v;

        // 2. Despesas avulsas ou pendentes ainda não associadas a faturas abertas
        const unInvoicedTxs = this.db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as v 
          FROM transactions 
          WHERE account_id = ? AND type = 'expense' AND (is_paid = 0 OR is_paid IS NULL) AND is_avulso != 2 
          AND (invoice_id IS NULL OR invoice_id NOT IN (SELECT id FROM invoices WHERE card_account_id = ? AND is_paid = 0))
        `).get(acc.id, acc.id).v;

        const totalCommitted = openInvoicesSum + unInvoicedTxs;

        cardMonthlyInvoices[acc.id] = cycleSpent;
        cardSpending[acc.id] = totalCommitted;
        acc.current_invoice = cycleSpent;
        acc.committed_limit = totalCommitted;
        acc.credit_used = totalCommitted;
        acc.available_limit = (acc.credit_limit || 0) - totalCommitted;
      } else {
        // 1. Receitas Avulsas do Mês
        const avulsoIncome = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='income' AND is_avulso=1 
          AND strftime('%m',date)=? AND strftime('%Y',date)=?
        `).get(acc.id, m, y).v;
        
        // 2. Transações de Receitas Recorrentes Reais (qualquer uma que já exista fisicamente no banco)
        const generatedActiveIncome = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='income' AND recurring_item_id IS NOT NULL
          AND strftime('%m',date)=? AND strftime('%Y',date)=?
        `).get(acc.id, m, y).v;

        // 3. Projeção de Receitas Recorrentes ATIVAS que ainda não caíram no mês (vigência ativa)
        const activeRecurringItems = this.db.prepare(`
          SELECT ri.* FROM recurring_items ri 
          WHERE ri.account_id=? AND ri.type='income' AND ri.is_active=1
        `).all(acc.id);

        let projectedActiveIncome = 0;
        for (const item of activeRecurringItems) {
          // Check if there is already a transaction for this item in this month
          const hasTx = this.db.prepare(`
            SELECT 1 FROM transactions 
            WHERE recurring_item_id=? AND strftime('%m',date)=? AND strftime('%Y',date)=?
          `).get(item.id, m, y);

          if (!hasTx) {
            // Check dynamic active window
            let createdYear, createdMonth;
            if (item.created_at) {
              const parts = item.created_at.split('-');
              createdYear = parseInt(parts[0], 10);
              createdMonth = parseInt(parts[1], 10);
            } else {
              createdYear = now.getFullYear();
              createdMonth = now.getMonth() + 1;
            }
            const monthsDiff = (year - createdYear) * 12 + (month - createdMonth);

            if (monthsDiff >= 0) {
              if (!item.repeat_months || item.repeat_months <= 0 || monthsDiff < item.repeat_months) {
                projectedActiveIncome += item.amount;
              }
            }
          }
        }

        acc.balance = avulsoIncome + generatedActiveIncome + projectedActiveIncome;
      }
    }

    // Priority items
    if (profileType === 1) {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(m, y);
    } else if (perm.can_view_all === 1) {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(familyId, familyId, m, y);
    } else {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE (t.user_id=? OR a.user_id=?) AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(userId, userId, m, y);
    }

    // Alert items (due within alertDays days, unpaid)
    if (profileType === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else if (perm.can_view_all === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(familyId, familyId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority,
               a.name as account_name,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(userId, userId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    }

    // Recurring progress (despesas do mês)
    if (profileType === 1) {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE type='expense' AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
    } else if (perm.can_view_all === 1) {
      totalRecurring = this.db.prepare(`
        SELECT COUNT(*) as c 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.type='expense' AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(familyId, familyId, m, y).c;
      paidRecurring = this.db.prepare(`
        SELECT COUNT(*) as c 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(familyId, familyId, m, y).c;
    } else {
      totalRecurring = this.db.prepare(`
        SELECT COUNT(*) as c 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.type='expense' AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(userId, userId, m, y).c;
      paidRecurring = this.db.prepare(`
        SELECT COUNT(*) as c 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).get(userId, userId, m, y).c;
    }

    // Overdue items from previous months (prior to current month/year)
    const monthStartThreshold = `${y}-${m}-01`;
    let overduePreviousItems = [];
    if (profileType === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(monthStartThreshold);
    } else if (perm.can_view_all === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(familyId, familyId, monthStartThreshold);
    } else {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               COALESCE(a.user_id, ri.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_rec.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_rec.avatar_color, u_tx.avatar_color) as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_rec ON ri.user_id = u_rec.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE (t.user_id=? OR a.user_id=?) AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(userId, userId, monthStartThreshold);
    }

    return { income, expense, pending, balance: income - expense, accounts, cardSpending, cardMonthlyInvoices, priorityItems, alertItems, totalRecurring, paidRecurring, alertDays, overduePreviousItems };
  }

  getGeneralDashboardSummary(userId) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    const accounts = this.getAccounts(userId);

    const debitAccounts = accounts.filter(a => a.type !== 'credit');
    const creditAccounts = accounts.filter(a => a.type === 'credit');

    const totalDebit = debitAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalCredit = creditAccounts.reduce((sum, a) => sum + (a.credit_used !== undefined ? a.credit_used : (a.balance < 0 ? -a.balance : 0)), 0);
    const netWorth = totalDebit - totalCredit;

    let totalPending;
    if (profileType === 1) {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM transactions WHERE type='expense' AND is_paid=0").get().v;
    } else if (perm.can_view_all === 1) {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(t.amount), 0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=0").get(familyId).v;
    } else {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=0").get(userId).v;
    }

    let goals;
    if (profileType === 1) {
      goals = this.db.prepare("SELECT * FROM goals WHERE is_completed=0 ORDER BY created_at DESC").all();
    } else if (perm.can_view_all === 1) {
      goals = this.db.prepare("SELECT g.* FROM goals g JOIN users u ON g.user_id = u.id WHERE u.family_id=? AND g.is_completed=0 ORDER BY g.created_at DESC").all(familyId);
    } else {
      goals = this.db.prepare("SELECT * FROM goals WHERE user_id=? AND is_completed=0 ORDER BY created_at DESC").all(userId);
    }

    return {
      netWorth,
      creditCardBalance: totalCredit,
      totalPending,
      accounts,
      goals,
    };
  }

  getMonthlyChart(userId, months = 6) {
    const result = [];
    const now = new Date();
    const perm = this.getUserPermissions(userId);
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = String(d.getMonth() + 1).padStart(2,'0');
      const y = String(d.getFullYear());
      let income, expense;
      if (perm.can_view_all === 1) {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      } else {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      }
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      result.push({ month: label, income, expense });
    }
    return result;
  }

  getCategoryChart(userId, month, year) {
    const perm = this.getUserPermissions(userId);
    const m = String(month).padStart(2, '0');
    const y = String(year);
    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.type='expense' AND t.is_paid=1
        AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(m, y);
    } else {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.user_id=? AND t.type='expense' AND t.is_paid=1
        AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(userId, m, y);
    }
  }

  // ── BUDGETS ──────────────────────────────────────────────────
  getBudgets(userId, month, year) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    const m = String(month).padStart(2, '0');
    const y = String(year);
    
    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) FROM transactions t WHERE t.category_id=b.category_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(m, y, userId, month, year);
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.category_id=b.category_id AND u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(familyId, m, y, userId, month, year);
    } else {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) FROM transactions t WHERE t.category_id=b.category_id AND t.user_id=b.user_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(m, y, userId, month, year);
    }
  }

  setBudget(data) {
    this.db.prepare(`INSERT INTO budgets (user_id, category_id, month, year, amount) VALUES (@user_id, @category_id, @month, @year, @amount) ON CONFLICT(user_id, category_id, month, year) DO UPDATE SET amount=@amount`).run(data);
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const cat = this.db.prepare("SELECT name FROM categories WHERE id = ?").get(data.category_id);
    const familyId = user ? user.family_id : null;
    this.logEvent('budget:set', `Usuário "${user ? user.name : 'Desconhecido'}" definiu orçamento da categoria "${cat ? cat.name : 'Outras'}" para R$ ${data.amount} (${data.month}/${data.year}).`, familyId);
    return { success: true };
  }

  // ── GOALS ────────────────────────────────────────────────────
  getGoals(userId) {
    return this.db.prepare('SELECT * FROM goals WHERE user_id=? ORDER BY is_completed ASC, created_at DESC').all(userId);
  }

  createGoal(data) {
    const payload = {
      current_amount: 0,
      deadline: null,
      color: '#10b981',
      icon: '🎯',
      yield_rate: 0,
      goal_type: 'general',
      ...data
    };
    const r = this.db.prepare(`INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color, icon, yield_rate, goal_type) VALUES (@user_id, @name, @target_amount, @current_amount, @deadline, @color, @icon, @yield_rate, @goal_type)`).run(payload);
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const familyId = user ? user.family_id : null;
    this.logEvent('goal:create', `Usuário "${user ? user.name : 'Desconhecido'}" criou uma meta: "${data.name}" (Meta: R$ ${data.target_amount}).`, familyId);
    return { success: true, id: r.lastInsertRowid };
  }

  updateGoal(data) {
    const payload = {
      color: '#10b981',
      icon: '🎯',
      yield_rate: 0,
      goal_type: 'general',
      ...data
    };
    this.db.prepare(`UPDATE goals SET name=@name, target_amount=@target_amount, deadline=@deadline, color=@color, icon=@icon, yield_rate=@yield_rate, goal_type=@goal_type WHERE id=@id`).run(payload);
    return { success: true };
  }

  deleteGoal(id) {
    const goal = this.db.prepare('SELECT g.name, u.family_id, u.name as user_name FROM goals g JOIN users u ON g.user_id = u.id WHERE g.id = ?').get(id);
    this.db.prepare('DELETE FROM goal_deposits WHERE goal_id=?').run(id);
    this.db.prepare('DELETE FROM goals WHERE id=?').run(id);
    if (goal) {
      this.logEvent('goal:delete', `Usuário "${goal.user_name}" excluiu a meta "${goal.name}".`, goal.family_id);
    }
    return { success: true };
  }

  addGoalDeposit({ goal_id, amount, note, date }) {
    this.db.transaction(() => {
      this.db.prepare('INSERT INTO goal_deposits (goal_id, amount, note, date) VALUES (?,?,?,?)').run(goal_id, amount, note, date);
      this.db.prepare('UPDATE goals SET current_amount=current_amount+?, is_completed=CASE WHEN current_amount+?>=target_amount THEN 1 ELSE 0 END WHERE id=?').run(amount, amount, goal_id);
    })();
    return { success: true };
  }

  // ── REPORTS ──────────────────────────────────────────────────
  getCashflow(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;
    const perm = this.getUserPermissions(userId);

    const m = String(month).padStart(2,'0');
    const y = String(year);

    if (profileType === 1) {
      return this.db.prepare(`
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
               a.name as account_name,
               COALESCE(a.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.date DESC
      `).all(m, y);
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
               a.name as account_name,
               COALESCE(a.user_id, t.user_id) as user_id,
               COALESCE(u_acc.name, u_tx.name) as user_name,
               COALESCE(u_acc.avatar_color, u_tx.avatar_color) as user_avatar_color
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u_acc ON a.user_id = u_acc.id
        LEFT JOIN users u_tx ON t.user_id = u_tx.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE (u_tx.family_id=? OR u_acc.family_id=?) AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.date DESC
      `).all(familyId, familyId, m, y);
    }

    return this.db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name,
             COALESCE(a.user_id, t.user_id) as user_id,
             COALESCE(u_acc.name, u_tx.name) as user_name,
             COALESCE(u_acc.avatar_color, u_tx.avatar_color) as user_avatar_color
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN users u_acc ON a.user_id = u_acc.id
      LEFT JOIN users u_tx ON t.user_id = u_tx.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE (t.user_id=? OR a.user_id=?) AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      ORDER BY t.date DESC
    `).all(userId, userId, m, y);
  }

  getPatrimony(userId) {
    const result = [];
    const now = new Date();
    
    // Calculate current wealth assets (checking/debit accounts only)
    const accounts = this.getAccounts(userId);
    const debitAccounts = accounts.filter(a => a.type !== 'credit');
    const currentNetWorth = debitAccounts.reduce((sum, a) => sum + a.balance, 0);

    const perm = this.getUserPermissions(userId);

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const endOfMonthStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
      
      // Transactions only on debit/checking accounts
      let query = `
        SELECT COALESCE(SUM(CASE WHEN t.type = 'income' THEN (t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) WHEN t.type = 'expense' THEN -(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) ELSE 0 END), 0) as v
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.is_paid = 1 AND t.type != 'transfer' AND a.type != 'credit' AND t.date > ?
      `;
      const params = [endOfMonthStr];
      if (perm.can_view_all !== 1) {
        query += ` AND t.user_id = ?`;
        params.push(userId);
      }
      
      const netChangeAfter = this.db.prepare(query).get(...params).v;
      const netWorthAtMonthEnd = currentNetWorth - netChangeAfter;

      result.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        net: netWorthAtMonthEnd
      });
    }
    return result;
  }

  getInterestAuditReport(userId, month, year) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;
    const perm = this.getUserPermissions(userId);

    const m = month ? String(month).padStart(2, '0') : null;
    const y = year ? String(year) : null;

    let baseFilter = "WHERE t.is_paid = 1 AND (t.penalty_amount > 0 OR t.discount_amount > 0 OR (t.payment_date IS NOT NULL AND t.payment_date > t.date))";
    const params = [];

    if (profileType !== 1) {
      if (perm.can_view_all === 1) {
        baseFilter += " AND (u.family_id = ? OR u_acc.family_id = ?)";
        params.push(familyId, familyId);
      } else {
        baseFilter += " AND (t.user_id = ? OR a.user_id = ?)";
        params.push(userId, userId);
      }
    }

    let periodFilter = "";
    const periodParams = [];
    if (m && y) {
      periodFilter = " AND strftime('%m', COALESCE(t.payment_date, t.date)) = ? AND strftime('%Y', COALESCE(t.payment_date, t.date)) = ?";
      periodParams.push(m, y);
    } else if (y) {
      periodFilter = " AND strftime('%Y', COALESCE(t.payment_date, t.date)) = ?";
      periodParams.push(y);
    }

    const joins = `
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users u_acc ON a.user_id = u_acc.id
    `;

    // 1. Summary for Period
    const summary = this.db.prepare(`
      SELECT 
        COALESCE(SUM(t.penalty_amount), 0) as total_penalty,
        COALESCE(SUM(t.discount_amount), 0) as total_discount,
        COUNT(CASE WHEN t.penalty_amount > 0 THEN 1 END) as count_late_paid,
        COUNT(CASE WHEN t.discount_amount > 0 THEN 1 END) as count_discounted,
        COUNT(*) as total_records
      ${joins}
      ${baseFilter} ${periodFilter}
    `).get(...params, ...periodParams);

    // 2. Year summary
    let totalPenaltyYear = 0;
    if (y) {
      const yearFilter = " AND strftime('%Y', COALESCE(t.payment_date, t.date)) = ?";
      totalPenaltyYear = this.db.prepare(`
        SELECT COALESCE(SUM(t.penalty_amount), 0) as v
        ${joins}
        ${baseFilter} ${yearFilter}
      `).get(...params, y).v;
    }

    // 3. Transactions detail
    const transactions = this.db.prepare(`
      SELECT t.*, 
             c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name, a.bank as account_bank
      ${joins}
      ${baseFilter} ${periodFilter}
      ORDER BY t.penalty_amount DESC, COALESCE(t.payment_date, t.date) DESC
    `).all(...params, ...periodParams);

    // Calculate days late and daily rate for each transaction
    let totalDaysLate = 0;
    let lateTxsCount = 0;
    let sumDailyRates = 0;

    const enrichedTransactions = transactions.map(t => {
      const due = t.date ? t.date.split(' ')[0] : null;
      const pay = t.payment_date ? t.payment_date.split(' ')[0] : due;
      let daysLate = 0;
      if (due && pay && pay > due) {
        const dDue = new Date(due + 'T00:00:00');
        const dPay = new Date(pay + 'T00:00:00');
        daysLate = Math.round((dPay - dDue) / (1000 * 60 * 60 * 24));
      }
      const penalty = t.penalty_amount || 0;
      const base = t.amount || 0;
      let totalPct = base > 0 && penalty > 0 ? (penalty / base) * 100 : 0;
      let dailyPct = daysLate > 0 && totalPct > 0 ? (totalPct / daysLate) : totalPct;

      if (penalty > 0 && daysLate > 0) {
        totalDaysLate += daysLate;
        sumDailyRates += dailyPct;
        lateTxsCount++;
      }

      return {
        ...t,
        days_late: daysLate,
        total_interest_pct: totalPct,
        daily_interest_pct: dailyPct,
        net_paid: base + penalty - (t.discount_amount || 0)
      };
    });

    summary.avg_days_late = lateTxsCount > 0 ? Math.round(totalDaysLate / lateTxsCount) : 0;
    summary.avg_daily_rate = lateTxsCount > 0 ? parseFloat((sumDailyRates / lateTxsCount).toFixed(3)) : 0;
    summary.total_penalty_year = totalPenaltyYear;

    // 4. By Category
    const byCategory = this.db.prepare(`
      SELECT 
        COALESCE(c.id, 0) as category_id,
        COALESCE(c.name, 'Sem Categoria') as category_name,
        COALESCE(c.color, '#64748b') as category_color,
        COALESCE(c.icon, '📦') as category_icon,
        COALESCE(SUM(t.penalty_amount), 0) as total_penalty,
        COALESCE(SUM(t.discount_amount), 0) as total_discount,
        COUNT(CASE WHEN t.penalty_amount > 0 THEN 1 END) as count
      ${joins}
      ${baseFilter} ${periodFilter}
      GROUP BY c.id
      HAVING total_penalty > 0 OR total_discount > 0
      ORDER BY total_penalty DESC
    `).all(...params, ...periodParams);

    // 5. By Supplier / Description
    const bySupplier = this.db.prepare(`
      SELECT 
        t.description,
        COALESCE(SUM(t.penalty_amount), 0) as total_penalty,
        COALESCE(SUM(t.discount_amount), 0) as total_discount,
        COUNT(CASE WHEN t.penalty_amount > 0 THEN 1 END) as count
      ${joins}
      ${baseFilter} ${periodFilter}
      GROUP BY t.description
      HAVING total_penalty > 0 OR total_discount > 0
      ORDER BY total_penalty DESC
      LIMIT 15
    `).all(...params, ...periodParams);

    // 6. By Account
    const byAccount = this.db.prepare(`
      SELECT 
        a.id as account_id,
        a.name as account_name,
        a.bank as account_bank,
        COALESCE(SUM(t.penalty_amount), 0) as total_penalty,
        COUNT(CASE WHEN t.penalty_amount > 0 THEN 1 END) as count
      ${joins}
      ${baseFilter} ${periodFilter}
      GROUP BY a.id
      HAVING total_penalty > 0
      ORDER BY total_penalty DESC
    `).all(...params, ...periodParams);

    const formattedSummary = {
      ...summary,
      totalPenalty: Number(summary?.total_penalty || 0),
      totalDiscount: Number(summary?.total_discount || 0),
      penaltyCount: Number(summary?.count_late_paid || 0),
      discountCount: Number(summary?.count_discounted || 0),
      avgDaysLate: Number(summary?.avg_days_late || 0),
      avgDailyRate: Number(summary?.avg_daily_rate || 0),
      totalRecords: Number(summary?.total_records || 0)
    };

    return {
      summary: formattedSummary,
      byCategory,
      bySupplier: bySupplier.map(s => ({ ...s, supplier: s.description || 'Diversos' })),
      byAccount,
      transactions: enrichedTransactions
    };
  }

  getPredictiveCashflowForecast({ userId, days = 30 }) {
    if (!userId) return { timeline: [], initialBalance: 0, hasNegativeRisk: false };
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { timeline: [], initialBalance: 0, hasNegativeRisk: false };

    // 1. Saldo inicial líquido disponível (contas correntes, carteiras e poupança)
    const accounts = this.db.prepare(`
      SELECT a.* FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE (u.family_id = ? OR a.user_id = ?) AND a.is_active = 1 AND a.type IN ('checking', 'wallet', 'savings')
    `).all(user.family_id, userId);

    const initialBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    const overdraftAvailable = accounts.reduce((sum, a) => sum + (a.overdraft_limit || 0), 0);

    const totalDays = Math.min(90, Math.max(7, parseInt(days, 10) || 30));
    const timeline = [];
    let currentBalance = initialBalance;
    let hasNegativeRisk = false;
    let firstNegativeDate = null;
    let minBalance = initialBalance;

    const startDate = new Date();

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfMonth = d.getDate();
      const monthNum = d.getMonth() + 1;
      const yearNum = d.getFullYear();

      // Buscar transações pontuais pendentes/agendadas para esta data
      const dailyTxs = this.db.prepare(`
        SELECT t.type, t.amount, t.description
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE (u.family_id = ? OR t.user_id = ?) AND t.date = ? AND t.is_paid = 0 AND t.is_avulso != 2
      `).all(user.family_id, userId, dateStr);

      let dailyIncome = 0;
      let dailyExpense = 0;

      for (const tx of dailyTxs) {
        if (tx.type === 'income') dailyIncome += tx.amount;
        else dailyExpense += tx.amount;
      }

      // Buscar despesas/receitas recorrentes com vencimento neste dia do mês
      const recurringItems = this.db.prepare(`
        SELECT ri.type, ri.amount, ri.name, ri.account_id
        FROM recurring_items ri
        JOIN users u ON ri.user_id = u.id
        WHERE (u.family_id = ? OR ri.user_id = ?) AND ri.due_day = ?
      `).all(user.family_id, userId, dayOfMonth);

      for (const rec of recurringItems) {
        if (rec.type === 'income') dailyIncome += rec.amount;
        else dailyExpense += rec.amount;
      }

      // Buscar faturas de cartão com vencimento neste dia
      const cardInvoicesDue = this.db.prepare(`
        SELECT inv.amount, a.name as card_name
        FROM invoices inv
        JOIN accounts a ON inv.card_account_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE (u.family_id = ? OR a.user_id = ?) AND inv.due_date = ? AND inv.is_paid = 0
      `).all(user.family_id, userId, dateStr);

      for (const inv of cardInvoicesDue) {
        dailyExpense += inv.amount;
      }

      currentBalance = currentBalance + dailyIncome - dailyExpense;
      if (currentBalance < minBalance) minBalance = currentBalance;

      if (currentBalance < 0 && !hasNegativeRisk) {
        hasNegativeRisk = true;
        firstNegativeDate = dateStr;
      }

      timeline.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dailyIncome: Math.round(dailyIncome * 100) / 100,
        dailyExpense: Math.round(dailyExpense * 100) / 100,
        projectedBalance: Math.round(currentBalance * 100) / 100,
        isNegative: currentBalance < 0,
        usesOverdraft: currentBalance < 0 && (currentBalance + overdraftAvailable) >= 0
      });
    }

    return {
      timeline,
      initialBalance: Math.round(initialBalance * 100) / 100,
      overdraftAvailable,
      finalProjectedBalance: Math.round(currentBalance * 100) / 100,
      minProjectedBalance: Math.round(minBalance * 100) / 100,
      hasNegativeRisk,
      firstNegativeDate,
      daysAnalyzed: totalDays
    };
  }

  // ── PILAR 2: REGRA 50-30-20 ANALYSIS ───────────────────────────
  getBudget503020Analysis(userId, month, year) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return null;
    const familyId = user.family_id;
    const perm = this.getUserPermissions(userId);

    const m = String(month).padStart(2, '0');
    const y = String(year);

    // 1. Obter Total de Renda Líquida no Mês
    let incomeQuery;
    let incomeParams;
    if (user.profile_type === 1) {
      incomeQuery = `SELECT SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)) as total FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date,date))=? AND strftime('%Y',COALESCE(payment_date,date))=?`;
      incomeParams = [m, y];
    } else if (perm.can_view_all === 1) {
      incomeQuery = `SELECT SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) as total FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='income' AND t.is_paid=1 AND strftime('%m',COALESCE(t.payment_date,t.date))=? AND strftime('%Y',COALESCE(t.payment_date,t.date))=?`;
      incomeParams = [familyId, m, y];
    } else {
      incomeQuery = `SELECT SUM(amount + COALESCE(penalty_amount,0) - COALESCE(discount_amount,0)) as total FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date,date))=? AND strftime('%Y',COALESCE(payment_date,date))=?`;
      incomeParams = [userId, m, y];
    }
    const incomeRow = this.db.prepare(incomeQuery).get(...incomeParams);
    const totalIncome = Math.max(0, incomeRow?.total || 0);

    // 2. Obter Despesas por budget_group
    let expenseQuery;
    let expenseParams;
    if (user.profile_type === 1) {
      expenseQuery = `
        SELECT COALESCE(c.budget_group, 'essential') as budget_group,
               SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) as total
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.type='expense' AND t.is_paid=1 
        AND strftime('%m',COALESCE(t.payment_date,t.date))=? AND strftime('%Y',COALESCE(t.payment_date,t.date))=?
        GROUP BY COALESCE(c.budget_group, 'essential')
      `;
      expenseParams = [m, y];
    } else if (perm.can_view_all === 1) {
      expenseQuery = `
        SELECT COALESCE(c.budget_group, 'essential') as budget_group,
               SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) as total
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE u.family_id=? AND t.type='expense' AND t.is_paid=1 
        AND strftime('%m',COALESCE(t.payment_date,t.date))=? AND strftime('%Y',COALESCE(t.payment_date,t.date))=?
        GROUP BY COALESCE(c.budget_group, 'essential')
      `;
      expenseParams = [familyId, m, y];
    } else {
      expenseQuery = `
        SELECT COALESCE(c.budget_group, 'essential') as budget_group,
               SUM(t.amount + COALESCE(t.penalty_amount,0) - COALESCE(t.discount_amount,0)) as total
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id=? AND t.type='expense' AND t.is_paid=1 
        AND strftime('%m',COALESCE(t.payment_date,t.date))=? AND strftime('%Y',COALESCE(t.payment_date,t.date))=?
        GROUP BY COALESCE(c.budget_group, 'essential')
      `;
      expenseParams = [userId, m, y];
    }

    const expenseRows = this.db.prepare(expenseQuery).all(...expenseParams);
    
    // 3. Obter Aportes em Metas do Mês (Poupança / Investimentos)
    let goalDepositsQuery;
    let goalDepositsParams;
    if (user.profile_type === 1) {
      goalDepositsQuery = `SELECT SUM(amount) as total FROM goal_deposits WHERE strftime('%m',date)=? AND strftime('%Y',date)=?`;
      goalDepositsParams = [m, y];
    } else if (perm.can_view_all === 1) {
      goalDepositsQuery = `SELECT SUM(gd.amount) as total FROM goal_deposits gd JOIN goals g ON gd.goal_id = g.id JOIN users u ON g.user_id = u.id WHERE u.family_id=? AND strftime('%m',gd.date)=? AND strftime('%Y',gd.date)=?`;
      goalDepositsParams = [familyId, m, y];
    } else {
      goalDepositsQuery = `SELECT SUM(gd.amount) as total FROM goal_deposits gd JOIN goals g ON gd.goal_id = g.id WHERE g.user_id=? AND strftime('%m',gd.date)=? AND strftime('%Y',gd.date)=?`;
      goalDepositsParams = [userId, m, y];
    }
    const goalDepositsRow = this.db.prepare(goalDepositsQuery).get(...goalDepositsParams);
    const goalDepositsTotal = goalDepositsRow?.total || 0;

    let essentialSpent = 0;
    let lifestyleSpent = 0;
    let financialSpent = goalDepositsTotal;

    for (const row of expenseRows) {
      if (row.budget_group === 'essential') essentialSpent += row.total;
      else if (row.budget_group === 'lifestyle') lifestyleSpent += row.total;
      else if (row.budget_group === 'financial') financialSpent += row.total;
    }

    const totalExpense = essentialSpent + lifestyleSpent + financialSpent;
    const baseIncome = totalIncome > 0 ? totalIncome : totalExpense;

    // Metas 50/30/20 teóricas
    const essentialTarget = Math.round(baseIncome * 0.50 * 100) / 100;
    const lifestyleTarget = Math.round(baseIncome * 0.30 * 100) / 100;
    const financialTarget = Math.round(baseIncome * 0.20 * 100) / 100;

    const essentialPct = baseIncome > 0 ? (essentialSpent / baseIncome) * 100 : 0;
    const lifestylePct = baseIncome > 0 ? (lifestyleSpent / baseIncome) * 100 : 0;
    const financialPct = baseIncome > 0 ? (financialSpent / baseIncome) * 100 : 0;

    // Diagnósticos
    const groups = [
      {
        id: 'essential',
        name: 'Necessidades / Essenciais',
        targetPct: 50,
        targetAmount: essentialTarget,
        spent: Math.round(essentialSpent * 100) / 100,
        currentPct: Math.round(essentialPct * 10) / 10,
        status: essentialPct <= 50 ? 'safe' : essentialPct <= 60 ? 'warning' : 'danger',
        desc: 'Moradia, Alimentação básica, Saúde, Transporte e Educação'
      },
      {
        id: 'lifestyle',
        name: 'Desejos / Estilo de Vida',
        targetPct: 30,
        targetAmount: lifestyleTarget,
        spent: Math.round(lifestyleSpent * 100) / 100,
        currentPct: Math.round(lifestylePct * 10) / 10,
        status: lifestylePct <= 30 ? 'safe' : lifestylePct <= 40 ? 'warning' : 'danger',
        desc: 'Lazer, Restaurantes, Assinaturas, Vestuário e Compras'
      },
      {
        id: 'financial',
        name: 'Poupança, Metas & Futuro',
        targetPct: 20,
        targetAmount: financialTarget,
        spent: Math.round(financialSpent * 100) / 100,
        currentPct: Math.round(financialPct * 10) / 10,
        status: financialPct >= 20 ? 'safe' : financialPct >= 10 ? 'warning' : 'danger',
        desc: 'Aportes em Metas, Reserva de Emergência e Investimentos'
      }
    ];

    let overallStatus = 'safe';
    let diagnosis = 'Excelente equilíbrio orçamentário! Sua família está seguindo o padrão 50-30-20.';

    if (essentialPct > 55) {
      overallStatus = 'warning';
      diagnosis = `Os gastos essenciais (${essentialPct.toFixed(0)}%) estão acima dos 50% recomendados. Considere renegociar contratos fixos (energia, internet, aluguel).`;
    }
    if (lifestylePct > 35) {
      overallStatus = 'danger';
      diagnosis = `Os gastos com estilo de vida (${lifestylePct.toFixed(0)}%) ultrapassaram o teto de 30%. Vale a pena revisar lazer e assinaturas supérfluas.`;
    }
    if (financialPct < 10) {
      if (overallStatus !== 'danger') overallStatus = 'warning';
      diagnosis += ' A poupança para metas está abaixo de 10% da renda. Tente poupar um pouco mais no início do mês.';
    }

    return {
      month,
      year,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      groups,
      overallStatus,
      diagnosis
    };
  }

  // ── PILAR 2: SIMULAÇÃO INTELIGENTE DE METAS (CDI/CDB & PMT) ────
  getGoalSimulations(userId) {
    const goals = this.getGoals(userId);
    const today = new Date();

    return goals.map(g => {
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      const remaining = Math.max(0, target - current);
      const yieldRate = Number(g.yield_rate || 0); // % a.a.

      let monthsRemaining = 0;
      let pmtSuggested = 0;
      let projectedYield = 0;
      let futureValue = current;

      if (g.deadline) {
        const d = new Date(g.deadline);
        monthsRemaining = Math.max(1, (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth()));
      }

      if (remaining > 0 && monthsRemaining > 0) {
        if (yieldRate > 0) {
          // Taxa mensal proporcional: i = (yieldRate / 100) / 12
          const monthlyRate = (yieldRate / 100) / 12;
          const n = monthsRemaining;

          // FV = PV * (1+i)^n + PMT * [((1+i)^n - 1) / i]
          // PMT = (Target - Current * (1+i)^n) / [((1+i)^n - 1) / i]
          const compFactor = Math.pow(1 + monthlyRate, n);
          const annuityFactor = (compFactor - 1) / monthlyRate;
          const targetNeededFromDeposits = target - (current * compFactor);

          if (targetNeededFromDeposits <= 0) {
            pmtSuggested = 0;
            projectedYield = (current * compFactor) - current;
          } else {
            pmtSuggested = Math.max(0, targetNeededFromDeposits / annuityFactor);
            const totalDeposited = pmtSuggested * n;
            projectedYield = target - (current + totalDeposited);
          }
        } else {
          pmtSuggested = remaining / monthsRemaining;
          projectedYield = 0;
        }
      }

      const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

      return {
        ...g,
        remainingAmount: Math.round(remaining * 100) / 100,
        monthsRemaining,
        suggestedMonthlyDeposit: Math.round(pmtSuggested * 100) / 100,
        projectedYield: Math.max(0, Math.round(projectedYield * 100) / 100),
        progressPct: Math.round(progressPct * 10) / 10
      };
    });
  }

  // ── PILAR 2: GESTÃO PATRIMONIAL & ALOCAÇÃO DE ATIVOS ───────────
  getPatrimonyAllocation(userId) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return null;
    const familyId = user.family_id;
    const perm = this.getUserPermissions(userId);

    let accounts;
    if (user.profile_type === 1) {
      accounts = this.db.prepare(`SELECT * FROM accounts WHERE is_active=1`).all();
    } else if (perm.can_view_all === 1) {
      accounts = this.db.prepare(`SELECT a.* FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.family_id=? AND a.is_active=1`).all(familyId);
    } else {
      accounts = this.db.prepare(`SELECT * FROM accounts WHERE user_id=? AND is_active=1`).all(userId);
    }

    const classNames = {
      checking: { name: 'Conta Corrente / Caixa', icon: '🏦', color: '#3b82f6' },
      cash: { name: 'Dinheiro Físico', icon: '💵', color: '#10b981' },
      cdb_di: { name: 'Renda Fixa / CDI / Poupança', icon: '🛡️', color: '#8b5cf6' },
      stocks_fii: { name: 'Renda Variável / Ações / FIIs', icon: '📈', color: '#f59e0b' },
      crypto: { name: 'Criptoativos', icon: '🪙', color: '#06b6d4' },
      real_estate: { name: 'Bens / Imóveis / Patrimônio Físico', icon: '🏠', color: '#ec4899' }
    };

    const allocationMap = {};
    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const acc of accounts) {
      if (acc.type === 'credit') {
        // Fatura em aberto ou saldo negativo de cartão
        const invoiceSum = this.db.prepare(`SELECT SUM(amount) as total FROM invoices WHERE card_account_id=? AND is_paid=0`).get(acc.id);
        totalLiabilities += (invoiceSum?.total || 0);
      } else {
        const bal = Number(acc.balance || 0);
        if (bal >= 0) {
          totalAssets += bal;
          const aClass = acc.asset_class || 'checking';
          allocationMap[aClass] = (allocationMap[aClass] || 0) + bal;
        } else {
          totalLiabilities += Math.abs(bal);
        }
      }
    }

    const netWorth = totalAssets - totalLiabilities;

    const distribution = Object.keys(classNames).map(key => {
      const amount = allocationMap[key] || 0;
      const pct = totalAssets > 0 ? (amount / totalAssets) * 100 : 0;
      return {
        key,
        ...classNames[key],
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round(pct * 10) / 10
      };
    }).filter(d => d.amount > 0);

    let diversificationDiagnosis = 'Patrimônio distribuído com boa segurança.';
    const cdbPct = distribution.find(d => d.key === 'cdb_di')?.percentage || 0;
    const checkingPct = distribution.find(d => d.key === 'checking')?.percentage || 0;

    if (checkingPct > 50) {
      diversificationDiagnosis = 'Mais de 50% do patrimônio está parado em conta corrente. Considere aplicar em Renda Fixa ou CDI com liquidez diária.';
    } else if (cdbPct > 70) {
      diversificationDiagnosis = 'Excelente perfil conservador! Mais de 70% do patrimônio alocado em segurança e liquidez.';
    }

    return {
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      netWorth: Math.round(netWorth * 100) / 100,
      distribution,
      diversificationDiagnosis
    };
  }
};


