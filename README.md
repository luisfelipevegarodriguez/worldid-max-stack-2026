# 🌍 World ID Max Stack 2026

> Human-Verified platform — World ID + Mini Apps + Grants LATAM

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026)

## Stack

- **Framework**: Next.js 14 (App Router)
- **World ID**: IDKit v1.3.2 + MiniKit v1.7.0
- **DB**: Supabase (nullifier antifraude)
- **Deploy**: Vercel + GitHub Actions
- **Chain**: World Chain

## Mini Apps

| App | Descripción | Ruta |
|-----|-------------|------|
| 💸 Payments | Remesas LATAM con WLD | `/mini-apps/payments` |
| 🎁 Grants | Auto-apply grants World Chain | `/mini-apps/grants-latin` |
| 🏆 Viral Rewards | Referidos + Leaderboard LATAM | `/mini-apps/viral-rewards` |

## Setup Rápido

```bash
git clone https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026
npm install
cp .env.example .env   # Rellenar con credenciales reales
npm run dev
```

## Variables de Entorno

Ver [`.env.example`](.env.example) — Credenciales en [developer.world.org](https://developer.world.org)

## Deploy

```bash
npm run build
npx vercel --prod
```

O push a `main` → GitHub Actions despliega automáticamente.

## Grants LATAM

Ver [`docs/GRANTS_STRATEGY.md`](docs/GRANTS_STRATEGY.md) para estrategia completa.

---

**Links:**
- [developer.world.org](https://developer.world.org)
- [World Chain Grants](https://world.org/grants)
- [Mini Apps Docs](https://docs.world.org/mini-apps)
