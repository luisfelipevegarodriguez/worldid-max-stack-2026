import http from 'node:http';

const port = Number(process.env.PORT || 8080);

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function configured(name) {
  const value = process.env[name];
  if (!value || !value.trim()) return undefined;
  if (/x{4,}|your_|placeholder|changeme/i.test(value)) return undefined;
  return value;
}

async function rpcStatus() {
  const url = configured('WORLD_CHAIN_RPC_URL');
  if (!url) return 'skipped';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return 'down';
    const body = await res.json();
    return body.result ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

async function routerStatus() {
  const url = configured('WORLD_CHAIN_RPC_URL');
  const address = configured('PAYMENT_ROUTER_ADDR');
  if (!url || !address) return 'skipped';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [address, 'latest'] }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return 'down';
    const body = await res.json();
    return body.result && body.result !== '0x' ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

async function worldStatus() {
  try {
    const res = await fetch('https://developer.world.org/api/v2/status', { signal: AbortSignal.timeout(5000) });
    return res.ok ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/healthz')) {
    json(res, 200, { ok: true, service: 'world-backend' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/internal/self-heal') {
    if (!configured('CRON_SECRET')) {
      json(res, 503, { error: 'cron_unconfigured' });
      return;
    }
    if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
      json(res, 403, { error: 'forbidden' });
      return;
    }
    const checks = [
      { name: 'rpc', status: await rpcStatus() },
      { name: 'router', status: await routerStatus() },
      { name: 'world', status: await worldStatus() },
    ];
    const ok = checks.every((check) => check.status === 'ok' || check.status === 'skipped');
    json(res, 200, { ok, checks, ts: new Date().toISOString() });
    return;
  }

  json(res, 404, { error: 'not_found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`world-backend listening on ${port}`);
});
