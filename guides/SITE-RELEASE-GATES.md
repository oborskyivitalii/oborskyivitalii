# Site release requirements

Owner: [release gates #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13),
with [hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) and
launch/rights #1/#7 retaining their separate acceptance decisions.
[SITE-CHECK-PROFILES](SITE-CHECK-PROFILES.md) owns when checks run;
[SITE-STAGING](SITE-STAGING.md) owns controller, promotion and recovery mechanics.
Read live issues/PRs and [MEMORY](../MEMORY.md) for the exact candidate and results.

## Coverage and source boundary

[Test optimization #35](https://github.com/oborskyivitalii/oborskyivitalii/issues/35)
supersedes the old full-staging schedule: PR feedback is small smoke plus the
owning issue's targeted AC checks; explicit staging runs the bounded regression
in SITE-CHECK-PROFILES. The maintainer's 17 October policy under #39 admits
production from authenticated successful staging on the identical merged source
tree; full production regression is an optional manual diagnostic. Full
production coverage retains Linux Chromium/Firefox 260/8/26 plus native macOS
WebKit 130/4/13: all 390 functional, 12 navigation and 39 analytics cases,
including every no-JavaScript/failure mode. Windows 40/8/26 smoke and twelve
original Linux Color cases remain supplemental. Pins and original budgets remain
unchanged. Legacy nonfull three-engine tooling remains available diagnostically.

Staging uses the existing CI controller and owner request. Its distinct
`staging-gate` is not full release evidence. Production activation and
exact-edition rights acceptance and owner dispatch remain required. Independent,
device and visual observations remain honest records; the publisher does not
require new device or full-diagnostic reports. Historical successful runs admit
only their matching sources, artifacts and controllers. The new staging-policy
owner authenticates actual completed staging, the protected merge and identical
complete source trees before deriving the separate production edition.

The [original contract and dated amendments](https://github.com/oborskyivitalii/oborskyivitalii/blob/3ca14c54824ac6b9e7225bc88429b4b8fb3bcf10/SITE-RELEASE-GATES.md)
preserve PR #10/S1–S4 execution, blanket publication pauses and the original
pipeline implementation proposal. Those session instructions are historical.
The v8 [audit](../review/site-audit-v8-20261003/REPORT.md) and
[execution tasks](../review/site-audit-v8-20261003/SOL-TASKS.md) remain evidence
of their inspected edition, not new tasks for every follow-up.

## Maintained execution routes

Commands and code paths below are relative to the repository root.
Use `node tools/quality/local.cjs` for the bounded local/Basic source check.
The existing `tools/quality/`, required workflows, reviewed toolchain locks,
scanner rules, exceptions and versioned budgets own executable verification.
Do not introduce a competing release pipeline from an old session handoff.

Use locked CLI dependencies, reviewed action commit SHAs and compatible pinned
browser revisions. Record actual OS image, architecture, browser executable and
tool versions. A runner label alone does not freeze its CPU or image revision.
Keep caches and transient output outside the repository's RI inventory. Optional
quality tooling is not a production runtime dependency. No paid scanner account,
SonarQube service, Lighthouse server or device-cloud subscription is required.

| Stage | Required work | Acceptance boundary |
| --- | --- | --- |
| Draft prototype | Generated/package/snapshot/size/syntax and HTTP identity | Deferred source/browser checks are not admission. |
| Visually approved ready PR | Bounded Basic source/hosted smoke, RI checks and targeted owning-issue AC checks | Required checks fail on missing/failed applicable results; preview does not authorize stable staging. |
| Explicit staging | Exact-artifact source/lint/security/advisory/host checks and bounded browser/failure/navigation/analytics/Lighthouse/CPU/flight regression | The distinct complete staging gate and source/controller/artifact identities must match before stable staging promotion. |
| Before production admission | Authenticate successful staging jobs/raw reports and unchanged merged source tree; freeze and verify production edition/rights/archive | `production-staging-admission` binds both distinct artifacts without claiming full production tests. Owner dispatch and rights approval remain required. |
| Optional full diagnostic | Manually invoke the complete existing production suite and passive ZAP when needed | Status is visible and nonblocking; no publication dependency. |
| After deployment | Served edition/digests, every route and assets, interactions, HTTPS/live headers and applicable canonical/robots/sitemap policy | Deployment is healthy only after live checks; recovery follows the reviewed same-artifact controller route. |

The registry in SITE-CHECK-PROFILES owns routine, targeted and diagnostic source
suites. At issue completion review every added/changed test's PR/staging/production
assignment, duplicate or obsolete status, reason and owner; update RI and its CI
mapping with those dispositions. When explicitly requested, the complete optional
production matrix must not be reduced by a path filter. If a check is legitimately not applicable, the
aggregate records a validated reason; absent/cancelled/unknown results do not
count as success. No recurring clock schedule is implied by this guide.

## Production archive identity

The accepted [#72 archive policy](https://github.com/oborskyivitalii/oborskyivitalii/issues/72)
uses immutable `prod-YYYY-MM-DD.N` tags and GitHub Releases retaining exact
`public.tar.gz`, `archive.json`, `rights.json`, original staging/candidate reports
and source-bound rights evidence. Historical full-gated archives remain valid. Records bind
source/tree, public/package SHA256, validation run, date and previous accepted tag.
CI retention is not archive lifetime. Deterministic packing and bounded
manifest-only extraction live in `tools/release/package.py`; `archive.cjs` rejects
raw staging/prototype proof, failed or incomplete staging derivation, package
tampering and reassignment of a release identity. It also preserves verification
of historical full-gated archives without requesting new full tests for rollback.

After successful authorized deployment and live checks, protected `production`
and the GitHub `production` deployment must identify the same live source/package.
Preserve an actual existing publisher ref if authenticated settings reveal one.
The release PR carries `active-production`; its verified successor moves the
preceding PR to `archived-production`. Labels aid browsing; tags/manifests/live
deployment remain authoritative. Until first release production is inactive.
Rollback deploys the archived package unchanged and verifies it before moving
the production pointer or labels. Immutable tags never move. Failed or partial
transitions remain observable and preserve recoverable accepted packages.

`site-release-candidate.yml` builds the explicit Color production edition before hashing
or testing: canonical URLs, indexing, robots, sitemap and owned 404. It publishes
only an isolated `production-candidate-RUN` Cloudflare preview. Provider preview
headers suppress indexing; the public archive already has its production policy.
Supply `candidate_sha` and the accepted merged `release_pr`. The candidate
authenticates original successful staging and identical complete source trees,
then binds both edition manifests and the original staging gate. Runtime assets
must match their reviewed staging/production family. The new admission remains
`fullGate: false`; staging-edition bytes cannot become the production archive.
Optionally forward its artifact/run/digests and immutable URL into
`site-candidate-evidence.yml` for the unchanged full matrix. No optional outcome
is consumed by the publisher.
The candidate compiler retains a complete rights inventory with its public
artifact. Publication requires `evidence.rights.inventoryDigest` matching that
report, a separate maintainer review record, and a source-confirmed structured
reuse-policy decision. Pending policy or inventory coverage alone cannot admit
publication. See [the rights contract](SITE-RIGHTS.md).

`site-production.yml` is dispatch-only and disabled unless
`SITE_PRODUCTION_ENABLED=true`. `tools/release/controller.cjs` authenticates the
actual completed owner/main candidate producer and original staging jobs/reports,
source PR/tree/history and production protection. Before live publication it
uploads `public.tar.gz`, `archive.json`, original staging/candidate report ZIPs
and logs of both producers to a draft Release, redownloads and verifies their bytes,
and retains the previous and next complete Pages packages. Existing tags/assets
cannot be repurposed or replaced. A tag-only interrupted preparation needs explicit
reconciliation or a fresh identity; the publisher does not overwrite it.

The official Pages deployment composes the frozen production root only. It
authenticates and retains the complete previous package solely for recovery;
Cloudflare remains the sole staging publisher. Exact HTTP/TLS/MIME/canonical/indexing,
production navigation and real 404 (including retired `/staging/` routes) must
pass the bounded post-publication smoke. Passive ZAP stays in the optional full
action with its pinned image, owned-origin scope and original finding policy.
All actual publication observations must be retained.
`activation.json` and `observations.tar.gz` then join the durable Release before
publication locks its assets/tag. GitHub must report `immutable: true` before
the protected source ref, labels and successful production deployment can move.
If any stage fails, exact previous Pages bytes are restored and checked before
bookkeeping compensation; the run stays red. Production-content compensation
preserves the canonical domain/HTTPS and verifies unchanged settings; explicit
domain-migration recovery owns restoring its original prefix. Authenticated
first-release capsules may remain from a proven main ancestor when the exact
predecessor ZIP and every canonical served byte still verify. The protected
publisher has a separate metadata-only recovery operation for an exact failed
first-publication result; it cannot deploy Pages, change settings or accept a
release. Both metadata writers use ordinary `pull-requests: write`; only real
label transitions issue writes. GitHub rejects empty additive label requests,
so these cannot establish permission through a no-op preflight. A frozen Release from a failed
bookkeeping transition is retained but is not an accepted rollback target.

Rollback consumes a previously live accepted immutable Release, verifies every
asset digest including the frozen rights report and safely unpacks the original package, then repeats live
production checks. It moves the active pointer and PR labels after success;
the original Release/tag/evidence remain unchanged. Several releases from the
same PR share its active PR label; their distinct tags and deployment records
identify which versions are historical. Labels are checked against the actual
accepted deployment before a transition, so stale manual labels stop publication.

Source integration is implemented under #72. Live controls, actual production
transitions and existing #39/#40/#1/#7 release acceptance remain separate evidence.
The later maintainer authorization permits production continuation; preparing
this policy PR does not itself activate production.

### Production preparation without activation

1. Enable repository **Settings → General → Releases → Enable release immutability**.
   This administrative setting and published Release immutability need actual
   observation; a source guide or a CI variable is not evidence of the setting.
2. Configure active `protect-production`, targeting exactly
   `refs/heads/production`, without creating the branch. Require creation, update,
   deletion and non-fast-forward restrictions. The only bypass is a dedicated
   registered Production GitHub App, installed on this repository, mode `always`.
   Set its numeric App ID in `PRODUCTION_APP_ID`; the publisher rejects internal
   GitHub Actions integration `15368` and any wider bypass list. A required-check
   integration ID does not establish an eligible installed ruleset bypass.
3. Restrict `production` and `github-pages` environments to protected main.
   Configure `PRODUCTION_APP_CLIENT_ID` and `PRODUCTION_APP_ID` as environment
   variables and `PRODUCTION_APP_PRIVATE_KEY` as a secret in both protected
   environments. Install the App on this repository only with Administration,
   Contents and Workflows write, and Metadata read permissions. The pinned official
   action mints and revokes a fresh repository-scoped installation token per job.
   GitHub only returns ruleset bypass actors to a caller with write access to the
   ruleset; the ordinary `GITHUB_TOKEN` cannot establish that inspection or the
   installed App bypass. A separate client uses the App token for ruleset metadata,
   protected Git refs/tags and durable Release operations. Workflows write permits
   restoring archived commits whose workflow files differ from current main.
   Pages, labels and production deployment records retain `GITHUB_TOKEN`; the App
   is not granted those publishing permissions. Missing credentials, a mismatched
   App ID or hidden bypass actors block publication. Actual provider configuration
   and authorized operations still need observation; fixtures do not prove setup.
   Keep `SITE_PRODUCTION_ENABLED` absent or `false` during preparation. No production
   ref, active label, release tag, `.ai` domain or DNS route is created by setup.
4. Before a later authorized release, observe Pages on the canonical owned
   `https://vitaliioborskyi.ai` origin under #39/#40, complete full/external/rights
   acceptance, and enable the production opt-in by the maintainer's release decision.
   Run **Authorized production release or rollback** on main with the immutable
   tag, successful full validation run, merged PR and source-bound evidence JSON.

## Security and source quality

| Tool | Scope and gate |
| --- | --- |
| Semgrep CE | Public JS/HTML, relevant producer scripts and workflows. Review and pin a local rule set or immutable rules revision with its licence. Enforce parse/scan coverage, including oversized/skipped files; do not call a partial scan clean. |
| Bandit | Python producer/quality tooling; actionable security findings fail unless narrowly reviewed and excepted. |
| detect-secrets | New/changed tracked text on PRs, full current tracked text at first release. Audit hash/article-ID false positives by exact scope; do not blanket-allow every high-entropy value or exclude public HTML. This does not establish full Git-history coverage. |
| Dependency advisory check | Scan actual npm/Python lockfiles, including development and audit tooling, using their supported free advisory tools. Record tool/feed date and reachability decisions. If no runtime package graph exists, report that runtime scope as N/A; still check tooling. A failed fetch/scan is not zero vulnerabilities. |
| ESLint + SonarJS | Browser scripts, applicable Node tools and tests; syntax/undefined/verified-unused errors gate, selected complexity findings have a reviewed baseline and no-new-debt rule. Trusted VM fixtures are not public runtime execution sinks. |
| Stylelint | Parse errors and reviewed duplicate/cascade rules gate; cosmetic formatting debt is visible without an indiscriminate CSS rewrite. |
| Ruff | Python correctness/import checks and reviewed complexity rules; use `--no-cache` or an external cache. |

The Python lock includes its installer and every installed audit dependency. Full
installers use `--no-deps` only with that complete lock, immediately followed by
`python tools/quality/python_toolchain.py`. The verifier rejects missing, changed,
duplicate, unfrozen or incompatible packages. Its single reviewed constraint
override keeps unmodified Semgrep CE1.179.0 with patched MCP1.30.0, replacing the
upstream exact1.29.0 declaration. Only the existing CE scan route is supported;
this is not an MCP service deployment or a dependency-advisory exception. The
advisory engine repeats installed-graph verification and audits every locked
package, including the patched SDK and installer. Any future version/constraint
change needs a new compatibility review; the exact override otherwise fails.

New untriaged findings fail the relevant check until classified. A real release
blocker must be fixed or carry an explicit, scoped and expiring reviewed exception.
Separate false-positive suppressions from accepted risk. Each exception records
rule/finding, path and scope, reason, owner, issue and expiry/review condition;
expired or broadened exceptions fail. Never baseline away the reproduced #12 bugs.

Do not execute untrusted PR code with deployment credentials. Read-only checks use
minimal permissions and no persisted checkout credentials. The eventual deploy
job receives only the host-specific permissions it needs, after validation of the
same approved candidate. Scanner reports must redact any discovered secret values.

## Browser, platform and failure coverage

| Execution environment | PR smoke | Staging regression | Full production regression |
| --- | --- | --- | --- |
| Linux, pinned supported runner image | Chromium at two widths | Chromium/Firefox all-route journeys and representative failure/navigation fixtures | Full functional/failure 260/8/26; original Color12 retains all three engines. |
| Windows, pinned supported runner image | Not required | Not required | Chromium/Firefox all five routes, both themes, desktop/mobile and core interactions. |
| macOS, pinned supported runner image | Not required | Not required | WebKit full 130/4/13, all five routes, both themes/widths and every original failure/no-JavaScript mode. |
| Physical iPhone/iPad Safari and modest Android Chrome | No device-cloud requirement | No new automated device claim | Record available physical observations for first release and material rendering changes; not an input required by the staging-based publisher. |

The following matrix and performance section specify full production regression.
The bounded staging sample retains the applicable individual original limits,
but does not claim full matrix, median or soak acceptance.

The combined Linux/macOS core matrix retains the audit's 1440×900 and 390×844 Day/Night
views and 320px fallback checks. Include 200% layout/zoom inspection, keyboard
navigation/focus, theme/storage behavior, Writing query/hash/history/empty states,
normal and rapid reverse scrolling, Off/reduced, visibility/print pause and return.
Add normal/delayed/blocked CSS, absent Canvas/JS/storage/required capability and
post-activation drawing-fault tests. Assert no unexpected errors, readable content,
no horizontal overflow, truthful Motion controls and bounded fallback/recovery.
Mark synthetic visibility/context-loss checks as synthetic; a native OS dialog or
GPU-loss claim needs an actual observation.

Real-device smoke covers load, portrait/landscape, touch scroll, theme, archive,
Motion off/reduced and readability after tab return. Record device, OS/browser,
candidate SHA/artifact digest, result and reviewer. For content-only updates,
record unchanged runtime/layout/assets and available automated coverage; layout-affecting
content or dependency changes invalidate claims that old physical observations cover the changed behavior. Reusing
device evidence requires an explicit matching runtime/layout/assets fingerprint.
If devices are unavailable, record that observation as missing; under the
17 October staging-then-smoke policy it does not block production publication. A documented maintainer exception can narrow the supported-device claim;
the implementer cannot silently mark untested phones as supported.

Playwright WebKit is not branded Safari. Device profiles and CPU slowdown do not
certify real iOS/Android behavior. Record the tested versions; do not infer a
minimum historical browser version. Basic content must remain useful when optional
enhancements are unavailable. Retain v8's motifs, stable macro composition,
native scrolling and the explicitly authorized 24-second ambient cycle on capable devices.

## Performance budgets and measurement validity

Use the exact deployable public files, a reproducible compressed HTTP fixture and
a fixed documented profile. Lighthouse runs sequentially, one worker, without
simultaneous local benchmarks. Collect three runs for each of the five routes in
each mobile/desktop profile; keep all reports and median metrics per route/profile.
Check actual `configSettings.formFactor`, viewport, throttling and browser version.
Use Lighthouse CI assertions or the existing Lighthouse runner with a small
validated aggregation wrapper; explicitly select median aggregation. Do not
accidentally accept a tool's default best-run aggregation or a mobile run labelled
desktop. A failed/missing run makes the sample incomplete, not optimistically green.

| Initial budget | Enforcement |
| --- | --- |
| Mobile LCP ≤2.5 s, TBT ≤200 ms, CLS ≤0.1, each route's three-run median | Required assertions within the optional full diagnostic. Staging retains its original individual budgets. Desktop metrics retain reviewed per-route budgets. |
| Lighthouse performance ≥90 | Secondary target/report; never substitutes for the individual metric gates. |
| Raw HTML ≤100 KB per public route | Deterministic PR/release gate. |
| ≤250 decorative inline SVG nodes, or an external static fallback | Count actual elements; give external assets explicit raw/compressed byte budgets and record total route transfer size. Moving the same cost out of HTML is not sufficient. |
| Mobile ×4 painted-callback p95 ≤33 ms; idle animation callback time ≤20% of sampled elapsed time | Initial sustained-motion release budgets, separately for every route; any lower quality tier has explicit reviewed budgets and visual evidence. |
| Settled Motion off/reduced | Zero ongoing animation paints/callbacks; explicit settling interval and observation window. |

Motion reports also retain actual painted callback-start gaps (p50/p95/max) and
paint rate, recomputed from raw samples by the validator. These diagnose cheap
but uneven/undersampled animation; callback intervals are lab measurements, not
physical display FPS. The existing release thresholds above are unchanged.

Retain the baseline's desktop/mobile/mobile×4 idle and scroll scenarios, then add
a bounded release soak (initially five minutes on the heaviest route). Retain raw
frame samples, long-task/error/control state and available comparable heap samples.
The soak must complete without crash, runaway work or failed controls; heap trend
is supporting evidence, not a universal memory-leak proof or arbitrary heap cap.

Require a positive Motion-on probe proving actual paints are observed before any
zero-cost result is accepted. The historical probe identifies `frame` by name;
remove that dependency or update and self-check it when refactoring. Report JS/
Canvas callback duration and paint count honestly, not display FPS or battery use.

Implement budgets in one versioned config and validate completeness for all
routes/profiles. Calibrate runner variance with repeated baseline/candidate runs
under the same environment. If noise makes a gate unreliable, investigate and
review the runner/budget policy change; do not repeatedly rerun until one passes
or silently raise thresholds after seeing a failing candidate. Record every retry
and result. Proposed budgets remain targets until verified, not v8 performance claims.

## Release gate, hosting and evidence

Package only the public site. Bind the source commit/tree, public-file SHA-256
manifest and deployable artifact digest in a machine-readable release manifest.
Testing and deployment consume that same artifact; do not rebuild or resolve a
moving branch after validation. Bind external device/review records to the same
artifact or an explicitly checked unchanged-scope fingerprint. Identify the
candidate revision separately from GitHub's temporary PR merge ref.

The optional full diagnostic gate checks its complete job status, report schemas/route
counts, nonempty scanner/browser coverage, all expected profiles, metric
assertions, exception expiry and matching source/artifact identities. Production
admission separately authenticates successful staging, the identical merged
source tree and frozen production edition through `staging-policy.cjs`. The
separate staging gate checks its smaller explicit matrix and remains
`fullGate: false` / `productionEligible: false`. No `continue-on-error` bypass on
mandatory checks. Prove failure propagation using synthetic secret/security-rule,
oversize HTML, browser-error, missing-engine/report, invalid-probe and digest-
mismatch cases. Fixtures must not contain real credentials and stay out of docs/.
Also demonstrate a complete passing validation after #12's fixes.

GitHub Pages uses an Actions-based deployment whose production job depends on
authenticated successful staging and its frozen production derivation; automatic
branch publication cannot enforce that binding. The existing `promotion.cjs` and GitHub Pages example retain their full hosted/device/review contract;
`staging-gate` does not satisfy them. Preserve separate existing rights/URL/release
decisions. If a different host is selected, implement equivalent same-artifact
gating. Inspect any repository/environment controls at activation and record
unavailable capabilities honestly; do not add a new approval ceremony just for CI.

For the optional full diagnostic on an owned origin, scope OWASP ZAP Baseline to that exact origin with
bounded crawling/passive scanning and explicit FAIL/WARN rule policy. Do not
attack or crawl linked Medium/LinkedIn/research hosts. Record preview-versus-prod
header/config differences. Local HTTP is not proof of TLS/CSP. Account for actual
host capabilities and CSP compatibility rather than copying an indiscriminate
header checklist. At first activation, prove host configuration on a representative
preview where available and verify the production origin immediately afterward.
The release is not declared healthy before those live checks pass. Retain the
previous accepted artifact and document authorized rollback behavior.

Upload JSON/SARIF where supported, HTML summaries, browser traces/screenshots on
failure, all Lighthouse runs and sustained-motion samples, even when checks fail.
Use bounded CI retention (initially 30 days for ordinary runs); preserve accepted
release manifests, concise results and durable report links beyond that window in
the release record. Do not lose all release evidence when transient artifacts expire.
Reports identify exact refs, test/rule versions, exclusions, real versus emulated
platforms, unsupported cases, reviewer and remaining blockers. Link completed
increments in the owning issue/PR and applicable #12/#13 routes so an interrupted
session resumes from evidence.

## Candidate evidence checklist

- [ ] Applicable known bugs fixed; focused regressions fail on their recorded baseline and pass on the candidate.
- [ ] Existing portable pinned commands and applicable gates pass in a clean checkout.
- [ ] Accepted staging and identical merged source tree authenticate the frozen production edition. Optional full diagnostics are recorded separately and do not block release.
- [ ] Controlled failing cases block the aggregate gate; complete passing case exists.
- [ ] Same-artifact deployment dependencies verified; hosting activation and live checks tracked in #8.
- [ ] Rights acceptance binds the frozen inventory; device and independent review observations are accurately recorded.
- [ ] Before/after report, all-page visual preview, exact-head CI and durable issue/PR updates; test/profile dispositions and RI routes reviewed.

## Primary implementation references

- [Playwright CI](https://playwright.dev/docs/ci) and [browser boundaries](https://playwright.dev/docs/browsers).
- [Lighthouse CI configuration and assertions](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html).
- [ZAP Baseline scope, rule configuration and exit codes](https://www.zaproxy.org/docs/docker/baseline-scan/).
- [GitHub Pages custom deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Audit tools, versions and limits](../review/site-audit-v8-20261003/REPORT.md).

Custom-domain rollout and finite .com redirects follow [the domain readiness plan](SITE-PRODUCTION.md) in #39.
