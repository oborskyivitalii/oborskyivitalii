# Issue 41 — 2026-10-10 topic-led editorial browser review

Owner: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Role: delegated execution QA/self-verification; separate independent editorial
review and current-head CI remain required. This record concerns the current
canonical content correction. Earlier permission-pending two-composition captures
and exported HTML remain historical and were not relabeled or overwritten.

## Tested source and setup

The ordinary canonical public build was copied through `artifact.cjs` and derived
through the existing supported Color staging producer; there was no review overlay,
alternate active HTML, new publishing pipeline or production launch.

| Identity | Observed value |
| --- | --- |
| Prepared Git base | `ca4ee44e50c70cb036ccca3fa6d97d7108ecd423`; source dirty |
| Base public artifact digest | `1f1dcf1a916017b1c3aedc5b812e953da438a44b81082f4c201db28d1f7288f1` |
| Tested Color artifact digest | `cc65e3c4ed3a2b15363698dad9d2d7827149c21846ed9020bdb9de981d16fd24` |
| Color engine identity | `9fd66a22f26b9cb487179db4d38812a1c03627d436506422cd0987cfdd8509c8` |
| Exact assembled Color `space.js` SHA-256 | `443c932e6991cad9027f59b03a69e310765c4c0dd515b57ba1a57889f8b0e864` |

The [raw record](editorial-captures/browser-observations.json) contains authored
source hashes, exact public file hashes, card/link/typography observations, actual
scroll ranges and camera/flight samples. Thirteen served public files were verified
against the artifact manifest; the complete public tree also passed the canonical
artifact verifier before and after observation. Dirty Git is not represented as a
clean committed check; exact generated/public bytes provide the bounded binding.

```sh
node tools/quality/artifact.cjs build /tmp/issue-41-editorial-public
node tools/staging/color.cjs /tmp/issue-41-editorial-public
node --test tests/preview-smoke.test.cjs
```

Scoped captures used pinned Playwright 1.63.0 with recovered Chromium
138.0.7204.0 and the repository's standard two launch arguments. Pinned Chromium
153 could not be installed locally because its CDN returned incomplete archives.
These are real loopback browser observations, not pinned hosted CI, a physical
device review or performance evidence. The maintained hosted smoke can use
`SITE_PUBLIC_DIR`, `SITE_ARTIFACT_MANIFEST`, `SITE_REPORT_DIR` and
`SITE_AUDIT_CHROME=/tmp/chromium` with `node tools/quality/local-browser.cjs --smoke`;
the pinned CI browser remains the authoritative hosted-profile environment.

## Observations

All eight current Home/Research × desktop 1440 × 900/mobile 390 × 844 × Day/Night
cases passed. Home has three records; Research has eight, with its two formal
advisors unchanged and separate. Each public-response section has exactly one
current section explanation. The new records have plain topic headings, linked
ordinary bylines identifying “EPAM founder,” the precise original-post URL and,
on Research, separate formulation provenance and its precise source link.

No empty records, horizontal page overflow, text outside card bounds, line clamp
or inner scrolling appeared. Existing body typography remained Home 15 px,
Research 16 px and byline 14 px. The longer mobile Research record grows naturally
to approximately 802 CSS px; body text was not shrunk to fit. All eight cases
reached the actual document bottom with an unchanged settled camera.

The desktop navigation journey verified fixed native-scroll cameras on all five
routes. Home → Research recorded 17 `flying` samples among 19 observations,
minimum content opacity 0 and non-`none` content transforms; the destination camera
changed. The inter-observation pause was 65 ms, not a frame/performance benchmark.
Runtime errors were absent. This confirms retained route flight/fade/movement and
stationary reading cameras within the scoped environment.

Sixteen lossless WebP captures—eight complete sections and eight record details—
occupy 625720 bytes. They are exact browser full-page crops at measured bounds;
no capture text or imagery was edited. Representative desktop/mobile Day/Night
record captures were inspected at native width; the parent execution agent also inspected
current section/detail captures. Crops establish content layout, not an animation
recording.

| Page | Desktop section Day / Night | Mobile section Day / Night | Mobile record Day / Night |
| --- | --- | --- | --- |
| Home | [Day](editorial-captures/index-day-1440.webp) · [Night](editorial-captures/index-night-1440.webp) | [Day](editorial-captures/index-day-390.webp) · [Night](editorial-captures/index-night-390.webp) | [Day](editorial-captures/index-day-390-record.webp) · [Night](editorial-captures/index-night-390-record.webp) |
| Research | [Day](editorial-captures/research-day-1440.webp) · [Night](editorial-captures/research-night-1440.webp) | [Day](editorial-captures/research-day-390.webp) · [Night](editorial-captures/research-night-390.webp) | [Day](editorial-captures/research-day-390-record.webp) · [Night](editorial-captures/research-night-390-record.webp) |

## Helper and remaining gates

The maintained PR-preview helper preserves linked-author names/order while
accepting the ordinary byline location. It also checks the plain topic heading,
the exact normal byline and separate Research provenance heading. All existing
route, artifact identity, served-byte, visibility and profile assertions remain.
Existing preview unit cases passed 9/9 after the root's final pinned formatting;
current helper SHA-256 is
`2b724b32137c51985f0d3321cda4b89b1a7dc90a86d4b909f0ef9af26e232dac`.
The raw record separates its observed pre-format hash from the current formatting
hash; formatting the check helper did not change the tested public artifact.

This scoped browser evidence supports the current editorial/layout and fixed-scroll
conditions. Required current-head gates, independent review, actual issue-checkbox
evaluation and exact PR/CI linkage remain with the owning execution flow. No merge,
production activation or new third-party permission is asserted by these checks.
