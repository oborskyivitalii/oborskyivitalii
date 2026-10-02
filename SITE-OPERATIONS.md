# First site: candidate, review and release

## Current v5 candidate — 2026-10-02

The instructed S0–S4 implementation is in Draft PR #10. [Execution/evidence](review/sol-visual-v5-20261002/EXECUTION.md)
records source/behavior/export checks, actual browser captures and observed limits. Implementation
is distinct from independent review, editorial/rights acceptance, merge and deployment.
The approved contract remains [SOL-HANDOFF](SOL-HANDOFF.md). Owning issues:
[launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
[rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7),
[URL/hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).

Five static pages, CSS and three optional native scripts remain the entire runtime.
No site build, installed site package, remote font/service or analytics. Only docs/
is the proposed Pages source; drafts/review/process content stays outside it.
Home follows Hero → Research → Help → five selected EN works → eight bounded
public discussion entries → About → Contact. Research holds details/source links.
Writing preserves 27 primary records (20 EN/7 UA) plus the separately dated
Thinking Systems LinkedIn rendition: 28 linked renditions, not unique works.
Talks retains three existing public records with unchanged language bounds.
Original JPEG/WebP bytes remain unchanged; native facets are behind the cutout.

## Inspect v5

Start with the [all-page gallery](review/site-v1-20261002-v5-index.html): all five
interactive pages, fixed Day/Night, desktop/mobile screenshots and recordings.

- [Interactive Home](review/site-v1-20261002-v5-interactive.html).
- [Day](review/site-v1-20261002-v5-day.html) / [Night](review/site-v1-20261002-v5-night.html).
- [Writing](review/site-v1-20261002-v5-writing-day.html), plus Night/interactive variants.
- Research/Talks/Credits each have the same three variants: 15 page copies plus the all-page gallery.
- [Offline package](review/site-v1-20261002-v5.zip): extract all, open index.html for the gallery.
- [Preview hashes](review/site-v1-static-previews-v5.json), [bundle hashes](review/site-v1-offline-bundle-v5.json)
  and [public-source record](review/site-v1-review.json).

Keep extracted/downloaded pages together for local navigation. Ten fixed-theme
copies show complete static HTML/SVG without executable scripts. Five interactive
copies inline exact scripts and retain Auto/Day/Night, Appearance/Motion and filters.
All review renditions are noindex. The package's separate site/ entries retain
exact docs/ production bytes; they do not acquire review noindex. v1/v2/v3 and
concept/proposal outputs are history, not the current candidate.

## Behavior and acceptance procedure

Appearance is a labelled native disclosure. Auto follows the visitor's local
clock: Day 07:00–18:59, Night otherwise; manual choice persists, storage failure
still works in-tab. Escape closes the disclosure and returns focus to its summary.
Anchor clearance follows the actual header height when JS runs, with CSS fallback.

The single decorative world has a UA feedback motif and separate verification
passage; neither is a canonical research diagram, simulation or measured bottleneck.
Native scroll follows named Home/Research sections. Writing Topic chooses its
finite path within visible result bounds; Year/Language only change results.
Remeasuring that block retains local path progress, including empty-result
restoration; the next native scroll resumes from that progress without a reset.
Talks/Credits use their short named paths; unknown pages are static. Pointer/hover never moves the camera.
Frames coalesce and settle within 150ms of the last target change; then RAF stops.
Off freezes the current pose; initial Off/reduced starts at that route’s composed pose. Reduced
motion overrides saved On. Theme/resize/layout/hidden/print return cannot move a
frozen pose; hidden/print cancels pending movement. No Canvas retains the route-specific
static SVG. No scripts keeps all articles and useful native topic/year destinations.

Archive state: valid query first, recognized topic/year fragment overrides its
respective filter dimension. Other filters remain. A filtered-out target reaches
a visible topic/year heading and empty explanation. Controls/Reset reconcile the
fragment, and history/hash restoration synchronizes the form/results/scene.
Printing shows all primary records and the additional rendition, then restores filters.

```sh
node tools/build_scene_fallbacks.cjs
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
node --test tests/theme.test.cjs tests/space.test.cjs tests/archive.test.cjs tests/content.test.cjs tests/preview.test.cjs
node tools/build_site_previews.cjs --check
python3 tools/build_site_bundle.py --check
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
git diff --check
```

For a permitted local browser:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8765/. Inspect all five pages at 1440×900/390×844 Day/Night,
360px and 200% desktop zoom. Verify portrait/three scene views, readable long EN/UA
titles, keyboard/focus/touch/native scroll, anchor clearance, reverse scroll,
Off/reduced, theme-only repaint, no-JS/Canvas failure, hidden/print return and idle.
On Writing test all topic/year fragments, Research's leadership link, conflicts
with queries, empty/one result, Reset/hashchange/back/forward and full print restoration.
Capture actual screenshots and a short motion recording or a genuine observed-state
interaction log, stating browser/viewport and any unperformed cases. Do not infer
measured frame rate or full accessibility from source/VM tests.

**Current browser evidence:** [v5 capture record](review/site-v1-20261002-v5-captures/captures.json)
contains the observed 1440×900/390×844 Day/Night matrix, behavior checks, 360px,
200% CSS zoom, no-JS/Canvas, short-route and real recording results. [Sampled contrast](review/site-v1-20261002-v5-captures/contrast.json)
passed 4.5:1 normal / 3:1 large text across 4,368 points. Headless Chromium/mobile
emulation and simulated print lifecycle are explicit; real phone hardware, native
browser zoom UI, native hidden-tab switching and print dialog remain unobserved.
The v4 block is preserved in its historical execution record. Optional reproduction
uses the installed Playwright/pngjs paths in [v5 execution](review/sol-visual-v5-20261002/EXECUTION.md);
no browser tooling is a production site dependency.

## Release and subsequent work

1. Review the concrete v5 content/assets; record editorial/rights acceptance in #7
   and the permanent URL/hosting choice in #8. English and candidate photo use are settled.
2. Complete correct absolute canonical/social/image URLs and sitemap for that
   actual URL, including the Writing query canonical policy; update candidate tests.
   Keep review noindex outside docs/. No provisional permanent identity is invented.
3. With explicit integration/release authorization, merge #9 first, retarget #10
   to main, inspect the new diff and rerun checks; then merge the accepted candidate.
4. Configure authorized Pages source main:/docs using an available capability or
   Settings → Pages → Deploy from a branch → main → /docs. Verify the served files,
   deployed commit, live URL, links and robots/indexability before closing #1/#8.
5. Search Console owner verification and real query measurement follow available access.

Keeping the current repository yields project URL
https://oborskyivitalii.github.io/oborskyivitalii/ after Pages is configured.
A root URL requires the separate rename/profile-README decision. No rename,
Pages configuration, merge or deployment is performed by this implementation.
A missing scheduler URL keeps the agreed visible placeholder and active LinkedIn route.

After launch, PMDay #2 owns the blueprint/manuscript and selected, inspected slide/PDF
edition; do not infer UA PR #113 release. Video follows its actual published edition.
Later original delivery/production guides and manual measurement belong to #11.
Quartz/PDF #5, cross-repository harness #6 and Subprime publishing remain independent.
