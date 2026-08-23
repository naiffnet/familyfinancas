/* ===
 * admin.js — L8877–9709 do app.js
 */

async function startApp(user) {
  State.user = user;
  State.budgetUserId = user.id;
  State.settings = await window.api.settings.get(user.id);
  State.permissions = await window.api.permissions.get(user.id);
  
  State.familyName = null;
  if (user.family_id) {
    try {
      const families = await window.api.families.getAll();
      const fam = families.find(f => f.id === user.family_id);
      if (fam) {
        State.familyName = fam.name;
        localStorage.setItem('financeiro_family_id', user.family_id);
        localStorage.setItem('financeiro_family_name', fam.name);
      }
    } catch (e) {
      console.error('Error fetching family name at startup:', e);
    }
  }
  
  // Caçula vs Standard layout setup
  if (user.profile_type === 5) {
    document.body.classList.add('cacula-layout');
  } else {
    document.body.classList.remove('cacula-layout');
  }

  // Dynamic ADM menu insertion
  const navContainer = document.querySelector('.sidebar-nav');
  let familiesBtn = document.getElementById('nav-families');
  if (user.profile_type === 1) {
    if (!familiesBtn) {
      familiesBtn = document.createElement('button');
      familiesBtn.className = 'nav-item';
      familiesBtn.id = 'nav-families';
      familiesBtn.dataset.page = 'families';
      familiesBtn.innerHTML = `
        <span class="nav-icon">👑</span>
        <span class="nav-label">Famílias</span>
      `;
      navContainer.insertBefore(familiesBtn, navContainer.firstChild);
      familiesBtn.onclick = () => navigate('families');
    }
    familiesBtn.style.display = 'flex';
  } else {
    if (familiesBtn) familiesBtn.style.display = 'none';
  }

  applyNavigationPermissions();

  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('sidebar-user-name').textContent = user.name;
  
  const connectBtn = document.getElementById('sidebar-connect');
  if (connectBtn) {
    if (window.api.isElectron) {
      connectBtn.style.display = 'flex';
      connectBtn.onclick = () => openLanConnectModal();
    } else {
      connectBtn.style.display = 'none';
    }
  }

  const syncBtn = document.getElementById('sidebar-sync-btn');
  if (syncBtn) {
    syncBtn.style.display = 'flex';
    syncBtn.onclick = () => openDeduplicationModal();
  }

  const avatarEl = document.getElementById('sidebar-avatar');
  avatarEl.innerHTML = renderAvatarHtml(user, 36);
  avatarEl.style.background = 'transparent';
  avatarEl.style.boxShadow = 'none';

  document.getElementById('sidebar-logout').onclick = () => {
    State.user = null;
    document.body.classList.remove('cacula-layout');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    initLoginScreen();
  };
  document.getElementById('btn-minimize').onclick = () => window.api.window.minimize();
  document.getElementById('btn-maximize').onclick = () => window.api.window.maximize();
  document.getElementById('btn-close').onclick    = () => window.api.window.close();
  
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => { 
    btn.onclick = () => navigate(btn.dataset.page); 
  });
  
  checkImpersonation();
  navigate('dashboard');
}

function checkImpersonation() {
  const impersonatorData = sessionStorage.getItem('impersonator_adm');
  let banner = document.getElementById('impersonation-banner');
  
  if (impersonatorData) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'impersonation-banner';
      banner.style.cssText = `
        background: linear-gradient(90deg, #f97316, #8b5cf6); 
        color: #fff; 
        padding: 10px; 
        text-align: center; 
        font-size: 13px; 
        font-weight: 600; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 12px; 
        border-bottom: 1px solid rgba(255,255,255,0.15); 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
        position: sticky; 
        top: 0; 
        z-index: 9999;
      `;
      
      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.insertBefore(banner, appEl.firstChild);
      }
    }
    
    banner.innerHTML = `
      <span>🛠️ <strong>Modo Manutenção Geral:</strong> Administrando o ambiente da <strong>${State.familyName}</strong> como <strong>${State.user?.name}</strong>.</span>
      <button class="btn btn-secondary btn-sm" id="btn-stop-impersonate" style="background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.45); color: white; padding: 4px 12px; font-size: 11px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: 600;">Voltar ao ADM Dono do APP</button>
    `;
    
    document.getElementById('btn-stop-impersonate').onclick = async () => {
      const admUser = JSON.parse(sessionStorage.getItem('impersonator_adm'));
      sessionStorage.removeItem('impersonator_adm');
      
      // Remove banner
      const bannerEl = document.getElementById('impersonation-banner');
      if (bannerEl) bannerEl.remove();
      
      // Stop layout adjustments
      document.body.classList.remove('cacula-layout');
      
      // Restart app as ADM Geral
      await startApp(admUser);
      navigate('families');
    };
  } else {
    if (banner) banner.remove();
  }
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Preencha todos os campos'; return; }
  btn.disabled = true; btn.textContent = 'Entrando...';
  const r = await window.api.auth.login({ username, password });
  btn.disabled = false; btn.textContent = 'Entrar';
  if (!r.success) { errEl.textContent = r.error; return; }
  startApp(r.user);
};

document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const recovery_question = document.getElementById('reg-recovery-question').value;
  const recovery_answer = document.getElementById('reg-recovery-answer').value.trim();
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';
  if (!name || !username || !password || !recovery_question || !recovery_answer) { errEl.textContent = 'Preencha todos os campos, incluindo a recuperação'; return; }
  if (password.length < 4) { errEl.textContent = 'Senha muito curta'; return; }
  const familyName = document.getElementById('reg-family-name')?.value.trim() || null;
  const r = await window.api.auth.register({ name, username, password, familyName, recovery_question, recovery_answer });
  if (!r.success) { errEl.textContent = r.error; return; }
  toast('Conta criada! Faça login.');
  document.getElementById('register-form-wrap').classList.add('hidden');
  document.getElementById('login-form-wrap').classList.remove('hidden');
  document.getElementById('login-username').value = username;
  await initLoginScreen();
};

async function openLanConnectModal() {
  try {
    const info = await window.api.server.getInfo();
    if (!info) {
      toast('Erro ao carregar informações do servidor', 'error');
      return;
    }
    
    const ipsHtml = info.ips.map(ip => `
      <div class="lan-url-item">
        <span class="lan-url-text">http://${ip}:${info.port}</span>
        <button class="lan-copy-btn" onclick="navigator.clipboard.writeText('http://${ip}:${info.port}'); toast('Endereço copiado!');">Copiar 📋</button>
      </div>
    `).join('');

    const modalBody = `
      <div class="lan-modal-container">
        <div class="lan-status-badge">
          <span style="font-size: 8px;">🟢</span> Servidor LAN Ativo
        </div>
        <p class="lan-instructions">
          Conecte outros aparelhos (celulares, tablets ou computadores) na sua rede Wi-Fi e acesse o endereço abaixo ou escaneie o QR Code:
        </p>
        ${info.qrCode ? `
        <div class="lan-qr-wrapper">
          <img src="${info.qrCode}" class="lan-qr-image" alt="QR Code de Conexão">
        </div>
        ` : ''}
        <div class="lan-urls-list">
          ${ipsHtml || '<div style="color:var(--text-muted)">Nenhuma placa de rede local encontrada.</div>'}
        </div>
      </div>
    `;
    Modal.open('📱 Conectar Outro Aparelho', modalBody);
  } catch (err) {
    console.error('Error opening LAN modal:', err);
    toast('Erro de rede local: ' + err.message, 'error');
  }
}

// ── FILHO CAÇULA DASHBOARD & QUICK EXPENSE ──────────────────────────────────
async function renderCaculaDashboard(page) {
  // Add cacula-layout class to body to hide sidebar and style it
  document.body.classList.add('cacula-layout');

  const [summary, budgets] = await Promise.all([
    window.api.dashboard.getSummary({ userId: State.user.id, month: State.currentMonth, year: State.currentYear }),
    window.api.budgets.getAll({ userId: State.user.id, month: State.currentMonth, year: State.currentYear })
  ]);

  const totalSpent = summary.expense || 0;
  const proposedLimit = budgets.reduce((acc, b) => acc + b.amount, 0) || 100;
  const percentage = proposedLimit > 0 ? Math.round((totalSpent / proposedLimit) * 100) : 0;

  let feedbackIcon = '🎈';
  let feedbackMessage = 'Parabéns! Você está economizando super bem! Continue assim! 🚀';
  let feedbackClass = 'feedback-good';
  let colorGradient = '#10b981';

  if (percentage > 50 && percentage <= 85) {
    feedbackIcon = '⚠️';
    feedbackMessage = 'Atenção! Você já usou mais da metade do seu dinheirinho. Planeje seus próximos gastos! 🧐';
    feedbackClass = 'feedback-warn';
    colorGradient = '#f59e0b';
  } else if (percentage > 85 && percentage <= 100) {
    feedbackIcon = '🚨';
    feedbackMessage = 'Cuidado! Você está bem pertinho do seu limite. Pense bem antes de gastar! 🛒';
    feedbackClass = 'feedback-danger';
    colorGradient = '#ef4444';
  } else if (percentage > 100) {
    feedbackIcon = '😱';
    feedbackMessage = 'Ops! Você passou do limite proposto! Vamos conversar com seus pais para planejar melhor? 🤝';
    feedbackClass = 'feedback-over';
    colorGradient = '#ec4899';
  }

  page.innerHTML = `
    <div class="cacula-dashboard-container">
      <div class="cacula-header">
        <div class="cacula-avatar-badge">${renderAvatarHtml(State.user, 72)}</div>
        <h2 class="cacula-welcome">Olá, ${State.user.name.split(' ')[0]}! 👋</h2>
        <p class="cacula-subtitle">Aprender a cuidar do seu dinheirinho é super divertido!</p>
      </div>
      
      <div class="cacula-hero-button-section">
        <button class="cacula-hero-btn" id="btn-cacula-quick-expense">
          <span class="cacula-btn-icon">⚡</span>
          <span class="cacula-btn-text">Registrar um Gasto</span>
        </button>
      </div>

      <div class="cacula-progress-section">
        <div class="cacula-radial-progress-wrapper">
          <svg class="cacula-radial-svg" viewBox="0 0 100 100">
            <circle class="cacula-radial-bg" cx="50" cy="50" r="40"></circle>
            <circle class="cacula-radial-fill" cx="50" cy="50" r="40" style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (251.2 * Math.min(percentage, 100) / 100)}; stroke: ${colorGradient};"></circle>
          </svg>
          <div class="cacula-radial-text-wrap">
            <span class="cacula-radial-percentage">${percentage}%</span>
            <span class="cacula-radial-label">Utilizado</span>
          </div>
        </div>
        <div class="cacula-radial-description">
          Você já gastou <strong>${fmt.currency(totalSpent)}</strong> de <strong>${fmt.currency(proposedLimit)}</strong> propostos.
        </div>
      </div>

      <div class="cacula-cards-grid">
        <div class="cacula-card card-expense">
          <span class="cacula-card-emoji">💸</span>
          <div class="cacula-card-info">
            <span class="cacula-card-title">Total Gasto</span>
            <span class="cacula-card-val">${fmt.currency(totalSpent)}</span>
          </div>
        </div>
        
        <div class="cacula-card card-limit">
          <span class="cacula-card-emoji">🎯</span>
          <div class="cacula-card-info">
            <span class="cacula-card-title">Limite Proposto</span>
            <span class="cacula-card-val">${fmt.currency(proposedLimit)}</span>
          </div>
        </div>
      </div>

      <div class="cacula-feedback-card ${feedbackClass}">
        <span class="cacula-feedback-icon">${feedbackIcon}</span>
        <span class="cacula-feedback-message">${feedbackMessage}</span>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <button class="btn btn-secondary btn-sm" id="btn-cacula-logout" style="padding: 8px 16px;">⏻ Sair do Aplicativo</button>
      </div>
    </div>
  `;

  document.getElementById('btn-cacula-logout').onclick = () => {
    State.user = null;
    document.body.classList.remove('cacula-layout');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    initLoginScreen();
  };

  document.getElementById('btn-cacula-quick-expense').onclick = () => {
    openCaculaQuickExpenseModal(summary.accounts);
  };
}

function openCaculaQuickExpenseModal(accounts) {
  const debitAccounts = accounts.filter(a => a.type !== 'credit');
  if (debitAccounts.length === 0) {
    toast('Nenhuma conta disponível para gastos. Fale com seus pais!', 'error');
    return;
  }
  const defaultAccount = debitAccounts[0];

  Modal.open('⚡ Registrar Gasto', `
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 48px;">🍦</span>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Qual foi a diversão ou lanche de hoje?</p>
    </div>
    
    <div class="form-group">
      <label>Com o que você gastou?</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;" id="cacula-chips">
        <button class="cacula-chip selected" data-value="Lanche" data-icon="🍔">🍔 Lanche</button>
        <button class="cacula-chip" data-value="Brinquedo" data-icon="🧸">🧸 Brinquedo</button>
        <button class="cacula-chip" data-value="Material Escolar" data-icon="✏️">✏️ Escola</button>
        <button class="cacula-chip" data-value="Lazer/Jogo" data-icon="🎮">🎮 Jogo</button>
        <button class="cacula-chip" data-value="Doce" data-icon="🍬">🍬 Doces</button>
        <button class="cacula-chip" data-value="Outro" data-icon="🛍️">🛍️ Outro</button>
      </div>
      <input type="hidden" id="cacula-expense-description" value="Lanche 🍔">
    </div>

    <div class="form-group">
      <label for="cacula-expense-amount">Quanto custou? (R$)</label>
      <input type="number" id="cacula-expense-amount" placeholder="0,00" step="0.01" min="0.01" style="font-size: 24px; text-align: center; font-weight: 700; padding: 12px; border-color: var(--accent);">
    </div>

    <div class="modal-footer" style="padding: 0; border: none; margin-top: 16px;">
      <button class="btn btn-secondary" id="cacula-expense-cancel">Cancelar</button>
      <button class="btn btn-primary" id="cacula-expense-save">Confirmar Gasto! 🚀</button>
    </div>
  `);

  let currentDescription = 'Lanche 🍔';
  const chips = document.querySelectorAll('#cacula-chips .cacula-chip');
  chips.forEach(chip => {
    chip.onclick = () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      currentDescription = `${chip.dataset.value} ${chip.dataset.icon}`;
      document.getElementById('cacula-expense-description').value = currentDescription;
    };
  });

  document.getElementById('cacula-expense-cancel').onclick = Modal.close;
  document.getElementById('cacula-expense-save').onclick = async () => {
    const amountVal = parseFloat(document.getElementById('cacula-expense-amount').value);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast('Por favor, infoorme um valor correto!', 'error');
      return;
    }

    const allCategories = await window.api.categories.getAll(State.user.id);
    const lowercaseDesc = currentDescription.toLowerCase();
    
    let matchedCat = allCategories.find(c => c.name.toLowerCase().includes('lazer')) || allCategories[0];
    if (lowercaseDesc.includes('lanche') || lowercaseDesc.includes('doce')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('aliment') || c.name.toLowerCase().includes('lanche')) || matchedCat;
    } else if (lowercaseDesc.includes('escola') || lowercaseDesc.includes('material')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('educa')) || matchedCat;
    } else if (lowercaseDesc.includes('brinquedo')) {
      matchedCat = allCategories.find(c => c.name.toLowerCase().includes('lazer') || c.name.toLowerCase().includes('outros')) || matchedCat;
    }

    const payload = {
      user_id: State.user.id,
      account_id: defaultAccount.id,
      category_id: matchedCat ? matchedCat.id : null,
      type: 'expense',
      amount: amountVal,
      description: currentDescription,
      date: fmt.dateDb(new Date()),
      is_paid: 1,
      is_avulso: 1
    };

    const r = await window.api.transactions.create(payload);
    if (r.success) {
      toast('Gasto registrado! Você é demais! 🌟');
      Modal.close();
      renderDashboard();
    } else {
      toast('Erro ao registrar gasto: ' + (r.error || 'Erro desconhecido'), 'error');
    }
  };
}

// ── ADM GERAL DASHBOARD & FAMILIES GOVERNANCE ────────────────────────────────
// ── ADM GERAL DASHBOARD & FAMILIES GOVERNANCE ────────────────────────────────
function renderLogsInConsole(logs) {
  const container = document.querySelector('.adm-logs-console');
  if (!container) return;
  
  if (!logs || logs.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); padding: 10px;">Nenhum log registrado para este filtro.</div>';
    return;
  }
  
  container.innerHTML = logs.map(l => {
    let typeStyle = 'color: var(--accent-light); font-weight:600;';
    let rowStyle = '';
    if (l.event_type.startsWith('error') || l.event_type.includes('delete') || l.message.toLowerCase().includes('erro') || l.message.toLowerCase().includes('exclui')) {
      typeStyle = 'color: var(--danger); font-weight:600;';
      rowStyle = 'border-left: 2px solid var(--danger); padding-left: 8px; margin-bottom: 6px;';
    } else if (l.event_type.includes('register') || l.event_type.includes('create')) {
      typeStyle = 'color: #3b82f6; font-weight:600;';
      rowStyle = 'border-left: 2px solid #3b82f6; padding-left: 8px; margin-bottom: 6px;';
    }
    
    return `
      <div class="adm-log-entry" style="${rowStyle}">
        <span class="log-time">[${fmt.time(l.created_at)}]</span>
        <span style="${typeStyle} margin-right: 6px;">${l.event_type}</span>
        <span>${l.message}</span>
      </div>
    `;
  }).join('');
}

async function renderFamilies() {
  const page = document.getElementById('page-families');
  page.innerHTML = '<div style="padding:20px;color:var(--text-muted)">Carregando painel administrativo...</div>';

  try {
    const [families, logs] = await Promise.all([
      window.api.families.getAll(),
      window.api.logs.get()
    ]);

    let familiesTableRows = families.map(f => `
      <tr>
        <td style="font-weight: 600; color: var(--accent-light);">${f.name}</td>
        <td>${fmt.date(f.created_at ? f.created_at.split(' ')[0] : '')}</td>
        <td style="text-align: center;">${f.user_count} / ${f.quota_users}</td>
        <td style="text-align: center;">${f.account_count} / ${f.quota_accounts}</td>
        <td style="text-align: center; color: var(--text-secondary);">${f.transaction_count}</td>
        <td style="font-weight: 600; color: #ef4444;">${fmt.currency(f.total_expense)}</td>
        <td>
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-sm btn-view-family-logs" data-id="${f.id}" data-name="${f.name}" style="background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); color: #60a5fa;" title="Ver logs de atividades desta família">🪵 Logs</button>
            <button class="btn btn-secondary btn-sm btn-edit-family" data-id="${f.id}" title="Editar quotas e limites da família">✏️ Editar</button>
            ${f.id === 1 
              ? `<span style="font-size:12px;opacity:0.5;color:var(--text-muted);" title="A Família Mestra não pode ser excluída">🔒 Mestra</span>`
              : `<button class="btn btn-primary btn-sm btn-access-family" data-id="${f.id}" style="background: var(--accent); border-color: var(--accent); color: white;" title="Acessar painel e dados desta família">👁️ Acessar</button>
                 <button class="btn btn-danger btn-sm btn-delete-family" data-id="${f.id}" data-name="${f.name}">Excluir</button>`
            }
          </div>
        </td>
      </tr>
    `).join('');

    page.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">Famílias & Governança Geral</h2>
          <p class="page-subtitle">Monitore as famílias cadastradas, quotas de uso e logs de atividades do VPS.</p>
        </div>
      </div>

      <div class="adm-families-grid">
        <div class="adm-card" style="grid-column: span 2; overflow-x: auto;">
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>👥 Famílias no Servidor</span>
            <button class="btn btn-primary btn-sm" id="btn-adm-new-family">+ Criar Família</button>
          </div>
          <table class="adm-table">
            <thead>
              <tr>
                <th>Nome da Família</th>
                <th>Data de Criação</th>
                <th style="text-align: center;">Membros / Quota</th>
                <th style="text-align: center;">Contas / Quota</th>
                <th style="text-align: center;">Transações</th>
                <th style="text-align: center;">Volume Gasto</th>
                <th style="text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${familiesTableRows || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Nenhuma família cadastrada</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="adm-card" style="display: flex; flex-direction: column; max-height: 500px;">
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>💻 Logs do Servidor (VPS)</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="active-log-filter" style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Filtro: Todos</span>
              <button class="btn btn-secondary btn-sm" id="btn-clear-log-filter" style="display: none; padding: 2px 8px; font-size: 11px;">✕ Limpar</button>
            </div>
          </div>
          <div class="adm-logs-console" style="flex-grow: 1; overflow-y: auto;">
            <!-- Renderizado dinamicamente -->
          </div>
        </div>
      </div>

      <div class="settings-section" style="margin-top: 24px;">
        <div class="settings-section-title">🔧 Guia de Suporte ao Cliente (Troubleshooting)</div>
        <div class="card" style="padding: 20px; background: rgba(16, 185, 129, 0.02); border: 1px solid var(--border);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="margin: 0 0 10px 0; color: var(--accent-light); font-size: 14px; font-weight: 700;">🧩 Diagnóstico por Logs</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                <li><strong>Erros de Login/Acesso:</strong> Filtrar por <code>auth:login</code>. Senhas incorretas ou usuários inexistentes serão indicados nos logs de erro.</li>
                <li><strong>Lançamentos Duplicados ou Perdidos:</strong> O log <code>transaction:create</code> e <code>transaction:delete</code> mostra exatamente quem fez a ação, o valor e a descrição.</li>
                <li><strong>Excesso de Quotas:</strong> Se o cliente não conseguir criar contas ou membros, verifique se atingiu o limite da família. O log registrará as tentativas de criação frustradas.</li>
              </ul>
            </div>
            <div>
              <h4 style="margin: 0 0 10px 0; color: var(--accent-light); font-size: 14px; font-weight: 700;">👑 Ações Administrativas Avançadas</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                <li><strong>Acessar Ambiente:</strong> O botão <span style="color:var(--accent-light)">👁️ Acessar</span> faz "impersonation" (login simulado) no perfil do responsável daquela família para você ver exatamente o que ele está vendo no dashboard.</li>
                <li><strong>Limpar Cache:</strong> Caso o navegador do celular do cliente mostre dados desatualizados, peça para ele puxar a tela para baixo ou limpar os dados de navegação.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    renderLogsInConsole(logs);

    document.querySelectorAll('.btn-view-family-logs').forEach(btn => {
      btn.onclick = async () => {
        const familyId = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        
        document.getElementById('active-log-filter').textContent = `Filtro: ${name}`;
        document.getElementById('active-log-filter').style.color = 'var(--accent-light)';
        document.getElementById('btn-clear-log-filter').style.display = 'block';
        
        try {
          const famLogs = await window.api.logs.getByFamily(familyId);
          renderLogsInConsole(famLogs);
        } catch (e) {
          console.error(e);
          toast('Erro ao buscar logs da família', 'error');
        }
      };
    });

    document.getElementById('btn-clear-log-filter').onclick = async () => {
      document.getElementById('active-log-filter').textContent = 'Filtro: Todos';
      document.getElementById('active-log-filter').style.color = 'var(--text-secondary)';
      document.getElementById('btn-clear-log-filter').style.display = 'none';
      
      try {
        const allLogs = await window.api.logs.get();
        renderLogsInConsole(allLogs);
      } catch (e) {
        console.error(e);
      }
    };

    document.querySelectorAll('.btn-edit-family').forEach(btn => {
      btn.onclick = () => {
        openAdmEditFamilyModal(parseInt(btn.dataset.id));
      };
    });

    document.querySelectorAll('.btn-access-family').forEach(btn => {
      btn.onclick = async () => {
        const familyId = parseInt(btn.dataset.id);
        const users = await window.api.auth.getUsers();
        const famUsers = users.filter(u => u.family_id === familyId);
        
        if (famUsers.length === 0) {
          toast('Esta família ainda não possui nenhum membro cadastrado para visualização!', 'error');
          return;
        }
        
        const targetUser = famUsers.find(u => u.profile_type === 2) || famUsers.find(u => u.profile_type === 3) || famUsers[0];
        
        sessionStorage.setItem('impersonator_adm', JSON.stringify(State.user));
        
        await startApp(targetUser);
        
        toast(`Acessando ambiente da ${State.familyName} como ${targetUser.name}...`);
        
        navigate('dashboard');
      };
    });

    document.querySelectorAll('.btn-delete-family').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        if (confirm(`Atenção: Excluir a "${name}" irá apagar todos os usuários, contas, lançamentos e metas pertencentes a ela de forma IRREVERSÍVEL! Deseja continuar?`)) {
          const r = await window.api.families.delete(id);
          if (r.success) {
            toast(`Família "${name}" excluída com sucesso.`);
            renderFamilies();
          } else {
            toast(`Erro ao excluir: ` + r.error, 'error');
          }
        }
      };
    });

    document.getElementById('btn-adm-new-family').onclick = () => {
      openAdmNewFamilyModal();
    };

  } catch (err) {
    console.error('Error rendering families dashboard:', err);
    page.innerHTML = `<div style="padding:20px;color:#ef4444">Erro ao carregar o painel administrativo: ${err.message}</div>`;
  }
}
function openAdmNewFamilyModal() {
  Modal.open('👑 Nova Família & Admin', `
    <div class="form-group">
      <label>Nome da Família</label>
      <input type="text" id="adm-family-name" placeholder="Ex: Família Souza">
    </div>
    
    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div class="form-group" style="margin-bottom: 0;">
        <label>Membros Máximos (Quota)</label>
        <input type="number" id="adm-family-quota-users" min="1" max="50" value="6">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label>Contas Máximas (Quota)</label>
        <input type="number" id="adm-family-quota-accounts" min="1" max="100" value="10">
      </div>
    </div>
    
    <div style="border-top: 1px dashed var(--border); margin: 15px 0;"></div>
    <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); margin-bottom: 8px;">Membro Administrador Local (Adm da Família)</div>
    
    <div class="form-group">
      <label>Nome Completo do Adm da Família</label>
      <input type="text" id="adm-user-name" placeholder="Ex: Carlos Souza">
    </div>
    
    <div class="form-group">
      <label>Nome de Usuário</label>
      <input type="text" id="adm-user-username" placeholder="Ex: carlos_souza">
    </div>
    
    <div class="form-group">
      <label>Senha de Acesso</label>
      <input type="password" id="adm-user-password" placeholder="Defina a senha inicial">
    </div>
    
    <p class="auth-error" id="adm-family-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" id="adm-family-cancel">Cancelar</button>
      <button class="btn btn-primary" id="adm-family-save">Criar Família & Admin</button>
    </div>
  `);

  document.getElementById('adm-family-cancel').onclick = Modal.close;
  document.getElementById('adm-family-save').onclick = async () => {
    const familyName = document.getElementById('adm-family-name').value.trim();
    const quota_users = parseInt(document.getElementById('adm-family-quota-users').value) || 6;
    const quota_accounts = parseInt(document.getElementById('adm-family-quota-accounts').value) || 10;
    
    const name = document.getElementById('adm-user-name').value.trim();
    const username = document.getElementById('adm-user-username').value.trim();
    const password = document.getElementById('adm-user-password').value;
    const errEl = document.getElementById('adm-family-error');

    errEl.textContent = '';
    if (!familyName || !name || !username || !password) {
      errEl.textContent = 'Preencha todos os campos obrigatórios!';
      return;
    }
    
    if (password.length < 4) {
      errEl.textContent = 'A senha deve conter no mínimo 4 caracteres!';
      return;
    }
    
    if (quota_users <= 0 || quota_accounts <= 0) {
      errEl.textContent = 'As quotas devem ser maiores do que zero!';
      return;
    }

    const r = await window.api.auth.register({ 
      name, 
      username, 
      password, 
      familyName, 
      quota_users, 
      quota_accounts 
    });
    if (r.success) {
      toast(`Família "${familyName}" criada com sucesso!`);
      Modal.close();
      renderFamilies();
    } else {
      errEl.textContent = r.error || 'Erro ao registrar nova família.';
    }
  };
}

async function openAdmEditFamilyModal(familyId) {
  const families = await window.api.families.getAll();
  const f = families.find(fam => fam.id === familyId);
  if (!f) return;

  Modal.open('✏️ Editar Família & Quotas', `
    <div class="form-group">
      <label>Nome da Família</label>
      <input type="text" id="edit-fam-name" value="${f.name}">
    </div>
    
    <div style="border-top: 1px dashed var(--border); margin: 15px 0;"></div>
    <div style="font-size: 12px; font-weight: 600; color: var(--accent-light); margin-bottom: 12px;">Limites de Quotas de Uso</div>
    
    <div class="form-group">
      <label>Quota de Usuários (Máximo de Perfis)</label>
      <input type="number" id="edit-fam-quota-users" min="1" max="50" value="${f.quota_users}">
    </div>
    
    <div class="form-group">
      <label>Quota de Contas Bancárias (Máximo)</label>
      <input type="number" id="edit-fam-quota-accounts" min="1" max="100" value="${f.quota_accounts}">
    </div>
    
    <p class="auth-error" id="edit-fam-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" id="edit-fam-cancel">Cancelar</button>
      <button class="btn btn-primary" id="edit-fam-save">Salvar Alterações</button>
    </div>
  `);

  document.getElementById('edit-fam-cancel').onclick = Modal.close;
  document.getElementById('edit-fam-save').onclick = async () => {
    const name = document.getElementById('edit-fam-name').value.trim();
    const quota_users = parseInt(document.getElementById('edit-fam-quota-users').value);
    const quota_accounts = parseInt(document.getElementById('edit-fam-quota-accounts').value);
    const errEl = document.getElementById('edit-fam-error');

    errEl.textContent = '';
    if (!name || isNaN(quota_users) || isNaN(quota_accounts)) {
      errEl.textContent = 'Preencha todos os campos obrigatórios!';
      return;
    }
    
    if (quota_users <= 0 || quota_accounts <= 0) {
      errEl.textContent = 'As quotas devem ser maiores do que zero!';
      return;
    }

    const r = await window.api.families.update({ id: familyId, name, quota_users, quota_accounts });
    if (r.success) {
      toast(`Família "${name}" atualizada com sucesso!`);
      Modal.close();
      renderFamilies();
    } else {
      errEl.textContent = r.error || 'Erro ao salvar alterações da família.';
    }
  };
}

initLoginScreen();

// Sidebar Responsive Toggle Controls
document.getElementById('titlebar-menu-btn').onclick = (e) => {
  e.stopPropagation();
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
};

// Close sidebar when clicking any navigation link
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
  });
});

// Close sidebar when clicking anywhere on the main content area
document.getElementById('main-content').onclick = () => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
};

// Register PWA Service Worker for web hosting compatibility
if ('serviceWorker' in navigator && !window.api.isElectron) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado com sucesso no escopo:', reg.scope))
      .catch(err => console.error('Falha ao registrar o Service Worker:', err));
  });
}
