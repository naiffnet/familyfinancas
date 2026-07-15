# Dockerfile para implantação no Fly.io / VPS
FROM node:20-slim AS builder

# Instala ferramentas necessárias para compilar dependências nativas (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os arquivos de pacotes
COPY package*.json ./

# Instala APENAS dependências de produção (ignora o Electron do devDependencies)
RUN npm ci --omit=dev

# --- Estágio Final ---
FROM node:20-slim

WORKDIR /app

# Copia os node_modules compilados no estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copia o arquivo do servidor e a pasta src (contém o banco de dados e o frontend em src/renderer)
COPY server.js ./
COPY src/ ./src/

# Configura porta padrão
EXPOSE 3000

# Variáveis de ambiente de produção padrão
ENV NODE_ENV=production
ENV PORT=3000

# Inicia o servidor stand-alone
CMD ["node", "server.js"]
