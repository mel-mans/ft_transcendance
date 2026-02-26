# --- STAGE 1: The Build Environment (The Kitchen) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: The Production Image (The Dining Room) ---
FROM node:20-bullseye-slim
WORKDIR /app

# Security: Run as a non-privileged user
RUN apt-get update && apt-get install -y curl openssl && \
    useradd -m devops_user && \
    rm -rf /var/lib/apt/lists/*

# We ONLY copy the specific artifacts we need from the builder
COPY --chown=devops_user:devops_user --from=builder /app/dist ./dist
COPY --chown=devops_user:devops_user --from=builder /app/node_modules ./node_modules
COPY --chown=devops_user:devops_user --from=builder /app/package.json ./package.json
COPY --chown=devops_user:devops_user --from=builder /app/prisma ./prisma

# Change ownership to devops_user


USER devops_user

# The final image HAS NO:
# - npm cache
# - source code (.ts files)
# - compilers or build tools

EXPOSE ${AUTH_SERVICE_PORT}
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main.js"]