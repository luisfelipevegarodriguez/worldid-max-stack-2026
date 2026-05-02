#!/bin/bash
set -euo pipefail

echo "🚀 Iniciando World Max Stack Zero-Touch Deployment..."
echo "================================================="
echo "Repo: worldid-max-stack-2026"
echo "User: luisfelipevegarodriguez"
echo "Fecha: $(date)"
echo "================================================="

# ── 1. VERIFICAR HERRAMIENTAS ────────────────────────────────────────────────
echo "[1/6] Verificando herramientas..."
command -v gh       >/dev/null 2>&1 || { echo "Instalando gh CLI..."; brew install gh 2>/dev/null || sudo apt install gh -y; }
command -v vercel   >/dev/null 2>&1 || npm install -g vercel
command -v gcloud   >/dev/null 2>&1 || { echo "❌ Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install"; exit 1; }
command -v npx      >/dev/null 2>&1 || { echo "❌ Node.js requerido: https://nodejs.org"; exit 1; }
echo "✅ Herramientas OK"

# ── 2. AUTENTICACIÓN ─────────────────────────────────────────────────────────
echo "[2/6] Autenticando servicios..."
if [ -n "${GCP_SA_KEY:-}" ]; then
  gcloud auth activate-service-account --key-file=<(echo "$GCP_SA_KEY" | base64 -d)
  echo "✅ GCP autenticado"
else
  echo "⚠️  GCP_SA_KEY no definido — saltando auth GCP"
fi

if [ -n "${VERCEL_TOKEN:-}" ]; then
  echo "✅ VERCEL_TOKEN presente"
else
  echo "❌ VERCEL_TOKEN no definido"; exit 1
fi

# ── 3. DEPLOY CONTRATOS WORLD CHAIN ─────────────────────────────────────────
echo "[3/6] Desplegando contratos en World Chain..."
if [ -d "contracts/world-chain" ]; then
  cd contracts/world-chain
  npm install --silent
  npx hardhat run scripts/deploy.ts --network worldchain
  cd ../..
  echo "✅ Contratos desplegados"
else
  echo "⚠️  Directorio contracts/world-chain no encontrado — saltando"
fi

# ── 4. DEPLOY BACKEND (Cloud Run) ────────────────────────────────────────────
echo "[4/6] Desplegando Backend a Cloud Run..."
if [ -d "services/backend" ]; then
  cd services/backend
  gcloud run deploy world-backend \
    --source . \
    --region europe-west1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="DATABASE_URL=${DATABASE_URL:-},WORLD_ID_APP_SECRET=${WORLD_ID_APP_SECRET:-},NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-}" \
    --quiet
  BACKEND_URL=$(gcloud run services describe world-backend --region europe-west1 --format 'value(status.url)')
  echo "✅ Backend activo: $BACKEND_URL"
  cd ../..
else
  echo "⚠️  Directorio services/backend no encontrado — saltando"
fi

# ── 5. DEPLOY FRONTEND (Vercel) ──────────────────────────────────────────────
echo "[5/6] Desplegando Frontend a Vercel..."
if [ -d "apps/world-miniapp" ]; then
  cd apps/world-miniapp
  vercel --prod --token="$VERCEL_TOKEN" --yes
  echo "✅ Frontend desplegado en Vercel"
  cd ../..
else
  echo "⚠️  Directorio apps/world-miniapp no encontrado — saltando"
fi

# ── 6. DEPLOY GROWTH AGENT ───────────────────────────────────────────────────
echo "[6/6] Desplegando Growth Agent..."
if [ -d "services/growth-agent" ]; then
  cd services/growth-agent
  gcloud run deploy growth-agent \
    --source . \
    --region europe-west1 \
    --platform managed \
    --no-allow-unauthenticated \
    --quiet
  AGENT_URL=$(gcloud run services describe growth-agent --region europe-west1 --format 'value(status.url)')
  echo "✅ Growth Agent activo: $AGENT_URL"
  cd ../..
else
  echo "⚠️  Directorio services/growth-agent no encontrado — saltando"
fi

echo ""
echo "=================================================="
echo "  ✅ WORLD MAX STACK — DEPLOYMENT COMPLETO"
echo "=================================================="
echo "  🌐 Frontend:     Vercel Dashboard"
echo "  ⚙️  Backend:      Cloud Run europe-west1"
echo "  🤖 Agent:        Cloud Run (auth requerida)"
echo "  📋 Siguiente:    https://developer.world.org/mini-apps"
echo "=================================================="
