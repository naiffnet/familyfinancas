/* ===
 * avulso-modal.js — L3602–3851 do app.js
 */

async function showDidacticFeedback(data) {
  if (State.permissions.can_edit_all === 1) {
    toast(data.id ? 'Lançamento atualizado' : 'Lançamento adicionado', 'success');
    return;
  }
  if (data.type === 'income') {
    toast('⭐ Excelente! Você adicionou um recebível e está colaborando com o orçamento!', 'success');
    return;
  }
  if (data.type === 'expense') {
    try {
      const parts = data.date.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const budgets = await window.api.budgets.getAll({ userId: State.user.id, month, year });
      const b = budgets.find(x => x.category_id === data.category_id);
      
      if (b) {
        const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
        if (b.spent > b.amount) {
          const exceeded = b.spent - b.amount;
          toast(`⚠️ Limite Excedido por R$ ${exceeded.toFixed(2)}! Mas registramos. Coopere e planeje com seus pais!`, 'warning');
        } else if (pct >= 80) {
          toast(`⚡ Quase no teto! Você consumiu ${pct.toFixed(0)}% do limite proposto para ${b.category_name}.`, 'warning');
        } else {
          const available = b.amount - b.spent;
          toast(`✅ Lançamento registrado! Você ainda tem R$ ${available.toFixed(2)} propostos para ${b.category_name}.`, 'success');
        }
      } else {
        toast('Lançamento adicionado! Bom trabalho gerenciando seu dinheiro.', 'success');
      }
    } catch (err) {
      console.error('Error showing didactic feedback:', err);
      toast('Lançamento adicionado', 'success');
    }
  } else {
    toast('Lançamento adicionado', 'success');
  }
}

async function openAvulsoModal(accounts, categories, tx = null, defaultType = 'expense', prefillData = null) {
  if (typeof accounts === 'string') {
    defaultType = accounts;
    accounts = null;
  } else if (accounts && typeof accounts === 'object' && !Array.isArray(accounts)) {
    if (accounts.accountId) {
      prefillData = prefillData || {};
      prefillData.accountId = accounts.accountId;
    }
    accounts = null;
  }

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

  if (!Array.isArray(accounts)) accounts = [];
  if (!Array.isArray(categories)) categories = [];

  const isEdit = !!tx;
  if (isEdit) {
    const canEdit = (State.user.profile_type === 1 || State.user.profile_type === 2) || (State.permissions && State.permissions.can_edit_all === 1) || (!tx.user_id || tx.user_id === State.user.id);
    if (!canEdit) {
      toast('Você não tem permissão para editar este lançamento', 'error');
      return;
    }
  }
  const today = new Date().toISOString().split('T')[0];
  const dateVal = isEdit && tx.date ? tx.date.split(' ')[0] : (prefillData && prefillData.date ? prefillData.date : today);
  const amountVal = isEdit ? tx.amount : (prefillData && prefillData.amount ? prefillData.amount : '');
  const descVal = isEdit ? tx.description : (prefillData && prefillData.description ? prefillData.description : '');
  const accountVal = isEdit ? tx.account_id : (prefillData && prefillData.accountId ? prefillData.accountId : (accounts[0]?.id || ''));
  
  let categoryVal = isEdit ? (tx.category_id || '') : '';
  if (!categoryVal && prefillData && prefillData.suggestedCategory) {
    const matchedCat = categories.find(c => c.name.toLowerCase().includes(prefillData.suggestedCategory.toLowerCase()) || prefillData.suggestedCategory.toLowerCase().includes(c.name.toLowerCase()));
    if (matchedCat) categoryVal = matchedCat.id;
  }

  const typeVal = isEdit ? tx.type : (prefillData && prefillData.type ? prefillData.type : defaultType);
  const paidChecked = isEdit ? (tx.is_paid ? 'checked' : '') : 'checked';
  const competenceVal = isEdit && tx.competence_date ? tx.competence_date.slice(0,7) : (prefillData && prefillData.competence ? prefillData.competence : (dateVal ? dateVal.slice(0,7) : ''));

  Modal.open(isEdit ? 'Editar Lançamento Avulso' : 'Novo Lançamento Avulso', `
    <div id="avl-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
    
    <div style="margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
      ${!isEdit ? `
        <button type="button" class="btn btn-secondary btn-sm" id="avl-btn-scan-qr" style="font-size: 11.5px; display: inline-flex; align-items: center; gap: 6px; border-color: var(--accent); color: var(--accent-light); background: rgba(16,185,129,0.08); padding: 5px 12px; border-radius: 20px; cursor: pointer;">
          <span>📷</span> Escanear Nota Fiscal / PDF
        </button>
      ` : (tx && (tx.pix_code || (tx.notes && tx.notes.includes('000201')))) ? `
        <button type="button" class="btn btn-secondary btn-sm" id="avl-btn-open-pix" style="font-size: 11.5px; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(6,182,212,0.4); color: #38bdf8; background: rgba(6,182,212,0.12); padding: 5px 12px; border-radius: 20px; cursor: pointer; font-weight: 700;">
          <span>⚡</span> Pagar com PIX (Ver QR Code)
        </button>
      ` : ''}
    </div>

    <div class="type-toggle" id="avl-type-toggle">
      <button data-type="expense" class="${typeVal === 'expense' ? 'active-expense' : ''}">💸 Despesa</button>
      <button data-type="income" class="${typeVal === 'income' ? 'active-income' : ''}">💰 Receita</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="number" id="avl-amount" step="0.01" min="0" placeholder="0,00" value="${amountVal}">
      </div>
      <div class="form-group">
        <label title="Data de vencimento ou pagamento deste lançamento">📅 Mês de Vencimento <span style="font-size:11px;opacity:0.65;font-weight:400">(data)</span></label>
        <input type="date" id="avl-date" value="${dateVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label title="Mês ao qual este gasto se refere — ex: conta de luz consumida em março, paga em abril">📋 Mês de Referência <span style="font-size:11px;opacity:0.65;font-weight:400">(competência)</span></label>
        <input type="month" id="avl-competence" value="${competenceVal}" title="Mês de consumo/competência. Pode ser anterior ao mês de vencimento.">
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="avl-desc" placeholder="Ex: Compra no mercado, Presente..." value="${descVal}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Conta</label>
        <select id="avl-account">
          <option value="">Selecione...</option>
          ${(accounts || []).map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="avl-category">
          <!-- Preenchido dinamicamente -->
        </select>
      </div>
    </div>
    
    <div class="form-row" id="group-credit-product-row">
      <div class="form-group">
        <label style="font-size:12px; font-weight:600;">Recurso / Produto da Conta</label>
        <select id="avl-credit-product">
          <option value="normal" ${(!tx || tx.credit_product === 'normal' || !tx.credit_product) ? 'selected' : ''}>💵 Saldo Normal (À Vista)</option>
          <option value="banricompras" ${(tx && tx.credit_product === 'banricompras') ? 'selected' : ''}>🛍️ Banricompras (Débito Agendado / Pré-datado)</option>
          <option value="credito_minuto" ${(tx && tx.credit_product === 'credito_minuto') ? 'selected' : ''}>⚡ Crédito Minuto (Empréstimo)</option>
        </select>
      </div>
      <div class="form-group" id="group-due-date" style="${(tx && tx.credit_product === 'banricompras') ? '' : 'display:none'}">
        <label style="font-size:12px; font-weight:600; color:#fbbf24;">Data do Débito (Banricompras)</label>
        <input type="date" id="avl-due-date" value="${(tx && tx.due_date) ? tx.due_date : ''}">
      </div>
    </div>

    <!-- SEÇÃO DE JUROS E PREVISIBILIDADE CONTRATUAL -->
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">📈 Regra de Juros / Encargos (Opcional)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Para projeção de valor atualizado</span>
      </div>
      <div class="form-row" style="margin-bottom: 8px;">
        <div class="form-group" style="flex: 1.2;">
          <label style="font-size: 11px; color: var(--text-muted);">Taxa de Juros</label>
          <input type="number" step="0.001" min="0" id="avl-interest-rate" placeholder="Ex: 0.033 ou 2.0" value="${tx?.interest_rate || ''}">
        </div>
        <div class="form-group" style="flex: 1.5;">
          <label style="font-size: 11px; color: var(--text-muted);">Periodicidade dos Juros</label>
          <select id="avl-interest-type" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
            <option value="daily" ${(tx?.interest_type === 'daily' || !tx?.interest_type) ? 'selected' : ''}>% ao Dia (ex: 0,033% a.d. mora)</option>
            <option value="monthly" ${tx?.interest_type === 'monthly' ? 'selected' : ''}>% ao Mês (ex: 2,0% a.m.)</option>
            <option value="yearly" ${tx?.interest_type === 'yearly' ? 'selected' : ''}>% ao Ano (ex: 15% a.a.)</option>
            <option value="installment" ${tx?.interest_type === 'installment' ? 'selected' : ''}>Fixo por Parcela</option>
            <option value="contract" ${tx?.interest_type === 'contract' ? 'selected' : ''}>Fixo por Contrato</option>
          </select>
        </div>
      </div>
      <div class="form-row" style="margin-bottom: 0;">
        <div class="form-group" style="flex: 1;">
          <label style="font-size: 11px; color: var(--text-muted);">Multa Fixa por Atraso (%)</label>
          <input type="number" step="0.01" min="0" id="avl-penalty-fixed-rate" placeholder="Ex: 2.0" value="${tx?.penalty_fixed_rate || ''}">
        </div>
      </div>
    </div>

    <div class="form-group">
      <label><input type="checkbox" id="avl-paid" ${paidChecked}> Já foi pago/recebido</label>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="avl-cancel">Cancelar</button>
      <button class="btn btn-primary" id="avl-save">${isEdit ? 'Salvar' : 'Adicionar'}</button>
    </div>
  `);

  let currentType = typeVal;

  const updateAvulsoCategories = (type) => {
    const select = document.getElementById('avl-category');
    if (!select) return;
    const currentVal = select.value || categoryVal;
    const filtered = categories.filter(c => c.type === type || c.type === 'both');
    
    let html = '<option value="">Sem categoria</option>';
    html += filtered.map(c => `<option value="${c.id}" ${String(c.id) === String(currentVal) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
    select.innerHTML = html;
  };

  // Carregar categorias correspondentes ao tipo inicial
  updateAvulsoCategories(typeVal);

  const creditProductSelect = document.getElementById('avl-credit-product');
  const groupDueDate = document.getElementById('group-due-date');
  const dateInput = document.getElementById('avl-date');
  const dueDateInput = document.getElementById('avl-due-date');
  const paidCheckbox = document.getElementById('avl-paid');
  const competenceInput = document.getElementById('avl-competence');

  // Realtime Candidate Duplicate Checker
  const recheckDup = attachRealtimeDuplicateChecker({
    amountInput: document.getElementById('avl-amount'),
    dateInput: document.getElementById('avl-date'),
    descInput: document.getElementById('avl-desc'),
    accountSelect: document.getElementById('avl-account'),
    typeGetter: () => currentType,
    excludeId: tx?.id,
    containerEl: document.getElementById('avl-dup-warning')
  });

  // Auto-sync Mês de Referência with date when user changes date (only if competence wasn't manually edited)
  let competenceManuallyChanged = isEdit && !!tx.competence_date;
  if (competenceInput) {
    competenceInput.onchange = () => { competenceManuallyChanged = true; };
    if (dateInput) {
      dateInput.onchange = () => {
        if (!competenceManuallyChanged && dateInput.value) {
          competenceInput.value = dateInput.value.slice(0, 7);
        }
      };
    }
  }

  if (creditProductSelect) {
    creditProductSelect.onchange = () => {
      const isBanri = creditProductSelect.value === 'banricompras';
      groupDueDate.style.display = isBanri ? '' : 'none';
      if (isBanri) {
        paidCheckbox.checked = false;
        if (!dueDateInput.value && dateInput.value) {
          const d = new Date(dateInput.value);
          d.setDate(d.getDate() + 30);
          dueDateInput.value = d.toISOString().split('T')[0];
        }
      }
    };
  }

  document.querySelectorAll('#avl-type-toggle button').forEach(btn => {
    btn.onclick = () => {
      currentType = btn.dataset.type;
      document.querySelectorAll('#avl-type-toggle button').forEach(b => b.className = '');
      btn.className = currentType === 'income' ? 'active-income' : 'active-expense';
      updateAvulsoCategories(currentType);
      if (typeof recheckDup === 'function') recheckDup();
    };
  });

  const scanQrBtn = document.getElementById('avl-btn-scan-qr');
  if (scanQrBtn) {
    scanQrBtn.onclick = () => {
      Modal.close();
      if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
    };
  }

  const openPixBtn = document.getElementById('avl-btn-open-pix');
  if (openPixBtn && tx) {
    openPixBtn.onclick = () => {
      Modal.close();
      if (typeof openPixPaymentModal === 'function') openPixPaymentModal(tx);
    };
  }

  document.getElementById('avl-cancel').onclick = Modal.close;
  document.getElementById('avl-save').onclick = async () => {
    try {
      const amount = parseFloat(document.getElementById('avl-amount').value);
      const date = document.getElementById('avl-date').value;
      const account_id = parseInt(document.getElementById('avl-account').value);
      const credit_product = document.getElementById('avl-credit-product')?.value || 'normal';
      const due_date = credit_product === 'banricompras' ? document.getElementById('avl-due-date')?.value : null;

      if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
      if (!date) { toast('Informe a data', 'error'); return; }
      if (!account_id || isNaN(account_id)) { toast('Selecione uma conta', 'error'); return; }
      
      const competenceMonthVal = document.getElementById('avl-competence')?.value;
      const competence_date = competenceMonthVal ? `${competenceMonthVal}-01` : null;

      const data = {
        user_id: State.user.id, account_id,
        category_id: parseInt(document.getElementById('avl-category').value) || null,
        recurring_item_id: isEdit ? tx.recurring_item_id : null,
        type: currentType, amount,
        description: document.getElementById('avl-desc').value,
        date, is_paid: document.getElementById('avl-paid').checked ? 1 : 0,
        is_avulso: isEdit ? tx.is_avulso : 1,
        notes: isEdit ? tx.notes : null,
        credit_product,
        due_date,
        competence_date,
        interest_rate: parseFloat(document.getElementById('avl-interest-rate')?.value) || 0,
        interest_type: document.getElementById('avl-interest-type')?.value || 'daily',
        penalty_fixed_rate: parseFloat(document.getElementById('avl-penalty-fixed-rate')?.value) || 0
      };

      if (isEdit) {
        data.id = tx.id;
        const res = await window.api.transactions.update(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        await showDidacticFeedback(data);
      } else {
        const res = await window.api.transactions.create(data);
        if (res && res.error) {
          toast(res.error, 'error');
          return;
        }
        await showDidacticFeedback(data);
      }
      Modal.close();
      renderRecurring();
    } catch (err) {
      console.error(err);
      toast('Erro ao salvar lançamento: ' + err.message, 'error');
    }
  };
}
