import 'server-only';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { users, type UserRow } from '@/db/schema';
import type { AppDb } from '@/db';
import type { IUser } from '@/lib/interfaces/user';
import { requireField } from '../repository.helpers';
import type { UserCredentials } from './users-repository.interface';

export function mapRowToUser(row: Pick<UserRow, 'id' | 'email'>): IUser {
  return {
    id: row.id,
    email: row.email,
  };
}

export function normalizeCredentials(
  credentials: UserCredentials,
): UserCredentials {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  };
}

export function requireUserField<K extends keyof UserCredentials>(
  input: UserCredentials,
  field: K,
): NonNullable<UserCredentials[K]> {
  return requireField(input, field, {
    trimString: field === 'email',
    allowEmptyString: false,
    label: `user.${String(field)}`,
  });
}

export async function findUserByEmailWithPassword(
  db: AppDb,
  email: string,
): Promise<UserRow | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function validatePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}
