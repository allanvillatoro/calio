import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { GET } from './route';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

describe('GET /api/users/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns authenticated true and the public user when a session exists', async () => {
    const user = {
      id: 'user-1',
      email: 'admin@example.test',
    };
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(user);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      user,
    });
  });

  it('returns authenticated false and null user when no session exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      authenticated: false,
      user: null,
    });
  });
});
