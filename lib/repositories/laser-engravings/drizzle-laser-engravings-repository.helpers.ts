import { count, desc, gte, ilike, type SQL } from 'drizzle-orm';
import { laserEngravings, type LaserEngravingRow } from '@/db/schema';
import type { AppDb } from '@/db';
import { requireField } from '../repository.helpers';
import {
  calculatePriceWithDiscount,
  combineSqlConditions,
  normalizeSellableFilters,
} from '../sellable-items-repository.helpers';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type {
  LaserEngravingChanges,
  LaserEngravingFilters,
} from './laser-engravings-repository.interface';

export { getPagination } from '../sellable-items-repository.helpers';

export function requireLaserEngravingField<
  K extends keyof LaserEngravingChanges,
>(
  input: LaserEngravingChanges,
  field: K,
): NonNullable<LaserEngravingChanges[K]> {
  return requireField(input, field, {
    label: `laserEngraving.${String(field)}`,
  });
}

export function mapRowToLaserEngraving(
  row: LaserEngravingRow,
): ILaserEngraving {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    discount: row.discount,
    priceWithDiscount: calculatePriceWithDiscount(row.price, row.discount),
    quantity: row.quantity,
    images: row.images,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function normalizeFilters(
  filters?: LaserEngravingFilters | URLSearchParams,
): LaserEngravingFilters {
  return normalizeSellableFilters(filters);
}

export function buildLaserEngravingsWhereClause(
  filters: LaserEngravingFilters,
) {
  return combineSqlConditions([
    filters.includeOutOfStock ? undefined : gte(laserEngravings.quantity, 1),
    filters.query
      ? ilike(laserEngravings.name, `%${filters.query}%`)
      : undefined,
  ]);
}

export async function countLaserEngravingsWithDb(db: AppDb, whereClause?: SQL) {
  const [{ totalItems }] = whereClause
    ? await db
        .select({ totalItems: count() })
        .from(laserEngravings)
        .where(whereClause)
    : await db.select({ totalItems: count() }).from(laserEngravings);

  return totalItems;
}

function dbSelectLaserEngravings(
  db: AppDb,
  options: {
    whereClause?: SQL;
    limit: number;
    offset: number;
  },
) {
  const { whereClause, limit, offset } = options;

  return whereClause
    ? db
        .select()
        .from(laserEngravings)
        .where(whereClause)
        .orderBy(desc(laserEngravings.id))
        .limit(limit)
        .offset(offset)
    : db
        .select()
        .from(laserEngravings)
        .orderBy(desc(laserEngravings.id))
        .limit(limit)
        .offset(offset);
}

export async function findLaserEngravingRowsWithDb(
  db: AppDb,
  options: {
    whereClause?: SQL;
    limit: number;
    offset: number;
  },
) {
  return dbSelectLaserEngravings(db, options);
}
