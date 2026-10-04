# Repeatable site checks

Owner #13; runtime remediation #12. Production runtime has no package graph.
These pinned tools run on development/CI only. Historical v8 results are immutable.

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
node tools/quality/scanners.cjs lint
node tools/quality/scanners.cjs security
node tools/quality/scanners.cjs advisories
node tools/quality/functional.cjs
# Separate, sequential benchmark worker:
node tools/quality/lighthouse.cjs
node tools/quality/motion.cjs
```

On Windows use `venv/Scripts` and `node .../playwright/cli.js install`.
`SITE_AUDIT_TOOLS` can point to an already-installed identical locked toolchain;
optional `SITE_AUDIT_CHROME` changes the executable and is recorded in evidence.
Reports describe actual runner image/version, CPU, OS and engine versions. The
runner name does not freeze its hardware. Browser tests use the copied, verified
public artifact. Do not rebuild or resolve a moving branch for deployment.

PR workflow `Site PR checks` calls reusable `site-release-checks.yml`: build once,
source/content/export/RI regressions, size/transfer budgets, quality/security/feed
checks, all five routes × both themes × Chromium/Firefox/WebKit. Normal views are
1440×900 and 390×844. Eleven failure/capability modes run at 320px. Assertions
cover content/overflow, actual paints, controls, reverse scrolling, keyboard,
archive history/print, storage, delayed/blocked CSS, exceptions and synthetic loss.
The same engines also run four persistent-navigation cases (both widths/themes),
covering every route, retained header/Canvas/control identity, forward/backward
flight, metadata/focus, browser history, Writing mount/detach, rapid navigation,
Off/reduced motion and an injected fetch failure with native-document recovery.
Missing cases or assertions fail the aggregate; fixtures exercise those failures.
CSS zoom and synthetic visibility/print events are explicitly limited claims.

Each engine also runs thirteen enabled-source analytics fixtures: five production
entry routes, a blocked/delayed SDK, a different staging origin and five offline entries.
`Site runtime regressions` explicitly runs the analytics settings/adapter/export
suite; PR and release builds include it in `tests/*.test.cjs`. Fixtures use their
own disabled/enabled settings and remain valid after production activation.
The required generated-source check rejects loader/verification/asset drift or
unexpected disabled tracking before the public artifact is packaged.
The provider URL is intercepted with a local stub; no visitor data is sent.
These require persistent navigation/history/filters/reload, one vendor load per
document and zero external offline/staging requests. The aggregate rejects missing
cases or assertions. [SITE-ANALYTICS](../../SITE-ANALYTICS.md) distinguishes this
source-adapter coverage from actual dashboard counts and hosted SDK performance.
For a focused local Chromium repeat: `node tools/quality/analytics-browser.cjs`.
DOM-ready navigation avoids waiting on the vendor's document-load event; the
delayed SDK case requires all routes/history/filters to work before releasing it.
The new fixture uses the same 30s navigation bound as the existing runner, with
unchanged 6s readiness/SDK assertions and all existing #13 metric/startup budgets.

Full release calls add Windows Chromium/Firefox, macOS WebKit, 30 sequential
Lighthouse runs (3×5×2; median metrics), desktop/mobile/mobile×4 painted-callback
samples, positive probes, Off/reduced zero work and a five-minute soak on the
measured heaviest mobile route. Lighthouse score ≥90 is reported as a secondary
target; the versioned raw metric budgets gate. Missing/cancelled jobs, incomplete
reports, wrong profiles, failed probes and digest mismatches fail the aggregate.
`tests/quality.test.cjs` exercises controlled failure propagation.

Run full evidence on an exact commit using workflow dispatch, a workflow caller,
or the `site-release-candidate` PR label. The label triggers once when added; it
does not silently rerun expensive benchmarks for every source push. A new source
commit needs a new full run. PR checks continue on every update.

Full release evidence is external to the candidate tree: upload a separately
produced `release-evidence.json` through an evidence-record workflow in this same
repository, then supply its immutable `evidence_artifact_id` and `evidence_run_id`
to the reusable workflow or full dispatch. This avoids embedding a candidate's
own commit/tree SHA inside itself. The gate downloads the specified artifact
with read-only access, records its IDs, and requires exact candidate/public
identities, `pass`, reviewer and durable record links for independent review and
physical iOS Safari / modest Android Chrome. Missing records fail the full gate.
No physical evidence record has been produced for this candidate. Playwright WebKit is not branded
Safari; mobile viewports and CPU throttling do not certify real devices.
Hosting/URL/TLS/ZAP and post-deploy verification remain under #8. This code does
not activate publication or bypass #1/#7's rights/launch acceptance.

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
