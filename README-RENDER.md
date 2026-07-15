# 🚀 Deploy no Render — FinançasFamília

> Guia rápido para colocar seu app financeiro online de graça no **Render**.

---

## 📋 Pré-requisitos

1. **Conta no GitHub** com seu repositório do FinançasFamília
2. **Conta gratuita no Render** → https://render.com

---

## 🪜 Passo a Passo

### 1. Crie uma conta no Render

Acesse [render.com](https://render.com) e cadastre-se com seu GitHub (é o método mais fácil).

### 2. Conecte seu repositório

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte sua conta do GitHub
3. Selecione o repositório do **FinançasFamília**
4. **O Render vai detectar automaticamente o arquivo `render.yaml`** (Blueprint) — se preferir, pode clicar em "Blueprint" ao invés de "Web Service" para aplicar a configuração completa de uma vez

> 💡 **Dica**: Se quiser configurar manualmente em vez de usar o Blueprint, siga as opções abaixo.

### 3. Configuração Manual (alternativa ao Blueprint)

| Campo | Valor |
|:---|---|
| **Name** | `financas-familia` |
| **Runtime** | `Node` |
| **Region** | `Ohio` (ou a mais próxima de você) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | **Free** ✅ |

### 4. Pronto! 🎉

Após alguns minutos, o Render vai fornecer uma URL tipo:
```
https://financas-familia.onrender.com
```

Acesse essa URL no navegador e use o app!

---

## ⚠️ IMPORTANTE: Banco de Dados SQLite

Seu app usa **SQLite** — um banco de dados em arquivo local.

### ⚡ No plano Free do Render:
- O **armazenamento é volátil**: se o serviço reiniciar, **seus dados serão perdidos**
- O serviço "dorme" após **15 minutos sem uso** e acorda quando alguém acessa

### ✅ Como evitar perder dados:

**Opção 1 — Faça backup manualmente** (mais simples):
- Use a opção **"Backup"** dentro do próprio app (Settings > Backup) para baixar o arquivo `.db`
- Faça isso regularmente

**Opção 2 — Migre para PostgreSQL** (recomendado para uso sério):
- O Render oferece PostgreSQL gratuito (1 GB de armazenamento)
- Posso te ajudar a migrar de SQLite para PostgreSQL — é trabalhoso mas seus dados ficam seguros

---

## 🔒 Acesso dos Familiares

Depois de hospedado, todo mundo pode acessar pelo navegador:
- **URL principal**: `https://financas-familia.onrender.com` (página inicial)
- **Painel do app**: `https://financas-familia.onrender.com/app.html`

Cada membro da família cria seu próprio login e senha — exatamente como funciona no desktop!

---

## 🛠️ Comandos Úteis

```bash
# Rodar localmente igual vai rodar no Render
npm run start:server

# Acessar em http://localhost:3000
```

---

## 📦 Estrutura para o Render

```
/
├── render.yaml           ← Configuração automática (Blueprint)
├── server.js             ← Servidor Express (ponto de entrada)
├── package.json          ← Dependências do projeto
└── src/
    └── renderer/         ← Arquivos estáticos (HTML, CSS, JS)
        ├── index.html    ← Página inicial (landing page)
        ├── app.html      ← Aplicativo principal
        ├── app.js        ← Lógica do frontend
        ├── style.css     ← Estilos do app
        └── landing.css   ← Estilos da landing page
```

---

## ❓ Dúvidas Frequentes

**O plano Free é suficiente?**
- Sim! 500 horas/mês. Como o app dorme quando ninguém usa, dá pro mês inteiro de boa.

**Posso usar meu próprio domínio?**
- Sim! Render permite domínio customizado até no plano Free.

**Preciso de cartão de crédito?**
- Sim, o Render pede um cartão para criar a conta (mesmo no Free). É para verificação apenas.

**Quero meus dados seguros (PostgreSQL). Como faz?**
- Fala comigo! Posso preparar a migração do SQLite para PostgreSQL numa próxima etapa.
