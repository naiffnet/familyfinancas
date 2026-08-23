// ==========================================
// LANDING PAGE INTERACTIVE SCRIPTS
// FinançasFamília
// ==========================================

// 1. Theme Management
function applyLandingTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark-emerald';
  document.documentElement.setAttribute('data-theme', normalized);
  if (document.body) document.body.setAttribute('data-theme', normalized);
  try {
    localStorage.setItem('financas_theme', normalized);
  } catch (e) {
    console.warn('LocalStorage not accessible:', e);
  }
  const themeBtns = document.querySelectorAll('.theme-toggle-btn, #landing-theme-toggle');
  themeBtns.forEach(btn => {
    btn.innerHTML = normalized === 'light' ? '🌙' : '☀️';
    btn.title = normalized === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro';
  });
}

function toggleLandingTheme(e) {
  if (e && e.preventDefault) e.preventDefault();
  const current = (document.documentElement.getAttribute('data-theme') || '').toLowerCase().trim();
  const nextTheme = current === 'light' ? 'dark-emerald' : 'light';
  applyLandingTheme(nextTheme);
}
window.toggleLandingTheme = toggleLandingTheme;
window.applyLandingTheme = applyLandingTheme;

// 2. Smooth Section Scroll Helper
function scrollToSection(sectionId, event) {
  if (event) event.preventDefault();
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const navDrawer = document.getElementById('mobile-nav-drawer');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (navDrawer) navDrawer.classList.remove('open');
  if (menuToggle) menuToggle.classList.remove('open');
}
window.scrollToSection = scrollToSection;

// 3. Mobile Menu Toggle
function toggleMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navDrawer = document.getElementById('mobile-nav-drawer');
  if (menuToggle && navDrawer) {
    navDrawer.classList.toggle('open');
    menuToggle.classList.toggle('open');
  }
}
window.toggleMobileMenu = toggleMobileMenu;

// 4. FAQ Accordion Toggle
function toggleFaq(buttonEl) {
  if (!buttonEl) return;
  const item = buttonEl.closest ? buttonEl.closest('.faq-item') : null;
  if (!item) return;
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const btn = i.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) questionBtn.setAttribute('aria-expanded', 'true');
  }
}
window.toggleFaq = toggleFaq;

// 5. Feature Data & Modal Management
const FEATURES_DATA = {
  cards: {
    icon: '💳',
    badge: 'Controle de Crédito',
    title: 'Faturas & Cartões de Crédito Inteligentes',
    tagline: 'Chega de surpresas no fim do mês! Domine os ciclos de fechamento e vencimento de todos os seus cartões.',
    problem: 'A maioria das famílias se desorganiza porque não sabe quanto do limite total já está ocupado com compras parceladas antigas e quando cada valor será cobrado.',
    benefits: [
      { title: 'Ciclo Bancário em Tempo Real', desc: 'Cadastre o dia de fechamento (melhor dia de compras) e vencimento exatos de cada cartão.' },
      { title: 'Widget de Limite Donut', desc: 'Visualize em gráfico visual de 360° quanto do limite total está livre e quanto está comprometido.' },
      { title: 'Quitação & Liberação em 1 Clique', desc: 'Ao pagar a fatura, o app debita da sua conta corrente e restaura o limite do cartão automaticamente.' },
      { title: 'Personalização com as Cores do seu Banco', desc: 'Identificação visual com Nubank, Inter, Itaú, Bradesco, C6 e outros bancos do Brasil.' }
    ],
    highlight: '💡 Dica de Ouro: Compras feitas após o fechamento da fatura caem apenas no mês seguinte, garantindo até 40 dias de prazo para pagar!'
  },
  reneg: {
    icon: '🤝',
    badge: 'Recurso Exclusivo • NOVO',
    title: 'Renegociação & Parcelamento Guiado de Faturas',
    tagline: 'Atrasou o cartão ou a fatura pesou? Faça acordos com entrada e parcelamento sem perder o controle do limite.',
    problem: 'Ao parcelar uma fatura atrasada com o banco, o usuário não sabe como lançar no controle financeiro, bagunça os meses futuros e perde a noção do limite.',
    benefits: [
      { title: 'Simulador em Tempo Real', desc: 'Simule entrada à vista e parcelamentos de 2x até 36x com juros compostos ou valores fixos fornecidos pelo banco.' },
      { title: 'Amortização Contábil Atômica', desc: 'Dá baixa na fatura anterior com status "Renegociada" e debita a entrada da conta corrente na hora.' },
      { title: 'Comprometimento Inteligente do Limite', desc: 'O limite do cartão segura o saldo financiado e vai liberando mês a mês conforme cada parcela do acordo for quitada.' },
      { title: 'Transparência Familiar', desc: 'Toda a renegociação fica registrada no histórico para que todos acompanhem a extinção da dívida.' }
    ],
    highlight: '⭐ Diferencial Único: Nenhum outro aplicativo financeiro no Brasil realiza a gestão contábil de acordos de fatura com controle de limite como o FinançasFamília!'
  },
  recurring: {
    icon: '🔄',
    badge: 'Automação & Auto-Healing',
    title: 'Motor de Recorrências Inteligente',
    tagline: 'Automatize todas as contas fixas, parcelamentos e salários com inteligência de auto-correção.',
    problem: 'Digitar água, luz, internet, aluguel, assinaturas e parcelamentos todo mês consome tempo e gera esquecimentos que custam multas.',
    benefits: [
      { title: 'Geração Mensal Automática', desc: 'O sistema projeta e cria os lançamentos fixos no primeiro dia do mês sem você precisar redigitar nada.' },
      { title: 'Auto-Healing (Auto-Cura)', desc: 'Se você corrigir o valor ou descrição de uma recorrência, o sistema atualiza retroativamente mantendo a coerência histórica.' },
      { title: 'Controle de Parcelas (Ex: 1/12 a 12/12)', desc: 'Numeração progressiva com contagem regressiva para você saber a data exata em que uma dívida será quitada.' },
      { title: 'Despesas Fixas vs Variáveis', desc: 'Saiba exatamente quanto do seu salário já nasce comprometido antes mesmo de iniciar o mês.' }
    ],
    highlight: '🚀 Economia de Tempo: Economize mais de 2 horas por mês que antes eram perdidas preenchendo planilhas manuais.'
  },
  family: {
    icon: '👨‍👩‍👧‍👦',
    badge: 'Planejamento Familiar',
    title: 'Perfis Familiares & Mesadas Gamificadas',
    tagline: 'Uma solução completa para toda a casa: dos responsáveis aos filhos aprendendo sobre o valor do dinheiro.',
    problem: 'Aplicativos individuais não servem para uma família, e envolver os filhos nas finanças sem expor contas sigilosas costumava ser um obstáculo.',
    benefits: [
      { title: 'Níveis de Permissão por Perfil', desc: 'Perfis dedicados para Responsáveis (administração total), Colaboradores e Filhos/Caçulas.' },
      { title: 'Painel Lúdico de Mesada', desc: 'Interface visual educativa e divertida para os pequenos acompanharem tarefas, mesadas e metas de brinquedos.' },
      { title: 'Privacidade Sob Medida', desc: 'Cada membro pode manter contas particulares ou compartilhar gastos comuns da casa.' },
      { title: 'Auditoria de Eventos', desc: 'Registro transparente de quem lançou ou editou cada despesa da família.' }
    ],
    highlight: '🧸 Educação Financeira Infantil: Ensine seus filhos a poupar e planejar sonhos desde pequenos com um painel interativo!'
  },
  security: {
    icon: '🛡️',
    badge: 'Privacidade & LGPD',
    title: 'Criptografia Forte AES-256 & Privacidade Total',
    tagline: 'Seus dados financeiros não são produto. Tenha a segurança de um cofre bancário no seu próprio computador.',
    problem: 'Aplicativos financeiros gratuitos na nuvem vendem hábitos de consumo e dados bancários para empresas de crédito e publicidade.',
    benefits: [
      { title: '100% Local & Offline', desc: 'O banco de dados SQLite fica no seu computador ou servidor pessoal. Ninguém na internet tem acesso aos seus dados.' },
      { title: 'Criptografia Militar AES-256-GCM', desc: 'Documentos sensíveis (como CPF, contatos e perguntas de segurança) são criptografados antes de gravar no disco.' },
      { title: 'Conformidade Rigorosa com a LGPD', desc: 'Garantia de que suas informações financeiras jamais serão monitoradas, mineradas ou compartilhadas.' },
      { title: 'Backups em 1 Clique', desc: 'Gere backups brutos do banco `.db` ou exportações formatadas em Excel a qualquer momento.' }
    ],
    highlight: '🔒 Privacidade Inegociável: Nem mesmo os desenvolvedores do software têm acesso aos valores, saldos ou transações da sua família.'
  },
  reports: {
    icon: '📊',
    badge: 'Inteligência Financeira',
    title: 'Relatórios Avançados & Fluxo de Caixa',
    tagline: 'Transforme números brutos em decisões inteligentes com gráficos interativos e previsibilidade financeira.',
    problem: 'Saber apenas quanto sobrou na conta é arriscado; é fundamental entender o destino de cada centavo e antecipar os próximos meses.',
    benefits: [
      { title: 'Fluxo de Caixa Mensal & Anual', desc: 'Gráficos comparativos de Receitas vs Despesas vs Saldo Líquido acumulado mês a mês.' },
      { title: 'Distribuição por Categorias', desc: 'Gráfico em rosca dinâmico para identificar onde cortar gastos supérfluos sem sacrificar o conforto.' },
      { title: 'Evolução Patrimonial', desc: 'Acompanhe a curva de valorização e acúmulo de patrimônio e investimentos da família.' },
      { title: 'Exportação Excel com Abas Mensais', desc: 'Gera relatórios XLSX profissionais com abas individuais por mês e resumo anual para auditoria ou imposto de renda.' }
    ],
    highlight: '📈 Previsibilidade Absoluta: Tome decisões com base em dados reais e alcance suas metas familiares muito mais rápido!'
  }
};

function openFeatureModal(featureKey) {
  const data = FEATURES_DATA[featureKey];
  if (!data) return;

  const backdrop = document.getElementById('feature-modal-backdrop');
  const badge = document.getElementById('feature-modal-badge');
  const title = document.getElementById('feature-modal-title');
  const tagline = document.getElementById('feature-modal-tagline');
  const problem = document.getElementById('feature-modal-problem');
  const benefitsGrid = document.getElementById('feature-modal-benefits-grid');
  const highlight = document.getElementById('feature-modal-highlight');

  if (!backdrop) return;

  if (badge) badge.textContent = data.badge;
  if (title) title.innerHTML = `${data.icon} ${data.title}`;
  if (tagline) tagline.textContent = data.tagline;
  if (problem) problem.textContent = data.problem;
  if (highlight) highlight.textContent = data.highlight;

  if (benefitsGrid) {
    benefitsGrid.innerHTML = data.benefits.map(b => `
      <div class="modal-benefit-item">
        <div class="benefit-item-icon">✓</div>
        <div class="benefit-item-content">
          <h4 class="benefit-item-title">${b.title}</h4>
          <p class="benefit-item-desc">${b.desc}</p>
        </div>
      </div>
    `).join('');
  }

  backdrop.classList.remove('hidden');
  backdrop.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
window.openFeatureModal = openFeatureModal;

function closeFeatureModal(event) {
  if (event) {
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
  }
  const backdrop = document.getElementById('feature-modal-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.style.display = 'none';
  }
  document.body.style.overflow = '';
}
window.closeFeatureModal = closeFeatureModal;

function handleBackdropClick(event) {
  const backdrop = document.getElementById('feature-modal-backdrop');
  if (event && event.target === backdrop) {
    closeFeatureModal(event);
  }
}
window.handleBackdropClick = handleBackdropClick;

// 6. Interactive Savings Simulator
const fmtMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function updateCalculator() {
  const slider = document.getElementById('calc-income-slider');
  if (!slider) return;
  const income = parseFloat(slider.value) || 7000;
  const monthlySavings = income * 0.15;
  const yearlySavings = monthlySavings * 12;
  const twoYearsReserve = yearlySavings * 2 * 1.10;

  const incomeDisplay = document.getElementById('calc-income-display');
  const monthlyDisplay = document.getElementById('calc-monthly-savings');
  const yearlyDisplay = document.getElementById('calc-yearly-savings');
  const reserveDisplay = document.getElementById('calc-future-reserve');

  if (incomeDisplay) incomeDisplay.textContent = fmtMoney(income);
  if (monthlyDisplay) monthlyDisplay.textContent = fmtMoney(monthlySavings);
  if (yearlyDisplay) yearlyDisplay.textContent = fmtMoney(yearlySavings);
  if (reserveDisplay) reserveDisplay.textContent = fmtMoney(twoYearsReserve);
}

// 7. Global Keyboard Event (Escape Key)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeFeatureModal(e);
  }
});

// 8. DOMContentLoaded Init
document.addEventListener('DOMContentLoaded', () => {
  // Theme init
  const savedTheme = localStorage.getItem('financas_theme') || 'dark-emerald';
  applyLandingTheme(savedTheme);

  // Theme toggle button click binding
  document.querySelectorAll('.theme-toggle-btn, #landing-theme-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLandingTheme(e);
    });
  });

  // Calculator init
  const slider = document.getElementById('calc-income-slider');
  if (slider) {
    slider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  // Feature cards click event listener fallback
  const cardKeyMap = {
    0: 'cards',
    1: 'reneg',
    2: 'recurring',
    3: 'family',
    4: 'security',
    5: 'reports'
  };

  document.querySelectorAll('.features-grid .feature-card').forEach((card, index) => {
    const key = cardKeyMap[index];
    if (key) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openFeatureModal(key);
      });
    }
  });

  // Modal close buttons event listeners
  document.querySelectorAll('.feature-modal-close, .feature-modal-btn-dismiss').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeFeatureModal(e);
    });
  });

  const modalBackdrop = document.getElementById('feature-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeFeatureModal(e);
      }
    });
  }

  // FAQ accordion click event listener binding
  document.querySelectorAll('.faq-item .faq-question').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFaq(button);
    });
  });
});

// Immediate Theme Apply
(function() {
  try {
    const savedTheme = localStorage.getItem('financas_theme') || 'dark-emerald';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch (e) {}
})();
