# Sol execution — 6 October 2026

The maintainer asks Sol to execute the existing Writing plan in Draft #23.
Before early-detail correction: `ba2ac7f257f2937ab8805ad106cb4ce1a801382e`.
Current runtime: `8af0312b2f6494bce21e08774762f3a5bf2d68ab`, base engine
`9a82a529271c1d91c57de7be9c923a6bca5f3609acde7b4ed00ab55cc0944b92`.
The CI candidate can add diagnostic helpers while retaining those runtime bytes;
record its actual source/tree/artifact identities in each output.

## Bounded first run

- V0: six balanced desktop before/after pairs, fresh Chromium process/context,
  1440×900 DPR1.5 CPU×1, Research→Writing cold→Research→Writing warm.
  Normal navigation-ready timing and the subsequent 400ms refinement tail are
  recorded separately and inclusively. One mobile CPU×4 pair is a control.
- H1: four combinations of ribbons and spatial text transform, one fine-stage
  diagnostic each on current Color. Same DOM/styles/controls and camera path.
  A private derived artifact removes ribbon collect/paint; the existing text
  preference removes the transform but retains opacity/measurement hooks.
- H2: one current/no-Canvas-submission pair attributes layout versus rendering.
  Projection, sorting, clock and clearRect instrumentation remain. A no-draw
  sample is diagnostic evidence and cannot authorize a release.
- Additional screens depend on measured attribution. Source review also finds
  Color edge-scroll hooks reading root/ancestor sizes and writing footer hints
  on mount, page-ready and busy removal. Disabling text flight does not remove
  this work; use an independent hook-bypass if it remains a plausible factor.

All renditions verify exact public manifest/snapshots and retain explicit
intervention/parent fingerprints. No diagnostic rendition is published. The
same serial runner/browser and cache-disabled gzip server serve all inputs;
fine-stage/trace runs remain distinct from clean acceptance comparisons.

The CI run request is narrow and temporary. Normal preview still uses official
Wrangler Action. No full staging/native/soak matrix, promotion or new PR.

## Results

Pending this first run. A successful data-collection job is not a performance
pass; every raw window and validator failure must be retained before a fix.
