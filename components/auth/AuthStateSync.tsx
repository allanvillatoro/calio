'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';

const AUTH_SYNC_QUERY_KEY = ['auth', 'session'];

export function AuthStateSync() {
  const syncAuthState = useAuthStore((state) => state.syncAuthState);

  useQuery({
    queryKey: AUTH_SYNC_QUERY_KEY,
    queryFn: syncAuthState,
    retry: false,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return null;
}
