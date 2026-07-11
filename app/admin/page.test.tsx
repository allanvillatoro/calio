import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import AdminPage from './page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    await AdminPage();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('renders separate admin access cards for jewelry and laser engravings', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.test',
    });

    render(await AdminPage());

    expect(
      screen.getByRole('link', { name: /Administrar piezas joyería/ }),
    ).toHaveAttribute('href', '/catalogo');
    expect(
      screen.getByRole('link', { name: /Administrar grabados láser/ }),
    ).toHaveAttribute('href', '/grabados');
  });
});
