if (!window.api) {
  const makeRpcCall = async (channel, ...args) => {
    const origin = window.location.origin;
    const res = await fetch(`${origin}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, args })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

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
      updatePositions: (positions) => makeRpcCall('auth:updatePositions', { positions }),
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
      togglePaidWithDate: (id, date) => makeRpcCall('transactions:togglePaidWithDate', id, date),
      updatePositions: (userId, positions) => makeRpcCall('transactions:updatePositions', { userId, positions }),
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
      exportExcel: (d) => makeRpcCall('backup:exportExcel', d),
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
  };
}

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
  ticket:    { name: 'Ticket Alimentação',color: '#EC1C24', bg: '#fee2e2', emoji: '🎟️', abbr: 'Tick' },
  vr:        { name: 'VR Benefícios',  color: '#009A44', bg: '#f0fdf4', emoji: '🎟️', abbr: 'VR' },
  sodexo:    { name: 'Sodexo',         color: '#0F2C59', bg: '#eff6ff', emoji: '🎟️', abbr: 'Sod' },
  dinheiro:  { name: 'Dinheiro (Carteira)', color: '#10b981', bg: '#ecfdf5', emoji: '💵', abbr: 'Din' },
  outro:     { name: 'Outro',          color: '#64748b', bg: '#f1f5f9', emoji: '🏦', abbr: '?' },
};

const ACCOUNT_TYPES = { 
  checking: 'Conta Corrente', 
  savings: 'Poupança', 
  wallet: 'Carteira', 
  credit: 'Cartão de Crédito', 
  investment: 'Investimento',
  voucher: 'Cartão Voucher / Benefício'
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
  open(title, bodyHTML, wide = false) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal').className = `modal${wide ? ' modal-lg' : ''}`;
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
  // Se a página alvo for restrita, encontrar o primeiro menu permitido
  if (page !== 'settings' && State.permissions && State.permissions['allow_' + page] === 0) {
    const menus = ['dashboard', 'recurring', 'accounts', 'budget', 'goals', 'reports'];
    const firstAllowed = menus.find(m => State.permissions['allow_' + m] !== 0) || 'settings';
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
  const renders = { dashboard: renderDashboard, recurring: renderRecurring, accounts: renderAccounts, budget: renderBudget, goals: renderGoals, reports: renderReports, settings: renderSettings, families: renderFamilies };
  if (renders[page]) await renders[page]();
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

// ── Credit Card Donut (two-tone: used + free) ──
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

  const pct       = Math.min(100, Math.max(0, (spent / limit) * 100));
  const usedArc   = (pct / 100) * circ;
  const freeArc   = circ - usedArc;

  // Colors
  const usedColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#f97316';
  const freeColor = pct > 80 ? '#991b1b' : pct > 60 ? '#92400e' : '#10b981';

  // Inner labels
  const pctLabel  = Math.round(pct) + '%';
  const subLabel  = pct > 80 ? 'crítico' : pct > 60 ? 'atenção' : 'usado';
  const subColor  = pct > 80 ? '#fca5a5' : pct > 60 ? '#fde68a' : '#6ee7b7';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Free arc (full circle behind, representing available limit) -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${freeColor}"
        stroke-width="12" opacity="0.28"/>
      <!-- Used arc (committed amount — on top) -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${usedColor}"
        stroke-width="12"
        stroke-dasharray="${usedArc} ${circ}"
        stroke-dashoffset="${circ / 4}"
        stroke-linecap="round"
        style="transition:stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)"/>
      <!-- Center: percentage -->
      <text x="${cx}" y="${cy - 7}" text-anchor="middle" dominant-baseline="central"
        fill="${usedColor}" font-size="${size * 0.20}px" font-weight="900" font-family="Inter">${pctLabel}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" dominant-baseline="central"
        fill="${subColor}" font-size="${size * 0.095}px" font-weight="600" font-family="Inter" opacity="0.9">${subLabel}</text>
    </svg>`;
}

// ════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════
async function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  
  if (State.user.profile_type === 5) {
    await renderCaculaDashboard(page);
    return;
  }
  
  // Basic layout with tabs
  let headerHtml = `
    <div class="page-header">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 class="page-title">Dashboard</h2>
          ${State.familyName ? `<span class="badge" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 50px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em;">🏠 ${State.familyName}</span>` : ''}
        </div>
        <p class="page-subtitle" id="dash-subtitle">Carregando...</p>
      </div>
      <div id="dash-period-wrapper"></div>
    </div>
    
    <div class="report-tabs" id="dashboard-tabs" style="margin-bottom: 20px;">
      <button class="report-tab ${State.activeDashTab === 'mensal' ? 'active' : ''}" data-tab="mensal">📅 Visão Mensal</button>
      <button class="report-tab ${State.activeDashTab === 'geral' ? 'active' : ''}" data-tab="geral">🌐 Visão Geral</button>
    </div>
    
    <div id="dashboard-tab-content" class="dashboard-view-fade"></div>
  `;
  
  page.innerHTML = headerHtml;
  
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

    const [summary, monthly, txs] = await Promise.all([
      window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
      window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
    ]);

    const today = new Date().getDate();
    const creditAccounts = summary.accounts.filter(a => a.type === 'credit');
    const debitAccounts  = summary.accounts.filter(a => a.type !== 'credit' && a.type !== 'investment');
    const recurringPct   = summary.totalRecurring > 0 ? Math.round((summary.paidRecurring / summary.totalRecurring) * 100) : 0;

    const contentDiv = document.getElementById('dashboard-tab-content');
    contentDiv.innerHTML = `
      ${summary.alertItems.length > 0 ? `
      <div class="alert-banner">
        <span class="alert-banner-icon">🚨</span>
        <div>
          <div class="alert-banner-title">Vencimentos próximos (próximos ${summary.alertDays} dias)</div>
          <div class="alert-banner-items">
            ${summary.alertItems.map(a => {
              const daysLeft = a.due_day - today;
              return `<span class="alert-chip">${a.rec_icon || '📋'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`} • ${fmt.currency(a.amount)}</span>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- KPI Cards -->
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
          <div class="kpi-sub">${summary.totalRecurring - summary.paidRecurring} item(s) pendente(s)</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Progress bar recorrências -->
      <div class="card" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:13px;font-weight:600">Recorrências do mês — ${summary.paidRecurring} de ${summary.totalRecurring} pagas</div>
          <div style="font-size:13px;font-weight:700;color:${recurringPct >= 100 ? 'var(--accent-light)' : 'var(--text-secondary)'}">${recurringPct}%</div>
        </div>
        <div class="progress-bar" style="height:10px">
          <div class="progress-fill ${recurringPct >= 100 ? 'progress-ok' : recurringPct >= 60 ? 'progress-warn' : 'progress-ok'}" style="width:${recurringPct}%"></div>
        </div>
      </div>

      <!-- Cards e Contas -->
      ${(creditAccounts.length > 0 || debitAccounts.length > 0) ? `
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Previsibilidade de Contas e Cartões</div>
        <div class="cards-widget-grid" id="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, summary.cardSpending[acc.id] || 0)).join('')}
          ${debitAccounts.map(acc => renderDebitAccountWidget(acc)).join('')}
        </div>
      </div>` : `
      <div class="card" style="margin-bottom:24px;text-align:center;padding:24px">
        <div style="font-size:32px;margin-bottom:8px">🏦</div>
        <div style="font-size:13px;color:var(--text-muted)">Nenhuma conta cadastrada ainda.</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigate('accounts')">+ Adicionar conta</button>
      </div>`}

      <!-- Priority + Charts -->
      <div class="dashboard-middle-grid">
        <!-- Prioridades -->
        <div class="card">
          <div class="card-title">⭐ Lançamentos prioritários</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
            ${summary.priorityItems.length === 0
              ? `<div class="no-data">Nenhum item marcado como prioritário.<br><small>Marque itens como ⭐ em Planejamento.</small></div>`
              : summary.priorityItems.map(item => `
                <div class="priority-item ${item.is_paid ? 'priority-paid' : 'priority-pending'}" style="margin-bottom:0">
                  <div style="font-size:18px">${item.rec_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.rec_name || item.description}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${item.account_name || '—'} • dia ${item.due_day || '?'}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:14px;color:${item.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${item.type === 'income' ? '+' : '-'}${fmt.currency(item.amount)}</div>
                    <span class="transaction-status ${item.is_paid ? 'status-paid' : 'status-pending'}">${item.is_paid ? '✓ Pago' : '⏳ Pendente'}</span>
                  </div>
                </div>`).join('')
            }
          </div>
        </div>

        <!-- Category Chart -->
        <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
          <div class="card-title">Despesas por categoria</div>
        </div>
      </div>

      <!-- Monthly Chart -->
      <div class="chart-card">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <canvas id="chart-monthly" style="max-height:200px"></canvas>
      </div>
    `;

    // Render monthly charts
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

    setupCategoryInteractiveChart('dashboard-category-interactive-card', 'category', txs);
    
  } else {
    // 🌐 VISÃO GERAL
    document.getElementById('dash-subtitle').innerText = 'Consolidado — Patrimônio e Saldos Reais';
    document.getElementById('dash-period-wrapper').innerHTML = ''; // No period selector for general tab

    const [summaryGeral, monthly, patrimony] = await Promise.all([
      window.api.dashboard.getGeneralSummary({ userId: State.user.id }),
      window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
      window.api.reports.getPatrimony({ userId: State.user.id }),
    ]);

    const creditAccounts = summaryGeral.accounts.filter(a => a.type === 'credit');
    const debitAccounts  = summaryGeral.accounts.filter(a => a.type !== 'credit');

    const totalDebit = debitAccounts.reduce((sum, a) => sum + a.balance, 0);

    const contentDiv = document.getElementById('dashboard-tab-content');
    contentDiv.innerHTML = `
      <!-- KPI Cards Geral -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-balance">
          <div class="kpi-label">Patrimônio Líquido</div>
          <div class="kpi-value" style="color:${summaryGeral.netWorth >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(summaryGeral.netWorth)}</div>
          <div class="kpi-sub">Saldos − faturas de cartões</div>
          <div class="kpi-icon">💰</div>
        </div>
        <div class="kpi-card kpi-income">
          <div class="kpi-label">Saldo em Contas</div>
          <div class="kpi-value">${fmt.currency(totalDebit)}</div>
          <div class="kpi-sub">soma de todas as contas</div>
          <div class="kpi-icon">🏦</div>
        </div>
        <div class="kpi-card kpi-expense">
          <div class="kpi-label">Dívida em Cartões</div>
          <div class="kpi-value">${fmt.currency(summaryGeral.creditCardBalance)}</div>
          <div class="kpi-sub">limites totais comprometidos</div>
          <div class="kpi-icon">💳</div>
        </div>
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">À Pagar Total</div>
          <div class="kpi-value">${fmt.currency(summaryGeral.totalPending)}</div>
          <div class="kpi-sub">despesas não pagas no BD</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Real Accounts -->
      ${summaryGeral.accounts.length > 0 ? `
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Saldos e Faturas Atuais (Reais)</div>
        <div class="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, acc.balance < 0 ? -acc.balance : 0)).join('')}
          ${debitAccounts.map(acc => renderDebitAccountStaticWidget(acc)).join('')}
        </div>
      </div>` : ''}

      <!-- Goals and Graphs -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- Savings Goals -->
        <div class="card">
          <div class="card-title">🎯 Objetivos & Cofrinhos</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
            ${summaryGeral.goals.length === 0
              ? `<div class="no-data">Nenhum cofrinho ativo cadastrado.<br><small>Defina metas em Objetivos.</small></div>`
              : summaryGeral.goals.map(goal => renderDashboardGoalItem(goal)).join('')
            }
          </div>
        </div>

        <!-- 6 Month revenues vs expenses bar chart -->
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
  }
}

function renderCreditCardWidget(acc, spent) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const limit     = acc.credit_limit || 0;
  const available = Math.max(0, limit - spent);
  const pct       = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const ringColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981';
  const userBadge = acc.user_name
    ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;display:inline-block">${acc.user_name}</span>`
    : '';

  return `
    <div class="bank-card-widget bank-card-credit">
      <!-- Header -->
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 40)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">Cartão de Crédito ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>

      <!-- Body: donut + info -->
      <div class="bank-card-body">
        <!-- Two-tone donut: used vs free -->
        <div class="bank-card-donut" style="position:relative">
          ${buildCreditDonut(spent, limit, 108)}
        </div>

        <!-- Values -->
        <div class="bank-card-values" style="gap:0">
          <!-- Limite total -->
          <div style="margin-bottom:10px">
            <div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Limite total</div>
            <div style="font-size:17px;font-weight:900;color:var(--text-primary);letter-spacing:-0.02em">${fmt.currency(limit)}</div>
          </div>

          <!-- Comprometido -->
          <div style="display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#f97316'};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Comprometido</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${pct > 80 ? '#f87171' : pct > 60 ? '#fbbf24' : '#fb923c'}">${fmt.currency(spent)}</div>
          </div>

          <!-- Disponível -->
          <div style="display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${ringColor};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Disponível</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${ringColor}">${fmt.currency(available)}</div>
          </div>

          ${acc.closing_day ? `
          <div style="margin-top:12px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
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

function renderDebitAccountWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';

  return `
    <div class="bank-card-widget bank-card-debit">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${ACCOUNT_TYPES[acc.type] || 'Conta'} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Rendimentos do mês</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : ''}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
    </div>`;
}

function renderDebitAccountStaticWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';

  return `
    <div class="bank-card-widget bank-card-debit">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${ACCOUNT_TYPES[acc.type] || 'Conta'} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Saldo Atual (Lançamentos Reais)</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : ''}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
    </div>`;
}

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
      const allBoxes = Array.from(document.querySelectorAll(`.${prefix}-cat-check`)).map(cb => cb.value);
      cbContainer.dataset.checkedCats = JSON.stringify(checkedBoxes);

      let filtered = txs.filter(t => t.type === activeTxType);

      if (activePaymentStatus === 'paid') {
        filtered = filtered.filter(t => t.is_paid === 1);
      } else if (activePaymentStatus === 'pending') {
        filtered = filtered.filter(t => t.is_paid === 0);
      }

      if (checkedBoxes.length > 0) {
        filtered = filtered.filter(t => checkedBoxes.includes(t.category_name || 'Sem Categoria'));
      } else if (allBoxes.length > 0) {
        filtered = [];
      }

      const agg = {};
      filtered.forEach(t => {
        const key = t.category_name || 'Sem Categoria';
        if (!agg[key]) {
          agg[key] = {
            name: key,
            icon: t.category_icon || '📋',
            color: t.category_color || '#64748b',
            total: 0,
            count: 0
          };
        }
        agg[key].total += t.amount;
        agg[key].count += 1;
      });

      const dataList = Object.values(agg).sort((a, b) => b.total - a.total);

      const listContainer = document.getElementById(listContainerId);
      if (dataList.length === 0) {
        listContainer.innerHTML = '<div style="color:var(--text-muted); font-size: 11px; padding: 10px; text-align: center;">Nenhum lançamento.</div>';
      } else {
        listContainer.innerHTML = dataList.map(c => `
          <div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--border)">
            <div style="width:8px;height:8px;border-radius:50%;background:${c.color}"></div>
            <div style="flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${c.name}">${c.icon} ${c.name}</div>
            <div style="font-weight:700;font-size:11px;color:${activeTxType === 'expense' ? '#f87171' : 'var(--accent-light)'}">
              ${activeMetricType === 'amount' ? fmt.currency(c.total) : `${c.count}x`}
            </div>
          </div>
        `).join('');
      }

      if (State.charts[chartStateKey]) {
        State.charts[chartStateKey].destroy();
        State.charts[chartStateKey] = null;
      }

      const chartContainer = document.getElementById(chartContainerId);
      if (dataList.length === 0) {
        chartContainer.innerHTML = '<div style="color:var(--text-muted); font-size: 12px;">Sem dados</div>';
      } else {
        chartContainer.innerHTML = `<canvas id="${chartCanvasId}" style="max-height: 220px; max-width: 100%;"></canvas>`;
        
        let type = 'doughnut';
        let chartData = {
          labels: dataList.map(c => `${c.icon} ${c.name}`),
          datasets: [{
            data: dataList.map(c => activeMetricType === 'amount' ? c.total : c.count),
            backgroundColor: dataList.map(c => c.color),
            borderWidth: 2,
            borderColor: '#111520'
          }]
        };

        let options = {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { 
              display: activeChartType !== 'horizontalBar', 
              position: 'bottom', 
              labels: { color: '#94a3b8', font: { size: 10 }, padding: 6, boxWidth: 8 } 
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw;
                  return activeMetricType === 'amount' ? ' ' + fmt.currency(val) : ` ${val} lançamento(s)`;
                }
              },
              backgroundColor: '#1e2535', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
              titleColor: '#f1f5f9', bodyColor: '#94a3b8'
            }
          }
        };

        if (activeChartType === 'polarArea') {
          type = 'polarArea';
          options.scales = {
            r: {
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { display: false }
            }
          };
        } else if (activeChartType === 'horizontalBar') {
          type = 'bar';
          options.indexAxis = 'y';
          options.scales = {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
          };
          options.plugins.legend.display = false;
        } else {
          options.cutout = '60%';
        }

        State.charts[chartStateKey] = new Chart(document.getElementById(chartCanvasId), {
          type,
          data: chartData,
          options
        });
      }
    }

    document.querySelectorAll(`.${prefix}-cat-check`).forEach(cb => {
      cb.onchange = updateChart;
    });

    updateChart();
  }

  document.getElementById(filterTxTypeId).onchange = () => {
    document.getElementById(filterCheckboxesId).dataset.checkedCats = '';
    renderCheckboxesAndDraw();
  };
  document.getElementById(filterPaymentId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterMetricId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterChartTypeId).onchange = renderCheckboxesAndDraw;

  renderCheckboxesAndDraw();
}

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
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" id="btn-new-avulso" style="background:var(--bg-raised)">+ Nova Variável</button>
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
        <input type="text" id="rec-search-input" placeholder="Buscar por descrição, valor, conta ou categoria..." 
               style="width:100%;padding:10px 14px 10px 36px;border-radius:10px;border:1px solid var(--border-color);background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);color:var(--text-primary);font-size:13px;outline:none;transition:border-color 0.2s">
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;color:var(--text-muted)">Ordenar por:</span>
        <select id="rec-sort-select" style="padding:10px 14px;border-radius:10px;border:1px solid var(--border-color);background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);color:var(--text-primary);font-size:13px;outline:none;cursor:pointer">
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
      <div class="section-title" style="margin-top:10px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📌</span> ${tab === 'income' ? 'Receitas Fixas' : 'Despesas Fixas'}
      </div>
      <div id="fixed-container"></div>
      
      <div class="section-title" style="margin-top:30px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📝</span> ${tab === 'income' ? 'Receitas Variáveis' : 'Despesas Variáveis'} do Mês
      </div>
      <div id="variable-container"></div>
    `;

    const [items, monthlyTxs, allAvulsos] = await Promise.all([
      window.api.recurring.getAll(State.user.id, tab, State.currentMonth, State.currentYear),
      window.api.recurring.getMonthly({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true })
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

      renderRecurringList(document.getElementById('fixed-container'), filteredItems, monthlyTxs, tab, accounts, categories);
      renderAvulsosList(document.getElementById('variable-container'), filteredAvulsos, accounts, categories, tab);

      const recList = document.getElementById('recurring-list');
      if (recList) setupDragAndDrop(recList, true);

      const avlList = document.getElementById('avulso-list');
      if (avlList) setupDragAndDrop(avlList, false);
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

function setupUserDragAndDrop(container) {
  if (!container) return;

  const items = container.querySelectorAll('.settings-item');
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', async () => {
      item.classList.remove('dragging');
      
      const orderedElements = [...container.querySelectorAll('.settings-item')];
      const positions = orderedElements.map((el, index) => ({
        id: parseInt(el.dataset.id),
        position: index
      }));

      try {
        await window.api.auth.updatePositions(positions);
        toast('Ordem dos perfis atualizada!');
      } catch (err) {
        console.error('Erro ao salvar nova ordenação de usuários:', err);
        toast('Erro ao salvar a ordenação');
      }
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = container.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...container.querySelectorAll('.settings-item:not(.dragging)')];
    
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
    const canEdit = State.permissions.can_edit_all === 1 || item.user_id === State.user.id;

    let statusBadge = '';
    if (isPaid) statusBadge = `<span class="transaction-status status-paid">✓ Pago</span>`;
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
      <div class="transaction-item recurring-item ${isPaid ? 'recurring-paid' : ''} ${item.is_priority ? 'recurring-priority' : ''}" data-id="${item.id}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
        ${checkBtnHtml}
        <div class="transaction-category-icon" style="background:${item.color}22;font-size:20px">${item.icon}</div>
        <div class="transaction-info">
          <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
            ${item.is_priority ? '<span title="Prioritário" style="font-size:14px">⭐</span>' : ''}
            ${tx ? tx.description : item.name}
            ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
          </div>
          <div class="transaction-meta">
            ${item.category_name ? `${item.cat_icon || ''} ${item.category_name} • ` : ''}
            ${item.account_name || '—'} • Todo dia ${item.due_day}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="transaction-amount ${type === 'income' ? 'income' : 'expense'}">
            ${type === 'income' ? '+' : '-'}${fmt.currency(item.amount)}
          </div>
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
    btn.onclick = (e) => { e.stopPropagation(); openRecurringModal(items.find(i => i.id === parseInt(btn.dataset.id)), accounts, categories, type); };
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
    const canEdit = State.permissions.can_edit_all === 1 || t.user_id === State.user.id;
    let checkBtnHtml = '';
    if (!canEdit) {
      checkBtnHtml = `
        <button class="transaction-check-btn locked ${t.is_paid ? 'checked' : ''}" title="Apenas leitura (🔒)" disabled>
          ${t.is_paid ? '✓' : '🔒'}
        </button>
      `;
    } else {
      checkBtnHtml = `
        <button class="transaction-check-btn avl-toggle ${t.is_paid ? 'checked' : ''}" 
                data-id="${t.id}" 
                title="${t.is_paid ? (t.type === 'income' ? 'Marcar como não recebida' : 'Marcar como não paga') : (t.type === 'income' ? 'Marcar como recebida' : 'Marcar como paga')}">
          ${t.is_paid ? '✓' : ''}
        </button>
      `;
    }
    return `
    <div class="transaction-item" data-id="${t.id}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
      ${checkBtnHtml}
      <div class="transaction-category-icon" style="background:${t.category_color ? t.category_color + '22' : 'var(--bg-raised)'}">
        ${t.category_icon || (t.type === 'income' ? '💰' : '📋')}
      </div>
      <div class="transaction-info">
        <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
          ${t.description || 'Sem descrição'}
          ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
        </div>
        <div class="transaction-meta">${fmt.date(t.date)} • ${t.account_name || '—'} ${t.category_name ? `• ${t.category_name}` : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="transaction-amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(t.amount)}</div>
        <span class="transaction-status ${t.is_paid ? 'status-paid' : 'status-pending'}">${t.is_paid ? '✓ Pago' : '⏳ Pendente'}</span>
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
    btn.onclick = async () => {
      if (confirm('Excluir este lançamento?')) { await window.api.transactions.delete(parseInt(btn.dataset.id)); toast('Excluído'); renderRecurring(); }
    };
  });
}

async function loadAvulsos(container, accounts, categories, tabType) {
  let txs = await window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true });
  txs = txs.filter(t => t.type === tabType);
  renderAvulsosList(container, txs, accounts, categories, tabType);
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

  Modal.open(isEdit ? 'Editar Item Recorrente' : `Nova ${type === 'income' ? 'Receita' : 'Despesa'} Fixa`, `
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
        <label>Mês de Início</label>
        <input type="month" id="rec-start-month" value="${startMonthVal}">
      </div>
      <div class="form-group">
        <label>Repetir por quantos meses? (0 ou vazio para indefinido)</label>
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
      const created_at = startMonth ? `${startMonth}-01 00:00:00` : null;

      const data = {
        user_id: State.user.id, name, type, amount,
        category_id: parseInt(document.getElementById('rec-category').value) || null,
        account_id,
        due_day: parseInt(document.getElementById('rec-due-day').value),
        is_priority: document.getElementById('rec-priority').checked ? 1 : 0,
        icon, color,
        notes: document.getElementById('rec-notes').value,
        repeat_months: parseInt(document.getElementById('rec-repeat-months').value) || 0,
        start_installment: parseInt(document.getElementById('rec-start-installment').value) || 1,
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

function openAvulsoModal(accounts, categories, tx = null, defaultType = 'expense') {
  const isEdit = !!tx;
  if (isEdit) {
    const canEdit = State.permissions.can_edit_all === 1 || tx.user_id === State.user.id;
    if (!canEdit) {
      toast('Você não tem permissão para editar este lançamento', 'error');
      return;
    }
  }
  const today = new Date().toISOString().split('T')[0];
  const dateVal = isEdit && tx.date ? tx.date.split(' ')[0] : today;
  const amountVal = isEdit ? tx.amount : '';
  const descVal = isEdit ? tx.description : '';
  const accountVal = isEdit ? tx.account_id : (accounts[0]?.id || '');
  const categoryVal = isEdit ? (tx.category_id || '') : '';
  const typeVal = isEdit ? tx.type : defaultType;
  const paidChecked = isEdit ? (tx.is_paid ? 'checked' : '') : 'checked';

  Modal.open(isEdit ? 'Editar Lançamento Avulso' : 'Novo Lançamento Avulso', `
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
        <label>Data</label>
        <input type="date" id="avl-date" value="${dateVal}">
      </div>
    </div>
    <div class="form-group">
      <label>Descrição</label>
      <input type="text" id="avl-desc" placeholder="Ex: Compra no mercado, Presente..." value="${descVal}">
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

  document.querySelectorAll('#avl-type-toggle button').forEach(btn => {
    btn.onclick = () => {
      currentType = btn.dataset.type;
      document.querySelectorAll('#avl-type-toggle button').forEach(b => b.className = '');
      btn.className = currentType === 'income' ? 'active-income' : 'active-expense';
      updateAvulsoCategories(currentType);
    };
  });

  document.getElementById('avl-cancel').onclick = Modal.close;
  document.getElementById('avl-save').onclick = async () => {
    try {
      const amount = parseFloat(document.getElementById('avl-amount').value);
      const date = document.getElementById('avl-date').value;
      const account_id = parseInt(document.getElementById('avl-account').value);
      
      if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
      if (!date) { toast('Informe a data', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione uma conta', 'error'); return; }
      
      const data = {
        user_id: State.user.id, account_id,
        category_id: parseInt(document.getElementById('avl-category').value) || null,
        recurring_item_id: isEdit ? tx.recurring_item_id : null,
        type: currentType, amount,
        description: document.getElementById('avl-desc').value,
        date, is_paid: document.getElementById('avl-paid').checked ? 1 : 0,
        is_avulso: isEdit ? tx.is_avulso : 1,
        notes: isEdit ? tx.notes : null,
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

function openPaymentDateModal(txId, currentDate, onComplete) {
  const cleanDate = currentDate ? currentDate.split(' ')[0] : new Date().toISOString().split('T')[0];
  
  Modal.open('Data de Pagamento / Recebimento', `
    <div style="padding: 16px; text-align: center;">
      <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary);">
        Informe qual dia em que ocorreu o pagamento ou recebimento deste lançamento:
      </p>
      <div class="form-group" style="margin-bottom: 20px;">
        <input type="date" id="payment-date-input" value="${cleanDate}" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center;">
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="btn-pay-cancel">Cancelar</button>
        <button class="btn btn-primary" id="btn-pay-confirm" style="background: var(--accent); border-color: var(--accent); font-weight: 600;">
          Confirmar Pagamento
        </button>
      </div>
    </div>
  `);
  
  document.getElementById('btn-pay-cancel').onclick = Modal.close;
  document.getElementById('btn-pay-confirm').onclick = async () => {
    const selectedDate = document.getElementById('payment-date-input').value;
    if (!selectedDate) {
      toast('Selecione uma data válida', 'error');
      return;
    }
    try {
      await window.api.transactions.togglePaidWithDate(txId, selectedDate);
      toast('Lançamento marcado como pago na data selecionada');
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

  const debitAccounts = accounts.filter(a => a.type !== 'credit');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  page.innerHTML = `
    <div class="page-header" style="align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="page-title">Contas & Cartões</h2>
        <p class="page-subtitle">Gerencie suas contas bancárias e cartões</p>
      </div>
      <div id="accounts-period-holder" style="display: flex; align-items: center; justify-content: center;"></div>
      <button class="btn btn-primary" id="btn-new-account">+ Nova conta</button>
    </div>

    ${accounts.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <div class="empty-title">Nenhuma conta cadastrada</div>
        <div class="empty-desc">Adicione sua conta corrente, poupança ou cartão de crédito</div>
      </div>
    ` : `
      <!-- 🏦 SEÇÃO 1: CONTAS BANCÁRIAS (Diferença entre Receitas e Despesas do mês) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🏦 Contas Bancárias <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Diferença entre Receitas e Despesas do mês)</span>
        </h3>
        <div class="accounts-grid">
          ${debitAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhuma conta bancária ativa para este período.</div>
          ` : debitAccounts.map(acc => {
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

      <!-- 💳 SEÇÃO 2: LIMITES DE CARTÕES (Fatura do período e limites disponíveis) -->
      <div style="margin-top: 32px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          💳 Limites de Cartões <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Fatura do período e limites disponíveis)</span>
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
            const available = Math.max(0, acc.credit_limit - spent);

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
                
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                  <div>
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">Fatura do Mês</div>
                    <div style="font-size:16px;font-weight:700;color:#f87171;">${fmt.currency(spent)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">Disponível</div>
                    <div style="font-size:16px;font-weight:700;color:var(--accent-light);">${fmt.currency(available)}</div>
                  </div>
                </div>

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

  // Mount Period Selector inside page-header
  const periodHolder = document.getElementById('accounts-period-holder');
  if (periodHolder) {
    periodHolder.appendChild(buildPeriodSelector(() => renderAccounts()));
  }

  document.getElementById('btn-new-account').onclick = async () => await openAccountModal(null);
  const btnTransfer = document.getElementById('btn-transfer');
  if (btnTransfer) btnTransfer.onclick = () => openTransferModal(accounts);
  document.querySelectorAll('.acc-edit').forEach(btn => {
    btn.onclick = async () => await openAccountModal(accounts.find(a => a.id === parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.acc-delete').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Excluir esta conta?')) { await window.api.accounts.delete(parseInt(btn.dataset.id)); toast('Conta removida'); renderAccounts(); }
    };
  });
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

  Modal.open(isEdit ? 'Editar Conta' : 'Nova Conta / Cartão', `
    <div class="form-group">
      <label>Nome da conta</label>
      <input type="text" id="acc-name" placeholder="Ex: Nubank, Itaú Corrente..." value="${acc?.name || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo</label>
        <select id="acc-type">
          ${Object.entries(ACCOUNT_TYPES).map(([v,l]) => `<option value="${v}" ${acc?.type === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Banco</label>
        <select id="acc-bank">
          ${Object.entries(BANKS).map(([v,b]) => `<option value="${v}" ${acc?.bank === v ? 'selected' : ''}>${b.emoji} ${b.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Perfil / Dono</label>
      <select id="acc-user-id">
        ${users.map(u => `<option value="${u.id}" ${(acc ? acc.user_id : State.user.id) === u.id ? 'selected' : ''}>${u.name} (@${u.username})</option>`).join('')}
      </select>
    </div>
    <div id="acc-debit-fields" style="${acc?.type === 'credit' ? 'display:none' : ''}">
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
    </div>
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
    <div class="form-group">
      <label>Cor de destaque</label>
      <div class="color-picker" id="acc-color-picker">
        ${COLORS.map(c => `<div class="color-swatch ${(acc?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="acc-cancel">Cancelar</button>
      <button class="btn btn-primary" id="acc-save">${isEdit ? 'Salvar' : 'Criar conta'}</button>
    </div>
  `);

  let selectedColor = acc?.color || '#10b981';
  document.querySelectorAll('#acc-color-picker .color-swatch').forEach(sw => {
    sw.onclick = () => { document.querySelectorAll('#acc-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); selectedColor = sw.dataset.color; };
  });
  document.getElementById('acc-type').onchange = (e) => {
    const isCredit = e.target.value === 'credit';
    document.getElementById('acc-credit-fields').style.display = isCredit ? '' : 'none';
    document.getElementById('acc-debit-fields').style.display = isCredit ? 'none' : '';
  };

  document.getElementById('acc-cancel').onclick = Modal.close;
  document.getElementById('acc-save').onclick = async () => {
    const name = document.getElementById('acc-name').value.trim();
    if (!name) { toast('Informe o nome', 'error'); return; }

    const balanceVal = parseFloat(document.getElementById('acc-balance')?.value);
    const limitVal = parseFloat(document.getElementById('acc-limit')?.value);
    const closingVal = parseInt(document.getElementById('acc-closing')?.value);
    const dueVal = parseInt(document.getElementById('acc-due')?.value);

    const data = {
      user_id: parseInt(document.getElementById('acc-user-id').value),
      name,
      type: document.getElementById('acc-type').value,
      bank: document.getElementById('acc-bank').value,
      balance: isNaN(balanceVal) ? 0 : balanceVal,
      color: selectedColor,
      credit_limit: isNaN(limitVal) ? null : limitVal,
      closing_day: isNaN(closingVal) ? null : closingVal,
      due_day: isNaN(dueVal) ? null : dueVal,
      agency: document.getElementById('acc-agency')?.value.trim() || null,
      account_number: document.getElementById('acc-account-number')?.value.trim() || null,
    };

    let res;
    if (isEdit) {
      data.id = acc.id;
      res = await window.api.accounts.update(data);
      if (res && res.error) {
        toast('Erro ao atualizar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta atualizada!');
    } else {
      res = await window.api.accounts.create(data);
      if (res && res.error) {
        toast('Erro ao criar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta criada!');
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

// ════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════
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
    const budgets = await window.api.budgets.getAll({ userId: State.budgetUserId, month: State.currentMonth, year: State.currentYear });
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
// SETTINGS
// ════════════════════════════════════════
async function renderSettings() {
  const PROFILE_LABELS = {
    1: 'ADM Dono do APP',
    2: 'Adm da Família',
    3: 'Filho Primogênito',
    4: 'Filho do Meio',
    5: 'Filho Caçula'
  };

  const page = document.getElementById('page-settings');
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

  let familySectionHtml = '';
  if (currentFamily && (State.user.profile_type === 1 || State.user.profile_type === 2)) {
    familySectionHtml = `
      <div class="settings-section">
        <div class="settings-section-title">🏠 Minha Família</div>
        <div class="card" style="padding:20px">
          <div class="form-group" style="margin-bottom:0">
            <label>Nome da Família</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
              <input type="text" id="family-name-input" value="${currentFamily.name}" style="flex-grow:1; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
              <button class="btn btn-primary btn-sm" id="save-family-name" style="padding: 10px 16px;">Salvar Nome</button>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Isso mudará o nome da sua família no topo e nos relatórios de todos os membros.</p>
          </div>
        </div>
      </div>
    `;
  }

  page.innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Configurações</h2></div></div>
    <div style="max-width:720px">

      <!-- Card de Apoio (Doação PagBank) -->
      <div class="settings-section">
        <div class="card" style="padding: 24px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.2); position: relative; overflow: hidden; margin-bottom: 24px;">
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; filter: blur(30px); pointer-events: none;"></div>
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="font-size: 32px; background: var(--accent-dim); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">☕</div>
            <div style="flex-grow: 1;">
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: var(--accent-light); display: flex; align-items: center; gap: 8px;">
                <span>Apoie o FinançasFamília</span>
              </h3>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                Este é um projeto independente e gratuito. Se o aplicativo está ajudando a sua família a gerenciar as finanças e planejar o futuro, considere nos apoiar com uma contribuição única de R$ 9,99!
              </p>
              <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 12px;">
                <a href="https://pag.ae/81ZdpUAX7" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 12px 24px; border-radius: 30px; font-weight: 600; font-size: 13px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;" onmouseover="this.style.transform='translateY(-2px) scale(1.02)'; this.style.boxShadow='0 8px 22px rgba(16, 185, 129, 0.5)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 15px rgba(16, 185, 129, 0.3)';">
                  <span style="font-size: 18px; background: rgba(255,255,255,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">☕</span>
                  <span style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                    <span style="font-weight: 700;">Apoiar com R$ 9,99</span>
                    <span style="font-size: 10px; opacity: 0.85;">Via PagBank (Cartão, Boleto ou PIX)</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">👤 Meu Perfil (Dados Cadastrais)</div>
        <div class="card" style="padding:24px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
          
          <div style="display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            ${renderAvatarHtml(State.user, 54)}
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>${State.user.name}</span>
                <span class="badge badge-purple" style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">${PROFILE_LABELS[State.user.profile_type] || 'Membro'}</span>
              </h3>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: var(--text-muted);">Usuário: @${State.user.username}</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-first-name" value="${State.user.first_name || ''}" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
            <div class="form-group">
              <label>Sobrenome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-last-name" value="${State.user.last_name || ''}" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CPF <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-cpf" placeholder="000.000.000-00" value="${State.user.cpf || ''}" maxlength="14" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
            <div class="form-group">
              <label>Data de Nascimento <span style="color: #ef4444;">*</span></label>
              <input type="date" id="prof-birth-date" value="${State.user.birth_date || ''}" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>E-mail <span style="color: #ef4444;">*</span></label>
              <input type="email" id="prof-email" placeholder="seu-email@provedor.com" value="${State.user.email || ''}" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
            <div class="form-group">
              <label>Celular (WhatsApp) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-phone" placeholder="(00) 00000-0000" value="${State.user.phone || ''}" maxlength="15" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Usuário (@username) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-username" value="${State.user.username}" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;" ${State.user.username === 'adm' ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label>Alterar Senha (Opcional)</label>
              <input type="password" id="prof-password" placeholder="Deixe em branco para manter a atual" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-muted); margin-top: -6px;"><span style="color: #ef4444;">*</span> Indica campos obrigatórios</div>

          <p class="auth-error" id="prof-error-text" style="margin: 0; font-size: 12px;"></p>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" id="save-my-profile" style="padding: 10px 24px; font-weight: 600;">Salvar Alterações</button>
          </div>

        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">⏰ Alertas de Vencimento</div>
        <div class="card" style="padding:20px">
          <div class="form-group">
            <label>Avisar com quantos dias de antecedência?</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
              <input type="number" id="alert-days" min="1" max="30" value="${settings.alert_days_before || 3}" style="width:100px">
              <span style="color:var(--text-muted);font-size:13px">dia(s) antes do vencimento</span>
              <button class="btn btn-primary btn-sm" id="save-alert-days">Salvar</button>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Itens recorrentes serão destacados com 🚨 quando estiverem a ${settings.alert_days_before || 3} dia(s) do vencimento.</p>
          </div>
        </div>
      </div>

      ${familySectionHtml}

      <div class="settings-section">
        <div class="settings-section-title">👥 Usuários</div>
        <div class="settings-list">
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
        <div style="margin-top:12px"><button class="btn btn-secondary btn-sm" id="btn-add-user">+ Adicionar usuário</button></div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">🏷️ Categorias</div>
        
        <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          
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
        
        <div style="margin-top:20px"><button class="btn btn-secondary btn-sm" id="btn-add-category">+ Nova categoria</button></div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">💾 Dados & Exportação</div>
        <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px; margin-top: 10px;">
          <button class="btn btn-secondary" id="btn-backup" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            💾 Exportar Backup do Banco (.db)
          </button>
          <div style="border-top: 1px dashed var(--border); margin: 8px 0;"></div>
          <button class="btn btn-primary" id="btn-export-month" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            📊 Exportar Excel (Mês Atual: ${capitalizedMonth}/${State.currentYear})
          </button>
          <button class="btn btn-primary" id="btn-export-year" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            📅 Exportar Excel (Ano Inteiro: ${State.currentYear})
          </button>
        </div>
      </div>
    </div>`;

  // --- MEU PERFIL EVENT BINDINGS & MASKS ---
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
      };
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          if (err) err.textContent = 'A nova senha deve possuir no mínimo 6 caracteres';
          return;
        }
        payload.password = password;
      }

      const r = await window.api.auth.updateUser(payload);
      if (!r.success) {
        if (err) err.textContent = r.error;
        return;
      }

      // Success! Update local State.user with the new values
      State.user.name = payload.name;
      State.user.first_name = payload.first_name;
      State.user.last_name = payload.last_name;
      State.user.cpf = payload.cpf;
      State.user.birth_date = payload.birth_date;
      State.user.email = payload.email;
      State.user.phone = payload.phone;
      State.user.username = payload.username;
      
      // Update sidebar name
      document.getElementById('sidebar-user-name').textContent = State.user.name;

      toast('Seu perfil foi atualizado com sucesso!', 'success');
      renderSettings();
    };
  }

  if (currentFamily && (State.user.profile_type === 1 || State.user.profile_type === 2)) {
    document.getElementById('save-family-name').onclick = async () => {
      const newName = document.getElementById('family-name-input').value.trim();
      if (!newName) { toast('O nome da família não pode ser vazio', 'error'); return; }
      const r = await window.api.families.update({
        id: currentFamily.id,
        name: newName,
        quota_users: currentFamily.quota_users,
        quota_accounts: currentFamily.quota_accounts
      });
      if (r.success) {
        toast(`Nome da família atualizado para "${newName}"!`);
        currentFamily.name = newName;
        State.familyName = newName;
        renderSettings();
      } else {
        toast('Erro ao atualizar nome da família: ' + r.error, 'error');
      }
    };
  }

  document.getElementById('save-alert-days').onclick = async () => {
    const days = parseInt(document.getElementById('alert-days').value);
    if (!days || days < 1) { toast('Informe um valor válido', 'error'); return; }
    await window.api.settings.set(State.user.id, 'alert_days_before', days);
    State.settings.alert_days_before = days;
    toast('Configuração salva');
  };
  document.getElementById('btn-add-user').onclick = () => openRegisterModal();
  document.getElementById('btn-add-category').onclick = () => openCategoryModal(categories);
  document.getElementById('btn-backup').onclick = async () => { const r = await window.api.backup.export(); if (r.success) toast('Backup exportado!'); };
  document.getElementById('btn-export-month').onclick = async () => {
    try {
      const res = await window.api.backup.exportExcel({
        userId: State.user.id,
        month: State.currentMonth,
        year: State.currentYear,
        type: 'monthly'
      });
      if (res.success) {
        toast('Excel mensal exportado com sucesso!');
      } else if (res.message !== 'Cancelado') {
        toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
      }
    } catch (err) {
      toast('Erro ao exportar: ' + err.message, 'error');
    }
  };
  document.getElementById('btn-export-year').onclick = async () => {
    try {
      const res = await window.api.backup.exportExcel({
        userId: State.user.id,
        year: State.currentYear,
        type: 'annual'
      });
      if (res.success) {
        toast('Excel anual exportado com sucesso!');
      } else if (res.message !== 'Cancelado') {
        toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
      }
    } catch (err) {
      toast('Erro ao exportar: ' + err.message, 'error');
    }
  };
  document.querySelectorAll('.cat-delete').forEach(btn => {
    btn.onclick = async () => { if (confirm('Excluir?')) { await window.api.categories.delete(parseInt(btn.dataset.id)); toast('Categoria excluída'); renderSettings(); } };
  });
  document.querySelectorAll('.cat-edit').forEach(btn => {
    btn.onclick = () => {
      const catId = parseInt(btn.dataset.id);
      const cat = categories.find(c => c.id === catId);
      if (cat) openCategoryModal(categories, cat);
    };
  });

  // Salvar edições do perfil pelo adm
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
          const confirmMsg = `Tem certeza que deseja excluir o usuário "${targetUser.name}" (@${targetUser.username})?\n\nISSO IRÁ APAGAR PERMANENTEMENTE:\n- A conta de acesso deste usuário\n- Todos os lançamentos dele\n- Todas as contas bancárias dele\n- Todos os planejamentos e metas criados por ele\n\nEsta ação NÃO pode ser desfeita. Deseja continuar?`;
          if (confirm(confirmMsg)) {
            const r = await window.api.auth.deleteUser(uId);
            if (r && r.error) {
              toast(r.error, 'error');
            } else {
              toast('Usuário e todos os seus dados excluídos com sucesso');
              renderSettings();
            }
          }
        }
      };
    });
    
    setupUserDragAndDrop(page.querySelector('.settings-list'));
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
async function initLoginScreen() {
  const familyId = localStorage.getItem('financeiro_family_id');
  const familyName = localStorage.getItem('financeiro_family_name');
  
  const divider = document.querySelector('.login-divider');
  const list = document.getElementById('user-list');
  
  if (familyId) {
    const users = await window.api.auth.getUsers({ familyId });
    if (users.length > 0) {
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
      localStorage.removeItem('financeiro_family_id');
      localStorage.removeItem('financeiro_family_name');
      return initLoginScreen();
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
  document.getElementById('go-login').onclick    = (e) => { e.preventDefault(); };
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

        if (!username || !password) {
          if (err) err.textContent = 'Por favor, preencha o Usuário e a Senha';
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
          password
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
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';
  if (!name || !username || !password) { errEl.textContent = 'Preencha todos os campos'; return; }
  if (password.length < 4) { errEl.textContent = 'Senha muito curta'; return; }
  const familyName = document.getElementById('reg-family-name')?.value.trim() || null;
  const r = await window.api.auth.register({ name, username, password, familyName });
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
