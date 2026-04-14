import { NextResponse } from 'next/server';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUserFromCookies();

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
  });
}
