# --- STAGE 1: Build ---
FROM node:20-bullseye AS builder
WORKDIR /app

# Install OpenSSL (needed for Prisma)
RUN apt-get update && apt-get install -y openssl \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client + build app
RUN npx prisma generate
RUN npm run build


# --- STAGE 2: Production ---
FROM node:20-bullseye-slim
WORKDIR /app

# Install ONLY what Prisma needs
RUN apt-get update && apt-get install -y openssl \
 && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m appuser

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

# 🚀 Run migrations THEN start app
CMD ["sh", "-c", "npx prisma migrate deploy && PORT=3000 node dist/main.js"]