/**
 * scripts/split-large-modules.js
 * Segunda passagem de extração — subdivide os módulos ainda grandes.
 */
const fs = require('fs');
const path = require('path');

const MOD_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');

function splitFile(srcName, cuts) {
  const srcPath = path.join(MOD_DIR, srcName);
  const allLines = fs.readFileSync(srcPath, 'utf8').split('\n');
  console.log(`\n📄 ${srcName}: ${allLines.length} linhas`);

  const outNames = [];
  for (const { name, start, end } of cuts) {
    const lines = allLines.slice(start - 1, end);
    const outPath = path.join(MOD_DIR, `${name}.js`);
    const header = `/* =============================================\n * Módulo: ${name}.js\n * Extraído de ${srcName} (linhas ${start}–${end})\n * ============================================= */\n\n`;
    fs.writeFileSync(outPath, header + lines.join('\n'), 'utf8');
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  ✅ ${name}.js — ${lines.length} linhas (${kb} KB)`);
    outNames.push(name);
  }

  // Remove o arquivo original grande
  fs.unlinkSync(srcPath);
  console.log(`  🗑️  ${srcName} removido (substituído por módulos menores)`);
  return outNames;
}

// ── Subdivisão do settings.js (1451 → 2 módulos) ──────────────────
const settingsParts = splitFile('settings.js', [
  { name: 'settings-modal',  start: 1,    end: 1102 },  // renderSettings + openSettingsModal (HTML do modal)
  { name: 'settings-tabs',   start: 1103, end: 1451 },  // bindProfileTabEvents, bindBackupTabEvents, bindLgpdTabEvents, openCategoryModal
]);

// ── Subdivisão do dashboard.js (1150 → 2 módulos) ─────────────────
const dashboardParts = splitFile('dashboard.js', [
  { name: 'dashboard-main',    start: 1,   end: 610  },  // renderDashboard principal (layout, KPIs, alertas)
  { name: 'dashboard-widgets', start: 611, end: 1150 },  // renderCreditCardWidget, renderDebitAccountWidget, charts, renderRecurring, setupDragAndDrop
]);

// ── Subdivisão do planning.js (1007 → 2 módulos) ──────────────────
// planning.js precisa ser lido primeiro para encontrar o ponto de corte
const planningPath = path.join(MOD_DIR, 'planning.js');
const planningContent = fs.readFileSync(planningPath, 'utf8').split('\n');
console.log(`\n📄 planning.js: ${planningContent.length} linhas`);
// Deixamos planning.js como está (1007 linhas) — pouco acima de 1000, aceitável

// Atualiza o app-entry.js com os novos nomes de módulos
const entryPath = path.join(MOD_DIR, 'app-entry.js');
const entry = fs.readFileSync(entryPath, 'utf8');

let newEntry = entry;
// Substitui dashboard.js por dashboard-main.js + dashboard-widgets.js
newEntry = newEntry.replace(
  `import './dashboard.js';`,
  `import './dashboard-main.js';\nimport './dashboard-widgets.js';`
);
// Substitui settings.js por settings-modal.js + settings-tabs.js
newEntry = newEntry.replace(
  `import './settings.js';`,
  `import './settings-modal.js';\nimport './settings-tabs.js';`
);

fs.writeFileSync(entryPath, newEntry, 'utf8');
console.log('\n📦 app-entry.js atualizado com novos módulos');
console.log('\n✅ Subdivisão concluída!');
