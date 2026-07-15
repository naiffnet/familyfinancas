const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'renderer', 'app.js');
if (!fs.existsSync(appJsPath)) {
  console.log('app.js não encontrado.');
  process.exit(1);
}

const lines = fs.readFileSync(appJsPath, 'utf8').split('\n');
console.log('Buscando seções de Configurações ou renderSettings em app.js...');
lines.forEach((l, idx) => {
  if (l.includes('renderSettings') || l.includes('settings') || l.includes('perfil') || l.includes('perfis') || l.includes('avatar') || l.includes('permissions')) {
    console.log(`L${idx+1}: ${l.trim().substring(0, 150)}`);
  }
});
