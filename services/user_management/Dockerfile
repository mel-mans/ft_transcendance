# --- STAGE 1: The Build Environment (The Kitchen) ---
FROM node:20-slim AS builder
WORKDIR /app
<<<<<<< HEAD
COPY package*.json ./
RUN npm install
COPY . .
=======

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
>>>>>>> 8a306b6d (adding some new endpoints)
RUN npm run build

# --- STAGE 2: The Production Image (The Dining Room) ---
FROM node:20-slim
WORKDIR /app

# Security: Run as a non-privileged user
<<<<<<< HEAD
RUN apt-get update && apt-get install -y curl
RUN useradd -m devops_user
USER devops_user
=======
RUN apt-get update && apt-get install -y curl openssl
RUN useradd -m devops_user
>>>>>>> 8a306b6d (adding some new endpoints)

# We ONLY copy the specific artifacts we need from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
<<<<<<< HEAD

# The final image HAS NO:
# - npm cache
# - source code (.ts files)
# - compilers or build tools

EXPOSE ${USER_SERVICE_PORT}
CMD ["node", "dist/main.js"]
=======
COPY --from=builder /app/prisma ./prisma

# Change ownership to devops_user
RUN chown -R devops_user:devops_user /app

USER devops_user

EXPOSE ${USER_SERVICE_PORT}
CMD ["sh", "-c", "npx prisma generate && node dist/main.js"]
>>>>>>> 8a306b6d (adding some new endpoints)
