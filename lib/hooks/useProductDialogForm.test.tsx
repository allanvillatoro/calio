import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';
import type { Product } from '@/lib/types';
import { useProductDialogForm } from './useProductDialogForm';

vi.mock('@/lib/actions/product-mutations.action', () => ({
  createProductAction: vi.fn(),
  updateProductAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const baseProduct: Product = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 5,
  inStore: true,
  category: 'collares',
  images: ['collar-perla.jpg', 'collar-perla-2.jpg'],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    Wrapper,
    invalidateQueries,
  };
}

function renderProductDialogForm(product: Product | null = null) {
  const onOpenChange = vi.fn();
  const { Wrapper, invalidateQueries } = createWrapper();
  const hook = renderHook(
    ({ product: currentProduct }) =>
      useProductDialogForm({
        product: currentProduct,
        onOpenChange,
      }),
    {
      initialProps: {
        product,
      },
      wrapper: Wrapper,
    },
  );

  return {
    ...hook,
    invalidateQueries,
    onOpenChange,
  };
}

function createFile(name: string, sizeInBytes = 10) {
  return new File(['x'.repeat(sizeInBytes)], name, {
    type: 'image/jpeg',
  });
}

function createFileChangeEvent(files: File[]) {
  return {
    target: {
      files,
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

function createSubmitValues(overrides: Partial<Product> & { files?: File[] }) {
  return {
    id: overrides.id,
    name: overrides.name ?? baseProduct.name,
    description: overrides.description ?? baseProduct.description,
    price: overrides.price ?? baseProduct.price,
    discount: overrides.discount ?? baseProduct.discount,
    quantity: overrides.quantity ?? baseProduct.quantity,
    inStore: overrides.inStore ?? baseProduct.inStore ?? false,
    category: overrides.category ?? baseProduct.category,
    images: overrides.images ?? baseProduct.images,
    files: overrides.files ?? [],
  };
}

describe('useProductDialogForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets form state from the product being edited', async () => {
    const { result } = renderProductDialogForm(baseProduct);

    await waitFor(() => {
      expect(result.current.isEditing).toBe(true);
      expect(result.current.currentPrice).toBe(baseProduct.price);
      expect(result.current.currentDiscount).toBe(baseProduct.discount);
      expect(result.current.currentImages).toEqual(baseProduct.images);
      expect(result.current.selectedCategory).toBe(baseProduct.category);
    });
  });

  it('sets discount to zero when category changes outside rebajas', async () => {
    const product = {
      ...baseProduct,
      category: 'rebajas' as const,
      discount: 30,
    };
    const { result } = renderProductDialogForm(product);

    await waitFor(() => {
      expect(result.current.currentDiscount).toBe(30);
    });

    act(() => {
      result.current.handleCategoryChange('collares');
    });

    await waitFor(() => {
      expect(result.current.currentDiscount).toBe(0);
    });
  });

  it('restores the edited product discount when changing to rebajas', async () => {
    const product = {
      ...baseProduct,
      discount: 25,
    };
    const { result } = renderProductDialogForm(product);

    act(() => {
      result.current.handleCategoryChange('rebajas');
    });

    await waitFor(() => {
      expect(result.current.currentDiscount).toBe(25);
    });
  });

  it('deduplicates selected files by name and rejects files larger than one megabyte', async () => {
    const firstFile = createFile('collar.jpg');
    const duplicateFile = createFile('collar.jpg');
    const secondFile = createFile('detalle.jpg');
    const oversizedFile = createFile('pesada.jpg', 1024 * 1024 + 1);
    const { result } = renderProductDialogForm();

    act(() => {
      result.current.handleFileChange(createFileChangeEvent([firstFile]));
    });

    await waitFor(() => {
      expect(result.current.currentFiles).toEqual([firstFile]);
    });

    act(() => {
      result.current.handleFileChange(
        createFileChangeEvent([duplicateFile, secondFile, oversizedFile]),
      );
    });

    await waitFor(() => {
      expect(result.current.currentFiles).toEqual([firstFile, secondFile]);
    });
    expect(toast.error).toHaveBeenCalledWith(
      'Cada imagen debe pesar menos de 1 MB',
    );
  });

  it('removes and reorders current product images', async () => {
    const { result } = renderProductDialogForm(baseProduct);

    await waitFor(() => {
      expect(result.current.currentImages).toEqual(baseProduct.images);
    });

    act(() => {
      result.current.handleMoveCurrentImage(0, 1);
    });

    await waitFor(() => {
      expect(result.current.currentImages).toEqual([
        'collar-perla-2.jpg',
        'collar-perla.jpg',
      ]);
    });

    act(() => {
      result.current.handleDeleteCurrentImage('collar-perla.jpg');
    });

    await waitFor(() => {
      expect(result.current.currentImages).toEqual(['collar-perla-2.jpg']);
    });
  });

  it('creates a product, resets the form, and refreshes product queries when the dialog closes', async () => {
    const { result, invalidateQueries, onOpenChange } =
      renderProductDialogForm();
    vi.mocked(createProductAction).mockResolvedValue({
      success: true,
      product: {
        ...baseProduct,
        id: 44,
      },
    });

    act(() => {
      result.current.onSubmit(
        createSubmitValues({
          category: 'collares',
          discount: 40,
        }),
      );
    });

    await waitFor(() => {
      expect(createProductAction).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'collares',
          discount: 0,
        }),
      );
      expect(result.current.formVersion).toBe(1);
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Producto Collar Perla creado correctamente',
    );

    act(() => {
      result.current.handleDialogOpenChange(false);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['products'],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('maps server validation details to form field errors', async () => {
    const { result } = renderProductDialogForm();
    vi.mocked(createProductAction).mockResolvedValue({
      success: false,
      error: 'Validation failed',
      details: [
        {
          path: 'name',
          message: 'Name is required',
        },
      ],
    });

    act(() => {
      result.current.onSubmit(createSubmitValues({ name: '' }));
    });

    await waitFor(() => {
      expect(result.current.submitError).toBe('Validation failed');
      expect(result.current.errors.name?.message).toBe('Name is required');
    });
    expect(toast.error).toHaveBeenCalledWith('Validation failed');
  });

  it('updates an edited product, refreshes products, and closes the dialog', async () => {
    const { result, invalidateQueries, onOpenChange } =
      renderProductDialogForm(baseProduct);
    vi.mocked(updateProductAction).mockResolvedValue({
      success: true,
      product: baseProduct,
    });

    act(() => {
      result.current.onSubmit(
        createSubmitValues({
          ...baseProduct,
          category: 'rebajas',
          discount: 20,
        }),
      );
    });

    await waitFor(() => {
      expect(updateProductAction).toHaveBeenCalledWith(
        baseProduct.id,
        expect.objectContaining({
          category: 'rebajas',
          discount: 20,
        }),
      );
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['products'],
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Producto Collar Perla actualizado correctamente',
    );
  });
});
