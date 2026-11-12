# Upgrade notes

Major dependency bumps are separate commits. This file is the breaking-change log for those commits.

## Workspace (Next 14 root removed)

- The repository root is no longer a Next.js 14 application. `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` run `apps/web`.
- `apps/web` starts on Next.js 15.3.9, React 19, IDKit 2.4.2, and Prisma 5.22.0.
- The root IDKit v1 widget (`onSuccess` only) and the unused `@worldcoin/minikit-js` server import are gone. The web app uses IDKit 2.4.2 (`IDKitWidget`, required `onSuccess`, optional `handleVerify`).
- `@worldcoin/human-in-the-loop` was removed. The registry has no 1.x release, and nothing imported it.
- `services/backend` is a Node process with `GET /healthz` and `POST /internal/self-heal`. It does not embed Next.js and it does not shell out to `gcloud`.
- `infra/zero-touch.sh` exits 2. Issue #1 stays open. See `docs/BOOTSTRAP.md`.
