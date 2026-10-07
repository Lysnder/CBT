import type { Db } from '../src/client';
import { tier, tierCategoryDiscount } from '../src/schema/index';

const TIERS = [
  { code: 'silver', name: 'Silver', rank: 1, discountPct: '5' },
  { code: 'gold', name: 'Gold', rank: 2, discountPct: '10' },
  { code: 'platinum', name: 'Platinum', rank: 3, discountPct: '15' },
];

export async function seedTiers(db: Db): Promise<void> {
  await db
    .insert(tier)
    .values(TIERS.map(({ code, name, rank }) => ({ code, name, rank })))
    .onConflictDoNothing();

  const tierIds = new Map((await db.select().from(tier)).map((t) => [t.code, t.id]));

  // category_id NULL = statünün genel yüzdesi.
  await db
    .insert(tierCategoryDiscount)
    .values(
      TIERS.map((t) => ({
        tierId: tierIds.get(t.code)!,
        categoryId: null,
        discountPct: t.discountPct,
      })),
    )
    .onConflictDoNothing();
}
