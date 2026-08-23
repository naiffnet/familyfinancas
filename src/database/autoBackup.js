/**
 * AUTO BACKUP MANAGER
 * Cria snapshots diários automáticos do banco SQLite com rotação de 7 dias.
 */

const fs = require('fs');
const path = require('path');

function performAutoDailyBackup(dbInstance, dbPath) {
  if (!dbInstance || !dbPath || !fs.existsSync(dbPath)) return;

  try {
    const baseDir = path.dirname(dbPath);
    const backupDir = path.join(baseDir, 'backups_auto');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const targetFile = path.join(backupDir, `financeiro_auto_${today}.db`);

    // Only create one backup per day
    if (!fs.existsSync(targetFile)) {
      dbInstance.backup(targetFile)
        .then(() => {
          console.log(`[AutoBackup] Snapshot diário criado com sucesso: ${targetFile}`);
          // Rotaciona e remove backups com mais de 7 dias
          rotateOldBackups(backupDir, 7);
        })
        .catch(err => {
          console.error('[AutoBackup] Erro ao criar backup automático:', err.message);
        });
    }
  } catch (err) {
    console.error('[AutoBackup] Falha no processo de backup:', err.message);
  }
}

function rotateOldBackups(backupDir, retentionDays = 7) {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      if (file.startsWith('financeiro_auto_') && file.endsWith('.db')) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`[AutoBackup] Backup antigo removido (rotação ${retentionDays}d): ${file}`);
        }
      }
    });
  } catch (e) {
    console.error('[AutoBackup] Erro na rotação de backups:', e.message);
  }
}

module.exports = { performAutoDailyBackup };
