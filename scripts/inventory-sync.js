#!/usr/bin/env node
/**
 * Inventory Sync — Shopify & Square → product JSON
 *
 * Usage:
 *   node scripts/inventory-sync.js              # sync all API-enabled shops
 *   node scripts/inventory-sync.js labor-skateshop  # sync one shop
 *
 * Environment variables (per shop):
 *   Shopify: SHOPIFY_KEY_<SLUG>  (storefront access token — slug uppercased, dashes→underscores)
 *   Square:  SQUARE_TOKEN_<SLUG> (OAuth access token)
 *
 * The shop JSON must have pos_system ("shopify"|"square") and pos_api_enabled: true.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SHOPS_DIR = path.join(__dirname, '..', 'data', 'shops');
const PRODUCTS_DIR = path.join(__dirname, '..', 'data', 'products');

// ── helpers ──────────────────────────────────────────────────────────

function envKey(slug, prefix) {
  return `${prefix}_${slug.toUpperCase().replace(/-/g, '_')}`;
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function slugToId(slug, name) {
  return `${slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

// ── Shopify adapter ──────────────────────────────────────────────────

async function syncShopify(shop, token) {
  // Uses Shopify Storefront API (2024-01)
  const domain = new URL(shop.website).hostname;
  const url = `https://${domain}/api/2024-01/graphql.json`;

  const query = `{
    products(first: 100) {
      edges {
        node {
          id title vendor productType tags
          variants(first: 10) {
            edges {
              node {
                id title price availableForSale quantityAvailable
                selectedOptions { name value }
                image { url }
              }
            }
          }
        }
      }
    }
  }`;

  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query }),
  });

  const products = [];
  const now = new Date().toISOString();

  for (const edge of data.data?.products?.edges || []) {
    const p = edge.node;
    for (const v of p.variants?.edges || []) {
      const variant = v.node;
      const size = variant.selectedOptions?.find((o) => o.name === 'Size')?.value || '';
      products.push({
        id: slugToId(shop.slug, `${p.title}${size ? '-' + size : ''}`),
        shop_slug: shop.slug,
        name: size ? `${p.title} - ${size}` : p.title,
        brand: p.vendor || '',
        category: mapCategory(p.productType),
        price: parseFloat(variant.price),
        currency: 'USD',
        size,
        in_stock: variant.availableForSale,
        quantity: variant.quantityAvailable ?? 0,
        image: variant.image?.url || '',
        url: shop.website,
        tags: p.tags || [],
        last_updated: now,
      });
    }
  }
  return products;
}

// ── Square adapter ───────────────────────────────────────────────────

async function syncSquare(shop, token) {
  // Fetch catalog items
  const catalogUrl = 'https://connect.squareup.com/v2/catalog/search';
  const catalog = await fetch(catalogUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Square-Version': '2024-01-18',
    },
    body: JSON.stringify({
      object_types: ['ITEM'],
      limit: 100,
    }),
  });

  const items = catalog.objects || [];
  const variationIds = [];
  for (const item of items) {
    for (const v of item.item_data?.variations || []) {
      variationIds.push(v.id);
    }
  }

  // Fetch inventory counts
  let counts = {};
  if (variationIds.length > 0) {
    const invUrl = 'https://connect.squareup.com/v2/inventory/counts/batch-retrieve';
    const inv = await fetch(invUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({ catalog_object_ids: variationIds.slice(0, 100) }),
    });
    for (const c of inv.counts || []) {
      counts[c.catalog_object_id] = parseInt(c.quantity || '0', 10);
    }
  }

  const products = [];
  const now = new Date().toISOString();

  for (const item of items) {
    const d = item.item_data;
    for (const v of d?.variations || []) {
      const vd = v.item_variation_data;
      const qty = counts[v.id] ?? 0;
      const price = vd?.price_money ? vd.price_money.amount / 100 : 0;
      products.push({
        id: slugToId(shop.slug, `${d.name}${vd?.name && vd.name !== 'Regular' ? '-' + vd.name : ''}`),
        shop_slug: shop.slug,
        name: vd?.name && vd.name !== 'Regular' ? `${d.name} - ${vd.name}` : d.name,
        brand: d.category?.name || '',
        category: mapCategory(d.product_type || d.category?.name || ''),
        price,
        currency: 'USD',
        size: '',
        in_stock: qty > 0,
        quantity: qty,
        image: '',
        url: shop.website,
        tags: [],
        last_updated: now,
      });
    }
  }
  return products;
}

// ── category mapping ─────────────────────────────────────────────────

function mapCategory(raw) {
  const r = (raw || '').toLowerCase();
  if (r.includes('deck')) return 'decks';
  if (r.includes('truck')) return 'trucks';
  if (r.includes('wheel')) return 'wheels';
  if (r.includes('bearing')) return 'bearings';
  if (r.includes('grip')) return 'accessories';
  if (r.includes('apparel') || r.includes('shirt') || r.includes('hoodie')) return 'apparel';
  if (r.includes('shoe') || r.includes('footwear')) return 'footwear';
  if (r.includes('complete')) return 'completes';
  return 'accessories';
}

// ── write products ───────────────────────────────────────────────────

function writeProducts(shopSlug, products) {
  const dir = path.join(PRODUCTS_DIR, shopSlug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Load existing product IDs to detect removals
  const existingFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  const existingIds = new Set(existingFiles.map((f) => f.replace('.json', '')));
  const newIds = new Set(products.map((p) => p.id));

  // Write/update products
  for (const p of products) {
    fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(p, null, 2) + '\n');
  }

  // Mark removed products as out-of-stock
  let staleCount = 0;
  for (const eid of existingIds) {
    if (!newIds.has(eid)) {
      const fp = path.join(dir, `${eid}.json`);
      try {
        const existing = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        if (existing.in_stock) {
          existing.in_stock = false;
          existing.quantity = 0;
          existing.last_updated = new Date().toISOString();
          fs.writeFileSync(fp, JSON.stringify(existing, null, 2) + '\n');
          staleCount++;
        }
      } catch { /* skip corrupt files */ }
    }
  }

  return { synced: products.length, stale: staleCount };
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  const targetSlug = process.argv[2] || null;

  const shopFiles = fs.readdirSync(SHOPS_DIR).filter((f) => f.endsWith('.json'));
  let totalSynced = 0;
  let totalStale = 0;
  let errors = [];

  for (const file of shopFiles) {
    const shop = JSON.parse(fs.readFileSync(path.join(SHOPS_DIR, file), 'utf-8'));

    if (targetSlug && shop.slug !== targetSlug) continue;
    if (!shop.pos_api_enabled) {
      console.log(`⏭ ${shop.slug}: POS API not enabled, skipping`);
      continue;
    }

    const system = shop.pos_system;
    let token;

    if (system === 'shopify') {
      token = process.env[envKey(shop.slug, 'SHOPIFY_KEY')];
    } else if (system === 'square') {
      token = process.env[envKey(shop.slug, 'SQUARE_TOKEN')];
    } else {
      console.log(`⏭ ${shop.slug}: unknown POS system "${system}", skipping`);
      continue;
    }

    if (!token) {
      console.log(`⚠ ${shop.slug}: no API token found (expected ${system === 'shopify' ? envKey(shop.slug, 'SHOPIFY_KEY') : envKey(shop.slug, 'SQUARE_TOKEN')}), skipping`);
      continue;
    }

    try {
      console.log(`🔄 Syncing ${shop.slug} via ${system}...`);
      const products = system === 'shopify'
        ? await syncShopify(shop, token)
        : await syncSquare(shop, token);

      const result = writeProducts(shop.slug, products);
      console.log(`✅ ${shop.slug}: ${result.synced} products synced, ${result.stale} marked stale`);
      totalSynced += result.synced;
      totalStale += result.stale;
    } catch (err) {
      console.error(`❌ ${shop.slug}: ${err.message}`);
      errors.push(`${shop.slug}: ${err.message}`);
    }
  }

  console.log(`\n📊 Total: ${totalSynced} synced, ${totalStale} stale`);
  if (errors.length) {
    console.error(`\n⚠ Errors:\n${errors.join('\n')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
