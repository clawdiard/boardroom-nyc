#!/usr/bin/env node
/**
 * Validate shop and product JSON files against their schemas.
 * Uses Ajv (JSON Schema draft-07) with format validation.
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const ROOT = new URL('..', import.meta.url).pathname;
const shopSchema = JSON.parse(readFileSync(join(ROOT, 'data/schemas/shop.schema.json'), 'utf8'));
const productSchema = JSON.parse(readFileSync(join(ROOT, 'data/schemas/product.schema.json'), 'utf8'));

const validateShop = ajv.compile(shopSchema);
const validateProduct = ajv.compile(productSchema);

function collectJson(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectJson(full));
    else if (entry.name.endsWith('.json') && entry.name !== '.gitkeep') files.push(full);
  }
  return files;
}

let errors = 0;

for (const file of collectJson(join(ROOT, 'data/shops'))) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (!validateShop(data)) {
    console.error(`❌ ${relative(ROOT, file)}:`, validateShop.errors);
    errors++;
  } else {
    console.log(`✅ ${relative(ROOT, file)}`);
  }
}

for (const file of collectJson(join(ROOT, 'data/products'))) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (!validateProduct(data)) {
    console.error(`❌ ${relative(ROOT, file)}:`, validateProduct.errors);
    errors++;
  } else {
    console.log(`✅ ${relative(ROOT, file)}`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} file(s) failed validation.`);
  process.exit(1);
} else {
  console.log(`\nAll files valid! ✅`);
}
