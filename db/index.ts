import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseTarget = process.env.DB_TARGET ?? 'local';
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

const sql = neon(databaseUrl);

export const db = drizzle({
  client: sql,
  schema,
});

export type AppDb = typeof db;
export const activeDatabaseTarget = databaseTarget;
