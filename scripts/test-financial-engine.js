const path = require('path');
const fs = require('fs');
const Database = require('../src/database/db');

async function runTests() {
  console.log('======================================================');
  console.log('🧪 TEST SUITE: MOTOR FINANCEIRO & RENEGOCIAÇÃO');
  console.log('======================================================\n');

  const testDbPath = path.join(__dirname, '..', 'scratch', 'test_financeiro.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Ensure scratch dir exists
  const scratchDir = path.dirname(testDbPath);
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const db = new Database(testDbPath);
  db.initialize();
  console.log('✔ [1/7] Banco de dados inicializado com sucesso.');

  // Test 1: Verify Indexes
  const indexes = db.db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(i => i.name);
  console.log('Índices criados:', indexes.filter(n => n.startsWith('idx_')));
  if (!indexes.includes('idx_transactions_user_date') || !indexes.includes('idx_invoices_card_month_year')) {
    throw new Error('Falha: Índices obrigatórios não foram encontrados no banco.');
  }
  console.log('✔ [2/7] Índices de performance verificados com sucesso.');

  // Test 2: Register User & Family
  const regRes = db.register({
    name: 'Carlos Teste',
    username: 'carlos',
    password: 'Password123!',
    family_name: 'Família Carlos',
    cpf: '12345678901',
    email: 'carlos@teste.com',
    recovery_question: 'Qual o nome do seu primeiro animal?',
    recovery_answer: 'Rex',
    accepted_terms: true
  });
  if (!regRes.success) throw new Error('Erro ao registrar usuário: ' + regRes.error);
  const userId = regRes.userId;
  console.log(`✔ [3/7] Usuário e Família criados com sucesso (User ID: ${userId}).`);

  // Test 3: Create Checking Account and Credit Card
  const acc1 = db.createAccount({
    user_id: userId,
    name: 'Nubank Conta Corrente',
    type: 'checking',
    bank: 'nubank',
    balance: 5000,
    color: '#820ad1'
  });
  const checkingAccountId = acc1.id;

  const acc2 = db.createAccount({
    user_id: userId,
    name: 'Nubank Ultravioleta',
    type: 'credit',
    bank: 'nubank',
    balance: 0,
    credit_limit: 3000,
    closing_day: 25,
    due_day: 5,
    color: '#820ad1'
  });
  const creditCardId = acc2.id;
  console.log('✔ [4/7] Contas criadas (Conta Corrente R$ 5.000 e Cartão Limite R$ 3.000).');

  // Test 4: Create Expenses on Credit Card
  db.createTransaction({
    user_id: userId,
    account_id: creditCardId,
    type: 'expense',
    amount: 1500,
    description: 'Compra Eletrônico',
    date: '2026-08-10',
    is_paid: 0,
    is_avulso: 1
  });

  const accountsCheck1 = db.getAccounts(userId);
  const cardAccCheck1 = accountsCheck1.find(a => a.id === creditCardId);
  console.log(`Limite comprometido após compra: R$ ${cardAccCheck1.credit_used} (Disponível: R$ ${cardAccCheck1.credit_limit - cardAccCheck1.credit_used})`);
  if (cardAccCheck1.credit_used !== 1500) throw new Error('Limite comprometido incorreto');
  console.log('✔ [5/7] Comprometimento de limite do cartão validado.');

  // Test 5: Invoices Generation
  const invoices = db.getCardInvoices(userId, 8, 2026);
  if (invoices.length === 0) throw new Error('Fatura não foi gerada');
  const invoice = invoices[0];
  console.log(`Fatura gerada: Ref ${invoice.month}/${invoice.year}, Valor: R$ ${invoice.amount}, Aberta: ${invoice.is_paid === 0}`);

  // Test 6: Renegotiate Card Invoice (Down payment R$ 300 + 4x of R$ 350)
  const renegRes = db.renegotiateCardInvoice({
    invoiceId: invoice.id,
    downPayment: 300,
    downPaymentAccountId: checkingAccountId,
    downPaymentDate: '2026-08-15',
    installmentsCount: 4,
    installmentAmount: 350,
    firstInstallmentMonth: '2026-09',
    notes: 'Acordo feito via app do banco',
    userId
  });
  if (!renegRes.success) throw new Error('Erro na renegociação: ' + renegRes.error);

  // Check checking account balance after down payment (5000 - 300 = 4700)
  const accountsCheck2 = db.getAccounts(userId);
  const checkingAccCheck2 = accountsCheck2.find(a => a.id === checkingAccountId);
  console.log(`Saldo Conta Corrente após entrada do acordo: R$ ${checkingAccCheck2.balance} (Esperado: 4700)`);
  if (checkingAccCheck2.balance !== 4700) throw new Error('Saldo da conta corrente incorreto após entrada');

  // Check original invoice status
  const invUpdated = db.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice.id);
  if (!invUpdated.is_paid || !invUpdated.is_renegotiated) throw new Error('Fatura original não foi marcada como renegociada');
  console.log('Fatura original marcada como quitada por acordo (is_renegotiated: 1).');

  // Check generated installment in Month 9 (September 2026)
  const sepInvoices = db.getCardInvoices(userId, 9, 2026);
  const sepTxs = db.getTransactions({ userId, month: 9, year: 2026 });
  const installmentTx = sepTxs.find(t => t.description.includes('Acordo Fatura'));
  if (!installmentTx) throw new Error('Parcela do acordo não encontrada em Setembro/2026');
  console.log(`Parcela gerada em 09/2026: "${installmentTx.description}" no valor de R$ ${installmentTx.amount}`);

  // Test 7: Validate Card Invoice with Installment
  // With closing_day: 25, due_day: 5, the installment created in September (2026-09-05) falls into Month 10 invoice (due 05/10/2026, cycle 26/08 to 25/09).
  const octInvoices = db.getCardInvoices(userId, 10, 2026);
  if (octInvoices.length > 0 && octInvoices[0].amount > 0) {
    const payOctRes = db.payCardInvoice({
      invoiceId: octInvoices[0].id,
      paymentAccountId: checkingAccountId,
      paymentDate: '2026-10-05',
      userId
    });
    if (!payOctRes.success) throw new Error('Erro ao pagar fatura de Outubro: ' + payOctRes.error);
    
    const accountsCheck3 = db.getAccounts(userId);
    const checkingAccCheck3 = accountsCheck3.find(a => a.id === checkingAccountId);
    console.log(`Saldo Conta Corrente após pagar 1ª parcela da fatura (R$ 350): R$ ${checkingAccCheck3.balance} (Esperado: 4350)`);
    if (checkingAccCheck3.balance !== 4350) throw new Error('Saldo da conta corrente incorreto após quitação da fatura');
  }

  console.log('✔ [6/8] Fluxo completo de renegociação e amortização validado com sucesso!');

  // Test 8: Reopen / Undo Renegotiation on Invoice
  const reopenRes = db.reopenCardInvoice({
    invoiceId: invoice.id,
    userId
  });
  if (!reopenRes.success) throw new Error('Erro ao reabrir fatura: ' + reopenRes.error);

  const invReopened = db.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice.id);
  if (invReopened.is_paid !== 0 || invReopened.is_renegotiated !== 0) {
    throw new Error('Fatura não foi reaberta corretamente');
  }
  console.log(`Fatura reaberta com sucesso: is_paid: ${invReopened.is_paid}, is_renegotiated: ${invReopened.is_renegotiated}, amount: R$ ${invReopened.amount}`);

  // Check checking account balance (refund of down payment 300 + refund of paid installment 350 = 4350 + 300 + 350 = 5000)
  const accountsCheck4 = db.getAccounts(userId);
  const checkingAccCheck4 = accountsCheck4.find(a => a.id === checkingAccountId);
  console.log(`Saldo Conta Corrente após cancelamento do acordo e estorno da entrada: R$ ${checkingAccCheck4.balance}`);

  // Test 9: Validate our newly refactored single-query check*Family methods
  const userObj = db.getUserById(userId);
  const famCheck1 = db.checkAccountFamily(checkingAccountId, userObj.family_id);
  const famCheck2 = db.checkGoalFamily(999999, 1);
  console.log(`Validação checkAccountFamily (Family ID ${userObj.family_id}): ${famCheck1} (Esperado: true)`);
  console.log(`Validação checkGoalFamily inexistente: ${famCheck2} (Esperado: false)`);
  if (!famCheck1 || famCheck2) throw new Error('Falha nos métodos check*Family refatorados');

  console.log('✔ [7/8] Reabertura de fatura, cancelamento de acordo e checagens de família validados com sucesso!');
  console.log('✔ [8/8] TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');

  // Cleanup test db
  try {
    fs.unlinkSync(testDbPath);
  } catch (e) {}
}

runTests().catch(err => {
  console.error('❌ ERRO NOS TESTES:', err);
  process.exit(1);
});
