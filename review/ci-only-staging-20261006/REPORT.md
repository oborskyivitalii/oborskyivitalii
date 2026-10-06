# CI-only preview/staging integration — 6 October 2026

Maintainer request: verify owner setup, finish/integrate ready preview and staging
pipelines; deploy through CI only; keep existing PRs. Issues #8/#13 own intent.

The existing Color preview passes GitHub Actions run 37431551806 attempt 2:
source 1deed630ca10033eda9264d18379bf571b4f0bf8, deployment 1aa74c51,
https://1aa74c51.oborskyi-author-ci-staging.pages.dev and the then-current pr-26
alias. This proves preview credentials/project/opt-in and real HTTP/Color smoke.
Provider read confirms that exact source and branch, without plugin uploads.
Target logs report preview=true, staging=false; main API reports protected=false.
The GitHub connector lacks environment/variable/protection administration.

The controller is isolated on main 2ebdd731d5dcf1e12f43f60dd0b3a6ec49b94684:
no site/ or docs/ public byte changes. Tests/hosted helpers and workflow adapters
are reconciled for baseline base and authored Color editions. Actual old #26
runtime/source/fixture repairs are retained in existing #23 before #26 retarget.
Source capabilities select an explicit artifact variant; full gates bind it.

A secure exact newly-created /stage PR comment by repository owner and event
actor invokes the default-main controller through the available GitHub connector.
Fork/nonPR/other actor/edited or malformed commands fail before provider jobs.
Protected unchanged main, live open same-repository PR, opt-in, environment,
exact artifact and every full hosted job remain mandatory. Normal comments do not
share staging concurrency. Both dispatch and comment recovery locate actual
successful promotions of the exact attempt; disabled/skipped successful workflows
cannot replace accepted recovery. Deployment/promotion/rollback all use the
pinned official Wrangler Action; no ad hoc provider upload is used.

Validation before hosted CI: 116/116 Node source tests, 37 focused
controller/quality/staging tests, economical 13-test source profile, YAML and
embedded script syntax, RI freshness and diff checks pass. The first broad local
attempt lacked two historical Git baseline objects; fetching those exact trees
restored their fixtures and the complete source suite passed without runtime edits.
Base artifact/rendition keeps unchanged public bytes and rejects bad fingerprints.
A local Playwright browser installation returned a truncated download and was
stopped; actual generic browser execution is required in PR CI before merge.
Independent read-only reviewer capture_compat found no remaining controller
blocker, including /stage privilege, artifact/gate and recovery boundaries.

The first isolated hosted attempts, runs 37436554748 (base #26 source 3227442)
and 37436551769 (Color #23 source 4335cc4), successfully publish exact artifacts
as deployments 78482cd5 and 4d4be3e8. HTTP identity and runtime smoke assertions
pass, but the browser response observer incorrectly reads redirect response
bodies. Both smoke jobs fail honestly; neither run qualifies for merge or full
staging. The correction validates same-origin canonical redirect destinations
and hashes final extensionless HTML responses. Mock regression coverage joins
the fast CI source checks; actual hosted smoke must pass again before merge.

Full staging, stable promotion and actual rollback are not established by these
local/source/preview checks. Owner main protection/staging opt-in and real hosted
CI outcome remain explicit. Original runtime cold Writing failure/budgets and
separate physical-device/independent/production acceptance are preserved.
