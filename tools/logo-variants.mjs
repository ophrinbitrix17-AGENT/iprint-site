// Делает версии PNG-логотипа для светлой/тёмной темы: серое слово/кольцо перекрашивается, лаймовая точка остаётся.
// node logo-variants.mjs <logo.png> <out-dir> <width>
import sharp from 'sharp';
import path from 'node:path';
const [src, out, w = 480] = process.argv.slice(2);
const { data, info } = await sharp(src).ensureAlpha().resize(Number(w)).raw().toBuffer({ resolveWithObject: true });
const variants = { 'logo-on-dark': [0xBF, 0xBB, 0xB2], 'logo-on-light': [0x2A, 0x29, 0x25] };
for (const [name, rgb] of Object.entries(variants)) {
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const [r, g, b] = [buf[i], buf[i + 1], buf[i + 2]];
    const isLime = g > 200 && r < 200 && b < 120;           // лаймовая точка
    if (!isLime) { buf[i] = rgb[0]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[2]; }
  }
  await sharp(buf, { raw: info }).png({ compressionLevel: 9 }).toFile(path.join(out, name + '.png'));
  console.log(name);
}
