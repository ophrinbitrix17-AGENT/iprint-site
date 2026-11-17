/**
 * iPrint — обработчик заявок с сайта: POST /api/lead → Telegram.
 * Всё остальное отдают статические файлы (dist/).
 *
 * Секреты (только в Cloudflare, не в коде):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — бот и чат для заявок;
 *   TURNSTILE_SECRET — защита от ботов (необязательно).
 * Нет токена → ТЕСТОВЫЙ РЕЖИМ: заявка проверяется и принимается, но никуда не отправляется.
 */

export interface Env {
  ASSETS: Fetcher;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_API_BASE?: string; // для автотестов (подмена Telegram); по умолчанию https://api.telegram.org
  TURNSTILE_SECRET?: string;
  LEAD_MAX_FILE_MB?: string;
}

const FILE_EXT = ['pdf', 'ai', 'eps', 'svg', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'psd', 'cdr', 'zip', 'rar', '7z', 'webp'];
const LIMITS = { name: 80, contact: 120, comment: 2000, item: 80, items: 12 };

type Lead = { name: string; contact: string; needs: string[]; qty: string; comment: string; page: string; file: File | null };
type Result = { ok: true; test?: boolean } | { ok: false; error: string; field?: string };

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/lead') {
      if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      return handleLead(req, env);
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;

async function handleLead(req: Request, env: Env): Promise<Response> {
  const wantsJson = (req.headers.get('accept') ?? '').includes('application/json');
  const respond = (r: Result, status = 200) => {
    if (wantsJson) return json(r, status);
    // без JavaScript: обычная отправка формы → страница результата
    const to = r.ok ? '/dyakuyemo/' : `/dyakuyemo/?pomylka=${encodeURIComponent(r.ok ? '' : r.error)}`;
    return Response.redirect(new URL(to, req.url).toString(), 303);
  };

  // запрос только со своего сайта
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) return respond({ ok: false, error: 'origin' }, 403);

  let form: FormData;
  try { form = await req.formData(); } catch { return respond({ ok: false, error: 'format' }, 400); }

  // ловушка для ботов: скрытое поле должно быть пустым; слишком быстрое заполнение — бот
  if (str(form.get('website'))) return respond({ ok: true });
  const started = Number(str(form.get('t')));
  if (started && Date.now() - started < 2500) return respond({ ok: true });

  // Cloudflare Turnstile (если подключён)
  if (env.TURNSTILE_SECRET) {
    const token = str(form.get('cf-turnstile-response'));
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, req.headers.get('cf-connecting-ip'));
    if (!ok) return respond({ ok: false, error: 'captcha' }, 400);
  }

  const lead: Lead = {
    name: str(form.get('name')).slice(0, LIMITS.name),
    contact: str(form.get('contact')).slice(0, LIMITS.contact),
    needs: form.getAll('needs').map(str).filter(Boolean).slice(0, LIMITS.items).map((s) => s.slice(0, LIMITS.item)),
    qty: str(form.get('qty')).slice(0, LIMITS.item),
    comment: str(form.get('comment')).slice(0, LIMITS.comment),
    page: (req.headers.get('referer') ?? '').slice(0, 200),
    file: null,
  };
  if (!lead.name) return respond({ ok: false, error: 'required', field: 'name' }, 400);
  if (!lead.contact || lead.contact.replace(/[^\p{L}\p{N}]/gu, '').length < 4) return respond({ ok: false, error: 'required', field: 'contact' }, 400);

  const f = form.get('file');
  if (f instanceof File && f.size > 0) {
    const maxMb = Number(env.LEAD_MAX_FILE_MB ?? '20');
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (f.size > maxMb * 1024 * 1024) return respond({ ok: false, error: 'file-size', field: 'file' }, 400);
    if (!FILE_EXT.includes(ext)) return respond({ ok: false, error: 'file-type', field: 'file' }, 400);
    lead.file = f;
  }

  // тестовый режим: бот ещё не подключён
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log('[lead:test-mode]', JSON.stringify({ ...lead, file: lead.file ? { name: lead.file.name, size: lead.file.size } : null }));
    return respond({ ok: true, test: true });
  }

  try {
    await sendToTelegram(env, lead);
    return respond({ ok: true });
  } catch (e) {
    console.error('[lead:telegram-failed]', String(e));
    return respond({ ok: false, error: 'delivery' }, 502);
  }
}

async function sendToTelegram(env: Env, lead: Lead) {
  const api = `${env.TELEGRAM_API_BASE ?? 'https://api.telegram.org'}/bot${env.TELEGRAM_BOT_TOKEN}`;
  const text = formatLead(lead);
  const r1 = await fetch(`${api}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!r1.ok) throw new Error(`sendMessage ${r1.status}`);
  if (lead.file) {
    const fd = new FormData();
    fd.set('chat_id', env.TELEGRAM_CHAT_ID!);
    fd.set('caption', `Файл до заявки: ${lead.name}`.slice(0, 1000));
    fd.set('document', lead.file, lead.file.name);
    const r2 = await fetch(`${api}/sendDocument`, { method: 'POST', body: fd });
    if (!r2.ok) throw new Error(`sendDocument ${r2.status}`);
  }
}

export function formatLead(l: Lead): string {
  const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
  const rows = [
    '<b>🧾 Нова заявка з сайту iPrint</b>',
    `<b>Ім'я:</b> ${esc(l.name)}`,
    `<b>Контакт:</b> ${esc(l.contact)}`,
    l.needs.length ? `<b>Що потрібно:</b> ${esc(l.needs.join(', '))}` : '',
    l.qty ? `<b>Тираж:</b> ${esc(l.qty)}` : '',
    l.comment ? `<b>Коментар:</b>\n${esc(l.comment)}` : '',
    l.file ? `<b>Файл:</b> ${esc(l.file.name)} (${(l.file.size / 1024 / 1024).toFixed(1)} МБ) — надіслано нижче` : '',
    `<i>${esc(time)}${l.page ? ' · ' + esc(l.page) : ''}</i>`,
  ];
  return rows.filter(Boolean).join('\n').slice(0, 4000);
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false;
  const fd = new FormData();
  fd.set('secret', secret);
  fd.set('response', token);
  if (ip) fd.set('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd });
  const data = (await r.json()) as { success?: boolean };
  return data.success === true;
}

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
