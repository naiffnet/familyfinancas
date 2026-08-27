# 📋 PROJECT_SPEC.md — Especificação e Checklist Profissional do Sistema

> **Documento Oficial de Engenharia de Software e Regras do Sistema**  
> Baseado no **Checklist Profissional de Desenvolvimento com IA** ([Check-list.pdf](file:///x:/Programas/MEUS%20APPs/app.financeiro/Check-list.pdf)).  
> Sistema: **FinançasFamília v2.0**

---

## 🟦 FASE 0 — DEFINIÇÃO DO PROJETO

### 1. Identidade do Projeto
- **Nome do Aplicativo**: FinançasFamília
- **Objetivo Principal**: Prover uma plataforma completa, colaborativa e inteligente para planejamento financeiro familiar, controle de fluxo de caixa, gestão de cartões de crédito com projeção de faturas, liquidação rápida com cálculo automático de juros e auditoria analítica de encargos.
- **Problema que Resolve**:
  - Falta de previsibilidade e controle em gastos compartilhados por membros da família.
  - Insegurança e retrabalho no cálculo manual de juros/multas de contas pagas em atraso.
  - Dificuldade em prever o valor das próximas faturas de cartão de crédito parceladas.
  - Lançamentos manuais demorados e ausência de conciliação automática por notas fiscais (NFC-e / PDF / PIX).
  - Risco de perda de dados financeiros ou exposição de informações sensíveis.
- **Público-Alvo**:
  - Famílias brasileiras (pais, mães, responsáveis e filhos).
  - Indivíduos que necessitam de controle financeiro rigoroso e visual.
  - Usuários que buscam educação financeira prática (perfis com feedback didático).
- **Plataformas Suportadas**:
  - **Desktop**: Aplicativo nativo empacotado com Electron (Windows, macOS, Linux).
  - **Web**: Interface web SPA responsiva para navegadores modernos (Chrome, Firefox, Safari, Edge).
  - **PWA**: Suporte a instalação como Progressive Web App (`manifest.json` + `sw.js` com cache offline).
  - **LAN Server**: Servidor Express integrado (`0.0.0.0:3000`) para acesso imediato na rede Wi-Fi doméstica por celulares e tablets sem necessidade de nuvem externa.
  - **Cloud Ready**: Configurado para deploy em contêineres Docker (Fly.io / Render).
- **Funcionamento Offline**: Sim. O aplicativo desktop opera 100% offline utilizando SQLite local (`financeiro.db`). A versão PWA realiza cache de assets.
- **Múltiplos Usuários e Famílias**: Sim. Hierarquia completa dividida em 5 perfis:
  1. *Administrador do Sistema (SuperAdmin)*
  2. *Responsável Familiar (Admin da Família)*
  3. *Primogênito / Membro Pleno*
  4. *Dependente / Usuário com Restrições*
  5. *Caçula (Interface lúdica com feedback educativo)*
- **Necessidade de Sincronização**: Suporte a exportação/importação bidirecional via SQLite `.db`, Excel `.xlsx` e JSON criptografado.

---

## 🟦 FASE 1 — REQUISITOS E REGRAS DE NEGÓCIO

### 1. Requisitos Funcionais (Módulos Principais)

| Módulo | Descrição Funcional | Quem Pode Utilizar |
| :--- | :--- | :--- |
| **Autenticação & Perfis** | Login seguro, cadastro de famílias e membros, recuperação de senha por pergunta secreta. | Todos os usuários |
| **Lançamentos Avulsos** | Registro de receitas e despesas à vista, Banricompras (débito pré-datado) e Crédito Minuto. | Todos (conforme permissão) |
| **Planejamento Recorrente** | Cadastro de despesas e receitas fixas com geração automática mensal e regras contratuais de juros. | Administradores e Membros |
| **Cartões de Crédito** | Gestão de limites, ciclo de fechamento/vencimento, compras parceladas e quitação total/parcial de faturas. | Todos (com visualização isolada ou total) |
| **Liquidação & Juros** | Modal reativo de quitação onde o usuário informa apenas Data + Valor Pago e o sistema calcula a taxa diária (% a.d.). | Todos |
| **Auditoria de Juros** | Relatório analítico consolidando gastos com encargos por categoria, fornecedor e conta bancária. | Todos |
| **Orçamento Familiar** | Definição de tetos de gastos por categoria com alertas de consumo em tempo real. | Responsáveis / Membros |
| **Metas Financeiras** | Criação de objetivos com aportes progressivos e estimativa de conclusão. | Todos |
| **Scanner NFC-e / PDF** | Leitura de QR Code de notas fiscais e arquivos PDF para lançamento automático. | Todos |
| **Deduplicação** | Alerta preditivo durante digitação e varredura retroativa de lançamentos repetidos. | Todos |
| **Central de Backups** | Auto-backup diário, exportação `.db`, Excel multi-abas e restauração com validação de integridade. | Administrador Familiar |

### 2. Requisitos Não Funcionais
- **Desempenho**: Tempo de resposta do banco local < 10ms por consulta.
- **Segurança**: Criptografia de dados sensíveis (AES-256-GCM), senhas em `bcrypt` (salt 10), proteção anti-brute-force.
- **Confiabilidade**: Transações financeiras atômicas (`BEGIN TRANSACTION ... COMMIT`).
- **Acessibilidade**: 4 temas de alto contraste, suporte a leitores de tela e navegação por teclado.
- **Conformidade Legal**: Adequação à LGPD (Termos de Uso e Política de Privacidade nativos).

---

## 🟦 FASE 2 — ARQUITETURA DO SISTEMA

### 1. Diagrama Arquitetural em Camadas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAMADA FRONTEND                               │
│  HTML5 + Vanilla CSS (Design Tokens / Glassmorphism) + Vanilla JS Mod.  │
│  Build Bundle: app.bundle.js (Zero overhead de framework)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ RPC Bridge (window.api)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       CAMADA DE COMUNICAÇÃO                             │
│     Electron IPC (Desktop)     │     HTTP JSON-RPC /api/rpc (Web/LAN)   │
│     ipcRenderer.invoke(...)    │     POST com Bearer Token + RateLimit  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CAMADA BACKEND & CONTROLADORES                      │
│  src/server/core.js: Middleware Helmet, CORS, RateLimit, Auth, Posse    │
│  src/database/session-repo.js: Gerenciador de Sessões em Memória/DB     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE BANCO DE DADOS                           │
│  SQLite3 (better-sqlite3) em modo WAL + Foreign Keys ativadas           │
│  Repositórios: Core, Cards, Transactions, Recurring, Budgets, Reports   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🟦 FASE 3 — BANCO DE DADOS & ESQUEMA RELACIONAL

### 1. Entidades e Relacionamentos
- `families` (1) ───< `users` (N)
- `users` (1) ───< `accounts` (N)
- `users` (1) ───< `categories` (N)
- `users` (1) ───< `recurring_items` (N)
- `accounts` (1) ───< `credit_cards` (1) ───< `card_invoices` (N)
- `accounts` (1) ───< `transactions` (N)
- `recurring_items` (1) ───< `transactions` (N)
- `categories` (1) ───< `budgets` (N)
- `users` (1) ───< `goals` (N) ───< `goal_deposits` (N)

### 2. Regras de Integridade e Exclusão (ON DELETE)
- Exclusão de Cartão: Remove faturas associadas (`ON DELETE CASCADE`).
- Exclusão de Conta: Remove transações e cartões vinculados com estorno seguro de saldo.
- Exclusão de Categoria: Desvincula lançamentos setando `category_id = NULL` (`ON DELETE SET NULL`) para não apagar o histórico contábil.
- Exclusão de Usuário: Limpa sessões ativas e desassocia da família.

---

## 🟦 FASE 4 — DINHEIRO, CÁLCULOS E REGRAS FINANCEIRAS

### 1. Tratamento Monetário
- Todos os cálculos monetários utilizam arredondamento financeiro de 2 casas decimais explícito:
  ```javascript
  const roundMoney = (val) => Math.round((parseFloat(val) || 0) * 100) / 100;
  ```
- **Saldo Líquido de Lançamento**:
  $$\text{Valor Líquido} = \text{Valor Base} + \text{Juros/Multa} - \text{Desconto}$$
- **Impacto no Saldo da Conta Bancária**:
  - *Despesa*: Saldo diminui em $\text{Valor Líquido}$.
  - *Receita*: Saldo aumenta em $\text{Valor Líquido}$.

### 2. Ciclo de Cartão de Crédito e Faturas
- **Melhor Dia de Compra**: Compras realizadas entre o fechamento (`closing_day`) e o vencimento (`due_day`) caem automaticamente na fatura do mês subsequente.
- **Limite Disponível**:
  $$\text{Limite Disponível} = \text{Limite Total} - \sum(\text{Faturas Abertas e Fechadas Pendentes})$$
- **Parcelamento Inteligente**: Distribuição automática de $N$ parcelas pelas faturas futuras dos respectivos meses de competência.
- **Quitação de Fatura**: Suporte a pagamento total ou parcial, registrando o pagamento na conta pagadora e recalculando o saldo remanescente.

### 3. Cálculos de Juros e Multas
- **Cálculo da Taxa Diária Real (% a.d.)**:
  $$\text{Taxa Diária (\% a.d.)} = \frac{(\text{Valor Pago} - \text{Valor Original}) / \text{Valor Original}}{\text{Dias de Atraso}} \times 100$$
- **Previsibilidade Contratual**: Projeção de valor atualizado hoje com base na regra cadastrada (`% ao dia`, `% ao mês`, `% ao ano` ou `fixo por parcela/contrato`).

---

## 🟦 FASE 5 — DATAS, HORÁRIOS E COMPETÊNCIA

- **Armazenamento**: Padrão ISO 8601 (`YYYY-MM-DD` para datas e `YYYY-MM-DD HH:mm:ss` para timestamps).
- **Exibição**: Formato brasileiro `DD/MM/YYYY` e `MM/YYYY`.
- **Prevenção de Bug de Fuso Horário**: Todas as operações de data no frontend anexam `T00:00:00` para garantir a interpretação no fuso horário local, eliminando o erro comum de deslocamento para o dia anterior por conversão UTC.
- **Tratamento de Fim de Mês e Ano Bissexto**:
  - Ajuste automático de vencimentos para o último dia do mês quando o mês tiver menos dias que o `due_day` (ex: dia 31 vira 28 ou 29 em fevereiro, e 30 em abril/junho/setembro/novembro).
- **Separação de Vencimento vs Competência**: O sistema permite definir o **Mês de Referência / Consumo** (ex: conta de energia consumida em março e vencida em abril).

---

## 🟦 FASE 6 — SEGURANÇA E PROTEÇÃO DE DADOS

- **Autenticação**:
  - Hash seguro com `bcryptjs` (custo computacional = 10).
  - Tokens de sessão criptograficamente aleatórios de 64 caracteres (`crypto.randomBytes(32).toString('hex')`).
  - Expiração automática de sessão em 7 dias.
- **Proteção Anti-Brute-Force**:
  - Bloqueio temporário de 5 minutos após 5 tentativas consecutivas de login incorreto por usuário.
  - Rate limiting na API com `express-rate-limit` (10 tentativas a cada 15 min para endpoints sensíveis).
- **Criptografia de Dados Pessoais (AES-256-GCM)**:
  - Campos como CPF, telefone, número de agência e conta bancária são encriptados no banco de dados com vetor de inicialização (IV) e tag de autenticação de integridade.
- **Isolamento de Dados no Backend**:
  - Validação estrita de posse em todas as rotas RPC (`createOwnershipChecks`). Um usuário comum nunca tem permissão de visualizar ou modificar contas, transações ou membros de outra família.

---

## 🟦 FASE 7 — IA COMO AGENTE DE DESENVOLVIMENTO

Consulte o arquivo dedicado [AI_RULES.md](file:///x:/Programas/MEUS%20APPs/app.financeiro/AI_RULES.md) para as 15 regras de ouro mandatórias de desenvolvimento assistido por IA.

---

## 🟦 FASE 8 — CONTROLE DE ALTERAÇÕES & GIT

- Controle de versão rigoroso via repositório Git local.
- Build do frontend centralizado via script `npm run build:renderer` (`node scripts/concat-modules.js`).
- Nenhuma alteração de arquitetura é aplicada sem planejamento prévio e validação de sintaxe.

---

## 🟦 FASE 9 & 10 — TESTES E CASOS EXTREMOS

- **Validação de Sintaxe Automatizada**: Verificação contínua de todos os 23 módulos com `node -c`.
- **Casos Extremos Tratados**:
  - *Valores*: Zero (`R$ 0,00`), centavos mínimos (`R$ 0,01`), grandes montantes (`R$ 999.999.999,99`), bloqueio de valores negativos inválidos.
  - *Nulos e Indefinidos*: Tratamento com coalescência nula `??` e fallback em formatadores.
  - *Concorrência Local*: WAL Mode no SQLite permite leituras simultâneas sem travar a escrita.

---

## 🟦 FASE 11 & 12 — API RPC & TRATAMENTO DE ERROS

- **Padrão de Resposta Padronizado**:
  ```json
  { "success": true, "data": { ... } }
  // ou em caso de erro:
  { "error": "Mensagem amigável e clara para o usuário" }
  ```
- **Proteção contra Vazamento de Stack Trace**: Erros internos detalhados são registrados no console do servidor, enquanto o frontend recebe mensagens amigáveis via `toast(...)`.

---

## 🟦 FASE 13 — INTERFACE, UX E ACESSIBILIDADE

- Design System com Glassmorphism, bordas sutis e tipografia moderna (Inter).
- 4 Temas de Alto Contraste: *Dark Emerald*, *Light Clean*, *High Contrast Dark* e *High Contrast Light*.
- Estados completos para cada tela: **Carregando (Skeleton/Spinner)**, **Sucesso**, **Erro** e **Estado Vazio (Empty State)** ilustrado.

---

## 🟦 FASE 14 — PERFORMANCE

- **SQLite WAL Mode**: Escrita veloz sem bloqueio de consultas de leitura.
- **Índices de Banco**: Índices criados em `user_id`, `date`, `family_id`, `card_id` e `invoice_id`.
- **Zero Framework Bloat**: Frontend Vanilla JS nativo sem sobrecarga de renderização virtual DOM pesada, garantindo carregamento instantâneo (< 100ms).

---

## 🟦 FASE 15 — PRIVACIDADE E LGPD

- **Termos de Uso e Política de Privacidade**: Documentos jurídicos completos integrados diretamente no app ([Termos de Uso](file:///x:/Programas/MEUS%20APPs/app.financeiro/Termos_de_Uso_FinancasFamilia.docx)).
- **Direito de Acesso e Exclusão**: Exportação integral dos dados do usuário em JSON/Excel e exclusão completa da conta e dados com um clique.

---

## 🟦 FASE 16 — BACKUP E RESTAURAÇÃO

- **Auto-Backup Diário**: Rotina que cria automaticamente cópias diárias do banco SQLite na pasta `backups_auto/`.
- **Backup Manual Nativo**: Exportação direta do arquivo `.db` via diálogo nativo do sistema operacional.
- **Exportação Multi-Formato**: Exportação completa em planilhas Excel `.xlsx` multi-abas estilizadas e arquivos estruturados `.json`.
- **Restauração Segura**: Validação de integridade do arquivo antes de substituir a base ativa.

---

## 🟦 FASE 17 & 18 — OBSERVABILIDADE E AUDITORIA

- **Auditoria de Juros e Multas**: Painel exclusivo com cálculo de dias de atraso, taxas diárias médias e ranking de fornecedores/credores.
- **Logs Operacionais**: Rastreabilidade de logins, cadastros e exportações no servidor.

---

## 🟦 FASE 19 & 20 — DEPLOY E CHECKLIST DE PRODUÇÃO

### Status dos Bloqueadores de Produção:
- [x] Nenhum erro crítico de sintaxe ou execução.
- [x] Banco de dados com migrações e índices consistentes.
- [x] Autenticação e controle de acesso verificados no backend.
- [x] Cálculos financeiros e de saldo validados.
- [x] Backup automático e manual funcionando.
- [x] Interface responsiva com suporte a múltiplos temas.
- [x] Sistema de auditoria de juros e encargos ativo.
- [x] LGPD e Termos de Uso incorporados.
