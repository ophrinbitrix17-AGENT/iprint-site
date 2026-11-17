// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import home from './src/content/home.json' with { type: 'json' };
import pages from './src/content/pages.json' with { type: 'json' };

// дата изменения содержания по адресу страницы
const updated = { '/': home.meta.updated };
for (const p of Object.values(pages)) if (p && typeof p === 'object' && 'slug' in p) updated[`/${p.slug}/`] = p.updated;
const SERVICE = new Set(['/dyakuyemo/', '/pomylka/', '/404/']);

export default defineConfig({
  site: 'https://iprint.com.ua',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // lastmod = дата реального изменения содержания (поле meta.updated в текстах страницы), не дата сборки
      filter: (page) => !SERVICE.has(new URL(page).pathname),
      serialize(item) {
        const lm = updated[new URL(item.url).pathname];
        if (lm) item.lastmod = lm;
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
