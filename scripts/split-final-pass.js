/**
 * scripts/split-final-pass.js
 * Terceira passagem — subdivide settings-modal.js e planning.js
 */
const fs = require('fs');
const path = require('path');

const MOD_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');

function splitFile(srcName, cuts) {
  const srcPath = path.join(MOD_DIR, srcName);
  const allLines = fs.readFileSync(srcPath, 'utf8').split('\n');
  console.log(`\n📄 ${srcName}: ${allLines.length} linhas`);

  for (const { name, start, end } of cuts) {
    const lines = allLines.slice(start - 1, end);
    const outPath = path.join(MOD_DIR, `${name}.js`);
    const header = `/* =============================================\n * Módulo: ${name}.js\n * Extraído de ${srcName} (linhas ${start}–${end})\n * ============================================= */\n\n`;
    fs.writeFileSync(outPath, header + lines.join('\n'), 'utf8');
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  ✅ ${name}.js — ${lines.length} linhas (${kb} KB)`);
  }

  fs.unlinkSync(srcPath);
  console.log(`  🗑️  ${srcName} removido`);
}

// settings-modal.js (1102 linhas) → 2 partes
// openSettingsModal gera HTML de tab 'profile' + outros tabs inline.
// A função tem apenas 2 funções; o corte natural é pelo meio do corpo do modal (~linha 560)
// Vamos cortar em: settings-modal-html.js (HTML builder) + settings-modal-events.js (event binding)
// Como a função não tem divisão natural boa, usamos corte por linhas:
splitFile('settings-modal.js', [
  { name: 'settings-modal-a', start: 1,    end: 551  },  // renderSettings + primeira metade do openSettingsModal
  { name: 'settings-modal-b', start: 552,  end: 1116 },  // segunda metade do openSettingsModal (restante do modal HTML)
]);

// planning.js (1104 linhas) → 2 partes
splitFile('planning.js', [
  { name: 'planning-main',     start: 1,   end: 550  },  // renderRecurring, renderRecurringList, renderAvulsosList, toggleInvoiceHighlight
  { name: 'planning-invoices', start: 551, end: 1104 },  // applyTransactionAccountHighlight, renderInvoicesList, confirmReopenInvoice, openRenegotiateInvoiceModal
]);

// Atualiza app-entry.js
const entryPath = path.join(MOD_DIR, 'app-entry.js');
let entry = fs.readFileSync(entryPath, 'utf8');

entry = entry.replace(
  `import './settings-modal.js';`,
  `import './settings-modal-a.js';\nimport './settings-modal-b.js';`
);
entry = entry.replace(
  `import './planning.js';`,
  `import './planning-main.js';\nimport './planning-invoices.js';`
);

fs.writeFileSync(entryPath, entry, 'utf8');
console.log('\n📦 app-entry.js atualizado');
console.log('\n✅ Terceira passagem concluída!');
