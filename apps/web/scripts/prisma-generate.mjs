import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prismaBin = path.join(appRoot, 'node_modules', '.bin', 'prisma');

// `prisma generate` reads DATABASE_URL from the schema and does not connect.
// A localhost placeholder keeps `next build` working when no secret is configured.
const env = { ...process.env };
if (!env.DATABASE_URL) {
  env.DATABASE_URL = 'postgresql://build:build@127.0.0.1:5432/worldid_build';
}

const result = spawnSync(prismaBin, ['generate'], {
  cwd: appRoot,
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
