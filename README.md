# 💰 FinançasFamília

> Um aplicativo híbrido premium para controle financeiro pessoal e familiar. Desenvolvido com **Electron**, **SQLite** (via `better-sqlite3`), **Express** (para acesso via rede local/LAN) e **Chart.js** para visualização gráfica inteligente.

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para preparar o ambiente e rodar o aplicativo no seu computador.

### Prerrequisitos
- **Node.js** (versão 16 ou superior recomendado)
- **npm** (instalado junto com o Node.js)

### 1. Clonar o Repositório e Instalar Dependências
No seu terminal, navegue até a pasta do projeto e instale as dependências:
```bash
# Instalar dependências do projeto
npm install
```

### 2. Compilar Dependências Nativas (Se necessário)
Como o projeto utiliza o `better-sqlite3` (uma dependência em C++ nativa), pode ser necessário recompilá-lo para que ele rode perfeitamente na versão do Electron instalada:
```bash
# Recompilar bibliotecas nativas para o Electron
npm run rebuild
```

### 3. Rodar o Aplicativo (Electron)
Para abrir o aplicativo Desktop completo:
```bash
# Rodar em modo de desenvolvimento (Electron Desktop)
npm run dev
```
ou
```bash
# Executar a aplicação
npm start
```

### 4. Rodar Somente o Servidor de Rede Local (Modo LAN)
Se você deseja expor o banco de dados apenas para os celulares ou outros navegadores na mesma rede sem abrir a interface de desktop:
```bash
npm run start:server
```

---

## 🛠️ Arquitetura do Sistema

A aplicação adota um padrão de arquitetura híbrida dividida em três camadas principais:

1. **Main Process (`src/main.js`)**: O backend que roda diretamente no Node.js. Gerencia a janela nativa do Electron, inicializa o servidor de sincronização Express (LAN Server) e processa operações pesadas de E/S como importação e exportação de backups e planilhas do Excel.
2. **Preload Bridge (`src/preload.js`)**: Ponte de segurança isolada que expõe APIs seguras para a interface gráfica por meio do `contextBridge`.
3. **Renderer Process (`src/renderer/`)**: Interface gráfica em formato Single Page Application (SPA), estilizada em CSS Vanilla puro com suporte a gradientes fluidos, modo escuro profundo, efeitos de vidro (glassmorphism) e design responsivo.

---

## 🌀 Sincronização Local (LAN Web Server)
O aplicativo possui suporte nativo para uso concorrente por múltiplos membros da família:
- Ao abrir o app no Desktop, ele inicializa um servidor local Express na porta `3000`.
- Outros dispositivos conectados à mesma rede Wi-Fi podem ler o QR Code exibido na tela ou digitar `http://<IP_DO_COMPUTADOR>:3000` em seus navegadores.
- O arquivo `app.js` detecta automaticamente quando está rodando fora do Electron (em navegadores de smartphones) e redireciona todas as ações para a API JSON-RPC do servidor, oferecendo a mesma experiência e interface do app Desktop.

---

## 🗄️ Detalhes do Banco de Dados
A persistência utiliza **SQLite** em modo WAL (Write-Ahead Logging) para garantir escritas ultra-rápidas e integridade dos dados sob acessos concorrentes via celulares. As tabelas principais incluem:
- **`users`**: Armazena perfis e hashes de senhas criptografadas com `bcryptjs`.
- **`accounts`**: Gerencia limites, fechamentos e vencimentos de cartões e contas correntes.
- **`recurring_items`**: Agenda e calcula recorrências automatizadas.
- **`transactions`**: Registra o fluxo de caixa histórico (receitas, despesas e transferências).
- **`user_permissions`**: Regras de visualização e edição detalhada entre familiares.

---

## 📄 Documentação Completa do Projeto

Para obter detalhes ainda mais profundos sobre a implementação técnica e o modelo arquitetural, consulte os seguintes arquivos locais:

- 📑 **[Explicação Arquitetural e Funcional](file:///x:/Programas/MEUS%20APPs/1%20APPs%20em%20dois%20ter%C3%A7os/app.financeiro/EXPLICACAO.md)**: Detalha o motor de recorrências, permissões de usuários, fallbacks de rede e o design system do app.
- 🔧 **[Especificações Técnicas (SPEC)](file:///x:/Programas/MEUS%20APPs/1%20APPs%20em%20dois%20ter%C3%A7os/app.financeiro/SPEC.md)**: Contém o DDL do banco de dados (esquema SQLite completo), rotas de rede, protocolos IPC e APIs expostas.
