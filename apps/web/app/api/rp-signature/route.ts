import { signRequest } from '@worldcoin/idkit-core/signing';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signingKey, worldRpId } from '@/lib/config';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  action: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  const rpId = worldRpId();
  const key = signingKey();
  if (!rpId || !key) {
    return NextResponse.json({ error: 'signing_unconfigured' }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  try {
    const signed = signRequest({ signingKeyHex: key, action: parsed.data.action });
    return NextResponse.json({
      rp_id: rpId,
      sig: signed.sig,
      nonce: signed.nonce,
      created_at: signed.createdAt,
      expires_at: signed.expiresAt,
      allow_legacy_proofs: process.env.ALLOW_LEGACY_PROOFS === 'true',
    });
  } catch {
    console.error('[worldid] signRequest failed');
    return NextResponse.json({ error: 'signing_failed' }, { status: 500 });
  }
}
