/**
 * GLOBAL APPLICATION STATE
 * Estado centralizado do aplicativo Financeiro Familiar.
 */

export const State = {
  user: null,
  currentPage: 'dashboard',
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  settings: { alert_days_before: 3 },
  charts: {},
  activeDashTab: 'mensal',
  budgetUserId: null,
  currentSort: 'manual',
  highlightCardId: null,
  highlightCardColor: null,
  highlightCardName: null,
  highlightInvoiceId: null,
  highlightAccountId: null,
  highlightAccountColor: null,
  highlightAccountName: null,
  familyName: null,
  permissions: null,
};

// Event emitter simples para estado reativo
const listeners = new Set();

export function subscribeState(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notifyStateChange(prop, val) {
  listeners.forEach(fn => fn(prop, val, State));
}

export default State;
