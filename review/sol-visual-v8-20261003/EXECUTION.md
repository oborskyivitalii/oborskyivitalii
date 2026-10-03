# v8 execution — living thematic fractals, 2026-10-03

## Intent versus result

The maintainer's shared conversation ends with an explicit request for recursive
structures built from page-specific symbols, flight between/inside them, a richer
vocabulary and slow cyclic animation at idle. Issue #1 records the amendment at
https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5964354028.
Baseline: `6b2d13ef291dac90c423cbf93e448eab00bc2818`, existing Draft PR #10 on
`work/site-v1-20261001`; base remains `work/issue-backlog-20261001`.

Implemented in the existing renderer: eight motifs per route, three recursive
symbol scales, four successive assemblies, open Cartesian camera paths and a
48-second periodic articulation of immutable geometry. The camera stays fixed
at idle. No cumulative drift, new framework, runtime asset/service dependency,
pointer motion or artificial scroll spacing. Off/reduced freezes the actually
painted camera AND ambient phase; hidden/print discards elapsed wall time.
See [design and source rationale](DESIGN.md) for formulas and limits.

## Preserved content and history

All five HTMLs were compared against the baseline after removing only generated
scene SVG. Home, Research, Writing and Talks are otherwise byte-identical.
Credits differs only in its authorized explanation of ambient movement and Off.
Fixed 27-primary-record metadata plus the separate LinkedIn rendition, five Home
EN works, eight discussion entries, public links, schemas and original portrait
hashes pass the existing independent-baseline content tests. Historical review
files are unchanged. UA/Subprime ownership and research state remain unchanged.

## Validation

- 33 Node tests passed: theme 6, scene 10, archive 6, content 6, preview 5.
- 18 Python adapter tests passed. RI rebuilt/verified after final source changes.
- Meaningful scene checks cover periodic position/velocity closure, immutable
  geometry, bounded detail, continuous/reversible through-flight, near clipping,
  immediate scroll response, idle camera stability, independent ambient movement,
  Off/reduced, hidden/print pause, local reflow and empty archive restoration.
- Removed obsolete orbit-radius, full-hero-always-visible and no-idle-loop
  expectations. The content claim guard now ignores decorative SVG coordinates:
  a `4400` substring in a decimal coordinate is not a numerical author claim.
- Actual Chrome 154.0.8037.97: five routes × two themes × desktop 1440×900 /
  mobile 390×844, plus 360px, CSS zoom 200%, Off/reduced, keyboard Escape/focus,
  pointer neutrality, native scroll, archive query/hash/history/reflow, print
  lifecycle, no-JS/Canvas and a genuinely short no-scroll page passed.
- 40 contrast views, 4,374 sampled glyph backgrounds: minimum normal text
  4.553:1, large text 6.848:1; no sampled failures. Motion is frozen for each
  background sample; this is not all-frame WCAG certification.
- Five actual ambient/forward/reverse recordings play at 960×600, about 12–14s.
  The initial stationary hold demonstrates ambient motion. They are captured
  browser frames, not a generated animation or interpolation.
- Fifteen standalone pages, gallery, capture/source/bundle hashes and extracted
  ZIP navigation/rendering/video decoding passed. The five interactive files
  inline their resources; keep the full package together for cross-page links.
- No production deployment or merge is performed. Live CI is recorded in PR/issue
  after committing, rather than inferred from historical v7 CI.

## Archive delivery

The 18.6 MB ZIP exceeded the GitHub connector request size. All review pages,
recordings and captures remain committed. The ZIP is delivered separately;
`tools/build_site_bundle.py` produces it in `../deliverables/`. Its committed
manifest binds every entry and the complete deterministic ZIP digest. CI rebuilds
that digest, and compares a local ZIP too when present. Historical ZIPs remain
untouched. This avoids duplicating the new large binary in Git.

## Observed limits

Headless Linux Chrome and mobile viewport/touch emulation do not establish
physical-phone performance, native browser zoom, hidden-tab switching or a real
print dialog. VM tests cover hidden-time suspension; print lifecycle is dispatched
in browser checks. Instrumented callback p95 ranged from 13.2 to 60.5ms across the
matrix on this machine; no 60fps guarantee is made. Ambient paint caps are 24Hz
on desktop and 16Hz on narrow viewports. The renderer's finite geometry and LOD
bound work, but actual mobile hardware remains a review item.

This is implementer verification, not independent/editorial/rights acceptance.
PR #10 remains Draft and launch #1 remains open for maintainer artistic acceptance
and the recorded URL, rights and release decisions. The v7 implementation and
checks are preserved as history, not treated as approval of the rejected design.

## Reproduce

From the checkout, use the commands in SITE-OPERATIONS.md. Optional browser tools:

```
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" \
SITE_REVIEW_CHROMIUM=/path/to/chrome \
node tools/capture_site_review.cjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" \
SITE_REVIEW_CHROMIUM=/path/to/chrome \
node tools/check_site_contrast.cjs
python3 tools/build_site_contact_sheets.py
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
```

Browser tooling is not a site dependency. This execution used official Google
Chrome because the installed Playwright version's browser download was truncated.
The ordinary shell sandbox blocked browser sockets and Node subprocess tests;
authorized escalated executions completed them. No website access block was
bypassed or mislabeled as visual acceptance.
