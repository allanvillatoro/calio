import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import type { Product } from '@/lib/types';

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
  const handleDelete = () => {
    console.log(`Eliminar producto ${product?.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="xl:max-w-xl">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              {`¿Está seguro que desea eliminar el producto "${product?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button type="submit" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
