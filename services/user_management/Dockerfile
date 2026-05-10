# --- STAGE 1: The Build Environment (The Kitchen) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files from current context (user_management folder)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . ./
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: The Production Image (The Dining Room) ---
FROM node:20-bullseye-slim
WORKDIR /app

# Security: Run as a non-privileged user
RUN apt-get update && apt-get install -y curl openssl && \
    useradd -m devops_user && \
    rm -rf /var/lib/apt/lists/*

# Create upload directories with proper ownership BEFORE switching user
RUN mkdir -p /app/uploads/avatars && \
    chown -R devops_user:devops_user /app/uploads

# We ONLY copy the specific artifacts we need from the builder
COPY --chown=devops_user:devops_user --from=builder /app/dist ./dist
COPY --chown=devops_user:devops_user --from=builder /app/node_modules ./node_modules
COPY --chown=devops_user:devops_user --from=builder /app/package.json ./package.json
COPY --chown=devops_user:devops_user --from=builder /app/prisma ./prisma

USER devops_user

# The final image HAS NO:
# - npm cache
# - source code (.ts files)
# - compilers or build tools

EXPOSE 3001

# Database migrations + start app
# PORT can be overridden by Railway or other container orchestration
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
