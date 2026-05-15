import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'World ID Max Stack 2026',
  description: 'Verificación humana con World ID — Mini Apps LATAM',
  openGraph: {
    title: 'World ID Max Stack 2026',
    description: 'Powered by World Chain — Verificación Orb + Passport',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
