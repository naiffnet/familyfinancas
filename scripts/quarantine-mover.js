const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const quarantineDir = path.join(rootDir, '_quarentena_backup');

const filesToQuarantine = [
  // Views legadas substituídas pelos módulos
  'src/renderer/js/views/budget.view.js',
  'src/renderer/js/views/goals.view.js',
  'src/renderer/js/views/reports.view.js',
  'src/renderer/js/views/manual.view.js',

  // Arquivos legados de estado e formatadores redundantes
  'src/renderer/js/core/state.js',
  'src/renderer/js/state.js',
  'src/renderer/js/formatters.js',
  'src/renderer/js/utils/formatters.js',
  'src/renderer/js/utils/financialMath.js',
  'src/renderer/js/utils/sanitizer.js',
  'src/renderer/js/utils/bankLogos.js',
  'src/renderer/js/components/toast.js',

  // CSS legado monolítico
  'src/renderer/style.legacy.css',

  // PDFs pesados e arquivos estáticos de testes antigos
  'src/renderer/Manual_do_Usuario.pdf',
  'Manual_do_Usuario.pdf',
  'Manual_Tecnico_Financeiro_Familiar.pdf',
  'Relatorio_Tecnico_Arquitetura.pdf',
  'GASTOS  oficial 2026.xlsx',
  'segunda-via-luz-ago26.pdf',

  // Notas e especificações antigas consolidadas
  'EXPLICACAO.md',
  'SPEC.md',
  'README-RENDER.md',

  // Scripts de refatoração pontual do passado e auxiliares de análise
  'scripts/split-db-js.js',
  'scripts/split-style-css.js',
  'scripts/deep-file-inventory.js',
  'scripts/scan-files.js'
];

if (!fs.existsSync(quarantineDir)) {
  fs.mkdirSync(quarantineDir, { recursive: true });
}

const manifest = [];

for (const relPath of filesToQuarantine) {
  const srcPath = path.join(rootDir, relPath);
  const destPath = path.join(quarantineDir, relPath);

  if (fs.existsSync(srcPath)) {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      fs.copyFileSync(srcPath, destPath);
      try {
        fs.unlinkSync(srcPath);
      } catch (delErr) {
        console.warn(`[Aviso] Copiado para quarentena, mas arquivo original está bloqueado pelo Windows: ${relPath}`);
      }
      manifest.push({
        originalPath: relPath,
        quarantinedPath: path.relative(rootDir, destPath).replace(/\\/g, '/'),
        quarantinedAt: new Date().toISOString()
      });
      console.log(`[Quarentena] Movido com sucesso: ${relPath}`);
    } catch (err) {
      console.error(`[Erro] Falha ao processar ${relPath}: ${err.message}`);
    }
  } else {
    console.warn(`[Aviso] Arquivo não encontrado (já movido ou inexistente): ${relPath}`);
  }
}

// Salva manifesto na quarentena
fs.writeFileSync(
  path.join(quarantineDir, 'MANIFESTO_QUARENTENA.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

// Cria README explicativo na pasta de quarentena
const readmeContent = `# 📦 Pasta de Quarentena & Backup de Arquivos Legados

Esta pasta armazena arquivos do projeto que foram descontinuados, modularizados ou substituídos por versões mais modernas no ecossistema do **FinançasFamília**.

## 🛡️ Como Restaurar Qualquer Arquivo
Se qualquer funcionalidade precisar de um arquivo que está aqui dentro:
1. Localize o arquivo na estrutura correspondente desta pasta.
2. Copie o arquivo de volta para a sua localização original (conforme listado em \`MANIFESTO_QUARENTENA.json\`).

Data de criação da quarentena: ${new Date().toLocaleString('pt-BR')}
Total de arquivos em quarentena: ${manifest.length}
`;

fs.writeFileSync(path.join(quarantineDir, 'README.md'), readmeContent, 'utf8');

console.log(`\n✅ Quarentena concluída com sucesso! Total de ${manifest.length} arquivos protegidos.`);
