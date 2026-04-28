import { signRequest } from '@worldcoin/idkit-core/signing'
import { NextRequest, NextResponse } from 'next/server'

// NEVER expose WORLD_SIGNING_KEY to the client — edge function only
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = await signRequest(
      process.env.WORLD_SIGNING_KEY!,
      body
    )
    return NextResponse.json({ signature })
  } catch (e) {
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 })
  }
}
