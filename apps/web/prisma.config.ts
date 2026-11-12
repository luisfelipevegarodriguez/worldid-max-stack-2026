import { defineConfig } from 'prisma/config';

// Generate and migrate read this file. A localhost URL is only a placeholder so
// `prisma generate` can load the config when DATABASE_URL is unset. Generate does
// not open a connection. Migrate is not part of the free bootstrap.
const databaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    ? process.env.DATABASE_URL
    : 'postgresql://build:build@127.0.0.1:5432/worldid_build';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
