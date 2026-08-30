/**
 * src/database/db-card-invoices.js
 * Faturas de cartões de crédito, pagamentos, renegociações e reaberturas.
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
  getCardInvoices(userId, month, year) {
    const user = this.db.prepare('SELECT family_id FROM users WHERE id = ?').get(userId);
    if (!user) return [];
    const familyId = user.family_id;

    const creditAccounts = this.db.prepare(`
      SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE u.family_id = ? AND a.type = 'credit'
    `).all(familyId);

    const m = String(month).padStart(2, '0');
    const y = String(year);

    for (const acc of creditAccounts) {
      const cycle = getCardBillingCycle(acc.closing_day, acc.due_day, month, year);
      
      const txs = this.db.prepare(`
        SELECT id, amount FROM transactions
        WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
        AND date >= ? AND date <= ?
      `).all(acc.id, cycle.start, cycle.end);

      const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
      const dueDateStr = `${y}-${m}-${String(acc.due_day || 10).padStart(2, '0')}`;

      let existingInvoice = this.db.prepare(`
        SELECT * FROM invoices WHERE card_account_id = ? AND month = ? AND year = ?
      `).get(acc.id, month, year);

      if (!existingInvoice) {
        if (totalAmount > 0) {
          const res = this.db.prepare(`
            INSERT INTO invoices (card_account_id, month, year, due_date, amount, is_paid)
            VALUES (?, ?, ?, ?, ?, 0)
          `).run(acc.id, month, year, dueDateStr, totalAmount);
          const invoiceId = res.lastInsertRowid;
          
          if (txs.length > 0) {
            const txIds = txs.map(t => t.id);
            const placeholders = txIds.map(() => '?').join(',');
            this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
          }
        }
      } else {
        if (existingInvoice.is_paid === 0) {
          this.db.prepare(`
            UPDATE invoices SET amount = ?, due_date = ? WHERE id = ?
          `).run(totalAmount, dueDateStr, existingInvoice.id);

          if (txs.length > 0) {
            const txIds = txs.map(t => t.id);
            const placeholders = txIds.map(() => '?').join(',');
            this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(existingInvoice.id, ...txIds);
          }
        }
      }
    }

    return this.db.prepare(`
      SELECT i.*, a.name as card_name, a.bank, a.credit_limit, a.closing_day, a.due_day,
             u.name as user_name, u.avatar_color as user_avatar_color,
             pa.name as payment_account_name
      FROM invoices i
      JOIN accounts a ON i.card_account_id = a.id
      JOIN users u ON a.user_id = u.id
      LEFT JOIN accounts pa ON i.payment_account_id = pa.id
      WHERE u.family_id = ? AND i.month = ? AND i.year = ?
      ORDER BY i.due_date ASC
    `).all(familyId, month, year);
  }

  payCardInvoice({ invoiceId, paymentAccountId, paymentDate, penaltyAmount = 0, discountAmount = 0, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (inv.is_paid) return { success: false, error: 'Esta fatura já foi quitada' };

    const penalty = parseFloat(penaltyAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const netAmount = inv.amount + penalty - discount;
    const payDate = paymentDate || new Date().toISOString().split('T')[0];

    const cardAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(inv.card_account_id);
    const payAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(paymentAccountId);
    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);

    this.db.transaction(() => {
      this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(netAmount, paymentAccountId);

      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 1, payment_account_id = ?, payment_date = ?, penalty_amount = ?, discount_amount = ?
        WHERE id = ?
      `).run(paymentAccountId, payDate, penalty, discount, invoiceId);

      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 1, payment_date = ?
        WHERE invoice_id = ?
      `).run(payDate, invoiceId);
    })();

    this.logEvent('invoice:pay', `Fatura do cartão "${cardAcc ? cardAcc.name : 'Cartão'}" (Ref: ${inv.month}/${inv.year}) quitada no valor total de R$ ${netAmount.toFixed(2)} através da conta "${payAcc ? payAcc.name : 'Conta'}".`, user ? user.family_id : null);

    this.logAudit({
      userId,
      familyId: user ? user.family_id : null,
      userName: user ? user.name : null,
      action: 'INVOICE_PAY',
      entityType: 'invoice',
      entityId: invoiceId,
      description: `Quitou fatura do cartão "${cardAcc ? cardAcc.name : 'Cartão'}" (Ref: ${inv.month}/${inv.year}, Total Líquido: R$ ${netAmount.toFixed(2)})`,
      newValues: { card_account_id: inv.card_account_id, amount: inv.amount, penalty, discount, netAmount, payment_account_id: paymentAccountId, payment_date: payDate }
    });

    return { success: true };
  }

  renegotiateCardInvoice({
    invoiceId,
    downPayment = 0,
    downPaymentAccountId = null,
    downPaymentDate = null,
    installmentsCount,
    installmentAmount,
    firstInstallmentMonth,
    firstInstallmentYear,
    interestAmount = 0,
    notes = '',
    userId
  }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (inv.is_paid) return { success: false, error: 'Esta fatura já foi quitada ou renegociada' };

    const count = parseInt(installmentsCount, 10);
    const amountPerInstallment = parseFloat(installmentAmount);
    const downPay = parseFloat(downPayment) || 0;

    if (!count || count < 2) {
      return { success: false, error: 'O número de parcelas deve ser de no mínimo 2 vezes.' };
    }
    if (!amountPerInstallment || amountPerInstallment <= 0) {
      return { success: false, error: 'O valor da parcela deve ser maior que zero.' };
    }
    if (downPay > 0 && !downPaymentAccountId) {
      return { success: false, error: 'Selecione a conta de onde saiu o pagamento da entrada.' };
    }

    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    if (!cardAcc) return { success: false, error: 'Cartão de crédito não encontrado' };

    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    // Parse start month and year
    let startY, startM;
    if (firstInstallmentMonth && typeof firstInstallmentMonth === 'string' && firstInstallmentMonth.includes('-')) {
      const parts = firstInstallmentMonth.split('-');
      startY = parseInt(parts[0], 10);
      startM = parseInt(parts[1], 10);
    } else {
      startM = firstInstallmentMonth ? parseInt(firstInstallmentMonth, 10) : (inv.month === 12 ? 1 : inv.month + 1);
      startY = firstInstallmentYear ? parseInt(firstInstallmentYear, 10) : (inv.month === 12 ? inv.year + 1 : inv.year);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const payDate = downPaymentDate || todayStr;
    const createdAtStr = `${startY}-${String(startM).padStart(2, '0')}-01 00:00:00`;

    const result = this.db.transaction(() => {
      // 1. Process down payment if any
      let downPaymentTxId = null;
      if (downPay > 0 && downPaymentAccountId) {
        // Debit down payment from checking account
        this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(downPay, downPaymentAccountId);
        
        // Register down payment transaction in checking account
        const rDown = this.db.prepare(`
          INSERT INTO transactions (user_id, account_id, type, amount, description, date, payment_date, is_paid, is_avulso, notes)
          VALUES (?, ?, 'expense', ?, ?, ?, ?, 1, 1, ?)
        `).run(
          userId,
          downPaymentAccountId,
          downPay,
          `Entrada Acordo Fatura ${cardAcc.name} (${String(inv.month).padStart(2, '0')}/${inv.year})`,
          payDate,
          payDate,
          notes || 'Entrada de renegociação/parcelamento de fatura'
        );
        downPaymentTxId = rDown.lastInsertRowid;
      }

      // 2. Mark original invoice and its transactions as paid/settled by agreement
      const renegotiationSummary = JSON.stringify({
        originalAmount: inv.amount,
        downPayment: downPay,
        installmentsCount: count,
        installmentAmount: amountPerInstallment,
        totalFinanced: count * amountPerInstallment,
        interestAmount: (count * amountPerInstallment + downPay) - inv.amount,
        renegotiatedAt: new Date().toISOString()
      });

      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 1, is_renegotiated = 1, renegotiation_details = ?, payment_date = ?
        WHERE id = ?
      `).run(renegotiationSummary, payDate, invoiceId);

      // Mark existing transactions belonging to this invoice as paid/settled by agreement
      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 1, payment_date = ?
        WHERE invoice_id = ?
      `).run(payDate, invoiceId);

      // 3. Create recurring item for the new installments on the credit card account
      // This will generate monthly transactions and commit the card limit!
      const agreementName = `Acordo Fatura ${cardAcc.name} (Ref ${String(inv.month).padStart(2, '0')}/${inv.year})`;
      const rRec = this.db.prepare(`
        INSERT INTO recurring_items (user_id, name, type, amount, category_id, account_id, due_day, is_priority, icon, color, notes, repeat_months, start_installment, created_at)
        VALUES (?, ?, 'expense', ?, ?, ?, ?, 1, '🤝', '#f59e0b', ?, ?, 1, ?)
      `).run(
        userId,
        agreementName,
        amountPerInstallment,
        null,
        cardAcc.id,
        cardAcc.due_day || 10,
        notes || `Renegociação em ${count}x de R$ ${amountPerInstallment.toFixed(2)} da fatura ${String(inv.month).padStart(2, '0')}/${inv.year}`,
        count,
        createdAtStr
      );

      const recurringItemId = rRec.lastInsertRowid;

      return { recurringItemId, downPaymentTxId };
    })();

    // 4. Trigger recurrence generator AFTER the transaction is committed so the new
    //    recurring_item is visible to the SELECT inside generateMonthlyRecurrences.
    //    Also backfill any months between startM/startY and today that were missed.
    {
      const now = new Date();
      const nowMonth = now.getMonth() + 1;
      const nowYear = now.getFullYear();
      let bM = startM;
      let bY = startY;
      while (bY < nowYear || (bY === nowYear && bM <= nowMonth)) {
        this.generateMonthlyRecurrences(bM, bY);
        bM++;
        if (bM > 12) { bM = 1; bY++; }
      }
    }

    const logMsg = `Fatura do cartão "${cardAcc.name}" (Ref: ${String(inv.month).padStart(2, '0')}/${inv.year}, Valor: R$ ${inv.amount.toFixed(2)}) renegociada com sucesso em ${count}x de R$ ${amountPerInstallment.toFixed(2)}${downPay > 0 ? ` com entrada de R$ ${downPay.toFixed(2)}` : ''}.`;
    this.logEvent('invoice:renegotiate', logMsg, familyId);

    return { success: true, ...result };
  }

  reopenCardInvoice({ invoiceId, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (!inv.is_paid && !inv.is_renegotiated) {
      return { success: false, error: 'Esta fatura já está aberta' };
    }

    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    this.db.transaction(() => {
      // 1. Se foi pagamento normal (is_renegotiated = 0) com débito em conta corrente, estornar o valor na conta
      if (!inv.is_renegotiated && inv.payment_account_id) {
        const netAmount = inv.amount + (inv.penalty_amount || 0) - (inv.discount_amount || 0);
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(netAmount, inv.payment_account_id);
      }

      // 2. Se foi renegociada (is_renegotiated = 1), limpar itens de acordo e entrada se existirem
      if (inv.is_renegotiated) {
        // Estornar e remover lançamento de entrada, se houver
        const downDescPattern = `Entrada Acordo Fatura ${cardAcc ? cardAcc.name : ''} (${String(inv.month).padStart(2, '0')}/${inv.year})%`;
        const downTxs = this.db.prepare(`
          SELECT * FROM transactions
          WHERE description LIKE ? AND user_id = ?
        `).all(downDescPattern, userId);

        for (const dTx of downTxs) {
          if (dTx.is_paid && dTx.account_id) {
            this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(dTx.amount, dTx.account_id);
          }
          this.db.prepare('DELETE FROM transactions WHERE id = ?').run(dTx.id);
        }

        // Buscar recorrência gerada pelo acordo da fatura
        const agreementPattern = `Acordo Fatura ${cardAcc ? cardAcc.name : ''}%Ref%${String(inv.month).padStart(2, '0')}/${inv.year}%`;
        const recItems = this.db.prepare(`
          SELECT * FROM recurring_items
          WHERE (name LIKE ? OR notes LIKE ?) AND user_id = ?
        `).all(agreementPattern, `%${String(inv.month).padStart(2, '0')}/${inv.year}%`, userId);

        for (const ri of recItems) {
          // Deletar transações geradas por esta recorrência que ainda NÃO foram pagas
          this.db.prepare(`
            DELETE FROM transactions
            WHERE recurring_item_id = ? AND is_paid = 0
          `).run(ri.id);

          // Desvincular qualquer transação paga que ainda aponte para este item recorrente
          this.db.prepare(`
            UPDATE transactions
            SET recurring_item_id = NULL
            WHERE recurring_item_id = ?
          `).run(ri.id);

          // Deletar o item recorrente
          this.db.prepare('DELETE FROM recurring_items WHERE id = ?').run(ri.id);
        }
      }

      // 3. Resetar status da fatura para ABERTA (is_paid = 0, is_renegotiated = 0)
      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 0,
            is_renegotiated = 0,
            renegotiation_details = NULL,
            payment_account_id = NULL,
            payment_date = NULL,
            penalty_amount = 0,
            discount_amount = 0
        WHERE id = ?
      `).run(invoiceId);

      // 4. Resetar os lançamentos vinculados a esta fatura para em aberto (is_paid = 0)
      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 0,
            payment_date = NULL,
            penalty_amount = 0,
            discount_amount = 0
        WHERE invoice_id = ?
      `).run(invoiceId);
    })();

    // 5. FORA da transaction: gerar recorrências do mês (inclui parcelas de acordos de outros meses)
    // Isso evita conflito de nested transactions e garante que parcelas como "Acordo Fatura Ref 04/2026"
    // já existam antes do recálculo.
    this.generateMonthlyRecurrences(inv.month, inv.year);

    // 6. Recalcular o valor total da fatura com base nos lançamentos reais existentes no ciclo
    if (cardAcc) {
      const cycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, inv.month, inv.year);
      const txs = this.db.prepare(`
        SELECT id, amount FROM transactions
        WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
        AND date >= ? AND date <= ?
      `).all(cardAcc.id, cycle.start, cycle.end);

      const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
      this.db.prepare('UPDATE invoices SET amount = ? WHERE id = ?').run(totalAmount, invoiceId);

      if (txs.length > 0) {
        const txIds = txs.map(t => t.id);
        const placeholders = txIds.map(() => '?').join(',');
        this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
      }
    }

    const logMsg = `Fatura do cartão "${cardAcc ? cardAcc.name : 'Cartão'}" (Ref: ${String(inv.month).padStart(2, '0')}/${inv.year}) foi reaberta com sucesso e teve seus valores recalculados.`;
    this.logEvent('invoice:reopen', logMsg, familyId);

    return { success: true, message: 'Fatura reaberta com sucesso e valores recalculados!' };
  }

  recalculateCardInvoice({ invoiceId, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    if (!cardAcc) return { success: false, error: 'Cartão não encontrado' };

    const cycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, inv.month, inv.year);
    const txs = this.db.prepare(`
      SELECT id, amount FROM transactions
      WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
      AND date >= ? AND date <= ?
    `).all(cardAcc.id, cycle.start, cycle.end);

    const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    this.db.prepare('UPDATE invoices SET amount = ? WHERE id = ?').run(totalAmount, invoiceId);

    if (txs.length > 0) {
      const txIds = txs.map(t => t.id);
      const placeholders = txIds.map(() => '?').join(',');
      this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
    }

    return { success: true, amount: totalAmount };
  }

  anticipateCardInstallments({ cardAccountId, transactionIds, targetMonth, targetYear, discountAmount = 0, userId }) {
    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(cardAccountId);
    if (!cardAcc) return { success: false, error: 'Cartão de crédito não encontrado' };

    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return { success: false, error: 'Nenhuma parcela selecionada para antecipação.' };
    }

    const tM = parseInt(targetMonth, 10);
    const tY = parseInt(targetYear, 10);
    const targetCycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, tM, tY);
    const targetDate = targetCycle.end;

    const discount = parseFloat(discountAmount) || 0;
    const discountPerTx = discount > 0 ? (discount / transactionIds.length) : 0;

    const res = this.db.transaction(() => {
      let totalAnticipated = 0;
      for (const txId of transactionIds) {
        const tx = this.db.prepare('SELECT * FROM transactions WHERE id = ? AND account_id = ?').get(txId, cardAccountId);
        if (tx && tx.is_paid === 0) {
          totalAnticipated += tx.amount;
          this.db.prepare(`
            UPDATE transactions
            SET date = ?, discount_amount = COALESCE(discount_amount, 0) + ?
            WHERE id = ?
          `).run(targetDate, discountPerTx, txId);
        }
      }
      return totalAnticipated;
    })();

    this.recalculateCardInvoiceByMonthYear(cardAccountId, tM, tY);

    this.logAudit({
      userId,
      familyId,
      action: 'CARD_ANTICIPATION',
      entityType: 'invoice',
      entityId: cardAccountId,
      description: `Antecipou ${transactionIds.length} parcelas (Total: R$ ${res.toFixed(2)}, Desc: R$ ${discount.toFixed(2)}) para a fatura de ${String(tM).padStart(2, '0')}/${tY}`,
      newValues: { cardAccountId, transactionIds, targetMonth: tM, targetYear: tY, discountAmount: discount }
    });

    return { success: true, totalAnticipated: res, discountApplied: discount };
  }

  payCardInvoicePartial({ invoiceId, paymentAccountId, paidAmount, nextMonthRevolvingRate = 5, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (inv.is_paid) return { success: false, error: 'Esta fatura já foi quitada' };

    const paid = parseFloat(paidAmount) || 0;
    if (paid <= 0 || paid >= inv.amount) {
      return { success: false, error: 'Valor de pagamento parcial inválido. Deve ser maior que zero e menor que o total da fatura.' };
    }

    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    const payAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(paymentAccountId);
    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    const remainingBalance = inv.amount - paid;
    const rate = parseFloat(nextMonthRevolvingRate) || 0;
    const revolvingInterest = (remainingBalance * rate) / 100;
    const nextInvoiceCharge = Math.round((remainingBalance + revolvingInterest) * 100) / 100;

    const todayStr = new Date().toISOString().split('T')[0];
    let nextMonth = inv.month + 1;
    let nextYear = inv.year;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }

    this.db.transaction(() => {
      this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(paid, paymentAccountId);

      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 1, payment_account_id = ?, payment_date = ?, discount_amount = ?
        WHERE id = ?
      `).run(paymentAccountId, todayStr, remainingBalance, invoiceId);

      this.db.prepare('UPDATE transactions SET is_paid = 1, payment_date = ? WHERE invoice_id = ?').run(todayStr, invoiceId);

      const nextCycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, nextMonth, nextYear);
      this.db.prepare(`
        INSERT INTO transactions (user_id, account_id, type, amount, description, date, is_paid, is_avulso, notes)
        VALUES (?, ?, 'expense', ?, ?, ?, 0, 1, ?)
      `).run(
        userId,
        inv.card_account_id,
        nextInvoiceCharge,
        `Saldo Rotativo Fatura Ant. (${String(inv.month).padStart(2, '0')}/${inv.year})`,
        nextCycle.start,
        `Saldo remanescente: R$ ${remainingBalance.toFixed(2)} + Encargos (${rate}%): R$ ${revolvingInterest.toFixed(2)}`
      );
    })();

    this.logAudit({
      userId,
      familyId,
      action: 'INVOICE_PARTIAL_PAY',
      entityType: 'invoice',
      entityId: invoiceId,
      description: `Pagamento parcial da fatura ${cardAcc ? cardAcc.name : ''} (${String(inv.month).padStart(2, '0')}/${inv.year}): Pago R$ ${paid.toFixed(2)}, Rotativo R$ ${nextInvoiceCharge.toFixed(2)} para ${String(nextMonth).padStart(2, '0')}/${nextYear}`,
      newValues: { invoiceId, paidAmount: paid, remainingBalance, nextInvoiceCharge, nextMonth, nextYear }
    });

    return { success: true, paidAmount: paid, remainingBalance, nextInvoiceCharge };
  }

  refundTransaction({ transactionId, refundReason = '', userId }) {
    const tx = this.db.prepare('SELECT t.*, u.family_id, a.type as account_type FROM transactions t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN accounts a ON t.account_id = a.id WHERE t.id = ?').get(transactionId);
    if (!tx) return { success: false, error: 'Lançamento não encontrado' };

    const netAmount = (tx.amount + (tx.penalty_amount || 0) - (tx.discount_amount || 0));

    this.db.transaction(() => {
      if (tx.is_paid && tx.account_type !== 'credit') {
        const delta = tx.type === 'income' ? -netAmount : netAmount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, tx.account_id);
      }

      this.db.prepare(`
        UPDATE transactions
        SET is_avulso = 2, notes = COALESCE(notes, '') || ?
        WHERE id = ?
      `).run(` [ESTORNADO: ${refundReason || 'Cancelamento/Devolução'}]`, transactionId);

      if (tx.invoice_id) {
        this.recalculateCardInvoice({ invoiceId: tx.invoice_id, userId });
      }
    })();

    this.logAudit({
      userId,
      familyId: tx.family_id,
      action: 'TRANSACTION_REFUND',
      entityType: 'transaction',
      entityId: transactionId,
      description: `Estornou lançamento: "${tx.description}" (R$ ${tx.amount}) - Motivo: ${refundReason || 'Devolução/Estorno'}`,
      oldValues: { id: tx.id, amount: tx.amount, is_paid: tx.is_paid }
    });

    return { success: true, refundedAmount: netAmount };
  }

  recalculateCardInvoiceByMonthYear(cardAccountId, month, year) {
    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(cardAccountId);
    if (!cardAcc) return;
    const inv = this.db.prepare('SELECT * FROM invoices WHERE card_account_id = ? AND month = ? AND year = ?').get(cardAccountId, month, year);
    if (inv) {
      this.recalculateCardInvoice({ invoiceId: inv.id, userId: cardAcc.user_id });
    }
  }

  getAdvanceableInstallments(cardAccountId) {
    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ? AND type = \'credit\'').get(cardAccountId);
    if (!cardAcc) return [];

    const recurring = this.db.prepare(`
      SELECT ri.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM recurring_items ri
      LEFT JOIN categories c ON ri.category_id = c.id
      WHERE ri.account_id = ? AND ri.repeat_months > 1
    `).all(cardAccountId);

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    return recurring.map(item => {
      const createdDate = new Date(item.created_at || now);
      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth() + 1;
      const monthsElapsed = Math.max(0, (curYear - createdYear) * 12 + (curMonth - createdMonth));
      const startInst = item.start_installment || 1;
      const currentInst = Math.min(item.repeat_months, startInst + monthsElapsed);
      const remainingCount = Math.max(0, item.repeat_months - currentInst);

      return {
        id: item.id,
        name: item.name,
        amount: item.amount,
        repeat_months: item.repeat_months,
        current_installment: currentInst,
        remaining_installments: remainingCount,
        category_name: item.category_name || 'Geral',
        category_color: item.category_color || '#3b82f6',
        category_icon: item.category_icon || '🏷️',
        due_day: item.due_day
      };
    }).filter(i => i.remaining_installments > 0);
  }

  advanceInstallments({ cardAccountId, recurringItemId, countToAdvance, discountRateMonthly = 0, currentMonth, currentYear, userId }) {
    const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ? AND account_id = ?').get(recurringItemId, cardAccountId);
    if (!item) return { success: false, error: 'Item parcelado não encontrado' };

    const cardAcc = this.db.prepare('SELECT a.*, u.family_id FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = ?').get(cardAccountId);
    if (!cardAcc) return { success: false, error: 'Cartão de crédito não encontrado' };

    const count = Math.min(parseInt(countToAdvance, 10) || 1, item.repeat_months);
    if (count <= 0) return { success: false, error: 'Quantidade de parcelas inválida' };

    const rate = Math.max(0, parseFloat(discountRateMonthly) || 0) / 100;
    const nominalAmountTotal = count * item.amount;
    let presentValueTotal = 0;

    for (let k = 1; k <= count; k++) {
      const vp = rate > 0 ? (item.amount / Math.pow(1 + rate, k)) : item.amount;
      presentValueTotal += vp;
    }

    const discountTotal = nominalAmountTotal - presentValueTotal;
    const finalChargeAmount = Math.round(presentValueTotal * 100) / 100;

    const targetM = currentMonth || (new Date().getMonth() + 1);
    const targetY = currentYear || new Date().getFullYear();
    const cycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, targetM, targetY);

    this.db.transaction(() => {
      // 1. Inserir lançamento de antecipação na fatura atual
      this.db.prepare(`
        INSERT INTO transactions (user_id, account_id, category_id, amount, description, date, type, is_paid, is_avulso, notes, discount_amount)
        VALUES (?, ?, ?, ?, ?, ?, 'expense', 0, 0, ?, ?)
      `).run(
        userId || cardAcc.user_id,
        cardAccountId,
        item.category_id,
        finalChargeAmount,
        `⚡ Antecipação ${count}x "${item.name}"`,
        cycle.start,
        `Antecipação de ${count} parcelas no valor nominal de R$ ${nominalAmountTotal.toFixed(2)} com desconto de R$ ${discountTotal.toFixed(2)} (${(rate * 100).toFixed(2)}% a.m.)`,
        discountTotal
      );

      // 2. Reduzir as parcelas restantes do item recorrente
      const newRepeatMonths = Math.max(0, item.repeat_months - count);
      this.db.prepare(`
        UPDATE recurring_items
        SET repeat_months = ?
        WHERE id = ?
      `).run(newRepeatMonths, item.id);

      // 3. Recalcular fatura atual
      this.recalculateCardInvoiceByMonthYear(cardAccountId, targetM, targetY);
    })();

    this.logAudit({
      userId: userId || cardAcc.user_id,
      familyId: cardAcc.family_id,
      action: 'INSTALLMENT_ADVANCE',
      entityType: 'card_invoice',
      entityId: cardAccountId,
      description: `Antecipou ${count}x parcelas de "${item.name}" no cartão ${cardAcc.name}. Valor nominal: R$ ${nominalAmountTotal.toFixed(2)}, Valor com desconto: R$ ${finalChargeAmount.toFixed(2)} (Economia: R$ ${discountTotal.toFixed(2)})`,
      newValues: { cardAccountId, recurringItemId, count, nominalAmountTotal, finalChargeAmount, discountTotal }
    });

    return {
      success: true,
      countAdvanced: count,
      nominalAmountTotal,
      finalChargeAmount,
      discountTotal,
      message: `${count} parcela(s) antecipada(s) com sucesso na fatura atual!`
    };
  }

};

