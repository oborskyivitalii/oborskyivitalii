# Site check profiles

Maintainer amendment, 5 October 2026. Owner #13; navigation/motifs #14 and #12.
Supersedes older always-full local/PR requirements; all budgets remain unchanged.

Staging is now authorized. The connected provider has uploaded the immutable
[preview](https://505498da.oborskyi-author-ci-staging.pages.dev) in `oborskyi-author-ci-staging`, from source
`51611505d941ae2996a87782840da418722451f6` using verified successful basic CI
artifacts. This bootstrap is separate from protected-main Actions automation;
the full staging profile has not run and the stable alias has not been promoted.
See [SITE-STAGING](SITE-STAGING.md) for actual evidence and pending owner setup.

| Profile | When | Work |
| --- | --- | --- |
| Local/basic | Local edits and each PR update | Generated-source freshness, standalone executable syntax, footer routes, finite shared motifs, 10 flight/input tests and size/transfer budgets. |
| Staging/full | Immutable version uploaded, before stable-alias promotion | Full source/security/advisory checks; HTTPS/served bytes/MIME/redirects/404/noindex; three-engine theme/viewport/accessibility/failure matrix; Windows/macOS smoke; Lighthouse, CPU ×4, soak, captures. |
| Production/full | After deployment | Same full automation on the actual production URL/project path; exact served edition and production indexing checks. |

Default: `node tools/quality/local.cjs`. It needs no browser installation, advisory
feed, Lighthouse or soak. For a relevant short UI check, export the standalone
with `review/site-scroll-sync-20261004/export.cjs` and run
`tools/quality/local-browser.cjs HTML REPORT_DIRECTORY` with installed Chromium.
The two-width smoke checks primary travel, Talks/Credits boundaries, footer and
history access, persistent header/Canvas, removed filtering and Motion Off.

`site-checks.yml` runs basic checks once and uploads an immutable artifact and
basic gate. `site-runtime-checks.yml` and the Windows/Firefox
`site-navigation-probe.yml` are manual diagnostics, avoiding duplicate PR runs.
`navigation.yml` now checks RI freshness only: its older Python/runtime/
export suites duplicated the basic/full profiles and are removed from that job.
All those suites remain in the full release build. `site-staging.yml` uploads a candidate, performs host smoke, then calls
`site-release-checks.yml` against that exact deployed version with the full suite.
It reuses the basic artifact; it does not regenerate deployment bytes. Missing
jobs/reports, a wrong origin or a served digest mismatch fail the gate. Stable
promotion requires that gate and repeats the lighter stable-alias recovery checks.

The inactive Pages example reuses successful staging automation plus existing
independent/device acceptance before promotion, then calls full automation on
production. Cross-run downloads retain the immutable artifact and owning run IDs.
Local reports cannot satisfy a hosted gate. The analytics adapter fixtures still
use controlled vendor stubs; they do not establish live dashboard reporting.

Physical Safari/Android and independent/rights acceptance keep their existing
release role. Protected-main Actions setup, stable staging promotion, production
recovery and passive ZAP remain #8 work. The current change removes the explicit
staging pause guards; repository opt-in and protected-main/environment checks
remain. H1 is in Draft #18 rather than main, and GitHub administrative setup is
pending. Production deployment stays disabled. A live preview or hosted smoke
does not satisfy the full profile or remove #18's measured performance failures.

## Reviewed engine continuation, 5 October 2026

Basic and full gate artifacts have separate immutable names. All stage reports
include profile, run ID and attempt; their downloader selects the same namespace.
Consumers keep returned immutable IDs. The cheap local workflow contract also
checks staging/production composition and reruns without installing a browser.

The existing finite motif check now inspects object vertices and every line
endpoint, and reports bounded faces/lines/vertices/serialized model bytes. It does
not add another local suite. Full performance checks identify the exact variant
and reject missing transition preparation/readiness data. See the new limits in
`tools/quality/budgets.json` and the rationale in the execution record.
