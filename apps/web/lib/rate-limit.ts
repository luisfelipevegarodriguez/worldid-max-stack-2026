import { configured } from './config';

export const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
/** Bound for the in-memory fallback. Live keys past this are evicted least-recently-used. */
export const MAX_MEMORY_KEYS = 1024;
const hits = new Map<string, number[]>();

function sweepExpired(now: number): void {
  for (const [key, stamps] of hits) {
    if (!stamps.some((stamp) => now - stamp < WINDOW_MS)) hits.delete(key);
  }
}

function remember(key: string, stamps: number[]): void {
  const existing = hits.has(key);
  if (existing) hits.delete(key);
  if (!existing && hits.size >= MAX_MEMORY_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  hits.set(key, stamps);
}

export function memoryAllow(key: string, now = Date.now()): boolean {
  sweepExpired(now);
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    remember(key, recent);
    return false;
  }
  recent.push(now);
  remember(key, recent);
  return true;
}

export function memoryKeyCount(): number {
  return hits.size;
}

export function resetMemoryLimits(): void {
  hits.clear();
}

export async function allowVerification(key: string): Promise<boolean> {
  const url = configured('UPSTASH_REDIS_REST_URL');
  const token = configured('UPSTASH_REDIS_REST_TOKEN');
  if (url && token) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');
      const ratelimit = new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.fixedWindow(MAX_HITS, '10 m'),
        prefix: 'worldid:verify',
      });
      const { success } = await ratelimit.limit(key);
      return success;
    } catch (error) {
      console.error('[ratelimit] Upstash unavailable, using in-memory window', error);
    }
  }
  return memoryAllow(key);
}
