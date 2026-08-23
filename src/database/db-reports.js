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
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
    } else if (perm.can_view_all === 1) {
      income = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='income' AND t.is_paid=1 AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?`).get(familyId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?`).get(familyId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).v;
    } else {
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
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

        const totalUnpaid = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='expense' AND (is_paid=0 OR is_paid IS NULL)
        `).get(acc.id).v;

        cardMonthlyInvoices[acc.id] = cycleSpent;
        cardSpending[acc.id] = Math.max(cycleSpent, totalUnpaid);
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
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(m, y);
    } else if (perm.can_view_all === 1) {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id=? AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(familyId, m, y);
    } else {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id=? AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(userId, m, y);
    }

    // Alert items (due within alertDays days, unpaid)
    if (profileType === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else if (perm.can_view_all === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id=? AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(familyId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.user_id=? AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(userId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    }

    // Recurring progress
    if (profileType === 1) {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE is_avulso=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE is_avulso=0 AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
    } else if (perm.can_view_all === 1) {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.is_avulso=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.is_avulso=0 AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).c;
    } else {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE user_id=? AND is_avulso=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE user_id=? AND is_avulso=0 AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).c;
    }

    // Overdue items from previous months (prior to current month/year)
    const monthStartThreshold = `${y}-${m}-01`;
    let overduePreviousItems = [];
    if (profileType === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(monthStartThreshold);
    } else if (perm.can_view_all === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE u.family_id = ? AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(familyId, monthStartThreshold);
    } else {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.user_id = ? AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(userId, monthStartThreshold);
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
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      } else {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
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
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.type='expense' AND t.is_paid=1
        AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(m, y);
    } else {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount),0) as total
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
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id=b.category_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(m, y, userId, month, year);
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.category_id=b.category_id AND u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(familyId, m, y, userId, month, year);
    } else {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id=b.category_id AND t.user_id=b.user_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
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
    const r = this.db.prepare(`INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color, icon) VALUES (@user_id, @name, @target_amount, @current_amount, @deadline, @color, @icon)`).run(data);
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const familyId = user ? user.family_id : null;
    this.logEvent('goal:create', `Usuário "${user ? user.name : 'Desconhecido'}" criou uma meta: "${data.name}" (Meta: R$ ${data.target_amount}).`, familyId);
    return { success: true, id: r.lastInsertRowid };
  }

  updateGoal(data) {
    this.db.prepare(`UPDATE goals SET name=@name, target_amount=@target_amount, deadline=@deadline, color=@color, icon=@icon WHERE id=@id`).run(data);
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
    return this.db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name
      FROM transactions t LEFT JOIN categories c ON t.category_id=c.id LEFT JOIN accounts a ON t.account_id=a.id
      WHERE t.user_id=? AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      ORDER BY t.date DESC
    `).all(userId, String(month).padStart(2,'0'), String(year));
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
        SELECT COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END), 0) as v
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

  // ── FAMILIES & LOGS MANAGEMENT ─────────────────────────────────
};
