#!/usr/bin/env bash
# Single-shot, idempotente, auto-curativo
# Uso: bash infra/zero-touch.sh
set -euo pipefail

############ 0. Auto-instalar deps faltantes ############
need() { command -v "$1" >/dev/null || eval "$2"; }
need gh      'curl -sS https://webi.sh/gh | sh'
need vercel  'npm i -g vercel'
need forge   'curl -L https://foundry.paradigm.xyz | bash && foundryup'
need jq      'sudo apt-get -y install jq 2>/dev/null || brew install jq'

############ 1. Recoger secrets UNA vez ############
SECRETS=( DATABASE_URL BACKEND_JWT_SECRET WORLD_ID_APP_SECRET WORLD_CHAIN_RPC_URL
          VERCEL_TOKEN GH_TOKEN GCP_SA_KEY OPENAI_API_KEY CRON_SECRET DEPLOYER_PK
          TREASURY NEXT_PUBLIC_WORLD_ID_APP_ID NEXT_PUBLIC_APP_URL GCP_PROJECT )
ENVF=$(mktemp); trap "shred -u $ENVF 2>/dev/null || rm -f $ENVF" EXIT
for K in "${SECRETS[@]}"; do
  V="${!K:-}"
  [[ -z "$V" ]] && read -rsp "  $K: " V && echo
  echo "$K=$V" >> "$ENVF"
done
set -a; source "$ENVF"; set +a

############ 2. Auth no interactivo ############
echo "$GCP_SA_KEY" | gcloud auth activate-service-account --key-file=/dev/stdin
gcloud config set project "$GCP_PROJECT"
echo "$GH_TOKEN" | gh auth login --with-token

############ 3. Push secrets a los 3 stores (idempotente) ############
echo "▶ Cargando secrets en GitHub Actions..."
for K in "${SECRETS[@]}"; do
  gh secret set "$K" --body "${!K}" --repo luisfelipevegarodriguez/worldid-max-stack-2026 >/dev/null
done

echo "▶ Cargando secrets en Vercel..."
for K in NEXT_PUBLIC_WORLD_ID_APP_ID NEXT_PUBLIC_APP_URL WORLD_ID_APP_SECRET \
         WORLD_CHAIN_RPC_URL BACKEND_JWT_SECRET DATABASE_URL; do
  printf '%s' "${!K}" | vercel env rm  "$K" production --token "$VERCEL_TOKEN" --yes 2>/dev/null || true
  printf '%s' "${!K}" | vercel env add "$K" production --token "$VERCEL_TOKEN" --yes
done

echo "▶ Cargando secrets en GCP Secret Manager..."
for K in WORLD_ID_APP_SECRET BACKEND_JWT_SECRET DEPLOYER_PK OPENAI_API_KEY CRON_SECRET; do
  printf '%s' "${!K}" | gcloud secrets create "$K" --data-file=- 2>/dev/null \
    || printf '%s' "${!K}" | gcloud secrets versions add "$K" --data-file=-
done

############ 4. Deploy on-chain PaymentRouter (CREATE2 idempotente) ############
echo "▶ Desplegando PaymentRouter en World Chain..."
forge script script/DeployPaymentRouter.s.sol \
  --rpc-url "$WORLD_CHAIN_RPC_URL" --private-key "$DEPLOYER_PK" \
  --broadcast --verify --json 2>&1 | tee /tmp/forge-deploy.log
ROUTER=$(cat broadcast/DeployPaymentRouter.s.sol/480/run-latest.json \
  | jq -r '.transactions[0].contractAddress')
printf '%s' "$ROUTER" | gcloud secrets create PAYMENT_ROUTER_ADDR --data-file=- 2>/dev/null \
  || printf '%s' "$ROUTER" | gcloud secrets versions add PAYMENT_ROUTER_ADDR --data-file=-
echo "  PaymentRouter: $ROUTER"

############ 5. Push → dispara canary.yml en CI ############
echo "▶ Push de código → canary.yml..."
git add -A
git -c user.email=ci@zero-touch.local commit -m "chore: zero-touch activation $(date -u +%FT%TZ)" || true
git push origin main

############ 6. Espera CI verde ############
echo "▶ Esperando GitHub Actions..."
gh run watch --exit-status

############ 7. Health checks con retry ############
echo "▶ Health checks..."
BACKEND=$(gcloud run services describe world-backend  --region=europe-west1 --format='value(status.url)')
GROWTH=$( gcloud run services describe growth-agent  --region=europe-west1 --format='value(status.url)')
FRONT=$(vercel ls --prod --token "$VERCEL_TOKEN" | awk 'NR==2{print $2}')
for U in "$BACKEND/healthz" "$GROWTH/healthz" "https://$FRONT/api/analytics/full"; do
  curl -fsS --retry 12 --retry-delay 5 "$U" >/dev/null && echo "  ✅ $U" || echo "  ❌ $U"
done

############ 8. Cloud Scheduler self-heal (idempotente) ############
echo "▶ Registrando Cloud Scheduler self-heal..."
gcloud scheduler jobs create http self-heal \
  --location=europe-west1 \
  --schedule="*/5 * * * *" \
  --uri="$BACKEND/internal/self-heal" \
  --oidc-service-account-email="ci@${GCP_PROJECT}.iam.gserviceaccount.com" \
  --headers="X-Cron-Secret=$CRON_SECRET" 2>/dev/null \
  || echo "  (scheduler ya existe, omitido)"

############ 9. Output final ############
cat <<EOF
==================================================
 WORLD MAX STACK — ACTIVO $(date -u +%FT%TZ)
 PaymentRouter : $ROUTER
 Backend URL   : $BACKEND
 Growth Agent  : $GROWTH
 Frontend URL  : https://$FRONT
 Siguiente paso: https://developer.world.org/apps  (submit manual)
==================================================
EOF
