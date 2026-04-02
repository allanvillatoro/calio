import axios from 'axios';
import { usersApi } from '../api/users.api';

interface LogoutResponse {
  success: boolean;
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await usersApi.post<LogoutResponse>('/logout');

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      throw new Error(
        error.response?.data?.error ?? 'No se pudo cerrar la sesión',
      );
    }

    throw new Error('No se pudo cerrar la sesión');
  }
};
