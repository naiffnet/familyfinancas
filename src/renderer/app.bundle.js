/* ============================================
 * app.bundle.js — FamilyFinancas Renderer
 * Gerado por: npm run build:renderer
 * 2026-08-29T11:26:45.766Z
 * Modulos: 25
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

/**
 * Retorna os feriados nacionais bancários no Brasil (Anbima/Febraban) para o ano especificado
 */
function getNationalHolidays(year) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const holidays = new Set([
    `${y}-01-01`, // Confraternização Universal
    `${y}-04-21`, // Tiradentes
    `${y}-05-01`, // Dia do Trabalho
    `${y}-09-07`, // Independência do Brasil
    `${y}-10-12`, // Nossa Senhora Aparecida
    `${y}-11-02`, // Finados
    `${y}-11-15`, // Proclamação da República
    `${y}-11-20`, // Dia Nacional da Consciência Negra
    `${y}-12-25`, // Natal
  ]);

  // Feriados Móveis baseados na Páscoa (Algoritmo de Meeus/Jones/Butcher)
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(y, month - 1, day);
  const carnaval = new Date(easter.getTime() - 47 * 86400000);
  const goodFriday = new Date(easter.getTime() - 2 * 86400000);
  const corpusChristi = new Date(easter.getTime() + 60 * 86400000);

  const formatIso = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  
  holidays.add(formatIso(carnaval));
  holidays.add(formatIso(goodFriday));
  holidays.add(formatIso(corpusChristi));

  return holidays;
}

function isBusinessDay(dateStr) {
  if (!dateStr) return true;
  const clean = dateStr.split(' ')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return true;
  const y = parseInt(parts[0], 10);
  const d = new Date(clean + 'T12:00:00');
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const holidays = getNationalHolidays(y);
  return !holidays.has(clean);
}

function getNextBusinessDay(dateStr) {
  if (!dateStr) return dateStr;
  const clean = dateStr.split(' ')[0];
  let d = new Date(clean + 'T12:00:00');
  let currentIso = clean;
  
  while (!isBusinessDay(currentIso)) {
    d = new Date(d.getTime() + 86400000);
    currentIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return currentIso;
}

function isWeekendOrHoliday(dateStr) {
  return !isBusinessDay(dateStr);
}

/**
 * Calcula projeção de juros e encargos com base nas regras do contrato / instituição
 * e aplica prorrogação legal automática para o próximo dia útil se vencer em fim de semana/feriado.
 */
function calculateProjectedInterest(baseAmount, dueDateStr, targetDateStr, rule = {}) {
  const base = parseFloat(baseAmount) || 0;
  if (!base || !dueDateStr || !targetDateStr) {
    return { projectedAmount: base, penaltyAmount: 0, daysLate: 0, dailyRatePct: 0, fixedPenalty: 0, isLate: false };
  }
  const cleanDue = dueDateStr.split(' ')[0];
  const cleanTarget = targetDateStr.split(' ')[0];
  
  // Prorrogação legal bancária: vencimento em fim de semana ou feriado prorroga para o 1º dia útil
  const effectiveDue = getNextBusinessDay(cleanDue);
  
  const dEffectiveDue = new Date(effectiveDue + 'T00:00:00');
  const dTarget = new Date(cleanTarget + 'T00:00:00');
  const diffDays = Math.round((dTarget - dEffectiveDue) / 86400000);
  const isLate = diffDays > 0;
  const daysLate = isLate ? diffDays : 0;

  if (!isLate) {
    return { 
      projectedAmount: base, 
      penaltyAmount: 0, 
      daysLate: 0, 
      dailyRatePct: 0, 
      fixedPenalty: 0, 
      isLate: false, 
      daysEarly: Math.abs(diffDays),
      isProrogated: cleanDue !== effectiveDue,
      effectiveDueDate: effectiveDue
    };
  }

  const rate = parseFloat(rule.interest_rate) || 0;
  const type = rule.interest_type || 'daily';
  const fixedRate = parseFloat(rule.penalty_fixed_rate) || 0;

  const fixedPenalty = (base * fixedRate) / 100;
  let dailyRatePct = 0;

  if (type === 'daily') {
    dailyRatePct = rate;
  } else if (type === 'monthly') {
    dailyRatePct = rate / 30;
  } else if (type === 'yearly') {
    dailyRatePct = rate / 365;
  } else if (type === 'installment' || type === 'contract') {
    dailyRatePct = 0;
  }

  const dailyInterest = (base * (dailyRatePct / 100)) * daysLate;
  const totalPenalty = Math.round((fixedPenalty + dailyInterest) * 100) / 100;

  return {
    projectedAmount: Math.round((base + totalPenalty) * 100) / 100,
    penaltyAmount: totalPenalty,
    daysLate,
    dailyRatePct: parseFloat(dailyRatePct.toFixed(4)),
    fixedPenalty,
    isLate: true,
    isProrogated: cleanDue !== effectiveDue,
    effectiveDueDate: effectiveDue
  };
}

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
  document.querySelectorAll('.mobile-nav-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelector(`.sidebar-nav [data-page="${page}"]`)?.classList.add('active');
  document.querySelector(`.mobile-bottom-nav [data-page="${page}"]`)?.classList.add('active');
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

  // Se estiver em ambiente Mobile / Smartphone, renderizar o Dashboard Mobile focado em Lançamentos & Limites de Cartão
  if (document.body.classList.contains('is-mobile-env') || window.innerWidth <= 768) {
    if (typeof renderMobileAppDashboard === 'function') {
      await renderMobileAppDashboard(page);
      return;
    }
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

    const income = effectivePaidIncomes.reduce((acc, t) => acc + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
    const expense = effectivePaidExpenses.reduce((acc, t) => acc + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
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
  contentDiv.querySelectorAll('.btn-dash-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const txId = parseInt(btn.dataset.id);
      if (txId && typeof openPixPaymentModal === 'function') {
        openPixPaymentModal(txId, () => renderDashboard());
      }
    };
  });

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
                      ${(item.pix_code || (item.notes && item.notes.includes('000201'))) ? `<button type="button" class="btn-dash-pix" data-id="${item.id}" title="Pagar com PIX (Abrir QR Code)" style="background:rgba(6,182,212,0.18);color:#38bdf8;border:1px solid rgba(6,182,212,0.4);font-size:9px;padding:1px 6px;border-radius:4px;cursor:pointer;font-weight:800;display:inline-flex;align-items:center;gap:2px">⚡ PIX</button>` : ''}
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
        const netAmount = (t.amount || 0) + (t.is_paid ? ((t.penalty_amount || 0) - (t.discount_amount || 0)) : 0);
        catMap[name].amount += netAmount;
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

    const todayStr = new Date().toISOString().split('T')[0];
    const rule = {
      interest_rate: (tx && tx.interest_rate !== undefined) ? tx.interest_rate : item.interest_rate,
      interest_type: (tx && tx.interest_type) ? tx.interest_type : item.interest_type,
      penalty_fixed_rate: (tx && tx.penalty_fixed_rate !== undefined) ? tx.penalty_fixed_rate : item.penalty_fixed_rate,
    };
    const proj = (!isPaid && isOverdue) ? calculateProjectedInterest(baseAmount, compDateStr, todayStr, rule) : null;

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
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171" title="${Math.abs(daysLeft)}d de atraso${proj && proj.penaltyAmount > 0 ? ` • Juros estimados: +${fmt.currency(proj.penaltyAmount)}` : ''}">⚠️ Atrasado (${Math.abs(daysLeft)}d)</span>`;
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
          ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
            <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-top:-2px" title="Valor aproximado atualizado para hoje com encargos (+${fmt.currency(proj.penaltyAmount)})">
              Aprox. hoje: ${fmt.currency(proj.projectedAmount)}
            </div>
          ` : ''}
          ${isPaid && (hasPenalty || hasDiscount) ? `
            <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
              Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(tx.penalty_amount)}` : `Desconto: -${fmt.currency(tx.discount_amount)}`}
            </div>
          ` : ''}
          ${statusBadge}
        </div>
        <div class="transaction-actions">
          ${((tx && (tx.pix_code || (tx.notes && tx.notes.includes('000201')))) || (item.pix_code || (item.notes && item.notes.includes('000201')))) ? `<button class="btn btn-secondary btn-sm rec-pix" data-id="${tx ? tx.id : item.id}" title="Pagar com PIX (QR Code)" style="background:rgba(6,182,212,0.14);color:#38bdf8;border-color:rgba(6,182,212,0.4);font-size:11px;padding:2px 7px;border-radius:6px;font-weight:700">⚡ PIX</button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-priority" data-id="${item.id}" title="${item.is_priority ? 'Remover prioridade' : 'Marcar como prioritário'}">${item.is_priority ? '★' : '☆'}</button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-edit" data-id="${item.id}" title="Editar">✏️</button>` : ''}
          ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon rec-delete" data-id="${item.id}" title="Excluir">🗑</button>` : ''}
          ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.rec-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const targetId = parseInt(btn.dataset.id);
      const tx = monthlyTxs.find(t => t.id == targetId || t.recurring_item_id == targetId);
      if (tx && typeof openPixPaymentModal === 'function') openPixPaymentModal(tx, () => renderRecurring());
    };
  });

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
          <div style="padding: 4px 2px;">
            <div style="text-align: center; margin-bottom: 18px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); color: #10b981; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(16, 185, 129, 0.25);">
                ✏️
              </div>
              <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Como deseja editar este lançamento?</h3>
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${tx.description || item.name}</span>
              </div>
            </div>

            <div class="choice-options-container">
              <div class="choice-option-card card-accent-emerald" id="btn-edit-month">
                <div class="choice-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
                  📅
                </div>
                <div class="choice-body">
                  <div class="choice-title">
                    <span>Apenas este mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})</span>
                  </div>
                  <div class="choice-desc">
                    Altera valor, vencimento ou categoria somente desta ocorrência. As outras parcelas continuam inalteradas.
                  </div>
                </div>
                <div class="choice-chevron">›</div>
              </div>

              <div class="choice-option-card card-accent-indigo" id="btn-edit-all">
                <div class="choice-icon-wrap" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25);">
                  ⚙️
                </div>
                <div class="choice-body">
                  <div class="choice-title">
                    <span>Cadastro Fixo Geral (Regra Mestre)</span>
                  </div>
                  <div class="choice-desc">
                    Altera a regra principal de valor, repetições, conta ou vencimento para todas as parcelas e meses futuros.
                  </div>
                </div>
                <div class="choice-chevron">›</div>
              </div>
            </div>

            <div style="margin-top: 16px; text-align: center;">
              <button class="btn btn-secondary" id="btn-edit-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
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
        <div style="padding: 4px 2px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(239, 68, 68, 0.25);">
              🗑️
            </div>
            <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Como deseja excluir este lançamento?</h3>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${item.name}</span>
            </div>
          </div>

          <div class="choice-options-container">
            ${tx ? `
            <div class="choice-option-card card-accent-amber" id="btn-del-month">
              <div class="choice-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                🗓️
              </div>
              <div class="choice-body">
                <div class="choice-title">
                  <span>Excluir apenas neste mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})</span>
                </div>
                <div class="choice-desc">
                  Remove somente o lançamento desta competência. O cadastro fixo e os meses futuros continuam ativos.
                </div>
              </div>
              <div class="choice-chevron">›</div>
            </div>
            ` : ''}

            <div class="choice-option-card card-accent-danger" id="btn-del-all">
              <div class="choice-icon-wrap" style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25);">
                🚫
              </div>
              <div class="choice-body">
                <div class="choice-title">
                  <span style="color: #f87171;">Desativar Cadastro Fixo (Todos os Meses)</span>
                </div>
                <div class="choice-desc">
                  Desativa a regra mestre e remove todas as ocorrências futuras de forma definitiva.
                </div>
              </div>
              <div class="choice-chevron">›</div>
            </div>
          </div>

          <div style="margin-top: 16px; text-align: center;">
            <button class="btn btn-secondary" id="btn-del-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
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
              <div style="padding: 4px 2px;">
                <div style="text-align: center; margin-bottom: 18px;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(14, 165, 233, 0.12); color: #38bdf8; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(14, 165, 233, 0.25);">
                    ⏳
                  </div>
                  <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Tratamento do Parcelamento</h3>
                  <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${tx.description}</span>
                  </div>
                </div>

                <div class="choice-options-container">
                  <div class="choice-option-card card-accent-emerald" id="btn-postpone">
                    <div class="choice-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
                      ➡️
                    </div>
                    <div class="choice-body">
                      <div class="choice-title">
                        <span>Postergar Parcela (Adiar para o próximo mês)</span>
                      </div>
                      <div class="choice-desc">
                        Empurra esta parcela e todas as subsequentes em 1 mês para a frente, mantendo o total de parcelas intacto.
                      </div>
                    </div>
                    <div class="choice-chevron">›</div>
                  </div>

                  <div class="choice-option-card card-accent-amber" id="btn-skip">
                    <div class="choice-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                      ⏭️
                    </div>
                    <div class="choice-body">
                      <div class="choice-title">
                        <span>Pular Parcela (Cancelar apenas deste mês)</span>
                      </div>
                      <div class="choice-desc">
                        Cancela a cobrança deste mês sem alterar o cronograma das parcelas dos meses seguintes.
                      </div>
                    </div>
                    <div class="choice-chevron">›</div>
                  </div>
                </div>

                <div style="margin-top: 16px; text-align: center;">
                  <button class="btn btn-secondary" id="btn-postpone-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
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

  // Clique na linha do lançamento fixo para abrir Pop-up de Detalhes completos
  list.querySelectorAll('.recurring-item').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('.transaction-check-btn, .rec-pix, .rec-priority, .rec-edit, .rec-delete')) return;
      const itemId = parseInt(row.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);
      if (typeof openTransactionDetailsModal === 'function') {
        openTransactionDetailsModal({ tx, item, accounts, categories, type, onUpdate: () => renderRecurring() });
      }
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

    const todayStr = new Date().toISOString().split('T')[0];
    const rule = {
      interest_rate: t.interest_rate,
      interest_type: t.interest_type,
      penalty_fixed_rate: t.penalty_fixed_rate,
    };
    const proj = (!isPaid && isOverdue) ? calculateProjectedInterest(baseAmount, compDateStr, todayStr, rule) : null;

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
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171" title="${Math.abs(daysLeft)}d de atraso${proj && proj.penaltyAmount > 0 ? ` • Juros estimados: +${fmt.currency(proj.penaltyAmount)}` : ''}">⚠️ Atrasado (${Math.abs(daysLeft)}d)</span>`;
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
        <div class="transaction-meta">${fmt.date(t.date)}${typeof isWeekendOrHoliday === 'function' && isWeekendOrHoliday(t.date) && !isPaid ? ` <span style="font-size:10.5px;color:#60a5fa;font-weight:600" title="Vence em fim de semana ou feriado. Prorroga para o 1º dia útil: ${fmt.date(getNextBusinessDay(t.date))}">📅 Prorroga: ${fmt.date(getNextBusinessDay(t.date))}</span>` : ''} • ${(t.account_type === 'credit' || accounts.find(a => a.id === t.account_id)?.type === 'credit') ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);font-weight:600">💳 ${t.account_name}</span>` : (t.account_name || '—')} ${t.category_name ? `• ${t.category_name}` : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="transaction-amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(isPaid ? netAmount : baseAmount)}</div>
        ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
          <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-top:-2px" title="Valor aproximado atualizado para hoje com encargos (+${fmt.currency(proj.penaltyAmount)})">
            Aprox. hoje: ${fmt.currency(proj.projectedAmount)}
          </div>
        ` : ''}
        ${isPaid && (hasPenalty || hasDiscount) ? `
          <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
            Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(t.penalty_amount)}` : `Desconto: -${fmt.currency(t.discount_amount)}`}
          </div>
        ` : ''}
        ${statusBadge}
      </div>
      <div class="transaction-actions">
        ${(t.pix_code || (t.notes && t.notes.includes('000201'))) ? `<button class="btn btn-secondary btn-sm avl-pix" data-id="${t.id}" title="Pagar com PIX (QR Code)" style="background:rgba(6,182,212,0.14);color:#38bdf8;border-color:rgba(6,182,212,0.4);font-size:11px;padding:2px 7px;border-radius:6px;font-weight:700">⚡ PIX</button>` : ''}
        ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon avl-edit" data-id="${t.id}" title="Editar">✏️</button>` : ''}
        ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon avl-delete" data-id="${t.id}" title="Excluir">🗑</button>` : ''}
        ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.avl-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tx = txs.find(t => t.id == parseInt(btn.dataset.id));
      if (tx && typeof openPixPaymentModal === 'function') openPixPaymentModal(tx, () => renderRecurring());
    };
  });

  list.querySelectorAll('.avl-toggle').forEach(btn => {
    btn.onclick = async () => {
      const txId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == txId);
      if (tx && tx.is_paid) {
        await window.api.transactions.togglePaid(txId);
        toast('Status atualizado');
        renderRecurring();
      } else {
        openPaymentDateModal(txId, tx ? tx.date : null, () => renderRecurring());
      }
    };
  });
  list.querySelectorAll('.avl-edit').forEach(btn => {
    btn.onclick = () => {
      const tx = txs.find(t => t.id == parseInt(btn.dataset.id));
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
        <div style="padding: 4px 2px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(239, 68, 68, 0.25);">
              🗑️
            </div>
            <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Excluir Lançamento Variável</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 12px 0;">
              Tem certeza que deseja excluir permanentemente este lançamento?
            </p>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12.5px; color: var(--text-secondary); max-width: 90%;">
              <span>📌 <strong>${desc}</strong>${amountStr ? ' • <strong style="color:#f87171">' + amountStr + '</strong>' : ''}</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-secondary" id="btn-cancel-delete-avl" style="flex: 1; padding: 10px; font-size: 13px; border-radius: 8px;">
              Cancelar
            </button>
            <button class="btn btn-danger" id="btn-confirm-delete-avl" style="flex: 1.3; font-weight: 700; padding: 10px; background: #ef4444; border-color: #ef4444; color: #fff; border-radius: 8px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🗑️</span> Confirmar Exclusão
            </button>
          </div>
        </div>
      `);

      document.getElementById('btn-cancel-delete-avl').onclick = Modal.close;
      document.getElementById('btn-confirm-delete-avl').onclick = async () => {
        Modal.close();
        const res = await window.api.transactions.delete(txId);
        if (res && res.error) toast(res.error, 'error');
        else { toast('Despesa variável excluída com sucesso!', 'success'); renderRecurring(); }
      };
    };
  });

  // Clique na linha do lançamento avulso para abrir Pop-up de Detalhes completos
  list.querySelectorAll('.transaction-item').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('.transaction-check-btn, .avl-pix, .avl-edit, .avl-delete')) return;
      const txId = parseInt(row.dataset.id);
      const tx = txs.find(t => t.id == txId);
      if (tx && typeof openTransactionDetailsModal === 'function') {
        openTransactionDetailsModal({ tx, item: null, accounts, categories, type: tx.type, onUpdate: () => renderRecurring() });
      }
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
  const todayStr = new Date().toISOString().split('T')[0];

  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);
  const paidInvoices = invoices.filter(i => i.is_paid);
  const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);
  const openInvoices = invoices.filter(i => !i.is_paid);
  const openAmount = openInvoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);

  container.innerHTML = `
    <div class="invoices-section-wrap" style="margin-top: 20px; margin-bottom: 24px;">
      <!-- Section Title & Executive KPI Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
        <div style="font-size: 15.5px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">💳</span> Faturas de Cartão de Crédito
          <span style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); background: var(--bg-surface); padding: 3px 9px; border-radius: 12px; border: 1px solid var(--border);">
            ${invoices.length} ${invoices.length === 1 ? 'cartão' : 'cartões'} • ${mName}/${State.currentYear}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface); border: 1px solid var(--border); padding: 5px 12px; border-radius: 8px; font-size: 11.5px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
            <span style="color: var(--text-muted);">Total Geral:</span>
            <strong style="color: var(--text-primary); font-weight: 800;">${fmt.currency(totalAmount)}</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 5px 12px; border-radius: 8px; font-size: 11.5px;">
            <span style="color: #10b981; font-weight: 700;">✓ Pago (${paidInvoices.length}):</span>
            <strong style="color: #10b981; font-weight: 800;">${fmt.currency(paidAmount)}</strong>
          </div>
          ${openInvoices.length > 0 ? `
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 5px 12px; border-radius: 8px; font-size: 11.5px;">
            <span style="color: #f59e0b; font-weight: 700;">⏳ Aberto (${openInvoices.length}):</span>
            <strong style="color: #f87171; font-weight: 800;">${fmt.currency(openAmount)}</strong>
          </div>` : ''}
        </div>
      </div>

      <!-- Invoices Responsive Grid -->
      <div class="invoices-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 14px;">
        ${invoices.map(inv => {
          const b = BANKS[inv.bank] || BANKS.outro;
          const netAmount = inv.amount + (inv.penalty_amount || 0) - (inv.discount_amount || 0);
          const userBadge = inv.user_name ? `<span class="profile-badge" style="background:${inv.user_avatar_color || '#10b981'}18;color:${inv.user_avatar_color || '#10b981'};border:1px solid ${inv.user_avatar_color || '#10b981'}33;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700">${inv.user_name}</span>` : '';
          const cardAccountId = inv.card_account_id || inv.card_id || inv.account_id;
          const isSelected = (State.highlightCardId && State.highlightCardId === cardAccountId) || (State.highlightInvoiceId && State.highlightInvoiceId === inv.id);
          const isOverdue = !inv.is_paid && inv.due_date && inv.due_date < todayStr;
          
          return `
            <div class="invoice-card-item ${isSelected ? 'invoice-card-selected' : ''}" 
                 data-card-id="${cardAccountId || ''}" 
                 data-invoice-id="${inv.id || ''}" 
                 data-bank-color="${b.color}" 
                 data-card-name="${inv.card_name}"
                 style="--card-bank-color: ${b.color};">
              
              <!-- Colored Top Indicator Line -->
              <div class="invoice-card-top-bar" style="background: linear-gradient(90deg, ${b.color}, ${b.color}88);"></div>

              <div class="invoice-card-header">
                <div class="invoice-bank-logo-wrap" style="background: ${b.color}18; border: 1px solid ${b.color}44;">
                  ${bankLogo(inv.bank, 36)}
                </div>
                <div class="invoice-card-info">
                  <div class="invoice-card-title">
                    <span class="invoice-card-name">${inv.card_name.toUpperCase()}</span>
                    <span class="invoice-ref-tag">Ref: ${String(inv.month).padStart(2,'0')}/${inv.year}</span>
                    ${userBadge}
                  </div>
                  <div class="invoice-card-meta">
                    <span class="meta-chip">📅 Vence dia <strong>${inv.due_day}</strong></span>
                    <span class="meta-chip">🔒 Fecha dia <strong>${inv.closing_day}</strong></span>
                  </div>
                </div>
              </div>
              
              <div class="invoice-card-middle">
                <div class="invoice-card-amount-col">
                  <div class="invoice-amount-label">Valor Total da Fatura</div>
                  <div class="invoice-card-amount">
                    ${fmt.currency(netAmount)}
                  </div>
                </div>
                
                <div class="invoice-card-status-wrap">
                  ${inv.is_renegotiated ? `
                    <span class="invoice-status-pill status-reneg">
                      <span>🤝</span> Acordo / Parcelada
                    </span>
                  ` : inv.is_paid ? `
                    <span class="invoice-status-pill status-paid" title="${inv.payment_account_name ? 'Conta: ' + inv.payment_account_name : ''}">
                      <span>✓</span> Quitada ${inv.payment_date ? 'em ' + fmt.date(inv.payment_date) : ''}
                    </span>
                  ` : `
                    <span class="invoice-status-pill status-pending ${isOverdue ? 'status-overdue' : ''}">
                      <span>${isOverdue ? '⚠️' : '⏳'}</span> ${isOverdue ? 'Em Atraso' : 'Aberta'} • Vence ${fmt.date(inv.due_date)}
                    </span>
                  `}
                </div>
              </div>

              <div class="invoice-card-footer">
                <button type="button" class="btn invoice-highlight-btn ${isSelected ? 'btn-highlight-active' : ''}">
                  ${isSelected ? '✨ Parcelas Destacadas' : '🔍 Ver Parcelas desta Fatura'}
                </button>

                <div class="invoice-card-actions">
                  ${!inv.is_paid ? `
                    <button class="btn btn-sm renegotiate-invoice-btn" data-id="${inv.id}" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 700; border-radius: 8px; padding: 6px 12px;">
                      🤝 Acordo
                    </button>
                    <button class="btn btn-sm btn-primary pay-invoice-btn" data-id="${inv.id}" style="background:${b.color};border-color:${b.color}; color:#fff; font-weight: 700; border-radius: 8px; padding: 6px 14px; box-shadow: 0 2px 8px ${b.color}44;">
                      💳 Pagar Fatura
                    </button>
                  ` : `
                    <button class="btn btn-sm btn-secondary reopen-invoice-btn" data-id="${inv.id}" title="Reabrir fatura e restaurar lançamentos para edição" style="font-size: 11.5px; border-radius: 8px; padding: 6px 12px;">
                      ${inv.is_renegotiated ? '↩️ Desfazer Acordo' : '↩️ Desfazer Pagamento'}
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Bind invoice card click to toggle highlight on its installments
  container.querySelectorAll('.invoice-card-item').forEach(cardEl => {
    cardEl.onclick = (e) => {
      if (e.target.closest('.pay-invoice-btn, .renegotiate-invoice-btn, .reopen-invoice-btn, .invoice-highlight-btn')) {
        return;
      }
      const cardId = parseInt(cardEl.dataset.cardId);
      const invoiceId = parseInt(cardEl.dataset.invoiceId);
      const cardColor = cardEl.dataset.bankColor;
      const cardName = cardEl.dataset.cardName;
      toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId);
    };
  });

  container.querySelectorAll('.invoice-highlight-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cardEl = btn.closest('.invoice-card-item');
      if (!cardEl) return;
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

/**
 * Abre o Pop-up com todas as informações detalhadas do lançamento
 * e os 3 botões de ação: Excluir, Editar e Pagar.
 */
function openTransactionDetailsModal({ tx, item, accounts = [], categories = [], type = 'expense', onUpdate = null }) {
  const isPaid = tx ? !!tx.is_paid : false;
  const description = tx ? (tx.description || (item ? item.name : 'Lançamento')) : (item ? item.name : 'Lançamento');
  const baseAmount = tx ? (tx.amount || 0) : (item ? (item.amount || 0) : 0);
  const penalty = tx ? (tx.penalty_amount || 0) : 0;
  const discount = tx ? (tx.discount_amount || 0) : 0;
  const netAmount = baseAmount + (isPaid ? (penalty - discount) : 0);

  const txDate = tx ? tx.date : (item ? `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}-${String(item.due_day || 1).padStart(2, '0')}` : null);
  const payDate = tx ? tx.payment_date : null;
  const compDate = tx ? tx.competence_date : null;

  // Account
  const accId = (tx ? tx.account_id : null) || (item ? item.account_id : null);
  const acc = accounts.find(a => a.id === accId) || {};
  const isCreditCard = acc.type === 'credit' || (item && item.account_type === 'credit');

  // Category
  const catId = (tx ? tx.category_id : null) || (item ? item.category_id : null);
  const cat = categories.find(c => c.id === catId) || {};
  const catName = cat.name || (tx ? tx.category_name : null) || (item ? item.category_name : null) || 'Sem Categoria';
  const catIcon = cat.icon || (tx ? tx.category_icon : null) || (item ? item.icon : null) || (type === 'income' ? '💰' : '📋');
  const catColor = cat.color || (item ? item.color : null) || '#94a3b8';

  // User
  const userName = (tx ? tx.user_name : null) || (acc ? acc.user_name : null) || (item ? item.user_name : null) || (State.user ? State.user.name : 'Titular');
  const userColor = (tx ? tx.user_avatar_color : null) || (acc ? acc.user_avatar_color : null) || '#10b981';

  // Notes & PIX
  const notes = (tx ? tx.notes : null) || (item ? item.notes : null) || '';
  const pixCode = (tx ? tx.pix_code : null) || (item ? item.pix_code : null) || (notes && notes.includes('000201') ? notes : null);

  // Overdue calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isPaid && txDate && txDate < todayStr;
  const holidayOrWeekend = txDate && typeof isWeekendOrHoliday === 'function' && isWeekendOrHoliday(txDate);
  const nextBusinessDay = holidayOrWeekend && typeof getNextBusinessDay === 'function' ? getNextBusinessDay(txDate) : null;

  // Projected interest if overdue
  let proj = null;
  if (isOverdue && typeof calculateOverdueProjections === 'function') {
    const dailyRate = (item && item.interest_rate) || 0.033;
    const penaltyRate = (item && item.penalty_fixed_rate) || 2.0;
    proj = calculateOverdueProjections(baseAmount, txDate, todayStr, dailyRate, penaltyRate);
  }

  // Nature (Fixo / Parcela / Avulso)
  let natureLabel = 'Lançamento Avulso (Variável)';
  if (item) {
    if (item.repeat_months > 0) {
      natureLabel = `Parcelamento (${item.repeat_months}x)`;
    } else {
      natureLabel = 'Lançamento Fixo Recorrente';
    }
  }

  // Can user edit
  const canEdit = State.user.profile_type === 1 || (State.permissions && State.permissions.can_edit_all) || (tx && tx.user_id === State.user.id) || (item && item.user_id === State.user.id);

  // Status Badge
  let statusBadgeHtml = '';
  if (isPaid) {
    statusBadgeHtml = `<span class="badge badge-green" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">✓ Pago${payDate ? ' em ' + fmt.date(payDate) : ''}</span>`;
  } else if (isOverdue) {
    statusBadgeHtml = `<span class="badge badge-danger" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">⚠️ Em Atraso${proj ? ` (${proj.daysLate} dias)` : ''}</span>`;
  } else {
    statusBadgeHtml = `<span class="badge badge-yellow" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">⏳ Pendente</span>`;
  }

  Modal.open('Detalhes do Lançamento', `
    <div style="padding: 2px;">
      <!-- Top Card Header -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${catColor}22; border: 1px solid ${catColor}44; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
              ${catIcon}
            </div>
            <div style="min-width: 0;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; line-height: 1.3; word-break: break-word;">
                ${item && item.is_priority ? '<span title="Item Prioritário" style="margin-right: 4px;">⭐</span>' : ''}${description}
              </h3>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="badge ${type === 'income' ? 'badge-green' : 'badge-red'}" style="font-size: 10px; text-transform: uppercase;">
                  ${type === 'income' ? 'Receita' : 'Despesa'}
                </span>
                <span class="badge" style="font-size: 10px; background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border);">
                  ${natureLabel}
                </span>
                ${statusBadgeHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Big Highlight Amount -->
        <div style="padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${isPaid ? 'Valor Líquido Liquidado' : 'Valor Total'}
            </div>
            <div style="font-size: 26px; font-weight: 900; color: ${type === 'income' ? 'var(--accent-light)' : '#f87171'}; letter-spacing: -0.02em;">
              ${type === 'income' ? '+' : '-'}${fmt.currency(netAmount)}
            </div>
          </div>
          ${(penalty > 0 || discount > 0) && isPaid ? `
            <div style="text-align: right; font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border);">
              <div>Base: <strong>${fmt.currency(baseAmount)}</strong></div>
              ${penalty > 0 ? `<div style="color: #f87171;">Juros/Multa: +${fmt.currency(penalty)}</div>` : ''}
              ${discount > 0 ? `<div style="color: var(--accent-light);">Desconto: -${fmt.currency(discount)}</div>` : ''}
            </div>
          ` : ''}
          ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
            <div style="text-align: right; font-size: 11.5px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); padding: 6px 10px; border-radius: 6px; color: #fbbf24;">
              <div>Atualizado hoje: <strong>${fmt.currency(proj.projectedAmount)}</strong></div>
              <div style="font-size: 10px; opacity: 0.8;">(+${fmt.currency(proj.penaltyAmount)} encargos)</div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Information Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <!-- Vencimento -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📅 Vencimento / Competência</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${txDate ? fmt.date(txDate) : '—'}</div>
          ${nextBusinessDay && !isPaid ? `
            <div style="font-size: 10px; color: #60a5fa; font-weight: 600; margin-top: 2px;">
              📅 Prorroga: ${fmt.date(nextBusinessDay)} (1º dia útil)
            </div>
          ` : ''}
          ${compDate ? `
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
              Ref: ${fmtCompetence(compDate)}
            </div>
          ` : ''}
        </div>

        <!-- Conta / Cartão -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">💳 Conta / Cartão</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            ${isCreditCard ? '💳' : '🏦'} ${acc.name || 'Conta Geral'}
          </div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
            ${acc.bank ? (BANKS[acc.bank]?.name || acc.bank) : 'Geral'} • ${isCreditCard ? 'Cartão de Crédito' : (ACCOUNT_TYPES[acc.type] || 'Conta Corrente')}
          </div>
        </div>

        <!-- Categoria -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📁 Categoria</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>${catIcon}</span> ${catName}
          </div>
        </div>

        <!-- Responsável -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">👤 Responsável / Membro</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${userColor}; display: inline-block;"></span>
            ${userName}
          </div>
        </div>
      </div>

      <!-- Notes / PIX details if present -->
      ${notes ? `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📝 Observações</div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; word-break: break-word;">${notes}</div>
        </div>
      ` : ''}

      ${pixCode ? `
        <div style="background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.3); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span>⚡</span> Chave PIX / Código Copia e Cola
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace;">
              ${pixCode}
            </div>
          </div>
          <button class="btn btn-sm" id="tdm-btn-copy-pix" style="background: rgba(6,182,212,0.2); color: #38bdf8; border-color: rgba(6,182,212,0.5); font-size: 11px; font-weight: 700; flex-shrink: 0; padding: 4px 10px; border-radius: 6px;">
            📋 Copiar
          </button>
        </div>
      ` : ''}

      <!-- 3 Botões de Ação Principais: Excluir, Editar e Pagar -->
      <div style="display: flex; gap: 10px; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); flex-wrap: wrap;">
        <!-- Botão 1: Excluir -->
        <button type="button" class="btn btn-outline" id="tdm-btn-delete" style="border-color: rgba(239,68,68,0.4); color: #f87171; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
          <span>🗑️</span> Excluir
        </button>

        <!-- Botão 2: Editar -->
        <button type="button" class="btn btn-outline" id="tdm-btn-edit" style="border-color: rgba(139,92,246,0.4); color: #c084fc; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
          <span>✏️</span> Editar
        </button>

        <!-- Botão 3: Pagar / Desfazer -->
        ${isPaid ? `
          <button type="button" class="btn btn-secondary" id="tdm-btn-pay" style="flex: 1; min-width: 150px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 8px; background: rgba(255,255,255,0.06);" ${!canEdit ? 'disabled' : ''}>
            <span>↩️</span> Desfazer Pagamento
          </button>
        ` : `
          <button type="button" class="btn btn-primary" id="tdm-btn-pay" style="flex: 1; min-width: 150px; background: #10b981; border-color: #10b981; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
            <span>✅</span> Liquidar / Pagar
          </button>
        `}
      </div>
    </div>
  `);

  // 1. Copy PIX handler
  const copyBtn = document.getElementById('tdm-btn-copy-pix');
  if (copyBtn && pixCode) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pixCode);
      toast('Código PIX copiado para a área de transferência!', 'success');
    };
  }

  // 2. Action: Excluir
  const delBtn = document.getElementById('tdm-btn-delete');
  if (delBtn) {
    delBtn.onclick = () => {
      Modal.close();
      if (item) {
        const delEl = document.querySelector(`.rec-delete[data-id="${item.id}"]`);
        if (delEl) delEl.click();
      } else if (tx) {
        const delEl = document.querySelector(`.avl-delete[data-id="${tx.id}"]`);
        if (delEl) delEl.click();
      }
    };
  }

  // 3. Action: Editar
  const editBtn = document.getElementById('tdm-btn-edit');
  if (editBtn) {
    editBtn.onclick = () => {
      Modal.close();
      if (item) {
        const editEl = document.querySelector(`.rec-edit[data-id="${item.id}"]`);
        if (editEl) editEl.click();
      } else if (tx) {
        const editEl = document.querySelector(`.avl-edit[data-id="${tx.id}"]`);
        if (editEl) editEl.click();
      }
    };
  }

  // 4. Action: Pagar / Desfazer
  const payBtn = document.getElementById('tdm-btn-pay');
  if (payBtn) {
    payBtn.onclick = async () => {
      if (isPaid && tx) {
        Modal.close();
        await window.api.transactions.togglePaid(tx.id);
        toast('Pagamento desfeito! Lançamento voltou para pendente.');
        onUpdate?.();
      } else if (tx) {
        Modal.close();
        openPaymentDateModal(tx.id, tx.date, () => {
          onUpdate?.();
        });
      } else if (item) {
        Modal.close();
        openPaymentDateModal(item.id, txDate, () => {
          onUpdate?.();
        });
      }
    };
  }
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

async function openRecurringModal(item, accounts, categories, type) {
  if (typeof item === 'string') {
    type = item;
    item = null;
  }
  if (!type) type = 'expense';

  if (!Array.isArray(accounts) || accounts.length === 0) {
    try {
      const accRes = await window.api.accounts.getAll(State.user?.id || 1);
      accounts = Array.isArray(accRes) ? accRes : [];
    } catch (e) {
      accounts = [];
    }
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    if (Array.isArray(State.categories) && State.categories.length > 0) {
      categories = State.categories;
    } else {
      try {
        const catRes = await window.api.categories.getAll(State.user?.id || 1);
        categories = Array.isArray(catRes) ? catRes : [];
      } catch (e) {
        categories = [];
      }
    }
  }

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
    <div style="margin-bottom: 14px;">
      <button type="button" class="btn btn-outline" id="rec-scan-qr" style="width: 100%; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: var(--accent-light); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px;">
        <span>📷</span> Escanear Fatura / QR Code / Pix
      </button>
    </div>
    <div id="rec-scanned-info" style="display:none; margin-bottom:12px; padding:8px 12px; border-radius:6px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); font-size:11.5px; color:#38bdf8; animation:fadeIn 0.25s ease;">
      <div id="rec-scanned-text">⚡ Dados extraídos da fatura!</div>
    </div>
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
    <!-- SEÇÃO DE JUROS E PREVISIBILIDADE CONTRATUAL -->
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">📈 Regra de Juros / Encargos (Opcional)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Para projeção de valor atualizado</span>
      </div>
      <div class="form-row" style="margin-bottom: 8px;">
        <div class="form-group" style="flex: 1.2;">
          <label style="font-size: 11px; color: var(--text-muted);">Taxa de Juros</label>
          <input type="number" step="0.001" min="0" id="rec-interest-rate" placeholder="Ex: 0.033 ou 2.0" value="${item?.interest_rate || ''}">
        </div>
        <div class="form-group" style="flex: 1.5;">
          <label style="font-size: 11px; color: var(--text-muted);">Periodicidade dos Juros</label>
          <select id="rec-interest-type" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
            <option value="daily" ${(item?.interest_type === 'daily' || !item?.interest_type) ? 'selected' : ''}>% ao Dia (ex: 0,033% a.d. mora)</option>
            <option value="monthly" ${item?.interest_type === 'monthly' ? 'selected' : ''}>% ao Mês (ex: 2,0% a.m.)</option>
            <option value="yearly" ${item?.interest_type === 'yearly' ? 'selected' : ''}>% ao Ano (ex: 15% a.a.)</option>
            <option value="installment" ${item?.interest_type === 'installment' ? 'selected' : ''}>Fixo por Parcela</option>
            <option value="contract" ${item?.interest_type === 'contract' ? 'selected' : ''}>Fixo por Contrato</option>
          </select>
        </div>
      </div>
      <div class="form-row" style="margin-bottom: 0;">
        <div class="form-group" style="flex: 1;">
          <label style="font-size: 11px; color: var(--text-muted);">Multa Fixa por Atraso (%)</label>
          <input type="number" step="0.01" min="0" id="rec-penalty-fixed-rate" placeholder="Ex: 2.0" value="${item?.penalty_fixed_rate || ''}">
        </div>
      </div>
    </div>

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

  // QR Code Scanner Integration for Recurring Items
  const recScanBtn = document.getElementById('rec-scan-qr');
  if (recScanBtn && typeof openNFCeScannerModal === 'function') {
    recScanBtn.onclick = () => {
      openNFCeScannerModal((parsed) => {
        if (!parsed) return;
        const updated = [];
        if (parsed.description && (!document.getElementById('rec-name').value || document.getElementById('rec-name').value.startsWith('Nova '))) {
          const nameEl = document.getElementById('rec-name');
          if (nameEl) { nameEl.value = parsed.description; updated.push(`Nome: "${parsed.description}"`); }
        }
        if (parsed.amount != null && parsed.amount > 0) {
          const amtEl = document.getElementById('rec-amount');
          if (amtEl) { amtEl.value = parsed.amount; updated.push(`Valor: ${fmt.currency(parsed.amount)}`); }
        }
        const targetDate = parsed.dueDate || parsed.date;
        if (targetDate) {
          const day = parseInt(targetDate.split('-')[2], 10);
          const dayEl = document.getElementById('rec-due-day');
          if (dayEl && day >= 1 && day <= 31) { dayEl.value = day; updated.push(`Dia: ${day}`); }
        }
        if (parsed.competence) {
          const compEl = document.getElementById('rec-competence-month');
          if (compEl) { compEl.value = parsed.competence; updated.push(`Competência: ${parsed.competence}`); }
        }
        if (parsed.suggestedCategory) {
          const catNameLower = parsed.suggestedCategory.toLowerCase();
          const matchCat = filteredCats.find(c => c.name.toLowerCase().includes(catNameLower) || catNameLower.includes(c.name.toLowerCase()));
          if (matchCat) {
            const catEl = document.getElementById('rec-category');
            if (catEl) { catEl.value = matchCat.id; updated.push(`Categoria: ${matchCat.name}`); }
          }
        }
        if (parsed.pixCode || parsed.notes) {
          const notesEl = document.getElementById('rec-notes');
          if (notesEl) {
            const extra = parsed.pixCode ? `PIX: ${parsed.pixCode}` : (parsed.notes || '');
            notesEl.value = (notesEl.value ? notesEl.value + ' | ' : '') + extra;
          }
        }
        const infoBox = document.getElementById('rec-scanned-info');
        const infoText = document.getElementById('rec-scanned-text');
        if (infoBox && infoText) {
          infoBox.style.display = 'block';
          infoText.innerHTML = `✅ <strong>QR Code Lido:</strong> ${updated.join(' • ')}`;
        }
        toast(`✅ Dados da fatura aplicados! (${updated.join(', ')})`, 'success');
      });
    };
  }

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
        interest_rate: parseFloat(document.getElementById('rec-interest-rate')?.value) || 0,
        interest_type: document.getElementById('rec-interest-type')?.value || 'daily',
        penalty_fixed_rate: parseFloat(document.getElementById('rec-penalty-fixed-rate')?.value) || 0,
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
  let scannedPixCode = tx.pix_code || (item && item.pix_code) || null;
  let currentNotes = tx.notes || (item && item.notes) || '';

  Modal.open(`Editar Lançamento do Mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})`, `
    <div style="margin-bottom: 14px;">
      <button type="button" class="btn btn-outline" id="mod-tx-scan-qr" style="width: 100%; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: var(--accent-light); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px;">
        <span>📷</span> Escanear Fatura / QR Code / Pix
      </button>
    </div>
    <div id="mod-tx-scanned-info" style="display: ${scannedPixCode ? 'block' : 'none'}; margin-bottom: 12px; padding: 8px 12px; border-radius: 6px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); font-size: 11.5px; color: #38bdf8; animation: fadeIn 0.25s ease;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
        <span id="mod-tx-scanned-text">${scannedPixCode ? '⚡ Chave/Código PIX vinculado à fatura' : '⚡ Dados atualizados via QR Code!'}</span>
        ${scannedPixCode ? `<span class="badge badge-cyan" style="font-size: 10px; padding: 2px 6px;">PIX Anexado</span>` : ''}
      </div>
    </div>
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

  // QR Code Scanner Integration for Monthly Transaction Edit
  const scanBtn = document.getElementById('mod-tx-scan-qr');
  if (scanBtn && typeof openNFCeScannerModal === 'function') {
    scanBtn.onclick = () => {
      openNFCeScannerModal((parsed) => {
        if (!parsed) return;
        const updatedFields = [];
        if (parsed.amount != null && parsed.amount > 0) {
          const amtEl = document.getElementById('mod-tx-amount');
          if (amtEl) {
            amtEl.value = parsed.amount;
            amtEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Valor: ${fmt.currency(parsed.amount)}`);
          }
        }
        const targetDate = parsed.dueDate || parsed.date;
        if (targetDate) {
          const dateEl = document.getElementById('mod-tx-date');
          if (dateEl) {
            dateEl.value = targetDate;
            dateEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Vencimento: ${fmt.date(targetDate)}`);
          }
        }
        const targetComp = parsed.competence || (targetDate ? targetDate.slice(0, 7) : null);
        if (targetComp) {
          const compEl = document.getElementById('mod-tx-competence');
          if (compEl) {
            compEl.value = targetComp;
            compEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Competência: ${targetComp}`);
          }
        }
        if (parsed.pixCode) {
          scannedPixCode = parsed.pixCode;
          updatedFields.push('Chave PIX');
        }
        if (parsed.notes) {
          currentNotes = (currentNotes ? currentNotes + '\n' : '') + parsed.notes;
        }

        const infoBox = document.getElementById('mod-tx-scanned-info');
        const infoText = document.getElementById('mod-tx-scanned-text');
        if (infoBox && infoText) {
          infoBox.style.display = 'block';
          infoText.innerHTML = `✅ <strong>QR Code Lido:</strong> ${updatedFields.join(' • ')}`;
        }
        toast(`✅ Fatura escaneada com sucesso! (${updatedFields.join(', ')})`, 'success');
      });
    };
  }

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
        notes: currentNotes || tx.notes,
        pix_code: scannedPixCode || tx.pix_code || null
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

async function openAvulsoModal(accounts, categories, tx = null, defaultType = 'expense', prefillData = null) {
  if (typeof accounts === 'string') {
    defaultType = accounts;
    accounts = null;
  } else if (accounts && typeof accounts === 'object' && !Array.isArray(accounts)) {
    if (accounts.accountId) {
      prefillData = prefillData || {};
      prefillData.accountId = accounts.accountId;
    }
    accounts = null;
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    try {
      const accRes = await window.api.accounts.getAll(State.user?.id || 1);
      accounts = Array.isArray(accRes) ? accRes : [];
    } catch (e) {
      accounts = [];
    }
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    if (Array.isArray(State.categories) && State.categories.length > 0) {
      categories = State.categories;
    } else {
      try {
        const catRes = await window.api.categories.getAll(State.user?.id || 1);
        categories = Array.isArray(catRes) ? catRes : [];
      } catch (e) {
        categories = [];
      }
    }
  }

  if (!Array.isArray(accounts)) accounts = [];
  if (!Array.isArray(categories)) categories = [];

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
  const accountVal = isEdit ? tx.account_id : (prefillData && prefillData.accountId ? prefillData.accountId : (accounts[0]?.id || ''));
  
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
    
    <div style="margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
      ${!isEdit ? `
        <button type="button" class="btn btn-secondary btn-sm" id="avl-btn-scan-qr" style="font-size: 11.5px; display: inline-flex; align-items: center; gap: 6px; border-color: var(--accent); color: var(--accent-light); background: rgba(16,185,129,0.08); padding: 5px 12px; border-radius: 20px; cursor: pointer;">
          <span>📷</span> Escanear Nota Fiscal / PDF
        </button>
      ` : (tx && (tx.pix_code || (tx.notes && tx.notes.includes('000201')))) ? `
        <button type="button" class="btn btn-secondary btn-sm" id="avl-btn-open-pix" style="font-size: 11.5px; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(6,182,212,0.4); color: #38bdf8; background: rgba(6,182,212,0.12); padding: 5px 12px; border-radius: 20px; cursor: pointer; font-weight: 700;">
          <span>⚡</span> Pagar com PIX (Ver QR Code)
        </button>
      ` : ''}
    </div>

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
          ${(accounts || []).map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
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

    <!-- SEÇÃO DE JUROS E PREVISIBILIDADE CONTRATUAL -->
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">📈 Regra de Juros / Encargos (Opcional)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Para projeção de valor atualizado</span>
      </div>
      <div class="form-row" style="margin-bottom: 8px;">
        <div class="form-group" style="flex: 1.2;">
          <label style="font-size: 11px; color: var(--text-muted);">Taxa de Juros</label>
          <input type="number" step="0.001" min="0" id="avl-interest-rate" placeholder="Ex: 0.033 ou 2.0" value="${tx?.interest_rate || ''}">
        </div>
        <div class="form-group" style="flex: 1.5;">
          <label style="font-size: 11px; color: var(--text-muted);">Periodicidade dos Juros</label>
          <select id="avl-interest-type" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
            <option value="daily" ${(tx?.interest_type === 'daily' || !tx?.interest_type) ? 'selected' : ''}>% ao Dia (ex: 0,033% a.d. mora)</option>
            <option value="monthly" ${tx?.interest_type === 'monthly' ? 'selected' : ''}>% ao Mês (ex: 2,0% a.m.)</option>
            <option value="yearly" ${tx?.interest_type === 'yearly' ? 'selected' : ''}>% ao Ano (ex: 15% a.a.)</option>
            <option value="installment" ${tx?.interest_type === 'installment' ? 'selected' : ''}>Fixo por Parcela</option>
            <option value="contract" ${tx?.interest_type === 'contract' ? 'selected' : ''}>Fixo por Contrato</option>
          </select>
        </div>
      </div>
      <div class="form-row" style="margin-bottom: 0;">
        <div class="form-group" style="flex: 1;">
          <label style="font-size: 11px; color: var(--text-muted);">Multa Fixa por Atraso (%)</label>
          <input type="number" step="0.01" min="0" id="avl-penalty-fixed-rate" placeholder="Ex: 2.0" value="${tx?.penalty_fixed_rate || ''}">
        </div>
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
      if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
    };
  }

  const openPixBtn = document.getElementById('avl-btn-open-pix');
  if (openPixBtn && tx) {
    openPixBtn.onclick = () => {
      Modal.close();
      if (typeof openPixPaymentModal === 'function') openPixPaymentModal(tx);
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
        competence_date,
        interest_rate: parseFloat(document.getElementById('avl-interest-rate')?.value) || 0,
        interest_type: document.getElementById('avl-interest-type')?.value || 'daily',
        penalty_fixed_rate: parseFloat(document.getElementById('avl-penalty-fixed-rate')?.value) || 0
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
 * nfce-scanner.js — Scanner de Notas Fiscais (NFC-e / SAT / Pix) via Câmera, PDF e QR Code
 * Módulo para FamilyFinancas
 * === */

function playScanBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);
    setTimeout(() => { if (ctx.state !== 'closed') ctx.close().catch(() => {}); }, 300);
  } catch (err) {}
}

function vibrateDevice(ms = 70) {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}

function loadVendorScript(src) {
  return new Promise(res => {
    const s = document.createElement('script');
    s.src = src; s.onload = () => res(true); s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}

async function ensureEnginesLoaded() {
  const tasks = [];
  if (typeof window.jsQR !== 'function') tasks.push(loadVendorScript('js/vendor/jsQR.js'));
  if (typeof window.QRCode === 'undefined') tasks.push(loadVendorScript('js/vendor/qrcode.min.js'));
  if (typeof window.pdfjsLib === 'undefined') tasks.push(loadVendorScript('js/vendor/pdf.min.js'));
  await Promise.all(tasks);
  try {
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
    }
  } catch(e) {}
}

function decodeHexAscii(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim();
  if (/^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0 && clean.length >= 4) {
    try {
      let decoded = '';
      for (let i = 0; i < clean.length; i += 2) {
        const code = parseInt(clean.substring(i, i + 2), 16);
        if (code >= 32 && code <= 126) decoded += String.fromCharCode(code); else return null;
      }
      return decoded;
    } catch (e) { return null; }
  }
  return null;
}

const KNOWN_CNPJS = [
  { root: '08467115', name: 'CEEE Equatorial Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia (NF3e)' }, { root: '02016440', name: 'RGE - Rio Grande Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia (NF3e)' }, { root: '61695227', name: 'Enel Distribuição', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04172213', name: 'Copel Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '02998611', name: 'Cemig Distribuição', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '03378521', name: 'CPFL Paulista / Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '07526557', name: 'Neoenergia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04895728', name: 'Energisa', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04423567', name: 'Light Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' },
  { root: '92802784', name: 'Corsan - Água e Saneamento', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '02429919', name: 'DMAE - Água e Esgotos', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '43776517', name: 'Sabesp', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '33352394', name: 'Cedae', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '00628286', name: 'Sanepar', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '17281106', name: 'Copasa', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' },
  { root: '02558157', name: 'Telefônica / Vivo', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '33000118', name: 'Telefônica Brasil (Vivo)', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '40432544', name: 'Claro / NET', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '04206050', name: 'TIM Brasil', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '05423963', name: 'Oi Telecomunicações', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' },
  { root: '94896792', name: 'Supermercados Rissul', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92754738', name: 'Supermercado Zaffari', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '45543915', name: 'Carrefour Supermercado', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '01545822', name: 'Supermercados Asun', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '07170938', name: 'Stok Center Atacado', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '06057223', name: 'Assaí Atacadista', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '47508411', name: 'Pão de Açúcar / Extra', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '75315333', name: 'Bistek Supermercados', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '83646984', name: 'Fort Atacadista', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '02502844', name: 'Angeloni Supermercados', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '92999999', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92999704', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92665611', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '61585865', name: 'Droga Raia / Drogasil', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '88212147', name: 'Farmácias São João', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '05493015', name: 'Farmácia Pague Menos', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '33000167', name: 'Posto Petrobras', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' }, { root: '33453598', name: 'Posto Shell', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' }, { root: '33337122', name: 'Posto Ipiranga', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '92798735', name: 'Lojas Renner', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '61099966', name: 'Lojas Riachuelo', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '45242914', name: 'Lojas C&A', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '00776574', name: 'Cassol Centerlar', cat: 'Moradia', icon: '🏠', docType: 'Cupom Fiscal (NFC-e)' }, { root: '01438784', name: 'Leroy Merlin', cat: 'Moradia', icon: '🏠', docType: 'Cupom Fiscal (NFC-e)' }, { root: '42591651', name: 'McDonald\'s', cat: 'Alimentação', icon: '🍔', docType: 'Cupom Fiscal (NFC-e)' }, { root: '13574594', name: 'Burger King', cat: 'Alimentação', icon: '🍔', docType: 'Cupom Fiscal (NFC-e)' }
];

function isInvalidMerchantName(str) {
  if (!str) return true;
  const s = str.trim().toUpperCase();
  const blackList = ['UNIDADE CONSUMIDORA', 'REFERÊNCIA', 'REFERENCIA', 'AGÊNCIA', 'AGENCIA', 'CÓDIGO', 'CODIGO', 'NOTA FISCAL', 'DANFE', 'DOCUMENTO AUXILIAR', 'EXTRATO', 'CONSUMIDOR', 'VALOR A PAGAR', 'TOTAL A PAGAR', 'FATURA DE ENERGIA', 'VIA DO CONSUMIDOR', 'EMISSÃO', 'EMISSAO', 'CHAVE DE ACESSO', 'CHAVE DE CONSULTA', 'PROTOCOLO', 'INFORMAÇÕES FISCAIS', 'ESTADO DO RIO GRANDE DO SUL', 'SECRETARIA DA FAZENDA'];
  return blackList.some(b => s.includes(b)) || s.length < 3;
}

function parsePixPayload(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (!clean.startsWith('000201') || !/br\.gov\.bcb\.pix/i.test(clean)) return null;
  const res = { isPix: true, pixCode: clean, amount: null, receiver: '', txid: '', city: '' };
  const valMatch = clean.match(/54(\d{2})([0-9.]+)/);
  if (valMatch) {
    const len = parseInt(valMatch[1], 10);
    const num = parseFloat(valMatch[2].substring(0, len));
    if (!isNaN(num) && num > 0) res.amount = num;
  }
  const nameMatch = clean.match(/59(\d{2})([^0-9]+)/);
  if (nameMatch) { res.receiver = nameMatch[2].substring(0, parseInt(nameMatch[1], 10)).trim(); }
  const cityMatch = clean.match(/60(\d{2})([^0-9]+)/);
  if (cityMatch) { res.city = cityMatch[2].substring(0, parseInt(cityMatch[1], 10)).trim(); }
  const txMatch = clean.match(/62\d{2}.*?05(\d{2})([a-zA-Z0-9]+)/);
  if (txMatch) { res.txid = txMatch[2].substring(0, parseInt(txMatch[1], 10)); }
  return res;
}

function parseSingleCode(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();

  // 1. Pix
  const pix = parsePixPayload(text);
  if (pix) {
    const today = new Date().toISOString().split('T')[0];
    return {
      type: 'expense', amount: pix.amount, date: today, competence: today.slice(0, 7),
      description: pix.receiver ? `PIX para ${pix.receiver}` : 'Pagamento PIX', suggestedCategory: 'Moradia',
      docType: 'Pagamento PIX', accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: true, isBoleto: false,
      pixCode: pix.pixCode, pixReceiver: pix.receiver, pixTxid: pix.txid,
      notes: `PIX Copia e Cola: ${pix.pixCode}`
    };
  }

  // 2. Boleto / Linha de Arrecadação de Concessionária (48 dígitos) ou Boleto Bancário (47 dígitos)
  const cleanDigits = text.replace(/[^0-9]/g, '');
  if ((cleanDigits.length === 47 || cleanDigits.length === 48) && !text.includes('http')) {
    const today = new Date().toISOString().split('T')[0];
    let amt = null;
    if (cleanDigits.length === 47) {
      const cents = parseInt(cleanDigits.slice(-10), 10);
      if (cents > 0) amt = cents / 100;
    } else if (cleanDigits.length === 48 && cleanDigits.startsWith('8')) {
      const cents = parseInt(cleanDigits.substring(4, 15), 10);
      if (cents > 0 && cents < 99999999) amt = cents / 100;
    }
    return {
      type: 'expense', amount: amt, date: today, competence: today.slice(0, 7),
      description: cleanDigits.startsWith('8') ? 'Fatura de Concessionária' : 'Pagamento de Boleto',
      suggestedCategory: 'Moradia', docType: cleanDigits.startsWith('8') ? 'Fatura / Arrecadação' : 'Boleto Bancário',
      accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: false, isBoleto: true,
      boletoCode: cleanDigits, notes: `Código de Barras: ${text}`
    };
  }

  // 3. NFC-e / NF-e / NF3e SEFAZ
  let result = {
    type: 'expense', amount: null, date: null, dueDate: null, competence: null, description: '',
    suggestedCategory: '', docType: 'Cupom Fiscal (NFC-e)', accessKey: '', cnpj: '', nNF: '', model: '',
    uf: '', rawUrl: text, isPix: false, isBoleto: false
  };

  const keyMatch = text.match(/[?&](?:p|chNFe|chNF3e|chNFCe|chave|ch)=([0-9]{44})/i) || text.match(/\b([0-9]{44})\b/);
  if (keyMatch) {
    result.accessKey = keyMatch[1];
    const ufCode = result.accessKey.substring(0, 2);
    const ufMap = {'11':'RO','12':'AC','13':'AM','14':'RR','15':'PA','16':'AP','17':'TO','21':'MA','22':'PI','23':'CE','24':'RN','25':'PB','26':'PE','27':'AL','28':'SE','29':'BA','31':'MG','32':'ES','33':'RJ','35':'SP','41':'PR','42':'SC','43':'RS','50':'MS','51':'MT','52':'GO','53':'DF'};
    result.uf = ufMap[ufCode] || 'BR';
    const aa = result.accessKey.substring(2, 4);
    const mm = result.accessKey.substring(4, 6);
    result.competence = `${parseInt(aa, 10) + 2000}-${mm.padStart(2, '0')}`;
    const rawCnpj = result.accessKey.substring(6, 20);
    result.cnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    result.model = result.accessKey.substring(20, 22);
    result.nNF = parseInt(result.accessKey.substring(25, 34), 10).toString();

    if (result.model === '66') {
      result.docType = 'Fatura de Energia (NF3e)';
      result.suggestedCategory = 'Moradia';
    } else if (result.model === '55') {
      result.docType = 'Nota Fiscal (NF-e)';
    } else if (result.model === '65') {
      result.docType = 'Cupom Fiscal (NFC-e)';
    }
  }

  // Query parameters de data
  const qDateMatch = text.match(/[?&](?:dhEmi|dEmi|data|date)=([^&|]+)/i);
  if (qDateMatch) {
    const rawD = decodeURIComponent(qDateMatch[1]).trim();
    const isoM = rawD.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoM) { result.date = `${isoM[1]}-${isoM[2]}-${isoM[3]}`; result.competence = `${isoM[1]}-${isoM[2]}`; }
    const brM = rawD.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (brM) { result.date = `${brM[3]}-${brM[2]}-${brM[1]}`; result.competence = `${brM[3]}-${brM[2]}`; }
  }

  if (text.includes('|')) {
    const pipeParts = text.split('|');
    for (let i = 1; i < pipeParts.length; i++) {
      const token = pipeParts[i].trim();
      if (!token) continue;
      if (/^\d+[.,]\d{2}$/.test(token) || (/^\d+[.,]\d+$/.test(token) && parseFloat(token.replace(',', '.')) > 0)) {
        const val = parseFloat(token.replace(',', '.'));
        if (!isNaN(val) && val > 0 && !(i <= 3 && (val === 1 || val === 2)) && !result.amount) result.amount = val;
      }
      const pIsoM = token.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (pIsoM && !result.date) { result.date = `${pIsoM[1]}-${pIsoM[2]}-${pIsoM[3]}`; result.competence = `${pIsoM[1]}-${pIsoM[2]}`; }
      const pBrM = token.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (pBrM && !result.date) { result.date = `${pBrM[3]}-${pBrM[2]}-${pBrM[1]}`; result.competence = `${pBrM[3]}-${pBrM[2]}`; }
      const decodedHex = decodeHexAscii(token);
      if (decodedHex) {
        if (/^\d+[.,]\d+$/.test(decodedHex)) {
          const valHex = parseFloat(decodedHex.replace(',', '.'));
          if (!isNaN(valHex) && valHex > 0 && !result.amount) result.amount = valHex;
        }
        const dateMatch = decodedHex.match(/(\d{4})-(\d{2})-(\d{2})/) || decodedHex.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch && !result.date) {
          result.date = dateMatch[1].length === 4 ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          result.competence = result.date.slice(0, 7);
        }
      }
    }
  }

  if (!result.amount) {
    const valMatch = text.match(/[?&](?:vTot|vNF|valor|total|amount)=([0-9.,]+)/i);
    if (valMatch) result.amount = parseFloat(valMatch[1].replace(',', '.'));
  }

  const today = new Date().toISOString().split('T')[0];
  if (!result.date) {
    result.isEstimatedDate = true;
    result.date = result.competence && result.competence !== today.slice(0, 7) ? `${result.competence}-01` : today;
    result.competence = result.competence || today.slice(0, 7);
  } else {
    result.isEstimatedDate = false;
  }

  if (result.cnpj) {
    const root = result.cnpj.replace(/[^0-9]/g, '').substring(0, 8);
    const k = KNOWN_CNPJS.find(x => x.root === root);
    if (k) {
      result.description = `${k.name}${result.nNF ? ` (#${result.nNF})` : ''}`;
      result.suggestedCategory = k.cat;
      if (k.docType) result.docType = k.docType;
    }
  }

  if (!result.description) {
    const merchants = [
      { pattern: /zaffari|bourbon/i, name: 'Supermercado Zaffari', cat: 'Alimentação' }, { pattern: /carrefour/i, name: 'Carrefour', cat: 'Alimentação' },
      { pattern: /rissul|unidasul|macromix/i, name: 'Supermercados Rissul', cat: 'Alimentação' }, { pattern: /pao.*acucar|extra|assai/i, name: 'Supermercado', cat: 'Alimentação' },
      { pattern: /panvel/i, name: 'Farmácia Panvel', cat: 'Saúde' }, { pattern: /raia|drogasil/i, name: 'Droga Raia / Drogasil', cat: 'Saúde' },
      { pattern: /sao.*joao/i, name: 'Farmácia São João', cat: 'Saúde' }, { pattern: /pague.*menos/i, name: 'Farmácia Pague Menos', cat: 'Saúde' },
      { pattern: /ipiranga/i, name: 'Posto Ipiranga', cat: 'Transporte' }, { pattern: /shell/i, name: 'Posto Shell', cat: 'Transporte' },
      { pattern: /petrobras|vibra/i, name: 'Posto Petrobras', cat: 'Transporte' }, { pattern: /mcdonald/i, name: 'McDonald\'s', cat: 'Alimentação' },
      { pattern: /burger.*king/i, name: 'Burger King', cat: 'Alimentação' }, { pattern: /renner/i, name: 'Lojas Renner', cat: 'Vestuário' },
      { pattern: /riachuelo/i, name: 'Lojas Riachuelo', cat: 'Vestuário' }
    ];
    for (const m of merchants) {
      if (m.pattern.test(text)) { result.description = `${m.name}${result.nNF ? ` (#${result.nNF})` : ''}`; result.suggestedCategory = m.cat; break; }
    }
  }

  if (!result.description) {
    result.description = result.nNF ? `Nota Fiscal #${result.nNF}` : `Nota Fiscal (${result.uf || 'SEFAZ'})`;
    result.suggestedCategory = result.model === '66' ? 'Moradia' : 'Alimentação';
  }

  if (result.accessKey) result.notes = `Chave: ${result.accessKey}`;
  return result;
}

function extractInfoFromText(fullText) {
  if (!fullText || typeof fullText !== 'string') return null;
  const res = {
    type: 'expense', amount: null, date: null, dueDate: null, competence: null,
    description: '', suggestedCategory: 'Alimentação', docType: 'Fatura / Nota Fiscal',
    accessKey: '', cnpj: '', nNF: '', model: '', pixCode: null, boletoCode: null,
    notes: '', isPix: false, isBoleto: false
  };

  // 1. Procura Código PIX Copia e Cola no texto (EMVCo 000201...)
  const pixMatch = fullText.match(/(00020126[0-9A-Za-z.=-]+)/i) || fullText.match(/(000201[0-9A-Za-z.=-]{30,})/i);
  if (pixMatch) {
    res.pixCode = pixMatch[1].trim();
    res.isPix = true;
    const p = parsePixPayload(res.pixCode);
    if (p && p.amount && !res.amount) res.amount = p.amount;
    if (p && p.receiver && (!res.description || isInvalidMerchantName(res.description))) res.description = p.receiver;
  }

  // 2. Chave de Acesso NF (44 dígitos)
  const keyRawMatch = fullText.match(/\b(\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4})\b/) || fullText.match(/([0-9]{44})/);
  if (keyRawMatch) {
    const cleanKey = (keyRawMatch[1] || keyRawMatch[0]).replace(/[^0-9]/g, '');
    if (cleanKey.length === 44) {
      res.accessKey = cleanKey;
      res.cnpj = cleanKey.substring(6, 20).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      res.model = cleanKey.substring(20, 22);
      res.nNF = parseInt(cleanKey.substring(25, 34), 10).toString();
      res.competence = `${parseInt(cleanKey.substring(2, 4), 10) + 2000}-${cleanKey.substring(4, 6)}`;
      if (res.model === '66') { res.docType = 'Fatura de Energia (NF3e)'; res.suggestedCategory = 'Moradia'; }
      else if (res.model === '55') { res.docType = 'Nota Fiscal (NF-e)'; }
      else if (res.model === '65') { res.docType = 'Cupom Fiscal (NFC-e)'; }
    }
  }

  // 3. Código de Arrecadação Concessionária (48 dig) ou Boleto Bancário (47 dig)
  const barcodeBoleto = fullText.match(/\b(\d{5}[.\s]?\d{5}\s+\d{5}[.\s]?\d{6}\s+\d{5}[.\s]?\d{6}\s+\d\s+\d{14})\b/);
  const barcodeConcessionaria = fullText.match(/\b(8\d{10}[-\s]?\d\s*\d{11}[-\s]?\d\s*\d{11}[-\s]?\d\s*\d{11}[-\s]?\d)\b/) || fullText.match(/\b(8\d{47})\b/);
  if (barcodeBoleto) {
    res.boletoCode = barcodeBoleto[0].replace(/[^0-9]/g, '');
    res.isBoleto = true; res.docType = 'Boleto Bancário'; res.suggestedCategory = 'Moradia';
  } else if (barcodeConcessionaria) {
    res.boletoCode = barcodeConcessionaria[0].replace(/[^0-9]/g, '');
    res.isBoleto = true; res.docType = 'Fatura de Concessionária'; res.suggestedCategory = 'Moradia';
  }

  if (!res.cnpj) {
    const cnpjMatch = fullText.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/);
    if (cnpjMatch) res.cnpj = cnpjMatch[1];
  }

  if (res.cnpj) {
    const root = res.cnpj.replace(/[^0-9]/g, '').substring(0, 8);
    const k = KNOWN_CNPJS.find(x => x.root === root);
    if (k) {
      res.description = k.name; res.suggestedCategory = k.cat;
      if (k.docType) res.docType = k.docType;
    }
  }

  if (!res.description || isInvalidMerchantName(res.description)) {
    if (/COMPANHIA ESTADUAL DE DISTRIBUI[ÇC][AÃ]O|CEEE/i.test(fullText)) {
      res.description = 'CEEE Equatorial Energia'; res.suggestedCategory = 'Moradia'; res.docType = 'Fatura de Energia (NF3e)';
    } else if (/RGE SUL|RIO GRANDE ENERGIA/i.test(fullText)) {
      res.description = 'RGE - Rio Grande Energia'; res.suggestedCategory = 'Moradia'; res.docType = 'Fatura de Energia (NF3e)';
    } else if (/CORSAN|COMPANHIA RIOGRANDENSE DE SANEAMENTO/i.test(fullText)) {
      res.description = 'Corsan - Água e Saneamento'; res.suggestedCategory = 'Moradia'; res.docType = 'Fatura de Água';
    } else if (/DMAE/i.test(fullText)) {
      res.description = 'DMAE - Água e Esgotos'; res.suggestedCategory = 'Moradia'; res.docType = 'Fatura de Água';
    }
  }

  const dueMatch = fullText.match(/(?:data\s+de\s+vencimento|data\s+vencimento|vencimento|venc|vence\s+em|pagar\s+at[eé]|validade|data\s+limite)\s*[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i) ||
                   fullText.match(/VENCIMENTO[\s\S]{1,80}?\b(\d{2}[./-]\d{2}[./-]\d{4})\b/i) ||
                   fullText.match(/R\$\s*[\d.,]+\s+(\d{2}[./-]\d{2}[./-]\d{4})/i) ||
                   fullText.match(/(\d{2}[./-]\d{2}[./-]\d{4})\s+\d{1,3}\.\d{3}\.\d{3}\.\d{3}/) ||
                   fullText.match(/(\d{2}[./-]\d{2}[./-]\d{4})\s*(?:data\s+de\s+vencimento|vencimento|venc)/i);
  if (dueMatch) {
    const parts = dueMatch[1].replace(/[./]/g, '-').split('-');
    res.dueDate = parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
    res.date = res.dueDate;
  }

  const compMatch = fullText.match(/(?:m[eê]s\/ano|refer[eê]ncia|ref\.?|compet[eê]ncia)\s*[:\s]*(\d{2}\/\d{4})/i) ||
                    fullText.match(/(\d{2}\/\d{4})\s*(?:refer[eê]ncia|m[eê]s\/ano)/i) ||
                    fullText.match(/(?<!\d[\/-])(0[1-9]|1[0-2])\/(20\d{2})\b/);
  if (compMatch) {
    if (compMatch[1] && compMatch[2]) res.competence = `${compMatch[2]}-${compMatch[1].padStart(2, '0')}`;
    else { const [mm, yyyy] = compMatch[1].split('/'); res.competence = `${yyyy}-${mm.padStart(2, '0')}`; }
  } else if (res.dueDate && !res.competence) {
    res.competence = res.dueDate.slice(0, 7);
  }

  if (!res.date) {
    const emiMatch = fullText.match(/(?:emiss[aã]o|data\s+da\s+emiss[aã]o|emitido\s+em|data\s+de\s+emiss[aã]o)\s*[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i) || fullText.match(/(?:emiss[aã]o)\s*[:\s]*(\d{4}[./-]\d{2}[./-]\d{2})/i);
    if (emiMatch) {
      const parts = emiMatch[1].replace(/[./]/g, '-').split('-');
      res.date = parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
      if (!res.competence) res.competence = res.date.slice(0, 7);
    }
  }

  if (!res.amount) {
    const valMatch = fullText.match(/(?:total\s+a\s+pagar|valor\s+a\s+pagar|valor\s+total|total\s+da\s+fatura|total\s+fatura|valor\s+do\s+documento|valor\s+cobrado|valor\s+l[ií]quido|total\s+da\s+nota|total\s+nota|total\s+geral|valor\s+fatura)\s*[:\s]*R?\$?\s*([\d.]+,\d{2})/i) ||
                     fullText.match(/R\$\s*([\d.]+,\d{2})\s*(?:total\s+a\s+pagar|vencimento|\d{2}[./-]\d{2})/i) ||
                     fullText.match(/R\$\s*([\d.]+,\d{2})/i);
    if (valMatch) {
      const parsedAmt = parseFloat(valMatch[1].replace(/\./g, '').replace(',', '.'));
      if (!isNaN(parsedAmt) && parsedAmt > 0) res.amount = parsedAmt;
    }
  }

  const ucMatch = fullText.match(/(?:unidade\s+consumidora|c[oó]digo\s+do\s+cliente|uc)\s*[:\s]*(\d{1,3}(?:\.\d{3})+(?:-\d+)?|\d{5,15})/i) || fullText.match(/(\d{1,3}\.\d{3}\.\d{3}\.\d{3}-\d{2})/);
  if (ucMatch) res.consumerUnit = ucMatch[1];

  if (!res.description || isInvalidMerchantName(res.description)) {
    const merchantMatch = fullText.match(/(?:benefici[aá]rio|raz[aã]o\s+social|nome\s+empresarial|cedente|prestador|emitente|estabelecimento)\s*[:\s]*([^\n\r,;]{3,50})/i);
    if (merchantMatch && !isInvalidMerchantName(merchantMatch[1])) res.description = merchantMatch[1].trim();
  }

  if (!res.description || isInvalidMerchantName(res.description)) {
    if (res.model === '66') res.description = 'Conta de Energia Elétrica';
    else if (res.isBoleto) res.description = 'Fatura / Boleto';
    else if (res.nNF) res.description = `Nota Fiscal #${res.nNF}`;
    else res.description = 'Despesa / Fatura';
  }
  return res;
}

function mergeScanResults(codes, textData = null) {
  const visualList = codes && codes.length ? [...new Set(codes.map(c => c.trim()).filter(Boolean))] : [];
  let baseObj = null;

  if (visualList.length > 0) {
    let nfceObj = null;
    let pixObj = null;

    for (const c of visualList) {
      const p = parseSingleCode(c);
      if (!p) continue;
      if (p.isPix) pixObj = p;
      else if (p.accessKey || p.rawUrl.includes('sefaz') || p.rawUrl.includes('nfce') || p.rawUrl.includes('nfe')) nfceObj = p;
    }

    if (nfceObj && pixObj) {
      baseObj = {
        ...nfceObj,
        isPix: true,
        pixCode: pixObj.pixCode,
        pixReceiver: pixObj.pixReceiver,
        pixTxid: pixObj.pixTxid
      };
      if (!baseObj.amount && pixObj.amount) baseObj.amount = pixObj.amount;
      if (pixObj.pixReceiver && (!baseObj.description || isInvalidMerchantName(baseObj.description) || baseObj.description.startsWith('Compra Cupom'))) {
        baseObj.description = `${pixObj.pixReceiver}${baseObj.nNF ? ` (#${baseObj.nNF})` : ''}`;
      }
    } else {
      baseObj = nfceObj || pixObj || parseSingleCode(visualList[0]);
    }
  }

  if (!baseObj && textData) {
    baseObj = textData;
  } else if (baseObj && textData) {
    if (textData.dueDate) {
      baseObj.dueDate = textData.dueDate;
      baseObj.date = textData.dueDate;
      if (!baseObj.competence) baseObj.competence = textData.competence || textData.dueDate.slice(0, 7);
    } else if (textData.date && !baseObj.date) {
      baseObj.date = textData.date;
      if (!baseObj.competence) baseObj.competence = textData.competence || textData.date.slice(0, 7);
    }
    if (textData.competence) baseObj.competence = textData.competence;
    if (textData.amount && (!baseObj.amount || baseObj.amount <= 0)) baseObj.amount = textData.amount;
    if (textData.pixCode && !baseObj.pixCode) { baseObj.pixCode = textData.pixCode; baseObj.isPix = true; }
    if (textData.boletoCode && !baseObj.boletoCode) { baseObj.boletoCode = textData.boletoCode; baseObj.isBoleto = true; }
    if (textData.accessKey && !baseObj.accessKey) {
      baseObj.accessKey = textData.accessKey; baseObj.cnpj = textData.cnpj; baseObj.nNF = textData.nNF; baseObj.model = textData.model;
      if (!baseObj.competence) baseObj.competence = textData.competence;
    }
    if (textData.docType && (!baseObj.docType || baseObj.docType === 'Cupom Fiscal (NFC-e)')) baseObj.docType = textData.docType;
    if (textData.description && (!baseObj.description || isInvalidMerchantName(baseObj.description) || baseObj.description.startsWith('Compra Cupom'))) baseObj.description = textData.description;
  }
  if (!baseObj) return null;

  if (baseObj.cnpj) {
    const k = KNOWN_CNPJS.find(x => x.root === baseObj.cnpj.replace(/[^0-9]/g, '').substring(0, 8));
    if (k) {
      baseObj.description = `${k.name}${baseObj.nNF ? ` (#${baseObj.nNF})` : ''}`;
      baseObj.suggestedCategory = k.cat;
      if (k.docType) baseObj.docType = k.docType;
    }
  }

  if (baseObj.model === '66' || (baseObj.accessKey && baseObj.accessKey.substring(20, 22) === '66')) {
    baseObj.suggestedCategory = 'Moradia'; baseObj.docType = 'Fatura de Energia (NF3e)';
    if (!baseObj.description || isInvalidMerchantName(baseObj.description)) baseObj.description = 'Conta de Energia Elétrica';
  }

  const today = new Date().toISOString().split('T')[0];
  if (!baseObj.date) {
    baseObj.date = baseObj.dueDate || (baseObj.competence && baseObj.competence !== today.slice(0, 7) ? `${baseObj.competence}-01` : today);
    baseObj.competence = baseObj.competence || today.slice(0, 7);
  }
  if (!baseObj.description || isInvalidMerchantName(baseObj.description)) {
    baseObj.description = baseObj.nNF ? `Nota Fiscal #${baseObj.nNF}` : (baseObj.isPix ? 'Pagamento PIX' : 'Despesa / Fatura');
  }

  const notesParts = [];
  if (baseObj.accessKey) notesParts.push(`Chave NF: ${baseObj.accessKey}`);
  if (baseObj.pixCode) notesParts.push(`PIX Copia e Cola: ${baseObj.pixCode}`);
  if (baseObj.boletoCode) notesParts.push(`Linha Digitável: ${baseObj.boletoCode}`);
  baseObj.notes = notesParts.join('\n');
  return baseObj;
}

function parseNFCeUrl(raw) { return parseSingleCode(raw); }

const NFCeCameraManager = {
  videoElement: null, stream: null, track: null, scanIntervalId: null, isScanning: false, currentFacingMode: 'environment', isTorchOn: false, barcodeDetector: null,

  async initEngines() {
    await ensureEnginesLoaded();
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) this.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'itf'] });
      } catch (e) {}
    }
  },

  async start(videoEl, onResultCallback, onErrorCallback) {
    this.videoElement = videoEl; this.isScanning = true;
    await this.initEngines();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Câmera não suportada.');
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: this.currentFacingMode }, width: { min: 640, ideal: 1280 }, height: { min: 480, ideal: 720 } }, audio: false });
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      this.track = this.stream.getVideoTracks()[0];
      this.startScanLoop(onResultCallback);
    } catch (err) {
      this.isScanning = false;
      if (onErrorCallback) onErrorCallback(err);
    }
  },

  startScanLoop(onResultCallback) {
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scanFrame = async () => {
      if (!this.isScanning || !this.videoElement || this.videoElement.readyState < 2) {
        if (this.isScanning) this.scanIntervalId = requestAnimationFrame(scanFrame);
        return;
      }
      const video = this.videoElement, vw = video.videoWidth || 640, vh = video.videoHeight || 480;
      if (this.barcodeDetector) {
        try {
          const barcodes = await this.barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawTexts = barcodes.map(b => b.rawValue).filter(Boolean);
            if (rawTexts.length) { this.handleDetectedCodes(rawTexts, onResultCallback); return; }
          }
        } catch (e) {}
      }

      if (typeof window.jsQR === 'function') {
        try {
          const maxDim = 800;
          let targetW = vw, targetH = vh;
          if (targetW > maxDim) { targetH = Math.round((vh * maxDim) / targetW); targetW = maxDim; }
          canvas.width = targetW; canvas.height = targetH;
          ctx.drawImage(video, 0, 0, targetW, targetH);
          let code = window.jsQR(ctx.getImageData(0, 0, targetW, targetH).data, targetW, targetH, { inversionAttempts: 'dontInvert' });
          if (!code) {
            const cropW = Math.round(targetW * 0.65), cropH = Math.round(targetH * 0.65);
            code = window.jsQR(ctx.getImageData(Math.round((targetW - cropW) / 2), Math.round((targetH - cropH) / 2), cropW, cropH).data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
          }
          if (code && code.data) { this.handleDetectedCodes([code.data], onResultCallback); return; }
        } catch (err) {}
      }
      if (this.isScanning) this.scanIntervalId = setTimeout(() => requestAnimationFrame(scanFrame), 80);
    };
    requestAnimationFrame(scanFrame);
  },

  handleDetectedCodes(rawList, onResultCallback) {
    if (!this.isScanning) return;
    this.isScanning = false;
    playScanBeep(); vibrateDevice(80);
    const parsed = mergeScanResults(rawList, null);
    this.stop();
    if (onResultCallback) onResultCallback(parsed);
  },

  async scanPdfPageMasks(page) {
    const codes = new Set();
    try {
      const opList = await page.getOperatorList(), maskPromises = [];
      for (let i = 0; i < opList.fnArray.length; i++) {
        const args = opList.argsArray[i];
        if (!args || !args.length) continue;
        const objId = typeof args[0] === 'string' ? args[0] : (args[0] && typeof args[0] === 'object' ? args[0].data : null);
        if (objId && typeof objId === 'string' && (objId.startsWith('mask_') || objId.startsWith('img_'))) {
          maskPromises.push(new Promise((resolve) => {
            page.objs.get(objId, (obj) => {
              if (obj && obj.data && obj.width > 50 && obj.height > 50 && typeof window.jsQR === 'function') {
                const { width, height, data } = obj, rgba = new Uint8ClampedArray(width * height * 4);
                if (data.length === width * height) {
                  for (let p = 0, q = 0; p < data.length; p++, q += 4) { const v = data[p]; rgba[q] = v; rgba[q+1] = v; rgba[q+2] = v; rgba[q+3] = 255; }
                } else if (data.length === Math.ceil(width / 8) * height || data.length === Math.ceil((width * height) / 8)) {
                  const rb = Math.ceil(width / 8);
                  for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                      const v = ((data[y * rb + Math.floor(x / 8)] >> (7 - (x % 8))) & 1) ? 0 : 255, q = (y * width + x) * 4;
                      rgba[q] = v; rgba[q+1] = v; rgba[q+2] = v; rgba[q+3] = 255;
                    }
                  }
                }
                const qr = window.jsQR(rgba, width, height, { inversionAttempts: 'attemptBoth' });
                if (qr && qr.data) codes.add(qr.data);
              }
              resolve();
            });
          }));
        }
      }
      await Promise.all(maskPromises);
    } catch(e) {}
    return Array.from(codes);
  },

  async scanCanvasMultiQR(canvas) {
    const detected = new Set();
    if (this.barcodeDetector) {
      try {
        const barcodes = await this.barcodeDetector.detect(canvas);
        if (barcodes) barcodes.forEach(b => { if (b.rawValue) detected.add(b.rawValue); });
      } catch(e) {}
    }
    if (typeof window.jsQR === 'function') {
      const ctx = canvas.getContext('2d', { willReadFrequently: true }), w = canvas.width, h = canvas.height;
      const slices = [{ x: 0, y: 0, w, h }, { x: 0, y: Math.round(h * 0.6), w: Math.round(w * 0.55), h: Math.round(h * 0.4) }, { x: Math.round(w * 0.45), y: Math.round(h * 0.6), w: Math.round(w * 0.55), h: Math.round(h * 0.4) }, { x: Math.round(w * 0.2), y: Math.round(h * 0.6), w: Math.round(w * 0.6), h: Math.round(h * 0.4) }, { x: 0, y: Math.round(h * 0.7), w, h: Math.round(h * 0.3) }];
      for (const s of slices) {
        try {
          const qr = window.jsQR(ctx.getImageData(s.x, s.y, s.w, s.h).data, s.w, s.h, { inversionAttempts: 'attemptBoth' });
          if (qr && qr.data) detected.add(qr.data);
        } catch(e) {}
      }
    }
    return Array.from(detected);
  },

  async scanFile(file, onResultCallback) {
    await this.initEngines();
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (!window.pdfjsLib) throw new Error('Leitor de PDF não inicializado.');
        toast('Lendo páginas e dados fiscais do PDF...', 'info');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise, allCodes = [];
        let fullPdfText = '';
        for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 4); pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          try { const tc = await page.getTextContent(); fullPdfText += ' ' + tc.items.map(it => it.str).join(' '); } catch(e) {}
          const maskCodes = await this.scanPdfPageMasks(page);
          maskCodes.forEach(c => allCodes.push(c));
          const vp = page.getViewport({ scale: 2.0 }), canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d', { willReadFrequently: true }), viewport: vp }).promise;
          const pageCodes = await this.scanCanvasMultiQR(canvas);
          pageCodes.forEach(c => allCodes.push(c));
        }
        const textExtracted = extractInfoFromText(fullPdfText);
        const mergedResult = mergeScanResults(allCodes, textExtracted);
        if (mergedResult && (mergedResult.accessKey || mergedResult.pixCode || mergedResult.amount || mergedResult.dueDate || mergedResult.nNF || (mergedResult.description && !mergedResult.description.startsWith('Compra Cupom')))) {
          this.isScanning = false; playScanBeep(); vibrateDevice(80); this.stop();
          if (onResultCallback) onResultCallback(mergedResult);
        } else { toast('Nenhum dado fiscal ou QR Code legível foi identificado neste PDF.', 'warning'); }
        return;
      }

      const img = new Image(), objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = objectUrl; });
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
      let allFoundCodes = [];
      for (const maxDim of [2000, 1400, 900]) {
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) { if (w >= h) { h = Math.round((h * maxDim) / w); w = maxDim; } else { w = Math.round((w * maxDim) / h); h = maxDim; } }
        canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
        const codes = await this.scanCanvasMultiQR(canvas);
        if (codes.length) { allFoundCodes = codes; break; }
      }
      URL.revokeObjectURL(objectUrl);
      if (allFoundCodes.length) this.handleDetectedCodes(allFoundCodes, onResultCallback);
      else toast('Nenhum QR Code legível encontrado nesta imagem.', 'warning');
    } catch (err) { console.error(err); toast('Erro ao processar arquivo da nota: ' + err.message, 'error'); }
  },

  async toggleTorch() {
    if (!this.track) return false;
    try {
      const cap = this.track.getCapabilities ? this.track.getCapabilities() : {};
      if (cap.torch) {
        this.isTorchOn = !this.isTorchOn;
        await this.track.applyConstraints({ advanced: [{ torch: this.isTorchOn }] });
        return this.isTorchOn;
      }
    } catch (e) {}
    return false;
  },

  async switchCamera(onResultCallback, onErrorCallback) {
    this.stop();
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    await this.start(this.videoElement, onResultCallback, onErrorCallback);
  },

  stop() {
    this.isScanning = false;
    if (this.scanIntervalId) { clearTimeout(this.scanIntervalId); cancelAnimationFrame(this.scanIntervalId); this.scanIntervalId = null; }
    if (this.stream) {
      this.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
      this.stream = null; this.track = null;
    }
    if (this.videoElement) this.videoElement.srcObject = null;
  }
};

function openNFCeScannerModal(customCallback = null) {
  const oldModal = document.getElementById('nfce-scanner-modal-wrap');
  if (oldModal) oldModal.remove();

  const modalWrap = document.createElement('div');
  modalWrap.id = 'nfce-scanner-modal-wrap';
  modalWrap.className = 'scanner-modal-backdrop';
  modalWrap.innerHTML = `
    <div class="scanner-modal-card">
      <div class="scanner-modal-header"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">📷</span><span style="font-weight:700;font-size:15px;color:var(--text-primary)">Leitor de Nota Fiscal (QR Code & PDF)</span></div><button class="scanner-close-btn" id="scanner-btn-close" title="Fechar">✕</button></div>
      <div class="scanner-viewport-container">
        <video id="nfce-scanner-video" class="scanner-video-feed" playsinline muted autoplay></video>
        <div class="scanner-hud-overlay"><div class="scanner-viewfinder"><div class="viewfinder-corner tl"></div><div class="viewfinder-corner tr"></div><div class="viewfinder-corner bl"></div><div class="viewfinder-corner br"></div><div class="scanner-laser-line"></div></div></div>
        <div class="scanner-live-badge"><span class="scanner-pulse-dot"></span> Câmera Ao Vivo</div>
        <div id="scanner-error-fallback" class="scanner-error-overlay" style="display:none">
          <div style="font-size:36px;margin-bottom:8px">⚠️</div><div style="font-weight:600;font-size:14px;margin-bottom:6px" id="scanner-error-msg">Não foi possível acessar a câmera</div>
          <div style="font-size:12px;color:var(--text-muted);max-width:260px;margin-bottom:12px">Você pode carregar uma foto ou arquivo PDF da nota fiscal abaixo.</div>
          <label class="btn btn-primary btn-sm" style="cursor:pointer">📁 Carregar Foto / PDF<input type="file" id="scanner-file-fallback" accept="image/*,application/pdf" style="display:none"></label>
        </div>
      </div>
      <div class="scanner-controls-bar">
        <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:10px">Aponte para o <strong>QR Code da NFC-e ou PIX</strong> ou importe a nota</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" id="scanner-btn-switch-cam"><span>🔄</span> Trocar Câmera</button>
          <button class="btn btn-secondary btn-sm" id="scanner-btn-torch"><span>💡</span> Lanterna</button>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0"><span>📁</span> Foto / PDF da Nota<input type="file" id="scanner-file-input" accept="image/*,application/pdf" style="display:none"></label>
        </div>
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
          <div style="display:flex;gap:6px">
            <input type="text" id="scanner-manual-input" placeholder="Cole o link da SEFAZ, chave de 44 dígitos ou código PIX..." style="font-size:11.5px;padding:6px 10px;flex:1;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface)">
            <button class="btn btn-primary btn-sm" id="scanner-btn-apply-manual">Processar</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalWrap);

  const videoEl = document.getElementById('nfce-scanner-video');
  const errorOverlay = document.getElementById('scanner-error-fallback');
  const errorMsg = document.getElementById('scanner-error-msg');
  const handleSuccess = (parsedData) => { NFCeCameraManager.stop(); modalWrap.remove(); handleNFCeScanResult(parsedData, customCallback); };
  const handleError = (err) => {
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') errorMsg.innerText = 'Permissão de câmera negada';
      else if (err.name === 'NotFoundError') errorMsg.innerText = 'Nenhuma câmera detectada';
    }
  };
  const closeScannerModal = () => { NFCeCameraManager.stop(); modalWrap.remove(); };
  document.getElementById('scanner-btn-close').onclick = closeScannerModal;
  modalWrap.onclick = (e) => { if (e.target === modalWrap) closeScannerModal(); };
  document.getElementById('scanner-btn-switch-cam').onclick = () => NFCeCameraManager.switchCamera(handleSuccess, handleError);
  document.getElementById('scanner-btn-torch').onclick = async () => {
    const isLit = await NFCeCameraManager.toggleTorch();
    const btn = document.getElementById('scanner-btn-torch');
    if (btn) { btn.style.borderColor = isLit ? 'var(--accent)' : 'var(--border)'; btn.style.color = isLit ? 'var(--accent-light)' : 'var(--text-primary)'; }
  };

  const fileInput = document.getElementById('scanner-file-input');
  fileInput.onchange = (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); };
  const fileFallback = document.getElementById('scanner-file-fallback');
  if (fileFallback) fileFallback.onchange = (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); };

  const applyManual = () => {
    const val = document.getElementById('scanner-manual-input').value.trim();
    if (!val) { toast('Digite ou cole a chave ou código Pix da nota.', 'warning'); return; }
    handleSuccess(parseSingleCode(val));
  };
  document.getElementById('scanner-btn-apply-manual').onclick = applyManual;
  document.getElementById('scanner-manual-input').onkeydown = (e) => { if (e.key === 'Enter') applyManual(); };

  NFCeCameraManager.start(videoEl, handleSuccess, handleError);
}

function openNfceScannerModal(customCallback = null) {
  return openNFCeScannerModal(customCallback);
}


function openNFCeConfirmationModal(parsedData, accounts, categories) {
  const today = new Date().toISOString().split('T')[0];
  const dateVal = parsedData.date || parsedData.dueDate || today;
  const competenceVal = parsedData.competence || (dateVal ? dateVal.slice(0, 7) : today.slice(0, 7));
  const amountVal = parsedData.amount != null ? parsedData.amount : '';
  const descVal = parsedData.description || 'Despesa / Fatura';
  let matchedCatId = '';
  if (parsedData.suggestedCategory) {
    const term = parsedData.suggestedCategory.toLowerCase();
    const matchedCat = categories.find(c => {
      const cn = c.name.toLowerCase();
      return cn.includes(term) || term.includes(cn) || (term === 'moradia' && (cn.includes('casa') || cn.includes('contas') || cn.includes('fixas') || cn.includes('luz') || cn.includes('energia') || cn.includes('habita')));
    });
    if (matchedCat) matchedCatId = matchedCat.id;
  }
  const isPendingBill = Boolean(parsedData.dueDate || parsedData.pixCode || parsedData.boletoCode || parsedData.model === '66');

  Modal.open('📋 Conferência da Nota Fiscal / Fatura', `
    <div class="nfce-confirm-container" style="display:flex;flex-direction:column;gap:14px">
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.06));border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius);padding:14px 16px;text-align:center;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.15)">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
          <span style="font-size:20px">🧾</span>
          <span style="font-size:15px;font-weight:800;color:var(--text-primary)" id="nfce-preview-desc">${descVal}</span>
          ${parsedData.docType ? `<span class="badge badge-purple" style="font-size:10px;padding:2px 6px">${parsedData.docType}</span>` : ''}
          ${parsedData.uf ? `<span class="badge badge-blue" style="font-size:10px;padding:2px 6px">${parsedData.uf}</span>` : ''}
        </div>
        <div style="font-size:32px;font-weight:900;color:${amountVal !== '' ? 'var(--accent-light)' : '#fbbf24'};letter-spacing:-0.02em;margin:4px 0" id="nfce-preview-amount-display">
          ${amountVal !== '' ? fmt.currency(amountVal) : 'R$ 0,00'}
        </div>
        <div style="font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">
          <span>📅 ${parsedData.dueDate ? 'Vencimento' : 'Data'}: <strong id="nfce-preview-date" style="color:${parsedData.dueDate ? '#60a5fa' : 'inherit'}">${fmt.date(dateVal)}</strong></span>
          ${parsedData.competence ? `<span>🗓️ Competência: <strong>${parsedData.competence}</strong></span>` : ''}
          ${parsedData.nNF ? `<span>🔢 Nº: <strong>#${parsedData.nNF}</strong></span>` : ''}
          ${parsedData.cnpj ? `<span>🏢 CNPJ: <strong>${parsedData.cnpj}</strong></span>` : ''}
          ${parsedData.consumerUnit ? `<span>💡 UC: <strong>${parsedData.consumerUnit}</strong></span>` : ''}
        </div>
        ${parsedData.accessKey ? `<div style="margin-top:8px;font-size:10px;color:var(--text-muted);background:rgba(0,0,0,0.25);padding:3px 6px;border-radius:6px;word-break:break-all">🔑 Chave: <code>${parsedData.accessKey}</code></div>` : ''}
      </div>

      ${parsedData.pixCode ? `
        <div style="background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(16,185,129,0.08));border:1px solid rgba(6,182,212,0.35);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px"><span style="font-size:18px">⚡</span><strong style="font-size:12px;color:#38bdf8">Pagar com PIX (QR Code & Copia e Cola)</strong></div>
            <div style="display:flex;gap:6px">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-conf-copy-pix" style="font-size:11px;padding:3px 8px">📋 Copiar PIX</button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-conf-view-pix" style="font-size:11px;padding:3px 8px;background:#0284c7;border:none">📱 Ver QR Code</button>
            </div>
          </div>
          <code style="font-size:10px;color:var(--text-muted);word-break:break-all;background:rgba(0,0,0,0.25);padding:4px 6px;border-radius:4px;max-height:42px;overflow-y:auto;display:block">${parsedData.pixCode}</code>
        </div>
        <div id="conf-pix-preview-box" style="display:none;background:rgba(0,0,0,0.3);border-radius:8px;padding:10px;text-align:center">
          <img id="conf-pix-img" style="width:160px;height:160px;background:white;padding:6px;border-radius:8px;margin:0 auto;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.2)">
        </div>
      ` : `
        <div style="background:rgba(255,255,255,0.03);border:1px dashed var(--border);border-radius:8px;padding:8px 12px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px"><span>⚡</span> <span>Deseja pagar via PIX?</span></div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-conf-add-pix-prompt" style="font-size:11px;padding:3px 8px"><span>⚡</span> Adicionar PIX</button>
          </div>
          <div id="conf-add-pix-container" style="display:none;margin-top:8px">
            <div style="display:flex;gap:6px">
              <input type="text" id="conf-input-custom-pix" placeholder="Cole o código PIX Copia e Cola (00020126...)..." style="flex:1;font-size:12px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary)">
              <button type="button" class="btn btn-primary btn-sm" id="btn-conf-save-custom-pix" style="font-size:11px;background:#0284c7;border:none;font-weight:700">Salvar PIX</button>
            </div>
            <div id="conf-custom-pix-preview" style="display:none;text-align:center;margin-top:8px">
              <img id="conf-custom-pix-img" style="width:150px;height:150px;background:white;padding:6px;border-radius:8px;margin:0 auto;display:block">
            </div>
          </div>
        </div>
      `}

      ${parsedData.boletoCode ? `
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px">📄</span><code style="font-size:10.5px;color:var(--text-muted);word-break:break-all">${parsedData.boletoCode}</code></div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-conf-copy-barcode" style="font-size:11px;padding:3px 8px">📋 Copiar Código</button>
        </div>
      ` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Descrição</label><input type="text" id="nfce-conf-desc" value="${descVal}" style="font-size:12.5px;font-weight:600"></div>
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Valor (R$)</label><input type="number" step="0.01" min="0" id="nfce-conf-amount" placeholder="0,00" value="${amountVal}" style="font-size:12.5px;font-weight:700;color:var(--accent-light)"></div>
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Conta / Cartão</label><select id="nfce-conf-account" style="font-size:12.5px">${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}</select></div>
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Categoria</label><select id="nfce-conf-category" style="font-size:12.5px"><option value="">Sem categoria</option>${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `<option value="${c.id}" ${String(c.id) === String(matchedCatId) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}</select></div>
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">${parsedData.dueDate ? 'Vencimento' : 'Data'}</label><input type="date" id="nfce-conf-date" value="${dateVal}" style="font-size:12.5px"></div>
        <div class="form-group" style="margin:0"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Competência</label><input type="month" id="nfce-conf-competence" value="${competenceVal}" style="font-size:12.5px"></div>
      </div>
      <div class="form-group" style="margin:2px 0 0 0">
        <label style="font-size:12px;display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="nfce-conf-paid" ${isPendingBill ? '' : 'checked'}> Já foi pago / debitado da conta</label>
      </div>

      <div style="padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-secondary" id="nfce-conf-btn-reject" style="color:#f87171;border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);font-weight:600;padding:8px 16px;border-radius:8px;display:flex;align-items:center;gap:6px"><span>✕</span> Não Aceitar</button>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-secondary" id="nfce-conf-btn-more-options" style="font-weight:600;padding:8px 14px;border-radius:8px;display:flex;align-items:center;gap:6px" title="Abrir no formulário completo com todas as opções"><span>✏️</span> Mais Opções</button>
          <button type="button" class="btn btn-primary" id="nfce-conf-btn-accept" style="font-weight:700;padding:8px 20px;border-radius:8px;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#10b981,#059669);border:none;box-shadow:0 4px 14px rgba(16,185,129,0.3)"><span>✓</span> Aceitar e Criar Lançamento</button>
        </div>
      </div>
    </div>
  `);

  const amountInput = document.getElementById('nfce-conf-amount');
  const descInput = document.getElementById('nfce-conf-desc');
  const previewAmount = document.getElementById('nfce-preview-amount-display');
  const previewDesc = document.getElementById('nfce-preview-desc');
  const dateInput = document.getElementById('nfce-conf-date');
  const previewDate = document.getElementById('nfce-preview-date');

  if (amountInput && previewAmount) {
    amountInput.oninput = () => {
      const val = parseFloat(amountInput.value);
      previewAmount.innerText = (!isNaN(val) && val > 0) ? fmt.currency(val) : 'R$ 0,00';
      previewAmount.style.color = (!isNaN(val) && val > 0) ? 'var(--accent-light)' : '#fbbf24';
    };
    if (amountVal === '' || amountVal === 0) setTimeout(() => { try { amountInput.focus(); } catch (e) {} }, 100);
  }
  if (descInput && previewDesc) descInput.oninput = () => { previewDesc.innerText = descInput.value.trim() || 'Despesa / Fatura'; };
  if (dateInput && previewDate) {
    dateInput.onchange = () => {
      if (dateInput.value) {
        previewDate.innerText = fmt.date(dateInput.value);
        const compInput = document.getElementById('nfce-conf-competence');
        if (compInput && !parsedData.competence) compInput.value = dateInput.value.slice(0, 7);
      }
    };
  }

  if (parsedData.pixCode) {
    const copyPixBtn = document.getElementById('btn-conf-copy-pix');
    if (copyPixBtn) copyPixBtn.onclick = () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(parsedData.pixCode); toast('📋 Código PIX copiado!', 'success'); };
    const viewPixBtn = document.getElementById('btn-conf-view-pix'), pixBox = document.getElementById('conf-pix-preview-box'), pixImg = document.getElementById('conf-pix-img');
    if (viewPixBtn && pixBox && pixImg) {
      viewPixBtn.onclick = async () => {
        const isHidden = pixBox.style.display === 'none';
        pixBox.style.display = isHidden ? 'block' : 'none';
        viewPixBtn.innerHTML = isHidden ? '<span>📱</span> Ocultar QR' : '<span>📱</span> Ver QR Code';
        if (isHidden && typeof window.QRCode !== 'undefined' && window.QRCode.toDataURL) {
          try { pixImg.src = await window.QRCode.toDataURL(parsedData.pixCode, { width: 320, margin: 1 }); } catch(e) {}
        }
      };
    }
  }

  const btnAddPixPrompt = document.getElementById('btn-conf-add-pix-prompt');
  const addPixContainer = document.getElementById('conf-add-pix-container');
  const inputCustomPix = document.getElementById('conf-input-custom-pix');
  const btnSaveCustomPix = document.getElementById('btn-conf-save-custom-pix');
  const customPixPreview = document.getElementById('conf-custom-pix-preview');
  const customPixImg = document.getElementById('conf-custom-pix-img');

  if (btnAddPixPrompt && addPixContainer) {
    btnAddPixPrompt.onclick = () => {
      addPixContainer.style.display = addPixContainer.style.display === 'none' ? 'block' : 'none';
      if (addPixContainer.style.display === 'block' && inputCustomPix) inputCustomPix.focus();
    };
  }

  if (btnSaveCustomPix && inputCustomPix) {
    btnSaveCustomPix.onclick = async () => {
      const val = inputCustomPix.value.trim();
      if (!val) { toast('Informe o código ou chave PIX.', 'warning'); return; }
      parsedData.pixCode = val;
      parsedData.isPix = true;
      if (typeof window.QRCode !== 'undefined' && window.QRCode.toDataURL && customPixPreview && customPixImg) {
        try {
          customPixImg.src = await window.QRCode.toDataURL(val, { width: 300, margin: 1 });
          customPixPreview.style.display = 'block';
        } catch(e) {}
      }
      toast('✅ Código PIX associado!', 'success');
    };
  }

  if (parsedData.boletoCode) {
    const copyBarcodeBtn = document.getElementById('btn-conf-copy-barcode');
    if (copyBarcodeBtn) copyBarcodeBtn.onclick = () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(parsedData.boletoCode); toast('📋 Código de Barras copiado!', 'success'); };
  }

  document.getElementById('nfce-conf-btn-reject').onclick = () => { Modal.close(); toast('Leitura da nota fiscal descartada.', 'info'); };

  document.getElementById('nfce-conf-btn-more-options').onclick = () => {
    const updatedPrefill = {
      ...parsedData, description: descInput.value.trim(), amount: parseFloat(amountInput.value) || null,
      date: dateInput.value, competence: document.getElementById('nfce-conf-competence').value,
      suggestedCategory: categories.find(c => String(c.id) === String(document.getElementById('nfce-conf-category').value))?.name || parsedData.suggestedCategory
    };
    Modal.close();
    openAvulsoModal(accounts, categories, null, 'expense', updatedPrefill);
  };

  document.getElementById('nfce-conf-btn-accept').onclick = async () => {
    try {
      const amount = parseFloat(amountInput.value);
      const date = dateInput.value;
      const account_id = parseInt(document.getElementById('nfce-conf-account').value);
      const description = descInput.value.trim();
      const category_id = parseInt(document.getElementById('nfce-conf-category').value) || null;
      const competenceMonthVal = document.getElementById('nfce-conf-competence').value;
      const competence_date = competenceMonthVal ? `${competenceMonthVal}-01` : null;
      const is_paid = document.getElementById('nfce-conf-paid').checked ? 1 : 0;

      if (!amount || amount <= 0) { toast('Informe o valor da despesa/fatura.', 'error'); amountInput.focus(); return; }
      if (!date) { toast('Informe a data de vencimento/pagamento.', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione a conta pagadora.', 'error'); return; }

      const txData = {
        user_id: State.user.id, account_id, category_id, recurring_item_id: null,
        type: 'expense', amount, description: description || 'Fatura / Nota Fiscal',
        date, is_paid, is_avulso: 1,
        notes: parsedData.notes || (parsedData.accessKey ? `Chave: ${parsedData.accessKey}` : null),
        pix_code: parsedData.pixCode || null,
        credit_product: 'normal', due_date: parsedData.dueDate || null, competence_date
      };

      const res = await window.api.transactions.create(txData);
      if (res && res.error) { toast(res.error, 'error'); return; }

      Modal.close();
      toast(`✅ Lançamento de ${fmt.currency(amount)} criado com sucesso!`, 'success');
      if (typeof renderRecurring === 'function' && State.currentPage === 'recurring') renderRecurring();
      if (typeof renderDashboard === 'function' && (State.currentPage === 'dashboard' || !State.currentPage)) renderDashboard();
    } catch (err) { toast('Erro ao criar lançamento: ' + err.message, 'error'); }
  };
}

async function handleNFCeScanResult(parsedData, customCallback = null) {
  if (!parsedData) { toast('Não foi possível extrair dados válidos da nota fiscal.', 'error'); return; }
  if (customCallback && typeof customCallback === 'function') { customCallback(parsedData); return; }
  try {
    const [accounts, categories] = await Promise.all([window.api.accounts.getAll(State.user.id), window.api.categories.getAll(State.user.id)]);
    openNFCeConfirmationModal(parsedData, accounts, categories);
  } catch (err) { toast('Erro ao carregar dados para confirmação do lançamento.', 'error'); }
}


/* ==== payment-modal.js ==== */
/* ===
 * payment-modal.js — Modal de Liquidação / Pagamento com suporte a QR Code PIX
 */

async function ensureQRCodeLoaded() {
  if (typeof window.QRCode !== 'undefined') return;
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'js/vendor/qrcode.min.js';
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

async function openPaymentDateModal(txId, currentDate, onComplete) {
  await ensureQRCodeLoaded();
  const cleanDate = currentDate ? currentDate.split(' ')[0] : new Date().toISOString().split('T')[0];
  let tx = null;
  let recItem = null;
  try {
    const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
    tx = allTxs.find(t => t.id == txId);
    if (tx && tx.recurring_item_id) {
      const allRec = await window.api.recurring.getAll(State.user.id);
      recItem = allRec.find(r => r.id == tx.recurring_item_id);
    } else if (!tx) {
      const allRec = await window.api.recurring.getAll(State.user.id);
      recItem = allRec.find(r => r.id == txId);
      if (recItem) tx = allTxs.find(t => t.recurring_item_id == recItem.id);
    }
  } catch (e) {
    console.error(e);
  }

  const compDate = tx ? tx.date.split(' ')[0] : cleanDate;
  const baseAmount = tx ? tx.amount : 0;
  const desc = tx ? (tx.description || 'Despesa / Fatura') : (recItem ? recItem.name : 'Despesa / Fatura');

  let pixCode = tx ? (tx.pix_code || null) : null;
  if (!pixCode && tx && tx.notes) {
    const m = tx.notes.match(/(00020126[0-9A-Za-z.=-]+)/i) || tx.notes.match(/(000201[0-9A-Za-z.=-]{30,})/i);
    if (m) pixCode = m[1].trim();
  }
  if (!pixCode && recItem && recItem.notes) {
    const m = recItem.notes.match(/(00020126[0-9A-Za-z.=-]+)/i) || recItem.notes.match(/(000201[0-9A-Za-z.=-]{30,})/i);
    if (m) pixCode = m[1].trim();
  }

  let boletoCode = tx ? (tx.boleto_code || null) : null;
  if (!boletoCode && tx && tx.notes) {
    const m = tx.notes.match(/(?:Linha Digit[aá]vel|C[oó]digo de Barras|Boleto)\s*[:\s]*([0-9\s.-]{47,58})/i) ||
              tx.notes.match(/\b(8\d{11}\s*\d{12}\s*\d{12}\s*\d{12})\b/) ||
              tx.notes.match(/\b(8\d{47})\b/) ||
              tx.notes.match(/\b(\d{5}\.?\d{5}\s+\d{5}\.?\d{6}\s+\d{5}\.?\d{6}\s+\d\s+\d{14})\b/) ||
              tx.notes.match(/\b(\d{47})\b/);
    if (m) boletoCode = (m[1] || m[0]).replace(/[^0-9]/g, '');
  }
  if (!boletoCode && recItem && recItem.notes) {
    const m = recItem.notes.match(/(?:Linha Digit[aá]vel|C[oó]digo de Barras|Boleto)\s*[:\s]*([0-9\s.-]{47,58})/i) ||
              recItem.notes.match(/\b(8\d{47})\b/) ||
              recItem.notes.match(/\b(\d{47})\b/);
    if (m) boletoCode = (m[1] || m[0]).replace(/[^0-9]/g, '');
  }

  const rule = {
    interest_rate: (tx && tx.interest_rate !== undefined && tx.interest_rate !== null) ? tx.interest_rate : (recItem ? recItem.interest_rate : 0),
    interest_type: (tx && tx.interest_type) ? tx.interest_type : (recItem ? recItem.interest_type : 'daily'),
    penalty_fixed_rate: (tx && tx.penalty_fixed_rate !== undefined && tx.penalty_fixed_rate !== null) ? tx.penalty_fixed_rate : (recItem ? recItem.penalty_fixed_rate : 0),
  };

  const initialProjection = calculateProjectedInterest(baseAmount, compDate, cleanDate, rule);
  const initialPaymentValue = (tx && tx.is_paid && tx.penalty_amount)
    ? (baseAmount + (tx.penalty_amount || 0) - (tx.discount_amount || 0))
    : initialProjection.projectedAmount;

  Modal.open('Confirmar Pagamento / Liquidação', `
    <div style="padding: 14px 16px;">
      <div style="text-align: center; margin-bottom: 14px;">
        <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">${desc}</div>
        <div style="font-size: 26px; font-weight: 900; color: var(--accent-light); letter-spacing: -0.02em;">${fmt.currency(baseAmount)}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Vencimento Original: <strong>${fmt.date(compDate)}</strong></div>
      </div>

      <!-- PAINEL PIX E BOLETO -->
      <div id="payment-pix-boleto-wrapper" style="margin-bottom: 14px;">
        ${pixCode ? `
          <div style="background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08)); border: 1px solid rgba(6,182,212,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm" id="btn-toggle-pix-qr" style="font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span>📱</span> Exibir QR CODE do PIX
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-pix-code" style="font-size: 12px; font-weight: 600; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span>📋</span> Copiar Código PIX
              </button>
            </div>
            <div id="payment-pix-qr-container" style="margin-top: 8px; display: flex; flex-direction: column; align-items: center;">
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Aponte a câmera do aplicativo do seu banco para o QR Code:</p>
              <img id="payment-pix-qrcode-img" alt="QR Code PIX" style="width: 170px; height: 170px; border-radius: 8px; background: white; padding: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
            </div>
          </div>
        ` : `
          <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <span>⚡</span> <span>Deseja pagar via PIX?</span>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-show-pix-input" style="font-size: 11px; padding: 4px 10px;">
                <span>⚡</span> Gerar QR Code PIX
              </button>
            </div>
            <div id="payment-pix-custom-box" style="display: none; margin-top: 10px;">
              <div style="display: flex; gap: 6px;">
                <input type="text" id="input-custom-pix-code" placeholder="Cole o código PIX Copia e Cola (00020126...)..." style="flex: 1; padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
                <button type="button" class="btn btn-primary btn-sm" id="btn-generate-custom-pix" style="font-size: 11.5px; padding: 6px 12px; background: #0284c7; border: none; font-weight: 700;">Gerar QR</button>
              </div>
              <div id="payment-pix-custom-qr-wrap" style="display: none; text-align: center; margin-top: 10px;">
                <img id="payment-pix-custom-qrcode-img" style="width: 160px; height: 160px; border-radius: 8px; background: white; padding: 6px; margin: 0 auto; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-custom-pix" style="margin-top: 8px; font-size: 11px;">📋 Copiar Código PIX</button>
              </div>
            </div>
          </div>
        `}

        ${boletoCode ? `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; overflow: hidden;">
              <span>📄</span> <code style="font-size: 10.5px; color: var(--text-muted); word-break: break-all;">${boletoCode}</code>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-pay-barcode" style="font-size: 11px; padding: 4px 10px;">📋 Copiar Código</button>
          </div>
        ` : ''}
      </div>

      <p style="margin-bottom: 12px; font-size: 12.5px; color: var(--text-secondary); text-align: center;">
        Informe a <strong>Data</strong> e o <strong>Valor Pago</strong> para cálculo automático de encargos:
      </p>
      
      <!-- VALORES E DATAS DE PAGAMENTO -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Data do Pagamento</label>
          <input type="date" id="payment-date-input" value="${cleanDate}" style="width: 100%; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 700; font-size: 13px;">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Valor Pago (R$)</label>
          <input type="number" step="0.01" min="0" id="payment-amount-input" value="${initialPaymentValue.toFixed(2)}" style="width: 100%; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 800; font-size: 14px;">
        </div>
      </div>

      <!-- CARD DINÂMICO DE JUROS / DIAS / TAXA DIÁRIA -->
      <div id="payment-interest-calc-card" style="margin-bottom: 14px;"></div>

      <div id="payment-summary-box" style="padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 14px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.3);">
        <strong>Total a Debitar da Conta:</strong> <span id="payment-total-preview" style="font-weight:700; font-size:15px; color:var(--accent-light);">${fmt.currency(initialPaymentValue)}</span>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="btn-pay-cancel" style="padding: 8px 18px;">Cancelar</button>
        <button class="btn btn-primary" id="btn-pay-confirm" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700; padding: 8px 22px; box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
          Confirmar Pagamento
        </button>
      </div>
    </div>
  `);

  const dateInput = document.getElementById('payment-date-input');
  const amountInput = document.getElementById('payment-amount-input');
  const calcCard = document.getElementById('payment-interest-calc-card');
  const totalPreview = document.getElementById('payment-total-preview');

  let hasManuallyEditedAmount = false;
  amountInput.oninput = () => {
    hasManuallyEditedAmount = true;
    recalcPaymentUI();
  };

  dateInput.onchange = () => {
    if (!hasManuallyEditedAmount) {
      const proj = calculateProjectedInterest(baseAmount, compDate, dateInput.value, rule);
      amountInput.value = proj.projectedAmount.toFixed(2);
    }
    recalcPaymentUI();
  };

  function recalcPaymentUI() {
    const selDate = dateInput.value;
    const paidVal = parseFloat(amountInput.value) || 0;
    const diff = Math.round((paidVal - baseAmount) * 100) / 100;

    let daysDiff = 0;
    if (selDate && compDate) {
      const d1 = new Date(selDate + 'T00:00:00');
      const d2 = new Date(compDate + 'T00:00:00');
      daysDiff = Math.round((d1 - d2) / 86400000);
    }
    const daysLate = Math.max(0, daysDiff);
    const daysEarly = Math.max(0, -daysDiff);

    let html = '';
    if (diff > 0.005) {
      const totalPct = baseAmount > 0 ? ((diff / baseAmount) * 100).toFixed(2) : '0.00';
      const dailyRatePct = daysLate > 0 ? (totalPct / daysLate).toFixed(3) : totalPct;
      const dailyVal = daysLate > 0 ? (diff / daysLate) : diff;

      html = `
        <div style="background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08)); border: 1px solid rgba(245,158,11,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; font-size: 13.5px; color: #f59e0b; margin-bottom: 6px;">
            <span>⚠️</span> Juros / Encargos: +${fmt.currency(diff)} (+${totalPct}%)
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            ${daysLate > 0 ? `<span>📅 <strong>${daysLate} ${daysLate === 1 ? 'dia' : 'dias'} de atraso</strong></span>` : `<span>⚡ Pago na data c/ encargos</span>`}
            ${daysLate > 0 ? `<span>📈 Taxa diária: <strong style="color:#fbbf24">${dailyRatePct}% ao dia</strong> (${fmt.currency(dailyVal)}/dia)</span>` : ''}
          </div>
        </div>
      `;
    } else if (diff < -0.005) {
      const absDiff = Math.abs(diff);
      const discPct = baseAmount > 0 ? ((absDiff / baseAmount) * 100).toFixed(2) : '0.00';
      html = `
        <div style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08)); border: 1px solid rgba(16,185,129,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; font-size: 13.5px; color: var(--accent-light); margin-bottom: 6px;">
            <span>🏷️</span> Desconto Obtido: -${fmt.currency(absDiff)} (-${discPct}%)
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${daysEarly > 0 ? `📅 Pago com <strong>${daysEarly} ${daysEarly === 1 ? 'dia' : 'dias'} de antecedência</strong>` : `🏷️ Desconto concedido no vencimento`}
          </div>
        </div>
      `;
    } else {
      html = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px; text-align: center; font-size: 12px; color: var(--text-muted);">
          ✅ Pagamento no valor original exato (sem juros nem descontos)
        </div>
      `;
    }

    calcCard.innerHTML = html;
    totalPreview.innerText = fmt.currency(paidVal);
  }

  recalcPaymentUI();

  // Render QR Code PIX se existente
  if (pixCode) {
    const copyBtn = document.getElementById('btn-copy-pix-code');
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pixCode);
        toast('📋 Código PIX copiado! Cole no app do seu banco.', 'success');
      };
    }
    const toggleBtn = document.getElementById('btn-toggle-pix-qr');
    const qrContainer = document.getElementById('payment-pix-qr-container');
    const qrcodeImg = document.getElementById('payment-pix-qrcode-img');

    if (qrcodeImg && typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      QRCode.toDataURL(pixCode, { width: 340, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => { qrcodeImg.src = url; })
        .catch(err => console.error('[Pix QR] Erro ao renderizar QR code:', err));
    }
    if (toggleBtn && qrContainer) {
      toggleBtn.onclick = () => {
        const isHidden = qrContainer.style.display === 'none';
        qrContainer.style.display = isHidden ? 'flex' : 'none';
        toggleBtn.innerHTML = isHidden ? '<span>📱</span> Ocultar QR CODE' : '<span>📱</span> Exibir QR CODE do PIX';
      };
    }
  }

  // Suporte a inserção/geração dinâmica de PIX
  const btnShowPixInput = document.getElementById('btn-show-pix-input');
  const customPixBox = document.getElementById('payment-pix-custom-box');
  const btnGenCustomPix = document.getElementById('btn-generate-custom-pix');
  const inputCustomPix = document.getElementById('input-custom-pix-code');
  const customQrWrap = document.getElementById('payment-pix-custom-qr-wrap');
  const customQrImg = document.getElementById('payment-pix-custom-qrcode-img');
  const btnCopyCustomPix = document.getElementById('btn-copy-custom-pix');

  if (btnShowPixInput && customPixBox) {
    btnShowPixInput.onclick = () => {
      customPixBox.style.display = customPixBox.style.display === 'none' ? 'block' : 'none';
      if (customPixBox.style.display === 'block') inputCustomPix.focus();
    };
  }

  const renderCustomPix = async () => {
    const rawPix = inputCustomPix.value.trim();
    if (!rawPix) { toast('Cole o código PIX para gerar o QR Code.', 'warning'); return; }
    if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      try {
        customQrImg.src = await QRCode.toDataURL(rawPix, { width: 320, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
        customQrWrap.style.display = 'block';
        toast('✅ QR Code PIX gerado com sucesso!', 'success');
        if (tx && tx.id) {
          try {
            await window.api.transactions.update({
              id: tx.id,
              notes: (tx.notes ? tx.notes + '\n' : '') + `PIX Copia e Cola: ${rawPix}`
            });
          } catch(e) {}
        }
      } catch (err) {
        toast('Erro ao gerar QR Code: ' + err.message, 'error');
      }
    }
  };

  if (btnGenCustomPix) btnGenCustomPix.onclick = renderCustomPix;
  if (inputCustomPix) inputCustomPix.onkeydown = (e) => { if (e.key === 'Enter') renderCustomPix(); };
  if (btnCopyCustomPix) {
    btnCopyCustomPix.onclick = () => {
      if (inputCustomPix.value && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inputCustomPix.value.trim());
        toast('📋 Código PIX copiado!', 'success');
      }
    };
  }

  if (boletoCode) {
    const copyBarcodeBtn = document.getElementById('btn-copy-pay-barcode');
    if (copyBarcodeBtn) {
      copyBarcodeBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(boletoCode);
        toast('📋 Código de barras copiado!', 'success');
      };
    }
  }

  document.getElementById('btn-pay-cancel').onclick = Modal.close;
  document.getElementById('btn-pay-confirm').onclick = async () => {
    const selectedDate = dateInput.value;
    const paidVal = parseFloat(amountInput.value);
    if (!selectedDate) {
      toast('Selecione uma data válida', 'error');
      return;
    }
    if (isNaN(paidVal) || paidVal < 0) {
      toast('Informe um valor de pagamento válido', 'error');
      return;
    }

    const diff = Math.round((paidVal - baseAmount) * 100) / 100;
    const penalty_amount = diff > 0 ? diff : 0;
    const discount_amount = diff < 0 ? Math.abs(diff) : 0;

    try {
      await window.api.transactions.togglePaidWithDate(txId, selectedDate, { penalty_amount, discount_amount });
      toast('Pagamento confirmado com sucesso!', 'success');
      Modal.close();
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar status: ' + err.message, 'error');
    }
  };
}

/**
 * Abre o Modal Dedicado de Pagamento via PIX com exibição do QR Code e confirmação direta (OK Já Pago)
 */
async function openPixPaymentModal(txOrId, onComplete) {
  let tx = typeof txOrId === 'object' && txOrId !== null ? txOrId : null;
  if (!tx && txOrId) {
    try {
      const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
      tx = allTxs.find(t => t.id == txOrId);
    } catch (e) {
      console.error(e);
    }
  }
  if (!tx) {
    toast('Lançamento não encontrado.', 'error');
    return;
  }

  const pixCode = tx.pix_code || (tx.notes ? (tx.notes.match(/000201[0-9A-Za-z.=-]+/) || [])[0] : null);
  if (!pixCode) {
    toast('Este lançamento não possui código PIX associado.', 'warning');
    return;
  }

  const desc = tx.description || 'Pagamento PIX';
  const amt = tx.amount || 0;
  const today = new Date().toISOString().split('T')[0];

  Modal.open('⚡ Pagar com PIX', `
    <div style="padding: 14px 16px; text-align: center;">
      <div style="background: linear-gradient(135deg, rgba(6,182,212,0.14), rgba(16,185,129,0.08)); border: 1px solid rgba(6,182,212,0.35); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${desc}</div>
        <div style="font-size: 32px; font-weight: 900; color: var(--accent-light); letter-spacing: -0.02em; margin: 4px 0;">${fmt.currency(amt)}</div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Aponte o aplicativo do seu banco para o QR Code abaixo:</div>

        <div style="display: flex; justify-content: center; margin: 12px 0;">
          <img id="pix-direct-qrcode-img" alt="QR Code PIX" style="width: 190px; height: 190px; border-radius: 12px; background: white; padding: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.2);">
        </div>

        <button type="button" class="btn btn-secondary btn-sm" id="btn-pix-direct-copy" style="font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; margin: 0 auto;">
          <span>📋</span> Copiar Código PIX (Copia e Cola)
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="btn btn-primary" id="btn-pix-direct-confirm-paid" style="font-weight: 700; font-size: 14px; padding: 11px 20px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
          <span>✅</span> Confirmar Pagamento Realizado (OK Já Pago)
        </button>
        <button type="button" class="btn btn-secondary" id="btn-pix-direct-close" style="padding: 8px; font-size: 12.5px;">
          Fechar (Pagar Mais Tarde)
        </button>
      </div>
    </div>
  `);

  const qrcodeImg = document.getElementById('pix-direct-qrcode-img');
  if (qrcodeImg && typeof QRCode !== 'undefined' && QRCode.toDataURL) {
    QRCode.toDataURL(pixCode, { width: 400, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => { qrcodeImg.src = url; })
      .catch(err => console.error('[Pix QR] Erro ao renderizar QR code:', err));
  }

  document.getElementById('btn-pix-direct-copy').onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pixCode);
    }
    toast('📋 Código PIX copiado com sucesso! Cole no app do seu banco.', 'success');
  };

  document.getElementById('btn-pix-direct-close').onclick = Modal.close;

  document.getElementById('btn-pix-direct-confirm-paid').onclick = async () => {
    try {
      await window.api.transactions.togglePaidWithDate(tx.id, today, {});
      if (typeof playScanBeep === 'function') playScanBeep();
      toast(`✅ Pagamento de ${fmt.currency(amt)} confirmado com sucesso!`, 'success');
      Modal.close();
      if (onComplete) onComplete();
      else {
        if (typeof renderRecurring === 'function' && State.currentPage === 'recurring') renderRecurring();
        if (typeof renderDashboard === 'function' && (State.currentPage === 'dashboard' || !State.currentPage)) renderDashboard();
      }
    } catch (err) {
      console.error(err);
      toast('Erro ao confirmar pagamento: ' + err.message, 'error');
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
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;" title="Soma das faturas abertas + todas as parcelas futuras que consom o limite">Comprometido Total</div>
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
    <div class="page-header">
      <div><h2 class="page-title">Relatórios</h2></div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn btn-secondary btn-sm" id="btn-print-report" style="display:flex;align-items:center;gap:6px" title="Imprimir Relatório ou Salvar em PDF">
          <span>🖨️</span> Imprimir / PDF
        </button>
        <div id="report-period"></div>
      </div>
    </div>
    <div class="report-tabs">
      <button class="report-tab active" data-tab="cashflow">Fluxo de Caixa</button>
      <button class="report-tab" data-tab="categories">Por Categoria</button>
      <button class="report-tab" data-tab="patrimony">Patrimônio</button>
      <button class="report-tab" data-tab="interest">Auditoria de Juros</button>
    </div>
    <div id="report-content"></div>`;

  document.getElementById('report-period').appendChild(buildPeriodSelector(() => loadTab(currentTab)));
  let currentTab = 'cashflow';

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });

  document.querySelectorAll('.report-tab').forEach(btn => {
    btn.onclick = () => { document.querySelectorAll('.report-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentTab = btn.dataset.tab; loadTab(currentTab); };
  });

  async function loadTab(tab) {
    const content = document.getElementById('report-content');
    if (tab === 'cashflow') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
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
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Tipo</th><th class="text-right">Valor Líquido</th></tr></thead>
          <tbody>${txs.length === 0 ? '<tr><td colspan="6" class="no-data">Sem lançamentos</td></tr>' :
            txs.map(t => {
              const net = (t.amount || 0) + (t.is_paid ? ((t.penalty_amount || 0) - (t.discount_amount || 0)) : 0);
              const hasAdjustment = t.is_paid && (t.penalty_amount > 0 || t.discount_amount > 0);
              return `<tr>
                <td style="color:var(--text-muted)">${fmt.date(t.date)}</td>
                <td>
                  ${t.description || '—'}
                  ${hasAdjustment ? `<div style="font-size:10.5px;color:var(--text-muted)">Base: ${fmt.currency(t.amount)}${t.penalty_amount > 0 ? ` (+${fmt.currency(t.penalty_amount)} juros)` : ''}${t.discount_amount > 0 ? ` (-${fmt.currency(t.discount_amount)} desc)` : ''}</div>` : ''}
                </td>
                <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
                <td>${t.account_name || '—'}</td>
                <td><span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
                <td class="text-right" style="font-weight:600;color:${t.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(net)}</td>
              </tr>`;
            }).join('')}
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
    } else if (tab === 'patrimony') {
      const data = await window.api.reports.getPatrimony({ userId: State.user.id });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #3b82f6; border-radius: var(--radius-sm);">
          💡 <strong>Evolução Patrimonial:</strong> Este gráfico de linha apresenta a evolução acumulada e progressiva do seu patrimônio (saldos somados de todas as suas contas bancárias líquidas, poupanças e caixas de dinheiro) nos últimos 12 meses. O objetivo é visualizar e acompanhar o crescimento saudável e progressivo do seu patrimônio como um todo.
        </p>
        <div class="chart-card" style="height:320px"><canvas id="chart-patrimony"></canvas></div>`;
      if (State.charts.patrimony) State.charts.patrimony.destroy();
      const vals = data.map(d => d.net);
      State.charts.patrimony = new Chart(document.getElementById('chart-patrimony'), { type: 'line', data: { labels: data.map(d => d.month), datasets: [{ label: 'Patrimônio', data: vals, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4 }] }, options: chartOptions('bar') });
    } else if (tab === 'interest') {
      const audit = await window.api.reports.getInterestAudit({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const summary = audit.summary || { totalPenalty: 0, totalDiscount: 0, penaltyCount: 0, discountCount: 0, avgDaysLate: 0, avgDailyRate: 0 };
      const byCat = audit.byCategory || [];
      const bySup = audit.bySupplier || [];
      const byAcc = audit.byAccount || [];
      const txs = audit.transactions || [];

      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
          💡 <strong>Auditoria de Juros e Encargos:</strong> Monitore todos os valores pagos em atraso, multas, taxa média de juros ao dia (% a.d.) e economias com descontos obtidos. Identifique onde você mais gasta com juros por categoria, fornecedor ou conta bancária.
        </p>

        <!-- KPI CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="text-align: center; border-top: 3px solid #ef4444;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">⚠️ Total Pago em Juros / Multas</div>
            <div style="font-size: 22px; font-weight: 800; color: #f87171;">${fmt.currency(summary.totalPenalty)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${summary.penaltyCount} pagamento(s) com acréscimo</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #10b981;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🏷️ Total de Descontos Obtidos</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-light);">${fmt.currency(summary.totalDiscount)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${summary.discountCount} pagamento(s) com desconto</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #f59e0b;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📅 Média de Dias de Atraso</div>
            <div style="font-size: 22px; font-weight: 800; color: #fbbf24;">${summary.avgDaysLate.toFixed(1)} <span style="font-size: 13px; font-weight: 600;">dias</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Tempo médio de atraso pago</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #06b6d4;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📈 Taxa Média de Juros Diária</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">${summary.avgDailyRate.toFixed(3)}% <span style="font-size: 13px; font-weight: 600;">a.d.</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Custo médio diário do atraso</div>
          </div>
        </div>

        <!-- BREAKDOWN GRIDS: CATEGORIA, FORNECEDOR E CONTA -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- POR CATEGORIA -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>📂 Juros por Categoria</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${byCat.length} categorias</span>
            </h3>
            ${byCat.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${byCat.map(c => {
                  const pct = summary.totalPenalty > 0 ? ((c.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>${c.category_icon || '📁'} <strong>${c.category_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${c.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(c.total_penalty)} <span style="font-size:11px;color:var(--text-muted)">(${pct}%)</span></span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: ${c.category_color || '#ef4444'}; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- POR FORNECEDOR / CREDOR -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>🏢 Juros por Fornecedor / Credor</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">Top credores</span>
            </h3>
            ${bySup.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${bySup.slice(0, 6).map((s, idx) => {
                  const pct = summary.totalPenalty > 0 ? ((s.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span><strong style="color:var(--text-primary)">${idx + 1}. ${s.supplier}</strong> <span style="color:var(--text-muted);font-size:11px">(${s.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(s.total_penalty)}</span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: #f59e0b; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- POR CONTA BANCÁRIA -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>🏦 Juros por Conta Pagadora</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">Origem dos pagamentos</span>
            </h3>
            ${byAcc.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${byAcc.map(a => {
                  const pct = summary.totalPenalty > 0 ? ((a.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>💳 <strong>${a.account_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${a.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(a.total_penalty)}</span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: ${a.account_color || '#3b82f6'}; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- TABELA DETALHADA DE AUDITORIA -->
        <div class="card">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">📋 Extrato Detalhado de Pagamentos com Ajuste (Juros ou Descontos)</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Atraso / Ant.</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Conta</th>
                  <th class="text-right">Valor Base</th>
                  <th class="text-right">Ajuste (Juros/Desc.)</th>
                  <th class="text-right">Taxa Diária</th>
                  <th class="text-right">Total Pago</th>
                </tr>
              </thead>
              <tbody>
                ${txs.length === 0 ? '<tr><td colspan="10" class="no-data" style="padding:24px;text-align:center">Nenhum pagamento com juros ou desconto registrado neste período. 🎉</td></tr>' :
                  txs.map(t => {
                    const isPenalty = t.penalty_amount > 0;
                    const isDiscount = t.discount_amount > 0;
                    const diffDays = t.days_late;
                    let delayLabel = '—';
                    if (diffDays > 0) delayLabel = `<span style="color:#f87171;font-weight:700">+${diffDays}d atraso</span>`;
                    else if (diffDays < 0) delayLabel = `<span style="color:var(--accent-light);font-weight:700">${Math.abs(diffDays)}d antecip.</span>`;
                    else delayLabel = `<span style="color:var(--text-muted)">no dia</span>`;

                    return `
                      <tr>
                        <td style="color:var(--text-muted)">${fmt.date(t.due_date || t.date)}</td>
                        <td style="font-weight:600;color:var(--text-primary)">${fmt.date(t.payment_date)}</td>
                        <td>${delayLabel}</td>
                        <td style="font-weight:600">${t.description || '—'}</td>
                        <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
                        <td>${t.account_name || '—'}</td>
                        <td class="text-right" style="color:var(--text-muted)">${fmt.currency(t.base_amount)}</td>
                        <td class="text-right" style="font-weight:700;color:${isPenalty ? '#f87171' : (isDiscount ? 'var(--accent-light)' : 'var(--text-muted)')}">
                          ${isPenalty ? `+${fmt.currency(t.penalty_amount)}` : (isDiscount ? `-${fmt.currency(t.discount_amount)}` : 'R$ 0,00')}
                        </td>
                        <td class="text-right" style="font-size:12px;color:${isPenalty ? '#fbbf24' : 'var(--text-muted)'}">
                          ${isPenalty && t.daily_rate_pct ? `${t.daily_rate_pct.toFixed(3)}% a.d.` : '—'}
                        </td>
                        <td class="text-right" style="font-weight:800;color:var(--text-primary)">${fmt.currency(t.net_amount)}</td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
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
 * Retorna o HTML do menu em árvore (Sidebar) do Manual do Usuário com os 13 Capítulos
 */
function getManualSidebarHtml() {
  return `
    <!-- MENU EM ÁRVORE DE ASSUNTOS E SUBMENUS (13 CAPÍTULOS) -->
    <div id="manual-tree-sidebar" style="width: 285px; min-width: 285px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin;">
      
      <!-- CAPÍTULO 1: PRIMEIROS PASSOS & ACESSO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="primeiros" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🌟 1. Primeiros Passos & Acesso</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="primeiros" data-topic="primeiros-familia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • 1.1 Criando Família e Usuário
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.2 Perfis & Permissões Granulares
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-recuperacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.3 Recuperação de Senha Segura
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-temas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.4 Temas & Personalização Visual
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 2: CONTAS, CARTEIRAS & BENEFÍCIOS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #06b6d4; background: rgba(6,182,212,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 2. Contas & Benefícios</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-cadastro" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.1 Contas, Poupanças & Dinheiro
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-beneficios" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.2 Cartões Benefício (*Flash, Caju*)
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transferencias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.3 Transferências Sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-limites" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.4 Cheque Especial & LIS
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 3: CARTÕES DE CRÉDITO & FATURAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #a855f7; background: rgba(168,85,247,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 3. Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.1 Ciclo & Melhor Dia de Compra
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.2 Limite Total vs Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.3 Pagamento Integral da Fatura
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-rotativo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.4 Pagamento Parcial & Rotativo
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-antecipacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.5 Antecipação com Desconto
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.6 Renegociação & Acordos
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-estorno" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.7 Estorno em 1 Clique
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 4: LANÇAMENTOS & NOTAS FISCAIS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #10b981; background: rgba(16,185,129,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📝 4. Lançamentos & NF-e</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-despesas-receitas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.1 Despesas e Receitas
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.2 Mês de Competência
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-nfce-qr" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.3 Leitor de Nota Fiscal (QR Code)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-duplicados" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.4 Alerta de Duplicidades
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-popup-detalhes" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 4.5 Pop-up de Detalhes & 3 Ações
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 5: JUROS, MULTAS & FERIADOS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="juros" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f59e0b; background: rgba(245,158,11,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>⚖️ 5. Juros, Multas & Feriados</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-prorrogacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.1 Prorrogação em Feriados
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-calculo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.2 Cálculo de Juros & Multas
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-projecao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.3 Projeção para Pagamento Hoje
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.4 Pagamento com Acréscimo/Desconto
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 6: PLANEJAMENTO & RECORRÊNCIAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="planejamento" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #ec4899; background: rgba(236,72,153,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🔄 6. Planejamento Mensal</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-fixas-parceladas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.1 Despesas Fixas & Parceladas
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-prioritarias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.2 Despesas Prioritárias ⭐
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-adiar" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.3 Adiar Parcela para o Mês
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-kanban" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.4 Kanban com Drag & Drop
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-decisao-cards" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #a78bfa; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 6.5 Cards de Decisão de Recorrência
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 7: ORÇAMENTOS & METAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamento" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f43f5e; background: rgba(244,63,94,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 7. Orçamentos & Metas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-tetos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.1 Tetos de Orçamento
          </div>
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-barras" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.2 Barras de Limite Coloridas
          </div>
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.3 Metas de Economia & Aportes
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 8: DASHBOARD & KANBAN -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="dashboard" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #fb923c; background: rgba(249,115,22,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📊 8. Dashboard & Painel</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-modos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.1 Os 3 Modos de Visualização
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-filtros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.2 Filtros por Membro e Conta
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-kanban" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.3 Kanban em 3 Colunas
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-pendencias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.4 Pendências de Meses Anteriores
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 9: RELATÓRIOS, AUDITORIA & PDF -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="relatorios" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #818cf8; background: rgba(129,140,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📈 9. Relatórios & Auditoria</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-fluxo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.1 Relatório de Fluxo de Caixa
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-graficos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.2 Gráficos Interativos
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-patrimonio" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.3 Evolução Patrimonial Anual
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-auditoria-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.4 Auditoria de Juros & Encargos
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-impressao-pdf" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.5 Impressão & Exportação PDF
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 10: AUDITORIA, SEGURANÇA & LGPD -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="seguranca" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #14b8a6; background: rgba(20,184,166,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🛡️ 10. Auditoria & LGPD</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="seguranca" data-topic="seg-trilha-auditoria" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 10.1 Histórico de Modificações
          </div>
          <div class="wiki-tree-item" data-cat="seguranca" data-topic="seg-lgpd" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 10.2 Direitos LGPD & Privacidade
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 11: BACKUPS & INTEGRIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="backup" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #eab308; background: rgba(234,179,8,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💾 11. Backups & Restauração</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-exportacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.1 Exportação Excel, CSV, DB
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-teste-integridade" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.2 Testar Integridade (.db)
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-restauracao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.3 Restaurando um Backup
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-saude-metricas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.4 Saúde & Métricas SQLite
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 12: CELULAR & RESPONSIVIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="mobile" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📱 12. Acesso Celular & Mobile</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="mobile" data-topic="mob-conexao-wifi" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 12.1 Conexão Wi-Fi / QR Code
          </div>
          <div class="wiki-tree-item" data-cat="mobile" data-topic="mob-layout-touch" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 12.2 Layout Touch & Header
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 13: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f87171; background: rgba(248,113,113,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ 13. FAQ & Dúvidas Frequentes</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-duvidas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 13.1 Dúvidas Mais Frequentes
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos dos Capítulos 1 a 6 do painel de leitura
 */
function getManualTopicsPart1Html() {
  return `
    <!-- CAPÍTULO 1.1: PRIMEIROS PASSOS > FAMÍLIA & USUÁRIO -->
    <div class="manual-topic-content" id="topic-primeiros-familia" style="display: block;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🌟 1.1 Criando sua Família e Primeiro Usuário Master</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Passo a Passo de Inicialização do Ambiente Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao abrir o FinançasFamília pela primeira vez, o assistente inicial solicita:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Nome do Grupo Familiar:</strong> Digite o nome da sua casa (ex: <em>Família Silva</em> ou <em>Família Oliveira</em>).</li>
          <li><strong>Perfil do Administrador Master (ADM):</strong> Crie o login principal (usuário <code>adm</code>) com senha forte.</li>
          <li><strong>Personalização Cromática:</strong> Escolha a cor oficial do titular (ex: <em>Verde Esmeralda</em>) e um avatar.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
          💡 <strong>Exemplo Prático:</strong> O casal Carlos e Mariana cria a "Família Silva". Carlos cadastra o usuário master e em seguida convida Mariana criando o perfil secundário em <a href="javascript:void(0)" onclick="openManualTopic('primeiros-perfis')" style="color: #60a5fa; text-decoration: underline; font-weight: 700;">1.2 Perfis & Permissões Granulares</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 1.2: PERFIS & PERMISSÕES -->
    <div class="manual-topic-content" id="topic-primeiros-perfis" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>👥 1.2 Perfis de Membros da Família & Permissões Granulares</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Membros da Família</strong>, você pode cadastrar e gerenciar o acesso de cada integrante:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>👑 <strong>Administrador (ADM):</strong> Acesso total às configurações, contas bancárias, cartões, backups e gerenciamento de membros.</li>
          <li>👔 <strong>Membro Operacional:</strong> Pode lançar despesas, receitas, dar baixa em contas e visualizar o planejamento do mês.</li>
          <li>👀 <strong>Visualizador:</strong> Acesso somente-leitura aos relatórios e gráficos, ideal para acompanhamento sem permissão de alteração.</li>
          <li>🧸 <strong>Perfil Caçula:</strong> Interface simplificada e amigável para educação financeira de filhos e dependentes.</li>
        </ul>
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          🔗 <strong>Tópico Relacionado:</strong> Veja como configurar as contas bancárias de cada familiar em <a href="javascript:void(0)" onclick="openManualTopic('contas-cadastro')" style="color: #60a5fa; font-weight: 700; text-decoration: underline;">2.1 Cadastrando Contas Correntes e Poupanças</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 1.3: RECUPERAÇÃO DE SENHA -->
    <div class="manual-topic-content" id="topic-primeiros-recuperacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔑 1.3 Recuperação de Senha Segura com Pergunta Secreta</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Privacidade Total Sem Depender de Servidores Externos:</strong>
        </div>
        <p style="margin-bottom: 10px;">Como o FinançasFamília opera 100% local no seu computador, a recuperação de senha é realizada com pergunta e resposta secreta:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Acesse <strong>⚙️ Configurações › Minha Conta</strong> e defina sua pergunta de segurança (ex: <em>"Qual o modelo do meu primeiro carro?"</em>).</li>
          <li>Digite a resposta que apenas você conhece.</li>
          <li>Se esquecer a senha, na tela de login clique em <code>Esqueci minha senha</code>, responda corretamente e crie a nova chave na hora.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 1.4: TEMAS & PERSONALIZAÇÃO -->
    <div class="manual-topic-content" id="topic-primeiros-temas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎨 1.4 Personalização Visual, Temas & Layouts do Dashboard</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Personalize a estética e o modo de visualização do aplicativo em <strong>⚙️ Configurações › Aparência</strong>:</p>
        
        <div style="background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
          <strong style="color: var(--text-primary); font-size: 14px;">🎨 Modos de Aparência Disponíveis:</strong>
          <ul style="padding-left: 20px; line-height: 1.8; margin-top: 8px; margin-bottom: 0;">
            <li>🌙 <strong>Tema Escuro (Dark Emerald):</strong> Visual escuro moderno e sofisticado, com acentos em verde esmeralda relaxantes para os olhos, ideal para uso diário e noturno.</li>
            <li>☀️ <strong>Tema Claro (Light Clean):</strong> Visual branco limpo, descansado e profissional com alto contraste, excelente para ambientes bem iluminados.</li>
            <li>🌓 <strong>Botão Rápido de Alternância:</strong> Clique no ícone de lua/sol no topo superior direito da tela (ou no cabeçalho mobile) para alternar instantaneamente entre Claro e Escuro com apenas 1 clique.</li>
          </ul>
        </div>

        <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); border-radius: 8px; padding: 14px;">
          <strong style="color: var(--text-primary); font-size: 14px;">🎛️ Modos de Layout do Dashboard (Configurações › Aparência):</strong>
          <ul style="padding-left: 20px; line-height: 1.8; margin-top: 8px; margin-bottom: 0;">
            <li>🌟 <strong>Executivo por Zonas (Padrão):</strong> Visão consolidada 360° com KPIs, cartões de contas e painel Kanban em 3 colunas.</li>
            <li>📑 <strong>Sub-Abas Operacionais:</strong> Navegação setorizada por abas (*Resumo, Faturas, Contas e Gráficos*).</li>
            <li>🚀 <strong>Cockpit Integrado:</strong> Painel panorâmico de alta densidade reunindo todas as métricas em uma tela.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 2.1: CONTAS & CADASTRO -->
    <div class="manual-topic-content" id="topic-contas-cadastro" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏦 2.1 Cadastrando Contas Correntes, Poupanças e Carteiras de Dinheiro</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na aba <strong>🏦 Contas</strong>, clique em <code>+ Nova Conta</code> para registrar onde o dinheiro da casa está guardado:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Instituição / Banco:</strong> Selecione o banco (ex: <em>Itaú, Bradesco, Nubank, Banrisul, Inter, Caixa, Banco do Brasil</em>).</li>
          <li><strong>Tipo da Conta:</strong> Escolha entre <em>Conta Corrente</em>, <em>Conta Pagamento/Digital</em>, <em>Poupança/Investimento</em> ou <em>Dinheiro em Espécie (Carteira)</em>.</li>
          <li><strong>Titular Responsável:</strong> Vincule ao membro da família proprietário da conta.</li>
          <li><strong>Saldo Inicial Conciliado:</strong> Digite o saldo real exato que consta no extrato bancário hoje.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 2.2: CARTÕES BENEFÍCIO -->
    <div class="manual-topic-content" id="topic-contas-beneficios" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎟️ 2.2 Cartões Benefício (*Flash, Caju, Alelo, Sodexo, Swile, Banricard*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(6,182,212,0.08); border-left: 4px solid #06b6d4; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Gestão Inteligente de Vouchers de Alimentação e Refeição:</strong>
        </div>
        <p style="margin-bottom: 10px;">Cartões como <strong>Flash, Caju, Alelo, Sodexo, Swile e Banricard</strong> funcionam como contas pré-pagas corporativas:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Cadastre o cartão na tela de <strong>🏦 Contas</strong> escolhendo o tipo <em>Cartão Benefício / Voucher</em>.</li>
          <li>Ao lançar uma compra de supermercado ou restaurante, selecione o cartão benefício como pagador. O saldo é debitado exclusivamente do benefício, sem mexer no saldo da conta corrente!</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 2.3: TRANSFERÊNCIAS -->
    <div class="manual-topic-content" id="topic-contas-transferencias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 2.3 Transferências Entre Contas Sem Duplicar Gastos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao mover recursos financeiros entre familiares ou contas (ex: PIX da Conta Itaú para a Carteira de Dinheiro):</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no botão <code>🔄 Transferência</code> na tela de Contas ou Planejamento.</li>
          <li>Selecione a <strong>Conta de Origem</strong>, a <strong>Conta de Destino</strong>, a data e o valor (R$).</li>
          <li>O sistema realiza o débito e o crédito atomicamente.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px;">
          🛡️ <strong>Regra Contábil:</strong> Transferências internas não são computadas como despesa nem como receita, mantendo seus gráficos e relatórios de fluxo de caixa 100% corretos!
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 2.4: LIMITES ESPECIAIS -->
    <div class="manual-topic-content" id="topic-contas-limites" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🛡️ 2.4 Limites Especiais (*Cheque Especial, Banricompras, Crédito Minuto*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Configure o limite de crédito rotativo contratado no seu banco para cada conta:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💰 <strong>Saldo Atual:</strong> O dinheiro real disponível em conta (ex: <code>R$ 350,00</code>).</li>
          <li>🛡️ <strong>Limite LIS / Cheque Especial:</strong> O limite concedido pelo banco (ex: <code>R$ 1.500,00</code>).</li>
          <li>⚡ <strong>Saldo Operacional Total:</strong> Exibido como <code>R$ 1.850,00</code> (Saldo + Cheque Especial). Se o saldo ficar negativo, o card alerta o uso do rotativo para evitar encargos bancários.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.1: CARTÕES > CICLO -->
    <div class="manual-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 3.1 Ciclo do Cartão: Fechamento vs Vencimento & Melhor Dia</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conceito Fundamental do Cartão de Crédito:</strong>
        </div>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔒 <strong>Dia de Fechamento (Corte):</strong> Data em que a operadora encerra a fatura do mês. Compras realizadas até esse dia entram no boleto atual.</li>
          <li>🛒 <strong>Melhor Dia de Compra:</strong> Compras feitas no dia seguinte ao fechamento entram automaticamente na fatura do mês posterior, proporcionando até 40 dias de prazo!</li>
          <li>📅 <strong>Dia de Vencimento:</strong> Data limite para pagamento da fatura sem juros.</li>
        </ul>
        <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 8px;">
          💡 <strong>Exemplo:</strong> Cartão com Fechamento dia 25 e Vencimento dia 05. Uma compra feita em 24/08 vence em 05/09. Uma compra feita em 26/08 vencerá apenas em 05/10!
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 3.2: CARTÕES > LIMITE TOTAL VS COMPROMETIDO -->
    <div class="manual-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 3.2 Limite Total vs Limite Comprometido em Tempo Real</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No quadro <strong>"🏦 Previsibilidade de Contas e Cartões"</strong> do Dashboard:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💳 <strong>Limite Total:</strong> Limite concedido pelo banco (ex: <code>R$ 5.000,00</code>).</li>
          <li>🔴 <strong>Fatura do Mês:</strong> Gastos que vencem na competência selecionada (ex: <code>R$ 1.200,00</code>).</li>
          <li>🟠 <strong>Comprometido Global:</strong> Soma de todas as faturas abertas e parcelas futuras a vencer (ex: <code>R$ 4.200,00</code>).</li>
          <li>🟢/🔴 <strong>Disponível / Excedido:</strong> Saldo livre em tempo real <code>(Limite - Comprometido)</code>. Se as parcelas ultrapassarem o limite, surge o alerta <span class="badge badge-danger">⚠️ LIMITE EXCEDIDO</span>.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.3: CARTÕES > PAGAMENTO INTEGRAL -->
    <div class="manual-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 3.3 Pagamento Integral da Fatura (Baixa Atômica)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Para liquidar a fatura de cartão de crédito no final do ciclo:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>No card da fatura em <strong>🔄 Planejamento</strong>, clique no botão verde <code>💳 Pagar Fatura</code>.</li>
          <li>Selecione a <strong>Conta Bancária Pagadora</strong> (ex: <em>Conta Itaú</em>) e a data de pagamento.</li>
          <li>Confirme o valor total.</li>
        </ol>
        <p style="margin: 0;">O aplicativo debita o valor da conta bancária e <strong>marca todas as compras e parcelas atreladas àquela fatura como pagas em uma única transação segura</strong>.</p>
      </div>
    </div>

    <!-- CAPÍTULO 3.4: CARTÕES > PAGAMENTO PARCIAL & ROTATIVO -->
    <div class="manual-topic-content" id="topic-cartao-rotativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 3.4 Pagamento Parcial & Saldo Rotativo Automático</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se a família não puder quitar o valor integral do boleto do cartão:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Ao clicar em <code>💳 Pagar Fatura</code>, informe o valor parcial que foi pago.</li>
          <li>O sistema dá baixa no montante pago e <strong>lança o saldo devedor restante na fatura do mês seguinte como Saldo Rotativo</strong>, aplicando automaticamente a taxa de juros cadastrada no cartão.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.5: CARTÕES > ANTECIPAÇÃO DE PARCELAS -->
    <div class="manual-topic-content" id="topic-cartao-antecipacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚡ 3.5 Antecipação de Parcelas Futuras com Desconto</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aproveite descontos antecipando parcelas de compras longas (ex: compras parceladas no Nubank/Inter):</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Na fatura ou na lista de despesas, selecione as parcelas futuras que deseja adiantar.</li>
          <li>Informe o desconto em reais (R$) ou percentual concedido pelo banco.</li>
          <li>O sistema puxa as parcelas para a fatura atual com o valor abatido e libera o limite futuro imediatamente.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 3.6: CARTÕES > RENEGOCIAÇÃO & ACORDO -->
    <div class="manual-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🤝 3.6 Renegociação e Acordos de Fatura Parcelada</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você precisou negociar a fatura com o banco gerando um parcelamento de acordo:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique em <code>🤝 Parcelar / Acordo</code> no card da fatura.</li>
          <li>Informe a entrada e o número de parcelas acordadas. A fatura original é marcada como <span class="badge badge-purple">Renegociada</span> e as novas parcelas são projetadas nos meses seguintes.</li>
          <li>Caso tenha realizado a operação por engano, utilize o botão <code>↩️ Desfazer Acordo / Reabrir</code> para restaurar o estado original da fatura.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.7: CARTÕES > ESTORNO EM 1 CLIQUE -->
    <div class="manual-topic-content" id="topic-cartao-estorno" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>↩️ 3.7 Estorno de Compras em 1 Clique</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se uma compra foi devolvida ou cancelada pelo estabelecimento comercial:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Abra o pop-up de detalhes do lançamento clicando sobre a linha da compra.</li>
          <li>Clique no botão de estorno. O valor é creditado de volta no limite do cartão e marcado com selo auditado de estorno.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.1: LANÇAMENTOS > DESPESAS & RECEITAS -->
    <div class="manual-topic-content" id="topic-lanc-despesas-receitas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📝 4.1 Lançamento de Despesas e Receitas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Para lançar receitas e despesas no dia a dia:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>+ Nova Receita:</strong> Salários, comissões, pró-labore, aluguéis recebidos, dividendos e transferências recebidas.</li>
          <li>🟣 <strong>+ Nova Variável:</strong> Gastos esporádicos do cotidiano (Supermercado, Farmácia, Combustível, Restaurante).</li>
          <li>⭐ <strong>Despesa Fixa Recorrente:</strong> Contas mensais que se repetem todo mês (Aluguel, Luz, Condomínio, Internet).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.2: LANÇAMENTOS > COMPETÊNCIA -->
    <div class="manual-topic-content" id="topic-lanc-competencia" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 4.2 Mês de Competência vs Data de Vencimento</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>O que é o Mês de Referência (Competência)?</strong>
        </div>
        <p style="margin-bottom: 10px;">A competência é o mês em que o consumo realmente aconteceu, enquanto a data de vencimento é quando o boleto deve ser pago:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💡 <strong>Exemplo:</strong> Sua conta de energia de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>) que vence no dia <strong>10 de Março</strong> (Vencimento: <code>10/03/2026</code>).</li>
          <li>📊 O app permite computar o gasto no orçamento de Fevereiro, garantindo relatórios de consumo 100% fieis à realidade.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.3: LANÇAMENTOS > LEITOR DE NOTA FISCAL (QR CODE) -->
    <div class="manual-topic-content" id="topic-lanc-nfce-qr" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📷 4.3 Leitor de Nota Fiscal por Câmera & QR Code (NFC-e)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Cadastro Instantâneo de Compras Sem Digitação Manual:</strong>
        </div>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no botão <code>📷 Ler Nota Fiscal</code> no Dashboard, Planejamento ou formulário.</li>
          <li>Aponte a câmera do seu celular ou webcam para o QR Code quadrado impresso no final do seu cupom fiscal (NFC-e ou SAT).</li>
          <li>O aplicativo consulta a SEFAZ e preenche automaticamente o <strong>Valor Total (R$)</strong>, a <strong>Data</strong>, o <strong>Nome do Mercado/Farmácia</strong> e sugere a <strong>Categoria</strong>!</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 4.4: LANÇAMENTOS > ALERTA DE DUPLICADOS -->
    <div class="manual-topic-content" id="topic-lanc-duplicados" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔔 4.4 Identificação & Alerta Automático de Gastos Duplicados</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Enquanto você digita o valor, data e descrição de um lançamento, o motor inteligente verifica se já existe uma transação similar cadastrada:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⚠️ Se houver similaridade, surge um banner amarelo no formulário informando a existência de lançamento parecido, prevenindo lançamentos repetidos por engano.</li>
          <li>Na barra lateral, o botão <code>🛡️</code> abre a <strong>Central de Conciliação</strong> para mesclar duplicidades com 1 clique.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.5: POP-UP DE DETALHES & 3 AÇÕES RÁPIDAS -->
    <div class="manual-topic-content" id="topic-lanc-popup-detalhes" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔍 4.5 Pop-up de Detalhes Completo & 3 Ações Rápidas</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Visão Executiva do Lançamento com 1 Toque:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao clicar ou tocar em qualquer linha de transação na tela de <strong>Planejamento</strong>, abre-se uma janela com todas as informações e 3 botões ergonômicos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📑 <strong>Ficha Completa:</strong> Descrição, categoria com ícone, titular responsável, conta/cartão pagador, vencimento e status.</li>
          <li>💰 <strong>Memória de Cálculo:</strong> Valor original, juros/multas acumulados, descontos obtidos e valor líquido final.</li>
          <li>🔴 <strong>[ 🗑️ Excluir Lançamento ]:</strong> Remove o lançamento com restauração automática do saldo bancário.</li>
          <li>🟡 <strong>[ ✏️ Editar Lançamento ]:</strong> Abre o formulário de edição para ajustar datas, valores ou categoria.</li>
          <li>🟢 <strong>[ 💳 Pagar / Baixar ]:</strong> Permite quitar a conta na hora escolhendo a data e conta pagadora (ou <code>↩️ Desfazer Pagamento</code> para reverter).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.1: JUROS & FERIADOS -->
    <div class="manual-topic-content" id="topic-juros-prorrogacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📅 5.1 Prorrogação Automática para Dias Úteis & Feriados Nacionais</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(245,158,11,0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conformidade com a Legislação Bancária Nacional (Febraban):</strong>
        </div>
        <p style="margin-bottom: 10px;">Contas cujo vencimento cai em sábados, domingos ou feriados nacionais (incluindo feriados móveis como Páscoa, Carnaval e Corpus Christi) são automaticamente prorrogadas para o <strong>próximo dia útil</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏷️ O card da conta exibe o selo <code>📅 Prorroga: DD/MM</code> informando a data limite sem juros.</li>
          <li>Os juros por atraso só começam a ser calculados se o pagamento ocorrer após o dia útil prorrogado.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.2: JUROS > CÁLCULO -->
    <div class="manual-topic-content" id="topic-juros-calculo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ 5.2 Cálculo de Juros Diários (% a.d.), Mensais (% a.m.) e Multas Fixas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Você pode configurar parâmetros financeiros específicos para cada despesa fixa:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔢 <strong>Multa Moratória (%):</strong> Percentual fixo cobrado pelo atraso (ex: <code>2,00%</code>).</li>
          <li>📈 <strong>Juros de Mora (% a.m. ou % a.d.):</strong> Taxa de juros mensal ou diária calculada proporcionalmente aos dias de atraso (pro-rata die).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.3: JUROS > PROJEÇÃO -->
    <div class="manual-topic-content" id="topic-juros-projecao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📈 5.3 Projeção do Valor Atualizado para Pagamento Hoje</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao consultar contas vencidas no Dashboard ou Planejamento, o sistema calcula e exibe em tempo real o <strong>Valor Atualizado para Pagamento Hoje</strong>, somando o valor original aos juros e multas acumulados até a data de hoje.</p>
      </div>
    </div>

    <!-- CAPÍTULO 5.4: JUROS > PAGAMENTO COM ACRÉSCIMO/DESCONTO -->
    <div class="manual-topic-content" id="topic-juros-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏷️ 5.4 Pagamento com Acréscimo ou Desconto</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No modal de liquidação, você pode ajustar com total flexibilidade:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Desconto Obtido:</strong> Se você pagou antecipadamente ou via PIX com desconto, informe o abatimento para registrar o valor líquido real debitado da conta.</li>
          <li>🔴 <strong>Acréscimo Pago:</strong> Registre eventuais tarifas bancárias ou juros cobrados na quitação do boleto.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.1: PLANEJAMENTO > FIXAS & PARCELADAS -->
    <div class="manual-topic-content" id="topic-plan-fixas-parceladas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 6.1 Criando Despesas Fixas e Parcelamentos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na tela <strong>🔄 Planejamento</strong>, organize as contas recorrentes e compras em parcelas:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique em <code>⭐ + Nova Despesa Fixa</code>.</li>
          <li>Defina se a conta é <strong>Recorrente Contínua</strong> (sem fim previsto, ex: <em>Aluguel, Internet</em>) ou <strong>Parcelada</strong> (ex: <em>10x de R$ 150</em>).</li>
          <li>O sistema projeta cada parcela no mês correspondente com contagem automática (1/10, 2/10, etc.).</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 6.2: PLANEJAMENTO > PRIORITÁRIAS -->
    <div class="manual-topic-content" id="topic-plan-prioritarias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⭐ 6.2 Despesas Prioritárias ⭐</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Marque contas indispensáveis (Aluguel, Luz, Mensalidade Escolar) com a <strong>Estrela de Prioridade ⭐</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>As contas prioritárias ganham moldura dourada e aparecem no topo do quadro operacional do mês no Dashboard.</li>
          <li>Facilita para que você saiba exatamente o montante mínimo necessário para honrar compromissos vitais.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.3: PLANEJAMENTO > ADIAR PARCELA -->
    <div class="manual-topic-content" id="topic-plan-adiar" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⏩ 6.3 Adiar Parcela para o Mês Seguinte</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se o orçamento do mês atual estiver apertado e você combinou de postergar um pagamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>No card da despesa, clique na opção de adiar.</li>
          <li>A parcela é transferida para o mês seguinte sem afetar as demais parcelas futuras do parcelamento.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.4: PLANEJAMENTO > KANBAN DRAG & DROP -->
    <div class="manual-topic-content" id="topic-plan-kanban" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 6.4 Kanban de Planejamento com Arrastar e Soltar</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Você pode reordenar a sequência de pagamento das contas no Planejamento simplesmente <strong>arrastando os cards</strong> para cima ou para baixo, organizando sua esteira financeira na ordem de pagamento desejada.</p>
      </div>
    </div>

    <!-- CAPÍTULO 6.5: CARDS DE DECISÃO DE RECORRÊNCIA -->
    <div class="manual-topic-content" id="topic-plan-decisao-cards" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎛️ 6.5 Cards de Decisão de Recorrência (*Apenas este mês vs Todos*)</span>
        <span class="badge badge-purple">Segurança Operacional</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(167,139,250,0.08); border-left: 4px solid #a78bfa; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Decisões Claras ao Editar ou Excluir Lançamentos Fixos:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao alterar o valor de uma despesa fixa ou cancelá-la, o sistema exibe dois cards visuais:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🗓️ <strong>Opção 1 — Apenas este Mês:</strong> Ajusta unicamente a fatura/parcela da competência atual (ex: conta de água ou luz que varia todo mês). Na tela de edição, você pode clicar no botão <strong><code>📷 Escanear Fatura / QR Code / Pix</code></strong> para capturar com a câmera ou importar o PDF da fatura, preenchendo valor exato, vencimento e chave PIX em 1 segundo.</li>
          <li>♾️ <strong>Opção 2 — Este e Todos os Futuros:</strong> Propaga o novo valor para todos os meses seguintes (ex: aumento definitivo da mensalidade do plano de internet).</li>
        </ul>
      </div>
    </div>
  `;
}

/* ==== manual-b.js ==== */
/* manual-b.js - parte 2/2 */

/**
 * Retorna o HTML dos tópicos dos Capítulos 7 a 13 do painel de leitura
 */
function getManualTopicsPart2Html() {
  return `
    <!-- CAPÍTULO 7.1: ORÇAMENTOS > TETOS -->
    <div class="manual-topic-content" id="topic-orc-tetos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎯 7.1 Definindo Tetos de Orçamento por Categoria</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(244,63,94,0.08); border-left: 4px solid #f43f5e; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Disciplina e Previsibilidade Financeira Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Na aba <strong>📋 Orçamento</strong>, você estabelece o teto máximo de gastos da família para cada categoria do mês:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no campo de valor ao lado de cada categoria (ex: <em>Alimentação: R$ 2.500,00, Moradia: R$ 3.000,00, Lazer: R$ 800,00</em>).</li>
          <li>Conforme as despesas do mês são lançadas, o sistema calcula a porcentagem consumida em tempo real.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px;">
          💡 <strong>Dica de Ouro:</strong> Acompanhe o consumo visual nas barras de progresso descritas em <a href="javascript:void(0)" onclick="openManualTopic('orc-barras')" style="color: #f43f5e; font-weight: 700; text-decoration: underline;">7.2 Barras de Limite Coloridas</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 7.2: ORÇAMENTOS > BARRAS COLORIDAS -->
    <div class="manual-topic-content" id="topic-orc-barras" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 7.2 Acompanhamento Visual das Barras de Limite</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">As barras de progresso mudam de cor dinamicamente para alertar a saúde do orçamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Verde Esmeralda (0% a 70%):</strong> Gastos confortáveis dentro da margem de segurança.</li>
          <li>🟡 <strong>Amarelo Atenção (71% a 90%):</strong> Categoria próxima do limite planejado para o mês.</li>
          <li>🔴 <strong>Vermelho Perigo (> 90% ou Estourado):</strong> Orçamento esgotado ou ultrapassado, sinalizando que a família deve segurar compras não essenciais.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 7.3: ORÇAMENTOS > METAS -->
    <div class="manual-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎯 7.3 Criando Metas de Economia & Aportes Financeiros</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na tela <strong>🎯 Metas</strong>, acompanhe cofrinhos e objetivos de poupança (ex: <em>Reserva de Emergência, Férias em Família, Troca de Carro</em>):</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique em <code>+ Nova Meta</code>, informe o nome do objetivo, valor alvo (R$) e data desejada.</li>
          <li>Para adicionar dinheiro economizado, clique em <code>+ Fazer Aporte</code> escolhendo a conta bancária de onde o recurso saiu.</li>
          <li>O sistema atualiza a barra de porcentagem e projeta quantos meses faltam para atingir o objetivo familiar.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 8.1: DASHBOARD > 3 MODOS -->
    <div class="manual-topic-content" id="topic-dash-modos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎛️ 8.1 Os 3 Modos de Visualização do Dashboard</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Alterne a disposição do Dashboard no seletor de modos no canto superior direito:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏛️ <strong>Modo Executivo:</strong> Visão consolidada por blocos com widgets de saldos em conta, faturas de cartão e patrimônio líquido.</li>
          <li>📑 <strong>Modo Sub-Abas:</strong> Navegação setorizada por abas operacionais (*Resumo, Faturas, Contas e Gráficos*).</li>
          <li>🚀 <strong>Modo Cockpit Integrado:</strong> Painel de alta densidade reunindo todas as métricas financeiras em uma única tela panorâmica.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.2: DASHBOARD > FILTROS -->
    <div class="manual-topic-content" id="topic-dash-filtros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>👥 8.2 Filtros Rápidos por Membro da Família e Tipo de Conta</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No topo do Dashboard, você pode filtrar instantaneamente os dados exibidos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>👤 <strong>Filtro por Membro:</strong> Clique no nome de um familiar para enxergar apenas os gastos, receitas e cartões daquela pessoa.</li>
          <li>🏦 <strong>Filtro por Tipo de Conta:</strong> Isole contas correntes, carteiras de dinheiro ou cartões benefício com 1 clique.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.3: DASHBOARD > KANBAN EM 3 COLUNAS -->
    <div class="manual-topic-content" id="topic-dash-kanban" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 8.3 Kanban Operacional em 3 Colunas (*Prioritários, A Pagar e Pagas*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No centro do Dashboard, três colunas organizam as tarefas do mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⭐ <strong>Prioritários:</strong> Reúne todas as contas marcadas com estrela de prioridade indispensável no mês.</li>
          <li>⏳ <strong>Contas a Pagar:</strong> Despesas pendentes ordenadas cronologicamente por proximidade da data de vencimento.</li>
          <li>✓ <strong>Contas Pagas:</strong> Histórico de despesas já quitadas no mês com indicação da conta de pagamento.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.4: DASHBOARD > PENDÊNCIAS ANTERIORES -->
    <div class="manual-topic-content" id="topic-dash-pendencias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚨 8.4 Alerta de Pendências de Meses Anteriores</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você tiver deixado contas em aberto nos meses passados, surge um <strong>banner vermelho de alerta no topo do Dashboard</strong> informando a quantidade e o valor total acumulado, com link direto para regularização instantânea.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.1: RELATÓRIOS > FLUXO DE CAIXA -->
    <div class="manual-topic-content" id="topic-rep-fluxo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📈 9.1 Relatório de Fluxo de Caixa</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na tela <strong>📈 Relatórios</strong>, visualize a saúde financeira consolidada do grupo familiar:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Total de Receitas do Mês:</strong> Entradas salariais e rendimentos.</li>
          <li>🔴 <strong>Total de Despesas do Mês:</strong> Somatório de gastos fixos, variáveis e faturas.</li>
          <li>💰 <strong>Saldo Líquido Operacional:</strong> Diferença real entre entradas e saídas.</li>
          <li>📊 <strong>Taxa de Poupança Familiar (%):</strong> Percentual da renda que a família conseguiu guardar no período.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.2: RELATÓRIOS > GRÁFICOS INTERATIVOS -->
    <div class="manual-topic-content" id="topic-rep-graficos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🍩 9.2 Gráficos Interativos por Categoria (*Pizza, Barras, Radar, Polar*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Analise para onde seu dinheiro está indo em diferentes perspectivas visuais interativas:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🍩 <strong>Gráfico em Rosca (Donut):</strong> Mostra a fatia percentual de cada categoria no orçamento da família.</li>
          <li>📊 <strong>Gráfico de Barras:</strong> Compara a evolução de gastos mês a mês.</li>
          <li>🕸️ <strong>Gráfico Radar / Polar:</strong> Identifica anomalias e picos de gastos sazonais.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.3: RELATÓRIOS > PATRIMÔNIO -->
    <div class="manual-topic-content" id="topic-rep-patrimonio" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏛️ 9.3 Evolução Patrimonial Anual</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Acompanhe o crescimento do <strong>Patrimônio Líquido Familiar</strong> ao longo dos 12 meses do ano:</p>
        <p style="margin: 0;">O cálculo soma todos os saldos em contas bancárias, poupanças e investimentos, deduzindo dívidas pendentes em cartões de crédito e faturas abertas.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.4: RELATÓRIOS > AUDITORIA DE JUROS -->
    <div class="manual-topic-content" id="topic-rep-auditoria-juros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ 9.4 Relatório de Auditoria de Juros e Descontos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Descubra exatamente quanto a família pagou de encargos por atraso de boletos e quanto economizou aproveitando descontos antecipados via PIX.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.5: RELATÓRIOS > IMPRESSÃO / PDF -->
    <div class="manual-topic-content" id="topic-rep-impressao-pdf" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🖨️ 9.5 Impressão & Exportação em PDF (*🖨️ Imprimir / PDF*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Clique no botão <code>🖨️ Imprimir / PDF</code> no topo da página de relatórios para gerar um arquivo PDF formatado com cabeçalho da família, tabelas detalhadas e gráficos em alta resolução.</p>
      </div>
    </div>

    <!-- CAPÍTULO 10.1: SEGURANÇA > TRILHA DE AUDITORIA -->
    <div class="manual-topic-content" id="topic-seg-trilha-auditoria" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #14b8a6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🛡️ 10.1 Histórico Visual de Modificações (*Trilha de Auditoria*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Segurança</strong>, consulte a auditoria operacional completa:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Registro com data, hora, nome do familiar e ação realizada (criação, edição, exclusão ou quitação de contas).</li>
          <li>Exibição detalhada dos valores anteriores e dos novos valores alterados para total transparência entre os membros da casa.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 10.2: SEGURANÇA > LGPD -->
    <div class="manual-topic-content" id="topic-seg-lgpd" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #14b8a6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔒 10.2 Direitos LGPD (*Exportação dos Meus Dados e Exclusão Segura*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em total conformidade com a Lei Geral de Proteção de Dados:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📦 <strong>Exportar Meus Dados:</strong> Baixe todo o histórico financeiro da família em arquivo aberto JSON.</li>
          <li>🗑️ <strong>Exclusão Definitiva:</strong> Permite ao Administrador expurgar com segurança os registros locais quando desejar.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 11.1: BACKUP > EXPORTAÇÃO -->
    <div class="manual-topic-content" id="topic-bak-exportacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💾 11.1 Exportando Backups em Excel, CSV, JSON e Banco <code>.db</code></span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Backup & Restauração</strong>, gere cópias de segurança:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📊 <strong>Planilha Excel / CSV:</strong> Para conferência e manipulação externa de dados.</li>
          <li>🗄️ <strong>Backup Completo SQLite (.db):</strong> Cópia integral e criptografada de todo o banco de dados.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 11.2: BACKUP > TESTAR .DB -->
    <div class="manual-topic-content" id="topic-bak-teste-integridade" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔍 11.2 Testando a Integridade do Arquivo de Backup (*🔍 Testar .db*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Antes de restaurar um arquivo de backup no seu computador, clique em <code>🔍 Testar .db</code>. O motor analisa a consistência estrutural, chaves estrangeiras e integridade de tabelas para garantir que o arquivo não está corrompido.</p>
      </div>
    </div>

    <!-- CAPÍTULO 11.3: BACKUP > RESTAURAÇÃO -->
    <div class="manual-topic-content" id="topic-bak-restauracao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>♻️ 11.3 Restaurando um Backup com Segurança</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Selecione o arquivo de backup <code>.db</code> ou <code>.json</code> prévio.</li>
          <li>Confirme a restauração com sua senha de administrador.</li>
          <li>O sistema restaura todas as tabelas e atualiza a interface imediatamente.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 11.4: BACKUP > SAÚDE & MÉTRICAS -->
    <div class="manual-topic-content" id="topic-bak-saude-metricas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 11.4 Painel de Saúde e Métricas do Sistema</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Acompanhe o tamanho físico do arquivo do banco de dados no disco, quantidade total de transações registradas, status do modo WAL e integridade dos índices.</p>
      </div>
    </div>

    <!-- CAPÍTULO 12.1: MOBILE > CONEXÃO LOCAL / WI-FI -->
    <div class="manual-topic-content" id="topic-mob-conexao-wifi" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📱 12.1 Conexão Local / Wi-Fi via QR Code</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Acesso Direto pelo Celular Sem Precisar Baixar Nada da Loja de Aplicativos:</strong>
        </div>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Certifique-se de que o seu celular e o seu computador estão conectados na <strong>mesma rede Wi-Fi</strong>.</li>
          <li>No computador, clique no botão <code>📱 Conectar Aparelho</code> no menu lateral.</li>
          <li>Aponte a câmera do celular para o QR Code na tela. O app abrirá no navegador do celular conectado diretamente ao seu computador!</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 12.2: MOBILE > LAYOUT TOUCH & HEADER -->
    <div class="manual-topic-content" id="topic-mob-layout-touch" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📱 12.2 Layout Mobile, Header Centralizado & Grids Touch-Friendly</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">A interface foi calibrada para navegação confortável com o polegar em smartphones:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔝 <strong>Header em 3 Colunas:</strong> Menu hamburguer à esquerda, logo centralizado e alternador de tema à direita.</li>
          <li>📊 <strong>Lançamentos em 2 Linhas:</strong> Descrição, categoria, valor e status sem sobreposição.</li>
          <li>💳 <strong>Faturas Verticais:</strong> Cards de fatura com botões largos de 42px para toque fácil.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 13.1: FAQ INTERATIVO -->
    <div class="manual-topic-content" id="topic-faq-duvidas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f87171; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>❓ 13.1 Perguntas Frequentes (FAQ Interativo — Clique para ver a resposta)</span>
      </h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        
        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💰 Como o app diferencia receitas de familiares em contas bancárias distintas?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Salários e rendas de membros diferentes da família (ex: marido no Itaú e esposa no Nubank) são reconhecidos como rendas legítimas independentes e <strong>nunca são bloqueados pelo motor de duplicidade</strong>.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 O que acontece quando clico em 'Pagar Fatura' de um cartão?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            O valor total da fatura é debitado da conta bancária pagadora escolhida e todas as despesas e parcelas atreladas àquela fatura são marcadas como pagas simultaneamente em uma única operação segura.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔒 Meus dados e informações financeiras ficam salvos na nuvem?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! Todos os dados são salvos exclusivamente no banco de dados local SQLite no seu computador com criptografia AES-256 e conformidade integral com a LGPD. Nenhuma informação financeira sai da sua máquina.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Função global para navegação por hiperlinks internos no manual
 */
window.openManualTopic = function(topicId) {
  const container = document.getElementById('page-manual');
  if (!container) return;

  const targetItem = container.querySelector(`.wiki-tree-item[data-topic="${topicId}"]`);
  if (!targetItem) return;

  // Abrir o acordeão do grupo pai caso esteja fechado
  const subs = targetItem.closest('.wiki-tree-subs');
  const header = subs?.previousElementSibling;
  const arrow = header?.querySelector('.wiki-tree-arrow');
  if (subs && subs.style.display === 'none') {
    subs.style.display = 'flex';
    if (arrow) arrow.textContent = '▾';
  }

  targetItem.click();
};

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
          Guia completo de operações, cartões de crédito, fluxo de caixa e metodologia financeira (13 Capítulos)
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
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="manual-crumb-root" onclick="openManualTopic('primeiros-familia')">📚 MANUAL</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-cat" style="color: #60a5fa; font-weight: 600;">🌟 1. Primeiros Passos & Acesso</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-sub" style="color: var(--accent-light); font-weight: 700;">1.1 Criando Família e Usuário</span>
    </div>

    <!-- BUSCA GLOBAL NO MANUAL -->
    <div style="margin-bottom: 14px; position: relative;">
      <input type="text" id="manual-search-input" placeholder="🔍 Pesquisar em todos os 13 capítulos, termos e dúvidas do manual..."
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
      } else {
        const activeItem = container.querySelector('.wiki-tree-item.active');
        if (activeItem) {
          activeItem.click();
        }
      }
    };
  }

  // Export PDF Button
  const btnPdf = container.querySelector('#btn-download-manual-pdf');
  if (btnPdf) {
    btnPdf.onclick = () => {
      window.print();
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
            <button class="settings-modal-tab-btn ${activeTab === 'audit' ? 'active' : ''}" data-tab="audit">
              <span>🛡️</span> Trilha de Auditoria
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
              <button class="btn btn-secondary btn-sm" id="btn-test-backup" style="flex: 1; min-width: 110px; font-size: 12px; border: 1px dashed var(--accent);">
                🔍 Testar .db
              </button>
              <input type="file" id="input-test-backup" accept=".db" style="display:none">
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

        <!-- PAINEL DE OBSERVABILIDADE & MÉTRICAS SQLITE (FASE 17) -->
        <div style="margin-top: 24px; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <div style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span>📊 Saúde do Banco de Dados & Observabilidade</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-metrics" style="font-size: 11px; padding: 4px 10px;">🔄 Atualizar</button>
          </div>
          <div id="sqlite-metrics-content" style="font-size: 12px; color: var(--text-muted);">
            Carregando métricas do SQLite...
          </div>
        </div>
      `;

      bindBackupTabEvents(capitalizedMonth);

    } else if (tab === 'wiki') {
      renderSettingsWikiTab(bodyEl);
    } else if (tab === 'lgpd') {
      renderSettingsLgpdTab(bodyEl);
    } else if (tab === 'audit') {
      await renderSettingsAuditTab(bodyEl);
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
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-antecipacao" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Antecipação de Parcelas
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-rotativo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento Parcial & Rotativo
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
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-feriados" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Feriados & Prorrogação Útil
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

    <!-- TÓPICO: CARTÕES > ANTECIPAÇÃO -->
    <div class="wiki-topic-content" id="topic-cartao-antecipacao" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        ⚡ Antecipação de Parcelas Futuras com Desconto
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Deseja adiantar parcelas de compras parceladas e aproveitar descontos concedidos pela emissora do cartão?</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Abra a fatura do cartão e selecione <strong>"Antecipar Parcelas"</strong>.</li>
          <li>Marque quais parcelas dos próximos meses deseja transferir para o mês atual.</li>
          <li>Informe o valor do desconto (se houver). O sistema aplica o abatimento proporcional e recalcula as faturas futuras.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > ROTATIVO -->
    <div class="wiki-topic-content" id="topic-cartao-rotativo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔄 Pagamento Parcial & Saldo Rotativo Automático
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se no fechamento do mês você não puder pagar o valor total da fatura:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>No modal de quitação da fatura, informe o <strong>Valor Parcial</strong> pago.</li>
          <li>O valor pago é debitado da conta corrente selecionada.</li>
          <li>O saldo remanescente acrescido dos encargos do rotativo é <strong>lançado automaticamente na fatura do mês seguinte</strong>.</li>
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

    <!-- TÓPICO: LANÇAMENTOS > FERIADOS & PRORROGAÇÃO -->
    <div class="wiki-topic-content" id="topic-lanc-feriados" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        📅 Feriados Nacionais & Prorrogação para Dia Útil
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <strong>Regra Bancária:</strong> Contas vencendo em fins de semana ou feriados nacionais brasileiros são prorrogadas para o 1º dia útil seguinte.</p>
        <p style="margin-bottom: 8px;">• <strong>Tag Informativa:</strong> O app exibe a tag azul <code>📅 Prorroga: DD/MM</code> nos lançamentos com vencimento em feriado ou fim de semana.</p>
        <p style="margin: 0;">• <strong>Isenção de Mora:</strong> Pagamentos efetuados até o dia útil prorrogado não sofrem cálculo de juros por atraso.</p>
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

/**
 * Renderiza a aba de Trilha de Auditoria no Modal de Configurações
 */
async function renderSettingsAuditTab(bodyEl) {
  bodyEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary);">
          🛡️ Trilha de Auditoria & Modificações
        </h3>
        <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--text-muted);">
          Rastreabilidade de alterações cadastrais e financeiras (Quem, Quando, O quê, Valores Anteriores e Novos)
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="audit-filter-entity" style="padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 12px; outline: none; cursor: pointer;">
          <option value="">Todas as Entidades</option>
          <option value="transaction">Lançamentos</option>
          <option value="account">Contas</option>
          <option value="recurring_item">Planejamento</option>
          <option value="invoice">Faturas de Cartão</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="btn-refresh-audit" style="font-size: 12px; padding: 6px 12px;">
          🔄 Atualizar
        </button>
      </div>
    </div>

    <div id="audit-logs-container" style="height: 400px; overflow-y: auto; scrollbar-width: thin;">
      <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
        Carregando registros de auditoria...
      </div>
    </div>
  `;

  const loadAuditLogs = async () => {
    const container = document.getElementById('audit-logs-container');
    const entityFilter = document.getElementById('audit-filter-entity')?.value || null;

    try {
      const logs = await window.api.audit.getLogs({
        familyId: State.user.family_id,
        entityType: entityFilter,
        limit: 100
      });

      if (!logs || logs.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Nenhum registro de auditoria encontrado</div>
            <div style="font-size: 12px; margin-top: 4px;">As próximas ações de criação, alteração ou exclusão serão registradas aqui automaticamente.</div>
          </div>
        `;
        return;
      }

      const getActionBadge = (action) => {
        if (action.includes('CREATE')) return '<span class="badge" style="background: rgba(16,185,129,0.15); color: #34d399; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">CRIOU</span>';
        if (action.includes('UPDATE')) return '<span class="badge" style="background: rgba(59,130,246,0.15); color: #60a5fa; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ALTEROU</span>';
        if (action.includes('DELETE')) return '<span class="badge" style="background: rgba(239,68,68,0.15); color: #f87171; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">EXCLUIU</span>';
        if (action.includes('PAY')) return '<span class="badge" style="background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">QUITOU</span>';
        return `<span class="badge" style="background: var(--bg-raised); color: var(--text-muted); font-size: 10px; padding: 2px 6px; border-radius: 4px;">${action}</span>`;
      };

      container.innerHTML = `
        <table class="data-table" style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted); font-size: 11px;">
              <th style="padding: 8px 10px;">DATA/HORA</th>
              <th style="padding: 8px 10px;">USUÁRIO</th>
              <th style="padding: 8px 10px;">AÇÃO</th>
              <th style="padding: 8px 10px;">ENTIDADE</th>
              <th style="padding: 8px 10px;">DESCRIÇÃO / HISTÓRICO</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => {
              const dt = new Date(l.created_at);
              const dateFormatted = !isNaN(dt) ? dt.toLocaleString('pt-BR') : l.created_at;
              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle;">
                  <td style="padding: 8px 10px; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 11px;">
                    ${dateFormatted}
                  </td>
                  <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary); white-space: nowrap;">
                    👤 ${l.user_name || 'Sistema'}
                  </td>
                  <td style="padding: 8px 10px; white-space: nowrap;">
                    ${getActionBadge(l.action)}
                  </td>
                  <td style="padding: 8px 10px; color: var(--text-muted); text-transform: capitalize; white-space: nowrap; font-size: 11px;">
                    ${l.entity_type}
                  </td>
                  <td style="padding: 8px 10px; color: var(--text-primary); line-height: 1.4;">
                    <div>${l.description || '—'}</div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #f87171; font-size: 13px;">
          Erro ao carregar trilha de auditoria: ${err.message}
        </div>
      `;
    }
  };

  document.getElementById('audit-filter-entity')?.addEventListener('change', loadAuditLogs);
  document.getElementById('btn-refresh-audit')?.addEventListener('click', loadAuditLogs);

  await loadAuditLogs();
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

  if (document.getElementById('btn-test-backup')) {
    document.getElementById('btn-test-backup').onclick = () => {
      document.getElementById('input-test-backup').click();
    };

    document.getElementById('input-test-backup').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      toast('Analisando integridade do arquivo SQLite...');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        try {
          // Salva temporariamente no backend para validar via PRAGMA
          const res = await window.api.backup.testIntegrity({ fileData: base64, filename: file.name });
          if (res && res.success) {
            const counts = res.tableCounts || {};
            const summaryStr = Object.entries(counts).map(([k, v]) => `• ${k}: ${v} registros`).join('\n');
            alert(`🔍 DIAGNÓSTICO DE INTEGRIDADE SQLITE:\n\n` +
                  `✅ Status: Arquivo 100% íntegro!\n` +
                  `📦 Tamanho: ${res.sizeFormatted}\n` +
                  `🛡️ PRAGMA integrity_check: ${res.integrityResult}\n\n` +
                  `📊 Contagem de Registros:\n${summaryStr}\n\n` +
                  `Este arquivo é seguro e válido para restauração.`);
          } else {
            alert('❌ Falha no teste de integridade: ' + (res?.error || 'Arquivo corrompido ou formato SQLite inválido.'));
          }
        } catch (err) {
          alert('Erro ao testar integridade: ' + err.message);
        }
        e.target.value = '';
      };
      reader.readAsDataURL(file);
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

  const loadSqliteMetrics = async () => {
    const container = document.getElementById('sqlite-metrics-content');
    if (!container) return;
    try {
      const res = await window.api.server.getMetrics();
      if (!res || !res.success) {
        container.innerHTML = `<span style="color:#f87171">Não foi possível obter métricas: ${res?.error || 'Erro'}</span>`;
        return;
      }
      const { sqlite, tableCounts, process: proc } = res;
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Tamanho Total (.db + WAL)</div>
            <div style="font-size: 16px; font-weight: 700; color: #34d399; margin-top: 2px;">${sqlite.totalFormatted}</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Modo de Journal & FK</div>
            <div style="font-size: 14px; font-weight: 700; color: #60a5fa; margin-top: 2px;">${(sqlite.journalMode || 'wal').toUpperCase()} • FKs ${sqlite.foreignKeys ? 'Ativas' : 'Desat.'}</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Memória do Processo</div>
            <div style="font-size: 14px; font-weight: 700; color: #c084fc; margin-top: 2px;">${proc.memoryRssMb} (Heap: ${proc.memoryHeapUsedMb})</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Uptime do Sistema</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${Math.floor(proc.uptimeSeconds / 60)} min (${proc.uptimeSeconds}s)</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; color: var(--text-muted); background: var(--bg-base); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <span>📊 <strong>Lançamentos:</strong> ${tableCounts.transactions || 0}</span>
          <span>•</span>
          <span>💳 <strong>Faturas:</strong> ${tableCounts.invoices || 0}</span>
          <span>•</span>
          <span>🏦 <strong>Contas:</strong> ${tableCounts.accounts || 0}</span>
          <span>•</span>
          <span>🔄 <strong>Recorrências:</strong> ${tableCounts.recurring_items || 0}</span>
          <span>•</span>
          <span>🛡️ <strong>Logs Auditoria:</strong> ${tableCounts.audit_logs || 0}</span>
          <span>•</span>
          <span>👥 <strong>Usuários:</strong> ${tableCounts.users || 0}</span>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<span style="color:#f87171">Erro ao carregar métricas: ${err.message}</span>`;
    }
  };

  document.getElementById('btn-refresh-metrics')?.addEventListener('click', loadSqliteMetrics);
  loadSqliteMetrics();

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
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.add('active');
  }
  currentSignUpStep = 1;
  signupFamilyId = null;
  updateSignUpWizardUI();

  // Clear inputs
  const fn = document.getElementById('wiz-first-name'); if (fn) fn.value = '';
  const ln = document.getElementById('wiz-last-name'); if (ln) ln.value = '';
  const cpf = document.getElementById('wiz-cpf'); if (cpf) cpf.value = '';
  const bd = document.getElementById('wiz-birth-date'); if (bd) bd.value = '';
  const em = document.getElementById('wiz-email'); if (em) em.value = '';
  const ph = document.getElementById('wiz-phone'); if (ph) ph.value = '';
  const fam = document.getElementById('wiz-family-name'); if (fam) fam.value = '';
  const un = document.getElementById('wiz-username'); if (un) un.value = '';
  const pw = document.getElementById('wiz-password'); if (pw) pw.value = '';
  const err = document.getElementById('wiz-error-text'); if (err) err.textContent = '';

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
        const wizOverlay = document.getElementById('signup-wizard-overlay');
        if (wizOverlay) {
          wizOverlay.classList.remove('active');
          setTimeout(() => { if (!wizOverlay.classList.contains('active')) wizOverlay.style.display = 'none'; }, 300);
        }
        
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
const menuBtn = document.getElementById('titlebar-menu-btn');
if (menuBtn) {
  menuBtn.onclick = (e) => {
    e.stopPropagation();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  };
}

// Close sidebar when clicking any navigation link
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  });
});

// Close sidebar when clicking anywhere on the main content area
const mainContentEl = document.getElementById('main-content');
if (mainContentEl) {
  mainContentEl.onclick = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
  };
}

// Register PWA Service Worker only on HTTPS or unregister stale local workers
if ('serviceWorker' in navigator && !window.api.isElectron) {
  if (window.location.protocol === 'https:' && !window.location.hostname.includes('192.168.') && !window.location.hostname.includes('127.0.0.1') && window.location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registrado:', reg.scope))
        .catch(err => console.error('Falha ao registrar Service Worker:', err));
    });
  } else {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (const reg of regs) reg.unregister();
    }).catch(() => {});
  }
}


/* ==== mobile-shell.js ==== */
/**
 * src/renderer/js/modules/mobile-shell.js
 * Gerenciamento do Ambiente Operacional Mobile, Bottom Navigation Bar, FAB e Ações Rápidas.
 */

const MobileShell = {
  isMobile: false,

  init() {
    this.detectDevice();
    this.initBottomNav();
    this.initFab();
    this.initMoreDrawer();
    this.hookPageChanges();

    window.addEventListener('resize', () => this.detectDevice());
    window.addEventListener('orientationchange', () => this.detectDevice());
  },

  detectDevice() {
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenMobile = window.matchMedia('(max-width: 768px)').matches;
    const touchPointer = window.matchMedia('(pointer: coarse)').matches;

    this.isMobile = userAgentMobile || screenMobile || (touchPointer && window.innerWidth <= 1024);

    if (this.isMobile) {
      document.body.classList.add('is-mobile-env');
      document.documentElement.classList.add('is-mobile-env');
    } else {
      document.body.classList.remove('is-mobile-env');
      document.documentElement.classList.remove('is-mobile-env');
    }
  },

  initBottomNav() {
    const navTabs = document.querySelectorAll('.mobile-nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const page = tab.dataset.page;
        const action = tab.dataset.action;

        if (action === 'more') {
          this.toggleMoreDrawer(true);
          return;
        }

        if (page) {
          this.toggleMoreDrawer(false);
          this.toggleFabMenu(false);

          // Atualizar tabs visuais
          navTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Chamar a navegação nativa do app
          if (typeof navigate === 'function') {
            navigate(page);
          } else {
            const desktopNavBtn = document.getElementById(`nav-${page}`);
            if (desktopNavBtn) desktopNavBtn.click();
          }
        }
      });
    });
  },

  initFab() {
    const fabBtn = document.getElementById('mobile-quick-fab');
    const fabMenu = document.getElementById('mobile-fab-menu');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');

    if (!fabBtn) return;

    fabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = fabMenu?.classList.contains('open');
      this.toggleFabMenu(!isOpen);
    });

    fabBackdrop?.addEventListener('click', () => {
      this.toggleFabMenu(false);
    });

    // Itens do Speed Dial FAB
    document.querySelectorAll('.mobile-fab-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.toggleFabMenu(false);

        if (action === 'expense') {
          if (typeof openAvulsoModal === 'function') {
            openAvulsoModal('expense');
          } else {
            const btn = document.getElementById('btn-new-expense') || document.getElementById('btn-quick-expense');
            btn?.click();
          }
        } else if (action === 'income') {
          if (typeof openAvulsoModal === 'function') {
            openAvulsoModal('income');
          } else {
            const btn = document.getElementById('btn-new-income') || document.getElementById('btn-quick-income');
            btn?.click();
          }
        } else if (action === 'scanner') {
          if (typeof openNfceScannerModal === 'function') {
            openNfceScannerModal();
          } else {
            const btn = document.getElementById('btn-scan-nfce');
            btn?.click();
          }
        } else if (action === 'recurring') {
          if (typeof openRecurringModal === 'function') {
            openRecurringModal();
          } else {
            const btn = document.getElementById('btn-new-recurring');
            btn?.click();
          }
        }
      });
    });
  },

  toggleFabMenu(show) {
    const fabMenu = document.getElementById('mobile-fab-menu');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');
    const fabBtn = document.getElementById('mobile-quick-fab');

    if (show) {
      fabMenu?.classList.add('open');
      fabBackdrop?.classList.add('open');
      if (fabBtn) fabBtn.style.transform = 'rotate(45deg) scale(0.95)';
    } else {
      fabMenu?.classList.remove('open');
      fabBackdrop?.classList.remove('open');
      if (fabBtn) fabBtn.style.transform = 'none';
    }
  },

  initMoreDrawer() {
    const backdrop = document.getElementById('mobile-more-backdrop');
    backdrop?.addEventListener('click', () => this.toggleMoreDrawer(false));

    document.querySelectorAll('.mobile-more-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        const action = item.dataset.action;
        this.toggleMoreDrawer(false);

        if (page) {
          if (typeof navigate === 'function') {
            navigate(page);
          } else {
            const desktopNavBtn = document.getElementById(`nav-${page}`);
            if (desktopNavBtn) desktopNavBtn.click();
          }
        } else if (action === 'theme') {
          const themeBtn = document.getElementById('app-theme-toggle');
          themeBtn?.click();
        } else if (action === 'sync') {
          const syncBtn = document.getElementById('sidebar-sync-btn');
          syncBtn?.click();
        } else if (action === 'logout') {
          const logoutBtn = document.getElementById('sidebar-logout');
          logoutBtn?.click();
        }
      });
    });
  },

  toggleMoreDrawer(show) {
    const drawer = document.getElementById('mobile-more-drawer');
    const backdrop = document.getElementById('mobile-more-backdrop');

    if (show) {
      drawer?.classList.add('open');
      backdrop?.classList.add('open');
    } else {
      drawer?.classList.remove('open');
      backdrop?.classList.remove('open');
    }
  },

  syncActiveTab(pageId) {
    const navTabs = document.querySelectorAll('.mobile-nav-tab');
    navTabs.forEach(t => {
      if (t.dataset.page === pageId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  },

  hookPageChanges() {
    // Observar mudanças de classe na main-content ou interceptar cliques na sidebar
    const observer = new MutationObserver(() => {
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        const pageId = activePage.id.replace('page-', '');
        this.syncActiveTab(pageId);
      }
    });

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      observer.observe(mainContent, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  }
};

// Inicialização automática quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileShell.init());
} else {
  MobileShell.init();
}


/* ==== mobile-quick-entry.js ==== */
/**
 * src/renderer/js/modules/mobile-quick-entry.js
 * Bottom Sheet de Lançamento Rápido — Fase 2 do Redesign UX Mobile
 *
 * Features:
 * - Tipo toggle (Despesa/Receita) com 1 toque
 * - Valor grande com inputmode="decimal" (teclado nativo do sistema)
 * - Grid de chips de categoria com emoji (4 colunas, 8+ categorias)
 * - Conta e descrição pré-preenchidos com defaults inteligentes
 * - Botão Salvar sempre na zona quente
 * - Haptic feedback na confirmação
 */

const MobileQuickEntry = (() => {
  let _overlay = null;
  let _currentType = 'expense';
  let _selectedCatId = null;
  let _presetAccountId = null;

  function _getOverlay() {
    if (!_overlay) {
      _overlay = document.getElementById('mobile-quick-entry-overlay');
    }
    return _overlay;
  }

  function open(type = 'expense', accountId = null) {
    _currentType      = type;
    _presetAccountId  = accountId;
    _selectedCatId    = null;

    _render();

    const overlay = _getOverlay();
    if (!overlay) return;

    // Animação de entrada
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });

    // Fechar ao tocar no backdrop
    overlay.addEventListener('click', _onBackdropClick);

    // Focus no campo de valor após animação
    setTimeout(() => {
      const amountInput = document.getElementById('qe-amount-input');
      if (amountInput) amountInput.focus({ preventScroll: true });
    }, 380);
  }

  function close() {
    const overlay = _getOverlay();
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.removeEventListener('click', _onBackdropClick);
  }

  function _onBackdropClick(e) {
    if (e.target === _getOverlay()) close();
  }

  function _render() {
    let overlay = _getOverlay();
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mobile-quick-entry-overlay';
      overlay.className = 'mobile-quick-entry-overlay';
      document.body.appendChild(overlay);
      _overlay = overlay;
    }

    const accounts   = (State.accounts || []).filter(a => a.type !== 'credit' && a.is_active);
    const creditCards = (State.accounts || []).filter(a => a.type === 'credit' && a.is_active);
    const allAccounts = [...accounts, ...creditCards];

    // Selecionar conta padrão
    let defaultAccountId = _presetAccountId;
    if (!defaultAccountId) {
      const lastUsed = localStorage.getItem('qe_last_account_id');
      defaultAccountId = lastUsed ? parseInt(lastUsed) : (allAccounts[0]?.id || '');
    }

    // Categorias — separar por tipo e ordenar por uso recente
    const cats = (State.categories || []).filter(c => {
      const t = c.type || 'expense';
      return t === _currentType || t === 'both';
    });

    // Pegar as 8 mais relevantes (primeiras da lista)
    const topCats  = cats.slice(0, 8);
    const moreCats = cats.slice(8);

    const catChipsHtml = topCats.map(cat => `
      <div class="qe-cat-chip ${_selectedCatId === cat.id ? 'selected' : ''}"
           data-cat-id="${cat.id}"
           onclick="MobileQuickEntry._selectCat(${cat.id})">
        <span class="qe-cat-emoji">${cat.icon || '📌'}</span>
        <span class="qe-cat-name">${(cat.name || '').split(' ')[0]}</span>
      </div>
    `).join('');

    const moreCatOption = moreCats.length > 0
      ? `<div class="qe-cat-chip" onclick="MobileQuickEntry._openFullModal()">
           <span class="qe-cat-emoji">⋯</span>
           <span class="qe-cat-name">Mais</span>
         </div>`
      : '';

    const accountOptions = allAccounts.map(a =>
      `<option value="${a.id}" ${a.id === defaultAccountId ? 'selected' : ''}>${a.name}</option>`
    ).join('');

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    overlay.innerHTML = `
      <div class="mobile-quick-entry-sheet" id="qe-sheet">
        <div class="quick-entry-handle"></div>

        <div class="quick-entry-header">
          <span class="quick-entry-title">
            ${_currentType === 'expense' ? '💸 Nova Despesa' : '💰 Nova Receita'}
          </span>
          <button class="quick-entry-close" onclick="MobileQuickEntry.close()" aria-label="Fechar">✕</button>
        </div>

        <!-- Toggle Tipo -->
        <div class="quick-entry-type-toggle">
          <button class="type-toggle-btn ${_currentType === 'expense' ? 'active-expense' : ''}"
                  onclick="MobileQuickEntry._switchType('expense')">
            💸 Despesa
          </button>
          <button class="type-toggle-btn ${_currentType === 'income' ? 'active-income' : ''}"
                  onclick="MobileQuickEntry._switchType('income')">
            💰 Receita
          </button>
        </div>

        <!-- Display do Valor -->
        <div class="quick-entry-amount-display">
          <div class="qe-amount-label">Valor</div>
          <input
            type="number"
            id="qe-amount-input"
            class="qe-amount-value ${_currentType}"
            inputmode="decimal"
            placeholder="0,00"
            min="0"
            step="0.01"
            style="
              background:transparent;border:none;outline:none;
              width:100%;text-align:center;font-size:36px;
              font-weight:900;letter-spacing:-0.03em;
              color:${_currentType === 'expense' ? '#ef4444' : '#10b981'};
              font-family:inherit;
            "
            oninput="MobileQuickEntry._onAmountChange(this)"
          />
        </div>

        <!-- Grid de Categorias -->
        <div class="quick-entry-cats">
          <div class="qe-cats-label">Categoria</div>
          <div class="qe-cats-grid" id="qe-cats-grid">
            ${catChipsHtml}${moreCatOption}
          </div>
        </div>

        <!-- Detalhes -->
        <div class="quick-entry-details">
          <div class="qe-field-row">
            <div class="qe-field">
              <label for="qe-account">Conta / Cartão</label>
              <select id="qe-account">${accountOptions}</select>
            </div>
            <div class="qe-field" style="max-width:120px;">
              <label for="qe-date">Data</label>
              <input type="date" id="qe-date" value="${todayStr}" />
            </div>
          </div>
          <div class="qe-field">
            <label for="qe-desc">Descrição (opcional)</label>
            <input type="text" id="qe-desc" placeholder="Ex: Supermercado, Aluguel..." autocomplete="off" />
          </div>
        </div>

        <!-- Botão Salvar -->
        <button
          class="quick-entry-submit ${_currentType === 'expense' ? 'submit-expense' : 'submit-income'}"
          id="qe-submit-btn"
          onclick="MobileQuickEntry._submit()">
          ${_currentType === 'expense' ? '💸 Salvar Despesa' : '💰 Salvar Receita'}
        </button>
      </div>
    `;

    // Stop click propagation no sheet para não fechar ao clicar dentro
    document.getElementById('qe-sheet')?.addEventListener('click', e => e.stopPropagation());
  }

  function _switchType(type) {
    _currentType   = type;
    _selectedCatId = null;
    _render();
    requestAnimationFrame(() => {
      _getOverlay()?.classList.add('open');
      setTimeout(() => {
        document.getElementById('qe-amount-input')?.focus({ preventScroll: true });
      }, 100);
    });
  }

  function _selectCat(catId) {
    _selectedCatId = _selectedCatId === catId ? null : catId;
    document.querySelectorAll('.qe-cat-chip').forEach(chip => {
      chip.classList.toggle('selected', parseInt(chip.dataset.catId) === _selectedCatId);
    });
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function _onAmountChange(input) {
    const val = parseFloat(input.value) || 0;
    input.style.color = val === 0 ? 'var(--text-muted)' : _currentType === 'expense' ? '#ef4444' : '#10b981';
  }

  function _openFullModal() {
    close();
    setTimeout(() => openAvulsoModal(_currentType), 350);
  }

  async function _submit() {
    const amountRaw  = parseFloat(document.getElementById('qe-amount-input')?.value || '0');
    const accountId  = parseInt(document.getElementById('qe-account')?.value || '0');
    const date       = document.getElementById('qe-date')?.value;
    const description = document.getElementById('qe-desc')?.value?.trim() || '';

    if (!amountRaw || amountRaw <= 0) {
      const input = document.getElementById('qe-amount-input');
      if (input) {
        input.style.border = '2px solid #ef4444';
        input.focus();
      }
      return;
    }

    const btn = document.getElementById('qe-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Salvando...';
    }

    try {
      // Salvar conta usada para próximo lançamento
      if (accountId) localStorage.setItem('qe_last_account_id', accountId);

      await window.api.transactions.create({
        account_id:  accountId,
        category_id: _selectedCatId || null,
        type:        _currentType,
        amount:      amountRaw,
        date:        date || new Date().toISOString().split('T')[0],
        description: description || (_currentType === 'expense' ? 'Despesa' : 'Receita'),
        is_paid:     1,
        is_avulso:   1,
        user_id:     State.user?.id || 1,
        family_id:   State.family?.id || 1,
      });

      if (navigator.vibrate) navigator.vibrate([30, 20, 60]);

      close();

      // Recarregar dashboard
      setTimeout(() => {
        if (typeof renderMobileAppDashboard === 'function') {
          renderMobileAppDashboard(document.getElementById('page-dashboard'));
        }
      }, 400);

    } catch (err) {
      console.error('[MobileQuickEntry] Erro ao salvar:', err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '❌ Erro — Tentar Novamente';
      }
    }
  }

  // Exportar API pública
  return { open, close, _selectCat, _switchType, _openFullModal, _submit, _onAmountChange };
})();


/* ==== mobile-dashboard.js ==== */
/**
 * src/renderer/js/modules/mobile-dashboard.js
 * Dashboard Mobile Premium — Redesign UX v2.0
 *
 * Melhorias implementadas:
 * - Fase 1: Ações rápidas movidas para Bottom Action Bar (zona quente do polegar)
 * - Fase 3: Swipe-to-pay nos cards de transação
 * - Fase 4: Carrossel adaptativo (85vw) com dots indicadores e grid 2×2 nos cartões
 * - Fase 5: Micro-animações de entrada (slide-up-fade via CSS)
 */

async function renderMobileAppDashboard(container) {
  if (!container) container = document.getElementById('page-dashboard');
  if (!container) return;

  const currentMonth = State.currentMonth || (new Date().getMonth() + 1);
  const currentYear  = State.currentYear  || new Date().getFullYear();
  const userId       = State.user?.id || 1;

  // Skeleton enquanto carrega
  container.innerHTML = `
    <div class="mobile-lean-container">
      <div class="skeleton-block" style="height:52px;margin-bottom:4px;"></div>
      <div class="skeleton-block" style="height:150px;"></div>
      <div class="skeleton-block" style="height:18px;width:120px;margin-top:8px;"></div>
      <div class="skeleton-block" style="height:150px;"></div>
      <div class="skeleton-block" style="height:18px;width:120px;margin-top:8px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
    </div>
  `;

  const [summary, recurringItems] = await Promise.all([
    window.api.dashboard.getSummary({ userId, month: currentMonth, year: currentYear }),
    window.api.recurring.getAll({ userId, month: currentMonth, year: currentYear }).catch(() => [])
  ]);

  const accounts     = summary.accounts || [];
  const creditCards  = accounts.filter(a => a.type === 'credit');
  const bankAccounts = accounts.filter(a => a.type !== 'credit');

  const totalIncome   = summary.income   || 0;
  const totalExpense  = summary.expense  || 0;
  const totalBalance  = totalIncome - totalExpense;
  const totalPatrimony = summary.patrimony || 0;

  // Barra de progresso de orçamento (despesa/receita)
  const budgetPct   = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;
  const budgetColor = budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981';

  const monthNames  = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthShort  = `${monthNames[currentMonth]} ${currentYear}`;

  // ── Helper: data relativa ─────────────────────────────────
  function relativeDay(dueDay) {
    const today  = new Date();
    const target = new Date(currentYear, currentMonth - 1, dueDay);
    const diff   = Math.round((target - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff === -1) return 'Ontem';
    return `${dayNames[target.getDay()]}, ${dueDay}`;
  }

  // ── Separar transações em grupos ─────────────────────────
  const today      = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear  = today.getFullYear();

  function getGroup(dueDay) {
    if (currentYear === todayYear && currentMonth === todayMonth) {
      if (dueDay === todayDay)    return 'Hoje';
      if (dueDay === todayDay - 1) return 'Ontem';
      if (dueDay >= todayDay - 7)  return 'Esta Semana';
    }
    return 'Este Mês';
  }

  // ── HTML do carrossel de cartões ─────────────────────────
  function renderCreditCardSlider() {
    if (creditCards.length === 0) {
      return `<div class="empty-slider-box">
        <p>Nenhum cartão cadastrado.</p>
        <button class="btn btn-secondary btn-sm" onclick="openAccountModal('credit')">+ Adicionar Cartão</button>
      </div>`;
    }

    const dotsHtml = creditCards.length > 1
      ? `<div class="slider-dots" id="m-slider-dots">
          ${creditCards.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
        </div>`
      : '';

    const cardsHtml = creditCards.map((card, i) => {
      const limit       = card.credit_limit || 0;
      const invoiceAmt  = (summary.cardMonthlyInvoices?.[card.id] !== undefined)
        ? summary.cardMonthlyInvoices[card.id] : (card.current_invoice || 0);
      const committed   = (summary.cardSpending?.[card.id] !== undefined)
        ? summary.cardSpending[card.id] : (card.credit_used || invoiceAmt);
      const available   = limit - committed;
      const isExceeded  = limit > 0 && committed > limit;
      const pctUsed     = limit > 0 ? Math.min(100, Math.max(0, Math.round((committed / limit) * 100))) : 0;
      const statusColor = isExceeded || pctUsed > 85 ? '#ef4444' : pctUsed > 60 ? '#f59e0b' : '#10b981';

      let cardBg  = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      let bankTag = '💳 Cartão';
      const nm = card.name?.toLowerCase() || '';
      if (card.bank === 'nubank'      || nm.includes('nu'))         { cardBg = 'linear-gradient(135deg, #5b21b6 0%, #1e1b4b 100%)'; bankTag = '💜 Nubank'; }
      else if (card.bank === 'banrisul'    || nm.includes('banri'))  { cardBg = 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)'; bankTag = '💙 Banrisul'; }
      else if (card.bank === 'carrefour'   || nm.includes('carrefour')) { cardBg = 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)'; bankTag = '🔴 Carrefour'; }
      else if (card.bank === 'mercadopago' || nm.includes('mercado'))   { cardBg = 'linear-gradient(135deg, #065f46 0%, #022c22 100%)'; bankTag = '💛 Mercado Pago'; }
      else if (card.bank === 'itau'        || nm.includes('itaú'))   { cardBg = 'linear-gradient(135deg, #92400e 0%, #451a03 100%)'; bankTag = '🟠 Itaú'; }
      else if (card.bank === 'bradesco'    || nm.includes('bradesco')) { cardBg = 'linear-gradient(135deg, #991b1b 0%, #1e1b4b 100%)'; bankTag = '❤️ Bradesco'; }

      return `
        <div class="slider-card-item" data-card-idx="${i}" style="background: ${cardBg};">
          <div class="slider-card-top">
            <span class="slider-bank-tag">${bankTag}</span>
            <span class="slider-holder">${card.user_name ? card.user_name.split(' ')[0] : 'Titular'}</span>
          </div>

          <div class="slider-card-name">${card.name}</div>

          <!-- Grid 2×2 com dados financeiros -->
          <div class="slider-card-grid">
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Limite Total</div>
              <div class="slider-grid-value">${fmt.currency(limit)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Fatura ${monthNames[currentMonth]}</div>
              <div class="slider-grid-value" style="color:#f87171;">${fmt.currency(invoiceAmt)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Comprometido</div>
              <div class="slider-grid-value" style="color:${statusColor};">${fmt.currency(committed)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">${isExceeded ? '⚠️ Excedido' : 'Disponível'}</div>
              <div class="slider-grid-value" style="color:${available < 0 ? '#ef4444' : '#34d399'};">${fmt.currency(available)}</div>
            </div>
          </div>

          <!-- Barra de uso -->
          <div class="slider-bar-wrap">
            <div class="slider-bar-bg">
              <div class="slider-bar-fill" style="width:${pctUsed}%;background:${statusColor};"></div>
            </div>
            <div class="slider-bar-legend">
              <span>${pctUsed}% do limite usado</span>
              <span style="color:${statusColor};font-weight:700;">${isExceeded ? 'EXCEDIDO' : 'OK'}</span>
            </div>
          </div>

          <!-- Ação rápida no card -->
          <button class="slider-btn" onclick="openMobileQuickEntry('expense', ${card.id})">
            + Lançar no Cartão
          </button>
        </div>
      `;
    }).join('');

    return cardsHtml + dotsHtml;
  }

  // ── HTML das transações com swipe ────────────────────────
  function renderTxList() {
    if (recurringItems.length === 0) {
      return `<div class="empty-tx-box">
        <span>📑</span>
        <p>Nenhum lançamento em ${monthShort}.</p>
        <button class="btn btn-primary btn-sm" onclick="openMobileQuickEntry('expense')">+ Novo Lançamento</button>
      </div>`;
    }

    const items  = recurringItems.slice(0, 15);
    let lastGroup = null;
    let html = '';

    for (const item of items) {
      const group    = getGroup(item.due_day || 1);
      const isPaid   = item.is_paid === 1;
      const isExpense = item.type === 'expense';
      const amount   = item.amount || 0;
      const cat      = State.categories?.find(c => c.id === item.category_id);
      const catIcon  = cat?.icon || (isExpense ? '💸' : '💰');
      const relDay   = relativeDay(item.due_day || 1);

      // Cabeçalho de grupo
      if (group !== lastGroup) {
        html += `<div class="tx-group-header">${group}</div>`;
        lastGroup = group;
      }

      // Conta vinculada
      const linkedAcc = accounts.find(a => a.id === item.account_id);
      const accBadge  = linkedAcc
        ? `<span style="font-size:9px;font-weight:700;color:var(--text-muted);background:rgba(255,255,255,0.06);padding:1px 5px;border-radius:6px;margin-left:4px;">${linkedAcc.name.split(' ')[0]}</span>`
        : '';

      html += `
        <div class="lean-tx-item ${isPaid ? 'paid' : 'pending'}"
             data-item-id="${item.id}"
             data-is-paid="${isPaid ? '1' : '0'}"
             onclick="goToTransaction({ recurringId: ${item.id}, type: '${item.type}', month: ${currentMonth}, year: ${currentYear} })">

          <div class="lean-tx-swipe-reveal-pay">✓ Pagar</div>
          <div class="lean-tx-swipe-reveal-del">🗑 Excluir</div>

          <div class="lean-tx-left">
            <div class="lean-tx-icon">${catIcon}</div>
            <div>
              <div class="lean-tx-title">${item.name || item.description || 'Lançamento'}${accBadge}</div>
              <div class="lean-tx-sub">
                <span>${relDay}</span>
                <span>•</span>
                <span class="status-tag ${isPaid ? 'tag-paid' : 'tag-pending'}">${isPaid ? '✓ Pago' : '⏳ Aberto'}</span>
              </div>
            </div>
          </div>
          <div class="lean-tx-right">
            <div class="lean-tx-amount" style="color:${isExpense ? '#ef4444' : '#10b981'};font-weight:800;">
              ${isExpense ? '-' : '+'}${fmt.currency(amount)}
            </div>
            ${!isPaid ? `
              <button class="lean-pay-btn" onclick="event.stopPropagation(); openPaymentModal(${item.id})">
                Pagar
              </button>` : ''}
          </div>
        </div>
      `;
    }

    if (recurringItems.length > 15) {
      html += `
        <button class="block-link" style="width:100%;padding:10px;text-align:center;font-size:12px;"
          onclick="navigate('recurring')">
          Ver todos os ${recurringItems.length} lançamentos →
        </button>
      `;
    }

    return html;
  }

  // ── HTML Principal ────────────────────────────────────────
  const html = `
    <div class="mobile-lean-container">

      <!-- 1. Header: Avatar + Seletor de Mês -->
      <div class="mobile-lean-header">
        <div class="user-pill" onclick="openSettingsModal('profile')">
          ${renderAvatarHtml(State.user, 32)}
          <div class="user-pill-texts">
            <span class="user-greeting">Olá, ${(State.user?.name || 'Usuário').split(' ')[0]}</span>
            <span class="user-family-badge">${State.familyName || 'Família'}</span>
          </div>
        </div>
        <div class="mobile-compact-month">
          <button class="btn-compact-month" id="m-prev-month" aria-label="Mês anterior">‹</button>
          <span class="compact-month-text">${monthShort}</span>
          <button class="btn-compact-month" id="m-next-month" aria-label="Próximo mês">›</button>
        </div>
      </div>

      <!-- 2. Hero Card Informacional -->
      <div class="mobile-hero-balance-card">
        <div class="hero-balance-header">
          <span class="hero-balance-label">Saldo do Mês</span>
          <span class="hero-patrimony-badge" title="Patrimônio Líquido">Patrimônio: ${fmt.currency(totalPatrimony)}</span>
        </div>

        <div class="hero-balance-value" style="color:${totalBalance >= 0 ? '#10b981' : '#ef4444'};">
          ${fmt.currency(totalBalance)}
        </div>

        <div class="hero-inout-row">
          <div class="hero-inout-item">
            <span class="inout-label">💰 Receitas</span>
            <span class="inout-val inout-inc">+${fmt.currency(totalIncome)}</span>
          </div>
          <div class="hero-inout-sep"></div>
          <div class="hero-inout-item">
            <span class="inout-label">💸 Despesas</span>
            <span class="inout-val inout-exp">-${fmt.currency(totalExpense)}</span>
          </div>
        </div>

        <!-- Barra de orçamento -->
        <div class="hero-budget-bar-wrap">
          <div class="hero-budget-labels">
            <span>Orçamento utilizado</span>
            <span style="font-weight:800;color:${budgetColor};">${budgetPct}%</span>
          </div>
          <div class="hero-budget-bar-bg">
            <div class="hero-budget-bar-fill" style="width:${budgetPct}%;background:${budgetColor};"></div>
          </div>
        </div>
      </div>

      <!-- 3. Cartões de Crédito (carrossel 85vw + dots) -->
      <div class="mobile-block-header">
        <div class="block-title-wrap">
          <span class="block-title">💳 Meus Cartões</span>
          <span class="block-badge">${creditCards.length}</span>
        </div>
        <button class="block-link" onclick="navigate('accounts')">Ver Faturas →</button>
      </div>
      <div class="mobile-cards-slider" id="m-cards-slider">
        ${renderCreditCardSlider()}
      </div>

      <!-- 4. Contas & Saldos -->
      <div class="mobile-block-header" style="margin-top:14px;">
        <span class="block-title">🏦 Contas & Saldos</span>
        <button class="block-link" onclick="navigate('accounts')">Gerenciar →</button>
      </div>
      <div class="mobile-lean-accounts">
        ${bankAccounts.length === 0
          ? `<p style="font-size:12px;color:var(--text-muted);text-align:center;">Nenhuma conta cadastrada.</p>`
          : bankAccounts.map(acc => {
              const bal  = acc.balance || 0;
              let icon   = '🏦';
              if (acc.type === 'wallet')  icon = '💵';
              else if (acc.type === 'savings') icon = '🐖';
              return `
                <div class="lean-acc-row" onclick="navigate('accounts')">
                  <div class="lean-acc-left">
                    <div class="lean-acc-icon">${icon}</div>
                    <div>
                      <div class="lean-acc-name">${acc.name}</div>
                      <div class="lean-acc-owner">${acc.user_name ? acc.user_name.split(' ')[0] : 'Geral'}</div>
                    </div>
                  </div>
                  <div class="lean-acc-val" style="color:${bal < 0 ? '#ef4444' : '#10b981'};font-weight:800;">
                    ${fmt.currency(bal)}
                  </div>
                </div>`;
            }).join('')}
      </div>

      <!-- 5. Lançamentos do Mês -->
      <div class="mobile-block-header" style="margin-top:14px;">
        <span class="block-title">📋 Lançamentos (${recurringItems.length})</span>
        <button class="block-link" onclick="navigate('recurring')">Ver Todos →</button>
      </div>
      <div class="mobile-lean-tx-list" id="m-tx-list">
        ${renderTxList()}
      </div>

    </div>

    <!-- Bottom Action Bar (zona quente do polegar) -->
    <div class="mobile-action-bar" id="m-action-bar">
      <button class="action-bar-btn action-bar-expense" id="m-ab-expense" aria-label="Nova Despesa">
        <span class="action-bar-btn-icon">💸</span>
        <span>Despesa</span>
      </button>
      <button class="action-bar-btn action-bar-income" id="m-ab-income" aria-label="Nova Receita">
        <span class="action-bar-btn-icon">💰</span>
        <span>Receita</span>
      </button>
      <button class="action-bar-btn action-bar-scanner" id="m-ab-scanner" aria-label="Escanear Cupom">
        📷
      </button>
    </div>
  `;

  container.innerHTML = html;

  // ── Event Listeners ───────────────────────────────────────

  // Bottom Action Bar
  document.getElementById('m-ab-expense')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openMobileQuickEntry('expense');
  });
  document.getElementById('m-ab-income')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openMobileQuickEntry('income');
  });
  document.getElementById('m-ab-scanner')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openNfceScannerModal();
  });

  // Navegação de mês
  document.getElementById('m-prev-month')?.addEventListener('click', () => {
    let m = State.currentMonth - 1, y = State.currentYear;
    if (m < 1) { m = 12; y--; }
    State.currentMonth = m; State.currentYear = y;
    renderMobileAppDashboard(container);
  });
  document.getElementById('m-next-month')?.addEventListener('click', () => {
    let m = State.currentMonth + 1, y = State.currentYear;
    if (m > 12) { m = 1; y++; }
    State.currentMonth = m; State.currentYear = y;
    renderMobileAppDashboard(container);
  });

  // Dots do carrossel sincronizados com scroll
  const slider = document.getElementById('m-cards-slider');
  const dotsContainer = document.getElementById('m-slider-dots');
  if (slider && dotsContainer && creditCards.length > 1) {
    slider.addEventListener('scroll', () => {
      const scrollLeft   = slider.scrollLeft;
      const cardWidth    = slider.querySelector('.slider-card-item')?.offsetWidth || 1;
      const activeIdx    = Math.round(scrollLeft / (cardWidth + 10));
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIdx);
      });
    }, { passive: true });

    dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx       = parseInt(dot.dataset.idx);
        const cardWidth = slider.querySelector('.slider-card-item')?.offsetWidth || 260;
        slider.scrollTo({ left: idx * (cardWidth + 10), behavior: 'smooth' });
      });
    });
  }

  // Swipe-to-pay nos itens da lista
  document.querySelectorAll('.lean-tx-item').forEach(item => {
    if (item.dataset.isPaid === '1') return; // só pendentes podem ser "pagos"

    let startX = 0, currentX = 0, isDragging = false;
    const THRESHOLD = 70; // px para acionar

    item.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = false;
    }, { passive: true });

    item.addEventListener('touchmove', e => {
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      if (Math.abs(diffX) > 8) {
        isDragging = true;
        // Limitar swipe entre -120px e 120px
        const clampedX = Math.max(-120, Math.min(120, diffX));
        item.style.transform = `translateX(${clampedX}px)`;
        item.style.transition = 'none';
      }
    }, { passive: true });

    item.addEventListener('touchend', () => {
      const diffX = currentX - startX;
      item.style.transition = 'transform 0.25s ease';
      item.style.transform  = 'translateX(0)';

      if (isDragging && diffX > THRESHOLD) {
        // Swipe direita = Pagar
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
        const itemId = parseInt(item.dataset.itemId);
        item.style.opacity = '0.5';
        setTimeout(() => openPaymentModal(itemId), 200);
      }
      isDragging = false;
    }, { passive: true });
  });
}

/**
 * Abre o Quick Entry Sheet mobile (Fase 2)
 * Fallback para o modal desktop se o módulo não estiver carregado.
 */
function openMobileQuickEntry(type = 'expense', accountId = null) {
  if (typeof MobileQuickEntry !== 'undefined' && MobileShell.isMobile) {
    MobileQuickEntry.open(type, accountId);
  } else {
    openAvulsoModal(type, null, null, type, accountId ? { accountId } : null);
  }
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

