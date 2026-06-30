import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import { useProductDialogForm } from '@/lib/hooks/useProductDialogForm';
import { ProductDialog, validateProductDiscount } from './ProductDialog';

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    src,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

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

vi.mock('@/lib/hooks/useProductDialogForm', () => ({
  useProductDialogForm: vi.fn(),
}));

const product: Product = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 20,
  priceWithDiscount: 200,
  quantity: 5,
  inStore: true,
  category: 'rebajas',
  images: ['collar-perla.jpg', 'collar-perla-2.jpg'],
};

const hookHandlers = {
  handleDeleteCurrentImage: vi.fn(),
  handleDeleteUploadImage: vi.fn(),
  handleDiscountChange: vi.fn(),
  handleCategoryChange: vi.fn(),
  handleDialogOpenChange: vi.fn(),
  handleDrag: vi.fn(),
  handleDrop: vi.fn(),
  handleFileChange: vi.fn(),
  handleMoveCurrentImage: vi.fn(),
  handleMoveUploadImage: vi.fn(),
  handleSubmit: vi.fn((submitHandler: () => void) => (event?: Event) => {
    event?.preventDefault();
    submitHandler();
  }),
  onSubmit: vi.fn(),
  register: vi.fn((name: string, options?: Record<string, unknown>) => ({
    name,
    onChange: options?.onChange,
  })),
};

function mockProductDialogForm(
  overrides: Partial<ReturnType<typeof useProductDialogForm>> = {},
) {
  vi.mocked(useProductDialogForm).mockReturnValue({
    currentFiles: [],
    currentImages: [],
    dragActive: false,
    errors: {},
    formVersion: 0,
    isEditing: false,
    isPending: false,
    currentDiscount: 0,
    currentPrice: 250,
    selectedCategory: 'collares',
    submitError: null,
    ...hookHandlers,
    ...overrides,
  } as never);
}

function createFile(name: string) {
  return new File(['image'], name, {
    type: 'image/jpeg',
  });
}

describe('ProductDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:image'),
    });
    mockProductDialogForm();
  });

  it('renders create mode fields and submits through the hook', () => {
    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Agregar nuevo producto' }),
    ).toBeVisible();
    expect(
      screen.getByText('Ingrese todos los detalles del producto'),
    ).toBeVisible();

    const form = screen
      .getByRole('button', { name: 'Agregar' })
      .closest('form');
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(hookHandlers.handleSubmit).toHaveBeenCalledWith(
      hookHandlers.onSubmit,
    );
    expect(hookHandlers.onSubmit).toHaveBeenCalled();
  });

  it('does not render dialog content when closed', () => {
    render(
      <ProductDialog product={null} open={false} onOpenChange={vi.fn()} />,
    );

    expect(
      screen.queryByRole('heading', { name: 'Agregar nuevo producto' }),
    ).not.toBeInTheDocument();
  });

  it('renders edit mode with current images and discount preview', () => {
    mockProductDialogForm({
      currentImages: product.images,
      currentDiscount: 20,
      currentPrice: 250,
      selectedCategory: 'rebajas',
      isEditing: true,
    });

    render(<ProductDialog product={product} open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Editar producto' }),
    ).toBeVisible();
    expect(screen.getByText('Nombre del Producto (ID: 12)')).toBeVisible();
    expect(screen.getByText('Precio con descuento: L200')).toBeVisible();
    expect(screen.getByText('collar-perla.jpg')).toBeVisible();
    expect(screen.getByText('collar-perla-2.jpg')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeVisible();
  });

  it('hides discount controls outside the rebajas category', () => {
    mockProductDialogForm({
      selectedCategory: 'collares',
    });

    const { container } = render(
      <ProductDialog product={null} open onOpenChange={vi.fn()} />,
    );

    expect(container.querySelector('input[name="discount"]')).toBeNull();
    expect(screen.queryByText(/Precio con descuento:/)).not.toBeInTheDocument();
  });

  it('renders field and image validation errors from the hook', () => {
    mockProductDialogForm({
      selectedCategory: 'rebajas',
      errors: {
        name: {
          message: 'El nombre es obligatorio',
        },
        description: {
          message: 'La descripción es obligatoria',
        },
        category: {
          message: 'La categoría es obligatoria',
        },
        quantity: {
          message: 'La cantidad no puede ser negativa',
        },
        price: {
          message: 'El precio no puede ser negativo',
        },
        discount: {
          message: 'El descuento debe estar entre 1 y 99',
        },
        images: {
          message: 'Debe agregar al menos una imagen',
        },
      },
    } as never);

    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    expect(screen.getByText('El nombre es obligatorio')).toBeVisible();
    expect(screen.getByText('La descripción es obligatoria')).toBeVisible();
    expect(screen.getByText('La categoría es obligatoria')).toBeVisible();
    expect(screen.getByText('La cantidad no puede ser negativa')).toBeVisible();
    expect(screen.getByText('El precio no puede ser negativo')).toBeVisible();
    expect(
      screen.getByText('El descuento debe estar entre 1 y 99'),
    ).toBeVisible();
    expect(screen.getByText('Debe agregar al menos una imagen')).toBeVisible();
  });

  it('wires category, discount, file, drag, and drop handlers', () => {
    const firstRender = render(
      <ProductDialog product={null} open onOpenChange={vi.fn()} />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'rebajas' },
    });
    expect(hookHandlers.handleCategoryChange).toHaveBeenCalledWith('rebajas');

    firstRender.unmount();
    mockProductDialogForm({
      selectedCategory: 'rebajas',
    });
    const { container, rerender } = render(
      <ProductDialog product={null} open onOpenChange={vi.fn()} />,
    );
    const discountInput = container.querySelector('input[name="discount"]');
    expect(discountInput).not.toBeNull();
    fireEvent.change(discountInput as HTMLInputElement, {
      target: { value: '20' },
    });
    expect(hookHandlers.handleDiscountChange).toHaveBeenCalled();

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [createFile('collar.jpg')] },
    });
    expect(hookHandlers.handleFileChange).toHaveBeenCalled();

    rerender(<ProductDialog product={null} open onOpenChange={vi.fn()} />);
    const dropText = screen.getByText('Arrastra las imágenes aquí');
    const dropZone = dropText.closest('div')?.parentElement;
    expect(dropZone).not.toBeNull();
    fireEvent.dragEnter(dropZone as HTMLElement);
    fireEvent.drop(dropZone as HTMLElement);
    expect(hookHandlers.handleDrag).toHaveBeenCalled();
    expect(hookHandlers.handleDrop).toHaveBeenCalled();
  });

  it('validates rebajas discounts through the registered discount rules', () => {
    mockProductDialogForm({
      selectedCategory: 'rebajas',
    });
    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    const discountRegisterCall = hookHandlers.register.mock.calls.find(
      ([name]) => name === 'discount',
    );
    expect(discountRegisterCall).toBeDefined();
    const validateDiscount = (
      discountRegisterCall?.[1] as {
        validate: (value: number) => true | string;
      }
    ).validate;

    expect(validateDiscount(20)).toBe(true);
    expect(validateDiscount(20.5)).toBe(
      'El descuento debe ser un número entero',
    );
    expect(validateDiscount(0)).toBe('El descuento debe estar entre 1 y 99');
    expect(validateDiscount(100)).toBe('El descuento debe estar entre 1 y 99');
  });

  it('validates discounts outside the rebajas category', () => {
    expect(validateProductDiscount(0, 'collares')).toBe(true);
    expect(validateProductDiscount(10, 'collares')).toBe(
      'El descuento debe ser 0 fuera de Rebajas',
    );
  });

  it('does not render the discount preview when price data is not finite', () => {
    mockProductDialogForm({
      currentDiscount: 20,
      currentPrice: Number.NaN,
      selectedCategory: 'rebajas',
    });

    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    expect(screen.queryByText(/Precio con descuento:/)).not.toBeInTheDocument();
  });

  it('applies active drag styles to the image drop zone', () => {
    mockProductDialogForm({
      dragActive: true,
    });
    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    const dropText = screen.getByText('Arrastra las imágenes aquí');
    const dropZone = dropText.closest('div')?.parentElement?.parentElement;

    expect(dropZone).toHaveClass('border-blue-400', 'bg-blue-50');
  });

  it('wires image ordering and delete controls', () => {
    mockProductDialogForm({
      currentImages: product.images,
    });
    render(<ProductDialog product={product} open onOpenChange={vi.fn()} />);

    const imageCards = screen.getByText('collar-perla.jpg').closest('.group');
    expect(imageCards).not.toBeNull();
    const buttons = (imageCards as HTMLElement).querySelectorAll('button');

    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(hookHandlers.handleMoveCurrentImage).toHaveBeenCalledWith(0, 1);
    expect(hookHandlers.handleDeleteCurrentImage).toHaveBeenCalledWith(
      'collar-perla.jpg',
    );

    const secondImageCard = screen
      .getByText('collar-perla-2.jpg')
      .closest('.group');
    expect(secondImageCard).not.toBeNull();
    const secondImageButtons = (
      secondImageCard as HTMLElement
    ).querySelectorAll('button');

    fireEvent.click(secondImageButtons[0]);

    expect(hookHandlers.handleMoveCurrentImage).toHaveBeenCalledWith(1, 0);
  });

  it('renders uploaded file previews and pending/error states', () => {
    const file = createFile('nueva.jpg');
    mockProductDialogForm({
      currentFiles: [file],
      isPending: true,
      submitError: 'No se pudo guardar el producto',
    });

    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    expect(screen.getByText('nueva.jpg')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(screen.getByText('No se pudo guardar el producto')).toBeVisible();
  });

  it('wires uploaded image ordering and delete controls', () => {
    const files = [createFile('primera.jpg'), createFile('segunda.jpg')];
    mockProductDialogForm({
      currentFiles: files,
    });

    render(<ProductDialog product={null} open onOpenChange={vi.fn()} />);

    const fileCard = screen.getByText('primera.jpg').closest('.group');
    expect(fileCard).not.toBeNull();
    const buttons = (fileCard as HTMLElement).querySelectorAll('button');

    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(hookHandlers.handleMoveUploadImage).toHaveBeenCalledWith(0, 1);
    expect(hookHandlers.handleDeleteUploadImage).toHaveBeenCalledWith(
      'primera.jpg',
    );

    const secondFileCard = screen.getByText('segunda.jpg').closest('.group');
    expect(secondFileCard).not.toBeNull();
    const secondFileButtons = (secondFileCard as HTMLElement).querySelectorAll(
      'button',
    );

    fireEvent.click(secondFileButtons[0]);

    expect(hookHandlers.handleMoveUploadImage).toHaveBeenCalledWith(1, 0);
  });
});
