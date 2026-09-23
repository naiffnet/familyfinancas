/* ===
 * accounts.js — Gestão de Contas Bancárias, Cartões, Gráficos Analíticos e Extrato
 */

async function renderAccounts() {
  const page = document.getElementById('page-accounts');
  const [accounts, summary, txs] = await Promise.all([
    window.api.accounts.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
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
        <p class="page-subtitle">Gerencie suas contas bancárias, previsões de recebimentos, saldos e extratos</p>
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
      <!-- 🏦 SEÇÃO 1: CONTAS BANCÁRIAS (Previsão de Recebimentos e Saldos) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🏦 Contas Bancárias & Carteiras <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Previsão de recebimentos, saldos reais e extrato)</span>
        </h3>
        <div class="accounts-grid">
          ${bankAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhuma conta corrente ou carteira cadastrada.</div>
          ` : bankAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            
            const realBalance = acc.balance !== undefined ? Number(acc.balance) : 0;
            const forecastedIncome = acc.forecasted_income !== undefined ? Number(acc.forecasted_income) : 0;
            const monthExpenses = acc.month_expenses !== undefined ? Number(acc.month_expenses) : 0;
            const projectedBalance = acc.projected_balance !== undefined ? Number(acc.projected_balance) : (realBalance + (Number(acc.pending_income) || 0) - (Number(acc.pending_expense) || 0));
            const totalAvailable = realBalance + (Number(acc.overdraft_limit) || 0);

            return `
              <div class="account-card account-card-interactive" data-id="${acc.id}" style="cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                  ${bankLogo(acc.bank, 38)}
                  <div style="flex: 1; min-width: 0;">
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type] || 'Conta'}</div>
                    <div class="account-name" style="margin:0;font-size:14px;font-weight:700;display:flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${acc.name}">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>
                
                <!-- 🎯 DESTAQUE 1 (TOPO): PREVISÃO DE RECEBIMENTOS & SAÍDAS -->
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <div style="font-size: 10px; font-weight: 700; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.04em;">
                      💰 Previsão Recebimentos
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted);">
                      Saídas: <strong style="color: #f87171;">${fmt.currency(monthExpenses)}</strong>
                    </div>
                  </div>
                  <div style="font-size: 20px; font-weight: 800; color: var(--accent-light); letter-spacing: -0.02em;">
                    ${fmt.currency(forecastedIncome)}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(16, 185, 129, 0.2); padding-top: 4px;">
                    <span>Saldo Previsto Fim Mês:</span>
                    <strong style="color: ${projectedBalance >= 0 ? 'var(--accent-light)' : '#f87171'};">${fmt.currency(projectedBalance)}</strong>
                  </div>
                </div>

                <!-- 🎯 DESTAQUE 2 (EMBAIXO): SALDO REAL EM CONTA & DISPONIBILIDADE -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div>
                      <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em;">Saldo Real Hoje</div>
                      <div class="account-balance" style="font-size: 18px; font-weight: 800; color:${realBalance >= 0 ? 'var(--text-primary)' : '#f87171'}; margin-top: 2px;">
                        ${fmt.currency(realBalance)}
                      </div>
                    </div>
                    ${acc.overdraft_limit > 0 ? `
                    <div style="text-align: right;">
                      <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em;">Disponível c/ LIS</div>
                      <div style="font-size: 14px; font-weight: 700; color:${totalAvailable >= 0 ? '#34d399' : '#f87171'}; margin-top: 2px;">
                        ${fmt.currency(totalAvailable)}
                      </div>
                    </div>` : ''}
                  </div>
                  ${acc.agency ? `<div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border);">Ag. ${acc.agency}${acc.account_number ? ' • CC ' + acc.account_number : ''}</div>` : ''}
                </div>
                
                ${(acc.banricompras_limit > 0 || acc.credit_minuto_limit > 0) ? `
                  <div style="margin-bottom: 12px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border); font-size: 11px;">
                    ${acc.banricompras_limit > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="color: var(--text-muted);">🛍️ Banricompras:</span>
                      <span style="font-weight: 600; color: #fbbf24;">${fmt.currency(acc.banricompras_available)}</span>
                    </div>` : ''}
                    ${acc.credit_minuto_limit > 0 ? `
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--text-muted);">⚡ Crédito Minuto:</span>
                      <span style="font-weight: 600; color: #60a5fa;">${fmt.currency(acc.credit_minuto_limit)}</span>
                    </div>` : ''}
                  </div>
                ` : ''}

                <div class="account-actions">
                  <button class="btn btn-primary btn-sm acc-open-hub" data-id="${acc.id}" style="flex: 1; min-width: 0; padding: 6px 4px; font-size: 11.5px;" title="Ver Gestão e Gráficos">
                    <span>📊</span> Gerenciar & Gráficos
                  </button>
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}" title="Editar Cadastro">✏️</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}" title="Excluir Conta">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm acc-edit" disabled style="opacity:0.5; cursor:not-allowed;">🔒</button>`
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
              <div class="account-card account-card-interactive" data-id="${acc.id}">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                  ${bankLogo(acc.bank, 38)}
                  <div style="flex: 1; min-width: 0;">
                    <div class="account-type-badge" style="background:${b.color}22;color:${b.color};border:1px solid ${b.color}44">${benefitLabel}</div>
                    <div class="account-name" style="margin:0;font-size:14px;font-weight:700;display:flex;align-items:center">${acc.name}${userBadge}${lockIcon}</div>
                  </div>
                </div>

                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 12px;">
                  <div style="font-size: 10.5px; font-weight: 700; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">
                    Saldo Atual no Cartão
                  </div>
                  <div style="font-size: 22px; font-weight: 800; color: var(--accent-light); letter-spacing: -0.02em;">
                    ${fmt.currency(acc.balance || 0)}
                  </div>
                </div>
                
                <div style="margin-bottom: 12px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border);">
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
                  <button class="btn btn-primary btn-sm acc-open-hub" data-id="${acc.id}" style="flex: 1; min-width: 0; padding: 6px 4px; font-size: 11.5px;" title="Ver Extrato e Análise">
                    <span>📊</span> Extrato & Análise
                  </button>
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}" title="Editar Cadastro">✏️</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}" title="Excluir Cartão">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm acc-edit" disabled style="opacity:0.5; cursor:not-allowed;">🔒</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 💳 SEÇÃO 3: LIMITES DE CARTÕES (Fatura do período e limites disponíveis) -->
      <div style="margin-top: 32px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          💳 Cartões de Crédito <span style="font-size: 11px; font-weight: 500; text-transform: none; color: var(--text-muted); opacity: 0.85;">(Fatura do período e limites disponíveis)</span>
        </h3>
        <div class="accounts-grid">
          ${creditAccounts.length === 0 ? `
            <div class="empty-state" style="grid-column: 1/-1; padding: 24px;">Nenhum cartão de crédito cadastrado. Clique em "+ Nova conta / cartão" para adicionar.</div>
          ` : creditAccounts.map(acc => {
            const b = BANKS[acc.bank] || BANKS.outro;
            const canEdit = State.permissions.can_edit_all === 1 || acc.user_id === State.user.id;
            const userBadge = acc.user_name ? `<span class="profile-badge" style="background:${acc.user_avatar_color || '#10b981'}22;color:${acc.user_avatar_color || '#10b981'};border:1px solid ${acc.user_avatar_color || '#10b981'}44;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:6px;vertical-align:middle;display:inline-block">${acc.user_name}</span>` : '';
            const lockIcon = !canEdit ? `<span title="Apenas Leitura" style="font-size: 11px; margin-left: 6px; cursor: help; opacity: 0.8;">🔒</span>` : '';
            const spent = acc.credit_used !== undefined ? Number(acc.credit_used) : (cardSpending[acc.id] || 0);
            const monthInvoice = acc.month_invoice !== undefined ? Number(acc.month_invoice) : ((summary.cardMonthlyInvoices && summary.cardMonthlyInvoices[acc.id]) || 0);
            const available = (acc.credit_limit || 0) - spent;
            const isExceeded = available < 0;

            return `
              <div class="account-card account-card-interactive" data-id="${acc.id}">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${b.color};border-radius:var(--radius) var(--radius) 0 0"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                  ${bankLogo(acc.bank, 38)}
                  <div style="flex: 1; min-width: 0;">
                    <div class="account-type-badge">${ACCOUNT_TYPES[acc.type]}</div>
                    <div class="account-name" style="margin:0;font-size:14px;font-weight:700;display:flex;align-items:center">
                      ${acc.name}${userBadge}${lockIcon}
                    </div>
                  </div>
                </div>
                
                <!-- 🎯 DESTAQUE 1: FATURA DO MÊS -->
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 10px;">
                  <div style="font-size: 10px; font-weight: 700; color: #f87171; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">
                    🧾 Fatura ${MONTHS[State.currentMonth - 1] || 'do Mês'}
                  </div>
                  <div style="font-size: 20px; font-weight: 800; color: #f87171; letter-spacing: -0.02em;">
                    ${fmt.currency(monthInvoice)}
                  </div>
                </div>

                <!-- 🎯 DESTAQUE 2: COMPROMETIDO TOTAL & LIMITE DISPONÍVEL -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid var(--border);">
                    <div>
                      <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Total Comprometido</div>
                      <div style="font-size: 14px; font-weight: 700; color: #f87171;">${fmt.currency(spent)}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">${isExceeded ? 'Excedido' : 'Disponível'}</div>
                      <div style="font-size: 14px; font-weight: 700; color: ${isExceeded ? '#f87171' : 'var(--accent-light)'};">${fmt.currency(available)}</div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted);">
                    <span>Limite: <strong style="color: var(--text-secondary);">${fmt.currency(acc.credit_limit)}</strong></span>
                    <span>Fecha ${acc.closing_day || '—'} • Vence ${acc.due_day || '—'}</span>
                  </div>
                </div>
                <div class="account-actions">
                  <button class="btn btn-primary btn-sm acc-open-hub" data-id="${acc.id}" style="flex: 1; min-width: 0; padding: 6px 4px; font-size: 11.5px;" title="Ver Lançamentos e Fatura">
                    <span>📊</span> Fatura & Extrato
                  </button>
                  ${canEdit 
                    ? `<button class="btn btn-secondary btn-sm acc-edit" data-id="${acc.id}" title="Editar Cadastro">✏️</button>
                       <button class="btn btn-danger btn-sm acc-delete" data-id="${acc.id}" title="Excluir Cartão">🗑</button>`
                    : `<button class="btn btn-secondary btn-sm acc-edit" disabled style="opacity:0.5; cursor:not-allowed;">🔒</button>`
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `}
    ${accounts.length > 1 ? `<div style="margin-top:16px"><button class="btn btn-secondary" id="btn-transfer">🔄 Transferência entre contas</button></div>` : ''}
  `;

  // Bind Hub modal opening
  page.querySelectorAll('.acc-open-hub').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const accountId = parseInt(btn.dataset.id);
      openAccountHubModal(accountId);
    };
  });

  // Bind Card click to open Hub modal
  page.querySelectorAll('.account-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('button')) return;
      const accountId = parseInt(card.dataset.id);
      if (accountId) openAccountHubModal(accountId);
    };
  });

  // Bind edit & delete buttons
  page.querySelectorAll('.acc-edit').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const acc = accounts.find(a => a.id === parseInt(btn.dataset.id));
      openAccountModal(acc);
    };
  });

  page.querySelectorAll('.acc-delete').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
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

/**
 * Hub Interativo da Conta (Gráfico Semanal/Mensal, Extrato e Edição Cadastral)
 */
async function openAccountHubModal(accountId, initialTab = 'chart', periodMode = 'month') {
  try {
    const [accounts, categories, users, summary] = await Promise.all([
      window.api.accounts.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
      window.api.categories.getAll(State.user.id),
      window.api.auth.getUsers().catch(() => []),
      window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }).catch(() => null)
    ]);

    const acc = (accounts || []).find(a => a.id === accountId);
    if (!acc) return toast('Conta não encontrada', 'error');

    const userList = Array.isArray(users) ? users : (users?.users || []);
    const b = BANKS[acc.bank] || BANKS.outro;
    const isCredit = acc.type === 'credit';
    const isVoucher = acc.type === 'voucher';
    const isDebit = !isCredit && !isVoucher;
    const monthName = MONTHS[State.currentMonth - 1] || 'Mês';

    // Métricas para Contas Bancárias / Carteiras
    const realBalance = Number(acc.balance) || 0;
    const forecastedIncome = Number(acc.forecasted_income) || 0;
    const monthExpenses = Number(acc.month_expenses) || 0;
    const projectedBalance = acc.projected_balance !== undefined ? Number(acc.projected_balance) : (realBalance + (Number(acc.pending_income) || 0) - (Number(acc.pending_expense) || 0));
    const totalAvailable = realBalance + (Number(acc.overdraft_limit) || 0);

    // Métricas para Cartão de Crédito
    const cardSpending = acc.credit_used !== undefined ? Number(acc.credit_used) : ((summary?.cardSpending && summary.cardSpending[acc.id]) != null ? summary.cardSpending[acc.id] : 0);
    const monthInvoice = acc.month_invoice !== undefined ? Number(acc.month_invoice) : ((summary?.cardMonthlyInvoices && summary.cardMonthlyInvoices[acc.id]) != null ? summary.cardMonthlyInvoices[acc.id] : 0);
    const availableCredit = (acc.credit_limit || 0) - cardSpending;
    const isCreditExceeded = availableCredit < 0;

    // Métricas para Cartão Benefício
    const benefitBalance = Number(acc.balance) || 0;
    const benefitMonthly = Number(acc.benefit_monthly_credit) || 0;

    // Carrega analytics e transações com tratamento de erro seguro
    let analytics = { labels: [], incomes: [], expenses: [], netFlow: [], totalIncome: 0, totalExpense: 0 };
    let txs = [];

    try {
      const [anRes, txRes] = await Promise.all([
        window.api.accounts.getAnalytics({ accountId, periodMode, month: State.currentMonth, year: State.currentYear }),
        window.api.accounts.getTransactions({ accountId, month: State.currentMonth, year: State.currentYear })
      ]);
      if (anRes && Array.isArray(anRes.labels)) analytics = anRes;
      if (Array.isArray(txRes)) txs = txRes;
    } catch (apiErr) {
      console.warn('[Hub Conta] Aviso ao carregar analytics/extrato:', apiErr);
    }

    const modalHtml = `
    <div style="min-width: 680px; max-width: 860px; width: 100%;">
      <!-- 🏦 CABEÇALHO DA CONTA COM KPIS RÁPIDOS ESPECÍFICOS -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${bankLogo(acc.bank, 46)}
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">${acc.name}</h3>
              <span class="account-type-badge">${ACCOUNT_TYPES[acc.type] || 'Conta'}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
              ${acc.user_name ? `👤 Titular: <strong>${acc.user_name}</strong> • ` : ''}
              ${isCredit 
                ? `💳 Fecha dia <strong>${acc.closing_day || '—'}</strong> • Vence dia <strong>${acc.due_day || '—'}</strong>`
                : isVoucher
                  ? `🎟️ Recarga todo dia <strong>${acc.benefit_credit_day || 1}</strong>${acc.card_last_digits ? ` • Final ${acc.card_last_digits}` : ''}`
                  : (acc.agency ? `Ag. ${acc.agency} • CC ${acc.account_number || ''}` : b.name)
              }
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${isCredit ? `
            <!-- BADGES CARTÃO DE CRÉDITO -->
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #f87171; text-transform: uppercase;">Fatura ${monthName}</div>
              <div style="font-size: 15px; font-weight: 800; color: #f87171;">${fmt.currency(monthInvoice)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Comprometido Total</div>
              <div style="font-size: 15px; font-weight: 800; color: #f87171;">${fmt.currency(cardSpending)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${isCreditExceeded ? 'Limite Excedido' : 'Limite Disponível'}</div>
              <div style="font-size: 15px; font-weight: 800; color: ${isCreditExceeded ? '#f87171' : 'var(--accent-light)'};">${fmt.currency(availableCredit)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Limite Total</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${fmt.currency(acc.credit_limit || 0)}</div>
            </div>
          ` : isVoucher ? `
            <!-- BADGES CARTÃO BENEFÍCIO -->
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--accent-light); text-transform: uppercase;">Saldo Atual</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--accent-light);">${fmt.currency(benefitBalance)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Recarga Mensal</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${fmt.currency(benefitMonthly)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Gastos no Mês</div>
              <div style="font-size: 15px; font-weight: 800; color: #f87171;">${fmt.currency(analytics.totalExpense)}</div>
            </div>
          ` : `
            <!-- BADGES CONTA CORRENTE / CARTEIRA / POUPANÇA -->
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--accent-light); text-transform: uppercase;">Previsão Entradas</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--accent-light);">${fmt.currency(forecastedIncome)}</div>
            </div>
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #f87171; text-transform: uppercase;">Saídas do Mês</div>
              <div style="font-size: 15px; font-weight: 800; color: #f87171;">${fmt.currency(monthExpenses)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Saldo Previsto Fim Mês</div>
              <div style="font-size: 15px; font-weight: 800; color: ${projectedBalance >= 0 ? 'var(--accent-light)' : '#f87171'};">${fmt.currency(projectedBalance)}</div>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Saldo Real Hoje</div>
              <div style="font-size: 15px; font-weight: 800; color: ${realBalance >= 0 ? 'var(--text-primary)' : '#f87171'};">${fmt.currency(realBalance)}</div>
            </div>
            ${acc.overdraft_limit > 0 ? `
            <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Disponível c/ LIS</div>
              <div style="font-size: 15px; font-weight: 800; color: ${totalAvailable >= 0 ? '#34d399' : '#f87171'};">${fmt.currency(totalAvailable)}</div>
            </div>` : ''}
          `}
        </div>
      </div>

      <!-- 📑 NAVEGAÇÃO POR ABAS -->
      <div class="tab-nav" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <button class="btn btn-sm ${initialTab === 'chart' ? 'btn-primary' : 'btn-secondary'}" id="hub-tab-chart" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
          <span>📊</span> ${isCredit ? 'Evolução da Fatura' : isVoucher ? 'Consumo do Benefício' : 'Gráficos & Evolução'}
        </button>
        <button class="btn btn-sm ${initialTab === 'txs' ? 'btn-primary' : 'btn-secondary'}" id="hub-tab-txs" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
          <span>📝</span> ${isCredit ? 'Compras na Fatura' : 'Lançamentos & Extrato'} (${txs.length})
        </button>
        <button class="btn btn-sm ${initialTab === 'edit' ? 'btn-primary' : 'btn-secondary'}" id="hub-tab-edit" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
          <span>⚙️</span> ${isCredit ? 'Configuração do Cartão' : isVoucher ? 'Configuração do Benefício' : 'Cadastro da Conta'}
        </button>
      </div>

      <!-- 📊 ABA 1: GRÁFICO & EVOLUÇÃO -->
      <div id="hub-content-chart" style="${initialTab === 'chart' ? '' : 'display: none;'}">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>📈</span> ${isCredit ? `Gastos na Fatura (${monthName}/${State.currentYear})` : isVoucher ? `Consumo do Benefício (${monthName}/${State.currentYear})` : 'Fluxo de Entradas vs Despesas'}
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm ${periodMode === 'month' ? 'btn-primary' : 'btn-secondary'}" id="hub-toggle-month" style="font-size: 11px; padding: 4px 10px;">
              📅 Semanas do Mês (${monthName}/${State.currentYear})
            </button>
            <button class="btn btn-sm ${periodMode === 'year' ? 'btn-primary' : 'btn-secondary'}" id="hub-toggle-year" style="font-size: 11px; padding: 4px 10px;">
              📆 Ano Completo (${State.currentYear})
            </button>
          </div>
        </div>

        <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 14px;">
          <div style="position: relative; height: 220px; width: 100%;">
            <canvas id="hub-chart-canvas"></canvas>
          </div>
        </div>

        <!-- TABELA RESUMO DAS SEÇÕES -->
        <div style="overflow-x: auto;">
          ${(isCredit || isVoucher) ? `
            <table class="data-table" style="font-size: 11.5px; width: 100%;">
              <thead>
                <tr>
                  <th>Período</th>
                  <th style="text-align: right; color: #f87171;">${isCredit ? 'Gastos na Fatura (−)' : 'Consumo Realizado (−)'}</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.labels.map((lbl, idx) => {
                  const exp = analytics.expenses[idx] || 0;
                  return `
                    <tr>
                      <td><strong>${lbl}</strong></td>
                      <td style="text-align: right; color: #f87171; font-weight: 700;">${fmt.currency(exp)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr style="font-weight: 800; background: var(--bg-surface);">
                  <td>Total do Período</td>
                  <td style="text-align: right; color: #f87171;">${fmt.currency(analytics.totalExpense)}</td>
                </tr>
              </tfoot>
            </table>
          ` : `
            <table class="data-table" style="font-size: 11.5px; width: 100%;">
              <thead>
                <tr>
                  <th>Período</th>
                  <th style="text-align: right; color: var(--accent-light);">Entradas (+)</th>
                  <th style="text-align: right; color: #f87171;">Despesas (−)</th>
                  <th style="text-align: right;">Resultado Líquido</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.labels.map((lbl, idx) => {
                  const inc = analytics.incomes[idx] || 0;
                  const exp = analytics.expenses[idx] || 0;
                  const net = analytics.netFlow[idx] || 0;
                  return `
                    <tr>
                      <td><strong>${lbl}</strong></td>
                      <td style="text-align: right; color: var(--accent-light); font-weight: 600;">${fmt.currency(inc)}</td>
                      <td style="text-align: right; color: #f87171; font-weight: 600;">${fmt.currency(exp)}</td>
                      <td style="text-align: right; font-weight: 700; color: ${net >= 0 ? 'var(--accent-light)' : '#f87171'};">
                        ${net >= 0 ? '+' : ''}${fmt.currency(net)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr style="font-weight: 800; background: var(--bg-surface);">
                  <td>Total Geral</td>
                  <td style="text-align: right; color: var(--accent-light);">${fmt.currency(analytics.totalIncome)}</td>
                  <td style="text-align: right; color: #f87171;">${fmt.currency(analytics.totalExpense)}</td>
                  <td style="text-align: right; color: ${(analytics.totalIncome - analytics.totalExpense) >= 0 ? 'var(--accent-light)' : '#f87171'};">
                    ${(analytics.totalIncome - analytics.totalExpense) >= 0 ? '+' : ''}${fmt.currency(analytics.totalIncome - analytics.totalExpense)}
                  </td>
                </tr>
              </tfoot>
            </table>
          `}
        </div>
      </div>

      <!-- 📝 ABA 2: LANÇAMENTOS & EXTRATO -->
      <div id="hub-content-txs" style="${initialTab === 'txs' ? '' : 'display: none;'}">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 10px; flex-wrap: wrap;">
          <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
            ${isCredit ? `Compras na Fatura (${monthName}/${State.currentYear})` : isVoucher ? `Extrato do Cartão Benefício (${monthName}/${State.currentYear})` : `Extrato de Lançamentos (${monthName}/${State.currentYear})`}
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" id="btn-hub-new-tx" style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
              <span>+</span> ${isCredit ? 'Nova Compra no Cartão' : isVoucher ? 'Novo Gasto com Benefício' : 'Novo Lançamento nesta Conta'}
            </button>
          </div>
        </div>

        ${txs.length === 0 ? `
          <div class="empty-state" style="padding: 30px 20px;">
            <div class="empty-icon" style="font-size: 28px;">📭</div>
            <div class="empty-title" style="font-size: 14px;">Nenhum lançamento encontrado para este período</div>
            <div class="empty-desc" style="font-size: 12px;">Clique no botão acima para adicionar um novo registro.</div>
          </div>
        ` : `
          <div style="max-height: 380px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <table class="data-table" style="font-size: 12px; width: 100%; margin: 0;">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th style="text-align: right;">Valor</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: center;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${txs.map(t => {
                  const isInc = t.type === 'income';
                  const isPaid = t.is_paid === 1;
                  return `
                    <tr>
                      <td style="white-space: nowrap; color: var(--text-muted); font-size: 11px;">${fmt.date(t.date)}</td>
                      <td style="font-weight: 600;">
                        ${t.description}
                        ${t.user_name ? `<span style="font-size: 10px; color: var(--text-muted); display: block; font-weight: normal;">👤 ${t.user_name}</span>` : ''}
                      </td>
                      <td>
                        <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${t.category_color ? t.category_color + '22' : 'var(--bg-surface)'}; color: ${t.category_color || 'var(--text-secondary)'}; font-weight: 600;">
                          ${t.category_icon || '🏷️'} ${t.category_name || 'Sem Categoria'}
                        </span>
                      </td>
                      <td style="text-align: right; font-weight: 700; color: ${isInc ? 'var(--accent-light)' : '#f87171'}; white-space: nowrap;">
                        ${isInc ? '+' : '−'} ${fmt.currency(t.amount)}
                      </td>
                      <td style="text-align: center;">
                        <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; background: ${isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${isPaid ? 'var(--accent-light)' : '#f59e0b'};">
                          ${isPaid ? '✓ Pago' : '⏳ Pendente'}
                        </span>
                      </td>
                      <td style="text-align: center; white-space: nowrap;">
                        <button class="btn btn-secondary btn-sm hub-tx-edit" data-id="${t.id}" style="padding: 2px 6px; font-size: 11px; margin-right: 4px;" title="Editar Lançamento">✏️</button>
                        <button class="btn btn-danger btn-sm hub-tx-del" data-id="${t.id}" style="padding: 2px 6px; font-size: 11px;" title="Excluir Lançamento">🗑</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- ⚙️ ABA 3: CADASTRO DA CONTA / CARTÃO -->
      <div id="hub-content-edit" style="${initialTab === 'edit' ? '' : 'display: none;'}">
        <form id="form-hub-edit-account" onsubmit="return false;">
          <div class="form-group">
            <label>Nome de Identificação</label>
            <input type="text" id="hub-acc-name" value="${acc.name || ''}" required placeholder="Ex: Banrisul Will, Mercado Livre, Vale Alimentação...">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Conta / Cartão</label>
              <select id="hub-acc-type">
                ${Object.entries(ACCOUNT_TYPES).map(([v,l]) => `<option value="${v}" ${acc.type === v ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Banco / Operadora</label>
              <select id="hub-acc-bank">
                ${Object.entries(BANKS).map(([v,bk]) => `<option value="${v}" ${acc.bank === v ? 'selected' : ''}>${bk.emoji} ${bk.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Titular / Perfil</label>
              <select id="hub-acc-user-id">
                ${userList.map(u => `<option value="${u.id}" ${acc.user_id === u.id ? 'selected' : ''}>${u.name} (@${u.username})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Classe Patrimonial</label>
              <select id="hub-acc-asset-class">
                <option value="checking" ${(acc.asset_class || 'checking') === 'checking' ? 'selected' : ''}>🏦 Conta Corrente / Caixa</option>
                <option value="cash" ${acc.asset_class === 'cash' ? 'selected' : ''}>💵 Dinheiro Físico</option>
                <option value="cdb_di" ${acc.asset_class === 'cdb_di' ? 'selected' : ''}>🛡️ Renda Fixa / CDI / Poupança</option>
                <option value="stocks_fii" ${acc.asset_class === 'stocks_fii' ? 'selected' : ''}>📈 Renda Variável / Ações / FIIs</option>
                <option value="crypto" ${acc.asset_class === 'crypto' ? 'selected' : ''}>🪙 Criptoativos</option>
                <option value="real_estate" ${acc.asset_class === 'real_estate' ? 'selected' : ''}>🏠 Bens / Imóveis / Patrimônio</option>
              </select>
            </div>
          </div>

          <!-- 💳 CAMPOS ESPECÍFICOS: CARTÃO DE CRÉDITO -->
          <div id="hub-credit-fields" style="${isCredit ? '' : 'display:none;'}">
            <div class="form-row form-row-3">
              <div class="form-group">
                <label>Limite Total de Crédito (R$)</label>
                <input type="number" id="hub-acc-credit-limit" step="0.01" min="0" value="${acc.credit_limit || ''}" placeholder="0,00">
              </div>
              <div class="form-group">
                <label>Dia do Fechamento</label>
                <input type="number" id="hub-acc-closing-day" min="1" max="31" value="${acc.closing_day || ''}" placeholder="15">
              </div>
              <div class="form-group">
                <label>Dia do Vencimento</label>
                <input type="number" id="hub-acc-due-day" min="1" max="31" value="${acc.due_day || ''}" placeholder="22">
              </div>
            </div>
          </div>

          <!-- 🎟️ CAMPOS ESPECÍFICOS: CARTÃO BENEFÍCIO / VOUCHER -->
          <div id="hub-benefit-fields" style="${isVoucher ? '' : 'display:none;'}">
            <div class="form-row">
              <div class="form-group">
                <label>Modalidade do Benefício</label>
                <select id="hub-acc-benefit-type">
                  ${Object.entries(BENEFIT_TYPES).map(([v,l]) => `<option value="${v}" ${(acc.benefit_type || 'va') === v ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Saldo Atual no Cartão (R$)</label>
                <input type="number" id="hub-acc-benefit-balance" step="0.01" value="${acc.balance || 0}" placeholder="0,00">
              </div>
            </div>
            <div class="form-row form-row-3">
              <div class="form-group">
                <label>Recarga Mensal (R$)</label>
                <input type="number" id="hub-acc-benefit-credit" step="0.01" value="${acc.benefit_monthly_credit || ''}" placeholder="Ex: 800,00">
              </div>
              <div class="form-group">
                <label>Dia da Recarga</label>
                <input type="number" id="hub-acc-benefit-day" min="1" max="31" value="${acc.benefit_credit_day || 1}">
              </div>
              <div class="form-group">
                <label>Final do Cartão</label>
                <input type="text" id="hub-acc-card-last-digits" maxlength="4" value="${acc.card_last_digits || ''}" placeholder="Ex: 1234">
              </div>
            </div>
          </div>

          <!-- 🏦 CAMPOS ESPECÍFICOS: CONTA BANCÁRIA / CARTEIRA -->
          <div id="hub-debit-fields" style="${isDebit ? '' : 'display:none;'}">
            <div class="form-row">
              <div class="form-group">
                <label>Saldo Atual em Conta (R$)</label>
                <input type="number" id="hub-acc-balance" step="0.01" value="${acc.balance || 0}">
              </div>
              <div class="form-group">
                <label>Agência</label>
                <input type="text" id="hub-acc-agency" value="${acc.agency || ''}" placeholder="0001">
              </div>
              <div class="form-group">
                <label>Número da Conta</label>
                <input type="text" id="hub-acc-number" value="${acc.account_number || ''}" placeholder="00000-0">
              </div>
            </div>

            <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-top: 10px; margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
                📋 Limites e Créditos Vinculados à Conta
              </div>
              <div class="form-row form-row-3">
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 11.5px;">🔴 Cheque Especial (R$)</label>
                  <input type="number" id="hub-acc-overdraft" step="0.01" min="0" value="${acc.overdraft_limit || ''}" placeholder="0,00">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 11.5px;">🛍️ Banricompras (R$)</label>
                  <input type="number" id="hub-acc-banricompras" step="0.01" min="0" value="${acc.banricompras_limit || ''}" placeholder="0,00">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 11.5px;">⚡ Crédito Minuto (R$)</label>
                  <input type="number" id="hub-acc-credit-minuto" step="0.01" min="0" value="${acc.credit_minuto_limit || ''}" placeholder="0,00">
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;">
            <button class="btn btn-primary" id="btn-hub-save-account" style="font-weight: 700;">💾 Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modalTitle = isCredit 
    ? `💳 Gestão do Cartão • ${acc.name}` 
    : isVoucher 
      ? `🎟️ Gestão do Benefício • ${acc.name}` 
      : `🏦 Gestão da Conta • ${acc.name}`;

  Modal.open(modalTitle, modalHtml, true);

  // Inicializa gráfico se estiver na aba de gráfico
  if (initialTab === 'chart') {
    setTimeout(() => {
      renderHubChart(analytics, acc.type);
    }, 50);
  }

  // Alternância de Abas
  const tabChart = document.getElementById('hub-tab-chart');
  const tabTxs = document.getElementById('hub-tab-txs');
  const tabEdit = document.getElementById('hub-tab-edit');

  const contentChart = document.getElementById('hub-content-chart');
  const contentTxs = document.getElementById('hub-content-txs');
  const contentEdit = document.getElementById('hub-content-edit');

  function selectTab(tabName) {
    tabChart.className = `btn btn-sm ${tabName === 'chart' ? 'btn-primary' : 'btn-secondary'}`;
    tabTxs.className = `btn btn-sm ${tabName === 'txs' ? 'btn-primary' : 'btn-secondary'}`;
    tabEdit.className = `btn btn-sm ${tabName === 'edit' ? 'btn-primary' : 'btn-secondary'}`;

    contentChart.style.display = tabName === 'chart' ? '' : 'none';
    contentTxs.style.display = tabName === 'txs' ? '' : 'none';
    contentEdit.style.display = tabName === 'edit' ? '' : 'none';

    if (tabName === 'chart') {
      setTimeout(() => renderHubChart(analytics, acc.type), 50);
    }
  }

  tabChart.onclick = () => selectTab('chart');
  tabTxs.onclick = () => selectTab('txs');
  tabEdit.onclick = () => selectTab('edit');

  // Alternância de Período do Gráfico (Semanas vs Meses)
  const toggleMonth = document.getElementById('hub-toggle-month');
  const toggleYear = document.getElementById('hub-toggle-year');

  if (toggleMonth) {
    toggleMonth.onclick = () => {
      openAccountHubModal(accountId, 'chart', 'month');
    };
  }
  if (toggleYear) {
    toggleYear.onclick = () => {
      openAccountHubModal(accountId, 'chart', 'year');
    };
  }

  // Dinamismo na troca de tipo de conta na aba de edição
  const selectType = document.getElementById('hub-acc-type');
  if (selectType) {
    selectType.onchange = (e) => {
      const val = e.target.value;
      const fCredit = document.getElementById('hub-credit-fields');
      const fBenefit = document.getElementById('hub-benefit-fields');
      const fDebit = document.getElementById('hub-debit-fields');
      if (fCredit) fCredit.style.display = val === 'credit' ? '' : 'none';
      if (fBenefit) fBenefit.style.display = val === 'voucher' ? '' : 'none';
      if (fDebit) fDebit.style.display = (val !== 'credit' && val !== 'voucher') ? '' : 'none';
    };
  }

  // Botão de Novo Lançamento na Conta / Cartão
  const btnNewTx = document.getElementById('btn-hub-new-tx');
  if (btnNewTx) {
    btnNewTx.onclick = () => {
      Modal.close();
      if (typeof openAvulsoModal === 'function') {
        const defaultType = isCredit ? 'expense' : 'expense';
        openAvulsoModal(accounts, categories, null, defaultType, { accountId: acc.id });
      }
    };
  }

  // Ações nas transações do Extrato (Editar / Excluir)
  document.querySelectorAll('.hub-tx-edit').forEach(btn => {
    btn.onclick = () => {
      const txId = parseInt(btn.dataset.id);
      const targetTx = txs.find(t => t.id === txId);
      if (targetTx && typeof openAvulsoModal === 'function') {
        Modal.close();
        openAvulsoModal(accounts, categories, targetTx, targetTx.type);
      }
    };
  });

  document.querySelectorAll('.hub-tx-del').forEach(btn => {
    btn.onclick = async () => {
      const txId = parseInt(btn.dataset.id);
      const targetTx = txs.find(t => t.id === txId);
      const ok = await Modal.confirm(`Excluir o lançamento "${targetTx?.description}"?`);
      if (ok) {
        await window.api.transactions.delete(txId);
        toast('Lançamento excluído com sucesso');
        renderAccounts();
        openAccountHubModal(accountId, 'txs', periodMode);
      }
    };
  });

  // Salvar Alterações da Conta / Cartão
  const btnSaveAcc = document.getElementById('btn-hub-save-account');
  if (btnSaveAcc) {
    btnSaveAcc.onclick = async () => {
      const name = document.getElementById('hub-acc-name').value.trim();
      if (!name) return toast('Nome é obrigatório', 'error');

      const selectedType = document.getElementById('hub-acc-type').value;
      const isCreditType = selectedType === 'credit';
      const isVoucherType = selectedType === 'voucher';

      let balance = 0;
      if (isVoucherType) {
        balance = parseFloat(document.getElementById('hub-acc-benefit-balance')?.value) || 0;
      } else if (!isCreditType) {
        balance = parseFloat(document.getElementById('hub-acc-balance')?.value) || 0;
      }

      const payload = {
        id: acc.id,
        name,
        type: selectedType,
        bank: document.getElementById('hub-acc-bank').value,
        user_id: parseInt(document.getElementById('hub-acc-user-id').value) || State.user.id,
        asset_class: document.getElementById('hub-acc-asset-class').value,
        balance,
        // credit fields
        credit_limit: isCreditType ? (parseFloat(document.getElementById('hub-acc-credit-limit')?.value) || 0) : null,
        closing_day: isCreditType ? (parseInt(document.getElementById('hub-acc-closing-day')?.value) || null) : null,
        due_day: isCreditType ? (parseInt(document.getElementById('hub-acc-due-day')?.value) || null) : null,
        // voucher fields
        benefit_type: isVoucherType ? document.getElementById('hub-acc-benefit-type')?.value : null,
        benefit_monthly_credit: isVoucherType ? (parseFloat(document.getElementById('hub-acc-benefit-credit')?.value) || 0) : null,
        benefit_credit_day: isVoucherType ? (parseInt(document.getElementById('hub-acc-benefit-day')?.value) || 1) : null,
        card_last_digits: isVoucherType ? (document.getElementById('hub-acc-card-last-digits')?.value.trim() || null) : null,
        // debit fields
        agency: !isCreditType && !isVoucherType ? (document.getElementById('hub-acc-agency')?.value.trim() || null) : null,
        account_number: !isCreditType && !isVoucherType ? (document.getElementById('hub-acc-number')?.value.trim() || null) : null,
        overdraft_limit: !isCreditType && !isVoucherType ? (parseFloat(document.getElementById('hub-acc-overdraft')?.value) || 0) : 0,
        banricompras_limit: !isCreditType && !isVoucherType ? (parseFloat(document.getElementById('hub-acc-banricompras')?.value) || 0) : 0,
        credit_minuto_limit: !isCreditType && !isVoucherType ? (parseFloat(document.getElementById('hub-acc-credit-minuto')?.value) || 0) : 0
      };

      try {
        await window.api.accounts.update(payload);
        toast('Conta atualizada com sucesso!');
        renderAccounts();
        openAccountHubModal(accountId, 'edit', periodMode);
      } catch (err) {
        toast('Erro ao atualizar conta: ' + (err.message || err), 'error');
      }
    };
  }
  } catch (err) {
    console.error('[openAccountHubModal] Erro ao abrir modal:', err);
    toast('Erro ao abrir gestão da conta: ' + (err.message || err), 'error');
  }
}
window.openAccountHubModal = openAccountHubModal;

/**
 * Renderiza o Gráfico Chart.js no Hub da Conta / Cartão
 */
function renderHubChart(analytics, accountType = 'checking') {
  const canvas = document.getElementById('hub-chart-canvas');
  if (!canvas || typeof Chart === 'undefined' || !analytics || !Array.isArray(analytics.labels)) return;

  if (window._currentHubChart) {
    window._currentHubChart.destroy();
    window._currentHubChart = null;
  }

  const ctx = canvas.getContext('2d');
  const isCredit = accountType === 'credit';
  const isVoucher = accountType === 'voucher';

  if (isCredit || isVoucher) {
    // Apenas despesas/fatura para cartões de crédito e vouchers
    const expGrad = ctx.createLinearGradient(0, 0, 0, 200);
    expGrad.addColorStop(0, 'rgba(248, 113, 113, 0.4)');
    expGrad.addColorStop(1, 'rgba(248, 113, 113, 0.0)');

    window._currentHubChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: analytics.labels,
        datasets: [
          {
            label: isCredit ? 'Gastos na Fatura (R$)' : 'Consumo Realizado (R$)',
            data: analytics.expenses,
            borderColor: '#f87171',
            backgroundColor: expGrad,
            borderWidth: 2.5,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f87171'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#94a3b8', font: { size: 11, weight: '600' }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ` ${ctx.dataset.label}: ${fmt.currency(ctx.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10.5 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10.5 },
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });
    return;
  }

  // Gradientes para contas correntes/carteiras
  const incGrad = ctx.createLinearGradient(0, 0, 0, 200);
  incGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  incGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  const expGrad = ctx.createLinearGradient(0, 0, 0, 200);
  expGrad.addColorStop(0, 'rgba(248, 113, 113, 0.35)');
  expGrad.addColorStop(1, 'rgba(248, 113, 113, 0.0)');

  window._currentHubChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: analytics.labels,
      datasets: [
        {
          label: 'Receitas / Entradas (R$)',
          data: analytics.incomes,
          borderColor: '#10b981',
          backgroundColor: incGrad,
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Despesas / Saídas (R$)',
          data: analytics.expenses,
          borderColor: '#f87171',
          backgroundColor: expGrad,
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f87171'
        },
        {
          label: 'Resultado Líquido (R$)',
          data: analytics.netFlow,
          borderColor: '#60a5fa',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: '#60a5fa'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { size: 11, weight: '600' },
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ` ${ctx.dataset.label}: ${fmt.currency(ctx.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10.5 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10.5 },
            callback: function(value) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          }
        }
      }
    }
  });
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
    <div class="form-row">
      <div class="form-group">
        <label>Perfil / Titular</label>
        <select id="acc-user-id">
          ${users.map(u => `<option value="${u.id}" ${(acc ? acc.user_id : State.user.id) === u.id ? 'selected' : ''}>${u.name} (@${u.username})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Classe Patrimonial de Ativo</label>
        <select id="acc-asset-class">
          <option value="checking" ${(acc?.asset_class || 'checking') === 'checking' ? 'selected' : ''}>🏦 Conta Corrente / Caixa</option>
          <option value="cash" ${acc?.asset_class === 'cash' ? 'selected' : ''}>💵 Dinheiro Físico</option>
          <option value="cdb_di" ${acc?.asset_class === 'cdb_di' ? 'selected' : ''}>🛡️ Renda Fixa / CDI / Poupança</option>
          <option value="stocks_fii" ${acc?.asset_class === 'stocks_fii' ? 'selected' : ''}>📈 Renda Variável / Ações / FIIs</option>
          <option value="crypto" ${acc?.asset_class === 'crypto' ? 'selected' : ''}>🪙 Criptoativos</option>
          <option value="real_estate" ${acc?.asset_class === 'real_estate' ? 'selected' : ''}>🏠 Bens / Imóveis / Patrimônio</option>
        </select>
      </div>
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
      asset_class: document.getElementById('acc-asset-class')?.value || 'checking',
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

        const rawTxs = result?.transactions || [];
        if (rawTxs.length === 0) {
          toast('Nenhuma transação identificada no arquivo.', 'warning');
          return;
        }

        const targetAccId = parseInt(document.getElementById('import-target-account').value) || (account ? account.id : accounts[0]?.id);

        let reconciledList = [];
        try {
          reconciledList = await window.api.accounts.reconcileOfx({
            accountId: targetAccId,
            transactions: rawTxs,
            userId: State.user.id
          });
        } catch (recErr) {
          console.warn('Erro ao rodar fuzzy reconciliation:', recErr);
        }

        parsedTransactions = (reconciledList && reconciledList.length > 0 ? reconciledList : rawTxs).map((t, idx) => ({
          ...t,
          id_temp: idx,
          selected: true,
          action: t.suggested_action || (t.match_candidate ? 'match' : 'create'),
          candidate_id: t.match_candidate?.id || null,
          category_id: (allCategories.find(c => c.name.toLowerCase() === (t.suggestedCategory || '').toLowerCase()) || allCategories[0])?.id || null
        }));

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
    const matchCount = parsedTransactions.filter(t => t.match_candidate).length;
    countBadge.innerHTML = `
      <span>${parsedTransactions.length} lançamentos encontrados no extrato</span>
      ${matchCount > 0 ? `<span style="background: rgba(16,185,129,0.15); color: #34d399; padding: 2px 8px; border-radius: 10px; font-weight: 700; margin-left: 8px;">✨ ${matchCount} correspondências identificadas</span>` : ''}
    `;

    tableWrapper.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted);">
            <th style="padding: 6px 8px; width: 30px;">✓</th>
            <th style="padding: 6px 8px;">Data</th>
            <th style="padding: 6px 8px;">Extrato Bancário</th>
            <th style="padding: 6px 8px;">Ação / Conciliação</th>
            <th style="padding: 6px 8px;">Categoria</th>
            <th style="padding: 6px 8px; text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parsedTransactions.map(t => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${t.selected ? (t.action === 'match' ? 'rgba(16,185,129,0.05)' : 'transparent') : 'rgba(0,0,0,0.2)'}; opacity: ${t.selected ? '1' : '0.5'};">
              <td style="padding: 6px 8px;">
                <input type="checkbox" class="import-chk" data-idx="${t.id_temp}" ${t.selected ? 'checked' : ''}>
              </td>
              <td style="padding: 6px 8px; white-space: nowrap; color: var(--text-muted);">${fmt.date(t.date)}</td>
              <td style="padding: 6px 8px; font-weight: 500;">
                <input type="text" class="import-desc-edit" data-idx="${t.id_temp}" value="${(t.description || '').replace(/"/g, '&quot;')}" style="background: transparent; border: 1px solid transparent; color: var(--text-primary); width: 100%; font-size: 12px;">
              </td>
              <td style="padding: 6px 8px;">
                ${t.match_candidate ? `
                  <select class="import-action-select" data-idx="${t.id_temp}" style="padding: 3px 6px; font-size: 11px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; color: #34d399; font-weight: 600;">
                    <option value="match" ${t.action === 'match' ? 'selected' : ''}>🟢 Conciliar: "${t.match_candidate.description}" (${fmt.currency(t.match_candidate.amount)})</option>
                    <option value="create" ${t.action === 'create' ? 'selected' : ''}>🔵 Criar Novo Lançamento</option>
                  </select>
                ` : `
                  <span class="badge badge-blue" style="font-size: 10px; padding: 3px 6px; border-radius: 4px; background: rgba(59,130,246,0.12); color: #60a5fa;">➕ Criar Novo</span>
                `}
              </td>
              <td style="padding: 6px 8px;">
                <select class="import-cat-select" data-idx="${t.id_temp}" style="padding: 3px 6px; font-size: 11px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);">
                  ${allCategories.map(c => `<option value="${c.id}" ${c.id === t.category_id ? 'selected' : ''}>${c.icon || ''} ${c.name}</option>`).join('')}
                </select>
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

    tableWrapper.querySelectorAll('.import-action-select').forEach(sel => {
      sel.onchange = (e) => {
        const idx = parseInt(e.target.dataset.idx);
        parsedTransactions[idx].action = e.target.value;
        renderPreviewTable();
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
    confirmBtn.textContent = `Confirmar Conciliação (${selectedCount} lançamentos)`;
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
      confirmBtn.textContent = 'Conciliando...';

      const reconciliationsPayload = selectedItems.map(item => ({
        fitid: item.fitid,
        date: item.date,
        amount: item.amount,
        type: item.type,
        description: item.description,
        categoryId: item.category_id,
        action: item.action || 'create',
        candidateId: item.action === 'match' ? (item.candidate_id || item.match_candidate?.id) : null
      }));

      const res = await window.api.accounts.executeReconciliation({
        accountId: targetAccId,
        reconciliations: reconciliationsPayload,
        userId: State.user.id
      });

      if (res && res.success) {
        toast(res.message || 'Conciliação realizada com sucesso!');
        Modal.close();
        renderAccounts();
        if (typeof renderDashboard === 'function') renderDashboard();
      } else {
        toast('Erro ao conciliar: ' + (res?.error || 'Desconhecido'), 'error');
        confirmBtn.disabled = false;
        updateConfirmButton();
      }
    } catch (err) {
      toast('Erro ao conciliar extrato: ' + err.message, 'error');
      confirmBtn.disabled = false;
      updateConfirmButton();
    }
  };
}
