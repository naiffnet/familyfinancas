const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const AppDatabase = require('../src/database/db');

describe('Testes de Integridade e Constraints do SQLite', () => {
  const tempDbPath = path.join(__dirname, '..', 'scratch', `test-integ-${Date.now()}.db`);
  let db;

  before(() => {
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    db = new AppDatabase(tempDbPath);
    db.initialize();
  });

  after(() => {
    try {
      if (db && db.db) db.db.close();
      if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
      if (fs.existsSync(tempDbPath + '-wal')) fs.unlinkSync(tempDbPath + '-wal');
      if (fs.existsSync(tempDbPath + '-shm')) fs.unlinkSync(tempDbPath + '-shm');
    } catch (e) {}
  });

  test('Deve garantir que o modo WAL e Foreign Keys estão ativos', () => {
    const wal = db.db.pragma('journal_mode', { simple: true });
    const fk = db.db.pragma('foreign_keys', { simple: true });
    assert.strictEqual(wal.toLowerCase(), 'wal');
    assert.strictEqual(fk, 1);
  });

  test('Deve rejeitar tipos de contas inválidos via CHECK constraint', () => {
    assert.throws(() => {
      db.db.prepare(`
        INSERT INTO accounts (user_id, name, type, balance)
        VALUES (1, 'Conta Inválida', 'tipo_inexistente', 100)
      `).run();
    }, /CHECK constraint failed/);
  });

  test('Deve aceitar todos os tipos válidos de conta bancária (incluindo voucher)', () => {
    const validTypes = ['checking', 'savings', 'wallet', 'credit', 'investment', 'voucher'];
    for (const t of validTypes) {
      const stmt = db.db.prepare(`
        INSERT INTO accounts (user_id, name, type, balance)
        VALUES (1, 'Conta ' || ?, ?, 0)
      `);
      assert.doesNotThrow(() => stmt.run(t, t));
    }
  });

});
