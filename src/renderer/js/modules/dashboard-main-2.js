/* ===
 * dashboard-main-2.js — Parte 2 de dashboard-main
 * Linhas 1757–1800 do app.js
 */

function chartOptions(type) {
  const base = {
    responsive: true, maintainAspectRatio: true,
    layout: {
      padding: {
        left: (type === 'bar' || type === 'line') ? 60 : 20,
        right: 15,
        top: 10,
        bottom: 5
      }
    },
    plugins: {
      legend: { display: type === 'doughnut' || type === 'line', position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10, boxWidth: 12 } },
      tooltip: {
        callbacks: { label: (ctx) => ' ' + fmt.currency(ctx.raw) },
        backgroundColor: '#1e2535', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#f1f5f9', bodyColor: '#94a3b8',
      }
    }
  };
  if (type === 'bar' || type === 'line') {
    base.scales = {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { 
        grid: { color: 'rgba(255,255,255,0.04)' }, 
        ticks: { 
          color: '#64748b', 
          font: { size: 11 }, 
          callback: (v) => {
            if (v === 0) return 'R$ 0';
            const isNegative = v < 0;
            const absVal = Math.abs(v);
            const formattedVal = absVal >= 1000 ? (absVal / 1000).toFixed(0) + 'k' : absVal.toFixed(0);
            return isNegative ? `-R$ ${formattedVal}` : `R$ ${formattedVal}`;
          } 
        } 
      }
    };
  }
  return base;
}

// ════════════════════════════════════════
// RECORRÊNCIAS