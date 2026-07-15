const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode');
const XLSX = require('xlsx');
const Database = require('./src/database/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Instantiate Database in standalone mode
const db = new Database();
db.initialize();

// ── SESSION MANAGEMENT ──────────────────────────────────────────────────────
// Simple in-memory session store (token → { userId, username, expiresAt })
// Sessions are cleared on server restart — users just re-login (expected behavior for auto-stop).
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
  // Cleanup expired sessions periodically to avoid memory leak
  if (sessions.size > 500) {
    for (const [t, s] of sessions) {
      if (s.expiresAt < Date.now()) sessions.delete(t);
    }
  }
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
  'families:getAll': (session) => session.isSystemAdmin === 1,
  'families:create': (session) => session.isSystemAdmin === 1,
  'families:update': (session) => session.isSystemAdmin === 1,
  'families:delete': (session) => session.isSystemAdmin === 1,
  'server:getLogs': (session) => session.profileType === 1 || session.profileType === 2,
  'logs:getByFamily': (session, id) => id === session.familyId,
  'backup:exportExcel': (session, d) => isSameFamilyUser(d.userId, session.familyId),
  'auth:exportMyData': (session, userId) => userId === session.userId
};

// Channels that don't require a valid session token
const PUBLIC_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
  'families:checkName',
  'server:getInfo',
]);

const handlers = {
  'auth:login':    (d) => db.login(d.username, d.password),
  'auth:register': (d) => db.register(d),
  'auth:getUsers': (d)  => db.getUsers(d),
  'auth:updateUser': (d) => db.updateUser(d),
  'auth:deleteUser': (id) => db.deleteUser(id),
  'auth:deleteSelf': (userId) => db.deleteUserAccount(userId),
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

  'backup:exportExcel': async ({ userId, month, year, type }) => {
    try {
      // Fetch data
      const allTxs = db.getTransactions({ userId }); 
      const recurringItems = db.getRecurringItems(userId);

      // Filter transactions
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

      // Generate base64 buffer for the workbook to download on the web client
      const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filename = type === 'monthly'
        ? `relatorio-mensal-${year}-${String(month).padStart(2, '0')}.xlsx`
        : `relatorio-anual-${year}.xlsx`;

      return {
        success: true,
        filename,
        content: excelBase64,
        isWebDownload: true
      };
    } catch (err) {
      console.error('Erro na exportação Excel:', err);
      return { success: false, error: err.message };
    }
  },

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
    const port = process.env.PORT || 3000;
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

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow same-origin + fly.dev domains + localhost for development.
// Blocks third-party websites from making requests to the server.
const corsOptions = {
  origin: (origin, callback) => {
    // Same-origin requests and curl/mobile have no origin header — allow them.
    if (!origin) return callback(null, true);
    // Allow fly.dev deployments and localhost dev server.
    if (origin.endsWith('.fly.dev') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error('Bloqueado por política de CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
expressApp.use(cors(corsOptions));
expressApp.use(express.json({ limit: '50mb' }));

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
// Used by Fly.io to confirm the app is alive after waking from auto-stop.
expressApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});



// Serve static files from the renderer directory
expressApp.use(express.static(path.join(__dirname, 'src', 'renderer')));

// ── JSON-RPC ENDPOINT ────────────────────────────────────────────────────────
// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP in this window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' }
});

const SENSITIVE_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
]);

const sensitiveChannelLimiter = (req, res, next) => {
  const { channel } = req.body;
  if (channel && SENSITIVE_CHANNELS.has(channel)) {
    return authLimiter(req, res, next);
  }
  next();
};

// Brute force username lock database
const loginAttempts = new Map();

function recordLoginAttempt(username, success) {
  const now = Date.now();
  const attempt = loginAttempts.get(username) || { count: 0, lockUntil: 0 };
  if (success) {
    loginAttempts.delete(username);
    return;
  }
  if (attempt.lockUntil > now) return;
  attempt.count++;
  if (attempt.count >= 5) {
    attempt.lockUntil = now + 5 * 60 * 1000; // 5 minute lock
  }
  loginAttempts.set(username, attempt);
}

function checkLoginLock(username) {
  const now = Date.now();
  const attempt = loginAttempts.get(username);
  if (attempt && attempt.lockUntil > now) {
    return { allowed: false, lockTimeLeft: Math.ceil((attempt.lockUntil - now) / 1000) };
  }
  return { allowed: true };
}

// Admin backup route outside /api/rpc
expressApp.get('/api/admin/backup', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_OPERATION_KEY;
  if (!expectedKey || expectedKey.length < 16) {
    console.error("[Segurança] ADMIN_OPERATION_KEY não está configurada ou é muito curta.");
    return res.status(500).json({ error: 'Erro interno de configuração do servidor.' });
  }
  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  if (!fs.existsSync(db.dbPath)) {
    return res.status(404).json({ error: 'Banco de dados não encontrado.' });
  }
  const filename = `backup-financeiro-admin-${new Date().toISOString().split('T')[0]}.db`;
  res.download(db.dbPath, filename);
});

// ── JSON-RPC ENDPOINT ────────────────────────────────────────────────────────
expressApp.post('/api/rpc', sensitiveChannelLimiter, async (req, res) => {
  const { channel, args } = req.body;
  const handler = handlers[channel];
  if (!handler) {
    return res.status(404).json({ error: `RPC Handler for ${channel} not found` });
  }

  let session = null;
  // Enforce session authentication for all non-public channels
  if (!PUBLIC_CHANNELS.has(channel)) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }

    // IDOR / Centralized Ownership check
    const checkFn = OWNERSHIP_CHECKS[channel];
    if (checkFn) {
      try {
        const hasAccess = checkFn(session, ...(args || []));
        if (!hasAccess) {
          return res.status(403).json({ error: 'Acesso negado a este recurso' });
        }
      } catch (err) {
        console.error(`Erro na checagem de posse para ${channel}:`, err);
        return res.status(403).json({ error: 'Erro de autorização' });
      }
    } else {
      // Fail secure
      return res.status(403).json({ error: 'Acesso negado a este recurso' });
    }
  }

  // Brute force username lock check
  if (channel === 'auth:login') {
    const { username } = args[0] || {};
    if (username) {
      const lockCheck = checkLoginLock(username);
      if (!lockCheck.allowed) {
        return res.status(429).json({ error: `Múltiplas tentativas incorretas. Usuário bloqueado. Tente novamente em ${lockCheck.lockTimeLeft} segundos.` });
      }
    }
  }

  try {
    let result;
    if (channel === 'auth:getUsers') {
      result = await db.getUsers({ familyId: session.familyId });
    } else {
      result = await handler(...(args || []));
    }

    // Record login attempts and handle sessions
    let sessionToken = null;
    if (channel === 'auth:login') {
      const { username } = args[0] || {};
      if (username) {
        recordLoginAttempt(username, result && result.success);
      }
      if (result && result.success) {
        sessionToken = createSession(result.user);
      }
    }

    res.json({ result, ...(sessionToken ? { sessionToken } : {}) });
  } catch (err) {
    console.error(`Error in RPC Express route ${channel}:`, err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`[Standalone Server] Running on http://localhost:${PORT}`);
  console.log(`[Standalone Server] Ready for deployment on Fly.io!`);
  console.log(`======================================================\n`);
});
