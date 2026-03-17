import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import type { Product } from '@/lib/types';

interface DeleteDialogProps {
  product: Product;
}

export const DeleteDialog = ({ product }: DeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    console.log(`Eliminar producto ${product.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger
          render={
            <Button
              aria-label="Eliminar"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            >
              Eliminar
            </Button>
          }
        />

        {open && (
          <DialogContent className="xl:max-w-xl">
            <DialogHeader>
              <DialogTitle>Eliminar producto</DialogTitle>
              <DialogDescription>
                {`¿Está seguro que desea eliminar el producto "${product.name}"?`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline">Cancelar</Button>}
              />
              <Button type="submit" onClick={handleDelete}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </form>
    </Dialog>
  );
};
