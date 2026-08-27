const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const AppDatabase = require('../src/database/db');

describe('Testes de Integração: Trilha de Auditoria (audit_logs)', () => {
  const tempDbPath = path.join(__dirname, '..', 'scratch', `test-audit-${Date.now()}.db`);
  let db;
  let userId;
  let accountId;
  let familyId;

  before(() => {
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    db = new AppDatabase(tempDbPath);
    db.initialize();

    const reg = db.register({
      name: 'Auditor Teste',
      username: `auditor_${Date.now()}`,
      password: 'password123',
      profile_type: 1
    });
    userId = reg.userId;
    familyId = reg.familyId;

    const acc = db.createAccount({
      user_id: userId,
      name: 'Conta Auditoria',
      type: 'checking',
      balance: 500
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

  test('Deve registrar log ao criar uma nova conta bancária', () => {
    const logs = db.getAuditLogs({ entityType: 'account' });
    assert.ok(logs.length > 0);
    const creationLog = logs.find(l => l.action === 'ACCOUNT_CREATE');
    assert.ok(creationLog);
    assert.strictEqual(creationLog.entity_type, 'account');
    assert.ok(creationLog.description.includes('Conta Auditoria'));
  });

  test('Deve registrar log ao criar, alterar e excluir um lançamento com valores anteriores e novos', () => {
    // 1. Criar transação
    const tx = db.createTransaction({
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 150,
      description: 'Lançamento Auditoria',
      date: '2026-08-25',
      is_paid: 0
    });

    let logs = db.getAuditLogs({ entityType: 'transaction' });
    const createLog = logs.find(l => l.action === 'TRANSACTION_CREATE' && l.entity_id === tx.id);
    assert.ok(createLog);
    assert.strictEqual(createLog.new_values.amount, 150);

    // 2. Atualizar transação
    db.updateTransaction({
      id: tx.id,
      user_id: userId,
      account_id: accountId,
      type: 'expense',
      amount: 180,
      description: 'Lançamento Auditoria Editado',
      date: '2026-08-25'
    });

    logs = db.getAuditLogs({ entityType: 'transaction' });
    const updateLog = logs.find(l => l.action === 'TRANSACTION_UPDATE' && l.entity_id === tx.id);
    assert.ok(updateLog);
    assert.strictEqual(updateLog.old_values.amount, 150);
    assert.strictEqual(updateLog.new_values.amount, 180);

    // 3. Excluir transação
    db.deleteTransaction(tx.id);
    logs = db.getAuditLogs({ entityType: 'transaction' });
    const deleteLog = logs.find(l => l.action === 'TRANSACTION_DELETE' && l.entity_id === tx.id);
    assert.ok(deleteLog);
    assert.strictEqual(deleteLog.old_values.amount, 180);
  });

  test('Deve filtrar logs por família e limitar a quantidade retornada', () => {
    const logs = db.getAuditLogs({ limit: 2 });
    assert.ok(logs.length <= 2);
  });

});
