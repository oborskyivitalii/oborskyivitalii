# DevCon Romania — slide outline, draft 01

**AI Changes the Delivery System — and the Product Itself**

**Статус:** текстова чернетка для перегляду. Екранні формулювання англійською; редакторські пояснення українською.

**Автор:** Vitalii Oborskyi. **Аудиторія:** досвідчені DevOps/SRE/platform engineers, tech leads, architects та engineering leaders, які відповідають за delivery і production.

**Формат:** 23 хвилини виступу, 5 хвилин Q&A, 2 хвилини запасу. 10 основних екранів і один ресурсний екран для обговорення.

**Основа:** PMDay v35, 1 October 2026, поточні активні блоки pptx-slide та Current composition. Пропозиції нижче стосуються окремої DevCon-версії. Повний evidence-слайд PMDay 4 переноситься без редакторських змін; його повний актуальний текст наведено в додатку A.

## Аргумент виступу

AI змінює розподіл когнітивної роботи. Швидкість генерації, перевірки, інтеграції та формування людського розуміння може змінюватися нерівномірно. Це створює потребу в новому балансі delivery. Коли model judgment входить у роботу самого продукту, перебудова охоплює також вимоги, evidence, повноваження, операційну спроможність і зворотний зв’язок.

Соціотехнічною software engineering була й раніше. Предмет виступу — зміна розподілу роботи, знань і рішень усередині цієї системи. Запропоновані operating models оцінюємо як гіпотези про конкретні умови роботи; окремі зрілі практики зберігають свою цінність. Новий баланс потребуватиме повторної перевірки після матеріальних змін.

Повний evidence-слайд підтримує розмову про різні результати й межі вимірювання. Він не є доказом того, що кожна команда розбалансована або що AI універсально погіршує delivery.

## Монтаж і таймінг

| DevCon | Час | Заголовок | Основа PMDay |
|---|---|---|---|
| 1 | 00:00–01:30 | AI Changes the Delivery System and the Product Itself | 1–2 |
| 2 | 01:30–03:30 | We Accelerated a Step. Not the System. | 3 |
| 3 | 03:30–08:00 | The Evidence Is Already Messy | 4, повністю |
| 4 | 08:00–10:30 | The New Scarcity Is Human Comprehension | 5–6 |
| 5 | 10:30–12:30 | We Are Searching for a New SDLC Equilibrium | 7 |
| 6 | 12:30–14:00 | When Software Starts Thinking | 8–9 |
| 7 | 14:00–16:00 | Evidence Changes the Release Decision | 10–11 |
| 8 | 16:00–18:00 | Control Is a Sociotechnical Capability | 12 |
| 9 | 18:00–20:30 | The Roles Move With the System | 13; людська спроможність із 12 |
| 10 | 20:30–23:00 | Engineering Rigor Moves — It Doesn’t Disappear | 14 |
| 11 | 23:00–28:00 | Continue the Conversation | 15 |
| — | 28:00–30:00 | Запас для переходів і запитань | — |

## 1. AI Changes the Delivery System and the Product Itself

**00:00–01:30 · PMDay 1–2**

**On-screen text (English)**

> **AI Changes the Delivery System**  
> **and the Product Itself**
>
> **HOW WE BUILD**  
> Judgment during delivery
>
> **WHAT WE BUILD**  
> Judgment at runtime
>
> New capabilities change what we can delegate.
>
> Vitalii Oborskyi · DevCon Romania 2026

**Що має стати зрозумілим.** Делегування когнітивної роботи є спільною причиною двох інженерних зсувів. У першому випадку модель допомагає команді створювати систему, у другому її судження стають частиною поведінки продукту. «Thinking» тут описує функцію в системі; припущення про свідомість не потрібне.

**Композиція.** Зберегти дві наявні сцени HOW/WHAT з PMDay 1. Коротку думку про межу делегування з PMDay 2 інтегрувати в цей самий екран. Повну історичну послідовність writing → computers → models пояснити однією усною фразою, без окремої екранної історії.

**Перехід.** Спочатку розглядаємо, що відбувається із системою delivery, коли одна її спроможність змінюється швидше за інші.

## 2. We Accelerated a Step. Not the System.

**01:30–03:30 · PMDay 3**

**On-screen text (English)**

> **We Accelerated a Step. Not the System.**
>
> AI can affect every stage. Downstream gains are not automatic.
>
> Illustrative team: changes per week; comparable work, fixed downstream capacity.

| | Code | Review | Integrate | WIP growth / week |
|---|---:|---:|---:|---:|
| BEFORE | 8 | 8 | 8 | 0 |
| AFTER AI | 100 | 8 | 8 | +92 |

> Delivery stays at 8/week. WIP grows; overload can reduce quality.
>
> Push system: no WIP limit, no discarded work.

**Що має стати зрозумілим.** Приклад пояснює механізм: за фіксованої downstream capacity більша генерація створює чергу. Числа навчальні; вони не оцінюють типовий ефект AI. Інші стадії теж можуть прискорюватися, але це окреме питання, яке потрібно перевіряти.

**Композиція.** Зберегти логіку наявної схеми SDLC і компактну таблицю before/after. Потік Intent → Design → Code → Review → Test → Integrate → Deploy → Operate лишається контекстом. Акцент — на розташуванні обмеження та накопиченні роботи, без універсальної карти bottlenecks для всіх організацій.

**Перехід.** Далі — емпіричні джерела. Вони вимірюють різні результати, тому їх потрібно прочитати уважніше, ніж єдиний показник «AI productivity».

## 3. The Evidence Is Already Messy

**03:30–08:00 · PMDay 4, повністю без змін**

**On-screen text (English)**

Повний оригінальний слайд **The Evidence Is Already Messy**, включно з усіма п’ятьма дослідженнями, NBER marketplace block, числами, розмірами вибірок, датами, визначеннями й methodological caveats. Повний текст — додаток A.

**Що має стати зрозумілим.** Code activity, delivery, self-reported benefit, maintainability proxies та використання продукту — різні об’єкти вимірювання. Виступ визнає позитивні сигнали й одночасно показує обмеження перенесення локального результату на всю систему. Дані мотивують перевірку системних гіпотез; вони не встановлюють одну причину для кожного результату.

**Композиція.** Перенести саме актуальну композицію v35. Зберегти дві колонки та всі п’ять джерел. NBER розділяє code activity і marketplace use; DORA зберігає self-report та association; GitClear — дві окремі колонки видань без трендової стрілки. METR і Agarwal зберігають власні outcome/cohort labels. Форматування всередині оригінального слайда не редагувати під час адаптації.

**Порядок усного прочитання всього слайда**

| Відлік виступу | Частина | На чому наголосити |
|---|---|---|
| 03:30–05:05 | NBER + marketplaces | Різні одиниці результату; три покоління інструментів; additions + deletions; обмеження async releases; проксі використання нових застосунків. |
| 05:05–06:00 | DORA | Частки респондентів, які повідомили покращення; окремо — зв’язок adoption із throughput та instability; survey association. |
| 06:00–06:45 | GitClear | Окремі snapshots і різні samples; moved code та copy/paste — визначені proxy-показники. |
| 06:45–07:10 | METR | Self-reported work value; медіани трьох запитань; cohort technical workers. |
| 07:10–07:40 | Agarwal | Cognitive complexity, дві групи adoption, matched controls; не універсальна оцінка correctness. |
| 07:40–08:00 | Синтез | Що саме поліпшилося, де й за яких умов? Які залежності залишилися за межами конкретного вимірювання? |

**Перехід.** Одне з матеріальних питань за межами обсягу генерації — спроможність команди розуміти створену систему й відновлювати її.

## 4. The New Scarcity Is Human Comprehension

**08:00–10:30 · PMDay 5–6**

**On-screen text (English)**

> **The New Scarcity Is Human Comprehension**
>
> Generation can scale faster than comprehension.
>
> Can we explain the change?  
> Can we maintain the dependency?  
> Can we recover the system?
>
> If AI cannot recover the system, the team still must.
>
> Illustrative overload hypothesis — motivated by the preceding evidence, not measured by those studies.

**Що має стати зрозумілим.** Доступ до генератора не гарантує перенесення експертизи в команду. Умовний компонент на незнайомій мові може швидко стати critical dependency. Тоді розуміння, ownership і recovery capability впливають на реальну здатність команди відповідати за результат. Це сценарій для перевірки у власному workflow.

**Композиція.** Об’єднати comprehension gap зі слайда 5 і наслідок для recovery зі слайда 6. Концептуальні криві позначити як ілюстрацію, без емпіричного масштабу. Короткий recovery-сценарій показати трьома станами: incident → AI cannot recover → team must diagnose and restore. Детальний incident runbook на цьому екрані не потрібен.

**Перехід.** Якщо спроможності змінюються нерівномірно, потрібно переоцінювати спосіб роботи всієї системи.

## 5. We Are Searching for a New SDLC Equilibrium

**10:30–12:30 · PMDay 7**

**On-screen text (English)**

> **We Are Searching for a New SDLC Equilibrium**
>
> **CAPABILITIES CHANGE**  
> Generation, review, integration, understanding
>
> **THE OPERATING MODEL MUST ADAPT**  
> Work allocation, ownership, learning, feedback
>
> **WORKING HYPOTHESES**  
> Which constraint does this address?  
> What must be true for it to work?  
> What would make us revise it?
>
> Test delivery, quality, full cost and team health.

**Що має стати зрозумілим.** Новий баланс — здатність забезпечувати корисний, підтримуваний результат у межах реальної спроможності системи. Це рухомий стан. Підходи на кшталт інших batch sizes, кращого knowledge flow чи AI-assisted review можуть бути обґрунтованими кандидатами; їхня достатність залежить від bottleneck, контексту та evidence. Зрілі практики не оголошуються неперевіреними лише тому, що тепер поруч AI.

**Композиція.** Переробити схему old/today/new у три зв’язані стани адаптації. Відмітити спроможності, operating model і перевірку результату. Каталог інструментів із вихідного explore/test блоку не переносити в основний текст: цього часу потребує центральний аргумент про гіпотези та баланс.

**Перехід.** До цього модель брала участь у судженнях, за якими команда створює продукт. Наступний зсув — її судження стають частиною роботи самого продукту.

## 6. When Software Starts Thinking

**12:30–14:00 · PMDay 8–9**

**On-screen text (English)**

> **When Software Starts Thinking**
>
> A system where consequential runtime responsibility partly depends on probabilistic Model Judgment.
>
> **IT ASSISTANT: HELP EMPLOYEES RECOVER ACCESS**
>
> Answer · Clarify · Escalate
>
> Approved guidance and permitted actions  
> Prohibited: unauthorized disclosure
>
> Schematic behavioral space; limits are product-specific.

**Що має стати зрозумілим.** Продукт отримує простір контекстно залежних відповідей і дій. Потрібно визначати, які варіанти прийнятні та які наслідки заборонені. Детерміновані компоненти, традиційні вимоги й перевірки залишаються частиною продукту. Новий предмет уваги — consequential responsibility, що залежить від model judgment.

**Композиція.** Звести визначення зі слайда 8 та поведінкові межі зі слайда 9. Один запит працівника, допустима область Answer / Clarify / Escalate, окремо unauthorized disclosure за межею. Не подавати схему як виміряний розподіл ймовірностей.

**Перехід.** Далі перевіряємо, яке evidence дозволяє ухвалити рішення про таку поведінку.

## 7. Evidence Changes the Release Decision

**14:00–16:00 · PMDay 10–11**

**On-screen text (English)**

> **Evidence Changes the Release Decision**
>
> **ILLUSTRATIVE INDEPENDENT SAMPLE · n = 200**
>
> 196 acceptable responses  
> 3 incorrect instructions → rework  
> 1 privacy leak → critical breach
>
> Critical breach → BLOCK RELEASE
>
> A low average error rate does not excuse a prohibited disclosure.
>
> Readiness includes behavior, evidence and an operable control path.

**Що має стати зрозумілим.** Рішення визначають прийняті критерії та наслідки, а не один aggregate score. У цьому навчальному сценарії privacy breach порушує погоджену критичну заборону. Невелика вибірка не доводить відсутності рідкісних порушень, а n = 200 не є рекомендацією щодо розміру evaluation. До definition of readiness додаються доказова база, відповідальність за рішення і спроможність управляти поведінкою.

**Композиція.** Зберегти три категорії результатів з PMDay 10 та один виразний decision marker. Поруч — короткий зв’язок із readiness з PMDay 11. Повну DoR/DoD таблицю й математичний інтервал зберегти як матеріал для запитань, без другого повного екранного чекліста.

**Перехід.** Якщо readiness залежить від працюючого control path, потрібно розібратися, з чого складається ця спроможність.

## 8. Control Is a Sociotechnical Capability

**16:00–18:00 · PMDay 12**

**On-screen text (English)**

> **Control Is a Sociotechnical Capability**
>
> Evidence against agreed limits  
> Authority to decide  
> Capability to act
>
> Context · Competence · Decision rights · Time · Capacity
>
> Validate control effectiveness. Telemetry alone does not establish correctness.
>
> Check access before disclosure. Feedback cannot undo an irreversible effect.

**Що має стати зрозумілим.** Працюючий контроль поєднує технічну перевірку, право прийняти рішення та можливість його виконати. Перевірка змісту може помилятися; permissions та required approval мають власну функцію. Людський компонент потребує контексту, компетенції, часу та спроможності. Зворотний зв’язок дозволяє коригувати систему, але вже розкриті дані не відкликає.

**Композиція.** Спростити PMDay 12 до зв’язку model proposal → fallible semantic check → permissions + required approval → deliver / execute. Semantic check і перевірка повноважень залишаються окремими функціями; rejection, denial або недоступність потрібного контролю ведуть до deny / fallback. Окремий контур observe → compare with agreed limits → intervene → verify effect охоплює результати й працездатність контролю. Людину показати як реального учасника control path із контекстом, компетенцією, повноваженнями та часом. На основному екрані використати короткі підписи, деталі залишити в усному поясненні.

**Перехід.** Такі залежності змінюють розподіл роботи та взаємодію команди ще до першого production incident.

## 9. The Roles Move With the System

**18:00–20:30 · PMDay 13; human-capacity fields із 12**

**On-screen text (English)**

> **The Roles Move With the System**

| HOW WE BUILD | WHAT WE BUILD |
|---|---|
| Review + integration capacity | Evaluation + response capacity |
| Understanding + recovery | Behavioral criteria + authority |
| Delivery feedback | Outcome + incident feedback |

> **SHARED DEPENDENCIES**  
> Knowledge · Decision rights · Time and capacity · Feedback
>
> Required decisions, evidence and capabilities belong in the delivery dependency plan.

**Що має стати зрозумілим.** Обидва зсуви змінюють operating model. Повноваження, знання, час на навчання та response capacity впливають на те, що можна обґрунтовано пообіцяти й підтримувати. Існуюча команда узгоджує, хто визначає корисний результат і межі, хто формує evidence, хто ухвалює належне рішення та хто здатний діяти. Це функції й залежності, а не пропозиція нової органіграми.

**Композиція.** Дві паралельні колонки HOW/WHAT повертають глядача до відкриття. Спільний горизонтальний шар під ними показує знання, повноваження, ресурс і feedback. Як усну ілюстрацію повторно використати expertise gap: код готовий, але qualified review/recovery capability ще потребує забезпечення. Для WHAT аналогічною залежністю є компетентний responder з реальним часом і правом втручатися.

**Перехід.** Одне рішення про operating model не завершує пошук: його припущення потрібно перевіряти під час роботи системи.

## 10. Engineering Rigor Moves — It Doesn’t Disappear

**20:30–23:00 · PMDay 14**

**On-screen text (English)**

> **Engineering Rigor Moves —**  
> **It Doesn’t Disappear**
>
> **THE LABORATORY STAYS OPEN**  
> Hypothesis → Bounded experiment → Evidence → Decision
>
> Which imbalance does this address?  
> By what mechanism?  
> What would show system-level improvement?  
> What would make us revise the hypothesis or delegation boundary?
>
> More capability still requires engineering responsibility.

**Що має стати зрозумілим.** Пошук нового балансу — частина відповідального delivery. Ми формулюємо припущення, перевіряємо їх на обмеженому scope та переглядаємо рішення за результатами. Існуюча engineering discipline й емпіричні способи роботи дають основу; змінюється предмет делегування та перевірки. Матеріальні зміни моделі, даних або повноважень можуть зробити попереднє evidence недостатнім.

**Композиція.** Лабораторний цикл PMDay 14 залишити короткою схемою у верхній частині. Чотири запитання — головний візуальний акцент нижче: слухач має встигнути їх прочитати під час паузи в сценарії. Production outcomes й incidents повертаються в оцінку припущень. Те, що звичайний delivery продовжується паралельно, пояснити усно. Фінальний акцент — на питанні, яку роботу можна обґрунтовано делегувати в конкретній системі, та на готовності звузити, переробити або відхилити AI path, коли належної спроможності немає.

**Перехід до Q&A.** Запропонувати обговорити, де в системах слухачів з’являється нове обмеження і які припущення їм хотілося б перевірити.

## 11. Continue the Conversation

**23:00–28:00 · PMDay 15 · До 30:00 за наявності запасу**

**On-screen text (English)**

> **Continue the Conversation**
>
> **HOW WE BUILD**  
> The Subprime Code Crisis  
> AI-assisted delivery, understanding and long-term ownership  
> The-Subprime-Code-Crisis
>
> **WHAT WE BUILD**  
> Uncertainty Architecture  
> Designing and governing Thinking Systems  
> uncertainty-architecture
>
> Vitalii Oborskyi  
> oborskyivitalii@gmail.com  
> linkedin.com/in/vitaliioborskyi

**Композиція.** Використати два чинні resource blocks PMDay 15 із відповідними посиланнями. Порядок HOW/WHAT узгодити з початком DevCon-версії. На екрані залишаються контакти й джерела для продовження розмови.

**Resource destinations**

- [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)
- [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture)
- [LinkedIn](https://www.linkedin.com/in/vitaliioborskyi/)

## Додаток A. Повний актуальний текст evidence-слайда

**Оригінал:** PMDay v35, slide 4. **Назва:** The Evidence Is Already Messy.

Нижче дослівно наведено всі змістові текстові поля активного блоку pptx-slide 4. Групування потрібне для читання чернетки; воно не задає нової композиції. Назва походить з актуального заголовка секції 4. Історичні render fields і superseded editorial descriptions до цього переліку не входять. Під час складання DevCon переноситься сам повний слайд v35.

### A1. Original title

```text
The Evidence Is Already Messy
```

### A2. NBER — code activity

```text
NBER · SEP 2026 · >500K GITHUB DEVS
Cumulative across three tool generations
25.5× changed LOC
3.4× commits
1.3× releases
Changed LOC = additions + deletions.
Fig. 1 rounded; async releases not estimated.
```

### A3. NBER — marketplace outcomes

```text
More apps. Low-usage shares rise.
4 marketplaces; iOS / Chrome shown.
Jan 2025–Apr 2026; first 3 months.
iOS: <10 ratings ≈78% → 87%
Chrome: <10 downloads 19% → 33%
```

### A4. DORA

```text
DORA · 2025 · n = 4,867
Respondents reporting improvement:
Productivity >80% · Code quality 59%
Higher adoption ↔ throughput + instability
Instability: failed production changes + unplanned fixes.
Survey association; no causal estimate.
```

### A5. GitClear

```text
GITCLEAR · SHARES OF CHANGED LINES
Metric | 2021¹ | 2026²
Moved code | 24.65% | 3.8% YTD
Copy/paste | 8.66% | 15.7% H1
¹2025 report  ²2026 report; different samples.
Snapshots only; no comparable trend or causal estimate.
```

### A6. METR

```text
METR · MAY 2026 · n = 349
1.4–2× self-reported work value
Medians across three questions.
Technical workers; no causal estimate.
```

### A7. Agarwal

```text
AGARWAL · JAN 2026 · 1,197 REPOS
Cognitive complexity after agent adoption
Agent-first +34.85% · Prior AI-IDE +42.87%
Matched controls; 19,236 repo-months.
```

### A8. Shared framing

```text
Different studies measure different outcomes — not one universal productivity effect.
```

## Додаток B. Джерельна прив’язка та межі адаптації

**Редакційне джерело:** [PMDay 2026 presentation source](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md), зафіксована редакція v35 від 1 October 2026. Використано її активні дані, а також запис виступу для відтворення логіки усного пояснення. [Evidence register](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md) містить прив’язку досліджень та межі їх інтерпретації.

**Короткі посилання на джерела evidence-слайда** — перенесені з чинного PMDay source; це не заявка на нову незалежну перевірку досліджень у цій редакторській чернетці:

| Блок | Джерело | Редакція / межа з PMDay |
|---|---|---|
| NBER | [Writing Code vs. Shipping Code, WP 35275](https://www.nber.org/papers/w35275) | September 2026 revision; поточні числа v35. |
| DORA | [2025 report announcement](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), [official infographic](https://dora.dev/research/2025/2025-DORA-Report-Infographic.pdf) | Self-report відокремлений від survey association. |
| GitClear, 2021 snapshot | [2025 report PDF](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf) | Appendix A1; окремий випуск і вибірка. |
| GitClear, 2026 snapshot | [2026 author publication](https://www.gitclear.com/blog/annual_ai_code_quality_research_2026_diff_digest_git_ai_diff_viewer) | Публічний виклад 2026; moved YTD, copy/paste H1. Повний whitepaper 2026 у PMDay source не заявлений як перевірений. |
| METR | [AI Usage Survey, May 11, 2026](https://metr.org/blog/2026-05-11-ai-usage-survey/) | Медіани self-report; technical-worker sample. |
| Agarwal | [Paper, v2](https://arxiv.org/html/2601.13597v2) | January 2026; cognitive complexity, дві adoption cohorts. |

**Що зберігаємо дослівно й повністю:** evidence slide 4, усі його актуальні числа та qualifications. Зокрема >80% і 59% означають частки респондентів; GitClear snapshots не з’єднуємо причинною або трендовою стрілкою; 1.4–2× METR не представляємо як виміряний causal uplift.

**Що адаптуємо:** вступ; об’єднання comprehension/recovery; акцент equilibrium на перевірці гіпотез; стиснення behavioral requirements/evaluation/readiness; пояснення control і ролей як частин соціотехнічної системи. Визначення Thinking System та механізм лабораторного циклу залишаються впізнаваними.

**Що залишається в матеріалах для запитань:** повні таблиці DoR/DoD, деталізований recovery flow, sampling/uncertainty пояснення, деталі окремих candidate countermeasures. Повернення до цих деталей залежить від запитання.

**Питання для перегляду цієї чернетки:** чи зберігає вона ширину авторського аргументу; чи зрозумілий зв’язок HOW/WHAT; чи не забирає приклад IT-асистента надмірно багато уваги; чи достатньо 4:30 для комфортного прочитання evidence-слайда англійською. Остаточний таймінг потребує репетиції з паузами.


## Уточнення 19 October 2026: R2, фінальний QR і прив’язка до події

Цей файл зберігає погоджений план draft 01 як основу перевірки презентації. Розбіжності R1 із цим планом зафіксовано в [R2 review](../../review/issue-109/2026-10-19-r2-review.md). Перевіряти потрібно видимі слайди, нотатки й переходи, а не лише відповідність нотаток уже зібраному PPTX.

На прохання автора розділ 11 змінено: замість двох QR до репозиторіїв показуємо один великий QR з точним payload `https://vitaliioborskyi.ai/`, читабельний `vitaliioborskyi.ai` і підпис `Research · Articles · Talks`. Слайд залишається видимим під час Q&A. Це посилання на сайт автора; воно не стверджує, що DevCon-слайди вже опубліковані на сайті.

R2 повертає 11 екранів і початковий бюджет 23 + 5 + 2 хвилини. Повний evidence-слайд PMDay 4 переноситься без змін змісту та композиції; змінюється лише номер 04 → 03. Короткий recovery-сценарій з розділу 4 подано через три питання explain/maintain/recover і виразний наслідок: «If AI cannot recover the system, the team still must.» Детальна трьохетапна incident-схема переходить в усне пояснення. Це спрощення композиції зберігає аргумент про людське відновлення.

Переглянуті milestones R1 і R2 зберігаються як окремі узгоджені набори PPTX, PDF, notes і edition.json. Повсякденні правки видно в історії Git. [Індекс версій](README.md) указує поточну чернетку; [запис події](../events/devcon-romania-2026/event.json) обирає рівно один PDF через шлях і SHA256 за контрактом PR107. Дані події не дублюють презентацію. Вибір PDF для події не є публікацією на сайті, merge або дозволом на розсилку.

Одна нитка роботи: issue 109 і draft PR110. Рішення автора про зміст, репетицію й остаточну версію записуються там. Виправлення спільного механізму подій, якщо знадобляться, належать issue 106 / PR107.


## Уточнення 19 October 2026: R3, реалістичне скорочення й короткі описи

Автор поставив під сумнів попередній бюджет: PMDay займав близько 45 хвилин, а перша скорочена редакція залишила 13 слайдів. Менша кількість слайдів сама собою не доводить, що той самий обсяг пояснень укладається у 23 хвилини. R2 уже мала 11 екранів, але окремі блоки evaluation і technical control продовжували вимагати самостійних пояснень. Жоден із попередніх бюджетів не був підтверджений репетицією автора.

На прохання автора R3 скорочується до **9 слайдів загалом, включно з фінальним QR**, у межах запитаних 7–10. Для кожного слайда готуємо **3–5 англійських речень**. Це коротка опора для виступу: основна думка, потрібний приклад і перехід. Вона не є дослівним двадцятихвилинним сценарієм; буквальне читання цих абзаців триватиме значно менше. Час на пояснення діаграм, паузи та реакцію аудиторії потрібно перевірити реальною репетицією.

Скорочення змінює обсяг пояснення: окремий evaluation-слайд R2 7 і технічний control-слайд R2 8 вилучаються з основної послідовності. Не переносимо їхній повний урок у нотатки інших слайдів. Зберігаємо один runtime-приклад IT-асистента. Таблиця HOW/WHAT на базі R2 9 стає підсумком **Delegation Changes the Sociotechnical System**, явно поєднуючи evidence, authority і capability та спільні людські залежності.

У висновку R3 8 залишаємо заголовок і чотири питання, збільшуючи їхній кегль. Малий лабораторний цикл із workflow і feedback прибираємо з цього екрана: завершення має зафіксувати критерії оцінки гіпотези, а не вводити ще один процес для пояснення. Відповідна композиція R2 зберігається у файлах R2.

| R3 | Джерело R2 | Видимий зміст | Бюджет |
| ---: | ---: | --- | --- |
| 1 | 1 | AI Changes the Delivery System and the Product Itself | 00:00–01:00 |
| 2 | 2 | We Accelerated a Step. Not the System. | 01:00–03:30 |
| 3 | 3 | The Evidence Is Already Messy — повний незмінений reports-слайд | 03:30–07:30 |
| 4 | 4 | The New Scarcity Is Human Comprehension | 07:30–09:30 |
| 5 | 5 | We Are Searching for a New SDLC Equilibrium | 09:30–11:30 |
| 6 | 6 | When Software Starts Thinking — один приклад і межі делегування | 11:30–14:30 |
| 7 | 9, переосмислений | Delegation Changes the Sociotechnical System | 14:30–17:30 |
| 8 | 10 | Engineering Rigor Moves — It Doesn’t Disappear — чотири питання | 17:30–19:30 |
| 9 | 11 | Continue the Conversation — один QR на сайт | 19:30–20:00 |
| | | Q&A, QR залишається видимим | 20:00–27:00 |
| | | Резерв | 27:00–30:00 |

Новий орієнтир — **20 хвилин презентації, 7 хвилин Q&A, 3 хвилини резерву**. Це редакторський ліміт для перевірки, а не підтверджений хронометраж. Повний reports-слайд залишається без змін змісту й композиції; його усне пояснення виділяє різницю між тим, що вимірюють дослідження, а не послідовно зачитує кожну клітинку. Деталізоване читання всіх блоків потребувало б іншого бюджету.

Аргумент про нерівномірну зміну SDLC, пошук рівноваги, гіпотетичність operating models і соціотехнічні наслідки делегування залишається. R1 і R2 та їхні нотатки зберігаються без змін для порівняння. R3 має власні PPTX, PDF, короткі нотатки й edition.json; запис події вибирає точний PDF R3 через шлях і SHA256. [R3 review](../../review/issue-109/2026-10-19-r3-review.md) перевіряє саме цей новий обсяг, кожний видимий слайд і 3–5 речень до нього. AC06 — авторський перегляд, репетиція і пристрій — залишається відкритим.
