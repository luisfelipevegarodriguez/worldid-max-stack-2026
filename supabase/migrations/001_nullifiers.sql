-- Migración: tabla nullifiers antifraude World ID
-- Ejecutar en: Supabase SQL Editor

CREATE TABLE IF NOT EXISTS nullifiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash text UNIQUE NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_nullifiers_hash ON nullifiers(nullifier_hash);
CREATE INDEX IF NOT EXISTS idx_nullifiers_action ON nullifiers(action);
CREATE INDEX IF NOT EXISTS idx_nullifiers_created_at ON nullifiers(created_at DESC);

-- RLS: solo service_role puede leer/escribir
ALTER TABLE nullifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON nullifiers
  USING (false)
  WITH CHECK (false);
