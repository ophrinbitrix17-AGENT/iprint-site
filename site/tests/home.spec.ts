import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WIDTHS = [320, 360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440, 1920];

test.describe('Главная', () => {
  test('нет горизонтальной прокрутки на контрольных ширинах (обе темы)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'ширины проверяем одним движком');
    for (const theme of ['light', 'dark']) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 800 });
        await page.goto('/');
        await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(over, `ширина ${w}, тема ${theme}`).toBeLessThanOrEqual(0);
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

  test('один H1, lang=uk, title, description, canonical, JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page).toHaveTitle(/iPrint/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://iprint.com.ua/');
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(ld!);
    expect(data['@graph'][0]['@type']).toBe('LocalBusiness');
  });

  test('тема: по умолчанию светлая, переключатель работает и запоминается без вспышки', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    // атрибут выставлен inline-скриптом до отрисовки
    const early = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(early).toBe('dark');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('мобильное меню открывается, aria-expanded, закрывается по Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    const burger = page.locator('[data-menu-toggle]');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mnav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mnav')).toBeHidden();
  });

  test('нижняя панель: спрятана, пока видна кнопка Hero; появляется после прокрутки', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    await expect(page.locator('[data-sbar]')).toHaveClass(/sbar--hidden/);
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(page.locator('[data-sbar]')).not.toHaveClass(/sbar--hidden/);
  });

  test('все картинки загрузились и имеют alt', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await page.waitForLoadState('networkidle');
    const bad = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    expect(bad).toEqual([]);
    const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).length);
    expect(noAlt).toBe(0);
  });

  test('зоны касания ≥ 44 px у кнопок и ссылок-кнопок', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'только телефоны');
    await page.goto('/');
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.btn, .icon-btn, .mnav__link, .ftr__list a')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ t: el.textContent?.trim().slice(0, 30), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 44));
    expect(small).toEqual([]);
  });

  test('доступность (axe): нет серьёзных нарушений — светлая и тёмная', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      await page.waitForTimeout(400); // дать завершиться плавной смене цветов кнопок
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${theme}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(serious).toEqual([]);
    }
  });

  test('скриншоты для визуальной проверки (обе темы)', async ({ page }, info) => {
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `screenshots/${info.project.name}-${theme}.png`, fullPage: true });
    }
  });
});
