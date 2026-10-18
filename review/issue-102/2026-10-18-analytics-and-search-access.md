# Issue 102 — 18 October 2026 analytics and search access

Owning issue: [#102](https://github.com/oborskyivitalii/oborskyivitalii/issues/102),
18 October combined scope/style decision. Related access owner:
[#103](https://github.com/oborskyivitalii/oborskyivitalii/issues/103); measurement
and Search Console umbrella: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
Role: Codex implementation and self-review, not independent review.
Baseline main: `3af9100989c7dd6edc18b0b94c2d59f177cfd465`, accepted production
`prod-2026-10-17.4`. Prepared candidate is separate from PR79/article work;
the PR and acceptance artifact identify the final tested tree.

## Intent and acceptance

The maintainer authorized plan items 3 and 4 in one separate Draft PR. Fix missing
analytics on currently served extensionless room addresses and record actual
provider access. Article prose, reader registration, publication, account changes,
merge and production deployment are outside this delivery. No duplicate issue is
needed. Do not close #102, #103 or #8 from source tests alone.

## Findings

| ID | Evidence | Finding and implication | AC / disposition |
| --- | --- | --- | --- |
| F01 | GETs without JavaScript: `/index`, `/research`, `/writing`, `/talks`, `/credits` return 200; `/writing/` returns 404 | Released adapter checks only canonical `.html` paths and Home `/`; direct aliases miss collection | #102 AC01–02: source fix prepared |
| F02 | `site/integrations/cloudflare.cjs` | Match the exact declared pathname or that declared `.html` pathname with its suffix removed. Finite producer inventory, HTTPS/origin/prefix guard and one persistent SDK remain | #102 AC01–02: meaningful positive/negative tests |
| F03 | [Sanitized provider evidence](2026-10-18-provider-evidence.json), read 18:46:25 UTC | Cloudflare receives events; current coverage and traffic provenance limit interpretation | #102 AC03–04: baseline below; live acceptance pending |
| F04 | Current plugin inventory; HYPD `list_sites` and `list_account_summaries` | Windsor unavailable in this assistant session; both Google inventories empty. Provider-side setup is unobserved, not disproved | #103 AC01 pending; AC02 precise operator route documented |
| F05 | HYPD server description and init | GSC bridge is `webmasters.readonly`; Free plan has one active account after ended trial | #103 AC03–04: no paid-plan or new GA4 recommendation |
| F06 | Existing production `robots.txt`, `sitemap.xml` and previously verified DNS TXT | Missing sitemap/verification-field assumptions are stale. Google verification, submission and indexing still require exact property access | #8 remains open |

## Bounded production baseline

Cloudflare GraphQL `rumPageloadEventsAdaptiveGroups`, exact registered `.ai`
site filter, `[2026-10-17T21:45:59Z, 2026-10-18T18:00:00Z)`, queried at
2026-10-18T18:46:25.439Z. Total `count`: **174 pageviews**; `sum.visits`:
**154 visits**. `avg.sampleInterval` is **1** for total and every path row.

| Received path | Pageviews |
| --- | ---: |
| `/` | 93 |
| `/writing.html` | 58 |
| `/talks.html` | 10 |
| `/research.html` | 9 |
| `/credits.html` | 4 |

Visits are provider-defined entry/referrer-based visits, not unique humans,
qualified leads or conversions. Pageviews include provider SPA measurements;
filter/history URL changes need separate observation. The missing alias rows are
consistent with the source defect, not proof that nobody visited those URLs.
No data is backfilled by this fix. Owner and earlier live-smoke contamination
cannot be quantified from this aggregate read, and no guessed country/referrer
exclusions were applied. CI browser fixtures stub the vendor; this audit's GETs
execute no JavaScript and its provider queries create no events.

This query establishes sampleInterval only for these pageview/visit/path groups.
No current per-vital samples or hosted SDK CPU/transfer cost were measured. Keep
the earlier small-sample performance observation historical; do not pool its
percentiles or claim statistically stable audience/performance conclusions.
Cloudflare documentation confirms dimensions including path/referrer/device/OS/
browser/country/navigation, adaptive query sampling, seven days of recent
unsampled storage and aggregated history. This product has no custom-event or
UTM reporting; conversion instrumentation remains separate #104.

## Google and Windsor next action

Make the owner's existing Windsor connection available in this assistant session,
or reconnect/select the existing Search Console source in HYPD. Exact links and
least-privilege operator steps are in [SITE-ANALYTICS](../../guides/SITE-ANALYTICS.md#current-provider-access-and-operator-steps).
An ended trial can leave the intended source inactive under the one-account Free
limit. Do not buy a plan or install GA4 merely to fill an inventory.

After `list_sites` returns an authorized property, use its exact returned
`siteUrl` for a bounded read. Under #8 record property verification, sitemap
submission, indexing/representative URL inspection and dated search totals.
Until then GSC impressions, clicks, queries and actual sitemap/indexing state are
**unavailable to this session**. No property ID or access token is invented or
published. The null HTML-verification field is compatible with DNS verification.

## Decisions and execution

| Task | Owner / behavior | Check | Status |
| --- | --- | --- | --- |
| T01 | Analytics adapter finite aliases; no engine, producer, CSS, history hooks or timers changed | Maintained `tests/analytics.test.cjs` | 12/12 initial checks passed; final clean acceptance records exact tree |
| T02 | Existing thirteen browser scenarios per engine visit canonical then extensionless enabled entries, with query/hash, subsequent history/filter/reload and one SDK per document | `tools/quality/analytics-browser.cjs` | Scenario source updated; local browser unavailable, download returned invalid ZIP; actual browser execution pending |
| T03 | Runbook distinguishes collector, Google ownership and aggregation bridge; bounded sanitized evidence | Dated provider reads plus self-review | Prepared; Google/Windsor account action remains external |
| T04 | Regenerate public/offline artifacts; maintain catalog, RI, coupling and policy | Basic, source/style/RI checks and issue policy | Final results linked by PR and exact-source acceptance artifact |

The adapter is independently hashed. Keeping matching there preserves the
producer and engine identities; existing engine/media bytes remain unchanged.
All five hosted HTML/snapshot dependencies and generated review/bundle identities
are regenerated. Existing budgets, staging isolation and protected release gates
remain. Future article canonical paths must come from the reader's declared
registration contract; no wildcard or unpublished article route is admitted.

## Local validation

- Focused Node contracts: **69/69**, zero skips/failures across analytics,
  architecture, build cohesion, functional fixtures and profile selection.
- Basic: passed all source/artifact/geometry/size checks, fourteen theme/archive
  cases plus ten flight cases. Largest hosted HTML: **95,111 bytes** against
  the unchanged 100,000-byte limit.
- Repository Intelligence regressions **28/28**, coupling **20/20**, current
  RI freshness, bounded code-style guard and full pinned formatter check passed.
- Engine identity remains `d698a6c7db0821170873540183fb4443e3c84a65b1daee7f5368add4d2d7a9cb`;
  producer/assets fingerprints equal released main. Only integration behavior and
  its dependent public route/snapshot identities change.
- Existing browser execution is pending: no local browser was installed and the
  pinned Playwright headless-shell download failed with an invalid ZIP. No
  browser, provider SPA or hosted cost pass is claimed. Ready-source/hosted CI
  remains a required gate; this PR stays Draft.

The final clean-source owning-policy report is recorded in the PR against the
exact candidate tree. Earlier intermediate checks exposed a missing local AST
parser setting and stale intermediate generated output/catalog; the toolchain
path and coherent regeneration were corrected before the passing results above.

## Acceptance evidence and remaining gates

| Criterion | Deterministic evidence | Remaining gate |
| --- | --- | --- |
| #102 AC01 | Canonical + alias guard cases at root/project prefix; unknown, trailing-slash, article, staging, snapshot, offline and wrong-origin negatives | Deployed exact candidate and future article registration |
| #102 AC02 | Existing duplicate/blocked/fixture producer tests; expanded existing browser scenarios | Actual browser run and real-provider SPA/filter/history receipt |
| #102 AC03 | Timestamped provider JSON; Basic/style/RI/coupling policy checks | Review baseline limits and code style beyond bounded guard |
| #102 AC04 | Updated runbook, isolation/byte-budget checks | Per-metric vital samples, hosted SDK cost and live acceptance |
| #103 AC01 | Windsor session inventory and empty Google lists observed | Intended connector/property actually available |
| #103 AC02–04 | Precise missing connection/selection action and read-only scope/limits documented | Successful exact-property read; operator validation |

Policy: `.github/acceptance/issue-102.json`. The adapter unittest selects the
maintained analytics suite through the existing bounded TAP-accounting runner;
it does not duplicate behavioral tests. Its task snapshot runs only via this
policy. Permanent guard tests and existing hosted scenarios keep their current
PR/staging/production routes. Self-review applied CS01/CS04/CS05 ownership and
readability, CS06/CS07 bounded lifecycle/cost, CS08 meaningful negatives and
CS09/CS10 bounded guard/evidence. CS02/CS03 content/CSS owners are untouched.
Independent review, browser/live acceptance, merge and deployment are unclaimed.

## Issue synopsis and release sequence

One Draft PR owns #102 and carries #103/#8 access evidence. Release this small
analytics correction when its source/hosted gates pass; it need not wait for the
article. Keep PR79's editorial/reader work independent. If the maintainer chooses
one later release, merge accepted changes normally and stage the resulting exact
combined artifact; checks on separate PRs do not certify the combined source.


## Later 18 October — staging regression protection

The maintainer authorized advancing PR105 and explicitly requested regression
protection. Existing staging selected only Home/Writing enabled entry scenarios;
the optional full validator did not require the new `entryForms` evidence.
The follow-up probes all five canonical/extensionless enabled entries inside
the existing **seven** staging scenarios: Home owns Home; Writing also probes
Research/Talks/Credits. Blocked/delayed SDK, staging suppression and Home/Writing
offline scenarios remain. Optional full remains **thirteen per engine**. No performance
budget, engine/media/content/producer or production configuration changes.

A shared entry-form validator now rejects missing, partial, duplicated or invalid
evidence in both staging and optional full aggregation. The existing negative
report mutations cover omission/canonical-only/duplicate-canonical evidence;
registry tests separately require all five enabled entries. Existing SDK count,
offline/origin/history/filter and delayed-vendor assertions remain. All vendor
traffic is stubbed; these checks cannot establish real provider receipt.

The owning policy reuses the maintained analytics, staging regression, staging
gate and full-report validator suites. Initial focused hardening run: **86/86**,
zero skips/failures. Final clean-source policy and actual CI/preview/staging
results are recorded in PR105 and the issue, keeping the validated source fixed.
Prior local browser-install failure remains historical; CI owns actual execution.

Next delivery phase: move the unchanged implementation to ready source admission,
then the existing owner staging controller after exact raw-head source/RI/owning
checks pass. Stable staging, evidence-only regression, merge and production remain
separate states. No merge or production activation is authorized by a green test.
#103 connection/property access remains external and does not block deterministic
analytics regression. Operator action is to make the existing intended Windsor
source available, or reconnect/select the Search Console source in the existing
read-only bridge; never add a second collector merely to get an inventory.


Controller compatibility was inspected before staging execution: released main's
promotion validator requires seven stageContract1 analytics rows. The final
candidate preserves that coverage schema and expands the observed entries inside
the enabled scenarios. Both candidate validators require exact `entryRoutes`
and `entryForms`; negative report mutations remove a route or entire evidence.
The all-five direct-entry coverage is unchanged from the proposed ten-row form.
No knowingly incompatible stable-staging run or controller bypass was performed.
