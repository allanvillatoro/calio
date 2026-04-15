export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  category: string;
  inStore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductResponse {
  data: IProduct[];
  paging: Paging;
}

export interface Paging {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
