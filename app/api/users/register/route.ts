import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserAuthenticationError } from '@/lib/errors';
import { userCredentialsSchema } from '../schemas';
import { usersRepository } from '@/lib/repositories/users/drizzle-users-repository';
import {
  internalServerErrorResponse,
  validationErrorResponse,
} from '../../route-response.helpers';

export async function POST(request: Request) {
  try {
    const body = userCredentialsSchema.parse(await request.json());
    const user = await usersRepository.register(body);

    return NextResponse.json(user, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if (
      error instanceof UserAuthenticationError &&
      error.code === 'USER_ALREADY_EXISTS'
    ) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: StatusCodes.CONFLICT },
      );
    }

    return internalServerErrorResponse('Failed to register user', error);
  }
}
