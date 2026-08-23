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