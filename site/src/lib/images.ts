import type { ImageMetadata } from 'astro';

/** Реестр фото: ключ из текстов (например "tech/shovkotrafaretnyi-druk-na-futboltsi.jpg") → файл в src/assets/images. */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

/** Правило имён (tools/ИЗОБРАЖЕНИЯ.md): латиница, нижний регистр, слова через дефис, 2+ слова по сути кадра. */
const GOOD_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)+\.(?:jpe?g|png|webp|avif)$/;
const BAD_WORDS = /(?:^|-)(?:final|fin|v\d+|copy|kopiia|draft|img\d*|image|photo|foto|new|test)(?=-|\.)/;
for (const path of Object.keys(files)) {
  const name = path.split('/').pop()!;
  if (!GOOD_NAME.test(name) || BAD_WORDS.test(name)) {
    throw new Error(`Неправильное имя фото: ${path}. Латиница, дефисы, по сути кадра — tools/ИЗОБРАЖЕНИЯ.md`);
  }
}

export function img(key: string | null | undefined): ImageMetadata | null {
  if (!key) return null;
  const hit = files[`/src/assets/images/${key}`];
  if (!hit) throw new Error(`Фото не найдено: src/assets/images/${key}`);
  return hit.default;
}
