import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteProductAction } from '@/lib/actions/product-mutations.action';
import type { Product } from '@/lib/types';
import { DeleteDialog } from './DeleteDialog';

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

vi.mock('@/lib/actions/product-mutations.action', () => ({
  deleteProductAction: vi.fn(),
}));

const product: Product = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 5,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
};

const invalidateQueries = vi.fn();

describe('DeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as never);
  });

  it('renders the delete confirmation for the selected product', () => {
    render(<DeleteDialog product={product} open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Eliminar producto' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        '¿Está seguro que desea eliminar el producto "Collar Perla"?',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeVisible();
  });

  it('shows an error when submitting without a selected product', () => {
    render(<DeleteDialog product={null} open onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo identificar el producto a eliminar',
    );
    expect(deleteProductAction).not.toHaveBeenCalled();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('shows action errors without closing the dialog', async () => {
    const onOpenChange = vi.fn();
    vi.mocked(deleteProductAction).mockResolvedValue({
      success: false,
      error: 'No se pudo eliminar el producto',
    });

    render(<DeleteDialog product={product} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(deleteProductAction).toHaveBeenCalledWith(product.id);
    });
    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar el producto');
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('invalidates products, shows success feedback, and closes on successful delete', async () => {
    const onOpenChange = vi.fn();
    vi.mocked(deleteProductAction).mockResolvedValue({
      success: true,
    });

    render(<DeleteDialog product={product} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['products'],
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Producto Collar Perla eliminado correctamente',
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
