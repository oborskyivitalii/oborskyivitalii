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
It defines proposed lanes and a future observer interface; the current profiles
and required staging/admission below remain operative.

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

## Delivery routing and observation contract

Contract version: **1, observation design only**. This is the canonical decision
matrix and report interface for issue122. [SITE-STAGING](SITE-STAGING.md#observation-does-not-admit-delivery)
owns operational interpretation and the producer activation prerequisite. No
classifier, new report producer, cheaper merge route or content publisher is
activated by this contract. Issue5/PR79 retains the unfinished content route.

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

Every valid current PR retains **B + R + O + H** below. A proposed lane cannot
remove any of them. Test sets come from the current registry and actual commands,
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

| Representative input | Actual owner/dependency | Proposed impact; control | Current checks in addition to the common route | Future eligibility boundary |
| --- | --- | --- | --- | --- |
| `AGENTS.md`, `review/REVIEW-TEMPLATE.md`, dated review Markdown, `MEMORY.md` | CONTRIBUTING/acceptance protocol and RI inventory/continuity | repository; false | R includes `test_repository_intelligence.py`, `test_root_layout.py`; exact template boundary is in `test-profile-selection.test.cjs`. | Inspect dependencies and retain all four role executions; a repository proposal does not yet waive H. |
| `.github/repository-paths.json`, `.github/repository-intelligence-config.json`, `REPOSITORY-MAP.md`, derived agent context | `repository_intelligence.py` and RI/CI coupling; generated views are not editing sources | repository; false | R: `test_repository_intelligence.py`, `test_ri_ci.py`, RI and coupling verification. | Regenerate and verify actual owners; neither a catalog label nor a fresh view establishes delivery eligibility. |
| `tools/repository_intelligence.py` | Executable RI behavior, safe inventory, source identity and navigation | repository; false | R executes RI behavior/negative tests even when additional Node selection is empty. | A real failed-RI admission rejection remains AC02 work; Python purpose is no exemption. |
| `site/content/pages/writing/main.json`, other page/catalog content | `tools/site/content.cjs`, render/validation owners, declared templates and rights | content; false | Registry-selected `content`, `content-rendering`, `site-engine`, `publication-records`, `release-rights` and other matching suites; B/R/O/H remain. | Authenticate accepted platform/schema, validate all references/media and complete intervening history; issue5/PR79 must deliver the real publisher. |
| `site/templates/pages/writing/main.html`, `site/engine/**`, scenes/effects/assets, `tools/site/**` | Authored website implementation and `tools/site/build.cjs` dependency closure | website; false unless also a control | Exact affected registry suites, build/snapshot/rights checks and H. Build, snapshot, edition and evidence-policy controls also match the control row. | Full applicable current website validation; no content-only shortcut for layout/runtime/build changes. |
| `LICENSING.md`, `LICENSE-CODE.md`, `LICENSE-CONTENT.md`, `NOTICE.md` | `tools/site/legal.cjs` reads full text into Credits through `legal-notices.html`; rights/publication consumers also read it | website; false | Selected `site-engine`, `release-rights`, `publication-records` and other matching suites; generated output must follow authored owners. | Changed rendered/legal bytes and frozen rights records need new applicable evidence. Root Markdown is not inert. |
| `guides/SITE-SOURCE-AUDIT.md`, `guides/SITE-CONTENT-REVIEW.md`, `tools/RI-LICENSE.md`, `tools/RI-NOTICE.md` | Paths explicitly referenced by `site/rights.json`; `tools/release/rights.cjs::validateManifest` hashes provenance bytes | website/publication dependency; false | Registry selects `release-rights.test.cjs` and `publication-records.test.cjs` despite known non-Node matches; retain R. | No unproved accepted-artifact reuse after provenance changes, even if rendered pages happen to be identical. |
| `site/rights.json`, release edition/publication records, any other referenced provenance input | Rights/edition/record producers in `tools/release/`; exact source and artifact identity | website/publication dependency; control when it changes acceptance policy | Rights/publication and actual matching release/staging suites, plus exact-edition external rights decisions. | Inspect the real consumer, including records under `review/`; location never removes publishing obligations. |
| `tools/quality/test-profiles.json`, selector/worker/budgets, `.github/workflows/**`, `tools/staging/admission.cjs`, `tools/run_repository_tests.py`, issue acceptance policy/runner, `.github/ri-ci-map.json`, these two delivery-contract guides | Selection, evidence, admission and policy consumers; candidate rules cannot redefine their own requirements | repository and/or website; true | Preserve B/R/O/H and actual registry/CI mapping. Shared registry inputs select all permanent additional JS; an admission-controller path can instead select its existing targeted suites. | Trusted pre-change union, candidate isolation and actual protected-producer proof before any authoritative migration. |
| Unknown path or unsupported symlink/gitlink/type | No proven complete owner/dependency disposition | website conservatively; control unresolved unless known true | Preserve all identifiable obligations and conservative coverage; inspect owners and input safety before continuing delivery. | Never cheap eligibility. Unknown is not silently assigned the nearest directory's role. |

For a complete valid diff, combine every matching row and dependency; retain
all reasons and the union of checks. A true control flag or website impact makes
the proposed lane `website`; otherwise content plus repository proposes
`content`, and repository-only proposes `repository`. Unknown valid inputs add
conservative website impact and an unresolved reason. `control: false` requires
all inputs to be resolved; use `null` when unknowns could conceal a control, unless
a known control already makes it true. No-change and invalid inputs have a null
proposed lane. An invalid input is not a conservative successful classification.

### Observation report fields

This defines a future JSON interface, not an emitted artifact or installed JSON
schema. The existing source selector only collects `git diff --name-only -z`;
its plan is not this status/mode-aware report. The advisory
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

Policy digest convention: sort file records lexically by exact path, encode an
array of `[path, sha256]` pairs as compact UTF-8 JSON with no trailing newline,
then SHA-256 those bytes. Duplicate paths, unresolved bytes or omitted consulted
inputs invalidate the policy identity. Hash the observed ruleset response after
recursive object-key sorting and compact UTF-8 JSON encoding, preserving array
order; retain the original response as evidence. These identities describe what
was inspected; the trusted producer/protection boundary remains a separate proof.

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

Each `analysis.reasons[]` entry records `path`, `side: base|candidate|both`,
`owner`, dependency path(s), matched matrix row and obligation IDs. Unresolved
entries retain path/identity when known, reason and required inspection. For
invalid collection preserve partial records as diagnostics only; do not infer
absence from them or issue an empty-success plan.

Each obligation has a stable `id`, `category` (`baseline`, `source`, `repository`,
`owning`, `external`, `hosted`, `admission`), `required: boolean`, `owner`, exact
command or external gate, workflow/job where applicable, triggering reasons,
`sourceProfile`, `hostedOriginPolicy`, `validationLevel` (each typed above or null
when that dimension does not apply), `state`, `evidence` and `reason`. Deduplicate
the same command/gate while keeping all reasons. Evidence is null before actual
observation; otherwise bind exact source/tree, producer, run/attempt when remote,
report/artifact path and digest, observed result and time. A check's plan, a
skipped required job or an old report cannot supply a passed state. Lifecycle
states and permitted next actions are owned by
[the operational interpretation](SITE-STAGING.md#observation-does-not-admit-delivery).

### Worked decisions and future test oracles

These are semantic walkthroughs for independent review and the next approved
implementation, not executed classifier tests. Route keys and owners refer to
the matrix above; every applicable current B/R/O/H obligation stays visible.

| Case | Required report/decision | Existing coverage and remaining proof |
| --- | --- | --- |
| Exact template or AGENTS edit | repository proposal, control false; baseline/R/O/H preserved. | Existing exact-template/mixed selector tests and RI instruction routes; no current repository-only delivery. |
| RI Python executable edit | repository proposal plus actual executable RI checks, regardless of zero additional JS. | RI behavioral/negative suites in navigation; later real failed-RI admission experiment remains AC02. |
| Rendered legal or publication input | website dependency and new matching rights/output obligations. | `site-engine`, `release-rights`, `publication-records`; `.md` or `review/` cannot erase the dependency. |
| Guide named by rights provenance | website/publication dependency; stale provenance evidence cannot be reused. | Two existing rights/publication suites and R; guide location is insufficient. |
| Writing content plus its template | impacts include content and website, proposed website lane; union keeps both reasons. | Existing content/render/engine/rights suites; overlapping selections do not collapse ownership. |
| RI configuration plus Writing content | repository + content, proposed content lane, control false for this RI-only config; R and all content obligations survive. | RI and existing content suites; conditional content eligibility still depends on issue5/PR79. |
| Registry, selector, workflow or admission policy/controller | control true, proposed website route and trusted pre-change obligations. | Existing selection/coupling/admission negatives prove their subsets; actual AC05 producer/protection proof is separate. |
| Runtime renamed under `review/`, or runtime/control deleted | Include base-side runtime/control and candidate-side ownership; retain website/control obligations even if the candidate no longer has the old file. | Existing selector is name-only; full status/mode/rename/deletion interface needs future independent negative tests. |
| Unknown path, unsupported type, missing ref or truncated diff | Complete unknown/type inputs are conservative; missing/malformed/incomplete input is invalid; neither is cheap eligibility. Complete empty diff is separately no-change. | Existing safe-path/fallback/RI-type tests cover their current subsets; richer collector negatives remain future work. |
| New failed/cancelled attempt or moved head/base after green | Preserve earlier evidence historically; current obligation is failed/cancelled/stale and the next action follows the current retry/revalidation rule. | Existing `prototype-admission`/staging-trust lease and attempt negatives; no reuse across identities or attempts. |
| Accepted site S, repository merge M, then content C | Keep S's source/tree/public/package identity; inspect the complete S-to-C history, including all merge-parent sides and intermediate control/rights/site changes. Missing history or incompatible inputs require fresh website validation. | Current merge observer proves identical complete trees only. Compatible-history reuse/content release is not implemented by this contract. |

Semantic review of these cases is T02 evidence. Mechanical RI/style checks prove
only their stated subsets; keyword tests do not establish contract completeness.
QA findings feed the existing test-allocation route above. Implementing the
observer, proving protected admission and measuring real lane savings require
separately approved increments; all whole issue122 ACs remain open.
