import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { CATEGORIES, type Product } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductFormValues {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  inStore: boolean;
  category: Product['category'];
  imagesText: string;
}

const emptyForm = {
  id: undefined,
  name: EMPTY_PRODUCT.name,
  description: EMPTY_PRODUCT.description,
  price: EMPTY_PRODUCT.price,
  quantity: EMPTY_PRODUCT.quantity,
  inStore: EMPTY_PRODUCT.inStore,
  category: EMPTY_PRODUCT.category,
  imagesText: '',
};

export const ProductDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDialogProps) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: emptyForm,
  });

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
    }

    onOpenChange(nextOpen);
  };

  useEffect(() => {
    reset({
      id:
        typeof product?.id === 'number' && product.id > 0
          ? product.id
          : undefined,
      name: product?.name ?? EMPTY_PRODUCT.name,
      description: product?.description ?? EMPTY_PRODUCT.description,
      price: product?.price ?? EMPTY_PRODUCT.price,
      quantity: product?.quantity ?? EMPTY_PRODUCT.quantity,
      inStore: product?.inStore ?? EMPTY_PRODUCT.inStore ?? false,
      category: product?.category ?? EMPTY_PRODUCT.category,
      imagesText: product?.images?.join(', ') ?? '',
    });
  }, [product, reset]);

  const isEditing = !!product?.id;

  const onSubmit = (values: ProductFormValues) => {
    const images = values.imagesText
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);

    const productData = {
      name: values.name,
      description: values.description,
      price: values.price,
      quantity: values.quantity,
      inStore: values.inStore,
      category: values.category,
      images,
    };

    setSubmitError(null);

    startTransition(async () => {
      const result =
        isEditing && product?.id
          ? await updateProductAction(product.id, productData)
          : await createProductAction(productData);

      if (!result.success) {
        const formFields: Array<keyof ProductFormValues> = [
          'name',
          'description',
          'price',
          'quantity',
          'category',
          'imagesText',
        ];

        result.details?.forEach((detail) => {
          const field = detail.path as keyof ProductFormValues;

          if (formFields.includes(field)) {
            setError(field, {
              type: 'server',
              message: detail.message,
            });
          }
        });

        setSubmitError(result.error ?? 'No se pudo guardar el producto');
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      if (isEditing) {
        handleDialogOpenChange(false);
        return;
      }

      reset(emptyForm);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="xl:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register('name', {
                  required: 'El nombre es obligatorio',
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description', {
                  required: 'La descripción es obligatoria',
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (L.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    valueAsNumber: true,
                    required: 'El precio es obligatorio',
                    min: {
                      value: 0,
                      message: 'El precio no puede ser negativo',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  {...register('quantity', {
                    valueAsNumber: true,
                    required: 'La cantidad es obligatoria',
                    min: {
                      value: 0,
                      message: 'La cantidad no puede ser negativa',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStore"
                {...register('inStore')}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
              <label
                htmlFor="inStore"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Disponible en tienda física
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                {...register('category', {
                  required: 'La categoría es obligatoria',
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imágenes (separadas por comas, ej: &quot;1, 1-1, 1-2&quot;)
              </label>
              <input
                type="text"
                {...register('imagesText', {
                  required: 'Debes ingresar al menos una imagen',
                  validate: (value) =>
                    value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean).length > 0 ||
                    'Debes ingresar al menos una imagen valida',
                })}
                placeholder="Ej: img1-1.webp, img1-2.webp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {errors.imagesText && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.imagesText.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Ingresa todos los nombres de archivo de las imágenes separados
                por comas. El primer nombre será la imagen principal.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Agregar'}
            </Button>
          </DialogFooter>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
};
