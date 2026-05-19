import type { Metadata } from 'next';
import CartContent from '@/components/cart/CartContent';

export const metadata: Metadata = {
  title: 'Carrito de compra | CALIO Joyería',
  description: 'Revisa los productos agregados a tu carrito de compra.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Carrito de compra
        </h1>
        <CartContent />
      </div>
    </div>
  );
}
