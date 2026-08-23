/**
 * src/database/db-family-users.js
 * Gestão de usuários, famílias, perfis, permissões, sessões e auditoria LGPD.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { encryptField, decryptField } = require('./crypto-utils');

module.exports = (Base) => class extends Base {
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

};
