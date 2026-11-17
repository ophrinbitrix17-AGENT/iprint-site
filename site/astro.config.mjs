// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://iprint.com.ua',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  vite: {
    build: {
      // Поддержка iOS 16.2+ (Б2): вложенность CSS и прочее разворачивается при сборке
      cssTarget: ['safari16', 'chrome110', 'firefox110'],
    },
  },
});
