/* ===
 * planning-main-1.js — Parte 1 de planning-main
 * Linhas 1801–2779 do app.js
 */

async function renderRecurring() {
  const page = document.getElementById('page-recurring');
  const [accounts, categories] = await Promise.all([
    window.api.accounts.getAll(State.user.id),
    window.api.categories.getAll(State.user.id),
  ]);

  if (!State.currentRecurringTab || State.currentRecurringTab === 'avulso') {
    State.currentRecurringTab = 'income';
  }
  const currentTab = State.currentRecurringTab;

  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Planejamento Mensal</h2><p class="page-subtitle">Gerencie suas receitas e despesas (Fixas e Variáveis)</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" id="btn-scan-nfce-planning" style="background:rgba(16,185,129,0.15);color:var(--accent-light);border:1px solid var(--accent);font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><span>📷</span> Ler Nota</button>
        <button class="btn" id="btn-new-avulso" style="background:#6366f1;color:#ffffff;border:none;font-weight:600;padding:8px 16px;border-radius:8px;cursor:pointer">+ Nova Variável</button>
        <button class="btn btn-primary" id="btn-new-recurring">+ Nova Fixa</button>
      </div>
    </div>
    <div class="report-tabs" id="rec-tabs">
      <button class="report-tab ${currentTab === 'income' ? 'active' : ''}" data-tab="income">💰 Receitas</button>
      <button class="report-tab ${currentTab === 'expense' ? 'active' : ''}" data-tab="expense">💸 Despesas</button>
    </div>
    <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;" id="rec-controls-wrap">
      <div style="flex:1;min-width:250px;position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-muted);pointer-events:none">🔍</span>
        <input type="text" id="rec-search-input" class="search-control-input" placeholder="Buscar por descrição, valor, conta ou categoria...">
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;color:var(--text-muted)">Ordenar por:</span>
        <select id="rec-sort-select" class="search-control-select">
          <option value="manual" ${State.currentSort === 'manual' ? 'selected' : ''}>👆 Ordem Manual</option>
          <option value="newest" ${State.currentSort === 'newest' ? 'selected' : ''}>📅 Mais Recentes</option>
          <option value="oldest" ${State.currentSort === 'oldest' ? 'selected' : ''}>📅 Mais Antigos</option>
          <option value="highest" ${State.currentSort === 'highest' ? 'selected' : ''}>📈 Maior Valor</option>
          <option value="lowest" ${State.currentSort === 'lowest' ? 'selected' : ''}>📉 Menor Valor</option>
        </select>
      </div>
      <div id="rec-period-wrap-main" style="margin-left:auto"></div>
    </div>
    <div id="rec-content"></div>
  `;

  document.getElementById('rec-period-wrap-main').appendChild(buildPeriodSelector(() => renderRecurring()));

  const sortSelect = document.getElementById('rec-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      State.currentSort = e.target.value;
      loadTab(State.currentRecurringTab);
    };
  }

  document.getElementById('btn-scan-nfce-planning').onclick = () => {
    if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
  };
  document.getElementById('btn-new-avulso').onclick = () => openAvulsoModal(accounts, categories, null, State.currentRecurringTab);
  document.getElementById('btn-new-recurring').onclick = () => openRecurringModal(null, accounts, categories, State.currentRecurringTab);

  document.querySelectorAll('#rec-tabs .report-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#rec-tabs .report-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentRecurringTab = btn.dataset.tab;
      loadTab(State.currentRecurringTab);
    };
  });

  async function loadTab(tab) {
    const content = document.getElementById('rec-content');
    content.innerHTML = `
      ${tab === 'expense' ? '<div id="invoices-container" style="margin-bottom:24px"></div>' : ''}
      <div class="section-title" style="margin-top:10px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📌</span> ${tab === 'income' ? 'Receitas Fixas' : 'Despesas Fixas'}
      </div>
      <div id="fixed-container"></div>
      
      <div class="section-title" style="margin-top:30px;margin-bottom:10px;font-size:16px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📝</span> ${tab === 'income' ? 'Receitas Variáveis' : 'Despesas Variáveis'} do Mês
      </div>
      <div id="variable-container"></div>
    `;

    const [items, monthlyTxs, allAvulsos, invoices] = await Promise.all([
      window.api.recurring.getAll(State.user.id, tab, State.currentMonth, State.currentYear),
      window.api.recurring.getMonthly({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.transactions.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, avulsoOnly: true }),
      tab === 'expense' ? window.api.invoices.getMonthly({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }).catch(e => { console.error(e); return []; }) : Promise.resolve([])
    ]);
    
    const avulsos = allAvulsos.filter(t => t.type === tab);

    const applyFilter = () => {
      const q = (document.getElementById('rec-search-input')?.value || '').toLowerCase().trim();
      
      const filteredItems = items.filter(item => {
        if (!q) return true;
        const tx = monthlyTxs.find(t => t.recurring_item_id === item.id);
        const name = (tx ? tx.description : item.name).toLowerCase();
        const amount = String(item.amount);
        const formattedAmount = fmt.currency(item.amount).toLowerCase();
        const account = (item.account_name || '').toLowerCase();
        const category = (item.category_name || '').toLowerCase();
        return name.includes(q) || amount.includes(q) || formattedAmount.includes(q) || account.includes(q) || category.includes(q);
      });

      const filteredAvulsos = avulsos.filter(t => {
        if (!q) return true;
        const desc = (t.description || '').toLowerCase();
        const amount = String(t.amount);
        const formattedAmount = fmt.currency(t.amount).toLowerCase();
        const account = (t.account_name || '').toLowerCase();
        const category = (t.category_name || '').toLowerCase();
        return desc.includes(q) || amount.includes(q) || formattedAmount.includes(q) || account.includes(q) || category.includes(q);
      });

      // Sort lists based on State.currentSort
      const sortMode = State.currentSort || 'manual';
      if (sortMode === 'newest') {
        filteredItems.sort((a, b) => b.due_day - a.due_day);
        filteredAvulsos.sort((a, b) => b.date.localeCompare(a.date));
      } else if (sortMode === 'oldest') {
        filteredItems.sort((a, b) => a.due_day - b.due_day);
        filteredAvulsos.sort((a, b) => a.date.localeCompare(b.date));
      } else if (sortMode === 'highest') {
        filteredItems.sort((a, b) => b.amount - a.amount);
        filteredAvulsos.sort((a, b) => b.amount - a.amount);
      } else if (sortMode === 'lowest') {
        filteredItems.sort((a, b) => a.amount - b.amount);
        filteredAvulsos.sort((a, b) => a.amount - b.amount);
      }

      if (tab === 'expense') {
        renderInvoicesList(document.getElementById('invoices-container'), invoices, accounts);
      }
      renderRecurringList(document.getElementById('fixed-container'), filteredItems, monthlyTxs, tab, accounts, categories);
      renderAvulsosList(document.getElementById('variable-container'), filteredAvulsos, accounts, categories, tab);

      const recList = document.getElementById('recurring-list');
      if (recList) setupDragAndDrop(recList, true);

      const avlList = document.getElementById('avulso-list');
      if (avlList) setupDragAndDrop(avlList, false);

      if (tab === 'expense' && State.highlightCardId) {
        applyTransactionCardHighlight();
      } else if (tab === 'income' && State.highlightAccountId) {
        applyTransactionAccountHighlight();
      }
    };

    const searchInput = document.getElementById('rec-search-input');
    if (searchInput) {
      searchInput.oninput = applyFilter;
      applyFilter();
    } else {
      applyFilter();
    }
  }

  await loadTab(currentTab);
}

function setupDragAndDrop(container, isRecurring) {
  if (!container) return;

  const items = container.querySelectorAll('.transaction-item');
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', async () => {
      item.classList.remove('dragging');
      
      const orderedElements = [...container.querySelectorAll('.transaction-item')];
      const positions = orderedElements.map((el, index) => ({
        id: parseInt(el.dataset.id),
        position: index
      }));

      try {
        if (isRecurring) {
          await window.api.recurring.updatePositions(State.user.id, positions);
        } else {
          await window.api.transactions.updatePositions(State.user.id, positions);
        }
      } catch (err) {
        console.error('Erro ao salvar nova ordenação:', err);
        toast('Erro ao salvar a ordenação');
      }
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = container.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...container.querySelectorAll('.transaction-item:not(.dragging)')];
    
    const nextSibling = siblings.find(sibling => {
      const rect = sibling.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      return e.clientY <= midpoint;
    });

    container.insertBefore(draggingItem, nextSibling);
  });
}

function renderRecurringList(container, items, monthlyTxs, type, accounts, categories) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const settings = State.settings;
  const alertDays = settings.alert_days_before || 3;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px">
        <div class="empty-title">Nenhuma ${type === 'income' ? 'receita' : 'despesa'} fixa cadastrada</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${items.length} item(s) cadastrado(s)</span>
    </div>
    <div class="recurring-list" id="recurring-list"></div>`;

  const list = document.getElementById('recurring-list');
  list.innerHTML = items.map(item => {
    const tx = monthlyTxs.find(t => t.recurring_item_id === item.id);
    const isPaid = tx?.is_paid ?? false;

    // Calculate calendar days left relative to the viewed month/year period
    const dueYear = State.currentYear;
    const dueMonth = State.currentMonth;
    const dueDay = Math.min(item.due_day, new Date(dueYear, dueMonth, 0).getDate());
    const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
    const diffTime = dueDate.getTime() - todayDate.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isAlert = !isPaid && daysLeft >= 0 && daysLeft <= alertDays;
    const isOverdue = !isPaid && daysLeft < 0;
    const canEdit = State.user?.profile_type === 1 || State.user?.profile_type === 2 || State.permissions.can_edit_all === 1 || !item.user_id || item.user_id === State.user.id;

    const compDateStr = tx ? tx.date.split(' ')[0] : `${State.currentYear}-${String(State.currentMonth).padStart(2,'0')}-${String(item.due_day).padStart(2,'0')}`;
    const payDateStr = tx && tx.payment_date ? tx.payment_date.split(' ')[0] : null;

    const isEarlyPaid = isPaid && payDateStr && compDateStr && (payDateStr < compDateStr);
    const isLatePaid = isPaid && payDateStr && compDateStr && (payDateStr > compDateStr);
    const hasPenalty = tx && tx.penalty_amount > 0;
    const hasDiscount = tx && tx.discount_amount > 0;

    const baseAmount = tx ? tx.amount : item.amount;
    const netAmount = baseAmount + (tx?.penalty_amount || 0) - (tx?.discount_amount || 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const rule = {
      interest_rate: (tx && tx.interest_rate !== undefined) ? tx.interest_rate : item.interest_rate,
      interest_type: (tx && tx.interest_type) ? tx.interest_type : item.interest_type,
      penalty_fixed_rate: (tx && tx.penalty_fixed_rate !== undefined) ? tx.penalty_fixed_rate : item.penalty_fixed_rate,
    };
    const proj = (!isPaid && isOverdue) ? calculateProjectedInterest(baseAmount, compDateStr, todayStr, rule) : null;

    let statusBadge = '';
    if (isPaid) {
      if (isEarlyPaid && hasDiscount) {
        statusBadge = `<span class="transaction-status status-paid-discount" title="Valor base: ${fmt.currency(baseAmount)} | Desconto: -${fmt.currency(tx.discount_amount)} | Total Pago: ${fmt.currency(netAmount)}">🏷️ Pago Antecipado c/ Desconto (${fmt.date(payDateStr)})</span>`;
      } else if (isEarlyPaid) {
        statusBadge = `<span class="transaction-status status-paid-early" title="Pago antecipado em ${fmt.date(payDateStr)}">✓ Pago Antecipado (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid && hasPenalty) {
        statusBadge = `<span class="transaction-status status-paid-penalty" title="Valor base: ${fmt.currency(baseAmount)} | Juros: +${fmt.currency(tx.penalty_amount)} | Total Pago: ${fmt.currency(netAmount)}">⚠️ Pago em Atraso c/ Juros (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid) {
        statusBadge = `<span class="transaction-status status-paid-late" title="Pago em atraso em ${fmt.date(payDateStr)}">⚠️ Pago em Atraso (${fmt.date(payDateStr)})</span>`;
      } else {
        statusBadge = `<span class="transaction-status status-paid">✓ Pago</span>`;
      }
    }
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171" title="${Math.abs(daysLeft)}d de atraso${proj && proj.penaltyAmount > 0 ? ` • Juros estimados: +${fmt.currency(proj.penaltyAmount)}` : ''}">⚠️ Atrasado (${Math.abs(daysLeft)}d)</span>`;
    else if (isAlert) statusBadge = `<span class="transaction-status" style="background:var(--warning-dim);color:var(--warning)">🚨 Vence em ${daysLeft}d</span>`;
    else statusBadge = `<span class="transaction-status status-pending">⏳ Dia ${item.due_day}</span>`;

    let checkBtnHtml = '';
    if (tx) {
      if (!canEdit) {
        checkBtnHtml = `
          <button class="transaction-check-btn locked ${isPaid ? 'checked' : ''}" title="Apenas leitura (🔒)" disabled>
            ${isPaid ? '✓' : '🔒'}
          </button>
        `;
      } else {
        checkBtnHtml = `
          <button class="transaction-check-btn rec-toggle-paid ${isPaid ? 'checked' : ''}" 
                  data-tx-id="${tx.id}" 
                  title="${isPaid ? (type === 'income' ? 'Marcar como não recebida' : 'Marcar como não paga') : (type === 'income' ? 'Marcar como recebida' : 'Marcar como paga')}">
            ${isPaid ? '✓' : ''}
          </button>
        `;
      }
    } else {
      checkBtnHtml = `
        <button class="transaction-check-btn disabled" title="Indisponível" disabled></button>
      `;
    }

    return `
      <div class="transaction-item recurring-item ${isPaid ? 'recurring-paid' : ''} ${item.is_priority ? 'recurring-priority' : ''}" data-id="${item.id}" data-account-id="${item.account_id || ''}" data-account-name="${(item.account_name || '').toLowerCase()}" data-invoice-id="${tx?.invoice_id || ''}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
        ${checkBtnHtml}
        <div class="transaction-category-icon" style="background:${item.color}22;font-size:20px">${item.icon}</div>
        <div class="transaction-info">
          <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
            ${item.is_priority ? '<span title="Prioritário" style="font-size:14px">⭐</span>' : ''}
            ${tx ? tx.description : item.name}
            ${tx && tx.competence_date ? `<span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--bg-raised);color:var(--text-muted);border:1px solid var(--border);font-weight:600;margin-left:4px" title="Mês de Referência / Consumo">Ref: ${fmtCompetence(tx.competence_date)}</span>` : ''}
            ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
          </div>
          <div class="transaction-meta">
            ${item.category_name ? `${item.cat_icon || ''} ${item.category_name} • ` : ''}
            ${(item.account_type === 'credit' || accounts.find(a => a.id === item.account_id)?.type === 'credit') ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);font-weight:600">💳 ${item.account_name}</span>` : (item.account_name || '—')} • Todo dia ${item.due_day}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="transaction-amount ${type === 'income' ? 'income' : 'expense'}">
            ${type === 'income' ? '+' : '-'}${fmt.currency(isPaid ? netAmount : baseAmount)}
          </div>
          ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
            <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-top:-2px" title="Valor aproximado atualizado para hoje com encargos (+${fmt.currency(proj.penaltyAmount)})">
              Aprox. hoje: ${fmt.currency(proj.projectedAmount)}
            </div>
          ` : ''}
          ${isPaid && (hasPenalty || hasDiscount) ? `
            <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
              Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(tx.penalty_amount)}` : `Desconto: -${fmt.currency(tx.discount_amount)}`}
            </div>
          ` : ''}
          ${statusBadge}
        </div>
        <div class="transaction-actions">
          ${((tx && (tx.pix_code || (tx.notes && tx.notes.includes('000201')))) || (item.pix_code || (item.notes && item.notes.includes('000201')))) ? `<button class="btn btn-secondary btn-sm rec-pix" data-id="${tx ? tx.id : item.id}" title="Pagar com PIX (QR Code)" style="background:rgba(6,182,212,0.14);color:#38bdf8;border-color:rgba(6,182,212,0.4);font-size:11px;padding:2px 7px;border-radius:6px;font-weight:700">⚡ PIX</button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-priority" data-id="${item.id}" title="${item.is_priority ? 'Remover prioridade' : 'Marcar como prioritário'}">${item.is_priority ? '★' : '☆'}</button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon rec-edit" data-id="${item.id}" title="Editar">✏️</button>` : ''}
          ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon rec-delete" data-id="${item.id}" title="Excluir">🗑</button>` : ''}
          ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.rec-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const targetId = parseInt(btn.dataset.id);
      const tx = monthlyTxs.find(t => t.id == targetId || t.recurring_item_id == targetId);
      if (tx && typeof openPixPaymentModal === 'function') openPixPaymentModal(tx, () => renderRecurring());
    };
  });

  list.querySelectorAll('.rec-toggle-paid').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const txId = parseInt(btn.dataset.txId);
      const tx = monthlyTxs.find(t => t.id == txId);
      if (tx && tx.is_paid) {
        await window.api.transactions.togglePaid(txId);
        toast('Status atualizado');
        renderRecurring();
      } else {
        openPaymentDateModal(txId, tx ? tx.date : null, () => {
          renderRecurring();
        });
      }
    };
  });
  list.querySelectorAll('.rec-priority').forEach(btn => {
    btn.onclick = async (e) => { e.stopPropagation(); await window.api.recurring.togglePriority(parseInt(btn.dataset.id)); renderRecurring(); };
  });
  list.querySelectorAll('.rec-edit').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = parseInt(btn.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);

      if (tx) {
        Modal.open('Editar Lançamento Fixo', `
          <div style="padding: 4px 2px;">
            <div style="text-align: center; margin-bottom: 18px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); color: #10b981; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(16, 185, 129, 0.25);">
                ✏️
              </div>
              <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Como deseja editar este lançamento?</h3>
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${tx.description || item.name}</span>
              </div>
            </div>

            <div class="choice-options-container">
              <div class="choice-option-card card-accent-emerald" id="btn-edit-month">
                <div class="choice-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
                  📅
                </div>
                <div class="choice-body">
                  <div class="choice-title">
                    <span>Apenas este mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})</span>
                  </div>
                  <div class="choice-desc">
                    Altera valor, vencimento ou categoria somente desta ocorrência. As outras parcelas continuam inalteradas.
                  </div>
                </div>
                <div class="choice-chevron">›</div>
              </div>

              <div class="choice-option-card card-accent-indigo" id="btn-edit-all">
                <div class="choice-icon-wrap" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25);">
                  ⚙️
                </div>
                <div class="choice-body">
                  <div class="choice-title">
                    <span>Cadastro Fixo Geral (Regra Mestre)</span>
                  </div>
                  <div class="choice-desc">
                    Altera a regra principal de valor, repetições, conta ou vencimento para todas as parcelas e meses futuros.
                  </div>
                </div>
                <div class="choice-chevron">›</div>
              </div>
            </div>

            <div style="margin-top: 16px; text-align: center;">
              <button class="btn btn-secondary" id="btn-edit-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
                Cancelar
              </button>
            </div>
          </div>
        `);

        document.getElementById('btn-edit-cancel').onclick = Modal.close;

        document.getElementById('btn-edit-month').onclick = () => {
          Modal.close();
          openEditMonthTransactionModal(tx, item, accounts, categories, type);
        };

        document.getElementById('btn-edit-all').onclick = () => {
          Modal.close();
          openRecurringModal(item, accounts, categories, type);
        };
      } else {
        openRecurringModal(item, accounts, categories, type);
      }
    };
  });
  list.querySelectorAll('.rec-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = parseInt(btn.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);
      
      Modal.open('Excluir Lançamento Fixo', `
        <div style="padding: 4px 2px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(239, 68, 68, 0.25);">
              🗑️
            </div>
            <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Como deseja excluir este lançamento?</h3>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${item.name}</span>
            </div>
          </div>

          <div class="choice-options-container">
            ${tx ? `
            <div class="choice-option-card card-accent-amber" id="btn-del-month">
              <div class="choice-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                🗓️
              </div>
              <div class="choice-body">
                <div class="choice-title">
                  <span>Excluir apenas neste mês (${MONTHS[State.currentMonth - 1]} / ${State.currentYear})</span>
                </div>
                <div class="choice-desc">
                  Remove somente o lançamento desta competência. O cadastro fixo e os meses futuros continuam ativos.
                </div>
              </div>
              <div class="choice-chevron">›</div>
            </div>
            ` : ''}

            <div class="choice-option-card card-accent-danger" id="btn-del-all">
              <div class="choice-icon-wrap" style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25);">
                🚫
              </div>
              <div class="choice-body">
                <div class="choice-title">
                  <span style="color: #f87171;">Desativar Cadastro Fixo (Todos os Meses)</span>
                </div>
                <div class="choice-desc">
                  Desativa a regra mestre e remove todas as ocorrências futuras de forma definitiva.
                </div>
              </div>
              <div class="choice-chevron">›</div>
            </div>
          </div>

          <div style="margin-top: 16px; text-align: center;">
            <button class="btn btn-secondary" id="btn-del-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
              Cancelar
            </button>
          </div>
        </div>
      `);
      
      if (tx) {
        document.getElementById('btn-del-month').onclick = async () => {
          if (item.repeat_months > 0) {
            // Limited installment expense - Ask if Postpone or Skip
            Modal.open('Opções do Parcelamento', `
              <div style="padding: 4px 2px;">
                <div style="text-align: center; margin-bottom: 18px;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(14, 165, 233, 0.12); color: #38bdf8; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(14, 165, 233, 0.25);">
                    ⏳
                  </div>
                  <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Tratamento do Parcelamento</h3>
                  <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); max-width: 90%;">
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">📌 ${tx.description}</span>
                  </div>
                </div>

                <div class="choice-options-container">
                  <div class="choice-option-card card-accent-emerald" id="btn-postpone">
                    <div class="choice-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
                      ➡️
                    </div>
                    <div class="choice-body">
                      <div class="choice-title">
                        <span>Postergar Parcela (Adiar para o próximo mês)</span>
                      </div>
                      <div class="choice-desc">
                        Empurra esta parcela e todas as subsequentes em 1 mês para a frente, mantendo o total de parcelas intacto.
                      </div>
                    </div>
                    <div class="choice-chevron">›</div>
                  </div>

                  <div class="choice-option-card card-accent-amber" id="btn-skip">
                    <div class="choice-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                      ⏭️
                    </div>
                    <div class="choice-body">
                      <div class="choice-title">
                        <span>Pular Parcela (Cancelar apenas deste mês)</span>
                      </div>
                      <div class="choice-desc">
                        Cancela a cobrança deste mês sem alterar o cronograma das parcelas dos meses seguintes.
                      </div>
                    </div>
                    <div class="choice-chevron">›</div>
                  </div>
                </div>

                <div style="margin-top: 16px; text-align: center;">
                  <button class="btn btn-secondary" id="btn-postpone-cancel" style="min-width: 120px; font-size: 12.5px; border-radius: 8px;">
                    Cancelar
                  </button>
                </div>
              </div>
            `);

            document.getElementById('btn-postpone').onclick = async () => {
              await window.api.recurring.postponeInstallment({ txId: tx.id, itemId: item.id });
              toast('Parcela postergada para o próximo mês!');
              Modal.close();
              renderRecurring();
            };

            document.getElementById('btn-skip').onclick = async () => {
              await window.api.transactions.delete(tx.id);
              toast('Lançamento deste mês cancelado');
              Modal.close();
              renderRecurring();
            };

            document.getElementById('btn-postpone-cancel').onclick = Modal.close;
          } else {
            // Infinite recurring item - Just delete the transaction
            await window.api.transactions.delete(tx.id);
            toast('Lançamento deste mês excluído');
            Modal.close();
            renderRecurring();
          }
        };
      }
      
      document.getElementById('btn-del-all').onclick = async () => {
        const fromDate = `${State.currentYear}-${String(State.currentMonth).padStart(2, '0')}-01`;
        await window.api.recurring.delete(itemId, fromDate);
        toast('Recorrência e lançamentos subsequentes excluídos');
        Modal.close();
        renderRecurring();
      };
      
      document.getElementById('btn-del-cancel').onclick = Modal.close;
    };
  });

  // Clique na linha do lançamento fixo para abrir Pop-up de Detalhes completos
  list.querySelectorAll('.recurring-item').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('.transaction-check-btn, .rec-pix, .rec-priority, .rec-edit, .rec-delete')) return;
      const itemId = parseInt(row.dataset.id);
      const item = items.find(i => i.id === itemId);
      const tx = monthlyTxs.find(t => t.recurring_item_id === itemId);
      if (typeof openTransactionDetailsModal === 'function') {
        openTransactionDetailsModal({ tx, item, accounts, categories, type, onUpdate: () => renderRecurring() });
      }
    };
  });
}

function renderAvulsosList(container, txs, accounts, categories, tabType) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const settings = State.settings || {};
  const alertDays = settings.alert_days_before || 3;

  container.innerHTML = `
    <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${txs.length} lançamento(s)</span>
    </div>
    <div class="transactions-list" id="avulso-list"></div>`;

  const list = document.getElementById('avulso-list');
  if (txs.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding: 24px"><div class="empty-title">Nenhum lançamento variável</div></div>`;
    return;
  }
  list.innerHTML = txs.map(t => {
    const isPaid = t.is_paid === 1;
    const canEdit = State.user?.profile_type === 1 || State.user?.profile_type === 2 || State.permissions.can_edit_all === 1 || !t.user_id || t.user_id === State.user.id;
    let checkBtnHtml = '';
    if (!canEdit) {
      checkBtnHtml = `
        <button class="transaction-check-btn locked ${isPaid ? 'checked' : ''}" title="Apenas leitura (🔒)" disabled>
          ${isPaid ? '✓' : '🔒'}
        </button>
      `;
    } else {
      checkBtnHtml = `
        <button class="transaction-check-btn avl-toggle ${isPaid ? 'checked' : ''}" 
                data-id="${t.id}" 
                title="${isPaid ? (t.type === 'income' ? 'Marcar como não recebida' : 'Marcar como não paga') : (t.type === 'income' ? 'Marcar como recebida' : 'Marcar como paga')}">
          ${isPaid ? '✓' : ''}
        </button>
      `;
    }

    const compDateStr = t.date ? t.date.split(' ')[0] : null;
    const payDateStr = t.payment_date ? t.payment_date.split(' ')[0] : null;
    
    let daysLeft = null;
    if (compDateStr) {
      const parts = compDateStr.split('-').map(Number);
      const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffTime = dueDate.getTime() - todayDate.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const isAlert = !isPaid && daysLeft !== null && daysLeft >= 0 && daysLeft <= alertDays;
    const isOverdue = !isPaid && daysLeft !== null && daysLeft < 0;
    const isEarlyPaid = isPaid && payDateStr && compDateStr && (payDateStr < compDateStr);
    const isLatePaid = isPaid && payDateStr && compDateStr && (payDateStr > compDateStr);
    const hasPenalty = t.penalty_amount > 0;
    const hasDiscount = t.discount_amount > 0;
    const baseAmount = t.amount;
    const netAmount = baseAmount + (t.penalty_amount || 0) - (t.discount_amount || 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const rule = {
      interest_rate: t.interest_rate,
      interest_type: t.interest_type,
      penalty_fixed_rate: t.penalty_fixed_rate,
    };
    const proj = (!isPaid && isOverdue) ? calculateProjectedInterest(baseAmount, compDateStr, todayStr, rule) : null;

    let statusBadge = '';
    if (isPaid) {
      if (isEarlyPaid && hasDiscount) {
        statusBadge = `<span class="transaction-status status-paid-discount" title="Valor base: ${fmt.currency(baseAmount)} | Desconto: -${fmt.currency(t.discount_amount)} | Total Pago: ${fmt.currency(netAmount)}">🏷️ Pago Antecipado c/ Desconto (${fmt.date(payDateStr)})</span>`;
      } else if (isEarlyPaid) {
        statusBadge = `<span class="transaction-status status-paid-early" title="Pago antecipado em ${fmt.date(payDateStr)}">✓ Pago Antecipado (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid && hasPenalty) {
        statusBadge = `<span class="transaction-status status-paid-penalty" title="Valor base: ${fmt.currency(baseAmount)} | Juros: +${fmt.currency(t.penalty_amount)} | Total Pago: ${fmt.currency(netAmount)}">⚠️ Pago em Atraso c/ Juros (${fmt.date(payDateStr)})</span>`;
      } else if (isLatePaid) {
        statusBadge = `<span class="transaction-status status-paid-late" title="Pago em atraso em ${fmt.date(payDateStr)}">⚠️ Pago em Atraso (${fmt.date(payDateStr)})</span>`;
      } else {
        statusBadge = `<span class="transaction-status status-paid">✓ Pago${payDateStr ? ' (' + fmt.date(payDateStr) + ')' : ''}</span>`;
      }
    }
    else if (isOverdue) statusBadge = `<span class="transaction-status" style="background:#7f1d1d;color:#f87171" title="${Math.abs(daysLeft)}d de atraso${proj && proj.penaltyAmount > 0 ? ` • Juros estimados: +${fmt.currency(proj.penaltyAmount)}` : ''}">⚠️ Atrasado (${Math.abs(daysLeft)}d)</span>`;
    else if (isAlert) statusBadge = `<span class="transaction-status" style="background:var(--warning-dim);color:var(--warning)">🚨 Vence em ${daysLeft}d</span>`;
    else statusBadge = `<span class="transaction-status status-pending">⏳ Pendente</span>`;

    return `
    <div class="transaction-item" data-id="${t.id}" data-account-id="${t.account_id || ''}" data-account-name="${(t.account_name || '').toLowerCase()}" data-invoice-id="${t.invoice_id || ''}" draggable="${State.currentSort === 'manual' ? 'true' : 'false'}">
      ${checkBtnHtml}
      <div class="transaction-category-icon" style="background:${t.category_color ? t.category_color + '22' : 'var(--bg-raised)'}">
        ${t.category_icon || (t.type === 'income' ? '💰' : '📋')}
      </div>
      <div class="transaction-info">
        <div class="transaction-desc" style="display:flex;align-items:center;gap:6px">
          ${t.description || 'Sem descrição'}
          ${t.competence_date ? `<span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--bg-raised);color:var(--text-muted);border:1px solid var(--border);font-weight:600;margin-left:4px" title="Mês de Referência / Consumo">Ref: ${fmtCompetence(t.competence_date)}</span>` : ''}
          ${!canEdit ? '<span title="Apenas Leitura" style="font-size: 11px; opacity: 0.7;">🔒</span>' : ''}
        </div>
        <div class="transaction-meta">${fmt.date(t.date)}${typeof isWeekendOrHoliday === 'function' && isWeekendOrHoliday(t.date) && !isPaid ? ` <span style="font-size:10.5px;color:#60a5fa;font-weight:600" title="Vence em fim de semana ou feriado. Prorroga para o 1º dia útil: ${fmt.date(getNextBusinessDay(t.date))}">📅 Prorroga: ${fmt.date(getNextBusinessDay(t.date))}</span>` : ''} • ${(t.account_type === 'credit' || accounts.find(a => a.id === t.account_id)?.type === 'credit') ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);font-weight:600">💳 ${t.account_name}</span>` : (t.account_name || '—')} ${t.category_name ? `• ${t.category_name}` : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="transaction-amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(isPaid ? netAmount : baseAmount)}</div>
        ${!isPaid && isOverdue && proj && proj.penaltyAmount > 0 ? `
          <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-top:-2px" title="Valor aproximado atualizado para hoje com encargos (+${fmt.currency(proj.penaltyAmount)})">
            Aprox. hoje: ${fmt.currency(proj.projectedAmount)}
          </div>
        ` : ''}
        ${isPaid && (hasPenalty || hasDiscount) ? `
          <div style="font-size:10px;color:var(--text-muted);margin-top:-2px">
            Base: ${fmt.currency(baseAmount)} • ${hasPenalty ? `Juros: +${fmt.currency(t.penalty_amount)}` : `Desconto: -${fmt.currency(t.discount_amount)}`}
          </div>
        ` : ''}
        ${statusBadge}
      </div>
      <div class="transaction-actions">
        ${(t.pix_code || (t.notes && t.notes.includes('000201'))) ? `<button class="btn btn-secondary btn-sm avl-pix" data-id="${t.id}" title="Pagar com PIX (QR Code)" style="background:rgba(6,182,212,0.14);color:#38bdf8;border-color:rgba(6,182,212,0.4);font-size:11px;padding:2px 7px;border-radius:6px;font-weight:700">⚡ PIX</button>` : ''}
        ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon avl-edit" data-id="${t.id}" title="Editar">✏️</button>` : ''}
        ${canEdit ? `<button class="btn btn-danger btn-sm btn-icon avl-delete" data-id="${t.id}" title="Excluir">🗑</button>` : ''}
        ${!canEdit ? `<span title="Apenas Leitura" style="font-size:12px;opacity:0.6;margin-right:8px">🔒 Apenas Leitura</span>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.avl-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tx = txs.find(t => t.id == parseInt(btn.dataset.id));
      if (tx && typeof openPixPaymentModal === 'function') openPixPaymentModal(tx, () => renderRecurring());
    };
  });

  list.querySelectorAll('.avl-toggle').forEach(btn => {
    btn.onclick = async () => {
      const txId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == txId);
      if (tx && tx.is_paid) {
        await window.api.transactions.togglePaid(txId);
        toast('Status atualizado');
        renderRecurring();
      } else {
        openPaymentDateModal(txId, tx ? tx.date : null, () => renderRecurring());
      }
    };
  });
  list.querySelectorAll('.avl-edit').forEach(btn => {
    btn.onclick = () => {
      const tx = txs.find(t => t.id == parseInt(btn.dataset.id));
      openAvulsoModal(accounts, categories, tx);
    };
  });
  list.querySelectorAll('.avl-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const txId = parseInt(btn.dataset.id);
      const tx = txs.find(t => t.id == txId);
      const desc = tx && tx.description ? `"${tx.description}"` : 'esta despesa variável';
      const amountStr = tx ? fmt.currency(tx.amount) : '';

      Modal.open('Excluir Lançamento Variável', `
        <div style="padding: 4px 2px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(239, 68, 68, 0.25);">
              🗑️
            </div>
            <h3 style="font-size: 15.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Excluir Lançamento Variável</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 12px 0;">
              Tem certeza que deseja excluir permanentemente este lançamento?
            </p>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; font-size: 12.5px; color: var(--text-secondary); max-width: 90%;">
              <span>📌 <strong>${desc}</strong>${amountStr ? ' • <strong style="color:#f87171">' + amountStr + '</strong>' : ''}</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-secondary" id="btn-cancel-delete-avl" style="flex: 1; padding: 10px; font-size: 13px; border-radius: 8px;">
              Cancelar
            </button>
            <button class="btn btn-danger" id="btn-confirm-delete-avl" style="flex: 1.3; font-weight: 700; padding: 10px; background: #ef4444; border-color: #ef4444; color: #fff; border-radius: 8px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🗑️</span> Confirmar Exclusão
            </button>
          </div>
        </div>
      `);

      document.getElementById('btn-cancel-delete-avl').onclick = Modal.close;
      document.getElementById('btn-confirm-delete-avl').onclick = async () => {
        Modal.close();
        const res = await window.api.transactions.delete(txId);
        if (res && res.error) toast(res.error, 'error');
        else { toast('Despesa variável excluída com sucesso!', 'success'); renderRecurring(); }
      };
    };
  });

  // Clique na linha do lançamento avulso para abrir Pop-up de Detalhes completos
  list.querySelectorAll('.transaction-item').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('.transaction-check-btn, .avl-pix, .avl-edit, .avl-delete')) return;
      const txId = parseInt(row.dataset.id);
      const tx = txs.find(t => t.id == txId);
      if (tx && typeof openTransactionDetailsModal === 'function') {
        openTransactionDetailsModal({ tx, item: null, accounts, categories, type: tx.type, onUpdate: () => renderRecurring() });
      }
    };
  });
}

// ── 💳 Destaque Interativo de Faturas e Parcelas de Cartão ──
function toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId) {
  if (State.highlightCardId === cardId || (invoiceId && State.highlightInvoiceId === invoiceId)) {
    State.highlightCardId = null;
    State.highlightCardColor = null;
    State.highlightCardName = null;
    State.highlightInvoiceId = null;
    toast(`Destaque de fatura desativado`);
  } else {
    State.highlightCardId = cardId || null;
    State.highlightCardColor = cardColor || '#3b82f6';
    State.highlightCardName = cardName || 'Cartão';
    State.highlightInvoiceId = invoiceId || null;
  }

  // Update invoice cards visual state
  document.querySelectorAll('.invoice-card-item').forEach(cardEl => {
    const cid = parseInt(cardEl.dataset.cardId);
    const invId = parseInt(cardEl.dataset.invoiceId);
    const color = cardEl.dataset.bankColor || '#3b82f6';
    const isSelected = (State.highlightCardId && State.highlightCardId === cid) || (State.highlightInvoiceId && State.highlightInvoiceId === invId);
    const badge = cardEl.querySelector('.invoice-highlight-badge');

    if (isSelected) {
      cardEl.classList.add('invoice-card-selected');
      cardEl.style.background = `${color}25`;
      cardEl.style.borderColor = color;
      cardEl.style.boxShadow = `0 0 22px ${color}55, inset 0 0 10px ${color}22`;
      if (badge) {
        badge.innerHTML = `✨ <strong>Parcelas Destacadas abaixo</strong> (Clique para desmarcar)`;
        badge.style.background = color;
        badge.style.color = '#ffffff';
        badge.style.borderColor = color;
      }
    } else {
      cardEl.classList.remove('invoice-card-selected');
      cardEl.style.background = `${color}15`;
      cardEl.style.borderColor = `${color}44`;
      cardEl.style.boxShadow = 'none';
      if (badge) {
        badge.innerHTML = `🔍 Ver Parcelas desta Fatura`;
        badge.style.background = `${color}25`;
        badge.style.color = color;
        badge.style.borderColor = `${color}66`;
      }
    }
  });

  applyTransactionCardHighlight();
}

function applyTransactionCardHighlight() {
  const cardId = State.highlightCardId;
  const invoiceId = State.highlightInvoiceId;
  const color = State.highlightCardColor || '#3b82f6';
  const cardName = State.highlightCardName || 'Cartão';
  const cleanCardName = cardName.toLowerCase().trim();

  const allItems = document.querySelectorAll('#fixed-container .transaction-item, #variable-container .transaction-item');
  let firstMatchedEl = null;
  let matchCount = 0;

  allItems.forEach(itemEl => {
    const itemAccountId = parseInt(itemEl.dataset.accountId);
    const itemInvoiceId = parseInt(itemEl.dataset.invoiceId);
    const itemAccountName = (itemEl.dataset.accountName || '').toLowerCase().trim();
    
    // Reset previous dynamic highlight styles
    itemEl.classList.remove('card-highlight-active', 'card-highlight-dimmed');
    itemEl.style.removeProperty('border');
    itemEl.style.removeProperty('border-color');
    itemEl.style.removeProperty('border-left');
    itemEl.style.removeProperty('background');
    itemEl.style.removeProperty('box-shadow');
    itemEl.style.removeProperty('transform');
    
    const existingPill = itemEl.querySelector('.card-highlight-pill');
    if (existingPill) existingPill.remove();

    if (cardId || invoiceId || cleanCardName) {
      // Check matching criteria:
      const matchAccount = cardId && !isNaN(cardId) && itemAccountId === cardId;
      const matchInvoice = invoiceId && !isNaN(invoiceId) && itemInvoiceId === invoiceId;
      const matchName = cleanCardName && itemAccountName && (cleanCardName.includes(itemAccountName) || itemAccountName.includes(cleanCardName));

      const isMatch = matchAccount || matchInvoice || matchName;

      if (isMatch) {
        matchCount++;
        if (!firstMatchedEl) firstMatchedEl = itemEl;

        itemEl.classList.add('card-highlight-active');
        itemEl.style.setProperty('border', `2px solid ${color}`, 'important');
        itemEl.style.setProperty('border-left', `8px solid ${color}`, 'important');
        itemEl.style.setProperty('background', `${color}18`, 'important');
        itemEl.style.setProperty('box-shadow', `0 4px 20px ${color}48`, 'important');
        itemEl.style.setProperty('transform', 'translateX(6px)', 'important');

        const descEl = itemEl.querySelector('.transaction-desc');
        if (descEl) {
          const pill = document.createElement('span');
          pill.className = 'card-highlight-pill';
          pill.style.cssText = `font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: ${color}; color: #ffffff; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px ${color}66; animation: popIn 0.3s ease;`;
          pill.innerHTML = `💳 ${cardName} • Composição da Fatura`;
          descEl.appendChild(pill);
        }
      } else {
        itemEl.classList.add('card-highlight-dimmed');
      }
    }
  });

  if ((cardId || invoiceId) && matchCount > 0 && firstMatchedEl) {
    firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`✨ ${matchCount} lançamento(s) do cartão ${cardName} destacado(s)`);
  } else if ((cardId || invoiceId) && matchCount === 0) {
    toast(`Nenhum lançamento avulso ou fixo deste mês encontrado para o cartão ${cardName}.`);
  }
}

function applyTransactionAccountHighlight() {
  const accountId = State.highlightAccountId;
  const color = State.highlightAccountColor || '#10b981';
  const accountName = State.highlightAccountName || 'Conta';
  const cleanAccountName = accountName.toLowerCase().trim();

  const allItems = document.querySelectorAll('#fixed-container .transaction-item, #variable-container .transaction-item');
  let firstMatchedEl = null;
  let matchCount = 0;

  allItems.forEach(itemEl => {
    const itemAccountId = parseInt(itemEl.dataset.accountId);
    const itemAccountName = (itemEl.dataset.accountName || '').toLowerCase().trim();
    
    // Reset previous dynamic highlight styles
    itemEl.classList.remove('card-highlight-active', 'card-highlight-dimmed', 'account-highlight-active', 'account-highlight-dimmed');
    itemEl.style.removeProperty('border');
    itemEl.style.removeProperty('border-color');
    itemEl.style.removeProperty('border-left');
    itemEl.style.removeProperty('background');
    itemEl.style.removeProperty('box-shadow');
    itemEl.style.removeProperty('transform');
    
    const existingPill = itemEl.querySelector('.account-highlight-pill');
    if (existingPill) existingPill.remove();

    if (accountId || cleanAccountName) {
      // Check matching criteria:
      const matchAccount = accountId && !isNaN(accountId) && itemAccountId === accountId;
      const matchName = cleanAccountName && itemAccountName && (cleanAccountName.includes(itemAccountName) || itemAccountName.includes(cleanAccountName));

      const isMatch = matchAccount || matchName;

      if (isMatch) {
        matchCount++;
        if (!firstMatchedEl) firstMatchedEl = itemEl;

        itemEl.classList.add('account-highlight-active');
        itemEl.style.setProperty('border', `2px solid ${color}`, 'important');
        itemEl.style.setProperty('border-left', `8px solid ${color}`, 'important');
        itemEl.style.setProperty('background', `${color}18`, 'important');
        itemEl.style.setProperty('box-shadow', `0 4px 20px ${color}48`, 'important');
        itemEl.style.setProperty('transform', 'translateX(6px)', 'important');

        const descEl = itemEl.querySelector('.transaction-desc');
        if (descEl) {
          const pill = document.createElement('span');
          pill.className = 'account-highlight-pill';
          pill.style.cssText = `font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: ${color}; color: #ffffff; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px ${color}66; animation: popIn 0.3s ease; cursor: pointer;`;
          pill.innerHTML = `🏦 ${accountName} • Composição do Rendimento ✕`;
          pill.title = 'Clique para desmarcar o destaque';
          pill.onclick = (e) => {
            e.stopPropagation();
            State.highlightAccountId = null;
            State.highlightAccountColor = null;
            State.highlightAccountName = null;
            applyTransactionAccountHighlight();
            toast('Destaque de conta desativado');
          };
          descEl.appendChild(pill);
        }
      } else {
        itemEl.classList.add('card-highlight-dimmed');
      }
    }
  });

  if (accountId && matchCount > 0 && firstMatchedEl) {
    firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`✨ ${matchCount} provento(s) da conta ${accountName} destacado(s)`);
  } else if (accountId && matchCount === 0) {
    toast(`Nenhum provento deste mês encontrado para a conta ${accountName}.`);
  }
}

function renderInvoicesList(container, invoices, accounts) {
  if (!container) return;
  if (!Array.isArray(invoices) || invoices.length === 0) {
    container.innerHTML = '';
    return;
  }

  const mName = MONTHS[State.currentMonth - 1] || '';
  const todayStr = new Date().toISOString().split('T')[0];

  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);
  const paidInvoices = invoices.filter(i => i.is_paid);
  const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);
  const openInvoices = invoices.filter(i => !i.is_paid);
  const openAmount = openInvoices.reduce((sum, i) => sum + (i.amount || 0) + (i.penalty_amount || 0) - (i.discount_amount || 0), 0);

  container.innerHTML = `
    <div class="invoices-section-wrap" style="margin-top: 20px; margin-bottom: 24px;">
      <!-- Section Title & Executive KPI Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
        <div style="font-size: 15.5px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">💳</span> Faturas de Cartão de Crédito
          <span style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); background: var(--bg-surface); padding: 3px 9px; border-radius: 12px; border: 1px solid var(--border);">
            ${invoices.length} ${invoices.length === 1 ? 'cartão' : 'cartões'} • ${mName}/${State.currentYear}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface); border: 1px solid var(--border); padding: 5px 12px; border-radius: 8px; font-size: 11.5px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
            <span style="color: var(--text-muted);">Total Geral:</span>
            <strong style="color: var(--text-primary); font-weight: 800;">${fmt.currency(totalAmount)}</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 5px 12px; border-radius: 8px; font-size: 11.5px;">
            <span style="color: #10b981; font-weight: 700;">✓ Pago (${paidInvoices.length}):</span>
            <strong style="color: #10b981; font-weight: 800;">${fmt.currency(paidAmount)}</strong>
          </div>
          ${openInvoices.length > 0 ? `
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 5px 12px; border-radius: 8px; font-size: 11.5px;">
            <span style="color: #f59e0b; font-weight: 700;">⏳ Aberto (${openInvoices.length}):</span>
            <strong style="color: #f87171; font-weight: 800;">${fmt.currency(openAmount)}</strong>
          </div>` : ''}
        </div>
      </div>

      <!-- Invoices Responsive Grid -->
      <div class="invoices-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 14px;">
        ${invoices.map(inv => {
          const b = BANKS[inv.bank] || BANKS.outro;
          const netAmount = inv.amount + (inv.penalty_amount || 0) - (inv.discount_amount || 0);
          const userBadge = inv.user_name ? `<span class="profile-badge" style="background:${inv.user_avatar_color || '#10b981'}18;color:${inv.user_avatar_color || '#10b981'};border:1px solid ${inv.user_avatar_color || '#10b981'}33;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700">${inv.user_name}</span>` : '';
          const cardAccountId = inv.card_account_id || inv.card_id || inv.account_id;
          const isSelected = (State.highlightCardId && State.highlightCardId === cardAccountId) || (State.highlightInvoiceId && State.highlightInvoiceId === inv.id);
          const isOverdue = !inv.is_paid && inv.due_date && inv.due_date < todayStr;
          
          return `
            <div class="invoice-card-item ${isSelected ? 'invoice-card-selected' : ''}" 
                 data-card-id="${cardAccountId || ''}" 
                 data-invoice-id="${inv.id || ''}" 
                 data-bank-color="${b.color}" 
                 data-card-name="${inv.card_name}"
                 style="--card-bank-color: ${b.color};">
              
              <!-- Colored Top Indicator Line -->
              <div class="invoice-card-top-bar" style="background: linear-gradient(90deg, ${b.color}, ${b.color}88);"></div>

              <div class="invoice-card-header">
                <div class="invoice-bank-logo-wrap" style="background: ${b.color}18; border: 1px solid ${b.color}44;">
                  ${bankLogo(inv.bank, 36)}
                </div>
                <div class="invoice-card-info">
                  <div class="invoice-card-title">
                    <span class="invoice-card-name">${inv.card_name.toUpperCase()}</span>
                    <span class="invoice-ref-tag">Ref: ${String(inv.month).padStart(2,'0')}/${inv.year}</span>
                    ${userBadge}
                  </div>
                  <div class="invoice-card-meta">
                    <span class="meta-chip">📅 Vence dia <strong>${inv.due_day}</strong></span>
                    <span class="meta-chip">🔒 Fecha dia <strong>${inv.closing_day}</strong></span>
                  </div>
                </div>
              </div>
              
              <div class="invoice-card-middle">
                <div class="invoice-card-amount-col">
                  <div class="invoice-amount-label">Valor Total da Fatura</div>
                  <div class="invoice-card-amount">
                    ${fmt.currency(netAmount)}
                  </div>
                </div>
                
                <div class="invoice-card-status-wrap">
                  ${inv.is_renegotiated ? `
                    <span class="invoice-status-pill status-reneg">
                      <span>🤝</span> Acordo / Parcelada
                    </span>
                  ` : inv.is_paid ? `
                    <span class="invoice-status-pill status-paid" title="${inv.payment_account_name ? 'Conta: ' + inv.payment_account_name : ''}">
                      <span>✓</span> Quitada ${inv.payment_date ? 'em ' + fmt.date(inv.payment_date) : ''}
                    </span>
                  ` : `
                    <span class="invoice-status-pill status-pending ${isOverdue ? 'status-overdue' : ''}">
                      <span>${isOverdue ? '⚠️' : '⏳'}</span> ${isOverdue ? 'Em Atraso' : 'Aberta'} • Vence ${fmt.date(inv.due_date)}
                    </span>
                  `}
                </div>
              </div>

              <div class="invoice-card-footer">
                <button type="button" class="btn invoice-highlight-btn ${isSelected ? 'btn-highlight-active' : ''}">
                  ${isSelected ? '✨ Parcelas Destacadas' : '🔍 Ver Parcelas desta Fatura'}
                </button>

                <div class="invoice-card-actions">
                  ${!inv.is_paid ? `
                    <button class="btn btn-sm renegotiate-invoice-btn" data-id="${inv.id}" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 700; border-radius: 8px; padding: 6px 12px;">
                      🤝 Acordo
                    </button>
                    <button class="btn btn-sm btn-primary pay-invoice-btn" data-id="${inv.id}" style="background:${b.color};border-color:${b.color}; color:#fff; font-weight: 700; border-radius: 8px; padding: 6px 14px; box-shadow: 0 2px 8px ${b.color}44;">
                      💳 Pagar Fatura
                    </button>
                  ` : `
                    <button class="btn btn-sm btn-secondary reopen-invoice-btn" data-id="${inv.id}" title="Reabrir fatura e restaurar lançamentos para edição" style="font-size: 11.5px; border-radius: 8px; padding: 6px 12px;">
                      ${inv.is_renegotiated ? '↩️ Desfazer Acordo' : '↩️ Desfazer Pagamento'}
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Bind invoice card click to toggle highlight on its installments
  container.querySelectorAll('.invoice-card-item').forEach(cardEl => {
    cardEl.onclick = (e) => {
      if (e.target.closest('.pay-invoice-btn, .renegotiate-invoice-btn, .reopen-invoice-btn, .invoice-highlight-btn')) {
        return;
      }
      const cardId = parseInt(cardEl.dataset.cardId);
      const invoiceId = parseInt(cardEl.dataset.invoiceId);
      const cardColor = cardEl.dataset.bankColor;
      const cardName = cardEl.dataset.cardName;
      toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId);
    };
  });

  container.querySelectorAll('.invoice-highlight-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cardEl = btn.closest('.invoice-card-item');
      if (!cardEl) return;
      const cardId = parseInt(cardEl.dataset.cardId);
      const invoiceId = parseInt(cardEl.dataset.invoiceId);
      const cardColor = cardEl.dataset.bankColor;
      const cardName = cardEl.dataset.cardName;
      toggleInvoiceHighlight(cardId, cardColor, cardName, invoiceId);
    };
  });

  container.querySelectorAll('.pay-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) openPayInvoiceModal(inv, accounts);
    };
  });

  container.querySelectorAll('.renegotiate-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) openRenegotiateInvoiceModal(inv, accounts);
    };
  });

  container.querySelectorAll('.reopen-invoice-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const invId = parseInt(btn.dataset.id);
      const inv = invoices.find(i => i.id === invId);
      if (inv) confirmReopenInvoice(inv);
    };
  });
}
