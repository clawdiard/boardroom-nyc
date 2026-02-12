import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const shops = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './data/shops' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    tagline: z.string().optional(),
    borough: z.enum(['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']),
    neighborhood: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    instagram: z.string().optional(),
    hours: z.record(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    vibes: z.array(z.string()).optional(),
    team_riders: z.array(z.string()).optional(),
    story: z.string().optional(),
    photos: z.array(z.string()).optional(),
    pos_system: z.string().optional(),
    pos_api_enabled: z.boolean().optional(),
    subscription_tier: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
    joined_date: z.string(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './data/products' }),
  schema: z.object({
    id: z.string(),
    shop_slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    brand: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().default('USD'),
    size: z.string().optional(),
    in_stock: z.boolean(),
    quantity: z.number().int().min(0).optional(),
    image: z.string().optional(),
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    last_updated: z.string().datetime().optional(),
  }),
});

const events = defineCollection({
  loader: file('./data/events/events.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    description: z.string(),
    shop: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blog-guides' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    borough: z.string().optional(),
    publishedDate: z.string(),
    updatedDate: z.string().optional(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
});

const features = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/features' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    type: z.string().optional(),
    publishedDate: z.string(),
    updatedDate: z.string().optional(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
    productId: z.string().optional(),
    shopSlug: z.string().optional(),
  }),
});

export const collections = { shops, products, events, guides, features };
