'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { useState } from 'react';
import { getActionConfig, WORLD_APP_ID } from '@/lib/worldid';

interface Props {
  action?: string;
  onSuccess?: (nullifier: string) => void;
}

export default function WorldIDButton({ action = 'login', onSuccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (proof: ISuccessResult) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idkitResponse: { ...proof, ...getActionConfig(action) } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Verification failed');
      setStatus('verified');
      onSuccess?.(data.nullifier);
    } catch (e: unknown) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <IDKitWidget
        app_id={WORLD_APP_ID as `app_${string}`}
        action={action}
        verification_level={VerificationLevel.Orb}
        onSuccess={handleVerify}
      >
        {({ open }) => (
          <button
            onClick={open}
            disabled={status === 'loading' || status === 'verified'}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            {status === 'loading' && '⏳ Verificando...'}
            {status === 'verified' && '✅ Verificado con World ID'}
            {status === 'idle' && '🌍 Verificar con World ID'}
            {status === 'error' && '❌ Reintentar'}
          </button>
        )}
      </IDKitWidget>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
