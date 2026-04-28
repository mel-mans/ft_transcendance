# --- STAGE 1: Build ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 1. Copy lockfile too for deterministic, cached installs
COPY services/listings/package*.json ./
COPY ./prisma ./prisma/

# 2. Install prod deps in a separate layer, then all deps for build
RUN npm install --ignore-scripts
RUN npx prisma generate

COPY services/listings/. ./
RUN npm run build

# 3. Prune dev dependencies so we only carry prod deps forward
RUN npm prune --omit=dev

# --- STAGE 2: Production ---
FROM node:20-bullseye-slim
WORKDIR /app

# Combine all apt + user setup into a single layer
RUN apt-get update && apt-get install -y --no-install-recommends curl openssl && \
    rm -rf /var/lib/apt/lists/* && \
    useradd --no-log-init -m devops_user && \
    mkdir -p /app/uploads/listings && \
    chown -R devops_user:devops_user /app

# Copy only what's needed — single COPY per logical group
COPY --chown=devops_user:devops_user --from=builder /app/dist ./dist
COPY --chown=devops_user:devops_user --from=builder /app/node_modules ./node_modules
COPY --chown=devops_user:devops_user --from=builder /app/package.json ./
COPY --chown=devops_user:devops_user --from=builder /app/prisma ./prisma

USER devops_user

ENV NODE_ENV=production

EXPOSE ${LISTINGS_SERVICE_PORT}

# 4. Avoid npx overhead — call binaries directly & skip unnecessary prisma generate
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main.js"]