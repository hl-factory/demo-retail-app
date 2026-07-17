import { useEffect, useState, type KeyboardEvent } from 'react';
import type { CartLine } from '../types';

interface CartLineQtyProps {
  line: CartLine;
  onSetQuantity: (productId: string, quantity: number) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

/**
 * Quantity stepper for a cart line.
 *
 * The numeric input keeps a local *draft* string so the user can momentarily
 * clear the field (e.g. to type a replacement) without the line being
 * removed. A commit (clamp to `[1, stock]` and propagate) happens only on a
 * valid numeric entry or on blur:
 *  - clearing the field -> the draft shows empty but the line is preserved;
 *    blur restores the last committed quantity.
 *  - typing a valid integer >= 1 -> commits immediately, clamped to stock.
 *  - typing 0 / negative / non-numeric -> kept as draft only; blur restores.
 *
 * External quantity changes (the +/- steppers, re-add consolidation) sync the
 * draft back to the committed value via the `line.quantity` effect.
 */
export function CartLineQty({ line, onSetQuantity, onIncrement, onDecrement }: CartLineQtyProps) {
  const [draft, setDraft] = useState<string>(String(line.quantity));
  const atStockMax = line.quantity >= line.product.stock;

  // Keep the draft in sync when the committed quantity changes externally
  // (stepper buttons, consolidation, persistence rehydrate).
  useEffect(() => {
    setDraft(String(line.quantity));
  }, [line.quantity]);

  function commitIfValid(raw: string): void {
    const trimmed = raw.trim();
    if (trimmed === '') return; // empty draft: preserve the line, do nothing
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 1) return; // 0/negative/NaN: preserve, no commit
    const clamped = Math.max(1, Math.min(Math.trunc(n), line.product.stock));
    setDraft(String(clamped));
    if (clamped !== line.quantity) {
      onSetQuantity(line.product.id, clamped);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value;
    // Always reflect what the user typed in the draft first...
    setDraft(raw);
    // ...then commit only if it is a valid positive numeric entry.
    commitIfValid(raw);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>): void {
    // Read the live DOM value from the event target rather than the `draft`
    // closure state. The closure can be stale when blur fires in the same tick
    // as the preceding change (React batches the state update), so the DOM is
    // the source of truth for what the user actually sees at blur time.
    const raw = e.target.value;
    const trimmed = raw.trim();
    if (trimmed === '' || !Number.isFinite(Number(trimmed)) || Number(trimmed) < 1) {
      // Restore the last committed quantity — never remove the line on blur.
      setDraft(String(line.quantity));
    }
  }

  return (
    <div className="cart-line__qty" data-testid="cart-line-qty-group">
      <button
        type="button"
        className="qty-step"
        data-testid="cart-line-dec"
        aria-label={`Decrease ${line.product.name} quantity`}
        onClick={() => onDecrement(line.product.id)}
      >
        &minus;
      </button>
      <input
        id={`qty-${line.product.id}`}
        type="number"
        min={1}
        max={line.product.stock}
        value={draft}
        data-testid="cart-line-qty"
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="numeric"
      />
      <button
        type="button"
        className="qty-step"
        data-testid="cart-line-inc"
        aria-label={`Increase ${line.product.name} quantity`}
        disabled={atStockMax}
        title={atStockMax ? 'Max stock reached' : undefined}
        onClick={() => onIncrement(line.product.id)}
      >
        +
      </button>
      {atStockMax && (
        <span className="cart-line__max-note" data-testid="cart-line-max">
          Max stock
        </span>
      )}
    </div>
  );
}

// Re-export the KeyboardEvent type alias for convenience if needed elsewhere.
export type { KeyboardEvent };
