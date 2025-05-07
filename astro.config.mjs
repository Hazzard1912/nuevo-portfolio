// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.estuscode.com',
  output: 'server',
  adapter: vercel({
  }),
  integrations: [
    tailwind(),
    sitemap(),
    react(),
  ]
});