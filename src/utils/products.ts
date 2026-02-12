import fs from 'node:fs';
import path from 'node:path';

export interface Product {
  id: string;
  shop_slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  size?: string;
  in_stock: boolean;
  quantity?: number;
  image?: string;
  url?: string;
  tags?: string[];
  last_updated: string;
}

let _cache: Product[] | null = null;

export function loadAllProducts(): Product[] {
  if (_cache) return _cache;
  const dataDir = path.resolve('data/products');
  const products: Product[] = [];
  for (const shopDir of fs.readdirSync(dataDir)) {
    const shopPath = path.join(dataDir, shopDir);
    if (!fs.statSync(shopPath).isDirectory()) continue;
    for (const file of fs.readdirSync(shopPath)) {
      if (!file.endsWith('.json')) continue;
      const raw = JSON.parse(fs.readFileSync(path.join(shopPath, file), 'utf-8'));
      products.push(raw as Product);
    }
  }
  products.sort((a, b) => a.name.localeCompare(b.name));
  _cache = products;
  return products;
}

export function getCategories(): string[] {
  return [...new Set(loadAllProducts().map(p => p.category))].sort();
}

export function getBrands(): string[] {
  return [...new Set(loadAllProducts().map(p => p.brand))].sort();
}

export function getShopSlugs(): string[] {
  return [...new Set(loadAllProducts().map(p => p.shop_slug))].sort();
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

/** Group products that share the same brand+name across shops for price comparison */
export function getPriceComparisons(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const key = `${p.brand.toLowerCase()}|${p.name.toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  // Only return groups with >1 shop
  const result = new Map<string, Product[]>();
  for (const [key, items] of groups) {
    const uniqueShops = new Set(items.map(i => i.shop_slug));
    if (uniqueShops.size > 1) result.set(key, items.sort((a, b) => a.price - b.price));
  }
  return result;
}
