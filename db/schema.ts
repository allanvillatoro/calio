import {
  bigint,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
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
  images: jsonb('images').$type<string[]>().notNull(),
  category: text('category').notNull(),
  inStore: boolean('in_store').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
