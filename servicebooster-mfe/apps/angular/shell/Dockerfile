# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /workspace

# Copiamos manifest de dependencias primero para cachear
COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

# pnpm (si tu repo usa pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Build del shell
RUN pnpm nx build shell --configuration=production

# ---- Runtime ----
FROM nginx:1.27-alpine

# SPA routing
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /workspace/dist/apps/angular/shell /usr/share/nginx/html

# Nginx config para SPA (try_files)
RUN printf "server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  location / {\n\
    try_files \$uri \$uri/ /index.html;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80