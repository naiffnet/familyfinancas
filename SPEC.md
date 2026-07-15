# FinançasFamília — Especificações Técnicas (SPEC) do Projeto

Este documento especifica formalmente as definições técnicas, schemas, interfaces de rede, barramentos de comunicação IPC/RPC e regras de integridade do sistema **FinançasFamília**. Destina-se a desenvolvedores e engenheiros de software que necessitem manter ou evoluir a base de código.

---

## 🗄️ 1. Especificações do Banco de Dados (SQLite Schema)

O banco de dados é um arquivo SQLite local localizado no diretório de dados do usuário da aplicação (`app.getPath('userData')/financeiro.db`).

### 1.1. DDL das Tabelas (Esquema Completo)

Abaixo estão as definições exatas das tabelas, tipos de dados e restrições de integridade referencial:

```sql
-- 1. Organizações Familiares
CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quota_users INTEGER DEFAULT 6,
  quota_accounts INTEGER DEFAULT 10,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Perfis de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date TEXT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#10b981',
  avatar_image TEXT,
  family_id INTEGER REFERENCES families(id) ON DELETE SET NULL,
  profile_type INTEGER DEFAULT 2,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Configurações Individuais por Usuário
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(user_id, key),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 4. Contas Bancárias e Cartões de Crédito
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('checking','savings','wallet','credit','investment','voucher')),
  bank TEXT DEFAULT 'outro',
  balance REAL DEFAULT 0,
  color TEXT DEFAULT '#10b981',
  credit_limit REAL,
  closing_day INTEGER,
  due_day INTEGER,
  agency TEXT,
  account_number TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 5. Categorias Financeiras
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income','expense','both')),
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT '📦',
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 6. Agendamentos Recorrentes (Planejamento)
CREATE TABLE IF NOT EXISTS recurring_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  amount REAL NOT NULL,
  category_id INTEGER,
  account_id INTEGER,
  due_day INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  is_priority INTEGER DEFAULT 0,
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT '#10b981',
  notes TEXT,
  repeat_months INTEGER DEFAULT 0,
  start_installment INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(category_id) REFERENCES categories(id),
  FOREIGN KEY(account_id) REFERENCES accounts(id)
);

-- 7. Histórico Real de Lançamentos
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  category_id INTEGER,
  recurring_item_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
  amount REAL NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  is_paid INTEGER DEFAULT 1,
  is_avulso INTEGER DEFAULT 0, -- 0: gerada de recorrência, 1: avulsa autônoma, 2: recorrência descartada/escondida (pulada)
  notes TEXT,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(account_id) REFERENCES accounts(id),
  FOREIGN KEY(category_id) REFERENCES categories(id),
  FOREIGN KEY(recurring_item_id) REFERENCES recurring_items(id)
);

-- 8. Orçamento Planejado por Categoria
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount REAL NOT NULL,
  UNIQUE(user_id, category_id, month, year),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- 9. Projetos / Metas de Poupança
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  deadline TEXT,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT '🎯',
  is_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 10. Depósitos Vinculados às Metas
CREATE TABLE IF NOT EXISTS goal_deposits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  note TEXT,
  date TEXT DEFAULT (date('now')),
  FOREIGN KEY(goal_id) REFERENCES goals(id)
);

-- 11. Controle Granular de Permissões
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INTEGER PRIMARY KEY,
  can_view_all INTEGER DEFAULT 0, -- 0: apenas próprio dado, 1: dados da família
  can_edit_all INTEGER DEFAULT 0, -- 0: apenas próprio dado, 1: dados da família
  allow_dashboard INTEGER DEFAULT 1,
  allow_recurring INTEGER DEFAULT 1,
  allow_accounts INTEGER DEFAULT 1,
  allow_budget INTEGER DEFAULT 1,
  allow_goals INTEGER DEFAULT 1,
  allow_reports INTEGER DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Auditoria e Logs de Segurança
CREATE TABLE IF NOT EXISTS server_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 📡 2. Especificação de Rede e Protocolo (LAN Server)

A aplicação expõe sua API por meio de um protocolo **JSON-RPC sobre HTTP**, escutando em `http://0.0.0.0:3000`.

### 2.1. Estrutura do Payload das Requisições (`POST /api/rpc`)

As comunicações externas (celulares/tablets na rede) devem enviar requisições do tipo `POST` com cabeçalho `Content-Type: application/json` contendo o seguinte corpo:

```json
{
  "channel": "nome:do:canal",
  "args": [
    "argumento1",
    1234.56,
    { "objeto": "valores" }
  ]
}
```

### 2.2. Estrutura da Resposta
*   **Em caso de sucesso (`200 OK`)**:
    ```json
    {
      "result": {
        "success": true,
        "data": {}
      }
    }
    ```
*   **Em caso de erro (`500 Internal Server Error` ou `404 Not Found`)**:
    ```json
    {
      "error": "Descrição detalhada do erro gerado pelo banco ou sistema"
    }
    ```

---

## 🔌 3. Interface IPC / RPC Channels (Dicionário de Endpoints)

A tabela abaixo descreve todos os canais expostos pelo `preload.js` e registrados dinamicamente pelo processo principal (`main.js`):

| Categoria | Canal (Canal IPC / RPC) | Parâmetros Recebidos | Estrutura de Retorno (Sucesso) |
|:---|:---|:---|:---|
| **Autenticação** | `auth:login` | `username` (string), `password` (string) | `{ success: true, user: { id, name, username, ... } }` |
| | `auth:register` | Objeto contendo dados cadastrais completados no wizard. | `{ success: true, userId: integer }` |
| | `auth:getUsers` | `filters` (objeto opcional contendo `familyId`) | `Array<{ id, name, username, profile_type, ... }>` |
| | `auth:updateUser`| Objeto com dados do perfil a atualizar e senhas se alteradas | `{ success: true }` |
| | `auth:deleteUser`| `userId` (integer) | `{ success: true }` |
| **Configurações**| `settings:get` | `userId` (integer) | `{ alert_days_before: number, [key]: value }` |
| | `settings:set` | `userId`, `key`, `value` | `{ success: true }` |
| **Contas** | `accounts:getAll`| `userId` (integer) | `Array<Account>` (filtrado de acordo com permissões) |
| | `accounts:create`| Objeto com dados da conta (limite, tipo, banco, etc.) | `{ success: true, id: integer }` |
| | `accounts:update`| Objeto contendo dados da conta com o ID especificado | `{ success: true }` |
| | `accounts:delete`| `id` (integer) (faz exclusão lógica mudando `is_active=0`) | `{ success: true }` |
| | `accounts:transfer`| `from_account_id`, `to_account_id`, `amount`, `date`, `description`, `user_id` | `{ success: true }` |
| **Categorias** | `categories:getAll`| `userId` (integer) | `Array<Category>` (padrões + criadas pelo usuário) |
| | `categories:create`| Objeto com dados de nova categoria (`user_id`, `name`, `type`, `color`, `icon`) | `{ success: true, id: integer }` |
| | `categories:update`| Objeto contendo novos dados da categoria | `{ success: true }` |
| | `categories:delete`| `id` (integer) (impede exclusão de padrões `is_default = 1` ) | `{ success: true }` |
| **Planejamento**| `recurring:getAll`| `userId` (integer), `type` (string), `month` (int), `year` (int) | `Array<RecurringItem>` |
| | `recurring:create`| Objeto com dados da recorrência | `{ success: true, id: integer }` |
| | `recurring:update`| Objeto de atualização | `{ success: true }` |
| | `recurring:delete`| `id` (integer), `fromDate` (string) | `{ success: true }` |
| | `recurring:togglePriority`| `id` (integer) | `{ success: true }` |
| | `recurring:getMonthly`| `userId`, `month`, `year` | `Array<Transaction>` ligadas a recorrências |
| | `recurring:postponeInstallment`| `txId` (integer), `itemId` (integer) (marca despesa como pulada `is_avulso=2`) | `{ success: true }` |
| | `recurring:updatePositions`| `userId`, `positions` (Array de `{ id, position }`) | `{ success: true }` |
| **Lançamentos**| `transactions:getAll`| Filtros (`userId`, `month`, `year`, `accountId`, `categoryId`, etc.) | `Array<Transaction>` |
| | `transactions:create`| Objeto com dados do lançamento | `{ success: true, id: integer }` |
| | `transactions:update`| Objeto de modificação | `{ success: true }` |
| | `transactions:delete`| `id` (integer) | `{ success: true }` |
| | `transactions:togglePaid`| `id` (integer) | `{ success: true }` |
| | `transactions:togglePaidWithDate`| `id` (integer), `date` (string) | `{ success: true }` |
| | `transactions:updatePositions`| `userId`, `positions` (Array de `{ id, position }`) | `{ success: true }` |
| **Orçamentos** | `budgets:getAll`| `userId`, `month`, `year` | `Array<Budget>` |
| | `budgets:set` | `userId`, `category_id`, `month`, `year`, `amount` | `{ success: true }` |
| **Metas** | `goals:getAll` | `userId` (integer) | `Array<Goal>` |
| | `goals:create` | Objeto com dados da meta | `{ success: true, id: integer }` |
| | `goals:update` | Objeto de atualização | `{ success: true }` |
| | `goals:delete` | `id` (integer) | `{ success: true }` |
| | `goals:addDeposit`| `goal_id`, `amount`, `note`, `date` (acrescenta e atualiza `goals.current_amount` ) | `{ success: true }` |
| **Dashboard** | `dashboard:getSummary`| `userId`, `month`, `year` | Resumo de KPIs, contas, alertas de vencimento e itens prioritários |
| | `dashboard:getGeneralSummary`| `userId` | Resumo geral consolidado sem limites mensais |
| | `dashboard:getMonthlyChart`| `userId`, `months` (int) | Dados agregados passados de receitas/despesas para Chart.js |
| | `dashboard:getCategoryChart`| `userId`, `month`, `year` | Agrupado de gastos pagos por categoria para gráfico Donut |
| **Relatórios** | `reports:getCashflow`| `userId`, `month`, `year` | Relatório estruturado de fluxo de caixa |
| | `reports:getPatrimony`| `userId` | Consolidado patrimonial (ativos - passivos) |
| **Permissões** | `permissions:get`| `userId` (integer) | Objeto com chaves de menus e valores booleanos (0/1) |
| | `permissions:update`| `targetUserId` e objeto com chaves de permissões modificadas | `{ success: true }` |
| **Famílias** | `families:getAll`| N/A | `Array<Family>` |
| | `families:create`| `name`, `quota_users`, `quota_accounts` | `{ success: true, id: integer }` |
| | `families:update`| `id`, `name`, `quota_users`, `quota_accounts` | `{ success: true }` |
| | `families:delete`| `id` (integer) | `{ success: true }` |
| **Auditoria** | `server:getLogs`| N/A | `Array<{ id, event_type, message, created_at }>` |
| **Sistema** | `server:getInfo`| N/A | `{ port: 3000, ips: Array<string>, qrCode: DataURL, url: string }` |
| **Backup** | `backup:export` | N/A (Aciona diálogo de salvamento físico do arquivo `.db`) | `{ success: boolean }` |
| | `backup:exportExcel`| `userId`, `month`, `year`, `type` ('monthly' ou 'yearly') | `{ success: boolean, filePath: string }` |

---

## 🔐 4. Matriz de Perfis e Permissões

O controle operacional baseia-se no valor de `profile_type` gravado na tabela `users`:

```
              [ADM Geral (1)]
                     │ (Gerenciamento global de cotas e famílias)
                     ▼
             [Responsável (2)]
                     │ (Visualização e edição total da sua família)
         ┌───────────┴───────────┐
         ▼                       ▼
   [Primogênito (3)]        [Caçula (5)]
   (Apenas próprios dados)  (Dashboard de mesadas lúdica)
```

### 4.1. Mapeamento de Privilégios Nativos

| Perfil | Valor DB | Escopo de Visão de Dados | Limitações e Regras Estritas |
|:---|:---:|:---|:---|
| **ADM Geral** | `1` | Global (Qualquer registro e família). | Único que pode cadastrar novas famílias, redefinir cotas e excluir perfis administrativos. O usuário padrão `adm` é imutável. |
| **Responsável** | `2` | Todo o grupo familiar (`users.family_id`). | Pode ajustar privilégios em `user_permissions` de membros associados. Seus dados de despesas/contas são restritos apenas à sua família. |
| **Primogênito** | `3` | Restrito ao próprio usuário (ID). | Caso receba flag `can_view_all=1` nas permissões, pode visualizar o fluxo global da família, mas não alterar contas de terceiros. |
| **Caçula** | `5` | Restrito ao próprio usuário (ID). | Sofre desvio de renderização na SPA desktop/móvel. Carrega exclusivamente `renderCaculaDashboard`. Oculta abas complexas (Orçamento, Relatórios, etc.). |

---

## 📊 5. Especificações de Exportação de Dados

### 5.1. Exportação Excel (`xlsx`)
O backend do Electron gera arquivos Microsoft Excel (`.xlsx`) com formatação estendida contendo múltiplos painéis de dados.

*   **Exportação Mensal (`type: 'monthly'`)**:
    1.  **Aba 1: "Resumo"**: Tabela consolidada com Receitas, Despesas brutas, Saldo Líquido, total líquido de despesas pagas e total de despesas pendentes.
    2.  **Aba 2: "Lançamentos"**: Tabela detalhada de transações (colunas: *Data*, *Descrição*, *Categoria [Ícone + Nome]*, *Conta/Cartão*, *Tipo*, *Valor*, *Status [Pago/Pendente]*).
    3.  **Aba 3: "Planejamento"**: Lista de itens recorrentes vigentes no mês (colunas: *Nome*, *Categoria*, *Tipo*, *Valor*, *Dia de Vencimento*, *Conta Vinculada*, *Prioridade [⭐]*).

*   **Exportação Anual (`type: 'yearly'`)**:
    1.  **Aba 1: "Resumo Anual"**: Tabela comparativa mês a mês de Janeiro a Dezembro contendo receitas, despesas e saldos consolidados, com linha de rodapé calculando o saldo geral acumulado no ano.
    2.  **Abas 2 a 13: "[Nome do Mês]"**: Doze abas individuais contendo o histórico de lançamentos de cada respectivo mês do ano solicitado.
    3.  **Aba 14: "Planejamento Recorrente"**: Quadro geral de planejamento cadastrado para a família do usuário.

---

## 🎨 6. Especificação Visual e Componentes Gráficos (CSS Tokens)

O arquivo `style.css` adota uma folha de estilos limpa baseada em variáveis nativas do CSS (Custom Properties) para padronização.

### 6.1. Tokens de Cores (Design System)
```css
:root {
  --bg-primary: #0a0d14;       /* Fundo profundo do app */
  --bg-secondary: #111827;     /* Fundo de cartões e blocos elevados */
  --bg-tertiary: #1f2937;      /* Elementos interativos secundários */
  --text-primary: #f3f4f6;     /* Texto principal em alto contraste */
  --text-secondary: #9ca3af;   /* Descrições secundárias */
  --text-muted: #6b7280;       /* Rótulos de formulário e metadados */
  
  --accent: #8b5cf6;           /* Cor roxa de destaque principal */
  --accent-light: #10b981;     /* Verde de sucesso e receitas */
  --accent-warn: #f59e0b;      /* Laranja de alertas */
  --accent-error: #ef4444;     /* Vermelho de despesas e exclusões */
  
  --border-color: rgba(255, 255, 255, 0.06);
  --glass-bg: rgba(17, 24, 39, 0.7);
  --glass-blur: blur(12px);
}
```

### 6.2. Widgets Customizados Nativos
*   **Credit Card Widgets**: Renders dinâmicos com dimensões fixas de cartão real (`aspect-ratio: 1.58 / 1`, cantos arredondados `border-radius: 16px`, efeito metalizado via `linear-gradient` baseado na cor customizada da conta, exibição do banco emissor e o donut bidirecional SVG incorporado).
*   **Password Strength Bar**: Linha reativa sob a senha do wizard dividida em 5 estágios dinâmicos coloridos baseados na complexidade algorítmica da senha inserida:
    *   *Muito Fraca*: Vermelho escuro (`#b91c1c`) - largura 20%
    *   *Fraca*: Vermelho (`#ef4444`) - largura 40%
    *   *Razoável*: Laranja/Amarelo (`#f59e0b`) - largura 60%
    *   *Forte*: Verde claro (`#34d399`) - largura 80%
    *   *Excelente*: Verde esmeralda (`#10b981`) - largura 100%
