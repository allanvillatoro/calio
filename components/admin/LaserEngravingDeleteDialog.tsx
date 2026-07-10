import { deleteLaserEngravingAction } from '@/lib/actions/laser-engraving-mutations.action';
import type { LaserEngravingFormItem } from '@/lib/constants/laser-engraving';
import { SellableItemDeleteDialog } from './SellableItemDeleteDialog';

interface LaserEngravingDeleteDialogProps {
  laserEngraving: LaserEngravingFormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LaserEngravingDeleteDialog = ({
  laserEngraving,
  open,
  onOpenChange,
}: LaserEngravingDeleteDialogProps) => (
  <SellableItemDeleteDialog
    item={laserEngraving}
    open={open}
    onOpenChange={onOpenChange}
    title="Eliminar grabado"
    itemName="grabado"
    itemNameCapitalized="Grabado"
    queryKey={['laser-engravings']}
    deleteItem={deleteLaserEngravingAction}
  />
);
