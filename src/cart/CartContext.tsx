import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine, Product } from '../types';
import { getProductById } from '../data/catalog';
import { loadCart, saveCart, clearStoredCart } from './storage';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Serializable cart shape persisted to session storage. */
interface StoredLine {
  productId: string;
  quantity: number;
}

/** Rehydrate persisted entries into full cart lines via the deterministic catalog. */
function rehydrate(): CartLine[] {
  const raw = loadCart();
  if (!Array.isArray(raw)) return [];
  const lines: CartLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const { productId, quantity } = entry as Partial<StoredLine>;
    if (typeof productId !== 'string' || typeof quantity !== 'number') continue;
    const product = getProductById(productId);
    if (!product) continue; // product removed from seed -> drop stale entry
    const safeQty = Math.max(0, Math.min(Math.trunc(quantity), product.stock));
    if (safeQty > 0) lines.push({ product, quantity: safeQty });
  }
  return lines;
}

/** Serialize cart lines to the persisted shape. */
function serialize(lines: CartLine[]): StoredLine[] {
  return lines.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => rehydrate());
  // Avoid writing back during the initial render pass.
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveCart(serialize(lines));
  }, [lines]);

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
          const clamped = Math.max(0, Math.min(Math.trunc(quantity) || 0, l.product.stock));
          return { ...l, quantity: clamped };
        })
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const increment = useCallback((productId: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId
          ? { ...l, quantity: Math.min(l.quantity + 1, l.product.stock) }
          : l,
      ),
    );
  }, []);

  const decrement = useCallback((productId: string) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.product.id === productId
            ? { ...l, quantity: Math.max(0, l.quantity - 1) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    clearStoredCart();
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
    return {
      lines,
      count,
      total,
      addToCart,
      removeLine,
      setQuantity,
      increment,
      decrement,
      clearCart,
    };
  }, [lines, addToCart, removeLine, setQuantity, increment, decrement, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
