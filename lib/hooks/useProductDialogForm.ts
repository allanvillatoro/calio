import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import {
  type SellableItemFormValues,
  type SellableItemMutationResult,
  useSellableItemDialogForm,
} from '@/lib/hooks/useSellableItemDialogForm';
import type { Product } from '@/lib/types';

interface UseProductDialogFormParams {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
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

export function useProductDialogForm({
  product,
  onOpenChange,
}: UseProductDialogFormParams) {
  return useSellableItemDialogForm({
    item: product,
    emptyItem: EMPTY_PRODUCT,
    onOpenChange,
    queryKey: ['products'],
    itemName: 'producto',
    itemNameCapitalized: 'Producto',
    logName: 'product',
    formFields: [
      'name',
      'description',
      'price',
      'discount',
      'quantity',
      'category',
      'images',
    ],
    submitItem: submitProduct,
  });
}
