# Free bootstrap (Vercel Hobby + Supabase)

This is the production plan for the umbrella app. It does not close [issue #1](https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026/issues/1). That issue asked for a zero-touch activation that pushed Docker images through GitHub Actions, deployed a canary on Cloud Run, and printed a "WORLD MAX STACK — ACTIVO" block. That path cannot run here:

- GitHub Actions on this account is blocked by billing, so `ci.yml`, `deploy.yml`, and `canary.yml` never start.
- The old script also expected a GCP service account, a deployer private key, and an OpenAI key. Those are not part of the free tier and must not be committed.

Issue #1 stays open until a person finishes the steps below and comments with the real Vercel URL, the Supabase project ref, and (if used) the Cloud Run or Fly URLs. Do not paste a success block from `infra/zero-touch.sh`. That script exits with an error on purpose.

## 1. World ID app

1. Create an app at [developer.world.org](https://developer.world.org).
2. Copy `app_id`, `rp_id`, and the RP signing key.
3. Add the action ids this app requests: `login`, `mini-app-payment`, `apply-grant-latam`, `claim-viral-reward`, `human-verified-agent-2026`.
4. Add the verify redirect you actually use. The app posts proofs to its own `/api/verify` and `/api/auth/worldid/verify` routes.

The signing key is server-only (`WORLD_SIGNING_KEY`). `POST /api/rp-signature` calls `signRequest({ signingKeyHex, action })` and returns the nonce, timestamps, and signature the widget needs as `rp_context`. If the key or `WORLD_RP_ID` is empty, that route returns 503 `signing_unconfigured` and the widget stays closed. Proof verification posts the IDKit result unchanged to `POST https://developer.world.org/api/v4/verify/{rp_id}`.

## 2. Supabase (free)

1. Create a free project at [supabase.com](https://supabase.com). Free projects pause after inactivity. That is expected.
2. Open the SQL editor and run [`supabase/migrations/001_nullifiers.sql`](../supabase/migrations/001_nullifiers.sql). This creates `nullifiers` and turns on RLS so the anon key cannot read or write it.
3. Copy the Postgres URI into `DATABASE_URL` (Project Settings → Database). The pooler URI (port 6543) is the right one for the Vercel runtime. Copy the direct URI (port 5432) only if you later run `prisma migrate`.
4. Copy the project URL and service role key into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` if you want the REST fallback. The service role bypasses RLS. Do not put it in `NEXT_PUBLIC_*`.

The Prisma schema maps `Nullifier` onto that table. Other Prisma models (`User`, `WorldProof`, and the rest) are not created by the SQL file. Do not run `prisma migrate` against the free database unless you intend to add those tables. `prisma generate` does not connect and is part of `pnpm build`.

Either `DATABASE_URL` or the Supabase REST pair is enough for the verify route to store a nullifier. With neither, a successful World ID check returns `persisted: false` instead of failing the build.

## 3. Vercel Hobby

Hobby is for non-commercial personal projects. Create a project from this GitHub repo and set:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | Next.js |
| Node.js Version | 22.x |
| Install Command | `pnpm install --frozen-lockfile` (runs from the repository root; Vercel walks up to `pnpm-lock.yaml`) |
| Build Command | `pnpm run build` |
| Output Directory | leave empty (Next.js default) |

Override the build command. The framework default `next build` skips `prebuild`, so the Prisma client would be missing. `pnpm run build` generates the client with a dummy URL when `DATABASE_URL` is empty, then runs `next build`.

Environment variables (Production and Preview). Empty values are valid; the routes degrade.

| Name | Required to build | Required for full verify |
| --- | --- | --- |
| `NEXT_PUBLIC_WORLD_APP_ID` | no | yes, or the widget stays hidden |
| `NEXT_PUBLIC_WORLD_ENVIRONMENT` | no | `production` when you go live |
| `NEXT_PUBLIC_APP_URL` | no | the deployed `https://….vercel.app` origin |
| `WORLD_RP_ID` | no | yes |
| `WORLD_SIGNING_KEY` | no | yes, for `/api/rp-signature` and the widget |
| `JWT_SECRET` | no | yes, for session JWT and `/api/agent/trigger` |
| `DATABASE_URL` or `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | no | one of the two, to persist nullifiers |
| `ALLOW_LEGACY_PROOFS` | no | `false` unless you still accept legacy proofs |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | no | no; memory window is the free default |
| `N8N_WEBHOOK_URL` | no | only if an orchestrator should receive agent actions |

Do not add `GCP_SA_KEY`, `DEPLOYER_PK`, or `OPENAI_API_KEY` to the frontend project.

After deploy, `GET /api/health` returns which of those groups are set, without echoing the values.

## 4. Containers (optional)

The Dockerfiles build with no secrets and no network install. Cloud Run's free tier scales to zero when min instances is 0. Fly.io's free allowance is the other option. GitHub Actions will not build these images while billing is blocked, so deploy them by hand.

```bash
docker build -t world-backend -f services/backend/Dockerfile services/backend
docker build -t growth-agent -f services/growth-agent/Dockerfile services/growth-agent
```

Cloud Run (min instances must stay 0):

```bash
gcloud run deploy world-backend --image world-backend --region europe-west1 \
  --allow-unauthenticated --min-instances 0 --max-instances 1 --port 8080
gcloud run deploy growth-agent --image growth-agent --region europe-west1 \
  --allow-unauthenticated --min-instances 0 --max-instances 1 --port 8080
```

Push the image to Artifact Registry yourself first, or use `gcloud run deploy --source services/backend`, which builds the Dockerfile in that directory. Set `CRON_SECRET` on the backend only if you will call `POST /internal/self-heal`. The container does not roll back Cloud Run revisions and does not shell out to `gcloud`.

`GET /healthz` on both images returns 200 with no configuration. The growth agent returns 503 from `POST /run` until `OPENAI_API_KEY` is set, and even then it does not call a model (`ran: false`). Wiring a model is out of scope for the free bootstrap.

## 5. What "done" means for issue #1

Comment on the issue with:

- Vercel production URL
- Supabase project ref (not the service role key)
- `GET /api/health` body
- Container URLs, or an explicit "not deployed"

Until that comment exists, the issue stays open.
