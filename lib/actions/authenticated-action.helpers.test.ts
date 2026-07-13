import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { ensureAuthenticatedUser } from './authenticated-action.helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

describe('ensureAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    await expect(ensureAuthenticatedUser()).resolves.toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('returns the authenticated user when one exists', async () => {
    const authenticatedUser = {
      id: 'user-1',
      email: 'admin@example.test',
    };
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(
      authenticatedUser,
    );

    await expect(ensureAuthenticatedUser()).resolves.toEqual({
      success: true,
      user: authenticatedUser,
    });
  });
});
