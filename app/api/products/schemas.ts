import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@/lib/constants/product-categories';
import {
  sellableItemBodyShape,
  sellableItemIdParamsSchema,
  sellableItemsQuerySchema,
} from '../sellable-item-schemas';

const categorySchema = z.enum(PRODUCT_CATEGORIES);

const productBodyShape = {
  ...sellableItemBodyShape,
  category: categorySchema,
  inStore: z.boolean().optional(),
};

function validateDiscountByCategory(
  value: z.infer<z.ZodObject<typeof productBodyShape>>,
  ctx: z.RefinementCtx,
) {
  if (value.category === 'rebajas') {
    if (value.discount < 1 || value.discount > 99) {
      ctx.addIssue({
        code: 'custom',
        path: ['discount'],
        message: 'Discount must be between 1 and 99 when category is "rebajas"',
      });
    }

    return;
  }

  if (value.discount !== 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['discount'],
      message: 'Discount must be 0 when category is different from "rebajas"',
    });
  }
}

const productBodySchema = z
  .object(productBodyShape)
  .superRefine(validateDiscountByCategory);

export const productIdParamsSchema = sellableItemIdParamsSchema;

export const createProductBodySchema = productBodySchema.extend({
  id: z.number().int().positive().optional(),
});

export const updateProductBodySchema = productBodySchema;

export const productsQuerySchema = sellableItemsQuerySchema.extend({
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
});
