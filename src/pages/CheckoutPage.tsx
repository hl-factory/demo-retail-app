import { useCart } from '../cart/CartContext';
import { useNav } from '../nav/NavContext';
import { formatPrice } from '../utils/format';

export function CheckoutPage() {
  const { lines, total, count } = useCart();
  const { goToCatalog, goToCart } = useNav();

  if (lines.length === 0) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Checkout</h1>
        <p data-testid="checkout-empty">Your cart is empty. Add something to your cart first.</p>
        <button type="button" className="primary-action" onClick={goToCatalog}>
          Browse the catalog
        </button>
      </section>
    );
  }

  return (
    <section className="checkout-page" aria-labelledby="checkout-heading">
      <h1 id="checkout-heading">Order summary</h1>
      <ul className="checkout-lines" data-testid="checkout-lines">
        {lines.map((line) => (
          <li key={line.product.id} className="checkout-line" data-testid="checkout-line">
            <span className="checkout-line__name">{line.product.name}</span>
            <span className="checkout-line__qty" data-testid="checkout-line-qty">
              x{line.quantity}
            </span>
            <span className="checkout-line__subtotal" data-testid="checkout-line-subtotal">
              {formatPrice(line.quantity * line.product.price)}
            </span>
          </li>
        ))}
      </ul>
      <div className="checkout-summary">
        <p data-testid="checkout-summary-count">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
        <p className="checkout-summary__total" data-testid="checkout-total">
          Order total: {formatPrice(total)}
        </p>
      </div>
      <p className="checkout-note">
        This is a demo store. No payment will be processed.
      </p>
      <div className="checkout-actions">
        <button type="button" className="link-button" data-testid="back-to-cart" onClick={goToCart}>
          Back to cart
        </button>
        <button type="button" className="primary-action" data-testid="place-order" onClick={goToCatalog}>
          Buy Now
        </button>
      </div>
    </section>
  );
}
