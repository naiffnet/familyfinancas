/* === settings-1b.js (parte 2/2 de settings-1.js) ===
 * Wiki, LGPD e Helpers de Configurações
 */

/**
 * Retorna o HTML da árvore de navegação lateral da Wiki de Configurações
 */
function getSettingsWikiSidebarHtml() {
  return `
    <div id="wiki-tree-sidebar" style="width: 240px; min-width: 240px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin;">
      
      <!-- GRUPO 1: CARTÕES DE CRÉDITO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="cartoes" data-topic="cartao-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • Competência vs Vencimento
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Ciclo & Melhor Dia
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Limite Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento & Baixa Atômica
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-antecipacao" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Antecipação de Parcelas
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-rotativo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento Parcial & Rotativo
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Renegociação & Acordos
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-reabertura" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Reabertura & Estorno
          </div>
        </div>
      </div>

      <!-- GRUPO 2: DESPESAS & RECEITAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #34d399; background: rgba(16,185,129,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📌 Despesas & Receitas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Competência (Ref: MM/AAAA)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-fixas" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Fixas & Prioridade ⭐
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-avulsos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Variáveis (Avulsas)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Juros, Multas e Descontos
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-feriados" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Feriados & Prorrogação Útil
          </div>
        </div>
      </div>

      <!-- GRUPO 3: CONTAS & CARTEIRAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #06b6d4; background: rgba(6,182,212,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 Contas & Transferências</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-tipos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tipos de Contas Bancárias
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transf" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Transferências sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-produtos" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Produtos da Conta & Limites
          </div>
        </div>
      </div>

      <!-- GRUPO 4: FAMÍLIA & PERMISSÕES -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="familia" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #a78bfa; background: rgba(167,139,250,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>👨‍👩‍👧 Família & Permissões</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Papéis de Usuário (ADM, etc)
          </div>
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-permissoes" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Permissões Granulares por Menu
          </div>
        </div>
      </div>

      <!-- GRUPO 5: ORÇAMENTOS & METAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamentos" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #f43f5e; background: rgba(244,63,94,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 Orçamentos & Metas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-budgets" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tetos de Gastos por Categoria
          </div>
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Metas Financeiras & Aportes
          </div>
        </div>
      </div>

      <!-- GRUPO 6: METODOLOGIA 50-30-20 -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="metodologia" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #c084fc; background: rgba(192,132,252,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💡 Metodologia 50-30-20</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="metodologia" data-topic="met-regra" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Como Dividir o Orçamento Familiar
          </div>
        </div>
      </div>

      <!-- GRUPO 7: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #f87171; background: rgba(248,113,113,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ FAQ (Perguntas)</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-interativo" style="padding: 6px 10px; border-radius: 6px; font-size: 11.5px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Dúvidas Frequentes (Clique e Veja)
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos de conteúdo da Wiki de Configurações
 */
function getSettingsWikiTopicsHtml() {
  return `
    <!-- TÓPICO: CARTÕES > COMPETÊNCIA VS VENCIMENTO -->
    <div class="wiki-topic-content" id="topic-cartao-competencia" style="display: block;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 Competência vs. Vencimento na Fatura do Cartão</span>
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(96,165,250,0.08); border-left: 4px solid #60a5fa; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como o aplicativo sincroniza o consumo real com o vencimento do cartão:</strong>
        </div>
        <p style="margin-bottom: 10px;">• <strong>Mês de Competência da Fatura (<code>competence_date</code>):</strong> Representa o mês do ciclo de compras. Por exemplo, a fatura com ciclo encerrando em 25 de <em>Fevereiro</em> possui competência de <strong>Fevereiro</strong>.</p>
        <p style="margin-bottom: 10px;">• <strong>Data de Vencimento (<code>due_day</code>):</strong> É o dia exato em que o banco cobra o pagamento da fatura (ex: dia 05 de <em>Março</em>).</p>
        <p style="margin-bottom: 10px;">• <strong>Controle de Despesas Parceladas:</strong> Cada parcela de uma compra parcelada é atribuída automaticamente à fatura do seu respectivo mês de competência, garantindo que o seu fluxo de caixa reflita a realidade exata de cada período.</p>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > CICLO & MELHOR DIA -->
    <div class="wiki-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔒 Ciclo de Fechamento & O "Melhor Dia de Compra"
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--info); padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Fórmula do Ciclo:</strong> <code>(Fechamento Anterior + 1)</code> até <code>(Fechamento Atual)</code>
        </div>
        <p style="margin-bottom: 10px;"><strong>Exemplo Prático (Fechamento dia 25 e Vencimento dia 05):</strong></p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Compras realizadas de <strong>26/07 a 25/08</strong> entram na fatura de <strong>Agosto</strong> (vencimento em 05/09).</li>
          <li>Compras realizadas no dia <strong>26/08 em diante</strong> entram apenas na fatura de <strong>Setembro</strong> (vencimento em 05/10).</li>
        </ul>
        <p style="margin: 0;">💡 <strong>Dica de Ouro:</strong> Comprar no dia 26 garante até <strong>40 dias de prazo</strong> para pagar a despesa sem juros!</p>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > LIMITE COMPROMETIDO -->
    <div class="wiki-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        📊 Limite Global Comprometido vs. Limite Disponível
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Quando você cadastra um cartão com <strong>Limite Total de R$ 5.000,00</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Se você faz uma compra de <strong>R$ 1.200,00 em 12x de R$ 100,00</strong>, o limite disponível cai imediatamente para <strong>R$ 3.800,00</strong>.</li>
          <li>O widget de Rosca (Donut) no Dashboard exibe <code>Limite Comprometido = R$ 1.200,00 (24%)</code>.</li>
          <li>Conforme você paga a fatura mensal (R$ 100,00), o sistema libera R$ 100,00 do limite automaticamente!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > PAGAMENTO & BAIXA ATÔMICA -->
    <div class="wiki-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        💵 Pagamento de Fatura & Baixa Atômica
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao clicar no botão <strong>"Pagar Fatura"</strong> na aba de Planejamento:</p>
        <div style="background: var(--bg-raised); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <p style="margin-bottom: 6px;">1. 🏦 <strong>Débito em Conta:</strong> O valor líquido da fatura é subtraído do saldo da conta corrente selecionada.</p>
          <p style="margin-bottom: 6px;">2. 🏷️ <strong>Status da Fatura:</strong> A fatura é marcada como <span class="badge badge-green">Paga</span> com a data exata do pagamento.</p>
          <p style="margin: 0;">3. 📦 <strong>Baixa nas Compras:</strong> Todas as compras e parcelas pertencentes àquele ciclo são marcadas como quitadas em uma única transação atômica.</p>
        </div>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > RENEGOCIAÇÃO & ACORDO -->
    <div class="wiki-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🤝 Renegociação & Parcelamento de Fatura
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Caso você parcele ou faça um acordo da fatura com o banco:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Renegociar / Acordo"</strong> no card da fatura.</li>
          <li>Informe o valor da entrada (se houver) e a conta pagadora.</li>
          <li>Estipule o número de parcelas (ex: 6x) e o valor de cada uma.</li>
          <li>O sistema encerra a fatura com o selo <span class="badge badge-purple">🤝 Renegociada</span> e gera automaticamente as despesas recorrentes parceladas nos meses futuros.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > ANTECIPAÇÃO -->
    <div class="wiki-topic-content" id="topic-cartao-antecipacao" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        ⚡ Antecipação de Parcelas Futuras com Desconto
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Deseja adiantar parcelas de compras parceladas e aproveitar descontos concedidos pela emissora do cartão?</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Abra a fatura do cartão e selecione <strong>"Antecipar Parcelas"</strong>.</li>
          <li>Marque quais parcelas dos próximos meses deseja transferir para o mês atual.</li>
          <li>Informe o valor do desconto (se houver). O sistema aplica o abatimento proporcional e recalcula as faturas futuras.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > ROTATIVO -->
    <div class="wiki-topic-content" id="topic-cartao-rotativo" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔄 Pagamento Parcial & Saldo Rotativo Automático
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se no fechamento do mês você não puder pagar o valor total da fatura:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>No modal de quitação da fatura, informe o <strong>Valor Parcial</strong> pago.</li>
          <li>O valor pago é debitado da conta corrente selecionada.</li>
          <li>O saldo remanescente acrescido dos encargos do rotativo é <strong>lançado automaticamente na fatura do mês seguinte</strong>.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: CARTÕES > REABERTURA & ESTORNO -->
    <div class="wiki-topic-content" id="topic-cartao-reabertura" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #60a5fa; font-weight: 700;">
        🔓 Reabertura de Fatura & Estorno Seguro
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você deu baixa ou renegociou uma fatura por engano:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Reabrir Fatura"</strong>.</li>
          <li>O valor pago é <strong>estornado de volta para o saldo da sua conta bancária</strong>.</li>
          <li>Se houve renegociação, as parcelas futuras geradas pelo acordo são canceladas e removidas.</li>
          <li>A fatura volta para o estado <span class="badge badge-yellow">⏳ Aberta</span> e recalcula seu valor total automaticamente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > COMPETÊNCIA -->
    <div class="wiki-topic-content" id="topic-lanc-competencia" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        📋 Mês de Referência (Competência: Ref: MM/AAAA)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O app permite controlar tanto a data de pagamento quanto o mês de competência:</p>
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
          <strong>Exemplo de Conta de Energia:</strong><br>
          • Consumo do mês de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>).<br>
          • Vencimento do boleto em <strong>10 de Março</strong> (Data de Pagamento: <code>10/03/2026</code>).
        </div>
        <p style="margin: 0;">Isso garante que ao emitir relatórios de gastos mensais, o custo seja computado no mês em que o consumo realmente ocorreu.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > FIXAS -->
    <div class="wiki-topic-content" id="topic-lanc-fixas" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        ⭐ Despesas Fixas (Recorrentes) & Prioridades
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Despesas fixas são aquelas que se repetem todo mês (Aluguel, Internet, Mensalidade Escolar, Financiamento):</p>
        <p style="margin-bottom: 8px;">• <strong>Estrela de Prioridade ⭐:</strong> Marque despesas essenciais com estrela para que fiquem no topo da lista.</p>
        <p style="margin: 0;">• <strong>Adiar Vencimento:</strong> Permite empurrar o vencimento de uma conta para frente se o orçamento do mês estiver apertado.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > AVULSOS -->
    <div class="wiki-topic-content" id="topic-lanc-avulsos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        🛍️ Despesas Variáveis do Mês (Avulsas)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Gastos esporádicos do dia a dia (Supermercado, Farmácia, Restaurante, Combustível):</p>
        <p style="margin: 0;">Clique no botão roxo <code>+ Nova Variável</code> em qualquer momento para registrar uma compra rápida, escolhendo a categoria, conta/cartão e quem realizou o gasto.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > JUROS & DESCONTOS -->
    <div class="wiki-topic-content" id="topic-lanc-juros" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        🏷️ Juros, Multas e Descontos Antecipados
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <strong>Desconto:</strong> Ao pagar antecipado com desconto, o sistema debita do saldo da conta apenas o valor líquido real.</p>
        <p style="margin: 0;">• <strong>Juros / Multa:</strong> Ao pagar em atraso, registre o acréscimo para que o valor real debitado corresponda exatamente ao extrato do banco.</p>
      </div>
    </div>

    <!-- TÓPICO: LANÇAMENTOS > FERIADOS & PRORROGAÇÃO -->
    <div class="wiki-topic-content" id="topic-lanc-feriados" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #34d399; font-weight: 700;">
        📅 Feriados Nacionais & Prorrogação para Dia Útil
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <strong>Regra Bancária:</strong> Contas vencendo em fins de semana ou feriados nacionais brasileiros são prorrogadas para o 1º dia útil seguinte.</p>
        <p style="margin-bottom: 8px;">• <strong>Tag Informativa:</strong> O app exibe a tag azul <code>📅 Prorroga: DD/MM</code> nos lançamentos com vencimento em feriado ou fim de semana.</p>
        <p style="margin: 0;">• <strong>Isenção de Mora:</strong> Pagamentos efetuados até o dia útil prorrogado não sofrem cálculo de juros por atraso.</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > TIPOS -->
    <div class="wiki-topic-content" id="topic-contas-tipos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        🏦 Tipos de Contas Bancárias & Carteiras
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• <span class="badge badge-blue">Conta Corrente</span>: Banco do Brasil, Itaú, Nubank, etc.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-green">Poupança / Investimentos</span>: Reserva de emergência e aplicações.</p>
        <p style="margin-bottom: 8px;">• <span class="badge badge-yellow">Carteira Física</span>: Dinheiro em espécie na mão.</p>
        <p style="margin: 0;">• <span class="badge badge-cyan">Voucher</span>: Vale Refeição / Alimentação (Alelo, Ticket, Sodexo).</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > TRANSFERÊNCIAS -->
    <div class="wiki-topic-content" id="topic-contas-transf" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        🔁 Transferências entre Contas sem Duplicação
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Ao usar o botão <strong>"Nova Transferência"</strong> na tela de Contas, o saldo é transferido da conta de origem para a de destino sem gerar receitas ou despesas artificiais no balanço familiar.</p>
      </div>
    </div>

    <!-- TÓPICO: CONTAS > PRODUTOS -->
    <div class="wiki-topic-content" id="topic-contas-produtos" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #06b6d4; font-weight: 700;">
        💳 Produtos da Conta (Banricompras, Cheque Especial)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">O aplicativo suporta produtos acoplados à conta corrente, permitindo parcelar despesas em débito pré-datado ou controlar o uso do cheque especial com visibilidade total.</p>
      </div>
    </div>

    <!-- TÓPICO: FAMÍLIA > PERFIS -->
    <div class="wiki-topic-content" id="topic-fam-perfis" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #a78bfa; font-weight: 700;">
        👑 Papéis de Usuário (ADM, Responsável, Colaborador, Caçula)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 8px;">• 👑 <strong>ADM Geral:</strong> Gestão técnica, auditoria e backups globais.</p>
        <p style="margin-bottom: 8px;">• ⭐ <strong>Responsável:</strong> Gestão financeira da casa, membros e permissões.</p>
        <p style="margin-bottom: 8px;">• 👤 <strong>Colaborador:</strong> Membro adulto com acesso às suas finanças e menus autorizados.</p>
        <p style="margin: 0;">• 🧸 <strong>Caçula:</strong> Interface especial para crianças e controle de mesada.</p>
      </div>
    </div>

    <!-- TÓPICO: FAMÍLIA > PERMISSÕES -->
    <div class="wiki-topic-content" id="topic-fam-permissoes" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #a78bfa; font-weight: 700;">
        🔒 Permissões Granulares por Menu
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Em <em>Configurações ⚙️ → Membros da Família</em>, o Responsável pode ativar ou desativar individualmente quais telas cada membro pode visualizar (Dashboard, Contas, Metas, Relatórios).</p>
      </div>
    </div>

    <!-- TÓPICO: ORÇAMENTOS > BUDGETS -->
    <div class="wiki-topic-content" id="topic-orc-budgets" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #f43f5e; font-weight: 700;">
        📊 Tetos de Gastos por Categoria (Budgets)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Estipule um limite máximo para categorias como Alimentação, Lazer e Transporte. O app avisa com barras coloridas quando você atinge 70%, 90% ou 100% do teto estipulado.</p>
      </div>
    </div>

    <!-- TÓPICO: ORÇAMENTOS > METAS -->
    <div class="wiki-topic-content" id="topic-orc-metas" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #f43f5e; font-weight: 700;">
        🏆 Metas Financeiras & Depósitos (Aportes)
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin: 0;">Crie objetivos da família (Viagem de Férias, Carro Novo, Reforma) e registre aportes mensais até completar 100% da meta!</p>
      </div>
    </div>

    <!-- TÓPICO: METODOLOGIA > REGRA 50-30-20 -->
    <div class="wiki-topic-content" id="topic-met-regra" style="display: none;">
      <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #c084fc; font-weight: 700;">
        💡 Metodologia Familiar: A Regra dos 50-30-20
      </h4>
      <div style="font-size: 12.8px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(192,132,252,0.08); border-left: 4px solid #c084fc; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
          <strong>Divisão Ideal da Renda Familiar:</strong><br>
          • <strong>50% — Necessidades Básicas:</strong> Moradia, mercado, saúde, contas de consumo.<br>
          • <strong>30% — Estilo de Vida:</strong> Passeios, restaurantes, cinema, hobbies.<br>
          • <strong>20% — Futuro & Metas:</strong> Reserva de emergência e investimentos.
        </div>
      </div>
    </div>

    <!-- TÓPICO: FAQ INTERATIVO (ACCORDION CLICK-TO-EXPAND) -->
    <div class="wiki-topic-content" id="topic-faq-interativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 15px; color: #f87171; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
        <span>❓ Perguntas Frequentes (Clique para Ver a Resposta)</span>
      </h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>📱 Como conectar o aplicativo ao celular na mesma rede Wi-Fi?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Basta certificar-se de que o computador e o celular estão conectados na mesma rede Wi-Fi. No app do computador, clique no ícone <strong>"Conectar Celular 📱"</strong> no menu lateral e aponte a câmera do celular para o QR Code exibido na tela.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🔑 Como funciona a recuperação de senha com pergunta secreta?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Na tela de login, clique no link <em>"Esqueci minha senha"</em>, informe seu nome de usuário e responda à pergunta de segurança cadastrada. O sistema valida sua resposta e permite cadastrar uma nova senha imediatamente.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>💳 Uma compra parcelada no cartão consome o limite inteiro imediatamente?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Sim! O limite global do cartão é comprometido pelo valor integral da compra no momento do lançamento. O limite disponível vai sendo restabelecido mês a mês conforme você realiza o pagamento de cada fatura.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>🤝 O que acontece quando renegocio ou reabro uma fatura de cartão?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Na renegociação, a fatura é quitada por acordo e as parcelas futuras são geradas automaticamente. Ao <strong>reabrir</strong>, o sistema desfaz o acordo, cancela as parcelas pendentes e estorna o pagamento para a conta corrente de forma segura e atômica.
          </div>
        </div>

        <div class="wiki-faq-accordion" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-surface);">
          <div class="wiki-faq-q" style="padding: 12px 14px; font-weight: 600; font-size: 12.8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--bg-raised);">
            <span>📦 Como exportar meus dados financeiros em Excel (.xlsx) ou CSV?</span>
            <span class="faq-chevron" style="transition: transform 0.2s;">➕</span>
          </div>
          <div class="wiki-faq-a" style="display: none; padding: 12px 14px; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border); background: var(--bg-surface);">
            Acesse <em>Configurações ⚙️ → Backups & Dados</em> e clique no botão de exportação desejado. Seus dados são formatados com cabeçalhos claros e valores compatíveis com Excel e Google Planilhas.
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Registra todos os eventos interativos da Wiki de Configurações
 */
function setupSettingsWikiEvents(bodyEl) {
  if (!bodyEl) return;

  const treeHeaders = bodyEl.querySelectorAll('.wiki-tree-header');
  const treeItems = bodyEl.querySelectorAll('.wiki-tree-item');
  const crumbCat = document.getElementById('wiki-crumb-cat');
  const crumbSub = document.getElementById('wiki-crumb-sub');
  const topicContents = bodyEl.querySelectorAll('.wiki-topic-content');

  // Toggle tree groups open/closed
  treeHeaders.forEach(hdr => {
    hdr.onclick = () => {
      const subs = hdr.nextElementSibling;
      const arrow = hdr.querySelector('.wiki-tree-arrow');
      if (subs) {
        const isHidden = subs.style.display === 'none';
        subs.style.display = isHidden ? 'flex' : 'none';
        if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
      }
    };
  });

  // Select specific topic in tree
  treeItems.forEach(item => {
    item.onclick = () => {
      treeItems.forEach(i => {
        i.classList.remove('active');
        i.style.borderLeftColor = 'transparent';
        i.style.color = 'var(--text-muted)';
        i.style.background = 'transparent';
      });
      item.classList.add('active');
      item.style.borderLeftColor = 'var(--accent)';
      item.style.color = 'var(--text-primary)';
      item.style.background = 'var(--bg-raised)';

      // Update breadcrumbs
      const parentGroup = item.closest('.wiki-tree-group');
      const groupHeader = parentGroup ? parentGroup.querySelector('.wiki-tree-header span') : null;
      if (crumbCat && groupHeader) crumbCat.textContent = groupHeader.textContent;
      if (crumbSub) crumbSub.textContent = item.textContent.replace('•', '').trim();

      // Show matching topic content
      const topicKey = item.dataset.topic;
      topicContents.forEach(tc => {
        tc.style.display = tc.id === `topic-${topicKey}` ? 'block' : 'none';
      });

      // Scroll display panel to top
      const displayPanel = bodyEl.querySelector('#wiki-display-panel');
      if (displayPanel) displayPanel.scrollTop = 0;
    };
  });

  // 2. INTERACTIVE FAQ ACCORDION
  bodyEl.querySelectorAll('.wiki-faq-q').forEach(qEl => {
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

  // 3. REAL-TIME SEARCH IN WIKI TOPICS & FAQ
  const searchInput = bodyEl.querySelector('#wiki-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q) {
        if (crumbCat) crumbCat.textContent = 'Busca';
        if (crumbSub) crumbSub.textContent = `Resultados para "${q}"`;
        topicContents.forEach(tc => {
          const text = tc.textContent.toLowerCase();
          tc.style.display = text.includes(q) ? 'block' : 'none';
        });
        bodyEl.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
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
        // Restore active tree topic
        const activeItem = bodyEl.querySelector('.wiki-tree-item.active');
        if (activeItem) activeItem.click();
        bodyEl.querySelectorAll('.wiki-faq-accordion').forEach(acc => {
          acc.style.display = 'block';
          const aEl = acc.querySelector('.wiki-faq-a');
          const chevron = acc.querySelector('.faq-chevron');
          if (aEl) aEl.style.display = 'none';
          if (chevron) chevron.textContent = '➕';
        });
      }
    };
  }
}

/**
 * Renderiza a aba de Wiki no Modal de Configurações
 */
function renderSettingsWikiTab(bodyEl) {
  bodyEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <span>📚 Base de Conhecimento (Wiki)</span>
      </h3>
      <span class="badge badge-purple" style="font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3);">Guia Oficial</span>
    </div>

    <!-- BREADCRUMB / TRILHA DE NAVEGAÇÃO -->
    <div id="wiki-breadcrumb" style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); flex-wrap: wrap;">
      <span style="font-weight: 700; color: var(--text-muted); cursor: pointer;" id="wiki-crumb-root">📚 WIKI</span>
      <span style="opacity: 0.4;">›</span>
      <span id="wiki-crumb-cat" style="color: #60a5fa; font-weight: 600;">💳 Cartões de Crédito</span>
      <span style="opacity: 0.4;">›</span>
      <span id="wiki-crumb-sub" style="color: var(--accent-light); font-weight: 700;">Competência vs Vencimento</span>
    </div>

    <!-- BUSCA GLOBAL NA WIKI -->
    <div style="margin-bottom: 12px; position: relative;">
      <input type="text" id="wiki-search-input" placeholder="🔍 Pesquisar em todos os tópicos da Wiki..."
             style="width: 100%; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 12.5px; outline: none;">
    </div>

    <!-- CONTAINER PRINCIPAL: MENU EM ÁRVORE (ESQUERDA) + CONTEÚDO (DIREITA) -->
    <div style="display: flex; gap: 14px; height: 430px; overflow: hidden;">
      ${getSettingsWikiSidebarHtml()}
      
      <!-- PAINEL DE CONTEÚDO (DIREITA) -->
      <div id="wiki-display-panel" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 18px; scrollbar-width: thin;">
        ${getSettingsWikiTopicsHtml()}
      </div>
    </div>
  `;

  setupSettingsWikiEvents(bodyEl);
}

/**
 * Renderiza a aba de LGPD no Modal de Configurações
 */
function renderSettingsLgpdTab(bodyEl) {
  bodyEl.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      ⚖️ Privacidade & LGPD (Conformidade)
    </h3>
    <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
      De acordo com a Lei Geral de Proteção de Dados (LGPD), você possui o controle total sobre seus dados pessoais cadastrais e registros de transações financeiras.
      <br><br>
      <strong>Termos aceitos em:</strong> ${State.user.accepted_terms_timestamp ? new Date(State.user.accepted_terms_timestamp).toLocaleString('pt-BR') : 'Não registrado (versão legada)'}
      <br>
      <strong>Versão dos termos:</strong> ${State.user.accepted_terms_version || 'N/A'}
    </div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
      <button class="btn btn-secondary btn-sm" id="btn-show-terms-settings" style="padding: 8px 16px;">Visualizar Termos de Uso</button>
      <button class="btn btn-secondary btn-sm" id="btn-show-privacy-settings" style="padding: 8px 16px;">Visualizar Política de Privacidade</button>
      <button class="btn btn-secondary btn-sm" id="btn-export-my-data" style="padding: 8px 16px; display: flex; align-items: center; gap: 6px;">📦 Exportar Meus Dados (JSON)</button>
    </div>
    <div style="border-top: 1px dashed var(--border); margin: 16px 0;"></div>
    <div>
      <div style="font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">⚠️ Excluir Minha Conta (Direito ao Esquecimento)</div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
        Ao clicar no botão abaixo, todos os seus dados pessoais (nome, CPF, e-mail, telefone), contas bancárias registradas, transações financeiras, orçamentos e metas serão <strong>excluídos permanentemente</strong> de nossos bancos de dados, sem possibilidade de recuperação.
      </p>
      <button class="btn btn-danger btn-sm" id="btn-delete-my-account" style="background-color: #ef4444; border-color: #ef4444; color: #ffffff; padding: 8px 16px;">
        Excluir Definitivamente Minha Conta
      </button>
    </div>
  `;

  bindLgpdTabEvents();
}

/**
 * Renderiza a aba de Trilha de Auditoria no Modal de Configurações
 */
async function renderSettingsAuditTab(bodyEl) {
  bodyEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary);">
          🛡️ Trilha de Auditoria & Modificações
        </h3>
        <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--text-muted);">
          Rastreabilidade de alterações cadastrais e financeiras (Quem, Quando, O quê, Valores Anteriores e Novos)
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="audit-filter-entity" style="padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); font-size: 12px; outline: none; cursor: pointer;">
          <option value="">Todas as Entidades</option>
          <option value="transaction">Lançamentos</option>
          <option value="account">Contas</option>
          <option value="recurring_item">Planejamento</option>
          <option value="invoice">Faturas de Cartão</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="btn-refresh-audit" style="font-size: 12px; padding: 6px 12px;">
          🔄 Atualizar
        </button>
      </div>
    </div>

    <div id="audit-logs-container" style="height: 400px; overflow-y: auto; scrollbar-width: thin;">
      <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
        Carregando registros de auditoria...
      </div>
    </div>
  `;

  const loadAuditLogs = async () => {
    const container = document.getElementById('audit-logs-container');
    const entityFilter = document.getElementById('audit-filter-entity')?.value || null;

    try {
      const logs = await window.api.audit.getLogs({
        familyId: State.user.family_id,
        entityType: entityFilter,
        limit: 100
      });

      if (!logs || logs.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Nenhum registro de auditoria encontrado</div>
            <div style="font-size: 12px; margin-top: 4px;">As próximas ações de criação, alteração ou exclusão serão registradas aqui automaticamente.</div>
          </div>
        `;
        return;
      }

      const getActionBadge = (action) => {
        if (action.includes('CREATE')) return '<span class="badge" style="background: rgba(16,185,129,0.15); color: #34d399; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">CRIOU</span>';
        if (action.includes('UPDATE')) return '<span class="badge" style="background: rgba(59,130,246,0.15); color: #60a5fa; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ALTEROU</span>';
        if (action.includes('DELETE')) return '<span class="badge" style="background: rgba(239,68,68,0.15); color: #f87171; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">EXCLUIU</span>';
        if (action.includes('PAY')) return '<span class="badge" style="background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">QUITOU</span>';
        return `<span class="badge" style="background: var(--bg-raised); color: var(--text-muted); font-size: 10px; padding: 2px 6px; border-radius: 4px;">${action}</span>`;
      };

      container.innerHTML = `
        <table class="data-table" style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); text-align: left; color: var(--text-muted); font-size: 11px;">
              <th style="padding: 8px 10px;">DATA/HORA</th>
              <th style="padding: 8px 10px;">USUÁRIO</th>
              <th style="padding: 8px 10px;">AÇÃO</th>
              <th style="padding: 8px 10px;">ENTIDADE</th>
              <th style="padding: 8px 10px;">DESCRIÇÃO / HISTÓRICO</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => {
              const dt = new Date(l.created_at);
              const dateFormatted = !isNaN(dt) ? dt.toLocaleString('pt-BR') : l.created_at;
              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle;">
                  <td style="padding: 8px 10px; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 11px;">
                    ${dateFormatted}
                  </td>
                  <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary); white-space: nowrap;">
                    👤 ${l.user_name || 'Sistema'}
                  </td>
                  <td style="padding: 8px 10px; white-space: nowrap;">
                    ${getActionBadge(l.action)}
                  </td>
                  <td style="padding: 8px 10px; color: var(--text-muted); text-transform: capitalize; white-space: nowrap; font-size: 11px;">
                    ${l.entity_type}
                  </td>
                  <td style="padding: 8px 10px; color: var(--text-primary); line-height: 1.4;">
                    <div>${l.description || '—'}</div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #f87171; font-size: 13px;">
          Erro ao carregar trilha de auditoria: ${err.message}
        </div>
      `;
    }
  };

  document.getElementById('audit-filter-entity')?.addEventListener('change', loadAuditLogs);
  document.getElementById('btn-refresh-audit')?.addEventListener('click', loadAuditLogs);

  await loadAuditLogs();
}

async function renderSettingsUpdaterTab(bodyEl) {
  let updaterInfo = {
    currentVersion: '1.0.0',
    isSecurityUpdate: false,
    history: [],
    canRollback: false
  };

  try {
    if (window.api?.updater?.getInfo) {
      updaterInfo = await window.api.updater.getInfo();
    }
  } catch (e) {
    console.warn('[Updater] Erro ao obter dados de versão:', e);
  }

  bodyEl.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
      <span>🔄 Versão & Atualizações do Sistema</span>
      <span class="badge badge-emerald" style="font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 700; background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3);">
        Versão Atual: v${updaterInfo.currentVersion || '1.0.0'}
      </span>
    </h3>

    <!-- 1. CARD PRINCIPAL: STATUS E VERIFICAÇÃO -->
    <div style="padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; font-size: 22px;">
            🚀
          </div>
          <div>
            <div style="font-weight: 700; font-size: 15px; color: var(--text-primary);">
              FinançasFamília Desktop
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Canal Oficial de Distribuição: <strong>GitHub Releases</strong> (Produção)
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-check-updates" style="font-size: 12px; font-weight: 600; padding: 8px 18px; display: flex; align-items: center; gap: 6px;">
          <span>🔍</span> Verificar Atualizações
        </button>
      </div>

      <!-- CONTAINER DINÂMICO DE RESPOSTA DO UPDATE -->
      <div id="updater-feedback-container" style="margin-top: 16px; display: none;"></div>
    </div>

    <!-- 2. CARD: PROTEÇÃO DO BANCO DE DADOS -->
    <div style="padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid rgba(16,185,129,0.25); background: rgba(16,185,129,0.05); margin-bottom: 20px; display: flex; align-items: flex-start; gap: 14px;">
      <div style="font-size: 24px; line-height: 1;">🛡️</div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
        <strong style="color: #34d399; font-size: 13px; display: block; margin-bottom: 2px;">Preservação Total dos Seus Dados:</strong>
        Todas as atualizações do aplicativo substituem estritamente o código do programa. O seu banco de dados SQLite local (<code>financeiro.db</code>), suas contas e transações residem em diretório persistente isolado e <strong>nunca são alterados nem apagados</strong> durante updates.
      </div>
    </div>

    <!-- 3. CARD: GESTÃO DE VERSÃO, HISTÓRICO E ROLLBACK SEGURO -->
    <div style="padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface);">
      <div style="font-weight: 700; font-size: 14px; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <span>⏪ Reversão de Versão (Rollback Seguro)</span>
      </div>

      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
        Caso você prefira o comportamento de uma versão anterior após uma atualização de layout ou recursos, você pode reverter o aplicativo para a versão anterior a qualquer momento.
      </div>

      ${updaterInfo.isSecurityUpdate ? `
        <!-- TRAVA DE SEGURANÇA ATIVA -->
        <div style="padding: 14px 16px; border-radius: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; font-size: 12px; display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <span style="font-size: 18px;">🔒</span>
          <div>
            <strong>Atualização Crítica de Segurança Ativa:</strong>
            Esta versão inclui correções mandatórias de segurança ou conformidade com a LGPD. A reversão para versões vulneráveis foi desativada para proteger a integridade dos seus dados.
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.5; cursor: not-allowed; font-size: 12px;">
          ⏪ Voltar para Versão Anterior (Bloqueado por Segurança)
        </button>
      ` : `
        <!-- ROLLBACK HABILITADO -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="font-size: 12px; color: var(--text-secondary);">
            Ponto de Restauração: <strong>Snapshot Automático do SQLite criado antes de cada instalação.</strong>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-rollback-version" style="font-size: 12px; font-weight: 600; padding: 6px 16px; border-color: rgba(255,255,255,0.2);">
            ⏪ Voltar para a Versão Anterior
          </button>
        </div>
      `}

      <!-- HISTÓRICO DE VERSÕES REGISTRADAS -->
      ${updaterInfo.history && updaterInfo.history.length > 0 ? `
        <div style="margin-top: 18px; border-top: 1px solid var(--border); padding-top: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
            Histórico Local de Instalações:
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${updaterInfo.history.map((h, i) => `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="font-weight: 600; color: ${i === 0 ? '#34d399' : 'var(--text-secondary)'};">
                  ${i === 0 ? '● (Atual) ' : '○ '}v${h.version}
                </span>
                <span style="color: var(--text-muted); font-family: monospace;">
                  ${new Date(h.installedAt).toLocaleDateString('pt-BR')} ${new Date(h.installedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Listeners de eventos do Updater
  const feedbackContainer = document.getElementById('updater-feedback-container');
  const btnCheck = document.getElementById('btn-check-updates');
  const btnRollback = document.getElementById('btn-rollback-version');

  if (btnCheck) {
    btnCheck.onclick = async () => {
      btnCheck.disabled = true;
      btnCheck.innerHTML = '<span>⏳</span> Verificando...';
      feedbackContainer.style.display = 'block';
      feedbackContainer.innerHTML = `
        <div style="padding: 12px 16px; border-radius: 8px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; font-size: 12px; display: flex; align-items: center; gap: 8px;">
          <span>🔍</span> Consultando os servidores do GitHub Releases...
        </div>
      `;

      try {
        const res = await window.api.updater.check();
        if (res && res.status === 'not-available') {
          feedbackContainer.innerHTML = `
            <div style="padding: 12px 16px; border-radius: 8px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; font-size: 12px; display: flex; align-items: center; gap: 8px;">
              <span>✅</span> ${res.message || 'Você já está utilizando a versão mais recente!'}
            </div>
          `;
        } else if (res && res.error) {
          feedbackContainer.innerHTML = `
            <div style="padding: 12px 16px; border-radius: 8px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; font-size: 12px; display: flex; align-items: center; gap: 8px;">
              <span>⚠️</span> ${res.error}
            </div>
          `;
        }
      } catch (err) {
        feedbackContainer.innerHTML = `
          <div style="padding: 12px 16px; border-radius: 8px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; font-size: 12px;">
            Erro: ${err.message}
          </div>
        `;
      } finally {
        btnCheck.disabled = false;
        btnCheck.innerHTML = '<span>🔍</span> Verificar Atualizações';
      }
    };
  }

  // Ouvinte de status em tempo real emitido pelo Main Process
  if (window.api?.updater?.onStatus) {
    window.api.updater.onStatus((data) => {
      if (!feedbackContainer) return;
      feedbackContainer.style.display = 'block';

      if (data.status === 'available') {
        feedbackContainer.innerHTML = `
          <div style="padding: 16px; border-radius: 8px; background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12)); border: 1px solid rgba(16,185,129,0.3); margin-top: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="font-weight: 700; font-size: 14px; color: #34d399; display: flex; align-items: center; gap: 6px;">
                <span>✨ Nova Versão Disponível:</span> <strong>v${data.version}</strong>
              </div>
              ${data.isSecurityUpdate ? '<span class="badge badge-danger" style="font-size: 10px; padding: 2px 8px; border-radius: 12px; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4);">🔒 Segurança Obrigatória</span>' : ''}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px; white-space: pre-wrap;">
              ${data.releaseNotes || 'Melhorias gerais de estabilidade e novas funcionalidades.'}
            </div>
            <div id="updater-progress-area" style="display: none; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">
                <span>Baixando atualização...</span>
                <span id="updater-progress-label">0%</span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                <div id="updater-progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #10b981, #3b82f6); transition: width 0.2s;"></div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-download-update" style="font-size: 12px; font-weight: 700; padding: 8px 16px;">
              ⬇️ Baixar e Preparar Instalação
            </button>
          </div>
        `;

        document.getElementById('btn-download-update')?.addEventListener('click', async () => {
          const btnDl = document.getElementById('btn-download-update');
          const pArea = document.getElementById('updater-progress-area');
          if (btnDl) btnDl.style.display = 'none';
          if (pArea) pArea.style.display = 'block';

          await window.api.updater.download();
        });
      } else if (data.status === 'downloaded') {
        feedbackContainer.innerHTML = `
          <div style="padding: 16px; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); margin-top: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-weight: 700; font-size: 14px; color: #34d399;">
                🎉 Atualização v${data.version} Baixada com Sucesso!
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Um snapshot seguro do seu banco de dados SQLite será criado antes de reiniciar.
              </div>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-apply-update" style="font-size: 12px; font-weight: 700; padding: 8px 18px; background: linear-gradient(135deg, #10b981, #059669);">
              🚀 Instalar e Reiniciar Agora
            </button>
          </div>
        `;

        document.getElementById('btn-apply-update')?.addEventListener('click', async () => {
          await window.api.updater.install();
        });
      }
    });
  }

  if (window.api?.updater?.onProgress) {
    window.api.updater.onProgress((prog) => {
      const fill = document.getElementById('updater-progress-fill');
      const label = document.getElementById('updater-progress-label');
      if (fill) fill.style.width = `${prog.percent}%`;
      if (label) label.textContent = `${prog.percent}%`;
    });
  }

  if (btnRollback) {
    btnRollback.onclick = async () => {
      if (confirm('Deseja realmente reverter para a versão anterior do FinançasFamília?\n\nSeus dados e lançamentos continuarão preservados.')) {
        const res = await window.api.updater.rollback({ restoreDatabase: false });
        if (res.success) {
          toast(res.message || 'Instrução de reversão enviada com sucesso.');
        } else {
          toast(res.error || 'Não foi possível reverter a versão.', 'error');
        }
      }
    };
  }
}


