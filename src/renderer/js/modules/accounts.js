/* ===
 * accounts.js — L4014–4718 do app.js
 */

async function renderAccounts() {
  const page = document.getElementById('page-accounts');
  const [accounts, summary, txs] = await Promise.all([
    window.api.accounts.getAll(State.user.id),
    window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
    window.api.transactions.getAll({
      userId: State.user.id,
      month: State.currentMonth,
      year: State.currentYear
    })
  ]);
  const cardSpending = summary.cardSpending || {};

  const bankAccounts = accounts.filter(a => a.type !== 'credit' && a.type !== 'voucher');
  const voucherAccounts = accounts.filter(a => a.type === 'voucher');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  page.innerHTML = `
    <div class="page-header" style="align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="page-title">Contas & Cartões</h2>
        <p class="page-subtitle">Gerencie suas contas bancárias, cartões de benefício e cartões de crédito</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-import-statement" style="display:flex;align-items:center;gap:6px"><span>📥</span> Importar Extrato (OFX / CSV)</button>
        <button class="btn btn-primary" id="btn-new-account">+ Nova conta / cartão</button>
      </div>
    </div>

    ${accounts.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <div class="empty-title">Nenhuma conta ou cartão cadastrado</div>
        <div class="empty-desc">Adicione sua conta corrente, poupança, cartão benefício ou cartão de crédito</div>
      </div>
    ` : `
      <!-- 🏦 SEÇÃO 1: CONTAS BANCÁRIAS (Diferença entre Receitas e Despesas do mês) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🏦 Contas Bancárias & Carteiras <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Diferença entre Receitas e Despesas do mês)</span>
        </h3>
        <div class="accounts-grid">
          ${bankAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhuma conta corrente ou carteira cadastrada.</div>
          ` : bankAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            
            // Calculate dynamic month balance (receitas - despesas - transferencias)
            const incomes = txs.filter(t => t.account_id === acc.id && t.type === 'income' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const expenses = txs.filter(t => t.account_id === acc.id && t.type === 'expense' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const transfersOut = txs.filter(t => t.account_id === acc.id && t.type === 'transfer' && t.is_paid === 1).reduce((sum, t) => sum + t.amount, 0);
            const monthlyDiff = incomes - expenses - transfersOut;

            return `
              <div class="account-card">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type]}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Saldo do mês</div>
                <div class="account-balance" style="color:${monthlyDiff >= 0 ? 'var(--accent-light)' : '#f87171'}">${fmt.currency(monthlyDiff)}</div>
                ${acc.agency ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : ''}
                
                ${(acc.overdraft_limit > 0 || acc.banricompras_limit > 0 || acc.credit_minuto_limit > 0) ? `
                  <div style="margin-top: 10px; margin-bottom: 10px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border);">
                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
                      📋 Limites da Conta
                    </div>
                    ${acc.overdraft_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span style="color: var(--text-muted);">🔴 Cheque Especial:</span>
                      <span style="font-weight: 600; color: var(--text-primary);">${fmt.currency(acc.overdraft_limit)}</span>
                    </div>` : ''}
                    ${acc.banricompras_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span style="color: var(--text-muted);">🛍️ Banricompras:</span>
                      <span style="font-weight: 600; color: #fbbf24;">${fmt.currency(acc.banricompras_available)} / ${fmt.currency(acc.banricompras_limit)}</span>
                    </div>` : ''}
                    ${acc.credit_minuto_limit > 0 ? `
                    <div style="font-size: 11px; display: flex; justify-content: space-between;">
                      <span style="color: var(--text-muted);">⚡ Crédito Minuto:</span>
                      <span style="font-weight: 600; color: #60a5fa;">${fmt.currency(acc.credit_minuto_limit)}</span>
                    </div>` : ''}
                  </div>
                ` : ''}

                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 🎟️ SEÇÃO 2: CARTÕES BENEFÍCIO & VOUCHERS -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🎟️ Cartões Benefício & Vouchers <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Alimentação, Refeição, Mobilidade e Multibenefícios)</span>
        </h3>
        <div class="accounts-grid">
          ${voucherAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhum cartão benefício cadastrado. Clique em "+ Nova conta / cartão" para adicionar.</div>
          ` : voucherAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            const benefitLabel = BENEFIT_TYPES[acc.benefit_type] || 'Cartão Benefício';

            return `
              <div class="account-card">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge" style="background:${b.color}22;color:${b.color};border:1px solid ${b.color}44">${benefitLabel}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Saldo Atual no Cartão</div>
                <div class="account-balance" style="color:var(--accent-light)">${fmt.currency(acc.balance || 0)}</div>
                
                <div style="margin-top: 10px; margin-bottom: 12px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border);">
                  <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">🏢 Recarga Mensal:</span>
                    <span style="font-weight: 700; color: var(--text-primary);">${acc.benefit_monthly_credit ? fmt.currency(acc.benefit_monthly_credit) : 'Não informada'}</span>
                  </div>
                  <div style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">📅 Dia da Recarga:</span>
                    <span style="font-weight: 600; color: var(--text-secondary);">Todo dia ${acc.benefit_credit_day || 1}</span>
                  </div>
                  ${acc.card_last_digits ? `
                  <div style="font-size: 11px; display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">💳 Final do Cartão:</span>
                    <span style="font-weight: 700; color: var(--accent-light);">•••• ${acc.card_last_digits}</span>
                  </div>` : ''}
                </div>

                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 💳 SEÇÃO 3: LIMITES DE CARTÕES (Fatura do período e limites disponíveis) -->
      <div style="margin-top: 32px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          💳 Limites de Cartões de Crédito <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Fatura do período e limites disponíveis)</span>
        </h3>
        <div class="accounts-grid">
          ${creditAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhum cartão de crédito cadastrado.</div>
          ` : creditAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            
            const spent = cardSpending[acc.id] || 0;
            const available = (acc.credit_limit || 0) - spent;
            const isExceeded = (acc.credit_limit || 0) > 0 && spent > (acc.credit_limit || 0);

            return `
              <div class="account-card" style="${isExceeded ? 'border: 1px solid rgba(239, 68, 68, 0.4);' : ''}">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${isExceeded ? '#ef4444' : b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  ${bankLogo(acc.bank, 36)}
                  <div>
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type]}</div>
                    <div class="account-name" style="margin:0;font-size:14px;display:flex;align-items:center">
                      ${acc.name}${userBadge}${lockIcon}
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                  <div>
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;" title="Soma das faturas abertas + todas as parcelas futuras que consom o limite">Comprometido Total</div>
                    <div style="font-size:16px;font-weight:700;color:#f87171;">${fmt.currency(spent)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">${isExceeded ? 'Excedido / Negativo' : 'Disponível'}</div>
                    <div style="font-size:16px;font-weight:700;color:${isExceeded ? '#f87171' : 'var(--accent-light)'};">${fmt.currency(available)}</div>
                  </div>
                </div>

                ${isExceeded ? `
                <div style="margin-bottom:10px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px">
                  <span>⚠️</span> Limite estourado em ${fmt.currency(Math.abs(available))}
                </div>` : ''}

                <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;text-transform:uppercase;font-weight:600;letter-spacing:0.02em;">Limite total</div>
                <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-secondary);">${fmt.currency(acc.credit_limit)}</div>
                
                <div style="font-size:11px;color:var(--text-muted);margin-top:6px;margin-bottom:12px;">Fecha dia ${acc.closing_day || '—'} • Vence dia ${acc.due_day || '—'}</div>
                <div class="account-actions">
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}">✏️ Editar</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed; width: 100%;">🔒 Apenas Leitura</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `}
    ${accounts.length > 1 ? `<div style="margin-top:16px"><button class="btn btn-secondary" id="btn-transfer">🔄 Transferência entre contas</button></div>` : ''}
  `;

  // Bind edit & delete buttons
  page.querySelectorAll('.acc-edit').forEach(btn => {
    btn.onclick = () => {
      const acc = accounts.find(a => a.id === parseInt(btn.dataset.id));
      openAccountModal(acc);
    };
  });
  page.querySelectorAll('.acc-delete').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id);
      const acc = accounts.find(a => a.id === id);
      const confirmDelete = await Modal.confirm(`Excluir conta "${acc?.name}"?`);
      if (confirmDelete) {
        await window.api.accounts.delete(id);
        toast('Conta excluída com sucesso');
        renderAccounts();
      }
    };
  });

  const btnNewAccount = page.querySelector('#btn-new-account');
  if (btnNewAccount) btnNewAccount.onclick = () => openAccountModal();

  const btnImportStatement = page.querySelector('#btn-import-statement');
  if (btnImportStatement) btnImportStatement.onclick = () => openImportStatementModal(accounts);
  const btnTransfer = document.getElementById('btn-transfer');
  if (btnTransfer) btnTransfer.onclick = () => openTransferModal(accounts);
}

async function openAccountModal(acc) {
  const isEdit = !!acc;
  if (isEdit) {
    const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
    if (!canEdit) {
      toast('Você não tem permissão para editar esta conta', 'error');
      return;
    }
  }
  const users = await window.api.auth.getUsers();

  Modal.open(isEdit ? 'Editar Conta / Cartão' : 'Nova Conta / Cartão', `
    <div class="form-group">
      <label>Nome de Identificação</label>
      <input type="text" id="acc-name" placeholder="Ex: Flash Jenny, VR Banrisul, Nubank..." value="${acc?.name || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo de Conta / Cartão</label>
        <select id="acc-type">
          ${Object.entries(ACCOUNT_TYPES).map(([v,l]) => `<option value="${v}" ${acc?.type === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Banco / Operadora</label>
        <select id="acc-bank">
          ${Object.entries(BANKS).map(([v,b]) => `<option value="${v}" ${acc?.bank === v ? 'selected' : ''}>${b.emoji} ${b.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Perfil / Titular</label>
      <select id="acc-user-id">
        ${users.map(u => `<option value="${u.id}" ${(acc ? acc.user_id : State.user.id) === u.id ? 'selected' : ''}>${u.name} (@${u.username})</option>`).join('')}
      </select>
    </div>

    <!-- 🏦 CAMPOS ESPECÍFICOS PARA CONTA CORRENTE / POUPANÇA / CARTEIRA -->
    <div id="acc-debit-fields" style="${(acc?.type === 'credit' || acc?.type === 'voucher') ? 'display:none' : ''}">
      <div class="form-row">
        <div class="form-group">
          <label>Saldo inicial (R$)</label>
          <input type="number" id="acc-balance" step="0.01" placeholder="0,00" value="${acc?.balance || 0}">
        </div>
        <div class="form-group">
          <label>Agência</label>
          <input type="text" id="acc-agency" placeholder="0001" value="${acc?.agency || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Número da conta</label>
        <input type="text" id="acc-account-number" placeholder="00000-0" value="${acc?.account_number || ''}">
      </div>

      <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
          📋 Limites Integrados da Conta (Opcional)
        </div>
        <div class="form-row">
          <div class="form-group">
            <label style="font-size: 12px;">🔴 Cheque Especial (R$)</label>
            <input type="number" id="acc-overdraft" step="0.01" min="0" placeholder="0,00" value="${acc?.overdraft_limit || ''}">
          </div>
          <div class="form-group">
            <label style="font-size: 12px;">🛍️ Banricompras (R$)</label>
            <input type="number" id="acc-banricompras" step="0.01" min="0" placeholder="0,00" value="${acc?.banricompras_limit || ''}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size: 12px;">⚡ Crédito Minuto (R$)</label>
          <input type="number" id="acc-credit-minuto" step="0.01" min="0" placeholder="0,00" value="${acc?.credit_minuto_limit || ''}">
        </div>
      </div>
    </div>

    <!-- 🎟️ CAMPOS ESPECÍFICOS PARA CARTÃO BENEFÍCIO / VOUCHER -->
    <div id="acc-benefit-fields" style="${acc?.type !== 'voucher' ? 'display:none' : ''}">
      <div class="form-row">
        <div class="form-group">
          <label>Modalidade do Benefício</label>
          <select id="acc-benefit-type">
            ${Object.entries(BENEFIT_TYPES).map(([v,l]) => `<option value="${v}" ${(acc?.benefit_type || 'va') === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Saldo atual no cartão (R$)</label>
          <input type="number" id="acc-benefit-balance" step="0.01" placeholder="0,00" value="${acc?.type === 'voucher' ? (acc?.balance || 0) : ''}">
        </div>
      </div>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label>Recarga mensal (R$)</label>
          <input type="number" id="acc-benefit-credit" step="0.01" placeholder="Ex: 800,00" value="${acc?.benefit_monthly_credit || ''}">
        </div>
        <div class="form-group">
          <label>Dia da recarga</label>
          <input type="number" id="acc-benefit-day" min="1" max="31" placeholder="Dia 01" value="${acc?.benefit_credit_day || 1}">
        </div>
        <div class="form-group">
          <label>Final do Cartão (Opcional)</label>
          <input type="text" id="acc-card-last-digits" maxlength="4" placeholder="Ex: 4321" value="${acc?.card_last_digits || ''}">
        </div>
      </div>
    </div>

    <!-- 💳 CAMPOS ESPECÍFICOS PARA CARTÃO DE CRÉDITO -->
    <div id="acc-credit-fields" style="${acc?.type !== 'credit' ? 'display:none' : ''}">
      <div class="form-row form-row-3">
        <div class="form-group">
          <label>Limite (R$)</label>
          <input type="number" id="acc-limit" placeholder="0,00" value="${acc?.credit_limit || ''}">
        </div>
        <div class="form-group">
          <label>Fecha dia</label>
          <input type="number" id="acc-closing" min="1" max="31" placeholder="15" value="${acc?.closing_day || ''}">
        </div>
        <div class="form-group">
          <label>Vence dia</label>
          <input type="number" id="acc-due" min="1" max="31" placeholder="22" value="${acc?.due_day || ''}">
        </div>
      </div>
    </div>

    <div class="form-group" style="margin-top:12px">
      <label>Cor de destaque</label>
      <div class="color-picker" id="acc-color-picker">
        ${COLORS.map(c => `<div class="color-swatch ${(acc?.color || '#10b981') === c ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="acc-cancel">Cancelar</button>
      <button class="btn btn-primary" id="acc-save">${isEdit ? 'Salvar' : 'Criar conta / cartão'}</button>
    </div>
  `);

  let selectedColor = acc?.color || '#10b981';
  document.querySelectorAll('#acc-color-picker .color-swatch').forEach(sw => {
    sw.onclick = () => { document.querySelectorAll('#acc-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.classList.add('selected'); selectedColor = sw.dataset.color; };
  });

  const updateFormVisibility = (type) => {
    const isCredit = type === 'credit';
    const isVoucher = type === 'voucher';
    document.getElementById('acc-credit-fields').style.display = isCredit ? '' : 'none';
    document.getElementById('acc-benefit-fields').style.display = isVoucher ? '' : 'none';
    document.getElementById('acc-debit-fields').style.display = (!isCredit && !isVoucher) ? '' : 'none';
  };

  document.getElementById('acc-type').onchange = (e) => updateFormVisibility(e.target.value);

  document.getElementById('acc-cancel').onclick = Modal.close;
  document.getElementById('acc-save').onclick = async () => {
    const name = document.getElementById('acc-name').value.trim();
    if (!name) { toast('Informe o nome', 'error'); return; }

    const type = document.getElementById('acc-type').value;

    let balanceVal = 0;
    if (type === 'voucher') {
      const bVal = parseFloat(document.getElementById('acc-benefit-balance')?.value);
      balanceVal = isNaN(bVal) ? 0 : bVal;
    } else {
      const bVal = parseFloat(document.getElementById('acc-balance')?.value);
      balanceVal = isNaN(bVal) ? 0 : bVal;
    }

    const limitVal = parseFloat(document.getElementById('acc-limit')?.value);
    const closingVal = parseInt(document.getElementById('acc-closing')?.value);
    const dueVal = parseInt(document.getElementById('acc-due')?.value);

    const overdraftVal = parseFloat(document.getElementById('acc-overdraft')?.value);
    const banricomprasVal = parseFloat(document.getElementById('acc-banricompras')?.value);
    const creditMinutoVal = parseFloat(document.getElementById('acc-credit-minuto')?.value);

    const benefitMonthlyCreditVal = parseFloat(document.getElementById('acc-benefit-credit')?.value);
    const benefitCreditDayVal = parseInt(document.getElementById('acc-benefit-day')?.value);
    const cardLastDigitsVal = document.getElementById('acc-card-last-digits')?.value.trim() || null;
    const benefitTypeVal = document.getElementById('acc-benefit-type')?.value || 'va';

    const data = {
      user_id: parseInt(document.getElementById('acc-user-id').value),
      name,
      type,
      bank: document.getElementById('acc-bank').value,
      balance: balanceVal,
      color: selectedColor,
      credit_limit: isNaN(limitVal) ? null : limitVal,
      closing_day: isNaN(closingVal) ? null : closingVal,
      due_day: isNaN(dueVal) ? null : dueVal,
      agency: type === 'voucher' ? null : (document.getElementById('acc-agency')?.value.trim() || null),
      account_number: type === 'voucher' ? null : (document.getElementById('acc-account-number')?.value.trim() || null),
      overdraft_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(overdraftVal) ? 0 : overdraftVal),
      banricompras_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(banricomprasVal) ? 0 : banricomprasVal),
      credit_minuto_limit: (type === 'credit' || type === 'voucher') ? 0 : (isNaN(creditMinutoVal) ? 0 : creditMinutoVal),
      benefit_type: type === 'voucher' ? benefitTypeVal : null,
      benefit_monthly_credit: type === 'voucher' ? (isNaN(benefitMonthlyCreditVal) ? 0 : benefitMonthlyCreditVal) : 0,
      benefit_credit_day: type === 'voucher' ? (isNaN(benefitCreditDayVal) ? 1 : benefitCreditDayVal) : 1,
      card_last_digits: cardLastDigitsVal,
    };

    let res;
    if (isEdit) {
      data.id = acc.id;
      res = await window.api.accounts.update(data);
      if (res && res.error) {
        toast('Erro ao atualizar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta / cartão atualizado com sucesso!');
    } else {
      res = await window.api.accounts.create(data);
      if (res && res.error) {
        toast('Erro ao criar conta: ' + res.error, 'error');
        return;
      }
      toast('Conta / cartão criado com sucesso!');
    }
    Modal.close();
    renderAccounts();
  };
}

function openTransferModal(accounts) {
  Modal.open('Transferência entre Contas', `
    <div class="form-group"><label>Da conta</label><select id="tf-from">${accounts.map(a => `<option value="${a.id}">${a.name} (${fmt.currency(a.balance)})</option>`).join('')}</select></div>
    <div class="form-group"><label>Para a conta</label><select id="tf-to">${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Valor (R$)</label><input type="number" id="tf-amount" step="0.01" min="0" placeholder="0,00"></div>
      <div class="form-group"><label>Data</label><input type="date" id="tf-date" value="${new Date().toISOString().split('T')[0]}"></div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="tf-cancel">Cancelar</button>
      <button class="btn btn-primary" id="tf-save">Transferir</button>
    </div>
  `);
  document.getElementById('tf-cancel').onclick = Modal.close;
  document.getElementById('tf-save').onclick = async () => {
    const from = parseInt(document.getElementById('tf-from').value);
    const to = parseInt(document.getElementById('tf-to').value);
    const amount = parseFloat(document.getElementById('tf-amount').value);
    const date = document.getElementById('tf-date').value;
    if (from === to) { toast('Selecione contas diferentes', 'error'); return; }
    if (!amount || amount <= 0) { toast('Informe o valor', 'error'); return; }
    await window.api.accounts.transfer({ from_account_id: from, to_account_id: to, amount, date, user_id: State.user.id });
    toast('Transferência realizada');
    Modal.close();
    renderAccounts();
  };
}

async function openImportStatementModal(accounts) {
  const debitAccounts = (accounts || []).filter(a => a.type !== 'credit');
  const allCategories = await window.api.categories.getAll(State.user.id);
  let parsedTransactions = [];

  Modal.open('📥 Importar Extrato Bancário (OFX / CSV)', `
    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
      Importe arquivos <code>.ofx</code> ou <code>.csv</code> emitidos pelo seu banco (Nubank, Itaú, Inter, Bradesco, etc.) para conciliar despesas e receitas automaticamente.
    </div>

    <div class="form-row" style="margin-bottom: 14px;">
      <div class="form-group" style="flex: 1;">
        <label style="font-size: 12px; font-weight: 700;">Conta de Destino</label>
        <select id="import-target-account" style="width: 100%; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
          ${debitAccounts.map(a => `<option value="${a.id}">${a.name} (${fmt.currency(a.balance)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="flex: 1;">
        <label style="font-size: 12px; font-weight: 700;">Selecionar Arquivo (.ofx ou .csv)</label>
        <input type="file" id="import-file-input" accept=".ofx,.csv,.txt" style="width: 100%; padding: 6px; font-size: 12px;">
      </div>
    </div>

    <!-- PREVIEW CONTAINER -->
    <div id="import-preview-container" style="display: none; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); padding: 12px; max-height: 320px; overflow-y: auto; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span id="import-count-badge" style="font-weight: 700; color: var(--text-primary); font-size: 12.5px;">0 lançamentos encontrados</span>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-all-import" style="font-size: 11px;">Marcar / Desmarcar Todos</button>
      </div>
      <div id="import-table-wrapper" style="overflow-x: auto;"></div>
    </div>

    <div class="modal-footer" style="padding: 0; border: none; margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn btn-secondary" id="import-cancel">Cancelar</button>
      <button class="btn btn-primary" id="import-confirm" disabled style="opacity: 0.5;">Confirmar Importação (0)</button>
    </div>
  `, true);

  const fileInput = document.getElementById('import-file-input');
  const previewContainer = document.getElementById('import-preview-container');
  const countBadge = document.getElementById('import-count-badge');
  const tableWrapper = document.getElementById('import-table-wrapper');
  const confirmBtn = document.getElementById('import-confirm');
  const toggleAllBtn = document.getElementById('btn-toggle-all-import');

  document.getElementById('import-cancel').onclick = Modal.close;

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const isOfx = file.name.toLowerCase().endsWith('.ofx');
      try {
        let result;
        if (isOfx) {
          result = await window.api.importer.parseOfx(content);
        } else {
          result = await window.api.importer.parseCsv(content);
        }

        parsedTransactions = (result?.transactions || []).map((t, idx) => ({
          ...t,
          id_temp: idx,
          selected: true,
          category_id: (allCategories.find(c => c.name.toLowerCase() === (t.suggestedCategory || '').toLowerCase()) || allCategories[0])?.id || null
        }));

        if (parsedTransactions.length === 0) {
          toast('Nenhuma transação identificada no arquivo.', 'warning');
          return;
        }

        renderPreviewTable();
        previewContainer.style.display = 'block';
        updateConfirmButton();
      } catch (err) {
        console.error('Erro ao ler extrato:', err);
        toast('Erro ao processar arquivo: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  function renderPreviewTable() {
    countBadge.textContent = `${parsedTransactions.length} lançamentos encontrados no extrato`;

    tableWrapper.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted);">
            <th style="padding: 6px 8px; width: 30px;">✓</th>
            <th style="padding: 6px 8px;">Data</th>
            <th style="padding: 6px 8px;">Descrição</th>
            <th style="padding: 6px 8px;">Categoria</th>
            <th style="padding: 6px 8px;">Tipo</th>
            <th style="padding: 6px 8px; text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parsedTransactions.map(t => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${t.selected ? 'transparent' : 'rgba(0,0,0,0.2)'}; opacity: ${t.selected ? '1' : '0.5'};">
              <td style="padding: 6px 8px;">
                <input type="checkbox" class="import-chk" data-idx="${t.id_temp}" ${t.selected ? 'checked' : ''}>
              </td>
              <td style="padding: 6px 8px; white-space: nowrap; color: var(--text-muted);">${fmt.date(t.date)}</td>
              <td style="padding: 6px 8px; font-weight: 500;">
                <input type="text" class="import-desc-edit" data-idx="${t.id_temp}" value="${(t.description || '').replace(/"/g, '&quot;')}" style="background: transparent; border: 1px solid transparent; color: var(--text-primary); width: 100%; font-size: 12px;">
              </td>
              <td style="padding: 6px 8px;">
                <select class="import-cat-select" data-idx="${t.id_temp}" style="padding: 3px 6px; font-size: 11px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);">
                  ${allCategories.map(c => `<option value="${c.id}" ${c.id === t.category_id ? 'selected' : ''}>${c.icon || ''} ${c.name}</option>`).join('')}
                </select>
              </td>
              <td style="padding: 6px 8px;">
                <span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}" style="font-size: 10px;">${t.type === 'income' ? 'Receita' : 'Despesa'}</span>
              </td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 700; color: ${t.type === 'income' ? 'var(--accent-light)' : '#f87171'};">
                ${t.type === 'income' ? '+' : '-'}${fmt.currency(t.amount)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableWrapper.querySelectorAll('.import-chk').forEach(chk => {
      chk.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].selected = e.target.checked;
        renderPreviewTable();
        updateConfirmButton();
      };
    });

    tableWrapper.querySelectorAll('.import-desc-edit').forEach(input => {
      input.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].description = e.target.value.trim();
      };
    });

    tableWrapper.querySelectorAll('.import-cat-select').forEach(sel => {
      sel.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].category_id = parseInt(e.target.value);
      };
    });
  }

  function updateConfirmButton() {
    const selectedCount = parsedTransactions.filter(t => t.selected).length;
    confirmBtn.disabled = selectedCount === 0;
    confirmBtn.style.opacity = selectedCount === 0 ? '0.5' : '1';
    confirmBtn.textContent = `Confirmar Importação (${selectedCount} lançamentos)`;
  }

  toggleAllBtn.onclick = () => {
    const anyUnchecked = parsedTransactions.some(t => !t.selected);
    parsedTransactions.forEach(t => t.selected = anyUnchecked);
    renderPreviewTable();
    updateConfirmButton();
  };

  confirmBtn.onclick = async () => {
    const selectedItems = parsedTransactions.filter(t => t.selected);
    if (selectedItems.length === 0) return;

    const targetAccId = parseInt(document.getElementById('import-target-account').value);
    if (!targetAccId) {
      toast('Selecione uma conta de destino válida.', 'error');
      return;
    }

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Importando...';

      const res = await window.api.importer.importBatch({
        userId: State.user.id,
        accountId: targetAccId,
        transactions: selectedItems
      });

      if (res && res.success) {
        toast(`🎉 ${res.count} lançamentos importados com sucesso!`);
        Modal.close();
        renderAccounts();
      } else {
        toast('Erro ao importar: ' + (res?.error || 'Desconhecido'), 'error');
      }
    } catch (err) {
      toast('Erro ao importar extrato: ' + err.message, 'error');
    }
  };
}
