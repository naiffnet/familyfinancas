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
      <div><h2 class="page-title">Orçamento & Regra 50-30-20</h2><p class="page-subtitle">Gestão de limites de gastos e equilíbrio financeiro familiar</p></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div id="budget-period"></div>
        ${userDropdownHtml}
        ${isAdmin ? `<button class="btn btn-primary" id="btn-set-budget">+ Definir limite</button>` : ''}
      </div>
    </div>

    <!-- PAINEL INTELIGENTE DA REGRA 50-30-20 -->
    <div id="budget-503020-container" style="margin-bottom: 24px;"></div>

    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
      💡 <strong>O que é e como funciona o Orçamento?</strong> Nesta seção, definimos <strong>limites de gastos propostos</strong> por categoria e acompanhamos a distribuição entre <strong>Necessidades (50%)</strong>, <strong>Desejos (30%)</strong> e <strong>Poupança/Futuro (20%)</strong>.
      <br><br>
      🎯 <strong>Conselho Pedagógico:</strong> Como a família coopera e adiciona receitas conjuntas, o orçamento ajuda a tomar decisões de gastos saudáveis de forma consciente, promovendo o diálogo familiar!
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
    // 1. Carregar Análise 50-30-20
    const b503020 = await window.api.reports.getBudget503020({ userId: State.budgetUserId || State.user.id, month: State.currentMonth, year: State.currentYear });
    const c503020 = document.getElementById('budget-503020-container');
    if (c503020 && b503020) {
      const statusColors = { safe: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
      const statusBadges = {
        safe: '<span style="background:rgba(16,185,129,0.15);color:#10b981;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700">🟢 Saudável</span>',
        warning: '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700">⚠️ Atenção</span>',
        danger: '<span style="background:rgba(239,68,68,0.15);color:#f87171;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700">🔴 Estourado</span>'
      };

      c503020.innerHTML = `
        <div class="card" style="border: 1px solid var(--border); background: linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.7)); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display:flex; align-items:center; gap: 8px;">
              <span style="font-size: 20px;">⚖️</span>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0;">Diagnóstico da Regra Orçamentária 50-30-20</h3>
            </div>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Renda Base: <strong style="color: var(--accent-light);">${fmt.currency(b503020.totalIncome > 0 ? b503020.totalIncome : b503020.totalExpense)}</strong>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px; border-left: 3px solid ${statusColors[b503020.overallStatus] || '#3b82f6'};">
            💡 <strong>Diagnóstico:</strong> ${b503020.diagnosis}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            ${b503020.groups.map(g => {
              const barColor = statusColors[g.status] || '#10b981';
              const progressWidth = Math.min(100, (g.currentPct / g.targetPct) * 100);
              return `
                <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${g.name}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${g.desc}</div>
                    </div>
                    ${statusBadges[g.status]}
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 10px 0 4px;">
                    <span style="font-size: 18px; font-weight: 800; color: ${barColor};">${g.currentPct}%</span>
                    <span style="font-size: 11.5px; color: var(--text-muted);">Meta: <strong>${g.targetPct}%</strong> (${fmt.currency(g.targetAmount)})</span>
                  </div>

                  <div style="height: 7px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="height: 100%; width: ${progressWidth}%; background: ${barColor}; border-radius: 4px; transition: width 0.4s ease;"></div>
                  </div>

                  <div style="font-size: 11px; color: var(--text-muted); text-align: right;">
                    Realizado: <strong style="color: var(--text-primary);">${fmt.currency(g.spent)}</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 2. Carregar Orçamentos por Categoria
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
// GOALS (PILAR 2: SIMULADOR CDI & APORTE PMT)
// ════════════════════════════════════════
async function renderGoals() {
  const page = document.getElementById('page-goals');
  const goals = await window.api.goals.getSimulations(State.user.id);
  
  const goalTypeLabels = {
    general: { label: '🎯 Objetivo Geral', color: '#10b981' },
    emergency_fund: { label: '🛡️ Reserva de Emergência', color: '#3b82f6' },
    dream: { label: '✨ Sonho / Viagem', color: '#f59e0b' },
    investment: { label: '📈 Investimento / CDI', color: '#8b5cf6' },
    purchase: { label: '🚗 Aquisição / Bem', color: '#ec4899' },
    debt_payoff: { label: '💳 Quitação de Dívida', color: '#06b6d4' }
  };

  page.innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Metas Financeiras & Caixinhas</h2><p class="page-subtitle">Planejamento com rendimento CDI e cálculo de aporte mensal sugerido</p></div>
      <button class="btn btn-primary" id="btn-new-goal">+ Nova meta</button>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
      💡 <strong>Como funcionam as Metas & Caixinhas?</strong> As metas calculam automaticamente o <strong>Aporte Mensal Sugerido ($PMT$)</strong> e a <strong>Projeção de Juros Compostos (CDI/CDB)</strong> até a data-alvo para você atingir seus objetivos no menor tempo e com maior economia.
    </p>
    ${goals.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">Nenhuma meta criada</div><div class="empty-desc">Reserva de emergência, viagem, carro, reforma...</div><button class="btn btn-primary" id="btn-new-goal-empty">+ Criar meta</button></div>` :
    `<div class="goals-grid">${goals.map(g => {
      const pct = g.progressPct || 0;
      const typeInfo = goalTypeLabels[g.goal_type] || goalTypeLabels.general;
      const hasYield = g.yield_rate > 0;

      return `<div class="goal-card" style="position:relative; overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${g.color}"></div>
        
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; color: ${typeInfo.color}; background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px;">${typeInfo.label}</span>
          ${g.is_completed ? '<div class="goal-completed-badge" style="position:static;">✅ Concluída</div>' : ''}
        </div>

        <div class="goal-icon">${g.icon}</div>
        <div class="goal-name">${g.name}</div>
        <div class="goal-deadline">${g.deadline ? '📅 Prazo: ' + fmt.date(g.deadline) + ` (${g.monthsRemaining}m restantes)` : 'Sem prazo definido'}</div>
        
        <div class="goal-amounts">
          <div class="goal-current" style="color:${g.color}">${fmt.currency(g.current_amount)}</div>
          <div class="goal-target">de ${fmt.currency(g.target_amount)}</div>
        </div>

        <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${pct}%;background:${g.color}"></div></div>
        
        <div style="display:flex;justify-content:space-between;margin-top:6px;align-items:center">
          <span class="goal-percent">${pct.toFixed(0)}%</span>
          <span style="font-size:11px;color:var(--text-muted);">Faltam: <strong>${fmt.currency(g.remainingAmount)}</strong></span>
        </div>

        <!-- SIMULADOR PMT & CDI -->
        ${!g.is_completed && g.suggestedMonthlyDeposit > 0 ? `
          <div style="margin-top: 12px; padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px dashed rgba(255,255,255,0.1); font-size: 11.5px; line-height: 1.4;">
            <div style="display:flex; justify-content:space-between; color: var(--accent-light); font-weight: 600;">
              <span>💰 Aporte Sugerido:</span>
              <span>${fmt.currency(g.suggestedMonthlyDeposit)}/mês</span>
            </div>
            ${hasYield ? `
              <div style="display:flex; justify-content:space-between; color: #8b5cf6; font-size: 10.5px; margin-top: 2px;">
                <span>✨ Rendimento CDI (${g.yield_rate}% a.a.):</span>
                <span>+${fmt.currency(g.projectedYield)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div style="display:flex;justify-content:flex-end;gap:4px;margin-top:12px">
          ${!g.is_completed ? `<button class="btn btn-primary btn-sm goal-deposit" data-id="${g.id}">+ Aporte</button>` : ''}
          <button class="btn btn-ghost btn-sm btn-icon goal-edit" data-id="${g.id}">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon goal-delete" data-id="${g.id}">🗑</button>
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
  Modal.open(isEdit ? 'Editar Meta' : 'Nova Meta & Caixinha', `
    <div class="form-group"><label>Nome do Objetivo</label><input type="text" id="goal-name" placeholder="Ex: Reserva de Emergência, Viagem Disney, Reforma..." value="${goal?.name || ''}"></div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Tipo de Meta</label>
        <select id="goal-type">
          <option value="general" ${goal?.goal_type === 'general' ? 'selected' : ''}>🎯 Objetivo Geral</option>
          <option value="emergency_fund" ${goal?.goal_type === 'emergency_fund' ? 'selected' : ''}>🛡️ Reserva de Emergência</option>
          <option value="dream" ${goal?.goal_type === 'dream' ? 'selected' : ''}>✨ Sonho / Viagem</option>
          <option value="investment" ${goal?.goal_type === 'investment' ? 'selected' : ''}>📈 Investimento / CDI</option>
          <option value="purchase" ${goal?.goal_type === 'purchase' ? 'selected' : ''}>🚗 Aquisição de Bem</option>
          <option value="debt_payoff" ${goal?.goal_type === 'debt_payoff' ? 'selected' : ''}>💳 Quitação de Dívidas</option>
        </select>
      </div>
      <div class="form-group">
        <label>Rentabilidade Estimada (% a.a. ou CDI)</label>
        <input type="number" id="goal-yield" step="0.1" min="0" placeholder="Ex: 10.5 (100% CDI)" value="${goal?.yield_rate || ''}">
      </div>
    </div>

    <div class="form-row">
      <div class="form-group"><label>Valor Alvo Total (R$)</label><input type="number" id="goal-target" step="0.01" placeholder="0,00" value="${goal?.target_amount || ''}"></div>
      <div class="form-group"><label>Data Limite / Prazo</label><input type="date" id="goal-deadline" value="${goal?.deadline || ''}"></div>
    </div>
    <div class="form-group"><label>Ícone</label><div class="icon-picker" id="goal-icon-picker">${['🎯','🛡️','✈️','🚗','🏠','💊','📚','💍','🎓','🏖️','💻','🎸','🌍','📱','🐕','📈'].map(i => `<button class="icon-btn ${(goal?.icon || '🎯') === i ? 'selected' : ''}" data-icon="${i}">${i}</button>`).join('')}</div></div>
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
    const goal_type = document.getElementById('goal-type').value;
    const yield_rate = parseFloat(document.getElementById('goal-yield').value) || 0;

    if (!name || !target_amount || target_amount <= 0) { toast('Preencha nome e valor alvo', 'error'); return; }
    const data = { 
      user_id: State.user.id, 
      name, 
      target_amount, 
      current_amount: goal?.current_amount || 0, 
      deadline: document.getElementById('goal-deadline').value || null, 
      goal_type,
      yield_rate,
      color, 
      icon 
    };
    
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
      toast('Meta criada com sucesso! 🎉');
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
      <button class="report-tab active" data-tab="cashflow">📊 Fluxo de Caixa</button>
      <button class="report-tab" data-tab="categories">🏷️ Por Categoria</button>
      <button class="report-tab" data-tab="patrimony">🛡️ Patrimônio</button>
      <button class="report-tab" data-tab="forecast">🔮 Projeção Preditiva</button>
      <button class="report-tab" data-tab="subscriptions">📱 Radar de Assinaturas</button>
      <button class="report-tab" data-tab="interest">⚠️ Auditoria de Juros</button>
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
      const [data, alloc] = await Promise.all([
        window.api.reports.getPatrimony({ userId: State.user.id }),
        window.api.reports.getPatrimonyAllocation({ userId: State.user.id })
      ]);

      const dist = alloc?.distribution || [];
      const netWorth = alloc?.netWorth || 0;
      const totalAssets = alloc?.totalAssets || 0;
      const totalLiabilities = alloc?.totalLiabilities || 0;

      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #3b82f6; border-radius: var(--radius-sm);">
          💡 <strong>Gestão Patrimonial & Alocação de Ativos:</strong> Acompanhe a distribuição do seu patrimônio por classe de ativo (Renda Fixa/CDI, Caixa, Renda Variável, Imóveis) e a evolução progressiva do seu patrimônio líquido nos últimos 12 meses.
        </p>

        <!-- KPI CARDS PATRIMONIAIS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="text-align: center; border-top: 3px solid #10b981;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">💰 Patrimônio Líquido Total</div>
            <div style="font-size: 22px; font-weight: 800; color: ${netWorth >= 0 ? '#10b981' : '#f87171'};">${fmt.currency(netWorth)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Ativos Líquidos - Dívidas</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #3b82f6;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🏦 Total de Ativos / Saldos</div>
            <div style="font-size: 22px; font-weight: 800; color: #60a5fa;">${fmt.currency(totalAssets)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Contas correntes, investimentos, bens</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #ef4444;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">💳 Passivos / Faturas Abertas</div>
            <div style="font-size: 22px; font-weight: 800; color: #f87171;">${fmt.currency(totalLiabilities)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Faturas e saldos devedores</div>
          </div>
        </div>

        <!-- ALOCAÇÃO DE ATIVOS POR CLASSE -->
        <div class="card" style="margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; flex-wrap:wrap; gap:8px;">
            <h3 style="font-size: 14.5px; font-weight: 700; margin: 0; display:flex; align-items:center; gap:8px;">
              <span>🛡️</span> Alocação de Ativos & Diversificação
            </h3>
            <span style="font-size: 12px; color: var(--text-muted);">
              ${alloc?.diversificationDiagnosis ? `💡 <em>${alloc.diversificationDiagnosis}</em>` : ''}
            </span>
          </div>

          ${dist.length === 0 ? '<div style="color:var(--text-muted);font-size:12.5px;padding:16px;text-align:center">Nenhuma conta com saldo positivo registrada.</div>' : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
              ${dist.map(d => `
                <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); border-left: 3px solid ${d.color};">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                    <span style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">${d.icon} ${d.name}</span>
                    <span style="font-size: 12px; font-weight: 800; color: ${d.color};">${d.percentage}%</span>
                  </div>
                  <div style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${fmt.currency(d.amount)}</div>
                  <div style="height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-top: 8px;">
                    <div style="height: 100%; width: ${d.percentage}%; background: ${d.color}; border-radius: 3px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- GRÁFICO HISTÓRICO DE EVOLUÇÃO -->
        <div class="card">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">📈 Evolução do Patrimônio Líquido (12 Meses)</h3>
          <div class="chart-card" style="height:300px"><canvas id="chart-patrimony"></canvas></div>
        </div>
      `;

      if (State.charts.patrimony) State.charts.patrimony.destroy();
      const vals = (data || []).map(d => d.net);
      State.charts.patrimony = new Chart(document.getElementById('chart-patrimony'), { 
        type: 'line', 
        data: { 
          labels: (data || []).map(d => d.month), 
          datasets: [{ 
            label: 'Patrimônio Líquido', 
            data: vals, 
            borderColor: '#10b981', 
            backgroundColor: 'rgba(16,185,129,0.1)', 
            fill: true, 
            tension: 0.4, 
            pointBackgroundColor: '#10b981', 
            pointRadius: 4 
          }] 
        }, 
        options: chartOptions('bar') 
      });
    } else if (tab === 'forecast') {
      const forecast = await window.api.reports.getPredictiveCashflow({
        userId: State.user.id,
        days: 30
      });

      const timeline = forecast?.timeline || [];
      const hasNegative = forecast?.hasNegativeRisk;

      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #8b5cf6; border-radius: var(--radius-sm);">
          💡 <strong>Projeção Preditiva de Saldo Futuro (30 Dias):</strong> Acompanhe a estimativa diária do seu saldo combinando saldos bancários atuais, receitas agendadas, despesas recorrentes programadas e faturas de cartão de crédito que vencerão no período.
        </p>

        <!-- KPI CARDS PROJEÇÃO -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="text-align: center; border-top: 3px solid #3b82f6;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🏦 Saldo Líquido Inicial</div>
            <div style="font-size: 22px; font-weight: 800; color: #60a5fa;">${fmt.currency(forecast.initialBalance || 0)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Contas correntes e dinheiro</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid ${hasNegative ? '#ef4444' : '#10b981'};">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📉 Menor Saldo Projetado</div>
            <div style="font-size: 22px; font-weight: 800; color: ${hasNegative ? '#f87171' : '#34d399'};">${fmt.currency(forecast.minProjectedBalance || 0)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${hasNegative ? `⚠️ Risco em ${fmt.date(forecast.firstNegativeDate)}` : '🟢 Saldo sempre positivo'}</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #10b981;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🎯 Saldo Projetado (30 Dias)</div>
            <div style="font-size: 22px; font-weight: 800; color: ${forecast.finalProjectedBalance >= 0 ? '#10b981' : '#f87171'};">${fmt.currency(forecast.finalProjectedBalance || 0)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Posição final prevista</div>
          </div>
        </div>

        <!-- RÉGUA CRONOLÓGICA DIÁRIA -->
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">📅 Régua Diária de Projeção (Próximos 30 Dias)</h3>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px;">
            ${timeline.map(item => `
              <div style="flex: 0 0 95px; padding: 10px 8px; border-radius: 8px; background: ${item.isNegative ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${item.isNegative ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)'}; text-align: center;">
                <div style="font-size: 10.5px; color: var(--text-muted); text-transform: uppercase;">${item.dayOfWeek}</div>
                <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 3px 0;">${item.date.split('-')[2]}/${item.date.split('-')[1]}</div>
                <div style="font-size: 12px; font-weight: 800; color: ${item.isNegative ? '#f87171' : '#34d399'};">
                  ${fmt.currency(item.projectedBalance)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- GRÁFICO DIÁRIO DE SALDO -->
        <div class="card">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">📈 Gráfico Preditivo do Saldo em Conta</h3>
          <div class="chart-card" style="height:300px"><canvas id="chart-forecast"></canvas></div>
        </div>
      `;

      if (State.charts.forecast) State.charts.forecast.destroy();
      State.charts.forecast = new Chart(document.getElementById('chart-forecast'), {
        type: 'line',
        data: {
          labels: timeline.map(t => `${t.date.split('-')[2]}/${t.date.split('-')[1]}`),
          datasets: [{
            label: 'Saldo Estimado (R$)',
            data: timeline.map(t => t.projectedBalance),
            borderColor: hasNegative ? '#f87171' : '#8b5cf6',
            backgroundColor: hasNegative ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: timeline.map(t => t.isNegative ? '#ef4444' : '#8b5cf6'),
            pointRadius: 4
          }]
        },
        options: chartOptions('line')
      });

    } else if (tab === 'subscriptions') {
      const radar = await window.api.recurring.getSubscriptionRadar(State.user.id);
      const subs = radar?.subscriptions || [];

      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #ec4899; border-radius: var(--radius-sm);">
          💡 <strong>Radar de Assinaturas & Recorrências:</strong> Monitore o custo contínuo e anualizado de todos os serviços de assinatura da sua família (streaming, softwares, academias, planos de saúde), detectando reajustes de mensalidade.
        </p>

        <!-- KPI CARDS ASSINATURAS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="text-align: center; border-top: 3px solid #c084fc;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📱 Total Mensal em Assinaturas</div>
            <div style="font-size: 22px; font-weight: 800; color: #c084fc;">${fmt.currency(radar?.totalMonthly || 0)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${subs.length} assinatura(s) ativas</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #fbbf24;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📅 Custo Total Anualizado</div>
            <div style="font-size: 22px; font-weight: 800; color: #fbbf24;">${fmt.currency(radar?.totalAnnual || 0)}<span style="font-size: 13px;">/ano</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Impacto financeiro em 12 meses</div>
          </div>
        </div>

        <!-- GRID DE ASSINATURAS DETALHADO -->
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">📋 Painel de Serviços Recorrentes</h3>
          ${subs.length === 0 ? '<div style="color:var(--text-muted);font-size:12.5px;padding:16px;text-align:center">Nenhuma assinatura cadastrada no módulo Planejamento.</div>' : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
              ${subs.map(sub => `
                <div style="padding: 12px 14px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 22px;">${sub.category_icon || '📱'}</span>
                    <div>
                      <div style="font-weight: 700; font-size: 13px; color: var(--text-primary);">${sub.name}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">Dia ${sub.due_day || '—'} • ${fmt.currency(sub.annual_cost)}/ano</div>
                      ${sub.price_change_alert ? `<div style="font-size: 10.5px; color: #f87171; font-weight: 600; margin-top: 2px;">⚠️ ${sub.price_change_alert}</div>` : ''}
                    </div>
                  </div>
                  <div style="font-weight: 800; font-size: 14px; color: var(--text-primary);">
                    ${fmt.currency(sub.monthly_amount)}/mês
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;

    } else if (tab === 'interest') {
      const audit = await window.api.reports.getInterestAudit({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }) || {};
      const summary = audit.summary || {};
      const totalPenalty = Number(summary.totalPenalty ?? summary.total_penalty ?? 0);
      const totalDiscount = Number(summary.totalDiscount ?? summary.total_discount ?? 0);
      const penaltyCount = Number(summary.penaltyCount ?? summary.count_late_paid ?? 0);
      const discountCount = Number(summary.discountCount ?? summary.count_discounted ?? 0);
      const avgDaysLate = Number(summary.avgDaysLate ?? summary.avg_days_late ?? 0);
      const avgDailyRate = Number(summary.avgDailyRate ?? summary.avg_daily_rate ?? 0);

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
            <div style="font-size: 22px; font-weight: 800; color: #f87171;">${fmt.currency(totalPenalty)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${penaltyCount} pagamento(s) com acréscimo</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #10b981;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">🏷️ Total de Descontos Obtidos</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-light);">${fmt.currency(totalDiscount)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${discountCount} pagamento(s) com desconto</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #f59e0b;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📅 Média de Dias de Atraso</div>
            <div style="font-size: 22px; font-weight: 800; color: #fbbf24;">${avgDaysLate.toFixed(1)} <span style="font-size: 13px; font-weight: 600;">dias</span></div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Tempo médio de atraso pago</div>
          </div>
          <div class="card" style="text-align: center; border-top: 3px solid #06b6d4;">
            <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">📈 Taxa Média de Juros Diária</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">${avgDailyRate.toFixed(3)}% <span style="font-size: 13px; font-weight: 600;">a.d.</span></div>
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
                  const pct = totalPenalty > 0 ? (((c.total_penalty || 0) / totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>${c.category_icon || '📁'} <strong>${c.category_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${c.count || 0}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(c.total_penalty || 0)} <span style="font-size:11px;color:var(--text-muted)">(${pct}%)</span></span>
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
                  const sName = s.supplier || s.description || 'Diversos';
                  const pct = totalPenalty > 0 ? (((s.total_penalty || 0) / totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span><strong style="color:var(--text-primary)">${idx + 1}. ${sName}</strong> <span style="color:var(--text-muted);font-size:11px">(${s.count || 0}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(s.total_penalty || 0)}</span>
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
                  const pct = totalPenalty > 0 ? (((a.total_penalty || 0) / totalPenalty) * 100).toFixed(1) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                        <span>💳 <strong>${a.account_name}</strong> <span style="color:var(--text-muted);font-size:11px">(${a.count || 0}x)</span></span>
                        <span style="font-weight: 700; color: #f87171;">${fmt.currency(a.total_penalty || 0)}</span>
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
                    const isPenalty = (t.penalty_amount || 0) > 0;
                    const isDiscount = (t.discount_amount || 0) > 0;
                    const diffDays = t.days_late ?? t.daysLate ?? 0;
                    let delayLabel = '—';
                    if (diffDays > 0) delayLabel = `<span style="color:#f87171;font-weight:700">+${diffDays}d atraso</span>`;
                    else if (diffDays < 0) delayLabel = `<span style="color:var(--accent-light);font-weight:700">${Math.abs(diffDays)}d antecip.</span>`;
                    else delayLabel = `<span style="color:var(--text-muted)">no dia</span>`;

                    const baseVal = t.base_amount ?? t.amount ?? 0;
                    const netVal = t.net_amount ?? t.net_paid ?? (baseVal + (t.penalty_amount || 0) - (t.discount_amount || 0));
                    const rateVal = t.daily_rate_pct ?? t.daily_interest_pct ?? 0;

                    return `
                      <tr>
                        <td style="color:var(--text-muted)">${fmt.date(t.due_date || t.date)}</td>
                        <td style="font-weight:600;color:var(--text-primary)">${fmt.date(t.payment_date || t.date)}</td>
                        <td>${delayLabel}</td>
                        <td style="font-weight:600">${t.description || '—'}</td>
                        <td>${t.category_icon || ''} ${t.category_name || '—'}</td>
                        <td>${t.account_name || '—'}</td>
                        <td class="text-right" style="color:var(--text-muted)">${fmt.currency(baseVal)}</td>
                        <td class="text-right" style="font-weight:700;color:${isPenalty ? '#f87171' : (isDiscount ? 'var(--accent-light)' : 'var(--text-muted)')}">
                          ${isPenalty ? `+${fmt.currency(t.penalty_amount)}` : (isDiscount ? `-${fmt.currency(t.discount_amount)}` : 'R$ 0,00')}
                        </td>
                        <td class="text-right" style="font-size:12px;color:${isPenalty ? '#fbbf24' : 'var(--text-muted)'}">
                          ${isPenalty && rateVal ? `${rateVal.toFixed(3)}% a.d.` : '—'}
                        </td>
                        <td class="text-right" style="font-weight:800;color:var(--text-primary)">${fmt.currency(netVal)}</td>
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