# INSTRUCCIÓN DE EJECUCIÓN AUTÓNOMA — WORLD MAX STACK

> Pega este archivo completo en Grok con el mensaje: "Ejecuta esto en mi entorno"
> Grok puede ayudarte a ejecutar paso a paso con su CLI si tienes Grok con acceso a terminal.

## CONTEXTO
Repo: https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026  
Objetivo: Desplegar World ID 4.0 full-stack en producción, zero-touch desde este punto.

## PASO 1 — Cargar secrets (hazlo tú, 2 min)

URL directa: https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026/settings/secrets/actions

Secrets requeridos:
```
DATABASE_URL
BACKEND_JWT_SECRET
WORLD_ID_APP_SECRET
WORLD_CHAIN_RPC_URL
VERCEL_TOKEN
GH_TOKEN
GCP_SA_KEY
GCP_PROJECT
OPENAI_API_KEY
CRON_SECRET
DEPLOYER_PK
TREASURY
NEXT_PUBLIC_WORLD_ID_APP_ID
NEXT_PUBLIC_APP_URL
PAYMENT_ROUTER_ADDR
```

## PASO 2 — Ejecución única (copia y pega en terminal)

```bash
git clone https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026.git
cd worldid-max-stack-2026
bash infra/zero-touch.sh
```

## LO QUE HACE zero-touch.sh AUTOMÁTICAMENTE

1. Instala deps faltantes (gh, vercel, forge, jq)
2. Autentica GCP, GitHub, Vercel con los secrets
3. Carga todos los secrets en los 3 stores (GitHub Actions, Vercel, GCP Secret Manager)
4. Despliega PaymentRouter en World Chain (CREATE2 idempotente)
5. Push a main → dispara canary.yml
6. Espera CI verde (gh run watch)
7. Health checks con retry (backend/healthz, growth-agent/healthz, frontend/api/analytics/full)
8. Registra Cloud Scheduler self-heal cada 5 min
9. Imprime bloque WORLD MAX STACK — ACTIVO

## LO QUE HACE canary.yml AUTOMÁTICAMENTE (sin intervención)

1. Tests
2. Build Docker → GCR
3. Deploy canary 10% Cloud Run
4. SLO gate: 5min bake + error <1% + p95 <800ms
5. Promote 100% o auto-rollback
6. Deploy Vercel frontend

## ÚNICO PASO MANUAL IRREDUCTIBLE

https://developer.world.org/apps → Submit app → Review por TFH

## OUTPUT ESPERADO AL FINALIZAR

```
==================================================
 WORLD MAX STACK — ACTIVO
 PaymentRouter : 0x...
 Backend URL   : https://world-backend-....run.app
 Growth Agent  : https://growth-agent-....run.app
 Frontend URL  : https://....vercel.app
 Siguiente paso: https://developer.world.org/apps
==================================================
```

Pega ese bloque en https://github.com/luisfelipevegarodriguez/worldid-max-stack-2026/issues/1
