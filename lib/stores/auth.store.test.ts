import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSession } from '@/lib/actions/get-session.action';
import { login as loginAction } from '@/lib/actions/login.action';
import { logout as logoutAction } from '@/lib/actions/logout.action';
import { useAuthStore } from './auth.store';

vi.mock('@/lib/actions/get-session.action', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/actions/login.action', () => ({
  login: vi.fn(),
}));

vi.mock('@/lib/actions/logout.action', () => ({
  logout: vi.fn(),
}));

const credentials = {
  email: 'admin@example.test',
  password: 'password123',
};

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      isLoggingIn: false,
      isLoggingOut: false,
    });
  });

  it('logs in and marks the user as authenticated', async () => {
    vi.mocked(loginAction).mockResolvedValue({
      user: {
        id: 'user-1',
        email: credentials.email,
      },
    });

    await useAuthStore.getState().login(credentials);

    expect(loginAction).toHaveBeenCalledWith(credentials);
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      isLoggingIn: false,
    });
  });

  it('sets the logging in flag while login is pending', async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof loginAction>>>();
    vi.mocked(loginAction).mockReturnValue(deferred.promise);

    const loginPromise = useAuthStore.getState().login(credentials);

    expect(useAuthStore.getState().isLoggingIn).toBe(true);

    deferred.resolve({
      user: {
        id: 'user-1',
        email: credentials.email,
      },
    });
    await loginPromise;

    expect(useAuthStore.getState().isLoggingIn).toBe(false);
  });

  it('clears authentication and rethrows when login fails', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(loginAction).mockRejectedValue(error);
    useAuthStore.setState({
      isAuthenticated: true,
    });

    await expect(useAuthStore.getState().login(credentials)).rejects.toThrow(
      error,
    );

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isLoggingIn: false,
    });
  });

  it('logs out and clears authentication', async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: true,
    });
    useAuthStore.setState({
      isAuthenticated: true,
    });

    await useAuthStore.getState().logout();

    expect(logoutAction).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isLoggingOut: false,
    });
  });

  it('sets the logging out flag while logout is pending', async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof logoutAction>>>();
    vi.mocked(logoutAction).mockReturnValue(deferred.promise);
    useAuthStore.setState({
      isAuthenticated: true,
    });

    const logoutPromise = useAuthStore.getState().logout();

    expect(useAuthStore.getState().isLoggingOut).toBe(true);

    deferred.resolve({
      success: true,
    });
    await logoutPromise;

    expect(useAuthStore.getState().isLoggingOut).toBe(false);
  });

  it('clears the logging out flag and rethrows when logout fails', async () => {
    const error = new Error('Logout failed');
    vi.mocked(logoutAction).mockRejectedValue(error);
    useAuthStore.setState({
      isAuthenticated: true,
    });

    await expect(useAuthStore.getState().logout()).rejects.toThrow(error);

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      isLoggingOut: false,
    });
  });

  it('syncs authenticated session state', async () => {
    vi.mocked(getSession).mockResolvedValue({
      authenticated: true,
      user: {
        id: 'user-1',
        email: credentials.email,
      },
    });

    await expect(useAuthStore.getState().syncAuthState()).resolves.toBe(true);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('syncs unauthenticated session state', async () => {
    vi.mocked(getSession).mockResolvedValue({
      authenticated: false,
      user: null,
    });
    useAuthStore.setState({
      isAuthenticated: true,
    });

    await expect(useAuthStore.getState().syncAuthState()).resolves.toBe(false);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('returns false and clears authentication when session sync fails', async () => {
    vi.mocked(getSession).mockRejectedValue(new Error('Session failed'));
    useAuthStore.setState({
      isAuthenticated: true,
    });

    await expect(useAuthStore.getState().syncAuthState()).resolves.toBe(false);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
