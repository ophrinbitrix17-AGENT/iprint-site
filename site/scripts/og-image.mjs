// Картинка-превью для соцсетей и мессенджеров (og:image 1200×630) → public/og-image.png.
// Запуск при смене стиля/слогана: node scripts/og-image.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/content/site.json'), 'utf8'));
const fontFile = (sub) => fs.readFileSync(path.join(root, `node_modules/@fontsource-variable/manrope/files/manrope-${sub}-wght-normal.woff2`)).toString('base64');
const fontCyr = fontFile('cyrillic');
const fontLat = fontFile('latin');
const logo = fs.readFileSync(path.join(root, 'src/assets/images/logo-dark-bg.svg'), 'utf8');

const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><style>
@font-face { font-family: M; src: url(data:font/woff2;base64,${fontLat}) format('woff2'); font-weight: 200 800; unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: M; src: url(data:font/woff2;base64,${fontCyr}) format('woff2'); font-weight: 200 800; unicode-range: U+0400-04FF; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #161513; color: #F3F1EC; font-family: M, sans-serif; position: relative; overflow: hidden; }
.dots { position: absolute; right: -40px; top: -40px; width: 620px; height: 720px;
  background-image: radial-gradient(circle, #A5F200 2.4px, transparent 3px); background-size: 18px 18px; opacity: .55;
  -webkit-mask-image: radial-gradient(circle at 75% 35%, #000 0%, transparent 65%); }
.bar { position: absolute; left: 0; right: 0; top: 0; height: 10px; background: #A5F200; }
.wrap { position: absolute; left: 80px; top: 92px; right: 380px; }
.logo svg { height: 92px; width: auto; display: block; }
h1 { margin-top: 64px; font-size: 64px; line-height: 1.04; font-weight: 800; letter-spacing: -.02em; }
p { margin-top: 26px; font-size: 28px; color: #ABA69C; font-weight: 500; }
.url { position: absolute; left: 80px; bottom: 56px; font-size: 24px; font-weight: 700; color: #A5F200; letter-spacing: .02em; }
</style></head><body><div class="bar"></div><div class="dots"></div>
<div class="wrap"><div class="logo">${logo}</div><h1>${site.tagline}</h1><p>Шовкотрафарет · DTF · вишивка · пошив — ${site.city}</p></div>
<div class="url">iprint.com.ua</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(root, 'public/og-image.png') });
await b.close();
console.log('public/og-image.png готово');
