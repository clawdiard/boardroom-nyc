<div align="center">

# 🛹 Board Room NYC

### The Local Skate Shop Marketplace

*Find, compare, and support NYC's independent skate shops — all from one place.*

[![Status](https://img.shields.io/badge/status-PRD%20phase-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Shops](https://img.shields.io/badge/target%20shops-13+-orange)]()

---

</div>

# Board Room NYC — Local Skate Shop Marketplace
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** February 12, 2026  
**Author:** Product Team  
**Status:** Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Market Opportunity](#2-problem-statement--market-opportunity)
3. [Target Users](#3-target-users)
4. [Core Features](#4-core-features)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Model & Content Strategy](#6-data-model--content-strategy)
7. [Revenue Model](#7-revenue-model)
8. [Competitive Landscape](#8-competitive-landscape)
9. [Success Metrics](#9-success-metrics)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Implementation Phases](#11-implementation-phases)

---

## 1. Executive Summary

**Board Room NYC** is a web-based aggregator marketplace for New York City's independent skateboard shops. It lets skaters browse, compare, and reserve products across shops like Labor, KCDC, Homage, Supreme, Uptown Riders, and others — all from a single interface that celebrates local skate culture.

The platform is an **anti-Amazon play**: instead of extracting value from the skate community, it drives foot traffic and online sales to the shops that sustain NYC skate culture. Revenue comes from modest transaction fees and optional shop subscriptions for premium features.

**Critical technical constraint:** The entire platform is built as a **static site hosted on GitHub Pages** — no custom backend, no server-side database. Dynamic features (inventory sync, reservations, user accounts) are achieved through third-party services, GitHub Actions automation, client-side storage, and external APIs on free/low-cost tiers.

---

## 2. Problem Statement & Market Opportunity

### The Problem

**For skaters:**
- NYC has 15–20+ independent skate shops spread across five boroughs. Finding specific decks, trucks, wheels, or apparel means visiting multiple shops or checking scattered websites/Instagram accounts.
- No single place to compare inventory, prices, or availability across local shops.
- Many shops have poor or no e-commerce presence — discovery relies on word-of-mouth and physical visits.
- The alternative is Amazon/Zumiez/CCS, which undercuts local shops and strips away the community connection.

**For shop owners:**
- Small shops can't compete with big e-commerce on SEO, UX, or logistics.
- Building and maintaining an online store is expensive and time-consuming.
- Reaching new customers (tourists, newer skaters, people in other boroughs) is hard.
- No cooperative infrastructure exists for NYC's skate retail community.

### Market Opportunity

- **NYC skate market:** NYC is one of the world's largest skateboarding markets. Conservative estimate: 50,000–100,000 active skaters in the metro area.
- **Average annual spend:** $300–$800/year on hard goods and apparel per active skater.
- **Addressable market:** $15M–$80M annually in NYC alone.
- **Local-first consumer trend:** Post-pandemic, "shop local" sentiment is at historic highs. Consumers actively seek alternatives to Amazon.
- **Skateboarding's cultural moment:** Olympic inclusion, mainstream media coverage, and nostalgia-driven participation growth have expanded the market.

---

## 3. Target Users

### Primary: NYC Skaters (Shoppers)

| Persona | Description | Needs |
|---------|-------------|-------|
| **The Local** | Daily skater, 18–35, knows their shop but wants to find specific products fast | Stock checks, price comparison, new product alerts |
| **The Explorer** | Newer skater or recently moved to NYC, 16–28, discovering the scene | Shop discovery, neighborhood guides, community entry point |
| **The Collector** | Deck art enthusiast, 20–45, hunts limited/collab boards | Drop alerts, exclusive inventory visibility, cross-shop search |
| **The Tourist** | Visiting NYC, wants authentic skate shop experience | Shop maps, curated recommendations, "must-visit" guides |

### Secondary: Shop Owners

| Persona | Description | Needs |
|---------|-------------|-------|
| **The Veteran** | Running a shop for 10+ years, loyal customer base, skeptical of tech | Zero-effort onboarding, tangible foot traffic increase, no platform lock-in |
| **The Hustler** | Newer shop, social-media savvy, hungry for growth | Analytics, broader reach, online reservation/sales channel |

---

## 4. Core Features

### MVP (Phase 1)

| Feature | Description | Static-Site Approach |
|---------|-------------|---------------------|
| **Shop Directory** | All NYC skate shops with profiles: location, hours, vibe, specialties, photos | Markdown/JSON data files in repo, rendered at build time |
| **Interactive Map** | Map view of all shops with filters (borough, specialty, open now) | Mapbox GL JS or Leaflet with GeoJSON (client-side, free tier) |
| **Product Catalog** | Browsable inventory across shops: decks, trucks, wheels, bearings, apparel | JSON data files updated via GitHub Actions; client-side search with Lunr.js or Pagefind |
| **Search & Filter** | Full-text search + filters (shop, category, brand, price range, size) | Client-side search index built at deploy time |
| **Shop Pages** | Rich profiles with photos, story, team riders, Instagram feed embed | Static pages generated from data files |
| **Stock Status** | Basic in-stock/out-of-stock indicators | Data files updated by shops via simple form or GitHub PR |

### Phase 2

| Feature | Description | Static-Site Approach |
|---------|-------------|---------------------|
| **Reserve & Pick Up** | Reserve items for in-store pickup (hold for 24h) | Third-party form (Formspree/Tally) → triggers email to shop + GitHub Action to update status |
| **Price Alerts** | Get notified when a product drops or hits a price point | Email collection via Buttondown/Mailchimp; GitHub Action checks data diffs and sends alerts |
| **Community Board** | Local skate spot guides, session meetups, event calendar | Markdown content in repo; events as JSON; GitHub Discussions for community interaction |
| **Shop Reviews** | Ratings and short reviews from verified visitors | Staticman or Utterances (GitHub Issues-backed comments) |
| **Drop Calendar** | Upcoming releases, collabs, and shop exclusives | JSON data file, calendar UI component |

### Phase 3 (Future)

| Feature | Description | Approach |
|---------|-------------|----------|
| **Direct Purchase** | Buy online, ship from shop | Snipcart or Shopify Buy Button (embeddable, no backend needed) |
| **Loyalty Program** | Cross-shop points/rewards | Third-party loyalty API or simple stamp-card tracked client-side |
| **Live Inventory Sync** | Real-time stock from POS systems | Shopify/Square API integrations via scheduled GitHub Actions |
| **Skater Profiles** | User accounts, wishlists, purchase history | Auth0/Supabase free tier for auth; Supabase for lightweight user data |
| **Mobile App** | PWA wrapper for mobile experience | Service worker + manifest.json (works from Phase 1) |

---

## 5. Technical Architecture

### Constraint: GitHub Pages Compatible

```
┌─────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                     │
│                                                          │
│  /data/shops/*.json        ← Shop profiles               │
│  /data/products/*.json     ← Product catalog              │
│  /data/events/*.json       ← Events & drops               │
│  /content/guides/*.md      ← Community content            │
│  /src/                     ← Site source                  │
│  /.github/workflows/       ← Automation                   │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ GitHub Pages  │    │ GitHub       │                    │
│  │ (Static Host) │    │ Actions      │                    │
│  │               │    │ (Cron Jobs)  │                    │
│  └──────┬───────┘    └──────┬───────┘                    │
│         │                    │                            │
└─────────┼────────────────────┼────────────────────────────┘
          │                    │
          ▼                    ▼
    ┌───────────┐      ┌──────────────────┐
    │  Browser  │      │  External APIs    │
    │ (Client)  │      │                  │
    │           │      │  • Shopify API   │
    │ • Lunr.js │      │  • Square API    │
    │ • Leaflet │      │  • Formspree     │
    │ • Snipcart│      │  • Mailchimp     │
    │ • localStorage   │  • Mapbox        │
    └───────────┘      │  • Supabase      │
                       └──────────────────┘
```

### Static Site Generator

**Recommended: Astro** (or 11ty as alternative)

- **Why Astro:** Fast builds, excellent static output, supports React/Svelte components for interactive islands, first-class Markdown/JSON content collections, built-in image optimization.
- **Alternative (11ty):** Simpler, JavaScript-only, great for content-heavy sites. Less interactive component support.

### Key Technical Decisions

| Concern | Solution | Free Tier? |
|---------|----------|------------|
| **Hosting** | GitHub Pages | ✅ Free |
| **Build/Deploy** | GitHub Actions (on push + scheduled) | ✅ 2,000 min/month free |
| **Search** | Pagefind (static search index at build time) | ✅ Free (runs at build) |
| **Maps** | Mapbox GL JS or Leaflet + OpenStreetMap tiles | ✅ Mapbox: 50k loads/mo free; Leaflet+OSM: unlimited free |
| **Forms/Reservations** | Formspree (50 submissions/mo free) or Tally (unlimited free) | ✅ Free tier |
| **Email notifications** | Buttondown (100 subscribers free) or Mailchimp (500 contacts free) | ✅ Free tier |
| **Comments/Reviews** | Giscus (GitHub Discussions-backed) | ✅ Free |
| **Inventory data updates** | GitHub Actions cron → fetch from Shopify/Square APIs → commit JSON | ✅ Free |
| **Analytics** | Plausible (community) or Umami (self-hosted on Vercel) | ✅ Free |
| **Commerce (Phase 3)** | Snipcart ($0 until $500/mo revenue) or Shopify Buy Button | ✅/💰 |
| **Auth (Phase 3)** | Supabase Auth (50k MAU free) | ✅ Free tier |
| **User data (Phase 3)** | Supabase Postgres (500MB free) | ✅ Free tier |
| **CDN/Images** | Cloudinary (25GB free) or GitHub LFS | ✅ Free tier |

### Inventory Sync Strategy

The hardest problem: keeping product data current without a backend.

**Approach: Multi-tier data freshness**

1. **Tier 1 — Manual (MVP):** Shops submit inventory via a Google Form or Tally form. GitHub Action processes submissions and commits updated JSON to the repo, triggering a rebuild. Cadence: shops update weekly or when major stock changes.

2. **Tier 2 — Semi-automated:** For shops on Shopify/Square, a scheduled GitHub Action (runs every 6–12 hours) fetches current inventory via their APIs and commits updated product JSON files. API keys stored as GitHub Secrets.

3. **Tier 3 — Near-real-time (Future):** Shopify/Square webhooks → serverless function (Cloudflare Worker free tier) → commits to repo via GitHub API → auto-deploy. Latency: ~2–5 minutes.

### Reservation Flow (No Backend)

```
User clicks "Reserve" → Tally/Formspree form submission
  → Email sent to shop (via form service)
  → GitHub Action triggered (via webhook/scheduled)
    → Updates product JSON: status = "reserved"
    → Commits & deploys
  → User gets confirmation email (via form service autoresponder)
  → After 24h, GitHub Action cron resets expired reservations
```

**Limitation:** Reservations are not instant-reflected on the site (delay of minutes to ~1 hour depending on build time). Acceptable for MVP — shops confirm via email/text regardless.

---

## 6. Data Model & Content Strategy

### Shop Profile (`/data/shops/{slug}.json`)

```json
{
  "slug": "labor-skateboard-shop",
  "name": "Labor Skateboard Shop",
  "tagline": "Est. 2002. By skaters, for skaters.",
  "borough": "Manhattan",
  "neighborhood": "Lower East Side",
  "address": "46 Canal St, New York, NY 10002",
  "coordinates": { "lat": 40.7157, "lng": -73.9981 },
  "phone": "+12122741444",
  "website": "https://laborskateshop.com",
  "instagram": "@laborskateshop",
  "hours": {
    "mon": "12:00-19:00",
    "tue": "12:00-19:00",
    "wed": "12:00-19:00",
    "thu": "12:00-19:00",
    "fri": "12:00-20:00",
    "sat": "11:00-20:00",
    "sun": "12:00-18:00"
  },
  "specialties": ["decks", "independent-brands", "local-scene"],
  "vibes": ["core", "friendly", "curated"],
  "team_riders": ["..."],
  "story": "Founded in 2002 on the Lower East Side...",
  "photos": ["labor-storefront.jpg", "labor-interior.jpg"],
  "pos_system": "shopify",
  "pos_api_enabled": true,
  "subscription_tier": "pro",
  "joined_date": "2026-01-15"
}
```

### Product (`/data/products/{shop-slug}/{product-id}.json`)

```json
{
  "id": "labor-baker-deck-8125",
  "shop_slug": "labor-skateboard-shop",
  "name": "Baker Brand Logo Deck 8.125\"",
  "brand": "Baker",
  "category": "decks",
  "subcategory": "street",
  "price": 64.95,
  "currency": "USD",
  "size": "8.125",
  "in_stock": true,
  "quantity": 3,
  "image": "baker-brand-logo-8125.jpg",
  "url": "https://laborskateshop.com/products/baker-brand-logo-8125",
  "tags": ["baker", "street", "logo"],
  "last_updated": "2026-02-11T18:00:00Z"
}
```

### Content Strategy

| Content Type | Source | Update Frequency |
|-------------|--------|-----------------|
| Shop profiles | Onboarding form + shop edits | As needed |
| Product catalog | API sync + manual forms | Daily–weekly |
| Skate spot guides | Community submissions + editorial | Monthly |
| Event calendar | Shop submissions + social scraping | Weekly |
| Blog/editorial | In-house + guest contributors | Bi-weekly |
| Drop/release calendar | Brand press + shop intel | As announced |

### NYC Skate Shop Directory (Research)

The following shops represent the core target for launch:

| Shop | Location | Specialty | Online Presence | POS |
|------|----------|-----------|----------------|-----|
| **Labor Skateboard Shop** | Canal St, LES, Manhattan | Core skate, curated decks, local scene | Website + Shopify | Shopify |
| **KCDC Skateshop** | Bushwick, Brooklyn | Full-service, lessons, indoor park nearby | Website + Shopify | Shopify |
| **Supreme** | Lafayette St, SoHo, Manhattan; Brooklyn | Streetwear/skate crossover, limited drops | Strong e-commerce | Custom |
| **Homage Brooklyn** | Bed-Stuy, Brooklyn | Community-focused, BIPOC-owned, hard goods | Instagram-heavy | Square |
| **Autumn Skateshop** | Williamsburg, Brooklyn | Independent brands, art-focused | Website | Shopify |
| **Uptown Riders** | Harlem, Manhattan | Uptown community, youth programs | Instagram/social | Square |
| **Bustin Boards** | Brooklyn (+ online) | Longboards, cruisers, custom shapes | Strong e-commerce | Shopify |
| **Uncle Funky's** | Greenwich Village, Manhattan | Longboard specialist, cruisers | Website | Shopify |
| **Eleven Skatepark + Shop** | Long Island City, Queens | Indoor park + retail | Website | Square |
| **5Boro NYC** | Online + events | NYC-native brand with shop pop-ups | E-commerce | Shopify |
| **Dolo Skate Co** | South Bronx, Bronx | Bronx skate culture, community | Social-first | TBD |
| **NJ Skateshop** | Journal Square, Jersey City | Core skate, close to NYC | Website | Shopify |
| **Seasons Skate Shop** | Woodhaven, Queens | Queens community staple | Website | Shopify |

**Coverage goal:** At least one shop per borough at launch, 10+ shops total.

---

## 7. Revenue Model

### Transaction Fees (Primary — Phase 3)

| Action | Fee | Paid By |
|--------|-----|---------|
| Completed reservation (picked up) | 5% of item price | Shop |
| Online purchase (via Snipcart) | 8% of order total | Shop |
| Price comparison click-through | Free (drives trust) | — |

*Note: No transaction fees in Phase 1–2. Focus on building inventory and traffic first.*

### Shop Subscriptions (Secondary — Phase 2+)

| Tier | Price | Includes |
|------|-------|---------|
| **Free** | $0/mo | Basic listing, manual inventory updates, shop profile |
| **Pro** | $29/mo | Automated inventory sync, analytics dashboard, featured placement, drop announcements, priority support |
| **Premium** | $79/mo | Everything in Pro + homepage features, newsletter inclusion, event promotion, API integration support |

### Additional Revenue Streams (Phase 3+)

- **Affiliate commissions:** Referral fees from brands for driving sales
- **Sponsored content:** Brand-sponsored spot guides, video features
- **Event ticketing:** Small cut from event ticket sales (skate jams, premieres)
- **Data insights:** Anonymized trend data sold to brands (requires scale)

### Revenue Projections (Conservative)

| Period | Shops | Monthly Traffic | Revenue |
|--------|-------|----------------|---------|
| Month 6 (MVP) | 8 shops | 2,000 visits | $0 (pre-revenue) |
| Month 12 | 12 shops | 8,000 visits | $500/mo (subscriptions) |
| Month 18 | 15 shops | 20,000 visits | $2,500/mo (subs + transactions) |
| Month 24 | 20+ shops | 50,000 visits | $8,000/mo |

---

## 8. Competitive Landscape

| Competitor | Type | Strength | Weakness vs Board Room |
|-----------|------|----------|----------------------|
| **CCS.com** | National online retailer | Huge inventory, fast shipping | No local connection, corporate, no shop discovery |
| **Tactics.com** | Online skate retailer | Good UX, brand selection | Same — no local angle |
| **Zumiez** | Mall chain + online | Convenient, widespread | Antithesis of core skate culture |
| **Amazon** | Everything store | Price, speed | Zero community, counterfeit risk, harms local shops |
| **Shopify stores (individual shops)** | Each shop's own site | Direct relationship | Fragmented, no comparison shopping, hard to discover |
| **Instagram** | Social discovery | Visual, real-time | No structured inventory, no search, no price comparison |
| **Yelp/Google Maps** | Shop discovery | Location, reviews | No inventory, no skate-specific curation |
| **Boardshop.co.uk** | UK skate aggregator | Aggregation model | UK-only, not community-focused |

### Board Room's Differentiator

**No one is aggregating local skate shop inventory with a community-first, anti-corporate ethos.** The closest experiences are Instagram browsing (unstructured) or Google Maps (no inventory). Board Room fills the gap between "I know what I want" and "I want to buy it from a real NYC skate shop."

---

## 9. Success Metrics

### North Star Metric
**Monthly reservations/purchases completed through Board Room**

### Phase 1 KPIs (Months 1–6)

| Metric | Target |
|--------|--------|
| Shops onboarded | 8+ |
| Products listed | 500+ |
| Monthly unique visitors | 2,000 |
| Shop profile views | 200/mo per shop |
| Search queries | 1,000/mo |

### Phase 2 KPIs (Months 7–12)

| Metric | Target |
|--------|--------|
| Shops onboarded | 12+ |
| Reservations per month | 50+ |
| Email subscribers | 1,000 |
| Monthly unique visitors | 8,000 |
| Return visitor rate | 30%+ |

### Phase 3 KPIs (Months 13–24)

| Metric | Target |
|--------|--------|
| Monthly transactions | 200+ |
| Monthly GMV | $15,000+ |
| Paying shop subscribers | 8+ |
| Monthly revenue | $2,500+ |
| NPS (shoppers) | 50+ |
| NPS (shop owners) | 40+ |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Shops won't participate** | Medium | Critical | Start with personal relationships; make onboarding zero-effort; show value before asking for money; let shops own their data |
| **Stale inventory data** | High | High | Multi-tier sync strategy; prominent "last updated" timestamps; push for API integrations early; set honest expectations with users |
| **GitHub Pages limitations** | Medium | Medium | Architecture is designed for the constraint; if outgrown, migrate to Cloudflare Pages or Netlify (same static model, more features) |
| **Supreme doesn't participate** | High | Low | Supreme is aspirational but not essential. Their limited-drop model doesn't fit aggregation well. Focus on core shops. |
| **Low user adoption** | Medium | High | Strong SEO (NYC skate shop queries), Instagram marketing, partnerships with skate crews and parks, skate spot guides as content marketing |
| **Someone builds this with a real backend** | Low | High | Move fast, build community moat. The relationships with shops and the community are the defensible asset, not the tech. |
| **Free tier API limits hit** | Medium | Medium | Monitor usage; upgrade to paid tiers as revenue justifies; self-host alternatives (Umami, Plausible community) |
| **Reservation no-shows** | Medium | Medium | 24-hour hold limit; reputation system (future); require email verification |
| **Legal/liability** | Low | Medium | Clear terms: Board Room is a directory, not a retailer. Shops handle all transactions and customer service. |

---

## 11. Implementation Phases

### Phase 1: Foundation (Months 1–3)

**Goal:** Launch a beautiful, functional shop directory with basic product listings.

**Week 1–2: Setup**
- Initialize Astro project with GitHub Pages deployment
- Design system: typography, colors, components (skate-inspired, bold, NYC gritty)
- Set up data schema for shops and products
- Configure GitHub Actions for automated builds

**Week 3–4: Shop Directory**
- Build shop profile pages from JSON data
- Interactive map with Mapbox/Leaflet
- Borough and specialty filters
- Hours display with "open now" indicator

**Week 5–8: Product Catalog**
- Product listing pages with search (Pagefind)
- Category browsing (decks, trucks, wheels, etc.)
- Shop-specific product pages
- Cross-shop price comparison view

**Week 9–10: Data Onboarding**
- Onboard first 5–8 shops (in-person visits, help them list inventory)
- Build Google Form / Tally-based inventory submission flow
- First GitHub Actions inventory update pipeline

**Week 11–12: Polish & Launch**
- SEO optimization (NYC skate shop keywords)
- PWA manifest + service worker for mobile
- Soft launch, gather feedback from shop owners and early users
- Analytics setup (Plausible/Umami)

### Phase 2: Engagement (Months 4–6)

- Reserve & Pick Up feature (form-based)
- Email newsletter with drop alerts and new arrivals
- Community content: skate spot guides, event calendar
- Shop reviews via Giscus
- Automated inventory sync for Shopify-based shops
- Onboard remaining target shops

### Phase 3: Commerce (Months 7–12)

- Snipcart integration for direct purchases
- Subscription tiers for shops
- User accounts via Supabase (wishlists, purchase history)
- Advanced analytics dashboard for shops
- Near-real-time inventory via webhooks + Cloudflare Workers
- Mobile experience optimization (PWA enhancements)

### Phase 4: Scale (Months 13–24)

- Expand to other cities (LA, SF, Philly, Chicago)
- Brand partnerships and sponsored content
- Loyalty/rewards program
- Native app consideration (if PWA insufficient)
- Video content integration (skate edits, shop tours)

---

## Appendix A: Technical Stack Summary

| Layer | Technology | Cost |
|-------|-----------|------|
| Static Site Generator | Astro | Free |
| Hosting | GitHub Pages | Free |
| CI/CD | GitHub Actions | Free (2,000 min/mo) |
| Search | Pagefind | Free |
| Maps | Leaflet + OpenStreetMap | Free |
| Forms | Tally | Free |
| Email | Buttondown → Mailchimp | Free tier |
| Comments | Giscus | Free |
| Analytics | Plausible Community / Umami | Free |
| Images/CDN | Cloudinary | Free (25GB) |
| Commerce (Phase 3) | Snipcart | Free until $500/mo rev |
| Auth (Phase 3) | Supabase Auth | Free (50k MAU) |
| Database (Phase 3) | Supabase Postgres | Free (500MB) |

**Total infrastructure cost at launch: $0/month**

## Appendix B: Content Marketing Strategy

To drive organic traffic before transaction revenue exists:

1. **"Best Skate Shops in [Borough]" guides** — SEO play for high-intent local searches
2. **NYC Skate Spot Map** — interactive guide to parks, street spots, DIY spots
3. **Shop origin stories** — longform profiles of shop founders (shareable, linkable)
4. **Weekly "Board of the Week"** — featured deck from a partner shop
5. **Event coverage** — Go Skateboarding Day, video premieres, local contests
6. **Instagram cross-promotion** — shops share Board Room links, Board Room features shops

---

*Board Room NYC exists because every city deserves a way to find, compare, and support its local skate shops without giving money to corporations that don't give a shit about skateboarding.*
