# Issue 5 — 2026-10-12 execution plan and P0 evidence

Owning issue: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Approved combined route: [12 October decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6124024830).
Owning PR: this branch's single Draft PR; exact link recorded after creation.
Role: execution self-analysis, informed by the two prior independent plan reviews.
Baseline: site `cc115c4241197d59205934bdc18f209109d5ee87`, clean local clone.
UA main: `345c8f50745e5fde1303d0d7952634f7899220c9`.
No implementation, editorial, rights or public-release acceptance is claimed here.

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
| T01 | Publisher source/model/AST/provenance/events/platform/transaction tools | AC01–AC07, AC09–AC10 | Publisher behavior and failure suites | In progress |
| T02 | Site build/document/reader/navigation/immutable closure | AC03, AC07–AC08 | Native documents, runtime behavior, delivery negatives | In progress |
| T03 | PMDay blueprint, pinned v35 sources, full text and adaptation | AC02, AC06, AC09; #2:AC01–AC03 | Whole-text/source and candidate review | In progress |
| T04 | Catalog, RI/CI, source profiles, acceptance and bounded hosting | AC04, AC08, AC11–AC12 | Current-source mapped checks and controller evidence | In progress |
| T05 | Independent implementation/export review and final reconciliation | AC11–AC12 | Exact-head review and AC matrix | Pending |

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

Specific executable checks and source-qualified #5↔#2 mapping are added as
contracts land. Every whole criterion remains open until its required checks
and non-automated gates are observed. Reports are kept outside the checkout,
then bound to the committed source. Draft, reviewed, staged, merged and
published remain distinct states.

## Issue synopsis

Implementation began from exact current main in one Draft route. The publisher,
Writing reader and PMDay source work run in parallel; migration/export/browser
proofs and independent review remain pending. No production is activated.
