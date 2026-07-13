import { z } from 'zod';

export const imageSchema = z.string().trim().min(1);
export const discountSchema = z.number().int().min(0).max(99);

export const sellableItemBodyShape = {
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  images: z.array(imageSchema).min(1),
  discount: discountSchema.default(0),
};

export const sellableItemIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const sellableItemsQuerySchema = z.object({
  query: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
