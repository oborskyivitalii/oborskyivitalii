# Browser staging — current setup and activation boundary

## Current runbook — reviewed 5 October 2026

Owner: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8). Full
checks: [#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13).
The maintainer authorizes repository integration and this instruction update.
**Actual host provisioning/upload remains paused.** There is no verified live
staging URL. Keep `SITE_STAGING_ENABLED` absent/false and both explicit false
guards in `site-checks.yml` and `site-staging.yml` until activation is authorized.

### Prepared manual protected-main path

The H1 source migration is implemented in `tools/staging/trust.cjs`,
`tools/staging/state.cjs` and both caller/reusable workflows. It accepts only a
manual `site-checks.yml` dispatch on `refs/heads/main`, with `candidate_sha` equal
to the caller/workflow SHA and the **live protected main tip**. Before any
provider call, it verifies the exact repository, workflow, run/attempt, source
and immutable basic public/gate artifact IDs, names and upload digests. It
rechecks these identities before candidate registration and stable promotion.

Recovery records use schema 2, source branch `main`, the caller workflow and
exact run attempt/package upload digest. A retained recovery run must have
succeeded; its package must match the recorded public/package digests. Historical
PR-10/schema-1 recovery is not silently trusted. An existing untracked stable
alias stops the workflow for owner reconciliation. Deployment status goes to
hosting issue **#8**, not the closed PR #10. Read the focused
[H1 execution record](review/site-sol-continuation-20261005/H1.md).

**Live repository check on 5 October: `main` is not protected.** No protection or
environment setting was changed here. Source migration and passing fixtures do
not mean hosting is configured. Do not install `refs/pull/10/merge` or the old
work branch as new environment rules; no arbitrary PR/branch mode is enabled.

### Owner configuration, once activation is requested

1. Use one dedicated Cloudflare Pages **Direct Upload** staging project. Keep its
   production branch `production-disabled`; no Git integration, Functions or
   provider-injected analytics. Do not repurpose production Pages or buy a plan.
2. Create an account-scoped token with **Account → Cloudflare Pages → Edit** for
   the intended account. Store it in the GitHub `staging` environment secret
   below. Never paste it into an issue/chat or commit it. Account-scoped permission
   does not mean project-only permission.
3. Protect `main` with reviewed pull requests and the required current basic/RI
   checks. Protect the GitHub `staging` environment with a selected **`main`**
   branch rule and an owner reviewer where available. The live branch API must
   report `protected:true`; environment restriction alone does not replace it.
4. Set these existing configuration names, without putting values in source:

| Name | Location | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | `staging` environment secret | Intended account's Pages Edit token. |
| `CLOUDFLARE_ACCOUNT_ID` | `staging` environment variable | Account's 32-character ID. |
| `CLOUDFLARE_PAGES_PROJECT` | `staging` environment variable | Dedicated Direct Upload project name. No actual project is asserted here. |
| `SITE_STAGING_CREATE_PROJECT` | `staging` environment variable | `true` only for initial creation of a missing `*-staging` project; otherwise false/absent. |
| `SITE_STAGING_ENABLED` | Repository Actions variable | Enable last, after hosting authorization, source integration, protected-main/environment setup and removal of the two pause guards in a reviewed change. |

An existing incompatible project is rejected, never silently converted. Current
deployment code pins `cloudflare/wrangler-action` to
`953926a2e2182532811c01a25e53647d93bf07c0` and Wrangler `4.147.0`; this update does
not upgrade either dependency. Check actual account limits before provisioning.

### Required sequence and evidence

1. After activation is separately authorized, open **Actions → Site basic checks
   → Run workflow**, select branch **main**, and enter its approved full 40-character
   tip SHA as `candidate_sha`. That dispatch runs the one basic profile and owns
   the immutable public/gate artifacts consumed by staging. A SHA from an older
   tip, a PR or another workflow/run/attempt is rejected. Preserve the exact
   source/tree/public digest and artifact/run IDs. Local default remains
   `node tools/quality/local.cjs`.
2. Build the separate staging package from those verified public bytes, adding
   only recorded host files (`_headers`, `404.html`, non-sensitive revision
   metadata). Never upload the repo, `review/`, research attachments or ZIPs.
3. Upload an immutable candidate; verify actual HTTPS responses, public hashes,
   five routes, query/hash redirects, MIME, real 404 and noindex. The stable alias
   stays unchanged at this stage.
4. Run the **complete automated staging profile** on that exact candidate URL:
   static/security/advisories, three browser engines, native runners, accessible
   states/failures, Lighthouse, CPU/soak and captures. Missing/failed or mismatched
   evidence blocks promotion. Existing limits remain unchanged. Basic/full
   artifact names are distinct and include profile/run/attempt.
5. Recheck protected-main freshness and source/artifact identity, promote the identical package to the stable `staging`
   alias, then recheck it. Recover the previous verified package on failed alias
   smoke. Uploading to a branch moves its alias; the candidate must therefore
   use a different branch. Serialize promotion and verify retained dependencies.
6. Record actual stable and immutable URLs, deployment IDs, source SHA, public/
   package digests, run attempt/upload digest and results in #8/the implementation PR. Verify no analytics
   beacon on staging and no staging URL/noindex contamination of production SEO.

Production remains GitHub Pages under #8. Its workflow is still an inactive
example, not an enabled deployment: reuse successful staging automation before
promotion, preserve independent/device/rights release acceptance, then run the
complete production profile against the real deployed origin. This document
does not claim production automation has run.

### Evidence still required before calling staging configured

Working HTTPS stable/version URLs; true 404 and noindex on actual responses;
all-page navigation/history/query/refresh; exact served bytes; successful full
staging report; demonstrated recovery; recorded project ownership and retention.
Physical-device and final rights/release decisions remain separately visible.
Do not close #8 on local fixtures or setup documentation.

Primary provider documentation rechecked 5 October 2026:
[Cloudflare CI/token setup](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/),
[preview aliases/noindex](https://developers.cloudflare.com/pages/configuration/preview-deployments/),
[GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

## Historical implementation plan

The dated sections below retain earlier decisions and evidence. The current
runbook above supersedes their PR #10 branch rules, smoke-only promotion and
statements that code merge is still prohibited.

## Check-profile amendment — 2026-10-05

[SITE-CHECK-PROFILES](SITE-CHECK-PROFILES.md) supersedes older always-full
local/PR execution. Basic checks run once per update; full automated suites run
against immutable staging and after production deployment. Successful staging
evidence is reused before promotion. All budgets and separate physical/review
acceptance remain; publication stays paused. Older execution descriptions below
are historical where they conflict with this amendment.


## Production measurement isolation — 2026-10-04

Production is selected as GitHub Pages; Cloudflare Pages remains future staging.
[SITE-ANALYTICS](SITE-ANALYTICS.md) documents the prepared production-only adapter.
Its exact-origin/path guard excludes staging aliases and immutable snapshot URLs;
review exports strip it. Keep provider-side automatic analytics injection off.
No account/host is configured and all publication is still paused. When staging
is later authorized, assert that actual responses/navigation make no beacon
request; do not infer this hosted result from the controlled fixture alone.

## Execution and publication pause — 2026-10-04

The maintainer now authorizes the engine/content plan and Writing fix under
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15)/#12 in stacked
Draft [PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16). Read
[the source/engine contract](site/README.md) and
[execution record](review/site-engine-implementation-20261004/EXECUTION.md).
`site/` is authoritative; `docs/` is generated-only. Every #13 mandatory job and
budget remains. The latest instruction pauses **all publication**, including
staging, superseding the earlier activation amendment below. Both deployment
workflow entry points have explicit false guards; configuration alone cannot
enable publication. No host/account provisioning, upload, production release or
merge is part of this work. Prepared packages/fixtures do not establish real host,
physical-device or independent acceptance. Re-enabling hosting needs a later
maintainer instruction and a separately reviewed change to those guards.

Maintainer amendment, 2026-10-03. Hosting owner: [issue #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8); current design implementation: [#14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14), Draft PR #10. Continue the existing branch and preserve newer work.

## Implemented delivery code and indispensable secure setup

The redesign is implemented at `9c12900`. `site-checks.yml` now calls
`site-staging.yml` **only after** successful required PR checks, and only for the
authorized same-repository PR #10 or a manual explicit SHA that still matches its
live tip. `tools/staging/` verifies exact artifact/gate identities, public bytes,
the staging-only package, project/branch policy, version/stable HTTP and browser
smoke, source freshness, immutable previous-package recovery and a single PR
status comment. Local controlled tests are not hosted proof. No account/project/
URL is currently provisioned or claimed; access is the remaining blocker.

Owner setup (do not paste a token in chat):

1. Create/reuse a Cloudflare account and a token with **Account → Cloudflare Pages
   → Edit**, restricted to that intended account. Do not grant DNS/billing or use
   a global API key. Verify the account's applicable limits; no paid purchase is
   part of this task. Cloudflare's Pages permission is account-scoped, not a claim
   of project-only token capability.
2. In this repository's Settings → Environments, configure `staging`. Use selected
   branch rules `refs/pull/10/merge` and `work/site-v1-20261001`; do not allow every
   PR. Environment rules match GITHUB_REF, so the PR merge-ref rule is necessary.
   Use an owner reviewer where available. Store the token as an **environment
   secret**, not a repository plaintext variable or source file.
3. Configure the names below. Enable the repository switch last, after secrets,
   variables and environment protection are complete.

| Name | Location | Value / purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | `staging` environment secret | Account-scoped Pages deployment token. |
| `CLOUDFLARE_ACCOUNT_ID` | `staging` environment variable | Intended 32-character account ID; no value is committed. |
| `CLOUDFLARE_PAGES_PROJECT` | `staging` environment variable | Dedicated Direct Upload project, e.g. `oborskyi-site-staging` (suggestion, not provisioned). |
| `SITE_STAGING_CREATE_PROJECT` | `staging` environment variable | `true` only for initial creation; otherwise absent/`false`. Creates only an actually missing name ending in `-staging`, with unused production branch `production-disabled`. Existing incompatible projects are rejected, never converted. |
| `SITE_STAGING_ENABLED` | Repository Actions variable | `true` enables the post-checks job; absent/`false` makes no provider call. |

Existing suitable Direct Upload projects must have `production_branch` set to
`production-disabled`, no automatic Git integration, Functions or injected
analytics. The workflow does not silently modify an incompatible existing
project. Quota, permission and protected-workflow failures are stop conditions,
not reasons to buy a plan or use another account/host.

While workflows live only in this Draft branch, trigger a fresh same-branch PR
update after secure setup. Do not merge just to expose the Actions manual button.
`workflow_dispatch` is supported when GitHub makes the workflow available; its
explicit candidate must still be the current approved PR tip. Every new update
uses a new run/artifact identity rather than rebuilding a moving ref.

Pin provenance checked from the official repositories/docs on 2026-10-03:
`cloudflare/wrangler-action` v4.1.3 at
`953926a2e2182532811c01a25e53647d93bf07c0`, plus explicit Wrangler `4.147.0`.
The action's declared license is MIT OR Apache-2.0; upstream distribution/license
remain upstream. No runtime dependency is added to the public site. Future
upgrades need a bounded tool/security review; the existing quality lock/advisory
policy is not loosened.

Operational recovery: before promotion, the last successful GitHub staging
Deployment must identify a non-expired same-repository/branch/SHA package artifact.
The exact package is downloaded and verified before any stable write. On failed
stable upload/smoke, the workflow restores it and repeats the hosted checks; the
failed candidate stays failed even after recovery. The first deployment has no
previous known-good version, so a failed first stable smoke is explicitly not
accepted. Do not cancel a run during promotion: an operator cancellation/provider
outage may require explicit owner recovery, and the job never overrides a stop.
Packages/reports retain 90 days; expired recovery evidence blocks promotion until
the owner restores a verified recovery record. No deletion/cleanup is automated.

Manual recovery, if specifically requested: retrieve the exact artifact ID from
the last verified Deployment payload, verify its package digest/source with
`tools/staging/package.cjs verify`, reupload its `public/` with the pinned Wrangler
to the **staging** branch, and run `tools/staging/hosted.cjs` against the returned
alias with that package. Use environment-managed credentials, preserve noindex,
record the actual result in #8/PR #10 and never target `production-disabled`.

Source docs: [Pages CI/token setup](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/),
[project API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/),
[GitHub environment branch rules](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments),
[official action source](https://github.com/cloudflare/wrangler-action/tree/953926a2e2182532811c01a25e53647d93bf07c0),
[Wrangler release](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%404.147.0).
Current published Free-plan limits list 20,000 files/25 MiB per asset, 100 projects,
and 500 builds/month; the account's actual plan/quota is still unverified. This
16-file package and two uploads per successful update do not imply unlimited
account allowance. [Limits](https://developers.cloudflare.com/pages/platform/limits/).

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
