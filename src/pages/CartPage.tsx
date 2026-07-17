import { useCart } from '../cart/CartContext';
import { CartLineQty } from '../cart/CartLineQty';
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
              <CartLineQty
                line={line}
                onSetQuantity={setQuantity}
                onIncrement={increment}
                onDecrement={decrement}
              />
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
