# White-box QA — final prepared correction delta

Role/task `/root/stage177_whitebox`, 2026-11-08. Correction-phase reconciliation after my preserved `stage177-whitebox.md` and `stage177-whitebox-ci-diagnosis.md`; not a fresh first judgment. New inputs: actual six-file correction manifest, prepared diff, raw old-source browser/staging report and gate. No delegation, implementation/accepted test edits, or external writes. Read only new handoff diffs as explicitly requested; did not inspect linked peer verdicts. Requested operational isolation remains as recorded in the first result; actual accepted launch receipt is orchestrator-owned, provider internals unknown.

**Verdict: WB-CI01 is addressed structurally by the prepared correction. No blocking delta defect found. Approve this delta for exact-clean source admission/review; successful corrected-source CI and authorized stable promotion remain required.** This review does not assert that package installation has executed in Actions on the new source or that stable staging has been promoted.

## Bound source identity and inspected scope

Base/current Git HEAD `58d89a5b71b41ea995e4b327d07b4052d309ccfa`; prepared working source is explicitly dirty. Independently canonicalized the manifest as sorted compact JSON, matched SHA256 `a4106673d32292b9cdc95ea55fccb430a68ededd2a42effd27e93e4106af8077`, and checked all six actual path-byte hashes both before and after execution:

- `.github/workflows/issue-acceptance.yml`: `8cda02df7a383484b4d6cea3b9e6b53cf1b574dabd348057bd74a689420894c0`
- `.github/acceptance/issue-177.json`: `023dce21eadb8a151a7b67365994b9c04d0da5142439a0485e6465e3e2c958c0`
- `.github/ri-ci-map.json`: `daa0bb60e4c63c0d3656ad5bdd6aebb8aba62c61b0afc883b025379285d554eb`.
- `.github/repository-intelligence/agent-context.json`: `3631971ce23d2aaecdeef558abfcd34177bb03e54567140c87b8176ee60b5a56`
- `MEMORY.md`: `89b5c251b16623be082a46484af1dbd5e175d24dd15aad7775bf24baa0cb43ff`
- `review/issue-177/2026-11-08-ci-browser.md`: `c99787b94a0b43e161666c0b5a74f9112b35a3b782cefa77fd3abd7bf93c3d45`

Inspected actual complete six-file diff. Product, generated public artifact, tests, source test selection, numerical budgets, scanner rules, analytics runtime and pageview oracles are unchanged. Policy executable registries/checks/ACs were compared as parsed JSON: only RELEASE.description changed. It now matches the owner's stable-staging-then-stop authorization while retaining separate merge/production permission. Deterministic RI/CI deltas update exact source identities; dated handoff keeps failed admission42514298606 and old-source completed browser42512852807 distinct. The appended handoff first records a formerly pending browser observation and then its later SUCCESS, with explicit old-source identity; it does not relabel that evidence as the correction candidate.

## Risk-to-check matrix

| Risk / invariant / AC | Independently derived expected result | Executed bounded evidence |
| --- | --- | --- |
| WB-CI01 / AC01,07 dependency omission | issue177 selects quality npm, pinned Python, venv, combined publisher AST+canonical Pillow before policy execution | Parsed actual workflow truth table plus ordered prerequisites checker passed |
| Existing policy regression / AC07 | All other existing policy selections retain their original installation choices; new Python step only177 | Ten non177 input comparisons to actual base workflow passed |
| Partial/fail-open setup / AC07 | Missing, late, disabled, or continue-on-error prerequisite must invalidate dependency assurance | Sixteen in-memory variants rejected, four per required prerequisite |
| Oracle/scope drift / AC07 | Correct authorization prose without weakening checks or broader ACs | Parsed policy equality after replacing only RELEASE.description passed |
| Metadata stale / AC01,07 | RI and CI map bind prepared bytes | RI freshness and RI-CI verification passed; manifest rechecked after checks |
| Old/new browser evidence confusion / AC02,03,07 | Old-source actual results stay attributed to58d89a5b; no inferred new-source or real-provider pass | Raw functional/performance reports independently revalidated against old-source gate |

## Actual workflow condition execution

An inline read-only Node script loaded YAML through the quality toolchain, parsed `git show 58d89a5b:.github/workflows/issue-acceptance.yml` and actual prepared workflow, then evaluated the real installation condition strings with a deliberately finite parser. Every disjunct must match exactly `env.ACCEPTANCE_POLICY == '<literal>'`; unknown grammar rejects instead of evaluating arbitrary expressions. The unchanged upload `always()` step was excluded from installation comparisons. No GitHub expression engine or package installer was executed locally.

Inputs: issue159,58,39,41,108,126,5,177,31,999999 and empty policy (11 total). For every non177 input, enabled existing step-name sequence equals base (10 preservation checks). For177:

| Order | Selected prerequisite | Checked contract |
| --- | --- | --- |
| 1 | Quality npm | Unchanged exact `npm ci --prefix tools/quality/toolchain --ignore-scripts` |
| 2 | Python setup | Only177; pinned setup-python action `ece7cb06caefa5fff74198d8649806c4678c61a1`, Python3.12.14 |
| 3 | Python parity | Existing quality venv created before use |
| 4 | Combined publisher/media | Locked publisher npm plus canonical `web-media.py --requirement` installed into that quality venv |
| 5 | Criterion runner | Follows all four prerequisites; no fail-open prerequisite |

The existing159 parser-only step remains disabled for177, avoiding duplicate npm setup and preserving159 behavior. The selected venv path satisfies the actual fallback of article-media.cjs and the dedicated copied-media analytics test. The177-only Python patch pin makes source-runner preparation explicit without changing other policies.

For EACH of the four actual prerequisite step objects, the script separately (a) removed it, (b) moved it after the consumer, (c) changed its condition to unrelated issue999999, and (d) enabled continue-on-error. The independent assurance checker rejected all16. These are bounded structural fault injections into parsed in-memory workflow data, not executions of broken Actions jobs or changes to accepted tests.

Raw script result: exit0; pass:true; manifestFiles6; policies11; unchangedPolicySelections10; negativeVariantsRejected16; onlyPolicyChange RELEASE.description. No measured branch-coverage percentage or general workflow-language guarantee is claimed.

## Other focused checks

All following commands ran in the repository on the prepared source:

```sh
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
python3 tools/check_ri_ci.py verify
python3 tools/check_code_style.py
python3 tools/issue_acceptance.py validate --policy .github/acceptance/issue-177.json
node --test --test-name-pattern='every article-compiling job prepares' tests/quality.test.cjs
```

Results: RI fresh; RI-CI pass (17 checks/19 layers, digest206a1d8f8af5ae0c882d0b1c07b99b18a95707c4f41c15a9d595f1318a061da7; live GitHub state explicitly not verified); bounded style guard pass (156 scanned files, zero legacy occurrences); policy validates all AC01–AC09 with expected policy hash; selected native test1/1 pass, fail0/cancelled0/skipped0/todo0, duration155.152496ms. The existing selected test still governs its release-job setup scope; the independent truth-table experiment supplies the missing acceptance-selector assurance. Initial RI CLI invocation omitted required --config and exited argument validation; corrected command used the actual navigation workflow invocation and passed. No unchanged failed campaign rerun.

No full policy, full source suite, browser/performance collection, package installation or Actions rerun was duplicated during this delta review. My prior dependency-closure execution remains unchanged-source evidence: three real fixture/media/setup cases passed; exact AST versions, YAML2.9.1, Pillow13.0.0/WebP1.6.0 requirements remain as diagnosed. All relevant product/test/fixture bytes are unchanged by this delta.

## Raw browser evidence reconciliation

Independently SHA256-checked supplied old-source ZIPs:

- browser-staging-report.zip `cdacf25d3d7c97cc2d5229995d76e68c39201caf4958a08bfc2422272e905c41`
- browser-staging-gate.zip `84303b49e2469b871cb664067e146cac17759ecb3d938cee164b9ec5513c0528`

Read stage-functional, stage-performance and release-manifest actual JSON. All identify source/candidate58d89a5b71b41ea995e4b327d07b4052d309ccfa/tree4f52b4a6162fb548d0d4d7446e7d6063d486fb77, public artifact digest `a6d9a0394f6b1d3dc1871633dc2f84884fd69aa43e8543bab7ab3c40fb91252f`, profile staging, pass:true, fullGate:false, productionEligible:false. Gate sourceDirtyfalse; build/static/host/staging jobs successful.

Executed `staging-regression.validateFunctional(report, gate)` and `.validatePerformance(report, gate)` using unchanged validator source: exit0. Functional returned4 normal journeys/20 route observations,2 noCanvas journeys/10 observations,5 article observations,2 navigation,10 failures,7 analytics rows. Performance returned2 route samples,8 measurement windows,4 flights (2cold/2warm),2 Lighthouse trials; soak/retention0 as the bounded staging contract specifies.

Raw enabled Writing analytics row contains current article canonical/reload/extensionless/Writing/internal/Back/Forward, exact title/key, one SDK element throughout and expected cumulative SDK requests (reload2, other phases1). Remaining seven-row matrix includes enabled Home, blocked, delayed, staging and Home/Writing offline cases. These are actual vendor-stub browser observations on58d89a5b, not actual collector receipts. They close the earlier “not yet observed” status only for that exact old-source run. They do not prove stable alias promotion or a later source's admission.

## Remaining disposition

WB-CI01: structurally corrected and useful bounded negative checks passed on manifesta4106673…. Exact-clean committed corrected-source owning policy/Basic/navigation CI is still required; the prior failed ready-admission receipt remains retained. Conditions need their actual Actions execution before successful source admission can be reported. Any further relevant file change requires manifest/source rebinding and affected re-review.

Analytics-only progression can continue through the existing authorized stable-staging route after those gates and remaining roles are accepted. Do not call the whole issue complete, conflate old browser SUCCESS with corrected source, or claim vendor exactly-once pageviews/collector receipt. SEO/discovery/search, production/live and owner Medium obligations remain open.
