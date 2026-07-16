const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'financeiro.db');
const db = new Database(dbPath);

console.log('--- RECURRING ITEMS ---');
const items = db.prepare('SELECT * FROM recurring_items').all();
console.log(JSON.stringify(items, null, 2));

console.log('--- RECURRING TRANSACTIONS THIS MONTH ---');
const txs = db.prepare("SELECT * FROM transactions WHERE recurring_item_id IS NOT NULL").all();
console.log(JSON.stringify(txs, null, 2));
