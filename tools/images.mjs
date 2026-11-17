// Конвейер изображений iPrint.
// Берёт исходные фото (любой размер/формат), выдаёт веб-копии:
//  - поворот по EXIF, удаление метаданных (GPS и т. п.);
//  - ограничение длинной стороны;
//  - латинское имя файла (транслитерация);
//  - форматы: webp (+ avif по флагу) и jpg-запасной.
// Исходники НЕ меняются. Для сайта Astro дополнительно сам режет размеры под экраны.
//
// Использование:
//   node images.mjs <папка-или-файл-источник> <папка-результат> [--max=2400] [--avif] [--quality=80] [--crop=1200x900]
// Пример (превью для витрины стиля):
//   node images.mjs "../../Контент/картинки/Картинки Главная" ../design/img --max=1400

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const [src, out] = args.filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v] = a.slice(2).split('=');
  return [k, v ?? true];
}));
if (!src || !out) {
  console.error('Usage: node images.mjs <src> <out> [--max=2400] [--avif] [--quality=80] [--crop=WxH]');
  process.exit(1);
}
const MAX = Number(opt.max || 2400);
const Q = Number(opt.quality || 80);
const EXT = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.avif', '.heic']);

const map = {а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia',ы:'y',э:'e',ё:'e',ъ:''};
const slug = s => s.toLowerCase().split('').map(c => map[c] ?? c).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image';

const files = fs.statSync(src).isDirectory()
  ? fs.readdirSync(src).filter(f => EXT.has(path.extname(f).toLowerCase())).map(f => path.join(src, f))
  : [src];
fs.mkdirSync(out, { recursive: true });

for (const f of files) {
  const name = slug(path.parse(f).name);
  let img = sharp(f, { failOn: 'none' }).rotate();
  if (opt.crop) {
    const [w, h] = String(opt.crop).split('x').map(Number);
    img = img.resize(w, h, { fit: 'cover', position: 'attention' });
  } else {
    img = img.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true });
  }
  const buf = await img.toBuffer();
  await sharp(buf).webp({ quality: Q }).toFile(path.join(out, `${name}.webp`));
  await sharp(buf).jpeg({ quality: Q, mozjpeg: true }).toFile(path.join(out, `${name}.jpg`));
  if (opt.avif) await sharp(buf).avif({ quality: Q - 25 }).toFile(path.join(out, `${name}.avif`));
  const { size } = fs.statSync(path.join(out, `${name}.webp`));
  console.log(`${path.basename(f)} -> ${name}.webp (${Math.round(size / 1024)} KB)`);
}
