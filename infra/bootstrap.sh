#!/bin/bash
set -euo pipefail

# ── BOOTSTRAP: Crea estructura de proyecto desde cero ─────────────────────────
echo "🏗️  Bootstrap — World Max Stack 2026"

# Directorios base
mkdir -p apps/world-miniapp/src/{app,components,lib}
mkdir -p services/backend/src/{routes,middleware}
mkdir -p services/growth-agent/src
mkdir -p contracts/world-chain/scripts
mkdir -p infra
mkdir -p .github/workflows

# .env.example
cat > .env.example << 'EOF'
# ── World ID ──────────────────────────────────────────
NEXT_PUBLIC_WLD_APP_ID=app_XXXXXXXXXX
WORLD_ID_APP_SECRET=XXXXXXXXXX

# ── Base de datos ─────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/db

# ── Auth ──────────────────────────────────────────────
NEXTAUTH_SECRET=XXXXXXXXXX
NEXTAUTH_URL=https://your-domain.vercel.app

# ── Vercel ────────────────────────────────────────────
VERCEL_TOKEN=XXXXXXXXXX

# ── Google Cloud ──────────────────────────────────────
GCP_PROJECT_ID=XXXXXXXXXX
GCP_SA_KEY=<base64-encoded-service-account-json>
EOF

# GitHub Actions CI/CD
cat > .github/workflows/deploy.yml << 'EOF'
name: Zero-Touch Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          GCP_SA_KEY: ${{ secrets.GCP_SA_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          WORLD_ID_APP_SECRET: ${{ secrets.WORLD_ID_APP_SECRET }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        run: bash infra/zero-touch.sh
EOF

echo "✅ Estructura creada. Revisa .env.example y carga los secrets en GitHub:"
echo "   👉 https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026/settings/secrets/actions"
