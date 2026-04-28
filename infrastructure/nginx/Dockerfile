# FIX #9: Install curl so the docker-compose healthcheck works
FROM nginx:trixie-perl

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# FIX #8: CMD lives here in the Dockerfile (removed entrypoint override from docker-compose)
CMD ["nginx", "-g", "daemon off;"]
