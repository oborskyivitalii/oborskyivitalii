# Site measurement and provider access

## Current intake — 28 October 2026

Issue #159 now owns the transferred #102/#158 work. Read-only Cloudflare RUM and
the Windsor `searchconsole` property are available in this session; the dated
18 October access limitations below are historical. The
[current receipt](../review/issue-159/2026-10-28-baseline.json) records exact query
windows, sampling and missing data. Analytics delivery precedes Terra SEO work.
This intake does not change collection, publish a release or establish indexing,
real-user classification, per-vital samples or SDK cost.

Current post-release follow-up: [#159](https://github.com/oborskyivitalii/oborskyivitalii/issues/159)
owns route coverage, QA isolation and reporting after the #102/#158 transfers;
[#103](https://github.com/oborskyivitalii/oborskyivitalii/issues/103)
owns assistant access to Google/Windsor. [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8)
retains overall measurement and Search Console acceptance. Dated evidence and
remaining gates are recorded in the [18 October audit](../review/issue-102/2026-10-18-analytics-and-search-access.md).

Owner [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8), with
[#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) retaining release
gates and [SITE-SEO](SITE-SEO.md) retaining the query/topic plan.

The maintainer's 2026-10-04 request established analytics preparation for the
selected future production host, **GitHub Pages**. [SITE-STAGING](SITE-STAGING.md)
owns the separate Cloudflare preview/staging mechanics. Analytics activation,
actual production origin/token and Search Console/provider evidence remain with
live #8/#13; preparing the adapter does not establish collected visitor data.
The [original preparation record](https://github.com/oborskyivitalii/oborskyivitalii/blob/3ca14c54824ac6b9e7225bc88429b4b8fb3bcf10/SITE-ANALYTICS.md)
preserves dated PR #10/#16 observations and the then-applicable publication pause.

## What each source can answer

| Source | Useful evidence | Boundary |
| --- | --- | --- |
| Cloudflare Web Analytics | Visits, page views, referrers and browser performance | Counts are aggregate and can be incomplete; no custom event or UTM analysis in this integration |
| Google Search Console | Search queries, pages, impressions, clicks and reported links | Requires owner verification and an accessible indexed production site; links are sampled |
| Site catalog, links and JSON-LD | Declared author/publication/topic relationships | Authored structure, not proof of Google's Knowledge Graph recognition |
| GitHub repository Traffic | Repository visits and clones | Not visitor analytics for the GitHub Pages website |

An interactive topic/link dashboard or click/conversion instrumentation is a
separate increment. Preserve the existing nine topic clusters, author identity,
the declared publication editions and distinct renditions rather than inventing a new search
graph from analytics counters. See #8's decision record and the existing SEO plan.

## Implemented source contract

Edit **`site/analytics.json`**, never generated `docs/` HTML. On 15 October the
owner's Cloudflare Web Analytics site was registered for `vitaliioborskyi.ai`
with automatic injection off; the returned public beacon identifier and exact
`https://vitaliioborskyi.ai/` URL are configured with `enabled: true` for the first
release. Historical production `prod-2026-10-17.4` was live at the 18 October audit. A bounded provider read on
18 October confirmed received pageviews; see the dated audit for counts and
coverage limits. `searchConsoleVerification` remains null because DNS verification
is already present; this optional HTML field does not establish Google ownership.
`schema: 1` and `provider: "cloudflare"` are
finite. Unknown fields, wrong types, malformed tokens or incomplete activation
fail before the last coherent public output is replaced.

`siteURL` must be the exact canonical HTTPS base URL with a trailing slash,
including the GitHub Pages project prefix when applicable. Credentials, ports,
query/fragment suffixes, local/IP hosts and noncanonical paths are rejected. Do
not use a proposed hostname as evidence that Pages is configured. The current
32-character lowercase hexadecimal Cloudflare **public site token** is the value
from the manual beacon snippet, not a deployment API token or global API key.
The optional Search Console field accepts only a bounded public HTML-verification
token and requires the production URL.

The producer adds one shared deferred local loader only when analytics is enabled.
Its `runtime/<SHA256>/analytics.js` path hashes its own bytes; it is independent of
the engine bundle. Config or adapter edits invalidate the five route identities
while unchanged theme, navigation, scenes and media retain their exact bytes.
The snapshot verifier checks the optional loader digest and dependency closure.
Explicitly retained prior snapshots keep their original loader bytes.

The adapter loads the official Cloudflare module once per document, at the exact
configured origin and declared `.html` routes, their extensionless aliases
(including `/index`), and Home `/`. The adapter derives aliases only from the
producer-declared route list. A configured project prefix remains mandatory; arbitrary
article paths and trailing-slash room paths are not admitted. File URLs, HTTP,
other origins, mismatched project prefixes, review names and immutable snapshot URLs cannot
start tracking. Archive queries and anchors do not bypass that location guard.
The provider owns automatic SPA measurement: our adapter does not wrap history
or emit a second manual page view. Persistent route changes keep one SDK instance;
a native reload starts a fresh document. SDK load success is not proof of a
reported visit. Blocked loading causes no retry loop or dependency on rendering.

All fifteen standalone review exports remove both the loader and verification
tag, including embedded route payloads. The ordinary `site/` entries in an offline
ZIP retain exact public bytes; their file-URL guard prevents a vendor request.
Disabled defaults produce no analytics asset, loader tag or analytics network call.

## Checks and limits

Node regressions cover atomic failure, strict settings, immutable retention,
engine/media byte preservation, duplicate/blocked SDK loading, origin/project
isolation and export stripping. Synthetic fixtures explicitly set their own
disabled/enabled configurations; they remain valid after the actual production
source is enabled. Missing/malformed settings or a missing enabled adapter must
fail before replacing coherent output. Source checks reject missing/duplicate
loader tags, missing verification, missing loader assets and unexpected tracking
when disabled; checking must not repair the artifact being inspected.

| Required check | Regression and CI/CD wiring |
| --- | --- |
| Settings, activation prerequisites and adapter presence | `tests/analytics.test.cjs`, explicitly in `Site runtime regressions`; also in the PR/release build's complete Node suite |
| Generated loader/verification match the actual source settings | `node tools/site/build.cjs --check`, required by runtime, PR and release workflows before packaging |
| Enabled navigation, loading failures and origin/offline isolation | Thirteen vendor-stub fixtures per engine in the existing functional jobs; missing or failed assertions block the PR/release aggregate |
| Actual provider counts, account/property setup and hosted SDK cost | Release-time owner/host checks under #8/#13; synthetic CI does not establish them |

Each existing functional engine runs thirteen
additional enabled-source fixtures: five entry routes, blocked/delayed SDK, a staging
origin and five offline entry routes. They check persistent header/Canvas, all
destinations, history, reload, filters and one vendor request per document. Each
enabled entry checks both canonical and extensionless URLs, including query/hash
suffixes, within the existing thirteen-case matrix. The
vendor is stubbed; these tests send no data and do not certify dashboard counts.
The bounded staging profile preserves seven Chromium scenarios: Home and Writing
enabled scenarios probe canonical and extensionless entries for all five routes, blocked/delayed SDK, staging
suppression and Home/Writing offline suppression. Staging and optional full
validators reject missing/invalid entry-form evidence, not just a claimed pass.
Missing fixture rows/assertions fail the existing aggregate; no #13 job is skipped.
The delayed-SDK case completes route/history/filter interactions while the SDK
response is held, then releases it. Navigation waits for DOM readiness using the
existing runner's 30-second navigation bound; fixture readiness/SDK checks retain
six seconds. Existing startup, first-paint and performance budgets are unchanged.

Cloudflare's manually embedded SDK is a mutable upstream URL, not a locally pinned
dependency or a reproducible SRI resource. Activation requires review of that
external runtime boundary. Loopback Lighthouse/motion results cannot establish
actual SDK transfer/CPU cost because the production-origin guard excludes it.
Measure the enabled hosted candidate with the real provider, preserving existing
budgets. Observe Writing query-filter history separately: automatic provider SPA
tracking may count those URL changes. Compare actual reported paths/counts before
declaring route measurement accepted. Also test Back/Forward, native reload,
tab hiding and an ad blocker; missing beacon data is a known coverage limit.

## Current provider access and operator steps

As checked on 18 October 2026, the `.ai` site uses GitHub Pages with DNS-only
Cloudflare records. Manual Web Analytics works in this configuration; edge Traffic
Analytics is a different data source. Keep automatic beacon injection off. The
public `robots.txt` and `sitemap.xml` already exist; do not create duplicates.

The current assistant session has direct Cloudflare reads. Windsor is reported
not installed in this session, and the available HYPD read-only bridge returns
`sites: []` and `accountSummaries: []`. These observations do not establish whether
the owner's provider-side accounts are connected. No exact Google property can be
queried until it appears in the authorized inventory. No GA4 tag is needed merely
to use Search Console, and Windsor is an aggregation/access bridge rather than a
browser collector.

To finish #103, make the existing Windsor connection available to this session,
or use the existing HYPD connection: [connect/reconnect Search Console](https://app.hypd.ai/sources?manage=search-console),
then [select its account](https://app.hypd.ai/sources?select=search-console).
HYPD reports an ended trial and a Free limit of one active account across platforms;
selection may be sufficient. A paid plan is not a prerequisite proposed by this PR.
Use only read access for this audit. Rediscover the inventory and copy its exact
`siteUrl` before querying; do not guess a domain versus URL-prefix property ID.

Under #8, inspect the exact existing property in [Search Console](https://search.google.com/search-console),
confirm verification, inspect `https://vitaliioborskyi.ai/sitemap.xml` submission
and representative URLs, then record impressions/clicks/queries with date range.
The Google verification TXT already exists: add or replace it only if an observed
Google verification failure requires that change. A TXT record alone does not
prove the Google property is verified, its sitemap submitted, or pages indexed.
The bridge describes `webmasters.readonly`, sixteen-month retention and finalized
search data lag of two to three days; anonymized query rows need not sum to totals.
After the article is published, inspect its actual canonical URL separately.

Cloudflare dimensions include path, referrer host (API also referrer path),
country, device, browser, OS and navigation type. Dashboard bot exclusion can help
segment data; it does not identify every automated visit or the owner's visits.
Retain raw totals and label filtered views. Query `sampleInterval` for each metric
and group: unsampled recent storage does not guarantee every query is unsampled.
Web Analytics retains recent unsampled beacon data for seven days, then aggregated
history; its documented query window is six months. Do not pool low-volume Core
Web Vitals percentiles or treat pageview sample size as each vital's sample size.

Dedicated analytics fixtures stub the vendor. The B2 source now creates the
maintained production-smoke contexts through `tools/quality/analytics-isolation.cjs`:
normal/content smoke, article-tags primary/text/failure contexts, article
normal/fallback contexts and Color. It installs a context-owned route before any
page is created, blocks service workers and aborts only the manual collector at
`https://cloudflareinsights.com/cdn-cgi/rum` (including query suffixes). The real
SDK remains loadable; requests to other hosts/paths are unaffected. Setup failure
closes the context and stops before browsing. Reports retain per-context setup,
blocked-request counts and failures, without beacon payloads. Route interception
disables the context's HTTP cache; these smoke observations are not hosted cost
or cold-performance measurements. Product adapter and public output bytes remain
unchanged.

The existing native preview/production smoke runs
a bounded contrast: actual adapter, stub vendor and a local network sink. An
isolated context blocks six synthetic attempts over entry/navigation, reload and
history; a fresh ordinary context afterward permits six to the fixture sink.
Declared article canonical/alias entries load one SDK per document; undeclared
variants do not. Draft prototype previews skip this native route; a passing prototype preview
does not supply its browser evidence. The sink serves every request locally, including the ordinary
contrast: it never supplies a production receipt. Existing blocked/delayed vendor
cases remain separate and retain their budgets.

Until their own contexts are wired and observed, optional full functional/
navigation, motion, Lighthouse/CDP and other diagnostic/owner browsers remain
possible emitters. Article/Color consumers using the shared helper are isolated
also when called from those optional suites; that does not cover their sibling
contexts. No universal zero-QA-traffic claim follows. A new page-level route or
broad context handler must not continue collector requests past the helper; use
route fallback for unmatched traffic and re-run the contrast after routing edits.
Provider destination/proxy changes require a reviewed finite predicate update.
Ordinary visitors and deliberate labelled owner/provider observations never use
this QA factory. Loopback/staging/offline origins retain the production guard.
The [28 October intake](../review/issue-159/2026-10-28-analytics-intake.md) and
[B2 review](../review/issue-159/2026-10-28-qa-isolation.md) separate implementation,
executed evidence and pending deployment/live verification. Do not delete
historical traffic by guessed geography/referrer filters. Owner visits, prior
live smoke checks, blockers and the extensionless entry gap limit the baseline.
Real-provider SPA/filter/history receipt, individual vital sample sizes and hosted
SDK cost remain live acceptance work after deployment, under unchanged budgets.

## Fixed-window report procedure

Inputs are an inclusive UTC start, exclusive UTC end, exact discovered provider
site/property and a declared page selection. Keep the unmodified query/response,
retrieval time, source/artifact SHA, requested/returned dates, filters, dimensions,
sampling and any provider errors. Copy the sanitized query templates from
[the baseline JSON](../review/issue-159/2026-10-28-baseline.json), replace both
literal window endpoints with the selected interval and resolve account/site tags
through the authorized inventory. Do not publish credentials or opaque account
identifiers. A read-only GraphQL POST is a query, not a configuration change.

1. Run `cloudflare.queries.total`, `.browsers` and `.segments` independently. The
   latter returns direct-filter non-ChromeHeadless totals and path groups. Preserve
   each row's `sampleInterval`; do not subtract independently sampled totals to
   invent an exact cohort. The templates use only fields actually returned in B1.
2. Read the exact tested/released `artifact.json` from its immutable artifact:
   room IDs come from `components.routes` and their HTML must exist in `files`;
   article paths come from `components.articles`. A descriptor does not expand
   the adapter allowlist: admit only declared aliases accepted by the compiled
   loader; retain immutable snapshot paths separately as untracked paths. The public `site-revision.json` has a different schema
   (`routes` and optional top-level `articles`); it is not an artifact manifest.
   Match `requestHost` and `requestPath` rows locally against that inventory. Keep
   `/`, `/index.html`, declared extensionless aliases and supported article aliases
   as separate raw paths. Record unmatched rows. Never invent a trailing-slash
   article alias or add an unpublished article to the selection. Path-group counts
   describe loads; they do not turn property visits into page-level unique people.
3. Retain property-wide raw totals alongside the selected-page load table. A
   locally selected table is not a new provider query/cohort. With the baseline's
   100-group query limit, a response at the limit has unknown completeness; narrow
   the interval or use the provider's documented pagination before claiming complete
   paths. Missing path rows mean unavailable/unobserved, not a proven zero.
4. Record referrers separately when the authorized dashboard/API exposes them.
   Keep known external hosts, same-site hosts and direct/empty/unknown apart;
   preserve the provider's actual labels. B1 did not query a referrer field and its
   receipt cannot reconstruct this breakdown. If access/schema or rows are absent,
   record `unavailable` and that reason; never infer referrers from browser/country.
5. Rediscover Windsor `searchconsole` inventory/options. Request `date`, `clicks`,
   `impressions`, `data_fetched_at` for the exact property and inclusive calendar
   dates corresponding to the intended GSC period, with
   `options: {include_fresh_data: false}`. Record the connector-default search type
   unless explicitly selected. Returned dates govern observed coverage; UTC RUM
   boundaries do not establish GSC timezone equivalence. Run a separate page query
   when needed; URL impressions are not additive to property impressions. Missing
   dates/query rows remain unknown, not zero; clicks are not leads.
6. Repeat with identical inputs and retain both retrieval times/query definitions.
   Explain changed coverage, sampling or provider freshness instead of replacing
   the first receipt. Offline replay of the saved baseline is only a method check:
   all-browser 427 loads/166 visits, direct non-headless 163/144, and finalized GSC
   returned dates 21–26 October with 1 click/17 property impressions. It is not a
   fresh provider query. Provider visits are not unique people; non-headless is not
   human-only. Query/source definitions stay separate across platforms.

For B3 record the actual isolation rollout time and independent SEO rollout time.
Compare equal elapsed windows with unchanged source/filter definitions; show raw
and segmented views and label changed sampling, missing coverage and cohort breaks.
Allow provider finalization before calling a period complete. Residual automation
and owner visits remain. Neither a count decrease nor the later SEO cutover proves
causal improvement. Separate per-vital sample counts and hosted SDK cost require
their own live evidence; absent INP is unavailable rather than a good result.

After the future article is actually published, #5 AC08/AC17 with #2 owns its
canonical/declared-alias entry, history/filter/reload, one-SDK and labelled provider
receipt. Select only its actual manifest paths in the report above; record exact
release/actions/time and request versus received-aggregate limits. #8 owns organic
visibility and #104 conversions using this same isolation boundary. Fixture
readiness does not publish the article or implement conversions.

## Activation and later reconfiguration

1. Finalize the actual GitHub Pages URL and release/canonical/sitemap setup under
   #8. Production activation requires the applicable maintainer release decision.
2. In the owner's Cloudflare Web Analytics account, register that hostname and
   obtain its manual JavaScript snippet. Set the exact `siteURL` and public `token`,
   then `enabled: true` in a reviewed change. Leave provider-side automatic
   injection off so the same site does not receive two beacons. No DNS/proxy or
   paid purchase is needed for this manual integration.
3. Optionally create a Search Console **URL-prefix** property for that exact base
   URL and set the owner's HTML-tag token. A DNS Domain property needs separate
   domain ownership. Commit the tag, then verify through Google after the site is
   reachable; merely rendering the tag does not verify ownership or indexing.
4. Regenerate public output, review exports, bundle manifests and RI; rerun the
   existing exact-artifact gates. Keep tokens for deployment/access out of source.
   If scans flag a public beacon/verification identifier, review that exact finding
   against the owner's public snippet/tag; never add a blanket token exclusion.
5. After authorized hosting, complete the real-provider checks above and record
   URL, source/artifact identity, tested routes, observed counts and limitations
   in #8/#13. Production release, independent/device/rights acceptance and analytics
   acceptance are separate records. Never submit staging for indexing.

Primary documentation (Cloudflare dimensions/FAQ rechecked 2026-10-18):
[dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/),
[manual setup](https://developers.cloudflare.com/web-analytics/get-started/),
[automatic SPA tracking](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/),
[provider limits/FAQ](https://developers.cloudflare.com/web-analytics/faq/),
[Search Console verification](https://support.google.com/webmasters/answer/9008080),
[Search Console performance](https://support.google.com/webmasters/answer/7576553),
[reported links](https://support.google.com/webmasters/answer/9049606),
[GitHub repository Traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository).
