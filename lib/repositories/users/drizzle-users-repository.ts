import 'server-only';
import { db, type AppDb } from '@/db';
import { users } from '@/db/schema';
import { createAuthToken } from '@/lib/auth';
import { UserAuthenticationError } from '@/lib/errors';
import type { IUser } from '@/lib/interfaces/user';
import type {
  IUsersRepository,
  LoginResult,
  UserCredentials,
} from './users-repository.interface';
import {
  findUserByEmailWithPassword,
  hashPassword,
  mapRowToUser,
  normalizeCredentials,
  requireUserField,
  validatePassword,
} from './drizzle-users-repository.helpers';

export class DrizzleUsersRepository implements IUsersRepository {
  constructor(private readonly database: AppDb) {}

  async register(credentials: UserCredentials): Promise<IUser> {
    const normalizedCredentials = normalizeCredentials(credentials);
    const email = requireUserField(normalizedCredentials, 'email');
    const password = requireUserField(normalizedCredentials, 'password');
    const existingUser = await findUserByEmailWithPassword(
      this.database,
      email,
    );

    if (existingUser) {
      throw new UserAuthenticationError(
        'A user with this email already exists',
        'USER_ALREADY_EXISTS',
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await this.database
      .insert(users)
      .values({
        email,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
      });

    return mapRowToUser(user);
  }

  async login(credentials: UserCredentials): Promise<LoginResult> {
    const normalizedCredentials = normalizeCredentials(credentials);
    const email = requireUserField(normalizedCredentials, 'email');
    const password = requireUserField(normalizedCredentials, 'password');
    const user = await findUserByEmailWithPassword(this.database, email);

    if (!user) {
      throw new UserAuthenticationError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const isPasswordValid = await validatePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UserAuthenticationError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const publicUser = mapRowToUser(user);

    return {
      user: publicUser,
      token: await createAuthToken(publicUser),
    };
  }
}

export const usersRepository: IUsersRepository = new DrizzleUsersRepository(db);
