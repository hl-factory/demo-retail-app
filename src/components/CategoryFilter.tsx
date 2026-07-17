import type { Category } from '../types';
import { CATEGORIES } from '../data/catalog';

interface CategoryFilterProps {
  selected: Category | 'All';
  onSelect: (category: Category | 'All') => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const options: (Category | 'All')[] = ['All', ...CATEGORIES];
  return (
    <div className="category-filter" role="tablist" aria-label="Filter products by category" data-testid="category-filter">
      {options.map((option) => {
        const active = option === selected;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`category-chip-${option.toLowerCase()}`}
            className={`category-chip${active ? ' category-chip--active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
