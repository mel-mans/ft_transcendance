FROM owasp/modsecurity-crs:nginx

COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
