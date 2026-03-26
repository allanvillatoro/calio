import type { IUser } from '@/lib/interfaces/user';

export type { IUser } from '@/lib/interfaces/user';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: IUser;
  token: string;
}

export interface IUsersRepository {
  register(credentials: UserCredentials): Promise<IUser>;
  login(credentials: UserCredentials): Promise<LoginResult>;
}
