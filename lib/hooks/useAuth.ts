'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logout } from '@/lib/actions/logout.action';
import { clearStoredAuthToken, getStoredAuthToken } from '@/lib/auth-client';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getStoredAuthToken()));
  }, [pathname]);

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
    isLoggingOut,
    logout: handleLogout,
  };
}
