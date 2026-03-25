import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getDatabaseTarget, getDatabaseUrl } from './config';
import * as schema from './schema';

const databaseTarget = getDatabaseTarget();
const databaseUrl = getDatabaseUrl();

const sql = neon(databaseUrl);

export const db = drizzle({
  client: sql,
  schema,
});

export type AppDb = typeof db;
export const activeDatabaseTarget = databaseTarget;
