# GitHub Pages production and custom domains

Owner: [issue #39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
[PR #86](https://github.com/oborskyivitalii/oborskyivitalii/pull/86), under
hosting #8, release #13 and launch #1. Current execution plan:
[implementation and remaining launch work](../review/issue-39/2026-10-17-production-cutover.md).
Release implementation is owned by [release gates](SITE-RELEASE-GATES.md);
the existing [staging controller](SITE-STAGING.md) remains the delivery route.

## Current delivery topology

Cloudflare is the sole PR-preview and permanent-staging publisher. GitHub Pages
publishes only the production root at https://vitaliioborskyi.ai/; `/staging/`
is retired and must return the owned 404 after publication. The `.com` hosts
redirect in one hop to the canonical `.ai` path with the query preserved.

PR40 and PR85 are merged. The owning issue and active follow-up PR contain
current refs, exact CI results and the remaining first-publication work. Dated
inventory reports and old two-host staging instructions are historical evidence.
The staging-bound production candidate, immutable archive and protected publisher
remain the only production route. Full regression is an optional manual action.
After publication or rollback only bounded HTTP/policy/browser smoke is required.

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

## First production publication

1. Complete and merge the current controller change through ordinary Cloudflare
   staging. Freeze the exact final main using `site-release-candidate.yml` with
   `candidate_sha` and `release_pr`. It authenticates successful staging and an
   identical merged source tree. `site-candidate-evidence.yml` remains optional.
2. Run **Authorized Pages canonical-root migration**, `mode=prepare`, on that same
   main before binding the domain. Its successful run/attempt captures actual
   original Pages settings, authenticated publisher/receipt, exact ZIP/package and
   live HTTP. Preserve the capsule; an older-controller capsule cannot substitute.
3. Bind the selected rights decision to the frozen production inventory. Full
   diagnostics and device observations are separate, nonblocking records. Configure the canonical domain and reviewed DNS, then verify
   TLS and HTTPS enforcement. Do not execute the historical migration `execute`
   route: it would republish retired staging on the canonical host.
4. Dispatch **Authorized production release or rollback**, `operation=publish`, with
   the successful validation run, merged PR, immutable tag, exact-source release
   evidence, and `first_release_preparation_run` / `first_release_preparation_attempt`.
   The publisher authenticates the capsule/run/controller, checks that production
   is absent and every predecessor byte still matches at the canonical root, and
   retains the predecessor solely for recovery. It publishes the admitted
   production package directly, with no staging subtree or rebuild.
5. On any failed transition the workflow restores exact predecessor bytes and
   captured Pages configuration, verifies the original prefix, then compensates
   bookkeeping. A missing Pages-settings permission fails visibly; it is never
   treated as successful restoration. The agent/owner must restore the capsule's
   exact settings through repository Pages and verify original-prefix HTTP before
   recording completed recovery. No unreviewed wider App grant is implied.
6. Subsequent releases/rollbacks omit both first-release inputs and retain the
   existing strict canonical predecessor path. First-release inputs are rejected
   for rollback or once an accepted production deployment exists.

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
3. With the staging-admitted candidate, rights and tested migration/recovery ready,
   save custom domain **vitaliioborskyi.ai** before applying the .ai routing DNS.
   For Actions publication, a repository CNAME file does not control this setting.
   Capture old origin/receipt/settings first; coordinate the binding and DNS with
   the tested migration rather than invoking the ordinary publisher against an
   incompatible project-prefix receipt.
4. After DNS/certificate checks, enable **Enforce HTTPS**; GitHub documents that
   the option can take up to 24 hours. Verify the canonical origin and retain the authenticated first-release
   recovery capsule; Cloudflare staging remains independent. Production opt-in remains
   off until the applicable release decision.
5. Enable the authorized opt-in and invoke `site-production.yml` with the exact
   immutable release tag, successful frozen-candidate run, merged source PR and
   source-bound evidence. It composes only the admitted production root; retained predecessor
   bytes are recovery material. Follow the existing publisher/live verifier; do not rebuild the
   admitted artifact. Verify .ai before enabling the .com redirect below.

The post-deploy Pages HTTP verifier first waits up to 60 seconds, polling every
two seconds, for one complete observation of the exact frozen package, root,
query routes and owned 404s. Old bytes or a transitional 200/404 status cannot
pass; all prior attempts remain in the report. TLS/origin, MIME, transport and
other HTTP status failures stop immediately. Policy/browser smoke starts only
after readiness passes. Exhaustion fails the publication and invokes the existing
rollback; restored-byte verification uses the same bounded wait. No readiness
attempt dispatches staging or repeats a full regression.

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
