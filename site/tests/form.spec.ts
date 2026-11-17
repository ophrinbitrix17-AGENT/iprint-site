import { test, expect, type Page } from '@playwright/test';

// Telegram подменён имитацией (tests/mock-telegram.mjs, порт 9911) — см. playwright.config.ts
const MOCK = 'http://127.0.0.1:9911';
const uid = () => `Тест-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function telegramLog(page: Page) {
  const r = await page.request.get(`${MOCK}/__log`);
  return (await r.json()) as { method: string; contentType: string; body: string }[];
}
/** Человек заполняет форму дольше 2,5 с — «состарим» метку времени, чтобы защита от ботов не сработала. */
async function humanTime(page: Page) {
  await page.evaluate(() => { const t = document.querySelector<HTMLInputElement>('[data-lead-time]'); if (t) t.value = String(Date.now() - 10_000); });
}

test.describe('Форма заявки', () => {
  test('пустая отправка: ошибки у обязательных полей, фокус на первом', async ({ page }) => {
    await page.goto('/#zapyt');
    await page.locator('.lead__submit').click();
    await expect(page.locator('#lead-name-err')).toBeVisible();
    await expect(page.locator('#lead-contact-err')).toBeVisible();
    await expect(page.locator('#lead-name')).toBeFocused();
    await expect(page.locator('#lead-name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('заявка уходит в Telegram с нужными полями, пользователь видит «Дякуємо»', async ({ page }) => {
    const name = uid();
    await page.goto('/#zapyt');
    await page.fill('#lead-name', name);
    await page.fill('#lead-contact', '@iprint_test');
    await page.locator('.chip', { hasText: 'Друк на замовлення' }).click();
    await page.locator('.chip', { hasText: '50–200' }).click();
    await page.fill('#lead-comment', 'худі, принт на спині <b>тест</b>');
    await humanTime(page);
    await page.locator('.lead__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    const msg = (await telegramLog(page)).find((m) => m.method === 'sendMessage' && m.body.includes(name));
    expect(msg, 'сообщение дошло до Telegram').toBeTruthy();
    const body = JSON.parse(msg!.body);
    expect(body.chat_id).toBe('100');
    expect(body.parse_mode).toBe('HTML');
    expect(body.text).toContain('@iprint_test');
    expect(body.text).toContain('Друк на замовлення');
    expect(body.text).toContain('50–200');
    expect(body.text).toContain('&lt;b&gt;тест&lt;/b&gt;'); // HTML пользователя экранирован
    await expect(page.locator('#lead-name')).toHaveValue(''); // форма очищена
  });

  test('файл макета отправляется документом', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'достаточно одного движка');
    const name = uid();
    await page.goto('/#zapyt');
    await page.fill('#lead-name', name);
    await page.fill('#lead-contact', '093 901 30 50');
    await page.setInputFiles('#lead-file', { name: 'maket.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
    await humanTime(page);
    await page.locator('.lead__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    const log = await telegramLog(page);
    expect(log.find((m) => m.method === 'sendMessage' && m.body.includes(name))?.body).toContain('maket.pdf');
    expect(log.some((m) => m.method === 'sendDocument' && m.body.includes(name) && m.body.includes('maket.pdf'))).toBe(true);
  });

  test('неподходящий файл — понятная ошибка у поля', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'достаточно одного движка');
    await page.goto('/#zapyt');
    await page.fill('#lead-name', uid());
    await page.fill('#lead-contact', '0939013050');
    await page.setInputFiles('#lead-file', { name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('x') });
    await humanTime(page);
    await page.locator('.lead__submit').click();
    await expect(page.locator('#lead-file-err')).toBeVisible();
    await expect(page.locator('#lead-file-err')).toContainText('формат');
  });

  test('бот (заполнено скрытое поле) — Telegram ничего не получает', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'достаточно одного движка');
    const name = uid();
    await page.goto('/#zapyt');
    await page.fill('#lead-name', name);
    await page.fill('#lead-contact', '0939013050');
    await page.evaluate(() => { (document.querySelector('[name="website"]') as HTMLInputElement).value = 'spam'; });
    await humanTime(page);
    await page.locator('.lead__submit').click();
    await expect(page.locator('[data-lead-status]')).toContainText('Дякуємо');
    expect((await telegramLog(page)).some((m) => m.body.includes(name))).toBe(false);
  });

  test('без JavaScript форма тоже работает → страница «Дякуємо»', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'достаточно одного движка');
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const name = uid();
    await page.goto('/#zapyt');
    await page.fill('#lead-name', name);
    await page.fill('#lead-contact', '0939013050');
    await page.locator('.lead__submit').click();
    await expect(page).toHaveURL(/\/dyakuyemo\/$/);
    await expect(page.locator('h1')).toContainText('Дякуємо');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await ctx.close();
  });

  test('несуществующая страница — 404 с понятным текстом', async ({ page }) => {
    const res = await page.goto('/takoyi-storinky-nemaye/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('немає');
  });
});
