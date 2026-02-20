# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

ARG APP_NAME
ARG VERSION
ARG GIT_SHA

LABEL org.opencontainers.image.title="${APP_NAME}"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${GIT_SHA}"

COPY . .
RUN corepack enable
ENV CI=true
ENV NX_NO_CLOUD=true
ENV NX_DAEMON=false
RUN pnpm install --frozen-lockfile

# Build legacy
RUN pnpm nx build legacy -c production --skip-nx-cache

# ---- runtime ----
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/dist/apps/angular/legacy /usr/share/nginx/html/v2

EXPOSE 80