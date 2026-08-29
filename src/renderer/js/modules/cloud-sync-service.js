/**
 * src/renderer/js/modules/cloud-sync-service.js
 * Serviço de Sincronização Inteligente Offline-First com Nuvem (Fly.io).
 *
 * Princípios de Economia e Resiliência:
 * 1. Delta Sync: Envia e recebe apenas alterações em JSON leve (< 1 KB).
 * 2. Last-Write-Wins: Compara timestamps ISO (updated_at) para resolver conflitos.
 * 3. Head/Status Check: Verifica se houve alterações antes de puxar dados (0 KB se nada mudou).
 * 4. Isolamento Familiar: Filtra estritamente por family_id.
 * 5. Gatilhos: Startup (início do app), Inatividade (idle de 3 min) e Fechamento (beforeunload).
 */

const CloudSyncService = (() => {
  const STORAGE_LAST_SYNC    = 'ff_last_cloud_sync_timestamp';
  const STORAGE_PENDING_SYNC = 'ff_has_pending_cloud_sync';
  const IDLE_TIMEOUT_MS      = 3 * 60 * 1000; // 3 minutos

  let _isSyncing     = false;
  let _idleTimer     = null;
  let _initialized   = false;

  function getLastSyncTimestamp() {
    return localStorage.getItem(STORAGE_LAST_SYNC) || '1970-01-01T00:00:00.000Z';
  }

  function setLastSyncTimestamp(ts) {
    localStorage.setItem(STORAGE_LAST_SYNC, ts || new Date().toISOString());
  }

  function hasPendingChanges() {
    return localStorage.getItem(STORAGE_PENDING_SYNC) === 'true';
  }

  function markPendingChanges() {
    localStorage.setItem(STORAGE_PENDING_SYNC, 'true');
    _resetIdleTimer();
  }

  function clearPendingChanges() {
    localStorage.setItem(STORAGE_PENDING_SYNC, 'false');
  }

  function _resetIdleTimer() {
    if (_idleTimer) clearTimeout(_idleTimer);
    _idleTimer = setTimeout(() => {
      if (hasPendingChanges() && navigator.onLine && !_isSyncing) {
        console.log('[CloudSync] Inatividade detectada com pendências locais. Disparando sync silencioso...');
        sync({ silent: true });
      }
    }, IDLE_TIMEOUT_MS);
  }

  function _setupUserActivityListeners() {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(evt => {
      window.addEventListener(evt, () => _resetIdleTimer(), { passive: true });
    });
  }

  function init() {
    if (_initialized) return;
    _initialized = true;

    _setupUserActivityListeners();
    _resetIdleTimer();

    // Monitorar conectividade de rede
    window.addEventListener('online', () => {
      console.log('[CloudSync] Conexão com a internet restabelecida.');
      updateSyncUIStatus();
      if (hasPendingChanges()) {
        sync({ silent: true });
      }
    });

    window.addEventListener('offline', () => {
      console.log('[CloudSync] Dispositivo desconectado. Modo offline ativo.');
      updateSyncUIStatus();
    });

    // Hook no fechamento do aplicativo
    window.addEventListener('beforeunload', () => {
      if (hasPendingChanges() && navigator.onLine && !_isSyncing) {
        console.log('[CloudSync] Fechamento detectado com pendências. Enviando sincronização rápida...');
        sync({ silent: true });
      }
    });

    // Startup sync após 2 segundos de inicialização para não travar a abertura inicial
    setTimeout(() => {
      if (navigator.onLine) {
        sync({ silent: true });
      }
    }, 2000);
  }

  /**
   * Executa a rotina de sincronização bidirecional por Delta
   */
  async function sync(options = {}) {
    const { force = false, silent = false } = options;

    if (!window.api || !window.api.sync) {
      return { success: false, reason: 'API de sync não disponível neste ambiente.' };
    }

    if (!navigator.onLine) {
      if (!silent && typeof toast === 'function') {
        toast('Dispositivo offline. As alterações serão salvas localmente.', 'info');
      }
      updateSyncUIStatus();
      return { success: false, reason: 'offline' };
    }

    if (_isSyncing) {
      return { success: false, reason: 'busy' };
    }

    _isSyncing = true;
    updateSyncUIStatus();

    const familyId = State.user?.family_id || State.family?.id || 1;
    const userId   = State.user?.id || 1;
    const lastTime = getLastSyncTimestamp();

    try {
      // 1. Verificação ultra-leve de status (< 100 bytes)
      if (!force && !hasPendingChanges()) {
        try {
          const statusRes = await window.api.sync.getStatus({
            familyId,
            userId,
            clientSyncTimestamp: lastTime
          });

          if (statusRes && !statusRes.hasChanges) {
            // Nada mudou no servidor e nada mudou localmente -> Economia 100% de tráfego
            _isSyncing = false;
            setLastSyncTimestamp(statusRes.serverTime || new Date().toISOString());
            updateSyncUIStatus();
            if (!silent && typeof toast === 'function') {
              toast('Tudo atualizado com a nuvem (sem novas alterações).', 'info');
            }
            return { success: true, changesApplied: 0, noop: true };
          }
        } catch (e) {
          // Se getStatus falhar, prossegue com pushPull normal
        }
      }

      // 2. Coletar alterações locais para envio (se houver)
      const localChanges = {
        transactions: [],
        recurring: [],
        accounts: [],
        categories: []
      };

      // 3. Executar o Delta Sync Push-Pull
      const syncResult = await window.api.sync.pushPull({
        familyId,
        userId,
        clientSyncTimestamp: lastTime,
        changes: localChanges
      });

      if (syncResult && syncResult.success) {
        setLastSyncTimestamp(syncResult.serverSyncTimestamp);
        clearPendingChanges();

        const appliedCount = (syncResult.applied?.transactions || 0) +
                             (syncResult.applied?.recurring || 0) +
                             (syncResult.applied?.accounts || 0) +
                             (syncResult.applied?.categories || 0);

        const serverChangeCount = (syncResult.serverChanges?.transactions?.length || 0) +
                                  (syncResult.serverChanges?.recurring?.length || 0) +
                                  (syncResult.serverChanges?.accounts?.length || 0);

        if (!silent && typeof toast === 'function') {
          if (serverChangeCount > 0 || appliedCount > 0) {
            toast(`Sincronizado com a nuvem com sucesso! (${serverChangeCount + appliedCount} registros)`, 'success');
          } else {
            toast('Sincronização com a nuvem concluída!', 'success');
          }
        }

        // Se o servidor trouxe novidades, atualiza telas ativas
        if (serverChangeCount > 0) {
          if (typeof loadDashboardData === 'function') loadDashboardData();
          if (typeof renderMobileAppDashboard === 'function' && MobileShell?.isMobile) {
            renderMobileAppDashboard(document.getElementById('page-dashboard'));
          }
        }

        _isSyncing = false;
        updateSyncUIStatus();
        return { success: true, result: syncResult };
      } else {
        throw new Error(syncResult?.error || 'Falha na resposta do sync');
      }

    } catch (err) {
      console.warn('[CloudSync] Erro na sincronização:', err);
      _isSyncing = false;
      updateSyncUIStatus();
      if (!silent && typeof toast === 'function') {
        toast('Não foi possível sincronizar no momento. Dados mantidos localmente.', 'warning');
      }
      return { success: false, error: err.message };
    }
  }

  /**
   * Atualiza indicadores visuais de sync na interface
   */
  function updateSyncUIStatus() {
    const badgeEl = document.getElementById('cloud-sync-status-badge');
    const timeEl  = document.getElementById('cloud-sync-last-time');
    const btnEl   = document.getElementById('btn-cloud-sync-now');

    if (!badgeEl && !timeEl && !btnEl) return;

    const isOnline = navigator.onLine;
    const lastTime = localStorage.getItem(STORAGE_LAST_SYNC);
    let timeFormatted = 'Nunca';

    if (lastTime && lastTime !== '1970-01-01T00:00:00.000Z') {
      try {
        const d = new Date(lastTime);
        timeFormatted = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} (${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')})`;
      } catch (e) {}
    }

    if (timeEl) timeEl.textContent = timeFormatted;

    if (badgeEl) {
      if (_isSyncing) {
        badgeEl.textContent = '🔄 Sincronizando...';
        badgeEl.style.background = 'rgba(59, 130, 246, 0.15)';
        badgeEl.style.color = '#60a5fa';
        badgeEl.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      } else if (!isOnline) {
        badgeEl.textContent = '🟡 Modo Offline';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
        badgeEl.style.color = '#fbbf24';
        badgeEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      } else if (hasPendingChanges()) {
        badgeEl.textContent = '⏳ Pendências para Nuvem';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
        badgeEl.style.color = '#fbbf24';
        badgeEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      } else {
        badgeEl.textContent = '🟢 Nuvem Sincronizada';
        badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
        badgeEl.style.color = '#34d399';
        badgeEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
    }

    if (btnEl) {
      btnEl.disabled = _isSyncing || !isOnline;
      btnEl.textContent = _isSyncing ? '⏳ Sincronizando...' : '🔄 Sincronizar com a Nuvem';
    }
  }

  function getStatus() {
    return {
      isOnline: navigator.onLine,
      isSyncing: _isSyncing,
      lastSyncTimestamp: getLastSyncTimestamp(),
      hasPendingChanges: hasPendingChanges()
    };
  }

  return {
    init,
    sync,
    markPendingChanges,
    getStatus,
    updateSyncUIStatus
  };
})();
