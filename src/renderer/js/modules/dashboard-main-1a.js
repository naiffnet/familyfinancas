/* === dashboard-main-1a.js (parte 1/2 de dashboard-main-1.js) ===
 * Linhas 1–807
 */

/* ===
 * dashboard-main-1.js — Parte 1 de dashboard-main
 * Linhas 719–1756 do app.js
 */

async function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  
  if (State.user.profile_type === 5) {
    await renderCaculaDashboard(page);
    return;
  }
  
  // Basic layout with tabs
  let headerHtml = `
    <div class="page-header">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 class="page-title">Dashboard</h2>
          ${State.familyName ? `<span class="badge" style="background: rgba(139, 92, 246, 0.12); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 50px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em;">🏠 ${State.familyName}</span>` : ''}
        </div>
        <p class="page-subtitle" id="dash-subtitle">Carregando...</p>
      </div>
      <div id="dash-period-wrapper"></div>
    </div>
    
    <div class="report-tabs" id="dashboard-tabs" style="margin-bottom: 20px;">
      <button class="report-tab ${State.activeDashTab === 'mensal' ? 'active' : ''}" data-tab="mensal">📅 Visão Mensal</button>
      <button class="report-tab ${State.activeDashTab === 'geral' ? 'active' : ''}" data-tab="geral">🌐 Visão Geral</button>
    </div>
    
    <div id="dashboard-tab-content" class="dashboard-view-fade"></div>
  `;
  
  page.innerHTML = headerHtml;
  
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
    const creditAccounts = summary.accounts.filter(a => a.type === 'credit');
    const debitAccounts  = summary.accounts.filter(a => a.type !== 'credit' && a.type !== 'investment');
    const recurringPct   = summary.totalRecurring > 0 ? Math.round((summary.paidRecurring / summary.totalRecurring) * 100) : 0;

    const paidBills = (txs || []).filter(t => t.type === 'expense' && (t.is_paid === 1 || t.is_paid === true));
    const unpaidBills = (txs || []).filter(t => t.type === 'expense' && (t.is_paid === 0 || t.is_paid === false));
    const totalPaidAmount = paidBills.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalUnpaidAmount = unpaidBills.reduce((acc, t) => acc + (t.amount || 0), 0);

    const incomeAlerts = (summary.alertItems || []).filter(a => a.type === 'income');
    const expenseAlerts = (summary.alertItems || []).filter(a => a.type !== 'income');

    const contentDiv = document.getElementById('dashboard-tab-content');
    contentDiv.innerHTML = `
      ${(potentialDuplicates && potentialDuplicates.length > 0) ? `
      <div class="alert-banner" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1)); border: 1px solid rgba(139, 92, 246, 0.35); margin-bottom: 16px; padding: 12px 18px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 22px;">🛡️</span>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #a78bfa;">Anti-Duplicidade: ${potentialDuplicates.length} potencial(is) lançamento(s) duplicado(s) detectado(s)</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Membros da família podem ter lançado o mesmo gasto na Web e no Desktop.</div>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-open-dedup-banner" style="background: #8b5cf6; border: none; font-size: 11.5px; padding: 6px 14px; white-space: nowrap; font-weight: 700;">
          🔍 Conciliar Agora ➔
        </button>
      </div>` : ''}

      ${incomeAlerts.length > 0 ? `
      <div class="alert-banner alert-banner-income">
        <span class="alert-banner-icon">💰</span>
        <div style="flex:1">
          <div class="alert-banner-title">Recebimentos próximos (próximos ${summary.alertDays} dias)</div>
          <div class="alert-banner-items">
            ${incomeAlerts.map(a => {
              const daysLeft = a.due_day - today;
              return `<button type="button" class="alert-chip alert-chip-income btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="income" title="Clique para abrir este recebimento no Planejamento">${a.rec_icon || '💼'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`} • ${fmt.currency(a.amount)} <span style="font-size:10px;margin-left:2px;opacity:0.8">➔</span></button>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}

      ${expenseAlerts.length > 0 ? `
      <div class="alert-banner alert-banner-expense">
        <span class="alert-banner-icon">🚨</span>
        <div style="flex:1">
          <div class="alert-banner-title">Vencimentos próximos (próximos ${summary.alertDays} dias)</div>
          <div class="alert-banner-items">
            ${expenseAlerts.map(a => {
              const daysLeft = a.due_day - today;
              return `<button type="button" class="alert-chip alert-chip-expense btn-alert-link" data-rec-id="${a.recurring_item_id || ''}" data-tx-id="${a.id || ''}" data-type="expense" title="Clique para abrir esta despesa no Planejamento">${a.rec_icon || '📋'} ${a.rec_name} — ${daysLeft === 0 ? 'Hoje!' : `em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`} • ${fmt.currency(a.amount)} <span style="font-size:10px;margin-left:2px;opacity:0.8">➔</span></button>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}

      ${(summary.overduePreviousItems && summary.overduePreviousItems.length > 0) ? `
      <!-- ⚠️ CONTAINER DE LANÇAMENTOS NÃO PAGOS DE MESES ANTERIORES -->
      <div class="card overdue-container" style="border: 1px solid rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.05)); margin-bottom: 20px; padding: 18px 20px; border-radius: var(--radius); box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.35); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              ⚠️
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #fbbf24; letter-spacing: -0.01em; display: flex; align-items: center; gap: 8px;">
                Pendências de Meses Anteriores Não Pagas
                <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px;">
                  ${summary.overduePreviousItems.length} pendência${summary.overduePreviousItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Lançamentos anteriores a <strong>${fmt.monthYear(State.currentMonth, State.currentYear)}</strong> em aberto. Clique no item para abrir direto no mês correspondente.
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Acumulado</div>
            <div style="font-size: 18px; font-weight: 900; color: #f87171;">
              ${fmt.currency(summary.overduePreviousItems.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0))}
            </div>
          </div>
        </div>

        <div class="overdue-items-list" style="max-height: 290px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
          ${summary.overduePreviousItems.map(item => {
            const parts = (item.date || '').split('-');
            const itemYear = parts[0];
            const itemMonth = parseInt(parts[1], 10);
            const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : item.date;
            const isExpense = item.type === 'expense';
            const userBadge = item.user_name ? `<span class="profile-badge" style="background:${item.user_avatar_color || '#10b981'}22;color:${item.user_avatar_color || '#10b981'};border:1px solid ${item.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;">${item.user_name}</span>` : '';
            const accountBadge = item.account_name ? `<span style="font-size: 10px; color: var(--text-muted); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">🏦 ${item.account_name}</span>` : '';

            return `
              <div class="overdue-item-row" 
                   data-tx-id="${item.id}" 
                   data-rec-id="${item.recurring_item_id || ''}" 
                   data-type="${item.type}" 
                   data-month="${itemMonth}" 
                   data-year="${itemYear}"
                   title="Clique para ir até '${item.description || item.rec_name || 'este lançamento'}' em ${fmt.monthYear(itemMonth, itemYear)}"
                   style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; transition: all 0.2s ease;">
                
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                  <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; white-space: nowrap;">
                    📅 ${fmt.monthYear(itemMonth, itemYear)}
                  </span>
                  
                  <div style="font-size: 18px; line-height: 1;">${item.category_icon || item.rec_icon || (isExpense ? '📋' : '💰')}</div>

                  <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;">
                      ${item.description || item.rec_name || 'Lançamento sem descrição'}
                      ${userBadge}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                      <span>Vencimento: <strong>${formattedDate}</strong></span>
                      ${accountBadge}
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
                  <div style="text-align: right;">
                    <div style="font-size: 14px; font-weight: 800; color: ${isExpense ? '#f87171' : 'var(--accent-light)'};">
                      ${isExpense ? '− ' : '+ '}${fmt.currency(item.amount)}
                    </div>
                    <div style="font-size: 10px; color: #f87171; font-weight: 600;">Não pago</div>
                  </div>
                  
                  <div class="overdue-go-btn" style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg-hover); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: #fbbf24; font-size: 12px; transition: transform 0.2s;">
                    ➔
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- KPI Cards -->
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
          <div class="kpi-sub">${summary.totalRecurring - summary.paidRecurring} item(s) pendente(s)</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Progress bar recorrências -->
      <div class="card" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:13px;font-weight:600">Recorrências do mês — ${summary.paidRecurring} de ${summary.totalRecurring} pagas</div>
          <div style="font-size:13px;font-weight:700;color:${recurringPct >= 100 ? 'var(--accent-light)' : 'var(--text-secondary)'}">${recurringPct}%</div>
        </div>
        <div class="progress-bar" style="height:10px">
          <div class="progress-fill ${recurringPct >= 100 ? 'progress-ok' : recurringPct >= 60 ? 'progress-warn' : 'progress-ok'}" style="width:${recurringPct}%"></div>
        </div>
      </div>

      <!-- Cards e Contas -->
      ${(creditAccounts.length > 0 || debitAccounts.length > 0) ? `
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Previsibilidade de Contas e Cartões</div>
        <div class="cards-widget-grid" id="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, summary.cardSpending[acc.id] || 0, (summary.cardMonthlyInvoices && summary.cardMonthlyInvoices[acc.id]) !== undefined ? summary.cardMonthlyInvoices[acc.id] : null)).join('')}
          ${debitAccounts.map(acc => renderDebitAccountWidget(acc)).join('')}
        </div>
      </div>` : `
      <div class="card" style="margin-bottom:24px;text-align:center;padding:24px">
        <div style="font-size:32px;margin-bottom:8px">🏦</div>
        <div style="font-size:13px;color:var(--text-muted)">Nenhuma conta cadastrada ainda.</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigate('accounts')">+ Adicionar conta</button>
      </div>`}

      <!-- Priority + Charts -->
      <div class="dashboard-middle-grid" style="margin-bottom:16px;">
        <!-- Prioridades -->
        <div class="card">
          <div class="card-title">⭐ Lançamentos prioritários</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
            ${summary.priorityItems.length === 0
              ? `<div class="no-data">Nenhum item marcado como prioritário.<br><small>Marque itens como ⭐ em Planejamento.</small></div>`
              : summary.priorityItems.map(item => `
                <div class="priority-item priority-item-clickable ${item.is_paid ? 'priority-paid' : 'priority-pending'}" data-rec-id="${item.recurring_item_id || item.id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.rec_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.rec_name || item.description}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${item.account_name || '—'} • dia ${item.due_day || '?'}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:14px;color:${item.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${item.type === 'income' ? '+' : '-'}${fmt.currency(item.amount)}</div>
                    <span class="transaction-status ${item.is_paid ? 'status-paid' : 'status-pending'}">${item.is_paid ? '✓ Pago' : '⏳ Pendente'}</span>
                  </div>
                </div>`).join('')
            }
          </div>
        </div>

        <!-- Category Chart -->
        <div class="chart-card" id="dashboard-category-interactive-card" style="display: flex; flex-direction: column;">
          <div class="card-title">Despesas por categoria</div>
        </div>
      </div>

      <!-- Quadros: Contas Pagas e Contas a Pagar (Acima do gráfico de 6 meses) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 16px;">
        
        <!-- Quadro Contas Pagas -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
            <div class="card-title" style="margin-bottom:0; display:flex; align-items:center; gap:6px;">
              <span>✅</span> Contas Pagas <span class="badge" style="background:var(--accent-dim); color:var(--accent-light); margin-left:4px;">${paidBills.length}</span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: var(--accent-light);">${fmt.currency(totalPaidAmount)}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; padding-right: 4px;">
            ${paidBills.length === 0
              ? `<div class="no-data">Nenhuma conta paga neste mês.</div>`
              : paidBills.map(item => `
                <div class="priority-item priority-item-clickable priority-paid" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '💸'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.description}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}${item.is_paid && item.payment_date && item.payment_date !== item.date ? ` • <span style="color:var(--accent-light)">pago em ${fmt.date(item.payment_date)}</span>` : ''}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:14px;color:var(--accent-light)">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-paid">✓ Pago</span>
                  </div>
                </div>`).join('')
            }
          </div>
        </div>

        <!-- Quadro Contas a Pagar -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
            <div class="card-title" style="margin-bottom:0; display:flex; align-items:center; gap:6px;">
              <span>⏳</span> Contas a Pagar <span class="badge" style="background:var(--danger-dim); color:#f87171; margin-left:4px;">${unpaidBills.length}</span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #f87171;">${fmt.currency(totalUnpaidAmount)}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; padding-right: 4px;">
            ${unpaidBills.length === 0
              ? `<div class="no-data">Nenhuma conta a pagar pendente neste mês.</div>`
              : unpaidBills.map(item => `
                <div class="priority-item priority-item-clickable priority-pending" data-rec-id="${item.recurring_item_id || ''}" data-tx-id="${item.id || ''}" data-type="${item.type || 'expense'}" style="margin-bottom:0" title="Clique para abrir no Planejamento">
                  <div style="font-size:18px">${item.category_icon || '📋'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.description}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${item.account_name || 'Geral'} • ${fmt.date(item.date)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-weight:700;font-size:14px;color:#f87171">-${fmt.currency(item.amount)}</div>
                    <span class="transaction-status status-pending">⏳ Pendente</span>
                  </div>
                </div>`).join('')
            }
          </div>
        </div>

      </div>

      <!-- Monthly Chart -->
      <div class="chart-card">
        <div class="card-title">Receitas × Despesas — últimos 6 meses</div>
        <canvas id="chart-monthly" style="max-height:200px"></canvas>
      </div>
    `;

    // Bind Anti-Duplication Banner Click
    const dedupBannerBtn = contentDiv.querySelector('#btn-open-dedup-banner');
    if (dedupBannerBtn) {
      dedupBannerBtn.onclick = () => openDeduplicationModal();
    }

    // Bind clickable alert chips and priority items to navigate directly to Planejamento
    contentDiv.querySelectorAll('.btn-alert-link, .priority-item-clickable').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const recId = btn.dataset.recId;
        const txId = btn.dataset.txId;
        const type = btn.dataset.type || 'expense';
        goToTransaction({ recurringId: recId, txId, type, month: State.currentMonth, year: State.currentYear });
      };
    });

    // Bind clickable overdue previous items to navigate directly to the specific month/year and highlight transaction
    contentDiv.querySelectorAll('.overdue-item-row').forEach(row => {
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

    // Bind clickable credit card widgets to open Planejamento > Despesas and highlight its installments
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

    // Bind clickable debit/checking account widgets to open Planejamento > Receitas and highlight its income transactions
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

    // Render monthly charts
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

    setupCategoryInteractiveChart('dashboard-category-interactive-card', 'category', txs);
    
  } else {
    // 🌐 VISÃO GERAL
    document.getElementById('dash-subtitle').innerText = 'Consolidado — Patrimônio e Saldos Reais';
    document.getElementById('dash-period-wrapper').innerHTML = ''; // No period selector for general tab

    const [summaryGeral, monthly, patrimony] = await Promise.all([
      window.api.dashboard.getGeneralSummary({ userId: State.user.id }),
      window.api.dashboard.getMonthlyChart({ userId: State.user.id, months: 6 }),
      window.api.reports.getPatrimony({ userId: State.user.id }),
    ]);

    const creditAccounts = summaryGeral.accounts.filter(a => a.type === 'credit');
    const debitAccounts  = summaryGeral.accounts.filter(a => a.type !== 'credit');

    const totalDebit = debitAccounts.reduce((sum, a) => sum + a.balance, 0);

    const contentDiv = document.getElementById('dashboard-tab-content');
    contentDiv.innerHTML = `
      <!-- KPI Cards Geral -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-balance">
          <div class="kpi-label">Patrimônio Líquido</div>
          <div class="kpi-value" style="color:${summaryGeral.netWorth >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(summaryGeral.netWorth)}</div>
          <div class="kpi-sub">Saldos − faturas de cartões</div>
          <div class="kpi-icon">💰</div>
        </div>
        <div class="kpi-card kpi-income">
          <div class="kpi-label">Saldo em Contas</div>
          <div class="kpi-value">${fmt.currency(totalDebit)}</div>
          <div class="kpi-sub">soma de todas as contas</div>
          <div class="kpi-icon">🏦</div>
        </div>
        <div class="kpi-card kpi-expense">
          <div class="kpi-label">Dívida em Cartões</div>
          <div class="kpi-value">${fmt.currency(summaryGeral.creditCardBalance)}</div>
          <div class="kpi-sub">limites totais comprometidos</div>
          <div class="kpi-icon">💳</div>
        </div>
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">À Pagar Total</div>
          <div class="kpi-value">${fmt.currency(summaryGeral.totalPending)}</div>
          <div class="kpi-sub">despesas não pagas no BD</div>
          <div class="kpi-icon">⏳</div>
        </div>
      </div>

      <!-- Real Accounts -->
      ${summaryGeral.accounts.length > 0 ? `
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">🏦 Saldos e Faturas Atuais (Reais)</div>
        <div class="cards-widget-grid">
          ${creditAccounts.map(acc => renderCreditCardWidget(acc, acc.credit_used !== undefined ? acc.credit_used : (acc.balance < 0 ? -acc.balance : 0))).join('')}
          ${debitAccounts.map(acc => renderDebitAccountStaticWidget(acc)).join('')}
        </div>
      </div>` : ''}

      <!-- Goals and Graphs -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- Savings Goals -->
        <div class="card">
          <div class="card-title">🎯 Objetivos & Cofrinhos</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px">
            ${summaryGeral.goals.length === 0
              ? `<div class="no-data">Nenhum cofrinho ativo cadastrado.<br><small>Defina metas em Objetivos.</small></div>`
              : summaryGeral.goals.map(goal => renderDashboardGoalItem(goal)).join('')
            }
          </div>
        </div>

        <!-- 6 Month revenues vs expenses bar chart -->
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

    // Bind clickable credit card widgets in General tab
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

    // Bind clickable debit account widgets in General tab
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
}

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
      <!-- Header -->
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

      <!-- Body: donut + info -->
      <div class="bank-card-body">
        <!-- Two-tone donut: used vs free -->
        <div class="bank-card-donut" style="position:relative">
          ${buildCreditDonut(spent, limit, 108)}
        </div>

        <!-- Values -->
        <div class="bank-card-values" style="gap:0">
          <!-- Limite total -->
          <div style="margin-bottom:8px">
            <div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Limite total</div>
            <div style="font-size:17px;font-weight:900;color:var(--text-primary);letter-spacing:-0.02em">${fmt.currency(limit)}</div>
          </div>

          ${invoiceAmount !== null ? `
          <!-- Fatura do Mês -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
            <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">Fatura do Mês</span>
            <span style="font-size:13px;font-weight:800;color:#f87171">${fmt.currency(invoiceAmount)}</span>
          </div>` : ''}

          <!-- Comprometido -->
          <div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${isExceeded || pctReal > 80 ? '#ef4444' : pctReal > 60 ? '#f59e0b' : '#f97316'};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Comprometido Total</span>
            </div>
            <div style="font-size:16px;font-weight:800;color:${isExceeded || pctReal > 80 ? '#f87171' : pctReal > 60 ? '#fbbf24' : '#fb923c'}">${fmt.currency(spent)}</div>
          </div>

          <!-- Disponível -->
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
