/* manual-b.js - parte 2/2 */

/**
 * Retorna o HTML dos tópicos 6 a 10 (incluindo FAQ) do painel de conteúdo
 */
function getManualTopicsPart2Html() {
  return `
    <!-- TÓPICO 6.1: SYNC > UUIDS & MULTI-APARELHO -->
    <div class="manual-topic-content" id="topic-sync-uuid" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔑 Identificadores Globais Universais (UUID v4) & Multi-Dispositivo</span>
        <span class="badge badge-blue">Smart Sync</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Arquitetura Resiliente para Sincronização Desktop e Web:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para permitir que membros da família usem o app no notebook (Desktop) e no celular (Web) simultaneamente sem conflitos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🌐 <strong>UUID Global (128 bits):</strong> Todo lançamento ganha um identificador único universal (<code>sync_id</code>). Isso impede colisões de ID numérico (ex: Desktop e Web criando o ID #1506).</li>
          <li>⏱️ <strong>Last-Write-Wins:</strong> Atualizações em um mesmo lançamento são resolvidas automaticamente com base no carimbo de data/hora mais recente (<code>updated_at</code>).</li>
          <li>🗑️ <strong>Soft-Delete:</strong> Exclusões são sincronizadas de forma limpa sem deixar registros fantasmas em outros aparelhos.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.2: SYNC > REGRA DE RECEITAS (NOVO) -->
    <div class="manual-topic-content" id="topic-sync-receitas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💰 Regra de Ouro para Receitas & Mesma Titularidade</span>
        <span class="badge badge-green">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como o sistema analisa o recebimento de receitas e salários:</strong>
        </div>
        <p style="margin-bottom: 10px;">Nas <strong>Receitas</strong> (salários, pró-labore, aluguéis recebidos, PIX recebidos), aplicam-se filtros completos de valor, data e título, respeitando as contas:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Contas Diferentes de Membros Distintos = 100% Ignoradas:</strong> Se William recebe R$ 4.000 no Itaú e Jennifer recebe R$ 4.000 no Nubank, o motor <strong>ignora totalmente</strong> e não gera alerta, pois são rendas legítimas e independentes de cada familiar.</li>
          <li>🚨 <strong>Mesma Conta Bancária:</strong> Se uma receita de mesmo valor e data for cadastrada duas vezes na <strong>mesma conta</strong>, o motor acusa duplicidade com Altíssima Certeza (95-100%).</li>
          <li>⚠️ <strong>Contas Diferentes do MESMO Titular:</strong> Se o próprio usuário lançar a mesma receita no Itaú e depois no Nubank por engano, o sistema identifica que ambas as contas pertencem ao mesmo usuário e acusa duplicidade com banco trocado (85-90%).</li>
          <li>⚡ <strong>Aviso em Tempo Real no Formulário:</strong> Ao preencher uma receita no modal, surge um alerta instantâneo: <em>"Atenção: Já existe uma receita similar de William em 20/08 na conta Itaú no valor de R$ 4.000,00..."</em>.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.3: SYNC > MOTOR HEURÍSTICO & HIERARQUIA DE DÍVIDAS -->
    <div class="manual-topic-content" id="topic-sync-dedup" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🧠 Motor Heurístico Anti-Duplicidade & Hierarquia de Dívidas</span>
        <span class="badge badge-purple">Inteligência Familiar</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Hierarquia de Análise para Dívidas e Despesas:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para despesas e pagamentos da casa, o motor segue uma rigorosa escala de critérios:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Nível 1 (Valor Exato + Datas Próximas):</strong> Compara valores idênticos com tolerância de até ±2 dias e compensações bancárias de fim de semana (sexta/sábado/domingo compensados na segunda/terça).</li>
          <li><strong>Nível 2 (Data Exata + Valores Aproximados):</strong> Detecta despesas no mesmo dia com pequenas variações de centavos, taxas ou gorjetas (até 2% a 5%).</li>
          <li><strong>Nível 3 (Títulos e NLP Bancário):</strong> Limpa ruídos e stopwords bancárias (<code>PIX</code>, <code>TED</code>, <code>PAGTO</code>, <code>COMPRA</code>, <code>DÉBITO</code>, <code>CRÉDITO</code>) e compara os estabelecimentos com busca inteligente por prefixos (ex: <em>"Zaffari Ipiranga"</em> vs <em>"Cia Zaffari"</em>).</li>
          <li><strong>Contas Diferentes com Lojas Diferentes = 0% Duplicata:</strong> Se o valor for R$ 50 no Itaú (Farmácia) e R$ 50 no Nubank (Padaria), é <strong>100% ignorado</strong>.</li>
          <li>🔢 <strong>Parcelamento Inteligente:</strong> Se o Lançamento A diz <em>"Sofá (2/10)"</em> e o B diz <em>"Sofá (3/10)"</em>, o motor sabe que <strong>NÃO é duplicata</strong>. Se ambos disserem <em>"2/10"</em> e <em>"2 de 10"</em>, acusa duplicata de 100%!</li>
          <li>🏷️ <strong>Mesma Conta Fixa Recorrente:</strong> Lançamentos que apontam para o mesmo item fixo do mês (ex: <em>Aluguel, Luz, Internet</em>) são detectados automaticamente com 100% de confiança.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 6.4: SYNC > CONCILIAÇÃO VISUAL E AÇÕES EM LOTE -->
    <div class="manual-topic-content" id="topic-sync-conciliacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ Central Avançada de Conciliação, Filtros e Ações em Lote</span>
        <span class="badge badge-cyan">Painel Completo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Painel Dedicado de Auditoria & Conciliação Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao clicar no botão <code>🛡️</code> na barra lateral ou no banner de alerta do Dashboard, você acessa a central:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🎯 <strong>Classificação por Nível de Certeza:</strong> Badges cromáticos informam o grau de confiança: <span class="badge badge-success">🟢 Altíssima Certeza (95-100%)</span>, <span class="badge badge-danger">🟡 Provável (80-94%)</span> e <span class="badge badge-warning">🔵 Suspeito (65-79%)</span>.</li>
          <li>🎛️ <strong>Filtros Interativos:</strong> Filtre a lista por membro da família, nível de certeza ou conta bancária pagadora.</li>
          <li>⚡ <strong>Ações em Lote:</strong> Botão <code>[ ⚡ Mesclar Certezas (100%) ]</code> e <code>[ 🔗 Mesclar Selecionados ]</code> para resolver dezenas de duplicidades com 1 único clique.</li>
          <li>📜 <strong>Aba de Histórico:</strong> Registra todas as conciliações e desfechos anteriores para prestação de contas e auditoria.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 7.1: ORÇAMENTOS > BUDGETS -->
    <div class="manual-topic-content" id="topic-orc-budgets" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
        🎯 Tetos de Gastos por Categoria (Orçamento)
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Estabeleça um limite mensal máximo para categorias como Alimentação, Lazer e Transporte. A barra de progresso avisa com cores quando o teto estiver próximo de ser atingido.</p>
      </div>
    </div>

    <!-- TÓPICO 7.2: ORÇAMENTOS > METAS -->
    <div class="manual-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
        🏆 Metas Financeiras & Cofrinhos de Economia
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Crie objetivos como Viagem de Férias, Reserva de Emergência ou Troca de Carro, registrando aportes mensais com cálculo automático da data estimada de conclusão.</p>
      </div>
    </div>

    <!-- TÓPICO 8.1: METODOLOGIA 50-30-20 -->
    <div class="manual-topic-content" id="topic-met-regra" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #c084fc; font-weight: 700;">
        💡 A Metodologia 50-30-20 Aplicada à Família
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;">
          <div style="flex: 1; min-width: 150px; background: rgba(59,130,246,0.1); border-left: 4px solid var(--blue); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #60a5fa;">50% — Necessidades</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Aluguel, condomínio, luz, água, alimentação básica e saúde.</div>
          </div>
          <div style="flex: 1; min-width: 150px; background: rgba(16,185,129,0.1); border-left: 4px solid var(--green); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #34d399;">30% — Desejos / Lazer</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Restaurantes, assinaturas, passeios, compras e hobbies.</div>
          </div>
          <div style="flex: 1; min-width: 150px; background: rgba(139,92,246,0.1); border-left: 4px solid var(--purple); padding: 12px; border-radius: 6px;">
            <div style="font-weight: 700; color: #c084fc;">20% — Futuro & Metas</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Reserva de emergência, investimentos e quitação antecipada.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TÓPICO 9.1: ARQUITETURA MODULAR & BUILD -->
    <div class="manual-topic-content" id="topic-arq-modular" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏗️ Nova Arquitetura Modular & Manutenção Ágil</span>
        <span class="badge badge-yellow">Engenharia v2</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(234, 179, 8, 0.08); border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Código 100% Desacoplado (Arquivos com no máximo 900 linhas):</strong>
        </div>
        <p style="margin-bottom: 10px;">Para garantir alta velocidade de carregamento, facilidade de manutenção e eliminar arquivos monolíticos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🧩 <strong>Frontend Modularizado (21 Módulos em <code>src/renderer/js/modules/</code>):</strong> Dashboard, Planejamento, Contas, Configurações, Modais, Autenticação e Deduplicação separados em submódulos concisos.</li>
          <li>💾 <strong>Banco SQLite Modular (8 Módulos em <code>src/database/</code>):</strong> Camadas de Transações, Contas, Usuários/LGPD, Faturas, Relatórios e Anti-Duplicidade desacopladas em mixins limpos.</li>
          <li>🎨 <strong>Folhas de Estilo (4 Folhas em <code>src/renderer/css/</code>):</strong> <code>base.css</code>, <code>components.css</code>, <code>views.css</code> e <code>responsive-features.css</code> agregadas via <code>@import</code>.</li>
          <li>⚡ <strong>Scripts de Build:</strong> Execute <code>npm run build:renderer</code> para compilar alterações ou <code>npm run watch:renderer</code> para compilação instantânea em segundo plano.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 10.1: FAQ INTERATIVO -->
    <div class="manual-topic-content" id="topic-faq-interativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f87171; font-weight: 700;">
        ❓ Perguntas Frequentes (FAQ Interativo — Clique para abrir a resposta)
      </h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        
        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💰 Como o app diferencia receitas de familiares em contas bancárias distintas?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Pela <strong>Regra de Ouro de Receitas</strong>, salários e recebíveis lançados em contas de familiares diferentes (ex: marido no Itaú e esposa no Nubank) são <strong>100% ignorados pelo motor de duplicidades</strong>, pois são rendas reais independentes. O sistema só alerta se a receita for na mesma conta bancária ou se o mesmo titular cadastrar em bancos diferentes por engano.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🛡️ O que acontece se dois membros da família lançarem a mesma despesa (Web e Desktop)?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            O <strong>Motor Anti-Duplicidade</strong> cruza valor, data (com compensação de fins de semana) e o nome do estabelecimento (NLP). Se o mesmo local for detectado, o sistema alerta e você pode abrir a <strong>Central de Conciliação</strong> para mesclar em 1 único lançamento com 1 clique.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔢 O motor de duplicidade confunde compras parceladas (ex: 2/10 com 3/10)?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! O motor extrai o número da parcela automaticamente. Se os números forem diferentes (ex: <em>2/10</em> vs <em>3/10</em>), a duplicidade é <strong>zerada (0%)</strong> porque são parcelas de meses distintos. Já parcelas idênticas (ex: <em>2/10</em> vs <em>2 de 10</em>) recebem pontuação máxima de duplicidade (100%).
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 Como funciona o destaque de parcelas ao clicar na fatura?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Ao clicar no card de qualquer fatura na tela de Planejamento (ex: <code>FATURA CARTÃO CARREFOUR</code>), todas as compras e parcelas correspondentes na lista de Despesas são imediatamente destacadas com a cor oficial do cartão/banco. Os itens de outros cartões são atenuados, facilitando a conferência.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🤝 O que acontece quando clico em 'Renegociar / Acordo' em uma fatura?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            A fatura é marcada como <span class="badge badge-purple">Renegociada</span>, a entrada é debitada da conta bancária e o sistema gera automaticamente as parcelas do acordo como despesas nos meses subsequentes. Caso tenha feito por engano, você pode clicar em "Desfazer Acordo / Reabrir" para restaurar a fatura original.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔒 Meus dados financeiros ficam salvos na nuvem ou são compartilhados?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! Todos os dados são gravados exclusivamente no banco de dados local SQLite no seu computador com criptografia AES-256 e conformidade integral com a LGPD. Nenhuma informação financeira sai da sua rede local.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Renderiza a página do Manual do Usuário
 */
async function renderManual() {
  const page = document.getElementById('page-manual');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
          <span>📖</span> Manual do Usuário & Central de Conhecimento
        </h2>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          Guia completo de operações, cartões de crédito, fluxo de caixa e metodologia financeira
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" id="btn-download-manual-pdf" style="display: flex; align-items: center; gap: 8px; font-weight: 700; padding: 9px 18px; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
          <span>📥</span> Baixar Manual em PDF
        </button>
      </div>
    </div>

    <!-- BREADCRUMB / TRILHA DE NAVEGAÇÃO -->
    <div id="manual-breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; background: var(--bg-surface); padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); flex-wrap: wrap;">
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="manual-crumb-root">📚 MANUAL</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-cat" style="color: #60a5fa; font-weight: 600;">💳 Cartões de Crédito</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-sub" style="color: var(--accent-light); font-weight: 700;">Competência vs Vencimento</span>
    </div>

    <!-- BUSCA GLOBAL NO MANUAL -->
    <div style="margin-bottom: 14px; position: relative;">
      <input type="text" id="manual-search-input" placeholder="🔍 Pesquisar em todos os tópicos, operações, termos e perguntas do manual..."
             style="width: 100%; padding: 10px 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 13px; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    </div>

    <!-- CONTAINER PRINCIPAL: MENU EM ÁRVORE (ESQUERDA) + CONTEÚDO (DIREITA) -->
    <div style="display: flex; gap: 16px; height: calc(100vh - 230px); min-height: 520px;">
      ${getManualSidebarHtml()}

      <!-- PAINEL DE CONTEÚDO (DIREITA) -->
      <div id="manual-display-panel" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 22px; scrollbar-width: thin;">
        ${getManualTopicsPart1Html()}
        ${getManualTopicsPart2Html()}
      </div>
    </div>
  `;

  setupManualEvents(page);
}

/**
 * Registra todos os eventos de clique, busca e acordeão do Manual
 */
function setupManualEvents(container) {
  if (!container) return;

  const treeHeaders = container.querySelectorAll('.wiki-tree-header');
  const treeItems = container.querySelectorAll('.wiki-tree-item');
  const topicContents = container.querySelectorAll('.manual-topic-content');
  const crumbCat = container.querySelector('#manual-crumb-cat');
  const crumbSub = container.querySelector('#manual-crumb-sub');

  // Category headers accordion toggle
  treeHeaders.forEach(header => {
    header.onclick = () => {
      const subs = header.nextElementSibling;
      const arrow = header.querySelector('.wiki-tree-arrow');
      if (subs) {
        if (subs.style.display === 'none') {
          subs.style.display = 'flex';
          if (arrow) arrow.textContent = '▾';
        } else {
          subs.style.display = 'none';
          if (arrow) arrow.textContent = '▸';
        }
      }
    };
  });

  // Topic items click to switch active content
  treeItems.forEach(item => {
    item.onclick = () => {
      treeItems.forEach(i => {
        i.classList.remove('active');
        i.style.color = 'var(--text-muted)';
        i.style.fontWeight = 'normal';
        i.style.borderLeftColor = 'transparent';
        i.style.background = 'transparent';
      });
      item.classList.add('active');
      item.style.color = 'var(--text-primary)';
      item.style.fontWeight = '700';
      item.style.borderLeftColor = 'var(--accent)';
      item.style.background = 'var(--bg-raised)';

      const topicId = item.dataset.topic;
      const catName = item.closest('.wiki-tree-group')?.querySelector('.wiki-tree-header span')?.textContent || 'Manual';
      const subName = item.textContent.replace('•', '').trim();

      if (crumbCat) crumbCat.textContent = catName;
      if (crumbSub) crumbSub.textContent = subName;

      topicContents.forEach(tc => {
        tc.style.display = tc.id === `topic-${topicId}` ? 'block' : 'none';
      });

      const displayPanel = container.querySelector('#manual-display-panel');
      if (displayPanel) displayPanel.scrollTop = 0;
    };
  });

  // FAQ interactive accordion clicks
  container.querySelectorAll('.wiki-faq-q').forEach(qEl => {
    qEl.onclick = () => {
      const aEl = qEl.nextElementSibling;
      const chevron = qEl.querySelector('.faq-chevron');
      if (aEl) {
        const isHidden = aEl.style.display === 'none';
        aEl.style.display = isHidden ? 'block' : 'none';
        if (chevron) chevron.textContent = isHidden ? '➖' : '➕';
      }
    };
  });

  // Global search inside manual
  const searchInput = container.querySelector('#manual-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q) {
        if (crumbCat) crumbCat.textContent = 'Busca no Manual';
        if (crumbSub) crumbSub.textContent = `Resultados para "${q}"`;
        topicContents.forEach(tc => {
          const text = tc.textContent.toLowerCase();
          const matches = text.includes(q);
          tc.style.display = matches ? 'block' : 'none';
        });
        container.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          const text = acc.textContent.toLowerCase();
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (text.includes(q)) {
            acc.style.display = 'block';
            if (aEl) aEl.style.display = 'block';
            if (chevron) chevron.textContent = '➖';
          } else {
            acc.style.display = 'none';
          }
        });
      } else {
        const activeItem = container.querySelector('.wiki-tree-item.active');
        if (activeItem) activeItem.click();
        container.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          acc.style.display = 'block';
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (aEl) aEl.style.display = 'none';
          if (chevron) chevron.textContent = '➕';
        });
      }
    };
  }

  // Download PDF button
  const downloadBtn = container.querySelector('#btn-download-manual-pdf');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      try {
        const link = document.createElement('a');
        link.href = 'Manual_do_Usuario.pdf';
        link.download = 'Manual_do_Usuario_FinancasFamilia.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast('📥 Abrindo download do Manual do Usuário em PDF...');
      } catch (err) {
        window.open('Manual_do_Usuario.pdf', '_blank');
      }
    };
  }
}