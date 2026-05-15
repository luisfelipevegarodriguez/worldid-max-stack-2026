// Mini App: Payments — Remesas LATAM con World ID
import { NextRequest, NextResponse } from 'next/server';
import { MiniKit } from '@worldcoin/minikit-js';

export async function POST(req: NextRequest) {
  const { recipient, amount, currency, nullifier } = await req.json();

  if (!nullifier) {
    return NextResponse.json({ error: 'World ID verification required' }, { status: 401 });
  }

  // Lógica de pago World Chain
  // Integrar con World Pay / WLD token
  const payment = {
    id: `pay_${Date.now()}`,
    recipient,
    amount,
    currency: currency || 'WLD',
    status: 'initiated',
    chain: 'world-chain',
    timestamp: new Date().toISOString(),
  };

  // TODO: ejecutar transacción on-chain con MiniKit
  // await MiniKit.commandsAsync.pay({ reference: payment.id, to: recipient, tokens: [...] })

  return NextResponse.json({ success: true, payment });
}
