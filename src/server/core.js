const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const XLSX = require('xlsx');

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

function isSameFamilyUser(db, userId, session) {
  if (!userId) return true;
  if (typeof session === 'object' && session !== null) {
    if (session.isSystemAdmin === 1 || session.profileType === 1) return true;
    if (userId === session.userId) return true;
    const sessionFamilyId = session.familyId;
    const target = db.getUserById(userId);
    return !target || !target.family_id || target.family_id === sessionFamilyId;
  }
  const target = db.getUserById(userId);
  return !target || !target.family_id || target.family_id === session;
}

const PUBLIC_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
  'families:checkName',
  'server:getInfo',
]);

const SENSITIVE_CHANNELS = new Set([
  'auth:login',
  'auth:register',
  'auth:getRecoveryQuestion',
  'auth:resetPasswordWithAnswer',
]);

function createOwnershipChecks(db) {
  return {
    'auth:updateUser': (session, d) => {
      if (d.id === session.userId) return true;
      if (session.profileType === 1 || session.profileType === 2) {
        return isSameFamilyUser(db, d.id, session.familyId);
      }
      return false;
    },
    'auth:deleteUser': (session, id) => {
      if (session.profileType === 1 || session.profileType === 2) {
        return isSameFamilyUser(db, id, session.familyId);
      }
      return false;
    },
    'auth:deleteSelf': (session, id) => id === session.userId,
    'auth:updatePositions': (session, d) => {
      if (session.profileType !== 1 && session.profileType !== 2) return false;
      if (!d || !Array.isArray(d.positions)) return false;
      for (const p of d.positions) {
        if (!isSameFamilyUser(db, p.id, session.familyId)) return false;
      }
      return true;
    },
    'settings:get': (session, userId) => userId === session.userId,
    'settings:set': (session, d) => d.userId === session.userId,
    'accounts:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(db, userId, session.familyId),
    'accounts:create': (session, d) => d.user_id === session.userId || isSameFamilyUser(db, d.user_id, session.familyId),
    'accounts:update': (session, d) => db.checkAccountFamily(d.id, session.familyId),
    'accounts:delete': (session, id) => db.checkAccountFamily(id, session.familyId),
    'accounts:transfer': (session, d) => db.checkAccountFamily(d.fromAccountId || d.from_account_id, session.familyId) && db.checkAccountFamily(d.toAccountId || d.to_account_id, session.familyId),
    'categories:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(db, userId, session.familyId),
    'categories:create': (session, d) => d.user_id === session.userId || isSameFamilyUser(db, d.user_id, session.familyId),
    'categories:update': (session, d) => db.checkCategoryFamily(d.id, session.familyId),
    'categories:delete': (session, id) => db.checkCategoryFamily(id, session.familyId),
    'recurring:getAll': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'recurring:create': (session, d) => isSameFamilyUser(db, d.user_id, session.familyId),
    'recurring:update': (session, d) => db.checkRecurringFamily(d.id, session.familyId),
    'recurring:delete': (session, d) => db.checkRecurringFamily(d.id, session.familyId),
    'recurring:togglePriority': (session, id) => db.checkRecurringFamily(id, session.familyId),
    'recurring:getMonthly': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'recurring:postponeInstallment': (session, d) => db.checkTransactionFamily(d.txId, session.familyId) && db.checkRecurringFamily(d.itemId, session.familyId),
    'recurring:updatePositions': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'transactions:getAll': (session, f) => isSameFamilyUser(db, f.userId, session.familyId),
    'transactions:create': (session, d) => isSameFamilyUser(db, d.user_id, session.familyId),
    'transactions:update': (session, d) => db.checkTransactionFamily(d.id, session.familyId),
    'transactions:delete': (session, id) => db.checkTransactionFamily(id, session.familyId),
    'transactions:togglePaid': (session, id) => db.checkTransactionFamily(id, session.familyId),
    'transactions:togglePaidWithDate': (session, id, date) => db.checkTransactionFamily(id, session.familyId),
    'transactions:updatePositions': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'invoices:getMonthly': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'invoices:pay': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'invoices:renegotiate': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'invoices:reopen': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'invoices:recalculate': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'budgets:getAll': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'budgets:set': (session, d) => isSameFamilyUser(db, d.user_id, session.familyId),
    'goals:getAll': (session, userId) => userId === session.userId || isSameFamilyUser(db, userId, session.familyId),
    'goals:create': (session, d) => isSameFamilyUser(db, d.user_id, session.familyId),
    'goals:update': (session, d) => db.checkGoalFamily(d.id, session.familyId),
    'goals:delete': (session, id) => db.checkGoalFamily(id, session.familyId),
    'goals:addDeposit': (session, d) => db.checkGoalFamily(d.goal_id, session.familyId),
    'dashboard:getSummary': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'dashboard:getGeneralSummary': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'dashboard:getMonthlyChart': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'dashboard:getCategoryChart': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'reports:getCashflow': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'reports:getPatrimony': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'permissions:get': (session, userId) => isSameFamilyUser(db, userId, session.familyId),
    'permissions:update': (session, d) => {
      if (session.profileType !== 1 && session.profileType !== 2) return false;
      return isSameFamilyUser(db, d.targetUserId, session.familyId);
    },
    'families:getAll': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'families:create': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'families:update': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'families:delete': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'server:getLogs': (session) => session.profileType === 1 || session.profileType === 2,
    'logs:getByFamily': (session, id) => id === session.familyId,
    'backup:exportExcel': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'backup:exportJson': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'backup:exportCsv': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'backup:export': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'backup:restore': (session) => session.isSystemAdmin === 1 || session.profileType === 1,
    'importer:parseOfx': (session) => true,
    'importer:parseCsv': (session) => true,
    'importer:importBatch': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'sync:pushPull': (session, d) => isSameFamilyUser(db, d.userId, session.familyId),
    'sync:findDuplicates': (session, d) => session.familyId === d.familyId || isSameFamilyUser(db, d.userId, session.familyId),
    'sync:checkCandidate': (session, d) => session.familyId === d.familyId || isSameFamilyUser(db, d.userId, session.familyId),
    'sync:mergeTransactions': (session, d) => db.checkTransactionFamily(d.primaryTxId, session.familyId) && db.checkTransactionFamily(d.duplicateTxId, session.familyId),
    'sync:mergeBatch': (session, d) => true,
    'sync:dismissDuplicate': (session, d) => !d.primaryTxId || db.checkTransactionFamily(d.primaryTxId, session.familyId),
    'sync:getHistory': (session, d) => session.familyId === d.familyId,
    'auth:exportMyData': (session, userId) => userId === session.userId,
    'auth:getUsers': (session) => true
  };
}

function buildHandlers(db) {
  return {
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
    'transactions:togglePaidWithDate': (id, date, options) => db.toggleTransactionPaidWithDate(id, date, options),
    'transactions:updatePositions': ({ userId, positions }) => db.updateTransactionPositions(userId, positions),
    'invoices:getMonthly': (d) => db.getCardInvoices(d.userId, d.month, d.year),
    'invoices:pay': (d) => db.payCardInvoice(d),
    'invoices:renegotiate': (d) => db.renegotiateCardInvoice(d),
    'invoices:reopen': (d) => db.reopenCardInvoice(d),
    'invoices:recalculate': (d) => db.recalculateCardInvoice(d),
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
    'importer:parseOfx': ({ ofxString }) => db.parseOfxStatement(ofxString),
    'importer:parseCsv': ({ csvString }) => db.parseCsvStatement(csvString),
    'importer:importBatch': (d) => db.importBankTransactions(d),
    'auth:exportMyData': (userId) => db.exportMyData(userId),
    'backup:exportExcel': async ({ userId, month, year, type }) => {
      try {
        const allTxs = db.getTransactions({ userId }); 
        const recurringItems = db.getRecurringItems(userId);

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

    'backup:export': async () => {
      try {
        if (!fs.existsSync(db.dbPath)) {
          return { success: false, error: 'Arquivo do banco de dados não encontrado.' };
        }
        const data = fs.readFileSync(db.dbPath);
        return {
          success: true,
          fileData: data.toString('base64'),
          filename: `backup-financeiro-${new Date().toISOString().split('T')[0]}.db`
        };
      } catch (err) {
        console.error('Erro ao exportar backup:', err);
        return { success: false, error: err.message };
      }
    },

    'backup:restore': async ({ fileData }) => {
      if (!fileData) {
        return { success: false, error: 'Nenhum arquivo enviado.' };
      }
      try {
        const buffer = Buffer.from(fileData, 'base64');
        const magic = buffer.slice(0, 15).toString('utf8');
        if (!magic.startsWith('SQLite format 3')) {
          return { success: false, error: 'Arquivo inválido. O arquivo enviado não é um banco de dados SQLite válido.' };
        }
        
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
          return { success: true, message: 'Banco de dados restaurado com sucesso!' };
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
        console.error('Erro ao restaurar banco de dados:', err);
        return { success: false, error: err.message };
      }
    },

    'backup:exportJson': async ({ userId }) => {
      try {
        const data = db.exportFullJson(userId);
        const jsonStr = JSON.stringify(data, null, 2);
        const base64Content = Buffer.from(jsonStr, 'utf8').toString('base64');
        const filename = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;

        return {
          success: true,
          filename,
          content: base64Content,
          isWebDownload: true
        };
      } catch (err) {
        console.error('Erro ao exportar JSON:', err);
        return { success: false, error: err.message };
      }
    },

    'sync:pushPull': (d) => db.syncPushPull(d),
    'sync:findDuplicates': (d) => db.findPotentialDuplicates(d),
    'sync:checkCandidate': (d) => db.checkDuplicateCandidate(d),
    'sync:mergeTransactions': (d) => db.mergeDuplicateTransactions(d),
    'sync:mergeBatch': (d) => db.mergeBatchTransactions(d),
    'sync:dismissDuplicate': (d) => db.dismissDuplicateConflict(d),
    'sync:getHistory': (d) => db.getDeduplicationHistory(d),
  };
}

function createExpressApp(db) {
  const app = express();
  const ownershipChecks = createOwnershipChecks(db);
  const handlers = buildHandlers(db);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "*"],
      },
    },
  }));

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.fly.dev') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      callback(new Error('Bloqueado por política de CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '50mb' }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(express.static(path.join(__dirname, '..', 'renderer')));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' }
  });

  const sensitiveChannelLimiter = (req, res, next) => {
    const { channel } = req.body;
    if (channel && SENSITIVE_CHANNELS.has(channel)) {
      return authLimiter(req, res, next);
    }
    next();
  };

  app.get('/api/admin/backup', (req, res) => {
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

  app.post('/api/rpc', sensitiveChannelLimiter, async (req, res) => {
    const { channel, args } = req.body;
    const handler = handlers[channel];
    if (!handler) {
      return res.status(404).json({ error: `RPC Handler for ${channel} not found` });
    }

    let session = null;
    if (!PUBLIC_CHANNELS.has(channel)) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      session = db.getSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
      }

      const checkFn = ownershipChecks[channel];
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
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
    }

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

      let sessionToken = null;
      if (channel === 'auth:login') {
        const { username } = args[0] || {};
        if (username) {
          recordLoginAttempt(username, result && result.success);
        }
        if (result && result.success) {
          sessionToken = db.createSession(result.user);
        }
      }

      res.json({ result, ...(sessionToken ? { sessionToken } : {}) });
    } catch (err) {
      console.error(`Error in RPC Express route ${channel}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  return { app, handlers, ownershipChecks };
}

module.exports = {
  createExpressApp,
  createOwnershipChecks,
  buildHandlers,
  PUBLIC_CHANNELS
};
