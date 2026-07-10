import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteLaserEngravingAction } from '@/lib/actions/laser-engraving-mutations.action';
import type { LaserEngravingFormItem } from '@/lib/constants/laser-engraving';
import { LaserEngravingDeleteDialog } from './LaserEngravingDeleteDialog';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogClose: ({ render }: { render: React.ReactNode }) => render,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <footer>{children}</footer>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/actions/laser-engraving-mutations.action', () => ({
  deleteLaserEngravingAction: vi.fn(),
}));

const laserEngraving: LaserEngravingFormItem = {
  id: 7,
  slug: 'placa-corazon',
  name: 'Placa corazon',
  description: 'Grabado laser',
  price: 180,
  discount: 0,
  priceWithDiscount: 180,
  quantity: 4,
  images: ['placa.jpg'],
};

const invalidateQueries = vi.fn();

describe('LaserEngravingDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as never);
  });

  it('renders the delete confirmation for the selected laser engraving', () => {
    render(
      <LaserEngravingDeleteDialog
        laserEngraving={laserEngraving}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Eliminar grabado' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        '¿Está seguro que desea eliminar el grabado "Placa corazon"?',
      ),
    ).toBeVisible();
  });

  it('shows an error when submitting without a selected laser engraving', () => {
    render(
      <LaserEngravingDeleteDialog
        laserEngraving={null}
        open
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo identificar el grabado a eliminar',
    );
    expect(deleteLaserEngravingAction).not.toHaveBeenCalled();
  });

  it('invalidates laser engravings and closes on successful delete', async () => {
    const onOpenChange = vi.fn();
    vi.mocked(deleteLaserEngravingAction).mockResolvedValue({
      success: true,
    });

    render(
      <LaserEngravingDeleteDialog
        laserEngraving={laserEngraving}
        open
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['laser-engravings'],
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Grabado Placa corazon eliminado correctamente',
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
