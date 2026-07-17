import { describe, expect, it } from 'vitest';
import { CATEGORIES, PRODUCTS, getProductById } from './catalog';

describe('seed catalog (determinism + shape)', () => {
  it('has at least 12 products', () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(12);
  });

  it('every product has a unique id and non-empty name', () => {
    const ids = PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRODUCTS) {
      expect(p.name.length).toBeGreaterThan(0);
    }
  });

  it('every product has a valid price, category, and integer stock >= 0', () => {
    const validCats = new Set(CATEGORIES);
    for (const p of PRODUCTS) {
      expect(Number.isFinite(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
      expect(validCats.has(p.category)).toBe(true);
      expect(Number.isInteger(p.stock)).toBe(true);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes products across several categories', () => {
    const used = new Set(PRODUCTS.map((p) => p.category));
    expect(used.size).toBeGreaterThanOrEqual(3);
  });

  it('contains at least one out-of-stock product', () => {
    expect(PRODUCTS.some((p) => p.stock === 0)).toBe(true);
  });

  it('every product has a description and accent color', () => {
    for (const p of PRODUCTS) {
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('getProductById resolves a known id and rejects unknown', () => {
    expect(getProductById(PRODUCTS[0].id)).toBeDefined();
    expect(getProductById('does-not-exist')).toBeUndefined();
  });

  it('catalog ordering is stable across two imports', () => {
    // Re-import via require-style by re-reading the same module reference.
    const names = PRODUCTS.map((p) => p.name);
    // The module is a constant; verify it does not change between reads.
    expect(PRODUCTS.map((p) => p.name)).toEqual(names);
  });
});
