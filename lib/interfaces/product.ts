export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: string;
  inStore: boolean;
  createdAt: Date;
  updatedAt: Date;
}
