import assert from 'node:assert/strict';
import test from 'node:test';
import { memoryAllow, resetMemoryLimits } from './rate-limit';

test('memory window allows five hits and blocks the sixth', () => {
  resetMemoryLimits();
  const now = 1_700_000_000_000;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(memoryAllow('0xabc', now + i), true);
  }
  assert.equal(memoryAllow('0xabc', now + 5), false);
  assert.equal(memoryAllow('0xother', now), true);
});
