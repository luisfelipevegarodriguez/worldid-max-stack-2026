import { NextRequest, NextResponse } from 'next/server';

// Endpoint para obtener la firma del Relying Party (RP)
// Requerido por algunos flujos avanzados de World ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nonce = searchParams.get('nonce');

  if (!nonce) {
    return NextResponse.json({ error: 'nonce required' }, { status: 400 });
  }

  // En producción: firmar nonce con clave privada del RP
  // Por ahora retorna metadata del RP
  return NextResponse.json({
    rp_id: process.env.WORLD_RP_ID,
    app_id: process.env.NEXT_PUBLIC_WORLD_APP_ID,
    nonce,
    timestamp: Date.now(),
  });
}
