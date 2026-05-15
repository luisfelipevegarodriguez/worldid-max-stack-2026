'use client';

import { useState } from 'react';
import WorldIDButton from '@/components/WorldIDButton';

const GRANTS = [
  { id: 'g1', name: 'World Chain Builder Grant', amount: '$5,000 WLD', country: 'LATAM', deadline: '2026-07-31' },
  { id: 'g2', name: 'Retro Mini Apps Round 3', amount: '$10,000 WLD', country: 'Global', deadline: '2026-08-15' },
  { id: 'g3', name: 'LATAM Growth Fund', amount: '$2,500 WLD', country: 'MX/CO/AR/BR', deadline: '2026-09-01' },
];

export default function GrantsPage() {
  const [verified, setVerified] = useState(false);
  const [nullifier, setNullifier] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">🎁 Grants LATAM</h1>
      <p className="text-gray-500 mb-6">Verifica tu identidad para aplicar automáticamente</p>

      {!verified ? (
        <WorldIDButton
          action="apply-grant-latam"
          onSuccess={(n) => { setVerified(true); setNullifier(n); }}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 font-medium">✅ Identidad verificada — Orb Level</p>
          {GRANTS.map((g) => (
            <div key={g.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-sm text-gray-500">{g.country} · Deadline: {g.deadline}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{g.amount}</p>
                <button className="text-sm text-blue-600 hover:underline mt-1">Aplicar →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
