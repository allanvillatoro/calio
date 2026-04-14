import { z } from 'zod';

export const userCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});
