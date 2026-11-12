export type ProofPayload = Record<string, unknown>;

export function proofFromBody(body: unknown): ProofPayload | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const nested = record.idkitResponse;
  if (nested && typeof nested === 'object') return nested as ProofPayload;
  return record;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function nullifierOf(proof: ProofPayload): string | undefined {
  const direct = stringValue(proof.nullifier_hash) ?? stringValue(proof.nullifier);
  if (direct) return direct;
  if (!Array.isArray(proof.responses)) return undefined;
  for (const item of proof.responses) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const nullifier = stringValue(record.nullifier);
    if (nullifier) return nullifier;
    if (Array.isArray(record.session_nullifier)) {
      const sessionNullifier = stringValue(record.session_nullifier[0]);
      if (sessionNullifier) return sessionNullifier;
    }
  }
  return undefined;
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
  const nullifier = stringValue(body.nullifier_hash) ?? stringValue(body.nullifier);
  return { verified, nullifier };
}
