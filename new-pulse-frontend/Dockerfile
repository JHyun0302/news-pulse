# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /workspace

COPY new-pulse-frontend/package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY new-pulse-frontend/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/front/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run

ENV BACKEND_HOST=backend \
    BACKEND_PORT=8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/healthz >/dev/null || exit 1
