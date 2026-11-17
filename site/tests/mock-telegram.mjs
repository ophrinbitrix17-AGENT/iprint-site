// Имитация Telegram Bot API для автотестов: принимает sendMessage/sendDocument, хранит последние запросы.
import http from 'node:http';
const log = [];
http.createServer((req, res) => {
  if (req.url === '/__health') return res.end('ok');
  if (req.url === '/__log') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(log)); }
  if (req.url === '/__reset') { log.length = 0; return res.end('ok'); }
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    log.push({ method: req.url.split('/').pop(), contentType: req.headers['content-type'], body: body.slice(0, 5000) });
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, result: {} }));
  });
}).listen(9911, '127.0.0.1');
