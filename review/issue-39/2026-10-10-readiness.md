# Issue 39 — 2026-10-10 production readiness

Owning issue: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39).
Owning PR: [Draft #40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Role: root self-analysis, with separate read-only provider, release-code and
release-evidence audits. This report assesses readiness; it does not authorize
merge, production deployment or routing changes.

Inspected live main: `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`, tree
`dc4323f37467157ee8e1b9c8ba9752bb889acbfb`. Preparation PR head before this
report: `47e97ce97083783a4de33123064c6429605c0718`, tree
`63e5c519da19d8474da8e4fbcf6c0dfeb59dd749`; Draft, unmerged, mergeable=false,
mergeable_state=dirty. The preparation baseline remains `ec9b8361`.

Read README, AGENTS, CONTRIBUTING, MEMORY, relevant REPOSITORY-MAP entries,
acceptance, site source, staging/release/profile/SEO/analytics contracts, PR40
plan/runbook/policy, current workflows and their source validators. Only root
AGENTS exists. Live issues39/1/8/13/7, PR40/67, workflow and provider evidence
were inspected. Old MEMORY and 7 October inventory are historical evidence.

## Intent and acceptance

Prepare GitHub Pages at `https://vitaliioborskyi.ai`, with permanent one-hop
`.com` and `www.com` redirects preserving path/query, while preserving current
exact-artifact release controls and Cloudflare staging. AC01–AC05 remain unchanged.

**Verdict: not ready for a compliant production release.** The plan and staging
are available; production build, publisher, provider admission and live acceptance
are incomplete. This is implementation work, not only a Publish button or DNS switch.

## Findings

| ID | Evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Live refs and PR40 | Preparation is still Draft and conflicts with main. Its frozen preparation test compares protected public/runtime/workflow paths to ec9b8361. Reconcile scope/policy before rebase; do not silently weaken this historical check. | AC01/04 | open |
| F02 | Cloudflare live API | Both zones active; .ai has exactly the existing ownership TXT, no routing A/AAAA/CNAME; .com DNS empty. No redirect entrypoint, Page Rules or Worker routes. Domain traffic and redirect are unconfigured. | AC01/02/05 | open |
| F03 | GitHub connector capability tests | GET Pages and environment administration rejected as unsupported; branch-protection read returns403. Main reports protected=true, but actual protection/environment details remain unobserved. Repository admin permission does not establish connector administration support. | AC01/04 | open |
| F04 | Current .github/workflows; inactive deploy-pages.example.yml | No active protected GitHub Pages publisher or production rollback. Existing Cloudflare controller/recovery cannot publish or recover GitHub Pages. | AC03/05 | open |
| F05 | Current site/templates/head.html, docs inventory, tests/content.test.cjs, check_site_seo.cjs | Canonical/og:url, robots/sitemap and snapshot indexability are missing. Draft-era tests reject production URL metadata; production build must update those contracts and preserve publication identities. Missing CNAME is not an Actions-based Pages blocker: provider domain setting is authoritative. | AC03/05 | open |
| F06 | Current site-candidate-evidence.yml and validate.cjs | Full preflight sets automated_only=true/full=true without base_url; validator requires full and a hosted URL. This static wiring mismatch prevents a passing aggregate; no expensive run was dispatched to reproduce it. | AC03 | open |
| F07 | Main docs/site-revision.json; staging gate; Color source contract | Main docs is base; stable staging is a distinct Color artifact. Color production requires explicit selection, source/package policy and complete same-byte acceptance. Current release source guard admits Color only with profile=staging. Publishing base would change the appearance relative to staging. | AC03/05 | open |
| F08 | Current staging evidence and issues1/8/13/7 | Current staging passes a bounded gate, not full production. Current-candidate full matrix, required device/release review, rights record, production-origin checks and recovery acceptance remain open. | AC03/05 | open |
| F09 | site/analytics.json and analytics connectors | Adapter is Cloudflare, disabled, URL/token/Search Console null. GA4 account summaries and Search Console sites both return empty. These results do not prove that no property exists outside the connected account. Analytics activation stays with #8, not a mandatory expansion of #39. | dependencies | open |

## Live provider evidence

Cloudflare account `3b938b72a4ad0ac10b9102e0534e75c0` authenticated successfully.
Zones `.ai` (`94a46fef3ff2c40cdec1defdff0c85be`) and `.com`
(`900e77fd27529c7fce067e253f2434c8`) are active, unpaused.
Ownership TXT `_github-pages-challenge-oborskyivitalii.vitaliioborskyi.ai`
exists exactly once, record `466edebf239247c914621e5e5d3e858d`, DNS-only,
Auto TTL. This confirms the 7 October creation; do not request/create it again.
The maintainer subsequently confirmed GitHub **Verified** on 10 October in this
session. Ownership verification is complete on maintainer-observed evidence;
this is not a direct connector read. Repository Pages source/domain/HTTPS and
environment protection remain separate unobserved settings.

Both Universal certificate packs are active and cover apex/wildcard, expiry
2027-01-05. Those certificates prepare .com redirect TLS; the chosen DNS-only
.ai topology requires GitHub Pages' own certificate. Dynamic redirect entrypoint
reads returned Cloudflare10003 (absent) on both zones. No provider writes occurred.

The sole Cloudflare Pages project is `oborskyi-author-ci-staging`, production
branch `production-disabled`, no canonical deployment and no custom domains.
Stable preview deployment `5ee165bf-4ec7-4ff3-a2e0-13e8f84ca89f` succeeded on
2026-10-09 and points to staged source `4a7b44ff0877961d5a2d0dc8233b8ae643ca340c`.
System DNS and web-fetch probes were unavailable for target domains and existing
staging alike. This environment limitation is not evidence of broken staging;
public HTTP/DNS/TLS acceptance was not established by this audit.

## Current source and staging evidence

PR67 staged source `4a7b44ff0877961d5a2d0dc8233b8ae643ca340c` and merged main
have identical Git tree `dc4323f37467157ee8e1b9c8ba9752bb889acbfb`.
[Staging run37990365563](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37990365563),
attempt2, succeeded. Inspected artifact11644913200 records `staging-gate`,
`validationLevel:staging`, `pass:true`, `fullGate:false`, `productionEligible:false`.
The full Linux/native/performance/capture jobs are skipped by that bounded profile.
No matching current-source full production pass was found in inspected runs.

Color public digest: `571b95fefe48b84a3dd3b81e0d00174a750f70c6b765cbaaa3a948a2c5c1fa88`.
Base public digest: `3f94ebe3908cba1b98e239a21349e6369627c98280fc248b6af2a4f5d3c02e8b`.
Stable verification artifact11644394921 checks ten exact files, root, real404 and
noindex. Recovery11644619487 binds package11644872181, producer attempt1,
promotion attempt2. This is verified staging recovery, not production recovery.

[Main navigation37991886986](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37991886986)
passed. Root ran `node tools/quality/local.cjs` on clean exact main93a818d:
pass, five routes, thirteen focused cases plus ten Color cases, maxHtmlBytes99997,
deploymentAuthorized=false. Production metadata must retain the100KB budget.

## Decisions

- Existing decisions remain GitHub Pages, canonical .ai and .com redirect.
- No new issue, host migration, production release or DNS write is authorized
  by this readiness assessment. Continue implementation in #39/PR40 when requested.
- Decide/admit production rendition explicitly before freezing the release artifact.
  Current staging appearance is not the base artifact committed in docs.
- Preserve supplied rights decisions: approvals received from everyone except
  Arkadiy. #7's incomplete release/license record does not invalidate existing
  consent or justify asking approved people again; reconcile the actual edition.
- Personal GitHub [Settings → Pages](https://github.com/settings/pages) shows
  Verified, confirmed by the maintainer on 10 October; ownership is complete.
  Do not repeat TXT generation. Repository Actions/custom-domain/
  HTTPS and environment settings are applied at the reviewed release stage.

## Sol tasks

| Task | Owners / expected result | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Reconcile PR40 with main and dated preparation-only policy, preserving original ACs and historical evidence | F01 / AC01/04 | Exact refs, diff, RI, issue policy | pending |
| T02 | Explicit production rendition and canonical/indexability build, robots/sitemap, snapshots, Pages404/package | F05/07 / AC03/05 | Production source/metadata/size/route negatives, artifact identity | pending |
| T03 | Existing full-gate preflight receives immutable hosted URL; protected owner-invoked Pages publisher deploys the same admitted artifact, with retained rollback | F04/06 / AC03 | Failed/missing/wrong-byte gates block deploy; rollback identity | pending |
| T04 | Finite Pages .ai verifier and .com/www path/query/HTTP/HTTPS one-hop acceptance; provider-specific header policy | F02/05 / AC02/05 | Exact bytes/404/canonical/robots/sitemap/TLS/redirect fixtures and live probes | pending |
| T05 | Reconcile existing rights, physical-device, independent and current-artifact full release acceptance through #7/#13/#8/#1 | F08 / AC03/05 | Existing full matrix plus applicable external evidence | pending |
| T06 | After admitted artifact and explicit release decision, confirm GitHub settings, apply desired DNS/redirect and complete public acceptance; preserve staging | F02/03 / AC02/04/05 | Provider reads and all-host live URL/TLS/content/redirect checks | pending |

Analytics is a separate #8 launch decision/implementation. Existing adapter and
connector results do not supply actual GA4/Cloudflare counts or Search Console verification.

## Acceptance evidence

| AC | Evidence | Result / remaining gate |
| --- | --- | --- |
| AC01 | Exact main/PR refs, current API inventory and tested connector boundaries; original preparation policy remains source-pinned | Retain accepted inventory criterion; live inventory refreshed here |
| AC02 | Existing finite desired-state preparation, live absent routing/redirect | Open; LIVE-DOMAINS not passed |
| AC03 | Source audit, successful bounded stage, absent publisher/metadata/full production acceptance | Open; PRODUCTION-ADMISSION not passed |
| AC04 | Existing operator runbook, confirmed TXT and maintainer-observed Verified; repository settings unknown and Draft PR conflicted | Ownership subcondition complete; OWNER-SETTINGS/REVIEW/MERGE still incomplete |
| AC05 | API inventory and staged artifact evidence only | Open; actual production all-host DNS/TLS/HTTP acceptance absent |

Report-only edits preserve every public/runtime/deployment blob in the PR40
preparation branch. Its mapped deterministic preparation checks are separate
from the current-main Basic check and do not admit main or Color to production.
Final exact report-source checks/commit links are recorded in the issue and PR.
Independent report-only review by the separate release-code auditor found one
stale operator sequence still requesting TXT generation after creation. The
runbook now inspects the existing domain and verification status; this correction
does not change deployment, provider settings or the historical preparation plan.

## Issue synopsis

Production readiness is NO-GO: current staging is healthy, but production build,
publisher/recovery, full release admission and DNS/redirect/live checks remain
unfinished. Ownership TXT exists and Verified is maintainer-confirmed; repository
Pages/environment settings remain unobserved.
Keep AC02–AC05, #39 and release umbrellas open.
