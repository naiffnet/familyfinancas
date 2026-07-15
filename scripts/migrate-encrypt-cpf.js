const Database = require('better-sqlite3');
const path = require('path');
const { encryptField } = require('../src/database/crypto-utils');

// Determine path
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'financeiro.db');
console.log('Utilizando banco de dados em:', dbPath);

try {
  const db = new Database(dbPath);

  db.transaction(() => {
    // Check if users table exists
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableCheck) {
      console.log("Tabela 'users' não existe no banco. Nenhuma migração de CPF necessária.");
      return;
    }

    const users = db.prepare('SELECT id, cpf FROM users').all();
    let migratedCount = 0;
    
    for (const u of users) {
      if (u.cpf) {
        // Check if it's already encrypted (Base64 AES-GCM regex and min length)
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        if (!base64Regex.test(u.cpf) || u.cpf.length < 28) {
          const encrypted = encryptField(u.cpf);
          db.prepare('UPDATE users SET cpf = ? WHERE id = ?').run(encrypted, u.id);
          console.log(`CPF do usuário ID ${u.id} criptografado com sucesso.`);
          migratedCount++;
        } else {
          console.log(`CPF do usuário ID ${u.id} já parece estar criptografado.`);
        }
      }
    }
    
    console.log(`Migração concluída. Total de CPFs criptografados nesta execução: ${migratedCount}`);
  })();

  // Clean exit for both Node and Electron
  try {
    const { app } = require('electron');
    if (app) {
      app.exit(0);
    }
  } catch (e) {}
  process.exit(0);
} catch (err) {
  console.error("Erro ao rodar migração de CPFs:", err);
  try {
    const { app } = require('electron');
    if (app) {
      app.exit(1);
    }
  } catch (e) {}
  process.exit(1);
}
