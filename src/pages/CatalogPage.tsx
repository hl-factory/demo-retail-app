import { useMemo, useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import type { Category } from '../types';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { useNav } from '../nav/NavContext';

export function CatalogPage() {
  const [selected, setSelected] = useState<Category | 'All'>('All');
  const { goToDetail } = useNav();

  const visible = useMemo(() => {
    const list = selected === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === selected);
    return list;
  }, [selected]);

  return (
    <section className="catalog-page" aria-labelledby="catalog-heading">
      <div className="catalog-page__intro">
        <h1 id="catalog-heading">Shop the collection</h1>
        <p className="catalog-page__count" data-testid="product-count">
          {visible.length} {visible.length === 1 ? 'product' : 'products'}
        </p>
      </div>
      <CategoryFilter selected={selected} onSelect={setSelected} />
      <div className="product-grid" data-testid="product-grid">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} onView={goToDetail} />
        ))}
      </div>
    </section>
  );
}
