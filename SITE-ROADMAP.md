# Vitalii Oborskyi — site and publishing roadmap

## Current v6 — camera journeys and recursive sculpture

The maintainer rejected v5's slow linear motion and simple forms. v6 follows
smooth cylindrical splines around more intricate compositions, with changes of
angle, height and distance. Recursive tetrahedral structures and branching
contours share the existing cyan/amber palette. Writing uses helicoidal strata;
Talks uses an outward loop; Credits uses an abstract recursive network.
Home/Research now give the eight existing discussion entries LinkedIn profiles
and evidence-bounded professional context. Employer gaps are documented in
[SITE-SOURCE-AUDIT](SITE-SOURCE-AUDIT.md), not filled by inference.

[All five pages](review/site-v1-20261002-v6-index.html) and
[execution/evidence](review/sol-visual-v6-20261002/EXECUTION.md) own current
checks, browser observations and limits. Native scroll/topic behavior, Off/reduced
freeze and idle stop remain. No merge, release or new independent review.
The checkpoints below describe their historical editions.


## Historical v4 execution — 2026-10-02

The instructed [SOL-HANDOFF](SOL-HANDOFF.md) has a concrete v4 candidate in Draft
PR #10: two buyer problems, seven-section Home, five exact EN works, eight bounded
public discussion entries, three offers, contact, native facets and scroll/topic-only
scene. [Execution and evidence](review/sol-execution-20261002/EXECUTION.md) records
preserved archive/assets, tests/exports and the fresh browser access block.
Implementation and available checks are complete; browser/editorial/rights/URL,
base integration and deployed acceptance remain. M1 stays active.

Free SEO evidence refines wording; #11 guides/measurement remain after launch and
PMDay #2. #5/#6 publishing/harness migrations are independent. Earlier v3 progress
entries below are historical and do not define the current counts or motion.

Status: first-site preparation. Started: 2026-10-01. This document tracks decisions and verified deliveries; it does not authorize automatic publication, PR merges, or changes to the other repositories.

## Purpose and boundaries

Build a personal author site for articles, research directions and talks that cross Uncertainty Architecture (UA) and The Subprime Code Crisis. Keep one editable owner for each work; the site is a publication surface and index, not a second authority for either project's research or governance.

| Repository | Owns | Personal site's role |
| --- | --- | --- |
| [UA](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) | The framework, its canonical definitions, research and project-specific publication editions | Explain and link to the project; do not silently fork its canonical material |
| [Subprime](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) | Evidence-governed AI-assisted delivery synthesis and its source states | Explain and link; preserve its evidence and approval rules |
| This repository | Vitalii's author pages, cross-project articles and talks, published edition catalog, and site-specific rendering | Be a readable public entry point without claiming to verify the other projects |

The initial two research strands are **how AI changes software delivery** (generation, understanding, quality and long-term ownership) and **what changes when AI becomes part of product behavior** (Thinking Systems, evaluation, authority and runtime control). They overlap; the two repositories remain distinct. A publication may cite both without being copied into both.

## Current baseline and naming decision

- [x] Confirmed on 2026-10-01: the personal GitHub App installation includes this public repository. Before this roadmap, it contained only the default profile `README.md`; it had no site, `AGENTS.md`, license or enabled Pages site. This roadmap is the first project document, not a deployed website.
- [ ] Choose the permanent Pages URL **before** deployment or sharing stable public links; a reversible local preview may proceed while this choice is open. Current `oborskyivitalii/oborskyivitalii` is the special profile-README repository. If kept as the site repository, its default project-site URL will be `https://oborskyivitalii.github.io/oborskyivitalii/` once Pages is configured. Renaming it to `oborskyivitalii.github.io` enables the shorter user-site URL `https://oborskyivitalii.github.io/`, but its README would no longer be the special GitHub-profile README. Recommendation: rename before the site build if the short URL matters more; the maintainer makes this choice. No rename is performed by this plan.
- [x] Primary interface language: English, explicitly requested by the maintainer on 2026-10-01. Original English/Ukrainian editions are separately labelled EN/UA (`en`/`uk` in machine metadata).
- [ ] Decide whether the future Ukrainian PMDay article has a separate English edition. Do not invent or machine-publish a translation; two other talk languages remain unconfirmed.

## Milestones

Status is `planned`, `active`, `blocked`, or `done`. A milestone is `done` only when its acceptance evidence (merged commit/PR, inspected output, and any maintainer publication decision) is linked below; a green build alone does not complete it. Work in small PRs and update this table after each finished iteration.

| ID | Deliverable | Status | Acceptance evidence |
| --- | --- | --- | --- |
| M0 | Choose URL/language and approve first-version scope | active | English confirmed; dated scope amendments in #1, permanent URL decision still open in #8 |
| M1 | Minimal personal site: about, two research strands/projects, topical publication/talk index | active | [Applied candidate](docs/index.html) and [current interactive preview](review/site-v1-20261002-v4-interactive.html); five pages, five EN selections, eight bounded discussions, 27 primary records plus one secondary rendition and scroll/topic-only motion. [Source/rights review](SITE-CONTENT-REVIEW.md) records checks and remaining browser/release acceptance. Not deployed. |
| M2 | First new publication: PMDay explanatory article and versioned slide/PDF page | planned | Article and exact deck edition reviewed; exported PDF inspected; sources, rights, and two project links checked; explicit publication decision |
| M3 | Lean Markdown → HTML/PDF publishing path for this site | planned | Reuses or pins reviewed components without copying UA's whole framework/CI; staging, draft isolation, source identity, rejection-path tests and visual PDF review demonstrated |
| M4 | Finish Subprime's existing article/PDF adaptation in its own PR | planned | Review [Subprime #46](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/pull/46) at its live head; test required figures/assets and real outputs, retain its source/review governance; separate decision on merge |
| M5 | Cross-repository agent navigation and a small test harness | active | Issue/agent rules and lean local RI proposed in Draft PRs; full migration harness remains #6. Scoped owners, verified source identity and no pooled authority |
| M6 | Rights/provenance checks and stable release operation | planned | Per-item license/attribution inventory, code/content/third-party exceptions, broken-link and edition checks; approved site deployment and links back from UA/Subprime; video added only when available |

M1's reversible preview can start while M0 choices are open; public links and deployment need those choices recorded. M2 needs the first useful page and a rights review, **not** a universal publication engine. M3 and M4 can proceed independently after that release. M5 follows an observed cross-repository navigation need and pilot tasks. M6 starts with rights inventory before M2; automated checks and release operation finish later. Do not make the first article wait for M3–M5.

### Immediate execution sequence — 2026-10-01

The maintainer's current priority is **first useful public site, then the new PMDay article**. Start with [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1): a small static homepage, two research routes, selected existing public editions and precise acknowledgements. Inspect desktop/mobile output and rights, record URL/language, then merge and deploy. Proceed to [PMDay #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2): blueprint, manuscript, chosen slide/PDF edition, review and publication. Quartz/PDF migration #5, full harness #6 and Subprime #48 continue separately.

English is now confirmed by the maintainer; the current repository's project Pages path remains provisional. No rename, permanent URL decision, site-wide license decision or public release is inferred from the preview.

## Work tracking and original intent

The maintainer authorized issue workflow in all three repositories on 2026-10-01. Each repository implements it under its own contributor/agent owner; this site does not override sibling rules. [CONTRIBUTING](CONTRIBUTING.md#issue-intake-and-durable-intent) owns site intake, reports and closure. [REPOSITORIES](REPOSITORIES.md) maps ownership and [BACKLOG](BACKLOG.md) indexes the dated audit and milestone issues.

Issues preserve intent: clarify material uncertainty with questions, append dated decisions, and compare PR/commit execution with acceptance before edits, review and closure. Research/source input needs an original-input and affected-use report for maintainer review before substantive integration. Task status remains separate from the owning research/evidence records.

Implementation PRs use non-closing references while acceptance remains. Completion comments belong in both PR and issue; close only after the accepted result is merged/checked and required decisions/reviews are satisfied, or record an explicit reject/defer/supersede disposition. Strictly mechanical exceptions follow CONTRIBUTING. New issues capture prior ideas without inventing retrospective approval.

Issues #1–#8 now cover launch, PMDay, workflow, RI, publishing migration, cross-repository harness, rights and possible three-site architecture. [The milestone mapping](BACKLOG.md#milestone-issue-sequence) links Subprime #48 and UA #133 as dependencies. An open issue is not acceptance evidence.

## Detailed work packages and review gates

### M1 — credible first site

Create a short, evidence-checked bio and clear routes to UA, Subprime, articles, and talks. Catalog items by topic and format with title, publication date, status and **actual** published URL; drafts are not publications. Use the confirmed English interface and separately label actual English/Ukrainian editions. Avoid importing every manuscript or running all of UA's research CI as a prerequisite.

Public recognition deserves its own restrained area: link the underlying public statement and identify what happened (recommendation, reshare, comment, mapping, invited talk, advisory role). Start with independently checkable records for Markus Kopko and Arkadiy Dobkin, then others as warranted. Never turn a reshare into endorsement of all UA claims, attribute PMI/EPAM institutional support from a person's role, or borrow a quote beyond its scope. UA's [recognition ledger](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/content/history/external-recognition.md) is a discovery starting point, not a substitute for the original link and exact wording.

### M2 — PMDay as the first complete publication

Prepare a concise article connecting the talk's two parts: **how** AI changes the delivery system and **what** changes in AI-bearing products. Link UA and Subprime to their own canonical work. Review the latest slide source and actual exported PPTX/PDF, and identify clearly which edition is being published; the previous PDF and the current PR candidate must not be assumed identical. Keep the article as the site-owned canonical source; keep an immutable published edition and separate later corrections. Add video and timestamps only when the organizers publish them. Prepare a separate LinkedIn PDF post and a later recording follow-up; external posting remains a human decision.

[UA PR #113](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/pull/113) remains Draft. Preserve its branch and complete source/artifact/provenance while transferring reviewed PMDay material into this site. Do not merge the PMDay-specific ~2,100 lines of generator/tests into UA simply to archive one talk. After a verified replacement exists, decide whether to close #113 as superseded with a link; do not close it merely because this roadmap exists. The current generator requires its configured authoring runtime; a stock GitHub runner does not regenerate the editable PPTX.

### M3–M4 — publication tooling, scoped to owners

UA already has Quartz/PDF and project-specific publication packaging. [Publishing #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) inventories reusable components and pins required mechanics. Keep article Markdown read-only to the renderer and outputs separate; review previews must not become public editions. The lean RI navigation adapter is separate from website rendering; UA's full graph, research registers, heavyweight CI and slide-specific checks are not website prerequisites.

Subprime #46 is a separate Draft adaptation that already stages a pinned UA Quartz engine and tests text/tables/code. Review its live state instead of recreating it. Its stated unsupported figures, Mermaid, raw HTML and relative assets must either receive scoped support with integration/visual tests **when needed by a real Subprime article** or fail visibly. Source verification, independent review, rights, and publication approval still belong to Subprime.

### M5 — agents without a cross-repository super-authority

Keep each repository's root/nested `AGENTS.md` local to that repository. [AGENTS](AGENTS.md) now defines the proposed site route and [.github/REPOSITORY-INTELLIGENCE.md](.github/REPOSITORY-INTELLIGENCE.md) describes the bounded local adapter, source hashes and fallback. Subprime has its own adaptation in #52; UA retains its full RI. [Harness #6](https://github.com/oborskyivitalii/oborskyivitalii/issues/6) remains open for adapter-pin/edition and cross-repository migration checks. Navigation tests cannot promote a summary into research authority or establish remote review state.

### M6 — licenses, assets and release quality

The repository-wide content license remains undecided in [rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7). The RI code component has an explicit [Apache-2.0 notice](tools/RI-NOTICE.md); it does not license the entire site. Inventory articles/slides, adaptations, charts, third-party assets, fonts, quotes and code before release. UA documentation uses CC BY 4.0 and code Apache-2.0; Subprime content uses CC BY-SA 4.0. Record owner/source/allowed use/attribution/license exception and edition decision per item. Objective manifest checks support human editorial/rights/output review, not legal-clearance claims.

## Progress ledger

| Date | Outcome | Evidence / next open decision |
| --- | --- | --- |
| 2026-10-01 | Personal installation and initial structure checked; roadmap added as the first project document | Decide repo name/URL and initial language (M0). No site, article, deployment, PR transfer or license change has been made. |
| 2026-10-01 | Live backlog audit: 25 new issues across three repositories; all 9 pre-existing Draft PRs linked; two contributor inputs triaged | Workflow/AGENTS and local RI proposed in separate Draft PRs. Site build, publishing migrations, full harness and deployment remain in their issues. |
| 2026-10-01 | First-site PR #10 revision: visitor-local Day/Night with manual choice, 23-work writing index and exact public interaction sources | Intent and source report appended to launch #1; source audit records narrower claims and platform dates. Browser/editorial/rights/URL/language and deployment acceptance stay open. |
| 2026-10-01 | Corrected the review handoff after the maintainer could not see the updated site | Six freshly named self-contained Day/Night copies cover home, all 23 works and credits without JavaScript; source parity/navigation/hash checks added. Public bytes and release acceptance remain unchanged. |
| 2026-10-01 | Confirmed English UI; added the supplied portrait, bounded career context, EN/UA edition groups, meaningful topic/schema metadata and a keyword map; prepared a full Medium profile replacement | [SEO/content map](SITE-SEO.md), [v2 preview](review/site-v1-20261001-v2-day.html), [Medium draft](drafts/medium-profile-revision-20261001.html). This changes public bytes; the previous independent confirmation is historical, not current acceptance. Medium itself is unchanged; URL, visual/editorial/rights review and deployment remain open. |

For each later session: recheck current heads, linked issues and open PRs; update the affected milestone, checked evidence and unresolved decisions here; link the resulting PR/commit. Keep task details and discussion in the owning issue.

### Visual proposal — 2026-10-02

The maintainer requested background removal and a design review informed by the
presentation, retaining Day and Night. A [source-bounded review](SITE-VISUAL-REVIEW.md),
transparent cutout, illustrative comparison and [native HTML proposal](review/site-visual-proposal-20261002.html)
are prepared outside `docs/`. Public files and existing theme/SEO/publication data
remain unchanged. Current iteration acceptance is a concrete reviewable proposal,
not implicit approval of a public redesign. Browser, likeness/design, rights and
release decisions remain separate; see launch #1 and PR #10.

### Historical v3 design and navigation — 2026-10-02

The subsequent maintainer request authorizes fixing the visual findings and
separating the homepage from the catalog. Draft PR #10 now applies the design to
Home, Research, Writing, Talks and Credits, with an optimized transparent portrait
and optional perspective background that follows scrolling/sections. Home keeps
four featured editions and four bounded attributions; Research retains all seven
conversations and vocabulary; Writing adds four verified Ukrainian DOU editions,
giving 27 platform editions grouped by year/topic with language filters. TOC is
explicitly covered as a delivery lens, distinct from UA control constraints.

Historical [offline handoff](review/site-v1-20261002-v3.zip), [v3 manifest](review/site-v1-static-previews-v3.json)
and [review record](SITE-CONTENT-REVIEW.md) supersede earlier previews for current
inspection. The original proposal remains historical. Intent/outcomes/checks are
recorded in #1/PR #10. M1 remains active for browser/editorial/rights/URL, integration
and deployed-edition verification; no sibling migration or release is inferred.

### S0–S4 candidate execution — v4, 2026-10-02

The reviewed contract is implemented under #1/PR #10. [v4 package](review/site-v1-20261002-v4.zip) and [execution record](review/sol-execution-20261002/EXECUTION.md) identify the actual source/behavior/export result and pending browser/release acceptance. Earlier outputs and published identities remain intact. No merge, deployment, license/URL choice or sibling edit is inferred.
