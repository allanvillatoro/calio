import axios from 'axios';
import { usersApi } from '../api/users.api';
import type { IUser } from '../interfaces/user';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: IUser;
  token: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    const response = await usersApi.post<LoginResponse>('/login', credentials);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      throw new Error(
        error.response?.data?.error ?? 'No se pudo iniciar sesion',
      );
    }

    throw new Error('No se pudo iniciar sesion');
  }
};
