import type { Product } from '../types';

interface ProductImageProps {
  product: Product;
  size?: 'card' | 'detail';
}

/**
 * Deterministic placeholder imagery derived from the product (no network).
 * Renders a soft gradient using the product's accent color + the product initial.
 */
export function ProductImage({ product, size = 'card' }: ProductImageProps) {
  const initial = product.name.charAt(0).toUpperCase();
  const radius = size === 'detail' ? 16 : 12;
  return (
    <div
      className="product-image"
      role="img"
      aria-label={`${product.name} placeholder image`}
      data-testid="product-image"
      style={{
        background: `linear-gradient(135deg, ${product.accent}, ${product.accent}99)`,
        borderRadius: radius,
      }}
    >
      <span className="product-image__initial">{initial}</span>
    </div>
  );
}
