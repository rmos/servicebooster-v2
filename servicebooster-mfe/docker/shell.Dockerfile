# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY . .
RUN corepack enable
ENV CI=true
RUN pnpm install --frozen-lockfile

# Build shell
RUN pnpm nx build shell -c production

# ---- runtime ----
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf

# Ajusta esta ruta si tu dist difiere
COPY --from=build /repo/dist/apps/angular/shell /usr/share/nginx/html

EXPOSE 80