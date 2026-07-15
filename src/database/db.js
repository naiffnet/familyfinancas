const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

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
    } else if (app) {
      const userDataPath = app.getPath('userData');
      this.dbPath = path.join(userDataPath, 'financeiro.db');
    } else {
      this.dbPath = path.join(__dirname, '..', '..', 'financeiro.db');
    }
    this.db = null;
  }

  initialize() {
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.createTables();
    this.migrateSchema();
    this.seedDefaultData();
    this.generateMonthlyRecurrences();
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

        if (!exists) {
          const day = Math.min(item.due_day, new Date(targetYear, targetMonth, 0).getDate());
          const dateStr = `${y}-${m}-${String(day).padStart(2, '0')}`;
          
          const installmentSuffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const finalDescription = item.name + installmentSuffix;

          this.db.prepare(`
            INSERT INTO transactions (user_id, account_id, category_id, recurring_item_id, type, amount, description, date, is_paid, is_avulso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
          `).run(item.user_id, item.account_id, item.category_id, item.id, item.type, item.amount, finalDescription, dateStr);
        } else if (exists.is_paid === 0 && exists.is_avulso !== 2) {
          // Self-Healing: If transaction exists but is unpaid and active, ensure description is corrected
          const installmentSuffix = item.repeat_months && item.repeat_months > 0
            ? ` ${currentInstallment}/${item.repeat_months}`
            : '';
          const finalDescription = item.name + installmentSuffix;

          if (exists.description !== finalDescription) {
            console.log(`[Recorrência] Auto-corrigindo nomenclatura da transação ID ${exists.id} para "${finalDescription}"`);
            this.db.prepare(`
              UPDATE transactions SET description = ? WHERE id = ?
            `).run(finalDescription, exists.id);
          }
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

    const result = this.db.prepare(`
      INSERT INTO users (name, first_name, last_name, email, phone, cpf, birth_date, username, password_hash, avatar_color, family_id, profile_type, recovery_question, recovery_answer, accepted_terms_timestamp, accepted_terms_version) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nameToSave, firstNameToSave, lastNameToSave, email, phone, cpf, birth_date, finalUsername, hash, color, finalFamilyId, profileType, recovery_question, finalRecoveryAnswer, accepted_terms_timestamp, accepted_terms_version);
    
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
    if (familyId) {
      return this.db.prepare('SELECT id, name, first_name, last_name, email, phone, cpf, birth_date, username, avatar_color, avatar_image, family_id, profile_type, position FROM users WHERE family_id = ? ORDER BY position ASC, id ASC').all(familyId);
    }
    return this.db.prepare('SELECT id, name, first_name, last_name, email, phone, cpf, birth_date, username, avatar_color, avatar_image, family_id, profile_type, position FROM users ORDER BY position ASC, id ASC').all();
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
      const cp = cpf !== undefined ? cpf : (cur ? cur.cpf : null);
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

    if (profileType === 1) {
      // ADM Geral
      return this.db.prepare(`
        SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
        FROM accounts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.is_active = 1
        ORDER BY a.type, a.name
      `).all();
    }

    const perm = this.getUserPermissions(userId);
    if (perm.can_view_all === 1) {
      return this.db.prepare(`
        SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
        FROM accounts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.is_active = 1 AND u.family_id = ?
        ORDER BY a.type, a.name
      `).all(familyId);
    } else {
      return this.db.prepare(`
        SELECT a.*, u.name as user_name, u.avatar_color as user_avatar_color, u.username as user_username
        FROM accounts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.is_active = 1 AND a.user_id = ?
        ORDER BY a.type, a.name
      `).all(userId);
    }
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

    const r = this.db.prepare(`
      INSERT INTO accounts (user_id, name, type, bank, balance, color, credit_limit, closing_day, due_day, agency, account_number)
      VALUES (@user_id, @name, @type, @bank, @balance, @color, @credit_limit, @closing_day, @due_day, @agency, @account_number)
    `).run(data);
    const familyId = user ? user.family_id : null;
    this.logEvent('account:create', `Conta bancária "${data.name}" criada (Saldo inicial: R$ ${data.balance || 0}).`, familyId);
    return { success: true, id: r.lastInsertRowid };
  }

  updateAccount(data) {
    this.db.prepare(`
      UPDATE accounts SET user_id=@user_id, name=@name, type=@type, bank=@bank, balance=@balance, color=@color,
      credit_limit=@credit_limit, closing_day=@closing_day, due_day=@due_day,
      agency=@agency, account_number=@account_number WHERE id=@id
    `).run(data);
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
    const r = this.db.prepare(`
      INSERT INTO recurring_items (user_id, name, type, amount, category_id, account_id, due_day, is_priority, icon, color, notes, repeat_months, start_installment, created_at)
      VALUES (@user_id, @name, @type, @amount, @category_id, @account_id, @due_day, @is_priority, @icon, @color, @notes, @repeat_months, @start_installment, @created_at)
    `).run(insertData);
    const newId = r.lastInsertRowid;
    // Immediately generate this month's transaction if not exists
    this.generateMonthlyRecurrences();

    // If it's already marked as paid/received this month:
    if (is_paid) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const m = String(month).padStart(2, '0');
      const y = String(year);

      const tx = this.db.prepare(`
        SELECT id FROM transactions
        WHERE recurring_item_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `).get(newId, m, y);

      if (tx) {
        this.db.transaction(() => {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, data.account_id);
          this.db.prepare('UPDATE transactions SET is_paid = 1 WHERE id = ?').run(tx.id);
        })();
      }
    }
    return { success: true, id: newId };
  }


  updateRecurringItem(data) {
    const runUpdate = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE recurring_items SET name=@name, type=@type, amount=@amount, category_id=@category_id,
        account_id=@account_id, due_day=@due_day, is_priority=@is_priority, icon=@icon, color=@color, notes=@notes, repeat_months=@repeat_months,
        start_installment=@start_installment,
        created_at=COALESCE(@created_at, created_at)
        WHERE id=@id
      `).run(data);

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

          this.db.prepare(`
            UPDATE transactions 
            SET description = ?, amount = ?, date = ?
            WHERE id = ?
          `).run(newDesc, item.amount, newDateStr, t.id);
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
    const t = this.db.transaction(() => {
      const r = this.db.prepare(`
        INSERT INTO transactions (user_id, account_id, category_id, recurring_item_id, type, amount, description, date, is_paid, is_avulso, notes)
        VALUES (@user_id, @account_id, @category_id, @recurring_item_id, @type, @amount, @description, @date, @is_paid, @is_avulso, @notes)
      `).run(data);
      if (data.is_paid) {
        const delta = data.type === 'income' ? data.amount : -data.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, data.account_id);
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
    this.db.transaction(() => {
      if (old.is_paid) {
        const d = old.type === 'income' ? -old.amount : old.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, old.account_id);
      }
      this.db.prepare(`
        UPDATE transactions SET account_id=@account_id, category_id=@category_id, type=@type,
        amount=@amount, description=@description, date=@date, is_paid=@is_paid, notes=@notes WHERE id=@id
      `).run(data);
      if (data.is_paid) {
        const d = data.type === 'income' ? data.amount : -data.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, data.account_id);
      }
    })();
    return { success: true };
  }

  deleteTransaction(id) {
    const t = this.db.prepare('SELECT t.*, u.family_id, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(id);
    if (!t) return { success: false, error: 'Lançamento não encontrado' };
    this.db.transaction(() => {
      if (t.is_paid && t.type !== 'transfer') {
        const d = t.type === 'income' ? -t.amount : t.amount;
        this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(d, t.account_id);
      }
      if (t.recurring_item_id) {
        this.db.prepare(`
          UPDATE transactions 
          SET is_avulso = 2, amount = 0, is_paid = 0, description = '[PULADA] ' || description
          WHERE id = ?
        `).run(id);
      } else {
        this.db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
      }
    })();
    this.logEvent('transaction:delete', `Usuário "${t.user_name}" excluiu o lançamento: "${t.description}" (Valor original: R$ ${t.amount}).`, t.family_id);
    return { success: true };
  }

  toggleTransactionPaid(id) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    const newPaid = t.is_paid ? 0 : 1;
    this.db.transaction(() => {
      const delta = (t.type === 'income' ? t.amount : -t.amount) * (newPaid ? 1 : -1);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      this.db.prepare('UPDATE transactions SET is_paid = ? WHERE id = ?').run(newPaid, id);
    })();
    return { success: true };
  }

  toggleTransactionPaidWithDate(id, paymentDate) {
    const t = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    const newPaid = t.is_paid ? 0 : 1;
    this.db.transaction(() => {
      const delta = (t.type === 'income' ? t.amount : -t.amount) * (newPaid ? 1 : -1);
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(delta, t.account_id);
      this.db.prepare('UPDATE transactions SET is_paid = ?, date = ? WHERE id = ?').run(newPaid, paymentDate, id);
    })();
    return { success: true };
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
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
    } else if (perm.can_view_all === 1) {
      income = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='income' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=1 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(t.amount),0) as v FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.family_id=? AND t.type='expense' AND t.is_paid=0 AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?`).get(familyId, m, y).v;
    } else {
      income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
      expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
      pending = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=0 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
    }

    const accounts = this.getAccounts(userId);

    // Dynamic monthly balance & card spending
    const cardSpending = {};
    for (const acc of accounts) {
      if (acc.type === 'credit') {
        const cycle = getCardBillingCycle(acc.closing_day, acc.due_day, month, year);
        const spent = this.db.prepare(`
          SELECT COALESCE(SUM(amount),0) as v FROM transactions 
          WHERE account_id=? AND type='expense' 
          AND date >= ? AND date <= ?
        `).get(acc.id, cycle.start, cycle.end).v;
        cardSpending[acc.id] = spent;
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

    return { income, expense, pending, balance: income - expense, accounts, cardSpending, priorityItems, alertItems, totalRecurring, paidRecurring, alertDays };
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
    const totalCredit = creditAccounts.reduce((sum, a) => sum + (a.balance < 0 ? -a.balance : 0), 0);
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
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='income' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(m, y).v;
      } else {
        income = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='income' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
        expense = this.db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM transactions WHERE user_id=? AND type='expense' AND is_paid=1 AND strftime('%m',date)=? AND strftime('%Y',date)=?`).get(userId, m, y).v;
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
        AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
        GROUP BY t.category_id ORDER BY total DESC
      `).all(m, y);
    } else {
      return this.db.prepare(`
        SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount),0) as total
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.user_id=? AND t.type='expense' AND t.is_paid=1
        AND strftime('%m',t.date)=? AND strftime('%Y',t.date)=?
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
      `).all(m, y, familyId, m, y, userId, month, year);
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
}

module.exports = AppDatabase;
