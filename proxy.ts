import { NextResponse, type NextRequest } from 'next/server';
import {
  extractBearerToken,
  verifyAuthToken,
} from '@/lib/repositories/users/auth';
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

  return false;
}

export async function proxy(request: NextRequest) {
  if (isPublicApiRoute(request)) {
    return NextResponse.next();
  }

  const token = extractBearerToken(request.headers.get('authorization'));

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
