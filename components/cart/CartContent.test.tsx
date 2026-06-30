import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/lib/stores/cart.store';
import { useCartStore } from '@/lib/stores/cart.store';
import { createCartOrderPdfBlob } from './CartOrderPdf';
import CartContent from './CartContent';

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

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    loading: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('./CartOrderPdf', () => ({
  createCartOrderPdfBlob: vi.fn(),
}));

const item: CartItem = {
  product: {
    id: 12,
    name: 'Collar Perla',
    description: 'Collar dorado con dije de perla',
    price: 250,
    discount: 0,
    priceWithDiscount: 200,
    quantity: 2,
    images: ['collar-perla.jpg'],
    category: 'collares',
    inStore: true,
  },
  quantity: 1,
};

function setCartItems(items: CartItem[]) {
  useCartStore.setState({ items });
}

const originalCartActions = {
  incrementProduct: useCartStore.getState().incrementProduct,
  decrementProduct: useCartStore.getState().decrementProduct,
  removeProduct: useCartStore.getState().removeProduct,
};

describe('CartContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      items: [],
      ...originalCartActions,
    });
    vi.stubEnv('NEXT_PUBLIC_CONTACT_PHONE', '50499999999');
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:pedido'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders an empty cart message', () => {
    render(<CartContent />);

    expect(screen.getByText('Tu carrito está vacío.')).toBeVisible();
  });

  it('renders items, subtotal, and WhatsApp order link', () => {
    setCartItems([
      item,
      {
        ...item,
        product: {
          ...item.product,
          id: 13,
          name: 'Aretes Luna',
          priceWithDiscount: 150,
        },
        quantity: 2,
      },
    ]);

    render(<CartContent />);

    expect(screen.getByText('Collar Perla')).toBeVisible();
    expect(screen.getByText('Aretes Luna')).toBeVisible();
    expect(screen.getByText('Subtotal: L500')).toBeVisible();

    const whatsappLink = screen.getByRole('link', {
      name: /Solicitar por WhatsApp/,
    });
    expect(whatsappLink).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/50499999999?text='),
    );
    expect(
      decodeURIComponent(whatsappLink.getAttribute('href') ?? ''),
    ).toContain('Subtotal: L500');
  });

  it('increments cart item quantities and updates the subtotal', async () => {
    setCartItems([item]);
    render(<CartContent />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Aumentar cantidad de Collar Perla' }),
    );

    expect(await screen.findByText('Subtotal: L400')).toBeVisible();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error when incrementing beyond available stock', async () => {
    const incrementProduct = vi.fn(() => false);
    useCartStore.setState({
      items: [item],
      incrementProduct,
    });
    render(<CartContent />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Aumentar cantidad de Collar Perla' }),
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Ya no se puede agregar más de este producto',
    );
    expect(incrementProduct).toHaveBeenCalledWith(item.product.id);
    expect(screen.getByText('Subtotal: L200')).toBeVisible();
  });

  it('uses an empty WhatsApp phone number when the contact env var is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_CONTACT_PHONE', '');
    setCartItems([item]);

    render(<CartContent />);

    expect(
      screen.getByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).toHaveAttribute('href', expect.stringContaining('https://wa.me/?text='));
  });

  it('downloads the generated PDF order', async () => {
    setCartItems([item]);
    const click = vi.fn();
    vi.mocked(toast.loading).mockReturnValue('toast-id');
    vi.mocked(createCartOrderPdfBlob).mockResolvedValue(
      new Blob(['pdf'], { type: 'application/pdf' }),
    );

    render(<CartContent />);

    const originalCreateElement = document.createElement.bind(document);
    const createElement = vi.spyOn(document, 'createElement');
    createElement.mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          click,
          href: '',
          download: '',
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }));

    await waitFor(() => {
      expect(createCartOrderPdfBlob).toHaveBeenCalledWith([item], 200);
      expect(click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'PDF descargado correctamente',
        {
          id: 'toast-id',
        },
      );
    });
  });

  it('shows an error when PDF generation fails', async () => {
    setCartItems([item]);
    vi.mocked(toast.loading).mockReturnValue('toast-id');
    vi.mocked(createCartOrderPdfBlob).mockRejectedValue(
      new Error('PDF failed'),
    );

    render(<CartContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo generar el PDF del carrito',
        {
          id: 'toast-id',
        },
      );
    });
    expect(
      screen.getByRole('button', { name: 'Descargar PDF' }),
    ).not.toBeDisabled();
  });
});
