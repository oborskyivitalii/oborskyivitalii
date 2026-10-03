# Browser staging — Sol implementation plan

Maintainer amendment, 2026-10-03. Hosting owner: [issue #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8); current design implementation: [#14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14), Draft PR #10. Continue the existing branch and preserve newer work.

## Intent and authorization

The maintainer requests a hosted test environment now, as part of the current site work, so the whole site can be clicked in a real browser through one URL. New iterations should be delivered as links instead of separate chat attachments. This explicitly authorizes setting up and updating staging during implementation. It supersedes earlier blanket “no deployment” instructions **for staging only**. Production launch, merge, permanent domain/DNS and paid purchases remain separate decisions. This commit prepares the plan; it does not claim an existing host or deployed URL.

The current site is five static HTML pages with local CSS/JS/assets. This amendment affects hosting configuration, CI delivery and review workflow, not UA/Subprime research meaning or publication ownership. Attached research manuscripts are not deployment inputs; do not upload them or the repository wholesale.

## Recommended host and alternatives

**Default implementation choice: a dedicated Cloudflare Pages staging project, Direct Upload from GitHub Actions.** It accepts prebuilt assets and supports versioned deployments and branch aliases. This fits the current static site and existing same-artifact checks without adding a server or migrating to a framework. Use the provider subdomain first; no domain purchase is needed. Verify the account's current applicable plan/limits before provisioning; do not assume unlimited resources or enroll in paid services.

Vercel is a viable alternative if the maintainer already has a suitable authorized project/plan. Its Hobby plan is documented for personal non-commercial use; do not assume it is the right plan for a site intended to attract consulting engagements. Use the same acceptance contract if selecting Vercel and record the reason. Do not create parallel hosts. GitHub Pages can host static files, but this task's staging project should not consume the repository's eventual production Pages configuration or require renaming the repository.

Use Pages Direct Upload deliberately: Cloudflare documents that Direct Upload projects cannot later switch to Git integration. CI remains the deployment owner. No provider-side automatic build should bypass the repository's checks.

Sources checked 2026-10-03:
- [Cloudflare preview deployments, aliases and indexing](https://developers.cloudflare.com/pages/configuration/preview-deployments/).
- [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).
- [Direct Upload project choice](https://developers.cloudflare.com/pages/get-started/direct-upload/).
- [Static routing behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).
- [Vercel Hobby scope](https://vercel.com/docs/plans/hobby).

## T0 — provision once and establish a working baseline

1. Inspect live #8/#14/#13, PR #10 and any existing authorized hosting integration before creating a project. Reuse a suitable dedicated staging project if it exists. Keep production separate.
2. Configure a dedicated GitHub `staging` environment and a least-privilege Cloudflare Pages deployment token scoped to the intended account. Store it in GitHub environment secrets, never chat, source or public output. Account/project identifiers are configuration. Document required names and setup steps without values. Pin deployment actions/CLI versions through the repo's existing policy.
3. If account authorization is unavailable, first finish the workflow, packaging, checks and precise setup instructions. Then request only the indispensable account connection/secret installation through the supported secure flow. Do not ask again whether staging is wanted, ask for credentials in chat, invent a URL or claim provisioning succeeded.
4. Deploy the existing candidate as the first baseline once the staging gates pass. Do not wait for the full redesign to make browser review possible. Then continue #14 S0–S5 using staging for each reviewable increment. Keep a known-good version available.

## T1 — artifact and CI flow

Use the existing build/quality pipeline and one frozen source SHA. Required sequence:

1. Build the public artifact once from `docs/`; retain source/tree, file hashes and artifact digest. Never upload repo root, `review/`, process documents, research manuscripts, secrets, source evidence archives or ZIP bundles.
2. Pass the required PR aggregate (behavior/content/export/RI checks, static/security, size budgets and three-engine functional matrix) plus staging configuration/link checks. Missing, cancelled, failed or mismatched records block deployment. A changed scene still needs the existing performance/capture work for design acceptance under #14/#13.
3. Prepare a staging deployment package with unchanged public HTML/CSS/JS/image bytes and explicitly recorded host-only additions such as `_headers`, routing/404 configuration and non-sensitive revision metadata. Hash this package separately, prove the relation to the tested public artifact, and verify it. Do not silently rewrite production SEO/content or rebuild a moving branch.
4. Upload that exact package to a versioned candidate deployment; smoke-test its actual HTTPS URL. Publish the stable staging branch alias only after candidate checks pass. With Direct Upload this can be a second upload of the **identical** package to branch `staging`; no rebuild is needed. Record both deployment IDs and recheck the stable alias afterward. Do not assume Cloudflare's branch alias waits for post-deploy checks: it updates on upload.
5. Serialize stable-alias promotion, reject stale commits and preserve the last verified deployment. On a failed stable-alias smoke check, restore the previous verified package and report the failed revision. Concurrent runs must not let an older build replace a newer one.
6. Record a GitHub Deployment for environment `staging`, and update one PR comment with the stable URL, this version's immutable URL, source SHA, artifact/package digest, check result and changes. Distinguish the PR's tested merge ref from the source head where applicable.

Trigger on updates to the authorized same-repository site branch after successful checks; also support manual deployment of an explicit tested SHA. Secrets must not be available to untrusted fork code. Never use a privileged pull_request_target job to execute a PR checkout. Trusted deployment consumes verified artifacts from the expected repository/workflow/run/SHA. Do not weaken #13 checks or add blanket exceptions.

A staging gate is intentionally separate from production release authorization: the still-missing physical-device, final visual/rights and production-origin decisions must not prevent creating the environment needed for those reviews. Record them as pending; do not fabricate a successful full release or bypass the production gate.

## T2 — real navigation, SEO isolation and HTTP behavior

- Serve Home, Research, Writing, Talks and Credits from one origin, with all required local assets and existing .html links supported. Test `/`, `/index.html` and every linked page; account for the host's extensionless redirects without losing query strings/fragments. Do not add an SPA catch-all that masks broken links as Home. Unknown URLs return an actual 404. Include a top-level `404.html` in the verified deployment package: without it Cloudflare Pages defaults to SPA fallback.
- Verify navigation from each page, deep links opened directly, refresh/back/forward, archive topic/year/language filters, section anchors, contact/LinkedIn and external publication links. Keep external links pointing at their original publishers. Bounded automated crawling stays on the staging origin.
- Keep the current SEO text, metadata, schema and source/publication inventory. Do not replace canonical/social identity with staging URLs or submit staging to Search Console/sitemaps. Production origin stays #8's separate choice.
- Apply `X-Robots-Tag: noindex, nofollow` to staging responses via host configuration, including version URLs and aliases; verify returned headers. Cloudflare preview defaults help, but test the actual deployed configuration. Keep this policy out of production HTML/config. Do not rely solely on robots.txt Disallow: crawlers must be able to read noindex. Noindex is not authentication; this requested staging is link-accessible unless the maintainer asks for access restriction.
- Check HTTPS, content types, redirects and compatible security headers. Respect existing inline JSON-LD/SVG and theme initialization when defining CSP; no broad copy-pasted policy that breaks the site. Give mutable HTML/CSS/JS suitable revalidation so new deployments do not mix stale assets. Do not mark unversioned filenames immutable for a year.
- Verify Day/Night/Auto, including existing visitor-local Auto semantics and persistence; motion/freeze/reduced/no-JS fallback, mobile layout, keyboard and actual Day text contrast on the deployed origin. HTTP smoke checks alone do not establish visual acceptance or real-device coverage.

## T3 — user delivery and maintenance

The main review deliverable becomes **one clickable staging URL** that works independently of the chat or local process. Also give the immutable URL for the reviewed version, the short commit, what changed and any genuine limitation. Do not present proposed example URLs as live deployments. HTML/ZIP exports may remain downloadable fallback/evidence to preserve existing tooling, but sending five files is no longer the primary review workflow.

Record actual project/account ownership, workflow path, environment/secret names, root/output configuration, URLs, rollback command/process, provider plan limits and cleanup policy in SITE-OPERATIONS. Retain the currently reviewed and last known-good versions; clean older previews using a bounded retention policy after checking they are no longer needed for an open review. Do not delete evidence still needed by #13.

## Acceptance checklist

- [ ] Dedicated staging host configured and the baseline candidate reachable by real HTTPS URL.
- [ ] Whole five-page site and assets work; deep links/query/history/refresh and real 404 verified.
- [ ] CI deploys only the verified artifact/package from the expected SHA; stale/failed runs cannot promote.
- [ ] Stable link and immutable version link recorded in PR #10 and issue #8/#14.
- [ ] Staging noindex and production SEO isolation verified on the actual responses.
- [ ] Day/Night/Auto/motion and desktop/mobile browser smoke checks pass on the hosted version.
- [ ] Last known-good recovery demonstrated; ownership/setup/operations documented.
- [ ] Current design iteration delivered through staging, with remaining release requirements stated honestly.

Do not close #8 solely because staging works: production URL, launch/indexing and release acceptance remain open. Implement this alongside #14 in Draft PR #10; PR #9 stays the workflow dependency. No production deployment or merge is authorized by this amendment.
