/**
 * updater-service.js — Sistema de Auto-Update, Snapshots de BD e Rollback Seguro
 * Integração oficial com electron-updater e GitHub Releases.
 */

const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

class UpdaterService {
  constructor(mainWindow, db) {
    this.mainWindow = mainWindow;
    this.db = db;
    this.historyFile = path.join(app.getPath('userData'), 'update_history.json');
    this.isDownloading = false;
    this.updateInfo = null;

    // Configuração básica do autoUpdater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    this.initHistory();
    this.setupListeners();
  }

  initHistory() {
    try {
      if (!fs.existsSync(this.historyFile)) {
        const initialHistory = {
          currentVersion: app.getVersion(),
          installedAt: new Date().toISOString(),
          isSecurityUpdate: false,
          history: [
            {
              version: app.getVersion(),
              installedAt: new Date().toISOString(),
              isSecurityUpdate: false,
              notes: 'Versão inicial instalada'
            }
          ]
        };
        fs.writeFileSync(this.historyFile, JSON.stringify(initialHistory, null, 2), 'utf8');
      }
    } catch (e) {
      console.error('[Updater] Erro ao inicializar update_history.json:', e);
    }
  }

  getHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const raw = fs.readFileSync(this.historyFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[Updater] Erro ao ler histórico:', e);
    }
    return {
      currentVersion: app.getVersion(),
      installedAt: new Date().toISOString(),
      isSecurityUpdate: false,
      history: []
    };
  }

  saveHistory(data) {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('[Updater] Erro ao salvar histórico:', e);
    }
  }

  setupListeners() {
    autoUpdater.on('checking-for-update', () => {
      this.sendToRenderer('updater:status', { status: 'checking', message: 'Verificando atualizações no GitHub...' });
    });

    autoUpdater.on('update-available', (info) => {
      this.updateInfo = info;
      const releaseNotes = typeof info.releaseNotes === 'string' 
        ? info.releaseNotes 
        : (Array.isArray(info.releaseNotes) ? info.releaseNotes.map(n => n.note).join('\n') : '');
      
      const isSecurity = releaseNotes.toLowerCase().includes('security') || 
                         releaseNotes.toLowerCase().includes('lgpd') || 
                         releaseNotes.toLowerCase().includes('segurança');

      this.sendToRenderer('updater:status', {
        status: 'available',
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: releaseNotes || 'Melhorias de desempenho e correções gerais.',
        isSecurityUpdate: isSecurity,
        message: `Nova versão ${info.version} disponível!`
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      this.sendToRenderer('updater:status', {
        status: 'not-available',
        version: app.getVersion(),
        message: 'Você já está utilizando a versão mais recente do FinançasFamília!'
      });
    });

    autoUpdater.on('error', (err) => {
      this.isDownloading = false;
      this.sendToRenderer('updater:status', {
        status: 'error',
        error: err.message || 'Erro ao verificar ou baixar atualização',
        message: 'Falha na comunicação com o servidor de atualizações.'
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.sendToRenderer('updater:progress', {
        percent: Math.round(progressObj.percent || 0),
        bytesPerSecond: progressObj.bytesPerSecond || 0,
        transferred: progressObj.transferred || 0,
        total: progressObj.total || 0
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.isDownloading = false;
      this.sendToRenderer('updater:status', {
        status: 'downloaded',
        version: info.version,
        message: `Versão ${info.version} pronta para instalação!`
      });
    });
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  // Cria um snapshot de segurança do SQLite antes de instalar qualquer atualização
  createPreUpdateSnapshot(targetVersion) {
    try {
      const dbPath = path.join(app.getPath('userData'), 'financeiro.db');
      const backupDir = path.join(app.getPath('userData'), 'backups_auto');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      if (fs.existsSync(dbPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const snapshotPath = path.join(backupDir, `pre_update_v${app.getVersion()}_to_v${targetVersion}_${timestamp}.db`);
        
        // Se o objeto DB possuir método backup, usa o método seguro online do SQLite
        if (this.db && typeof this.db.backup === 'function') {
          this.db.backup(snapshotPath);
        } else {
          fs.copyFileSync(dbPath, snapshotPath);
        }
        console.log(`[Updater] Snapshot do banco de dados criado com sucesso em: ${snapshotPath}`);
        return snapshotPath;
      }
    } catch (err) {
      console.error('[Updater] Erro ao criar snapshot pré-update:', err);
    }
    return null;
  }

  registerIpcHandlers() {
    ipcMain.handle('updater:getInfo', () => {
      const historyData = this.getHistory();
      return {
        currentVersion: app.getVersion(),
        isSecurityUpdate: !!historyData.isSecurityUpdate,
        history: historyData.history || [],
        canRollback: !historyData.isSecurityUpdate && (historyData.history && historyData.history.length > 1)
      };
    });

    ipcMain.handle('updater:check', async () => {
      if (process.env.NODE_ENV === 'development' && !app.isPackaged) {
        return {
          status: 'not-available',
          version: app.getVersion(),
          message: 'Ambiente de desenvolvimento local (Auto-Update ativo apenas em produção instalada).'
        };
      }
      try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, versionInfo: result ? result.updateInfo : null };
      } catch (err) {
        console.warn('[Updater] Erro ao checar atualizações:', err.message);
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle('updater:download', async () => {
      if (this.isDownloading) return { success: false, message: 'Download já em andamento' };
      try {
        this.isDownloading = true;
        await autoUpdater.downloadUpdate();
        return { success: true };
      } catch (err) {
        this.isDownloading = false;
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle('updater:install', async () => {
      try {
        const targetVersion = this.updateInfo ? this.updateInfo.version : 'next';
        
        // 1. Cria snapshot pré-update do banco de dados
        this.createPreUpdateSnapshot(targetVersion);

        // 2. Atualiza o histórico local com a nova versão
        const historyData = this.getHistory();
        const isSecurity = this.updateInfo && (
          (this.updateInfo.releaseNotes || '').toLowerCase().includes('security') ||
          (this.updateInfo.releaseNotes || '').toLowerCase().includes('lgpd') ||
          (this.updateInfo.releaseNotes || '').toLowerCase().includes('segurança')
        );

        historyData.currentVersion = targetVersion;
        historyData.installedAt = new Date().toISOString();
        historyData.isSecurityUpdate = isSecurity;
        historyData.history.unshift({
          version: targetVersion,
          installedAt: new Date().toISOString(),
          isSecurityUpdate: isSecurity,
          notes: this.updateInfo?.releaseNotes || 'Atualização automática'
        });

        this.saveHistory(historyData);

        // 3. Aplica atualização e reinicia o aplicativo
        setImmediate(() => {
          autoUpdater.quitAndInstall(false, true);
        });

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle('updater:rollback', async (event, { restoreDatabase = false }) => {
      const historyData = this.getHistory();

      // Trava estrita de segurança
      if (historyData.isSecurityUpdate) {
        return {
          success: false,
          error: 'Esta versão contém correções obrigatórias de segurança e conformidade LGPD. A reversão para versões vulneráveis foi desativada para proteger a integridade dos seus dados.'
        };
      }

      if (!historyData.history || historyData.history.length < 2) {
        return {
          success: false,
          error: 'Nenhuma versão anterior registrada para restauração.'
        };
      }

      const prevVersion = historyData.history[1].version;

      // Opcional: restaurar snapshot do banco se solicitado
      if (restoreDatabase) {
        try {
          const backupDir = path.join(app.getPath('userData'), 'backups_auto');
          if (fs.existsSync(backupDir)) {
            const files = fs.readdirSync(backupDir).filter(f => f.startsWith(`pre_update_v${prevVersion}`) || f.includes(`_to_v`));
            if (files.length > 0) {
              const latestSnapshot = path.join(backupDir, files[files.length - 1]);
              const dbPath = path.join(app.getPath('userData'), 'financeiro.db');
              fs.copyFileSync(latestSnapshot, dbPath);
              console.log(`[Updater] Banco de dados restaurado para o snapshot pré-update: ${latestSnapshot}`);
            }
          }
        } catch (dbErr) {
          console.error('[Updater] Erro ao restaurar snapshot do BD no rollback:', dbErr);
        }
      }

      return {
        success: true,
        previousVersion: prevVersion,
        message: `Instrução de rollback para a versão ${prevVersion} iniciada com sucesso.`
      };
    });
  }
}

module.exports = UpdaterService;
