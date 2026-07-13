import { SellableItemDialog } from '@/components/admin/SellableItemDialog';
import {
  createLaserEngravingAction,
  updateLaserEngravingAction,
} from '@/lib/actions/laser-engraving-mutations.action';
import {
  EMPTY_LASER_ENGRAVING,
  type LaserEngravingFormItem,
} from '@/lib/constants/laser-engraving';
import type {
  SellableItemFormValues,
  SellableItemMutationResult,
} from '@/lib/hooks/useSellableItemDialogForm';

interface LaserEngravingDialogProps {
  laserEngraving: LaserEngravingFormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function validateLaserEngravingDiscount(value: number) {
  if (!Number.isInteger(value)) {
    return 'El descuento debe ser un número entero';
  }

  if (value < 0 || value > 99) {
    return 'El descuento debe estar entre 0 y 99';
  }

  return true;
}

async function submitLaserEngraving(
  id: number | undefined,
  values: SellableItemFormValues & { files?: File[] },
): Promise<SellableItemMutationResult> {
  const laserEngravingData = {
    slug: values.slug ?? '',
    name: values.name,
    description: values.description,
    price: values.price,
    discount: values.discount,
    quantity: values.quantity,
    images: values.images,
    files: values.files,
  };

  return id
    ? updateLaserEngravingAction(id, laserEngravingData)
    : createLaserEngravingAction(laserEngravingData);
}

export const LaserEngravingDialog = ({
  laserEngraving,
  open,
  onOpenChange,
}: LaserEngravingDialogProps) => (
  <SellableItemDialog
    item={laserEngraving}
    open={open}
    onOpenChange={onOpenChange}
    config={{
      itemName: 'grabado',
      itemNameCapitalized: 'Grabado',
      logName: 'laser engraving',
      createTitle: 'Agregar nuevo grabado',
      editTitle: 'Editar grabado',
      description: 'Ingrese todos los detalles del grabado láser',
      nameLabel: 'Nombre del grabado',
      imageAlt: 'Grabado laser',
      showSlug: true,
      showDiscountField: () => true,
      discountMin: 0,
      discountMax: 99,
      emptyItem: EMPTY_LASER_ENGRAVING,
      queryKey: ['laser-engravings'],
      formFields: [
        'slug',
        'name',
        'description',
        'price',
        'discount',
        'quantity',
        'images',
      ],
      validateDiscount: validateLaserEngravingDiscount,
      submitItem: submitLaserEngraving,
    }}
  />
);
