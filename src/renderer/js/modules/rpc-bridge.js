/* ===
 * rpc-bridge.js — L1–177 do app.js
 */

if (!window.api) {
  const SESSION_KEY = 'ff_session_token';

  const makeRpcCall = async (channel, ...args) => {
    const origin = window.location.origin;
    const token = localStorage.getItem(SESSION_KEY) || '';
    const res = await fetch(`${origin}/api/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, args })
    });

    // Session expired or invalid — force logout
    if (res.status === 401) {
      localStorage.removeItem(SESSION_KEY);
      if (token) {
        window.location.reload();
      }
      return;
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Store session token returned after a successful login
    if (data.sessionToken) {
      localStorage.setItem(SESSION_KEY, data.sessionToken);
    }

    // If it's a web download payload, trigger the browser download dynamically
    if (data.result && data.result.isWebDownload && data.result.content) {
      const binaryString = atob(data.result.content);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.result.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }

    return data.result;
  };

  window.api = {
    isElectron: false,
    window: {
      minimize: () => {},
      maximize: () => {},
      close:    () => {},
    },
    server: {
      getInfo: () => makeRpcCall('server:getInfo'),
      getMetrics: () => makeRpcCall('server:getMetrics'),
    },
    auth: {
      login:    (d) => makeRpcCall('auth:login', d),
      register: (d) => makeRpcCall('auth:register', d),
      getUsers: () => makeRpcCall('auth:getUsers'),
      updateUser: (d) => makeRpcCall('auth:updateUser', d),
      deleteUser: (id) => makeRpcCall('auth:deleteUser', id),
      deleteSelf: (id) => makeRpcCall('auth:deleteSelf', id),
      updatePositions: (positions) => makeRpcCall('auth:updatePositions', { positions }),
      getRecoveryQuestion: (username) => makeRpcCall('auth:getRecoveryQuestion', username),
      resetPasswordWithAnswer: (d) => makeRpcCall('auth:resetPasswordWithAnswer', d),
      exportMyData: (userId) => makeRpcCall('auth:exportMyData', userId),
    },
    settings: {
      get: (userId)      => makeRpcCall('settings:get', userId),
      set: (userId, key, value) => makeRpcCall('settings:set', { userId, key, value }),
    },
    accounts: {
      getAll:   (userId) => makeRpcCall('accounts:getAll', userId),
      create:   (d)      => makeRpcCall('accounts:create', d),
      update:   (d)      => makeRpcCall('accounts:update', d),
      delete:   (id)     => makeRpcCall('accounts:delete', id),
      transfer: (d)      => makeRpcCall('accounts:transfer', d),
    },
    categories: {
      getAll: (userId) => makeRpcCall('categories:getAll', userId),
      create: (d)      => makeRpcCall('categories:create', d),
      update: (d)      => makeRpcCall('categories:update', d),
      delete: (id)     => makeRpcCall('categories:delete', id),
    },
    recurring: {
      getAll:          (userId, type, month, year) => (typeof userId === 'object' && userId !== null ? makeRpcCall('recurring:getAll', userId) : makeRpcCall('recurring:getAll', { userId, type, month, year })),
      create:          (d)            => makeRpcCall('recurring:create', d),
      update:          (d)            => makeRpcCall('recurring:update', d),
      delete:          (id, fromDate) => makeRpcCall('recurring:delete', { id, fromDate }),
      togglePriority:  (id)           => makeRpcCall('recurring:togglePriority', id),
      getMonthly:      (d)            => makeRpcCall('recurring:getMonthly', d),
      postponeInstallment: (d)        => makeRpcCall('recurring:postponeInstallment', d),
      updatePositions: (userId, positions) => makeRpcCall('recurring:updatePositions', { userId, positions }),
    },
    transactions: {
      getAll:      (f)  => makeRpcCall('transactions:getAll', f),
      create:      (d)  => makeRpcCall('transactions:create', d),
      update:      (d)  => makeRpcCall('transactions:update', d),
      delete:      (id) => makeRpcCall('transactions:delete', id),
      togglePaid:  (id) => makeRpcCall('transactions:togglePaid', id),
      togglePaidWithDate: (id, date, options) => makeRpcCall('transactions:togglePaidWithDate', id, date, options),
      updatePositions: (userId, positions) => makeRpcCall('transactions:updatePositions', { userId, positions }),
      refund:      (d)  => makeRpcCall('transactions:refund', d),
    },
    invoices: {
      getMonthly:  (d) => makeRpcCall('invoices:getMonthly', d),
      pay:         (d) => makeRpcCall('invoices:pay', d),
      payPartial:  (d) => makeRpcCall('cards:payInvoicePartial', d),
      anticipate:  (d) => makeRpcCall('cards:anticipateInstallments', d),
      renegotiate: (d) => makeRpcCall('invoices:renegotiate', d),
      reopen:      (d) => makeRpcCall('invoices:reopen', d),
      recalculate: (d) => makeRpcCall('invoices:recalculate', d),
    },
    budgets: {
      getAll: (d) => makeRpcCall('budgets:getAll', d),
      set:    (d) => makeRpcCall('budgets:set', d),
    },
    goals: {
      getAll:      (userId) => makeRpcCall('goals:getAll', userId),
      create:      (d)      => makeRpcCall('goals:create', d),
      update:      (d)      => makeRpcCall('goals:update', d),
      delete:      (id)     => makeRpcCall('goals:delete', id),
      addDeposit:  (d)      => makeRpcCall('goals:addDeposit', d),
    },
    dashboard: {
      getSummary:     (d) => makeRpcCall('dashboard:getSummary', d),
      getGeneralSummary:(d)=> makeRpcCall('dashboard:getGeneralSummary', d),
      getMonthlyChart:(d) => makeRpcCall('dashboard:getMonthlyChart', d),
      getCategoryChart:(d)=> makeRpcCall('dashboard:getCategoryChart', d),
    },
    reports: {
      getCashflow:      (d) => makeRpcCall('reports:getCashflow', d),
      getPatrimony:     (d) => makeRpcCall('reports:getPatrimony', d),
      getInterestAudit: (d) => makeRpcCall('reports:getInterestAudit', d),
    },
    backup: {
      export: () => makeRpcCall('backup:export'),
      restore: (d) => makeRpcCall('backup:restore', d),
      testIntegrity: (d) => makeRpcCall('backup:testIntegrity', d),
      exportExcel: (d) => makeRpcCall('backup:exportExcel', d),
      exportJson: (d) => makeRpcCall('backup:exportJson', d),
      exportCsv: (d) => makeRpcCall('backup:exportCsv', d),
    },
    permissions: {
      get: (userId) => makeRpcCall('permissions:get', userId),
      update: (data) => makeRpcCall('permissions:update', data),
    },
    families: {
      getAll: () => makeRpcCall('families:getAll'),
      create: (d) => makeRpcCall('families:create', d),
      update: (d) => makeRpcCall('families:update', d),
      delete: (id) => makeRpcCall('families:delete', id),
      checkName: (name) => makeRpcCall('families:checkName', name),
    },
    logs: {
      get: () => makeRpcCall('server:getLogs'),
      getByFamily: (id) => makeRpcCall('logs:getByFamily', id),
    },
    audit: {
      getLogs: (d) => makeRpcCall('audit:getLogs', d),
    },
    importer: {
      parseOfx: (ofxString) => makeRpcCall('importer:parseOfx', { ofxString }),
      parseCsv: (csvString) => makeRpcCall('importer:parseCsv', { csvString }),
      importBatch: (d) => makeRpcCall('importer:importBatch', d),
    },
    sync: {
      getStatus: (d) => makeRpcCall('sync:getStatus', d),
      pushPull: (d) => makeRpcCall('sync:pushPull', d),
      findDuplicates: (d) => makeRpcCall('sync:findDuplicates', d),
      checkCandidate: (d) => makeRpcCall('sync:checkCandidate', d),
      mergeTransactions: (d) => makeRpcCall('sync:mergeTransactions', d),
      mergeBatch: (d) => makeRpcCall('sync:mergeBatch', d),
      dismissDuplicate: (d) => makeRpcCall('sync:dismissDuplicate', d),
      getHistory: (d) => makeRpcCall('sync:getHistory', d),
    },
  };
}