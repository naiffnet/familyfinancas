# 📚 Wiki & Guia Operacional — FinançasFamília
*Base de Conhecimento, Conceitos, Regras de Negócio e Metodologia Financeira*

---

## 📑 Sumário da Wiki

1. [🌟 1. Visão Geral & Filosofia Colaborativa](#-1-visão-geral--filosofia-colaborativa)
2. [📖 2. Glossário Financeiro & Conceitos Operacionais](#-2-glossário-financeiro--conceitos-operacionais)
3. [💳 3. Cartões de Crédito: Ciclo, Antecipação, Rotativo & Acordos](#-3-cartões-de-crédito-ciclo-antecipação-rotativo--acordos)
4. [⚖️ 4. Regras do Motor de Juros, Multas & Feriados Nacionais](#-4-regras-do-motor-de-juros-multas--feriados-nacionais)
5. [🛡️ 5. Perfis, Trilha de Auditoria & Segurança de Dados](#-5-perfis-trilha-de-auditoria--segurança-de-dados)
6. [💡 6. Metodologia Recomendada (Regra 50-30-20)](#-6-metodologia-recomendada-regra-50-30-20)
7. [❓ 7. FAQ — Perguntas Frequentes & Resolução Rápida](#-7-faq--perguntas-frequentes--resolução-rápida)

---

## 🌟 1. Visão Geral & Filosofia Colaborativa

O **FinançasFamília** foi projetado para colocar toda a família na mesma página financeira:
- **Colaboração com Autonomia**: O casal e os filhos podem lançar seus próprios gastos, enquanto o Responsável da casa tem visão consolidada do orçamento.
- **Privacidade & Segurança Local**: Banco de dados SQLite 100% local no seu computador, com criptografia AES-256 para dados sensíveis e sem envio de informações confidenciais para servidores externos.
- **Previsibilidade & Auditoria**: Rastreamento total de quem alterou o quê, juros pagos por categoria e previsão de faturas futuras.

---

## 📖 2. Glossário Financeiro & Conceitos Operacionais

### 🔹 Mês de Competência (Consumo) vs. Data de Vencimento
- **Competência (`competence_date`)**: Mês em que a despesa foi consumida (ex: conta de Luz do mês de *Fevereiro*).
- **Vencimento (`date` / `payment_date`)**: Data limite para o dinheiro sair da conta bancária (ex: 10 de *Março*).
- **Por que separar?** Garante que os relatórios mostrem com fidelidade se os gastos de Fevereiro foram controlados, independentemente de quando o boleto foi compensado.

### 🔹 Despesas Recorrentes (Fixas) vs. Despesas Avulsas (Variáveis)
- **Recorrentes (`recurring_items`)**: Gastos obrigatórios e previsíveis todo mês (Aluguel, Financiamento, Escola, Internet, Streaming).
- **Avulsas (`transactions`)**: Gastos esporádicos do dia a dia (Supermercado, Farmácia, Restaurante, Combustível).

### 🔹 Despesas Prioritárias ⭐
Contas marcadas como prioritárias ganham destaque especial no topo do planejamento e do Dashboard para garantir que itens essenciais da casa nunca fiquem sem pagamento.

---

## 💳 3. Cartões de Crédito: Ciclo, Antecipação, Rotativo & Acordos

### 🔹 Ciclo de Fechamento & Melhor Dia de Compra
- **Fechamento**: O dia em que a operadora encerra a fatura do mês.
- **Melhor Dia**: Compras realizadas a partir do dia seguinte ao fechamento entram apenas na fatura do mês seguinte (ganho de até 40 dias de prazo para pagar sem juros).

### 🔹 Limite Comprometido vs. Limite Disponível
- Compras parceladas comprometem o limite total imediatamente.
- Conforme cada fatura mensal é paga, o limite é restabelecido proporcionalmente na hora.

### 🔹 Antecipação de Parcelas com Desconto
Permite selecionar parcelas de compras parceladas futuras e puxá-las para a fatura atual com aplicação de desconto opcional.

### 🔹 Pagamento Parcial & Saldo Rotativo Automático
Ao quitar parcialmente uma fatura, o valor pago é debitado da conta corrente e o saldo remanescente é lançado automaticamente na fatura do mês seguinte com encargos configuráveis.

### 🔹 Estorno de Transações
Cancelamento com restauração atômica de limite do cartão ou saldo de conta bancária, com registro na trilha de auditoria (`TRANSACTION_REFUND`).

---

## ⚖️ 4. Regras do Motor de Juros, Multas & Feriados Nacionais

### 🔹 Prorrogação Automática para Dias Úteis
- Contas com vencimento em sábados, domingos ou feriados nacionais bancários (Ano Novo, Carnaval, Sexta-feira Santa, Tiradentes, Trabalho, Corpus Christi, 7 de Setembro, Aparecida, Finados, República, Consciência Negra, Natal) são prorrogadas para o 1º dia útil seguinte (`📅 Prorroga: DD/MM`).
- Pagamentos realizados até o primeiro dia útil subsequente são considerados em dia e **isentos de juros de mora**.

### 🔹 Modalidades de Juros Suportadas
1. **% ao Dia (% a.d.)**: Percentual de juros aplicado por dia corrido de atraso.
2. **% ao Mês (% a.m. pro-rata)**: Taxa mensal proporcional aos dias de atraso.
3. **Multa Moratória Fixa (%)**: Percentual único cobrado pelo atraso.

---

## 🛡️ 5. Perfis, Trilha de Auditoria & Segurança de Dados

### 🔹 Níveis de Permissão
| Perfil | Escopo | Funcionalidades |
| :--- | :---: | :--- |
| **⭐ Responsável** | Família | Gestão total de contas, membros, permissões, orçamentos e relatórios. |
| **👤 Membro / Primogênito** | Pessoal / Família | Lançamentos, planejamento e menus liberados pelo Responsável. |
| **🧸 Filho / Caçula** | Simplificado | Visualização rápida de mesada e despesas autorizadas. |

### 🔹 Trilha de Auditoria (`audit_logs`)
Registra de forma transparente quem realizou cada operação no sistema:
- Ações registradas: Criação (`CRIOU`), Edição (`ALTEROU`), Exclusão (`EXCLUIU`), Quitação (`QUITOU`), Estorno e Antecipação.
- Histórico completo com valores anteriores e novos para total transparência entre os membros da casa.

---

## 💡 6. Metodologia Recomendada (Regra 50-30-20)

Para manter a estabilidade financeira do lar, sugerimos a divisão clássica do orçamento:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 50% — Necessidades Básicas (Moradia, Alimentação, Saúde) │
├─────────────────────────────────────────────────────────────┤
│ 🎭 30% — Estilo de Vida & Lazer (Passeios, Cinema, Hobbies)  │
├─────────────────────────────────────────────────────────────┤
│ 💰 20% — Futuro & Metas (Reserva de Emergência, Sonhos)     │
└─────────────────────────────────────────────────────────────┘
```

1. **Início do Mês**: Revise as **Despesas Fixas** e estipule os **Orçamentos** por categoria.
2. **Durante o Mês**: Lance os **Gastos Avulsos** (usando a câmera para ler notas fiscais) e acompanhe os alertas no Dashboard.
3. **Fim do Mês**: Audite o **Fluxo de Caixa** e a **Auditoria de Juros** nos Relatórios, destinando a economia para as suas **Metas**.

---

## ❓ 7. FAQ — Perguntas Frequentes & Resolução Rápida

#### ❓ Como conectar o celular ao aplicativo do computador?
Conecte o celular no mesmo Wi-Fi do computador, clique em **"Conectar Celular 📱"** no menu lateral e escaneie o QR Code exibido.

#### ❓ Como testar se um arquivo de backup é seguro antes de restaurar?
Vá em Configurações > **Backups** e clique no botão **`🔍 Testar .db`**. O aplicativo executará um teste de integridade completo sem alterar seus dados atuais.

#### ❓ Como imprimir ou salvar relatórios em PDF?
Na tela de Relatórios, clique no botão **`🖨️ Imprimir / PDF`** no canto superior direito. O sistema formatará uma visualização limpa pronta para impressão ou exportação em PDF.
