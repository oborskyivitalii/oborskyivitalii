# Issue177 browser/CI checkpoint — independent Requirements & Acceptance preflight

Date: 2026-11-08. Role: Requirements & Acceptance, first independent judgment. Execution: `/root/issue177_ci_requirements`; no author conversation or peer result inspected. Requested none-fork isolation is supplied by the orchestrator; provider-internal context/model state is not observable. No implementation, tests, external state or delegation changed.

## Verdict

**PROCEED with the bounded test-only implementation described in the supplied intent.** Its observable requirements are sufficiently clear, necessary and traceable to original issue177 AC01–AC03/AC07. This is preflight permission under existing owner authorization, not candidate acceptance, a browser result, readiness, stable staging or release approval. All whole AC01–AC09 remain open. The completed change still needs exact-source checks and four independent completed reviews before workflow advancement.

## Inspected identity and sources

- Local repository `/workspace/scratch/538c6c66c100/repo`, clean `git status --short`; HEAD `8371746dce7eeda64c8662a21bc82c25bf772d2d`.
- Packet `/tmp/issue177-ci-preflight.json` SHA-256 `cd013551ed13bff71ebe26b112ae91ba69457b2d6735ac4c27a837d28d618e5c`; all 15 referenced byte hashes independently verified.
- `/tmp/issue177-ci-intent.md`, AGENTS.md, CONTRIBUTING.md, common reviewer contract and requirements role, README.md, repository map, MEMORY.md as dated handoff, `.github/acceptance/issue-177.json`, relevant profile contract and analytics producer/consumer/tests.
- Live issue177 fetched read-only through GitHub on this execution: open, original AC01–AC09 plus dated analytics-only checkpoint retained. Its original direct/SPA/reload pageview semantics and release/provider obligations were inspected, not replaced by acceptance-policy summaries.
- Source review: `tools/quality/analytics-browser.cjs` scenario/router/entry evidence/build fixture; full validator `tools/quality/validate.cjs:557`; staging validator and seven-case selector `tools/quality/staging-regression.cjs:58,274`; affected fixture/negative allocations in analytics, quality and staging-regression tests. No nested AGENTS.md found under touched source/test/workflow areas.
- Did not inspect current peer artifacts or prior author review conclusions. Did not execute browser, compiled fixture build or CI. PR Draft/current preview success and owner's later browser/CI authorization are supplied packet facts; not independently observed here. No blanket review of every policy or workflow line claimed.

## Requirements findings and treatments

1. **P1, expected implementation gap; AC02/BROWSER.** Existing compiled scenario tests five principal routes (`analytics-browser.cjs:297–316`), while article coverage at lines 29–167 uses a hand-built adapter fixture. That fixture cannot prove actual compiled native article direct entry/alias/reload or Writing-to-reader behavior. Add the bounded actual-compiled article journey inside the existing enabled Writing case, selecting the intended current public native article through authoritative validated catalog data. Verify the selected route is the intended current article, not an arbitrary first catalog entry. A missing selection must fail rather than silently skip. No additional matrix row is required.

2. **P1, fixture prerequisite; AC01/AC02.** Router at `analytics-browser.cjs:261–264` resolves extensionless principal routes through `routes.includes(name)` only. An extensionless nested article therefore falls through to a nonexistent file. Serve only the finite declared article alias using generated canonical bytes. This fixture treatment must preserve refusal for undeclared/draft/unlisted/snapshot variants; do not generalize to wildcard `/articles/*` or infer public alias admission from filesystem existence alone.

3. **P1, report acceptance prerequisite; AC01/AC02/AC07.** Current entry validation records string arrays, while full/staging consumers still require two final SDK requests (`validate.cjs:578–588`, `staging-regression.cjs:281–284`). The new journey must retain actual per-phase observations for canonical, declared alias, article reload, internal Writing-to-article and Back/Forward SDK persistence. Assert successful expected article identity/content and one beacon element as well as SDK request deltas; route strings and booleans alone cannot show the article loaded. Consumers must strictly require these observations only in their assigned enabled Writing row, preserve ordinary row counts and prevent forged/missing/negative/fractional/extra SDK observations from passing. Update both full and staging positive fixtures and meaningful refusal mutations before CI. Preserve original principal-route entry evidence and blocked/delayed/staging/offline cases.

4. **Evidence limitation, not a scope defect; AC02/AC03/AC07/AC08.** Vendor stub observations prove SDK loading/persistence and request isolation within the fixture. They cannot establish SDK-generated pageviews, exactly-once provider collection, real reader traffic or uplift. Keep existing actual-adapter/local-sink isolated-versus-ordinary contrast and report actual execution separately from planned assertions. Native tests cannot close BROWSER; selected hosted regression cannot close full stable staging or LIVE/RELEASE.

No material ambiguity requires another owner decision before this bounded test implementation. Existing authorization expressly stops after exact preview/browser evidence and report. Do not progress into stable alias promotion, merge, deployment, SEO/discovery/theme or Medium actions.

## Intent / AC to evidence matrix

| Intent / AC | Required check or gate | Observed preflight result and limit |
| --- | --- | --- |
| AC01 ownership/test impact | Catalog-derived finite article, fixture alias, full/staging producer-consumer and refusal allocation; affected native tests before CI | Relevant source allocation inspected; updates not implemented/executed yet. Whole AC open. |
| AC02 direct/internal measurement | Actual compiled article canonical + declared alias + reload; Writing-to-reader and Back/Forward; one SDK/document and zero additional SDK on persistent transitions | Existing compiled scenario lacks native article coverage; bounded treatment above is suitable. BROWSER and later LIVE/provider semantics remain pending. |
| AC03 isolation | Existing origin/staging/offline/blocked behavior, unsupported paths, QA local-sink isolated/ordinary contrast | Preserve current cases and guards. No runtime observation on this execution; whole AC open. |
| AC04–AC06 metadata/discovery/search | Original authoritative source plus later semantic, device/no-JS and live/provider gates | Outside authorized checkpoint; no acceptance claim. |
| AC07 source/review/release | Applicable style/Basic/RI/native checks; four-role completed candidate review; exact source/package/preview binding; existing evidence-only regression label | Source/head verified locally. No checks, preview, or CI independently executed here. Retain 7 staging analytics rows, original budget and later stable/production decisions. |
| AC08 baseline | Fixed-window raw/provider reporting and limitations | Stub SDK request counts provide no baseline or collection proof. Open. |
| AC09 Medium | Owner-only action and reminder after separately authorized verified production | Out of checkpoint and open; no external action authorized. |

## Next gate

Implement the bounded test/fixture/evidence-contract update; run cheap affected checks and confirm current-source fixture prerequisites; complete candidate-specific review and source binding before requesting existing CI. Retain any failures and diagnose before rerun. Then inspect the exact PR preview and observed browser/CI artifacts, state remaining live/provider gates, stop and report. Changed requirement/oracle scope beyond these treatments needs affected Requirements re-review.
