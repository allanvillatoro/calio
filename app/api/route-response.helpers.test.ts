import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ProductConflictError } from '@/lib/errors';
import {
  conflictErrorResponse,
  getConflictError,
  internalServerErrorResponse,
  notFoundResponse,
  validationErrorResponse,
} from './route-response.helpers';

describe('route response helpers', () => {
  it('creates bad request responses for Zod errors', async () => {
    const schema = z.object({
      name: z.string().min(1),
    });
    const parsed = schema.safeParse({
      name: '',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const response = validationErrorResponse(parsed.error);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
      details: [
        expect.objectContaining({
          path: 'name',
        }),
      ],
    });
  });

  it('creates not found responses', async () => {
    const response = notFoundResponse('Product not found');

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Product not found',
    });
  });

  it('creates conflict responses with details', async () => {
    const conflict = new ProductConflictError(
      'Product already exists',
      'PRODUCT_NAME_ALREADY_EXISTS',
      [
        {
          path: 'name',
          message: 'Product already exists',
        },
      ],
    );

    const response = conflictErrorResponse(conflict);

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
  });

  it('logs and creates internal server error responses', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const error = new Error('DB down');

    const response = internalServerErrorResponse('Failed to fetch', error);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch',
    });
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch', error);

    consoleError.mockRestore();
  });

  it('returns configured conflict errors', () => {
    const conflict = new ProductConflictError(
      'Product already exists',
      'PRODUCT_NAME_ALREADY_EXISTS',
    );

    expect(getConflictError(conflict, [ProductConflictError])).toBe(conflict);
    expect(getConflictError(new Error('DB down'), [ProductConflictError])).toBe(
      null,
    );
  });
});
