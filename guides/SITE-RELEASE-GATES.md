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
in SITE-CHECK-PROFILES; full regression precedes production admission. Full
production coverage retains Linux Chromium/Firefox 260/8/26 plus native macOS
WebKit 130/4/13: all 390 functional, 12 navigation and 39 analytics cases,
including every no-JavaScript/failure mode. Windows 40/8/26 smoke and twelve
original Linux Color cases remain supplemental. Pins and original budgets remain
unchanged. Legacy nonfull three-engine tooling remains available diagnostically.

Staging uses the existing CI controller and owner request. Its distinct
`staging-gate` is not full release evidence. Production activation and
first-release rights, independent/device and maintainer visual acceptance remain
separate. Historical successful runs admit only their matching sources,
artifacts and controllers; neither a prior run nor green Basic/staging checks
accepts another production candidate.

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
| PR update | Bounded Basic source/hosted smoke, RI checks and targeted owning-issue AC checks | Required checks fail on missing/failed applicable results; preview does not authorize stable staging. |
| Explicit staging | Exact-artifact source/lint/security/advisory/host checks and bounded browser/failure/navigation/analytics/Lighthouse/CPU/flight regression | The distinct complete staging gate and source/controller/artifact identities must match before stable staging promotion. |
| Before production admission | Complete exact-artifact source/security/browser/native/Color/accessibility/failure/Lighthouse/CPU/soak/capture regression and applicable source-bound rights/independent/device/production-origin checks | Only the strict full gate plus applicable external release acceptance admits the candidate; activation stays with #8 and the release decision. |
| After deployment | Served edition/digests, every route and assets, interactions, HTTPS/live headers and applicable canonical/robots/sitemap policy | Deployment is healthy only after live checks; recovery follows the reviewed same-artifact controller route. |

The registry in SITE-CHECK-PROFILES owns routine, targeted and diagnostic source
suites. At issue completion review every added/changed test's PR/staging/production
assignment, duplicate or obsolete status, reason and owner; update RI and its CI
mapping with those dispositions. The complete authorized production matrix must
not be skipped by a path filter. If a check is legitimately not applicable, the
aggregate records a validated reason; absent/cancelled/unknown results do not
count as success. No recurring clock schedule is implied by this guide.

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
| Physical iPhone/iPad Safari and modest Android Chrome | No device-cloud requirement | No new automated device claim | First release and material rendering/layout/input/fallback/browser-policy changes require recorded physical smoke evidence. |

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
record unchanged runtime/layout/assets plus the automated matrix; layout-affecting
content or dependency changes require the applicable device check again. Reusing
device evidence requires an explicit matching runtime/layout/assets fingerprint.
If devices are unavailable, finish automated work and leave that release gate
pending. A documented maintainer exception can narrow the supported-device claim;
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
| Mobile LCP ≤2.5 s, TBT ≤200 ms, CLS ≤0.1, each route's three-run median | Required release metric assertions. Desktop metrics are retained and checked against reviewed per-route budgets set before candidate evaluation. |
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

The strict production gate checks required job status, report schemas/route
counts, nonempty scanner/browser coverage, all expected profiles, metric
assertions, exception expiry and matching source/artifact identities. The
separate staging gate checks its smaller explicit matrix and remains
`fullGate: false` / `productionEligible: false`. No `continue-on-error` bypass on
mandatory checks. Prove failure propagation using synthetic secret/security-rule,
oversize HTML, browser-error, missing-engine/report, invalid-probe and digest-
mismatch cases. Fixtures must not contain real credentials and stay out of docs/.
Also demonstrate a complete passing validation after #12's fixes.

For future GitHub Pages hosting, #8 must configure an Actions-based deployment
whose deploy job depends on the successful strict production gate; direct
automatic branch publication cannot enforce it. The existing `promotion.cjs`
and GitHub Pages example retain their full hosted/device/review contract;
`staging-gate` does not satisfy them. Preserve separate existing rights/URL/release
decisions. If a different host is selected, implement equivalent same-artifact
gating. Inspect any repository/environment controls at activation and record
unavailable capabilities honestly; do not add a new approval ceremony just for CI.

Once an owned origin exists, scope OWASP ZAP Baseline to that exact origin with
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
- [ ] Applicable profile runs on candidate bytes; before production, the full browser/OS/performance matrix and validity checks pass.
- [ ] Controlled failing cases block the aggregate gate; complete passing case exists.
- [ ] Same-artifact deployment dependencies verified; hosting activation and live checks tracked in #8.
- [ ] Required device and independent review evidence recorded or explicitly pending.
- [ ] Before/after report, all-page visual preview, exact-head CI and durable issue/PR updates; test/profile dispositions and RI routes reviewed.

## Primary implementation references

- [Playwright CI](https://playwright.dev/docs/ci) and [browser boundaries](https://playwright.dev/docs/browsers).
- [Lighthouse CI configuration and assertions](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html).
- [ZAP Baseline scope, rule configuration and exit codes](https://www.zaproxy.org/docs/docker/baseline-scan/).
- [GitHub Pages custom deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Audit tools, versions and limits](../review/site-audit-v8-20261003/REPORT.md).
