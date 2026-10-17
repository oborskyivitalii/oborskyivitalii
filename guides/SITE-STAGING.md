# PR previews and explicit staging

Current Cloudflare-only staging implementation owner:
[#72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72). New controller
code, repository settings and observed host acceptance are separate observations;
the historical runs below prove only their exact editions. The 16 October
maintainer amendment retires the GitHub Pages staging publisher; Pages is reserved
for production. Earlier served Pages bytes are historical until the production
cutover/removal is observed; removing a workflow does not unpublish a live site.

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

Custom-domain production planning is in [SITE-PRODUCTION](SITE-PRODUCTION.md).
The Cloudflare controller below remains the preview/staging route.

| Trigger | Address | Checks |
| --- | --- | --- |
| Open/update a same-repository Draft PR | `https://pr-N.oborskyi-author-ci-staging.pages.dev` and an immutable version URL | Generated output, public script syntax, package/snapshot/size integrity and bounded HTTP identity. Source/lint/RI/acceptance and browser admission are deferred visibly. |
| Mark the visually approved PR ready | Same PR preview | Required Basic/style/lint/RI/owning-issue source admission and existing two-width Chromium preview smoke. |
| Owner posts exactly `/stage` in an open PR, or manually dispatches its number from main | Immutable candidate, then `https://staging.oborskyi-author-ci-staging.pages.dev` after success | Exact source/package/HTTP checks, lint/security/advisories and bounded staging regression: Chromium/Firefox all-route journeys, selected failure/navigation/analytics, two mobile Lighthouse trials and bounded CPU/flight samples. |
| Owner applies `staging-regression` to an open same-repository PR | Immutable preview candidate URL | The bounded staging regression records exact candidate evidence; it does not update the stable staging alias. |
| Optional manual full candidate diagnostic | Exact selected public artifact and, when provided, its immutable HTTPS origin | Full regression retains all engines/native platforms, complete cases, thirty Lighthouse runs and soak/captures. It is nonblocking and does not publish production. |

Only the pinned official Wrangler Action deploys candidates, stable staging and
rollback. CI resolves the current open PR head, public/package artifact identities
and URLs. No files, hashes or artifact IDs are copied by the operator.

The controller rejects forks, stale PR heads, moved or unprotected main, wrong
artifacts, incomplete/failed selected staging regression, invalid recovery and
an untracked stable alias. A preview report cannot authorize stable promotion.
Before `/stage`, mark the visually approved prototype ready and wait for actual
successful latest raw-head `site-checks`, `navigation` and owning-issue jobs.
Skipped, failed, running or missing jobs never admit staging. Update from current
main before staging; a moved source/base invalidates merge admission.
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
The staging edition is generated before hashing/testing: visible STAGING/source
badge, HTML `noindex,nofollow`, no production analytics SDK or verification token.
Its CSS uses existing theme tokens. JSON-LD formatting is compacted without
changing data to retain the original HTML budget. Removing staging metadata
requires a separately frozen production artifact. Full diagnostics on it are optional.

PR40 publication packaging explicitly selects `immutable-snapshot-proxy-v1` in
its existing package CLI, alongside clean-checkout rights verification. The policy
adds source-derived exact same-site200 rules only for admitted immutable snapshot
HTML; public source files, aliases, headers and performance budgets stay unchanged.
Default and explicit-legacy APIs and archived legacy verification retain their
original behavior. Draft HTTP verification observes every selected snapshot's
200, zero redirects, exact body, MIME and immutable cache policy. The existing
staging HTTP inventory checks those same conditions on its original requests.
These HTTP observations add no requests or allowances to measured flight windows;
local fixtures cannot establish actual Cloudflare behavior or native performance.

The reusable workflow distinguishes `validation_level` from hosted `profile`.
The owner staging controller selects `validation_level: staging`,
`profile: staging`, and `automated_only: true`. It runs successful build/static/host/staging
jobs and promotes only their matching `staging-gate`, whose `fullGate` and
`productionEligible` remain false. The operational target is at most 15 minutes
of active staging jobs; measure the actual run and report queue time separately.

For an optional full candidate diagnostic, `validation_level: production`
and `full: true` select the complete regression; production is the reusable
workflow's default validation level. A full validation can test an immutable
staging origin using `profile: staging`; real production indexing/origin checks
use `profile: production`. These origin policies do not change the coverage
level. The strict `tools/quality/promotion.cjs` and GitHub Pages example still
require the full hosted gate and external device/independent acceptance; the
lighter `staging-gate` is rejected as full evidence. Production instead uses the
separate staging-policy derivation bound to identical accepted source trees. Color is selected explicitly for the frozen production candidate; staging-edition bytes never qualify. Production activation and first-release acceptance remain with
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

Historical runs proved Cloudflare credentials/account/project, both opt-ins and
protected main for their controllers. Pages and the new merge requirement below
need their own authenticated setting and deployment evidence.
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

For the staging controller, retry with **Re-run all jobs**, or create a
new owner `/stage` request. **Re-run failed jobs** is not supported: reused jobs
and admission outputs can belong to an earlier attempt, so they cannot prove one
complete accepted attempt. Admission validates the actual run attempt and blocks
mixed-attempt evidence. A retry does not reuse an earlier successful check as its
admission.

Recovery records retain the original package producer attempt separately from
the promotion attempt. Historical promotion-only retries retain their exact
tested package ID/upload digest and producer name; legacy records keep their
original matching attempt. This recovery compatibility does not authorize a
partial retry of the current controller. No browser report, failed
observation or artifact is relabeled.

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

The PR's single status comment shows the permanent alias first, immutable candidate, source and linked
preview/staging result. Only a complete matching staging gate updates stable
staging; it does not assert full production regression or release acceptance.
Promotion retains the successful package/recovery for 90 days; subsequent runs
locate the last real successful promotion, verify its attempt/digests and restore
it through the official action if stable verification fails. Disabled/skipped
runs never replace recovery. Expired recovery blocks promotion. The first stable
promotion has no earlier accepted package to restore. Historical recovery records may include an older Pages mirror result; its
compensation status remains validated when selecting that old Cloudflare package.
New staging attempts publish and recover only Cloudflare.

Production GitHub Pages follows issue #39's staging-then-smoke policy. Rights,
protected owner dispatch, archive identity and recovery remain required; optional
full/device diagnostics are not publication dependencies. Staging and full-production failures are recorded
under their actual profile without relaxing performance limits or patching
served files. At owning-issue completion review added/changed tests against PR,
staging, production and diagnostic coverage; update the profile registry and
RI/CI routes as required by SITE-CHECK-PROFILES.

## One pre-upload preflight and Cloudflare admission

Before an explicit stable-staging or optional full diagnostic upload, prepare the
selected frozen artifact once, then run the existing local check owner:

```sh
node tools/quality/local.cjs --prepublication staging color-artifact --report quality-reports/prepublication.json
node tools/quality/local.cjs --prepublication production quality-artifact --report quality-reports/prepublication.json
```

Use the command for the selected edition, with the complete pinned Node and
Python scanner toolchain installed. The mode consumes those exact frozen
bytes, runs existing source/Python/style/RI/generated/scanner/selftest and
edition/rights/package guards, and retains each independent failure and raw
streams. An invalid artifact blocks its dependent checks explicitly. Final
source, manifest and public hashes must still match. Reports belong outside
source or in an ignored output directory. This preflight is required before
deployable upload for explicit staging/evidence and the optional full diagnostic;
the production-candidate freeze instead authenticates successful staging without
repeating its checks. Ordinary Draft preview keeps its existing bounded path. Diagnostic reports are
retained even when preparation fails. The later native upload identity binding,
host/browser/performance/live leases and release decisions remain mandatory;
preflight never grants production eligibility or deployment authority.

Run the separately selected current owning-issue policy on that same clean
source before preparation; the enduring Python runner excludes numbered task
policies deliberately. Use the existing acceptance selector and the current
issue's `.github/acceptance/issue-N.json`, then run:

```sh
python3 tools/issue_acceptance.py validate --policy .github/acceptance/issue-N.json
python3 tools/issue_acceptance.py run --policy .github/acceptance/issue-N.json --require-clean --expected-source FULL_COMMIT_SHA --report /tmp/owning-acceptance.json
```

Replace the placeholders with the selected owner and exact candidate. Ordinary
`/stage` enforces fresh raw-head Basic, RI and owning acceptance through
`begin-admission.requireAdmission()` before its build/upload job. Prospective
production preparation also requires the separate selected-policy result in
its operator sequence. The prepublication report does not assert that an
owning policy ran, and does not run unrelated historical task policies.

The staging build retains its preflight and raw scanner reports in one native
artifact. The reusable validation workflow authenticates its ID, upload digest,
run/controller and exact attempt, then verifies the complete successful guard
set, source/tree/edition/manifest and retained file hashes. Its build/static jobs
consume those original reports instead of rerunning source checks or scanners.
Direct reusable staging requests without a producer report still execute one
preflight. Production retains its existing full validation route.

Original lint/security/advisory reports are host-independent (`target: null`).
They are never relabelled as HTTP observations. Hosted/browser/performance
reports still require their exact tested candidate URL. Wrong-source, missing,
failed, changed or different-attempt evidence fails before promotion.

Before each owner staging attempt the trusted main controller creates a fresh
in-progress `Staging admission` API checkpoint. Successful Ready source/RI/owning checks,
the complete bounded staging gate and verified Cloudflare stable promotion are
required. GitHub Pages settings, publishers and browser smoke are not part of
staging admission. Failed/cancelled attempts remain failed; previous green checks
cannot admit a new attempt.

GitHub does not accept Actions checks from `issue_comment` or `workflow_dispatch`
as required PR checks. After the successful staging attempt, record its exact
result in the PR body through the owner's normal GitHub session or connector.
The existing workflow handles that `pull_request: edited` event with a separate,
read-only `Staging admission` job. It authenticates the actual latest owner-main
attempt, source admission, promotion, current protected main and identical
prospective merge tree. It ignores ordinary same-name jobs as evidence and
rejects a newer failed/incomplete attempt. A bounded wait covers an owning-policy
run started by the same edit; missing or failed proof is never retried as success.
This refresh does not build, publish, scan or rerun browser tests. It has its own
concurrency group, so prose edits cannot cancel a preview. Draft/inapplicable
events use distinct deferred names; a skipped job cannot impersonate admission.
The ordinary Ready job fails closed until the exact source is actually staged.
See [GitHub's event eligibility rule](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

The read-only postmerge observer authenticates the actual successful owner/main
attempt, Cloudflare promotion and merge admission, and requires identical complete
source trees between the tested PR and merge. Preserve the tested package without
rebuilding main. Add `Staging admission` to strict `protect-main` through the
existing administration route after the new controller is integrated and observed;
retain the existing Basic/navigation contexts. Actual settings evidence remains
separate. `SITE_PRODUCTION_ENABLED` stays absent/false during preparation.

The retired `SITE_PAGES_STAGING_ENABLED` variable has no staging consumer. The
former Pages staging publisher workflow is removed. New production composition
contains only the admitted production root, with null staging/source/license
receipts. HTTP checks require retired `/staging/` paths to return the owned 404.
The authenticated predecessor remains unchanged as a complete recovery package;
legacy package verification remains for historical/recovery consumers. Canonical
migration from the current project-prefix origin, live deployment and actual
compensation remain separate #39 cutover acceptance, not fixture results. See the scoped
[execution record](../review/issue-72/2026-10-16-cloudflare-only-staging.md).
