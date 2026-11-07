# Issue169 distribution — affected Requirements & Acceptance review v4

Date: 2026-11-06. Owner: issue169 / PR170. Distinct nonauthor Requirements & Acceptance role; same-role correction continuation. Earlier preflight/v2/v3 results remain preserved.

## Verdict

**Pass for the inspected affected requirements and acceptance linkage. RA-V3-01 is resolved.** No material requirement/sequence defect remains in this bounded v4 review. This does not establish whole-issue readiness, final source/RI acceptance, website publication, platform posting or the future reciprocal-link update.

After planned-token resolution, the launch validator now asks the existing admitted Markdown compiler for actual link destinations and requires exact article and materials URLs. This protects the ordinary direct-backlink obligation instead of accepting strings hidden in redirect queries or code examples. It preserves legitimate direct tokens and authored Markdown links without adding another parser or URL registry.

## Source identity and review limits

- Base HEAD `7c292bd50a4f9a0024c397a290c1de965ceada4f`; dirty prepared candidate, not a clean committed tested head.
- Packet `review/issue-169/distribution/candidate-v4.json`, SHA256 `2753dd31967d68ca2f383223eb7cb51e08676c30d1b7fc10d30705fc43be7ec2`. All 41 declared current/deleted entries matched. Relative to v3, substantive source delta is limited to `tools/publishing/profile.cjs` and `tests/publishing-profile.test.cjs`; regenerated output identities also change. Final metadata/RI remains separately pending.
- Kit `dist/publications/sdlc-out-of-balance/6b1039925ee49a8349d46ddd8539aa1ad0b6314d896f3132e58bcc98c8f6a75a`: all declared output lengths/SHA256s match actual files.
- Inspected changed launch validation, its calling path, relevant existing AST link collection, permanent negative/positive cases, actual eight platform/launch outputs and supplied v4 logs. Reused unchanged v3 sequence/profile/material/event/AC evidence only where packet hashes and actual byte comparisons support reuse.
- No peer results, MEMORY, author/private conversation or current execution-history report inspected. No unexpected history exposure observed. This remains a same-role continuation, not a newly fresh-context execution. Preserve actual launch/freshness receipts separately; provider internals are not attested here.
- Read-only source and byte inspections only. No implementation/test writes, suite execution, browser/external action or delegation. Code/runtime initialization/dependency review remains a separate role; this requirements result does not substitute for it.

## Finding disposition

| Finding | State | Exact evidence and protected invariant |
| --- | --- | --- |
| RA-V3-01, redirected tokens accepted by substring branch | Resolved | `profile.cjs:127–140`, `validateLaunchDestinations`: resolve tokens, compile admitted Markdown, require `model.links.some(link.url === expected)` for both destinations. Existing AST collects actual `link` node URLs; code blocks do not supply links. `publishing-profile.test.cjs` now includes token-redirect, nested redirect and fenced-token negatives, alongside legitimate token and exact Markdown positives. |
| RA-F01, previous lint-source violation | Resolved in prior corrected source; no regression observed | Existing corrected escaping/helpers remain unchanged from v3. Orchestrator supplies actual zero-warning lint exit0; the v4 lint log is empty. Empty output independently proves no recorded diagnostics, while the exit receipt remains orchestrator evidence. |
| RA-F02, final source/check/review admission | Still pending outside this packet | Metadata/RI refresh, complete final source identity, required exact-source checks and mandatory role/freshness admission remain explicit next gates. No prepared-subset or raw-log result is promoted to clean-head/full delivery acceptance. |

## Intent / AC → independent oracle → observed result

| Obligation / AC | Oracle / existing route | v4 result and boundary |
| --- | --- | --- |
| Direct planned article/materials links, AC04/09 | Exact expected URL from production policy plus independent catalog alias, compared with actual eight platform files and launch outputs | All eight platform exports and both launch files contain the expected direct article URL and `#article-materials`; none retains a SITE token. Actual anchors exist in HTML. No native-editor transfer inferred. |
| Genuine launch destinations, AC04/09 plus AC05 guard quality | Actual admitted link-node URLs after substitution; meaningful redirect/code negatives and valid positives | Corrected guard now verifies direct semantic destinations. Provided source run records 54/54, zero failures/skips. This result is bounded to its inspected source/cases, not universal parser correctness. |
| Pending state remains factual, AC04/05/09/11 | Actual kit manifest plus unchanged article/site/event guards | Manifest `canonical: null`, distribution `state: planned`. No canonical/date/event or release authority comes from the prepared links. |
| R10 source/PDF/visual preservation, AC07/08/09 | Actual comparison with original Git base of manuscript, R10 edition, PDF and all five declared visual sources | All eight artifacts remain byte-identical to base. Existing substantive semantic edition is retained; no R11 or PDF revision was introduced. |
| Website → author platforms in either order → both reciprocal links, AC04/09/10/11 | Unchanged canonical guide/allocation and source-bound event/material admission | Sequence and zero-or-both selected public reciprocal guard remain unchanged. Initial website release has no platform dependency. Actual website proof, author native-editor/posting, both actual URLs/content/backlinks and the later pair update remain external/pending. |
| Existing agent/CI/release owners, AC05/11 | Unchanged source registry/guide routing; existing source and Basic lanes | No new parser, deployment controller, CI workflow, matrix, budget or waiver. Deferred use of the existing compiler is a build-only implementation decision for separate Code review. |
| Applicable bounded checks | Supplied v4 logs and orchestrator process receipts | Source log: 54/54, zero skips/failures; Basic: pass with 17 focused and 10 Color cases; lint: no diagnostics, reported exit0. Architecture pass is orchestrator-reported, without a separate raw receipt supplied here. Exact final clean-head/hosted/release acceptance is not inferred. |
| Other original ACs | Unchanged source-bound editorial/evidence/visual/history gates | Preserved, not reaccepted or ticked by this narrow correction. |

## Remaining gate

Finish declared metadata/RI and full final source/check/review receipts, then follow existing authorized staging/merge/production/served-byte verification. After accepted website proof the author publishes both platforms manually, in either order; add both observed/reviewed reciprocal materials together afterward. No additional author decision is required for the already authorized sequence.

## Inspected identities

```json
[
  {
    "path": "review/issue-169/distribution/candidate-v4.json",
    "sha256": "2753dd31967d68ca2f383223eb7cb51e08676c30d1b7fc10d30705fc43be7ec2"
  },
  {
    "path": "tools/publishing/profile.cjs",
    "sha256": "4a0d27b65bcafbc89e7f894587055fba9bbc529ba19ecaef94e5bc4a9d97a471"
  },
  {
    "path": "tests/publishing-profile.test.cjs",
    "sha256": "60918f26bdb83b3a0cb9c31f3d8a72e6ee4acddab3f1d571889c3a4d2b2efb1c"
  },
  {
    "path": "tools/publishing/article.cjs",
    "sha256": "54459f1f49b3405bc5fdf9f5a3e627d026ad3bbe7822026dc1ca4602a69eb7cb"
  },
  {
    "path": "tools/publishing/ast.mjs",
    "sha256": "b7ca7eadfb43bbe8eac8fd0b1684452dea58755afd55616674d6b49db3bd8155"
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-source-v4.log",
    "sha256": "1dc7bb6f442553e2ddc262e28fb5bd93d5e07c17cfb94641b87c9988e0c30d5d",
    "bytes": 5419
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-lint-v4.log",
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "bytes": 0
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-basic-v4.log",
    "sha256": "480eaa4b12ebf09a5fefb07f941d67ae806d3feb094cb847b279eab28c69b27f",
    "bytes": 2211
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-build-v4.log",
    "sha256": "ef6d47061f899e9b35c959d0b7cc31db48bbaa3bf34d599d19cd25e785c1c430",
    "bytes": 647
  }
]
```
