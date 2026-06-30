import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthToken } from '@/lib/auth';
import type { UserAuthenticationError } from '@/lib/errors';
import { validatePassword } from './drizzle-users-repository.helpers';
import { DrizzleUsersRepository } from './drizzle-users-repository';

vi.mock('server-only', () => ({}));

vi.mock('@/db', () => ({
  db: {},
}));

vi.mock('@/lib/auth', () => ({
  createAuthToken: vi.fn(),
}));

interface FakeUserRow {
  id: string;
  email: string;
  password: string;
}

function createFakeDb(options: {
  existingUser?: FakeUserRow | null;
  insertedUser?: Pick<FakeUserRow, 'id' | 'email'>;
}) {
  const state: {
    insertValues?: {
      email: string;
      password: string;
    };
  } = {};
  const limit = vi
    .fn()
    .mockResolvedValue(options.existingUser ? [options.existingUser] : []);
  const where = vi.fn(() => ({
    limit,
  }));
  const from = vi.fn(() => ({
    where,
  }));
  const select = vi.fn(() => ({
    from,
  }));
  const returning = vi
    .fn()
    .mockResolvedValue([options.insertedUser ?? { id: 'user-2', email: '' }]);
  const values = vi.fn((insertValues) => {
    state.insertValues = insertValues;

    return {
      returning,
    };
  });
  const insert = vi.fn(() => ({
    values,
  }));

  return {
    db: {
      select,
      insert,
    },
    state,
  };
}

describe('DrizzleUsersRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user with normalized email and a hashed password', async () => {
    const { db, state } = createFakeDb({
      existingUser: null,
      insertedUser: {
        id: 'user-2',
        email: 'admin@example.test',
      },
    });
    const repository = new DrizzleUsersRepository(db as never);

    const user = await repository.register({
      email: '  Admin@Example.TEST  ',
      password: 'password123',
    });

    expect(user).toEqual({
      id: 'user-2',
      email: 'admin@example.test',
    });
    expect(state.insertValues?.email).toBe('admin@example.test');
    expect(state.insertValues?.password).not.toBe('password123');
    await expect(
      validatePassword('password123', state.insertValues?.password ?? ''),
    ).resolves.toBe(true);
  });

  it('rejects registration when the email already exists', async () => {
    const { db } = createFakeDb({
      existingUser: {
        id: 'user-1',
        email: 'admin@example.test',
        password: 'hashed-password',
      },
    });
    const repository = new DrizzleUsersRepository(db as never);

    await expect(
      repository.register({
        email: 'admin@example.test',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      code: 'USER_ALREADY_EXISTS',
    } satisfies Partial<UserAuthenticationError>);
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('logs in with normalized credentials and returns public user data plus token', async () => {
    const passwordHash = await import('bcryptjs').then(({ hash }) =>
      hash('password123', 12),
    );
    const { db } = createFakeDb({
      existingUser: {
        id: 'user-1',
        email: 'admin@example.test',
        password: passwordHash,
      },
    });
    vi.mocked(createAuthToken).mockResolvedValue('signed-token');
    const repository = new DrizzleUsersRepository(db as never);

    const result = await repository.login({
      email: '  Admin@Example.TEST  ',
      password: 'password123',
    });

    expect(result).toEqual({
      user: {
        id: 'user-1',
        email: 'admin@example.test',
      },
      token: 'signed-token',
    });
    expect(createAuthToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'admin@example.test',
    });
  });

  it('rejects login when the user does not exist', async () => {
    const { db } = createFakeDb({
      existingUser: null,
    });
    const repository = new DrizzleUsersRepository(db as never);

    await expect(
      repository.login({
        email: 'missing@example.test',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    } satisfies Partial<UserAuthenticationError>);
    expect(createAuthToken).not.toHaveBeenCalled();
  });

  it('rejects login when the password is invalid', async () => {
    const passwordHash = await import('bcryptjs').then(({ hash }) =>
      hash('password123', 12),
    );
    const { db } = createFakeDb({
      existingUser: {
        id: 'user-1',
        email: 'admin@example.test',
        password: passwordHash,
      },
    });
    const repository = new DrizzleUsersRepository(db as never);

    await expect(
      repository.login({
        email: 'admin@example.test',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    } satisfies Partial<UserAuthenticationError>);
    expect(createAuthToken).not.toHaveBeenCalled();
  });
});
