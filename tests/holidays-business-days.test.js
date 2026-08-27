const { test, describe } = require('node:test');
const assert = require('node:assert');

// Testes diretos da lógica de feriados nacionais brasileiros
function getNationalHolidays(year) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const holidays = new Set([
    `${y}-01-01`, `${y}-04-21`, `${y}-05-01`, `${y}-09-07`,
    `${y}-10-12`, `${y}-11-02`, `${y}-11-15`, `${y}-11-20`, `${y}-12-25`,
  ]);

  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(y, month - 1, day);
  const carnaval = new Date(easter.getTime() - 47 * 86400000);
  const goodFriday = new Date(easter.getTime() - 2 * 86400000);
  const corpusChristi = new Date(easter.getTime() + 60 * 86400000);

  const formatIso = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  
  holidays.add(formatIso(carnaval));
  holidays.add(formatIso(goodFriday));
  holidays.add(formatIso(corpusChristi));

  return holidays;
}

function isBusinessDay(dateStr) {
  if (!dateStr) return true;
  const clean = dateStr.split(' ')[0];
  const parts = clean.split('-');
  const y = parseInt(parts[0], 10);
  const d = new Date(clean + 'T12:00:00');
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  const holidays = getNationalHolidays(y);
  return !holidays.has(clean);
}

function getNextBusinessDay(dateStr) {
  if (!dateStr) return dateStr;
  const clean = dateStr.split(' ')[0];
  let d = new Date(clean + 'T12:00:00');
  let currentIso = clean;
  while (!isBusinessDay(currentIso)) {
    d = new Date(d.getTime() + 86400000);
    currentIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return currentIso;
}

describe('Testes de Feriados Nacionais e Prorrogação de Dias Úteis (Fase 5 do Checklist)', () => {

  test('Deve identificar sábados e domingos como não úteis', () => {
    // 22/08/2026 é Sábado, 23/08/2026 é Domingo
    assert.strictEqual(isBusinessDay('2026-08-22'), false);
    assert.strictEqual(isBusinessDay('2026-08-23'), false);
    // 24/08/2026 é Segunda-feira (dia útil)
    assert.strictEqual(isBusinessDay('2026-08-24'), true);
  });

  test('Deve prorrogar vencimento de sábado para a segunda-feira subsequente', () => {
    const next = getNextBusinessDay('2026-08-22');
    assert.strictEqual(next, '2026-08-24');
  });

  test('Deve identificar feriados nacionais fixos (ex: Natal 25/12 e Tiradentes 21/04)', () => {
    assert.strictEqual(isBusinessDay('2026-12-25'), false);
    assert.strictEqual(isBusinessDay('2026-04-21'), false);
    assert.strictEqual(isBusinessDay('2026-11-20'), false); // Consciência Negra
  });

  test('Deve calcular corretamente feriados móveis (Páscoa / Sexta-feira Santa / Corpus Christi 2026)', () => {
    // Em 2026, Sexta-feira Santa é 03/04/2026 e Corpus Christi é 04/06/2026
    assert.strictEqual(isBusinessDay('2026-04-03'), false);
    assert.strictEqual(isBusinessDay('2026-06-04'), false);
  });

  test('Se o feriado for na sexta-feira, deve prorrogar para a próxima segunda-feira', () => {
    // 03/04/2026 é Sexta-feira Santa -> Próximo dia útil é 06/04/2026 (Segunda-feira)
    const next = getNextBusinessDay('2026-04-03');
    assert.strictEqual(next, '2026-04-06');
  });

});
