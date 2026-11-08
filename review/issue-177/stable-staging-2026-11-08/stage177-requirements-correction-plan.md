# Requirements & Acceptance — source-admission correction plan

2026-11-08; role execution `/root/stage177_requirements`, continuation after first independent result and subsequent reconciliation exposure. This is preimplementation review of the diagnosed correction, not a fresh-context final review. First result `stage177-requirements.md` is preserved.

**Verdict: APPROVE the bounded prerequisite-install correction and checkpoint wording correction described below. Current failed source admission BLOCKS `/stage`/promotion until corrected-source admission passes. No unchanged failed campaign rerun is justified.** Approval here assesses requirement fidelity; it supplies no maintainer control attestation, merge or production authorization.

## Independently observed failure

Inspected the raw report `/workspace/scratch/e4946ebfb0ba/ready-acceptance-failure/issue-acceptance.json`, SHA256 `250a909895f7a163eb8528d911932e32a19bde16b94e661b900b0b20fd450869`. It records exact clean source `58d89a5b71b41ea995e4b327d07b4052d309ccfa`, tree `4f52b4a6162fb548d0d4d7446e7d6063d486fb77`, run `42514298606` attempt 1, policy digest `d46a129e3eccca6125758a72a588e8064334e200a309415be5adac7c9f6caf18`, evidence_valid true and automation_pass false. ANALYTICS and BASIC fail; RI, RI-CI and STYLE pass. No criterion can be reported accepted from this failed mapping. The ZIP digest/artifact identity were supplied by the orchestrator; the extracted JSON digest above was independently recomputed, not an independent ZIP verification.

Fetched current GitHub jobs independently: job `128833845609` failed criterion execution; all four prerequisite install steps were skipped and failure-report upload succeeded. The raw ANALYTICS traceback shows `hookFailed` at real article preparation with `Publisher dependencies are missing`; BASIC fails at the same `tools/publishing/article.cjs:347` check. Source-runner concurrency is 4, Node is v24.19.0; this is an observed setup dependency failure, not evidence that completed browser/article assertions found a functional regression.

## Cause and bounded accepted treatment

`.github/workflows/issue-acceptance.yml:37–65` selects install prerequisites by exact policy path, but omits issue177 throughout. `tools/publishing/article.cjs:342–355` requires installed exact-version unified/remark packages before compiling any admitted publication. The issue177 policy deliberately executes the real six-module analytics/article/isolation set plus BASIC; BASIC begins with actual generated-source reconstruction (`tools/quality/local.cjs:117–120`). Therefore skipping installation prevents these accepted tests from running their intended checks. A test or oracle change would not address this cause.

Accepted implementation constraints:

1. Add `.github/acceptance/issue-177.json` to the existing quality-toolchain and Python-toolchain selection conditions.
2. Include issue177 in the existing publisher-acceptance installation branch that installs both the locked publishing npm toolchain and the single canonical Pillow requirement (`issue-acceptance.yml:58–62`). Preserve the other policy selections and avoid duplicate publishing installs.
3. Prepare the existing pinned Python 3.12.14 interpreter before creating the issue177 venv, using the repository's pinned setup action or a demonstrated equivalent existing adapter. This is necessary parity, not a speculative optional follow-up: current SDLC `profile.json:36` declares `webp-lossless`; `tools/site/articles.cjs:49–54` always prepares it; `article-media.cjs:10–13` chooses `SITE_MEDIA_PYTHON`, otherwise the venv Python; `web-media.py:25–29` enforces canonical Pillow and WebP versions. Installing only publisher npm packages would expose the next missing media prerequisite. A venv made with the pinned interpreter and the canonical Pillow requirement meets this need without a new media implementation. Do not add browser downloads to this acceptance job.
4. Preserve the exact ANALYTICS/BASIC selectors, six modules, zero-skip accounting, source-cleanliness/source-SHA checks, 190-second analytics wrapper timeout, job timeout, scanner/site budgets, source/hosted/release gates and report-on-failure behavior. No `continue-on-error`, broad install exemptions or assumed pass.
5. Update source/RI/CI identities and records through their existing owners. This workflow is an existing RI/CI source input; its changed digest must be reconciled and independently checked. Do not silently alter a historical receipt.

These are necessary source-admission repairs within the authorized stable-staging work. No new SEO, discovery, theme, publication or account operation follows from them.

## RELEASE wording

Approve replacing only the outdated final sentence of `.github/acceptance/issue-177.json:119` with:

> Current owner-authorized checkpoint permits stable staging, then stop; merge and production require separate authorization.

Retain the preceding sentence requiring exact-source preview, maintainer review, authorized stable staging and separately authorized production/live verification. Retain original AC07, its mappings, every other gate and all original AC01–AC09 obligations. This records the already supplied dated owner decision; it does not relax acceptance or close the issue. The changed policy digest must be included in the corrected exact-source check evidence.

## Validation and staging implications

| Concern | Required observation before advancement |
| --- | --- |
| Dependency selection | Parse the real workflow and confirm issue177 selects quality, Python and publishing/media prerequisites in order, while existing policy paths retain their behavior; check pinned install/interpreter identities. |
| Correction verification | On the corrected exact candidate, execute the unchanged issue177 policy in a clean environment with its admitted prerequisites. Require all five checks to finish with full accounting. Preserve the original failed report. Local installed-dependency success alone cannot establish CI setup correctness. |
| Governance | Run applicable bounded workflow/style/RI/coupling checks, and complete affected independent correction/final reviews before claiming the new candidate admitted. |
| Control lane | Workflow and acceptance-policy changes are controls under `delivery-routing.cjs:145–148`. This remains the existing mixed/full/control route, not a repository/content exemption. Keep protected-main controller, source leases and mandatory source jobs. Exact reviewed_sha is required for the downstream control-admission route where applicable (`SITE-STAGING.md:182`); this review is not the owner's trust attestation. That is distinct from the stable-stage controller's PR-number request. |
| Browser evidence | Let the existing exact-old-source evidence finish and retain its result. Workflow/setup and the scoped policy sentence do not change runtime behavior, but a new head/tree/policy is not identical to the old source. Reuse only demonstrably unchanged raw/public-byte observations through the existing authenticated process; do not relabel old-run evidence as corrected-head acceptance. Required new-head stable staging remains mandatory. |
| Stable staging | Wait for actual successful latest corrected-head Basic/navigation/owning admission, all accepted role results and any currently applicable unresolved evidence before owner `/stage`/protected-main dispatch. Require that attempt's complete matching gate and actual stable-alias verification, then stop/report. No merge or production. |

The causal gap is established by both the real skipped steps and direct missing-package traceback. Install completion is the next bounded observation that tests the fix hypothesis; it does not guarantee that no later independent failure will appear. Diagnose any subsequent distinct failure before rerunning or broadening the correction.
