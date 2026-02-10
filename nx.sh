
# 1. Crear el workspace Nx (vacío “apps” y luego le añadimos Angular)
npx create-nx-workspace@latest . --preset=apps --pm=pnpm

# 2. Añadir soporte Angular a Nx
npx nx add @nx/angular

# 3. Generar el host (App Shell) con 3 remotes (Irlanda/Portugal/Legacy)
# 3a. Creación conjunta
npx nx g @nx/angular:host apps/angular/shell \
  --remotes=ireland,portugal,legacy \
  --dynamic \
  --style=scss

# 3b. Creación separado
npx nx g @nx/angular:host apps/angular/shell --dynamic --style=scss
npx nx g @nx/angular:remote apps/angular/ireland --host=shell --dynamic --style=scss
npx nx g @nx/angular:remote apps/angular/portugal --host=shell --dynamic --style=scss
npx nx g @nx/angular:remote apps/angular/legacy --host=shell --dynamic --style=scss

# Árbol directorios arquetipo
apps/
  angular/
    shell/        <-- host (app shell)
    ireland/      <-- remote
    portugal/     <-- remote
    legacy/       <-- remote (envoltorio del AngularJS 1.4)
libs/
  ...shared ui, auth, api clients, etc.

# Comandos útiles

npx nx graph              # ver dependencias
npx nx serve shell        # levantar host
npx nx serve ireland      # levantar solo un remote
npx nx build shell        # build host
npx nx build ireland      # build remote

npx nx run-many -t serve -p shell ireland portugal legacy # levanta los 4
npx nx run-many -t serve -p shell ireland # levanta shell y un mfe

http://localhost:4200/?mf=none
http://localhost:4200/?mf=ireland
http://localhost:4200/?mf=all
	# Sin remotes (por defecto):
http://localhost:4200/
	# Todos:
http://localhost:4200/?mf=all
	# Solo ireland:
http://localhost:4200/?mf=ireland