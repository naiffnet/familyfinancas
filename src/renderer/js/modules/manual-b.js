/* manual-b.js - parte 2/2 */

            <span>🌐 Aba Visão Geral, Metas & Patrimônio Líquido</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
              <strong>Consolidação Patrimonial e Objetivos de Poupança:</strong>
            </div>
            <p style="margin-bottom: 10px;">Na aba <strong>"🌐 Visão Geral"</strong> no topo do Dashboard:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
              <li>🏛️ <strong>Patrimônio Líquido Consolidado:</strong> Soma o saldo real de todas as contas correntes, poupanças e investimentos, deduzindo os compromissos em aberto nos cartões de crédito e cheques especiais.</li>
              <li>🎯 <strong>Objetivos & Cofrinhos:</strong> Acompanhamento do progresso percentual e financeiro de cada meta de poupança (ex: <em>Reserva de Emergência, Viagem em Família, Reforma</em>).</li>
              <li>🏦 <strong>Saldos e Faturas Reais Atuais:</strong> Exibição do estado patrimonial de cada conta do grupo familiar.</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 2.8: DASHBOARD > CONTRASTE & ACESSIBILIDADE -->
        <div class="manual-topic-content" id="topic-dash-contraste" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>🎨 Modos de Visualização & Alto Contraste</span>
            <span class="badge badge-blue">Recurso Novo</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">O Dashboard e todos os controles foram projetados para alta legibilidade:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
              <li><strong>Modo Claro:</strong> Contornos nítidos (<code>border: 1.5px solid #94a3b8</code>), fundo sólido branco e tipografia em alto contraste sem desbotamento.</li>
              <li><strong>Modo Escuro:</strong> Elementos em tons escuros refinados com brilho esmeralda e contrastes calibrados para não cansar a vista.</li>
              <li><strong>Controles de Busca e Filtro:</strong> Bordas com feedback luminoso (*focus ring*) ao clicar para digitação ou ordenação.</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 3.1: LANÇAMENTOS > COMPETÊNCIA -->
        <div class="manual-topic-content" id="topic-lanc-competencia" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
            📋 Mês de Referência (Competência: Ref: MM/AAAA)
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">O app permite controlar tanto a data de pagamento quanto o mês de competência:</p>
            <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
              <strong>Exemplo de Conta de Energia:</strong><br>
              • Consumo do mês de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>).<br>
              • Vencimento do boleto em <strong>10 de Março</strong> (Data de Pagamento: <code>10/03/2026</code>).
            </div>
            <p style="margin: 0;">Isso garante que ao emitir relatórios de gastos mensais, o custo seja computado no mês em que o consumo realmente ocorreu.</p>
          </div>
        </div>

        <!-- TÓPICO 3.2: LANÇAMENTOS > FIXAS -->
        <div class="manual-topic-content" id="topic-lanc-fixas" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
            ⭐ Despesas Fixas (Recorrentes) & Prioridades
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">Despesas fixas são aquelas que se repetem todo mês (Aluguel, Internet, Mensalidade Escolar, Financiamento):</p>
            <p style="margin-bottom: 8px;">• <strong>Estrela de Prioridade ⭐:</strong> Marque despesas essenciais com estrela para que fiquem no topo da lista.</p>
            <p style="margin: 0;">• <strong>Adiar Vencimento:</strong> Permite empurrar o vencimento de uma conta para frente se o orçamento do mês estiver apertado.</p>
          </div>
        </div>

        <!-- TÓPICO 3.3: LANÇAMENTOS > AVULSOS -->
        <div class="manual-topic-content" id="topic-lanc-avulsos" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
            🛍️ Despesas Variáveis do Mês (Avulsas)
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">Gastos esporádicos do dia a dia (Supermercado, Farmácia, Restaurante, Combustível):</p>
            <p style="margin: 0;">Clique no botão roxo <code>+ Nova Variável</code> em qualquer momento para registrar uma compra rápida, escolhendo a categoria, conta/cartão e quem realizou o gasto.</p>
          </div>
        </div>

        <!-- TÓPICO 3.4: LANÇAMENTOS > JUROS & DESCONTOS -->
        <div class="manual-topic-content" id="topic-lanc-juros" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700;">
            🏷️ Juros, Multas e Descontos Antecipados
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 8px;">• <strong>Desconto:</strong> Ao pagar antecipado com desconto, o sistema debita do saldo da conta apenas o valor líquido real.</p>
            <p style="margin: 0;">• <strong>Juros / Multa:</strong> Ao pagar em atraso, registre o acréscimo para que o valor real debitado corresponda exatamente ao extrato do banco.</p>
          </div>
        </div>

        <!-- TÓPICO 4.1: CONTAS > TIPOS -->
        <div class="manual-topic-content" id="topic-contas-tipos" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
            🏦 Tipos de Contas Bancárias & Carteiras
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 8px;">• <span class="badge badge-blue">Conta Corrente</span>: Banco do Brasil, Itaú, Nubank, etc.</p>
            <p style="margin-bottom: 8px;">• <span class="badge badge-green">Poupança / Investimentos</span>: Reserva de emergência e aplicações.</p>
            <p style="margin-bottom: 8px;">• <span class="badge badge-yellow">Carteira Física</span>: Dinheiro em espécie na mão.</p>
            <p style="margin: 0;">• <span class="badge badge-cyan">Voucher</span>: Vale Refeição / Alimentação (Alelo, Ticket, Sodexo).</p>
          </div>
        </div>

        <!-- TÓPICO 4.2: CONTAS > CARTÕES BENEFÍCIO & VOUCHERS (NOVO) -->
        <div class="manual-topic-content" id="topic-contas-beneficio" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>🎟️ Cartões Benefício, Vouchers e Alimentação</span>
            <span class="badge badge-cyan">Novo Recurso</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <div style="background: rgba(6, 182, 212, 0.08); border-left: 4px solid #06b6d4; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
              <strong>Controle Completo de Saldos e Recargas Mensais de Benefícios:</strong>
            </div>
            <p style="margin-bottom: 10px;">O FinançasFamília possui suporte nativo para operadoras de benefícios corporativos e flexíveis:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
              <li>🏷️ <strong>Operadoras Suportadas:</strong> Flash, Caju, Alelo, Banricard, Swile, Ticket, Sodexo, VR, Ben Visa Vale, etc.</li>
              <li>🍴 <strong>Modalidades Específicas:</strong> Alimentação (VA), Refeição (VR), Transporte (VT), Flexível / Multibenefícios, Combustível, Saúde/Farmácia e Educação.</li>
              <li>💵 <strong>Recarga Mensal Automática:</strong> Defina o valor previsto da recarga (ex: <code>R$ 800,00</code>) e o dia do crédito (ex: <code>Dia 10</code>) para previsibilidade orçamentária.</li>
              <li>💳 <strong>Final do Cartão:</strong> Identificação rápida pelos 4 últimos dígitos (ex: <code>Final 4920</code>).</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 4.3: CONTAS > TRANSFERÊNCIAS -->
        <div class="manual-topic-content" id="topic-contas-transf" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
            🔁 Transferências entre Contas sem Duplicação
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">Ao usar o botão <strong>"Nova Transferência"</strong> na tela de Contas, o saldo é transferido da conta de origem para a de destino sem gerar receitas ou despesas artificiais no balanço familiar.</p>
          </div>
        </div>

        <!-- TÓPICO 4.4: CONTAS > PRODUTOS -->
        <div class="manual-topic-content" id="topic-contas-produtos" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
            💳 Produtos da Conta (Banricompras, Cheque Especial)
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">O aplicativo suporta produtos acoplados à conta corrente, permitindo parcelar despesas em débito pré-datado ou controlar o uso do cheque especial com visibilidade total.</p>
          </div>
        </div>

        <!-- TÓPICO 5.1: FAMÍLIA > PERFIS -->
        <div class="manual-topic-content" id="topic-fam-perfis" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
            👑 Papéis de Usuário (ADM, Responsável, Colaborador, Caçula)
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 8px;">• 👑 <strong>ADM Geral:</strong> Gestão técnica, auditoria e backups globais.</p>
            <p style="margin-bottom: 8px;">• ⭐ <strong>Responsável:</strong> Gestão financeira da casa, membros e permissões.</p>
            <p style="margin-bottom: 8px;">• 👤 <strong>Colaborador:</strong> Membro adulto com acesso às suas finanças e menus autorizados.</p>
            <p style="margin: 0;">• 🧸 <strong>Caçula:</strong> Interface especial para crianças e controle de mesada.</p>
          </div>
        </div>

        <!-- TÓPICO 5.2: FAMÍLIA > PERMISSÕES -->
        <div class="manual-topic-content" id="topic-fam-permissoes" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
            🛡️ Permissões Granulares por Módulo
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">Defina exatamente quem pode visualizar ou editar lançamentos fixos, avulsos, contas bancárias, cartões de crédito e relatórios gerais.</p>
          </div>
        </div>

        <!-- TÓPICO 6.1: SYNC > UUIDS & MULTI-APARELHO (NOVO) -->
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

        <!-- TÓPICO 6.2: SYNC > MOTOR HEURÍSTICO (ATUALIZADO) -->
        <div class="manual-topic-content" id="topic-sync-dedup" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>🧠 Motor Heurístico Anti-Duplicidade & Alertas em Tempo Real</span>
            <span class="badge badge-purple">Inteligência Familiar</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <div style="background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
              <strong>Prevenção Imediata e Detecção Ativa de Lançamentos Duplicados:</strong>
            </div>
            <p style="margin-bottom: 10px;">Quando múltiplos membros da família inserem despesas, o motor atua em duas etapas:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
              <li>⚡ <strong>Alerta em Tempo Real no Formulário:</strong> Conforme você digita o valor, data ou descrição nos formulários de despesas ou contas fixas, o sistema pesquisa instantaneamente e avisa: <em>"Atenção: Já existe um lançamento similar registrado por Maria em 15/08..."</em>.</li>
              <li>🔤 <strong>NLP & Stopwords Bancárias:</strong> O sistema ignora termos genéricos como <code>PIX</code>, <code>TED</code>, <code>PAGTO</code>, <code>COMPRA</code>, <code>CARTÃO</code>, comparando apenas o nome do estabelecimento (ex: <em>"PIX PAGTO SUPERMERCADO ZAFFARI"</em> vira <em>"Supermercado Zaffari"</em>).</li>
              <li>📅 <strong>Compensação de Fim de Semana:</strong> Tolera compras feitas na sexta/sábado/domingo que são registradas ou compensadas na segunda/terça.</li>
              <li>🔢 <strong>Detecção de Parcelamentos Duplicados:</strong> Identifica compras parceladas coincidentes (ex: <em>"Sofá 3/10"</em> vs <em>"Sofá 3 de 10"</em>).</li>
              <li>🤖 <strong>Auto-Merge Inteligente:</strong> Duplicatas com 100% de similaridade (mesmo valor, mesma data, mesma descrição e mesma conta) são unificadas com segurança e registradas no histórico.</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 6.3: SYNC > CONCILIAÇÃO VISUAL (ATUALIZADO) -->
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

        <!-- TÓPICO 9.1: FAQ INTERATIVO -->
        <div class="manual-topic-content" id="topic-faq-interativo" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f87171; font-weight: 700;">
            ❓ Perguntas Frequentes (FAQ Interativo — Clique para abrir a resposta)
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>💳 Como funciona o destaque de parcelas ao clicar na fatura?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                Ao clicar no card de qualquer fatura na tela de Planejamento (ex: <code>FATURA CARTÃO CARREFOUR</code>), todas as compras e parcelas correspondentes na lista de Despesas são imediatamente destacadas com a cor oficial do cartão/banco (borda, fundo luminoso e badge explicativa). Os itens que não fazem parte dessa fatura são atenuados, e a tela rola suavemente até o primeiro item para facilitar a conferência. Clicar novamente no card da fatura desativa o destaque.
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>🚨 Como usar os avisos de vencimento do Dashboard como links diretos?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                Basta clicar em qualquer chip de alerta na faixa vermelha <code>🚨 Vencimentos próximos</code> ou nos cartões das colunas <code>⭐ Prioritários</code> e <code>Contas a Pagar</code>. O aplicativo abre a tela de Planejamento no mês exato e aplica um destaque luminoso pulsante (*glow flash*) sobre o lançamento selecionado.
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>💳 Qual a diferença entre Competência e Vencimento do Cartão?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                A <strong>competência</strong> refere-se ao mês em que o consumo ou o ciclo da fatura ocorreu (ex: compras feitas até o fechamento de 25 de Fevereiro pertencem à competência 02/2026). O <strong>vencimento</strong> é o dia em que o pagamento do boleto é realizado (ex: 05 de Março).
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>🤝 O que acontece quando clico em 'Renegociar / Acordo' em uma fatura?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                A fatura é marcada como <span class="badge badge-purple">Renegociada</span>, a entrada (se informada) é debitada da conta bancária e o sistema gera automaticamente as parcelas do acordo como despesas recorrentes nos meses subsequentes. Caso tenha feito por engano, você pode clicar em "Desfazer Acordo / Reabrir" para restaurar a fatura original.
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>🛡️ O que acontece se dois membros da família lançarem o mesmo gasto (Web e Desktop)?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                O <strong>Motor Anti-Duplicidade</strong> entra em ação imediatamente! Ele cruza a data (com margem de ±2 dias), o valor (com tolerância de centavos/gorjetas) e o nome do estabelecimento. Se for muito parecido, o Dashboard exibe um alerta temático e o botão <code>🛡️</code> abre o modal comparativo permitindo que você escolha com 1 clique entre <strong>[Mesclar em 1 Lançamento]</strong> (unificando saldos e removendo a duplicata) ou <strong>[Manter Ambos]</strong> caso sejam dois gastos legítimos.
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>🎟️ Como cadastrar um Cartão Benefício (Flash, Caju, Alelo, Sodexo, VR)?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                Vá até a aba <strong>Contas</strong>, clique em <code>+ Nova Conta</code>, selecione o tipo <strong>Voucher / Benefício</strong> e escolha a operadora (Flash, Caju, Alelo, Banricard, Swile, Sodexo, VR, etc.). Você pode informar a modalidade (ex: Alimentação, Refeição, Mobilidade ou Flexível), o saldo atual disponível e configurar o valor e o dia da recarga mensal automática!
              </div>
            </div>

            <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
              <div class="wiki-faq-q" style="padding: 14px 16px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
                <span>⚠️ Como quitar pendências de meses anteriores diretamente pelo Dashboard?</span>
                <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
              </div>
              <div class="wiki-faq-a" style="display: none; padding: 14px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); background: var(--bg-surface);">
                No topo do Dashboard, o container <strong>"⚠️ Pendências de Meses Anteriores Não Pagas"</strong> lista todas as contas passadas em aberto. Ao clicar sobre qualquer uma delas, o sistema abre automaticamente a tela de Planejamento no mês exato em que a dívida foi gerada e destaca a linha com um efeito luminoso, permitindo dar baixa ou editar imediatamente.
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

      </div>

    </div>
  `;

  setupManualEvents(page);
}

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

// ════════════════════════════════════════
// SETTINGS POPUP WITH TABS
// ════════════════════════════════════════