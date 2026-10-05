# Bounded independent re-review — execution and evidence contract

Reviewer: `/root/round2_plan_evidence_review`, 2026-10-02. I authored the independent finding R2-E1, but did not author the plan or the correction assessed here. The original report remains unchanged at `round2-reviews/plan-evidence-review.md` (SHA256 `2281640a63b39b10e130e5d7ed068551ab4b7d8f87cbcd444e7ac510ee72b3fa`).

## Exact target and disposition

**Accepted as a plan correction. R2-E1 is resolved; no additional material finding or prerequisite was identified in this bounded re-review.** The plan remains ready for its scoped S0–S4 candidate work after the execution instruction. This is not acceptance of implementation, browser behavior, release, merge or deployment.

The correction is the four-file local overlay on the independently reviewed PR #10 head `25d49c9c4e308bec6e499a30530889602507fb67` (tree `4acb79769efe333e76e7b9f0582fa6c7a9463270`). I recomputed the manifest SHA256 as **`d15f83bfb197c65fe7ff36bffe2f7f4bf10673c4a6057b03e4c819b7e86d8c19`** and independently matched every listed byte count and SHA256:

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `SOL-HANDOFF.md` | 20549 | `e176d4fd08444689dd12dc15e86ace6e3fec372e7089ff452f881c82e1b37e33` |
| `review/sol-plan-20261002/VISUAL-SPEC.md` | 27834 | `e7cea431f3cecd59967752cb70a1f6c1c9a49946a7590d9306ff1dff35c10204` |
| `review/sol-plan-20261002/SEO-EVIDENCE.md` | 9237 | `0b04a66aa448f001f6f536249f73416113884f4e2242d660c8917bf33b255dad` |
| `SITE-OPERATIONS.md` | 9095 | `b7aeaec3efe7859746eb0301e6e338d6c422226161d55b0a70e3158d8263b796` |

Manifest: `review/sol-plan-20261002/independent-round2/CORRECTION-MANIFEST.json`. Comparing every frozen-baseline file against the current snapshot identified exactly these four changed paths. Review summaries and generated RI are separate publication records, outside this four-file correction verdict.

## R2-E1 — resolved at the contract level

`VISUAL-SPEC.md:79–93` supplies the missing page dispatch and finite fallback behavior. `SOL-HANDOFF.md` places the mapping in S2, behavior in S3 and actual secondary-page inspection in S4, keeping the existing order of static scene, interaction and output acceptance.

- Research's named `intro`, `research`, `lenses`, `topics` and `acknowledgements` stops resolve to `overview`, `control` and `context`. I checked those pose IDs and their finite position/target coordinates directly in the unchanged `scene-blueprint.json`. The correction reuses the same world and does not add camera choreography.
- Talks, Credits and an unknown page have explicit static overview behavior. Home retains its seven authored stops. Unknown or invisible stops are ignored rather than being treated as ordinal Home poses.
- Writing's active topic selects the already-required finite focus path. Explicit visible-result bounds define the interpolation interval; year IDs remain archive identifiers. A single record can provide two distinct bounds, so a one-record result is not automatically confused with one camera stop. Empty and coincident-bound cases have a finite static fallback instead of document-height progress or division by zero.
- The precedence is usable: initial Off/reduced always uses overview and thereafter freezes the current pose; motion-enabled initial empty Writing uses its topic's initial pose; layout/filter changes retain the last finite pose when no interval exists. An explicit topic change may still use the previously specified bounded focus transition. Restored results preserve local progress, and the existing scroll-interruption rule remains applicable.

These details give the implementer a definite acceptance target without introducing an engine abstraction, another motion mode, new test framework or new release gate. Authoring the already-planned verification/controller focus paths and calibrating the geometry remain S2 implementation work; this correction does not claim they already exist. The five-page checks refine the existing shared-script acceptance boundary rather than postpone S0/S1.

## Bounded explanatory clarifications — accepted

**Noindex:** the revised S4 language accurately distinguishes noindex preview renditions from the bundle's exact production-source copies. I re-read `tools/build_site_previews.cjs:49,74,79–104` and `tools/build_site_bundle.py:15–19`: the former injects noindex into its renditions; the latter copies source bytes under `site/` and named review HTML under `review/`. `SITE-OPERATIONS.md` explicitly supersedes its older blanket wording. The clarification prevents an accidental production noindex edit without changing the export contract or claiming a deployed indexing result.

**CPC:** `SEO-EVIDENCE.md:24–30` explains the ancillary advertising field and its lack of role in page priorities/public copy. Its unchanged interpretation limits at lines 108–115 still say currency is unestablished, all normalized currency values are null, and the figures cannot support budget or comparison claims. Preserving audit evidence while excluding these unused fields from organic decision summaries and public prose does not require deleting raw or normalized data. The new operations statement agrees with the independently traced source/producer boundary in the original report; none of those consumers or data files changed. CPC remains estimated advertiser cost per click, not a site price, project spend or paid-campaign feature.

## Verification limits

I read the full correction diff, compared it with the frozen original, inspected the corrected contracts in surrounding context, checked pose references and rechecked the relevant producer inputs. The original substantive review and its data/source findings remain separately recorded. No additional web lookup or keyword submission was needed to assess this documentation-only correction.

Public code, source pages, actual admitted assets, geometry and SEO data match the frozen baseline. The 36 declared generated HTML/ZIP/binary placeholders remain existence-only inputs; their contents were not assessed as real outputs. I did not regenerate exports, rerun unchanged runtime tests, inspect a browser or deployed site, fetch a new remote commit, or certify CI. The pending second-review summary link is a publication record to be assembled after the independent verdicts, not evidence on which this verdict depends. Subsequent edits to the four reviewed files require a new hash-bound check.
