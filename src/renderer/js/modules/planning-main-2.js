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

/**
 * Abre o Pop-up com todas as informações detalhadas do lançamento
 * e os 3 botões de ação: Excluir, Editar e Pagar.
 */
function openTransactionDetailsModal({ tx, item, accounts = [], categories = [], type = 'expense', onUpdate = null }) {
  const isPaid = tx ? !!tx.is_paid : false;
  const description = tx ? (tx.description || (item ? item.name : 'Lançamento')) : (item ? item.name : 'Lançamento');
  const baseAmount = tx ? (tx.amount || 0) : (item ? (item.amount || 0) : 0);
  const penalty = tx ? (tx.penalty_amount || 0) : 0;
  const discount = tx ? (tx.discount_amount || 0) : 0;
  const netAmount = baseAmount + (isPaid ? (penalty - discount) : 0);

  const txDate = tx ? tx.date : (item ? `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}-${String(item.due_day || 1).padStart(2, '0')}` : null);
  const payDate = tx ? tx.payment_date : null;
  const compDate = tx ? tx.competence_date : null;

  // Account
  const accId = (tx ? tx.account_id : null) || (item ? item.account_id : null);
  const acc = accounts.find(a => a.id === accId) || {};
  const isCreditCard = acc.type === 'credit' || (item && item.account_type === 'credit');

  // Category
  const catId = (tx ? tx.category_id : null) || (item ? item.category_id : null);
  const cat = categories.find(c => c.id === catId) || {};
  const catName = cat.name || (tx ? tx.category_name : null) || (item ? item.category_name : null) || 'Sem Categoria';
  const catIcon = cat.icon || (tx ? tx.category_icon : null) || (item ? item.icon : null) || (type === 'income' ? '💰' : '📋');
  const catColor = cat.color || (item ? item.color : null) || '#94a3b8';

  // User
  const userName = (tx ? tx.user_name : null) || (acc ? acc.user_name : null) || (item ? item.user_name : null) || (State.user ? State.user.name : 'Titular');
  const userColor = (tx ? tx.user_avatar_color : null) || (acc ? acc.user_avatar_color : null) || '#10b981';

  // Notes & PIX
  const notes = (tx ? tx.notes : null) || (item ? item.notes : null) || '';
  const pixCode = (tx ? tx.pix_code : null) || (item ? item.pix_code : null) || (notes && notes.includes('000201') ? notes : null);

  // Overdue calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isPaid && txDate && txDate < todayStr;
  const holidayOrWeekend = txDate && typeof isWeekendOrHoliday === 'function' && isWeekendOrHoliday(txDate);
  const nextBusinessDay = holidayOrWeekend && typeof getNextBusinessDay === 'function' ? getNextBusinessDay(txDate) : null;

  // Projected interest if overdue
  let proj = null;
  if (isOverdue && typeof calculateOverdueProjections === 'function') {
    const dailyRate = (item && item.interest_rate) || 0.033;
    const penaltyRate = (item && item.penalty_fixed_rate) || 2.0;
    proj = calculateOverdueProjections(baseAmount, txDate, todayStr, dailyRate, penaltyRate);
  }

  // Nature (Fixo / Parcela / Avulso)
  let natureLabel = 'Lançamento Avulso (Variável)';
  if (item) {
    if (item.repeat_months > 0) {
      natureLabel = `Parcelamento (${item.repeat_months}x)`;
    } else {
      natureLabel = 'Lançamento Fixo Recorrente';
    }
  }

  // Can user edit
  const canEdit = State.user.profile_type === 1 || (State.permissions && State.permissions.can_edit_all) || (tx && tx.user_id === State.user.id) || (item && item.user_id === State.user.id);

  // Status Badge
  let statusBadgeHtml = '';
  if (isPaid) {
    statusBadgeHtml = `<span class="badge badge-green" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">✓ Pago${payDate ? ' em ' + fmt.date(payDate) : ''}</span>`;
  } else if (isOverdue) {
    statusBadgeHtml = `<span class="badge badge-danger" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">⚠️ Em Atraso${proj ? ` (${proj.daysLate} dias)` : ''}</span>`;
  } else {
    statusBadgeHtml = `<span class="badge badge-yellow" style="font-size: 11px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">⏳ Pendente</span>`;
  }

  Modal.open('Detalhes do Lançamento', `
    <div style="padding: 2px;">
      <!-- Top Card Header -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${catColor}22; border: 1px solid ${catColor}44; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
              ${catIcon}
            </div>
            <div style="min-width: 0;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; line-height: 1.3; word-break: break-word;">
                ${item && item.is_priority ? '<span title="Item Prioritário" style="margin-right: 4px;">⭐</span>' : ''}${description}
              </h3>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="badge ${type === 'income' ? 'badge-green' : 'badge-red'}" style="font-size: 10px; text-transform: uppercase;">
                  ${type === 'income' ? 'Receita' : 'Despesa'}
                </span>
                <span class="badge" style="font-size: 10px; background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border);">
                  ${natureLabel}
                </span>
                ${statusBadgeHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Big Highlight Amount -->
        <div style="padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${isPaid ? 'Valor Líquido Liquidado' : 'Valor Total'}
            </div>
            <div style="font-size: 26px; font-weight: 900; color: ${type === 'income' ? 'var(--accent-light)' : '#f87171'}; letter-spacing: -0.02em;">
              ${type === 'income' ? '+' : '-'}${fmt.currency(netAmount)}
            </div>
          </div>
          ${(penalty > 0 || discount > 0) && isPaid ? `
            <div style="text-align: right; font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border);">
              <div>Base: <strong>${fmt.currency(baseAmount)}</strong></div>
              ${penalty > 0 ? `<div style="color: #f87171;">Juros/Multa: +${fmt.currency(penalty)}</div>` : ''}
              ${discount > 0 ? `<div style="color: var(--accent-light);">Desconto: -${fmt.currency(discount)}</div>` : ''}
            </div>
          ` : ''}
          ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
            <div style="text-align: right; font-size: 11.5px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); padding: 6px 10px; border-radius: 6px; color: #fbbf24;">
              <div>Atualizado hoje: <strong>${fmt.currency(proj.projectedAmount)}</strong></div>
              <div style="font-size: 10px; opacity: 0.8;">(+${fmt.currency(proj.penaltyAmount)} encargos)</div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Information Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <!-- Vencimento -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📅 Vencimento / Competência</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${txDate ? fmt.date(txDate) : '—'}</div>
          ${nextBusinessDay && !isPaid ? `
            <div style="font-size: 10px; color: #60a5fa; font-weight: 600; margin-top: 2px;">
              📅 Prorroga: ${fmt.date(nextBusinessDay)} (1º dia útil)
            </div>
          ` : ''}
          ${compDate ? `
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
              Ref: ${fmtCompetence(compDate)}
            </div>
          ` : ''}
        </div>

        <!-- Conta / Cartão -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">💳 Conta / Cartão</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            ${isCreditCard ? '💳' : '🏦'} ${acc.name || 'Conta Geral'}
          </div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
            ${acc.bank ? (BANKS[acc.bank]?.name || acc.bank) : 'Geral'} • ${isCreditCard ? 'Cartão de Crédito' : (ACCOUNT_TYPES[acc.type] || 'Conta Corrente')}
          </div>
        </div>

        <!-- Categoria -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📁 Categoria</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>${catIcon}</span> ${catName}
          </div>
        </div>

        <!-- Responsável -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">👤 Responsável / Membro</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${userColor}; display: inline-block;"></span>
            ${userName}
          </div>
        </div>
      </div>

      <!-- Notes / PIX details if present -->
      ${notes ? `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px;">
          <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📝 Observações</div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; word-break: break-word;">${notes}</div>
        </div>
      ` : ''}

      ${pixCode ? `
        <div style="background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.3); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span>⚡</span> Chave PIX / Código Copia e Cola
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace;">
              ${pixCode}
            </div>
          </div>
          <button class="btn btn-sm" id="tdm-btn-copy-pix" style="background: rgba(6,182,212,0.2); color: #38bdf8; border-color: rgba(6,182,212,0.5); font-size: 11px; font-weight: 700; flex-shrink: 0; padding: 4px 10px; border-radius: 6px;">
            📋 Copiar
          </button>
        </div>
      ` : ''}

      <!-- 3 Botões de Ação Principais: Excluir, Editar e Pagar -->
      <div style="display: flex; gap: 10px; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); flex-wrap: wrap;">
        <!-- Botão 1: Excluir -->
        <button type="button" class="btn btn-outline" id="tdm-btn-delete" style="border-color: rgba(239,68,68,0.4); color: #f87171; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
          <span>🗑️</span> Excluir
        </button>

        <!-- Botão 2: Editar -->
        <button type="button" class="btn btn-outline" id="tdm-btn-edit" style="border-color: rgba(139,92,246,0.4); color: #c084fc; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
          <span>✏️</span> Editar
        </button>

        <!-- Botão 3: Pagar / Desfazer -->
        ${isPaid ? `
          <button type="button" class="btn btn-secondary" id="tdm-btn-pay" style="flex: 1; min-width: 150px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 8px; background: rgba(255,255,255,0.06);" ${!canEdit ? 'disabled' : ''}>
            <span>↩️</span> Desfazer Pagamento
          </button>
        ` : `
          <button type="button" class="btn btn-primary" id="tdm-btn-pay" style="flex: 1; min-width: 150px; background: #10b981; border-color: #10b981; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 8px;" ${!canEdit ? 'disabled' : ''}>
            <span>✅</span> Liquidar / Pagar
          </button>
        `}
      </div>
    </div>
  `);

  // 1. Copy PIX handler
  const copyBtn = document.getElementById('tdm-btn-copy-pix');
  if (copyBtn && pixCode) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pixCode);
      toast('Código PIX copiado para a área de transferência!', 'success');
    };
  }

  // 2. Action: Excluir
  const delBtn = document.getElementById('tdm-btn-delete');
  if (delBtn) {
    delBtn.onclick = () => {
      Modal.close();
      if (item) {
        const delEl = document.querySelector(`.rec-delete[data-id="${item.id}"]`);
        if (delEl) delEl.click();
      } else if (tx) {
        const delEl = document.querySelector(`.avl-delete[data-id="${tx.id}"]`);
        if (delEl) delEl.click();
      }
    };
  }

  // 3. Action: Editar
  const editBtn = document.getElementById('tdm-btn-edit');
  if (editBtn) {
    editBtn.onclick = () => {
      Modal.close();
      if (item) {
        const editEl = document.querySelector(`.rec-edit[data-id="${item.id}"]`);
        if (editEl) editEl.click();
      } else if (tx) {
        const editEl = document.querySelector(`.avl-edit[data-id="${tx.id}"]`);
        if (editEl) editEl.click();
      }
    };
  }

  // 4. Action: Pagar / Desfazer
  const payBtn = document.getElementById('tdm-btn-pay');
  if (payBtn) {
    payBtn.onclick = async () => {
      if (isPaid && tx) {
        Modal.close();
        await window.api.transactions.togglePaid(tx.id);
        toast('Pagamento desfeito! Lançamento voltou para pendente.');
        onUpdate?.();
      } else if (tx) {
        Modal.close();
        openPaymentDateModal(tx.id, tx.date, () => {
          onUpdate?.();
        });
      } else if (item) {
        Modal.close();
        openPaymentDateModal(item.id, txDate, () => {
          onUpdate?.();
        });
      }
    };
  }
}

async function openAdvanceInstallmentsModal(cardAccountId, inv) {
  try {
    const items = await window.api.invoices.getAdvanceable(cardAccountId);
    if (!items || items.length === 0) {
      toast('Este cartão não possui compras parceladas futuras com parcelas a antecipar.', 'info');
      return;
    }

    const cardName = inv?.card_name || 'Cartão de Crédito';
    const mStr = String(inv?.month || State.currentMonth).padStart(2, '0');
    const yStr = inv?.year || State.currentYear;

    const modalHtml = `
      <div style="padding: 16px;">
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
          Antecipe parcelas futuras de compras no cartão <strong>${cardName}</strong> para a fatura atual (<strong>${mStr}/${yStr}</strong>), liberando seu limite e garantindo descontos a valor presente.
        </p>

        <div class="form-group" style="margin-bottom: 14px;">
          <label style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: block;">
            📦 Selecione a Compra Parcelada:
          </label>
          <select id="adv-item-select" class="form-control" style="font-size: 13px; width: 100%; padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary);">
            ${items.map(it => `
              <option value="${it.id}" data-amount="${it.amount}" data-remaining="${it.remaining_installments}" data-name="${it.name}">
                ${it.name} — Restam ${it.remaining_installments}x de R$ ${fmt.currency(it.amount)}
              </option>
            `).join('')}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div class="form-group">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: block;">
              🔢 Parcelas a Antecipar:
            </label>
            <input type="number" id="adv-count-input" class="form-control" min="1" max="${items[0].remaining_installments}" value="1" style="font-size: 13px; width: 100%; padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary);">
          </div>

          <div class="form-group">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: block;">
              🏷️ Desconto Mensal (% a.m.):
            </label>
            <input type="number" step="0.05" id="adv-discount-rate" class="form-control" value="0.85" placeholder="0.85" style="font-size: 13px; width: 100%; padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary);">
          </div>
        </div>

        <!-- SIMULADOR VISUAL DE DESCONTO -->
        <div id="adv-summary-card" style="padding: 14px 18px; border-radius: 8px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: var(--text-secondary);">
            <span>Valor Nominal Total:</span>
            <strong id="adv-nominal-val" style="color: var(--text-primary);">R$ 0,00</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #10b981;">
            <span>Desconto a Valor Presente:</span>
            <strong id="adv-discount-val">- R$ 0,00</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 8px; color: #c084fc;">
            <span>Valor Líquido na Fatura:</span>
            <strong id="adv-final-val">R$ 0,00</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-advance" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); border-color: #8b5cf6; color: #fff; font-weight: 700; padding: 8px 20px; border-radius: 8px;">
            ⚡ Confirmar Antecipação
          </button>
        </div>
      </div>
    `;

    Modal.open(`⚡ Antecipação de Parcelas — ${cardName}`, modalHtml);

    const selectEl = document.getElementById('adv-item-select');
    const countEl = document.getElementById('adv-count-input');
    const rateEl = document.getElementById('adv-discount-rate');
    const nominalEl = document.getElementById('adv-nominal-val');
    const discountEl = document.getElementById('adv-discount-val');
    const finalEl = document.getElementById('adv-final-val');
    const confirmBtn = document.getElementById('btn-confirm-advance');

    const updateSimulation = () => {
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      if (!selectedOpt) return;
      const itemAmount = parseFloat(selectedOpt.dataset.amount) || 0;
      const maxRem = parseInt(selectedOpt.dataset.remaining, 10) || 1;

      countEl.max = maxRem;
      let count = parseInt(countEl.value, 10) || 1;
      if (count > maxRem) { count = maxRem; countEl.value = maxRem; }
      if (count < 1) { count = 1; countEl.value = 1; }

      const rate = Math.max(0, parseFloat(rateEl.value) || 0) / 100;
      const nominal = count * itemAmount;
      let presentValue = 0;

      for (let k = 1; k <= count; k++) {
        const vp = rate > 0 ? (itemAmount / Math.pow(1 + rate, k)) : itemAmount;
        presentValue += vp;
      }

      const discount = nominal - presentValue;

      nominalEl.textContent = fmt.currency(nominal);
      discountEl.textContent = `- ${fmt.currency(discount)}`;
      finalEl.textContent = fmt.currency(presentValue);
    };

    selectEl.onchange = () => {
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      countEl.max = selectedOpt.dataset.remaining;
      countEl.value = '1';
      updateSimulation();
    };

    countEl.oninput = updateSimulation;
    rateEl.oninput = updateSimulation;
    updateSimulation();

    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = 'Processando...';

      const itemId = parseInt(selectEl.value, 10);
      const count = parseInt(countEl.value, 10) || 1;
      const rate = parseFloat(rateEl.value) || 0;

      const res = await window.api.invoices.advance({
        cardAccountId,
        recurringItemId: itemId,
        countToAdvance: count,
        discountRateMonthly: rate,
        currentMonth: inv?.month || State.currentMonth,
        currentYear: inv?.year || State.currentYear,
        userId: State.user.id
      });

      if (res && res.success) {
        Modal.close();
        toast(res.message || 'Parcelas antecipadas com sucesso!');
        if (typeof renderRecurring === 'function') renderRecurring();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTransactions === 'function') renderTransactions();
        if (typeof renderAccounts === 'function') renderAccounts();
      } else {
        toast(res?.error || 'Erro ao antecipar parcelas', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '⚡ Confirmar Antecipação';
      }
    };
  } catch (err) {
    toast(`Erro ao carregar parcelas: ${err.message}`, 'error');
  }
}

