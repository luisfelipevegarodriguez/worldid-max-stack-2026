import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_MEMORY_KEYS, WINDOW_MS, memoryAllow, memoryKeyCount, resetMemoryLimits } from './rate-limit';

test('memory window allows five hits and blocks the sixth', () => {
  resetMemoryLimits();
  const now = 1_700_000_000_000;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(memoryAllow('0xabc', now + i), true);
  }
  assert.equal(memoryAllow('0xabc', now + 5), false);
  assert.equal(memoryAllow('0xother', now), true);
});

test('expired keys are purged and the map stays within the LRU cap', () => {
  resetMemoryLimits();
  const now = 1_700_000_000_000;
  assert.equal(memoryAllow('old-a', now), true);
  assert.equal(memoryAllow('recent', now), true);
  assert.equal(memoryKeyCount(), 2);

  const stillInside = now + WINDOW_MS - 1;
  assert.equal(memoryAllow('recent', stillInside), true);
  assert.equal(memoryKeyCount(), 2);

  const afterWindow = now + WINDOW_MS;
  assert.equal(memoryAllow('fresh', afterWindow), true);
  assert.equal(memoryKeyCount(), 2);

  resetMemoryLimits();
  const base = 1_800_000_000_000;
  for (let i = 0; i < MAX_MEMORY_KEYS; i += 1) {
    for (let hit = 0; hit < 5; hit += 1) {
      assert.equal(memoryAllow(`k${i}`, base), true);
    }
    assert.equal(memoryAllow(`k${i}`, base), false);
  }
  assert.equal(memoryKeyCount(), MAX_MEMORY_KEYS);

  assert.equal(memoryAllow('overflow', base), true);
  assert.equal(memoryKeyCount(), MAX_MEMORY_KEYS);
  assert.equal(memoryAllow('k1', base), false);
  assert.equal(memoryAllow('k0', base), true);
  assert.equal(memoryKeyCount(), MAX_MEMORY_KEYS);
});
