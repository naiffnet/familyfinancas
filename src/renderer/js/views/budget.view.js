/**
 * BUDGET VIEW MODULE
 * Gestão de orçamentos e tetos de gastos por categoria.
 */

import { State } from '../core/state.js';
import { fmt } from '../utils/formatters.js';
import { toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { escapeHtml } from '../utils/sanitizer.js';

export async function renderBudget(buildPeriodSelector) {
  const page = document.getElementById('page-budget');
  if (!page) return;

  const categories = await window.api.categories.getAll(State.user.id);
  const expCats = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const isAdmin = State.permissions?.can_edit_all === 1;
  let users = [];
  if (isAdmin) {
    users = await window.api.auth.getUsers();
  } else {
    State.budgetUserId = State.user.id;
  }

  const userDropdownHtml = isAdmin ? `
    <select id="budget-user-select" style="padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; outline: none; transition: all var(--transition);">
      ${users.map(u => `<option value="${u.id}" ${u.id === State.budgetUserId ? 'selected' : ''}>🧑‍💻 ${escapeHtml(u.name)}</option>`).join('')}
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

  if (typeof buildPeriodSelector === 'function') {
    const periodContainer = document.getElementById('budget-period');
    if (periodContainer) periodContainer.appendChild(buildPeriodSelector(() => renderBudget(buildPeriodSelector)));
  }
  
  if (isAdmin) {
    const setBudgetBtn = document.getElementById('btn-set-budget');
    if (setBudgetBtn) setBudgetBtn.onclick = () => openBudgetModal(expCats, null, null, () => renderBudget(buildPeriodSelector));
    const selectEl = document.getElementById('budget-user-select');
    if (selectEl) {
      selectEl.onchange = async () => {
        State.budgetUserId = parseInt(selectEl.value);
        await loadBudgets();
      };
    }
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
          <span class="budget-icon">${b.icon || '📦'}</span>
          <div>
            <div class="budget-name">${escapeHtml(b.category_name)}</div>
            ${isExceeded ? '<div style="font-size:11px;color:#f87171;font-weight:600">⚠️ Limite Ultrapassado</div>' : pct >= 80 ? '<div style="font-size:11px;color:var(--warning);font-weight:600">⚡ Quase lá</div>' : '<div style="font-size:11px;color:#10b981;font-weight:600">🟢 Saudável</div>'}
          </div>
          ${isAdmin ? `<button class="btn btn-ghost btn-sm btn-icon btn-edit-budget" data-cat-id="${b.category_id}" data-amount="${b.amount}" style="margin-left:auto">✏️</button>` : ''}
        </div>
        <div class="budget-values"><span>Gasto: <strong style="color:${isExceeded ? '#f87171' : 'var(--text-primary)'}">${fmt.currency(b.spent)}</strong></span><span>Proposto: ${fmt.currency(b.amount)}</span></div>
        <div class="budget-progress-bar"><div class="budget-progress-fill ${progressCls}" style="width:${pct}%"></div></div>
        <div class="budget-percent">${pct.toFixed(0)}% • ${b.amount - b.spent >= 0 ? 'Disponível: ' + fmt.currency(b.amount - b.spent) : 'Excedido: ' + fmt.currency(b.spent - b.amount)}</div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.btn-edit-budget').forEach(btn => {
      btn.onclick = () => {
        const catId = parseInt(btn.dataset.catId);
        const amt = parseFloat(btn.dataset.amount);
        openBudgetModal(null, catId, amt, () => renderBudget(buildPeriodSelector));
      };
    });
  }
}

function openBudgetModal(cats, prefillCatId = null, prefillAmt = null, onSaved) {
  Modal.open('Definir Orçamento Proposto', `
    <div class="form-group">
      <label>Categoria</label>
      ${cats ? `<select id="budget-cat">${cats.map(c => `<option value="${c.id}">${c.icon} ${escapeHtml(c.name)}</option>`).join('')}</select>` : `<input type="text" disabled value="Categoria selecionada" id="budget-cat" data-id="${prefillCatId}">`}
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
    if (typeof onSaved === 'function') onSaved();
  };
}

export default { renderBudget };
