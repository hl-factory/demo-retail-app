import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { PRODUCTS } from './data/catalog';

describe('Retail storefront browsing experience', () => {
  it('renders a pre-populated catalog grid with >= 12 product cards', () => {
    render(<App />);
    const cards = screen.getAllByTestId('product-card');
    expect(cards.length).toBe(PRODUCTS.length);
    expect(cards.length).toBeGreaterThanOrEqual(12);
  });

  it('every product card shows name, price, category, and stock', () => {
    render(<App />);
    const cards = screen.getAllByTestId('product-card');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      // name lives in the card heading
      const name = card.querySelector('.product-card__name');
      expect(name?.textContent).toBeTruthy();
      expect(within(card).getByTestId('product-price').textContent).toMatch(/^\$[\d,]+\.\d{2}$/);
      expect(within(card).getByTestId('product-category').textContent).toBeTruthy();
      const stock = within(card).getByTestId('product-stock');
      expect(stock.textContent).toMatch(/stock/i);
    }
  });

  it('category filtering narrows the grid and All restores it', async () => {
    const user = userEvent.setup();
    render(<App />);
    const fullCount = screen.getAllByTestId('product-card').length;
    expect(fullCount).toBe(PRODUCTS.length);

    // Pick a category that holds fewer than the full set.
    const audioChip = screen.getByTestId('category-chip-audio');
    await user.click(audioChip);
    const audioCount = screen.getAllByTestId('product-card').length;
    const audioExpected = PRODUCTS.filter((p) => p.category === 'Audio').length;
    expect(audioCount).toBe(audioExpected);
    expect(audioCount).toBeLessThan(fullCount);

    // Reset to All.
    await user.click(screen.getByTestId('category-chip-all'));
    expect(screen.getAllByTestId('product-card').length).toBe(fullCount);
  });

  it('product detail is reachable from the catalog and shows full info', async () => {
    const user = userEvent.setup();
    render(<App />);
    const firstCard = screen.getAllByTestId('product-card')[0];
    const firstProduct = PRODUCTS[0];

    await user.click(within(firstCard).getByTestId('view-product'));

    expect(screen.getByTestId('detail-name').textContent).toBe(firstProduct.name);
    expect(screen.getByTestId('detail-price').textContent).toMatch(/^\$[\d,]+\.\d{2}$/);
    expect(screen.getByTestId('detail-category').textContent).toBe(firstProduct.category);
    expect(screen.getByTestId('detail-description').textContent).toBeTruthy();
    expect(screen.getByTestId('detail-stock').textContent).toMatch(/stock/i);
  });

  it('out-of-stock products are visibly distinguished and cannot be added', () => {
    render(<App />);
    const oosProduct = PRODUCTS.find((p) => p.stock === 0)!;
    const card = screen
      .getAllByTestId('product-card')
      .find((c) => c.getAttribute('data-product-id') === oosProduct.id)!;
    expect(card).toBeTruthy();
    expect(card.getAttribute('data-out-of-stock')).toBe('true');
    expect(within(card).getByTestId('product-stock').textContent).toMatch(/out of stock/i);
    const addBtn = within(card).getByTestId('add-to-cart') as HTMLButtonElement;
    expect(addBtn.disabled).toBe(true);
  });

  it('core navigation catalog -> detail -> cart -> checkout works via UI', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add an in-stock product so checkout is non-empty.
    const inStock = PRODUCTS.find((p) => p.stock > 0)!;
    const card = screen
      .getAllByTestId('product-card')
      .find((c) => c.getAttribute('data-product-id') === inStock.id)!;
    await user.click(within(card).getByTestId('add-to-cart'));
    expect(screen.getByTestId('cart-count').textContent).toBe('1');

    // catalog -> detail
    await user.click(within(card).getByTestId('view-product'));
    expect(screen.getByTestId('detail-name')).toBeInTheDocument();

    // detail -> back to catalog
    await user.click(screen.getByTestId('back-to-catalog'));
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();

    // catalog -> cart (via header cart control)
    await user.click(screen.getByTestId('cart-link'));
    expect(screen.getByTestId('cart-lines')).toBeInTheDocument();

    // cart -> checkout
    await user.click(screen.getByTestId('go-to-checkout'));
    expect(screen.getByTestId('checkout-lines')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-total').textContent).toMatch(/\$[\d,]+\.\d{2}$/);

    // checkout -> back to cart
    await user.click(screen.getByTestId('back-to-cart'));
    expect(screen.getByTestId('cart-lines')).toBeInTheDocument();
  });

  it('add-to-cart updates the cart indicator without a page reload', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    const inStock = PRODUCTS.find((p) => p.stock > 0)!;
    const card = screen
      .getAllByTestId('product-card')
      .find((c) => c.getAttribute('data-product-id') === inStock.id)!;
    await user.click(within(card).getByTestId('add-to-cart'));
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
  });
});
