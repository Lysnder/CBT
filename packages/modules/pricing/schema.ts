import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { category, product } from '../catalog/schema';
import { tier } from '../customers/schema';

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// category_id NULL = statünün genel yüzdesi. NULL'lar eşit sayılır ki statü başına tek genel satır olsun.
export const tierCategoryDiscount = pgTable(
  'tier_category_discount',
  {
    id: uuid().primaryKey().defaultRandom(),
    tierId: uuid()
      .notNull()
      .references(() => tier.id, { onDelete: 'cascade' }),
    categoryId: uuid().references(() => category.id, { onDelete: 'cascade' }),
    discountPct: numeric({ precision: 5, scale: 2 }).notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.tierId, t.categoryId).nullsNotDistinct()],
);

export const productTierOverride = pgTable(
  'product_tier_override',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    tierId: uuid()
      .notNull()
      .references(() => tier.id, { onDelete: 'cascade' }),
    discountPct: numeric({ precision: 5, scale: 2 }).notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.productId, t.tierId)],
);

export const currency = pgTable('currency', {
  code: char({ length: 3 }).primaryKey(),
  name: text().notNull(),
  symbol: text().notNull(),
  decimals: integer().notNull().default(2),
  isActive: boolean().notNull().default(true),
  ...timestamps,
});

export const currencyRate = pgTable(
  'currency_rate',
  {
    id: uuid().primaryKey().defaultRandom(),
    base: char({ length: 3 })
      .notNull()
      .references(() => currency.code),
    quote: char({ length: 3 })
      .notNull()
      .references(() => currency.code),
    rate: numeric({ precision: 18, scale: 6 }).notNull(),
    source: text().notNull().default('TCMB'),
    effectiveDate: date().notNull(),
    ...timestamps,
  },
  (t) => [
    unique().on(t.base, t.quote, t.effectiveDate),
    index().on(t.quote, t.effectiveDate.desc()),
  ],
);

export const tierCategoryDiscountRelations = relations(tierCategoryDiscount, ({ one }) => ({
  tier: one(tier, { fields: [tierCategoryDiscount.tierId], references: [tier.id] }),
  category: one(category, {
    fields: [tierCategoryDiscount.categoryId],
    references: [category.id],
  }),
}));

export const productTierOverrideRelations = relations(productTierOverride, ({ one }) => ({
  product: one(product, { fields: [productTierOverride.productId], references: [product.id] }),
  tier: one(tier, { fields: [productTierOverride.tierId], references: [tier.id] }),
}));

export const currencyRelations = relations(currency, ({ many }) => ({
  baseRates: many(currencyRate, { relationName: 'currency_rate_base' }),
  quoteRates: many(currencyRate, { relationName: 'currency_rate_quote' }),
}));

export const currencyRateRelations = relations(currencyRate, ({ one }) => ({
  baseCurrency: one(currency, {
    fields: [currencyRate.base],
    references: [currency.code],
    relationName: 'currency_rate_base',
  }),
  quoteCurrency: one(currency, {
    fields: [currencyRate.quote],
    references: [currency.code],
    relationName: 'currency_rate_quote',
  }),
}));
