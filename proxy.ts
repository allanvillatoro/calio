import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { StatusCodes } from 'http-status-codes';

function isPublicApiRoute(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname === '/api/users/login' && method === 'POST') {
    return true;
  }

  if (pathname === '/api/products' && method === 'GET') {
    return true;
  }

  if (/^\/api\/products\/[^/]+$/.test(pathname) && method === 'GET') {
    return true;
  }

  //TODO: Remove this once the admin user is already there.
  if (pathname === '/api/users/register' && method === 'POST') {
    return true;
  }

  return false;
}

function extractBearerToken(request: NextRequest): string | null {
  const authorizationHeader = request.headers.get('authorization');

  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() ?? null;
}

export async function proxy(request: NextRequest) {
  if (isPublicApiRoute(request)) {
    return NextResponse.next();
  }

  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: StatusCodes.UNAUTHORIZED },
    );
  }

  const user = await verifyAuthToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: StatusCodes.UNAUTHORIZED },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
