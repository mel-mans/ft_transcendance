# --- STAGE 1: Build React app ---
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# --- STAGE 2: Serve app with nginx ---
FROM nginx:alpine
# Copy build output to nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if you have routing needs (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3003

CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]
