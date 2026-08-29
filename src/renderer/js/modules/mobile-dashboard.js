/**
 * src/renderer/js/modules/mobile-dashboard.js
 * Dashboard Mobile Premium — Redesign UX v2.0
 *
 * Melhorias implementadas:
 * - Fase 1: Ações rápidas movidas para Bottom Action Bar (zona quente do polegar)
 * - Fase 3: Swipe-to-pay nos cards de transação
 * - Fase 4: Carrossel adaptativo (85vw) com dots indicadores e grid 2×2 nos cartões
 * - Fase 5: Micro-animações de entrada (slide-up-fade via CSS)
 */

async function renderMobileAppDashboard(container) {
  if (!container) container = document.getElementById('page-dashboard');
  if (!container) return;

  const currentMonth = State.currentMonth || (new Date().getMonth() + 1);
  const currentYear  = State.currentYear  || new Date().getFullYear();
  const userId       = State.user?.id || 1;

  // Skeleton enquanto carrega
  container.innerHTML = `
    <div class="mobile-lean-container">
      <div class="skeleton-block" style="height:52px;margin-bottom:4px;"></div>
      <div class="skeleton-block" style="height:150px;"></div>
      <div class="skeleton-block" style="height:18px;width:120px;margin-top:8px;"></div>
      <div class="skeleton-block" style="height:150px;"></div>
      <div class="skeleton-block" style="height:18px;width:120px;margin-top:8px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
      <div class="skeleton-block" style="height:60px;"></div>
    </div>
  `;

  const [summary, recurringItems] = await Promise.all([
    window.api.dashboard.getSummary({ userId, month: currentMonth, year: currentYear }),
    window.api.recurring.getAll({ userId, month: currentMonth, year: currentYear }).catch(() => [])
  ]);

  const accounts     = summary.accounts || [];
  const creditCards  = accounts.filter(a => a.type === 'credit');
  const bankAccounts = accounts.filter(a => a.type !== 'credit');

  const totalIncome   = summary.income   || 0;
  const totalExpense  = summary.expense  || 0;
  const totalBalance  = totalIncome - totalExpense;
  const totalPatrimony = summary.patrimony || 0;

  // Barra de progresso de orçamento (despesa/receita)
  const budgetPct   = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;
  const budgetColor = budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981';

  const monthNames  = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthShort  = `${monthNames[currentMonth]} ${currentYear}`;

  // ── Helper: data relativa ─────────────────────────────────
  function relativeDay(dueDay) {
    const today  = new Date();
    const target = new Date(currentYear, currentMonth - 1, dueDay);
    const diff   = Math.round((target - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff === -1) return 'Ontem';
    return `${dayNames[target.getDay()]}, ${dueDay}`;
  }

  // ── Separar transações em grupos ─────────────────────────
  const today      = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear  = today.getFullYear();

  function getGroup(dueDay) {
    if (currentYear === todayYear && currentMonth === todayMonth) {
      if (dueDay === todayDay)    return 'Hoje';
      if (dueDay === todayDay - 1) return 'Ontem';
      if (dueDay >= todayDay - 7)  return 'Esta Semana';
    }
    return 'Este Mês';
  }

  // ── HTML do carrossel de cartões ─────────────────────────
  function renderCreditCardSlider() {
    if (creditCards.length === 0) {
      return `<div class="empty-slider-box">
        <p>Nenhum cartão cadastrado.</p>
        <button class="btn btn-secondary btn-sm" onclick="openAccountModal('credit')">+ Adicionar Cartão</button>
      </div>`;
    }

    const dotsHtml = creditCards.length > 1
      ? `<div class="slider-dots" id="m-slider-dots">
          ${creditCards.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
        </div>`
      : '';

    const cardsHtml = creditCards.map((card, i) => {
      const limit       = card.credit_limit || 0;
      const invoiceAmt  = (summary.cardMonthlyInvoices?.[card.id] !== undefined)
        ? summary.cardMonthlyInvoices[card.id] : (card.current_invoice || 0);
      const committed   = (summary.cardSpending?.[card.id] !== undefined)
        ? summary.cardSpending[card.id] : (card.credit_used || invoiceAmt);
      const available   = limit - committed;
      const isExceeded  = limit > 0 && committed > limit;
      const pctUsed     = limit > 0 ? Math.min(100, Math.max(0, Math.round((committed / limit) * 100))) : 0;
      const statusColor = isExceeded || pctUsed > 85 ? '#ef4444' : pctUsed > 60 ? '#f59e0b' : '#10b981';

      let cardBg  = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      let bankTag = '💳 Cartão';
      const nm = card.name?.toLowerCase() || '';
      if (card.bank === 'nubank'      || nm.includes('nu'))         { cardBg = 'linear-gradient(135deg, #5b21b6 0%, #1e1b4b 100%)'; bankTag = '💜 Nubank'; }
      else if (card.bank === 'banrisul'    || nm.includes('banri'))  { cardBg = 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)'; bankTag = '💙 Banrisul'; }
      else if (card.bank === 'carrefour'   || nm.includes('carrefour')) { cardBg = 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)'; bankTag = '🔴 Carrefour'; }
      else if (card.bank === 'mercadopago' || nm.includes('mercado'))   { cardBg = 'linear-gradient(135deg, #065f46 0%, #022c22 100%)'; bankTag = '💛 Mercado Pago'; }
      else if (card.bank === 'itau'        || nm.includes('itaú'))   { cardBg = 'linear-gradient(135deg, #92400e 0%, #451a03 100%)'; bankTag = '🟠 Itaú'; }
      else if (card.bank === 'bradesco'    || nm.includes('bradesco')) { cardBg = 'linear-gradient(135deg, #991b1b 0%, #1e1b4b 100%)'; bankTag = '❤️ Bradesco'; }

      return `
        <div class="slider-card-item" data-card-idx="${i}" style="background: ${cardBg};">
          <div class="slider-card-top">
            <span class="slider-bank-tag">${bankTag}</span>
            <span class="slider-holder">${card.user_name ? card.user_name.split(' ')[0] : 'Titular'}</span>
          </div>

          <div class="slider-card-name">${card.name}</div>

          <!-- Grid 2×2 com dados financeiros -->
          <div class="slider-card-grid">
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Limite Total</div>
              <div class="slider-grid-value">${fmt.currency(limit)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Fatura ${monthNames[currentMonth]}</div>
              <div class="slider-grid-value" style="color:#f87171;">${fmt.currency(invoiceAmt)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">Comprometido</div>
              <div class="slider-grid-value" style="color:${statusColor};">${fmt.currency(committed)}</div>
            </div>
            <div class="slider-grid-cell">
              <div class="slider-grid-label">${isExceeded ? '⚠️ Excedido' : 'Disponível'}</div>
              <div class="slider-grid-value" style="color:${available < 0 ? '#ef4444' : '#34d399'};">${fmt.currency(available)}</div>
            </div>
          </div>

          <!-- Barra de uso -->
          <div class="slider-bar-wrap">
            <div class="slider-bar-bg">
              <div class="slider-bar-fill" style="width:${pctUsed}%;background:${statusColor};"></div>
            </div>
            <div class="slider-bar-legend">
              <span>${pctUsed}% do limite usado</span>
              <span style="color:${statusColor};font-weight:700;">${isExceeded ? 'EXCEDIDO' : 'OK'}</span>
            </div>
          </div>

          <!-- Ação rápida no card -->
          <button class="slider-btn" onclick="openMobileQuickEntry('expense', ${card.id})">
            + Lançar no Cartão
          </button>
        </div>
      `;
    }).join('');

    return cardsHtml + dotsHtml;
  }

  // ── HTML das transações com swipe ────────────────────────
  function renderTxList() {
    if (recurringItems.length === 0) {
      return `<div class="empty-tx-box">
        <span>📑</span>
        <p>Nenhum lançamento em ${monthShort}.</p>
        <button class="btn btn-primary btn-sm" onclick="openMobileQuickEntry('expense')">+ Novo Lançamento</button>
      </div>`;
    }

    const items  = recurringItems.slice(0, 15);
    let lastGroup = null;
    let html = '';

    for (const item of items) {
      const group    = getGroup(item.due_day || 1);
      const isPaid   = item.is_paid === 1;
      const isExpense = item.type === 'expense';
      const amount   = item.amount || 0;
      const cat      = State.categories?.find(c => c.id === item.category_id);
      const catIcon  = cat?.icon || (isExpense ? '💸' : '💰');
      const relDay   = relativeDay(item.due_day || 1);

      // Cabeçalho de grupo
      if (group !== lastGroup) {
        html += `<div class="tx-group-header">${group}</div>`;
        lastGroup = group;
      }

      // Conta vinculada
      const linkedAcc = accounts.find(a => a.id === item.account_id);
      const accBadge  = linkedAcc
        ? `<span style="font-size:9px;font-weight:700;color:var(--text-muted);background:rgba(255,255,255,0.06);padding:1px 5px;border-radius:6px;margin-left:4px;">${linkedAcc.name.split(' ')[0]}</span>`
        : '';

      html += `
        <div class="lean-tx-item ${isPaid ? 'paid' : 'pending'}"
             data-item-id="${item.id}"
             data-is-paid="${isPaid ? '1' : '0'}"
             onclick="goToTransaction({ recurringId: ${item.id}, type: '${item.type}', month: ${currentMonth}, year: ${currentYear} })">

          <div class="lean-tx-swipe-reveal-pay">✓ Pagar</div>
          <div class="lean-tx-swipe-reveal-del">🗑 Excluir</div>

          <div class="lean-tx-left">
            <div class="lean-tx-icon">${catIcon}</div>
            <div>
              <div class="lean-tx-title">${item.name || item.description || 'Lançamento'}${accBadge}</div>
              <div class="lean-tx-sub">
                <span>${relDay}</span>
                <span>•</span>
                <span class="status-tag ${isPaid ? 'tag-paid' : 'tag-pending'}">${isPaid ? '✓ Pago' : '⏳ Aberto'}</span>
              </div>
            </div>
          </div>
          <div class="lean-tx-right">
            <div class="lean-tx-amount" style="color:${isExpense ? '#ef4444' : '#10b981'};font-weight:800;">
              ${isExpense ? '-' : '+'}${fmt.currency(amount)}
            </div>
            ${!isPaid ? `
              <button class="lean-pay-btn" onclick="event.stopPropagation(); openPaymentModal(${item.id})">
                Pagar
              </button>` : ''}
          </div>
        </div>
      `;
    }

    if (recurringItems.length > 15) {
      html += `
        <button class="block-link" style="width:100%;padding:10px;text-align:center;font-size:12px;"
          onclick="navigate('recurring')">
          Ver todos os ${recurringItems.length} lançamentos →
        </button>
      `;
    }

    return html;
  }

  // ── HTML Principal ────────────────────────────────────────
  const html = `
    <div class="mobile-lean-container">

      <!-- 1. Header: Avatar + Seletor de Mês -->
      <div class="mobile-lean-header">
        <div class="user-pill" onclick="openSettingsModal('profile')">
          ${renderAvatarHtml(State.user, 32)}
          <div class="user-pill-texts">
            <span class="user-greeting">Olá, ${(State.user?.name || 'Usuário').split(' ')[0]}</span>
            <span class="user-family-badge">${State.familyName || 'Família'}</span>
          </div>
        </div>
        <div class="mobile-compact-month">
          <button class="btn-compact-month" id="m-prev-month" aria-label="Mês anterior">‹</button>
          <span class="compact-month-text">${monthShort}</span>
          <button class="btn-compact-month" id="m-next-month" aria-label="Próximo mês">›</button>
        </div>
      </div>

      <!-- 2. Hero Card Informacional -->
      <div class="mobile-hero-balance-card">
        <div class="hero-balance-header">
          <span class="hero-balance-label">Saldo do Mês</span>
          <span class="hero-patrimony-badge" title="Patrimônio Líquido">Patrimônio: ${fmt.currency(totalPatrimony)}</span>
        </div>

        <div class="hero-balance-value" style="color:${totalBalance >= 0 ? '#10b981' : '#ef4444'};">
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

        <!-- Barra de orçamento -->
        <div class="hero-budget-bar-wrap">
          <div class="hero-budget-labels">
            <span>Orçamento utilizado</span>
            <span style="font-weight:800;color:${budgetColor};">${budgetPct}%</span>
          </div>
          <div class="hero-budget-bar-bg">
            <div class="hero-budget-bar-fill" style="width:${budgetPct}%;background:${budgetColor};"></div>
          </div>
        </div>
      </div>

      <!-- 3. Cartões de Crédito (carrossel 85vw + dots) -->
      <div class="mobile-block-header">
        <div class="block-title-wrap">
          <span class="block-title">💳 Meus Cartões</span>
          <span class="block-badge">${creditCards.length}</span>
        </div>
        <button class="block-link" onclick="navigate('accounts')">Ver Faturas →</button>
      </div>
      <div class="mobile-cards-slider" id="m-cards-slider">
        ${renderCreditCardSlider()}
      </div>

      <!-- 4. Contas & Saldos -->
      <div class="mobile-block-header" style="margin-top:14px;">
        <span class="block-title">🏦 Contas & Saldos</span>
        <button class="block-link" onclick="navigate('accounts')">Gerenciar →</button>
      </div>
      <div class="mobile-lean-accounts">
        ${bankAccounts.length === 0
          ? `<p style="font-size:12px;color:var(--text-muted);text-align:center;">Nenhuma conta cadastrada.</p>`
          : bankAccounts.map(acc => {
              const bal  = acc.balance || 0;
              let icon   = '🏦';
              if (acc.type === 'wallet')  icon = '💵';
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
                  <div class="lean-acc-val" style="color:${bal < 0 ? '#ef4444' : '#10b981'};font-weight:800;">
                    ${fmt.currency(bal)}
                  </div>
                </div>`;
            }).join('')}
      </div>

      <!-- 5. Lançamentos do Mês -->
      <div class="mobile-block-header" style="margin-top:14px;">
        <span class="block-title">📋 Lançamentos (${recurringItems.length})</span>
        <button class="block-link" onclick="navigate('recurring')">Ver Todos →</button>
      </div>
      <div class="mobile-lean-tx-list" id="m-tx-list">
        ${renderTxList()}
      </div>

    </div>

    <!-- Bottom Action Bar (zona quente do polegar) -->
    <div class="mobile-action-bar" id="m-action-bar">
      <button class="action-bar-btn action-bar-expense" id="m-ab-expense" aria-label="Nova Despesa">
        <span class="action-bar-btn-icon">💸</span>
        <span>Despesa</span>
      </button>
      <button class="action-bar-btn action-bar-income" id="m-ab-income" aria-label="Nova Receita">
        <span class="action-bar-btn-icon">💰</span>
        <span>Receita</span>
      </button>
      <button class="action-bar-btn action-bar-scanner" id="m-ab-scanner" aria-label="Escanear Cupom">
        📷
      </button>
    </div>
  `;

  container.innerHTML = html;

  // ── Event Listeners ───────────────────────────────────────

  // Bottom Action Bar
  document.getElementById('m-ab-expense')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openMobileQuickEntry('expense');
  });
  document.getElementById('m-ab-income')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openMobileQuickEntry('income');
  });
  document.getElementById('m-ab-scanner')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    openNfceScannerModal();
  });

  // Navegação de mês
  document.getElementById('m-prev-month')?.addEventListener('click', () => {
    let m = State.currentMonth - 1, y = State.currentYear;
    if (m < 1) { m = 12; y--; }
    State.currentMonth = m; State.currentYear = y;
    renderMobileAppDashboard(container);
  });
  document.getElementById('m-next-month')?.addEventListener('click', () => {
    let m = State.currentMonth + 1, y = State.currentYear;
    if (m > 12) { m = 1; y++; }
    State.currentMonth = m; State.currentYear = y;
    renderMobileAppDashboard(container);
  });

  // Dots do carrossel sincronizados com scroll
  const slider = document.getElementById('m-cards-slider');
  const dotsContainer = document.getElementById('m-slider-dots');
  if (slider && dotsContainer && creditCards.length > 1) {
    slider.addEventListener('scroll', () => {
      const scrollLeft   = slider.scrollLeft;
      const cardWidth    = slider.querySelector('.slider-card-item')?.offsetWidth || 1;
      const activeIdx    = Math.round(scrollLeft / (cardWidth + 10));
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIdx);
      });
    }, { passive: true });

    dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx       = parseInt(dot.dataset.idx);
        const cardWidth = slider.querySelector('.slider-card-item')?.offsetWidth || 260;
        slider.scrollTo({ left: idx * (cardWidth + 10), behavior: 'smooth' });
      });
    });
  }

  // Swipe-to-pay nos itens da lista
  document.querySelectorAll('.lean-tx-item').forEach(item => {
    if (item.dataset.isPaid === '1') return; // só pendentes podem ser "pagos"

    let startX = 0, currentX = 0, isDragging = false;
    const THRESHOLD = 70; // px para acionar

    item.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = false;
    }, { passive: true });

    item.addEventListener('touchmove', e => {
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      if (Math.abs(diffX) > 8) {
        isDragging = true;
        // Limitar swipe entre -120px e 120px
        const clampedX = Math.max(-120, Math.min(120, diffX));
        item.style.transform = `translateX(${clampedX}px)`;
        item.style.transition = 'none';
      }
    }, { passive: true });

    item.addEventListener('touchend', () => {
      const diffX = currentX - startX;
      item.style.transition = 'transform 0.25s ease';
      item.style.transform  = 'translateX(0)';

      if (isDragging && diffX > THRESHOLD) {
        // Swipe direita = Pagar
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
        const itemId = parseInt(item.dataset.itemId);
        item.style.opacity = '0.5';
        setTimeout(() => openPaymentModal(itemId), 200);
      }
      isDragging = false;
    }, { passive: true });
  });
}

/**
 * Abre o Quick Entry Sheet mobile (Fase 2)
 * Fallback para o modal desktop se o módulo não estiver carregado.
 */
function openMobileQuickEntry(type = 'expense', accountId = null) {
  if (typeof MobileQuickEntry !== 'undefined' && MobileShell.isMobile) {
    MobileQuickEntry.open(type, accountId);
  } else {
    openAvulsoModal(type, null, null, type, accountId ? { accountId } : null);
  }
}
