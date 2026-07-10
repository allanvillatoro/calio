import { SellableItemDialog } from '@/components/admin/SellableItemDialog';
import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import type {
  SellableItemFormValues,
  SellableItemMutationResult,
} from '@/lib/hooks/useSellableItemDialogForm';
import type { Category, Product } from '@/lib/types';

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function validateProductDiscount(
  value: number,
  selectedCategory?: Category,
) {
  if (selectedCategory !== 'rebajas') {
    return value === 0 || 'El descuento debe ser 0 fuera de Rebajas';
  }

  if (!Number.isInteger(value)) {
    return 'El descuento debe ser un número entero';
  }

  if (value < 1 || value > 99) {
    return 'El descuento debe estar entre 1 y 99';
  }

  return true;
}

async function submitProduct(
  id: number | undefined,
  values: SellableItemFormValues & { files?: File[] },
): Promise<SellableItemMutationResult> {
  const productData = {
    name: values.name,
    description: values.description,
    price: values.price,
    discount: values.category === 'rebajas' ? values.discount : 0,
    quantity: values.quantity,
    inStore: values.inStore ?? false,
    category: values.category ?? EMPTY_PRODUCT.category,
    images: values.images,
    files: values.files,
  };

  return id
    ? updateProductAction(id, productData)
    : createProductAction(productData);
}

export const ProductDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDialogProps) => (
  <SellableItemDialog
    item={product}
    open={open}
    onOpenChange={onOpenChange}
    config={{
      itemName: 'producto',
      itemNameCapitalized: 'Producto',
      logName: 'product',
      createTitle: 'Agregar nuevo producto',
      editTitle: 'Editar producto',
      description: 'Ingrese todos los detalles del producto',
      nameLabel: 'Nombre del Producto',
      imageAlt: 'Product',
      showCategory: true,
      showInStore: true,
      showDiscountField: (selectedCategory) => selectedCategory === 'rebajas',
      discountMin: 1,
      discountMax: 99,
      emptyItem: EMPTY_PRODUCT,
      queryKey: ['products'],
      formFields: [
        'name',
        'description',
        'price',
        'discount',
        'quantity',
        'category',
        'images',
      ],
      validateDiscount: validateProductDiscount,
      submitItem: submitProduct,
    }}
  />
);
