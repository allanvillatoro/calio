import { ProductConflictError } from '@/lib/errors';
import { isPostgresUniqueViolation } from '@/lib/repositories/database-errors';

const PRODUCT_NAME_UNIQUE_CONSTRAINT = 'products_name_unique';
const PRODUCT_NAME_UNIQUE_MESSAGE = 'Ya existe un producto con ese nombre';

export function isProductNameUniqueViolation(error: unknown): boolean {
  return isPostgresUniqueViolation(error, PRODUCT_NAME_UNIQUE_CONSTRAINT);
}

export function getProductConflictError() {
  return new ProductConflictError(
    PRODUCT_NAME_UNIQUE_MESSAGE,
    'PRODUCT_NAME_ALREADY_EXISTS',
    [
      {
        path: 'name',
        message: PRODUCT_NAME_UNIQUE_MESSAGE,
      },
    ],
  );
}
