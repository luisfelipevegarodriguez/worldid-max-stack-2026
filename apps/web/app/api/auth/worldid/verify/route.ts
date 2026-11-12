import { NextRequest, NextResponse } from 'next/server';
import { jwtSecret } from '@/lib/config';
import { proofFromBody } from '@/lib/proof';
import { issueHumanJwt } from '@/lib/session';
import { verifyProof } from '@/lib/verify-proof';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const proof = proofFromBody(await req.json().catch(() => null));
  if (!proof) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  if (!jwtSecret()) return NextResponse.json({ error: 'jwt_unconfigured' }, { status: 503 });

  const result = await verifyProof(proof);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const token = await issueHumanJwt(result.nullifier);
  if (!token) return NextResponse.json({ error: 'jwt_unconfigured' }, { status: 503 });

  return NextResponse.json({ token, nullifier_hash: result.nullifier, persisted: result.persisted });
}
