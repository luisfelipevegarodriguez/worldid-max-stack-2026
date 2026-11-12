import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  recipient: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().optional(),
  nullifier: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'World ID verification required' }, { status: 401 });
  }

  const { recipient, amount, currency, nullifier } = parsed.data;
  return NextResponse.json({
    success: true,
    payment: {
      id: `pay_${Date.now()}`,
      recipient,
      amount,
      currency: currency || 'WLD',
      nullifier,
      status: 'recorded',
      chain: 'world-chain',
      settled: false,
      timestamp: new Date().toISOString(),
    },
  });
}
