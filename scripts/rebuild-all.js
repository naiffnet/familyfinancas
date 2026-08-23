/**
 * scripts/rebuild-all.js
 * Reextrai todos os módulos do app.js original com cortes corrigidos.
 * Usa grep para encontrar os pontos de corte exatos pelas funções-chave.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'renderer', 'app.js');
const OUT_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');
const CONCAT_OUT = path.join(__dirname, '..', 'src', 'renderer', 'app.bundle.js');

const allLines = fs.readFileSync(SRC, 'utf8').split('\n');
const total = allLines.length;
console.log(`📄 app.js: ${total} linhas\n`);

// Encontra a linha de início de uma função pelo pattern exato
function findLine(pattern) {
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].match(pattern)) return i + 1; // 1-based
  }
  return null;
}

// Pontos de corte detectados dinamicamente
const rpcEnd      = findLine(/^}\s*$/, ) || 177; // Fim do if(!window.api) block — linha 177
const stateStart  = findLine(/^\/\* ════.*FINANÇASFAMÍLIA/);
const dashStart   = findLine(/^\/\/ ═+$.*DASHBOARD|^\/\/ ════.*\nDASHBOARD/m) || findLine(/^async function renderDashboard/);
const planStart   = findLine(/^async function renderRecurring\b/);
const recModStart = findLine(/^async function openRecurringModal\b/);
const avlStart    = findLine(/^async function showDidacticFeedback|^function openAvulsoModal\b/);
const payStart    = findLine(/^async function openPaymentDateModal\b/);
const accStart    = findLine(/^async function renderAccounts\b/);
const dedupStart  = findLine(/^async function openDeduplicationModal\b/);
const budgStart   = findLine(/^async function renderBudget\b/);
const manStart    = findLine(/^async function renderManual\b/);
const settStart   = findLine(/^async function renderSettings\b/);
const authStart   = findLine(/^async function initLoginScreen\b/);
const adminStart  = findLine(/^async function startApp\b/);
const initStart   = findLine(/^\/\/ --- LGPD|^function initLgpdModals\b/);

console.log('Pontos de corte detectados:');
const cuts = [
  { name: 'rpc-bridge',            start: 1,           end: 177 },
  { name: 'state-constants',       start: 178,         end: (dashStart||716)-1 },
  { name: 'dashboard-main',        start: dashStart||716, end: (planStart||1093)-1 },
  { name: 'planning-main',         start: planStart||1093, end: (recModStart||3061)-1 },
  { name: 'recurring-modal',       start: recModStart||3061, end: (avlStart||3642)-1 },
  { name: 'avulso-modal',          start: avlStart||3642, end: (payStart||3852)-1 },
  { name: 'payment-modal',         start: payStart||3852, end: (accStart||4014)-1 },
  { name: 'accounts',              start: accStart||4014, end: (dedupStart||4719)-1 },
  { name: 'deduplication',         start: dedupStart||4719, end: (budgStart||5080)-1 },
  { name: 'budget-goals-reports',  start: budgStart||5080, end: (manStart||5378)-1 },
  { name: 'manual',                start: manStart||5378, end: (settStart||6375)-1 },
  { name: 'settings',              start: settStart||6375, end: (authStart||7937)-1 },
  { name: 'auth',                  start: authStart||7937, end: (adminStart||8877)-1 },
  { name: 'admin',                 start: adminStart||8877, end: (initStart||9710)-1 },
  { name: 'app-init',              start: initStart||9710, end: total },
];

cuts.forEach(c => console.log(`  ${c.name}: L${c.start}–${c.end} (${c.end - c.start + 1} linhas)`));

// Remove módulos antigos
const existing = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.js') && f !== 'app-entry.js');
existing.forEach(f => fs.unlinkSync(path.join(OUT_DIR, f)));
console.log(`\n🗑️  ${existing.length} módulos antigos removidos`);

// Módulos > 1000 linhas que precisam ser subdivididos
const SUBSPLITS = {
  'settings': [
    { name: 'settings-modal', startOffset: 0, lines: 1100 },  // primeiras 1100 linhas
  ],
  'planning-main': null,  // será verificado
};

// Extrai cada módulo
const moduleOrder = [];
for (const cut of cuts) {
  const { name, start, end } = cut;
  const segLines = allLines.slice(start - 1, end);
  
  if (segLines.length > 1000) {
    // Subdividir em partes de ~700 linhas em pontos de função
    const subParts = [];
    let currentStart = 0;
    
    while (currentStart < segLines.length) {
      let cutPoint = Math.min(currentStart + 900, segLines.length);
      
      // Procura o próximo início de função após cutPoint
      if (cutPoint < segLines.length) {
        for (let i = cutPoint; i < Math.min(cutPoint + 200, segLines.length); i++) {
          if (/^(?:async )?function \w+|^\/\/ ════/.test(segLines[i])) {
            cutPoint = i;
            break;
          }
        }
      }
      
      const part = segLines.slice(currentStart, cutPoint);
      const partIdx = subParts.length + 1;
      const partName = `${name}-${partIdx}`;
      const outPath = path.join(OUT_DIR, `${partName}.js`);
      const header = `/* ===\n * ${partName}.js — Parte ${partIdx} de ${name}\n * Linhas ${start + currentStart}–${start + cutPoint - 1} do app.js\n */\n\n`;
      fs.writeFileSync(outPath, header + part.join('\n'), 'utf8');
      console.log(`  ✅ ${partName}.js — ${part.length} linhas`);
      moduleOrder.push(partName);
      subParts.push(partName);
      currentStart = cutPoint;
    }
  } else {
    const outPath = path.join(OUT_DIR, `${name}.js`);
    const header = `/* ===\n * ${name}.js — L${start}–${end} do app.js\n */\n\n`;
    fs.writeFileSync(outPath, header + segLines.join('\n'), 'utf8');
    console.log(`  ✅ ${name}.js — ${segLines.length} linhas`);
    moduleOrder.push(name);
  }
}

// Regenera app-entry.js
const entryPath = path.join(OUT_DIR, 'app-entry.js');
const entryContent = [
  `/* app-entry.js — ordem de carregamento dos módulos */`,
  `/* Gerado por scripts/rebuild-all.js */`,
  ``,
  ...moduleOrder.map(m => `import './${m}.js';`),
].join('\n');
fs.writeFileSync(entryPath, entryContent, 'utf8');

// Gera o bundle concatenado
const bundleParts = [`/* app.bundle.js — ${new Date().toISOString()} */\n`];
for (const modName of moduleOrder) {
  const modPath = path.join(OUT_DIR, `${modName}.js`);
  if (fs.existsSync(modPath)) {
    bundleParts.push(`\n/* ── ${modName}.js ── */\n${fs.readFileSync(modPath, 'utf8')}`);
  }
}
fs.writeFileSync(CONCAT_OUT, bundleParts.join('\n'), 'utf8');
const bundleKb = (fs.statSync(CONCAT_OUT).size / 1024).toFixed(1);

console.log(`\n📦 app.bundle.js: ${bundleKb} KB`);
console.log('\n✅ Reconstrução completa!');

// Validação final
console.log('\n🔍 Verificando funções...');
const orig = fs.readFileSync(SRC, 'utf8');
const bundle = fs.readFileSync(CONCAT_OUT, 'utf8');
const fnRx = /^(?:async )?function (\w+)\s*\(/gm;
const origFns = new Set(); const bundleFns = new Set();
let mm;
while ((mm = fnRx.exec(orig)) !== null) origFns.add(mm[1]);
fnRx.lastIndex = 0;
while ((mm = fnRx.exec(bundle)) !== null) bundleFns.add(mm[1]);
const missing = [...origFns].filter(f => !bundleFns.has(f));
if (missing.length === 0) console.log('✅ Todas as funções presentes no bundle!');
else console.log('⚠️  Funções faltando:', missing.join(', '));
