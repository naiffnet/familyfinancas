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
