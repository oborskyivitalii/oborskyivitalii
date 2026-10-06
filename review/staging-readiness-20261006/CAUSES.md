# Причини збоїв і виправлення — 6 жовтня 2026

Продовження в тому самому PR #23: браузери тепер виконують повні functional,
navigation і analytics leases послідовно. Спостереження On/print/visibility та
fallback чекають справжнього paint/стану в початковому 1500 мс, без старого
180 мс race. Desktop ribbons отримують наявний detailTier; tier 0 і всі mobile
вершини лишаються точними. Зайві stroke setters для суто залитих граней прибрано.
Ліміти, cadence, hold і всі 390 Linux scenarios не послаблено.

Холодні тести [37483016304](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37483016304)
зберігають 8 observations і 5 початкових невдач. Вимкнення Canvas submission,
атмосферних CSS writes або малий bitmap не прибирають довгий запитаний RAF.
[CAUSE-FIX-NATIVE.json](CAUSE-FIX-NATIVE.json) зберігає всі результати та raw SHA.

Наступне порівняння [37484704942](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37484704942)
дає 6 observations і 2 початкові невдачі. На одному типі CPU EPYC 7763 звичайний
WPE чекає RAF №2 2457 мс і падає; звичайний GTK чекає 118 мс і проходить.
Обидва окремі холодні GTK trials проходять (90/118 мс). Еквівалентний 2D CSS
на WPE також падає (2374 мс), тому його не впроваджено як remedy.
Linux functional WebKit тепер запускає desktop GTK на власному Xvfb, без warmup,
retry чи зміни браузерних дедлайнів. Це підтримане виправлення CI port; точний
символ нативної бібліотеки/драйвера ще не локалізовано.
[CAUSE-FIX-PORTS.json](CAUSE-FIX-PORTS.json) містить порівняння та provenance.

Валідні Research pairs того самого run зберігають усі 12 LHR/Trace/DevtoolsLog.
Normal TBT reference 120.5/96.5/103.5 проти candidate 130.5/130/123 мс:
медіана 103.5→130 мс не доводить приросту від Canvas-state зміни. У жодному trial
немає вихідної задачі >30 мс після 500 мс; старі пізні 102/153 мс не відтворились,
їхніх історичних стеків усе ще немає. Profiled цифри не є acceptance.
[CAUSE-FIX-RESEARCH.json](CAUSE-FIX-RESEARCH.json) зберігає ці межі висновку.

Нова перевірювана оптимізація палітри кешує точний RGB результат замість дробового
tint string. Кольори кожної грані byte-identical для 5 routes × 2 details × 3
palettes; геометрія й світлова арифметика не змінюються. Парні normal та окремі
CPU trials проти 614c3e5 ще потрібні для виміряного ефекту.

Static preflight цього run падає на complexity collector та 217 нових checksum
candidates; перевірено їхню exact provenance, без blanket exclusion, попередні
3986 dispositions збережено. Collector розділено без зміни метрик/flags.
Native perf не запустив браузер через root cache path, потім не завантажив
root-owned файл. Цей запуск не дає browser CPU evidence; шлях/runner UID і
гарантоване повернення ownership виправляються в окремій scoped confirmation.

Повний exact-head staging, stable verification і merge ще не завершено.
Наведені нижче записи — історія первинної діагностики; її початковий
analysis-only статус не скасовує поточне доручення виправляти.

## Первинна діагностика

Основна підтверджена причина зупинок Firefox — конкуренція трьох браузерів на
одному CI runner, яка збільшує час Canvas-малювання і запускає захист рушія.
Холодний збій WebKit має інший механізм. Для Research знайдено дорогі функції,
але стек конкретного старого пізнього піку не збережено.

| Проблема | Доказ | Висновок і межі |
| --- | --- | --- |
| Firefox: камера/анімація зупиняються | Контроль сам: медіана/p95 кадру 16/28 мс, сценарій проходить. З Chromium і WebKit: 41/92 мс, сценарій падає. | Дорогі кадри піднімають tier до 2; slow>=16 і кадр>50 мс встановлюють hold і скасовують RAF. Рушій не падає з помилкою; спрацьовує його політика захисту. |
| Адаптація не прибирає достатньо роботи | Desktop ribbons не отримують detailTier і лишають крок 1.25. Приватна адаптація знижує медіану граней 238→99 і кадру 41→23 мс. | Це підтверджений пропуск адаптації. Проте кандидат також зупиняється, тому одного спрощення стрічок недостатньо. Найбільша виміряна стадія Firefox — Canvas paint. |
| WebKit: після першого кадру довга пауза | Перший окремий запуск: RAF №2 запитано о 439 мс, виконано о 2914 мс. Протягом останніх 1670 мс очікування записано 33 таймерні сигнали, максимальна відстань між ними 56 мс. | Запит не загублено/не скасовано, hold=false, enabled=true, failed=false, сторінка видима й у фокусі. Затримка холодного браузерного rendering/presentation відтворюється навіть без інших браузерів. Конкретний нативний компонент/драйвер не визначено. |
| Research: високий/нестабільний Lighthouse TBT | CPU-профіль: worldFor/instance і paintColors у першому frame; далі projectedWorld/appendFaces/appendLines та paintShapes/drawLineRun. Нові діагностичні TBT 129/248/52 мс. | Є дорога підготовка геометрії/кольорів та повторне CPU/Canvas-малювання. Це процедурні моделі, не завантажені 3D-файли. Старі пізні задачі 102.142/153.478 мс близько 2.5 с не мають збережених стеків; приписувати їх лише першому кадру чи лише CI-шуму не можна. |

## Що саме показує захист Firefox

`site/engine/lifecycle.cjs`: повторні `cost>25` накопичують slow; на tier 2,
після cooldown, `slow>=16 && cost>50` встановлює hold і викликає cancel.
Контроль з фоновими браузерами зупиняється о 15.243 с на кадрі 58 мс/slow 23.
Адаптивні стрічки зупиняються о 25.507 с на 56 мс/slow 28 та повторно о 53.032 с
на 62 мс/slow 22 після справжнього публічного відновлення. Кінцевий стан обох
loaded trials: enabled=true, failed=false, hold=true, pending=null.
Фонові браузери справді малюють; одного часу життя процесу для цього висновку
не використано. `tools/quality/functional.cjs` запускає engines паралельно на
спільному runner через Promise.allSettled.

## Research: що підтверджено і що залишилось невідомим

На normal Color bytes профіль показує виклики першого frame тривалістю
41.791/73.404/31.760 мс. У найдорожчому є рекурсивне створення worldFor/instance,
підготовка faceColors, проєкція/малювання і MinorGC 5.146 мс. Упродовж capture
всі три профілі мають найбільші авторські self-витрати у paintShapes/drawLineRun;
inclusive-витрати draw включають значну проєкцію visibleRooms/projectedWorld.
Час sampled stacks приблизний і не є окремим точним виміром native Canvas CPU.

Lighthouse за замовчуванням моделює мобільні умови. TBT — сума блокування задач
після FCP у його розрахунковому вікні; це не тривалість одного callback.
`long-tasks` містить simulated durations, а `main-thread-tasks` — вихідні задачі.
Це перевірено за [кодом pinned Lighthouse 13.5.0](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/core/audits/long-tasks.js).
Повний старий прогін мав TBT 327/36/676.5 мс і невдалу медіану 327 мс при ліміті 200.
Новий профіль працював на loopback і іншому runner, з CPU instrumentation;
він локалізує роботу, а не замінює попереднє приймальне вимірювання.

## Порядок виправлень

1. Ізолювати browser engines у CI на окремі runners або виконувати послідовно,
   зберігши всі 390 Linux scenarios, navigation/analytics та їхні вимоги.
   [Офіційна рекомендація Playwright](https://playwright.dev/docs/ci) також
   вимагає достатньої ізоляції ресурсів для стабільних CI-тестів.
2. Зменшити підтверджені CPU/Canvas-витрати: підготовка world/faceColors у першому
   кадрі, проєкція/малювання у наступних і участь ribbons в адаптації. Зміни
   потребують перевірки тієї самої геометрії, якості й звичайного runtime.
   Саме адаптація стрічок не є достатнім перевіреним виправленням.
3. WebKit перевіряти як окрему холодну нативну затримку. Збільшення timeout,
   примусовий таймерний paint або повторне вмикання не доводять усунення причини.
4. Зберігати trace кожного normal Research/mobile Lighthouse trial, щоб наступний
   пізній outlier мав дані GC/JIT/native/RAF. Це вже додано в collector без
   CPU-profiler categories, зміни метрик, порогів чи кількості trials.

## Докази й статус

- [Основна діагностика 37473674941](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37473674941):10 валідних observations,2 оригінальні невдачі Firefox; артефакт 11417899005.
- [Уточнення 37476487993](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37476487993):4 валідні WebKit observations,1 оригінальний timeout;3 CPU-профілі Research. Артефакти 11418549003/11418778661.
- [BROWSER-CAUSES.json](BROWSER-CAUSES.json) та [CAUSE-ATTRIBUTION.json](CAUSE-ATTRIBUTION.json): exact source/public identity, raw SHA, кадри, переходи hold, таймери та стеки.

Обидва тимчасові PR-тригери діагностики видалено після збору. Public site/runtime
не змінено. Повний staging не пройдено, stable не просунуто, PR #23 не merged.
Зелений статус diagnostic collection означає збереження доказів, включно з
невдалими scenarios; він не означає готовність релізу.
