export type DatabaseTarget = 'local' | 'production';

export function getDatabaseTarget(): DatabaseTarget {
  return process.env.DB_TARGET === 'production' ? 'production' : 'local';
}

export function getDatabaseUrl(): string {
  const databaseTarget = getDatabaseTarget();
  const databaseUrl =
    databaseTarget === 'production'
      ? process.env.DATABASE_URL
      : process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      databaseTarget === 'production'
        ? 'DATABASE_URL is not set'
        : 'LOCAL_DATABASE_URL is not set',
    );
  }

  return databaseUrl;
}
