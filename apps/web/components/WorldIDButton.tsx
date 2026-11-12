'use client';

import { IDKitWidget, VerificationLevel, type ISuccessResult } from '@worldcoin/idkit';
import { useState } from 'react';
import { isPlaceholder } from '@/lib/config';

interface Props {
  action?: string;
  mode?: 'nullifier' | 'session';
  onSuccess?: (nullifier: string) => void;
}

export default function WorldIDButton({ action = 'login', mode = 'nullifier', onSuccess }: Props) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!appId || isPlaceholder(appId)) {
    return (
      <p className="max-w-md text-center text-sm text-amber-700">
        World ID no está configurado. Define NEXT_PUBLIC_WORLD_APP_ID para mostrar el widget. La app
        sigue construyendo y sirviendo el resto de las rutas.
      </p>
    );
  }

  const handleVerify = async (proof: ISuccessResult) => {
    setStatus('loading');
    setError(null);
    const endpoint = mode === 'session' ? '/api/auth/worldid/verify' : '/api/verify';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mode === 'session' ? proof : { idkitResponse: proof }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; nullifier?: string; nullifier_hash?: string };
    if (!res.ok) {
      const message = data.error || 'Verification failed';
      setStatus('error');
      setError(message);
      throw new Error(message);
    }
    const nullifier = data.nullifier || data.nullifier_hash || '';
    onSuccess?.(nullifier);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <IDKitWidget
        app_id={appId as `app_${string}`}
        action={action}
        verification_level={VerificationLevel.Orb}
        handleVerify={handleVerify}
        onSuccess={() => setStatus('verified')}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={open}
            disabled={status === 'loading' || status === 'verified'}
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
          >
            {status === 'loading' && 'Verificando...'}
            {status === 'verified' && 'Verificado con World ID'}
            {status === 'idle' && 'Verificar con World ID'}
            {status === 'error' && 'Reintentar'}
          </button>
        )}
      </IDKitWidget>
      {status === 'verified' && mode === 'session' && (
        <p className="text-sm text-green-700">Sesión humana emitida. Lista para delegar a un agente.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
