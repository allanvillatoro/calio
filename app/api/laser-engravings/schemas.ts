import { z } from 'zod';
import {
  sellableItemBodyShape,
  sellableItemIdParamsSchema,
  sellableItemsQuerySchema,
} from '../sellable-item-schemas';

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must use lowercase letters, numbers, and hyphens',
  })
  .refine((slug) => !/^\d+$/.test(slug), {
    message: 'Slug cannot contain only numbers',
  });

const laserEngravingBodySchema = z.object({
  ...sellableItemBodyShape,
  slug: slugSchema,
});

export const laserEngravingIdParamsSchema = sellableItemIdParamsSchema;

export const createLaserEngravingBodySchema = laserEngravingBodySchema.extend({
  id: z.number().int().positive().optional(),
});

export const updateLaserEngravingBodySchema = laserEngravingBodySchema;

export const laserEngravingsQuerySchema = sellableItemsQuerySchema;
