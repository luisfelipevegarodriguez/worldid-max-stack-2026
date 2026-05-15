import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Guarda un nullifier para prevenir doble-uso (antifraude).
 * Retorna true si es nuevo, false si ya existía (fraude detectado).
 */
export async function saveNullifier(
  nullifier: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const { data, error } = await supabase
    .from('nullifiers')
    .insert({ nullifier_hash: nullifier, action, metadata, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error?.code === '23505') return false; // Duplicate → fraude
  if (error) throw new Error(error.message);
  return !!data;
}

export async function nullifierExists(nullifier: string): Promise<boolean> {
  const { data } = await supabase
    .from('nullifiers')
    .select('id')
    .eq('nullifier_hash', nullifier)
    .maybeSingle();
  return !!data;
}
