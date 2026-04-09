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
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CATEGORIES, type Category, type Product } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { cn, getImageUrl, mergeFilesByName, moveArrayItem } from '@/lib/utils';

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
  category: Category;
  images: string[];
}
interface FormInputs extends ProductFormValues {
  files?: File[];
}

function getEmptyFormValues(): ProductFormValues {
  return {
    id: undefined,
    name: EMPTY_PRODUCT.name,
    description: EMPTY_PRODUCT.description,
    price: EMPTY_PRODUCT.price,
    quantity: EMPTY_PRODUCT.quantity,
    inStore: EMPTY_PRODUCT.inStore ?? false,
    category: EMPTY_PRODUCT.category,
    images: [],
  };
}

export const ProductDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDialogProps) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    clearErrors,
    setError,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { ...getEmptyFormValues(), files: [] },
  });

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
      if (shouldRefreshOnClose) {
        queryClient.invalidateQueries({
          queryKey: ['products'],
        });
        setShouldRefreshOnClose(false);
      }
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
      images: product?.images ?? [],
      files: [],
    });
  }, [product, reset]);

  const isEditing = !!product?.id;

  const clearImagesErrorIfNeeded = (
    files: File[] = getValues('files') || [],
  ) => {
    if ((getValues('images') || []).length > 0 || files.length > 0) {
      clearErrors('images');
    }
  };

  const onSubmit = (values: FormInputs) => {
    clearImagesErrorIfNeeded(values.files ?? []);

    const productData = {
      name: values.name,
      description: values.description,
      price: values.price,
      quantity: values.quantity,
      inStore: values.inStore,
      category: values.category,
      images: values.images,
      files: values.files,
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
          'images',
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
        toast.error(
          result.error ?? `No se pudo guardar el producto ${productData.name}`,
        );
        return;
      }

      if (isEditing) {
        queryClient.invalidateQueries({
          queryKey: ['products'],
        });
        toast.success(`Producto ${productData.name} actualizado correctamente`);
        handleDialogOpenChange(false);
        return;
      }

      setShouldRefreshOnClose(true);

      reset(getEmptyFormValues());
      setFormVersion((currentVersion) => currentVersion + 1);
      setSubmitError(null);
      toast.success(`Producto ${productData.name} creado correctamente`);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;

    if (!droppedFiles) return;

    const currentFiles = getValues('files') || [];
    const nextFiles = mergeFilesByName(currentFiles, Array.from(droppedFiles));
    setValue('files', nextFiles, {
      shouldDirty: true,
    });
    clearImagesErrorIfNeeded(nextFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles) return;

    const currentFiles = getValues('files') || [];
    const nextFiles = mergeFilesByName(currentFiles, Array.from(selectedFiles));
    setValue('files', nextFiles, {
      shouldDirty: true,
    });
    clearImagesErrorIfNeeded(nextFiles);
  };

  const handleDeleteUploadImage = (fileName: string) => {
    const currentFiles = getValues('files') || [];
    setValue(
      'files',
      currentFiles.filter((f) => f.name !== fileName),
      {
        shouldDirty: true,
      },
    );
  };

  const handleDeleteCurrentImage = (imageName: string) => {
    const currentImages = getValues('images') || [];

    setValue(
      'images',
      currentImages.filter((image) => image !== imageName),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const handleMoveCurrentImage = (fromIndex: number, toIndex: number) => {
    const images = getValues('images') || [];
    setValue('images', moveArrayItem(images, fromIndex, toIndex), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleMoveUploadImage = (fromIndex: number, toIndex: number) => {
    const files = getValues('files') || [];
    setValue('files', moveArrayItem(files, fromIndex, toIndex), {
      shouldDirty: true,
    });
  };

  const currentImages = watch('images') || [];
  const currentFiles = watch('files') || [];

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
              <div className="space-y-4 py-4">
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
                {/* Current Images */}
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
              <div className="space-y-6 py-4">
                {/* Product Images */}
                <div className="bg-white px-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes del producto
                  </label>

                  {/* Drag & Drop Zone */}
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
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                        Preferiblemente en formato WebP de 800 x 800 píxeles
                        para mejor rendimiento
                      </p>
                    </div>
                  </div>
                  {/* Imagenes por cargar */}
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
