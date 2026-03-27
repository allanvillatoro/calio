'use client';

import { useEffect, useState } from 'react';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import type { Paging } from '@/lib/interfaces/product';
import type { Product } from '@/lib/types';
import { PRODUCTS_PER_PAGE } from '../constants/product';

interface UseProductsParams {
  category?: string;
  page?: number;
  limit?: number;
  instore?: boolean;
}

interface UseProductsResult {
  products: Product[];
  paging: Paging;
  isLoading: boolean;
}

const DEFAULT_PAGING: Paging = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  limit: PRODUCTS_PER_PAGE,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useProducts = ({
  category,
  page = 1,
  limit = PRODUCTS_PER_PAGE,
  instore,
}: UseProductsParams): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paging, setPaging] = useState<Paging>({
    ...DEFAULT_PAGING,
    currentPage: page,
    limit,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const response = await getProductsByQuery({
          category,
          page,
          limit,
          instore,
        });

        if (isCancelled) {
          return;
        }

        setProducts(response.data);
        setPaging(response.paging);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [category, page, limit, instore]);

  return {
    products,
    paging,
    isLoading,
  };
};
