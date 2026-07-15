const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode');
const XLSX = require('xlsx');
const Database = require('./src/database/db');

// Instantiate Database in standalone mode
// By default, it will save 'financeiro.db' in the project root folder.
const db = new Database();
db.initialize();

const handlers = {
  'auth:login':    (d) => db.login(d.username, d.password),
  'auth:register': (d) => db.register(d),
  'auth:getUsers': (d)  => db.getUsers(d),
  'auth:updateUser': (d) => db.updateUser(d),
  'auth:deleteUser': (id) => db.deleteUser(id),
  'auth:updatePositions': (d) => db.updateUserPositions(d.positions),
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
  
  // Backup web download handlers
  'backup:export': async () => {
    try {
      if (!fs.existsSync(db.dbPath)) {
        return { success: false, error: 'Arquivo do banco de dados não encontrado.' };
      }
      const fileBuffer = fs.readFileSync(db.dbPath);
      const filename = `backup-financeiro-${new Date().toISOString().split('T')[0]}.db`;
      return {
        success: true,
        filename,
        content: fileBuffer.toString('base64'),
        isWebDownload: true
      };
    } catch (err) {
      console.error('Erro ao exportar backup do banco:', err);
      return { success: false, error: err.message };
    }
  },

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
expressApp.use(cors());
expressApp.use(express.json({ limit: '50mb' }));

// Serve static files from the renderer directory
expressApp.use(express.static(path.join(__dirname, 'src', 'renderer')));

// Expose JSON-RPC endpoint
expressApp.post('/api/rpc', async (req, res) => {
  const { channel, args } = req.body;
  const handler = handlers[channel];
  if (!handler) {
    return res.status(404).json({ error: `RPC Handler for ${channel} not found` });
  }
  try {
    const result = await handler(...(args || []));
    res.json({ result });
  } catch (err) {
    console.error(`Error in RPC Express route ${channel}:`, err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`[Standalone Server] Running on http://localhost:${PORT}`);
  console.log(`[Standalone Server] Ready for deployment on VPS / Render / Railway!`);
  console.log(`======================================================\n`);
});
