const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  isElectron: true,
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close:    () => ipcRenderer.invoke('window:close'),
  },
  server: {
    getInfo: () => ipcRenderer.invoke('server:getInfo'),
    getMetrics: () => ipcRenderer.invoke('server:getMetrics'),
  },
  auth: {
    login:    (d) => ipcRenderer.invoke('auth:login', d),
    register: (d) => ipcRenderer.invoke('auth:register', d),
    getUsers: (d) => ipcRenderer.invoke('auth:getUsers', d),
    updateUser: (d) => ipcRenderer.invoke('auth:updateUser', d),
    deleteUser: (id) => ipcRenderer.invoke('auth:deleteUser', id),
    deleteSelf: (id) => ipcRenderer.invoke('auth:deleteSelf', id),
    updatePositions: (positions) => ipcRenderer.invoke('auth:updatePositions', { positions }),
    getRecoveryQuestion: (username) => ipcRenderer.invoke('auth:getRecoveryQuestion', username),
    resetPasswordWithAnswer: (d) => ipcRenderer.invoke('auth:resetPasswordWithAnswer', d),
    exportMyData: (userId) => ipcRenderer.invoke('auth:exportMyData', userId),
  },
  settings: {
    get: (userId)      => ipcRenderer.invoke('settings:get', userId),
    set: (userId, key, value) => ipcRenderer.invoke('settings:set', { userId, key, value }),
  },
  accounts: {
    getAll:   (userId) => ipcRenderer.invoke('accounts:getAll', userId),
    create:   (d)      => ipcRenderer.invoke('accounts:create', d),
    update:   (d)      => ipcRenderer.invoke('accounts:update', d),
    delete:   (id)     => ipcRenderer.invoke('accounts:delete', id),
    transfer: (d)      => ipcRenderer.invoke('accounts:transfer', d),
    reconcileOfx: (d)  => ipcRenderer.invoke('accounts:reconcileOfx', d),
    executeReconciliation: (d) => ipcRenderer.invoke('accounts:executeReconciliation', d),
  },
  categories: {
    getAll: (userId) => ipcRenderer.invoke('categories:getAll', userId),
    create: (d)      => ipcRenderer.invoke('categories:create', d),
    update: (d)      => ipcRenderer.invoke('categories:update', d),
    delete: (id)     => ipcRenderer.invoke('categories:delete', id),
  },
  recurring: {
    getAll:          (userId, type, month, year) => (typeof userId === 'object' && userId !== null ? ipcRenderer.invoke('recurring:getAll', userId) : ipcRenderer.invoke('recurring:getAll', { userId, type, month, year })),
    create:          (d)            => ipcRenderer.invoke('recurring:create', d),
    update:          (d)            => ipcRenderer.invoke('recurring:update', d),
    delete:          (id, fromDate) => ipcRenderer.invoke('recurring:delete', { id, fromDate }),
    togglePriority:  (id)           => ipcRenderer.invoke('recurring:togglePriority', id),
    getMonthly:      (d)            => ipcRenderer.invoke('recurring:getMonthly', d),
    postponeInstallment: (d)        => ipcRenderer.invoke('recurring:postponeInstallment', d),
    updatePositions: (userId, positions) => ipcRenderer.invoke('recurring:updatePositions', { userId, positions }),
    getSubscriptionRadar: (userId) => ipcRenderer.invoke('recurring:getSubscriptionRadar', userId),
  },
  transactions: {
    getAll:      (f)  => ipcRenderer.invoke('transactions:getAll', f),
    create:      (d)  => ipcRenderer.invoke('transactions:create', d),
    update:      (d)  => ipcRenderer.invoke('transactions:update', d),
    delete:      (id) => ipcRenderer.invoke('transactions:delete', id),
    togglePaid:  (id) => ipcRenderer.invoke('transactions:togglePaid', id),
    togglePaidWithDate: (id, date, options) => ipcRenderer.invoke('transactions:togglePaidWithDate', id, date, options),
    updatePositions: (userId, positions) => ipcRenderer.invoke('transactions:updatePositions', { userId, positions }),
    refund:      (d)  => ipcRenderer.invoke('transactions:refund', d),
  },
  invoices: {
    getMonthly:      (d) => ipcRenderer.invoke('invoices:getMonthly', d),
    pay:             (d) => ipcRenderer.invoke('invoices:pay', d),
    payPartial:      (d) => ipcRenderer.invoke('cards:payInvoicePartial', d),
    anticipate:      (d) => ipcRenderer.invoke('cards:advanceInstallments', d),
    getAdvanceable:  (d) => ipcRenderer.invoke('cards:getAdvanceableInstallments', d),
    advance:         (d) => ipcRenderer.invoke('cards:advanceInstallments', d),
    renegotiate:     (d) => ipcRenderer.invoke('invoices:renegotiate', d),
    reopen:          (d) => ipcRenderer.invoke('invoices:reopen', d),
    recalculate:     (d) => ipcRenderer.invoke('invoices:recalculate', d),
  },
  budgets: {
    getAll: (d) => ipcRenderer.invoke('budgets:getAll', d),
    set:    (d) => ipcRenderer.invoke('budgets:set', d),
  },
  goals: {
    getAll:         (userId) => ipcRenderer.invoke('goals:getAll', userId),
    create:         (d)      => ipcRenderer.invoke('goals:create', d),
    update:         (d)      => ipcRenderer.invoke('goals:update', d),
    delete:         (id)     => ipcRenderer.invoke('goals:delete', id),
    addDeposit:     (d)      => ipcRenderer.invoke('goals:addDeposit', d),
    getSimulations: (userId) => ipcRenderer.invoke('goals:getSimulations', userId),
  },
  dashboard: {
    getSummary:     (d) => ipcRenderer.invoke('dashboard:getSummary', d),
    getGeneralSummary:(d)=> ipcRenderer.invoke('dashboard:getGeneralSummary', d),
    getMonthlyChart:(d) => ipcRenderer.invoke('dashboard:getMonthlyChart', d),
    getCategoryChart:(d)=> ipcRenderer.invoke('dashboard:getCategoryChart', d),
  },
  reports: {
    getCashflow:          (d) => ipcRenderer.invoke('reports:getCashflow', d),
    getPatrimony:         (d) => ipcRenderer.invoke('reports:getPatrimony', d),
    getInterestAudit:     (d) => ipcRenderer.invoke('reports:getInterestAudit', d),
    getPredictiveCashflow:(d) => ipcRenderer.invoke('reports:getPredictiveCashflow', d),
    getBudget503020:      (d) => ipcRenderer.invoke('reports:getBudget503020', d),
    getPatrimonyAllocation:(d)=> ipcRenderer.invoke('reports:getPatrimonyAllocation', d),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    restore: (d) => ipcRenderer.invoke('backup:restore', d),
    testIntegrity: (d) => ipcRenderer.invoke('backup:testIntegrity', d),
    exportExcel: (d) => ipcRenderer.invoke('backup:exportExcel', d),
    exportJson: (d) => ipcRenderer.invoke('backup:exportJson', d),
    exportCsv: (d) => ipcRenderer.invoke('backup:exportCsv', d),
  },
  permissions: {
    get: (userId) => ipcRenderer.invoke('permissions:get', userId),
    update: (data) => ipcRenderer.invoke('permissions:update', data),
  },
  families: {
    getAll: () => ipcRenderer.invoke('families:getAll'),
    create: (d) => ipcRenderer.invoke('families:create', d),
    update: (d) => ipcRenderer.invoke('families:update', d),
    delete: (id) => ipcRenderer.invoke('families:delete', id),
    checkName: (name) => ipcRenderer.invoke('families:checkName', name),
  },
  logs: {
    get: () => ipcRenderer.invoke('server:getLogs'),
    getByFamily: (id) => ipcRenderer.invoke('logs:getByFamily', id),
  },
  audit: {
    getLogs: (d) => ipcRenderer.invoke('audit:getLogs', d),
  },
  importer: {
    parseOfx: (ofxString) => ipcRenderer.invoke('importer:parseOfx', { ofxString }),
    parseCsv: (csvString) => ipcRenderer.invoke('importer:parseCsv', { csvString }),
    importBatch: (d) => ipcRenderer.invoke('importer:importBatch', d),
  },
  sync: {
    getStatus: (d) => ipcRenderer.invoke('sync:getStatus', d),
    pushPull: (d) => ipcRenderer.invoke('sync:pushPull', d),
    findDuplicates: (d) => ipcRenderer.invoke('sync:findDuplicates', d),
    checkCandidate: (d) => ipcRenderer.invoke('sync:checkCandidate', d),
    mergeTransactions: (d) => ipcRenderer.invoke('sync:mergeTransactions', d),
    mergeBatch: (d) => ipcRenderer.invoke('sync:mergeBatch', d),
    dismissDuplicate: (d) => ipcRenderer.invoke('sync:dismissDuplicate', d),
    getHistory: (d) => ipcRenderer.invoke('sync:getHistory', d),
  },
  updater: {
    getInfo: () => ipcRenderer.invoke('updater:getInfo'),
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    rollback: (opts) => ipcRenderer.invoke('updater:rollback', opts || {}),
    onStatus: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('updater:status', listener);
      return () => ipcRenderer.removeListener('updater:status', listener);
    },
    onProgress: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('updater:progress', listener);
      return () => ipcRenderer.removeListener('updater:progress', listener);
    }
  },
});
