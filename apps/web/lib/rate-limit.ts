import { configured } from './config';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

export function memoryAllow(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
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
