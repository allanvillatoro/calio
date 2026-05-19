'use client';

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { CartItemRow } from './CartItemRow';
import { createCartOrderPdfBlob } from './CartOrderPdf';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatPrice } from '@/lib/utils';

export default function CartContent() {
  const [isRequestingOrder, setIsRequestingOrder] = useState(false);
  const items = useCartStore((state) => state.items);
  const incrementProduct = useCartStore((state) => state.incrementProduct);
  const decrementProduct = useCartStore((state) => state.decrementProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const subtotal = items.reduce(
    (total, item) => total + item.product.priceWithDiscount * item.quantity,
    0,
  );

  const handleIncrementProduct = (productId: number) => {
    const wasAdded = incrementProduct(productId);

    if (!wasAdded) {
      toast.error('Ya no se puede agregar más de este producto');
    }
  };

  const getWhatsappMessage = () => {
    const orderLines = items.map(
      ({ product, quantity }) =>
        `${quantity} x ${product.name} - ${formatPrice(
          product.priceWithDiscount * quantity,
        )}`,
    );

    return [
      'Hola, quiero hacer este pedido',
      '',
      ...orderLines,
      '',
      `Subtotal: ${formatPrice(subtotal)}`,
    ].join('\n');
  };

  const getWhatsappUrl = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';
    const message = encodeURIComponent(getWhatsappMessage());

    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  const handleRequestOrder = async () => {
    setIsRequestingOrder(true);
    const loadingToast = toast.loading('Generando PDF del carrito...');

    try {
      const pdfBlob = await createCartOrderPdfBlob(items, subtotal);
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'pedido-calio.pdf';
      link.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success('PDF descargado correctamente', {
        id: loadingToast,
      });
    } catch {
      toast.error('No se pudo generar el PDF del carrito', {
        id: loadingToast,
      });
    } finally {
      setIsRequestingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
        Tu carrito está vacío.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onDecrement={decrementProduct}
              onIncrement={handleIncrementProduct}
              onRemove={removeProduct}
            />
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-200 p-4 md:p-6">
          <p className="text-xl font-bold text-gray-900">
            Subtotal: {formatPrice(subtotal)}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200 p-4 md:p-6">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-semibold leading-tight text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
            onClick={handleRequestOrder}
            disabled={isRequestingOrder}
          >
            {isRequestingOrder ? 'Generando...' : 'Descargar PDF'}
          </button>
          <a
            href={getWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold leading-tight text-white transition-colors hover:bg-green-700 sm:text-base"
          >
            <FaWhatsapp className="size-5" />
            Solicitar por WhatsApp
          </a>
        </div>
        <p className="text-sm text-gray-600">
          Descarga el PDF del pedido y adjúntalo en el mensaje de WhatsApp.
          <br />
          Envío local o nacional por un costo adicional.
        </p>
      </div>
    </div>
  );
}
