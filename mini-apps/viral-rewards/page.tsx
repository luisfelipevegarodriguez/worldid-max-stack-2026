'use client';

import { useState } from 'react';
import WorldIDButton from '@/components/WorldIDButton';

const LEADERBOARD = [
  { rank: 1, country: '🇲🇽 México', referrals: 2847, reward: '890 WLD' },
  { rank: 2, country: '🇨🇴 Colombia', referrals: 1923, reward: '601 WLD' },
  { rank: 3, country: '🇦🇷 Argentina', referrals: 1654, reward: '517 WLD' },
  { rank: 4, country: '🇧🇷 Brasil', referrals: 1432, reward: '447 WLD' },
  { rank: 5, country: '🇪🇸 España', referrals: 987, reward: '308 WLD' },
];

export default function ViralRewardsPage() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">🏆 Viral Rewards LATAM</h1>
      <p className="text-gray-500 mb-6">Refiere · Verifica · Gana WLD</p>

      {!verified ? (
        <WorldIDButton action="claim-viral-reward" onSuccess={() => setVerified(true)} />
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-green-700">🎉 Tu código de referido: <span className="font-mono">WLD-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span></p>
            <p className="text-sm text-green-600 mt-1">Multiplier activo: <strong>2.5x LATAM</strong></p>
          </div>
          <h2 className="text-xl font-semibold mb-3">Leaderboard Regional</h2>
          <table className="w-full">
            <thead><tr className="text-left text-gray-500 text-sm border-b"><th className="pb-2">#</th><th className="pb-2">País</th><th className="pb-2">Referidos</th><th className="pb-2">Recompensa</th></tr></thead>
            <tbody>
              {LEADERBOARD.map((row) => (
                <tr key={row.rank} className="border-b last:border-0">
                  <td className="py-3 font-bold">{row.rank}</td>
                  <td className="py-3">{row.country}</td>
                  <td className="py-3">{row.referrals.toLocaleString()}</td>
                  <td className="py-3 text-green-600 font-semibold">{row.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
