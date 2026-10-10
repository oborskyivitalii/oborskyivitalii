# GitHub Pages production and custom domains

Owner: [issue #39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
under hosting #8, release #13 and launch #1. This is preparation, not an active
deployment. [Desired state](github-pages-domains.json) is a reviewable plan;
neither the build nor a deployment controller consumes it yet.

## Target and current state

GitHub Pages will serve **https://vitaliioborskyi.ai** at the domain root.
Cloudflare will return permanent **301** redirects from both .com hosts to the
equivalent .ai URL, retaining path/query. GitHub handles www.ai → apex.ai.
The default project URL would be
https://oborskyivitalii.github.io/oborskyivitalii/; that repository prefix must
not appear in canonical URLs on the custom domain.

At inspected main `ec9b8361b619f1042bce5a3ec224d3e0c9054b01`:

- Both Cloudflare zones are active; DNS is empty; redirect rules, Page Rules
  and Worker routes are absent. Universal certificates are already active.
- Repository read/write/admin permissions are advertised. The GitHub connector
  rejects the Pages administration endpoint. Actual Pages settings are
  **unobserved**, not assumed disabled.
- Full release checks exist; an inactive deploy example is outside workflows.
  There is no active Pages deploy workflow. Production canonical/og:url/sitemap
  generation, Pages-specific hosted verification and recovery remain work.

See [provider inventory](../review/issue-39/2026-10-07-provider-inventory.json)
and [analysis/tasks](../review/issue-39/2026-10-07-analysis.md).

## Who can perform each action

| Action | Agent through current plugins | Maintainer |
| --- | --- | --- |
| Repository issue/branch/PR, source and workflow preparation | Yes | Review/merge under existing rules |
| Cloudflare DNS/redirect/TLS inspection | Read access tested successfully | No setup needed |
| Cloudflare TXT/routing DNS and redirect updates | DNS edit permission advertised; rule API available, writes not tested | No token needs to be pasted into chat |
| GitHub personal Pages ownership verification | No supported plugin operation | Completed: maintainer confirmed Verified on 10 October |
| Repository Pages source/domain/Enforce HTTPS | No supported plugin operation | Apply exact settings at release |
| Environment protection and Actions variables | No supported plugin operation | Apply requested settings after workflow review |

No browser fallback was attempted. Repository admin permission does not make an
unsupported connector endpoint callable.

## Current readiness — 10 October 2026

[The current audit](../review/issue-39/2026-10-10-readiness.md) supersedes dated
provider/task-status observations above. Ownership TXT was created on 7 October
and exists live; do not repeat generation or creation. The maintainer confirmed
GitHub **Verified** on 10 October; ownership verification is complete. Repository
Pages source/domain/HTTPS and environment settings remain separately unobserved.
Production build, protected publisher/recovery, current-candidate
admission and routing/redirect/live acceptance remain pending. PR40 is still
Draft and conflicts with current main. The stable Color rendition is distinct
from the base docs artifact; reconcile its production selection explicitly.

## Step 1 — ownership proof (completed)

1. The maintainer confirmed **Verified** for the existing **vitaliioborskyi.ai**
   entry in [personal GitHub Settings → Pages](https://github.com/settings/pages)
   on 10 October. This is maintainer-observed evidence; the connector does not
   expose that administration endpoint. No further ownership action is pending.
2. Keep `_github-pages-challenge-oborskyivitalii.vitaliioborskyi.ai` permanently.
   The maintainer supplied GitHub's exact challenge and the agent created record
   `466edebf239247c914621e5e5d3e858d` on 7 October. The 10 October API read
   confirms one DNS-only, Auto-TTL record. Do not generate or create another one.
3. If the existing entry later disappears or GitHub requires a different challenge,
   reconcile the actual account/name/value before any write. TXT verification
   neither publishes the site nor switches web routing.

No .com GitHub verification is needed: .com will not point to Pages.

## Step 2 — repository preparation before release

Execution continues through issue #39's linked Draft PR and review artifact:

1. Extend the existing build with explicit production-origin metadata and an
   indexability contract: per-route canonical/og:url and appropriate JSON-LD,
   robots.txt and sitemap. Update `tests/content.test.cjs`, which currently
   forbids canonical/og:url, and the frozen metadata contract in
   `tools/check_site_seo.cjs`. Canonicalize immutable snapshots to their real
   routes rather than indexing duplicate pages. Preserve publication source
   URLs; leave analytics off.
2. Prepare a real Pages artifact and custom 404. Do not publish a Cloudflare
   staging package containing noindex headers, `_staging/` or provider-only
   files as the production artifact. Decide retained snapshots and recovery.
3. Implement an owner-invoked, protected Pages Actions workflow from protected
   main using the full production gate, source/tree and immutable artifact
   identity. Deployment receives the **same admitted bytes**, without rebuilding.
   Pin official configure/upload/deploy actions after review. Follow
   [release gates](SITE-RELEASE-GATES.md), not the inactive example verbatim.
4. Adapt hosted production checks to GitHub Pages. Cloudflare `_headers` is not
   a GitHub Pages response-header mechanism. Record the actual provider header
   policy and accepted controls; do not silently waive existing security gates.
   Bind the production verifier/controller to the exact .ai origin; current
   `tools/quality/hosted-origin.cjs` only validates general HTTPS origins.
   Add a finite .com/www redirect verifier alongside the same-origin content
   checks instead of allowing arbitrary cross-origin crawling.
5. Keep preview/staging under [the existing controller](SITE-STAGING.md).
   Reconcile the parallel test-profile work in #35 before workflow integration.
6. Complete applicable rights, independent review, device and release decisions
   under #7/#13/#8. A passing preview is not production admission.

This preparation PR implements the plan/configuration/acceptance mapping;
the production build and deploy-controller tasks above are still pending.

## Step 3 — GitHub settings at authorized release

Use these settings only after the protected production workflow is reviewed:

1. Open [repository Settings → Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments).
   Create/review **github-pages**, permit deployments only from **main**.
   Assign **oborskyivitalii** as a required reviewer if available; keep approval
   by the release owner possible (do not enable Prevent self-review for a sole
   maintainer). No Cloudflare secret is needed for GitHub Pages deployment.
2. Open [repository Settings → Pages](https://github.com/oborskyivitalii/oborskyivitalii/settings/pages).
   Under **Build and deployment → Source**, select **GitHub Actions**.
   Do not select Deploy from a branch: it bypasses the exact-artifact gate.
3. Set **Custom domain** to **vitaliioborskyi.ai** and Save **before** publishing
   DNS toward GitHub. For Actions publishing, a repository CNAME file is ignored;
   the Pages setting is authoritative.
4. Notify the agent that the source/domain are saved. The agent applies .ai DNS
   below. After GitHub's DNS/certificate check succeeds, enable **Enforce HTTPS**.
   The checkbox can take up to 24 hours to become available.
5. Invoke the approved release workflow for the exact admitted artifact. If
   GitHub requires a first deploy to expose a setting/certificate, perform only
   that admitted deployment as part of the same owner-authorized release,
   then complete DNS/TLS checks before declaring the site launched.

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

Before release, implement/test recovery through the same protected workflow:
redeploy the retained last admitted artifact with verified identity and record
post-rollback probes. Keep GitHub ownership TXT and domain binding; disabling the
.com rule alone while proxied dummy DNS remains would produce an origin error.
If a routing rollback is required, restore the captured affected records/rules
as one reviewed change, preserving unrelated DNS. Keep this issue open until
live AC05 evidence and required release gates are complete.

## Official sources checked on 7 October 2026

- [GitHub custom-domain setup, DNS and Actions CNAME behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
- [GitHub personal Pages ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
- [GitHub custom Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Cloudflare redirect-only domain](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/).
- [Cloudflare dynamic URL/query preservation settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/).
- [Cloudflare redirect API](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/).
