/* ===
 * nfce-scanner.js — Scanner de Notas Fiscais (NFC-e / SAT / Pix) via Câmera, PDF e QR Code
 * Módulo para FamilyFinancas
 * === */

function playScanBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);
    setTimeout(() => { if (ctx.state !== 'closed') ctx.close().catch(() => {}); }, 300);
  } catch (err) {}
}

function vibrateDevice(ms = 70) {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}

function loadVendorScript(src) {
  return new Promise(res => {
    const s = document.createElement('script');
    s.src = src; s.onload = () => res(true); s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}

async function ensureEnginesLoaded() {
  const tasks = [];
  if (typeof window.jsQR !== 'function') tasks.push(loadVendorScript('js/vendor/jsQR.js'));
  if (typeof window.QRCode === 'undefined') tasks.push(loadVendorScript('js/vendor/qrcode.min.js'));
  if (typeof window.pdfjsLib === 'undefined') tasks.push(loadVendorScript('js/vendor/pdf.min.js'));
  await Promise.all(tasks);
  try {
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
    }
  } catch(e) {}
}

function decodeHexAscii(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim();
  if (/^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0 && clean.length >= 4) {
    try {
      let decoded = '';
      for (let i = 0; i < clean.length; i += 2) {
        const code = parseInt(clean.substring(i, i + 2), 16);
        if (code >= 32 && code <= 126) decoded += String.fromCharCode(code);
        else return null;
      }
      return decoded;
    } catch (e) { return null; }
  }
  return null;
}

const KNOWN_CNPJS = [
  { root: '08467115', name: 'RGE - Rio Grande Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia (NF3e)' }, { root: '02016440', name: 'CEEE Equatorial Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia (NF3e)' }, { root: '61695227', name: 'Enel Distribuição', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04172213', name: 'Copel Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '02998611', name: 'Cemig Distribuição', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '03378521', name: 'CPFL Paulista / Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '07526557', name: 'Neoenergia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04895728', name: 'Energisa', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' }, { root: '04423567', name: 'Light Energia', cat: 'Moradia', icon: '⚡', docType: 'Fatura de Energia' },
  { root: '92802784', name: 'Corsan - Água e Saneamento', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '02429919', name: 'DMAE - Água e Esgotos', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '43776517', name: 'Sabesp', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '33352394', name: 'Cedae', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '00628286', name: 'Sanepar', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' }, { root: '17281106', name: 'Copasa', cat: 'Moradia', icon: '💧', docType: 'Fatura de Água' },
  { root: '02558157', name: 'Telefônica / Vivo', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '33000118', name: 'Telefônica Brasil (Vivo)', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '40432544', name: 'Claro / NET', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '04206050', name: 'TIM Brasil', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' }, { root: '05423963', name: 'Oi Telecomunicações', cat: 'Moradia', icon: '🌐', docType: 'Fatura Telecom' },
  { root: '94896792', name: 'Supermercados Rissul', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92754738', name: 'Supermercado Zaffari', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '45543915', name: 'Carrefour Supermercado', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '01545822', name: 'Supermercados Asun', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '07170938', name: 'Stok Center Atacado', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '06057223', name: 'Assaí Atacadista', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '47508411', name: 'Pão de Açúcar / Extra', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '75315333', name: 'Bistek Supermercados', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '83646984', name: 'Fort Atacadista', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' }, { root: '02502844', name: 'Angeloni Supermercados', cat: 'Alimentação', icon: '🛒', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '92999999', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92999704', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '92665611', name: 'Farmácia Panvel', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '61585865', name: 'Droga Raia / Drogasil', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '88212147', name: 'Farmácias São João', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' }, { root: '05493015', name: 'Farmácia Pague Menos', cat: 'Saúde', icon: '💊', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '33000167', name: 'Posto Petrobras', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' }, { root: '33453598', name: 'Posto Shell', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' }, { root: '33337122', name: 'Posto Ipiranga', cat: 'Transporte', icon: '⛽', docType: 'Cupom Fiscal (NFC-e)' },
  { root: '92798735', name: 'Lojas Renner', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '61099966', name: 'Lojas Riachuelo', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '45242914', name: 'Lojas C&A', cat: 'Vestuário', icon: '👕', docType: 'Cupom Fiscal (NFC-e)' }, { root: '00776574', name: 'Cassol Centerlar', cat: 'Moradia', icon: '🏠', docType: 'Cupom Fiscal (NFC-e)' }, { root: '01438784', name: 'Leroy Merlin', cat: 'Moradia', icon: '🏠', docType: 'Cupom Fiscal (NFC-e)' }, { root: '42591651', name: 'McDonald\'s', cat: 'Alimentação', icon: '🍔', docType: 'Cupom Fiscal (NFC-e)' }, { root: '13574594', name: 'Burger King', cat: 'Alimentação', icon: '🍔', docType: 'Cupom Fiscal (NFC-e)' }
];

function isInvalidMerchantName(str) {
  if (!str) return true;
  const s = str.trim().toUpperCase();
  const blackList = [
    'UNIDADE CONSUMIDORA', 'REFERÊNCIA', 'REFERENCIA', 'AGÊNCIA', 'AGENCIA', 'CÓDIGO', 'CODIGO',
    'NOTA FISCAL', 'DANFE', 'DOCUMENTO AUXILIAR', 'EXTRATO', 'CONSUMIDOR', 'VALOR A PAGAR',
    'TOTAL A PAGAR', 'FATURA DE ENERGIA', 'VIA DO CONSUMIDOR', 'EMISSÃO', 'EMISSAO', 'CHAVE DE ACESSO',
    'CHAVE DE CONSULTA', 'PROTOCOLO', 'INFORMAÇÕES FISCAIS', 'ESTADO DO RIO GRANDE DO SUL', 'SECRETARIA DA FAZENDA'
  ];
  return blackList.some(b => s.includes(b)) || s.length < 3;
}

function parsePixPayload(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (!clean.startsWith('000201') || !clean.includes('BR.GOV.BCB.PIX')) return null;
  const res = { isPix: true, pixCode: clean, amount: null, receiver: '', txid: '', city: '' };
  const valMatch = clean.match(/54(\d{2})([0-9.]+)/);
  if (valMatch) {
    const len = parseInt(valMatch[1], 10);
    const num = parseFloat(valMatch[2].substring(0, len));
    if (!isNaN(num) && num > 0) res.amount = num;
  }
  const nameMatch = clean.match(/59(\d{2})([^0-9]+)/);
  if (nameMatch) { res.receiver = nameMatch[2].substring(0, parseInt(nameMatch[1], 10)).trim(); }
  const cityMatch = clean.match(/60(\d{2})([^0-9]+)/);
  if (cityMatch) { res.city = cityMatch[2].substring(0, parseInt(cityMatch[1], 10)).trim(); }
  const txMatch = clean.match(/62\d{2}.*?05(\d{2})([a-zA-Z0-9]+)/);
  if (txMatch) { res.txid = txMatch[2].substring(0, parseInt(txMatch[1], 10)); }
  return res;
}

function parseSingleCode(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();

  // 1. Pix
  const pix = parsePixPayload(text);
  if (pix) {
    const today = new Date().toISOString().split('T')[0];
    return {
      type: 'expense', amount: pix.amount, date: today, competence: today.slice(0, 7),
      description: pix.receiver ? `PIX para ${pix.receiver}` : 'Pagamento PIX', suggestedCategory: 'Moradia',
      docType: 'Pagamento PIX', accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: true, isBoleto: false,
      pixCode: pix.pixCode, pixReceiver: pix.receiver, pixTxid: pix.txid,
      notes: `PIX Copia e Cola: ${pix.pixCode}`
    };
  }

  // 2. Boleto / Linha de Arrecadação de Concessionária (48 dígitos) ou Boleto Bancário (47 dígitos)
  const cleanDigits = text.replace(/[^0-9]/g, '');
  if ((cleanDigits.length === 47 || cleanDigits.length === 48) && !text.includes('http')) {
    const today = new Date().toISOString().split('T')[0];
    let amt = null;
    if (cleanDigits.length === 47) {
      const cents = parseInt(cleanDigits.slice(-10), 10);
      if (cents > 0) amt = cents / 100;
    } else if (cleanDigits.length === 48 && cleanDigits.startsWith('8')) {
      const cents = parseInt(cleanDigits.substring(4, 15), 10);
      if (cents > 0 && cents < 99999999) amt = cents / 100;
    }
    return {
      type: 'expense', amount: amt, date: today, competence: today.slice(0, 7),
      description: cleanDigits.startsWith('8') ? 'Fatura de Concessionária' : 'Pagamento de Boleto',
      suggestedCategory: 'Moradia', docType: cleanDigits.startsWith('8') ? 'Fatura / Arrecadação' : 'Boleto Bancário',
      accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: false, isBoleto: true,
      boletoCode: cleanDigits, notes: `Código de Barras: ${text}`
    };
  }

  // 3. NFC-e / NF-e / NF3e SEFAZ
  let result = {
    type: 'expense', amount: null, date: null, dueDate: null, competence: null, description: '',
    suggestedCategory: '', docType: 'Cupom Fiscal (NFC-e)', accessKey: '', cnpj: '', nNF: '', model: '',
    uf: '', rawUrl: text, isPix: false, isBoleto: false
  };

  const keyMatch = text.match(/\b([0-9]{44})\b/) || text.match(/[?&]p=([0-9]{44})/i) || text.match(/[?&]chNFe=([0-9]{44})/i);
  if (keyMatch) {
    result.accessKey = keyMatch[1];
    const ufCode = result.accessKey.substring(0, 2);
    const ufMap = {'11':'RO','12':'AC','13':'AM','14':'RR','15':'PA','16':'AP','17':'TO','21':'MA','22':'PI','23':'CE','24':'RN','25':'PB','26':'PE','27':'AL','28':'SE','29':'BA','31':'MG','32':'ES','33':'RJ','35':'SP','41':'PR','42':'SC','43':'RS','50':'MS','51':'MT','52':'GO','53':'DF'};
    result.uf = ufMap[ufCode] || 'BR';
    const aa = result.accessKey.substring(2, 4);
    const mm = result.accessKey.substring(4, 6);
    result.competence = `${parseInt(aa, 10) + 2000}-${mm.padStart(2, '0')}`;
    const rawCnpj = result.accessKey.substring(6, 20);
    result.cnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    result.model = result.accessKey.substring(20, 22);
    result.nNF = parseInt(result.accessKey.substring(25, 34), 10).toString();

    if (result.model === '66') {
      result.docType = 'Fatura de Energia (NF3e)';
      result.suggestedCategory = 'Moradia';
    } else if (result.model === '55') {
      result.docType = 'Nota Fiscal (NF-e)';
    } else if (result.model === '65') {
      result.docType = 'Cupom Fiscal (NFC-e)';
    }
  }

  // Query parameters de data
  const qDateMatch = text.match(/[?&](?:dhEmi|dEmi|data|date)=([^&|]+)/i);
  if (qDateMatch) {
    const rawD = decodeURIComponent(qDateMatch[1]).trim();
    const isoM = rawD.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoM) { result.date = `${isoM[1]}-${isoM[2]}-${isoM[3]}`; result.competence = `${isoM[1]}-${isoM[2]}`; }
    const brM = rawD.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (brM) { result.date = `${brM[3]}-${brM[2]}-${brM[1]}`; result.competence = `${brM[3]}-${brM[2]}`; }
  }

  if (text.includes('|')) {
    const pipeParts = text.split('|');
    for (let i = 1; i < pipeParts.length; i++) {
      const token = pipeParts[i].trim();
      if (!token) continue;
      if (/^\d+[.,]\d{2}$/.test(token) || (/^\d+[.,]\d+$/.test(token) && parseFloat(token.replace(',', '.')) > 0)) {
        const val = parseFloat(token.replace(',', '.'));
        if (!isNaN(val) && val > 0 && !(i <= 3 && (val === 1 || val === 2)) && !result.amount) result.amount = val;
      }
      const pIsoM = token.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (pIsoM && !result.date) { result.date = `${pIsoM[1]}-${pIsoM[2]}-${pIsoM[3]}`; result.competence = `${pIsoM[1]}-${pIsoM[2]}`; }
      const pBrM = token.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (pBrM && !result.date) { result.date = `${pBrM[3]}-${pBrM[2]}-${pBrM[1]}`; result.competence = `${pBrM[3]}-${pBrM[2]}`; }
      const decodedHex = decodeHexAscii(token);
      if (decodedHex) {
        if (/^\d+[.,]\d+$/.test(decodedHex)) {
          const valHex = parseFloat(decodedHex.replace(',', '.'));
          if (!isNaN(valHex) && valHex > 0 && !result.amount) result.amount = valHex;
        }
        const dateMatch = decodedHex.match(/(\d{4})-(\d{2})-(\d{2})/) || decodedHex.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch && !result.date) {
          result.date = dateMatch[1].length === 4 ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          result.competence = result.date.slice(0, 7);
        }
      }
    }
  }

  if (!result.amount) {
    const valMatch = text.match(/[?&](?:vTot|vNF|valor|total|amount)=([0-9.,]+)/i);
    if (valMatch) result.amount = parseFloat(valMatch[1].replace(',', '.'));
  }

  const today = new Date().toISOString().split('T')[0];
  if (!result.date) {
    result.isEstimatedDate = true;
    result.date = result.competence && result.competence !== today.slice(0, 7) ? `${result.competence}-01` : today;
    result.competence = result.competence || today.slice(0, 7);
  } else {
    result.isEstimatedDate = false;
  }

  if (result.cnpj) {
    const root = result.cnpj.replace(/[^0-9]/g, '').substring(0, 8);
    const k = KNOWN_CNPJS.find(x => x.root === root);
    if (k) {
      result.description = `${k.name}${result.nNF ? ` (#${result.nNF})` : ''}`;
      result.suggestedCategory = k.cat;
      if (k.docType) result.docType = k.docType;
    }
  }

  if (!result.description) {
    const merchants = [
      { pattern: /zaffari|bourbon/i, name: 'Supermercado Zaffari', cat: 'Alimentação' }, { pattern: /carrefour/i, name: 'Carrefour', cat: 'Alimentação' },
      { pattern: /rissul|unidasul|macromix/i, name: 'Supermercados Rissul', cat: 'Alimentação' }, { pattern: /pao.*acucar|extra|assai/i, name: 'Supermercado', cat: 'Alimentação' },
      { pattern: /panvel/i, name: 'Farmácia Panvel', cat: 'Saúde' }, { pattern: /raia|drogasil/i, name: 'Droga Raia / Drogasil', cat: 'Saúde' },
      { pattern: /sao.*joao/i, name: 'Farmácia São João', cat: 'Saúde' }, { pattern: /pague.*menos/i, name: 'Farmácia Pague Menos', cat: 'Saúde' },
      { pattern: /ipiranga/i, name: 'Posto Ipiranga', cat: 'Transporte' }, { pattern: /shell/i, name: 'Posto Shell', cat: 'Transporte' },
      { pattern: /petrobras|vibra/i, name: 'Posto Petrobras', cat: 'Transporte' }, { pattern: /mcdonald/i, name: 'McDonald\'s', cat: 'Alimentação' },
      { pattern: /burger.*king/i, name: 'Burger King', cat: 'Alimentação' }, { pattern: /renner/i, name: 'Lojas Renner', cat: 'Vestuário' },
      { pattern: /riachuelo/i, name: 'Lojas Riachuelo', cat: 'Vestuário' }
    ];
    for (const m of merchants) {
      if (m.pattern.test(text)) { result.description = `${m.name}${result.nNF ? ` (#${result.nNF})` : ''}`; result.suggestedCategory = m.cat; break; }
    }
  }

  if (!result.description) {
    result.description = result.nNF ? `Nota Fiscal #${result.nNF}` : `Nota Fiscal (${result.uf || 'SEFAZ'})`;
    result.suggestedCategory = result.model === '66' ? 'Moradia' : 'Alimentação';
  }

  if (result.accessKey) result.notes = `Chave: ${result.accessKey}`;
  return result;
}

function extractInfoFromText(fullText) {
  if (!fullText || typeof fullText !== 'string') return null;
  const res = {
    type: 'expense', amount: null, date: null, dueDate: null, competence: null,
    description: '', suggestedCategory: 'Alimentação', docType: 'Fatura / Nota Fiscal',
    accessKey: '', cnpj: '', nNF: '', model: '', pixCode: null, boletoCode: null,
    notes: '', isPix: false, isBoleto: false
  };

  // 1. Procura Código PIX Copia e Cola no texto (EMVCo 000201...)
  const pixMatch = fullText.match(/(00020126[0-9A-Za-z.=-]+)/i) || fullText.match(/(000201[0-9A-Za-z.=-]{30,})/i);
  if (pixMatch) {
    res.pixCode = pixMatch[1].trim();
    res.isPix = true;
    const p = parsePixPayload(res.pixCode);
    if (p && p.amount && !res.amount) res.amount = p.amount;
    if (p && p.receiver && (!res.description || isInvalidMerchantName(res.description))) res.description = p.receiver;
  }

  // 2. Chave de Acesso NF (44 dígitos)
  const keyRawMatch = fullText.match(/\b(\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{4})\b/) || fullText.match(/([0-9]{44})/);
  if (keyRawMatch) {
    const cleanKey = (keyRawMatch[1] || keyRawMatch[0]).replace(/[^0-9]/g, '');
    if (cleanKey.length === 44) {
      res.accessKey = cleanKey;
      res.cnpj = cleanKey.substring(6, 20).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      res.model = cleanKey.substring(20, 22);
      res.nNF = parseInt(cleanKey.substring(25, 34), 10).toString();
      res.competence = `${parseInt(cleanKey.substring(2, 4), 10) + 2000}-${cleanKey.substring(4, 6)}`;
      if (res.model === '66') { res.docType = 'Fatura de Energia (NF3e)'; res.suggestedCategory = 'Moradia'; }
      else if (res.model === '55') { res.docType = 'Nota Fiscal (NF-e)'; }
      else if (res.model === '65') { res.docType = 'Cupom Fiscal (NFC-e)'; }
    }
  }

  // 3. Código de Arrecadação Concessionária (48 dig) ou Boleto (47 dig)
  const barcodeConcessionaria = fullText.match(/\b(8\d{10}[-\s]?\d\s*\d{11}[-\s]?\d\s*\d{11}[-\s]?\d\s*\d{11}[-\s]?\d)\b/) || fullText.match(/\b(8\d{47})\b/);
  const barcodeBoleto = fullText.match(/\b(\d{5}[.\s]?\d{5}\s+\d{5}[.\s]?\d{6}\s+\d{5}[.\s]?\d{6}\s+\d\s+\d{14})\b/);
  if (barcodeConcessionaria) {
    res.boletoCode = barcodeConcessionaria[0].replace(/[^0-9]/g, '');
    res.isBoleto = true; res.docType = 'Fatura de Concessionária'; res.suggestedCategory = 'Moradia';
  } else if (barcodeBoleto) {
    res.boletoCode = barcodeBoleto[0].replace(/[^0-9]/g, '');
    res.isBoleto = true; res.docType = 'Boleto Bancário'; res.suggestedCategory = 'Moradia';
  }

  if (!res.cnpj) {
    const cnpjMatch = fullText.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/);
    if (cnpjMatch) res.cnpj = cnpjMatch[1];
  }

  if (res.cnpj) {
    const root = res.cnpj.replace(/[^0-9]/g, '').substring(0, 8);
    const k = KNOWN_CNPJS.find(x => x.root === root);
    if (k) {
      res.description = k.name; res.suggestedCategory = k.cat;
      if (k.docType) res.docType = k.docType;
    }
  }

  const duePatterns = [
    /(?:data\s+de\s+vencimento|data\s+vencimento|vencimento|venc|vence\s+em|pagar\s+at[eé]|validade|data\s+limite)\s*[:\s]*(\d{2}[/-]\d{2}[/-]\d{4})/i,
    /(\d{2}[/-]\d{2}[/-]\d{4})\s*(?:data\s+de\s+vencimento|vencimento|venc)/i,
    /(?:total\s+a\s+pagar|valor\s+a\s+pagar|vencimento)\s*R?\$?\s*[\d.,]+\s*(\d{2}[/-]\d{2}[/-]\d{4})/i,
    /(?:vencimento|venc)\s*[:\s]*(\d{4}[/-]\d{2}[/-]\d{2})/i
  ];
  for (const pat of duePatterns) {
    const m = fullText.match(pat);
    if (m) {
      const parts = m[1].replace(/\//g, '-').split('-');
      res.dueDate = parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
      res.date = res.dueDate;
      break;
    }
  }

  const compMatch = fullText.match(/(?:m[eê]s\/ano|refer[eê]ncia|ref\.?|compet[eê]ncia)\s*[:\s]*(\d{2}\/\d{4})/i) || fullText.match(/(\d{2}\/\d{4})\s*(?:refer[eê]ncia|m[eê]s\/ano)/i);
  if (compMatch) {
    const [mm, yyyy] = compMatch[1].split('/');
    res.competence = `${yyyy}-${mm.padStart(2, '0')}`;
  } else if (res.dueDate && !res.competence) {
    res.competence = res.dueDate.slice(0, 7);
  }

  if (!res.date) {
    const emiMatch = fullText.match(/(?:emiss[aã]o|data\s+da\s+emiss[aã]o|emitido\s+em|data\s+de\s+emiss[aã]o)\s*[:\s]*(\d{2}[/-]\d{2}[/-]\d{4})/i) || fullText.match(/(?:emiss[aã]o)\s*[:\s]*(\d{4}[/-]\d{2}[/-]\d{2})/i);
    if (emiMatch) {
      const parts = emiMatch[1].replace(/\//g, '-').split('-');
      res.date = parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
      if (!res.competence) res.competence = res.date.slice(0, 7);
    }
  }

  if (!res.amount) {
    const valPatterns = [
      /(?:total\s+a\s+pagar|valor\s+a\s+pagar|valor\s+total|total\s+da\s+fatura|total\s+fatura|valor\s+do\s+documento|valor\s+cobrado|valor\s+l[ií]quido|total\s+da\s+nota|total\s+nota|total\s+geral|valor\s+fatura)\s*[:\s]*R?\$?\s*([\d.]+,\d{2})/i,
      /R\$\s*([\d.]+,\d{2})\s*(?:total\s+a\s+pagar|vencimento)/i,
      /R\$\s*([\d.]+,\d{2})/i
    ];
    for (const pat of valPatterns) {
      const m = fullText.match(pat);
      if (m) {
        const parsedAmt = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(parsedAmt) && parsedAmt > 0) { res.amount = parsedAmt; break; }
      }
    }
  }

  if (!res.description || isInvalidMerchantName(res.description)) {
    const merchantMatch = fullText.match(/(?:benefici[aá]rio|raz[aã]o\s+social|nome\s+empresarial|cedente|prestador|emitente|estabelecimento)\s*[:\s]*([^\n\r,;]{3,50})/i);
    if (merchantMatch && !isInvalidMerchantName(merchantMatch[1])) res.description = merchantMatch[1].trim();
  }

  if (!res.description || isInvalidMerchantName(res.description)) {
    if (res.model === '66') res.description = 'Conta de Energia Elétrica';
    else if (res.isBoleto) res.description = 'Fatura / Boleto';
    else if (res.nNF) res.description = `Nota Fiscal #${res.nNF}`;
    else res.description = 'Despesa / Fatura';
  }
  return res;
}

function mergeScanResults(codes, textData = null) {
  const visualList = codes && codes.length ? [...new Set(codes.map(c => c.trim()).filter(Boolean))] : [];
  let baseObj = null;

  if (visualList.length > 0) {
    let nfceObj = null;
    let pixObj = null;

    for (const c of visualList) {
      const p = parseSingleCode(c);
      if (!p) continue;
      if (p.isPix) pixObj = p;
      else if (p.accessKey || p.rawUrl.includes('sefaz') || p.rawUrl.includes('nfce') || p.rawUrl.includes('nfe')) nfceObj = p;
    }

    if (nfceObj && pixObj) {
      baseObj = {
        ...nfceObj,
        isPix: true,
        pixCode: pixObj.pixCode,
        pixReceiver: pixObj.pixReceiver,
        pixTxid: pixObj.pixTxid
      };
      if (!baseObj.amount && pixObj.amount) baseObj.amount = pixObj.amount;
      if (pixObj.pixReceiver && (!baseObj.description || isInvalidMerchantName(baseObj.description) || baseObj.description.startsWith('Compra Cupom'))) {
        baseObj.description = `${pixObj.pixReceiver}${baseObj.nNF ? ` (#${baseObj.nNF})` : ''}`;
      }
    } else {
      baseObj = nfceObj || pixObj || parseSingleCode(visualList[0]);
    }
  }

  if (!baseObj && textData) {
    baseObj = textData;
  } else if (baseObj && textData) {
    if (textData.dueDate) {
      baseObj.dueDate = textData.dueDate;
      baseObj.date = textData.dueDate;
      if (!baseObj.competence) baseObj.competence = textData.competence || textData.dueDate.slice(0, 7);
    } else if (textData.date && !baseObj.date) {
      baseObj.date = textData.date;
      if (!baseObj.competence) baseObj.competence = textData.competence || textData.date.slice(0, 7);
    }
    if (textData.competence) baseObj.competence = textData.competence;
    if (textData.amount && (!baseObj.amount || baseObj.amount <= 0)) baseObj.amount = textData.amount;
    if (textData.pixCode && !baseObj.pixCode) { baseObj.pixCode = textData.pixCode; baseObj.isPix = true; }
    if (textData.boletoCode && !baseObj.boletoCode) { baseObj.boletoCode = textData.boletoCode; baseObj.isBoleto = true; }
    if (textData.accessKey && !baseObj.accessKey) {
      baseObj.accessKey = textData.accessKey; baseObj.cnpj = textData.cnpj; baseObj.nNF = textData.nNF; baseObj.model = textData.model;
      if (!baseObj.competence) baseObj.competence = textData.competence;
    }
    if (textData.docType && (!baseObj.docType || baseObj.docType === 'Cupom Fiscal (NFC-e)')) baseObj.docType = textData.docType;
    if (textData.description && (!baseObj.description || isInvalidMerchantName(baseObj.description) || baseObj.description.startsWith('Compra Cupom'))) baseObj.description = textData.description;
  }
  if (!baseObj) return null;

  if (baseObj.cnpj) {
    const k = KNOWN_CNPJS.find(x => x.root === baseObj.cnpj.replace(/[^0-9]/g, '').substring(0, 8));
    if (k) {
      baseObj.description = `${k.name}${baseObj.nNF ? ` (#${baseObj.nNF})` : ''}`;
      baseObj.suggestedCategory = k.cat;
      if (k.docType) baseObj.docType = k.docType;
    }
  }

  if (baseObj.model === '66' || (baseObj.accessKey && baseObj.accessKey.substring(20, 22) === '66')) {
    baseObj.suggestedCategory = 'Moradia'; baseObj.docType = 'Fatura de Energia (NF3e)';
    if (!baseObj.description || isInvalidMerchantName(baseObj.description)) baseObj.description = 'Conta de Energia Elétrica';
  }

  const today = new Date().toISOString().split('T')[0];
  if (!baseObj.date) {
    baseObj.date = baseObj.dueDate || (baseObj.competence && baseObj.competence !== today.slice(0, 7) ? `${baseObj.competence}-01` : today);
    baseObj.competence = baseObj.competence || today.slice(0, 7);
  }
  if (!baseObj.description || isInvalidMerchantName(baseObj.description)) {
    baseObj.description = baseObj.nNF ? `Nota Fiscal #${baseObj.nNF}` : (baseObj.isPix ? 'Pagamento PIX' : 'Despesa / Fatura');
  }

  const notesParts = [];
  if (baseObj.accessKey) notesParts.push(`Chave NF: ${baseObj.accessKey}`);
  if (baseObj.pixCode) notesParts.push(`PIX Copia e Cola: ${baseObj.pixCode}`);
  if (baseObj.boletoCode) notesParts.push(`Linha Digitável: ${baseObj.boletoCode}`);
  baseObj.notes = notesParts.join('\n');
  return baseObj;
}

function parseNFCeUrl(raw) {
  return parseSingleCode(raw);
}

const NFCeCameraManager = {
  videoElement: null, stream: null, track: null, scanIntervalId: null, isScanning: false,
  currentFacingMode: 'environment', isTorchOn: false, barcodeDetector: null,

  async initEngines() {
    await ensureEnginesLoaded();
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) this.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'itf'] });
      } catch (e) {}
    }
  },

  async start(videoEl, onResultCallback, onErrorCallback) {
    this.videoElement = videoEl; this.isScanning = true;
    await this.initEngines();
    try {
      const constraints = { video: { facingMode: { ideal: this.currentFacingMode }, width: { min: 640, ideal: 1280 }, height: { min: 480, ideal: 720 } }, audio: false };
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Câmera não suportada.');
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      this.track = this.stream.getVideoTracks()[0];
      this.startScanLoop(onResultCallback);
    } catch (err) {
      this.isScanning = false;
      if (onErrorCallback) onErrorCallback(err);
    }
  },

  startScanLoop(onResultCallback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scanFrame = async () => {
      if (!this.isScanning || !this.videoElement || this.videoElement.readyState < 2) {
        if (this.isScanning) this.scanIntervalId = requestAnimationFrame(scanFrame);
        return;
      }
      const video = this.videoElement, vw = video.videoWidth || 640, vh = video.videoHeight || 480;
      if (this.barcodeDetector) {
        try {
          const barcodes = await this.barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawTexts = barcodes.map(b => b.rawValue).filter(Boolean);
            if (rawTexts.length) { this.handleDetectedCodes(rawTexts, onResultCallback); return; }
          }
        } catch (e) {}
      }

      if (typeof window.jsQR === 'function') {
        try {
          const maxDim = 800;
          let targetW = vw, targetH = vh;
          if (targetW > maxDim) { targetH = Math.round((vh * maxDim) / targetW); targetW = maxDim; }
          canvas.width = targetW; canvas.height = targetH;
          ctx.drawImage(video, 0, 0, targetW, targetH);
          const imageData = ctx.getImageData(0, 0, targetW, targetH);
          let code = window.jsQR(imageData.data, targetW, targetH, { inversionAttempts: 'dontInvert' });
          if (!code) {
            const cropW = Math.round(targetW * 0.65), cropH = Math.round(targetH * 0.65);
            const cropX = Math.round((targetW - cropW) / 2), cropY = Math.round((targetH - cropH) / 2);
            code = window.jsQR(ctx.getImageData(cropX, cropY, cropW, cropH).data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
          }
          if (code && code.data) { this.handleDetectedCodes([code.data], onResultCallback); return; }
        } catch (err) {}
      }
      if (this.isScanning) this.scanIntervalId = setTimeout(() => requestAnimationFrame(scanFrame), 80);
    };
    requestAnimationFrame(scanFrame);
  },

  handleDetectedCodes(rawList, onResultCallback) {
    if (!this.isScanning) return;
    this.isScanning = false;
    playScanBeep();
    vibrateDevice(80);
    const parsed = mergeScanResults(rawList, null);
    this.stop();
    if (onResultCallback) onResultCallback(parsed);
  },

  async scanCanvasMultiQR(canvas) {
    const detected = new Set();
    if (this.barcodeDetector) {
      try {
        const barcodes = await this.barcodeDetector.detect(canvas);
        if (barcodes) barcodes.forEach(b => { if (b.rawValue) detected.add(b.rawValue); });
      } catch(e) {}
    }
    if (typeof window.jsQR === 'function') {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = canvas.width, h = canvas.height;
      const slices = [
        { x: 0, y: 0, w, h },
        { x: 0, y: 0, w: Math.round(w * 0.55), h: Math.round(h * 0.55) },
        { x: Math.round(w * 0.45), y: 0, w: Math.round(w * 0.55), h: Math.round(h * 0.55) },
        { x: 0, y: Math.round(h * 0.45), w: Math.round(w * 0.55), h: Math.round(h * 0.55) },
        { x: Math.round(w * 0.45), y: Math.round(h * 0.45), w: Math.round(w * 0.55), h: Math.round(h * 0.55) },
        { x: 0, y: Math.round(h * 0.35), w, h: Math.round(h * 0.65) },
        { x: 0, y: 0, w, h: Math.round(h * 0.6) },
        { x: Math.round(w * 0.2), y: Math.round(h * 0.2), w: Math.round(w * 0.6), h: Math.round(h * 0.6) }
      ];
      for (const s of slices) {
        try {
          const imgData = ctx.getImageData(s.x, s.y, s.w, s.h);
          const qr = window.jsQR(imgData.data, s.w, s.h, { inversionAttempts: 'attemptBoth' });
          if (qr && qr.data) detected.add(qr.data);
        } catch(e) {}
      }
    }
    return Array.from(detected);
  },

  async scanFile(file, onResultCallback) {
    await this.initEngines();
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (!window.pdfjsLib) throw new Error('Leitor de PDF não inicializado.');
        toast('Lendo páginas e dados fiscais do PDF...', 'info');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const allCodes = [];
        let fullPdfText = '';
        for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 4); pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          try {
            const textContent = await page.getTextContent();
            fullPdfText += ' ' + textContent.items.map(item => item.str).join(' ');
          } catch(e) {}
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageCodes = await this.scanCanvasMultiQR(canvas);
          pageCodes.forEach(c => allCodes.push(c));
        }
        const textExtracted = extractInfoFromText(fullPdfText);
        const mergedResult = mergeScanResults(allCodes, textExtracted);
        if (mergedResult && (mergedResult.accessKey || mergedResult.pixCode || mergedResult.amount || mergedResult.dueDate || mergedResult.nNF || (mergedResult.description && !mergedResult.description.startsWith('Compra Cupom')))) {
          this.isScanning = false;
          playScanBeep(); vibrateDevice(80); this.stop();
          if (onResultCallback) onResultCallback(mergedResult);
        } else {
          toast('Nenhum dado fiscal ou QR Code legível foi identificado neste PDF. Você pode digitar ou colar as informações abaixo.', 'warning');
        }
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = objectUrl; });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let allFoundCodes = [];
      for (const maxDim of [2000, 1400, 900]) {
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) { h = Math.round((h * maxDim) / w); w = maxDim; } else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const codes = await this.scanCanvasMultiQR(canvas);
        if (codes.length) { allFoundCodes = codes; break; }
      }
      URL.revokeObjectURL(objectUrl);
      if (allFoundCodes.length) this.handleDetectedCodes(allFoundCodes, onResultCallback);
      else toast('Nenhum QR Code legível encontrado nesta imagem.', 'warning');
    } catch (err) {
      console.error(err);
      toast('Erro ao processar arquivo da nota: ' + err.message, 'error');
    }
  },

  async toggleTorch() {
    if (!this.track) return false;
    try {
      const cap = this.track.getCapabilities ? this.track.getCapabilities() : {};
      if (cap.torch) {
        this.isTorchOn = !this.isTorchOn;
        await this.track.applyConstraints({ advanced: [{ torch: this.isTorchOn }] });
        return this.isTorchOn;
      }
    } catch (e) {}
    return false;
  },

  async switchCamera(onResultCallback, onErrorCallback) {
    this.stop();
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    await this.start(this.videoElement, onResultCallback, onErrorCallback);
  },

  stop() {
    this.isScanning = false;
    if (this.scanIntervalId) { clearTimeout(this.scanIntervalId); cancelAnimationFrame(this.scanIntervalId); this.scanIntervalId = null; }
    if (this.stream) {
      this.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
      this.stream = null; this.track = null;
    }
    if (this.videoElement) this.videoElement.srcObject = null;
  }
};

function openNFCeScannerModal(customCallback = null) {
  const oldModal = document.getElementById('nfce-scanner-modal-wrap');
  if (oldModal) oldModal.remove();

  const modalWrap = document.createElement('div');
  modalWrap.id = 'nfce-scanner-modal-wrap';
  modalWrap.className = 'scanner-modal-backdrop';
  modalWrap.innerHTML = `
    <div class="scanner-modal-card">
      <div class="scanner-modal-header">
        <div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">📷</span><span style="font-weight:700;font-size:15px;color:var(--text-primary)">Leitor de Nota Fiscal (QR Code & PDF)</span></div>
        <button class="scanner-close-btn" id="scanner-btn-close" title="Fechar">✕</button>
      </div>
      <div class="scanner-viewport-container">
        <video id="nfce-scanner-video" class="scanner-video-feed" playsinline muted autoplay></video>
        <div class="scanner-hud-overlay"><div class="scanner-viewfinder"><div class="viewfinder-corner tl"></div><div class="viewfinder-corner tr"></div><div class="viewfinder-corner bl"></div><div class="viewfinder-corner br"></div><div class="scanner-laser-line"></div></div></div>
        <div class="scanner-live-badge"><span class="scanner-pulse-dot"></span> Câmera Ao Vivo</div>
        <div id="scanner-error-fallback" class="scanner-error-overlay" style="display:none">
          <div style="font-size:36px;margin-bottom:8px">⚠️</div>
          <div style="font-weight:600;font-size:14px;margin-bottom:6px" id="scanner-error-msg">Não foi possível acessar a câmera</div>
          <div style="font-size:12px;color:var(--text-muted);max-width:260px;margin-bottom:12px">Você pode carregar uma foto ou arquivo PDF da nota fiscal abaixo.</div>
          <label class="btn btn-primary btn-sm" style="cursor:pointer">📁 Carregar Foto / PDF<input type="file" id="scanner-file-fallback" accept="image/*,application/pdf" style="display:none"></label>
        </div>
      </div>
      <div class="scanner-controls-bar">
        <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:10px">Aponte para o <strong>QR Code da NFC-e ou PIX</strong> ou importe a nota</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" id="scanner-btn-switch-cam"><span>🔄</span> Trocar Câmera</button>
          <button class="btn btn-secondary btn-sm" id="scanner-btn-torch"><span>💡</span> Lanterna</button>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0"><span>📁</span> Foto / PDF da Nota<input type="file" id="scanner-file-input" accept="image/*,application/pdf" style="display:none"></label>
        </div>
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
          <div style="display:flex;gap:6px">
            <input type="text" id="scanner-manual-input" placeholder="Cole o link da SEFAZ, chave de 44 dígitos ou código PIX..." style="font-size:11.5px;padding:6px 10px;flex:1;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface)">
            <button class="btn btn-primary btn-sm" id="scanner-btn-apply-manual">Processar</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalWrap);

  const videoEl = document.getElementById('nfce-scanner-video');
  const errorOverlay = document.getElementById('scanner-error-fallback');
  const errorMsg = document.getElementById('scanner-error-msg');
  const handleSuccess = (parsedData) => { NFCeCameraManager.stop(); modalWrap.remove(); handleNFCeScanResult(parsedData, customCallback); };
  const handleError = (err) => {
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') errorMsg.innerText = 'Permissão de câmera negada';
      else if (err.name === 'NotFoundError') errorMsg.innerText = 'Nenhuma câmera detectada';
    }
  };
  const closeScannerModal = () => { NFCeCameraManager.stop(); modalWrap.remove(); };
  document.getElementById('scanner-btn-close').onclick = closeScannerModal;
  modalWrap.onclick = (e) => { if (e.target === modalWrap) closeScannerModal(); };
  document.getElementById('scanner-btn-switch-cam').onclick = () => NFCeCameraManager.switchCamera(handleSuccess, handleError);
  document.getElementById('scanner-btn-torch').onclick = async () => {
    const isLit = await NFCeCameraManager.toggleTorch();
    const btn = document.getElementById('scanner-btn-torch');
    if (btn) { btn.style.borderColor = isLit ? 'var(--accent)' : 'var(--border)'; btn.style.color = isLit ? 'var(--accent-light)' : 'var(--text-primary)'; }
  };

  const fileInput = document.getElementById('scanner-file-input');
  fileInput.onchange = (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); };
  const fileFallback = document.getElementById('scanner-file-fallback');
  if (fileFallback) fileFallback.onchange = (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); };

  const applyManual = () => {
    const val = document.getElementById('scanner-manual-input').value.trim();
    if (!val) { toast('Digite ou cole a chave ou código Pix da nota.', 'warning'); return; }
    handleSuccess(parseSingleCode(val));
  };
  document.getElementById('scanner-btn-apply-manual').onclick = applyManual;
  document.getElementById('scanner-manual-input').onkeydown = (e) => { if (e.key === 'Enter') applyManual(); };

  NFCeCameraManager.start(videoEl, handleSuccess, handleError);
}

function openNFCeConfirmationModal(parsedData, accounts, categories) {
  const today = new Date().toISOString().split('T')[0];
  const dateVal = parsedData.date || parsedData.dueDate || today;
  const competenceVal = parsedData.competence || (dateVal ? dateVal.slice(0, 7) : today.slice(0, 7));
  const amountVal = parsedData.amount != null ? parsedData.amount : '';
  const descVal = parsedData.description || 'Despesa / Fatura';

  let matchedCatId = '';
  if (parsedData.suggestedCategory) {
    const term = parsedData.suggestedCategory.toLowerCase();
    const matchedCat = categories.find(c => {
      const cn = c.name.toLowerCase();
      return cn.includes(term) || term.includes(cn) || (term === 'moradia' && (cn.includes('casa') || cn.includes('contas') || cn.includes('fixas') || cn.includes('luz') || cn.includes('energia') || cn.includes('habita')));
    });
    if (matchedCat) matchedCatId = matchedCat.id;
  }

  const isPendingBill = Boolean(parsedData.dueDate || parsedData.pixCode || parsedData.boletoCode || parsedData.model === '66');

  Modal.open('📋 Conferência da Nota Fiscal / Fatura', `
    <div class="nfce-confirm-container" style="display:flex;flex-direction:column;gap:14px">
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.06));border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius);padding:16px 18px;text-align:center;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.15)">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:22px">🧾</span>
          <span style="font-size:16px;font-weight:800;color:var(--text-primary)" id="nfce-preview-desc">${descVal}</span>
          ${parsedData.docType ? `<span class="badge badge-purple" style="font-size:10.5px;padding:2px 8px">${parsedData.docType}</span>` : ''}
          ${parsedData.uf ? `<span class="badge badge-blue" style="font-size:10px;padding:2px 6px">${parsedData.uf}</span>` : ''}
        </div>
        <div style="font-size:34px;font-weight:900;color:${amountVal !== '' ? 'var(--accent-light)' : '#fbbf24'};letter-spacing:-0.02em;margin:6px 0" id="nfce-preview-amount-display">
          ${amountVal !== '' ? fmt.currency(amountVal) : 'R$ 0,00'}
        </div>
        <div style="font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap">
          <span>📅 ${parsedData.dueDate ? 'Vencimento' : 'Data'}: <strong id="nfce-preview-date" style="color:${parsedData.dueDate ? '#60a5fa' : 'inherit'}">${fmt.date(dateVal)}</strong></span>
          ${parsedData.competence ? `<span>🗓️ Competência: <strong>${parsedData.competence}</strong></span>` : ''}
          ${parsedData.nNF ? `<span>🔢 Nº: <strong>#${parsedData.nNF}</strong></span>` : ''}
          ${parsedData.cnpj ? `<span>🏢 CNPJ: <strong>${parsedData.cnpj}</strong></span>` : ''}
        </div>
        ${parsedData.accessKey ? `<div style="margin-top:10px;font-size:10px;color:var(--text-muted);background:rgba(0,0,0,0.25);padding:4px 8px;border-radius:6px;word-break:break-all">🔑 Chave: <code>${parsedData.accessKey}</code></div>` : ''}
      </div>

      ${parsedData.pixCode ? `
        <div style="background:linear-gradient(135deg,rgba(6,182,212,0.12),rgba(16,185,129,0.08));border:1px solid rgba(6,182,212,0.3);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">⚡</span>
            <div><div style="font-size:12px;font-weight:700;color:#38bdf8">PIX de Pagamento Integrado à Fatura</div><div style="font-size:11px;color:var(--text-muted)">O código e QR Code do PIX ficarão salvos para pagamento direto</div></div>
          </div>
          <div style="display:flex;gap:6px">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-conf-copy-pix" style="font-size:11px;padding:4px 10px">📋 Copiar Pix</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-conf-view-pix" style="font-size:11px;padding:4px 10px;background:#0284c7;border:none">📱 Ver QR Code</button>
          </div>
        </div>
        <div id="conf-pix-preview-box" style="display:none;background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px">Escaneie com o aplicativo do seu banco:</div>
          <img id="conf-pix-img" style="width:160px;height:160px;background:white;padding:6px;border-radius:8px;margin:0 auto;display:block">
        </div>
      ` : ''}

      ${parsedData.boletoCode ? `
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">📄</span>
            <div><div style="font-size:12px;font-weight:700;color:var(--text-primary)">Código de Barras / Arrecadação</div><code style="font-size:10.5px;color:var(--text-muted);word-break:break-all">${parsedData.boletoCode}</code></div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-conf-copy-barcode" style="font-size:11px;padding:4px 10px">📋 Copiar Código</button>
        </div>
      ` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Descrição</label><input type="text" id="nfce-conf-desc" value="${descVal}" style="font-size:13px;font-weight:600"></div>
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Valor (R$)</label><input type="number" step="0.01" min="0" id="nfce-conf-amount" placeholder="0,00" value="${amountVal}" style="font-size:13px;font-weight:700;color:var(--accent-light)"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Conta / Cartão Pagador</label><select id="nfce-conf-account" style="font-size:13px">${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}</select></div>
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Categoria</label><select id="nfce-conf-category" style="font-size:13px"><option value="">Sem categoria</option>${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `<option value="${c.id}" ${String(c.id) === String(matchedCatId) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}</select></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">${parsedData.dueDate ? 'Data de Vencimento' : 'Data do Pagamento'}</label><input type="date" id="nfce-conf-date" value="${dateVal}" style="font-size:13px"></div>
        <div class="form-group" style="margin:0"><label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Mês de Competência</label><input type="month" id="nfce-conf-competence" value="${competenceVal}" style="font-size:13px"></div>
      </div>

      <div class="form-group" style="margin:4px 0 0 0">
        <label style="font-size:12.5px;display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="nfce-conf-paid" ${isPendingBill ? '' : 'checked'}> Já foi pago / debitado da conta</label>
      </div>

      <div style="padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-secondary" id="nfce-conf-btn-reject" style="color:#f87171;border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);font-weight:600;padding:8px 16px;border-radius:8px;display:flex;align-items:center;gap:6px"><span>✕</span> Não Aceitar</button>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-secondary" id="nfce-conf-btn-more-options" style="font-weight:600;padding:8px 14px;border-radius:8px;display:flex;align-items:center;gap:6px" title="Abrir no formulário completo com todas as opções"><span>✏️</span> Mais Opções</button>
          <button type="button" class="btn btn-primary" id="nfce-conf-btn-accept" style="font-weight:700;padding:8px 20px;border-radius:8px;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#10b981,#059669);border:none;box-shadow:0 4px 14px rgba(16,185,129,0.3)"><span>✓</span> Aceitar e Criar Lançamento</button>
        </div>
      </div>
    </div>
  `);

  const amountInput = document.getElementById('nfce-conf-amount');
  const descInput = document.getElementById('nfce-conf-desc');
  const previewAmount = document.getElementById('nfce-preview-amount-display');
  const previewDesc = document.getElementById('nfce-preview-desc');
  const dateInput = document.getElementById('nfce-conf-date');
  const previewDate = document.getElementById('nfce-preview-date');

  if (amountInput && previewAmount) {
    amountInput.oninput = () => {
      const val = parseFloat(amountInput.value);
      previewAmount.innerText = (!isNaN(val) && val > 0) ? fmt.currency(val) : 'R$ 0,00';
      previewAmount.style.color = (!isNaN(val) && val > 0) ? 'var(--accent-light)' : '#fbbf24';
    };
    if (amountVal === '' || amountVal === 0) setTimeout(() => { try { amountInput.focus(); } catch (e) {} }, 100);
  }

  if (descInput && previewDesc) {
    descInput.oninput = () => { previewDesc.innerText = descInput.value.trim() || 'Despesa / Fatura'; };
  }
  if (dateInput && previewDate) {
    dateInput.onchange = () => {
      if (dateInput.value) {
        previewDate.innerText = fmt.date(dateInput.value);
        const compInput = document.getElementById('nfce-conf-competence');
        if (compInput) compInput.value = dateInput.value.slice(0, 7);
      }
    };
  }

  if (parsedData.pixCode) {
    const copyPixBtn = document.getElementById('btn-conf-copy-pix');
    if (copyPixBtn) {
      copyPixBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(parsedData.pixCode);
        toast('📋 Código PIX copiado para a área de transferência!', 'success');
      };
    }
    const viewPixBtn = document.getElementById('btn-conf-view-pix');
    const pixBox = document.getElementById('conf-pix-preview-box');
    const pixImg = document.getElementById('conf-pix-img');
    if (viewPixBtn && pixBox && pixImg) {
      viewPixBtn.onclick = async () => {
        if (pixBox.style.display === 'none') {
          pixBox.style.display = 'block';
          if (typeof window.QRCode !== 'undefined' && window.QRCode.toDataURL) {
            try { pixImg.src = await window.QRCode.toDataURL(parsedData.pixCode, { width: 320, margin: 1 }); } catch(e) {}
          }
        } else {
          pixBox.style.display = 'none';
        }
      };
    }
  }

  if (parsedData.boletoCode) {
    const copyBarcodeBtn = document.getElementById('btn-conf-copy-barcode');
    if (copyBarcodeBtn) {
      copyBarcodeBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(parsedData.boletoCode);
        toast('📋 Código de Barras copiado para a área de transferência!', 'success');
      };
    }
  }

  document.getElementById('nfce-conf-btn-reject').onclick = () => { Modal.close(); toast('Leitura da nota fiscal descartada.', 'info'); };

  document.getElementById('nfce-conf-btn-more-options').onclick = () => {
    const updatedPrefill = {
      ...parsedData,
      description: descInput.value.trim(),
      amount: parseFloat(amountInput.value) || null,
      date: dateInput.value,
      competence: document.getElementById('nfce-conf-competence').value,
      suggestedCategory: categories.find(c => String(c.id) === String(document.getElementById('nfce-conf-category').value))?.name || parsedData.suggestedCategory
    };
    Modal.close();
    openAvulsoModal(accounts, categories, null, 'expense', updatedPrefill);
  };

  document.getElementById('nfce-conf-btn-accept').onclick = async () => {
    try {
      const amount = parseFloat(amountInput.value);
      const date = dateInput.value;
      const account_id = parseInt(document.getElementById('nfce-conf-account').value);
      const description = descInput.value.trim();
      const category_id = parseInt(document.getElementById('nfce-conf-category').value) || null;
      const competenceMonthVal = document.getElementById('nfce-conf-competence').value;
      const competence_date = competenceMonthVal ? `${competenceMonthVal}-01` : null;
      const is_paid = document.getElementById('nfce-conf-paid').checked ? 1 : 0;

      if (!amount || amount <= 0) { toast('Informe o valor da despesa/fatura.', 'error'); amountInput.focus(); return; }
      if (!date) { toast('Informe a data de vencimento/pagamento.', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione a conta pagadora.', 'error'); return; }

      const txData = {
        user_id: State.user.id, account_id, category_id, recurring_item_id: null,
        type: 'expense', amount, description: description || 'Fatura / Nota Fiscal',
        date, is_paid, is_avulso: 1,
        notes: parsedData.notes || (parsedData.accessKey ? `Chave: ${parsedData.accessKey}` : null),
        pix_code: parsedData.pixCode || null,
        credit_product: 'normal', due_date: parsedData.dueDate || null, competence_date
      };

      const res = await window.api.transactions.create(txData);
      if (res && res.error) { toast(res.error, 'error'); return; }

      Modal.close();
      toast(`✅ Lançamento de ${fmt.currency(amount)} criado com sucesso!`, 'success');
      if (typeof renderRecurring === 'function' && State.currentPage === 'recurring') renderRecurring();
      if (typeof renderDashboard === 'function' && (State.currentPage === 'dashboard' || !State.currentPage)) renderDashboard();
    } catch (err) {
      toast('Erro ao criar lançamento: ' + err.message, 'error');
    }
  };
}

async function handleNFCeScanResult(parsedData, customCallback = null) {
  if (!parsedData) { toast('Não foi possível extrair dados válidos da nota fiscal.', 'error'); return; }
  if (customCallback && typeof customCallback === 'function') { customCallback(parsedData); return; }

  try {
    const [accounts, categories] = await Promise.all([
      window.api.accounts.getAll(State.user.id),
      window.api.categories.getAll(State.user.id)
    ]);
    openNFCeConfirmationModal(parsedData, accounts, categories);
  } catch (err) {
    toast('Erro ao carregar dados para confirmação do lançamento.', 'error');
  }
}
