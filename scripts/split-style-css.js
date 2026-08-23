/**
 * scripts/split-style-css.js
 * Divide src/renderer/style.css em 4 arquivos modulares em src/renderer/css/
 */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'src', 'renderer', 'css');
const CSS_LEGACY = path.join(__dirname, '..', 'src', 'renderer', 'style.legacy.css');
const CSS_SRC = fs.existsSync(CSS_LEGACY) ? CSS_LEGACY : path.join(__dirname, '..', 'src', 'renderer', 'style.css');
const CSS_OUT = path.join(__dirname, '..', 'src', 'renderer', 'style.css');

if (!fs.existsSync(CSS_DIR)) {
  fs.mkdirSync(CSS_DIR, { recursive: true });
}

const code = fs.readFileSync(CSS_SRC, 'utf8');
const lines = code.split('\n');
console.log(`📄 style.css original: ${lines.length} linhas`);

// Helper to extract line slice (1-indexed, inclusive)
function getSlice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// 1. base.css (L1 to L468)
const baseCss = `/* ===================================================
 * base.css — Variáveis, Temas, Reset, Tipografia e Layout
 * =================================================== */
${getSlice(1, 468)}
`;

// 2. components.css (L469 to L1178)
const componentsCss = `/* ===================================================
 * components.css — Botões, Inputs, Cards, Badges, Modais, Alertas
 * =================================================== */
${getSlice(469, 1178)}
`;

// 3. views.css (L1179 to L2100)
const viewsCss = `/* ===================================================
 * views.css — Telas de Planejamento, Configurações, Wizard, Caçula e ADM
 * =================================================== */
${getSlice(1179, 2100)}
`;

// 4. responsive-features.css (L2101 to L2788)
const responsiveCss = `/* ===================================================
 * responsive-features.css — Responsividade, LGPD, Pendências e Conciliação
 * =================================================== */
${getSlice(2101, lines.length)}
`;

// Write modular files
fs.writeFileSync(path.join(CSS_DIR, 'base.css'), baseCss, 'utf8');
fs.writeFileSync(path.join(CSS_DIR, 'components.css'), componentsCss, 'utf8');
fs.writeFileSync(path.join(CSS_DIR, 'views.css'), viewsCss, 'utf8');
fs.writeFileSync(path.join(CSS_DIR, 'responsive-features.css'), responsiveCss, 'utf8');

const modules = ['base.css', 'components.css', 'views.css', 'responsive-features.css'];
modules.forEach(m => {
  const p = path.join(CSS_DIR, m);
  const l = fs.readFileSync(p, 'utf8').split('\n').length;
  const kb = (fs.statSync(p).size / 1024).toFixed(1);
  console.log(`✅ ${m}: ${l} linhas (${kb} KB)`);
});

// Backup original style.css
fs.copyFileSync(CSS_SRC, path.join(__dirname, '..', 'src', 'renderer', 'style.legacy.css'));

// New aggregator style.css
const aggregatorCss = `/* ========================================================
   FINANÇASFAMÍLIA — Folha de Estilos Modularizada
   Modularizado em 4 folhas temáticas (< 1000 linhas cada)
   ======================================================== */

@import './css/base.css';
@import './css/components.css';
@import './css/views.css';
@import './css/responsive-features.css';
`;

fs.writeFileSync(CSS_OUT, aggregatorCss, 'utf8');
console.log(`\n✅ style.css refatorado para agregador com ${aggregatorCss.split('\n').length} linhas!`);
console.log(`📦 style.legacy.css mantido como backup.`);
