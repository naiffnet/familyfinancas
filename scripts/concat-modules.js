/**
 * scripts/concat-modules.js
 * Concatena todos os módulos do renderer em app.bundle.js
 * 
 * Uso:
 *   npm run build:renderer          — build único
 *   npm run watch:renderer          — watch mode (rebuild ao salvar)
 */
const fs = require('fs');
const path = require('path');

const MOD_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');
const ENTRY   = path.join(MOD_DIR, 'app-entry.js');
const OUT     = path.join(__dirname, '..', 'src', 'renderer', 'app.bundle.js');

/**
 * Lê a ordem dos módulos do app-entry.js (fonte da verdade)
 */
function getModuleOrder() {
  const entry = fs.readFileSync(ENTRY, 'utf8');
  return entry
    .split('\n')
    .filter(l => l.startsWith("import './"))
    .map(l => l.match(/import '\.\/(.+?)'/)[1]);
}

function build() {
  const moduleOrder = getModuleOrder();
  const parts = [`/* ============================================
 * app.bundle.js — FamilyFinancas Renderer
 * Gerado por: npm run build:renderer
 * ${new Date().toISOString()}
 * Modulos: ${moduleOrder.length}
 * ============================================ */\n`];
  
  let totalLines = 0;
  const results = [];

  for (const modName of moduleOrder) {
    const modPath = path.join(MOD_DIR, modName);
    if (!fs.existsSync(modPath)) {
      console.warn('Modulo nao encontrado:', modName);
      continue;
    }
    const content = fs.readFileSync(modPath, 'utf8');
    const lines = content.split('\n').length;
    totalLines += lines;
    parts.push(`\n/* ==== ${modName} ==== */\n${content}`);
    results.push({ name: modName, lines });
  }

  const bundle = parts.join('\n');
  fs.writeFileSync(OUT, bundle, 'utf8');
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  
  console.log(`\napp.bundle.js: ${totalLines} linhas, ${kb} KB`);

  // Bundle CSS
  const CSS_DIR = path.join(__dirname, '..', 'src', 'renderer', 'css');
  const STYLE_OUT = path.join(__dirname, '..', 'src', 'renderer', 'style.css');
  const cssFiles = ['base.css', 'components.css', 'views.css', 'responsive-features.css', 'mobile-environment.css'];
  const cssParts = [`/* === FINANÇASFAMÍLIA — BUNDLED STYLESHEET === */\n`];
  for (const cf of cssFiles) {
    const cp = path.join(CSS_DIR, cf);
    if (fs.existsSync(cp)) {
      cssParts.push(`\n/* ==== ${cf} ==== */\n` + fs.readFileSync(cp, 'utf8'));
    }
  }
  fs.writeFileSync(STYLE_OUT, cssParts.join('\n'), 'utf8');
  console.log(`style.css: Bundled ${cssFiles.length} stylesheets (${(fs.statSync(STYLE_OUT).size / 1024).toFixed(1)} KB)`);

  const oversized = results.filter(r => r.lines > 1000);
  if (oversized.length > 0) {
    console.warn('AVISO - Modulos acima de 1000 linhas:');
    oversized.forEach(r => console.warn(' ', r.name, r.lines));
  } else {
    console.log('OK - Todos os modulos estao abaixo de 1000 linhas');
  }
  return totalLines;
}

const isWatch = process.argv.includes('--watch');
if (isWatch) {
  console.log('Watching src/renderer/js/modules/ for changes...');
  build();
  fs.watch(MOD_DIR, { recursive: false }, (event, filename) => {
    if (filename && filename.endsWith('.js') && filename !== 'app-entry.js') {
      console.log('\nMudanca detectada:', filename, '- reconstruindo...');
      build();
    }
  });
} else {
  build();
}
