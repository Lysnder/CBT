import { relations } from 'drizzle-orm';
import { boolean, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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

export const user = pgTable('user', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  // OAuth kullanıcılarında null.
  passwordHash: text(),
  name: text().notNull(),
  locale: text().notNull().default('tr'),
  isActive: boolean().notNull().default(true),
  ...timestamps,
  ...softDelete,
});

export const role = pgTable('role', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  ...timestamps,
});

export const userRole = pgTable(
  'user_role',
  {
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    roleId: uuid()
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export const session = pgTable('session', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text().notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});

export const userRelations = relations(user, ({ many }) => ({
  userRoles: many(userRole),
  sessions: many(session),
}));

export const roleRelations = relations(role, ({ many }) => ({
  userRoles: many(userRole),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, { fields: [userRole.userId], references: [user.id] }),
  role: one(role, { fields: [userRole.roleId], references: [role.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));
