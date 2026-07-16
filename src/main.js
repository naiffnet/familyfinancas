const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const Database = require('./database/db');
const express = require('express');
const cors = require('cors');
const os = require('os');
const qrcode = require('qrcode');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

let mainWindow;
let db;

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
  mainWindow.webContents.openDevTools();

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

app.whenReady().then(() => {
  db = new Database();
  db.initialize();
  
  // Start LAN Web Server
  startLocalServer();

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// Window controls (handled natively by Electron)
ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.handle('window:close',    () => mainWindow.close());

let activeSession = null;
const sessions = new Map();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    familyId: user.family_id,
    profileType: user.profile_type,
    isSystemAdmin: user.is_system_admin || 0,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function isSameFamilyUser(userId, sessionFamilyId) {
  const target = db.getUserById(userId);
  return !!target && target.family_id === sessionFamilyId;
}

// Centralized ownership mapping for IDOR prevention
const OWNERSHIP_CHECKS = {
  'auth:updateUser': (session, d) => {
    if (d.id === session.userId) return true;
    if (session.profileType === 1 || session.profileType === 2) {
      return isSameFamilyUser(d.id, session.familyId);
    }
    return false;
  },
  'auth:deleteUser': (session, id) => {
    if (session.profileType === 1 || session.profileType === 2) {
      return isSameFamilyUser(id, session.familyId);
    }
    return false;
  },
  'auth:deleteSelf': (session, id) => id === session.userId,
  'auth:updatePositions': (session, d) => {
    if (session.profileType !== 1 && session.profileType !== 2) return false;
    if (!d || !Array.isArray(d.positions)) return false;
    for (const p of d.positions) {
      if (!isSameFamilyUser(p.id, session.familyId)) return false;
    }
    return true;
  },
  'settings:get': (session, userId) => userId === session.userId,
  'settings:set': (session, d) => d.userId === session.userId,
  'accounts:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(userId, session.familyId),
  'accounts:create': (session, d) => d.user_id === session.userId || isSameFamilyUser(d.user_id, session.familyId),
  'accounts:update': (session, d) => db.checkAccountFamily(d.id, session.familyId),
  'accounts:delete': (session, id) => db.checkAccountFamily(id, session.familyId),
  'accounts:transfer': (session, d) => db.checkAccountFamily(d.fromAccountId, session.familyId) && db.checkAccountFamily(d.toAccountId, session.familyId),
  'categories:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(userId, session.familyId),
  'categories:create': (session, d) => d.user_id === session.userId || isSameFamilyUser(d.user_id, session.familyId),
  'categories:update': (session, d) => db.checkCategoryFamily(d.id, session.familyId),
  'categories:delete': (session, id) => db.checkCategoryFamily(id, session.familyId),
  'recurring:getAll': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'recurring:create': (session, d) => isSameFamilyUser(d.user_id, session.familyId),
  'recurring:update': (session, d) => db.checkRecurringFamily(d.id, session.familyId),
  'recurring:delete': (session, d) => db.checkRecurringFamily(d.id, session.familyId),
  'recurring:togglePriority': (session, id) => db.checkRecurringFamily(id, session.familyId),
  'recurring:getMonthly': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'recurring:postponeInstallment': (session, d) => db.checkTransactionFamily(d.txId, session.familyId) && db.checkRecurringFamily(d.itemId, session.familyId),
  'recurring:updatePositions': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'transactions:getAll': (session, f) => isSameFamilyUser(f.userId, session.familyId),
  'transactions:create': (session, d) => isSameFamilyUser(d.user_id, session.familyId),
  'transactions:update': (session, d) => db.checkTransactionFamily(d.id, session.familyId),
  'transactions:delete': (session, id) => db.checkTransactionFamily(id, session.familyId),
  'transactions:togglePaid': (session, id) => db.checkTransactionFamily(id, session.familyId),
  'transactions:togglePaidWithDate': (session, id, date) => db.checkTransactionFamily(id, session.familyId),
  'transactions:updatePositions': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'budgets:getAll': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'budgets:set': (session, d) => isSameFamilyUser(d.user_id, session.familyId),
  'goals:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(userId, session.familyId),
  'goals:create': (session, d) => isSameFamilyUser(d.user_id, session.familyId),
  'goals:update': (session, d) => db.checkGoalFamily(d.id, session.familyId),
  'goals:delete': (session, id) => db.checkGoalFamily(id, session.familyId),
  'goals:addDeposit': (session, d) => db.checkGoalFamily(d.goal_id, session.familyId),
  'dashboard:getSummary': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'dashboard:getGeneralSummary': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'dashboard:getMonthlyChart': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'dashboard:getCategoryChart': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'reports:getCashflow': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'reports:getPatrimony': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'permissions:get': (session, userId) => isSameFamilyUser(userId, session.familyId),
  'permissions:update': (session, d) => {
    if (session.profileType !== 1 && session.profileType !== 2) return false;
    return isSameFamilyUser(d.targetUserId, session.familyId);
  },
  'families:getAll': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
  'families:create': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
  'families:update': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
  'families:delete': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
  'server:getLogs': (session) => session.profileType === 1 || session.profileType === 2,
  'logs:getByFamily': (session, id) => id === session.familyId,
  'backup:exportExcel': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'auth:exportMyData': (session, userId) => userId === session.userId,
  'auth:getUsers': (session) => true
};

const PUBLIC_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
  'families:checkName',
  'server:getInfo',
]);

// Unified database and business logic handlers map
const handlers = {
  'auth:login':    (d) => db.login(d.username, d.password),
  'auth:register': (d) => db.register(d),
  'auth:getUsers': (d)  => db.getUsers(d),
  'auth:updateUser': (d) => db.updateUser(d),
  'auth:deleteUser': (id) => db.deleteUser(id),
  'auth:deleteSelf': (id) => db.deleteUserAccount(id),
  'auth:updatePositions': (d) => db.updateUserPositions(d.positions),
  'auth:getRecoveryQuestion': (username) => db.getRecoveryQuestion(username),
  'auth:resetPasswordWithAnswer': ({ username, answer, newPassword }) => db.resetPasswordWithAnswer(username, answer, newPassword),
  'settings:get': (userId) => db.getSettings(userId),
  'settings:set': ({ userId, key, value }) => db.setSetting(userId, key, value),
  'accounts:getAll': (userId) => db.getAccounts(userId),
  'accounts:create': (d) => db.createAccount(d),
  'accounts:update': (d) => db.updateAccount(d),
  'accounts:delete': (id) => db.deleteAccount(id),
  'accounts:transfer': (d) => db.transferBetweenAccounts(d),
  'categories:getAll': (userId) => db.getCategories(userId),
  'categories:create': (d) => db.createCategory(d),
  'categories:update': (d) => db.updateCategory(d),
  'categories:delete': (id) => db.deleteCategory(id),
  'recurring:getAll': ({ userId, type, month, year }) => db.getRecurringItems(userId, type, month, year),
  'recurring:create': (d) => db.createRecurringItem(d),
  'recurring:update': (d) => db.updateRecurringItem(d),
  'recurring:delete': ({ id, fromDate }) => db.deleteRecurringItem(id, fromDate),
  'recurring:togglePriority': (id) => db.toggleRecurringPriority(id),
  'recurring:getMonthly': (d) => db.getMonthlyTransactionsByRecurring(d.userId, d.month, d.year),
  'recurring:postponeInstallment': ({ txId, itemId }) => db.postponeRecurringInstallment({ txId, itemId }),
  'recurring:updatePositions': ({ userId, positions }) => db.updateRecurringPositions(userId, positions),
  'transactions:getAll': (f) => db.getTransactions(f),
  'transactions:create': (d) => db.createTransaction(d),
  'transactions:update': (d) => db.updateTransaction(d),
  'transactions:delete': (id) => db.deleteTransaction(id),
  'transactions:togglePaid': (id) => db.toggleTransactionPaid(id),
  'transactions:togglePaidWithDate': (id, date) => db.toggleTransactionPaidWithDate(id, date),
  'transactions:updatePositions': ({ userId, positions }) => db.updateTransactionPositions(userId, positions),
  'budgets:getAll': (d) => db.getBudgets(d.userId, d.month, d.year),
  'budgets:set': (d) => db.setBudget(d),
  'goals:getAll': (userId) => db.getGoals(userId),
  'goals:create': (d) => db.createGoal(d),
  'goals:update': (d) => db.updateGoal(d),
  'goals:delete': (id) => db.deleteGoal(id),
  'goals:addDeposit': (d) => db.addGoalDeposit(d),
  'dashboard:getSummary': (d) => db.getDashboardSummary(d.userId, d.month, d.year),
  'dashboard:getGeneralSummary': (d) => db.getGeneralDashboardSummary(d.userId),
  'dashboard:getMonthlyChart': (d) => db.getMonthlyChart(d.userId, d.months),
  'dashboard:getCategoryChart': (d) => db.getCategoryChart(d.userId, d.month, d.year),
  'reports:getCashflow': (d) => db.getCashflow(d.userId, d.month, d.year),
  'reports:getPatrimony': (d) => db.getPatrimony(d.userId),
  'permissions:get': (userId) => db.getUserPermissions(userId),
  'permissions:update': (data) => db.updateUserPermissions(data),
  'families:getAll': () => db.getFamilies(),
  'families:create': (d) => db.createFamily(d),
  'families:update': (d) => db.updateFamily(d),
  'families:delete': (id) => db.deleteFamily(id),
  'families:checkName': (name) => db.checkFamilyName(name),
  'server:getLogs': () => db.getServerLogs(),
  'logs:getByFamily': (id) => db.getFamilyLogs(id),
  'auth:exportMyData': (userId) => db.exportMyData(userId),
  'server:getInfo': async () => {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
    const primaryIp = ips[0] || 'localhost';
    const port = 3000;
    const url = `http://${primaryIp}:${port}`;
    let qrCode = '';
    try {
      qrCode = await qrcode.toDataURL(url, { margin: 2, scale: 6 });
    } catch (err) {
      console.error('Error generating QR Code:', err);
    }
    return {
      port,
      ips,
      qrCode,
      url
    };
  }
};

// Register all IPC handlers dynamically
for (const [channel, handler] of Object.entries(handlers)) {
  ipcMain.handle(channel, async (event, ...args) => {
    // IPC Ownership IDOR checks for multiple profiles
    if (!PUBLIC_CHANNELS.has(channel)) {
      if (!activeSession) {
        return { error: 'Sessão principal não autenticada.' };
      }
      const checkFn = OWNERSHIP_CHECKS[channel];
      if (checkFn) {
        try {
          const hasAccess = checkFn(activeSession, ...args);
          if (!hasAccess) {
            return { error: 'Acesso negado a este recurso (IDOR bloqueado).' };
          }
        } catch (err) {
          return { error: 'Erro de autorização.' };
        }
      } else {
        return { error: 'Acesso negado (recurso não mapeado).' };
      }
    }

    try {
      let result;
      if (channel === 'auth:getUsers') {
        result = await db.getUsers({ familyId: activeSession.familyId });
      } else {
        result = await handler(...args);
      }

      // Sync activeSession context on login/register success
      if (channel === 'auth:login' && result && result.success) {
        activeSession = {
          userId: result.user.id,
          username: result.user.username,
          familyId: result.user.family_id,
          profileType: result.user.profile_type,
          isSystemAdmin: result.user.is_system_admin || 0
        };
      }
      return result;
    } catch (err) {
      console.error(`Error in IPC channel ${channel}:`, err);
      return { error: err.message };
    }
  });
}

const SENSITIVE_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
]);

function startLocalServer() {
  const expressApp = express();

  expressApp.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "*"],
      },
    },
  }));
  expressApp.use(cors());
  expressApp.use(express.json({ limit: '50mb' }));

  // Limit sensitive channels conditionally on LAN server
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
  });

  const sensitiveLimiter = (req, res, next) => {
    const { channel } = req.body;
    if (channel && SENSITIVE_CHANNELS.has(channel)) {
      return authLimiter(req, res, next);
    }
    next();
  };

  // Serve static files from renderer directory
  expressApp.use(express.static(path.join(__dirname, 'renderer')));

  // Expose JSON-RPC endpoint for LAN devices
  expressApp.post('/api/rpc', sensitiveLimiter, async (req, res) => {
    const { channel, args } = req.body;
    const handler = handlers[channel];
    if (!handler) {
      return res.status(404).json({ error: `RPC Handler for ${channel} not found` });
    }

    let session = null;
    if (!PUBLIC_CHANNELS.has(channel)) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      session = getSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
      }

      // LAN Server ownership check
      const checkFn = OWNERSHIP_CHECKS[channel];
      if (checkFn) {
        try {
          const hasAccess = checkFn(session, ...(args || []));
          if (!hasAccess) {
            return res.status(403).json({ error: 'Acesso negado.' });
          }
        } catch (err) {
          return res.status(403).json({ error: 'Erro de autorização.' });
        }
      } else {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    try {
      let result;
      if (channel === 'auth:getUsers') {
        result = await db.getUsers({ familyId: session.familyId });
      } else {
        result = await handler(...(args || []));
      }

      let sessionToken = null;
      if (channel === 'auth:login' && result && result.success) {
        sessionToken = createSession(result.user);
      }

      res.json({ result, ...(sessionToken ? { sessionToken } : {}) });
    } catch (err) {
      console.error(`Error in RPC Express route ${channel}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  const PORT = 3000;
  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`[LAN Server] Running on http://localhost:${PORT}`);
    console.log(`[LAN Server] Accessible on your home network!`);
    console.log(`======================================================\n`);
  });
}

// Backup
ipcMain.handle('backup:export', async () => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: `backup-financeiro-${new Date().toISOString().split('T')[0]}.db`,
    filters: [{ name: 'Database', extensions: ['db'] }]
  });
  if (filePath) { db.backup(filePath); return { success: true }; }
  return { success: false };
});

ipcMain.handle('backup:restore', async (e, { fileData }) => {
  try {
    if (!fileData) {
      return { success: false, error: 'Nenhum dado de arquivo enviado.' };
    }
    const buffer = Buffer.from(fileData, 'base64');
    const magic = buffer.slice(0, 15).toString('utf8');
    if (!magic.startsWith('SQLite format 3')) {
      return { success: false, error: 'Arquivo inválido. O arquivo enviado não é um banco de dados SQLite válido.' };
    }

    // Close SQLite database
    db.db.close();

    const backupPath = db.dbPath + '.bak';
    try {
      if (fs.existsSync(db.dbPath)) {
        fs.copyFileSync(db.dbPath, backupPath);
      }
      fs.writeFileSync(db.dbPath, buffer);
      db.initialize();
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
      return { success: true };
    } catch (writeErr) {
      if (fs.existsSync(backupPath)) {
        try {
          fs.copyFileSync(backupPath, db.dbPath);
          fs.unlinkSync(backupPath);
        } catch (e) {}
      }
      db.initialize();
      throw writeErr;
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Excel Export
ipcMain.handle('backup:exportExcel', async (e, { userId, month, year, type }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: type === 'monthly' 
        ? `relatorio-mensal-${year}-${String(month).padStart(2, '0')}.xlsx`
        : `relatorio-anual-${year}.xlsx`,
      filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
    });

    if (!filePath) return { success: false, message: 'Cancelado' };

    // Fetch all transactions and recurring items for the user
    const allTxs = db.getTransactions({ userId }); 
    const recurringItems = db.getRecurringItems(userId);

    // Filter transactions based on the selected year and month
    const filteredTxs = allTxs.filter(t => {
      const isYearMatch = t.date.startsWith(year + '-');
      if (type === 'monthly') {
        const isMonthMatch = t.date.startsWith(year + '-' + String(month).padStart(2, '0') + '-');
        return isMonthMatch;
      }
      return isYearMatch;
    });

    const wb = XLSX.utils.book_new();

    if (type === 'monthly') {
      const mStr = String(month).padStart(2, '0');
      
      // Sheet 1: Resumo do Mês
      const incomeTxs = filteredTxs.filter(t => t.type === 'income');
      const expenseTxs = filteredTxs.filter(t => t.type === 'expense');
      
      const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      const summaryData = [
        ['RESUMO MENSAL', `${mStr}/${year}`],
        [],
        ['Indicador', 'Valor (R$)'],
        ['Total de Receitas', totalIncome],
        ['Total de Despesas', totalExpense],
        ['Saldo Líquido', balance],
        [],
        ['STATUS DAS DESPESAS', ''],
        ['Despesas Pagas', expenseTxs.filter(t => t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0)],
        ['Despesas Pendentes', expenseTxs.filter(t => t.is_paid === 0).reduce((sum, t) => sum + t.amount, 0)],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

      // Sheet 2: Transações do Mês
      const txRows = filteredTxs.map(t => ({
        'Data': t.date.split('-').reverse().join('/'),
        'Descrição': t.description,
        'Categoria': (t.category_icon || '') + ' ' + (t.category_name || ''),
        'Conta/Cartão': t.account_name || '',
        'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
        'Valor (R$)': t.amount,
        'Status': t.is_paid === 1 ? 'Pago' : 'Pendente'
      }));

      const wsTxs = XLSX.utils.json_to_sheet(txRows);
      XLSX.utils.book_append_sheet(wb, wsTxs, 'Lançamentos');

      // Sheet 3: Planejamento
      const recRows = recurringItems.map(r => ({
        'Nome': r.name,
        'Categoria': (r.cat_icon || '') + ' ' + (r.category_name || ''),
        'Tipo': r.type === 'income' ? 'Receita' : 'Despesa',
        'Valor (R$)': r.amount,
        'Dia de Vencimento': r.due_day,
        'Conta Vinculada': r.account_name || '',
        'Prioridade': r.is_priority === 1 ? 'Sim ⭐' : 'Não'
      }));

      const wsRec = XLSX.utils.json_to_sheet(recRows);
      XLSX.utils.book_append_sheet(wb, wsRec, 'Planejamento');

    } else {
      // Sheet 1: Resumo Anual
      const monthsNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const annualSummary = [
        ['RESUMO ANUAL', String(year)],
        [],
        ['Mês', 'Receitas (R$)', 'Despesas (R$)', 'Saldo (R$)']
      ];

      let yearlyIncome = 0, yearlyExpense = 0;

      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        const mPrefix = `${year}-${mStr}-`;
        const mTxs = filteredTxs.filter(t => t.date.startsWith(mPrefix));
        
        const mIncome = mTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const mExpense = mTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const mBalance = mIncome - mExpense;

        yearlyIncome += mIncome;
        yearlyExpense += mExpense;

        annualSummary.push([monthsNames[m - 1], mIncome, mExpense, mBalance]);
      }

      annualSummary.push([]);
      annualSummary.push(['TOTAL ANUAL', yearlyIncome, yearlyExpense, yearlyIncome - yearlyExpense]);

      const wsSummary = XLSX.utils.aoa_to_sheet(annualSummary);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Anual');

      // Create 12 separate sheets (one for each month)
      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        const mPrefix = `${year}-${mStr}-`;
        const mTxs = filteredTxs.filter(t => t.date.startsWith(mPrefix));

        const sheetTxs = mTxs.map(t => ({
          'Data': t.date.split('-').reverse().join('/'),
          'Descrição': t.description,
          'Categoria': (t.category_icon || '') + ' ' + (t.category_name || ''),
          'Conta/Cartão': t.account_name || '',
          'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
          'Valor (R$)': t.amount,
          'Status': t.is_paid === 1 ? 'Pago' : 'Pendente'
        }));

        const wsMonth = XLSX.utils.json_to_sheet(sheetTxs);
        XLSX.utils.book_append_sheet(wb, wsMonth, monthsNames[m - 1]);
      }

      // Add Planejamento Recorrente sheet
      const recRows = recurringItems.map(r => ({
        'Nome': r.name,
        'Categoria': (r.cat_icon || '') + ' ' + (r.category_name || ''),
        'Tipo': r.type === 'income' ? 'Receita' : 'Despesa',
        'Valor (R$)': r.amount,
        'Dia de Vencimento': r.due_day,
        'Conta Vinculada': r.account_name || '',
        'Prioridade': r.is_priority === 1 ? 'Sim ⭐' : 'Não'
      }));

      const wsRec = XLSX.utils.json_to_sheet(recRows);
      XLSX.utils.book_append_sheet(wb, wsRec, 'Planejamento Recorrente');
    }

    XLSX.writeFile(wb, filePath);
    return { success: true, filePath };

  } catch (err) {
    console.error('Erro na exportação Excel:', err);
    return { success: false, error: err.message };
  }
});
