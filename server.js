const fs = require('fs');
const path = require('path');

// Auto-swap uploaded database if present in volume
const uploadFile = '/data/financeiro_uploaded.db';
const targetFile = process.env.DATABASE_PATH || '/data/financeiro.db';
if (fs.existsSync(uploadFile)) {
  try {
    console.log(`[Database Migration] Swapping uploaded database ${uploadFile} to ${targetFile}...`);
    fs.copyFileSync(uploadFile, targetFile);
    fs.unlinkSync(uploadFile);
    const walFile = targetFile + '-wal';
    const shmFile = targetFile + '-shm';
    if (fs.existsSync(walFile)) fs.unlinkSync(walFile);
    if (fs.existsSync(shmFile)) fs.unlinkSync(shmFile);
    console.log(`[Database Migration] Database successfully updated from uploaded file!`);
  } catch (e) {
    console.error(`[Database Migration] Error swapping database:`, e);
  }
}

const Database = require('./src/database/db');
const { createExpressApp } = require('./src/server/core');

// Instantiate Database in standalone mode
const db = new Database();
db.initialize();

const { app: expressApp } = createExpressApp(db);

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`[Standalone Server] Running on http://localhost:${PORT}`);
  console.log(`[Standalone Server] Ready for deployment on Fly.io / Cloud!`);
  console.log(`======================================================\n`);
});
