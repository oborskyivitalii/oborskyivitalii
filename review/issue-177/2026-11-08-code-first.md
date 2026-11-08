# Issue177 — independent Code / Artifact first review

Role/execution: Code / changed artifact reviewer, `/root/issue177_code`, first judgment, 2026-11-08. Nonauthor; no implementation, external write or delegation. I did not consume current peer verdicts or the issue177 review narratives before this judgment. Candidate text and MEMORY claims were treated as subjects, not proof. Parent must retain actual launch/acceptance parameters; provider model/context internals are unknown to this reviewer.

## Verdict

No blocking code/artifact findings in the inspected analytics checkpoint. The implementation uses the existing validated public publication catalog, preserves the runtime origin/project/idempotency/vendor boundary and makes the changed loader part of principal and article document identities. This supports stopping with a source/browser review handoff; it does not establish complete AC02/AC03, release readiness or issue completion.

Original/current intent inspected from `/tmp/issue177-owner.md`: section B article analytics, QA isolation, bounded checks, then STOP AND REPORT; theme withdrawn; no SEO/discovery implementation, staging promotion, merge or production. The focused source delta matches that scope.

## Identity and inspected scope

- Native Git checkout HEAD/base: `fdfc8cb67a6f78996932d9688c563c53c21387f2`; staged prepared candidate, not a clean commit. `git status --short` and `git rev-parse HEAD` observed.
- Packet `/tmp/issue177-candidate-manifest.json`: SHA256 `193107691ad6dd16759636ad9bb56d1af1ac52e9fa70e168da53a6c45bdfa9b6`. All 62 referenced current files independently byte-hashed; zero missing/mismatched entries.
- Supplied actual diff `/tmp/issue177-candidate.diff`: SHA256 `f07173dc698f524b856e3fac597e527d734898dec1ea2e905b0428ff31f5c01e`. Actual staged source/generated deltas inspected; issue177 peer narrative files intentionally excluded from judgment.
- Common prompt `agents/reviewers/README.md`: SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt `agents/reviewers/code-review.md`: SHA256 `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.
- Read root AGENTS, CONTRIBUTING, README, source contract, map/handoff, CODE-STYLE, analytics contract, acceptance policy/contract and relevant check-profile allocation. `rg --files -g AGENTS.md` returned only root AGENTS.
- Inspected `tools/site/build.cjs`, analytics compiler/factory, article selector, catalog validation/accepted-source boundary, actual generated loader and principal/article HTML identities, added tests/wrapper, policy, path/RI/CI and test-registry changes. Generated preview changes are loader/identity propagation rather than new theme behavior.

## Risks examined / AC linkage

1. AC01/AC02/AC03: `tools/site/build.cjs:826-835` validates catalog/selected accepted models before compiling finite `local-article` primary URLs. `tools/site/articles.cjs:24-88` limits the inventory, requires accepted status for catalog inclusion and refuses technical references. `tools/site/validate-catalog.cjs:640-650` cross-checks primary edition/source identity; draft or accepted-but-unlisted explicit previews cannot become public analytics admissions. No wildcard or new route registry introduced.
2. AC02/AC07: `tools/site/build.cjs:435-440` and `:722-727` hash `measurement.head`, which includes the loader content-addressed name. Admission/removal therefore invalidates both principal and article document identities rather than leaving cached HTML pointing at a previous allowlist. New tests at `tests/site-articles.test.cjs:258-348` exercise admitted/refused compiled loader behavior, accepted-but-unlisted preview invalidation, and addition/removal cold-versus-incremental equality with unchanged engine bytes.
3. AC03: unchanged `site/integrations/cloudflare.cjs` retains exact HTTPS origin, finite path/alias matching, one SDK element per document and optional blocked-vendor behavior. Generated current loader adds only `/articles/the-sdlc-is-out-of-balance.html`. Snapshots, unrelated paths and project-prefix escapes remain excluded by the admission guard. Query/fragment do not affect pathname admission. Existing isolation source tests and browser owner remain allocated.
4. AC07 / CS01-CS10: focused build input addition respects source ownership, explicit descriptor flow, closure-safe serialized runtime and existing dependencies. No new runtime listener, history wrapper, recurring work, vendor, editorial claim or manual pageview. Added tests use expected admission/refusal behavior rather than matching implementation strings. Permanent tests retain pr-targeted/staging/production selection; issue wrapper is task-snapshot/issue-policy only, with nonzero complete-accounting assertions. Guard/Basic/hosted execution remains distinct from this bounded review.
5. AC04-AC09: `.github/acceptance/issue-177.json` explicitly retains pending SEO, discovery, search, live, baseline, release and final owner Medium gates. It does not convert SDK-element tests into collector/pageview proof. No source SEO/discovery implementation appeared in the inspected focused delta.

## Actual check

`node --test --test-name-pattern='compiled analytics|public article admission' tests/site-articles.test.cjs`

Observed final exit 0; 2 tests, 2 pass, 0 fail/cancelled/skipped/todo, 2739.393065 ms. This is an intentionally selected two-test source check, not the full article suite or source profile. It builds isolated temporary fixtures; no production traffic emitted.

## Remaining evidence / limits

- No browser, real vendor SDK, collector receipt, production HTTP/source or provider reporting was exercised by this reviewer. Exactly one SDK element cannot prove exactly one SDK-generated/received pageview. AC02/AC03 live/history/reload/query/fragment behavior remains dependent on separate actual observations and later authorized live gates.
- No full Basic, style guard, RI/CI regression or complete owning-policy execution was repeated here; parent must bind their completed results to this candidate. No device/editorial/rights/release approval supplied.
- No GitHub issue/PR live fetch was performed in this read-only bounded role; parent owns current external status/ref reconciliation.
- All manifest entries matched at the hash check. Any later substantive source/meaning change needs affected review; verbatim receipt/metadata reuse requires final byte/provenance verification.

No blocking finding to fix. Preserve all unobserved gates as open and stop at the maintainer's requested analytics checkpoint.
