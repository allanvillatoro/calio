import axios from 'axios';
import { usersApi } from '../api/users.api';
import type { IUser } from '../interfaces/user';

interface SessionResponse {
  authenticated: boolean;
  user: IUser | null;
}

export const getSession = async (): Promise<SessionResponse> => {
  try {
    const response = await usersApi.get<SessionResponse>('/session');

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      throw new Error(
        error.response?.data?.error ?? 'No se pudo verificar la sesión',
      );
    }

    throw new Error('No se pudo verificar la sesión');
  }
};
