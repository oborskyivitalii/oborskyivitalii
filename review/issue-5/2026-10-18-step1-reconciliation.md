# Issue 5 — 18 October 2026 step 1 reconciliation

Owning issue: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Role: Codex self-analysis and implementation; no independent review claimed.
Prepared source: normal merge of PR head `54f3a2c2e3eb8f35d5363e8440264dbae5c28037`
and released main `3af9100989c7dd6edc18b0b94c2d59f177cfd465`.
Final commit and exact validation attachment are linked in the issue/PR checkpoint.

## Intent and acceptance

The user authorized step 1 only, followed by a status report and reassessment.
Article writing and editing are excluded: they continue in another conversation.
This step reconciles technical sources, identifies the minimum reader/publisher
boundary and verifies integration. It does not merge main, promote staging,
publish an article, configure providers, or execute the later pipeline split.
Original #5 AC01–AC15 and prospective AC16–AC20 retain their original gates.

## Findings

| ID | Evidence / owner | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Main release workflows, legal owners, analytics, native navigation | PR79 predates the accepted 17 October release. A tree replacement would regress shipped work. | AC08/11/12/15 | Normal merge preserves both histories and current production policy. |
| F02 | `tools/site/articles.cjs`, publisher sources, article templates, navigation and immutable snapshot contracts | A reusable static reader already exists. First integration is a platform change; subsequent content generation can reuse compatible platform bytes. | AC02/07/08/14 | Retained and verified; no microservice migration. |
| F03 | `tools/site/edition.cjs`, Color derivation, staging checks | Earlier PR tests preserved unlabelled historical HTML in staging. Released main requires every staged HTML document to be isolated and labelled. | AC08/12/14/15 | Preserve history in source/Color; derive active staging articles and remove prior unlabelled HTML/runtime. Retain immutable media. |
| F04 | `site/rights.json`, `tools/release/rights*.cjs` | Draft article assets were absent from the newer rights inventory. The shipped publication policy still admits linked metadata only. | AC03/10/11/12 | Inventory candidate bytes explicitly as pending exact-edition media review. Do not invent permissions. Hosted-article rights/notices admission remains a required next increment before article staging/publication. |
| F05 | Source worker, packaging, HTTP probes, fixtures | Main has newer source-worker accounting and publication safeguards; PR adds article resources and generation reuse. | AC04/08/11/15 | Keep current worker, failure streams and release controls; extend inventory/journeys and refresh fixture source closures. |
| F07 | Current R10, `tools/site/build.cjs` 100000-byte article guard | A direct isolated R10 HTML build fails its existing raw-byte budget. Synthetic reader checks cannot establish real-R10 readiness. | AC02/08/12 | Next step must reduce reader HTML overhead without changing the manuscript or raising the limit, before hosted preview. |
| F06 | Protected editorial roots | All 54 starting editorial/media/review files are unchanged. | AC06/07/12 | Text, editions, blueprint, images and prior review deliverables preserved byte for byte. |

## Decisions

- Current main remains the production/release-policy authority. Optional full
  diagnostics stay optional; obsolete GitHub Pages staging is not restored.
- Keep existing stable `articles/<slug>.html` routes, manuscript/metadata/media
  owners, isolated build-time parser and coherent immutable artifact assembly.
- Minimum first-site capability: article source validation/rendering, static HTML,
  reader navigation/history, Writing entry/count, media/snapshot closure, article
  canonical/sitemap derivation, and compatible staging/production packaging.
- PDF/platform adapters and historical exports remain separate capabilities;
  they are not a reason to postpone the site's technical acceptance. Their
  existing issue criteria are not silently closed.
- The real article's reviewed notices/rights and actual hosted-reader checks
  remain required. Candidate source presence is not publication acceptance.
- No article-writing task is assigned here. The next technical step consumes the
  current source handed back from the editorial conversation without rewriting it.

## Sol tasks

| Task | Paths / expected result | AC / finding | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Reconcile reader/publisher with current release, legal, analytics and navigation owners | AC08/11/12/15; F01–F05 | Relevant source suites; Basic; SEO; style/architecture | Prepared; final evidence below |
| T02 | Regenerate public/offline outputs, catalog and RI/CI projections | AC11/12/15 | Build/check, preview/bundle, RI and coupling checks | Prepared; final evidence below |
| T03 | Preserve editorial roots and concurrent branch history | AC06/07/12; F06 | Git blob identities and guarded branch update | Required at final branch checkpoint |
| T04 | Reassess original plan and report the next bounded increment | AC12; F04 | Dated plan amendment and issue/PR links | This record and updated plan |

## Acceptance evidence

Final validation results are retained in the companion
`2026-10-18-step1-validation.json` and the issue/PR checkpoint. They bind the exact
technical source identities and editorial inventory. Initial integration failures
were used to resolve fixture dependency gaps, current runtime tuples and staging
isolation; failed attempts are not successful acceptance evidence.

| AC | Applicable check / evidence | Status boundary |
| --- | --- | --- |
| AC01–AC04/07–AC10 | Publisher, article/transaction/offline/catalog/delivery source tests | Automated integration only; exact article rights, visual/device/editorial/export/publication gates remain open. |
| AC05/06 | Editorial/source ownership preserved | No cross-repository or writing work performed. |
| AC11 | CS01–CS10 source ownership/dependency review; bounded guard; formatting; RI/CI/source inventories | Self-review only; independent review stays open. |
| AC12 | Same Draft PR, exact source checkpoint, Basic and relevant checks | No new hosted acceptance, main merge or public delivery claimed. |
| AC13–AC15 | Catalog, generation reuse, compatibility/baseline/classification and package safety checks | Existing generation/PR optimization only; current complete criterion status requires all mapped checks. |
| AC16–AC20 | Architecture and independent-production-lane plan | Pending implementation; not completed by this reconciliation. |

CS01/02/04: authored content/template/runtime/build ownership remains separate;
generated files are regenerated. CS03: article and legal CSS retain canonical
owners; no inline style escape. CS05: use pinned formatting on touched merged
sources. CS06/07: preserve current cancellation, native timing, source/byte limits;
no new background runtime loop or budget increase. CS08/09: run proportional
source checks and report the guard's documented subset. CS10: #5 AC11 owns style
evidence; self-review does not replace the independent gate.

## Original plan reassessment and next steps

1. **Next small technical increment:** integrate hosted-article rights/notices
   with the current release inventory and resolve the current R10 raw-HTML budget
   failure without shortening the text or raising the limit; then create one current immutable article
   HTML preview. Verify no-JS/mobile reading, figures/resources, canonical route,
   Writing registration, and article↔room navigation. Consume the editorial source
   supplied by the other conversation; do not add a writing task here.
2. **After preview acceptance:** use the existing bounded platform staging and
   controller to publish the first accepted article, with live checks and its
   exact publication event. Keep independent review and owner release decisions.
3. **After the first stable publication:** complete #5 AC16–AC20, splitting
   platform/content/media jobs and keeping one protected atomic release assembler.
   Prove unchanged-platform reuse, stale-base rejection and rollback with a real
   subsequent content revision. No runtime microservices are justified now.
4. MFA #97 and Google/Windsor access #8/#103 can proceed independently. Analytics
   route coverage #102 is a useful small follow-up; conversions #104 follow the
   settled reader. Harness #6 and guides #11 follow the proven publishing lane.
   Disclosure #98 and bot/crawler policies #99/#100 remain separately selected.

## Issue synopsis

Step 1 reconciles PR79 with released main, preserves all editorial bytes and
current production controls, and verifies the reader/publisher source boundary.
The next blockers are the current R10 HTML budget and exact hosted-article
rights/notices admission, followed by current
hosted preview acceptance. Writing is excluded; production is unchanged.
