import { describe, expect, it } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats a whole-dollar amount with two decimals and a currency symbol', () => {
    expect(formatPrice(49)).toBe('$49.00');
  });

  it('formats a fractional amount with two decimals', () => {
    expect(formatPrice(149.99)).toBe('$149.99');
  });

  it('adds a thousands separator for amounts >= 1000', () => {
    expect(formatPrice(1299)).toBe('$1,299.00');
    expect(formatPrice(3290)).toBe('$3,290.00');
  });

  it('handles zero gracefully', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles non-finite values without NaN in output', () => {
    expect(formatPrice(Number.NaN)).toBe('$0.00');
  });
});
