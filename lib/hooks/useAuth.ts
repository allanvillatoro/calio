'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSession } from '@/lib/actions/get-session.action';
import { login } from '@/lib/actions/login.action';
import { logout } from '@/lib/actions/logout.action';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async () => {
      setIsCheckingAuth(true);

      try {
        const data = await getSession();

        if (isMounted) {
          setIsAuthenticated(data.authenticated);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    void syncAuthState();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);

    try {
      await login(credentials);
      setIsAuthenticated(true);
      toast.success('Sesión iniciada correctamente');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
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
    isCheckingAuth,
    isLoggingIn,
    isLoggingOut,
    login: handleLogin,
    logout: handleLogout,
  };
}
