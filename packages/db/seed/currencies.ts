import type { Db } from '../src/client';
import { currency } from '../src/schema/index';

export async function seedCurrencies(db: Db): Promise<void> {
  await db
    .insert(currency)
    .values([
      { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
      { code: 'USD', name: 'ABD Doları', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
    ])
    .onConflictDoNothing();
}
