const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const PRODUCT_NAME_UNIQUE_CONSTRAINT = 'products_name_unique';
const PRODUCT_NAME_UNIQUE_MESSAGE = 'Ya existe un producto con ese nombre';

interface DatabaseError {
  code?: string;
  constraint?: string;
  cause?: unknown;
  error?: unknown;
  originalError?: unknown;
}

function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null;
}

function getDatabaseErrorCandidates(error: unknown): DatabaseError[] {
  if (!isDatabaseError(error)) {
    return [];
  }

  return [error, error.cause, error.error, error.originalError].filter(
    isDatabaseError,
  );
}

export function isProductNameUniqueViolation(error: unknown): boolean {
  return getDatabaseErrorCandidates(error).some(
    (candidate) =>
      candidate.code === POSTGRES_UNIQUE_VIOLATION_CODE &&
      candidate.constraint === PRODUCT_NAME_UNIQUE_CONSTRAINT,
  );
}

export function getProductNameUniqueViolationResult() {
  return {
    error: PRODUCT_NAME_UNIQUE_MESSAGE,
    details: [
      {
        path: 'name',
        message: PRODUCT_NAME_UNIQUE_MESSAGE,
      },
    ],
  };
}
