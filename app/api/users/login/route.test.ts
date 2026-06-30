import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/auth';
import { UserAuthenticationError } from '@/lib/errors';
import { usersRepository } from '@/lib/repositories/users/drizzle-users-repository';
import { POST } from './route';

vi.mock('@/lib/repositories/users/drizzle-users-repository', () => ({
  usersRepository: {
    login: vi.fn(),
  },
}));

const loginCredentials = {
  email: 'admin@example.test',
  password: 'password123',
};

const publicUser = {
  id: 'user-1',
  email: loginCredentials.email,
};

function createLoginRequest(body: unknown) {
  return new Request('http://localhost/api/users/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns public user data and stores the token in an httpOnly cookie', async () => {
    vi.mocked(usersRepository.login).mockResolvedValue({
      user: publicUser,
      token: 'signed-jwt',
    });

    const response = await POST(createLoginRequest(loginCredentials));

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({
      user: publicUser,
    });
    expect(usersRepository.login).toHaveBeenCalledWith(loginCredentials);

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain(`${AUTH_TOKEN_COOKIE_NAME}=signed-jwt`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Max-Age=14400');
  });

  it('returns validation errors for invalid credentials payloads', async () => {
    const response = await POST(
      createLoginRequest({
        email: 'not-an-email',
        password: '123',
      }),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(usersRepository.login).not.toHaveBeenCalled();
  });

  it('returns unauthorized for invalid credentials', async () => {
    vi.mocked(usersRepository.login).mockRejectedValue(
      new UserAuthenticationError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      ),
    );

    const response = await POST(createLoginRequest(loginCredentials));

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid credentials',
    });
  });

  it('returns internal server error when login fails unexpectedly', async () => {
    vi.mocked(usersRepository.login).mockRejectedValue(new Error('DB down'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await POST(createLoginRequest(loginCredentials));

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to login user',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to login user',
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});
