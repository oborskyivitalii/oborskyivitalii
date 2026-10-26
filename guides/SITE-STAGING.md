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

## Observation does not admit delivery

The canonical [issue122 decision matrix and observation interface](SITE-CHECK-PROFILES.md#delivery-routing-and-observation-contract)
define proposed repository/content/website routing. This section owns its
operational interpretation. T04's executable observer emits planned obligations
and a read-only workflow retains its report alongside current CI. It cannot
execute those obligations, accept result evidence or evaluate site reuse. Current
controller behavior, profile budgets, required contexts and publication authority
are unchanged. No new content publisher is installed.

Under the current route, a repository proposal still follows Ready source/RI/
owning checks, preview, owner staging, stable verification and admission before
protected merge. A Draft remains deferred. An observer may explain a proposed
cheaper route, but cannot skip those actions, approve rights, publish, merge or
reuse an earlier site's evidence. PR79/issue5 owns the unfinished content route.

### Honest obligation states and next actions

These states belong to each obligation, not merely to report generation. The
report's analysis status separately describes complete/conservative/invalid/
no-change input analysis. A successful analysis is never a test result.

| State | Required observation | Supported next action |
| --- | --- | --- |
| `planned` | Required check/gate identified; no matching completed result. | `run-current-checks`: execute its existing route or obtain its external decision. |
| `Draft-deferred` | Current workflow deliberately defers admission for a Draft; keep required obligations visible. | `finish-draft`: finish review/visual approval where applicable, then mark Ready through the existing process. A skipped deferred job is not a pass. |
| `running` | Actual matching current run/attempt has started and has no terminal result. | `wait`: inspect that run; do not launch duplicate work merely because it is slow. |
| `passed` | Actual complete successful evidence matches source/tree, policy/producer, profile/origin and run/attempt. | `continue-current-process`: proceed only to the next existing authorized action, such as owner staging after source admission. An observation grants no authority itself. |
| `failed` | Matching required execution failed, was incomplete, or was skipped without valid inapplicability. | `repair`: inspect retained failure, correct the owner or use the existing bounded retry rule when justified. Never select an older green attempt as current. |
| `cancelled` | Matching attempt was cancelled; preserve its partial evidence as incomplete. | `inspect-retry`: determine cause and use the current supported retry route; cancellation cannot inherit a pass. |
| `stale` | Earlier evidence no longer matches current head/base, policy/producer, applicable profile/origin or selected attempt. | `revalidate`: collect current identities, reassess affected review/checks and follow the existing fresh admission route. Keep original evidence attributed to its original source. |
| `inapplicable` | The actual owner establishes a bounded reason that this obligation does not apply; report that reason and evidence. | `continue-current-process` for remaining obligations. A proposed repository lane cannot establish current hosted inapplicability. |

Missing or incomplete collector/ref/policy inputs use `collect-inputs`; complete
unknown dependencies/types use `inspect-owner`. A verified complete empty
diff uses `no-change`, with no delivery permission; existing open-PR requirements
remain owned by the current controller. These action literals, together with the
table, are the complete observation `nextAction.action` vocabulary. An action is
advice, not a command dispatcher. List every blocking obligation; an unresolved
required gate prevents a completed-delivery claim even if some checks passed.

Recompute the observation when base/head, policy/producer or relevant capability
changes. Before side effects, the trusted controller must freshly authenticate
protected main, PR head and predecessor leases. A newer failed, cancelled or
running applicable staging attempt prevents using an older green attempt for
admission. For owner staging, the existing full-attempt retry rule below remains:
new owner `/stage` or Re-run all jobs, never mixed-attempt partial recovery.

### Repository identity and accepted website identity

The current repository/controller revision, tested candidate/tree, accepted
website source/tree, platform/content identity, public/package digests and actual
merged commit are separate records. A source-only repository merge cannot relabel
the old site's public bytes or test results at the new Git commit. The current
postmerge observer proves identical complete tested/merged trees; that is narrower
than future compatibility across different repository trees.

For proposed accepted site S → repository merge M → content C reuse, authenticate
S's original evidence and the complete intervening commit/parent history with
base-side dependencies, not only a final net diff. Any uninspected, reverted
intermediate, control, rights or website change prevents an unproved reuse claim.
Keep missing platform/content identities explicit. Use fresh applicable website
validation when compatibility is absent or unproved. The future compatible-history
implementation and real content release remain issue122 and issue5/PR79 work.

### Trusted producer prerequisite

Capability observation on **22 October 2026**: the repository API identifies
`oborskyivitalii/oborskyivitalii` as public and user-owned. Active
[ruleset 24568553](https://github.com/oborskyivitalii/oborskyivitalii/rules/24568553)
requires an up-to-date branch and the contexts `checks`, `Local navigation and RI
freshness`, `Staging admission`, each bound to GitHub Actions app ID `15368`;
there are no bypass actors. Revalidate the live API before a later migration.

GitHub documents [expected-app status binding](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-status-checks-to-pass-before-merging),
but [status-check matching excludes workflow, matrix and event identity](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules#troubleshooting-required-status-checks).
The documented stronger [ruleset-workflow mechanism](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules#troubleshooting-ruleset-workflows)
is configured at organization/enterprise level. Repository admin permission does
not establish that capability for this user-owned repository.

**Disposition: the future AC05 protection-bound producer proof is unresolved.**
The current app/name binding does not itself prove that a same-name result from
another candidate workflow is rejected. This is a capability/design inference
from the inspected configuration and documentation, not a performed exploit.
Current internal source/workflow/actor/attempt/lease checks remain valuable and
unchanged; they cannot substitute for proof at the protection boundary.

Before W3 or any cheaper authoritative admission is activated, its separately
approved implementation must demonstrate all of the following against the
actual protection configuration:

1. A trusted evaluator and pre-change policy outside candidate control; changed
   policy/wrapper inputs preserve their previous obligations and control override.
2. A separately trusted issuer/controller, whose credentials and authoritative
   check production are inaccessible to executed candidate code. Pinning an
   evaluator checkout alone does not isolate its producer.
3. The required check actually consumes that issuer identity. Reject a same-name
   result from a wrong workflow/producer/event and wrong source/run/attempt at
   the protected merge boundary, not only inside a unit fixture or JSON report.
4. Supported Draft/Ready/update/refresh/merge lifecycle, complete selected-job
   accounting and explicit valid inapplicability. Missing, failed, skipped,
   cancelled, stale or mixed-attempt required evidence blocks; no Pending deadlock
   or skipped-success bypass is accepted.
5. A protected migration and recovery sequence that preserves current required
   checks until the replacement is proven. Current head/main/predecessor leases
   remain fresh before side effects, and accepted-site identity survives repo merges.

T02 may finish with this evidenced unresolved disposition. It does not complete
AC05 or authorize a new service, credential, organization move, settings change
or alternate release mechanism. A revised design needs separate maintainer
approval **and still needs the actual AC05 proof**; approval does not waive it.
The existing delivery process remains in force while that requirement is open.

### Trusted change admission and repository delivery

Issue122 R2 reuses the existing classifier, App5453173 and owner staging. It
adds no publisher or general control certifier. The enabling PR uses the original
full route. Live activation and real lane outcomes belong to the owning issue;
source preparation alone does not establish protected-main delivery.

#### R1: one explicit admission request

In Actions, select **Change admission preparation**, **Run workflow**, branch
**main**, and enter one PR number. Only the repository owner can request it.
Push/comment/upstream events never dispatch admission or enumerate other PRs.
The App job checks out protected main and reads candidate Git objects as data.
It never loads candidate modules or installs candidate dependencies.

The summary and retained JSON bind controller/base, candidate commit/tree,
classification, selected run/attempt/jobs, blockers and next action. Expected
Draft/stale/incomplete/failed evidence is an admission refusal: the App check
stays failed while completed evaluation succeeds. API/authentication, malformed
or foreign identities, dirty controller and storage/protocol faults fail hard.
A green evaluation workflow is not a green admission check.

#### R2: selected repository route and reviewed controls

| Delta against current protected main | Work and operator action |
| --- | --- |
| Complete explicitly owned rules/review/RI metadata only | Basic formatting/lint/architecture and affected source tests; existing navigation/RI and owning acceptance. No website build/package/preview/staging/alias/publisher work. After these checks, dispatch the PR number once. |
| Content, website, mixed, unknown or unsupported impact | Conservative existing full route until R3 integrates content. Finish Basic/RI/owning checks, owner `/stage`, then refresh PR admission and dispatch. |
| Executable tools/tests, workflows/actions/acceptance or declared controls | Same full route, plus explicit review of the complete diff and **reviewed_sha** equal to the full current head. A missing/wrong/old SHA refuses. It cannot waive any failed/missing full obligation or grant the repository exemption. |

The protected-base classifier, not a candidate wrapper/catalog label, chooses
eligibility. Both raw Git endpoints and all modes are inspected; moves retain
both sides. Exact rights/public inputs still select website work. An RI executable
is a control even when its purpose is repository-only; its actual failing checks
block. The broader observation report remains advisory and preserves its full
planned baseline; the trusted selection report records actual conditional work.

Control attestation is the maintainer's explicit trust decision on the exact
candidate, not automatic semantic certification. Review must preserve applicable
pre-change obligations and failure propagation, including modified test/policy
wrappers. Candidate code remains in existing scoped jobs. The issuer still
requires the trusted-main workflow's mandatory jobs and independently uploaded
receipt; correct-named candidate results or modified policy cannot select that
receipt. Review a new head again rather than copying an old attestation.

Owner staging is globally serialized, but evidence selection is per PR/head/base.
The main-owned run title identifies the requested PR before candidate work; a
single binding in the completed trusted target job log proves head/base/run/attempt.
The early native artifact remains diagnostic; candidate jobs cannot use its mutable
metadata to establish an older-head exemption. Only then does newest
applicable attempt precedence apply. Another PR and a resolved older head are
irrelevant. A running/cancelled same-PR attempt whose target is unresolved blocks
older green conservatively; failed attempts are not hidden by a success-only
receipt filter. Genuine ordinary comments whose entire job inventory was skipped
remain inapplicable. Required skips/failures/cancellation/missing or mixed attempts
never become passed; optional exhaustive diagnostics keep their original status.

The final main-owned `change-admission-receipt` still requires its exact successful
upload step, unique nonexpired native artifact/digest and run/controller binding.
The App consumes exact workflow identities and attempt-specific job inventories.
No candidate code enters its credential job. Repository postmerge verifies the
actual normal merge parents/tree and App producer bound to the previous protected
base. It records website work as inapplicable and never relabels the accepted site's
original source/public/package digest at a repository merge. The initial cheap postmerge
route uses a normal two-parent merge; existing website squash/rebase observation
retains its previous full-proof behavior.

#### Ordered protection activation and recovery

The actual `protect-main` ruleset24568553 starts with Actions15368 contexts
`checks`, `Local navigation and RI freshness`, `Staging admission`, strict
up-to-date enabled and no bypass actors. Preserve PR/deletion/force-push rules.

1. Deliver the enabling control PR through that unchanged full route and verify
   postmerge. The implemented conditional route does not itself change settings.
2. Prepare the one meaningful repository-only acceptance PR and its exact source,
   independent roles, Basic/RI/owning results and genuine App check. Its old
   `Staging admission` consumer authenticates that App check rather than creating
   a site exemption without trusted admission. After dispatch completes, edit the PR description once to trigger the existing
   `edited` admission/owning refresh (for example, add the exact run link).
3. Add **Change admission from App5453173** and the already executed Actions15368
   **Owning issue deterministic acceptance mapping** context. Retain the original
   three required contexts, including the now conditional `Staging admission`.
   Its repository branch checks evidence without website staging; keeping the guard
   preserves same-head attempt revocation. Verify numeric producers, strict
   up-to-date and no bypass. Merge with an expected-head lease; no protection gap.
4. Observe actual repository postmerge and unchanged accepted site source/artifact.
   Save exact native runs/settings and queue/setup/execution observations in #122.

Each manual evaluation first creates its own source/base-bound Actions aggregate
checkpoint before App authentication. Eligible App results remain in progress until
native report upload and a fresh bound evaluation. The last aggregate operation runs
after App finalization and credential revocation, updates only its recorded check ID,
and fails if any preceding step or final head/base lease failed. Cancellation leaves
non-success; another request's or stage's checkpoint is never completed by this run.
The eligible PR consumer authenticates the completed issuer workflow and current
source/owning evidence. These existing contexts add no website work for repository PRs.

Manual refresh alone cannot synchronously revoke an old green. The actual strict
up-to-date protected rule rejects a head lacking current main; the issuer checks
current head/base before and after collection and again before success. A moved
head/base requires fresh checks and dispatch. Expected-head merge prevents
following a changed candidate. These controls do not authorize public release.

**App outage / control repair:** first restore the original three Actions15368
requirements **alongside** the App; verify strict/current-base and no bypass.
Then remove the unavailable App requirement. Do not remove old protection first.
For a repository repair PR, explicit owner `/stage` still forces the full existing
build/staging route even though automatic preview is inapplicable. After explicit owner staging completes, edit the PR description once to refresh
`Staging admission` and owning acceptance. The old
`Staging admission` consumer accepts only a genuine App decision or the complete
original full staging proof; postmerge follows the same protected full fallback.
Complete all original checks and merge normally. Restore the App alongside the full requirements after repair,
verify its exact producer/result, retaining the conditional aggregate and owning requirement. No admin
merge bypass, disabled ruleset, persistent exemption or candidate issuer is used.
Settings access/recovery availability and control route verification are activation
conditions; keep old requirements if a concrete condition is unavailable.

#### Exact proposed App setup and bounded proof

The later [control-change structural prototype](SITE-CONTROL-CHANGES.md) is a
separate, credential-free preparation step. It supplies no admission authority
and does not relax the current rejection of execution-control changes.

Do not apply this credential/configuration proposal without its explicit owner
decision. T05 approval already permits reversible code/test preparation.

1. Register a private App, suggested name `oborskyi-change-admission` (availability
   unverified), with this repository as homepage and no webhook receiver. Grant
   only repository Checks:write, Commit statuses:write and implicit Metadata:read;
   install it only into this repository. No content, PR, deployment or admin
   write permission and no paid/external controller service is needed.
2. Create environment `change-admission` with selected **branch** exactly `main`,
   no tag rule and administrator bypass disabled. Read back those restrictions.
   A ref filter is not a workflow allowlist: all secret-consuming code still
   needs review. Never execute candidate code, local actions, dependency hooks
   or candidate caches in that job.
3. Put the private key only in environment secret
   `CHANGE_ADMISSION_APP_PRIVATE_KEY`; put numeric nonsecret App/installation IDs
   in environment variables `CHANGE_ADMISSION_APP_ID` and
   `CHANGE_ADMISSION_INSTALLATION_ID`. Never put the key in chat or an ordinary
   repository secret. Verify the installation and distinct numeric App identity.
4. Set repository variable `CHANGE_ADMISSION_ENABLED=true` **last**, after the
   reviewed controller reaches main and setup is verified. Until then, the
   configuration observation explicitly says not configured; no App result is
   issued and the environment/credential job is not requested.
5. Separately approve an isolated `probe/issue-122-change-admission` target and
   exact temporary rule requiring `Change admission` from that numeric App,
   strict up-to-date comparison and no bypass. The collector and staging still
   accept **main-target PRs only**. For an executable SHA-binding proof, create
   two harmless verification PRs sharing exactly the same head SHA: one targets
   main and follows the complete existing source/preview/owner-stage/admission
   route; the other targets the isolated branch initially at the same main SHA.
   Put `Refs #122` in both bodies. No merge into main occurs during this proof.
   The genuine App result is produced for the main-target PR; GitHub consumes
   that same SHA-bound check at the isolated target. Satisfy other applicable
   rules and retain native denial for missing check/same-name Actions green,
   then genuine acceptance/merge into the isolated branch. Wrong-evidence,
   cancellation/attempt/head/main probes must still return blocking results.
6. Record exact refs/rules/native outcomes, final staging identity and recovery
   artifacts before closing the main-target verification PR unmerged. Remove
   only the temporary isolated rule/ref; retain the tested source and receipts.
   Do not relabel the accepted staging source or claim rollback without a real
   CI recovery. Main's original three requirements stay intact throughout.

That isolated proof establishes App/SHA binding at the tested target, not
per-PR policy enforcement or synchronous freshness on main. It does not prove
that the collector accepts a probe-base PR; that path deliberately rejects.
Unsupported control changes, asynchronous freshness and a protected migration/
recovery route must be resolved before the later authoritative lane transition.
App registration, setup and native proof are not established by unit fixtures.

If source work is running, wait for it. Correct failed work and use the existing
full staging retry route, then the owner dispatch described above; never mix attempts. If issuance is
interrupted, restore the environment-only key/installation or event route and
repeat the single-PR dispatch from current main. Inspect the named controller run and retained
blocking diagnostics. The adapter uses a repository-scoped short-lived token,
revokes it after use and never falls back to the Actions identity. Missing or
failed setup is not an authoritative pass. This preparation does not authorize
changing protection as a recovery shortcut.

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
as success. A temporarily missing expected file (404), including a new immutable
snapshot, also waits within this same deadline. A permanent missing file still
fails; TLS/origin, security-header, MIME and other status errors do not poll.
Exhausted convergence remains a failed promotion or recovery. This polling never
dispatches another staging workflow or reruns browser/performance cases.

Ubuntu preview smoke and bounded staging prepare the official primary archive
through `tools/quality/ubuntu_downloads.py`, shared with the production Linux job.
It preserves signed repository metadata and package/engine requests while applying
the existing bounded APT transport settings. Fixture/wiring checks run in navigation
and the enduring Python suite. Native installation and actual browser reports are
still required; changing a mirror does not prove identical OS package versions.
The owner controller executes its protected-main workflow; a candidate workflow
repair needs the existing candidate evidence route and protected admission.

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

PR79 includes a finite build-CLI bridge for the exact82b57b89 main controller,
which predates the locked publisher install and explicit article-preview mode.
Only its main workflow/ref/event, original workspace and color-artifact command
can prepare the already pinned publisher and declared article preview. Explicit
modes, nested validation, ordinary builds and production remain on their existing
paths. Admission, all source/scanner/browser gates, protected publication and
recovery still belong to the trusted controller. Remove this bridge after the
updated workflow is integrated into main; a newer controller cannot select it.

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
preflight never grants production eligibility or deployment authority. The CLI uses two slots for independent guards, with source tests and security scans running alone; package proof and final identity checks wait for preceding work. Commands, per-process time/output bounds, failure retention and the overall controller budget stay unchanged.

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

Source tests and security scans have exclusive CPU phases; other independent preflight guards retain at most two slots. Package proof and final identity checks remain barriers. Lossless WebP uses the faster method4 encoder setting at quality100; RGBA, ICC, dimensions, originals, input/output limits and pinned codec verification remain mandatory. The reviewed R18 slide bytes are identical to method6.
