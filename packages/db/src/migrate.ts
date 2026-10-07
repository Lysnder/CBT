import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb } from './client';

const migrationsFolder = join(import.meta.dirname, '..', 'migrations');

if (!existsSync(join(migrationsFolder, 'meta', '_journal.json'))) {
  console.log('migration yok; önce `pnpm db:generate`');
} else {
  const { db, client } = createDb(undefined, { max: 1 });
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log('migration tamam');
}
