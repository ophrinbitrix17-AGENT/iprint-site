// Имитация Telegram Bot API для автотестов.
//  - хранит последние запросы (/__log);
//  - проверяет HTML-разметку сообщений так же строго, как Telegram (битые сущности/теги → 400);
//  - сбои по сигналу в данных: имя с «FAIL_TG» → sendMessage 500; файл «fail*.pdf» → sendDocument 500.
import http from 'node:http';
const log = [];

function htmlValid(text) {
  if (/&[a-z#0-9]*$/i.test(text)) return false;                       // обрезанная сущность в конце
  if (/&(?!(amp|lt|gt|quot);)/.test(text)) return false;             // неэкранированный &
  const tags = [...text.matchAll(/<\/?([a-z]+)[^>]*>/g)];
  const stack = [];
  for (const [full, name] of tags) {
    if (!['b', 'i', 'u', 's', 'a', 'code', 'pre'].includes(name)) return false;
    if (full.startsWith('</')) { if (stack.pop() !== name) return false; } else stack.push(name);
  }
  return stack.length === 0 && text.length <= 4096;
}

http.createServer((req, res) => {
  if (req.url === '/__health') return res.end('ok');
  if (req.url === '/__log') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(log)); }
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const method = req.url.split('/').pop();
    const fail = (code, description) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: false, description })); };
    if (method === 'sendMessage') {
      const data = JSON.parse(body);
      if (data.text.includes('FAIL_TG')) return fail(500, 'simulated failure');
      if (data.parse_mode === 'HTML' && !htmlValid(data.text)) return fail(400, "Bad Request: can't parse entities");
    }
    if (method === 'sendDocument' && /filename="fail[^"]*"/.test(body)) return fail(500, 'simulated file failure');
    log.push({ method, contentType: req.headers['content-type'], body: body.slice(0, 20000) });
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, result: {} }));
  });
}).listen(9911, '127.0.0.1');
