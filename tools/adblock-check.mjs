import fs from 'fs'; import path from 'path';
// Проверка: не прячут ли блокировщики рекламы элементы сайта. Списки скачать в папку (аргумент 1), сайт собрать (dist — аргумент 2).
// node tools/adblock-check.mjs <папка-со-списками> site/dist   (списки: easylist.txt, agru.txt, agbase.txt, agann.txt)
const T=process.argv[2]||process.env.TEMP; let rules=[];
for (const f of ['easylist.txt','agru.txt','agbase.txt','agann.txt']) rules.push(...fs.readFileSync(T+'/'+f,'utf8').split('\n').filter(l=>l.startsWith('##')).map(l=>l.slice(2).trim()));
const ids=new Set(rules.filter(r=>/^#[\w-]+$/.test(r)).map(r=>r.slice(1)));
const cls=new Set(rules.filter(r=>/^\.[\w-]+$/.test(r)).map(r=>r.slice(1)));
const attr=rules.map(r=>r.match(/^(?:\w+)?\[(id|class)([\^*$]?)="([^"]+)"\]$/)).filter(Boolean);
const files=[]; (function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f); fs.statSync(p).isDirectory()?walk(p):p.endsWith('.html')&&files.push(p)}})(process.argv[3]||'dist');
const hits=new Set(); const test=(k,val)=>{for(const [,ak,op,v] of attr){ if(ak!==k) continue; if((op==='^'&&val.startsWith(v))||(op==='*'&&val.includes(v))||(op==='$'&&val.endsWith(v))||(op===''&&val===v)) hits.add(`[${ak}${op}="${v}"] ~ ${val}`);}};
for(const f of files){const h=fs.readFileSync(f,'utf8');
 for(const m of h.matchAll(/\sid="([^"]+)"/g)){ if(ids.has(m[1])) hits.add('#'+m[1]); test('id',m[1]); }
 for(const m of h.matchAll(/\sclass="([^"]+)"/g)){ for(const c of m[1].split(/\s+/)) if(cls.has(c)) hits.add(f+' .'+c); test('class',m[1]); } }
console.log('rules',ids.size,cls.size,attr.length); console.log([...hits].join('\n')||'clean');
