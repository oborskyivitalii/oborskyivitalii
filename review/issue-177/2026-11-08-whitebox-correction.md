# White-box QA correction re-review — issue177

Verdict: **Correction accepted in the bounded source QA scope; no blocking findings.** First judgment remains preserved in `/tmp/issue177-whitebox-review.md`. This is a continuation after receiving the correction description; it is not a fresh independent-context first review.

## Source identity

Prepared staged/dirty candidate in `/workspace/scratch/538c6c66c100/repo`, base/HEAD `fdfc8cb67a6f78996932d9688c563c53c21387f2`.
Corrected manifest `/tmp/issue177-corrected-manifest.json` SHA256 `64a009193b21487cb31cb4cfcf961dce8efbfe7754f458b9c4c47d6c96c13e41`; all **56/56 entries matched before and after** inspection/execution. Same common and role prompts as the preserved first report; owner still limits work to article analytics and stop/report. No peer outputs or author test logs were read; no accepted source/test edits, external writes or delegation.

## Examined correction and oracle

Inspected actual current HEAD delta in `tools/site/build.cjs`, `tests/site-articles.test.cjs`, `tests/test_issue177_acceptance.py`; inspected build ordering, baseline refusal and loader asset-copy consumers, runner `executePlan/executeBatch/run`, and runtime compatibility fingerprint inputs.

| Risk / AC | Independent expectation | Observed source and check |
| --- | --- | --- |
| AC01/02 public-route source drift | Fingerprint and compiled loader must consume the same validated finite public URL set | `analyticsURLs(config,c)` is the single helper used by both existing analytics fingerprint and loader compilation; `validateLocalCatalog` remains before compile |
| AC01/07 content reuse with changed loader | Public article admission/removal must fail the existing content platform guard before copying absent/stale loader assets | Existing guard compares complete components; changed analytics routes invalidate components. Guard executes before temporary output generation and before asset copying. New assertions explicitly exercise both transitions |
| AC02 cache/document coherence | Loader route-set changes restamp all principal/article documents; full cold and incremental bytes agree | Document signatures already contain analytics via shared components; separate measurement argument is removed. Corrected existing test retains add/remove/cold/incremental and unchanged engine-file assertions |
| AC07 owning wrapper validity | Report preserves explicitly supplied module order; no failures/skips and nonzero complete native accounting | Runner returns the supplied `plan.modules`; corrected wrapper compares that same order instead of sorting the expected list. Real wrapper execution passes |
| AC07 stable client runtime | Admission metadata changes analytics generation identity while preserving engine/client bytes and compatibility | Independent in-memory fingerprint partition check passed; runtime compatibility descriptor excludes analytics while platform baseline still compares it |

## Executed evidence

1. `SITE_MEDIA_PYTHON="$(command -v python3)" python3 -m unittest discover -s tests -p test_issue177_acceptance.py -v` — **exit 0, one unittest passed**, 17.187s reported by unittest. This executes the wrapper's three actual selected modules (`analytics`, `site-articles`, `preview-smoke`) and checks native nonzero total, all passed, no failures/cancelled/skips/todo and exact input module order. Native TAP is captured internally by the wrapper and not printed in this raw log; no independently retained per-native-case total is claimed for this correction invocation. Raw `/tmp/issue177-whitebox-correction-tests.log`.
2. Independent Node in-memory fingerprint check — **exit 0**: added an unfeatured synthetic local-article member to a cloned catalog, verified analytics fingerprint changes, engine/client identities remain stable, and removal restores every fingerprint. No source mutation; this fingerprint-only synthetic object is not claimed to have passed catalog/publication validation. Raw `/tmp/issue177-whitebox-correction-fingerprint.log`.
3. Corrected manifest verification before/after — 56/56 match, no mismatch.

## Findings, reuse and remaining limits

The first review's content-only public-membership coverage gap is now resolved for the intended refusal contract by the two new assertions and successful owning-wrapper execution. A changed public route set requires full generation; acceptance does not require content-only admission. This addresses the structural risk that a changed generated loader asset could otherwise be read from an unchanged baseline output.

The first review's broader 24 adjacent content/tag consumer checks were not rerun in this correction; they remain historical bounded observations on the earlier candidate, not current-candidate acceptance for changed generation semantics. Runtime adapter/isolation implementation itself is unchanged; the owning wrapper re-exercises those current-source modules. No line/branch coverage measurement is claimed.

AC01/02/03/07 receive current corrected source-check evidence within this role. Actual browser SDK behavior, SPA/history/reload pageview semantics, served production bytes and real collector receipt remain unobserved/open. AC04–06/08–09 and release gates remain outside the checkpoint. No whole AC checkbox, production readiness or release approval follows from this report.
