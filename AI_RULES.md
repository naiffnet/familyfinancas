# 🤖 AI_RULES.md — Regras Mandatórias de Desenvolvimento Assistido por IA

> **Regras de Ouro e Diretrizes Técnicas para Agentes de IA**  
> Projeto: **FinançasFamília**  
> Documento originado a partir do checklist profissional ([Check-list.pdf](file:///x:/Programas/MEUS%20APPs/app.financeiro/Check-list.pdf)).

---

## 📌 Regra Fundamental
A IA atua como **desenvolvedora assistente**, e **não** como autoridade sobre as regras de negócio do sistema. Toda regra, cálculo financeiro, arquitetura e critérios de aceitação devem seguir estritamente o código existente e a validação do usuário.

---

## 🛡️ As 15 Regras de Ouro Mandatórias

1. **Não alterar regras de negócio sem autorização prévia**:
   - Nunca altere comportamentos financeiros (ex: como o saldo é calculado, como o fechamento de fatura funciona ou como os juros são computados) sem alinhamento explícito.

2. **Não remover funcionalidades existentes**:
   - Módulos, botões, filtros ou fluxos já existentes devem ser preservados e mantidos compatíveis.

3. **Não criar dados fictícios para substituir dados reais**:
   - Nunca insira mocks no lugar de rotas ativas ou substitua dados do banco por arrays estáticos de demonstração.

4. **Não expor secrets, tokens ou senhas**:
   - Chaves criptográficas, senhas e tokens de sessão jamais devem ser expostos em logs, mensagens do frontend ou código-fonte.

5. **Não alterar o banco sem criar migração declarativa**:
   - Qualquer nova coluna ou tabela deve possuir verificação idempotente (`ALTER TABLE ...` protegido ou `CREATE TABLE IF NOT EXISTS`) em `src/database/db-core.js`.

6. **Toda nova funcionalidade deve possuir validação de sintaxe e testes**:
   - Ao adicionar ou alterar código, execute a verificação automatizada com `node -c` em todos os arquivos modificados.

7. **Toda correção deve possuir teste de regressão quando aplicável**:
   - Garanta que a correção de um erro não quebre outros fluxos interdependentes (ex: salvar transação recalcula orçamento e saldo de conta).

8. **Não modificar APIs existentes sem documentar a alteração**:
   - Mantenha a compatibilidade dos contratos de RPC expostos em `window.api` e `src/server/core.js`.

9. **Não adicionar dependências sem justificar**:
   - Evite adicionar pacotes `npm` pesados quando uma solução nativa em JavaScript/Node.js for viável e performática.

10. **Antes de grandes alterações, criar e aprovar um plano**:
    - Para modificações estruturais, apresente o plano de implementação completo ao usuário antes de alterar código.

11. **Informar todos os arquivos modificados**:
    - Ao concluir uma tarefa, liste de forma clara e clicável todos os arquivos alterados e descreva o motivo de cada mudança.

12. **Nunca considerar uma implementação concluída sem validação**:
    - Sempre execute o build do renderer (`npm run build:renderer`) e verifique a integridade do código antes de finalizar.

13. **Em caso de ambiguidade de regra de negócio, parar e perguntar**:
    - Nunca assuma silenciosamente o que deve acontecer em um caso não documentado. Pergunte ao usuário ou registre a pendência.

14. **Preservar compatibilidade com funcionalidades existentes**:
    - As versões Desktop (Electron) e Web (LAN/PWA) compartilham a mesma base de código através do `rpc-bridge.js`. Preserve o funcionamento em ambas.

15. **Priorizar sempre a integridade dos dados e segurança**:
    - Transações atômicas no banco de dados, sanitização de inputs, escape de HTML contra XSS e validação de posse no backend são inegociáveis.
