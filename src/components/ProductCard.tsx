import type { Product } from '../types';
import { formatPrice } from '../utils/format';
import { AddToCartButton } from './AddToCartButton';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onView: (productId: string) => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <article
      className="product-card"
      data-testid="product-card"
      data-product-id={product.id}
      data-out-of-stock={outOfStock || undefined}
    >
      <button
        type="button"
        className="product-card__view"
        data-testid="view-product"
        onClick={() => onView(product.id)}
        aria-label={`View ${product.name} details`}
      >
        <ProductImage product={product} />
        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__category" data-testid="product-category">
            {product.category}
          </p>
          <p className="product-card__price" data-testid="product-price">
            {formatPrice(product.price)}
          </p>
          <p
            className={`product-card__stock${outOfStock ? ' product-card__stock--out' : ''}`}
            data-testid="product-stock"
          >
            {outOfStock ? 'Out of stock' : `In stock: ${product.stock}`}
          </p>
        </div>
      </button>
      <AddToCartButton product={product} label="Buy now" className="product-card__add" />
    </article>
  );
}
