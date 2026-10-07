import type { Db } from '../src/client';
import { warehouse } from '../src/schema/index';

export async function seedWarehouses(db: Db): Promise<void> {
  await db
    .insert(warehouse)
    .values([
      { code: 'IST', name: 'İstanbul Merkez Depo', priority: 1, city: 'İstanbul' },
      { code: 'ANK', name: 'Ankara Depo', priority: 2, city: 'Ankara' },
    ])
    .onConflictDoNothing();
}
