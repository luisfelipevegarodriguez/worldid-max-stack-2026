import { NextRequest, NextResponse } from 'next/server';
import { proofFromBody } from '@/lib/proof';
import { verifyProof } from '@/lib/verify-proof';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const proof = proofFromBody(await req.json().catch(() => null));
  if (!proof) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const result = await verifyProof(proof);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });

  return NextResponse.json({
    success: true,
    nullifier: result.nullifier,
    persisted: result.persisted,
  });
}
