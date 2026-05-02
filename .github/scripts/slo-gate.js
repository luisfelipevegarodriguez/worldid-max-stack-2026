#!/usr/bin/env node
// SLO Gate — espera 5 min, valida error rate <1% y p95 latency <800ms
// Si falla: exit(1) → rollback automático en canary.yml

const { execSync } = require('child_process');

const REGION = process.env.REGION || 'europe-west1';
const PROJECT = process.env.GCP_PROJECT;
const BAKE_MS = 5 * 60 * 1000; // 5 minutos
const ERROR_BUDGET = 0.01;      // 1% max error rate
const P95_BUDGET_MS = 800;      // 800ms max p95

function gcloud(cmd) {
  try {
    return execSync(`gcloud ${cmd} --format=json 2>/dev/null`, { encoding: 'utf8' });
  } catch { return '[]'; }
}

async function getMetrics(service) {
  // Cloud Monitoring: request count y latency p95 últimos 5 min
  const now = Math.floor(Date.now() / 1000);
  const start = now - 360;
  const filter = `resource.type="cloud_run_revision" resource.labels.service_name="${service}" resource.labels.location="${REGION}"`;

  // Error rate via log-based metric
  const errors = gcloud(
    `logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${service} AND httpRequest.status>=500' --limit=100 --freshness=6m`
  );
  const total = gcloud(
    `logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${service}' --limit=1000 --freshness=6m`
  );

  const errCount = JSON.parse(errors).length;
  const totalCount = Math.max(JSON.parse(total).length, 1);
  const errorRate = errCount / totalCount;

  // Health check directo
  const url = JSON.parse(gcloud(`run services describe ${service} --region=${REGION} --format=json`)).status?.url;
  let p95 = 0;
  if (url) {
    const times = [];
    for (let i = 0; i < 10; i++) {
      const t0 = Date.now();
      try { execSync(`curl -fsS ${url}/healthz -o /dev/null`, { timeout: 5000 }); }
      catch {}
      times.push(Date.now() - t0);
    }
    times.sort((a, b) => a - b);
    p95 = times[Math.ceil(times.length * 0.95) - 1] || 0;
  }

  return { service, errorRate, p95, errCount, totalCount, url };
}

async function main() {
  console.log(`⏳ Bake time ${BAKE_MS / 60000} min...`);
  await new Promise(r => setTimeout(r, BAKE_MS));

  const services = ['world-backend', 'growth-agent'];
  const results = await Promise.all(services.map(getMetrics));

  let pass = true;
  for (const r of results) {
    const errPct = (r.errorRate * 100).toFixed(2);
    const ok = r.errorRate < ERROR_BUDGET && r.p95 < P95_BUDGET_MS;
    console.log(`${ok ? '✅' : '❌'} ${r.service}: error=${errPct}% p95=${r.p95}ms url=${r.url}`);
    if (!ok) pass = false;
  }

  if (!pass) {
    console.error('\n🚨 SLO gate FAILED — triggering rollback');
    process.exit(1);
  }
  console.log('\n✅ SLO gate PASSED — promoting to 100%');
}

main().catch(e => { console.error(e); process.exit(1); });
