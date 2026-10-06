# PR preview and staging through GitHub Actions

Current maintainer decision, 6 October 2026. Hosting owner #8; check owner #13.
Implementation stays in existing Draft [#26](https://github.com/oborskyivitalii/oborskyivitalii/pull/26).
This runbook supersedes manual provider uploads and the one-request `target.json`
flow. Earlier configuration/evidence remains in Git history and dated reports.

## Two paths, one deployment project

| Trigger | Address | Required checks | Publication |
| --- | --- | --- | --- |
| Open/update same-repository PR N | `https://pr-N.oborskyi-author-ci-staging.pages.dev` plus immutable version | Fast source checks, exact five-route/revision/runtime HTTP smoke and Chromium at desktop/mobile widths | Automatic GitHub Actions; one updated PR comment shows source, URL and status. |
| Maintainer explicitly requests staging of PR N | Immutable candidate, then `https://staging.oborskyi-author-ci-staging.pages.dev` | Existing complete automated hosted profile and exact-byte gate; lighter verification after alias promotion | Manual Actions dispatch from protected main, with only `pr_number=N`. |

The workflow resolves the live open PR head. No operator supplies SHA, artifact
ID, deployment URL or copies assets. Preview checks observe three opaque ribbons,
spatial content/camera flight, real wheel continuation in both directions,
disabled edges and Home/Credits boundaries. The full profile retains three Linux
engines, native Windows/macOS, source/security/advisories, accessibility/failures,
Lighthouse, sequential CPU/soak and captures. Physical-device and independent
acceptance remain separate production requirements; no budget is relaxed.

`site-color-review.yml` builds Color once, uploads immutable public/package
artifacts, and publishes only `staging-package/public` through pinned
`cloudflare/wrangler-action`. Test jobs receive no provider credential. CI checks
the source/tree/digest and rechecks the live PR head before deployment/promotion.
Full checks reuse the same public artifact on the immutable candidate URL; a
failed, cancelled, missing or wrong-source full gate leaves stable staging alone.
Stage requests serialize; preview updates cancel older runs of that PR.

After successful promotion, CI retains its package and recovery record for 90
days. A later promotion automatically locates the last successful main dispatch,
verifies the exact run attempt, archive/package digests and live stable revision,
then restores that package through the same official action if stable checks fail.
An untracked stable alias or expired recovery stops promotion for reconciliation.
The first deployment has no earlier accepted stable package to restore. Failed
candidate/smoke/full/promotion reports remain available with their actual status.

## Active Cloudflare audit

Account: `3b938b72a4ad0ac10b9102e0534e75c0`.

| Existing project | Verified configuration | Required disposition |
| --- | --- | --- |
| `oborskyi-site-staging` | GitHub integration, main production + all preview branches automatic; build command/output/root empty. It publishes repository root, which has no site index. | Disable automatic production and preview builds. Preserve its history; no CI points here. |
| `oborskyi-author-ci-staging` | Direct Upload, no Git source, production branch `production-disabled`, no canonical production deployment or injected analytics. Latest actual candidate is Color `0c423b48`, source `eac4654e`. | Reuse for PR and staging aliases. No Git connection, build command, third project, production branch change or DNS change. |

The bare `oborskyi-author-ci-staging.pages.dev` address has no production
deployment. Use the explicit preview/staging aliases after their first successful
CI deployment. Branch aliases update; immutable version URLs retain past files.
The newly repaired build at `8f89078c` has not been deployed. The current actual
[Color candidate](https://0c423b48.oborskyi-author-ci-staging.pages.dev) is historical
bootstrap evidence, not the new automatic PR alias or accepted stable staging.

## One-time owner configuration

1. [Cloudflare Workers & Pages](https://dash.cloudflare.com/3b938b72a4ad0ac10b9102e0534e75c0/workers-and-pages)
   → `oborskyi-site-staging` → **Build → Branch control → Edit**:
   turn off automatic production deployments; set preview deployments to **None**.
   Do this first so the old Git path stops publishing alongside Actions. Keep the
   existing Direct Upload project unchanged.
2. Cloudflare **My Profile → API Tokens → Create Token → Custom Token**:
   permission **Account → Cloudflare Pages → Edit**, resource restricted to the
   account above. No DNS permission is needed. Store the token only in GitHub
   secrets; never put its value in chat, source, issues or logs. The connected
   Cloudflare plugin is not a GitHub Actions credential and cannot create this
   owner's token through its current permission.
3. [Repository Settings → Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments):
   create `preview` and `staging`. Put environment secret `CLOUDFLARE_API_TOKEN`
   into each. Preview: no wait timer/reviewers and no branch restriction; workflow
   checks reject forks. Staging: **Selected branches → main** (branches only),
   no wait timer; the explicit manual dispatch is the approval to stage. Adding
   required reviewers is optional and would pause both candidate and promotion
   jobs for approval. The token is passed only to the official deployment action.
4. [Settings → Secrets and variables → Actions → Variables](https://github.com/oborskyivitalii/oborskyivitalii/settings/variables/actions):

   | Repository variable | Value |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | `3b938b72a4ad0ac10b9102e0534e75c0` |
   | `CLOUDFLARE_PAGES_PROJECT` | `oborskyi-author-ci-staging` |
   | `SITE_PR_PREVIEW_ENABLED` | `true` after preview secret/configuration exists |
   | `SITE_PR_STAGING_ENABLED` | `true` only after the main controller and staging environment are ready |
   | Legacy `SITE_STAGING_ENABLED` | absent or `false`; do not activate the old exact-main publication path |

5. [Settings → Branches / Rules](https://github.com/oborskyivitalii/oborskyivitalii/settings/branches):
   protect `main`, restrict direct writes and require reviewed PRs/basic checks.
   The current main is unprotected; staging explicitly rejects it. Expensive full
   staging jobs should not become mandatory on each PR update.
6. Integrate the reviewed CI controller/reusable-workflow changes into `main`
   using existing PR #26. GitHub requires the dispatch definition on the default
   branch before **Run workflow** appears. Do not merge the unrelated failing
   #18/#22/#23 runtime stack as an activation shortcut; source integration is a
   remaining review step, not something credentials accomplish. Keep this work
   in #26; no extra activation PR. Preview can be exercised in #26 before that
   integration, after its preview environment/opt-in is configured.

## Operation and verification

After settings are saved, tell the agent: **“Cloudflare та GitHub preview/staging
налаштовані. Перевір конфігурацію й прев’ю PR #26; стейджинг поки не запускай.”**
The agent reads both provider settings and verifies the latest CI source,
artifact, actual preview URL and smoke status in the existing PR. Secret values
are never read back. GitHub's current plugin has no secret/environment/protection
administration or workflow dispatch tool; the owner performs those dashboard
steps and can press Run workflow. The agent never substitutes manual provider
upload if a dispatch capability is unavailable.

To stage an accepted PR, request **“Запусти стейджинг для останнього коміту PR #26.”**
Use **Actions → Site PR preview and staging → Run workflow → Branch main →
pr_number 26**. No URLs/hashes/files need transferring. The comment first shows
the immutable candidate and pending full checks, then the final outcome. The
stable URL changes only after full success; a moved PR/main requires a fresh run.

To inspect failure, open the linked Actions run and its smoke/full/promotion
reports. Do not label successful preflight/preview as full acceptance, rerun every
suite for report-only edits, change budgets to obtain green, or patch live assets.
No current project needs a custom domain, paid purchase or production release.

## Observed evidence and remaining acceptance

Initial hosted run [37423460431](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37423460431)
**failed**. HTTP, captures and Lighthouse passed; source/scanner/navigation/DOM
fixtures failed and Linux/Windows timed out. Its failures remain evidence.
Corrected source/static [37425628954](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37425628954)
passed source/SEO/generation/RI, lint, security/advisories and Color build. That is
preflight only; no second successful full hosted run or stable promotion exists.
See [the dated execution report](review/color-staging-20261006/REPORT.md).

The new flow is prepared, with local resolver/gate/recovery/HTTP/comment tests and
workflow parsing; provider credentials, owner GitHub settings, protected-main
activation and the first real CI preview/full staging remain to be verified.
Keep #8/#13 open. The 89.2 ms cold Writing result against 80 ms in the runtime
stack and separate independent/device/recovery acceptance remain unresolved.

Primary references: [Cloudflare branch controls](https://developers.cloudflare.com/pages/configuration/git-integration/),
[branch preview aliases](https://developers.cloudflare.com/pages/configuration/preview-deployments/),
[Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/),
[official Wrangler Action](https://github.com/cloudflare/wrangler-action),
[GitHub workflow dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).
