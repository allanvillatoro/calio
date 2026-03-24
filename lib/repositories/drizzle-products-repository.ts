import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { products } from '@/db/schema';
import type {
  FindAllProductsResult,
  IProduct,
  IProductsRepository,
  ProductChanges,
  ProductFilters,
} from './products-repository.interface';
import {
  buildProductsWhereClause,
  countProducts,
  findProductRows,
  getPagination,
  mapRowToProduct,
  normalizeFilters,
  omitUndefined,
  requireProductField,
} from './drizzle-products-repository.helpers';

export class DrizzleProductsRepository implements IProductsRepository {
  async save(input: ProductChanges): Promise<IProduct> {
    const [product] = await db
      .insert(products)
      .values({
        name: requireProductField(input, 'name'),
        description: requireProductField(input, 'description'),
        price: requireProductField(input, 'price'),
        quantity: requireProductField(input, 'quantity'),
        images: requireProductField(input, 'images'),
        category: requireProductField(input, 'category'),
        inStore: input.inStore ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return mapRowToProduct(product);
  }

  async findById(id: number): Promise<IProduct | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return product ? mapRowToProduct(product) : null;
  }

  async findAll(
    filters?: ProductFilters | URLSearchParams,
  ): Promise<FindAllProductsResult> {
    const normalizedFilters = normalizeFilters(filters);
    const { currentPage, limit, offset } = getPagination(normalizedFilters);
    const whereClause = buildProductsWhereClause(normalizedFilters);
    const [totalItems, productRows] = await Promise.all([
      countProducts(whereClause),
      findProductRows({
        whereClause,
        limit,
        offset,
      }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      data: productRows.map(mapRowToProduct),
      paging: {
        totalItems,
        totalPages,
        currentPage,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  async updateById(
    id: number,
    updates: ProductChanges,
  ): Promise<IProduct | null> {
    const [product] = await db
      .update(products)
      .set({
        ...omitUndefined(updates),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return product ? mapRowToProduct(product) : null;
  }

  async deleteById(id: number): Promise<boolean> {
    const deletedProducts = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deletedProducts.length > 0;
  }
}

export const productsRepository: IProductsRepository =
  new DrizzleProductsRepository();
