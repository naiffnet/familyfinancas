/* === dashboard-main-1b.js (parte 2/2 de dashboard-main-1.js) ===
 * Componentes Modulares e Widgets do Dashboard
 */

/**
 * Renderiza a Barra Superior de Filtros em Linha (Toda a Família / Membros / Tipo de Conta)
 */
function renderDashboardTopFilterBar(members, activeMemberFilter = 'all', activeTypeFilter = 'all') {
  return `
    <div class="dash-top-filter-bar">
      <div class="dash-filter-chips-group">
        <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; margin-right: 4px;">
          <span>👥</span> Filtrar por Membro:
        </span>
        <button class="dash-filter-chip ${activeMemberFilter === 'all' ? 'active' : ''}" data-member-filter="all">
          <span>🏠</span> Toda a Família
        </button>
        ${members.map(m => `
          <button class="dash-filter-chip ${String(activeMemberFilter) === String(m.id) ? 'active' : ''}" data-member-filter="${m.id}">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${m.color}; flex-shrink: 0;"></span>
            <span>${m.name}</span>
          </button>
        `).join('')}
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Exibir:</span>
        <button class="dash-filter-chip ${activeTypeFilter === 'all' ? 'active' : ''}" data-type-filter="all" style="padding: 4px 10px; font-size: 11px;">Tudo</button>
        <button class="dash-filter-chip ${activeTypeFilter === 'credit' ? 'active' : ''}" data-type-filter="credit" style="padding: 4px 10px; font-size: 11px;">💳 Cartões</button>
        <button class="dash-filter-chip ${activeTypeFilter === 'debit' ? 'active' : ''}" data-type-filter="debit" style="padding: 4px 10px; font-size: 11px;">🏦 Contas</button>
      </div>
    </div>
  `;
}

/**
 * Renderiza a Hero Section com KPIs Consolidados e Barra de Progresso Integrada
 */
function renderDashboardHeroKpis(summary, recurringPct, activeMemberName = null) {
  const pendingCount = (summary.totalRecurring || 0) - (summary.paidRecurring || 0);
  const forecastedBalance = (summary.income || 0) - (summary.expense || 0) - (summary.pending || 0);

  return `
    <div class="dash-hero-section" style="margin-bottom: 16px;">
      ${activeMemberName ? `
        <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 6px 14px; border-radius: var(--radius-sm); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
          <span>👤 Exibindo índices e lançamentos exclusivos de: <strong>${activeMemberName}</strong></span>
          <span style="font-size: 11px; color: var(--text-muted); cursor: pointer;" onclick="State.dashboardCardMemberFilter='all'; renderDashboard();">✕ Limpar Filtro</span>
        </div>` : ''}

      <div class="kpi-grid">
        <div class="kpi-card kpi-income">
          <div class="kpi-label">Receitas</div>
          <div class="kpi-value">${fmt.currency(summary.income)}</div>
          <div class="kpi-sub">recebidas no mês</div>
          <div class="kpi-icon">💹</div>
        </div>
        <div class="kpi-card kpi-expense">
          <div class="kpi-label">Despesas</div>
          <div class="kpi-value">${fmt.currency(summary.expense)}</div>
          <div class="kpi-sub">pagas no mês</div>
          <div class="kpi-icon">💸</div>
        </div>
        <div class="kpi-card kpi-balance">
          <div class="kpi-label">Saldo do mês</div>
          <div class="kpi-value" style="color:${summary.balance >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(summary.balance)}</div>
          <div class="kpi-sub">receitas − despesas</div>
          <div class="kpi-icon">⚖️</div>
        </div>
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">À Pagar</div>
          <div class="kpi-value">${fmt.currency(summary.pending)}</div>
          <div class="kpi-sub">${pendingCount} item(s) pendente(s)</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Barra de Progresso Integrada e Previsão -->
      <div class="card" style="margin-top: 10px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 240px;">
          <span style="font-size: 16px;">🎯</span>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
              <span>Progresso de Contas: <strong>${summary.paidRecurring} de ${summary.totalRecurring} pagas</strong></span>
              <span style="color: ${recurringPct >= 100 ? 'var(--accent-light)' : 'var(--text-secondary)'}; font-weight: 700;">${recurringPct}%</span>
            </div>
            <div class="progress-bar" style="height: 7px; margin: 0;">
              <div class="progress-fill ${recurringPct >= 100 ? 'progress-ok' : recurringPct >= 60 ? 'progress-warn' : 'progress-ok'}" style="width: ${recurringPct}%"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
          <span>Previsão de Fechamento:</span>
          <strong style="color: ${forecastedBalance >= 0 ? 'var(--accent-light)' : '#f87171'}; font-size: 12.5px;">
            ${fmt.currency(forecastedBalance)}
          </strong>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Hub de Alertas em Formato de Action Pills Horizontais Compactas
 */
function renderDashboardActionPills(summary, potentialDuplicates, today) {
  const incomeAlerts = (summary.alertItems || []).filter(a => a.type === 'income');
  const expenseAlerts = (summary.alertItems || []).filter(a => a.type !== 'income');
  const overdueCount = summary.overduePreviousItems ? summary.overduePreviousItems.length : 0;
  const overdueTotal = summary.overduePreviousItems ? summary.overduePreviousItems.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0) : 0;
  const dupCount = potentialDuplicates ? potentialDuplicates.length : 0;

  if (dupCount === 0 && incomeAlerts.length === 0 && expenseAlerts.length === 0 && overdueCount === 0) {
    return '<div id="dash-alerts-expanded-container" style="display: none;"></div>';
  }

  return `
    <div class="dash-action-pills-bar">
      ${dupCount > 0 ? `
        <div class="dash-action-pill dash-action-pill-dedup" id="pill-dedup" title="Clique para conciliar lançamentos duplicados">
          <span>🛡️</span>
          <span>${dupCount} duplicidade${dupCount > 1 ? 's' : ''}</span>
          <span style="opacity: 0.8; font-size: 10px;">➔</span>
        </div>` : ''}

      ${overdueCount > 0 ? `
        <div class="dash-action-pill dash-action-pill-overdue" id="pill-overdue" title="Clique para ver pendências de meses anteriores">
          <span>⚠️</span>
          <span>${overdueCount} atrasada${overdueCount > 1 ? 's' : ''} (${fmt.currency(overdueTotal)})</span>
          <span class="pill-arrow" id="pill-overdue-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      ${expenseAlerts.length > 0 ? `
        <div class="dash-action-pill dash-action-pill-expense" id="pill-expense-alerts" title="Próximos vencimentos nos próximos ${summary.alertDays} dias">
          <span>🚨</span>
          <span>${expenseAlerts.length} vencimento${expenseAlerts.length > 1 ? 's' : ''}</span>
          <span class="pill-arrow" id="pill-expense-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      ${incomeAlerts.length > 0 ? `
        <div class="dash-action-pill dash-action-pill-income" id="pill-income-alerts" title="Recebimentos nos próximos ${summary.alertDays} dias">
          <span>💰</span>
          <span>${incomeAlerts.length} recebimento${incomeAlerts.length > 1 ? 's' : ''}</span>
          <span class="pill-arrow" id="pill-income-arrow" style="opacity: 0.8; font-size: 10px;">▾</span>
        </div>` : ''}

      <div class="dash-action-pill dash-action-pill-scanner" id="pill-scan-nfce" title="Escanear Cupom Fiscal por QR Code" style="background: rgba(16, 185, 129, 0.12); color: var(--accent-light); border: 1px solid var(--accent); cursor: pointer; font-weight: 600;">
        <span>📷</span>
        <span>Ler Nota Fiscal</span>
      </div>
    </div>

    <!-- Dropdown / Container expansível de detalhes dos alertas se aberto -->
    <div id="dash-alerts-expanded-container" style="display: none; margin-bottom: 16px;"></div>
  `;
}

/**
 * Renderiza a Grade de Cartões e Contas (já filtrados)
 */
function renderDashboardCardsGrid(summary, showTitle = true) {
  const creditAccounts = summary.accounts.filter(a => a.type === 'credit');
  const debitAccounts  = summary.accounts.filter(a => a.type !== 'credit' && a.type !== 'investment');
  const hasAny = creditAccounts.length > 0 || debitAccounts.length > 0;

  return `
    <div style="margin-bottom: 20px;">
      ${showTitle ? `
        <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>🏦</span> Previsibilidade de Contas e Cartões
        </div>` : ''}

      ${hasAny ? `
        <div class="cards-widget-grid" id="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, summary.cardSpending[acc.id] || 0, (summary.cardMonthlyInvoices && summary.cardMonthlyInvoices[acc.id]) !== undefined ? summary.cardMonthlyInvoices[acc.id] : null)).join('')}
          ${debitAccounts.map(acc => renderDebitAccountWidget(acc)).join('')}
        </div>
      ` : `
        <div class="card" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
          Nenhuma conta ou cartão encontrado para os filtros selecionados.
        </div>
      `}
    </div>
  `;
}

/**
 * Renderiza o Painel Operacional Unificado em 3 Colunas (⭐ Prioritários | ⏳ A Pagar | ✅ Pagas)
 */
function renderDashboardKanbanColumns(summary, paidBills, unpaidBills) {
  const totalPaidAmount = paidBills.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalUnpaidAmount = unpaidBills.reduce((acc, t) => acc + (t.amount || 0), 0);
  const priorityItems = summary.priorityItems || [];

  return `
    <div class="dash-kanban-grid">
      
      <!-- COLUNA 1: ⭐ PRIORITÁRIOS -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>⭐</span> Prioritários
            <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 10px;">${priorityItems.length}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">Essenciais</div>
        </div>
        <div class="dash-kanban-list">
          ${priorityItems.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Nenhum item marcado como prioritário.<br><small>Marque com ⭐ no Planejamento.</small></div>`
            : priorityItems.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable ${item.is_paid ? 'priority-paid' : 'priority-pending'}" data-rec-id="${item.recurring_item_id || item.id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.rec_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.rec_name || item.description}
                      ${userBadge}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || '—'} • dia ${item.due_day || '?'}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:${item.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${item.type === 'income' ? '+' : '-'}${fmt.currency(item.amount)}</div>
                    <span class="transaction-status ${item.is_paid ? 'status-paid' : 'status-pending'}" style="font-size: 9px; padding: 1px 6px;">${item.is_paid ? '✓ Pago' : '⏳ Pendente'}</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

      <!-- COLUNA 2: ⏳ A PAGAR (PENDENTES) -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 6px;">
            <span>⏳</span> A Pagar
            <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 10px;">${unpaidBills.length}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #f87171;">${fmt.currency(totalUnpaidAmount)}</div>
        </div>
        <div class="dash-kanban-list">
          ${unpaidBills.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Tudo quitado! Nenhuma conta pendente.</div>`
            : unpaidBills.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable priority-pending" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.description}
                      ${userBadge}
                      ${(item.pix_code || (item.notes && item.notes.includes('000201'))) ? `<button type="button" class="btn-dash-pix" data-id="${item.id}" title="Pagar com PIX (Abrir QR Code)" style="background:rgba(6,182,212,0.18);color:#38bdf8;border:1px solid rgba(6,182,212,0.4);font-size:9px;padding:1px 6px;border-radius:4px;cursor:pointer;font-weight:800;display:inline-flex;align-items:center;gap:2px">⚡ PIX</button>` : ''}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:#f87171">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-pending" style="font-size: 9px; padding: 1px 6px;">⏳ Pendente</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

      <!-- COLUNA 3: ✅ CONTAS PAGAS -->
      <div class="dash-kanban-col">
        <div class="dash-kanban-header">
          <div style="font-size: 13px; font-weight: 700; color: var(--accent-light); display: flex; align-items: center; gap: 6px;">
            <span>✅</span> Contas Pagas
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-light); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 10px;">${paidBills.length}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: var(--accent-light);">${fmt.currency(totalPaidAmount)}</div>
        </div>
        <div class="dash-kanban-list">
          ${paidBills.length === 0
            ? `<div class="no-data" style="font-size: 12px; padding: 20px 10px;">Nenhuma conta paga registrada.</div>`
            : paidBills.map(item => {
              const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:600;">${item.user_name}</span>` : '';
              return `
                <div class="priority-item priority-item-clickable priority-paid" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '💸'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:4px">
                      ${item.description}
                      ${userBadge}
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:13px;color:var(--accent-light)">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-paid" style="font-size: 9px; padding: 1px 6px;">✓ Pago</span>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

    </div>
  `;
}

/**
 * Renderiza um Card de Cartão de Crédito
 */
function renderCreditCardWidget(acc, spent, monthInvoice) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const limit     = acc.credit_limit || 0;
  const available = limit - spent;
  const isExceeded = limit > 0 && spent > limit;
  const pctReal   = limit > 0 ? (spent / limit) * 100 : 0;
  const ringColor = isExceeded ? '#ef4444' : pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#10b981';
  const availableColor = isExceeded ? '#f87171' : ringColor;
  const userBadge = acc.user_name
    ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;display:inline-block">${acc.user_name}</span>`
    : '';

  const invoiceAmount = monthInvoice !== undefined && monthInvoice !== null ? monthInvoice : null;

  return `
    <div class="bank-card-widget bank-card-credit ${isExceeded ? 'card-limit-exceeded' : ''}" data-card-id="${acc.id}" data-bank-color="${b.color}" data-card-name="${acc.name}" title="Clique para ver fatura e destacar parcelas no Planejamento" style="cursor:pointer;${isExceeded ? 'border: 1px solid rgba(239, 68, 68, 0.45); box-shadow: 0 0 16px rgba(239, 68, 68, 0.15);' : ''}">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 40)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            Cartão de Crédito ${userBadge}
            ${isExceeded ? `<span class="badge badge-danger" style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);font-size:9px;padding:1px 5px;border-radius:4px;font-weight:800">⚠️ LIMITE EXCEDIDO</span>` : ''}
          </div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>

      <div class="bank-card-body">
        <div class="bank-card-donut" style="position:relative">
          ${buildCreditDonut(spent, limit, 108)}
        </div>

        <div class="bank-card-values" style="gap:0">
          <div style="margin-bottom:8px">
            <div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Limite total</div>
            <div style="font-size:17px;font-weight:900;color:var(--text-primary);letter-spacing:-0.02em">${fmt.currency(limit)}</div>
          </div>

          ${invoiceAmount !== null ? `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
            <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">Fatura do Mês</span>
            <span style="font-size:13px;font-weight:800;color:#f87171">${fmt.currency(invoiceAmount)}</span>
          </div>` : ''}

          <div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${isExceeded || pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#f97316'};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Comprometido Total</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${isExceeded || pctReal > 80 ? '#f87171' : pctReal > 60 ? '#fbbf24' : '#fb923c'}">${fmt.currency(spent)}</div>
          </div>

          <div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${availableColor};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">${isExceeded ? 'Excedido / Negativo' : 'Disponível'}</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${availableColor}">${fmt.currency(available)}</div>
          </div>

          ${isExceeded ? `
          <div style="margin-top:6px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px">
            <span>⚠️</span> Estourado em ${fmt.currency(Math.abs(available))}
          </div>` : ''}

          ${acc.closing_day ? `
          <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px">
              <span style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em">Fechamento</span>
              <span style="font-size:12px; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; gap:4px">
                <span style="color:#0ea5e9; font-size:11px">🔒</span> Dia ${acc.closing_day}
              </span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px">
              <span style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em">Vencimento</span>
              <span style="font-size:12px; font-weight:700; color:#f87171; display:flex; align-items:center; gap:4px">
                <span style="font-size:11px">📅</span> Dia ${acc.due_day}
              </span>
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

/**
 * Renderiza um Card de Conta Débito ou Voucher
 */
function renderDebitAccountWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';
  const isVoucher = acc.type === 'voucher';
  const typeLabel = isVoucher ? (BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício') : (ACCOUNT_TYPES[acc.type] || 'Conta');

  return `
    <div class="bank-card-widget bank-card-debit ${isVoucher ? 'bank-card-voucher' : ''}" 
         data-account-id="${acc.id}" 
         data-bank-color="${b.color}" 
         data-account-name="${acc.name}"
         style="cursor:pointer;" 
         title="Clique para abrir e destacar os lançamentos desta conta no Planejamento">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${typeLabel} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${isVoucher ? 'Rendimentos / Recargas do mês' : 'Rendimentos do mês'}</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${isVoucher ? `
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${acc.card_last_digits ? `<span style="font-weight:700">•••• ${acc.card_last_digits}</span>` : ''}
            ${acc.benefit_monthly_credit ? `<span>• Recarga: <strong>${fmt.currency(acc.benefit_monthly_credit)}</strong> (Dia ${acc.benefit_credit_day || 1})</span>` : ''}
          </div>
        ` : (acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : '')}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:${b.color};font-weight:700;display:flex;align-items:center;gap:4px">
        <span>🔍 Ver lançamentos</span>
        <span style="font-size:10px">➔</span>
      </div>
    </div>`;
}

/**
 * Renderiza um Card de Conta Débito Estático (para aba Geral)
 */
function renderDebitAccountStaticWidget(acc) {
  const b = BANKS[acc.bank] || BANKS.outro;
  const balance = acc.balance || 0;
  const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-top:2px;display:inline-block">${acc.user_name}</span>` : '';
  const isVoucher = acc.type === 'voucher';
  const typeLabel = isVoucher ? (BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício') : (ACCOUNT_TYPES[acc.type] || 'Conta');

  return `
    <div class="bank-card-widget bank-card-debit ${isVoucher ? 'bank-card-voucher' : ''}" 
         data-account-id="${acc.id}" 
         data-bank-color="${b.color}" 
         data-account-name="${acc.name}"
         style="cursor:pointer;" 
         title="Clique para abrir e destacar os lançamentos desta conta no Planejamento">
      <div class="bank-card-header">
        ${bankLogo(acc.bank, 44)}
        <div style="flex:1;min-width:0">
          <div class="bank-card-name">${acc.name}</div>
          <div class="bank-card-type">${typeLabel} ${userBadge}</div>
        </div>
        <div class="bank-card-tag" style="background:${b.color}22;color:${b.color}">${b.name}</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${isVoucher ? 'Saldo Disponível no Cartão' : 'Saldo Atual (Lançamentos Reais)'}</div>
        <div style="font-size:28px;font-weight:800;color:${balance >= 0 ? 'var(--accent-light)' : '#f87171'};letter-spacing:-0.02em">${fmt.currency(balance)}</div>
        ${isVoucher ? `
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${acc.card_last_digits ? `<span style="font-weight:700">•••• ${acc.card_last_digits}</span>` : ''}
            ${acc.benefit_monthly_credit ? `<span>• Recarga: <strong>${fmt.currency(acc.benefit_monthly_credit)}</strong> (Dia ${acc.benefit_credit_day || 1})</span>` : ''}
          </div>
        ` : (acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : '')}
      </div>
      <div style="margin-top:12px;height:6px;background:var(--bg-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;border-radius:3px;background:${b.color};width:${balance >= 0 ? '70' : '0'}%;transition:width 0.8s ease"></div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:${b.color};font-weight:700;display:flex;align-items:center;gap:4px">
        <span>🔍 Ver lançamentos</span>
        <span style="font-size:10px">➔</span>
      </div>
    </div>`;
}

/**
 * Renderiza um Item de Objetivo / Cofrinho
 */
function renderDashboardGoalItem(goal) {
  const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  return `
    <div class="dashboard-goal-item">
      <div style="font-size:24px;width:40px;height:40px;border-radius:10px;background:${goal.color}22;color:${goal.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${goal.icon || '🎯'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${goal.name}</span>
          <span style="font-size:12px;font-weight:700;color:${goal.color}">${pct}%</span>
        </div>
        <div class="progress-bar" style="height:6px;background:rgba(255,255,255,0.05);margin-bottom:6px">
          <div class="progress-fill" style="width:${pct}%;background:${goal.color}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted)">
          <span>Salvo: <b>${fmt.currency(goal.current_amount)}</b> de ${fmt.currency(goal.target_amount)}</span>
          <span>Falta: <b>${fmt.currency(remaining)}</b></span>
        </div>
      </div>
    </div>`;
}

/**
 * Configura o Gráfico Interativo de Categorias
 */
function setupCategoryInteractiveChart(wrapperElementId, chartStateKey, txs) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;

  const prefix = chartStateKey;
  const filterMetricId = `${prefix}-metric-type`;
  const filterPaymentId = `${prefix}-payment-status`;
  const filterTxTypeId = `${prefix}-tx-type`;
  const filterChartTypeId = `${prefix}-chart-type`;
  const filterCheckboxesId = `${prefix}-categories-checkboxes`;
  const chartCanvasId = `${prefix}-canvas`;
  const listContainerId = `${prefix}-list`;
  const chartContainerId = `${prefix}-chart-container`;

  wrapper.innerHTML = `
    <div class="chart-filters-container" style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Métrica</label>
          <select id="${filterMetricId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="amount" selected>💰 Valor (R$)</option>
            <option value="count">🔄 Repetições</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Pagamento</label>
          <select id="${filterPaymentId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="all" selected>👁️ Todas</option>
            <option value="paid">✅ Pagas</option>
            <option value="pending">⏳ Pendentes</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Fluxo</label>
          <select id="${filterTxTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="expense" selected>Saídas</option>
            <option value="income">Entradas</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Tipo de Gráfico</label>
          <select id="${filterChartTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="doughnut" selected>🍩 Rosca</option>
            <option value="horizontalBar">📊 Barras Lat.</option>
            <option value="polarArea">❄️ Área Polar</option>
          </select>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 8px;">
        <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; display: block; font-weight:600;">Exibir Categorias</label>
        <div id="${filterCheckboxesId}" style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 55px; overflow-y: auto; padding-right: 4px;">
          <!-- Checkboxes dinâmicos -->
        </div>
      </div>
    </div>

    <div class="interactive-chart-layout">
      <div id="${chartContainerId}" style="position: relative; width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <canvas id="${chartCanvasId}" style="max-height: 220px; max-width: 100%;"></canvas>
      </div>
      <div id="${listContainerId}" style="max-height: 220px; overflow-y: auto; padding-right: 4px;">
        <!-- Lista consolidada -->
      </div>
    </div>
  `;

  function renderCheckboxesAndDraw() {
    const txType = document.getElementById(filterTxTypeId).value;
    const uniqueCats = [];
    txs.filter(t => t.type === txType).forEach(t => {
      const name = t.category_name || 'Sem Categoria';
      if (!uniqueCats.find(c => c.name === name)) {
        uniqueCats.push({ name, icon: t.category_icon || '📋' });
      }
    });

    const cbContainer = document.getElementById(filterCheckboxesId);
    const prevChecked = cbContainer.dataset.checkedCats ? JSON.parse(cbContainer.dataset.checkedCats) : null;

    cbContainer.innerHTML = uniqueCats.map(c => {
      const isChecked = prevChecked ? prevChecked.includes(c.name) : true;
      return `
        <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer; user-select: none; background: rgba(255,255,255,0.03); padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px;">
          <input type="checkbox" class="${prefix}-cat-check" value="${c.name}" ${isChecked ? 'checked' : ''} style="margin: 0; cursor: pointer;">
          <span>${c.icon} ${c.name}</span>
        </label>
      `;
    }).join('');

    function updateChart() {
      const activeTxType = document.getElementById(filterTxTypeId).value;
      const activePaymentStatus = document.getElementById(filterPaymentId).value;
      const activeMetricType = document.getElementById(filterMetricId).value;
      const activeChartType = document.getElementById(filterChartTypeId).value;

      const checkedBoxes = Array.from(document.querySelectorAll(`.${prefix}-cat-check:checked`)).map(cb => cb.value);
      cbContainer.dataset.checkedCats = JSON.stringify(checkedBoxes);

      const filtered = txs.filter(t => {
        if (t.type !== activeTxType) return false;
        if (activePaymentStatus === 'paid' && !t.is_paid) return false;
        if (activePaymentStatus === 'pending' && t.is_paid) return false;
        const catName = t.category_name || 'Sem Categoria';
        if (!checkedBoxes.includes(catName)) return false;
        return true;
      });

      const catMap = {};
      filtered.forEach(t => {
        const name = t.category_name || 'Sem Categoria';
        const color = t.category_color || '#94a3b8';
        const icon = t.category_icon || '📋';
        if (!catMap[name]) {
          catMap[name] = { name, color, icon, amount: 0, count: 0 };
        }
        const netAmount = (t.amount || 0) + (t.is_paid ? ((t.penalty_amount || 0) - (t.discount_amount || 0)) : 0);
        catMap[name].amount += netAmount;
        catMap[name].count += 1;
      });

      const catList = Object.values(catMap).sort((a, b) => b[activeMetricType] - a[activeMetricType]);
      const labels = catList.map(c => `${c.icon} ${c.name}`);
      const dataValues = catList.map(c => activeMetricType === 'amount' ? c.amount : c.count);
      const colors = catList.map(c => c.color);

      const listEl = document.getElementById(listContainerId);
      const totalSum = catList.reduce((acc, c) => acc + (activeMetricType === 'amount' ? c.amount : c.count), 0);

      listEl.innerHTML = catList.length === 0
        ? `<div class="no-data" style="font-size: 12px;">Nenhum lançamento no filtro.</div>`
        : catList.map(c => {
          const val = activeMetricType === 'amount' ? c.amount : c.count;
          const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : '0';
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${c.color}; flex-shrink: 0;"></div>
                <span style="font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.icon} ${c.name}</span>
              </div>
              <div style="text-align: right; flex-shrink: 0;">
                <span style="font-weight: 700; color: var(--text-primary);">${activeMetricType === 'amount' ? fmt.currency(c.amount) : c.count + ' un.'}</span>
                <span style="color: var(--text-muted); font-size: 10px; margin-left: 4px;">(${pct}%)</span>
              </div>
            </div>
          `;
        }).join('');

      if (State.charts[chartStateKey]) {
        State.charts[chartStateKey].destroy();
        delete State.charts[chartStateKey];
      }

      const canvas = document.getElementById(chartCanvasId);
      if (!canvas) return;

      let cType = activeChartType;
      let chartOpts = chartOptions(cType);

      if (activeChartType === 'horizontalBar') {
        cType = 'bar';
        chartOpts = {
          ...chartOptions('bar'),
          indexAxis: 'y',
          plugins: { ...chartOptions('bar').plugins, legend: { display: false } }
        };
      }

      if (activeMetricType === 'count' && chartOpts.scales && chartOpts.scales.y) {
        chartOpts.scales.y.ticks.callback = (v) => `${v} un`;
      }
      if (activeMetricType === 'count' && activeChartType === 'horizontalBar' && chartOpts.scales && chartOpts.scales.x) {
        chartOpts.scales.x.ticks.callback = (v) => `${v} un`;
      }

      State.charts[chartStateKey] = new Chart(canvas, {
        type: cType,
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors,
            borderWidth: cType === 'doughnut' ? 2 : 1,
            borderColor: cType === 'doughnut' ? 'var(--bg-card)' : colors,
            borderRadius: cType === 'bar' ? 4 : 0
          }]
        },
        options: chartOpts
      });
    }

    document.querySelectorAll(`.${prefix}-cat-check`).forEach(cb => {
      cb.onchange = updateChart;
    });

    updateChart();
  }

  document.getElementById(filterTxTypeId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterPaymentId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };
  document.getElementById(filterMetricId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };
  document.getElementById(filterChartTypeId).onchange = () => {
    const cb = document.querySelector(`.${prefix}-cat-check`);
    if (cb) cb.dispatchEvent(new Event('change'));
  };

  renderCheckboxesAndDraw();
}

async function renderPredictiveForecastSection(container) {
  if (!container) return;
  try {
    const forecast = await window.api.reports.getPredictiveCashflow({
      userId: State.user.id,
      days: 30
    });

    if (!forecast || !forecast.timeline || forecast.timeline.length === 0) return;

    container.innerHTML = `
      <div style="padding: 18px 20px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🔮</span>
            <div>
              <div style="font-weight: 800; font-size: 15px; color: var(--text-primary);">
                Projeção Preditiva de Saldo Futuro (30 Dias)
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                Estimativa diária combinando saldo atual, receitas agendadas, contas fixas e faturas de cartão
              </div>
            </div>
          </div>

          <!-- TERMÔMETRO DE RISCO -->
          ${forecast.hasNegativeRisk ? `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 12px; font-weight: 700;">
              <span>⚠️ Risco de Saldo Negativo em ${fmt.date(forecast.firstNegativeDate)}</span>
              <span class="badge badge-danger" style="font-size: 10px; padding: 2px 6px;">Mín: ${fmt.currency(forecast.minProjectedBalance)}</span>
            </div>
          ` : `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; font-size: 12px; font-weight: 700;">
              <span>🟢 Saldo Positivo e Seguro</span>
              <span class="badge badge-green" style="font-size: 10px; padding: 2px 6px;">Mín: ${fmt.currency(forecast.minProjectedBalance)}</span>
            </div>
          `}
        </div>

        <!-- TIMELINE COMPACTA DE PROJEÇÃO -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-top: 10px;">
          ${forecast.timeline.slice(0, 15).map(item => `
            <div style="flex: 0 0 85px; padding: 8px 6px; border-radius: 6px; background: ${item.isNegative ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${item.isNegative ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)'}; text-align: center;">
              <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">${item.dayOfWeek}</div>
              <div style="font-size: 11px; font-weight: 700; color: var(--text-primary); margin: 2px 0;">${item.date.split('-')[2]}/${item.date.split('-')[1]}</div>
              <div style="font-size: 11px; font-weight: 800; color: ${item.isNegative ? '#f87171' : '#34d399'};">
                ${fmt.currency(item.projectedBalance)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    console.warn('Erro ao renderizar projeção preditiva:', e);
  }
}

async function renderSubscriptionRadarSection(container) {
  if (!container) return;
  try {
    const radar = await window.api.recurring.getSubscriptionRadar(State.user.id);
    if (!radar || !radar.subscriptions || radar.subscriptions.length === 0) return;

    container.innerHTML = `
      <div style="padding: 18px 20px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">📱</span>
            <div>
              <div style="font-weight: 800; font-size: 15px; color: var(--text-primary);">
                Radar de Assinaturas & Recorrências
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                Monitoramento de custos contínuos anualizados e detecção de reajustes
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="padding: 4px 12px; border-radius: 8px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.25); font-size: 12px;">
              <span style="color: var(--text-muted);">Total Mensal:</span> <strong style="color: #c084fc;">${fmt.currency(radar.totalMonthly)}</strong>
            </div>
            <div style="padding: 4px 12px; border-radius: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); font-size: 12px;">
              <span style="color: var(--text-muted);">Custo Anualizado:</span> <strong style="color: #fbbf24;">${fmt.currency(radar.totalAnnual)}/ano</strong>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
          ${radar.subscriptions.map(sub => `
            <div style="padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">${sub.category_icon || '📱'}</span>
                <div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary);">${sub.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Dia ${sub.due_day || '—'} • ${fmt.currency(sub.annual_cost)}/ano</div>
                  ${sub.price_change_alert ? `<div style="font-size: 10px; color: #f87171; font-weight: 600; margin-top: 2px;">⚠️ ${sub.price_change_alert}</div>` : ''}
                </div>
              </div>
              <div style="font-weight: 800; font-size: 13px; color: var(--text-primary);">
                ${fmt.currency(sub.monthly_amount)}/mês
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    console.warn('Erro ao renderizar radar de assinaturas:', e);
  }
}

