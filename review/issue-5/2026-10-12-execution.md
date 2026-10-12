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

## PR79 continuation — 12 October

Revalidated raw head `5a84ef65fa4e188c6fe9366dc03e9aedde851f2d` against main
`cc115c4241197d59205934bdc18f209109d5ee87`, a clean new checkout, live #5,
current PR discussion and workflow results. Navigation38266043335 and owning
acceptance38266043268 passed. Basic38266044217 failed its unchanged180-second
source bound; preview38266044015 passed four existing smoke cases and exact
hosted bytes, then failed an immediate image-completion assertion. These runs
remain failed historical attempts.

The collector now waits within the existing journey timeout for image loading
before requiring positive native dimensions. A real browser experiment held
PNG responses for five seconds: original collector failed, corrected collector
passed the390px article journey, and a broken PNG still failed. The observation
used the already declared review-only Chromium153, not managed-browser admission.
Its exact transient source/artifact fingerprints were retained outside the checkout;
final hosted CI still has its own required source identity.

Pristine test preparations are copied into isolated mutable fixtures for article
and candidate-source suites. Their explicit cold/incremental/retention and source
reconstruction proofs remain;14 cases passed in13.886seconds. Frozen translation
pinning required corresponding unpublished offline fixture bookkeeping; all13
offline cases then passed. Timeout errors now retain bounded partial TAP and
stderr without accepting incomplete execution.

Independent review found and fixed F21 translation lineage and F22 selected
platform document events, with real committed negative cases. Code owners are
`semantic.cjs`, `events.cjs`, `article-browser.cjs`, source diagnostics and tests;
CS01–CS10 routing and original source/runtime/resource budgets remain. Ordinary
documents/previews, output lock, path catalog and RI/CI are regenerated. The new
Color identities retain all five runtime bytes and every historical tuple;33
source cases passed after the explicit fixture identity refresh.

One broad prepared-source attempt ran59 modules in146.147seconds but failed:
13 offline fixture pins and two stale Color tuple expectations. Its665/650/15
accounting is diagnostic, not acceptance. All15 causes were individually corrected
and targeted suites passed. The next clean-head source/owning/hosted runs provide
the final evidence; a passing plan or the earlier651-case run cannot substitute.

#5 retains all original criteria and AC01–AC12; #2 retains separate AC01–AC06
and accepted recording AC07–AC08. The PMDay source/PDF/platform candidates remain
prepared editorial material with pending rights/canonical/dates. Public posting,
production activation, upstream disposition, stable promotion and merge decisions
are not supplied by this engineering continuation.

[Delayed/broken image phase observations](2026-10-12-image-load-regression.json.gz)
and [refreshed Color/staging browser observations](2026-10-12-color-runtime-continuation.json.gz)
retain exact observed fingerprints and the declared review-only browser. Both
Color widths1440/390 passed; all prior runtime files and flight/resource guards
were preserved. These local observations do not claim a managed hosted CI pass.

CI cost follow-up preserves the complete source selector and180-second bound.
The unchanged source of each executive negative loop now has one restored
baseline per page/test:55 duplicate restorations removed, with every mutated
input and assertion still executed. Space precompiles its immutable script once,
then executes each visit in a fresh isolated VM context and globals. No scene,
mutable context, draw result or test case is shared/removed. The serial prechange
pair passed70/70 in207.090seconds; this diagnostic pair is not the parallel PR
profile. Current-source CI determines whether the unchanged PR bound is met.

The optimized serial executive/space pair passed70/70 with no failures/skips:
195.297seconds versus207.090seconds before (5.7% aggregate reduction). Executive
case time improved17.6%; Space did not show a measured speed improvement, so
none is claimed. Independent AST review confirmed unchanged cases, assertion/
mutation sites, input loops and fresh contexts. Source selector/budgets remain.
Current focused publisher/offline/selection passed38/38; RI regressions28/28,
Color admission33/33, Basic, formatting/ownership and lint passed. Security
scanners passed with zero untriaged findings after exact153 new public-checksum
entries (150 generated values plus three independently reviewed Color identities).
These are prepared-source checks; clean-head CI and hosted smoke remain the next
required evidence, with all original human/merge/publication gates retained.

### Native history follow-up from 7b28592

Clean-head owning38270824805/navigation38270687779 and Basic38270688879
passed. The59-module additional-source selector ran665/665 cases in125.320seconds
under the unchanged180-second bound. Hosted38270688307 passed exact HTTP bytes
and all four ordinary smoke cases, then failed article Back focus/scroll at the
unchanged2-second/2px predicate. It remains a failed hosted attempt, not admission.

Independent native-history investigation reproduced the ordering defect in
actual authored functions: departure save happened after content became inert,
which can blur an in-content link to BODY. A real browser inert/layout check
confirmed native focus loss. Departure state now saves before visibility/inert;
inert timer writes cannot overwrite it. Interrupted unmounted travel retains
its matching entry's focus only as fallback; newly focused controls win. Initial,
pop/history, delayed350ms save and rapid retarget regressions pass (23 navigation
cases). Collector samples the actual activation event after browser actionability
scrolling, preserving strict focus,2px and2-second checks, and retains failed
article checkpoint diagnostics.

New Color history identities bind the changed navigation bytes explicitly.
Every prior family/tuple and all other runtime files remain; actual browser
observations and fresh clean-head hosted evidence have their own source limits.

[Native history browser observations](2026-10-12-native-history-browser.json.gz)
passed all five article cases (1440/390 normal;390 Off/no-Canvas/no-JS) plus
Color1440/390 at the corrected history runtime. Actual reading/focus/scroll,
query/head/anchors and cancellation checks passed. Prepared-source and explicit
review-browser limits remain; new clean-head hosted admission is still required.

The final history capture helpers preserve the independently reviewed ordering
and conditions while keeping the pinned complexity cap: lint passes with no new
warnings or exceptions. Navigation/fixture cases pass42/42 and article cases
11/11; the article save harness explicitly models non-inert ordinary content.
Final browser observations above were repeated after that source refactor.
All five earlier Color families/ten tuples remain unchanged; the new history
tuple binds the corrected navigation, with the other four runtime files retained.

Independent final checksum proof authorizes exactly156 new public-hash ledger
entries. All prior records, scanner rules and the complexity cap remain; no
unknown secret or wildcard disposition is admitted. Final source, RI/CI,
formatted owners and generated artifacts are checked before publication of
the follow-up commit; its clean-head CI is recorded in the live PR.

### Source scheduler follow-up from 27717ab

Exact `27717ab` / tree `18e4f6ec` owning38275661202/38275683555 and navigation
38275661203 passed. Hosted38275661643 passed exact HTTP, four ordinary cells,
all five article cases and two-width Color on managed Chromium153.0.8010.12.
The immutable preview is `https://578f5008.oborskyi-author-ci-staging.pages.dev`;
public digest `8cf2b9dda7eb77f1453011fd3160257ce60719f096d0e40f0765c99635c74ce6`.
Its successful smoke artifact11758504642 was independently inspected. These
results establish the corrected native history in that source-qualified preview;
they do not promote stable staging or satisfy editorial/device/release gates.

Basic38275662062 failed the unchanged 180-second source bound. Partial TAP
cannot supply complete case accounting, despite the observed passing cases.
Actual Basic worker capacity was not retained and remains unknown. A diagnostic
with only an explicit two-worker CLI cap also timed out: Node CLI sorts files,
leaving the expensive Space suite late. Neither failure is relabeled or retried
as admission.

The materially different API-order diagnostic starts selected Space/executive
first, with the same 59-module inventory, two isolated file workers and serial
per-file defaults. It passed 670/670 in 168.230 seconds, with zero failed, cancelled,
skipped or todo cases and clean `27717ab` before/after. This measured experiment
motivates a maintained internal worker, explicit failure exit codes and awaited
built-in TAP completion; it is not CI admission. The 180-second and 16MiB bounds,
selector, existing cases, immutable fixtures and strict accounting remain.
[Full scheduler diagnostic observations](2026-10-12-source-scheduler-diagnostic.json.gz)
retain both results, actual source, module order, complete captured output and
the prototype's plain-pipe caveat; the maintained worker awaits its pipeline.
Fresh CI on the scheduler commit owns its final result. Runtime/public bytes,
every Color tuple and publisher content are unchanged by this scheduling work.
