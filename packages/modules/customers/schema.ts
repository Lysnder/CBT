import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from '../auth/schema';

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

export const companyStatus = pgEnum('company_status', [
  'pending',
  'approved',
  'rejected',
  'suspended',
]);
export const companyUserRole = pgEnum('company_user_role', ['owner', 'buyer', 'viewer']);
export const addressKind = pgEnum('address_kind', ['shipping', 'billing']);

export const customerGroup = pgTable('customer_group', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  showVatIncluded: boolean().notNull().default(true),
  allowedPaymentMethods: text().array().notNull().default([]),
  ...timestamps,
});

// B2B statü (silver / gold / platinum). İndirim yüzdeleri pricing modülünde.
export const tier = pgTable('tier', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  rank: integer().notNull(),
  isActive: boolean().notNull().default(true),
  ...timestamps,
});

export const company = pgTable(
  'company',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    taxNumber: text().notNull().unique(),
    taxOffice: text().notNull(),
    tierId: uuid().references(() => tier.id),
    status: companyStatus().notNull().default('pending'),
    creditLimitCents: integer().notNull().default(0),
    paymentTermDays: integer().notNull().default(0),
    currency: char({ length: 3 }).notNull().default('TRY'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index().on(t.status)],
);

export const customer = pgTable(
  'customer',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .unique()
      .references(() => user.id),
    customerGroupId: uuid()
      .notNull()
      .references(() => customerGroup.id),
    // B2C müşteride null.
    companyId: uuid().references(() => company.id),
    phone: text(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index().on(t.companyId)],
);

export const companyUser = pgTable(
  'company_user',
  {
    companyId: uuid()
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: companyUserRole().notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.companyId, t.userId] })],
);

export const address = pgTable('address', {
  id: uuid().primaryKey().defaultRandom(),
  customerId: uuid()
    .notNull()
    .references(() => customer.id),
  kind: addressKind().notNull(),
  title: text().notNull(),
  fullName: text().notNull(),
  phone: text().notNull(),
  country: char({ length: 2 }).notNull().default('TR'),
  city: text().notNull(),
  district: text().notNull(),
  postalCode: text().notNull(),
  line1: text().notNull(),
  line2: text(),
  isDefault: boolean().notNull().default(false),
  ...timestamps,
  ...softDelete,
});

export const customerGroupRelations = relations(customerGroup, ({ many }) => ({
  customers: many(customer),
}));

export const tierRelations = relations(tier, ({ many }) => ({
  companies: many(company),
}));

export const companyRelations = relations(company, ({ one, many }) => ({
  tier: one(tier, { fields: [company.tierId], references: [tier.id] }),
  customers: many(customer),
  companyUsers: many(companyUser),
}));

export const customerRelations = relations(customer, ({ one, many }) => ({
  user: one(user, { fields: [customer.userId], references: [user.id] }),
  customerGroup: one(customerGroup, {
    fields: [customer.customerGroupId],
    references: [customerGroup.id],
  }),
  company: one(company, { fields: [customer.companyId], references: [company.id] }),
  addresses: many(address),
}));

export const companyUserRelations = relations(companyUser, ({ one }) => ({
  company: one(company, { fields: [companyUser.companyId], references: [company.id] }),
  user: one(user, { fields: [companyUser.userId], references: [user.id] }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  customer: one(customer, { fields: [address.customerId], references: [customer.id] }),
}));
