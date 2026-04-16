import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { productsRepository } from '../lib/repositories/products/drizzle-products-repository';
import type { IProduct } from '../lib/interfaces/product';
import type { ProductChanges } from '../lib/repositories/products/products-repository.interface';

type ProductSeed = Omit<
  IProduct,
  'createdAt' | 'updatedAt' | 'priceWithDiscount'
> & {
  createdAt?: string;
  updatedAt?: string;
  priceWithDiscount?: number;
};

const DATA_FILE_PATH = path.resolve(process.cwd(), 'scripts/data.json');
const INSERT_DELAY_MS = 500;

function compareProducts(a: ProductSeed, b: ProductSeed): number {
  if (a.id !== b.id) {
    return a.id - b.id;
  }

  return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
}

function normalizeProduct(product: ProductSeed): ProductChanges {
  return {
    id: product.id,
    name: product.name.trim(),
    description: product.description.trim(),
    price: product.price,
    discount: product.discount ?? 0,
    quantity: product.quantity,
    images: product.images,
    category: product.category.trim(),
    inStore: product.inStore ?? false,
  };
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function assertValidProducts(data: unknown): asserts data is ProductSeed[] {
  if (!Array.isArray(data)) {
    throw new Error('scripts/data.json must contain an array of products');
  }

  for (let index = 0; index < data.length; index += 1) {
    const product = data[index];

    if (
      typeof product !== 'object' ||
      product === null ||
      typeof product.id !== 'number' ||
      typeof product.name !== 'string' ||
      typeof product.description !== 'string' ||
      typeof product.price !== 'number' ||
      typeof product.quantity !== 'number' ||
      typeof product.category !== 'string' ||
      !Array.isArray(product.images)
    ) {
      throw new Error(`Invalid product at index ${index}`);
    }
  }
}

async function loadAndSortProducts(): Promise<ProductSeed[]> {
  const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf8');
  const parsedData: unknown = JSON.parse(fileContent);

  assertValidProducts(parsedData);

  const sortedProducts = [...parsedData].sort(compareProducts);

  await fs.writeFile(
    DATA_FILE_PATH,
    `${JSON.stringify(sortedProducts, null, 2)}\n`,
    'utf8',
  );

  return sortedProducts;
}

async function importProducts(products: ProductSeed[]): Promise<void> {
  let insertedCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const existingProduct = await productsRepository.findById(product.id);

    if (existingProduct) {
      skippedCount += 1;
      console.log(`Skipping product ${product.id}: already exists`);
      continue;
    }

    const savedProduct = await productsRepository.save(
      normalizeProduct(product),
    );
    insertedCount += 1;
    console.log(`Inserted product ${savedProduct.id}: ${savedProduct.name}`);

    if (index < products.length - 1) {
      await sleep(INSERT_DELAY_MS);
    }
  }

  console.log(
    `Import finished. Inserted: ${insertedCount}. Skipped existing: ${skippedCount}.`,
  );
}

async function main(): Promise<void> {
  const sortedProducts = await loadAndSortProducts();
  console.log(
    `Sorted ${sortedProducts.length} products in ${path.relative(process.cwd(), DATA_FILE_PATH)}.`,
  );
  await importProducts(sortedProducts);
}

main().catch((error: unknown) => {
  console.error('Failed to import products.');
  console.error(error);
  process.exit(1);
});
