/* === dashboard-main-1b.js (parte 2/2 de dashboard-main-1.js) ===
 * Linhas 808–1043
 */

function setupCategoryInteractiveChart(wrapperElementId, chartStateKey, txs) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;

  const prefix = chartStateKey;
  const filterMetricId = `${prefix}-metric-type`;
  const filterPaymentId = `${prefix}-payment-status`;
  const filterTxTypeId = `${prefix}-tx-type`;
  const filterChartTypeId = `${prefix}-chart-type`;
  const filterCheckboxesId = `${prefix}-categories-checkboxes`;
  const chartCanvasId = `${prefix}-canvas`;
  const listContainerId = `${prefix}-list`;
  const chartContainerId = `${prefix}-chart-container`;

  wrapper.innerHTML = `
    <div class="chart-filters-container" style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Métrica</label>
          <select id="${filterMetricId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="amount" selected>💰 Valor (R$)</option>
            <option value="count">🔄 Repetições</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Pagamento</label>
          <select id="${filterPaymentId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="all" selected>👁️ Todas</option>
            <option value="paid">✅ Pagas</option>
            <option value="pending">⏳ Pendentes</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Fluxo</label>
          <select id="${filterTxTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="expense" selected>Saídas</option>
            <option value="income">Entradas</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 110px;">
          <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block; font-weight:600;">Tipo de Gráfico</label>
          <select id="${filterChartTypeId}" style="padding: 4px 8px; font-size: 11px; width: 100%; height: 28px;">
            <option value="doughnut" selected>🍩 Rosca</option>
            <option value="horizontalBar">📊 Barras Lat.</option>
            <option value="polarArea">❄️ Área Polar</option>
          </select>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 8px;">
        <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; display: block; font-weight:600;">Exibir Categorias</label>
        <div id="${filterCheckboxesId}" style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 55px; overflow-y: auto; padding-right: 4px;">
          <!-- Checkboxes dinâmicos -->
        </div>
      </div>
    </div>

    <div class="interactive-chart-layout">
      <div id="${chartContainerId}" style="position: relative; width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <canvas id="${chartCanvasId}" style="max-height: 220px; max-width: 100%;"></canvas>
      </div>
      <div id="${listContainerId}" style="max-height: 220px; overflow-y: auto; padding-right: 4px;">
        <!-- Lista consolidada -->
      </div>
    </div>
  `;

  function renderCheckboxesAndDraw() {
    const txType = document.getElementById(filterTxTypeId).value;
    const uniqueCats = [];
    txs.filter(t => t.type === txType).forEach(t => {
      const name = t.category_name || 'Sem Categoria';
      if (!uniqueCats.find(c => c.name === name)) {
        uniqueCats.push({ name, icon: t.category_icon || '📋' });
      }
    });

    const cbContainer = document.getElementById(filterCheckboxesId);
    const prevChecked = cbContainer.dataset.checkedCats ? JSON.parse(cbContainer.dataset.checkedCats) : null;

    cbContainer.innerHTML = uniqueCats.map(c => {
      const isChecked = prevChecked ? prevChecked.includes(c.name) : true;
      return `
        <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer; user-select: none; background: rgba(255,255,255,0.03); padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px;">
          <input type="checkbox" class="${prefix}-cat-check" value="${c.name}" ${isChecked ? 'checked' : ''} style="margin: 0; cursor: pointer;">
          <span>${c.icon} ${c.name}</span>
        </label>
      `;
    }).join('');

    function updateChart() {
      const activeTxType = document.getElementById(filterTxTypeId).value;
      const activePaymentStatus = document.getElementById(filterPaymentId).value;
      const activeMetricType = document.getElementById(filterMetricId).value;
      const activeChartType = document.getElementById(filterChartTypeId).value;

      const checkedBoxes = Array.from(document.querySelectorAll(`.${prefix}-cat-check:checked`)).map(cb => cb.value);
      const allBoxes = Array.from(document.querySelectorAll(`.${prefix}-cat-check`)).map(cb => cb.value);
      cbContainer.dataset.checkedCats = JSON.stringify(checkedBoxes);

      let filtered = txs.filter(t => t.type === activeTxType);

      if (activePaymentStatus === 'paid') {
        filtered = filtered.filter(t => t.is_paid === 1);
      } else if (activePaymentStatus === 'pending') {
        filtered = filtered.filter(t => t.is_paid === 0);
      }

      if (checkedBoxes.length > 0) {
        filtered = filtered.filter(t => checkedBoxes.includes(t.category_name || 'Sem Categoria'));
      } else if (allBoxes.length > 0) {
        filtered = [];
      }

      const agg = {};
      filtered.forEach(t => {
        const key = t.category_name || 'Sem Categoria';
        if (!agg[key]) {
          agg[key] = {
            name: key,
            icon: t.category_icon || '📋',
            color: t.category_color || '#64748b',
            total: 0,
            count: 0
          };
        }
        agg[key].total += t.amount;
        agg[key].count += 1;
      });

      const dataList = Object.values(agg).sort((a, b) => b.total - a.total);

      const listContainer = document.getElementById(listContainerId);
      if (dataList.length === 0) {
        listContainer.innerHTML = '<div style="color:var(--text-muted); font-size: 11px; padding: 10px; text-align: center;">Nenhum lançamento.</div>';
      } else {
        listContainer.innerHTML = dataList.map(c => `
          <div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--border)">
            <div style="width:8px;height:8px;border-radius:50%;background:${c.color}"></div>
            <div style="flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${c.name}">${c.icon} ${c.name}</div>
            <div style="font-weight:700;font-size:11px;color:${activeTxType === 'expense' ? '#f87171' : 'var(--accent-light)'}">
              ${activeMetricType === 'amount' ? fmt.currency(c.total) : `${c.count}x`}
            </div>
          </div>
        `).join('');
      }

      if (State.charts[chartStateKey]) {
        State.charts[chartStateKey].destroy();
        State.charts[chartStateKey] = null;
      }

      const chartContainer = document.getElementById(chartContainerId);
      if (dataList.length === 0) {
        chartContainer.innerHTML = '<div style="color:var(--text-muted); font-size: 12px;">Sem dados</div>';
      } else {
        chartContainer.innerHTML = `<canvas id="${chartCanvasId}" style="max-height: 220px; max-width: 100%;"></canvas>`;
        
        let type = 'doughnut';
        let chartData = {
          labels: dataList.map(c => `${c.icon} ${c.name}`),
          datasets: [{
            data: dataList.map(c => activeMetricType === 'amount' ? c.total : c.count),
            backgroundColor: dataList.map(c => c.color),
            borderWidth: 2,
            borderColor: '#111520'
          }]
        };

        let options = {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { 
              display: activeChartType !== 'horizontalBar', 
              position: 'bottom', 
              labels: { color: '#94a3b8', font: { size: 10 }, padding: 6, boxWidth: 8 } 
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw;
                  return activeMetricType === 'amount' ? ' ' + fmt.currency(val) : ` ${val} lançamento(s)`;
                }
              },
              backgroundColor: '#1e2535', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
              titleColor: '#f1f5f9', bodyColor: '#94a3b8'
            }
          }
        };

        if (activeChartType === 'polarArea') {
          type = 'polarArea';
          options.scales = {
            r: {
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { display: false }
            }
          };
        } else if (activeChartType === 'horizontalBar') {
          type = 'bar';
          options.indexAxis = 'y';
          options.scales = {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
          };
          options.plugins.legend.display = false;
        } else {
          options.cutout = '60%';
        }

        State.charts[chartStateKey] = new Chart(document.getElementById(chartCanvasId), {
          type,
          data: chartData,
          options
        });
      }
    }

    document.querySelectorAll(`.${prefix}-cat-check`).forEach(cb => {
      cb.onchange = updateChart;
    });

    updateChart();
  }

  document.getElementById(filterTxTypeId).onchange = () => {
    document.getElementById(filterCheckboxesId).dataset.checkedCats = '';
    renderCheckboxesAndDraw();
  };
  document.getElementById(filterPaymentId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterMetricId).onchange = renderCheckboxesAndDraw;
  document.getElementById(filterChartTypeId).onchange = renderCheckboxesAndDraw;

  renderCheckboxesAndDraw();
}
