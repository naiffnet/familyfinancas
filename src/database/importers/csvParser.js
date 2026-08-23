/**
 * CSV BANK STATEMENT PARSER
 * Processa extratos em arquivo .csv emitidos por bancos brasileiros.
 */

const { guessCategory } = require('./ofxParser');

function parseCsv(csvString) {
  if (!csvString || typeof csvString !== 'string') {
    throw new Error('Arquivo CSV vazio ou formato inválido.');
  }

  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { totalTransactions: 0, transactions: [] };
  }

  // Identifica delimitador (, ou ;)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  // Identifica colunas
  let dateIdx = headers.findIndex(h => h.includes('data') || h.includes('date'));
  let descIdx = headers.findIndex(h => h.includes('descri') || h.includes('memo') || h.includes('historico') || h.includes('title') || h.includes('estabelecimento'));
  let amountIdx = headers.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('saldo') || h.includes('real'));
  let catIdx = headers.findIndex(h => h.includes('categ') || h.includes('tipo'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const parts = rawLine.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 2) continue;

    const rawDate = parts[dateIdx] || '';
    let description = parts[descIdx] || 'Lançamento CSV';
    let rawAmount = parts[amountIdx] || '0';
    let bankCategory = catIdx !== -1 ? parts[catIdx] : '';

    // Normaliza valor (ex: "1.250,50" -> 1250.50 ou "-50,00" -> -50.00)
    rawAmount = rawAmount.replace(/\s+/g, '').replace('R$', '').replace('$', '');
    if (rawAmount.includes(',') && rawAmount.includes('.')) {
      rawAmount = rawAmount.replace(/\./g, '').replace(',', '.');
    } else if (rawAmount.includes(',')) {
      rawAmount = rawAmount.replace(',', '.');
    }

    const amountNum = parseFloat(rawAmount);
    if (isNaN(amountNum) || amountNum === 0) continue;

    // Normaliza data (DD/MM/YYYY ou YYYY-MM-DD)
    let formattedDate = new Date().toISOString().split('T')[0];
    if (rawDate.includes('/')) {
      const dp = rawDate.split('/');
      if (dp.length === 3) {
        const dd = dp[0].padStart(2, '0');
        const mm = dp[1].padStart(2, '0');
        const yyyy = dp[2].length === 2 ? `20${dp[2]}` : dp[2];
        formattedDate = `${yyyy}-${mm}-${dd}`;
      }
    } else if (rawDate.includes('-')) {
      formattedDate = rawDate.split(' ')[0];
    }

    const type = amountNum >= 0 ? 'income' : 'expense';
    const absoluteAmount = Math.abs(amountNum);

    transactions.push({
      date: formattedDate,
      amount: absoluteAmount,
      rawAmount: amountNum,
      type,
      description,
      suggestedCategory: bankCategory || guessCategory(description)
    });
  }

  return {
    totalTransactions: transactions.length,
    transactions
  };
}

module.exports = { parseCsv };
