/**
 * scripts/fine-tune-modules.js
 * Ajuste fino — subdivide dashboard-main-1.js e settings-1.js
 * que ainda estão levemente acima de 1000 linhas.
 */
const fs = require('fs');
const path = require('path');

const MOD_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');
const CONCAT_OUT = path.join(__dirname, '..', 'src', 'renderer', 'app.bundle.js');

function splitModule(srcName, splitLine) {
  const srcPath = path.join(MOD_DIR, srcName);
  const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
  console.log(`\n📄 ${srcName}: ${lines.length} linhas → corte na linha ${splitLine}`);
  
  const base = srcName.replace('.js', '');
  const partA = `${base}a.js`;
  const partB = `${base}b.js`;
  
  const a = lines.slice(0, splitLine - 1);
  const b = lines.slice(splitLine - 1);
  
  const headerA = `/* === ${partA} (parte 1/2 de ${srcName}) ===\n * Linhas 1–${splitLine - 1}\n */\n\n`;
  const headerB = `/* === ${partB} (parte 2/2 de ${srcName}) ===\n * Linhas ${splitLine}–${lines.length}\n */\n\n`;
  
  fs.writeFileSync(path.join(MOD_DIR, partA), headerA + a.join('\n'), 'utf8');
  fs.writeFileSync(path.join(MOD_DIR, partB), headerB + b.join('\n'), 'utf8');
  fs.unlinkSync(srcPath);
  
  console.log(`  ✅ ${partA}: ${a.length} linhas`);
  console.log(`  ✅ ${partB}: ${b.length} linhas`);
  console.log(`  🗑️  ${srcName} removido`);
  
  return [partA, partB];
}

// dashboard-main-1.js (1038 linhas) → corte em ~808 (função setupCategoryInteractiveChart)
const dashParts = splitModule('dashboard-main-1.js', 808);

// settings-1.js (1096 linhas) → corte em ~551 (meio do openSettingsModal)
const settingsParts = splitModule('settings-1.js', 551);

// Recalcula o bundle concatenando todos os módulos na ordem correta
const entryPath = path.join(MOD_DIR, 'app-entry.js');
let entryContent = fs.readFileSync(entryPath, 'utf8');

// Atualiza imports no app-entry.js
entryContent = entryContent
  .replace(`import './dashboard-main-1.js';`, `import './${dashParts[0]}';\nimport './${dashParts[1]}';`)
  .replace(`import './settings-1.js';`, `import './${settingsParts[0]}';\nimport './${settingsParts[1]}';`);

fs.writeFileSync(entryPath, entryContent, 'utf8');
console.log('\n📦 app-entry.js atualizado');

// Rebuilda o bundle
const moduleOrder = entryContent
  .split('\n')
  .filter(l => l.startsWith("import './"))
  .map(l => l.match(/import '\.\/(.+?)'/)[1]);

const bundleParts = [`/* app.bundle.js — ${new Date().toISOString()} */\n`];
let bundleLines = 0;
for (const mod of moduleOrder) {
  const modPath = path.join(MOD_DIR, mod);
  if (fs.existsSync(modPath)) {
    const content = fs.readFileSync(modPath, 'utf8');
    bundleLines += content.split('\n').length;
    bundleParts.push(`\n/* ── ${mod} ── */\n${content}`);
  }
}
fs.writeFileSync(CONCAT_OUT, bundleParts.join('\n'), 'utf8');
const kb = (fs.statSync(CONCAT_OUT).size / 1024).toFixed(1);
console.log(`\n✅ app.bundle.js: ${bundleLines} linhas totais, ${kb} KB`);

// Relatório final
console.log('\n📊 Módulos finais:');
const mods = fs.readdirSync(MOD_DIR)
  .filter(f => f.endsWith('.js') && f !== 'app-entry.js')
  .map(f => ({ name: f, lines: fs.readFileSync(path.join(MOD_DIR, f), 'utf8').split('\n').length }))
  .sort((a, b) => b.lines - a.lines);

mods.forEach(m => {
  const flag = m.lines > 1000 ? ' ⚠️ ACIMA DE 1000' : '';
  console.log(`  ${m.lines.toString().padStart(4)} linhas  ${m.name}${flag}`);
});
