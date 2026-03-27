'use client';

import { useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/types';

const CATEGORY_DEBOUNCE_MS = 700;

interface UseCategorySelectionParams {
  selectedCategories: Category[];
  onSelectionChange: (categories: Category[]) => void;
}

interface UseCategorySelectionResult {
  localSelectedCategories: Category[];
  handleToggleCategory: (category: Category) => void;
  //handleSelectAll: () => void;
}

export function useCategorySelection({
  selectedCategories,
  onSelectionChange,
}: UseCategorySelectionParams): UseCategorySelectionResult {
  const [localSelectedCategories, setLocalSelectedCategories] =
    useState<Category[]>(selectedCategories);
  const selectionChangeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    return () => {
      if (selectionChangeTimeoutRef.current !== null) {
        window.clearTimeout(selectionChangeTimeoutRef.current);
      }
    };
  }, []);

  const scheduleSelectionChange = (nextCategories: Category[]) => {
    if (selectionChangeTimeoutRef.current !== null) {
      window.clearTimeout(selectionChangeTimeoutRef.current);
    }

    selectionChangeTimeoutRef.current = window.setTimeout(() => {
      onSelectionChange(nextCategories);
    }, CATEGORY_DEBOUNCE_MS);
  };

  const handleToggleCategory = (category: Category) => {
    setLocalSelectedCategories((currentCategories) => {
      const nextCategories = currentCategories.includes(category)
        ? currentCategories.filter(
            (currentCategory) => currentCategory !== category,
          )
        : [...currentCategories, category];

      scheduleSelectionChange(nextCategories);

      return nextCategories;
    });
  };

  /*const handleSelectAll = () => {
    setLocalSelectedCategories([]);
    scheduleSelectionChange([]);
  };*/

  return {
    localSelectedCategories,
    handleToggleCategory,
    //handleSelectAll,
  };
}
