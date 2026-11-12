# Instrucciones para GitHub Copilot

Mismas reglas que `AGENTS.md` en la raíz (Cursor y el resto de asistentes leen ese archivo). El frontend desplegable es `apps/web`. No actives producción ni cierres el issue #1 desde un script. `infra/zero-touch.sh` sale con código 2 y no despliega.

## Stack

Versiones fijadas en `package.json` (raíz y `apps/web/package.json`), comprobadas en este repo:

- pnpm 10.33.4 (`packageManager`). Node.js >= 22.11.0 (`.node-version` es `22`).
- Workspaces en `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `services/*`. pnpm 10 solo ejecuta los builds listados en `onlyBuiltDependencies` (`prisma`, `@prisma/client`, `@prisma/engines`, `esbuild`, `sharp`).
- `apps/web`: Next.js 16.4.6, React 19, TypeScript strict (`jsx: react-jsx`), Tailwind CSS 3.4, PostCSS, ESLint 9 con `eslint-config-next` 16.4.6. Config plana en `apps/web/eslint.config.mjs`.
- World ID: `@worldcoin/idkit` y `@worldcoin/idkit-core` 4.6.0. El widget es `IDKitRequestWidget` y exige `rp_context`. `POST /api/rp-signature` firma con `signRequest({ signingKeyHex, action })`.
- Prisma 7.10.1 y `@prisma/adapter-pg` 7.10.1. El generador es `prisma-client` y el cliente sale en `apps/web/generated/prisma` (gitignored). La URL no está en el schema: la lee `apps/web/prisma.config.ts`. El cliente de runtime solo se construye si hay `DATABASE_URL`.
- SQL gratuito: `supabase/migrations/001_nullifiers.sql` crea `nullifiers` y activa RLS. Los otros modelos del schema (`User`, `WorldProof`, etc.) no están en ese SQL. No ejecutes `prisma migrate` contra la base gratuita.
- `packages/shared` (`@worldid/shared`) exporta `triggerCriticalAction()` hacia `POST /api/agent/trigger`.
- `services/backend` y `services/growth-agent`: procesos Node en Docker. `GET /healthz` responde 200 sin configuración. El growth agent no llama a un modelo (`ran: false`, `reason: model_disabled`).
- Tests: runner de Node, `tsx --test lib/*.test.ts` dentro de `apps/web` (`config.test.ts`, `proof.test.ts`, `rate-limit.test.ts`).
- Next.js 16 usa `apps/web/proxy.ts` (función `proxy`), no `middleware.ts`. El runtime es Node, no Edge. No hay `vercel.json`.

## Comandos

Desde la raíz. Cada script de la raíz delega con `pnpm --filter web`.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

| Script raíz | Comando real en `apps/web` |
| --- | --- |
| `pnpm lint` | `eslint .` |
| `pnpm typecheck` | `node scripts/prisma-generate.mjs` y después `tsc --noEmit` |
| `pnpm test` | `tsx --test lib/*.test.ts` |
| `pnpm build` | `node scripts/prisma-generate.mjs` y después `next build` |
| `pnpm dev` | `next dev` |
| `pnpm prisma:generate` | `node scripts/prisma-generate.mjs` |

CI y Vercel instalan con `pnpm install --frozen-lockfile`. No hace falta un `.env` para install, lint, typecheck, test ni build: si `DATABASE_URL` está vacío, `apps/web/scripts/prisma-generate.mjs` usa `postgresql://build:build@127.0.0.1:5432/worldid_build` y `prisma generate` no abre conexión.

No lances `next build` a pelo. Se salta `prebuild` y el cliente de Prisma no existe. `next build` tampoco ejecuta ESLint.

Docker, opcional, desde la raíz:

```bash
docker build -f services/backend/Dockerfile services/backend
docker build -f services/growth-agent/Dockerfile services/growth-agent
```

## Estructura

| Ruta | Rol |
| --- | --- |
| `apps/web/app` | App Router. Páginas `/` y `/mini-apps/{payments,grants,rewards}`. Handlers `api/health`, `api/verify`, `api/auth/worldid/verify`, `api/rp-signature`, `api/agent/trigger`, `api/mini-apps/payments`. |
| `apps/web/components` | `WorldIDButton`, `WorldIDGate`. |
| `apps/web/lib` | Config, sesión JWT, prueba World ID, persistencia, rate limit y sus tests. |
| `apps/web/prisma` | Schema. Solo `Nullifier` está cubierto por el SQL gratuito. |
| `packages/shared` | Cliente para que un agente dispare una acción. |
| `services/backend` | `GET /healthz`, `POST /internal/self-heal`. No envuelve Next ni llama a `gcloud`. |
| `services/growth-agent` | `GET /healthz`. `POST /run` no llama a un modelo. |
| `supabase/migrations` | Bootstrap de la base gratuita. |
| `docs/BOOTSTRAP.md` | Deploy gratis. Léelo antes de tocar despliegue. |
| `docs/DEPLOY.md` | Resumen del mismo camino. |
| `docs/UPGRADES.md` | Notas de Next 16, Prisma 7 e IDKit 4. |
| `n8n/workflows` | Webhook de ejemplo. Vacío, `/api/agent/trigger` responde 503. |
| `infra/` | Scripts antiguos. `zero-touch.sh` sale 2. No lo uses para dar un deploy por hecho. |
| `.github/workflows/ci.yml` | Install, lint, typecheck, test y build, con caché de pnpm y concurrency. |
| `.github/workflows/deploy.yml`, `canary.yml` | No son el camino gratis. Actions no arranca: la facturación de la cuenta está bloqueada. |

El alias `@/*` apunta a la raíz de `apps/web`.

## Convenciones

- TypeScript `strict` y ESM (`"type": "module"` en `apps/web`, `packages/shared` y los servicios). La UI está en español (`<html lang="es">`).
- Un valor ausente o un placeholder (`xxxx`, `your_`, `placeholder`, `changeme`, `<...>`) cuenta como no configurado (`isPlaceholder` en `apps/web/lib/config.ts`). Las rutas devuelven JSON 503. No finjas un éxito.
- `ALLOW_LEGACY_PROOFS` se queda en `false` salvo petición explícita.
- Rate limit por defecto: memoria, ventana de 10 minutos, 5 peticiones, tope de 1024 claves. Upstash es opcional y no es requisito.
- No commitees `apps/web/generated/`, `.next/`, `node_modules/` ni cobertura.
- Un PR, un tema. No reformatees archivos ajenos al cambio y no subas dependencias de paso. Las subidas major van en su propio commit; el registro está en `docs/UPGRADES.md`.

## Reglas

- **Vercel Hobby, gratis.** Proyecto personal no comercial. Root Directory `apps/web`, Framework Next.js, Node 22.x, Install `pnpm install --frozen-lockfile`, Build `pnpm run build`, Output vacío. No añadas features de pago ni un `vercel.json` para activarlas.
- **Una región.** No configures varias regiones de funciones. Si alguien despliega los contenedores a mano, una sola región: `europe-west1`, con `--min-instances 0` y `--max-instances 1`.
- **Sin servicios de pago.** No añadas Redis de pago como dependencia del camino feliz, llamadas a OpenAI, claves de GCP, ni productos de Vercel, Supabase o Cloud Run que cobren. Supabase free es la base. El agente de growth no debe llamar a un modelo.
- **Pagos desactivados por defecto.** `POST /api/mini-apps/payments` solo registra un objeto con `status: "recorded"` y `settled: false`. La página lo dice: la liquidación on-chain no está conectada. No cablees `PAYMENT_ROUTER_ADDR`, un firmante ni un procesador de tarjetas salvo que una persona pida activar la liquidación en ese PR.
- **No commitear secretos.** `.gitignore` ignora `.env`, `.env.*` (salvo `.env.example`), `*.pem` y `certs/`. Nada de `WORLD_SIGNING_KEY`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` real, tokens de Vercel ni claves en código, docs, issues o PRs. `.env.example` se queda con valores vacíos.
- **PRs pequeños y verificados.** Antes de abrir o actualizar un PR, ejecuta en la raíz `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. GitHub Actions de esta cuenta no corre por la facturación: un badge verde no es evidencia. No hagas force-push ni borres historial.
