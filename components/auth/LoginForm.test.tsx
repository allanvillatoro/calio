import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/lib/stores/auth.store';
import { LoginForm } from './LoginForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

const push = vi.fn();
const refresh = vi.fn();
const login = vi.fn();

function mockAuthStore(isLoggingIn = false) {
  vi.mocked(useAuthStore).mockImplementation((selector) =>
    selector({
      isAuthenticated: false,
      isLoggingIn,
      isLoggingOut: false,
      login,
      logout: vi.fn(),
      syncAuthState: vi.fn(),
    }),
  );
}

function renderLoginForm() {
  render(<LoginForm />);
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push,
      refresh,
    } as never);
    mockAuthStore();
  });

  it('shows field validation errors when submitted empty', async () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByText('El correo es obligatorio')).toBeVisible();
    expect(screen.getByText('La contraseña es obligatoria')).toBeVisible();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in, shows success feedback, and navigates to admin', async () => {
    login.mockResolvedValue(undefined);
    renderLoginForm();

    fireEvent.change(screen.getByLabelText('Correo'), {
      target: { value: 'admin@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'admin@example.test',
        password: 'password123',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Sesión iniciada correctamente',
    );
    expect(push).toHaveBeenCalledWith('/admin');
    expect(refresh).toHaveBeenCalled();
  });

  it('shows server login errors without navigating', async () => {
    login.mockRejectedValue(new Error('Credenciales inválidas'));
    renderLoginForm();

    fireEvent.change(screen.getByLabelText('Correo'), {
      target: { value: 'admin@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByText('Credenciales inválidas')).toBeVisible();
    expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas');
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('disables the submit button while logging in', () => {
    mockAuthStore(true);

    renderLoginForm();

    expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDisabled();
  });
});
