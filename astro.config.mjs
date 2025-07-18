// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nexen.com.co',

  output: 'server',
  trailingSlash: 'always',
  prefetch: {
    defaultStrategy: 'hover',
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },

  }),
  integrations: [
    tailwind(),
    sitemap(),
    react(),
  ]
});