const AUTH_TOKEN_STORAGE_KEY = 'calio_auth_token';

interface JwtPayload {
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );

    return JSON.parse(window.atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    clearStoredAuthToken();
    return null;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp <= nowInSeconds) {
    clearStoredAuthToken();
    return null;
  }

  return token;
}

export function setStoredAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
