/**
 * iPrint — обработчик заявок с сайта: POST /api/lead → Telegram.
 * Всё остальное отдают статические файлы (dist/).
 *
 * Секреты (только в Cloudflare, не в коде):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — бот и чат для заявок;
 *   TURNSTILE_SECRET — защита от ботов (вместе с переменной сборки PUBLIC_TURNSTILE_SITEKEY).
 * Нет токена → ТЕСТОВЫЙ РЕЖИМ: заявка проверяется и принимается, но никуда не отправляется
 * (в лог пишется только факт и длины полей — без персональных данных).
 */

export interface Env {
  ASSETS: Fetcher;
  LEAD_LIMITER?: RateLimit;          // Cloudflare Rate Limiting (wrangler.jsonc → ratelimits)
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_API_BASE?: string;        // для автотестов (имитация Telegram); по умолчанию https://api.telegram.org
  TURNSTILE_SECRET?: string;
  LEAD_MAX_FILE_MB?: string;         // должен совпадать с site.json → lead.maxFileMb (проверяется тестом)
  LEAD_RATE_DISABLED?: string;       // '1' — только для автотестов
}

const FILE_EXT = ['pdf', 'ai', 'eps', 'svg', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'psd', 'cdr', 'zip', 'rar', '7z', 'webp'];
const LIMITS = { name: 80, contact: 120, comment: 1500, item: 80, items: 12, fileName: 120, page: 200 };
const MIN_FILL_MS = 2500;            // быстрее человек форму не заполнит
const TG_TIMEOUT_MS = 15_000;
const TG_FILE_TIMEOUT_MS = 60_000;   // загрузка файла до 20 МБ

type Lead = { name: string; contact: string; needs: string[]; qty: string; comment: string; page: string; file: File | null };
type ErrorCode = 'required' | 'contact-short' | 'file-size' | 'file-type' | 'captcha' | 'rate' | 'origin' | 'format' | 'too-large' | 'delivery';
type Result = { ok: true; test?: boolean; fileFailed?: boolean } | { ok: false; error: ErrorCode; field?: string };

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/lead') {
      if (req.method !== 'POST') return json({ ok: false, error: 'format' }, 405, { allow: 'POST' });
      return handleLead(req, env);
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;

async function handleLead(req: Request, env: Env): Promise<Response> {
  const wantsJson = (req.headers.get('accept') ?? '').includes('application/json');
  const maxMb = Number(env.LEAD_MAX_FILE_MB ?? '20');
  const respond = (r: Result, status = 200) => {
    if (wantsJson) return json(r, status);
    // без JavaScript: обычная отправка формы → отдельные статические страницы успеха / ошибки
    return Response.redirect(new URL(r.ok ? '/dyakuyemo/' : '/pomylka/', req.url).toString(), 303);
  };

  // Запрос только со своего сайта. Браузеры при POST присылают Origin; его отсутствие допускаем
  // (старые клиенты), а «null» и чужой адрес — отклоняем.
  const origin = req.headers.get('origin');
  if (origin !== null) {
    let sameHost = false;
    try { sameHost = new URL(origin).host === new URL(req.url).host; } catch { sameHost = false; }
    if (!sameHost) return respond({ ok: false, error: 'origin' }, 403);
  }

  // Слишком большой запрос — отказ до чтения тела в память
  const length = Number(req.headers.get('content-length') ?? '0');
  if (length > (maxMb + 1) * 1024 * 1024) return respond({ ok: false, error: 'too-large', field: 'file' }, 413);

  // Ограничение частоты: не больше N заявок в минуту с одного адреса
  if (env.LEAD_LIMITER && env.LEAD_RATE_DISABLED !== '1') {
    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
    const { success } = await env.LEAD_LIMITER.limit({ key: ip });
    if (!success) return respond({ ok: false, error: 'rate' }, 429);
  }

  let form: FormData;
  try { form = await req.formData(); } catch { return respond({ ok: false, error: 'format' }, 400); }

  // Ловушка для ботов: скрытое поле должно быть пустым.
  if (str(form.get('zx_extra'))) return respond({ ok: true });
  // Время заполнения считает браузер (не зависит от часов клиента). Нет поля — форма без JS, не проверяем.
  const elapsed = Number(str(form.get('e')));
  if (str(form.get('e')) !== '' && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) return respond({ ok: true });

  // Cloudflare Turnstile (если подключён)
  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, str(form.get('cf-turnstile-response')), req.headers.get('cf-connecting-ip'));
    if (!ok) return respond({ ok: false, error: 'captcha' }, 400);
  }

  const lead: Lead = {
    name: str(form.get('name')).slice(0, LIMITS.name),
    contact: str(form.get('contact')).slice(0, LIMITS.contact),
    needs: form.getAll('needs').map(str).filter(Boolean).slice(0, LIMITS.items).map((s) => s.slice(0, LIMITS.item)),
    qty: str(form.get('qty')).slice(0, LIMITS.item),
    comment: str(form.get('comment')).slice(0, LIMITS.comment),
    page: (req.headers.get('referer') ?? '').slice(0, LIMITS.page),
    file: null,
  };
  if (!lead.name) return respond({ ok: false, error: 'required', field: 'name' }, 400);
  if (!lead.contact) return respond({ ok: false, error: 'required', field: 'contact' }, 400);
  if (lead.contact.replace(/[^\p{L}\p{N}]/gu, '').length < 4) return respond({ ok: false, error: 'contact-short', field: 'contact' }, 400);

  const f = form.get('file');
  if (f instanceof File && f.size > 0) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (f.size > maxMb * 1024 * 1024) return respond({ ok: false, error: 'file-size', field: 'file' }, 400);
    if (!FILE_EXT.includes(ext)) return respond({ ok: false, error: 'file-type', field: 'file' }, 400);
    lead.file = f;
  }

  // Тестовый режим: бот ещё не подключён. В лог — без персональных данных.
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log('[lead:test-mode]', JSON.stringify({
      nameLen: lead.name.length, contactLen: lead.contact.length, needs: lead.needs.length,
      qty: Boolean(lead.qty), commentLen: lead.comment.length, file: lead.file ? lead.file.size : 0,
    }));
    return respond({ ok: true, test: true });
  }

  try {
    await tg(env, 'sendMessage', jsonBody({ chat_id: env.TELEGRAM_CHAT_ID, text: formatLead(lead), parse_mode: 'HTML', disable_web_page_preview: true }));
  } catch (e) {
    console.error('[lead:telegram-failed]', String(e));
    return respond({ ok: false, error: 'delivery' }, 502);
  }
  if (lead.file) {
    try {
      const fd = new FormData();
      fd.set('chat_id', env.TELEGRAM_CHAT_ID);
      fd.set('caption', `Файл до заявки: ${lead.name}`.slice(0, 1000));
      fd.set('document', lead.file, safeFileName(lead.file.name));
      await tg(env, 'sendDocument', { body: fd }, TG_FILE_TIMEOUT_MS);
    } catch (e) {
      // Текст заявки уже дошёл — не пугаем клиента ошибкой и не провоцируем дубль; предупреждаем менеджеров.
      console.error('[lead:file-failed]', String(e));
      await tg(env, 'sendMessage', jsonBody({ chat_id: env.TELEGRAM_CHAT_ID, text: `⚠️ Файл до заявки «${esc(lead.name)}» не надійшов — попросіть клієнта надіслати його ще раз.`, parse_mode: 'HTML' })).catch(() => {});
      return respond({ ok: true, fileFailed: true });
    }
  }
  return respond({ ok: true });
}

async function tg(env: Env, method: string, init: RequestInit, timeoutMs = TG_TIMEOUT_MS) {
  const api = `${env.TELEGRAM_API_BASE ?? 'https://api.telegram.org'}/bot${env.TELEGRAM_BOT_TOKEN}`;
  const r = await fetch(`${api}/${method}`, { method: 'POST', ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${method} ${r.status}`);
}

/** Текст для Telegram: каждое поле экранируется целиком, длина держится в пределах лимита (4096) за счёт комментария. */
export function formatLead(l: Lead): string {
  const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
  const build = (comment: string) => [
    '<b>🧾 Нова заявка з сайту iPrint</b>',
    `<b>Ім'я:</b> ${esc(l.name)}`,
    `<b>Контакт:</b> ${esc(l.contact)}`,
    l.needs.length ? `<b>Що потрібно:</b> ${esc(l.needs.join(', '))}` : '',
    l.qty ? `<b>Тираж:</b> ${esc(l.qty)}` : '',
    comment ? `<b>Коментар:</b>\n${esc(comment)}` : '',
    l.file ? `<b>Файл:</b> ${esc(safeFileName(l.file.name))} (${(l.file.size / 1024 / 1024).toFixed(1)} МБ) — надіслано нижче` : '',
    `<i>${esc(time)}${l.page ? ' · ' + esc(l.page) : ''}</i>`,
  ].filter(Boolean).join('\n');
  let comment = l.comment;
  let text = build(comment);
  while (text.length > 4000 && comment.length > 0) {
    comment = comment.slice(0, Math.max(0, comment.length - (text.length - 4000) - 10)) + (comment.length > 20 ? '…' : '');
    if (comment === '…') comment = '';
    text = build(comment);
  }
  return text;
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false;
  try {
    const fd = new FormData();
    fd.set('secret', secret);
    fd.set('response', token);
    if (ip) fd.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd, signal: AbortSignal.timeout(8000) });
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

const safeFileName = (n: string) => n.replace(/[\r\n\t]/g, ' ').slice(0, LIMITS.fileName);
const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsonBody = (o: unknown): RequestInit => ({ headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) });
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
