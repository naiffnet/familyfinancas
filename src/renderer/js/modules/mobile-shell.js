/**
 * src/renderer/js/modules/mobile-shell.js
 * Gerenciamento do Ambiente Operacional Mobile, Bottom Navigation Bar, FAB e Ações Rápidas.
 */

const MobileShell = {
  isMobile: false,

  init() {
    this.detectDevice();
    this.initBottomNav();
    this.initFab();
    this.initMoreDrawer();
    this.hookPageChanges();

    window.addEventListener('resize', () => this.detectDevice());
    window.addEventListener('orientationchange', () => this.detectDevice());
  },

  detectDevice() {
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenMobile = window.matchMedia('(max-width: 768px)').matches;
    const touchPointer = window.matchMedia('(pointer: coarse)').matches;

    this.isMobile = userAgentMobile || screenMobile || (touchPointer && window.innerWidth <= 1024);

    if (this.isMobile) {
      document.body.classList.add('is-mobile-env');
      document.documentElement.classList.add('is-mobile-env');
    } else {
      document.body.classList.remove('is-mobile-env');
      document.documentElement.classList.remove('is-mobile-env');
    }
  },

  initBottomNav() {
    const navTabs = document.querySelectorAll('.mobile-nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const page = tab.dataset.page;
        const action = tab.dataset.action;

        if (action === 'more') {
          this.toggleMoreDrawer(true);
          return;
        }

        if (page) {
          this.toggleMoreDrawer(false);
          this.toggleFabMenu(false);

          // Atualizar tabs visuais
          navTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Chamar a navegação nativa do app
          if (typeof navigate === 'function') {
            navigate(page);
          } else {
            const desktopNavBtn = document.getElementById(`nav-${page}`);
            if (desktopNavBtn) desktopNavBtn.click();
          }
        }
      });
    });
  },

  initFab() {
    const fabBtn = document.getElementById('mobile-quick-fab');
    const fabMenu = document.getElementById('mobile-fab-menu');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');

    if (!fabBtn) return;

    fabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = fabMenu?.classList.contains('open');
      this.toggleFabMenu(!isOpen);
    });

    fabBackdrop?.addEventListener('click', () => {
      this.toggleFabMenu(false);
    });

    // Itens do Speed Dial FAB
    document.querySelectorAll('.mobile-fab-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.toggleFabMenu(false);

        if (action === 'expense') {
          if (typeof openAvulsoModal === 'function') {
            openAvulsoModal('expense');
          } else {
            const btn = document.getElementById('btn-new-expense') || document.getElementById('btn-quick-expense');
            btn?.click();
          }
        } else if (action === 'income') {
          if (typeof openAvulsoModal === 'function') {
            openAvulsoModal('income');
          } else {
            const btn = document.getElementById('btn-new-income') || document.getElementById('btn-quick-income');
            btn?.click();
          }
        } else if (action === 'scanner') {
          if (typeof openNfceScannerModal === 'function') {
            openNfceScannerModal();
          } else {
            const btn = document.getElementById('btn-scan-nfce');
            btn?.click();
          }
        } else if (action === 'recurring') {
          if (typeof openRecurringModal === 'function') {
            openRecurringModal();
          } else {
            const btn = document.getElementById('btn-new-recurring');
            btn?.click();
          }
        }
      });
    });
  },

  toggleFabMenu(show) {
    const fabMenu = document.getElementById('mobile-fab-menu');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');
    const fabBtn = document.getElementById('mobile-quick-fab');

    if (show) {
      fabMenu?.classList.add('open');
      fabBackdrop?.classList.add('open');
      if (fabBtn) fabBtn.style.transform = 'rotate(45deg) scale(0.95)';
    } else {
      fabMenu?.classList.remove('open');
      fabBackdrop?.classList.remove('open');
      if (fabBtn) fabBtn.style.transform = 'none';
    }
  },

  initMoreDrawer() {
    const backdrop = document.getElementById('mobile-more-backdrop');
    backdrop?.addEventListener('click', () => this.toggleMoreDrawer(false));

    document.querySelectorAll('.mobile-more-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        const action = item.dataset.action;
        this.toggleMoreDrawer(false);

        if (page) {
          if (typeof navigate === 'function') {
            navigate(page);
          } else {
            const desktopNavBtn = document.getElementById(`nav-${page}`);
            if (desktopNavBtn) desktopNavBtn.click();
          }
        } else if (action === 'theme') {
          const themeBtn = document.getElementById('app-theme-toggle');
          themeBtn?.click();
        } else if (action === 'sync') {
          const syncBtn = document.getElementById('sidebar-sync-btn');
          syncBtn?.click();
        } else if (action === 'logout') {
          const logoutBtn = document.getElementById('sidebar-logout');
          logoutBtn?.click();
        }
      });
    });
  },

  toggleMoreDrawer(show) {
    const drawer = document.getElementById('mobile-more-drawer');
    const backdrop = document.getElementById('mobile-more-backdrop');

    if (show) {
      drawer?.classList.add('open');
      backdrop?.classList.add('open');
    } else {
      drawer?.classList.remove('open');
      backdrop?.classList.remove('open');
    }
  },

  syncActiveTab(pageId) {
    const navTabs = document.querySelectorAll('.mobile-nav-tab');
    navTabs.forEach(t => {
      if (t.dataset.page === pageId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  },

  hookPageChanges() {
    // Observar mudanças de classe na main-content ou interceptar cliques na sidebar
    const observer = new MutationObserver(() => {
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        const pageId = activePage.id.replace('page-', '');
        this.syncActiveTab(pageId);
      }
    });

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      observer.observe(mainContent, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  }
};

// Inicialização automática quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileShell.init());
} else {
  MobileShell.init();
}
