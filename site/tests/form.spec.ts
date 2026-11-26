import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

// Telegram подменён имитацией (tests/mock-telegram.mjs, порт 9911) — см. playwright.config.ts
const MOCK = 'http://127.0.0.1:9911';
const uid = (tag = 'Тест') => `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function telegramLog(page: Page) {
  const r = await page.request.get(`${MOCK}/__log`);
  return (await r.json()) as { method: string; contentType: string; body: string }[];
}

// Время заполнения форма меряет через performance.now(). В тестах «ускоряем время» — иначе защита от ботов
// (меньше 2,5 с на заполнение) молча отбросит заявку.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const orig = performance.now.bind(performance);
    (window as unknown as { __skew: number }).__skew = 0;
    performance.now = () => orig() + (window as unknown as { __skew: number }).__skew;
  });
});
const humanTime = (page: Page) => page.evaluate(() => { (window as unknown as { __skew: number }).__skew = 10_000; });

async function fillBasic(page: Page, name: string, contact = '0939013050') {
  await page.goto('/#zapyt');
  await page.fill('#lead-name', name);
  await page.fill('#lead-contact', contact);
}

test.describe('Форма заявки', () => {
  test('пустая отправка: ошибки у обязательных полей, красная рамка, фокус на первом', async ({ page }) => {
    await page.goto('/#zapyt');
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('#lead-name-err')).toBeVisible();
    await expect(page.locator('#lead-contact-err')).toBeVisible();
    await expect(page.locator('#lead-name')).toBeFocused();
    await expect(page.locator('#lead-name')).toHaveAttribute('aria-invalid', 'true');
    const border = await page.locator('#lead-name').evaluate((el) => getComputedStyle(el).borderTopColor);
    const danger = await page.locator('#lead-name').evaluate((el) => getComputedStyle(el).getPropertyValue('--danger').trim());
    expect(border).not.toBe('rgb(133, 127, 117)');       // не серая рамка по умолчанию
    expect(danger.length).toBeGreaterThan(0);
  });

  test('заявка уходит в Telegram с нужными полями, пользователь видит «Дякуємо»', async ({ page }) => {
    const name = uid();
    await fillBasic(page, name, '@iprint_test');
    await page.locator('.chip', { hasText: 'Друк на ваших виробах' }).click();
    await page.locator('.chip', { hasText: '50–200' }).click();
    await page.fill('#lead-comment', 'худі, принт на спині <b>тест</b> & ще');
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    const msg = (await telegramLog(page)).find((m) => m.method === 'sendMessage' && m.body.includes(name));
    expect(msg, 'сообщение дошло до Telegram').toBeTruthy();
    const body = JSON.parse(msg!.body);
    expect(body.chat_id).toBe('100');
    expect(body.text).toContain('@iprint_test');
    expect(body.text).toContain('Друк на ваших виробах');
    expect(body.text).toContain('50–200');
    expect(body.text).toContain('&lt;b&gt;тест&lt;/b&gt; &amp; ще');   // HTML пользователя экранирован
    await expect(page.locator('#lead-name')).toHaveValue('');
  });

  test('очень длинный комментарий из «&» — сообщение остаётся корректным HTML для Telegram', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    const name = uid();
    await fillBasic(page, name);
    await page.fill('#lead-comment', '&'.repeat(1500));
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');   // имитация проверяет HTML как Telegram
    expect((await telegramLog(page)).some((m) => m.method === 'sendMessage' && m.body.includes(name))).toBe(true);
  });

  test('сбой Telegram — понятная ошибка, а не «Дякуємо»', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    await fillBasic(page, uid('FAIL_TG'));
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Не вдалося надіслати');
    await expect(page.locator('[data-lead-status]')).toHaveClass(/--err/);
  });

  test('файл макета отправляется документом', async ({ page }) => {
    const name = uid();
    await fillBasic(page, name, '093 901 30 50');
    await page.setInputFiles('#lead-file', { name: 'maket.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
    await expect(page.locator('[data-file-name]')).toHaveText('maket.pdf');
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    const log = await telegramLog(page);
    expect(log.find((m) => m.method === 'sendMessage' && m.body.includes(name))?.body).toContain('maket.pdf');
    expect(log.some((m) => m.method === 'sendDocument' && m.body.includes(name) && m.body.includes('maket.pdf'))).toBe(true);
  });

  test('файл не дошёл, текст дошёл — клиент видит «заявку отримано, файл не дійшов», менеджеры — предупреждение', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    const name = uid();
    await fillBasic(page, name);
    await page.setInputFiles('#lead-file', { name: 'fail-maket.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') });
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('файл не дійшов');
    const log = await telegramLog(page);
    expect(log.some((m) => m.method === 'sendMessage' && m.body.includes('не надійшов') && m.body.includes(name))).toBe(true);
  });

  test('неподходящий файл — ошибка сразу в браузере, без отправки', async ({ page }) => {
    await page.goto('/#zapyt');
    await page.setInputFiles('#lead-file', { name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('x') });
    await expect(page.locator('#lead-file-err')).toBeVisible();
    await expect(page.locator('#lead-file-err')).toContainText('формат');
  });

  test('бот (заполнено скрытое поле) — Telegram ничего не получает', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    const name = uid();
    await fillBasic(page, name);
    await page.evaluate(() => { (document.querySelector('[name="zx_extra"]') as HTMLInputElement).value = 'spam'; });
    await humanTime(page);
    await page.locator('.lead-form__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    expect((await telegramLog(page)).some((m) => m.body.includes(name))).toBe(false);
  });

  test('без JavaScript: успех → «Дякуємо», ошибка → отдельная страница ошибки', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'одним движком');
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/#zapyt');
    await page.fill('#lead-name', uid());
    await page.fill('#lead-contact', '0939013050');
    await page.locator('.lead-form__submit').click();
    await expect(page).toHaveURL(/\/dyakuyemo\/$/);
    await expect(page.locator('h1')).toContainText('Дякуємо');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await page.goto('/#zapyt');
    await page.locator('.lead-form__submit').click();               // пустая форма
    await expect(page).toHaveURL(/\/pomylka\/$/);
    await expect(page.locator('h1')).toContainText('не вдалося');
    await ctx.close();
  });

  test('чужой или «null» Origin — отказ, без падения обработчика', async ({ request }) => {
    for (const origin of ['https://evil.example', 'null']) {
      const r = await request.post('/api/lead', { headers: { origin, accept: 'application/json' }, multipart: { name: 'a', contact: '0939013050' } });
      expect(r.status()).toBe(403);
      expect((await r.json()).error).toBe('origin');
    }
  });

  test('лимит файла одинаковый на сайте и в обработчике', () => {
    const site = JSON.parse(fs.readFileSync('src/content/site.json', 'utf8'));
    const wr = fs.readFileSync('wrangler.jsonc', 'utf8');
    expect(wr).toContain(`"LEAD_MAX_FILE_MB": "${site.lead.maxFileMb}"`);
  });

  test('несуществующая страница — 404 с понятным текстом', async ({ page }) => {
    const res = await page.goto('/takoyi-storinky-nemaye/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('немає');
  });
});
