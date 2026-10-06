# Content-sized reading backdrops

## Maintainer follow-up: real contact and remaining geometry

Input: three new Safari/iPad screenshots, `image(6).png` through `image(8).png`,
plus explicit instruction to add `https://calendar.app.google/zy9rAnUcoWygSdxH7`
and public email `oborskyivitalii@gmail.com`. Screenshot 7/8 show immutable PR #27
preview `a24cfb8d`; #28 is an alternative follow-up on the same parent, not its
descendant. This increment continues #28 and retains useful unique #27 fixes.

- The Research H1 still painted its maximum-width box after the long line wrapped.
  Exact decorative spans now paint each native line fragment in Research, Writing
  and Talks. Glyphs, headings and line-breaking copy are unchanged; no measurement
  loop or backdrop blur is added.
- Talks' full row panel is replaced by separate fitted metadata and title/link
  cells. Reading protection stays present without covering the empty right column.
- Writing's filter form now has one compact row-alpha background around the actual
  controls, including Reset. Its labels have no second background. Archive article
  rows keep their existing protection; year gutters and publication records remain.
- Retained #27 fixes: one Contact backing without nested notes; compact feathering;
  child protection for next-route and footer; Credits H1, About headings and archive
  link protection; content-fit short text blocks; correct print footer cleanup.
- Contact replaces its placeholder with the supplied booking link, a visible public
  mailto address and secondary LinkedIn link. The CTA makes no unverified claim about
  appointment duration. Plain email links survive versioned snapshots and standalone
  exports. The source boundary admits plain addresses only, without header parameters.
- Frozen-copy checks reverse only the exact approved contact block and three exact
  title wrappers. Negative mutations retain changed destinations, copy and wrapper
  identities. The prior publication/SEO/source inventory stays authoritative.

Local generation, 23 basic/theme/archive/flight and 33 focused checks pass. Base CSS
correctness lint passes. Independent review and hosted CI/browser results are recorded
in #28/#14 on the exact published head; this report records the source-stage checkpoint.
No local-browser or physical Safari/iPad pass is claimed. Source code/outputs are
repository-backed and no existing local worktree was reset or overwritten.

The earlier section below describes the initial #28 increment. Its advice-only
contact scope and per-label filter treatment are superseded by this explicit follow-up.

Owner: #14. Maintainer input: 6 October 2026, separate stacked PR on #23.
Baseline runtime: 428f5ee58f73d53ff200a865a3fde05c1db083d3. Parent advanced to
abfb1f272b11628274ac42c912e91477e995b132 during preparation; its four fixture/report
changes are retained. Those changes do not alter public/runtime bytes.

## Change

- Color background alpha: open 78% to 83%, reading 82% to 87%, rows 84% to 89%.
- Base alpha: 86/90/91% to 91/95/96%; compact Home 92% to 97%.
- Reduced-transparency Color backgrounds saturate at 100% (previously 96%).
- Navigation, filter forms, archive landings and footer containers no longer
  paint an empty full-width backdrop. Their actual links/labels retain local
  protection with a 10px feather; existing buttons/selects retain their own fill.
- Text/card grids align items to their natural height instead of stretching a
  short card/paragraph to its neighbour. Year labels shrink to their text while
  retaining the route gutters, including the nested fallback archive heading.
- Shared source and authored Color source agree. Dependent public snapshots and
  all fifteen current standalone page exports are regenerated.

Glyph opacity, content, publication identities, SEO, scenes, single clock and
native scroll ownership are preserved. There is no blur/controller/dependency
addition. Calendar/email advice is outside this implementation.

## Verification and boundaries

Existing basic, focused content/scroll/ribbon/Color-source tests and generated
output checks are run on the changed source; actual results are recorded in the
PR and #14. RI is regenerated against the complete original inventory with
byte-exact admitted text; historical binary/HTML files are existence placeholders
locally and are never uploaded or replaced in the GitHub tree.

Local browser verification is unavailable: no Chromium executable is installed,
and its official browser download returns an invalid/truncated ZIP. This is a
local execution limitation, not a site failure or browser-pass claim. The
existing CI creates the PR preview and performs its real two-width Chromium
Color smoke. Hosted visual review follows that preview. Full three-engine,
content-growth/endpoint/native/performance acceptance and physical Safari/iPad
remain separate under #12/#13; this draft must not claim their completion.

No provider upload, stable staging promotion, main change or production release
is part of this follow-up. Keep #14 open for owner visual acceptance.
