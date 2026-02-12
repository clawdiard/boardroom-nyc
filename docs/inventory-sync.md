# Inventory Sync

Automated Shopify & Square POS inventory synchronization via GitHub Actions.

## How It Works

1. A scheduled GitHub Action runs every 6 hours
2. For each shop with `pos_api_enabled: true`, it calls the appropriate POS API
3. Products are transformed into our JSON schema and written to `data/products/<shop-slug>/`
4. Products removed from the POS are marked `in_stock: false`
5. Changes are auto-committed

## Setup for a New Shop

1. Set `pos_system` (`"shopify"` or `"square"`) and `pos_api_enabled: true` in the shop JSON
2. Add the API token as a GitHub repo secret:
   - Shopify: `SHOPIFY_KEY_<SLUG>` (storefront access token)
   - Square: `SQUARE_TOKEN_<SLUG>` (OAuth access token)
   - Slug format: uppercase, dashes → underscores (e.g., `labor-skateshop` → `LABOR_SKATESHOP`)
3. The next scheduled run (or manual dispatch) will sync

## Manual Trigger

Go to Actions → "Inventory Sync" → Run workflow. Optionally provide a shop slug to sync just one shop.

## Local Testing

```bash
SQUARE_TOKEN_LABOR_SKATESHOP=tok_xxx node scripts/inventory-sync.js labor-skateshop
```
