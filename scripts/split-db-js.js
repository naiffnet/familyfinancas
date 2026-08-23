/**
 * scripts/split-db-js.js
 * Script para modularizar src/database/db.js em mixins de classe limpos.
 * Cada módulo é uma classe derivada (< 1000 linhas), preservando 100% da sintaxe de métodos.
 */
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'src', 'database');
const DB_SRC = path.join(DB_DIR, 'db.legacy.js');
const DB_OUT = path.join(DB_DIR, 'db.js');

const code = fs.readFileSync(DB_SRC, 'utf8');
const lines = code.split('\n');

console.log(`📄 db.js original: ${lines.length} linhas`);

// Helper to extract line slice (1-indexed, inclusive)
function getSlice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// 1. db-core.js (L1 to L990)
const dbCoreContent = `/**
 * src/database/db-core.js
 * Inicialização SQLite, schemas, migrations e backups automáticos.
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const { encryptField, decryptField } = require('./crypto-utils');
const SessionRepository = require('./session-repo');
const { performAutoDailyBackup } = require('./autoBackup');

let app;
try {
  app = require('electron').app;
  if (app) {
    app.setName('financeiro-familiar');
  }
} catch (e) {
  // Not running inside Electron
}

function getCardBillingCycle(closingDay, dueDay, month, year) {
  let cDay = parseInt(closingDay);
  let dDay = parseInt(dueDay) || 10;
  
  if (isNaN(cDay) || cDay <= 0) {
    cDay = dDay - 10;
    if (cDay <= 0) {
      cDay = 30 + cDay;
    }
  }

  const endYear = year;
  const endMonth = month;
  const endDay = cDay;

  let startYear = year;
  let startMonth = month - 1;
  if (startMonth === 0) {
    startMonth = 12;
    startYear--;
  }
  const startDay = cDay + 1;

  const format = (y, m, d) => {
    let maxDays = new Date(y, m, 0).getDate();
    let fd = Math.min(d, maxDays);
    return \`\${y}-\${String(m).padStart(2, '0')}-\${String(fd).padStart(2, '0')}\`;
  };

  return {
    start: format(startYear, startMonth, startDay),
    end: format(endYear, endMonth, endDay)
  };
}

class DbCore {
${getSlice(55, 990)}
}

module.exports = { DbCore, getCardBillingCycle };
`;

// 2. db-family-users.js (L993 to L1432 and L3238 to L3575)
const dbFamilyUsersContent = `/**
 * src/database/db-family-users.js
 * Gestão de usuários, famílias, perfis, permissões, sessões e auditoria LGPD.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { encryptField, decryptField } = require('./crypto-utils');

module.exports = (Base) => class extends Base {
${getSlice(993, 1432)}
${getSlice(3238, 3575)}
};
`;

// 3. db-accounts.js (L1433 to L1686 and L3576 to L3634)
const dbAccountsContent = `/**
 * src/database/db-accounts.js
 * Contas bancárias, carteiras, cartões benefício e importação OFX/CSV.
 */
const { parseOfxStatement } = require('./importers/ofxParser');
const { parseCsvStatement } = require('./importers/csvParser');

module.exports = (Base) => class extends Base {
${getSlice(1433, 1686)}
${getSlice(3576, 3634)}
};
`;

// 4. db-recurring.js (L1687 to L2111)
const dbRecurringContent = `/**
 * src/database/db-recurring.js
 * Despesas e receitas fixas/recorrentes, prioridades, ordenação e adiamento.
 */
module.exports = (Base) => class extends Base {
${getSlice(1687, 2111)}
};
`;

// 5. db-transactions.js (L2112 to L2353 and L2744 to L2768)
const dbTransactionsContent = `/**
 * src/database/db-transactions.js
 * Lançamentos avulsos, baixas/quitação com juros/descontos e ordenação.
 */
module.exports = (Base) => class extends Base {
${getSlice(2112, 2353)}
${getSlice(2744, 2768)}
};
`;

// 6. db-card-invoices.js (L2354 to L2743)
const dbCardInvoicesContent = `/**
 * src/database/db-card-invoices.js
 * Faturas de cartões de crédito, pagamentos, renegociações e reaberturas.
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
${getSlice(2354, 2743)}
};
`;

// 7. db-reports.js (L2769 to L3237)
const dbReportsContent = `/**
 * src/database/db-reports.js
 * Orçamentos, metas, fluxos de caixa, patrimônio e resumos do Dashboard.
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
${getSlice(2769, 3237)}
};
`;

// 8. db-sync-dedup.js (L3635 to L4123)
const dbSyncDedupContent = `/**
 * src/database/db-sync-dedup.js
 * Motor anti-duplicidade heurístico (NLP bancário, auto-merge, histórico e Smart Sync).
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
${getSlice(3635, 4123)}
};
`;

// Write all modular files
const modulesToWrite = [
  { name: 'db-core.js', content: dbCoreContent },
  { name: 'db-family-users.js', content: dbFamilyUsersContent },
  { name: 'db-accounts.js', content: dbAccountsContent },
  { name: 'db-recurring.js', content: dbRecurringContent },
  { name: 'db-transactions.js', content: dbTransactionsContent },
  { name: 'db-card-invoices.js', content: dbCardInvoicesContent },
  { name: 'db-reports.js', content: dbReportsContent },
  { name: 'db-sync-dedup.js', content: dbSyncDedupContent },
];

for (const m of modulesToWrite) {
  const filePath = path.join(DB_DIR, m.name);
  fs.writeFileSync(filePath, m.content, 'utf8');
  const lineCount = m.content.split('\n').length;
  const kb = (fs.statSync(filePath).size / 1024).toFixed(1);
  console.log(`✅ ${m.name}: ${lineCount} linhas (${kb} KB)`);
}

// 9. New clean db.js aggregator class
const newDbIndex = `/**
 * src/database/db.js
 * Ponto de entrada unificado da camada de dados SQLite do FamilyFinanças.
 * Modularizado em mixins de domínio limpos (< 1000 linhas cada).
 */

const { DbCore, getCardBillingCycle } = require('./db-core');
const withFamilyUsers = require('./db-family-users');
const withAccounts = require('./db-accounts');
const withRecurring = require('./db-recurring');
const withTransactions = require('./db-transactions');
const withCardInvoices = require('./db-card-invoices');
const withReports = require('./db-reports');
const withSyncDedup = require('./db-sync-dedup');

// Classe unificada composta via mixins
class AppDatabase extends withSyncDedup(
  withReports(
    withCardInvoices(
      withTransactions(
        withRecurring(
          withAccounts(
            withFamilyUsers(DbCore)
          )
        )
      )
    )
  )
) {}

module.exports = AppDatabase;
module.exports.AppDatabase = AppDatabase;
module.exports.getCardBillingCycle = getCardBillingCycle;
`;

// Backup db.js as db.legacy.js before overwriting
if (!fs.existsSync(path.join(DB_DIR, 'db.legacy.js'))) {
  fs.copyFileSync(DB_SRC, path.join(DB_DIR, 'db.legacy.js'));
}
fs.writeFileSync(DB_OUT, newDbIndex, 'utf8');
console.log(`\n✅ db.js refatorado para agregador com ${newDbIndex.split('\n').length} linhas!`);
console.log(`📦 db.legacy.js mantido como backup.`);
