# Deploy Guide

## 1. Vercel (Frontend + API)
```bash
cd apps/web
vercel --prod
# Set env vars in Vercel dashboard:
# WORLD_APP_ID, WORLD_RP_ID, WORLD_SIGNING_KEY, JWT_SECRET,
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
# N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET
```

## 2. n8n on Cloud Run
```bash
gcloud run deploy n8n \
  --image n8nio/n8n:latest \
  --region europe-west1 \
  --set-env-vars N8N_ENCRYPTION_KEY=$(gcloud secrets versions access latest --secret=N8N_ENCRYPTION_KEY) \
  --set-env-vars WEBHOOK_URL=https://n8n.your-domain.com \
  --allow-unauthenticated
```

## 3. Database (Supabase/Neon)
```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

## 4. Secrets (Google Secret Manager)
```bash
echo -n "your_signing_key" | gcloud secrets create WORLD_SIGNING_KEY --data-file=-
echo -n "your_jwt_secret" | gcloud secrets create JWT_SECRET --data-file=-
```

## 5. World Developer Portal
- Go to https://developer.world.org
- Upgrade app to World ID 4.0
- Get rp_id and signing_key
- Add action: human-verified-agent-2026
- Set redirect URI: https://your-app.vercel.app/api/auth/worldid/verify

## 6. Retro Mini Apps (Deadline 9 Jun 2026)
- Submit at: https://developer.world.org/mini-apps/retro
- Focus: AI agents + enterprise verification + nullifier MAU
