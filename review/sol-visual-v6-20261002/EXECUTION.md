# v6 camera / sculpture / professional context — 2026-10-02

Owner: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
implementation [Draft #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10).
Baseline: `33806f116c38aa0c99f84468c5be944ed5aa9440`,
tree `c9694be85dabfdf09ca83832babfe49063f0e0d6` (identical to the prior local v5 tree).
The maintainer rejects v5's primitive objects and slow linear movement and asks
for a journey between viewpoints, richer recursive forms and people context.
[Original intent amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5958068633).

## Result versus intent

- Native scroll follows a cylindrical Catmull–Rom camera path. Position changes
  angle, height and distance; target changes separately, with fixed world-up.
  This replaces straight Cartesian interpolation and modest v5 camera shifts.
  Response follows the gesture immediately and settles after the final target;
  it does not reset to an empty t=0 frame on every new wheel/touch event.
- Home/Research: faceted spatial knots and a separate recursive verification
  sculpture. Writing: eight helicoidal strata, repeated nested contours and a
  recursive core. Talks: outward knot and branching signal paths. Credits:
  recursive tetrahedral structure and branching contours. Shared near/distant
  ornaments, materials and light maintain one related visual language.
- Fractal detail is finite (two/three tetrahedron subdivisions, bounded binary
  branching); no recursive work occurs per frame. Mobile starts with fewer
  tube segments/rings/near subdivisions. Face lighting and theme fills are
  cached. Geometry remains decorative, not research output or people mapping.
- Home and Research now identify all eight existing entries through distinct
  LinkedIn profiles and professional context. Sources/limits are in
  [SITE-SOURCE-AUDIT](../../SITE-SOURCE-AUDIT.md). Michael Risch's exact-profile
  indexed title supports Senior Project Manager; current employer is omitted
  because it was not reliably exposed. The Villanova law professor is excluded.
- Preserve native navigation, Off/reduced freeze, idle stopping, no-JS/Canvas
  fallback, theme recoloring, Writing topic/reflow/history/print behavior,
  original JPEG/WebP, 27 primary archive identities and one secondary rendition.

## Current checks

36 Node tests (6 theme, 13 scene, 6 archive, 6 content, 5 export) and 18 Python
adapter tests pass. Added meaningful regression coverage for immediate response
under continuous scrolling, curved paths/exact endpoints/continuity/safe distance,
bounded deterministic recursion and distinct LinkedIn identity/context coverage.
Existing public contribution links, publication identities and portrait tests pass.

Browser: all five routes × Day/Night × desktop 1440×900/mobile 390×844.
Native scroll changes the actual Canvas; idle stops. Off mid-motion, reduced
motion, pointer neutrality, frozen theme/resize/print return, Writing reflow/history,
360px and 200% CSS zoom, no-JS/Canvas failure and short-route handling pass.
Exact source hashes, browser version and observed callback costs:
[actual capture record](../site-v1-20261002-v6-captures/captures.json).
Forty rendered text-background views: 4,422 sampled glyph centers, minimum normal
text 5.184:1 and large text 6.848:1, no sampled failures. This is a sampled check,
not complete WCAG certification. [Contrast record](../site-v1-20261002-v6-captures/contrast.json).

Delivery videos are VP9 encodings at 960×600 of the actual 1440×900 browser
recordings, with constrained 250 kbps for the complete portable package. No
generated/interpolated frames; PNG screenshots retain their captured dimensions.

Review index: [all five pages](../site-v1-20261002-v6-index.html), including actual
Day/Night desktop/mobile captures and five forward/reverse scroll recordings.
[Offline bundle](../site-v1-20261002-v6.zip). Production-source bytes stay exact in
site/; review renditions are noindex. Historical v5 exports remain unchanged. The extracted package was checked in
Chromium for gallery redirect, all five interactive routes/motion within their
semantic/result ranges, return links and local WebM loading.

## Reproduction and limits

The runtime remains static HTML/CSS/Canvas, without new site dependencies.
Optional browser tools use the installed Playwright/Pillow/pngjs and an explicit
existing Chromium binary on this workspace:

```sh
SITE_REVIEW_CHROMIUM=/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell node tools/capture_site_review.cjs
SITE_REVIEW_CHROMIUM=/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell node tools/check_site_contrast.cjs
python3 tools/build_site_contact_sheets.py
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
```

The checks observe headless Linux Chromium and touch/viewport emulation, not a
physical phone. CSS zoom and dispatched print lifecycle are explicit substitutes;
native print-dialog and hidden-tab UI inspection remain unobserved. Callback
costs include instrumentation and cold-start outliers; they are not an FPS or
physical-device guarantee. This is implementer verification, not independent or
editorial/rights acceptance. Draft #10 and launch #1 remain open. No merge or
publication; permanent URL/rights/base integration decisions remain separate.
The pushed ref/tree and live CI are recorded in the PR/issue completion comments.
