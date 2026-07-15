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
  },
  auth: {
    login:    (d) => ipcRenderer.invoke('auth:login', d),
    register: (d) => ipcRenderer.invoke('auth:register', d),
    getUsers: () => ipcRenderer.invoke('auth:getUsers'),
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
  },
  categories: {
    getAll: (userId) => ipcRenderer.invoke('categories:getAll', userId),
    create: (d)      => ipcRenderer.invoke('categories:create', d),
    update: (d)      => ipcRenderer.invoke('categories:update', d),
    delete: (id)     => ipcRenderer.invoke('categories:delete', id),
  },
  recurring: {
    getAll:          (userId, type, month, year) => ipcRenderer.invoke('recurring:getAll', { userId, type, month, year }),
    create:          (d)            => ipcRenderer.invoke('recurring:create', d),
    update:          (d)            => ipcRenderer.invoke('recurring:update', d),
    delete:          (id, fromDate) => ipcRenderer.invoke('recurring:delete', { id, fromDate }),
    togglePriority:  (id)           => ipcRenderer.invoke('recurring:togglePriority', id),
    getMonthly:      (d)            => ipcRenderer.invoke('recurring:getMonthly', d),
    postponeInstallment: (d)        => ipcRenderer.invoke('recurring:postponeInstallment', d),
    updatePositions: (userId, positions) => ipcRenderer.invoke('recurring:updatePositions', { userId, positions }),
  },
  transactions: {
    getAll:      (f)  => ipcRenderer.invoke('transactions:getAll', f),
    create:      (d)  => ipcRenderer.invoke('transactions:create', d),
    update:      (d)  => ipcRenderer.invoke('transactions:update', d),
    delete:      (id) => ipcRenderer.invoke('transactions:delete', id),
    togglePaid:  (id) => ipcRenderer.invoke('transactions:togglePaid', id),
    togglePaidWithDate: (id, date) => ipcRenderer.invoke('transactions:togglePaidWithDate', id, date),
    updatePositions: (userId, positions) => ipcRenderer.invoke('transactions:updatePositions', { userId, positions }),
  },
  budgets: {
    getAll: (d) => ipcRenderer.invoke('budgets:getAll', d),
    set:    (d) => ipcRenderer.invoke('budgets:set', d),
  },
  goals: {
    getAll:      (userId) => ipcRenderer.invoke('goals:getAll', userId),
    create:      (d)      => ipcRenderer.invoke('goals:create', d),
    update:      (d)      => ipcRenderer.invoke('goals:update', d),
    delete:      (id)     => ipcRenderer.invoke('goals:delete', id),
    addDeposit:  (d)      => ipcRenderer.invoke('goals:addDeposit', d),
  },
  dashboard: {
    getSummary:     (d) => ipcRenderer.invoke('dashboard:getSummary', d),
    getGeneralSummary:(d)=> ipcRenderer.invoke('dashboard:getGeneralSummary', d),
    getMonthlyChart:(d) => ipcRenderer.invoke('dashboard:getMonthlyChart', d),
    getCategoryChart:(d)=> ipcRenderer.invoke('dashboard:getCategoryChart', d),
  },
  reports: {
    getCashflow:  (d) => ipcRenderer.invoke('reports:getCashflow', d),
    getPatrimony: (d) => ipcRenderer.invoke('reports:getPatrimony', d),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    exportExcel: (d) => ipcRenderer.invoke('backup:exportExcel', d),
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
});
