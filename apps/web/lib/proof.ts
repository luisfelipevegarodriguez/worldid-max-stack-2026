export type ProofPayload = Record<string, unknown>;

export function proofFromBody(body: unknown): ProofPayload | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const nested = record.idkitResponse;
  if (nested && typeof nested === 'object') return nested as ProofPayload;
  return record;
}

export function nullifierOf(proof: ProofPayload): string | undefined {
  const value = proof.nullifier_hash;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function actionOf(proof: ProofPayload, fallback = 'unknown'): string {
  const value = proof.action;
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** World ID v2 responses use `success`; v4 responses use `verified`. */
export function readVerified(payload: unknown): { verified: boolean; nullifier?: string } {
  if (!payload || typeof payload !== 'object') return { verified: false };
  const body = payload as Record<string, unknown>;
  const verified = body.verified === true || body.success === true;
  const nullifier = typeof body.nullifier_hash === 'string' ? body.nullifier_hash : undefined;
  return { verified, nullifier };
}
