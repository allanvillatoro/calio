import { productsApi } from '../api/products.api';
import type { Paging, ProductResponse } from '../interfaces/product';
import type { Category, Product } from '../types';

interface GetProductsParams {
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
  instoresps?: boolean;
  instorepro?: boolean;
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
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      priceWithDiscount: product.priceWithDiscount,
      quantity: product.quantity,
      images: product.images,
      category: product.category as Category,
      inStoreSps: product.inStoreSps,
      inStorePro: product.inStorePro,
    };
  });

  return {
    data,
    paging: response.data.paging,
  };
};
