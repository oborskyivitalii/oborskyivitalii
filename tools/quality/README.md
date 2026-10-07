# Repeatable site checks

[SITE-CHECK-PROFILES](../../guides/SITE-CHECK-PROFILES.md) owns the schedule and
[test-profiles.json](test-profiles.json) inventories current suites, profiles,
changed-path inputs, dispositions and owners. Optimization is owned by #35;
#13 owns the pipeline, #12 runtime remediation and #8 hosting. Historical results
remain evidence of their inspected source. These pinned tools are development/CI
only; production runtime has no package graph.

## Small PR source check and targeted acceptance

```sh
node tools/quality/local.cjs
node tools/quality/source-tests.cjs --profile pr --base "$PR_BASE_SHA" --head "$PR_HEAD_SHA"
```

Use the PR's exact 40-character base/head commits. Basic checks run the small
source baseline. The second command adds suites selected by changed paths and
avoids replaying that baseline; unknown changed source selects all permanent
JavaScript conservatively. Changes to a diagnostic helper select its relevant
retained diagnostic tests. PR smoke also has RI/CI and maintained repository
checks, plus the owning issue's selected deterministic AC policy. Routine
Python regression uses `python3 tools/run_repository_tests.py`, which excludes
numeric task snapshots. `issue-31`, `issue-33` and subsequent task policies run
only for their owning issue; they do not freeze later publication changes.

A same-repository PR gets hosted Chromium smoke at 1440/390 widths with exact
source/public/package/HTTP identity, routes, controls, history, normal/no-Canvas
behavior and conditional authored Color smoke. Preview packaging uses
`local.cjs --package-gate` for generated/public/upload identity; its `package-gate`
has `sourceTestsRun: false` and does not repeat the required Basic source check.
Neither preview report can promote stable staging or admit production. PR feedback needs no full native platform,
Lighthouse, soak, release capture or advisory-feed run.

## Tool installation and shared artifact

Install Node 24.19.0 and Python 3.12.14, then:

```sh
npm ci --prefix tools/quality/toolchain --ignore-scripts
python -m venv tools/quality/toolchain/venv
tools/quality/toolchain/venv/bin/pip install -r tools/quality/toolchain/requirements.txt
tools/quality/toolchain/node_modules/.bin/playwright install --with-deps
node tools/quality/artifact.cjs build /tmp/site-check
export SITE_PUBLIC_DIR=/tmp/site-check/public
export SITE_ARTIFACT_MANIFEST=/tmp/site-check/artifact.json
export SITE_REPORT_DIR=/tmp/site-check/reports
```

On Windows use `venv/Scripts` and `node .../playwright/cli.js install`.
`SITE_AUDIT_TOOLS` can point to the identical installed locked toolchain;
`SITE_AUDIT_CHROME` changes the executable and is recorded in evidence. Reports
identify actual runner/CPU/OS/engine versions. A runner name does not freeze its
hardware. Browser testing and deployment consume the same verified artifact;
do not rebuild it or resolve a moving branch after validation.

## Bounded staging regression

The owner `/stage` command or the open-PR dispatch in `Site PR preview and staging`
uses the existing controller and reusable `site-release-checks.yml` with
`validation_level: staging`, `profile: staging`, `automated_only: true`. It
resolves the exact open PR head, deploys officially and checks its immutable HTTPS
origin. An updated source commit needs fresh evidence. The repository owner's
`staging-regression` PR label runs the same candidate validation against the
immutable preview URL in a separate concurrency group, without stable promotion.
It provides pre-merge evidence for changed staging code while ordinary PR updates
keep the small smoke profile.

Source checks run `local.cjs`, then `source-tests.cjs --profile staging` for
registered permanent JavaScript not already checked in the baseline, and
`python3 tools/run_repository_tests.py`. Lint/security/advisories run in the
static job. The browser job runs `staging-regression.cjs`:

Its bounded matrix covers Chromium/Firefox all-route journeys, no-Canvas and
representative navigation/failure/analytics fixtures, conditional Color smoke,
Research/Writing CPU ×4 windows, four flights and two mobile Lighthouse trials.
The exact cases and counts are owned by the registry and profile guide. Staging keeps applicable
original individual metric limits and positive probes; it makes no three-run
median, full-engine, real-device or soak claim. Static and staging browser jobs
have 15-minute limits. At most 15 minutes of active staging work is an operational
target; report achieved CI duration and queue time separately.

For a local reproduction against the same immutable hosted candidate, set
`SITE_TEST_BASE_URL` to its HTTPS URL and `SITE_TEST_PROFILE=staging`, retain the
artifact/report variables above, and run:

```sh
node tools/quality/staging-regression.cjs
```

The aggregate `staging-gate.cjs` additionally requires successful build/static/
host/staging outcomes, lint/security/advisory/host reports and the exact candidate,
public/upload digest and origin identities. It emits the distinct `staging-gate`
with `fullGate: false` and `productionEligible: false`; missing, failed, duplicate
or wrong-source reports fail. Only this complete matching controller gate can
promote stable staging. Publication uses checked-in workflows; these commands
are check reproductions.

## Full production regression

The reusable workflow defaults to `validation_level: production` and `full: true`.
Run that complete candidate validation explicitly before production admission.
`profile` selects hosted origin/indexing policy, independently of coverage:
full checks may inspect `profile: staging` on an immutable candidate, while the
actual production origin must pass `profile: production` checks. Color remains
staging-only. Running a full validation does not activate publication.

Local full-suite reproductions, after installing the toolchain and preparing the
same artifact:

```sh
node tools/quality/source-tests.cjs --profile production
python3 tools/run_repository_tests.py
node tools/quality/scanners.cjs lint
node tools/quality/scanners.cjs security
node tools/quality/scanners.cjs advisories
node tools/quality/functional.cjs
# Separate, sequential benchmark worker:
node tools/quality/lighthouse.cjs
node tools/quality/motion.cjs
```

Full regression retains Linux Chromium/Firefox 260 functional / 8 navigation /
26 analytics cases plus native macOS WebKit 130/4/13, totalling 390/12/39.
Windows Chromium/Firefox 40/8/26 and original Linux Color12 stay supplemental.
Every original failure/no-JavaScript mode, both widths/themes, accessibility,
archive/history, rapid/reverse navigation and readable fallback remains required.
Analytics fixtures intercept the SDK locally; they do not establish dashboard
counts. See [SITE-ANALYTICS](../../guides/SITE-ANALYTICS.md).

Retain thirty sequential Lighthouse runs (3 × 5 routes × mobile/desktop), median
raw metric checks, desktop/mobile/mobile×4 motion and flight samples, positive
paint probes, Off/reduced zero work, the five-minute heaviest-route soak, full
captures and cache-retention loops. Original budgets live in `budgets.json` and
[SITE-RELEASE-GATES](../../guides/SITE-RELEASE-GATES.md). Score ≥90 remains secondary.
Missing/cancelled jobs, bad probes, profiles, counts or digests fail the strict
aggregate. Independent failure-propagation fixtures remain production controls.

Full release evidence is external to the candidate tree: upload a separately
produced `release-evidence.json` through an evidence-record workflow in this same
repository, then supply immutable `evidence_artifact_id` and `evidence_run_id`.
The strict validator checks exact candidate/public identities, reviewer and
durable records for independent review, physical iOS Safari and modest Android
Chrome. Missing records leave release acceptance pending. Playwright WebKit is
not branded Safari; viewports and CPU slowdown do not certify physical devices.
`promotion.cjs` and the GitHub Pages example retain full hosted/device/review
requirements and reject the lighter staging gate. Hosting/TLS/ZAP/live verification
remain under #8 and rights/launch decisions under #1/#7.

## Diagnostics and profile maintenance

Retained diagnostic JavaScript suites run explicitly with
`node tools/quality/source-tests.cjs --profile diagnostic`, or when their owning
helper changes and PR selection targets them. Eight causal/probe workflows
remain manual; removing their routine source-suite replay is distinct from
changing workflow frequency. Current authored Color code under `review/` remains
an active source and keeps its permanent regression coverage.

At issue completion review each test's PR, staging, production or diagnostic
assignment. Record duplicate removals, obsolete disabled cases and retained
independent failure surfaces with their surviving route and owner in the
registry. Update RI routes and the RI/CI map, verify and rebuild the views.
Do not silently reactivate every dated task or experiment with a test wildcard.

Semgrep uses local CC0 rules and checks coverage/parse errors for public JS/HTML,
producer JS/Python and workflows. Bandit covers Python tooling. Secret scans cover
current tracked text, including public HTML and existing review JSON; values in
reports are hashed. Exact generated-hash/article-ID false positives are recorded
in `secrets-baseline.json`, never a blanket entropy allowlist. New candidates fail.
The triage helper is a manual review aid and is never invoked by CI.

Npm/pip advisory feeds must succeed. Original findings remain in raw reports.
The sole temporary npm exception is GHSA-vfj7-8cjw-p6xm in tooling-only braces
3.0.3, for which no fixed release exists at the recorded date. Stylelint uses
its literal code API, so the affected glob-pattern walkers receive no user input.
The exception binds the helper, static configuration and committed lock SHA256s
and expires 2026-11-03. A changed helper/configuration/lock/version, new advisory
or expired review fails. The independent reviewer
must assess this reachability decision; it is not a zero-vulnerability claim.

`bandit-policy.json` owns exact expiring internal-tooling findings;
`bandit-triage.cjs` verifies source/line/rule/coverage and retains raw counts.
The security summary reports remaining blocking findings separately from raw and
reviewed findings. SHA1 Git object identifiers use `usedforsecurity=False`; they
are metadata, while integrity evidence remains SHA256. Generated RI and coupling
checksums are admitted only after both actual verification commands succeed;
other new entropy values require exact reviewed entries in `secrets-reviewed.json`.
The historical `secrets-baseline.json` remains byte-identical and within RI bounds.
