/**
 * FORMATTERS UTILITY
 * Funções universais de formatação de moedas BRL, datas, horários e meses.
 */

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const fmt = {
  currency: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0),
  date: (d) => {
    if (!d) return '';
    const dateStr = d.includes(' ') ? d.split(' ')[0] : (d.includes('T') ? d.split('T')[0] : d);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parsed = new Date(dateStr + 'T12:00:00');
    return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('pt-BR');
  },
  monthYear: (m, y) => new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  time: (d) => {
    if (!d) return '';
    const isoString = d.includes(' ') ? d.replace(' ', 'T') : d;
    const dateObj = new Date(isoString);
    return isNaN(dateObj.getTime()) ? d : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },
  percent: (v) => `${(Number(v) || 0).toFixed(1)}%`
};

export default fmt;
