import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { formatZodError } from '@/lib/zod';

interface ApiConflictError extends Error {
  details?: Array<{
    path: string;
    message: string;
  }>;
}

type ApiConflictErrorConstructor = new (...args: never[]) => ApiConflictError;

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(formatZodError(error), {
    status: StatusCodes.BAD_REQUEST,
  });
}

export function notFoundResponse(error: string) {
  return NextResponse.json(
    { error },
    {
      status: StatusCodes.NOT_FOUND,
    },
  );
}

export function conflictErrorResponse(error: ApiConflictError) {
  return NextResponse.json(
    {
      error: error.message,
      details: error.details,
    },
    {
      status: StatusCodes.CONFLICT,
    },
  );
}

export function internalServerErrorResponse(message: string, error: unknown) {
  console.error(message, error);

  return NextResponse.json(
    { error: message },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}

export function getConflictError(
  error: unknown,
  conflictErrors: ApiConflictErrorConstructor[],
): ApiConflictError | null {
  const conflictError = conflictErrors.find(
    (ConflictError) => error instanceof ConflictError,
  );

  if (conflictError && error instanceof conflictError) {
    return error;
  }

  return null;
}
