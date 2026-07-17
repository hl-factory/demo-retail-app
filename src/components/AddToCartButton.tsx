import { useCart } from '../cart/CartContext';
import type { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
  /** Optional label override (demo-editable target). */
  label?: string;
  className?: string;
}

/**
 * The themeable primary call-to-action.
 * Stable selector: data-testid="add-to-cart".
 * The `.primary-action` class + CSS variable `--primary-action` make a recolor
 * demo a single-line edit.
 */
export function AddToCartButton({ product, label = 'Loop Two Buy', className }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const disabled = product.stock <= 0;

  return (
    <button
      type="button"
      data-testid="add-to-cart"
      data-product-id={product.id}
      className={`primary-action${disabled ? ' primary-action--disabled' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={() => addToCart(product)}
      aria-label={`Add ${product.name} to cart`}
    >
      {label}
    </button>
  );
}
