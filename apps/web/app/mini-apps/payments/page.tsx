'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const WorldIDButton = dynamic(() => import('@/components/WorldIDButton'), { ssr: false });

export default function PaymentsPage() {
  const [nullifier, setNullifier] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    const res = await fetch('/api/mini-apps/payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipient, amount, currency: 'WLD', nullifier }),
    });
    const data = (await res.json()) as { error?: string; payment?: { id: string; status: string; settled: boolean } };
    if (!res.ok || !data.payment) {
      setResult(data.error || 'No se pudo registrar el pago');
      return;
    }
    setResult(`Registrado ${data.payment.id} (${data.payment.status}). Aún no se liquida on-chain.`);
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Payments</h1>
      <p className="mb-6 text-gray-500">Remesas LATAM. La liquidación on-chain no está conectada en este despliegue.</p>
      {!nullifier ? (
        <WorldIDButton action="mini-app-payment" onSuccess={setNullifier} />
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-green-700">Identidad verificada para esta acción.</p>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Destinatario"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Monto WLD"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-white">
            Registrar pago
          </button>
          {result && <p className="text-sm text-gray-700">{result}</p>}
        </form>
      )}
    </main>
  );
}
