export class UserAuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: 'USER_ALREADY_EXISTS' | 'INVALID_CREDENTIALS',
  ) {
    super(message);
    this.name = 'UserAuthenticationError';
  }
}

export class ProductConflictError extends Error {
  constructor(
    message: string,
    public readonly code: 'PRODUCT_NAME_ALREADY_EXISTS',
    public readonly details?: Array<{
      path: string;
      message: string;
    }>,
  ) {
    super(message);
    this.name = 'ProductConflictError';
  }
}
