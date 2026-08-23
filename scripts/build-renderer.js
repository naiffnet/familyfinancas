/**
 * scripts/build-renderer.js
 * Build script para o renderer do FamilyFinanças usando esbuild.
 * Gera app.bundle.js a partir dos módulos ES em src/renderer/js/modules/
 */
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'renderer', 'js', 'modules', 'app-entry.js');
const OUT = path.join(ROOT, 'src', 'renderer', 'app.bundle.js');

const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--prod');

const config = {
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'iife',       // Compatível com Electron (window global) e Web
  globalName: 'App',
  platform: 'browser',
  target: ['chrome110'], // Electron usa Chromium moderno
  sourcemap: !isProd,
  minify: isProd,
  logLevel: 'info',
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('🔄 esbuild watching for changes...');
  } else {
    const result = await esbuild.build(config);
    const stat = fs.statSync(OUT);
    const kb = (stat.size / 1024).toFixed(1);
    console.log(`✅ app.bundle.js gerado: ${kb} KB`);
    if (result.errors.length > 0) {
      console.error('Errors:', result.errors);
      process.exit(1);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
