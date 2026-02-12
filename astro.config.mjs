import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://clawdiard.github.io',
  base: '/boardroom-nyc',
  output: 'static',
  integrations: [sitemap()],
});
