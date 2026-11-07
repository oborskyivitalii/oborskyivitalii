# Issue169 — bounded R9 runtime diagnostic preparation

Refs #169 / PR170. Orchestrator checkpoint, not independent runtime acceptance.
R9 native predecessor `fb5b68e35d5f4787e2f92625ec9d34440736bc29`,
tree `730109cb6914433dfb94fd0ce4e95451dc714125`, remains the accepted content.
The next coherent diagnostic commit includes its own workflow/script and must
be dispatched by that exact new SHA, never called a browser execution of fb5.

## Observed failure and bounded treatment

Exact-head preview [42064129837/build127373717426](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42064129837)
built the selected R9 edition/assets/PDF, then failed `unreviewed Color motion runtime`.
The fail-closed release guard remains unchanged. Clean fb5 source lint passed346
files with ESLint10.12.0, Stylelint17.16.0 and Ruff0.16.10; that is not a browser pass.

Supported browser GitHub authentication was verified on a fresh signed-in dashboard;
the earlier credential submission result did not itself establish success. No new
publication permission is needed. Local Chromium remains unavailable; no isolation,
file-navigation or runtime-review guard is bypassed.

The existing explicit manual `site-navigation-probe.yml` now builds raw exact Color
diagnostic inputs on pinned Ubuntu24.04/Node24.19.0/Python3.12.14 and the existing
verified Chromium archive. It replaces only the old Windows Firefox diagnostic;
`BROWSER-ARCHIVES.md` and positive/negative consumer tests record that change. Required
Firefox/native-platform/hosted/staging/production profiles are unaffected. Read-only
contents/actions permissions and the ten-minute job limit remain. Uploads bind run
and attempt and fail if evidence is missing.

## Source, oracles and execution boundary

The QA-authored `r9/reader-runtime-probe.cjs` is a dated diagnostic, not new active
runtime/build logic. Its final pretrigger SHA256 is
`3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`.
`r9/diagnostic-input-manifest.json` pins actual source/prompt inputs. The script
requires clean Git before/after, exact workflow/source/input/HEAD identity and
committed workflow bytes, existing public artifact verification, locked publication
text/figure oracles, dependency locks and browser archive receipt/version. Its fixed
240-second watchdog and bounded actions preserve partial results.

Four contexts (1440/390, normal/no-JS) and28 cases are declared before execution.
Normal contexts observe16 actual route legs over two repetitions: Writing→reader→
Back→footer-next→Back. Native footer departures require actual self-box CSS animation
start AND matching end, positive elapsed duration and no cancel. Eventual URL/busy
settlement or a watchdog cannot substitute. Exact title, five ordered figures with
caption/alt/dimensions, loaded media, original PDF bytes, native links, viewer/focus,
scroll restoration, requests/errors, screenshots and traces remain distinct oracles.
Both modes record actual viewport/DPR/theme/motion. No-JS follows actual native links
and history; outside references are inspected, not crawled or posted.

Every result is `fullGate:false`; runtime admission is explicitly not evaluated.
Loopback pinned-CI observations cannot establish hosted TLS/headers/CSP, physical
device usability, all browser platforms, performance or production acceptance.

## Actual independent preparation

Four distinct existing nonauthor agents continued their isolated initial executions;
these are correction continuations, not new fresh-context claims. Common/role prompts
and actual initial launch records remain in `r9/native-launch-receipts.json`.

| Role | Actual result and scope |
| --- | --- |
| Requirements | Dated diagnostic preflight and reconciliation inspect authorization, source coherence, bounded matrix/oracles and nonadmission; no new author decision |
| Code | Dated diagnostic Code report preserves first findings and correction readback of final script/workflow; syntax, canonical formatting and12consumer tests passed |
| White-box | Dated diagnostic White-box report preserves initial gaps, corrected native-footer positive/negative and partial-accounting checks; final binding readback recorded by that role |
| Exploratory | Independently designed charter and QA-only observation script; no browser observation claimed until actual CI results are inspected |

The QA author is independent of application implementation; Code/White-box inspect
the observation code and oracles separately. Provider context/memory internals remain
unknown. No reviewer report or source hash substitutes for the pending execution.

Local current-wiring Basic16+10, quality21 and browser-archive consumer12 passed;
actual logs remain bounded source evidence. Native publication/runtime/rights files
have zero diff from fb5. Final catalog/RI/coupling freshness must be verified before
the new exact diagnostic head is dispatched. An observed failure is retained and
diagnosed before any changed-source rerun. No staging/merge/production claim.
