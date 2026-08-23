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

function openAvulsoModal(accounts, categories, tx = null, defaultType = 'expense') {
  const isEdit = !!tx;
  if (isEdit) {
    const canEdit = (State.user.profile_type === 1 || State.user.profile_type === 2) || (State.permissions && State.permissions.can_edit_all === 1) || (!tx.user_id || tx.user_id === State.user.id);
    if (!canEdit) {
      toast('Você não tem permissão para editar este lançamento', 'error');
      return;
    }
  }
  const today = new Date().toISOString().split('T')[0];
  const dateVal = isEdit && tx.date ? tx.date.split(' ')[0] : today;
  const amountVal = isEdit ? tx.amount : '';
  const descVal = isEdit ? tx.description : '';
  const accountVal = isEdit ? tx.account_id : (accounts[0]?.id || '');
  const categoryVal = isEdit ? (tx.category_id || '') : '';
  const typeVal = isEdit ? tx.type : defaultType;
  const paidChecked = isEdit ? (tx.is_paid ? 'checked' : '') : 'checked';

  Modal.open(isEdit ? 'Editar Lançamento Avulso' : 'Novo Lançamento Avulso', `
    <div id="avl-dup-warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12px; animation:fadeIn 0.25s ease;"></div>
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
        <input type="month" id="avl-competence" value="${isEdit && tx.competence_date ? tx.competence_date.slice(0,7) : (dateVal ? dateVal.slice(0,7) : '')}" title="Mês de consumo/competência. Pode ser anterior ao mês de vencimento.">
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
          ${accounts.map(a => `<option value="${a.id}" ${a.id == accountVal ? 'selected' : ''}>${a.name}</option>`).join('')}
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
        competence_date
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
