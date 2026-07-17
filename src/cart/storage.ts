/**
 * Session-scoped persistence helper for the cart.
 *
 * The cart is persisted to `sessionStorage` so it survives full-page reloads
 * within the same browser session (tab) while being isolated per session.
 * `sessionStorage` is gated behind a `typeof` check so it works in jsdom/SSR
 * test environments where it may be undefined.
 */

export const CART_STORAGE_KEY = 'halcyon-cart-v1';

export function loadCart(): unknown {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupt/unavailable storage -> start empty (never throw).
    return null;
  }
}

export function saveCart(data: unknown): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota / unavailable -> ignore; the cart still works in-memory.
  }
}

export function clearStoredCart(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}
