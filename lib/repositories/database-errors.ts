const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

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

export function isPostgresUniqueViolation(
  error: unknown,
  constraint: string,
): boolean {
  return getDatabaseErrorCandidates(error).some(
    (candidate) =>
      candidate.code === POSTGRES_UNIQUE_VIOLATION_CODE &&
      candidate.constraint === constraint,
  );
}
