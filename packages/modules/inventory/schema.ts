import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { productVariant } from '../catalog/schema';

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const softDelete = {
  deletedAt: timestamp({ withTimezone: true }),
};

export const stockMovementReason = pgEnum('stock_movement_reason', [
  'purchase',
  'sale',
  'return',
  'adjustment',
  'transfer',
]);

// priority: küçük sayı = yüksek öncelik (çıkış deposu seçimi spec 005).
export const warehouse = pgTable('warehouse', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  priority: integer().notNull(),
  city: text().notNull(),
  isActive: boolean().notNull().default(true),
  ...timestamps,
  ...softDelete,
});

// available = on_hand − reserved; hesaplanır, kolon değil.
export const inventoryLevel = pgTable(
  'inventory_level',
  {
    variantId: uuid()
      .notNull()
      .references(() => productVariant.id),
    warehouseId: uuid()
      .notNull()
      .references(() => warehouse.id),
    onHand: integer().notNull().default(0),
    reserved: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.variantId, t.warehouseId] }), index().on(t.warehouseId)],
);

// Audit kaydı; Faz 1'de doldurulur.
export const stockMovement = pgTable('stock_movement', {
  id: uuid().primaryKey().defaultRandom(),
  variantId: uuid()
    .notNull()
    .references(() => productVariant.id),
  warehouseId: uuid()
    .notNull()
    .references(() => warehouse.id),
  delta: integer().notNull(),
  reason: stockMovementReason().notNull(),
  referenceType: text(),
  referenceId: uuid(),
  note: text(),
  ...timestamps,
});

export const warehouseRelations = relations(warehouse, ({ many }) => ({
  inventoryLevels: many(inventoryLevel),
  stockMovements: many(stockMovement),
}));

export const inventoryLevelRelations = relations(inventoryLevel, ({ one }) => ({
  variant: one(productVariant, {
    fields: [inventoryLevel.variantId],
    references: [productVariant.id],
  }),
  warehouse: one(warehouse, {
    fields: [inventoryLevel.warehouseId],
    references: [warehouse.id],
  }),
}));

export const stockMovementRelations = relations(stockMovement, ({ one }) => ({
  variant: one(productVariant, {
    fields: [stockMovement.variantId],
    references: [productVariant.id],
  }),
  warehouse: one(warehouse, {
    fields: [stockMovement.warehouseId],
    references: [warehouse.id],
  }),
}));
