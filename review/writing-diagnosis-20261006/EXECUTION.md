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

Screen CI [37452014157](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37452014157)
collected all 25 trials at source `6b73399c4f0afeba497c92809686bba4b7a3200a`.
Artifact `11407570095`, ZIP SHA-256
`96eef80f532b7e07fad280d1fdc25298248b3ade87142c60f252ab8442557269`
was downloaded and verified. All raw trials remain in the retained artifact and
`screen.json.gz`; `screen-summary.json` holds identities, conditions and summaries.

Desktop V0 (six balanced pairs): before/current cold painted-callback p95 medians
20.1/31.65ms, p50 8.8/12.6ms, paints/s 27.58/23.39, first travelling paint
61.25/22.45ms, input-to-ready 1310.7/1291.35ms. Both sides pass 6/6 transition
windows. Before has 6.7ms median preparation after arrival; current has none.
The detail correction removes visible late rebuilding but increases desktop
render work. The one mobile control is 26.5/27.4ms p95, both passing; it is not
six-repeat mobile acceptance.

| Mobile fine-stage screen | Cold callback p50 / p95 (ms) | Native range max (ms) |
| --- | ---: | ---: |
| Color, text flight On | 15.1 / 27.5 | 31.2 |
| No ribbons, text On | 12.2 / 22.8 | 30.1 |
| No ribbons, text Off | 11.2 / 19.5 | 28.7 |
| Color, text Off | 14.4 / 31.6 | 28.3 |
| Base | 10.5 / 22.6 | 28.3 |
| Color, separate trace | 14.4 / 31.2 | 30.7 |
| No Canvas shape submission, trace | 8.5 / 18.3 | 35.8 |
| Color, separate edge pair | 14.5 / 27.6 | 31.4 |
| Edge hooks bypassed | 14.7 / 26.5 | 30.2 |

The cold native layout spike survives removing ribbons, text transform, Canvas
submission and edge hooks. Archive initialization is only about 2.8–3.5ms in
these flights; model build/color about 27–37ms before first travelling paint.
Direct Writing boot still has 47–57ms native range and 57–82ms model build/color;
its first projection contains model preparation, so those spans overlap.
Ribbons add repeated collect/paint work (about 1.3–1.7ms collect per callback,
plus submission); removing them also improves first-scroll p95 20→11.7ms in
this one screen. Edge hooks show no strong cold-layout effect. Prewarming moves
preparation before the click without eliminating it. These single-pair screens
prioritize a source fix; they are not repeated acceptance or display-FPS claims.

This runner uses Intel Xeon 6973P-C; the earlier six-round comparison used AMD
EPYC 7763. Its lower absolute times cannot be attributed to the source change.
Prior failed Color windows remain valid evidence.

## One exact source optimization and confirmation

Reuse identical scalar sin/cos evaluations within each ribbon section, reducing
native trig calls 20→11. Arithmetic order, mesh density, curves, material RGB,
seeded signals, camera and 24-second phase remain unchanged. Regression checks
compare 702 section outputs and 140 complete projector outputs exactly,
including both themes, viewports, clipping and curved edges.

Confirmation uses only normal unchanged Color control from `6b73399` and this
candidate: six balanced mobile CPU×4 pairs and three desktop pairs. Every side
gets a fresh direct Writing boot/first scroll and a separate fresh
Research→Writing→Research→Writing itinerary. Fine stages/traces are disabled.
The before Color producer is loaded from its own checkout, avoiding application
of the new ribbon code to both sides. Confirmation results remain pending;
no measured speedup or full-gate claim is made yet.
