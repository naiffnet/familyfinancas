export const state = {
  currentUser: null,
  activeTab: 'dashboard',
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  accounts: [],
  categories: [],
  recurringItems: [],
  transactions: [],

  setUser(user) {
    this.currentUser = user;
  },

  setPeriod(month, year) {
    this.selectedMonth = parseInt(month);
    this.selectedYear = parseInt(year);
  },

  setActiveTab(tab) {
    this.activeTab = tab;
  }
};
