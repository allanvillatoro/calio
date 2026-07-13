import { deleteProductAction } from '@/lib/actions/product-mutations.action';
import type { Product } from '@/lib/types';
import { SellableItemDeleteDialog } from './SellableItemDeleteDialog';

interface DeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteDialog = ({
  product,
  open,
  onOpenChange,
}: DeleteDialogProps) => (
  <SellableItemDeleteDialog
    item={product}
    open={open}
    onOpenChange={onOpenChange}
    title="Eliminar producto"
    itemName="producto"
    itemNameCapitalized="Producto"
    queryKey={['products']}
    deleteItem={deleteProductAction}
  />
);
