const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'financeiro.db');
const db = new Database(dbPath);

console.log('--- ALL USERS ---');
const users = db.prepare('SELECT id, username, name, profile_type, is_system_admin, family_id FROM users').all();
console.log(JSON.stringify(users, null, 2));

console.log('--- ALL FAMILIES ---');
const families = db.prepare('SELECT * FROM families').all();
console.log(JSON.stringify(families, null, 2));
