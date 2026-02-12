# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY . .
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build portugal
RUN pnpm nx build portugal -c production

# ---- runtime ----
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.spa.conf /etc/nginx/conf.d/default.conf

COPY --from=build /repo/dist/apps/angular/portugal /usr/share/nginx/html

EXPOSE 80