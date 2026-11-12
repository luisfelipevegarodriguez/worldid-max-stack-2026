# Do not run the old zero-touch flow

`bash infra/zero-touch.sh` exits 2. It does not deploy, and it must not be used to close GitHub issue #1.

The free bootstrap is [docs/BOOTSTRAP.md](docs/BOOTSTRAP.md):

1. Create a World ID app and keep the signing key off git.
2. Create a Supabase free project and run `supabase/migrations/001_nullifiers.sql`.
3. Import the repo in Vercel Hobby with root directory `apps/web`, framework Next.js, and build command `pnpm run build`.
4. Optionally `docker build` `services/backend` and `services/growth-agent` and run them on Cloud Run (min instances 0) or Fly.

GitHub Actions cannot start while the account billing block is in place. Verify with `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` on a machine, not in Actions.
