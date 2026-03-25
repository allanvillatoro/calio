import 'server-only';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseTarget, getDatabaseUrl } from './config';
import * as schema from './schema';

const databaseTarget = getDatabaseTarget();
const databaseUrl = getDatabaseUrl();

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle({
  client: pool,
  schema,
});

export type AppDb = typeof db;
export const activeDatabaseTarget = databaseTarget;
