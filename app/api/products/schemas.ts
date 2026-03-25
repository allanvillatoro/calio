import { z } from 'zod';

const categorySchema = z.string().trim().min(1);
const imageSchema = z.string().trim().min(1);

export const productIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createProductBodySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  images: z.array(imageSchema).min(1),
  category: categorySchema,
  inStore: z.boolean().optional(),
});

export const updateProductBodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    images: z.array(imageSchema).min(1).optional(),
    category: categorySchema.optional(),
    inStore: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const productsQuerySchema = z.object({
  category: z.array(categorySchema).optional(),
  instore: z.preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }

    return value;
  }, z.boolean().optional()),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export function formatZodError(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
