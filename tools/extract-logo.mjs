// Вырезает из лого.svg (лист CorelDRAW) два чистых логотипа iPrint:
//  logo-light-bg.svg — для светлого фона (тёмное слово, лайм #A6D93C)
//  logo-dark-bg.svg  — для тёмного фона (серое слово, лайм #A5F200)
// node extract-logo.mjs <лого.svg> <out-dir>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [src, out] = process.argv.slice(2);
const svg = fs.readFileSync(src, 'utf8');
const lines = svg.split(/\r?\n/);
const pick = (needle) => lines.findIndex((l) => l.includes(needle));

// Экземпляры: светлый фон — кольцо cx=15991.05 cy=-12314.03; тёмный — кольцо cx=16112.01 cy=4271.04
const variants = {
  'logo-light-bg': { start: pick('cx="15991.05" cy="-12314.03"'), ring: '#2B2A29', word: '#2B2A29', dot: '#A6D93C', ringW: 170 },
  'logo-dark-bg': { start: pick('cx="16112.01" cy="4271.04"'), ring: '#C7C2B8', word: '#BFBBB2', dot: '#A5F200', ringW: 150 },
};

for (const [name, v] of Object.entries(variants)) {
  const ringLine = lines[v.start];
  const pathLine = lines[v.start + 1];
  const dotLine = lines[v.start + 2];
  const num = (l, a) => Number(l.match(new RegExp(a + '="([-\\d.]+)"'))[1]);
  const d = pathLine.match(/ d="([^"]+)"/)[1];
  const cx = num(ringLine, 'cx'), cy = num(ringLine, 'cy'), r = num(ringLine, 'r');
  const dx = num(dotLine, 'cx'), dy = num(dotLine, 'cy'), dr = num(dotLine, 'r');
  const body = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${v.ring}" stroke-width="${v.ringW}"/>` +
    `<path fill="${v.word}" d="${d}"/>` +
    `<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${v.dot}"/>`;
  // грубая рамка → растр → точная рамка по непрозрачным пикселям
  const X0 = cx - 1200, Y0 = cy - 1200, W = 12000, H = 5600, S = 0.05;
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X0} ${Y0} ${W} ${H}" width="${W * S}" height="${H * S}">${body}</svg>`;
  const { info } = await sharp(Buffer.from(probe)).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const pad = 20;
  const bx = X0 + (-info.trimOffsetLeft) / S - pad, by = Y0 + (-info.trimOffsetTop) / S - pad;
  const bw = info.width / S + pad * 2, bh = info.height / S + pad * 2;
  const final = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx.toFixed(0)} ${by.toFixed(0)} ${bw.toFixed(0)} ${bh.toFixed(0)}" role="img" aria-label="iPrint">${body}</svg>\n`;
  fs.writeFileSync(path.join(out, name + '.svg'), final);
  console.log(name, bw.toFixed(0), 'x', bh.toFixed(0));
}
