export type DatabaseTarget = 'testing' | 'production';

export function getDatabaseTarget(): DatabaseTarget {
  return process.env.DB_TARGET === 'production' ? 'production' : 'testing';
}

export function getDatabaseUrl(): string {
  const databaseTarget = getDatabaseTarget();
  const databaseUrl =
    databaseTarget === 'production'
      ? process.env.DATABASE_URL
      : process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      databaseTarget === 'production'
        ? 'DATABASE_URL is not set'
        : 'TEST_DATABASE_URL is not set',
    );
  }

  return databaseUrl;
}
