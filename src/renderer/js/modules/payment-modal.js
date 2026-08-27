/* ===
 * payment-modal.js — Modal de Liquidação / Pagamento com suporte a QR Code PIX
 */

async function ensureQRCodeLoaded() {
  if (typeof window.QRCode !== 'undefined') return;
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'js/vendor/qrcode.min.js';
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

async function openPaymentDateModal(txId, currentDate, onComplete) {
  await ensureQRCodeLoaded();
  const cleanDate = currentDate ? currentDate.split(' ')[0] : new Date().toISOString().split('T')[0];
  let tx = null;
  let recItem = null;
  try {
    const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
    tx = allTxs.find(t => t.id == txId);
    if (tx && tx.recurring_item_id) {
      const allRec = await window.api.recurring.getAll(State.user.id);
      recItem = allRec.find(r => r.id == tx.recurring_item_id);
    } else if (!tx) {
      const allRec = await window.api.recurring.getAll(State.user.id);
      recItem = allRec.find(r => r.id == txId);
      if (recItem) tx = allTxs.find(t => t.recurring_item_id == recItem.id);
    }
  } catch (e) {
    console.error(e);
  }

  const compDate = tx ? tx.date.split(' ')[0] : cleanDate;
  const baseAmount = tx ? tx.amount : 0;
  const desc = tx ? (tx.description || 'Despesa / Fatura') : (recItem ? recItem.name : 'Despesa / Fatura');

  let pixCode = tx ? (tx.pix_code || null) : null;
  if (!pixCode && tx && tx.notes) {
    const m = tx.notes.match(/(00020126[0-9A-Za-z.=-]+)/i) || tx.notes.match(/(000201[0-9A-Za-z.=-]{30,})/i);
    if (m) pixCode = m[1].trim();
  }
  if (!pixCode && recItem && recItem.notes) {
    const m = recItem.notes.match(/(00020126[0-9A-Za-z.=-]+)/i) || recItem.notes.match(/(000201[0-9A-Za-z.=-]{30,})/i);
    if (m) pixCode = m[1].trim();
  }

  let boletoCode = tx ? (tx.boleto_code || null) : null;
  if (!boletoCode && tx && tx.notes) {
    const m = tx.notes.match(/(?:Linha Digit[aá]vel|C[oó]digo de Barras|Boleto)\s*[:\s]*([0-9\s.-]{47,58})/i) ||
              tx.notes.match(/\b(8\d{11}\s*\d{12}\s*\d{12}\s*\d{12})\b/) ||
              tx.notes.match(/\b(8\d{47})\b/) ||
              tx.notes.match(/\b(\d{5}\.?\d{5}\s+\d{5}\.?\d{6}\s+\d{5}\.?\d{6}\s+\d\s+\d{14})\b/) ||
              tx.notes.match(/\b(\d{47})\b/);
    if (m) boletoCode = (m[1] || m[0]).replace(/[^0-9]/g, '');
  }
  if (!boletoCode && recItem && recItem.notes) {
    const m = recItem.notes.match(/(?:Linha Digit[aá]vel|C[oó]digo de Barras|Boleto)\s*[:\s]*([0-9\s.-]{47,58})/i) ||
              recItem.notes.match(/\b(8\d{47})\b/) ||
              recItem.notes.match(/\b(\d{47})\b/);
    if (m) boletoCode = (m[1] || m[0]).replace(/[^0-9]/g, '');
  }

  const rule = {
    interest_rate: (tx && tx.interest_rate !== undefined && tx.interest_rate !== null) ? tx.interest_rate : (recItem ? recItem.interest_rate : 0),
    interest_type: (tx && tx.interest_type) ? tx.interest_type : (recItem ? recItem.interest_type : 'daily'),
    penalty_fixed_rate: (tx && tx.penalty_fixed_rate !== undefined && tx.penalty_fixed_rate !== null) ? tx.penalty_fixed_rate : (recItem ? recItem.penalty_fixed_rate : 0),
  };

  const initialProjection = calculateProjectedInterest(baseAmount, compDate, cleanDate, rule);
  const initialPaymentValue = (tx && tx.is_paid && tx.penalty_amount)
    ? (baseAmount + (tx.penalty_amount || 0) - (tx.discount_amount || 0))
    : initialProjection.projectedAmount;

  Modal.open('Confirmar Pagamento / Liquidação', `
    <div style="padding: 14px 16px;">
      <div style="text-align: center; margin-bottom: 14px;">
        <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">${desc}</div>
        <div style="font-size: 26px; font-weight: 900; color: var(--accent-light); letter-spacing: -0.02em;">${fmt.currency(baseAmount)}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Vencimento Original: <strong>${fmt.date(compDate)}</strong></div>
      </div>

      <!-- PAINEL PIX E BOLETO -->
      <div id="payment-pix-boleto-wrapper" style="margin-bottom: 14px;">
        ${pixCode ? `
          <div style="background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08)); border: 1px solid rgba(6,182,212,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm" id="btn-toggle-pix-qr" style="font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span>📱</span> Exibir QR CODE do PIX
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-pix-code" style="font-size: 12px; font-weight: 600; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span>📋</span> Copiar Código PIX
              </button>
            </div>
            <div id="payment-pix-qr-container" style="margin-top: 8px; display: flex; flex-direction: column; align-items: center;">
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Aponte a câmera do aplicativo do seu banco para o QR Code:</p>
              <img id="payment-pix-qrcode-img" alt="QR Code PIX" style="width: 170px; height: 170px; border-radius: 8px; background: white; padding: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
            </div>
          </div>
        ` : `
          <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <span>⚡</span> <span>Deseja pagar via PIX?</span>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-show-pix-input" style="font-size: 11px; padding: 4px 10px;">
                <span>⚡</span> Gerar QR Code PIX
              </button>
            </div>
            <div id="payment-pix-custom-box" style="display: none; margin-top: 10px;">
              <div style="display: flex; gap: 6px;">
                <input type="text" id="input-custom-pix-code" placeholder="Cole o código PIX Copia e Cola (00020126...)..." style="flex: 1; padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
                <button type="button" class="btn btn-primary btn-sm" id="btn-generate-custom-pix" style="font-size: 11.5px; padding: 6px 12px; background: #0284c7; border: none; font-weight: 700;">Gerar QR</button>
              </div>
              <div id="payment-pix-custom-qr-wrap" style="display: none; text-align: center; margin-top: 10px;">
                <img id="payment-pix-custom-qrcode-img" style="width: 160px; height: 160px; border-radius: 8px; background: white; padding: 6px; margin: 0 auto; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-custom-pix" style="margin-top: 8px; font-size: 11px;">📋 Copiar Código PIX</button>
              </div>
            </div>
          </div>
        `}

        ${boletoCode ? `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; overflow: hidden;">
              <span>📄</span> <code style="font-size: 10.5px; color: var(--text-muted); word-break: break-all;">${boletoCode}</code>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-pay-barcode" style="font-size: 11px; padding: 4px 10px;">📋 Copiar Código</button>
          </div>
        ` : ''}
      </div>

      <p style="margin-bottom: 12px; font-size: 12.5px; color: var(--text-secondary); text-align: center;">
        Informe a <strong>Data</strong> e o <strong>Valor Pago</strong> para cálculo automático de encargos:
      </p>
      
      <!-- VALORES E DATAS DE PAGAMENTO -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Data do Pagamento</label>
          <input type="date" id="payment-date-input" value="${cleanDate}" style="width: 100%; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 700; font-size: 13px;">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-muted)">Valor Pago (R$)</label>
          <input type="number" step="0.01" min="0" id="payment-amount-input" value="${initialPaymentValue.toFixed(2)}" style="width: 100%; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 800; font-size: 14px;">
        </div>
      </div>

      <!-- CARD DINÂMICO DE JUROS / DIAS / TAXA DIÁRIA -->
      <div id="payment-interest-calc-card" style="margin-bottom: 14px;"></div>

      <div id="payment-summary-box" style="padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 14px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.3);">
        <strong>Total a Debitar da Conta:</strong> <span id="payment-total-preview" style="font-weight:700; font-size:15px; color:var(--accent-light);">${fmt.currency(initialPaymentValue)}</span>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="btn-pay-cancel" style="padding: 8px 18px;">Cancelar</button>
        <button class="btn btn-primary" id="btn-pay-confirm" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700; padding: 8px 22px; box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
          Confirmar Pagamento
        </button>
      </div>
    </div>
  `);

  const dateInput = document.getElementById('payment-date-input');
  const amountInput = document.getElementById('payment-amount-input');
  const calcCard = document.getElementById('payment-interest-calc-card');
  const totalPreview = document.getElementById('payment-total-preview');

  let hasManuallyEditedAmount = false;
  amountInput.oninput = () => {
    hasManuallyEditedAmount = true;
    recalcPaymentUI();
  };

  dateInput.onchange = () => {
    if (!hasManuallyEditedAmount) {
      const proj = calculateProjectedInterest(baseAmount, compDate, dateInput.value, rule);
      amountInput.value = proj.projectedAmount.toFixed(2);
    }
    recalcPaymentUI();
  };

  function recalcPaymentUI() {
    const selDate = dateInput.value;
    const paidVal = parseFloat(amountInput.value) || 0;
    const diff = Math.round((paidVal - baseAmount) * 100) / 100;

    let daysDiff = 0;
    if (selDate && compDate) {
      const d1 = new Date(selDate + 'T00:00:00');
      const d2 = new Date(compDate + 'T00:00:00');
      daysDiff = Math.round((d1 - d2) / 86400000);
    }
    const daysLate = Math.max(0, daysDiff);
    const daysEarly = Math.max(0, -daysDiff);

    let html = '';
    if (diff > 0.005) {
      const totalPct = baseAmount > 0 ? ((diff / baseAmount) * 100).toFixed(2) : '0.00';
      const dailyRatePct = daysLate > 0 ? (totalPct / daysLate).toFixed(3) : totalPct;
      const dailyVal = daysLate > 0 ? (diff / daysLate) : diff;

      html = `
        <div style="background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08)); border: 1px solid rgba(245,158,11,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; font-size: 13.5px; color: #f59e0b; margin-bottom: 6px;">
            <span>⚠️</span> Juros / Encargos: +${fmt.currency(diff)} (+${totalPct}%)
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            ${daysLate > 0 ? `<span>📅 <strong>${daysLate} ${daysLate === 1 ? 'dia' : 'dias'} de atraso</strong></span>` : `<span>⚡ Pago na data c/ encargos</span>`}
            ${daysLate > 0 ? `<span>📈 Taxa diária: <strong style="color:#fbbf24">${dailyRatePct}% ao dia</strong> (${fmt.currency(dailyVal)}/dia)</span>` : ''}
          </div>
        </div>
      `;
    } else if (diff < -0.005) {
      const absDiff = Math.abs(diff);
      const discPct = baseAmount > 0 ? ((absDiff / baseAmount) * 100).toFixed(2) : '0.00';
      html = `
        <div style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08)); border: 1px solid rgba(16,185,129,0.35); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; font-size: 13.5px; color: var(--accent-light); margin-bottom: 6px;">
            <span>🏷️</span> Desconto Obtido: -${fmt.currency(absDiff)} (-${discPct}%)
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${daysEarly > 0 ? `📅 Pago com <strong>${daysEarly} ${daysEarly === 1 ? 'dia' : 'dias'} de antecedência</strong>` : `🏷️ Desconto concedido no vencimento`}
          </div>
        </div>
      `;
    } else {
      html = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px; text-align: center; font-size: 12px; color: var(--text-muted);">
          ✅ Pagamento no valor original exato (sem juros nem descontos)
        </div>
      `;
    }

    calcCard.innerHTML = html;
    totalPreview.innerText = fmt.currency(paidVal);
  }

  recalcPaymentUI();

  // Render QR Code PIX se existente
  if (pixCode) {
    const copyBtn = document.getElementById('btn-copy-pix-code');
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pixCode);
        toast('📋 Código PIX copiado! Cole no app do seu banco.', 'success');
      };
    }
    const toggleBtn = document.getElementById('btn-toggle-pix-qr');
    const qrContainer = document.getElementById('payment-pix-qr-container');
    const qrcodeImg = document.getElementById('payment-pix-qrcode-img');

    if (qrcodeImg && typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      QRCode.toDataURL(pixCode, { width: 340, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => { qrcodeImg.src = url; })
        .catch(err => console.error('[Pix QR] Erro ao renderizar QR code:', err));
    }
    if (toggleBtn && qrContainer) {
      toggleBtn.onclick = () => {
        const isHidden = qrContainer.style.display === 'none';
        qrContainer.style.display = isHidden ? 'flex' : 'none';
        toggleBtn.innerHTML = isHidden ? '<span>📱</span> Ocultar QR CODE' : '<span>📱</span> Exibir QR CODE do PIX';
      };
    }
  }

  // Suporte a inserção/geração dinâmica de PIX
  const btnShowPixInput = document.getElementById('btn-show-pix-input');
  const customPixBox = document.getElementById('payment-pix-custom-box');
  const btnGenCustomPix = document.getElementById('btn-generate-custom-pix');
  const inputCustomPix = document.getElementById('input-custom-pix-code');
  const customQrWrap = document.getElementById('payment-pix-custom-qr-wrap');
  const customQrImg = document.getElementById('payment-pix-custom-qrcode-img');
  const btnCopyCustomPix = document.getElementById('btn-copy-custom-pix');

  if (btnShowPixInput && customPixBox) {
    btnShowPixInput.onclick = () => {
      customPixBox.style.display = customPixBox.style.display === 'none' ? 'block' : 'none';
      if (customPixBox.style.display === 'block') inputCustomPix.focus();
    };
  }

  const renderCustomPix = async () => {
    const rawPix = inputCustomPix.value.trim();
    if (!rawPix) { toast('Cole o código PIX para gerar o QR Code.', 'warning'); return; }
    if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      try {
        customQrImg.src = await QRCode.toDataURL(rawPix, { width: 320, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
        customQrWrap.style.display = 'block';
        toast('✅ QR Code PIX gerado com sucesso!', 'success');
        if (tx && tx.id) {
          try {
            await window.api.transactions.update({
              id: tx.id,
              notes: (tx.notes ? tx.notes + '\n' : '') + `PIX Copia e Cola: ${rawPix}`
            });
          } catch(e) {}
        }
      } catch (err) {
        toast('Erro ao gerar QR Code: ' + err.message, 'error');
      }
    }
  };

  if (btnGenCustomPix) btnGenCustomPix.onclick = renderCustomPix;
  if (inputCustomPix) inputCustomPix.onkeydown = (e) => { if (e.key === 'Enter') renderCustomPix(); };
  if (btnCopyCustomPix) {
    btnCopyCustomPix.onclick = () => {
      if (inputCustomPix.value && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inputCustomPix.value.trim());
        toast('📋 Código PIX copiado!', 'success');
      }
    };
  }

  if (boletoCode) {
    const copyBarcodeBtn = document.getElementById('btn-copy-pay-barcode');
    if (copyBarcodeBtn) {
      copyBarcodeBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(boletoCode);
        toast('📋 Código de barras copiado!', 'success');
      };
    }
  }

  document.getElementById('btn-pay-cancel').onclick = Modal.close;
  document.getElementById('btn-pay-confirm').onclick = async () => {
    const selectedDate = dateInput.value;
    const paidVal = parseFloat(amountInput.value);
    if (!selectedDate) {
      toast('Selecione uma data válida', 'error');
      return;
    }
    if (isNaN(paidVal) || paidVal < 0) {
      toast('Informe um valor de pagamento válido', 'error');
      return;
    }

    const diff = Math.round((paidVal - baseAmount) * 100) / 100;
    const penalty_amount = diff > 0 ? diff : 0;
    const discount_amount = diff < 0 ? Math.abs(diff) : 0;

    try {
      await window.api.transactions.togglePaidWithDate(txId, selectedDate, { penalty_amount, discount_amount });
      toast('Pagamento confirmado com sucesso!', 'success');
      Modal.close();
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar status: ' + err.message, 'error');
    }
  };
}

/**
 * Abre o Modal Dedicado de Pagamento via PIX com exibição do QR Code e confirmação direta (OK Já Pago)
 */
async function openPixPaymentModal(txOrId, onComplete) {
  let tx = typeof txOrId === 'object' && txOrId !== null ? txOrId : null;
  if (!tx && txOrId) {
    try {
      const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
      tx = allTxs.find(t => t.id == txOrId);
    } catch (e) {
      console.error(e);
    }
  }
  if (!tx) {
    toast('Lançamento não encontrado.', 'error');
    return;
  }

  const pixCode = tx.pix_code || (tx.notes ? (tx.notes.match(/000201[0-9A-Za-z.=-]+/) || [])[0] : null);
  if (!pixCode) {
    toast('Este lançamento não possui código PIX associado.', 'warning');
    return;
  }

  const desc = tx.description || 'Pagamento PIX';
  const amt = tx.amount || 0;
  const today = new Date().toISOString().split('T')[0];

  Modal.open('⚡ Pagar com PIX', `
    <div style="padding: 14px 16px; text-align: center;">
      <div style="background: linear-gradient(135deg, rgba(6,182,212,0.14), rgba(16,185,129,0.08)); border: 1px solid rgba(6,182,212,0.35); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${desc}</div>
        <div style="font-size: 32px; font-weight: 900; color: var(--accent-light); letter-spacing: -0.02em; margin: 4px 0;">${fmt.currency(amt)}</div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Aponte o aplicativo do seu banco para o QR Code abaixo:</div>

        <div style="display: flex; justify-content: center; margin: 12px 0;">
          <img id="pix-direct-qrcode-img" alt="QR Code PIX" style="width: 190px; height: 190px; border-radius: 12px; background: white; padding: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.2);">
        </div>

        <button type="button" class="btn btn-secondary btn-sm" id="btn-pix-direct-copy" style="font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; margin: 0 auto;">
          <span>📋</span> Copiar Código PIX (Copia e Cola)
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="btn btn-primary" id="btn-pix-direct-confirm-paid" style="font-weight: 700; font-size: 14px; padding: 11px 20px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
          <span>✅</span> Confirmar Pagamento Realizado (OK Já Pago)
        </button>
        <button type="button" class="btn btn-secondary" id="btn-pix-direct-close" style="padding: 8px; font-size: 12.5px;">
          Fechar (Pagar Mais Tarde)
        </button>
      </div>
    </div>
  `);

  const qrcodeImg = document.getElementById('pix-direct-qrcode-img');
  if (qrcodeImg && typeof QRCode !== 'undefined' && QRCode.toDataURL) {
    QRCode.toDataURL(pixCode, { width: 400, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => { qrcodeImg.src = url; })
      .catch(err => console.error('[Pix QR] Erro ao renderizar QR code:', err));
  }

  document.getElementById('btn-pix-direct-copy').onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pixCode);
    }
    toast('📋 Código PIX copiado com sucesso! Cole no app do seu banco.', 'success');
  };

  document.getElementById('btn-pix-direct-close').onclick = Modal.close;

  document.getElementById('btn-pix-direct-confirm-paid').onclick = async () => {
    try {
      await window.api.transactions.togglePaidWithDate(tx.id, today, {});
      if (typeof playScanBeep === 'function') playScanBeep();
      toast(`✅ Pagamento de ${fmt.currency(amt)} confirmado com sucesso!`, 'success');
      Modal.close();
      if (onComplete) onComplete();
      else {
        if (typeof renderRecurring === 'function' && State.currentPage === 'recurring') renderRecurring();
        if (typeof renderDashboard === 'function' && (State.currentPage === 'dashboard' || !State.currentPage)) renderDashboard();
      }
    } catch (err) {
      console.error(err);
      toast('Erro ao confirmar pagamento: ' + err.message, 'error');
    }
  };
}

// ════════════════════════════════════════
// ACCOUNTS
// ════════════════════════════════════════