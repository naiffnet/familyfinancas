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

async function ensureEnginesLoaded() {
  const promises = [];
  if (typeof window.jsQR !== 'function') {
    promises.push(new Promise(res => {
      const s = document.createElement('script');
      s.src = 'js/vendor/jsQR.js';
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.head.appendChild(s);
    }));
  }
  if (typeof window.QRCode === 'undefined') {
    promises.push(new Promise(res => {
      const s = document.createElement('script');
      s.src = 'js/vendor/qrcode.min.js';
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.head.appendChild(s);
    }));
  }
  if (typeof window.pdfjsLib === 'undefined') {
    promises.push(new Promise(res => {
      const s = document.createElement('script');
      s.src = 'js/vendor/pdf.min.js';
      s.onload = () => {
        try {
          if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
        } catch(e) {}
        res(true);
      };
      s.onerror = () => res(false);
      document.head.appendChild(s);
    }));
  }
  await Promise.all(promises);
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
  { root: '94896792', name: 'Supermercados Rissul', cat: 'Alimentação' },
  { root: '92754738', name: 'Supermercado Zaffari', cat: 'Alimentação' },
  { root: '45543915', name: 'Carrefour Supermercado', cat: 'Alimentação' },
  { root: '01545822', name: 'Supermercados Asun', cat: 'Alimentação' },
  { root: '07170938', name: 'Stok Center Atacado', cat: 'Alimentação' },
  { root: '06057223', name: 'Assaí Atacadista', cat: 'Alimentação' },
  { root: '47508411', name: 'Pão de Açúcar / Extra', cat: 'Alimentação' },
  { root: '75315333', name: 'Bistek Supermercados', cat: 'Alimentação' },
  { root: '83646984', name: 'Fort Atacadista', cat: 'Alimentação' },
  { root: '02502844', name: 'Angeloni Supermercados', cat: 'Alimentação' },
  { root: '92999999', name: 'Farmácia Panvel', cat: 'Saúde' },
  { root: '92999704', name: 'Farmácia Panvel', cat: 'Saúde' },
  { root: '92665611', name: 'Farmácia Panvel', cat: 'Saúde' },
  { root: '61585865', name: 'Droga Raia / Drogasil', cat: 'Saúde' },
  { root: '88212147', name: 'Farmácias São João', cat: 'Saúde' },
  { root: '05493015', name: 'Farmácia Pague Menos', cat: 'Saúde' },
  { root: '33000167', name: 'Posto Petrobras', cat: 'Transporte' },
  { root: '33453598', name: 'Posto Shell', cat: 'Transporte' },
  { root: '33337122', name: 'Posto Ipiranga', cat: 'Transporte' },
  { root: '92798735', name: 'Lojas Renner', cat: 'Vestuário' },
  { root: '61099966', name: 'Lojas Riachuelo', cat: 'Vestuário' },
  { root: '45242914', name: 'Lojas C&A', cat: 'Vestuário' },
  { root: '00776574', name: 'Cassol Centerlar', cat: 'Moradia' },
  { root: '01438784', name: 'Leroy Merlin', cat: 'Moradia' },
  { root: '42591651', name: 'McDonald\'s', cat: 'Alimentação' },
  { root: '13574594', name: 'Burger King', cat: 'Alimentação' }
];

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
  if (nameMatch) {
    const len = parseInt(nameMatch[1], 10);
    res.receiver = nameMatch[2].substring(0, len).trim();
  }
  const cityMatch = clean.match(/60(\d{2})([^0-9]+)/);
  if (cityMatch) {
    const len = parseInt(cityMatch[1], 10);
    res.city = cityMatch[2].substring(0, len).trim();
  }
  const txMatch = clean.match(/62\d{2}.*?05(\d{2})([a-zA-Z0-9]+)/);
  if (txMatch) {
    const len = parseInt(txMatch[1], 10);
    res.txid = txMatch[2].substring(0, len);
  }
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
      description: pix.receiver ? `PIX para ${pix.receiver}` : 'Pagamento PIX', suggestedCategory: 'Alimentação',
      accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: true, isBoleto: false,
      pixCode: pix.pixCode, pixReceiver: pix.receiver, pixTxid: pix.txid,
      notes: `PIX Copia e Cola: ${pix.pixCode}`
    };
  }

  // 2. Boleto
  const cleanDigits = text.replace(/[^0-9]/g, '');
  if ((cleanDigits.length === 47 || cleanDigits.length === 48) && !text.includes('http')) {
    const today = new Date().toISOString().split('T')[0];
    let amt = null;
    if (cleanDigits.length === 47) {
      const cents = parseInt(cleanDigits.slice(-10), 10);
      if (cents > 0) amt = cents / 100;
    }
    return {
      type: 'expense', amount: amt, date: today, competence: today.slice(0, 7),
      description: 'Pagamento de Boleto', suggestedCategory: 'Moradia', accessKey: '', cnpj: '',
      nNF: '', uf: '', rawUrl: text, isPix: false, isBoleto: true, notes: `Código de Barras: ${text}`
    };
  }

  // 3. NFC-e / NF-e SEFAZ
  let result = {
    type: 'expense', amount: null, date: null, competence: null, description: '',
    suggestedCategory: '', accessKey: '', cnpj: '', nNF: '', uf: '', rawUrl: text, isPix: false, isBoleto: false
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
    result.nNF = parseInt(result.accessKey.substring(25, 34), 10).toString();
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
        if (!isNaN(val) && val > 0 && !(i <= 3 && (val === 1 || val === 2))) {
          if (!result.amount) result.amount = val;
        }
      }
      const pIsoM = token.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (pIsoM && !result.date) { result.date = `${pIsoM[1]}-${pIsoM[2]}-${pIsoM[3]}`; result.competence = `${pIsoM[1]}-${pIsoM[2]}`; }
      const pBrM = token.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (pBrM && !result.date) { result.date = `${pBrM[3]}-${pBrM[2]}-${pBrM[1]}`; result.competence = `${pBrM[3]}-${pBrM[2]}`; }

      const decodedHex = decodeHexAscii(token);
      if (decodedHex) {
        if (/^\d+[.,]\d{2}$/.test(decodedHex) || /^\d+[.,]\d+$/.test(decodedHex)) {
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
      result.description = `${k.name}${result.nNF ? ` (NFC-e #${result.nNF})` : ''}`;
      result.suggestedCategory = k.cat;
    }
  }

  if (!result.description) {
    const merchants = [
      { pattern: /zaffari|bourbon/i, name: 'Supermercado Zaffari', cat: 'Alimentação' },
      { pattern: /carrefour/i, name: 'Carrefour Supermercado', cat: 'Alimentação' },
      { pattern: /rissul|unidasul|macromix/i, name: 'Supermercados Rissul', cat: 'Alimentação' },
      { pattern: /pao.*acucar|extra|assai/i, name: 'Supermercado', cat: 'Alimentação' },
      { pattern: /panvel/i, name: 'Farmácia Panvel', cat: 'Saúde' },
      { pattern: /raia|drogasil/i, name: 'Droga Raia / Drogasil', cat: 'Saúde' },
      { pattern: /sao.*joao/i, name: 'Farmácia São João', cat: 'Saúde' },
      { pattern: /pague.*menos/i, name: 'Farmácia Pague Menos', cat: 'Saúde' },
      { pattern: /ipiranga/i, name: 'Posto Ipiranga', cat: 'Transporte' },
      { pattern: /shell/i, name: 'Posto Shell', cat: 'Transporte' },
      { pattern: /petrobras|vibra/i, name: 'Posto Petrobras', cat: 'Transporte' },
      { pattern: /mcdonald/i, name: 'McDonald\'s', cat: 'Alimentação' },
      { pattern: /burger.*king/i, name: 'Burger King', cat: 'Alimentação' },
      { pattern: /renner/i, name: 'Lojas Renner', cat: 'Vestuário' },
      { pattern: /riachuelo/i, name: 'Lojas Riachuelo', cat: 'Vestuário' }
    ];
    for (const m of merchants) {
      if (m.pattern.test(text)) {
        result.description = `${m.name}${result.nNF ? ` (NFC-e #${result.nNF})` : ''}`;
        result.suggestedCategory = m.cat;
        break;
      }
    }
  }

  if (!result.description) {
    result.description = result.nNF ? `Compra Cupom Fiscal NFC-e #${result.nNF}` : `Compra Cupom Fiscal (${result.uf || 'NFC-e'})`;
    result.suggestedCategory = 'Alimentação';
  }

  if (result.accessKey) {
    result.notes = `Chave NFC-e: ${result.accessKey}`;
  }
  return result;
}

function mergeScanResults(codes) {
  if (!codes || !codes.length) return null;
  const uniqueCodes = [...new Set(codes.map(c => c.trim()).filter(Boolean))];
  if (uniqueCodes.length === 1) return parseSingleCode(uniqueCodes[0]);

  let nfceObj = null;
  let pixObj = null;

  for (const c of uniqueCodes) {
    const p = parseSingleCode(c);
    if (!p) continue;
    if (p.isPix) pixObj = p;
    else if (p.accessKey || p.rawUrl.includes('sefaz') || p.rawUrl.includes('nfce') || p.rawUrl.includes('nfe')) nfceObj = p;
  }

  if (nfceObj && pixObj) {
    const merged = {
      ...nfceObj,
      isPix: true,
      pixCode: pixObj.pixCode,
      pixReceiver: pixObj.pixReceiver,
      pixTxid: pixObj.pixTxid
    };
    if (!merged.amount && pixObj.amount) merged.amount = pixObj.amount;
    if (pixObj.pixReceiver && (!merged.description || merged.description.startsWith('Compra Cupom Fiscal'))) {
      merged.description = `${pixObj.pixReceiver}${merged.nNF ? ` (NFC-e #${merged.nNF})` : ''}`;
    }
    const notesParts = [];
    if (merged.accessKey) notesParts.push(`Chave NFC-e: ${merged.accessKey}`);
    if (pixObj.pixCode) notesParts.push(`PIX Copia e Cola: ${pixObj.pixCode}`);
    merged.notes = notesParts.join('\n');
    return merged;
  }

  return nfceObj || pixObj || parseSingleCode(uniqueCodes[0]);
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
        if (formats.includes('qr_code')) {
          this.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'itf'] });
        }
      } catch (e) {}
    }
  },

  async start(videoEl, onResultCallback, onErrorCallback) {
    this.videoElement = videoEl;
    this.isScanning = true;
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
      const video = this.videoElement;
      const vw = video.videoWidth || 640, vh = video.videoHeight || 480;

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
            const cropData = ctx.getImageData(cropX, cropY, cropW, cropH);
            code = window.jsQR(cropData.data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
          }
          if (code && code.data) {
            this.handleDetectedCodes([code.data], onResultCallback);
            return;
          }
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
    const parsed = mergeScanResults(rawList);
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
        { x: 0, y: 0, w: w, h: h },
        { x: 0, y: 0, w: Math.round(w / 2), h: Math.round(h / 2) },
        { x: Math.round(w / 2), y: 0, w: w - Math.round(w / 2), h: Math.round(h / 2) },
        { x: 0, y: Math.round(h / 2), w: Math.round(w / 2), h: h - Math.round(h / 2) },
        { x: Math.round(w / 2), y: Math.round(h / 2), w: w - Math.round(w / 2), h: h - Math.round(h / 2) },
        { x: 0, y: Math.round(h * 0.4), w: w, h: Math.round(h * 0.6) }
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
      // 1. PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (!window.pdfjsLib) throw new Error('Leitor de PDF não inicializado.');
        toast('Lendo páginas do PDF da nota fiscal...', 'info');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const allCodes = [];

        for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 3); pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;

          const pageCodes = await this.scanCanvasMultiQR(canvas);
          pageCodes.forEach(c => allCodes.push(c));
        }

        if (allCodes.length > 0) {
          this.handleDetectedCodes(allCodes, onResultCallback);
        } else {
          toast('Nenhum QR Code foi encontrado no PDF. Verifique se o documento contém cupom fiscal ou QR do Pix.', 'warning');
        }
        return;
      }

      // 2. Imagem
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = objectUrl; });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const testResolutions = [1800, 1200, 800];
      let allFoundCodes = [];

      for (const maxDim of testResolutions) {
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

      if (allFoundCodes.length) {
        this.handleDetectedCodes(allFoundCodes, onResultCallback);
      } else {
        toast('Nenhum QR Code legível encontrado nesta imagem.', 'warning');
      }
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
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">📷</span>
          <span style="font-weight:700;font-size:15px;color:var(--text-primary)">Leitor de Nota Fiscal (QR Code & PDF)</span>
        </div>
        <button class="scanner-close-btn" id="scanner-btn-close" title="Fechar">✕</button>
      </div>
      <div class="scanner-viewport-container">
        <video id="nfce-scanner-video" class="scanner-video-feed" playsinline muted autoplay></video>
        <div class="scanner-hud-overlay">
          <div class="scanner-viewfinder">
            <div class="viewfinder-corner tl"></div><div class="viewfinder-corner tr"></div>
            <div class="viewfinder-corner bl"></div><div class="viewfinder-corner br"></div>
            <div class="scanner-laser-line"></div>
          </div>
        </div>
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
    </div>
  `;
  document.body.appendChild(modalWrap);

  const videoEl = document.getElementById('nfce-scanner-video');
  const errorOverlay = document.getElementById('scanner-error-fallback');
  const errorMsg = document.getElementById('scanner-error-msg');

  const handleSuccess = (parsedData) => {
    NFCeCameraManager.stop();
    modalWrap.remove();
    handleNFCeScanResult(parsedData, customCallback);
  };

  const handleError = (err) => {
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') errorMsg.innerText = 'Permissão de câmera negada';
      else if (err.name === 'NotFoundError') errorMsg.innerText = 'Nenhuma câmera detectada';
    }
  };

  const closeScannerModal = () => { NFCeCameraManager.stop(); modalWrap.remove(); };
  document.getElementById('scanner-btn-close').addEventListener('click', closeScannerModal);
  modalWrap.addEventListener('click', (e) => { if (e.target === modalWrap) closeScannerModal(); });
  document.getElementById('scanner-btn-switch-cam').addEventListener('click', () => NFCeCameraManager.switchCamera(handleSuccess, handleError));
  document.getElementById('scanner-btn-torch').addEventListener('click', async () => {
    const isLit = await NFCeCameraManager.toggleTorch();
    const btn = document.getElementById('scanner-btn-torch');
    if (btn) { btn.style.borderColor = isLit ? 'var(--accent)' : 'var(--border)'; btn.style.color = isLit ? 'var(--accent-light)' : 'var(--text-primary)'; }
  });

  const fileInput = document.getElementById('scanner-file-input');
  fileInput.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); });
  const fileFallback = document.getElementById('scanner-file-fallback');
  if (fileFallback) fileFallback.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) NFCeCameraManager.scanFile(e.target.files[0], handleSuccess); });

  const applyManual = () => {
    const val = document.getElementById('scanner-manual-input').value.trim();
    if (!val) { toast('Digite ou cole a chave ou código Pix da nota.', 'warning'); return; }
    handleSuccess(parseSingleCode(val));
  };
  document.getElementById('scanner-btn-apply-manual').addEventListener('click', applyManual);
  document.getElementById('scanner-manual-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') applyManual(); });

  NFCeCameraManager.start(videoEl, handleSuccess, handleError);
}

function openNFCeConfirmationModal(parsedData, accounts, categories) {
  const today = new Date().toISOString().split('T')[0];
  const dateVal = parsedData.date || today;
  const competenceVal = parsedData.competence || (dateVal ? dateVal.slice(0, 7) : today.slice(0, 7));
  const amountVal = parsedData.amount != null ? parsedData.amount : '';
  const descVal = parsedData.description || 'Compra Cupom Fiscal';

  let matchedCatId = '';
  if (parsedData.suggestedCategory) {
    const matchedCat = categories.find(c =>
      c.name.toLowerCase().includes(parsedData.suggestedCategory.toLowerCase()) ||
      parsedData.suggestedCategory.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCat) matchedCatId = matchedCat.id;
  }

  Modal.open('📋 Conferência da Nota Fiscal', `
    <div class="nfce-confirm-container" style="display:flex;flex-direction:column;gap:14px">
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.06));border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius);padding:16px 18px;text-align:center;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.15)">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:2px">
          <span style="font-size:22px">🧾</span>
          <span style="font-size:15px;font-weight:700;color:var(--text-primary)" id="nfce-preview-desc">${descVal}</span>
          ${parsedData.uf ? `<span class="badge badge-blue" style="font-size:10px;padding:2px 6px">${parsedData.uf}</span>` : ''}
        </div>
        <div style="font-size:34px;font-weight:900;color:${amountVal !== '' ? 'var(--accent-light)' : '#fbbf24'};letter-spacing:-0.02em;margin:6px 0" id="nfce-preview-amount-display">
          ${amountVal !== '' ? fmt.currency(amountVal) : 'R$ 0,00'}
        </div>
        <div style="font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">
          <span>📅 Data: <strong id="nfce-preview-date">${fmt.date(dateVal)}</strong></span>
          ${parsedData.nNF ? `<span>🔢 NF-e: <strong>#${parsedData.nNF}</strong></span>` : ''}
          ${parsedData.cnpj ? `<span>🏢 CNPJ: <strong>${parsedData.cnpj}</strong></span>` : ''}
        </div>
        ${parsedData.accessKey ? `<div style="margin-top:10px;font-size:10px;color:var(--text-muted);background:rgba(0,0,0,0.25);padding:4px 8px;border-radius:6px;word-break:break-all">🔑 Chave: <code>${parsedData.accessKey}</code></div>` : ''}
      </div>

      ${parsedData.pixCode ? `
        <!-- Destaque do PIX Integrado da Nota Fiscal -->
        <div style="background:linear-gradient(135deg,rgba(6,182,212,0.12),rgba(16,185,129,0.08));border:1px solid rgba(6,182,212,0.3);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">⚡</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:#38bdf8">PIX de Pagamento Integrado à Nota</div>
              <div style="font-size:11px;color:var(--text-muted)">O código e QR Code do PIX ficarão salvos no lançamento</div>
            </div>
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

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Descrição</label>
          <input type="text" id="nfce-conf-desc" value="${descVal}" style="font-size:13px;font-weight:600">
        </div>
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Valor (R$)</label>
          <input type="number" step="0.01" min="0" id="nfce-conf-amount" placeholder="0,00" value="${amountVal}" style="font-size:13px;font-weight:700;color:var(--accent-light)">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Conta / Cartão Pagador</label>
          <select id="nfce-conf-account" style="font-size:13px">
            ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Categoria</label>
          <select id="nfce-conf-category" style="font-size:13px">
            <option value="">Sem categoria</option>
            ${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `
              <option value="${c.id}" ${String(c.id) === String(matchedCatId) ? 'selected' : ''}>${c.icon} ${c.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Data do Pagamento</label>
          <input type="date" id="nfce-conf-date" value="${dateVal}" style="font-size:13px">
        </div>
        <div class="form-group" style="margin:0">
          <label style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Mês de Competência</label>
          <input type="month" id="nfce-conf-competence" value="${competenceVal}" style="font-size:13px">
        </div>
      </div>

      <div class="form-group" style="margin:4px 0 0 0">
        <label style="font-size:12.5px;display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="nfce-conf-paid" ${parsedData.pixCode ? '' : 'checked'}> Já foi pago / debitado da conta
        </label>
      </div>

      <div style="padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-secondary" id="nfce-conf-btn-reject" style="color:#f87171;border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);font-weight:600;padding:8px 16px;border-radius:8px;display:flex;align-items:center;gap:6px">
          <span>✕</span> Não Aceitar
        </button>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-secondary" id="nfce-conf-btn-more-options" style="font-weight:600;padding:8px 14px;border-radius:8px;display:flex;align-items:center;gap:6px" title="Abrir no formulário completo com todas as opções">
            <span>✏️</span> Mais Opções
          </button>
          <button type="button" class="btn btn-primary" id="nfce-conf-btn-accept" style="font-weight:700;padding:8px 20px;border-radius:8px;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#10b981,#059669);border:none;box-shadow:0 4px 14px rgba(16,185,129,0.3)">
            <span>✓</span> Aceitar e Criar Lançamento
          </button>
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
    amountInput.addEventListener('input', () => {
      const val = parseFloat(amountInput.value);
      if (!isNaN(val) && val > 0) {
        previewAmount.innerText = fmt.currency(val);
        previewAmount.style.color = 'var(--accent-light)';
      } else {
        previewAmount.innerText = 'R$ 0,00';
        previewAmount.style.color = '#fbbf24';
      }
    });
    if (amountVal === '' || amountVal === 0) {
      setTimeout(() => { try { amountInput.focus(); } catch (e) {} }, 100);
    }
  }

  if (descInput && previewDesc) {
    descInput.addEventListener('input', () => { previewDesc.innerText = descInput.value.trim() || 'Compra Cupom Fiscal'; });
  }
  if (dateInput && previewDate) {
    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        previewDate.innerText = fmt.date(dateInput.value);
        const compInput = document.getElementById('nfce-conf-competence');
        if (compInput) compInput.value = dateInput.value.slice(0, 7);
      }
    });
  }

  // Ações do PIX no Pop-up
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
            try {
              pixImg.src = await window.QRCode.toDataURL(parsedData.pixCode, { width: 320, margin: 1 });
            } catch(e) {}
          }
        } else {
          pixBox.style.display = 'none';
        }
      };
    }
  }

  document.getElementById('nfce-conf-btn-reject').onclick = () => {
    Modal.close();
    toast('Leitura da nota fiscal descartada.', 'info');
  };

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

      if (!amount || amount <= 0) {
        toast('Informe o valor da compra.', 'error');
        amountInput.focus();
        return;
      }
      if (!date) { toast('Informe a data da compra.', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione a conta pagadora.', 'error'); return; }

      const txData = {
        user_id: State.user.id, account_id, category_id, recurring_item_id: null,
        type: 'expense', amount, description: description || 'Compra Cupom Fiscal',
        date, is_paid, is_avulso: 1,
        notes: parsedData.notes || (parsedData.accessKey ? `Chave NFC-e: ${parsedData.accessKey}` : null),
        pix_code: parsedData.pixCode || null,
        credit_product: 'normal', due_date: null, competence_date
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
