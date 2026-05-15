import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const schema = z.object({ idkitResponse: z.any() });

export async function POST(req: NextRequest) {
  try {
    const { idkitResponse } = schema.parse(await req.json());

    // 1. Verificar con World ID Developer API
    const res = await fetch(
      `https://developer.world.org/api/v4/verify/${process.env.WORLD_RP_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idkitResponse),
      }
    );

    const data = await res.json();
    if (!data.success) {
      return NextResponse.json({ error: 'Verification failed', detail: data }, { status: 400 });
    }

    const nullifier_hash = data.nullifier_hash;
    const action = idkitResponse.action || 'unknown';

    // 2. Antifraude: verificar si nullifier ya fue usado
    const { data: existing } = await supabase
      .from('nullifiers')
      .select('id')
      .eq('nullifier_hash', nullifier_hash)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Acción ya utilizada — fraude detectado' },
        { status: 409 }
      );
    }

    // 3. Guardar nullifier
    await supabase.from('nullifiers').insert({
      nullifier_hash,
      action,
      metadata: {
        timestamp: new Date().toISOString(),
        verification_level: idkitResponse.verification_level,
      },
    });

    return NextResponse.json({ success: true, nullifier: nullifier_hash, ...data });
  } catch (e) {
    console.error('[verify]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
