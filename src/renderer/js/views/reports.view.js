/**
 * REPORTS VIEW MODULE
 * Relatórios financeiros: Fluxo de Caixa, Análise por Categoria e Evolução Patrimonial.
 */

import { State } from '../core/state.js';
import { fmt } from '../utils/formatters.js';
import { escapeHtml } from '../utils/sanitizer.js';

export async function renderReports(buildPeriodSelector, setupCategoryInteractiveChart, chartOptions) {
  const page = document.getElementById('page-reports');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Relatórios</h2></div><div id="report-period"></div></div>
    <div class="report-tabs">
      <button class="report-tab active" data-tab="cashflow">Fluxo de Caixa</button>
      <button class="report-tab" data-tab="categories">Por Categoria</button>
      <button class="report-tab" data-tab="patrimony">Patrimônio</button>
    </div>
    <div id="report-content"></div>`;

  let currentTab = 'cashflow';

  if (typeof buildPeriodSelector === 'function') {
    const periodContainer = document.getElementById('report-period');
    if (periodContainer) periodContainer.appendChild(buildPeriodSelector(() => loadTab(currentTab)));
  }

  document.querySelectorAll('.report-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.report-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      loadTab(currentTab);
    };
  });

  async function loadTab(tab) {
    const content = document.getElementById('report-content');
    if (!content) return;

    if (tab === 'cashflow') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #10b981; border-radius: var(--radius-sm);">
          💡 <strong>Fluxo de Caixa:</strong> Este relatório apresenta a listagem completa de todas as receitas e despesas realizadas na competência selecionada, junto com o balanço consolidado do período. É a ferramenta ideal para você auditar a entrada e saída de recursos e verificar o saldo líquido exato de cada lançamento.
        </p>
        <div style="display:flex;gap:16px;margin-bottom:20px">
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Receitas</div><div style="font-size:20px;font-weight:800;color:var(--accent-light)">${fmt.currency(inc)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Despesas</div><div style="font-size:20px;font-weight:800;color:#f87171">${fmt.currency(exp)}</div></div>
          <div class="card" style="flex:1;text-align:center"><div style="color:var(--text-muted);font-size:12px;margin-bottom:6px">Saldo</div><div style="font-size:20px;font-weight:800;color:${inc-exp>=0?'var(--accent-light)':'#f87171'}">${fmt.currency(inc-exp)}</div></div>
        </div>
        <div class="card"><div class="table-wrapper"><table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Tipo</th><th class="text-right">Valor</th></tr></thead>
          <tbody>${txs.length === 0 ? '<tr><td colspan="6" class="no-data">Sem lançamentos</td></tr>' :
            txs.map(t => `<tr>
              <td style="color:var(--text-muted)">${fmt.date(t.date)}</td>
              <td>${escapeHtml(t.description || '—')}</td>
              <td>${t.category_icon || ''} ${escapeHtml(t.category_name || '—')}</td>
              <td>${escapeHtml(t.account_name || '—')}</td>
              <td><span class="badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
              <td class="text-right" style="font-weight:600;color:${t.type === 'income' ? 'var(--accent-light)' : '#f87171'}">${t.type === 'income' ? '+' : '-'}${fmt.currency(t.amount)}</td>
            </tr>`).join('')}
          </tbody></table></div></div>`;
    } else if (tab === 'categories') {
      const txs = await window.api.reports.getCashflow({ userId: State.user.id, month: State.currentMonth, year: State.currentYear });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #f59e0b; border-radius: var(--radius-sm);">
          💡 <strong>Por Categoria:</strong> Analise as distribuições percentuais de despesas e receitas por área de custo, personalizando métricas, filtros de pagamento e modos de exibição gráfica.
        </p>
        <div class="card" id="categories-report-interactive-wrapper"></div>
      `;
      if (typeof setupCategoryInteractiveChart === 'function') {
        setupCategoryInteractiveChart('categories-report-interactive-wrapper', 'repCat', txs);
      }
    } else {
      const data = await window.api.reports.getPatrimony({ userId: State.user.id });
      content.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-left: 3px solid #3b82f6; border-radius: var(--radius-sm);">
          💡 <strong>Evolução Patrimonial:</strong> Este gráfico de linha apresenta a evolução acumulada e progressiva do seu patrimônio (saldos somados de todas as suas contas bancárias líquidas, poupanças e caixas de dinheiro) nos últimos 12 meses. O objetivo é visualizar e acompanhar o crescimento saudável e progressivo do seu patrimônio como um todo.
        </p>
        <div class="chart-card" style="height:320px"><canvas id="chart-patrimony"></canvas></div>`;
      if (State.charts.patrimony) State.charts.patrimony.destroy();
      const vals = data.map(d => d.net);
      if (window.Chart && document.getElementById('chart-patrimony')) {
        State.charts.patrimony = new window.Chart(document.getElementById('chart-patrimony'), {
          type: 'line',
          data: {
            labels: data.map(d => d.month),
            datasets: [{
              label: 'Patrimônio',
              data: vals,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#10b981',
              pointRadius: 4
            }]
          },
          options: typeof chartOptions === 'function' ? chartOptions('bar') : {}
        });
      }
    }
  }
  await loadTab('cashflow');
}

export default { renderReports };
