/* ===
 * auth.js — L7937–8876 do app.js
 */

async function initLoginScreen() {
  const familyId = localStorage.getItem('financeiro_family_id');
  const familyName = localStorage.getItem('financeiro_family_name');
  
  const divider = document.querySelector('.login-divider');
  const list = document.getElementById('user-list');
  
  if (familyId) {
    let users = null;
    try {
      users = await window.api.auth.getUsers({ familyId });
    } catch (e) {
      console.warn("Could not load users list:", e);
    }

    if (users && !users.error && Array.isArray(users) && users.length > 0) {
      list.innerHTML = users.map(u => `
        <div class="user-chip" data-username="${u.username}">
          ${renderAvatarHtml(u, 28)}
          ${u.name}
        </div>`).join('');
      
      const changeWrap = document.createElement('div');
      changeWrap.style.cssText = 'text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;';
      changeWrap.innerHTML = `
        <span>Dispositivo vinculado à <strong>${familyName || 'Família'}</strong></span>
        <button id="btn-change-family" style="background:none; border:none; color: var(--accent-light); cursor: pointer; text-decoration: underline; font-weight: 600; font-family: inherit; font-size: 11px; padding:0;">Alterar</button>
      `;
      list.appendChild(changeWrap);
      
      document.getElementById('btn-change-family').onclick = () => {
        localStorage.removeItem('financeiro_family_id');
        localStorage.removeItem('financeiro_family_name');
        initLoginScreen();
      };
      
      if (divider) divider.style.display = 'flex';
      
      document.querySelectorAll('.user-chip').forEach(chip => {
        chip.onclick = () => { 
          document.getElementById('login-username').value = chip.dataset.username; 
          document.getElementById('login-password').focus(); 
        };
      });
    } else {
      list.innerHTML = '';
      if (divider) divider.style.display = 'none';
      
      const changeWrap = document.createElement('div');
      changeWrap.style.cssText = 'text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;';
      changeWrap.innerHTML = `
        <span>Dispositivo vinculado à <strong>${familyName || 'Família'}</strong></span>
        <button id="btn-change-family" style="background:none; border:none; color: var(--accent-light); cursor: pointer; text-decoration: underline; font-weight: 600; font-family: inherit; font-size: 11px; padding:0;">Alterar</button>
      `;
      list.appendChild(changeWrap);
      
      document.getElementById('btn-change-family').onclick = () => {
        localStorage.removeItem('financeiro_family_id');
        localStorage.removeItem('financeiro_family_name');
        initLoginScreen();
      };
    }
  } else {
    list.innerHTML = `
      <div style="text-align: center; padding: 16px; font-size: 12px; color: var(--text-muted); background: rgba(255,255,255,0.01); border: 1px dashed var(--border); border-radius: var(--radius-sm); margin-bottom: 12px; line-height: 1.5;">
        🔒 <strong>Conexão Segura e Isolada</strong><br>
        Faça login manualmente uma vez para vincular este dispositivo à sua família.
      </div>
    `;
    if (divider) divider.style.display = 'none';
  }
  
  document.getElementById('toggle-login-pass').onclick = () => { const i = document.getElementById('login-password'); i.type = i.type === 'password' ? 'text' : 'password'; };
  document.getElementById('toggle-reg-pass').onclick  = () => { const i = document.getElementById('reg-password');   i.type = i.type === 'password' ? 'text' : 'password'; };
  document.getElementById('go-register').onclick = (e) => { e.preventDefault(); openSignUpWizard(); };
  document.getElementById('go-login').onclick    = (e) => {
    e.preventDefault();
    document.getElementById('register-form-wrap').classList.add('hidden');
    document.getElementById('login-form-wrap').classList.remove('hidden');
  };

  // Esqueci minha senha navigation
  document.getElementById('go-recover').onclick = (e) => {
    e.preventDefault();
    document.getElementById('login-form-wrap').classList.add('hidden');
    document.getElementById('recovery-form-wrap').classList.remove('hidden');
    document.getElementById('recovery-step-1').classList.remove('hidden');
    document.getElementById('recovery-step-2').classList.add('hidden');
    document.getElementById('recovery-error').textContent = '';
    document.getElementById('rec-username').value = '';
    document.getElementById('rec-answer').value = '';
    document.getElementById('rec-new-password').value = '';
  };

  document.getElementById('recovery-go-back').onclick = (e) => {
    e.preventDefault();
    document.getElementById('recovery-form-wrap').classList.add('hidden');
    document.getElementById('login-form-wrap').classList.remove('hidden');
  };

  // Verify username to load security question
  document.getElementById('rec-verify-user-btn').onclick = async () => {
    const username = document.getElementById('rec-username').value.trim();
    const errEl = document.getElementById('recovery-error');
    errEl.textContent = '';
    if (!username) { errEl.textContent = 'Digite seu usuário'; return; }
    
    try {
      const btn = document.getElementById('rec-verify-user-btn');
      btn.disabled = true; btn.textContent = 'Verificando...';
      const r = await window.api.auth.getRecoveryQuestion(username);
      btn.disabled = false; btn.textContent = 'Verificar Usuário';
      
      if (!r.success) {
        errEl.textContent = r.error;
        return;
      }
      
      document.getElementById('rec-question-text').textContent = r.question;
      document.getElementById('recovery-step-1').classList.add('hidden');
      document.getElementById('recovery-step-2').classList.remove('hidden');
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Erro de rede ou servidor';
    }
  };

  // Submit Answer to Reset Password
  document.getElementById('recovery-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('rec-username').value.trim();
    const answer = document.getElementById('rec-answer').value.trim();
    const newPassword = document.getElementById('rec-new-password').value;
    const errEl = document.getElementById('recovery-error');
    errEl.textContent = '';
    
    if (!answer || !newPassword) { errEl.textContent = 'Preencha a resposta e a nova senha'; return; }
    if (newPassword.length < 6) { errEl.textContent = 'A nova senha deve ter no mínimo 6 caracteres'; return; }
    
    try {
      const btn = document.getElementById('rec-reset-btn');
      btn.disabled = true; btn.textContent = 'Processando...';
      const r = await window.api.auth.resetPasswordWithAnswer({ username, answer, newPassword });
      btn.disabled = false; btn.textContent = 'Redefinir Senha';
      
      if (!r.success) {
        errEl.textContent = r.error;
        return;
      }
      
      toast('Senha redefinida com sucesso! Faça login.');
      document.getElementById('recovery-form-wrap').classList.add('hidden');
      document.getElementById('login-form-wrap').classList.remove('hidden');
      document.getElementById('login-username').value = username;
      document.getElementById('login-password').value = '';
      document.getElementById('login-password').focus();
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Erro de conexão';
    }
  };
}

function showWizardFamilyChoiceModal(familyName, ownerName, onJoin, onNew) {
  const dialog = document.createElement('div');
  dialog.id = 'wizard-family-choice-modal';
  dialog.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 13, 20, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10005;
  `;

  dialog.innerHTML = `
    <div class="modal" style="display: block; position: relative; max-width: 500px; width: 90%; background: var(--bg-surface, #141923); border: 1px solid var(--border, #242f41); border-radius: var(--radius-md, 12px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); transform: none; animation: modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1);">
      <div class="modal-body" style="padding: 28px; text-align: center;">
        <span style="font-size: 40px; display: block; margin-bottom: 16px;">👥</span>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary, #ffffff); margin-bottom: 12px;">Família Já Cadastrada!</h3>
        <p style="font-size: 14px; color: var(--text-secondary, #94a3b8); line-height: 1.6; margin-bottom: 24px;">
          A família <strong>${familyName}</strong> já existe no sistema.<br>
          O responsável atual é <strong>${ownerName || 'Administrador'}</strong>.
        </p>
        <p style="font-size: 13px; color: var(--text-muted, #64748b); margin-bottom: 24px; font-style: italic;">
          Deseja se juntar a ela como membro ou prefere criar um grupo familiar novo com este mesmo nome?
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary" id="choice-join" style="width: 100%; padding: 12px; font-weight: 600;">🤝 Sim, quero me juntar a esta família</button>
          <button class="btn btn-secondary" id="choice-new" style="width: 100%; padding: 12px; font-weight: 600; border: 1px dashed var(--border);">🆕 Não, criar uma família nova</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById('choice-join').onclick = () => {
    dialog.remove();
    onJoin();
  };

  document.getElementById('choice-new').onclick = () => {
    dialog.remove();
    onNew();
  };
}

// ════════════════════════════════════════
// NEW SIGNUP WIZARD OVERLAY POP-UP SYSTEM
// ════════════════════════════════════════
let currentSignUpStep = 1;
let signupFamilyId = null;

function openSignUpWizard() {
  const overlay = document.getElementById('signup-wizard-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.add('active');
  }
  currentSignUpStep = 1;
  signupFamilyId = null;
  updateSignUpWizardUI();

  // Clear inputs
  const fn = document.getElementById('wiz-first-name'); if (fn) fn.value = '';
  const ln = document.getElementById('wiz-last-name'); if (ln) ln.value = '';
  const cpf = document.getElementById('wiz-cpf'); if (cpf) cpf.value = '';
  const bd = document.getElementById('wiz-birth-date'); if (bd) bd.value = '';
  const em = document.getElementById('wiz-email'); if (em) em.value = '';
  const ph = document.getElementById('wiz-phone'); if (ph) ph.value = '';
  const fam = document.getElementById('wiz-family-name'); if (fam) fam.value = '';
  const un = document.getElementById('wiz-username'); if (un) un.value = '';
  const pw = document.getElementById('wiz-password'); if (pw) pw.value = '';
  const err = document.getElementById('wiz-error-text'); if (err) err.textContent = '';

  // Setup input listeners for sanitization & masks
  setupWizardMasksAndValidators();
}

function setupWizardMasksAndValidators() {
  const cpfInput = document.getElementById('wiz-cpf');
  if (cpfInput) {
    cpfInput.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (value.length > 11) value = value.slice(0, 11);
      
      // Apply CPF formatting mask: 000.000.000-00
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`;
      }
      e.target.value = value;
    };
  }

  const phoneInput = document.getElementById('wiz-phone');
  if (phoneInput) {
    phoneInput.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (value.length > 11) value = value.slice(0, 11);

      // Apply Phone formatting mask: (00) 00000-0000
      if (value.length > 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      e.target.value = value;
    };
  }

  const usernameInput = document.getElementById('wiz-username');
  if (usernameInput) {
    usernameInput.oninput = (e) => {
      // Sanitize in real-time: lowercase only, replace invalid characters instantly
      let value = e.target.value.toLowerCase();
      value = value.replace(/[^a-z0-9_.-]/g, ""); // Remove anything that is not lowercase, numbers, dots, dashes, underscores
      e.target.value = value;
    };
  }

  const passwordInput = document.getElementById('wiz-password');
  if (passwordInput) {
    passwordInput.oninput = (e) => {
      const pwd = e.target.value;
      const bar = document.getElementById('wiz-pass-strength-bar');
      const text = document.getElementById('wiz-pass-strength-text');

      if (!bar || !text) return;

      if (!pwd) {
        bar.style.width = '0%';
        bar.style.backgroundColor = '#ef4444';
        text.textContent = 'Força: Muito fraca';
        text.style.color = '#ef4444';
        return;
      }

      let score = 0;
      if (pwd.length >= 6) score += 1;
      if (pwd.length >= 10) score += 1;
      if (/\d/.test(pwd)) score += 1; // has digit
      if (/[a-zA-Z]/.test(pwd)) score += 1; // has letter
      if (/[^a-zA-Z0-9]/.test(pwd)) score += 1; // has special char

      // Score: 0 to 5
      let width = '0%';
      let color = '#ef4444';
      let label = 'Muito fraca';

      if (score <= 1) {
        width = '20%';
        color = '#ef4444';
        label = 'Muito fraca 🔴';
      } else if (score === 2) {
        width = '40%';
        color = '#f59e0b';
        label = 'Fraca 🟡';
      } else if (score === 3) {
        width = '60%';
        color = '#fbbf24';
        label = 'Média 🟡';
      } else if (score === 4) {
        width = '80%';
        color = '#34d399';
        label = 'Forte 🟢';
      } else if (score === 5) {
        width = '100%';
        color = '#10b981';
        label = 'Excelente ⚡🟢';
      }

      bar.style.width = width;
      bar.style.backgroundColor = color;
      text.textContent = `Força: ${label}`;
      text.style.color = color;
    };
  }

  const toggleWizPass = document.getElementById('toggle-wiz-pass');
  if (toggleWizPass) {
    toggleWizPass.onclick = () => {
      const pwdInput = document.getElementById('wiz-password');
      if (pwdInput) {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      }
    };
  }
}

function updateSignUpWizardUI() {
  const subText = document.getElementById('wizard-sub-text');
  const fillLine = document.getElementById('wizard-line-fill');
  const btnBack = document.getElementById('wiz-btn-back');
  const btnNext = document.getElementById('wiz-btn-next');
  const errorText = document.getElementById('wiz-error-text');

  if (errorText) errorText.textContent = ''; // clear error on transition

  // Panes
  document.getElementById('wizard-pane-1').classList.add('hidden');
  document.getElementById('wizard-pane-2').classList.add('hidden');
  document.getElementById('wizard-pane-3').classList.add('hidden');
  document.getElementById(`wizard-pane-${currentSignUpStep}`).classList.remove('hidden');

  // Nodes active/completed state
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (node) {
      node.classList.remove('active', 'completed');
      if (i < currentSignUpStep) {
        node.classList.add('completed');
      } else if (i === currentSignUpStep) {
        node.classList.add('active');
      }
    }
  }

  // Stepper connecting line fill width
  if (currentSignUpStep === 1) {
    if (fillLine) fillLine.style.width = '0%';
    if (subText) subText.textContent = 'Passo 1: Seus dados pessoais de cadastro';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Cancelar';
    }
    if (btnNext) btnNext.textContent = 'Avançar →';
  } else if (currentSignUpStep === 2) {
    if (fillLine) fillLine.style.width = '50%';
    if (subText) subText.textContent = 'Passo 2: Contatos e grupo familiar';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Voltar';
    }
    if (btnNext) btnNext.textContent = 'Avançar →';
  } else if (currentSignUpStep === 3) {
    if (fillLine) fillLine.style.width = '100%';
    if (subText) subText.textContent = 'Passo 3: Credenciais de acesso seguro';
    if (btnBack) {
      btnBack.classList.remove('hidden');
      btnBack.textContent = '← Voltar';
    }
    if (btnNext) btnNext.textContent = 'Criar Conta 🎉';
  }
}

// Bind Wizard Buttons once at runtime
setTimeout(() => {
  const backBtn = document.getElementById('wiz-btn-back');
  const nextBtn = document.getElementById('wiz-btn-next');

  if (backBtn) {
    backBtn.onclick = () => {
      if (currentSignUpStep === 1) {
        document.getElementById('signup-wizard-overlay').classList.remove('active');
      } else {
        currentSignUpStep--;
        updateSignUpWizardUI();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = async () => {
      const err = document.getElementById('wiz-error-text');
      if (err) err.textContent = '';

      if (currentSignUpStep === 1) {
        const firstName = document.getElementById('wiz-first-name').value.trim();
        const lastName = document.getElementById('wiz-last-name').value.trim();
        const cpf = document.getElementById('wiz-cpf').value.trim();
        const birthDate = document.getElementById('wiz-birth-date').value;

        if (!firstName || !lastName || !cpf || !birthDate) {
          if (err) err.textContent = 'Por favor, preencha todos os campos pessoais';
          return;
        }
        if (cpf.length < 14) {
          if (err) err.textContent = 'Por favor, digite um CPF válido';
          return;
        }
        currentSignUpStep = 2;
        updateSignUpWizardUI();
      } else if (currentSignUpStep === 2) {
        const email = document.getElementById('wiz-email').value.trim();
        const phone = document.getElementById('wiz-phone').value.trim();
        const familyName = document.getElementById('wiz-family-name').value.trim();

        if (!email || !phone) {
          if (err) err.textContent = 'Por favor, preencha o E-mail e o Celular';
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          if (err) err.textContent = 'Por favor, digite um e-mail válido';
          return;
        }
        if (phone.length < 14) {
          if (err) err.textContent = 'Por favor, digite um celular válido';
          return;
        }

        if (familyName) {
          try {
            nextBtn.disabled = true;
            nextBtn.textContent = 'Verificando...';
            const existingFamily = await window.api.families.checkName(familyName);
            nextBtn.disabled = false;
            nextBtn.textContent = 'Avançar →';

            if (existingFamily) {
              showWizardFamilyChoiceModal(
                existingFamily.name,
                existingFamily.owner_name,
                () => {
                  signupFamilyId = existingFamily.id;
                  currentSignUpStep = 3;
                  updateSignUpWizardUI();
                },
                () => {
                  signupFamilyId = null;
                  currentSignUpStep = 3;
                  updateSignUpWizardUI();
                }
              );
              return;
            }
          } catch (e) {
            console.error('Error verifying family name:', e);
          } finally {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Avançar →';
          }
        }

        signupFamilyId = null;
        currentSignUpStep = 3;
        updateSignUpWizardUI();
      } else if (currentSignUpStep === 3) {
        const firstName = document.getElementById('wiz-first-name').value.trim();
        const lastName = document.getElementById('wiz-last-name').value.trim();
        const cpf = document.getElementById('wiz-cpf').value.trim();
        const birthDate = document.getElementById('wiz-birth-date').value;
        const email = document.getElementById('wiz-email').value.trim();
        const phone = document.getElementById('wiz-phone').value.trim();
        const familyName = document.getElementById('wiz-family-name').value.trim();
        const username = document.getElementById('wiz-username').value.trim();
        const password = document.getElementById('wiz-password').value;
        const recovery_question = document.getElementById('wiz-recovery-question').value;
        const recovery_answer = document.getElementById('wiz-recovery-answer').value.trim();

        if (!username || !password || !recovery_question || !recovery_answer) {
          if (err) err.textContent = 'Por favor, preencha todos os campos do Passo 3';
          return;
        }
        const acceptedTerms = document.getElementById('wiz-accepted-terms').checked;
        if (!acceptedTerms) {
          if (err) err.textContent = 'Você deve aceitar os Termos de Uso e Política de Privacidade para cadastrar-se';
          return;
        }
        if (password.length < 6) {
          if (err) err.textContent = 'A senha deve possuir no mínimo 6 caracteres';
          return;
        }

        const name = `${firstName} ${lastName}`;
        nextBtn.disabled = true;
        nextBtn.textContent = 'Processando...';

        const r = await window.api.auth.register({
          name,
          first_name: firstName,
          last_name: lastName,
          cpf,
          birth_date: birthDate,
          email,
          phone,
          familyName: signupFamilyId ? null : familyName,
          familyId: signupFamilyId,
          username,
          password,
          recovery_question,
          recovery_answer,
          accepted_terms_timestamp: new Date().toISOString(),
          accepted_terms_version: 1
        });

        nextBtn.disabled = false;
        nextBtn.textContent = 'Criar Conta 🎉';

        if (!r.success) {
          if (err) err.textContent = r.error;
          return;
        }

        toast('Família e conta criadas com sucesso!');
        const wizOverlay = document.getElementById('signup-wizard-overlay');
        if (wizOverlay) {
          wizOverlay.classList.remove('active');
          setTimeout(() => { if (!wizOverlay.classList.contains('active')) wizOverlay.style.display = 'none'; }, 300);
        }
        
        // Prefill login username
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').focus();
        
        await initLoginScreen();
      }
    };
  }
}, 500);

function openRegisterModal() {
  Modal.open('Adicionar Usuário', `
    <div class="form-group"><label>Nome completo</label><input type="text" id="mod-name" placeholder="Nome"></div>
    <div class="form-group"><label>Usuário</label><input type="text" id="mod-username" placeholder="Login"></div>
    <div class="form-group"><label>Senha</label><input type="password" id="mod-password" placeholder="Senha"></div>
    <p class="auth-error" id="mod-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="mod-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mod-save">Criar</button>
    </div>`);
  document.getElementById('mod-cancel').onclick = Modal.close;
  document.getElementById('mod-save').onclick = async () => {
    const name = document.getElementById('mod-name').value.trim();
    const username = document.getElementById('mod-username').value.trim();
    const password = document.getElementById('mod-password').value;
    const err = document.getElementById('mod-error');
    if (!name || !username || !password) { err.textContent = 'Preencha todos os campos'; return; }
    const r = await window.api.auth.register({ name, username, password, familyId: State.user.family_id });
    if (!r.success) { err.textContent = r.error; return; }
    toast('Usuário criado!'); Modal.close(); renderSettings();
  };
}

async function openEditUserModal(user) {
  let selectedAvatar = user.avatar_image || null;
  const userPerm = await window.api.permissions.get(user.id);
  const showPermissionsSection = State.permissions.can_edit_all === 1 && user.username !== 'adm';

  const avatarGridItemsHtml = Object.keys(AVATARS).map(key => `
    <div class="avatar-grid-item ${selectedAvatar === key ? 'selected' : ''}" data-avatar-id="${key}">
      ${AVATARS[key]}
    </div>
  `).join('');

  const permissionsHtml = showPermissionsSection ? `
    <div class="settings-section" style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--accent-light); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span>🔒</span> Controle de Acessos & Restrições de Perfil
      </div>
      
      <!-- Seletor de Perfil Didático -->
      <div class="form-group" style="margin-bottom: 12px;">
        <label>Papel na Família (Perfil de Limitação)</label>
        <select id="edit-user-profile-type" style="width: 100%; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px;">
          <option value="2" ${user.profile_type === 2 ? 'selected' : ''}>Adm da Família (Acesso Total)</option>
          <option value="3" ${user.profile_type === 3 ? 'selected' : ''}>Filho Primogênito (Acesso Moderado)</option>
          <option value="4" ${user.profile_type === 4 ? 'selected' : ''}>Filho do Meio (Acesso Básico)</option>
          <option value="5" ${user.profile_type === 5 ? 'selected' : ''}>Filho Caçula (Interface Super Simplificada)</option>
        </select>
      </div>

      <div id="profile-explanation" class="card" style="padding: 12px; margin-bottom: 16px; border: 1px dashed var(--border); background: rgba(255,255,255,0.01);">
        <!-- Preenchido dinamicamente -->
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); cursor: pointer;">
          <input type="checkbox" id="toggle-custom-perms" style="cursor: pointer;">
          <span>🔧 Customizar permissões manualmente (Avançado)</span>
        </label>
      </div>

      <!-- Seção Customizada Oculta -->
      <div id="custom-perms-section" style="display: none;">
        <!-- Níveis de Acesso -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600;">Ver tudo</span>
              <span style="font-size: 11px; color: var(--text-muted);">Visualizar lançamentos de toda a família</span>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" id="edit-user-view-all" ${userPerm.can_view_all === 1 ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600;">Editar tudo / Administrador</span>
              <span style="font-size: 11px; color: var(--text-muted);">Acesso administrativo completo de gestão</span>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" id="edit-user-edit-all" ${userPerm.can_edit_all === 1 ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Acesso aos Menus -->
        <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Menus Permitidos</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-dashboard" ${userPerm.allow_dashboard !== 0 ? 'checked' : ''}>
            <span>📊 Dashboard</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-recurring" ${userPerm.allow_recurring !== 0 ? 'checked' : ''}>
            <span>🔄 Planejamento</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-accounts" ${userPerm.allow_accounts !== 0 ? 'checked' : ''}>
            <span>🏦 Contas</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-budget" ${userPerm.allow_budget !== 0 ? 'checked' : ''}>
            <span>📋 Orçamento</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-goals" ${userPerm.allow_goals !== 0 ? 'checked' : ''}>
            <span>🎯 Metas</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <input type="checkbox" id="edit-user-menu-reports" ${userPerm.allow_reports !== 0 ? 'checked' : ''}>
            <span>📈 Relatórios</span>
          </label>
        </div>
      </div>
    </div>
  ` : '';

  Modal.open('Editar Perfil', `
    <div class="form-group">
      <label>Nome completo</label>
      <input type="text" id="edit-user-name" value="${user.name}">
    </div>
    <div class="form-group">
      <label>Usuário</label>
      <input type="text" id="edit-user-username" value="${user.username}">
    </div>
    <div class="form-group">
      <label>Nova Senha</label>
      <input type="password" id="edit-user-password" placeholder="Deixe em branco para não alterar">
    </div>
    
    <div class="form-group">
      <label class="avatar-selector-label">Escolher Avatar</label>
      <div class="avatar-grid" id="edit-user-avatar-grid">
        ${avatarGridItemsHtml}
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-remove-avatar" style="width: 100%;">Sem Avatar / Iniciais do Nome</button>
    </div>

    ${permissionsHtml}
    
    <p class="auth-error" id="edit-user-error"></p>
    <div class="modal-footer" style="padding:0;border:none;margin-top:12px">
      <button class="btn btn-secondary" id="edit-user-cancel">Cancelar</button>
      <button class="btn btn-primary" id="edit-user-save">Salvar Alterações</button>
    </div>
  `);

  const gridItems = document.querySelectorAll('#edit-user-avatar-grid .avatar-grid-item');
  gridItems.forEach(item => {
    item.onclick = () => {
      gridItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedAvatar = item.dataset.avatarId;
    };
  });

  document.getElementById('btn-remove-avatar').onclick = () => {
    gridItems.forEach(i => i.classList.remove('selected'));
    selectedAvatar = null;
  };

  if (showPermissionsSection) {
    const typeSelect = document.getElementById('edit-user-profile-type');
    const toggleCustom = document.getElementById('toggle-custom-perms');
    const customSection = document.getElementById('custom-perms-section');
    const explanationEl = document.getElementById('profile-explanation');

    const updateExplanation = () => {
      const pType = parseInt(typeSelect.value);
      let html = '';
      switch(pType) {
        case 2:
          html = `
            <div style="font-weight:600; color:var(--accent-light); margin-bottom: 4px;">🔓 Adm da Família</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Acesso Livre:</strong> Todos os menus do aplicativo.<br>
              <strong>Ações:</strong> Gerencia membros da família, define orçamentos e vê lançamentos de todos.
            </p>
          `;
          break;
        case 3:
          html = `
            <div style="font-weight:600; color:#3b82f6; margin-bottom: 4px;">🛡️ Filho Primogênito</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Menus Disponíveis:</strong> Dashboard, Planejamento (Apenas Leitura), Metas e Configurações Básicas.<br>
              <strong>Menus Bloqueados:</strong> Contas, Orçamento e Relatórios.<br>
              <strong>Ações:</strong> Insere lançamentos, coopera com metas e recebe avisos discretos de limites.
            </p>
          `;
          break;
        case 4:
          html = `
            <div style="font-weight:600; color:#8b5cf6; margin-bottom: 4px;">⚡ Filho do Meio</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Menus Disponíveis:</strong> Dashboard, Metas e Configurações Básicas.<br>
              <strong>Menus Bloqueados:</strong> Planejamento, Contas, Orçamento e Relatórios.<br>
              <strong>Ações:</strong> Insere despesas e receitas avulsas, gerencia suas próprias Metas e recebe avisos de limites.
            </p>
          `;
          break;
        case 5:
          html = `
            <div style="font-weight:600; color:#f59e0b; margin-bottom: 4px;">👶 Filho Caçula</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin:0;">
              <strong>Interface Especial:</strong> Sem barra lateral. Tela única focada para crianças.<br>
              <strong>Recursos Didáticos:</strong> Botão rápido <code>⚡ Registrar Gasto</code>, card com total gasto, card com limite e círculo de progresso radial de gastos.
            </p>
          `;
          break;
      }
      explanationEl.innerHTML = html;

      if (!toggleCustom.checked) {
        const editAllCheck = document.getElementById('edit-user-edit-all');
        const viewAllCheck = document.getElementById('edit-user-view-all');
        const menuDashboard = document.getElementById('edit-user-menu-dashboard');
        const menuRecurring = document.getElementById('edit-user-menu-recurring');
        const menuAccounts = document.getElementById('edit-user-menu-accounts');
        const menuBudget = document.getElementById('edit-user-menu-budget');
        const menuGoals = document.getElementById('edit-user-menu-goals');
        const menuReports = document.getElementById('edit-user-menu-reports');

        if (pType === 2) {
          editAllCheck.checked = true;
          viewAllCheck.checked = true;
          menuDashboard.checked = true;
          menuRecurring.checked = true;
          menuAccounts.checked = true;
          menuBudget.checked = true;
          menuGoals.checked = true;
          menuReports.checked = true;
        } else if (pType === 3) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = true;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = true;
          menuReports.checked = false;
        } else if (pType === 4) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = false;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = true;
          menuReports.checked = false;
        } else if (pType === 5) {
          editAllCheck.checked = false;
          viewAllCheck.checked = false;
          menuDashboard.checked = true;
          menuRecurring.checked = false;
          menuAccounts.checked = false;
          menuBudget.checked = false;
          menuGoals.checked = false;
          menuReports.checked = false;
        }
      }
    };

    typeSelect.onchange = updateExplanation;
    toggleCustom.onchange = () => {
      customSection.style.display = toggleCustom.checked ? 'block' : 'none';
      if (!toggleCustom.checked) {
        updateExplanation();
      }
    };

    // Initialize explanation
    updateExplanation();
  }

  document.getElementById('edit-user-cancel').onclick = Modal.close;

  document.getElementById('edit-user-save').onclick = async () => {
    const name = document.getElementById('edit-user-name').value.trim();
    const username = document.getElementById('edit-user-username').value.trim();
    const password = document.getElementById('edit-user-password').value;
    const err = document.getElementById('edit-user-error');

    if (!name || !username) {
      err.textContent = 'Nome e Usuário são obrigatórios';
      return;
    }

    const payload = {
      id: user.id,
      name,
      username,
      password: password || null,
      avatar_image: selectedAvatar,
      profile_type: showPermissionsSection ? parseInt(document.getElementById('edit-user-profile-type').value) : user.profile_type
    };

    const r = await window.api.auth.updateUser(payload);
    if (!r.success) {
      err.textContent = r.error || 'Erro ao atualizar perfil';
      return;
    }

    if (showPermissionsSection) {
      const can_view_all = document.getElementById('edit-user-view-all').checked ? 1 : 0;
      const can_edit_all = document.getElementById('edit-user-edit-all').checked ? 1 : 0;
      const allow_dashboard = document.getElementById('edit-user-menu-dashboard').checked ? 1 : 0;
      const allow_recurring = document.getElementById('edit-user-menu-recurring').checked ? 1 : 0;
      const allow_accounts = document.getElementById('edit-user-menu-accounts').checked ? 1 : 0;
      const allow_budget = document.getElementById('edit-user-menu-budget').checked ? 1 : 0;
      const allow_goals = document.getElementById('edit-user-menu-goals').checked ? 1 : 0;
      const allow_reports = document.getElementById('edit-user-menu-reports').checked ? 1 : 0;

      await window.api.permissions.update({
        targetUserId: user.id,
        can_view_all,
        can_edit_all,
        allow_dashboard,
        allow_recurring,
        allow_accounts,
        allow_budget,
        allow_goals,
        allow_reports
      });
    }

    toast('Perfil atualizado com sucesso!');
    
    if (user.id === State.user.id) {
      State.user.name = name;
      State.user.username = username;
      State.user.avatar_image = selectedAvatar;
      State.user.profile_type = payload.profile_type;
      
      State.permissions = await window.api.permissions.get(user.id);
      applyNavigationPermissions();

      const avatarEl = document.getElementById('sidebar-avatar');
      avatarEl.innerHTML = renderAvatarHtml(State.user, 36);
      avatarEl.style.background = 'transparent';
      avatarEl.style.boxShadow = 'none';
      document.getElementById('sidebar-user-name').textContent = name;
    }

    Modal.close();
    renderSettings();
  };
}

function applyNavigationPermissions() {
  const menus = ['dashboard', 'recurring', 'accounts', 'budget', 'goals', 'reports'];
  menus.forEach(m => {
    const btn = document.querySelector(`.nav-item[data-page="${m}"]`);
    if (btn) {
      if (State.permissions && State.permissions['allow_' + m] === 0) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'flex';
      }
    }
  });
}
