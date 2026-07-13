import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';

export type LaserEngravingFormItem = Omit<
  ILaserEngraving,
  'createdAt' | 'updatedAt'
>;

export const EMPTY_LASER_ENGRAVING: LaserEngravingFormItem = {
  id: 0,
  slug: '',
  name: '',
  description: '',
  price: 0,
  discount: 0,
  priceWithDiscount: 0,
  quantity: 0,
  images: [],
};
