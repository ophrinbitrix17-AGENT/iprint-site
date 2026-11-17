# R3. GEO и SEO в конце 2026 года: практические правила для iprint.com.ua

Дата исследования: 17.11.2026. Язык сайта — украинский, стек — Astro (статический HTML), хостинг — Cloudflare Pages.

**Сила доказательств:**
- **[ОФ]** официальная документация или блог платформы (Google, OpenAI, Anthropic, Perplexity, Microsoft, Apple, Cloudflare);
- **[ИССЛ]** исследование: научная статья или анализ большой выборки от SEO-компании. Это корреляции, а не доказанные причины;
- **[ПРАКТ]** мнение практиков или вывод автора этого отчёта.

Цифры приведены только с источником. Номер в квадратных скобках, например [S1], ведёт в «Список источников» в конце файла.

---

## Главный вывод в одном абзаце

В 2026 году Google прямо называет «GEO/AEO» тем же SEO: ИИ-ответы Google строятся на том же поисковом индексе и тех же системах ранжирования [S1][S2]. Особые ИИ-файлы, «нарезка» текста на кусочки и специальная разметка «для ИИ» в Google ничего не дают [S2]. Работают четыре вещи:
1. Страницы отдаются чистым HTML, и ИИ-ботам не закрыт доступ.
2. Контент оригинальный и экспертный, ответ стоит в начале, есть факты и цифры.
3. Сущность «iPrint» описана ясно и одинаково везде.
4. О бренде говорят на сторонних сайтах: каталоги, отзывы, упоминания.

---

## 1. Как ИИ-системы выбирают и цитируют источники

- **Google AI Overviews и AI Mode** работают на основном индексе Google. Модель сама делает несколько связанных запросов по подтемам («query fan-out») и собирает из них ответ [S1][S2]. Чтобы попасть в ответ, страница должна быть проиндексирована и допущена к показу со сниппетом. Других требований нет [S1]. **[ОФ]**
  → Для iPrint классическое SEO — база GEO. Отдельной «ИИ-оптимизации» для Google не нужно.
- **Совпадение с топ-10 падает.** Ahrefs: в июле 2025 года 76 % цитат AI Overviews приходились на страницы из топ-10 по тому же запросу, в марте 2026 года — 38 % (863 тыс. ключевых слов, 4 млн URL) [S10]. SE Ranking: в AI Mode совпадение с органическим топ-10 составило 14 % по URL и 21,9 % по доменам [S11]. **[ИССЛ]**
  → Из-за fan-out ИИ цитирует страницы, которые отвечают на узкие подвопросы. Отсюда ставка на «Довідник»: много точных ответов на конкретные вопросы.
- **ChatGPT search** находит сайты через своего бота OAI-SearchBot [S5]. Запросы он переписывает и частично отправляет внешним поисковым провайдерам, среди них Bing [S7]. **[ОФ]**
  → Регистрируем сайт не только в Google Search Console, но и в Bing Webmaster Tools.
- **Copilot** использует индекс Bing. В Bing Webmaster Tools с февраля 2026 года есть отчёт «AI Performance» о цитированиях в Copilot и ИИ-сводках Bing [S16]. Microsoft подтверждала, что её модели используют schema-разметку для понимания контента [S17]. **[ОФ]** для отчёта; **[ОФ, устное заявление на конференции]** для разметки.
- **Gemini** при поиске в интернете опирается на Google Search (функция grounding в Gemini API) [S18]. **[ОФ]**
- **Perplexity** ведёт собственный поисковый индекс, его собирает PerplexityBot [S8]. **[ОФ]**
- **Claude** ищет через Brave Search: Brave значится в списке субподрядчиков Anthropic, и это подтвердили независимые тесты [S19]. Собственный бот для поиска — Claude-SearchBot [S6]. **[ОФ + журналистская проверка]**
  → Стоит один раз проверить, что сайт находится в Brave Search (search.brave.com).
- **Что повышает шанс цитирования (исследования):**
  - **Статья GEO (Princeton и др., KDD 2024).** Ссылки на источники, цитаты специалистов и статистика в тексте повышали видимость в ответах генеративных систем до 40 %. Набивка ключевыми словами почти не помогала [S12]. Эксперимент лабораторный (бенчмарк GEO-bench), эффект разный для разных тематик. **[ИССЛ]**
  - **Упоминания бренда.** Ahrefs (75 тыс. брендов): сильнее всего с появлением в AI Overviews коррелируют упоминания бренда в интернете, со ссылкой и без (0,664). Обратные ссылки дают только 0,218 [S13]. Это корреляция, а не причина. **[ИССЛ]**
  - **Свежесть.** Ahrefs (17 млн цитат): ChatGPT, Perplexity, Copilot и Gemini цитируют страницы в среднем на 25,7 % «моложе», чем страницы в обычной выдаче Google. Сильнее всех свежесть предпочитает ChatGPT. AI Overviews, наоборот, слегка тяготеют к более старым страницам. При этом средний возраст процитированной страницы — 2,9 года [S14]. **[ИССЛ]**
  - **Локальные запросы.** BrightLocal (опрос 1002 взрослых в США, 2026): доля людей, которые ищут местные компании через ChatGPT и другие ИИ, выросла с 6 % до 45 % [S20]. Insites (10 тыс. компаний): каталоги появляются в 35–39 % локальных ИИ-ответов [S20]. Данные американские и собраны компаниями, которые продают услуги локального SEO. **[ИССЛ, с оговоркой]**
  → Что делать на сайте iPrint:
  - в каждом ответе «Довідника» давать проверяемые факты: параметры, допуски, сроки, «від … грн», названия материалов;
  - цитировать технолога iPrint по имени;
  - ставить дату обновления;
  - параллельно работать над упоминаниями iPrint вне сайта (раздел 5).
- **Мнение Google о «накрутке» упоминаний:** упоминания действительно попадают в ИИ-ответы, но искусственно создавать их бесполезно, спам-системы это отсеивают [S2]. **[ОФ]**
  → Только настоящие упоминания: клиенты-бренды, партнёры, отраслевые медиа, отзывы.

## 2. Технические правила: доступ ИИ-ботов и чистый HTML

**Актуальные боты (по официальной документации):**

| Бот | Владелец | Зачем нужен | Что с ним делать |
|---|---|---|---|
| Googlebot | Google | Поиск, AI Overviews, AI Mode | Разрешить (обязательно) |
| Google-Extended | Google | Только обучение Gemini и grounding. **На поиск, AI Overviews и AI Mode не влияет** [S1][S3] | Разрешить (см. ниже) |
| OAI-SearchBot | OpenAI | Показ в ChatGPT search. Если его закрыть, сайт не попадёт в ответы [S5] | Разрешить (обязательно) |
| ChatGPT-User | OpenAI | Заходит на страницу по запросу пользователя. robots.txt «может не применяться» [S5] | Разрешить |
| GPTBot | OpenAI | Обучение моделей [S5] | Разрешить (см. ниже) |
| Claude-SearchBot | Anthropic | Индекс для поиска Claude [S6] | Разрешить (обязательно) |
| Claude-User | Anthropic | Заходит на страницу по запросу пользователя [S6] | Разрешить |
| ClaudeBot | Anthropic | Обучение [S6] | Разрешить (см. ниже) |
| PerplexityBot | Perplexity | Показ в поиске Perplexity, не обучение [S8] | Разрешить (обязательно) |
| Perplexity-User | Perplexity | Заходит по запросу пользователя, обычно игнорирует robots.txt [S8] | Разрешить |
| Bingbot | Microsoft | Bing и Copilot | Разрешить (обязательно) |
| Applebot / Applebot-Extended | Apple | Applebot — поиск и Siri. Applebot-Extended — не отдельный бот, а метка в robots.txt для запрета обучения [S9] | Разрешить |
| OAI-AdsBot | OpenAI | Проверка рекламных лендингов [S5] | Не важен |

- **Обучающих ботов (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended) тоже лучше разрешить.** Для компании, которая хочет, чтобы её знали, есть смысл в том, чтобы модели «помнили» iPrint и его термины и без поиска. Платного или секретного контента на сайте нет. **[ПРАКТ]**
  → robots.txt для iprint.com.ua:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://iprint.com.ua/sitemap-index.xml
  ```
  Отдельные правила для ИИ-ботов не нужны: правило `*` разрешает всё. Запрещать ничего не нужно, кроме служебных путей, если они появятся.
- **Ловушка Cloudflare.** У Cloudflare есть функции «managed robots.txt» и «Bot Preference Sync». Они дописывают в начало вашего robots.txt запреты для GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent и других, а в заголовок ставят `ai-train=no` [S21]. Поисковых ботов в этом списке нет, но обучающие будут закрыты. Кроме того, «AI Crawl Control» умеет блокировать ботов на уровне сервера. СМИ сообщают, что с 2025–2026 годов для новых доменов действуют более строгие настройки по умолчанию [S22]. **[ОФ + новости]**
  → После подключения домена откройте `https://iprint.com.ua/robots.txt` и проверьте, что там только наш текст. В панели Cloudflare убедитесь, что ИИ-боты не заблокированы. Это обязательный пункт чек-листа запуска.
- **ИИ-боты не выполняют JavaScript.** Vercel и MERJ проанализировали логи и выяснили: ни один крупный ИИ-краулер (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot и др.) не рендерит JS. Скрипты они скачивают, но не запускают [S23]. **[ИССЛ]** Google тоже советует семантический HTML и аккуратную работу с JS [S2]. **[ОФ]**
  → Astro отдаёт готовый HTML, и это правильный выбор. Правило: весь текст ответов, цены «від», сроки, контакты и JSON-LD должны быть в исходном HTML. Нельзя прятать ответы в аккордеоны, которые подгружают текст скриптом. Аккордеон на `<details>` с текстом прямо в HTML допустим.
- **Sitemap.** Bing отдельно подчёркивает роль sitemap с точными `lastmod` в эпоху ИИ-поиска [S24]. Google учитывает `lastmod`, только если дата стабильно точная [S25]. **[ОФ]**
  → Подключить `@astrojs/sitemap`. `lastmod` = дата реального изменения содержания страницы, а не дата сборки сайта.
- **IndexNow.** Протокол уведомляет Bing и другие поисковики об изменениях. Bing связывает его с актуальностью ИИ-ответов [S16][S17]. **[ОФ]**
  → Включить IndexNow, например через функцию Crawler Hints в Cloudflare или отправкой при сборке. Настройку проверим при публикации.
- **llms.txt — честный статус.**
  - Google: специальные ИИ-файлы и Markdown-версии не нужны, Google Search их игнорирует. Файл «не навредит и не поможет» видимости [S2]. **[ОФ]**
  - Ahrefs по логам: 97 % файлов llms.txt не получили ни одного запроса (май 2026). SE Ranking (~300 тыс. доменов): связи с цитированием нет [S26]. **[ИССЛ]**
  - Ни OpenAI, ни Anthropic, ни Perplexity в документации для владельцев сайтов не обещают использовать llms.txt [S5][S6][S8].
  → Не делаем как средство продвижения. Можно добавить позже как бесплатную мелочь (5 минут), но ничего от него не ждём.

## 3. Структурированные данные (schema.org, JSON-LD) в 2026 году

- **Что изменилось в Google:**
  - FAQ-сниппеты в выдаче отключены для всех сайтов с 7 мая 2026 года, документация по ним удалена [S27];
  - разметка HowTo перестала давать сниппеты ещё в 2023 году;
  - в июне 2025 года убраны 7 типов: Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing [S28];
  - в ноябре 2025 года добавились Practice Problems и другие [S28].
  **[ОФ]**
- **Для ИИ особой разметки нет.** Google: «structured data isn't required for generative AI search, and there's no special schema.org markup you need to add». Разметка должна совпадать с видимым текстом [S1][S2]. **[ОФ]** Microsoft, напротив, заявляла, что schema помогает её моделям понимать контент [S17]. **[ОФ, устно]**
  → Разметка нужна не ради «звёздочек в выдаче», а для однозначного описания сущности: кто мы, где, что делаем, сколько стоит, кто автор. Это дёшево, раз встроено в шаблоны.
- **Отзывы.** Google не показывает звёзды для отзывов, которые компания публикует о себе на своём сайте (так называемые self-serving reviews для LocalBusiness и Organization) [S29]. **[ОФ]**
  → Не размечать собственные отзывы как AggregateRating ради звёзд. Показывать на сайте реальные отзывы со ссылкой на Google-профиль.
- **Рекомендуемый набор JSON-LD для iPrint:**

| Где | Тип | Ключевые поля |
|---|---|---|
| Все страницы (одна общая сущность с `@id` `https://iprint.com.ua/#org`) | `LocalBusiness` (подтип Organization) | `name`, `alternateName`, `url`, `logo`, `image`, `description`, `telephone`, `email`, `address` (PostalAddress, Одеса), `geo`, `openingHoursSpecification`, `areaServed` (Україна), `sameAs` (все профили), `knowsAbout` (шовкотрафаретний друк, DTF, вишивка, флок, пошив) |
| Все страницы | `WebSite` | `name`, `url`, `inLanguage: "uk"`, `publisher` → `#org` |
| Все страницы, кроме главной | `BreadcrumbList` | путь страницы |
| Страницы услуг (5–6) | `Service` | `serviceType`, `provider` → `#org`, `areaServed`, `offers` → `Offer` + `PriceSpecification` (`minPrice`, `priceCurrency: "UAH"`) — **только если цена «від» утверждена владельцем** |
| Страницы технологий (4) | `Article` или `TechArticle` + `about` | `author` (Person), `datePublished`, `dateModified` |
| Статьи «Довідника» | `Article` + `FAQPage` (если на странице действительно вопросы и ответы) | `author`, даты, `mainEntity` (Question/Answer = видимый текст). FAQPage сниппетов в Google уже не даёт, но вреда нет [S27], и машинам он понятен |
| Кейсы | `Article` или `CreativeWork` | `about` → Service, фото, дата, клиент (только с согласия клиента) |
| Про нас | `AboutPage` + `Person` (технологи, основатель) | `jobTitle`, `worksFor` → `#org`, `sameAs` (LinkedIn и т. п.) |
| Контакты | `ContactPage` | — |
| DTF-трансферы в рулонах (если будет карточка с ценой за метр) | `Product` + `Offer` | цена, наличие. По желанию — Google Merchant Center [S2] |

  → Генерировать JSON-LD из тех же данных, что и видимый текст (`site/src/content/`). Тогда разметка и страница не разойдутся. Каждую страницу проверять через Rich Results Test и validator.schema.org. **[ПРАКТ]**

## 4. Архитектура «Довідника» (FAQ / база знаний)

- **Длина и «нарезка».** Google: идеальной длины страницы нет. Делить контент на мелкие куски специально для ИИ не нужно, системы сами находят нужный фрагмент длинной страницы [S2]. **[ОФ]** Bing советует понятные заголовки, таблицы, FAQ-блоки, примеры и данные [S16]. **[ОФ]**
- **Не плодить страницы-клоны.** Google прямо предупреждает: много вариаций страниц под ранжирование или ИИ-ответы может нарушать политику против массового контента («scaled content abuse») [S2][S30]. **[ОФ]**
  → Никаких «DTF друк Одеса / Київ / Львів» с одинаковым текстом. Одна сильная страница на тему.
- **Рекомендуемая структура — «хаб и спицы»:** **[ПРАКТ, согласуется с ОФ]**
  - **Хаб** `/dovidnyk/` — оглавление по темам: шовкотрафарет, DTF, вишивка, флок, пошив, тканини, підготовка макета, ціни й терміни, логістика.
  - **Тематические страницы** (например, `/dovidnyk/shovkotrafaret/`): 8–15 вопросов, у каждого свой `<h2>` с формулировкой вопроса, как его задаёт человек, и якорь для прямой ссылки.
  - **Отдельная страница** под вопрос, если на него стоит отвечать подробно (схемы, фото, таблица) и у него отдельный поисковый смысл. Например: «Шовкотрафарет чи DTF: що обрати для партії 50 футболок».
- **Формат ответа «сначала ответ»:** **[ПРАКТ + ИССЛ S12]**
  1. Первые 1–2 предложения сразу отвечают на вопрос, с цифрой или условием: «Мінімальний тираж шовкотрафарету — … шт.; дешевше за DTF він стає від … шт.» (цифры только от владельца).
  2. Затем пояснение: почему, от чего зависит.
  3. Таблица или список, если сравниваются варианты.
  4. Фото реальной работы с `alt`.
  5. Ссылка на услугу или технологию и на 2–3 связанных вопроса.
- **Цены и сроки.** **[ПРАКТ]**
  - Формат «від X грн за одиницю при тиражі від N шт.».
  - Прямо перечислять, от чего зависит цена: количество цветов или площадь, тираж, ткань.
  - Сроки — диапазоном: «зазвичай 5–10 робочих днів після погодження макета».
  - Рядом — «станом на [місяць рік]».
  Это проверяемые факты, которые ИИ охотно цитируют, а дата защищает от устаревших цитат. Без утверждённых владельцем цифр поле не заполняем (правило CLAUDE.md).
- **Свежесть и даты.** Google рекомендует показывать дату на странице и дублировать её в `datePublished` / `dateModified` [S31]. **[ОФ]** ИИ-ассистенты в среднем предпочитают более свежие страницы [S14]. **[ИССЛ]**
  → На каждой странице «Довідника» показывать «Оновлено: дата». Раз в квартал проверять цены и сроки. Менять дату только при реальном изменении содержания.
- **Авторство (E-E-A-T).** Google предлагает проверять контент вопросами «Кто? Как? Зачем?»: видно ли, кто автор, есть ли у него опыт, есть ли страница об авторе [S32]. **[ОФ]**
  → Под ответами — «Відповідає: [ім'я], технолог друку, стаж N років» со ссылкой на `/pro-nas/`. Добавить собственные фото процесса как доказательство опыта.
- **Перелинковка.** **[ОФ: S1 — «make content findable through internal links»]**
  → Каждая страница услуги ссылается на 3–6 вопросов «Довідника», каждый ответ — обратно на услугу. На главной — блок «Часті питання» со ссылками в «Довідник».
- **Источник вопросов.** **[ПРАКТ]**
  → Реальные вопросы клиентов из переписки (Telegram, Bitrix24), запросы из Search Console, подсказки Google. Плюс «вопросы ИИ»: спросить ChatGPT или Gemini, какие уточняющие вопросы задают о DTF или шовкотрафарете (это имитация fan-out).

## 5. Сущность бренда и локальные сигналы

- **Google Business Profile.** Google прямо называет актуальный Business Profile способом попасть в ИИ-ответы и результаты поиска [S1][S2]. **[ОФ]**
  → Завести или актуализировать профиль: категории, услуги, часы работы, фото цеха и работ. Регулярно просить клиентов оставлять отзывы и отвечать на каждый.
- **Одинаковые NAP (название, адрес, телефон).** **[ПРАКТ; ИССЛ S20 о роли каталогов]**
  → Записать один эталон: «iPrint», адрес в украинском написании, один основной телефон. Повторить его дословно на сайте (футер, «Контакти», JSON-LD), в GBP, Facebook, Instagram, LinkedIn, YouTube, Bing Places, Apple Business Connect (Apple Maps) и в 3–5 отраслевых каталогах Украины. Список каталогов подберём отдельно и проверим, какие из них живые.
- **sameAs.** Google рекомендует `sameAs` со ссылками на профили в соцсетях и сайтах отзывов [S33]. **[ОФ]**
  → Все официальные профили — в `sameAs` у `#org`.
- **Wikidata.** Объект можно создать, только если выполнены критерии значимости (Wikidata:Notability), например есть серьёзные публичные источники о компании [S34]. Влияние на ИИ-видимость документально не подтверждено. **[ПРАКТ]**
  → Низкий приоритет. Вернуться, когда появятся публикации о iPrint в СМИ.
- **Упоминания на сторонних сайтах** — самый сильный коррелирующий фактор по Ahrefs [S13]. **[ИССЛ]**
  → Кейсы с брендами-клиентами (со ссылкой на iPrint с их стороны), интервью или статьи в украинских медиа о моде и производстве, участие в маркетах и выставках, профили на площадках для брендов одежды.
- **Отзывы.** Опрос BrightLocal 2026 года (США) показывает рост доверия к рекомендациям ИИ. Whitespark сообщает, что ChatGPT объясняет свой выбор местных компаний прежде всего отзывами [S20]. **[ИССЛ, с оговоркой]**

## 6. Украинский язык

- **`lang` и hreflang.** Google не использует `lang` и hreflang, чтобы определить язык страницы, а hreflang нужен только при нескольких языковых версиях [S35]. **[ОФ]**
  → Ставим `<html lang="uk">` (код языка `uk`, не `ua`). Это нужно для доступности и других систем. hreflang не нужен: язык один.
- **Закон.** Сайты компаний, которые обслуживают потребителей в Украине, обязаны иметь украинскую версию, и она загружается по умолчанию (ст. 27 Закона про державну мову) [S36]. **[ОФ, правовой акт]**
- **Язык запросов.** Колонка «Української правди» (ноябрь 2025, Keyword Planner) оценивает долю украиноязычных запитов в 2025 году примерно в 65 %. На Юге она выросла с 22 % (2021) до 41 % (2025). Авторы предупреждают, что Google часто объединяет украинские и русские запросы как «близкие варианты» [S37]. **[ИССЛ, методика ограничена]**
  → Для Одессы русскоязычные запросы («шелкография Одесса», «печать на футболках Одесса») остаются значимой частью спроса. Сайт при этом только украинский.
- **Как ловить русские запросы, не ломая язык сайта:** **[ПРАКТ]**
  - Google сам сопоставляет близкие варианты [S37] и понимает синонимы [S2], поэтому основной путь — сильные украинские страницы.
  - Русские написания можно упомянуть естественно, один раз на странице. Например, в ответе «Що таке шовкографія»: «шовкографія (шовкотрафаретний друк; у побуті — „шелкография")».
  - То же в описании Google Business Profile.
  - Набивать страницы русскими ключами нельзя.
- **Варианты терминов** (это гипотезы для проверки в Keyword Planner и Search Console, не данные):
  - шовкотрафаретний друк / шовкографія / трафаретний друк;
  - DTF друк / ДТФ друк / DTF-трансфери / друк DTF на плівці в рулонах;
  - вишивка на одязі / машинна вишивка логотипу;
  - флок / флокований друк;
  - пошив одягу під бренд / пошив одягу на замовлення / виробництво одягу для брендів;
  - бірки, жакардові етикетки, брендовані стрічки.
  → Брать вариант, который люди реально ищут, в H1 и title. Остальные — в тексте и FAQ.
- **URL.** **[ПРАКТ]**
  → Латиница по официальной транслитерации (Постанова КМУ № 55 від 27.01.2010): `/poslugy/shovkotrafaretnyi-druk/`, `/dovidnyk/`. Короткие слаги, без кириллицы в адресах: кириллица в ссылках превращается в нечитаемые `%D1%88…`.

## 7. Переезд iprint.od.ua → iprint.com.ua

- **Редиректы.** Каждый старый URL — постоянным серверным редиректом 301 сразу на финальный новый адрес, без цепочек. Внутренние ссылки и canonical указывают на новый домен [S38]. **[ОФ]**
  → Старый сайт одностраничный: главная и все известные адреса старого сайта (якоря, `/index.php`, страницы Bitrix24) ведут на `https://iprint.com.ua/`. Варианты с www и без www, http и https — тоже. Список старых URL взять из Search Console старого домена и из веб-архива.
- **Change of Address.** Инструмент «Смена адреса» в Search Console: обе версии сайта подтверждены одним аккаунтом, это доменные ресурсы, главная редиректит 301 [S39]. **[ОФ]** В Bing Webmaster Tools есть аналог — «Site Move». **[ПРАКТ: проверить в интерфейсе]**
- **Сроки.**
  - Google: держать редиректы как можно дольше, обычно не меньше 1 года [S38];
  - в справке по Change of Address: минимум 180 дней и дольше, пока есть трафик, а домен оплачивать минимум год [S39];
  - для небольшого сайта перенос большей части страниц занимает несколько недель [S38].
  **[ОФ]**
  → Для iPrint: продлевать iprint.od.ua **без срока** (домен стоит копейки, ему 10+ лет, на старый адрес ведут ссылки, визитки и упоминания) и держать редиректы постоянно. Новый sitemap отправить в обе консоли.
- **Порядок.**
  1. Новый сайт готов и проиндексирован.
  2. Включаем редиректы.
  3. Подаём Change of Address.
  4. Обновляем адрес в GBP, соцсетях и каталогах (NAP из раздела 5).
  5. Просим партнёров со ссылками заменить адрес.
  **[ОФ+ПРАКТ]**

## 8. Как измерять GEO

- **Google Search Console → отчёт «Generative AI»:** показы URL сайта в AI Overviews, AI Mode и ИИ-функциях Discover. Разрезы — по страницам, странам, устройствам, датам. С 31.08.2026 доступен всем сайтам [S40]. **[ОФ]**
- **Bing Webmaster Tools → «AI Performance»:** цитирования в Copilot и ИИ-сводках Bing, «grounding queries» (фразы, по которым ИИ нашёл страницу), статистика по страницам [S16]. **[ОФ]**
- **GA4.**
  - В мае–июне 2026 года в стандартную группу каналов GA4 добавлен канал «AI Assistant». Полный список источников Google не опубликовал, и Perplexity или Copilot могут туда не попадать [S41]. **[новости по анонсу Google]**
  - Дополнительно — своя группа каналов с регулярным выражением по источнику, поставленная **выше** «Referral» [S42]. **[ПРАКТ]**:
    `(chatgpt\.com|chat\.openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|bing\.com/chat|deepseek\.com|grok\.com)`
  - Часть ИИ-переходов приходит без реферера и попадает в «Direct». ИИ-трафик считаем по нижней границе.
- **Ручной протокол проверки** (раз в месяц, 30 минут). **[ПРАКТ]**
  1. Фиксированный набор из 15–20 запросов на украинском и русском: «де замовити шовкотрафаретний друк на футболках в Одесі», «хто шиє одяг для бренду в Одесі», «DTF трансфери в рулонах Україна виробник», «шелкография Одесса цена», «шовкотрафарет чи DTF для 100 футболок».
  2. Прогнать их в ChatGPT (с поиском), Gemini, Google AI Mode, Perplexity, Copilot и Claude. Режим инкогнито или чистый аккаунт.
  3. Записать в таблицу: упомянут ли iPrint, есть ли ссылка, какие конкуренты и какие источники процитированы.
  4. Процитированные чужие источники — подсказка, где нужно появиться (каталоги, статьи).
- **Платные трекеры** (Ahrefs Brand Radar, Semrush AI Visibility и др.) на старте не нужны. Google предупреждает, что ни у одного стороннего инструмента нет доступа к его внутренним ИИ-системам [S2]. **[ОФ + ПРАКТ]**

## 9. Мифы и устаревшие приёмы

| Приём | Статус | Основание |
|---|---|---|
| Набивка ключевыми словами | Не работает ни в SEO, ни в GEO | Статья GEO: эффекта почти нет [S12]; спам-политики Google [S30] |
| «SEO-тексты» внизу страницы, «стены текста» | Бесполезны: Google понимает синонимы и смысл, специальные формулировки «под ИИ» не нужны | [S2] |
| Массовые ИИ-тексты и страницы под каждый город | Риск санкций за массовый контент. Сам ИИ не запрещён, запрещён бесполезный контент в масштабе | [S2][S30][S43] |
| llms.txt «для ИИ-поиска» | Google игнорирует, остальные не обещают использовать, по логам почти не запрашивается | [S2][S26] |
| «Нарезать» текст на мелкие куски | Не нужно, идеальной длины нет | [S2] |
| FAQ-разметка ради сниппетов в Google | Сниппеты отключены с 7.05.2026 | [S27] |
| Покупка или накрутка упоминаний | Отсеивается спам-системами | [S2] |
| Закрыть ИИ-ботов и при этом ждать ИИ-трафик | Без OAI-SearchBot / PerplexityBot / Claude-SearchBot сайта нет в их ответах | [S5][S6][S8] |
| «Google-Extended нужен для AI Overviews» | Неверно: на поиск и AI Overviews он не влияет | [S1][S3] |

---

## Краткий чек-лист для сайта iPrint

1. Astro: весь контент и JSON-LD в статическом HTML; `lang="uk"`; один H1; title и description на каждой странице.
2. robots.txt: всё разрешено плюс Sitemap. Проверить, что Cloudflare ничего не дописывает и не блокирует ИИ-ботов.
3. sitemap с честным `lastmod`, IndexNow, Google Search Console + Bing Webmaster Tools, проверка индексации в Brave.
4. JSON-LD: `LocalBusiness` (`#org`) + `WebSite` + `BreadcrumbList`; `Service` на услугах; `Article` (+`FAQPage`) с автором и датами в «Довіднику».
5. «Довідник»: хаб → тематические страницы с вопросами-H2 → отдельные страницы под большие вопросы. Сначала ответ, факты с цифрами, «Оновлено», автор-технолог, перелинковка с услугами.
6. Бренд вне сайта: Google Business Profile, один эталон NAP, профили и каталоги, отзывы, кейсы с клиентами, публикации.
7. Переезд: 301 по каждому URL, Change of Address, старый домен не отпускать.
8. Измерение: отчёт «Generative AI» в GSC, «AI Performance» в Bing, канал AI в GA4, ежемесячный ручной тест 15–20 запросов.

---

## Список источников

- [S1] Google Search Central — AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- [S2] Google Search Central — Optimizing your website for generative AI features on Google Search (15.05.2026): https://developers.google.com/search/docs/fundamentals/ai-optimization-guide ; анонс: https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- [S3] Google — Overview of Google crawlers (Google-Extended): https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- [S5] OpenAI — Overview of OpenAI crawlers: https://developers.openai.com/api/docs/bots
- [S6] Anthropic — Does Anthropic crawl data from the web…: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- [S7] OpenAI Help — ChatGPT search / for Enterprise and Edu: https://help.openai.com/en/articles/9237897 ; https://help.openai.com/en/articles/10093903
- [S8] Perplexity — Perplexity Crawlers: https://docs.perplexity.ai/guides/bots
- [S9] Apple — About Applebot: https://support.apple.com/en-us/119829
- [S10] Ahrefs — Update: 38% of AI Overview Citations Pull From The Top 10 (03.2026): https://ahrefs.com/blog/ai-overview-citations-top-10/ ; ранее: https://ahrefs.com/blog/search-rankings-ai-citations/
- [S11] SE Ranking — AI Mode research: https://seranking.com/blog/ai-mode-research/
- [S12] Aggarwal et al. — GEO: Generative Engine Optimization (KDD 2024): https://arxiv.org/abs/2311.09735
- [S13] Ahrefs — An Analysis of AI Overview Brand Visibility Factors (75K Brands): https://ahrefs.com/blog/ai-overview-brand-correlation/
- [S14] Ahrefs — AI Assistants Prefer to Cite "Fresher" Content (17M citations): https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/
- [S16] Bing Webmaster Blog — Introducing AI Performance in Bing Webmaster Tools (02.2026): https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- [S17] Search Engine Land — Microsoft Bing/Copilot use schema for its LLMs (SMX Munich 2025, F. Canel): https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455
- [S18] Google AI for Developers — Grounding with Google Search: https://ai.google.dev/gemini-api/docs/google-search
- [S19] TechCrunch — Anthropic appears to be using Brave to power web searches: https://techcrunch.com/2025/03/21/anthropic-appears-to-be-using-brave-to-power-web-searches-for-its-claude-chatbot/ ; Simon Willison: https://simonwillison.net/2025/Mar/21/anthropic-use-brave/
- [S20] Обзор локальных ИИ-исследований (BrightLocal 2026, Insites, Whitespark): https://news.designrush.com/ai-local-business-discovery-website-strategy ; https://insites.com/ai-whitepaper ; https://whitespark.ca/blog/want-to-rank-in-chatgpt-focus-on-these-review-sites-new-research/
- [S21] Cloudflare Docs — Managed robots.txt: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
- [S22] Help Net Security — Cloudflare changes AI crawler access rules (07.2026): https://www.helpnetsecurity.com/2026/07/02/cloudflare-ai-crawler-controls/
- [S23] Vercel — The rise of the AI crawler: https://vercel.com/blog/the-rise-of-the-ai-crawler
- [S24] Bing Webmaster Blog — Keeping Content Discoverable with Sitemaps in AI Powered Search (07.2025): https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search
- [S25] Google — Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- [S26] llms.txt: Ahrefs (97 % без запросов) — https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/ ; обзор с данными SE Ranking — https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026
- [S27] Google — FAQ (FAQPage) structured data, уведомления от 08.05.2026 и 15.06.2026: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- [S28] Google Search Central Blog — Simplifying the search results page (12.06.2025): https://developers.google.com/search/blog/2025/06/simplifying-search-results ; обновление 11.2025: https://developers.google.com/search/blog/2025/11/update-on-our-efforts
- [S29] Google — Review snippet structured data (self-serving reviews): https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- [S30] Google — Spam policies (scaled content abuse, keyword stuffing): https://developers.google.com/search/docs/essentials/spam-policies
- [S31] Google — Influencing your byline dates: https://developers.google.com/search/docs/appearance/publication-dates
- [S32] Google — Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- [S33] Google — Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization ; LocalBusiness: https://developers.google.com/search/docs/appearance/structured-data/local-business
- [S34] Wikidata:Notability: https://www.wikidata.org/wiki/Wikidata:Notability
- [S35] Google — Tell Google about localized versions of your page: https://developers.google.com/search/docs/specialty/international/localized-versions
- [S36] Закон України «Про забезпечення функціонування української мови як державної», ст. 27: https://zakon.rada.gov.ua/laws/show/2704-19
- [S37] Українська правда (Життя) — Українізація запитів, або якою мовою гуглять українці у 2025 році: https://life.pravda.com.ua/columns/ukrajinizaciya-zapitiv-abo-yakoyu-movoyu-guglyat-ukrajinci-u-2025-roci-311441/
- [S38] Google — Site moves with URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- [S39] Search Console Help — Change of Address tool: https://support.google.com/webmasters/answer/9370220
- [S40] Google Search Central Blog — Introducing Search Generative AI performance reports in Search Console (03.06.2026): https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- [S41] PPC Land — Google Analytics adds AI Assistant channel: https://ppc.land/google-analytics-adds-ai-assistant-channel-for-chatgpt-gemini-claude/
- [S42] Loves Data — How to track AI traffic in GA4: https://www.lovesdata.com/blog/how-to-track-ai-traffic-ga4/
- [S43] Google Search Central Blog — Google Search's guidance about AI-generated content (02.2023): https://developers.google.com/search/blog/2023/02/google-search-and-ai-content

*Примечание о проверке. Источники [S1], [S2], [S5], [S6], [S8], [S16], [S21], [S27], [S38], [S39], [S40] прочитаны напрямую. Остальные подтверждены через поисковую выдачу и вторичные обзоры. Цифры из исследований SEO-компаний — корреляции на их выборках, преимущественно англоязычных и американских. Для украинского рынка это ориентир, а не гарантия.*
