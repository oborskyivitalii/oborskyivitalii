# Issue 39 — 2026-10-15 publication test review

Owning issue: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39).
Guard/controller execution: [PR80](https://github.com/oborskyivitalii/oborskyivitalii/pull/80).
Licensed site execution: [PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40), paused.
Role: consolidated source review with separate independent reviewers; this draft
records reviewed baselines and component checkpoints; final integrated source and
native proof remain explicitly pending.

## Intent, exact baselines and boundaries

The maintainer's latest instruction is to review and repair the complete staging
and production guard path before continuing PR40 or attempting publication.
Keep #39 and its original AC01–AC05, pending human gates and six production
owners (#1/#7/#8/#13/#39/#72). The work continues in the existing PR80 guard
preparation. No main, provider, production, domain or DNS action follows from it.
Separate original guard defects from the paused new licensing implementation.

| Baseline | Commit | Tree | Meaning |
| --- | --- | --- | --- |
| Protected main | `cc115c4241197d59205934bdc18f209109d5ee87` | `0820a951b17f375bca61aea4e70785dbb9376468` | Original active guard/controller and public edition. |
| Published compatibility preparation | `628a961633788a52170c3e29b1f4c83228fb1e50` | `bc5c2c4644f11e45c130f1267d66e1e5499a4105` | PR80 pre-registers the exact licensed Color family and finite snapshot host policy; no ordinary admission. |
| Paused local PR40 integration | `13a6898dbdd961b50d472759ccf0d37897e28aba` | `b4dc5c29b49ca876853a22f3e83154f6ebdaaf52` | Full licensed/production preparation, not published; remains untouched during guard repair. |
| Browser guard patch | `a05f9c350a1d3e5bde0ff9d1a50d8ce9ea6a4db8` | `d73796564ad33729477cae3c30463b25d89cf4d0` | Local frozen branch based on628a, including full validator/provenance, renderer-state and rawPreparation repairs.46focused; independent latest-tip review closed. Integrated proof pending. |
| Runner guard patch | `e366674597fc73a299d2710cb6c8f26e9ab9dd0a` | `372d35f2eed86106079887268b24000601127b29` | Clean local checkpoint based on628a; Root and independent diff review cleared. Independent frozen17Node/6Python replay passes; no blocker to integration. |
| Controller combined checkpoint | `d6e17644f3db378904853e095c8ff61a4324714d` | `3e330516ddb7e1ee9313c7b3d517f5aac968b992` | Clean inspected checkpoint with runner/browser/consumer/preflight integration and G11/G12 repairs. Later same-job source dedup follow-up is not yet frozen; independent final orchestration and integrated/static proof pending. One new permanent module makes45production/42staging+3Basic. |
| Paused Root feature follow-up | `7416e1e997557be254d22cbba25745d8dbd71368` | `2eae62494310674549695dd35d9e35de127f763a` | Independent final review closed:97focused baseline plus actual CLI under conflicting inherited CI identities; production/archive source unchanged from independently closed bd779000. Keep Root-only features out of PR80. |
| Static and publisher MIME checkpoint | `9a27d4554dac999fc58e09901cd71bf45a831135` | `2a698602cf90e77429f5286402d4fd3b3b82225c` | Clean follow-on to195ca3b: shared MIME/advisory/engine-continuation repairs plus actual staging publisher MIME closure.34 staging/review-flow cases, lint/style/RI pass; final combined scan/preflight pending. |

## Complete selection catalog and dispositions

These are module selections from the actual immutable registries, not claimed
executed-case counts. Main and compatibility each have 44 permanent JavaScript
modules: production selects all44; staging selects41 and delegates exactly
`theme`, `archive`, `flight` to Basic. Seven permanent Python modules run once
through the combined repository runner. Compatibility has16 task snapshots
(main15), selected only by the owning issue;18 diagnostics stay targeted/manual.
Paused PR40 adds three permanent JavaScript modules: `edition-retention`,
`pages-migration`, `release-rights`, giving47 production and44 staging plus the
same3 Basic delegates. No task snapshot is silently promoted to a routine suite. The proposed controller guard
adds one permanent `publication-records` module, making45production/42staging+3Basic
for that guard tree; final integrated inventory must be regenerated from its exact
registry. The baseline counts above are not a claim about the changing patch set.

The full module/owner/profile catalog is listed below. An entry's existence and
suite name do not prove that its promised scenario was executed. Strict actual
named-test accounting and report validators remain necessary.

| Module | Owner | Routine / disposition |
| --- | --- | --- |
| `tests/analytics.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/archive.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Basic delegate; production; retain independent contract. |
| `tests/color-build.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/content.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/endpoint-fixtures.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/engine-browser-fixtures.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/executive.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/flight.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Basic delegate; production; retain independent contract. |
| `tests/functional-fixtures.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/native-display.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/navigation-fixtures.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/navigation-motion-fixtures.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/navigation.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/preview-smoke.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/preview.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/quality-sources.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/quality.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/renderer.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/review-flow.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/scroll-sync.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/site-engine.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/site-face-preparation.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/space.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/staging-gate.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/staging-regression.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/staging-reporting.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/staging-trust.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/staging.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/test-profile-selection.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/test_issue_acceptance.py` | `.github/ACCEPTANCE.md` | Python combined staging/production; retain independent contract. |
| `tests/test_offline_export_security.py` | `guides/SITE-CHECK-PROFILES.md` | Python combined staging/production; retain independent contract. |
| `tests/test_repository_intelligence.py` | `.github/REPOSITORY-INTELLIGENCE.md` | Python combined staging/production; retain independent contract. |
| `tests/test_repository_test_selection.py` | `.github/REPOSITORY-INTELLIGENCE.md` | Python combined staging/production; retain independent contract. |
| `tests/test_ri_ci.py` | `.github/REPOSITORY-INTELLIGENCE.md` | Python combined staging/production; retain independent contract. |
| `tests/test_root_layout.py` | `.github/REPOSITORY-INTELLIGENCE.md` | Python combined staging/production; retain independent contract. |
| `tests/theme.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Basic delegate; production; retain independent contract. |
| `tests/test_code_style.py` | `guides/CODE-STYLE.md` | Python combined staging/production; retain independent contract. |
| `tests/effects.test.cjs` | `site/README.md` | Staging additional; production; retain independent contract. |
| `tests/format-parity.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/format.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/architecture.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/build-cohesion.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/camera-view.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/content-rendering.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/refactor-metrics.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/prototype-admission.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/pages-delivery.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/release-archive.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/release-controller.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/color-motion-contract.test.cjs` | `guides/SITE-CHECK-PROFILES.md` | Staging additional; production; retain independent contract. |
| `tests/scroll-entry.test.cjs` | `site/README.md` | Staging additional; production; retain independent contract. |

Paused PR40 additions: `tests/edition-retention.test.cjs`, `tests/pages-migration.test.cjs`, `tests/release-rights.test.cjs`; each is permanent staging/production and remains in its own feature scope until guard preparation completes.

Retain the source/profile separation: staging Basic plus additional41 is one
source pass; production44 includes the same3 baseline modules and must not run
Basic's tests a second time merely to claim more coverage. Source cases, hosted
scenario cases and native platforms exercise different failure surfaces.
| Excluded family | Exact files / route | Disposition |
| --- | --- | --- |
| Diagnostics | `tests/browser-gate-diagnostics.test.cjs`, `tests/browser-gate-trace.test.cjs`, `tests/browser-gate-variants.test.cjs`, `tests/browser-lifecycle.test.cjs`, `tests/cause-fix-probe.test.cjs`, `tests/cause-probe.test.cjs`, `tests/gtk-native-probe.test.cjs`, `tests/gtk-target-probe.test.cjs`, `tests/ribbons.test.cjs`, `tests/writing-diagnosis.test.cjs`, `tests/writing-geometry.test.cjs`, `tests/writing-layout.test.cjs`, `tests/writing-localization.test.cjs`, `tests/writing-models.test.cjs`, `tests/writing-paradigm-browser.test.cjs`, `tests/writing-paradigm-ci.test.cjs`, `tests/writing-paradigm-quality.test.cjs`, `tests/writing-variants.test.cjs` | Explicit diagnostic profile or owning changed-helper route; no routine stage/production replay. |
| Task snapshots | `tests/test_issue31_acceptance.py`, `tests/test_issue33_acceptance.py`, `tests/test_issue35_acceptance.py`, `tests/test_issue36_acceptance.py`, `tests/test_issue41_acceptance.py`, `tests/test_issue45_acceptance.py`, `tests/test_issue48_acceptance.py`, `tests/test_issue56_acceptance.py`, `tests/test_issue61_acceptance.py`, `tests/test_issue58_acceptance.py`, `tests/content-migration.test.cjs`, `tests/phase-checkpoint.test.cjs`, `tests/test_issue65_acceptance.py`, `tests/test_issue72_acceptance.py`, `tests/test_issue69_acceptance.py`, `tests/test_issue39_acceptance.py` | Owning issue policy only; stable IDs and historical exact-source assertions retained. |

No exact-body duplication or obsolete current guard is established by this audit.
Historical ribbons and14 named browser/cause/GTK/Writing experiment families
retain their explicit diagnostics; they do not enter routine staging/production.
The numbered issue snapshots remain source-pinned task evidence. No selected
case, budget or failure mode is removed as a speed fix. Future hosted article
rendering/PR79 and unrelated feature PRs remain outside this guard increment.

## Job, profile, command and host boundary

| Actual route/job | Selected work and local reproduction | Requires real host/native evidence |
| --- | --- | --- |
| Ready PR `site-checks` and navigation | `node tools/quality/local.cjs`; changed-path `source-tests --profile pr --base SHA --head SHA`; bounded style, RI/coupling and owning issue policy. Draft packaging retains narrow deferred admission. | PR preview HTTP/Chromium smoke is separate; green source jobs do not stage. |
| Explicit staging build/preflight | Basic24 source cases plus41 additional Node modules on main/compat; `source-tests --profile staging --require-clean --report FILE.json`; `python3 tools/run_repository_tests.py`; generated/SEO/export/style/RI/coupling checks. | No hosted/browser/device claim from source suites. |
| Production build/preflight | `source-tests --profile production --require-clean --report FILE.json` selects44 original Node modules once; same enduring Python and existing generated/SEO/export/RI checks. Paused PR40's intended47 are separate. | Full native matrix and external acceptance still required. |
| Reusable `static` | `selftest.cjs`; `scanners.cjs lint`, `security`, `advisories` against the frozen artifact and reviewed toolchain. | Advisory feeds must succeed; lint/security fixtures do not establish deployed headers, analytics cost or TLS. |
| Reusable `host` | `tools/quality/hosted.cjs`; exact origin, public bytes/digests, MIME/HTTP/indexing and 404 policy. Local serve fixtures verify guard behavior. | Actual immutable HTTPS URL, redirects, TLS and provider policy. |
| Reusable `staging` | `tools/quality/staging-regression.cjs`: Chromium/Firefox4 normal journeys/20 route observations;2 no-Canvas journeys/10 observations;2 navigation journeys;10 capability failures;7 analytics fixtures; conditional2 Color smoke; Research/Writing CPU×4 windows;4 cold/warm flights;2 sequential mobile Lighthouse trials. | Real browsers at the immutable candidate origin; bounded sample, not full/native/physical acceptance. |
| Full `linux` | `functional.cjs` on Chromium/Firefox:260 functional/8 navigation/26 analytics; `color-browser.cjs` retains original12 supplemental Color cases. | Installed pinned Linux browser revisions and exact artifact. |
| Full `native` | macOS WebKit130/4/13 completes core390/12/39; Windows Chromium/Firefox40/8/26 remains supplemental smoke. | Actual native jobs; Playwright WebKit is not branded Safari or a physical device. |
| Full `performance` | `lighthouse.cjs`:30 sequential trials,3×5 routes×2 profiles with medians; `motion.cjs`: desktop/mobile/mobile×4, raw probes/Off/reduced, flight samples and5-minute heaviest-route soak. | Same-artifact browser execution; no simultaneous benchmark workers. |
| Full `captures` | `capture_site_review.cjs`, contact sheets and contrast verification; complete retained route/theme/width captures. | Human visual interpretation and physical devices remain separate. |
| Aggregate `gate` | Staging `staging-gate.cjs` requires build/static/host/staging and exact smaller schemas; full `validate.cjs --full` requires complete full reports/native/external identities. | Never substitute staging `fullGate:false` / `productionEligible:false` for production. |
| Stable promotion and Pages | `staging/package`, `review-flow`, `pages/package/controller/http` behavioral/adversarial suites; same artifact, exact lease, receipt, combined inventory, prior package and recovery. | Owner-triggered ordinary two-host success, source/main leases and native uploaded ZIP/job identities. |
| Production archive/publication | `release-controller`, `release-archive`, Pages suites; frozen release/rights report, immutable archive, protected publisher and recovery. | Actual owner release/settings/protected-main/immutable Release controls, physical iOS/Android and independent rights/editorial acceptance; production opt-in remains off. |

`validation_level` selects coverage, the artifact's `edition` identifies the
actual bytes/rights, and `profile` selects host indexing/origin policy. Check
admitted tuples explicitly. A full Color production edition can be tested at a
staging host without claiming production-origin checks. Preserve canonical
production origin, staging noindex/badges and disabled staging analytics.

## Findings, proof, repair and status

| ID / priority | Scope and concrete proof | Canonical owner / repair | Current disposition |
| --- | --- | --- | --- |
| G01 / P0 | Actual `analytics-browser` fixture source-copy closure omits four legal owners after the new legal producer; current source tests can pass while real stage/full analytics build fails. | `tools/quality/analytics-browser.cjs`; use actual fixture helper with the legal module's declared owner closure; genuine legacy producer retains original four sources. Test actual hosted/five offline outputs, missing/symlink owners. | Actual-builder repair and12/12 focused proof are included in compatibility checkpoint d6e1764, with genuine legacy closure preserved. Final independent orchestration and integrated/native proof pending. |
| G02 / P2 | Actual Basic `tests(files)` accepted empty theme plus real archive as2/2, counting an empty file wrapper. Staging delegates those files, so strict additional-profile accounting could not catch it. | `local.cjs` reuses `source-tests.accounting(tap,{modules:files,root})`; keep old result shape and actual helper/CLI tests. | Frozen runner patch above; actual mixed-empty, complete, skip/TODO negatives pass. Integrated final checks pending. |
| G03 / P2 | Python selected active one-test module plus empty module returned `pass:true`, expected/run1. Aggregate nonempty check masked the empty selected module. | `run_repository_tests.py`; count each loaded module before one combined run, reject any zero, retain module lifecycle/finally and aggregate/skip/failure guards. | Frozen runner patch above;6/6 focused, including mixed-empty/import/CLI/lifecycle. No discovery rewrite. |
| G04 / P2 | `source-tests.run()` threw before returning a report; CLI retained only an error/snippet. A supported custom callback was needed to save complete raw failure evidence. | Explicit optional `--report PATH.json` / `options.report`: save bounded TAP/stderr before status/accounting, structured source/process/failure and source-after identity; fail on report-write errors. | Frozen runner patch above;17/17 Node cases pass. Default success shape/execution preserved. Actual ready CI and reusable preflight --report invocation and always-upload are present in d6e1764; source-runner raw namespaces are distinct from enclosing CLI capture. The later same-job dedup follow-up retains these routes; final orchestration/combined proof remains pending. Original failed test-harness attempt retained separately. |
| G05 / P1 | Source/static/package failures can occur after deployable artifact upload: `site-color-review` upload precedes package checks; reusable source step continues before upload/static; production candidate uploads before package gate. | Existing `local.cjs --prepublication` orchestration and named workflow steps; source/static/frozen-artifact/package validation before first deployable upload. Bind real native artifact IDs immediately after upload; never invent them locally. | Controller proposed patch32focused pass and actual ready/reusable CI --report plus always-upload are wired in that patch. G11 failure-condition repair is frozen in d6e1764; final orchestration/integration checks remain pending; Draft feedback stays narrow. |
| G06 / P1 | Paused Root feature release `prepareArchive` can remotely upload draft assets before local combined Pages compose detects a failure. | Existing release/actions/controller: complete local archive/package/Pages preparation before remote publish phase; retain live leases immediately before mutation. | Root-only follow-up implements local compose before remote draft upload; actual child-process five-fault zero-provider probes and97/97 seven-suite diagnostic pass. Root source independently closed at bd779000, with final CLI identity-fixture follow-up7416e1e also closed. Do not import Root production features into PR80. |
| G07 / P1 | Some full browser validators did not independently reconstruct complete provenance/counts; bounded performance collection aborted later original cases on a verified earlier budget failure. | Existing full validator, Color and staging regression owners: strict provenance/row identities/metric reconstruction; continue remaining original cases only after validated budget failure with renderer/probe validity, preserving final failure. | Browser branch a05f9c above; renderer and rawPreparation repairs independently cleared at a05f9c with46focused. Integrated source/hosted checks pending. |
| G08 / P1 | Image MIME maps were permissive, Pages transport lacked equivalent MIME enforcement, local fixture missed PNG/ICO/XML/TXT; actual staging httpSmoke retained an independent JPEG-suffix rule and review-flow.quickHttp accepted same-byte text/plain. | Existing `serve.cjs` MIME owner shared across hosted/stage/full/Pages/loopback and actual staging httpSmoke/review-flow.quickHttp; real same-byte wrong/missing header negatives. | Closed in clean9a27d455 with34 actual staging/review-flow cases, including wrong/missing MIME and JS-alias positive. Issue39 staging-guard-mime-scope-20261015 permits only two additional named publisher consumers; policy explicitly names tools/pages/http.cjs as the tenth amended owner and preserves597 other original blobs. Final combined scan/preflight/native proof pending; no provider MIME claim. |
| G09 / P1 | `pip-audit` partial/skipped graph coverage could be nonempty yet admitted; scanner engines stopped after an earlier independent failure. | Existing scanner/advisory owners: exact actual installed/locked package coverage, fail missing/skipped; collect independent engine outcomes while aggregate remains red. Preserve current exceptions. | Static repairs frozen in9a27d455 atop195ca3b. Final combined pinned scan/advisory/preflight proof pending. |
| G10 / P1 | At clean13e632c, rawPreparation.start numeric strings and missing/invalid/Infinity/negative/out-of-window rawPreparation.time pass stage flight validation. Type coercion/missing timestamp checks could classify malformed evidence as budget-only. | Existing flight validator: finite numeric start/time and measured-window containment before typed budget classification; include slow-plus-invalid negatives. | Repaired at a05f9c:21 field mutations plus slow-invalid abort negatives;46focused passes. Independent latest-tip review closed; integrated proof pending. |
| G11 / P1 | Proposed workflow preflight steps retain default success() semantics: an earlier artifact/rendition/edition/reused-byte failure skips preflight, so local dependency-blocked/independent-failure tests do not cover actual CI behavior. | Existing workflow steps: bounded failure-status override with authentication/cancellation boundaries, then retain failed/dependency-blocked reports; regress actual invocation condition as well as upload order. | Frozen d6e1764 uses !cancelled() plus successful authenticated source_identity, with staging/evidence mode guard. Builder/preflight failures remain red; upload skips. Workflow-condition negatives cover source-auth binding/status override/order; independent orchestration/combined proof pending. |
| G12 / P1 | Proposed preflight writes source CLI stderr to the same prepublication-source-tests.stderr path used by the source runner for its original child stderr, overwriting raw bytes and invalidating stderrBytes evidence. | Existing local orchestration gives command-level capture and source-runner JSON/raw streams distinct names; failure test verifies both survive with exact byte identity. | Frozen d6e1764 uses a distinct *-source-tests-runner report stem; a real failing-command/raw-byte regression is added. Independent orchestration/combined confirmation pending. |
| L01 / P1 | New licensing compiler/frozen verifier accepted full license blocks in comments/inert hidden contexts after coherent public snapshot/manifest/report rehash. This is a new feature guard defect, not a main production claim. | `release/rights-record.cjs` pure frozen verifier and source compiler; finite generated-markup containment rejects comment/template/script/style/noscript/hidden/inert/nested contexts. | Frozen Root follow-up7416e1e retains shared module SHA256 `a75627387167bfc822f78b2cfaae6fdeecbbc970621dcfcecca7c435b6b10ca8`, Git blob `26d3a27e3c736ed038023e6905a26bb67981a278`. Final exact shared module26d3/a756 independent review is closed; compatibility consumers use these same bytes. Integrated/native proof remains pending. |
| L03 / P1 | Candidate-owned staging/production edition CLI and package CLI are the old-main integration hooks, but API tests do not execute their clean-Git child-process chain end to end. | Existing rights suite: actual three CLI paths, exact clean SHA/tree/edition/report identity, missing/stale/wrong-commit/tree rejection before any host/upload. | Root-only actual clean-Git staging/production/package CLI integration plus wrong-source/tree and missing/stale report negatives now passes one targeted case in6.1s; seven-suite97/97 diagnostic pass. Root source independently closed at bd779000, with final CLI identity-fixture follow-up7416e1e also closed. |
| L02 / P1 | First ordinary Pages consumer must carry the new sibling rights report/receipt; dropping it would break mandatory per-publication licensing after candidate validation. | Exact shared frozen verifier, minimal old-main staging/Pages metadata extraction and receipt consumer. Modern exact licensed IDs require record without presence opt-out; genuine legacy history remains exact. | Compatibility consumer/preflight source frozen d6e1764; earlier31/31 and8/8 provisional results and the failed broader run retain their source/status. Independent final orchestration/combined proof pending. |
| N01 / blocker | Native cold Research3383ms and changed-method cold Writing3382.9ms exceed3200ms; earlier Writing TBT380.5ms exceeds200ms and the30-second HTTP timeout remain failed. These are actual failures, not guard fixture defects. | Product/performance investigation followed by fresh changed-source hosted evidence, preserving raw data and budgets. | Unresolved. No guard patch, continuation collection, skipped publisher or local green run converts either to admission. |

The static audit verifies the88 exact Python pins and current pinned runtime,
not the completeness of a future advisory feed. The one existing tooling-only
braces exception remains exact-source/config/lock/version/advisory/expiry-bound;
new, omitted, duplicate, skipped or malformed dependency records remain failures.
Security covers current tracked text, not full Git history. Semgrep retains its
eight local CC0 rules, one worker,5MB target bound and scanner64MiB output bound.
The static reports retain30 days; durable accepted release evidence remains a
separate archive. No scanner exception is widened by this review.

Independent rights/Pages review executed seven suites76/76 on the mutable
licensing proposal (19 rights,20 controller,8 archive,16 Pages,7 migration,4 trust,
2 reporting); this is diagnostic source evidence only. The three renderer/browser
owners passed46/46 at cleana05f9c after the rawPreparation repair (earlier13e632c
passed45/45). Their exact native-origin/platform/external
requirements remain those in the job matrix, not inferred from these counts.

For G11, [GitHub’s current status-check documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions)
explains the default success condition when no explicit status function is used.
The skipped-preflight consequence is an inference from that documented rule and
the actual proposed workflow conditions; a local orchestration unit test alone
does not demonstrate hosted Actions execution.

The notice check is bounded verification of generated markup, not a general
HTML/CSS renderer or human readability/rights approval. Current linked29 works /
46 external editions retain external terms with bodyIncluded:false and no site
license; no hosted article body or blanket grant is introduced by these guards.

## Evidence and proportional checks

Runner clean checkpoint e366674: focused Node17/17 in2.68s and Python6/6; Basic14+10=24;
focused pinned ESLint/Ruff and formatting pass; style guard89 files passes its bounded subset; no public/site bytes changed.
First focused Node16/17 was a test-harness nested Node protocol issue; raw failed
output remains retained, corrected test invokes the actual exported helper in a
separate process. Root and independent runner diff review found no blocker; frozen reviewer replay
passed17Node/6Python; dirty optional reports identify only commit/tree/dirty status, not exact
dirty bytes. `--require-clean` remains the exact-source route. Focused lint/format, RI28/coupling20 and fresh RI/CI verification pass. The
integrated complete source profile and pinned scans must be recorded on the final
combined source after all findings close, without post-proof source edits.

The source runner's execution limit stays180000ms and16MiB. Optional raw files
contain the complete captured bounded child streams; report-write failures remain
failures. PR/staging/production job limits and original browser/resource budgets
stay unchanged; all three affected build jobs retain their original10-minute
bounds after the temporary proposed increase was removed. Collecting more independent diagnostics can add bounded work;
actual final job timings must be measured and compared with their existing limits.
The Root-approved follow-up removes the duplicate source shell block within the
same reusable build job. Its existing source_checks step/output is now owned by
the one prepublication execution after artifact freeze/reuse; source/Python/RI/
generated/SEO/export command families still run once there. Independent checks
across separate authenticated pre/postupload contexts, including static/native
consumers, remain. No untrusted presence flag or proof-reuse skip is introduced;
actual runtime improvement remains unmeasured until final execution. No local source runtime measurement substitutes for the15-minute active staging
target or full native matrix.

## Minimal prepublication sequence and remaining acceptance

1. Finish the guard repairs in PR80, freeze each source input, independently review
   concrete diffs, integrate only those frozen patches and reconcile the complete
   registry/RI/CI/owning policy. Run exact clean source tests, style/lint, complete
   scanner/advisory coverage and negative controls locally first. Keep all failures.
2. Run the same existing prepublication entry point before the first deployable
   artifact upload for explicit staging/production. Collect independent local
   failures; mark artifact-dependent work blocked when prerequisites fail.
   Package/rights/scanner fixtures do not create native artifact identities.
3. After those results, obtain fresh authorized candidate preview evidence on the
   exact published guard/source, then ordinary permanent two-host staging and
   owner review of the changed licensing edition. No publication attempt is part
   of this audit or authorized by a local green report.
4. Continue production only through the original six owners: full frozen merged-
   main gate; separate exact-inventory rights/editorial, independent and physical
   iOS/Android records; actual production/protected publisher/immutable Release
   settings. Required `Staging admission` is not yet configured. Ownership
   Verified is already complete; do not repeat TXT setup.
5. A later explicit release decision covers domain/TLS/canonical.ai and.com/www
   one-hop301 path/query checks. Then verify served archive/recovery, SEO and
   indexability, Search Console and actual production analytics requests/counts/
   cost. Production/domain/DNS remain paused; no current local report closes ACs.


## Component matrices and independent failure surfaces

These detailed matrices preserve the review coverage behind the consolidated
findings. Their local commands run existing owners; they do not initiate a
provider publication. The proposed PR80 guard selection is45 permanent
Node modules after the one new publication-records module:42 staging plus3 Basic
delegates,45 production without replaying Basic, and7 permanent Python modules.
The final combined registry and actual named-case accounting must agree; no final
combined profile count/result is asserted here.

### Browser and performance guards

| Surface / selected profile | Actual producer and validator / tests | Meaningful negative scope | Remaining evidence |
| --- | --- | --- | --- |
| Preview / ready PR | local-browser, preview-smoke and Color smoke; preview/preview-smoke/prototype-admission/review-flow suites | Missing/wrong source/artifact/variant, invalid smoke, no-Canvas and unsupported runtime before promotion; narrow Draft proof cannot become admission. | Exact HTTPS preview and pinned Chromium; not stable staging. |
| Bounded functional | staging-regression validateFunctional/validateJourney/validateNavigation/validateAnalytics/validateColor; staging-regression and staging-gate suites | Missing/duplicate rows, wrong route/width/engine/theme/mode, false required checks, browser errors, malformed navigation/failure/analytics and Color provenance. | Original4+2 journeys,2 navigation,10 capability failures,7 analytics and optional2 Color width cases on candidate bytes. |
| Bounded performance | staging-regression validateMeasurement/validateFlight/validatePerformance and full validator transition/measure; staging-regression suite | Recompute raw durations/gaps, actual active renderer/probes, missing/stopped state, finite preparation fields/window, setup/cache/resource provenance, original budgets. Only a verified typed budget failure may collect the remaining original flights/Lighthouse; integrity/setup/cleanup errors abort. | Actual4 cold/warm flights,2 sequential Lighthouse trials and Research/Writing CPU×4 windows. Existing failed rows stay false. |
| Full functional/native | functional producer; validate.functional/analytics/navigation/scrollSyncEvidence; quality and functional/navigation fixture suites | Exact supported engines/platform/width/theme/mode matrix, actual browser versions, per-mode required evidence, scroll synchronization, cache/lifecycle and all original failures. A boolean pass label is insufficient. | Linux260/8/26 plus native macOS130/4/13; Windows40/8/26 supplemental. |
| Full Color | color-browser producer; validate.colorReports/colorPaint and closed color-motion-contract; quality/color-motion-contract fixtures | Exact canonical/immutable runtime tuple and complete browser/row provenance; missing paint/zero completed frames, retired ribbon geometry or substituted contract reject before acceptance. | Original12 Linux supplemental Color cases; no unknown-runtime fallback. |
| Full Lighthouse/motion/captures | lighthouse/motion/capture producers and validate.lighthouse/motion/measure/transition; quality and engine fixture families | Recompute raw metrics, three-run medians, Off/reduced zero work with valid positive probe, complete routes/profiles/soak/captures, finite ordered timing and matching identity. |30 sequential Lighthouse trials, desktop/mobile/mobile×4,5-minute soak and human visual/physical acceptance. |

The clean browser checkpoint is a05f9c/tree d7379656. The new rawPreparation
repair validates finite original start/duration/time and original measured-window
bounds; it introduces no timestamp relation or clock/budget adjustment. Its46
focused cases pass; independent latest-tip review is closed; integrated proof is pending.
Actual provider/native measurements have not been rerun by this review.

### Static, security, advisory, SEO and MIME guards

| Surface | Source and tests | Actual selection/retention | Finding and minimal disposition |
| --- | --- | --- | --- |
| Maintained lint | `scanners.cjs` lint; `quality-sources.test.cjs` ESLint/effects/Ruff/generated/Stylelint coverage and exact complexity reviews | Ready PR basic job; staging/full production reusable static job. Three engines share exact inventory. CI raw/static JSON uploads with `always()`, 30 days. | Coverage negatives are meaningful and retained. ESLint failure currently prevents Stylelint/Ruff; collect all independent engines and fail aggregate. |
| Security | Local eight Semgrep rules, `bandit-triage.cjs`, four closed exact secret ledgers; `quality-sources.test.cjs`, actual `selftest.cjs` probes | Mandatory static job for staging and production; ordinary PR basic intentionally only lint. Semgrep scans authored/public/workflow closure, Bandit Python tools, secrets all current tracked text (not Git history). | Strong existing source/line/rule/expiry/duplicate/symlink/coverage/ledger negatives retained. Semgrep/Bandit failure currently hides later engines. Preserve raw sanitized reports, collect each engine, fail category. |
| Dependency advisories | `scanners.cjs` advisories; exact `advisory-exceptions.json` helper/config/lock/source/version/date boundary | Mandatory reusable static job. npm lock graph and pinned Python requirements, including development tools. Feed failure is blocking, never zero vulnerabilities. | Missing direct policy tests. Python admission only checks nonempty dependency list/no vulnerabilities; omitted/duplicate/skipped/unknown dependencies can escape coverage accounting. Add exact pinned inventory seam and negatives, retain all real findings and finite exception. |
| SEO/editorial preservation | `check_site_seo.cjs`, `executive.test.cjs`, source metadata/content suites | Production build explicitly calls SEO; staging/PR permanent executive suite exercises canonical SEO; deep full Git history required. | Historical semantic preservation, exact reviewed amendments, source/portrait/link/metadata negatives remain. PR40's licensed successor is a separate already-reviewed exact amendment; do not copy broad allowances into PR80. |
| Served bytes/MIME | `hosted.cjs`, stage/full aggregate, `serve.cjs`, Pages `http.cjs`; quality/staging/Pages fixtures | Host job at exact supplied HTTPS version; collector verifies every non-nojekyll file hash/status, root, 404, bounded same-site redirects. | Baseline constrained HTML/JS/CSS/JSON/SVG but omitted JPEG/WebP/Pages and PNG/ICO/XML/TXT loopback coverage. Clean9a27d455 shares serve.cjs canonical MIME with all collectors and actual httpSmoke/quickHttp publishers;34 real publisher cases include same-byte wrong/missing headers, root/query/404 and JS alias. Final combined/native proof remains pending. |
| Failure propagation | `quality.test.cjs`, `staging-gate.test.cjs`, workflow source/build/static outcomes | Static lint/security/advisories steps use `!cancelled()`; gate requires exact source, one successful report per kind, all required jobs. Missing/failed/duplicate/wrong-source reports fail. | Preserve these independent negatives. Add engine-level continuation and fresh raw-output retention tests; do not report an unrun engine as clean. |

Use the normal pinned tools rather than a substitute mock graph. The established
local parity runtime has all88 pinned Python packages and exact JS tools;
Semgrep1.179.0, Bandit1.9.4, detect-secrets1.5.0 and pip-audit2.10.1 versions are
recorded. Full clean-source scans/advisory queries on the final integrated source
remain pending. A feed or scanner failure remains a failure; no offline success
or blanket entropy/complexity allowance is added.

### Rights, Pages, archives, recovery and analytics

| Publication path/job | Local guard/test owners and important negatives | Reproducible local command | Real host/external evidence still required |
| --- | --- | --- | --- |
| Candidate Color/staging and production edition generation before immutable artifact upload | release-rights: exact current sources, source commit/tree, dirty checkout, stage versus production edition, required legal owners and report, unknown/mixed grants, approvalPass false, portrait/brand exclusions, linked-only editions. edition CLIs now write reports before returning to the existing uploader. | node --test tests/release-rights.test.cjs | Actual candidate artifact upload must contain exact rights.json and whole-ZIP/source identity. A new workflow flag alone cannot update old-main execution. The frozen Root follow-up now executes the actual clean-Git CLI chain and adverse source/report cases; uploaded native artifacts remain separate. |
| Cloudflare immutable candidate package and protected-main predeploy validation | staging/staging-trust/staging-reporting: exact source/tree/artifact/upload/attempt, successful proof kind, finite host additions, retained rollback, stale main/provider rejection; failed full checks cannot become admission through smoke. Root proposal compiles/verifies current-source report in package CLI. | node --test tests/staging.test.cjs tests/staging-trust.test.cjs tests/staging-reporting.test.cjs tests/release-rights.test.cjs | Protected-main verifier currently rejects the future host file/contract until the applicable integration decision. Actual host200/body/redirect/noindex/cache checks, unchanged performance budgets and stable publisher admission remain pending. |
| Pages mirror composition and production-root preservation | pages-delivery + release-rights: exact source aliases/snapshots, root/staging byte preservation, actual404/query handling, origin/project prefix, report carry and receipt digests, missing/wrong-edition/stale reports, frozen archived-production digest. | node --test tests/pages-delivery.test.cjs tests/release-rights.test.cjs | Actual combined Pages upload/digest, prefix confinement and both rendered editions must be observed. Unit HTTP fixtures are not CDN observations. |
| Pages retained recovery and failed-first-publication recovery | pages-delivery: exact successful attempt/upload/receipt/source/hosted bytes, expired/foreign/incomplete/stale/ambiguous provenance, no active-production or accepted-baseline confusion, all launched requests settle before recovery. New sourceFromPackage/stagingFromPages preserve rights sidecars. | node --test tests/pages-delivery.test.cjs | Actual predecessor or authenticated failed-first receipt/bytes and the permitted recovery lease. Successful successor or merely failed rollback cannot supply it. |
| Origin/project migration and recovery | pages-migration: settings/controller/source/run/artifact authentication, exact captured settings lease, frozen predecessor or exact failed receipt, digest/traversal/symlink extraction failures. | node --test tests/pages-migration.test.cjs | Actual configured origin/settings and authorized finite migration/recovery observations; none performed. |
| Frozen production candidate/full external admission | release-controller + release-archive + release-rights: owner dispatch/protected exact main, separately hashed production Color/social metadata, exact rights.inventoryDigest and recorded maintainer selection, required named native jobs/raw evidence, wrong variant/edition/portrait/rights asset rejection. | node --test tests/release-controller.test.cjs tests/release-archive.test.cjs tests/release-rights.test.cjs | Full current exact-source native/security/device/independent/rights evidence and an explicit production decision. Fixture pass cannot grant approval. |
| Durable production archive, immutable Release and rollback | release-archive/controller: deterministic package, manifest-only extraction/no links/traversal, source/full gate/external acceptance, raw rights report bytes and trusted digest, immutable tags/assets, changed or absent current portrait/social/registry cannot relicense historical bytes. Existing archive verify uses frozen binding; new archive create/admission requires modern explicit policy. | node --test tests/release-archive.test.cjs tests/release-controller.test.cjs | Actual protected immutable Release/tag/App permissions, uploaded raw evidence and current accepted-live rollback identity. Current source must not retroactively recompile old provenance. |
| Final live publication/compensation | release-controller: failed/missing observations cannot update source/labels; exact live Pages/browser/passive coverage; failed bookkeeping compensates only after verified recovery; compensated success cannot become accepted rollback target. | node --test tests/release-controller.test.cjs tests/release-archive.test.cjs | Real HTTP/browser/passive results for all routes, actual source/labels/deployment transaction and recoverability. All pending. |
| Analytics browser fixture construction | analytics.test + actual analytics-browser buildFixture: declared full legal owners copied, real fixture builder used, missing/symlink legal owner rejected. This repairs the original unit-versus-browser fixture mismatch. | node --test tests/analytics.test.cjs | Actual seven selected vendor/consent modes still require the unchanged bounded browser job. Source fixture completeness is separately testable without a browser. |

### Prepublication ordering and raw diagnostics

| Boundary | Existing route / proposed repair | Local proof required | Host-only or pending limit |
| --- | --- | --- | --- |
| Before first deployable upload | Existing local.cjs --prepublication staging or production receives the already frozen artifact; existing build/static/source/fixture/package owners run before site-color-review/release-candidate/reusable upload. | Independent failure collection, invalid-artifact dependent blocking, exact source/tree/manifest unchanged, real package/edition/rights verification, source auth and status-aware workflow ordering. | G11/G12 repairs and regressions are frozen at d6e1764; independent orchestration and integrated source proof remain pending. Authentication/cancellation do not become bypasses. |
| Raw source failure evidence | source-tests --report PATH.json writes PATH.tap/PATH.stderr before assertions; source-before/after and cleanSourceRequired remain explicit; ready site-checks and reusable build select --report. | Actual process failure/accounting/timeout/mutation/report-write cases; Basic mixed-empty and Python mixed-empty reject. | e366674 independent17Node/6Python pass; actual combined workflow retention is wired at d6e1764; final independent orchestration proof remains pending. |
| Always-retained reports | Existing Actions report artifact uses always() and named report directory after preflight; original job failure remains failure. | Distinct source worker raw streams versus enclosing CLI command streams; all byte counts agree, no earlier failure overwritten. | G12 collision correction is frozen at d6e1764; independent review and actual uploaded artifacts are not supplied by a local fixture. |
| Frozen producer/consumer parity | Candidate edition/package CLI, protected-main package/Pages verifier, receipt and both extraction routes consume same exact public files and shared frozen rights verifier. | Modern record removal/relabelling, wrong source/tree/edition/digest and coherent rehash negatives; pinned genuine legacy output comparison. | Exact shared module26d3/a756 is independently closed and copied into d6e1764. Final consumer orchestration, new native artifact/job checks and ordinary two-host admission pending. |
| Local archive before remote draft mutation | Paused Root-only release/actions prepare/compose/publish separation. | Actual child-process fault probes assert zero provider calls for bad archive/production/staging/Pages/rights. | Root7416e1e final review closed;97focused plus actual conflicting-CI-identity CLI proof. Integrated feature/native proof remains separate. Do not port Root production features into PR80. |

Numeric issue snapshots stay out of enduring Python by design. Their selected
owning policy is a separate required local check; do not hardcode39 in the new
preflight or replay all historical task modules. Ordinary `/stage` still requires
fresh raw-head Basic/RI/owning admission before upload. The production candidate
operator must likewise retain the selected current-issue result; preflight does
not claim to supply it.

Command examples retain the existing runner and explicit report file:

```sh
# Staging delegates three modules to Basic.
node tools/quality/local.cjs
node tools/quality/source-tests.cjs --profile staging --require-clean --report /tmp/source-staging.json
node tools/quality/source-tests.cjs --profile production --require-clean --report /tmp/source-production.json
node tools/quality/local.cjs --prepublication staging FROZEN_ARTIFACT --report /tmp/prepublication-staging.json
node tools/quality/local.cjs --prepublication production FROZEN_ARTIFACT --report /tmp/prepublication-production.json
python3 tools/issue_acceptance.py validate --policy CURRENT_ISSUE_POLICY
python3 tools/issue_acceptance.py run --policy CURRENT_ISSUE_POLICY --require-clean --expected-source EXACT_SHA --report /tmp/owning-acceptance.json
```

These examples perform local verification only. Do not run them against a moving
branch and reuse an old result as clean final proof. The prepublication mode is
part of the proposed combined controller guard; it is not present on protected
main merely because this review describes it.

## Decisions

The latest maintainer instruction selects guard review/repair before PR40 and
before any further publication attempt. Existing PR80/#39 remains the owner;
there is no new competing issue or publication authority. Preserve CS01/CS04/
CS05/CS08/CS09/CS10 source ownership, readable explicit flow, meaningful negatives,
proportional checks and independent review. Source/profile/registry and generated
RI views are editing/verification concerns; public/site/runtime/SEO bodies and
license/consent decisions are unchanged by the guard-only increment.

## Sol tasks

| Task / owner | Required outcome | Findings / AC | Current status |
| --- | --- | --- | --- |
| T01 / runner owner | Actual named Basic tests, individually nonempty Python modules, raw source failure evidence. | G02–G04 / AC03–AC04 | Clean e366674; independent17Node/6Python pass. Actual CI invocation/retention present at d6e1764; final orchestration/integrated proof pending. |
| T02 / browser owners | Strict full/browser provenance and raw timing/renderer validity; collect remaining original cases only after trusted budget failure. | G07/G10 / AC03 | Clean a05f9c;46focused, latest independent review closed; integrated proof pending. |
| T03 / static owner | Shared exact MIME, complete pinned advisory graph, independent scanner outcomes and retained raw failures. | G08/G09 / AC03–AC04 | Clean9a27d455;34 staging/review-flow cases and lint/style/RI pass. Final combined pinned scan/preflight/integrated proof pending. |
| T04 / controller owner | Source-authenticated pre-upload preflight, required record/receipt parity, status-aware diagnostic execution and distinct raw namespaces. | G05/G11/G12/L02 / AC03–AC04 | Clean d6e1764; independent orchestration and integrated/static proof pending. |
| T05 / Root feature owners | Notice containment, actual CLI chain, local archive/Pages preparation before remote mutation. | G06/L01/L03 / AC03 | Clean7416e1e;97focused plus actual conflicting-CI CLI proof independently closed. Feature/native integration remains paused. Keep Root-only features out of PR80. |
| T06 / final integration owner | Merge frozen guard inputs, reconcile all profiles/policy/RI/CI, run one exact clean complete profile plus current scanners/negative controls and actual native checks. | All applicable ACs | Pending; no publication during unfinished audit. |

## Acceptance evidence

| AC | Current deterministic evidence | Exact source / limit | Remaining whole acceptance |
| --- | --- | --- | --- |
| AC01 | Main/compatibility/source and test inventory revalidated locally. | Exact baseline table; this is not a new provider inventory. | Live refs/provider/settings evidence and original owner decisions. |
| AC02 | Existing finite domain/redirect/migration contracts retained. | No domain or DNS operation performed. | Original actual DNS/TLS/routing/settings/migration requirements. |
| AC03 | Component guard fixes/negatives and unchanged original profile families/budgets documented. | Frozen component tips versus explicitly mutable proposals are separated; final integrated source/native proof pending. | Actual same-artifact staging/full release, rights/physical/independent and production-origin gates. |
| AC04 | Ownership, scoped style/lint/format, runner independent review and RI/coupling evidence. | e366674 focused proof; final registry/report/policy/CI linkage must match integrated source. | Final independent review, actual issue/PR/check linkage, settings and applicable merge decision. |
| AC05 | No new live production acceptance claimed. | Existing native failures remain failed. | All original host/domain/release/live recovery criteria. |

## Issue synopsis

The broad guard review separates actual source/fixture/accounting/reporting gaps
from the known native performance failures and from the paused licensing feature.
Repairs reuse the existing runners, workflows, archive and receipt owners. All
original case families and budgets remain; only final exact integrated checks
and native evidence can advance the next publication step.
