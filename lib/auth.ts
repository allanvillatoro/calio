import { jwtVerify, SignJWT } from 'jose';
import type { IUser } from '@/lib/repositories/users-repository.interface';

const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION = '7d';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return new TextEncoder().encode(secret);
}

export async function createAuthToken(user: IUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<IUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
