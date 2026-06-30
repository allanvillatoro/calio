// @vitest-environment node

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_TOKEN_COOKIE_NAME,
  clearAuthCookie,
  createAuthToken,
  getAuthenticatedUserFromCookies,
  verifyAuthToken,
} from './auth';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const testUser = {
  id: 'user-1',
  email: 'admin@example.test',
};

function setJwtSecret() {
  process.env.JWT_SECRET = 'unit-test-jwt-secret';
}

async function createTokenWithPayload(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

describe('auth token helpers', () => {
  beforeEach(() => {
    setJwtSecret();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('creates tokens that verify back to public user data', async () => {
    const token = await createAuthToken(testUser);

    const verifiedUser = await verifyAuthToken(token);

    expect(verifiedUser).toEqual(testUser);
  });

  it('returns null for invalid tokens', async () => {
    const verifiedUser = await verifyAuthToken('invalid-token');

    expect(verifiedUser).toBeNull();
  });

  it('returns null when token payload does not contain public user fields', async () => {
    const token = await createTokenWithPayload({
      sub: testUser.id,
    });

    const verifiedUser = await verifyAuthToken(token);

    expect(verifiedUser).toBeNull();
  });

  it('throws when creating a token without JWT_SECRET', async () => {
    delete process.env.JWT_SECRET;

    await expect(createAuthToken(testUser)).rejects.toThrow(
      'Missing JWT_SECRET environment variable',
    );
  });
});

describe('auth cookie helpers', () => {
  beforeEach(() => {
    setJwtSecret();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    delete process.env.JWT_SECRET;
  });

  it('returns null when auth cookie is missing', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    } as never);

    const authenticatedUser = await getAuthenticatedUserFromCookies();

    expect(authenticatedUser).toBeNull();
  });

  it('verifies the auth cookie token', async () => {
    const token = await createAuthToken(testUser);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({
        value: token,
      }),
      set: vi.fn(),
    } as never);

    const authenticatedUser = await getAuthenticatedUserFromCookies();

    expect(authenticatedUser).toEqual(testUser);
  });

  it('clears the auth cookie with httpOnly settings', async () => {
    const setCookie = vi.fn();
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(),
      set: setCookie,
    } as never);

    await clearAuthCookie();

    expect(setCookie).toHaveBeenCalledWith({
      name: AUTH_TOKEN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 0,
    });
  });
});
