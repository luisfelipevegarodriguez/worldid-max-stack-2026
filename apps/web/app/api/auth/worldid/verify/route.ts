import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, '10 m'), // 5 verifications per nullifier per 10 min
  prefix: 'worldid:verify',
})

export async function POST(req: NextRequest) {
  const proof = await req.json()
  const { nullifier_hash } = proof

  // Rate limit per nullifier
  const { success } = await ratelimit.limit(nullifier_hash)
  if (!success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

  // Verify against World ID v4 endpoint
  const verifyRes = await fetch(
    `https://developer.world.org/api/v4/verify/${process.env.WORLD_RP_ID}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proof), // raw IDKit proof, no remapping
    }
  )

  if (!verifyRes.ok) {
    const err = await verifyRes.json()
    return NextResponse.json({ error: 'World ID verification failed', detail: err }, { status: 400 })
  }

  const { verified } = await verifyRes.json()
  if (!verified) return NextResponse.json({ error: 'Not verified' }, { status: 401 })

  // Issue JWT
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const token = await new SignJWT({ sub: nullifier_hash, is_human: true, level: 'orb' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return NextResponse.json({ token, nullifier_hash })
}
