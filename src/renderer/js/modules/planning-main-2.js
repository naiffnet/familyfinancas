/* ===
 * planning-main-2.js — Parte 2 de planning-main
 * Linhas 2780–3060 do app.js
 */

function confirmReopenInvoice(inv) {
  const isReneg = inv.is_renegotiated === 1;
  const title = isReneg ? `Desfazer Acordo / Reabrir Fatura` : `Desfazer Pagamento da Fatura`;
  const mStr = String(inv.month).padStart(2, '0');

  Modal.open(title, `
    <div style="padding: 16px;">
      <p style="font-size:14px;color:var(--text-primary);margin-bottom:14px;line-height:1.5">
        Tem certeza de que deseja <strong>reabrir a fatura do cartão "${inv.card_name}"</strong> referente ao mês <strong>${mStr}/${inv.year}</strong>?
      </p>
      
      <div style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
        ${isReneg ? `
          <div style="color:#f59e0b;font-weight:700;margin-bottom:6px">⚠️ O que acontecerá ao desfazer o acordo:</div>
          • O status de <strong>Renegociada / Parcelada</strong> desta fatura será cancelado.<br>
          • As compras e lançamentos deste ciclo voltarão para o status <strong>Em Aberto</strong>.<br>
          • O valor total da fatura será <strong>recalculado automaticamente</strong> com base nos lançamentos reais existentes.<br>
          • Se houve entrada paga por conta corrente, o valor será estornado na conta.<br>
          • As parcelas futuras deste acordo específico que não foram pagas serão removidas.
        ` : `
          <div style="color:var(--accent-light);font-weight:700;margin-bottom:6px">⚠️ O que acontecerá ao desfazer a quitação:</div>
          • O pagamento registrado de <strong>R$ ${fmt.currency(inv.amount)}</strong> será cancelado.<br>
          • O saldo da conta utilizada para pagamento será estornado.<br>
          • A fatura e suas compras voltarão para o status <strong>Em Aberto</strong> para você ajustar ou quitar novamente.
        `}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button type="button" class="btn btn-danger" id="btn-confirm-reopen-invoice" style="background:#ef4444;border-color:#ef4444;color:#fff;font-weight:700;padding:8px 16px;border-radius:8px">
          Sim, Reabrir Fatura
        </button>
      </div>
    </div>
  `);

  const confirmBtn = document.getElementById('btn-confirm-reopen-invoice');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = 'Reabrindo...';
      try {
        const activeUserId = (State.user && State.user.id) || (inv && inv.user_id) || 1;
        const res = await window.api.invoices.reopen({
          invoiceId: inv.id,
          userId: activeUserId
        });
        if (res && res.success) {
          Modal.close();
          toast(res.message || 'Fatura reaberta com sucesso!');
          if (typeof renderRecurring === 'function') renderRecurring();
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderTransactions === 'function') renderTransactions();
          if (typeof renderAccounts === 'function') renderAccounts();
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Sim, Reabrir Fatura';
          toast(res ? res.error : 'Erro ao reabrir fatura', 'error');
        }
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Sim, Reabrir Fatura';
        toast('Erro ao reabrir fatura: ' + err.message, 'error');
      }
    };
  }
}

function openRenegotiateInvoiceModal(inv, accounts) {
  const b = BANKS[inv.bank] || BANKS.outro;
  const checkingAccounts = accounts.filter(a => a.type !== 'credit');
  const today = new Date().toISOString().split('T')[0];

  let nextM = inv.month + 1;
  let nextY = inv.year;
  if (nextM > 12) {
    nextM = 1;
    nextY += 1;
  }
  const defaultFirstMonth = `${nextY}-${String(nextM).padStart(2, '0')}`;
  const invAmount = inv.amount;

  Modal.open(`🤝 Renegociar / Parcelar Fatura: ${inv.card_name}`, `
    <div style="padding: 16px;">
      <!-- Invoice Summary Header -->
      <div style="padding:14px;border-radius:var(--radius-sm);background:#f59e0b15;border:1px solid #f59e0b44;border-left:5px solid #f59e0b;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">Fatura em Aberto (Ref: ${String(inv.month).padStart(2,'0')}/${inv.year})</div>
            <div style="font-size:22px;font-weight:900;color:#ef4444;margin-top:2px">${fmt.currency(invAmount)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Cartão: ${inv.card_name} • Titular: ${inv.user_name}</div>
          </div>
          <span style="font-size:32px">🤝</span>
        </div>
      </div>

      <!-- Down Payment Section -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Valor da Entrada à Vista (R$)</label>
          <input type="number" step="0.01" min="0" max="${invAmount}" id="reneg-down-payment" placeholder="0,00" value="0" style="font-weight:700">
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Pagamento da Entrada</label>
          <input type="date" id="reneg-down-date" value="${today}">
        </div>
      </div>

      <div class="form-group" id="group-down-account" style="margin-bottom: 14px; display: none;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Conta Corrente Pagadora da Entrada</label>
        <select id="reneg-down-account" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-raised);color:var(--text-primary)">
          ${checkingAccounts.map(a => `<option value="${a.id}">${a.name} (Saldo: ${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>

      <!-- Installments Configuration -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Número de Parcelas do Acordo</label>
          <select id="reneg-count" style="font-weight:700">
            ${[2,3,4,5,6,7,8,9,10,11,12,15,18,24,36].map(n => `<option value="${n}" ${n === 6 ? 'selected' : ''}>${n} vezes (${n}x)</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Mês da 1ª Parcela</label>
          <input type="month" id="reneg-first-month" value="${defaultFirstMonth}">
        </div>
      </div>

      <!-- Value / Interest Calculation Mode -->
      <div class="form-row" style="margin-bottom: 14px;">
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Valor de Cada Parcela (R$)</label>
          <input type="number" step="0.01" min="0" id="reneg-installment-amount" placeholder="0,00" style="font-weight:900;font-size:16px;color:#f59e0b">
        </div>
        <div class="form-group" style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Taxa de Juros Mensal (% a.m.)</label>
          <input type="number" step="0.01" min="0" id="reneg-interest-rate" placeholder="0,00" value="0">
        </div>
      </div>

      <!-- Live Simulation Summary Box -->
      <div id="reneg-simulation-box" style="padding:14px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px dashed var(--border);margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">📊 Resumo do Acordo</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;font-size:12px">
          <div>
            <div style="color:var(--text-muted)">Saldo Financiado:</div>
            <div id="sim-financed" style="font-weight:700;color:var(--text-primary)">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Total das Parcelas:</div>
            <div id="sim-total-installments" style="font-weight:700;color:var(--text-primary)">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Juros do Acordo:</div>
            <div id="sim-interest" style="font-weight:700;color:#ef4444">R$ 0,00</div>
          </div>
          <div>
            <div style="color:var(--text-muted)">Total do Acordo:</div>
            <div id="sim-grand-total" style="font-weight:900;color:#f59e0b">R$ 0,00</div>
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Observação / Detalhes do Acordo (Opcional)</label>
        <input type="text" id="reneg-notes" placeholder="Ex: Acordo realizado pelo app do banco...">
      </div>

      <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;text-align:center">
        🔒 <em>A fatura antiga será marcada como quitada pelo acordo, a entrada (se informada) sairá da conta corrente e o parcelamento ficará no cartão comprometendo o limite mês a mês.</em>
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="reneg-cancel">Cancelar</button>
        <button class="btn" id="reneg-confirm" style="background: #f59e0b; border-color: #f59e0b; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 8px">
          🤝 Confirmar e Lançar Parcelamento
        </button>
      </div>
    </div>
  `);

  const downInput = document.getElementById('reneg-down-payment');
  const countSelect = document.getElementById('reneg-count');
  const installmentInput = document.getElementById('reneg-installment-amount');
  const interestInput = document.getElementById('reneg-interest-rate');
  const groupDownAccount = document.getElementById('group-down-account');

  const updateSimulation = (source = 'auto') => {
    const down = parseFloat(downInput.value) || 0;
    groupDownAccount.style.display = down > 0 ? 'block' : 'none';

    const count = parseInt(countSelect.value, 10) || 6;
    const financed = Math.max(0, invAmount - down);

    if (source === 'interest' || source === 'auto' || source === 'down' || source === 'count') {
      const rateMonthly = (parseFloat(interestInput.value) || 0) / 100;
      let calculatedInstallment = 0;
      if (rateMonthly > 0) {
        // PMT = PV * ( i * (1+i)^n ) / ((1+i)^n - 1)
        calculatedInstallment = financed * (rateMonthly * Math.pow(1 + rateMonthly, count)) / (Math.pow(1 + rateMonthly, count) - 1);
      } else {
        calculatedInstallment = financed / count;
      }
      installmentInput.value = calculatedInstallment > 0 ? calculatedInstallment.toFixed(2) : '';
    }

    const currentInstallment = parseFloat(installmentInput.value) || 0;
    const totalInstallments = currentInstallment * count;
    const grandTotal = down + totalInstallments;
    const interestTotal = Math.max(0, grandTotal - invAmount);

    document.getElementById('sim-financed').textContent = fmt.currency(financed);
    document.getElementById('sim-total-installments').textContent = fmt.currency(totalInstallments);
    document.getElementById('sim-interest').textContent = fmt.currency(interestTotal);
    document.getElementById('sim-grand-total').textContent = fmt.currency(grandTotal);
  };

  downInput.oninput = () => updateSimulation('down');
  countSelect.onchange = () => updateSimulation('count');
  interestInput.oninput = () => updateSimulation('interest');
  installmentInput.oninput = () => updateSimulation('manual');

  // Initial calculation
  updateSimulation('auto');

  document.getElementById('reneg-cancel').onclick = Modal.close;
  document.getElementById('reneg-confirm').onclick = async () => {
    const downPayment = parseFloat(downInput.value) || 0;
    const downPaymentDate = document.getElementById('reneg-down-date').value;
    const downPaymentAccountId = downPayment > 0 ? parseInt(document.getElementById('reneg-down-account').value, 10) : null;
    const installmentsCount = parseInt(countSelect.value, 10);
    const installmentAmount = parseFloat(installmentInput.value) || 0;
    const firstInstallmentMonth = document.getElementById('reneg-first-month').value;
    const notes = (document.getElementById('reneg-notes').value || '').trim();

    if (downPayment > 0 && (!downPaymentAccountId || isNaN(downPaymentAccountId))) {
      toast('Selecione a conta corrente de onde saiu o pagamento da entrada', 'error');
      return;
    }
    if (!installmentsCount || installmentsCount < 2) {
      toast('Informe um número válido de parcelas (mínimo 2x)', 'error');
      return;
    }
    if (!installmentAmount || installmentAmount <= 0) {
      toast('Informe o valor de cada parcela', 'error');
      return;
    }
    if (!firstInstallmentMonth) {
      toast('Informe o mês da 1ª parcela', 'error');
      return;
    }

    try {
      const res = await window.api.invoices.renegotiate({
        invoiceId: inv.id,
        downPayment,
        downPaymentAccountId,
        downPaymentDate,
        installmentsCount,
        installmentAmount,
        firstInstallmentMonth,
        notes,
        userId: State.user.id
      });

      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }

      toast(`Acordo da fatura "${inv.card_name}" registrado com sucesso em ${installmentsCount}x!`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao registrar acordo: ' + err.message, 'error');
    }
  };
}
