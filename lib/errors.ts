export class UserAuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: 'USER_ALREADY_EXISTS' | 'INVALID_CREDENTIALS',
  ) {
    super(message);
    this.name = 'UserAuthenticationError';
  }
}
