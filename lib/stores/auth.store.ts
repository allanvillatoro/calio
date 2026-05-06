'use client';

import { create } from 'zustand';
import { getSession } from '@/lib/actions/get-session.action';
import { login as loginAction } from '@/lib/actions/login.action';
import { logout as logoutAction } from '@/lib/actions/logout.action';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthStoreState {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  syncAuthState: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: false,
  isLoggingIn: false,
  isLoggingOut: false,
  login: async (credentials) => {
    set({ isLoggingIn: true });

    try {
      await loginAction(credentials);
      set({ isAuthenticated: true });
    } catch (error) {
      set({ isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });

    try {
      await logoutAction();
      set({ isAuthenticated: false });
    } finally {
      set({ isLoggingOut: false });
    }
  },
  syncAuthState: async () => {
    try {
      const session = await getSession();
      set({ isAuthenticated: session.authenticated });

      return session.authenticated;
    } catch {
      set({ isAuthenticated: false });

      return false;
    }
  },
}));
