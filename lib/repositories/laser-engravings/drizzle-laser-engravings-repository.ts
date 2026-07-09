import 'server-only';
import { eq } from 'drizzle-orm';
import { db, type AppDb } from '@/db';
import { laserEngravings } from '@/db/schema';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { omitUndefined } from '../repository.helpers';
import {
  getLaserEngravingConflictError,
  isLaserEngravingSlugUniqueViolation,
} from './laser-engravings-repository.errors';
import type {
  FindAllLaserEngravingsResult,
  ILaserEngravingsRepository,
  LaserEngravingChanges,
  LaserEngravingFilters,
} from './laser-engravings-repository.interface';
import {
  buildLaserEngravingsWhereClause,
  countLaserEngravingsWithDb,
  findLaserEngravingRowsWithDb,
  getPagination,
  mapRowToLaserEngraving,
  normalizeFilters,
  requireLaserEngravingField,
} from './drizzle-laser-engravings-repository.helpers';

export class DrizzleLaserEngravingsRepository
  implements ILaserEngravingsRepository
{
  constructor(private readonly database: AppDb) {}

  async save(input: LaserEngravingChanges): Promise<ILaserEngraving> {
    try {
      const [laserEngraving] = await this.database
        .insert(laserEngravings)
        .values({
          ...(input.id !== undefined ? { id: input.id } : {}),
          slug: requireLaserEngravingField(input, 'slug'),
          name: requireLaserEngravingField(input, 'name'),
          description: requireLaserEngravingField(input, 'description'),
          price: requireLaserEngravingField(input, 'price'),
          discount: input.discount ?? 0,
          quantity: requireLaserEngravingField(input, 'quantity'),
          images: requireLaserEngravingField(input, 'images'),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return mapRowToLaserEngraving(laserEngraving);
    } catch (error) {
      if (isLaserEngravingSlugUniqueViolation(error)) {
        throw getLaserEngravingConflictError();
      }

      throw error;
    }
  }

  async findById(id: number): Promise<ILaserEngraving | null> {
    const [laserEngraving] = await this.database
      .select()
      .from(laserEngravings)
      .where(eq(laserEngravings.id, id))
      .limit(1);

    return laserEngraving ? mapRowToLaserEngraving(laserEngraving) : null;
  }

  async findAll(
    filters?: LaserEngravingFilters | URLSearchParams,
  ): Promise<FindAllLaserEngravingsResult> {
    const normalizedFilters = normalizeFilters(filters);
    const { currentPage, limit, offset } = getPagination(normalizedFilters);
    const whereClause = buildLaserEngravingsWhereClause(normalizedFilters);
    const [totalItems, laserEngravingRows] = await Promise.all([
      countLaserEngravingsWithDb(this.database, whereClause),
      findLaserEngravingRowsWithDb(this.database, {
        whereClause,
        limit,
        offset,
      }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      data: laserEngravingRows.map(mapRowToLaserEngraving),
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
    updates: LaserEngravingChanges,
  ): Promise<ILaserEngraving | null> {
    try {
      const [laserEngraving] = await this.database
        .update(laserEngravings)
        .set({
          ...omitUndefined(updates),
          updatedAt: new Date(),
        })
        .where(eq(laserEngravings.id, id))
        .returning();

      return laserEngraving ? mapRowToLaserEngraving(laserEngraving) : null;
    } catch (error) {
      if (isLaserEngravingSlugUniqueViolation(error)) {
        throw getLaserEngravingConflictError();
      }

      throw error;
    }
  }

  async deleteById(id: number): Promise<boolean> {
    const deletedLaserEngravings = await this.database
      .delete(laserEngravings)
      .where(eq(laserEngravings.id, id))
      .returning({ id: laserEngravings.id });

    return deletedLaserEngravings.length > 0;
  }
}

export const laserEngravingsRepository: ILaserEngravingsRepository =
  new DrizzleLaserEngravingsRepository(db);
