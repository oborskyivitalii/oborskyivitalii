# Issue 5 — 2026-10-12 execution plan and P0 evidence

Owning issue: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Approved combined route: [12 October decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6124024830).
Owning PR: [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), the single #5 execution route.
Role: execution self-analysis, informed by the two prior independent plan reviews.
Baseline: site `cc115c4241197d59205934bdc18f209109d5ee87`, clean local clone.
UA main: `345c8f50745e5fde1303d0d7952634f7899220c9`.
This report records implementation evidence. Editorial, rights, device, hosted admission and public-release acceptance remain separate.

## Intent and acceptance

One PR implements reusable authoring/publisher/reader mechanics for #5 and
prepares the real PMDay explanatory article required by #2. The two issues keep
their distinct intent and gates. #5:AC01–AC12 remain stable and open; the selected
policy maps every criterion before implementation readiness. #2:AC01–AC06
remain separate, and its previously accepted recording increment is preserved.

The final case is useful editorial content, not a disposable fixture. Blueprint
and pinned presentation/source selection start beside tooling. Full article,
article PDF, LinkedIn adaptation and Medium package finish the end-to-end proof.
A second distinct profile and meaningful negatives establish reuse.

## Findings

| ID | Evidence | Implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| P01 | Current five routes, shared Canvas and navigation owner | Article identity is distinct from its Writing scene; no sixth room | AC08 | Implement |
| P02 | UA manual line/pipe table parser | Use Markdown AST; escaped pipes and fenced examples must survive | AC03, AC09 | Implement |
| P03 | UA print depends on Quartz build/index/selectors | Validate a narrow print HTML model; explicit build-only ESM/CJS boundary | AC02, AC04 | Implement |
| P04 | Site finish removed backup before lock write | Public tree and mandatory output lock form one recoverable transaction | AC08 | Implement |
| P05 | Publication prose, rendition and event are different identities | Freeze semantic content separately from render artifact; no inferred publication | AC07, AC10 | Implement |
| P06 | UA-specific figure/deck/research furniture | Inventory/extract narrow reusable behavior; keep research governance upstream | AC01, AC05 | Implement |

## Decisions

The user authorized execution on 12 October: “Ок. Починай працювати”.
Create one Draft PR with one standalone ownership selector for #5. #2 is linked
as the publication deliverable, without a competing selector. Production
activation, external editor publication and upstream PR disposition retain
their declared decisions. Prepare concrete outputs and checks before any
dependent decision is needed.

Canonical source additions: `site/publications/<id>/` for metadata, blueprint,
manuscript, profile and authored adaptation; `tools/publishing/` for isolated
build-time AST/export logic. Existing `site/content/catalog.json` owns archive
selection. Runtime never imports Markdown or build tools.

Preview candidates use an explicit selection contract. Default public builds
include only eligible accepted/published article editions. Draft source,
blueprint, review kits and unpublished assets cannot enter production output.

## Sol tasks

| Task | Owner paths and behavior | AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Publisher source/model/AST/provenance/events/platform/transaction tools | AC01–AC07, AC09–AC10 | Publisher behavior and failure suites | Implemented; final clean-source evidence follows |
| T02 | Site build/document/reader/navigation/immutable closure | AC03, AC07–AC08 | Native documents, runtime behavior, delivery negatives | Implemented; final clean-source evidence follows |
| T03 | PMDay blueprint, pinned v35 sources, full text and adaptation | AC02, AC06, AC09; #2:AC01–AC03 | Whole-text/source and candidate review | Implemented; final clean-source evidence follows |
| T04 | Catalog, RI/CI, source profiles, acceptance and bounded hosting | AC04, AC08, AC11–AC12 | Current-source mapped checks and controller evidence | Implemented; final clean-source evidence follows |
| T05 | Independent implementation/export review and final reconciliation | AC11–AC12 | Exact-head review and AC matrix | Independent review completed; exact-head binding follows |

## Code style plan

| Rules | Owners | Verification |
| --- | --- | --- |
| CS01–CS02 | Publications, publisher model, site templates/catalog | Explicit dependency direction, schema negatives and independent architecture review |
| CS03–CS05 | Reader/print CSS, templates and build-only module bridge | Canonical CSS, bounded guard, format/lint and readable touched functions |
| CS06–CS07 | Navigation/Canvas/cache/disposal and build/export resources | Real lifecycle cases, finite descriptors/cache, byte/time observations |
| CS08–CS10 | Tests, policy, profiles and RI companions | Meaningful failure cases, selected suites, complete current-source AC evidence |

## Acceptance evidence

Initial clean baseline Basic passed: 24 focused named cases (14 theme/archive,
10 Color flight), five routes, complete artifact/syntax/geometry checks,
maximum raw HTML 99,782 bytes. This proves the existing baseline, not the new
publisher. It does not supply PDF/editorial/browser/staging acceptance.

Current prepared implementation has full source-bound PMDay HTML, an authored
LinkedIn adaptation, Medium equivalents, article PDF and distinct deck review PDF.
The native reader uses Writing with complete document heads, one persistent shell,
finite document identities, deep links and retained immutable closure. Ordinary
builds and fifteen offline previews exclude the explicit draft. Selected offline
export embeds five rooms plus exactly one article and verifies its local PNG bytes.

Meaningful tests cover AST fidelity and explicit rejections, two different profiles,
Git/source pins, immutable history, independent adaptation titles, observed events,
complete kit/PDF/public-tree/lock/HTML-manifest transactions, bounded resources,
source/output alias rejection, cold/incremental/rename/delete/retention, delivery
identities and byte budgets. Candidate package verification cold-reconstructs the
same explicit selection and delivery layers; missing or altered selection fails.

Prepared-source evidence: publisher63 cases, reader integration143 cases,
independent13-module review135 cases and final late controls61 cases, maintained helper focus26 cases and Color
source28 cases all passed in their named runs. These overlapping suites are not
summed. Final prepared-source production selector passed all57 permanent Node
modules:651/651 tests, zero failures/cancelled/skipped/todos in132,314ms, within
the unchanged180,000ms bound. F20 input-root aliases reject before any document
or manifest mutation; native/offline/Color observations were refreshed on the
new producer. The complete TAP is retained outside the checkout for exact-head
comparison and PR evidence. Full lint passed257 sources without warnings. The publisher dependency
scan reviewed71 resolved dependencies with zero findings; the existing quality
graph retains its separately reviewed exceptions. Final source-selected suites,
RI/CI and acceptance are rerun after committing; these working-tree observations
are not substituted for a clean exact-head run.

Actual local-browser inspection passed nested `/project/staging/` normal1440/390,
Off/no-Canvas/no-JS390 and selected `file://` JS1440/no-JS390. Original five-room
counts and budgets remain unchanged: candidate article75,782 UTF8 bytes,314,649
combined gzip transfer; Writing95,821 bytes; selected standalone494,844 gzip bytes.
The new issue5 Color family admits reviewed exact plain/staging hashes while all
legacy tuples remain intact. Its initial footer-selector failure stays recorded;
corrected observed evidence is linked by the independent Color review.

The five-page article PDF uses explicitly declared review Chromium153.0.8010.0.
The locked Playwright managed Chromium download is unavailable in this environment;
its default path fails with a named diagnostic and creates no partial output.
The review fallback is marked `reviewOnly`, with exact package/archive/binary hashes.
It does not establish locked-browser, native-editor, physical-device or hosted CI
admission. Candidate source/kit/PDF/offline manifests and clean-source run identity
are recorded in the final candidate README and PR evidence after the source commit.

| #5 criterion | #2 relationship | Shared check evidence | Remaining whole-criterion gate |
| --- | --- | --- | --- |
| AC01 | AC02–AC03 sources | PUBLISHER, CURRENT-RI; pinned migration inventory | Inventory/license/upgrade acceptance |
| AC02 | AC01–AC03 article/deck/PDF | PUBLISHER, READER, DELIVERY; real candidates | Editorial/rights/visual acceptance |
| AC03 | AC04 draft versus release | PUBLISHER, READER; default/preview leak negatives | Isolation review |
| AC04 | AC03 reproducible candidate | PUBLISHER, DELIVERY, RI-CI; two profiles, exact locks | Dependency/cost/upgrade review |
| AC05 | AC06 upstream treatment | CURRENT-RI; separate source pins and compatibility inventory | Shared UA/Subprime decision and deck disposition |
| AC06 | AC01 complete text | PUBLISHER; blueprint/manuscript/adaptation/source review | Editorial and rights decision |
| AC07 | AC04 accurate edition | PUBLISHER, READER; historical catalog and distinct identities | Identity/relationship review |
| AC08 | AC01/AC04 native page | BASIC, READER, DELIVERY; browser and retained closure | Exact hosted/device/reader admission |
| AC09 | AC05 posting candidates | PUBLISHER; two profiles and complete upload/copy kit | Candidate furniture/native-editor review |
| AC10 | AC04–AC06 publication | PUBLISHER, READER, DELIVERY; observed-event negatives | Actual release/publication decisions |
| AC11 | AC01–AC03 independent review | STYLE-GUARD, CURRENT-RI, RI-CI and all behavior suites | Exact-head independent/human acceptance |
| AC12 | AC04–AC06 later delivery | BASIC, CURRENT-RI, RI-CI and all behavior suites | Current-source CI/hosted staging and applicable merge decision |

The selected policy keeps each non-automated gate explicit. No whole #5 criterion
is ticked merely for implementation or generated hashes. #2AC01–AC06 stay open;
its accepted AC07/AC08 recording increment is preserved. Source references are
UA main345c8f5 and independent v35 deck22639d3; source stewardship stays upstream.
No publication event, live date, accepted canonical, external posting, source-repo
closure, merge or production activation is fabricated.

## Issue synopsis

PR79 implements reusable publisher/authoring mechanics and the real PMDay candidate
in one route. Full HTML/PDF/platform/offline outputs and meaningful negatives are
reviewable; independent findings were corrected. Exact clean-source checks and
candidate preview are recorded in the PR. The issues retain separate editorial,
rights, upstream, device and actual-publication decisions.
