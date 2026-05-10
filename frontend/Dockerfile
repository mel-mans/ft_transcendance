# --- STAGE 1: Build React app ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# --- STAGE 2: Serve static app with Node ---
FROM node:20-bullseye-slim
WORKDIR /app

COPY --from=builder /app/dist /app/dist

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm install -g serve

EXPOSE 3000

# Railway sets PORT env var automatically
CMD ["serve", "-s", "/app/dist", "-l", "tcp://0.0.0.0:${PORT:-3000}"]
