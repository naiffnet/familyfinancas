/* ============================================
 * app.bundle.js — FamilyFinancas Renderer
 * Gerado por: npm run build:renderer
 * 2026-08-23T15:24:00.084Z
 * Modulos: 22
 * ============================================ */


/* ==== rpc-bridge.js ==== */
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
      getAll:          (userId, type, month, year) => makeRpcCall('recurring:getAll', { userId, type, month, year }),
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
    },
    invoices: {
      getMonthly:  (d) => makeRpcCall('invoices:getMonthly', d),
      pay:         (d) => makeRpcCall('invoices:pay', d),
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
      getCashflow:  (d) => makeRpcCall('reports:getCashflow', d),
      getPatrimony: (d) => makeRpcCall('reports:getPatrimony', d),
    },
    backup: {
      export: () => makeRpcCall('backup:export'),
      restore: (d) => makeRpcCall('backup:restore', d),
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
    importer: {
      parseOfx: (ofxString) => makeRpcCall('importer:parseOfx', { ofxString }),
      parseCsv: (csvString) => makeRpcCall('importer:parseCsv', { csvString }),
      importBatch: (d) => makeRpcCall('importer:importBatch', d),
    },
    sync: {
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

/* ==== state-constants.js ==== */
/* ===
 * state-constants.js — L178–718 do app.js
 */


/* ════════════════════════════════════════
   FINANÇASFAMÍLIA v2 — App JS
   Foco: Recorrências + Widget Cartões
   Configuração: LAN Server habilitada.
═════════════════════════════════════════ */

// ── State ──────────────────────────────
const State = {
  user: null,
  currentPage: 'dashboard',
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  settings: { alert_days_before: 3 },
  charts: {},
  activeDashTab: 'mensal',
  budgetUserId: null,
  currentSort: 'manual',
  highlightCardId: null,
  highlightCardColor: null,
  highlightCardName: null,
  highlightInvoiceId: null,
  highlightAccountId: null,
  highlightAccountColor: null,
  highlightAccountName: null,
  dashboardLayoutMode: localStorage.getItem('dashboard_layout_mode') || 'executive',
  activeDashSubTab: 'operation',
  dashboardCardMemberFilter: 'all',
  dashboardCardTypeFilter: 'all',
};

// ── Formatters ─────────────────────────
const fmt = {
  currency: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0),
  date: (d) => {
    if (!d) return '';
    const dateStr = d.includes(' ') ? d.split(' ')[0] : (d.includes('T') ? d.split('T')[0] : d);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parsed = new Date(dateStr + 'T12:00:00');
    return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('pt-BR');
  },
  monthYear: (m, y) => new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  time: (d) => {
    if (!d) return '';
    const isoString = d.includes(' ') ? d.replace(' ', 'T') : d;
    const dateObj = new Date(isoString);
    return isNaN(dateObj.getTime()) ? d : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
};

// ── Bank Config ────────────────────────
const BANKS = {
  nubank:    { name: 'Nubank',         color: '#820ad1', bg: '#f3e8ff', emoji: '💜', abbr: 'Nu' },
  banrisul:  { name: 'Banrisul',       color: '#005CA9', bg: '#eff6ff', emoji: '🔵', abbr: 'Banri' },
  carrefour: { name: 'Carrefour',      color: '#00569C', bg: '#eff6ff', emoji: '🔵', abbr: 'Carr' },
  itau:      { name: 'Itaú',           color: '#EC7000', bg: '#fff3e8', emoji: '🟠', abbr: 'Itaú' },
  bradesco:  { name: 'Bradesco',       color: '#CC092F', bg: '#fee2e2', emoji: '🔴', abbr: 'Brad' },
  santander: { name: 'Santander',      color: '#EC0000', bg: '#fee2e2', emoji: '🔴', abbr: 'San' },
  bb:        { name: 'Banco do Brasil',color: '#FFD700', bg: '#fefce8', emoji: '🟡', abbr: 'BB' },
  caixa:     { name: 'Caixa Econômica Federal', color: '#005CA9', bg: '#eff6ff', emoji: '🔵', abbr: 'Caixa' },
  sicoob:    { name: 'Sicoob',         color: '#003641', bg: '#e0f2fe', emoji: '🟢', abbr: 'Sicoob' },
  safra:     { name: 'Banco Safra',    color: '#001E62', bg: '#f1f5f9', emoji: '🔵', abbr: 'Safra' },
  btgpactual:{ name: 'BTG Pactual',    color: '#0A2540', bg: '#e2e8f0', emoji: '🔵', abbr: 'BTG' },
  bmg:       { name: 'Banco BMG',      color: '#FF5A00', bg: '#fff3e8', emoji: '🟠', abbr: 'BMG' },
  pagbank:   { name: 'PagBank',        color: '#00B159', bg: '#f0fdf4', emoji: '🟢', abbr: 'Pag' },
  mercadopago:{ name: 'Mercado Pago',  color: '#009EE3', bg: '#eff6ff', emoji: '🔵', abbr: 'MP' },
  inter:     { name: 'Inter',          color: '#FF6900', bg: '#fff3e8', emoji: '🟠', abbr: 'Int' },
  c6:        { name: 'C6 Bank',        color: '#242424', bg: '#f1f5f9', emoji: '⚫', abbr: 'C6' },
  sicredi:   { name: 'Sicredi',        color: '#009A44', bg: '#f0fdf4', emoji: '🟢', abbr: 'Sic' },
  xp:        { name: 'XP',             color: '#000000', bg: '#f1f5f9', emoji: '⚫', abbr: 'XP' },
  visa:      { name: 'Visa',           color: '#1A1F71', bg: '#eff6ff', emoji: '💳', abbr: 'Visa' },
  mastercard:{ name: 'Mastercard',     color: '#FF5F00', bg: '#fff3e8', emoji: '💳', abbr: 'Mast' },
  elo:       { name: 'Elo',            color: '#231F20', bg: '#f1f5f9', emoji: '💳', abbr: 'Elo' },
  ticket:    { name: 'Ticket Benefícios',color: '#EC1C24', bg: '#fee2e2', emoji: '🎟️', abbr: 'Tick' },
  vr:        { name: 'VR Benefícios',  color: '#009A44', bg: '#f0fdf4', emoji: '🎟️', abbr: 'VR' },
  sodexo:    { name: 'Sodexo / Pluxee',color: '#0F2C59', bg: '#eff6ff', emoji: '🎟️', abbr: 'Pluxee' },
  alelo:     { name: 'Alelo Benefícios',color: '#007b5f', bg: '#ecfdf5', emoji: '🎟️', abbr: 'Alelo' },
  flash:     { name: 'Flash Benefícios',color: '#ff2d55', bg: '#fff0f3', emoji: '⚡', abbr: 'Flash' },
  caju:      { name: 'Caju Benefícios', color: '#e83d6a', bg: '#fdf2f4', emoji: '🥜', abbr: 'Caju' },
  banricard: { name: 'Banricard',      color: '#005CA9', bg: '#eff6ff', emoji: '🔵', abbr: 'BanriCard' },
  swile:     { name: 'Swile Benefícios',color: '#ff4c61', bg: '#fff0f2', emoji: '🎟️', abbr: 'Swile' },
  ben:       { name: 'Ben Visa Vale',  color: '#003399', bg: '#eff6ff', emoji: '🎟️', abbr: 'Ben' },
  dinheiro:  { name: 'Dinheiro (Carteira)', color: '#10b981', bg: '#ecfdf5', emoji: '💵', abbr: 'Din' },
  outro:     { name: 'Outro',          color: '#64748b', bg: '#f1f5f9', emoji: '🏦', abbr: '?' },
};

const ACCOUNT_TYPES = { 
  checking: 'Conta Corrente', 
  savings: 'Poupança', 
  wallet: 'Carteira', 
  credit: 'Cartão de Crédito', 
  investment: 'Investimento',
  voucher: 'Cartão Benefício / Voucher'
};

const BENEFIT_TYPES = {
  va: '🍽️ Vale Alimentação (VA)',
  vr: '🍔 Vale Refeição (VR)',
  vt: '🚌 Vale Transporte (VT)',
  flex: '🌟 Flexível / Multibenefícios',
  combustivel: '⛽ Combustível / Mobilidade',
  saude: '💊 Farmácia / Saúde / Bem-Estar',
  educacao: '📚 Educação / Cultura',
  outro: '🎟️ Outro Benefício'
};
const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316','#a855f7','#14b8a6','#64748b','#84cc16'];
const ICONS_EXPENSE = ['🏠','🍽️','🚗','❤️','📚','🎮','👔','📱','📋','✈️','🐾','💄','🔧','⚡','💧','🎵','🎁','🛒','🏋️','🐕'];
const ICONS_INCOME  = ['💼','💻','📈','💰','🎯','🏆','💵','🤝','🏘️','📊'];

// ── Avatares Premium ────────────────────
const AVATARS = {
  avatar1: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-pai" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-pai)"/><path d="M28 45 C28 20, 72 20, 72 45 C65 35, 35 35, 28 45 Z" fill="#2d3748"/><rect x="44" y="60" width="12" height="15" fill="#fbd38d"/><circle cx="50" cy="48" r="18" fill="#fbd38d"/><path d="M32 48 C32 62, 68 62, 68 48 C68 68, 32 68, 32 48 Z" fill="#4a5568"/><path d="M44 55 Q50 59 56 55" stroke="#2d3748" stroke-width="2" fill="none"/><circle cx="43" cy="46" r="2.5" fill="#2d3748"/><circle cx="57" cy="46" r="2.5" fill="#2d3748"/><rect x="36" y="42" width="13" height="9" rx="2" fill="none" stroke="#2b6cb0" stroke-width="2.5"/><rect x="51" y="42" width="13" height="9" rx="2" fill="none" stroke="#2b6cb0" stroke-width="2.5"/><line x1="49" y1="46" x2="51" y2="46" stroke="#2b6cb0" stroke-width="2.5"/><path d="M30 75 Q50 82 70 75 L75 100 H25 Z" fill="#ebf8ff"/><path d="M42 75 L50 85 L58 75" fill="#3182ce"/></svg>`,
  avatar2: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-mae" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#be185d"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-mae)"/><circle cx="50" cy="42" r="25" fill="#718096"/><rect x="45" y="60" width="10" height="15" fill="#fbd38d"/><circle cx="50" cy="46" r="16" fill="#fbd38d"/><path d="M34 40 C34 25, 66 25, 66 40 C66 45, 58 35, 50 38 C42 35, 34 45, 34 40 Z" fill="#4a5568"/><path d="M34 40 L30 55 C30 55, 33 55, 35 48 Z" fill="#4a5568"/><path d="M66 40 L70 55 C70 55, 67 55, 65 48 Z" fill="#4a5568"/><circle cx="33" cy="52" r="3" fill="#ecc94b"/><circle cx="67" cy="52" r="3" fill="#ecc94b"/><path d="M40 46 Q43 43 46 46" stroke="#2d3748" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M54 46 Q57 43 60 46" stroke="#2d3748" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M44 54 Q50 59 56 54" stroke="#e53e3e" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M32 75 Q50 85 68 75 L72 100 H28 Z" fill="#feebc8"/><path d="M40 75 Q50 88 60 75" fill="none" stroke="#ed64a6" stroke-width="3"/></svg>`,
  avatar3: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-garoto" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-garoto)"/><rect x="45" y="60" width="10" height="15" fill="#fde047" opacity="0.9"/><circle cx="50" cy="48" r="16" fill="#fde047"/><path d="M30 46 C30 30, 70 30, 70 46 H30 Z" fill="#1e3a8a"/><path d="M26 44 Q50 38 74 44 L70 47 Q50 44 30 47 Z" fill="#2563eb"/><path d="M32 48 L35 52 L38 48 L41 52 L44 48" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M56 48 L59 52 L62 48 L65 52 L68 48" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="43" cy="49" r="2" fill="#1e293b"/><circle cx="57" cy="49" r="2" fill="#1e293b"/><path d="M43 55 Q50 61 57 55" stroke="#1e293b" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M32 75 L68 75 L72 100 H28 Z" fill="#f97316"/><rect x="48" y="75" width="4" height="25" fill="#ffffff" opacity="0.6"/></svg>`,
  avatar4: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-garota" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-garota)"/><circle cx="32" cy="30" r="11" fill="#4b5563"/><circle cx="68" cy="30" r="11" fill="#4b5563"/><path d="M28 36 L36 36 L32 42 Z" fill="#ec4899"/><path d="M72 36 L64 36 L68 42 Z" fill="#ec4899"/><rect x="45" y="60" width="10" height="15" fill="#fde047"/><circle cx="50" cy="48" r="16" fill="#fde047"/><path d="M34 42 C34 32, 66 32, 66 42 Q50 36 34 42 Z" fill="#4b5563"/><circle cx="42" cy="48" r="2" fill="#1e293b"/><circle cx="58" cy="48" r="2" fill="#1e293b"/><path d="M43 55 Q50 61 57 55" stroke="#ef4444" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="38" cy="53" r="2" fill="#fca5a5" opacity="0.8"/><circle cx="62" cy="53" r="2" fill="#fca5a5" opacity="0.8"/><path d="M32 75 Q50 82 68 75 L72 100 H28 Z" fill="#a855f7"/><circle cx="50" cy="85" r="4" fill="#ffffff" opacity="0.8"/></svg>`,
  avatar5: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-inv" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#5b21b6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-inv)"/><path d="M28 42 C28 20, 72 20, 72 42 Z" fill="#1f2937"/><path d="M28 42 L32 46 C32 46, 36 34, 50 34 C64 34, 68 46, 68 46 L72 42 Z" fill="#1f2937"/><rect x="44" y="60" width="12" height="15" fill="#fed7aa"/><circle cx="50" cy="46" r="16" fill="#fed7aa"/><circle cx="43" cy="45" r="2" fill="#111827"/><circle cx="57" cy="45" r="2" fill="#111827"/><circle cx="42" cy="45" r="7" fill="none" stroke="#ecc94b" stroke-width="2"/><circle cx="58" cy="45" r="7" fill="none" stroke="#ecc94b" stroke-width="2"/><line x1="49" y1="45" x2="51" y2="45" stroke="#ecc94b" stroke-width="2"/><path d="M45 54 Q50 58 55 54" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 75 L70 75 L75 100 H25 Z" fill="#1e293b"/><path d="M44 75 L50 88 L56 75 Z" fill="#ffffff"/><path d="M48 80 L52 80 L50 98 Z" fill="#3b82f6"/></svg>`,
  avatar6: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-inva" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#0891b2"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-inva)"/><circle cx="50" cy="24" r="11" fill="#111827"/><rect x="45" y="60" width="10" height="15" fill="#fed7aa"/><circle cx="50" cy="46" r="16" fill="#fed7aa"/><path d="M32 42 C32 26, 68 26, 68 42 C68 44, 58 34, 50 36 C42 34, 32 44, 32 42 Z" fill="#111827"/><path d="M41 45 Q44 42 45 45" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M55 45 Q56 42 59 45" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="36" y="42" width="12" height="7" rx="1.5" fill="none" stroke="#ef4444" stroke-width="1.8"/><rect x="52" y="42" width="12" height="7" rx="1.5" fill="none" stroke="#ef4444" stroke-width="1.8"/><line x1="48" y1="45" x2="52" y2="45" stroke="#ef4444" stroke-width="1.8"/><path d="M44 54 Q50 59 56 54" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M32 75 L68 75 L72 100 H28 Z" fill="#374151"/><path d="M42 75 L50 88 L58 75 Z" fill="#ffffff"/><path d="M42 75 L38 88 M58 75 L62 88" stroke="#1f2937" stroke-width="2"/></svg>`,
  avatar7: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-porco" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#701a75"/></linearGradient><linearGradient id="g-pele" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-porco)"/><path d="M32 38 L22 24 L34 28 Z" fill="#f472b6"/><path d="M68 38 L78 24 L66 28 Z" fill="#f472b6"/><circle cx="50" cy="54" r="24" fill="url(#g-pele)"/><ellipse cx="50" cy="58" rx="9" ry="6" fill="#f472b6" stroke="#db2777" stroke-width="1.5"/><circle cx="47" cy="58" r="1.5" fill="#9d174d"/><circle cx="53" cy="58" r="1.5" fill="#9d174d"/><circle cx="41" cy="46" r="2.5" fill="#1e293b"/><circle cx="59" cy="46" r="2.5" fill="#1e293b"/><circle cx="34" cy="52" r="2.5" fill="#f43f5e" opacity="0.4"/><circle cx="66" cy="52" r="2.5" fill="#f43f5e" opacity="0.4"/><path d="M45 14 H55 V24 H45 Z" fill="#f59e0b" rx="2" transform="rotate(15 50 19)"/><text x="50" y="22" font-family="Arial, sans-serif" font-weight="900" font-size="8px" fill="#fff" text-anchor="middle" transform="rotate(15 50 19)">$</text><ellipse cx="50" cy="34" rx="7" ry="1.8" fill="#4a044e"/></svg>`,
  avatar8: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-space" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/></linearGradient><linearGradient id="g-fire" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ef4444"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-space)"/><circle cx="20" cy="30" r="1.5" fill="#fff" opacity="0.8"/><circle cx="80" cy="40" r="1" fill="#fff" opacity="0.5"/><circle cx="75" cy="18" r="2" fill="#fff" opacity="0.9"/><circle cx="35" cy="75" r="1.2" fill="#fff" opacity="0.6"/><path d="M42 66 Q50 92 58 66 Q50 78 42 66 Z" fill="url(#g-fire)"/><path d="M32 58 L24 64 L34 46 Z" fill="#ef4444"/><path d="M68 58 L76 64 L66 46 Z" fill="#ef4444"/><path d="M50 14 C58 32, 58 54, 58 64 H42 C42 54, 42 32, 50 14 Z" fill="#f8fafc"/><path d="M50 14 C54 26, 54 44, 54 64 H46 C46 44, 46 26, 50 14 Z" fill="#e2e8f0"/><path d="M50 14 C54 24, 56 28, 58 32 H42 C44 28, 46 24, 50 14 Z" fill="#ef4444"/><circle cx="50" cy="42" r="6" fill="#38bdf8" stroke="#cbd5e1" stroke-width="2"/><circle cx="48" cy="40" r="2" fill="#fff" opacity="0.7"/></svg>`,
  avatar9: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-money" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#064e3b"/></linearGradient><linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-money)"/><circle cx="38" cy="38" r="8" fill="url(#g-gold)"/><circle cx="62" cy="38" r="8" fill="url(#g-gold)"/><circle cx="50" cy="34" r="9" fill="url(#g-gold)"/><path d="M30 68 C30 50, 36 44, 42 42 C36 40, 34 32, 50 32 C66 32, 64 40, 58 42 C64 44, 70 50, 70 68 C70 82, 30 82, 30 68 Z" fill="#d97706"/><path d="M32 68 C32 52, 38 46, 44 44 C40 43, 38 34, 50 34 C62 34, 60 43, 56 44 C62 46, 68 52, 68 68 C68 80, 32 80, 32 68 Z" fill="#f59e0b"/><ellipse cx="50" cy="44" rx="8" ry="2.5" fill="#b45309"/><text x="50" y="65" font-family="'Impact', Arial, sans-serif" font-weight="900" font-size="18px" fill="#78350f" text-anchor="middle" opacity="0.8">$</text><path d="M72 26 L74 30 L78 32 L74 34 L72 38 L70 34 L66 32 L70 30 Z" fill="#fff"/></svg>`,
  avatar10: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-shield-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#064e3b"/></linearGradient><linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-shield-bg)"/><path d="M28 24 L50 16 L72 24 C72 48, 62 68, 50 78 C38 68, 28 48, 28 24 Z" fill="url(#g-metal)"/><path d="M33 28 L50 21 L67 28 C67 48, 58 64, 50 73 C42 64, 33 48, 33 28 Z" fill="#1e293b"/><circle cx="50" cy="40" r="7" fill="none" stroke="#10b981" stroke-width="3.5"/><rect x="42" y="47" width="16" height="13" rx="2" fill="#10b981"/><circle cx="50" cy="53" r="2" fill="#064e3b"/></svg>`,
  avatar11: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-chart" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0f172a"/></linearGradient><linearGradient id="g-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-chart)"/><line x1="20" y1="30" x2="80" y2="30" stroke="#334155" stroke-dasharray="3 3"/><line x1="20" y1="50" x2="80" y2="50" stroke="#334155" stroke-dasharray="3 3"/><line x1="20" y1="70" x2="80" y2="70" stroke="#334155" stroke-dasharray="3 3"/><rect x="25" y="55" width="10" height="20" rx="2" fill="url(#g-bar)"/><rect x="40" y="43" width="10" height="32" rx="2" fill="url(#g-bar)"/><rect x="55" y="32" width="10" height="43" rx="2" fill="url(#g-bar)"/><rect x="70" y="20" width="10" height="55" rx="2" fill="url(#g-bar)"/><path d="M22 64 L38 52 L52 40 L70 25" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/><path d="M66 22 L74 22 L74 30" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  avatar12: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0891b2"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g-dia)"/><polygon points="50 18, 68 34, 50 82" fill="#38bdf8"/><polygon points="50 18, 32 34, 50 82" fill="#0284c7"/><polygon points="32 34, 50 34, 50 82" fill="#0369a1"/><polygon points="68 34, 50 34, 50 82" fill="#0ea5e9"/><polygon points="50 18, 32 34, 20 34" fill="#0284c7" opacity="0.6"/><polygon points="50 18, 68 34, 80 34" fill="#7dd3fc" opacity="0.6"/><polygon points="20 34, 32 34, 50 82" fill="#005885"/><polygon points="80 34, 68 34, 50 82" fill="#bae6fd"/><path d="M22 18 L24 22 L28 24 L24 26 L22 30 L20 26 L16 24 L20 22 Z" fill="#fff"/><path d="M78 68 L80 72 L84 74 L80 76 L78 80 L76 76 L72 74 L76 72 Z" fill="#fff"/></svg>`
};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function renderAvatarHtml(user, size = 36) {
  if (user.avatar_image && AVATARS[user.avatar_image]) {
    return `<div class="avatar-svg-container" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;flex-shrink:0">${AVATARS[user.avatar_image]}</div>`;
  }
  const initial = (user.name || '?').charAt(0).toUpperCase();
  const color = user.avatar_color || '#10b981';
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:${Math.round(size*0.38)}px;flex-shrink:0">${initial}</div>`;
}

// ── Toast ──────────────────────────────
function toast(message, type = 'success') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3200);
}

// ── Modal ──────────────────────────────
const Modal = {
  open(title, bodyHTML, wide = false, isSettings = false) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal').className = `modal${wide ? ' modal-lg' : ''}${isSettings ? ' modal-no-scroll' : ''}`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },
  close() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
  }
};
document.getElementById('modal-close').onclick = Modal.close;
document.getElementById('modal-overlay').onclick = (e) => { if (e.target.id === 'modal-overlay') Modal.close(); };

// ── Navigation ─────────────────────────
function navigate(page) {
  if (page === 'settings') {
    openSettingsModal('profile');
    return;
  }
  // Se a página alvo for restrita, encontrar o primeiro menu permitido
  if (State.permissions && State.permissions['allow_' + page] === 0) {
    const menus = ['dashboard', 'recurring', 'accounts', 'budget', 'goals', 'reports'];
    const firstAllowed = menus.find(m => State.permissions['allow_' + m] !== 0) || 'dashboard';
    page = firstAllowed;
  }
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  document.getElementById(`page-${page}`)?.classList.add('active');
  State.currentPage = page;
  renderPage(page);
}

async function renderPage(page) {
  const renders = { dashboard: renderDashboard, recurring: renderRecurring, accounts: renderAccounts, budget: renderBudget, goals: renderGoals, reports: renderReports, manual: renderManual, settings: renderSettings, families: renderFamilies };
  if (renders[page]) await renders[page]();
}

// ── Navegação Direta para Lançamento com Destaque Visual ──
async function goToTransaction({ recurringId, txId, type = 'expense', month, year }) {
  if (month && year) {
    State.currentMonth = parseInt(month);
    State.currentYear = parseInt(year);
  }
  State.currentRecurringTab = type || 'expense';
  navigate('recurring');

  let attempts = 0;
  const maxAttempts = 15;
  const interval = setInterval(() => {
    attempts++;
    let targetEl = null;
    if (recurringId) {
      targetEl = document.querySelector(`.recurring-item[data-id="${recurringId}"]`);
    }
    if (!targetEl && txId) {
      targetEl = document.querySelector(`.transaction-item[data-id="${txId}"]`);
    }

    if (targetEl) {
      clearInterval(interval);
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.remove('highlight-flash');
      void targetEl.offsetWidth; // Force DOM reflow
      targetEl.classList.add('highlight-flash');
      setTimeout(() => {
        targetEl.classList.remove('highlight-flash');
      }, 3500);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 100);
}

// ── Period Selector ────────────────────
function buildPeriodSelector(onUpdate) {
  const wrap = document.createElement('div');
  wrap.className = 'period-selector';
  const prev = document.createElement('button'); prev.textContent = '‹';
  const label = document.createElement('span'); label.className = 'period-label';
  const next = document.createElement('button'); next.textContent = '›';
  const update = () => { label.textContent = fmt.monthYear(State.currentMonth, State.currentYear); onUpdate(); };
  label.textContent = fmt.monthYear(State.currentMonth, State.currentYear);
  prev.onclick = () => { if (State.currentMonth === 1) { State.currentMonth = 12; State.currentYear--; } else State.currentMonth--; update(); };
  next.onclick = () => { if (State.currentMonth === 12) { State.currentMonth = 1; State.currentYear++; } else State.currentMonth++; update(); };
  wrap.append(prev, label, next);
  return wrap;
}

// ── Bank Logo Widget ───────────────────
function bankLogo(bank, size = 40) {
  const b = BANKS[bank] || BANKS.outro;
  let logoSvg = '';
  const innerSize = Math.round(size * 0.65);

  switch(bank) {
    case 'nubank':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6V18C4 19.1 4.9 20 6 20H10C10.6 20 11 19.6 11 19V11C11 9.9 11.9 9 13 9H17C17.6 9 18 8.6 18 8V6C18 4.9 17.1 4 16 4H6C4.9 4 4 4.9 4 6Z" fill="white"/>
          <path d="M20 18V8C20 6.9 19.1 6 18 6H14C13.4 6 13 6.4 13 7V15C13 16.1 12.1 17 11 17H7C6.4 17 6 17.4 6 18V20C6 21.1 6.9 22 8 22H18C19.1 22 20 21.1 20 18Z" fill="white" opacity="0.8"/>
        </svg>
      `;
      break;
    case 'banrisul':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 8L82 40L50 72L18 40L50 8Z" fill="#00D2FF"/>
          <path d="M50 35L70 55L50 75L30 55L50 35Z" fill="white"/>
          <path d="M50 56L60 66L50 76L40 66L50 56Z" fill="#005CA9"/>
        </svg>
      `;
      break;
    case 'carrefour':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M42 15L15 42L42 69C33 60 30 48 35 35C38 27 40 21 42 15Z" fill="#E31B23"/>
          <path d="M58 15C60 21 62 27 65 35C70 48 67 60 58 69L85 42L58 15Z" fill="#ffffff"/>
        </svg>
      `;
      break;
    case 'itau':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#FFD200"/>
          <text x="12" y="14.5" fill="#003399" font-family="Arial, sans-serif" font-weight="900" font-size="8.5px" text-anchor="middle">Itaú</text>
        </svg>
      `;
      break;
    case 'bradesco':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 80H75V86H25V80Z" fill="white"/>
          <path d="M32 40C32 55 42 70 50 75C58 70 68 55 68 40V30H32V40Z" fill="white" opacity="0.9"/>
          <path d="M46 72V38H54V72H46Z" fill="#CC092F"/>
        </svg>
      `;
      break;
    case 'santander':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C50 15 58 28 58 40C58 48 52 54 45 56C58 55 68 48 68 35C68 25 50 15 50 15Z" fill="white"/>
          <path d="M38 45C38 35 48 25 48 25C48 25 44 38 44 48C44 54 48 58 54 58C44 58 38 52 38 45Z" fill="white" opacity="0.8"/>
          <path d="M25 72C35 68 65 68 75 72L50 82L25 72Z" fill="white"/>
        </svg>
      `;
      break;
    case 'bb':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 30C40 20 60 20 70 30L60 40C55 35 45 35 40 40L30 30Z" fill="#003399"/>
          <path d="M70 70C60 80 40 80 30 70L40 60C45 65 55 65 60 60L70 70Z" fill="#003399"/>
          <path d="M30 70C20 60 20 40 30 30L40 40C35 45 35 55 40 60L30 70Z" fill="#FFD700"/>
          <path d="M70 30C80 40 80 60 70 70L60 60C65 55 65 45 60 40L70 30Z" fill="#FFD700"/>
        </svg>
      `;
      break;
    case 'caixa':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 20L45 50L20 80H35L52 58L70 80H85L60 50L85 20H70L52 42L35 20H20Z" fill="white"/>
          <rect x="52" y="32" width="16" height="16" fill="#F47920"/>
        </svg>
      `;
      break;
    case 'inter':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H10V6H6V18H10V20H4V4Z" fill="white"/>
          <path d="M20 4H14V6H18V18H14V20H20V4Z" fill="white"/>
          <path d="M9 9H15V11H13V15H11V11H9V9Z" fill="white" opacity="0.9"/>
        </svg>
      `;
      break;
    case 'c6':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="12" y="16" fill="white" font-family="'Courier New', monospace" font-weight="900" font-size="12px" text-anchor="middle">C6</text>
        </svg>
      `;
      break;
    case 'sicredi':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="30" r="16" fill="#A4C639"/>
          <circle cx="30" cy="50" r="16" fill="#3B823E"/>
          <circle cx="70" cy="50" r="16" fill="#A4C639"/>
          <circle cx="50" cy="70" r="16" fill="#3B823E"/>
        </svg>
      `;
      break;
    case 'xp':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="12" y="17" fill="#FFD700" font-family="'Impact', sans-serif" font-weight="bold" font-size="15px" text-anchor="middle" letter-spacing="1px">XP</text>
        </svg>
      `;
      break;
    case 'visa':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="58" fill="white" font-family="'Georgia', serif" font-weight="bold" font-style="italic" font-size="28px" text-anchor="middle">Visa</text>
          <path d="M15 28L25 28L32 68H22L15 28Z" fill="#F7B600" opacity="0.3"/>
        </svg>
      `;
      break;
    case 'mastercard':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="50" r="24" fill="#EB001B"/>
          <circle cx="60" cy="50" r="24" fill="#F79E1B" fill-opacity="0.85"/>
        </svg>
      `;
      break;
    case 'elo':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="50" r="14" fill="#00A4E4"/>
          <circle cx="50" cy="50" r="14" fill="#F58220"/>
          <circle cx="68" cy="50" r="14" fill="#EC1C24"/>
          <text x="50" y="86" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="12px" text-anchor="middle">elo</text>
        </svg>
      `;
      break;
    case 'ticket':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#EC1C24"/>
          <circle cx="50" cy="50" r="24" fill="white"/>
          <path d="M50 35L54 44L64 45L56 51L59 61L50 55L41 61L44 51L36 45L46 44L50 35Z" fill="#EC1C24"/>
        </svg>
      `;
      break;
    case 'vr':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#009A44"/>
          <text x="50" y="60" fill="white" font-family="Arial, sans-serif" font-weight="900" font-size="32px" text-anchor="middle">VR</text>
        </svg>
      `;
      break;
    case 'sodexo':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="10" fill="#0F2C59"/>
          <path d="M30 40L38 48L46 32" stroke="white" stroke-width="8" stroke-linecap="round"/>
          <path d="M48 60L58 70L78 45" stroke="#EC1C24" stroke-width="8" stroke-linecap="round"/>
        </svg>
      `;
      break;
    case 'sicoob':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15 L78 63 L22 63 Z" fill="#9bc835" />
          <circle cx="38" cy="50" r="16" fill="#00ae9d" opacity="0.9"/>
          <circle cx="62" cy="50" r="16" fill="#003641" opacity="0.9"/>
        </svg>
      `;
      break;
    case 'safra':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="58" fill="#D4AF37" font-family="'Times New Roman', serif" font-weight="bold" font-size="24px" text-anchor="middle" letter-spacing="1px">SAFRA</text>
          <rect x="15" y="66" width="70" height="4" fill="#D4AF37"/>
        </svg>
      `;
      break;
    case 'btgpactual':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="12" fill="#0A2540"/>
          <text x="50" y="58" fill="white" font-family="Arial, sans-serif" font-weight="900" font-size="26px" text-anchor="middle" letter-spacing="1px">BTG</text>
        </svg>
      `;
      break;
    case 'bmg':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#FF5A00"/>
          <text x="50" y="60" fill="white" font-family="'Impact', sans-serif" font-weight="bold" font-size="28px" text-anchor="middle" letter-spacing="1px">bmg</text>
        </svg>
      `;
      break;
    case 'pagbank':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="12" fill="#00B159"/>
          <circle cx="40" cy="50" r="18" fill="white"/>
          <circle cx="60" cy="50" r="18" fill="#FFD700" opacity="0.9"/>
        </svg>
      `;
      break;
    case 'mercadopago':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 70 L35 30 L50 60 L65 30 L80 70" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      break;
    case 'dinheiro':
      logoSvg = `
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" fill="white"/>
          <circle cx="12" cy="12" r="3.5" fill="#10b981"/>
        </svg>
      `;
      break;
    default:
      logoSvg = `<div style="color:white;font-size:${size*0.32}px;font-weight:800">${b.abbr}</div>`;
  }

  return `
    <div style="width:${size}px;height:${size}px;border-radius:${size/4}px;background:${b.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px ${b.color}55">
      ${logoSvg}
    </div>
  `;
}

// ── Donut SVG ──────────────────────────
function buildDonut(pct, color, size = 90) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const trackColor = pct > 80 ? '#7f1d1d' : pct > 60 ? '#78350f' : '#14532d';
  const fillColor  = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : color;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="10" opacity="0.3"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${fillColor}" stroke-width="10"
        stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ/4}"
        stroke-linecap="round" style="transition:stroke-dasharray 0.8s ease"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central"
        fill="${fillColor}" font-size="${size*0.18}px" font-weight="800" font-family="Inter">${Math.round(pct)}%</text>
    </svg>`;
}

// ── Credit Card Donut (two-tone: used + free + negative/exceeded alert) ──
function buildCreditDonut(spent, limit, size = 110) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - 18) / 2;
  const circ = 2 * Math.PI * r;

  if (!limit || limit <= 0) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1e293b" stroke-width="12"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#475569" font-size="${size*0.15}px" font-weight="700" font-family="Inter">S/L</text>
    </svg>`;
  }

  const isExceeded = spent > limit;
  const available  = limit - spent;
  const pctReal    = (spent / limit) * 100;
  const pctClamped = Math.min(100, Math.max(0, pctReal));
  const usedArc    = (pctClamped / 100) * circ;

  // Colors
  const usedColor = isExceeded ? '#ef4444' : pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#f97316';
  const freeColor = isExceeded ? '#7f1d1d' : pctReal > 80 ? '#991b1b' : pctReal > 60 ? '#92400e' : '#10b981';

  // Inner labels: if exceeded, can show percentage (e.g. 125%) and EXCEDIDO
  const pctLabel  = Math.round(pctReal) + '%';
  const subLabel  = isExceeded ? 'ultrapassado' : pctReal > 80 ? 'crítico' : pctReal > 60 ? 'atenção' : 'usado';
  const subColor  = isExceeded ? '#f87171' : pctReal > 80 ? '#fca5a5' : pctReal > 60 ? '#fde68a' : '#6ee7b7';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Free arc (full circle behind, representing available limit) -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${freeColor}"
        stroke-width="12" opacity="${isExceeded ? '0.5' : '0.28'}"/>
      <!-- Used arc (committed amount — on top) -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${usedColor}"
        stroke-width="12"
        stroke-dasharray="${usedArc} ${circ}"
        stroke-dashoffset="${circ / 4}"
        stroke-linecap="round"
        style="transition:stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)"/>
      ${isExceeded ? `
        <!-- Negative / Exceeded outer pulse ring -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4" opacity="0.85"/>
      ` : ''}
      <!-- Center: percentage -->
      <text x="${cx}" y="${cy - 7}" text-anchor="middle" dominant-baseline="central"
        fill="${usedColor}" font-size="${size * (pctReal >= 100 ? 0.17 : 0.20)}px" font-weight="900" font-family="Inter">${pctLabel}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" dominant-baseline="central"
        fill="${subColor}" font-size="${size * 0.088}px" font-weight="700" font-family="Inter" text-transform="uppercase" opacity="0.95">${subLabel}</text>
    </svg>`;
}

// ════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════

/* ==== dashboard-main-1a.js ==== */
/* === dashboard-main-1a.js (parte 1/2 de dashboard-main-1.js) ===
 * Layout, KPIs e Orquestração dos 3 Modos do Dashboard
 */

async function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  
  if (State.user.profile_type === 5) {
    await renderCaculaDashboard(page);
    return;
  }

  const currentMode = State.dashboardLayoutMode || 'executive';
  const modeLabels = {
    executive: '🌟 Executivo',
    tabbed: '📑 Sub-Abas',
    cockpit: '🎛️ Cockpit'
  };
  
  // Header principal com Seletor Rápido de Layout
  let headerHtml = `
    <div class="page-header">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <h2 class="page-title">Dashboard</h2>
          ${State.familyName ? `<span class="badge" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 50px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em;">🏠 ${State.familyName}</span>` : ''}
          <button class="dash-layout-switcher" id="dash-quick-layout-btn" title="Alterar modo de organização do Dashboard">
            <span>🎛️</span>
            <span>Layout: <strong>${modeLabels[currentMode] || 'Executivo'}</strong></span>
            <span style="opacity:0.6;font-size:10px;">▾</span>
          </button>
        </div>
        <p class="page-subtitle" id="dash-subtitle">Carregando...</p>
      </div>
      <div id="dash-period-wrapper"></div>
    </div>
    
    <div class="report-tabs" id="dashboard-tabs" style="margin-bottom: 16px;">
      <button class="report-tab ${State.activeDashTab === 'mensal' ? 'active' : ''}" data-tab="mensal">📅 Visão Mensal</button>
      <button class="report-tab ${State.activeDashTab === 'geral' ? 'active' : ''}" data-tab="geral">🌐 Visão Geral</button>
    </div>
    
    <div id="dashboard-tab-content" class="dashboard-view-fade"></div>
  `;
  
  page.innerHTML = headerHtml;

  // Bind Quick Layout Switcher Button
  const layoutBtn = document.getElementById('dash-quick-layout-btn');
  if (layoutBtn) {
    layoutBtn.onclick = () => {
      const nextMode = currentMode === 'executive' ? 'tabbed' : currentMode === 'tabbed' ? 'cockpit' : 'executive';
      State.dashboardLayoutMode = nextMode;
      localStorage.setItem('dashboard_layout_mode', nextMode);
      toast(`Modo do Dashboard alterado para: ${modeLabels[nextMode]}`);
      renderDashboard();
    };
  }
  
  // Set up tab click handlers
  const tabButtons = document.querySelectorAll('#dashboard-tabs .report-tab');
  tabButtons.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      if (State.activeDashTab !== tab) {
        State.activeDashTab = tab;
        // Destroy existing charts to prevent canvas reuse issues in Chart.js
        if (State.charts.monthly) { State.charts.monthly.destroy(); delete State.charts.monthly; }
        if (State.charts.category) { State.charts.category.destroy(); delete State.charts.category; }
        if (State.charts.patrimony) { State.charts.patrimony.destroy(); delete State.charts.patrimony; }
        renderDashboard();
      }
    };
  });

  if (State.activeDashTab === 'mensal') {
    // 📅 VISÃO MENSAL
    document.getElementById('dash-subtitle').innerText = `Visão geral — ${fmt.monthYear(State.currentMonth, State.currentYear)}`;
    
    // Append period selector
    const periodWrap = document.getElementById('dash-period-wrapper');
    periodWrap.innerHTML = '';
    periodWrap.appendChild(buildPeriodSelector(renderDashboard));

    const [summary, monthly, txs, potentialDuplicates] = await Promise.all([
      window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
      window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.sync.findDuplicates({ familyId: State.user.family_id || State.user.familyId || 1, userId: State.user.id, daysWindow: 45, minScore: 75 }).catch(() => [])
    ]);

    const today = new Date().getDate();

    // 1. Extrair membros únicos da família a partir de contas e transações
    const membersMap = new Map();
    (summary.accounts || []).forEach(a => {
      if (a.user_name && a.user_id) {
        membersMap.set(a.user_id, { id: a.user_id, name: a.user_name, color: a.user_avatar_color || '#10b981' });
      }
    });
    (txs || []).forEach(t => {
      if (t.user_name && t.user_id && !membersMap.has(t.user_id)) {
        membersMap.set(t.user_id, { id: t.user_id, name: t.user_name, color: t.user_avatar_color || '#10b981' });
      }
    });
    const members = Array.from(membersMap.values());

    // 2. Aplicar Filtro Ativo por Membro
    const activeMemberFilter = State.dashboardCardMemberFilter || 'all';
    const activeTypeFilter = State.dashboardCardTypeFilter || 'all';

    let effectiveTxs = txs || [];
    let effectiveAccounts = summary.accounts || [];
    let effectivePriority = summary.priorityItems || [];
    let effectiveAlerts = summary.alertItems || [];
    let effectiveOverdue = summary.overduePreviousItems || [];
    let effectiveDuplicates = potentialDuplicates || [];
    let activeMemberName = null;

    if (activeMemberFilter !== 'all') {
      const activeMember = members.find(m => String(m.id) === String(activeMemberFilter));
      activeMemberName = activeMember ? activeMember.name : null;

      effectiveTxs = (txs || []).filter(t => String(t.user_id) === String(activeMemberFilter));
      effectiveAccounts = (summary.accounts || []).filter(a => String(a.user_id) === String(activeMemberFilter));
      effectivePriority = (summary.priorityItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveAlerts = (summary.alertItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveOverdue = (summary.overduePreviousItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveDuplicates = (potentialDuplicates || []).filter(d => String(d.user_id_1) === String(activeMemberFilter) || String(d.user_id_2) === String(activeMemberFilter));
    }

    // Calcular índices / KPIs com base estrita no effectiveTxs (despesas vs receitas)
    const effectivePaidExpenses = effectiveTxs.filter(t => t.type === 'expense' && (t.is_paid === 1 || t.is_paid === true));
    const effectiveUnpaidExpenses = effectiveTxs.filter(t => t.type === 'expense' && (t.is_paid === 0 || t.is_paid === false));
    const effectivePaidIncomes = effectiveTxs.filter(t => t.type === 'income' && (t.is_paid === 1 || t.is_paid === true));

    const income = effectivePaidIncomes.reduce((acc, t) => acc + (t.amount || 0), 0);
    const expense = effectivePaidExpenses.reduce((acc, t) => acc + (t.amount || 0), 0);
    const pending = effectiveUnpaidExpenses.reduce((acc, t) => acc + (t.amount || 0), 0);
    const balance = income - expense;

    const paidRecurring = effectivePaidExpenses.length;
    const totalRecurring = effectivePaidExpenses.length + effectiveUnpaidExpenses.length;
    const recurringPct = totalRecurring > 0 ? Math.round((paidRecurring / totalRecurring) * 100) : 0;

    // 3. Aplicar Filtro de Tipo de Conta
    if (activeTypeFilter === 'credit') {
      effectiveAccounts = effectiveAccounts.filter(a => a.type === 'credit');
    } else if (activeTypeFilter === 'debit') {
      effectiveAccounts = effectiveAccounts.filter(a => a.type !== 'credit');
    }

    const effectivePaidBills = effectivePaidExpenses;
    const effectiveUnpaidBills = effectiveUnpaidExpenses;

    const effectiveSummary = {
      ...summary,
      income,
      expense,
      pending,
      balance,
      paidRecurring,
      totalRecurring,
      accounts: effectiveAccounts,
      priorityItems: effectivePriority,
      alertItems: effectiveAlerts,
      overduePreviousItems: effectiveOverdue
    };

    const contentDiv = document.getElementById('dashboard-tab-content');

    // Render based on selected layout mode
    if (currentMode === 'tabbed') {
      renderTabbedLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    } else if (currentMode === 'cockpit') {
      renderCockpitLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    } else {
      // Default: Executive
      renderExecutiveLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    }

    bindDashboardEvents(contentDiv, effectiveSummary, effectiveTxs, monthly, today);

  } else {
    // 🌐 VISÃO GERAL
    await renderGeneralDashboardTab();
  }
}

/**
 * Modo 1: Executivo por Zonas (Padrão Completo)
 */
function renderExecutiveLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 2. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 3. CARDS & CONTAS -->
    ${renderDashboardCardsGrid(summary)}

    <!-- 4. PAINEL OPERACIONAL KANBAN 3 COLUNAS -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> Fluxo e Andamento das Contas do Mês
      </div>
      ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
    </div>

    <!-- 5. GRÁFICOS LADO A LADO -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
        <div class="card-title">Despesas por categoria</div>
      </div>
      <div class="chart-card">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <canvas id="chart-monthly" style="max-height:240px"></canvas>
      </div>
    </div>
  `;
}

/**
 * Modo 2: Sub-Abas Operacionais (Foco por Contexto)
 */
function renderTabbedLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  const activeSubTab = State.activeDashSubTab || 'operation';

  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 2. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 3. SUB-ABAS NAVEGAÇÃO -->
    <div class="dash-subtabs-nav" id="dash-subtabs-nav">
      <button class="dash-subtab-btn ${activeSubTab === 'operation' ? 'active' : ''}" data-subtab="operation">
        <span>📋</span> Operação & Contas (${paidBills.length + unpaidBills.length})
      </button>
      <button class="dash-subtab-btn ${activeSubTab === 'cards' ? 'active' : ''}" data-subtab="cards">
        <span>💳</span> Cartões & Bancos (${summary.accounts.length})
      </button>
      <button class="dash-subtab-btn ${activeSubTab === 'charts' ? 'active' : ''}" data-subtab="charts">
        <span>📈</span> Gráficos & Categorias
      </button>
    </div>

    <!-- 4. CONTEÚDO DA SUB-ABA ATIVA -->
    <div id="dash-subtab-content">
      ${activeSubTab === 'operation' ? `
        <div class="dashboard-view-fade">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> Painel Operacional de Contas
          </div>
          ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
        </div>
      ` : activeSubTab === 'cards' ? `
        <div class="dashboard-view-fade">
          ${renderDashboardCardsGrid(summary)}
        </div>
      ` : `
        <div class="dashboard-view-fade" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px;">
          <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
            <div class="card-title">Despesas por categoria</div>
          </div>
          <div class="chart-card">
            <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
            <canvas id="chart-monthly" style="max-height:240px"></canvas>
          </div>
        </div>
      `}
    </div>
  `;
}

/**
 * Modo 3: Cockpit Integrado (Filtros -> Carteira/Cartões -> KPIs -> Action Pills -> Kanban -> Gráficos)
 */
function renderCockpitLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. CARTEIRA & CARTÕES (ABAIXO DA LINHA DE FILTRO) -->
    ${renderDashboardCardsGrid(summary, true)}

    <!-- 2. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 3. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 4. PAINEL OPERACIONAL KANBAN 3 COLUNAS (LARGURA TOTAL) -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> Painel de Contas (${paidBills.length + unpaidBills.length})
      </div>
      ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
    </div>

    <!-- 5. GRÁFICOS EM LARGURA TOTAL -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column; min-height: 380px;">
        <div class="card-title">Despesas por categoria</div>
      </div>
      <div class="chart-card" style="min-height: 380px; display: flex; flex-direction: column;">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
          <canvas id="chart-monthly" style="max-height:280px; width: 100%;"></canvas>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza a Aba de Visão Geral (Patrimônio e Saldos Reais)
 */
async function renderGeneralDashboardTab() {
  document.getElementById('dash-subtitle').innerText = 'Consolidado — Patrimônio e Saldos Reais';
  document.getElementById('dash-period-wrapper').innerHTML = '';

  const [summaryGeral, monthly, patrimony] = await Promise.all([
    window.api.dashboard.getGeneralSummary({ userId: State.user.id }),
    window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
    window.api.reports.getPatrimony({ userId: State.user.id }),
  ]);

  const creditAccounts = summaryGeral.accounts.filter(a => a.type === 'credit');
  const debitAccounts  = summaryGeral.accounts.filter(a => a.type !== 'credit');

  const contentDiv = document.getElementById('dashboard-tab-content');
  contentDiv.innerHTML = `
    <!-- Top summary cards for General View -->
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px">
      <div class="kpi-card kpi-balance">
        <div class="kpi-label">Patrimônio Líquido Total</div>
        <div class="kpi-value" style="color:var(--accent-light)">${fmt.currency(summaryGeral.totalNet)}</div>
        <div class="kpi-sub">saldo ativo − faturas abertas</div>
        <div class="kpi-icon">🏛️</div>
      </div>
      <div class="kpi-card kpi-income">
        <div class="kpi-label">Saldo em Contas e Carteiras</div>
        <div class="kpi-value">${fmt.currency(summaryGeral.totalAssets)}</div>
        <div class="kpi-sub">${debitAccounts.length} conta(s) ativas</div>
        <div class="kpi-icon">💰</div>
      </div>
      <div class="kpi-card kpi-expense">
        <div class="kpi-label">Comprometido em Cartões</div>
        <div class="kpi-value" style="color:#f87171">${fmt.currency(summaryGeral.totalCardSpent)}</div>
        <div class="kpi-sub">${creditAccounts.length} cartão(ões)</div>
        <div class="kpi-icon">💳</div>
      </div>
      <div class="kpi-card kpi-pending">
        <div class="kpi-label">Total Guardado em Cofrinhos</div>
        <div class="kpi-value" style="color:#c084fc">${fmt.currency(summaryGeral.goals.reduce((acc, g) => acc + (g.current_amount || 0), 0))}</div>
        <div class="kpi-sub">${summaryGeral.goals.length} meta(s) ativas</div>
        <div class="kpi-icon">🎯</div>
      </div>
    </div>

    <!-- Cards and Accounts -->
    ${(creditAccounts.length > 0 || debitAccounts.length > 0) ? `
    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Todas as Contas e Cartões da Família</div>
      <div class="cards-widget-grid" id="cards-widget-grid-general">
        ${creditAccounts.map(acc => renderCreditCardWidget(acc, summaryGeral.cardSpending[acc.id] || 0, null)).join('')}
        ${debitAccounts.map(acc => renderDebitAccountStaticWidget(acc)).join('')}
      </div>
    </div>` : ''}

    <!-- Goals and Graphs -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-title">🎯 Objetivos & Cofrinhos</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
          ${summaryGeral.goals.length === 0
            ? `<div class="no-data">Nenhum cofrinho ativo cadastrado.<br><small>Defina metas em Objetivos.</small></div>`
            : summaryGeral.goals.map(goal => renderDashboardGoalItem(goal)).join('')
          }
        </div>
      </div>

      <div class="chart-card">
        <div class="card-title">Receitas × Despesas (Últimos 6 meses)</div>
        <canvas id="chart-monthly-general" style="max-height:220px"></canvas>
      </div>
    </div>

    <!-- Historical Net Worth Evolution -->
    <div class="chart-card" style="margin-bottom:16px">
      <div class="card-title">Evolução Patrimonial Mensal (Últimos 12 meses)</div>
      <canvas id="chart-patrimony" style="max-height:220px"></canvas>
    </div>
  `;

  // Render general charts
  if (document.getElementById('chart-monthly-general')) {
    State.charts.monthly = new Chart(document.getElementById('chart-monthly-general'), {
      type: 'bar',
      data: {
        labels: monthly.map(m => m.month),
        datasets: [
          { label: 'Receitas', data: monthly.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 },
          { label: 'Despesas', data: monthly.map(m => m.expense), backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6 },
        ]
      },
      options: chartOptions('bar')
    });
  }

  if (document.getElementById('chart-patrimony')) {
    const ctxPat = document.getElementById('chart-patrimony').getContext('2d');
    const gradPat = ctxPat.createLinearGradient(0, 0, 0, 200);
    gradPat.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradPat.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    State.charts.patrimony = new Chart(ctxPat, {
      type: 'line',
      data: {
        labels: patrimony.map(p => p.month),
        datasets: [{
          label: 'Patrimônio Líquido',
          data: patrimony.map(p => p.net),
          borderColor: '#3b82f6',
          backgroundColor: gradPat,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: chartOptions('line')
    });
  }

  // Bind clickable cards in General tab
  contentDiv.querySelectorAll('.bank-card-credit').forEach(cardWidget => {
    cardWidget.onclick = () => {
      const cardId = parseInt(cardWidget.dataset.cardId);
      const cardColor = cardWidget.dataset.bankColor;
      const cardName = cardWidget.dataset.cardName;
      State.highlightCardId = cardId;
      State.highlightCardColor = cardColor;
      State.highlightCardName = cardName;
      State.highlightAccountId = null;
      State.highlightAccountColor = null;
      State.highlightAccountName = null;
      State.currentRecurringTab = 'expense';
      navigate('recurring');
    };
  });

  contentDiv.querySelectorAll('.bank-card-debit').forEach(debitWidget => {
    debitWidget.onclick = () => {
      const accId = parseInt(debitWidget.dataset.accountId);
      const accColor = debitWidget.dataset.bankColor;
      const accName = debitWidget.dataset.accountName;
      State.highlightAccountId = accId;
      State.highlightAccountColor = accColor;
      State.highlightAccountName = accName;
      State.highlightCardId = null;
      State.highlightCardColor = null;
      State.highlightCardName = null;
      State.currentRecurringTab = 'income';
      navigate('recurring');
    };
  });
}

/**
 * Registra todos os Event Listeners dos componentes do Dashboard Mensal
 */
function bindDashboardEvents(contentDiv, summary, txs, monthly, today) {
  // 1. Top Filter Chips (Filtrar por Membro e por Tipo)
  contentDiv.querySelectorAll('.dash-filter-chip').forEach(chip => {
    chip.onclick = () => {
      if (chip.dataset.memberFilter !== undefined) {
        State.dashboardCardMemberFilter = chip.dataset.memberFilter;
      }
      if (chip.dataset.typeFilter !== undefined) {
        State.dashboardCardTypeFilter = chip.dataset.typeFilter;
      }
      renderDashboard();
    };
  });

  // 2. Sub-Tabs Switcher (para Layout Tabbed)
  contentDiv.querySelectorAll('.dash-subtab-btn').forEach(btn => {
    btn.onclick = () => {
      const sub = btn.dataset.subtab;
      State.activeDashSubTab = sub;
      renderDashboard();
    };
  });

  // 3. Action Pills Clicks & Details Toggles
  const expandedContainer = contentDiv.querySelector('#dash-alerts-expanded-container');

  const pillDedup = contentDiv.querySelector('#pill-dedup');
  if (pillDedup) {
    pillDedup.onclick = () => openDeduplicationModal();
  }

  const pillScan = contentDiv.querySelector('#pill-scan-nfce');
  if (pillScan) {
    pillScan.onclick = () => {
      if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
    };
  }

  const pillOverdue = contentDiv.querySelector('#pill-overdue');
  if (pillOverdue && expandedContainer) {
    pillOverdue.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'overdue';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'overdue';
        expandedContainer.innerHTML = `
          <div class="card overdue-container" style="border: 1px solid rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.05)); padding: 16px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 800; color: #fbbf24;">⚠️ Pendências de Meses Anteriores Não Pagas (${summary.overduePreviousItems.length})</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div class="overdue-items-list" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
              ${summary.overduePreviousItems.map(item => {
                const parts = (item.date || '').split('-');
                const itemYear = parts[0];
                const itemMonth = parseInt(parts[1], 10);
                const isExpense = item.type === 'expense';
                return `
                  <div class="overdue-item-row" data-tx-id="${item.id}" data-rec-id="${item.recurring_item_id || ''}" data-type="${item.type}" data-month="${itemMonth}" data-year="${itemYear}" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                      <span class="badge" style="font-size: 9px; padding: 2px 6px;">📅 ${fmt.monthYear(itemMonth, itemYear)}</span>
                      <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.description || item.rec_name}</span>
                    </div>
                    <div style="font-size: 12.5px; font-weight: 800; color: ${isExpense ? '#f87171' : 'var(--accent-light)'};">
                      ${isExpense ? '− ' : '+ '}${fmt.currency(item.amount)} ➔
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        bindOverdueClickEvents(expandedContainer);
      }
    };
  }

  const pillExpense = contentDiv.querySelector('#pill-expense-alerts');
  if (pillExpense && expandedContainer) {
    pillExpense.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'expense';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'expense';
        const expenseAlerts = (summary.alertItems || []).filter(a => a.type !== 'income');
        expandedContainer.innerHTML = `
          <div class="card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06); padding: 14px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; color: #f87171;">🚨 Vencimentos nos Próximos ${summary.alertDays} Dias</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${expenseAlerts.map(a => {
                const daysLeft = a.due_day - today;
                return `<button type="button" class="alert-chip alert-chip-expense btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="expense">${a.rec_icon || '📋'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft}d`} • ${fmt.currency(a.amount)} ➔</button>`;
              }).join('')}
            </div>
          </div>
        `;
        bindAlertChipEvents(expandedContainer);
      }
    };
  }

  const pillIncome = contentDiv.querySelector('#pill-income-alerts');
  if (pillIncome && expandedContainer) {
    pillIncome.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'income';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'income';
        const incomeAlerts = (summary.alertItems || []).filter(a => a.type === 'income');
        expandedContainer.innerHTML = `
          <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06); padding: 14px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; color: var(--accent-light);">💰 Recebimentos nos Próximos ${summary.alertDays} Dias</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${incomeAlerts.map(a => {
                const daysLeft = a.due_day - today;
                return `<button type="button" class="alert-chip alert-chip-income btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="income">${a.rec_icon || '💼'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft}d`} • ${fmt.currency(a.amount)} ➔</button>`;
              }).join('')}
            </div>
          </div>
        `;
        bindAlertChipEvents(expandedContainer);
      }
    };
  }

  // 4. Clickable priority and transaction items
  contentDiv.querySelectorAll('.btn-alert-link, .priority-item-clickable').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const recId = btn.dataset.recId;
      const txId = btn.dataset.txId;
      const type = btn.dataset.type || 'expense';
      goToTransaction({ recurringId: recId, txId, type, month: State.currentMonth, year: State.currentYear });
    };
  });

  // 5. Clickable credit card widgets
  contentDiv.querySelectorAll('.bank-card-credit').forEach(cardWidget => {
    cardWidget.onclick = () => {
      const cardId = parseInt(cardWidget.dataset.cardId);
      const cardColor = cardWidget.dataset.bankColor;
      const cardName = cardWidget.dataset.cardName;
      State.highlightCardId = cardId;
      State.highlightCardColor = cardColor;
      State.highlightCardName = cardName;
      State.highlightAccountId = null;
      State.highlightAccountColor = null;
      State.highlightAccountName = null;
      State.currentRecurringTab = 'expense';
      navigate('recurring');
    };
  });

  // 6. Clickable debit account widgets
  contentDiv.querySelectorAll('.bank-card-debit').forEach(debitWidget => {
    debitWidget.onclick = () => {
      const accId = parseInt(debitWidget.dataset.accountId);
      const accColor = debitWidget.dataset.bankColor;
      const accName = debitWidget.dataset.accountName;
      State.highlightAccountId = accId;
      State.highlightAccountColor = accColor;
      State.highlightAccountName = accName;
      State.highlightCardId = null;
      State.highlightCardColor = null;
      State.highlightCardName = null;
      State.currentRecurringTab = 'income';
      navigate('recurring');
    };
  });

  // 7. Render Charts
  if (document.getElementById('chart-monthly')) {
    State.charts.monthly = new Chart(document.getElementById('chart-monthly'), {
      type: 'bar',
      data: {
        labels: monthly.map(m => m.month),
        datasets: [
          { label: 'Receitas', data: monthly.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 },
          { label: 'Despesas', data: monthly.map(m => m.expense), backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6 },
        ]
      },
      options: chartOptions('bar')
    });
  }

  if (document.getElementById('dashboard-category-interactive-card')) {
    setupCategoryInteractiveChart('dashboard-category-interactive-card', 'category', txs);
  }
}

function bindAlertChipEvents(container) {
  const closeBtn = container.querySelector('#btn-close-expanded-alerts');
  if (closeBtn) {
    closeBtn.onclick = () => {
      container.style.display = 'none';
      container.innerHTML = '';
      container.dataset.activeType = '';
    };
  }
  container.querySelectorAll('.btn-alert-link').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const recId = btn.dataset.recId;
      const txId = btn.dataset.txId;
      const type = btn.dataset.type || 'expense';
      goToTransaction({ recurringId: recId, txId, type, month: State.currentMonth, year: State.currentYear });
    };
  });
}

function bindOverdueClickEvents(container) {
  const closeBtn = container.querySelector('#btn-close-expanded-alerts');
  if (closeBtn) {
    closeBtn.onclick = () => {
      container.style.display = 'none';
      container.innerHTML = '';
      container.dataset.activeType = '';
    };
  }
  container.querySelectorAll('.overdue-item-row').forEach(row => {
    row.onclick = (e) => {
      e.preventDefault();
      const txId = row.dataset.txId;
      const recId = row.dataset.recId;
      const type = row.dataset.type || 'expense';
      const month = parseInt(row.dataset.month, 10);
      const year = parseInt(row.dataset.year, 10);
      goToTransaction({ recurringId: recId, txId, type, month, year });
    };
  });
}


/* ==== dashboard-main-1b.js ==== */
/* === dashboard-main-1b.js (parte 2/2 de dashboard-main-1.js) ===
 * Componentes Modulares e Widgets do Dashboard
 */

/**
 * Renderiza a Barra Superior de Filtros em Linha (Toda a Família / Membros / Tipo de Conta)
 */
function renderDashboardTopFilterBar(members, activeMemberFilter = 'all', activeTypeFilter = 'all') {
  return `
    <div class="dash-top-filter-bar">
      <div class="dash-filter-chips-group">
        <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; margin-right: 4px;">
          <span>👥</span> Filtrar por Membro:
        </span>
        <button class="dash-filter-chip ${activeMemberFilter === 'all' ? 'active' : ''}" data-member-filter="all">
          <span>🏠</span> Toda a Família
        </button>
        ${members.map(m => `
          <button class="dash-filter-chip ${String(activeMemberFilter) === String(m.id) ? 'active' : ''}" data-member-filter="${m.id}">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${m.color}; flex-shrink: 0;"></span>
            <span>${m.name}</span>
          </button>
        `).join('')}
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Exibir:</span>
        <button class="dash-filter-chip ${activeTypeFilter === 'all' ? 'active' : ''}" data-type-filter="all" style="padding: 4px 10px; font-size: 11px;">Tudo</button>
        <button class="dash-filter-chip ${activeTypeFilter === 'credit' ? 'active' : ''}" data-type-filter="credit" style="padding: 4px 10px; font-size: 11px;">💳 Cartões</button>
        <button class="dash-filter-chip ${activeTypeFilter === 'debit' ? 'active' : ''}" data-type-filter="debit" style="padding: 4px 10px; font-size: 11px;">🏦 Contas</button>
      </div>
    </div>
  `;
}

/**
 * Renderiza a Hero Section com KPIs Consolidados e Barra de Progresso Integrada
 */
function renderDashboardHeroKpis(summary, recurringPct, activeMemberName = null) {
  const pendingCount = (summary.totalRecurring || 0) - (summary.paidRecurring || 0);
  const forecastedBalance = (summary.income || 0) - (summary.expense || 0) - (summary.pending || 0);

  return `
    <div class="dash-hero-section" style="margin-bottom: 16px;">
      ${activeMemberName ? `
        <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 6px 14px; border-radius: var(--radius-sm); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
          <span>👤 Exibindo índices e lançamentos exclusivos de: <strong>${activeMemberName}</strong></span>
          <span style="font-size: 11px; color: var(--text-muted); cursor: pointer;" onclick="State.dashboardCardMemberFilter='all'; renderDashboard();">✕ Limpar Filtro</span>
        </div>` : ''}

      <div class="kpi-grid">
        <div class="kpi-card kpi-income">
          <div class="kpi-label">Receitas</div>
          <div class="kpi-value">${fmt.currency(summary.income)}</div>
          <div class="kpi-sub">recebidas no mês</div>
          <div class="kpi-icon">💹</div>
        </div>
        <div class="kpi-card kpi-expense">
          <div class="kpi-label">Despesas</div>
          <div class="kpi-value">${fmt.currency(summary.expense)}</div>
          <div class="kpi-sub">pagas no mês</div>
          <div class="kpi-icon">💸</div>
        </div>
        <div class="kpi-card kpi-balance">
          <div class="kpi-label">Saldo do mês</div>
          <div class="kpi-value" style="color:${summary.balance >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(summary.balance)}</div>
          <div class="kpi-sub">receitas − despesas</div>
          <div class="kpi-icon">⚖️</div>
        </div>
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">À Pagar</div>
          <div class="kpi-value">${fmt.currency(summary.pending)}</div>
          <div class="kpi-sub">${pendingCount} item(s) pendente(s)</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Barra de Progresso Integrada e Previsão -->
      <div class="card" style="margin-top: 10px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 240px;">
          <span style="font-size: 16px;">🎯</span>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
              <span>Progresso de Contas: <strong>${summary.paidRecurring} de ${summary.totalRecurring} pagas</strong></span>
              <span style="color: ${recurringPct >= 100 ? 'var(--accent-light)' : 'var(--text-secondary)'}; font-weight: 700;">${recurringPct}%</span>
            </div>
            <div class="progress-bar" style="height: 7px; margin: 0;">
              <div class="progress-fill ${recurringPct >= 100 ? 'progress-ok' : recurringPct >= 60 ? 'progress-warn' : 'progress-ok'}" style="width: ${recurringPct}%"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
          <span>Previsão de Fechamento:</span>
          <strong style="color: ${forecastedBalance >= 0 ? 'var(--accent-light)' : '#f87171'}; font-size: 12.5px;">
            ${fmt.currency(forecastedBalance)}
          </strong>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Hub de Alertas em Formato de Action Pills Horizontais Compactas
 */
function renderDashboardActionPills(summary, potentialDuplicates, today) {
  const incomeAlerts = (summary.alertItems || []).filter(a => a.type === 'income');
  const expenseAlerts = (summary.alertItems || []).filter(a => a.type !== 'income');
  const overdueCount = summary.overduePreviousItems ? summary.overduePreviousItems.length : 0;
  const overdueTotal = summary.overduePreviousItems ? summary.overduePreviousItems.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0) : 0;
  const dupCount = potentialDuplicates ? potentialDuplicates.length : 0;

  if (dupCount === 0 && incomeAlerts.length === 0 && expenseAlerts.length === 0 && overdueCount === 0) {
    return '<div id="dash-alerts-expanded-container" style="display: none;"></div>';
  }

  return `
    <div class="dash-action-pills-bar">
      ${dupCount > 0 ? `
        <div class="dash-action-pill dash-action-pill-dedup" id="pill-dedup" title="Clique para conciliar lançamentos duplicados">
          <span>🛡️</span>
          <span>${dupCount} duplicidade${dupCount > 1 ? 's' : ''}</span>
          <span style="opacity: 0.8; font-size: 10px;">➔</span>
        </div>` : ''}

      ${overdueCount > 0 ? `
        <div class="dash-action-pill dash-action-pill-overdue" id="pill-overdue" title="Clique para ver pendências de meses anteriores">
          <span>⚠️</span>
          <span>${overdueCount} atrasada${overdueCount > 1 ? 's' : ''} (${fmt.currency(overdueTotal)})</span>
          <span class="pill-arrow" id="pill-overdue-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      ${expenseAlerts.length > 0 ? `
        <div class="dash-action-pill dash-action-pill-expense" id="pill-expense-alerts" title="Próximos vencimentos nos próximos ${summary.alertDays} dias">
          <span>🚨</span>
          <span>${expenseAlerts.length} vencimento${expenseAlerts.length > 1 ? 's' : ''}</span>
          <span class="pill-arrow" id="pill-expense-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      ${incomeAlerts.length > 0 ? `
        <div class="dash-action-pill dash-action-pill-income" id="pill-income-alerts" title="Recebimentos nos próximos ${summary.alertDays} dias">
          <span>💰</span>
          <span>${incomeAlerts.length} recebimento${incomeAlerts.length > 1 ? 's' : ''}</span>
          <span class="pill-arrow" id="pill-income-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      <div class="dash-action-pill dash-action-pill-scanner" id="pill-scan-nfce" title="Escanear Cupom Fiscal por QR Code" style="background: rgba(16, 185, 129, 0.12); color: var(--accent-light); border: 1px solid var(--accent); cursor: pointer; font-weight: 600;">
        <span>📷</span>
        <span>Ler Nota Fiscal</span>
      </div>
    </div>

    <!-- Dropdown / Container expansível de detalhes dos alertas se aberto -->
    <div id="dash-alerts-expanded-container" style="display: none; margin-bottom: 16px;"></div>
  `;
}

/**
 * Renderiza a Grade de Cartões e Contas (já filtrados)
 */
function renderDashboardCardsGrid(summary, showTitle = true) {
  const creditAccounts = summary.accounts.filter(a => a.type === 'credit');
  const debitAccounts  = summary.accounts.filter(a => a.type !== 'credit' && a.type !== 'investment');
  const hasAny = creditAccounts.length > 0 || debitAccounts.length > 0;

  return `
    <div style="margin-bottom: 20px;">
      ${showTitle ? `
        <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>🏦</span> Previsibilidade de Contas e Cartões
        </div>` : ''}

      ${hasAny ? `
        <div class="cards-widget-grid" id="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, summary.cardSpending[acc.id] || 0, (summary.cardMonthlyInvoices && summary.cardMonthlyInvoices[acc.id]) !== undefined ? summary.cardMonthlyInvoices[acc.id] : null)).join('')}
          ${debitAccounts.map(acc => renderDebitAccountWidget(acc)).join('')}
        </div>
      ` : `
        <div class="card" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
          Nenhuma conta ou cartão encontrado para os filtros selecionados.
        </div>
      `}
    </div>
  `;
}

/**
 * Renderiza o Painel Operacional Unificado em 3 Colunas (⭐ Prioritários | ⏳ A Pagar | ✅ Pagas)
 */
function renderDashboardKanbanColumns(summary, paidBills, unpaidBills) {
  const totalPaidAmount = paidBills.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalUnpaidAmount = unpaidBills.reduce((acc, t) => acc + (t.amount || 0), 0);
  const priorityItems = summary.priorityItems || [];

  return `
    <div class="dash-kanban-grid">
      
      <!-- COLUNA 1: ⭐ PRIORITÁRIOS -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>⭐</span> Prioritários
            <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 10px;">${priorityItems.length}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">Essenciais</div>
        </div>
        <div class="dash-kanban-list">
          ${priorityItems.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Nenhum item marcado como prioritário.<br><small>Marque com ⭐ no Planejamento.</small></div>`
            : priorityItems.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable ${item.is_paid ? 'priority-paid' : 'priority-pending'}" data-rec-id="${item.recurring_item_id || item.id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.rec_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.rec_name || item.description}
                      ${userBadge}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || '—'} • dia ${item.due_day || '?'}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:${item.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${item.type === 'income' ? '+' : '-'}${fmt.currency(item.amount)}</div>
                    <span class="transaction-status ${item.is_paid ? 'status-paid' : 'status-pending'}" style="font-size: 9px; padding: 1px 6px;">${item.is_paid ? '✓ Pago' : '⏳ Pendente'}</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

      <!-- COLUNA 2: ⏳ A PAGAR (PENDENTES) -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 6px;">
            <span>⏳</span> A Pagar
            <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 10px;">${unpaidBills.length}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #f87171;">${fmt.currency(totalUnpaidAmount)}</div>
        </div>
        <div class="dash-kanban-list">
          ${unpaidBills.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Tudo quitado! Nenhuma conta pendente.</div>`
            : unpaidBills.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable priority-pending" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.description}
                      ${userBadge}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:#f87171">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-pending" style="font-size: 9px; padding: 1px 6px;">⏳ Pendente</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

      <!-- COLUNA 3: ✅ CONTAS PAGAS -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: var(--accent-light); display: flex; align-items: center; gap: 6px;">
            <span>✅</span> Contas Pagas
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-light); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 10px;">${paidBills.length}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: var(--accent-light);">${fmt.currency(totalPaidAmount)}</div>
        </div>
        <div class="dash-kanban-list">
          ${paidBills.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Nenhuma conta paga registrada.</div>`
            : paidBills.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable priority-paid" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '💸'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.description}
                      ${userBadge}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:var(--accent-light)">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-paid" style="font-size: 9px; padding: 1px 6px;">✓ Pago</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

    </div>
  `;
}

/**
 * Renderiza um Card de Cartão de Crédito
 */
function renderCreditCardWidget(acc, spent, monthInvoice) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const limit     = acc.credit_limit || 0;
  const available = limit - spent;
  const isExceeded = limit > 0 && spent > limit;
  const pctReal   = limit > 0 ? (spent / limit) * 100 : 0;
  const ringColor = isExceeded ? '#ef4444' : pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#10b981';
  const availableColor = isExceeded ? '#f87171' : ringColor;
  const userBadge = acc.user_name
    ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;display:inline-block">${acc.user_name}</span>`
    : '';

  const invoiceAmount = monthInvoice !== undefined && monthInvoice !== null ? monthInvoice : null;

  return `
    <div class="bank-card-widget bank-card-credit ${isExceeded ? 'card-limit-exceeded' : ''}" data-card-id="${acc.id}" data-bank-color="${b.color}" data-card-name="${acc.name}" title="Clique para ver fatura e destacar parcelas no Planejamento" style="cursor:pointer;${isExceeded ? 'border: 1px solid rgba(239, 68, 68, 0.45); box-shadow: 0 0 16px rgba(239, 68, 68, 0.15);' : ''}">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 40)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            Cartão de Crédito ${userBadge}
            ${isExceeded ? `<span class="badge badge-danger" style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);font-size:9px;padding:1px 5px;border-radius:4px;font-weight:800">⚠️ LIMITE EXCEDIDO</span>` : ''}
          </div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>

      <div class="bank-card-body">
        <div class="bank-card-donut" style="position:relative">
          ${buildCreditDonut(spent, limit, 108)}
        </div>

        <div class="bank-card-values" style="gap:0">
          <div style="margin-bottom:8px">
            <div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Limite total</div>
            <div style="font-size:17px;font-weight:900;color:var(--text-primary);letter-spacing:-0.02em">${fmt.currency(limit)}</div>
          </div>

          ${invoiceAmount !== null ? `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
            <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">Fatura do Mês</span>
            <span style="font-size:13px;font-weight:800;color:#f87171">${fmt.currency(invoiceAmount)}</span>
          </div>` : ''}

          <div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${isExceeded || pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#f97316'};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Comprometido Total</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${isExceeded || pctReal > 80 ? '#f87171' : pctReal > 60 ? '#fbbf24' : '#fb923c'}">${fmt.currency(spent)}</div>
          </div>

          <div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${availableColor};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">${isExceeded ? 'Excedido / Negativo' : 'Disponível'}</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${availableColor}">${fmt.currency(available)}</div>
          </div>

          ${isExceeded ? `
          <div style="margin-top:6px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px">
            <span>⚠️</span> Estourado em ${fmt.currency(Math.abs(available))}
          </div>` : ''}

          ${acc.closing_day ? `
          <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px">
              <span style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em">Fechamento</span>
              <span style="font-size:12px; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; gap:4px">
                <span style="color:#0ea5e9; font-size:11px">🔒</span> Dia ${acc.closing_day}
              </span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px">
              <span style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em">Vencimento</span>
              <span style="font-size:12px; font-weight:700; color:#f87171; display:flex; align-items:center; gap:4px">
                <span style="font-size:11px">📅</span> Dia ${acc.due_day}
              </span>
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

/**
 * Renderiza um Card de Conta Débito ou Voucher
 */
function renderDebitAccountWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';
  const isVoucher = acc.type === 'voucher';
  const typeLabel = isVoucher ? (BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício') : (ACCOUNT_TYPES[acc.type] || 'Conta');

  return `
    <div class="bank-card-widget bank-card-debit ${isVoucher ? 'bank-card-voucher' : ''}" 
         data-account-id="${acc.id}" 
         data-bank-color="${b.color}" 
         data-account-name="${acc.name}"
         style="cursor:pointer;" 
         title="Clique para abrir e destacar os lançamentos desta conta no Planejamento">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${typeLabel} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${isVoucher ? 'Rendimentos / Recargas do mês' : 'Rendimentos do mês'}</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${isVoucher ? `
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${acc.card_last_digits ? `<span style="font-weight:700">•••• ${acc.card_last_digits}</span>` : ''}
            ${acc.benefit_monthly_credit ? `<span>• Recarga: <strong>${fmt.currency(acc.benefit_monthly_credit)}</strong> (Dia ${acc.benefit_credit_day || 1})</span>` : ''}
          </div>
        ` : (acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : '')}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:${b.color};font-weight:700;display:flex;align-items:center;gap:4px">
        <span>🔍 Ver lançamentos</span>
        <span style="font-size:10px">➔</span>
      </div>
    </div>`;
}

/**
 * Renderiza um Card de Conta Débito Estático (para aba Geral)
 */
function renderDebitAccountStaticWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';
  const isVoucher = acc.type === 'voucher';
  const typeLabel = isVoucher ? (BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício') : (ACCOUNT_TYPES[acc.type] || 'Conta');

  return `
    <div class="bank-card-widget bank-card-debit ${isVoucher ? 'bank-card-voucher' : ''}" 
         data-account-id="${acc.id}" 
         data-bank-color="${b.color}" 
         data-account-name="${acc.name}"
         style="cursor:pointer;" 
         title="Clique para abrir e destacar os lançamentos desta conta no Planejamento">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${typeLabel} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${isVoucher ? 'Saldo Disponível no Cartão' : 'Saldo Atual (Lançamentos Reais)'}</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${isVoucher ? `
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${acc.card_last_digits ? `<span style="font-weight:700">•••• ${acc.card_last_digits}</span>` : ''}
            ${acc.benefit_monthly_credit ? `<span>• Recarga: <strong>${fmt.currency(acc.benefit_monthly_credit)}</strong> (Dia ${acc.benefit_credit_day || 1})</span>` : ''}
          </div>
        ` : (acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : '')}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:${b.color};font-weight:700;display:flex;align-items:center;gap:4px">
        <span>🔍 Ver lançamentos</span>
        <span style="font-size:10px">➔</span>
      </div>
    </div>`;
}

/**
 * Renderiza um Item de Objetivo / Cofrinho
 */
function renderDashboardGoalItem(goal) {
  const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  return `
    <div class="dashboard-goal-item">
      <div style="font-size:24px;width:40px;height:40px;border-radius:10px;background:${goal.color}22;color:${goal.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${goal.icon || '🎯'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${goal.name}</span>
          <span style="font-size:12px;font-weight:700;color:${goal.color}">${pct}%</span>
        </div>
        <div class="progress-bar" style="height:6px;background:rgba(255,255,255,0.05);margin-bottom:6px">
          <div class="progress-fill" style="width:${pct}%;background:${goal.color}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted)">
          <span>Salvo: <b>${fmt.currency(goal.current_amount)}</b> de ${fmt.currency(goal.target_amount)}</span>
          <span>Falta: <b>${fmt.currency(remaining)}</b></span>
        </div>
      </div>
    </div>`;
}

/**
 * Configura o Gráfico Interativo de Categorias
 */
function setupCategoryInteractiveChart(wrapperElementId, chartStateKey, txs) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;

  const prefix = chartStateKey;
  const filterMetricId = `${prefix}-metric-type`;
  const filterPaymentId = `${prefix}-payment-status`;
  const filterTxTypeId = `${prefix}-tx-type`;
  const filterChartTypeId = `${prefix}-chart-type`;
  const filterCheckboxesId = `${prefix}-categories-checkboxes`;
  const chartCanvasId = `${prefix}-canvas`;
  const listContainerId = `${prefix}-list`;
  const chartContainerId = `${prefix}-chart-container`;

  wrapper.innerHTML = `
    <div class="chart-filters-container" style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Métrica</label>
          <select id="${filterMetricId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="amount" selected>💰 Valor (R$)</option>
            <option value="count">🔄 Repetições</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Pagamento</label>
          <select id="${filterPaymentId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="all" selected>👁️ Todas</option>
            <option value="paid">✅ Pagas</option>
            <option value="pending">⏳ Pendentes</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Fluxo</label>
          <select id="${filterTxTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="expense" selected>Saídas</option>
            <option value="income">Entradas</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Tipo de Gráfico</label>
          <select id="${filterChartTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="doughnut" selected>🍩 Rosca</option>
            <option value="horizontalBar">📊 Barras Lat.</option>
            <option value="polarArea">❄️ Área Polar</option>
          </select>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 8px;">
        <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; display: block; font-weight:600;">Exibir Categorias</label>
        <div id="${filterCheckboxesId}" style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 55px; overflow-y: auto; padding-right: 4px;">
          <!-- Checkboxes dinâmicos -->
        </div>
      </div>
    </div>

    <div class="interactive-chart-layout">
      <div id="${chartContainerId}" style="position: relative; width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <canvas id="${chartCanvasId}" style="max-height: 220px; max-width: 100%;"></canvas>
      </div>
      <div id="${listContainerId}" style="max-height: 220px; overflow-y: auto; padding-right: 4px;">
        <!-- Lista consolidada -->
      </div>
    </div>
  `;

  function renderCheckboxesAndDraw() {
    const txType = document.getElementById(filterTxTypeId).value;
    const uniqueCats = [];
    txs.filter(t => t.type === txType).forEach(t => {
      const name = t.category_name || 'Sem Categoria';
      if (!uniqueCats.find(c => c.name === name)) {
        uniqueCats.push({ name, icon: t.category_icon || '📋' });
      }
    });

    const cbContainer = document.getElementById(filterCheckboxesId);
    const prevChecked = cbContainer.dataset.checkedCats ? JSON.parse(cbContainer.dataset.checkedCats) : null;

    cbContainer.innerHTML = uniqueCats.map(c => {
      const isChecked = prevChecked ? prevChecked.includes(c.name) : true;
      return `
        <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer; user-select: none; background: rgba(255,255,255,0.03); padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px;">
          <input type="checkbox" class="${prefix}-cat-check" value="${c.name}" ${isChecked ? 'checked' : ''} style="margin: 0; cursor: pointer;">
          <span>${c.icon} ${c.name}</span>
        </label>
      `;
    }).join('');

    function updateChart() {
      const activeTxType = document.getElementById(filterTxTypeId).value;
      const activePaymentStatus = document.getElementById(filterPaymentId).value;
      const activeMetricType = document.getElementById(filterMetricId).value;
      const activeChartType = document.getElementById(filterChartTypeId).value;

      const checkedBoxes = Array.from(document.querySelectorAll(`.${prefix}-cat-check:checked`)).map(cb => cb.value);
      cbContainer.dataset.checkedCats = JSON.stringify(checkedBoxes);

      const filtered = txs.filter(t => {
        if (t.type !== activeTxType) return false;
        if (activePaymentStatus === 'paid' && !t.is_paid) return false;
        if (activePaymentStatus === 'pending' && t.is_paid) return false;
        const catName = t.category_name || 'Sem Categoria';
        if (!checkedBoxes.includes(catName)) return false;
        return true;
      });

      const catMap = {};
      filtered.forEach(t => {
        const name = t.category_name || 'Sem Categoria';
        const color = t.category_color || '#94a3b8';
        const icon = t.category_icon || '📋';
        if (!catMap[name]) {
          catMap[name] = { name, color, icon, amount: 0, count: 0 };
        }
        catMap[name].amount += (t.amount || 0);
        catMap[name].count += 1;
      });

      const catList = Object.values(catMap).sort((a, b) => b[activeMetricType] - a[activeMetricType]);
      const labels = catList.map(c => `${c.icon} ${c.name}`);
      const dataValues = catList.map(c => activeMetricType === 'amount' ? c.amount : c.count);
      const colors = catList.map(c => c.color);

      const listEl = document.getElementById(listContainerId);
      const totalSum = catList.reduce((acc, c) => acc + (activeMetricType === 'amount' ? c.amount : c.count), 0);

      listEl.innerHTML = catList.length === 0
        ? `<div class="no-data" style="font-size: 12px;">Nenhum lançamento no filtro.</div>`
        : catList.map(c => {
          const val = activeMetricType === 'amount' ? c.amount : c.count;
          const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : '0';
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${c.color}; flex-shrink: 0;"></div>
                <span style="font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.icon} ${c.name}</span>
              </div>
              <div style="text-align: right; flex-shrink: 0;">
                <span style="font-weight: 700; color: var(--text-primary);">${activeMetricType === 'amount' ? fmt.currency(c.amount) : c.count + ' un.'}</span>
                <span style="color: var(--text-muted); font-size: 10px; margin-left: 4px;">(${pct}%)</span>
              </div>
            </div>
          `;
        }).join('');

      if (State.charts[chartStateKey]) {
        State.charts[chartStateKey].destroy();
        delete State.charts[chartStateKey];
      }

      const canvas = document.getElementById(chartCanvasId);
      if (!canvas) return;

      let cType = activeChartType;
      let chartOpts = chartOptions(cType);

      if (activeChartType === 'horizontalBar') {
        cType = 'bar';
        chartOpts = {
          ...chartOptions('bar'),
          indexAxis: 'y',
          plugins: { ...chartOptions('bar').plugins, legend: { display: false } }
        };
      }

      if (activeMetricType === 'count' && chartOpts.scales && chartOpts.scales.y) {
        chartOpts.scales.y.ticks.callback = (v) => `${v} un`;
      }
      if (activeMetricType === 'count' && activeChartType === 'horizontalBar' && chartOpts.scales && chartOpts.scales.x) {
        chartOpts.scales.x.ticks.callback = (v) => `${v} un`;
      }

      State.charts[chartStateKey] = new Chart(canvas, {
        type: cType,
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors,
            borderWidth: cType === 'doughnut' ? 2 : 1,
            borderColor: cType === 'doughnut' ? 'var(--bg-card)' : colors,
            borderRadius: cType === 'bar' ? 4 : 0
          }]
        },
        options: chartOpts
      });
    }

    document.querySelectorAll(`.${prefix}-cat-check`).forEach(cb => {
      cb.onchange = updateChart;
    });

    updateChart();
  }

  document.getElementById(filterTxTypeId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterPaymentId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };
  document.getElementById(filterMetricId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };
  document.getElementById(filterChartTypeId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };

  renderCheckboxesAndDraw();
}


/* ==== dashboard-main-2.js ==== */
/* ===
 * dashboard-main-2.js — Parte 2 de dashboard-main
 * Linhas 1757–1800 do app.js
 */

function chartOptions(type) {
  const base = {
    responsive: true, maintainAspectRatio: true,
    layout: {
      padding: {
        left: (type === 'bar' || type === 'line') ? 60 : 20,
        right: 15,
        top: 10,
        bottom: 5
      }
    },
    plugins: {
      legend: { display: type === 'doughnut' || type === 'line', position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10, boxWidth: 12 } },
      tooltip: {
        callbacks: { label: (ctx) => ' ' + fmt.currency(ctx.raw) },
        backgroundColor: '#1e2535', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#f1f5f9', bodyColor: '#94a3b8',
      }
    }
  };
  if (type === 'bar' || type === 'line') {
    base.scales = {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { 
        grid: { color: 'rgba(255,255,255,0.04)' }, 
        ticks: { 
          color: '#64748b', 
          font: { size: 11 }, 
          callback: (v) => {
            if (v === 0) return 'R$ 0';
            const isNegative = v < 0;
            const absVal = Math.abs(v);
            const formattedVal = absVal >= 1000 ? (absVal / 1000).toFixed(0) + 'k' : absVal.toFixed(0);
            return isNegative ? `-R$ ${formattedVal}` : `R$ ${formattedVal}`;
          } 
        } 
      }
    };
  }
  return base;
}

// ════════════════════════════════════════
// RECORRÊNCIAS

/* ==== planning-main-1.js ==== */
/* ===
 * planning-main-1.js — Parte 1 de planning-main
 * Linhas 1801–2779 do app.js
 */

async function renderRecurring() {
  const page = document.getElementById('page-recurring');
  const [accounts, categories] = await Promise.all([
    window.api.accounts.getAll(State.user.id),
    window.api.categories.getAll(State.user.id),
  ]);

  if (!State.currentRecurringTab || State.currentRecurringTab === 'avulso') {
    State.currentRecurringTab = 'income';
  }
  const currentTab = State.currentRecurringTab;

  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Planejamento Mensal</h2><p class="page-subtitle">Gerencie suas receitas e despesas (Fixas e Variáveis)</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" id="btn-scan-nfce-planning" style="background:rgba(16,185,129,0.15);color:var(--accent-light);border:1px solid var(--accent);font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><span>📷</span> Ler Nota</button>
        <button class="btn" id="btn-new-avulso" style="background:#6366f1;color:#ffffff;border:none;font-weight:600;padding:8px 16px;border-radius:8px;cursor:pointer">+ Nova Variável</button>
        <button class="btn btn-primary" id="btn-new-recurring">+ Nova Fixa</button>
      </div>
    </div>
    <div class="report-tabs" id="rec-tabs">
      <button class="report-tab ${currentTab === 'income' ? 'active' : ''}" data-tab="income">💰 Receitas</button>
      <button class="report-tab ${currentTab === 'expense' ? 'active' : ''}" data-tab="expense">💸 Despesas</button>
    </div>
    <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;" id="rec-controls-wrap">
      <div style="flex:1;min-width:250px;position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-muted);pointer-events:none">🔍</span>
        <input type="text" id="rec-search-input" class="search-control-input" placeholder="Buscar por descrição, valor, conta ou categoria...">
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;color:var(--text-muted)">Ordenar por:</span>
        <select id="rec-sort-select" class="search-control-select">
          <option value="manual" ${State.currentSort === 'manual' ? 'selected' : ''}>👆 Ordem Manual</option>
          <option value="newest" ${State.currentSort === 'newest' ? 'selected' : ''}>📅 Mais Recentes</option>
          <option value="oldest" ${State.currentSort === 'oldest' ? 'selected' : ''}>📅 Mais Antigos</option>
          <option value="highest" ${State.currentSort === 'highest' ? 'selected' : ''}>📈 Maior Valor</option>
          <option value="lowest" ${State.currentSort === 'lowest' ? 'selected' : ''}>📉 Menor Valor</option>
        </select>
      </div>
      <div id="rec-period-wrap-main" style="margin-left:auto"></div>
    </div>
    <div id="rec-content"></div>
  `;

  document.getElementById('rec-period-wrap-main').appendChild(buildPeriodSelector(() => renderRecurring()));

  const sortSelect = document.getElementById('rec-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      State.currentSort = e.target.value;
      loadTab(State.currentRecurringTab);
    };
  }

  document.getElementById('btn-scan-nfce-planning').onclick = () => {
    if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
  };
  document.getElementById('btn-new-avulso').onclick = () => openAvulsoModal(accounts, categories, null, State.currentRecurringTab);
  document.getElementById('btn-new-recurring').onclick = () => openRecurringModal(null, accounts, categories, State.currentRecurringTab);

  document.querySelectorAll('#rec-tabs .report-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#rec-tabs .report-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentRecurringTab = btn.dataset.tab;
      loadTab(State.currentRecurringTab);
    };
  });

  async function loadTab(tab) {
    const content = document.getElementById('rec-content');
    content.innerHTML = `
      ${tab === 'expense' ? '<div id="invoices-container" style="margin-bottom:24px"></div>' : ''}
      <div class="section-title" style="margin-top:10px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📌</span> ${tab === 'income' ? 'Receitas Fixas' : 'Despesas Fixas'}
      </div>
      <div id="fixed-container"></div>
      
      <div class="section-title" style="margin-top:30px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📝</span> ${tab === 'income' ? 'Receitas Variáveis' : 'Despesas Variáveis'} do Mês
      </div>
      <div id="variable-container"></div>
    `;

    const [items, monthlyTxs, allAvulsos, invoices] = await Promise.all([
      window.api.recurring.getAll(State.user.id, tab, State.currentMonth, State.currentYear),
      window.api.recurring.getMonthly({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true }),
      tab === 'expense' ? window.api.invoices.getMonthly({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }).catch(e => { console.error(e); return []; }) : Promise.resolve([])
    ]);
    
    const avulsos = allAvulsos.filter(t => t.type === tab);

    const applyFilter = () => {
      const q = (document.getElementById('rec-search-input')?.value || '').toLowerCase().trim();
      
      const filteredItems = items.filter(item => {
        if (!q) return true;
        const tx = monthlyTxs.find(t => t.recurring_item_id === item.id);
        const name = (tx ? tx.description : item.name).toLowerCase();
        const amount = String(item.amount);
        const formattedAmount = fmt.currency(item.amount).toLowerCase();
        const account = (item.account_name || '').toLowerCase();
        const category = (item.category_name || '').toLowerCase();
        return name.includes(q) || amount.includes(q) || formattedAmount.includes(q) || account.includes(q) || category.includes(q);
      });

      const filteredAvulsos = avulsos.filter(t => {
        if (!q) return true;
        const desc = (t.description || '').toLowerCase();
        const amount = String(t.amount);
        const formattedAmount = fmt.currency(t.amount).toLowerCase();
        const account = (t.account_name || '').toLowerCase();
        const category = (t.category_name || '').toLowerCase();
        return desc.includes(q) || amount.includes(q) || formattedAmount.includes(q) || account.includes(q) || category.includes(q);
      });

      // Sort lists based on State.currentSort
      const sortMode = State.currentSort || 'manual';
      if (sortMode === 'newest') {
        filteredItems.sort((a, b) => b.due_day - a.due_day);
        filteredAvulsos.sort((a, b) => b.date.localeCompare(a.date));
      } else if (sortMode === 'oldest') {
        filteredItems.sort((a, b) => a.due_day - b.due_day);
        filteredAvulsos.sort((a, b) => a.date.localeCompare(b.date));
      } else if (sortMode === 'highest') {
        filteredItems.sort((a, b) => b.amount - a.amount);
        filteredAvulsos.sort((a, b) => b.amount - a.amount);
      } else if (sortMode === 'lowest') {
        filteredItems.sort((a, b) => a.amount - b.amount);
        filteredAvulsos.sort((a, b) => a.amount - b.amount);
      }

      if (tab === 'expense') {
        renderInvoicesList(document.getElementById('invoices-container'), invoices, accounts);
      }
      renderRecurringList(document.getElementById('fixed-container'), filteredItems, monthlyTxs, tab, accounts, categories);
      renderAvulsosList(document.getElementById('variable-container'), filteredAvulsos, accounts, categories, tab);

      const recList = document.getElementById('recurring-list');
      if (recList) setupDragAndDrop(recList, true);

      const avlList = document.getElementById('avulso-list');
      if (avlList) setupDragAndDrop(avlList, false);

      if (tab === 'expense' && State.highlightCardId) {
        applyTransactionCardHighlight();
      } else if (tab === 'income' && State.highlightAccountId) {
        applyTransactionAccountHighlight();
      }
    };

    const searchInput = document.getElementById('rec-search-input');
    if (searchInput) {
      searchInput.oninput = applyFilter;
      applyFilter();
    } else {
      applyFilter();
    }
  }

  await loadTab(currentTab);
}

function setupDragAndDrop(container, isRecurring) {
  if (!container) return;

  const items = container.querySelectorAll('.transaction-item');
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', async () => {
      item.classList.remove('dragging');
      
      const orderedElements = [...container.querySelectorAll('.transaction-item')];
      const positions = orderedElements.map((el, index) => ({
        id: parseInt(el.dataset.id),
        position: index
      }));

      try {
        if (isRecurring) {
          await window.api.recurring.updatePositions(State.user.id, positions);
        } else {
          await window.api.transactions.updatePositions(State.user.id, positions);
        }
      } catch (err) {
        console.error('Erro ao salvar nova ordenação:', err);
        toast('Erro ao salvar a ordenação');
      }
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = container.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...container.querySelectorAll('.transaction-item:not(.dragging)')];
    
    const nextSibling = siblings.find(sibling => {
      const rect = sibling.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      return e.clientY <= midpoint;
    });

    container.insertBefore(draggingItem, nextSibling);
  });
}

function renderRecurringList(container, items, monthlyTxs, type, accounts, categories) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const settings = State.settings;
  const alertDays = settings.alert_days_before || 3;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px">
        <div class="empty-title">Nenhuma ${type === 'income' ? 'receita' : 'despesa'} fixa cadastrada</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${items.length} item(s) cadastrado(s)</span>
    </div>
    <div class="recurring-list" id="recurring-list"></div>`;

  const list = document.getElementById('recurring-list');
  list.innerHTML = items.map(item => {
    const tx = monthlyTxs.find(t => t.recurring_item_id === item.id);
    const isPaid = tx?.is_paid ?? false;

    // Calculate calendar days left relative to the viewed month/year period
    const dueYear = State.currentYear;
    const dueMonth = State.currentMonth;
    const dueDay = Math.min(item.due_day, new Date(dueYear, dueMonth, 0).getDate());
    const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
    const diffTime = dueDate.getTime() - todayDate.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isAlert = !isPaid && daysLeft >= 0 && daysLeft <= alertDays;
    const isOverdue = !isPaid && daysLeft < 0;
    const canEdit = State.user?.profile_type === 1 || State.user?.profile_type === 2 || State.permissions.can_edit_all === 1 || !item.user_id || item.user_id === State.user.id;

    const compDateStr = tx ? tx.date.split(' ')[0] : `${State.currentYear}-${String(State.currentMonth).padStart(2,'0')}-${String(item.due_day).padStart(2,'0')}`;
    const payDateStr = tx && tx.payment_date ? tx.payment_date.split(' ')[0] : null;

    const isEarlyPaid = isPaid && payDateStr && compDateStr && (payDateStr < compDateStr);
    const isLatePaid = isPaid && payDateStr && compDateStr && (payDateStr > compDateStr);
    const hasPenalty = tx && tx.penalty_amount > 0;
    const hasDiscount = tx && tx.discount_amount > 0;

    const baseAmount = tx ? tx.amount : item.amount;
    const netAmount = baseAmount + (tx?.penalty_amount || 0) - (tx?.discount_amount || 0);

    let statusBadge = '';
    if (isPaid) {
      if (isEarlyPaid && hasDiscount) {
        statusBadge = `<span class="transaction-status status-paid-discount" title="Valor base: ${fmt.currency(baseAmount)} | Desconto: -${fmt.currency(tx.discount_amount)} | Total Pago: ${fmt.currency(netAmount)}">🏷️ Pago Antecipado c/ Desconto (${fmt.date(payDateStr)})</span>`;
      } else if (isEarlyPaid) {
        statusBadge = `<span class="transaction-status status-paid-early" title="Pago antecipado em ${fmt.date(payDateStr)}">✓ Pago Antecipado (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid && hasPenalty) {
        statusBadge = `<span class="transaction-status status-paid-penalty" title="Valor base: ${fmt.currency(baseAmount)} | Juros: +${fmt.currency(tx.penalty_amount)} | Total Pago: ${fmt.currency(netAmount)}">⚠️ Pago em Atraso c/ Juros (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid) {
        statusBadge = `<span class="transaction-status status-paid-late" title="Pago em atraso em ${fmt.date(payDateStr)}">⚠️ Pago em Atraso (${fmt.date(payDateStr)})</span>`;
      } else {
        statusBadge = `<span class="transaction-status status-paid">✓ Pago</span>`;
      }
    }
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171">⚠️ Atrasado</span>`;
    else if (isAlert) statusBadge = `<span class="transaction-status" style="background:var(--warning-dim);color:var(--warning)">🚨 Vence em ${daysLeft}d</span>`;
    else statusBadge = `<span class="transaction-status status-pending">⏳ Dia ${item.due_day}</span>`;

    let checkBtnHtml = '';
    if (tx) {
      if (!canEdit) {
        checkBtnHtml = `
          <button class="transaction-check-btn locked ${isPaid ? 'checked' : ''}" title="Apenas leitura (🔒)" disabled>
            ${isPaid ? '✓' : '🔒'}
          </button>
        `;
      } else {
        checkBtnHtml = `
          <button class="transaction-check-btn rec-toggle-paid ${isPaid ? 'checked' : ''}" 
                  data-tx-id="${tx.id}" 
                  title="${isPaid ? (type === 'income' ? 'Marcar como não recebida' : 'Marcar como não paga') : (type === 'income' ? 'Marcar como recebida' : 'Marcar como paga')}">
            ${isPaid ? '✓' : ''}
          </button>
        `;
      }
    } else {
      checkBtnHtml = `
        <button class="transaction-check-btn disabled" title="Indisponível" disabled></button>
      `;
    }

    return `
      <div class="transaction-item recurring-item ${isPaid ? 'recurring-paid' : ''} ${item.is_priority ? 'recurring-priority' : ''}" data-id="${item.id}" data-account-id="${item.account_id || ''}" data-account-name="${(item.account_name || '').toLowerCase()}" data-invoice-id="${tx?.invoice_id || ''}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
        ${checkBtnHtml}
        <div class="transaction-category-icon" style="background:${item.color}22;font-size:20px">${item.icon}</div>
        <div class="transaction-info">
          <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
            ${item.is_priority ? '<span title="Prioritário" style="font-size:14px">⭐</span>' : ''}
            ${tx ? tx.description : item.name}
            ${tx && tx.competence_date ? `<span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--bg-raised);color:var(--text-muted);border:1px solid var(--border);font-weight:600;margin-left:4px" title="Mês de Referência / Consumo">Ref: ${fmtCompetence(tx.competence_date)}</span>` : ''}
            ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
          </div>
          <div class="transaction-meta">
            ${item.category_name ? `${item.cat_icon || ''} ${item.category_name} • ` : ''}
            ${(item.account_type === 'credit' || accounts.find(a => a.id === item.account_id)?.type === 'credit') ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);font-weight:600">💳 ${item.account_name}</span>` : (item.account_name || '—')} • Todo dia ${item.due_day}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="transaction-amount ${type === 'income' ? 'income' : 'expense'}">
            ${type === 'income' ? '+' : '-'}${fmt.currency(isPaid ? netAmount : baseAmount)}
          </div>
          ${isPaid && (hasPenalty || hasDiscount) ? `
            <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
              Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(tx.penalty_amount)}` : `Desconto: -${fmt.currency(tx.discount_amount)}`}
            </div>
          ` : ''}
          ${statusBadge}
        </div>
        <div class="transaction-actions">
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-priority" data-id="${item.id}" title="${item.is_priority ? 'Remover prioridade' : 'Marcar como prioritário'}">${item.is_priority ? '★' : '☆'}</button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-edit" data-id="${item.id}" title="Editar">✏️</button>` : ''}
          ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon rec-delete" data-id="${item.id}" title="Excluir">🗑</button>` : ''}
          ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.rec-toggle-paid').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const txId = parseInt(btn.dataset.txId);
      const tx = monthlyTxs.find(t => t.id == txId);
      if (tx && tx.is_paid) {
        await window.api.transactions.togglePaid(txId);
        toast('Status atualizado');
        renderRecurring();
      } else {
        openPaymentDateModal(txId, tx ? tx.date : null, () => {
          renderRecurring();
        });
      }
    };
  });
  list.querySelectorAll('.rec-priority').forEach(btn => {
    btn.onclick = async (e) => { e.stopPropagation(); await window.api.recurring.togglePriority(parseInt(btn.dataset.id)); renderRecurring(); };
  });
  list.querySelectorAll('.rec-edit').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = parseInt(btn.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);

      if (tx) {
        Modal.open('Editar Lançamento Fixo', `
          <div style="padding: 16px; text-align: center;">
            <p style="margin-bottom: 24px; font-size: 15px; color: var(--text-primary);">
              Como deseja editar o item <strong>"${tx.description || item.name}"</strong>?
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button class="btn btn-primary" id="btn-edit-month" style="background: var(--accent); border-color: var(--accent); font-weight: 600;">
                ✏️ Editar APENAS o valor/dados deste mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})
              </button>
              <button class="btn btn-outline" id="btn-edit-all" style="background: var(--bg-raised); font-weight: 600;">
                ⚙️ Editar o Cadastro Fixo Geral (Regra de todos os meses)
              </button>
              <button class="btn btn-secondary" id="btn-edit-cancel" style="margin-top: 8px;">
                Cancelar
              </button>
            </div>
          </div>
        `);

        document.getElementById('btn-edit-cancel').onclick = Modal.close;

        document.getElementById('btn-edit-month').onclick = () => {
          Modal.close();
          openEditMonthTransactionModal(tx, item, accounts, categories, type);
        };

        document.getElementById('btn-edit-all').onclick = () => {
          Modal.close();
          openRecurringModal(item, accounts, categories, type);
        };
      } else {
        openRecurringModal(item, accounts, categories, type);
      }
    };
  });
  list.querySelectorAll('.rec-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = parseInt(btn.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);
      
      Modal.open('Excluir Lançamento Fixo', `
        <div style="padding: 16px; text-align: center;">
          <p style="margin-bottom: 24px; font-size: 15px; color: var(--text-primary);">
            Como deseja excluir o item <strong>"${item.name}"</strong>?
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${tx ? `
              <button class="btn btn-primary" id="btn-del-month" style="background: var(--warning); border-color: var(--warning); color: #000; font-weight: 600;">
                ❌ Excluir APENAS o lançamento deste mês
              </button>
            ` : ''}
            <button class="btn btn-danger" id="btn-del-all" style="font-weight: 600;">
              🗑️ Excluir TODAS as ocorrências futuras (Desativar item)
            </button>
            <button class="btn btn-secondary" id="btn-del-cancel" style="margin-top: 8px;">
              Cancelar
            </button>
          </div>
        </div>
      `);
      
      if (tx) {
        document.getElementById('btn-del-month').onclick = async () => {
          if (item.repeat_months > 0) {
            // Limited installment expense - Ask if Postpone or Skip
            Modal.open('Opções do Parcelamento', `
              <div style="padding: 16px; text-align: center;">
                <p style="margin-bottom: 20px; font-size: 14px; color: var(--text-primary); line-height: 1.5;">
                  Esta despesa é parcelada (<strong>${tx.description}</strong>).<br>Como deseja tratar a exclusão deste mês?
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <button class="btn btn-primary" id="btn-postpone" style="background: var(--accent); border-color: var(--accent); font-weight: 600;">
                    ➡️ Postergar (Adiar para o próximo mês)
                  </button>
                  <button class="btn btn-outline" id="btn-skip" style="background: var(--bg-raised); font-weight: 600;">
                    ❌ Pular Parcela (Cancelar a deste mês)
                  </button>
                  <button class="btn btn-secondary" id="btn-postpone-cancel" style="margin-top: 8px;">
                    Cancelar
                  </button>
                </div>
              </div>
            `);

            document.getElementById('btn-postpone').onclick = async () => {
              await window.api.recurring.postponeInstallment({ txId: tx.id, itemId: item.id });
              toast('Parcela postergada para o próximo mês!');
              Modal.close();
              renderRecurring();
            };

            document.getElementById('btn-skip').onclick = async () => {
              await window.api.transactions.delete(tx.id);
              toast('Lançamento deste mês cancelado');
              Modal.close();
              renderRecurring();
            };

            document.getElementById('btn-postpone-cancel').onclick = Modal.close;
          } else {
            // Infinite recurring item - Just delete the transaction
            await window.api.transactions.delete(tx.id);
            toast('Lançamento deste mês excluído');
            Modal.close();
            renderRecurring();
          }
        };
      }
      
      document.getElementById('btn-del-all').onclick = async () => {
        const fromDate = `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}-01`;
        await window.api.recurring.delete(itemId, fromDate);
        toast('Recorrência e lançamentos subsequentes excluídos');
        Modal.close();
        renderRecurring();
      };
      
      document.getElementById('btn-del-cancel').onclick = Modal.close;
    };
  });
}

function renderAvulsosList(container, txs, accounts, categories, tabType) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const settings = State.settings || {};
  const alertDays = settings.alert_days_before || 3;

  container.innerHTML = `
    <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${txs.length} lançamento(s)</span>
    </div>
    <div class="transactions-list" id="avulso-list"></div>`;

  const list = document.getElementById('avulso-list');
  if (txs.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding: 24px"><div class="empty-title">Nenhum lançamento variável</div></div>`;
    return;
  }
  list.innerHTML = txs.map(t => {
    const isPaid = t.is_paid === 1;
    const canEdit = State.user?.profile_type === 1 || State.user?.profile_type === 2 || State.permissions.can_edit_all === 1 || !t.user_id || t.user_id === State.user.id;
    let checkBtnHtml = '';
    if (!canEdit) {
      checkBtnHtml = `
        <button class="transaction-check-btn locked ${isPaid ? 'checked' : ''}" title="Apenas leitura (🔒)" disabled>
          ${isPaid ? '✓' : '🔒'}
        </button>
      `;
    } else {
      checkBtnHtml = `
        <button class="transaction-check-btn avl-toggle ${isPaid ? 'checked' : ''}" 
                data-id="${t.id}" 
                title="${isPaid ? (t.type === 'income' ? 'Marcar como não recebida' : 'Marcar como não paga') : (t.type === 'income' ? 'Marcar como recebida' : 'Marcar como paga')}">
          ${isPaid ? '✓' : ''}
        </button>
      `;
    }

    const compDateStr = t.date ? t.date.split(' ')[0] : null;
    const payDateStr = t.payment_date ? t.payment_date.split(' ')[0] : null;
    
    let daysLeft = null;
    if (compDateStr) {
      const parts = compDateStr.split('-').map(Number);
      const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffTime = dueDate.getTime() - todayDate.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const isAlert = !isPaid && daysLeft !== null && daysLeft >= 0 && daysLeft <= alertDays;
    const isOverdue = !isPaid && daysLeft !== null && daysLeft < 0;
    const isEarlyPaid = isPaid && payDateStr && compDateStr && (payDateStr < compDateStr);
    const isLatePaid = isPaid && payDateStr && compDateStr && (payDateStr > compDateStr);
    const hasPenalty = t.penalty_amount > 0;
    const hasDiscount = t.discount_amount > 0;
    const baseAmount = t.amount;
    const netAmount = baseAmount + (t.penalty_amount || 0) - (t.discount_amount || 0);

    let statusBadge = '';
    if (isPaid) {
      if (isEarlyPaid && hasDiscount) {
        statusBadge = `<span class="transaction-status status-paid-discount" title="Valor base: ${fmt.currency(baseAmount)} | Desconto: -${fmt.currency(t.discount_amount)} | Total Pago: ${fmt.currency(netAmount)}">🏷️ Pago Antecipado c/ Desconto (${fmt.date(payDateStr)})</span>`;
      } else if (isEarlyPaid) {
        statusBadge = `<span class="transaction-status status-paid-early" title="Pago antecipado em ${fmt.date(payDateStr)}">✓ Pago Antecipado (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid && hasPenalty) {
        statusBadge = `<span class="transaction-status status-paid-penalty" title="Valor base: ${fmt.currency(baseAmount)} | Juros: +${fmt.currency(t.penalty_amount)} | Total Pago: ${fmt.currency(netAmount)}">⚠️ Pago em Atraso c/ Juros (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid) {
        statusBadge = `<span class="transaction-status status-paid-late" title="Pago em atraso em ${fmt.date(payDateStr)}">⚠️ Pago em Atraso (${fmt.date(payDateStr)})</span>`;
      } else {
        statusBadge = `<span class="transaction-status status-paid">✓ Pago${payDateStr ? ' (' + fmt.date(payDateStr) + ')' : ''}</span>`;
      }
    }
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171">⚠️ Atrasado</span>`;
    else if (isAlert) statusBadge = `<span class="transaction-status" style="background:var(--warning-dim);color:var(--warning)">🚨 Vence em ${daysLeft}d</span>`;
    else statusBadge = `<span class="transaction-status status-pending">⏳ Pendente</span>`;

    return `
    <div class="transaction-item" data-id="${t.id}" data-account-id="${t.account_id || ''}" data-account-name="${(t.account_name || '').toLowerCase()}" data-invoice-id="${t.invoice_id || ''}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
      ${checkBtnHtml}
      <div class="transaction-category-icon" style="background:${t.category_color ? t.category_color + '22' : 'var(--bg-raised)'}">
        ${t.category_icon || (t.type === 'income' ? '💰' : '📋')}
      </div>
      <div class="transaction-info">
        <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
          ${t.description || 'Sem descrição'}
          ${t.competence_date ? `<span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--bg-raised);color:var(--text-muted);border:1px solid var(--border);font-weight:600;margin-left:4px" title="Mês de Referência / Consumo">Ref: ${fmtCompetence(t.competence_date)}</span>` : ''}
          ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
        </div>
        <div class="transaction-meta">${fmt.date(t.date)} • ${(t.account_type === 'credit' || accounts.find(a => a.id === t.account_id)?.type === 'credit') ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);font-weight:600">💳 ${t.account_name}</span>` : (t.account_name || '—')} ${t.category_name ? `• ${t.category_name}` : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="transaction-amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(isPaid ? netAmount : baseAmount)}</div>
        ${isPaid && (hasPenalty || hasDiscount) ? `
          <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
            Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(t.penalty_amount)}` : `Desconto: -${fmt.currency(t.discount_amount)}`}
          </div>
        ` : ''}
        ${statusBadge}
      </div>
      <div class="transaction-actions">
        ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon avl-edit" data-id="${t.id}" title="Editar">✏️</button>` : ''}
        ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon avl-delete" data-id="${t.id}" title="Excluir">🗑</button>` : ''}
        ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.avl-toggle').forEach(btn => {
    btn.onclick = async () => {
      const txId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == txId);
      if (tx && tx.is_paid) {
        await window.api.transactions.togglePaid(txId);
        toast('Status atualizado');
        renderRecurring();
      } else {
        openPaymentDateModal(txId, tx ? tx.date : null, () => {
          renderRecurring();
        });
      }
    };
  });
  list.querySelectorAll('.avl-edit').forEach(btn => {
    btn.onclick = () => {
      const transactionId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == transactionId);
      openAvulsoModal(accounts, categories, tx);
    };
  });
  list.querySelectorAll('.avl-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const txId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == txId);
      const desc = tx && tx.description ? `"${tx.description}"` : 'esta despesa variável';
      const amountStr = tx ? fmt.currency(tx.amount) : '';

      Modal.open('Excluir Lançamento Variável', `
        <div style="padding: 16px; text-align: center;">
          <p style="margin-bottom: 20px; font-size: 15px; color: var(--text-primary); line-height: 1.5;">
            Tem certeza que deseja excluir permanentemente a despesa variável <strong>${desc}</strong>${amountStr ? ' no valor de <strong style="color:var(--danger)">' + amountStr + '</strong>' : ''}?
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-danger" id="btn-confirm-delete-avl" style="font-weight: 600; padding: 10px; background:#ef4444; border-color:#ef4444; color:#ffffff; border-radius:8px; cursor:pointer;">
              🗑️ Sim, Excluir Definitivamente
            </button>
            <button class="btn btn-secondary" id="btn-cancel-delete-avl" style="margin-top: 4px; padding: 8px;">
              Cancelar
            </button>
          </div>
        </div>
      `);

      document.getElementById('btn-cancel-delete-avl').onclick = Modal.close;

      document.getElementById('btn-confirm-delete-avl').onclick = async () => {
        Modal.close();
        const res = await window.api.transactions.delete(txId);
        if (res && res.error) {
          toast(res.error, 'error');
        } else {
          toast('Despesa variável excluída com sucesso!', 'success');
          renderRecurring();
        }
      };
    };
  });
}

// ── 💳 Destaque Interativo de Faturas e Parcelas de Cartão ──
function toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId) {
  if (State.highlightCardId === cardId || (invoiceId && State.highlightInvoiceId === invoiceId)) {
    State.highlightCardId = null;
    State.highlightCardColor = null;
    State.highlightCardName = null;
    State.highlightInvoiceId = null;
    toast(`Destaque de fatura desativado`);
  } else {
    State.highlightCardId = cardId || null;
    State.highlightCardColor = cardColor || '#3b82f6';
    State.highlightCardName = cardName || 'Cartão';
    State.highlightInvoiceId = invoiceId || null;
  }

  // Update invoice cards visual state
  document.querySelectorAll('.invoice-card-item').forEach(cardEl => {
    const cid = parseInt(cardEl.dataset.cardId);
    const invId = parseInt(cardEl.dataset.invoiceId);
    const color = cardEl.dataset.bankColor || '#3b82f6';
    const isSelected = (State.highlightCardId && State.highlightCardId === cid) || (State.highlightInvoiceId && State.highlightInvoiceId === invId);
    const badge = cardEl.querySelector('.invoice-highlight-badge');

    if (isSelected) {
      cardEl.classList.add('invoice-card-selected');
      cardEl.style.background = `${color}25`;
      cardEl.style.borderColor = color;
      cardEl.style.boxShadow = `0 0 22px ${color}55, inset 0 0 10px ${color}22`;
      if (badge) {
        badge.innerHTML = `✨ <strong>Parcelas Destacadas abaixo</strong> (Clique para desmarcar)`;
        badge.style.background = color;
        badge.style.color = '#ffffff';
        badge.style.borderColor = color;
      }
    } else {
      cardEl.classList.remove('invoice-card-selected');
      cardEl.style.background = `${color}15`;
      cardEl.style.borderColor = `${color}44`;
      cardEl.style.boxShadow = 'none';
      if (badge) {
        badge.innerHTML = `🔍 Ver Parcelas desta Fatura`;
        badge.style.background = `${color}25`;
        badge.style.color = color;
        badge.style.borderColor = `${color}66`;
      }
    }
  });

  applyTransactionCardHighlight();
}

function applyTransactionCardHighlight() {
  const cardId = State.highlightCardId;
  const invoiceId = State.highlightInvoiceId;
  const color = State.highlightCardColor || '#3b82f6';
  const cardName = State.highlightCardName || 'Cartão';
  const cleanCardName = cardName.toLowerCase().trim();

  const allItems = document.querySelectorAll('#fixed-container .transaction-item, #variable-container .transaction-item');
  let firstMatchedEl = null;
  let matchCount = 0;

  allItems.forEach(itemEl => {
    const itemAccountId = parseInt(itemEl.dataset.accountId);
    const itemInvoiceId = parseInt(itemEl.dataset.invoiceId);
    const itemAccountName = (itemEl.dataset.accountName || '').toLowerCase().trim();
    
    // Reset previous dynamic highlight styles
    itemEl.classList.remove('card-highlight-active', 'card-highlight-dimmed');
    itemEl.style.removeProperty('border');
    itemEl.style.removeProperty('border-color');
    itemEl.style.removeProperty('border-left');
    itemEl.style.removeProperty('background');
    itemEl.style.removeProperty('box-shadow');
    itemEl.style.removeProperty('transform');
    
    const existingPill = itemEl.querySelector('.card-highlight-pill');
    if (existingPill) existingPill.remove();

    if (cardId || invoiceId || cleanCardName) {
      // Check matching criteria:
      const matchAccount = cardId && !isNaN(cardId) && itemAccountId === cardId;
      const matchInvoice = invoiceId && !isNaN(invoiceId) && itemInvoiceId === invoiceId;
      const matchName = cleanCardName && itemAccountName && (cleanCardName.includes(itemAccountName) || itemAccountName.includes(cleanCardName));

      const isMatch = matchAccount || matchInvoice || matchName;

      if (isMatch) {
        matchCount++;
        if (!firstMatchedEl) firstMatchedEl = itemEl;

        itemEl.classList.add('card-highlight-active');
        itemEl.style.setProperty('border', `2px solid ${color}`, 'important');
        itemEl.style.setProperty('border-left', `8px solid ${color}`, 'important');
        itemEl.style.setProperty('background', `${color}18`, 'important');
        itemEl.style.setProperty('box-shadow', `0 4px 20px ${color}48`, 'important');
        itemEl.style.setProperty('transform', 'translateX(6px)', 'important');

        const descEl = itemEl.querySelector('.transaction-desc');
        if (descEl) {
          const pill = document.createElement('span');
          pill.className = 'card-highlight-pill';
          pill.style.cssText = `font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: ${color}; color: #ffffff; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px ${color}66; animation: popIn 0.3s ease;`;
          pill.innerHTML = `💳 ${cardName} • Composição da Fatura`;
          descEl.appendChild(pill);
        }
      } else {
        itemEl.classList.add('card-highlight-dimmed');
      }
    }
  });

  if ((cardId || invoiceId) && matchCount > 0 && firstMatchedEl) {
    firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`✨ ${matchCount} lançamento(s) do cartão ${cardName} destacado(s)`);
  } else if ((cardId || invoiceId) && matchCount === 0) {
    toast(`Nenhum lançamento avulso ou fixo deste mês encontrado para o cartão ${cardName}.`);
  }
}

function applyTransactionAccountHighlight() {
  const accountId = State.highlightAccountId;
  const color = State.highlightAccountColor || '#10b981';
  const accountName = State.highlightAccountName || 'Conta';
  const cleanAccountName = accountName.toLowerCase().trim();

  const allItems = document.querySelectorAll('#fixed-container .transaction-item, #variable-container .transaction-item');
  let firstMatchedEl = null;
  let matchCount = 0;

  allItems.forEach(itemEl => {
    const itemAccountId = parseInt(itemEl.dataset.accountId);
    const itemAccountName = (itemEl.dataset.accountName || '').toLowerCase().trim();
    
    // Reset previous dynamic highlight styles
    itemEl.classList.remove('card-highlight-active', 'card-highlight-dimmed', 'account-highlight-active', 'account-highlight-dimmed');
    itemEl.style.removeProperty('border');
    itemEl.style.removeProperty('border-color');
    itemEl.style.removeProperty('border-left');
    itemEl.style.removeProperty('background');
    itemEl.style.removeProperty('box-shadow');
    itemEl.style.removeProperty('transform');
    
    const existingPill = itemEl.querySelector('.account-highlight-pill');
    if (existingPill) existingPill.remove();

    if (accountId || cleanAccountName) {
      // Check matching criteria:
      const matchAccount = accountId && !isNaN(accountId) && itemAccountId === accountId;
      const matchName = cleanAccountName && itemAccountName && (cleanAccountName.includes(itemAccountName) || itemAccountName.includes(cleanAccountName));

      const isMatch = matchAccount || matchName;

      if (isMatch) {
        matchCount++;
        if (!firstMatchedEl) firstMatchedEl = itemEl;

        itemEl.classList.add('account-highlight-active');
        itemEl.style.setProperty('border', `2px solid ${color}`, 'important');
        itemEl.style.setProperty('border-left', `8px solid ${color}`, 'important');
        itemEl.style.setProperty('background', `${color}18`, 'important');
        itemEl.style.setProperty('box-shadow', `0 4px 20px ${color}48`, 'important');
        itemEl.style.setProperty('transform', 'translateX(6px)', 'important');

        const descEl = itemEl.querySelector('.transaction-desc');
        if (descEl) {
          const pill = document.createElement('span');
          pill.className = 'account-highlight-pill';
          pill.style.cssText = `font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: ${color}; color: #ffffff; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px ${color}66; animation: popIn 0.3s ease; cursor: pointer;`;
          pill.innerHTML = `🏦 ${accountName} • Composição do Rendimento ✕`;
          pill.title = 'Clique para desmarcar o destaque';
          pill.onclick = (e) => {
            e.stopPropagation();
            State.highlightAccountId = null;
            State.highlightAccountColor = null;
            State.highlightAccountName = null;
            applyTransactionAccountHighlight();
            toast('Destaque de conta desativado');
          };
          descEl.appendChild(pill);
        }
      } else {
        itemEl.classList.add('card-highlight-dimmed');
      }
    }
  });

  if (accountId && matchCount > 0 && firstMatchedEl) {
    firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`✨ ${matchCount} provento(s) da conta ${accountName} destacado(s)`);
  } else if (accountId && matchCount === 0) {
    toast(`Nenhum provento deste mês encontrado para a conta ${accountName}.`);
  }
}

function renderInvoicesList(container, invoices, accounts) {
  if (!container) return;
  if (!Array.isArray(invoices) || invoices.length === 0) {
    container.innerHTML = '';
    return;
  }

  const mName = MONTHS[State.currentMonth - 1] || '';

  container.innerHTML = `
    <div class="section-title" style="margin-top:16px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
      <span style="font-size:18px">💳</span> Faturas de Cartão de Crédito (${mName} / ${State.currentYear})
    </div>
    <div class="invoices-list" style="display:flex;flex-direction:column;gap:10px">
      ${invoices.map(inv => {
        const b = BANKS[inv.bank] || BANKS.outro;
        const netAmount = inv.amount + (inv.penalty_amount || 0) - (inv.discount_amount || 0);
        const userBadge = inv.user_name ? `<span class="profile-badge" style="background:${inv.user_avatar_color || '#10b981'}22;color:${inv.user_avatar_color || '#10b981'};border:1px solid ${inv.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600">${inv.user_name}</span>` : '';
        const cardAccountId = inv.card_account_id || inv.card_id || inv.account_id;
        const isSelected = (State.highlightCardId && State.highlightCardId === cardAccountId) || (State.highlightInvoiceId && State.highlightInvoiceId === inv.id);
        
        return `
          <div class="invoice-card-item ${isSelected ? 'invoice-card-selected' : ''}" 
               data-card-id="${cardAccountId || ''}" 
               data-invoice-id="${inv.id || ''}" 
               data-bank-color="${b.color}" 
               data-card-name="${inv.card_name}"
               style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:var(--radius-md);background:${isSelected ? b.color + '25' : b.color + '15'};border:1.5px solid ${isSelected ? b.color : b.color + '44'};border-left:6px solid ${b.color};gap:12px;flex-wrap:wrap;cursor:pointer;${isSelected ? 'box-shadow: 0 0 20px ' + b.color + '44, inset 0 0 10px ' + b.color + '22;' : ''}">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
              ${bankLogo(inv.bank, 36)}
              <div>
                <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  💳 FATURA ${inv.card_name.toUpperCase()} (Ref: ${String(inv.month).padStart(2,'0')}/${inv.year})
                  ${userBadge}
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <span>Vence dia ${inv.due_day} • Fecha dia ${inv.closing_day}</span>
                  <span class="invoice-highlight-badge badge" style="background:${isSelected ? b.color : b.color + '25'};color:${isSelected ? '#ffffff' : b.color};border:1px solid ${b.color}66;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:10px;">
                    ${isSelected ? '✨ Parcelas Destacadas abaixo' : '🔍 Ver Parcelas desta Fatura'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style="display:flex;align-items:center;gap:16px">
              <div style="display:flex;flex-direction:column;align-items:flex-end">
                <div style="font-size:16px;font-weight:900;color:#ef4444">
                  -${fmt.currency(netAmount)}
                </div>
                ${inv.is_renegotiated ? `
                  <span class="transaction-status" style="font-size:11px;background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b44">
                    🤝 Renegociada / Parcelada
                  </span>
                ` : inv.is_paid ? `
                  <span class="transaction-status status-paid" style="font-size:11px;background:#10b98122;color:#10b981;border:1px solid #10b98144">
                    ✓ Quitada em ${fmt.date(inv.payment_date)} (${inv.payment_account_name || 'Conta'})
                  </span>
                ` : `
                  <span class="transaction-status status-pending" style="font-size:11px">
                    ⏳ Aberta • Vence em ${fmt.date(inv.due_date)}
                  </span>
                `}
              </div>

              ${!inv.is_paid ? `
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <button class="btn renegotiate-invoice-btn" data-id="${inv.id}" style="background:#f59e0b;border-color:#f59e0b;color:#000;font-weight:700;padding:8px 12px;font-size:12px;border-radius:8px">
                    🤝 Parcelar / Acordo
                  </button>
                  <button class="btn btn-primary pay-invoice-btn" data-id="${inv.id}" style="background:${b.color};border-color:${b.color};font-weight:600;padding:8px 14px;font-size:12px">
                    💳 Pagar Fatura
                  </button>
                </div>
              ` : `
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <button class="btn btn-secondary reopen-invoice-btn" data-id="${inv.id}" style="font-size:12px;padding:8px 12px;border-radius:8px;color:${inv.is_renegotiated ? '#f59e0b' : 'var(--text-primary)'};border:1px solid ${inv.is_renegotiated ? '#f59e0b88' : 'var(--border)'}" title="Reabrir fatura e restaurar lançamentos para edição">
                    ${inv.is_renegotiated ? '↩️ Desfazer Acordo / Reabrir' : '↩️ Desfazer Pagamento'}
                  </button>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind invoice card click to toggle highlight on its installments
  container.querySelectorAll('.invoice-card-item').forEach(cardEl => {
    cardEl.onclick = (e) => {
      // If clicked inside an action button, do nothing
      if (e.target.closest('.pay-invoice-btn, .renegotiate-invoice-btn, .reopen-invoice-btn')) {
        return;
      }
      const cardId = parseInt(cardEl.dataset.cardId);
      const invoiceId = parseInt(cardEl.dataset.invoiceId);
      const cardColor = cardEl.dataset.bankColor;
      const cardName = cardEl.dataset.cardName;
      toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId);
    };
  });

  container.querySelectorAll('.pay-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) openPayInvoiceModal(inv, accounts);
    };
  });

  container.querySelectorAll('.renegotiate-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) openRenegotiateInvoiceModal(inv, accounts);
    };
  });

  container.querySelectorAll('.reopen-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) confirmReopenInvoice(inv);
    };
  });
}


/* ==== planning-main-2.js ==== */
/* ===
 * planning-main-2.js — Parte 2 de planning-main
 * Linhas 2780–3060 do app.js
 */

function confirmReopenInvoice(inv) {
  const isReneg = inv.is_renegotiated === 1;
  const title = isReneg ? `Desfazer Acordo / Reabrir Fatura` : `Desfazer Pagamento da Fatura`;
  const mStr = String(inv.month).padStart(2, '0');

  Modal.open(title, `
    <div style="padding: 16px;">
      <p style="font-size:14px;color:var(--text-primary);margin-bottom:14px;line-height:1.5">
        Tem certeza de que deseja <strong>reabrir a fatura do cartão "${inv.card_name}"</strong> referente ao mês <strong>${mStr}/${inv.year}</strong>?
      </p>
      
      <div style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
        ${isReneg ? `
          <div style="color:#f59e0b;font-weight:700;margin-bottom:6px">⚠️ O que acontecerá ao desfazer o acordo:</div>
          • O status de <strong>Renegociada / Parcelada</strong> desta fatura será cancelado.<br>
          • As compras e lançamentos deste ciclo voltarão para o status <strong>Em Aberto</strong>.<br>
          • O valor total da fatura será <strong>recalculado automaticamente</strong> com base nos lançamentos reais existentes.<br>
          • Se houve entrada paga por conta corrente, o valor será estornado na conta.<br>
          • As parcelas futuras deste acordo específico que não foram pagas serão removidas.
        ` : `
          <div style="color:var(--accent-light);font-weight:700;margin-bottom:6px">⚠️ O que acontecerá ao desfazer a quitação:</div>
          • O pagamento registrado de <strong>R$ ${fmt.currency(inv.amount)}</strong> será cancelado.<br>
          • O saldo da conta utilizada para pagamento será estornado.<br>
          • A fatura e suas compras voltarão para o status <strong>Em Aberto</strong> para você ajustar ou quitar novamente.
        `}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button type="button" class="btn btn-danger" id="btn-confirm-reopen-invoice" style="background:#ef4444;border-color:#ef4444;color:#fff;font-weight:700;padding:8px 16px;border-radius:8px">
          Sim, Reabrir Fatura
        </button>
      </div>
    </div>
  `);

  const confirmBtn = document.getElementById('btn-confirm-reopen-invoice');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = 'Reabrindo...';
      try {
        const activeUserId = (State.user && State.user.id) || (inv && inv.user_id) || 1;
        const res = await window.api.invoices.reopen({
          invoiceId: inv.id,
          userId: activeUserId
        });
        if (res && res.success) {
          Modal.close();
          toast(res.message || 'Fatura reaberta com sucesso!');
          if (typeof renderRecurring === 'function') renderRecurring();
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderTransactions === 'function') renderTransactions();
          if (typeof renderAccounts === 'function') renderAccounts();
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Sim, Reabrir Fatura';
          toast(res ? res.error : 'Erro ao reabrir fatura', 'error');
        }
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Sim, Reabrir Fatura';
        toast('Erro ao reabrir fatura: ' + err.message, 'error');
      }
    };
  }
}

function openRenegotiateInvoiceModal(inv, accounts) {
  const b = BANKS[inv.bank] || BANKS.outro;
  const checkingAccounts = accounts.filter(a => a.type !== 'credit');
  const today = new Date().toISOString().split('T')[0];

  let nextM = inv.month + 1;
  let nextY = inv.year;
  if (nextM > 12) {
    nextM = 1;
    nextY += 1;
  }
  const defaultFirstMonth = `${nextY}-${String(nextM).padStart(2, '0')}`;
  const invAmount = inv.amount;

  Modal.open(`🤝 Renegociar / Parcelar Fatura: ${inv.card_name}`, `
    <div style="padding: 16px;">
      <!-- Invoice Summary Header -->
      <div style="padding:14px;border-radius:var(--radius-sm);background:#f59e0b15;border:1px solid #f59e0b44;border-left:5px solid #f59e0b;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">Fatura em Aberto (Ref: ${String(inv.month).padStart(2,'0')}/${inv.year})</div>
            <div style="font-size:22px;font-weight:900;color:#ef4444;margin-top:2px">${fmt.currency(invAmount)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Cartão: ${inv.card_name} • Titular: ${inv.user_name}</div>
          </div>
          <span style="font-size:32px">🤝</span>
        </div>
      </div>

      <!-- Down Payment Section -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Valor da Entrada à Vista (R$)</label>
          <input type="number" step="0.01" min="0" max="${invAmount}" id="reneg-down-payment" placeholder="0,00" value="0" style="font-weight:700">
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Pagamento da Entrada</label>
          <input type="date" id="reneg-down-date" value="${today}">
        </div>
      </div>

      <div class="form-group" id="group-down-account" style="margin-bottom: 14px; display: none;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Conta Corrente Pagadora da Entrada</label>
        <select id="reneg-down-account" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-raised);color:var(--text-primary)">
          ${checkingAccounts.map(a => `<option value="${a.id}">${a.name} (Saldo: ${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>

      <!-- Installments Configuration -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Número de Parcelas do Acordo</label>
          <select id="reneg-count" style="font-weight:700">
            ${[2,3,4,5,6,7,8,9,10,11,12,15,18,24,36].map(n => `<option value="${n}" ${n === 6 ? 'selected' : ''}>${n} vezes (${n}x)</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Mês da 1ª Parcela</label>
          <input type="month" id="reneg-first-month" value="${defaultFirstMonth}">
        </div>
      </div>

      <!-- Value / Interest Calculation Mode -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Valor de Cada Parcela (R$)</label>
          <input type="number" step="0.01" min="0" id="reneg-installment-amount" placeholder="0,00" style="font-weight:900;font-size:16px;color:#f59e0b">
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Taxa de Juros Mensal (% a.m.)</label>
          <input type="number" step="0.01" min="0" id="reneg-interest-rate" placeholder="0,00" value="0">
        </div>
      </div>

      <!-- Live Simulation Summary Box -->
      <div id="reneg-simulation-box" style="padding:14px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px dashed var(--border);margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">📊 Resumo do Acordo</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;font-size:12px">
          <div>
            <div style="color:var(--text-muted)">Saldo Financiado:</div>
            <div id="sim-financed" style="font-weight:700;color:var(--text-primary)">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Total das Parcelas:</div>
            <div id="sim-total-installments" style="font-weight:700;color:var(--text-primary)">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Juros do Acordo:</div>
            <div id="sim-interest" style="font-weight:700;color:#ef4444">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Total do Acordo:</div>
            <div id="sim-grand-total" style="font-weight:900;color:#f59e0b">R$ 0,00</div>
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Observação / Detalhes do Acordo (Opcional)</label>
        <input type="text" id="reneg-notes" placeholder="Ex: Acordo realizado pelo app do banco...">
      </div>

      <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;text-align:center">
        🔒 <em>A fatura antiga será marcada como quitada pelo acordo, a entrada (se informada) sairá da conta corrente e o parcelamento ficará no cartão comprometendo o limite mês a mês.</em>
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="reneg-cancel">Cancelar</button>
        <button class="btn" id="reneg-confirm" style="background: #f59e0b; border-color: #f59e0b; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 8px">
          🤝 Confirmar e Lançar Parcelamento
        </button>
      </div>
    </div>
  `);

  const downInput = document.getElementById('reneg-down-payment');
  const countSelect = document.getElementById('reneg-count');
  const installmentInput = document.getElementById('reneg-installment-amount');
  const interestInput = document.getElementById('reneg-interest-rate');
  const groupDownAccount = document.getElementById('group-down-account');

  const updateSimulation = (source = 'auto') => {
    const down = parseFloat(downInput.value) || 0;
    groupDownAccount.style.display = down > 0 ? 'block' : 'none';

    const count = parseInt(countSelect.value, 10) || 6;
    const financed = Math.max(0, invAmount - down);

    if (source === 'interest' || source === 'auto' || source === 'down' || source === 'count') {
      const rateMonthly = (parseFloat(interestInput.value) || 0) / 100;
      let calculatedInstallment = 0;
      if (rateMonthly > 0) {
        // PMT = PV * ( i * (1+i)^n ) / ((1+i)^n - 1)
        calculatedInstallment = financed * (rateMonthly * Math.pow(1 + rateMonthly, count)) / (Math.pow(1 + rateMonthly, count) - 1);
      } else {
        calculatedInstallment = financed / count;
      }
      installmentInput.value = calculatedInstallment > 0 ? calculatedInstallment.toFixed(2) : '';
    }

    const currentInstallment = parseFloat(installmentInput.value) || 0;
    const totalInstallments = currentInstallment * count;
    const grandTotal = down + totalInstallments;
    const interestTotal = Math.max(0, grandTotal - invAmount);

    document.getElementById('sim-financed').textContent = fmt.currency(financed);
    document.getElementById('sim-total-installments').textContent = fmt.currency(totalInstallments);
    document.getElementById('sim-interest').textContent = fmt.currency(interestTotal);
    document.getElementById('sim-grand-total').textContent = fmt.currency(grandTotal);
  };

  downInput.oninput = () => updateSimulation('down');
  countSelect.onchange = () => updateSimulation('count');
  interestInput.oninput = () => updateSimulation('interest');
  installmentInput.oninput = () => updateSimulation('manual');

  // Initial calculation
  updateSimulation('auto');

  document.getElementById('reneg-cancel').onclick = Modal.close;
  document.getElementById('reneg-confirm').onclick = async () => {
    const downPayment = parseFloat(downInput.value) || 0;
    const downPaymentDate = document.getElementById('reneg-down-date').value;
    const downPaymentAccountId = downPayment > 0 ? parseInt(document.getElementById('reneg-down-account').value, 10) : null;
    const installmentsCount = parseInt(countSelect.value, 10);
    const installmentAmount = parseFloat(installmentInput.value) || 0;
    const firstInstallmentMonth = document.getElementById('reneg-first-month').value;
    const notes = (document.getElementById('reneg-notes').value || '').trim();

    if (downPayment > 0 && (!downPaymentAccountId || isNaN(downPaymentAccountId))) {
      toast('Selecione a conta corrente de onde saiu o pagamento da entrada', 'error');
      return;
    }
    if (!installmentsCount || installmentsCount < 2) {
      toast('Informe um número válido de parcelas (mínimo 2x)', 'error');
      return;
    }
    if (!installmentAmount || installmentAmount <= 0) {
      toast('Informe o valor de cada parcela', 'error');
      return;
    }
    if (!firstInstallmentMonth) {
      toast('Informe o mês da 1ª parcela', 'error');
      return;
    }

    try {
      const res = await window.api.invoices.renegotiate({
        invoiceId: inv.id,
        downPayment,
        downPaymentAccountId,
        downPaymentDate,
        installmentsCount,
        installmentAmount,
        firstInstallmentMonth,
        notes,
        userId: State.user.id
      });

      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }

      toast(`Acordo da fatura "${inv.card_name}" registrado com sucesso em ${installmentsCount}x!`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao registrar acordo: ' + err.message, 'error');
    }
  };
}


/* ==== recurring-modal.js ==== */
/* ===
 * recurring-modal.js — L3061–3601 do app.js
 */

function openPayInvoiceModal(inv, accounts) {
  const b = BANKS[inv.bank] || BANKS.outro;
  const checkingAccounts = accounts.filter(a => a.type !== 'credit');
  const today = new Date().toISOString().split('T')[0];

  Modal.open(`Quitar Fatura: ${inv.card_name} (Ref: ${String(inv.month).padStart(2,'0')}/${inv.year})`, `
    <div style="padding: 16px;">
      <div style="padding:12px;border-radius:var(--radius-sm);background:${b.color}15;border:1px solid ${b.color}44;margin-bottom:16px;text-align:center">
        <div style="font-size:12px;color:var(--text-muted)">Valor Bruto da Fatura</div>
        <div style="font-size:22px;font-weight:900;color:var(--text-primary);margin-top:2px">${fmt.currency(inv.amount)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Titular: ${inv.user_name} • Vencimento: ${fmt.date(inv.due_date)}</div>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Conta Corrente Pagadora (Saída do Dinheiro)</label>
        <select id="pay-inv-account" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-raised);color:var(--text-primary)">
          ${checkingAccounts.map(a => `<option value="${a.id}">${a.name} (Saldo: ${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Efetivo Pagamento</label>
        <input type="date" id="pay-inv-date" value="${today}" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 600;">
      </div>

      <div class="form-row" style="margin-bottom: 16px;">
        <div class="form-group">
          <label style="font-size:11px;color:var(--text-muted)">Juros / Multa por Atraso (R$)</label>
          <input type="number" step="0.01" min="0" id="pay-inv-penalty" placeholder="0,00">
        </div>
        <div class="form-group">
          <label style="font-size:11px;color:var(--text-muted)">Desconto Obtido (R$)</label>
          <input type="number" step="0.01" min="0" id="pay-inv-discount" placeholder="0,00">
        </div>
      </div>

      <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;text-align:center">
        🔒 <em>O valor total da fatura será debitado da conta corrente selecionada e todas as compras do cartão deste ciclo serão marcadas como quitadas em lote.</em>
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="pay-inv-cancel">Cancelar</button>
        <button class="btn btn-primary" id="pay-inv-confirm" style="background: ${b.color}; border-color: ${b.color}; font-weight: 600;">
          Confirmar Quitação da Fatura
        </button>
      </div>
    </div>
  `);

  document.getElementById('pay-inv-cancel').onclick = Modal.close;
  document.getElementById('pay-inv-confirm').onclick = async () => {
    const paymentAccountId = parseInt(document.getElementById('pay-inv-account').value);
    const paymentDate = document.getElementById('pay-inv-date').value;
    const penaltyAmount = parseFloat(document.getElementById('pay-inv-penalty').value) || 0;
    const discountAmount = parseFloat(document.getElementById('pay-inv-discount').value) || 0;

    if (!paymentAccountId || isNaN(paymentAccountId)) {
      toast('Selecione uma conta corrente para pagamento', 'error');
      return;
    }
    if (!paymentDate) {
      toast('Informe a data de pagamento', 'error');
      return;
    }

    try {
      const res = await window.api.invoices.pay({
        invoiceId: inv.id,
        paymentAccountId,
        paymentDate,
        penaltyAmount,
        discountAmount,
        userId: State.user.id
      });

      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }

      toast(`Fatura do cartão "${inv.card_name}" quitada com sucesso! Limite liberado.`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao quitar fatura: ' + err.message, 'error');
    }
  };
}

async function loadAvulsos(container, accounts, categories, tabType) {
  let txs = await window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true });
  txs = txs.filter(t => t.type === tabType);
  renderAvulsosList(container, txs, accounts, categories, tabType);
}

function attachRealtimeDuplicateChecker({ amountInput, dateInput, descInput, accountSelect, typeGetter, excludeId = null, containerEl }) {
  if (!amountInput || !dateInput || !containerEl) return () => {};

  let debounceTimer = null;

  const runCheck = async () => {
    const amount = parseFloat(amountInput.value) || 0;
    const date = typeof dateInput.value === 'string' ? dateInput.value : (dateInput.value || '');
    const description = (descInput?.value || '').trim();
    const accountId = parseInt(accountSelect?.value, 10) || null;
    const type = typeof typeGetter === 'function' ? typeGetter() : typeGetter || 'expense';

    if (amount <= 0 || !date || description.length < 2) {
      containerEl.style.display = 'none';
      containerEl.innerHTML = '';
      return;
    }

    try {
      const familyId = State.user?.family_id || State.user?.familyId || 1;
      const res = await window.api.sync.checkCandidate({
        familyId,
        amount,
        date,
        description,
        accountId,
        type,
        userId: State.user?.id || null,
        excludeId
      });

      if (res && res.hasDuplicate && res.candidate) {
        const cand = res.candidate;
        const color = res.score >= 90 ? '#ef4444' : '#f59e0b';
        const isIncome = type === 'income';
        const badgeText = res.score >= 95 
          ? (isIncome ? '🚨 Duplicata de Receita Quase Certa' : '🚨 Duplicata Quase Certa')
          : (res.score >= 80 
              ? (isIncome ? '⚠️ Receita Similar Encontrada' : '⚠️ Alta Similaridade')
              : (isIncome ? '🔍 Receita Parecida' : '🔍 Lançamento Parecido'));

        containerEl.style.display = 'block';
        containerEl.style.border = `1.5px solid ${color}`;
        containerEl.style.background = `${color}18`;
        containerEl.innerHTML = `
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
            <div>
              <div style="font-weight:700; color:${color}; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                <span>${badgeText} (${res.score}%)</span>
              </div>
              <div style="line-height:1.5; color:var(--text-secondary); font-size:12px;">
                Atenção: Já existe ${isIncome ? 'uma receita' : 'um lançamento'} similar de <strong>${cand.user_name || 'um familiar'}</strong> em <strong>${fmt.date(cand.date)}</strong> na conta <strong>${cand.account_name || 'Não informada'}</strong> no valor de <strong style="color:var(--text-primary)">${fmt.currency(cand.amount)}</strong> (<em>${cand.description || 'Sem descrição'}</em>).
              </div>
            </div>
            <button type="button" class="btn btn-sm" id="btn-dismiss-modal-dup" style="padding:2px 8px; font-size:11px; border-radius:6px; border:1px solid ${color}66; color:var(--text-muted); background:transparent; cursor:pointer;" title="Ignorar aviso">
              ✕
            </button>
          </div>
        `;

        const dismissBtn = containerEl.querySelector('#btn-dismiss-modal-dup');
        if (dismissBtn) {
          dismissBtn.onclick = () => {
            containerEl.style.display = 'none';
          };
        }
      } else {
        containerEl.style.display = 'none';
        containerEl.innerHTML = '';
      }
    } catch (e) {
      console.warn('Erro ao verificar duplicata candidata:', e);
    }
  };

  const scheduleCheck = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runCheck, 300);
  };

  amountInput.addEventListener('input', scheduleCheck);
  dateInput.addEventListener('change', scheduleCheck);
  if (descInput) descInput.addEventListener('input', scheduleCheck);
  if (accountSelect) accountSelect.addEventListener('change', scheduleCheck);

  return scheduleCheck;
}

function openRecurringModal(item, accounts, categories, type) {
  const isEdit = !!item;
  if (isEdit) {
    const canEdit = State.permissions.can_edit_all === 1 || item.user_id === State.user.id;
    if (!canEdit) {
      toast('Você não tem permissão para editar este item', 'error');
      return;
    }
  }
  const filteredCats = categories.filter(c => c.type === type || c.type === 'both');
  const days = Array.from({length:31}, (_,i) => i+1);

  const defaultStartMonth = `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}`;
  let startMonthVal = defaultStartMonth;
  if (isEdit && item.created_at) {
    startMonthVal = item.created_at.slice(0, 7);
  }
  let competenceMonthVal = startMonthVal;
  if (isEdit && item.competence_offset !== undefined && item.competence_offset !== null) {
    const [sy, sm] = startMonthVal.split('-').map(Number);
    let compMonth = sm + item.competence_offset;
    let compYear = sy + Math.floor((compMonth - 1) / 12);
    compMonth = ((compMonth - 1) % 12 + 12) % 12 + 1;
    competenceMonthVal = `${compYear}-${String(compMonth).padStart(2, '0')}`;
  }

  Modal.open(isEdit ? 'Editar Item Recorrente' : `Nova ${type === 'income' ? 'Receita' : 'Despesa'} Fixa`, `
    <div id="rec-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    <div class="form-group">
      <label>Nome</label>
      <input type="text" id="rec-name" placeholder="${type === 'income' ? 'Ex: Salário, Freelance...' : 'Ex: Aluguel, Netflix, Luz...'}" value="${item?.name || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="number" id="rec-amount" step="0.01" min="0" placeholder="0,00" value="${item?.amount || ''}">
      </div>
      <div class="form-group">
        <label>Todo dia</label>
        <select id="rec-due-day">
          ${days.map(d => `<option value="${d}" ${(item?.due_day ?? 1) === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Categoria</label>
        <select id="rec-category">
          <option value="">Sem categoria</option>
          ${filteredCats.map(c => `<option value="${c.id}" ${item?.category_id === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Conta / Cartão</label>
        <select id="rec-account">
          <option value="">Selecione...</option>
          ${accounts.map(a => `<option value="${a.id}" ${item?.account_id === a.id ? 'selected' : ''}>${a.name} (${ACCOUNT_TYPES[a.type]})</option>`).join('')}
        </select>
      </div>
    </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label title="Mês em que a primeira cobrança/lançamento será gerada">📅 Mês de Vencimento <span style="font-size:11px;opacity:0.65;font-weight:400">(1ª ocorrência)</span></label>
        <input type="month" id="rec-start-month" value="${startMonthVal}" title="Mês e ano em que este item começa a ser cobrado/gerado">
      </div>
      <div class="form-group">
        <label title="Mês ao qual este item se refere — ex: conta de luz de março, paga em abril">📋 Mês de Referência <span style="font-size:11px;opacity:0.65;font-weight:400">(competência)</span></label>
        <input type="month" id="rec-competence-month" value="${competenceMonthVal}" title="Mês de consumo/competência a que este item se refere. Pode ser diferente do mês de vencimento.">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex:1">
        <label>Repetir por quantos meses? <span style="font-size:11px;opacity:0.65;font-weight:400">(0 ou vazio = indefinido)</span></label>
        <input type="number" id="rec-repeat-months" min="0" placeholder="Repetir indefinidamente" value="${item?.repeat_months || ''}">
      </div>
    </div>
    <div class="form-row" id="row-start-installment" style="display: ${item?.repeat_months > 0 ? 'flex' : 'none'};">
      <div class="form-group">
        <label>Esta é qual parcela no mês de início? (Padrão: 1)</label>
        <input type="number" id="rec-start-installment" min="1" placeholder="Ex: se já pagou 4 parcelas, coloque 5" value="${item?.start_installment || 1}">
      </div>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="rec-priority" ${item?.is_priority ? 'checked' : ''}> ⭐ Marcar como prioritário (destaque no dashboard)</label>
    </div>
    ${!isEdit ? `
    <div class="form-group">
      <label><input type="checkbox" id="rec-paid"> ${type === 'income' ? '💰 Já foi recebida este mês' : '💸 Já foi paga este mês'}</label>
    </div>
    ` : ''}
    <div class="form-group">
      <label>Observação (opcional)</label>
      <input type="text" id="rec-notes" placeholder="Anotação sobre este item..." value="${item?.notes || ''}">
    </div>
    <div class="form-group">
      <label>Ícone</label>
      <div class="icon-picker" id="rec-icon-picker">
        ${(type === 'income' ? ICONS_INCOME : ICONS_EXPENSE).map(ic =>
          `<button class="icon-btn ${(item?.icon || (type === 'income' ? '💰' : '📋')) === ic ? 'selected' : ''}" data-icon="${ic}">${ic}</button>`
        ).join('')}
      </div>
    </div>
    <div class="form-group">
      <label>Cor</label>
      <div class="color-picker" id="rec-color-picker">
        ${COLORS.map(c => `<div class="color-swatch ${(item?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="rec-cancel">Cancelar</button>
      <button class="btn btn-primary" id="rec-save">${isEdit ? 'Salvar' : 'Adicionar'}</button>
    </div>
  `);

  let icon = item?.icon || (type === 'income' ? '💰' : '📋');
  let color = item?.color || '#10b981';

  document.querySelectorAll('#rec-icon-picker .icon-btn').forEach(btn => {
    btn.onclick = () => { document.querySelectorAll('#rec-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; };
  });
  document.querySelectorAll('#rec-color-picker .color-swatch').forEach(sw => {
    sw.onclick = () => { document.querySelectorAll('#rec-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); color = sw.dataset.color; };
  });

  const repeatMonthsInput = document.getElementById('rec-repeat-months');
  const startInstallmentRow = document.getElementById('row-start-installment');
  if (repeatMonthsInput && startInstallmentRow) {
    repeatMonthsInput.oninput = () => {
      const val = parseInt(repeatMonthsInput.value) || 0;
      startInstallmentRow.style.display = val > 0 ? 'flex' : 'none';
    };
  }

  const startMonthInput = document.getElementById('rec-start-month');
  const compMonthInput = document.getElementById('rec-competence-month');
  let compManuallyChanged = isEdit && item?.competence_offset !== 0 && item?.competence_offset !== undefined;
  if (compMonthInput) {
    compMonthInput.onchange = () => { compManuallyChanged = true; };
    if (startMonthInput) {
      startMonthInput.onchange = () => {
        if (!compManuallyChanged && startMonthInput.value) {
          compMonthInput.value = startMonthInput.value;
        }
      };
    }
  }

  // Realtime Candidate Duplicate Checker
  attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('rec-amount'),
    dateInput: {
      get value() {
        const m = document.getElementById('rec-start-month')?.value || defaultStartMonth;
        const d = String(document.getElementById('rec-due-day')?.value || 1).padStart(2, '0');
        return `${m}-${d}`;
      },
      addEventListener(evt, fn) {
        document.getElementById('rec-start-month')?.addEventListener(evt, fn);
        document.getElementById('rec-due-day')?.addEventListener(evt, fn);
      }
    },
    descInput: document.getElementById('rec-name'),
    accountSelect: document.getElementById('rec-account'),
    typeGetter: () => type,
    excludeId: item?.id,
    containerEl: document.getElementById('rec-dup-warning')
  });

  document.getElementById('rec-cancel').onclick = Modal.close;
  document.getElementById('rec-save').onclick = async () => {
    try {
      const name = document.getElementById('rec-name').value.trim();
      const amount = parseFloat(document.getElementById('rec-amount').value);
      const account_id = parseInt(document.getElementById('rec-account').value) || null;
      if (!name) { toast('Informe o nome', 'error'); return; }
      if (!amount || amount <= 0) { toast('Informe um valor', 'error'); return; }
      if (!account_id) { toast('Selecione uma conta', 'error'); return; }

      const startMonth = document.getElementById('rec-start-month').value;
      const competenceMonth = document.getElementById('rec-competence-month')?.value || startMonth;
      const created_at = startMonth ? `${startMonth}-01 00:00:00` : null;

      let competence_offset = 0;
      if (startMonth && competenceMonth) {
        const [sy, sm] = startMonth.split('-').map(Number);
        const [cy, cm] = competenceMonth.split('-').map(Number);
        competence_offset = (cy - sy) * 12 + (cm - sm);
      }

      // Build notes with competence info if different from start month
      let notesVal = document.getElementById('rec-notes').value;
      if (competenceMonth && competenceMonth !== startMonth && !notesVal.includes('Ref.:')) {
        const [cy, cm] = competenceMonth.split('-');
        const mNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const compLabel = `${mNames[parseInt(cm,10)-1]}/${cy}`;
        notesVal = notesVal ? `${notesVal} | Ref.: ${compLabel}` : `Ref.: ${compLabel}`;
      }

      const data = {
        user_id: State.user.id, name, type, amount,
        category_id: parseInt(document.getElementById('rec-category').value) || null,
        account_id,
        due_day: parseInt(document.getElementById('rec-due-day').value),
        is_priority: document.getElementById('rec-priority').checked ? 1 : 0,
        icon, color,
        notes: notesVal,
        repeat_months: parseInt(document.getElementById('rec-repeat-months').value) || 0,
        start_installment: parseInt(document.getElementById('rec-start-installment').value) || 1,
        competence_offset,
        created_at
      };
      if (!isEdit) {
        data.is_paid = document.getElementById('rec-paid').checked ? 1 : 0;
      }
      if (isEdit) {
        data.id = item.id;
        const res = await window.api.recurring.update(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        toast('Item atualizado');
      } else {
        const res = await window.api.recurring.create(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        toast('Item adicionado! Gerado para este mês.');
      }
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao salvar item recorrente: ' + err.message, 'error');
    }
  };
}

function fmtCompetence(compStr) {
  if (!compStr) return '';
  const parts = compStr.split('-');
  if (parts.length >= 2) {
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const mNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mNames[m - 1]}/${y}`;
  }
  return compStr;
}

function openEditMonthTransactionModal(tx, item, accounts, categories, type) {
  const dateVal = tx.date ? tx.date.split(' ')[0] : new Date().toISOString().split('T')[0];
  const amountVal = tx.amount || item.amount;
  const descVal = tx.description || item.name;
  const accountVal = tx.account_id || item.account_id || (accounts[0]?.id || '');
  const categoryVal = tx.category_id || item.category_id || '';
  
  const defaultComp = tx.competence_date ? tx.competence_date.slice(0,7) : `${State.currentYear}-${String(State.currentMonth).padStart(2,'0')}`;

  Modal.open(`Editar Lançamento do Mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})`, `
    <div id="mod-tx-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor deste Mês (R$)</label>
        <input type="number" id="mod-tx-amount" step="0.01" min="0" placeholder="0,00" value="${amountVal}">
      </div>
      <div class="form-group">
        <label>Data de Vencimento</label>
        <input type="date" id="mod-tx-date" value="${dateVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="mod-tx-desc" placeholder="Descrição" value="${descVal}">
      </div>
      <div class="form-group">
        <label>Mês de Referência / Consumo</label>
        <input type="month" id="mod-tx-competence" value="${defaultComp}" title="Selecione o mês/ano de consumo a que se refere esta fatura">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Conta / Cartão</label>
        <select id="mod-tx-account">
          <option value="">Selecione...</option>
          ${accounts.map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="mod-tx-category">
          <option value="">Sem Categoria</option>
          ${categories.filter(c => c.type === type || c.type === 'both').map(c => `<option value="${c.id}" ${c.id == categoryVal ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text-muted);margin-top:8px;margin-bottom:16px;">
      🔒 <em>Esta alteração afeta <strong>exclusivamente a parcela deste mês</strong>. O mês de consumo (referência) fica discriminado junto do vencimento.</em>
    </p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="mod-tx-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mod-tx-save">Salvar este Mês</button>
    </div>
  `);

  attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('mod-tx-amount'),
    dateInput: document.getElementById('mod-tx-date'),
    descInput: document.getElementById('mod-tx-desc'),
    accountSelect: document.getElementById('mod-tx-account'),
    typeGetter: () => type,
    excludeId: tx?.id,
    containerEl: document.getElementById('mod-tx-dup-warning')
  });

  document.getElementById('mod-tx-cancel').onclick = Modal.close;

  document.getElementById('mod-tx-save').onclick = async () => {
    const amount = parseFloat(document.getElementById('mod-tx-amount').value);
    const date = document.getElementById('mod-tx-date').value;
    const description = document.getElementById('mod-tx-desc').value.trim();
    const competence_date = document.getElementById('mod-tx-competence').value;
    const account_id = parseInt(document.getElementById('mod-tx-account').value);
    const category_id = parseInt(document.getElementById('mod-tx-category').value) || null;

    if (!amount || isNaN(amount) || amount <= 0) {
      toast('Informe um valor válido', 'error');
      return;
    }
    if (!description) {
      toast('Informe a descrição', 'error');
      return;
    }

    try {
      const res = await window.api.transactions.update({
        id: tx.id,
        user_id: tx.user_id,
        account_id,
        category_id,
        type: tx.type,
        amount,
        description,
        date,
        competence_date,
        is_paid: tx.is_paid,
        notes: tx.notes
      });
      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }
      toast(`Lançamento do mês atualizado com sucesso!`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar lançamento do mês: ' + err.message, 'error');
    }
  };
}


/* ==== avulso-modal.js ==== */
/* ===
 * avulso-modal.js — L3602–3851 do app.js
 */

async function showDidacticFeedback(data) {
  if (State.permissions.can_edit_all === 1) {
    toast(data.id ? 'Lançamento atualizado' : 'Lançamento adicionado', 'success');
    return;
  }
  if (data.type === 'income') {
    toast('⭐ Excelente! Você adicionou um recebível e está colaborando com o orçamento!', 'success');
    return;
  }
  if (data.type === 'expense') {
    try {
      const parts = data.date.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const budgets = await window.api.budgets.getAll({ userId: State.user.id, month, year });
      const b = budgets.find(x => x.category_id === data.category_id);
      
      if (b) {
        const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
        if (b.spent > b.amount) {
          const exceeded = b.spent - b.amount;
          toast(`⚠️ Limite Excedido por R$ ${exceeded.toFixed(2)}! Mas registramos. Coopere e planeje com seus pais!`, 'warning');
        } else if (pct >= 80) {
          toast(`⚡ Quase no teto! Você consumiu ${pct.toFixed(0)}% do limite proposto para ${b.category_name}.`, 'warning');
        } else {
          const available = b.amount - b.spent;
          toast(`✅ Lançamento registrado! Você ainda tem R$ ${available.toFixed(2)} propostos para ${b.category_name}.`, 'success');
        }
      } else {
        toast('Lançamento adicionado! Bom trabalho gerenciando seu dinheiro.', 'success');
      }
    } catch (err) {
      console.error('Error showing didactic feedback:', err);
      toast('Lançamento adicionado', 'success');
    }
  } else {
    toast('Lançamento adicionado', 'success');
  }
}

function openAvulsoModal(accounts, categories, tx = null, defaultType = 'expense', prefillData = null) {
  const isEdit = !!tx;
  if (isEdit) {
    const canEdit = (State.user.profile_type === 1 || State.user.profile_type === 2) || (State.permissions && State.permissions.can_edit_all === 1) || (!tx.user_id || tx.user_id === State.user.id);
    if (!canEdit) {
      toast('Você não tem permissão para editar este lançamento', 'error');
      return;
    }
  }
  const today = new Date().toISOString().split('T')[0];
  const dateVal = isEdit && tx.date ? tx.date.split(' ')[0] : (prefillData && prefillData.date ? prefillData.date : today);
  const amountVal = isEdit ? tx.amount : (prefillData && prefillData.amount ? prefillData.amount : '');
  const descVal = isEdit ? tx.description : (prefillData && prefillData.description ? prefillData.description : '');
  const accountVal = isEdit ? tx.account_id : (accounts[0]?.id || '');
  
  let categoryVal = isEdit ? (tx.category_id || '') : '';
  if (!categoryVal && prefillData && prefillData.suggestedCategory) {
    const matchedCat = categories.find(c => c.name.toLowerCase().includes(prefillData.suggestedCategory.toLowerCase()) || prefillData.suggestedCategory.toLowerCase().includes(c.name.toLowerCase()));
    if (matchedCat) categoryVal = matchedCat.id;
  }

  const typeVal = isEdit ? tx.type : (prefillData && prefillData.type ? prefillData.type : defaultType);
  const paidChecked = isEdit ? (tx.is_paid ? 'checked' : '') : 'checked';
  const competenceVal = isEdit && tx.competence_date ? tx.competence_date.slice(0,7) : (prefillData && prefillData.competence ? prefillData.competence : (dateVal ? dateVal.slice(0,7) : ''));

  Modal.open(isEdit ? 'Editar Lançamento Avulso' : 'Novo Lançamento Avulso', `
    <div id="avl-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    
    ${!isEdit ? `
      <div style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary btn-sm" id="avl-btn-scan-qr" style="font-size: 11.5px; display: inline-flex; align-items: center; gap: 6px; border-color: var(--accent); color: var(--accent-light); background: rgba(16,185,129,0.08); padding: 5px 12px; border-radius: 20px; cursor: pointer;">
          <span>📷</span> Escanear Nota Fiscal (QR Code)
        </button>
      </div>
    ` : ''}

    <div class="type-toggle" id="avl-type-toggle">
      <button data-type="expense" class="${typeVal === 'expense' ? 'active-expense' : ''}">💸 Despesa</button>
      <button data-type="income" class="${typeVal === 'income' ? 'active-income' : ''}">💰 Receita</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="number" id="avl-amount" step="0.01" min="0" placeholder="0,00" value="${amountVal}">
      </div>
      <div class="form-group">
        <label title="Data de vencimento ou pagamento deste lançamento">📅 Mês de Vencimento <span style="font-size:11px;opacity:0.65;font-weight:400">(data)</span></label>
        <input type="date" id="avl-date" value="${dateVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label title="Mês ao qual este gasto se refere — ex: conta de luz consumida em março, paga em abril">📋 Mês de Referência <span style="font-size:11px;opacity:0.65;font-weight:400">(competência)</span></label>
        <input type="month" id="avl-competence" value="${competenceVal}" title="Mês de consumo/competência. Pode ser anterior ao mês de vencimento.">
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="avl-desc" placeholder="Ex: Compra no mercado, Presente..." value="${descVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Conta</label>
        <select id="avl-account">
          <option value="">Selecione...</option>
          ${accounts.map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="avl-category">
          <!-- Preenchido dinamicamente -->
        </select>
      </div>
    </div>
    
    <div class="form-row" id="group-credit-product-row">
      <div class="form-group">
        <label style="font-size:12px; font-weight:600;">Recurso / Produto da Conta</label>
        <select id="avl-credit-product">
          <option value="normal" ${(!tx || tx.credit_product === 'normal' || !tx.credit_product) ? 'selected' : ''}>💵 Saldo Normal (À Vista)</option>
          <option value="banricompras" ${(tx && tx.credit_product === 'banricompras') ? 'selected' : ''}>🛍️ Banricompras (Débito Agendado / Pré-datado)</option>
          <option value="credito_minuto" ${(tx && tx.credit_product === 'credito_minuto') ? 'selected' : ''}>⚡ Crédito Minuto (Empréstimo)</option>
        </select>
      </div>
      <div class="form-group" id="group-due-date" style="${(tx && tx.credit_product === 'banricompras') ? '' : 'display:none'}">
        <label style="font-size:12px; font-weight:600; color:#fbbf24;">Data do Débito (Banricompras)</label>
        <input type="date" id="avl-due-date" value="${(tx && tx.due_date) ? tx.due_date : ''}">
      </div>
    </div>

    <div class="form-group">
      <label><input type="checkbox" id="avl-paid" ${paidChecked}> Já foi pago/recebido</label>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="avl-cancel">Cancelar</button>
      <button class="btn btn-primary" id="avl-save">${isEdit ? 'Salvar' : 'Adicionar'}</button>
    </div>
  `);

  let currentType = typeVal;

  const updateAvulsoCategories = (type) => {
    const select = document.getElementById('avl-category');
    if (!select) return;
    const currentVal = select.value || categoryVal;
    const filtered = categories.filter(c => c.type === type || c.type === 'both');
    
    let html = '<option value="">Sem categoria</option>';
    html += filtered.map(c => `<option value="${c.id}" ${String(c.id) === String(currentVal) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
    select.innerHTML = html;
  };

  // Carregar categorias correspondentes ao tipo inicial
  updateAvulsoCategories(typeVal);

  const creditProductSelect = document.getElementById('avl-credit-product');
  const groupDueDate = document.getElementById('group-due-date');
  const dateInput = document.getElementById('avl-date');
  const dueDateInput = document.getElementById('avl-due-date');
  const paidCheckbox = document.getElementById('avl-paid');
  const competenceInput = document.getElementById('avl-competence');

  // Realtime Candidate Duplicate Checker
  const recheckDup = attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('avl-amount'),
    dateInput: document.getElementById('avl-date'),
    descInput: document.getElementById('avl-desc'),
    accountSelect: document.getElementById('avl-account'),
    typeGetter: () => currentType,
    excludeId: tx?.id,
    containerEl: document.getElementById('avl-dup-warning')
  });

  // Auto-sync Mês de Referência with date when user changes date (only if competence wasn't manually edited)
  let competenceManuallyChanged = isEdit && !!tx.competence_date;
  if (competenceInput) {
    competenceInput.onchange = () => { competenceManuallyChanged = true; };
    if (dateInput) {
      dateInput.onchange = () => {
        if (!competenceManuallyChanged && dateInput.value) {
          competenceInput.value = dateInput.value.slice(0, 7);
        }
      };
    }
  }

  if (creditProductSelect) {
    creditProductSelect.onchange = () => {
      const isBanri = creditProductSelect.value === 'banricompras';
      groupDueDate.style.display = isBanri ? '' : 'none';
      if (isBanri) {
        paidCheckbox.checked = false;
        if (!dueDateInput.value && dateInput.value) {
          const d = new Date(dateInput.value);
          d.setDate(d.getDate() + 30);
          dueDateInput.value = d.toISOString().split('T')[0];
        }
      }
    };
  }

  document.querySelectorAll('#avl-type-toggle button').forEach(btn => {
    btn.onclick = () => {
      currentType = btn.dataset.type;
      document.querySelectorAll('#avl-type-toggle button').forEach(b => b.className = '');
      btn.className = currentType === 'income' ? 'active-income' : 'active-expense';
      updateAvulsoCategories(currentType);
      if (typeof recheckDup === 'function') recheckDup();
    };
  });

  const scanQrBtn = document.getElementById('avl-btn-scan-qr');
  if (scanQrBtn) {
    scanQrBtn.onclick = () => {
      Modal.close();
      if (typeof openNFCeScannerModal === 'function') {
        openNFCeScannerModal();
      }
    };
  }

  document.getElementById('avl-cancel').onclick = Modal.close;
  document.getElementById('avl-save').onclick = async () => {
    try {
      const amount = parseFloat(document.getElementById('avl-amount').value);
      const date = document.getElementById('avl-date').value;
      const account_id = parseInt(document.getElementById('avl-account').value);
      const credit_product = document.getElementById('avl-credit-product')?.value || 'normal';
      const due_date = credit_product === 'banricompras' ? document.getElementById('avl-due-date')?.value : null;

      if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
      if (!date) { toast('Informe a data', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione uma conta', 'error'); return; }
      
      const competenceMonthVal = document.getElementById('avl-competence')?.value;
      const competence_date = competenceMonthVal ? `${competenceMonthVal}-01` : null;

      const data = {
        user_id: State.user.id, account_id,
        category_id: parseInt(document.getElementById('avl-category').value) || null,
        recurring_item_id: isEdit ? tx.recurring_item_id : null,
        type: currentType, amount,
        description: document.getElementById('avl-desc').value,
        date, is_paid: document.getElementById('avl-paid').checked ? 1 : 0,
        is_avulso: isEdit ? tx.is_avulso : 1,
        notes: isEdit ? tx.notes : null,
        credit_product,
        due_date,
        competence_date
      };

      if (isEdit) {
        data.id = tx.id;
        const res = await window.api.transactions.update(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        await showDidacticFeedback(data);
      } else {
        const res = await window.api.transactions.create(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        await showDidacticFeedback(data);
      }
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao salvar lançamento: ' + err.message, 'error');
    }
  };
}


/* ==== nfce-scanner.js ==== */
/* ===
 * nfce-scanner.js — Scanner de Notas Fiscais (NFC-e / SAT / Pix) via Câmera e QR Code
 * Módulo para FamilyFinancas
 * === */

/**
 * Emite feedback sonoro futurista e agradável de leitura de QR Code usando Web Audio API
 */
function playScanBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Tom 1 (Frequência média alta)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // Nota A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // Nota A6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.16);

    setTimeout(() => {
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    }, 300);
  } catch (err) {
    console.debug('[Scanner] Audio feedback indisponível:', err);
  }
}

/**
 * Emite vibração háptica no dispositivo mobile
 */
function vibrateDevice(ms = 70) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch (e) {}
}

/**
 * Garante que a biblioteca jsQR esteja carregada e pronta para uso
 */
async function ensureJsQRLoaded() {
  if (typeof window.jsQR === 'function') return true;

  // Tenta carregar via script tag dinâmico
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'js/vendor/jsQR.js';
    script.onload = () => {
      resolve(typeof window.jsQR === 'function');
    };
    script.onerror = () => {
      console.warn('[Scanner] Não foi possível carregar jsQR local');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Parser inteligente de URLs de QR Code da SEFAZ (NFC-e / NF-e), SAT-CF-e, Pix e Boletos
 */
function parseNFCeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();

  let result = {
    type: 'expense',
    amount: null,
    date: null,
    competence: null,
    description: '',
    suggestedCategory: '',
    accessKey: '',
    cnpj: '',
    nNF: '',
    uf: '',
    rawUrl: text,
    isPix: false,
    isBoleto: false
  };

  // 1. Detecção de Pix Copia e Cola (EMVCo)
  if (text.startsWith('000201') && text.includes('BR.GOV.BCB.PIX')) {
    result.isPix = true;
    result.description = 'Pagamento PIX';
    result.suggestedCategory = 'Alimentação';
    
    // Extrai valor do Pix (Tag 54: 5405123.45)
    const pixValMatch = text.match(/54\d{2}([0-9.]+)/);
    if (pixValMatch) {
      result.amount = parseFloat(pixValMatch[1]);
    }
    
    // Extrai nome do recebedor (Tag 59: 5915NOME DO RECEBEDOR)
    const pixNameMatch = text.match(/59(\d{2})([^0-9]+)/);
    if (pixNameMatch) {
      const len = parseInt(pixNameMatch[1], 10);
      const nameRaw = pixNameMatch[2].substring(0, len).trim();
      if (nameRaw) {
        result.description = `PIX para ${nameRaw}`;
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    result.date = today;
    result.competence = today.slice(0, 7);
    return result;
  }

  // 2. Detecção de Boleto / Código de Barras (44, 47 ou 48 dígitos)
  const cleanDigits = text.replace(/[^0-9]/g, '');
  if ((cleanDigits.length === 47 || cleanDigits.length === 48) && !text.includes('http')) {
    result.isBoleto = true;
    result.description = 'Pagamento de Boleto';
    result.suggestedCategory = 'Moradia';
    
    // Extrai valor da linha digitável de título bancário (últimos 10 dígitos)
    if (cleanDigits.length === 47) {
      const valStr = cleanDigits.slice(-10);
      const valCents = parseInt(valStr, 10);
      if (valCents > 0) {
        result.amount = valCents / 100;
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    result.date = today;
    result.competence = today.slice(0, 7);
    return result;
  }

  // 3. Extração de Chave de Acesso de NFC-e / NF-e (44 dígitos contínuos)
  const keyMatch = text.match(/\b([0-9]{44})\b/) || text.match(/[?&]p=([0-9]{44})/i) || text.match(/[?&]chNFe=([0-9]{44})/i);
  if (keyMatch) {
    result.accessKey = keyMatch[1];
    
    // UF (2 primeiros dígitos)
    const ufCode = result.accessKey.substring(0, 2);
    const ufMap = {
      '11':'RO','12':'AC','13':'AM','14':'RR','15':'PA','16':'AP','17':'TO',
      '21':'MA','22':'PI','23':'CE','24':'RN','25':'PB','26':'PE','27':'AL','28':'SE','29':'BA',
      '31':'MG','32':'ES','33':'RJ','35':'SP',
      '41':'PR','42':'SC','43':'RS',
      '50':'MS','51':'MT','52':'GO','53':'DF'
    };
    result.uf = ufMap[ufCode] || 'BR';

    // Ano e Mês (dígitos 3 a 6: AAMM)
    const aa = result.accessKey.substring(2, 4);
    const mm = result.accessKey.substring(4, 6);
    const year = parseInt(aa, 10) + 2000;
    const month = mm.padStart(2, '0');
    result.competence = `${year}-${month}`;

    // CNPJ do emitente (dígitos 7 a 20)
    const rawCnpj = result.accessKey.substring(6, 20);
    result.cnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

    // Número da NF (dígitos 26 a 34)
    const rawNum = result.accessKey.substring(25, 34);
    result.nNF = parseInt(rawNum, 10).toString();
  }

  // 4. Extração de Valor Total (formato Pipe | ou query params)
  // Padrão SEFAZ p=CHAVE|VERSAO|TP_AMB|C_DEST|VALOR_TOTAL|DIG_VAL...
  if (text.includes('|')) {
    const pipeParts = text.split('|');
    for (const part of pipeParts) {
      if (/^\d+[.,]\d{2}$/.test(part.trim())) {
        const val = parseFloat(part.trim().replace(',', '.'));
        if (!isNaN(val) && val > 0 && val !== 2) {
          result.amount = val;
          break;
        }
      }
    }
  }

  // Query parameter vTot ou vNF ou valor
  if (!result.amount) {
    const valMatch = text.match(/[?&](?:vTot|vNF|valor|total|amount)=([0-9.,]+)/i);
    if (valMatch) {
      result.amount = parseFloat(valMatch[1].replace(',', '.'));
    }
  }

  // Se tiver data atual ou da competência da nota
  const today = new Date().toISOString().split('T')[0];
  if (result.competence) {
    const todayComp = today.slice(0, 7);
    if (result.competence === todayComp) {
      result.date = today;
    } else {
      result.date = `${result.competence}-01`;
    }
  } else {
    result.date = today;
    result.competence = today.slice(0, 7);
  }

  // 5. Reconhecimento de Estabelecimentos por CNPJ, URL ou Palavras-chave
  const knownMerchants = [
    { pattern: /zaffari|bourbon|cia.*zaffari/i, name: 'Supermercado Zaffari', cat: 'Alimentação' },
    { pattern: /carrefour/i, name: 'Carrefour Supermercado', cat: 'Alimentação' },
    { pattern: /pao.*acucar|extra|sendas|assai/i, name: 'Supermercado', cat: 'Alimentação' },
    { pattern: /panvel/i, name: 'Farmácia Panvel', cat: 'Saúde' },
    { pattern: /raia|drogasil/i, name: 'Droga Raia / Drogasil', cat: 'Saúde' },
    { pattern: /sao.*joao/i, name: 'Farmácia São João', cat: 'Saúde' },
    { pattern: /pague.*menos/i, name: 'Farmácia Pague Menos', cat: 'Saúde' },
    { pattern: /ipiranga/i, name: 'Posto Ipiranga', cat: 'Transporte' },
    { pattern: /shell/i, name: 'Posto Shell', cat: 'Transporte' },
    { pattern: /petrobras|br.*distribuidora|vibra/i, name: 'Posto Petrobras', cat: 'Transporte' },
    { pattern: /mcdonald|mc.*donald/i, name: 'McDonald\'s', cat: 'Alimentação' },
    { pattern: /burger.*king/i, name: 'Burger King', cat: 'Alimentação' },
    { pattern: /leroy.*merlin/i, name: 'Leroy Merlin', cat: 'Moradia' },
    { pattern: /cassol/i, name: 'Cassol Centerlar', cat: 'Moradia' },
    { pattern: /renner/i, name: 'Lojas Renner', cat: 'Vestuário' },
    { pattern: /riachuelo/i, name: 'Lojas Riachuelo', cat: 'Vestuário' },
    { pattern: /c&a|cea/i, name: 'Lojas C&A', cat: 'Vestuário' }
  ];

  for (const m of knownMerchants) {
    if (m.pattern.test(text)) {
      result.description = m.name + (result.nNF ? ` (NFC-e #${result.nNF})` : '');
      result.suggestedCategory = m.cat;
      break;
    }
  }

  if (!result.description) {
    if (result.nNF) {
      result.description = `Compra Cupom Fiscal NFC-e #${result.nNF}`;
    } else {
      result.description = `Compra Cupom Fiscal (${result.uf || 'NFC-e'})`;
    }
    result.suggestedCategory = 'Alimentação';
  }

  return result;
}

/**
 * Controlador de Câmera e Scanner de QR Code com Motor Híbrido (BarcodeDetector + jsQR)
 */
const NFCeCameraManager = {
  videoElement: null,
  stream: null,
  track: null,
  scanIntervalId: null,
  isScanning: false,
  currentFacingMode: 'environment',
  isTorchOn: false,
  barcodeDetector: null,

  async initEngines() {
    await ensureJsQRLoaded();

    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) {
          this.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'itf'] });
        }
      } catch (e) {
        console.debug('[Scanner] BarcodeDetector nativo indisponível:', e);
      }
    }
  },

  async start(videoEl, onResultCallback, onErrorCallback) {
    this.videoElement = videoEl;
    this.isScanning = true;
    await this.initEngines();

    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.currentFacingMode },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        audio: false
      };

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste dispositivo/navegador.');
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.track = this.stream.getVideoTracks()[0];

      // Inicia loop contínuo de escaneamento
      this.startScanLoop(onResultCallback);
    } catch (err) {
      this.isScanning = false;
      if (onErrorCallback) onErrorCallback(err);
    }
  },

  startScanLoop(onResultCallback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = async () => {
      if (!this.isScanning || !this.videoElement || this.videoElement.readyState < 2) {
        if (this.isScanning) {
          this.scanIntervalId = requestAnimationFrame(scanFrame);
        }
        return;
      }

      const video = this.videoElement;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      // 1. Tentativa nativa BarcodeDetector (se disponível no navegador)
      if (this.barcodeDetector) {
        try {
          const barcodes = await this.barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            this.handleDetectedCode(barcodes[0].rawValue, onResultCallback);
            return;
          }
        } catch (e) {}
      }

      // 2. Tentativa universal robusta via jsQR (CPU Canvas)
      if (typeof window.jsQR === 'function') {
        try {
          // Escala frame para tamanho ideal (max 800px) para alta velocidade e precisão
          const maxDim = 800;
          let targetW = vw;
          let targetH = vh;
          if (targetW > maxDim) {
            targetH = Math.round((vh * maxDim) / targetW);
            targetW = maxDim;
          }

          canvas.width = targetW;
          canvas.height = targetH;
          ctx.drawImage(video, 0, 0, targetW, targetH);
          const imageData = ctx.getImageData(0, 0, targetW, targetH);

          // Passo A: Escaneamento do frame completo
          let code = window.jsQR(imageData.data, targetW, targetH, {
            inversionAttempts: 'dontInvert'
          });

          // Passo B: Se não encontrou, foca no centro (área do retículo viewfinder)
          if (!code) {
            const cropW = Math.round(targetW * 0.65);
            const cropH = Math.round(targetH * 0.65);
            const cropX = Math.round((targetW - cropW) / 2);
            const cropY = Math.round((targetH - cropH) / 2);
            const cropData = ctx.getImageData(cropX, cropY, cropW, cropH);
            code = window.jsQR(cropData.data, cropW, cropH, {
              inversionAttempts: 'attemptBoth'
            });
          }

          if (code && code.data) {
            this.handleDetectedCode(code.data, onResultCallback);
            return;
          }
        } catch (err) {
          console.debug('[Scanner] Erro na análise de frame jsQR:', err);
        }
      }

      // Reagenda próximo frame
      if (this.isScanning) {
        this.scanIntervalId = setTimeout(() => {
          requestAnimationFrame(scanFrame);
        }, 80);
      }
    };

    requestAnimationFrame(scanFrame);
  },

  handleDetectedCode(rawText, onResultCallback) {
    if (!this.isScanning) return;
    this.isScanning = false;
    playScanBeep();
    vibrateDevice(80);

    const parsed = parseNFCeUrl(rawText);
    this.stop();
    if (onResultCallback) {
      onResultCallback(parsed);
    }
  },

  async toggleTorch() {
    if (!this.track) return false;
    try {
      const capabilities = this.track.getCapabilities ? this.track.getCapabilities() : {};
      if (capabilities.torch) {
        this.isTorchOn = !this.isTorchOn;
        await this.track.applyConstraints({
          advanced: [{ torch: this.isTorchOn }]
        });
        return this.isTorchOn;
      }
    } catch (e) {
      console.debug('[Scanner] Erro ao alternar lanterna:', e);
    }
    return false;
  },

  async switchCamera(onResultCallback, onErrorCallback) {
    this.stop();
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    await this.start(this.videoElement, onResultCallback, onErrorCallback);
  },

  async scanImageFile(file, onResultCallback) {
    await this.initEngines();

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Testa em múltiplas resoluções caso a foto seja muito grande (ex: 48MP)
      const testResolutions = [1200, 800, 600, 1800];
      let detectedText = null;

      for (const maxDim of testResolutions) {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);

        if (typeof window.jsQR === 'function') {
          const code = window.jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
          if (code && code.data) {
            detectedText = code.data;
            break;
          }
        }

        if (this.barcodeDetector) {
          try {
            const barcodes = await this.barcodeDetector.detect(canvas);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detectedText = barcodes[0].rawValue;
              break;
            }
          } catch (e) {}
        }
      }

      URL.revokeObjectURL(objectUrl);

      if (detectedText) {
        this.handleDetectedCode(detectedText, onResultCallback);
      } else {
        toast('Nenhum QR Code legível foi encontrado nesta imagem. Aproxime mais a câmera do código.', 'warning');
      }
    } catch (err) {
      console.error('[Scanner] Erro ao escanear imagem:', err);
      toast('Erro ao processar imagem da nota.', 'error');
    }
  },

  stop() {
    this.isScanning = false;
    if (this.scanIntervalId) {
      clearTimeout(this.scanIntervalId);
      cancelAnimationFrame(this.scanIntervalId);
      this.scanIntervalId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      this.stream = null;
      this.track = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
};

/**
 * Abre o Modal de Leitura de Nota Fiscal com Câmera ao Vivo
 */
function openNFCeScannerModal(customCallback = null) {
  // Remove modal anterior se existente
  const oldModal = document.getElementById('nfce-scanner-modal-wrap');
  if (oldModal) oldModal.remove();

  const modalWrap = document.createElement('div');
  modalWrap.id = 'nfce-scanner-modal-wrap';
  modalWrap.className = 'scanner-modal-backdrop';
  modalWrap.innerHTML = `
    <div class="scanner-modal-card">
      <div class="scanner-modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📷</span>
          <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">Leitor de Nota Fiscal (QR Code)</span>
        </div>
        <button class="scanner-close-btn" id="scanner-btn-close" title="Fechar Scanner">✕</button>
      </div>

      <!-- Viewport de Vídeo com Retículo Futurista -->
      <div class="scanner-viewport-container">
        <video id="nfce-scanner-video" class="scanner-video-feed" playsinline muted autoplay></video>
        
        <div class="scanner-hud-overlay">
          <div class="scanner-viewfinder">
            <div class="viewfinder-corner tl"></div>
            <div class="viewfinder-corner tr"></div>
            <div class="viewfinder-corner bl"></div>
            <div class="viewfinder-corner br"></div>
            <div class="scanner-laser-line"></div>
          </div>
        </div>

        <div class="scanner-live-badge">
          <span class="scanner-pulse-dot"></span> Câmera Ao Vivo
        </div>

        <div id="scanner-error-fallback" class="scanner-error-overlay" style="display: none;">
          <div style="font-size: 36px; margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;" id="scanner-error-msg">Não foi possível acessar a câmera</div>
          <div style="font-size: 12px; color: var(--text-muted); max-width: 260px; margin-bottom: 12px;">Você pode carregar uma foto da nota fiscal ou digitar a chave de 44 dígitos abaixo.</div>
          <label class="btn btn-primary btn-sm" style="cursor: pointer;">
            📁 Carregar Foto da Nota
            <input type="file" id="scanner-file-fallback" accept="image/*" style="display: none;">
          </label>
        </div>
      </div>

      <!-- Instruções e Controles -->
      <div class="scanner-controls-bar">
        <div style="font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 10px;">
          Aponte para o <strong>QR Code impresso no cupom fiscal (NFC-e / SAT / Pix)</strong>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="scanner-btn-switch-cam" title="Alternar Câmera">
            <span>🔄</span> Trocar Câmera
          </button>
          
          <button class="btn btn-secondary btn-sm" id="scanner-btn-torch" title="Alternar Lanterna">
            <span>💡</span> Lanterna
          </button>

          <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;" title="Carregar Foto da Galeria">
            <span>📁</span> Foto da Nota
            <input type="file" id="scanner-file-input" accept="image/*" style="display: none;">
          </label>
        </div>

        <!-- Entrada Manual de Chave ou Link -->
        <div style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="scanner-manual-input" placeholder="Cole o link da SEFAZ ou chave de 44 dígitos..." style="font-size: 11.5px; padding: 6px 10px; flex: 1; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface);">
            <button class="btn btn-primary btn-sm" id="scanner-btn-apply-manual">Processar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalWrap);

  const videoEl = document.getElementById('nfce-scanner-video');
  const errorOverlay = document.getElementById('scanner-error-fallback');
  const errorMsg = document.getElementById('scanner-error-msg');

  // Callback de Sucesso
  const handleSuccess = (parsedData) => {
    closeScannerModal();
    handleNFCeScanResult(parsedData, customCallback);
  };

  // Callback de Erro na Câmera
  const handleError = (err) => {
    console.warn('[Scanner] Erro na câmera:', err);
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg.innerText = 'Permissão de câmera negada no navegador';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg.innerText = 'Nenhuma câmera detectada neste computador';
      }
    }
  };

  function closeScannerModal() {
    NFCeCameraManager.stop();
    modalWrap.remove();
  }

  // Event Listeners
  document.getElementById('scanner-btn-close').addEventListener('click', closeScannerModal);
  modalWrap.addEventListener('click', (e) => {
    if (e.target === modalWrap) closeScannerModal();
  });

  document.getElementById('scanner-btn-switch-cam').addEventListener('click', () => {
    NFCeCameraManager.switchCamera(handleSuccess, handleError);
  });

  document.getElementById('scanner-btn-torch').addEventListener('click', async () => {
    const isLit = await NFCeCameraManager.toggleTorch();
    const btn = document.getElementById('scanner-btn-torch');
    if (btn) {
      btn.style.borderColor = isLit ? 'var(--accent)' : 'var(--border)';
      btn.style.color = isLit ? 'var(--accent-light)' : 'var(--text-primary)';
    }
  });

  const fileInput = document.getElementById('scanner-file-input');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      NFCeCameraManager.scanImageFile(e.target.files[0], handleSuccess);
    }
  });

  const fileFallback = document.getElementById('scanner-file-fallback');
  if (fileFallback) {
    fileFallback.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        NFCeCameraManager.scanImageFile(e.target.files[0], handleSuccess);
      }
    });
  }

  const applyManual = () => {
    const val = document.getElementById('scanner-manual-input').value.trim();
    if (!val) {
      toast('Digite ou cole a URL da SEFAZ ou chave da nota.', 'warning');
      return;
    }
    const parsed = parseNFCeUrl(val);
    handleSuccess(parsed);
  };

  document.getElementById('scanner-btn-apply-manual').addEventListener('click', applyManual);
  document.getElementById('scanner-manual-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyManual();
  });

  // Inicia a Câmera
  NFCeCameraManager.start(videoEl, handleSuccess, handleError);
}

/**
 * Abre Pop-up de Confirmação com todos os dados da leitura do QR Code
 */
function openNFCeConfirmationModal(parsedData, accounts, categories) {
  const today = new Date().toISOString().split('T')[0];
  const dateVal = parsedData.date || today;
  const competenceVal = parsedData.competence || (dateVal ? dateVal.slice(0, 7) : today.slice(0, 7));
  const amountVal = parsedData.amount != null ? parsedData.amount : '';
  const descVal = parsedData.description || 'Compra Cupom Fiscal';

  // Localiza melhor categoria sugerida
  let matchedCatId = '';
  if (parsedData.suggestedCategory) {
    const matchedCat = categories.find(c =>
      c.name.toLowerCase().includes(parsedData.suggestedCategory.toLowerCase()) ||
      parsedData.suggestedCategory.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCat) matchedCatId = matchedCat.id;
  }

  Modal.open('📋 Conferência da Nota Fiscal', `
    <div class="nfce-confirm-container">
      <!-- Card com destaque do valor e dados fiscais lidos -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius); padding: 18px; margin-bottom: 16px; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 24px;">🧾</span>
          <span style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${descVal}</span>
          ${parsedData.uf ? `<span class="badge badge-blue" style="font-size: 10px;">${parsedData.uf}</span>` : ''}
        </div>
        
        <div style="font-size: 32px; font-weight: 900; color: var(--accent-light); letter-spacing: -0.02em; margin: 8px 0;">
          ${amountVal !== '' ? fmt.currency(amountVal) : 'R$ 0,00'}
        </div>
        
        <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <span>📅 Data: <strong>${fmt.date(dateVal)}</strong></span>
          ${parsedData.nNF ? `<span>🔢 Nota: <strong>#${parsedData.nNF}</strong></span>` : ''}
          ${parsedData.cnpj ? `<span>🏢 CNPJ: <strong>${parsedData.cnpj}</strong></span>` : ''}
        </div>

        ${parsedData.accessKey ? `
          <div style="margin-top: 10px; font-size: 10.5px; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; word-break: break-all;">
            🔑 Chave: <code>${parsedData.accessKey}</code>
          </div>
        ` : ''}
      </div>

      <!-- Formulário de Ajuste Rápido antes de Aceitar -->
      <div class="form-row">
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Descrição</label>
          <input type="text" id="nfce-conf-desc" value="${descVal}" style="font-size: 13px;">
        </div>
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Valor (R$)</label>
          <input type="number" step="0.01" min="0" id="nfce-conf-amount" value="${amountVal}" style="font-size: 13px;">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Conta / Cartão Pagador</label>
          <select id="nfce-conf-account" style="font-size: 13px;">
            ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Categoria</label>
          <select id="nfce-conf-category" style="font-size: 13px;">
            <option value="">Sem categoria</option>
            ${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `
              <option value="${c.id}" ${String(c.id) === String(matchedCatId) ? 'selected' : ''}>${c.icon} ${c.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Data do Pagamento</label>
          <input type="date" id="nfce-conf-date" value="${dateVal}" style="font-size: 13px;">
        </div>
        <div class="form-group">
          <label style="font-size: 12px; font-weight: 600;">Mês de Referência (Competência)</label>
          <input type="month" id="nfce-conf-competence" value="${competenceVal}" style="font-size: 13px;">
        </div>
      </div>

      <div class="form-group" style="margin-top: 6px;">
        <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="nfce-conf-paid" checked> Já foi pago / debitado da conta
        </label>
      </div>

      <!-- Rodapé de Ações: Aceitar ou Não Aceitar -->
      <div class="modal-footer" style="padding: 16px 0 0 0; border-top: 1px solid var(--border); margin-top: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary" id="nfce-conf-btn-reject" style="color: #f87171; border-color: rgba(239, 68, 68, 0.4); display: flex; align-items: center; gap: 6px;">
          <span>✕</span> Não Aceitar (Descartar)
        </button>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary" id="nfce-conf-btn-more-options" title="Abrir no formulário completo com todas as opções">
            <span>✏️</span> Mais Opções
          </button>
          <button type="button" class="btn btn-primary" id="nfce-conf-btn-accept" style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>✓</span> Aceitar e Criar Lançamento
          </button>
        </div>
      </div>
    </div>
  `);

  // 1. Botão Não Aceitar / Descartar
  document.getElementById('nfce-conf-btn-reject').onclick = () => {
    Modal.close();
    toast('Leitura da nota fiscal descartada.', 'info');
  };

  // 2. Botão Mais Opções (abre formulário avulso completo)
  document.getElementById('nfce-conf-btn-more-options').onclick = () => {
    const updatedPrefill = {
      ...parsedData,
      description: document.getElementById('nfce-conf-desc').value.trim(),
      amount: parseFloat(document.getElementById('nfce-conf-amount').value) || null,
      date: document.getElementById('nfce-conf-date').value,
      competence: document.getElementById('nfce-conf-competence').value,
      suggestedCategory: categories.find(c => String(c.id) === String(document.getElementById('nfce-conf-category').value))?.name || parsedData.suggestedCategory
    };
    Modal.close();
    openAvulsoModal(accounts, categories, null, 'expense', updatedPrefill);
  };

  // 3. Botão Aceitar e Criar Lançamento Direto
  document.getElementById('nfce-conf-btn-accept').onclick = async () => {
    try {
      const amount = parseFloat(document.getElementById('nfce-conf-amount').value);
      const date = document.getElementById('nfce-conf-date').value;
      const account_id = parseInt(document.getElementById('nfce-conf-account').value);
      const description = document.getElementById('nfce-conf-desc').value.trim();
      const category_id = parseInt(document.getElementById('nfce-conf-category').value) || null;
      const competenceMonthVal = document.getElementById('nfce-conf-competence').value;
      const competence_date = competenceMonthVal ? `${competenceMonthVal}-01` : null;
      const is_paid = document.getElementById('nfce-conf-paid').checked ? 1 : 0;

      if (!amount || amount <= 0) {
        toast('Informe um valor válido para a nota fiscal.', 'error');
        return;
      }
      if (!date) {
        toast('Informe a data da compra.', 'error');
        return;
      }
      if (!account_id || isNaN(account_id)) {
        toast('Selecione a conta pagadora.', 'error');
        return;
      }

      const txData = {
        user_id: State.user.id,
        account_id,
        category_id,
        recurring_item_id: null,
        type: 'expense',
        amount,
        description: description || 'Compra Cupom Fiscal',
        date,
        is_paid,
        is_avulso: 1,
        notes: parsedData.accessKey ? `Chave NFC-e: ${parsedData.accessKey}` : null,
        credit_product: 'normal',
        due_date: null,
        competence_date
      };

      const res = await window.api.transactions.create(txData);
      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }

      Modal.close();
      toast(`✅ Lançamento de ${fmt.currency(amount)} criado com sucesso!`, 'success');

      // Atualiza visualizações
      if (typeof renderRecurring === 'function' && State.currentPage === 'recurring') {
        renderRecurring();
      }
      if (typeof renderDashboard === 'function' && (State.currentPage === 'dashboard' || !State.currentPage)) {
        renderDashboard();
      }
    } catch (err) {
      console.error('[Scanner] Erro ao salvar lançamento aceito:', err);
      toast('Erro ao criar lançamento: ' + err.message, 'error');
    }
  };
}

/**
 * Processa os dados extraídos da Nota Fiscal e abre o Pop-up de Confirmação
 */
async function handleNFCeScanResult(parsedData, customCallback = null) {
  if (!parsedData) {
    toast('Não foi possível extrair dados válidos da nota fiscal.', 'error');
    return;
  }

  if (customCallback && typeof customCallback === 'function') {
    customCallback(parsedData);
    return;
  }

  try {
    const [accounts, categories] = await Promise.all([
      window.api.accounts.getAll(State.user.id),
      window.api.categories.getAll(State.user.id)
    ]);

    // Abre o Pop-up de Confirmação com opções de Aceitar ou Não Aceitar
    openNFCeConfirmationModal(parsedData, accounts, categories);
  } catch (err) {
    console.error('[Scanner] Erro ao abrir pop-up de confirmação da nota:', err);
    toast('Erro ao carregar dados para confirmação do lançamento.', 'error');
  }
}


/* ==== payment-modal.js ==== */
/* ===
 * payment-modal.js — L3852–4013 do app.js
 */

async function openPaymentDateModal(txId, currentDate, onComplete) {
  const cleanDate = currentDate ? currentDate.split(' ')[0] : new Date().toISOString().split('T')[0];
  let tx = null;
  try {
    const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
    tx = allTxs.find(t => t.id == txId);
  } catch (e) {
    console.error(e);
  }
  const compDate = tx ? tx.date.split(' ')[0] : cleanDate;
  const baseAmount = tx ? tx.amount : 0;

  Modal.open('Confirmar Pagamento / Liquidação', `
    <div style="padding: 16px;">
      <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); text-align: center;">
        Informe a data do efetivo pagamento e eventuais ajustes (juros ou desconto):
      </p>
      
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Efetivo Pagamento</label>
        <input type="date" id="payment-date-input" value="${cleanDate}" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 600;">
      </div>

      <div id="payment-options-container" style="background: var(--bg-raised); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 16px;">
      </div>

      <div id="payment-summary-box" style="padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.3);">
        <strong>Total a Debitar da Conta:</strong> <span id="payment-total-preview" style="font-weight:700; font-size:15px; color:var(--accent-light);">${fmt.currency(baseAmount)}</span>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="btn-pay-cancel">Cancelar</button>
        <button class="btn btn-primary" id="btn-pay-confirm" style="background: var(--accent); border-color: var(--accent); font-weight: 600;">
          Confirmar Pagamento
        </button>
      </div>
    </div>
  `);

  const dateInput = document.getElementById('payment-date-input');
  const optContainer = document.getElementById('payment-options-container');
  const totalPreview = document.getElementById('payment-total-preview');

  function updatePaymentOptionsUI() {
    const selDate = dateInput.value;
    let html = '';
    let isEarly = selDate < compDate;
    let isLate = selDate > compDate;

    if (isEarly) {
      html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;font-weight:600;color:var(--accent-light)">
            <input type="checkbox" id="chk-discount"> 🏷️ Aplicar desconto por antecipação
          </label>
          <div id="row-discount-val" style="display:none;margin-top:4px">
            <label style="font-size:11px;color:var(--text-muted)">Valor do Desconto (R$)</label>
            <input type="number" step="0.01" min="0" id="input-discount-val" placeholder="0.00" style="width:100%;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary)">
          </div>
        </div>
      `;
    } else if (isLate) {
      html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;font-weight:600;color:#fbbf24">
            <input type="checkbox" id="chk-penalty"> ⚠️ Aplicar juros/multa por atraso
          </label>
          <div id="row-penalty-val" style="display:none;margin-top:4px">
            <label style="font-size:11px;color:var(--text-muted)">Valor de Juros/Multa (R$)</label>
            <input type="number" step="0.01" min="0" id="input-penalty-val" placeholder="0.00" style="width:100%;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary)">
          </div>
        </div>
      `;
    } else {
      html = `<div style="font-size:12px;color:var(--text-muted);text-align:center">Pagamento na data exata de vencimento (${fmt.date(compDate)})</div>`;
    }
    optContainer.innerHTML = html;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount) {
      chkDiscount.onchange = () => {
        document.getElementById('row-discount-val').style.display = chkDiscount.checked ? 'block' : 'none';
        recalcTotal();
      };
    }
    if (chkPenalty) {
      chkPenalty.onchange = () => {
        document.getElementById('row-penalty-val').style.display = chkPenalty.checked ? 'block' : 'none';
        recalcTotal();
      };
    }
    if (inputDiscount) inputDiscount.oninput = recalcTotal;
    if (inputPenalty) inputPenalty.oninput = recalcTotal;

    recalcTotal();
  }

  function recalcTotal() {
    let penaltyVal = 0;
    let discountVal = 0;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount && chkDiscount.checked && inputDiscount) {
      discountVal = parseFloat(inputDiscount.value) || 0;
    }
    if (chkPenalty && chkPenalty.checked && inputPenalty) {
      penaltyVal = parseFloat(inputPenalty.value) || 0;
    }

    const finalNet = baseAmount + penaltyVal - discountVal;
    totalPreview.innerText = fmt.currency(finalNet);
  }

  dateInput.onchange = updatePaymentOptionsUI;
  updatePaymentOptionsUI();

  document.getElementById('btn-pay-cancel').onclick = Modal.close;
  document.getElementById('btn-pay-confirm').onclick = async () => {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
      toast('Selecione uma data válida', 'error');
      return;
    }

    let penalty_amount = 0;
    let discount_amount = 0;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount && chkDiscount.checked && inputDiscount) {
      discount_amount = parseFloat(inputDiscount.value) || 0;
    }
    if (chkPenalty && chkPenalty.checked && inputPenalty) {
      penalty_amount = parseFloat(inputPenalty.value) || 0;
    }

    try {
      await window.api.transactions.togglePaidWithDate(txId, selectedDate, { penalty_amount, discount_amount });
      toast('Pagamento confirmado com sucesso!');
      Modal.close();
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar status', 'error');
    }
  };
}

// ════════════════════════════════════════
// ACCOUNTS
// ════════════════════════════════════════

/* ==== accounts.js ==== */
/* ===
 * accounts.js — L4014–4718 do app.js
 */

async function renderAccounts() {
  const page = document.getElementById('page-accounts');
  const [accounts, summary, txs] = await Promise.all([
    window.api.accounts.getAll(State.user.id),
    window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
    window.api.transactions.getAll({
      userId: State.user.id,
      month: State.currentMonth,
      year: State.currentYear
    })
  ]);
  const cardSpending = summary.cardSpending || {};

  const bankAccounts = accounts.filter(a => a.type !== 'credit' && a.type !== 'voucher');
  const voucherAccounts = accounts.filter(a => a.type === 'voucher');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  page.innerHTML = `
    <div class="page-header" style="align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="page-title">Contas & Cartões</h2>
        <p class="page-subtitle">Gerencie suas contas bancárias, cartões de benefício e cartões de crédito</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-import-statement" style="display:flex;align-items:center;gap:6px"><span>📥</span> Importar Extrato (OFX / CSV)</button>
        <button class="btn btn-primary" id="btn-new-account">+ Nova conta / cartão</button>
      </div>
    </div>

    ${accounts.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <div class="empty-title">Nenhuma conta ou cartão cadastrado</div>
        <div class="empty-desc">Adicione sua conta corrente, poupança, cartão benefício ou cartão de crédito</div>
      </div>
    ` : `
      <!-- 🏦 SEÇÃO 1: CONTAS BANCÁRIAS (Diferença entre Receitas e Despesas do mês) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🏦 Contas Bancárias & Carteiras <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Diferença entre Receitas e Despesas do mês)</span>
        </h3>
        <div class="accounts-grid">
          ${bankAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhuma conta corrente ou carteira cadastrada.</div>
          ` : bankAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            
            // Calculate dynamic month balance (receitas - despesas - transferencias)
            const incomes = txs.filter(t => t.account_id === acc.id && t.type === 'income' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const expenses = txs.filter(t => t.account_id === acc.id && t.type === 'expense' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const transfersOut = txs.filter(t => t.account_id === acc.id && t.type === 'transfer' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const monthlyDiff = incomes - expenses - transfersOut;

            return `
              <div class="account-card">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type]}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Saldo do mês</div>
                <div class="account-balance" style="color:${monthlyDiff >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(monthlyDiff)}</div>
                ${acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : ''}
                
                ${(acc.overdraft_limit > 0 || acc.banricompras_limit > 0 || acc.credit_minuto_limit > 0) ? `
                  <div style="margin-top: 10px; margin-bottom: 10px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border);">
                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
                      📋 Limites da Conta
                    </div>
                    ${acc.overdraft_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span style="color: var(--text-muted);">🔴 Cheque Especial:</span>
                      <span style="font-weight: 600; color: var(--text-primary);">${fmt.currency(acc.overdraft_limit)}</span>
                    </div>` : ''}
                    ${acc.banricompras_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span style="color: var(--text-muted);">🛍️ Banricompras:</span>
                      <span style="font-weight: 600; color: #fbbf24;">${fmt.currency(acc.banricompras_available)} / ${fmt.currency(acc.banricompras_limit)}</span>
                    </div>` : ''}
                    ${acc.credit_minuto_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between;">
                      <span style="color: var(--text-muted);">⚡ Crédito Minuto:</span>
                      <span style="font-weight: 600; color: #60a5fa;">${fmt.currency(acc.credit_minuto_limit)}</span>
                    </div>` : ''}
                  </div>
                ` : ''}

                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 🎟️ SEÇÃO 2: CARTÕES BENEFÍCIO & VOUCHERS -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🎟️ Cartões Benefício & Vouchers <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Alimentação, Refeição, Mobilidade e Multibenefícios)</span>
        </h3>
        <div class="accounts-grid">
          ${voucherAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhum cartão benefício cadastrado. Clique em "+ Nova conta / cartão" para adicionar.</div>
          ` : voucherAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            const benefitLabel = BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício';

            return `
              <div class="account-card">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge" style="background:${b.color}22;color:${b.color};border:1px solid ${b.color}44">${benefitLabel}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Saldo Atual no Cartão</div>
                <div class="account-balance" style="color:var(--accent-light)">${fmt.currency(acc.balance || 0)}</div>
                
                <div style="margin-top: 10px; margin-bottom: 12px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border);">
                  <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">🏢 Recarga Mensal:</span>
                    <span style="font-weight: 700; color: var(--text-primary);">${acc.benefit_monthly_credit ? fmt.currency(acc.benefit_monthly_credit) : 'Não informada'}</span>
                  </div>
                  <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">📅 Dia da Recarga:</span>
                    <span style="font-weight: 600; color: var(--text-secondary);">Todo dia ${acc.benefit_credit_day || 1}</span>
                  </div>
                  ${acc.card_last_digits ? `
                  <div style="font-size: 11px; display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">💳 Final do Cartão:</span>
                    <span style="font-weight: 700; color: var(--accent-light);">•••• ${acc.card_last_digits}</span>
                  </div>` : ''}
                </div>

                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 💳 SEÇÃO 3: LIMITES DE CARTÕES (Fatura do período e limites disponíveis) -->
      <div style="margin-top: 32px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          💳 Limites de Cartões de Crédito <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Fatura do período e limites disponíveis)</span>
        </h3>
        <div class="accounts-grid">
          ${creditAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhum cartão de crédito cadastrado.</div>
          ` : creditAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            
            const spent = cardSpending[acc.id] || 0;
            const available = (acc.credit_limit || 0) - spent;
            const isExceeded = (acc.credit_limit || 0) > 0 && spent > (acc.credit_limit || 0);

            return `
              <div class="account-card" style="${isExceeded ? 'border: 1px solid rgba(239, 68, 68, 0.4);' : ''}">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${isExceeded ? '#ef4444' : b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type]}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">
                      ${acc.name}${userBadge}${lockIcon}
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                  <div>
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">Fatura / Usado</div>
                    <div style="font-size:16px;font-weight:700;color:#f87171;">${fmt.currency(spent)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">${isExceeded ? 'Excedido / Negativo' : 'Disponível'}</div>
                    <div style="font-size:16px;font-weight:700;color:${isExceeded ? '#f87171' : 'var(--accent-light)'};">${fmt.currency(available)}</div>
                  </div>
                </div>

                ${isExceeded ? `
                <div style="margin-bottom:10px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px">
                  <span>⚠️</span> Limite estourado em ${fmt.currency(Math.abs(available))}
                </div>` : ''}

                <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">Limite total</div>
                <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-secondary);">${fmt.currency(acc.credit_limit)}</div>
                
                <div style="font-size:11px;color:var(--text-muted);margin-top:6px;margin-bottom:12px;">Fecha dia ${acc.closing_day || '—'} • Vence dia ${acc.due_day || '—'}</div>
                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `}
    ${accounts.length > 1 ? `<div style="margin-top:16px"><button class="btn btn-secondary" id="btn-transfer">🔄 Transferência entre contas</button></div>` : ''}
  `;

  // Bind edit & delete buttons
  page.querySelectorAll('.acc-edit').forEach(btn => {
    btn.onclick = () => {
      const acc = accounts.find(a => a.id === parseInt(btn.dataset.id));
      openAccountModal(acc);
    };
  });
  page.querySelectorAll('.acc-delete').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id);
      const acc = accounts.find(a => a.id === id);
      const confirmDelete = await Modal.confirm(`Excluir conta "${acc?.name}"?`);
      if (confirmDelete) {
        await window.api.accounts.delete(id);
        toast('Conta excluída com sucesso');
        renderAccounts();
      }
    };
  });

  const btnNewAccount = page.querySelector('#btn-new-account');
  if (btnNewAccount) btnNewAccount.onclick = () => openAccountModal();

  const btnImportStatement = page.querySelector('#btn-import-statement');
  if (btnImportStatement) btnImportStatement.onclick = () => openImportStatementModal(accounts);
  const btnTransfer = document.getElementById('btn-transfer');
  if (btnTransfer) btnTransfer.onclick = () => openTransferModal(accounts);
}

async function openAccountModal(acc) {
  const isEdit = !!acc;
  if (isEdit) {
    const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
    if (!canEdit) {
      toast('Você não tem permissão para editar esta conta', 'error');
      return;
    }
  }
  const users = await window.api.auth.getUsers();

  Modal.open(isEdit ? 'Editar Conta / Cartão' : 'Nova Conta / Cartão', `
    <div class="form-group">
      <label>Nome de Identificação</label>
      <input type="text" id="acc-name" placeholder="Ex: Flash Jenny, VR Banrisul, Nubank..." value="${acc?.name || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo de Conta / Cartão</label>
        <select id="acc-type">
          ${Object.entries(ACCOUNT_TYPES).map(([v,l]) => `<option value="${v}" ${acc?.type === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Banco / Operadora</label>
        <select id="acc-bank">
          ${Object.entries(BANKS).map(([v,b]) => `<option value="${v}" ${acc?.bank === v ? 'selected' : ''}>${b.emoji} ${b.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Perfil / Titular</label>
      <select id="acc-user-id">
        ${users.map(u => `<option value="${u.id}" ${(acc ? acc.user_id : State.user.id) === u.id ? 'selected' : ''}>${u.name} (@${u.username})</option>`).join('')}
      </select>
    </div>

    <!-- 🏦 CAMPOS ESPECÍFICOS PARA CONTA CORRENTE / POUPANÇA / CARTEIRA -->
    <div id="acc-debit-fields" style="${(acc?.type === 'credit' || acc?.type === 'voucher') ? 'display:none' : ''}">
      <div class="form-row">
        <div class="form-group">
          <label>Saldo inicial (R$)</label>
          <input type="number" id="acc-balance" step="0.01" placeholder="0,00" value="${acc?.balance || 0}">
        </div>
        <div class="form-group">
          <label>Agência</label>
          <input type="text" id="acc-agency" placeholder="0001" value="${acc?.agency || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Número da conta</label>
        <input type="text" id="acc-account-number" placeholder="00000-0" value="${acc?.account_number || ''}">
      </div>

      <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
          📋 Limites Integrados da Conta (Opcional)
        </div>
        <div class="form-row">
          <div class="form-group">
            <label style="font-size: 12px;">🔴 Cheque Especial (R$)</label>
            <input type="number" id="acc-overdraft" step="0.01" min="0" placeholder="0,00" value="${acc?.overdraft_limit || ''}">
          </div>
          <div class="form-group">
            <label style="font-size: 12px;">🛍️ Banricompras (R$)</label>
            <input type="number" id="acc-banricompras" step="0.01" min="0" placeholder="0,00" value="${acc?.banricompras_limit || ''}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size: 12px;">⚡ Crédito Minuto (R$)</label>
          <input type="number" id="acc-credit-minuto" step="0.01" min="0" placeholder="0,00" value="${acc?.credit_minuto_limit || ''}">
        </div>
      </div>
    </div>

    <!-- 🎟️ CAMPOS ESPECÍFICOS PARA CARTÃO BENEFÍCIO / VOUCHER -->
    <div id="acc-benefit-fields" style="${acc?.type !== 'voucher' ? 'display:none' : ''}">
      <div class="form-row">
        <div class="form-group">
          <label>Modalidade do Benefício</label>
          <select id="acc-benefit-type">
            ${Object.entries(BENEFIT_TYPES).map(([v,l]) => `<option value="${v}" ${(acc?.benefit_type || 'va') === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Saldo atual no cartão (R$)</label>
          <input type="number" id="acc-benefit-balance" step="0.01" placeholder="0,00" value="${acc?.type === 'voucher' ? (acc?.balance || 0) : ''}">
        </div>
      </div>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label>Recarga mensal (R$)</label>
          <input type="number" id="acc-benefit-credit" step="0.01" placeholder="Ex: 800,00" value="${acc?.benefit_monthly_credit || ''}">
        </div>
        <div class="form-group">
          <label>Dia da recarga</label>
          <input type="number" id="acc-benefit-day" min="1" max="31" placeholder="Dia 01" value="${acc?.benefit_credit_day || 1}">
        </div>
        <div class="form-group">
          <label>Final do Cartão (Opcional)</label>
          <input type="text" id="acc-card-last-digits" maxlength="4" placeholder="Ex: 4321" value="${acc?.card_last_digits || ''}">
        </div>
      </div>
    </div>

    <!-- 💳 CAMPOS ESPECÍFICOS PARA CARTÃO DE CRÉDITO -->
    <div id="acc-credit-fields" style="${acc?.type !== 'credit' ? 'display:none' : ''}">
      <div class="form-row form-row-3">
        <div class="form-group">
          <label>Limite (R$)</label>
          <input type="number" id="acc-limit" placeholder="0,00" value="${acc?.credit_limit || ''}">
        </div>
        <div class="form-group">
          <label>Fecha dia</label>
          <input type="number" id="acc-closing" min="1" max="31" placeholder="15" value="${acc?.closing_day || ''}">
        </div>
        <div class="form-group">
          <label>Vence dia</label>
          <input type="number" id="acc-due" min="1" max="31" placeholder="22" value="${acc?.due_day || ''}">
        </div>
      </div>
    </div>

    <div class="form-group" style="margin-top:12px">
      <label>Cor de destaque</label>
      <div class="color-picker" id="acc-color-picker">
        ${COLORS.map(c => `<div class="color-swatch ${(acc?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="acc-cancel">Cancelar</button>
      <button class="btn btn-primary" id="acc-save">${isEdit ? 'Salvar' : 'Criar conta / cartão'}</button>
    </div>
  `);

  let selectedColor = acc?.color || '#10b981';
  document.querySelectorAll('#acc-color-picker .color-swatch').forEach(sw => {
    sw.onclick = () => { document.querySelectorAll('#acc-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); selectedColor = sw.dataset.color; };
  });

  const updateFormVisibility = (type) => {
    const isCredit = type === 'credit';
    const isVoucher = type === 'voucher';
    document.getElementById('acc-credit-fields').style.display = isCredit ? '' : 'none';
    document.getElementById('acc-benefit-fields').style.display = isVoucher ? '' : 'none';
    document.getElementById('acc-debit-fields').style.display = (!isCredit && !isVoucher) ? '' : 'none';
  };

  document.getElementById('acc-type').onchange = (e) => updateFormVisibility(e.target.value);

  document.getElementById('acc-cancel').onclick = Modal.close;
  document.getElementById('acc-save').onclick = async () => {
    const name = document.getElementById('acc-name').value.trim();
    if (!name) { toast('Informe o nome', 'error'); return; }

    const type = document.getElementById('acc-type').value;

    let balanceVal = 0;
    if (type === 'voucher') {
      const bVal = parseFloat(document.getElementById('acc-benefit-balance')?.value);
      balanceVal = isNaN(bVal) ? 0 : bVal;
    } else {
      const bVal = parseFloat(document.getElementById('acc-balance')?.value);
      balanceVal = isNaN(bVal) ? 0 : bVal;
    }

    const limitVal = parseFloat(document.getElementById('acc-limit')?.value);
    const closingVal = parseInt(document.getElementById('acc-closing')?.value);
    const dueVal = parseInt(document.getElementById('acc-due')?.value);

    const overdraftVal = parseFloat(document.getElementById('acc-overdraft')?.value);
    const banricomprasVal = parseFloat(document.getElementById('acc-banricompras')?.value);
    const creditMinutoVal = parseFloat(document.getElementById('acc-credit-minuto')?.value);

    const benefitMonthlyCreditVal = parseFloat(document.getElementById('acc-benefit-credit')?.value);
    const benefitCreditDayVal = parseInt(document.getElementById('acc-benefit-day')?.value);
    const cardLastDigitsVal = document.getElementById('acc-card-last-digits')?.value.trim() || null;
    const benefitTypeVal = document.getElementById('acc-benefit-type')?.value || 'va';

    const data = {
      user_id: parseInt(document.getElementById('acc-user-id').value),
      name,
      type,
      bank: document.getElementById('acc-bank').value,
      balance: balanceVal,
      color: selectedColor,
      credit_limit: isNaN(limitVal) ? null : limitVal,
      closing_day: isNaN(closingVal) ? null : closingVal,
      due_day: isNaN(dueVal) ? null : dueVal,
      agency: type === 'voucher' ? null : (document.getElementById('acc-agency')?.value.trim() || null),
      account_number: type === 'voucher' ? null : (document.getElementById('acc-account-number')?.value.trim() || null),
      overdraft_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(overdraftVal) ? 0 : overdraftVal),
      banricompras_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(banricomprasVal) ? 0 : banricomprasVal),
      credit_minuto_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(creditMinutoVal) ? 0 : creditMinutoVal),
      benefit_type: type === 'voucher' ? benefitTypeVal : null,
      benefit_monthly_credit: type === 'voucher' ? (isNaN(benefitMonthlyCreditVal) ? 0 : benefitMonthlyCreditVal) : 0,
      benefit_credit_day: type === 'voucher' ? (isNaN(benefitCreditDayVal) ? 1 : benefitCreditDayVal) : 1,
      card_last_digits: cardLastDigitsVal,
    };

    let res;
    if (isEdit) {
      data.id = acc.id;
      res = await window.api.accounts.update(data);
      if (res && res.error) {
        toast('Erro ao atualizar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta / cartão atualizado com sucesso!');
    } else {
      res = await window.api.accounts.create(data);
      if (res && res.error) {
        toast('Erro ao criar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta / cartão criado com sucesso!');
    }
    Modal.close();
    renderAccounts();
  };
}

function openTransferModal(accounts) {
  Modal.open('Transferência entre Contas', `
    <div class="form-group"><label>Da conta</label><select id="tf-from">${accounts.map(a => `<option value="${a.id}">${a.name} (${fmt.currency(a.balance)})</option>`).join('')}</select></div>
    <div class="form-group"><label>Para a conta</label><select id="tf-to">${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Valor (R$)</label><input type="number" id="tf-amount" step="0.01" min="0" placeholder="0,00"></div>
      <div class="form-group"><label>Data</label><input type="date" id="tf-date" value="${new Date().toISOString().split('T')[0]}"></div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="tf-cancel">Cancelar</button>
      <button class="btn btn-primary" id="tf-save">Transferir</button>
    </div>
  `);
  document.getElementById('tf-cancel').onclick = Modal.close;
  document.getElementById('tf-save').onclick = async () => {
    const from = parseInt(document.getElementById('tf-from').value);
    const to = parseInt(document.getElementById('tf-to').value);
    const amount = parseFloat(document.getElementById('tf-amount').value);
    const date = document.getElementById('tf-date').value;
    if (from === to) { toast('Selecione contas diferentes', 'error'); return; }
    if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
    await window.api.accounts.transfer({ from_account_id: from, to_account_id: to, amount, date, user_id: State.user.id });
    toast('Transferência realizada');
    Modal.close();
    renderAccounts();
  };
}

async function openImportStatementModal(accounts) {
  const debitAccounts = (accounts || []).filter(a => a.type !== 'credit');
  const allCategories = await window.api.categories.getAll(State.user.id);
  let parsedTransactions = [];

  Modal.open('📥 Importar Extrato Bancário (OFX / CSV)', `
    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
      Importe arquivos <code>.ofx</code> ou <code>.csv</code> emitidos pelo seu banco (Nubank, Itaú, Inter, Bradesco, etc.) para conciliar despesas e receitas automaticamente.
    </div>

    <div class="form-row" style="margin-bottom: 14px;">
      <div class="form-group" style="flex: 1;">
        <label style="font-size: 12px; font-weight: 700;">Conta de Destino</label>
        <select id="import-target-account" style="width: 100%; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
          ${debitAccounts.map(a => `<option value="${a.id}">${a.name} (${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="flex: 1;">
        <label style="font-size: 12px; font-weight: 700;">Selecionar Arquivo (.ofx ou .csv)</label>
        <input type="file" id="import-file-input" accept=".ofx,.csv,.txt" style="width: 100%; padding: 6px; font-size: 12px;">
      </div>
    </div>

    <!-- PREVIEW CONTAINER -->
    <div id="import-preview-container" style="display: none; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); padding: 12px; max-height: 320px; overflow-y: auto; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span id="import-count-badge" style="font-weight: 700; color: var(--text-primary); font-size: 12.5px;">0 lançamentos encontrados</span>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-all-import" style="font-size: 11px;">Marcar / Desmarcar Todos</button>
      </div>
      <div id="import-table-wrapper" style="overflow-x: auto;"></div>
    </div>

    <div class="modal-footer" style="padding: 0; border: none; margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn btn-secondary" id="import-cancel">Cancelar</button>
      <button class="btn btn-primary" id="import-confirm" disabled style="opacity: 0.5;">Confirmar Importação (0)</button>
    </div>
  `, true);

  const fileInput = document.getElementById('import-file-input');
  const previewContainer = document.getElementById('import-preview-container');
  const countBadge = document.getElementById('import-count-badge');
  const tableWrapper = document.getElementById('import-table-wrapper');
  const confirmBtn = document.getElementById('import-confirm');
  const toggleAllBtn = document.getElementById('btn-toggle-all-import');

  document.getElementById('import-cancel').onclick = Modal.close;

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const isOfx = file.name.toLowerCase().endsWith('.ofx');
      try {
        let result;
        if (isOfx) {
          result = await window.api.importer.parseOfx(content);
        } else {
          result = await window.api.importer.parseCsv(content);
        }

        parsedTransactions = (result?.transactions || []).map((t, idx) => ({
          ...t,
          id_temp: idx,
          selected: true,
          category_id: (allCategories.find(c => c.name.toLowerCase() === (t.suggestedCategory || '').toLowerCase()) || allCategories[0])?.id || null
        }));

        if (parsedTransactions.length === 0) {
          toast('Nenhuma transação identificada no arquivo.', 'warning');
          return;
        }

        renderPreviewTable();
        previewContainer.style.display = 'block';
        updateConfirmButton();
      } catch (err) {
        console.error('Erro ao ler extrato:', err);
        toast('Erro ao processar arquivo: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  function renderPreviewTable() {
    countBadge.textContent = `${parsedTransactions.length} lançamentos encontrados no extrato`;

    tableWrapper.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted);">
            <th style="padding: 6px 8px; width: 30px;">✓</th>
            <th style="padding: 6px 8px;">Data</th>
            <th style="padding: 6px 8px;">Descrição</th>
            <th style="padding: 6px 8px;">Categoria</th>
            <th style="padding: 6px 8px;">Tipo</th>
            <th style="padding: 6px 8px; text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parsedTransactions.map(t => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${t.selected ? 'transparent' : 'rgba(0,0,0,0.2)'}; opacity: ${t.selected ? '1' : '0.5'};">
              <td style="padding: 6px 8px;">
                <input type="checkbox" class="import-chk" data-idx="${t.id_temp}" ${t.selected ? 'checked' : ''}>
              </td>
              <td style="padding: 6px 8px; white-space: nowrap; color: var(--text-muted);">${fmt.date(t.date)}</td>
              <td style="padding: 6px 8px; font-weight: 500;">
                <input type="text" class="import-desc-edit" data-idx="${t.id_temp}" value="${(t.description || '').replace(/"/g, '&quot;')}" style="background: transparent; border: 1px solid transparent; color: var(--text-primary); width: 100%; font-size: 12px;">
              </td>
              <td style="padding: 6px 8px;">
                <select class="import-cat-select" data-idx="${t.id_temp}" style="padding: 3px 6px; font-size: 11px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);">
                  ${allCategories.map(c => `<option value="${c.id}" ${c.id === t.category_id ? 'selected' : ''}>${c.icon || ''} ${c.name}</option>`).join('')}
                </select>
              </td>
              <td style="padding: 6px 8px;">
                <span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}" style="font-size: 10px;">${t.type === 'income' ? 'Receita' : 'Despesa'}</span>
              </td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 700; color: ${t.type === 'income' ? 'var(--accent-light)' : '#f87171'};">
                ${t.type === 'income' ? '+' : '-'}${fmt.currency(t.amount)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableWrapper.querySelectorAll('.import-chk').forEach(chk => {
      chk.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].selected = e.target.checked;
        renderPreviewTable();
        updateConfirmButton();
      };
    });

    tableWrapper.querySelectorAll('.import-desc-edit').forEach(input => {
      input.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].description = e.target.value.trim();
      };
    });

    tableWrapper.querySelectorAll('.import-cat-select').forEach(sel => {
      sel.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].category_id = parseInt(e.target.value);
      };
    });
  }

  function updateConfirmButton() {
    const selectedCount = parsedTransactions.filter(t => t.selected).length;
    confirmBtn.disabled = selectedCount === 0;
    confirmBtn.style.opacity = selectedCount === 0 ? '0.5' : '1';
    confirmBtn.textContent = `Confirmar Importação (${selectedCount} lançamentos)`;
  }

  toggleAllBtn.onclick = () => {
    const anyUnchecked = parsedTransactions.some(t => !t.selected);
    parsedTransactions.forEach(t => t.selected = anyUnchecked);
    renderPreviewTable();
    updateConfirmButton();
  };

  confirmBtn.onclick = async () => {
    const selectedItems = parsedTransactions.filter(t => t.selected);
    if (selectedItems.length === 0) return;

    const targetAccId = parseInt(document.getElementById('import-target-account').value);
    if (!targetAccId) {
      toast('Selecione uma conta de destino válida.', 'error');
      return;
    }

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Importando...';

      const res = await window.api.importer.importBatch({
        userId: State.user.id,
        accountId: targetAccId,
        transactions: selectedItems
      });

      if (res && res.success) {
        toast(`🎉 ${res.count} lançamentos importados com sucesso!`);
        Modal.close();
        renderAccounts();
      } else {
        toast('Erro ao importar: ' + (res?.error || 'Desconhecido'), 'error');
      }
    } catch (err) {
      toast('Erro ao importar extrato: ' + err.message, 'error');
    }
  };
}


/* ==== deduplication.js ==== */
/* ===
 * deduplication.js — L4719–5079 do app.js
 */

async function openDeduplicationModal() {
  const familyId = State.user.family_id || State.user.familyId || 1;
  const users = await window.api.auth.getUsers().catch(() => []);
  const accounts = await window.api.accounts.getAll(State.user.id).catch(() => []);

  let activeTab = 'pending'; // 'pending' or 'history'
  let filterUser = 'all';
  let filterConfidence = 'all';
  let filterAccount = 'all';

  async function loadData() {
    const duplicates = await window.api.sync.findDuplicates({ familyId, daysWindow: 90, minScore: 65 });
    const history = await window.api.sync.getHistory({ familyId, limit: 50 });
    return { duplicates: duplicates || [], history: history || [] };
  }

  const { duplicates: initialDups, history: initialHistory } = await loadData();

  function renderModalContent(dups, hist) {
    // Apply client-side filters on duplicates
    let filteredDups = dups.filter(d => {
      if (filterConfidence === 'exact' && d.score < 95) return false;
      if (filterConfidence === 'high' && (d.score < 80 || d.score >= 95)) return false;
      if (filterConfidence === 'medium' && d.score >= 80) return false;

      if (filterUser !== 'all') {
        const uId = parseInt(filterUser, 10);
        if (d.tx1.user_id !== uId && d.tx2.user_id !== uId) return false;
      }

      if (filterAccount !== 'all') {
        const accId = parseInt(filterAccount, 10);
        if (d.tx1.account_id !== accId && d.tx2.account_id !== accId) return false;
      }

      return true;
    });

    const exactCount = dups.filter(d => d.score >= 95).length;

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Tab Switcher -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          <button type="button" class="dedup-tab-btn ${activeTab === 'pending' ? 'active' : ''}" id="dedup-tab-pending">
            <span>🔍 Lançamentos Suspeitos</span>
            <span class="badge" style="font-size: 11px; padding: 2px 7px; background: rgba(0,0,0,0.2);">${dups.length}</span>
          </button>
          <button type="button" class="dedup-tab-btn ${activeTab === 'history' ? 'active' : ''}" id="dedup-tab-history">
            <span>📜 Histórico de Conciliações</span>
            <span class="badge" style="font-size: 11px; padding: 2px 7px; background: rgba(0,0,0,0.2);">${hist.length}</span>
          </button>
        </div>

        ${activeTab === 'pending' ? `
          <!-- Filters & Batch Actions Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <select id="filter-dedup-user" class="dedup-filter-select">
                <option value="all">👥 Todos os Membros</option>
                ${users.map(u => `<option value="${u.id}" ${filterUser == u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>

              <select id="filter-dedup-confidence" class="dedup-filter-select">
                <option value="all" ${filterConfidence === 'all' ? 'selected' : ''}>🎯 Todos os Níveis</option>
                <option value="exact" ${filterConfidence === 'exact' ? 'selected' : ''}>🟢 Altíssima Certeza (95-100%)</option>
                <option value="high" ${filterConfidence === 'high' ? 'selected' : ''}>🟡 Provável (80-94%)</option>
                <option value="medium" ${filterConfidence === 'medium' ? 'selected' : ''}>🔵 Suspeito (65-79%)</option>
              </select>

              <select id="filter-dedup-account" class="dedup-filter-select">
                <option value="all">🏦 Todas as Contas</option>
                ${accounts.map(a => `<option value="${a.id}" ${filterAccount == a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; gap: 8px;">
              ${exactCount > 0 ? `
                <button type="button" class="btn btn-sm" id="btn-batch-exact-merge" style="background: #10b981; color: #000; font-weight: 700; border-color: #10b981; padding: 6px 12px;">
                  ⚡ Mesclar Certezas (${exactCount})
                </button>
              ` : ''}
              <button type="button" class="btn btn-sm btn-primary" id="btn-batch-selected-merge" style="padding: 6px 12px;" disabled>
                🔗 Mesclar Selecionados (<span id="selected-dup-count">0</span>)
              </button>
            </div>
          </div>

          <!-- List of Duplicates -->
          ${filteredDups.length === 0 ? `
            <div style="text-align: center; padding: 36px 10px; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px dashed var(--border);">
              <div style="font-size: 40px; margin-bottom: 8px;">✨</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--accent-light);">Nenhuma Duplicidade Pendente!</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                ${dups.length > 0 ? 'Nenhum lançamento corresponde aos filtros selecionados acima.' : 'Todos os lançamentos do grupo familiar estão devidamente conciliados.'}
              </div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
              ${filteredDups.map((dup, idx) => {
                const t1 = dup.tx1;
                const t2 = dup.tx2;
                let badgeClass = 'dedup-badge-medium';
                let badgeText = `🔵 Suspeito (${dup.score}%)`;
                if (dup.score >= 95) {
                  badgeClass = 'dedup-badge-exact';
                  badgeText = `🟢 Altíssima Certeza (${dup.score}%)`;
                } else if (dup.score >= 80) {
                  badgeClass = 'dedup-badge-high';
                  badgeText = `🟡 Provável (${dup.score}%)`;
                }

                return `
                  <div class="card dedup-pair-card" style="border: 1px solid var(--border); background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--border); padding-bottom: 8px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" class="chk-dup-pair" data-pair-idx="${idx}" data-primary-id="${t1.id}" data-dup-id="${t2.id}" style="width: 16px; height: 16px; cursor: pointer;">
                        <span class="badge ${badgeClass}" style="font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 12px;">
                          ${badgeText}
                        </span>
                      </div>
                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">Par #${idx + 1}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                      <!-- Lançamento 1 -->
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                          <span>Lançamento A</span>
                          <span class="badge" style="font-size: 9px; padding: 1px 5px;">${t1.is_paid ? '✅ Pago' : '⏳ Pendente'}</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${t1.description || 'Sem descrição'}</div>
                        <div style="font-size: 14px; font-weight: 800; color: ${t1.type === 'expense' ? '#f87171' : 'var(--accent-light)'}; margin-bottom: 6px;">
                          ${fmt.currency(t1.amount)}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">📅 Data: <strong>${fmt.date(t1.date)}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">👤 Autor: <strong>${t1.user_name || 'Usuário'}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">🏦 Conta: <strong>${t1.account_name || 'Não informada'}</strong></div>
                      </div>

                      <!-- Lançamento 2 -->
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                          <span>Lançamento B</span>
                          <span class="badge" style="font-size: 9px; padding: 1px 5px;">${t2.is_paid ? '✅ Pago' : '⏳ Pendente'}</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${t2.description || 'Sem descrição'}</div>
                        <div style="font-size: 14px; font-weight: 800; color: ${t2.type === 'expense' ? '#f87171' : 'var(--accent-light)'}; margin-bottom: 6px;">
                          ${fmt.currency(t2.amount)}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">📅 Data: <strong>${fmt.date(t2.date)}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">👤 Autor: <strong>${t2.user_name || 'Usuário'}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">🏦 Conta: <strong>${t2.account_name || 'Não informada'}</strong></div>
                      </div>
                    </div>

                    <!-- Ações -->
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                      <button type="button" class="btn btn-secondary btn-sm btn-dismiss-dup" data-primary-id="${t1.id}" data-dup-id="${t2.id}">
                        ➕ Manter Ambos (Gastos Separados)
                      </button>
                      <button type="button" class="btn btn-primary btn-sm btn-merge-dup" data-primary-id="${t1.id}" data-dup-id="${t2.id}">
                        🔗 Mesclar em 1 Lançamento
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        ` : `
          <!-- History Tab -->
          ${hist.length === 0 ? `
            <div style="text-align: center; padding: 36px 10px; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px dashed var(--border);">
              <div style="font-size: 40px; margin-bottom: 8px;">📜</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary);">Nenhum Histórico de Conciliação</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                As ações de mesclagem e descarte de duplicatas realizadas pela família ficarão registradas aqui para auditoria.
              </div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
              ${hist.map(h => {
                const isMerged = h.status === 'merged';
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); gap: 12px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span class="badge" style="font-size: 10px; font-weight: 700; background: ${isMerged ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'}; color: ${isMerged ? '#10b981' : 'var(--text-muted)'}; border: 1px solid ${isMerged ? '#10b98144' : 'var(--border)'}">
                          ${isMerged ? '🔗 Mesclado' : '➕ Mantido Separado'}
                        </span>
                        <span style="font-size: 11px; color: var(--text-muted);">${fmt.time(h.updated_at)} • ${fmt.date(h.updated_at)}</span>
                      </div>
                      <div style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">
                        <strong>${h.tx1_desc || 'Lançamento A'}</strong> (${fmt.currency(h.tx1_amount)}) 
                        &nbsp;↔&nbsp; 
                        <strong>${h.tx2_desc || 'Lançamento B'}</strong> (${fmt.currency(h.tx2_amount)})
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `}
      </div>
    `;
  }

  function bindEvents(currentDups, currentHist) {
    const modalEl = document.getElementById('modal-content');
    if (!modalEl) return;

    // Tabs
    const tabPending = modalEl.querySelector('#dedup-tab-pending');
    const tabHistory = modalEl.querySelector('#dedup-tab-history');

    if (tabPending) {
      tabPending.onclick = () => {
        activeTab = 'pending';
        refreshUI();
      };
    }
    if (tabHistory) {
      tabHistory.onclick = () => {
        activeTab = 'history';
        refreshUI();
      };
    }

    // Filter changes
    const userSelect = modalEl.querySelector('#filter-dedup-user');
    const confSelect = modalEl.querySelector('#filter-dedup-confidence');
    const accSelect = modalEl.querySelector('#filter-dedup-account');

    if (userSelect) userSelect.onchange = () => { filterUser = userSelect.value; refreshUI(); };
    if (confSelect) confSelect.onchange = () => { filterConfidence = confSelect.value; refreshUI(); };
    if (accSelect) accSelect.onchange = () => { filterAccount = accSelect.value; refreshUI(); };

    // Checkboxes selection
    const chks = modalEl.querySelectorAll('.chk-dup-pair');
    const batchSelectedBtn = modalEl.querySelector('#btn-batch-selected-merge');
    const selectedCountSpan = modalEl.querySelector('#selected-dup-count');

    const updateSelectionState = () => {
      const selected = Array.from(chks).filter(c => c.checked);
      if (selectedCountSpan) selectedCountSpan.textContent = selected.length;
      if (batchSelectedBtn) batchSelectedBtn.disabled = selected.length === 0;
    };

    chks.forEach(chk => {
      chk.onchange = updateSelectionState;
    });

    // Batch Exact Merge (100% / 95%+)
    const batchExactBtn = modalEl.querySelector('#btn-batch-exact-merge');
    if (batchExactBtn) {
      batchExactBtn.onclick = async () => {
        const exactPairs = currentDups.filter(d => d.score >= 95).map(d => ({
          primaryTxId: d.tx1.id,
          duplicateTxId: d.tx2.id
        }));

        if (exactPairs.length === 0) return;
        batchExactBtn.disabled = true;
        batchExactBtn.textContent = 'Mesclando...';

        const res = await window.api.sync.mergeBatch({ pairs: exactPairs, userId: State.user.id });
        if (res && res.success) {
          toast(`⚡ ${res.mergedCount} pares com 100% de certeza mesclados com sucesso!`);
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast('Erro ao mesclar em lote', 'error');
          batchExactBtn.disabled = false;
        }
      };
    }

    // Batch Selected Merge
    if (batchSelectedBtn) {
      batchSelectedBtn.onclick = async () => {
        const selected = Array.from(chks).filter(c => c.checked);
        const pairs = selected.map(c => ({
          primaryTxId: parseInt(c.dataset.primaryId),
          duplicateTxId: parseInt(c.dataset.dupId)
        }));

        if (pairs.length === 0) return;
        batchSelectedBtn.disabled = true;
        batchSelectedBtn.textContent = 'Mesclando...';

        const res = await window.api.sync.mergeBatch({ pairs, userId: State.user.id });
        if (res && res.success) {
          toast(`🔗 ${res.mergedCount} pares mesclados com sucesso!`);
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast('Erro ao mesclar selecionados', 'error');
          batchSelectedBtn.disabled = false;
        }
      };
    }

    // Individual Merge
    modalEl.querySelectorAll('.btn-merge-dup').forEach(btn => {
      btn.onclick = async () => {
        const primaryTxId = parseInt(btn.dataset.primaryId);
        const duplicateTxId = parseInt(btn.dataset.dupId);
        btn.disabled = true;
        btn.textContent = 'Mesclando...';
        const res = await window.api.sync.mergeTransactions({ primaryTxId, duplicateTxId, userId: State.user.id });
        if (res && res.success) {
          toast('Lançamentos mesclados com sucesso!');
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast(res?.error || 'Erro ao mesclar lançamentos', 'error');
          btn.disabled = false;
          btn.textContent = '🔗 Mesclar em 1 Lançamento';
        }
      };
    });

    // Individual Dismiss
    modalEl.querySelectorAll('.btn-dismiss-dup').forEach(btn => {
      btn.onclick = async () => {
        const primaryTxId = parseInt(btn.dataset.primaryId);
        const duplicateTxId = parseInt(btn.dataset.dupId);
        btn.disabled = true;
        await window.api.sync.dismissDuplicate({ primaryTxId, duplicateTxId });
        toast('Lançamentos mantidos como despesas separadas.');
        const refreshed = await loadData();
        refreshUI(refreshed.duplicates, refreshed.history);
      };
    });
  }

  let currentDuplicates = initialDups;
  let currentHistory = initialHistory;

  function refreshUI(newDups, newHist) {
    if (newDups) currentDuplicates = newDups;
    if (newHist) currentHistory = newHist;
    const bodyHtml = renderModalContent(currentDuplicates, currentHistory);
    Modal.open('🛡️ Central de Conciliação & Anti-Duplicidade', bodyHtml, true);
    bindEvents(currentDuplicates, currentHistory);
  }

  refreshUI();
}

// ════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════

/* ==== budget-goals-reports.js ==== */
/* ===
 * budget-goals-reports.js — L5080–5377 do app.js
 */

async function renderBudget() {
  const page = document.getElementById('page-budget');
  const categories = await window.api.categories.getAll(State.user.id);
  const expCats = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const isAdmin = State.permissions.can_edit_all === 1;
  let users = [];
  if (isAdmin) {
    users = await window.api.auth.getUsers();
  } else {
    State.budgetUserId = State.user.id; // Guarantee restricted user views their own
  }

  const userDropdownHtml = isAdmin ? `
    <select id="budget-user-select" style="padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; outline: none; transition: all var(--transition);">
      ${users.map(u => `<option value="${u.id}" ${u.id === State.budgetUserId ? 'selected' : ''}>🧑‍💻 ${u.name}</option>`).join('')}
    </select>
  ` : '';

  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Orçamento</h2><p class="page-subtitle">Limite de gastos por categoria</p></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div id="budget-period"></div>
        ${userDropdownHtml}
        ${isAdmin ? `<button class="btn btn-primary" id="btn-set-budget">+ Definir limite</button>` : ''}
      </div>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
      💡 <strong>O que é e como funciona o Orçamento?</strong> Nesta seção, definimos <strong>limites de gastos propostos</strong> por categoria. À medida que registramos despesas, o progresso é exibido como feedback pedagógico para ajudar jovens e crianças a gerenciar e cooperar.
      <br><br>
      🎯 <strong>Conselho Didático:</strong> Como filhos cooperam e adicionam receitas (mesadas, presentes, etc.), o orçamento ajuda a tomar decisões de gastos saudáveis de forma consciente, promovendo diálogos em família!
    </p>
    <div class="budget-grid" id="budget-grid"><div style="text-align:center;padding:40px;color:var(--text-muted)">Carregando...</div></div>`;

  document.getElementById('budget-period').appendChild(buildPeriodSelector(renderBudget));
  
  if (isAdmin) {
    document.getElementById('btn-set-budget').onclick = () => openBudgetModal(expCats);
    const selectEl = document.getElementById('budget-user-select');
    selectEl.onchange = async () => {
      State.budgetUserId = parseInt(selectEl.value);
      await loadBudgets();
    };
  }

  await loadBudgets();

  async function loadBudgets() {
    const budgetsRaw = await window.api.budgets.getAll({ userId: State.budgetUserId, month: State.currentMonth, year: State.currentYear });
    const budgets = Array.isArray(budgetsRaw) ? budgetsRaw : [];
    const grid = document.getElementById('budget-grid');
    if (!grid) return;
    if (budgets.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div class="empty-title">Nenhum limite definido</div><div class="empty-desc">${isAdmin ? 'Defina um teto de gastos proposto para este membro da família' : 'Você ainda não possui limites propostos. Peça aos seus pais!'}</div></div>`;
      return;
    }
    grid.innerHTML = budgets.map(b => {
      const pct = b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0;
      const progressCls = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
      const isExceeded = pct >= 100;
      return `<div class="budget-card">
        <div class="budget-card-header">
          <span class="budget-icon">${b.icon}</span>
          <div>
            <div class="budget-name">${b.category_name}</div>
            ${isExceeded ? '<div style="font-size:11px;color:#f87171;font-weight:600">⚠️ Limite Ultrapassado</div>' : pct >= 80 ? '<div style="font-size:11px;color:var(--warning);font-weight:600">⚡ Quase lá</div>' : '<div style="font-size:11px;color:#10b981;font-weight:600">🟢 Saudável</div>'}
          </div>
          ${isAdmin ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="openBudgetModal(null,${b.category_id},${b.amount})" style="margin-left:auto">✏️</button>` : ''}
        </div>
        <div class="budget-values"><span>Gasto: <strong style="color:${isExceeded ? '#f87171' : 'var(--text-primary)'}">${fmt.currency(b.spent)}</strong></span><span>Proposto: ${fmt.currency(b.amount)}</span></div>
        <div class="budget-progress-bar"><div class="budget-progress-fill ${progressCls}" style="width:${pct}%"></div></div>
        <div class="budget-percent">${pct.toFixed(0)}% • ${b.amount - b.spent >= 0 ? 'Disponível: ' + fmt.currency(b.amount - b.spent) : 'Excedido: ' + fmt.currency(b.spent - b.amount)}</div>
      </div>`;
    }).join('');
  }
}

function openBudgetModal(cats, prefillCatId = null, prefillAmt = null) {
  Modal.open('Definir Orçamento Proposto', `
    <div class="form-group">
      <label>Categoria</label>
      ${cats ? `<select id="budget-cat">${cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</select>` : `<input type="text" disabled value="Categoria selecionada" id="budget-cat" data-id="${prefillCatId}">`}
    </div>
    <div class="form-group"><label>Limite Proposto mensal (R$)</label><input type="number" id="budget-amount" step="0.01" min="0" placeholder="0,00" value="${prefillAmt || ''}"></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="budget-cancel">Cancelar</button>
      <button class="btn btn-primary" id="budget-save">Salvar</button>
    </div>
  `);
  document.getElementById('budget-cancel').onclick = Modal.close;
  document.getElementById('budget-save').onclick = async () => {
    const catEl = document.getElementById('budget-cat');
    const category_id = prefillCatId || parseInt(catEl.value);
    const amount = parseFloat(document.getElementById('budget-amount').value);
    if (!category_id || !amount || amount <= 0) { toast('Preencha todos os campos', 'error'); return; }
    const res = await window.api.budgets.set({ user_id: State.budgetUserId, category_id, month: State.currentMonth, year: State.currentYear, amount });
    if (res && res.error) {
      toast('Erro ao salvar orçamento: ' + res.error, 'error');
      return;
    }
    toast('Orçamento proposto salvo');
    Modal.close();
    renderBudget();
  };
}

// ════════════════════════════════════════
// GOALS
// ════════════════════════════════════════
async function renderGoals() {
  const page = document.getElementById('page-goals');
  const goals = await window.api.goals.getAll(State.user.id);
  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Metas Financeiras</h2></div>
      <button class="btn btn-primary" id="btn-new-goal">+ Nova meta</button>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
      💡 <strong>O que é e como funcionam as Metas?</strong> As metas servem para planejar e poupar com foco em objetivos específicos (como reserva de emergência, viagens ou compras importantes). Você define um valor alvo e um prazo, e realiza aportes à medida que poupa.
      <br><br>
      🎯 <strong>O que colocar aqui?</strong> Insira sonhos e necessidades de curto, médio ou longo prazo. Defina o valor total que precisa acumular e uma data-alvo estimada para conquistar esse objetivo.
      <br><br>
      🚀 <strong>Implicação no Orçamento Pessoal/Familiar:</strong> Guardar dinheiro com um propósito claro transforma o hábito de poupar em algo motivador. Esta atitude desenvolve a disciplina financeira, protege sua família contra imprevistos com a reserva e evita o endividamento futuro, pois você planeja a compra antes de realizá-la.
    </p>
    ${goals.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">Nenhuma meta criada</div><div class="empty-desc">Reserva de emergência, viagem, carro...</div><button class="btn btn-primary" id="btn-new-goal-empty">+ Criar meta</button></div>` :
    `<div class="goals-grid">${goals.map(g => {
      const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
      return `<div class="goal-card">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${g.color}"></div>
        ${g.is_completed ? '<div class="goal-completed-badge">✅ Concluída</div>' : ''}
        <div class="goal-icon">${g.icon}</div>
        <div class="goal-name">${g.name}</div>
        <div class="goal-deadline">${g.deadline ? '📅 Até ' + fmt.date(g.deadline) : 'Sem prazo'}</div>
        <div class="goal-amounts"><div class="goal-current" style="color:${g.color}">${fmt.currency(g.current_amount)}</div><div class="goal-target">de ${fmt.currency(g.target_amount)}</div></div>
        <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${pct}%;background:${g.color}"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;align-items:center">
          <span class="goal-percent">${pct.toFixed(0)}%</span>
          <div style="display:flex;gap:4px">
            ${!g.is_completed ? `<button class="btn btn-primary btn-sm goal-deposit" data-id="${g.id}">+ Aporte</button>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon goal-edit" data-id="${g.id}">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon goal-delete" data-id="${g.id}">🗑</button>
          </div>
        </div>
      </div>`;
    }).join('')}</div>`}`;

  const btnNewGoal = document.getElementById('btn-new-goal');
  if (btnNewGoal) btnNewGoal.onclick = () => openGoalModal(null);
  const btnNewGoalEmpty = document.getElementById('btn-new-goal-empty');
  if (btnNewGoalEmpty) btnNewGoalEmpty.onclick = () => openGoalModal(null);
  document.querySelectorAll('.goal-deposit').forEach(btn => { btn.onclick = () => openGoalDepositModal(parseInt(btn.dataset.id), goals); });
  document.querySelectorAll('.goal-edit').forEach(btn => { btn.onclick = () => openGoalModal(goals.find(g => g.id === parseInt(btn.dataset.id))); });
  document.querySelectorAll('.goal-delete').forEach(btn => {
    btn.onclick = async () => { if (confirm('Excluir esta meta?')) { await window.api.goals.delete(parseInt(btn.dataset.id)); toast('Meta excluída'); renderGoals(); } };
  });
}

function openGoalModal(goal) {
  const isEdit = !!goal;
  Modal.open(isEdit ? 'Editar Meta' : 'Nova Meta', `
    <div class="form-group"><label>Nome</label><input type="text" id="goal-name" placeholder="Ex: Reserva de emergência, Viagem..." value="${goal?.name || ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Valor alvo (R$)</label><input type="number" id="goal-target" step="0.01" placeholder="0,00" value="${goal?.target_amount || ''}"></div>
      <div class="form-group"><label>Prazo</label><input type="date" id="goal-deadline" value="${goal?.deadline || ''}"></div>
    </div>
    <div class="form-group"><label>Ícone</label><div class="icon-picker" id="goal-icon-picker">${['🎯','✈️','🚗','🏠','💊','📚','💍','🎓','🏖️','💻','🎸','🌍','📱','🐕'].map(i => `<button class="icon-btn ${(goal?.icon || '🎯') === i ? 'selected' : ''}" data-icon="${i}">${i}</button>`).join('')}</div></div>
    <div class="form-group"><label>Cor</label><div class="color-picker" id="goal-color-picker">${COLORS.map(c => `<div class="color-swatch ${(goal?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}</div></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="goal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="goal-save">${isEdit ? 'Salvar' : 'Criar meta'}</button>
    </div>`);

  let icon = goal?.icon || '🎯', color = goal?.color || '#10b981';
  document.querySelectorAll('#goal-icon-picker .icon-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('#goal-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; }; });
  document.querySelectorAll('#goal-color-picker .color-swatch').forEach(sw => { sw.onclick = () => { document.querySelectorAll('#goal-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); color = sw.dataset.color; }; });
  document.getElementById('goal-cancel').onclick = Modal.close;
  document.getElementById('goal-save').onclick = async () => {
    const name = document.getElementById('goal-name').value.trim();
    const target_amount = parseFloat(document.getElementById('goal-target').value);
    if (!name || !target_amount || target_amount <= 0) { toast('Preencha nome e valor', 'error'); return; }
    const data = { user_id: State.user.id, name, target_amount, current_amount: goal?.current_amount || 0, deadline: document.getElementById('goal-deadline').value || null, color, icon };
    
    let res;
    if (isEdit) {
      data.id = goal.id;
      res = await window.api.goals.update(data);
      if (res && res.error) {
        toast('Erro ao atualizar meta: ' + res.error, 'error');
        return;
      }
      toast('Meta atualizada');
    } else {
      res = await window.api.goals.create(data);
      if (res && res.error) {
        toast('Erro ao criar meta: ' + res.error, 'error');
        return;
      }
      toast('Meta criada!');
    }
    Modal.close(); renderGoals();
  };
}

function openGoalDepositModal(goalId, goals) {
  const goal = goals.find(g => g.id === goalId);
  Modal.open(`Aporte — ${goal.icon} ${goal.name}`, `
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:36px">${goal.icon}</div><div style="color:var(--text-muted);font-size:13px">${fmt.currency(goal.current_amount)} de ${fmt.currency(goal.target_amount)}</div></div>
    <div class="form-group"><label>Valor (R$)</label><input type="number" id="dep-amount" step="0.01" min="0" placeholder="0,00" autofocus></div>
    <div class="form-group"><label>Observação</label><input type="text" id="dep-note" placeholder="Ex: Transferência do mês"></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="dep-cancel">Cancelar</button>
      <button class="btn btn-primary" id="dep-save">Confirmar aporte</button>
    </div>`);
  document.getElementById('dep-cancel').onclick = Modal.close;
  document.getElementById('dep-save').onclick = async () => {
    const amount = parseFloat(document.getElementById('dep-amount').value);
    if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
    await window.api.goals.addDeposit({ goal_id: goalId, amount, note: document.getElementById('dep-note').value, date: new Date().toISOString().split('T')[0] });
    toast('Aporte registrado! 🎉'); Modal.close(); renderGoals();
  };
}

// ════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════
async function renderReports() {
  const page = document.getElementById('page-reports');
  page.innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Relatórios</h2></div><div id="report-period"></div></div>
    <div class="report-tabs">
      <button class="report-tab active" data-tab="cashflow">Fluxo de Caixa</button>
      <button class="report-tab" data-tab="categories">Por Categoria</button>
      <button class="report-tab" data-tab="patrimony">Patrimônio</button>
    </div>
    <div id="report-content"></div>`;

  document.getElementById('report-period').appendChild(buildPeriodSelector(() => loadTab(currentTab)));
  let currentTab = 'cashflow';

  document.querySelectorAll('.report-tab').forEach(btn => {
    btn.onclick = () => { document.querySelectorAll('.report-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentTab = btn.dataset.tab; loadTab(currentTab); };
  });

  async function loadTab(tab) {
    const content = document.getElementById('report-content');
    if (tab === 'cashflow') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
          💡 <strong>Fluxo de Caixa:</strong> Este relatório apresenta a listagem completa de todas as receitas e despesas realizadas na competência selecionada, junto com o balanço consolidado do período. É a ferramenta ideal para você auditar a entrada e saída de recursos e verificar o saldo líquido exato de cada lançamento.
        </p>
        <div style="display:flex;gap:16px;margin-bottom:20px">
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Receitas</div><div style="font-size:20px;font-weight:800;color:var(--accent-light)">${fmt.currency(inc)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Despesas</div><div style="font-size:20px;font-weight:800;color:#f87171">${fmt.currency(exp)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Saldo</div><div style="font-size:20px;font-weight:800;color:${inc-exp>=0?'var(--accent-light)':'#f87171'}">${fmt.currency(inc-exp)}</div></div>
        </div>
        <div class="card"><div class="table-wrapper"><table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Tipo</th><th class="text-right">Valor</th></tr></thead>
          <tbody>${txs.length === 0 ? '<tr><td colspan="6" class="no-data">Sem lançamentos</td></tr>' :
            txs.map(t => `<tr>
              <td style="color:var(--text-muted)">${fmt.date(t.date)}</td>
              <td>${t.description || '—'}</td>
              <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
              <td>${t.account_name || '—'}</td>
              <td><span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
              <td class="text-right" style="font-weight:600;color:${t.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(t.amount)}</td>
            </tr>`).join('')}
          </tbody></table></div></div>`;
    } else if (tab === 'categories') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
          💡 <strong>Por Categoria:</strong> Analise as distribuições percentuais de despesas e receitas por área de custo, personalizando métricas, filtros de pagamento e modos de exibição gráfica.
        </p>
        <div class="card" id="categories-report-interactive-wrapper"></div>
      `;
      setupCategoryInteractiveChart('categories-report-interactive-wrapper', 'repCat', txs);
    } else {
      const data = await window.api.reports.getPatrimony({ userId: State.user.id });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #3b82f6; border-radius: var(--radius-sm);">
          💡 <strong>Evolução Patrimonial:</strong> Este gráfico de linha apresenta a evolução acumulada e progressiva do seu patrimônio (saldos somados de todas as suas contas bancárias líquidas, poupanças e caixas de dinheiro) nos últimos 12 meses. O objetivo é visualizar e acompanhar o crescimento saudável e progressivo do seu patrimônio como um todo.
        </p>
        <div class="chart-card" style="height:320px"><canvas id="chart-patrimony"></canvas></div>`;
      if (State.charts.patrimony) State.charts.patrimony.destroy();
      const vals = data.map(d => d.net);
      State.charts.patrimony = new Chart(document.getElementById('chart-patrimony'), { type: 'line', data: { labels: data.map(d => d.month), datasets: [{ label: 'Patrimônio', data: vals, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4 }] }, options: chartOptions('bar') });
    }
  }
  await loadTab('cashflow');
}

// ════════════════════════════════════════
// MANUAL DO USUÁRIO & WIKI (PÁGINA DEDICADA)
// ════════════════════════════════════════

/* ==== manual-a.js ==== */
/* manual-a.js - parte 1/2 */

/**
 * Retorna o HTML do menu em árvore (Sidebar) do Manual do Usuário
 */
function getManualSidebarHtml() {
  return `
    <!-- MENU EM ÁRVORE DE ASSUNTOS E SUBMENUS -->
    <div id="manual-tree-sidebar" style="width: 270px; min-width: 270px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; scrollbar-width: thin;">
      
      <!-- GRUPO 1: CARTÕES DE CRÉDITO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="cartoes" data-topic="cartao-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • Competência vs Vencimento
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Ciclo & Melhor Dia de Compra
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Limite Total vs Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento & Baixa Atômica
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-destaque" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 600; cursor: pointer; border-left: 2px solid transparent;">
            • ✨ Destaque Cromático de Parcelas (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Renegociação & Acordo de Faturas
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-reabertura" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Reabertura & Desfazer Quitação
          </div>
        </div>
      </div>

      <!-- GRUPO 2: DASHBOARD & PAINEL DE CONTROLE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="dashboard" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #fb923c; background: rgba(249,115,22,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📊 Dashboard & Painel</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-modos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fb923c; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🎛️ 3 Modos de Dashboard (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-filtros-membros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #60a5fa; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 👥 Filtros de Membros & Titularidade
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-kpis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 📊 Indicadores Principais (KPIs & Sincronia)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-pendencias-anteriores" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fbbf24; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • ⚠️ Pendências de Meses Anteriores (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-alertas-coloridos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #34d399; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🚦 Alertas Diferenciados (Receitas vs Despesas)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-cards-limites" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fb923c; font-weight: 600; cursor: pointer; border-left: 2px solid transparent;">
            • 💳 Cartões, Faturas & Limites Reais
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-contas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🏦 Contas Bancárias & Cheque Especial
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-links" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🚨 Faixa de Avisos & Links Diretos
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-prioridades" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • ⭐ Prioritários, A Pagar & Pagas
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-graficos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 📈 Gráficos de Fluxo & Categorias
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-consolidado" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🌐 Visão Geral, Metas & Patrimônio
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-contraste" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🎨 Modos de Contraste & Usabilidade
          </div>
        </div>
      </div>

      <!-- GRUPO 3: DESPESAS & RECEITAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #34d399; background: rgba(16,185,129,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📌 Despesas & Receitas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Competência (Ref: MM/AAAA)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-fixas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Fixas & Prioridade ⭐
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-avulsos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Variáveis (Avulsas)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-nfce-qr" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #10b981; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 📷 Leitor de Nota Fiscal (QR Code) (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-similares" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fbbf24; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🔔 Alerta de Similar em Tempo Real (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Juros, Multas e Descontos
          </div>
        </div>
      </div>

      <!-- GRUPO 4: CONTAS & CARTEIRAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #06b6d4; background: rgba(6,182,212,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 Contas, Vouchers & Bancos</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-tipos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tipos de Contas Bancárias
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-beneficio" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #06b6d4; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🎟️ Cartões Benefício & Vouchers (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transf" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Transferências sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-produtos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Produtos da Conta & Limites
          </div>
        </div>
      </div>

      <!-- GRUPO 5: FAMÍLIA & PERMISSÕES -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="familia" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #a78bfa; background: rgba(167,139,250,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>👨‍👩‍👧 Família & Permissões</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Papéis de Usuário (ADM, etc)
          </div>
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-permissoes" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Permissões Granulares por Menu
          </div>
        </div>
      </div>

      <!-- GRUPO 6: SINCRONIZAÇÃO & ANTI-DUPLICIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="sync" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🛡️ Sincronização & Anti-Duplicidade</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-uuid" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🔑 UUIDs & Multi-Aparelho
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-receitas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #34d399; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 💰 Regra de Receitas & Mesma Conta (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-dedup" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🧠 Motor Heurístico & Dívidas
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-conciliacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • ⚖️ Central de Conciliação & Ações em Lote
          </div>
        </div>
      </div>

      <!-- GRUPO 7: ORÇAMENTOS & METAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamentos" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f43f5e; background: rgba(244,63,94,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 Orçamentos & Metas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-budgets" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tetos de Gastos por Categoria
          </div>
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Metas Financeiras & Aportes
          </div>
        </div>
      </div>

      <!-- GRUPO 8: METODOLOGIA 50-30-20 -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="metodologia" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #c084fc; background: rgba(192,132,252,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💡 Metodologia 50-30-20</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="metodologia" data-topic="met-regra" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Como Dividir o Orçamento Familiar
          </div>
        </div>
      </div>

      <!-- GRUPO 9: ARQUITETURA MODULAR & DESENVOLVIMENTO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="arquitetura" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #eab308; background: rgba(234,179,8,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏗️ Arquitetura & Manutenção</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="arquitetura" data-topic="arq-modular" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #eab308; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • ⚡ Modularização (< 1000 Linhas) & Build
          </div>
        </div>
      </div>

      <!-- GRUPO 10: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f87171; background: rgba(248,113,113,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ FAQ (Perguntas)</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-interativo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Dúvidas Frequentes (Clique e Veja)
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos 1 a 5 do painel de conteúdo
 */
function getManualTopicsPart1Html() {
  return `
    <!-- TÓPICO 1.1: CARTÕES > COMPETÊNCIA VS VENCIMENTO -->
    <div class="manual-topic-content" id="topic-cartao-competencia" style="display: block;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        📅 Competência da Fatura vs Data de Vencimento
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conceito Fundamental:</strong> A <em>competência</em> é o mês em que a despesa ou o ciclo da fatura ocorreu (ex: compras feitas até 25/02 pertencem à competência <code>Ref: 02/2026</code>). O <em>vencimento</em> é o dia limite para pagar o boleto do banco (ex: <code>05/03/2026</code>).
        </div>
        <p style="margin-bottom: 10px;">No FinançasFamília, as faturas e compras são organizadas por <strong>Mês de Referência</strong> para que você saiba exatamente o quanto consumiu no período, mantendo o controle do fluxo de caixa e o cumprimento do orçamento.</p>
      </div>
    </div>

    <!-- TÓPICO 1.2: CARTÕES > CICLO & MELHOR DIA -->
    <div class="manual-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        🛒 Ciclo de Fechamento & Melhor Dia de Compra
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como Funciona o Fechamento:</strong> Todo cartão possui um <em>Dia de Fechamento (Corte)</em> e um <em>Dia de Vencimento</em>.
        </div>
        <p style="margin-bottom: 8px;">• <strong>Antes do Fechamento:</strong> Compras feitas até o dia de corte entram na fatura do mês atual.</p>
        <p style="margin-bottom: 8px;">• <strong>Melhor Dia de Compra (Após o Fechamento):</strong> Compras realizadas a partir do dia seguinte ao corte caem automaticamente na fatura do mês subsequente, dando até 40 dias para pagar!</p>
        <p style="margin: 0;">• <strong>Cálculo Automático:</strong> O aplicativo calcula e projeta cada parcela no mês exato da fatura de acordo com o dia da compra.</p>
      </div>
    </div>

    <!-- TÓPICO 1.3: CARTÕES > LIMITE TOTAL VS COMPROMETIDO -->
    <div class="manual-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        📊 Limite Total vs Limite Comprometido
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O limite do cartão é gerenciado de forma contínua:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li><strong>Limite Total:</strong> Valor máximo liberado pelo banco (ex: R$ 5.000,00).</li>
          <li><strong>Limite Comprometido:</strong> Soma de todas as compras parceladas futuras e faturas abertas que ainda não foram pagas.</li>
          <li><strong>Limite Disponível:</strong> <code>Limite Total - Limite Comprometido</code>. Conforme as faturas são pagas, o limite é liberado proporcionalmente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.4: CARTÕES > PAGAMENTO DA FATURA -->
    <div class="manual-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        💳 Pagamento & Baixa Atômica da Fatura
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao quitar uma fatura de cartão de crédito:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique no botão verde <strong>"Pagar Fatura"</strong> no card do cartão.</li>
          <li>Selecione a <strong>Conta Bancária Pagadora</strong> de onde o dinheiro sairá.</li>
          <li>Confirme a data de pagamento e o valor (total ou parcial).</li>
        </ol>
        <p style="margin: 0;">O sistema baixa a fatura, debita da sua conta bancária e <strong>marca atomicamente todas as compras e parcelas atreladas àquela fatura como pagas</strong>!</p>
      </div>
    </div>

    <!-- TÓPICO 1.5: CARTÕES > DESTAQUE CROMÁTICO DE PARCELAS (NOVO) -->
    <div class="manual-topic-content" id="topic-cartao-destaque" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>✨ Destaque Cromático Inteligente de Parcelas</span>
        <span class="badge badge-blue">Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56,189,248,0.08); border-left: 4px solid var(--accent); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Auditoria Visual Instantânea:</strong> Chega de perder tempo procurando quais compras pertencem a qual fatura!
        </div>
        <p style="margin-bottom: 10px;">Ao clicar sobre qualquer card de fatura na tela de Planejamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>🎨 <strong>Realce de Cor Oficial:</strong> Todas as despesas e compras parceladas vinculadas àquela fatura são imediatamente iluminadas com a <strong>cor tema e borda personalizada do cartão/banco</strong>.</li>
          <li>🔍 <strong>Foco Automático:</strong> Os lançamentos que não pertencem ao cartão são atenuados suavemente, e a tela rola automaticamente até a primeira parcela da fatura.</li>
          <li>🏷️ <strong>Badge Explicativa:</strong> Um selo visual exibe <code>📍 Parcela desta Fatura</code> ao lado de cada item destacado.</li>
          <li>↩️ <strong>Desativar:</strong> Basta clicar novamente no card da fatura para retornar à visualização normal.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.6: CARTÕES > RENEGOCIAÇÃO E ACORDO -->
    <div class="manual-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
        🤝 Renegociação & Acordo de Faturas
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você precisou parcelar a fatura com o banco ou fazer um acordo:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique no botão roxo <strong>"Renegociar / Acordo"</strong> no card da fatura.</li>
          <li>Informe o valor de entrada (se houver) e o número de parcelas acordadas com os juros.</li>
          <li>A fatura atual é liquidada como <span class="badge badge-purple">Acordo / Renegociada</span> e o sistema <strong>injeta automaticamente as parcelas do acordo nos meses futuros</strong> como despesas recorrentes transparentes.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.7: CARTÕES > REABERTURA DE FATURA -->
    <div class="manual-topic-content" id="topic-cartao-reabertura" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        🔓 Reabertura de Fatura & Estorno Seguro
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você deu baixa ou renegociou uma fatura por engano:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Reabrir Fatura"</strong>.</li>
          <li>O valor pago é <strong>estornado de volta para o saldo da sua conta bancária</strong>.</li>
          <li>Se houve renegociação, as parcelas futuras geradas pelo acordo são canceladas e removidas.</li>
          <li>A fatura volta para o estado <span class="badge badge-yellow">⏳ Aberta</span> e recalcula seu valor total automaticamente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.0A: DASHBOARD > 3 MODOS DE LAYOUT (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-modos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎛️ 3 Modos de Visualização do Dashboard</span>
        <span class="badge badge-yellow">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Personalize a Experiência Visual Conforme sua Preferência:</strong>
        </div>
        <p style="margin-bottom: 10px;">Você pode alternar o layout do Dashboard a qualquer momento pelo menu <strong>Configurações ⚙️ &gt; Geral</strong> ou pelo seletor rápido no topo da tela:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🌟 <strong>1. Executivo por Zonas (Padrão):</strong> Visão 360° com KPIs consolidados, pílulas de ação rápida, previsão de cartões e contas com filtro de membros e o Painel Kanban 3 colunas.</li>
          <li>📑 <strong>2. Sub-Abas Operacionais:</strong> Reduz a rolagem vertical agrupando os dados em 3 abas temáticas focadas (<em>📋 Operação</em>, <em>💳 Cartões & Bancos</em> e <em>📈 Gráficos</em>).</li>
          <li>🎛️ <strong>3. Cockpit Integrado:</strong> Layout otimizado com barra de filtros no topo em linha, quadro de Cartões e Contas logo abaixo em largura total, KPIs sincronizados, Painel Kanban 3 colunas em 100% de largura e Gráficos no rodapé.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.0B: DASHBOARD > FILTROS DE MEMBROS E TITULARIDADE (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-filtros-membros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>👥 Barra Superior de Filtros por Membro & Titularidade Efetiva</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Visão Familiar e Individual com 1 Clique:</strong>
        </div>
        <p style="margin-bottom: 10px;">A barra superior em linha (<code>dash-top-filter-bar</code>) permite filtrar instantaneamente todos os índices, cartões, alertas e contas do mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>👨‍👩‍👧 <strong>Toda a Família:</strong> Consolida a soma global de todos os familiares do grupo.</li>
          <li>👤 <strong>Filtro por Membro Individual:</strong> Ao clicar no chip de um membro (ex: <em>William, Jennifer, etc.</em>), todos os KPIs, gráficos, alertas de vencimento e colunas do Kanban se ajustam para exibir apenas os lançamentos daquele titular.</li>
          <li>🛡️ <strong>Titularidade Inteligente de Contas & Extratos:</strong> Mesmo que um extrato bancário (OFX/CSV) seja importado pelo Administrador da família, o sistema atribui as transações ao proprietário efetivo da conta bancária/cartão, garantindo que os filtros mostrem os dados perfeitamente.</li>
          <li>💳 <strong>Filtro por Tipo de Produto:</strong> Alterne rapidamente entre <em>Tudo</em>, <em>Cartões de Crédito</em> ou <em>Contas Correntes/Poupanças</em>.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.1: DASHBOARD > KPIS PRINCIPAIS -->
    <div class="manual-topic-content" id="topic-dash-kpis" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 Indicadores Principais de Fluxo de Caixa (KPIs & Sincronia)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Sincronização Matemática 100% Precisa com o Painel Kanban:</strong>
        </div>
        <p style="margin-bottom: 10px;">Os 4 cards de topo do Dashboard resumem com exatidão a competência financeira selecionada, sincronizados com as colunas operacionais:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Receitas (Pagas):</strong> Soma de todas as entradas e rendimentos recebidos no mês.</li>
          <li>🔴 <strong>Despesas (Pagas):</strong> Soma das contas já quitadas no mês, correspondendo exatamente ao total da coluna <em>✅ Contas Pagas</em> do Kanban.</li>
          <li>⏳ <strong>À Pagar (Pendentes):</strong> Montante total das contas em aberto do mês, correspondendo exatamente à coluna <em>⏳ A Pagar</em> do Kanban.</li>
          <li>⚖️ <strong>Saldo do Mês:</strong> Diferença matemática direta <code>Receitas Pagas - Despesas Pagas</code>.</li>
        </ul>
        <p style="margin: 0;">📊 <strong>Barra de Progresso de Contas:</strong> Indica a proporção exata de despesas quitadas em relação ao total de despesas do mês (ex: <em>8 de 20 pagas • 40%</em>).</p>
      </div>
    </div>

    <!-- TÓPICO 2.2: DASHBOARD > PENDÊNCIAS DE MESES ANTERIORES (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-pendencias-anteriores" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fbbf24; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚠️ Container de Pendências de Meses Anteriores Não Pagas</span>
        <span class="badge badge-yellow">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Rastreamento Ativo de Dívidas e Contas Esquecidas do Passado:</strong>
        </div>
        <p style="margin-bottom: 10px;">Sempre que você estiver visualizando o Dashboard de um mês (ex: <em>Agosto/2026</em>) e existirem lançamentos de meses anteriores (ex: <em>Julho, Junho ou Janeiro</em>) que ainda não foram pagos (<code>is_paid = 0</code>), o sistema exibe automaticamente um container temático de alerta:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔢 <strong>Contador de Pendências & Total Acumulado:</strong> Informa a quantidade exata de itens em atraso e a soma monetária total das dívidas passadas em aberto.</li>
          <li>📅 <strong>Identificação de Origem:</strong> Cada item exibe uma badge colorida com o mês/ano de competência original (ex: <code>📅 Julho/2026</code>), a descrição, o titular e o banco.</li>
          <li>🎯 <strong>Navegação Direta com 1 Clique:</strong> Ao clicar em qualquer pendência, o aplicativo altera o seletor do mês para a data de origem, abre o Planejamento na aba correta e aplica um <strong>pulso de luz (*glow flash*)</strong> sobre o lançamento para você localizá-lo e dar baixa imediatamente!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.3: DASHBOARD > ALERTAS CROMÁTICOS (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-alertas-coloridos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚦 Diferenciação Cromática Inteligente na Faixa de Avisos</span>
        <span class="badge badge-green">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Separação Visual Clara entre o que Entra e o que Sai:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para evitar confusão visual entre contas a pagar e receitas a receber:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong style="color: var(--accent-light);">💰 Faixa Verde (Recebimentos Próximos):</strong> Destaca exclusivamente salários, aluguéis, pro-labores e rendimentos previstos para os próximos dias, com chips verdes clicáveis.</li>
          <li>🔴 <strong style="color: #f87171;">🚨 Faixa Vermelha (Vencimentos Próximos):</strong> Alerta sobre contas fixas, faturas e parcelas prestes a vencer para evitar atrasos e juros.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.4: DASHBOARD > CARTÕES, FATURAS E LIMITES (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-cards-limites" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 Previsibilidade de Cartões, Faturas & Limites Reais</span>
        <span class="badge badge-blue">Recurso Aprimorado</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Auditoria e Previsibilidade de Limites Bancários:</strong>
        </div>
        <p style="margin-bottom: 10px;">Cada cartão de crédito exibido no quadro <strong>"🏦 Previsibilidade de Contas e Cartões"</strong> traz informações vitais e transparentes:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💳 <strong>Limite Total:</strong> O limite de crédito contratado e cadastrado no banco (ex: <code>R$ 5.000,00</code>).</li>
          <li>🔴 <strong>Fatura do Mês:</strong> O valor exato das compras e parcelas que vencem na fatura do mês selecionado (ex: <code>R$ 1.004,05</code>).</li>
          <li>🟠 <strong>Comprometido Total:</strong> A soma global de <strong>todas as compras e parcelas futuras em aberto</strong> que já consom o limite do seu cartão (ex: <code>R$ 5.824,30</code>).</li>
          <li>🟢/🔴 <strong>Disponível / Excedido:</strong> Saldo livre real calculado como <code>Limite Total - Comprometido Total</code>. Se você realizou compras parceladas superiores ao limite, o saldo é exibido em <strong>vermelho com valor negativo</strong> (ex: <code>-R$ 824,30</code>) e badge <span class="badge badge-danger">⚠️ LIMITE EXCEDIDO</span>.</li>
          <li>🍩 <strong>Spinner / Donut SVG Interativo:</strong> O gráfico de rosca exibe o percentual real de utilização do cartão (inclusive valores como <code>116% ULTRAPASSADO</code> ou <code>126% ULTRAPASSADO</code> envolto por anel tracejado de perigo).</li>
          <li>🔒 <strong>Fechamento & Vencimento:</strong> Exibe os dias exatos de corte da fatura e data de débito.</li>
          <li>✨ <strong>Clique no Card:</strong> Ao clicar sobre qualquer card de cartão no Dashboard, o aplicativo abre o Planejamento e <strong>destaca todas as parcelas da fatura com a cor oficial do banco</strong>!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.3: DASHBOARD > CONTAS BANCÁRIAS E CHEQUE ESPECIAL -->
    <div class="manual-topic-content" id="topic-dash-contas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>🏦 Previsibilidade de Contas Correntes, Poupanças & Cheque Especial</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Os widgets de contas correntes, contas de pagamento e carteiras exibem:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💰 <strong>Saldo Atual em Conta:</strong> O saldo líquido real conciliado no banco.</li>
          <li>🛡️ <strong>Limite de Cheque Especial (LIS):</strong> Limite de crédito rotativo configurado para a conta.</li>
          <li>⚡ <strong>Saldo Disponível Operacional:</strong> Total utilizável imediatamente <code>(Saldo em Conta + Cheque Especial)</code>.</li>
          <li>👤 <strong>Identificação de Titularidade:</strong> Cada conta traz o badge cromático do membro da família responsável (ex: <em>William, Jennifer, Isabel</em>).</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.4: DASHBOARD > AVISOS & LINKS DIRETOS (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-links" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚨 Faixa de Avisos & Links Diretos para Lançamentos</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Diferenciação Cromática de Alertas & Navegação Instantânea:</strong>
        </div>
        <p style="margin-bottom: 10px;">Os avisos de proximidade (próximos 3 dias) são separados visualmente por tipo de fluxo financeiro:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Recebimentos Próximos (Faixa Verde 💰):</strong> Salários, pró-labore, pensões e receitas a receber nos próximos dias aparecem em <strong>chips verdes esmeralda</strong>, transmitindo tranquilidade e previsão de caixa positivo.</li>
          <li>🔴 <strong>Vencimentos Próximos (Faixa Vermelha 🚨):</strong> Boletos, contas fixas, faturas e despesas a pagar nos próximos dias aparecem em <strong>chips vermelhos de alerta</strong> para evitar atrasos e juros.</li>
          <li>⚡ <strong>Navegação Instantânea:</strong> Cada chip é um link direto clicável. Ao clicar, o aplicativo abre o <strong>Planejamento</strong>, faz rolagem suave e aplica um <strong>efeito pulsante (*glow flash*)</strong> sobre a conta!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.5: DASHBOARD > PRIORIDADES, A PAGAR E PAGAS -->
    <div class="manual-topic-content" id="topic-dash-prioridades" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>⭐ Quadros de Prioridades, Contas a Pagar e Contas Pagas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No centro do Dashboard, três colunas organizam a rotina operacional do mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⭐ <strong>Prioritários:</strong> Reúne todas as contas marcadas com estrela de prioridade indispensável no mês, facilitando que você não deixe passar compromissos críticos.</li>
          <li>⏳ <strong>Contas a Pagar:</strong> Todas as despesas pendentes do mês ordenadas cronologicamente por proximidade da data de vencimento.</li>
          <li>✓ <strong>Contas Pagas:</strong> Histórico de despesas já quitadas com indicação da conta bancária de onde o recurso saiu.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.6: DASHBOARD > GRÁFICOS INTERATIVOS -->
    <div class="manual-topic-content" id="topic-dash-graficos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>📈 Gráficos de Fluxo de Caixa & Distribuição por Categoria</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O Dashboard conta com gráficos interativos que facilitam a tomada de decisão:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📊 <strong>Evolução Mensal (Barras):</strong> Compara visualmente as Receitas vs. Despesas ao longo dos últimos meses, permitindo enxergar tendências de economia ou aperto financeiro.</li>
          <li>🍩 <strong>Despesas por Categoria (Rosca):</strong> Aponta visualmente em que áreas o dinheiro da família está sendo alocado (ex: <em>Moradia, Alimentação, Educação, Transporte, Saúde, Lazer</em>), com valores e percentuais.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.7: DASHBOARD > VISÃO GERAL, METAS E PATRIMÔNIO -->
    <div class="manual-topic-content" id="topic-dash-consolidado" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>🌐 Aba Visão Geral, Metas & Patrimônio Líquido</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Consolidação Patrimonial e Objetivos de Poupança:</strong>
        </div>
        <p style="margin-bottom: 10px;">Na aba <strong>"🌐 Visão Geral"</strong> no topo do Dashboard:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏛️ <strong>Patrimônio Líquido Consolidado:</strong> Soma o saldo real de todas as contas correntes, poupanças e investimentos, deduzindo os compromissos em aberto nos cartões de crédito e cheques especiais.</li>
          <li>🎯 <strong>Objetivos & Cofrinhos:</strong> Acompanhamento do progresso percentual e financeiro de cada meta de poupança (ex: <em>Reserva de Emergência, Viagem em Família, Reforma</em>).</li>
          <li>🏦 <strong>Saldos e Faturas Reais Atuais:</strong> Exibição do estado patrimonial de cada conta do grupo familiar.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.8: DASHBOARD > CONTRASTE & ACESSIBILIDADE -->
    <div class="manual-topic-content" id="topic-dash-contraste" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎨 Modos de Visualização & Alto Contraste</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O Dashboard e todos os controles foram projetados para alta legibilidade:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li><strong>Modo Claro:</strong> Contornos nítidos (<code>border: 1.5px solid #94a3b8</code>), fundo sólido branco e tipografia em alto contraste sem desbotamento.</li>
          <li><strong>Modo Escuro:</strong> Elementos em tons escuros refinados com brilho esmeralda e contrastes calibrados para não cansar a vista.</li>
          <li><strong>Controles de Busca e Filtro:</strong> Bordas com feedback luminoso (*focus ring*) ao clicar para digitação ou ordenação.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 3.1: LANÇAMENTOS > COMPETÊNCIA -->
    <div class="manual-topic-content" id="topic-lanc-competencia" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
        📋 Mês de Referência (Competência: Ref: MM/AAAA)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O app permite controlar tanto a data de pagamento quanto o mês de competência:</p>
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
          <strong>Exemplo de Conta de Energia:</strong><br>
          • Consumo do mês de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>).<br>
          • Vencimento do boleto em <strong>10 de Março</strong> (Data de Pagamento: <code>10/03/2026</code>).
        </div>
        <p style="margin: 0;">Isso garante que ao emitir relatórios de gastos mensais, o custo seja computado no mês em que o consumo realmente ocorreu.</p>
      </div>
    </div>

    <!-- TÓPICO 3.2: LANÇAMENTOS > FIXAS -->
    <div class="manual-topic-content" id="topic-lanc-fixas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
        ⭐ Despesas Fixas (Recorrentes) & Prioridades
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Despesas fixas são aquelas que se repetem todo mês (Aluguel, Internet, Mensalidade Escolar, Financiamento):</p>
        <p style="margin-bottom: 8px;">• <strong>Estrela de Prioridade ⭐:</strong> Marque despesas essenciais com estrela para que fiquem no topo da lista.</p>
        <p style="margin: 0;">• <strong>Adiar Vencimento:</strong> Permite empurrar o vencimento de uma conta para frente se o orçamento do mês estiver apertado.</p>
      </div>
    </div>

    <!-- TÓPICO 3.3: LANÇAMENTOS > AVULSOS -->
    <div class="manual-topic-content" id="topic-lanc-avulsos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
        🛍️ Despesas Variáveis do Mês (Avulsas)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Gastos esporádicos do dia a dia (Supermercado, Farmácia, Restaurante, Combustível):</p>
        <p style="margin: 0;">Clique no botão roxo <code>+ Nova Variável</code> em qualquer momento para registrar uma compra rápida, escolhendo a categoria, conta/cartão e quem realizou o gasto.</p>
      </div>
    </div>

    <!-- TÓPICO 3.3B: LANÇAMENTOS > ALERTA DE SIMILARES EM TEMPO REAL -->
    <div class="manual-topic-content" id="topic-lanc-similares" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fbbf24; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔔 Alerta Inteligente de Lançamento Similar em Tempo Real</span>
        <span class="badge badge-yellow">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Prevenção Ativa Contra Cadastros Duplicados Acidentais:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao preencher os formulários de <strong>Novo Lançamento Avulso</strong> ou <strong>Despesa Fixa Recorrente</strong>, o sistema analisa instantaneamente os dados digitados:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⚡ <strong>Verificação Automática:</strong> Conforme você digita o valor, a data, a conta e a descrição, o motor busca se já existe um lançamento com características idênticas ou muito próximas.</li>
          <li>⚠️ <strong>Aviso Visual em Destaque:</strong> Se houver similaridade, surge um banner amarelo no formulário informando: <em>"Atenção: Já existe um lançamento similar [Descrição] no valor de R$ X,XX na conta [Banco]..."</em>.</li>
          <li>🔒 <strong>Segurança e Liberdade:</strong> O aviso não impede você de salvar caso seja uma compra legítima repetida, mas evita que você lance duas vezes a mesma conta por engano.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 3.3C: LANÇAMENTOS > LEITOR DE NOTA FISCAL (QR CODE) -->
    <div class="manual-topic-content" id="topic-lanc-nfce-qr" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📷 Leitura de Notas Fiscais (NFC-e / SAT / Pix) via Câmera</span>
        <span class="badge badge-green">Recurso Inovador</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Cadastro Instantâneo de Despesas Apontando a Câmera para o Cupom Fiscal:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para lançar gastos de supermercado, farmácia, restaurantes e postos de combustível sem precisar digitar nada manualmente:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🎯 <strong>Como Usar:</strong> Clique no botão <code>📷 Ler Nota Fiscal</code> no Dashboard, no Planejamento ou dentro do formulário de Novo Lançamento.</li>
          <li>📱 <strong>Câmera ao Vivo:</strong> Aponte o celular ou webcam para o QR Code quadrado impresso no final da sua Nota Fiscal de Consumidor (NFC-e) ou cupom SAT.</li>
          <li>⚡ <strong>Preenchimento Automático:</strong> O app decodifica a nota junto à SEFAZ e preenche instantaneamente o <strong>Valor Total (R$)</strong>, a <strong>Data de Emissão</strong>, o <strong>Nome do Estabelecimento</strong>, a <strong>Categoria Sugerida</strong> e o <strong>Número da Nota Fiscal</strong>.</li>
          <li>📁 <strong>Foto da Nota ou Chave de 44 Dígitos:</strong> Se preferir, você também pode carregar uma foto da galeria/arquivo ou colar o link/chave da nota.</li>
          <li>🛡️ <strong>Anti-Duplicidade Ativa:</strong> O sistema confere em tempo real se aquele cupom fiscal já foi lido antes para proteger contra lançamentos repetidos.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 3.4: LANÇAMENTOS > JUROS & DESCONTOS -->
    <div class="manual-topic-content" id="topic-lanc-juros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
        🏷️ Juros, Multas e Descontos Antecipados
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <strong>Desconto:</strong> Ao pagar antecipado com desconto, o sistema debita do saldo da conta apenas o valor líquido real.</p>
        <p style="margin: 0;">• <strong>Juros / Multa:</strong> Ao pagar em atraso, registre o acréscimo para que o valor real debitado corresponda exatamente ao extrato do banco.</p>
      </div>
    </div>

    <!-- TÓPICO 4.1: CONTAS > TIPOS -->
    <div class="manual-topic-content" id="topic-contas-tipos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
        🏦 Tipos de Contas Bancárias & Carteiras
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <span class="badge badge-blue">Conta Corrente</span>: Banco do Brasil, Itaú, Nubank, etc.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-green">Poupança / Investimentos</span>: Reserva de emergência e aplicações.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-yellow">Carteira Física</span>: Dinheiro em espécie na mão.</p>
        <p style="margin: 0;">• <span class="badge badge-cyan">Voucher</span>: Vale Refeição / Alimentação (Alelo, Ticket, Sodexo).</p>
      </div>
    </div>

    <!-- TÓPICO 4.2: CONTAS > CARTÕES BENEFÍCIO & VOUCHERS (NOVO) -->
    <div class="manual-topic-content" id="topic-contas-beneficio" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎟️ Cartões Benefício, Vouchers e Alimentação</span>
        <span class="badge badge-cyan">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(6, 182, 212, 0.08); border-left: 4px solid #06b6d4; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Controle Completo de Saldos e Recargas Mensais de Benefícios:</strong>
        </div>
        <p style="margin-bottom: 10px;">O FinançasFamília possui suporte nativo para operadoras de benefícios corporativos e flexíveis:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏷️ <strong>Operadoras Suportadas:</strong> Flash, Caju, Alelo, Banricard, Swile, Ticket, Sodexo, VR, Ben Visa Vale, etc.</li>
          <li>🍴 <strong>Modalidades Específicas:</strong> Alimentação (VA), Refeição (VR), Transporte (VT), Flexível / Multibenefícios, Combustível, Saúde/Farmácia e Educação.</li>
          <li>💵 <strong>Recarga Mensal Automática:</strong> Defina o valor previsto da recarga (ex: <code>R$ 800,00</code>) e o dia do crédito (ex: <code>Dia 10</code>) para previsibilidade orçamentária.</li>
          <li>💳 <strong>Final do Cartão:</strong> Identificação rápida pelos 4 últimos dígitos (ex: <code>Final 4920</code>).</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 4.3: CONTAS > TRANSFERÊNCIAS -->
    <div class="manual-topic-content" id="topic-contas-transf" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
        🔁 Transferências entre Contas sem Duplicação
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Ao usar o botão <strong>"Nova Transferência"</strong> na tela de Contas, o saldo é transferido da conta de origem para a de destino sem gerar receitas ou despesas artificiais no balanço familiar.</p>
      </div>
    </div>

    <!-- TÓPICO 4.4: CONTAS > PRODUTOS -->
    <div class="manual-topic-content" id="topic-contas-produtos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
        💳 Produtos da Conta (Banricompras, Cheque Especial)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">O aplicativo suporta produtos acoplados à conta corrente, permitindo parcelar despesas em débito pré-datado ou controlar o uso do cheque especial com visibilidade total.</p>
      </div>
    </div>

    <!-- TÓPICO 5.1: FAMÍLIA > PERFIS -->
    <div class="manual-topic-content" id="topic-fam-perfis" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
        👑 Papéis de Usuário (ADM, Responsável, Colaborador, Caçula)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• 👑 <strong>ADM Geral:</strong> Gestão técnica, auditoria e backups globais.</p>
        <p style="margin-bottom: 8px;">• ⭐ <strong>Responsável:</strong> Gestão financeira da casa, membros e permissões.</p>
        <p style="margin-bottom: 8px;">• 👤 <strong>Colaborador:</strong> Membro adulto com acesso às suas finanças e menus autorizados.</p>
        <p style="margin: 0;">• 🧸 <strong>Caçula:</strong> Interface especial para crianças e controle de mesada.</p>
      </div>
    </div>

    <!-- TÓPICO 5.2: FAMÍLIA > PERMISSÕES -->
    <div class="manual-topic-content" id="topic-fam-permissoes" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
        🛡️ Permissões Granulares por Módulo
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Defina exatamente quem pode visualizar ou editar lançamentos fixos, avulsos, contas bancárias, cartões de crédito e relatórios gerais.</p>
      </div>
    </div>
  `;
}

/* ==== manual-b.js ==== */
/* manual-b.js - parte 2/2 */

/**
 * Retorna o HTML dos tópicos 6 a 10 (incluindo FAQ) do painel de conteúdo
 */
function getManualTopicsPart2Html() {
  return `
    <!-- TÓPICO 6.1: SYNC > UUIDS & MULTI-APARELHO -->
    <div class="manual-topic-content" id="topic-sync-uuid" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔑 Identificadores Globais Universais (UUID v4) & Multi-Dispositivo</span>
        <span class="badge badge-blue">Smart Sync</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Arquitetura Resiliente para Sincronização Desktop e Web:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para permitir que membros da família usem o app no notebook (Desktop) e no celular (Web) simultaneamente sem conflitos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🌐 <strong>UUID Global (128 bits):</strong> Todo lançamento ganha um identificador único universal (<code>sync_id</code>). Isso impede colisões de ID numérico (ex: Desktop e Web criando o ID #1506).</li>
          <li>⏱️ <strong>Last-Write-Wins:</strong> Atualizações em um mesmo lançamento são resolvidas automaticamente com base no carimbo de data/hora mais recente (<code>updated_at</code>).</li>
          <li>🗑️ <strong>Soft-Delete:</strong> Exclusões são sincronizadas de forma limpa sem deixar registros fantasmas em outros aparelhos.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.2: SYNC > REGRA DE RECEITAS (NOVO) -->
    <div class="manual-topic-content" id="topic-sync-receitas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💰 Regra de Ouro para Receitas & Mesma Titularidade</span>
        <span class="badge badge-green">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como o sistema analisa o recebimento de receitas e salários:</strong>
        </div>
        <p style="margin-bottom: 10px;">Nas <strong>Receitas</strong> (salários, pró-labore, aluguéis recebidos, PIX recebidos), aplicam-se filtros completos de valor, data e título, respeitando as contas:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Contas Diferentes de Membros Distintos = 100% Ignoradas:</strong> Se William recebe R$ 4.000 no Itaú e Jennifer recebe R$ 4.000 no Nubank, o motor <strong>ignora totalmente</strong> e não gera alerta, pois são rendas legítimas e independentes de cada familiar.</li>
          <li>🚨 <strong>Mesma Conta Bancária:</strong> Se uma receita de mesmo valor e data for cadastrada duas vezes na <strong>mesma conta</strong>, o motor acusa duplicidade com Altíssima Certeza (95-100%).</li>
          <li>⚠️ <strong>Contas Diferentes do MESMO Titular:</strong> Se o próprio usuário lançar a mesma receita no Itaú e depois no Nubank por engano, o sistema identifica que ambas as contas pertencem ao mesmo usuário e acusa duplicidade com banco trocado (85-90%).</li>
          <li>⚡ <strong>Aviso em Tempo Real no Formulário:</strong> Ao preencher uma receita no modal, surge um alerta instantâneo: <em>"Atenção: Já existe uma receita similar de William em 20/08 na conta Itaú no valor de R$ 4.000,00..."</em>.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.3: SYNC > MOTOR HEURÍSTICO & HIERARQUIA DE DÍVIDAS -->
    <div class="manual-topic-content" id="topic-sync-dedup" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🧠 Motor Heurístico Anti-Duplicidade & Hierarquia de Dívidas</span>
        <span class="badge badge-purple">Inteligência Familiar</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Hierarquia de Análise para Dívidas e Despesas:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para despesas e pagamentos da casa, o motor segue uma rigorosa escala de critérios:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Nível 1 (Valor Exato + Datas Próximas):</strong> Compara valores idênticos com tolerância de até ±2 dias e compensações bancárias de fim de semana (sexta/sábado/domingo compensados na segunda/terça).</li>
          <li><strong>Nível 2 (Data Exata + Valores Aproximados):</strong> Detecta despesas no mesmo dia com pequenas variações de centavos, taxas ou gorjetas (até 2% a 5%).</li>
          <li><strong>Nível 3 (Títulos e NLP Bancário):</strong> Limpa ruídos e stopwords bancárias (<code>PIX</code>, <code>TED</code>, <code>PAGTO</code>, <code>COMPRA</code>, <code>DÉBITO</code>, <code>CRÉDITO</code>) e compara os estabelecimentos com busca inteligente por prefixos (ex: <em>"Zaffari Ipiranga"</em> vs <em>"Cia Zaffari"</em>).</li>
          <li><strong>Contas Diferentes com Lojas Diferentes = 0% Duplicata:</strong> Se o valor for R$ 50 no Itaú (Farmácia) e R$ 50 no Nubank (Padaria), é <strong>100% ignorado</strong>.</li>
          <li>🔢 <strong>Parcelamento Inteligente:</strong> Se o Lançamento A diz <em>"Sofá (2/10)"</em> e o B diz <em>"Sofá (3/10)"</em>, o motor sabe que <strong>NÃO é duplicata</strong>. Se ambos disserem <em>"2/10"</em> e <em>"2 de 10"</em>, acusa duplicata de 100%!</li>
          <li>🏷️ <strong>Mesma Conta Fixa Recorrente:</strong> Lançamentos que apontam para o mesmo item fixo do mês (ex: <em>Aluguel, Luz, Internet</em>) são detectados automaticamente com 100% de confiança.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.4: SYNC > CONCILIAÇÃO VISUAL E AÇÕES EM LOTE -->
    <div class="manual-topic-content" id="topic-sync-conciliacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ Central Avançada de Conciliação, Filtros e Ações em Lote</span>
        <span class="badge badge-cyan">Painel Completo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Painel Dedicado de Auditoria & Conciliação Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao clicar no botão <code>🛡️</code> na barra lateral ou no banner de alerta do Dashboard, você acessa a central:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🎯 <strong>Classificação por Nível de Certeza:</strong> Badges cromáticos informam o grau de confiança: <span class="badge badge-success">🟢 Altíssima Certeza (95-100%)</span>, <span class="badge badge-danger">🟡 Provável (80-94%)</span> e <span class="badge badge-warning">🔵 Suspeito (65-79%)</span>.</li>
          <li>🎛️ <strong>Filtros Interativos:</strong> Filtre a lista por membro da família, nível de certeza ou conta bancária pagadora.</li>
          <li>⚡ <strong>Ações em Lote:</strong> Botão <code>[ ⚡ Mesclar Certezas (100%) ]</code> e <code>[ 🔗 Mesclar Selecionados ]</code> para resolver dezenas de duplicidades com 1 único clique.</li>
          <li>📜 <strong>Aba de Histórico:</strong> Registra todas as conciliações e desfechos anteriores para prestação de contas e auditoria.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 7.1: ORÇAMENTOS > BUDGETS -->
    <div class="manual-topic-content" id="topic-orc-budgets" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
        🎯 Tetos de Gastos por Categoria (Orçamento)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Estabeleça um limite mensal máximo para categorias como Alimentação, Lazer e Transporte. A barra de progresso avisa com cores quando o teto estiver próximo de ser atingido.</p>
      </div>
    </div>

    <!-- TÓPICO 7.2: ORÇAMENTOS > METAS -->
    <div class="manual-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
        🏆 Metas Financeiras & Cofrinhos de Economia
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Crie objetivos como Viagem de Férias, Reserva de Emergência ou Troca de Carro, registrando aportes mensais com cálculo automático da data estimada de conclusão.</p>
      </div>
    </div>

    <!-- TÓPICO 8.1: METODOLOGIA 50-30-20 -->
    <div class="manual-topic-content" id="topic-met-regra" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #c084fc; font-weight: 700;">
        💡 A Metodologia 50-30-20 Aplicada à Família
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;">
          <div style="flex: 1; min-width: 150px; background: rgba(59,130,246,0.1); border-left: 4px solid var(--blue); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #60a5fa;">50% — Necessidades</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Aluguel, condomínio, luz, água, alimentação básica e saúde.</div>
          </div>
          <div style="flex: 1; min-width: 150px; background: rgba(16,185,129,0.1); border-left: 4px solid var(--green); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #34d399;">30% — Desejos / Lazer</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Restaurantes, assinaturas, passeios, compras e hobbies.</div>
          </div>
          <div style="flex: 1; min-width: 150px; background: rgba(139,92,246,0.1); border-left: 4px solid var(--purple); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #c084fc;">20% — Futuro & Metas</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Reserva de emergência, investimentos e quitação antecipada.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TÓPICO 9.1: ARQUITETURA MODULAR & BUILD -->
    <div class="manual-topic-content" id="topic-arq-modular" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏗️ Nova Arquitetura Modular & Manutenção Ágil</span>
        <span class="badge badge-yellow">Engenharia v2</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(234, 179, 8, 0.08); border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Código 100% Desacoplado (Arquivos com no máximo 900 linhas):</strong>
        </div>
        <p style="margin-bottom: 10px;">Para garantir alta velocidade de carregamento, facilidade de manutenção e eliminar arquivos monolíticos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🧩 <strong>Frontend Modularizado (21 Módulos em <code>src/renderer/js/modules/</code>):</strong> Dashboard, Planejamento, Contas, Configurações, Modais, Autenticação e Deduplicação separados em submódulos concisos.</li>
          <li>💾 <strong>Banco SQLite Modular (8 Módulos em <code>src/database/</code>):</strong> Camadas de Transações, Contas, Usuários/LGPD, Faturas, Relatórios e Anti-Duplicidade desacopladas em mixins limpos.</li>
          <li>🎨 <strong>Folhas de Estilo (4 Folhas em <code>src/renderer/css/</code>):</strong> <code>base.css</code>, <code>components.css</code>, <code>views.css</code> e <code>responsive-features.css</code> agregadas via <code>@import</code>.</li>
          <li>⚡ <strong>Scripts de Build:</strong> Execute <code>npm run build:renderer</code> para compilar alterações ou <code>npm run watch:renderer</code> para compilação instantânea em segundo plano.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 10.1: FAQ INTERATIVO -->
    <div class="manual-topic-content" id="topic-faq-interativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f87171; font-weight: 700;">
        ❓ Perguntas Frequentes (FAQ Interativo — Clique para abrir a resposta)
      </h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        
        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💰 Como o app diferencia receitas de familiares em contas bancárias distintas?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Pela <strong>Regra de Ouro de Receitas</strong>, salários e recebíveis lançados em contas de familiares diferentes (ex: marido no Itaú e esposa no Nubank) são <strong>100% ignorados pelo motor de duplicidades</strong>, pois são rendas reais independentes. O sistema só alerta se a receita for na mesma conta bancária ou se o mesmo titular cadastrar em bancos diferentes por engano.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🛡️ O que acontece se dois membros da família lançarem a mesma despesa (Web e Desktop)?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            O <strong>Motor Anti-Duplicidade</strong> cruza valor, data (com compensação de fins de semana) e o nome do estabelecimento (NLP). Se o mesmo local for detectado, o sistema alerta e você pode abrir a <strong>Central de Conciliação</strong> para mesclar em 1 único lançamento com 1 clique.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔢 O motor de duplicidade confunde compras parceladas (ex: 2/10 com 3/10)?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! O motor extrai o número da parcela automaticamente. Se os números forem diferentes (ex: <em>2/10</em> vs <em>3/10</em>), a duplicidade é <strong>zerada (0%)</strong> porque são parcelas de meses distintos. Já parcelas idênticas (ex: <em>2/10</em> vs <em>2 de 10</em>) recebem pontuação máxima de duplicidade (100%).
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 Como funciona o destaque de parcelas ao clicar na fatura?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Ao clicar no card de qualquer fatura na tela de Planejamento (ex: <code>FATURA CARTÃO CARREFOUR</code>), todas as compras e parcelas correspondentes na lista de Despesas são imediatamente destacadas com a cor oficial do cartão/banco. Os itens de outros cartões são atenuados, facilitando a conferência.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🤝 O que acontece quando clico em 'Renegociar / Acordo' em uma fatura?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            A fatura é marcada como <span class="badge badge-purple">Renegociada</span>, a entrada é debitada da conta bancária e o sistema gera automaticamente as parcelas do acordo como despesas nos meses subsequentes. Caso tenha feito por engano, você pode clicar em "Desfazer Acordo / Reabrir" para restaurar a fatura original.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔒 Meus dados financeiros ficam salvos na nuvem ou são compartilhados?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! Todos os dados são gravados exclusivamente no banco de dados local SQLite no seu computador com criptografia AES-256 e conformidade integral com a LGPD. Nenhuma informação financeira sai da sua rede local.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Renderiza a página do Manual do Usuário
 */
async function renderManual() {
  const page = document.getElementById('page-manual');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
          <span>📖</span> Manual do Usuário & Central de Conhecimento
        </h2>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          Guia completo de operações, cartões de crédito, fluxo de caixa e metodologia financeira
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" id="btn-download-manual-pdf" style="display: flex; align-items: center; gap: 8px; font-weight: 700; padding: 9px 18px; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
          <span>📥</span> Baixar Manual em PDF
        </button>
      </div>
    </div>

    <!-- BREADCRUMB / TRILHA DE NAVEGAÇÃO -->
    <div id="manual-breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; background: var(--bg-surface); padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); flex-wrap: wrap;">
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="manual-crumb-root">📚 MANUAL</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-cat" style="color: #60a5fa; font-weight: 600;">💳 Cartões de Crédito</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-sub" style="color: var(--accent-light); font-weight: 700;">Competência vs Vencimento</span>
    </div>

    <!-- BUSCA GLOBAL NO MANUAL -->
    <div style="margin-bottom: 14px; position: relative;">
      <input type="text" id="manual-search-input" placeholder="🔍 Pesquisar em todos os tópicos, operações, termos e perguntas do manual..."
             style="width: 100%; padding: 10px 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 13px; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    </div>

    <!-- CONTAINER PRINCIPAL: MENU EM ÁRVORE (ESQUERDA) + CONTEÚDO (DIREITA) -->
    <div style="display: flex; gap: 16px; height: calc(100vh - 230px); min-height: 520px;">
      ${getManualSidebarHtml()}

      <!-- PAINEL DE CONTEÚDO (DIREITA) -->
      <div id="manual-display-panel" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 22px; scrollbar-width: thin;">
        ${getManualTopicsPart1Html()}
        ${getManualTopicsPart2Html()}
      </div>
    </div>
  `;

  setupManualEvents(page);
}

/**
 * Registra todos os eventos de clique, busca e acordeão do Manual
 */
function setupManualEvents(container) {
  if (!container) return;

  const treeHeaders = container.querySelectorAll('.wiki-tree-header');
  const treeItems = container.querySelectorAll('.wiki-tree-item');
  const topicContents = container.querySelectorAll('.manual-topic-content');
  const crumbCat = container.querySelector('#manual-crumb-cat');
  const crumbSub = container.querySelector('#manual-crumb-sub');

  // Category headers accordion toggle
  treeHeaders.forEach(header => {
    header.onclick = () => {
      const subs = header.nextElementSibling;
      const arrow = header.querySelector('.wiki-tree-arrow');
      if (subs) {
        if (subs.style.display === 'none') {
          subs.style.display = 'flex';
          if (arrow) arrow.textContent = '▾';
        } else {
          subs.style.display = 'none';
          if (arrow) arrow.textContent = '▸';
        }
      }
    };
  });

  // Topic items click to switch active content
  treeItems.forEach(item => {
    item.onclick = () => {
      treeItems.forEach(i => {
        i.classList.remove('active');
        i.style.color = 'var(--text-muted)';
        i.style.fontWeight = 'normal';
        i.style.borderLeftColor = 'transparent';
        i.style.background = 'transparent';
      });
      item.classList.add('active');
      item.style.color = 'var(--text-primary)';
      item.style.fontWeight = '700';
      item.style.borderLeftColor = 'var(--accent)';
      item.style.background = 'var(--bg-raised)';

      const topicId = item.dataset.topic;
      const catName = item.closest('.wiki-tree-group')?.querySelector('.wiki-tree-header span')?.textContent || 'Manual';
      const subName = item.textContent.replace('•', '').trim();

      if (crumbCat) crumbCat.textContent = catName;
      if (crumbSub) crumbSub.textContent = subName;

      topicContents.forEach(tc => {
        tc.style.display = tc.id === `topic-${topicId}` ? 'block' : 'none';
      });

      const displayPanel = container.querySelector('#manual-display-panel');
      if (displayPanel) displayPanel.scrollTop = 0;
    };
  });

  // FAQ interactive accordion clicks
  container.querySelectorAll('.wiki-faq-q').forEach(qEl => {
    qEl.onclick = () => {
      const aEl = qEl.nextElementSibling;
      const chevron = qEl.querySelector('.faq-chevron');
      if (aEl) {
        const isHidden = aEl.style.display === 'none';
        aEl.style.display = isHidden ? 'block' : 'none';
        if (chevron) chevron.textContent = isHidden ? '➖' : '➕';
      }
    };
  });

  // Global search inside manual
  const searchInput = container.querySelector('#manual-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q) {
        if (crumbCat) crumbCat.textContent = 'Busca no Manual';
        if (crumbSub) crumbSub.textContent = `Resultados para "${q}"`;
        topicContents.forEach(tc => {
          const text = tc.textContent.toLowerCase();
          const matches = text.includes(q);
          tc.style.display = matches ? 'block' : 'none';
        });
        container.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          const text = acc.textContent.toLowerCase();
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (text.includes(q)) {
            acc.style.display = 'block';
            if (aEl) aEl.style.display = 'block';
            if (chevron) chevron.textContent = '➖';
          } else {
            acc.style.display = 'none';
          }
        });
      } else {
        const activeItem = container.querySelector('.wiki-tree-item.active');
        if (activeItem) activeItem.click();
        container.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          acc.style.display = 'block';
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (aEl) aEl.style.display = 'none';
          if (chevron) chevron.textContent = '➕';
        });
      }
    };
  }

  // Download PDF button
  const downloadBtn = container.querySelector('#btn-download-manual-pdf');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      try {
        const link = document.createElement('a');
        link.href = 'Manual_do_Usuario.pdf';
        link.download = 'Manual_do_Usuario_FinancasFamilia.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast('📥 Abrindo download do Manual do Usuário em PDF...');
      } catch (err) {
        window.open('Manual_do_Usuario.pdf', '_blank');
      }
    };
  }
}

/* ==== settings-1a.js ==== */
/* === settings-1a.js (parte 1/2 de settings-1.js) ===
 * Linhas 1–550
 */

/* ===
 * settings-1.js — Parte 1 de settings
 * Linhas 6375–7470 do app.js
 */

async function renderSettings() {
  await openSettingsModal('profile');
}

async function openSettingsModal(activeTab = 'profile') {
  const PROFILE_LABELS = {
    1: 'ADM Dono do APP',
    2: 'Adm da Família',
    3: 'Filho Primogênito',
    4: 'Filho do Meio',
    5: 'Filho Caçula'
  };

  const [categories, users, settings] = await Promise.all([
    window.api.categories.getAll(State.user.id),
    window.api.auth.getUsers(),
    window.api.settings.get(State.user.id),
  ]);
  State.settings = settings;

  let currentFamily = null;
  if (State.user.family_id) {
    try {
      const families = await window.api.families.getAll();
      currentFamily = families.find(f => f.id === State.user.family_id);
    } catch (e) {
      console.error('Error fetching current family:', e);
    }
  }

  const currentMonthName = new Date(State.currentYear, State.currentMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const currentTheme = localStorage.getItem('financas_theme') || 'dark-emerald';
  const isFamilyAdmin = currentFamily && (State.user.profile_type === 1 || State.user.profile_type === 2);

  const modalHtml = `
    <div class="settings-modal-dialog">
      <!-- SIDEBAR DE ABAS DE NAVEGAÇÃO -->
      <div class="settings-modal-sidebar">
        <div>
          <div class="settings-modal-group-title">👤 PESSOAL</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
              <span>👤</span> Meu Perfil
            </button>
            ${isFamilyAdmin ? `
            <button class="settings-modal-tab-btn ${activeTab === 'family' ? 'active' : ''}" data-tab="family">
              <span>🏠</span> Minha Família
            </button>` : ''}
          </div>
        </div>

        <div>
          <div class="settings-modal-group-title">⚙️ APLICATIVO</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
              <span>🎨</span> Aparência & Temas
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
              <span>🏷️</span> Categorias
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'backups' ? 'active' : ''}" data-tab="backups">
              <span>💾</span> Backups & Dados
            </button>
          </div>
        </div>

        <div>
          <div class="settings-modal-group-title">📚 CONHECIMENTO & LEI</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'wiki' ? 'active' : ''}" data-tab="wiki">
              <span>📚</span> Wiki do Aplicativo
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'lgpd' ? 'active' : ''}" data-tab="lgpd">
              <span>⚖️</span> Privacidade & LGPD
            </button>
          </div>
        </div>
      </div>

      <!-- CORPO DE CONTEÚDO DA ABA ATIVA -->
      <div class="settings-modal-body" id="settings-modal-tab-body">
      </div>
    </div>
  `;

  Modal.open('⚙️ Configurações do Aplicativo', modalHtml, true, true);

  const bodyEl = document.getElementById('settings-modal-tab-body');

  const renderTabContent = async (tab) => {
    document.querySelectorAll('.settings-modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'profile') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          👤 Meu Perfil (Dados Cadastrais)
        </h3>
        
        <!-- Header com Avatar e Nome -->
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 14px 18px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          ${renderAvatarHtml(State.user, 54)}
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>${State.user.name}</span>
              <span class="badge badge-purple" style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">${PROFILE_LABELS[State.user.profile_type] || 'Membro'}</span>
            </h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">Usuário: @${State.user.username}</p>
          </div>
        </div>

        <!-- GRUPO 1: DADOS PESSOAIS -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--accent-light); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>👤</span> Identificação Pessoal
          </div>
          <div class="form-row" style="margin-bottom: 12px;">
            <div class="form-group">
              <label>Nome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-first-name" value="${State.user.first_name || ''}">
            </div>
            <div class="form-group">
              <label>Sobrenome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-last-name" value="${State.user.last_name || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CPF <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-cpf" placeholder="000.000.000-00" value="${State.user.cpf || ''}" maxlength="14">
            </div>
            <div class="form-group">
              <label>Data de Nascimento <span style="color: #ef4444;">*</span></label>
              <input type="date" id="prof-birth-date" value="${State.user.birth_date || ''}">
            </div>
          </div>
        </div>

        <!-- GRUPO 2: CONTATO -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>📱</span> Contato & Comunicação
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>E-mail <span style="color: #ef4444;">*</span></label>
              <input type="email" id="prof-email" placeholder="seu-email@provedor.com" value="${State.user.email || ''}">
            </div>
            <div class="form-group">
              <label>Celular (WhatsApp) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-phone" placeholder="(00) 00000-0000" value="${State.user.phone || ''}" maxlength="15">
            </div>
          </div>
        </div>

        <!-- GRUPO 3: ACESSO E SEGURANÇA -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #8b5cf6; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>🔒</span> Credenciais & Segurança de Acesso
          </div>
          <div class="form-row" style="margin-bottom: 12px;">
            <div class="form-group">
              <label>Usuário (@username) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-username" value="${State.user.username}" ${State.user.username === 'adm' ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label>Alterar Senha (Opcional)</label>
              <input type="password" id="prof-password" placeholder="Deixe em branco para manter a atual">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pergunta de Segurança <span style="color: #ef4444;">*</span></label>
              <select id="prof-recovery-question">
                <option value="Qual o nome de solteira da sua mãe?" ${State.user.recovery_question === 'Qual o nome de solteira da sua mãe?' ? 'selected' : ''}>Qual o nome de solteira da sua mãe?</option>
                <option value="Qual o nome do seu primeiro animal de estimação?" ${State.user.recovery_question === 'Qual o nome do seu primeiro animal de estimação?' ? 'selected' : ''}>Qual o nome do seu primeiro animal de estimação?</option>
                <option value="Em qual cidade você nasceu?" ${State.user.recovery_question === 'Em qual cidade você nasceu?' ? 'selected' : ''}>Em qual cidade você nasceu?</option>
                <option value="Qual o nome da sua primeira escola?" ${State.user.recovery_question === 'Qual o nome da sua primeira escola?' ? 'selected' : ''}>Qual o nome da sua primeira escola?</option>
                <option value="Qual o modelo do seu primeiro carro?" ${State.user.recovery_question === 'Qual o modelo do seu primeiro carro?' ? 'selected' : ''}>Qual o modelo do seu primeiro carro?</option>
              </select>
            </div>
            <div class="form-group">
              <label>Resposta de Segurança (Opcional)</label>
              <input type="text" id="prof-recovery-answer" placeholder="Deixe em branco para manter a atual">
            </div>
          </div>
        </div>

        <p class="auth-error" id="prof-error-text" style="margin: 0; font-size: 12px;"></p>

        <div style="display: flex; justify-content: flex-end; margin-top: 12px; margin-bottom: 24px;">
          <button class="btn btn-primary" id="save-my-profile" style="padding: 10px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>💾</span> Salvar Alterações
          </button>
        </div>

        <!-- Alertas de Vencimento -->
        <h4 style="margin: 16px 0 10px 0; font-size: 14px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 16px;">
          ⏰ Alertas de Vencimento
        </h4>
        <div class="form-group">
          <label>Avisar com quantos dias de antecedência?</label>
          <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
            <input type="number" id="alert-days" min="1" max="30" value="${settings.alert_days_before || 3}" style="width:100px; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary)">
            <span style="color:var(--text-muted);font-size:13px">dia(s) antes do vencimento</span>
            <button class="btn btn-primary btn-sm" id="save-alert-days">Salvar Alerta</button>
          </div>
        </div>

        <!-- Gestão de Usuários da Família -->
        <h4 style="margin: 24px 0 10px 0; font-size: 14px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 16px;">
          👥 Membros da Família
        </h4>
        <div class="settings-list" style="margin-bottom: 12px;">
          ${users.map(u => `
            <div class="settings-item" data-id="${u.id}" ${State.permissions.can_edit_all === 1 ? 'draggable="true"' : ''} style="justify-content: space-between; ${State.permissions.can_edit_all === 1 ? 'cursor: grab;' : ''}">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${renderAvatarHtml(u, 36)}
                <div class="settings-item-info"><div class="settings-item-name">${u.name}</div><div class="settings-item-sub">@${u.username} • <span style="color: var(--accent-light); font-weight: 600;">${PROFILE_LABELS[u.profile_type] || 'Membro'}</span></div></div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                ${u.id === State.user.id ? '<span class="badge badge-green">Você</span>' : ''}
                ${State.permissions.can_edit_all === 1 ? `<button class="btn-icon-sm btn-edit-user" data-id="${u.id}" title="Editar Perfil">✏️</button>` : ''}
                ${State.permissions.can_edit_all === 1 && u.id !== State.user.id && u.username !== 'adm' ? `<button class="btn-icon-sm btn-delete-user" data-id="${u.id}" title="Excluir Usuário" style="background: none; border: none; cursor: pointer; font-size: 14px;">🗑️</button>` : ''}
              </div>
            </div>`).join('')}
        </div>
        ${State.permissions.can_edit_all === 1 ? `<button class="btn btn-secondary btn-sm" id="btn-add-user" style="align-self: flex-start;">+ Adicionar usuário</button>` : ''}
      `;

      bindProfileTabEvents(categories, users);

    } else if (tab === 'family') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          🏠 Minha Família
        </h3>
        ${currentFamily ? `
        <div class="card" style="padding:20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div class="form-group" style="margin-bottom:0">
            <label style="font-weight:600; font-size:13px;">Nome da Família</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
              <input type="text" id="family-name-input" value="${currentFamily.name}" style="flex-grow:1; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
              <button class="btn btn-primary btn-sm" id="save-family-name" style="padding: 10px 16px;">Salvar Nome</button>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Isso mudará o nome da sua família no topo e nos relatórios de todos os membros.</p>
          </div>
        </div>
        ` : `<div style="color:var(--text-muted); font-size:13px;">Nenhuma família associada.</div>`}
      `;
      if (document.getElementById('save-family-name')) {
        document.getElementById('save-family-name').onclick = async () => {
          const newName = document.getElementById('family-name-input').value.trim();
          if (!newName) { toast('Informe o nome da família', 'error'); return; }
          const res = await window.api.families.update({ id: currentFamily.id, name: newName, quota_users: currentFamily.quota_users, quota_accounts: currentFamily.quota_accounts });
          if (res && res.success) {
            State.familyName = newName;
            toast('Nome da família atualizado!');
            openSettingsModal('family');
          } else {
            toast(res?.error || 'Erro ao atualizar família', 'error');
          }
        };
      }

    } else if (tab === 'appearance') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          🎨 Aparência e Temas do App
        </h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px">
          Selecione a aparência visual de sua preferência para o aplicativo:
        </p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px" id="settings-theme-container">
          
          <div class="theme-card-option ${currentTheme === 'dark-emerald' || currentTheme === 'high-contrast-dark' ? 'active' : ''}" data-theme-val="dark-emerald" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${(currentTheme === 'dark-emerald' || currentTheme === 'high-contrast-dark') ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:12px">
            <div style="display:flex; align-items:center; justify-content:space-between">
              <span style="font-size:24px">🌙</span>
              <span class="theme-preview-dot dark-emerald" style="width:20px; height:20px"></span>
            </div>
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Tema Escuro</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px">Visual escuro moderno, equilibrado e elegante.</div>
            </div>
          </div>

          <div class="theme-card-option ${currentTheme === 'light' || currentTheme === 'high-contrast-light' ? 'active' : ''}" data-theme-val="light" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${(currentTheme === 'light' || currentTheme === 'high-contrast-light') ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:12px">
            <div style="display:flex; align-items:center; justify-content:space-between">
              <span style="font-size:24px">☀️</span>
              <span class="theme-preview-dot light-theme-dot" style="width:20px; height:20px"></span>
            </div>
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Tema Claro</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px">Visual claro descansado, limpo e profissional.</div>
            </div>
          </div>

        </div>

        <!-- SEÇÃO: LAYOUT E ORGANIZAÇÃO DO DASHBOARD -->
        <h4 style="margin: 28px 0 10px 0; font-size: 15px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 20px; display: flex; align-items: center; gap: 8px;">
          <span>🎛️</span> Organização e Layout do Dashboard
        </h4>
        <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px">
          Escolha como prefere visualizar e interagir com o resumo financeiro da família no Dashboard:
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px" id="settings-dash-layout-container">
          
          <!-- MODO 1: EXECUTIVO POR ZONAS -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'executive' ? 'active' : ''}" data-layout-val="executive" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'executive' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'executive' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">🌟</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Executivo por Zonas</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Visão 360° com KPIs consolidados, pílulas de ação rápida, cartões com filtro por membro e painel Kanban 3 colunas.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:var(--accent-light); background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Recomendado / Visão Completa
            </div>
          </div>

          <!-- MODO 2: SUB-ABAS OPERACIONAIS -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'tabbed' ? 'active' : ''}" data-layout-val="tabbed" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'tabbed' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'tabbed' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">📑</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Sub-Abas Operacionais</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Reduz a rolagem vertical agrupando os dados em 3 abas focadas: <em>📋 Operação</em>, <em>💳 Cartões & Bancos</em> e <em>📈 Gráficos</em>.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:#60a5fa; background:rgba(59,130,246,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Ideal para Foco por Contexto
            </div>
          </div>

          <!-- MODO 3: COCKPIT INTEGRADO -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'cockpit' ? 'active' : ''}" data-layout-val="cockpit" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'cockpit' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'cockpit' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">🎛️</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Cockpit Integrado</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Filtros no topo com Cartões e Bancos em destaque logo abaixo, seguidos pelos KPIs, Kanban 3 colunas e Gráficos em tela cheia.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:#c084fc; background:rgba(139,92,246,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Previsibilidade Direta no Topo
            </div>
          </div>

        </div>
      `;

      document.querySelectorAll('#settings-theme-container .theme-card-option').forEach(card => {
        card.onclick = () => {
          const tVal = card.dataset.themeVal;
          if (typeof setAppTheme === 'function') {
            setAppTheme(tVal);
          }
          openSettingsModal('appearance');
        };
      });

      document.querySelectorAll('#settings-dash-layout-container .dash-layout-option').forEach(card => {
        card.onclick = () => {
          const lVal = card.dataset.layoutVal;
          State.dashboardLayoutMode = lVal;
          localStorage.setItem('dashboard_layout_mode', lVal);
          toast(`Layout do Dashboard alterado para: ${lVal === 'executive' ? 'Executivo por Zonas' : lVal === 'tabbed' ? 'Sub-Abas Operacionais' : 'Cockpit Split 2:1'}`);
          openSettingsModal('appearance');
          if (State.currentPage === 'dashboard' && typeof renderDashboard === 'function') {
            renderDashboard();
          }
        };
      });

    } else if (tab === 'categories') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
          <span>🏷️ Categorias</span>
          <button class="btn btn-secondary btn-sm" id="btn-add-category">+ Nova Categoria</button>
        </h3>

        <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
          <!-- Coluna Despesas -->
          <div class="category-column">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">💸</span> Despesas
            </div>
            <div class="settings-list">
              ${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `
                <div class="settings-item">
                  <span style="font-size:20px">${c.icon}</span>
                  <div style="width:10px;height:10px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
                  <div class="settings-item-info">
                    <div class="settings-item-name">${c.name} ${c.is_default ? '<span style="font-size:10px;color:var(--text-muted);margin-left:6px;opacity:0.7;">(Padrão)</span>' : ''}</div>
                  </div>
                  <div class="settings-item-actions" style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn btn-secondary btn-sm cat-edit" data-id="${c.id}">✏️</button>
                    ${!c.is_default ? `<button class="btn btn-danger btn-sm cat-delete" data-id="${c.id}">🗑</button>` : `<span title="Categoria padrão (não pode ser excluída)" style="font-size:14px;opacity:0.5;margin: 0 8px; cursor: help;">🔒</span>`}
                  </div>
                </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:16px;background:var(--bg-surface);border:1px dashed var(--border);border-radius:var(--radius-sm);text-align:center">Nenhuma categoria de despesa</div>'}
            </div>
          </div>

          <!-- Coluna Receitas -->
          <div class="category-column">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">💰</span> Receitas
            </div>
            <div class="settings-list">
              ${categories.filter(c => c.type === 'income' || c.type === 'both').map(c => `
                <div class="settings-item">
                  <span style="font-size:20px">${c.icon}</span>
                  <div style="width:10px;height:10px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
                  <div class="settings-item-info">
                    <div class="settings-item-name">${c.name} ${c.is_default ? '<span style="font-size:10px;color:var(--text-muted);margin-left:6px;opacity:0.7;">(Padrão)</span>' : ''}</div>
                  </div>
                  <div class="settings-item-actions" style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn btn-secondary btn-sm cat-edit" data-id="${c.id}">✏️</button>
                    ${!c.is_default ? `<button class="btn btn-danger btn-sm cat-delete" data-id="${c.id}">🗑</button>` : `<span title="Categoria padrão (não pode ser excluída)" style="font-size:14px;opacity:0.5;margin: 0 8px; cursor: help;">🔒</span>`}
                  </div>
                </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:16px;background:var(--bg-surface);border:1px dashed var(--border);border-radius:var(--radius-sm);text-align:center">Nenhuma categoria de receita</div>'}
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-add-category').onclick = () => openCategoryModal(categories);
      document.querySelectorAll('.cat-delete').forEach(btn => {
        btn.onclick = async () => {
          if (confirm('Excluir esta categoria?')) {
            await window.api.categories.delete(parseInt(btn.dataset.id));
            toast('Categoria excluída');
            openSettingsModal('categories');
          }
        };
      });
      document.querySelectorAll('.cat-edit').forEach(btn => {
        btn.onclick = () => {
          const catId = parseInt(btn.dataset.id);
          const cat = categories.find(c => c.id === catId);
          if (cat) openCategoryModal(categories, cat);
        };
      });

    } else if (tab === 'backups') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          💾 Gestão de Backups & Exportação de Dados
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
          Exporte ou restaure suas informações financeiras em múltiplos formatos seguros e compatíveis com planilhas e sistemas externos:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          
          <!-- CARD 1: BANCO SQLITE (.db) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📦 Banco SQLite</span>
                </span>
                <span class="badge badge-purple" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">.DB</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Cópia de segurança nativa do arquivo de banco de dados do sistema contendo todas as tabelas.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-backup" style="flex: 1; min-width: 110px; font-size: 12px;">
                💾 Exportar .db
              </button>
              ${(State.user.profile_type === 1 || State.user.is_system_admin === 1) ? `
              <button class="btn btn-secondary btn-sm" id="btn-restore-backup" style="flex: 1; min-width: 110px; font-size: 12px; border: 1px dashed var(--border);">
                📂 Restaurar .db
              </button>
              <input type="file" id="input-restore-backup" accept=".db" style="display:none">
              ` : ''}
            </div>
          </div>

          <!-- CARD 2: EXCEL (.xlsx) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📊 Planilhas Excel</span>
                </span>
                <span class="badge badge-success" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">.XLSX</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Relatórios financeiros formatados com abas separadas de Resumo, Lançamentos e Planejamento.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-export-month" style="flex: 1; min-width: 110px; font-size: 12px;">
                📅 Excel Mês (${capitalizedMonth})
              </button>
              <button class="btn btn-primary btn-sm" id="btn-export-year" style="flex: 1; min-width: 110px; font-size: 12px;">
                📊 Excel Anual (${State.currentYear})
              </button>
            </div>
          </div>

          <!-- CARD 3: EXTRATO CSV (.csv) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📋 Extrato CSV</span>
                </span>
                <span class="badge badge-warning" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">.CSV</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Extrato leve de lançamentos em texto separado por ponto-e-vírgula (compatível com Excel).
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-csv-month" style="flex: 1; min-width: 110px; font-size: 12px;">
                📋 CSV Mensal
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-export-csv-year" style="flex: 1; min-width: 110px; font-size: 12px;">
                📅 CSV Anual
              </button>
            </div>
          </div>

          <!-- CARD 4: BACKUP ESTRUTURADO JSON (.json) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📑 Backup Portátil</span>
                </span>
                <span class="badge badge-info" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">.JSON</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Arquivo estruturado completo com todas as entidades para exportação e inspeção de dados.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-json" style="flex: 1; min-width: 110px; font-size: 12px;">
                📑 Exportar JSON
              </button>
            </div>
          </div>

        </div>
      `;

      bindBackupTabEvents(capitalizedMonth);

    } else if (tab === 'wiki') {
      renderSettingsWikiTab(bodyEl);
    } else if (tab === 'lgpd') {
      renderSettingsLgpdTab(bodyEl);
    }
  };

  document.querySelectorAll('.settings-modal-tab-btn').forEach(btn => {
    btn.onclick = () => renderTabContent(btn.dataset.tab);
  });

  await renderTabContent(activeTab);
}

/* ==== settings-1b.js ==== */
/* === settings-1b.js (parte 2/2 de settings-1.js) ===
 * Wiki, LGPD e Helpers de Configurações
 */

/**
 * Retorna o HTML da árvore de navegação lateral da Wiki de Configurações
 */
function getSettingsWikiSidebarHtml() {
  return `
    <div id="wiki-tree-sidebar" style="width: 240px; min-width: 240px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin;">
      
      <!-- GRUPO 1: CARTÕES DE CRÉDITO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="cartoes" data-topic="cartao-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • Competência vs Vencimento
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Ciclo & Melhor Dia
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Limite Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento & Baixa Atômica
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Renegociação & Acordos
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-reabertura" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Reabertura & Estorno
          </div>
        </div>
      </div>

      <!-- GRUPO 2: DESPESAS & RECEITAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #34d399; background: rgba(16,185,129,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📌 Despesas & Receitas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Competência (Ref: MM/AAAA)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-fixas" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Fixas & Prioridade ⭐
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-avulsos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Variáveis (Avulsas)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Juros, Multas e Descontos
          </div>
        </div>
      </div>

      <!-- GRUPO 3: CONTAS & CARTEIRAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #06b6d4; background: rgba(6,182,212,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 Contas & Transferências</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-tipos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tipos de Contas Bancárias
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transf" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Transferências sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-produtos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Produtos da Conta & Limites
          </div>
        </div>
      </div>

      <!-- GRUPO 4: FAMÍLIA & PERMISSÕES -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="familia" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #a78bfa; background: rgba(167,139,250,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>👨‍👩‍👧 Família & Permissões</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Papéis de Usuário (ADM, etc)
          </div>
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-permissoes" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Permissões Granulares por Menu
          </div>
        </div>
      </div>

      <!-- GRUPO 5: ORÇAMENTOS & METAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamentos" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #f43f5e; background: rgba(244,63,94,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 Orçamentos & Metas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-budgets" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tetos de Gastos por Categoria
          </div>
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Metas Financeiras & Aportes
          </div>
        </div>
      </div>

      <!-- GRUPO 6: METODOLOGIA 50-30-20 -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="metodologia" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #c084fc; background: rgba(192,132,252,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💡 Metodologia 50-30-20</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="metodologia" data-topic="met-regra" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Como Dividir o Orçamento Familiar
          </div>
        </div>
      </div>

      <!-- GRUPO 7: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #f87171; background: rgba(248,113,113,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ FAQ (Perguntas)</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-interativo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Dúvidas Frequentes (Clique e Veja)
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos de conteúdo da Wiki de Configurações
 */
function getSettingsWikiTopicsHtml() {
  return `
    <!-- TÓPICO: CARTÕES > COMPETÊNCIA VS VENCIMENTO -->
    <div class="wiki-topic-content" id="topic-cartao-competencia" style="display: block;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 Competência vs. Vencimento na Fatura do Cartão</span>
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(96,165,250,0.08); border-left: 4px solid #60a5fa; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como o aplicativo sincroniza o consumo real com o vencimento do cartão:</strong>
        </div>
        <p style="margin-bottom: 10px;">• <strong>Mês de Competência da Fatura (<code>competence_date</code>):</strong> Representa o mês do ciclo de compras. Por exemplo, a fatura com ciclo encerrando em 25 de <em>Fevereiro</em> possui competência de <strong>Fevereiro</strong>.</p>
        <p style="margin-bottom: 10px;">• <strong>Data de Vencimento (<code>due_day</code>):</strong> É o dia exato em que o banco cobra o pagamento da fatura (ex: dia 05 de <em>Março</em>).</p>
        <p style="margin-bottom: 10px;">• <strong>Controle de Despesas Parceladas:</strong> Cada parcela de uma compra parcelada é atribuída automaticamente à fatura do seu respectivo mês de competência, garantindo que o seu fluxo de caixa reflita a realidade exata de cada período.</p>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > CICLO & MELHOR DIA -->
    <div class="wiki-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔒 Ciclo de Fechamento & O "Melhor Dia de Compra"
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--info); padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Fórmula do Ciclo:</strong> <code>(Fechamento Anterior + 1)</code> até <code>(Fechamento Atual)</code>
        </div>
        <p style="margin-bottom: 10px;"><strong>Exemplo Prático (Fechamento dia 25 e Vencimento dia 05):</strong></p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Compras realizadas de <strong>26/07 a 25/08</strong> entram na fatura de <strong>Agosto</strong> (vencimento em 05/09).</li>
          <li>Compras realizadas no dia <strong>26/08 em diante</strong> entram apenas na fatura de <strong>Setembro</strong> (vencimento em 05/10).</li>
        </ul>
        <p style="margin: 0;">💡 <strong>Dica de Ouro:</strong> Comprar no dia 26 garante até <strong>40 dias de prazo</strong> para pagar a despesa sem juros!</p>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > LIMITE COMPROMETIDO -->
    <div class="wiki-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        📊 Limite Global Comprometido vs. Limite Disponível
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Quando você cadastra um cartão com <strong>Limite Total de R$ 5.000,00</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Se você faz uma compra de <strong>R$ 1.200,00 em 12x de R$ 100,00</strong>, o limite disponível cai imediatamente para <strong>R$ 3.800,00</strong>.</li>
          <li>O widget de Rosca (Donut) no Dashboard exibe <code>Limite Comprometido = R$ 1.200,00 (24%)</code>.</li>
          <li>Conforme você paga a fatura mensal (R$ 100,00), o sistema libera R$ 100,00 do limite automaticamente!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > PAGAMENTO & BAIXA ATÔMICA -->
    <div class="wiki-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        💵 Pagamento de Fatura & Baixa Atômica
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao clicar no botão <strong>"Pagar Fatura"</strong> na aba de Planejamento:</p>
        <div style="background: var(--bg-raised); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <p style="margin-bottom: 6px;">1. 🏦 <strong>Débito em Conta:</strong> O valor líquido da fatura é subtraído do saldo da conta corrente selecionada.</p>
          <p style="margin-bottom: 6px;">2. 🏷️ <strong>Status da Fatura:</strong> A fatura é marcada como <span class="badge badge-green">Paga</span> com a data exata do pagamento.</p>
          <p style="margin: 0;">3. 📦 <strong>Baixa nas Compras:</strong> Todas as compras e parcelas pertencentes àquele ciclo são marcadas como quitadas em uma única transação atômica.</p>
        </div>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > RENEGOCIAÇÃO & ACORDO -->
    <div class="wiki-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🤝 Renegociação & Parcelamento de Fatura
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Caso você parcele ou faça um acordo da fatura com o banco:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Renegociar / Acordo"</strong> no card da fatura.</li>
          <li>Informe o valor da entrada (se houver) e a conta pagadora.</li>
          <li>Estipule o número de parcelas (ex: 6x) e o valor de cada uma.</li>
          <li>O sistema encerra a fatura com o selo <span class="badge badge-purple">🤝 Renegociada</span> e gera automaticamente as despesas recorrentes parceladas nos meses futuros.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > REABERTURA & ESTORNO -->
    <div class="wiki-topic-content" id="topic-cartao-reabertura" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔓 Reabertura de Fatura & Estorno Seguro
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você deu baixa ou renegociou uma fatura por engano:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Reabrir Fatura"</strong>.</li>
          <li>O valor pago é <strong>estornado de volta para o saldo da sua conta bancária</strong>.</li>
          <li>Se houve renegociação, as parcelas futuras geradas pelo acordo são canceladas e removidas.</li>
          <li>A fatura volta para o estado <span class="badge badge-yellow">⏳ Aberta</span> e recalcula seu valor total automaticamente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > COMPETÊNCIA -->
    <div class="wiki-topic-content" id="topic-lanc-competencia" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        📋 Mês de Referência (Competência: Ref: MM/AAAA)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O app permite controlar tanto a data de pagamento quanto o mês de competência:</p>
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
          <strong>Exemplo de Conta de Energia:</strong><br>
          • Consumo do mês de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>).<br>
          • Vencimento do boleto em <strong>10 de Março</strong> (Data de Pagamento: <code>10/03/2026</code>).
        </div>
        <p style="margin: 0;">Isso garante que ao emitir relatórios de gastos mensais, o custo seja computado no mês em que o consumo realmente ocorreu.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > FIXAS -->
    <div class="wiki-topic-content" id="topic-lanc-fixas" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        ⭐ Despesas Fixas (Recorrentes) & Prioridades
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Despesas fixas são aquelas que se repetem todo mês (Aluguel, Internet, Mensalidade Escolar, Financiamento):</p>
        <p style="margin-bottom: 8px;">• <strong>Estrela de Prioridade ⭐:</strong> Marque despesas essenciais com estrela para que fiquem no topo da lista.</p>
        <p style="margin: 0;">• <strong>Adiar Vencimento:</strong> Permite empurrar o vencimento de uma conta para frente se o orçamento do mês estiver apertado.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > AVULSOS -->
    <div class="wiki-topic-content" id="topic-lanc-avulsos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        🛍️ Despesas Variáveis do Mês (Avulsas)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Gastos esporádicos do dia a dia (Supermercado, Farmácia, Restaurante, Combustível):</p>
        <p style="margin: 0;">Clique no botão roxo <code>+ Nova Variável</code> em qualquer momento para registrar uma compra rápida, escolhendo a categoria, conta/cartão e quem realizou o gasto.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > JUROS & DESCONTOS -->
    <div class="wiki-topic-content" id="topic-lanc-juros" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        🏷️ Juros, Multas e Descontos Antecipados
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <strong>Desconto:</strong> Ao pagar antecipado com desconto, o sistema debita do saldo da conta apenas o valor líquido real.</p>
        <p style="margin: 0;">• <strong>Juros / Multa:</strong> Ao pagar em atraso, registre o acréscimo para que o valor real debitado corresponda exatamente ao extrato do banco.</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > TIPOS -->
    <div class="wiki-topic-content" id="topic-contas-tipos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        🏦 Tipos de Contas Bancárias & Carteiras
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <span class="badge badge-blue">Conta Corrente</span>: Banco do Brasil, Itaú, Nubank, etc.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-green">Poupança / Investimentos</span>: Reserva de emergência e aplicações.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-yellow">Carteira Física</span>: Dinheiro em espécie na mão.</p>
        <p style="margin: 0;">• <span class="badge badge-cyan">Voucher</span>: Vale Refeição / Alimentação (Alelo, Ticket, Sodexo).</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > TRANSFERÊNCIAS -->
    <div class="wiki-topic-content" id="topic-contas-transf" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        🔁 Transferências entre Contas sem Duplicação
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Ao usar o botão <strong>"Nova Transferência"</strong> na tela de Contas, o saldo é transferido da conta de origem para a de destino sem gerar receitas ou despesas artificiais no balanço familiar.</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > PRODUTOS -->
    <div class="wiki-topic-content" id="topic-contas-produtos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        💳 Produtos da Conta (Banricompras, Cheque Especial)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">O aplicativo suporta produtos acoplados à conta corrente, permitindo parcelar despesas em débito pré-datado ou controlar o uso do cheque especial com visibilidade total.</p>
      </div>
    </div>

    <!-- TÓPICO: FAMÍLIA > PERFIS -->
    <div class="wiki-topic-content" id="topic-fam-perfis" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #a78bfa; font-weight: 700;">
        👑 Papéis de Usuário (ADM, Responsável, Colaborador, Caçula)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• 👑 <strong>ADM Geral:</strong> Gestão técnica, auditoria e backups globais.</p>
        <p style="margin-bottom: 8px;">• ⭐ <strong>Responsável:</strong> Gestão financeira da casa, membros e permissões.</p>
        <p style="margin-bottom: 8px;">• 👤 <strong>Colaborador:</strong> Membro adulto com acesso às suas finanças e menus autorizados.</p>
        <p style="margin: 0;">• 🧸 <strong>Caçula:</strong> Interface especial para crianças e controle de mesada.</p>
      </div>
    </div>

    <!-- TÓPICO: FAMÍLIA > PERMISSÕES -->
    <div class="wiki-topic-content" id="topic-fam-permissoes" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #a78bfa; font-weight: 700;">
        🔒 Permissões Granulares por Menu
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Em <em>Configurações ⚙️ → Membros da Família</em>, o Responsável pode ativar ou desativar individualmente quais telas cada membro pode visualizar (Dashboard, Contas, Metas, Relatórios).</p>
      </div>
    </div>

    <!-- TÓPICO: ORÇAMENTOS > BUDGETS -->
    <div class="wiki-topic-content" id="topic-orc-budgets" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #f43f5e; font-weight: 700;">
        📊 Tetos de Gastos por Categoria (Budgets)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Estipule um limite máximo para categorias como Alimentação, Lazer e Transporte. O app avisa com barras coloridas quando você atinge 70%, 90% ou 100% do teto estipulado.</p>
      </div>
    </div>

    <!-- TÓPICO: ORÇAMENTOS > METAS -->
    <div class="wiki-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #f43f5e; font-weight: 700;">
        🏆 Metas Financeiras & Depósitos (Aportes)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Crie objetivos da família (Viagem de Férias, Carro Novo, Reforma) e registre aportes mensais até completar 100% da meta!</p>
      </div>
    </div>

    <!-- TÓPICO: METODOLOGIA > REGRA 50-30-20 -->
    <div class="wiki-topic-content" id="topic-met-regra" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #c084fc; font-weight: 700;">
        💡 Metodologia Familiar: A Regra dos 50-30-20
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(192,132,252,0.08); border-left: 4px solid #c084fc; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
          <strong>Divisão Ideal da Renda Familiar:</strong><br>
          • <strong>50% — Necessidades Básicas:</strong> Moradia, mercado, saúde, contas de consumo.<br>
          • <strong>30% — Estilo de Vida:</strong> Passeios, restaurantes, cinema, hobbies.<br>
          • <strong>20% — Futuro & Metas:</strong> Reserva de emergência e investimentos.
        </div>
      </div>
    </div>

    <!-- TÓPICO: FAQ INTERATIVO (ACCORDION CLICK-TO-EXPAND) -->
    <div class="wiki-topic-content" id="topic-faq-interativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 15px; color: #f87171; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
        <span>❓ Perguntas Frequentes (Clique para Ver a Resposta)</span>
      </h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>📱 Como conectar o aplicativo ao celular na mesma rede Wi-Fi?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Basta certificar-se de que o computador e o celular estão conectados na mesma rede Wi-Fi. No app do computador, clique no ícone <strong>"Conectar Celular 📱"</strong> no menu lateral e aponte a câmera do celular para o QR Code exibido na tela.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔑 Como funciona a recuperação de senha com pergunta secreta?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Na tela de login, clique no link <em>"Esqueci minha senha"</em>, informe seu nome de usuário e responda à pergunta de segurança cadastrada. O sistema valida sua resposta e permite cadastrar uma nova senha imediatamente.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 Uma compra parcelada no cartão consome o limite inteiro imediatamente?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Sim! O limite global do cartão é comprometido pelo valor integral da compra no momento do lançamento. O limite disponível vai sendo restabelecido mês a mês conforme você realiza o pagamento de cada fatura.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🤝 O que acontece quando renegocio ou reabro uma fatura de cartão?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Na renegociação, a fatura é quitada por acordo e as parcelas futuras são geradas automaticamente. Ao <strong>reabrir</strong>, o sistema desfaz o acordo, cancela as parcelas pendentes e estorna o pagamento para a conta corrente de forma segura e atômica.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>📦 Como exportar meus dados financeiros em Excel (.xlsx) ou CSV?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Acesse <em>Configurações ⚙️ → Backups & Dados</em> e clique no botão de exportação desejado. Seus dados são formatados com cabeçalhos claros e valores compatíveis com Excel e Google Planilhas.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Registra todos os eventos interativos da Wiki de Configurações
 */
function setupSettingsWikiEvents(bodyEl) {
  if (!bodyEl) return;

  const treeHeaders = bodyEl.querySelectorAll('.wiki-tree-header');
  const treeItems = bodyEl.querySelectorAll('.wiki-tree-item');
  const crumbCat = document.getElementById('wiki-crumb-cat');
  const crumbSub = document.getElementById('wiki-crumb-sub');
  const topicContents = bodyEl.querySelectorAll('.wiki-topic-content');

  // Toggle tree groups open/closed
  treeHeaders.forEach(hdr => {
    hdr.onclick = () => {
      const subs = hdr.nextElementSibling;
      const arrow = hdr.querySelector('.wiki-tree-arrow');
      if (subs) {
        const isHidden = subs.style.display === 'none';
        subs.style.display = isHidden ? 'flex' : 'none';
        if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
      }
    };
  });

  // Select specific topic in tree
  treeItems.forEach(item => {
    item.onclick = () => {
      treeItems.forEach(i => {
        i.classList.remove('active');
        i.style.borderLeftColor = 'transparent';
        i.style.color = 'var(--text-muted)';
        i.style.background = 'transparent';
      });
      item.classList.add('active');
      item.style.borderLeftColor = 'var(--accent)';
      item.style.color = 'var(--text-primary)';
      item.style.background = 'var(--bg-raised)';

      // Update breadcrumbs
      const parentGroup = item.closest('.wiki-tree-group');
      const groupHeader = parentGroup ? parentGroup.querySelector('.wiki-tree-header span') : null;
      if (crumbCat && groupHeader) crumbCat.textContent = groupHeader.textContent;
      if (crumbSub) crumbSub.textContent = item.textContent.replace('•', '').trim();

      // Show matching topic content
      const topicKey = item.dataset.topic;
      topicContents.forEach(tc => {
        tc.style.display = tc.id === `topic-${topicKey}` ? 'block' : 'none';
      });

      // Scroll display panel to top
      const displayPanel = bodyEl.querySelector('#wiki-display-panel');
      if (displayPanel) displayPanel.scrollTop = 0;
    };
  });

  // 2. INTERACTIVE FAQ ACCORDION
  bodyEl.querySelectorAll('.wiki-faq-q').forEach(qEl => {
    qEl.onclick = () => {
      const aEl = qEl.nextElementSibling;
      const chevron = qEl.querySelector('.faq-chevron');
      if (aEl) {
        const isHidden = aEl.style.display === 'none';
        aEl.style.display = isHidden ? 'block' : 'none';
        if (chevron) chevron.textContent = isHidden ? '➖' : '➕';
      }
    };
  });

  // 3. REAL-TIME SEARCH IN WIKI TOPICS & FAQ
  const searchInput = bodyEl.querySelector('#wiki-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q) {
        if (crumbCat) crumbCat.textContent = 'Busca';
        if (crumbSub) crumbSub.textContent = `Resultados para "${q}"`;
        topicContents.forEach(tc => {
          const text = tc.textContent.toLowerCase();
          tc.style.display = text.includes(q) ? 'block' : 'none';
        });
        bodyEl.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          const text = acc.textContent.toLowerCase();
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (text.includes(q)) {
            acc.style.display = 'block';
            if (aEl) aEl.style.display = 'block';
            if (chevron) chevron.textContent = '➖';
          } else {
            acc.style.display = 'none';
          }
        });
      } else {
        // Restore active tree topic
        const activeItem = bodyEl.querySelector('.wiki-tree-item.active');
        if (activeItem) activeItem.click();
        bodyEl.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          acc.style.display = 'block';
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (aEl) aEl.style.display = 'none';
          if (chevron) chevron.textContent = '➕';
        });
      }
    };
  }
}

/**
 * Renderiza a aba de Wiki no Modal de Configurações
 */
function renderSettingsWikiTab(bodyEl) {
  bodyEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <span>📚 Base de Conhecimento (Wiki)</span>
      </h3>
      <span class="badge badge-purple" style="font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">Guia Oficial</span>
    </div>

    <!-- BREADCRUMB / TRILHA DE NAVEGAÇÃO -->
    <div id="wiki-breadcrumb" style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); flex-wrap: wrap;">
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="wiki-crumb-root">📚 WIKI</span>
      <span style="opacity: 0.4;">›</span>
      <span id="wiki-crumb-cat" style="color: #60a5fa; font-weight: 600;">💳 Cartões de Crédito</span>
      <span style="opacity: 0.4;">›</span>
      <span id="wiki-crumb-sub" style="color: var(--accent-light); font-weight: 700;">Competência vs Vencimento</span>
    </div>

    <!-- BUSCA GLOBAL NA WIKI -->
    <div style="margin-bottom: 12px; position: relative;">
      <input type="text" id="wiki-search-input" placeholder="🔍 Pesquisar em todos os tópicos da Wiki..."
             style="width: 100%; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 12.5px; outline: none;">
    </div>

    <!-- CONTAINER PRINCIPAL: MENU EM ÁRVORE (ESQUERDA) + CONTEÚDO (DIREITA) -->
    <div style="display: flex; gap: 14px; height: 430px; overflow: hidden;">
      ${getSettingsWikiSidebarHtml()}
      
      <!-- PAINEL DE CONTEÚDO (DIREITA) -->
      <div id="wiki-display-panel" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 18px; scrollbar-width: thin;">
        ${getSettingsWikiTopicsHtml()}
      </div>
    </div>
  `;

  setupSettingsWikiEvents(bodyEl);
}

/**
 * Renderiza a aba de LGPD no Modal de Configurações
 */
function renderSettingsLgpdTab(bodyEl) {
  bodyEl.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      ⚖️ Privacidade & LGPD (Conformidade)
    </h3>
    <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
      De acordo com a Lei Geral de Proteção de Dados (LGPD), você possui o controle total sobre seus dados pessoais cadastrais e registros de transações financeiras.
      <br><br>
      <strong>Termos aceitos em:</strong> ${State.user.accepted_terms_timestamp ? new Date(State.user.accepted_terms_timestamp).toLocaleString('pt-BR') : 'Não registrado (versão legada)'}
      <br>
      <strong>Versão dos termos:</strong> ${State.user.accepted_terms_version || 'N/A'}
    </div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
      <button class="btn btn-secondary btn-sm" id="btn-show-terms-settings" style="padding: 8px 16px;">Visualizar Termos de Uso</button>
      <button class="btn btn-secondary btn-sm" id="btn-show-privacy-settings" style="padding: 8px 16px;">Visualizar Política de Privacidade</button>
      <button class="btn btn-secondary btn-sm" id="btn-export-my-data" style="padding: 8px 16px; display: flex; align-items: center; gap: 6px;">📦 Exportar Meus Dados (JSON)</button>
    </div>
    <div style="border-top: 1px dashed var(--border); margin: 16px 0;"></div>
    <div>
      <div style="font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">⚠️ Excluir Minha Conta (Direito ao Esquecimento)</div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
        Ao clicar no botão abaixo, todos os seus dados pessoais (nome, CPF, e-mail, telefone), contas bancárias registradas, transações financeiras, orçamentos e metas serão <strong>excluídos permanentemente</strong> de nossos bancos de dados, sem possibilidade de recuperação.
      </p>
      <button class="btn btn-danger btn-sm" id="btn-delete-my-account" style="background-color: #ef4444; border-color: #ef4444; color: #ffffff; padding: 8px 16px;">
        Excluir Definitivamente Minha Conta
      </button>
    </div>
  `;

  bindLgpdTabEvents();
}


/* ==== settings-2.js ==== */
/* ===
 * settings-2.js — Parte 2 de settings
 * Linhas 7471–7936 do app.js
 */

function bindProfileTabEvents(categories, users) {
  const profCpf = document.getElementById('prof-cpf');
  if (profCpf) {
    profCpf.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`;
      }
      e.target.value = value;
    };
  }

  const profPhone = document.getElementById('prof-phone');
  if (profPhone) {
    profPhone.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      e.target.value = value;
    };
  }

  const profUsername = document.getElementById('prof-username');
  if (profUsername) {
    profUsername.oninput = (e) => {
      let value = e.target.value.toLowerCase();
      value = value.replace(/[^a-z0-9_.-]/g, "");
      e.target.value = value;
    };
  }

  const saveProfileBtn = document.getElementById('save-my-profile');
  if (saveProfileBtn) {
    saveProfileBtn.onclick = async () => {
      const err = document.getElementById('prof-error-text');
      if (err) err.textContent = '';
      
      const firstName = document.getElementById('prof-first-name').value.trim();
      const lastName = document.getElementById('prof-last-name').value.trim();
      const cpf = document.getElementById('prof-cpf').value.trim();
      const birthDate = document.getElementById('prof-birth-date').value;
      const email = document.getElementById('prof-email').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const username = document.getElementById('prof-username') ? document.getElementById('prof-username').value.trim() : State.user.username;
      const password = document.getElementById('prof-password').value;
      const recovery_question = document.getElementById('prof-recovery-question').value;
      const recovery_answer = document.getElementById('prof-recovery-answer').value.trim();

      if (!firstName || !lastName || !cpf || !birthDate || !email || !phone || !username) {
        if (err) err.textContent = 'Por favor, preencha todos os campos obrigatórios';
        return;
      }

      if (cpf.length < 14) {
        if (err) err.textContent = 'CPF inválido';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (err) err.textContent = 'E-mail inválido';
        return;
      }
      if (phone.length < 14) {
        if (err) err.textContent = 'Celular inválido';
        return;
      }

      const payload = {
        id: State.user.id,
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        cpf,
        birth_date: birthDate,
        email,
        phone,
        username,
        recovery_question,
      };
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          if (err) err.textContent = 'A nova senha deve possuir no mínimo 6 caracteres';
          return;
        }
        payload.password = password;
      }
      if (recovery_answer) {
        payload.recovery_answer = recovery_answer;
      }

      const r = await window.api.auth.updateUser(payload);
      if (!r.success) {
        if (err) err.textContent = r.error;
        return;
      }

      State.user.name = payload.name;
      State.user.first_name = payload.first_name;
      State.user.last_name = payload.last_name;
      State.user.cpf = payload.cpf;
      State.user.birth_date = payload.birth_date;
      State.user.email = payload.email;
      State.user.phone = payload.phone;
      State.user.username = payload.username;
      
      document.getElementById('sidebar-user-name').textContent = State.user.name;
      toast('Seu perfil foi atualizado com sucesso!', 'success');
      openSettingsModal('profile');
    };
  }

  if (document.getElementById('save-alert-days')) {
    document.getElementById('save-alert-days').onclick = async () => {
      const days = parseInt(document.getElementById('alert-days').value);
      if (!days || days < 1) { toast('Informe um valor válido', 'error'); return; }
      await window.api.settings.set(State.user.id, 'alert_days_before', days);
      State.settings.alert_days_before = days;
      toast('Configuração de alertas salva!');
    };
  }

  if (document.getElementById('btn-add-user')) {
    document.getElementById('btn-add-user').onclick = () => openRegisterModal();
  }

  if (State.permissions.can_edit_all === 1) {
    document.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.onclick = () => {
        const uId = parseInt(btn.dataset.id);
        const targetUser = users.find(u => u.id === uId);
        if (targetUser) openEditUserModal(targetUser);
      };
    });

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.onclick = async () => {
        const uId = parseInt(btn.dataset.id);
        const targetUser = users.find(u => u.id === uId);
        if (targetUser) {
          const confirmMsg = `Tem certeza que deseja excluir o usuário "${targetUser.name}" (@${targetUser.username})?`;
          if (confirm(confirmMsg)) {
            const r = await window.api.auth.deleteUser(uId);
            if (r && r.error) {
              toast(r.error, 'error');
            } else {
              toast('Usuário excluído');
              openSettingsModal('profile');
            }
          }
        }
      };
    });
  }
}

function bindBackupTabEvents(capitalizedMonth) {
  const downloadBase64File = (base64Content, filename, mimeType) => {
    const binaryStr = atob(base64Content);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (document.getElementById('btn-backup')) {
    document.getElementById('btn-backup').onclick = async () => {
      try {
        const r = await window.api.backup.export();
        if (r && r.fileData) {
          downloadBase64File(r.fileData, r.filename || 'financeiro.db', 'application/x-sqlite3');
          toast('Backup exportado com sucesso!');
        } else if (r && r.success) {
          toast('Backup exportado!');
        } else {
          toast('Erro ao exportar backup', 'error');
        }
      } catch (err) {
        toast('Erro na exportação: ' + err.message, 'error');
      }
    };
  }

  if (document.getElementById('btn-restore-backup')) {
    document.getElementById('btn-restore-backup').onclick = () => {
      document.getElementById('input-restore-backup').click();
    };
    
    document.getElementById('input-restore-backup').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const confirmRestore = confirm('⚠️ ATENÇÃO: Restaurar o banco de dados irá SOBRESCREVER todos os dados atuais!');
      if (!confirmRestore) { e.target.value = ''; return; }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        try {
          const res = await window.api.backup.restore({ fileData: base64 });
          if (res.success) {
            alert('Banco de dados restaurado com sucesso!');
            window.location.reload();
          } else {
            alert('Erro ao restaurar: ' + (res.error || 'Erro desconhecido.'));
          }
        } catch (err) {
          alert('Erro ao restaurar: ' + err.message);
        }
      };
      reader.readAsDataURL(file);
    };
  }

  if (document.getElementById('btn-export-month')) {
    document.getElementById('btn-export-month').onclick = async () => {
      try {
        const res = await window.api.backup.exportExcel({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, type: 'monthly' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          }
          toast('Excel mensal exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-year')) {
    document.getElementById('btn-export-year').onclick = async () => {
      try {
        const res = await window.api.backup.exportExcel({ userId: State.user.id, year: State.currentYear, type: 'annual' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          }
          toast('Excel anual exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-csv-month')) {
    document.getElementById('btn-export-csv-month').onclick = async () => {
      try {
        const res = await window.api.backup.exportCsv({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, type: 'monthly' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'text/csv;charset=utf-8;');
          }
          toast('CSV mensal exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar CSV: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar CSV: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-csv-year')) {
    document.getElementById('btn-export-csv-year').onclick = async () => {
      try {
        const res = await window.api.backup.exportCsv({ userId: State.user.id, year: State.currentYear, type: 'annual' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'text/csv;charset=utf-8;');
          }
          toast('CSV anual exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar CSV: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar CSV: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-json')) {
    document.getElementById('btn-export-json').onclick = async () => {
      try {
        const res = await window.api.backup.exportJson({ userId: State.user.id });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/json;charset=utf-8;');
          }
          toast('Backup JSON exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar JSON: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar JSON: ' + err.message, 'error'); }
    };
  }
}

function bindLgpdTabEvents() {
  const btnShowTerms = document.getElementById('btn-show-terms-settings');
  const btnShowPrivacy = document.getElementById('btn-show-privacy-settings');
  if (btnShowTerms) {
    btnShowTerms.onclick = () => {
      const overlay = document.getElementById('lgpd-modal-overlay');
      const title = document.getElementById('lgpd-modal-title');
      const content = document.getElementById('lgpd-modal-content');
      title.textContent = 'Termos de Uso';
      content.textContent = TERMS_OF_USE_TEXT;
      overlay.style.display = 'flex';
    };
  }
  if (btnShowPrivacy) {
    btnShowPrivacy.onclick = () => {
      const overlay = document.getElementById('lgpd-modal-overlay');
      const title = document.getElementById('lgpd-modal-title');
      const content = document.getElementById('lgpd-modal-content');
      title.textContent = 'Política de Privacidade (LGPD)';
      content.textContent = PRIVACY_POLICY_TEXT;
      overlay.style.display = 'flex';
    };
  }

  const btnExportMyData = document.getElementById('btn-export-my-data');
  if (btnExportMyData) {
    btnExportMyData.onclick = async () => {
      try {
        const data = await window.api.auth.exportMyData(State.user.id);
        if (!data) { toast('Erro ao exportar seus dados', 'error'); return; }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `meus-dados-financeiro-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast('Seus dados foram exportados com sucesso!', 'success');
      } catch (err) {
        toast('Erro ao exportar dados: ' + err.message, 'error');
      }
    };
  }

  const btnDeleteMyAccount = document.getElementById('btn-delete-my-account');
  if (btnDeleteMyAccount) {
    btnDeleteMyAccount.onclick = () => {
      if (State.user.username === 'adm') {
        toast('O administrador do sistema (adm) não pode ser excluído!', 'error');
        return;
      }
      Modal.open('⚠️ Confirmar Exclusão de Conta', `
        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">
          Esta ação é irreversível. Para confirmar a exclusão completa de todos os seus dados cadastrais e financeiros do sistema, digite a sua senha de acesso abaixo:
        </div>
        <div class="form-group">
          <label for="delete-account-password">Sua Senha de Acesso</label>
          <input type="password" id="delete-account-password" placeholder="Digite sua senha atual" style="width:100%;">
        </div>
        <p class="auth-error" id="delete-account-error" style="margin: 0; font-size: 12px;"></p>
        <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
          <button class="btn btn-secondary" id="btn-cancel-delete">Cancelar</button>
          <button class="btn btn-danger" id="btn-confirm-delete" style="background-color: #ef4444; border-color: #ef4444; color: #ffffff;">Excluir Conta Permanentemente</button>
        </div>
      `);
      
      document.getElementById('btn-cancel-delete').onclick = Modal.close;
      document.getElementById('btn-confirm-delete').onclick = async () => {
        const passwordInput = document.getElementById('delete-account-password').value;
        const errEl = document.getElementById('delete-account-error');
        errEl.textContent = '';
        if (!passwordInput) { errEl.textContent = 'Por favor, insira sua senha.'; return; }
        const confirmBtn = document.getElementById('btn-confirm-delete');
        confirmBtn.disabled = true; confirmBtn.textContent = 'Processando...';
        
        const authCheck = await window.api.auth.login({ username: State.user.username, password: passwordInput });
        if (!authCheck.success) {
          errEl.textContent = 'Senha incorreta. Acesso negado.';
          confirmBtn.disabled = false; confirmBtn.textContent = 'Excluir Conta Permanentemente';
          return;
        }
        
        const delRes = await window.api.auth.deleteSelf(State.user.id);
        if (delRes.success) {
          Modal.close();
          toast('Sua conta e todos os seus dados foram purgados do sistema.', 'success');
          localStorage.removeItem('sessionToken');
          sessionStorage.removeItem('sessionToken');
          State.user = null;
          State.token = null;
          setTimeout(() => { window.location.reload(); }, 1500);
        } else {
          errEl.textContent = delRes.error || 'Erro ao processar exclusão de dados.';
          confirmBtn.disabled = false; confirmBtn.textContent = 'Excluir Conta Permanentemente';
        }
      };
    };
  }
}

function openCategoryModal(categories, editCategory = null) {
  const initialIcon = editCategory ? editCategory.icon : '📋';
  const initialColor = editCategory ? editCategory.color : COLORS[0];
  const initialType = editCategory ? editCategory.type : 'expense';
  const initialName = editCategory ? editCategory.name : '';

  Modal.open(editCategory ? 'Editar Categoria' : 'Nova Categoria', `
    <div class="form-group"><label>Nome</label><input type="text" id="cat-name" placeholder="Nome da categoria" value="${initialName}"></div>
    <div class="form-group"><label>Tipo</label><select id="cat-type">
      <option value="expense" ${initialType === 'expense' ? 'selected' : ''}>Despesa</option>
      <option value="income" ${initialType === 'income' ? 'selected' : ''}>Receita</option>
    </select></div>
    <div class="form-group"><label>Ícone</label><div class="icon-picker" id="cat-icon-picker">${[...ICONS_EXPENSE,...ICONS_INCOME].map(i => `<button class="icon-btn ${i===initialIcon?'selected':''}" data-icon="${i}">${i}</button>`).join('')}</div></div>
    <div class="form-group"><label>Cor</label><div class="color-picker" id="cat-color-picker">${COLORS.map(c => `<div class="color-swatch ${c===initialColor?'selected':''}" style="background:${c}" data-color="${c}"></div>`).join('')}</div></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="cat-cancel">Cancelar</button>
      <button class="btn btn-primary" id="cat-save">${editCategory ? 'Salvar' : 'Criar'}</button>
    </div>`);

  let icon = initialIcon, color = initialColor;
  document.querySelectorAll('#cat-icon-picker .icon-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('#cat-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; }; });
  document.querySelectorAll('#cat-color-picker .color-swatch').forEach(sw => { sw.onclick = () => { document.querySelectorAll('#cat-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.selected = true; sw.classList.add('selected'); color = sw.dataset.color; }; });
  document.getElementById('cat-cancel').onclick = Modal.close;
  document.getElementById('cat-save').onclick = async () => {
    const name = document.getElementById('cat-name').value.trim();
    if (!name) { toast('Informe o nome', 'error'); return; }
    
    let res;
    if (editCategory) {
      res = await window.api.categories.update({ id: editCategory.id, name, type: document.getElementById('cat-type').value, color, icon });
      if (res && res.error) {
        toast('Erro ao atualizar categoria: ' + res.error, 'error');
        return;
      }
      toast('Categoria atualizada');
    } else {
      res = await window.api.categories.create({ user_id: State.user.id, name, type: document.getElementById('cat-type').value, color, icon });
      if (res && res.error) {
        toast('Erro ao criar categoria: ' + res.error, 'error');
        return;
      }
      toast('Categoria criada');
    }
    Modal.close(); renderSettings();
  };
}

// ════════════════════════════════════════
// LOGIN / AUTH
// ════════════════════════════════════════

/* ==== auth.js ==== */
/* ===
 * auth.js — L7937–8876 do app.js
 */

async function initLoginScreen() {
  const familyId = localStorage.getItem('financeiro_family_id');
  const familyName = localStorage.getItem('financeiro_family_name');
  
  const divider = document.querySelector('.login-divider');
  const list = document.getElementById('user-list');
  
  if (familyId) {
    let users = null;
    try {
      users = await window.api.auth.getUsers({ familyId });
    } catch (e) {
      console.warn("Could not load users list:", e);
    }

    if (users && !users.error && Array.isArray(users) && users.length > 0) {
      list.innerHTML = users.map(u => `
        <div class="user-chip" data-username="${u.username}">
          ${renderAvatarHtml(u, 28)}
          ${u.name}
        </div>`).join('');
      
      const changeWrap = document.createElement('div');
      changeWrap.style.cssText = 'text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;';
      changeWrap.innerHTML = `
        <span>Dispositivo vinculado à <strong>${familyName || 'Família'}</strong></span>
        <button id="btn-change-family" style="background:none; border:none; color: var(--accent-light); cursor: pointer; text-decoration: underline; font-weight: 600; font-family: inherit; font-size: 11px; padding:0;">Alterar</button>
      `;
      list.appendChild(changeWrap);
      
      document.getElementById('btn-change-family').onclick = () => {
        localStorage.removeItem('financeiro_family_id');
        localStorage.removeItem('financeiro_family_name');
        initLoginScreen();
      };
      
      if (divider) divider.style.display = 'flex';
      
      document.querySelectorAll('.user-chip').forEach(chip => {
        chip.onclick = () => { 
          document.getElementById('login-username').value = chip.dataset.username; 
          document.getElementById('login-password').focus(); 
        };
      });
    } else {
      list.innerHTML = '';
      if (divider) divider.style.display = 'none';
      
      const changeWrap = document.createElement('div');
      changeWrap.style.cssText = 'text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;';
      changeWrap.innerHTML = `
        <span>Dispositivo vinculado à <strong>${familyName || 'Família'}</strong></span>
        <button id="btn-change-family" style="background:none; border:none; color: var(--accent-light); cursor: pointer; text-decoration: underline; font-weight: 600; font-family: inherit; font-size: 11px; padding:0;">Alterar</button>
      `;
      list.appendChild(changeWrap);
      
      document.getElementById('btn-change-family').onclick = () => {
        localStorage.removeItem('financeiro_family_id');
        localStorage.removeItem('financeiro_family_name');
        initLoginScreen();
      };
    }
  } else {
    list.innerHTML = `
      <div style="text-align: center; padding: 16px; font-size: 12px; color: var(--text-muted); background: rgba(255,255,255,0.01); border: 1px dashed var(--border); border-radius: var(--radius-sm); margin-bottom: 12px; line-height: 1.5;">
        🔒 <strong>Conexão Segura e Isolada</strong><br>
        Faça login manualmente uma vez para vincular este dispositivo à sua família.
      </div>
    `;
    if (divider) divider.style.display = 'none';
  }
  
  document.getElementById('toggle-login-pass').onclick = () => { const i = document.getElementById('login-password'); i.type = i.type === 'password' ? 'text' : 'password'; };
  document.getElementById('toggle-reg-pass').onclick  = () => { const i = document.getElementById('reg-password');   i.type = i.type === 'password' ? 'text' : 'password'; };
  document.getElementById('go-register').onclick = (e) => { e.preventDefault(); openSignUpWizard(); };
  document.getElementById('go-login').onclick    = (e) => {
    e.preventDefault();
    document.getElementById('register-form-wrap').classList.add('hidden');
    document.getElementById('login-form-wrap').classList.remove('hidden');
  };

  // Esqueci minha senha navigation
  document.getElementById('go-recover').onclick = (e) => {
    e.preventDefault();
    document.getElementById('login-form-wrap').classList.add('hidden');
    document.getElementById('recovery-form-wrap').classList.remove('hidden');
    document.getElementById('recovery-step-1').classList.remove('hidden');
    document.getElementById('recovery-step-2').classList.add('hidden');
    document.getElementById('recovery-error').textContent = '';
    document.getElementById('rec-username').value = '';
    document.getElementById('rec-answer').value = '';
    document.getElementById('rec-new-password').value = '';
  };

  document.getElementById('recovery-go-back').onclick = (e) => {
    e.preventDefault();
    document.getElementById('recovery-form-wrap').classList.add('hidden');
    document.getElementById('login-form-wrap').classList.remove('hidden');
  };

  // Verify username to load security question
  document.getElementById('rec-verify-user-btn').onclick = async () => {
    const username = document.getElementById('rec-username').value.trim();
    const errEl = document.getElementById('recovery-error');
    errEl.textContent = '';
    if (!username) { errEl.textContent = 'Digite seu usuário'; return; }
    
    try {
      const btn = document.getElementById('rec-verify-user-btn');
      btn.disabled = true; btn.textContent = 'Verificando...';
      const r = await window.api.auth.getRecoveryQuestion(username);
      btn.disabled = false; btn.textContent = 'Verificar Usuário';
      
      if (!r.success) {
        errEl.textContent = r.error;
        return;
      }
      
      document.getElementById('rec-question-text').textContent = r.question;
      document.getElementById('recovery-step-1').classList.add('hidden');
      document.getElementById('recovery-step-2').classList.remove('hidden');
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Erro de rede ou servidor';
    }
  };

  // Submit Answer to Reset Password
  document.getElementById('recovery-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('rec-username').value.trim();
    const answer = document.getElementById('rec-answer').value.trim();
    const newPassword = document.getElementById('rec-new-password').value;
    const errEl = document.getElementById('recovery-error');
    errEl.textContent = '';
    
    if (!answer || !newPassword) { errEl.textContent = 'Preencha a resposta e a nova senha'; return; }
    if (newPassword.length < 6) { errEl.textContent = 'A nova senha deve ter no mínimo 6 caracteres'; return; }
    
    try {
      const btn = document.getElementById('rec-reset-btn');
      btn.disabled = true; btn.textContent = 'Processando...';
      const r = await window.api.auth.resetPasswordWithAnswer({ username, answer, newPassword });
      btn.disabled = false; btn.textContent = 'Redefinir Senha';
      
      if (!r.success) {
        errEl.textContent = r.error;
        return;
      }
      
      toast('Senha redefinida com sucesso! Faça login.');
      document.getElementById('recovery-form-wrap').classList.add('hidden');
      document.getElementById('login-form-wrap').classList.remove('hidden');
      document.getElementById('login-username').value = username;
      document.getElementById('login-password').value = '';
      document.getElementById('login-password').focus();
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Erro de conexão';
    }
  };
}

function showWizardFamilyChoiceModal(familyName, ownerName, onJoin, onNew) {
  const dialog = document.createElement('div');
  dialog.id = 'wizard-family-choice-modal';
  dialog.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 13, 20, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10005;
  `;

  dialog.innerHTML = `
    <div class="modal" style="display: block; position: relative; max-width: 500px; width: 90%; background: var(--bg-surface, #141923); border: 1px solid var(--border, #242f41); border-radius: var(--radius-md, 12px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); transform: none; animation: modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1);">
      <div class="modal-body" style="padding: 28px; text-align: center;">
        <span style="font-size: 40px; display: block; margin-bottom: 16px;">👥</span>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary, #ffffff); margin-bottom: 12px;">Família Já Cadastrada!</h3>
        <p style="font-size: 14px; color: var(--text-secondary, #94a3b8); line-height: 1.6; margin-bottom: 24px;">
          A família <strong>${familyName}</strong> já existe no sistema.<br>
          O responsável atual é <strong>${ownerName || 'Administrador'}</strong>.
        </p>
        <p style="font-size: 13px; color: var(--text-muted, #64748b); margin-bottom: 24px; font-style: italic;">
          Deseja se juntar a ela como membro ou prefere criar um grupo familiar novo com este mesmo nome?
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary" id="choice-join" style="width: 100%; padding: 12px; font-weight: 600;">🤝 Sim, quero me juntar a esta família</button>
          <button class="btn btn-secondary" id="choice-new" style="width: 100%; padding: 12px; font-weight: 600; border: 1px dashed var(--border);">🆕 Não, criar uma família nova</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById('choice-join').onclick = () => {
    dialog.remove();
    onJoin();
  };

  document.getElementById('choice-new').onclick = () => {
    dialog.remove();
    onNew();
  };
}

// ════════════════════════════════════════
// NEW SIGNUP WIZARD OVERLAY POP-UP SYSTEM
// ════════════════════════════════════════
let currentSignUpStep = 1;
let signupFamilyId = null;

function openSignUpWizard() {
  const overlay = document.getElementById('signup-wizard-overlay');
  overlay.classList.add('active');
  currentSignUpStep = 1;
  signupFamilyId = null;
  updateSignUpWizardUI();

  // Clear inputs
  document.getElementById('wiz-first-name').value = '';
  document.getElementById('wiz-last-name').value = '';
  document.getElementById('wiz-cpf').value = '';
  document.getElementById('wiz-birth-date').value = '';
  document.getElementById('wiz-email').value = '';
  document.getElementById('wiz-phone').value = '';
  document.getElementById('wiz-family-name').value = '';
  document.getElementById('wiz-username').value = '';
  document.getElementById('wiz-password').value = '';
  document.getElementById('wiz-error-text').textContent = '';

  // Setup input listeners for sanitization & masks
  setupWizardMasksAndValidators();
}

function setupWizardMasksAndValidators() {
  const cpfInput = document.getElementById('wiz-cpf');
  if (cpfInput) {
    cpfInput.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (value.length > 11) value = value.slice(0, 11);
      
      // Apply CPF formatting mask: 000.000.000-00
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`;
      }
      e.target.value = value;
    };
  }

  const phoneInput = document.getElementById('wiz-phone');
  if (phoneInput) {
    phoneInput.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (value.length > 11) value = value.slice(0, 11);

      // Apply Phone formatting mask: (00) 00000-0000
      if (value.length > 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      e.target.value = value;
    };
  }

  const usernameInput = document.getElementById('wiz-username');
  if (usernameInput) {
    usernameInput.oninput = (e) => {
      // Sanitize in real-time: lowercase only, replace invalid characters instantly
      let value = e.target.value.toLowerCase();
      value = value.replace(/[^a-z0-9_.-]/g, ""); // Remove anything that is not lowercase, numbers, dots, dashes, underscores
      e.target.value = value;
    };
  }

  const passwordInput = document.getElementById('wiz-password');
  if (passwordInput) {
    passwordInput.oninput = (e) => {
      const pwd = e.target.value;
      const bar = document.getElementById('wiz-pass-strength-bar');
      const text = document.getElementById('wiz-pass-strength-text');

      if (!bar || !text) return;

      if (!pwd) {
        bar.style.width = '0%';
        bar.style.backgroundColor = '#ef4444';
        text.textContent = 'Força: Muito fraca';
        text.style.color = '#ef4444';
        return;
      }

      let score = 0;
      if (pwd.length >= 6) score += 1;
      if (pwd.length >= 10) score += 1;
      if (/\d/.test(pwd)) score += 1; // has digit
      if (/[a-zA-Z]/.test(pwd)) score += 1; // has letter
      if (/[^a-zA-Z0-9]/.test(pwd)) score += 1; // has special char

      // Score: 0 to 5
      let width = '0%';
      let color = '#ef4444';
      let label = 'Muito fraca';

      if (score <= 1) {
        width = '20%';
        color = '#ef4444';
        label = 'Muito fraca 🔴';
      } else if (score === 2) {
        width = '40%';
        color = '#f59e0b';
        label = 'Fraca 🟡';
      } else if (score === 3) {
        width = '60%';
        color = '#fbbf24';
        label = 'Média 🟡';
      } else if (score === 4) {
        width = '80%';
        color = '#34d399';
        label = 'Forte 🟢';
      } else if (score === 5) {
        width = '100%';
        color = '#10b981';
        label = 'Excelente ⚡🟢';
      }

      bar.style.width = width;
      bar.style.backgroundColor = color;
      text.textContent = `Força: ${label}`;
      text.style.color = color;
    };
  }

  const toggleWizPass = document.getElementById('toggle-wiz-pass');
  if (toggleWizPass) {
    toggleWizPass.onclick = () => {
      const pwdInput = document.getElementById('wiz-password');
      if (pwdInput) {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      }
    };
  }
}

function updateSignUpWizardUI() {
  const subText = document.getElementById('wizard-sub-text');
  const fillLine = document.getElementById('wizard-line-fill');
  const btnBack = document.getElementById('wiz-btn-back');
  const btnNext = document.getElementById('wiz-btn-next');
  const errorText = document.getElementById('wiz-error-text');

  if (errorText) errorText.textContent = ''; // clear error on transition

  // Panes
  document.getElementById('wizard-pane-1').classList.add('hidden');
  document.getElementById('wizard-pane-2').classList.add('hidden');
  document.getElementById('wizard-pane-3').classList.add('hidden');
  document.getElementById(`wizard-pane-${currentSignUpStep}`).classList.remove('hidden');

  // Nodes active/completed state
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (node) {
      node.classList.remove('active', 'completed');
      if (i < currentSignUpStep) {
        node.classList.add('completed');
      } else if (i === currentSignUpStep) {
        node.classList.add('active');
      }
    }
  }

  // Stepper connecting line fill width
  if (currentSignUpStep === 1) {
    if (fillLine) fillLine.style.width = '0%';
    if (subText) subText.textContent = 'Passo 1: Seus dados pessoais de cadastro';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Cancelar';
    }
    if (btnNext) btnNext.textContent = 'Avançar →';
  } else if (currentSignUpStep === 2) {
    if (fillLine) fillLine.style.width = '50%';
    if (subText) subText.textContent = 'Passo 2: Contatos e grupo familiar';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Voltar';
    }
    if (btnNext) btnNext.textContent = 'Avançar →';
  } else if (currentSignUpStep === 3) {
    if (fillLine) fillLine.style.width = '100%';
    if (subText) subText.textContent = 'Passo 3: Credenciais de acesso seguro';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Voltar';
    }
    if (btnNext) btnNext.textContent = 'Criar Conta 🎉';
  }
}

// Bind Wizard Buttons once at runtime
setTimeout(() => {
  const backBtn = document.getElementById('wiz-btn-back');
  const nextBtn = document.getElementById('wiz-btn-next');

  if (backBtn) {
    backBtn.onclick = () => {
      if (currentSignUpStep === 1) {
        document.getElementById('signup-wizard-overlay').classList.remove('active');
      } else {
        currentSignUpStep--;
        updateSignUpWizardUI();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = async () => {
      const err = document.getElementById('wiz-error-text');
      if (err) err.textContent = '';

      if (currentSignUpStep === 1) {
        const firstName = document.getElementById('wiz-first-name').value.trim();
        const lastName = document.getElementById('wiz-last-name').value.trim();
        const cpf = document.getElementById('wiz-cpf').value.trim();
        const birthDate = document.getElementById('wiz-birth-date').value;

        if (!firstName || !lastName || !cpf || !birthDate) {
          if (err) err.textContent = 'Por favor, preencha todos os campos pessoais';
          return;
        }
        if (cpf.length < 14) {
          if (err) err.textContent = 'Por favor, digite um CPF válido';
          return;
        }
        currentSignUpStep = 2;
        updateSignUpWizardUI();
      } else if (currentSignUpStep === 2) {
        const email = document.getElementById('wiz-email').value.trim();
        const phone = document.getElementById('wiz-phone').value.trim();
        const familyName = document.getElementById('wiz-family-name').value.trim();

        if (!email || !phone) {
          if (err) err.textContent = 'Por favor, preencha o E-mail e o Celular';
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          if (err) err.textContent = 'Por favor, digite um e-mail válido';
          return;
        }
        if (phone.length < 14) {
          if (err) err.textContent = 'Por favor, digite um celular válido';
          return;
        }

        if (familyName) {
          try {
            nextBtn.disabled = true;
            nextBtn.textContent = 'Verificando...';
            const existingFamily = await window.api.families.checkName(familyName);
            nextBtn.disabled = false;
            nextBtn.textContent = 'Avançar →';

            if (existingFamily) {
              showWizardFamilyChoiceModal(
                existingFamily.name,
                existingFamily.owner_name,
                () => {
                  signupFamilyId = existingFamily.id;
                  currentSignUpStep = 3;
                  updateSignUpWizardUI();
                },
                () => {
                  signupFamilyId = null;
                  currentSignUpStep = 3;
                  updateSignUpWizardUI();
                }
              );
              return;
            }
          } catch (e) {
            console.error('Error verifying family name:', e);
          } finally {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Avançar →';
          }
        }

        signupFamilyId = null;
        currentSignUpStep = 3;
        updateSignUpWizardUI();
      } else if (currentSignUpStep === 3) {
        const firstName = document.getElementById('wiz-first-name').value.trim();
        const lastName = document.getElementById('wiz-last-name').value.trim();
        const cpf = document.getElementById('wiz-cpf').value.trim();
        const birthDate = document.getElementById('wiz-birth-date').value;
        const email = document.getElementById('wiz-email').value.trim();
        const phone = document.getElementById('wiz-phone').value.trim();
        const familyName = document.getElementById('wiz-family-name').value.trim();
        const username = document.getElementById('wiz-username').value.trim();
        const password = document.getElementById('wiz-password').value;
        const recovery_question = document.getElementById('wiz-recovery-question').value;
        const recovery_answer = document.getElementById('wiz-recovery-answer').value.trim();

        if (!username || !password || !recovery_question || !recovery_answer) {
          if (err) err.textContent = 'Por favor, preencha todos os campos do Passo 3';
          return;
        }
        const acceptedTerms = document.getElementById('wiz-accepted-terms').checked;
        if (!acceptedTerms) {
          if (err) err.textContent = 'Você deve aceitar os Termos de Uso e Política de Privacidade para cadastrar-se';
          return;
        }
        if (password.length < 6) {
          if (err) err.textContent = 'A senha deve possuir no mínimo 6 caracteres';
          return;
        }

        const name = `${firstName} ${lastName}`;
        nextBtn.disabled = true;
        nextBtn.textContent = 'Processando...';

        const r = await window.api.auth.register({
          name,
          first_name: firstName,
          last_name: lastName,
          cpf,
          birth_date: birthDate,
          email,
          phone,
          familyName: signupFamilyId ? null : familyName,
          familyId: signupFamilyId,
          username,
          password,
          recovery_question,
          recovery_answer,
          accepted_terms_timestamp: new Date().toISOString(),
          accepted_terms_version: 1
        });

        nextBtn.disabled = false;
        nextBtn.textContent = 'Criar Conta 🎉';

        if (!r.success) {
          if (err) err.textContent = r.error;
          return;
        }

        toast('Família e conta criadas com sucesso!');
        document.getElementById('signup-wizard-overlay').classList.remove('active');
        
        // Prefill login username
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').focus();
        
        await initLoginScreen();
      }
    };
  }
}, 500);

function openRegisterModal() {
  Modal.open('Adicionar Usuário', `
    <div class="form-group"><label>Nome completo</label><input type="text" id="mod-name" placeholder="Nome"></div>
    <div class="form-group"><label>Usuário</label><input type="text" id="mod-username" placeholder="Login"></div>
    <div class="form-group"><label>Senha</label><input type="password" id="mod-password" placeholder="Senha"></div>
    <p class="auth-error" id="mod-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="mod-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mod-save">Criar</button>
    </div>`);
  document.getElementById('mod-cancel').onclick = Modal.close;
  document.getElementById('mod-save').onclick = async () => {
    const name = document.getElementById('mod-name').value.trim();
    const username = document.getElementById('mod-username').value.trim();
    const password = document.getElementById('mod-password').value;
    const err = document.getElementById('mod-error');
    if (!name || !username || !password) { err.textContent = 'Preencha todos os campos'; return; }
    const r = await window.api.auth.register({ name, username, password, familyId: State.user.family_id });
    if (!r.success) { err.textContent = r.error; return; }
    toast('Usuário criado!'); Modal.close(); renderSettings();
  };
}

async function openEditUserModal(user) {
  let selectedAvatar = user.avatar_image || null;
  const userPerm = await window.api.permissions.get(user.id);
  const showPermissionsSection = State.permissions.can_edit_all === 1 && user.username !== 'adm';

  const avatarGridItemsHtml = Object.keys(AVATARS).map(key => `
    <div class="avatar-grid-item ${selectedAvatar === key ? 'selected' : ''}" data-avatar-id="${key}">
      ${AVATARS[key]}
    </div>
  `).join('');

  const permissionsHtml = showPermissionsSection ? `
    <div class="settings-section" style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--accent-light); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span>🔒</span> Controle de Acessos & Restrições de Perfil
      </div>
      
      <!-- Seletor de Perfil Didático -->
      <div class="form-group" style="margin-bottom: 12px;">
        <label>Papel na Família (Perfil de Limitação)</label>
        <select id="edit-user-profile-type" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
          <option value="2" ${user.profile_type === 2 ? 'selected' : ''}>Adm da Família (Acesso Total)</option>
          <option value="3" ${user.profile_type === 3 ? 'selected' : ''}>Filho Primogênito (Acesso Moderado)</option>
          <option value="4" ${user.profile_type === 4 ? 'selected' : ''}>Filho do Meio (Acesso Básico)</option>
          <option value="5" ${user.profile_type === 5 ? 'selected' : ''}>Filho Caçula (Interface Super Simplificada)</option>
        </select>
      </div>

      <div id="profile-explanation" class="card" style="padding: 12px; margin-bottom: 16px; border: 1px dashed var(--border); background: rgba(255,255,255,0.01);">
        <!-- Preenchido dinamicamente -->
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); cursor: pointer;">
          <input type="checkbox" id="toggle-custom-perms" style="cursor: pointer;">
          <span>🔧 Customizar permissões manualmente (Avançado)</span>
        </label>
      </div>

      <!-- Seção Customizada Oculta -->
      <div id="custom-perms-section" style="display: none;">
        <!-- Níveis de Acesso -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600;">Ver tudo</span>
              <span style="font-size: 11px; color: var(--text-muted);">Visualizar lançamentos de toda a família</span>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" id="edit-user-view-all" ${userPerm.can_view_all === 1 ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600;">Editar tudo / Administrador</span>
              <span style="font-size: 11px; color: var(--text-muted);">Acesso administrativo completo de gestão</span>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" id="edit-user-edit-all" ${userPerm.can_edit_all === 1 ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Acesso aos Menus -->
        <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Menus Permitidos</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-dashboard" ${userPerm.allow_dashboard !== 0 ? 'checked' : ''}>
            <span>📊 Dashboard</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-recurring" ${userPerm.allow_recurring !== 0 ? 'checked' : ''}>
            <span>🔄 Planejamento</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-accounts" ${userPerm.allow_accounts !== 0 ? 'checked' : ''}>
            <span>🏦 Contas</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-budget" ${userPerm.allow_budget !== 0 ? 'checked' : ''}>
            <span>📋 Orçamento</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-goals" ${userPerm.allow_goals !== 0 ? 'checked' : ''}>
            <span>🎯 Metas</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-reports" ${userPerm.allow_reports !== 0 ? 'checked' : ''}>
            <span>📈 Relatórios</span>
          </label>
        </div>
      </div>
    </div>
  ` : '';

  Modal.open('Editar Perfil', `
    <div class="form-group">
      <label>Nome completo</label>
      <input type="text" id="edit-user-name" value="${user.name}">
    </div>
    <div class="form-group">
      <label>Usuário</label>
      <input type="text" id="edit-user-username" value="${user.username}">
    </div>
    <div class="form-group">
      <label>Nova Senha</label>
      <input type="password" id="edit-user-password" placeholder="Deixe em branco para não alterar">
    </div>
    
    <div class="form-group">
      <label class="avatar-selector-label">Escolher Avatar</label>
      <div class="avatar-grid" id="edit-user-avatar-grid">
        ${avatarGridItemsHtml}
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-remove-avatar" style="width: 100%;">Sem Avatar / Iniciais do Nome</button>
    </div>

    ${permissionsHtml}
    
    <p class="auth-error" id="edit-user-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:12px">
      <button class="btn btn-secondary" id="edit-user-cancel">Cancelar</button>
      <button class="btn btn-primary" id="edit-user-save">Salvar Alterações</button>
    </div>
  `);

  const gridItems = document.querySelectorAll('#edit-user-avatar-grid .avatar-grid-item');
  gridItems.forEach(item => {
    item.onclick = () => {
      gridItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedAvatar = item.dataset.avatarId;
    };
  });

  document.getElementById('btn-remove-avatar').onclick = () => {
    gridItems.forEach(i => i.classList.remove('selected'));
    selectedAvatar = null;
  };

  if (showPermissionsSection) {
    const typeSelect = document.getElementById('edit-user-profile-type');
    const toggleCustom = document.getElementById('toggle-custom-perms');
    const customSection = document.getElementById('custom-perms-section');
    const explanationEl = document.getElementById('profile-explanation');

    const updateExplanation = () => {
      const pType = parseInt(typeSelect.value);
      let html = '';
      switch(pType) {
        case 2:
          html = `
            <div style="font-weight:600; color:var(--accent-light); margin-bottom: 4px;">🔓 Adm da Família</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Acesso Livre:</strong> Todos os menus do aplicativo.<br>
              <strong>Ações:</strong> Gerencia membros da família, define orçamentos e vê lançamentos de todos.
            </p>
          `;
          break;
        case 3:
          html = `
            <div style="font-weight:600; color:#3b82f6; margin-bottom: 4px;">🛡️ Filho Primogênito</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Menus Disponíveis:</strong> Dashboard, Planejamento (Apenas Leitura), Metas e Configurações Básicas.<br>
              <strong>Menus Bloqueados:</strong> Contas, Orçamento e Relatórios.<br>
              <strong>Ações:</strong> Insere lançamentos, coopera com metas e recebe avisos discretos de limites.
            </p>
          `;
          break;
        case 4:
          html = `
            <div style="font-weight:600; color:#8b5cf6; margin-bottom: 4px;">⚡ Filho do Meio</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Menus Disponíveis:</strong> Dashboard, Metas e Configurações Básicas.<br>
              <strong>Menus Bloqueados:</strong> Planejamento, Contas, Orçamento e Relatórios.<br>
              <strong>Ações:</strong> Insere despesas e receitas avulsas, gerencia suas próprias Metas e recebe avisos de limites.
            </p>
          `;
          break;
        case 5:
          html = `
            <div style="font-weight:600; color:#f59e0b; margin-bottom: 4px;">👶 Filho Caçula</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Interface Especial:</strong> Sem barra lateral. Tela única focada para crianças.<br>
              <strong>Recursos Didáticos:</strong> Botão rápido <code>⚡ Registrar Gasto</code>, card com total gasto, card com limite e círculo de progresso radial de gastos.
            </p>
          `;
          break;
      }
      explanationEl.innerHTML = html;

      if (!toggleCustom.checked) {
        const editAllCheck = document.getElementById('edit-user-edit-all');
        const viewAllCheck = document.getElementById('edit-user-view-all');
        const menuDashboard = document.getElementById('edit-user-menu-dashboard');
        const menuRecurring = document.getElementById('edit-user-menu-recurring');
        const menuAccounts = document.getElementById('edit-user-menu-accounts');
        const menuBudget = document.getElementById('edit-user-menu-budget');
        const menuGoals = document.getElementById('edit-user-menu-goals');
        const menuReports = document.getElementById('edit-user-menu-reports');

        if (pType === 2) {
          editAllCheck.checked = true;
          viewAllCheck.checked = true;
          menuDashboard.checked = true;
          menuRecurring.checked = true;
          menuAccounts.checked = true;
          menuBudget.checked = true;
          menuGoals.checked = true;
          menuReports.checked = true;
        } else if (pType === 3) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = true;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = true;
          menuReports.checked = false;
        } else if (pType === 4) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = false;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = true;
          menuReports.checked = false;
        } else if (pType === 5) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = false;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = false;
          menuReports.checked = false;
        }
      }
    };

    typeSelect.onchange = updateExplanation;
    toggleCustom.onchange = () => {
      customSection.style.display = toggleCustom.checked ? 'block' : 'none';
      if (!toggleCustom.checked) {
        updateExplanation();
      }
    };

    // Initialize explanation
    updateExplanation();
  }

  document.getElementById('edit-user-cancel').onclick = Modal.close;

  document.getElementById('edit-user-save').onclick = async () => {
    const name = document.getElementById('edit-user-name').value.trim();
    const username = document.getElementById('edit-user-username').value.trim();
    const password = document.getElementById('edit-user-password').value;
    const err = document.getElementById('edit-user-error');

    if (!name || !username) {
      err.textContent = 'Nome e Usuário são obrigatórios';
      return;
    }

    const payload = {
      id: user.id,
      name,
      username,
      password: password || null,
      avatar_image: selectedAvatar,
      profile_type: showPermissionsSection ? parseInt(document.getElementById('edit-user-profile-type').value) : user.profile_type
    };

    const r = await window.api.auth.updateUser(payload);
    if (!r.success) {
      err.textContent = r.error || 'Erro ao atualizar perfil';
      return;
    }

    if (showPermissionsSection) {
      const can_view_all = document.getElementById('edit-user-view-all').checked ? 1 : 0;
      const can_edit_all = document.getElementById('edit-user-edit-all').checked ? 1 : 0;
      const allow_dashboard = document.getElementById('edit-user-menu-dashboard').checked ? 1 : 0;
      const allow_recurring = document.getElementById('edit-user-menu-recurring').checked ? 1 : 0;
      const allow_accounts = document.getElementById('edit-user-menu-accounts').checked ? 1 : 0;
      const allow_budget = document.getElementById('edit-user-menu-budget').checked ? 1 : 0;
      const allow_goals = document.getElementById('edit-user-menu-goals').checked ? 1 : 0;
      const allow_reports = document.getElementById('edit-user-menu-reports').checked ? 1 : 0;

      await window.api.permissions.update({
        targetUserId: user.id,
        can_view_all,
        can_edit_all,
        allow_dashboard,
        allow_recurring,
        allow_accounts,
        allow_budget,
        allow_goals,
        allow_reports
      });
    }

    toast('Perfil atualizado com sucesso!');
    
    if (user.id === State.user.id) {
      State.user.name = name;
      State.user.username = username;
      State.user.avatar_image = selectedAvatar;
      State.user.profile_type = payload.profile_type;
      
      State.permissions = await window.api.permissions.get(user.id);
      applyNavigationPermissions();

      const avatarEl = document.getElementById('sidebar-avatar');
      avatarEl.innerHTML = renderAvatarHtml(State.user, 36);
      avatarEl.style.background = 'transparent';
      avatarEl.style.boxShadow = 'none';
      document.getElementById('sidebar-user-name').textContent = name;
    }

    Modal.close();
    renderSettings();
  };
}

function applyNavigationPermissions() {
  const menus = ['dashboard', 'recurring', 'accounts', 'budget', 'goals', 'reports'];
  menus.forEach(m => {
    const btn = document.querySelector(`.nav-item[data-page="${m}"]`);
    if (btn) {
      if (State.permissions && State.permissions['allow_' + m] === 0) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'flex';
      }
    }
  });
}


/* ==== admin.js ==== */
/* ===
 * admin.js — L8877–9709 do app.js
 */

async function startApp(user) {
  State.user = user;
  State.budgetUserId = user.id;
  State.settings = await window.api.settings.get(user.id);
  State.permissions = await window.api.permissions.get(user.id);
  
  State.familyName = null;
  if (user.family_id) {
    try {
      const families = await window.api.families.getAll();
      const fam = families.find(f => f.id === user.family_id);
      if (fam) {
        State.familyName = fam.name;
        localStorage.setItem('financeiro_family_id', user.family_id);
        localStorage.setItem('financeiro_family_name', fam.name);
      }
    } catch (e) {
      console.error('Error fetching family name at startup:', e);
    }
  }
  
  // Caçula vs Standard layout setup
  if (user.profile_type === 5) {
    document.body.classList.add('cacula-layout');
  } else {
    document.body.classList.remove('cacula-layout');
  }

  // Dynamic ADM menu insertion
  const navContainer = document.querySelector('.sidebar-nav');
  let familiesBtn = document.getElementById('nav-families');
  if (user.profile_type === 1) {
    if (!familiesBtn) {
      familiesBtn = document.createElement('button');
      familiesBtn.className = 'nav-item';
      familiesBtn.id = 'nav-families';
      familiesBtn.dataset.page = 'families';
      familiesBtn.innerHTML = `
        <span class="nav-icon">👑</span>
        <span class="nav-label">Famílias</span>
      `;
      navContainer.insertBefore(familiesBtn, navContainer.firstChild);
      familiesBtn.onclick = () => navigate('families');
    }
    familiesBtn.style.display = 'flex';
  } else {
    if (familiesBtn) familiesBtn.style.display = 'none';
  }

  applyNavigationPermissions();

  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('sidebar-user-name').textContent = user.name;
  
  const connectBtn = document.getElementById('sidebar-connect');
  if (connectBtn) {
    if (window.api.isElectron) {
      connectBtn.style.display = 'flex';
      connectBtn.onclick = () => openLanConnectModal();
    } else {
      connectBtn.style.display = 'none';
    }
  }

  const syncBtn = document.getElementById('sidebar-sync-btn');
  if (syncBtn) {
    syncBtn.style.display = 'flex';
    syncBtn.onclick = () => openDeduplicationModal();
  }

  const avatarEl = document.getElementById('sidebar-avatar');
  avatarEl.innerHTML = renderAvatarHtml(user, 36);
  avatarEl.style.background = 'transparent';
  avatarEl.style.boxShadow = 'none';

  document.getElementById('sidebar-logout').onclick = () => {
    State.user = null;
    document.body.classList.remove('cacula-layout');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    initLoginScreen();
  };
  document.getElementById('btn-minimize').onclick = () => window.api.window.minimize();
  document.getElementById('btn-maximize').onclick = () => window.api.window.maximize();
  document.getElementById('btn-close').onclick    = () => window.api.window.close();
  
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => { 
    btn.onclick = () => navigate(btn.dataset.page); 
  });
  
  checkImpersonation();
  navigate('dashboard');
}

function checkImpersonation() {
  const impersonatorData = sessionStorage.getItem('impersonator_adm');
  let banner = document.getElementById('impersonation-banner');
  
  if (impersonatorData) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'impersonation-banner';
      banner.style.cssText = `
        background: linear-gradient(90deg, #f97316, #8b5cf6); 
        color: #fff; 
        padding: 10px; 
        text-align: center; 
        font-size: 13px; 
        font-weight: 600; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 12px; 
        border-bottom: 1px solid rgba(255,255,255,0.15); 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
        position: sticky; 
        top: 0; 
        z-index: 9999;
      `;
      
      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.insertBefore(banner, appEl.firstChild);
      }
    }
    
    banner.innerHTML = `
      <span>🛠️ <strong>Modo Manutenção Geral:</strong> Administrando o ambiente da <strong>${State.familyName}</strong> como <strong>${State.user?.name}</strong>.</span>
      <button class="btn btn-secondary btn-sm" id="btn-stop-impersonate" style="background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.45); color: white; padding: 4px 12px; font-size: 11px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: 600;">Voltar ao ADM Dono do APP</button>
    `;
    
    document.getElementById('btn-stop-impersonate').onclick = async () => {
      const admUser = JSON.parse(sessionStorage.getItem('impersonator_adm'));
      sessionStorage.removeItem('impersonator_adm');
      
      // Remove banner
      const bannerEl = document.getElementById('impersonation-banner');
      if (bannerEl) bannerEl.remove();
      
      // Stop layout adjustments
      document.body.classList.remove('cacula-layout');
      
      // Restart app as ADM Geral
      await startApp(admUser);
      navigate('families');
    };
  } else {
    if (banner) banner.remove();
  }
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Preencha todos os campos'; return; }
  btn.disabled = true; btn.textContent = 'Entrando...';
  const r = await window.api.auth.login({ username, password });
  btn.disabled = false; btn.textContent = 'Entrar';
  if (!r.success) { errEl.textContent = r.error; return; }
  startApp(r.user);
};

document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const recovery_question = document.getElementById('reg-recovery-question').value;
  const recovery_answer = document.getElementById('reg-recovery-answer').value.trim();
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';
  if (!name || !username || !password || !recovery_question || !recovery_answer) { errEl.textContent = 'Preencha todos os campos, incluindo a recuperação'; return; }
  if (password.length < 4) { errEl.textContent = 'Senha muito curta'; return; }
  const familyName = document.getElementById('reg-family-name')?.value.trim() || null;
  const r = await window.api.auth.register({ name, username, password, familyName, recovery_question, recovery_answer });
  if (!r.success) { errEl.textContent = r.error; return; }
  toast('Conta criada! Faça login.');
  document.getElementById('register-form-wrap').classList.add('hidden');
  document.getElementById('login-form-wrap').classList.remove('hidden');
  document.getElementById('login-username').value = username;
  await initLoginScreen();
};

async function openLanConnectModal() {
  try {
    const info = await window.api.server.getInfo();
    if (!info) {
      toast('Erro ao carregar informações do servidor', 'error');
      return;
    }
    
    const ipsHtml = info.ips.map(ip => `
      <div class="lan-url-item">
        <span class="lan-url-text">http://${ip}:${info.port}</span>
        <button class="lan-copy-btn" onclick="navigator.clipboard.writeText('http://${ip}:${info.port}'); toast('Endereço copiado!');">Copiar 📋</button>
      </div>
    `).join('');

    const modalBody = `
      <div class="lan-modal-container">
        <div class="lan-status-badge">
          <span style="font-size: 8px;">🟢</span> Servidor LAN Ativo
        </div>
        <p class="lan-instructions">
          Conecte outros aparelhos (celulares, tablets ou computadores) na sua rede Wi-Fi e acesse o endereço abaixo ou escaneie o QR Code:
        </p>
        ${info.qrCode ? `
        <div class="lan-qr-wrapper">
          <img src="${info.qrCode}" class="lan-qr-image" alt="QR Code de Conexão">
        </div>
        ` : ''}
        <div class="lan-urls-list">
          ${ipsHtml || '<div style="color:var(--text-muted)">Nenhuma placa de rede local encontrada.</div>'}
        </div>
      </div>
    `;
    Modal.open('📱 Conectar Outro Aparelho', modalBody);
  } catch (err) {
    console.error('Error opening LAN modal:', err);
    toast('Erro de rede local: ' + err.message, 'error');
  }
}

// ── FILHO CAÇULA DASHBOARD & QUICK EXPENSE ──────────────────────────────────
async function renderCaculaDashboard(page) {
  // Add cacula-layout class to body to hide sidebar and style it
  document.body.classList.add('cacula-layout');

  const [summary, budgets] = await Promise.all([
    window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
    window.api.budgets.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear })
  ]);

  const totalSpent = summary.expense || 0;
  const proposedLimit = budgets.reduce((acc, b) => acc + b.amount, 0) || 100;
  const percentage = proposedLimit > 0 ? Math.round((totalSpent / proposedLimit) * 100) : 0;

  let feedbackIcon = '🎈';
  let feedbackMessage = 'Parabéns! Você está economizando super bem! Continue assim! 🚀';
  let feedbackClass = 'feedback-good';
  let colorGradient = '#10b981';

  if (percentage > 50 && percentage <= 85) {
    feedbackIcon = '⚠️';
    feedbackMessage = 'Atenção! Você já usou mais da metade do seu dinheirinho. Planeje seus próximos gastos! 🧐';
    feedbackClass = 'feedback-warn';
    colorGradient = '#f59e0b';
  } else if (percentage > 85 && percentage <= 100) {
    feedbackIcon = '🚨';
    feedbackMessage = 'Cuidado! Você está bem pertinho do seu limite. Pense bem antes de gastar! 🛒';
    feedbackClass = 'feedback-danger';
    colorGradient = '#ef4444';
  } else if (percentage > 100) {
    feedbackIcon = '😱';
    feedbackMessage = 'Ops! Você passou do limite proposto! Vamos conversar com seus pais para planejar melhor? 🤝';
    feedbackClass = 'feedback-over';
    colorGradient = '#ec4899';
  }

  page.innerHTML = `
    <div class="cacula-dashboard-container">
      <div class="cacula-header">
        <div class="cacula-avatar-badge">${renderAvatarHtml(State.user, 72)}</div>
        <h2 class="cacula-welcome">Olá, ${State.user.name.split(' ')[0]}! 👋</h2>
        <p class="cacula-subtitle">Aprender a cuidar do seu dinheirinho é super divertido!</p>
      </div>
      
      <div class="cacula-hero-button-section">
        <button class="cacula-hero-btn" id="btn-cacula-quick-expense">
          <span class="cacula-btn-icon">⚡</span>
          <span class="cacula-btn-text">Registrar um Gasto</span>
        </button>
      </div>

      <div class="cacula-progress-section">
        <div class="cacula-radial-progress-wrapper">
          <svg class="cacula-radial-svg" viewBox="0 0 100 100">
            <circle class="cacula-radial-bg" cx="50" cy="50" r="40"></circle>
            <circle class="cacula-radial-fill" cx="50" cy="50" r="40" style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (251.2 * Math.min(percentage, 100) / 100)}; stroke: ${colorGradient};"></circle>
          </svg>
          <div class="cacula-radial-text-wrap">
            <span class="cacula-radial-percentage">${percentage}%</span>
            <span class="cacula-radial-label">Utilizado</span>
          </div>
        </div>
        <div class="cacula-radial-description">
          Você já gastou <strong>${fmt.currency(totalSpent)}</strong> de <strong>${fmt.currency(proposedLimit)}</strong> propostos.
        </div>
      </div>

      <div class="cacula-cards-grid">
        <div class="cacula-card card-expense">
          <span class="cacula-card-emoji">💸</span>
          <div class="cacula-card-info">
            <span class="cacula-card-title">Total Gasto</span>
            <span class="cacula-card-val">${fmt.currency(totalSpent)}</span>
          </div>
        </div>
        
        <div class="cacula-card card-limit">
          <span class="cacula-card-emoji">🎯</span>
          <div class="cacula-card-info">
            <span class="cacula-card-title">Limite Proposto</span>
            <span class="cacula-card-val">${fmt.currency(proposedLimit)}</span>
          </div>
        </div>
      </div>

      <div class="cacula-feedback-card ${feedbackClass}">
        <span class="cacula-feedback-icon">${feedbackIcon}</span>
        <span class="cacula-feedback-message">${feedbackMessage}</span>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <button class="btn btn-secondary btn-sm" id="btn-cacula-logout" style="padding: 8px 16px;">⏻ Sair do Aplicativo</button>
      </div>
    </div>
  `;

  document.getElementById('btn-cacula-logout').onclick = () => {
    State.user = null;
    document.body.classList.remove('cacula-layout');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    initLoginScreen();
  };

  document.getElementById('btn-cacula-quick-expense').onclick = () => {
    openCaculaQuickExpenseModal(summary.accounts);
  };
}

function openCaculaQuickExpenseModal(accounts) {
  const debitAccounts = accounts.filter(a => a.type !== 'credit');
  if (debitAccounts.length === 0) {
    toast('Nenhuma conta disponível para gastos. Fale com seus pais!', 'error');
    return;
  }
  const defaultAccount = debitAccounts[0];

  Modal.open('⚡ Registrar Gasto', `
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 48px;">🍦</span>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Qual foi a diversão ou lanche de hoje?</p>
    </div>
    
    <div class="form-group">
      <label>Com o que você gastou?</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;" id="cacula-chips">
        <button class="cacula-chip selected" data-value="Lanche" data-icon="🍔">🍔 Lanche</button>
        <button class="cacula-chip" data-value="Brinquedo" data-icon="🧸">🧸 Brinquedo</button>
        <button class="cacula-chip" data-value="Material Escolar" data-icon="✏️">✏️ Escola</button>
        <button class="cacula-chip" data-value="Lazer/Jogo" data-icon="🎮">🎮 Jogo</button>
        <button class="cacula-chip" data-value="Doce" data-icon="🍬">🍬 Doces</button>
        <button class="cacula-chip" data-value="Outro" data-icon="🛍️">🛍️ Outro</button>
      </div>
      <input type="hidden" id="cacula-expense-description" value="Lanche 🍔">
    </div>

    <div class="form-group">
      <label for="cacula-expense-amount">Quanto custou? (R$)</label>
      <input type="number" id="cacula-expense-amount" placeholder="0,00" step="0.01" min="0.01" style="font-size: 24px; text-align: center; font-weight: 700; padding: 12px; border-color: var(--accent);">
    </div>

    <div class="modal-footer" style="padding: 0; border: none; margin-top: 16px;">
      <button class="btn btn-secondary" id="cacula-expense-cancel">Cancelar</button>
      <button class="btn btn-primary" id="cacula-expense-save">Confirmar Gasto! 🚀</button>
    </div>
  `);

  let currentDescription = 'Lanche 🍔';
  const chips = document.querySelectorAll('#cacula-chips .cacula-chip');
  chips.forEach(chip => {
    chip.onclick = () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      currentDescription = `${chip.dataset.value} ${chip.dataset.icon}`;
      document.getElementById('cacula-expense-description').value = currentDescription;
    };
  });

  document.getElementById('cacula-expense-cancel').onclick = Modal.close;
  document.getElementById('cacula-expense-save').onclick = async () => {
    const amountVal = parseFloat(document.getElementById('cacula-expense-amount').value);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast('Por favor, infoorme um valor correto!', 'error');
      return;
    }

    const allCategories = await window.api.categories.getAll(State.user.id);
    const lowercaseDesc = currentDescription.toLowerCase();
    
    let matchedCat = allCategories.find(c => c.name.toLowerCase().includes('lazer')) || allCategories[0];
    if (lowercaseDesc.includes('lanche') || lowercaseDesc.includes('doce')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('aliment') || c.name.toLowerCase().includes('lanche')) || matchedCat;
    } else if (lowercaseDesc.includes('escola') || lowercaseDesc.includes('material')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('educa')) || matchedCat;
    } else if (lowercaseDesc.includes('brinquedo')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('lazer') || c.name.toLowerCase().includes('outros')) || matchedCat;
    }

    const payload = {
      user_id: State.user.id,
      account_id: defaultAccount.id,
      category_id: matchedCat ? matchedCat.id : null,
      type: 'expense',
      amount: amountVal,
      description: currentDescription,
      date: fmt.dateDb(new Date()),
      is_paid: 1,
      is_avulso: 1
    };

    const r = await window.api.transactions.create(payload);
    if (r.success) {
      toast('Gasto registrado! Você é demais! 🌟');
      Modal.close();
      renderDashboard();
    } else {
      toast('Erro ao registrar gasto: ' + (r.error || 'Erro desconhecido'), 'error');
    }
  };
}

// ── ADM GERAL DASHBOARD & FAMILIES GOVERNANCE ────────────────────────────────
// ── ADM GERAL DASHBOARD & FAMILIES GOVERNANCE ────────────────────────────────
function renderLogsInConsole(logs) {
  const container = document.querySelector('.adm-logs-console');
  if (!container) return;
  
  if (!logs || logs.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); padding: 10px;">Nenhum log registrado para este filtro.</div>';
    return;
  }
  
  container.innerHTML = logs.map(l => {
    let typeStyle = 'color: var(--accent-light); font-weight:600;';
    let rowStyle = '';
    if (l.event_type.startsWith('error') || l.event_type.includes('delete') || l.message.toLowerCase().includes('erro') || l.message.toLowerCase().includes('exclui')) {
      typeStyle = 'color: var(--danger); font-weight:600;';
      rowStyle = 'border-left: 2px solid var(--danger); padding-left: 8px; margin-bottom: 6px;';
    } else if (l.event_type.includes('register') || l.event_type.includes('create')) {
      typeStyle = 'color: #3b82f6; font-weight:600;';
      rowStyle = 'border-left: 2px solid #3b82f6; padding-left: 8px; margin-bottom: 6px;';
    }
    
    return `
      <div class="adm-log-entry" style="${rowStyle}">
        <span class="log-time">[${fmt.time(l.created_at)}]</span>
        <span style="${typeStyle} margin-right: 6px;">${l.event_type}</span>
        <span>${l.message}</span>
      </div>
    `;
  }).join('');
}

async function renderFamilies() {
  const page = document.getElementById('page-families');
  page.innerHTML = '<div style="padding:20px;color:var(--text-muted)">Carregando painel administrativo...</div>';

  try {
    const [families, logs] = await Promise.all([
      window.api.families.getAll(),
      window.api.logs.get()
    ]);

    let familiesTableRows = families.map(f => `
      <tr>
        <td style="font-weight: 600; color: var(--accent-light);">${f.name}</td>
        <td>${fmt.date(f.created_at ? f.created_at.split(' ')[0] : '')}</td>
        <td style="text-align: center;">${f.user_count} / ${f.quota_users}</td>
        <td style="text-align: center;">${f.account_count} / ${f.quota_accounts}</td>
        <td style="text-align: center; color: var(--text-secondary);">${f.transaction_count}</td>
        <td style="font-weight: 600; color: #ef4444;">${fmt.currency(f.total_expense)}</td>
        <td>
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-sm btn-view-family-logs" data-id="${f.id}" data-name="${f.name}" style="background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); color: #60a5fa;" title="Ver logs de atividades desta família">🪵 Logs</button>
            <button class="btn btn-secondary btn-sm btn-edit-family" data-id="${f.id}" title="Editar quotas e limites da família">✏️ Editar</button>
            ${f.id === 1 
              ? `<span style="font-size:12px;opacity:0.5;color:var(--text-muted);" title="A Família Mestra não pode ser excluída">🔒 Mestra</span>`
              : `<button class="btn btn-primary btn-sm btn-access-family" data-id="${f.id}" style="background: var(--accent); border-color: var(--accent); color: white;" title="Acessar painel e dados desta família">👁️ Acessar</button>
                 <button class="btn btn-danger btn-sm btn-delete-family" data-id="${f.id}" data-name="${f.name}">Excluir</button>`
            }
          </div>
        </td>
      </tr>
    `).join('');

    page.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">Famílias & Governança Geral</h2>
          <p class="page-subtitle">Monitore as famílias cadastradas, quotas de uso e logs de atividades do VPS.</p>
        </div>
      </div>

      <div class="adm-families-grid">
        <div class="adm-card" style="grid-column: span 2; overflow-x: auto;">
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>👥 Famílias no Servidor</span>
            <button class="btn btn-primary btn-sm" id="btn-adm-new-family">+ Criar Família</button>
          </div>
          <table class="adm-table">
            <thead>
              <tr>
                <th>Nome da Família</th>
                <th>Data de Criação</th>
                <th style="text-align: center;">Membros / Quota</th>
                <th style="text-align: center;">Contas / Quota</th>
                <th style="text-align: center;">Transações</th>
                <th style="text-align: center;">Volume Gasto</th>
                <th style="text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${familiesTableRows || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Nenhuma família cadastrada</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="adm-card" style="display: flex; flex-direction: column; max-height: 500px;">
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>💻 Logs do Servidor (VPS)</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="active-log-filter" style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Filtro: Todos</span>
              <button class="btn btn-secondary btn-sm" id="btn-clear-log-filter" style="display: none; padding: 2px 8px; font-size: 11px;">✕ Limpar</button>
            </div>
          </div>
          <div class="adm-logs-console" style="flex-grow: 1; overflow-y: auto;">
            <!-- Renderizado dinamicamente -->
          </div>
        </div>
      </div>

      <div class="settings-section" style="margin-top: 24px;">
        <div class="settings-section-title">🔧 Guia de Suporte ao Cliente (Troubleshooting)</div>
        <div class="card" style="padding: 20px; background: rgba(16, 185, 129, 0.02); border: 1px solid var(--border);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="margin: 0 0 10px 0; color: var(--accent-light); font-size: 14px; font-weight: 700;">🧩 Diagnóstico por Logs</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                <li><strong>Erros de Login/Acesso:</strong> Filtrar por <code>auth:login</code>. Senhas incorretas ou usuários inexistentes serão indicados nos logs de erro.</li>
                <li><strong>Lançamentos Duplicados ou Perdidos:</strong> O log <code>transaction:create</code> e <code>transaction:delete</code> mostra exatamente quem fez a ação, o valor e a descrição.</li>
                <li><strong>Excesso de Quotas:</strong> Se o cliente não conseguir criar contas ou membros, verifique se atingiu o limite da família. O log registrará as tentativas de criação frustradas.</li>
              </ul>
            </div>
            <div>
              <h4 style="margin: 0 0 10px 0; color: var(--accent-light); font-size: 14px; font-weight: 700;">👑 Ações Administrativas Avançadas</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                <li><strong>Acessar Ambiente:</strong> O botão <span style="color:var(--accent-light)">👁️ Acessar</span> faz "impersonation" (login simulado) no perfil do responsável daquela família para você ver exatamente o que ele está vendo no dashboard.</li>
                <li><strong>Limpar Cache:</strong> Caso o navegador do celular do cliente mostre dados desatualizados, peça para ele puxar a tela para baixo ou limpar os dados de navegação.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    renderLogsInConsole(logs);

    document.querySelectorAll('.btn-view-family-logs').forEach(btn => {
      btn.onclick = async () => {
        const familyId = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        
        document.getElementById('active-log-filter').textContent = `Filtro: ${name}`;
        document.getElementById('active-log-filter').style.color = 'var(--accent-light)';
        document.getElementById('btn-clear-log-filter').style.display = 'block';
        
        try {
          const famLogs = await window.api.logs.getByFamily(familyId);
          renderLogsInConsole(famLogs);
        } catch (e) {
          console.error(e);
          toast('Erro ao buscar logs da família', 'error');
        }
      };
    });

    document.getElementById('btn-clear-log-filter').onclick = async () => {
      document.getElementById('active-log-filter').textContent = 'Filtro: Todos';
      document.getElementById('active-log-filter').style.color = 'var(--text-secondary)';
      document.getElementById('btn-clear-log-filter').style.display = 'none';
      
      try {
        const allLogs = await window.api.logs.get();
        renderLogsInConsole(allLogs);
      } catch (e) {
        console.error(e);
      }
    };

    document.querySelectorAll('.btn-edit-family').forEach(btn => {
      btn.onclick = () => {
        openAdmEditFamilyModal(parseInt(btn.dataset.id));
      };
    });

    document.querySelectorAll('.btn-access-family').forEach(btn => {
      btn.onclick = async () => {
        const familyId = parseInt(btn.dataset.id);
        const users = await window.api.auth.getUsers();
        const famUsers = users.filter(u => u.family_id === familyId);
        
        if (famUsers.length === 0) {
          toast('Esta família ainda não possui nenhum membro cadastrado para visualização!', 'error');
          return;
        }
        
        const targetUser = famUsers.find(u => u.profile_type === 2) || famUsers.find(u => u.profile_type === 3) || famUsers[0];
        
        sessionStorage.setItem('impersonator_adm', JSON.stringify(State.user));
        
        await startApp(targetUser);
        
        toast(`Acessando ambiente da ${State.familyName} como ${targetUser.name}...`);
        
        navigate('dashboard');
      };
    });

    document.querySelectorAll('.btn-delete-family').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        if (confirm(`Atenção: Excluir a "${name}" irá apagar todos os usuários, contas, lançamentos e metas pertencentes a ela de forma IRREVERSÍVEL! Deseja continuar?`)) {
          const r = await window.api.families.delete(id);
          if (r.success) {
            toast(`Família "${name}" excluída com sucesso.`);
            renderFamilies();
          } else {
            toast(`Erro ao excluir: ` + r.error, 'error');
          }
        }
      };
    });

    document.getElementById('btn-adm-new-family').onclick = () => {
      openAdmNewFamilyModal();
    };

  } catch (err) {
    console.error('Error rendering families dashboard:', err);
    page.innerHTML = `<div style="padding:20px;color:#ef4444">Erro ao carregar o painel administrativo: ${err.message}</div>`;
  }
}
function openAdmNewFamilyModal() {
  Modal.open('👑 Nova Família & Admin', `
    <div class="form-group">
      <label>Nome da Família</label>
      <input type="text" id="adm-family-name" placeholder="Ex: Família Souza">
    </div>
    
    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div class="form-group" style="margin-bottom: 0;">
        <label>Membros Máximos (Quota)</label>
        <input type="number" id="adm-family-quota-users" min="1" max="50" value="6">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label>Contas Máximas (Quota)</label>
        <input type="number" id="adm-family-quota-accounts" min="1" max="100" value="10">
      </div>
    </div>
    
    <div style="border-top: 1px dashed var(--border); margin: 15px 0;"></div>
    <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); margin-bottom: 8px;">Membro Administrador Local (Adm da Família)</div>
    
    <div class="form-group">
      <label>Nome Completo do Adm da Família</label>
      <input type="text" id="adm-user-name" placeholder="Ex: Carlos Souza">
    </div>
    
    <div class="form-group">
      <label>Nome de Usuário</label>
      <input type="text" id="adm-user-username" placeholder="Ex: carlos_souza">
    </div>
    
    <div class="form-group">
      <label>Senha de Acesso</label>
      <input type="password" id="adm-user-password" placeholder="Defina a senha inicial">
    </div>
    
    <p class="auth-error" id="adm-family-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" id="adm-family-cancel">Cancelar</button>
      <button class="btn btn-primary" id="adm-family-save">Criar Família & Admin</button>
    </div>
  `);

  document.getElementById('adm-family-cancel').onclick = Modal.close;
  document.getElementById('adm-family-save').onclick = async () => {
    const familyName = document.getElementById('adm-family-name').value.trim();
    const quota_users = parseInt(document.getElementById('adm-family-quota-users').value) || 6;
    const quota_accounts = parseInt(document.getElementById('adm-family-quota-accounts').value) || 10;
    
    const name = document.getElementById('adm-user-name').value.trim();
    const username = document.getElementById('adm-user-username').value.trim();
    const password = document.getElementById('adm-user-password').value;
    const errEl = document.getElementById('adm-family-error');

    errEl.textContent = '';
    if (!familyName || !name || !username || !password) {
      errEl.textContent = 'Preencha todos os campos obrigatórios!';
      return;
    }
    
    if (password.length < 4) {
      errEl.textContent = 'A senha deve conter no mínimo 4 caracteres!';
      return;
    }
    
    if (quota_users <= 0 || quota_accounts <= 0) {
      errEl.textContent = 'As quotas devem ser maiores do que zero!';
      return;
    }

    const r = await window.api.auth.register({ 
      name, 
      username, 
      password, 
      familyName, 
      quota_users, 
      quota_accounts 
    });
    if (r.success) {
      toast(`Família "${familyName}" criada com sucesso!`);
      Modal.close();
      renderFamilies();
    } else {
      errEl.textContent = r.error || 'Erro ao registrar nova família.';
    }
  };
}

async function openAdmEditFamilyModal(familyId) {
  const families = await window.api.families.getAll();
  const f = families.find(fam => fam.id === familyId);
  if (!f) return;

  Modal.open('✏️ Editar Família & Quotas', `
    <div class="form-group">
      <label>Nome da Família</label>
      <input type="text" id="edit-fam-name" value="${f.name}">
    </div>
    
    <div style="border-top: 1px dashed var(--border); margin: 15px 0;"></div>
    <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); margin-bottom: 12px;">Limites de Quotas de Uso</div>
    
    <div class="form-group">
      <label>Quota de Usuários (Máximo de Perfis)</label>
      <input type="number" id="edit-fam-quota-users" min="1" max="50" value="${f.quota_users}">
    </div>
    
    <div class="form-group">
      <label>Quota de Contas Bancárias (Máximo)</label>
      <input type="number" id="edit-fam-quota-accounts" min="1" max="100" value="${f.quota_accounts}">
    </div>
    
    <p class="auth-error" id="edit-fam-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" id="edit-fam-cancel">Cancelar</button>
      <button class="btn btn-primary" id="edit-fam-save">Salvar Alterações</button>
    </div>
  `);

  document.getElementById('edit-fam-cancel').onclick = Modal.close;
  document.getElementById('edit-fam-save').onclick = async () => {
    const name = document.getElementById('edit-fam-name').value.trim();
    const quota_users = parseInt(document.getElementById('edit-fam-quota-users').value);
    const quota_accounts = parseInt(document.getElementById('edit-fam-quota-accounts').value);
    const errEl = document.getElementById('edit-fam-error');

    errEl.textContent = '';
    if (!name || isNaN(quota_users) || isNaN(quota_accounts)) {
      errEl.textContent = 'Preencha todos os campos obrigatórios!';
      return;
    }
    
    if (quota_users <= 0 || quota_accounts <= 0) {
      errEl.textContent = 'As quotas devem ser maiores do que zero!';
      return;
    }

    const r = await window.api.families.update({ id: familyId, name, quota_users, quota_accounts });
    if (r.success) {
      toast(`Família "${name}" atualizada com sucesso!`);
      Modal.close();
      renderFamilies();
    } else {
      errEl.textContent = r.error || 'Erro ao salvar alterações da família.';
    }
  };
}

initLoginScreen();

// Sidebar Responsive Toggle Controls
document.getElementById('titlebar-menu-btn').onclick = (e) => {
  e.stopPropagation();
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
};

// Close sidebar when clicking any navigation link
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
  });
});

// Close sidebar when clicking anywhere on the main content area
document.getElementById('main-content').onclick = () => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
};

// Register PWA Service Worker for web hosting compatibility
if ('serviceWorker' in navigator && !window.api.isElectron) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado com sucesso no escopo:', reg.scope))
      .catch(err => console.error('Falha ao registrar o Service Worker:', err));
  });
}


/* ==== app-init.js ==== */
/* ===
 * app-init.js — L9710–9970 do app.js
 */

// --- LGPD / PRIVACY MODAL STRINGS & INITIALIZATION ---
const TERMS_OF_USE_TEXT = `
TERMOS DE USO

FinançasFamília — Plataforma de Gestão Financeira Familiar

Versão 1.0 — Vigente a partir de 15 de julho de 2026

Estes Termos de Uso ("Termos") regulam a relação entre 59.229.350 WILLIAM ROBERTSON BICA NAIFF, inscrito(a) no CNPJ/CPF sob o nº CNPJ sob o nº 59.229.350/0001-77, com sede/domicílio em Rua Antenor Pereira, nº 13/100, Bairro Itai, Eldorado do Sul/RS, CEP 92990-000 ("FinançasFamília", "nós" ou "Prestador"), e a pessoa física ou o grupo familiar que utiliza o aplicativo e/ou o serviço web FinançasFamília ("Usuário" ou "você"). Ao criar uma conta ou utilizar o serviço de qualquer forma, você declara que leu, compreendeu e aceitou integralmente estes Termos e a Política de Privacidade, que o integra por referência.

CLÁUSULA 1ª — DEFINIÇÕES

Serviço/Plataforma: o aplicativo FinançasFamília, disponibilizado nas versões web e/ou desktop, incluindo todas as suas funcionalidades de controle financeiro pessoal e familiar.

Usuário: pessoa física, maior de 18 (dezoito) anos ou emancipada, que cria e mantém uma conta na Plataforma.

Grupo Familiar/Família: conjunto de contas de Usuários vinculadas entre si dentro da Plataforma para compartilhamento de dados financeiros, conforme a Cláusula 6ª.

Administrador da Família/Responsável: Usuário com perfil de maior nível hierárquico dentro do Grupo Familiar, responsável por convidar, gerenciar permissões e remover outros membros.

Dados Pessoais: qualquer informação relacionada a pessoa natural identificada ou identificável, nos termos do art. 5º, I, da LGPD.

Conteúdo do Usuário: transações, categorias, metas, orçamentos e quaisquer outras informações financeiras inseridas voluntariamente pelo Usuário na Plataforma.

CLÁUSULA 2ª — DO OBJETO

O FinançasFamília é uma ferramenta de organização financeira pessoal e familiar, que permite ao Usuário registrar receitas, despesas, contas, metas, orçamentos e relatórios, de forma individual ou compartilhada entre membros de um mesmo Grupo Familiar.

O Serviço não constitui, e não deve ser interpretado como, instituição financeira, instituição de pagamento, corretora de valores, consultoria de investimentos ou qualquer atividade regulada pelo Banco Central do Brasil (BACEN) ou pela Comissão de Valores Mobiliários (CVM). O FinançasFamília não realiza transações financeiras reais, não movimenta dinheiro, não emite boletos, não processa pagamentos e não tem acesso a contas bancárias do Usuário, salvo se e quando integrações específicas para esse fim forem expressamente oferecidas e aceitas em termos aditivos.

CLÁUSULA 3ª — DA ACEITAÇÃO DOS TERMOS

O aceite destes Termos é condição obrigatória e prévia para a criação de conta e uso da Plataforma, manifestado por meio de mecanismo de confirmação ativa (ex.: caixa de seleção) no momento do cadastro, ficando registrados, para fins de prova, a data, o horário e a versão dos Termos aceitos, dado esse acessível ao Usuário em sua área de configurações.

Caso você não concorde com qualquer disposição destes Termos, não deverá criar conta nem utilizar o Serviço.

CLÁUSULA 4ª — DO CADASTRO E DA CONTA DE USUÁRIO

Para utilizar o Serviço, o Usuário deverá fornecer informações verdadeiras, completas e atualizadas, incluindo, conforme o fluxo de cadastro vigente: nome completo, CPF, e-mail, telefone e data de nascimento. O fornecimento de dados falsos, incompletos ou de terceiros sem autorização constitui violação destes Termos e pode acarretar a suspensão ou o encerramento da conta, sem prejuízo de outras medidas cabíveis.

O Usuário é o único responsável pela guarda de sua senha e de qualquer credencial de acesso, comprometendo-se a não compartilhá-las com terceiros e a comunicar imediatamente ao Prestador, pelos canais indicados na Cláusula 17ª, qualquer uso não autorizado de sua conta de que tenha conhecimento.

O Prestador poderá adotar mecanismos de verificação e segurança adicionais (ex.: pergunta de recuperação, limitação de tentativas de acesso) para proteção da conta, sem que isso configure garantia absoluta contra acessos não autorizados por terceiros que obtenham as credenciais do Usuário por meios alheios ao controle razoável do Prestador.

CLÁUSULA 5ª — DA IDADE MÍNIMA E DE MENORES DE IDADE

O cadastro como titular de conta (Administrador ou membro com acesso próprio de login) é restrito a maiores de 18 (dezoito) anos ou emancipados nos termos da lei civil brasileira. Perfis eventualmente destinados à visualização por menores de idade dentro do Grupo Familiar, quando essa funcionalidade existir, somente poderão ser criados e geridos por um Administrador da Família maior de idade, responsável legal pelo uso feito por esse perfil, na forma do art. 14 da LGPD.

Caso o Prestador identifique cadastro de titular de conta com idade inferior à mínima permitida, poderá suspender ou encerrar a conta e excluir os dados coletados, sem prejuízo de comunicação aos responsáveis legais quando identificáveis.

CLÁUSULA 6ª — DA ESTRUTURA FAMILIAR E DOS PERFIS DE ACESSO

O Serviço permite a criação de Grupos Familiares, nos quais múltiplos Usuários podem compartilhar visibilidade sobre contas, transações, metas e orçamentos, de acordo com o nível de permissão atribuído a cada perfil (ex.: Responsável, Primogênito, Dependente, ou outra nomenclatura vigente na Plataforma).

Ao ingressar em um Grupo Familiar, o Usuário reconhece e consente que determinados Dados Pessoais e financeiros poderão ser visualizados por outros membros do mesmo grupo, na medida das permissões configuradas pelo Administrador da Família. É de responsabilidade do Administrador da Família configurar adequadamente essas permissões e do próprio Usuário avaliar se deseja compartilhar suas informações naquele grupo.

O Prestador não é responsável por conflitos entre membros de um mesmo Grupo Familiar quanto ao uso, à interpretação ou às consequências do compartilhamento de dados financeiros entre si, cabendo aos próprios integrantes do grupo definir essas regras internamente.

CLÁUSULA 7ª — DO TRATAMENTO DE DADOS PESSOAIS

O tratamento de Dados Pessoais realizado por meio do Serviço é regido pela Política de Privacidade, parte integrante e inseparável destes Termos, elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018) e com o Marco Civil da Internet (Lei nº 12.965/2014).

Ao aceitar estes Termos, o Usuário declara ter também lido e aceitado a Política de Privacidade vigente, disponível na própria Plataforma, na qual constam, entre outras informações: as finalidades e bases legais do tratamento, o período de retenção dos dados, as medidas de segurança adotadas, os terceiros eventualmente envolvidos no tratamento (ex.: provedores de hospedagem) e os canais para exercício dos direitos previstos no art. 18 da LGPD (acesso, correção, exclusão, portabilidade, entre outros).

CLÁUSULA 8ª — DAS REGRAS DE USO E CONDUTAS VEDADAS

Ao utilizar o Serviço, o Usuário compromete-se a não:

utilizar a Plataforma para qualquer finalidade ilícita, fraudulenta ou que viole direitos de terceiros;

tentar acessar, sem autorização, dados, contas ou sistemas de outros Usuários ou do Prestador, inclusive por meio de exploração de vulnerabilidades, engenharia reversa, ataques de força bruta ou automatizados;

interferir na segurança, na integridade ou no funcionamento normal dos servidores, redes ou sistemas que suportam o Serviço;

reproduzir, distribuir, sublicenciar ou comercializar o Serviço, ou qualquer parte de seu código-fonte, layout ou base de dados, sem autorização expressa e por escrito do Prestador;

utilizar robôs, scrapers ou outras ferramentas automatizadas para extrair dados da Plataforma fora das interfaces oficialmente disponibilizadas para esse fim.

A violação de qualquer das condutas acima poderá acarretar a suspensão ou o encerramento imediato da conta do Usuário, sem prejuízo das medidas cíveis e criminais cabíveis.

CLÁUSULA 9ª — DA PROPRIEDADE INTELECTUAL

O nome "FinançasFamília", sua identidade visual, código-fonte, layout, banco de dados e demais elementos que compõem a Plataforma são de titularidade do Prestador ou de seus licenciantes, protegidos pela legislação de direitos autorais e propriedade industrial aplicável (Lei nº 9.610/1998 e Lei nº 9.279/1996), sendo vedada sua reprodução, cópia ou uso não autorizado.

O Conteúdo do Usuário (transações, categorias e demais dados inseridos) permanece de titularidade do próprio Usuário, sendo licenciado ao Prestador apenas na medida necessária para a prestação do Serviço (armazenamento, processamento e exibição das informações ao próprio Usuário e aos membros autorizados de seu Grupo Familiar).

CLÁUSULA 10ª — DA FASE DE TESTES / VERSÃO BETA

O Usuário está ciente de que a Plataforma pode ser disponibilizada, total ou parcialmente, em fase de testes, homologação ou versão beta, podendo apresentar instabilidades, indisponibilidades temporárias, alterações frequentes de funcionalidades ou, em casos excepcionais, perda de dados decorrente de ajustes técnicos. Recomenda-se ao Usuário não utilizar a Plataforma, durante essa fase, como único meio de registro de informações financeiras críticas, mantendo controles alternativos próprios enquanto o Serviço não atingir estágio de disponibilização estável.

O Prestador envidará esforços razoáveis para comunicar ao Usuário, por aviso na própria Plataforma, quando o Serviço estiver em fase de testes.

CLÁUSULA 11ª — DA NATUREZA DO SERVIÇO E ISENÇÃO DE RESPONSABILIDADE

O FinançasFamília é uma ferramenta de organização e visualização de informações financeiras inseridas pelo próprio Usuário. O Prestador não presta consultoria financeira, contábil, tributária ou de investimentos personalizada, e os relatórios, gráficos e projeções gerados pela Plataforma têm caráter meramente informativo, com base exclusivamente nos dados fornecidos pelo Usuário.

O Usuário é o único responsável pela exatidão dos dados que insere na Plataforma e por qualquer decisão financeira, pessoal ou familiar, tomada com base nas informações e relatórios do Serviço. O Prestador não se responsabiliza por erros, prejuízos ou perdas decorrentes de dados inseridos incorretamente pelo Usuário, nem por decisões financeiras tomadas a partir das informações do Serviço.

CLÁUSULA 12ª — DA DISPONIBILIDADE DO SERVIÇO

O Prestador envidará esforços razoáveis para manter o Serviço disponível de forma contínua, porém não garante disponibilidade ininterrupta, podendo ocorrer interrupções programadas para manutenção, atualizações, ou decorrentes de motivos de força maior, caso fortuito, falhas de terceiros (provedores de hospedagem, conectividade, energia elétrica) ou fatores alheios à sua vontade.

O Prestador recomenda que o Usuário realize, quando disponibilizada essa funcionalidade, exportações periódicas de seus próprios dados como medida adicional de precaução.

CLÁUSULA 13ª — DA LIMITAÇÃO DE RESPONSABILIDADE

Na máxima extensão permitida pela legislação aplicável, o Prestador não será responsável por danos indiretos, lucros cessantes, perda de dados ou de oportunidade de negócio decorrentes do uso ou da impossibilidade de uso do Serviço, ressalvados os casos de dolo ou culpa grave comprovados, bem como as hipóteses de responsabilidade que não possam ser limitadas ou excluídas por força de lei, notadamente as decorrentes do Código de Defesa do Consumidor (Lei nº 8.078/1990), quando aplicável à relação entre as partes.

Nada nesta cláusula exclui a responsabilidade do Prestador por violação de dados pessoais decorrente de falha em cumprir as obrigações de segurança previstas na LGPD e detalhadas na Política de Privacidade.

CLÁUSULA 14ª — DE EVENTUAL COBRANÇA E DIREITO DE ARREPENDIMENTO

Na data de vigência destes Termos, o Serviço é disponibilizado gratuitamente. Caso o Prestador venha a instituir planos pagos, os valores, formas de pagamento e condições específicas serão informados previamente ao Usuário, em termos aditivos ou tela própria de contratação, sujeitos a aceite específico antes de qualquer cobrança.

Caso o Serviço seja contratado de forma remota (fora de estabelecimento físico), aplica-se o direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor, podendo o Usuário desistir da contratação no prazo de 7 (sete) dias corridos a contar da assinatura ou do recebimento do serviço, com devolução integral dos valores eventualmente pagos, devidamente atualizados.

CLÁUSULA 15ª — DA SUSPENSÃO E DO ENCERRAMENTO DA CONTA

O Usuário pode encerrar sua conta a qualquer momento, por meio da funcionalidade disponível em suas configurações de perfil, observado o disposto na Política de Privacidade quanto ao tratamento dos dados após o encerramento.

O Prestador poderá suspender ou encerrar, unilateralmente e a qualquer tempo, a conta de Usuário que viole estes Termos, mediante comunicação prévia ao Usuário sempre que possível, ressalvadas as hipóteses em que a comunicação prévia comprometa a segurança da Plataforma ou de terceiros.

CLÁUSULA 16ª — DAS ALTERAÇÕES DESTES TERMOS

O Prestador poderá alterar estes Termos a qualquer tempo, para refletir mudanças no Serviço, na legislação aplicável ou em suas práticas de negócio. Alterações substanciais serão comunicadas ao Usuário com antecedência razoável, por aviso na Plataforma e/ou por e-mail cadastrado, sendo o novo aceite exigido para uso continuado do Serviço sempre que a alteração impactar direitos essenciais do Usuário. A versão vigente estará sempre disponível na Plataforma, com indicação de número de versão e data.

CLÁUSULA 17ª — DO CANAL DE ATENDIMENTO E DO ENCARREGADO (DPO)

Dúvidas, solicitações ou reclamações relacionadas a estes Termos, ao Serviço ou ao tratamento de Dados Pessoais podem ser dirigidas ao seguinte canal de atendimento: contato@financasfamilia.com.br.

Em conformidade com o art. 41 da LGPD, o Prestador indica como Encarregado pelo Tratamento de Dados Pessoais (DPO): William Robertson Bica Naiff, contato: dpo@financasfamilia.com.br.

CLÁUSULA 18ª — DA LEGISLAÇÃO APLICÁVEL E DO FORO

Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Eldorado do Sul/RS para dirimir quaisquer controvérsias oriundas destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja, ressalvada a competência do foro do domicílio do consumidor quando a relação for de consumo, nos termos da legislação aplicável.

CLÁUSULA 19ª — DISPOSIÇÕES GERAIS

Caso qualquer disposição destes Termos seja considerada nula ou ineficaz por autoridade competente, as demais disposições permanecerão em pleno vigor e efeito.

A tolerância de qualquer das partes quanto ao descumprimento de qualquer obrigação prevista nestes Termos não implicará novação ou renúncia de direito, podendo a parte tolerante exigir o cumprimento da obrigação a qualquer tempo.

Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre as partes quanto ao objeto aqui tratado, substituindo quaisquer entendimentos anteriores, escritos ou verbais.
`;

const PRIVACY_POLICY_TEXT = `POLÍTICA DE PRIVACIDADE — LGPD

1. Tratamento de Dados Pessoais
Coletamos os seus dados cadastrais (Nome, CPF, Data de Nascimento, E-mail, Telefone) com a finalidade exclusiva de realizar a sua identificação, garantir a segurança do acesso e viabilizar a recuperação de senha. Coletamos também os lançamentos financeiros inseridos voluntariamente por você para compor os relatórios de gastos da sua família.

2. Base Legal para o Tratamento
Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), tratamos seus dados pessoais com base em duas hipóteses:
- Consentimento (Art. 7º, I): manifestado ao aceitar a caixinha de seleção no momento do cadastro.
- Execução de Contrato (Art. 7º, V): necessário para a prestação das funcionalidades de controle financeiro contratadas por você.

3. Segurança e Armazenamento
Os dados são armazenados de forma estruturada e segura em nossa base de dados, com aplicação de técnicas modernas de proteção e criptografia de senhas (bcrypt).

4. Não Compartilhamento
Seus dados financeiros e cadastrais pertencem exclusivamente a você e ao seu grupo familiar. O FinançasFamília não vende, aluga nem compartilha qualquer dado pessoal ou financeiro com terceiros para fins comerciais.

5. Direitos dos Titulares de Dados (Art. 18)
Você possui pleno controle sobre seus dados e pode exercer os seguintes direitos diretamente no painel do app:
- Direito de Acesso e Retificação: visualizar e atualizar seus dados no menu de configurações do perfil.
- Direito de Exclusão ("Direito ao Esquecimento"): apagar definitivamente todos os seus dados cadastrais e registros de transações por meio do botão "Excluir Minha Conta" em Configurações.`;

function initLgpdModals() {
  const overlay = document.getElementById('lgpd-modal-overlay');
  const title = document.getElementById('lgpd-modal-title');
  const content = document.getElementById('lgpd-modal-content');
  const closeBtn = document.getElementById('lgpd-modal-close');
  const okBtn = document.getElementById('lgpd-modal-btn-ok');

  const showModal = (modalTitle, modalText) => {
    title.textContent = modalTitle;
    content.textContent = modalText;
    overlay.style.display = 'flex';
  };

  const hideModal = () => {
    overlay.style.display = 'none';
  };

  if (closeBtn) closeBtn.onclick = hideModal;
  if (okBtn) okBtn.onclick = hideModal;

  // Bind login screen links
  const loginTerms = document.getElementById('link-login-terms');
  const loginPrivacy = document.getElementById('link-login-privacy');
  if (loginTerms) {
    loginTerms.onclick = (e) => {
      e.preventDefault();
      showModal('Termos de Uso', TERMS_OF_USE_TEXT);
    };
  }
  if (loginPrivacy) {
    loginPrivacy.onclick = (e) => {
      e.preventDefault();
      showModal('Política de Privacidade (LGPD)', PRIVACY_POLICY_TEXT);
    };
  }

  // Bind signup wizard links
  const signupTerms = document.getElementById('link-terms-use');
  const signupPrivacy = document.getElementById('link-privacy-policy');
  if (signupTerms) {
    signupTerms.onclick = (e) => {
      e.preventDefault();
      showModal('Termos de Uso', TERMS_OF_USE_TEXT);
    };
  }
  if (signupPrivacy) {
    signupPrivacy.onclick = (e) => {
      e.preventDefault();
      showModal('Política de Privacidade (LGPD)', PRIVACY_POLICY_TEXT);
    };
  }
}

// Call on startup
initLgpdModals();

/* ════════════════════════════════════════
   THEME MANAGER (3 CONTRAST THEMES)
   ═════════════════════════════════════════ */
function setAppTheme(themeName) {
  const THEME_KEY = 'financas_theme';
  const validThemes = ['dark-emerald', 'light', 'high-contrast-dark', 'high-contrast-light'];
  if (!validThemes.includes(themeName)) themeName = 'dark-emerald';
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(THEME_KEY, themeName);

  const toggleBtn = document.getElementById('app-theme-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = themeName === 'light' ? '🌙' : '☀️';
    toggleBtn.title = themeName === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro';
  }
}

function initThemeSwitcher() {
  const currentTheme = localStorage.getItem('financas_theme') || 'dark-emerald';
  setAppTheme(currentTheme);

  const toggleBtn = document.getElementById('app-theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = document.documentElement.getAttribute('data-theme') || 'dark-emerald';
      const nextTheme = current === 'light' ? 'dark-emerald' : 'light';
      setAppTheme(nextTheme);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSwitcher);
} else {
  initThemeSwitcher();
}

