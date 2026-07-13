import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserAuthenticationError } from '@/lib/errors';
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/auth';
import { userCredentialsSchema } from '../schemas';
import { usersRepository } from '@/lib/repositories/users/drizzle-users-repository';
import {
  internalServerErrorResponse,
  validationErrorResponse,
} from '../../route-response.helpers';

export async function POST(request: Request) {
  try {
    const body = userCredentialsSchema.parse(await request.json());
    const loginResult = await usersRepository.login(body);
    const response = NextResponse.json({ user: loginResult.user });

    response.cookies.set({
      name: AUTH_TOKEN_COOKIE_NAME,
      value: loginResult.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 4,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if (
      error instanceof UserAuthenticationError &&
      error.code === 'INVALID_CREDENTIALS'
    ) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    return internalServerErrorResponse('Failed to login user', error);
  }
}
