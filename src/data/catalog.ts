import type { Category, Product } from '../types';

/**
 * DETERMINISTIC seed catalog.
 * No random/Date.now-based values. The order, ids, prices, stock, and categories
 * are fixed at module-load time and identical across reloads.
 */
export const CATEGORIES: Category[] = [
  'Audio',
  'Electronics',
  'Wearables',
  'Home',
  'Accessories',
];

export const PRODUCTS: Product[] = [
  {
    id: 'aurora-headphones',
    name: 'Aurora Wireless Headphones',
    price: 149.99,
    category: 'Audio',
    stock: 24,
    description:
      'Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cups for all-day comfort.',
    accent: '#5b6cff',
  },
  {
    id: 'nimbus-speaker',
    name: 'Nimbus Bluetooth Speaker',
    price: 79.99,
    category: 'Audio',
    stock: 0,
    description:
      'Compact waterproof Bluetooth speaker with 360-degree sound, 12-hour playback, and a rugged exterior built for the outdoors.',
    accent: '#2bb673',
  },
  {
    id: 'pulse-earbuds',
    name: 'Pulse Sport Earbuds',
    price: 59.99,
    category: 'Audio',
    stock: 40,
    description:
      'Sweat-resistant in-ear sport earbuds with secure-fit hooks, touch controls, and a charging case that delivers 24 hours of total playtime.',
    accent: '#e07b39',
  },
  {
    id: 'meridian-monitor',
    name: 'Meridian 4K Monitor',
    price: 329.0,
    category: 'Electronics',
    stock: 12,
    description:
      '27-inch 4K UHD IPS monitor with 99% sRGB color accuracy, HDR support, and a USB-C hub for a single-cable workstation setup.',
    accent: '#3a7bd5',
  },
  {
    id: 'comet-keyboard',
    name: 'Comet Mechanical Keyboard',
    price: 119.99,
    category: 'Electronics',
    stock: 18,
    description:
      'Hot-swappable 75% mechanical keyboard with tactile switches, PBT keycaps, and customizable per-key RGB backlighting.',
    accent: '#8e44ad',
  },
  {
    id: 'quasar-mouse',
    name: 'Quasar Wireless Mouse',
    price: 39.99,
    category: 'Electronics',
    stock: 55,
    description:
      'Ergonomic 2.4GHz wireless mouse with a 4000 DPI sensor, six programmable buttons, and up to 18 months of battery on a single AA.',
    accent: '#16a085',
  },
  {
    id: 'helix-stand',
    name: 'Helix Laptop Stand',
    price: 49.0,
    category: 'Accessories',
    stock: 30,
    description:
      'Aluminum laptop stand that elevates your screen to eye level, improves airflow for cooling, and folds flat for travel.',
    accent: '#c0392b',
  },
  {
    id: 'lumen-lamp',
    name: 'Lumen Desk Lamp',
    price: 34.99,
    category: 'Home',
    stock: 22,
    description:
      'LED desk lamp with three color temperatures, five brightness levels, and a built-in USB port to charge your phone.',
    accent: '#f1c40f',
  },
  {
    id: 'atlas-watch',
    name: 'Atlas Smart Watch',
    price: 199.99,
    category: 'Wearables',
    stock: 15,
    description:
      'GPS smartwatch with heart-rate and SpO2 tracking, sleep analysis, 7-day battery life, and 5 ATM water resistance.',
    accent: '#2980b9',
  },
  {
    id: 'terra-band',
    name: 'Terra Fitness Band',
    price: 89.99,
    category: 'Wearables',
    stock: 0,
    description:
      'Lightweight fitness band with all-day activity tracking, 14-day battery, and a bright AMOLED touchscreen display.',
    accent: '#27ae60',
  },
  {
    id: 'cove-mug',
    name: 'Cove Ceramic Mug',
    price: 14.99,
    category: 'Home',
    stock: 100,
    description:
      '12oz double-walled ceramic mug that keeps drinks hot for longer and stays cool to the touch. Dishwasher safe.',
    accent: '#d35400',
  },
  {
    id: 'drift-hub',
    name: 'Drift USB-C Hub',
    price: 44.99,
    category: 'Accessories',
    stock: 27,
    description:
      '7-in-1 USB-C hub with 4K HDMI, 100W power delivery passthrough, gigabit Ethernet, and three USB-A 3.0 ports.',
    accent: '#34495e',
  },
  {
    id: 'solstice-powerbank',
    name: 'Solstice Power Bank',
    price: 29.99,
    category: 'Accessories',
    stock: 0,
    description:
      '10,000 mAh portable power bank with 18W fast charging, dual USB outputs, and a slim design that fits in any pocket.',
    accent: '#f39c12',
  },
  {
    id: 'vertex-webcam',
    name: 'Vertex Webcam',
    price: 89.0,
    category: 'Electronics',
    stock: 9,
    description:
      '1080p 60fps webcam with auto-focus, low-light correction, a privacy shutter, and a magnetic mount for any monitor.',
    accent: '#7f8c8d',
  },
];

export const ALL_PRODUCTS: readonly Product[] = PRODUCTS;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
