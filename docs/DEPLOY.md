# Deploy

The free path is [BOOTSTRAP.md](BOOTSTRAP.md): Vercel Hobby for `apps/web`, Supabase free for `nullifiers`, and the Dockerfiles under `services/` on Cloud Run or Fly if you want the health endpoints.

GitHub Actions in this repo is not a deploy path while the account billing block is in place. `infra/zero-touch.sh` refuses to run so it cannot print a false "deployment complete" banner.

Vercel project settings:

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Node.js: 22.x
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm run build`
