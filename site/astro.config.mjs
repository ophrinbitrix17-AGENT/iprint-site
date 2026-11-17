// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import home from './src/content/home.json' with { type: 'json' };

export default defineConfig({
  site: 'https://iprint.com.ua',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // lastmod = дата реального изменения содержания (поле meta.updated в текстах страницы), не дата сборки
      serialize(item) {
        if (new URL(item.url).pathname === '/') item.lastmod = home.meta.updated;
        return item;
      },
    }),
  ],
  vite: {
    build: {
      // Поддержка iOS 16.2+ (Б2): вложенность CSS и прочее разворачивается при сборке
      cssTarget: ['safari16', 'chrome110', 'firefox110'],
    },
  },
});
