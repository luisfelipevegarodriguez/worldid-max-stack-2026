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
