import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/pro-kompaniiu/', h1: 'Про компанію', type: 'AboutPage' },
  { path: '/kontakty/', h1: 'Контакти', type: 'ContactPage' },
  { path: '/polityka-konfidentsiinosti/', h1: 'Політика конфіденційності', type: 'WebPage' },
];

test.describe('Внутренние страницы', () => {
  for (const pg of PAGES) {
    test(`${pg.path}: H1, canonical, хлебные крошки, разметка`, async ({ page }) => {
      const res = await page.goto(pg.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(pg.h1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://iprint.com.ua${pg.path}`);
      await expect(page.locator('.crumbs a').first()).toHaveAttribute('href', '/');
      const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)['@graph'];
      const types = graph.map((n: { '@type': string }) => n['@type']);
      expect(types).toContain(pg.type);
      expect(types).toContain('BreadcrumbList');
      expect(types).toContain('LocalBusiness');
    });
  }

  test('меню «Підтримка» ведёт на «Про компанію» и «Контакти»', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile || (page.viewportSize()?.width ?? 0) < 1100) {
      await page.locator('[data-menu-toggle]').click();
      await page.locator('#mnav a', { hasText: 'Контакти' }).click();
    } else {
      await page.locator('.dd summary').click();
      await page.locator('.dd__panel a', { hasText: 'Контакти' }).click();
    }
    await expect(page).toHaveURL(/\/kontakty\/$/);
  });

  test('ссылка на политику есть в форме и в подвале', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.lead-form__consent a')).toHaveAttribute('href', '/polityka-konfidentsiinosti/');
    await expect(page.locator('.ftr__copy a')).toHaveAttribute('href', '/polityka-konfidentsiinosti/');
  });

  test('превью для соцсетей: og:image 1200×630 доступна', async ({ page, request }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toBe('https://iprint.com.ua/og-image.png');
    const res = await request.get('/og-image.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test('карта сайта содержит новые страницы и не содержит служебные', async ({ request }) => {
    const xml = await (await request.get('/sitemap-0.xml')).text();
    for (const pg of PAGES) expect(xml).toContain(`https://iprint.com.ua${pg.path}`);
    expect(xml).not.toContain('dyakuyemo');
    expect(xml).not.toContain('404');
  });
});
