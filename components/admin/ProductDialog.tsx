import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { CATEGORIES, type Product } from '@/lib/types';
import { useState } from 'react';

interface ProductDialogProps {
  product?: Product;
}

export const ProductDialog = ({ product }: ProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEditing = !!product;

  const handleSubmit = () => {
    console.log(`Guardar producto ${isEditing ? product?.id : '(nuevo)'}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger
          render={
            <Button
              aria-label={isEditing ? `Editar ${product?.name}` : 'Agregar'}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-900 transition-colors"
            >
              {isEditing ? 'Editar' : 'Agregar'}
            </Button>
          }
        />

        {open && (
          <DialogContent className="xl:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar producto' : 'Agregar nuevo producto'}
              </DialogTitle>
              <DialogDescription>
                Ingrese todos los detalles del producto
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  defaultValue={product?.name ?? ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  required
                  defaultValue={product?.description ?? ''}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (L.)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={product?.price ?? 100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    defaultValue={product?.quantity ?? 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  required
                  defaultValue={product?.category ?? CATEGORIES[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imágenes (separadas por comas, ej: &quot;1, 1-1, 1-2&quot;)
                </label>
                <input
                  type="text"
                  required
                  defaultValue={product?.images?.join(', ') ?? ''}
                  placeholder="Ej: 1, 1-1, 1-2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa todos los nombres de archivo de las imágenes separados
                  por comas. El primer nombre será la imagen principal.
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose
                render={<Button variant="outline">Cancelar</Button>}
              />
              <Button type="submit" onClick={handleSubmit}>
                {isEditing ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </form>
    </Dialog>
  );
};
