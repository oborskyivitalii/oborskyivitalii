# v9 engineering checkpoint — 2026-10-03

Owners: #12 runtime fixes; #13 recurring release checks. Draft PR #10.
Immutable GitHub base: efe217066807673d2a4328241e2e74b61b46cf7c.
No merge, deployment or completion of #13 is claimed.

## Implemented runtime increment

- 24-second periodic ambient cycle on every route: twice the v8 phase speed.
- CSS before deferred scene/archive scripts; validated atomic palette/fill cache;
  readiness gating, bounded Canvas failure/context-loss fallback and truthful controls.
- Rapid reversal clears obsolete camera targets while ambient phase continues.
- Compatible own-property helper, indexed shared vertices and conservative object
  frustum culling. All tiers retain macro positions and motif identities.
- Shared bounded paint cadence, measured-cost tiers, hysteresis/DPR caps, bitmap
  preservation, bounded still fallback and explicit user On retry.
- Route-specific small SVG fallbacks, 100KB raw HTML / 250-node size checks.
- Duplicate CSS consolidation, Appearance-space reservation (CLS remeasurement
  pending), Writing navigation semantics and local favicon.

## Evidence before the environment disconnected

Local 13 focused scene tests plus 3 deterministic observed-cost adaptation tests
passed. Independent reviewer /root/runtime_review reproduced the adaptation
defects; the corrected fixtures passed. Observed raw HTML was 33,979–83,806 bytes
and SVG elements 51–75. Small later source/markup corrections are described below;
CI must verify the actual checkpoint bytes.

The reviewer compared 125 desktop projection samples: candidate t/2 and v8 t
gave identical canonical shape records. This checks modeled geometry, not Canvas,
physical devices, painter presentation or perceived smoothness.

The executor then disconnected with 409 environment_offline (“Environment is not
connected”). No new browser/Lighthouse pass or final pipeline completion followed.
The connected GitHub API remained available. Runtime sources were recovered by
reapplying the inspected changes to that exact immutable GitHub baseline and
re-evaluating the pure model: 65 desktop journey/phase samples matched v8. This
recovered version must be tested by CI; pre-disconnect results are not exact-head
CI. Comments differ; fill-cache keys use equivalent string concatenation; Home
adds an inline max-width image fallback for unavailable CSS.

## Mandatory next increment

1. Read live PR/#12/#13 and this checkpoint. Preserve newer work.
2. Inspect actual runtime workflow result and full existing CI. The runtime-only
   workflow is a focused regression check, not the complete #13 release gate.
3. Finish maintained tools/quality and its locked tooling, strict report validation,
   PR/release platform matrix, three-run Lighthouse, sustained-motion/soak probes,
   fail-closed aggregate and same-artifact deployment template. Prove deliberate
   failures block it; leave device/host evidence pending when unavailable.
4. Complete existing export/freshness checks: migrate producers/tests to v9,
   capture all five routes in both themes/mobile, inspect output, generate preview
   and offline manifests, regenerate/verify RI LAST. Existing v8 exports/captures
   remain historical. The current-source export/RI checks may fail until this is
   completed; do not suppress them or declare old captures current.
5. Measure the Writing header fix and rendering improvement on all required
   profiles. Keep raw baseline immutable; do not raise budgets after failures.
6. Independently review final recovered bytes and pipeline; record exact refs and
   actual checks in #12/#13/PR10. Keep Draft and issues open.

Local files prepared before disconnect (may survive reconnection): tools/quality/
artifact.cjs, budgets.json, scanners.cjs, eslint.config.cjs, stylelint.config.cjs,
security-rules.yml, exceptions.json, toolchain/, browser.cjs, lighthouse.cjs,
functional.cjs; v9 preview-generator edits and temporary results under /tmp/site-v9-*.
These were incomplete/unverified and NOT synced by this checkpoint. Inspect rather
than assume they exist or passed. Functional.cjs was the final interrupted write.

Physical iPhone/iPad and modest Android, native OS/browser measurements, final
visual review, hosted-origin security and production activation remain pending.
