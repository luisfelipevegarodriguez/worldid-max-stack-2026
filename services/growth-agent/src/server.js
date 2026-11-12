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

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/healthz')) {
    json(res, 200, {
      ok: true,
      service: 'growth-agent',
      model: configured('OPENAI_API_KEY') ? 'configured' : 'unconfigured',
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/run') {
    if (!configured('OPENAI_API_KEY')) {
      json(res, 503, { error: 'openai_unconfigured' });
      return;
    }
    // The free image does not call a model. A key alone must not spend quota.
    json(res, 200, { ok: true, ran: false, reason: 'model_disabled' });
    return;
  }

  json(res, 404, { error: 'not_found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`growth-agent listening on ${port}`);
});
