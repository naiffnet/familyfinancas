/**
 * FINANCIAL MATH UTILITY
 * Motor de cálculos financeiros: Fórmulas de juros, multas, descontos, CET, IOF e simulações.
 * Suporta ES Modules e CommonJS para testes unitários.
 */

function calculateBillingCycle(closingDay, dueDay, month, year) {
  let cDay = parseInt(closingDay);
  let dDay = parseInt(dueDay) || 10;
  
  if (isNaN(cDay) || cDay <= 0) {
    cDay = dDay - 10;
    if (cDay <= 0) cDay = 30 + cDay;
  }

  const endYear = year;
  const endMonth = month;
  const endDay = cDay;

  let startYear = year;
  let startMonth = month - 1;
  if (startMonth === 0) {
    startMonth = 12;
    startYear--;
  }
  const startDay = cDay + 1;

  const format = (y, m, d) => {
    let maxDays = new Date(y, m, 0).getDate();
    let fd = Math.min(d, maxDays);
    return `${y}-${String(m).padStart(2, '0')}-${String(fd).padStart(2, '0')}`;
  };

  return {
    start: format(startYear, startMonth, startDay),
    end: format(endYear, endMonth, endDay)
  };
}

function calculateInstallmentBreakdown(totalAmount, numInstallments, interestRateMonthly = 0) {
  const n = Math.max(1, parseInt(numInstallments) || 1);
  const p = Math.max(0, Number(totalAmount) || 0);

  if (interestRateMonthly <= 0) {
    const installmentValue = Math.round((p / n) * 100) / 100;
    return {
      total: p,
      installmentValue,
      totalInterest: 0,
      monthlyRate: 0,
      installments: Array.from({ length: n }, (_, i) => ({
        number: i + 1,
        value: installmentValue
      }))
    };
  }

  // Tabela Price (Juros Compostos)
  const i = interestRateMonthly / 100;
  const pmt = p * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  const totalWithInterest = pmt * n;

  return {
    total: Math.round(totalWithInterest * 100) / 100,
    installmentValue: Math.round(pmt * 100) / 100,
    totalInterest: Math.round((totalWithInterest - p) * 100) / 100,
    monthlyRate: interestRateMonthly,
    installments: Array.from({ length: n }, (_, idx) => ({
      number: idx + 1,
      value: Math.round(pmt * 100) / 100
    }))
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateBillingCycle,
    calculateInstallmentBreakdown
  };
}
