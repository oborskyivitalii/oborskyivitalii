# Issue 72 — 2026-10-11 confirmed Pages base-path repair

Owner: [issue #72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72).
Role: confirmed controller-repair preparation and self-review, with separate read-only AI
design and source review by `pages_basepath/basepath_review`. No execution PR,
hosted acceptance, merge or deployment is claimed.
Inspected source: main `12bf2a6d66be766a1e3f2c28b2e70c0bbba0f1e2`, complete tree
`ec19106b0764890f5cedc2d96febc468454a6213`, isolated branch
`work/issue-72-pages-basepath-20261011`; subsequent checks describe dirty prepared
bytes. Issue #69 and PR #71 retain their own runtime and staging owner.

## Intent and acceptance

Preserve the configured GitHub Pages project path for initial labelled staging,
its `/staging/` subtree, delivery receipt, recovery and generated 404 links.
This prepares the existing AC04/AC05 delivery contracts and AC08 style route;
it does not change production authorization or canonical origin.
Applicable rules: CS01, CS04, CS05, CS08, CS09 and CS10. Source owners are the
existing Pages HTTP, package and controller modules, reusable Pages workflow and
registered Pages delivery fixtures. No new controller or quality budget is proposed.

## Findings

| ID | Evidence | Implication | Disposition |
| --- | --- | --- | --- |
| F01 | `tools/pages/http.cjs`: root-only `origin`; configured action output is passed directly | A configured project base cannot reach HTTP or receipt validation | Prepare a separate staging base normalizer; retain strict production `origin` |
| F02 | `tools/pages/package.cjs`: generated fallback links start at `/` | Missing-page navigation escapes a project deployment | Bind fallback transport bytes to the package's base path |
| F03 | `/stage` is loaded from protected main | A candidate-only controller fix cannot repair the current trusted controller | A reviewed main fix must precede PR71 rebase and fresh exact-head staging |

The inherited failure is confirmed in owner staging
[run 38157594946, attempt 1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38157594946),
[Pages job 114526430944](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38157594946/job/114526430944).
The pinned `configure-pages` action succeeded and returned
`PAGES_CONFIGURED=https://oborskyivitalii.github.io/oborskyivitalii`, without a
terminal slash. The next normalization step failed with actual
`'/oborskyivitalii'` and expected `'/'`. This occurred before controller/producer
authentication, package downloads, composition, upload and deployment; those
steps were skipped. No Pages publication or Pages browser acceptance occurred.
Root and the separate `staging_contract` reviewer confirmed the same failure;
this repair author independently retrieved the run, job status and logs.

That run's runtime candidate was PR71 head
`f111368f1f77b6f5027f71e6287d256d914aa2fc`, complete tree
`b0244d68a2645be1eb9c81abc5e3700a4c1168d2`. Its bounded build/static/host/browser/
performance and staging gate passed; those results do not test this dirty Pages
repair. Source gate artifact `11708922544` and public artifact `11709216744`
remain bound to that exact runtime candidate. The trusted controller and reused
Pages workflow came from main `12bf2a6d66be766a1e3f2c28b2e70c0bbba0f1e2`.

Cloudflare promotion job `114526195573` passed, but merge-admission job
`114526492570` failed because Pages did not pass. Mirror recovery job
`114526493004` subsequently succeeded, including restore and verification of the
previous permanent Cloudflare package. The complete attempt stays failed. This
is job evidence of recovery, not an additional fresh direct HTTP observation.
Earlier CSS failures likewise remain failed historical PR71 evidence.
No authenticated settings, tokens or private browser state are read.

## Ordered tasks

| Task | Change and invariant | Check | Status |
| --- | --- | --- | --- |
| T01 | Normalize staging base; confine requests and preserve actual 404/query probes | Registered Pages fixture positive/negative cases | Prepared; local cases pass |
| T02 | Bind receipt/recovery and fallback 404 to project path; preserve original public file hashes | Pages package, retained receipt and production fixtures | Prepared; local cases pass |
| T03 | Pass configured base path into existing composition and navigation smoke | Source/workflow inspection and focused review | Prepared; actual hosted smoke pending |
| T04 | Observe actual configured Pages failure; independently review correction | Live job logs and existing owner route | Failure confirmed; source review found no concrete blocker; hosted review pending |
| T05 | Prepare a concrete reviewed repair PR; obtain the scoped maintainer integration decision, then rebase and restage PR71 | Fresh source/RI/admission, both publishers and exact-tree merge | Pending; this preparation performs no publication |

## Acceptance evidence

| AC / rule | Actual prepared check | Result and limit |
| --- | --- | --- |
| AC04/AC05, CS04/CS08 | `node --test tests/pages-delivery.test.cjs` | 12 cases pass: project inventory/query/real 404, source-byte equality, receipt scope, legacy root recovery and negative path/state cases |
| AC05, production boundary | Existing archive and production-controller suites | Archive 7 cases and controller 15 cases pass; no production activation performed |
| CS08 | `node tools/quality/local.cjs` | Basic 13 cases and Color 10 cases pass; generated/snapshot/size/script checks pass |
| CS01/CS05/CS09 | Pinned focused ESLint/Prettier and bounded code-style guard | Touched maintained files pass lint/format; guard passes its documented subset |
| AC08 | `test_ri_ci.py`, `test_repository_intelligence.py`; coupling and RI build/verify | 20 and 28 cases pass; generated navigation companions refreshed |
| Review | Separate read-only AI design/source review | No concrete blocker found; complete legacy root recovery fixture added in response to a coverage suggestion |

All checks describe dirty preparation based on main `12bf2a6`, not a published
clean head. The registry keeps the additional Pages failure surfaces in its
existing permanent PR-targeted/staging/production suite. No diagnostic or
performance matrix is added. Exact public staging and accepted production file
hashes stay bound to the original manifests; only combined host transport state
and generated fallback 404 gain the deployment prefix. Historical receipt and
recovery records without that field mean origin root only.

The actual configure-pages step and controller failure are observed. Successful
Pages publication/recovery, complete authenticated ruleset/environment evidence,
independent hosted review, source-clean repair CI, the scoped main-integration
decision and eventual PR71 restaging remain open. Production stays disabled;
no custom domain or DNS change is prepared.

## Next integration decision

Carry the confirmed controller repair through the existing #72 owner and a
concrete reviewable PR. Integration requires the explicit scoped maintainer
decision retained by AGENTS rule 14; this record establishes no new bootstrap
exception and cannot label failed dual-host admission as passed. A PR-only patch
is insufficient because owner `/stage` executes the trusted controller from main.
After reviewed integration under that decision,
rebase the #69 candidate onto the new main, regenerate any source companions,
wait for its fresh source/RI/acceptance jobs, and create a new `/stage` attempt.
Both hosts, recovery, exact-tree merge admission and post-merge identity must
pass on that new candidate; earlier failed/untested runs stay historical.
