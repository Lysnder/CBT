import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from '@cbt/config/env';
import * as schema from './schema/index';

export function createDb(url: string = getEnv().DATABASE_URL, options: { max?: number } = {}) {
  const client = postgres(url, options);
  const db = drizzle(client, { schema, casing: 'snake_case' });
  return { db, client };
}

export type Db = ReturnType<typeof createDb>['db'];
