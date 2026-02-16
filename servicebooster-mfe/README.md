# 📦 Service Booster V2 – Contrato de Publicación (Microfrontends)

## 1️⃣ Arquitectura general

La solución V2 está compuesta por contenedores independientes:

- Shell
- Remote Ireland
- Remote Portugal

Cada uno se publica como imagen Docker independiente y puede desplegarse sin afectar al resto.

El enrutado se realiza por path bajo el mismo dominio.

---

# 🌐 2️⃣ Rutas oficiales en Producción

Dominio base:

https://spade.bankinter.bk

## Shell
Ruta:
/v2/
Ejemplo:
https://spade.bankinter.bk/v2/?mf=all
---

## Remote Ireland
Ruta:
/v2/ireland/
Archivo critico:
/v2/ireland/remoteEntry.mjs
---

## Remote Portugal
Ruta:
/v2/portugal/
Archivo crítico:
/v2/portugal/remoteEntry.mjs
---

# 🔁 3️⃣ Reglas de Reverse Proxy / Ingress

⚠ IMPORTANTE: No realizar reescritura (strip-prefix) de las rutas.

Las rutas deben preservarse completas.

## Reglas necesarias:

| Path | Backend |
|------|---------|
| /v2/ | Servicio Shell |
| /v2/ireland/ | Servicio Ireland |
| /v2/portugal/ | Servicio Portugal |

No debe hacerse:
- Rewrite de `/v2/ireland` → `/`
- Strip prefix
- Modificación de rutas internas

La aplicación está construida con `baseHref` y `deployUrl` explícitos.

---

# 🧪 4️⃣ Validaciones obligatorias tras despliegue

## Shell
GET /v2/ → 200
## Ireland
GET /v2/ireland/remoteEntry.mjs → 200
## Portugal
GET /v2/portugal/remoteEntry.mjs → 200
---

# 🧠 5️⃣ Funcionamiento interno (Module Federation)

El Shell carga dinámicamente los remotes mediante:
/v2/assets/module-federation.manifest.prod.json
Contenido esperado:

```json
{
  "ireland": "/v2/ireland/remoteEntry.mjs",
  "portugal": "/v2/portugal/remoteEntry.mjs"
}
✅ 10️⃣ Resultado esperado
---

---

# 🧭 Diagrama de Arquitectura

## Opción 1 – Diagrama simple (ASCII)

```md
                        ┌─────────────────────────────┐
                        │  https://spade.bankinter.bk │
                        └───────────────┬─────────────┘
                                        │
                                Reverse Proxy / Ingress
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
   /v2/ (Shell)                 /v2/ireland/                    /v2/portugal/
        │                               │                               │
   sb-shell container            mf-ireland container            mf-portugal container
        │                               │                               │
   index.html                      remoteEntry.mjs                remoteEntry.mjs
        │
   Carga dinámica de remotes
