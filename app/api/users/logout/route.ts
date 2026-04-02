import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to logout user', error);

    return NextResponse.json(
      { error: 'Failed to logout user' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
