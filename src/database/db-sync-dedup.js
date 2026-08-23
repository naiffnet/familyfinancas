/**
 * src/database/db-sync-dedup.js
 * Motor anti-duplicidade heurístico (NLP bancário, auto-merge, histórico e Smart Sync).
 */
const { getCardBillingCycle } = require('./db-core');

module.exports = (Base) => class extends Base {
  _normalizeSyncText(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _cleanBankDescriptionTokens(text) {
    if (!text) return [];
    const STOPWORDS = new Set([
      'pix', 'ted', 'doc', 'pagamento', 'pagto', 'pgto', 'compra', 'cartao', 'cartão',
      'debito', 'débito', 'credito', 'crédito', 'transf', 'transferencia', 'transferência',
      'banco', 'bancario', 'bancaria', 'recibo', 'fatura', 'boleto', 'via', 'de', 'do',
      'da', 'dos', 'das', 'para', 'em', 'no', 'na', 'nos', 'nas', 'com', 'e', 'ou',
      'estorno', 'lançamento', 'lancamento', 'tarifa', 'tar', 'iof', 'aut', 'auto', 'sa', 'ltda', 'me', 'epp'
    ]);
    const normalized = this._normalizeSyncText(text);
    return normalized.split(' ').filter(w => w.length >= 2 && !STOPWORDS.has(w));
  }

  _extractInstallment(text) {
    if (!text) return null;
    const m = text.match(/(?:parc\.?|parcela)?\s*(\d{1,2})\s*(?:\/|\s+de\s+)\s*(\d{1,2})/i);
    if (m) {
      return { current: parseInt(m[1], 10), total: parseInt(m[2], 10) };
    }
    return null;
  }

  calculateSimilarity(txA, txB) {
    if (!txA || !txB) return 0;

    // 1. Tipo deve ser o mesmo (expense vs expense, income vs income)
    if (txA.type !== txB.type) return 0;

    const isIncome = txA.type === 'income';

    // REGRA DE OURO PARA RECEITAS (INCOME):
    // Se forem receitas e as contas bancárias forem DIFERENTES, 100% IGNORADAS (são rendas reais independentes)
    if (isIncome) {
      if (txA.account_id && txB.account_id && txA.account_id !== txB.account_id) {
        return 0;
      }
    }

    // 2. Análise Textual Preliminar (NLP & Stopwords)
    const rawA = txA.description || txA.recurring_name || txA.rec_name || '';
    const rawB = txB.description || txB.recurring_name || txB.rec_name || '';
    const tokensA = this._cleanBankDescriptionTokens(rawA);
    const tokensB = this._cleanBankDescriptionTokens(rawB);

    let textMatchCount = 0;
    let jaccardScore = 0;

    if (tokensA.length > 0 && tokensB.length > 0) {
      const setA = new Set(tokensA);
      const setB = new Set(tokensB);

      for (const tA of setA) {
        if (setB.has(tA)) {
          textMatchCount++;
        } else {
          // Checa prefixos (mínimo 4 caracteres, ex: 'supermerc' em 'supermercado')
          for (const tB of setB) {
            if (tA.length >= 4 && tB.length >= 4 && (tA.startsWith(tB) || tB.startsWith(tA))) {
              textMatchCount += 0.8;
              break;
            }
          }
        }
      }

      const totalDistinct = new Set([...setA, ...setB]).size;
      jaccardScore = totalDistinct > 0 ? (textMatchCount / totalDistinct) : 0;
    } else if (rawA && rawB && this._normalizeSyncText(rawA) === this._normalizeSyncText(rawB)) {
      jaccardScore = 1.0;
    }

    // REGRA DE DESPESAS COM CONTAS DIFERENTES:
    // Se as contas forem conhecidas e diferentes, E não houver termos em comum (jaccard < 0.25):
    // IGNORAR TOTALMENTE! (São gastos reais e distintos em contas diferentes)
    const hasDifferentAccounts = txA.account_id && txB.account_id && txA.account_id !== txB.account_id;
    if (!isIncome && hasDifferentAccounts) {
      if (jaccardScore < 0.25 && !txA.recurring_item_id && !txB.recurring_item_id) {
        return 0; // Contas diferentes e títulos diferentes = 0% duplicata
      }
    }

    // 3. Verificação de Parcelamento (X/Y ou X de Y)
    const instA = this._extractInstallment(rawA);
    const instB = this._extractInstallment(rawB);
    if (instA && instB) {
      // Se forem parcelas DIFERENTES do mesmo produto (ex: 2/10 vs 3/10) -> NÃO é duplicata!
      if (instA.current !== instB.current) {
        return 0;
      }
    }

    let score = 0;

    // 4. Proximidade de Datas (tolerância inteligente com fins de semana)
    if (!txA.date || !txB.date) return 0;
    const dtA = new Date(txA.date + 'T12:00:00Z');
    const dtB = new Date(txB.date + 'T12:00:00Z');
    if (isNaN(dtA.getTime()) || isNaN(dtB.getTime())) return 0;
    
    const diffDays = Math.abs(dtA.getTime() - dtB.getTime()) / (1000 * 60 * 60 * 24);
    const dayOfWeekA = dtA.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const dayOfWeekB = dtB.getUTCDay();
    const isWeekendComp = (
      (dayOfWeekA >= 5 || dayOfWeekA === 0) && (dayOfWeekB <= 2 && dayOfWeekB >= 1) ||
      (dayOfWeekB >= 5 || dayOfWeekB === 0) && (dayOfWeekA <= 2 && dayOfWeekA >= 1)
    );

    if (diffDays === 0) {
      score += 35;
    } else if (diffDays <= 1) {
      score += 28;
    } else if (diffDays <= 2) {
      score += 20;
    } else if (diffDays <= 4 && isWeekendComp) {
      // Compensação bancária de compras feitas na sexta/sábado/domingo registradas na segunda/terça
      score += 25;
    } else if (diffDays <= 3) {
      score += 10;
    } else {
      return 0; // Mais de 3-4 dias de distância não é duplicata
    }

    // 5. Proximidade de Valores Monetários (Nível 1 & Nível 2)
    const vA = Math.abs(Number(txA.amount) || 0);
    const vB = Math.abs(Number(txB.amount) || 0);
    if (vA <= 0 || vB <= 0) return 0;

    const diffAmount = Math.abs(vA - vB);
    const maxAmount = Math.max(vA, vB);
    const diffPct = diffAmount / maxAmount;

    if (diffAmount === 0) {
      score += 40; // Nível 1: Valor exato
    } else if (diffAmount <= 1.00) {
      score += 35;
    } else if (diffPct <= 0.02 || diffAmount <= 2.50) {
      score += 30; // Nível 2: Valores muito próximos
    } else if (diffPct <= 0.05) {
      score += 20;
    } else {
      return 0; // Valores discrepantes (> 5%)
    }

    // 6. Pontuação por Título / NLP (Nível 3)
    if (jaccardScore > 0) {
      score += Math.round(jaccardScore * 25);
    }

    // 7. Pontuação por Parcela Coincidente (ex: 3/10 == 3/10)
    if (instA && instB && instA.current === instB.current && instA.total === instB.total) {
      score += 15;
    }

    // 8. Vínculo com mesma Despesa Fixa / Recorrente
    if (txA.recurring_item_id && txB.recurring_item_id && txA.recurring_item_id === txB.recurring_item_id) {
      score += 20;
    }

    // 9. Mesma Conta Bancária vs Contas Diferentes
    if (txA.account_id && txB.account_id) {
      if (txA.account_id === txB.account_id) {
        score += 10; // Mesma conta bancária (+10 pts)
      } else {
        score -= 15; // Penalidade por conta diferente (-15 pts)
      }
    }

    // 10. Mesmo Usuário Lançando
    if (txA.user_id && txB.user_id && txA.user_id === txB.user_id) {
      score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  checkDuplicateCandidate({ familyId, amount, date, description, accountId, type = 'expense', excludeId = null }) {
    if (!familyId || !amount || !date) return { hasDuplicate: false };
    const targetAmount = Math.abs(Number(amount) || 0);
    if (targetAmount <= 0) return { hasDuplicate: false };

    // Busca transações recentes da família na janela de +- 4 dias
    const candidates = this.db.prepare(`
      SELECT t.*, u.name as user_name, u.avatar_color as user_avatar_color, a.name as account_name, r.name as recurring_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN recurring_items r ON t.recurring_item_id = r.id
      WHERE u.family_id = ? 
        AND (t.is_deleted IS NULL OR t.is_deleted = 0)
        AND abs(julianday(t.date) - julianday(?)) <= 4
        AND (? IS NULL OR t.id != ?)
      ORDER BY t.date DESC
      LIMIT 30
    `).all(familyId, date, excludeId, excludeId);

    const virtualTx = {
      type,
      amount: targetAmount,
      date,
      description: description || '',
      account_id: accountId || null
    };

    let bestMatch = null;
    let highestScore = 0;

    for (const cand of candidates) {
      const score = this.calculateSimilarity(virtualTx, cand);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = cand;
      }
    }

    if (highestScore >= 65 && bestMatch) {
      return {
        hasDuplicate: true,
        score: highestScore,
        confidence: highestScore >= 95 ? 'exact' : (highestScore >= 80 ? 'high' : 'medium'),
        candidate: {
          id: bestMatch.id,
          user_name: bestMatch.user_name,
          user_avatar_color: bestMatch.user_avatar_color,
          account_name: bestMatch.account_name,
          date: bestMatch.date,
          amount: bestMatch.amount,
          description: bestMatch.description,
          is_paid: bestMatch.is_paid
        }
      };
    }

    return { hasDuplicate: false };
  }

  findPotentialDuplicates({ familyId, daysWindow = 60, minScore = 65, userId = null, accountId = null }) {
    const minDate = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = `
      SELECT t.*, u.name as user_name, u.avatar_color as user_avatar_color, a.name as account_name, c.name as category_name, r.name as recurring_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN recurring_items r ON t.recurring_item_id = r.id
      WHERE u.family_id = ? AND (t.is_deleted IS NULL OR t.is_deleted = 0) AND t.date >= ?
    `;
    const params = [familyId, minDate];

    if (userId) {
      query += ` AND t.user_id = ?`;
      params.push(userId);
    }
    if (accountId) {
      query += ` AND t.account_id = ?`;
      params.push(accountId);
    }

    query += ` ORDER BY t.date DESC, t.amount DESC`;

    const txs = this.db.prepare(query).all(...params);
    const duplicates = [];
    const paired = new Set();

    for (let i = 0; i < txs.length; i++) {
      for (let j = i + 1; j < txs.length; j++) {
        const a = txs[i];
        const b = txs[j];
        const pairKey = `${Math.min(a.id, b.id)}_${Math.max(a.id, b.id)}`;
        if (paired.has(pairKey)) continue;

        const score = this.calculateSimilarity(a, b);
        if (score >= minScore) {
          paired.add(pairKey);
          let confidence = 'medium';
          if (score >= 95) confidence = 'exact';
          else if (score >= 80) confidence = 'high';

          duplicates.push({
            score,
            confidence,
            tx1: a,
            tx2: b
          });
        }
      }
    }

    return duplicates.sort((a, b) => b.score - a.score);
  }

  mergeDuplicateTransactions({ primaryTxId, duplicateTxId, userId }) {
    const primary = this.db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(primaryTxId);
    const duplicate = this.db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(duplicateTxId);

    if (!primary || !duplicate) {
      return { success: false, error: 'Lançamento não encontrado para mesclagem.' };
    }

    const t = this.db.transaction(() => {
      // Se a duplicata estava paga e o primário não, atualiza o primário para pago
      if (duplicate.is_paid === 1 && primary.is_paid === 0) {
        this.db.prepare(`
          UPDATE transactions 
          SET is_paid = 1, payment_date = ?, updated_at = datetime('now') 
          WHERE id = ?
        `).run(duplicate.payment_date || duplicate.date, primaryTxId);
      }

      // Reverte saldo se a duplicata tinha impactado a conta
      if (duplicate.is_paid === 1 && duplicate.account_id) {
        const delta = duplicate.type === 'income' ? -duplicate.amount : duplicate.amount;
        this.db.prepare(`UPDATE accounts SET balance = balance + ? WHERE id = ?`).run(delta, duplicate.account_id);
      }

      // Marca duplicata como deletada (soft-delete) para sincronização limpa
      this.db.prepare(`
        UPDATE transactions 
        SET is_deleted = 1, updated_at = datetime('now'), description = description || ' [Mesclado com #' || ? || ']' 
        WHERE id = ?
      `).run(primaryTxId, duplicateTxId);

      // Atualiza eventuais registros de conflitos pendentes
      this.db.prepare(`
        UPDATE sync_conflicts 
        SET status = 'merged', updated_at = datetime('now') 
        WHERE (primary_tx_id = ? AND duplicate_tx_id = ?) OR (primary_tx_id = ? AND duplicate_tx_id = ?)
      `).run(primaryTxId, duplicateTxId, duplicateTxId, primaryTxId);
    });

    t();
    return { success: true, primaryId: primaryTxId, mergedId: duplicateTxId };
  }

  mergeBatchTransactions({ pairs, userId }) {
    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return { success: false, mergedCount: 0 };
    }
    let mergedCount = 0;
    const t = this.db.transaction(() => {
      for (const pair of pairs) {
        const pId = pair.primaryTxId || pair.tx1_id || pair.tx1Id;
        const dId = pair.duplicateTxId || pair.tx2_id || pair.tx2Id;
        if (pId && dId && pId !== dId) {
          const res = this.mergeDuplicateTransactions({
            primaryTxId: pId,
            duplicateTxId: dId,
            userId
          });
          if (res && res.success) mergedCount++;
        }
      }
    });
    t();
    return { success: true, mergedCount };
  }

  dismissDuplicateConflict({ conflictId, primaryTxId, duplicateTxId }) {
    if (conflictId) {
      this.db.prepare(`UPDATE sync_conflicts SET status = 'dismissed', updated_at = datetime('now') WHERE id = ?`).run(conflictId);
    } else if (primaryTxId && duplicateTxId) {
      this.db.prepare(`
        UPDATE sync_conflicts 
        SET status = 'dismissed', updated_at = datetime('now') 
        WHERE (primary_tx_id = ? AND duplicate_tx_id = ?) OR (primary_tx_id = ? AND duplicate_tx_id = ?)
      `).run(primaryTxId, duplicateTxId, duplicateTxId, primaryTxId);
    }
    return { success: true };
  }

  getDeduplicationHistory({ familyId, limit = 50 }) {
    return this.db.prepare(`
      SELECT sc.*, 
             t1.description as tx1_desc, t1.amount as tx1_amount, t1.date as tx1_date,
             t2.description as tx2_desc, t2.amount as tx2_amount, t2.date as tx2_date
      FROM sync_conflicts sc
      LEFT JOIN transactions t1 ON sc.primary_tx_id = t1.id
      LEFT JOIN transactions t2 ON sc.duplicate_tx_id = t2.id
      WHERE sc.family_id = ?
      ORDER BY sc.updated_at DESC
      LIMIT ?
    `).all(familyId, limit);
  }

  syncPushPull({ familyId, userId, clientSyncTimestamp, changes = {} }) {
    const serverTimestamp = new Date().toISOString();
    const result = {
      success: true,
      serverSyncTimestamp: serverTimestamp,
      applied: { transactions: 0, recurring: 0, accounts: 0, categories: 0 },
      suspectDuplicates: [],
      serverChanges: {
        transactions: [],
        recurring: [],
        accounts: [],
        categories: []
      }
    };

    const processSync = this.db.transaction(() => {
      // 1. Processar transações enviadas pelo cliente
      if (changes.transactions && Array.isArray(changes.transactions)) {
        for (const tx of changes.transactions) {
          const syncId = tx.sync_id || crypto.randomUUID();
          const targetUserId = tx.user_id || userId;
          let targetAccountId = tx.account_id;
          if (!targetAccountId) {
            const defaultAcc = this.db.prepare("SELECT id FROM accounts WHERE user_id = ? AND (is_deleted IS NULL OR is_deleted = 0) ORDER BY CASE WHEN type = 'checking' THEN 1 ELSE 2 END LIMIT 1").get(targetUserId);
            targetAccountId = defaultAcc ? defaultAcc.id : 1;
          }

          const existing = this.db.prepare('SELECT id, updated_at, is_deleted FROM transactions WHERE sync_id = ?').get(syncId);

          if (existing) {
            // Atualização baseada em timestamp mais recente (Last-Write-Wins)
            if (!tx.updated_at || tx.updated_at >= existing.updated_at) {
              this.db.prepare(`
                UPDATE transactions SET
                  user_id = @user_id, account_id = @account_id, category_id = @category_id,
                  type = @type, amount = @amount, description = @description, date = @date,
                  is_paid = @is_paid, payment_date = @payment_date, is_deleted = @is_deleted,
                  updated_at = @updated_at
                WHERE id = @id
              `).run({
                id: existing.id,
                user_id: targetUserId,
                account_id: targetAccountId,
                category_id: tx.category_id || null,
                type: tx.type || 'expense',
                amount: Math.abs(Number(tx.amount) || 0),
                description: tx.description || '',
                date: tx.date,
                is_paid: tx.is_paid ? 1 : 0,
                payment_date: tx.payment_date || null,
                is_deleted: tx.is_deleted ? 1 : 0,
                updated_at: tx.updated_at || serverTimestamp
              });
              result.applied.transactions++;
            }
          } else {
            // Novo registro vindo do cliente: checa motor anti-duplicidade
            const recentFamilyTxs = this.db.prepare(`
              SELECT t.* FROM transactions t
              JOIN users u ON t.user_id = u.id
              WHERE u.family_id = ? AND (t.is_deleted IS NULL OR t.is_deleted = 0)
              AND abs(julianday(t.date) - julianday(?)) <= 3
            `).all(familyId, tx.date);

            let isExactDuplicate = false;
            let suspectDuplicate = null;

            for (const cand of recentFamilyTxs) {
              const score = this.calculateSimilarity(tx, cand);
              if (score >= 95) {
                isExactDuplicate = true;
                suspectDuplicate = { cand, score };
                break;
              } else if (score >= 75 && !suspectDuplicate) {
                suspectDuplicate = { cand, score };
              }
            }

            if (!isExactDuplicate) {
              const info = this.db.prepare(`
                INSERT INTO transactions (
                  sync_id, user_id, account_id, category_id, type, amount, description,
                  date, is_paid, payment_date, is_deleted, updated_at
                ) VALUES (
                  @sync_id, @user_id, @account_id, @category_id, @type, @amount, @description,
                  @date, @is_paid, @payment_date, @is_deleted, @updated_at
                )
              `).run({
                sync_id: syncId,
                user_id: targetUserId,
                account_id: targetAccountId,
                category_id: tx.category_id || null,
                type: tx.type || 'expense',
                amount: Math.abs(Number(tx.amount) || 0),
                description: tx.description || '',
                date: tx.date,
                is_paid: tx.is_paid ? 1 : 0,
                payment_date: tx.payment_date || null,
                is_deleted: tx.is_deleted ? 1 : 0,
                updated_at: tx.updated_at || serverTimestamp
              });
              result.applied.transactions++;

              if (suspectDuplicate) {
                result.suspectDuplicates.push({
                  newTxId: info.lastInsertRowid,
                  existingTxId: suspectDuplicate.cand.id,
                  score: suspectDuplicate.score
                });
              }
            }
          }
        }
      }

      // 2. Coletar alterações do servidor ocorridas após clientSyncTimestamp
      const sinceTime = clientSyncTimestamp || '1970-01-01T00:00:00.000Z';
      result.serverChanges.transactions = this.db.prepare(`
        SELECT t.* FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE u.family_id = ? AND t.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.accounts = this.db.prepare(`
        SELECT a.* FROM accounts a
        JOIN users u ON a.user_id = u.id
        WHERE u.family_id = ? AND a.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.recurring = this.db.prepare(`
        SELECT r.* FROM recurring_items r
        JOIN users u ON r.user_id = u.id
        WHERE u.family_id = ? AND r.updated_at > ?
      `).all(familyId, sinceTime);

      result.serverChanges.categories = this.db.prepare(`
        SELECT c.* FROM categories c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE (c.user_id IS NULL OR u.family_id = ?) AND c.updated_at > ?
      `).all(familyId, sinceTime);
    });

    processSync();
    return result;
  }
};
