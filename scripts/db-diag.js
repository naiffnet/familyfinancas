const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'financeiro.db');
const db = new Database(dbPath);

console.log('--- RECURRING ITEMS ---');
const items = db.prepare('SELECT id, name, user_id, is_active, is_priority, type, amount, day FROM recurring_items').all();
console.log(JSON.stringify(items, null, 2));

console.log('--- RECURRING TRANSACTIONS THIS MONTH ---');
const txs = db.prepare("SELECT id, description, date, amount, user_id, recurring_item_id FROM transactions WHERE recurring_item_id IS NOT NULL").all();
console.log(JSON.stringify(txs, null, 2));
