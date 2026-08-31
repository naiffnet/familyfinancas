/* manual-b.js - parte 2/2 */

/**
 * Retorna o HTML dos tópicos dos Capítulos 7 a 13 do painel de leitura
 */
function getManualTopicsPart2Html() {
  return `
    <!-- CAPÍTULO 7.1: ORÇAMENTOS > TETOS -->
    <div class="manual-topic-content" id="topic-orc-tetos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎯 7.1 Definindo Tetos de Orçamento por Categoria</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(244,63,94,0.08); border-left: 4px solid #f43f5e; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Disciplina e Previsibilidade Financeira Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Na aba <strong>📋 Orçamento</strong>, você estabelece o teto máximo de gastos da família para cada categoria do mês:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no campo de valor ao lado de cada categoria (ex: <em>Alimentação: R$ 2.500,00, Moradia: R$ 3.000,00, Lazer: R$ 800,00</em>).</li>
          <li>Conforme as despesas do mês são lançadas, o sistema calcula a porcentagem consumida em tempo real.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px;">
          💡 <strong>Dica de Ouro:</strong> Acompanhe o consumo visual nas barras de progresso descritas em <a href="javascript:void(0)" onclick="openManualTopic('orc-barras')" style="color: #f43f5e; font-weight: 700; text-decoration: underline;">7.2 Barras de Limite Coloridas</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 7.2: ORÇAMENTOS > REGRA 50-30-20 -->
    <div class="manual-topic-content" id="topic-orc-503020" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ 7.2 Regra 50-30-20: Equilíbrio Orçamentário Estruturado</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">A metodologia divide toda a receita líquida auferida no mês em 3 grandes pilares:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏠 <strong>50% Necessidades Básicas (Needs):</strong> Moradia, energia, alimentação básica, saúde e educação.</li>
          <li>🎭 <strong>30% Estilo de Vida e Desejos (Wants):</strong> Lazer, restaurantes, streaming, viagens e compras supérfluas.</li>
          <li>💰 <strong>20% Poupança e Metas (Savings):</strong> Aportes em reserva de emergência e investimentos.</li>
        </ul>
        <div style="background: rgba(244,63,94,0.08); border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          O sistema agrupa as categorias automaticamente e compara seus gastos reais contra os tetos de 50%, 30% e 20% da receita total do mês.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 7.3: ORÇAMENTOS > BARRAS COLORIDAS -->
    <div class="manual-topic-content" id="topic-orc-barras" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 7.3 Acompanhamento Visual das Barras de Limite</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">As barras de progresso mudam de cor dinamicamente para alertar a saúde do orçamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Verde Esmeralda (0% a 70%):</strong> Gastos confortáveis dentro da margem de segurança.</li>
          <li>🟡 <strong>Amarelo Atenção (71% a 90%):</strong> Categoria próxima do limite planejado para o mês.</li>
          <li>🔴 <strong>Vermelho Perigo (> 90% ou Estourado):</strong> Orçamento esgotado ou ultrapassado.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 7.4: ORÇAMENTOS > METAS COM CDI & PMT -->
    <div class="manual-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎯 7.4 Metas Inteligentes com Estimativa de CDI & Simulador PMT</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na aba <strong>🎯 Metas</strong>, planeje objetivos familiares utilizando matemática financeira com juros compostos ($PMT$):</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📈 <strong>Taxa CDI Estimada:</strong> Informe a rentabilidade esperada da aplicação (ex: <em>100% do CDI, 10.5% ao ano</em>).</li>
          <li>💡 <strong>Aporte Mensal Sugerido ($PMT$):</strong> O sistema calcula exatamente quanto você precisa poupar mensalmente. O rendimento composto trabalha a seu favor, reduzindo o esforço do bolso.</li>
          <li>🎯 <strong>Projeção de Conclusão:</strong> Estima com exatidão a data em que o valor alvo será atingido com base nos aportes realizados.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.1: DASHBOARD > 3 MODOS -->
    <div class="manual-topic-content" id="topic-dash-modos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎛️ 8.1 Os 3 Modos de Visualização do Dashboard</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Alterne a disposição do Dashboard no seletor de modos no canto superior direito:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏛️ <strong>Modo Executivo:</strong> Visão consolidada por blocos com widgets de saldos em conta, faturas de cartão e patrimônio líquido.</li>
          <li>📑 <strong>Modo Sub-Abas:</strong> Navegação setorizada por abas operacionais (*Resumo, Faturas, Contas e Gráficos*).</li>
          <li>🚀 <strong>Modo Cockpit Integrado:</strong> Painel de alta densidade reunindo todas as métricas financeiras em uma única tela panorâmica.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.2: DASHBOARD > FILTROS -->
    <div class="manual-topic-content" id="topic-dash-filtros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>👥 8.2 Filtros Rápidos por Membro da Família e Tipo de Conta</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No topo do Dashboard, você pode filtrar instantaneamente os dados exibidos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>👤 <strong>Filtro por Membro:</strong> Clique no nome de um familiar para enxergar apenas os gastos, receitas e cartões daquela pessoa.</li>
          <li>🏦 <strong>Filtro por Tipo de Conta:</strong> Isole contas correntes, carteiras de dinheiro ou cartões benefício com 1 clique.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.3: DASHBOARD > KANBAN EM 3 COLUNAS -->
    <div class="manual-topic-content" id="topic-dash-kanban" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 8.3 Kanban Operacional em 3 Colunas (*Prioritários, A Pagar e Pagas*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No centro do Dashboard, três colunas organizam as tarefas do mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⭐ <strong>Prioritários:</strong> Reúne todas as contas marcadas com estrela de prioridade indispensável no mês.</li>
          <li>⏳ <strong>Contas a Pagar:</strong> Despesas pendentes ordenadas cronologicamente por proximidade da data de vencimento.</li>
          <li>✓ <strong>Contas Pagas:</strong> Histórico de despesas já quitadas no mês com indicação da conta de pagamento.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 8.4: DASHBOARD > PENDÊNCIAS ANTERIORES -->
    <div class="manual-topic-content" id="topic-dash-pendencias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚨 8.4 Alerta de Pendências de Meses Anteriores</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você tiver deixado contas em aberto nos meses passados, surge um <strong>banner vermelho de alerta no topo do Dashboard</strong> informando a quantidade e o valor total acumulado, com link direto para regularização instantânea.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.1: RELATÓRIOS > FLUXO DE CAIXA -->
    <div class="manual-topic-content" id="topic-rep-fluxo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📈 9.1 Fluxo de Caixa Mensal</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na aba <strong>📊 Fluxo de Caixa</strong>, acompanhe as entradas e saídas do mês, saldo operacional líquido e a taxa de poupança efetiva realizada.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.2: RELATÓRIOS > GRÁFICOS POR CATEGORIA -->
    <div class="manual-topic-content" id="topic-rep-graficos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🍩 9.2 Gráficos Interativos por Categoria</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Gráficos em Rosca (Donut) e Barras que mostram a distribuição de gastos por categoria para diagnosticar onde estão as maiores despesas.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.3: RELATÓRIOS > PATRIMÔNIO & CLASSES DE ATIVOS -->
    <div class="manual-topic-content" id="topic-rep-patrimonio" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏛️ 9.3 Alocação Patrimonial & Classes de Ativos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>🏛️ Alocação Patrimonial</strong>: categorize suas contas e investimentos em classes patrimoniais:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🛡️ <strong>Renda Fixa / CDI:</strong> Contas remuneradas, CDBs e Tesouro Direto.</li>
          <li>💵 <strong>Liquidez Imediata:</strong> Dinheiro em espécie e contas correntes de movimentação.</li>
          <li>📈 <strong>Renda Variável & FIIs:</strong> Ações e Fundos Imobiliários.</li>
          <li>🏠 <strong>Imóveis & Ativos Reais:</strong> Veículos e bens duráveis.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.4: RELATÓRIOS > PROJEÇÃO PREDITIVA -->
    <div class="manual-topic-content" id="topic-rep-projecao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #8b5cf6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔮 9.4 Projeção Preditiva de Saldo Futuro (30 Dias)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>🔮 Projeção Futura</strong>: simula dia a dia a curva de saldo das suas contas bancárias para os próximos 30 dias com base nos vencimentos agendados, salários previstos e parcelas futuras.</p>
        <div style="background: rgba(139,92,246,0.08); border-left: 4px solid #8b5cf6; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          🚨 <strong>Termômetro de Risco:</strong> Alerta antecipadamente se em algum dia o saldo projetado ficará negativo, permitindo transferências preventivas para evitar juros de cheque especial.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 9.5: RELATÓRIOS > RADAR DE ASSINATURAS -->
    <div class="manual-topic-content" id="topic-rep-radar-assinaturas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📡 9.5 Radar de Assinaturas & Gastos Recorrentes</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>📡 Radar de Assinaturas</strong>: identifica todos os serviços recorrentes contratados pela família (ex: <em>Netflix, Spotify, Academias, Planos de Celular, Internet</em>):</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💰 <strong>Custo Anualizado:</strong> Mostra o montante total que cada assinatura consome em 12 meses.</li>
          <li>📈 <strong>Detector de Reajustes:</strong> Alerta caso um serviço tenha aumentado de preço em relação aos meses anteriores.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.6: RELATÓRIOS > AUDITORIA DE JUROS -->
    <div class="manual-topic-content" id="topic-rep-auditoria-juros" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ 9.6 Relatório de Auditoria de Juros e Encargos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>⚠️ Auditoria de Juros</strong>: Demonstrativo minucioso de multas e juros pagos por atraso vs descontos obtidos por antecipação de pagamentos.</p>
      </div>
    </div>

    <!-- CAPÍTULO 9.7: RELATÓRIOS > FAIR SHARE -->
    <div class="manual-topic-content" id="topic-rep-fair-share" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #3b82f6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🤝 9.7 Divisão Proporcional de Despesas (Fair Share Familiar)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>🤝 Divisão Familiar</strong>: Divisão justa das contas da casa com base na renda auferida por cada membro no mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⚖️ <strong>Cota Justa Proporcional:</strong> Quem ganha mais arca proporcionalmente com uma fatia maior dos custos essenciais.</li>
          <li>👥 <strong>Modo Igualitário (50/50):</strong> Alternância instantânea para rateio dividido em partes exatamente iguais.</li>
          <li>💸 <strong>Matriz de Compensação:</strong> Instruções automáticas de quem deve transferir quanto para quem para liquidar as diferenças do mês.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.8: RELATÓRIOS > DRE PESSOAL -->
    <div class="manual-topic-content" id="topic-rep-dre" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📑 9.8 DRE Pessoal Estruturado (Demonstrativo do Resultado)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>📑 DRE Pessoal</strong>: Visão contábil executiva e formal das finanças:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>(+) Receita Operacional Bruta</li>
          <li>(-) Despesas Fixas Essenciais (Moradia, Alimentação, Saúde)</li>
          <li>(=) Margem de Contribuição 1 (Resultado Bruto)</li>
          <li>(-) Despesas Operacionais de Estilo de Vida (Lazer, Extras)</li>
          <li>(=) Resultado Operacional Antes dos Encargos</li>
          <li>(+/-) Resultado Financeiro Líquido (Descontos vs Juros)</li>
          <li>(=) Superávit / Déficit Líquido do Mês e Taxa de Poupança Efetiva.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.9: RELATÓRIOS > SIMULADOR DE ESTRESSE -->
    <div class="manual-topic-content" id="topic-rep-stress-test" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🧪 9.9 Simulador de Sensibilidade & Cenários de Estresse ("E se...?")</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aba <strong>🧪 Simulador de Estresse</strong>: Teste a robustez do seu orçamento familiar sob crises ou choques financeiros:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📉 <strong>Queda de Renda:</strong> Simula reduções salariais de até -60%.</li>
          <li>📈 <strong>Inflação e Custos Fixos:</strong> Simula aumentos em contas básicas de até +50%.</li>
          <li>✂️ <strong>Corte de Despesas Variáveis:</strong> Simula economia com corte imediato de supérfluos de até -70%.</li>
          <li>⏱️ <strong>Sobrevida da Reserva:</strong> Calcula por quantos meses sua reserva em contas/CDB manterá a família viva sem endividamento em caso de déficit.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 9.10: RELATÓRIOS > IMPRESSÃO / PDF -->
    <div class="manual-topic-content" id="topic-rep-impressao-pdf" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🖨️ 9.10 Impressão & Exportação em PDF (*🖨️ Imprimir / PDF*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Clique no botão <code>🖨️ Imprimir / PDF</code> no topo da página de relatórios para gerar um arquivo PDF formatado com cabeçalho da família, tabelas detalhadas e gráficos em alta resolução.</p>
      </div>
    </div>

    <!-- CAPÍTULO 10.1: SEGURANÇA > TRILHA DE AUDITORIA -->
    <div class="manual-topic-content" id="topic-seg-trilha-auditoria" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #14b8a6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🛡️ 10.1 Histórico Visual de Modificações (*Trilha de Auditoria*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Segurança</strong>, consulte a auditoria operacional completa:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Registro com data, hora, nome do familiar e ação realizada (criação, edição, exclusão ou quitação de contas).</li>
          <li>Exibição detalhada dos valores anteriores e dos novos valores alterados para total transparência entre os membros da casa.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 10.2: SEGURANÇA > LGPD -->
    <div class="manual-topic-content" id="topic-seg-lgpd" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #14b8a6; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔒 10.2 Direitos LGPD (*Exportação dos Meus Dados e Exclusão Segura*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em total conformidade com a Lei Geral de Proteção de Dados:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📦 <strong>Exportar Meus Dados:</strong> Baixe todo o histórico financeiro da família em arquivo aberto JSON.</li>
          <li>🗑️ <strong>Exclusão Definitiva:</strong> Permite ao Administrador expurgar com segurança os registros locais quando desejar.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 11.1: BACKUP > EXPORTAÇÃO -->
    <div class="manual-topic-content" id="topic-bak-exportacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💾 11.1 Exportando Backups em Excel, CSV, JSON e Banco <code>.db</code></span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Backup & Restauração</strong>, gere cópias de segurança:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📊 <strong>Planilha Excel / CSV:</strong> Para conferência e manipulação externa de dados.</li>
          <li>🗄️ <strong>Backup Completo SQLite (.db):</strong> Cópia integral e criptografada de todo o banco de dados.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 11.2: BACKUP > TESTAR .DB -->
    <div class="manual-topic-content" id="topic-bak-teste-integridade" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔍 11.2 Testando a Integridade do Arquivo de Backup (*🔍 Testar .db*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Antes de restaurar um arquivo de backup no seu computador, clique em <code>🔍 Testar .db</code>. O motor analisa a consistência estrutural, chaves estrangeiras e integridade de tabelas para garantir que o arquivo não está corrompido.</p>
      </div>
    </div>

    <!-- CAPÍTULO 11.3: BACKUP > RESTAURAÇÃO -->
    <div class="manual-topic-content" id="topic-bak-restauracao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>♻️ 11.3 Restaurando um Backup com Segurança</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Selecione o arquivo de backup <code>.db</code> ou <code>.json</code> prévio.</li>
          <li>Confirme a restauração com sua senha de administrador.</li>
          <li>O sistema restaura todas as tabelas e atualiza a interface imediatamente.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 11.4: BACKUP > SAÚDE & MÉTRICAS -->
    <div class="manual-topic-content" id="topic-bak-saude-metricas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #eab308; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 11.4 Painel de Saúde e Métricas do Sistema</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Acompanhe o tamanho físico do arquivo do banco de dados no disco, quantidade total de transações registradas, status do modo WAL e integridade dos índices.</p>
      </div>
    </div>

    <!-- CAPÍTULO 12.1: MOBILE > CONEXÃO LOCAL / WI-FI -->
    <div class="manual-topic-content" id="topic-mob-conexao-wifi" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📱 12.1 Conexão Local / Wi-Fi via QR Code</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Acesso Direto pelo Celular Sem Precisar Baixar Nada da Loja de Aplicativos:</strong>
        </div>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Certifique-se de que o seu celular e o seu computador estão conectados na <strong>mesma rede Wi-Fi</strong>.</li>
          <li>No computador, clique no botão <code>📱 Conectar Aparelho</code> no menu lateral.</li>
          <li>Aponte a câmera do celular para o QR Code na tela. O app abrirá no navegador do celular conectado diretamente ao seu computador!</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 12.2: MOBILE > LAYOUT TOUCH & HEADER -->
    <div class="manual-topic-content" id="topic-mob-layout-touch" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📱 12.2 Layout Mobile, Header Centralizado & Grids Touch-Friendly</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">A interface foi calibrada para navegação confortável com o polegar em smartphones:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔝 <strong>Header em 3 Colunas:</strong> Menu hamburguer à esquerda, logo centralizado e alternador de tema à direita.</li>
          <li>📊 <strong>Lançamentos em 2 Linhas:</strong> Descrição, categoria, valor e status sem sobreposição.</li>
          <li>💳 <strong>Faturas Verticais:</strong> Cards de fatura com botões largos de 42px para toque fácil.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 13.1: FAQ INTERATIVO -->
    <div class="manual-topic-content" id="topic-faq-duvidas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f87171; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>❓ 13.1 Perguntas Frequentes (FAQ Interativo — Clique para ver a resposta)</span>
      </h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        
        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💰 Como o app diferencia receitas de familiares em contas bancárias distintas?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Salários e rendas de membros diferentes da família (ex: marido no Itaú e esposa no Nubank) são reconhecidos como rendas legítimas independentes e <strong>nunca são bloqueados pelo motor de duplicidade</strong>.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 O que acontece quando clico em 'Pagar Fatura' de um cartão?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            O valor total da fatura é debitado da conta bancária pagadora escolhida e todas as despesas e parcelas atreladas àquela fatura são marcadas como pagas simultaneamente em uma única operação segura.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔒 Meus dados e informações financeiras ficam salvos na nuvem?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Não! Todos os dados são salvos exclusivamente no banco de dados local SQLite no seu computador com criptografia AES-256 e conformidade integral com a LGPD. Nenhuma informação financeira sai da sua máquina.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Função global para navegação por hiperlinks internos no manual
 */
window.openManualTopic = function(topicId) {
  const container = document.getElementById('page-manual');
  if (!container) return;

  const targetItem = container.querySelector(`.wiki-tree-item[data-topic="${topicId}"]`);
  if (!targetItem) return;

  // Abrir o acordeão do grupo pai caso esteja fechado
  const subs = targetItem.closest('.wiki-tree-subs');
  const header = subs?.previousElementSibling;
  const arrow = header?.querySelector('.wiki-tree-arrow');
  if (subs && subs.style.display === 'none') {
    subs.style.display = 'flex';
    if (arrow) arrow.textContent = '▾';
  }

  targetItem.click();
};

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
          Guia completo de operações, cartões de crédito, fluxo de caixa e metodologia financeira (13 Capítulos)
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
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="manual-crumb-root" onclick="openManualTopic('primeiros-familia')">📚 MANUAL</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-cat" style="color: #60a5fa; font-weight: 600;">🌟 1. Primeiros Passos & Acesso</span>
      <span style="opacity: 0.4;">›</span>
      <span id="manual-crumb-sub" style="color: var(--accent-light); font-weight: 700;">1.1 Criando Família e Usuário</span>
    </div>

    <!-- BUSCA GLOBAL NO MANUAL -->
    <div style="margin-bottom: 14px; position: relative;">
      <input type="text" id="manual-search-input" placeholder="🔍 Pesquisar em todos os 13 capítulos, termos e dúvidas do manual..."
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
      } else {
        const activeItem = container.querySelector('.wiki-tree-item.active');
        if (activeItem) {
          activeItem.click();
        }
      }
    };
  }

  // Export PDF Button
  const btnPdf = container.querySelector('#btn-download-manual-pdf');
  if (btnPdf) {
    btnPdf.onclick = () => {
      window.print();
    };
  }
}