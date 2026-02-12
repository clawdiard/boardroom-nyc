#!/usr/bin/env node
/**
 * Generates a GeoJSON FeatureCollection from shop data files.
 * Output: public/shops.geojson
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const shopsDir = join(process.cwd(), 'data', 'shops');
const outPath = join(process.cwd(), 'public', 'shops.geojson');

const files = readdirSync(shopsDir).filter(f => f.endsWith('.json'));
const features = [];

for (const file of files) {
  const shop = JSON.parse(readFileSync(join(shopsDir, file), 'utf-8'));
  if (!shop.coordinates?.lat || !shop.coordinates?.lng) {
    console.warn(`Skipping ${file}: missing coordinates`);
    continue;
  }

  // Determine if open now (UTC — approximate, shops are in EST/EDT)
  const now = new Date();
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const dayName = days[now.getUTCDay()];
  const todayHours = shop.hours?.[dayName] || '';

  features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [shop.coordinates.lng, shop.coordinates.lat],
    },
    properties: {
      name: shop.name,
      slug: shop.slug,
      address: shop.address || '',
      borough: shop.borough || '',
      neighborhood: shop.neighborhood || '',
      specialties: shop.specialties || [],
      website: shop.website || '',
      hours: shop.hours || {},
      todayHours,
    },
  });
}

const geojson = { type: 'FeatureCollection', features };
writeFileSync(outPath, JSON.stringify(geojson, null, 2));
console.log(`Generated ${outPath} with ${features.length} shops`);
