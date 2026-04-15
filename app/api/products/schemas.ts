import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@/lib/constants/product-categories';

const categorySchema = z.enum(PRODUCT_CATEGORIES);
const imageSchema = z.string().trim().min(1);
const discountSchema = z.number().int().min(0).max(100);

const productBodyShape = {
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  images: z.array(imageSchema).min(1),
  category: categorySchema,
  discount: discountSchema.default(0),
  inStore: z.boolean().optional(),
};

function validateDiscountByCategory(
  value: z.infer<z.ZodObject<typeof productBodyShape>>,
  ctx: z.RefinementCtx,
) {
  if (value.category === 'rebajas') {
    if (value.discount < 1 || value.discount > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discount'],
        message:
          'Discount must be between 1 and 100 when category is "rebajas"',
      });
    }

    return;
  }

  if (value.discount !== 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['discount'],
      message:
        'Discount must be 0 when category is different from "rebajas"',
    });
  }
}

const productBodySchema = z
  .object(productBodyShape)
  .superRefine(validateDiscountByCategory);

export const productIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createProductBodySchema = productBodySchema.extend({
  id: z.number().int().positive().optional(),
});

export const updateProductBodySchema = productBodySchema;

export const productsQuerySchema = z.object({
  category: z.array(categorySchema).optional(),
  query: z.string().trim().min(1).optional(),
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
