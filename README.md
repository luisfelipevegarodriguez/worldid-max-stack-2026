# World ID Max Stack 2026

Umbrella app for Luis: World ID mini apps (payments, grants, rewards), nullifier storage, and a human-verified agent handoff. The deployable frontend is `apps/web`. `services/backend` and `services/growth-agent` are small Docker images for a free container tier.

GitHub Actions on this account does not run (billing). Install, lint, type-check, test, and build locally. Do not treat a green badge as evidence.

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm dev` starts `apps/web`. The build generates the Prisma client with a local dummy `DATABASE_URL` when none is set, and it does not connect to a database. Empty env vars are enough.

Docker, from the repo root:

```bash
docker build -f services/backend/Dockerfile services/backend
docker build -f services/growth-agent/Dockerfile services/growth-agent
```

## Layout

| Path | Role |
| --- | --- |
| `apps/web` | Next.js app. Vercel project root. |
| `packages/shared` | `triggerCriticalAction()` for agents. |
| `services/backend` | `GET /healthz`, `POST /internal/self-heal`. |
| `services/growth-agent` | `GET /healthz`. Does not call a model. |
| `supabase/migrations/001_nullifiers.sql` | Free-tier database bootstrap. |

Pinned versions live in `apps/web/package.json`.

## Deploy

Free path: [docs/BOOTSTRAP.md](docs/BOOTSTRAP.md). [Issue #1](https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026/issues/1) stays open until someone completes that checklist with real credentials and pastes the resulting URLs. `infra/zero-touch.sh` does not activate production.

## Environment

See [.env.example](.env.example). Missing server secrets degrade to JSON 503s. They are not required to build.
