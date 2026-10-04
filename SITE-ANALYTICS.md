# Site measurement before the first release

Owner [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8), with
[#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) retaining release
gates and [SITE-SEO](SITE-SEO.md) retaining the query/topic plan.

The maintainer's 2026-10-04 request authorizes preparing analytics now. Production
hosting is **GitHub Pages**; Cloudflare Pages remains a possible future staging
host. All publication is still paused. No account, live hostname, token, verified
Search Console property or collected visitor data is claimed. This focused Draft
branch stacks on PR #16's frozen `4d4c609`; PR #10 remains frozen at `da06b6d6`.

## What each source can answer

| Source | Useful evidence | Boundary |
| --- | --- | --- |
| Cloudflare Web Analytics | Visits, page views, referrers and browser performance | Counts are aggregate and can be incomplete; no custom event or UTM analysis in this integration |
| Google Search Console | Search queries, pages, impressions, clicks and reported links | Requires owner verification and an accessible indexed production site; links are sampled |
| Site catalog, links and JSON-LD | Declared author/publication/topic relationships | Authored structure, not proof of Google's Knowledge Graph recognition |
| GitHub repository Traffic | Repository visits and clones | Not visitor analytics for the GitHub Pages website |

An interactive topic/link dashboard or click/conversion instrumentation is a
separate increment. Preserve the existing nine topic clusters, author identity,
27 primary editions and distinct rendition rather than inventing a new search
graph from analytics counters. See #8's decision record and the existing SEO plan.

## Implemented source contract

Edit **`site/analytics.json`**, never generated `docs/` HTML. Its committed defaults
are `enabled: false`, `siteURL: null`, `token: null` and
`searchConsoleVerification: null`. `schema: 1` and `provider: "cloudflare"` are
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
configured origin and finite five page paths or Home `/` path. File URLs, HTTP,
other origins, project prefixes, review names and immutable snapshot URLs cannot
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
destinations, history, reload, filters and one vendor request per document. The
vendor is stubbed; these tests send no data and do not certify dashboard counts.
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

## Activation at release time

1. Finalize the actual GitHub Pages URL and release/canonical/sitemap setup under
   #8. Retain the all-publication pause until a later maintainer release decision.
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

Primary documentation checked 2026-10-04:
[manual setup](https://developers.cloudflare.com/web-analytics/get-started/),
[automatic SPA tracking](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/),
[provider limits/FAQ](https://developers.cloudflare.com/web-analytics/faq/),
[Search Console verification](https://support.google.com/webmasters/answer/9008080),
[Search Console performance](https://support.google.com/webmasters/answer/7576553),
[reported links](https://support.google.com/webmasters/answer/9049606),
[GitHub repository Traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository).
