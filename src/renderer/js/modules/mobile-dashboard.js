/**
 * src/renderer/js/modules/mobile-dashboard.js
 * Dashboard Mobile Nativo — Versão Enxuta, Ultra-Rápida e Intuitiva.
 * Foco total em:
 * 1. Lançamentos com 1 toque (+ Despesa, + Receita, 📷 Scanner)
 * 2. Visualização clara de Limites por Cartão de Crédito e Saldos em Conta
 * 3. Extrato simples e ágil
 */

async function renderMobileAppDashboard(container) {
  if (!container) container = document.getElementById('page-dashboard');
  if (!container) return;

  const currentMonth = State.currentMonth || (new Date().getMonth() + 1);
  const currentYear = State.currentYear || new Date().getFullYear();
  const userId = State.user?.id || 1;

  // Carregar dados de resumo simultaneamente
  const [summary, recurringItems] = await Promise.all([
    window.api.dashboard.getSummary({ userId, month: currentMonth, year: currentYear }),
    window.api.recurring.getAll({ userId, month: currentMonth, year: currentYear }).catch(() => [])
  ]);

  const accounts = summary.accounts || [];
  const creditCards = accounts.filter(a => a.type === 'credit');
  const bankAccounts = accounts.filter(a => a.type !== 'credit');

  const totalIncome = summary.income || 0;
  const totalExpense = summary.expense || 0;
  const totalBalance = totalIncome - totalExpense;
  const totalPatrimony = summary.patrimony || 0;

  // Nomes dos meses curtos
  const monthNames = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthShort = `${monthNames[currentMonth]} ${currentYear}`;

  let html = `
    <div class="mobile-lean-container">
      
      <!-- 1. Header Minimalista -->
      <div class="mobile-lean-header">
        <div class="user-pill" onclick="openSettingsModal('profile')">
          ${renderAvatarHtml(State.user, 32)}
          <div class="user-pill-texts">
            <span class="user-greeting">Olá, ${(State.user?.name || 'Usuário').split(' ')[0]}</span>
            <span class="user-family-badge">${State.familyName || 'Família'}</span>
          </div>
        </div>

        <!-- Seletor de Mês Super Enxuto -->
        <div class="mobile-compact-month">
          <button class="btn-compact-month" id="m-prev-month" aria-label="Mês anterior">‹</button>
          <span class="compact-month-text">${monthShort}</span>
          <button class="btn-compact-month" id="m-next-month" aria-label="Próximo mês">›</button>
        </div>
      </div>

      <!-- 2. Hero Card: Saldo Consolidado + Ações Rápidas em Destaque -->
      <div class="mobile-hero-balance-card">
        <div class="hero-balance-header">
          <span class="hero-balance-label">Saldo do Mês</span>
          <span class="hero-patrimony-badge" title="Patrimônio Líquido em Contas">Patrimônio: ${fmt.currency(totalPatrimony)}</span>
        </div>

        <div class="hero-balance-value" style="color: ${totalBalance >= 0 ? '#10b981' : '#ef4444'};">
          ${fmt.currency(totalBalance)}
        </div>

        <div class="hero-inout-row">
          <div class="hero-inout-item">
            <span class="inout-label">💰 Receitas</span>
            <span class="inout-val inout-inc">+${fmt.currency(totalIncome)}</span>
          </div>
          <div class="hero-inout-sep"></div>
          <div class="hero-inout-item">
            <span class="inout-label">💸 Despesas</span>
            <span class="inout-val inout-exp">-${fmt.currency(totalExpense)}</span>
          </div>
        </div>

        <!-- Botões de Lançamento Imediato em 1 Toque -->
        <div class="mobile-hero-actions">
          <button class="hero-btn hero-btn-expense" id="m-quick-expense">
            <span class="hero-btn-icon">💸</span>
            <span>+ Despesa</span>
          </button>
          <button class="hero-btn hero-btn-income" id="m-quick-income">
            <span class="hero-btn-icon">💰</span>
            <span>+ Receita</span>
          </button>
          <button class="hero-btn hero-btn-scanner" id="m-quick-scanner" title="Escanear Cupom / QR Code">
            <span class="hero-btn-icon">📷</span>
          </button>
        </div>
      </div>

      <!-- 3. Cartões de Crédito & Limites (Carrossel Horizontal Deslizável) -->
      <div class="mobile-block-header">
        <div class="block-title-wrap">
          <span class="block-title">💳 Meus Cartões</span>
          <span class="block-badge">${creditCards.length}</span>
        </div>
        <button class="block-link" onclick="navigate('accounts')">Ver Faturas →</button>
      </div>

      <div class="mobile-cards-slider">
        ${creditCards.length === 0 ? `
          <div class="empty-slider-box">
            <p>Nenhum cartão cadastrado.</p>
            <button class="btn btn-secondary btn-sm" onclick="openAccountModal('credit')">+ Adicionar Cartão</button>
          </div>
        ` : creditCards.map(card => {
          const limit = card.credit_limit || 0;
          const invoiceAmount = Math.abs(card.current_invoice || 0);
          const committed = Math.abs(card.credit_used || card.committed_limit || invoiceAmount);
          const available = limit > 0 ? (limit - committed) : (card.available_limit || 0);
          const pctUsed = limit > 0 ? Math.min(100, Math.max(0, Math.round((committed / limit) * 100))) : 0;
          
          let statusColor = '#10b981'; // verde
          if (pctUsed > 85) statusColor = '#ef4444'; // vermelho
          else if (pctUsed > 60) statusColor = '#f59e0b'; // laranja

          // Gradiente personalizado por banco
          let cardBg = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
          let bankTag = '💳 Cartão';
          if (card.bank === 'nubank' || (card.name && card.name.toLowerCase().includes('nu'))) {
            cardBg = 'linear-gradient(135deg, #5b21b6 0%, #1e1b4b 100%)';
            bankTag = '💜 Nubank';
          } else if (card.bank === 'banrisul' || (card.name && card.name.toLowerCase().includes('banri'))) {
            cardBg = 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)';
            bankTag = '💙 Banrisul';
          } else if (card.bank === 'carrefour' || (card.name && card.name.toLowerCase().includes('carrefour'))) {
            cardBg = 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)';
            bankTag = '🔴 Carrefour';
          } else if (card.bank === 'mercadopago' || (card.name && card.name.toLowerCase().includes('mercado'))) {
            cardBg = 'linear-gradient(135deg, #065f46 0%, #022c22 100%)';
            bankTag = '💛 Mercado Pago';
          }

          return `
            <div class="slider-card-item" style="background: ${cardBg};">
              <div class="slider-card-top">
                <span class="slider-bank-tag">${bankTag}</span>
                <span class="slider-holder">${card.user_name ? card.user_name.split(' ')[0] : 'Titular'}</span>
              </div>

              <div class="slider-card-name">${card.name}</div>

              <!-- Destaque do Limite Disponível -->
              <div class="slider-limit-highlight">
                <span class="highlight-label">Limite Disponível</span>
                <span class="highlight-val" style="color: ${available < 0 ? '#ef4444' : '#34d399'};">
                  ${fmt.currency(available)}
                </span>
              </div>

              <!-- Barra de Uso e Fatura -->
              <div class="slider-bar-wrap">
                <div class="slider-bar-bg">
                  <div class="slider-bar-fill" style="width: ${pctUsed}%; background: ${statusColor};"></div>
                </div>
                <div class="slider-bar-legend">
                  <span>Fatura: <strong>${fmt.currency(invoiceAmount)}</strong></span>
                  <span style="color: ${statusColor}; font-weight: 700;">${pctUsed}% usado</span>
                </div>
              </div>

              <!-- Ação Rápida no Cartão -->
              <div class="slider-btn-row">
                <button class="slider-btn" onclick="openAvulsoModal('expense', null, null, 'expense', { accountId: ${card.id} })">
                  + Lançar no Cartão
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 4. Contas & Carteiras (Lista Compacta) -->
      <div class="mobile-block-header" style="margin-top: 18px;">
        <span class="block-title">🏦 Contas & Saldos</span>
        <button class="block-link" onclick="navigate('accounts')">Gerenciar →</button>
      </div>

      <div class="mobile-lean-accounts">
        ${bankAccounts.length === 0 ? `
          <p style="font-size: 12px; color: var(--text-muted); text-align:center;">Nenhuma conta cadastrada.</p>
        ` : bankAccounts.map(acc => {
          const bal = acc.balance || 0;
          let icon = '🏦';
          if (acc.type === 'wallet') icon = '💵';
          else if (acc.type === 'savings') icon = '🐖';

          return `
            <div class="lean-acc-row" onclick="navigate('accounts')">
              <div class="lean-acc-left">
                <div class="lean-acc-icon">${icon}</div>
                <div>
                  <div class="lean-acc-name">${acc.name}</div>
                  <div class="lean-acc-owner">${acc.user_name ? acc.user_name.split(' ')[0] : 'Geral'}</div>
                </div>
              </div>
              <div class="lean-acc-val" style="color: ${bal < 0 ? '#ef4444' : '#10b981'}; font-weight: 800;">
                ${fmt.currency(bal)}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 5. Lançamentos Recentes do Mês -->
      <div class="mobile-block-header" style="margin-top: 18px;">
        <span class="block-title">📋 Lançamentos (${recurringItems.length})</span>
        <button class="block-link" onclick="navigate('recurring')">Ver Todos →</button>
      </div>

      <div class="mobile-lean-tx-list">
        ${recurringItems.length === 0 ? `
          <div class="empty-tx-box">
            <span>📑</span>
            <p>Nenhum lançamento no mês de ${monthShort}.</p>
            <button class="btn btn-primary btn-sm" onclick="openAvulsoModal('expense')">+ Novo Lançamento</button>
          </div>
        ` : recurringItems.slice(0, 8).map(item => {
          const isPaid = item.is_paid === 1;
          const isExpense = item.type === 'expense';
          const amount = item.amount || 0;
          const cat = State.categories?.find(c => c.id === item.category_id);
          const catIcon = cat?.icon || (isExpense ? '💸' : '💰');

          return `
            <div class="lean-tx-item ${isPaid ? 'paid' : 'pending'}" onclick="goToTransaction({ recurringId: ${item.id}, type: '${item.type}', month: ${currentMonth}, year: ${currentYear} })">
              <div class="lean-tx-left">
                <div class="lean-tx-icon">${catIcon}</div>
                <div>
                  <div class="lean-tx-title">${item.name || item.description || 'Lançamento'}</div>
                  <div class="lean-tx-sub">
                    <span>Dia ${item.due_day || 1}</span>
                    <span>•</span>
                    <span class="status-tag ${isPaid ? 'tag-paid' : 'tag-pending'}">${isPaid ? '✓ Pago' : '⏳ Aberto'}</span>
                  </div>
                </div>
              </div>
              <div class="lean-tx-right">
                <div class="lean-tx-amount" style="color: ${isExpense ? '#ef4444' : '#10b981'}; font-weight: 800;">
                  ${isExpense ? '-' : '+'}${fmt.currency(amount)}
                </div>
                ${!isPaid ? `
                  <button class="lean-pay-btn" onclick="event.stopPropagation(); openPaymentModal(${item.id})">
                    Pagar
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Bind dos botões de ação rápida
  document.getElementById('m-quick-expense')?.addEventListener('click', () => openAvulsoModal('expense'));
  document.getElementById('m-quick-income')?.addEventListener('click', () => openAvulsoModal('income'));
  document.getElementById('m-quick-scanner')?.addEventListener('click', () => openNfceScannerModal());

  // Navegação de mês
  document.getElementById('m-prev-month')?.addEventListener('click', () => {
    let m = State.currentMonth - 1;
    let y = State.currentYear;
    if (m < 1) { m = 12; y--; }
    State.currentMonth = m;
    State.currentYear = y;
    renderMobileAppDashboard(container);
  });

  document.getElementById('m-next-month')?.addEventListener('click', () => {
    let m = State.currentMonth + 1;
    let y = State.currentYear;
    if (m > 12) { m = 1; y++; }
    State.currentMonth = m;
    State.currentYear = y;
    renderMobileAppDashboard(container);
  });
}
