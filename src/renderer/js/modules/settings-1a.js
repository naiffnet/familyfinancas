/* === settings-1a.js (parte 1/2 de settings-1.js) ===
 * Linhas 1–550
 */

/* ===
 * settings-1.js — Parte 1 de settings
 * Linhas 6375–7470 do app.js
 */

async function renderSettings() {
  await openSettingsModal('profile');
}

async function openSettingsModal(activeTab = 'profile') {
  const PROFILE_LABELS = {
    1: 'ADM Dono do APP',
    2: 'Adm da Família',
    3: 'Filho Primogênito',
    4: 'Filho do Meio',
    5: 'Filho Caçula'
  };

  const [categories, users, settings] = await Promise.all([
    window.api.categories.getAll(State.user.id),
    window.api.auth.getUsers(),
    window.api.settings.get(State.user.id),
  ]);
  State.settings = settings;

  let currentFamily = null;
  if (State.user.family_id) {
    try {
      const families = await window.api.families.getAll();
      currentFamily = families.find(f => f.id === State.user.family_id);
    } catch (e) {
      console.error('Error fetching current family:', e);
    }
  }

  const currentMonthName = new Date(State.currentYear, State.currentMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const currentTheme = localStorage.getItem('financas_theme') || 'dark-emerald';
  const isFamilyAdmin = currentFamily && (State.user.profile_type === 1 || State.user.profile_type === 2);

  const modalHtml = `
    <div class="settings-modal-dialog">
      <!-- SIDEBAR DE ABAS DE NAVEGAÇÃO -->
      <div class="settings-modal-sidebar">
        <div>
          <div class="settings-modal-group-title">👤 PESSOAL</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
              <span>👤</span> Meu Perfil
            </button>
            ${isFamilyAdmin ? `
            <button class="settings-modal-tab-btn ${activeTab === 'family' ? 'active' : ''}" data-tab="family">
              <span>🏠</span> Minha Família
            </button>` : ''}
          </div>
        </div>

        <div>
          <div class="settings-modal-group-title">⚙️ APLICATIVO</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
              <span>🎨</span> Aparência & Temas
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
              <span>🏷️</span> Categorias
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'backups' ? 'active' : ''}" data-tab="backups">
              <span>💾</span> Backups & Dados
            </button>
          </div>
        </div>

        <div>
          <div class="settings-modal-group-title">📚 CONHECIMENTO & LEI</div>
          <div class="settings-modal-nav">
            <button class="settings-modal-tab-btn ${activeTab === 'wiki' ? 'active' : ''}" data-tab="wiki">
              <span>📚</span> Wiki do Aplicativo
            </button>
            <button class="settings-modal-tab-btn ${activeTab === 'lgpd' ? 'active' : ''}" data-tab="lgpd">
              <span>⚖️</span> Privacidade & LGPD
            </button>
          </div>
        </div>
      </div>

      <!-- CORPO DE CONTEÚDO DA ABA ATIVA -->
      <div class="settings-modal-body" id="settings-modal-tab-body">
      </div>
    </div>
  `;

  Modal.open('⚙️ Configurações do Aplicativo', modalHtml, true, true);

  const bodyEl = document.getElementById('settings-modal-tab-body');

  const renderTabContent = async (tab) => {
    document.querySelectorAll('.settings-modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'profile') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          👤 Meu Perfil (Dados Cadastrais)
        </h3>
        
        <!-- Header com Avatar e Nome -->
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 14px 18px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          ${renderAvatarHtml(State.user, 54)}
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>${State.user.name}</span>
              <span class="badge badge-purple" style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">${PROFILE_LABELS[State.user.profile_type] || 'Membro'}</span>
            </h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">Usuário: @${State.user.username}</p>
          </div>
        </div>

        <!-- GRUPO 1: DADOS PESSOAIS -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--accent-light); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>👤</span> Identificação Pessoal
          </div>
          <div class="form-row" style="margin-bottom: 12px;">
            <div class="form-group">
              <label>Nome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-first-name" value="${State.user.first_name || ''}">
            </div>
            <div class="form-group">
              <label>Sobrenome <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-last-name" value="${State.user.last_name || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CPF <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-cpf" placeholder="000.000.000-00" value="${State.user.cpf || ''}" maxlength="14">
            </div>
            <div class="form-group">
              <label>Data de Nascimento <span style="color: #ef4444;">*</span></label>
              <input type="date" id="prof-birth-date" value="${State.user.birth_date || ''}">
            </div>
          </div>
        </div>

        <!-- GRUPO 2: CONTATO -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>📱</span> Contato & Comunicação
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>E-mail <span style="color: #ef4444;">*</span></label>
              <input type="email" id="prof-email" placeholder="seu-email@provedor.com" value="${State.user.email || ''}">
            </div>
            <div class="form-group">
              <label>Celular (WhatsApp) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-phone" placeholder="(00) 00000-0000" value="${State.user.phone || ''}" maxlength="15">
            </div>
          </div>
        </div>

        <!-- GRUPO 3: ACESSO E SEGURANÇA -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #8b5cf6; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>🔒</span> Credenciais & Segurança de Acesso
          </div>
          <div class="form-row" style="margin-bottom: 12px;">
            <div class="form-group">
              <label>Usuário (@username) <span style="color: #ef4444;">*</span></label>
              <input type="text" id="prof-username" value="${State.user.username}" ${State.user.username === 'adm' ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label>Alterar Senha (Opcional)</label>
              <input type="password" id="prof-password" placeholder="Deixe em branco para manter a atual">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pergunta de Segurança <span style="color: #ef4444;">*</span></label>
              <select id="prof-recovery-question">
                <option value="Qual o nome de solteira da sua mãe?" ${State.user.recovery_question === 'Qual o nome de solteira da sua mãe?' ? 'selected' : ''}>Qual o nome de solteira da sua mãe?</option>
                <option value="Qual o nome do seu primeiro animal de estimação?" ${State.user.recovery_question === 'Qual o nome do seu primeiro animal de estimação?' ? 'selected' : ''}>Qual o nome do seu primeiro animal de estimação?</option>
                <option value="Em qual cidade você nasceu?" ${State.user.recovery_question === 'Em qual cidade você nasceu?' ? 'selected' : ''}>Em qual cidade você nasceu?</option>
                <option value="Qual o nome da sua primeira escola?" ${State.user.recovery_question === 'Qual o nome da sua primeira escola?' ? 'selected' : ''}>Qual o nome da sua primeira escola?</option>
                <option value="Qual o modelo do seu primeiro carro?" ${State.user.recovery_question === 'Qual o modelo do seu primeiro carro?' ? 'selected' : ''}>Qual o modelo do seu primeiro carro?</option>
              </select>
            </div>
            <div class="form-group">
              <label>Resposta de Segurança (Opcional)</label>
              <input type="text" id="prof-recovery-answer" placeholder="Deixe em branco para manter a atual">
            </div>
          </div>
        </div>

        <p class="auth-error" id="prof-error-text" style="margin: 0; font-size: 12px;"></p>

        <div style="display: flex; justify-content: flex-end; margin-top: 12px; margin-bottom: 24px;">
          <button class="btn btn-primary" id="save-my-profile" style="padding: 10px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>💾</span> Salvar Alterações
          </button>
        </div>

        <!-- Alertas de Vencimento -->
        <h4 style="margin: 16px 0 10px 0; font-size: 14px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 16px;">
          ⏰ Alertas de Vencimento
        </h4>
        <div class="form-group">
          <label>Avisar com quantos dias de antecedência?</label>
          <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
            <input type="number" id="alert-days" min="1" max="30" value="${settings.alert_days_before || 3}" style="width:100px; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary)">
            <span style="color:var(--text-muted);font-size:13px">dia(s) antes do vencimento</span>
            <button class="btn btn-primary btn-sm" id="save-alert-days">Salvar Alerta</button>
          </div>
        </div>

        <!-- Gestão de Usuários da Família -->
        <h4 style="margin: 24px 0 10px 0; font-size: 14px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 16px;">
          👥 Membros da Família
        </h4>
        <div class="settings-list" style="margin-bottom: 12px;">
          ${users.map(u => `
            <div class="settings-item" data-id="${u.id}" ${State.permissions.can_edit_all === 1 ? 'draggable="true"' : ''} style="justify-content: space-between; ${State.permissions.can_edit_all === 1 ? 'cursor: grab;' : ''}">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${renderAvatarHtml(u, 36)}
                <div class="settings-item-info"><div class="settings-item-name">${u.name}</div><div class="settings-item-sub">@${u.username} • <span style="color: var(--accent-light); font-weight: 600;">${PROFILE_LABELS[u.profile_type] || 'Membro'}</span></div></div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                ${u.id === State.user.id ? '<span class="badge badge-green">Você</span>' : ''}
                ${State.permissions.can_edit_all === 1 ? `<button class="btn-icon-sm btn-edit-user" data-id="${u.id}" title="Editar Perfil">✏️</button>` : ''}
                ${State.permissions.can_edit_all === 1 && u.id !== State.user.id && u.username !== 'adm' ? `<button class="btn-icon-sm btn-delete-user" data-id="${u.id}" title="Excluir Usuário" style="background: none; border: none; cursor: pointer; font-size: 14px;">🗑️</button>` : ''}
              </div>
            </div>`).join('')}
        </div>
        ${State.permissions.can_edit_all === 1 ? `<button class="btn btn-secondary btn-sm" id="btn-add-user" style="align-self: flex-start;">+ Adicionar usuário</button>` : ''}
      `;

      bindProfileTabEvents(categories, users);

    } else if (tab === 'family') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          🏠 Minha Família
        </h3>
        ${currentFamily ? `
        <div class="card" style="padding:20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div class="form-group" style="margin-bottom:0">
            <label style="font-weight:600; font-size:13px;">Nome da Família</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
              <input type="text" id="family-name-input" value="${currentFamily.name}" style="flex-grow:1; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
              <button class="btn btn-primary btn-sm" id="save-family-name" style="padding: 10px 16px;">Salvar Nome</button>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Isso mudará o nome da sua família no topo e nos relatórios de todos os membros.</p>
          </div>
        </div>
        ` : `<div style="color:var(--text-muted); font-size:13px;">Nenhuma família associada.</div>`}
      `;
      if (document.getElementById('save-family-name')) {
        document.getElementById('save-family-name').onclick = async () => {
          const newName = document.getElementById('family-name-input').value.trim();
          if (!newName) { toast('Informe o nome da família', 'error'); return; }
          const res = await window.api.families.update({ id: currentFamily.id, name: newName, quota_users: currentFamily.quota_users, quota_accounts: currentFamily.quota_accounts });
          if (res && res.success) {
            State.familyName = newName;
            toast('Nome da família atualizado!');
            openSettingsModal('family');
          } else {
            toast(res?.error || 'Erro ao atualizar família', 'error');
          }
        };
      }

    } else if (tab === 'appearance') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          🎨 Aparência e Temas do App
        </h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px">
          Selecione a aparência visual de sua preferência para o aplicativo:
        </p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px" id="settings-theme-container">
          
          <div class="theme-card-option ${currentTheme === 'dark-emerald' || currentTheme === 'high-contrast-dark' ? 'active' : ''}" data-theme-val="dark-emerald" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${(currentTheme === 'dark-emerald' || currentTheme === 'high-contrast-dark') ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:12px">
            <div style="display:flex; align-items:center; justify-content:space-between">
              <span style="font-size:24px">🌙</span>
              <span class="theme-preview-dot dark-emerald" style="width:20px; height:20px"></span>
            </div>
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Tema Escuro</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px">Visual escuro moderno, equilibrado e elegante.</div>
            </div>
          </div>

          <div class="theme-card-option ${currentTheme === 'light' || currentTheme === 'high-contrast-light' ? 'active' : ''}" data-theme-val="light" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${(currentTheme === 'light' || currentTheme === 'high-contrast-light') ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:12px">
            <div style="display:flex; align-items:center; justify-content:space-between">
              <span style="font-size:24px">☀️</span>
              <span class="theme-preview-dot light-theme-dot" style="width:20px; height:20px"></span>
            </div>
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Tema Claro</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px">Visual claro descansado, limpo e profissional.</div>
            </div>
          </div>

        </div>

        <!-- SEÇÃO: LAYOUT E ORGANIZAÇÃO DO DASHBOARD -->
        <h4 style="margin: 28px 0 10px 0; font-size: 15px; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 20px; display: flex; align-items: center; gap: 8px;">
          <span>🎛️</span> Organização e Layout do Dashboard
        </h4>
        <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px">
          Escolha como prefere visualizar e interagir com o resumo financeiro da família no Dashboard:
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px" id="settings-dash-layout-container">
          
          <!-- MODO 1: EXECUTIVO POR ZONAS -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'executive' ? 'active' : ''}" data-layout-val="executive" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'executive' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'executive' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">🌟</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Executivo por Zonas</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Visão 360° com KPIs consolidados, pílulas de ação rápida, cartões com filtro por membro e painel Kanban 3 colunas.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:var(--accent-light); background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Recomendado / Visão Completa
            </div>
          </div>

          <!-- MODO 2: SUB-ABAS OPERACIONAIS -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'tabbed' ? 'active' : ''}" data-layout-val="tabbed" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'tabbed' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'tabbed' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">📑</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Sub-Abas Operacionais</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Reduz a rolagem vertical agrupando os dados em 3 abas focadas: <em>📋 Operação</em>, <em>💳 Cartões & Bancos</em> e <em>📈 Gráficos</em>.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:#60a5fa; background:rgba(59,130,246,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Ideal para Foco por Contexto
            </div>
          </div>

          <!-- MODO 3: COCKPIT INTEGRADO -->
          <div class="dash-layout-option ${State.dashboardLayoutMode === 'cockpit' ? 'active' : ''}" data-layout-val="cockpit" style="padding:16px; border-radius:var(--radius-md); border:2px solid ${State.dashboardLayoutMode === 'cockpit' ? 'var(--accent)' : 'var(--border)'}; background:var(--bg-raised); cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
            ${State.dashboardLayoutMode === 'cockpit' ? `<span class="badge badge-green" style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px;">Ativo</span>` : ''}
            <div>
              <div style="font-size:24px; margin-bottom:8px">🎛️</div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary)">Cockpit Integrado</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; line-height:1.4">
                Filtros no topo com Cartões e Bancos em destaque logo abaixo, seguidos pelos KPIs, Kanban 3 colunas e Gráficos em tela cheia.
              </div>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:#c084fc; background:rgba(139,92,246,0.1); padding:4px 8px; border-radius:4px; text-align:center;">
              Previsibilidade Direta no Topo
            </div>
          </div>

        </div>
      `;

      document.querySelectorAll('#settings-theme-container .theme-card-option').forEach(card => {
        card.onclick = () => {
          const tVal = card.dataset.themeVal;
          if (typeof setAppTheme === 'function') {
            setAppTheme(tVal);
          }
          openSettingsModal('appearance');
        };
      });

      document.querySelectorAll('#settings-dash-layout-container .dash-layout-option').forEach(card => {
        card.onclick = () => {
          const lVal = card.dataset.layoutVal;
          State.dashboardLayoutMode = lVal;
          localStorage.setItem('dashboard_layout_mode', lVal);
          toast(`Layout do Dashboard alterado para: ${lVal === 'executive' ? 'Executivo por Zonas' : lVal === 'tabbed' ? 'Sub-Abas Operacionais' : 'Cockpit Split 2:1'}`);
          openSettingsModal('appearance');
          if (State.currentPage === 'dashboard' && typeof renderDashboard === 'function') {
            renderDashboard();
          }
        };
      });

    } else if (tab === 'categories') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
          <span>🏷️ Categorias</span>
          <button class="btn btn-secondary btn-sm" id="btn-add-category">+ Nova Categoria</button>
        </h3>

        <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
          <!-- Coluna Despesas -->
          <div class="category-column">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">💸</span> Despesas
            </div>
            <div class="settings-list">
              ${categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => `
                <div class="settings-item">
                  <span style="font-size:20px">${c.icon}</span>
                  <div style="width:10px;height:10px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
                  <div class="settings-item-info">
                    <div class="settings-item-name">${c.name} ${c.is_default ? '<span style="font-size:10px;color:var(--text-muted);margin-left:6px;opacity:0.7;">(Padrão)</span>' : ''}</div>
                  </div>
                  <div class="settings-item-actions" style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn btn-secondary btn-sm cat-edit" data-id="${c.id}">✏️</button>
                    ${!c.is_default ? `<button class="btn btn-danger btn-sm cat-delete" data-id="${c.id}">🗑</button>` : `<span title="Categoria padrão (não pode ser excluída)" style="font-size:14px;opacity:0.5;margin: 0 8px; cursor: help;">🔒</span>`}
                  </div>
                </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:16px;background:var(--bg-surface);border:1px dashed var(--border);border-radius:var(--radius-sm);text-align:center">Nenhuma categoria de despesa</div>'}
            </div>
          </div>

          <!-- Coluna Receitas -->
          <div class="category-column">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">💰</span> Receitas
            </div>
            <div class="settings-list">
              ${categories.filter(c => c.type === 'income' || c.type === 'both').map(c => `
                <div class="settings-item">
                  <span style="font-size:20px">${c.icon}</span>
                  <div style="width:10px;height:10px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
                  <div class="settings-item-info">
                    <div class="settings-item-name">${c.name} ${c.is_default ? '<span style="font-size:10px;color:var(--text-muted);margin-left:6px;opacity:0.7;">(Padrão)</span>' : ''}</div>
                  </div>
                  <div class="settings-item-actions" style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn btn-secondary btn-sm cat-edit" data-id="${c.id}">✏️</button>
                    ${!c.is_default ? `<button class="btn btn-danger btn-sm cat-delete" data-id="${c.id}">🗑</button>` : `<span title="Categoria padrão (não pode ser excluída)" style="font-size:14px;opacity:0.5;margin: 0 8px; cursor: help;">🔒</span>`}
                  </div>
                </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:16px;background:var(--bg-surface);border:1px dashed var(--border);border-radius:var(--radius-sm);text-align:center">Nenhuma categoria de receita</div>'}
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-add-category').onclick = () => openCategoryModal(categories);
      document.querySelectorAll('.cat-delete').forEach(btn => {
        btn.onclick = async () => {
          if (confirm('Excluir esta categoria?')) {
            await window.api.categories.delete(parseInt(btn.dataset.id));
            toast('Categoria excluída');
            openSettingsModal('categories');
          }
        };
      });
      document.querySelectorAll('.cat-edit').forEach(btn => {
        btn.onclick = () => {
          const catId = parseInt(btn.dataset.id);
          const cat = categories.find(c => c.id === catId);
          if (cat) openCategoryModal(categories, cat);
        };
      });

    } else if (tab === 'backups') {
      bodyEl.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          💾 Gestão de Backups & Exportação de Dados
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
          Exporte ou restaure suas informações financeiras em múltiplos formatos seguros e compatíveis com planilhas e sistemas externos:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          
          <!-- CARD 1: BANCO SQLITE (.db) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📦 Banco SQLite</span>
                </span>
                <span class="badge badge-purple" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">.DB</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Cópia de segurança nativa do arquivo de banco de dados do sistema contendo todas as tabelas.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-backup" style="flex: 1; min-width: 110px; font-size: 12px;">
                💾 Exportar .db
              </button>
              ${(State.user.profile_type === 1 || State.user.is_system_admin === 1) ? `
              <button class="btn btn-secondary btn-sm" id="btn-restore-backup" style="flex: 1; min-width: 110px; font-size: 12px; border: 1px dashed var(--border);">
                📂 Restaurar .db
              </button>
              <input type="file" id="input-restore-backup" accept=".db" style="display:none">
              ` : ''}
            </div>
          </div>

          <!-- CARD 2: EXCEL (.xlsx) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📊 Planilhas Excel</span>
                </span>
                <span class="badge badge-success" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">.XLSX</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Relatórios financeiros formatados com abas separadas de Resumo, Lançamentos e Planejamento.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-export-month" style="flex: 1; min-width: 110px; font-size: 12px;">
                📅 Excel Mês (${capitalizedMonth})
              </button>
              <button class="btn btn-primary btn-sm" id="btn-export-year" style="flex: 1; min-width: 110px; font-size: 12px;">
                📊 Excel Anual (${State.currentYear})
              </button>
            </div>
          </div>

          <!-- CARD 3: EXTRATO CSV (.csv) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📋 Extrato CSV</span>
                </span>
                <span class="badge badge-warning" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">.CSV</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Extrato leve de lançamentos em texto separado por ponto-e-vírgula (compatível com Excel).
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-csv-month" style="flex: 1; min-width: 110px; font-size: 12px;">
                📋 CSV Mensal
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-export-csv-year" style="flex: 1; min-width: 110px; font-size: 12px;">
                📅 CSV Anual
              </button>
            </div>
          </div>

          <!-- CARD 4: BACKUP ESTRUTURADO JSON (.json) -->
          <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>📑 Backup Portátil</span>
                </span>
                <span class="badge badge-info" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">.JSON</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Arquivo estruturado completo com todas as entidades para exportação e inspeção de dados.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-json" style="flex: 1; min-width: 110px; font-size: 12px;">
                📑 Exportar JSON
              </button>
            </div>
          </div>

        </div>
      `;

      bindBackupTabEvents(capitalizedMonth);

    } else if (tab === 'wiki') {
      renderSettingsWikiTab(bodyEl);
    } else if (tab === 'lgpd') {
      renderSettingsLgpdTab(bodyEl);
    }
  };

  document.querySelectorAll('.settings-modal-tab-btn').forEach(btn => {
    btn.onclick = () => renderTabContent(btn.dataset.tab);
  });

  await renderTabContent(activeTab);
}