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

class AppDatabase {
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

    // Auto-migrations for bank sub-limits and transaction credit products
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN overdraft_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN banricompras_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE accounts ADD COLUMN credit_minuto_limit REAL DEFAULT 0').run(); } catch(e) {}
    try { this.db.prepare("ALTER TABLE transactions ADD COLUMN credit_product TEXT DEFAULT 'normal'").run(); } catch(e) {}
    try { this.db.prepare('ALTER TABLE transactions ADD COLUMN due_date TEXT').run(); } catch(e) {}
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


  // ── AUTH ──────────────────────────────────────────────────────
  login(username, password) {
    const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return { success: false, error: 'Senha incorreta' };
    const { password_hash, ...safeUser } = user;
    if (safeUser.cpf) {
      safeUser.cpf = decryptField(safeUser.cpf);
    }
    this.logEvent('auth:login', `Usuário ${username} fez login.`, user.family_id);
    return { success: true, user: safeUser };
  }

  register(name, username, password, familyName = null, familyId = null, quota_users = 6, quota_accounts = 10) {
    let data = {};
    if (name && typeof name === 'object') {
      data = name;
    } else {
      data = { name, username, password, familyName, familyId, quota_users, quota_accounts };
    }

    const {
      name: finalName,
      username: finalUsername,
      password: finalPassword,
      familyName: finalFamilyNameOpt = null,
      familyId: finalFamilyIdOpt = null,
      quota_users: finalQuotaUsers = 6,
      quota_accounts: finalQuotaAccounts = 10,
      first_name = null,
      last_name = null,
      email = null,
      phone = null,
      cpf = null,
      birth_date = null,
      recovery_question = null,
      recovery_answer = null,
      accepted_terms_timestamp = null,
      accepted_terms_version = 0
    } = data;

    // Validate username regex: only lowercase letters, numbers, dot, dash, underscore
    const usernameRegex = /^[a-z0-9_.-]+$/;
    if (!usernameRegex.test(finalUsername)) {
      return { success: false, error: 'O nome de usuário deve conter apenas letras minúsculas, números, pontos, traços ou underscores' };
    }

    const existing = this.db.prepare('SELECT id FROM users WHERE username = ?').get(finalUsername);
    if (existing) return { success: false, error: 'Usuário já existe' };
    
    const hash = bcrypt.hashSync(finalPassword, 10);
    const colors = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    let finalFamilyId = finalFamilyIdOpt;
    let profileType = finalFamilyIdOpt ? 3 : 2; // Se adicionado à família, padrão Primogênito (3), senão Responsável (2)
    
    let nameToSave = finalName;
    if (!nameToSave && first_name) {
      nameToSave = `${first_name} ${last_name || ''}`.trim();
    }
    let firstNameToSave = first_name;
    let lastNameToSave = last_name;
    if (!firstNameToSave && nameToSave) {
      const parts = nameToSave.trim().split(/\s+/);
      firstNameToSave = parts[0];
      lastNameToSave = parts.slice(1).join(' ') || '';
    }
    
    let finalFamilyName = '';
    if (!finalFamilyId) {
      try {
        if (finalFamilyNameOpt && finalFamilyNameOpt.trim() !== '') {
          finalFamilyName = `${finalFamilyNameOpt.trim()}_${nameToSave}`;
        } else {
          finalFamilyName = `Família ${nameToSave}`;
        }
        const famRes = this.db.prepare("INSERT INTO families (name, quota_users, quota_accounts) VALUES (?, ?, ?)").run(
          finalFamilyName,
          finalQuotaUsers || 6,
          finalQuotaAccounts || 10
        );
        finalFamilyId = famRes.lastInsertRowid;
      } catch (err) {
        console.error('Error creating family during registration:', err);
        return { success: false, error: 'Erro ao criar família' };
      }
    }

    if (finalFamilyId) {
      const fam = this.db.prepare("SELECT quota_users FROM families WHERE id = ?").get(finalFamilyId);
      if (fam) {
        const currentUsers = this.db.prepare("SELECT COUNT(*) as count FROM users WHERE family_id = ?").get(finalFamilyId).count;
        if (currentUsers >= fam.quota_users) {
          return { success: false, error: `Quota de perfis excedida para esta família (Máximo: ${fam.quota_users}). Fale com o administrador!` };
        }
      }
    }

    const finalRecoveryAnswer = recovery_answer ? bcrypt.hashSync(recovery_answer.trim().toLowerCase(), 10) : null;
    const encryptedCpf = cpf ? encryptField(cpf) : null;

    const result = this.db.prepare(`
      INSERT INTO users (name, first_name, last_name, email, phone, cpf, birth_date, username, password_hash, avatar_color, family_id, profile_type, recovery_question, recovery_answer, accepted_terms_timestamp, accepted_terms_version) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nameToSave, firstNameToSave, lastNameToSave, email, phone, encryptedCpf, birth_date, finalUsername, hash, color, finalFamilyId, profileType, recovery_question, finalRecoveryAnswer, accepted_terms_timestamp, accepted_terms_version);
    
    const userId = result.lastInsertRowid;
    
    // Seed default settings
    this.db.prepare(`INSERT OR IGNORE INTO app_settings (user_id, key, value) VALUES (?, 'alert_days_before', '3')`).run(userId);
    
    // Seed default permissions: Responsável (tipo 2) recebe tudo (1). Filhos começam com 0 em administração e 1 nos menus
    const canAll = profileType === 2 ? 1 : 0;
    this.db.prepare(`
      INSERT OR IGNORE INTO user_permissions (
        user_id, can_view_all, can_edit_all,
        allow_dashboard, allow_recurring, allow_accounts, allow_budget, allow_goals, allow_reports
      ) VALUES (?, ?, ?, 1, 1, 1, 1, 1, 1)
    `).run(userId, canAll, canAll);
    
    if (finalFamilyNameOpt || !finalFamilyIdOpt) {
      this.logEvent('auth:register', `Nova família criada: ${finalFamilyName} com o usuário ${finalUsername}.`, finalFamilyId);
    } else {
      this.logEvent('auth:register', `Novo membro ${finalUsername} adicionado à família ID ${finalFamilyId}.`, finalFamilyId);
    }

    return { success: true, userId };
  }

  getUsers(filters = {}) {
    const familyId = filters && typeof filters === 'object' ? filters.familyId : filters;
    if (!familyId) {
      throw new Error('familyId é obrigatório para listar usuários');
    }
    const users = this.db.prepare('SELECT id, name, first_name, last_name, email, phone, cpf, birth_date, username, avatar_color, avatar_image, family_id, profile_type, position, is_system_admin FROM users WHERE family_id = ? ORDER BY position ASC, id ASC').all(familyId);
    return users.map(u => {
      if (u.cpf) u.cpf = decryptField(u.cpf);
      return u;
    });
  }

  updateUser(data) {
    const { id, name, username, password, avatar_image, profile_type, first_name, last_name, email, phone, cpf, birth_date, recovery_question, recovery_answer } = data;
    
    // Validate username regex: only lowercase letters, numbers, dot, dash, underscore
    const usernameRegex = /^[a-z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      return { success: false, error: 'O nome de usuário deve conter apenas letras minúsculas, números, pontos, traços ou underscores' };
    }

    // Check if username is taken by another user
    const existing = this.db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
    if (existing) {
      return { success: false, error: 'Nome de usuário já está em uso' };
    }

    // Get current user to protect adm and preserve existing role
    const currentUser = this.db.prepare('SELECT username, profile_type FROM users WHERE id = ?').get(id);
    const isAdm = currentUser && currentUser.username === 'adm';
    const finalProfileType = isAdm ? 1 : (profile_type !== undefined ? profile_type : (currentUser ? currentUser.profile_type : 2));

    let nameToSave = name;
    let firstNameToSave = first_name;
    let lastNameToSave = last_name;

    if (firstNameToSave !== undefined || lastNameToSave !== undefined) {
      const cur = this.db.prepare('SELECT name, first_name, last_name FROM users WHERE id = ?').get(id);
      const f = firstNameToSave !== undefined ? firstNameToSave : (cur ? cur.first_name : '');
      const l = lastNameToSave !== undefined ? lastNameToSave : (cur ? cur.last_name : '');
      nameToSave = `${f || ''} ${l || ''}`.trim() || name || (cur ? cur.name : '');
    } else if (nameToSave) {
      const parts = nameToSave.trim().split(/\s+/);
      firstNameToSave = parts[0];
      lastNameToSave = parts.slice(1).join(' ') || '';
    }

    try {
      const cur = this.db.prepare('SELECT first_name, last_name, email, phone, cpf, birth_date, avatar_image, recovery_question, recovery_answer FROM users WHERE id = ?').get(id);
      
      const fName = firstNameToSave !== undefined ? firstNameToSave : (cur ? cur.first_name : null);
      const lName = lastNameToSave !== undefined ? lastNameToSave : (cur ? cur.last_name : null);
      const mail = email !== undefined ? email : (cur ? cur.email : null);
      const ph = phone !== undefined ? phone : (cur ? cur.phone : null);
      
      let cp = null;
      if (cpf !== undefined) {
        cp = cpf ? encryptField(cpf) : null;
      } else if (cur && cur.cpf) {
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        if (!base64Regex.test(cur.cpf) || cur.cpf.length < 28) {
          cp = encryptField(cur.cpf);
        } else {
          cp = cur.cpf;
        }
      }
      
      const bDate = birth_date !== undefined ? birth_date : (cur ? cur.birth_date : null);
      const avImg = avatar_image !== undefined ? avatar_image : (cur ? cur.avatar_image : null);
      const recQ = recovery_question !== undefined ? recovery_question : (cur ? cur.recovery_question : null);
      const recA = recovery_answer !== undefined ? (recovery_answer ? bcrypt.hashSync(recovery_answer.trim().toLowerCase(), 10) : null) : (cur ? cur.recovery_answer : null);

      if (password && password.trim() !== '') {
        const hash = bcrypt.hashSync(password, 10);
        this.db.prepare(`
          UPDATE users 
          SET name = ?, first_name = ?, last_name = ?, email = ?, phone = ?, cpf = ?, birth_date = ?, username = ?, password_hash = ?, avatar_image = ?, profile_type = ?, recovery_question = ?, recovery_answer = ?
          WHERE id = ?
        `).run(nameToSave, fName, lName, mail, ph, cp, bDate, username, hash, avImg, finalProfileType, recQ, recA, id);
      } else {
        this.db.prepare(`
          UPDATE users 
          SET name = ?, first_name = ?, last_name = ?, email = ?, phone = ?, cpf = ?, birth_date = ?, username = ?, avatar_image = ?, profile_type = ?, recovery_question = ?, recovery_answer = ?
          WHERE id = ?
        `).run(nameToSave, fName, lName, mail, ph, cp, bDate, username, avImg, finalProfileType, recQ, recA, id);
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: err.message };
    }
  }

  deleteUserAccount(userId) {
    try {
      const transaction = this.db.transaction(() => {
        // 1. Delete transactions
        this.db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
        // 2. Delete budgets
        this.db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
        // 3. Delete goals
        this.db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);
        // 4. Delete categories
        this.db.prepare('DELETE FROM categories WHERE user_id = ?').run(userId);
        // 5. Delete accounts
        this.db.prepare('DELETE FROM accounts WHERE user_id = ?').run(userId);
        // 6. Delete user permissions
        this.db.prepare('DELETE FROM user_permissions WHERE user_id = ?').run(userId);
        // 7. Delete settings
        this.db.prepare('DELETE FROM app_settings WHERE user_id = ?').run(userId);
        // 8. Delete user
        this.db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      });
      transaction();
      return { success: true };
    } catch (err) {
      console.error('Error deleting user account:', err);
      return { success: false, error: err.message };
    }
  }

  updateUserPositions(positions) {
    try {
      const stmt = this.db.prepare('UPDATE users SET position = ? WHERE id = ?');
      const update = this.db.transaction((list) => {
        for (const item of list) {
          stmt.run(item.position, item.id);
        }
      });
      update(positions);
      return { success: true };
    } catch (err) {
      console.error('Error updating user positions:', err);
      return { success: false, error: err.message };
    }
  }

  deleteUser(userId) {
    const user = this.db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
    if (user && user.username === 'adm') {
      return { success: false, error: 'O usuário administrador principal (adm) não pode ser excluído.' };
    }

    try {
      this.db.transaction(() => {
        // 1. Delete user permissions
        this.db.prepare('DELETE FROM user_permissions WHERE user_id = ?').run(userId);
        
        // 2. Delete app settings
        this.db.prepare('DELETE FROM app_settings WHERE user_id = ?').run(userId);

        // 3. Delete goal deposits related to user's goals
        this.db.prepare(`
          DELETE FROM goal_deposits 
          WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)
        `).run(userId);
        
        // 4. Delete goals
        this.db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);

        // 5. Delete budgets
        this.db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);

        // 6. Delete transactions
        this.db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);

        // 7. Delete recurring items
        this.db.prepare('DELETE FROM recurring_items WHERE user_id = ?').run(userId);

        // 8. Delete accounts
        this.db.prepare('DELETE FROM accounts WHERE user_id = ?').run(userId);

        // 9. Delete user
        this.db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      })();
      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { success: false, error: err.message };
    }
  }

  // ── PERMISSIONS ───────────────────────────────────────────────
  getUserPermissions(userId) {
    const perm = this.db.prepare('SELECT * FROM user_permissions WHERE user_id = ?').get(userId);
    if (!perm) {
      return {
        can_view_all: 0,
        can_edit_all: 0,
        allow_dashboard: 1,
        allow_recurring: 1,
        allow_accounts: 1,
        allow_budget: 1,
        allow_goals: 1,
        allow_reports: 1
      };
    }
    return {
      can_view_all: perm.can_view_all ?? 0,
      can_edit_all: perm.can_edit_all ?? 0,
      allow_dashboard: perm.allow_dashboard ?? 1,
      allow_recurring: perm.allow_recurring ?? 1,
      allow_accounts: perm.allow_accounts ?? 1,
      allow_budget: perm.allow_budget ?? 1,
      allow_goals: perm.allow_goals ?? 1,
      allow_reports: perm.allow_reports ?? 1
    };
  }

  checkTransactionFamily(idPayload, familyId) {
    if (!idPayload) return true;
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) id = idPayload.id || idPayload.txId;
    id = parseInt(id);
    if (!id || isNaN(id)) return true;
    const t = this.db.prepare('SELECT t.id, u.family_id FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(id);
    return !t || !t.family_id || t.family_id === familyId;
  }

  checkAccountFamily(idPayload, familyId) {
    if (!idPayload) return true;
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) id = idPayload.id || idPayload.accountId;
    id = parseInt(id);
    if (!id || isNaN(id)) return true;
    const a = this.db.prepare('SELECT a.id, u.family_id FROM accounts a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?').get(id);
    return !a || !a.family_id || a.family_id === familyId;
  }

  checkCategoryFamily(idPayload, familyId) {
    if (!idPayload) return true;
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) id = idPayload.id || idPayload.categoryId;
    id = parseInt(id);
    if (!id || isNaN(id)) return true;
    const c = this.db.prepare('SELECT c.id, u.family_id FROM categories c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?').get(id);
    return !c || !c.family_id || c.family_id === familyId;
  }

  checkRecurringFamily(idPayload, familyId) {
    if (!idPayload) return true;
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) id = idPayload.id || idPayload.itemId;
    id = parseInt(id);
    if (!id || isNaN(id)) return true;
    const r = this.db.prepare('SELECT ri.id, u.family_id FROM recurring_items ri LEFT JOIN users u ON ri.user_id = u.id WHERE ri.id = ?').get(id);
    return !r || !r.family_id || r.family_id === familyId;
  }

  checkGoalFamily(idPayload, familyId) {
    if (!idPayload) return true;
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) id = idPayload.id || idPayload.goalId;
    id = parseInt(id);
    if (!id || isNaN(id)) return true;
    const g = this.db.prepare('SELECT g.id, u.family_id FROM goals g LEFT JOIN users u ON g.user_id = u.id WHERE g.id = ?').get(id);
    return !g || !g.family_id || g.family_id === familyId;
  }

  updateUserPermissions(data) {
    const {
      targetUserId,
      can_view_all,
      can_edit_all,
      allow_dashboard,
      allow_recurring,
      allow_accounts,
      allow_budget,
      allow_goals,
      allow_reports
    } = data;

    this.db.prepare(`
      INSERT INTO user_permissions (
        user_id, can_view_all, can_edit_all, 
        allow_dashboard, allow_recurring, allow_accounts, allow_budget, allow_goals, allow_reports
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET 
        can_view_all = ?, 
        can_edit_all = ?,
        allow_dashboard = ?,
        allow_recurring = ?,
        allow_accounts = ?,
        allow_budget = ?,
        allow_goals = ?,
        allow_reports = ?
    `).run(
      targetUserId, can_view_all, can_edit_all, 
      allow_dashboard, allow_recurring, allow_accounts, allow_budget, allow_goals, allow_reports,
      can_view_all, can_edit_all, 
      allow_dashboard, allow_recurring, allow_accounts, allow_budget, allow_goals, allow_reports
    );
    return { success: true };
  }

  // ── SETTINGS ──────────────────────────────────────────────────
  getSettings(userId) {
    const rows = this.db.prepare('SELECT key, value FROM app_settings WHERE user_id = ?').all(userId);
    const settings = { alert_days_before: 3 };
    rows.forEach(r => { settings[r.key] = isNaN(r.value) ? r.value : Number(r.value); });
    return settings;
  }

  setSetting(userId, key, value) {
    this.db.prepare(`INSERT INTO app_settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = ?`).run(userId, key, String(value), String(value));
    return { success: true };
  }

  // ── ACCOUNTS ─────────────────────────────────────────────────
  getAccounts(userId) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    let accounts = [];
    if (profileType === 1) {
      // ADM Geral
      accounts = this.db.prepare(`
        SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
        FROM accounts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.is_active = 1
        ORDER BY a.type, a.name
      `).all();
    } else {
      const perm = this.getUserPermissions(userId);
      if (perm.can_view_all === 1) {
        accounts = this.db.prepare(`
          SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
          FROM accounts a
          LEFT JOIN users u ON a.user_id = u.id
          WHERE a.is_active = 1 AND u.family_id = ?
          ORDER BY a.type, a.name
        `).all(familyId);
      } else {
        accounts = this.db.prepare(`
          SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
          FROM accounts a
          LEFT JOIN users u ON a.user_id = u.id
          WHERE a.is_active = 1 AND a.user_id = ?
          ORDER BY a.type, a.name
        `).all(userId);
      }
    }

    return accounts.map(acc => {
      let banricompras_used = 0;
      try {
        banricompras_used = this.db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE account_id = ? AND credit_product = 'banricompras' AND is_paid = 0
        `).get(acc.id).total;
      } catch (e) { banricompras_used = 0; }

      const banricompras_available = Math.max(0, (acc.banricompras_limit || 0) - banricompras_used);
      const available_balance = (acc.balance || 0) + (acc.overdraft_limit || 0);

      let credit_used = 0;
      if (acc.type === 'credit') {
        try {
          // 1. Transações de despesas pendentes no cartão de crédito
          const pendingTxTotal = this.db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE account_id = ? AND type = 'expense' AND is_paid = 0 AND is_avulso != 2
          `).get(acc.id).total;

          // 2. Itens de despesas recorrentes/planejamento ativos vinculados ao cartão que ainda não viraram transação no mês
          const now = new Date();
          const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
          const currentYear = String(now.getFullYear());

          const pendingRecurringTotal = this.db.prepare(`
            SELECT COALESCE(SUM(ri.amount), 0) as total
            FROM recurring_items ri
            WHERE ri.account_id = ? AND ri.type = 'expense' AND ri.is_active = 1
            AND NOT EXISTS (
              SELECT 1 FROM transactions t
              WHERE t.recurring_item_id = ri.id
              AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
            )
          `).get(acc.id, currentMonth, currentYear).total;

          // 3. Saldo devedor pré-existente
          const negativeBalance = acc.balance < 0 ? -acc.balance : 0;

          credit_used = pendingTxTotal + pendingRecurringTotal + negativeBalance;
        } catch (err) {
          credit_used = acc.balance < 0 ? -acc.balance : 0;
        }
      }

      return {
        ...acc,
        credit_used,
        banricompras_used,
        banricompras_available,
        available_balance
      };
    });
  }

  createAccount(data) {
    const { user_id } = data;
    const user = this.db.prepare("SELECT family_id FROM users WHERE id = ?").get(user_id);
    if (user && user.family_id) {
      const fam = this.db.prepare("SELECT quota_accounts FROM families WHERE id = ?").get(user.family_id);
      if (fam) {
        const currentAccounts = this.db.prepare("SELECT COUNT(*) as count FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.family_id = ? AND a.is_active = 1").get(user.family_id).count;
        if (currentAccounts >= fam.quota_accounts) {
          throw new Error(`Quota de contas excedida para esta família (Máximo: ${fam.quota_accounts}). Fale com o administrador!`);
        }
      }
    }

    const payload = {
      credit_limit: null,
      closing_day: null,
      due_day: null,
      agency: null,
      account_number: null,
      overdraft_limit: 0,
      banricompras_limit: 0,
      credit_minuto_limit: 0,
      benefit_type: 'va',
      benefit_monthly_credit: 0,
      benefit_credit_day: 1,
      card_last_digits: null,
      ...data
    };

    const r = this.db.prepare(`
      INSERT INTO accounts (user_id, name, type, bank, balance, color, credit_limit, closing_day, due_day, agency, account_number, overdraft_limit, banricompras_limit, credit_minuto_limit, benefit_type, benefit_monthly_credit, benefit_credit_day, card_last_digits)
      VALUES (@user_id, @name, @type, @bank, @balance, @color, @credit_limit, @closing_day, @due_day, @agency, @account_number, @overdraft_limit, @banricompras_limit, @credit_minuto_limit, @benefit_type, @benefit_monthly_credit, @benefit_credit_day, @card_last_digits)
    `).run(payload);
    const familyId = user ? user.family_id : null;
    this.logEvent('account:create', `Conta bancária "${data.name}" criada (Saldo inicial: R$ ${data.balance || 0}).`, familyId);
    return { success: true, id: r.lastInsertRowid };
  }

  updateAccount(data) {
    const payload = {
      credit_limit: null,
      closing_day: null,
      due_day: null,
      agency: null,
      account_number: null,
      overdraft_limit: 0,
      banricompras_limit: 0,
      credit_minuto_limit: 0,
      benefit_type: 'va',
      benefit_monthly_credit: 0,
      benefit_credit_day: 1,
      card_last_digits: null,
      ...data
    };
    this.db.prepare(`
      UPDATE accounts SET user_id=@user_id, name=@name, type=@type, bank=@bank, balance=@balance, color=@color,
      credit_limit=@credit_limit, closing_day=@closing_day, due_day=@due_day,
      agency=@agency, account_number=@account_number,
      overdraft_limit=@overdraft_limit, banricompras_limit=@banricompras_limit, credit_minuto_limit=@credit_minuto_limit,
      benefit_type=@benefit_type, benefit_monthly_credit=@benefit_monthly_credit, benefit_credit_day=@benefit_credit_day, card_last_digits=@card_last_digits
      WHERE id=@id
    `).run(payload);
    return { success: true };
  }

  deleteAccount(id) {
    const acc = this.db.prepare('SELECT a.name, u.family_id FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = ?').get(id);
    this.db.prepare('UPDATE accounts SET is_active = 0 WHERE id = ?').run(id);
    if (acc) {
      this.logEvent('account:delete', `Conta bancária "${acc.name}" foi arquivada.`, acc.family_id);
    }
    return { success: true };
  }

  transferBetweenAccounts({ from_account_id, to_account_id, amount, date, description, user_id }) {
    const t = this.db.transaction(() => {
      this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, from_account_id);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, to_account_id);
      this.db.prepare(`INSERT INTO transactions (user_id, account_id, type, amount, description, date, is_paid, is_avulso) VALUES (?, ?, 'transfer', ?, ?, ?, 1, 1)`).run(user_id, from_account_id, amount, description || 'Transferência', date);
    });
    t();
    return { success: true };
  }

  // ── CATEGORIES ───────────────────────────────────────────────
  getCategories(userId) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`SELECT * FROM categories ORDER BY type, name`).all();
    }

    const perm = this.getUserPermissions(userId);
    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT c.* FROM categories c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.user_id IS NULL OR u.family_id = ?
        ORDER BY c.type, c.name
      `).all(familyId);
    } else {
      return this.db.prepare(`SELECT * FROM categories WHERE (user_id = ? OR user_id IS NULL) ORDER BY type, name`).all(userId);
    }
  }

  createCategory(data) {
    const existing = this.db.prepare(`
      SELECT id FROM categories 
      WHERE lower(trim(name)) = lower(trim(?)) 
      AND (type = ? OR type = 'both' OR ? = 'both')
      AND (user_id = ? OR user_id IS NULL)
    `).get(data.name, data.type, data.type, data.user_id);
    if (existing) {
      return { success: false, error: `Já existe uma categoria com o nome "${data.name}".` };
    }
    const r = this.db.prepare(`INSERT INTO categories (user_id, name, type, color, icon) VALUES (@user_id, @name, @type, @color, @icon)`).run(data);
    return { success: true, id: r.lastInsertRowid };
  }

  updateCategory(data) {
    this.db.prepare(`UPDATE categories SET name=@name, type=@type, color=@color, icon=@icon WHERE id=@id`).run(data);
    return { success: true };
  }

  deleteCategory(id) {
    this.db.prepare('DELETE FROM categories WHERE id = ? AND is_default = 0').run(id);
    return { success: true };
  }

  cleanDuplicateCategories() {
    try {
      // Find custom categories that match a default category by name and type
      const duplicates = this.db.prepare(`
        SELECT c_custom.id as custom_id, c_default.id as default_id, c_custom.name
        FROM categories c_custom
        JOIN categories c_default ON lower(trim(c_custom.name)) = lower(trim(c_default.name)) AND (c_custom.type = c_default.type OR c_custom.type = 'both' OR c_default.type = 'both')
        WHERE c_custom.is_default = 0 AND c_default.is_default = 1 AND c_custom.id != c_default.id
      `).all();

      if (duplicates.length > 0) {
        const cleanup = this.db.transaction(() => {
          for (const d of duplicates) {
            this.db.prepare('UPDATE transactions SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('UPDATE recurring_items SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('UPDATE OR IGNORE budgets SET category_id = ? WHERE category_id = ?').run(d.default_id, d.custom_id);
            this.db.prepare('DELETE FROM categories WHERE id = ?').run(d.custom_id);
          }
        });
        cleanup();
        console.log(`[Auto-Clean] Removidas ${duplicates.length} categorias duplicadas do banco.`);
      }
    } catch (e) {
      console.error('Erro na limpeza de categorias duplicadas:', e);
    }
  }

  // ── RECURRING ITEMS ──────────────────────────────────────────
  getRecurringItems(userId, type, month, year) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    let q = `
      SELECT ri.*, c.name as category_name, c.color as cat_color, c.icon as cat_icon,
             a.name as account_name, a.bank as account_bank, a.type as account_type
      FROM recurring_items ri
      LEFT JOIN categories c ON ri.category_id = c.id
      LEFT JOIN accounts a ON ri.account_id = a.id
      LEFT JOIN users u ON ri.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (profileType !== 1) {
      if (perm.can_view_all === 0) {
        q += ` AND ri.user_id = ?`;
        params.push(userId);
      } else {
        q += ` AND u.family_id = ?`;
        params.push(familyId);
      }
    }
    
    if (type) { q += ` AND ri.type = ?`; params.push(type); }
    q += ` ORDER BY ri.position ASC, ri.is_priority DESC, ri.due_day ASC, ri.name ASC`;
    
    const allItems = this.db.prepare(q).all(...params);
    
    if (month && year) {
      const targetMonth = month;
      const targetYear = year;
      const now = new Date();
      
      return allItems.filter(item => {
        // 0. Se possui transação pulada/postergada (is_avulso = 2) no mês alvo, não exibe neste mês
        const isSoftDeleted = this.db.prepare(`
          SELECT 1 FROM transactions t
          WHERE t.recurring_item_id = ? 
          AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          AND t.is_avulso = 2
        `).get(item.id, String(targetMonth).padStart(2, '0'), String(targetYear));
        
        if (isSoftDeleted) return false;

        // 1. Sempre exibe se já possuir transação física gerada no mês alvo (integridade histórica)
        const hasTx = this.db.prepare(`
          SELECT 1 FROM transactions t
          WHERE t.recurring_item_id = ? 
          AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          AND t.is_avulso = 0
        `).get(item.id, String(targetMonth).padStart(2, '0'), String(targetYear));
        
        if (hasTx) return true;
        
        // 2. Senão, avalia a vigência ativa do item
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
        
        // Não pode estar ativo antes de sua criação
        if (monthsDiff < 0) return false;
        
        // Count skipped/soft-deleted transactions between created_at and target month to subtract them
        const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
        const targetMonthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        let skippedCount = 0;
        if (createdAtStart < targetMonthStart) {
          skippedCount = this.db.prepare(`
            SELECT COUNT(*) as c FROM transactions 
            WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
          `).get(item.id, createdAtStart, targetMonthStart).c;
        }
        
        const startInstallment = item.start_installment || 1;
        const currentInstallment = monthsDiff + startInstallment - skippedCount;
        
        // Se tem limite de repetições, não pode estar ativo após expirar
        if (item.repeat_months && item.repeat_months > 0) {
          if (currentInstallment > item.repeat_months) {
            return false;
          }
        }
        
        // Só exibe se estiver ativo
        return item.is_active === 1;
      });
    }
    
    return allItems;
  }

  createRecurringItem(data) {
    const { is_paid, ...insertData } = data;
    if (!insertData.created_at) {
      insertData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    if (insertData.competence_offset === undefined || insertData.competence_offset === null) {
      insertData.competence_offset = 0;
    }
    const r = this.db.prepare(`
      INSERT INTO recurring_items (user_id, name, type, amount, category_id, account_id, due_day, is_priority, icon, color, notes, repeat_months, start_installment, competence_offset, created_at)
      VALUES (@user_id, @name, @type, @amount, @category_id, @account_id, @due_day, @is_priority, @icon, @color, @notes, @repeat_months, @start_installment, @competence_offset, @created_at)
    `).run(insertData);
    const newId = r.lastInsertRowid;

    // Immediately generate this and future/past relevant months if created_at specified
    let genMonth, genYear;
    if (insertData.created_at) {
      const parts = insertData.created_at.split('-');
      genYear = parseInt(parts[0], 10);
      genMonth = parseInt(parts[1], 10);
    }
    const now = new Date();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();

    if (genMonth && genYear) {
      let bM = genMonth;
      let bY = genYear;
      while (bY < currYear || (bY === currYear && bM <= currMonth)) {
        this.generateMonthlyRecurrences(bM, bY);
        bM++;
        if (bM > 12) { bM = 1; bY++; }
      }
    } else {
      this.generateMonthlyRecurrences(currMonth, currYear);
    }

    // If it's already marked as paid/received this month:
    if (is_paid) {
      const month = genMonth || currMonth;
      const year = genYear || currYear;
      const m = String(month).padStart(2, '0');
      const y = String(year);

      const tx = this.db.prepare(`
        SELECT id, date FROM transactions
        WHERE recurring_item_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `).get(newId, m, y);

      if (tx) {
        this.db.transaction(() => {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, data.account_id);
          this.db.prepare('UPDATE transactions SET is_paid = 1, payment_date = ? WHERE id = ?').run(tx.date, tx.id);
        })();
      }
    }
    return { success: true, id: newId };
  }


  updateRecurringItem(data) {
    const runUpdate = this.db.transaction(() => {
      const payload = {
        competence_offset: 0,
        ...data
      };
      this.db.prepare(`
        UPDATE recurring_items SET name=@name, type=@type, amount=@amount, category_id=@category_id,
        account_id=@account_id, due_day=@due_day, is_priority=@is_priority, icon=@icon, color=@color, notes=@notes, repeat_months=@repeat_months,
        start_installment=@start_installment,
        competence_offset=COALESCE(@competence_offset, competence_offset, 0),
        created_at=COALESCE(@created_at, created_at)
        WHERE id=@id
      `).run(payload);

      const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(data.id);
      if (!item) return;

      let createdYear, createdMonth;
      if (item.created_at) {
        const partsC = item.created_at.split('-');
        createdYear = parseInt(partsC[0], 10);
        createdMonth = parseInt(partsC[1], 10);
      } else {
        const now = new Date();
        createdYear = now.getFullYear();
        createdMonth = now.getMonth() + 1;
      }

      // Sync unpaid transactions
      const unpaidTxs = this.db.prepare('SELECT * FROM transactions WHERE recurring_item_id = ? AND is_paid = 0 AND is_avulso != 2').all(item.id);
      for (const t of unpaidTxs) {
        const parts = t.date.split('-');
        const txYear = parseInt(parts[0], 10);
        const txMonth = parseInt(parts[1], 10);

        const monthsDiff = (txYear - createdYear) * 12 + (txMonth - createdMonth);
        
        // Count skipped/soft-deleted transactions between created_at and this transaction's month to subtract them
        const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
        const targetMonthStart = `${parts[0]}-${parts[1]}-01`;
        let skippedCount = 0;
        if (createdAtStart < targetMonthStart) {
          skippedCount = this.db.prepare(`
            SELECT COUNT(*) as c FROM transactions 
            WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
          `).get(item.id, createdAtStart, targetMonthStart).c;
        }

        const startInstallment = item.start_installment || 1;
        const currentInstallment = monthsDiff + startInstallment - skippedCount;

        if (monthsDiff < 0 || (item.repeat_months > 0 && currentInstallment > item.repeat_months)) {
          this.db.prepare('DELETE FROM transactions WHERE id = ?').run(t.id);
        } else {
          const suffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const newDesc = item.name + suffix;

          // Reconstruct date using new due_day in case it changed
          const day = Math.min(item.due_day, new Date(txYear, txMonth, 0).getDate());
          const newDateStr = `${parts[0]}-${parts[1]}-${String(day).padStart(2, '0')}`;

          // Reconstruct competence_date
          const offset = item.competence_offset || 0;
          let compMonth = txMonth + offset;
          let compYear = txYear + Math.floor((compMonth - 1) / 12);
          compMonth = ((compMonth - 1) % 12 + 12) % 12 + 1;
          const compDateStr = `${compYear}-${String(compMonth).padStart(2, '0')}-01`;

          this.db.prepare(`
            UPDATE transactions 
            SET description = ?, amount = ?, date = ?, competence_date = ?
            WHERE id = ?
          `).run(newDesc, item.amount, newDateStr, compDateStr, t.id);
        }
      }
    });

    runUpdate();
    return { success: true };
  }

  deleteRecurringItem(id, fromDate) {
    this.db.transaction(() => {
      const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(id);
      if (item && fromDate) {
        let createdYear, createdMonth;
        if (item.created_at) {
          const parts = item.created_at.split('-');
          createdYear = parseInt(parts[0], 10);
          createdMonth = parseInt(parts[1], 10);
        } else {
          const now = new Date();
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }

        const partsDel = fromDate.split('-');
        const deleteYear = parseInt(partsDel[0], 10);
        const deleteMonth = parseInt(partsDel[1], 10);

        const monthsDiff = (deleteYear - createdYear) * 12 + (deleteMonth - createdMonth);

        if (monthsDiff > 0) {
          // Keep active = 1 but set repeat_months to monthsDiff to cancel future and preserve past
          this.db.prepare('UPDATE recurring_items SET repeat_months = ? WHERE id = ?').run(monthsDiff, id);
        } else {
          // Deactivating on start month or earlier - deactivate globally
          this.db.prepare('UPDATE recurring_items SET is_active = 0 WHERE id = ?').run(id);
        }
      } else {
        this.db.prepare('UPDATE recurring_items SET is_active = 0 WHERE id = ?').run(id);
      }

      if (fromDate) {
        const txsToDelete = this.db.prepare(`
          SELECT * FROM transactions 
          WHERE recurring_item_id = ? AND date >= ?
        `).all(id, fromDate);

        for (const t of txsToDelete) {
          if (t.is_paid && t.type !== 'transfer') {
            const d = t.type === 'income' ? -t.amount : t.amount;
            this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, t.account_id);
          }
        }

        this.db.prepare(`
          DELETE FROM transactions 
          WHERE recurring_item_id = ? AND date >= ?
        `).run(id, fromDate);
      }
    })();
    return { success: true };
  }

  postponeRecurringInstallment({ txId, itemId }) {
    const t = this.db.transaction(() => {
      const tx = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
      if (tx) {
        if (tx.is_paid && tx.type !== 'transfer') {
          const d = tx.type === 'income' ? -tx.amount : tx.amount;
          this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, tx.account_id);
        }
        // Soft-delete: mark is_avulso = 2 (invisible), amount = 0, is_paid = 0, description updated
        this.db.prepare(`
          UPDATE transactions 
          SET is_avulso = 2, amount = 0, is_paid = 0, description = '[POSTERGADA] ' || description
          WHERE id = ?
        `).run(txId);
      }

      const item = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(itemId);
      if (item && item.created_at) {
        // Push created_at (start month) forward by 1 month to prevent regeneration and shift subsequent numbering
        const parts = item.created_at.split('-');
        let year = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        const newCreatedAt = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
        this.db.prepare('UPDATE recurring_items SET created_at = ? WHERE id = ?').run(newCreatedAt, itemId);

        const updatedItem = this.db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(itemId);
        
        let createdYear, createdMonth;
        if (updatedItem.created_at) {
          const partsC = updatedItem.created_at.split('-');
          createdYear = parseInt(partsC[0], 10);
          createdMonth = parseInt(partsC[1], 10);
        } else {
          const now = new Date();
          createdYear = now.getFullYear();
          createdMonth = now.getMonth() + 1;
        }

        // Sync remaining unpaid transactions
        const unpaidTxs = this.db.prepare('SELECT * FROM transactions WHERE recurring_item_id = ? AND is_paid = 0 AND is_avulso != 2').all(itemId);
        for (const ut of unpaidTxs) {
          const parts = ut.date.split('-');
          const txYear = parseInt(parts[0], 10);
          const txMonth = parseInt(parts[1], 10);

          const monthsDiff = (txYear - createdYear) * 12 + (txMonth - createdMonth);

          // Count skipped/soft-deleted transactions between created_at and this transaction's month to subtract them
          const createdAtStart = `${createdYear}-${String(createdMonth).padStart(2, '0')}-01`;
          const targetMonthStart = `${parts[0]}-${parts[1]}-01`;
          let skippedCount = 0;
          if (createdAtStart < targetMonthStart) {
            skippedCount = this.db.prepare(`
              SELECT COUNT(*) as c FROM transactions 
              WHERE recurring_item_id = ? AND is_avulso = 2 AND date >= ? AND date < ?
            `).get(itemId, createdAtStart, targetMonthStart).c;
          }

          const startInstallment = updatedItem.start_installment || 1;
          const currentInstallment = monthsDiff + startInstallment - skippedCount;

          if (monthsDiff < 0 || (updatedItem.repeat_months > 0 && currentInstallment > updatedItem.repeat_months)) {
            this.db.prepare('DELETE FROM transactions WHERE id = ?').run(ut.id);
          } else {
            const suffix = updatedItem.repeat_months && updatedItem.repeat_months > 0
              ? ` ${currentInstallment}/${updatedItem.repeat_months}`
              : '';
            const newDesc = updatedItem.name + suffix;

            const day = Math.min(updatedItem.due_day, new Date(txYear, txMonth, 0).getDate());
            const newDateStr = `${parts[0]}-${parts[1]}-${String(day).padStart(2, '0')}`;

            this.db.prepare(`
              UPDATE transactions 
              SET description = ?, amount = ?, date = ?
              WHERE id = ?
            `).run(newDesc, updatedItem.amount, newDateStr, ut.id);
          }
        }
      }
    });

    t();
    return { success: true };
  }

  toggleRecurringPriority(id) {
    const item = this.db.prepare('SELECT is_priority FROM recurring_items WHERE id = ?').get(id);
    this.db.prepare('UPDATE recurring_items SET is_priority = ? WHERE id = ?').run(item.is_priority ? 0 : 1, id);
    return { success: true };
  }

  updateRecurringPositions(userId, positions) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const familyId = user.family_id;
    const profileType = user.profile_type;

    const update = this.db.transaction(() => {
      const checkStmt = this.db.prepare(`
        SELECT 1 FROM recurring_items ri
        LEFT JOIN users u ON ri.user_id = u.id
        WHERE ri.id = ? AND (u.family_id = ? OR ri.user_id = ?)
      `);
      const updateStmt = this.db.prepare('UPDATE recurring_items SET position = ? WHERE id = ?');
      
      for (const item of positions) {
        if (profileType === 1 || checkStmt.get(item.id, familyId, userId)) {
          updateStmt.run(item.position, item.id);
        }
      }
    });
    update();
    return { success: true };
  }

  // ── TRANSACTIONS ─────────────────────────────────────────────
  getTransactions({ userId, month, year, type, accountId, search, avulsoOnly }) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    let q = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name, a.color as account_color, a.bank as account_bank,
             ri.name as recurring_name, ri.is_priority as is_priority
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (profileType !== 1) {
      if (perm.can_view_all === 0) {
        q += ` AND t.user_id = ?`;
        params.push(userId);
      } else {
        q += ` AND u.family_id = ?`;
        params.push(familyId);
      }
    }
    
    if (month && year) { q += ` AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?`; params.push(String(month).padStart(2,'0'), String(year)); }
    if (type) { q += ` AND t.type = ?`; params.push(type); }
    if (accountId) { q += ` AND t.account_id = ?`; params.push(accountId); }
    if (search) { q += ` AND t.description LIKE ?`; params.push(`%${search}%`); }
    if (avulsoOnly) { 
      q += ` AND t.is_avulso = 1`; 
    } else {
      q += ` AND t.is_avulso != 2`;
    }
    q += ` ORDER BY t.position ASC, COALESCE(ri.is_priority, 0) DESC, t.date DESC, t.id DESC`;
    return this.db.prepare(q).all(...params);
  }

  getMonthlyTransactionsByRecurring(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const m = String(month).padStart(2,'0');
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.is_avulso = 0
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(m, String(year));
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.is_avulso = 0 AND u.family_id = ?
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(familyId, m, String(year));
    } else {
      return this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as recurring_name,
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               a.name as account_name, a.bank as account_bank
        FROM transactions t
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ? AND t.is_avulso = 0
        AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
        ORDER BY COALESCE(ri.is_priority, 0) DESC, t.date ASC
      `).all(userId, m, String(year));
    }
  }

  createTransaction(data) {
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const familyId = user ? user.family_id : null;
    const txData = {
      category_id: null,
      recurring_item_id: null,
      notes: null,
      is_avulso: 0,
      competence_date: null,
      credit_product: 'normal',
      due_date: null,
      ...data,
      payment_date: data.is_paid ? (data.payment_date || data.date) : null
    };
    const t = this.db.transaction(() => {
      const r = this.db.prepare(`
        INSERT INTO transactions (user_id, account_id, category_id, recurring_item_id, type, amount, description, date, payment_date, competence_date, is_paid, is_avulso, notes, credit_product, due_date)
        VALUES (@user_id, @account_id, @category_id, @recurring_item_id, @type, @amount, @description, @date, @payment_date, @competence_date, @is_paid, @is_avulso, @notes, @credit_product, @due_date)
      `).run(txData);
      if (txData.is_paid) {
        const delta = txData.type === 'income' ? txData.amount : -txData.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, txData.account_id);
      }
      return r.lastInsertRowid;
    });
    const id = t();
    const cleanType = data.type === 'income' ? 'receita' : 'despesa';
    this.logEvent('transaction:create', `Usuário "${user ? user.name : 'Desconhecido'}" lançou uma ${cleanType}: "${data.description}" (Valor: R$ ${data.amount}).`, familyId);
    return { success: true, id };
  }

  updateTransaction(data) {
    const old = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(data.id);
    if (!old) return { success: false, error: 'Lançamento não encontrado' };
    const txData = {
      ...old,
      ...data,
      payment_date: (data.is_paid !== undefined ? data.is_paid : old.is_paid) ? (data.payment_date || old.payment_date || data.date || old.date) : null
    };
    this.db.transaction(() => {
      if (old.is_paid) {
        const d = old.type === 'income' ? -old.amount : old.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, old.account_id);
      }
      this.db.prepare(`
        UPDATE transactions SET account_id=@account_id, category_id=@category_id, type=@type,
        amount=@amount, description=@description, date=@date, payment_date=@payment_date, competence_date=@competence_date, is_paid=@is_paid, notes=@notes, credit_product=@credit_product, due_date=@due_date WHERE id=@id
      `).run(txData);
      if (txData.is_paid) {
        const d = txData.type === 'income' ? txData.amount : -txData.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, txData.account_id);
      }
    })();
    return { success: true };
  }

  deleteTransaction(idPayload) {
    let id = idPayload;
    if (typeof idPayload === 'object' && idPayload !== null) {
      id = idPayload.id || idPayload.txId;
    }
    id = parseInt(id);
    if (!id || isNaN(id)) return { success: false, error: 'ID de lançamento inválido' };

    const t = this.db.prepare('SELECT t.*, u.family_id, u.name as user_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado ou já excluído' };

    this.db.transaction(() => {
      if (t.is_paid && t.type !== 'transfer') {
        const d = t.type === 'income' ? -t.amount : t.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, t.account_id);
      }
      // Sempre deleta de verdade quando o usuário clica em excluir.
      // A marcação [PULADA] (is_avulso=2) é usada apenas internamente pelo sistema de postergação.
      this.db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    })();

    if (t.family_id) {
      this.logEvent('transaction:delete', `Usuário "${t.user_name || 'Desconhecido'}" excluiu o lançamento: "${t.description}" (Valor original: R$ ${t.amount}).`, t.family_id);
    }
    return { success: true };
  }

  toggleTransactionPaid(id) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado' };
    const newPaid = t.is_paid ? 0 : 1;
    const todayStr = new Date().toISOString().slice(0, 10);
    this.db.transaction(() => {
      const netAmount = (t.amount + (t.penalty_amount || 0) - (t.discount_amount || 0));
      const delta = (t.type === 'income' ? netAmount : -netAmount) * (newPaid ? 1 : -1);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      this.db.prepare('UPDATE transactions SET is_paid = ?, payment_date = ? WHERE id = ?').run(newPaid, newPaid ? (t.payment_date || t.date || todayStr) : null, id);
    })();
    return { success: true };
  }

  toggleTransactionPaidWithDate(id, paymentDate, options = {}) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado' };
    
    const penalty = options && options.penalty_amount ? parseFloat(options.penalty_amount) : 0;
    const discount = options && options.discount_amount ? parseFloat(options.discount_amount) : 0;
    const newPaid = t.is_paid ? 0 : 1;

    this.db.transaction(() => {
      const oldNet = (t.amount + (t.penalty_amount || 0) - (t.discount_amount || 0));
      const newNet = (t.amount + penalty - discount);

      let delta = 0;
      if (newPaid && !t.is_paid) {
        delta = (t.type === 'income' ? newNet : -newNet);
      } else if (!newPaid && t.is_paid) {
        delta = (t.type === 'income' ? -oldNet : oldNet);
      } else if (newPaid && t.is_paid) {
        const oldDelta = (t.type === 'income' ? oldNet : -oldNet);
        const newDelta = (t.type === 'income' ? newNet : -newNet);
        delta = newDelta - oldDelta;
      }

      if (delta !== 0) {
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      }

      if (newPaid) {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 1, payment_date = ?, penalty_amount = ?, discount_amount = ? 
          WHERE id = ?
        `).run(paymentDate, penalty, discount, id);
      } else {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 0, payment_date = NULL, penalty_amount = 0, discount_amount = 0 
          WHERE id = ?
        `).run(id);
      }
    })();
    return { success: true };
  }

  getCardInvoices(userId, month, year) {
    const user = this.db.prepare('SELECT family_id FROM users WHERE id = ?').get(userId);
    if (!user) return [];
    const familyId = user.family_id;

    const creditAccounts = this.db.prepare(`
      SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE u.family_id = ? AND a.type = 'credit'
    `).all(familyId);

    const m = String(month).padStart(2, '0');
    const y = String(year);

    for (const acc of creditAccounts) {
      const cycle = getCardBillingCycle(acc.closing_day, acc.due_day, month, year);
      
      const txs = this.db.prepare(`
        SELECT id, amount FROM transactions
        WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
        AND date >= ? AND date <= ?
      `).all(acc.id, cycle.start, cycle.end);

      const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
      const dueDateStr = `${y}-${m}-${String(acc.due_day || 10).padStart(2, '0')}`;

      let existingInvoice = this.db.prepare(`
        SELECT * FROM invoices WHERE card_account_id = ? AND month = ? AND year = ?
      `).get(acc.id, month, year);

      if (!existingInvoice) {
        if (totalAmount > 0) {
          const res = this.db.prepare(`
            INSERT INTO invoices (card_account_id, month, year, due_date, amount, is_paid)
            VALUES (?, ?, ?, ?, ?, 0)
          `).run(acc.id, month, year, dueDateStr, totalAmount);
          const invoiceId = res.lastInsertRowid;
          
          if (txs.length > 0) {
            const txIds = txs.map(t => t.id);
            const placeholders = txIds.map(() => '?').join(',');
            this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
          }
        }
      } else {
        if (existingInvoice.is_paid === 0) {
          this.db.prepare(`
            UPDATE invoices SET amount = ?, due_date = ? WHERE id = ?
          `).run(totalAmount, dueDateStr, existingInvoice.id);

          if (txs.length > 0) {
            const txIds = txs.map(t => t.id);
            const placeholders = txIds.map(() => '?').join(',');
            this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(existingInvoice.id, ...txIds);
          }
        }
      }
    }

    return this.db.prepare(`
      SELECT i.*, a.name as card_name, a.bank, a.credit_limit, a.closing_day, a.due_day,
             u.name as user_name, u.avatar_color as user_avatar_color,
             pa.name as payment_account_name
      FROM invoices i
      JOIN accounts a ON i.card_account_id = a.id
      JOIN users u ON a.user_id = u.id
      LEFT JOIN accounts pa ON i.payment_account_id = pa.id
      WHERE u.family_id = ? AND i.month = ? AND i.year = ?
      ORDER BY i.due_date ASC
    `).all(familyId, month, year);
  }

  payCardInvoice({ invoiceId, paymentAccountId, paymentDate, penaltyAmount = 0, discountAmount = 0, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (inv.is_paid) return { success: false, error: 'Esta fatura já foi quitada' };

    const penalty = parseFloat(penaltyAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const netAmount = inv.amount + penalty - discount;
    const payDate = paymentDate || new Date().toISOString().split('T')[0];

    const cardAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(inv.card_account_id);
    const payAcc = this.db.prepare('SELECT name FROM accounts WHERE id = ?').get(paymentAccountId);
    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);

    this.db.transaction(() => {
      this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(netAmount, paymentAccountId);

      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 1, payment_account_id = ?, payment_date = ?, penalty_amount = ?, discount_amount = ?
        WHERE id = ?
      `).run(paymentAccountId, payDate, penalty, discount, invoiceId);

      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 1, payment_date = ?
        WHERE invoice_id = ?
      `).run(payDate, invoiceId);
    })();

    this.logEvent('invoice:pay', `Fatura do cartão "${cardAcc ? cardAcc.name : 'Cartão'}" (Ref: ${inv.month}/${inv.year}) quitada no valor total de R$ ${netAmount.toFixed(2)} através da conta "${payAcc ? payAcc.name : 'Conta'}".`, user ? user.family_id : null);
    return { success: true };
  }

  renegotiateCardInvoice({
    invoiceId,
    downPayment = 0,
    downPaymentAccountId = null,
    downPaymentDate = null,
    installmentsCount,
    installmentAmount,
    firstInstallmentMonth,
    firstInstallmentYear,
    interestAmount = 0,
    notes = '',
    userId
  }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (inv.is_paid) return { success: false, error: 'Esta fatura já foi quitada ou renegociada' };

    const count = parseInt(installmentsCount, 10);
    const amountPerInstallment = parseFloat(installmentAmount);
    const downPay = parseFloat(downPayment) || 0;

    if (!count || count < 2) {
      return { success: false, error: 'O número de parcelas deve ser de no mínimo 2 vezes.' };
    }
    if (!amountPerInstallment || amountPerInstallment <= 0) {
      return { success: false, error: 'O valor da parcela deve ser maior que zero.' };
    }
    if (downPay > 0 && !downPaymentAccountId) {
      return { success: false, error: 'Selecione a conta de onde saiu o pagamento da entrada.' };
    }

    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    if (!cardAcc) return { success: false, error: 'Cartão de crédito não encontrado' };

    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    // Parse start month and year
    let startY, startM;
    if (firstInstallmentMonth && typeof firstInstallmentMonth === 'string' && firstInstallmentMonth.includes('-')) {
      const parts = firstInstallmentMonth.split('-');
      startY = parseInt(parts[0], 10);
      startM = parseInt(parts[1], 10);
    } else {
      startM = firstInstallmentMonth ? parseInt(firstInstallmentMonth, 10) : (inv.month === 12 ? 1 : inv.month + 1);
      startY = firstInstallmentYear ? parseInt(firstInstallmentYear, 10) : (inv.month === 12 ? inv.year + 1 : inv.year);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const payDate = downPaymentDate || todayStr;
    const createdAtStr = `${startY}-${String(startM).padStart(2, '0')}-01 00:00:00`;

    const result = this.db.transaction(() => {
      // 1. Process down payment if any
      let downPaymentTxId = null;
      if (downPay > 0 && downPaymentAccountId) {
        // Debit down payment from checking account
        this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(downPay, downPaymentAccountId);
        
        // Register down payment transaction in checking account
        const rDown = this.db.prepare(`
          INSERT INTO transactions (user_id, account_id, type, amount, description, date, payment_date, is_paid, is_avulso, notes)
          VALUES (?, ?, 'expense', ?, ?, ?, ?, 1, 1, ?)
        `).run(
          userId,
          downPaymentAccountId,
          downPay,
          `Entrada Acordo Fatura ${cardAcc.name} (${String(inv.month).padStart(2, '0')}/${inv.year})`,
          payDate,
          payDate,
          notes || 'Entrada de renegociação/parcelamento de fatura'
        );
        downPaymentTxId = rDown.lastInsertRowid;
      }

      // 2. Mark original invoice and its transactions as paid/settled by agreement
      const renegotiationSummary = JSON.stringify({
        originalAmount: inv.amount,
        downPayment: downPay,
        installmentsCount: count,
        installmentAmount: amountPerInstallment,
        totalFinanced: count * amountPerInstallment,
        interestAmount: (count * amountPerInstallment + downPay) - inv.amount,
        renegotiatedAt: new Date().toISOString()
      });

      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 1, is_renegotiated = 1, renegotiation_details = ?, payment_date = ?
        WHERE id = ?
      `).run(renegotiationSummary, payDate, invoiceId);

      // Mark existing transactions belonging to this invoice as paid/settled by agreement
      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 1, payment_date = ?
        WHERE invoice_id = ?
      `).run(payDate, invoiceId);

      // 3. Create recurring item for the new installments on the credit card account
      // This will generate monthly transactions and commit the card limit!
      const agreementName = `Acordo Fatura ${cardAcc.name} (Ref ${String(inv.month).padStart(2, '0')}/${inv.year})`;
      const rRec = this.db.prepare(`
        INSERT INTO recurring_items (user_id, name, type, amount, category_id, account_id, due_day, is_priority, icon, color, notes, repeat_months, start_installment, created_at)
        VALUES (?, ?, 'expense', ?, ?, ?, ?, 1, '🤝', '#f59e0b', ?, ?, 1, ?)
      `).run(
        userId,
        agreementName,
        amountPerInstallment,
        null,
        cardAcc.id,
        cardAcc.due_day || 10,
        notes || `Renegociação em ${count}x de R$ ${amountPerInstallment.toFixed(2)} da fatura ${String(inv.month).padStart(2, '0')}/${inv.year}`,
        count,
        createdAtStr
      );

      const recurringItemId = rRec.lastInsertRowid;

      return { recurringItemId, downPaymentTxId };
    })();

    // 4. Trigger recurrence generator AFTER the transaction is committed so the new
    //    recurring_item is visible to the SELECT inside generateMonthlyRecurrences.
    //    Also backfill any months between startM/startY and today that were missed.
    {
      const now = new Date();
      const nowMonth = now.getMonth() + 1;
      const nowYear = now.getFullYear();
      let bM = startM;
      let bY = startY;
      while (bY < nowYear || (bY === nowYear && bM <= nowMonth)) {
        this.generateMonthlyRecurrences(bM, bY);
        bM++;
        if (bM > 12) { bM = 1; bY++; }
      }
    }

    const logMsg = `Fatura do cartão "${cardAcc.name}" (Ref: ${String(inv.month).padStart(2, '0')}/${inv.year}, Valor: R$ ${inv.amount.toFixed(2)}) renegociada com sucesso em ${count}x de R$ ${amountPerInstallment.toFixed(2)}${downPay > 0 ? ` com entrada de R$ ${downPay.toFixed(2)}` : ''}.`;
    this.logEvent('invoice:renegotiate', logMsg, familyId);

    return { success: true, ...result };
  }

  reopenCardInvoice({ invoiceId, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    if (!inv.is_paid && !inv.is_renegotiated) {
      return { success: false, error: 'Esta fatura já está aberta' };
    }

    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    const user = this.db.prepare('SELECT family_id, name FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;

    this.db.transaction(() => {
      // 1. Se foi pagamento normal (is_renegotiated = 0) com débito em conta corrente, estornar o valor na conta
      if (!inv.is_renegotiated && inv.payment_account_id) {
        const netAmount = inv.amount + (inv.penalty_amount || 0) - (inv.discount_amount || 0);
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(netAmount, inv.payment_account_id);
      }

      // 2. Se foi renegociada (is_renegotiated = 1), limpar itens de acordo e entrada se existirem
      if (inv.is_renegotiated) {
        // Estornar e remover lançamento de entrada, se houver
        const downDescPattern = `Entrada Acordo Fatura ${cardAcc ? cardAcc.name : ''} (${String(inv.month).padStart(2, '0')}/${inv.year})%`;
        const downTxs = this.db.prepare(`
          SELECT * FROM transactions
          WHERE description LIKE ? AND user_id = ?
        `).all(downDescPattern, userId);

        for (const dTx of downTxs) {
          if (dTx.is_paid && dTx.account_id) {
            this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(dTx.amount, dTx.account_id);
          }
          this.db.prepare('DELETE FROM transactions WHERE id = ?').run(dTx.id);
        }

        // Buscar recorrência gerada pelo acordo da fatura
        const agreementPattern = `Acordo Fatura ${cardAcc ? cardAcc.name : ''}%Ref%${String(inv.month).padStart(2, '0')}/${inv.year}%`;
        const recItems = this.db.prepare(`
          SELECT * FROM recurring_items
          WHERE (name LIKE ? OR notes LIKE ?) AND user_id = ?
        `).all(agreementPattern, `%${String(inv.month).padStart(2, '0')}/${inv.year}%`, userId);

        for (const ri of recItems) {
          // Deletar transações geradas por esta recorrência que ainda NÃO foram pagas
          this.db.prepare(`
            DELETE FROM transactions
            WHERE recurring_item_id = ? AND is_paid = 0
          `).run(ri.id);

          // Desvincular qualquer transação paga que ainda aponte para este item recorrente
          this.db.prepare(`
            UPDATE transactions
            SET recurring_item_id = NULL
            WHERE recurring_item_id = ?
          `).run(ri.id);

          // Deletar o item recorrente
          this.db.prepare('DELETE FROM recurring_items WHERE id = ?').run(ri.id);
        }
      }

      // 3. Resetar status da fatura para ABERTA (is_paid = 0, is_renegotiated = 0)
      this.db.prepare(`
        UPDATE invoices
        SET is_paid = 0,
            is_renegotiated = 0,
            renegotiation_details = NULL,
            payment_account_id = NULL,
            payment_date = NULL,
            penalty_amount = 0,
            discount_amount = 0
        WHERE id = ?
      `).run(invoiceId);

      // 4. Resetar os lançamentos vinculados a esta fatura para em aberto (is_paid = 0)
      this.db.prepare(`
        UPDATE transactions
        SET is_paid = 0,
            payment_date = NULL,
            penalty_amount = 0,
            discount_amount = 0
        WHERE invoice_id = ?
      `).run(invoiceId);
    })();

    // 5. FORA da transaction: gerar recorrências do mês (inclui parcelas de acordos de outros meses)
    // Isso evita conflito de nested transactions e garante que parcelas como "Acordo Fatura Ref 04/2026"
    // já existam antes do recálculo.
    this.generateMonthlyRecurrences(inv.month, inv.year);

    // 6. Recalcular o valor total da fatura com base nos lançamentos reais existentes no ciclo
    if (cardAcc) {
      const cycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, inv.month, inv.year);
      const txs = this.db.prepare(`
        SELECT id, amount FROM transactions
        WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
        AND date >= ? AND date <= ?
      `).all(cardAcc.id, cycle.start, cycle.end);

      const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
      this.db.prepare('UPDATE invoices SET amount = ? WHERE id = ?').run(totalAmount, invoiceId);

      if (txs.length > 0) {
        const txIds = txs.map(t => t.id);
        const placeholders = txIds.map(() => '?').join(',');
        this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
      }
    }

    const logMsg = `Fatura do cartão "${cardAcc ? cardAcc.name : 'Cartão'}" (Ref: ${String(inv.month).padStart(2, '0')}/${inv.year}) foi reaberta com sucesso e teve seus valores recalculados.`;
    this.logEvent('invoice:reopen', logMsg, familyId);

    return { success: true, message: 'Fatura reaberta com sucesso e valores recalculados!' };
  }

  recalculateCardInvoice({ invoiceId, userId }) {
    const inv = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!inv) return { success: false, error: 'Fatura não encontrada' };
    const cardAcc = this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(inv.card_account_id);
    if (!cardAcc) return { success: false, error: 'Cartão não encontrado' };

    const cycle = getCardBillingCycle(cardAcc.closing_day, cardAcc.due_day, inv.month, inv.year);
    const txs = this.db.prepare(`
      SELECT id, amount FROM transactions
      WHERE account_id = ? AND type = 'expense' AND is_avulso != 2
      AND date >= ? AND date <= ?
    `).all(cardAcc.id, cycle.start, cycle.end);

    const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    this.db.prepare('UPDATE invoices SET amount = ? WHERE id = ?').run(totalAmount, invoiceId);

    if (txs.length > 0) {
      const txIds = txs.map(t => t.id);
      const placeholders = txIds.map(() => '?').join(',');
      this.db.prepare(`UPDATE transactions SET invoice_id = ? WHERE id IN (${placeholders})`).run(invoiceId, ...txIds);
    }

    return { success: true, amount: totalAmount };
  }

  updateTransactionPositions(userId, positions) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const familyId = user.family_id;
    const profileType = user.profile_type;

    const update = this.db.transaction(() => {
      const checkStmt = this.db.prepare(`
        SELECT 1 FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND (u.family_id = ? OR t.user_id = ?)
      `);
      const updateStmt = this.db.prepare('UPDATE transactions SET position = ? WHERE id = ?');
      
      for (const item of positions) {
        if (profileType === 1 || checkStmt.get(item.id, familyId, userId)) {
          updateStmt.run(item.position, item.id);
        }
      }
    });
    update();
    return { success: true };
  }

  // ── DASHBOARD ────────────────────────────────────────────────
  getDashboardSummary(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    const m = String(month).padStart(2,'0');
    const y = String(year);
    const now = new Date();
    const today = now.getDate();

    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const settings = this.getSettings(userId);
    const alertDays = settings.alert_days_before || 3;
    const perm = this.getUserPermissions(userId);

    let income, expense, pending, priorityItems, alertItems, totalRecurring, paidRecurring;

    if (profileType === 1) {
      // ADM Geral
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
    } else if (perm.can_view_all === 1) {
      income = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='income' AND t.is_paid=1 AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?`).get(familyId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?`).get(familyId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).v;
    } else {
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
    }

    const accounts = this.getAccounts(userId);

    // Dynamic monthly balance & card spending
    const cardSpending = {};
    const cardMonthlyInvoices = {};
    for (const acc of accounts) {
      if (acc.type === 'credit') {
        const cycle = getCardBillingCycle(acc.closing_day, acc.due_day, month, year);
        const cycleSpent = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='expense' 
          AND date >= ? AND date <= ?
        `).get(acc.id, cycle.start, cycle.end).v;

        const totalUnpaid = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='expense' AND (is_paid=0 OR is_paid IS NULL)
        `).get(acc.id).v;

        cardMonthlyInvoices[acc.id] = cycleSpent;
        cardSpending[acc.id] = Math.max(cycleSpent, totalUnpaid);
      } else {
        // 1. Receitas Avulsas do Mês
        const avulsoIncome = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='income' AND is_avulso=1 
          AND strftime('%m',date)=? AND strftime('%Y',date)=?
        `).get(acc.id, m, y).v;
        
        // 2. Transações de Receitas Recorrentes Reais (qualquer uma que já exista fisicamente no banco)
        const generatedActiveIncome = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='income' AND recurring_item_id IS NOT NULL
          AND strftime('%m',date)=? AND strftime('%Y',date)=?
        `).get(acc.id, m, y).v;

        // 3. Projeção de Receitas Recorrentes ATIVAS que ainda não caíram no mês (vigência ativa)
        const activeRecurringItems = this.db.prepare(`
          SELECT ri.* FROM recurring_items ri 
          WHERE ri.account_id=? AND ri.type='income' AND ri.is_active=1
        `).all(acc.id);

        let projectedActiveIncome = 0;
        for (const item of activeRecurringItems) {
          // Check if there is already a transaction for this item in this month
          const hasTx = this.db.prepare(`
            SELECT 1 FROM transactions 
            WHERE recurring_item_id=? AND strftime('%m',date)=? AND strftime('%Y',date)=?
          `).get(item.id, m, y);

          if (!hasTx) {
            // Check dynamic active window
            let createdYear, createdMonth;
            if (item.created_at) {
              const parts = item.created_at.split('-');
              createdYear = parseInt(parts[0], 10);
              createdMonth = parseInt(parts[1], 10);
            } else {
              createdYear = now.getFullYear();
              createdMonth = now.getMonth() + 1;
            }
            const monthsDiff = (year - createdYear) * 12 + (month - createdMonth);

            if (monthsDiff >= 0) {
              if (!item.repeat_months || item.repeat_months <= 0 || monthsDiff < item.repeat_months) {
                projectedActiveIncome += item.amount;
              }
            }
          }
        }

        acc.balance = avulsoIncome + generatedActiveIncome + projectedActiveIncome;
      }
    }

    // Priority items
    if (profileType === 1) {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(m, y);
    } else if (perm.can_view_all === 1) {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id=? AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(familyId, m, y);
    } else {
      priorityItems = this.db.prepare(`
        SELECT t.*, ri.is_priority, ri.due_day, ri.name as rec_name, ri.icon as rec_icon,
               a.name as account_name
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id=? AND ri.is_priority=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        ORDER BY t.is_paid ASC, t.date ASC
      `).all(userId, m, y);
    }

    // Alert items (due within alertDays days, unpaid)
    if (profileType === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else if (perm.can_view_all === 1) {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id=? AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(familyId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    } else {
      alertItems = this.db.prepare(`
        SELECT t.*, ri.due_day, ri.name as rec_name, ri.icon as rec_icon, ri.is_priority
        FROM transactions t
        JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.user_id=? AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      `).all(userId, m, y).filter(t => {
        if (!t.due_day) return false;
        const daysLeft = t.due_day - today;
        return daysLeft >= 0 && daysLeft <= alertDays;
      });
    }

    // Recurring progress
    if (profileType === 1) {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE is_avulso=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE is_avulso=0 AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).c;
    } else if (perm.can_view_all === 1) {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.is_avulso=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.is_avulso=0 AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).c;
    } else {
      totalRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE user_id=? AND is_avulso=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).c;
      paidRecurring = this.db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE user_id=? AND is_avulso=0 AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).c;
    }

    // Overdue items from previous months (prior to current month/year)
    const monthStartThreshold = `${y}-${m}-01`;
    let overduePreviousItems = [];
    if (profileType === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(monthStartThreshold);
    } else if (perm.can_view_all === 1) {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE u.family_id = ? AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(familyId, monthStartThreshold);
    } else {
      overduePreviousItems = this.db.prepare(`
        SELECT t.id, t.description, t.amount, t.type, t.date, t.is_paid, t.recurring_item_id,
               c.name as category_name, c.icon as category_icon,
               a.name as account_name, a.bank as account_bank, a.color as account_color,
               u.name as user_name, u.avatar_color as user_avatar_color,
               ri.name as rec_name, ri.icon as rec_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN recurring_items ri ON t.recurring_item_id = ri.id
        WHERE t.user_id = ? AND t.is_paid = 0 AND t.amount > 0 AND t.date < ?
        ORDER BY t.date DESC, t.amount DESC
      `).all(userId, monthStartThreshold);
    }

    return { income, expense, pending, balance: income - expense, accounts, cardSpending, cardMonthlyInvoices, priorityItems, alertItems, totalRecurring, paidRecurring, alertDays, overduePreviousItems };
  }

  getGeneralDashboardSummary(userId) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    const accounts = this.getAccounts(userId);

    const debitAccounts = accounts.filter(a => a.type !== 'credit');
    const creditAccounts = accounts.filter(a => a.type === 'credit');

    const totalDebit = debitAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalCredit = creditAccounts.reduce((sum, a) => sum + (a.credit_used !== undefined ? a.credit_used : (a.balance < 0 ? -a.balance : 0)), 0);
    const netWorth = totalDebit - totalCredit;

    let totalPending;
    if (profileType === 1) {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM transactions WHERE type='expense' AND is_paid=0").get().v;
    } else if (perm.can_view_all === 1) {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(t.amount), 0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=0").get(familyId).v;
    } else {
      totalPending = this.db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=0").get(userId).v;
    }

    let goals;
    if (profileType === 1) {
      goals = this.db.prepare("SELECT * FROM goals WHERE is_completed=0 ORDER BY created_at DESC").all();
    } else if (perm.can_view_all === 1) {
      goals = this.db.prepare("SELECT g.* FROM goals g JOIN users u ON g.user_id = u.id WHERE u.family_id=? AND g.is_completed=0 ORDER BY g.created_at DESC").all(familyId);
    } else {
      goals = this.db.prepare("SELECT * FROM goals WHERE user_id=? AND is_completed=0 ORDER BY created_at DESC").all(userId);
    }

    return {
      netWorth,
      creditCardBalance: totalCredit,
      totalPending,
      accounts,
      goals,
    };
  }

  getMonthlyChart(userId, months = 6) {
    const result = [];
    const now = new Date();
    const perm = this.getUserPermissions(userId);
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = String(d.getMonth() + 1).padStart(2,'0');
      const y = String(d.getFullYear());
      let income, expense;
      if (perm.can_view_all === 1) {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(m, y).v;
      } else {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',COALESCE(payment_date, date))=? AND strftime('%Y',COALESCE(payment_date, date))=?`).get(userId, m, y).v;
      }
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      result.push({ month: label, income, expense });
    }
    return result;
  }

  getCategoryChart(userId, month, year) {
    const perm = this.getUserPermissions(userId);
    const m = String(month).padStart(2, '0');
    const y = String(year);
    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.type='expense' AND t.is_paid=1
        AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(m, y);
    } else {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.user_id=? AND t.type='expense' AND t.is_paid=1
        AND strftime('%m',COALESCE(t.payment_date, t.date))=? AND strftime('%Y',COALESCE(t.payment_date, t.date))=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(userId, m, y);
    }
  }

  // ── BUDGETS ──────────────────────────────────────────────────
  getBudgets(userId, month, year) {
    const user = this.db.prepare('SELECT family_id, profile_type FROM users WHERE id = ?').get(userId);
    const familyId = user ? user.family_id : null;
    const profileType = user ? user.profile_type : 2;

    const perm = this.getUserPermissions(userId);
    const m = String(month).padStart(2, '0');
    const y = String(year);
    
    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id=b.category_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(m, y, userId, month, year);
    }

    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.category_id=b.category_id AND u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(familyId, m, y, userId, month, year);
    } else {
      return this.db.prepare(`
        SELECT b.*, c.name as category_name, c.color, c.icon,
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id=b.category_id AND t.user_id=b.user_id AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?), 0) as spent
        FROM budgets b JOIN categories c ON b.category_id = c.id
        WHERE b.user_id=? AND b.month=? AND b.year=?
      `).all(m, y, userId, month, year);
    }
  }

  setBudget(data) {
    this.db.prepare(`INSERT INTO budgets (user_id, category_id, month, year, amount) VALUES (@user_id, @category_id, @month, @year, @amount) ON CONFLICT(user_id, category_id, month, year) DO UPDATE SET amount=@amount`).run(data);
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const cat = this.db.prepare("SELECT name FROM categories WHERE id = ?").get(data.category_id);
    const familyId = user ? user.family_id : null;
    this.logEvent('budget:set', `Usuário "${user ? user.name : 'Desconhecido'}" definiu orçamento da categoria "${cat ? cat.name : 'Outras'}" para R$ ${data.amount} (${data.month}/${data.year}).`, familyId);
    return { success: true };
  }

  // ── GOALS ────────────────────────────────────────────────────
  getGoals(userId) {
    return this.db.prepare('SELECT * FROM goals WHERE user_id=? ORDER BY is_completed ASC, created_at DESC').all(userId);
  }

  createGoal(data) {
    const r = this.db.prepare(`INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color, icon) VALUES (@user_id, @name, @target_amount, @current_amount, @deadline, @color, @icon)`).run(data);
    const user = this.db.prepare("SELECT family_id, name FROM users WHERE id = ?").get(data.user_id);
    const familyId = user ? user.family_id : null;
    this.logEvent('goal:create', `Usuário "${user ? user.name : 'Desconhecido'}" criou uma meta: "${data.name}" (Meta: R$ ${data.target_amount}).`, familyId);
    return { success: true, id: r.lastInsertRowid };
  }

  updateGoal(data) {
    this.db.prepare(`UPDATE goals SET name=@name, target_amount=@target_amount, deadline=@deadline, color=@color, icon=@icon WHERE id=@id`).run(data);
    return { success: true };
  }

  deleteGoal(id) {
    const goal = this.db.prepare('SELECT g.name, u.family_id, u.name as user_name FROM goals g JOIN users u ON g.user_id = u.id WHERE g.id = ?').get(id);
    this.db.prepare('DELETE FROM goal_deposits WHERE goal_id=?').run(id);
    this.db.prepare('DELETE FROM goals WHERE id=?').run(id);
    if (goal) {
      this.logEvent('goal:delete', `Usuário "${goal.user_name}" excluiu a meta "${goal.name}".`, goal.family_id);
    }
    return { success: true };
  }

  addGoalDeposit({ goal_id, amount, note, date }) {
    this.db.transaction(() => {
      this.db.prepare('INSERT INTO goal_deposits (goal_id, amount, note, date) VALUES (?,?,?,?)').run(goal_id, amount, note, date);
      this.db.prepare('UPDATE goals SET current_amount=current_amount+?, is_completed=CASE WHEN current_amount+?>=target_amount THEN 1 ELSE 0 END WHERE id=?').run(amount, amount, goal_id);
    })();
    return { success: true };
  }

  // ── REPORTS ──────────────────────────────────────────────────
  getCashflow(userId, month, year) {
    if (month && year) {
      this.generateMonthlyRecurrences(month, year);
    }
    return this.db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name
      FROM transactions t LEFT JOIN categories c ON t.category_id=c.id LEFT JOIN accounts a ON t.account_id=a.id
      WHERE t.user_id=? AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
      ORDER BY t.date DESC
    `).all(userId, String(month).padStart(2,'0'), String(year));
  }

  getPatrimony(userId) {
    const result = [];
    const now = new Date();
    
    // Calculate current wealth assets (checking/debit accounts only)
    const accounts = this.getAccounts(userId);
    const debitAccounts = accounts.filter(a => a.type !== 'credit');
    const currentNetWorth = debitAccounts.reduce((sum, a) => sum + a.balance, 0);

    const perm = this.getUserPermissions(userId);

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const endOfMonthStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
      
      // Transactions only on debit/checking accounts
      let query = `
        SELECT COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END), 0) as v
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.is_paid = 1 AND t.type != 'transfer' AND a.type != 'credit' AND t.date > ?
      `;
      const params = [endOfMonthStr];
      if (perm.can_view_all !== 1) {
        query += ` AND t.user_id = ?`;
        params.push(userId);
      }
      
      const netChangeAfter = this.db.prepare(query).get(...params).v;
      const netWorthAtMonthEnd = currentNetWorth - netChangeAfter;

      result.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        net: netWorthAtMonthEnd
      });
    }
    return result;
  }

  // ── FAMILIES & LOGS MANAGEMENT ─────────────────────────────────
  logEvent(eventType, message, familyId = null) {
    try {
      this.db.prepare("INSERT INTO server_logs (event_type, message, family_id) VALUES (?, ?, ?)").run(eventType, message, familyId);
    } catch (err) {
      console.error('Error logging event:', err);
    }
  }

  getServerLogs() {
    return this.db.prepare("SELECT * FROM server_logs ORDER BY created_at DESC LIMIT 100").all();
  }

  getFamilyLogs(familyId) {
    return this.db.prepare("SELECT * FROM server_logs WHERE family_id = ? ORDER BY created_at DESC LIMIT 100").all(familyId);
  }

  getFamilies() {
    return this.db.prepare(`
      SELECT f.*,
             (SELECT COUNT(*) FROM users u WHERE u.family_id = f.id) as user_count,
             (SELECT COUNT(*) FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.family_id = f.id) as account_count,
             (SELECT COUNT(*) FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id = f.id) as transaction_count,
             (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id = f.id AND t.type='expense') as total_expense
      FROM families f
      ORDER BY f.created_at DESC
    `).all();
  }

  createFamily(data) {
    const name = typeof data === 'string' ? data : data.name;
    const quota_users = typeof data === 'object' ? data.quota_users : 6;
    const quota_accounts = typeof data === 'object' ? data.quota_accounts : 10;
    const r = this.db.prepare("INSERT INTO families (name, quota_users, quota_accounts) VALUES (?, ?, ?)").run(
      name,
      quota_users || 6,
      quota_accounts || 10
    );
    this.logEvent('family:create', `Família ${name} foi criada com quotas de ${quota_users || 6} membros e ${quota_accounts || 10} contas.`, r.lastInsertRowid);
    return { success: true, id: r.lastInsertRowid };
  }

  deleteFamily(id) {
    try {
      const fam = this.db.prepare("SELECT name FROM families WHERE id = ?").get(id);
      const famName = fam ? fam.name : `ID ${id}`;
      
      this.db.transaction(() => {
        const users = this.db.prepare("SELECT id FROM users WHERE family_id = ?").all(id);
        for (const u of users) {
          // Delete goals and deposits
          const goals = this.db.prepare("SELECT id FROM goals WHERE user_id = ?").all(u.id);
          for (const g of goals) {
            this.db.prepare("DELETE FROM goal_deposits WHERE goal_id = ?").run(g.id);
          }
          this.db.prepare("DELETE FROM goals WHERE user_id = ?").run(u.id);
          
          // Delete transactions, recurring items, accounts, budgets, app settings, categories, perms, and user
          this.db.prepare("DELETE FROM transactions WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM recurring_items WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM accounts WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM budgets WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM app_settings WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM categories WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM user_permissions WHERE user_id = ?").run(u.id);
          this.db.prepare("DELETE FROM users WHERE id = ?").run(u.id);
        }
        this.db.prepare("DELETE FROM families WHERE id = ?").run(id);
      })();
      this.logEvent('family:delete', `Família ${famName} e todos os seus dados foram excluídos.`, id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting family:', err);
      return { success: false, error: err.message };
    }
  }

  updateFamily(data) {
    const { id, name, quota_users, quota_accounts } = data;
    try {
      this.db.prepare(`
        UPDATE families 
        SET name = ?, quota_users = ?, quota_accounts = ?
        WHERE id = ?
      `).run(name, quota_users, quota_accounts, id);
      this.logEvent('family:update', `Família ${name} (ID ${id}) teve suas quotas atualizadas.`, id);
      return { success: true };
    } catch (err) {
      console.error('Error updating family:', err);
      return { success: false, error: err.message };
    }
  }

  checkFamilyName(name) {
    try {
      const searchName = name.trim();
      const row = this.db.prepare(`
        SELECT f.id, f.name, u.name AS owner_name 
        FROM families f
        LEFT JOIN users u ON u.family_id = f.id AND u.profile_type = 2
        WHERE LOWER(f.name) = LOWER(?) OR LOWER(f.name) LIKE (LOWER(?) || '_%')
        ORDER BY f.id ASC
        LIMIT 1
      `).get(searchName, searchName);
      
      if (row) {
        const parts = row.name.split('_');
        return {
          id: row.id,
          name: parts[0], // Clean name without owner suffix for UI
          owner_name: row.owner_name || parts[1] || 'Administrador'
        };
      }
      return null;
    } catch (err) {
      console.error('Error checking family name:', err);
      return null;
    }
  }

  backup(destPath) { this.db.backup(destPath); }

  getRecoveryQuestion(username) {
    try {
      const user = this.db.prepare('SELECT recovery_question FROM users WHERE username = ?').get(username);
      if (!user) return { success: false, error: 'Usuário não encontrado' };
      if (!user.recovery_question) return { success: false, error: 'Usuário não possui pergunta de recuperação cadastrada' };
      return { success: true, question: user.recovery_question };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }

  resetPasswordWithAnswer(username, answer, newPassword) {
    try {
      const user = this.db.prepare('SELECT id, recovery_answer FROM users WHERE username = ?').get(username);
      if (!user) return { success: false, error: 'Usuário não encontrado' };
      if (!user.recovery_answer) return { success: false, error: 'Usuário não possui resposta de recuperação cadastrada' };
      
      const isMatch = bcrypt.compareSync(answer.trim().toLowerCase(), user.recovery_answer);
      if (!isMatch) return { success: false, error: 'Resposta de segurança incorreta' };
      
      const newHash = bcrypt.hashSync(newPassword, 10);
      this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }

  getUserById(id) {
    const user = this.db.prepare('SELECT id, name, first_name, last_name, email, phone, cpf, birth_date, username, avatar_color, avatar_image, family_id, profile_type, is_system_admin FROM users WHERE id = ?').get(id);
    if (user && user.cpf) {
      user.cpf = decryptField(user.cpf);
    }
    return user;
  }

  // Optimized single-query ownership checks: return true/false directly.
  checkAccountFamily(accountId, familyId) {
    try {
      const row = this.db.prepare(
        'SELECT 1 FROM accounts a JOIN users u ON u.id = a.user_id WHERE a.id = ? AND u.family_id = ?'
      ).get(accountId, familyId);
      return !!row;
    } catch (e) { return false; }
  }

  checkTransactionFamily(transactionId, familyId) {
    try {
      const row = this.db.prepare(
        'SELECT 1 FROM transactions t JOIN users u ON u.id = t.user_id WHERE t.id = ? AND u.family_id = ?'
      ).get(transactionId, familyId);
      return !!row;
    } catch (e) { return false; }
  }

  checkCategoryFamily(categoryId, familyId) {
    try {
      // System/default categories (user_id IS NULL) are public — accessible by all families.
      const row = this.db.prepare(
        'SELECT 1 FROM categories c WHERE c.id = ? AND (c.user_id IS NULL OR EXISTS (SELECT 1 FROM users u WHERE u.id = c.user_id AND u.family_id = ?))'
      ).get(categoryId, familyId);
      return !!row;
    } catch (e) { return false; }
  }

  checkGoalFamily(goalId, familyId) {
    try {
      const row = this.db.prepare(
        'SELECT 1 FROM goals g JOIN users u ON u.id = g.user_id WHERE g.id = ? AND u.family_id = ?'
      ).get(goalId, familyId);
      return !!row;
    } catch (e) { return false; }
  }

  checkRecurringFamily(recurringId, familyId) {
    try {
      const row = this.db.prepare(
        'SELECT 1 FROM recurring_items r JOIN users u ON u.id = r.user_id WHERE r.id = ? AND u.family_id = ?'
      ).get(recurringId, familyId);
      return !!row;
    } catch (e) { return false; }
  }

  exportMyData(userId) {
    try {
      const user = this.getUserById(userId);
      if (!user) return { success: false, error: 'Usuário não encontrado' };
      
      const familyId = user.family_id;
      
      // Get all family members (safe fields only)
      const members = this.db.prepare('SELECT id, name, first_name, last_name, email, phone, cpf, birth_date, username, profile_type FROM users WHERE family_id = ?').all(familyId);
      for (const m of members) {
        if (m.cpf) m.cpf = decryptField(m.cpf);
      }
      
      // Get accounts
      const accounts = this.db.prepare('SELECT id, name, type, bank, balance, agency, account_number FROM accounts WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE family_id = ?)').all(userId, familyId);
      
      // Get transactions
      const transactions = this.db.prepare('SELECT id, account_id, category_id, type, amount, description, date, is_paid, is_avulso FROM transactions WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE family_id = ?)').all(userId, familyId);
      
      // Get categories
      const categories = this.db.prepare('SELECT id, name, type, color, icon, is_default FROM categories WHERE user_id = ? OR user_id IS NULL').all(userId);
      
      // Get budgets
      const budgets = this.db.prepare('SELECT id, category_id, amount, month, year FROM budgets WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE family_id = ?)').all(userId, familyId);
      
      // Get goals
      const goals = this.db.prepare('SELECT id, name, target_amount, current_amount, deadline, color FROM goals WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE family_id = ?)').all(userId, familyId);

      // Get recurring items
      const recurring = this.db.prepare('SELECT id, name, amount, type, due_day, account_id, category_id FROM recurring_items WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE family_id = ?)').all(userId, familyId);
      
      return {
        success: true,
        data: {
          export_timestamp: new Date().toISOString(),
          personal_info: {
            id: user.id,
            name: user.name,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            cpf: user.cpf,
            birth_date: user.birth_date,
            username: user.username,
            profile_type: user.profile_type
          },
          family_members: members,
          accounts,
          transactions,
          categories,
          budgets,
          goals,
          recurring
        }
      };
    } catch (err) {
      console.error('Error exporting my data:', err);
      return { success: false, error: err.message };
    }
  }

  exportFullJson(userId) {
    try {
      const user = this.db.prepare('SELECT family_id FROM users WHERE id = ?').get(userId);
      const familyId = user ? user.family_id : null;

      const familyUsers = familyId
        ? this.db.prepare('SELECT id, name, username, email, phone, avatar_color, profile_type, created_at FROM users WHERE family_id = ?').all(familyId)
        : this.db.prepare('SELECT id, name, username, email, phone, avatar_color, profile_type, created_at FROM users WHERE id = ?').all(userId);

      const userIds = familyUsers.map(u => u.id);
      const userIdsPlaceholder = userIds.map(() => '?').join(',');

      const accounts = this.db.prepare(`SELECT * FROM accounts WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);
      const categories = this.db.prepare(`SELECT * FROM categories WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);
      const recurringItems = this.db.prepare(`SELECT * FROM recurring_items WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);
      const transactions = this.db.prepare(`SELECT * FROM transactions WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);
      const budgets = this.db.prepare(`SELECT * FROM budgets WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);
      const goals = this.db.prepare(`SELECT * FROM goals WHERE user_id IN (${userIdsPlaceholder})`).all(...userIds);

      return {
        export_date: new Date().toISOString(),
        version: '1.0.0',
        family_id: familyId,
        users: familyUsers,
        accounts,
        categories,
        recurringItems,
        transactions,
        budgets,
        goals
      };
    } catch (err) {
      console.error('Erro ao exportar JSON:', err);
      throw err;
    }
  }

  exportTransactionsCsv({ userId, month, year, type }) {
    try {
      const allTxs = this.getTransactions({ userId });
      const filteredTxs = allTxs.filter(t => {
        const isYearMatch = t.date.startsWith(year + '-');
        if (type === 'monthly') {
          return t.date.startsWith(year + '-' + String(month).padStart(2, '0') + '-');
        }
        return isYearMatch;
      });

      let csv = '\uFEFFData;Descrição;Categoria;Conta/Cartão;Tipo;Valor (R$);Status;Mês Referência;Observações\n';
      filteredTxs.forEach(t => {
        const dateFmt = t.date.split('-').reverse().join('/');
        const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
        const cat = `"${(t.category_name || '').replace(/"/g, '""')}"`;
        const acc = `"${(t.account_name || '').replace(/"/g, '""')}"`;
        const tType = t.type === 'income' ? 'Receita' : 'Despesa';
        const val = t.amount.toFixed(2).replace('.', ',');
        const status = t.is_paid === 1 ? 'Pago' : 'Pendente';
        const ref = t.competence_date ? `Ref: ${t.competence_date}` : '';
        const obs = `"${(t.notes || '').replace(/"/g, '""')}"`;

        csv += `${dateFmt};${desc};${cat};${acc};${tType};${val};${status};${ref};${obs}\n`;
      });

      return csv;
    } catch (err) {
      console.error('Erro ao gerar CSV:', err);
      throw err;
    }
  }

  parseOfxStatement(ofxString) {
    const { parseOfx } = require('./importers/ofxParser');
    return parseOfx(ofxString);
  }

  parseCsvStatement(csvString) {
    const { parseCsv } = require('./importers/csvParser');
    return parseCsv(csvString);
  }

  importBankTransactions({ userId, accountId, transactions }) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return { success: true, count: 0 };
    }

    const stmt = this.db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, category_id, type, amount, description, date, is_paid, is_avulso, payment_date
      ) VALUES (
        @user_id, @account_id, @category_id, @type, @amount, @description, @date, 1, 1, @payment_date
      )
    `);

    const updateAccountBal = this.db.prepare(`
      UPDATE accounts 
      SET balance = balance + ? 
      WHERE id = ?
    `);

    let count = 0;
    const insertMany = this.db.transaction((txs) => {
      for (const t of txs) {
        const paymentDate = t.date || new Date().toISOString().split('T')[0];
        stmt.run({
          user_id: userId,
          account_id: accountId,
          category_id: t.category_id || null,
          type: t.type || 'expense',
          amount: Math.abs(Number(t.amount) || 0),
          description: t.description || 'Lançamento Importado',
          date: paymentDate,
          payment_date: paymentDate
        });

        // Atualiza saldo da conta para lançamentos conciliados
        const delta = t.type === 'income' ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount));
        updateAccountBal.run(delta, accountId);
        count++;
      }
    });

    insertMany(transactions);
    return { success: true, count };
  }

  // ── SMART DEDUPLICATION & SYNC ENGINE ─────────────────────────

  // ── SMART DEDUPLICATION & SYNC ENGINE ─────────────────────────

  _normalizeSyncText(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _cleanBankDescriptionTokens(text) {
    if (!text) return [];
    const STOPWORDS = new Set([
      'pix', 'ted', 'doc', 'pagamento', 'pagto', 'pgto', 'compra', 'cartao', 'cartão',
      'debito', 'débito', 'credito', 'crédito', 'transf', 'transferencia', 'transferência',
      'banco', 'bancario', 'bancaria', 'recibo', 'fatura', 'boleto', 'via', 'de', 'do',
      'da', 'dos', 'das', 'para', 'em', 'no', 'na', 'nos', 'nas', 'com', 'e', 'ou',
      'estorno', 'lançamento', 'lancamento', 'tarifa', 'tar', 'iof', 'aut', 'auto', 'sa', 'ltda', 'me', 'epp'
    ]);
    const normalized = this._normalizeSyncText(text);
    return normalized.split(' ').filter(w => w.length >= 2 && !STOPWORDS.has(w));
  }

  _extractInstallment(text) {
    if (!text) return null;
    const m = text.match(/(?:parc\.?|parcela)?\s*(\d{1,2})\s*(?:\/|\s+de\s+)\s*(\d{1,2})/i);
    if (m) {
      return { current: parseInt(m[1], 10), total: parseInt(m[2], 10) };
    }
    return null;
  }

  calculateSimilarity(txA, txB) {
    let score = 0;
    if (!txA || !txB) return 0;

    // 1. Tipo deve ser o mesmo (expense vs expense, income vs income)
    if (txA.type !== txB.type) return 0;

    // 2. Proximidade de datas (tolerância inteligente com finais de semana)
    if (!txA.date || !txB.date) return 0;
    const dtA = new Date(txA.date + 'T12:00:00Z');
    const dtB = new Date(txB.date + 'T12:00:00Z');
    if (isNaN(dtA.getTime()) || isNaN(dtB.getTime())) return 0;
    
    const diffDays = Math.abs(dtA.getTime() - dtB.getTime()) / (1000 * 60 * 60 * 24);
    const dayOfWeekA = dtA.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const dayOfWeekB = dtB.getUTCDay();
    const isWeekendComp = (
      (dayOfWeekA >= 5 || dayOfWeekA === 0) && (dayOfWeekB <= 2 && dayOfWeekB >= 1) ||
      (dayOfWeekB >= 5 || dayOfWeekB === 0) && (dayOfWeekA <= 2 && dayOfWeekA >= 1)
    );

    if (diffDays === 0) {
      score += 35;
    } else if (diffDays <= 1) {
      score += 28;
    } else if (diffDays <= 2) {
      score += 20;
    } else if (diffDays <= 4 && isWeekendComp) {
      // Compensação bancária de compras feitas na sexta/sábado/domingo e registradas na segunda/terça
      score += 22;
    } else if (diffDays <= 3) {
      score += 10;
    } else {
      return 0; // Mais de 3-4 dias de distância não é duplicata
    }

    // 3. Proximidade de valores monetários
    const vA = Math.abs(Number(txA.amount) || 0);
    const vB = Math.abs(Number(txB.amount) || 0);
    if (vA <= 0 || vB <= 0) return 0;

    const diffAmount = Math.abs(vA - vB);
    const maxAmount = Math.max(vA, vB);
    const diffPct = diffAmount / maxAmount;

    if (diffAmount === 0) {
      score += 40;
    } else if (diffAmount <= 1.00) {
      score += 35;
    } else if (diffPct <= 0.02 || diffAmount <= 2.50) {
      score += 30;
    } else if (diffPct <= 0.05) {
      score += 20;
    } else {
      return 0; // Valores muito discrepantes
    }

    // 4. Semelhança de texto na descrição com NLP e Stopwords
    const rawA = txA.description || txA.rec_name || '';
    const rawB = txB.description || txB.rec_name || '';
    const tokensA = this._cleanBankDescriptionTokens(rawA);
    const tokensB = this._cleanBankDescriptionTokens(rawB);

    if (tokensA.length > 0 && tokensB.length > 0) {
      const setA = new Set(tokensA);
      const setB = new Set(tokensB);
      let matchCount = 0;

      for (const tA of setA) {
        if (setB.has(tA)) {
          matchCount++;
        } else {
          // Checa se é prefixo com pelo menos 4 caracteres (ex: 'supermerc' em 'supermercado')
          for (const tB of setB) {
            if (tA.length >= 4 && tB.length >= 4 && (tA.startsWith(tB) || tB.startsWith(tA))) {
              matchCount += 0.8;
              break;
            }
          }
        }
      }

      const totalDistinct = new Set([...setA, ...setB]).size;
      const jaccard = matchCount / totalDistinct;
      score += Math.round(jaccard * 20);
    } else if (this._normalizeSyncText(rawA) === this._normalizeSyncText(rawB) && rawA.length > 0) {
      score += 20;
    }

    // 5. Comparação de parcelamentos (ex: '3/10' vs '3/10')
    const instA = this._extractInstallment(rawA);
    const instB = this._extractInstallment(rawB);
    if (instA && instB) {
      if (instA.current === instB.current && instA.total === instB.total) {
        score += 10;
      }
    }

    // 6. Mesma Conta Bancária / Cartão Pagador
    if (txA.account_id && txB.account_id && txA.account_id === txB.account_id) {
      score += 5;
    }

    return Math.min(100, Math.round(score));
  }

  checkDuplicateCandidate({ familyId, amount, date, description, accountId, type = 'expense', excludeId = null }) {
    if (!familyId || !amount || !date) return { hasDuplicate: false };
    const targetAmount = Math.abs(Number(amount) || 0);
    if (targetAmount <= 0) return { hasDuplicate: false };

    // Busca transações recentes da família na janela de +- 4 dias
    const candidates = this.db.prepare(`
      SELECT t.*, u.name as user_name, u.avatar_color as user_avatar_color, a.name as account_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE u.family_id = ? 
        AND (t.is_deleted IS NULL OR t.is_deleted = 0)
        AND abs(julianday(t.date) - julianday(?)) <= 4
        AND (? IS NULL OR t.id != ?)
      ORDER BY t.date DESC
      LIMIT 30
    `).all(familyId, date, excludeId, excludeId);

    const virtualTx = {
      type,
      amount: targetAmount,
      date,
      description: description || '',
      account_id: accountId || null
    };

    let bestMatch = null;
    let highestScore = 0;

    for (const cand of candidates) {
      const score = this.calculateSimilarity(virtualTx, cand);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = cand;
      }
    }

    if (highestScore >= 65 && bestMatch) {
      return {
        hasDuplicate: true,
        score: highestScore,
        confidence: highestScore >= 95 ? 'exact' : (highestScore >= 80 ? 'high' : 'medium'),
        candidate: {
          id: bestMatch.id,
          user_name: bestMatch.user_name,
          user_avatar_color: bestMatch.user_avatar_color,
          account_name: bestMatch.account_name,
          date: bestMatch.date,
          amount: bestMatch.amount,
          description: bestMatch.description,
          is_paid: bestMatch.is_paid
        }
      };
    }

    return { hasDuplicate: false };
  }

  findPotentialDuplicates({ familyId, daysWindow = 60, minScore = 65, userId = null, accountId = null }) {
    const minDate = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = `
      SELECT t.*, u.name as user_name, u.avatar_color as user_avatar_color, a.name as account_name, c.name as category_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE u.family_id = ? AND (t.is_deleted IS NULL OR t.is_deleted = 0) AND t.date >= ?
    `;
    const params = [familyId, minDate];

    if (userId) {
      query += ` AND t.user_id = ?`;
      params.push(userId);
    }
    if (accountId) {
      query += ` AND t.account_id = ?`;
      params.push(accountId);
    }

    query += ` ORDER BY t.date DESC, t.amount DESC`;

    const txs = this.db.prepare(query).all(...params);
    const duplicates = [];
    const paired = new Set();

    for (let i = 0; i < txs.length; i++) {
      for (let j = i + 1; j < txs.length; j++) {
        const a = txs[i];
        const b = txs[j];
        const pairKey = `${Math.min(a.id, b.id)}_${Math.max(a.id, b.id)}`;
        if (paired.has(pairKey)) continue;

        const score = this.calculateSimilarity(a, b);
        if (score >= minScore) {
          paired.add(pairKey);
          let confidence = 'medium';
          if (score >= 95) confidence = 'exact';
          else if (score >= 80) confidence = 'high';

          duplicates.push({
            score,
            confidence,
            tx1: a,
            tx2: b
          });
        }
      }
    }

    return duplicates.sort((a, b) => b.score - a.score);
  }

  mergeDuplicateTransactions({ primaryTxId, duplicateTxId, userId }) {
    const primary = this.db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(primaryTxId);
    const duplicate = this.db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(duplicateTxId);

    if (!primary || !duplicate) {
      return { success: false, error: 'Lançamento não encontrado para mesclagem.' };
    }

    const t = this.db.transaction(() => {
      // Se a duplicata estava paga e o primário não, atualiza o primário para pago
      if (duplicate.is_paid === 1 && primary.is_paid === 0) {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 1, payment_date = ?, updated_at = datetime('now') 
          WHERE id = ?
        `).run(duplicate.payment_date || duplicate.date, primaryTxId);
      }

      // Reverte saldo se a duplicata tinha impactado a conta
      if (duplicate.is_paid === 1 && duplicate.account_id) {
        const delta = duplicate.type === 'income' ? -duplicate.amount : duplicate.amount;
        this.db.prepare(`UPDATE accounts SET balance = balance + ? WHERE id = ?`).run(delta, duplicate.account_id);
      }

      // Marca duplicata como deletada (soft-delete) para sincronização limpa
      this.db.prepare(`
        UPDATE transactions 
        SET is_deleted = 1, updated_at = datetime('now'), description = description || ' [Mesclado com #' || ? || ']' 
        WHERE id = ?
      `).run(primaryTxId, duplicateTxId);

      // Atualiza eventuais registros de conflitos pendentes
      this.db.prepare(`
        UPDATE sync_conflicts 
        SET status = 'merged', updated_at = datetime('now') 
        WHERE (primary_tx_id = ? AND duplicate_tx_id = ?) OR (primary_tx_id = ? AND duplicate_tx_id = ?)
      `).run(primaryTxId, duplicateTxId, duplicateTxId, primaryTxId);
    });

    t();
    return { success: true, primaryId: primaryTxId, mergedId: duplicateTxId };
  }

  mergeBatchTransactions({ pairs, userId }) {
    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return { success: false, mergedCount: 0 };
    }
    let mergedCount = 0;
    const t = this.db.transaction(() => {
      for (const pair of pairs) {
        const pId = pair.primaryTxId || pair.tx1_id || pair.tx1Id;
        const dId = pair.duplicateTxId || pair.tx2_id || pair.tx2Id;
        if (pId && dId && pId !== dId) {
          const res = this.mergeDuplicateTransactions({
            primaryTxId: pId,
            duplicateTxId: dId,
            userId
          });
          if (res && res.success) mergedCount++;
        }
      }
    });
    t();
    return { success: true, mergedCount };
  }

  dismissDuplicateConflict({ conflictId, primaryTxId, duplicateTxId }) {
    if (conflictId) {
      this.db.prepare(`UPDATE sync_conflicts SET status = 'dismissed', updated_at = datetime('now') WHERE id = ?`).run(conflictId);
    } else if (primaryTxId && duplicateTxId) {
      this.db.prepare(`
        UPDATE sync_conflicts 
        SET status = 'dismissed', updated_at = datetime('now') 
        WHERE (primary_tx_id = ? AND duplicate_tx_id = ?) OR (primary_tx_id = ? AND duplicate_tx_id = ?)
      `).run(primaryTxId, duplicateTxId, duplicateTxId, primaryTxId);
    }
    return { success: true };
  }

  getDeduplicationHistory({ familyId, limit = 50 }) {
    return this.db.prepare(`
      SELECT sc.*, 
             t1.description as tx1_desc, t1.amount as tx1_amount, t1.date as tx1_date,
             t2.description as tx2_desc, t2.amount as tx2_amount, t2.date as tx2_date
      FROM sync_conflicts sc
      LEFT JOIN transactions t1 ON sc.primary_tx_id = t1.id
      LEFT JOIN transactions t2 ON sc.duplicate_tx_id = t2.id
      WHERE sc.family_id = ?
      ORDER BY sc.updated_at DESC
      LIMIT ?
    `).all(familyId, limit);
  }

  syncPushPull({ familyId, userId, clientSyncTimestamp, changes = {} }) {
    const serverTimestamp = new Date().toISOString();
    const result = {
      success: true,
      serverSyncTimestamp: serverTimestamp,
      applied: { transactions: 0, recurring: 0, accounts: 0, categories: 0 },
      suspectDuplicates: [],
      serverChanges: {
        transactions: [],
        recurring: [],
        accounts: [],
        categories: []
      }
    };

    const processSync = this.db.transaction(() => {
      // 1. Processar transações enviadas pelo cliente
      if (changes.transactions && Array.isArray(changes.transactions)) {
        for (const tx of changes.transactions) {
          const syncId = tx.sync_id || crypto.randomUUID();
          const targetUserId = tx.user_id || userId;
          let targetAccountId = tx.account_id;
          if (!targetAccountId) {
            const defaultAcc = this.db.prepare("SELECT id FROM accounts WHERE user_id = ? AND (is_deleted IS NULL OR is_deleted = 0) ORDER BY CASE WHEN type = 'checking' THEN 1 ELSE 2 END LIMIT 1").get(targetUserId);
            targetAccountId = defaultAcc ? defaultAcc.id : 1;
          }

          const existing = this.db.prepare('SELECT id, updated_at, is_deleted FROM transactions WHERE sync_id = ?').get(syncId);

          if (existing) {
            // Atualização baseada em timestamp mais recente (Last-Write-Wins)
            if (!tx.updated_at || tx.updated_at >= existing.updated_at) {
              this.db.prepare(`
                UPDATE transactions SET
                  user_id = @user_id, account_id = @account_id, category_id = @category_id,
                  type = @type, amount = @amount, description = @description, date = @date,
                  is_paid = @is_paid, payment_date = @payment_date, is_deleted = @is_deleted,
                  updated_at = @updated_at
                WHERE id = @id
              `).run({
                id: existing.id,
                user_id: targetUserId,
                account_id: targetAccountId,
                category_id: tx.category_id || null,
                type: tx.type || 'expense',
                amount: Math.abs(Number(tx.amount) || 0),
                description: tx.description || '',
                date: tx.date,
                is_paid: tx.is_paid ? 1 : 0,
                payment_date: tx.payment_date || null,
                is_deleted: tx.is_deleted ? 1 : 0,
                updated_at: tx.updated_at || serverTimestamp
              });
              result.applied.transactions++;
            }
          } else {
            // Novo registro vindo do cliente: checa motor anti-duplicidade
            const recentFamilyTxs = this.db.prepare(`
              SELECT t.* FROM transactions t
              JOIN users u ON t.user_id = u.id
              WHERE u.family_id = ? AND (t.is_deleted IS NULL OR t.is_deleted = 0)
              AND abs(julianday(t.date) - julianday(?)) <= 3
            `).all(familyId, tx.date);

            let isExactDuplicate = false;
            let suspectDuplicate = null;

            for (const cand of recentFamilyTxs) {
              const score = this.calculateSimilarity(tx, cand);
              if (score >= 95) {
                isExactDuplicate = true;
                suspectDuplicate = { cand, score };
                break;
              } else if (score >= 75 && !suspectDuplicate) {
                suspectDuplicate = { cand, score };
              }
            }

            if (!isExactDuplicate) {
              const info = this.db.prepare(`
                INSERT INTO transactions (
                  sync_id, user_id, account_id, category_id, type, amount, description,
                  date, is_paid, payment_date, is_deleted, updated_at
                ) VALUES (
                  @sync_id, @user_id, @account_id, @category_id, @type, @amount, @description,
                  @date, @is_paid, @payment_date, @is_deleted, @updated_at
                )
              `).run({
                sync_id: syncId,
                user_id: targetUserId,
                account_id: targetAccountId,
                category_id: tx.category_id || null,
                type: tx.type || 'expense',
                amount: Math.abs(Number(tx.amount) || 0),
                description: tx.description || '',
                date: tx.date,
                is_paid: tx.is_paid ? 1 : 0,
                payment_date: tx.payment_date || null,
                is_deleted: tx.is_deleted ? 1 : 0,
                updated_at: tx.updated_at || serverTimestamp
              });
              result.applied.transactions++;

              if (suspectDuplicate) {
                result.suspectDuplicates.push({
                  newTxId: info.lastInsertRowid,
                  existingTxId: suspectDuplicate.cand.id,
                  score: suspectDuplicate.score
                });
              }
            }
          }
        }
      }

      // 2. Coletar alterações do servidor ocorridas após clientSyncTimestamp
      const sinceTime = clientSyncTimestamp || '1970-01-01T00:00:00.000Z';
      result.serverChanges.transactions = this.db.prepare(`
        SELECT t.* FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id = ? AND t.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.accounts = this.db.prepare(`
        SELECT a.* FROM accounts a
        JOIN users u ON a.user_id = u.id
        WHERE u.family_id = ? AND a.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.recurring = this.db.prepare(`
        SELECT r.* FROM recurring_items r
        JOIN users u ON r.user_id = u.id
        WHERE u.family_id = ? AND r.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.categories = this.db.prepare(`
        SELECT c.* FROM categories c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE (c.user_id IS NULL OR u.family_id = ?) AND c.updated_at > ?
      `).all(familyId, sinceTime);
    });

    processSync();
    return result;
  }
}

module.exports = AppDatabase;

