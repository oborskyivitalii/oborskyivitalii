# Content/Color retained dependency — requirements preflight

Refs #169 / PR170. Independent Requirements & Acceptance source inspection, 5 November 2026. Source HEAD `1c060edd33259800420ec314c6245c72be32eda8`, tree `640907753a9a7179612a29f85ca01abda71cf2d2`; observed clean before this report. **The reported full-CI failure is an unresolved integrity obligation, not a reason to relax the route or tests. A bounded correction to preserve verified retained resource closure is within existing scope and needs no new author permission.**

Input failure report: Basic42095940383, shard5/job127485870538, `tests/content-release.test.cjs` case “content artifact preserves immutable media, isolates staging HTML and proves exact current source”, Color snapshot dependency missing old first-profile snapshot→runtime727/theme.js. The original raw artifact/log was still being acquired when this review began; this role has not independently observed that log or executed the failing test. The treatment below comes from direct actual test/owner sources, not a peer verdict or a claim of a reproduced stack.

## Intended behavior and source-bound hypothesis

`SITE-CONTENT-RELEASE` requires verified immutable resources to remain closed for readers using pinned historical snapshots. The content composition retains old raw article snapshots when a slug/source changes; Color replaces active base route/article snapshots and runtime with its decorated rendition. Any old immutable HTML that survives that replacement must retain every required verified resource, even if it references the same base runtime currently being replaced.

Actual `edition-retention.capture` excludes every active `runtime/<revision.engine>/<file>` unless it appears in the static declared retention map. It separately preserves nonactive immutable snapshots. `color.decoratePublic` captures with that map and then deletes the whole runtime/snapshot/article-snapshot trees before restore. Consequently a retained prior article snapshot can survive while its active-base runtime dependency is omitted. `snapshot.verify` correctly rejects the resulting dangling resource. This is a concrete mechanism consistent with the reported failure; raw failure proof remains to inspect.

The static live `site/retained/manifest.json` is an exact historical declaration, not the complete dynamic closure of a verified content-baseline composition. The synthetic first-profile fixture must not be added there to make one test green. Nor should the current accepted R9 article/PDF/assets be changed to mask a generic resource-retention defect.

## Bounded correction and independent oracles

| Required invariant | Relevant oracle / next check |
| --- | --- |
| Every retained verified immutable HTML/resource keeps its necessary immutable dependency closure through Color replacement | Focused old-source failure plus corrected Color intermediate manifest: prior article HTML unchanged, referenced runtime files present at exact original paths/hashes; `snapshot.verify` succeeds without changing its missing-dependency guard. |
| Replace only the active rendition; do not preserve every replaced active page | Explicit active-current snapshot remains replaced unless independently retained/dependency-required; preserve the existing “not every active base snapshot” behavior and finite dependency ownership. |
| Preserve existing bounded integrity | Exact static declared hashes, immutable-path checks,1000-entry bounds, collision refusal and complete source/manifest verification remain; missing/tampered dependencies fail closed. No blanket skip/catch or allowance for arbitrary files. |
| Staging HTML isolation is a separate final-stage requirement | Keep the existing test's final staging expectations: no old unadmitted HTML/runtime leakage, current staging noindex/badge/analytics policy intact, immutable media retained and current source reconstruction verified. A temporary Color closure fix must not weaken staging's later deliberate removal/rewrite of historical HTML. |
| Reuse remains conditional | Only verified baseline resources from the exact complete artifact may carry forward. Unknown/incompatible input still takes the full-platform route; no content-lane widening or source/history trust change. |

A suitable correction computes/preserves the verified dependencies needed by **already retained immutable documents**, including a runtime that is active in the input but required by those retained documents. Keep it in the existing retention/Color owner; no second retention registry, arbitrary directory copying or new release engine. The implementer/Code/QA roles must settle the exact algorithm and tests; this role has not authored the implementation.

At minimum distinguish: retained historical article referencing the same active-base runtime; ordinary replacement with no retained dependent; missing/tampered referenced bytes; no accidental current-HTML retention; final staging isolation and exact-source reconstruction. Use finite inputs and the existing mapped content-release/retention/Color tests. Preserve the original failed run and original process/output limits, diagnose exact raw evidence before rerun, then rerun the affected source and existing full current-source admission as required.

## Acceptance and carry-forward

This belongs to AC05/09/11 source identity, immutable material/history and independent-review integrity under the existing website task. Accepted R9 text/five visuals/five-page PDF, author rights, manual LinkedIn/Medium posting and unrelated essay/talk boundaries are unchanged. Prior28/28 local interaction observations remain exact to their original e92 source/input; they do not waive this later full-source failure or prove content-update closure.

Keep PR iteration Draft while this failure and other required checks remain unresolved. Finish raw artifact/log accounting and affected independent implementation/QA review before interpreting any rerun. Clean current full CI/RI/issue/hosted checks, stable staging, protected identical-tree merge, frozen production rights/archive and served URLs remain required. No missing/failed/pending gate is converted to passed or inapplicable here; no whole AC is closed and no additional author decision is sought.

## Inspected SHA256 manifest

```json
{
  "tests/content-release.test.cjs": "36376d7a2640a9522b2f1a1f7b09d8cf23157678ccaa0c6ebca33653dbd6a623",
  "tools/quality/artifact.cjs": "3dab8113e50df470c14a7f0e59d9a6ecae8b13ef799a8383b43538be37f9fc29",
  "tools/site/content-release.cjs": "38ad18f6bf8805aac2c54979d5ca3291db7f45c661a5f2ec501c4ac815bceef8",
  "tools/site/edition-retention.cjs": "9e1ce89d5883a639fb79147f8a86f7a5030c8916baa338b1256bf984b7ee1b4d",
  "tools/site/edition.cjs": "ed16f02e53abd85c03e40aca3039f285cf5638a133a98a2c92933ae9dd84b798",
  "tools/site/snapshot.cjs": "eae15e6734b64ebc015d56e34ebc0a3118ae21f3e1fb340df89075cb1df206f4",
  "tools/staging/color.cjs": "a48869d6f68c51fd92994ad12fe7161b13435f6fe05721f3a119f4e6149a7c69",
  "guides/SITE-CONTENT-RELEASE.md": "0e3891ae1875275a1a9de3c2e8761682711c77330a88fd31bee0bd72f7d9503c"
}
```

## Actual focused failure and transitive-closure clarification

Read `/workspace/scratch/83aaf5811f83/tmp/r9-retention-tests-corrected.log`, SHA256 `547266798b8fade4e5f3c5712f9578c83d099532579661052e2bfc844c266695`:18 tests executed,17 passed,1 failed, zero skipped. The remaining failure is the same content-artifact case at Color `snapshot.verify`: retained Writing snapshot `snapshots/21c99c036f98faf2f33c91ab13d57d2d62a56d6feb32a33a4c3f32834a937c20/writing.html` needs `article-snapshots/0b76ae595b83a7fa810b4f5e2910eedc9e6bcf26d606377a385b31ac19da547e/second-profile.html`, an active snapshot removed by Color. Thus the runtime-only treatment is incomplete; this failure must remain failed, not be waived after the other17 passes.

**The precise constraint is: unreferenced active HTML stays excluded; dependency-required active immutable HTML must be retained.** There is no blanket prohibition on retaining an active snapshot that an already-retained document actually needs. The earlier preflight's “unless independently retained/dependency-required” exception applies here. The current implementation comment “never active pages” overstates the constraint and should be corrected with the algorithm; the retained page is preserved as an exact dependency, not newly approved as a publication.

The proposed same-owner correction is consistent with existing intent: start from the exact existing retained seed; resolve actual supported local `href`/`src` values against each retained HTML path; follow only immutable paths belonging to the verified inventory; transitively add needed active immutable documents/runtime/resources at exact original paths/bytes. Process newly added HTML, deduplicate paths, track visited nodes/cycles, and keep the existing≤1000 limit throughout. A required immutable target absent from verified inventory or with inconsistent bytes must fail closed. External targets, inactive markup/comment/JSON lookalikes and unrelated active pages do not expand the seed. Ordinary mutable aliases retain their existing semantics; do not invent historical copies of them or change the snapshot verifier to accept missing files.

Positive/negative oracles now need a chain such as retained Writing→active article→active runtime, a cycle with finite deduplicated closure, an unrelated active snapshot that remains absent, missing/tampered dependency refusal, unchanged exact declarations/collision/bound checks, and the unchanged final staging isolation/source-proof case. This is a clarification of the same required closure behavior, not an expanded retention policy or an opportunity to prune old evidence. Existing staging still deliberately removes/rebuilds old HTML/runtime after Color; preserve its noindex/badge/analytics and media assertions.

No implementation was edited or accepted by this reviewer. Proceed with the bounded transitive-closure correction and actual affected independent review/checks; preserve both failed campaigns and original limits. R9 editorial/PDF/rights/production intent and all existing admission/release gates remain unchanged, with no additional author permission required.
