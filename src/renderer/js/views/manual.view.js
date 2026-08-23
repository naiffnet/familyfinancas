/**
 * MANUAL DO USUÁRIO & WIKI VIEW MODULE
 * Central de conhecimento, regras de negócio e FAQ interativo.
 */

import { toast } from '../components/toast.js';

export async function renderManual() {
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
            <div class="wiki-tree-item" data-cat="sync" data-topic="sync-dedup" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
              • 🧠 Motor Heurístico Anti-Duplicidade
            </div>
            <div class="wiki-tree-item" data-cat="sync" data-topic="sync-conciliacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
              • ⚖️ Central de Conciliação (Mesclar / Manter)
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

        <!-- GRUPO 9: FAQ INTERATIVO -->
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

      <!-- PAINEL DE CONTEÚDO (DIREITA) -->
      <div id="manual-display-panel" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 22px; scrollbar-width: thin;">

        <!-- TÓPICO 1.1: CARTÕES > COMPETÊNCIA VS VENCIMENTO -->
        <div class="manual-topic-content" id="topic-cartao-competencia" style="display: block;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>📋 Competência vs. Vencimento na Fatura do Cartão</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <div style="background: rgba(96,165,250,0.08); border-left: 4px solid #60a5fa; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
              <strong>Como o aplicativo sincroniza o consumo real com o vencimento do cartão:</strong>
            </div>
            <p style="margin-bottom: 10px;">• <strong>Mês de Competência da Fatura (<code>competence_date</code>):</strong> Representa o mês do ciclo de compras. Por exemplo, a fatura com ciclo encerrando em 25 de <em>Fevereiro</em> possui competência de <strong>Fevereiro</strong>.</p>
            <p style="margin-bottom: 10px;">• <strong>Data de Vencimento (<code>due_day</code>):</strong> É o dia exato em que o banco cobra o pagamento da fatura (ex: dia 05 de <em>Março</em>).</p>
            <p style="margin-bottom: 10px;">• <strong>Controle de Despesas Parceladas:</strong> Cada parcela de uma compra parcelada é atribuída automaticamente à fatura do seu respectivo mês de competência, garantindo que o seu fluxo de caixa reflita a realidade exata de cada período.</p>
          </div>
        </div>

        <!-- TÓPICO 1.2: CARTÕES > CICLO & MELHOR DIA -->
        <div class="manual-topic-content" id="topic-cartao-ciclo" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
            🔒 Ciclo de Fechamento & O "Melhor Dia de Compra"
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
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

        <!-- TÓPICO 1.3: CARTÕES > LIMITE COMPROMETIDO -->
        <div class="manual-topic-content" id="topic-cartao-limite" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
            📊 Limite Global Comprometido vs. Limite Disponível
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">Quando você cadastra um cartão com <strong>Limite Total de R$ 5.000,00</strong>:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
              <li>Se você faz uma compra de <strong>R$ 1.200,00 em 12x de R$ 100,00</strong>, o limite disponível cai imediatamente para <strong>R$ 3.800,00</strong>.</li>
              <li>O widget de Rosca (Donut) no Dashboard exibe <code>Limite Comprometido = R$ 1.200,00 (24%)</code>.</li>
              <li>Conforme você paga a fatura mensal (R$ 100,00), o sistema libera R$ 100,00 do limite automaticamente!</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 1.4: CARTÕES > PAGAMENTO & BAIXA ATÔMICA -->
        <div class="manual-topic-content" id="topic-cartao-pagamento" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
            💵 Pagamento de Fatura & Baixa Atômica
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">Ao clicar no botão <strong>"Pagar Fatura"</strong> na aba de Planejamento:</p>
            <div style="background: var(--bg-raised); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 12px;">
              <p style="margin-bottom: 6px;">1. 🏦 <strong>Débito em Conta:</strong> O valor líquido da fatura é subtraído do saldo da conta corrente selecionada.</p>
              <p style="margin-bottom: 6px;">2. 🏷️ <strong>Status da Fatura:</strong> A fatura é marcada como <span class="badge badge-green">Paga</span> com a data exata do pagamento.</p>
              <p style="margin: 0;">3. 📦 <strong>Baixa nas Compras:</strong> Todas as compras e parcelas pertencentes àquele ciclo são marcadas como quitadas em uma única transação atômica.</p>
            </div>
          </div>
        </div>

        <!-- TÓPICO 1.5: CARTÕES > DESTAQUE CROMÁTICO DE PARCELAS (NOVO) -->
        <div class="manual-topic-content" id="topic-cartao-destaque" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>✨ Destaque Cromático Interativo de Parcelas</span>
            <span class="badge badge-blue">Recurso Novo</span>
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <div style="background: rgba(56,189,248,0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
              <strong>Auditoria e Composição Visual Instantânea da Fatura:</strong>
            </div>
            <p style="margin-bottom: 12px;">Para saber exatamente quais despesas e parcelas formam o valor de uma fatura de cartão de crédito:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
              <li>Basta <strong>dar um clique sobre o card da fatura</strong> na aba Planejamento (ex: <code>FATURA CARTÃO CARREFOUR</code>).</li>
              <li>O sistema acende instantaneamente todas as compras e parcelas correspondentes na tela de Despesas com a <strong>cor oficial do cartão</strong> (ex: Azul Carrefour <code>#00569C</code>, Roxo Nubank <code>#820ad1</code>, Laranja Itaú <code>#EC7000</code>).</li>
              <li>Cada parcela ganha uma <strong>tarja lateral espessa</strong>, <strong>fundo iluminado (*glow*)</strong> e uma pílula informativa: <code>💳 Nome do Cartão • Composição da Fatura</code>.</li>
              <li>A tela desce com <strong>rolagem suave</strong> diretamente até o primeiro lançamento correspondente.</li>
              <li>Os lançamentos de outros bancos ou de despesas fixas gerais são atenuados temporariamente para você conferir a fatura com máxima clareza.</li>
              <li>Para desmarcar, basta <strong>clicar novamente no card da fatura</strong> ou na etiqueta de destaque.</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 1.6: CARTÕES > RENEGOCIAÇÃO & ACORDO -->
        <div class="manual-topic-content" id="topic-cartao-acordo" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700;">
            🤝 Renegociação & Parcelamento de Fatura
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin-bottom: 10px;">Caso você parcele ou faça um acordo da fatura com o banco:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
              <li>Clique em <strong>"Renegociar / Acordo"</strong> no card da fatura.</li>
              <li>Informe o valor da entrada (se houver) e a conta pagadora.</li>
              <li>Estipule o número de parcelas (ex: 6x) e o valor de cada uma.</li>
              <li>O sistema encerra a fatura com o selo <span class="badge badge-purple">🤝 Renegociada</span> e gera automaticamente as despesas recorrentes parceladas nos meses futuros.</li>
            </ul>
          </div>
        </div>

        <!-- TÓPICO 1.7: CARTÕES > REABERTURA & ESTORNO -->
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
              <li>🍩 <strong>Spinner / Donut SVG Interativo:</strong> O gráfico de rosca exibe o percentual real de utilização do cartão (inclusive valores como <code>116% ULTRAPASSADO</code> envolto por anel tracejado de perigo).</li>
            </ul>
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

        <!-- TÓPICO 4.2: CONTAS > TRANSFERÊNCIAS -->
        <div class="manual-topic-content" id="topic-contas-transf" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700;">
            🔁 Transferências entre Contas sem Duplicação
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">Ao usar o botão <strong>"Nova Transferência"</strong> na tela de Contas, o saldo é transferido da conta de origem para a de destino sem gerar receitas ou despesas artificiais no balanço familiar.</p>
          </div>
        </div>

        <!-- TÓPICO 4.3: CONTAS > PRODUTOS -->
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

        <!-- TÓPICO 6.1: ORÇAMENTOS > BUDGETS -->
        <div class="manual-topic-content" id="topic-orc-budgets" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
            🎯 Tetos de Gastos por Categoria (Orçamento)
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">Estabeleça um limite mensal máximo para categorias como Alimentação, Lazer e Transporte. A barra de progresso avisa com cores quando o teto estiver próximo de ser atingido.</p>
          </div>
        </div>

        <!-- TÓPICO 6.2: ORÇAMENTOS > METAS -->
        <div class="manual-topic-content" id="topic-orc-metas" style="display: none;">
          <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f43f5e; font-weight: 700;">
            🏆 Metas Financeiras & Cofrinhos de Economia
          </h4>
          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
            <p style="margin: 0;">Crie objetivos como Viagem de Férias, Reserva de Emergência ou Troca de Carro, registrando aportes mensais com cálculo automático da data estimada de conclusão.</p>
          </div>
        </div>

        <!-- TÓPICO 7.1: METODOLOGIA 50-30-20 -->
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

        <!-- TÓPICO 8.1: FAQ INTERATIVO -->
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

export default { renderManual };
