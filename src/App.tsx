import { CartProvider } from './cart/CartContext';
import { NavProvider, useNav } from './nav/NavContext';
import { Header } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

function CurrentView() {
  const { view, selectedProductId } = useNav();
  switch (view) {
    case 'catalog':
      return <CatalogPage />;
    case 'detail':
      return <ProductDetailPage productId={selectedProductId} />;
    case 'cart':
      return <CartPage />;
    case 'checkout':
      return <CheckoutPage />;
    default:
      return <CatalogPage />;
  }
}

function Shell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <CurrentView />
      </main>
      <footer className="app-footer">
        <p>&copy; Halcyon Store &mdash; demo retail app</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavProvider>
        <Shell />
      </NavProvider>
    </CartProvider>
  );
}
