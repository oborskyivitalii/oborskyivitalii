# Issue 159 — analytics P1 intake, 28 October 2026

Owner: [issue 159](https://github.com/oborskyivitalii/oborskyivitalii/issues/159).
Iteration B1; implementer self-analysis, independent results below.
Base `9318a54a684079bb23e5dadcfa4bf705d6783dd0`, tree
`cfffed1f2b5619cb1476beafa658be9cc2c04fe2`. Draft PR link and final
tested candidate identity will be recorded after review/push.

## Intent and acceptance

The latest instruction orders analytics production delivery/verification before
Terra SEO work, superseding earlier parallel research. Two sequential release
PRs retain owner 159 and policy AC01–AC18. B1 delivers baseline receipts, emitter
inventory, isolation design and policy/CI prerequisites. No telemetry/runtime,
public content or production bytes change in B1. All 46 implementation conditions
remain open; invariant tests cannot implement isolation, fulfil SEO or authorize
merge/release. B2 implements the mechanism/report; B3 supplies production evidence.

## Provider baseline and access

[Actual sanitized receipts/query templates](2026-10-28-baseline.json) retain
requested/returned windows, fields, sampling and connector timestamps. Discover
the omitted opaque account/site identifiers from the authorized inventory before
substituting template placeholders. No credentials/user-level payloads are saved.

| Source/cohort | Window | Reported result | Limit |
| --- | --- | --- | --- |
| RUM all browsers | UTC `[2026-10-21, 2026-10-28)` | 427 loads / 166 visits | sampleInterval 1.0648379052369077; not an exact event log |
| RUM ChromeHeadless | same | 264 loads / 22 visits | sampleInterval 1.1092436974789917; cannot attribute historical CI jobs |
| RUM non-ChromeHeadless | same | 163 loads / 144 visits | sampleInterval 1; not human-only or unique people |
| GSC property/day | requested 21–27 Oct | 1 click / 17 impressions, returned 21–26 Oct | missing 27 Oct is unknown; connector-default search type |

The registered site matches production and manual injection (`auto_install:false`).
Selection is exact site, with no extra host/path filter; returned host groups all
name `vitaliioborskyi.ai`. Preserve `/index.html` and `/` separately in raw provider
evidence. RUM watermark/cache freshness was not exposed. GSC URL impressions are
not additive to property impressions. No query/audience research was performed.
Referrers, separate per-vital samples and hosted SDK cost remain pending.

Failed access observation: `__type(name:"Account")` returned null; broad schema
introspection depleted the rate budget with a five-minute cooldown. After the
provider-directed cooldown, changed bounded RUM aggregate/browser/path queries
succeeded. No unchanged failed campaign was rerun or historical count substituted.
API reads execute no browser JS and manufacture no pageviews. No telemetry edit
preceded this baseline.

## Source-bound emitter inventory

These are verified source capabilities, not newly executed production beacons.

| Entry/consumer | Source | Current behavior |
| --- | --- | --- |
| Required production smoke | `site-production.yml` → `local-browser.cjs::main/scenario` | Passes live origin into four Chromium desktop/mobile normal/no-Canvas contexts. `analyticsRequest` permits/records configured SDK/collector requests; no suppression or positive ingestion assertion. |
| Article tags | `article-tags-browser.cjs::journey` from smoke | Independent primary/failure contexts visit Writing; no production collector isolation. |
| Native article | `article-browser.cjs::normalJourney/fallbackJourney` | Separate Writing/article contexts; JS-enabled variants can emit; no-JS does not run loader. Real unpublished article evidence remains #5/#2. |
| Content smoke | `local-browser::contentJourney` | Writing contexts disable JS; article branch calls separate emitting-capable journeys. |
| Color | `local-browser::main` → `color-browser::main/scenario` | Separate browser/context lifetimes, no collector isolation. |
| Analytics fixtures | `analytics-browser::scenario` | Synthetic config, stub vendor and aborted unknown externals; cannot establish production ingestion. |
| Stage/preview/offline | Adapter and edition/export owners | Exact-origin/declared-route and stripping/file guards; fixture/source checks retain their limited oracle. |
| Optional production regression | `site-release-checks.yml`, functional/motion/Lighthouse and collectors | Live target propagates to additional Playwright/CDP contexts; residual known automation until explicitly handled and observed. |
| Owner/unknown automation | Outside maintained runner inventory | Browser/IP/country/referrer guesses cannot safely delete history or identify every emitter. |

## B2 minimal isolation decision

Prefer explicit test-context **collector interception**, installed before page
creation/navigation and propagated through all smoke child contexts. Preserve
real SDK loading for enabled/cost tests; suppress the identified synthetic
collector egress with one finite actual provider origin/path predicate. Ordinary
site requests/lookalike hosts must not match. Keep product adapter/producer bytes
unchanged unless an evidenced implementation limitation requires reviewed change.
No blanket headless/`navigator.webdriver` block or product storage marker.

Use explicit helper/call-site wiring and context-owned cleanup, not process-global
browser monkey patches or new timers/history hooks. If isolated setup fails,
stop before browsing. Contrast with a fresh ordinary unmarked context. Required
tests cover suppression through reload/history, no cross-context leak, setup
failure and exact predicate negatives; preserve blocked/delayed SDK journeys.
Retain a separate deliberate bounded real-provider receipt, not a bypass for the
whole regression. A Playwright helper does not cover Lighthouse/CDP automatically:
map those consumers before claiming full isolation, keeping residual sources named.

## Policy, checks and source/style

The new policy keeps all 18 source-mapped criteria. Existing gate-only semantics
leave P2/human/provider obligations `manual-only-pending`. ANALYTICS exercises
maintained guards, not the unimplemented mechanism; CATALOG/SEO prove current
preservation, not new copy usefulness. Do not reuse #102's frozen 159-finding
public-metadata test as a general current-head gate.

The workflow installs existing locked quality/Python tools for 159 and the locked
article AST dependencies used by catalog fixtures. No dependency versions, runner
schema, budgets/deadlines or release permissions change. Draft automatic acceptance
remains skipped; explicit dispatch/local exact-source reports remain necessary.

Applicable CS01/04/05/08/09/10 cover configuration ownership/readability, meaningful
verification, bounded guard and evidence; CS07 budgets remain fixed. Product
content/CSS/lifecycle rules CS02/03/06 are unchanged and must be reassessed in B2.
New paths are catalogued and RI/coupling regenerated. Runtime changes stay B2.

## Independent role executions and QA

First policy run is preserved in `2026-10-28-b1-failed-policy.json.gz` with its
exact dirty-source identity/accounting: Basic/STYLE/RI/RI-CI passed; SEO selected
the wrong class, while ANALYTICS/CATALOG fixture clones lacked historical blobs
from this `blob:none` checkout. The actual SEO class is
`Issue41ImplementationTests`; the selector was corrected, with no assertion
change. Materialize the exact old catalog and five frozen HTML blobs before the
bounded corrected run; test children intentionally disallow lazy network fetch.
The formatter's first invocation also refused an untracked new policy; staging
the declared files resolved that inventory prerequisite (533 files then passed).
No failed result is replaced by a later successful report.

The corrected dirty run passed six of seven checks; CATALOG exposed one further
missing immutable `32983b0441eca6233667e2d1717a0b1920929f11:docs/research.html`
blob in its shared fixture. The later root SEO verifier materialized that same
maintained historical dependency; an explicit `GIT_NO_LAZY_FETCH=1 git show`
then confirmed availability before the next fixture run. The corrected report
and earlier RI regression logs are preserved in `2026-10-28-b1-diagnostics.json.gz`.
Those RI regressions observed stale views/coupling before final regeneration;
finish all source/RI writes before the stable current-candidate run. Neither
failure requires altering product code, historical pins, assertions or deadlines.

| Role | Execution | Result / scope |
| --- | --- | --- |
| Requirements | `analytics_requirements` | Preflight accepts analytics-first scope; baseline/design prerequisites; final candidate review pending |
| Code / artifact | pending | Actual policy/workflow/receipt/design delta |
| White-box QA | pending | Structural/check-allocation and meaningful future mechanism negatives |
| Exploratory / operator | pending | Reporting/policy/operator steps; no production browser execution in B1 |

Final exact source, actual checks/accounting, dispositions and review receipts
are appended after execution. No whole AC is ticked from partial evidence.

## Next batches and plan change

B1 intake → B2 isolation/reporting + staging/control checks → B3 authorized
analytics production/live baseline → B4 Terra → B5 SEO/briefs/staging → B6 SEO
production → B7 full reconciliation. The only sequencing refinement is the user's
explicit no-parallel-Terra instruction. Stable scope/IDs/budgets and actual
maintainer release decisions remain; this Draft PR is the analytics execution route.
