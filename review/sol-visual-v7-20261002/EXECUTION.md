# v7 — page-specific sculptural still lifes, 2026-10-02

Owner: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
implementation [Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10).
Baseline `407f94f0c8de2b3a0749729eb8fbebc1b317fe61`, tree
`be127cae9b5362c2427ac0bbd66da18659c372c2`.
[Original intent before implementation](https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5958821286).

## Intent and result

The maintainer rejected v6's interchangeable abstract scenery and explicitly
requested meaningful objects for each page, with books, letters and pages for
Writing. More recursion did not recover that meaning. v7 replaces the repeated
knots/tetrahedra with three principal subject families for each route:

| Route | Actual modeled subjects | Page relationship |
| --- | --- | --- |
| Home | Faceted compass, ascending steps, arch | Orientation, progress and architecture around the author. |
| Research | Gyroscope, recursively branching tree, successive frames | Control, alternative hypotheses and verification. |
| Writing | Open book with boards/page block/curved leaves/bookmark, loose sheets, extruded A | Reading, original publications and typography. |
| Talks | Capsule microphone with grille/yoke/base, curved wave fronts, presentation screen | Spoken discussion and presentation. |
| Credits | Solid quotation marks, interlocking links, bookmarked source cards | Attribution and original sources. |

Each scene has a quieter distant echo of its own objects. The shared design is
cyan metal, bronze accents, paper, directional faceted lighting and perspective;
no dominant ornament is copied across all routes. The geometry is decorative,
not a scientific diagram, simulated audio or a depiction of named people.

The existing renderer projects solid faces and contours through the curved
camera journey. Target framing now follows the new object locations. Mobile
reduces tessellation and projection scale; the no-JS SVG uses matching mobile
framing. Paper has its own theme-aware light-catching surface. Local reading
surfaces stay readable; filters/counts no longer mask an unnecessary full-width
strip. Opening titles leave room for their subject, and mobile title padding
no longer creates isolated short words.

Native scroll, continuous-gesture response, reversible camera endpoints,
Off/reduced freeze, pointer neutrality, idle stop and Writing topic/reflow/
history/print behavior remain. All five HTML files are byte-identical to the
baseline outside the regenerated scene SVG. Public words, profile/contribution
links, metadata, 27 primary records plus one secondary rendition and both
portrait assets therefore retain their previous evidence and boundaries.

## Verification

37 Node tests passed: 6 theme, 14 scene, 6 archive, 6 content, 5 export.
18 Python tests passed. The old assertion requiring a recursive tetrahedron on
every page was removed because it enforced the rejected design. Its replacement
checks deterministic three-family compositions, real depth, different normalized
primary geometry, bounded complexity and reduced mobile tessellation. A new
framing regression samples every route and Writing topic journey at desktop and
mobile sizes; at least 80% of each primary subject's projected bounding rectangle
stays within the viewport. These are geometric checks, not proof of artistic quality.

Actual Chromium 134.0.6998.35: five routes × Day/Night × 1440×900 desktop /
390×844 mobile; scroll changes, idle, errors and overflow checked. The behavior
matrix covers Off mid-motion, reduced preference, theme/resize/print freeze,
Escape/focus, pointer neutrality, archive reflow/first-scroll/history/empty results,
360px, 200% CSS zoom, no JS/Canvas, and a short route without artificial scroll.
The real start/lower captures and five forward/reverse recordings are source-hashed
in [captures.json](../site-v1-20261002-v7-captures/captures.json).

Forty actual text-background contrast views: 4,334 sampled glyph centers,
minimum normal text 5.632:1 and large text 6.848:1, no sampled failures.
[Method and measurements](../site-v1-20261002-v7-captures/contrast.json).
This is sampled evidence, not complete WCAG certification.

Actual rendered openings, mobile contact sheets and recorded motion frames were
visually inspected for subject identity, layout and changing perspective. Static
fallback/source parity, complete export/bundle hashes, extracted package
navigation/motion/video playback, historical artifact preservation, RI freshness
and whitespace checks passed. The remote tree/commit and live CI result are
recorded in PR/issue completion comments after the candidate is pushed.

## Handoff and reproduction

[All-page gallery](../site-v1-20261002-v7-index.html), five standalone interactive
HTML pages, ten fixed Day/Night copies and [complete ZIP](../site-v1-20261002-v7.zip).
Extract the ZIP and open index.html. Review renditions are noindex; site/ keeps
exact production-source bytes. Historical v6 and earlier artifacts remain unchanged.
Recorded video delivery is VP9 CRF 32 at 960×600 with a 450 kbps target, encoded from actual 1440×900 Chromium
frames without generated/interpolated motion. PNGs retain their capture dimensions.

Runtime stays static HTML/CSS/Canvas, with no new site dependencies. Optional
review tooling uses the installed Playwright/pngjs/Pillow/FFmpeg:

```sh
node tools/build_scene_fallbacks.cjs
SITE_REVIEW_CHROMIUM=/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell node tools/capture_site_review.cjs
SITE_REVIEW_CHROMIUM=/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell node tools/check_site_contrast.cjs
python3 tools/build_site_contact_sheets.py
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
node --test tests/theme.test.cjs tests/space.test.cjs tests/archive.test.cjs tests/content.test.cjs tests/preview.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
```

Browser observations use headless Linux Chromium and mobile viewport/touch
emulation. Native zoom/print dialogs, physical phones and native hidden-tab UI
remain unobserved. Instrumented frame callback timings in the capture record
include cold-start/environment costs and are not a physical-device FPS guarantee.
This is implementer verification, not independent/editorial/rights approval.
The maintainer's visual acceptance remains open. PR #10 stays Draft and #1 open;
permanent URL/rights, base integration, merge and deployment remain separate.
