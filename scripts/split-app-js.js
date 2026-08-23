/**
 * scripts/split-app-js.js
 * Script de extração automática: divide o monolítico app.js em módulos temáticos.
 * Cada módulo exporta suas funções para o escopo global (window.X) para manter
 * compatibilidade total com o HTML existente sem reescrita de referências.
 * 
 * Uso: node scripts/split-app-js.js
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'renderer', 'app.js');
const OUT_DIR = path.join(__dirname, '..', 'src', 'renderer', 'js', 'modules');

// Mapa de cortes: [nome_modulo, linha_inicio (1-based), linha_fim (inclusive)]
// Baseado na análise do arquivo app.js
const CUTS = [
  { name: 'rpc-bridge',           start: 1,    end: 177   },
  { name: 'state-constants',      start: 178,  end: 714   },  // State, fmt, BANKS, AVATARS, toast, Modal, navigate, bankLogo, buildDonut
  { name: 'dashboard',            start: 715,  end: 1962  },
  { name: 'planning',             start: 1963, end: 3060  },
  { name: 'recurring-modal',      start: 3061, end: 3488  },
  { name: 'avulso-modal',         start: 3489, end: 3960  },
  { name: 'payment-modal',        start: 3961, end: 4013  },
  { name: 'accounts',             start: 4014, end: 4718  },
  { name: 'deduplication',        start: 4719, end: 5079  },
  { name: 'budget-goals-reports', start: 5080, end: 5377  },
  { name: 'manual',               start: 5378, end: 6374  },
  { name: 'settings',             start: 6375, end: 7936  },
  { name: 'auth',                 start: 7937, end: 8876  },
  { name: 'admin',                start: 8877, end: 9709  },
  { name: 'app-init',             start: 9710, end: 9970  },
];

// Lê todas as linhas do app.js original
const allLines = fs.readFileSync(SRC, 'utf8').split('\n');
const totalLines = allLines.length;

console.log(`📄 app.js: ${totalLines} linhas`);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Gera cada módulo
for (const cut of CUTS) {
  const { name, start, end } = cut;
  const lines = allLines.slice(start - 1, end);
  const outPath = path.join(OUT_DIR, `${name}.js`);
  
  let header = `/* =============================================\n`;
  header += ` * Módulo: ${name}.js\n`;
  header += ` * Extraído de app.js (linhas ${start}–${end})\n`;
  header += ` * Gerado automaticamente por scripts/split-app-js.js\n`;
  header += ` * ============================================= */\n\n`;
  
  fs.writeFileSync(outPath, header + lines.join('\n'), 'utf8');
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✅ ${name}.js — ${lines.length} linhas (${kb} KB)`);
}

// Gera o app-entry.js que importa todos os módulos em ordem
const entryLines = [
  `/* app-entry.js — Ponto de entrada do bundle esbuild */`,
  `/* Importa todos os módulos em ordem de dependência */`,
  ``,
  ...CUTS.map(c => `import './${c.name}.js';`),
];

const entryPath = path.join(OUT_DIR, 'app-entry.js');
fs.writeFileSync(entryPath, entryLines.join('\n'), 'utf8');
console.log(`\n📦 app-entry.js criado com ${CUTS.length} imports`);
console.log(`\n✅ Extração concluída! Execute:\n  node scripts/build-renderer.js\npara gerar app.bundle.js`);
