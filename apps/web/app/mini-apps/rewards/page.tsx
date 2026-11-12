'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const WorldIDButton = dynamic(() => import('@/components/WorldIDButton'), { ssr: false });

const LEADERBOARD = [
  { rank: 1, country: 'México', referrals: 2847, reward: '890 WLD' },
  { rank: 2, country: 'Colombia', referrals: 1923, reward: '601 WLD' },
  { rank: 3, country: 'Argentina', referrals: 1654, reward: '517 WLD' },
  { rank: 4, country: 'Brasil', referrals: 1432, reward: '447 WLD' },
  { rank: 5, country: 'España', referrals: 987, reward: '308 WLD' },
];

export default function RewardsPage() {
  const [verified, setVerified] = useState(false);
  const [code] = useState(() => `WLD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Viral Rewards LATAM</h1>
      <p className="mb-6 text-gray-500">El tablero es de ejemplo. No hay reparto de WLD en este despliegue.</p>
      {!verified ? (
        <WorldIDButton action="claim-viral-reward" onSuccess={() => setVerified(true)} />
      ) : (
        <div>
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">
              Código de referido de demostración: <span className="font-mono">{code}</span>
            </p>
          </div>
          <h2 className="mb-3 text-xl font-semibold">Leaderboard regional</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-2">#</th>
                <th className="pb-2">País</th>
                <th className="pb-2">Referidos</th>
                <th className="pb-2">Recompensa</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((row) => (
                <tr key={row.rank} className="border-b last:border-0">
                  <td className="py-3 font-bold">{row.rank}</td>
                  <td className="py-3">{row.country}</td>
                  <td className="py-3">{row.referrals.toLocaleString('es')}</td>
                  <td className="py-3 font-semibold text-green-700">{row.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
