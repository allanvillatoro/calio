import { useEffect, useState, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EMPTY_PRODUCT } from '@/lib/constants/product';
import {
  createProductAction,
  updateProductAction,
} from '@/lib/actions/product-mutations.action';
import { mergeFilesByName, moveArrayItem } from '@/lib/utils';
import type { Category, Product } from '@/lib/types';

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

interface UseProductDialogFormParams {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
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

export function useProductDialogForm({
  product,
  onOpenChange,
}: UseProductDialogFormParams) {
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

  return {
    currentFiles,
    currentImages,
    dragActive,
    errors,
    formVersion,
    handleDeleteCurrentImage,
    handleDeleteUploadImage,
    handleDialogOpenChange,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleMoveCurrentImage,
    handleMoveUploadImage,
    handleSubmit,
    isEditing,
    isPending,
    register,
    submitError,
    onSubmit,
  };
}
