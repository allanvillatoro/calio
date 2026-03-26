export interface PublicApiRoute {
  method: string;
  path?: string;
  pattern?: RegExp;
}

export const publicApiRoutes: PublicApiRoute[] = [
  {
    method: 'POST',
    path: '/api/users/login',
  },
  {
    method: 'GET',
    path: '/api/products',
  },
  {
    method: 'GET',
    pattern: /^\/api\/products\/[^/]+$/,
  },
];

export function isPublicApiRoute(pathname: string, method: string): boolean {
  return publicApiRoutes.some((route) => {
    if (route.method !== method) {
      return false;
    }

    if (route.path) {
      return route.path === pathname;
    }

    if (route.pattern) {
      return route.pattern.test(pathname);
    }

    return false;
  });
}
