import WorldIDButton from '@/components/WorldIDButton';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🌍 World ID Max Stack</h1>
        <p className="text-gray-500">Verificación humana real — LATAM 2026</p>
      </div>
      <WorldIDButton action="login" onSuccess={(n) => console.log('Nullifier:', n)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl w-full">
        <MiniAppCard title="💸 Payments" desc="Remesas instantáneas LATAM" href="/mini-apps/payments" />
        <MiniAppCard title="🎁 Grants" desc="Aplica a grants World Chain" href="/mini-apps/grants" />
        <MiniAppCard title="🏆 Rewards" desc="Referidos virales por país" href="/mini-apps/rewards" />
      </div>
    </main>
  );
}

function MiniAppCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      className="p-6 border rounded-2xl hover:shadow-lg transition-all text-center group"
    >
      <h2 className="text-xl font-semibold group-hover:text-blue-600">{title}</h2>
      <p className="text-gray-500 mt-1 text-sm">{desc}</p>
    </a>
  );
}
