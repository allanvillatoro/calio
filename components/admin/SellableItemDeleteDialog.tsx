import { useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

interface SellableItemDeleteTarget {
  id: number;
  name: string;
}

interface SellableItemDeleteResult {
  success: boolean;
  error?: string;
}

interface SellableItemDeleteDialogProps<
  TItem extends SellableItemDeleteTarget,
> {
  item: TItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  itemNameCapitalized: string;
  queryKey: unknown[];
  deleteItem: (id: number) => Promise<SellableItemDeleteResult>;
}

export function SellableItemDeleteDialog<
  TItem extends SellableItemDeleteTarget,
>({
  item,
  open,
  onOpenChange,
  title,
  itemName,
  itemNameCapitalized,
  queryKey,
  deleteItem,
}: SellableItemDeleteDialogProps<TItem>) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!item?.id) {
      toast.error(`No se pudo identificar el ${itemName} a eliminar`);
      return;
    }

    startTransition(async () => {
      const result = await deleteItem(item.id);

      if (!result.success) {
        toast.error(result.error ?? `No se pudo eliminar el ${itemName}`);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey,
      });

      toast.success(
        `${itemNameCapitalized} ${item.name} eliminado correctamente`,
      );
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
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {`¿Está seguro que desea eliminar el ${itemName} "${item?.name}"?`}
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
}
