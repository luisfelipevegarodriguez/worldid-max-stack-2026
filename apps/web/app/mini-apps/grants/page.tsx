'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const WorldIDButton = dynamic(() => import('@/components/WorldIDButton'), { ssr: false });

const GRANTS = [
  { id: 'g1', name: 'World Chain Builder Grant', amount: '$5,000 WLD', country: 'LATAM', deadline: '2026-07-31' },
  { id: 'g2', name: 'Retro Mini Apps', amount: '$10,000 WLD', country: 'Global', deadline: '2026-06-09' },
  { id: 'g3', name: 'LATAM Growth Fund', amount: '$2,500 WLD', country: 'MX/CO/AR/BR', deadline: '2026-09-01' },
];

export default function GrantsPage() {
  const [verified, setVerified] = useState(false);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Grants LATAM</h1>
      <p className="mb-6 text-gray-500">Verifica tu identidad antes de revisar convocatorias. Enviar la solicitud sigue siendo manual.</p>
      {!verified ? (
        <WorldIDButton action="apply-grant-latam" onSuccess={() => setVerified(true)} />
      ) : (
        <div className="space-y-4">
          <p className="font-medium text-green-700">Identidad verificada para esta acción.</p>
          {GRANTS.map((grant) => (
            <div key={grant.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <h2 className="font-semibold">{grant.name}</h2>
                <p className="text-sm text-gray-500">
                  {grant.country} · Deadline: {grant.deadline}
                </p>
              </div>
              <p className="font-bold text-green-700">{grant.amount}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
