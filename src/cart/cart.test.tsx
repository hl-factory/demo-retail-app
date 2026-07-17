import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { PRODUCTS, getProductById } from '../data/catalog';
import { formatPrice } from '../utils/format';
import { CART_STORAGE_KEY } from './storage';

/**
 * Helpers for working with a specific product's card in the catalog grid.
 */
function cardFor(productId: string): HTMLElement {
  const card = screen
    .getAllByTestId('product-card')
    .find((c) => c.getAttribute('data-product-id') === productId);
  if (!card) throw new Error(`No product card rendered for ${productId}`);
  return card;
}

function inStockProduct(): (typeof PRODUCTS)[number] {
  const p = PRODUCTS.find((p) => p.stock >= 2);
  if (!p) throw new Error('No product with stock >= 2 in seed catalog');
  return p;
}

/** Add a product to the cart N times via its catalog card. */
async function addViaCatalog(user: ReturnType<typeof userEvent.setup>, productId: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await user.click(within(cardFor(productId)).getByTestId('add-to-cart'));
  }
}

/** Navigate to the cart view via the header cart control. */
async function openCart(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('cart-link'));
}

function lineFor(productId: string): HTMLElement {
  const line = screen
    .getAllByTestId('cart-line')
    .find((l) => l.getAttribute('data-product-id') === productId);
  if (!line) throw new Error(`No cart line rendered for ${productId}`);
  return line;
}

/** Read a displayed currency string into a number for arithmetic checks. */
function parseCurrency(text: string): number {
  // Strip everything except digits, the decimal point, and a leading minus.
  const cleaned = text.replace(/[^0-9.-]/g, '');
  return Number(cleaned);
}

describe('cart + checkout', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('VAL-RETAIL-005: themeable primary Add-to-cart button', () => {
    it('renders an Add to cart button with a stable selector on each in-stock card', () => {
      render(<App />);
      const inStock = PRODUCTS.filter((p) => p.stock > 0);
      const buttons = screen.getAllByTestId('add-to-cart');
      // One per product card; out-of-stock ones are disabled but still present.
      expect(buttons.length).toBe(PRODUCTS.length);
      for (const btn of buttons) {
        expect(btn.tagName).toBe('BUTTON');
        expect(btn.textContent).toBe('Loop One Buy');
      }
      // In-stock buttons are enabled and carry the primary-action class.
      const inStockBtn = within(cardFor(inStock[0].id)).getByTestId('add-to-cart') as HTMLButtonElement;
      expect(inStockBtn.disabled).toBe(false);
      expect(inStockBtn.className).toContain('primary-action');
    });

    it('out-of-stock Add to cart button is disabled', () => {
      render(<App />);
      const oos = PRODUCTS.find((p) => p.stock === 0)!;
      const btn = within(cardFor(oos.id)).getByTestId('add-to-cart') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('VAL-RETAIL-006: adding updates the cart indicator', () => {
    it('increments the cart count from 0 to 1 after one add (no reload)', async () => {
      const user = userEvent.setup();
      render(<App />);
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      expect(screen.getByTestId('cart-count').textContent).toBe('1');
    });
  });

  describe('VAL-RETAIL-007: cart lists items with per-line and total pricing', () => {
    it('shows two items with unit prices, subtotals, and a correct grand total', async () => {
      const user = userEvent.setup();
      render(<App />);
      const [a, b] = PRODUCTS.filter((p) => p.stock > 0);
      await addViaCatalog(user, a.id);
      await addViaCatalog(user, b.id);
      await openCart(user);

      const lineA = lineFor(a.id);
      const lineB = lineFor(b.id);
      expect(within(lineA).getByTestId('cart-line-subtotal').textContent).toBe(formatPrice(a.price));
      expect(within(lineB).getByTestId('cart-line-subtotal').textContent).toBe(formatPrice(b.price));
      const expectedTotal = formatPrice(a.price + b.price);
      expect(screen.getByTestId('cart-total').textContent).toBe(`Total: ${expectedTotal}`);
    });
  });

  describe('VAL-RETAIL-008: increasing quantity recomputes line + cart totals', () => {
    it('clicking + updates the line subtotal and grand total to unitPrice * qty', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      await openCart(user);

      const line = lineFor(p.id);
      const beforeSubtotal = within(line).getByTestId('cart-line-subtotal').textContent;
      const beforeTotal = screen.getByTestId('cart-total').textContent;
      expect(beforeSubtotal).toBe(formatPrice(p.price));

      await user.click(within(line).getByTestId('cart-line-inc'));

      expect(within(line).getByTestId('cart-line-subtotal').textContent).toBe(formatPrice(p.price * 2));
      expect(screen.getByTestId('cart-total').textContent).toBe(`Total: ${formatPrice(p.price * 2)}`);
      expect(screen.getByTestId('cart-total').textContent).not.toBe(beforeTotal);
    });
  });

  describe('VAL-RETAIL-009: decreasing qty + removing an item', () => {
    it('decreasing quantity lowers the line subtotal and grand total', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      // Start at qty 2.
      await addViaCatalog(user, p.id, 2);
      await openCart(user);

      const line = lineFor(p.id);
      expect(within(line).getByTestId('cart-line-qty')).toHaveValue(2);
      expect(screen.getByTestId('cart-total').textContent).toBe(`Total: ${formatPrice(p.price * 2)}`);

      await user.click(within(line).getByTestId('cart-line-dec'));

      expect(within(line).getByTestId('cart-line-qty')).toHaveValue(1);
      expect(within(line).getByTestId('cart-line-subtotal').textContent).toBe(formatPrice(p.price));
      expect(screen.getByTestId('cart-total').textContent).toBe(`Total: ${formatPrice(p.price)}`);
    });

    it('removing a line deletes it and drops the total by its subtotal', async () => {
      const user = userEvent.setup();
      render(<App />);
      const [a, b] = PRODUCTS.filter((p) => p.stock > 0);
      await addViaCatalog(user, a.id);
      await addViaCatalog(user, b.id);
      await openCart(user);

      const totalBefore = parseCurrency(screen.getByTestId('cart-total').textContent!);
      const lineASubtotal = parseCurrency(within(lineFor(a.id)).getByTestId('cart-line-subtotal').textContent!);

      await user.click(within(lineFor(a.id)).getByTestId('cart-line-remove'));

      expect(screen.queryAllByTestId('cart-line').length).toBe(1);
      expect(screen.getByTestId('cart-total').textContent).toBe(
        `Total: ${formatPrice(totalBefore - lineASubtotal)}`,
      );
    });
  });

  describe('VAL-RETAIL-010: removing the last item returns empty state', () => {
    it('shows the empty-cart state with no NaN total after removing the last line', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      await openCart(user);

      await user.click(within(lineFor(p.id)).getByTestId('cart-line-remove'));

      expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
      expect(screen.queryAllByTestId('cart-line').length).toBe(0);
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
    });

    it('decrementing to 0 also returns the empty state', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      await openCart(user);

      await user.click(within(lineFor(p.id)).getByTestId('cart-line-dec'));

      expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    });
  });

  describe('VAL-RETAIL-011: checkout summary reflects cart contents and total', () => {
    it('checkout line items and total match the cart exactly', async () => {
      const user = userEvent.setup();
      render(<App />);
      const [a, b] = PRODUCTS.filter((p) => p.stock > 0);
      await addViaCatalog(user, a.id);
      await addViaCatalog(user, b.id, 2);
      await openCart(user);

      const cartTotalText = screen.getByTestId('cart-total').textContent!;
      await user.click(screen.getByTestId('go-to-checkout'));

      const checkoutLines = screen.getAllByTestId('checkout-line');
      expect(checkoutLines.length).toBe(2);
      // Verify each checkout line mirrors the cart line.
      const checkoutA = checkoutLines.find((l) => l.textContent?.includes(a.name))!;
      const checkoutB = checkoutLines.find((l) => l.textContent?.includes(b.name))!;
      expect(within(checkoutA).getByTestId('checkout-line-qty').textContent).toBe('x1');
      expect(within(checkoutB).getByTestId('checkout-line-qty').textContent).toBe('x2');
      expect(within(checkoutA).getByTestId('checkout-line-subtotal').textContent).toBe(formatPrice(a.price));
      expect(within(checkoutB).getByTestId('checkout-line-subtotal').textContent).toBe(formatPrice(b.price * 2));
      // Order total equals the cart total.
      expect(screen.getByTestId('checkout-total').textContent).toBe(
        `Order total: ${cartTotalText.replace('Total: ', '')}`,
      );
    });
  });

  describe('VAL-RETAIL-017: cart persists across in-session navigation', () => {
    it('items remain after navigating catalog -> detail -> catalog -> cart', async () => {
      const user = userEvent.setup();
      render(<App />);
      const [a, b] = PRODUCTS.filter((p) => p.stock > 0);
      await addViaCatalog(user, a.id);
      await addViaCatalog(user, b.id);
      await openCart(user);
      const totalBefore = screen.getByTestId('cart-total').textContent;

      // Navigate away via UI.
      await user.click(screen.getByTestId('brand-home'));
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      // Into a product detail.
      await user.click(within(cardFor(a.id)).getByTestId('view-product'));
      expect(screen.getByTestId('detail-name')).toBeInTheDocument();
      // Back to catalog.
      await user.click(screen.getByTestId('back-to-catalog'));
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      // Reopen cart.
      await openCart(user);

      expect(screen.getAllByTestId('cart-line').length).toBe(2);
      expect(screen.getByTestId('cart-total').textContent).toBe(totalBefore);
    });
  });

  describe('VAL-RETAIL-018: re-adding the same product consolidates into one line', () => {
    it('two adds of the same product yield a single line with qty 2', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id, 2);
      await openCart(user);

      const lines = screen.getAllByTestId('cart-line');
      expect(lines.length).toBe(1);
      expect(lines[0].getAttribute('data-product-id')).toBe(p.id);
      expect(within(lines[0]).getByTestId('cart-line-qty')).toHaveValue(2);
      expect(within(lines[0]).getByTestId('cart-line-subtotal').textContent).toBe(formatPrice(p.price * 2));
      expect(screen.getByTestId('cart-count').textContent).toBe('2');
    });
  });

  describe('VAL-RETAIL-019: cart quantity cannot exceed available stock', () => {
    it('repeated adds cap at product stock and never exceed it', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      // Try to add more than stock.
      await addViaCatalog(user, p.id, p.stock + 5);
      expect(screen.getByTestId('cart-count').textContent).toBe(String(p.stock));
      await openCart(user);
      expect(within(lineFor(p.id)).getByTestId('cart-line-qty')).toHaveValue(p.stock);
    });

    it('the + stepper is disabled at stock max and shows a max note', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id, p.stock);
      await openCart(user);
      const line = lineFor(p.id);
      const inc = within(line).getByTestId('cart-line-inc') as HTMLButtonElement;
      expect(inc.disabled).toBe(true);
      expect(within(line).getByTestId('cart-line-max').textContent).toMatch(/max/i);
      // Clicking a disabled + should not change anything.
      await user.click(inc);
      expect(within(line).getByTestId('cart-line-qty')).toHaveValue(p.stock);
    });

    it('typing a quantity above stock in the input clamps to stock', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      await openCart(user);
      const input = within(lineFor(p.id)).getByTestId('cart-line-qty') as HTMLInputElement;
      // Use fireEvent.change to set a value above stock in one shot (clearing
      // the input would momentarily set qty to 0 and remove the line).
      fireEvent.change(input, { target: { value: String(p.stock + 99) } });
      // After change, the value is clamped to stock.
      expect(input).toHaveValue(p.stock);
    });
  });

  describe('VAL-RETAIL-020: consistent two-decimal, thousands-separated currency formatting', () => {
    it('builds a cart total >= 1000 rendered with two decimals and a thousands separator', async () => {
      const user = userEvent.setup();
      render(<App />);
      // Meridian monitor @ 329 * 4 = 1316 (stock 12) -> over 1000.
      const monitor = getProductById('meridian-monitor')!;
      await addViaCatalog(user, monitor.id, 4);
      await openCart(user);

      const totalText = screen.getByTestId('cart-total').textContent!;
      expect(totalText).toMatch(/^Total: \$[\d,]+\.\d{2}$/);
      const numeric = parseCurrency(totalText);
      expect(numeric).toBe(329 * 4);
      expect(numeric).toBeGreaterThanOrEqual(1000);
      // Line subtotal also formatted.
      const subtotalText = within(lineFor(monitor.id)).getByTestId('cart-line-subtotal').textContent!;
      expect(subtotalText).toMatch(/^\$[\d,]+\.\d{2}$/);

      // Checkout formatting matches.
      await user.click(screen.getByTestId('go-to-checkout'));
      const checkoutTotalText = screen.getByTestId('checkout-total').textContent!;
      expect(checkoutTotalText).toMatch(/^Order total: \$[\d,]+\.\d{2}$/);
    });
  });

  describe('session persistence via sessionStorage', () => {
    it('cart survives a simulated reload (re-mount) within the session', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id, 2);
      // Storage should now contain the serialized cart.
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([{ productId: p.id, quantity: 2 }]);

      // Simulate a reload by unmounting and re-rendering.
      unmount();
      render(<App />);
      // Cart indicator reflects persisted state without any add.
      expect(screen.getByTestId('cart-count').textContent).toBe('2');
      await openCart(user);
      expect(screen.getAllByTestId('cart-line').length).toBe(1);
      expect(within(lineFor(p.id)).getByTestId('cart-line-qty')).toHaveValue(2);
    });

    it('stale persisted entries for removed seed products are dropped on rehydrate', () => {
      sessionStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([
          { productId: 'aurora-headphones', quantity: 3 },
          { productId: 'this-product-no-longer-exists', quantity: 5 },
        ]),
      );
      render(<App />);
      expect(screen.getByTestId('cart-count').textContent).toBe('3');
    });

    it('clearCart empties both the in-memory cart and the session storage', async () => {
      const user = userEvent.setup();
      render(<App />);
      const p = inStockProduct();
      await addViaCatalog(user, p.id);
      await openCart(user);
      expect(sessionStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();
      await user.click(screen.getByTestId('clear-cart'));
      expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
      // Storage should hold an empty cart (rehydrates to empty).
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      expect(stored === null || stored === '[]').toBe(true);
    });

    it('corrupt storage does not crash and starts empty', () => {
      sessionStorage.setItem(CART_STORAGE_KEY, '{not valid json');
      render(<App />);
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
    });
  });

  describe('clear cart action', () => {
    it('Clear cart button empties the cart and shows the empty state', async () => {
      const user = userEvent.setup();
      render(<App />);
      const [a, b] = PRODUCTS.filter((p) => p.stock > 0);
      await addViaCatalog(user, a.id);
      await addViaCatalog(user, b.id);
      await openCart(user);
      await user.click(screen.getByTestId('clear-cart'));
      expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
    });
  });

  describe('quantity input draft — clearing the field does NOT remove the line', () => {
    it('preserves the line while the field is momentarily empty, then restores on blur', () => {
      render(<App />);
      const p = inStockProduct();
      // Add the product twice so the line has a non-trivial quantity.
      fireEvent.click(within(cardFor(p.id)).getByTestId('add-to-cart'));
      fireEvent.click(within(cardFor(p.id)).getByTestId('add-to-cart'));
      // Navigate to the cart (avoid pending user-event timers).
      fireEvent.click(screen.getByTestId('cart-link'));

      const input = within(lineFor(p.id)).getByTestId('cart-line-qty') as HTMLInputElement;
      expect(input).toHaveValue(2);
      expect(screen.getByTestId('cart-count').textContent).toBe('2');

      // Simulate the user selecting-all and clearing the field to type a
      // replacement value. This must NOT delete the line.
      fireEvent.change(input, { target: { value: '' } });

      // The line is still present and the cart count is unchanged.
      expect(screen.getAllByTestId('cart-line').length).toBe(1);
      expect(screen.getByTestId('cart-count').textContent).toBe('2');

      // Blurring the empty field restores the committed quantity (no removal).
      fireEvent.blur(input);
      expect(input).toHaveValue(2);
      expect(screen.getAllByTestId('cart-line').length).toBe(1);
      expect(screen.getByTestId('cart-count').textContent).toBe('2');
    });

    it('typing a valid replacement into a cleared field commits the new quantity', () => {
      render(<App />);
      const p = PRODUCTS.find((prod) => prod.stock >= 5)!;
      fireEvent.click(within(cardFor(p.id)).getByTestId('add-to-cart'));
      fireEvent.click(screen.getByTestId('cart-link'));
      const input = within(lineFor(p.id)).getByTestId('cart-line-qty') as HTMLInputElement;
      expect(input).toHaveValue(1);

      // Clear, then type a valid replacement (within stock).
      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getAllByTestId('cart-line').length).toBe(1);
      fireEvent.change(input, { target: { value: '4' } });

      // The new quantity is committed immediately (valid numeric entry).
      expect(input).toHaveValue(4);
      expect(screen.getByTestId('cart-count').textContent).toBe('4');
      expect(within(lineFor(p.id)).getByTestId('cart-line-subtotal').textContent).toBe(
        formatPrice(p.price * 4),
      );
    });
  });
});
