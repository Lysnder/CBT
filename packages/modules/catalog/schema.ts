import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  char,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

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

export const attributeType = pgEnum('attribute_type', ['text', 'number', 'boolean', 'select']);
export const productType = pgEnum('product_type', ['physical', 'digital', 'service', 'bundle']);
export const productStatus = pgEnum('product_status', ['draft', 'active', 'archived']);

// Ağaç; path/level kolonu yok, alt ağaç recursive CTE ile okunur.
export const category = pgTable('category', {
  id: uuid().primaryKey().defaultRandom(),
  parentId: uuid().references((): AnyPgColumn => category.id),
  slug: text().notNull().unique(),
  sortOrder: integer().notNull().default(0),
  isActive: boolean().notNull().default(true),
  ...timestamps,
  ...softDelete,
});

export const categoryTranslation = pgTable(
  'category_translation',
  {
    id: uuid().primaryKey().defaultRandom(),
    categoryId: uuid()
      .notNull()
      .references(() => category.id, { onDelete: 'cascade' }),
    locale: char({ length: 2 }).notNull(),
    name: text().notNull(),
    description: text(),
    ...timestamps,
  },
  (t) => [unique().on(t.categoryId, t.locale)],
);

export const attributeSet = pgTable('attribute_set', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  ...timestamps,
});

export const attribute = pgTable(
  'attribute',
  {
    id: uuid().primaryKey().defaultRandom(),
    attributeSetId: uuid()
      .notNull()
      .references(() => attributeSet.id, { onDelete: 'cascade' }),
    code: text().notNull(),
    name: text().notNull(),
    type: attributeType().notNull(),
    unit: text(),
    isFilterable: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [unique().on(t.attributeSetId, t.code)],
);

// Yalnızca `select` tipindeki attribute'lar için.
export const attributeOption = pgTable(
  'attribute_option',
  {
    id: uuid().primaryKey().defaultRandom(),
    attributeId: uuid()
      .notNull()
      .references(() => attribute.id, { onDelete: 'cascade' }),
    value: text().notNull(),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [unique().on(t.attributeId, t.value)],
);

export const product = pgTable(
  'product',
  {
    id: uuid().primaryKey().defaultRandom(),
    type: productType().notNull().default('physical'),
    sku: text().notNull().unique(),
    slug: text().notNull().unique(),
    categoryId: uuid()
      .notNull()
      .references(() => category.id),
    attributeSetId: uuid().references(() => attributeSet.id),
    brand: text(),
    // Tek liste fiyatı (KDV hariç). Bayi fiyatı saklanmaz, hesaplanır.
    listPriceCents: integer().notNull(),
    currency: char({ length: 3 }).notNull().default('TRY'),
    vatRate: numeric({ precision: 5, scale: 2 }).notNull().default('20'),
    status: productStatus().notNull().default('draft'),
    hasVariants: boolean().notNull().default(false),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index().on(t.categoryId), index().on(t.status)],
);

export const productTranslation = pgTable(
  'product_translation',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    locale: char({ length: 2 }).notNull(),
    name: text().notNull(),
    shortDescription: text(),
    description: text(),
    metaTitle: text(),
    metaDescription: text(),
    ...timestamps,
  },
  (t) => [unique().on(t.productId, t.locale), index().on(t.locale, t.name)],
);

// EAV: attribute tipine göre tek bir değer kolonu dolar.
export const productAttributeValue = pgTable(
  'product_attribute_value',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    attributeId: uuid()
      .notNull()
      .references(() => attribute.id),
    valueText: text(),
    valueNumber: numeric(),
    valueBool: boolean(),
    optionId: uuid().references(() => attributeOption.id),
    ...timestamps,
  },
  (t) => [unique().on(t.productId, t.attributeId)],
);

// Varyantsız ürün = tek varyant (sku = product.sku).
export const productVariant = pgTable(
  'product_variant',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => product.id),
    sku: text().notNull().unique(),
    barcode: text(),
    name: text().notNull(),
    priceDeltaCents: integer().notNull().default(0),
    weightGrams: integer(),
    packSize: integer().notNull().default(1),
    minOrderQty: integer().notNull().default(1),
    isActive: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index().on(t.productId)],
);

// Varyantın seçenek kombinasyonu (ör. renk: siyah); attribute başına tek seçenek.
export const productVariantOption = pgTable(
  'product_variant_option',
  {
    variantId: uuid()
      .notNull()
      .references(() => productVariant.id, { onDelete: 'cascade' }),
    attributeId: uuid()
      .notNull()
      .references(() => attribute.id),
    optionId: uuid()
      .notNull()
      .references(() => attributeOption.id),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.variantId, t.attributeId] })],
);

export const productImage = pgTable('product_image', {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid()
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  variantId: uuid().references(() => productVariant.id),
  url: text().notNull(),
  alt: text(),
  sortOrder: integer().notNull().default(0),
  isPrimary: boolean().notNull().default(false),
  ...timestamps,
});

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: 'category_tree',
  }),
  children: many(category, { relationName: 'category_tree' }),
  translations: many(categoryTranslation),
  products: many(product),
}));

export const categoryTranslationRelations = relations(categoryTranslation, ({ one }) => ({
  category: one(category, {
    fields: [categoryTranslation.categoryId],
    references: [category.id],
  }),
}));

export const attributeSetRelations = relations(attributeSet, ({ many }) => ({
  attributes: many(attribute),
  products: many(product),
}));

export const attributeRelations = relations(attribute, ({ one, many }) => ({
  attributeSet: one(attributeSet, {
    fields: [attribute.attributeSetId],
    references: [attributeSet.id],
  }),
  options: many(attributeOption),
}));

export const attributeOptionRelations = relations(attributeOption, ({ one }) => ({
  attribute: one(attribute, {
    fields: [attributeOption.attributeId],
    references: [attribute.id],
  }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, { fields: [product.categoryId], references: [category.id] }),
  attributeSet: one(attributeSet, {
    fields: [product.attributeSetId],
    references: [attributeSet.id],
  }),
  translations: many(productTranslation),
  attributeValues: many(productAttributeValue),
  variants: many(productVariant),
  images: many(productImage),
}));

export const productTranslationRelations = relations(productTranslation, ({ one }) => ({
  product: one(product, { fields: [productTranslation.productId], references: [product.id] }),
}));

export const productAttributeValueRelations = relations(productAttributeValue, ({ one }) => ({
  product: one(product, {
    fields: [productAttributeValue.productId],
    references: [product.id],
  }),
  attribute: one(attribute, {
    fields: [productAttributeValue.attributeId],
    references: [attribute.id],
  }),
  option: one(attributeOption, {
    fields: [productAttributeValue.optionId],
    references: [attributeOption.id],
  }),
}));

export const productVariantRelations = relations(productVariant, ({ one, many }) => ({
  product: one(product, { fields: [productVariant.productId], references: [product.id] }),
  options: many(productVariantOption),
  images: many(productImage),
}));

export const productVariantOptionRelations = relations(productVariantOption, ({ one }) => ({
  variant: one(productVariant, {
    fields: [productVariantOption.variantId],
    references: [productVariant.id],
  }),
  attribute: one(attribute, {
    fields: [productVariantOption.attributeId],
    references: [attribute.id],
  }),
  option: one(attributeOption, {
    fields: [productVariantOption.optionId],
    references: [attributeOption.id],
  }),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, { fields: [productImage.productId], references: [product.id] }),
  variant: one(productVariant, {
    fields: [productImage.variantId],
    references: [productVariant.id],
  }),
}));
