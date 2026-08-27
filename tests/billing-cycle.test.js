const { test, describe } = require('node:test');
const assert = require('node:assert');
const { getCardBillingCycle } = require('../src/database/db-core');

describe('Testes de Ciclo de Fatura e Fechamento de Cartão de Crédito', () => {

  test('Deve calcular ciclo normal (fechamento dia 5, vencimento dia 15)', () => {
    // Para a fatura de Agosto/2026 com fechamento dia 5:
    // Ciclo vai de 06/07/2026 a 05/08/2026
    const cycle = getCardBillingCycle(5, 15, 8, 2026);
    assert.strictEqual(cycle.start, '2026-07-06');
    assert.strictEqual(cycle.end, '2026-08-05');
  });

  test('Deve tratar virada de ano corretamente (fatura de Janeiro)', () => {
    // Para a fatura de Janeiro/2027 com fechamento dia 10:
    // Ciclo vai de 11/12/2026 a 10/01/2027
    const cycle = getCardBillingCycle(10, 20, 1, 2027);
    assert.strictEqual(cycle.start, '2026-12-11');
    assert.strictEqual(cycle.end, '2027-01-10');
  });

  test('Deve aplicar fallbacks seguros caso closing_day ou due_day não sejam informados', () => {
    const cycle = getCardBillingCycle(null, null, 5, 2026);
    assert.ok(cycle.start);
    assert.ok(cycle.end);
    assert.ok(cycle.start.startsWith('2026-04-'));
    assert.ok(cycle.end.startsWith('2026-05-'));
  });

});
