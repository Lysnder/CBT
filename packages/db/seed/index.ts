import { fileURLToPath } from 'node:url';
import { createDb, type Db } from '../src/client';
import { seedCatalog } from './catalog';
import { seedCurrencies } from './currencies';
import { seedGroups } from './groups';
import { seedRoles } from './roles';
import { seedTiers } from './tiers';
import { seedWarehouses } from './warehouses';

// Sıra FK bağımlılığına göre; her adım idempotent (onConflictDoNothing).
export async function seedAll(db: Db): Promise<void> {
  await seedCurrencies(db);
  await seedRoles(db);
  await seedTiers(db);
  await seedGroups(db);
  await seedWarehouses(db);
  await seedCatalog(db);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { db, client } = createDb(undefined, { max: 1 });
  try {
    await seedAll(db);
    console.log('seed tamam');
  } finally {
    await client.end();
  }
}
