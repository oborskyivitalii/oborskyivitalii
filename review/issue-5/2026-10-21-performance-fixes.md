# Issue 5 / PR 79 — причини, виправлення і остаточний performance-звіт

21 жовтня 2026. Поточний результат: **PASS повного локального суворого performance-набору** на чистому `7fbb0bc2320b2758f70c806057275878cb263c54` (Q4), tree `086932a657ab56725fd4d7dcd5fdd70d312b30eb`.

Мобільний LCP читача: **2400,942 мс**, бюджет 2500 мс. Три спроби: 2411,160 / 2400,924 / 2400,942 мс. Запас медіани — 99,058 мс. Усі три спроби проходять. Reader TBT: 47 / 118 / 113 мс; CLS0. Desktop LCP median521,110 мс. Збережено всі36 Lighthouse-вимірів,72 короткі motion-вікна,24 перельоти,120 циклів утримання ресурсів та10 soak-вікон із300,0833с реальних спостережень.

Власник: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), виконання в [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79). [PR113](https://github.com/oborskyivitalii/oborskyivitalii/pull/113) вже merged як `c4ed3dad7197bef2f9638c9500d66c12606f6eff`; це історична передумова. Scope та остаточні receipts: [issue anchor](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6308024785), [PR anchor](https://github.com/oborskyivitalii/oborskyivitalii/pull/79#issuecomment-6308025083).

## Підтверджені причини й виправлення

| Знахідка | Доказ і наслідок | Виправлення / стан |
| --- | --- | --- |
| RF03 High: активні DOM-клони обходили lazy loading | Q3 завантажував усі8 зображень/746104B. Запити7 дальніх слайдів ініціював `extract()` при клонуванні в активний ownerDocument, хоча оригінальні img.complete лишалися false. Початкова lazy-політика сама по собі не усунула причину. | `site/engine/navigation.js`: один інертний HTMLDocument для кешу **і prepare**, native adoption тільки при mount. Явне rebasing через sourceURL/getAttribute збережено. Усі6 фінальних reader LHR мають1 image-запит — cover,226363B загального transfer. |
| RF04 High: пропущений media-query event залишав Canvas активним | Фіксована діагностика дала1FAIL/4PASS: captured і49 fresh MQLtrue, Motion:on,61 додатковий paint, без event/pageerror. Старий регресійний тест продовжував phase880 замість80. | `site/engine/lifecycle.cjs`: frame перевіряє actual reduced.matches до layout/draw і використовує наявний preference handler. Пізня дубльована disabled-подія не додає RAF. Saved On збережено. Регресія,5 фіксованих browser-preflight і повний остаточний набір проходять без збільшення2с waiter. |
| RF05 Medium: тест міг прийняти неповні image-request докази | Окремий reviewer показав vacuous PASS для images:[]/пропущеного URL та пропуск capability при відсутньому optional engine. | Кожна native/Back/SPA фаза звіряє повний URL multiset із reader inventory, включно з повторами; engine fallback береться з recorded head. Негативні тести збережено. |
| RF01/RF02 Medium: початкові producer/registry помилки | Обчислення appendices раніше furtherReading не відповідало DOM-порядку першого зображення. Історичний registry не допускав нову ідентичність за незмінних runtime bytes. | Render-порядок виправлено; перше показане зображення й cover eager, наступні lazy. Нові точні plain/staging/production descriptors, обов’язкові rights IDs; історичні descriptors збережено. |

Точні власники, стиль CS01–CS10, регресії та independent receipts: [versioned implementation record на Q4](https://github.com/oborskyivitalii/oborskyivitalii/blob/7fbb0bc2320b2758f70c806057275878cb263c54/review/issue-5/2026-10-21-reader-loading.md). Сцени, ефекти, camera clock, оригінальні image URLs/pixels/dimensions і performance-бюджети не переписувалися.

## Причинна перевірка та збережені невдачі

| Вхід / роль | Mobile LCP median | Що це доводить |
| --- | ---: | --- |
| Історичний фактично staged R18, source283b32f | 4202,636 мс — FAIL | Початковий повний аудит; усі raw збережено в попередньому evidence commit9147eccc. |
| Початкова lazy-корекція Q3 `1940cf4`, R18 | 3376,6775 мс — FAIL | Перша повна спроба **не пройшла**. Primary LH30PASS, primary motion зупинився після7 завершених профілів на Writing390/CPU1 Reduced waiter. Reader6LH/12motion зібрано незалежно. Перельоти, retention і soak у цій спробі не виконані; її не називаємо повною72-window матрицею. |
| Counterbalanced R18/Q3 baseline,3 спроби | 3377,345 мс | Той самий текст/cover/LCP paragraph/CLS0;8 image-запитів. |
| Той самий R18, інертний cache extract,3 спроби | 2401,136 мс | Причинне порівняння:1 image-запит/227589B при незмінних eager cover+7lazy. Це діагностика, не приймання фінального runtime. |
| Той самий R18, loading перед src,3 спроби | 2401,645 мс | Альтернатива залежить від порядку атрибутів; обрано явний інертний owner. Transfer245070B, бо ще лишався detached SVG fallback. |
| Остаточний Q4 + чинний R19 | **2400,942 мс — PASS** | Прийнята локальна performance-матриця точного фінального артефакту. |

Окрема9-trial cover-only діагностика дала baseline3376,625, lazy-cover3226,596 і low-priority eager-cover3151,938мс, завжди8 image-запитів. Це не було достатнім виправленням. Разом scheduling+clone controls —18 спроб (9+9), усі включено. Перший extract-only browser-preflight також провалився через активний prepared clone; його залишено, після чого виправлено `prepare()`.

Початкові invalid-alt/RF01, відсутній historical Git blob, stale runtime family, RI-map formatting, VM fixture та lint-complexity помилки з їхніми корекціями теж збережено. Один Q4 source-check process перервано розривом exec-server до завершення першого рядка; empty log/interruption record не зараховано як PASS. Чисті source checks відновлено окремо. Фінальна Q4 performance-матриця запускалася **один раз**, без повторного добору samples.

## R19 та межа порівняння

Під час роботи PR79 просунувся до авторського R19 commit `7f64b948c1d60395d6e5a2356906485b1c437325`. Q4 має батьків Q3 та R19; усі8 неметаданих файлів R19 byte-identical до авторського commit. R19 обирає cover+3 слайди замість7 за попереднім редакційним рішенням; усі deck assets лишилися. Це скорочення **не зараховано як оптимізацію**. Порівняння R18→R19 не є причинним експериментом; причинний доказ вище тримає R18 незмінним. Source R19 SHA256: `80dcb838e1bb482bbf37a7151900c4ac4950975e9516b9009c962bd06e064226`.

## Остаточні Lighthouse результати

Median-of-all-three, без відкидання спроб. Незмінні hard limits: LCP2500мс, TBT200мс, CLS0.1; вторинний score90 досягнуто для всіх12 груп. Жодний із36 окремих TBT не перевищує200мс; максимум172,5мс (Writing/mobile/run3). Усі36 LHR без runtime errors або warnings. Попередні хвости інших джерел лишилися в їхніх raw.

| Сторінка / профіль | LCP median, мс | LCP max, мс | TBT median / max, мс | CLS median | Score median |
| --- | ---: | ---: | ---: | ---: | ---: |
| index / mobile | 1959.039 | 1975.397 | 58.5 / 68.5 | 0.000000 | 99 |
| index / desktop | 457.16 | 468.299 | 0 / 0.5 | 0.000000 | 100 |
| research / mobile | 1646.908 | 1766.116 | 108 / 128.5 | 0.000000 | 99 |
| research / desktop | 412.483 | 416.608 | 2 / 50 | 0.000000 | 100 |
| writing / mobile | 1661.93 | 1691.307 | 105.5 / 172.5 | 0.000000 | 99 |
| writing / desktop | 431.722 | 442.592 | 0 / 1 | 0.000696 | 100 |
| talks / mobile | 1598.045 | 1694.04 | 61.5 / 171 | 0.000000 | 100 |
| talks / desktop | 404.185 | 414.6 | 58 / 70 | 0.000000 | 100 |
| credits / mobile | 1594.512 | 1610.778 | 37.5 / 49.5 | 0.000000 | 100 |
| credits / desktop | 404.821 | 409.051 | 12 / 34 | 0.000000 | 100 |
| reader-1 / mobile | 2400.942 | 2411.16 | 113 / 118 | 0.000000 | 97 |
| reader-1 / desktop | 521.11 | 521.872 | 0 / 2 | 0.000000 | 100 |

## Motion, переходи й утримання ресурсів

18 профілів ×4 вікна =72. Усі36 Off/Reduced вікон мають0 callbacks і0 paints; фінальне Off-вікно після soak теж0/0. Ліміт33мс paint p95 і20% idle busy застосовується до390px/CPU×4; таблиця показує максимуми також інших профілів, не приписуючи їм цього ліміту.

| Ширина / CPU | Профілі | Максимальний paint p95, мс | Максимальний idle busy | Off / Reduced callbacks та paints |
| --- | ---: | ---: | ---: | --- |
| 1440 / ×1 | 6 | 21.3 | 23.566% | 0 / 0 |
| 390 / ×1 | 6 | 5 | 10.014% | 0 / 0 |
| 390 / ×4 | 6 | 25.2 | 13.192% | 0 / 0 |

Незмінні flight limits: paint p95≤80мс, max≤200мс, preparation≤160мс, gap≤300мс; readiness перевіряється наявною pacing-моделлю з normalized equivalent≤3200мс. Фактичний ready максимум4264,9мс; equivalent максимум3020,7мс. Обидва значення наведено, бюджети/формулу не змінено.

| Ширина / CPU | Перельоти | paint p95 / max, мс | preparation max, мс | gap max, мс | ready фактичний / equivalent max, мс | nodes до → після | listeners до → після |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1440 / ×1 | 8 | 23.5 / 58.6 | 18.5 | 78.4 | 3888.8 / 3020.7 | 3270 → 3270 | 98 → 98 |
| 390 / ×1 | 8 | 7.3 / 17.1 | 17.4 | 45.5 | 3834.3 / 2763.4 | 3274 → 3274 | 98 → 98 |
| 390 / ×4 | 8 | 33.9 / 41.7 | 63.8 | 196.8 | 4264.9 / 3000.6 | 3274 → 3274 | 98 → 98 |

Усі3 профілі прогріли повний п’ятимаршрутний cache та виконали40 циклів кожен. Documents2→2, nodes/listeners без зростання. Soak обрав Index,390px/CPU×1,10 неперекривних30-секундних chunks: фактично300083,3мс. Heap3945556→4805256B (+859700B); це допоміжне спостереження, не доказ витоку або універсальна memory-гарантія. Усі sample/journey/soak error arrays порожні.

## Функціональні та source checks

- Чистий Q4: owning12/12, усі23 автоматизовані scopes PASS, evidence_valid/automation_pass true, errors[], ready_for_issue_closure false. Формат489files/changed[], lint317files/warnings[], RI28/28, RI-CI20/20, Python89pins/143edges з уже наявним Semgrep/MCP override.
- Підтримуваний reader journey:1440normal,390normal,off,no-canvas,no-js —5/5. У кожній normal native/Back/SPA фазі4 зображення,2 conservatively far та1 реальний image-запит. Повний inventory, decoding, viewer, focus, fragments, history, print перевірено окремо.
- Додаткові5 browser checks PASS. Холодний native print:22сторінки,4 unique original-size objects (cover1280×398 та3×1921×1080); усі22сторінки переглянуто. PDF SHA256 `e9414a9ffc9782830077239765bab29776a1a3d986c2e800abdf7c3bd7c8ff2a`, nativePdfRepaired=false. Це діагностичний browser print, не редакційний R19 export. Історичний R18 PDF і невдалий допоміжний PNG збережено разом із verified JPEG.
- Усі displayed media залишаються в complete reading budget:467190/800000 gzip bytes; окремий user-activated PDF527746B. Deferral не виключає assets із бюджету.

## Ідентичність, інструменти та відтворення

Color/staging-edition локальний артефакт `5f9df1b196fb6fd8ecc1dced2c99ac1c25e78a2c75c081e988967bd7c6e55d09`; variant `bd7be6807f5af1b55242d40ab6205aa853463652810404dd7fef8a7993311dcd`; base engine `d69a96a542eb40eb8d61b03f083c6c108ee25e2632e0be415196a49767aa1764`. Source/artifact clean before/after; bytes verified до й після. Sequential command `node tools/quality/performance.cjs`,21Oct06:16:30.909→06:31:57.400UTC, усі3 stages exit0. Паралельних браузерів/сканерів/benchmark під час вимірювання не було.

Node24.19.0, Lighthouse13.5.0, Playwright1.63.0, Python3.12.14. Explicit `/tmp/chromium`153.0.8010.0, SHA256 `53a15d6c3a3d27dfb54c4ba60278b1683136f70cf1e67e989da7dfbd3d451ef0`; managed153.0.8010.12 відсутній. Це локальна лабораторія, не managed CI, фізичний device або field INP/RUM. CPU×4 синтетичний; callback time охоплює JS/Canvas commands, не display FPS чи battery. Медіанний запас LCP99мс не гарантує інших мереж/пристроїв.

Raw-пакет і `manifest.json` розміщено поряд із цим звітом у `performance-fixes-evidence-20261021/`. У manifest кожний logical file має byte length/SHA256 і ZIP member; однакові bytes дедупліковано без втрати жодної спроби. Пакет: 52ZIP, 753унікальні members, 2212logical files, 159318993стиснених bytes. ZIP SHA256/CRC та всі logical aliases перевірено; `restore-evidence.py` відновлює повний набір у новий каталог. Там є точні inputs,36 LHR, logs/traces, усі failed/prepared attempts, recipes, source snapshot owners і machine-readable summary. Історичні Q3 `final-*` inputs збережено під `q3-*`; для старих recipes потрібен цей remapping та checkoutQ3, а не новий finalQ4.

Це child попереднього evidence commit `aade77a24d60987d272a2d8f46118d14b3b04c9b`; його попередні raw не змінюються. Окремий evidence-only tree ніколи не зливається в active source і не обходить250MB RI bound. [Попередній причинний звіт](https://github.com/oborskyivitalii/oborskyivitalii/blob/aade77a24d60987d272a2d8f46118d14b3b04c9b/review/issue-5/2026-10-21-performance-optimization.md).

## Приймання й решта роботи

| AC | Поточний доказ | Стан цілого критерію |
| --- | --- | --- |
| AC08 | Current source/native/reader request proofs,5browsercases, print, strict performance | Whole reader/hosted/device gates лишаються окремо; open. |
| AC11 | CS01–CS10 ownership, source checks, regressions, separate independent implementation/raw review | Whole independent export/editorial acceptance не підмінено; open. |
| AC12 | Same issue5/PR79, точні source/tree/public, повна незмінна матриця та raw/results | Fresh owner staging/merge/release decisions окремо; open. |
| AC13 / AC15 | Чисті mapped checks PASS | Наявні whole ticks збережено, нових не додано. |
| AC23 | PR113 protected merge та source283 staging/recovery — historical | Попередні3 bootstrap/integration ticks не переозначено як stagingQ4. |

PR79 залишається Draft, issue5 open. Editorial/rights/device/export, незалежний content/media release, актуальне hosted staging та publication/merge decisions лишаються їхнім власникам. Жодної нової staging/production активації в цьому checkpoint не виконано. `performance-suite.fullGate=false` / `productionEligible=false` збережені: PASS цього діагностичного performance-набору не є release admission.

Незалежні receipts: [independent-review.md](performance-fixes-evidence-20261021/independent-review.md). У цьому початковому raw-checkpoint native readback ще pending; його результат буде додано metadata-only child commit. Остаточні scope anchors отримають commit-pinned raw links та перевірений фактичний PR head після публікації.

Refs #5
