export type Category =
  | 'Audio'
  | 'Electronics'
  | 'Wearables'
  | 'Home'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: number;
  description: string;
  /** Deterministic placeholder image color (hex) used by the placeholder renderer. */
  accent: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}
