import { defineConfig } from 'drizzle-kit';
import { getEnv } from '@cbt/config/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  dbCredentials: { url: getEnv().DATABASE_URL },
  casing: 'snake_case',
});
