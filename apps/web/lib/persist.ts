import { Prisma } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { databaseUrl, supabaseConfig } from './config';

export type PersistResult = 'created' | 'duplicate' | 'unconfigured' | 'error';

type NullifierInput = {
  nullifierHash: string;
  action: string;
  metadata: Record<string, unknown>;
};

const globalForPrisma = globalThis as unknown as {
  prisma?: import('@prisma/client').PrismaClient;
};

async function getPrisma() {
  const url = databaseUrl();
  if (!url) return null;
  if (!globalForPrisma.prisma) {
    const { PrismaClient } = await import('@prisma/client');
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

function isUniqueViolation(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return true;
  if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505') {
    return true;
  }
  return false;
}

export async function recordNullifier(input: NullifierInput): Promise<PersistResult> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.nullifier.create({
        data: {
          nullifierHash: input.nullifierHash,
          action: input.action,
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      });
      return 'created';
    } catch (error) {
      if (isUniqueViolation(error)) return 'duplicate';
      console.error('[db] prisma nullifier write failed');
      return 'error';
    }
  }

  const supabase = supabaseConfig();
  if (supabase) {
    try {
      const client = createClient(supabase.url, supabase.serviceRoleKey);
      const { error } = await client.from('nullifiers').insert({
        nullifier_hash: input.nullifierHash,
        action: input.action,
        metadata: input.metadata,
      });
      if (!error) return 'created';
      if (error.code === '23505') return 'duplicate';
      console.error('[db] supabase nullifier write failed', error.code);
      return 'error';
    } catch (error) {
      console.error('[db] supabase client failed', error);
      return 'error';
    }
  }

  return 'unconfigured';
}
