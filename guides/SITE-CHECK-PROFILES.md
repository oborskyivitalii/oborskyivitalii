# Site check profiles

Owner: [test optimization #35](https://github.com/oborskyivitalii/oborskyivitalii/issues/35);
[release gates #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) and
[hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) retain their
pipeline and deployment acceptance. This guide owns test scheduling and the
[test registry](../tools/quality/test-profiles.json). Runtime/publication claims
belong to source-bound results in the live issue/PR, not the profile name.
Issue [#72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72) changes
Draft iteration scheduling while preserving admission and later budgets.

Issue [#122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122) adds the
[delivery routing and observation contract](#delivery-routing-and-observation-contract).
R1/R2, exact-runtime compatibility and accepted-platform/history integration are
delivered. Actual independent content/recovery observations and whole issue
acceptance remain source-bound in #122. The observer remains advisory; trusted
selection and the existing admission/publisher own actual delivery.

| Profile | Trigger | Required coverage |
| --- | --- | --- |
| Draft prototype | Same-repository Draft updates | Generated/package/snapshot/size checks, public script syntax and bounded HTTP identity; no toolchain installation or browser/source/governance suites. Deferred admission is explicit. |
| PR source | Ready PR updates and `ready_for_review` | Small Basic source check, RI/CI coverage and the owning issue's targeted AC policy. Additional source suites follow changed paths in the registry. |
| Content update | Authored catalog/article/Writing/Home changes with a compatible earlier admitted generation | Mandatory catalog, parser/provenance, unsafe-content, article/delivery/size and reuse-contract source suites; current-source content reconstruction; ordinary hosted smoke plus no-JS Writing and every rebuilt article journey. Unchanged platform generation is reused. |
| PR hosted smoke | Ready same-repository PR updates | Exact artifact/HTTP identity and Chromium at 1440/390 widths: routes, controls, persistent navigation/history and no-Canvas fallback; authored Color adds its two-width smoke. |
| Staging regression | Owner `/stage` or dispatch for stable staging; owner `staging-regression` PR label for evidence without promotion | Exact source/public/package/host identity, source suites and current lint/security/advisories. Platform route: Chromium/Firefox journeys, failure/navigation/analytics, two mobile Lighthouse trials and motion/flight samples. Compatible content route: authenticated platform inheritance plus exact affected desktop/mobile normal/no-JS documents and reader/media observations; no platform performance rerun. |
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
Selected Node source files execute in isolated processes using the available CPU
allocation, capped at four file workers;
tests within a file retain their serial default. The stable sorted selection is
reported separately from execution order: selected Space and executive suites
start first, then the remaining selected files. This overlaps measured expensive
work rather than leaving Space at the end of CLI discovery. Every selected case,
the 300-second process limit, 16MiB output bound, clean-source checks and complete
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

The mandatory content membership is the per-test `content: true` field, checked
against the exact `source_profiles.content.mandatory_files` inventory. The legacy
per-test `profiles` namespace remains readable by the protected-main selector;
unknown names still reject. This representation preserves all19 content modules
and their permanent PR-targeted/staging/production routes during integration.

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

The Basic-generation selector in `content-baseline.cjs` prefers a successful
earlier same-branch generation, then main and prior merged ancestor branches.
The preview and owner-staging route instead uses `selectAccepted`, described
below, to authenticate an accepted merged staging source and complete history.
Both generation selectors check the
same repository and workflow, exact raw source commit/tree, ancestry, immutable
upload archive SHA256, complete public bytes, raw generation/output-lock SHA256
and current platform fingerprints. The raw baseline must also have actual
successful source Basic, RI and owning-issue admission jobs for its exact head.
Draft-only packaging, skipped jobs and unbound source evidence cannot establish
reusable platform evidence. Basic retrieves its earlier Basic artifact; the
accepted-staging route retrieves the original admitted review artifact. Both
preserve the exact ordinary publication or explicit draft-preview selection.

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

Tracked canonical `docs/` and its output lock follow ordinary source generation.
Accepted-artifact composition separately retains the authenticated baseline's
immutable closure; copying that artifact closure into canonical output can add
stale files. PR content Basic uses its source-admitted generation, while staging
prepublication still requires ordinary Basic and its canonical freshness guard.
Neither Basic route replaces the other or waives current source reconstruction.

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
loops. Those remain in production regression. Staging's end-to-end CI duration
target is at most 15 minutes; only measured CI durations establish achieved
performance, with queue/setup/execution reported separately. The maintainer's
27 October clarification makes this an operational optimization target: exceeding
it alone does not block delivery when every mandatory test and site budget passes.
Worker/scanner timeouts and browser/product performance budgets remain unchanged.

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

Issue #39 retains PR #40's `site-writing-current-evidence` label job. The
maintainer-approved issue #122 T03-D amendment also permits that exact opt-in
label on same-repository PR #128 when event sender and actor are the repository
owner. Ordinary updates and other PRs do not activate it. The job runs five
ordinary fresh-process mobile/simulated Writing trials on one exact unchanged
Color artifact, followed by one separately sampled
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

## Current-production analytics diagnostic

The existing manual `site-cause-probe.yml` defaults to historical cases. Its explicit
owner-only `analytics-live` scope takes an exact collector candidate SHA and current
immutable release tag. `analytics-live-actions.cjs` authenticates the archive and
current accepted production deployment full lease; `analytics-live.cjs` observes two
unprofiled Forward conditions and one separate real-SDK CPU/transport window. Source
guards run first in the existing `cause-probe.test.cjs` diagnostic suite. Native
observations are opt-in only, with no new schedule, stage/production admission or
performance-budget claim. The [analytics contract](SITE-ANALYTICS.md#bounded-ordinary-live-diagnostics)
owns boundaries and the issue159 review retains original failures and QA dispositions.

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
the measured long `space`, `executive`, `article-media` and `release-rights` modules first,
followed by measured `release-controller`, `pages-migration`, `site-engine`,
`pages-delivery`, `publication-records` and `staging` modules, then
the remaining selected files lexically, retaining the same selected set, Node
process isolation, a maximum of four workers, native TAP and strict accounting.
All selected modules, including Space, enter one worker invocation. The complete
source execution retains one300-second deadline and one16MiB output bound;
process isolation and priority ordering do not create additional source budgets.
Every selected module requires complete zero-skip accounting. Retain the original
single-process stdout/stderr, actual argv/status and source identities even when
execution, accounting or source stability fails. Content-only plans use that same
single-process evidence contract. The prepublication wrapper is330seconds:
one300-second source execution plus30seconds for reporting, independent of the
selected module count. Scanner180-second bounds and the existing job budget remain.
The[25October #122 amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6403603405) changes only this source deadline from180to300seconds
after retained hardware-associated timeouts; it adds no CPU filter or retry policy.
SIGTERM/SIGINT
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

## Delivery routing and observation contract

Contract version: **1, observation only**. This is the canonical decision
matrix and report interface for issue122. [SITE-STAGING](SITE-STAGING.md#observation-does-not-admit-delivery)
owns operational interpretation and trusted admission. R2 has delivered repository-only
admission without website work. The CLI below still emits planned observations; it
cannot authorize delivery. The delivered R3 integration uses the existing issue5
publisher with authenticated accepted-platform/history reuse; actual current
content/recovery acceptance remains in #122, independently of this observer.

### Executable planned observer

`tools/quality/delivery-observation.cjs` emits the version1 planned-obligation
subset. Supply full immutable IDs explicitly and save outside both checkouts:

```sh
node tools/quality/delivery-observation.cjs --base BASE_SHA --head HEAD_SHA --policy POLICY_SHA --out /tmp/delivery-observation
```

Replace each SHA with its resolved 40-character commit ID. The target defaults
to the executing checkout; `--repo /absolute/checkout` selects another clean
checkout whose HEAD must equal the candidate. The producer revision is the actual
executing implementation, independently verified against committed bytes.
`--policy` is mandatory and independently supplied: its implementation bytes
must equal that producer. The first-release CI deliberately supplies candidate
policy; it is an observation, not trusted-base admission. Policy files bind all
consulted decision/configuration owners at that revision. Base/candidate registry
and rights snapshots are endpoint data read from their exact Git objects; the
pre-change union survives candidate removal of a mapping or provenance dependency.

Collection uses bounded `git diff --raw -z --no-abbrev --no-renames` with external
diff/text conversion disabled, retaining complete A/D sides instead of guessing
rename/copy similarity. Copy-with-source-retained is an addition. Symlinks/gitlinks
are not followed. Each Git invocation has a 30-second/32-MiB ceiling; exhaustion
or incomplete output is invalid, never a complete empty plan. Original stdout
and stderr are retained as base64 in `collector.json` and bound by its byte hash.
`observation.json` retains identities, records, reasons and required obligations.

The observer executes no reported command and ingests no result/decision evidence.
All obligations remain planned with null evidence, including hosted work; prior
site reuse is not evaluated (`acceptedSite` and `history` are null). Invalid input
exits1 with diagnostics; conservative and no-change are valid analyses, never
delivery passes. Prospective merge conflicts/unavailable configured external
merge drivers remain explicit and cannot establish compatibility.

`.github/workflows/delivery-observation.yml` retains candidate-policy observations
on PR lifecycle events, including Drafts, alongside existing CI. Its check has no
admission authority. Existing B/R/O/H, required contexts, original budgets and
staging/promotion remain unchanged. Actions metadata identifies this actual
observer workflow/run/attempt; local input never claims GitHub-protected authority.
The broader lifecycle/evidence/reuse interface below remains a future producer
contract; this CLI cannot accept supplied passed/stale/cancelled evidence.

Four dimensions remain separate:

| Dimension | Meaning and existing owner |
| --- | --- |
| Proposed delivery lane | `repository`, `content` or `website`, derived from the dependency matrix below; a suggestion with no admission authority. |
| Source-test profile | `pr`, `staging`, `production` or explicit `diagnostic`, owned by `test-profiles.json` and `source-tests.cjs`. Baseline and additional suites are separate. |
| Hosted-origin policy | `staging` or `production`, owned by the existing hosted runners; determines indexing/origin rules. A source-only obligation has no hosted origin. |
| Validation level | The existing bounded `staging` or optional full `production` coverage in `site-release-checks.yml`; it does not identify the hosted origin or authorize production. |

### Decision matrix and current obligations

Read each row with its actual dependency closure, including base-side owners.
Rows describe representative paths, not a new glob allowlist. `repository`
means no identified website/content dependency after inspection, not simply a
Markdown extension or RI catalog role. Catalog/generated files cannot redefine
their own authority. The existing `known_non_node_paths` suppresses only unknown
Node fallback; directly affected suites and separate Python routes still apply.

The full website/control route retains **B + R + O + H** below. Trusted R2 repository
selection uses the explicit website inapplicability described below; trusted content
selection uses the existing content profile and accepted-platform proof. An advisory
proposal cannot remove an obligation. Test sets come from the current registry and actual commands,
not fixed module counts; a directly matched diagnostic can join permanent suites.

| Route key | Existing command and CI owner |
| --- | --- |
| B — Basic/source | `node tools/quality/local.cjs`, then `node tools/quality/source-tests.cjs --profile pr --base BASE --head HEAD`; `site-checks.yml`, job `checks`. The three baseline suites remain separate from additional selected modules. |
| R — Repository | `navigation.yml`, job `navigation`: style, RI/CI, layout, enduring-test selection and RI regressions/verification, plus its explicitly named profile/staging/source fixtures. `tools/run_repository_tests.py` owns enduring Python preflight; numeric task snapshots stay owning-policy-only. |
| O — Owning acceptance | `issue-acceptance.yml`, job `acceptance`, selecting the issue's policy through the complete `Refs #N` line. Semantic review, rights and other nonautomated gates remain explicit. |
| H — Current hosted delivery | Ready preview smoke, owner staging/preflight and bounded regression, stable verification and PR-eligible admission through `site-color-review.yml` / `site-release-checks.yml`. Draft deferral does not satisfy these obligations. Production has its separate approved route. |

`control` is independent of lane and source allocation. It is true for inputs
that define executable selection/admission/protection or this proposed decision
policy; it is not synonymous with the registry's narrower `shared_inputs` list.
A control change preserves trusted pre-change obligations and proposes the
website route until separately proven safe. A known ordinary instruction/review
edit can remain a repository proposal; it cannot change executable authority.

| ID | Representative input | Actual owner/dependency | Proposed impact; control | Current checks in addition to the common route | Trusted eligibility boundary |
| --- | --- | --- | --- | --- | --- |
| D01 | `AGENTS.md`, `review/REVIEW-TEMPLATE.md`, dated review Markdown, `MEMORY.md` | CONTRIBUTING/acceptance protocol and RI inventory/continuity | repository; false | R includes `test_repository_intelligence.py`, `test_root_layout.py`; exact template boundary is in `test-profile-selection.test.cjs`. | Inspect dependencies and retain all four role executions. The advisory proposal cannot waive H; delivered trusted repository selection can record website work explicitly inapplicable for its complete eligible delta. |
| D02 | `.github/repository-paths.json`, `.github/repository-intelligence-config.json`, `REPOSITORY-MAP.md`, derived agent context | `repository_intelligence.py` and RI/CI coupling; generated views are not editing sources | repository; false | R: `test_repository_intelligence.py`, `test_ri_ci.py`, RI and coupling verification. | Regenerate and verify actual owners; neither a catalog label nor a fresh view establishes delivery eligibility. |
| D03 | `tools/repository_intelligence.py` | Executable RI behavior, safe inventory, source identity and navigation | repository; false | R executes RI behavior/negative tests even when additional Node selection is empty. | Delivered trusted selection treats this executable as control/full route; failed RI blocks admission. The repository-purpose proposal grants no executable exemption. |
| D04 | `site/content/pages/writing/main.json`, other page/catalog content | `tools/site/content.cjs`, render/validation owners, declared templates and rights | content; false | Registry-selected `content`, `content-rendering`, `site-engine`, `publication-records`, `release-rights` and other matching suites; B/R/O/H remain. | Authenticate accepted platform/schema, validate all references/media and complete intervening history; use the delivered publisher and current compatible-content gate. PR79's unpublished article is not a publisher prerequisite. |
| D05 | `site/templates/pages/writing/main.html`, `site/engine/**`, scenes/effects/assets, `tools/site/**` | Authored website implementation and `tools/site/build.cjs` dependency closure | website; false unless also a control | Exact affected registry suites, build/snapshot/rights checks and H. Build, snapshot, edition and evidence-policy controls also match the control row. | Full applicable current website validation; no content-only shortcut for layout/runtime/build changes. |
| D06 | `LICENSING.md`, `LICENSE-CODE.md`, `LICENSE-CONTENT.md`, `NOTICE.md` | `tools/site/legal.cjs` reads full text into Credits through `legal-notices.html`; rights/publication consumers also read it | website; false | Selected `site-engine`, `release-rights`, `publication-records` and other matching suites; generated output must follow authored owners. | Changed rendered/legal bytes and frozen rights records need new applicable evidence. Root Markdown is not inert. |
| D07 | `guides/SITE-SOURCE-AUDIT.md`, `guides/SITE-CONTENT-REVIEW.md`, `tools/RI-LICENSE.md`, `tools/RI-NOTICE.md` | Paths explicitly referenced by `site/rights.json`; `tools/release/rights.cjs::validateManifest` hashes provenance bytes | website/publication dependency; false | Registry selects `release-rights.test.cjs` and `publication-records.test.cjs` despite known non-Node matches; retain R. | No unproved accepted-artifact reuse after provenance changes, even if rendered pages happen to be identical. |
| D08 | `site/rights.json`, release edition/publication records, any other referenced provenance input | Rights/edition/record producers in `tools/release/`; exact source and artifact identity | website/publication dependency; control when it changes acceptance policy | Rights/publication and actual matching release/staging suites, plus exact-edition external rights decisions. | Inspect the real consumer, including records under `review/`; location never removes publishing obligations. |
| D09 | `tools/quality/test-profiles.json`, selector/worker/budgets, `.github/workflows/**`, `tools/staging/admission.cjs`, `tools/run_repository_tests.py`, issue acceptance policy/runner, `.github/ri-ci-map.json`, these two delivery-contract guides | Selection, evidence, admission and policy consumers; candidate rules cannot redefine their own requirements | repository and/or website; true | Preserve B/R/O/H and actual registry/CI mapping. Shared registry inputs select all permanent additional JS; an admission-controller path can instead select its existing targeted suites. | Trusted pre-change union, candidate isolation and actual protected-producer proof before any authoritative migration. |
| D10 | Unknown path or unsupported symlink/gitlink/type | No proven complete owner/dependency disposition | website conservatively; control unresolved unless known true | Preserve all identifiable obligations and conservative coverage; inspect owners and input safety before continuing delivery. | Never cheap eligibility. Unknown is not silently assigned the nearest directory's role. |

For a complete valid diff, combine every matching row and dependency; retain
all reasons and the union of checks. A true control flag or website impact makes
the proposed lane `website`; otherwise content plus repository proposes
`content`, and repository-only proposes `repository`. Unknown valid inputs add
conservative website impact and an unresolved reason. `control: false` requires
all inputs to be resolved; use `null` when unknowns could conceal a control, unless
a known control already makes it true. No-change and invalid inputs have a null
proposed lane. An invalid input is not a conservative successful classification.

### Observation report fields

This defines the version1 interface; T04 emits its planned subset above, without
an installed competing schema. The existing source selector collects `git diff --no-renames --name-only -z`:
a move retains both deleted and added paths, independent of `diff.renames` settings,
while a copy with its source unchanged adds only the destination. It unions their
registry-owned obligations; its plan is not this status/mode-aware report. The advisory
`tools/site/evidence-policy.cjs` also grants no scheduling or evidence-reuse power.

All fields below are required unless explicitly conditional. JSON `null` means
unavailable/not applicable only with its stated status/reason; it never equals a
verified identity. `ObjectId` is a full 40-character lowercase Git object
ID for this repository, resolved to the required commit/tree/blob type; `Digest` is 64 lowercase SHA-256 hex characters. Paths
are exact repository-relative POSIX UTF-8 strings: no absolute path, traversal,
backslash, NUL/CR/LF or normalization that silently changes Git's path. Preserve
case. Unsupported encoding/path inputs make collection invalid.

| Field and type | Value source, presence and meaning |
| --- | --- |
| `kind: string`, `version: integer`, `mode: string` | Exact literals `delivery-observation`, `1`, `observation`. Unsupported versions are invalid, not guessed. |
| `authority: object` | Exactly `merge: false`, `deploy: false`, `reuseEvidence: false` in every outcome. No report status can change them. |
| `repository: string`, `observedAt: string` | Exact owner/name and UTC RFC3339 collection time; time alone establishes neither freshness nor trust. |
| `base: object` | `commit: ObjectId\|null`, `tree: ObjectId\|null`, `status: resolved\|unavailable`, `authority: local-input\|github-protected`, `reason: string\|null`. Resolve both objects from inspected Git; a supplied SHA stays `local-input`. |
| `base.protection: object\|null` | Required nonnull only for `github-protected`: `ref: string`, `tip: ObjectId`, `rulesetIds: positive integer[]`, `digest: Digest`, `observedAt: RFC3339 string`, `evidence: string` locating the retained authenticated response. The trusted controller must recheck current main before side effects. Local plans set null and cannot claim current protected-main identity. |
| `candidate: object` | `commit`, `tree`, `status`, `reason` use the base identity types; `clean: boolean\|null` comes from actual checkout/index inspection. Missing objects or a dirty/unverified checkout invalidate execution-bound evidence. |
| `prospectiveMerge: object` | `status: resolved\|conflict\|unavailable`, `tree: ObjectId\|null`, `reason: string\|null`, tied to the exact base/candidate. Only resolved has a tree. Conflict/unavailable remains explicit and cannot establish compatibility. |
| `producer: object` | Actual executing `revision: ObjectId\|null`, `context: local\|github-actions`, and `reason: string\|null` when unavailable. For Actions also require `workflowPath: string`, `event: string`, `runId: positive integer`, `attempt: positive integer`; local values are null. A candidate-supplied claim is not authenticated producer proof. |
| `policy: object` | `version: 1`, `revision: ObjectId\|null`, `files: array`, `digest: Digest\|null`, `reason: string\|null`. Each file has `path` and exact byte `sha256`; include both contract guides, registry and every implementation/config input actually consulted. Pin the policy revision independently of candidate. |
| `changes: object` | `status: complete\|invalid`, `records: array`, `errors: string[]`, `collector: object`. Collector identifies Git command/options, exact compared endpoints, rename/copy policy and completeness evidence. No pagination/truncation/bound/error may be hidden. |
| `analysis: object` | `status: complete\|conservative\|invalid\|no-change`, `impacts: array` containing distinct `repository`, `content`, `website`, `control: boolean\|null`, `proposedLane: repository\|content\|website\|null`, `reasons: array`, `unresolved: array`. Derived from the matrix and complete changes, never from a suite count. |
| `obligations: array` | Current baseline/additional source, repository, owning-policy, external review/rights and hosted/admission obligations, as defined below. Future proposals cannot remove current mandatory rows. |
| `acceptedSite: object\|null` | Conditional when discussing prior-artifact reuse: `source: ObjectId`, `tree: ObjectId`, `platformDigest: Digest\|null`, `contentDigest: Digest\|null`, `publicDigest: Digest`, `packageDigest: Digest`, `evidence: string`, `unavailable: string[]`. Values come from original authenticated acceptance records. Missing component identities need reasons and cannot prove compatibility. Null if reuse is not evaluated; never relabel S at current main. |
| `history: object\|null` | Required when `acceptedSite` is nonnull: `status: verified\|unavailable`, `from: ObjectId`, `to: ObjectId`, `edges: array`, `evidence: string\|null`, `unresolved: string[]`. Each edge has `parent: ObjectId`, `child: ObjectId`, `changeRecords: array` in the same format below, and `dependencyReasons: array` in the reason format below. Authenticated complete ancestry, including all merge-parent sides, supplies verified status. A net diff cannot prove an uninspected interval. |
| `nextAction: object` | `action` from the operational actions below, nonempty `reason`, and IDs of `blockingObligations`. It describes the current supported process; it is not an authorization token. |

Both policy and protection digests use **SHA-256 of RFC8785 JCS bytes**
([canonicalization definition](https://www.rfc-editor.org/rfc/rfc8785.html#section-3)).
Apply its string/number serialization, recursive property ordering and UTF-8
encoding, without a trailing newline or Unicode normalization. Reject duplicate
JSON keys, invalid Unicode and values outside its supported numeric domain.
Every explicitly sorted path/URL list in this contract uses ascending unsigned
UTF-16 code-unit order, independent of locale; preserve other array order.

For `policy.digest`, sort files by exact path and canonicalize the array of
`[path, sha256]` pairs. Duplicate paths, unresolved bytes or omitted consulted
inputs invalidate the identity. For `base.protection.digest`, canonicalize the
`ProtectionSnapshot` defined below, retaining its original authenticated API
response bodies. These digests identify inspected inputs; they do not establish
producer trust or protection enforcement.

`changes.records[]` contains `status` (`A`, `M`, `D`, `R`, `C`, `T`) and
`oldPath`, `newPath`, `oldMode`, `newMode`, `oldObject`, `newObject`. Modes are
six-character Git mode strings and objects are full Git blob/gitlink IDs.
An addition has all old-side fields null; a deletion has all new-side fields
null. M/T requires the same path on both sides, and R/C requires both paths and
objects. Absent sides cannot be filled from the candidate. Record mode-only
changes. With rename/copy detection disabled, complete A/D records are valid
and still retain both ownership sides; declared detection must never lose a
side. Compare every present side with its exact tree. Conflicting/duplicate
destination records, invalid status/side combinations or mismatched objects
make collection invalid. Sort records by old path then new path (null as empty)
for deterministic presentation; do not deduplicate away different ownership.

Regular file modes `100644`/`100755` need their actual content/executable owner.
Symlink `120000`, gitlink `160000` and otherwise well-formed unsupported types
receive explicit conservative/unresolved treatment; never follow or execute
them during collection. Malformed modes/records, missing refs, dirty inputs,
collector failure, truncation or incomplete enumeration make `analysis.status: invalid`.
Only a successful complete empty diff yields `no-change`, with empty impacts
and no proposed lane. It grants no merge/deploy/reuse permission and does not
silently satisfy any existing PR requirement.

#### Nested records and consistency

`Path` means the exact safe path defined above; `Time` is a UTC RFC3339 string.
`Id` is a nonempty case-sensitive string, unique within its record collection.
Obligation IDs identify the owner's logical command/gate across observations,
not an array position, commit or run. Reason/unresolved IDs are deterministic
within the report. Every referenced ID must resolve, without duplicate references.
`MatrixId` is `D01`–`D10` above; `common` names the unconditional B/R/O/H rule.
All listed members are required, including nullable members. Other object members
are invalid for version1; GitHub response `body` is the explicit opaque exception.
All unqualified string values are nonempty. Empty arrays mean observed absence
only where the surrounding status permits it.

| Record | Exact fields and value sources |
| --- | --- |
| `Command` | `argv: string[]` is the nonempty exact argument vector including executable, with resolved values rather than BASE/HEAD placeholders; `cwd: Path\|"."` is repository-relative. This describes the existing command, never authorizes a dispatcher or shell interpolation. |
| `RetainedRecord` | `location: string` locates the retained log/report/artifact; `sha256: Digest` hashes its exact bytes. A URL/path without retained bytes and digest is not this record. |
| `ProtectionSnapshot` | `responses: array` of `{url: string, body: JSON value}` contains every applicable authenticated GitHub protection/ruleset response used for this observation, sorted by distinct exact request URL. `body` is the original complete parsed API response, not a selected-field summary. `base.protection.evidence` locates this retained snapshot; unavailable relevant responses prevent a protected-base claim. |
| `changes.collector` | `command: Command\|null`, `gitVersion: string\|null`, `fromCommit: ObjectId\|null`, `fromTree: ObjectId\|null`, `toCommit: ObjectId\|null`, `toTree: ObjectId\|null`, `renameDetection: boolean`, `copyDetection: boolean`, `exitCode: integer\|null`, `complete: boolean`, `truncated: boolean`, `recordLimit: positive integer\|null`, `recordCount: nonnegative integer`, `output: RetainedRecord\|null`. Values come from actual invocation, endpoint resolution and retained complete stdout/stderr capture; detection thresholds/options are the exact `argv`. Null command/exit means not started/no observed exit; null limit means no configured record cap. |
| `analysis.reasons[]` | `id: Id`, `ruleId: MatrixId\|common`, `path: Path\|null`, `side: base\|candidate\|both\|none`, `owner: Path\|null`, `dependencyPaths: Path[]`, `obligationIds: Id[]`, `detail: string`. Name the matched row and actual consumer file; dependency paths are inspected inputs/consumers that establish the match. Only `common` has null path and side `none`; only unresolved D10 may have null owner, with an explicit unresolved record. |
| `analysis.unresolved[]` | `id: Id`, `path: Path\|null`, `side: base\|candidate\|both\|none`, `baseObject: ObjectId\|null`, `candidateObject: ObjectId\|null`, `ruleId: MatrixId\|common\|null`, `reason: string`, `action: collect-inputs\|inspect-owner\|revalidate`, `obligationIds: Id[]`. Preserve every known side's identity, never an unverified supplied ID. Path-null identity failures use side `none` and known commit IDs; path-bearing records use known file-side IDs. Null rule means no established match. |
| `obligations[]` | `id: Id`, `category: baseline\|source\|repository\|owning\|external\|hosted\|admission`, `required: boolean`, `owner: Path`, `execution: Execution`, `workflow: Workflow\|null`, `triggerReasonIds: Id[]`, `sourceProfile: pr\|staging\|production\|diagnostic\|null`, `hostedOriginPolicy: staging\|production\|null`, `validationLevel: staging\|production\|null`, `state: State`, `evidence: Evidence\|null`, `reason: string\|null`. The existing owner supplies the execution and applicability; all triggering reason IDs are retained. `State` is exactly the eight literals in SITE-STAGING. |
| `Execution` | `kind: command\|external-gate`, `command: Command\|null`, `gate: string\|null`. A command kind has only nonnull command; an external-gate kind has only nonnull gate naming the exact existing policy gate/required decision. No empty or simultaneous branches. |
| `Workflow` | `path: Path`, `job: string` identify the existing workflow file and YAML job ID, not the display/check name. Set null only when the obligation has no existing Actions owner; a locally observed check can still have this CI mapping. |
| `Evidence` | `source: ObjectId`, `tree: ObjectId`, `baseCommit: ObjectId`, `baseTree: ObjectId`, `prospectiveMergeTree: ObjectId\|null`, `policyDigest: Digest`, `producer: object` with exactly the producer fields above, `sourceProfile`, `hostedOriginPolicy`, `validationLevel` with the obligation's enum/null types, `result: running\|passed\|failed\|cancelled\|skipped\|inapplicable`, `observedAt: Time`, `records: RetainedRecord[]`, `decisionBy: string\|null`, `reason: string\|null`. Inspect actual source objects, original run/attempt, outputs and decisions; never substitute current IDs into older evidence. `decisionBy` names the actual external decision owner and is null for command execution; a name alone is not authenticated approval. |

A complete collector has a nonnull command/version/output, exit0, `complete: true`,
`truncated: false`, no `changes.errors`, all four endpoints equal the resolved
base/candidate commit/tree, and `recordCount` equal to records length. If a bound
was reached, prove enumeration finished; reaching a cap cannot imply completion.
Every failed condition sets `changes.status: invalid`, `analysis.status: invalid`
and a nonempty error. Preserve partial records as diagnostics; never infer absence
or an empty-success plan. A not-started collector has null command/exit/output,
complete false and an explanatory error; known endpoint identities stay explicit.

Resolved base/candidate identities have both commit and tree and null reason;
unavailable identities retain only actually resolved objects with a nonempty reason.
Only resolved prospective merge has a tree and null reason. A clean candidate must
be observed, not assumed. Missing policy revision/bytes/digest needs a reason and
invalidates analysis. Complete analysis has a nonempty diff and no unresolved
entries; conservative analysis retains them and the website proposal. A complete
empty diff alone permits no-change. Invalid/no-change has no proposed lane;
invalid inputs retain every already-known obligation without claiming completeness.

`policy.files[]` is exactly `{path: Path, sha256: Digest}` in the stated order.
`nextAction` is exactly `{action: string, reason: string, blockingObligations: Id[]}`;
action uses only the operational vocabulary. Blocking IDs are all required
obligations not passed or validly inapplicable. Input faults/unknown ownership
take the documented collect/inspect action even when no obligation can yet be
identified. Reason-to-obligation references and `triggerReasonIds` must agree.
Deduplicate the same owner/command-or-gate and applicable dimensions while keeping
the union of reasons; distinct profile/origin obligations cannot collapse.

Evidence's source commit resolves to its tree; its base and optional prospective
tree describe the original observation. A passed state requires current matching
identities, dimensions, policy and producer plus successful complete evidence and
at least one retained record. An unavailable producer revision cannot supply a
pass. Actions evidence requires the original workflow/event/run/attempt fields;
local evidence has those fields null. External decisions require nonnull
`decisionBy` and retained original decision evidence, not the collector's opinion.
Inapplicable requires retained owner evidence and a nonempty reason. Evidence is
null for planned/Draft-deferred; running/failed/cancelled/stale/inapplicable retain
the actual observed Evidence and a nonempty reason. Running may have no output
record yet. Failed can retain failed/skipped/incomplete observations; stale keeps
its original result and mismatched identities. Neither required skips nor old
green evidence can supply passed. Lifecycle interpretation and permitted next
actions remain owned by
[SITE-STAGING](SITE-STAGING.md#observation-does-not-admit-delivery).

### R2 execution selection

The existing observer remains advisory with full planned obligations. Protected
admission uses the same complete diff/classifier with conditional repository
obligations: Basic formatting/lint/architecture and affected source tests, current
navigation/RI, owning acceptance, dedicated App and independent roles. Website
build/package/preview/staging/publication are explicitly inapplicable. This report
must not label skipped website work as passed. The source selector's
`--repository-only` records no delegated website smoke; it still executes any
actually affected Node modules and propagates their failures.

All executable `tools/`/`tests/`, workflows/actions/acceptance and declared controls
retain the conservative full route. In particular D03's repository purpose is
not a cheap exemption for its executable. Mixed/unknown/rights/public inputs
retain full obligations. See [activation, exact-SHA control review and protected
recovery](SITE-STAGING.md#trusted-change-admission-and-repository-delivery).
The delivered R3/#5 integration uses accepted-platform/history reuse and the
existing content publisher.
The accepted selector checks every parent edge from S to C, authenticates repository
merges, and records explicit full-platform fallback for incompatible or unavailable proof.
Actual independent content/recovery and final reporting are source-bound external
acceptance in the live #122 owner, separate from this scheduling contract.

### Worked decisions and future test oracles

These are semantic walkthroughs and independent implementation oracles. Actual
T04 executions and limits belong to its source-bound review record. Route keys and owners refer to
the matrix above; every applicable current B/R/O/H obligation stays visible.

| Case | Required report/decision | Existing coverage and remaining proof |
| --- | --- | --- |
| Exact template or AGENTS edit | repository proposal; trusted R2 selection uses Basic/R/O/App and explicit website inapplicability. | Existing exact-template/mixed selector tests and RI instruction routes; actual protected repository delivery is recorded by PR143/PR144 in #122. |
| RI Python executable edit | repository purpose plus conservative control/full route and actual RI checks, regardless of zero additional JS. | RI behavioral/negative suites in navigation; existing failed-executable source regressions and native delivery establish the delivered AC02 scope. |
| Rendered legal or publication input | website dependency and new matching rights/output obligations. | `site-engine`, `release-rights`, `publication-records`; `.md` or `review/` cannot erase the dependency. |
| Guide named by rights provenance | website/publication dependency; stale provenance evidence cannot be reused. | Two existing rights/publication suites and R; guide location is insufficient. |
| Writing content plus its template | impacts include content and website, proposed website lane; union keeps both reasons. | Existing content/render/engine/rights suites; overlapping selections do not collapse ownership. |
| RI configuration plus Writing content | repository + content, proposed content lane, control false for this RI-only config; R and all content obligations survive. | RI and existing content suites; actual eligibility requires the protected classifier, authenticated accepted platform/history and current content gate, not PR79 publication. |
| Registry, selector, workflow or admission policy/controller | control true, proposed website route and trusted pre-change obligations. | Existing selection/coupling/admission negatives prove their subsets; actual AC05 producer/protection proof is separate. |
| Runtime renamed under `review/`, or runtime/control deleted | Include base-side runtime/control and candidate-side ownership; retain website/control obligations even if the candidate no longer has the old file. | Existing `delivery-observation.test.cjs` uses real Git moves/deletions/modes/types and base-side ownership; trusted selector/admission tests retain their distinct authority boundaries. Fixtures do not establish native delivery. |
| Unknown path, unsupported type, missing ref or truncated diff | Complete unknown/type inputs are conservative; missing/malformed/incomplete input is invalid; neither is cheap eligibility. Complete empty diff is separately no-change. | Existing collector tests reject invalid/truncated/tampered records and retain conservative unknown/type cases. RI and source-selection suites cover their own subsets; current native source identity remains separately required. |
| New failed/cancelled attempt or moved head/base after green | Preserve earlier evidence historically; current obligation is failed/cancelled/stale and the next action follows the current retry/revalidation rule. | Existing `prototype-admission`/staging-trust lease and attempt negatives; no reuse across identities or attempts. |
| Accepted site S, repository merge M, then content C | Keep S's source/tree/public/package identity; inspect the complete S-to-C history, including all merge-parent sides and intermediate control/rights/site changes. Missing history or incompatible inputs require fresh website validation. | Delivered `content-baseline` selection authenticates/replays complete history, with existing real-Git/reverted-control negative fixtures. Actual independent content/recovery remains source-bound external acceptance. The general planned observer still grants no reuse authority. |

Semantic review of these cases is T02 evidence; it is distinct from T04 execution.
Mechanical RI/style checks prove
only their stated subsets; keyword tests do not establish contract completeness.
QA findings feed the existing test-allocation route above. Protected repository admission and its measured no-website result are delivered by R2.
The live #122 owner records current criterion acceptance. These historical semantic
walkthroughs cannot establish current content/recovery or issue-wide delivery;
each still requires its complete source-bound checks and external evidence.
