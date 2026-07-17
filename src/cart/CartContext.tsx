import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine, Product } from '../types';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: nextQty } : l,
        );
      }
      const initialQty = Math.min(quantity, product.stock);
      return [...prev, { product, quantity: initialQty }];
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.product.id !== productId) return l;
          const clamped = Math.max(0, Math.min(quantity, l.product.stock));
          return { ...l, quantity: clamped };
        })
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
    return { lines, count, total, addToCart, removeLine, setQuantity, clearCart };
  }, [lines, addToCart, removeLine, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
