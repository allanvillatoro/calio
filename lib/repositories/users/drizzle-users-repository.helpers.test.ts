import { describe, expect, it } from 'vitest';
import type { UserRow } from '@/db/schema';
import {
  hashPassword,
  mapRowToUser,
  normalizeCredentials,
  requireUserField,
  validatePassword,
} from './drizzle-users-repository.helpers';

const userRow: UserRow = {
  id: 'user-1',
  email: 'admin@example.test',
  password: 'hashed-password',
};

describe('user repository helpers', () => {
  it('maps user rows to public user data without password hashes', () => {
    const user = mapRowToUser(userRow);

    expect(user).toEqual({
      id: userRow.id,
      email: userRow.email,
    });
    expect(user).not.toHaveProperty('password');
  });

  it('normalizes email casing and whitespace without changing the password', () => {
    const credentials = normalizeCredentials({
      email: '  Admin@Example.TEST  ',
      password: '  keep spaces  ',
    });

    expect(credentials).toEqual({
      email: 'admin@example.test',
      password: '  keep spaces  ',
    });
  });

  it('returns present required user fields', () => {
    const email = requireUserField(
      {
        email: ' admin@example.test ',
        password: 'password123',
      },
      'email',
    );

    expect(email).toBe('admin@example.test');
  });

  it('throws with the user field label when required values are empty', () => {
    expect(() =>
      requireUserField(
        {
          email: '   ',
          password: 'password123',
        },
        'email',
      ),
    ).toThrow('Missing required field: user.email');
  });

  it('hashes passwords and validates matching passwords', async () => {
    const passwordHash = await hashPassword('password123');

    await expect(validatePassword('password123', passwordHash)).resolves.toBe(
      true,
    );
    await expect(validatePassword('wrong-password', passwordHash)).resolves.toBe(
      false,
    );
    expect(passwordHash).not.toBe('password123');
  });
});
