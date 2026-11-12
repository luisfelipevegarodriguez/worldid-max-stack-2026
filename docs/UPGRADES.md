# Upgrade notes

Major dependency bumps are separate commits. This file is the breaking-change log for those commits.

## Workspace (Next 14 root removed)

- The repository root is no longer a Next.js 14 application. `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` run `apps/web`.
- `apps/web` starts on Next.js 15.3.9, React 19, IDKit 2.4.2, and Prisma 5.22.0.
- The root IDKit v1 widget (`onSuccess` only) and the unused `@worldcoin/minikit-js` server import are gone. The web app uses IDKit 2.4.2 (`IDKitWidget`, required `onSuccess`, optional `handleVerify`).
- `@worldcoin/human-in-the-loop` was removed. The registry has no 1.x release, and nothing imported it.
- `services/backend` is a Node process with `GET /healthz` and `POST /internal/self-heal`. It does not embed Next.js and it does not shell out to `gcloud`.
- `infra/zero-touch.sh` exits 2. Issue #1 stays open. See `docs/BOOTSTRAP.md`.

## IDKit 2.4.2 → 4.6.0

- `IDKitWidget` and `VerificationLevel` are gone. The button uses `IDKitRequestWidget` with a required `rp_context`, a required `onSuccess`, and `preset={proofOfHuman()}`.
- `rp_context` is required. `POST /api/rp-signature` now calls `signRequest({ signingKeyHex, action })` from `@worldcoin/idkit-core/signing`. The v2 call shape `signRequest(key, body)` does not exist in 2.1.0 or in 4.6.0. The helper returns `{ sig, nonce, createdAt, expiresAt }`.
- Proof payloads are IDKit 4 results (`protocol_version`, `responses[].nullifier`). The verify route forwards that object as-is to `POST /api/v4/verify/{rp_id}`. It no longer expects the IDKit 2 field `nullifier_hash` on the request, though it still accepts it.
- `allow_legacy_proofs` defaults to false unless `ALLOW_LEGACY_PROOFS=true`. `proofOfHuman()` is the World ID 4.0 credential with legacy Orb fallback when that flag is on.

## Prisma 5.22.0 → 6.19.3

No call site in this repo changed. `new PrismaClient()` and `import { PrismaClient } from '@prisma/client'` still work, and `url = env("DATABASE_URL")` stays in the schema. The breaks below still apply the next time someone migrates a database that used Prisma 5:

- Minimum Node.js is 20.9.0 or 22.11.0. This repo requires Node 22.
- Minimum TypeScript is 5.1.0.
- PostgreSQL implicit many-to-many relation tables change their unique index into a primary key. This schema has only explicit one-to-many relations, so there is no relation-table migration to generate. If you add an implicit m-n later, create a dedicated migration after the upgrade.
- `Bytes` fields are `Uint8Array`, not `Buffer`. This schema has none.
- `NotFoundError` is removed. Use `PrismaClientKnownRequestError` with code `P2025`. This code does not catch that error.
- PostgreSQL full-text search preview flag `fullTextSearch` is renamed `fullTextSearchPostgres`. This schema does not enable it.
- Model names `async`, `await`, and `using` are reserved. None of ours use them.
