const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const Database = require('./database/db');
const { createExpressApp, buildHandlers, PUBLIC_CHANNELS, createOwnershipChecks } = require('./server/core');
const UpdaterService = require('./updater-service');

let mainWindow;
let db;
let updaterService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1340, height: 820, minWidth: 1100, minHeight: 700,
    frame: false, titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: true, backgroundColor: '#0a0d14'
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'app.html'));

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (${path.basename(sourceId)}:${line})`);
  });
}

let activeSession = null;

app.whenReady().then(() => {
  db = new Database();
  db.initialize();

  // Start LAN Express Server for Mobile/Web access on local network
  const { app: expressApp } = createExpressApp(db);
  const PORT = process.env.PORT || 3000;
  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`[LAN Server] Running on http://localhost:${PORT}`);
    console.log(`[LAN Server] Accessible on your home network!`);
    console.log(`======================================================\n`);
  });

  // Register Electron IPC handlers dynamically from core RPC handlers
  const handlers = buildHandlers(db);
  const ownershipChecks = createOwnershipChecks(db);

  for (const [channel, fn] of Object.entries(handlers)) {
    ipcMain.handle(channel, async (event, ...args) => {
      // Session & Ownership check for Electron IPC if session active
      if (!PUBLIC_CHANNELS.has(channel) && activeSession) {
        const checkFn = ownershipChecks[channel];
        if (checkFn) {
          const hasAccess = checkFn(activeSession, ...args);
          if (!hasAccess) throw new Error('Acesso negado');
        }
      }

      let res = await fn(...args);

      if (channel === 'auth:login' && res && res.success) {
        const token = db.createSession(res.user);
        activeSession = db.getSession(token);
      }

      return res;
    });
  }

  // Desktop native file dialog overrides
  ipcMain.removeHandler('backup:export');
  ipcMain.handle('backup:export', async () => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `backup-financeiro-${new Date().toISOString().split('T')[0]}.db`,
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    if (filePath) { db.backup(filePath); return { success: true }; }
    return { success: false };
  });

  ipcMain.removeHandler('backup:exportExcel');
  ipcMain.handle('backup:exportExcel', async (e, { userId, month, year, type }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: type === 'monthly' 
          ? `relatorio-mensal-${year}-${String(month).padStart(2, '0')}.xlsx`
          : `relatorio-anual-${year}.xlsx`,
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
      });

      if (!filePath) return { success: false, message: 'Cancelado' };

      const res = await handlers['backup:exportExcel']({ userId, month, year, type });
      if (res && res.success && res.content) {
        const buffer = Buffer.from(res.content, 'base64');
        fs.writeFileSync(filePath, buffer);
        return { success: true, filePath };
      }
      return res;
    } catch (err) {
      console.error('Erro na exportação Excel nativa:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.removeHandler('backup:exportJson');
  ipcMain.handle('backup:exportJson', async (e, { userId }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'Arquivo JSON', extensions: ['json'] }]
      });
      if (!filePath) return { success: false, message: 'Cancelado' };

      const data = db.exportFullJson(userId);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true, filePath };
    } catch (err) {
      console.error('Erro ao exportar JSON nativo:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.removeHandler('backup:exportCsv');
  ipcMain.handle('backup:exportCsv', async (e, { userId, month, year, type }) => {
    try {
      const filename = type === 'monthly'
        ? `extrato-${year}-${String(month).padStart(2, '0')}.csv`
        : `extrato-anual-${year}.csv`;

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [{ name: 'Arquivo CSV', extensions: ['csv'] }]
      });
      if (!filePath) return { success: false, message: 'Cancelado' };

      const csvContent = db.exportTransactionsCsv({ userId, month, year, type });
      fs.writeFileSync(filePath, csvContent, 'utf8');
      return { success: true, filePath };
    } catch (err) {
      console.error('Erro ao exportar CSV nativo:', err);
      return { success: false, error: err.message };
    }
  });

  createWindow();
  updaterService = new UpdaterService(mainWindow, db);
  updaterService.registerIpcHandlers();

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// Window control IPCs
ipcMain.handle('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.handle('window:maximize', () => mainWindow && (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()));
ipcMain.handle('window:close',    () => mainWindow && mainWindow.close());
