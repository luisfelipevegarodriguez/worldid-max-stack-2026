import assert from 'node:assert/strict';
import test from 'node:test';
import { isPlaceholder } from './config';

test('placeholders and blanks are not configuration', () => {
  assert.equal(isPlaceholder(undefined), true);
  assert.equal(isPlaceholder(''), true);
  assert.equal(isPlaceholder('   '), true);
  assert.equal(isPlaceholder('app_xxxxxxxxxxxxxxxx'), true);
  assert.equal(isPlaceholder('your_rp_id_here'), true);
  assert.equal(isPlaceholder('app_staging_build_placeholder'), true);
});

test('a real-looking value counts as configured', () => {
  assert.equal(isPlaceholder('app_a1b2c3d4e5f67890'), false);
  assert.equal(isPlaceholder('https://abcd.supabase.co'), false);
});
