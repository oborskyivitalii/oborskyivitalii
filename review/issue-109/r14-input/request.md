# R14 speech alignment request - 2026-11-02

## User request (verbatim)

Перепиши і скрипт розмови відповідно до змін слайдів. Тобто не переписуй все а просто перемісти блоки тексту в потрібному порядку. Ну і там де слайди змінили теж акценти в тексті розстав. Мета та сама. Говорити стисло і економно і не вилізти за ліміти слів. Зараз наче актуальна версія в репо спІчу доволі стисла

## Primary inputs

Repository oborskyivitalii/oborskyivitalii, issue 109, Draft PR 110, branch work/issue-109-devcon-romania-r1. Base/current checkout 6bd9e990251a6211f56ce6ba424960fe24879a71; native clean checkout before this packet.

Speech source: drafts/devcon-romania-2026/devcon-romania-2026-r13-concise-stage-script.md.
Deck target: drafts/devcon-romania-2026/r9/; its PDF and native PPTX are retained unchanged.
R9 delivery order relative to R13: [1, 2, 4, 3, 5, 6, 8, 7, 9]. This is a speech revision, not a new presentation edition. R13 and the R9 package must remain byte-identical. A new standalone R14 script and optional reading PDF may be produced. Source claims and caveats remain; no new research is requested.

## Scope and observable constraints

1. Reorder existing blocks to match the actual R9 deck. Update headings, internal slide references, delivery cues and source mapping accordingly.
2. Retain the seven otherwise unaffected spoken blocks verbatim. Edit only the new S07/S08 bodies as needed for changed visual emphasis, clear transition, and moving runtime material out of planning.
3. S07 covers control architecture, human dependency where needed, project viability and evidence before delivery budget commitment. S08 covers evaluation, conditional live exposure, ongoing control-system observation including human response capacity, and intervention.
4. Preserve the same concise delivery goal. Compare R13 and R14 spoken words with the same explicit tokenization; count only Slides 01-09 bodies. The existing stated baseline is 1552. Headings, notes and sources are not spoken. R14 must not exceed that baseline under the reproduced count. Timing estimates are arithmetic scenarios, not rehearsed facts.
5. Preserve source caveats and the distinction between average results and prohibited outcomes; preventive controls and the limits of rollback/canary; human fallback must be feasible.
6. Existing acceptance gates remain; no merge, event selection or public release. Author delivery/rehearsal/device approval stays pending.

## Review boundary

Read only this packet, named source artifacts, applicable repository instructions/policy, and necessary existing verification owners. Do not read current peer result files, parent scratch notes, unrelated memory or chat history. Shared filesystem is not OS isolation; provider internal context is unknown. No implementation, tests, external writes or delegation. Write only assigned reviewer output. First independent result must be preserved.
