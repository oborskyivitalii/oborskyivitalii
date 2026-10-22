# Site check profiles

Owner: [test optimization #35](https://github.com/oborskyivitalii/oborskyivitalii/issues/35);
[release gates #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) and
[hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) retain their
pipeline and deployment acceptance. This guide owns test scheduling and the
[test registry](../tools/quality/test-profiles.json). Runtime/publication claims
belong to source-bound results in the live issue/PR, not the profile name.
Issue [#72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72) changes
Draft iteration scheduling while preserving admission and later budgets.

| Profile | Trigger | Required coverage |
| --- | --- | --- |
| Draft prototype | Same-repository Draft updates | Generated/package/snapshot/size checks, public script syntax and bounded HTTP identity; no toolchain installation or browser/source/governance suites. Deferred admission is explicit. |
| PR source | Ready PR updates and `ready_for_review` | Small Basic source check, RI/CI coverage and the owning issue's targeted AC policy. Additional source suites follow changed paths in the registry. |
| PR hosted smoke | Ready same-repository PR updates | Exact artifact/HTTP identity and Chromium at 1440/390 widths: routes, controls, persistent navigation/history and no-Canvas fallback; authored Color adds its two-width smoke. |
| Staging regression | Owner `/stage` or dispatch for stable staging; owner `staging-regression` PR label for evidence without promotion | Exact source/public/package/host identity; bounded source suites, lint/security/advisories; Chromium/Firefox journeys, representative failure/navigation/analytics checks, two mobile Lighthouse trials and bounded motion/flight samples. |
| Production admission | Owner dispatch after successful staging and protected merge | Authenticate original staging jobs/reports and identical complete source tree; freeze production edition, rights and immutable archive. No second browser/performance matrix. |
| Post-production smoke | Publication or rollback | Exact served bytes, routes/assets, HTTPS, canonical/indexing/404 policy and bounded Chromium navigation/control smoke. |
| Optional production regression | Manual dispatch when needed | Complete unchanged source/scanner/advisory/browser/native/Color/accessibility/failure/Lighthouse/CPU/soak/capture matrix and bounded passive ZAP. Its status never blocks publication. |
| Diagnostics | Manual dispatch or a relevant changed-path selection | Historical export/configuration probes and experimental comparison suites. Preserve useful fault coverage; dated edition assertions do not run as every candidate's universal regression. |

## PR feedback

Default local command: `node tools/quality/local.cjs`. It needs no browser
download, advisory feed or soak. `site-checks.yml` runs this Basic profile;
`navigation.yml` validates RI, its CI mapping and maintained repository contracts.
It also runs the bounded [code-style guard](CODE-STYLE.md#cs09--what-the-current-automatic-guard-proves)
and `test_code_style.py` negatives/agent routes without installing a toolchain.
This is a permanent cheap governance suite; `run_repository_tests.py` also
discovers it for the maintained repository-contract layer. Do not interpret its
passing subset as full formatting, architecture or performance acceptance.
The acceptance workflow selects the owning issue's policy. Targeted additions
must exercise that issue's observable ACs; a generic green smoke does not replace
them. Hosted smoke remains a distinct report and cannot authorize stable staging.
Preview packaging uses `local.cjs --package-gate` and emits `package-gate` with
`sourceTestsRun: false`; it proves generated/public/upload identity without
repeating Basic source tests. The required Basic check remains independent.
After visual approval mark the PR ready; deferred source/RI jobs use distinct
names, so their skips cannot impersonate required admission contexts. `/stage`
requires real successful latest raw-head source/RI/issue jobs. Explicit
`staging-regression` requests retain their selected regression for Drafts.
The 16 October #72 amendment removes GitHub Pages staging and its hosted smoke.
Cloudflare is the only staging publisher. Historical Pages package/recovery and
production archive negatives remain source checks because production consumers
still use those helpers; they are deferred during Draft packaging.

Issue #36 adds a scoped diagnostic on existing `site-writing-probe.yml`:
the exact `site-writing-paradigm-evidence` label event on same-repository PR #38
runs focused Writing checks in Linux Chromium/Firefox, captures and 18 sequential
paired Color trials. Its fixed baseline is
`11e5432d908ca0b81431ca4eac6721b076c33cb6`; the candidate is the exact PR head.
Three profiles each retain three ordered pairs plus a candidate 40-cycle
lifecycle/cache observation. WebKit remains on native macOS in production; it
is not reintroduced through this Linux diagnostic. The job has a 45-minute bound and retains all raw
failures/captures for 90 days. Ordinary PR updates retain the small source/smoke
profiles. Preview delivery does not wait for this diagnostic. On harness/validator
failures, inspect and revalidate retained raw observations before choosing any
new measurement; do not replay all trials to repair report parsing. A runtime
change invalidates old runtime evidence, while test-only changes do not create
new measurements. These reports cannot authorize staging or satisfy production/native
device gates. Its source fixtures are diagnostics selected by their changed
helpers or the owning issue policy; current formula runtime assertions remain
in the permanent renderer and engine suites.

## Bounded staging regression

Explicit stable-staging/evidence and optional full diagnostic preparation first
run `local.cjs --prepublication` on the exact frozen artifact before deployable
upload. It orchestrates the existing source, Python, style/RI, scanner and
artifact/edition/rights/package owners, retains independent failures and checks
source/public immutability again at the end. The staging source allocation is
Basic plus the nonbaseline staging suites; production runs its complete source
allocation once. Missing artifact prerequisites block their dependent checks.
For staging, the producer runs these guards once before upload and retains all
raw reports. Build/static consumers authenticate the native preflight artifact
from the same run/controller/attempt and verify complete successful guard rows,
clean source/tree, exact manifest/edition and every retained file hash. They reuse
the original host-independent scanner reports; no host target is fabricated.
Missing, failed, modified, wrong-source/profile/attempt reports fail. Direct
staging validation without an existing producer report runs one preflight.
The optional full diagnostic retains its complete existing route. Production
admission instead authenticates accepted staging through `tools/release/staging-policy.cjs`;
it does not rerun this preflight or claim cached production test results.

This is a preparation order within the existing profiles, not a replacement
gate or permission to deploy. Host/native/live assertions still follow, using
the same artifact. Normal Draft preview remains bounded.

Issue #45 uses the existing Writing diagnostic workflow's separate
`site-reading-clarity-evidence` label job for a bounded Chromium comparison of
heading geometry and actual formula captures. It does not run paired performance
trials, stage a candidate or replace ordinary preview smoke. Its source/visual
policy and retained report distinguish automated geometry from visual acceptance.

`site-release-checks.yml` uses `validation_level: staging`, `profile: staging`
and `automated_only: true` for the owner staging controller. The owner's
`staging-regression` label on an open same-repository PR runs the same bounded
candidate validation against its immutable preview URL without stable promotion;
it uses a distinct concurrency route and does not change ordinary PR smoke.
The complete bounded matrix is executable in `tools/quality/staging-regression.cjs`:

| Check | Cases |
| --- | --- |
| Normal route journeys | Chromium and Firefox, 1440 and 390 widths: four journeys, each visiting all five routes (20 route observations). |
| No-Canvas route journeys | Chromium at both widths: two journeys visiting all five routes (10 route observations). |
| Persistent navigation | Chromium 1440/light and Firefox 390/dark: two complete representative journeys. |
| Capability/failure fixtures | Ten Chromium 320px cases, including the remaining original failure modes; no-Canvas is covered by the separate all-route journeys. |
| Analytics fixtures | Seven Chromium fixtures containing all five canonical/extensionless entry probes (Home plus Writing/Research/Talks/Credits), blocked/delayed SDK, staging suppression and Home/Writing offline suppression. Vendor traffic uses a local stub; missing entry-form evidence fails the gate. |
| Authored Color smoke | Two Chromium width cases when the artifact is the Color rendition. |
| Lighthouse | Research and Writing: two sequential single mobile trials. Individual original mobile metric budgets apply; these are not three-run median release results. |
| Sustained motion | Research/Writing at 390px and CPU ×4: idle, scroll, Off and reduced windows for each route, with positive paint probes and original applicable limits. |
| Navigation timing | Four Index-to-destination flights: a cold/warm pair in a fresh context for each of Research and Writing. Unmeasured return/setup is distinguished from the four actual observations. |

Staging omits native macOS/Windows jobs, the full Color12 matrix, thirty
Lighthouse runs, the five-minute soak, release captures and long cache-retention
loops. Those remain in production regression. Staging's active-job duration
target is at most 15 minutes; only measured CI durations establish achieved
performance, and queue time is reported separately.

The runner produces `stage-functional` and `stage-performance` reports.
`tools/quality/staging-gate.cjs` checks exact completeness, successful build/static/
host/staging jobs, scanner reports and source/tree/artifact/origin identities,
then emits `staging-gate` with `fullGate: false` and `productionEligible: false`.
Missing, duplicate, malformed, failed or wrong-source evidence fails. Stable
staging consumes this distinct gate; a production validator cannot treat it as
a full hosted/release report.

Issue #45 also has one bounded attribution job in `site-cause-probe.yml`:
the exact `site-writing-cause-evidence` label event on same-repository PR #47
runs four fresh Writing mobile/simulated Lighthouse observations with explicit
function-level CPU samples. Normal Color and the maintained private no-ribbons,
no-canvas-draw and thematic-off controls share one exact clean source/tree and
declared parent lineage. Raw reports, traces and network logs are retained before
validation. Collection success is not performance acceptance; all diagnostic
reports keep `fullGate: false` and `performanceAcceptance: false`. This does not
change ordinary staging trials, settings, cases or admission budgets. Historical
Research/WebKit cause-probe replay stays manual and retains its original count.

Issue #39 uses the separate PR #40-only `site-writing-current-evidence` label
job in that same workflow: five ordinary fresh-process mobile/simulated Writing
trials on one exact unchanged Color artifact, followed by one separately sampled
CPU attribution. Every result, trace and network log survives; no retry or
best-run selection. The original200ms individual budget remains; collection
success is not performance acceptance or full/staging admission. Cleanup failure
stops further launches. Historical protocols above remain unchanged.

## Optional complete production regression

The maintainer-approved 17 October policy in issue #39 makes this an optional
manual action, `site-candidate-evidence.yml`. It is not a dependency of the
production publisher; failed or skipped diagnostics stay visible without
blocking publication. `validation_level: production` remains the reusable
workflow's default for this full diagnostic. Coverage remains 390 functional / 12
navigation / 39 analytics cases: Linux Chromium/Firefox 260/8/26 and native
macOS WebKit 130/4/13. Windows 40/8/26 smoke and all twelve original Linux Color
checks remain supplemental. Original scanner, exception, raw metric, failure,
source/manifest guards remain in force within this diagnostic. Physical-device
and implementation review records remain separate observations, not required
inputs to the staging-based publisher. Exact-edition rights acceptance remains required.

The `profile` / `SITE_TEST_PROFILE` value describes the hosted origin and its
indexing policy (`staging` or `production`); `validation_level` selects the test
coverage. Full production regression can inspect an immutable staging candidate
without claiming production-origin indexing/TLS/ZAP acceptance. A production
origin must receive its applicable live checks separately. The explicit frozen production candidate supports Color; its staging edition never qualifies as production evidence.

See [SITE-RELEASE-GATES](SITE-RELEASE-GATES.md) for unchanged release budgets and
[SITE-STAGING](SITE-STAGING.md) for controller, source leases, promotion and
retained recovery. Production activation remains outside routine staging.

## QA findings to GitHub Actions

The [independent quality-agent protocol](../CONTRIBUTING.md#independent-quality-agents)
owns four separate role executions. Requirements review checks intent/AC quality;
both QA roles propose test cases; code review examines the resulting code and tests.
They execute during development/review. The existing Actions jobs run selected
tests, not LLM reviewers, and cannot prove that independent agent work occurred.

For each material QA finding record in the owning review artifact:

| Link | Required decision/evidence |
| --- | --- |
| Intent and risk | Stable AC, affected behavior/invariant and meaningful failure to detect |
| Scenario and oracle | Preconditions/data/action, expected observable result and its contract source |
| Test disposition | Reuse an adequate test, extend an existing suite, add a justified regression, retain manual evidence, or defer with owner/reason and its unresolved acceptance effect |
| Execution route | Exact selector/command, suite owner, lifecycle and profile, workflow/job and trigger/changed-path selection; a file's existence alone is insufficient |
| Result and limits | Actual tested source/environment/run, pass/fail/not observed, original failed evidence and remaining manual decision |

Prefer the smallest deterministic level that detects the failure. Reproduced
exploration defects should become regression cases where useful; visual judgment,
physical-device behavior and inaccessible conditions remain explicitly bounded.
Reuse the current unit/integration/browser/CLI owners. Register real new suites or
changed inputs/lifecycles/profiles in `tools/quality/test-profiles.json`; an added
test in an already-discovered Python suite can use its existing workflow route.
Do not edit the registry merely to name a new agent, create duplicate full matrices,
raise budgets, broaden scheduled diagnostics or retry until green. A manual workflow
trigger is not manual QA. Design/coverage plans do not establish executed coverage.

Review both positive behavior and meaningful negative cases, deduplicate the same
failure assertion while retaining distinct failure surfaces, and preserve test
selection/failure propagation in the existing RI/CI map. Any new or changed gate
must retain its approved semantics. Existing staging/production/device decisions
and the optional full-regression policy are unchanged by these agent roles.

## Registry and issue completion

The registry inventories current suites, scheduled profiles, changed-path targets
and retained diagnostics. Use `tools/quality/source-tests.cjs` to select registered
source suites instead of a wildcard that revives every historical snapshot.
Historical issue-specific policies remain source-pinned evidence; the current
issue selects its own policy. Manual diagnostic workflows stay manual and are
not counted as an automatic speed improvement.

The source runner delegates execution to
[`source-test-worker.cjs`](../tools/quality/source-test-worker.cjs). It starts
the measured long `space`, `executive` and `release-rights` modules first, followed by measured release-controller, pages-migration,
site-engine, pages-delivery, publication-records and staging modules, then
the remaining selected files lexically, retaining the same selected set, Node
process isolation, default worker allocation, native TAP and strict accounting.
The fixed 180-second child bound and 16MiB output bound remain; SIGTERM/SIGINT
abort the owned runner and reap its children before timeout evidence is retained.

At every issue's completion, review its tests against PR smoke, bounded staging
and full production coverage. Record additions, merged duplicate assertions,
disabled obsolete cases, diagnostic-only cases and the reason/owner in the
registry and owning issue. Preserve independent failure surfaces. Update the
RI validation routes and RI/CI mapping, verify both, and rebuild generated RI
views. An unmapped suite or a stale route is an incomplete handoff.

Source scanner triage remains explicit: the Bandit policy binds reviewed internal
tooling findings to exact source/line bytes, rules, owners and a review deadline.
Raw findings remain in the report; new/source-changed/expired findings fail.
Secrets admission for generated RI/coupling checksum fields requires actual
verification; other public metadata hashes use exact reviewed baseline entries.
