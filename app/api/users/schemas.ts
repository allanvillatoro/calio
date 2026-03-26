import { z } from 'zod';

export const userCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const authorizationHeaderSchema = z
  .string()
  .trim()
  .regex(/^Bearer\s+.+$/i, 'Authorization header must use Bearer token');

export function extractBearerToken(authorizationHeader: string): string {
  return authorizationHeader.replace(/^Bearer\s+/i, '').trim();
}
