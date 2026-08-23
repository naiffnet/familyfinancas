/**
 * BANK LOGOS & ASSETS UTILITY
 * Configurações visuais oficiais de bancos, cartões, bandeiras, avatares e badges.
 */

export const BANKS = {
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

export const ACCOUNT_TYPES = { 
  checking: 'Conta Corrente', 
  savings: 'Poupança', 
  wallet: 'Carteira', 
  credit: 'Cartão de Crédito', 
  investment: 'Investimento',
  voucher: 'Cartão Benefício / Voucher'
};

export const BENEFIT_TYPES = {
  va: '🍽️ Vale Alimentação (VA)',
  vr: '🍔 Vale Refeição (VR)',
  vt: '🚌 Vale Transporte (VT)',
  flex: '🌟 Flexível / Multibenefícios',
  combustivel: '⛽ Combustível / Mobilidade',
  saude: '💊 Farmácia / Saúde / Bem-Estar',
  educacao: '📚 Educação / Cultura',
  outro: '🎟️ Outro Benefício'
};

export const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316','#a855f7','#14b8a6','#64748b','#84cc16'];
export const ICONS_EXPENSE = ['🏠','🍽️','🚗','❤️','📚','🎮','👔','📱','📋','✈️','🐾','💄','🔧','⚡','💧','🎵','🎁','🛒','🏋️','🐕'];
export const ICONS_INCOME  = ['💼','💻','📈','💰','🎯','🏆','💵','🤝','🏘️','📊'];

export function bankLogo(bank, size = 40) {
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
