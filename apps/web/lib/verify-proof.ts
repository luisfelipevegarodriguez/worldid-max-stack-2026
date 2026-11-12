import { allowVerification } from './rate-limit';
import { recordNullifier } from './persist';
import { actionOf, nullifierOf, readVerified, type ProofPayload } from './proof';
import { worldRpId } from './config';

export type VerifyOutcome =
  | { ok: true; nullifier: string; persisted: boolean }
  | { ok: false; status: number; error: string };

export async function verifyProof(proof: ProofPayload): Promise<VerifyOutcome> {
  const nullifier = nullifierOf(proof);
  if (!nullifier) return { ok: false, status: 400, error: 'nullifier_required' };

  const allowed = await allowVerification(nullifier);
  if (!allowed) return { ok: false, status: 429, error: 'rate_limited' };

  const rpId = worldRpId();
  if (!rpId) return { ok: false, status: 503, error: 'world_unconfigured' };

  let response: Response;
  try {
    response = await fetch(`https://developer.world.org/api/v4/verify/${rpId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(proof),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('[worldid] verify request failed', error);
    return { ok: false, status: 502, error: 'world_unreachable' };
  }

  const payload = await response.json().catch(() => null);
  const verdict = readVerified(payload);
  if (!response.ok || !verdict.verified) {
    return { ok: false, status: 400, error: 'verification_failed' };
  }

  const stored = verdict.nullifier ?? nullifier;
  const persisted = await recordNullifier({
    nullifierHash: stored,
    action: actionOf(proof),
    metadata: {
      verification_level: proof.verification_level ?? null,
      timestamp: new Date().toISOString(),
    },
  });

  if (persisted === 'duplicate') return { ok: false, status: 409, error: 'nullifier_already_used' };
  if (persisted === 'error') return { ok: false, status: 503, error: 'database_unavailable' };

  return { ok: true, nullifier: stored, persisted: persisted === 'created' };
}
