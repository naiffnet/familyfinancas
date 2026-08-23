/**
 * OFX (Open Financial Exchange) PARSER
 * Lê extratos bancários .ofx de qualquer instituição bancária brasileira.
 */

function parseOfx(ofxString) {
  if (!ofxString || typeof ofxString !== 'string') {
    throw new Error('Arquivo OFX vazio ou formato inválido.');
  }

  // Normaliza quebras de linha
  const content = ofxString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Extrai informações da conta
  const bankIdMatch = content.match(/<BANKID>([^<\n]+)/i);
  const acctIdMatch = content.match(/<ACCTID>([^<\n]+)/i);
  const orgMatch = content.match(/<ORG>([^<\n]+)/i);

  const bankId = bankIdMatch ? bankIdMatch[1].trim() : '';
  const acctId = acctIdMatch ? acctIdMatch[1].trim() : '';
  const bankName = orgMatch ? orgMatch[1].trim() : '';

  // Extrai transações <STMTTRN> ... </STMTTRN> ou sem tag de fechamento (SGML)
  const transactions = [];
  const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST>))/gi;
  let match;

  while ((match = trnRegex.exec(content)) !== null) {
    const trnBlock = match[1];

    const trnTypeMatch = trnBlock.match(/<TRNTYPE>([^<\n]+)/i);
    const dtPostedMatch = trnBlock.match(/<DTPOSTED>([^<\n]+)/i);
    const trnAmtMatch = trnBlock.match(/<TRNAMT>([^<\n]+)/i);
    const fitidMatch = trnBlock.match(/<FITID>([^<\n]+)/i);
    const memoMatch = trnBlock.match(/<MEMO>([^<\n]+)/i) || trnBlock.match(/<NAME>([^<\n]+)/i);

    const rawType = trnTypeMatch ? trnTypeMatch[1].trim().toUpperCase() : 'OTHER';
    const rawDate = dtPostedMatch ? dtPostedMatch[1].trim() : '';
    const rawAmount = trnAmtMatch ? trnAmtMatch[1].trim().replace(',', '.') : '0';
    const fitid = fitidMatch ? fitidMatch[1].trim() : '';
    let description = memoMatch ? memoMatch[1].trim() : 'Lançamento Bancário';

    // Limpa caracteres SGML ou espaços duplos
    description = description.replace(/\s+/g, ' ').trim();

    // Formata a data (YYYYMMDD... -> YYYY-MM-DD)
    let formattedDate = new Date().toISOString().split('T')[0];
    if (rawDate && rawDate.length >= 8) {
      const yyyy = rawDate.substring(0, 4);
      const mm = rawDate.substring(4, 6);
      const dd = rawDate.substring(6, 8);
      formattedDate = `${yyyy}-${mm}-${dd}`;
    }

    const amountNum = parseFloat(rawAmount);
    const type = amountNum >= 0 ? 'income' : 'expense';
    const absoluteAmount = Math.abs(amountNum);

    transactions.push({
      fitid,
      date: formattedDate,
      amount: absoluteAmount,
      rawAmount: amountNum,
      type,
      rawType,
      description,
      suggestedCategory: guessCategory(description)
    });
  }

  return {
    bankId,
    acctId,
    bankName,
    totalTransactions: transactions.length,
    transactions
  };
}

/**
 * Heurística de auto-categorização inteligente baseada em palavras-chave bancárias
 */
function guessCategory(description) {
  const desc = (description || '').toLowerCase();

  if (/uber|99app|posto|combust|gasolina|estaciona|sem parar|pedagio/i.test(desc)) {
    return 'Transporte';
  }
  if (/mercado|supermercado|carrefour|pao de acucar|assai|atacad|hortifruti|padaria|acougue|ifood|restaurante|lanchonete|burger|pizza/i.test(desc)) {
    return 'Alimentação';
  }
  if (/farmacia|droga|drogaria|panvel|raia|medico|consulta|laboratorio|hospital|dentista|odont/i.test(desc)) {
    return 'Saúde';
  }
  if (/netflix|spotify|cinema|amazon prime|disney|steam|playstation|xbox|show|ingresso/i.test(desc)) {
    return 'Lazer / Assinaturas';
  }
  if (/copel|enel|cemig|light|energia|sabesp|sanepar|corsan|agua|internet|claro|vivo|tim|aluguel|condominio/i.test(desc)) {
    return 'Moradia / Contas Básicas';
  }
  if (/escola|colegio|faculdade|universidade|curso|livraria|udemy|idiomas/i.test(desc)) {
    return 'Educação';
  }
  if (/salario|remuneracao|folha|ted recebida|pix recebido|pro-labore|honorarios/i.test(desc)) {
    return 'Salário / Renda';
  }

  return 'Outros';
}

module.exports = { parseOfx, guessCategory };
