import { productsApi } from '../api/products.api';
import type { Paging, ProductResponse } from '../interfaces/product';
import type { Category, Product } from '../types';

interface GetProductsParams {
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
  instore?: boolean;
}

export const getProductsByQuery = async (
  params: GetProductsParams,
): Promise<{ data: Product[]; paging: Paging }> => {
  const response = await productsApi<ProductResponse>('/', {
    params,
  });

  const data: Product[] = response.data.data.map((product) => {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      images: product.images,
      category: product.category as Category,
      inStore: product.inStore,
    };
  });

  return {
    data,
    paging: response.data.paging,
  };
};
