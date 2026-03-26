import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import productsData from '@/data/products.json';
import { getDatabaseTarget, getDatabaseUrl } from '@/db/config';
import { products } from '@/db/schema';
import dotenv from 'dotenv';
dotenv.config();

async function seedProducts() {
  const databaseTarget = getDatabaseTarget();
  const databaseUrl = getDatabaseUrl();
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  const db = drizzle({ client: pool });
  const now = new Date();

  try {
    console.log(`Seeding products into "${databaseTarget}" database...`);

    for (const product of productsData) {
      await db
        .insert(products)
        .values({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          images: product.images,
          category: product.category,
          inStore: product.inStore ?? false,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            images: product.images,
            category: product.category,
            inStore: product.inStore ?? false,
            updatedAt: now,
          },
        });
    }

    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('products', 'id'),
        COALESCE((SELECT MAX(id) FROM products), 1)
      );
    `);

    console.log(`Seeded ${productsData.length} products successfully.`);
  } finally {
    await pool.end();
  }
}

seedProducts().catch((error) => {
  console.error('Failed to seed products', error);
  process.exit(1);
});
