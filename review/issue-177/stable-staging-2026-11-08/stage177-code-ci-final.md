# Code review — prepared source-admission correction

Date: 2026-11-08. Role: `/root/stage177_code`, distinct nonauthor Code reviewer. This continues my own preserved first review and actual-CI diagnosis; it is a correction review, not a newly fresh first judgment. No implementation/test changes, delegation or external writes.

## Verdict

**Approve the bounded prepared correction from the Code-review perspective. No unresolved blocking code finding in this correction.** The missing-prerequisite defect is addressed by the actual workflow diff, including required Pillow and its interpreter. Actual clean current-head PR source admission is still required before owner stable staging; neither the earlier failed source run nor the earlier successful browser run can establish that later head passed.

This approves prepared source for commit/current-source checking through the existing route. It does not authorize merge/production or certify completed stable promotion/whole issue acceptance.

## Exact reviewed identity and limits

Base/HEAD remains `58d89a5b71b41ea995e4b327d07b4052d309ccfa`, tree `4f52b4a6162fb548d0d4d7446e7d6063d486fb77`. Reviewed candidate is **dirty prepared source**, not a clean commit.

Manifest `/workspace/scratch/e4946ebfb0ba/stage177-correction-manifest.json` has independently verified canonical sorted compact SHA256 `a4106673d32292b9cdc95ea55fccb430a68ededd2a42effd27e93e4106af8077`. All six actual changed paths match their manifest hashes; changed-path set equals the manifest, with no extra source diff. Rechecked this after my bounded checks.

| Path | Actual SHA256 |
| --- | --- |
| `.github/acceptance/issue-177.json` | `023dce21eadb8a151a7b67365994b9c04d0da5142439a0485e6465e3e2c958c0` |
| `.github/repository-intelligence/agent-context.json` | `3631971ce23d2aaecdeef558abfcd34177bb03e54567140c87b8176ee60b5a56` |
| `.github/ri-ci-map.json` | `daa0bb60e4c63c0d3656ad5bdd6aebb8aba62c61b0afc883b025379285d554eb` |
| `.github/workflows/issue-acceptance.yml` | `8cda02df7a383484b4d6cea3b9e6b53cf1b574dabd348057bd74a689420894c0` |
| `MEMORY.md` | `89b5c251b16623be082a46484af1dbd5e175d24dd15aad7775bf24baa0cb43ff` |
| `review/issue-177/2026-11-08-ci-browser.md` | `c99787b94a0b43e161666c0b5a74f9112b35a3b782cefa77fd3abd7bf93c3d45` |

Read actual workflow/policy diff and generated RI/CI deltas, plus the appended source/CI factual receipt. The appendix contains summaries of other review activity: those are not my evidence for correctness. MEMORY content remained outside my semantic review; its actual bytes and generated identity were checked. Reused my demonstrated unchanged product/test/dependency review from the first review and CI diagnosis; no product, test, oracle, scanner, lock or budget bytes change in this prepared delta.

Original first verdict remains SHA256 `64616706ddf4dd6d76326d4e9b68766e66a18379ba0a5515fdabb9c9036692d2`. Original packet/common/role identities and requested-versus-observed isolation limits remain as recorded there. Provider model/context/memory internals remain unknown. The original and diagnosis artifacts are preserved; no peer verdict artifact was opened.

## Actual correction and dependency closure

`.github/workflows/issue-acceptance.yml` now adds exactly issue177 to three existing installation predicates:

1. Quality Node locked installation supplies the current YAML parser used by the selected quality tests.
2. Python parity installation creates `tools/quality/toolchain/venv` expected explicitly by the analytics media test.
3. Existing combined publisher/media installation supplies exact unified/remark AST packages and canonical Pillow to that venv. The issue159 parser-only step stays unchanged, so177 does not duplicate parser preparation.

The additional issue177-only official setup-python action is pinned to existing full action SHA `ece7cb06caefa5fff74198d8649806c4678c61a1` with Python3.12.14 before venv creation. This binds the parent interpreter used to create the actual media-test venv. `python3` resolves through setup-python's PATH; the existing venv Python/pip paths are unchanged. `article-media.cjs` uses the root venv when present, and the copied-fixture analytics test explicitly passes the same root interpreter. Canonical Pillow13.0.0/libwebp1.6.0 verification remains enforced in `web-media.py`; the requirement is read from the existing source pin, not duplicated in workflow text.

Every existing installation command and action input remains unchanged. No existing policy loses setup, no new general install predicate replaces the finite owner list, and all prerequisites precede the checks. Existing Node24.19.0, full immutable Git history, exact raw-head checkout, zero-skip native accounting, fixed checks, pending external gates, timeout, report upload and read-only job permissions are preserved. No browser download or collector request is introduced. The effective ANALYTICS/BASIC dependency closure described in my diagnosis is therefore satisfied at the declared preparation boundary, subject to actual installation/execution success.

The acceptance policy changes only RELEASE gate prose to reflect already supplied owner authorization for stable staging then stop. Separate merge/production authorization and original AC obligations remain. No automated selector/check/oracle or gate kind is changed. RI/CI deltas are corresponding digests; existing routing and check inventory stay intact.

CS01/04 retain one dependency/pin owner; CS05 uses existing folded condition formatting; CS08/10 keep actual failure evidence, focused correction review and source-bound checks. No CSS/runtime lifecycle/performance surface changes. Bounded guard success is not claimed as complete style proof.

## Bounded actual verification

- Independently verified manifest canonical hash, every listed file hash, exact six-file dirty-path set, unchanged original first result, and final hash stability.
- Parsed actual before/after workflow with the installed YAML parser. Compared **every existing step excluding its condition**: all action uses, commands and inputs match exactly. Compared events and permissions: equal. Evaluated all changed install conditions for policies5/31/39/41/58/108/126/159/999: prior selection preserved. For177, exactly the three intended existing installers select; new pinned-Python step selects only177 and precedes venv/media/check execution. Assertions passed.
- My first tiny condition probe mistakenly attempted to evaluate the unchanged GitHub expression `always()` without a GitHub expression context and raised ReferenceError. I narrowed evaluation to the install predicates under review; this was a reviewer probe setup error, not a repository failure or a changed oracle. Corrected probe passed; no source was edited.
- Independently ran `python3 tools/check_ri_ci.py verify`: passed17 checks/19 layers, source digest `206a1d8f8af5ae0c882d0b1c07b99b18a95707c4f41c15a9d595f1318a061da7`; live GitHub state explicitly not verified by that check.
- Parent supplied Basic/style/format/RI pass observations. I did not rerun their full campaign or use that statement as independent CI proof for the uncommitted correction.

## Raw earlier browser evidence and advancement boundary

Independently read extracted raw files, not reviewer conclusions:

- `browser-staging-report/stage-functional.json`, actual SHA256 `4934726f90de234155ecccfc2e4ece118c8aaea3f5e2f733fa4d63e01542463d`: `pass:true`, exact source/candidate58d89a5b and tree4f52b4a6, profile staging. Seven analytics rows include enabled index/Writing, blocked, delayed, staging and offline index/Writing; all reported analytics check values are true, and enabled Writing contains one article journey record.
- `browser-staging-gate/release-manifest.json`, actual SHA256 `51fe9d569e979b3e27d81987c8e9cdb23f9e9854bd0063c3aaa4fa7cafcd6d08`: staging-gate `pass:true` at the same old source/tree; build/static/host/staging jobs success; `fullGate:false`, `productionEligible:false`. Package source binding retains run42512852807.

These complete the previously pending old-source observation; they do not relabel the prepared workflow/policy correction as tested. Root's digest-verified artifact provenance is supplied separately; I independently hashed/read extracted raw report bytes, not their original ZIPs. No SDK-generated pageview or actual vendor collector receipt is established.

The source-admission failure remains retained. Commit this reviewed prepared result, refresh/reconcile final identities, obtain successful latest raw-head PR site-checks/navigation/owning acceptance, then use the unchanged owner stable-staging controller. A manual acceptance dispatch alone cannot replace required PR evidence. Workflow changes remain execution controls selecting the conservative full route and final exact-head control review/`reviewed_sha` obligation where applicable. Old-source source/browser evidence cannot waive a new-source gate. No current stable alias promotion is established by these reports.

## Finding disposition

Previous release-blocking prerequisite finding: **addressed in actual prepared source**, with no residual code defect found. Verification disposition: **pending actual clean current-head PR admission and authorized stage execution**. Whole issue ACs, production receipt, SEO/discovery/search and owner-only Medium action remain outside this correction and open. No additional code changes requested.
