import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configured, jwtSecret } from '@/lib/config';
import { readHumanJwt } from '@/lib/session';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  action_type: z.enum(['zoom_and_sign', 'agent_delegation', 'github_dispatch', 'miniapp_action']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  if (!jwtSecret()) return NextResponse.json({ error: 'jwt_unconfigured' }, { status: 503 });

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const claims = await readHumanJwt(auth.slice(7));
  if (!claims) return NextResponse.json({ error: 'invalid_token' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const webhook = configured('N8N_WEBHOOK_URL');
  if (!webhook) return NextResponse.json({ error: 'orchestrator_unconfigured' }, { status: 503 });

  try {
    const n8nRes = await fetch(webhook, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-secret': configured('N8N_WEBHOOK_SECRET') ?? '',
      },
      body: JSON.stringify({
        nullifier_hash: claims.sub,
        is_human: true,
        action_type: parsed.data.action_type,
        metadata: parsed.data.metadata ?? {},
        timestamp: Date.now(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await n8nRes.json().catch(() => null);
    if (!n8nRes.ok) return NextResponse.json({ error: 'orchestrator_rejected' }, { status: 502 });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[agent] orchestrator request failed', error);
    return NextResponse.json({ error: 'orchestrator_unreachable' }, { status: 502 });
  }
}
