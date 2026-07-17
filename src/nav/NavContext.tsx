import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type View = 'catalog' | 'detail' | 'cart' | 'checkout';

interface NavContextValue {
  view: View;
  selectedProductId: string | null;
  goToCatalog: () => void;
  goToDetail: (productId: string) => void;
  goToCart: () => void;
  goToCheckout: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const goToCatalog = useCallback(() => {
    setView('catalog');
    setSelectedProductId(null);
    window.scrollTo(0, 0);
  }, []);

  const goToDetail = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setView('detail');
    window.scrollTo(0, 0);
  }, []);

  const goToCart = useCallback(() => {
    setView('cart');
    window.scrollTo(0, 0);
  }, []);

  const goToCheckout = useCallback(() => {
    setView('checkout');
    window.scrollTo(0, 0);
  }, []);

  return (
    <NavContext.Provider
      value={{ view, selectedProductId, goToCatalog, goToDetail, goToCart, goToCheckout }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within a NavProvider');
  return ctx;
}
