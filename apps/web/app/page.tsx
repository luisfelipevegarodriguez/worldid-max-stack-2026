'use client'

import { IDKitWidget, VerificationLevel, type ISuccessResult } from '@worldcoin/idkit'
import { useState } from 'react'

export default function HomePage() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle')
  const [jwt, setJwt] = useState<string | null>(null)

  const handleVerify = async (proof: ISuccessResult) => {
    setStatus('verifying')
    const res = await fetch('/api/auth/worldid/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proof),
    })
    if (!res.ok) { setStatus('error'); return }
    const { token } = await res.json()
    setJwt(token)
    setStatus('verified')
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
      <h1>Human-Verified Agent Platform</h1>
      <p>Verify you are human. Delegate to AI agents securely.</p>

      {status === 'idle' && (
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
          action="human-verified-agent-2026"
          verification_level={VerificationLevel.Orb}
          handleVerify={handleVerify}
          autoClose
        >
          {({ open }) => (
            <button onClick={open} style={{ padding: '12px 24px', fontSize: 16, borderRadius: 8, cursor: 'pointer' }}>
              🌍 Verify with World ID
            </button>
          )}
        </IDKitWidget>
      )}

      {status === 'verifying' && <p>⏳ Verifying proof on-chain...</p>}
      {status === 'verified' && <p>✅ Human verified! JWT issued. Ready to delegate to agents.</p>}
      {status === 'error' && <p>❌ Verification failed. Try again.</p>}
    </main>
  )
}
