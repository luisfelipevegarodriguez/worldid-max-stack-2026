import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = auth.slice(7)
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

  try {
    const { payload } = await jwtVerify(token, secret)
    if (!payload.is_human) return NextResponse.json({ error: 'Not human-verified' }, { status: 403 })

    const { action_type, metadata } = await req.json()

    // Forward to n8n orchestrator
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        nullifier_hash: payload.sub,
        is_human: true,
        action_type,      // 'zoom_and_sign' | 'agent_delegation' | 'github_dispatch' | 'miniapp_action'
        metadata,
        timestamp: Date.now(),
      }),
    })

    const result = await n8nRes.json()
    return NextResponse.json({ success: true, result })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
