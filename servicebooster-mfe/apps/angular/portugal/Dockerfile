# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /workspace

COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Build del remote Portugal
RUN pnpm nx build portugal --configuration=production

# ---- Runtime ----
FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /workspace/dist/apps/angular/portugal /usr/share/nginx/html

# SPA routing (por si el remote tiene rutas internas)
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