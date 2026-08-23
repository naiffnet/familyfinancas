/* ===
 * payment-modal.js — L3852–4013 do app.js
 */

async function openPaymentDateModal(txId, currentDate, onComplete) {
  const cleanDate = currentDate ? currentDate.split(' ')[0] : new Date().toISOString().split('T')[0];
  let tx = null;
  try {
    const allTxs = await window.api.transactions.getAll({ userId: State.user.id });
    tx = allTxs.find(t => t.id == txId);
  } catch (e) {
    console.error(e);
  }
  const compDate = tx ? tx.date.split(' ')[0] : cleanDate;
  const baseAmount = tx ? tx.amount : 0;

  Modal.open('Confirmar Pagamento / Liquidação', `
    <div style="padding: 16px;">
      <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); text-align: center;">
        Informe a data do efetivo pagamento e eventuais ajustes (juros ou desconto):
      </p>
      
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Efetivo Pagamento</label>
        <input type="date" id="payment-date-input" value="${cleanDate}" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 600;">
      </div>

      <div id="payment-options-container" style="background: var(--bg-raised); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 16px;">
      </div>

      <div id="payment-summary-box" style="padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.3);">
        <strong>Total a Debitar da Conta:</strong> <span id="payment-total-preview" style="font-weight:700; font-size:15px; color:var(--accent-light);">${fmt.currency(baseAmount)}</span>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="btn-pay-cancel">Cancelar</button>
        <button class="btn btn-primary" id="btn-pay-confirm" style="background: var(--accent); border-color: var(--accent); font-weight: 600;">
          Confirmar Pagamento
        </button>
      </div>
    </div>
  `);

  const dateInput = document.getElementById('payment-date-input');
  const optContainer = document.getElementById('payment-options-container');
  const totalPreview = document.getElementById('payment-total-preview');

  function updatePaymentOptionsUI() {
    const selDate = dateInput.value;
    let html = '';
    let isEarly = selDate < compDate;
    let isLate = selDate > compDate;

    if (isEarly) {
      html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;font-weight:600;color:var(--accent-light)">
            <input type="checkbox" id="chk-discount"> 🏷️ Aplicar desconto por antecipação
          </label>
          <div id="row-discount-val" style="display:none;margin-top:4px">
            <label style="font-size:11px;color:var(--text-muted)">Valor do Desconto (R$)</label>
            <input type="number" step="0.01" min="0" id="input-discount-val" placeholder="0.00" style="width:100%;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary)">
          </div>
        </div>
      `;
    } else if (isLate) {
      html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;font-weight:600;color:#fbbf24">
            <input type="checkbox" id="chk-penalty"> ⚠️ Aplicar juros/multa por atraso
          </label>
          <div id="row-penalty-val" style="display:none;margin-top:4px">
            <label style="font-size:11px;color:var(--text-muted)">Valor de Juros/Multa (R$)</label>
            <input type="number" step="0.01" min="0" id="input-penalty-val" placeholder="0.00" style="width:100%;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary)">
          </div>
        </div>
      `;
    } else {
      html = `<div style="font-size:12px;color:var(--text-muted);text-align:center">Pagamento na data exata de vencimento (${fmt.date(compDate)})</div>`;
    }
    optContainer.innerHTML = html;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount) {
      chkDiscount.onchange = () => {
        document.getElementById('row-discount-val').style.display = chkDiscount.checked ? 'block' : 'none';
        recalcTotal();
      };
    }
    if (chkPenalty) {
      chkPenalty.onchange = () => {
        document.getElementById('row-penalty-val').style.display = chkPenalty.checked ? 'block' : 'none';
        recalcTotal();
      };
    }
    if (inputDiscount) inputDiscount.oninput = recalcTotal;
    if (inputPenalty) inputPenalty.oninput = recalcTotal;

    recalcTotal();
  }

  function recalcTotal() {
    let penaltyVal = 0;
    let discountVal = 0;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount && chkDiscount.checked && inputDiscount) {
      discountVal = parseFloat(inputDiscount.value) || 0;
    }
    if (chkPenalty && chkPenalty.checked && inputPenalty) {
      penaltyVal = parseFloat(inputPenalty.value) || 0;
    }

    const finalNet = baseAmount + penaltyVal - discountVal;
    totalPreview.innerText = fmt.currency(finalNet);
  }

  dateInput.onchange = updatePaymentOptionsUI;
  updatePaymentOptionsUI();

  document.getElementById('btn-pay-cancel').onclick = Modal.close;
  document.getElementById('btn-pay-confirm').onclick = async () => {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
      toast('Selecione uma data válida', 'error');
      return;
    }

    let penalty_amount = 0;
    let discount_amount = 0;

    const chkDiscount = document.getElementById('chk-discount');
    const chkPenalty = document.getElementById('chk-penalty');
    const inputDiscount = document.getElementById('input-discount-val');
    const inputPenalty = document.getElementById('input-penalty-val');

    if (chkDiscount && chkDiscount.checked && inputDiscount) {
      discount_amount = parseFloat(inputDiscount.value) || 0;
    }
    if (chkPenalty && chkPenalty.checked && inputPenalty) {
      penalty_amount = parseFloat(inputPenalty.value) || 0;
    }

    try {
      await window.api.transactions.togglePaidWithDate(txId, selectedDate, { penalty_amount, discount_amount });
      toast('Pagamento confirmado com sucesso!');
      Modal.close();
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar status', 'error');
    }
  };
}

// ════════════════════════════════════════
// ACCOUNTS
// ════════════════════════════════════════