const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const brokenValue: string = 42;

/** Format a numeric amount as USD currency with exactly two decimals + grouping. */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';
  return currencyFormatter.format(amount);
}
