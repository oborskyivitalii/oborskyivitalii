# Issue 169 — 2026-11-05 editorial comparison with DevCon Romania

Owner: [issue 169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169), [Draft PR #170](https://github.com/oborskyivitalii/oborskyivitalii/pull/170).
Status: editorial analysis and proposed plan for author agreement. The manuscript, images, publication selection, PDF and platform editions are unchanged.

## Intent and inspected source

The author asks to agree the article before continuing publication, using the speech and slides from the Romanian talk presented on 4 November. This instruction pauses dependent editorial implementation/publication while the proposed treatment is discussed; it does not revoke historical R4 approval or claim acceptance of new text.

- Article R4: site/publications/sdlc-out-of-balance/manuscript.en.md at d2271a8beed6be4be2e2e2daee2a9434b3987238, Git blob 31ac025e76fbc414e154a1e594795b491068ad40, SHA256 888dcbb81866b06d5f7729b3eca348fe488563bda60651368ee03851e0acabc2.
- Main observed through current PR metadata:8cf15883125892710633b17133d9ee0fc4b23b92. PR #170 remains Draft/open/unmerged.
- Final delivered R12 speech: Library libfile_d4ebe5850f08819188290299aedf5d0e,14964 bytes, SHA256 26a2c948e86b8c30c01e5d705e68705b34696862eb62c510e77083300599e269.
- Final R12 deck PDF: Library libfile_7da84a307c108191914914c823125ff0,9 pages, SHA256 b49a25598a8fbbfcd012f3a85e2a83e1c4707988d27328453ebdcedeaaa37f67.
- Matching PPTX: SHA256 62078b50206fa2d5125e96af5b024c334c8f351c5459cbb1b70c8d9f338f07cd. All9 PDF pages, visible slide contents and all9 spoken sections plus qualifications were inspected. Native slide relationships were checked by White-box.
- The local subsequent R13 request changes only presenter cues and preserves R12 visible slides/full speech. PR #110 still describes an older R9 deck/R14 standalone speech; its larger script revision number does not make it the latest delivered talk package.
- Prepared files establish intended content. Actual spoken delivery is known only from the author's report, not a recording/transcript.
- README, root AGENTS, applicable repository map, dated MEMORY, CONTRIBUTING, site source/editorial/provenance and acceptance/check-profile routes were consulted. Map inspection found no additional nested AGENTS in the relevant source routes. MEMORY concerns older issue167 work and is not current issue 169 authority.

The Library R4 PDF currently exposed under libfile_784d2458ca808191acfb4063299a040d is a4page derivative. PROVENANCE explicitly distinguishes it from the selected5 page R4 PDF, SHA256 be35778ef93948ca7e809b7917faf1771d11e670e327a0dfc49d95ab4cfc2d98. Its pages were read for context; no final selected-PDF pagination acceptance is inferred.

## Висновок

Потрібна точкова редакція, а не перетворення статті на повний конспект презентації. Найбільше бракує конкретного механізму: обмеження всередині розробки, потім discovery і валідація корисного попиту, потім здатність користувачів засвоювати зміни.

Ownership, функції рев'ю, петля перевантаження, відповідальний owner і перевірка гіпотез уже є. Їх варто зробити чіткішими, а не додавати повторно. Стаття сильніша за спіч у вимозі надати owner повноваження, бюджет і міжфункціональну підтримку; це потрібно зберегти.

## Findings and dispositions

| ID | Презентація / місце статті | Знахідка | Пропонована зміна |
| --- | --- | --- | --- |
| F01 | S02; The workstream is not the system | Бізнес-результат названо, але перехід обмеження до discovery і користувачів не пояснено. | Додати стислий ланцюжок: downstream capacity; достатньо перевіреної корисної роботи; час користувача на навчання й зміну звичок. Це можливі обмеження, не неминуча послідовність для кожної організації. |
| F02 | S02; opening / When acceleration eats delivery capacity | Спіч пояснює чергу конкретніше. У статті вже правильно виділено admitted work. | Додати thought experiment: усі стадії пропускають8 порівнюваних змін на місяць; генерація зростає до100, downstream лишається 8. Якщо прийняти всі 100, очікування зростає на 92/місяць. Якщо обмежити admission, внутрішній WIP може лишатися обмеженим; зайвий попит чекає поза workflow. Числа виключно ілюстративні. |
| F03 | S03; AI code review, shared understanding and ownership | Аргумент уже сильний, але спіч дає коротшу причинну конструкцію. | Один раз назвати comprehension gap: зміни можуть випереджати здатність команди розуміти те, за що вона відповідає. Завершити вимогою зберігати flow і learning разом. Не вимагати читати кожен рядок і не створювати другий ownership-розділ. |
| F04 | S05; Rebalancing the SDLC requires an accountable owner | Є метод гіпотез, але мало прикладів, які можна перевірити. | Додати2 короткі пари: agentic review — чи достатні незалежні перевірки й чи не мають моделі спільних сліпих зон; living documentation — хто перевіряє опис і чи вистачає його для діагностики та відновлення. WIP/admission лишити явним прикладом керування потоком. Не переносити всі 6 карток. |
| F05 | S05; pilot paragraph | Спіч краще враховує обмежений бюджет і зворотний зв'язок команди. | Одне речення: малий бюджет означає вужчий пілот; занепокоєння команди, зокрема скептиків, допомагають виявляти приховані витрати й перевіряються поряд із користю. Це не заміна перевірки результатів. |
| F06 | S04; first evidence paragraph and Evidence note | Стаття вже називає тезу My diagnosis і містить коректний evidence note, але пояснення статусу доказів віддалене від вступу. | Зберегти центральний діагноз і коротко наблизити застереження до першої згадки досліджень: вони підтримують частини механізму, а не вимірюють поширеність розбалансування в індустрії. Не переносити dashboard і його числа без окремої перевірки оригіналів. |
| F07 | S01; small-team paragraph | Приклад3–5 людей може читатись як доведений поріг. | Вжити «невелика команда зі спільним контекстом і ролями» або прямо позначити число прикладом. Зберегти різницю між малою командою й enterprise. |
| F08 | Opening, vendor catalogue, final2sections | Повторення тези витрачає місце, потрібне для пояснення механізму. | Скоротити повтори локальне прискорення/системний результат, ущільнити перелік vendor accounts і з'єднати фінальні секції в послідовність owner; hypothesis; intervention; evidence; keep/change/stop. Зберегти всі релевантні джерела, коректну атрибуцію та позитивний Claude Code case. |
| F09 | S06–S09; closing bridge | Друга половина виступу — окремий предмет дослідження. | Залишити короткий перехід до runtime judgment і related work. Не переносити формули, DoR/DoD, control architecture, окрему R&D-секцію, дві 98% вибірки, історичний вступ, біографію і conference CTA. |
| F10 | Talk reference | Автор уже виступив4 November. | У наступній редакції вказати completed talk/date на підставі повідомлення автора; не видавати підготовлений спіч за дослівний запис виступу. |

F01–F05 are editorial priorities. F06/F07 protect claim interpretation. F08 funds clarity without broadening scope. All proposed treatments await author agreement.

## Ілюстрації

Зберегти hero і 5 пояснювальних ілюстрацій загалом. Пропоную змінити максимум 2:

1. **Workstream/system:** додати невеликий блок із 8/100/+92, admission boundary, upstream validation та user adoption/feedback. Зберегти нижній шар learning, ownership, dependencies і recovery, щоб не звести систему назад до лінійного pipeline.
2. **Review functions:** додати компактний comprehension-gap елемент зі S03, якщо він читається на мобільному і в друці. Верхні review functions лишаються атрибуцією Bacchelli/Bird; розширення до operational ownership/recovery — авторський синтез.

Якщо обидва елементи не вміщуються, пріоритет має конкретний capacity/admission example. Не зменшувати шрифт заради копіювання щільного слайду; текстовий приклад прийнятний. Не додавати сьому ілюстрацію. Криві, числа та розриви позначати концептуальними; жодних stage rankings або виміряних темпів вони не встановлюють.

## Ordered plan / proposed acceptance

1. Автор погоджує цей обмежений набір змін; основний діагноз, тема і формат лишаються.
2. Підготувати пропоновану R5 англійською з видимим diff до R4: прибрати повтори, додати capacity/admission example і upstream/user passage, ущільнити comprehension mechanism.
3. Додати 2 hypothesis/failure pairs і конкретизувати перевірку ownership: чи може команда пояснити зміну, знайти причину проблеми й відновити сервіс у прийнятний для бізнесу час. Це приклад перевірки, не універсальний норматив.
4. Змінити максимум 2наявні ілюстрації; caption/alt/provenance узгодити з новим текстом. Preserve6 visuals.
5. Показати повний новий текст та ілюстрації для погодження. Target приблизно1400–1500 body words; не гарантувати page fit до render.
6. Після editorial agreement синхронізувати native source/selected edition, PDF, LinkedIn і Medium copies через наявні механізми. PDF 3–5 сторінок разом із джерелами; фактично перевірити всі сторінки та відповідність редакцій.
7. Подальші existing review/check/staging/release gates лишаються чинними. Нові джерела або числа потребують окремої original-source перевірки. Поточні release blockers цим аналізом не вирішені.

Current R4 body count: 1221 whitespace-separated words excluding headings, title/dek/byline, alt text, references, biography and rights; 1275 including section headings. Raw file count 1846 is unsuitable for the body budget. Alternative counting conventions were disclosed by reviewers; final revision must use one recorded convention. Additional prose is feasible, but5 page fit is not yet observed.

Acceptance for the proposed revision:
- Reader can explain generation vs admission, the conditional queue, and where waiting moves.
- Reader can follow engineering capacity, validated demand and adoption without treating them as universal sequential constraints.
- Review replacement still supplies sufficient learning, diagnosis and recovery capability.
- Selected interventions are hypotheses with benefits, failure questions and stop/change decisions.
- Central thesis, positive evidence, fair vendor attribution, empowered owner and evidence limitations survive.
- Six visuals and a rendered3–5 page PDF including sources; exact edition parity verified.
- No whole-issue AC or publication claim until its actual required gates pass.

## Independent review executions and assurance

Four distinct nonauthor reviewers were actually launched using explicit fork_turns="none", with no model override or peer verdicts in their initial packets. The tools returned the following accepted handles, each followed by its own completed first result in the session record:

| Role | Agent handle | Inspected scope / own result | Limits |
| --- | --- | --- | --- |
| Requirements & Acceptance | /root/editorial_requirements | Complete R4/R12 comparison; focused revision justified; original author decision precedes integration. | Full owning-issue AC body not supplied to reviewer; no whole-issue acceptance. |
| Code / changed artifact | /root/editorial_artifact | Complete article/speech,9 page deck text and contact sheet; identifies real omissions and protects existing stronger article passages. | Actual R4 image bytes/layout not independently certified. |
| White-box QA | /root/editorial_whitebox | Native PPTX order/text,9 PDF pages, source hashes, visual count, body count, conditional admission arithmetic and all9 slide dispositions. | Original external studies not reverified; no runtime/website tests. |
| Exploratory / reader QA | /root/editorial_reader | Actual reading of article/speech and visual contact sheet; tests mechanism/outcome/action comprehension paths. | Reader inspection is not audience research, browser/device or pagination acceptance. |

Initial materialization accidentally appended one extra trailing LF to the article, hash6b7941cd465b108f12b49d06ea83e1366c2c80144f5ae289b2e6e192efa33d48. The orchestrator removed it to restore exact upstream bytes. White-box proved the delta is precisely that LF, reread final888dcbb… source and bound its result to it. Other initial judgments inspected semantically identical prose; their original hash observations are preserved, not relabeled.

Reviewers generally recommended making the opening's claim status explicit. Orchestrator disposition: retain the author's already explicit "My diagnosis" and central industry-level thesis; move a concise existing synthesis limitation nearer the evidence claim. Do not silently replace the thesis with a different, weaker claim. This treatment is a proposal for the author's decision.

Actual requested fork setting and returned task handles are observed; provider-internal model/context isolation is unknown. Shared filesystem access is not a security sandbox. Independent findings concern source comparison and proposed treatments, not an accepted new manuscript, scientific validation or release readiness. Full first results remain in the actual session task records; this table is a synopsis, not verbatim receipts.

## Checks, repository disposition and issue synopsis

This is a source-subset editorial report. No native local Git checkout was available; git status found no repository and remote Git transport lacked credentials. GitHub source/ref observations were used instead; no synthetic HEAD was created. No website Basic, RI regeneration, hosted test, native layout/device test or release check was run for this report. Indexed report admission/RI refresh and exact-head checks remain pending for the next native repository iteration; this file cannot establish a clean/generated/admitted branch.

AC01/02/03/04/07/08/09/11: proposed affected editorial/source/visual/edition checks above; existing whole criteria remain open. AC05 native/source-bound verification remains pending. AC06 remains the historical completed Draft-delivery milestone. AC10 related-reading behavior unchanged and not retested. No checkbox is changed without new whole-criterion evidence.

Dated issue synopsis: R4 was compared with the actual delivered R12 speech/deck, rather than older PR #110 sources. Recommended bounded revision: concrete admission/capacity example, discovery/user constraint extension, sharper comprehension mechanism,2 testable intervention examples, less repetition and at most2 existing-figure changes. Runtime-control material stays in its separate topic. Author agreement on the article comes before dependent edits/publication. Article/visual/PDF bytes remain unchanged.
