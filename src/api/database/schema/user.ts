import type { ROLE } from '../../base/role';

import { text, serial, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role').$type<ROLE>().default('user').notNull(),
  status: varchar('status').$type<'register' | 'active' | 'inactive' | 'suspended' | 'deleted'>().default('register').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
