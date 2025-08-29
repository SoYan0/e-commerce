export interface ProductSnapshot {
  id: number;
  name: string;
  price: number;
  stock?: number;
}

export interface ReserveItemInput {
  productId: number;
  quantity: number;
}
