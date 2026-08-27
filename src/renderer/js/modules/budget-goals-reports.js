/* ===
 * budget-goals-reports.js — L5080–5377 do app.js
 */

async function renderBudget() {
  const page = document.getElementById('page-budget');
  const categories = await window.api.categories.getAll(State.user.id);
  const expCats = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const isAdmin = State.permissions.can_edit_all === 1;
  let users = [];
  if (isAdmin) {
    users = await window.api.auth.getUsers();
  } else {
    State.budgetUserId = State.user.id; // Guarantee restricted user views their own
  }

  const userDropdownHtml = isAdmin ? `
    <select id="budget-user-select" style="padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; outline: none; transition: all var(--transition);">
      ${users.map(u => `<option value="${u.id}" ${u.id === State.budgetUserId ? 'selected' : ''}>🧑‍💻 ${u.name}</option>`).join('')}
    </select>
  ` : '';

  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Orçamento</h2><p class="page-subtitle">Limite de gastos por categoria</p></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div id="budget-period"></div>
        ${userDropdownHtml}
        ${isAdmin ? `<button class="btn btn-primary" id="btn-set-budget">+ Definir limite</button>` : ''}
      </div>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
      💡 <strong>O que é e como funciona o Orçamento?</strong> Nesta seção, definimos <strong>limites de gastos propostos</strong> por categoria. À medida que registramos despesas, o progresso é exibido como feedback pedagógico para ajudar jovens e crianças a gerenciar e cooperar.
      <br><br>
      🎯 <strong>Conselho Didático:</strong> Como filhos cooperam e adicionam receitas (mesadas, presentes, etc.), o orçamento ajuda a tomar decisões de gastos saudáveis de forma consciente, promovendo diálogos em família!
    </p>
    <div class="budget-grid" id="budget-grid"><div style="text-align:center;padding:40px;color:var(--text-muted)">Carregando...</div></div>`;

  document.getElementById('budget-period').appendChild(buildPeriodSelector(renderBudget));
  
  if (isAdmin) {
    document.getElementById('btn-set-budget').onclick = () => openBudgetModal(expCats);
    const selectEl = document.getElementById('budget-user-select');
    selectEl.onchange = async () => {
      State.budgetUserId = parseInt(selectEl.value);
      await loadBudgets();
    };
  }

  await loadBudgets();

  async function loadBudgets() {
    const budgetsRaw = await window.api.budgets.getAll({ userId: State.budgetUserId, month: State.currentMonth, year: State.currentYear });
    const budgets = Array.isArray(budgetsRaw) ? budgetsRaw : [];
    const grid = document.getElementById('budget-grid');
    if (!grid) return;
    if (budgets.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div class="empty-title">Nenhum limite definido</div><div class="empty-desc">${isAdmin ? 'Defina um teto de gastos proposto para este membro da família' : 'Você ainda não possui limites propostos. Peça aos seus pais!'}</div></div>`;
      return;
    }
    grid.innerHTML = budgets.map(b => {
      const pct = b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0;
      const progressCls = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
      const isExceeded = pct >= 100;
      return `<div class="budget-card">
        <div class="budget-card-header">
          <span class="budget-icon">${b.icon}</span>
          <div>
            <div class="budget-name">${b.category_name}</div>
            ${isExceeded ? '<div style="font-size:11px;color:#f87171;font-weight:600">⚠️ Limite Ultrapassado</div>' : pct >= 80 ? '<div style="font-size:11px;color:var(--warning);font-weight:600">⚡ Quase lá</div>' : '<div style="font-size:11px;color:#10b981;font-weight:600">🟢 Saudável</div>'}
          </div>
          ${isAdmin ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="openBudgetModal(null,${b.category_id},${b.amount})" style="margin-left:auto">✏️</button>` : ''}
        </div>
        <div class="budget-values"><span>Gasto: <strong style="color:${isExceeded ? '#f87171' : 'var(--text-primary)'}">${fmt.currency(b.spent)}</strong></span><span>Proposto: ${fmt.currency(b.amount)}</span></div>
        <div class="budget-progress-bar"><div class="budget-progress-fill ${progressCls}" style="width:${pct}%"></div></div>
        <div class="budget-percent">${pct.toFixed(0)}% • ${b.amount - b.spent >= 0 ? 'Disponível: ' + fmt.currency(b.amount - b.spent) : 'Excedido: ' + fmt.currency(b.spent - b.amount)}</div>
      </div>`;
    }).join('');
  }
}

function openBudgetModal(cats, prefillCatId = null, prefillAmt = null) {
  Modal.open('Definir Orçamento Proposto', `
    <div class="form-group">
      <label>Categoria</label>
      ${cats ? `<select id="budget-cat">${cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</select>` : `<input type="text" disabled value="Categoria selecionada" id="budget-cat" data-id="${prefillCatId}">`}
    </div>
    <div class="form-group"><label>Limite Proposto mensal (R$)</label><input type="number" id="budget-amount" step="0.01" min="0" placeholder="0,00" value="${prefillAmt || ''}"></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="budget-cancel">Cancelar</button>
      <button class="btn btn-primary" id="budget-save">Salvar</button>
    </div>
  `);
  document.getElementById('budget-cancel').onclick = Modal.close;
  document.getElementById('budget-save').onclick = async () => {
    const catEl = document.getElementById('budget-cat');
    const category_id = prefillCatId || parseInt(catEl.value);
    const amount = parseFloat(document.getElementById('budget-amount').value);
    if (!category_id || !amount || amount <= 0) { toast('Preencha todos os campos', 'error'); return; }
    const res = await window.api.budgets.set({ user_id: State.budgetUserId, category_id, month: State.currentMonth, year: State.currentYear, amount });
    if (res && res.error) {
      toast('Erro ao salvar orçamento: ' + res.error, 'error');
      return;
    }
    toast('Orçamento proposto salvo');
    Modal.close();
    renderBudget();
  };
}

// ════════════════════════════════════════
// GOALS
// ════════════════════════════════════════
async function renderGoals() {
  const page = document.getElementById('page-goals');
  const goals = await window.api.goals.getAll(State.user.id);
  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Metas Financeiras</h2></div>
      <button class="btn btn-primary" id="btn-new-goal">+ Nova meta</button>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
      💡 <strong>O que é e como funcionam as Metas?</strong> As metas servem para planejar e poupar com foco em objetivos específicos (como reserva de emergência, viagens ou compras importantes). Você define um valor alvo e um prazo, e realiza aportes à medida que poupa.
      <br><br>
      🎯 <strong>O que colocar aqui?</strong> Insira sonhos e necessidades de curto, médio ou longo prazo. Defina o valor total que precisa acumular e uma data-alvo estimada para conquistar esse objetivo.
      <br><br>
      🚀 <strong>Implicação no Orçamento Pessoal/Familiar:</strong> Guardar dinheiro com um propósito claro transforma o hábito de poupar em algo motivador. Esta atitude desenvolve a disciplina financeira, protege sua família contra imprevistos com a reserva e evita o endividamento futuro, pois você planeja a compra antes de realizá-la.
    </p>
    ${goals.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">Nenhuma meta criada</div><div class="empty-desc">Reserva de emergência, viagem, carro...</div><button class="btn btn-primary" id="btn-new-goal-empty">+ Criar meta</button></div>` :
    `<div class="goals-grid">${goals.map(g => {
      const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
      return `<div class="goal-card">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${g.color}"></div>
        ${g.is_completed ? '<div class="goal-completed-badge">✅ Concluída</div>' : ''}
        <div class="goal-icon">${g.icon}</div>
        <div class="goal-name">${g.name}</div>
        <div class="goal-deadline">${g.deadline ? '📅 Até ' + fmt.date(g.deadline) : 'Sem prazo'}</div>
        <div class="goal-amounts"><div class="goal-current" style="color:${g.color}">${fmt.currency(g.current_amount)}</div><div class="goal-target">de ${fmt.currency(g.target_amount)}</div></div>
        <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${pct}%;background:${g.color}"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;align-items:center">
          <span class="goal-percent">${pct.toFixed(0)}%</span>
          <div style="display:flex;gap:4px">
            ${!g.is_completed ? `<button class="btn btn-primary btn-sm goal-deposit" data-id="${g.id}">+ Aporte</button>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon goal-edit" data-id="${g.id}">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon goal-delete" data-id="${g.id}">🗑</button>
          </div>
        </div>
      </div>`;
    }).join('')}</div>`}`;

  const btnNewGoal = document.getElementById('btn-new-goal');
  if (btnNewGoal) btnNewGoal.onclick = () => openGoalModal(null);
  const btnNewGoalEmpty = document.getElementById('btn-new-goal-empty');
  if (btnNewGoalEmpty) btnNewGoalEmpty.onclick = () => openGoalModal(null);
  document.querySelectorAll('.goal-deposit').forEach(btn => { btn.onclick = () => openGoalDepositModal(parseInt(btn.dataset.id), goals); });
  document.querySelectorAll('.goal-edit').forEach(btn => { btn.onclick = () => openGoalModal(goals.find(g => g.id === parseInt(btn.dataset.id))); });
  document.querySelectorAll('.goal-delete').forEach(btn => {
    btn.onclick = async () => { if (confirm('Excluir esta meta?')) { await window.api.goals.delete(parseInt(btn.dataset.id)); toast('Meta excluída'); renderGoals(); } };
  });
}

function openGoalModal(goal) {
  const isEdit = !!goal;
  Modal.open(isEdit ? 'Editar Meta' : 'Nova Meta', `
    <div class="form-group"><label>Nome</label><input type="text" id="goal-name" placeholder="Ex: Reserva de emergência, Viagem..." value="${goal?.name || ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Valor alvo (R$)</label><input type="number" id="goal-target" step="0.01" placeholder="0,00" value="${goal?.target_amount || ''}"></div>
      <div class="form-group"><label>Prazo</label><input type="date" id="goal-deadline" value="${goal?.deadline || ''}"></div>
    </div>
    <div class="form-group"><label>Ícone</label><div class="icon-picker" id="goal-icon-picker">${['🎯','✈️','🚗','🏠','💊','📚','💍','🎓','🏖️','💻','🎸','🌍','📱','🐕'].map(i => `<button class="icon-btn ${(goal?.icon || '🎯') === i ? 'selected' : ''}" data-icon="${i}">${i}</button>`).join('')}</div></div>
    <div class="form-group"><label>Cor</label><div class="color-picker" id="goal-color-picker">${COLORS.map(c => `<div class="color-swatch ${(goal?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}</div></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="goal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="goal-save">${isEdit ? 'Salvar' : 'Criar meta'}</button>
    </div>`);

  let icon = goal?.icon || '🎯', color = goal?.color || '#10b981';
  document.querySelectorAll('#goal-icon-picker .icon-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('#goal-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; }; });
  document.querySelectorAll('#goal-color-picker .color-swatch').forEach(sw => { sw.onclick = () => { document.querySelectorAll('#goal-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); color = sw.dataset.color; }; });
  document.getElementById('goal-cancel').onclick = Modal.close;
  document.getElementById('goal-save').onclick = async () => {
    const name = document.getElementById('goal-name').value.trim();
    const target_amount = parseFloat(document.getElementById('goal-target').value);
    if (!name || !target_amount || target_amount <= 0) { toast('Preencha nome e valor', 'error'); return; }
    const data = { user_id: State.user.id, name, target_amount, current_amount: goal?.current_amount || 0, deadline: document.getElementById('goal-deadline').value || null, color, icon };
    
    let res;
    if (isEdit) {
      data.id = goal.id;
      res = await window.api.goals.update(data);
      if (res && res.error) {
        toast('Erro ao atualizar meta: ' + res.error, 'error');
        return;
      }
      toast('Meta atualizada');
    } else {
      res = await window.api.goals.create(data);
      if (res && res.error) {
        toast('Erro ao criar meta: ' + res.error, 'error');
        return;
      }
      toast('Meta criada!');
    }
    Modal.close(); renderGoals();
  };
}

function openGoalDepositModal(goalId, goals) {
  const goal = goals.find(g => g.id === goalId);
  Modal.open(`Aporte — ${goal.icon} ${goal.name}`, `
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:36px">${goal.icon}</div><div style="color:var(--text-muted);font-size:13px">${fmt.currency(goal.current_amount)} de ${fmt.currency(goal.target_amount)}</div></div>
    <div class="form-group"><label>Valor (R$)</label><input type="number" id="dep-amount" step="0.01" min="0" placeholder="0,00" autofocus></div>
    <div class="form-group"><label>Observação</label><input type="text" id="dep-note" placeholder="Ex: Transferência do mês"></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="dep-cancel">Cancelar</button>
      <button class="btn btn-primary" id="dep-save">Confirmar aporte</button>
    </div>`);
  document.getElementById('dep-cancel').onclick = Modal.close;
  document.getElementById('dep-save').onclick = async () => {
    const amount = parseFloat(document.getElementById('dep-amount').value);
    if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
    await window.api.goals.addDeposit({ goal_id: goalId, amount, note: document.getElementById('dep-note').value, date: new Date().toISOString().split('T')[0] });
    toast('Aporte registrado! 🎉'); Modal.close(); renderGoals();
  };
}

// ════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════
async function renderReports() {
  const page = document.getElementById('page-reports');
  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Relatórios</h2></div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn btn-secondary btn-sm" id="btn-print-report" style="display:flex;align-items:center;gap:6px" title="Imprimir Relatório ou Salvar em PDF">
          <span>🖨️</span> Imprimir / PDF
        </button>
        <div id="report-period"></div>
      </div>
    </div>
    <div class="report-tabs">
      <button class="report-tab active" data-tab="cashflow">Fluxo de Caixa</button>
      <button class="report-tab" data-tab="categories">Por Categoria</button>
      <button class="report-tab" data-tab="patrimony">Patrimônio</button>
      <button class="report-tab" data-tab="interest">Auditoria de Juros</button>
    </div>
    <div id="report-content"></div>`;

  document.getElementById('report-period').appendChild(buildPeriodSelector(() => loadTab(currentTab)));
  let currentTab = 'cashflow';

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });

  document.querySelectorAll('.report-tab').forEach(btn => {
    btn.onclick = () => { document.querySelectorAll('.report-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentTab = btn.dataset.tab; loadTab(currentTab); };
  });

  async function loadTab(tab) {
    const content = document.getElementById('report-content');
    if (tab === 'cashflow') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0) + (t.penalty_amount || 0) - (t.discount_amount || 0), 0);
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
          💡 <strong>Fluxo de Caixa:</strong> Este relatório apresenta a listagem completa de todas as receitas e despesas realizadas na competência selecionada, junto com o balanço consolidado do período. É a ferramenta ideal para você auditar a entrada e saída de recursos e verificar o saldo líquido exato de cada lançamento.
        </p>
        <div style="display:flex;gap:16px;margin-bottom:20px">
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Receitas</div><div style="font-size:20px;font-weight:800;color:var(--accent-light)">${fmt.currency(inc)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Despesas</div><div style="font-size:20px;font-weight:800;color:#f87171">${fmt.currency(exp)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Saldo</div><div style="font-size:20px;font-weight:800;color:${inc-exp>=0?'var(--accent-light)':'#f87171'}">${fmt.currency(inc-exp)}</div></div>
        </div>
        <div class="card"><div class="table-wrapper"><table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Tipo</th><th class="text-right">Valor Líquido</th></tr></thead>
          <tbody>${txs.length === 0 ? '<tr><td colspan="6" class="no-data">Sem lançamentos</td></tr>' :
            txs.map(t => {
              const net = (t.amount || 0) + (t.is_paid ? ((t.penalty_amount || 0) - (t.discount_amount || 0)) : 0);
              const hasAdjustment = t.is_paid && (t.penalty_amount > 0 || t.discount_amount > 0);
              return `<tr>
                <td style="color:var(--text-muted)">${fmt.date(t.date)}</td>
                <td>
                  ${t.description || '—'}
                  ${hasAdjustment ? `<div style="font-size:10.5px;color:var(--text-muted)">Base: ${fmt.currency(t.amount)}${t.penalty_amount > 0 ? ` (+${fmt.currency(t.penalty_amount)} juros)` : ''}${t.discount_amount > 0 ? ` (-${fmt.currency(t.discount_amount)} desc)` : ''}</div>` : ''}
                </td>
                <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
                <td>${t.account_name || '—'}</td>
                <td><span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
                <td class="text-right" style="font-weight:600;color:${t.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(net)}</td>
              </tr>`;
            }).join('')}
          </tbody></table></div></div>`;
    } else if (tab === 'categories') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
          💡 <strong>Por Categoria:</strong> Analise as distribuições percentuais de despesas e receitas por área de custo, personalizando métricas, filtros de pagamento e modos de exibição gráfica.
        </p>
        <div class="card" id="categories-report-interactive-wrapper"></div>
      `;
      setupCategoryInteractiveChart('categories-report-interactive-wrapper', 'repCat', txs);
    } else if (tab === 'patrimony') {
      const data = await window.api.reports.getPatrimony({ userId: State.user.id });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #3b82f6; border-radius: var(--radius-sm);">
          💡 <strong>Evolução Patrimonial:</strong> Este gráfico de linha apresenta a evolução acumulada e progressiva do seu patrimônio (saldos somados de todas as suas contas bancárias líquidas, poupanças e caixas de dinheiro) nos últimos 12 meses. O objetivo é visualizar e acompanhar o crescimento saudável e progressivo do seu patrimônio como um todo.
        </p>
        <div class="chart-card" style="height:320px"><canvas id="chart-patrimony"></canvas></div>`;
      if (State.charts.patrimony) State.charts.patrimony.destroy();
      const vals = data.map(d => d.net);
      State.charts.patrimony = new Chart(document.getElementById('chart-patrimony'), { type: 'line', data: { labels: data.map(d => d.month), datasets: [{ label: 'Patrimônio', data: vals, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4 }] }, options: chartOptions('bar') });
    } else if (tab === 'interest') {
      const audit = await window.api.reports.getInterestAudit({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const summary = audit.summary || { totalPenalty: 0, totalDiscount: 0, penaltyCount: 0, discountCount: 0, avgDaysLate: 0, avgDailyRate: 0 };
      const byCat = audit.byCategory || [];
      const bySup = audit.bySupplier || [];
      const byAcc = audit.byAccount || [];
      const txs = audit.transactions || [];

      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
          💡 <strong>Auditoria de Juros e Encargos:</strong> Monitore todos os valores pagos em atraso, multas, taxa média de juros ao dia (% a.d.) e economias com descontos obtidos. Identifique onde você mais gasta com juros por categoria, fornecedor ou conta bancária.
        </p>

        <!-- KPI CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="text-align: center; border-top: 3px solid #ef4444;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">⚠️ Total Pago em Juros / Multas</div>
            <div style="font-size: 22px; font-weight: 800; color: #f87171;">${fmt.currency(summary.totalPenalty)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${summary.penaltyCount} pagamento(s) com acréscimo</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #10b981;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🏷️ Total de Descontos Obtidos</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-light);">${fmt.currency(summary.totalDiscount)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${summary.discountCount} pagamento(s) com desconto</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #f59e0b;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📅 Média de Dias de Atraso</div>
            <div style="font-size: 22px; font-weight: 800; color: #fbbf24;">${summary.avgDaysLate.toFixed(1)} <span style="font-size: 13px; font-weight: 600;">dias</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Tempo médio de atraso pago</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #06b6d4;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📈 Taxa Média de Juros Diária</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">${summary.avgDailyRate.toFixed(3)}% <span style="font-size: 13px; font-weight: 600;">a.d.</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Custo médio diário do atraso</div>
          </div>
        </div>

        <!-- BREAKDOWN GRIDS: CATEGORIA, FORNECEDOR E CONTA -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- POR CATEGORIA -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>📂 Juros por Categoria</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${byCat.length} categorias</span>
            </h3>
            ${byCat.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${byCat.map(c => {
                  const pct = summary.totalPenalty > 0 ? ((c.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>${c.category_icon || '📁'} <strong>${c.category_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${c.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(c.total_penalty)} <span style="font-size:11px;color:var(--text-muted)">(${pct}%)</span></span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: ${c.category_color || '#ef4444'}; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- POR FORNECEDOR / CREDOR -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>🏢 Juros por Fornecedor / Credor</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">Top credores</span>
            </h3>
            ${bySup.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${bySup.slice(0, 6).map((s, idx) => {
                  const pct = summary.totalPenalty > 0 ? ((s.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span><strong style="color:var(--text-primary)">${idx + 1}. ${s.supplier}</strong> <span style="color:var(--text-muted);font-size:11px">(${s.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(s.total_penalty)}</span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: #f59e0b; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- POR CONTA BANCÁRIA -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <span>🏦 Juros por Conta Pagadora</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">Origem dos pagamentos</span>
            </h3>
            ${byAcc.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Nenhum juro registrado no período.</div>' : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${byAcc.map(a => {
                  const pct = summary.totalPenalty > 0 ? ((a.total_penalty / summary.totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>💳 <strong>${a.account_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${a.count}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(a.total_penalty)}</span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: ${a.account_color || '#3b82f6'}; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- TABELA DETALHADA DE AUDITORIA -->
        <div class="card">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">📋 Extrato Detalhado de Pagamentos com Ajuste (Juros ou Descontos)</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Atraso / Ant.</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Conta</th>
                  <th class="text-right">Valor Base</th>
                  <th class="text-right">Ajuste (Juros/Desc.)</th>
                  <th class="text-right">Taxa Diária</th>
                  <th class="text-right">Total Pago</th>
                </tr>
              </thead>
              <tbody>
                ${txs.length === 0 ? '<tr><td colspan="10" class="no-data" style="padding:24px;text-align:center">Nenhum pagamento com juros ou desconto registrado neste período. 🎉</td></tr>' :
                  txs.map(t => {
                    const isPenalty = t.penalty_amount > 0;
                    const isDiscount = t.discount_amount > 0;
                    const diffDays = t.days_late;
                    let delayLabel = '—';
                    if (diffDays > 0) delayLabel = `<span style="color:#f87171;font-weight:700">+${diffDays}d atraso</span>`;
                    else if (diffDays < 0) delayLabel = `<span style="color:var(--accent-light);font-weight:700">${Math.abs(diffDays)}d antecip.</span>`;
                    else delayLabel = `<span style="color:var(--text-muted)">no dia</span>`;

                    return `
                      <tr>
                        <td style="color:var(--text-muted)">${fmt.date(t.due_date || t.date)}</td>
                        <td style="font-weight:600;color:var(--text-primary)">${fmt.date(t.payment_date)}</td>
                        <td>${delayLabel}</td>
                        <td style="font-weight:600">${t.description || '—'}</td>
                        <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
                        <td>${t.account_name || '—'}</td>
                        <td class="text-right" style="color:var(--text-muted)">${fmt.currency(t.base_amount)}</td>
                        <td class="text-right" style="font-weight:700;color:${isPenalty ? '#f87171' : (isDiscount ? 'var(--accent-light)' : 'var(--text-muted)')}">
                          ${isPenalty ? `+${fmt.currency(t.penalty_amount)}` : (isDiscount ? `-${fmt.currency(t.discount_amount)}` : 'R$ 0,00')}
                        </td>
                        <td class="text-right" style="font-size:12px;color:${isPenalty ? '#fbbf24' : 'var(--text-muted)'}">
                          ${isPenalty && t.daily_rate_pct ? `${t.daily_rate_pct.toFixed(3)}% a.d.` : '—'}
                        </td>
                        <td class="text-right" style="font-weight:800;color:var(--text-primary)">${fmt.currency(t.net_amount)}</td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }
  await loadTab('cashflow');
}

// ════════════════════════════════════════
// MANUAL DO USUÁRIO & WIKI (PÁGINA DEDICADA)
// ════════════════════════════════════════