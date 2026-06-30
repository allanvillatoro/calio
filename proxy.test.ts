import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { config, proxy } from './proxy';

vi.mock('@/lib/auth', () => ({
  AUTH_TOKEN_COOKIE_NAME: 'calio_auth_token',
  verifyAuthToken: vi.fn(),
}));

function createRequest(options: {
  pathname: string;
  method?: string;
  token?: string;
}) {
  return {
    nextUrl: {
      pathname: options.pathname,
    },
    method: options.method ?? 'GET',
    cookies: {
      get: vi.fn((name: string) =>
        name === AUTH_TOKEN_COOKIE_NAME && options.token
          ? { value: options.token }
          : undefined,
      ),
    },
  };
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows public API routes without checking auth tokens', async () => {
    const request = createRequest({
      pathname: '/api/products',
      method: 'GET',
    });

    const response = await proxy(request as never);

    expect(response.status).toBe(StatusCodes.OK);
    expect(verifyAuthToken).not.toHaveBeenCalled();
  });

  it('returns unauthorized when a protected API route has no auth token', async () => {
    const request = createRequest({
      pathname: '/api/products',
      method: 'POST',
    });

    const response = await proxy(request as never);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    await expect(response.json()).resolves.toEqual({
      error: 'Authentication required',
    });
    expect(verifyAuthToken).not.toHaveBeenCalled();
  });

  it('returns unauthorized when the auth token is invalid', async () => {
    vi.mocked(verifyAuthToken).mockResolvedValue(null);
    const request = createRequest({
      pathname: '/api/products',
      method: 'POST',
      token: 'invalid-token',
    });

    const response = await proxy(request as never);

    expect(verifyAuthToken).toHaveBeenCalledWith('invalid-token');
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid or expired token',
    });
  });

  it('allows protected API routes when the auth token is valid', async () => {
    vi.mocked(verifyAuthToken).mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.test',
    });
    const request = createRequest({
      pathname: '/api/products',
      method: 'POST',
      token: 'valid-token',
    });

    const response = await proxy(request as never);

    expect(verifyAuthToken).toHaveBeenCalledWith('valid-token');
    expect(response.status).toBe(StatusCodes.OK);
  });

  it('matches all API routes', () => {
    expect(config).toEqual({
      matcher: ['/api/:path*'],
    });
  });
});
