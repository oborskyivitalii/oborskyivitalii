# Vitalii Oborskyi — site and publishing roadmap

Status: planning. Started: 2026-10-01. This document tracks decisions and verified deliveries; it does not authorize automatic publication, PR merges, or changes to the other repositories.

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
- [ ] Choose the permanent Pages URL **before** building or sharing links. Current `oborskyivitalii/oborskyivitalii` is the special profile-README repository. If kept as the site repository, its default project-site URL will be `https://oborskyivitalii.github.io/oborskyivitalii/` once Pages is configured. Renaming it to `oborskyivitalii.github.io` enables the shorter user-site URL `https://oborskyivitalii.github.io/`, but its README would no longer be the special GitHub-profile README. Recommendation: rename before the site build if the short URL matters more; the maintainer makes this choice. No rename is performed by this plan.
- [ ] Select the site's primary language and whether a Ukrainian PMDay article has a separate English edition. Do not invent or machine-publish a translation.

## Milestones

Status is `planned`, `active`, `blocked`, or `done`. A milestone is `done` only when its acceptance evidence (merged commit/PR, inspected output, and any maintainer publication decision) is linked below; a green build alone does not complete it. Work in small PRs and update this table after each finished iteration.

| ID | Deliverable | Status | Acceptance evidence |
| --- | --- | --- | --- |
| M0 | Choose URL/language and approve first-version scope | planned | Decisions recorded; no draft mistaken for a public edition |
| M1 | Minimal personal site: about, two research strands/projects, topical publication/talk index | planned | Real Pages preview inspected on desktop/mobile; verified links and factual copy; no unreviewed social-proof claims |
| M2 | First new publication: PMDay explanatory article and versioned slide/PDF page | planned | Article and exact deck edition reviewed; exported PDF inspected; sources, rights, and two project links checked; explicit publication decision |
| M3 | Lean Markdown → HTML/PDF publishing path for this site | planned | Reuses or pins reviewed components without copying UA's whole framework/CI; staging, draft isolation, source identity, rejection-path tests and visual PDF review demonstrated |
| M4 | Finish Subprime's existing article/PDF adaptation in its own PR | planned | Review [Subprime #46](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/pull/46) at its live head; test required figures/assets and real outputs, retain its source/review governance; separate decision on merge |
| M5 | Cross-repository agent navigation and a small test harness | planned | Scoped `AGENTS.md` in each owner; read-only, ref-aware pointers and owner-routing test cases; no pooled authority, cloned UA RI graph or cross-repository write token by default |
| M6 | Rights/provenance checks and stable release operation | planned | Per-item license/attribution inventory, code/content/third-party exceptions, broken-link and edition checks; approved site deployment and links back from UA/Subprime; video added only when available |

M1 can start after M0; M2 needs the first useful page and a rights review, **not** a universal publication engine. M3 and M4 can proceed independently after that release. M5 follows an observed cross-repository navigation need and pilot tasks. M6 starts with rights inventory before M2; automated checks and release operation finish later. Do not make the first article wait for M3–M5.

## Work tracking and original intent

Use GitHub Issues as the actionable backlog in the repository that owns the work. This roadmap summarizes milestones and decisions; it is not a competing task list. A cross-project publication belongs here; a UA framework/research change belongs in UA; Subprime evidence and report work belongs in Subprime. Link related issues across repositories instead of copying the same task three times.

An issue should make the intended outcome inspectable before implementation: **why this matters / original request**, proposed scope and open questions, observable acceptance checks, evidence or source links, and decisions still needed. Keep the original request visible when scope evolves; add a dated decision or comment rather than silently rewriting history. For external papers or expert conversations, an issue is an intake and triage record, not a verified finding or permission to republish a private exchange. Follow the owning repository's evidence, provenance, and approval rules.

Reference the owning issue from each implementation PR (use the full `owner/repo#N` reference across repositories). A plain reference keeps an unfinished issue open; reserve GitHub's `Closes #N` / `Closes owner/repo#N` keyword for a PR whose merge into the default branch satisfies every acceptance check, since it automatically closes the issue. Before closing, compare the delivered diff and review evidence with the original intent and record deliberate deviations. Small unplanned fixes and dependency updates need no ceremonial issue. Do not retroactively present issues created today as pre-existing decisions.

Initial actionable issues: [site launch and scope #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1) (M0–M1) and [PMDay article #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2) (M2). The remaining milestones stay in this roadmap until a specific next outcome is ready to track; an open issue is not acceptance evidence.

## Detailed work packages and review gates

### M1 — credible first site

Create a short, evidence-checked bio and clear routes to UA, Subprime, articles, and talks. Catalog items by topic and format with title, publication date, status and **actual** published URL; drafts are not publications. Prefer an English first-version site for a broad professional audience only if approved under M0. Avoid importing every manuscript or running all of UA's research CI as a prerequisite.

Public recognition deserves its own restrained area: link the underlying public statement and identify what happened (recommendation, reshare, comment, mapping, invited talk, advisory role). Start with independently checkable records for Markus Kopko and Arkadiy Dobkin, then others as warranted. Never turn a reshare into endorsement of all UA claims, attribute PMI/EPAM institutional support from a person's role, or borrow a quote beyond its scope. UA's [recognition ledger](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/content/history/external-recognition.md) is a discovery starting point, not a substitute for the original link and exact wording.

### M2 — PMDay as the first complete publication

Prepare a concise article connecting the talk's two parts: **how** AI changes the delivery system and **what** changes in AI-bearing products. Link UA and Subprime to their own canonical work. Review the latest slide source and actual exported PPTX/PDF, and identify clearly which edition is being published; the previous PDF and the current PR candidate must not be assumed identical. Keep the article as the site-owned canonical source; keep an immutable published edition and separate later corrections. Add video and timestamps only when the organizers publish them. Prepare a separate LinkedIn PDF post and a later recording follow-up; external posting remains a human decision.

[UA PR #113](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/pull/113) remains Draft. Preserve its branch and complete source/artifact/provenance while transferring reviewed PMDay material into this site. Do not merge the PMDay-specific ~2,100 lines of generator/tests into UA simply to archive one talk. After a verified replacement exists, decide whether to close #113 as superseded with a link; do not close it merely because this roadmap exists. The current generator requires its configured authoring runtime; a stock GitHub runner does not regenerate the editable PPTX.

### M3–M4 — publication tooling, scoped to owners

UA already has Quartz/PDF and project-specific publication packaging. Assess reusable rendering functions and versioned dependencies, then build a thin site adapter with only the formats this site actually needs. Keep article Markdown read-only to the renderer and outputs separate from sources. Support preview drafts without exposing them as published editions. Do not copy UA's Repository Intelligence, research registers, heavyweight CI, or slide-specific checks into an ordinary website build.

Subprime #46 is a separate Draft adaptation that already stages a pinned UA Quartz engine and tests text/tables/code. Review its live state instead of recreating it. Its stated unsupported figures, Mermaid, raw HTML and relative assets must either receive scoped support with integration/visual tests **when needed by a real Subprime article** or fail visibly. Source verification, independent review, rights, and publication approval still belong to Subprime.

### M5 — agents without a cross-repository super-authority

Keep each repository's root and nested `AGENTS.md` authoritative **only for that repository**. Add a compact site-specific `AGENTS.md` after the content boundaries and build commands exist. A read-only catalog may point to repository URL, ref/commit, owner document, content status and link, with an explicit missing/stale state; do not silently present a cross-repo snapshot as current. Pilot tasks: locate the owner of a Thinking Systems term, a Subprime evidence claim, and the PMDay article; ensure agents cite the correct repo and do not promote a blog summary into research authority. First test this navigation manually, then automate observable errors. No cross-repository write credentials or shared approval bypass.

### M6 — licenses, assets and release quality

Keep the site's current `No license` choice until a scoped notice is reviewed. Inventory every original article/slide, adapted UA or Subprime material, generated image, chart, third-party PDF, font, quote and code dependency before assigning licenses. UA currently separates CC BY 4.0 documentation from Apache 2.0 code; Subprime uses CC BY-SA 4.0. Their licenses do not automatically become one license for this mixed site. Record author/owner, source URL, permitted use, required attribution, license or exception, and publication decision per item. Automate objective checks (missing notice, attribution URL, broken links, stale digest/edition); a machine cannot decide whether a quote, endorsement or right is legally sufficient. Publish only after human editorial, rights and rendered-page review.

## Progress ledger

| Date | Outcome | Evidence / next open decision |
| --- | --- | --- |
| 2026-10-01 | Personal installation and initial structure checked; roadmap added as the first project document | Decide repo name/URL and initial language (M0). No site, article, deployment, PR transfer or license change has been made. |

For each later session: recheck current heads, linked issues and open PRs; update the affected milestone, checked evidence and unresolved decisions here; link the resulting PR/commit. Keep task details and discussion in the owning issue.
