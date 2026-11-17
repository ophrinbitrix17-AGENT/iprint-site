// После сборки: заголовки для Cloudflare (_headers).
// Не боевая сборка (SITE_ENV != production) — запрет индексации на всём зеркале (X-Robots-Tag), плюс базовые заголовки безопасности.
import fs from 'node:fs';
const prod = process.env.SITE_ENV === 'production';
const lines = [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  ...(prod ? [] : ['  X-Robots-Tag: noindex, nofollow']),
  '',
  '/_astro/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
];
fs.writeFileSync('dist/_headers', lines.join('\n'));
console.log(`[postbuild] _headers записан (${prod ? 'боевая' : 'превью — noindex'})`);
