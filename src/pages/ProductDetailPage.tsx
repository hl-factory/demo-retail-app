import { getProductById } from '../data/catalog';
import { useNav } from '../nav/NavContext';
import { AddToCartButton } from '../components/AddToCartButton';
import { ProductImage } from '../components/ProductImage';
import { formatPrice } from '../utils/format';

interface ProductDetailPageProps {
  productId: string | null;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { goToCatalog, goToCart } = useNav();
  const product = productId ? getProductById(productId) : undefined;

  if (!product) {
    return (
      <section className="detail-page">
        <p>Product not found.</p>
        <button type="button" className="link-button" onClick={goToCatalog}>
          Back to catalog
        </button>
      </section>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <section className="detail-page" aria-labelledby="detail-heading">
      <button type="button" className="link-button" data-testid="back-to-catalog" onClick={goToCatalog}>
        &larr; Back to catalog
      </button>
      <div className="detail-page__grid">
        <ProductImage product={product} size="detail" />
        <div className="detail-page__info">
          <h1 id="detail-heading" data-testid="detail-name">{product.name}</h1>
          <p className="detail-page__category" data-testid="detail-category">{product.category}</p>
          <p className="detail-page__price" data-testid="detail-price">{formatPrice(product.price)}</p>
          <p
            className={`detail-page__stock${outOfStock ? ' detail-page__stock--out' : ''}`}
            data-testid="detail-stock"
          >
            {outOfStock ? 'Out of stock' : `In stock: ${product.stock}`}
          </p>
          <p className="detail-page__description" data-testid="detail-description">
            {product.description}
          </p>
          <AddToCartButton product={product} className="detail-page__add" />
          <button
            type="button"
            className="link-button detail-page__cart-link"
            data-testid="go-to-cart"
            onClick={goToCart}
          >
            View cart
          </button>
        </div>
      </div>
    </section>
  );
}
