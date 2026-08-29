/* ===
 * settings-2.js — Parte 2 de settings
 * Linhas 7471–7936 do app.js
 */

function bindProfileTabEvents(categories, users) {
  const profCpf = document.getElementById('prof-cpf');
  if (profCpf) {
    profCpf.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
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

  const profPhone = document.getElementById('prof-phone');
  if (profPhone) {
    profPhone.oninput = (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
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

  const profUsername = document.getElementById('prof-username');
  if (profUsername) {
    profUsername.oninput = (e) => {
      let value = e.target.value.toLowerCase();
      value = value.replace(/[^a-z0-9_.-]/g, "");
      e.target.value = value;
    };
  }

  const saveProfileBtn = document.getElementById('save-my-profile');
  if (saveProfileBtn) {
    saveProfileBtn.onclick = async () => {
      const err = document.getElementById('prof-error-text');
      if (err) err.textContent = '';
      
      const firstName = document.getElementById('prof-first-name').value.trim();
      const lastName = document.getElementById('prof-last-name').value.trim();
      const cpf = document.getElementById('prof-cpf').value.trim();
      const birthDate = document.getElementById('prof-birth-date').value;
      const email = document.getElementById('prof-email').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const username = document.getElementById('prof-username') ? document.getElementById('prof-username').value.trim() : State.user.username;
      const password = document.getElementById('prof-password').value;
      const recovery_question = document.getElementById('prof-recovery-question').value;
      const recovery_answer = document.getElementById('prof-recovery-answer').value.trim();

      if (!firstName || !lastName || !cpf || !birthDate || !email || !phone || !username) {
        if (err) err.textContent = 'Por favor, preencha todos os campos obrigatórios';
        return;
      }

      if (cpf.length < 14) {
        if (err) err.textContent = 'CPF inválido';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (err) err.textContent = 'E-mail inválido';
        return;
      }
      if (phone.length < 14) {
        if (err) err.textContent = 'Celular inválido';
        return;
      }

      const payload = {
        id: State.user.id,
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        cpf,
        birth_date: birthDate,
        email,
        phone,
        username,
        recovery_question,
      };
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          if (err) err.textContent = 'A nova senha deve possuir no mínimo 6 caracteres';
          return;
        }
        payload.password = password;
      }
      if (recovery_answer) {
        payload.recovery_answer = recovery_answer;
      }

      const r = await window.api.auth.updateUser(payload);
      if (!r.success) {
        if (err) err.textContent = r.error;
        return;
      }

      State.user.name = payload.name;
      State.user.first_name = payload.first_name;
      State.user.last_name = payload.last_name;
      State.user.cpf = payload.cpf;
      State.user.birth_date = payload.birth_date;
      State.user.email = payload.email;
      State.user.phone = payload.phone;
      State.user.username = payload.username;
      
      document.getElementById('sidebar-user-name').textContent = State.user.name;
      toast('Seu perfil foi atualizado com sucesso!', 'success');
      openSettingsModal('profile');
    };
  }

  if (document.getElementById('save-alert-days')) {
    document.getElementById('save-alert-days').onclick = async () => {
      const days = parseInt(document.getElementById('alert-days').value);
      if (!days || days < 1) { toast('Informe um valor válido', 'error'); return; }
      await window.api.settings.set(State.user.id, 'alert_days_before', days);
      State.settings.alert_days_before = days;
      toast('Configuração de alertas salva!');
    };
  }

  if (document.getElementById('btn-add-user')) {
    document.getElementById('btn-add-user').onclick = () => openRegisterModal();
  }

  if (State.permissions.can_edit_all === 1) {
    document.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.onclick = () => {
        const uId = parseInt(btn.dataset.id);
        const targetUser = users.find(u => u.id === uId);
        if (targetUser) openEditUserModal(targetUser);
      };
    });

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.onclick = async () => {
        const uId = parseInt(btn.dataset.id);
        const targetUser = users.find(u => u.id === uId);
        if (targetUser) {
          const confirmMsg = `Tem certeza que deseja excluir o usuário "${targetUser.name}" (@${targetUser.username})?`;
          if (confirm(confirmMsg)) {
            const r = await window.api.auth.deleteUser(uId);
            if (r && r.error) {
              toast(r.error, 'error');
            } else {
              toast('Usuário excluído');
              openSettingsModal('profile');
            }
          }
        }
      };
    });
  }
}

function bindBackupTabEvents(capitalizedMonth) {
  const downloadBase64File = (base64Content, filename, mimeType) => {
    const binaryStr = atob(base64Content);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (document.getElementById('btn-cloud-sync-now')) {
    document.getElementById('btn-cloud-sync-now').onclick = async () => {
      if (typeof CloudSyncService !== 'undefined') {
        await CloudSyncService.sync({ force: true });
      }
    };
  }

  if (document.getElementById('btn-backup')) {
    document.getElementById('btn-backup').onclick = async () => {
      try {
        const r = await window.api.backup.export();
        if (r && r.fileData) {
          downloadBase64File(r.fileData, r.filename || 'financeiro.db', 'application/x-sqlite3');
          toast('Backup exportado com sucesso!');
        } else if (r && r.success) {
          toast('Backup exportado!');
        } else {
          toast('Erro ao exportar backup', 'error');
        }
      } catch (err) {
        toast('Erro na exportação: ' + err.message, 'error');
      }
    };
  }

  if (document.getElementById('btn-test-backup')) {
    document.getElementById('btn-test-backup').onclick = () => {
      document.getElementById('input-test-backup').click();
    };

    document.getElementById('input-test-backup').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      toast('Analisando integridade do arquivo SQLite...');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        try {
          // Salva temporariamente no backend para validar via PRAGMA
          const res = await window.api.backup.testIntegrity({ fileData: base64, filename: file.name });
          if (res && res.success) {
            const counts = res.tableCounts || {};
            const summaryStr = Object.entries(counts).map(([k, v]) => `• ${k}: ${v} registros`).join('\n');
            alert(`🔍 DIAGNÓSTICO DE INTEGRIDADE SQLITE:\n\n` +
                  `✅ Status: Arquivo 100% íntegro!\n` +
                  `📦 Tamanho: ${res.sizeFormatted}\n` +
                  `🛡️ PRAGMA integrity_check: ${res.integrityResult}\n\n` +
                  `📊 Contagem de Registros:\n${summaryStr}\n\n` +
                  `Este arquivo é seguro e válido para restauração.`);
          } else {
            alert('❌ Falha no teste de integridade: ' + (res?.error || 'Arquivo corrompido ou formato SQLite inválido.'));
          }
        } catch (err) {
          alert('Erro ao testar integridade: ' + err.message);
        }
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    };
  }

  if (document.getElementById('btn-restore-backup')) {
    document.getElementById('btn-restore-backup').onclick = () => {
      document.getElementById('input-restore-backup').click();
    };
    
    document.getElementById('input-restore-backup').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const confirmRestore = confirm('⚠️ ATENÇÃO: Restaurar o banco de dados irá SOBRESCREVER todos os dados atuais!');
      if (!confirmRestore) { e.target.value = ''; return; }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        try {
          const res = await window.api.backup.restore({ fileData: base64 });
          if (res.success) {
            alert('Banco de dados restaurado com sucesso!');
            window.location.reload();
          } else {
            alert('Erro ao restaurar: ' + (res.error || 'Erro desconhecido.'));
          }
        } catch (err) {
          alert('Erro ao restaurar: ' + err.message);
        }
      };
      reader.readAsDataURL(file);
    };
  }

  const loadSqliteMetrics = async () => {
    const container = document.getElementById('sqlite-metrics-content');
    if (!container) return;
    try {
      const res = await window.api.server.getMetrics();
      if (!res || !res.success) {
        container.innerHTML = `<span style="color:#f87171">Não foi possível obter métricas: ${res?.error || 'Erro'}</span>`;
        return;
      }
      const { sqlite, tableCounts, process: proc } = res;
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Tamanho Total (.db + WAL)</div>
            <div style="font-size: 16px; font-weight: 700; color: #34d399; margin-top: 2px;">${sqlite.totalFormatted}</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Modo de Journal & FK</div>
            <div style="font-size: 14px; font-weight: 700; color: #60a5fa; margin-top: 2px;">${(sqlite.journalMode || 'wal').toUpperCase()} • FKs ${sqlite.foreignKeys ? 'Ativas' : 'Desat.'}</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Memória do Processo</div>
            <div style="font-size: 14px; font-weight: 700; color: #c084fc; margin-top: 2px;">${proc.memoryRssMb} (Heap: ${proc.memoryHeapUsedMb})</div>
          </div>
          <div style="padding: 10px; border-radius: var(--radius-sm); background: var(--bg-raised); border: 1px solid var(--border);">
            <div style="font-size: 11px; color: var(--text-muted);">Uptime do Sistema</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${Math.floor(proc.uptimeSeconds / 60)} min (${proc.uptimeSeconds}s)</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; color: var(--text-muted); background: var(--bg-base); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <span>📊 <strong>Lançamentos:</strong> ${tableCounts.transactions || 0}</span>
          <span>•</span>
          <span>💳 <strong>Faturas:</strong> ${tableCounts.invoices || 0}</span>
          <span>•</span>
          <span>🏦 <strong>Contas:</strong> ${tableCounts.accounts || 0}</span>
          <span>•</span>
          <span>🔄 <strong>Recorrências:</strong> ${tableCounts.recurring_items || 0}</span>
          <span>•</span>
          <span>🛡️ <strong>Logs Auditoria:</strong> ${tableCounts.audit_logs || 0}</span>
          <span>•</span>
          <span>👥 <strong>Usuários:</strong> ${tableCounts.users || 0}</span>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<span style="color:#f87171">Erro ao carregar métricas: ${err.message}</span>`;
    }
  };

  document.getElementById('btn-refresh-metrics')?.addEventListener('click', loadSqliteMetrics);
  loadSqliteMetrics();

  if (document.getElementById('btn-export-month')) {
    document.getElementById('btn-export-month').onclick = async () => {
      try {
        const res = await window.api.backup.exportExcel({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, type: 'monthly' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          }
          toast('Excel mensal exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-year')) {
    document.getElementById('btn-export-year').onclick = async () => {
      try {
        const res = await window.api.backup.exportExcel({ userId: State.user.id, year: State.currentYear, type: 'annual' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          }
          toast('Excel anual exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-csv-month')) {
    document.getElementById('btn-export-csv-month').onclick = async () => {
      try {
        const res = await window.api.backup.exportCsv({ userId: State.user.id, month: State.currentMonth, year: State.currentYear, type: 'monthly' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'text/csv;charset=utf-8;');
          }
          toast('CSV mensal exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar CSV: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar CSV: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-csv-year')) {
    document.getElementById('btn-export-csv-year').onclick = async () => {
      try {
        const res = await window.api.backup.exportCsv({ userId: State.user.id, year: State.currentYear, type: 'annual' });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'text/csv;charset=utf-8;');
          }
          toast('CSV anual exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar CSV: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar CSV: ' + err.message, 'error'); }
    };
  }

  if (document.getElementById('btn-export-json')) {
    document.getElementById('btn-export-json').onclick = async () => {
      try {
        const res = await window.api.backup.exportJson({ userId: State.user.id });
        if (res.success) {
          if (res.isWebDownload && res.content) {
            downloadBase64File(res.content, res.filename, 'application/json;charset=utf-8;');
          }
          toast('Backup JSON exportado!');
        } else if (res.message !== 'Cancelado') {
          toast('Erro ao exportar JSON: ' + (res.error || 'Erro desconhecido'), 'error');
        }
      } catch (err) { toast('Erro ao exportar JSON: ' + err.message, 'error'); }
    };
  }
}

function bindLgpdTabEvents() {
  const btnShowTerms = document.getElementById('btn-show-terms-settings');
  const btnShowPrivacy = document.getElementById('btn-show-privacy-settings');
  if (btnShowTerms) {
    btnShowTerms.onclick = () => {
      const overlay = document.getElementById('lgpd-modal-overlay');
      const title = document.getElementById('lgpd-modal-title');
      const content = document.getElementById('lgpd-modal-content');
      title.textContent = 'Termos de Uso';
      content.textContent = TERMS_OF_USE_TEXT;
      overlay.style.display = 'flex';
    };
  }
  if (btnShowPrivacy) {
    btnShowPrivacy.onclick = () => {
      const overlay = document.getElementById('lgpd-modal-overlay');
      const title = document.getElementById('lgpd-modal-title');
      const content = document.getElementById('lgpd-modal-content');
      title.textContent = 'Política de Privacidade (LGPD)';
      content.textContent = PRIVACY_POLICY_TEXT;
      overlay.style.display = 'flex';
    };
  }

  const btnExportMyData = document.getElementById('btn-export-my-data');
  if (btnExportMyData) {
    btnExportMyData.onclick = async () => {
      try {
        const data = await window.api.auth.exportMyData(State.user.id);
        if (!data) { toast('Erro ao exportar seus dados', 'error'); return; }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `meus-dados-financeiro-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast('Seus dados foram exportados com sucesso!', 'success');
      } catch (err) {
        toast('Erro ao exportar dados: ' + err.message, 'error');
      }
    };
  }

  const btnDeleteMyAccount = document.getElementById('btn-delete-my-account');
  if (btnDeleteMyAccount) {
    btnDeleteMyAccount.onclick = () => {
      if (State.user.username === 'adm') {
        toast('O administrador do sistema (adm) não pode ser excluído!', 'error');
        return;
      }
      Modal.open('⚠️ Confirmar Exclusão de Conta', `
        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">
          Esta ação é irreversível. Para confirmar a exclusão completa de todos os seus dados cadastrais e financeiros do sistema, digite a sua senha de acesso abaixo:
        </div>
        <div class="form-group">
          <label for="delete-account-password">Sua Senha de Acesso</label>
          <input type="password" id="delete-account-password" placeholder="Digite sua senha atual" style="width:100%;">
        </div>
        <p class="auth-error" id="delete-account-error" style="margin: 0; font-size: 12px;"></p>
        <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
          <button class="btn btn-secondary" id="btn-cancel-delete">Cancelar</button>
          <button class="btn btn-danger" id="btn-confirm-delete" style="background-color: #ef4444; border-color: #ef4444; color: #ffffff;">Excluir Conta Permanentemente</button>
        </div>
      `);
      
      document.getElementById('btn-cancel-delete').onclick = Modal.close;
      document.getElementById('btn-confirm-delete').onclick = async () => {
        const passwordInput = document.getElementById('delete-account-password').value;
        const errEl = document.getElementById('delete-account-error');
        errEl.textContent = '';
        if (!passwordInput) { errEl.textContent = 'Por favor, insira sua senha.'; return; }
        const confirmBtn = document.getElementById('btn-confirm-delete');
        confirmBtn.disabled = true; confirmBtn.textContent = 'Processando...';
        
        const authCheck = await window.api.auth.login({ username: State.user.username, password: passwordInput });
        if (!authCheck.success) {
          errEl.textContent = 'Senha incorreta. Acesso negado.';
          confirmBtn.disabled = false; confirmBtn.textContent = 'Excluir Conta Permanentemente';
          return;
        }
        
        const delRes = await window.api.auth.deleteSelf(State.user.id);
        if (delRes.success) {
          Modal.close();
          toast('Sua conta e todos os seus dados foram purgados do sistema.', 'success');
          localStorage.removeItem('sessionToken');
          sessionStorage.removeItem('sessionToken');
          State.user = null;
          State.token = null;
          setTimeout(() => { window.location.reload(); }, 1500);
        } else {
          errEl.textContent = delRes.error || 'Erro ao processar exclusão de dados.';
          confirmBtn.disabled = false; confirmBtn.textContent = 'Excluir Conta Permanentemente';
        }
      };
    };
  }
}

function openCategoryModal(categories, editCategory = null) {
  const initialIcon = editCategory ? editCategory.icon : '📋';
  const initialColor = editCategory ? editCategory.color : COLORS[0];
  const initialType = editCategory ? editCategory.type : 'expense';
  const initialName = editCategory ? editCategory.name : '';

  Modal.open(editCategory ? 'Editar Categoria' : 'Nova Categoria', `
    <div class="form-group"><label>Nome</label><input type="text" id="cat-name" placeholder="Nome da categoria" value="${initialName}"></div>
    <div class="form-group"><label>Tipo</label><select id="cat-type">
      <option value="expense" ${initialType === 'expense' ? 'selected' : ''}>Despesa</option>
      <option value="income" ${initialType === 'income' ? 'selected' : ''}>Receita</option>
    </select></div>
    <div class="form-group"><label>Ícone</label><div class="icon-picker" id="cat-icon-picker">${[...ICONS_EXPENSE,...ICONS_INCOME].map(i => `<button class="icon-btn ${i===initialIcon?'selected':''}" data-icon="${i}">${i}</button>`).join('')}</div></div>
    <div class="form-group"><label>Cor</label><div class="color-picker" id="cat-color-picker">${COLORS.map(c => `<div class="color-swatch ${c===initialColor?'selected':''}" style="background:${c}" data-color="${c}"></div>`).join('')}</div></div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:4px">
      <button class="btn btn-secondary" id="cat-cancel">Cancelar</button>
      <button class="btn btn-primary" id="cat-save">${editCategory ? 'Salvar' : 'Criar'}</button>
    </div>`);

  let icon = initialIcon, color = initialColor;
  document.querySelectorAll('#cat-icon-picker .icon-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('#cat-icon-picker .icon-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); icon = btn.dataset.icon; }; });
  document.querySelectorAll('#cat-color-picker .color-swatch').forEach(sw => { sw.onclick = () => { document.querySelectorAll('#cat-color-picker .color-swatch').forEach(s => s.classList.remove('selected')); sw.selected = true; sw.classList.add('selected'); color = sw.dataset.color; }; });
  document.getElementById('cat-cancel').onclick = Modal.close;
  document.getElementById('cat-save').onclick = async () => {
    const name = document.getElementById('cat-name').value.trim();
    if (!name) { toast('Informe o nome', 'error'); return; }
    
    let res;
    if (editCategory) {
      res = await window.api.categories.update({ id: editCategory.id, name, type: document.getElementById('cat-type').value, color, icon });
      if (res && res.error) {
        toast('Erro ao atualizar categoria: ' + res.error, 'error');
        return;
      }
      toast('Categoria atualizada');
    } else {
      res = await window.api.categories.create({ user_id: State.user.id, name, type: document.getElementById('cat-type').value, color, icon });
      if (res && res.error) {
        toast('Erro ao criar categoria: ' + res.error, 'error');
        return;
      }
      toast('Categoria criada');
    }
    Modal.close(); renderSettings();
  };
}

// ════════════════════════════════════════
// LOGIN / AUTH
// ════════════════════════════════════════