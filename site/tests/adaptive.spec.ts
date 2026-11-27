import { test, expect, type Browser } from '@playwright/test';

/**
 * Базовые экраны (правило владельца 27.11.2026: после каждой правки — проверка адаптации хотя бы на них; Б4 §2а).
 * Размеры — CSS-пиксели окна браузера без панелей. Ноутбук 1366×768 с масштабом Windows 125 % ≈ 1093×530, 150 % ≈ 910×430:
 * на нём владелец увидел «мобильную» версию (порог компьютера был 1100 px, теперь 900 px).
 */
const SCREENS = [
  { name: 'телефон 390×844', w: 390, h: 844, dsf: 3, kind: 'phone' },
  { name: 'планшет 768×1024', w: 768, h: 1024, dsf: 2, kind: 'tablet' },
  { name: 'планшет лёжа 1024×768', w: 1024, h: 768, dsf: 2, kind: 'desktop' },
  { name: 'ноутбук 1366×768', w: 1366, h: 657, dsf: 1, kind: 'desktop' },
  { name: 'ноутбук 1366×768, масштаб 125 %', w: 1093, h: 530, dsf: 1.25, kind: 'desktop' },
  { name: 'ноутбук 1366×768, масштаб 150 %', w: 910, h: 430, dsf: 1.5, kind: 'desktop' },
  { name: 'компьютер 1440×900', w: 1440, h: 789, dsf: 1, kind: 'desktop' },
  { name: 'Full HD 1920×1080', w: 1920, h: 969, dsf: 1, kind: 'desktop' },
] as const;

async function measure(browser: Browser, s: (typeof SCREENS)[number]) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dsf });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);   // высота Hero зависит от шрифта
  const m = await page.evaluate(() => {
    const rect = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const rows = (sel: string) => {
      const tops = [...document.querySelectorAll<HTMLElement>(sel)].map((el) => Math.round(el.offsetTop));
      return { count: tops.length, inFirstRow: tops.filter((t) => t === tops[0]).length };
    };
    const media = rect('.hero__media'), h1 = rect('#hero-title'), hero = rect('.hero');
    // правый край видимого текста Hero (строки, а не блоки: колонка текста может заходить под затемнённый край фото)
    const textRight = Math.max(...['#hero-title', '.hero__lead', '.hero__actions .btn', '.hero__more'].flatMap((sel) => {
      const el = document.querySelector(sel); if (!el) return [];
      const range = document.createRange(); range.selectNodeContents(el);
      return [...range.getClientRects()].map((r) => r.right);
    }));
    return {
      hscroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      nav: getComputedStyle(document.querySelector('.hdr__nav')!).display !== 'none',
      burger: getComputedStyle(document.querySelector('[data-menu-toggle]')!).display !== 'none',
      photoBeside: media.top <= h1.top && textRight <= media.left + 8,
      heroBottom: hero.bottom,
      tech: rows('.grid--tech > li'), products: rows('.grid--products > li'), steps: rows('.perevahy > li'),
    };
  });
  await ctx.close();
  return m;
}

test.describe('Адаптация на базовых экранах', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'размеры окна проверяем одним движком');

  for (const s of SCREENS) {
    test(s.name, async ({ browser, isMobile }) => {
      test.skip(isMobile, 'размеры задаёт сам тест');
      const m = await measure(browser, s);
      expect(m.hscroll, 'горизонтальная прокрутка').toBeLessThanOrEqual(0);
      if (s.kind === 'desktop') {
        expect(m.nav, 'меню в шапке, а не кнопка «Меню»').toBe(true);
        expect(m.burger).toBe(false);
        expect(m.photoBeside, 'фото Hero справа от текста').toBe(true);
        expect(m.heroBottom, 'Hero не занимает весь экран: ниже виден следующий раздел').toBeLessThanOrEqual(s.h - 40);
        expect(m.tech.inFirstRow, 'технологии — все в ряд').toBe(Math.min(m.tech.count, 4));
        expect(m.products.inFirstRow, 'услуги — по 3 в ряд').toBe(Math.min(m.products.count, 3));
        // «без ризиків»: все в ряд с 1000 px, на 900–999 — 2×2; «сирота» 3+1 недопустима
        expect(m.steps.inFirstRow, '«без ризиків» — в ряд или 2×2').toBe(s.w >= 1000 ? Math.min(m.steps.count, 4) : 2);
      } else if (s.kind === 'tablet') {
        expect(m.burger).toBe(true);
        expect(m.tech.inFirstRow).toBe(2);
        expect(m.products.inFirstRow).toBe(2);
        expect(m.steps.inFirstRow).toBe(2);
      } else {
        expect(m.burger).toBe(true);
        expect(m.tech.inFirstRow).toBe(1);
        expect(m.products.inFirstRow).toBe(1);
      }
    });
  }
});
