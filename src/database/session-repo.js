const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class SessionRepository {
  constructor(db) {
    this.db = db;
  }

  ensureTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        profile_type INTEGER NOT NULL,
        is_system_admin INTEGER DEFAULT 0,
        expires_at INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  saveSession(token, user) {
    this.ensureTable();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions 
      (token, user_id, username, family_id, profile_type, is_system_admin, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      token,
      user.id,
      user.username,
      user.family_id,
      user.profile_type,
      user.is_system_admin || 0,
      expiresAt
    );
    this.cleanupExpired();
    return {
      userId: user.id,
      username: user.username,
      familyId: user.family_id,
      profileType: user.profile_type,
      isSystemAdmin: user.is_system_admin || 0,
      expiresAt
    };
  }

  getSession(token) {
    if (!token) return null;
    this.ensureTable();
    const stmt = this.db.prepare("SELECT * FROM sessions WHERE token = ?");
    const row = stmt.get(token);
    if (!row) return null;

    if (row.expires_at < Date.now()) {
      this.deleteSession(token);
      return null;
    }

    return {
      userId: row.user_id,
      username: row.username,
      familyId: row.family_id,
      profileType: row.profile_type,
      isSystemAdmin: row.is_system_admin,
      expiresAt: row.expires_at
    };
  }

  deleteSession(token) {
    if (!token) return;
    this.ensureTable();
    this.db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }

  cleanupExpired() {
    try {
      this.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
    } catch (e) {}
  }
}

module.exports = SessionRepository;
