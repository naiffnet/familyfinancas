/**
 * scripts/cut-manual.js
 * Corta manual.js em 2 partes e regenera o bundle.
 */
const fs = require('fs');
const path = require('path');
const MOD_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');
const CONCAT_OUT = path.join(__dirname, '..', 'src', 'renderer', 'app.bundle.js');

const manPath = path.join(MOD_DIR, 'manual.js');
const manLines = fs.readFileSync(manPath, 'utf8').split('\n');
console.log('manual.js:', manLines.length, 'linhas');

// Encontra ponto de corte natural perto da linha 500
let cutAt = 500;
for (let i = 500; i < 600; i++) {
  const l = manLines[i] || '';
  if (/^function |^async function|^\/\/ ====/.test(l)) { cutAt = i; break; }
}
console.log('Ponto de corte:', cutAt);

const partA = manLines.slice(0, cutAt);
const partB = manLines.slice(cutAt);

fs.writeFileSync(path.join(MOD_DIR, 'manual-a.js'), '/* manual-a.js - parte 1/2 */\n\n' + partA.join('\n'), 'utf8');
fs.writeFileSync(path.join(MOD_DIR, 'manual-b.js'), '/* manual-b.js - parte 2/2 */\n\n' + partB.join('\n'), 'utf8');
fs.unlinkSync(manPath);
console.log('manual-a.js:', partA.length, 'linhas');
console.log('manual-b.js:', partB.length, 'linhas');

// Update app-entry.js
const entryPath = path.join(MOD_DIR, 'app-entry.js');
let entry = fs.readFileSync(entryPath, 'utf8');
entry = entry.replace("import './manual.js';", "import './manual-a.js';\nimport './manual-b.js';");
fs.writeFileSync(entryPath, entry, 'utf8');

// Rebuild bundle
const moduleOrder = entry.split('\n')
  .filter(l => l.startsWith("import './"))
  .map(l => l.match(/import '\.\/(.+?)'/)[1]);

const parts = ['/* app.bundle.js - ' + new Date().toISOString() + ' */\n'];
moduleOrder.forEach(m => {
  const p = path.join(MOD_DIR, m);
  if (fs.existsSync(p)) parts.push('\n/* -- ' + m + ' -- */\n' + fs.readFileSync(p, 'utf8'));
});
fs.writeFileSync(CONCAT_OUT, parts.join('\n'), 'utf8');
console.log('Bundle OK:', (fs.statSync(CONCAT_OUT).size / 1024).toFixed(1), 'KB');

// Relatório final
const allMods = fs.readdirSync(MOD_DIR)
  .filter(f => f.endsWith('.js') && f !== 'app-entry.js')
  .map(f => ({ f, l: fs.readFileSync(path.join(MOD_DIR, f), 'utf8').split('\n').length }))
  .sort((a, b) => b.l - a.l);

const over = allMods.filter(m => m.l > 1000);
if (over.length === 0) {
  console.log('\n✅ TODOS os modulos estao <= 1000 linhas!');
} else {
  over.forEach(m => console.log('AVISO:', m.f, m.l, 'linhas'));
}
console.log('\nResumo:');
allMods.forEach(m => console.log(String(m.l).padStart(4), m.f));
