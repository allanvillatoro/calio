import { NextResponse, type NextRequest } from 'next/server';
import { extractBearerToken, verifyAuthToken } from '@/lib/auth';
import { isPublicApiRoute } from '@/lib/config/public-api-routes';
import { StatusCodes } from 'http-status-codes';

export async function proxy(request: NextRequest) {
  if (
    isPublicApiRoute(request.nextUrl.pathname, request.method.toUpperCase())
  ) {
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
