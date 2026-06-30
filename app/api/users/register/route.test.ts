import { StatusCodes } from 'http-status-codes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAuthenticationError } from '@/lib/errors';
import { usersRepository } from '@/lib/repositories/users/drizzle-users-repository';
import { POST } from './route';

vi.mock('@/lib/repositories/users/drizzle-users-repository', () => ({
  usersRepository: {
    register: vi.fn(),
  },
}));

const credentials = {
  email: 'admin@example.test',
  password: 'password123',
};

const publicUser = {
  id: 'user-1',
  email: credentials.email,
};

function createRegisterRequest(body: unknown) {
  return new Request('http://localhost/api/users/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers a user from a valid credentials payload', async () => {
    vi.mocked(usersRepository.register).mockResolvedValue(publicUser);

    const response = await POST(createRegisterRequest(credentials));

    expect(response.status).toBe(StatusCodes.CREATED);
    await expect(response.json()).resolves.toEqual(publicUser);
    expect(usersRepository.register).toHaveBeenCalledWith(credentials);
  });

  it('returns validation errors for invalid credentials payloads', async () => {
    const response = await POST(
      createRegisterRequest({
        email: 'not-an-email',
        password: '123',
      }),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(usersRepository.register).not.toHaveBeenCalled();
  });

  it('returns conflict when the user already exists', async () => {
    vi.mocked(usersRepository.register).mockRejectedValue(
      new UserAuthenticationError('User already exists', 'USER_ALREADY_EXISTS'),
    );

    const response = await POST(createRegisterRequest(credentials));

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: 'User already exists',
    });
  });

  it('returns internal server error when registration fails unexpectedly', async () => {
    vi.mocked(usersRepository.register).mockRejectedValue(new Error('DB down'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await POST(createRegisterRequest(credentials));

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to register user',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to register user',
      expect.any(Error),
    );
  });
});
