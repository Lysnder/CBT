import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getEnv } from '@cbt/config/env';
import { seedAll } from '../seed/index';
import { createDb } from '../src/client';

const TEST_DB = 'cbt_test';

const EXPECTED_TABLES = [
  // auth
  'user',
  'role',
  'user_role',
  'session',
  // customers
  'customer_group',
  'tier',
  'company',
  'customer',
  'company_user',
  'address',
  // catalog
  'category',
  'category_translation',
  'attribute_set',
  'attribute',
  'attribute_option',
  'product',
  'product_translation',
  'product_attribute_value',
  'product_variant',
  'product_variant_option',
  'product_image',
  // pricing
  'tier_category_discount',
  'product_tier_override',
  'currency',
  'currency_rate',
  // inventory
  'warehouse',
  'inventory_level',
  'stock_movement',
];

const EXPECTED_COUNTS: Record<string, number> = {
  role: 3,
  user: 3,
  user_role: 3,
  tier: 3,
  tier_category_discount: 3,
  customer_group: 2,
  company: 1,
  company_user: 1,
  customer: 2,
  currency: 3,
  currency_rate: 0,
  warehouse: 2,
  attribute_set: 2,
  attribute: 6,
  attribute_option: 8,
  category: 4,
  category_translation: 8,
  product: 10,
  product_translation: 20,
  product_attribute_value: 26,
  product_variant: 12,
  product_variant_option: 4,
  inventory_level: 24,
  product_tier_override: 0,
};

const adminUrl = getEnv().DATABASE_URL;
const testUrl = new URL(adminUrl);
testUrl.pathname = `/${TEST_DB}`;

const { db, client } = createDb(testUrl.toString(), { max: 1 });

async function rowCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of Object.keys(EXPECTED_COUNTS)) {
    const [row] = await db.execute<{ count: number }>(
      sql`select count(*)::int as count from ${sql.identifier(table)}`,
    );
    counts[table] = row!.count;
  }
  return counts;
}

beforeAll(async () => {
  // Geliştirme verisine dokunmamak için ayrı veritabanı; her koşuda sıfırdan kurulur.
  const admin = postgres(adminUrl, { max: 1, onnotice: () => {} });
  await admin.unsafe(`drop database if exists ${TEST_DB} with (force)`);
  await admin.unsafe(`create database ${TEST_DB}`);
  await admin.end();

  await migrate(db, { migrationsFolder: join(import.meta.dirname, '..', 'migrations') });
}, 60_000);

afterAll(async () => {
  await client.end();
});

describe('şema', () => {
  it('migration beklenen tabloları oluşturur', async () => {
    const rows = await db.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    );
    expect(rows.map((r) => r.table_name).sort()).toEqual([...EXPECTED_TABLES].sort());
  });

  it('float kolon yoktur', async () => {
    const rows = await db.execute(
      sql`select table_name, column_name from information_schema.columns
          where table_schema = 'public' and data_type in ('double precision', 'real')`,
    );
    expect(rows).toEqual([]);
  });

  it('para kolonları integer kuruştur', async () => {
    const rows = await db.execute<{ column_name: string; data_type: string }>(
      sql`select column_name, data_type from information_schema.columns
          where table_schema = 'public' and column_name like '%\_cents'`,
    );
    expect(rows.map((r) => r.column_name).sort()).toEqual([
      'credit_limit_cents',
      'list_price_cents',
      'price_delta_cents',
    ]);
    expect(rows.every((r) => r.data_type === 'integer')).toBe(true);
  });
});

describe('seed', () => {
  it('beklenen satır sayılarını üretir ve idempotenttir', async () => {
    await seedAll(db);
    expect(await rowCounts()).toEqual(EXPECTED_COUNTS);

    await seedAll(db);
    expect(await rowCounts()).toEqual(EXPECTED_COUNTS);
  }, 60_000);

  it('statü genel indirimleri 5 / 10 / 15', async () => {
    const rows = await db.execute<{ code: string; discount_pct: string }>(
      sql`select t.code, d.discount_pct from tier_category_discount d
          join tier t on t.id = d.tier_id where d.category_id is null order by t.rank`,
    );
    expect(rows.map((r) => [r.code, Number(r.discount_pct)])).toEqual([
      ['silver', 5],
      ['gold', 10],
      ['platinum', 15],
    ]);
  });

  it('her varyantın iki depoda stoğu vardır', async () => {
    const rows = await db.execute(
      sql`select v.sku from product_variant v
          left join inventory_level l on l.variant_id = v.id
          group by v.sku having count(l.warehouse_id) <> 2`,
    );
    expect(rows).toEqual([]);
  });
});
