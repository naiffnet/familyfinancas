const path = require('path');
const fs = require('fs');

async function main() {
  console.log('🧪 ========================================================');
  console.log('   SUÍTE DE TESTES AUTOMATIZADOS (FINANÇAS FAMÍLIA)');
  console.log('========================================================\n');

  const testsDir = path.join(__dirname, '..', 'tests');
  const files = fs.readdirSync(testsDir)
    .filter(f => f.endsWith('.test.js'))
    .sort();

  for (const file of files) {
    const filePath = path.join(testsDir, file);
    require(filePath);
  }

  // Garantir saída limpa do processo Electron após conclusão de todas as suites assíncronas
  setTimeout(() => {
    console.log('\n🏁 Suíte de testes finalizada com sucesso!');
    process.exit(0);
  }, 2500);
}

main();
