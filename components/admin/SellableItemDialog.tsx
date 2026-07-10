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
import {
  type SellableItemFormItem,
  type SellableItemFormValues,
  type SellableItemMutationResult,
  useSellableItemDialogForm,
} from '@/lib/hooks/useSellableItemDialogForm';
import { CATEGORIES, type Category } from '@/lib/types';
import { cn, formatPrice, getImageUrl } from '@/lib/utils';

interface SellableItemDialogConfig {
  itemName: string;
  itemNameCapitalized: string;
  logName?: string;
  createTitle: string;
  editTitle: string;
  description: string;
  nameLabel: string;
  imageAlt: string;
  showSlug?: boolean;
  showCategory?: boolean;
  showInStore?: boolean;
  showDiscountField: (selectedCategory?: Category) => boolean;
  discountMin: number;
  discountMax: number;
  emptyItem: SellableItemFormItem;
  queryKey: unknown[];
  formFields: Array<keyof SellableItemFormValues>;
  validateDiscount: (value: number, selectedCategory?: Category) => true | string;
  submitItem: (
    id: number | undefined,
    values: SellableItemFormValues & { files?: File[] },
  ) => Promise<SellableItemMutationResult>;
}

interface SellableItemDialogProps {
  item: SellableItemFormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SellableItemDialogConfig;
}

export const SellableItemDialog = ({
  item,
  open,
  onOpenChange,
  config,
}: SellableItemDialogProps) => {
  const {
    currentFiles,
    currentImages,
    dragActive,
    errors,
    formVersion,
    currentDiscount,
    currentPrice,
    handleDeleteCurrentImage,
    handleDeleteUploadImage,
    handleDiscountChange,
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
  } = useSellableItemDialogForm({
    item,
    emptyItem: config.emptyItem,
    onOpenChange,
    queryKey: config.queryKey,
    itemName: config.itemName,
    itemNameCapitalized: config.itemNameCapitalized,
    logName: config.logName,
    formFields: config.formFields,
    submitItem: config.submitItem,
  });

  const shouldShowDiscount = config.showDiscountField(selectedCategory);
  const calculatedPriceWithDiscount =
    Number.isFinite(currentPrice) && Number.isFinite(currentDiscount)
      ? Number((currentPrice * (1 - currentDiscount / 100)).toFixed(2))
      : null;

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
                {isEditing ? config.editTitle : config.createTitle}
              </DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-4 px-2 py-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {`${config.nameLabel}${item?.id ? ` (ID: ${item.id})` : ''}`}
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'El nombre es obligatorio',
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {config.showSlug && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Slug
                    </label>
                    <input
                      type="text"
                      {...register('slug', {
                        required: 'El slug es obligatorio',
                        pattern: {
                          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          message:
                            'Use minúsculas, números y guiones, sin espacios',
                        },
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    {...register('description', {
                      required: 'La descripción es obligatoria',
                    })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {config.showCategory && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Categoría
                      </label>
                      <select
                        {...register('category', {
                          required: 'La categoría es obligatoria',
                          onChange: (event) =>
                            handleCategoryChange(event.target.value),
                        })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
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
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {shouldShowDiscount && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        % Descuento
                      </label>
                      <input
                        type="number"
                        min={config.discountMin}
                        max={config.discountMax}
                        step="1"
                        {...register('discount', {
                          valueAsNumber: true,
                          validate: (value) =>
                            config.validateDiscount(value, selectedCategory),
                          onChange: handleDiscountChange,
                        })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                      />
                      {errors.discount && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.discount.message}
                        </p>
                      )}
                      {calculatedPriceWithDiscount !== null && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          Precio con descuento:{' '}
                          {formatPrice(calculatedPriceWithDiscount)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {config.showInStore && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="inStore"
                      {...register('inStore')}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
                    />
                    <label
                      htmlFor="inStore"
                      className="cursor-pointer text-sm font-medium text-gray-700"
                    >
                      Disponible en tienda física
                    </label>
                  </div>
                )}

                <div
                  className={cn('mt-6 space-y-3', {
                    hidden: currentImages.length === 0,
                  })}
                >
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Imágenes actuales
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                    {currentImages.map((image, index) => (
                      <div key={image} className="group relative">
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <Image
                            src={getImageUrl(image)}
                            alt={config.imageAlt}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="absolute left-2 top-2 flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(event) => {
                              event.preventDefault();
                              handleMoveCurrentImage(index, index - 1);
                            }}
                            className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === currentImages.length - 1}
                            onClick={(event) => {
                              event.preventDefault();
                              handleMoveCurrentImage(index, index + 1);
                            }}
                            className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleDeleteCurrentImage(image);
                          }}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="mt-1 truncate px-2 text-xs text-slate-600">
                          {image}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-2 py-4">
                <div className="bg-white">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nuevas imágenes
                  </label>

                  <div
                    className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Imágenes por cargar
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                      {currentFiles.map((file, index) => (
                        <div key={file.name} className="group relative">
                          <div className="relative aspect-square overflow-hidden rounded-lg">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={config.imageAlt}
                              fill
                              unoptimized
                              sizes="(max-width: 1024px) 50vw, 25vw"
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="absolute left-2 top-2 flex gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(event) => {
                                event.preventDefault();
                                handleMoveUploadImage(index, index - 1);
                              }}
                              className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentFiles.length - 1}
                              onClick={(event) => {
                                event.preventDefault();
                                handleMoveUploadImage(index, index + 1);
                              }}
                              className="rounded-full bg-white/90 p-1 text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              handleDeleteUploadImage(file.name);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="mt-1 truncate px-2 text-xs text-slate-600">
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
