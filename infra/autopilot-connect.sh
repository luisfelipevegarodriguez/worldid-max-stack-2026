#!/bin/bash
# Diagnóstico completo — ejecuta y pega el JSON resultante
set -euo pipefail
OUT="status-$(date +%Y%m%d-%H%M).json"

echo "▶ 1/6 GitHub Actions..."
GH_RUN=$(gh run list --workflow=canary.yml --limit 1 --json status,conclusion,url,createdAt)
echo $GH_RUN | jq . > /tmp/gh_run.json

echo "▶ 2/6 Vercel deployments..."
VERCEL_URL=$(vercel ls --prod 2>/dev/null | awk 'NR==2{print $2}' || echo "NOT_FOUND")

echo "▶ 3/6 Cloud Run..."
BACKEND_URL=$(gcloud run services describe world-backend \
  --region=europe-west1 --format="value(status.url)" 2>/dev/null || echo "NOT_DEPLOYED")
AGENT_URL=$(gcloud run services describe growth-agent \
  --region=europe-west1 --format="value(status.url)" 2>/dev/null || echo "NOT_DEPLOYED")
TRAFFIC=$(gcloud run services describe world-backend \
  --region=europe-west1 --format="value(status.traffic)" 2>/dev/null || echo "N/A")

echo "▶ 4/6 Health checks..."
FE_STATUS=$(curl -so /dev/null -w "%{http_code}" "https://${VERCEL_URL}/api/analytics/full" 2>/dev/null || echo "000")
BE_STATUS=$(curl -so /dev/null -w "%{http_code}" "${BACKEND_URL}/healthz" 2>/dev/null || echo "000")
AG_STATUS=$(curl -so /dev/null -w "%{http_code}" "${AGENT_URL}/healthz" 2>/dev/null || echo "000")

echo "▶ 5/6 Cloud Scheduler..."
SCHED=$(gcloud scheduler jobs describe growth-tick \
  --location=europe-west1 \
  --format="value(state,lastAttemptTime,status.code)" 2>/dev/null || echo "NOT_FOUND")

echo "▶ 6/6 PaymentRouter..."
CONTRACT=$(cat broadcast/DeployPaymentRouter.s.sol/480/run-latest.json \
  | jq -r '.transactions[0].contractAddress,.receipts[0].transactionHash,.receipts[0].blockNumber' \
  2>/dev/null || echo "NOT_DEPLOYED")

jq -n \
  --argjson gh "$(cat /tmp/gh_run.json)" \
  --arg fe_url "$VERCEL_URL"   --arg fe_status "$FE_STATUS" \
  --arg be_url "$BACKEND_URL" --arg be_status "$BE_STATUS" \
  --arg ag_url "$AGENT_URL"   --arg ag_status "$AG_STATUS" \
  --arg traffic "$TRAFFIC" \
  --arg scheduler "$SCHED" \
  --arg contract "$CONTRACT" \
'{
  github_actions: $gh,
  frontend:  {url: $fe_url,  health: $fe_status},
  backend:   {url: $be_url,  health: $be_status},
  agent:     {url: $ag_url,  health: $ag_status},
  canary_traffic: $traffic,
  scheduler: $scheduler,
  payment_router: $contract
}' | tee "$OUT"

echo ""
echo "✅ Output guardado en $OUT — pégalo en el chat"
