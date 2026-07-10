import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import AdminLaserEngravingsPage from './page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

vi.mock('@/components/admin/AdminLaserEngravingsContent', () => ({
  AdminLaserEngravingsContent: () => (
    <div>Contenido administrativo de grabados</div>
  ),
}));

describe('AdminLaserEngravingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    await AdminLaserEngravingsPage();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('renders the protected laser engravings admin page', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.test',
    });

    render(await AdminLaserEngravingsPage());

    expect(
      screen.getByRole('heading', { name: 'Administrar grabados laser' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Volver al panel' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Contenido administrativo de grabados'),
    ).toBeVisible();
  });
});
