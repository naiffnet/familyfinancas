/* ===
 * recurring-modal.js — L3061–3601 do app.js
 */

function openPayInvoiceModal(inv, accounts) {
  const b = BANKS[inv.bank] || BANKS.outro;
  const checkingAccounts = accounts.filter(a => a.type !== 'credit');
  const today = new Date().toISOString().split('T')[0];

  Modal.open(`Quitar Fatura: ${inv.card_name} (Ref: ${String(inv.month).padStart(2,'0')}/${inv.year})`, `
    <div style="padding: 16px;">
      <div style="padding:12px;border-radius:var(--radius-sm);background:${b.color}15;border:1px solid ${b.color}44;margin-bottom:16px;text-align:center">
        <div style="font-size:12px;color:var(--text-muted)">Valor Bruto da Fatura</div>
        <div style="font-size:22px;font-weight:900;color:var(--text-primary);margin-top:2px">${fmt.currency(inv.amount)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Titular: ${inv.user_name} • Vencimento: ${fmt.date(inv.due_date)}</div>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Conta Corrente Pagadora (Saída do Dinheiro)</label>
        <select id="pay-inv-account" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-raised);color:var(--text-primary)">
          ${checkingAccounts.map(a => `<option value="${a.id}">${a.name} (Saldo: ${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Data do Efetivo Pagamento</label>
        <input type="date" id="pay-inv-date" value="${today}" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-primary); text-align: center; font-weight: 600;">
      </div>

      <div class="form-row" style="margin-bottom: 16px;">
        <div class="form-group">
          <label style="font-size:11px;color:var(--text-muted)">Juros / Multa por Atraso (R$)</label>
          <input type="number" step="0.01" min="0" id="pay-inv-penalty" placeholder="0,00">
        </div>
        <div class="form-group">
          <label style="font-size:11px;color:var(--text-muted)">Desconto Obtido (R$)</label>
          <input type="number" step="0.01" min="0" id="pay-inv-discount" placeholder="0,00">
        </div>
      </div>

      <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;text-align:center">
        🔒 <em>O valor total da fatura será debitado da conta corrente selecionada e todas as compras do cartão deste ciclo serão marcadas como quitadas em lote.</em>
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" id="pay-inv-cancel">Cancelar</button>
        <button class="btn btn-primary" id="pay-inv-confirm" style="background: ${b.color}; border-color: ${b.color}; font-weight: 600;">
          Confirmar Quitação da Fatura
        </button>
      </div>
    </div>
  `);

  document.getElementById('pay-inv-cancel').onclick = Modal.close;
  document.getElementById('pay-inv-confirm').onclick = async () => {
    const paymentAccountId = parseInt(document.getElementById('pay-inv-account').value);
    const paymentDate = document.getElementById('pay-inv-date').value;
    const penaltyAmount = parseFloat(document.getElementById('pay-inv-penalty').value) || 0;
    const discountAmount = parseFloat(document.getElementById('pay-inv-discount').value) || 0;

    if (!paymentAccountId || isNaN(paymentAccountId)) {
      toast('Selecione uma conta corrente para pagamento', 'error');
      return;
    }
    if (!paymentDate) {
      toast('Informe a data de pagamento', 'error');
      return;
    }

    try {
      const res = await window.api.invoices.pay({
        invoiceId: inv.id,
        paymentAccountId,
        paymentDate,
        penaltyAmount,
        discountAmount,
        userId: State.user.id
      });

      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }

      toast(`Fatura do cartão "${inv.card_name}" quitada com sucesso! Limite liberado.`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao quitar fatura: ' + err.message, 'error');
    }
  };
}

async function loadAvulsos(container, accounts, categories, tabType) {
  let txs = await window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true });
  txs = txs.filter(t => t.type === tabType);
  renderAvulsosList(container, txs, accounts, categories, tabType);
}

function attachRealtimeDuplicateChecker({ amountInput, dateInput, descInput, accountSelect, typeGetter, excludeId = null, containerEl }) {
  if (!amountInput || !dateInput || !containerEl) return () => {};

  let debounceTimer = null;

  const runCheck = async () => {
    const amount = parseFloat(amountInput.value) || 0;
    const date = typeof dateInput.value === 'string' ? dateInput.value : (dateInput.value || '');
    const description = (descInput?.value || '').trim();
    const accountId = parseInt(accountSelect?.value, 10) || null;
    const type = typeof typeGetter === 'function' ? typeGetter() : typeGetter || 'expense';

    if (amount <= 0 || !date || description.length < 2) {
      containerEl.style.display = 'none';
      containerEl.innerHTML = '';
      return;
    }

    try {
      const familyId = State.user?.family_id || State.user?.familyId || 1;
      const res = await window.api.sync.checkCandidate({
        familyId,
        amount,
        date,
        description,
        accountId,
        type,
        userId: State.user?.id || null,
        excludeId
      });

      if (res && res.hasDuplicate && res.candidate) {
        const cand = res.candidate;
        const color = res.score >= 90 ? '#ef4444' : '#f59e0b';
        const isIncome = type === 'income';
        const badgeText = res.score >= 95 
          ? (isIncome ? '🚨 Duplicata de Receita Quase Certa' : '🚨 Duplicata Quase Certa')
          : (res.score >= 80 
              ? (isIncome ? '⚠️ Receita Similar Encontrada' : '⚠️ Alta Similaridade')
              : (isIncome ? '🔍 Receita Parecida' : '🔍 Lançamento Parecido'));

        containerEl.style.display = 'block';
        containerEl.style.border = `1.5px solid ${color}`;
        containerEl.style.background = `${color}18`;
        containerEl.innerHTML = `
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
            <div>
              <div style="font-weight:700; color:${color}; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                <span>${badgeText} (${res.score}%)</span>
              </div>
              <div style="line-height:1.5; color:var(--text-secondary); font-size:12px;">
                Atenção: Já existe ${isIncome ? 'uma receita' : 'um lançamento'} similar de <strong>${cand.user_name || 'um familiar'}</strong> em <strong>${fmt.date(cand.date)}</strong> na conta <strong>${cand.account_name || 'Não informada'}</strong> no valor de <strong style="color:var(--text-primary)">${fmt.currency(cand.amount)}</strong> (<em>${cand.description || 'Sem descrição'}</em>).
              </div>
            </div>
            <button type="button" class="btn btn-sm" id="btn-dismiss-modal-dup" style="padding:2px 8px; font-size:11px; border-radius:6px; border:1px solid ${color}66; color:var(--text-muted); background:transparent; cursor:pointer;" title="Ignorar aviso">
              ✕
            </button>
          </div>
        `;

        const dismissBtn = containerEl.querySelector('#btn-dismiss-modal-dup');
        if (dismissBtn) {
          dismissBtn.onclick = () => {
            containerEl.style.display = 'none';
          };
        }
      } else {
        containerEl.style.display = 'none';
        containerEl.innerHTML = '';
      }
    } catch (e) {
      console.warn('Erro ao verificar duplicata candidata:', e);
    }
  };

  const scheduleCheck = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runCheck, 300);
  };

  amountInput.addEventListener('input', scheduleCheck);
  dateInput.addEventListener('change', scheduleCheck);
  if (descInput) descInput.addEventListener('input', scheduleCheck);
  if (accountSelect) accountSelect.addEventListener('change', scheduleCheck);

  return scheduleCheck;
}

async function openRecurringModal(item, accounts, categories, type) {
  if (typeof item === 'string') {
    type = item;
    item = null;
  }
  if (!type) type = 'expense';

  if (!Array.isArray(accounts) || accounts.length === 0) {
    try {
      const accRes = await window.api.accounts.getAll(State.user?.id || 1);
      accounts = Array.isArray(accRes) ? accRes : [];
    } catch (e) {
      accounts = [];
    }
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    if (Array.isArray(State.categories) && State.categories.length > 0) {
      categories = State.categories;
    } else {
      try {
        const catRes = await window.api.categories.getAll(State.user?.id || 1);
        categories = Array.isArray(catRes) ? catRes : [];
      } catch (e) {
        categories = [];
      }
    }
  }

  const isEdit = !!item;
  if (isEdit) {
    const canEdit = State.permissions.can_edit_all === 1 || item.user_id === State.user.id;
    if (!canEdit) {
      toast('Você não tem permissão para editar este item', 'error');
      return;
    }
  }
  const filteredCats = categories.filter(c => c.type === type || c.type === 'both');
  const days = Array.from({length:31}, (_,i) => i+1);

  const defaultStartMonth = `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}`;
  let startMonthVal = defaultStartMonth;
  if (isEdit && item.created_at) {
    startMonthVal = item.created_at.slice(0, 7);
  }
  let competenceMonthVal = startMonthVal;
  if (isEdit && item.competence_offset !== undefined && item.competence_offset !== null) {
    const [sy, sm] = startMonthVal.split('-').map(Number);
    let compMonth = sm + item.competence_offset;
    let compYear = sy + Math.floor((compMonth - 1) / 12);
    compMonth = ((compMonth - 1) % 12 + 12) % 12 + 1;
    competenceMonthVal = `${compYear}-${String(compMonth).padStart(2, '0')}`;
  }

  Modal.open(isEdit ? 'Editar Item Recorrente' : `Nova ${type === 'income' ? 'Receita' : 'Despesa'} Fixa`, `
    <div style="margin-bottom: 14px;">
      <button type="button" class="btn btn-outline" id="rec-scan-qr" style="width: 100%; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: var(--accent-light); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px;">
        <span>📷</span> Escanear Fatura / QR Code / Pix
      </button>
    </div>
    <div id="rec-scanned-info" style="display:none; margin-bottom:12px; padding:8px 12px; border-radius:6px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); font-size:11.5px; color:#38bdf8; animation:fadeIn 0.25s ease;">
      <div id="rec-scanned-text">⚡ Dados extraídos da fatura!</div>
    </div>
    <div id="rec-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    <div class="form-group">
      <label>Nome</label>
      <input type="text" id="rec-name" placeholder="${type === 'income' ? 'Ex: Salário, Freelance...' : 'Ex: Aluguel, Netflix, Luz...'}" value="${item?.name || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="number" id="rec-amount" step="0.01" min="0" placeholder="0,00" value="${item?.amount || ''}">
      </div>
      <div class="form-group">
        <label>Todo dia</label>
        <select id="rec-due-day">
          ${days.map(d => `<option value="${d}" ${(item?.due_day ?? 1) === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Categoria</label>
        <select id="rec-category">
          <option value="">Sem categoria</option>
          ${filteredCats.map(c => `<option value="${c.id}" ${item?.category_id === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Conta / Cartão</label>
        <select id="rec-account">
          <option value="">Selecione...</option>
          ${accounts.map(a => `<option value="${a.id}" ${item?.account_id === a.id ? 'selected' : ''}>${a.name} (${ACCOUNT_TYPES[a.type]})</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label title="Mês em que a primeira cobrança/lançamento será gerada">📅 Mês de Vencimento <span style="font-size:11px;opacity:0.65;font-weight:400">(1ª ocorrência)</span></label>
        <input type="month" id="rec-start-month" value="${startMonthVal}" title="Mês e ano em que este item começa a ser cobrado/gerado">
      </div>
      <div class="form-group">
        <label title="Mês ao qual este item se refere — ex: conta de luz de março, paga em abril">📋 Mês de Referência <span style="font-size:11px;opacity:0.65;font-weight:400">(competência)</span></label>
        <input type="month" id="rec-competence-month" value="${competenceMonthVal}" title="Mês de consumo/competência a que este item se refere. Pode ser diferente do mês de vencimento.">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex:1">
        <label>Repetir por quantos meses? <span style="font-size:11px;opacity:0.65;font-weight:400">(0 ou vazio = indefinido)</span></label>
        <input type="number" id="rec-repeat-months" min="0" placeholder="Repetir indefinidamente" value="${item?.repeat_months || ''}">
      </div>
    </div>
    <div class="form-row" id="row-start-installment" style="display: ${item?.repeat_months > 0 ? 'flex' : 'none'};">
      <div class="form-group">
        <label>Esta é qual parcela no mês de início? (Padrão: 1)</label>
        <input type="number" id="rec-start-installment" min="1" placeholder="Ex: se já pagou 4 parcelas, coloque 5" value="${item?.start_installment || 1}">
      </div>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="rec-priority" ${item?.is_priority ? 'checked' : ''}> ⭐ Marcar como prioritário (destaque no dashboard)</label>
    </div>
    ${!isEdit ? `
    <div class="form-group">
      <label><input type="checkbox" id="rec-paid"> ${type === 'income' ? '💰 Já foi recebida este mês' : '💸 Já foi paga este mês'}</label>
    </div>
    ` : ''}
    <!-- SEÇÃO DE JUROS E PREVISIBILIDADE CONTRATUAL -->
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">📈 Regra de Juros / Encargos (Opcional)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Para projeção de valor atualizado</span>
      </div>
      <div class="form-row" style="margin-bottom: 8px;">
        <div class="form-group" style="flex: 1.2;">
          <label style="font-size: 11px; color: var(--text-muted);">Taxa de Juros</label>
          <input type="number" step="0.001" min="0" id="rec-interest-rate" placeholder="Ex: 0.033 ou 2.0" value="${item?.interest_rate || ''}">
        </div>
        <div class="form-group" style="flex: 1.5;">
          <label style="font-size: 11px; color: var(--text-muted);">Periodicidade dos Juros</label>
          <select id="rec-interest-type" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
            <option value="daily" ${(item?.interest_type === 'daily' || !item?.interest_type) ? 'selected' : ''}>% ao Dia (ex: 0,033% a.d. mora)</option>
            <option value="monthly" ${item?.interest_type === 'monthly' ? 'selected' : ''}>% ao Mês (ex: 2,0% a.m.)</option>
            <option value="yearly" ${item?.interest_type === 'yearly' ? 'selected' : ''}>% ao Ano (ex: 15% a.a.)</option>
            <option value="installment" ${item?.interest_type === 'installment' ? 'selected' : ''}>Fixo por Parcela</option>
            <option value="contract" ${item?.interest_type === 'contract' ? 'selected' : ''}>Fixo por Contrato</option>
          </select>
        </div>
      </div>
      <div class="form-row" style="margin-bottom: 0;">
        <div class="form-group" style="flex: 1;">
          <label style="font-size: 11px; color: var(--text-muted);">Multa Fixa por Atraso (%)</label>
          <input type="number" step="0.01" min="0" id="rec-penalty-fixed-rate" placeholder="Ex: 2.0" value="${item?.penalty_fixed_rate || ''}">
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>Observação (opcional)</label>
      <input type="text" id="rec-notes" placeholder="Anotação sobre este item..." value="${item?.notes || ''}">
    </div>
    <div class="form-group">
      <label>Ícone</label>
      <div class="icon-picker" id="rec-icon-picker">
        ${(type === 'income' ? ICONS_INCOME : ICONS_EXPENSE).map(ic =>
          `<button class="icon-btn ${(item?.icon || (type === 'income' ? '💰' : '📋')) === ic ? 'selected' : ''}" data-icon="${ic}">${ic}</button>`
        ).join('')}
      </div>
    </div>
    <div class="form-group">
      <label>Cor</label>
      <div class="color-picker" id="rec-color-picker">
        ${COLORS.map(c => `<div class="color-swatch ${(item?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="rec-cancel">Cancelar</button>
      <button class="btn btn-primary" id="rec-save">${isEdit ? 'Salvar' : 'Adicionar'}</button>
    </div>
  `);

  // QR Code Scanner Integration for Recurring Items
  const recScanBtn = document.getElementById('rec-scan-qr');
  if (recScanBtn && typeof openNFCeScannerModal === 'function') {
    recScanBtn.onclick = () => {
      openNFCeScannerModal((parsed) => {
        if (!parsed) return;
        const updated = [];
        if (parsed.description && (!document.getElementById('rec-name').value || document.getElementById('rec-name').value.startsWith('Nova '))) {
          const nameEl = document.getElementById('rec-name');
          if (nameEl) { nameEl.value = parsed.description; updated.push(`Nome: "${parsed.description}"`); }
        }
        if (parsed.amount != null && parsed.amount > 0) {
          const amtEl = document.getElementById('rec-amount');
          if (amtEl) { amtEl.value = parsed.amount; updated.push(`Valor: ${fmt.currency(parsed.amount)}`); }
        }
        const targetDate = parsed.dueDate || parsed.date;
        if (targetDate) {
          const day = parseInt(targetDate.split('-')[2], 10);
          const dayEl = document.getElementById('rec-due-day');
          if (dayEl && day >= 1 && day <= 31) { dayEl.value = day; updated.push(`Dia: ${day}`); }
        }
        if (parsed.competence) {
          const compEl = document.getElementById('rec-competence-month');
          if (compEl) { compEl.value = parsed.competence; updated.push(`Competência: ${parsed.competence}`); }
        }
        if (parsed.suggestedCategory) {
          const catNameLower = parsed.suggestedCategory.toLowerCase();
          const matchCat = filteredCats.find(c => c.name.toLowerCase().includes(catNameLower) || catNameLower.includes(c.name.toLowerCase()));
          if (matchCat) {
            const catEl = document.getElementById('rec-category');
            if (catEl) { catEl.value = matchCat.id; updated.push(`Categoria: ${matchCat.name}`); }
          }
        }
        if (parsed.pixCode || parsed.notes) {
          const notesEl = document.getElementById('rec-notes');
          if (notesEl) {
            const extra = parsed.pixCode ? `PIX: ${parsed.pixCode}` : (parsed.notes || '');
            notesEl.value = (notesEl.value ? notesEl.value + ' | ' : '') + extra;
          }
        }
        const infoBox = document.getElementById('rec-scanned-info');
        const infoText = document.getElementById('rec-scanned-text');
        if (infoBox && infoText) {
          infoBox.style.display = 'block';
          infoText.innerHTML = `✅ <strong>QR Code Lido:</strong> ${updated.join(' • ')}`;
        }
        toast(`✅ Dados da fatura aplicados! (${updated.join(', ')})`, 'success');
      });
    };
  }

  let icon = item?.icon || (type === 'income' ? '💰' : '📋');
  let color = item?.color || '#10b981';

  document.querySelectorAll('#rec-icon-picker .icon-btn').forEach(btn => {
    btn.onclick = () => { document.querySelectorAll('#rec-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; };
  });
  document.querySelectorAll('#rec-color-picker .color-swatch').forEach(sw => {
    sw.onclick = () => { document.querySelectorAll('#rec-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); color = sw.dataset.color; };
  });

  const repeatMonthsInput = document.getElementById('rec-repeat-months');
  const startInstallmentRow = document.getElementById('row-start-installment');
  if (repeatMonthsInput && startInstallmentRow) {
    repeatMonthsInput.oninput = () => {
      const val = parseInt(repeatMonthsInput.value) || 0;
      startInstallmentRow.style.display = val > 0 ? 'flex' : 'none';
    };
  }

  const startMonthInput = document.getElementById('rec-start-month');
  const compMonthInput = document.getElementById('rec-competence-month');
  let compManuallyChanged = isEdit && item?.competence_offset !== 0 && item?.competence_offset !== undefined;
  if (compMonthInput) {
    compMonthInput.onchange = () => { compManuallyChanged = true; };
    if (startMonthInput) {
      startMonthInput.onchange = () => {
        if (!compManuallyChanged && startMonthInput.value) {
          compMonthInput.value = startMonthInput.value;
        }
      };
    }
  }

  // Realtime Candidate Duplicate Checker
  attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('rec-amount'),
    dateInput: {
      get value() {
        const m = document.getElementById('rec-start-month')?.value || defaultStartMonth;
        const d = String(document.getElementById('rec-due-day')?.value || 1).padStart(2, '0');
        return `${m}-${d}`;
      },
      addEventListener(evt, fn) {
        document.getElementById('rec-start-month')?.addEventListener(evt, fn);
        document.getElementById('rec-due-day')?.addEventListener(evt, fn);
      }
    },
    descInput: document.getElementById('rec-name'),
    accountSelect: document.getElementById('rec-account'),
    typeGetter: () => type,
    excludeId: item?.id,
    containerEl: document.getElementById('rec-dup-warning')
  });

  document.getElementById('rec-cancel').onclick = Modal.close;
  document.getElementById('rec-save').onclick = async () => {
    try {
      const name = document.getElementById('rec-name').value.trim();
      const amount = parseFloat(document.getElementById('rec-amount').value);
      const account_id = parseInt(document.getElementById('rec-account').value) || null;
      if (!name) { toast('Informe o nome', 'error'); return; }
      if (!amount || amount <= 0) { toast('Informe um valor', 'error'); return; }
      if (!account_id) { toast('Selecione uma conta', 'error'); return; }

      const startMonth = document.getElementById('rec-start-month').value;
      const competenceMonth = document.getElementById('rec-competence-month')?.value || startMonth;
      const created_at = startMonth ? `${startMonth}-01 00:00:00` : null;

      let competence_offset = 0;
      if (startMonth && competenceMonth) {
        const [sy, sm] = startMonth.split('-').map(Number);
        const [cy, cm] = competenceMonth.split('-').map(Number);
        competence_offset = (cy - sy) * 12 + (cm - sm);
      }

      // Build notes with competence info if different from start month
      let notesVal = document.getElementById('rec-notes').value;
      if (competenceMonth && competenceMonth !== startMonth && !notesVal.includes('Ref.:')) {
        const [cy, cm] = competenceMonth.split('-');
        const mNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const compLabel = `${mNames[parseInt(cm,10)-1]}/${cy}`;
        notesVal = notesVal ? `${notesVal} | Ref.: ${compLabel}` : `Ref.: ${compLabel}`;
      }

      const data = {
        user_id: State.user.id, name, type, amount,
        category_id: parseInt(document.getElementById('rec-category').value) || null,
        account_id,
        due_day: parseInt(document.getElementById('rec-due-day').value),
        is_priority: document.getElementById('rec-priority').checked ? 1 : 0,
        icon, color,
        notes: notesVal,
        repeat_months: parseInt(document.getElementById('rec-repeat-months').value) || 0,
        start_installment: parseInt(document.getElementById('rec-start-installment').value) || 1,
        competence_offset,
        interest_rate: parseFloat(document.getElementById('rec-interest-rate')?.value) || 0,
        interest_type: document.getElementById('rec-interest-type')?.value || 'daily',
        penalty_fixed_rate: parseFloat(document.getElementById('rec-penalty-fixed-rate')?.value) || 0,
        created_at
      };
      if (!isEdit) {
        data.is_paid = document.getElementById('rec-paid').checked ? 1 : 0;
      }
      if (isEdit) {
        data.id = item.id;
        const res = await window.api.recurring.update(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        toast('Item atualizado');
      } else {
        const res = await window.api.recurring.create(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        toast('Item adicionado! Gerado para este mês.');
      }
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao salvar item recorrente: ' + err.message, 'error');
    }
  };
}

function fmtCompetence(compStr) {
  if (!compStr) return '';
  const parts = compStr.split('-');
  if (parts.length >= 2) {
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const mNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mNames[m - 1]}/${y}`;
  }
  return compStr;
}

function openEditMonthTransactionModal(tx, item, accounts, categories, type) {
  const dateVal = tx.date ? tx.date.split(' ')[0] : new Date().toISOString().split('T')[0];
  const amountVal = tx.amount || item.amount;
  const descVal = tx.description || item.name;
  const accountVal = tx.account_id || item.account_id || (accounts[0]?.id || '');
  const categoryVal = tx.category_id || item.category_id || '';
  
  const defaultComp = tx.competence_date ? tx.competence_date.slice(0,7) : `${State.currentYear}-${String(State.currentMonth).padStart(2,'0')}`;
  let scannedPixCode = tx.pix_code || (item && item.pix_code) || null;
  let currentNotes = tx.notes || (item && item.notes) || '';

  Modal.open(`Editar Lançamento do Mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})`, `
    <div style="margin-bottom: 14px;">
      <button type="button" class="btn btn-outline" id="mod-tx-scan-qr" style="width: 100%; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: var(--accent-light); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px;">
        <span>📷</span> Escanear Fatura / QR Code / Pix
      </button>
    </div>
    <div id="mod-tx-scanned-info" style="display: ${scannedPixCode ? 'block' : 'none'}; margin-bottom: 12px; padding: 8px 12px; border-radius: 6px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); font-size: 11.5px; color: #38bdf8; animation: fadeIn 0.25s ease;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
        <span id="mod-tx-scanned-text">${scannedPixCode ? '⚡ Chave/Código PIX vinculado à fatura' : '⚡ Dados atualizados via QR Code!'}</span>
        ${scannedPixCode ? `<span class="badge badge-cyan" style="font-size: 10px; padding: 2px 6px;">PIX Anexado</span>` : ''}
      </div>
    </div>
    <div id="mod-tx-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor deste Mês (R$)</label>
        <input type="number" id="mod-tx-amount" step="0.01" min="0" placeholder="0,00" value="${amountVal}">
      </div>
      <div class="form-group">
        <label>Data de Vencimento</label>
        <input type="date" id="mod-tx-date" value="${dateVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="mod-tx-desc" placeholder="Descrição" value="${descVal}">
      </div>
      <div class="form-group">
        <label>Mês de Referência / Consumo</label>
        <input type="month" id="mod-tx-competence" value="${defaultComp}" title="Selecione o mês/ano de consumo a que se refere esta fatura">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Conta / Cartão</label>
        <select id="mod-tx-account">
          <option value="">Selecione...</option>
          ${accounts.map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="mod-tx-category">
          <option value="">Sem Categoria</option>
          ${categories.filter(c => c.type === type || c.type === 'both').map(c => `<option value="${c.id}" ${c.id == categoryVal ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text-muted);margin-top:8px;margin-bottom:16px;">
      🔒 <em>Esta alteração afeta <strong>exclusivamente a parcela deste mês</strong>. O mês de consumo (referência) fica discriminado junto do vencimento.</em>
    </p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="mod-tx-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mod-tx-save">Salvar este Mês</button>
    </div>
  `);

  // QR Code Scanner Integration for Monthly Transaction Edit
  const scanBtn = document.getElementById('mod-tx-scan-qr');
  if (scanBtn && typeof openNFCeScannerModal === 'function') {
    scanBtn.onclick = () => {
      openNFCeScannerModal((parsed) => {
        if (!parsed) return;
        const updatedFields = [];
        if (parsed.amount != null && parsed.amount > 0) {
          const amtEl = document.getElementById('mod-tx-amount');
          if (amtEl) {
            amtEl.value = parsed.amount;
            amtEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Valor: ${fmt.currency(parsed.amount)}`);
          }
        }
        const targetDate = parsed.dueDate || parsed.date;
        if (targetDate) {
          const dateEl = document.getElementById('mod-tx-date');
          if (dateEl) {
            dateEl.value = targetDate;
            dateEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Vencimento: ${fmt.date(targetDate)}`);
          }
        }
        const targetComp = parsed.competence || (targetDate ? targetDate.slice(0, 7) : null);
        if (targetComp) {
          const compEl = document.getElementById('mod-tx-competence');
          if (compEl) {
            compEl.value = targetComp;
            compEl.style.borderColor = 'var(--accent)';
            updatedFields.push(`Competência: ${targetComp}`);
          }
        }
        if (parsed.pixCode) {
          scannedPixCode = parsed.pixCode;
          updatedFields.push('Chave PIX');
        }
        if (parsed.notes) {
          currentNotes = (currentNotes ? currentNotes + '\n' : '') + parsed.notes;
        }

        const infoBox = document.getElementById('mod-tx-scanned-info');
        const infoText = document.getElementById('mod-tx-scanned-text');
        if (infoBox && infoText) {
          infoBox.style.display = 'block';
          infoText.innerHTML = `✅ <strong>QR Code Lido:</strong> ${updatedFields.join(' • ')}`;
        }
        toast(`✅ Fatura escaneada com sucesso! (${updatedFields.join(', ')})`, 'success');
      });
    };
  }

  attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('mod-tx-amount'),
    dateInput: document.getElementById('mod-tx-date'),
    descInput: document.getElementById('mod-tx-desc'),
    accountSelect: document.getElementById('mod-tx-account'),
    typeGetter: () => type,
    excludeId: tx?.id,
    containerEl: document.getElementById('mod-tx-dup-warning')
  });

  document.getElementById('mod-tx-cancel').onclick = Modal.close;

  document.getElementById('mod-tx-save').onclick = async () => {
    const amount = parseFloat(document.getElementById('mod-tx-amount').value);
    const date = document.getElementById('mod-tx-date').value;
    const description = document.getElementById('mod-tx-desc').value.trim();
    const competence_date = document.getElementById('mod-tx-competence').value;
    const account_id = parseInt(document.getElementById('mod-tx-account').value);
    const category_id = parseInt(document.getElementById('mod-tx-category').value) || null;

    if (!amount || isNaN(amount) || amount <= 0) {
      toast('Informe um valor válido', 'error');
      return;
    }
    if (!description) {
      toast('Informe a descrição', 'error');
      return;
    }

    try {
      const res = await window.api.transactions.update({
        id: tx.id,
        user_id: tx.user_id,
        account_id,
        category_id,
        type: tx.type,
        amount,
        description,
        date,
        competence_date,
        is_paid: tx.is_paid,
        notes: currentNotes || tx.notes,
        pix_code: scannedPixCode || tx.pix_code || null
      });
      if (res && res.error) {
        toast(res.error, 'error');
        return;
      }
      toast(`Lançamento do mês atualizado com sucesso!`);
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao atualizar lançamento do mês: ' + err.message, 'error');
    }
  };
}
