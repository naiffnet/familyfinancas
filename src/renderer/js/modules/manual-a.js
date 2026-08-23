/* manual-a.js - parte 1/2 */

/**
 * Retorna o HTML do menu em árvore (Sidebar) do Manual do Usuário
 */
function getManualSidebarHtml() {
  return `
    <!-- MENU EM ÁRVORE DE ASSUNTOS E SUBMENUS -->
    <div id="manual-tree-sidebar" style="width: 270px; min-width: 270px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; scrollbar-width: thin;">
      
      <!-- GRUPO 1: CARTÕES DE CRÉDITO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="cartoes" data-topic="cartao-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • Competência vs Vencimento
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Ciclo & Melhor Dia de Compra
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Limite Total vs Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Pagamento & Baixa Atômica
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-destaque" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 600; cursor: pointer; border-left: 2px solid transparent;">
            • ✨ Destaque Cromático de Parcelas (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Renegociação & Acordo de Faturas
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-reabertura" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Reabertura & Desfazer Quitação
          </div>
        </div>
      </div>

      <!-- GRUPO 2: DASHBOARD & PAINEL DE CONTROLE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="dashboard" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #fb923c; background: rgba(249,115,22,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📊 Dashboard & Painel</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-kpis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 📊 Indicadores Principais (KPIs)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-pendencias-anteriores" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fbbf24; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • ⚠️ Pendências de Meses Anteriores (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-alertas-coloridos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #34d399; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🚦 Alertas Diferenciados (Receitas vs Despesas)
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-cards-limites" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #fb923c; font-weight: 600; cursor: pointer; border-left: 2px solid transparent;">
            • 💳 Cartões, Faturas & Limites Reais
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-contas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🏦 Contas Bancárias & Cheque Especial
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-links" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🚨 Faixa de Avisos & Links Diretos
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-prioridades" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • ⭐ Prioritários, A Pagar & Pagas
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-graficos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 📈 Gráficos de Fluxo & Categorias
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-consolidado" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🌐 Visão Geral, Metas & Patrimônio
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-contraste" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🎨 Modos de Contraste & Usabilidade
          </div>
        </div>
      </div>

      <!-- GRUPO 3: DESPESAS & RECEITAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #34d399; background: rgba(16,185,129,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📌 Despesas & Receitas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Competência (Ref: MM/AAAA)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-fixas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Fixas & Prioridade ⭐
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-avulsos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Despesas Variáveis (Avulsas)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Juros, Multas e Descontos
          </div>
        </div>
      </div>

      <!-- GRUPO 4: CONTAS & CARTEIRAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #06b6d4; background: rgba(6,182,212,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 Contas, Vouchers & Bancos</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-tipos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tipos de Contas Bancárias
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-beneficio" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #06b6d4; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🎟️ Cartões Benefício & Vouchers (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transf" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Transferências sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-produtos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Produtos da Conta & Limites
          </div>
        </div>
      </div>

      <!-- GRUPO 5: FAMÍLIA & PERMISSÕES -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="familia" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #a78bfa; background: rgba(167,139,250,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>👨‍👩‍👧 Família & Permissões</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Papéis de Usuário (ADM, etc)
          </div>
          <div class="wiki-tree-item" data-cat="familia" data-topic="fam-permissoes" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Permissões Granulares por Menu
          </div>
        </div>
      </div>

      <!-- GRUPO 6: SINCRONIZAÇÃO & ANTI-DUPLICIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="sync" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🛡️ Sincronização & Anti-Duplicidade</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-uuid" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 🔑 UUIDs & Multi-Aparelho
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-receitas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #34d399; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 💰 Regra de Receitas & Mesma Conta (Novo)
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-dedup" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 🧠 Motor Heurístico & Dívidas
          </div>
          <div class="wiki-tree-item" data-cat="sync" data-topic="sync-conciliacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • ⚖️ Central de Conciliação & Ações em Lote
          </div>
        </div>
      </div>

      <!-- GRUPO 7: ORÇAMENTOS & METAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamentos" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f43f5e; background: rgba(244,63,94,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 Orçamentos & Metas</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-budgets" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Tetos de Gastos por Categoria
          </div>
          <div class="wiki-tree-item" data-cat="orcamentos" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Metas Financeiras & Aportes
          </div>
        </div>
      </div>

      <!-- GRUPO 8: METODOLOGIA 50-30-20 -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="metodologia" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #c084fc; background: rgba(192,132,252,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💡 Metodologia 50-30-20</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="metodologia" data-topic="met-regra" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Como Dividir o Orçamento Familiar
          </div>
        </div>
      </div>

      <!-- GRUPO 9: ARQUITETURA MODULAR & DESENVOLVIMENTO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="arquitetura" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #eab308; background: rgba(234,179,8,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏗️ Arquitetura & Manutenção</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="arquitetura" data-topic="arq-modular" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #eab308; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • ⚡ Modularização (< 1000 Linhas) & Build
          </div>
        </div>
      </div>

      <!-- GRUPO 10: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f87171; background: rgba(248,113,113,0.08); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ FAQ (Perguntas)</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-interativo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • Dúvidas Frequentes (Clique e Veja)
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos 1 a 5 do painel de conteúdo
 */
function getManualTopicsPart1Html() {
  return `
    <!-- TÓPICO 1.1: CARTÕES > COMPETÊNCIA VS VENCIMENTO -->
    <div class="manual-topic-content" id="topic-cartao-competencia" style="display: block;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        📅 Competência da Fatura vs Data de Vencimento
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conceito Fundamental:</strong> A <em>competência</em> é o mês em que a despesa ou o ciclo da fatura ocorreu (ex: compras feitas até 25/02 pertencem à competência <code>Ref: 02/2026</code>). O <em>vencimento</em> é o dia limite para pagar o boleto do banco (ex: <code>05/03/2026</code>).
        </div>
        <p style="margin-bottom: 10px;">No FinançasFamília, as faturas e compras são organizadas por <strong>Mês de Referência</strong> para que você saiba exatamente o quanto consumiu no período, mantendo o controle do fluxo de caixa e o cumprimento do orçamento.</p>
      </div>
    </div>

    <!-- TÓPICO 1.2: CARTÕES > CICLO & MELHOR DIA -->
    <div class="manual-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        🛒 Ciclo de Fechamento & Melhor Dia de Compra
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Como Funciona o Fechamento:</strong> Todo cartão possui um <em>Dia de Fechamento (Corte)</em> e um <em>Dia de Vencimento</em>.
        </div>
        <p style="margin-bottom: 8px;">• <strong>Antes do Fechamento:</strong> Compras feitas até o dia de corte entram na fatura do mês atual.</p>
        <p style="margin-bottom: 8px;">• <strong>Melhor Dia de Compra (Após o Fechamento):</strong> Compras realizadas a partir do dia seguinte ao corte caem automaticamente na fatura do mês subsequente, dando até 40 dias para pagar!</p>
        <p style="margin: 0;">• <strong>Cálculo Automático:</strong> O aplicativo calcula e projeta cada parcela no mês exato da fatura de acordo com o dia da compra.</p>
      </div>
    </div>

    <!-- TÓPICO 1.3: CARTÕES > LIMITE TOTAL VS COMPROMETIDO -->
    <div class="manual-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        📊 Limite Total vs Limite Comprometido
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O limite do cartão é gerenciado de forma contínua:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li><strong>Limite Total:</strong> Valor máximo liberado pelo banco (ex: R$ 5.000,00).</li>
          <li><strong>Limite Comprometido:</strong> Soma de todas as compras parceladas futuras e faturas abertas que ainda não foram pagas.</li>
          <li><strong>Limite Disponível:</strong> <code>Limite Total - Limite Comprometido</code>. Conforme as faturas são pagas, o limite é liberado proporcionalmente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.4: CARTÕES > PAGAMENTO DA FATURA -->
    <div class="manual-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        💳 Pagamento & Baixa Atômica da Fatura
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao quitar uma fatura de cartão de crédito:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique no botão verde <strong>"Pagar Fatura"</strong> no card do cartão.</li>
          <li>Selecione a <strong>Conta Bancária Pagadora</strong> de onde o dinheiro sairá.</li>
          <li>Confirme a data de pagamento e o valor (total ou parcial).</li>
        </ol>
        <p style="margin: 0;">O sistema baixa a fatura, debita da sua conta bancária e <strong>marca atomicamente todas as compras e parcelas atreladas àquela fatura como pagas</strong>!</p>
      </div>
    </div>

    <!-- TÓPICO 1.5: CARTÕES > DESTAQUE CROMÁTICO DE PARCELAS (NOVO) -->
    <div class="manual-topic-content" id="topic-cartao-destaque" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>✨ Destaque Cromático Inteligente de Parcelas</span>
        <span class="badge badge-blue">Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56,189,248,0.08); border-left: 4px solid var(--accent); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Auditoria Visual Instantânea:</strong> Chega de perder tempo procurando quais compras pertencem a qual fatura!
        </div>
        <p style="margin-bottom: 10px;">Ao clicar sobre qualquer card de fatura na tela de Planejamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>🎨 <strong>Realce de Cor Oficial:</strong> Todas as despesas e compras parceladas vinculadas àquela fatura são imediatamente iluminadas com a <strong>cor tema e borda personalizada do cartão/banco</strong>.</li>
          <li>🔍 <strong>Foco Automático:</strong> Os lançamentos que não pertencem ao cartão são atenuados suavemente, e a tela rola automaticamente até a primeira parcela da fatura.</li>
          <li>🏷️ <strong>Badge Explicativa:</strong> Um selo visual exibe <code>📍 Parcela desta Fatura</code> ao lado de cada item destacado.</li>
          <li>↩️ <strong>Desativar:</strong> Basta clicar novamente no card da fatura para retornar à visualização normal.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.6: CARTÕES > RENEGOCIAÇÃO E ACORDO -->
    <div class="manual-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700;">
        🤝 Renegociação & Acordo de Faturas
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você precisou parcelar a fatura com o banco ou fazer um acordo:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique no botão roxo <strong>"Renegociar / Acordo"</strong> no card da fatura.</li>
          <li>Informe o valor de entrada (se houver) e o número de parcelas acordadas com os juros.</li>
          <li>A fatura atual é liquidada como <span class="badge badge-purple">Acordo / Renegociada</span> e o sistema <strong>injeta automaticamente as parcelas do acordo nos meses futuros</strong> como despesas recorrentes transparentes.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 1.7: CARTÕES > REABERTURA DE FATURA -->
    <div class="manual-topic-content" id="topic-cartao-reabertura" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
        🔓 Reabertura de Fatura & Estorno Seguro
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você deu baixa ou renegociou uma fatura por engano:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Clique em <strong>"Reabrir Fatura"</strong>.</li>
          <li>O valor pago é <strong>estornado de volta para o saldo da sua conta bancária</strong>.</li>
          <li>Se houve renegociação, as parcelas futuras geradas pelo acordo são canceladas e removidas.</li>
          <li>A fatura volta para o estado <span class="badge badge-yellow">⏳ Aberta</span> e recalcula seu valor total automaticamente.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.1: DASHBOARD > KPIS PRINCIPAIS -->
    <div class="manual-topic-content" id="topic-dash-kpis" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 Indicadores Principais de Fluxo de Caixa (KPIs)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Visão Geral Instantânea da Saúde Financeira do Mês:</strong>
        </div>
        <p style="margin-bottom: 10px;">Os 4 cards de topo do Dashboard resumem com exatidão a competência financeira selecionada:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Receitas Totais:</strong> Soma de todas as entradas fixas (salários, pró-labore, pensões, aluguéis recebidos) e receitas variáveis já recebidas ou projetadas para o mês.</li>
          <li>🔴 <strong>Despesas Totais:</strong> Soma consolidada de todas as despesas fixas, variáveis avulsas e faturas de cartão de crédito que vencem no mês.</li>
          <li>⏳ <strong>À Pagar (Pendentes):</strong> Montante total das contas do mês que ainda não foram baixadas como pagas (<code>is_paid = 0</code>).</li>
          <li>⚖️ <strong>Saldo Previsto:</strong> Diferença matemática <code>Receitas Totais - Despesas Totais</code>. Se positivo, indica sobra orçamentária; se negativo, alerta para necessidade de remanejar recursos.</li>
        </ul>
        <p style="margin: 0;">📊 <strong>Barra de Progresso:</strong> Logo abaixo dos KPIs, uma barra dinâmica indica a proporção de contas já quitadas no mês (ex: <em>7 de 10 contas pagas • 70%</em>).</p>
      </div>
    </div>

    <!-- TÓPICO 2.2: DASHBOARD > PENDÊNCIAS DE MESES ANTERIORES (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-pendencias-anteriores" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fbbf24; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚠️ Container de Pendências de Meses Anteriores Não Pagas</span>
        <span class="badge badge-yellow">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Rastreamento Ativo de Dívidas e Contas Esquecidas do Passado:</strong>
        </div>
        <p style="margin-bottom: 10px;">Sempre que você estiver visualizando o Dashboard de um mês (ex: <em>Agosto/2026</em>) e existirem lançamentos de meses anteriores (ex: <em>Julho, Junho ou Janeiro</em>) que ainda não foram pagos (<code>is_paid = 0</code>), o sistema exibe automaticamente um container temático de alerta:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔢 <strong>Contador de Pendências & Total Acumulado:</strong> Informa a quantidade exata de itens em atraso e a soma monetária total das dívidas passadas em aberto.</li>
          <li>📅 <strong>Identificação de Origem:</strong> Cada item exibe uma badge colorida com o mês/ano de competência original (ex: <code>📅 Julho/2026</code>), a descrição, o titular e o banco.</li>
          <li>🎯 <strong>Navegação Direta com 1 Clique:</strong> Ao clicar em qualquer pendência, o aplicativo altera o seletor do mês para a data de origem, abre o Planejamento na aba correta e aplica um <strong>pulso de luz (*glow flash*)</strong> sobre o lançamento para você localizá-lo e dar baixa imediatamente!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.3: DASHBOARD > ALERTAS CROMÁTICOS (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-alertas-coloridos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚦 Diferenciação Cromática Inteligente na Faixa de Avisos</span>
        <span class="badge badge-green">Novo Recurso</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Separação Visual Clara entre o que Entra e o que Sai:</strong>
        </div>
        <p style="margin-bottom: 10px;">Para evitar confusão visual entre contas a pagar e receitas a receber:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong style="color: var(--accent-light);">💰 Faixa Verde (Recebimentos Próximos):</strong> Destaca exclusivamente salários, aluguéis, pro-labores e rendimentos previstos para os próximos dias, com chips verdes clicáveis.</li>
          <li>🔴 <strong style="color: #f87171;">🚨 Faixa Vermelha (Vencimentos Próximos):</strong> Alerta sobre contas fixas, faturas e parcelas prestes a vencer para evitar atrasos e juros.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.4: DASHBOARD > CARTÕES, FATURAS E LIMITES (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-cards-limites" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 Previsibilidade de Cartões, Faturas & Limites Reais</span>
        <span class="badge badge-blue">Recurso Aprimorado</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Auditoria e Previsibilidade de Limites Bancários:</strong>
        </div>
        <p style="margin-bottom: 10px;">Cada cartão de crédito exibido no quadro <strong>"🏦 Previsibilidade de Contas e Cartões"</strong> traz informações vitais e transparentes:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💳 <strong>Limite Total:</strong> O limite de crédito contratado e cadastrado no banco (ex: <code>R$ 5.000,00</code>).</li>
          <li>🔴 <strong>Fatura do Mês:</strong> O valor exato das compras e parcelas que vencem na fatura do mês selecionado (ex: <code>R$ 1.004,05</code>).</li>
          <li>🟠 <strong>Comprometido Total:</strong> A soma global de <strong>todas as compras e parcelas futuras em aberto</strong> que já consom o limite do seu cartão (ex: <code>R$ 5.824,30</code>).</li>
          <li>🟢/🔴 <strong>Disponível / Excedido:</strong> Saldo livre real calculado como <code>Limite Total - Comprometido Total</code>. Se você realizou compras parceladas superiores ao limite, o saldo é exibido em <strong>vermelho com valor negativo</strong> (ex: <code>-R$ 824,30</code>) e badge <span class="badge badge-danger">⚠️ LIMITE EXCEDIDO</span>.</li>
          <li>🍩 <strong>Spinner / Donut SVG Interativo:</strong> O gráfico de rosca exibe o percentual real de utilização do cartão (inclusive valores como <code>116% ULTRAPASSADO</code> ou <code>126% ULTRAPASSADO</code> envolto por anel tracejado de perigo).</li>
          <li>🔒 <strong>Fechamento & Vencimento:</strong> Exibe os dias exatos de corte da fatura e data de débito.</li>
          <li>✨ <strong>Clique no Card:</strong> Ao clicar sobre qualquer card de cartão no Dashboard, o aplicativo abre o Planejamento e <strong>destaca todas as parcelas da fatura com a cor oficial do banco</strong>!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.3: DASHBOARD > CONTAS BANCÁRIAS E CHEQUE ESPECIAL -->
    <div class="manual-topic-content" id="topic-dash-contas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>🏦 Previsibilidade de Contas Correntes, Poupanças & Cheque Especial</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Os widgets de contas correntes, contas de pagamento e carteiras exibem:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💰 <strong>Saldo Atual em Conta:</strong> O saldo líquido real conciliado no banco.</li>
          <li>🛡️ <strong>Limite de Cheque Especial (LIS):</strong> Limite de crédito rotativo configurado para a conta.</li>
          <li>⚡ <strong>Saldo Disponível Operacional:</strong> Total utilizável imediatamente <code>(Saldo em Conta + Cheque Especial)</code>.</li>
          <li>👤 <strong>Identificação de Titularidade:</strong> Cada conta traz o badge cromático do membro da família responsável (ex: <em>William, Jennifer, Isabel</em>).</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.4: DASHBOARD > AVISOS & LINKS DIRETOS (NOVO) -->
    <div class="manual-topic-content" id="topic-dash-links" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚨 Faixa de Avisos & Links Diretos para Lançamentos</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(249,115,22,0.08); border-left: 4px solid #fb923c; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Diferenciação Cromática de Alertas & Navegação Instantânea:</strong>
        </div>
        <p style="margin-bottom: 10px;">Os avisos de proximidade (próximos 3 dias) são separados visualmente por tipo de fluxo financeiro:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Recebimentos Próximos (Faixa Verde 💰):</strong> Salários, pró-labore, pensões e receitas a receber nos próximos dias aparecem em <strong>chips verdes esmeralda</strong>, transmitindo tranquilidade e previsão de caixa positivo.</li>
          <li>🔴 <strong>Vencimentos Próximos (Faixa Vermelha 🚨):</strong> Boletos, contas fixas, faturas e despesas a pagar nos próximos dias aparecem em <strong>chips vermelhos de alerta</strong> para evitar atrasos e juros.</li>
          <li>⚡ <strong>Navegação Instantânea:</strong> Cada chip é um link direto clicável. Ao clicar, o aplicativo abre o <strong>Planejamento</strong>, faz rolagem suave e aplica um <strong>efeito pulsante (*glow flash*)</strong> sobre a conta!</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.5: DASHBOARD > PRIORIDADES, A PAGAR E PAGAS -->
    <div class="manual-topic-content" id="topic-dash-prioridades" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>⭐ Quadros de Prioridades, Contas a Pagar e Contas Pagas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No centro do Dashboard, três colunas organizam a rotina operacional do mês:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⭐ <strong>Prioritários:</strong> Reúne todas as contas marcadas com estrela de prioridade indispensável no mês, facilitando que você não deixe passar compromissos críticos.</li>
          <li>⏳ <strong>Contas a Pagar:</strong> Todas as despesas pendentes do mês ordenadas cronologicamente por proximidade da data de vencimento.</li>
          <li>✓ <strong>Contas Pagas:</strong> Histórico de despesas já quitadas com indicação da conta bancária de onde o recurso saiu.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.6: DASHBOARD > GRÁFICOS INTERATIVOS -->
    <div class="manual-topic-content" id="topic-dash-graficos" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
        <span>📈 Gráficos de Fluxo de Caixa & Distribuição por Categoria</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">O Dashboard conta com gráficos interativos que facilitam a tomada de decisão:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📊 <strong>Evolução Mensal (Barras):</strong> Compara visualmente as Receitas vs. Despesas ao longo dos últimos meses, permitindo enxergar tendências de economia ou aperto financeiro.</li>
          <li>🍩 <strong>Despesas por Categoria (Rosca):</strong> Aponta visualmente em que áreas o dinheiro da família está sendo alocado (ex: <em>Moradia, Alimentação, Educação, Transporte, Saúde, Lazer</em>), com valores e percentuais.</li>
        </ul>
      </div>
    </div>

    <!-- TÓPICO 2.7: DASHBOARD > VISÃO GERAL, METAS E PATRIMÔNIO -->
    <div class="manual-topic-content" id="topic-dash-consolidado" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #fb923c; font-weight: 700;">
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
  `;
}