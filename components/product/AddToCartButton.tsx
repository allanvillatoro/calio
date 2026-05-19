'use client';

import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { type CartProduct, useCartStore } from '@/lib/stores/cart.store';

interface AddToCartButtonProps {
  product: CartProduct;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addProduct = useCartStore((state) => state.addProduct);

  const handleAddToCart = () => {
    const wasAdded = addProduct(product);

    if (wasAdded) {
      toast.success('Producto agregado al carrito');
      return;
    }

    toast.error('Ya no se puede agregar más de este producto');
  };

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-semibold transition-colors bg-gray-900 text-white hover:bg-gray-700"
      onClick={handleAddToCart}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <ShoppingCart className="size-6" />
      Agregar al carrito
    </button>
  );
}
