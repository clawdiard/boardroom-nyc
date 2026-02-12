# Shop Owner Guide — Board Room NYC

Welcome to Board Room NYC! This guide walks you through listing your shop and managing your inventory.

## Getting Started

### Step 1: Onboard Your Shop

1. Go to our GitHub repository: [github.com/clawdiard/boardroom-nyc](https://github.com/clawdiard/boardroom-nyc)
2. Click **Issues** → **New Issue**
3. Select the **"Shop Onboarding"** template
4. Fill out your shop details:
   - **Shop Name** — Your official business name
   - **URL Slug** — A short lowercase identifier (e.g., `my-skate-shop`). Letters, numbers, and hyphens only.
   - **Borough & Neighborhood** — Where you're located
   - **Address & Coordinates** — Your street address + lat/lng (use Google Maps to find coordinates)
   - **Hours** — Format: `monday=12:00-19:00` (one line per day)
   - **Contact info** — Phone, website, Instagram (optional but recommended)
   - **Specialties & Vibes** — Comma-separated tags that describe your shop
5. Submit the issue. Our system will automatically validate and add your shop within minutes.

### Step 2: Add Your Products

1. Go to **Issues** → **New Issue** → **"Product Submission"**
2. Enter your **shop slug** (the one you chose during onboarding)
3. Choose entry mode:

#### Single Product
Fill out the form fields for one product at a time. Required: name, brand, category, price.

#### Bulk Entry (Recommended for Inventory)
Select **bulk** mode and paste a JSON array in the bulk field:

```json
[
  {
    "name": "Classic Logo Deck",
    "brand": "Your Brand",
    "category": "decks",
    "price": 60.00,
    "size": "8.25",
    "in_stock": true,
    "quantity": 10,
    "tags": ["street", "house-brand"]
  },
  {
    "name": "Shop Tee Black",
    "brand": "Your Brand",
    "category": "apparel",
    "price": 30.00,
    "size": "L",
    "in_stock": true,
    "quantity": 25,
    "tags": ["basics"]
  }
]
```

### Categories
Use one of: `decks`, `trucks`, `wheels`, `bearings`, `griptape`, `hardware`, `apparel`, `shoes`, `accessories`, `completes`, `other`

## Updating Your Inventory

To update existing products, submit a new Product Submission issue with the same product names — the system will overwrite the existing files.

To remove products, open a regular issue requesting removal, and we'll handle it.

## How It Works

```
You submit a form (GitHub Issue)
        ↓
Automated validation checks your data
        ↓
Valid? → JSON files committed to repo → Site rebuilds automatically
Invalid? → You get an error message explaining what to fix
```

## Tips

- **Get your coordinates right** — Go to Google Maps, right-click your shop location, and copy the lat/lng
- **Use consistent slugs** — Your shop slug ties everything together. Don't change it.
- **Bulk is faster** — If you have 20+ products, use the JSON bulk entry
- **Photos coming soon** — Image upload support is on our roadmap

## Need Help?

Open a regular GitHub issue or reach out to us. We're here to help NYC skate shops get online.

---

*Board Room NYC — Connecting NYC's skate shop ecosystem*
