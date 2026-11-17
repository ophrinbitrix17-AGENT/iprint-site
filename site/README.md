# Сайт iPrint — код (Astro 7)

## Команды (из папки `site/`)
| Команда | Что делает |
|---|---|
| `npm run dev` | Локальный просмотр с автообновлением: http://localhost:4321 |
| `npm run build` | Сборка в `dist/`. **По умолчанию — превью: закрыто от индексации** (meta robots + `X-Robots-Tag` в `_headers`) |
| `SITE_ENV=production npm run build` | **Боевая** сборка для iprint.com.ua: индексация разрешена |
| `npm run preview` | Показ собранного `dist/` на http://127.0.0.1:4321 |
| `npx playwright test --project=desktop-chrome --project=desktop-safari --project=android --project=iphone --project=tablet` | Автотесты (Firefox на этой машине Windows не запускается — гоняется в CI на Linux) |

## Где что лежит
- `src/styles/themes/2026-11.css` — **файл стиля** (все цвета, шрифты, размеры). Рестайлинг = новый файл + смена импорта в `src/layouts/Base.astro`.
- `src/content/site.json` — данные компании, меню, тексты интерфейса.
- `src/content/home.json` — тексты главной (поля `_todo` — пометки, на сайт не выводятся).
- `src/content/images.json` — реестр фото: файл → блок → источник.
- `src/assets/images/` — фото (исходники; размеры и форматы под экраны Astro делает сам).
- `src/components/` — блоки страницы. Карточки выводятся из данных — любое число.
- `tests/` — автотесты (Б4). Скриншоты прогона — `screenshots/` (не в git).
- `scripts/postbuild.mjs` — заголовки `_headers` после сборки.

## Перед боевым запуском убрать
Все метки `ФОТО ТИМЧАСОВЕ`, `ДОРАБОТАТЬ`, `скоро`; заполнить `telegram`, `instagram`, новый e-mail в `site.json`.
