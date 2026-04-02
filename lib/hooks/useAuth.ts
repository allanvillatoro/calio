'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { login } from '@/lib/actions/login.action';
import { logout } from '@/lib/actions/logout.action';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from '@/lib/auth-client';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getStoredAuthToken()));
  }, [pathname]);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);

    try {
      const loginResult = await login(credentials);
      setStoredAuthToken(loginResult.token);
      setIsAuthenticated(true);
      toast.success('Sesión iniciada correctamente');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      clearStoredAuthToken();
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      clearStoredAuthToken();
      setIsAuthenticated(false);
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('No se pudo cerrar la sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    isAuthenticated,
    isLoggingIn,
    isLoggingOut,
    login: handleLogin,
    logout: handleLogout,
  };
}
