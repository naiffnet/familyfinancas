/* ===
 * deduplication.js — L4719–5079 do app.js
 */

async function openDeduplicationModal() {
  const familyId = State.user.family_id || State.user.familyId || 1;
  const users = await window.api.auth.getUsers().catch(() => []);
  const accounts = await window.api.accounts.getAll(State.user.id).catch(() => []);

  let activeTab = 'pending'; // 'pending' or 'history'
  let filterUser = 'all';
  let filterConfidence = 'all';
  let filterAccount = 'all';

  async function loadData() {
    const duplicates = await window.api.sync.findDuplicates({ familyId, daysWindow: 90, minScore: 65 });
    const history = await window.api.sync.getHistory({ familyId, limit: 50 });
    return { duplicates: duplicates || [], history: history || [] };
  }

  const { duplicates: initialDups, history: initialHistory } = await loadData();

  function renderModalContent(dups, hist) {
    // Apply client-side filters on duplicates
    let filteredDups = dups.filter(d => {
      if (filterConfidence === 'exact' && d.score < 95) return false;
      if (filterConfidence === 'high' && (d.score < 80 || d.score >= 95)) return false;
      if (filterConfidence === 'medium' && d.score >= 80) return false;

      if (filterUser !== 'all') {
        const uId = parseInt(filterUser, 10);
        if (d.tx1.user_id !== uId && d.tx2.user_id !== uId) return false;
      }

      if (filterAccount !== 'all') {
        const accId = parseInt(filterAccount, 10);
        if (d.tx1.account_id !== accId && d.tx2.account_id !== accId) return false;
      }

      return true;
    });

    const exactCount = dups.filter(d => d.score >= 95).length;

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Tab Switcher -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          <button type="button" class="dedup-tab-btn ${activeTab === 'pending' ? 'active' : ''}" id="dedup-tab-pending">
            <span>🔍 Lançamentos Suspeitos</span>
            <span class="badge" style="font-size: 11px; padding: 2px 7px; background: rgba(0,0,0,0.2);">${dups.length}</span>
          </button>
          <button type="button" class="dedup-tab-btn ${activeTab === 'history' ? 'active' : ''}" id="dedup-tab-history">
            <span>📜 Histórico de Conciliações</span>
            <span class="badge" style="font-size: 11px; padding: 2px 7px; background: rgba(0,0,0,0.2);">${hist.length}</span>
          </button>
        </div>

        ${activeTab === 'pending' ? `
          <!-- Filters & Batch Actions Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <select id="filter-dedup-user" class="dedup-filter-select">
                <option value="all">👥 Todos os Membros</option>
                ${users.map(u => `<option value="${u.id}" ${filterUser == u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>

              <select id="filter-dedup-confidence" class="dedup-filter-select">
                <option value="all" ${filterConfidence === 'all' ? 'selected' : ''}>🎯 Todos os Níveis</option>
                <option value="exact" ${filterConfidence === 'exact' ? 'selected' : ''}>🟢 Altíssima Certeza (95-100%)</option>
                <option value="high" ${filterConfidence === 'high' ? 'selected' : ''}>🟡 Provável (80-94%)</option>
                <option value="medium" ${filterConfidence === 'medium' ? 'selected' : ''}>🔵 Suspeito (65-79%)</option>
              </select>

              <select id="filter-dedup-account" class="dedup-filter-select">
                <option value="all">🏦 Todas as Contas</option>
                ${accounts.map(a => `<option value="${a.id}" ${filterAccount == a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; gap: 8px;">
              ${exactCount > 0 ? `
                <button type="button" class="btn btn-sm" id="btn-batch-exact-merge" style="background: #10b981; color: #000; font-weight: 700; border-color: #10b981; padding: 6px 12px;">
                  ⚡ Mesclar Certezas (${exactCount})
                </button>
              ` : ''}
              <button type="button" class="btn btn-sm btn-primary" id="btn-batch-selected-merge" style="padding: 6px 12px;" disabled>
                🔗 Mesclar Selecionados (<span id="selected-dup-count">0</span>)
              </button>
            </div>
          </div>

          <!-- List of Duplicates -->
          ${filteredDups.length === 0 ? `
            <div style="text-align: center; padding: 36px 10px; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px dashed var(--border);">
              <div style="font-size: 40px; margin-bottom: 8px;">✨</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--accent-light);">Nenhuma Duplicidade Pendente!</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                ${dups.length > 0 ? 'Nenhum lançamento corresponde aos filtros selecionados acima.' : 'Todos os lançamentos do grupo familiar estão devidamente conciliados.'}
              </div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
              ${filteredDups.map((dup, idx) => {
                const t1 = dup.tx1;
                const t2 = dup.tx2;
                let badgeClass = 'dedup-badge-medium';
                let badgeText = `🔵 Suspeito (${dup.score}%)`;
                if (dup.score >= 95) {
                  badgeClass = 'dedup-badge-exact';
                  badgeText = `🟢 Altíssima Certeza (${dup.score}%)`;
                } else if (dup.score >= 80) {
                  badgeClass = 'dedup-badge-high';
                  badgeText = `🟡 Provável (${dup.score}%)`;
                }

                return `
                  <div class="card dedup-pair-card" style="border: 1px solid var(--border); background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--border); padding-bottom: 8px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" class="chk-dup-pair" data-pair-idx="${idx}" data-primary-id="${t1.id}" data-dup-id="${t2.id}" style="width: 16px; height: 16px; cursor: pointer;">
                        <span class="badge ${badgeClass}" style="font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 12px;">
                          ${badgeText}
                        </span>
                      </div>
                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">Par #${idx + 1}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                      <!-- Lançamento 1 -->
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                          <span>Lançamento A</span>
                          <span class="badge" style="font-size: 9px; padding: 1px 5px;">${t1.is_paid ? '✅ Pago' : '⏳ Pendente'}</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${t1.description || 'Sem descrição'}</div>
                        <div style="font-size: 14px; font-weight: 800; color: ${t1.type === 'expense' ? '#f87171' : 'var(--accent-light)'}; margin-bottom: 6px;">
                          ${fmt.currency(t1.amount)}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">📅 Data: <strong>${fmt.date(t1.date)}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">👤 Autor: <strong>${t1.user_name || 'Usuário'}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">🏦 Conta: <strong>${t1.account_name || 'Não informada'}</strong></div>
                      </div>

                      <!-- Lançamento 2 -->
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                          <span>Lançamento B</span>
                          <span class="badge" style="font-size: 9px; padding: 1px 5px;">${t2.is_paid ? '✅ Pago' : '⏳ Pendente'}</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${t2.description || 'Sem descrição'}</div>
                        <div style="font-size: 14px; font-weight: 800; color: ${t2.type === 'expense' ? '#f87171' : 'var(--accent-light)'}; margin-bottom: 6px;">
                          ${fmt.currency(t2.amount)}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">📅 Data: <strong>${fmt.date(t2.date)}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">👤 Autor: <strong>${t2.user_name || 'Usuário'}</strong></div>
                        <div style="font-size: 11px; color: var(--text-muted);">🏦 Conta: <strong>${t2.account_name || 'Não informada'}</strong></div>
                      </div>
                    </div>

                    <!-- Ações -->
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                      <button type="button" class="btn btn-secondary btn-sm btn-dismiss-dup" data-primary-id="${t1.id}" data-dup-id="${t2.id}">
                        ➕ Manter Ambos (Gastos Separados)
                      </button>
                      <button type="button" class="btn btn-primary btn-sm btn-merge-dup" data-primary-id="${t1.id}" data-dup-id="${t2.id}">
                        🔗 Mesclar em 1 Lançamento
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        ` : `
          <!-- History Tab -->
          ${hist.length === 0 ? `
            <div style="text-align: center; padding: 36px 10px; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px dashed var(--border);">
              <div style="font-size: 40px; margin-bottom: 8px;">📜</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary);">Nenhum Histórico de Conciliação</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                As ações de mesclagem e descarte de duplicatas realizadas pela família ficarão registradas aqui para auditoria.
              </div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
              ${hist.map(h => {
                const isMerged = h.status === 'merged';
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); gap: 12px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span class="badge" style="font-size: 10px; font-weight: 700; background: ${isMerged ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'}; color: ${isMerged ? '#10b981' : 'var(--text-muted)'}; border: 1px solid ${isMerged ? '#10b98144' : 'var(--border)'}">
                          ${isMerged ? '🔗 Mesclado' : '➕ Mantido Separado'}
                        </span>
                        <span style="font-size: 11px; color: var(--text-muted);">${fmt.time(h.updated_at)} • ${fmt.date(h.updated_at)}</span>
                      </div>
                      <div style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">
                        <strong>${h.tx1_desc || 'Lançamento A'}</strong> (${fmt.currency(h.tx1_amount)}) 
                        &nbsp;↔&nbsp; 
                        <strong>${h.tx2_desc || 'Lançamento B'}</strong> (${fmt.currency(h.tx2_amount)})
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `}
      </div>
    `;
  }

  function bindEvents(currentDups, currentHist) {
    const modalEl = document.getElementById('modal-content');
    if (!modalEl) return;

    // Tabs
    const tabPending = modalEl.querySelector('#dedup-tab-pending');
    const tabHistory = modalEl.querySelector('#dedup-tab-history');

    if (tabPending) {
      tabPending.onclick = () => {
        activeTab = 'pending';
        refreshUI();
      };
    }
    if (tabHistory) {
      tabHistory.onclick = () => {
        activeTab = 'history';
        refreshUI();
      };
    }

    // Filter changes
    const userSelect = modalEl.querySelector('#filter-dedup-user');
    const confSelect = modalEl.querySelector('#filter-dedup-confidence');
    const accSelect = modalEl.querySelector('#filter-dedup-account');

    if (userSelect) userSelect.onchange = () => { filterUser = userSelect.value; refreshUI(); };
    if (confSelect) confSelect.onchange = () => { filterConfidence = confSelect.value; refreshUI(); };
    if (accSelect) accSelect.onchange = () => { filterAccount = accSelect.value; refreshUI(); };

    // Checkboxes selection
    const chks = modalEl.querySelectorAll('.chk-dup-pair');
    const batchSelectedBtn = modalEl.querySelector('#btn-batch-selected-merge');
    const selectedCountSpan = modalEl.querySelector('#selected-dup-count');

    const updateSelectionState = () => {
      const selected = Array.from(chks).filter(c => c.checked);
      if (selectedCountSpan) selectedCountSpan.textContent = selected.length;
      if (batchSelectedBtn) batchSelectedBtn.disabled = selected.length === 0;
    };

    chks.forEach(chk => {
      chk.onchange = updateSelectionState;
    });

    // Batch Exact Merge (100% / 95%+)
    const batchExactBtn = modalEl.querySelector('#btn-batch-exact-merge');
    if (batchExactBtn) {
      batchExactBtn.onclick = async () => {
        const exactPairs = currentDups.filter(d => d.score >= 95).map(d => ({
          primaryTxId: d.tx1.id,
          duplicateTxId: d.tx2.id
        }));

        if (exactPairs.length === 0) return;
        batchExactBtn.disabled = true;
        batchExactBtn.textContent = 'Mesclando...';

        const res = await window.api.sync.mergeBatch({ pairs: exactPairs, userId: State.user.id });
        if (res && res.success) {
          toast(`⚡ ${res.mergedCount} pares com 100% de certeza mesclados com sucesso!`);
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast('Erro ao mesclar em lote', 'error');
          batchExactBtn.disabled = false;
        }
      };
    }

    // Batch Selected Merge
    if (batchSelectedBtn) {
      batchSelectedBtn.onclick = async () => {
        const selected = Array.from(chks).filter(c => c.checked);
        const pairs = selected.map(c => ({
          primaryTxId: parseInt(c.dataset.primaryId),
          duplicateTxId: parseInt(c.dataset.dupId)
        }));

        if (pairs.length === 0) return;
        batchSelectedBtn.disabled = true;
        batchSelectedBtn.textContent = 'Mesclando...';

        const res = await window.api.sync.mergeBatch({ pairs, userId: State.user.id });
        if (res && res.success) {
          toast(`🔗 ${res.mergedCount} pares mesclados com sucesso!`);
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast('Erro ao mesclar selecionados', 'error');
          batchSelectedBtn.disabled = false;
        }
      };
    }

    // Individual Merge
    modalEl.querySelectorAll('.btn-merge-dup').forEach(btn => {
      btn.onclick = async () => {
        const primaryTxId = parseInt(btn.dataset.primaryId);
        const duplicateTxId = parseInt(btn.dataset.dupId);
        btn.disabled = true;
        btn.textContent = 'Mesclando...';
        const res = await window.api.sync.mergeTransactions({ primaryTxId, duplicateTxId, userId: State.user.id });
        if (res && res.success) {
          toast('Lançamentos mesclados com sucesso!');
          const refreshed = await loadData();
          refreshUI(refreshed.duplicates, refreshed.history);
          if (State.currentPage === 'dashboard') renderDashboard();
          else if (State.currentPage === 'recurring') renderRecurring();
        } else {
          toast(res?.error || 'Erro ao mesclar lançamentos', 'error');
          btn.disabled = false;
          btn.textContent = '🔗 Mesclar em 1 Lançamento';
        }
      };
    });

    // Individual Dismiss
    modalEl.querySelectorAll('.btn-dismiss-dup').forEach(btn => {
      btn.onclick = async () => {
        const primaryTxId = parseInt(btn.dataset.primaryId);
        const duplicateTxId = parseInt(btn.dataset.dupId);
        btn.disabled = true;
        await window.api.sync.dismissDuplicate({ primaryTxId, duplicateTxId });
        toast('Lançamentos mantidos como despesas separadas.');
        const refreshed = await loadData();
        refreshUI(refreshed.duplicates, refreshed.history);
      };
    });
  }

  let currentDuplicates = initialDups;
  let currentHistory = initialHistory;

  function refreshUI(newDups, newHist) {
    if (newDups) currentDuplicates = newDups;
    if (newHist) currentHistory = newHist;
    const bodyHtml = renderModalContent(currentDuplicates, currentHistory);
    Modal.open('🛡️ Central de Conciliação & Anti-Duplicidade', bodyHtml, true);
    bindEvents(currentDuplicates, currentHistory);
  }

  refreshUI();
}

// ════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════