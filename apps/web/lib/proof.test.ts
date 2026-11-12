import assert from 'node:assert/strict';
import test from 'node:test';
import { actionOf, nullifierOf, proofFromBody, readVerified } from './proof';

test('proofFromBody accepts a raw proof or an idkitResponse envelope', () => {
  const raw = proofFromBody({ nullifier_hash: '0xabc', action: 'login' });
  assert.equal(nullifierOf(raw!), '0xabc');

  const wrapped = proofFromBody({ idkitResponse: { nullifier_hash: '0xdef', action: 'apply-grant-latam' } });
  assert.equal(actionOf(wrapped!), 'apply-grant-latam');
  assert.equal(proofFromBody(null), null);
  assert.equal(proofFromBody('nope'), null);
});

test('readVerified accepts v2 success and v4 verified', () => {
  assert.deepEqual(readVerified({ success: true, nullifier_hash: '0x1' }), {
    verified: true,
    nullifier: '0x1',
  });
  assert.deepEqual(readVerified({ verified: true }), { verified: true, nullifier: undefined });
  assert.deepEqual(readVerified({ verified: false }), { verified: false, nullifier: undefined });
  assert.deepEqual(readVerified(null), { verified: false });
});
