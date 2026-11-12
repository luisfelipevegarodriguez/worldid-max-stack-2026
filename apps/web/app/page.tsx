import Link from 'next/link';
import WorldIDGate from '@/components/WorldIDGate';

const apps = [
  { href: '/mini-apps/payments', title: 'Payments', desc: 'Remesas instantáneas LATAM' },
  { href: '/mini-apps/grants', title: 'Grants', desc: 'Aplica a grants World Chain' },
  { href: '/mini-apps/rewards', title: 'Rewards', desc: 'Referidos virales por país' },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">World ID Max Stack</h1>
        <p className="text-gray-500">Verificación humana — mini apps LATAM y agentes con delegación.</p>
      </div>
      <WorldIDGate action="login" mode="session" />
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {apps.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="rounded-2xl border p-6 text-center transition-all hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{app.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{app.desc}</p>
          </Link>
        ))}
      </div>
      <p className="max-w-xl text-center text-sm text-gray-500">
        Los agentes llaman a <code>POST /api/agent/trigger</code> con el JWT de sesión. Sin
        orquestador configurado esa ruta responde 503 y no finge el reenvío.
      </p>
    </main>
  );
}
