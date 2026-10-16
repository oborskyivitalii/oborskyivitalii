# GitHub Pages production and custom domains

Owner: [issue #39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
[Draft PR #40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40), under
hosting #8, release #13 and launch #1. Current execution plan:
[implementation and remaining launch work](../review/issue-39/2026-10-15-implementation.md).
Release implementation is owned by [release gates](SITE-RELEASE-GATES.md);
the existing [staging controller](SITE-STAGING.md) remains the delivery route.

## Target and current state — 15 October 2026

Main `cc115c4241197d59205934bdc18f209109d5ee87` already implements production
metadata, a frozen candidate, full evidence, immutable archives, a protected
publisher and rollback. It has live two-host staging. Those mechanisms must be
reused; source implementation and staging success do not admit production.

| Role | Current address / state | Target |
| --- | --- | --- |
| PR preview | Cloudflare immutable candidate plus `pr-N` alias | Existing preview route |
| Permanent staging | https://staging.oborskyi-author-ci-staging.pages.dev | Unchanged |
| Pages staging | https://oborskyivitalii.github.io/oborskyivitalii/staging/ | https://vitaliioborskyi.ai/staging/ |
| Production | No accepted production in the live Pages receipt | https://vitaliioborskyi.ai/ |
| Alternate domains | Routing/redirect not applied in the dated API inventory | .com/www.com one-hop 301 to .ai; www.ai to apex |

The combined Pages package owns one production root and one staging subtree.
Custom-domain binding changes that site's origin; an independent github.io
staging site would require a separate repository/site. Before binding, prepare and test an authenticated, recoverable migration;
authenticate and retain the old project-prefix receipt and package first.
Execute the transition once the canonical origin is available. Ordinary origin/base-path validation stays strict.

PR40 now prepares explicit Color production support, the authenticated Pages
migration, absolute social images, retained-file preservation and candidate-bound
rights reports. The exact reviewed Color runtime bytes, animation budgets and
fallbacks are preserved. Source tests prepare these paths; actual merged-main
execution and the full frozen-candidate gate remain required.

[Desired DNS/rule payload](github-pages-domains.json) is the original finite
preparation manifest, not a live controller or current settings inventory. Its
ownership/bootstrap sequence is historical; ownership is already complete.
The [7 October inventory](../review/issue-39/2026-10-07-provider-inventory.json)
and [10 October audit](../review/issue-39/2026-10-10-readiness.md) retain evidence
for their dates. The current report supersedes their missing-pipeline claims.

## Who can perform each action

| Action | Agent through current plugins | Maintainer |
| --- | --- | --- |
| Repository branch/PR/source preparation | Available | Review/merge under current release controls |
| Cloudflare DNS/redirect/TLS inspection | Read access observed in the dated audit | No repeated TXT setup |
| Cloudflare routing/redirect updates | Capability advertised; re-read before authorized cutover | Review concrete release/cutover |
| Personal Pages ownership | Verified confirmed by maintainer on 10 October | Complete |
| Repository Pages source/domain/HTTPS | Administration endpoint unsupported by the current connector | Apply settings at the tested cutover step |
| Environments/App/protection/variables | No supported connector administration route established | Follow the existing release setup, then verify actual settings |

Repository admin permission does not make an unsupported endpoint callable.
Secrets belong in GitHub settings; do not paste App credentials into chat.

## Step 1 — ownership proof (completed)

The maintainer confirmed **Verified** for **vitaliioborskyi.ai** in
[personal Settings → Pages](https://github.com/settings/pages) on 10 October.
Keep `_github-pages-challenge-oborskyivitalii.vitaliioborskyi.ai` permanently:
record `466edebf239247c914621e5e5d3e858d` was created with the supplied exact value
on 7 October and observed again in the dated API audit. Do not generate, replace
or request it again. Ownership is separate from repository custom-domain binding.
No .com GitHub verification is needed for a redirect-only domain.

## Step 2 — finish delivery preparation on the existing PR

1. Rebase PR40 onto current main and preserve authored content/runtime bytes;
   retain historical audits and map AC01–AC05 to current implementation scope.
   The dated scope amendment permits delivery changes; live gates stay.
2. Support Color through production candidate/edition/evidence and the exact
   reviewed runtime selector. Reuse the existing full matrix and budgets.
3. Implement an explicit authenticated project-prefix → canonical-root migration
   in the existing Pages controller route. Authenticate and retain the accepted
   old receipt, run, package and settings **before** custom-domain binding. Its
   old github.io origin may redirect afterward. Preserve staging files, update
   the receipt/404/base path and test both success and compensating recovery.
4. Independently review delivery changes and run raw-head source/RI/owning checks.
   Current main's exact Color registry must first admit the new reviewed family;
   otherwise its Pages browser smoke rejects the new tuple after deployment.
   Use bounded PR preview evidence while preparing that compatibility integration;
   then obtain ordinary two-host staging at the current prefix and integrate the
   unchanged admitted tree through the protected main route when authorized.
   The implementation report records the reproduced callchain and explicit
   maintainer decision boundary; do not dispatch a known-failing `/stage`.
5. Freeze the resulting exact main through `site-release-candidate.yml` and pass
   its retained artifact/run/digests/immutable URL to `site-candidate-evidence.yml`.
   The current controller requires the candidate to be current protected main;
   an unmerged PR head cannot substitute. Full candidate validation must consume
   the frozen bytes without rebuilding after admission.
6. Reconcile source-bound independent, rights and device evidence under the
   existing release owners. Preserve previously supplied permissions and their
   edition boundaries. The actual Cloudflare manual beacon is configured and
   enabled in source for the canonical production origin only. Staging and review
   exports strip it. Complete actual provider/count/cost checks at release;
   Search Console follows its reachable-origin/access-dependent route.

Detailed task ownership, dependencies and pass conditions are in the current
report and [selected issue audit](../review/issue-39/2026-10-15-release-issue-audit.md).
The later implementation changes delivery, not authored content or runtime behavior.

### Execute the prepared Pages migration

Use **Authorized Pages canonical-root migration** (`site-pages-migration.yml`) on
merged protected main, as repository owner. It shares the ordinary Pages
publication concurrency lock.

1. Dispatch `mode=prepare` while the original github.io project-prefix origin
   still serves the accepted receipt. Save the successful run ID and exact
   attempt. Its retained preparation authenticates the publisher/run/upload ZIP,
   complete predecessor package, source hashes and observed Pages settings.
   Keep a durable copy before the 90-day Actions retention expires.
2. Bind the canonical domain in repository Pages and apply the reviewed DNS at
   cutover. The workflow intentionally does not change Pages administration or
   DNS. Its standard token has no repository Administration permission.
3. Dispatch `mode=execute` with that preparation run and attempt. It verifies
   exact settings and the unchanged source/production lease, publishes the same
   staging bytes at canonical `/staging/`, and changes only receipt and owned 404.
   HTTP/hash/MIME/root+staging404 and hosted navigation must pass. Its receipt is
   accepted by the subsequent ordinary publisher without loosening origin rules.
4. On failed/cancelled execution, restore the captured Pages settings first;
   coordinate DNS restoration if needed. Dispatch `mode=recover` with the exact
   preparation and failed execution runs/attempts. Recovery verifies the lease
   and restores the exact predecessor package. The failed execution remains red.

Do not bind the domain before successful preparation. Do not use a successor or
an expired/missing artifact as recovery evidence. Production publication follows
successful canonical staging migration and its separate release admission.

## Shared launch dependencies

[The selected issue matrix](../review/issue-39/2026-10-15-release-issue-audit.md)
links only #1/#7/#8/#13/#39/#72: launch, rights, hosting/measurement, release
acceptance, canonical domains and delivery controller. Closed #14 supplies the
already accepted SEO preservation invariants; it is not a new completion task.
Separate feature/publication issues are outside PR40's completion scope.

Before freezing, finish #7's shipped/retained rights inventory and explicit reuse
policy, #8's missing absolute social image and configured launch analytics, and
existing SEO/edition preservation. Supplied permissions remain recorded; do not
request them again. Applicable current release/device checks stay under #13.

Actual release evidence closes only satisfied issue scope. #72's later
successor/rollback lifecycle can remain open after first release; no criterion
is silently removed to promise closure at the first deployment.

## Step 3 — actual settings and the authorized cutover

1. Observe/reconcile [repository Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments),
   `protect-main`, `protect-production`, immutable Releases and the dedicated
   Production GitHub App using the exact setup in
   [release gates](SITE-RELEASE-GATES.md#production-preparation-without-activation).
   Both `production` and `github-pages` must permit protected main. Configure
   `PRODUCTION_APP_ID`, `PRODUCTION_APP_CLIENT_ID` and
   `PRODUCTION_APP_PRIVATE_KEY` with the documented separate App permissions.
   Keep `SITE_PRODUCTION_ENABLED` absent/false during preparation.
2. Confirm [repository Pages](https://github.com/oborskyivitalii/oborskyivitalii/settings/pages)
   uses **GitHub Actions**, already observed serving staging. Do not switch to
   branch publication. Confirm settings through an authenticated path before release.
3. With the concrete candidate, full evidence and tested migration/recovery ready,
   save custom domain **vitaliioborskyi.ai** before applying the .ai routing DNS.
   For Actions publication, a repository CNAME file does not control this setting.
   Capture old origin/receipt/settings first; coordinate the binding and DNS with
   the tested migration rather than invoking the ordinary publisher against an
   incompatible project-prefix receipt.
4. After DNS/certificate checks, enable **Enforce HTTPS**; GitHub documents that
   the option can take up to 24 hours. Verify canonical-root staging and its new
   authenticated receipt, retaining Cloudflare aliases. Production opt-in remains
   off until the applicable release decision.
5. Enable the authorized opt-in and invoke `site-production.yml` with the exact
   immutable release tag, successful full validation run, merged source PR and
   source-bound evidence. It composes the admitted production root with retained
   staging. Follow the existing publisher/live verifier; do not rebuild the
   admitted artifact. Verify .ai before enabling the .com redirect below.

## Step 4 — Cloudflare configuration by the agent at release

Re-read existing DNS/rules first. Preserve unrelated records/rules; report
conflicting apex/www/CAA records instead of replacing them indiscriminately.

| Zone | Type | Name | Content | Proxy |
| --- | --- | --- | --- | --- |
| vitaliioborskyi.ai | A | @ | 185.199.108.153 | DNS only |
| vitaliioborskyi.ai | A | @ | 185.199.109.153 | DNS only |
| vitaliioborskyi.ai | A | @ | 185.199.110.153 | DNS only |
| vitaliioborskyi.ai | A | @ | 185.199.111.153 | DNS only |
| vitaliioborskyi.ai | CNAME | www | oborskyivitalii.github.io | DNS only |
| vitaliioborskyi.com | A | @ | 192.0.2.1 | Proxied |
| vitaliioborskyi.com | A | www | 192.0.2.1 | Proxied |

Use Auto TTL. IPv4 suffices; optional GitHub AAAA records can be added later
after review. No wildcard records. DNS-only .ai is the chosen direct-hosting
architecture for straightforward GitHub certificate provisioning.

Once .ai passes the admitted release's live checks, verify the .com Universal SSL
certificate still covers apex/www and is Active. Apply the two proxied .com
records and this one Single Redirect in `http_request_dynamic_redirect`:

- Condition: `(http.host eq "vitaliioborskyi.com" or http.host eq "www.vitaliioborskyi.com")`.
- Dynamic destination: `concat("https://vitaliioborskyi.ai", http.request.uri.path)`.
- Status **301**, **Preserve query string: enabled**.

The exact rule payload is in the desired-state JSON. The rule handles HTTP and
HTTPS directly. The dummy address is used only to send requests through the
Cloudflare edge; there is no .com origin server or extra Worker. A valid source
.com certificate is required even for HTTPS redirects.

## Live acceptance and recovery

Record DNS/TLS plus first-response and final-response results for all hosts;
never disable TLS verification. Current routes are `writing.html`,
`research.html`, `talks.html`, `credits.html`, and `/`.

| Probe | Required result |
| --- | --- |
| https://vitaliioborskyi.ai/ and each real route | Expected admitted HTML/runtime/media; matching digests and canonical origin |
| http://vitaliioborskyi.ai/ | Redirect to canonical HTTPS after enforcement |
| https://www.vitaliioborskyi.ai/writing.html?language=uk | Canonical apex path/query; valid TLS |
| Both .com hosts, HTTP and HTTPS, /writing.html?topic=systems&language=uk | First response 301, Location https://vitaliioborskyi.ai/writing.html?topic=systems&language=uk |
| /media/example%20file.svg?x=1&x=2 through each .com host | First Location retains encoded path and repeated query; final 404 is expected for a fixture-only path |
| Missing .ai path | Real custom 404, no accidental Home fallback |
| Preview and stable staging | Existing source-bound checks and noindex remain correct |

Also verify keyboard/scroll/navigation/back/refresh on actual routes, no mixed
content, sitemap/robots, no redirect loop, and no staging origin in production
metadata. URL fragments are client-side and are not available to redirect rules.

Use the existing protected recovery route and record post-restore probes.
Rollback after an accepted production release consumes its retained immutable
archive. Before the first release, no previous production archive exists: retain
and test restoration of the accepted staging package and captured origin/settings. Keep GitHub ownership TXT and domain binding; disabling the
.com rule alone while proxied dummy DNS remains would produce an origin error.
If a routing rollback is required, restore the captured affected records/rules
as one reviewed change, preserving unrelated DNS. Keep this issue open until
live AC05 evidence and required release gates are complete.

## Official references

- [GitHub custom-domain setup, DNS and Actions CNAME behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
- [GitHub personal Pages ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
- [GitHub custom Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Cloudflare redirect-only domain](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/).
- [Cloudflare dynamic URL/query preservation settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/).
- [Cloudflare redirect API](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/).
