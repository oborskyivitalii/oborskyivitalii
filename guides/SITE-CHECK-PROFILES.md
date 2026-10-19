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
| Content update | Authored catalog/article/Writing/Home changes with a compatible earlier admitted generation | Mandatory catalog, parser/provenance, unsafe-content, article/delivery/size and reuse-contract source suites; current-source content reconstruction; ordinary hosted smoke plus no-JS Writing and every rebuilt article journey. Unchanged platform generation is reused. |
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
Selected Node source files execute in isolated processes with two file workers;
tests within a file retain their serial default. The stable sorted selection is
reported separately from execution order: selected Space and executive suites
start first, then the remaining selected files. This overlaps measured expensive
work rather than leaving Space at the end of CLI discovery. Every selected case,
the 180-second process limit, 16MiB output bound, clean-source checks and complete
zero-skip accounting remain. Reports retain the worker limit, execution order and
observed host parallelism; timing is evidence for that run, not a speed guarantee.
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

## Article content updates

Issue #5 adds a formal content source profile and automatic generation reuse to
the ordinary Basic and PR preview workflows. `source-tests.cjs --profile content
--base <exact-baseline-commit> --head <exact-current-commit>` rejects mixed,
unknown and generated-only changes. Its complete mandatory inventory is declared
in `source_profiles.content.mandatory_files`; each module retains its permanent
staging and production routes. Ordinary PR source selection also recognizes this
bounded authored scope. A classification is a plan, never evidence of execution.

The admitted authored scope is the publication catalog, Home/Writing/Talks JSON prose,
the canonical `site/content/events.json` event collection,
article Markdown/JSON and declared publication image/PDF media. Generated public
files/output lock, dated memory and regenerated RI views may accompany that
scope. Publication inventory edits require an exact old/new Git comparison:
only article-owned entries and generated `docs/` entries with their existing
generated role/site owner may change. The RI/CI map may only recalculate its
derived reviewed-source identity; input paths, layers, checks, review and policy
remain unchanged, and unconditional current-source RI verification checks the
new identity. Platform entries, schema, workflow/test policy and other owners
remain unchanged. Other page prose,
templates, styles, engine, tools, configuration or unknown source select the
ordinary platform route. Source reconstruction, media/URL/schema checks and the
unconditional RI workflow still verify current bytes; bookkeeping cannot supply
trust or make a generated-only edit eligible.

`content-baseline.cjs` prefers a successful earlier same-branch generation, then
main and a bounded inventory of prior merged ancestor branches. It checks the
same repository and workflow, exact raw source commit/tree, ancestry, immutable
upload archive SHA256, complete public bytes, raw generation/output-lock SHA256
and current platform fingerprints. The raw baseline must also have actual
successful source Basic, RI and owning-issue admission jobs for its exact head.
Draft-only packaging, skipped jobs and unbound source evidence cannot establish
reusable platform evidence. Basic retrieves the earlier Basic artifact; preview
retrieves the earlier review artifact, preserving their separate publication
and explicit draft-preview selections.

Old artifacts without generation metadata, expired/missing artifacts, absent
source admission, a changed shared catalog label/platform fingerprint, different
preview selection or a squash/rebase whose raw head is not an admitted ancestor
produce an explicit ordinary-build disposition. Invalid source/tree bindings,
archive bytes, unsafe extraction paths or corrupted declared generation fail;
they are not silently accepted as reuse. The first platform-mode artifact after
this implementation establishes the new generation format.

When a compatible baseline exists, `local.cjs --content-package` runs the
mandatory content source suites and composes a coherent new artifact using
verified unchanged platform bytes. Its `contentChecks` report retains actual
source-test accounting. `--package-gate` verifies that bound content generation
against current source without recompiling the platform. The preview build uses
the same explicit artifact content arguments. Unaffected controller/Color
producer source fixtures are reserved for the platform branch; the ordinary
hosted preview remains required. It adds no-JS Writing at both widths and all
rebuilt article documents, each with the existing two-width normal and Off,
no-Canvas/no-JS journeys. Their observed identity/count/reading/navigation
results remain separate from source fixtures.

Accepted staging now selects a distinct `compatible-content-v1` policy from
`content-baseline.selectAccepted`. It authenticates a merged ancestor's successful
staging checkpoint and immutable public/gate uploads; source-only preview reuse
is insufficient. Its `content-staging-gate` inherits compatible byte-identical
platform acceptance, runs current scanners/content/rights/budgets, exact hosted
bytes and affected desktop/mobile normal/no-JS documents, the bounded reader
journey and actual current image decoding. It records omitted platform/performance
regression as inherited, never executed. Ordinary platform gates keep their full
original scope. Production derives the exact accepted generation, rechecks source
and predecessor leases, and uses the shared protected publisher. Missing or
incompatible accepted evidence explicitly selects the platform path.

No review, rights or resource budget is relaxed. Old runtime measurements cannot
cover a changed renderer. Offline all-route
exports remain explicit commands rather than an automatic content-release
side effect. Public deployment still uploads one complete verified package.

PR #79 also opts into one bounded local diagnostic through `content_fixture`.
It creates a genuine verified baseline and content release in an isolated Git
clone, changes an external URL and one synthetic draft, then exercises two-width
no-JS Writing plus the draft's five existing article cases in the managed
Chromium job. Each normal article case observes raw successful camera paints for
Writing/reader/Back/Forward and every principal destination, with signed depth,
all three fixed camera stages and canonical final framing. A direct native article
entry also exercises Back/Forward, including host extensionless aliases and restored header URLs. Visible recommendations
participate in departure. The Off case also checks reduced motion against saved On;
static-depth, mixed-ID and missing-stage evidence fails admission. Shared read-only Git objects preserve any existing accepted
article's frozen provenance; fixture mutations never touch author sources.
The separate temporary report declares `syntheticFixture: true`, its parent
source identity and no deployment/production eligibility. It is uploaded
separately from typed staging gate reports and cannot replace their evidence.
This explicit diagnostic does not add another full browser matrix or change
the existing job/performance budgets.

The same admitted PR79 browser jobs also execute `article-print.cjs` against the
technical article fixture. It invokes the ordinary publisher CLI with `--pdf`,
verifies the complete kit and PDF/manifest pair, and rejects review-only or
mismatched browser/toolchain/source identities. The separate `site-article-print-*`
artifact contains the actual PDF and source-bound report; typed site gate reports
are unchanged. Existing synthetic print tests remain the cheap failure-contract
suite, while real rendering uses the already installed managed Chromium once.
Clean-checkout evidence preserves the draft's declared source status and cannot
establish editorial, actual-publication, merge or permanent-staging acceptance.

The existing analytics cold collector also keeps its live catalog in an
isolated shared Git clone. Its offline producer receives the canonical
publication adapter and locked parser dependency closure, so frozen accepted
and observed canonical editions retain provenance during cold preparation.
Linux, native and staging browser jobs install that parser and fetch source
history. Writing observations use the canonical displayed-entry collection.

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

## Registry and issue completion

The registry inventories current suites, scheduled profiles, changed-path targets
and retained diagnostics. Use `tools/quality/source-tests.cjs` to select registered
source suites instead of a wildcard that revives every historical snapshot.
Historical issue-specific policies remain source-pinned evidence; the current
issue selects its own policy. Manual diagnostic workflows stay manual and are
not counted as an automatic speed improvement.

The source runner delegates execution to
[`source-test-worker.cjs`](../tools/quality/source-test-worker.cjs). It starts
the measured long `space`, `executive` and `release-rights` modules first, then
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
