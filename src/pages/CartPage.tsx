import { useCart } from '../cart/CartContext';
import { useNav } from '../nav/NavContext';
import { formatPrice } from '../utils/format';

export function CartPage() {
  const { lines, total, removeLine, setQuantity, increment, decrement, clearCart, count } = useCart();
  const { goToCatalog, goToCheckout } = useNav();

  if (lines.length === 0) {
    return (
      <section className="cart-page" aria-labelledby="cart-heading">
        <h1 id="cart-heading">Your cart</h1>
        <p className="cart-empty" data-testid="cart-empty">
          Your cart is empty.
        </p>
        <button type="button" className="primary-action" data-testid="continue-shopping" onClick={goToCatalog}>
          Continue shopping
        </button>
      </section>
    );
  }

  return (
    <section className="cart-page" aria-labelledby="cart-heading">
      <h1 id="cart-heading">Your cart</h1>
      <ul className="cart-lines" data-testid="cart-lines">
        {lines.map((line) => {
          const atStockMax = line.quantity >= line.product.stock;
          return (
            <li
              key={line.product.id}
              className="cart-line"
              data-testid="cart-line"
              data-product-id={line.product.id}
            >
              <div className="cart-line__info">
                <p className="cart-line__name">{line.product.name}</p>
                <p className="cart-line__unit">{formatPrice(line.product.price)} each</p>
              </div>
              <div className="cart-line__qty" data-testid="cart-line-qty-group">
                <button
                  type="button"
                  className="qty-step"
                  data-testid="cart-line-dec"
                  aria-label={`Decrease ${line.product.name} quantity`}
                  onClick={() => decrement(line.product.id)}
                >
                  &minus;
                </button>
                <input
                  id={`qty-${line.product.id}`}
                  type="number"
                  min={1}
                  max={line.product.stock}
                  value={line.quantity}
                  data-testid="cart-line-qty"
                  onChange={(e) => setQuantity(line.product.id, Number(e.target.value))}
                />
                <button
                  type="button"
                  className="qty-step"
                  data-testid="cart-line-inc"
                  aria-label={`Increase ${line.product.name} quantity`}
                  disabled={atStockMax}
                  title={atStockMax ? 'Max stock reached' : undefined}
                  onClick={() => increment(line.product.id)}
                >
                  +
                </button>
                {atStockMax && (
                  <span className="cart-line__max-note" data-testid="cart-line-max">
                    Max stock
                  </span>
                )}
              </div>
              <p className="cart-line__subtotal" data-testid="cart-line-subtotal">
                {formatPrice(line.quantity * line.product.price)}
              </p>
              <button
                type="button"
                className="link-button cart-line__remove"
                data-testid="cart-line-remove"
                onClick={() => removeLine(line.product.id)}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <div className="cart-summary">
        <p className="cart-summary__count" data-testid="cart-summary-count">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
        <p className="cart-summary__total" data-testid="cart-total">
          Total: {formatPrice(total)}
        </p>
      </div>
      <div className="cart-actions">
        <button type="button" className="link-button" onClick={goToCatalog} data-testid="continue-shopping-link">
          Continue shopping
        </button>
        <button type="button" className="primary-action" data-testid="go-to-checkout" onClick={goToCheckout}>
          Proceed to checkout
        </button>
        <button type="button" className="link-button" data-testid="clear-cart" onClick={clearCart}>
          Clear cart
        </button>
      </div>
    </section>
  );
}
