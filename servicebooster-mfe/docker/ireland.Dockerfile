# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY . .
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build ireland
RUN pnpm nx build ireland -c production

# ---- runtime ----
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.spa.conf /etc/nginx/conf.d/default.conf

COPY --from=build /repo/dist/apps/angular/ireland /usr/share/nginx/html

EXPOSE 80