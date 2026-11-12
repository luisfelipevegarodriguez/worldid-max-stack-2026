import { NextResponse } from 'next/server';
import { databaseUrl, jwtSecret, signingKey, supabaseConfig, worldAppId, worldRpId } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'web',
    configured: {
      worldApp: Boolean(worldAppId()),
      worldRp: Boolean(worldRpId()),
      signing: Boolean(signingKey()),
      jwt: Boolean(jwtSecret()),
      database: Boolean(databaseUrl() || supabaseConfig()),
    },
  });
}
