# Content-sized reading surfaces

Issue #14; maintainer-requested Draft follow-up stacked on #23. The inspected
runtime was `428f5ee58f73d53ff200a865a3fde05c1db083d3`; the stack also inherits
the subsequent fixture-only `abfb1f2` correction. The five supplied screenshots
were visually inspected. No research or published copy is changed.

## Result

The empty bands in Home/Research came from a backdrop on the full-width local
navigation container. Backdrops now follow individual links, filter labels,
footer items, archive landing labels and continuation text. Container gutters,
native controls, anchors and route ownership remain intact.

Grid cards and introduction paragraphs use their content height. Short cards no
longer inherit their taller sibling's backing; research-card links consequently
follow their own content rather than sharing an artificial bottom position.
The contact note no longer adds a second backdrop inside its protected parent.
About and Credits headings and the archive link receive local protection.
Feathering extends 12px beyond normal blocks and 8px beyond small controls,
instead of the previous 24px. Text opacity stays unchanged; no blur is added.

“5% less transparent” is implemented as five percentage points more background
alpha in both themes:

| Rendition | Open | Reading | Rows |
| --- | --- | --- | --- |
| Color before → after | 78 → 83% | 82 → 87% | 84 → 89% |
| Base before → after | 86 → 91% | 90 → 95% | 91 → 96% |

Base mobile hero 92 → 97%; Color's reduced-transparency preference 96 → 100%.
The two no-JS year labels gain exact inline wrappers. The frozen-copy check
reverses only those exact wrappers, and still rejects changed year IDs/labels.

## Verification

- Local source profile passes: 13 theme/archive and 10 flight tests, all five
  routes, ten finite worlds, snapshot identities, script syntax and size budgets.
- 13 focused ribbon/Color-build/executive checks pass; original copy, SEO,
  article links, dates and language labels remain frozen.
- Base stylesheet and the authored Color reading stylesheet pass correctness
  lint; generated output and Repository Intelligence freshness pass.
- Independent source/diff review by `layout_audit` found the year-label assertion
  that was corrected; no remaining source blocker was identified.

Local Chromium installation failed with invalid ZIP downloads in both supported
installers. No local browser geometry, screenshot, contrast, performance or
device pass is claimed. The existing CI-only PR preview and hosted smoke own
the next browser check. Owner visual acceptance remains open; this follow-up
does not launch full staging, merge or production publication.

## Contact recommendation

Use a direct Google appointment-booking link in Contact, with a visible email
address as a second option. A 30-minute call, 15-minute buffer and a short topic
field are practical defaults. Booking URL and public address have not been
supplied; no placeholder destination or account identity is invented.
