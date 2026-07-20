import {
  bigint,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const products = pgTable(
  'products',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: numeric('price', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    quantity: integer('quantity').notNull(),
    discount: integer('discount').notNull().default(0),
    images: jsonb('images').$type<string[]>().notNull(),
    slug: text('slug'),
    category: text('category').notNull(),
    inStoreSps: boolean('in_store_sps').notNull().default(false),
    inStorePro: boolean('in_store_pro').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('products_name_unique').on(sql`lower(trim(${table.name}))`),
    uniqueIndex('products_slug_unique').on(sql`lower(trim(${table.slug}))`),
  ],
);

export const laserEngravings = pgTable(
  'laser_engravings',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: numeric('price', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    quantity: integer('quantity').notNull(),
    discount: integer('discount').notNull().default(0),
    images: jsonb('images').$type<string[]>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('laser_engravings_slug_unique').on(
      sql`lower(trim(${table.slug}))`,
    ),
  ],
);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type LaserEngravingRow = typeof laserEngravings.$inferSelect;
export type NewLaserEngravingRow = typeof laserEngravings.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
