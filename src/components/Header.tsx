import { useCart } from '../cart/CartContext';
import { useNav } from '../nav/NavContext';

export function Header() {
  const { count, total } = useCart();
  const { goToCatalog, goToCart } = useNav();

  return (
    <header className="header">
      <button
        type="button"
        className="header__brand"
        data-testid="brand-home"
        onClick={goToCatalog}
      >
        Halcyon Store
      </button>
      <button
        type="button"
        className="header__cart"
        data-testid="cart-link"
        onClick={goToCart}
        aria-label={`Cart with ${count} items`}
      >
        <span className="header__cart-icon" aria-hidden="true">&#128722;</span>
        <span className="header__cart-label">Cart</span>
        <span className="header__cart-count" data-testid="cart-count">
          {count}
        </span>
        {count > 0 && (
          <span className="header__cart-total" data-testid="cart-header-total">
            {total.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </button>
    </header>
  );
}
