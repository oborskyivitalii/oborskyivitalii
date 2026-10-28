# Issue 159 — B2 QA isolation, 28 October 2026

Owner [issue159](https://github.com/oborskyivitalii/oborskyivitalii/issues/159),
execution [Draft PR160](https://github.com/oborskyivitalii/oborskyivitalii/pull/160).
Implementer `/root`; independent roles recorded below. Base B1 head
`68fb57a5e72eed2f55635703f74f334740f2747b`, tree
`23926df358293034bf87a9c5ed1b097a6c3c2791`; current candidate is explicitly dirty
until its immutable reviewed source is recorded. Main remains
`9318a54a684079bb23e5dadcfa4bf705d6783dd0` at intake.

## Intent, decisions and source boundaries

User authorized the next bounded batch after B1. Analytics production precedes
Terra research and the separate SEO release. Stable AC01–AC18 and all external
release/human/provider gates remain. B2 implements AC11's selected harness boundary
and AC12's reproducible report procedure, retaining AC14 article readiness.
No site adapter, generated public output, provider configuration, historical
traffic, dependency pin, performance budget or permission is changed.

Pre-edit `/root/b2_requirements` independently inspected live intent and source:
ACCEPT bounded B2; all mandatory smoke child contexts required, optional siblings
may remain named residual; actual contrast must follow isolation with an ordinary
context. Reporting may be a small runbook. The old ANALYTICS selector excluded
preview-smoke, so a new named ISOLATION bridge and registry inputs are necessary.
No material ambiguity required another owner decision.

Explicit context factory installs the finite manual Cloudflare collector route
before returning a context. It blocks service workers, aborts matching requests,
closes on setup/abort failure and retains counts/errors without request bodies.
Ordinary contexts never use the factory. SDK loading remains enabled and product
location/route/one-SDK guards remain byte-identical. All normal/content smoke,
article-tags primary/text/failure, native article normal/fallback and Color
contexts call the factory. Main smoke aggregates receipts; separate Color reports
its own. A routing change can shadow an earlier handler, so broad/page routing
requires explicit review; current child handlers target only publication-index.

The context route disables HTTP cache: smoke/functional observations cannot prove
hosted SDK or cold performance cost. Optional functional/navigation/motion/
Lighthouse/CDP sibling contexts and owner/unknown automation remain possible
emitters. This is bounded isolation, not a universal clean-traffic claim.

Primary API boundaries checked against current documentation:
[Playwright context routing](https://playwright.dev/docs/api/class-browsercontext#browser-context-route)
(service-worker bypass and routing/cache limits) and
[Cloudflare data collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)
(manual non-proxied collector destination). No new provider field is guessed.

## Style and allocation

CS01/04: helper owns one finite QA concern, explicit arguments/receipts, no browser
or process-global monkeypatch; adapter/producer dependency direction preserved.
CS05: pinned formatter on touched owners; no unrelated whole-file cleanup.
CS06: context-owned route/cleanup; no product timers, history wrappers or storage.
CS07: fixed budgets retained; local sink is bounded and no cost claim is made.
CS08/09/10: meaningful setup/abort/predicate negatives, maintained source/hosted
allocation, bounded style guard plus independent semantic review. CS02/03 product
content/CSS unchanged. Registry/catalog/coupling and RI refreshed for new owners.

| AC/risk | Scenario and independent oracle | Actual route | Status |
| --- | --- | --- | --- |
| AC11 narrow scope | Exact collector/query accepted; SDK/lookalike/credentials/HTTP/port/path variants unaffected | preview-smoke source suite → ISOLATION policy bridge; targeted Basic/staging/production source profiles | pending execution |
| AC11 fail closed | Install before page; setup/abort fault closes context; invalid receipt rejected | same maintained source suite | pending execution |
| AC11 ordinary collection | Actual adapter + stub SDK + complete local network sink; isolated six attempts blocked, following ordinary six allowed; navigation/reload/history preserve one SDK/document | analytics-browser isolationJourney called explicitly by local-browser main in existing native preview/production smoke (Draft prototype skips this route) | pending native execution |
| AC14 declared article | Fixture canonical/alias loads SDK; unknown/trailing-slash/snapshot variants rejected | same bounded browser contrast; no actual publication | pending native execution |
| AC12 report | Fixed UTC interval/page inventory, separate raw/non-headless/visits/GSC, sampling/missing referrer limits; repeat saved-receipt method | SITE-ANALYTICS fixed-window report procedure and independent operator | pending walkthrough |
| AC15/16/18 preservation | Existing aliases, blocked/delayed SDK and stage/offline source contracts retained | ANALYTICS owning selector and existing browser fixtures | pending exact-source checks |

The new bridge executes maintained preview-smoke tests; no custom runner/schema.
The actual browser contrast never contacts the provider: every ordinary/isolated
request is owned by a fixture sink, with a fake public token. It proves interception
and absence of cross-context suppression, not accepted production events.

## Independent role executions

| Role | Identity | Actual inspected source/checks | Verdict and limits |
| --- | --- | --- | --- |
| Requirements | `/root/b2_requirements` | Live issue159, B1/current source and preflight design | Pre-edit ACCEPT; final candidate pending |
| Code reviewer | pending | pending | pending |
| White-box QA | pending | pending | pending |
| Exploratory/operator QA | pending | pending | pending |

## Acceptance evidence and failures

Checks, failure diagnosis, exact prepared-source digest and final clean-source
report are appended after execution. Source pass cannot tick whole live-gated
AC11/12/18, authorize a merge/release or complete future SEO obligations.

## Remaining full plan

B1 baseline/intake done → B2 this isolation/report source batch → B3 exact-head
owning/source/staging/control admission, protected merge, authorized analytics
production, smoke/provider/history/filter/vital/SDK-cost evidence and equal-window
baseline → B4 Terra audience/intent/query research → B5 existing-page SEO/two
briefs/staging → B6 separate SEO production/live verification → B7 full AC mapping
and closure. No sequencing/scope change; optional emitters remain explicitly named.

Preliminary independent review found cold-preparation ordering regression from an
unconditional contrast in analytics-browser.run, incomplete Color mock routing,
wrong revision-versus-artifact report instructions and Color failure reporting
being bypassed by validation. The code reviewer retained failed targeted logs.
Correction: keep contrast only at the explicit native smoke call; preserve cold
fixture preparation unchanged; give Color readiness mocks an observed route-before-
page assertion; use artifact.json schema; capture isolation failure before saving
the failed Color report. No existing preparation/readiness oracle is weakened.
White-box review also requested an explicit fresh ordinary transport after setup
failure; its helper fault model already rejected leakage/SDK suppression mutants.

## Corrected native observation and bounded checks

Actual native Chromium **153.0.8010.12** contrast passed on 28 October at
12:11:49.961Z. [Raw compressed receipt](2026-10-28-b2-browser.json.gz) includes
core file SHA256s, environment, archive restore and exact provider API metadata.
The repo-pinned Linux artifact12643236386 was downloaded through the connector;
maintained select_record/authenticate/unpack_package/extract functions checked
same OS/package/revision, successful owner seed/run/attempt/workflow, source
ancestry, expiry/name/native digest, complete inner hashes/inventory and safe
extraction. No CDN/system/browser substitute or pin change was used. Setup itself
launched no browser; the first launch occurred in the actual contrast test.
One unsupported direct artifact-metadata Fetch URL returned400; the existing
workflow-artifact list connector supplied the exact same metadata read instead.

Observed each cohort: six attempted collector POSTs across extensionless entry,
pushState, reload, Back/Forward and declared article canonical. Isolated: **6
blocked / 0 sink**; following fresh ordinary: **0 blocked / 6 local-sink allowed**.
Four SDK requests across four documents (including article alias), none added
by history; double adapter invocation stayed one SDK/document. Three undeclared
article/slash/snapshot variants admitted no SDK. Requests used a fake token and
complete local sink: **no real provider receipt or production visit**.

Corrected source checks: preview-smoke **18/18**, cold preparation **1/1**,
Color publication readiness **3/3**, all without skips. Existing assertions were
preserved; the added failure contrast now creates a distinct ordinary context
with an allowed collector sink after failed isolated setup. New fixture readiness
is explicitly6000ms and navigation30000ms. First formatter check passed535files,
no changes. The retained preliminary diagnostic archive has both actual failed
cold/Color logs and independent helper/replay/fault-model results. Reviewers'
initial tests ran a dirty source whose full tree was not frozen; their exact
tracked-diff/helper digests and that limit are preserved, never relabelled as
final-source evidence.

Native contrast supplies bounded mechanism proof; full current-artifact child
journeys/staging, exact-head control admission, protected merge, production,
provider receipt, finalized report comparison/vital samples/SDK cost stay B3.
Draft prototype previews skip browsers and cannot supply those observations.
