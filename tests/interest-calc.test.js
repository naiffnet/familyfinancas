const { test, describe } = require('node:test');
const assert = require('node:assert');

// Extraído da lógica pura de state-constants.js para testes unitários
function calculateProjectedInterest(baseAmount, dueDateStr, targetDateStr, rule = {}) {
  const base = parseFloat(baseAmount) || 0;
  if (base <= 0 || !dueDateStr) return { baseAmount: base, projectedInterest: 0, projectedTotal: base, daysLate: 0, isLate: false };

  const due = new Date(dueDateStr + 'T00:00:00');
  const target = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();
  
  const diffTime = target.getTime() - due.getTime();
  const daysLate = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  if (daysLate === 0) {
    return { baseAmount: base, projectedInterest: 0, projectedTotal: base, daysLate: 0, isLate: false };
  }

  const rate = parseFloat(rule.interest_rate) || 0;
  const type = rule.interest_type || 'daily';
  const penalty = parseFloat(rule.penalty_fixed_rate) || 0;

  let interestAmount = 0;

  if (type === 'daily') {
    interestAmount = base * (rate / 100) * daysLate;
  } else if (type === 'monthly') {
    interestAmount = base * (rate / 100) * (daysLate / 30);
  } else if (type === 'yearly') {
    interestAmount = base * (rate / 100) * (daysLate / 365);
  } else if (type === 'fixed_installment' || type === 'fixed_contract') {
    interestAmount = base * (rate / 100);
  }

  const penaltyAmount = base * (penalty / 100);
  const totalCharges = Math.round((interestAmount + penaltyAmount) * 100) / 100;
  const projectedTotal = Math.round((base + totalCharges) * 100) / 100;

  return {
    baseAmount: base,
    projectedInterest: totalCharges,
    projectedTotal: projectedTotal,
    daysLate: daysLate,
    isLate: true
  };
}

function calculateDailyRatePct(baseAmount, paidAmount, daysLate) {
  const base = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const days = parseInt(daysLate, 10) || 0;
  if (base <= 0 || days <= 0 || paid <= base) return 0;
  return ((paid - base) / base / days) * 100;
}

describe('Testes de Cálculos de Juros, Multas e Encargos Financeiros', () => {

  test('Deve retornar 0 juros se a conta não estiver em atraso (pagamento em dia)', () => {
    const res = calculateProjectedInterest(1000, '2026-08-10', '2026-08-10', { interest_rate: 1, interest_type: 'daily' });
    assert.strictEqual(res.daysLate, 0);
    assert.strictEqual(res.isLate, false);
    assert.strictEqual(res.projectedInterest, 0);
    assert.strictEqual(res.projectedTotal, 1000);
  });

  test('Deve calcular corretamente juros ao dia (% a.d.)', () => {
    // R$ 1.000,00 com 1% ao dia e 10 dias de atraso -> R$ 100,00 de juros
    const res = calculateProjectedInterest(1000, '2026-08-01', '2026-08-11', { interest_rate: 1, interest_type: 'daily' });
    assert.strictEqual(res.daysLate, 10);
    assert.strictEqual(res.isLate, true);
    assert.strictEqual(res.projectedInterest, 100);
    assert.strictEqual(res.projectedTotal, 1100);
  });

  test('Deve calcular juros mensais pro-rata die (% ao mês)', () => {
    // R$ 1.000,00 com 3% ao mês e 15 dias de atraso -> (3% * 15/30) = 1.5% = R$ 15,00
    const res = calculateProjectedInterest(1000, '2026-08-01', '2026-08-16', { interest_rate: 3, interest_type: 'monthly' });
    assert.strictEqual(res.daysLate, 15);
    assert.strictEqual(res.projectedInterest, 15);
    assert.strictEqual(res.projectedTotal, 1015);
  });

  test('Deve somar multa moratória fixa (%) ao valor dos juros', () => {
    // R$ 1.000,00 com 0.1% a.d. (10 dias = R$ 10,00) + 2% de multa fixa (R$ 20,00) -> R$ 30,00 de encargos
    const res = calculateProjectedInterest(1000, '2026-08-01', '2026-08-11', {
      interest_rate: 0.1,
      interest_type: 'daily',
      penalty_fixed_rate: 2
    });
    assert.strictEqual(res.projectedInterest, 30);
    assert.strictEqual(res.projectedTotal, 1030);
  });

  test('Deve calcular com precisão a taxa diária efetiva (% a.d.) na liquidação', () => {
    // Base: R$ 200,00, Pago: R$ 220,00 (Juros R$ 20,00 = 10%), 5 dias de atraso -> 2.000% ao dia
    const dailyRate = calculateDailyRatePct(200, 220, 5);
    assert.strictEqual(dailyRate, 2);
  });

  test('Deve tratar com segurança valores nulos ou inválidos sem quebrar', () => {
    const res = calculateProjectedInterest(null, null, null, null);
    assert.strictEqual(res.projectedInterest, 0);
    assert.strictEqual(res.projectedTotal, 0);
  });

});
