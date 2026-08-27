const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const AppDatabase = require('../src/database/db');

describe('Testes Avançados: Cartões, Rotativo, Estornos e Métricas SQLite', () => {
  const tempDbPath = path.join(__dirname, '..', 'scratch', `test-card-adv-${Date.now()}.db`);
  let db;
  let userId;
  let checkingAccId;
  let cardAccId;

  before(() => {
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    db = new AppDatabase(tempDbPath);
    db.initialize();

    const reg = db.register({
      name: 'Tester Cartao',
      username: `card_tester_${Date.now()}`,
      password: 'password123',
      profile_type: 1
    });
    userId = reg.userId;

    const acc = db.createAccount({
      user_id: userId,
      name: 'Conta Corrente Principal',
      type: 'checking',
      balance: 3000
    });
    checkingAccId = acc.id;

    const card = db.createAccount({
      user_id: userId,
      name: 'Cartão Master Black',
      type: 'credit',
      credit_limit: 10000,
      closing_day: 5,
      due_day: 15,
      balance: 0
    });
    cardAccId = card.id;
  });

  after(() => {
    try {
      if (db && db.db) db.db.close();
      if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
      if (fs.existsSync(tempDbPath + '-wal')) fs.unlinkSync(tempDbPath + '-wal');
      if (fs.existsSync(tempDbPath + '-shm')) fs.unlinkSync(tempDbPath + '-shm');
    } catch (e) {}
  });

  test('Deve estornar transação em conta corrente restaurando o saldo anterior', () => {
    // 1. Cria despesa paga de R$ 200
    const tx = db.createTransaction({
      user_id: userId,
      account_id: checkingAccId,
      type: 'expense',
      amount: 200,
      description: 'Compra com Cancelamento',
      date: '2026-08-25',
      is_paid: 1
    });

    let acc = db.db.prepare('SELECT * FROM accounts WHERE id = ?').get(checkingAccId);
    assert.strictEqual(acc.balance, 2800); // 3000 - 200

    // 2. Realiza o estorno
    const refundRes = db.refundTransaction({
      transactionId: tx.id,
      refundReason: 'Produto com defeito e devolvido',
      userId
    });

    assert.strictEqual(refundRes.success, true);
    assert.strictEqual(refundRes.refundedAmount, 200);

    acc = db.db.prepare('SELECT * FROM accounts WHERE id = ?').get(checkingAccId);
    assert.strictEqual(acc.balance, 3000); // Saldo restaurado

    const updatedTx = db.db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id);
    assert.strictEqual(updatedTx.is_avulso, 2);
    assert.ok(updatedTx.notes.includes('ESTORNADO'));
  });

  test('Deve realizar pagamento parcial de fatura e lançar o saldo rotativo com encargos na fatura seguinte', () => {
    // 1. Gera fatura no cartão de crédito de R$ 1000
    db.createTransaction({
      user_id: userId,
      account_id: cardAccId,
      type: 'expense',
      amount: 1000,
      description: 'Compras Mês 08',
      date: '2026-07-20',
      is_paid: 0
    });

    const monthlyInvoices = db.getCardInvoices(userId, 8, 2026);
    const invoice = monthlyInvoices.find(inv => inv.card_account_id === cardAccId || inv.id);
    assert.ok(invoice);
    assert.strictEqual(invoice.amount, 1000);

    // 2. Paga parcialmente R$ 400 (saldo rotativo de R$ 600 com taxa de 10% = R$ 660 para o mês seguinte)
    const payRes = db.payCardInvoicePartial({
      invoiceId: invoice.id,
      paymentAccountId: checkingAccId,
      paidAmount: 400,
      nextMonthRevolvingRate: 10,
      userId
    });

    assert.strictEqual(payRes.success, true);
    assert.strictEqual(payRes.paidAmount, 400);
    assert.strictEqual(payRes.remainingBalance, 600);
    assert.strictEqual(payRes.nextInvoiceCharge, 660);

    // Verifica saldo da conta pagadora: 3000 - 400 = 2600
    const acc = db.db.prepare('SELECT * FROM accounts WHERE id = ?').get(checkingAccId);
    assert.strictEqual(acc.balance, 2600);

    // Verifica se a transação do rotativo foi criada
    const txs = db.getTransactions({ userId, accountId: cardAccId });
    const revolvingTx = txs.find(t => t.description.includes('Saldo Rotativo'));
    assert.ok(revolvingTx);
    assert.strictEqual(revolvingTx.amount, 660);
  });

  test('Deve testar a integridade do banco SQLite e retornar relatório completo (Fase 16)', () => {
    const integrity = db.testBackupIntegrity(tempDbPath);
    assert.strictEqual(integrity.success, true);
    assert.strictEqual(integrity.isClean, true);
    assert.strictEqual(integrity.integrityResult, 'OK');
    assert.ok(integrity.sizeBytes > 0);
    assert.strictEqual(integrity.missingTables.length, 0);
  });

  test('Deve obter métricas do sistema e contagem de tabelas SQLite (Fase 17)', () => {
    const metrics = db.getSystemMetrics();
    assert.strictEqual(metrics.success, true);
    assert.ok(metrics.sqlite.totalSizeBytes > 0);
    assert.strictEqual(metrics.sqlite.foreignKeys, true);
    assert.ok(metrics.tableCounts.transactions >= 2);
    assert.ok(metrics.process.uptimeSeconds >= 0);
  });

});
