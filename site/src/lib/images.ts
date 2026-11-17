import type { ImageMetadata } from 'astro';

/** Реестр фото: ключ из текстов (например "tech/tech-silkscreen.jpg") → файл в src/assets/images. */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export function img(key: string | null | undefined): ImageMetadata | null {
  if (!key) return null;
  const hit = files[`/src/assets/images/${key}`];
  if (!hit) throw new Error(`Фото не найдено: src/assets/images/${key}`);
  return hit.default;
}
