/**
 * src/database/db.js
 * Ponto de entrada unificado da camada de dados SQLite do FamilyFinanças.
 * Modularizado em mixins de domínio limpos (< 1000 linhas cada).
 */

const { DbCore, getCardBillingCycle } = require('./db-core');
const withFamilyUsers = require('./db-family-users');
const withAccounts = require('./db-accounts');
const withRecurring = require('./db-recurring');
const withTransactions = require('./db-transactions');
const withCardInvoices = require('./db-card-invoices');
const withReports = require('./db-reports');
const withSyncDedup = require('./db-sync-dedup');

// Classe unificada composta via mixins
class AppDatabase extends withSyncDedup(
  withReports(
    withCardInvoices(
      withTransactions(
        withRecurring(
          withAccounts(
            withFamilyUsers(DbCore)
          )
        )
      )
    )
  )
) {}

module.exports = AppDatabase;
module.exports.AppDatabase = AppDatabase;
module.exports.getCardBillingCycle = getCardBillingCycle;
