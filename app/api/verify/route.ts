import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveNullifier, nullifierExists } from '@/lib/db';

const schema = z.object({ idkitResponse: z.any() });

export async function POST(req: NextRequest) {
  try {
    const { idkitResponse } = schema.parse(await req.json());

    // Verificar con World ID Developer API
    const res = await fetch(
      `https://developer.world.org/api/v4/verify/${process.env.WORLD_RP_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idkitResponse),
      }
    );

    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: 'Verification failed' }, { status: 400 });

    // Antifraude: nullifier check
    const alreadyUsed = await nullifierExists(data.nullifier_hash);
    if (alreadyUsed) {
      return NextResponse.json({ error: 'Nullifier already used — fraude detectado' }, { status: 409 });
    }

    await saveNullifier(data.nullifier_hash, idkitResponse.action || 'unknown');

    return NextResponse.json({ success: true, nullifier: data.nullifier_hash, ...data });
  } catch (e) {
    console.error('[verify]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
