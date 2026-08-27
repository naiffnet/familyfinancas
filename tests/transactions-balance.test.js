const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const AppDatabase = require('../src/database/db');

describe('Testes de Integração: Transações, Liquidação Líquida e Saldo Bancário', () => {
  const tempDbPath = path.join(__dirname, '..', 'scratch', `test-tx-${Date.now()}.db`);
  let db;
  let userId;
  let accountId;

  before(() => {
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    db = new AppDatabase(tempDbPath);
    db.initialize();

    // Cria usuário de teste
    const reg = db.register({
      name: 'Usuário Teste',
      username: `test_${Date.now()}`,
      password: 'password123',
      profile_type: 2
    });
    userId = reg.userId;

    // Cria conta de teste com saldo R$ 1.000,00
    const acc = db.createAccount({
      user_id: userId,
      name: 'Conta Corrente Teste',
      type: 'checking',
      balance: 1000
    });
    accountId = acc.id;
  });

  after(() => {
    try {
      if (db && db.db) db.db.close();
      if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
      if (fs.existsSync(tempDbPath + '-wal')) fs.unlinkSync(tempDbPath + '-wal');
      if (fs.existsSync(tempDbPath + '-shm')) fs.unlinkSync(tempDbPath + '-shm');
    } catch (e) {}
  });

  test('Deve criar uma despesa paga à vista e abater o valor líquido do saldo', () => {
    // Despesa R$ 200,00 com R$ 10,00 de juros e R$ 5,00 de desconto -> Líquido: R$ 205,00
    // Saldo inicial: R$ 1.000,00 -> Novo saldo esperado: R$ 795,00
    const res = db.createTransaction({
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 200,
      description: 'Supermercado',
      date: '2026-08-25',
      is_paid: 1,
      penalty_amount: 10,
      discount_amount: 5
    });

    assert.strictEqual(res.success, true);
    const acc = db.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(accountId);
    assert.strictEqual(acc.balance, 795);
  });

  test('Deve criar despesa pendente sem alterar o saldo bancário imediato', () => {
    const res = db.createTransaction({
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 100,
      description: 'Boleto Luz',
      date: '2026-08-30',
      is_paid: 0
    });

    assert.strictEqual(res.success, true);
    const acc = db.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(accountId);
    assert.strictEqual(acc.balance, 795); // Saldo inalterado
  });

  test('Deve liquidar despesa pendente com acréscimo de juros e abater do saldo', () => {
    // Criar boleto pendente de R$ 50,00
    const tx = db.createTransaction({
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 50,
      description: 'Conta de Água',
      date: '2026-08-10',
      is_paid: 0
    });

    // Baixa com R$ 8,00 de juros/multa de atraso -> Líquido R$ 58,00
    // Saldo anterior: R$ 795,00 -> Novo saldo: R$ 737,00
    const payRes = db.toggleTransactionPaidWithDate(tx.id, '2026-08-25', { penalty_amount: 8, discount_amount: 0 });
    assert.strictEqual(payRes.success, true);

    const acc = db.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(accountId);
    assert.strictEqual(acc.balance, 737);
  });

  test('Deve restaurar o saldo bancário ao excluir uma despesa paga', () => {
    // Criar despesa paga de R$ 37,00 -> Saldo cai de R$ 737,00 para R$ 700,00
    const tx = db.createTransaction({
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 37,
      description: 'Farmácia',
      date: '2026-08-25',
      is_paid: 1
    });

    let acc = db.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(accountId);
    assert.strictEqual(acc.balance, 700);

    // Excluir a despesa -> Saldo deve voltar a R$ 737,00
    const delRes = db.deleteTransaction(tx.id);
    assert.strictEqual(delRes.success, true);

    acc = db.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(accountId);
    assert.strictEqual(acc.balance, 737);
  });

});
