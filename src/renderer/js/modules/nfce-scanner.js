/* ===
 * nfce-scanner.js — Scanner de Notas Fiscais (NFC-e / SAT / Pix) via Câmera e QR Code
 * Módulo para FamilyFinancas
 * === */

/**
 * Emite feedback sonoro futurista e agradável de leitura de QR Code usando Web Audio API
 */
function playScanBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Tom 1 (Frequência média alta)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // Nota A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // Nota A6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.16);

    setTimeout(() => {
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    }, 300);
  } catch (err) {
    console.debug('[Scanner] Audio feedback indisponível:', err);
  }
}

/**
 * Emite vibração háptica no dispositivo mobile
 */
function vibrateDevice(ms = 70) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch (e) {}
}

/**
 * Parser inteligente de URLs de QR Code da SEFAZ (NFC-e / NF-e), SAT-CF-e, Pix e Boletos
 */
function parseNFCeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();

  let result = {
    type: 'expense',
    amount: null,
    date: null,
    competence: null,
    description: '',
    suggestedCategory: '',
    accessKey: '',
    cnpj: '',
    nNF: '',
    uf: '',
    rawUrl: text,
    isPix: false,
    isBoleto: false
  };

  // 1. Detecção de Pix Copia e Cola (EMVCo)
  if (text.startsWith('000201') && text.includes('BR.GOV.BCB.PIX')) {
    result.isPix = true;
    result.description = 'Pagamento PIX';
    result.suggestedCategory = 'Alimentação';
    
    // Extrai valor do Pix (Tag 54: 5405123.45)
    const pixValMatch = text.match(/54\d{2}([0-9.]+)/);
    if (pixValMatch) {
      result.amount = parseFloat(pixValMatch[1]);
    }
    
    // Extrai nome do recebedor (Tag 59: 5915NOME DO RECEBEDOR)
    const pixNameMatch = text.match(/59(\d{2})([^0-9]+)/);
    if (pixNameMatch) {
      const len = parseInt(pixNameMatch[1], 10);
      const nameRaw = pixNameMatch[2].substring(0, len).trim();
      if (nameRaw) {
        result.description = `PIX para ${nameRaw}`;
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    result.date = today;
    result.competence = today.slice(0, 7);
    return result;
  }

  // 2. Detecção de Boleto / Código de Barras (44, 47 ou 48 dígitos)
  const cleanDigits = text.replace(/[^0-9]/g, '');
  if ((cleanDigits.length === 47 || cleanDigits.length === 48) && !text.includes('http')) {
    result.isBoleto = true;
    result.description = 'Pagamento de Boleto';
    result.suggestedCategory = 'Moradia';
    
    // Extrai valor da linha digitável de título bancário (últimos 10 dígitos)
    if (cleanDigits.length === 47) {
      const valStr = cleanDigits.slice(-10);
      const valCents = parseInt(valStr, 10);
      if (valCents > 0) {
        result.amount = valCents / 100;
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    result.date = today;
    result.competence = today.slice(0, 7);
    return result;
  }

  // 3. Extração de Chave de Acesso de NFC-e / NF-e (44 dígitos contínuos)
  const keyMatch = text.match(/\b([0-9]{44})\b/) || text.match(/[?&]p=([0-9]{44})/i) || text.match(/[?&]chNFe=([0-9]{44})/i);
  if (keyMatch) {
    result.accessKey = keyMatch[1];
    
    // UF (2 primeiros dígitos)
    const ufCode = result.accessKey.substring(0, 2);
    const ufMap = {
      '11':'RO','12':'AC','13':'AM','14':'RR','15':'PA','16':'AP','17':'TO',
      '21':'MA','22':'PI','23':'CE','24':'RN','25':'PB','26':'PE','27':'AL','28':'SE','29':'BA',
      '31':'MG','32':'ES','33':'RJ','35':'SP',
      '41':'PR','42':'SC','43':'RS',
      '50':'MS','51':'MT','52':'GO','53':'DF'
    };
    result.uf = ufMap[ufCode] || 'BR';

    // Ano e Mês (dígitos 3 a 6: AAMM)
    const aa = result.accessKey.substring(2, 4);
    const mm = result.accessKey.substring(4, 6);
    const year = parseInt(aa, 10) + 2000;
    const month = mm.padStart(2, '0');
    result.competence = `${year}-${month}`;

    // CNPJ do emitente (dígitos 7 a 20)
    const rawCnpj = result.accessKey.substring(6, 20);
    result.cnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

    // Número da NF (dígitos 26 a 34)
    const rawNum = result.accessKey.substring(25, 34);
    result.nNF = parseInt(rawNum, 10).toString();
  }

  // 4. Extração de Valor Total (formato Pipe | ou query params)
  // Padrão SEFAZ p=CHAVE|VERSAO|TP_AMB|C_DEST|VALOR_TOTAL|DIG_VAL...
  if (text.includes('|')) {
    const pipeParts = text.split('|');
    for (const part of pipeParts) {
      if (/^\d+[.,]\d{2}$/.test(part.trim())) {
        const val = parseFloat(part.trim().replace(',', '.'));
        if (!isNaN(val) && val > 0 && val !== 2) {
          result.amount = val;
          break;
        }
      }
    }
  }

  // Query parameter vTot ou vNF ou valor
  if (!result.amount) {
    const valMatch = text.match(/[?&](?:vTot|vNF|valor|total|amount)=([0-9.,]+)/i);
    if (valMatch) {
      result.amount = parseFloat(valMatch[1].replace(',', '.'));
    }
  }

  // Se tiver data atual ou da competência da nota
  const today = new Date().toISOString().split('T')[0];
  if (result.competence) {
    const todayComp = today.slice(0, 7);
    if (result.competence === todayComp) {
      result.date = today;
    } else {
      result.date = `${result.competence}-01`;
    }
  } else {
    result.date = today;
    result.competence = today.slice(0, 7);
  }

  // 5. Reconhecimento de Estabelecimentos por CNPJ, URL ou Palavras-chave
  const knownMerchants = [
    { pattern: /zaffari|bourbon|cia.*zaffari/i, name: 'Supermercado Zaffari', cat: 'Alimentação' },
    { pattern: /carrefour/i, name: 'Carrefour Supermercado', cat: 'Alimentação' },
    { pattern: /pao.*acucar|extra|sendas|assai/i, name: 'Supermercado', cat: 'Alimentação' },
    { pattern: /panvel/i, name: 'Farmácia Panvel', cat: 'Saúde' },
    { pattern: /raia|drogasil/i, name: 'Droga Raia / Drogasil', cat: 'Saúde' },
    { pattern: /sao.*joao/i, name: 'Farmácia São João', cat: 'Saúde' },
    { pattern: /pague.*menos/i, name: 'Farmácia Pague Menos', cat: 'Saúde' },
    { pattern: /ipiranga/i, name: 'Posto Ipiranga', cat: 'Transporte' },
    { pattern: /shell/i, name: 'Posto Shell', cat: 'Transporte' },
    { pattern: /petrobras|br.*distribuidora|vibra/i, name: 'Posto Petrobras', cat: 'Transporte' },
    { pattern: /mcdonald|mc.*donald/i, name: 'McDonald\'s', cat: 'Alimentação' },
    { pattern: /burger.*king/i, name: 'Burger King', cat: 'Alimentação' },
    { pattern: /leroy.*merlin/i, name: 'Leroy Merlin', cat: 'Moradia' },
    { pattern: /cassol/i, name: 'Cassol Centerlar', cat: 'Moradia' },
    { pattern: /renner/i, name: 'Lojas Renner', cat: 'Vestuário' },
    { pattern: /riachuelo/i, name: 'Lojas Riachuelo', cat: 'Vestuário' },
    { pattern: /c&a|cea/i, name: 'Lojas C&A', cat: 'Vestuário' }
  ];

  for (const m of knownMerchants) {
    if (m.pattern.test(text)) {
      result.description = m.name + (result.nNF ? ` (NFC-e #${result.nNF})` : '');
      result.suggestedCategory = m.cat;
      break;
    }
  }

  if (!result.description) {
    if (result.nNF) {
      result.description = `Compra Cupom Fiscal NFC-e #${result.nNF}`;
    } else {
      result.description = `Compra Cupom Fiscal (${result.uf || 'NFC-e'})`;
    }
    result.suggestedCategory = 'Alimentação';
  }

  return result;
}

/**
 * Controlador de Câmera e Scanner de QR Code
 */
const NFCeCameraManager = {
  videoElement: null,
  stream: null,
  track: null,
  scanIntervalId: null,
  isScanning: false,
  currentFacingMode: 'environment',
  isTorchOn: false,
  barcodeDetector: null,

  async initDetector() {
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) {
          this.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'itf'] });
        }
      } catch (e) {
        console.debug('[Scanner] Falha ao inicializar BarcodeDetector nativo:', e);
      }
    }
  },

  async start(videoEl, onResultCallback, onErrorCallback) {
    this.videoElement = videoEl;
    this.isScanning = true;
    await this.initDetector();

    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.currentFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste dispositivo/navegador.');
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.track = this.stream.getVideoTracks()[0];

      // Inicia loop de escaneamento
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
        if (this.isScanning) {
          this.scanIntervalId = requestAnimationFrame(scanFrame);
        }
        return;
      }

      try {
        // 1. Tentativa nativa ultra-rápida (BarcodeDetector)
        if (this.barcodeDetector) {
          const barcodes = await this.barcodeDetector.detect(this.videoElement);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            if (rawVal) {
              this.handleDetectedCode(rawVal, onResultCallback);
              return;
            }
          }
        }
      } catch (err) {
        // Se falhar a detecção nativa em frame
      }

      // Reagenda próximo frame
      if (this.isScanning) {
        this.scanIntervalId = setTimeout(() => {
          requestAnimationFrame(scanFrame);
        }, 120);
      }
    };

    requestAnimationFrame(scanFrame);
  },

  handleDetectedCode(rawText, onResultCallback) {
    if (!this.isScanning) return;
    this.isScanning = false;
    playScanBeep();
    vibrateDevice(80);

    const parsed = parseNFCeUrl(rawText);
    this.stop();
    if (onResultCallback) {
      onResultCallback(parsed);
    }
  },

  async toggleTorch() {
    if (!this.track) return false;
    try {
      const capabilities = this.track.getCapabilities ? this.track.getCapabilities() : {};
      if (capabilities.torch) {
        this.isTorchOn = !this.isTorchOn;
        await this.track.applyConstraints({
          advanced: [{ torch: this.isTorchOn }]
        });
        return this.isTorchOn;
      }
    } catch (e) {
      console.debug('[Scanner] Erro ao alternar lanterna:', e);
    }
    return false;
  },

  async switchCamera(onResultCallback, onErrorCallback) {
    this.stop();
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    await this.start(this.videoElement, onResultCallback, onErrorCallback);
  },

  async scanImageFile(file, onResultCallback) {
    await this.initDetector();
    if (!this.barcodeDetector) {
      toast('Detecção de imagem não suportada neste navegador.', 'warning');
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const barcodes = await this.barcodeDetector.detect(bitmap);
      if (barcodes && barcodes.length > 0) {
        this.handleDetectedCode(barcodes[0].rawValue, onResultCallback);
      } else {
        toast('Nenhum QR Code legível foi encontrado nesta imagem.', 'warning');
      }
    } catch (err) {
      console.error('[Scanner] Erro ao escanear imagem:', err);
      toast('Erro ao processar imagem da nota.', 'error');
    }
  },

  stop() {
    this.isScanning = false;
    if (this.scanIntervalId) {
      clearTimeout(this.scanIntervalId);
      cancelAnimationFrame(this.scanIntervalId);
      this.scanIntervalId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      this.stream = null;
      this.track = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
};

/**
 * Abre o Modal de Leitura de Nota Fiscal com Câmera ao Vivo
 */
function openNFCeScannerModal(customCallback = null) {
  // Remove modal anterior se existente
  const oldModal = document.getElementById('nfce-scanner-modal-wrap');
  if (oldModal) oldModal.remove();

  const modalWrap = document.createElement('div');
  modalWrap.id = 'nfce-scanner-modal-wrap';
  modalWrap.className = 'scanner-modal-backdrop';
  modalWrap.innerHTML = `
    <div class="scanner-modal-card">
      <div class="scanner-modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📷</span>
          <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">Leitor de Nota Fiscal (QR Code)</span>
        </div>
        <button class="scanner-close-btn" id="scanner-btn-close" title="Fechar Scanner">✕</button>
      </div>

      <!-- Viewport de Vídeo com Retículo Futurista -->
      <div class="scanner-viewport-container">
        <video id="nfce-scanner-video" class="scanner-video-feed" playsinline muted autoplay></video>
        
        <div class="scanner-hud-overlay">
          <div class="scanner-viewfinder">
            <div class="viewfinder-corner tl"></div>
            <div class="viewfinder-corner tr"></div>
            <div class="viewfinder-corner bl"></div>
            <div class="viewfinder-corner br"></div>
            <div class="scanner-laser-line"></div>
          </div>
        </div>

        <div class="scanner-live-badge">
          <span class="scanner-pulse-dot"></span> Câmera Ao Vivo
        </div>

        <div id="scanner-error-fallback" class="scanner-error-overlay" style="display: none;">
          <div style="font-size: 36px; margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;" id="scanner-error-msg">Não foi possível acessar a câmera</div>
          <div style="font-size: 12px; color: var(--text-muted); max-width: 260px; margin-bottom: 12px;">Você pode carregar uma foto da nota fiscal ou digitar a chave de 44 dígitos abaixo.</div>
          <label class="btn btn-primary btn-sm" style="cursor: pointer;">
            📁 Carregar Foto da Nota
            <input type="file" id="scanner-file-fallback" accept="image/*" style="display: none;">
          </label>
        </div>
      </div>

      <!-- Instruções e Controles -->
      <div class="scanner-controls-bar">
        <div style="font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 10px;">
          Aponte para o <strong>QR Code impresso no cupom fiscal (NFC-e / SAT / Pix)</strong>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="scanner-btn-switch-cam" title="Alternar Câmera">
            <span>🔄</span> Trocar Câmera
          </button>
          
          <button class="btn btn-secondary btn-sm" id="scanner-btn-torch" title="Alternar Lanterna">
            <span>💡</span> Lanterna
          </button>

          <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;" title="Carregar Foto da Galeria">
            <span>📁</span> Foto da Nota
            <input type="file" id="scanner-file-input" accept="image/*" style="display: none;">
          </label>
        </div>

        <!-- Entrada Manual de Chave ou Link -->
        <div style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="scanner-manual-input" placeholder="Cole o link da SEFAZ ou chave de 44 dígitos..." style="font-size: 11.5px; padding: 6px 10px; flex: 1; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface);">
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

  // Callback de Sucesso
  const handleSuccess = (parsedData) => {
    closeScannerModal();
    handleNFCeScanResult(parsedData, customCallback);
  };

  // Callback de Erro na Câmera
  const handleError = (err) => {
    console.warn('[Scanner] Erro na câmera:', err);
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg.innerText = 'Permissão de câmera negada no navegador';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg.innerText = 'Nenhuma câmera detectada neste computador';
      }
    }
  };

  function closeScannerModal() {
    NFCeCameraManager.stop();
    modalWrap.remove();
  }

  // Event Listeners
  document.getElementById('scanner-btn-close').addEventListener('click', closeScannerModal);
  modalWrap.addEventListener('click', (e) => {
    if (e.target === modalWrap) closeScannerModal();
  });

  document.getElementById('scanner-btn-switch-cam').addEventListener('click', () => {
    NFCeCameraManager.switchCamera(handleSuccess, handleError);
  });

  document.getElementById('scanner-btn-torch').addEventListener('click', async () => {
    const isLit = await NFCeCameraManager.toggleTorch();
    const btn = document.getElementById('scanner-btn-torch');
    if (btn) {
      btn.style.borderColor = isLit ? 'var(--accent)' : 'var(--border)';
      btn.style.color = isLit ? 'var(--accent-light)' : 'var(--text-primary)';
    }
  });

  const fileInput = document.getElementById('scanner-file-input');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      NFCeCameraManager.scanImageFile(e.target.files[0], handleSuccess);
    }
  });

  const fileFallback = document.getElementById('scanner-file-fallback');
  if (fileFallback) {
    fileFallback.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        NFCeCameraManager.scanImageFile(e.target.files[0], handleSuccess);
      }
    });
  }

  const applyManual = () => {
    const val = document.getElementById('scanner-manual-input').value.trim();
    if (!val) {
      toast('Digite ou cole a URL da SEFAZ ou chave da nota.', 'warning');
      return;
    }
    const parsed = parseNFCeUrl(val);
    handleSuccess(parsed);
  };

  document.getElementById('scanner-btn-apply-manual').addEventListener('click', applyManual);
  document.getElementById('scanner-manual-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyManual();
  });

  // Inicia a Câmera
  NFCeCameraManager.start(videoEl, handleSuccess, handleError);
}

/**
 * Processa os dados extraídos da Nota Fiscal e direciona para o Modal de Lançamento
 */
async function handleNFCeScanResult(parsedData, customCallback = null) {
  if (!parsedData) {
    toast('Não foi possível extrair dados válidos da nota fiscal.', 'error');
    return;
  }

  if (customCallback && typeof customCallback === 'function') {
    customCallback(parsedData);
    return;
  }

  try {
    const accounts = await window.api.accounts.getAll({ userId: State.user.id });
    const categories = await window.api.categories.getAll({ userId: State.user.id });

    // Abre o modal de lançamento avulso pré-preenchido
    openAvulsoModal(accounts, categories, null, 'expense', parsedData);

    const feedbackDesc = parsedData.description || 'Nota Fiscal';
    const feedbackVal = parsedData.amount ? ` no valor de R$ ${parsedData.amount.toFixed(2)}` : '';
    toast(`✅ ${feedbackDesc}${feedbackVal} lido com sucesso!`, 'success');
  } catch (err) {
    console.error('[Scanner] Erro ao abrir modal com dados da nota:', err);
    toast('Erro ao abrir formulário de lançamento.', 'error');
  }
}
