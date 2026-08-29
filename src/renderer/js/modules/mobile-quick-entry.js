/**
 * src/renderer/js/modules/mobile-quick-entry.js
 * Bottom Sheet de Lançamento Rápido — Fase 2 do Redesign UX Mobile
 *
 * Features:
 * - Tipo toggle (Despesa/Receita) com 1 toque
 * - Valor grande com inputmode="decimal" (teclado nativo do sistema)
 * - Grid de chips de categoria com emoji (4 colunas, 8+ categorias)
 * - Conta e descrição pré-preenchidos com defaults inteligentes
 * - Botão Salvar sempre na zona quente
 * - Haptic feedback na confirmação
 */

const MobileQuickEntry = (() => {
  let _overlay = null;
  let _currentType = 'expense';
  let _selectedCatId = null;
  let _presetAccountId = null;

  function _getOverlay() {
    if (!_overlay) {
      _overlay = document.getElementById('mobile-quick-entry-overlay');
    }
    return _overlay;
  }

  function open(type = 'expense', accountId = null) {
    _currentType      = type;
    _presetAccountId  = accountId;
    _selectedCatId    = null;

    _render();

    const overlay = _getOverlay();
    if (!overlay) return;

    // Animação de entrada
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });

    // Fechar ao tocar no backdrop
    overlay.addEventListener('click', _onBackdropClick);

    // Focus no campo de valor após animação
    setTimeout(() => {
      const amountInput = document.getElementById('qe-amount-input');
      if (amountInput) amountInput.focus({ preventScroll: true });
    }, 380);
  }

  function close() {
    const overlay = _getOverlay();
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.removeEventListener('click', _onBackdropClick);
  }

  function _onBackdropClick(e) {
    if (e.target === _getOverlay()) close();
  }

  function _render() {
    let overlay = _getOverlay();
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mobile-quick-entry-overlay';
      overlay.className = 'mobile-quick-entry-overlay';
      document.body.appendChild(overlay);
      _overlay = overlay;
    }

    const accounts   = (State.accounts || []).filter(a => a.type !== 'credit' && a.is_active);
    const creditCards = (State.accounts || []).filter(a => a.type === 'credit' && a.is_active);
    const allAccounts = [...accounts, ...creditCards];

    // Selecionar conta padrão
    let defaultAccountId = _presetAccountId;
    if (!defaultAccountId) {
      const lastUsed = localStorage.getItem('qe_last_account_id');
      defaultAccountId = lastUsed ? parseInt(lastUsed) : (allAccounts[0]?.id || '');
    }

    // Categorias — separar por tipo e ordenar por uso recente
    const cats = (State.categories || []).filter(c => {
      const t = c.type || 'expense';
      return t === _currentType || t === 'both';
    });

    // Pegar as 8 mais relevantes (primeiras da lista)
    const topCats  = cats.slice(0, 8);
    const moreCats = cats.slice(8);

    const catChipsHtml = topCats.map(cat => `
      <div class="qe-cat-chip ${_selectedCatId === cat.id ? 'selected' : ''}"
           data-cat-id="${cat.id}"
           onclick="MobileQuickEntry._selectCat(${cat.id})">
        <span class="qe-cat-emoji">${cat.icon || '📌'}</span>
        <span class="qe-cat-name">${(cat.name || '').split(' ')[0]}</span>
      </div>
    `).join('');

    const moreCatOption = moreCats.length > 0
      ? `<div class="qe-cat-chip" onclick="MobileQuickEntry._openFullModal()">
           <span class="qe-cat-emoji">⋯</span>
           <span class="qe-cat-name">Mais</span>
         </div>`
      : '';

    const accountOptions = allAccounts.map(a =>
      `<option value="${a.id}" ${a.id === defaultAccountId ? 'selected' : ''}>${a.name}</option>`
    ).join('');

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    overlay.innerHTML = `
      <div class="mobile-quick-entry-sheet" id="qe-sheet">
        <div class="quick-entry-handle"></div>

        <div class="quick-entry-header">
          <span class="quick-entry-title">
            ${_currentType === 'expense' ? '💸 Nova Despesa' : '💰 Nova Receita'}
          </span>
          <button class="quick-entry-close" onclick="MobileQuickEntry.close()" aria-label="Fechar">✕</button>
        </div>

        <!-- Toggle Tipo -->
        <div class="quick-entry-type-toggle">
          <button class="type-toggle-btn ${_currentType === 'expense' ? 'active-expense' : ''}"
                  onclick="MobileQuickEntry._switchType('expense')">
            💸 Despesa
          </button>
          <button class="type-toggle-btn ${_currentType === 'income' ? 'active-income' : ''}"
                  onclick="MobileQuickEntry._switchType('income')">
            💰 Receita
          </button>
        </div>

        <!-- Display do Valor -->
        <div class="quick-entry-amount-display">
          <div class="qe-amount-label">Valor</div>
          <input
            type="number"
            id="qe-amount-input"
            class="qe-amount-value ${_currentType}"
            inputmode="decimal"
            placeholder="0,00"
            min="0"
            step="0.01"
            style="
              background:transparent;border:none;outline:none;
              width:100%;text-align:center;font-size:36px;
              font-weight:900;letter-spacing:-0.03em;
              color:${_currentType === 'expense' ? '#ef4444' : '#10b981'};
              font-family:inherit;
            "
            oninput="MobileQuickEntry._onAmountChange(this)"
          />
        </div>

        <!-- Grid de Categorias -->
        <div class="quick-entry-cats">
          <div class="qe-cats-label">Categoria</div>
          <div class="qe-cats-grid" id="qe-cats-grid">
            ${catChipsHtml}${moreCatOption}
          </div>
        </div>

        <!-- Detalhes -->
        <div class="quick-entry-details">
          <div class="qe-field-row">
            <div class="qe-field">
              <label for="qe-account">Conta / Cartão</label>
              <select id="qe-account">${accountOptions}</select>
            </div>
            <div class="qe-field" style="max-width:120px;">
              <label for="qe-date">Data</label>
              <input type="date" id="qe-date" value="${todayStr}" />
            </div>
          </div>
          <div class="qe-field">
            <label for="qe-desc">Descrição (opcional)</label>
            <input type="text" id="qe-desc" placeholder="Ex: Supermercado, Aluguel..." autocomplete="off" />
          </div>
        </div>

        <!-- Botão Salvar -->
        <button
          class="quick-entry-submit ${_currentType === 'expense' ? 'submit-expense' : 'submit-income'}"
          id="qe-submit-btn"
          onclick="MobileQuickEntry._submit()">
          ${_currentType === 'expense' ? '💸 Salvar Despesa' : '💰 Salvar Receita'}
        </button>
      </div>
    `;

    // Stop click propagation no sheet para não fechar ao clicar dentro
    document.getElementById('qe-sheet')?.addEventListener('click', e => e.stopPropagation());
  }

  function _switchType(type) {
    _currentType   = type;
    _selectedCatId = null;
    _render();
    requestAnimationFrame(() => {
      _getOverlay()?.classList.add('open');
      setTimeout(() => {
        document.getElementById('qe-amount-input')?.focus({ preventScroll: true });
      }, 100);
    });
  }

  function _selectCat(catId) {
    _selectedCatId = _selectedCatId === catId ? null : catId;
    document.querySelectorAll('.qe-cat-chip').forEach(chip => {
      chip.classList.toggle('selected', parseInt(chip.dataset.catId) === _selectedCatId);
    });
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function _onAmountChange(input) {
    const val = parseFloat(input.value) || 0;
    input.style.color = val === 0 ? 'var(--text-muted)' : _currentType === 'expense' ? '#ef4444' : '#10b981';
  }

  function _openFullModal() {
    close();
    setTimeout(() => openAvulsoModal(_currentType), 350);
  }

  async function _submit() {
    const amountRaw  = parseFloat(document.getElementById('qe-amount-input')?.value || '0');
    const accountId  = parseInt(document.getElementById('qe-account')?.value || '0');
    const date       = document.getElementById('qe-date')?.value;
    const description = document.getElementById('qe-desc')?.value?.trim() || '';

    if (!amountRaw || amountRaw <= 0) {
      const input = document.getElementById('qe-amount-input');
      if (input) {
        input.style.border = '2px solid #ef4444';
        input.focus();
      }
      return;
    }

    const btn = document.getElementById('qe-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Salvando...';
    }

    try {
      // Salvar conta usada para próximo lançamento
      if (accountId) localStorage.setItem('qe_last_account_id', accountId);

      await window.api.transactions.create({
        account_id:  accountId,
        category_id: _selectedCatId || null,
        type:        _currentType,
        amount:      amountRaw,
        date:        date || new Date().toISOString().split('T')[0],
        description: description || (_currentType === 'expense' ? 'Despesa' : 'Receita'),
        is_paid:     1,
        is_avulso:   1,
        user_id:     State.user?.id || 1,
        family_id:   State.family?.id || 1,
      });

      if (navigator.vibrate) navigator.vibrate([30, 20, 60]);

      close();

      // Recarregar dashboard
      setTimeout(() => {
        if (typeof renderMobileAppDashboard === 'function') {
          renderMobileAppDashboard(document.getElementById('page-dashboard'));
        }
      }, 400);

    } catch (err) {
      console.error('[MobileQuickEntry] Erro ao salvar:', err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '❌ Erro — Tentar Novamente';
      }
    }
  }

  // Exportar API pública
  return { open, close, _selectCat, _switchType, _openFullModal, _submit, _onAmountChange };
})();
