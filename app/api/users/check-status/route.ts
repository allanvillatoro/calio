import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { usersRepository } from '@/lib/repositories/drizzle-users-repository';
import {
  authorizationHeaderSchema,
  extractBearerToken,
  formatZodError,
} from '../schemas';

export async function GET(request: Request) {
  try {
    const authorizationHeader = authorizationHeaderSchema.parse(
      request.headers.get('authorization'),
    );
    const token = extractBearerToken(authorizationHeader);
    const user = await verifyAuthToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const authStatus = await usersRepository.checkAuthStatus(user);

    return NextResponse.json(authStatus);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to check auth status', error);

    return NextResponse.json(
      { error: 'Failed to check auth status' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
