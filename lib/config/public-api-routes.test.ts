import { describe, expect, it } from 'vitest';
import { isPublicApiRoute, publicApiRoutes } from './public-api-routes';

describe('isPublicApiRoute', () => {
  it.each([
    ['POST', '/api/users/login'],
    ['POST', '/api/users/logout'],
    ['GET', '/api/users/session'],
    ['GET', '/api/products'],
    ['GET', '/api/products/12'],
    ['GET', '/api/laser-engravings'],
    ['GET', '/api/laser-engravings/12'],
  ])('returns true for public %s %s routes', (method, pathname) => {
    expect(isPublicApiRoute(pathname, method)).toBe(true);
  });

  it.each([
    ['GET', '/api/users/login'],
    ['POST', '/api/products'],
    ['PUT', '/api/products/12'],
    ['DELETE', '/api/products/12'],
    ['POST', '/api/laser-engravings'],
    ['PUT', '/api/laser-engravings/12'],
    ['DELETE', '/api/laser-engravings/12'],
    ['GET', '/api/products/12/images'],
    ['GET', '/api/laser-engravings/12/images'],
    ['GET', '/api/admin/products'],
  ])(
    'returns false for protected or unknown %s %s routes',
    (method, pathname) => {
      expect(isPublicApiRoute(pathname, method)).toBe(false);
    },
  );

  it('treats methods as already-normalized uppercase values', () => {
    expect(isPublicApiRoute('/api/products', 'get')).toBe(false);
  });

  it('returns false for malformed public route definitions without path or pattern', () => {
    publicApiRoutes.push({ method: 'GET' });

    try {
      expect(isPublicApiRoute('/api/malformed', 'GET')).toBe(false);
    } finally {
      publicApiRoutes.pop();
    }
  });
});
