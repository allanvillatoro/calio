import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import type { Product } from '@/lib/types';
import { deleteProductAction } from '@/lib/actions/product-mutations.action';

interface DeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteDialog = ({
  product,
  open,
  onOpenChange,
}: DeleteDialogProps) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!product?.id) {
      toast.error('No se pudo identificar el producto a eliminar');
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if (!result.success) {
        toast.error(result.error ?? 'No se pudo eliminar el producto');
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      toast.success(`Producto ${product.name} eliminado correctamente`);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="xl:max-w-xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleDelete();
          }}
        >
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              {`¿Está seguro que desea eliminar el producto "${product?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
