/* manual-a.js - parte 1/2 */

/**
 * Retorna o HTML do menu em árvore (Sidebar) do Manual do Usuário com os 13 Capítulos
 */
function getManualSidebarHtml() {
  return `
    <!-- MENU EM ÁRVORE DE ASSUNTOS E SUBMENUS (13 CAPÍTULOS) -->
    <div id="manual-tree-sidebar" style="width: 285px; min-width: 285px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin;">
      
      <!-- CAPÍTULO 1: PRIMEIROS PASSOS & ACESSO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="primeiros" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #60a5fa; background: rgba(59,130,246,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🌟 1. Primeiros Passos & Acesso</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item active" data-cat="primeiros" data-topic="primeiros-familia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-primary); cursor: pointer; border-left: 2px solid var(--accent); background: var(--bg-raised);">
            • 1.1 Criando Família e Usuário
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-perfis" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.2 Perfis & Permissões Granulares
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-recuperacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.3 Recuperação de Senha Segura
          </div>
          <div class="wiki-tree-item" data-cat="primeiros" data-topic="primeiros-temas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 1.4 Temas & Personalização Visual
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 2: CONTAS, CARTEIRAS & BENEFÍCIOS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="contas" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #06b6d4; background: rgba(6,182,212,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🏦 2. Contas & Benefícios</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-cadastro" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.1 Contas, Poupanças & Dinheiro
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-beneficios" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.2 Cartões Benefício (*Flash, Caju*)
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-transferencias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.3 Transferências Sem Duplicação
          </div>
          <div class="wiki-tree-item" data-cat="contas" data-topic="contas-limites" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 2.4 Cheque Especial & LIS
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 3: CARTÕES DE CRÉDITO & FATURAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="cartoes" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #a855f7; background: rgba(168,85,247,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💳 3. Cartões de Crédito</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-ciclo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.1 Ciclo & Melhor Dia de Compra
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-limite" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.2 Limite Total vs Comprometido
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.3 Pagamento Integral da Fatura
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-rotativo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.4 Pagamento Parcial & Rotativo
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-antecipacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.5 Antecipação com Desconto
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-acordo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.6 Renegociação & Acordos
          </div>
          <div class="wiki-tree-item" data-cat="cartoes" data-topic="cartao-estorno" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 3.7 Estorno em 1 Clique
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 4: LANÇAMENTOS & NOTAS FISCAIS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="lancamentos" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #10b981; background: rgba(16,185,129,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📝 4. Lançamentos & NF-e</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-despesas-receitas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.1 Despesas e Receitas
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-competencia" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.2 Mês de Competência
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-nfce-qr" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.3 Leitor de Nota Fiscal (QR Code)
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-duplicados" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 4.4 Alerta de Duplicidades
          </div>
          <div class="wiki-tree-item" data-cat="lancamentos" data-topic="lanc-popup-detalhes" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 4.5 Pop-up de Detalhes & 3 Ações
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 5: JUROS, MULTAS & FERIADOS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="juros" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f59e0b; background: rgba(245,158,11,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>⚖️ 5. Juros, Multas & Feriados</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-prorrogacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.1 Prorrogação em Feriados
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-calculo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.2 Cálculo de Juros & Multas
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-projecao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.3 Projeção para Pagamento Hoje
          </div>
          <div class="wiki-tree-item" data-cat="juros" data-topic="juros-pagamento" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 5.4 Pagamento com Acréscimo/Desconto
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 6: PLANEJAMENTO & RECORRÊNCIAS -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="planejamento" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #ec4899; background: rgba(236,72,153,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🔄 6. Planejamento Mensal</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-fixas-parceladas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.1 Despesas Fixas & Parceladas
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-prioritarias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.2 Despesas Prioritárias ⭐
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-adiar" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.3 Adiar Parcela para o Mês
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-kanban" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 6.4 Kanban com Drag & Drop
          </div>
          <div class="wiki-tree-item" data-cat="planejamento" data-topic="plan-decisao-cards" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #a78bfa; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 6.5 Cards de Decisão de Recorrência
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 7: ORÇAMENTOS & METAS INTELIGENTES (PILAR 2) -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="orcamento" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f43f5e; background: rgba(244,63,94,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🎯 7. Orçamentos & Metas CDI</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-tetos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.1 Tetos de Orçamento
          </div>
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-503020" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #f43f5e; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 7.2 Regra 50-30-20 (*Equilíbrio*)
          </div>
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-barras" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.3 Barras de Limite Coloridas
          </div>
          <div class="wiki-tree-item" data-cat="orcamento" data-topic="orc-metas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 7.4 Metas com CDI & Simulador PMT
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 8: DASHBOARD & KANBAN -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="dashboard" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #fb923c; background: rgba(249,115,22,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📊 8. Dashboard & Painel</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-modos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.1 Os 3 Modos de Visualização
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-filtros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.2 Filtros por Membro e Conta
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-kanban" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.3 Kanban em 3 Colunas
          </div>
          <div class="wiki-tree-item" data-cat="dashboard" data-topic="dash-pendencias" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 8.4 Pendências de Meses Anteriores
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 9: RELATÓRIOS, GOVERNANÇA & PILARES 1, 2 E 3 -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="relatorios" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #818cf8; background: rgba(129,140,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📈 9. Relatórios & Governança</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-fluxo" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.1 Fluxo de Caixa Mensal
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-graficos" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.2 Gráficos por Categoria
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-patrimonio" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.3 Patrimônio & Classes de Ativos
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-projecao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #8b5cf6; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 9.4 Projeção Preditiva (30 Dias)
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-radar-assinaturas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #ec4899; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 9.5 Radar de Assinaturas & Recorrências
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-auditoria-juros" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.6 Auditoria de Juros & Encargos
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-fair-share" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #3b82f6; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 9.7 Divisão Familiar (*Fair Share*)
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-dre" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #10b981; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 9.8 DRE Pessoal Estruturado
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-stress-test" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #f59e0b; font-weight: 700; cursor: pointer; border-left: 2px solid transparent;">
            • 9.9 Simulador de Estresse (*E se...?*)
          </div>
          <div class="wiki-tree-item" data-cat="relatorios" data-topic="rep-impressao-pdf" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 9.10 Impressão & Exportação PDF
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 10: AUDITORIA, SEGURANÇA & LGPD -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="seguranca" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #14b8a6; background: rgba(20,184,166,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>🛡️ 10. Auditoria & LGPD</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="seguranca" data-topic="seg-trilha-auditoria" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 10.1 Histórico de Modificações
          </div>
          <div class="wiki-tree-item" data-cat="seguranca" data-topic="seg-lgpd" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 10.2 Direitos LGPD & Privacidade
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 11: BACKUPS & INTEGRIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="backup" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #eab308; background: rgba(234,179,8,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>💾 11. Backups & Restauração</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-exportacao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.1 Exportação Excel, CSV, DB
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-teste-integridade" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.2 Testar Integridade (.db)
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-restauracao" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.3 Restaurando um Backup
          </div>
          <div class="wiki-tree-item" data-cat="backup" data-topic="bak-saude-metricas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 11.4 Saúde & Métricas SQLite
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 12: CELULAR & RESPONSIVIDADE -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="mobile" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>📱 12. Acesso Celular & Mobile</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="mobile" data-topic="mob-conexao-wifi" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 12.1 Conexão Wi-Fi / QR Code
          </div>
          <div class="wiki-tree-item" data-cat="mobile" data-topic="mob-layout-touch" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 12.2 Layout Touch & Header
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 13: FAQ INTERATIVO -->
      <div class="wiki-tree-group">
        <div class="wiki-tree-header" data-cat="faq" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; color: #f87171; background: rgba(248,113,113,0.1); cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>❓ 13. FAQ & Dúvidas Frequentes</span>
          <span class="wiki-tree-arrow">▾</span>
        </div>
        <div class="wiki-tree-subs" style="display: flex; flex-direction: column; gap: 2px; padding-left: 10px; margin-top: 4px;">
          <div class="wiki-tree-item" data-cat="faq" data-topic="faq-duvidas" style="padding: 6px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; border-left: 2px solid transparent;">
            • 13.1 Dúvidas Mais Frequentes
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Retorna o HTML dos tópicos dos Capítulos 1 a 6 do painel de leitura
 */
function getManualTopicsPart1Html() {
  return `
    <!-- CAPÍTULO 1.1: PRIMEIROS PASSOS > FAMÍLIA & USUÁRIO -->
    <div class="manual-topic-content" id="topic-primeiros-familia" style="display: block;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🌟 1.1 Criando sua Família e Primeiro Usuário Master</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Passo a Passo de Inicialização do Ambiente Familiar:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao abrir o FinançasFamília pela primeira vez, o assistente inicial solicita:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Nome do Grupo Familiar:</strong> Digite o nome da sua casa (ex: <em>Família Silva</em> ou <em>Família Oliveira</em>).</li>
          <li><strong>Perfil do Administrador Master (ADM):</strong> Crie o login principal (usuário <code>adm</code>) com senha forte.</li>
          <li><strong>Personalização Cromática:</strong> Escolha a cor oficial do titular (ex: <em>Verde Esmeralda</em>) e um avatar.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
          💡 <strong>Exemplo Prático:</strong> O casal Carlos e Mariana cria a "Família Silva". Carlos cadastra o usuário master e em seguida convida Mariana criando o perfil secundário em <a href="javascript:void(0)" onclick="openManualTopic('primeiros-perfis')" style="color: #60a5fa; text-decoration: underline; font-weight: 700;">1.2 Perfis & Permissões Granulares</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 1.2: PERFIS & PERMISSÕES -->
    <div class="manual-topic-content" id="topic-primeiros-perfis" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>👥 1.2 Perfis de Membros da Família & Permissões Granulares</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Em <strong>⚙️ Configurações › Membros da Família</strong>, você pode cadastrar e gerenciar o acesso de cada integrante:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>👑 <strong>Administrador (ADM):</strong> Acesso total às configurações, contas bancárias, cartões, backups e gerenciamento de membros.</li>
          <li>👔 <strong>Membro Operacional:</strong> Pode lançar despesas, receitas, dar baixa em contas e visualizar o planejamento do mês.</li>
          <li>👀 <strong>Visualizador:</strong> Acesso somente-leitura aos relatórios e gráficos, ideal para acompanhamento sem permissão de alteração.</li>
          <li>🧸 <strong>Perfil Caçula:</strong> Interface simplificada e amigável para educação financeira de filhos e dependentes.</li>
        </ul>
        <div style="background: rgba(59,130,246,0.08); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          🔗 <strong>Tópico Relacionado:</strong> Veja como configurar as contas bancárias de cada familiar em <a href="javascript:void(0)" onclick="openManualTopic('contas-cadastro')" style="color: #60a5fa; font-weight: 700; text-decoration: underline;">2.1 Cadastrando Contas Correntes e Poupanças</a>.
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 1.3: RECUPERAÇÃO DE SENHA -->
    <div class="manual-topic-content" id="topic-primeiros-recuperacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔑 1.3 Recuperação de Senha Segura com Pergunta Secreta</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Privacidade Total Sem Depender de Servidores Externos:</strong>
        </div>
        <p style="margin-bottom: 10px;">Como o FinançasFamília opera 100% local no seu computador, a recuperação de senha é realizada com pergunta e resposta secreta:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Acesse <strong>⚙️ Configurações › Minha Conta</strong> e defina sua pergunta de segurança (ex: <em>"Qual o modelo do meu primeiro carro?"</em>).</li>
          <li>Digite a resposta que apenas você conhece.</li>
          <li>Se esquecer a senha, na tela de login clique em <code>Esqueci minha senha</code>, responda corretamente e crie a nova chave na hora.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 1.4: TEMAS & PERSONALIZAÇÃO -->
    <div class="manual-topic-content" id="topic-primeiros-temas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎨 1.4 Personalização Visual, Temas & Layouts do Dashboard</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Personalize a estética e o modo de visualização do aplicativo em <strong>⚙️ Configurações › Aparência</strong>:</p>
        
        <div style="background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
          <strong style="color: var(--text-primary); font-size: 14px;">🎨 Modos de Aparência Disponíveis:</strong>
          <ul style="padding-left: 20px; line-height: 1.8; margin-top: 8px; margin-bottom: 0;">
            <li>🌙 <strong>Tema Escuro (Dark Emerald):</strong> Visual escuro moderno e sofisticado, com acentos em verde esmeralda relaxantes para os olhos, ideal para uso diário e noturno.</li>
            <li>☀️ <strong>Tema Claro (Light Clean):</strong> Visual branco limpo, descansado e profissional com alto contraste, excelente para ambientes bem iluminados.</li>
            <li>🌓 <strong>Botão Rápido de Alternância:</strong> Clique no ícone de lua/sol no topo superior direito da tela (ou no cabeçalho mobile) para alternar instantaneamente entre Claro e Escuro com apenas 1 clique.</li>
          </ul>
        </div>

        <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); border-radius: 8px; padding: 14px;">
          <strong style="color: var(--text-primary); font-size: 14px;">🎛️ Modos de Layout do Dashboard (Configurações › Aparência):</strong>
          <ul style="padding-left: 20px; line-height: 1.8; margin-top: 8px; margin-bottom: 0;">
            <li>🌟 <strong>Executivo por Zonas (Padrão):</strong> Visão consolidada 360° com KPIs, cartões de contas e painel Kanban em 3 colunas.</li>
            <li>📑 <strong>Sub-Abas Operacionais:</strong> Navegação setorizada por abas (*Resumo, Faturas, Contas e Gráficos*).</li>
            <li>🚀 <strong>Cockpit Integrado:</strong> Painel panorâmico de alta densidade reunindo todas as métricas em uma tela.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 2.1: CONTAS & CADASTRO -->
    <div class="manual-topic-content" id="topic-contas-cadastro" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏦 2.1 Cadastrando Contas Correntes, Poupanças e Carteiras de Dinheiro</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na aba <strong>🏦 Contas</strong>, clique em <code>+ Nova Conta</code> para registrar onde o dinheiro da casa está guardado:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li><strong>Instituição / Banco:</strong> Selecione o banco (ex: <em>Itaú, Bradesco, Nubank, Banrisul, Inter, Caixa, Banco do Brasil</em>).</li>
          <li><strong>Tipo da Conta:</strong> Escolha entre <em>Conta Corrente</em>, <em>Conta Pagamento/Digital</em>, <em>Poupança/Investimento</em> ou <em>Dinheiro em Espécie (Carteira)</em>.</li>
          <li><strong>Titular Responsável:</strong> Vincule ao membro da família proprietário da conta.</li>
          <li><strong>Saldo Inicial Conciliado:</strong> Digite o saldo real exato que consta no extrato bancário hoje.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 2.2: CARTÕES BENEFÍCIO -->
    <div class="manual-topic-content" id="topic-contas-beneficios" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎟️ 2.2 Cartões Benefício (*Flash, Caju, Alelo, Sodexo, Swile, Banricard*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(6,182,212,0.08); border-left: 4px solid #06b6d4; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Gestão Inteligente de Vouchers de Alimentação e Refeição:</strong>
        </div>
        <p style="margin-bottom: 10px;">Cartões como <strong>Flash, Caju, Alelo, Sodexo, Swile e Banricard</strong> funcionam como contas pré-pagas corporativas:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Cadastre o cartão na tela de <strong>🏦 Contas</strong> escolhendo o tipo <em>Cartão Benefício / Voucher</em>.</li>
          <li>Ao lançar uma compra de supermercado ou restaurante, selecione o cartão benefício como pagador. O saldo é debitado exclusivamente do benefício, sem mexer no saldo da conta corrente!</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 2.3: TRANSFERÊNCIAS -->
    <div class="manual-topic-content" id="topic-contas-transferencias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 2.3 Transferências Entre Contas Sem Duplicar Gastos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao mover recursos financeiros entre familiares ou contas (ex: PIX da Conta Itaú para a Carteira de Dinheiro):</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no botão <code>🔄 Transferência</code> na tela de Contas ou Planejamento.</li>
          <li>Selecione a <strong>Conta de Origem</strong>, a <strong>Conta de Destino</strong>, a data e o valor (R$).</li>
          <li>O sistema realiza o débito e o crédito atomicamente.</li>
        </ol>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 8px;">
          🛡️ <strong>Regra Contábil:</strong> Transferências internas não são computadas como despesa nem como receita, mantendo seus gráficos e relatórios de fluxo de caixa 100% corretos!
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 2.4: LIMITES ESPECIAIS -->
    <div class="manual-topic-content" id="topic-contas-limites" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #06b6d4; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🛡️ 2.4 Limites Especiais (*Cheque Especial, Banricompras, Crédito Minuto*)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Configure o limite de crédito rotativo contratado no seu banco para cada conta:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💰 <strong>Saldo Atual:</strong> O dinheiro real disponível em conta (ex: <code>R$ 350,00</code>).</li>
          <li>🛡️ <strong>Limite LIS / Cheque Especial:</strong> O limite concedido pelo banco (ex: <code>R$ 1.500,00</code>).</li>
          <li>⚡ <strong>Saldo Operacional Total:</strong> Exibido como <code>R$ 1.850,00</code> (Saldo + Cheque Especial). Se o saldo ficar negativo, o card alerta o uso do rotativo para evitar encargos bancários.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.1: CARTÕES > CICLO -->
    <div class="manual-topic-content" id="topic-cartao-ciclo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 3.1 Ciclo do Cartão: Fechamento vs Vencimento & Melhor Dia</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conceito Fundamental do Cartão de Crédito:</strong>
        </div>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔒 <strong>Dia de Fechamento (Corte):</strong> Data em que a operadora encerra a fatura do mês. Compras realizadas até esse dia entram no boleto atual.</li>
          <li>🛒 <strong>Melhor Dia de Compra:</strong> Compras feitas no dia seguinte ao fechamento entram automaticamente na fatura do mês posterior, proporcionando até 40 dias de prazo!</li>
          <li>📅 <strong>Dia de Vencimento:</strong> Data limite para pagamento da fatura sem juros.</li>
        </ul>
        <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 8px;">
          💡 <strong>Exemplo:</strong> Cartão com Fechamento dia 25 e Vencimento dia 05. Uma compra feita em 24/08 vence em 05/09. Uma compra feita em 26/08 vencerá apenas em 05/10!
        </div>
      </div>
    </div>

    <!-- CAPÍTULO 3.2: CARTÕES > LIMITE TOTAL VS COMPROMETIDO -->
    <div class="manual-topic-content" id="topic-cartao-limite" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📊 3.2 Limite Total vs Limite Comprometido em Tempo Real</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No quadro <strong>"🏦 Previsibilidade de Contas e Cartões"</strong> do Dashboard:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💳 <strong>Limite Total:</strong> Limite concedido pelo banco (ex: <code>R$ 5.000,00</code>).</li>
          <li>🔴 <strong>Fatura do Mês:</strong> Gastos que vencem na competência selecionada (ex: <code>R$ 1.200,00</code>).</li>
          <li>🟠 <strong>Comprometido Global:</strong> Soma de todas as faturas abertas e parcelas futuras a vencer (ex: <code>R$ 4.200,00</code>).</li>
          <li>🟢/🔴 <strong>Disponível / Excedido:</strong> Saldo livre em tempo real <code>(Limite - Comprometido)</code>. Se as parcelas ultrapassarem o limite, surge o alerta <span class="badge badge-danger">⚠️ LIMITE EXCEDIDO</span>.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.3: CARTÕES > PAGAMENTO INTEGRAL -->
    <div class="manual-topic-content" id="topic-cartao-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>💳 3.3 Pagamento Integral da Fatura (Baixa Atômica)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Para liquidar a fatura de cartão de crédito no final do ciclo:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>No card da fatura em <strong>🔄 Planejamento</strong>, clique no botão verde <code>💳 Pagar Fatura</code>.</li>
          <li>Selecione a <strong>Conta Bancária Pagadora</strong> (ex: <em>Conta Itaú</em>) e a data de pagamento.</li>
          <li>Confirme o valor total.</li>
        </ol>
        <p style="margin: 0;">O aplicativo debita o valor da conta bancária e <strong>marca todas as compras e parcelas atreladas àquela fatura como pagas em uma única transação segura</strong>.</p>
      </div>
    </div>

    <!-- CAPÍTULO 3.4: CARTÕES > PAGAMENTO PARCIAL & ROTATIVO -->
    <div class="manual-topic-content" id="topic-cartao-rotativo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 3.4 Pagamento Parcial & Saldo Rotativo Automático</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se a família não puder quitar o valor integral do boleto do cartão:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Ao clicar em <code>💳 Pagar Fatura</code>, informe o valor parcial que foi pago.</li>
          <li>O sistema dá baixa no montante pago e <strong>lança o saldo devedor restante na fatura do mês seguinte como Saldo Rotativo</strong>, aplicando automaticamente a taxa de juros cadastrada no cartão.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.5: CARTÕES > ANTECIPAÇÃO DE PARCELAS -->
    <div class="manual-topic-content" id="topic-cartao-antecipacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚡ 3.5 Antecipação de Parcelas com Desconto a Valor Presente (VP)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Aproveite descontos antecipando parcelas de compras longas com o cálculo exato de <strong>Valor Presente ($VP$)</strong>:</p>
        <div style="background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          $$VP = \frac{VF}{(1 + i)^n}$$
          Onde $VF$ é o valor nominal da parcela, $i$ é a taxa de desconto mensal e $n$ é a quantidade de meses antecipados.
        </div>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Na fatura ou na lista de despesas, abra a compra parcelada e selecione as parcelas futuras que deseja adiantar.</li>
          <li>Informe a taxa de desconto mensal oferecida pelo banco ou o valor total do desconto.</li>
          <li>O sistema antecipa os vencimentos para a fatura atual com o valor líquido abatido e libera o limite futuro do cartão imediatamente.</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 3.6: CARTÕES > RENEGOCIAÇÃO & ACORDO -->
    <div class="manual-topic-content" id="topic-cartao-acordo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🤝 3.6 Renegociação e Acordos de Fatura Parcelada</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se você precisou negociar a fatura com o banco gerando um parcelamento de acordo:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique em <code>🤝 Parcelar / Acordo</code> no card da fatura.</li>
          <li>Informe a entrada e o número de parcelas acordadas. A fatura original é marcada como <span class="badge badge-purple">Renegociada</span> e as novas parcelas são projetadas nos meses seguintes.</li>
          <li>Caso tenha realizado a operação por engano, utilize o botão <code>↩️ Desfazer Acordo / Reabrir</code> para restaurar o estado original da fatura.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 3.7: CARTÕES > ESTORNO EM 1 CLIQUE -->
    <div class="manual-topic-content" id="topic-cartao-estorno" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>↩️ 3.7 Estorno de Compras em 1 Clique</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se uma compra foi devolvida ou cancelada pelo estabelecimento comercial:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Abra o pop-up de detalhes do lançamento clicando sobre a linha da compra.</li>
          <li>Clique no botão de estorno. O valor é creditado de volta no limite do cartão e marcado com selo auditado de estorno.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.1: LANÇAMENTOS > DESPESAS & RECEITAS -->
    <div class="manual-topic-content" id="topic-lanc-despesas-receitas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📝 4.1 Lançamento de Despesas e Receitas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Para lançar receitas e despesas no dia a dia:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>+ Nova Receita:</strong> Salários, comissões, pró-labore, aluguéis recebidos, dividendos e transferências recebidas.</li>
          <li>🟣 <strong>+ Nova Variável:</strong> Gastos esporádicos do cotidiano (Supermercado, Farmácia, Combustível, Restaurante).</li>
          <li>⭐ <strong>Despesa Fixa Recorrente:</strong> Contas mensais que se repetem todo mês (Aluguel, Luz, Condomínio, Internet).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.2: LANÇAMENTOS > COMPETÊNCIA -->
    <div class="manual-topic-content" id="topic-lanc-competencia" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 4.2 Mês de Competência vs Data de Vencimento</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>O que é o Mês de Referência (Competência)?</strong>
        </div>
        <p style="margin-bottom: 10px;">A competência é o mês em que o consumo realmente aconteceu, enquanto a data de vencimento é quando o boleto deve ser pago:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>💡 <strong>Exemplo:</strong> Sua conta de energia de <strong>Fevereiro</strong> (Competência: <code>Ref: 02/2026</code>) que vence no dia <strong>10 de Março</strong> (Vencimento: <code>10/03/2026</code>).</li>
          <li>📊 O app permite computar o gasto no orçamento de Fevereiro, garantindo relatórios de consumo 100% fieis à realidade.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.3: LANÇAMENTOS > LEITOR DE NOTA FISCAL (QR CODE) -->
    <div class="manual-topic-content" id="topic-lanc-nfce-qr" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📷 4.3 Leitor de Nota Fiscal por Câmera & QR Code (NFC-e)</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Cadastro Instantâneo de Compras Sem Digitação Manual:</strong>
        </div>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique no botão <code>📷 Ler Nota Fiscal</code> no Dashboard, Planejamento ou formulário.</li>
          <li>Aponte a câmera do seu celular ou webcam para o QR Code quadrado impresso no final do seu cupom fiscal (NFC-e ou SAT).</li>
          <li>O aplicativo consulta a SEFAZ e preenche automaticamente o <strong>Valor Total (R$)</strong>, a <strong>Data</strong>, o <strong>Nome do Mercado/Farmácia</strong> e sugere a <strong>Categoria</strong>!</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 4.4: LANÇAMENTOS > ALERTA DE DUPLICADOS -->
    <div class="manual-topic-content" id="topic-lanc-duplicados" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔔 4.4 Identificação & Alerta Automático de Gastos Duplicados</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Enquanto você digita o valor, data e descrição de um lançamento, o motor inteligente verifica se já existe uma transação similar cadastrada:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>⚠️ Se houver similaridade, surge um banner amarelo no formulário informando a existência de lançamento parecido, prevenindo lançamentos repetidos por engano.</li>
          <li>Na barra lateral, o botão <code>🛡️</code> abre a <strong>Central de Conciliação</strong> para mesclar duplicidades com 1 clique.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 4.5: POP-UP DE DETALHES & 3 AÇÕES RÁPIDAS -->
    <div class="manual-topic-content" id="topic-lanc-popup-detalhes" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔍 4.5 Pop-up de Detalhes Completo & 3 Ações Rápidas</span>
        <span class="badge badge-blue">Recurso Novo</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Visão Executiva do Lançamento com 1 Toque:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao clicar ou tocar em qualquer linha de transação na tela de <strong>Planejamento</strong>, abre-se uma janela com todas as informações e 3 botões ergonômicos:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>📑 <strong>Ficha Completa:</strong> Descrição, categoria com ícone, titular responsável, conta/cartão pagador, vencimento e status.</li>
          <li>💰 <strong>Memória de Cálculo:</strong> Valor original, juros/multas acumulados, descontos obtidos e valor líquido final.</li>
          <li>🔴 <strong>[ 🗑️ Excluir Lançamento ]:</strong> Remove o lançamento com restauração automática do saldo bancário.</li>
          <li>🟡 <strong>[ ✏️ Editar Lançamento ]:</strong> Abre o formulário de edição para ajustar datas, valores ou categoria.</li>
          <li>🟢 <strong>[ 💳 Pagar / Baixar ]:</strong> Permite quitar a conta na hora escolhendo a data e conta pagadora (ou <code>↩️ Desfazer Pagamento</code> para reverter).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.1: JUROS & FERIADOS -->
    <div class="manual-topic-content" id="topic-juros-prorrogacao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📅 5.1 Prorrogação Automática para Dias Úteis & Feriados Nacionais</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(245,158,11,0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Conformidade com a Legislação Bancária Nacional (Febraban):</strong>
        </div>
        <p style="margin-bottom: 10px;">Contas cujo vencimento cai em sábados, domingos ou feriados nacionais (incluindo feriados móveis como Páscoa, Carnaval e Corpus Christi) são automaticamente prorrogadas para o <strong>próximo dia útil</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🏷️ O card da conta exibe o selo <code>📅 Prorroga: DD/MM</code> informando a data limite sem juros.</li>
          <li>Os juros por atraso só começam a ser calculados se o pagamento ocorrer após o dia útil prorrogado.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.2: JUROS > CÁLCULO -->
    <div class="manual-topic-content" id="topic-juros-calculo" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⚖️ 5.2 Cálculo de Juros Diários (% a.d.), Mensais (% a.m.) e Multas Fixas</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Você pode configurar parâmetros financeiros específicos para cada despesa fixa:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🔢 <strong>Multa Moratória (%):</strong> Percentual fixo cobrado pelo atraso (ex: <code>2,00%</code>).</li>
          <li>📈 <strong>Juros de Mora (% a.m. ou % a.d.):</strong> Taxa de juros mensal ou diária calculada proporcionalmente aos dias de atraso (pro-rata die).</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 5.3: JUROS > PROJEÇÃO -->
    <div class="manual-topic-content" id="topic-juros-projecao" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📈 5.3 Projeção do Valor Atualizado para Pagamento Hoje</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Ao consultar contas vencidas no Dashboard ou Planejamento, o sistema calcula e exibe em tempo real o <strong>Valor Atualizado para Pagamento Hoje</strong>, somando o valor original aos juros e multas acumulados até a data de hoje.</p>
      </div>
    </div>

    <!-- CAPÍTULO 5.4: JUROS > PAGAMENTO COM ACRÉSCIMO/DESCONTO -->
    <div class="manual-topic-content" id="topic-juros-pagamento" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🏷️ 5.4 Pagamento com Acréscimo ou Desconto</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">No modal de liquidação, você pode ajustar com total flexibilidade:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🟢 <strong>Desconto Obtido:</strong> Se você pagou antecipadamente ou via PIX com desconto, informe o abatimento para registrar o valor líquido real debitado da conta.</li>
          <li>🔴 <strong>Acréscimo Pago:</strong> Registre eventuais tarifas bancárias ou juros cobrados na quitação do boleto.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.1: PLANEJAMENTO > FIXAS & PARCELADAS -->
    <div class="manual-topic-content" id="topic-plan-fixas-parceladas" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🔄 6.1 Criando Despesas Fixas e Parcelamentos</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Na tela <strong>🔄 Planejamento</strong>, organize as contas recorrentes e compras em parcelas:</p>
        <ol style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>Clique em <code>⭐ + Nova Despesa Fixa</code>.</li>
          <li>Defina se a conta é <strong>Recorrente Contínua</strong> (sem fim previsto, ex: <em>Aluguel, Internet</em>) ou <strong>Parcelada</strong> (ex: <em>10x de R$ 150</em>).</li>
          <li>O sistema projeta cada parcela no mês correspondente com contagem automática (1/10, 2/10, etc.).</li>
        </ol>
      </div>
    </div>

    <!-- CAPÍTULO 6.2: PLANEJAMENTO > PRIORITÁRIAS -->
    <div class="manual-topic-content" id="topic-plan-prioritarias" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⭐ 6.2 Despesas Prioritárias ⭐</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Marque contas indispensáveis (Aluguel, Luz, Mensalidade Escolar) com a <strong>Estrela de Prioridade ⭐</strong>:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>As contas prioritárias ganham moldura dourada e aparecem no topo do quadro operacional do mês no Dashboard.</li>
          <li>Facilita para que você saiba exatamente o montante mínimo necessário para honrar compromissos vitais.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.3: PLANEJAMENTO > ADIAR PARCELA -->
    <div class="manual-topic-content" id="topic-plan-adiar" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>⏩ 6.3 Adiar Parcela para o Mês Seguinte</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Se o orçamento do mês atual estiver apertado e você combinou de postergar um pagamento:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>No card da despesa, clique na opção de adiar.</li>
          <li>A parcela é transferida para o mês seguinte sem afetar as demais parcelas futuras do parcelamento.</li>
        </ul>
      </div>
    </div>

    <!-- CAPÍTULO 6.4: PLANEJAMENTO > KANBAN DRAG & DROP -->
    <div class="manual-topic-content" id="topic-plan-kanban" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>📋 6.4 Kanban de Planejamento com Arrastar e Soltar</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <p style="margin-bottom: 10px;">Você pode reordenar a sequência de pagamento das contas no Planejamento simplesmente <strong>arrastando os cards</strong> para cima ou para baixo, organizando sua esteira financeira na ordem de pagamento desejada.</p>
      </div>
    </div>

    <!-- CAPÍTULO 6.5: CARDS DE DECISÃO DE RECORRÊNCIA -->
    <div class="manual-topic-content" id="topic-plan-decisao-cards" style="display: none;">
      <h4 style="margin: 0 0 14px 0; font-size: 16px; color: #a78bfa; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🎛️ 6.5 Cards de Decisão de Recorrência (*Apenas este mês vs Todos*)</span>
        <span class="badge badge-purple">Segurança Operacional</span>
      </h4>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
        <div style="background: rgba(167,139,250,0.08); border-left: 4px solid #a78bfa; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 14px;">
          <strong>Decisões Claras ao Editar ou Excluir Lançamentos Fixos:</strong>
        </div>
        <p style="margin-bottom: 10px;">Ao alterar o valor de uma despesa fixa ou cancelá-la, o sistema exibe dois cards visuais:</p>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 14px;">
          <li>🗓️ <strong>Opção 1 — Apenas este Mês:</strong> Ajusta unicamente a fatura/parcela da competência atual (ex: conta de água ou luz que varia todo mês). Na tela de edição, você pode clicar no botão <strong><code>📷 Escanear Fatura / QR Code / Pix</code></strong> para capturar com a câmera ou importar o PDF da fatura, preenchendo valor exato, vencimento e chave PIX em 1 segundo.</li>
          <li>♾️ <strong>Opção 2 — Este e Todos os Futuros:</strong> Propaga o novo valor para todos os meses seguintes (ex: aumento definitivo da mensalidade do plano de internet).</li>
        </ul>
      </div>
    </div>
  `;
}