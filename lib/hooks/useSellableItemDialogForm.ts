import { useEffect, useState, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { mergeFilesByName, moveArrayItem } from '@/lib/utils';
import type { Category } from '@/lib/types';

export interface SellableItemFormItem {
  id: number;
  slug?: string | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  category?: Category;
  inStore?: boolean;
}

export interface SellableItemFormValues {
  id?: number;
  slug?: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  inStore?: boolean;
  category?: Category;
  images: string[];
}

export interface SellableItemMutationResult {
  success: boolean;
  error?: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

interface FormInputs extends SellableItemFormValues {
  files?: File[];
}

interface UseSellableItemDialogFormParams {
  item: SellableItemFormItem | null;
  emptyItem: SellableItemFormItem;
  onOpenChange: (open: boolean) => void;
  queryKey: unknown[];
  itemName: string;
  itemNameCapitalized: string;
  logName?: string;
  formFields: Array<keyof SellableItemFormValues>;
  submitItem: (
    id: number | undefined,
    values: FormInputs,
  ) => Promise<SellableItemMutationResult>;
}

const MAX_IMAGE_FILE_SIZE_BYTES = 1024 * 1024;

function getEmptyFormValues(
  emptyItem: SellableItemFormItem,
): SellableItemFormValues {
  return {
    id: undefined,
    slug: emptyItem.slug ?? '',
    name: emptyItem.name,
    description: emptyItem.description,
    price: emptyItem.price,
    discount: emptyItem.discount,
    quantity: emptyItem.quantity,
    inStore: emptyItem.inStore ?? false,
    category: emptyItem.category,
    images: [],
  };
}

export function useSellableItemDialogForm({
  item,
  emptyItem,
  onOpenChange,
  queryKey,
  itemName,
  itemNameCapitalized,
  logName = itemName,
  formFields,
  submitItem,
}: UseSellableItemDialogFormParams) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const {
    control,
    register,
    reset,
    handleSubmit,
    clearErrors,
    setError,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { ...getEmptyFormValues(emptyItem), files: [] },
  });

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
      if (shouldRefreshOnClose) {
        queryClient.invalidateQueries({
          queryKey,
        });
        setShouldRefreshOnClose(false);
      }
    }

    onOpenChange(nextOpen);
  };

  useEffect(() => {
    reset({
      id: typeof item?.id === 'number' && item.id > 0 ? item.id : undefined,
      slug: item?.slug ?? emptyItem.slug ?? '',
      name: item?.name ?? emptyItem.name,
      description: item?.description ?? emptyItem.description,
      price: item?.price ?? emptyItem.price,
      discount: item?.discount ?? emptyItem.discount,
      quantity: item?.quantity ?? emptyItem.quantity,
      inStore: item?.inStore ?? emptyItem.inStore ?? false,
      category: item?.category ?? emptyItem.category,
      images: item?.images ?? [],
      files: [],
    });
  }, [emptyItem, item, reset]);

  const isEditing = !!item?.id;
  const selectedCategory = useWatch({
    control,
    name: 'category',
  });
  const currentPrice = useWatch({
    control,
    name: 'price',
  });
  const currentDiscount = useWatch({
    control,
    name: 'discount',
  });
  const currentImages =
    useWatch({
      control,
      name: 'images',
    }) || [];
  const currentFiles =
    useWatch({
      control,
      name: 'files',
    }) || [];

  const handleCategoryChange = (category: Category) => {
    clearErrors('discount');

    if (category !== 'rebajas') {
      setValue('discount', 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue('discount', item?.discount && item.discount > 0 ? item.discount : 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleDiscountChange = () => {
    void trigger('discount');
  };

  const clearImagesErrorIfNeeded = (
    files: File[] = getValues('files') || [],
  ) => {
    if ((getValues('images') || []).length > 0 || files.length > 0) {
      clearErrors('images');
    }
  };

  const getValidFiles = (incomingFiles: File[]) => {
    const validFiles = incomingFiles.filter(
      (file) => file.size <= MAX_IMAGE_FILE_SIZE_BYTES,
    );

    if (validFiles.length !== incomingFiles.length) {
      toast.error('Cada imagen debe pesar menos de 1 MB');
    }

    return validFiles;
  };

  const onSubmit = (values: FormInputs) => {
    clearImagesErrorIfNeeded(values.files ?? []);
    setSubmitError(null);

    startTransition(async () => {
      try {
        const result = await submitItem(
          isEditing && item?.id ? item.id : undefined,
          values,
        );

        if (!result.success) {
          result.details?.forEach((detail) => {
            const field = detail.path as keyof SellableItemFormValues;

            if (formFields.includes(field)) {
              setError(field, {
                type: 'server',
                message: detail.message,
              });
            }
          });

          setSubmitError(result.error ?? `No se pudo guardar el ${itemName}`);
          toast.error(
            result.error ?? `No se pudo guardar el ${itemName} ${values.name}`,
          );
          return;
        }

        if (isEditing) {
          queryClient.invalidateQueries({
            queryKey,
          });
          toast.success(
            `${itemNameCapitalized} ${values.name} actualizado correctamente`,
          );
          handleDialogOpenChange(false);
          return;
        }

        setShouldRefreshOnClose(true);
        reset(getEmptyFormValues(emptyItem));
        setFormVersion((currentVersion) => currentVersion + 1);
        setSubmitError(null);
        toast.success(
          `${itemNameCapitalized} ${values.name} creado correctamente`,
        );
      } catch (error) {
        console.error(`Unexpected error while submitting ${logName} form`, error);
        setSubmitError(`Ocurrió un error inesperado al guardar el ${itemName}`);
        toast.error(`Ocurrió un error inesperado al guardar el ${itemName}`);
      }
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

    const validFiles = getValidFiles(Array.from(droppedFiles));

    if (validFiles.length === 0) return;

    const currentFiles = getValues('files') || [];
    const nextFiles = mergeFilesByName(currentFiles, validFiles);
    setValue('files', nextFiles, {
      shouldDirty: true,
    });
    clearImagesErrorIfNeeded(nextFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles) return;

    const validFiles = getValidFiles(Array.from(selectedFiles));

    if (validFiles.length === 0) return;

    const currentFiles = getValues('files') || [];
    const nextFiles = mergeFilesByName(currentFiles, validFiles);
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

  return {
    currentFiles,
    currentImages,
    dragActive,
    errors,
    formVersion,
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
    currentDiscount,
    currentPrice,
    selectedCategory,
    register,
    submitError,
    onSubmit,
  };
}
