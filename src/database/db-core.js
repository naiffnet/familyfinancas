/**
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
    return `${y}-${String(m).padStart(2, '0')}-${String(fd).padStart(2, '0')}`;
  };

  return {
    start: format(startYear, startMonth, startDay),
    end: format(endYear, endMonth, endDay)
  };
}

class DbCore {
  constructor(dbPath) {
    if (dbPath) {
      this.dbPath = dbPath;
    } else if (process.env.DATABASE_PATH) {
      this.dbPath = process.env.DATABASE_PATH;
    } else {
      let userDataPath = '';
      try {
        if (app && app.getPath) userDataPath = app.getPath('userData');
      } catch (e) {}
      if (!userDataPath && process.env.APPDATA) {
        userDataPath = path.join(process.env.APPDATA, 'financeiro-familiar');
      }
      if (userDataPath) {
        this.dbPath = path.join(userDataPath, 'financeiro.db');
      } else {
        this.dbPath = path.join(__dirname, '..', '..', 'financeiro.db');
      }
    }
    this.db = null;
    this.sessionRepo = null;
  }

  initialize() {
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.sessionRepo = new SessionRepository(this.db);
    this.sessionRepo.ensureTable();
    this.createTables();
    this.migrateSchema();
    this.repairLegacyShiftedPayments();
    this.seedDefaultData();
    this.cleanDuplicateCategories();
    this.generateMonthlyRecurrences();
    performAutoDailyBackup(this.db, this.dbPath);
  }

  createSession(user) {
    const token = crypto.randomBytes(32).toString('hex');
    this.sessionRepo.saveSession(token, user);
    return token;
  }

  getSession(token) {
    return this.sessionRepo.getSession(token);
  }

  deleteSession(token) {
    return this.sessionRepo.deleteSession(token);
  }


  migrateSchema() {
    // 1. Add bank column if not exists
    try {
      this.db.exec("ALTER TABLE accounts ADD COLUMN bank TEXT DEFAULT 'outro'");
    } catch (e) {
      // Column already exists or table doesn't exist yet
    }
    // 2. Add recurring_item_id to transactions if not exists
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN recurring_item_id INTEGER REFERENCES recurring_items(id)");
    } catch (e) {
      // Column already exists
    }
    // 3. Add is_avulso to transactions if not exists
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN is_avulso INTEGER DEFAULT 0");
    } catch (e) {
      // Column already exists
    }
    // 3.5. Add payment_date, penalty_amount, discount_amount to transactions if not exists
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN payment_date TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN penalty_amount REAL DEFAULT 0");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN discount_amount REAL DEFAULT 0");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN competence_date TEXT DEFAULT NULL");
    } catch (e) {}
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          card_account_id INTEGER NOT NULL,
          payment_account_id INTEGER,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          due_date TEXT NOT NULL,
          amount REAL NOT NULL DEFAULT 0,
          penalty_amount REAL DEFAULT 0,
          discount_amount REAL DEFAULT 0,
          is_paid INTEGER DEFAULT 0,
          payment_date TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY(card_account_id) REFERENCES accounts(id),
          FOREIGN KEY(payment_account_id) REFERENCES accounts(id),
          UNIQUE(card_account_id, month, year)
        );
      `);
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN invoice_id INTEGER REFERENCES invoices(id)");
    } catch (e) {}
    // 4. Add agency and account_number to accounts if not exists
    try {
      this.db.exec("ALTER TABLE accounts ADD COLUMN agency TEXT");
    } catch (e) {
      // Column already exists
    }
    try {
      this.db.exec("ALTER TABLE accounts ADD COLUMN account_number TEXT");
    } catch (e) {
      // Column already exists
    }

    // 4.5. Add recovery_question and recovery_answer to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN recovery_question TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN recovery_answer TEXT");
    } catch (e) {}

    // 4.6. Add accepted_terms_timestamp and accepted_terms_version to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN accepted_terms_timestamp TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN accepted_terms_version INTEGER DEFAULT 0");
    } catch (e) {}

    // 4.7. Add is_system_admin to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN is_system_admin INTEGER DEFAULT 0");
    } catch (e) {}
    try {
      this.db.exec("UPDATE users SET is_system_admin = 1 WHERE username = 'adm' OR profile_type = 1");
    } catch (e) {}

    // 4.8. Invoices renegotiation support
    try { this.db.exec("ALTER TABLE invoices ADD COLUMN is_renegotiated INTEGER DEFAULT 0"); } catch (e) {}
    try { this.db.exec("ALTER TABLE invoices ADD COLUMN renegotiation_details TEXT"); } catch (e) {}

    // 4.9. Strategic Performance Indexes
    try {
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, date);
        CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(recurring_item_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice_id);
        CREATE INDEX IF NOT EXISTS idx_recurring_user_active ON recurring_items(user_id, is_active);
        CREATE INDEX IF NOT EXISTS idx_invoices_card_month_year ON invoices(card_account_id, month, year);
        CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active);
      `);
    } catch (e) {
      console.warn("Aviso ao criar índices SQLite:", e);
    }

    // 5. Migrate accounts CHECK constraint to include 'voucher'
    try {
      const accountSchema = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='accounts'").get();
      if (accountSchema && accountSchema.sql && !accountSchema.sql.includes("'voucher'")) {
        console.log('Migrating accounts table to support voucher type...');
        this.db.pragma('foreign_keys = OFF'); // Disable foreign keys during migration
        const migrate = this.db.transaction(() => {
          // Rename old table
          this.db.exec("ALTER TABLE accounts RENAME TO accounts_old");
          
          // Create new table with updated CHECK constraint
          this.db.exec(`
            CREATE TABLE accounts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              name TEXT NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('checking','savings','wallet','credit','investment','voucher')),
              bank TEXT DEFAULT 'outro',
              balance REAL DEFAULT 0,
              color TEXT DEFAULT '#10b981',
              credit_limit REAL,
              closing_day INTEGER,
              due_day INTEGER,
              agency TEXT,
              account_number TEXT,
              is_active INTEGER DEFAULT 1,
              created_at TEXT DEFAULT (datetime('now')),
              FOREIGN KEY(user_id) REFERENCES users(id)
            )
          `);
          
          // Copy data from old table to new table
          this.db.exec(`
            INSERT INTO accounts (id, user_id, name, type, bank, balance, color, credit_limit, closing_day, due_day, agency, account_number, is_active, created_at)
            SELECT id, user_id, name, type, bank, balance, color, credit_limit, closing_day, due_day, agency, account_number, is_active, created_at
            FROM accounts_old
          `);
          
          // Drop old table
          this.db.exec("DROP TABLE accounts_old");
        });
        migrate();
        this.db.pragma('foreign_keys = ON'); // Re-enable foreign keys
        console.log('Migration to support voucher type completed successfully!');
      }
    } catch (err) {
      try {
        this.db.pragma('foreign_keys = ON'); // Ensure foreign keys are re-enabled even on failure
      } catch (e) {}
      console.error('Error during accounts table migration:', err);
    }

    // 6. Repair any orphaned foreign keys referencing "accounts_old" in recurring_items and transactions
    try {
      const recurringSchema = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='recurring_items'").get();
      if (recurringSchema && recurringSchema.sql && recurringSchema.sql.includes('"accounts_old"')) {
        console.log('Fixing recurring_items foreign key to accounts...');
        this.db.pragma('foreign_keys = OFF');
        const migrate = this.db.transaction(() => {
          this.db.exec("ALTER TABLE recurring_items RENAME TO recurring_items_old");
          
          this.db.exec(`
            CREATE TABLE recurring_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              name TEXT NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('income','expense')),
              amount REAL NOT NULL,
              category_id INTEGER,
              account_id INTEGER,
              due_day INTEGER NOT NULL DEFAULT 1,
              is_active INTEGER DEFAULT 1,
              is_priority INTEGER DEFAULT 0,
              icon TEXT DEFAULT '📋',
              color TEXT DEFAULT '#10b981',
              notes TEXT,
              created_at TEXT DEFAULT (datetime('now')),
              FOREIGN KEY(user_id) REFERENCES users(id),
              FOREIGN KEY(category_id) REFERENCES categories(id),
              FOREIGN KEY(account_id) REFERENCES accounts(id)
            )
          `);
          
          this.db.exec(`
            INSERT INTO recurring_items (id, user_id, name, type, amount, category_id, account_id, due_day, is_active, is_priority, icon, color, notes, created_at)
            SELECT id, user_id, name, type, amount, category_id, account_id, due_day, is_active, is_priority, icon, color, notes, created_at
            FROM recurring_items_old
          `);
          
          this.db.exec("DROP TABLE recurring_items_old");
        });
        migrate();
        this.db.pragma('foreign_keys = ON');
        console.log('recurring_items foreign key fixed successfully!');
      }
    } catch (err) {
      try { this.db.pragma('foreign_keys = ON'); } catch (e) {}
      console.error('Error repairing recurring_items foreign key:', err);
    }

    try {
      const transactionsSchema = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'").get();
      if (transactionsSchema && transactionsSchema.sql && transactionsSchema.sql.includes('"accounts_old"')) {
        console.log('Fixing transactions foreign key to accounts...');
        this.db.pragma('foreign_keys = OFF');
        const migrate = this.db.transaction(() => {
          this.db.exec("ALTER TABLE transactions RENAME TO transactions_old");
          
          this.db.exec(`
            CREATE TABLE transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              account_id INTEGER NOT NULL,
              category_id INTEGER,
              type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
              amount REAL NOT NULL,
              description TEXT,
              date TEXT NOT NULL,
              is_paid INTEGER DEFAULT 1,
              notes TEXT,
              created_at TEXT DEFAULT (datetime('now')),
              recurring_item_id INTEGER,
              is_avulso INTEGER DEFAULT 0,
              FOREIGN KEY(user_id) REFERENCES users(id),
              FOREIGN KEY(account_id) REFERENCES accounts(id),
              FOREIGN KEY(category_id) REFERENCES categories(id),
              FOREIGN KEY(recurring_item_id) REFERENCES recurring_items(id)
            )
          `);
          
          this.db.exec(`
            INSERT INTO transactions (id, user_id, account_id, category_id, type, amount, description, date, is_paid, notes, created_at, recurring_item_id, is_avulso)
            SELECT id, user_id, account_id, category_id, type, amount, description, date, is_paid, notes, created_at, recurring_item_id, is_avulso
            FROM transactions_old
          `);
          
          this.db.exec("DROP TABLE transactions_old");
        });
        migrate();
        this.db.pragma('foreign_keys = ON');
        console.log('transactions foreign key fixed successfully!');
      }
    } catch (err) {
      try { this.db.pragma('foreign_keys = ON'); } catch (e) {}
      console.error('Error repairing transactions foreign key:', err);
    }

    // 7. Create user_permissions table and seed default permissions
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          user_id INTEGER PRIMARY KEY,
          can_view_all INTEGER DEFAULT 0,
          can_edit_all INTEGER DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      
      // Seed permissions for existing users
      const users = this.db.prepare('SELECT id, username FROM users').all();
      const insertPerm = this.db.prepare('INSERT OR IGNORE INTO user_permissions (user_id, can_view_all, can_edit_all) VALUES (?, ?, ?)');
      for (const u of users) {
        if (u.username === 'adm') {
          insertPerm.run(u.id, 1, 1);
        } else {
          insertPerm.run(u.id, 0, 0);
        }
      }
    } catch (err) {
      console.error('Error migrating user_permissions table:', err);
    }

    // 7.1. Alter user_permissions table to add menu permission columns
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_dashboard INTEGER DEFAULT 1");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_recurring INTEGER DEFAULT 1");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_accounts INTEGER DEFAULT 1");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_budget INTEGER DEFAULT 1");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_goals INTEGER DEFAULT 1");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE user_permissions ADD COLUMN allow_reports INTEGER DEFAULT 1");
    } catch (e) {}

    // 8. Add avatar_image to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN avatar_image TEXT");
    } catch (e) {
      // Column already exists
    }

    // 9. Add repeat_months to recurring_items if not exists
    try {
      this.db.exec("ALTER TABLE recurring_items ADD COLUMN repeat_months INTEGER DEFAULT 0");
    } catch (e) {
      // Column already exists
    }

    // 10. Add start_installment to recurring_items if not exists
    try {
      this.db.exec("ALTER TABLE recurring_items ADD COLUMN start_installment INTEGER DEFAULT 1");
    } catch (e) {
      // Column already exists
    }

    // 11. Create families table if not exists
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS families (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          quota_users INTEGER DEFAULT 6,
          quota_accounts INTEGER DEFAULT 10,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);
    } catch (e) {}

    // 12. Add family_id to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN family_id INTEGER REFERENCES families(id) ON DELETE SET NULL");
    } catch (e) {}

    // 13. Add profile_type to users if not exists
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN profile_type INTEGER DEFAULT 2");
    } catch (e) {}

    // 14. Seed default family and link existing users to it
    try {
      const famCount = this.db.prepare("SELECT COUNT(*) as count FROM families").get().count;
      if (famCount === 0) {
        console.log('Seeding default family "Família Mestra" for backward compatibility...');
        this.db.prepare("INSERT INTO families (name) VALUES ('Família Mestra')").run();
        
        // Link all existing users to family ID 1
        this.db.prepare("UPDATE users SET family_id = 1").run();
        
        // Make sure user 'adm' is profile_type = 1 (ADM Geral), others are 2 (Responsável)
        this.db.prepare("UPDATE users SET profile_type = 1 WHERE username = 'adm'").run();
        this.db.prepare("UPDATE users SET profile_type = 2 WHERE username != 'adm'").run();
      }
    } catch (err) {
      console.error('Error seeding default family in migration:', err);
    }

    // 15. Add rich client details to users
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN first_name TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN last_name TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN email TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN cpf TEXT");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN birth_date TEXT");
    } catch (e) {}

    // 16. Split existing names into first_name and last_name for retrocompatibility
    try {
      const users = this.db.prepare("SELECT id, name, first_name FROM users").all();
      for (const u of users) {
        if (!u.first_name && u.name) {
          const parts = u.name.trim().split(/\s+/);
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ') || '';
          this.db.prepare("UPDATE users SET first_name = ?, last_name = ? WHERE id = ?").run(firstName, lastName, u.id);
        }
      }
    } catch (err) {
      console.error('Error splitting names in migration:', err);
    }

    // 17. Repair legacy null/0 profiles
    try {
      this.db.prepare("UPDATE users SET profile_type = 1 WHERE username = 'adm'").run();
      this.db.prepare("UPDATE users SET profile_type = 2 WHERE (profile_type IS NULL OR profile_type = 0) AND username != 'adm'").run();
    } catch (e) {}

    // 18. Add position to recurring_items
    try {
      this.db.exec("ALTER TABLE recurring_items ADD COLUMN position INTEGER DEFAULT 0");
    } catch (e) {}

    // 19. Add position to transactions
    try {
      this.db.exec("ALTER TABLE transactions ADD COLUMN position INTEGER DEFAULT 0");
    } catch (e) {}

    // 20. Add position to users
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN position INTEGER DEFAULT 0");
    } catch (e) {}

    // 21. Add family_id to server_logs
    try {
      this.db.exec("ALTER TABLE server_logs ADD COLUMN family_id INTEGER DEFAULT NULL");
    } catch (e) {}

    // 22. Add competence_offset to recurring_items
    try {
      this.db.exec("ALTER TABLE recurring_items ADD COLUMN competence_offset INTEGER DEFAULT 0");
    } catch (e) {}
  }

  repairLegacyShiftedPayments() {
    try {
      const shiftedTxs = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.created_at as rec_created_at, ri.start_installment, ri.repeat_months, ri.name as rec_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.is_paid = 1 AND t.is_avulso = 0
      `).all();

      const repair = this.db.transaction(() => {
        for (const tx of shiftedTxs) {
          if (!tx.date) continue;
          
          let createdYear, createdMonth;
          if (tx.rec_created_at) {
            const partsC = tx.rec_created_at.split('-');
            createdYear = parseInt(partsC[0], 10);
            createdMonth = parseInt(partsC[1], 10);
          } else {
            const now = new Date();
            createdYear = now.getFullYear();
            createdMonth = now.getMonth() + 1;
          }

          const match = tx.description ? tx.description.match(/(\d+)\/(\d+)/) : null;
          if (match) {
            const instNum = parseInt(match[1], 10);
            const startInst = tx.start_installment || 1;
            const monthOffset = instNum - startInst;

            let expectedMonth = createdMonth + monthOffset;
            let expectedYear = createdYear + Math.floor((expectedMonth - 1) / 12);
            expectedMonth = ((expectedMonth - 1) % 12) + 1;

            const partsDate = tx.date.split('-');
            const txYear = parseInt(partsDate[0], 10);
            const txMonth = parseInt(partsDate[1], 10);

            if (txYear !== expectedYear || txMonth !== expectedMonth) {
              const day = Math.min(tx.due_day || 1, new Date(expectedYear, expectedMonth, 0).getDate());
              const originalCompetenceDate = `${expectedYear}-${String(expectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const actualPaymentDate = tx.payment_date || tx.date;

              console.log(`[Self-Healing] Restaurando data de competência da transação ID ${tx.id} ("${tx.description}") de ${tx.date} para ${originalCompetenceDate} (Pago em ${actualPaymentDate})`);

              this.db.prepare(`
                UPDATE transactions 
                SET date = ?, payment_date = ? 
                WHERE id = ?
              `).run(originalCompetenceDate, actualPaymentDate, tx.id);

              this.db.prepare(`
                DELETE FROM transactions 
                WHERE recurring_item_id = ? AND is_paid = 0 AND id != ?
                AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
              `).run(tx.recurring_item_id, tx.id, String(expectedMonth).padStart(2, '0'), String(expectedYear));
            }
          }
        }
      });
      repair();
    } catch (err) {
      console.error('Error repairing legacy shifted payments:', err);
    }
  }

  createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quota_users INTEGER DEFAULT 6,
        quota_accounts INTEGER DEFAULT 10,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        cpf TEXT,
        birth_date TEXT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        avatar_color TEXT DEFAULT '#10b981',
        avatar_image TEXT,
        family_id INTEGER REFERENCES families(id) ON DELETE SET NULL,
        profile_type INTEGER DEFAULT 2,
        recovery_question TEXT,
        recovery_answer TEXT,
        accepted_terms_timestamp TEXT,
        accepted_terms_version INTEGER DEFAULT 0,
        is_system_admin INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        UNIQUE(user_id, key),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('checking','savings','wallet','credit','investment','voucher')),
        bank TEXT DEFAULT 'outro',
        balance REAL DEFAULT 0,
        color TEXT DEFAULT '#10b981',
        credit_limit REAL,
        closing_day INTEGER,
        due_day INTEGER,
        agency TEXT,
        account_number TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income','expense','both')),
        color TEXT DEFAULT '#10b981',
        icon TEXT DEFAULT '📦',
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS recurring_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income','expense')),
        amount REAL NOT NULL,
        category_id INTEGER,
        account_id INTEGER,
        due_day INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        is_priority INTEGER DEFAULT 0,
        icon TEXT DEFAULT '📋',
        color TEXT DEFAULT '#10b981',
        notes TEXT,
        repeat_months INTEGER DEFAULT 0,
        start_installment INTEGER DEFAULT 1,
        competence_offset INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        category_id INTEGER,
        recurring_item_id INTEGER,
        type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
        amount REAL NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        payment_date TEXT,
        penalty_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        is_paid INTEGER DEFAULT 1,
        is_avulso INTEGER DEFAULT 0,
        notes TEXT,
        position INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(account_id) REFERENCES accounts(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(recurring_item_id) REFERENCES recurring_items(id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount REAL NOT NULL,
        UNIQUE(user_id, category_id, month, year),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline TEXT,
        color TEXT DEFAULT '#10b981',
        icon TEXT DEFAULT '🎯',
        is_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS goal_deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        note TEXT,
        date TEXT DEFAULT (date('now')),
        FOREIGN KEY(goal_id) REFERENCES goals(id)
      );

      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id INTEGER PRIMARY KEY,
        can_view_all INTEGER DEFAULT 0,
        can_edit_all INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS server_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    // Auto-migrations for bank sub-limits, credit products and PIX codes
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN overdraft_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN banricompras_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN credit_minuto_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare("ALTER TABLE transactions ADD COLUMN credit_product TEXT DEFAULT 'normal'").run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE transactions ADD COLUMN due_date TEXT').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE transactions ADD COLUMN pix_code TEXT').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE recurring_items ADD COLUMN pix_code TEXT').run(); } catch(e) {}
    try { this.db.prepare("ALTER TABLE accounts ADD COLUMN benefit_type TEXT DEFAULT 'va'").run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN benefit_monthly_credit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN benefit_credit_day INTEGER DEFAULT 1').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN card_last_digits TEXT').run(); } catch(e) {}
    // ── AUTO-MIGRATIONS FOR SMART SYNC & DEDUPLICATION ──
    const syncTables = ['transactions', 'recurring_items', 'accounts', 'categories', 'budgets', 'goals'];
    for (const table of syncTables) {
      try { this.db.prepare(`ALTER TABLE ${table} ADD COLUMN sync_id TEXT`).run(); } catch(e) {}
      try { this.db.prepare(`ALTER TABLE ${table} ADD COLUMN updated_at TEXT`).run(); } catch(e) {}
      try { this.db.prepare(`ALTER TABLE ${table} ADD COLUMN is_deleted INTEGER DEFAULT 0`).run(); } catch(e) {}
      try { this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_${table}_sync_id ON ${table}(sync_id)`).run(); } catch(e) {}
    }

    // Backfill sync_id and updated_at for existing records
    for (const table of syncTables) {
      try {
        this.db.prepare(`UPDATE ${table} SET updated_at = datetime('now') WHERE updated_at IS NULL`).run();
      } catch(e) {}
      try {
        const rowsWithoutSyncId = this.db.prepare(`SELECT id FROM ${table} WHERE sync_id IS NULL OR sync_id = ''`).all();
        if (rowsWithoutSyncId && rowsWithoutSyncId.length > 0) {
          const updateStmt = this.db.prepare(`UPDATE ${table} SET sync_id = ?, updated_at = datetime('now') WHERE id = ?`);
          const runBackfill = this.db.transaction((rows) => {
            for (const r of rows) {
              updateStmt.run(crypto.randomUUID(), r.id);
            }
          });
          runBackfill(rowsWithoutSyncId);
        }
      } catch(e) {}
    }

    // Table for tracking sync conflicts & suspect duplicate reconciliation
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        primary_tx_id INTEGER,
        duplicate_tx_id INTEGER,
        incoming_sync_id TEXT,
        similarity_score REAL DEFAULT 0,
        status TEXT DEFAULT 'pending', -- 'pending', 'merged', 'dismissed'
        details JSON,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_family ON sync_conflicts(family_id, status);
    `);
  }

  seedDefaultData() {
    const defaults = [
      { name: 'Salário', type: 'income', color: '#10b981', icon: '💼' },
      { name: 'Freelance', type: 'income', color: '#3b82f6', icon: '💻' },
      { name: 'Investimentos', type: 'income', color: '#8b5cf6', icon: '📈' },
      { name: 'Aluguel Recebido', type: 'income', color: '#06b6d4', icon: '🏘️' },
      { name: 'Outros (Receita)', type: 'income', color: '#14b8a6', icon: '💰' },
      { name: 'Moradia', type: 'expense', color: '#f59e0b', icon: '🏠' },
      { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: '🍽️' },
      { name: 'Transporte', type: 'expense', color: '#f97316', icon: '🚗' },
      { name: 'Saúde', type: 'expense', color: '#ec4899', icon: '❤️' },
      { name: 'Educação', type: 'expense', color: '#6366f1', icon: '📚' },
      { name: 'Lazer', type: 'expense', color: '#14b8a6', icon: '🎮' },
      { name: 'Vestuário', type: 'expense', color: '#a855f7', icon: '👔' },
      { name: 'Assinaturas', type: 'expense', color: '#0ea5e9', icon: '📱' },
      { name: 'Serviços', type: 'expense', color: '#84cc16', icon: '🔧' },
      { name: 'Outros (Despesa)', type: 'expense', color: '#64748b', icon: '📋' },
    ];
    
    const checkExist = this.db.prepare('SELECT id FROM categories WHERE name = ? AND type = ?');
    const insert = this.db.prepare(`INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES (NULL, ?, ?, ?, ?, 1)`);
    
    defaults.forEach(c => {
      const exists = checkExist.get(c.name, c.type);
      if (!exists) {
        insert.run(c.name, c.type, c.color, c.icon);
      }
    });

    // 1. Ensure Global Admin Master user 'adm' exists
    try {
      const hasGlobalAdmin = this.db.prepare("SELECT id FROM users WHERE is_system_admin = 1 OR username = 'adm'").get();
      if (!hasGlobalAdmin) {
        console.log('[Seed] Criando perfil Administrador Global Master ("adm")...');
        const hash = bcrypt.hashSync('adm', 10);
        let masterFam = this.db.prepare("SELECT id FROM families WHERE id = 1").get();
        if (!masterFam) {
          const rFam = this.db.prepare("INSERT INTO families (name, quota_users, quota_accounts) VALUES ('Família Mestra', 10, 50)").run();
          masterFam = { id: rFam.lastInsertRowid };
        }
        const rUser = this.db.prepare(`
          INSERT INTO users (name, first_name, last_name, username, password_hash, avatar_color, family_id, profile_type, is_system_admin)
          VALUES ('Administrador Global Master', 'Administrador', 'Global', 'adm', ?, '#8b5cf6', ?, 1, 1)
        `).run(hash, masterFam.id);
        const userId = rUser.lastInsertRowid;
        this.db.prepare(`
          INSERT OR IGNORE INTO user_permissions (
            user_id, can_view_all, can_edit_all,
            allow_dashboard, allow_recurring, allow_accounts, allow_budget, allow_goals, allow_reports
          ) VALUES (?, 1, 1, 1, 1, 1, 1, 1, 1)
        `).run(userId);
      }
    } catch (err) {
      console.error('Erro ao verificar/criar Administrador Global Master:', err);
    }

    // 2. Expand quota_accounts to 50 for all families to prevent credit card / voucher blocks
    try {
      this.db.prepare("UPDATE families SET quota_accounts = 50 WHERE quota_accounts < 50").run();
    } catch (e) {}
  }

  generateMonthlyRecurrences(month, year) {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth() + 1;
    const targetYear = year !== undefined ? year : now.getFullYear();
    const m = String(targetMonth).padStart(2, '0');
    const y = String(targetYear);

    const activeItems = this.db.prepare(`
      SELECT ri.* FROM recurring_items ri WHERE ri.is_active = 1
    `).all();

    const generate = this.db.transaction(() => {
      for (const item of activeItems) {
        if (!item.account_id) {
          console.warn(`[Recorrência] Pulando item "${item.name}" (ID ${item.id}) pois não possui conta associada.`);
          continue;
        }
        let createdYear, createdMonth;
        if (item.created_at) {
          const parts = item.created_at.split('-');
          createdYear = parseInt(parts[0], 10);
          createdMonth = parseInt(parts[1], 10);
        } else {
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }
        const monthsDiff = (targetYear - createdYear) * 12 + (targetMonth - createdMonth);

        // 1. Cannot be active before creation/start month
        if (monthsDiff < 0) {
          continue;
        }

        // Count skipped/soft-deleted transactions between created_at and target month to subtract them
        const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
        const targetMonthStart = `${y}-${m}-01`;
        let skippedCount = 0;
        if (createdAtStart < targetMonthStart) {
          skippedCount = this.db.prepare(`
            SELECT COUNT(*) as c FROM transactions 
            WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
          `).get(item.id, createdAtStart, targetMonthStart).c;
        }

        const startInstallment = item.start_installment || 1;
        const currentInstallment = monthsDiff + startInstallment - skippedCount;

        // 2. Check if item has a limited repetitions count and has expired
        if (item.repeat_months && item.repeat_months > 0) {
          if (currentInstallment > item.repeat_months) {
            continue;
          }
        }

        // Check if already generated this month
        const exists = this.db.prepare(`
          SELECT id, description, is_paid, is_avulso FROM transactions
          WHERE recurring_item_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
        `).get(item.id, m, y);

        // Calculate competence_date based on competence_offset
        const offset = item.competence_offset || 0;
        let compMonth = targetMonth + offset;
        let compYear = targetYear + Math.floor((compMonth - 1) / 12);
        compMonth = ((compMonth - 1) % 12 + 12) % 12 + 1;
        const compDateStr = `${compYear}-${String(compMonth).padStart(2, '0')}-01`;

        if (!exists) {
          const day = Math.min(item.due_day, new Date(targetYear, targetMonth, 0).getDate());
          const dateStr = `${y}-${m}-${String(day).padStart(2, '0')}`;
          
          const installmentSuffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const finalDescription = item.name + installmentSuffix;

          this.db.prepare(`
            INSERT INTO transactions (user_id, account_id, category_id, recurring_item_id, type, amount, description, date, competence_date, is_paid, is_avulso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
          `).run(item.user_id, item.account_id, item.category_id, item.id, item.type, item.amount, finalDescription, dateStr, compDateStr);
        } else if (exists.is_paid === 0 && exists.is_avulso !== 2) {
          // Self-Healing: If transaction exists but is unpaid and active, ensure description and competence_date are corrected
          const installmentSuffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const finalDescription = item.name + installmentSuffix;

          this.db.prepare(`
            UPDATE transactions SET description = ?, competence_date = COALESCE(competence_date, ?) WHERE id = ?
          `).run(finalDescription, compDateStr, exists.id);
        }
      }
    });
    generate();
  }

}

module.exports = { DbCore, getCardBillingCycle };
