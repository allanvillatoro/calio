import { StatusCodes } from 'http-status-codes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthCookie } from '@/lib/auth';
import { POST } from './route';

vi.mock('@/lib/auth', () => ({
  clearAuthCookie: vi.fn(),
}));

describe('POST /api/users/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the auth cookie and returns success', async () => {
    vi.mocked(clearAuthCookie).mockResolvedValue(undefined);

    const response = await POST();

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({
      success: true,
    });
    expect(clearAuthCookie).toHaveBeenCalled();
  });

  it('returns internal server error when logout fails unexpectedly', async () => {
    vi.mocked(clearAuthCookie).mockRejectedValue(new Error('Cookie failure'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await POST();

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to logout user',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to logout user',
      expect.any(Error),
    );
  });
});
