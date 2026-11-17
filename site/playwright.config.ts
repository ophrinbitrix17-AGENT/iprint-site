import { defineConfig, devices } from '@playwright/test';

/** Матрица из bible/Б4_ТЕСТИРОВАНИЕ.md: Chromium (Windows/Linux/Android), Firefox, WebKit (Safari/iPhone — приближение). */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: { baseURL: 'http://127.0.0.1:4321' },
  // Сайт + обработчик форм (локальный Cloudflare), Telegram подменён имитацией на :9911
  webServer: [
    { command: 'node tests/mock-telegram.mjs', url: 'http://127.0.0.1:9911/__health', reuseExistingServer: true },
    {
      command: 'npx wrangler dev --port 4321 --ip 127.0.0.1 --var TELEGRAM_BOT_TOKEN:test-token --var TELEGRAM_CHAT_ID:100 --var TELEGRAM_API_BASE:http://127.0.0.1:9911',
      url: 'http://127.0.0.1:4321', reuseExistingServer: false, timeout: 120_000, env: { WRANGLER_SEND_METRICS: 'false', CI: '1' },
    },
  ],
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],
});
