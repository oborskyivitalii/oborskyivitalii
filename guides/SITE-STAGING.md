# PR previews and explicit staging

Owner intent: [hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8)
and [release gates #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13).
[Test optimization #35](https://github.com/oborskyivitalii/oborskyivitalii/issues/35)
supersedes the full-staging schedule with the bounded regression owned by
[SITE-CHECK-PROFILES](SITE-CHECK-PROFILES.md). Earlier accepted records below
remain evidence only of their exact editions; revalidate current settings/source
through the live owners.
Controller PRs #26/#29 and runtime PR #23
are accepted in protected main. CI-only PR #30 added bounded exact-byte alias
convergence and package-attempt lineage. Reading/contact/Home PR #28 is merged
at `07f936a8733f56d73f34b89e2ad96d1b2ef605c7`; its corrected exact-source
full/stable acceptance is recorded in
[run 37549451723](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37549451723).
Earlier failed promotion attempts remain failed historical evidence.
Read [MEMORY](../MEMORY.md), the live owning issue/PR and current run/deployment
records for the latest candidate, source and acceptance. This runbook defines
mechanics; a historical accepted run does not admit a later candidate.

## Deployment flow

| Trigger | Address | Checks |
| --- | --- | --- |
| Open/update a same-repository PR | `https://pr-N.oborskyi-author-ci-staging.pages.dev` and an immutable version URL | Focused source, controller, package and HTTP checks; Chromium at 1440/390 widths; Color effects checked when that exact source supports them. |
| Owner posts exactly `/stage` in an open PR, or manually dispatches its number from main | Immutable candidate, then `https://staging.oborskyi-author-ci-staging.pages.dev` after success | Exact source/package/HTTP checks, lint/security/advisories and bounded staging regression: Chromium/Firefox all-route journeys, selected failure/navigation/analytics, two mobile Lighthouse trials and bounded CPU/flight samples. |
| Owner applies `staging-regression` to an open same-repository PR | Immutable preview candidate URL | The bounded staging regression records exact candidate evidence; it does not update the stable staging alias. |
| Explicit full candidate validation before production | Exact selected public artifact and, when provided, its immutable HTTPS origin | Full production regression retains all engines/native platforms, complete cases, thirty Lighthouse runs, soak/captures and external release gates. This validation does not publish production. |

Only the pinned official Wrangler Action deploys candidates, stable staging and
rollback. CI resolves the current open PR head, public/package artifact identities
and URLs. No files, hashes or artifact IDs are copied by the operator.

The controller rejects forks, stale PR heads, moved or unprotected main, wrong
artifacts, incomplete/failed selected staging regression, invalid recovery and
an untracked stable alias. A preview report cannot authorize stable promotion.
Staging requests are serialized. Ordinary/bot PR comments never authorize staging or share its queue.
Only a newly created exact `/stage` command whose commenter and event actor are
the repository owner is accepted. Edited comments do not trigger a deployment.
The evidence-only `staging-regression` label likewise requires the repository
owner's label event, matching sender/actor and an open same-repository PR. It uses
its own concurrency group and does not authorize stable promotion. This permits
reviewing a changed staging implementation before it reaches protected main;
the existing `/stage` route still runs from protected main.

The source edition selects base or the authored Color rendition explicitly in its
artifact. A pipeline-only PR based on main retains its unchanged source rendition. The
accepted Color runtime is on main; stage the current open follow-up PR to test
its exact source and supported rendition.
All served HTML/runtime bytes are verified against the selected artifact.

The reusable workflow distinguishes `validation_level` from hosted `profile`.
The owner staging controller selects `validation_level: staging`,
`profile: staging`, and `automated_only: true`. It runs successful build/static/host/staging
jobs and promotes only their matching `staging-gate`, whose `fullGate` and
`productionEligible` remain false. The operational target is at most 15 minutes
of active staging jobs; measure the actual run and report queue time separately.

For explicit pre-production candidate validation, `validation_level: production`
and `full: true` select the complete regression; production is the reusable
workflow's default validation level. A full validation can test an immutable
staging origin using `profile: staging`; real production indexing/origin checks
use `profile: production`. These origin policies do not change the coverage
level. The strict `tools/quality/promotion.cjs` and GitHub Pages example still
require the full hosted gate and external device/independent acceptance; the
lighter `staging-gate` is rejected for production admission. Color stays
staging-only. Production activation and first-release acceptance remain with
#8/#1/#7.

## Verified provider and first preview

Account `3b938b72a4ad0ac10b9102e0534e75c0` contains one Pages project:
`oborskyi-author-ci-staging`, Direct Upload, no Git source, production branch
`production-disabled`. Its settings need no change. The former
`oborskyi-site-staging` returns `8000007: Project not found`; do not recreate it.
The bare project address is unused; named PR/staging aliases are the addresses.

The first Color CI preview passed in run
[37431551806, attempt 2](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37431551806),
source `1deed630ca10033eda9264d18379bf571b4f0bf8`, deployment `1aa74c51`.
[Its immutable version](https://1aa74c51.oborskyi-author-ci-staging.pages.dev)
retains that rendition while the PR alias follows subsequent PR changes.
Publish, exact HTTP identity and the two-width Color smoke passed. This is not a
complete hosted staging pass. The historical initial full run failed; corrected
preflight passed separately. Every full-stage failure remains evidence.

## One-time owner settings

1. Cloudflare API Tokens: custom permission **Account → Cloudflare Pages → Edit**,
   restricted to the account above. Store the value only in GitHub secrets.
2. [GitHub Settings → Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments):
   create `preview` and `staging`, each with secret `CLOUDFLARE_API_TOKEN`.
   Preview has no wait/reviewers/branch restrictions. Staging permits only the
   `main` branch; no wait timer or extra reviewers are needed for an explicit
   owner command. Additional reviewer rules deliberately require that approval.
3. [Actions repository variables](https://github.com/oborskyivitalii/oborskyivitalii/settings/variables/actions):

   | Name | Value |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | `3b938b72a4ad0ac10b9102e0534e75c0` |
   | `CLOUDFLARE_PAGES_PROJECT` | `oborskyi-author-ci-staging` |
   | `SITE_PR_PREVIEW_ENABLED` | `true` |
   | `SITE_PR_STAGING_ENABLED` | `true` after the reviewed controller is integrated into protected main |
   | Legacy `SITE_STAGING_ENABLED` | absent or `false` |

4. [Protect main](https://github.com/oborskyivitalii/oborskyivitalii/settings/branches)
   with reviewed PRs and basic checks; expensive staging suites are not required
   for every PR update. Staging requires the live API to report `protected: true`.
5. Both command and dispatch definitions must exist on the default branch.
   This is complete: reviewed infrastructure #26 is already merged. Stage the
   current open runtime PR through its applicable staging profile before merging
   it; staging resolves an open PR head.

Preview and staging credentials/account/project, both opt-ins and protected main
are proved by successful deployments. No additional owner setup is needed.
Full run [37524167715](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37524167715)
accepted #23 source `5577be8a13400f76d348b992688e3e2b1992e455`, tree
`fbb0d0b6ada3305c6aae3334a6003a25a425db6b`, and verified stable staging before
merge. This evidence applies to that edition; changed follow-ups need fresh gates.
The older failed full runs remain retained.
The connector cannot read or write GitHub environment/secrets/variables
administration. A successful deployment proves the credential used for that job
without exposing its value.

## Operation

After successful official deployment, stable and rollback verification allow a
bounded 60-second convergence interval with two-second polls. Every observation
is retained, and success still requires all ten exact file hashes, headers,
root and real-404 checks. The existing 20-second request and 15-minute promotion
job limits remain. A preceding revision during alias propagation never counts
as success; exhausted convergence remains a failed promotion or recovery.

Recovery records distinguish the original package producer attempt from the
promotion attempt. A promotion-only retry must reuse the exact tested package
ID and upload digest. Future recovery validates its name against that producer
attempt; legacy records retain their original matching attempt. No browser
report, failed observation or artifact is relabeled.

After enabling preview, subsequent PR commits publish automatically. Changing
settings alone does not trigger a run: use the latest source run's **Re-run all
jobs** once if necessary. The agent can instead publish a meaningful PR update.

After owner settings and reviewed main integration, request staging of the
current Color PR. The agent can post `/stage` through the GitHub connector;
that comment invokes Actions from main and the agent follows the result. Manual
alternative: **Actions → Site PR preview and staging → Run workflow → main →
pr_number**. No direct provider upload is substituted.

Complete the bounded staging regression and stable verification while the PR
remains open, then merge the tested head. The controller rejects a merged/closed
or moved PR; merging first does not publish staging. Main updates do not automatically publish
production GitHub Pages under the current repository workflows.

The PR's single status comment shows the immutable candidate, source and linked
preview/staging result. Only a complete matching staging gate updates stable
staging; it does not assert full production regression or release acceptance.
Promotion retains the successful package/recovery for 90 days; subsequent runs
locate the last real successful promotion, verify its attempt/digests and restore
it through the official action if stable verification fails. Disabled/skipped
runs never replace recovery. Expired recovery blocks promotion. The first stable
promotion has no earlier accepted package to restore.

Production GitHub Pages and physical-device/independent release acceptance retain
their existing requirements. Staging and full-production failures are recorded
under their actual profile without relaxing performance limits or patching
served files. At owning-issue completion review added/changed tests against PR,
staging, production and diagnostic coverage; update the profile registry and
RI/CI routes as required by SITE-CHECK-PROFILES.
