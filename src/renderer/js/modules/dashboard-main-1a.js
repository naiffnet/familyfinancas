/* === dashboard-main-1a.js (parte 1/2 de dashboard-main-1.js) ===
 * Layout, KPIs e Orquestração dos 3 Modos do Dashboard
 */

async function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  
  if (State.user.profile_type === 5) {
    await renderCaculaDashboard(page);
    return;
  }

  const currentMode = State.dashboardLayoutMode || 'executive';
  const modeLabels = {
    executive: '🌟 Executivo',
    tabbed: '📑 Sub-Abas',
    cockpit: '🎛️ Cockpit'
  };
  
  // Header principal com Seletor Rápido de Layout
  let headerHtml = `
    <div class="page-header">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <h2 class="page-title">Dashboard</h2>
          ${State.familyName ? `<span class="badge" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 50px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em;">🏠 ${State.familyName}</span>` : ''}
          <button class="dash-layout-switcher" id="dash-quick-layout-btn" title="Alterar modo de organização do Dashboard">
            <span>🎛️</span>
            <span>Layout: <strong>${modeLabels[currentMode] || 'Executivo'}</strong></span>
            <span style="opacity:0.6;font-size:10px;">▾</span>
          </button>
        </div>
        <p class="page-subtitle" id="dash-subtitle">Carregando...</p>
      </div>
      <div id="dash-period-wrapper"></div>
    </div>
    
    <div class="report-tabs" id="dashboard-tabs" style="margin-bottom: 16px;">
      <button class="report-tab ${State.activeDashTab === 'mensal' ? 'active' : ''}" data-tab="mensal">📅 Visão Mensal</button>
      <button class="report-tab ${State.activeDashTab === 'geral' ? 'active' : ''}" data-tab="geral">🌐 Visão Geral</button>
    </div>
    
    <div id="dashboard-tab-content" class="dashboard-view-fade"></div>
  `;
  
  page.innerHTML = headerHtml;

  // Bind Quick Layout Switcher Button
  const layoutBtn = document.getElementById('dash-quick-layout-btn');
  if (layoutBtn) {
    layoutBtn.onclick = () => {
      const nextMode = currentMode === 'executive' ? 'tabbed' : currentMode === 'tabbed' ? 'cockpit' : 'executive';
      State.dashboardLayoutMode = nextMode;
      localStorage.setItem('dashboard_layout_mode', nextMode);
      toast(`Modo do Dashboard alterado para: ${modeLabels[nextMode]}`);
      renderDashboard();
    };
  }
  
  // Set up tab click handlers
  const tabButtons = document.querySelectorAll('#dashboard-tabs .report-tab');
  tabButtons.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      if (State.activeDashTab !== tab) {
        State.activeDashTab = tab;
        // Destroy existing charts to prevent canvas reuse issues in Chart.js
        if (State.charts.monthly) { State.charts.monthly.destroy(); delete State.charts.monthly; }
        if (State.charts.category) { State.charts.category.destroy(); delete State.charts.category; }
        if (State.charts.patrimony) { State.charts.patrimony.destroy(); delete State.charts.patrimony; }
        renderDashboard();
      }
    };
  });

  if (State.activeDashTab === 'mensal') {
    // 📅 VISÃO MENSAL
    document.getElementById('dash-subtitle').innerText = `Visão geral — ${fmt.monthYear(State.currentMonth, State.currentYear)}`;
    
    // Append period selector
    const periodWrap = document.getElementById('dash-period-wrapper');
    periodWrap.innerHTML = '';
    periodWrap.appendChild(buildPeriodSelector(renderDashboard));

    const [summary, monthly, txs, potentialDuplicates] = await Promise.all([
      window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
      window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.sync.findDuplicates({ familyId: State.user.family_id || State.user.familyId || 1, userId: State.user.id, daysWindow: 45, minScore: 75 }).catch(() => [])
    ]);

    const today = new Date().getDate();

    // 1. Extrair membros únicos da família a partir de contas e transações
    const membersMap = new Map();
    (summary.accounts || []).forEach(a => {
      if (a.user_name && a.user_id) {
        membersMap.set(a.user_id, { id: a.user_id, name: a.user_name, color: a.user_avatar_color || '#10b981' });
      }
    });
    (txs || []).forEach(t => {
      if (t.user_name && t.user_id && !membersMap.has(t.user_id)) {
        membersMap.set(t.user_id, { id: t.user_id, name: t.user_name, color: t.user_avatar_color || '#10b981' });
      }
    });
    const members = Array.from(membersMap.values());

    // 2. Aplicar Filtro Ativo por Membro
    const activeMemberFilter = State.dashboardCardMemberFilter || 'all';
    const activeTypeFilter = State.dashboardCardTypeFilter || 'all';

    let effectiveTxs = txs || [];
    let effectiveAccounts = summary.accounts || [];
    let effectivePriority = summary.priorityItems || [];
    let effectiveAlerts = summary.alertItems || [];
    let effectiveOverdue = summary.overduePreviousItems || [];
    let effectiveDuplicates = potentialDuplicates || [];
    let activeMemberName = null;

    if (activeMemberFilter !== 'all') {
      const activeMember = members.find(m => String(m.id) === String(activeMemberFilter));
      activeMemberName = activeMember ? activeMember.name : null;

      effectiveTxs = (txs || []).filter(t => String(t.user_id) === String(activeMemberFilter));
      effectiveAccounts = (summary.accounts || []).filter(a => String(a.user_id) === String(activeMemberFilter));
      effectivePriority = (summary.priorityItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveAlerts = (summary.alertItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveOverdue = (summary.overduePreviousItems || []).filter(item => String(item.user_id) === String(activeMemberFilter));
      effectiveDuplicates = (potentialDuplicates || []).filter(d => String(d.user_id_1) === String(activeMemberFilter) || String(d.user_id_2) === String(activeMemberFilter));
    }

    // Calcular índices / KPIs com base estrita no effectiveTxs (despesas vs receitas)
    const effectivePaidExpenses = effectiveTxs.filter(t => t.type === 'expense' && (t.is_paid === 1 || t.is_paid === true));
    const effectiveUnpaidExpenses = effectiveTxs.filter(t => t.type === 'expense' && (t.is_paid === 0 || t.is_paid === false));
    const effectivePaidIncomes = effectiveTxs.filter(t => t.type === 'income' && (t.is_paid === 1 || t.is_paid === true));

    const income = effectivePaidIncomes.reduce((acc, t) => acc + (t.amount || 0), 0);
    const expense = effectivePaidExpenses.reduce((acc, t) => acc + (t.amount || 0), 0);
    const pending = effectiveUnpaidExpenses.reduce((acc, t) => acc + (t.amount || 0), 0);
    const balance = income - expense;

    const paidRecurring = effectivePaidExpenses.length;
    const totalRecurring = effectivePaidExpenses.length + effectiveUnpaidExpenses.length;
    const recurringPct = totalRecurring > 0 ? Math.round((paidRecurring / totalRecurring) * 100) : 0;

    // 3. Aplicar Filtro de Tipo de Conta
    if (activeTypeFilter === 'credit') {
      effectiveAccounts = effectiveAccounts.filter(a => a.type === 'credit');
    } else if (activeTypeFilter === 'debit') {
      effectiveAccounts = effectiveAccounts.filter(a => a.type !== 'credit');
    }

    const effectivePaidBills = effectivePaidExpenses;
    const effectiveUnpaidBills = effectiveUnpaidExpenses;

    const effectiveSummary = {
      ...summary,
      income,
      expense,
      pending,
      balance,
      paidRecurring,
      totalRecurring,
      accounts: effectiveAccounts,
      priorityItems: effectivePriority,
      alertItems: effectiveAlerts,
      overduePreviousItems: effectiveOverdue
    };

    const contentDiv = document.getElementById('dashboard-tab-content');

    // Render based on selected layout mode
    if (currentMode === 'tabbed') {
      renderTabbedLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    } else if (currentMode === 'cockpit') {
      renderCockpitLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    } else {
      // Default: Executive
      renderExecutiveLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, effectiveSummary, monthly, effectiveTxs, effectiveDuplicates, today, effectivePaidBills, effectiveUnpaidBills, recurringPct, activeMemberName);
    }

    bindDashboardEvents(contentDiv, effectiveSummary, effectiveTxs, monthly, today);

  } else {
    // 🌐 VISÃO GERAL
    await renderGeneralDashboardTab();
  }
}

/**
 * Modo 1: Executivo por Zonas (Padrão Completo)
 */
function renderExecutiveLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 2. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 3. CARDS & CONTAS -->
    ${renderDashboardCardsGrid(summary)}

    <!-- 4. PAINEL OPERACIONAL KANBAN 3 COLUNAS -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> Fluxo e Andamento das Contas do Mês
      </div>
      ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
    </div>

    <!-- 5. GRÁFICOS LADO A LADO -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
        <div class="card-title">Despesas por categoria</div>
      </div>
      <div class="chart-card">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <canvas id="chart-monthly" style="max-height:240px"></canvas>
      </div>
    </div>
  `;
}

/**
 * Modo 2: Sub-Abas Operacionais (Foco por Contexto)
 */
function renderTabbedLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  const activeSubTab = State.activeDashSubTab || 'operation';

  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 2. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 3. SUB-ABAS NAVEGAÇÃO -->
    <div class="dash-subtabs-nav" id="dash-subtabs-nav">
      <button class="dash-subtab-btn ${activeSubTab === 'operation' ? 'active' : ''}" data-subtab="operation">
        <span>📋</span> Operação & Contas (${paidBills.length + unpaidBills.length})
      </button>
      <button class="dash-subtab-btn ${activeSubTab === 'cards' ? 'active' : ''}" data-subtab="cards">
        <span>💳</span> Cartões & Bancos (${summary.accounts.length})
      </button>
      <button class="dash-subtab-btn ${activeSubTab === 'charts' ? 'active' : ''}" data-subtab="charts">
        <span>📈</span> Gráficos & Categorias
      </button>
    </div>

    <!-- 4. CONTEÚDO DA SUB-ABA ATIVA -->
    <div id="dash-subtab-content">
      ${activeSubTab === 'operation' ? `
        <div class="dashboard-view-fade">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> Painel Operacional de Contas
          </div>
          ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
        </div>
      ` : activeSubTab === 'cards' ? `
        <div class="dashboard-view-fade">
          ${renderDashboardCardsGrid(summary)}
        </div>
      ` : `
        <div class="dashboard-view-fade" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px;">
          <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
            <div class="card-title">Despesas por categoria</div>
          </div>
          <div class="chart-card">
            <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
            <canvas id="chart-monthly" style="max-height:240px"></canvas>
          </div>
        </div>
      `}
    </div>
  `;
}

/**
 * Modo 3: Cockpit Integrado (Filtros -> Carteira/Cartões -> KPIs -> Action Pills -> Kanban -> Gráficos)
 */
function renderCockpitLayout(contentDiv, members, activeMemberFilter, activeTypeFilter, summary, monthly, txs, potentialDuplicates, today, paidBills, unpaidBills, recurringPct, activeMemberName) {
  contentDiv.innerHTML = `
    <!-- 0. BARRA DE FILTROS SUPERIOR EM LINHA (EM CIMA DE TUDO) -->
    ${renderDashboardTopFilterBar(members, activeMemberFilter, activeTypeFilter)}

    <!-- 1. CARTEIRA & CARTÕES (ABAIXO DA LINHA DE FILTRO) -->
    ${renderDashboardCardsGrid(summary, true)}

    <!-- 2. HERO KPIS DINÂMICOS -->
    ${renderDashboardHeroKpis(summary, recurringPct, activeMemberName)}

    <!-- 3. ACTION PILLS HUB -->
    ${renderDashboardActionPills(summary, potentialDuplicates, today)}

    <!-- 4. PAINEL OPERACIONAL KANBAN 3 COLUNAS (LARGURA TOTAL) -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> Painel de Contas (${paidBills.length + unpaidBills.length})
      </div>
      ${renderDashboardKanbanColumns(summary, paidBills, unpaidBills)}
    </div>

    <!-- 5. GRÁFICOS EM LARGURA TOTAL -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column; min-height: 380px;">
        <div class="card-title">Despesas por categoria</div>
      </div>
      <div class="chart-card" style="min-height: 380px; display: flex; flex-direction: column;">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
          <canvas id="chart-monthly" style="max-height:280px; width: 100%;"></canvas>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza a Aba de Visão Geral (Patrimônio e Saldos Reais)
 */
async function renderGeneralDashboardTab() {
  document.getElementById('dash-subtitle').innerText = 'Consolidado — Patrimônio e Saldos Reais';
  document.getElementById('dash-period-wrapper').innerHTML = '';

  const [summaryGeral, monthly, patrimony] = await Promise.all([
    window.api.dashboard.getGeneralSummary({ userId: State.user.id }),
    window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
    window.api.reports.getPatrimony({ userId: State.user.id }),
  ]);

  const creditAccounts = summaryGeral.accounts.filter(a => a.type === 'credit');
  const debitAccounts  = summaryGeral.accounts.filter(a => a.type !== 'credit');

  const contentDiv = document.getElementById('dashboard-tab-content');
  contentDiv.innerHTML = `
    <!-- Top summary cards for General View -->
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px">
      <div class="kpi-card kpi-balance">
        <div class="kpi-label">Patrimônio Líquido Total</div>
        <div class="kpi-value" style="color:var(--accent-light)">${fmt.currency(summaryGeral.totalNet)}</div>
        <div class="kpi-sub">saldo ativo − faturas abertas</div>
        <div class="kpi-icon">🏛️</div>
      </div>
      <div class="kpi-card kpi-income">
        <div class="kpi-label">Saldo em Contas e Carteiras</div>
        <div class="kpi-value">${fmt.currency(summaryGeral.totalAssets)}</div>
        <div class="kpi-sub">${debitAccounts.length} conta(s) ativas</div>
        <div class="kpi-icon">💰</div>
      </div>
      <div class="kpi-card kpi-expense">
        <div class="kpi-label">Comprometido em Cartões</div>
        <div class="kpi-value" style="color:#f87171">${fmt.currency(summaryGeral.totalCardSpent)}</div>
        <div class="kpi-sub">${creditAccounts.length} cartão(ões)</div>
        <div class="kpi-icon">💳</div>
      </div>
      <div class="kpi-card kpi-pending">
        <div class="kpi-label">Total Guardado em Cofrinhos</div>
        <div class="kpi-value" style="color:#c084fc">${fmt.currency(summaryGeral.goals.reduce((acc, g) => acc + (g.current_amount || 0), 0))}</div>
        <div class="kpi-sub">${summaryGeral.goals.length} meta(s) ativas</div>
        <div class="kpi-icon">🎯</div>
      </div>
    </div>

    <!-- Cards and Accounts -->
    ${(creditAccounts.length > 0 || debitAccounts.length > 0) ? `
    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Todas as Contas e Cartões da Família</div>
      <div class="cards-widget-grid" id="cards-widget-grid-general">
        ${creditAccounts.map(acc => renderCreditCardWidget(acc, summaryGeral.cardSpending[acc.id] || 0, null)).join('')}
        ${debitAccounts.map(acc => renderDebitAccountStaticWidget(acc)).join('')}
      </div>
    </div>` : ''}

    <!-- Goals and Graphs -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-title">🎯 Objetivos & Cofrinhos</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
          ${summaryGeral.goals.length === 0
            ? `<div class="no-data">Nenhum cofrinho ativo cadastrado.<br><small>Defina metas em Objetivos.</small></div>`
            : summaryGeral.goals.map(goal => renderDashboardGoalItem(goal)).join('')
          }
        </div>
      </div>

      <div class="chart-card">
        <div class="card-title">Receitas × Despesas (Últimos 6 meses)</div>
        <canvas id="chart-monthly-general" style="max-height:220px"></canvas>
      </div>
    </div>

    <!-- Historical Net Worth Evolution -->
    <div class="chart-card" style="margin-bottom:16px">
      <div class="card-title">Evolução Patrimonial Mensal (Últimos 12 meses)</div>
      <canvas id="chart-patrimony" style="max-height:220px"></canvas>
    </div>
  `;

  // Render general charts
  if (document.getElementById('chart-monthly-general')) {
    State.charts.monthly = new Chart(document.getElementById('chart-monthly-general'), {
      type: 'bar',
      data: {
        labels: monthly.map(m => m.month),
        datasets: [
          { label: 'Receitas', data: monthly.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 },
          { label: 'Despesas', data: monthly.map(m => m.expense), backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6 },
        ]
      },
      options: chartOptions('bar')
    });
  }

  if (document.getElementById('chart-patrimony')) {
    const ctxPat = document.getElementById('chart-patrimony').getContext('2d');
    const gradPat = ctxPat.createLinearGradient(0, 0, 0, 200);
    gradPat.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradPat.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    State.charts.patrimony = new Chart(ctxPat, {
      type: 'line',
      data: {
        labels: patrimony.map(p => p.month),
        datasets: [{
          label: 'Patrimônio Líquido',
          data: patrimony.map(p => p.net),
          borderColor: '#3b82f6',
          backgroundColor: gradPat,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: chartOptions('line')
    });
  }

  // Bind clickable cards in General tab
  contentDiv.querySelectorAll('.bank-card-credit').forEach(cardWidget => {
    cardWidget.onclick = () => {
      const cardId = parseInt(cardWidget.dataset.cardId);
      const cardColor = cardWidget.dataset.bankColor;
      const cardName = cardWidget.dataset.cardName;
      State.highlightCardId = cardId;
      State.highlightCardColor = cardColor;
      State.highlightCardName = cardName;
      State.highlightAccountId = null;
      State.highlightAccountColor = null;
      State.highlightAccountName = null;
      State.currentRecurringTab = 'expense';
      navigate('recurring');
    };
  });

  contentDiv.querySelectorAll('.bank-card-debit').forEach(debitWidget => {
    debitWidget.onclick = () => {
      const accId = parseInt(debitWidget.dataset.accountId);
      const accColor = debitWidget.dataset.bankColor;
      const accName = debitWidget.dataset.accountName;
      State.highlightAccountId = accId;
      State.highlightAccountColor = accColor;
      State.highlightAccountName = accName;
      State.highlightCardId = null;
      State.highlightCardColor = null;
      State.highlightCardName = null;
      State.currentRecurringTab = 'income';
      navigate('recurring');
    };
  });
}

/**
 * Registra todos os Event Listeners dos componentes do Dashboard Mensal
 */
function bindDashboardEvents(contentDiv, summary, txs, monthly, today) {
  // 1. Top Filter Chips (Filtrar por Membro e por Tipo)
  contentDiv.querySelectorAll('.dash-filter-chip').forEach(chip => {
    chip.onclick = () => {
      if (chip.dataset.memberFilter !== undefined) {
        State.dashboardCardMemberFilter = chip.dataset.memberFilter;
      }
      if (chip.dataset.typeFilter !== undefined) {
        State.dashboardCardTypeFilter = chip.dataset.typeFilter;
      }
      renderDashboard();
    };
  });

  // 2. Sub-Tabs Switcher (para Layout Tabbed)
  contentDiv.querySelectorAll('.dash-subtab-btn').forEach(btn => {
    btn.onclick = () => {
      const sub = btn.dataset.subtab;
      State.activeDashSubTab = sub;
      renderDashboard();
    };
  });

  // 3. Action Pills Clicks & Details Toggles
  const expandedContainer = contentDiv.querySelector('#dash-alerts-expanded-container');

  const pillDedup = contentDiv.querySelector('#pill-dedup');
  if (pillDedup) {
    pillDedup.onclick = () => openDeduplicationModal();
  }

  const pillScan = contentDiv.querySelector('#pill-scan-nfce');
  if (pillScan) {
    pillScan.onclick = () => {
      if (typeof openNFCeScannerModal === 'function') openNFCeScannerModal();
    };
  }

  const pillOverdue = contentDiv.querySelector('#pill-overdue');
  if (pillOverdue && expandedContainer) {
    pillOverdue.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'overdue';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'overdue';
        expandedContainer.innerHTML = `
          <div class="card overdue-container" style="border: 1px solid rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.05)); padding: 16px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 800; color: #fbbf24;">⚠️ Pendências de Meses Anteriores Não Pagas (${summary.overduePreviousItems.length})</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div class="overdue-items-list" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
              ${summary.overduePreviousItems.map(item => {
                const parts = (item.date || '').split('-');
                const itemYear = parts[0];
                const itemMonth = parseInt(parts[1], 10);
                const isExpense = item.type === 'expense';
                return `
                  <div class="overdue-item-row" data-tx-id="${item.id}" data-rec-id="${item.recurring_item_id || ''}" data-type="${item.type}" data-month="${itemMonth}" data-year="${itemYear}" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                      <span class="badge" style="font-size: 9px; padding: 2px 6px;">📅 ${fmt.monthYear(itemMonth, itemYear)}</span>
                      <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.description || item.rec_name}</span>
                    </div>
                    <div style="font-size: 12.5px; font-weight: 800; color: ${isExpense ? '#f87171' : 'var(--accent-light)'};">
                      ${isExpense ? '− ' : '+ '}${fmt.currency(item.amount)} ➔
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        bindOverdueClickEvents(expandedContainer);
      }
    };
  }

  const pillExpense = contentDiv.querySelector('#pill-expense-alerts');
  if (pillExpense && expandedContainer) {
    pillExpense.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'expense';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'expense';
        const expenseAlerts = (summary.alertItems || []).filter(a => a.type !== 'income');
        expandedContainer.innerHTML = `
          <div class="card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06); padding: 14px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; color: #f87171;">🚨 Vencimentos nos Próximos ${summary.alertDays} Dias</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${expenseAlerts.map(a => {
                const daysLeft = a.due_day - today;
                return `<button type="button" class="alert-chip alert-chip-expense btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="expense">${a.rec_icon || '📋'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft}d`} • ${fmt.currency(a.amount)} ➔</button>`;
              }).join('')}
            </div>
          </div>
        `;
        bindAlertChipEvents(expandedContainer);
      }
    };
  }

  const pillIncome = contentDiv.querySelector('#pill-income-alerts');
  if (pillIncome && expandedContainer) {
    pillIncome.onclick = () => {
      const isVisible = expandedContainer.style.display === 'block' && expandedContainer.dataset.activeType === 'income';
      if (isVisible) {
        expandedContainer.style.display = 'none';
        expandedContainer.innerHTML = '';
        expandedContainer.dataset.activeType = '';
      } else {
        expandedContainer.style.display = 'block';
        expandedContainer.dataset.activeType = 'income';
        const incomeAlerts = (summary.alertItems || []).filter(a => a.type === 'income');
        expandedContainer.innerHTML = `
          <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06); padding: 14px; border-radius: var(--radius);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; color: var(--accent-light);">💰 Recebimentos nos Próximos ${summary.alertDays} Dias</div>
              <button class="btn btn-secondary btn-sm" id="btn-close-expanded-alerts" style="padding: 2px 8px; font-size: 11px;">✕ Fechar</button>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${incomeAlerts.map(a => {
                const daysLeft = a.due_day - today;
                return `<button type="button" class="alert-chip alert-chip-income btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="income">${a.rec_icon || '💼'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft}d`} • ${fmt.currency(a.amount)} ➔</button>`;
              }).join('')}
            </div>
          </div>
        `;
        bindAlertChipEvents(expandedContainer);
      }
    };
  }

  // 4. Clickable priority and transaction items
  contentDiv.querySelectorAll('.btn-dash-pix').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const txId = parseInt(btn.dataset.id);
      if (txId && typeof openPixPaymentModal === 'function') {
        openPixPaymentModal(txId, () => renderDashboard());
      }
    };
  });

  contentDiv.querySelectorAll('.btn-alert-link, .priority-item-clickable').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const recId = btn.dataset.recId;
      const txId = btn.dataset.txId;
      const type = btn.dataset.type || 'expense';
      goToTransaction({ recurringId: recId, txId, type, month: State.currentMonth, year: State.currentYear });
    };
  });

  // 5. Clickable credit card widgets
  contentDiv.querySelectorAll('.bank-card-credit').forEach(cardWidget => {
    cardWidget.onclick = () => {
      const cardId = parseInt(cardWidget.dataset.cardId);
      const cardColor = cardWidget.dataset.bankColor;
      const cardName = cardWidget.dataset.cardName;
      State.highlightCardId = cardId;
      State.highlightCardColor = cardColor;
      State.highlightCardName = cardName;
      State.highlightAccountId = null;
      State.highlightAccountColor = null;
      State.highlightAccountName = null;
      State.currentRecurringTab = 'expense';
      navigate('recurring');
    };
  });

  // 6. Clickable debit account widgets
  contentDiv.querySelectorAll('.bank-card-debit').forEach(debitWidget => {
    debitWidget.onclick = () => {
      const accId = parseInt(debitWidget.dataset.accountId);
      const accColor = debitWidget.dataset.bankColor;
      const accName = debitWidget.dataset.accountName;
      State.highlightAccountId = accId;
      State.highlightAccountColor = accColor;
      State.highlightAccountName = accName;
      State.highlightCardId = null;
      State.highlightCardColor = null;
      State.highlightCardName = null;
      State.currentRecurringTab = 'income';
      navigate('recurring');
    };
  });

  // 7. Render Charts
  if (document.getElementById('chart-monthly')) {
    State.charts.monthly = new Chart(document.getElementById('chart-monthly'), {
      type: 'bar',
      data: {
        labels: monthly.map(m => m.month),
        datasets: [
          { label: 'Receitas', data: monthly.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 },
          { label: 'Despesas', data: monthly.map(m => m.expense), backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6 },
        ]
      },
      options: chartOptions('bar')
    });
  }

  if (document.getElementById('dashboard-category-interactive-card')) {
    setupCategoryInteractiveChart('dashboard-category-interactive-card', 'category', txs);
  }
}

function bindAlertChipEvents(container) {
  const closeBtn = container.querySelector('#btn-close-expanded-alerts');
  if (closeBtn) {
    closeBtn.onclick = () => {
      container.style.display = 'none';
      container.innerHTML = '';
      container.dataset.activeType = '';
    };
  }
  container.querySelectorAll('.btn-alert-link').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const recId = btn.dataset.recId;
      const txId = btn.dataset.txId;
      const type = btn.dataset.type || 'expense';
      goToTransaction({ recurringId: recId, txId, type, month: State.currentMonth, year: State.currentYear });
    };
  });
}

function bindOverdueClickEvents(container) {
  const closeBtn = container.querySelector('#btn-close-expanded-alerts');
  if (closeBtn) {
    closeBtn.onclick = () => {
      container.style.display = 'none';
      container.innerHTML = '';
      container.dataset.activeType = '';
    };
  }
  container.querySelectorAll('.overdue-item-row').forEach(row => {
    row.onclick = (e) => {
      e.preventDefault();
      const txId = row.dataset.txId;
      const recId = row.dataset.recId;
      const type = row.dataset.type || 'expense';
      const month = parseInt(row.dataset.month, 10);
      const year = parseInt(row.dataset.year, 10);
      goToTransaction({ recurringId: recId, txId, type, month, year });
    };
  });
}
