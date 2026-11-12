'use client';

import {
  IDKitRequestWidget,
  proofOfHuman,
  type IDKitResult,
  type RpContext,
} from '@worldcoin/idkit';
import { useState } from 'react';
import { isPlaceholder } from '@/lib/config';

interface Props {
  action?: string;
  mode?: 'nullifier' | 'session';
  onSuccess?: (nullifier: string) => void;
}

type SignaturePayload = {
  rp_id?: string;
  nonce?: string;
  created_at?: number;
  expires_at?: number;
  sig?: string;
  allow_legacy_proofs?: boolean;
  error?: string;
};

function environmentOf(): 'production' | 'staging' | 'sandbox' {
  const value = process.env.NEXT_PUBLIC_WORLD_ENVIRONMENT;
  if (value === 'staging' || value === 'sandbox') return value;
  return 'production';
}

export default function WorldIDButton({ action = 'login', mode = 'nullifier', onSuccess }: Props) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  const [open, setOpen] = useState(false);
  const [rp, setRp] = useState<RpContext | null>(null);
  const [allowLegacy, setAllowLegacy] = useState(false);
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

  async function begin() {
    setError(null);
    setStatus('loading');
    let res: Response;
    try {
      res = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    } catch {
      setStatus('error');
      setError('network_error');
      return;
    }
    const data = (await res.json().catch(() => ({}))) as SignaturePayload;
    if (
      !res.ok ||
      !data.rp_id ||
      !data.nonce ||
      !data.sig ||
      typeof data.created_at !== 'number' ||
      typeof data.expires_at !== 'number'
    ) {
      setStatus('error');
      setError(data.error || 'signing_unconfigured');
      return;
    }
    setAllowLegacy(data.allow_legacy_proofs === true);
    setRp({
      rp_id: data.rp_id,
      nonce: data.nonce,
      created_at: data.created_at,
      expires_at: data.expires_at,
      signature: data.sig,
    });
    setStatus('idle');
    setOpen(true);
  }

  async function handleVerify(result: IDKitResult) {
    setStatus('loading');
    setError(null);
    const endpoint = mode === 'session' ? '/api/auth/worldid/verify' : '/api/verify';
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mode === 'session' ? result : { idkitResponse: result }),
      });
    } catch {
      setStatus('error');
      setError('network_error');
      throw new Error('network_error');
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      nullifier?: string;
      nullifier_hash?: string;
    };
    if (!res.ok) {
      const message = data.error || 'verification_failed';
      setStatus('error');
      setError(message);
      throw new Error(message);
    }
    onSuccess?.(data.nullifier || data.nullifier_hash || '');
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={begin}
        disabled={status === 'loading' || status === 'verified'}
        className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
      >
        {status === 'loading' && 'Verificando...'}
        {status === 'verified' && 'Verificado con World ID'}
        {status === 'idle' && 'Verificar con World ID'}
        {status === 'error' && 'Reintentar'}
      </button>
      {rp && (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={appId as `app_${string}`}
          action={action}
          rp_context={rp}
          allow_legacy_proofs={allowLegacy}
          preset={proofOfHuman()}
          environment={environmentOf()}
          handleVerify={handleVerify}
          onSuccess={() => setStatus('verified')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'verified' && mode === 'session' && (
        <p className="text-sm text-green-700">Sesión humana emitida. Lista para delegar a un agente.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
