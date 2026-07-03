// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tools.jsjoe.io',
  base: '/vocab-size',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  }
});