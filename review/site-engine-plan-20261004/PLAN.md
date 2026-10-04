# План: статичний сайт із відокремленим двигуном і контентом

Власник: [#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15).
[Оцінка бази й симптом Writing](ASSESSMENT.md).
Дата: 4 жовтня 2026. **Оновлення: maintainer авторизував виконання R0–E.**
Реалізація у stacked Draft PR #16; PR #10 зберігає frozen candidate.
[Execution record](../site-engine-implementation-20261004/EXECUTION.md) та
[чинний source/engine contract](../../site/README.md) фіксують зроблене й перевірки.
Початковий план нижче збережено. E реалізовано як пакет/контракт; перевірка
реального host відкладається за явною забороною будь-якої публікації.
F залишається окремою пропозицією #13; mandatory jobs не зняті.

## Результат і обмеження

Редагування одного текстового блоку має перегенеровувати лише його залежні
сторінки. Незмінний engine, scene definitions і ассети повинні залишатися
byte-identical. HTML залишається повним, придатним для SEO, accessibility,
no-JS і direct URL; живий Canvas — progressive enhancement.

Зберегти English UI, оригінальні EN/UA editions,5 featured works,27 primary
records/28 linked renditions,8 public discussions, портрет, exact edition URLs,
metadata/anchors, native scroll, Day/Night/Auto,24-second bounded loop,
70% fog, persistent header/Canvas, painted-arrival текст, всі #12/#13 budgets.
Content/layout/rights decisions не переводити в engine acceptance.

Чинна публікація споживає перевірений повний artifact. Не вводити mutable
remote JSON, live file patching, новий runtime server, CMS, paid service або
обов'язкове перенесення іншого репозиторію. Спільний engine-package для
UA/Subprime розглядати пізніше після реального другого споживача та license review.

## R0 — завершити діагностику Writing до рефакторингу

Власники: #12, візуальна поведінка #14.

1. Заморозити живий SHA/public manifest. Відкрити served multi-file версію,
   кожен standalone entry, direct Writing і Home/Research→Writing.
2. Зняти viewport/scroll owner, first/last visible archive row, bounds,
   scrollY, rendered camera/phase, Motion label, travel progress, hidden/
   reduced/print/hold state і actual paint timestamps. Використати наявні
   probes; додатковий recorder — локальний або opt-in, без зовнішньої telemetry.
3. Почати idle спостереження відразу після arrival; потім0→100→200→400px,
   вниз/вгору в одному жесті й одразу після topic transition.
   Фазу порівнювати modulo24000; нерухома камера перед archive bound сама
   по собі не доводить зупинку автономних paints.
4. Повторити для всіх/short/empty filters, restored Back/Forward,
   resize/orientation, hidden→visible і print return, Motion off/on/reduced.
   Перевірити delayed CSS, unavailable Canvas/storage і post-activation failure.
5. Зіставити Chromium/Firefox/WebKit з реальним пристроєм/браузером, де
   спостерігав користувач. Емуляцію не називати Safari/iPad acceptance.
6. Якщо підтвердиться scheduler/lifecycle defect: мінімальний fix + тест,
   що падає на baseline, проходить на candidate; повторити потрібні gates.
   Якщо проблема лише в camera dead range: запропонувати окремий короткий
   intro→archive segment; topic traversal і filtered-progress anchoring
   залишити прив'язаними до видимих records. Не заміняти їх загальною висотою
   документа й не додавати artificial spacer.

Вихід: source-bound reproduction/report або обґрунтована властивість mapping,
конкретний прийнятий fix/UX direction і регресія. До цього user report відкритий.

## A — інвентаризація і контракт меж

Власник #15; джерела/SEO #1/#14, rights #7, публікаційні адаптери #5.

- Зафіксувати5 HTML, CSS,4 JS, усі ассети, full text/SEO/editions,
  script execution order, external links і runtime DOM/event contracts.
- Ідентифікувати повторюваний head/header/footer, page-specific main,
  theme initialization до CSS, defer ordering, scene fallback і archive data.
- Побудувати таблицю source→dependent routes/exports/assets. Сьогодні
  авторитетний контент — `docs/`; після міграції один визначений source tree.
  Генеровані `docs/` не редагуються паралельно з новими content sources.
- Versioned contract: route IDs/URLs, scene ID, stop IDs, metadata,
  mount/unmount/refresh/travel-completion callbacks і failure behavior.
- Не дублювати `SITE-SOURCE-AUDIT.md`, accepted SEO inventories або source/
  rights registries. Новий машинний каталог — міграція існуючого набору
  edition records з посиланням на їхню provenance, а не незалежна ledger.

Вихід: migration map і frozen output manifest. Перше приймання — чинні output
bytes/семантика; бажане покращення дизайну не змішувати зі структурним move.

## B — відокремити спільні шаблони й content sources

Почати з малої deterministic generation без зміни browser runtime.

Пропоновані шляхи (ще не створені):

| Шлях | Власність |
| --- | --- |
| `site/templates/` | head, header, footer, page shell; один спільний source |
| `site/content/pages/<route>/` | окремі trusted HTML blocks для прози/секцій |
| `site/content/pages/<route>/metadata.json` | title/description/structured metadata й ordered blocks |
| `site/content/catalog.json` | мігровані exact primary/rendition records і featured selection |
| `site/routes.json` | allowlisted route/URL/scene/stop/layout compatibility descriptors |
| `site/assets/` | власні static images/icons і provenance links |
| `docs/` | повний згенерований deployable output |

- Перший мінімальний формат — curated HTML fragments + schema-checked JSON.
  Складну article Markdown підтримку узгодити з pinned adapter #5.
  Не створювати другий імпровізований Markdown/PDF renderer.
- Generator не виконує контент або template expressions. Метадані escape;
  JSON-LD не дозволяє закривати script boundary; блоки не додають довільні
  executable scripts/event handlers/resource URLs.
- Перенести один Home block, довести parity, потім решту5 routes.
  Preserve whitespace/serialization, якщо потрібна byte parity. Кожну
  необхідну зміну output документувати, не приховувати normalizer rewrite.
- CI перевіряє fresh output і відхиляє редагування generated-only файлів,
  не відтворене зі source. Clean checkout генерує ті самі bytes.
- Зберегти чинні `theme.js` execution order, real links, no-JS HTML і SVG fallback.

Приймання: all-page DOM/text/SEO/archive equality, exact URLs/IDs/editions,
native/fallback/print, дві теми й самостійні exports; unchanged runtime hashes.

## C — розділити engine та scene definitions

Пропоновані джерела: `site/engine/` для lifecycle/router/theme/renderer/archive
behavior; `site/scenes/` для route-specific authored geometry/paths/materials.

- Спершу виділити чисту математику й scene descriptors; зберегти renderer,
  bounded topology, room cache, projection/culling, cadence/detail adaptation.
  Не переходити на heavyweight3D framework заради назви «двигун».
- Залишити один lifecycle owner і один RAF. Stop/resume, navigate, refresh,
  resize і mounted-main observer мають явну відповідальність.
- Зберегти compatibility API `SiteScene`/`SiteArchive`/`SiteNavigation`
  на перехідний період; route descriptors не можуть завантажувати remote code.
- Явно відділити ambient phase, scroll/topic pose і route flight; painted
  progress — єдиний source для появи тексту. Interrupted journeys/failure
  не залишають inert/hidden content або зайвих listeners.
- Перший move може зберегти наявні public filenames для мінімального diff.
  Hash-addressed runtime assets і cache headers — наступний контрольований
  інкремент після сумісного exporter/manifest/deployment support.
- Обрати native browser files або мінімальний pinned producer лише після
  dependency/license/tooling review. Наявність engine не вимагає bundler.
  Standalone exporter має працювати й через file URL; ES modules/import
  не можна просто перенести туди без контрольованого offline rendition.

Приймання: одна шапка/Canvas/RAF, all-route transitions, retargeting, history,
фільтри й reflow, Off/reduced/hidden/print/fault invariants. Повторити startup,
15 sustained profiles,30 flights,120-route resource soak і300s soak, visual
Day/Night/mobile evidence та #13 unchanged budgets. Під час зміни назв/functions
оновити probes й positive self-check; blind zero callback не є performance pass.

## D — залежності й інкрементальна генерація

- Підпис кожного output: producer/config/template digest + content/catalog
  dependencies + asset/engine versions. Не покладатися лише на path, mtime,
  Git diff або назву semantic version.
- Зміна одного block → тільки dependent page; featured record → Home+Writing;
  shared header/footer →5 routes; scene data → тільки відповідний runtime
  output/fallback і його залежності. Graph відомий generator, не вгадується.
- Cache optional і недовірений: verify fingerprints/bytes, reject mismatch.
  Missing baseline/cache → повна детермінована генерація, ніколи неповний release.
- Changed routes пишуться у temp output; unaffected verified files копіюються/
  зберігаються byte-identical. Missing/deleted/renamed dependency, route removal
  і producer/config/template change invalidують правильний dependency closure.
- CLI proposal: `build-site --all`, `build-site --changed <base>`,
  `build-site --check`. Назви не означають, що команди вже існують.
- Standalone five-route copies та ZIP залежать від усіх embedded routes:
  одна content edit може вимагати їхньої регенерації. Це очікуваний review cost,
  який не змінює unchanged engine bytes у hosted output.

Контрольний експеримент: внести одну оборотну зміну в Home block, побудувати
output двічі, порівняти manifest. Home змінюється; engine/assets та4 інших
routes не змінюються; clean full build дорівнює incremental build.
Повторити для featured record, global footer, rename/delete, empty/invalid cache
і producer change. Генерація мінімальна; обов'язкові перевірки залишаються.

## E — цілісний snapshot на staging/production

Власник #8; gates #13. Реальне hosting access ще не встановлене.

- Manifest розділяє engine/scenes/content/assets fingerprints та контракт
  сумісності. Кожен snapshot перелічує ВСІ точні public files і source SHA/tree.
- Packager використовує verified cached unchanged outputs + newly generated
  HTML, перевіряє dependency completeness й створює один tested artifact.
  Після validation не regenerate і не читати moving branch.
- Cloudflare Direct Upload приймає prebuilt assets:
  [офіційна документація](https://developers.cloudflare.com/pages/get-started/direct-upload/).
  Наш deploy flow споживає coherent package; не обіцяє редагування окремого live
  файлу або гарантовану provider deduplication без вимірювання.
- Незмінні hashed asset paths отримують host-appropriate immutable caching;
  HTML/revision descriptor revalidate. Старі HTML мають посилатися на свої
  старі engine/assets; термін їхнього утримання визначити за cache/rollback
  contract, не видаляти автоматично. Без цього можливі missing old assets.
- Same-document router сьогодні кешує visited HTML. Він НЕ підхоплює нову
  редакцію автоматично. Спроєктувати snapshot pinning: fetched route повинна
  відповідати shell/engine version; при mismatch — bounded full reload або
  залишений coherent previous version, з перевіркою проти reload loop.
  Не змішувати новий content із несумісним старим engine.
- Staging candidate/version URL → existing smoke → stable promotion,
  freshness/serialization і known-good recovery. Production тільки через
  existing production gate й окрему release/rights authorization.
- HTML/engine/asset failures, stale route cache, unavailable previous asset,
  raced promotions і rollback мають контрольовані сценарії.

Приймання: одним текстовим edit публікується новий snapshot з тими самими
engine/assets; direct/cached navigation, query/hash/refresh, no-JS, headers,
snapshot identity і rollback доведені на реальному host. Local fixture не TLS/
CDN/hosted evidence. Partial-file live patches заборонені.

## F — можлива коротша content-only перевірка: окрема пропозиція #13

У поточному рефакторингу НЕ знімати mandatory jobs і не переносити старі
зелени результати на новий candidate без валідного scope/identity policy.

Після engine/content fingerprint proof можна запропонувати #13 класифікатор:
runtime/scene/CSS/layout-affecting asset/producer changes → full matrix;
content edit → все одно security, schema/source/edition/SEO, links, output
freshness, size/contrast/layout/scroll/archive/browser checks.
Зміна тексту може змінити layout, camera bounds або contrast і вимагати
physical-device check за вже чинною політикою. Reuse старого device/runtime
evidence допускається лише з перевіреним unchanged scope, не за path heuristic.
Unknown classification fail-closed у full path.

Правила fingerprint, accepted evidence reuse, expiry й required aggregate
запропонувати окремим reviewed change. До прийняття лишається чинний #13 workflow.
Прискорення generation НЕ дорівнює дозволу пропустити verification.

## Порядок виконання, перегляд і rollback

1. R0 в поточному runtime work #12/#14; зафіксувати результат, не приховувати
   його structural move. Planning PR можна прийняти окремо.
2. A+B малим PR/increment, source-output parity й усі required checks.
3. C лише після B parity; порівняти реальні motions/captures/performance.
4. D після стабільного source contract; cache correctness і single-edit proof.
5. E після доступного staging; optional F окремо за #13, не передумова D.

Кожен інкремент: compare issue intent, freeze source/artifact, inspect diff,
оновити AGENTS/handoff/RI/export при потребі, записати exact results і remaining
acceptance у PR та issue. Статус Draft до відповідного review; не закривати #15
на самому плані, зеленому CI чи частково завершеному sibling.

Для rollback до міграції: попередній verified static snapshot і producer/source
pin; не відновлювати `docs/` вручну паралельно з новим source tree.
Після release — відновлення exact previous coherent package через existing
host workflow; engine і content повертаються узгоджено. Ніяких mutable live patches.
