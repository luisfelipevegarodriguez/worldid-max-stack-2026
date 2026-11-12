/** True when a value is missing or still a placeholder from .env.example. */
export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /x{4,}|your_|placeholder|changeme|<.*>/i.test(trimmed);
}

/** Read an environment variable, treating example placeholders as unset. */
export function configured(name: string): string | undefined {
  const value = process.env[name];
  return isPlaceholder(value) ? undefined : value;
}

export function worldAppId(): string | undefined {
  return configured('NEXT_PUBLIC_WORLD_APP_ID');
}

export function worldRpId(): string | undefined {
  return configured('WORLD_RP_ID');
}

export function signingKey(): string | undefined {
  return configured('WORLD_SIGNING_KEY') ?? configured('RP_SIGNING_KEY');
}

export function jwtSecret(): string | undefined {
  return configured('JWT_SECRET');
}

export function databaseUrl(): string | undefined {
  return configured('DATABASE_URL');
}

export function supabaseConfig(): { url: string; serviceRoleKey: string } | undefined {
  const url = configured('SUPABASE_URL');
  const serviceRoleKey = configured('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return undefined;
  return { url, serviceRoleKey };
}
