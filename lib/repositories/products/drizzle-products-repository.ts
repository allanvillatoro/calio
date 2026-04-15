import 'server-only';
import { eq } from 'drizzle-orm';
import { db, type AppDb } from '@/db';
import { products } from '@/db/schema';
import type {
  FindAllProductsResult,
  IProductsRepository,
  ProductChanges,
  ProductFilters,
} from './products-repository.interface';
import {
  buildProductsWhereClause,
  countProductsWithDb,
  findProductRowsWithDb,
  getPagination,
  mapRowToProduct,
  normalizeFilters,
  requireProductField,
} from './drizzle-products-repository.helpers';
import {
  getProductConflictError,
  isProductNameUniqueViolation,
} from './products-repository.errors';
import { omitUndefined } from '../repository.helpers';
import type { IProduct } from '@/lib/interfaces/product';

export class DrizzleProductsRepository implements IProductsRepository {
  constructor(private readonly database: AppDb) {}

  async save(input: ProductChanges): Promise<IProduct> {
    try {
      const [product] = await this.database
        .insert(products)
        .values({
          ...(input.id !== undefined ? { id: input.id } : {}),
          name: requireProductField(input, 'name'),
          description: requireProductField(input, 'description'),
          price: requireProductField(input, 'price'),
          discount: input.discount ?? 0,
          quantity: requireProductField(input, 'quantity'),
          images: requireProductField(input, 'images'),
          category: requireProductField(input, 'category'),
          inStore: input.inStore ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return mapRowToProduct(product);
    } catch (error) {
      if (isProductNameUniqueViolation(error)) {
        throw getProductConflictError();
      }

      throw error;
    }
  }

  async findById(id: number): Promise<IProduct | null> {
    const [product] = await this.database
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
      countProductsWithDb(this.database, whereClause),
      findProductRowsWithDb(this.database, {
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
    try {
      const [product] = await this.database
        .update(products)
        .set({
          ...omitUndefined(updates),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      return product ? mapRowToProduct(product) : null;
    } catch (error) {
      if (isProductNameUniqueViolation(error)) {
        throw getProductConflictError();
      }

      throw error;
    }
  }

  async deleteById(id: number): Promise<boolean> {
    const deletedProducts = await this.database
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deletedProducts.length > 0;
  }
}

export const productsRepository: IProductsRepository =
  new DrizzleProductsRepository(db);
