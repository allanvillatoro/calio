import { z } from 'zod';

const imageSchema = z.string().trim().min(1);
const discountSchema = z.number().int().min(0).max(99);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must use lowercase letters, numbers, and hyphens',
  });

const laserEngravingBodySchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  images: z.array(imageSchema).min(1),
  discount: discountSchema.default(0),
});

export const laserEngravingIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createLaserEngravingBodySchema =
  laserEngravingBodySchema.extend({
    id: z.number().int().positive().optional(),
  });

export const updateLaserEngravingBodySchema = laserEngravingBodySchema;

export const laserEngravingsQuerySchema = z.object({
  query: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
