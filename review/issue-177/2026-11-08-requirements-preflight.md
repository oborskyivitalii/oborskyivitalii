# Issue 177 — independent Requirements & Acceptance preflight

Date: 2026-11-08. Phase: first independent preflight; read-only source inspection, no implementation candidate. Reviewer task: `/root/issue177_requirements`.

## Verdict

**Proceed with the bounded article-admission correction, subject to the treatments below; no acceptance, readiness or release verdict.** The dated checkpoint clearly authorizes section B analytics work, applicable bounded checks and four-role reviews, followed by stop/report. Theme, SEO/discovery implementation, staging promotion, merge and deployment are outside this checkpoint. AC01–AC09 retain their full original meaning and must remain open wherever their live/release/owner obligations are pending.

The existing source independently reproduces the admission defect: the compiled current adapter contains only `/`, `/index.html`, `/research.html`, `/writing.html`, `/talks.html`, `/credits.html`. Repeated VM execution creates one SDK element on Writing and zero on both SDLC article canonical and extensionless paths. This establishes generator/adapter behavior, not the actual production bytes or collector receipt.

The requirements are sufficiently specific for source-owned admission work. The pageview oracle and acceptance mapping need explicit treatment before dependent test assertions or completion claims. Do not widen this correction into a new analytics pipeline or change navigation/vendor behavior without renewed requirements review.

## Inspected identity and assurance

- Repository: `/workspace/scratch/538c6c66c100/repo`; branch `work/issue177-article-analytics-20261108`; HEAD `fdfc8cb67a6f78996932d9688c563c53c21387f2`. Initial and final `git status --short` were empty; no implementation diff existed.
- Supplied packet `/tmp/issue177-preflight-manifest.json`: SHA-256 `c79d40ff74ff18367ef01a7a28b8750306445505ae3bbb760e85bdc33d10a02b`. Independently recomputed its digest and every referenced file digest: zero mismatches.
- Owner text `/tmp/issue177-owner.md`: SHA-256 `e0b6a6dffbe432e14cf5313f1c0f7ad39e04f398fa9d2a552339f6dcf7769f6c`. It contains original AC01–AC09 and the 2026-11-08 stop/report checkpoint; dated source, not independently fetched live issue state.
- Common contract `agents/reviewers/README.md`: SHA-256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt `agents/reviewers/requirements-acceptance.md`: SHA-256 `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`.
- Read root AGENTS/CONTRIBUTING, README, dated MEMORY, relevant map entries, site contract, analytics/check-profile/style/acceptance owners, actual analytics/build/article-selection owners and relevant existing test/profile consumers. `rg --files -g AGENTS.md` returned only the root guide.
- No author notes, current peer reports, private conversation or unrelated memory read. The supplied task states an explicit none-fork request; the orchestrator must retain the actual accepted launch receipt. Provider-observed context/model internals and account-history injection are unknown; this report does not attest them.
- Runtime skill was read; no environment-status tool was exposed in the available registry. No network, provider, browser, full test suite or deployment was executed by this preflight.

## Findings and treatments

### R1 — Medium: pageview acceptance is not yet an independently executable oracle

Evidence: owner section B.5 and AC02 require “one logically intended pageview per navigation” across SPA/history/reload/query/fragment cases. `site/integrations/cloudflare.cjs:20` delegates to `spa: true`; it emits no pageviews itself. `tools/quality/analytics-browser.cjs:249` stubs the vendor with a load counter. Its `scenario()` proves SDK count, persistent shell and navigation availability; it cannot establish vendor pageview semantics. `isolationJourney()` at lines 36–173 manually sends six synthetic requests to a local sink; those requests are not SDK-generated pageviews, and its result correctly declares `liveTelemetryValidated: false`. Writing filters change history (`site/engine/archive.js:67–84`).

Implication: a load counter or six manually emitted sink requests must not be used to tick AC02 or claim exactly-once provider measurement. “Navigation” also needs case-specific interpretation for same-document fragment/filter changes rather than an assertion chosen after implementation.

Treatment: before writing dependent count assertions, record a small case table identifying document entry/reload, article mount, Back/Forward, query/filter-only change and fragment-only change; state which expected behavior follows from the existing navigation/vendor contract and which remains unobserved. Preserve one SDK per document and no additional SDK on SPA/history. Keep actual vendor-generated requests and aggregate provider receipt as separate evidence gates. A route-only correction may proceed while live/provider evidence remains explicitly pending; it may claim only the observed admission and bounded browser properties. No owner decision is supplied by this review.

### R2 — Medium: “future accepted article routes” needs admission and generation-identity coverage, not just the current slug

Evidence: `tools/site/build.cjs:824–832` validates selected articles but passes only principal route URLs to analytics compilation. `tools/site/articles.cjs:24–91` selects the union of public local-catalog articles and explicit preview candidates; `candidate` is derived from metadata status at line 85. Thus selected inventory, accepted metadata and published catalog membership are distinct inputs. The catalog's `publication-30` (`site/content/catalog.json:830`) owns the current local article. Technical preview selection is separately owned by `tools/site/article-selection.cjs` and `site/article-template-preview.json`. `build.cjs:342–353` hashes analytics configuration/integration files, while `prepareArticles()` and `emitRoutes()` consume component fingerprints to decide reuse.

Implication: mapping every selected article into admission risks preview leakage; hardcoding the SDLC slug fails the future-route requirement. Deriving a changing loader allowlist without including that dependency in document/component invalidation can leave reused documents pointing at an old loader after an article admission/removal/slug change.

Treatment: use the existing finite, validated public publication selection as the sole route authority; exclude explicit preview-only, draft, technical and immutable snapshot paths. Admit canonical article paths and only the equivalent URL forms declared by the existing adapter/hosting contract; do not introduce trailing-slash or wildcard admission. Ensure accepted route-set changes participate in the emitted loader/document identity and cannot silently use incompatible content-only inheritance. Add meaningful addition/removal or slug-change cold-versus-incremental coverage, alongside draft/technical/unknown/snapshot refusals. This is a required design/test-impact condition of AC01/AC02/AC03/AC07, not an observed defect in a nonexistent candidate.

### R3 — Medium: owning acceptance policy is absent at baseline

Evidence: `.github/acceptance/issue-177.json` does not exist. `.github/ACCEPTANCE.md` requires every stable criterion to map to named reproducible checks and explicit external gates. Owner AC07 includes four-role review and CS01–CS10; source/browser evidence alone cannot supply the rest of AC07's release route.

Implication: a generic Basic result or unrelated policy cannot establish issue acceptance or a valid issue-specific workflow handoff. Partial checkpoint completion cannot close the issue or tick full AC02/AC07.

Treatment: add the owning mapping within this authorized checkpoint, retaining AC01–AC09, with accurate automated scope and explicit live/release/owner gates. Reuse meaningful existing checks; do not add keyword tests for semantic review or duplicate a pipeline. Finish mapping before handoff/advancement. Keep out-of-scope requirements mapped as pending rather than deleting or weakening them. This omission does not prevent the authorized implementation preparation.

### R4 — Informational: QA isolation is intentionally bounded

Evidence: `tools/quality/analytics-isolation.cjs:6–18` matches exactly `https://cloudflareinsights.com/cdn-cgi/rum` (including query forms), blocks service workers before browsing, and closes contexts on setup/abort failure. `tests/preview-smoke.test.cjs:220–336` retains predicate, setup, failure and ordinary-context contrasts. The analytics guide explicitly excludes unconverted optional sibling contexts from a universal isolation claim.

Treatment: retain this exact boundary, collector fallback behavior and fresh ordinary-context contrast. Add article cases through the existing owned route. Report which contexts were observed, and never convert those bounded observations into “all QA produces zero traffic.” No new blocker found in the inspected helper's requirements boundary.

## Intent / AC → check or gate → observed result

| Intent / AC | Required check or owner gate | This preflight observation / disposition |
| --- | --- | --- |
| Current checkpoint / AC01 | Current refs, owner, route/edition/test-impact inventory; separate live identity read | Clean local baseline and authoritative source owners inspected. Supplied owner states production ref; actual served bytes/deployment were not observed here. |
| B.4 / AC02 | Compile from validated public inventory; current/future accepted canonical + supported alias positives; unknown/draft/technical/snapshot negatives | Current compiled SDLC canonical and extensionless entries create zero SDK elements; Writing creates one. Fix and regression coverage required. |
| B.5 / AC02 | Direct actual generated article, internal Writing→article, article→principal, Back/Forward, reload, query/fragment table; one SDK; separate real request/receipt | Existing source suite primarily covers five principal routes. Synthetic isolation fixture contains an article pathname but does not prove generated public article admission or actual vendor semantics. R1/R2 apply. |
| B.6 / AC03 | Exact-origin, noncanonical origin, staging, preview, offline suppression; blocked/delayed vendor navigation; collector isolation/ordinary contrast | Existing VM/source and browser checks and exact QA helper inspected; no test campaign or actual browser result claimed. Preserve existing failure cases and budgets. |
| AC01 / AC07 test impact | `tools/quality/test-profiles.json`, complete future diff, source suite selectors, hosted consumers/report validators | Analytics suite is permanent in pr-targeted/staging/production and selected by build/analytics/site inputs. `site-articles`, `preview-smoke`, candidate-source, profile-selection and hosted report consumers need explicit retain/update allocation. |
| AC07 style | CS01–CS10 applicable-owner mapping; `python3 tools/check_code_style.py`; relevant source/Basic checks; independent architecture/readability review | Source architecture and mandatory guard scope read. No guard/check executed. Four final roles and exact-candidate evidence remain required. |
| AC04–AC06 | SEO/discovery/Search Console owners and later accepted source/live checks | Original obligations preserved; implementation outside this checkpoint. No pass. |
| AC07 release | Preview/stable staging and separately authorized merge/production; source/artifact binding | Not authorized for advancement in this checkpoint; no release action or claim. |
| AC08 | Fixed-window provider report with sampling/referrer/QA limits | Guide read; no provider query or readership inference. Remains pending. |
| AC09 | After verified release, visible owner-only Medium reminder and owner's actual result/decision | Not due at this source checkpoint; no external account action. Keep original AC open. |

## Test-impact allocation before candidate execution

- **Update/add meaningful route coverage:** `tests/analytics.test.cjs` needs generated accepted-article admission, public-versus-preview eligibility, unsupported variants, and changing admission-set identity/reuse cases. Existing five-route, exact-origin, blocked SDK, disabled-config, immutable-retention, transactional-failure and offline-export checks remain valid oracles.
- **Existing actual browser route:** `tools/quality/analytics-browser.cjs` and `local-browser.cjs` own the stubbed enabled/blocked/delayed/staging/offline journeys and local collector contrast. Add accepted generated article/direct/SPA/history cases through these owners or a clearly selected bounded existing route. Do not count the hardcoded adapter-only article fixture as production generator coverage.
- **Retain article/candidate source protections:** `tests/site-articles.test.cjs`, `article-candidate-source.test.cjs` and the finite article selector distinguish preview and publication. Retain old technical fixtures where they prove these contracts; no automatic PR79 replacement or blanket deletion.
- **Retain QA negative coverage:** `tests/preview-smoke.test.cjs` exact collector, failed setup/abort and ordinary-context cases. Any new context route handler must preserve fallback to the isolation handler; re-observe the existing contrast after routing changes.
- **If hosted case/schema/count selection changes:** inspect consumers in `functional.cjs`, `staging-regression.cjs`, `validate.cjs`, profile registry and fixture-validation tests together. Current five-route matrix/counts are deliberate; do not inflate an unexecuted full matrix or relax validators to accommodate partial results.
- Run cheap targeted checks first, then applicable Basic, style and RI/owning checks on the exact candidate. No expensive staging campaign belongs to this checkpoint. Preserve any failures and diagnose before new execution.

## Checks actually performed and limits

Performed: source/policy/test inspection; clean local Git identity/status; packet SHA verification; in-memory compile plus VM execution of the actual current analytics loader (no public-output writes). Loader identity was `runtime/7ebed494340d081e3c5be942074182f97c9b93f3a887af88d36023e26db146ff/analytics.js`. URL tests used the configured production origin and `?q=1#frag`; repeated execution results were Writing=1 SDK element, current article `.html`=0, current article extensionless=0, unknown article=0. This VM model does not emulate SDK execution, network, browser lifecycle or provider collection.

Two exploratory reads guessed nonexistent config paths (`site/content/site.json`, then `site/site.json`) and failed ENOENT. I inspected `build.configuration()` and used its actual `site/routes.json` owner for the successful bounded check; those failed reads were not test failures or acceptance runs. A few broad grep reads named absent legacy paths; actual registry and source inventory were then inspected directly. No failed campaign was rerun.

Unavailable/unobserved: live GitHub issue/PR/refs, current production deployment/served hashes, real vendor request semantics and aggregate collector receipt, actual browser interaction, full/native/device gates, final candidate/diff, CI, staging/release and all final role results. No evidence supports marking any whole issue AC complete here. MEMORY is stale relative to supplied current baseline/owner and was treated only as a handoff.

Additional directly inspected source identities (beyond supplied manifest): `site/routes.json` SHA-256 `d6caa59aa69462f83115642a602aea669f48316765b487c09b01f721c933c7fe`; `site/content/catalog.json` `b864cb7ebf14a4b6627ba5025e90b9b0cbc5dd1e64e64e7786de5f0296769bea`; `tools/site/article-selection.cjs` `67433dfb1a4c6f66f0d1b53d7e45f3ffc3949fa06afead0113e2a8472377a6dd`; `tools/quality/test-profiles.json` `583d1dd469fc12adc2cf66628a6486e9d11e5eaa0d3e170b5fdf4fbf63085a36`; `tools/quality/local-browser.cjs` `08e0beca2c3c1b2860c122df23ec26090e5029925eb334e390952fdf05bfe57e`; `tests/preview-smoke.test.cjs` `ec6f650ed04699f694776756c9c5c8e26145bb0e973daa4a08ff0300fb98e7de`; `tests/site-articles.test.cjs` `4033d35336e8c0f59dd68380ed3c4baddf1508e9b42932a38dc1336f85346425`.

Next gate: record R1's case-specific oracle/evidence limits and R2's admission/identity allocation, implement only the authorized analytics correction, complete the issue policy and exact-candidate bounded checks, obtain four completed independent reviews, then stop/report to the maintainer. Recheck this role after material oracle changes and on the completed candidate. This first report is preserved without peer reconciliation.
