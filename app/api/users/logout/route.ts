import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { internalServerErrorResponse } from '../../route-response.helpers';

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalServerErrorResponse('Failed to logout user', error);
  }
}
