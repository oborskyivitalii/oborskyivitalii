# V1–V5 visual implementation — 2026-10-02

The maintainer explicitly instructed Sol to implement the prepared visual tasks
and provide all pages for inspection. This continues launch #1 and Draft PR #10,
from `ad3eab4d7d49664d809a39683a4a22fd9f2bf8f1`, on the existing #9 base.
No research owner or approved publication edition was changed.

## Intent versus result

| Task | Candidate result and evidence |
| --- | --- |
| V1: visible scenery, readable text | Broad section masks removed. Open gutters surround local reading surfaces: 74% Day / 70% Night hero, 83% / 84% reading surfaces, 84% rows. Scene no longer has a separate .55/.45 opacity multiplier. Glyph-center samples on the real composited scene meet 4.5:1 for normal text and 3:1 for large text. |
| V2: convincing depth | Shared camera/projection retained. Distant frames, solid-edged middle structures and cropped foreground wedges have different scale, shading and contrast. Faces and lines share depth order; faces clip at the near plane. Camera position and look-at both change on native scroll; the portrait stays still. |
| V3: all page motifs | Home joins separate feedback and verification motifs; Research uses a distinct overview and section path; Writing uses offset planes; Talks widens signal ribbons; Credits is a sparse network with a smaller foreground. Each has matching generated SVG and a named finite initial pose. No decorative shape asserts a scientific result, measured flow or named-person relationship. |
| V4: observed behavior | All five routes at 1440×900 and 390×844 in Day/Night: no horizontal overflow, real native scroll changes the scene, idle drawing stops. Off, reduced motion, theme/resize, archive reflow, history, print lifecycle, fallback and short-page cases passed. Exact coverage/limits below. |
| V5: whole-site review | One gallery, fifteen exact-source page copies, 20 opening captures, six lower views, two real-capture contact sheets and five WebM scroll recordings. The ZIP opens through its root index.html and includes all pages, navigation, captures and videos. Historical v1–v4 outputs remain untouched. |

Open the [all-page gallery](../site-v1-20261002-v5-index.html), or extract the
[offline package](../site-v1-20261002-v5.zip) and open index.html. Every interactive
copy links the gallery and its fixed static Day/Night alternatives. Fixed-theme
pages show the actual SVG fallback; they are explicitly static.

## Actual browser and contrast evidence

[Capture record](../site-v1-20261002-v5-captures/captures.json) records Chromium
134.0.6998.35, exact SHA-256 hashes of all twelve public files, viewports,
observed checks and capture/video hashes. The current runtime's default Chromium
download failed; the pinned Playwright 1.51.1 install succeeded through its normal
official fallback and supplied a real headless browser. The old v4 browser block
remains historical evidence, not the status of v5.

The observed checks include:

- all five routes, both themes, desktop/mobile; native wheel scroll and stopped
  idle frames; pointer neutrality; Escape closes Appearance and restores focus;
- Off freezes projected world vertices through scroll, recoloring, equal-aspect
  resize and dispatched print return; reduced motion wins on all routes;
- Writing topic changes, year-only reflow and the next unchanged scroll, empty
  results, Reset, conflicting query/hash, back/forward and all 27 rows during
  print lifecycle with filter restoration;
- 360×844 in both themes; all routes at 200% CSS zoom without overflow;
- no JavaScript at 390×844 and missing Canvas on each route; useful content,
  route-specific SVG and hidden unavailable motion control;
- a real short Talks page at 1440×2400, where wheel input creates no scroll or
  camera motion and no artificial spacer was added.

[Sampled contrast](../site-v1-20261002-v5-captures/contrast.json): 40 real rendered
views, 4,368 glyph-center samples. Minimum normal-text ratio **5.450:1**;
minimum large-text ratio **6.848:1**; zero samples below their 4.5:1 / 3:1 targets.
Desktop start/middle/end and mobile start were sampled in both themes. Text paint
was hidden without changing layout to read composited background pixels; original
computed text colors supply the foreground. This is sampled evidence, not complete
WCAG certification or a claim about every hover/focus/scene crossing.

Recorded frame callbacks have medians 0.4–2.1ms and p95 2.4–25.6ms in this run,
including cold startup and review instrumentation. All paths settle and drawing
stops. These machine observations do not establish a physical-device frame rate.

Limits: headless Linux Chromium and mobile/touch emulation, not real phones;
200% CSS zoom, not the native browser zoom UI; dispatched print lifecycle, not
a print dialog; native hidden-tab switching remains unobserved. Existing VM
checks cover hidden/print cancellation and frozen re-entry. Recordings show real
scrolling; visual judgment was made from actual renders and extracted motion
frames, not from an invented concept image.

## Reproduction and checks

The optional capture tooling adds no production dependency or new test framework:

```sh
node tools/build_scene_fallbacks.cjs
SITE_REVIEW_PLAYWRIGHT=/path/to/installed/playwright node tools/capture_site_review.cjs
SITE_REVIEW_PLAYWRIGHT=/path/to/installed/playwright SITE_REVIEW_PNGJS=/path/to/installed/pngjs node tools/check_site_contrast.cjs
python3 tools/build_site_contact_sheets.py
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
```

Preview generation rejects stale public-source or changed capture hashes. The
bundle preserves exact docs/ bytes under site/ and keeps noindex review copies
under review/. Local checks: **32 Node + 18 Python tests**, preview/bundle/fallback freshness,
RI regeneration/verification and whitespace checks passed. Extracted ZIP navigation
was checked in Chromium: all five interactive pages, return-to-gallery links and
local WebM loading passed without runtime errors. The frozen
27 primary identities (20 EN/7 UA), separately dated LinkedIn rendition, five
featured English works, eight bounded public discussions and original JPEG/WebP
hashes pass the existing checks. Exact-head CI completion and remote ref
are recorded in PR #10 and issue #1 after the final commit.

This is implementer verification, not a new independent/editorial/rights review.
The PR stays Draft and launch #1 stays open. Human candidate acceptance, #7 rights,
#8 permanent URL and metadata, base integration and authorized publication remain
separate. The current task implements and presents the candidate; it does not
merge, rename the repository or enable Pages.
