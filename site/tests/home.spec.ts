import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WIDTHS = [320, 360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440, 1920];

async function setTheme(page: Page, theme: string) {
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  await page.waitForTimeout(400); // дать завершиться плавной смене цветов
}

/** Элементы, вылезающие за правый край экрана, и тексты, обрезанные контейнером. */
async function overflowReport(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
      if (el.closest('[hidden], .sbar--hidden') || el.offsetParent === null) return;
      if (getComputedStyle(el).visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width && r.right > vw + 0.5 && !el.closest('.hero__media, .card__media, .complex__media, .cta')) out.push(`${el.tagName}.${el.className} right=${Math.round(r.right)}`);
    });
    document.querySelectorAll<HTMLElement>('h1, h2, h3, .btn, .card__text').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) out.push(`обрезан текст: ${el.textContent?.trim().slice(0, 30)}`);
    });
    return out.slice(0, 10);
  });
}

test.describe('Главная', () => {
  test('ничего не вылезает за экран и тексты не обрезаются (все ширины, обе темы)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'ширины проверяем одним движком');
    for (const theme of ['light', 'dark']) {
      for (const w of [...WIDTHS, 844]) {
        await page.setViewportSize({ width: w, height: w === 844 ? 390 : 800 });
        await page.goto('/');
        await setTheme(page, theme);
        expect(await overflowReport(page), `ширина ${w}, тема ${theme}`).toEqual([]);
      }
    }
  });

  test('первый экран: виден H1 и главная кнопка', async ({ page }) => {
    await page.goto('/');
    const vh = page.viewportSize()!.height;
    const h1 = await page.locator('h1').boundingBox();
    const btn = await page.locator('.hero .btn--primary').boundingBox();
    expect(h1!.y).toBeLessThan(vh);
    expect(btn!.y + btn!.height).toBeLessThan(vh + 1);
  });

  test('телефон лёжа 844×390: на первом экране H1 и главная кнопка', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    const btn = await page.locator('.hero .btn--primary').boundingBox();
    expect(btn!.y + btn!.height).toBeLessThanOrEqual(390);
  });

  test('фото заполняют свои рамки (нет пустых полос)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    const gaps = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.hero__media, .card__media')]
      .map((box) => { const img = box.querySelector('img'); if (!img) return null; const a = box.getBoundingClientRect(), b = img.getBoundingClientRect();
        return Math.abs(a.height - b.height) > 2 || Math.abs(a.width - b.width) > 2 ? `${box.className}: рамка ${Math.round(a.width)}×${Math.round(a.height)}, фото ${Math.round(b.width)}×${Math.round(b.height)}` : null; })
      .filter(Boolean));
    expect(gaps).toEqual([]);
  });

  test('один H1, lang=uk, title, description, canonical, JSON-LD; превью закрыто от индексации', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page).toHaveTitle(/iPrint/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://iprint.com.ua/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(data['@graph'][0]['@type']).toBe('LocalBusiness');
  });

  test('якоря меню и кнопок ведут на существующие блоки', async ({ page }) => {
    await page.goto('/');
    const missing = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/#"], a[href^="#"]')]
      .map((a) => a.getAttribute('href')!.split('#')[1]).filter((id) => id && !document.getElementById(id)));
    expect([...new Set(missing)]).toEqual([]);
  });

  test('тема: по умолчанию светлая, переключатель работает и запоминается', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload({ waitUntil: 'commit' });
    await page.waitForSelector('body');
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('мобильное меню: aria-expanded, Escape, зоны касания пунктов ≥ 44 px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    const burger = page.locator('[data-menu-toggle]');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mnav')).toBeVisible();
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#mnav a, #mnav .btn')]
      .map((el) => el.getBoundingClientRect().height).filter((h) => h < 44));
    expect(small).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('#mnav')).toBeHidden();
  });

  test('выпадающее меню «Підтримка» работает с клавиатуры', async ({ page, isMobile }) => {
    test.skip(isMobile || (page.viewportSize()?.width ?? 0) < 1100, 'только компьютер');
    await page.goto('/');
    await page.locator('.dd summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.dd')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('.dd')).not.toHaveAttribute('open', '');
  });

  test('нижняя панель: спрятана, пока видна кнопка Hero; появляется после прокрутки', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    await expect(page.locator('[data-sbar]')).toHaveClass(/sbar--hidden/);
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(page.locator('[data-sbar]')).not.toHaveClass(/sbar--hidden/);
  });

  test('режим «меньше движения»: анимации отключены', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const dur = await page.evaluate(() => getComputedStyle(document.querySelector('.btn')!).transitionDuration);
    expect(dur.split(',').every((d) => parseFloat(d) <= 0.01)).toBe(true);
  });

  test('все картинки загрузились и имеют alt', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    await page.waitForLoadState('networkidle');
    const bad = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    expect(bad).toEqual([]);
    expect(await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).length)).toBe(0);
  });

  test('зоны касания ≥ 44 px у кнопок и ссылок', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.btn, .icon-btn, .ftr__list a')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ t: el.textContent?.trim().slice(0, 30), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 44));
    expect(small).toEqual([]);
  });

  test('доступность (axe): нет серьёзных нарушений — светлая и тёмная', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await setTheme(page, theme);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${theme}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(serious).toEqual([]);
    }
  });

  test('скриншоты для визуальной проверки (обе темы)', async ({ page }, info) => {
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await setTheme(page, theme);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `screenshots/${info.project.name}-${theme}.png`, fullPage: true });
    }
  });
});
