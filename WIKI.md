# 📚 Wiki do Aplicativo — Financeiro Familiar

Bem-vindo à **Wiki Oficial do Financeiro Familiar**, a base de conhecimento com conceitos, regras de negócio, glossário financeiro, perguntas frequentes (FAQ) e boas práticas de gestão orçamentária para o seu lar.

---

## 📑 Sumário

1. [Visão Geral & Filosofia](#-1-visão-geral--filosofia)
2. [Glossário Financeiro & Conceitos](#-2-glossário-financeiro--conceitos)
3. [Perfis de Usuário & Segurança IDOR](#-3-perfis-de-usuário--segurança-idor)
4. [Regras de Negócio do Motor Financeiro](#-4-regras-de-negócio-do-motor-financeiro)
5. [FAQ — Perguntas Frequentes & Solução de Problemas](#-5-faq--perguntas-frequentes--solução-de-problemas)
6. [Metodologia Recomendada de Gestão Familiar](#-6-metodologia-recomendada-de-gestão-familiar)

---

## 🌟 1. Visão Geral & Filosofia

O **Financeiro Familiar** é um sistema financeiro focado na gestão colaborativa do orçamento doméstico. Diferente de planilhas isoladas ou apps bancários individuais, ele permite que:

- **Pais e Responsáveis** tenham visão consolidada de todas as despesas da casa.
- **Filhos e Dependentes** desenvolvam educação financeira registrando seus próprios gastos ou mesadas.
- **Privacidade & Autonomia** sejam equilibradas através de permissões granulares por menu.
- **Seus Dados Fiquem com Você**: O banco de dados SQLite opera localmente, com criptografia AES-256 para dados sensíveis e total compatibilidade com a LGPD.

---

## 📖 2. Glossário Financeiro & Conceitos

### 🔹 Mês de Referência (Competência) vs. Mês de Vencimento
- **Mês de Competência / Referência (`competence_date`)**: Representa o período em que o serviço ou produto foi efetivamente consumido. Exemplo: A conta de Luz do mês de *Fevereiro*.
- **Mês de Vencimento / Pagamento (`date` / `payment_date`)**: Representa a data em que o boleto vence e o dinheiro sai da conta bancária (ex: 10 de *Março*).
- **Importância**: Isso evita distorções nos relatórios mensais, permitindo saber se os custos de Fevereiro foram controlados mesmo que pagos em Março.

### 🔹 Ciclo de Fechamento de Cartão de Crédito & Melhor Dia de Compra
- **Dia de Fechamento (`closing_day`)**: O dia em que a operadora do cartão encerra os lançamentos da fatura atual.
- **Dia de Vencimento (`due_day`)**: O dia em que o pagamento da fatura deve ser realizado.
- **Cálculo do Ciclo**: Vai do dia seguinte ao fechamento do mês anterior até o dia de fechamento do mês atual (ex: 26/07 a 25/08 para a fatura de Agosto).
- **A 'Melhor Data de Compra'**: Compras feitas a partir do dia seguinte ao fechamento entram apenas na fatura do mês seguinte (ganho de até 40 dias de prazo para pagar).

### 🔹 Comprometimento Global do Limite de Crédito
- Toda compra no cartão (à vista ou parcelada em N vezes) compromete o limite global do cartão imediatamente.
- Conforme cada fatura mensal é quitada, o limite é liberado proporcionalmente ao valor pago.

### 🔹 Despesas Fixas (Recorrentes) vs. Despesas Variáveis (Avulsas)
- **Recorrentes (`recurring_items`)**: Gastos obrigatórios e previsíveis todo mês (Aluguel, Financiamento, Internet, Escola).
- **Avulsas (`transactions` com `is_avulso = 1`)**: Gastos esporádicos e variáveis do dia a dia (Farmácia, Restaurante, Combustível, Compras).

### 🔹 Quota Familiar (`quota_users` & `quota_accounts`)
- Limite máximo de membros (usuários) e contas/cartões permitidos dentro de cada grupo familiar para garantir performance e organização.

---

## 🛡️ 3. Perfis de Usuário & Segurança IDOR

O sistema implementa rigorosa segurança contra acesso indevido entre famílias diferentes (*Insecure Direct Object References - IDOR*).

| Perfil | Nível | Acesso aos Dados |
| :--- | :---: | :--- |
| **Administrador Geral** (`profile_type: 1`) | 👑 Sistema | Acesso global para gestão de famílias, auditoria de logs e backup. |
| **Responsável** (`profile_type: 2`) | ⭐ Família | Acesso de leitura/edição para todos os membros da mesma família. Pode ajustar permissões e orçamentos. |
| **Colaborador** (`profile_type: 3`) | 👤 Membro | Acesso aos seus próprios registros e aos menus autorizados pelo Responsável. |
| **Caçula** (`profile_type: 4` ou `5`) | 🧸 Simplificado | Dashboard infantil/básico focado em controle de mesada e despesas rápidas. |

---

## ⚙️ 4. Regras de Negócio do Motor Financeiro

### 1. Pagamento de Despesa com Juros ou Desconto
- Ao marcar uma transação como paga com desconto, o sistema registra `discount_amount` e deduz do saldo da conta apenas o valor líquido pago.
- Ao pagar com juros/multa, registra `penalty_amount` e debita o valor total corrigido.

### 2. Renegociação de Fatura de Cartão
- Quando uma fatura é renegociada:
  1. A fatura original é marcada como `is_paid = 1` e `is_renegotiated = 1`.
  2. A entrada (se houver) é debitada da conta corrente escolhida.
  3. Uma despesa recorrente parcelada (*"Acordo Fatura..."*) é gerada automaticamente para os meses subsequentes.
  4. As parcelas do acordo entram nas faturas futuras do cartão conforme seus respectivos ciclos de fechamento.

### 4. Motor Anti-Duplicidade & Sincronização Inteligente (Smart Sync)
- **Identificadores Únicos Globais (`sync_id` / UUID v4)**: Cada transação, cartão, conta e categoria recebe um identificador universal exclusivo para evitar colisões entre Desktop e Web.
- **Resolução de Conflitos *Last-Write-Wins***: Modificações simultâneas são conciliadas pelo timestamp da última alteração (`updated_at`).
- **Motor Heurístico Anti-Duplicidade**: Detecta possíveis lançamentos repetidos entre membros do grupo familiar comparando:
  1. *Datas* (tolerância de até ±2 dias).
  2. *Valores monetários* (tolerância de centavos/gorjetas ou variação $\le 5\%$).
  3. *Descrição* (análise de similaridade textual por tokens).
  4. *Conta Bancária / Cartão Pagador*.
- **Central Visual de Conciliação**: Permite `[Mesclar em 1 Lançamento]` (unificando saldos e removendo a duplicata) ou `[Manter Ambos]`.

### 5. Gestão de Cartões Benefício & Vouchers
- Suporte para operadoras corporativas: **Flash, Caju, Alelo, Banricard, Swile, Ticket, Sodexo, VR, Ben Visa Vale**, etc.
- Modalidades suportadas: *Alimentação (VA), Refeição (VR), Mobilidade/Transporte (VT), Flexível / Multibenefícios, Combustível, Saúde/Farmácia*.
- Controle de Saldo Atual, Recarga Mensal Prevista (R$) e Dia do Crédito.

### 6. Container de Pendências de Meses Anteriores no Dashboard
- Rastreia automaticamente todas as contas de meses anteriores que ainda estão em aberto (`is_paid = 0`).
- **Navegação com 1 Clique (`goToTransaction`)**: Ao clicar em qualquer item pendente no Dashboard, o app abre o mês de competência exato no Planejamento e aplica destaque animado com brilho pulsante (*glow flash*).

### 7. 3 Modos de Visualização do Dashboard & Barra de Filtros no Topo
- **3 Layouts Configuráveis**:
  1. *🌟 Executivo por Zonas (Padrão)*: Visão 360° com KPIs, pílulas de ação rápida, previsão de cartões e Kanban 3 colunas.
  2. *📑 Sub-Abas Operacionais*: Agrupa em 3 abas sem rolagem excessiva (*Operação, Cartões & Bancos, Gráficos*).
  3. *🎛️ Cockpit Integrado*: Barra de filtros no topo em linha, quadro de Cartões e Contas logo abaixo em largura total, KPIs sincronizados, Kanban 3 colunas em 100% de largura e Gráficos no rodapé.
- **Barra Superior em Linha (`dash-top-filter-bar`)**: Filtro rápido por membro (*Toda a Família | Membros Individuais*) e por tipo de produto (*Tudo | Cartões | Contas*).
- **Titularidade Efetiva da Conta**: Contas e extratos bancários importados (OFX/CSV) vinculam-se automaticamente ao dono real da conta, garantindo filtragem e KPIs consistentes por pessoa.
- **Sincronização 100% dos Indicadores com o Kanban**: Total de Despesas e À Pagar refletem exatamente as contas pagas e pendentes do Kanban, e o progresso mensal contabiliza estritamente as despesas do mês.

### 8. Inteligência Anti-Duplicidade para Receitas & Alerta em Tempo Real
- **Regra de Ouro para Receitas**: Contas diferentes de usuários distintos são **100% ignoradas** (rendas legítimas e independentes). O alerta de duplicidade atua se a mesma receita for lançada na **mesma conta bancária** (95-100%) ou em contas diferentes do **mesmo titular** (85-90%).
- **Alerta de Lançamento Similar em Tempo Real**: Ao digitar um novo lançamento avulso ou fixo, o modal avisa instantaneamente se já existir um registro similar, prevenindo erros operacionais antes mesmo de salvar.

### 9. Leitura de Notas Fiscais (NFC-e / SAT / Pix) via Câmera & QR Code
- **Câmera ao Vivo com HUD Futurista**: Ao clicar em `📷 Ler Nota Fiscal` (disponível no Dashboard, Planejamento e Modal de Lançamento), o leitor ativa a câmera com mira iluminada (*viewfinder*) e varredura laser animada.
- **Parser Inteligente da SEFAZ**: Decodifica QR Codes padrão nacional de NFC-e (RS, SP, PR, MG, RJ, SC, etc.), extraindo a **Chave de Acesso (44 dígitos)**, o **Valor Total da Nota (R$)**, a **Data de Emissão**, o **CNPJ do Emitente** e o **Número da Nota**.
- **Reconhecimento de Estabelecimentos & Auto-Categorização**: Reconhece automaticamente redes de supermercados, farmácias, postos de combustíveis e lojas de departamento, pré-selecionando a categoria correta (*Alimentação, Saúde, Transporte, etc.*).
- **Entrada Alternativa**: Suporte a upload de foto do cupom fiscal da galeria ou digitação/colagem manual do link da SEFAZ / chave de 44 dígitos.
- **Integração com o Modal**: Preenche automaticamente todos os campos do formulário para o usuário apenas revisar, selecionar a conta pagadora e salvar com 1 clique.

---

## ❓ 5. FAQ — Perguntas Frequentes & Solução de Problemas

### ❓ Fiz uma compra no cartão de crédito, mas ela não apareceu na fatura deste mês. O que houve?
**Resposta**: Verifique a data da compra em relação ao **Dia de Fechamento** do seu cartão. Se o fechamento é dia 25 e a compra foi feita dia 26, ela entrará automaticamente na fatura do mês seguinte.

---

### ❓ Como faço para acessar o app pelo celular na mesma casa?
**Resposta**:
1. Conecte o celular na mesma rede Wi-Fi do computador.
2. No app do computador, clique em **"Conectar Celular 📱"** no menu lateral.
3. Escaneie o QR Code com a câmera do celular ou digite o endereço IP mostrado (ex: `http://192.168.1.100:3000`).

---

### ❓ O que acontece se dois membros da família lançarem a mesma despesa (um na Web e outro no Desktop)?
**Resposta**: O **Motor Anti-Duplicidade** identifica a similaridade em tempo real. O Dashboard exibe um alerta temático e o botão `🛡️` abre o modal comparativo permitindo que você unifique os dois lançamentos com 1 clique (`Mesclar em 1 Lançamento`) ou confirme que são gastos separados (`Manter Ambos`).

---

### ❓ Como cadastrar um Cartão Benefício (Flash / Caju / Alelo)?
**Resposta**: Na aba **Contas**, clique em `+ Nova Conta`, selecione o tipo **Voucher / Benefício**, escolha a operadora e informe a modalidade, saldo atual e a recarga mensal prevista.

---

### ❓ Esqueci minha senha. Como posso recuperar o acesso?
**Resposta**: Na tela de login, clique em *"Esqueci minha senha"*, digite seu nome de usuário e responda a pergunta de segurança cadastrada. O sistema permitirá redefinir sua senha imediatamente.

---

### ❓ Como transfiro dinheiro entre duas contas sem duplicar receitas/despesas?
**Resposta**: Vá na aba **Contas** e clique em **"Nova Transferência"**. O sistema cria um par de lançamentos do tipo `transfer`, transferindo o saldo entre as contas sem alterar seus totais de receita ou despesa no mês.

---

## 💡 6. Metodologia Recomendada de Gestão Familiar

Para manter a saúde financeira da sua casa em dia, sugerimos seguir a **Regra dos 50-30-20**:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 50% — Necessidades Básicas (Moradia, Alimentação, Saúde) │
├─────────────────────────────────────────────────────────────┤
│ 🎭 30% — Estilo de Vida & Lazer (Passeios, Cinema, Hobbies)  │
├─────────────────────────────────────────────────────────────┤
│ 💰 20% — Futuro & Metas (Reserva de Emergência, Sonhos)     │
└─────────────────────────────────────────────────────────────┘
```

1. **Início do Mês**: Cadastre e revise suas **Despesas Fixas** e estipule os **Limites de Orçamento** por categoria.
2. **Durante o Mês**: Lance os **Gastos Avulsos** conforme ocorrem e acompanhe as barras de progresso no Dashboard.
3. **Fim do Mês**: Audite o **Fluxo de Caixa** na aba Relatórios e destine o saldo excedente para suas **Metas Financeiras**.
