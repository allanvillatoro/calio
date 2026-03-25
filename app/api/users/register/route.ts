import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserAuthenticationError } from '@/lib/errors';
import { usersRepository } from '@/lib/repositories/drizzle-users-repository';
import { formatZodError, userCredentialsSchema } from '../schemas';

export async function POST(request: Request) {
  try {
    const body = userCredentialsSchema.parse(await request.json());
    const user = await usersRepository.register(body);

    return NextResponse.json(user, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
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

    console.error('Failed to register user', error);

    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
