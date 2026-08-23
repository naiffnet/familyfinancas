/**
 * GOALS VIEW MODULE
 * Gestão de metas financeiras, cofrinhos e aportes.
 */

import { State } from '../core/state.js';
import { fmt } from '../utils/formatters.js';
import { toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { COLORS } from '../utils/bankLogos.js';
import { escapeHtml } from '../utils/sanitizer.js';

export async function renderGoals() {
  const page = document.getElementById('page-goals');
  if (!page) return;

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
        <div class="goal-icon">${g.icon || '🎯'}</div>
        <div class="goal-name">${escapeHtml(g.name)}</div>
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
    <div class="form-group"><label>Nome</label><input type="text" id="goal-name" placeholder="Ex: Reserva de emergência, Viagem..." value="${escapeHtml(goal?.name || '')}"></div>
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
  if (!goal) return;
  Modal.open(`Aporte — ${goal.icon} ${escapeHtml(goal.name)}`, `
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

export default { renderGoals };
