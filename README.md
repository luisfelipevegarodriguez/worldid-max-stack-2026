# worldid-max-stack-2026

**Human-Verified AI Agent Platform** — World ID 4.0 · n8n · AgentKit · Zoom/DocuSign · Vercel

## Stack
- **Frontend**: Next.js 15 App Router + `@worldcoin/idkit`
- **Backend**: Vercel Edge API Routes (RP Signature + Verify v4)
- **Orchestration**: n8n on Cloud Run
- **Agents**: AgentKit + `@worldcoin/human-in-the-loop`
- **DB**: Prisma + PostgreSQL (Supabase/Neon)
- **Secrets**: Vercel Env + Google Secret Manager
- **CI/CD**: GitHub Actions + Turborepo

## Grants targets
- 🏆 **Retro Mini Apps** — $1M WLD pool · Deadline 9 Jun 2026
- 🌐 **World Foundation Grants** — Rolling · AI agents + enterprise

## Quick start
```bash
git clone https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026
cd worldid-max-stack-2026
pnpm install
pnpm dev
```

## Env vars required
See `.env.example`.
