# --- STAGE 1: The Build Environment (The Kitchen) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- STAGE 2: The Production Image (The Dining Room) ---
FROM node:20-bullseye-slim
WORKDIR /app

# Security: Run as a non-privileged user
RUN apt-get update && apt-get install -y curl && \
    useradd -m devops_user

    
    # We ONLY copy the specific artifacts we need from the builder
COPY --chown=devops_user:devops_user --from=builder /app/dist ./dist
COPY --chown=devops_user:devops_user --from=builder /app/node_modules ./node_modules
COPY --chown=devops_user:devops_user --from=builder /app/package.json ./package.json
    
USER devops_user
# The final image HAS NO:
# - npm cache
# - source code (.ts files)
# - compilers or build tools

EXPOSE ${CHAT_SERVICE_PORT}
CMD ["node", "dist/main.js"]