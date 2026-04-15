import Image from 'next/image';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CATEGORIES, type Product } from '@/lib/types';
import { cn, getImageUrl } from '@/lib/utils';
import { useProductDialogForm } from '@/lib/hooks/useProductDialogForm';

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDialogProps) => {
  const {
    currentFiles,
    currentImages,
    dragActive,
    errors,
    formVersion,
    handleDeleteCurrentImage,
    handleDeleteUploadImage,
    handleCategoryChange,
    handleDialogOpenChange,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleMoveCurrentImage,
    handleMoveUploadImage,
    handleSubmit,
    isEditing,
    isPending,
    onSubmit,
    selectedCategory,
    register,
    submitError,
  } = useProductDialogForm({
    product,
    onOpenChange,
  });

  const validateDiscount = (value: number) => {
    if (selectedCategory !== 'rebajas') {
      return value === 0 || 'El descuento debe ser 0 fuera de Rebajas';
    }

    if (!Number.isInteger(value)) {
      return 'El descuento debe ser un número entero';
    }

    if (value < 1 || value > 100) {
      return 'El descuento debe estar entre 1 y 100';
    }

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden sm:max-w-4xl xl:max-w-5xl">
        <form
          key={formVersion}
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar producto' : 'Agregar nuevo producto'}
              </DialogTitle>
              <DialogDescription>
                Ingrese todos los detalles del producto
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-4 py-4 px-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {`Nombre del Producto${product?.id ? ` (ID: ${product.id})` : ''}`}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      {...register('category', {
                        required: 'La categoría es obligatoria',
                        onChange: (event) =>
                          handleCategoryChange(event.target.value),
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (L)
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

                  {selectedCategory === 'rebajas' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        % Descuento
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        {...register('discount', {
                          valueAsNumber: true,
                          validate: validateDiscount,
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      {errors.discount && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.discount.message}
                        </p>
                      )}
                    </div>
                  )}
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

                <div
                  className={cn('mt-6 space-y-3', {
                    hidden: currentImages.length === 0,
                  })}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes actuales
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                    {currentImages.map((image, index) => (
                      <div key={image} className="relative group">
                        <div className="relative aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                          <Image
                            src={getImageUrl(image)}
                            alt="Product"
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMoveCurrentImage(index, index - 1);
                            }}
                            className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === currentImages.length - 1}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMoveCurrentImage(index, index + 1);
                            }}
                            className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteCurrentImage(image);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="mt-1 text-xs text-slate-600 truncate px-2">
                          {image}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 py-4 px-2">
                <div className="bg-white">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevas imágenes
                  </label>

                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={handleFileChange}
                    />
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div>
                        <p className="text-lg font-medium text-slate-700">
                          Arrastra las imágenes aquí
                        </p>
                        <p className="text-sm text-slate-500">
                          o haz clic para buscar
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        Máximo 1 MB por imagen. Preferiblemente en formato WebP
                        de 800 x 800 píxeles para mejor rendimiento
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn('mt-6 space-y-3', {
                      hidden: currentFiles.length === 0,
                    })}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imágenes por cargar
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                      {currentFiles.map((file, index) => (
                        <div key={file.name} className="relative group">
                          <div className="relative aspect-square overflow-hidden rounded-lg">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Product"
                              fill
                              unoptimized
                              sizes="(max-width: 1024px) 50vw, 25vw"
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="absolute top-2 left-2 flex gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMoveUploadImage(index, index - 1);
                              }}
                              className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentFiles.length - 1}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMoveUploadImage(index, index + 1);
                              }}
                              className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteUploadImage(file.name);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="mt-1 text-xs text-slate-600 truncate px-2">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.images && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.images.message}
                    </p>
                  )}
                </div>
              </div>
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
