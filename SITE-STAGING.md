# Browser staging — current setup and activation boundary
## Current Color staging — 6 October 2026

[Open the current whole-site Color preview](https://0c423b48.oborskyi-author-ci-staging.pages.dev).
The earlier `505498da` preview selected base, which explains missing ribbons,
edge scrolling and spatial text flight. The current native five-route package
includes the existing authored Color effects with explicit variant identity.
No owner setup is needed to open it.

| Current identity | Value |
| --- | --- |
| Deployment | `0c423b48-f61d-44ef-bb29-cee749c8d010` (preview, successful) |
| Source | `eac4654e58757f5bbab343feeef3fc690548df6b` |
| Source tree | `40b003170d38b85fcb71f7b7edec35ff352d05c3` |
| Color fingerprint | `949b2a2e441bc6b1673be0310ad8a12dc775ff8c73a59706d944373e7be36768` |
| Successful Color build | [37423103901](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37423103901) |
| Public artifact / ZIP digest | `11393657896` / `c5e4ad803439bdc94c1fc04cd0462b8f201e15e2e22f5422ce8d4330512af578` |
| Public digest | `798ad5054e51b3f6bdb238889b843c73087b4c45de2634bd5794a4d03e32e236` |

Provider registration and initial Home hash/Color identity pass. Full automated
hosted tests are queued through the scoped Draft [#26](https://github.com/oborskyivitalii/oborskyivitalii/pull/26),
reusing this exact artifact and immutable https://0c423b48.oborskyi-author-ci-staging.pages.dev. Results and failures belong to
[the current execution report](review/color-staging-20261006/REPORT.md).
This is an experimental rendition based on Draft #23, not its merge acceptance.
The historical cold Writing failure and four full-source fixture failures remain
visible until fresh evidence resolves them. No full-pass claim or stable promotion
follows from packaging or initial smoke.

The dedicated Direct Upload project still has `production-disabled`, no Git
integration, Functions or injected analytics. Production generation remains base.
The protected-main/environment/credential steps below apply to repeatable Actions
deployment; they do not block this authorized preview or its read-only test run.
Keep #8/#13 and Draft #18/#22/#23 open while their acceptance is incomplete.


## Historical base bootstrap — reviewed 5 October 2026

Owner: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8). Full
checks: [#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13).
The maintainer now explicitly authorizes Cloudflare staging configuration and
upload, together with the required repository, issue, PR and instruction updates.
This supersedes earlier staging pauses in the historical sections below.
Production GitHub Pages, production analytics, domain/DNS changes and paid
purchases remain outside this activation.

### Open the deployed preview

**[Open the whole-site preview](https://505498da.oborskyi-author-ci-staging.pages.dev).**
No owner setup is needed to view this edition. The connected Cloudflare provider
created a dedicated Pages **Direct Upload** project and registered this preview
deployment successfully. Its production branch is `production-disabled`, with
no Git integration, Functions or provider-injected analytics.

| Deployed identity | Value |
| --- | --- |
| Cloudflare account | `3b938b72a4ad0ac10b9102e0534e75c0` |
| Project | `oborskyi-author-ci-staging` |
| Project ID | `d4b9b7b2-8ee6-4762-b9b1-84e221db9fbb` |
| Preview deployment ID | `505498da-a176-4f26-a4c4-6c891ee7dead` |
| Provider branch | `candidate-51611505d941ae2996a87782840da418722451f6` |
| Source commit | `51611505d941ae2996a87782840da418722451f6` |
| Source tree | `a31dd365393c1dc4d201170494641809f8162a30` |
| Successful basic CI run | [37380498377](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37380498377) |
| Public artifact ID / ZIP SHA-256 | `11372983963` / `989e6834ad2a948c4e1b988336ad0b46f9e6b392a97ac650f1a01b82ec71d93f` |
| Basic gate artifact ID / ZIP SHA-256 | `11372849111` / `6035fefc82a6c7468dba6cfdf1149d80169198156b707d41df53222be12c6a6a` |
| Public digest | `324c09ff0526fa2664e34c9f590d550ca7f6613ed53a9862d85e679b12e8df60` |
| Staging package digest | `deb2dd16c6efea1eee83df5d01ba954376b16ab9a8e9d8fab6f3e332e0b3d261` |

The uploaded package contains 31 recorded files, approximately 1.15 MB. Its public
bytes come from the verified immutable basic artifact; only the recorded staging
host files were added. The repository, review material and research attachments
were not uploaded. Provider registration success does not establish browser,
performance or full hosted acceptance. The full staging pipeline has **not run**,
and the stable `staging` alias has **not been promoted**. Keep #8/#13 open.

This bootstrap used the connected provider, rather than protected-main Actions.
The plugin connection supplies provider access for this upload; it does not
install a permanent Cloudflare credential or configure GitHub administrative
settings. The remaining steps below are for repeatable GitHub automation,
not prerequisites for opening the preview. Draft #18 retains its idle/cold Writing
performance failures and must not be merged merely to activate staging.

### Preserved earlier project and preparation evidence

During this work the earlier `oborskyi-site-staging` changed outside this
execution: it now has automatic GitHub integration, production branch `main`
and automatic preview/production deployments. Preserve that work; the project
is incompatible with `projectPolicy()` and is **not** the current Direct Upload
CI target. No attempt was made to convert or delete it.

The earlier bootstrap deployment
[`21948511-ccb6-4b7b-a1ea-e78575a3f30f`](https://21948511.oborskyi-site-staging.pages.dev)
used source `5020f05f3764b2a3141514795960a8dd98764165`, public digest
`324c09ff0526fa2664e34c9f590d550ca7f6613ed53a9862d85e679b12e8df60` and package
digest `4c8a6ca4c4a4b2dc87d685aad512e5bfe72f6fcbc1613e6a2d8d8ecb4ad04ebd`.
Keep its reports as historical evidence with that source and origin. PR #24's
[H2 preparation record](review/site-sol-continuation-20261005/H2-CLOUDFLARE.md)
records creation and policy checks of the replacement `oborskyi-author-ci-staging`
project. Its zero-deployment/no-preview statements describe preparation before
the authorized upload above; its staging pause is superseded by this runbook.

### Verified hosted checks

The actual HTTPS check passes all 28 file/hash/MIME checks, root and query
redirects, noindex/nofollow, correct cache policy and the exact 404 document.
[HTTP evidence](review/cloudflare-staging-20261005/evidence/http.json) records
this immutable source and origin. Cloudflare applies stronger `no-store` to the
404; the checker accepts it without permitting stale mutable caching.

[Execution report](review/cloudflare-staging-20261005/REPORT.md) and
[browser evidence](review/cloudflare-staging-20261005/evidence/browser.json)
retain the bounded hosted checks and their limits. They do not satisfy the
complete automated profile or authorize stable promotion.

All 20 browser views passed: five routes × two themes × widths 1440/390 px.
Navigation/history, persistent header/Canvas, archive filters, footer Credits,
ambient animation, Motion Off freeze and absence of analytics resources passed.
This uses one provider browser; native devices and the full performance profile
remain unverified.

### Prepared manual protected-main path

The H1 source migration is implemented in `tools/staging/trust.cjs`,
`tools/staging/state.cjs` and both caller/reusable workflows, through PR #21 in
Draft #18; it is **not yet integrated into main**. The current continuation
removes the two explicit staging pause guards, while retaining repository opt-in
and protected-main/environment verification. This Actions path accepts only a
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

**Live repository check on 5 October: `main` is not protected.** GitHub protection,
environment, secret and variable configuration remains pending. Keep
`SITE_STAGING_ENABLED` absent/false until source integration and the owner steps
below are complete. Do not install `refs/pull/10/merge` or the old work branch as
new environment rules; no arbitrary PR/branch mode is enabled.

The plugin verified Pages read/create/edit access. Its token administration
endpoint returned `9109: Unauthorized to access requested resource`, so the
connection cannot create the persistent Actions deployment token for the owner.
The connection itself is not a GitHub environment credential.

### Remaining owner steps for GitHub automation

The GitHub connector can update repository files, issues and PRs, but does not
expose administrative writes for these settings or workflow dispatch. Complete
these settings in your own dashboard; do not send token values in chat.

1. Reuse the existing project `oborskyi-author-ci-staging` in the account above. View it
   from [Cloudflare Workers & Pages](https://dash.cloudflare.com/3b938b72a4ad0ac10b9102e0534e75c0/workers-and-pages).
   No new account, project, domain or paid plan is required. Retain the existing
   Direct Upload and `production-disabled` settings.
2. In [Cloudflare Account API Tokens](https://dash.cloudflare.com/3b938b72a4ad0ac10b9102e0534e75c0/api-tokens),
   create an account-scoped token with **Account → Cloudflare Pages → Edit** for
   this account. Copy it directly into the GitHub environment secret in step 3.
   Never paste it into an issue/chat or commit it. Account-scoped permission is
   not project-only permission; do not add DNS or billing permissions.
3. Open [GitHub Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments)
   and create/configure `staging`. Choose selected deployment branches and allow
   **main** only; add an owner reviewer where available. Add the environment
   secret and variables from the table below. If there is only one reviewer,
   do not enable a self-review restriction that makes approval impossible.
4. Open [GitHub branch protection](https://github.com/oborskyivitalii/oborskyivitalii/settings/branches)
   and protect `main` with reviewed pull requests and the current required checks
   **`checks`** and **`Local navigation and RI freshness`**. Retain the protection
   against force pushes and deletion, and require the branch to be up to date.
   The branch API must report `protected:true`;
   an environment branch restriction alone does not replace it. Do not require
   the skipped `staging` check as an ordinary PR check.
5. Integrate the reviewed H1/basic-profile infrastructure and this continuation
   into main through a focused infrastructure PR, or after #18's performance
   work is accepted. Do not merge failing Draft #18 as a setup shortcut. The
   legacy workflow on main still has its obsolete PR #10 binding.
6. Enable the repository variable `SITE_STAGING_ENABLED=true` last, from
   [GitHub Actions variables](https://github.com/oborskyivitalii/oborskyivitalii/settings/variables/actions),
   after the reviewed workflow is on main and steps 1–5 are complete.

| Name | Location | Value / purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | `staging` environment secret | Token from step 2; never a plaintext variable. |
| `CLOUDFLARE_ACCOUNT_ID` | `staging` environment variable | `3b938b72a4ad0ac10b9102e0534e75c0` |
| `CLOUDFLARE_PAGES_PROJECT` | `staging` environment variable | `oborskyi-author-ci-staging` |
| `SITE_STAGING_CREATE_PROJECT` | `staging` environment variable | `false`; the dedicated project already exists. |
| `SITE_STAGING_ENABLED` | Repository Actions variable | `true` only after steps 1–5; leave absent/false until then. |

An existing incompatible project is rejected, never silently converted. Current
deployment code pins `cloudflare/wrangler-action` to
`953926a2e2182532811c01a25e53647d93bf07c0` and Wrangler `4.147.0`; this update does
not upgrade either dependency. Do not purchase a plan to bypass a quota failure.

### Required sequence and evidence

1. Once the automation prerequisites above are complete, open
   [Actions → Site basic checks](https://github.com/oborskyivitalii/oborskyivitalii/actions/workflows/site-checks.yml)
   **→ Run workflow**, select branch **main**, and enter its approved full 40-character
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

### Evidence still required before accepting stable staging and automation

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
staging publication pauses or statements that no account/project/preview exists.
It also supersedes older code-merge restrictions; failing Draft #18 retains its
current performance blockers. Production publication remains paused.

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
