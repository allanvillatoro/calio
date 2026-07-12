import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export async function ensureAuthenticatedUser() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    return {
      success: false as const,
      error: 'Unauthorized',
    };
  }

  return {
    success: true as const,
    user: authenticatedUser,
  };
}
