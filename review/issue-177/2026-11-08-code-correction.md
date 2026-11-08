# Issue177 — Code / Artifact correction review

Continuation of `/root/issue177_code` after preserved first judgment `/tmp/issue177-code-review.md`, 2026-11-08. Parent supplied a factual correction description; this is a correction continuation, not a newly fresh review. No current peer report was read. No implementation, delegation or external write. Provider internals remain unknown.

Verdict: no blocking code finding in the inspected corrected source. The correction closes the previously unexamined content-release dependency boundary by placing finite public routes in the existing analytics component fingerprint. The owning-wrapper execution below failed on an observed missing interpreter prerequisite; automated acceptance is therefore not established by this review. Preserve that failed attempt and pending gates.

## Inspected identity

- Native baseline/HEAD remains `fdfc8cb67a6f78996932d9688c563c53c21387f2`; staged prepared candidate, not clean commit evidence.
- Corrected manifest `/tmp/issue177-corrected-manifest.json` SHA256 `64a009193b21487cb31cb4cfcf961dce8efbfe7754f458b9c4c47d6c96c13e41`: all 56 entries matched, including a final end-of-inspection comparison.
- Actual `git diff --cached --binary` SHA256 at inspection: `bb8db01873d3524a1e2cb737e20432273171aae4f3b0125c28c0991fe864ef79`. Source deltas independently inspected against baseline; current peer narratives excluded.
- Common/role prompts unchanged: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` / `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.
- Corrected `tools/site/build.cjs` SHA256 `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`; corrected article tests `7b885d9f24a25fe350272caff32fd4942421fa4f7a3fa69db4c84f9b172608d4`; owning wrapper `b35d84d08a03f7de8e74cc1ef508daaf2f9dd05cc4705a7d62430134a1dd5282`.

## Findings / affected boundaries

No blocking source defect found. AC01/AC02/AC03/AC07 observations:

- `tools/site/build.cjs:272-280`, `:351-358`, `:839`: one `analyticsURLs` helper supplies both compile and fingerprint. It adds validated local primary edition URLs to existing principal routes; no wildcard or second catalog. Acceptance/source validation remains before analytics compilation. Existing component hashing propagates changed admission into both principal and article documents; removed per-document measurement argument avoids a second dependency mechanism.
- `tools/site/build.cjs:362-379`, `:677-696`, `:919-920`: complete component comparison prevents content-only reuse when route admission changes, before the loader-asset reuse read. A changed analytics component may cause runtime descriptor recomputation, but `runtime-compatibility.cjs` excludes analytics from client input keys and preserves unchanged runtime compatibility/bytes. The full components still bind document and generation identity.
- `tools/site/content-release.cjs:134-136`, `tools/quality/content-baseline.cjs:125`, `tools/quality/content-gate.cjs:91-93`: actual content admission consumers compare the complete component record, so the new route input participates in existing platform refusal/reselection rather than silently reusing a stale analytics file. No gate weakening observed.
- `tests/site-articles.test.cjs:304-357`: new admission and removal cases explicitly assert content-only refusal, then full incremental/cold equality and unchanged engine bytes. The companion compiled-loader test retains accepted/unlisted, draft, technical, snapshot, project/origin and alias boundaries.
- `tests/test_issue177_acceptance.py:34`: explicit module order is the actual `executeBatch` returned `modules` input in `tools/quality/source-tests.cjs:582-608`, not its separately sorted profile planner. Correcting the expected order is supported by the runner contract and retains nonzero complete test accounting. The run below did not reach that assertion, so this is source inspection, not executed proof of wrapper success.
- Guide now records full generation/verification for public path admission/removal/slug changes and same-path article text retaining the existing content lane. Public route catalog, runtime guard, policy and permanent/issue-only registry allocation are otherwise unchanged from first review. Original SEO/discovery/Medium/release obligations remain pending.

## Actual checks and retained failure

1. `node --test --test-name-pattern='compiled analytics|public article admission' tests/site-articles.test.cjs`

Final exit 0: tests 2, pass 2, fail/cancelled/skipped/todo 0; 2897.141588 ms. Includes the new admission/removal content-only refusal assertions. Bounded selected source evidence only.

2. `python3 -m unittest discover -s tests -p test_issue177_acceptance.py`

Final exit 1, one unittest failure, elapsed 17.081 s, source unchanged. Node v24.22.1; worker observed available/configured parallelism9, concurrency4, files3. `preview-smoke` wrapper completed passed at3129 ms; `analytics` wrapper completed failed at14276 ms; `site-articles` wrapper completed passed at16925 ms. These wrapper observations do not supply complete per-case acceptance accounting for the failed campaign.

Failure at `tests/analytics.test.cjs:590` in `copied analytics media producer needs its declared pin and actual selected interpreter`:

```
spawnSync /workspace/scratch/538c6c66c100/repo/tools/quality/toolchain/venv/bin/python ENOENT
```

Observed mechanism: unchanged test chooses `SITE_MEDIA_PYTHON` if supplied, otherwise that default interpreter (`tests/analytics.test.cjs:570-590`); selected default did not exist. The copied media fixture reached its interpreter setup before the owning wrapper's module-order assertion. No source defect or pass is inferred. No rerun, toolchain install or speculative code change performed. Next bounded diagnostic/verification: parent should validate its intended pinned interpreter identity and availability, retain this failure, and execute the owning check under that declared environment if its prerequisites are already prepared. This review does not assert the intended interpreter exists or meets Pillow pins.

Two read-only lookup attempts used nonexistent guessed filenames (`tools/site/compose.cjs`, `tools/site/compatibility.cjs`) and exited nonzero; corrected via actual file inventory to `runtime-compatibility.cjs` and `content-release.cjs`. These were inspection lookup misses, not product test failures.

## Limits / disposition

No browser/real vendor SDK/collector, live HTTP, full Basic/style/RI/CI or release verification was performed here. Current-source parent evidence must still establish the required bounded checks and all four role outcomes; AC02/AC03 live/provider gates remain open. This is an acceptable inspected source correction for the analytics stop/report checkpoint, with failed owning-wrapper execution retained as unavailable acceptance evidence. It supplies no merge, staging, deployment or issue-closure approval.
