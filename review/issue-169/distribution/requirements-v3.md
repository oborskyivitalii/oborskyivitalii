# Issue169 distribution — affected Requirements & Acceptance review v3

Date: 2026-11-06. Owner: issue169 / PR170. Same nonauthor role, completed-candidate correction continuation; original preflight and v2 result remain preserved.

## Verdict

The corrected R10 outputs and documented publication sequence still meet the bounded distribution intent. The prior concrete lint-source defect is corrected, and the extracted helpers preserve the reciprocal-pair rule. **One residual reusable launch-validation gap remains:** redirected token URLs pass the early token branch even though pre-resolved redirected URLs now reject. Current R10 uses direct tokens and produces the correct direct destinations; this finding does not establish a defect in the actual inspected R10 exports or a publication-state bypass.

No whole issue readiness, release, canonical publication or platform posting acceptance is supplied. The pending source-catalog/RI/final metadata, exact-source check/review and release gates remain unchanged.

## Source identity and independence

- Base HEAD: `7c292bd50a4f9a0024c397a290c1de965ceada4f`. Dirty prepared candidate, not a committed clean tested head.
- Packet: `review/issue-169/distribution/candidate-v3.json`, SHA256 `740dba3ea75e4d9469b9dcd533bd3f840c14c344bca6685f07bc8820eaba8f24`; all 41 declared current/deleted file entries matched inspected bytes. The packet now includes native allocation and explicitly describes the R10 PDF catalog-owner correction. Final metadata remains separately pending.
- Kit: `dist/publications/sdlc-out-of-balance/c95c3840d527687909e719474bee1954eacbb1c492b656db038fd5036ecf6ac0`. All declared output lengths/SHA256s match actual bytes.
- Rechecked changed producer/profile/material helpers, added exact-destination/public-origin cases, actual platform/launch outputs and corrected supplied logs. Reused unchanged source-bound sequence/AC review only where packet identities and source inspection support that reuse.
- No peer results, MEMORY, current author history or private discussion inspected. This is a same-role continuation of its own preserved findings, not a newly fresh-context execution. No implementation/test writes, suite execution, browser interaction, external service action or delegation performed. Provider internals and original process exit receipts remain outside this review's direct observation.

## Affected finding and previous dispositions

| ID | Severity / result | Evidence and mechanism | Treatment / AC impact |
| --- | --- | --- | --- |
| RA-V3-01 | Medium, reusable guard incomplete; actual R10 output unaffected | `tools/publishing/profile.cjs`, `hasLaunchDestination`: `if (source.includes(token)) return true` precedes bounded literal URL matching. Therefore a source such as `Read https://redirect.example.org/?next={{SITE_ARTICLE_URL}}` plus `PDF {{SITE_PDF_URL}}` satisfies the branch, although its resolved article destination is the redirect query rather than the ordinary direct website backlink. Added test negatives cover resolved redirect-prefix text but not the token equivalent. | Apply the same destination boundaries to tokens or inspect resolved link destinations, then add the token-redirect negative and retain a direct-token positive. AC04/09 actual R10 copies pass the inspected destination obligation; AC05 claims of complete launch-guard rejection must remain bounded until this case is corrected/reviewed. Do not claim the new exact-token safeguard is complete merely from the literal-URL negative. |
| RA-F01 | Source correction resolved | Redundant bracket escape removed in kit Markdown-label class; `launchCopies`, `distributionInstructions` and `validateReciprocalPair` separate existing responsibilities without suppressions. | The concrete v2 lint failure no longer exists in inspected source. Orchestrator reports zero-warning successful lint; supplied `distribution-lint-final.log` is empty, proving no recorded diagnostics but not its process exit status by itself. Preserve the execution receipt for final style acceptance. |
| RA-F02 | Remaining final-source gate | Packet remains a prepared subset with final source metadata/checks explicitly outside scope. | Finish RI/final companion/source-bound checks and mandatory role admission before readiness. Original 120/122 failure evidence remains retained; corrected selector 47/47 does not erase it. |

## Intent / AC → oracle → observed result

| Obligation | Independent oracle / existing route | v3 observed result and limit |
| --- | --- | --- |
| AC04/09 ordinary planned article link in complete copies | Expected URL from production policy plus independent catalog alias; actual eight platform documents | All eight HTML/MD/TXT/copy-ready exports contain direct `https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html` and its materials anchor. No unresolved SITE tokens. No native editor/clipboard observation inferred. |
| AC09 correct launch MD/TXT | Actual generated output; direct destination and duplicate-display inspection | Both generated launch files contain the article URL and materials URL. TXT now displays each intended URL once; authored launch Markdown remains preserved apart from token resolution. Total article-prefix occurrence count is two, including the materials link. |
| AC04/05/09/11 planned state separate from publication | Actual manifest plus unchanged canonical/event guards | `canonical: null`, distribution `state: planned`. No event/date/canonical bypass from the correction. Existing site-first event requirement and observed-only campaign backlink behavior remain unchanged. |
| AC07/08/09 accepted R10 preserved | Exact comparison with Git base of manuscript, R10 edition, PDF and five declared visual files | All eight source artifacts are byte-identical to the base; semantic edition remains unchanged. Original manuscript `70386a2d…078b3d1f`, PDF `36269db3…4c4ca40`. No new content revision required. |
| AC10 initial zero pair; later both observed links | Extracted material helper plus unchanged meaningful material tests | Same zero-or-both public-channel predicate, matching URL/edition/chronology and adaptation handling. Initial website has no platform dependency. Actual future platform articles/backlinks and pair update remain manual/external observations. |
| AC05/11 current workflow/CI ownership | Updated canonical guide/allocation and existing permanent suite/selector routes | No new deployment pipeline, workflow, matrix, budget or acceptance relaxation. Existing source selection and manual/editor/release boundaries persist. |
| AC05 affected tests/checks | Supplied corrected logs | Corrected source log records 54/54 with zero skips/failures; selector log 47/47; Basic final reports 17 focused plus 10 Color tests and `pass:true`; build final records regenerated site output. These are bounded raw observations, not exact clean-head CI or website publication proof. Architecture pass is orchestrator-reported; no separate raw architecture receipt was supplied to this review. |
| Other original ACs | Unchanged earlier source-bound editorial/evidence/visual/history gates | No whole criterion is ticked by this correction review. |

The public-origin predicate now explicitly refuses reserved/local/internal/test/single-label hosts as well as unsafe protocol/credentials/ports/IP/preview forms; the added permanent cases match the intended distinction between planned production destinations and nonpublic hosts. This fixes the affected public-host requirement without weakening observed-publication validation.

## Next gate

Correct or explicitly bound RA-V3-01 before claiming complete reusable launch-destination rejection. Keep current R10 direct-output acceptance separate from that generic guard claim. Finish the declared metadata/RI and current-source review/check receipts. Website proof precedes author-manual LinkedIn/Medium publication in either order; only both actual observed reciprocal URLs enter one later materials update. No new author permission is needed for these already authorized steps.

## Inspected identities

```json
[
  {
    "path": "review/issue-169/distribution/candidate-v3.json",
    "sha256": "740dba3ea75e4d9469b9dcd533bd3f840c14c344bca6685f07bc8820eaba8f24"
  },
  {
    "path": "tools/publishing/profile.cjs",
    "sha256": "a78008c4658af2316ae020aadcbdc27e131bd7b044c20357327f7881128ad8bc"
  },
  {
    "path": "tools/publishing/kit.cjs",
    "sha256": "9fe2b69fadda0790932c0087ac0c28bb50dbe1074f8588af707402dc50370962"
  },
  {
    "path": "tools/site/article-materials.cjs",
    "sha256": "492e0377bea6741b57a59e87fcfd2c1ffd120371f3a13996633f66491d6622b0"
  },
  {
    "path": "tests/publishing-profile.test.cjs",
    "sha256": "031dc21bf73aa87729cc3c498a199dfe7357a8754fd8f54105fca9edaba3ecf7"
  },
  {
    "path": "tests/publishing.test.cjs",
    "sha256": "dcf829425dd3467e597a76fa2162b77dac9b6be8861b7c7aee84f95f78ce36b8"
  },
  {
    "path": "tests/article-materials.test.cjs",
    "sha256": "f4bc2b36e1868fc4d8727ca4fb0d6510a719bc612ea1e5a1080b9822055cfff0"
  },
  {
    "path": "review/issue-169/native-check-allocation.md",
    "sha256": "1e4470b9778a818b94fca1da37106c80b4f3f9f723b9cce7dd2c0d0e5c523a98"
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-source-corrected.log",
    "sha256": "b1d507afd40d69f41c13f68a7052f4ef16f254fe23f86c957d5f532390e0747d",
    "bytes": 5410
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-selector-final.log",
    "sha256": "d44863336b358e5f7bf7f247c25d130e09907a8e09cd520b50dc72a6e4011ba0",
    "bytes": 5219
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-lint-final.log",
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "bytes": 0
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-basic-final.log",
    "sha256": "480eaa4b12ebf09a5fefb07f941d67ae806d3feb094cb847b279eab28c69b27f",
    "bytes": 2211
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-final-build.log",
    "sha256": "32c5f5c18749da48c88365921f3c21d467cf77b989a768ad2ebd5c75494a5926",
    "bytes": 647
  }
]
```
