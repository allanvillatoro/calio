'use client';

import { useEffect, useState } from 'react';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import type { Paging } from '@/lib/interfaces/product';
import type { Product } from '@/lib/types';

interface UseProductsParams {
  category?: string;
  page?: number;
  limit?: number;
  instore?: boolean;
}

interface UseProductsResult {
  data: Product[];
  paging: Paging;
}

const DEFAULT_PAGING: Paging = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 20,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useProducts = ({
  category,
  page = 1,
  limit = 20,
  instore,
}: UseProductsParams): UseProductsResult => {
  const [data, setData] = useState<Product[]>([]);
  const [paging, setPaging] = useState<Paging>({
    ...DEFAULT_PAGING,
    currentPage: page,
    limit,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      const response = await getProductsByQuery({
        category,
        page,
        limit,
        instore,
      });

      if (isCancelled) {
        return;
      }

      setData(response.data);
      setPaging(response.paging);
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [category, page, limit, instore]);

  return {
    data,
    paging,
  };
};
