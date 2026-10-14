# Issue 41 — 2026-10-10 Arkadiy and stationary-scroll browser review

Owning issue: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Owning execution and accepted scope: [content amendment](2026-10-10-arkadiy-content.md).
Reviewer role: delegated execution QA; self-verification, not independent editorial approval.
Inspected state: prepared dirty source based on main
`93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`, with source-file SHA-256 observations in
the [raw browser record](arkadiy-review/captures/browser-observations.json).

## Intent and methods

Check the supplied Home/Research editorial candidate separately from the current
launch-admissible output, and check the maintainer's added instruction to remove
camera movement during native scrolling while retaining route flights, content
fades and movement. No merge, production launch or permission grant occurred.

The default maintained sources exclude both Arkadiy cards. The full review copy
was built in an isolated temporary repository copy by overlaying the four reviewed
JSON/template snapshots under `arkadiy-review/{index,research}` onto their canonical
source locations. Both states used the normal producers:

```sh
node tools/site/build.cjs
node tools/build_site_previews.cjs
node tools/site/export.cjs /tmp/issue-41-review-export color
```

These are the existing composition/export tools. No publishing pipeline, runtime
flag system or shared-source mutation was added for the review candidate.

Actual browser observations used pinned Playwright 1.63.0 and Chromium
138.0.7204.0, distributed by npm package `@sparticuz/chromium@138.0.2` in the
temporary QA environment. The pinned Chromium 153 CDN download returned incomplete
archives and could not be installed in this environment. Browser launch used only
the existing `--no-sandbox` and `--disable-dev-shm-usage` fixture arguments; vendor
arguments that disable web security were not used. This is scoped local Chromium
evidence, not the pinned hosted smoke, a multi-engine regression or a physical
device review.

| State | Tested self-contained Color export | SHA-256 | Bytes |
| --- | --- | --- | --- |
| Launch-admissible; two Arkadiy cards omitted | `Launch-safe.html` | `536bfaa0ea1d8b6a4c2e34f08a27deed1120e501731a186318deda79534c8117` | 728669 |
| Owner-review candidate; supplied cards included | `Arkadiy-review.html` | `933cba3ee366aca4d6a2f2fa0d403245c8033ac6790a90ad9ced5c2e4e1a8954` | 732018 |

## Findings and evidence

All sixteen combinations passed: both content states × Home/Research ×
1440 × 900 desktop / 390 × 844 mobile × Day/Night. Every case reached the actual
native document bottom and retained the same settled camera before/after scrolling.
Both states also passed one desktop journey through all five routes.

| ID | Observation | Acceptance implication | Disposition |
| --- | --- | --- | --- |
| F01 | Review Home shows Arkadiy, Matthew, Markus; default Home shows Matthew, Markus. Review Research has 8 cards; default has 7. Both formal advisors remain present and separate. | AD01, AD02, AD04 | Verified against actual rendered names/order and no additional cards. |
| F02 | Exactly one shared explanation appears per public-response section in all cases. The Research public discussion and formulation attribution are separate paragraphs with distinct links. | AD01, AD02 | Verified in rendered content and captures. |
| F03 | The profile, exact LinkedIn post and exact formulation-provenance URLs remain present in the review cards. Other rendered card links are recorded unchanged. | AD03 | Actual link attributes observed; external destinations were not exercised as a new rights check. |
| F04 | No horizontal document overflow, text outside card bounds, line clamp or internal card scroll was found. Card heights grow naturally. Existing Home body font is 15 px, Research body 16 px and context text 14 px. | AD05 | All sixteen cases passed; no font/style reduction was introduced. |
| F05 | Route Home → Research produced 16 painted `flying` samples and 1 settled sample in each content state. Minimum observed content opacity was 0, transforms differed from `none`, and destination camera differed from Home. Sampling pauses were 65 ms between observations; this is not a frame/performance benchmark. | Added scroll scope | Existing camera flight, content fade and movement observed. |
| F06 | Research, Writing, Talks, Credits and Home each reached their actual bottom with a byte-equal settled camera before/after native scroll, for both content states. | Added scroll scope | All five routes verified locally. |
| F07 | Runtime `pageerror` observations were empty. | AD05 | No runtime exceptions seen in these scoped journeys. |

Full raw observations retain card text, link attributes, font sizes, bounds,
native scroll ranges in CSS pixels, camera position/target JSON and flight sample
states. The default desktop bottom ranges were Home 5075, Research 5150, Writing
5361, Talks 1321 and Credits 2024 CSS px; the review text raised Home to 5189 and
Research to 5629. These are viewport-specific observations, not fixed application
constants or budgets.

The sixteen section captures and four Research-card detail captures occupy
977428 bytes as lossless WebP. Capture hashes and source PNG names are in the raw
record. Full browser-page captures were cropped to exact section/card bounds;
no screenshot content was edited. All sixteen sections were inspected in four
contact sheets, with representative longer cards also inspected at native width.
Crops establish reading geometry; they do not record ongoing animation.

| State / page | Desktop Day / Night | Mobile Day / Night |
| --- | --- | --- |
| Review Home | [Day](arkadiy-review/captures/review-index-day-1440.webp) · [Night](arkadiy-review/captures/review-index-night-1440.webp) | [Day](arkadiy-review/captures/review-index-day-390.webp) · [Night](arkadiy-review/captures/review-index-night-390.webp) |
| Review Research | [Day](arkadiy-review/captures/review-research-day-1440.webp) · [Night](arkadiy-review/captures/review-research-night-1440.webp) | [Day](arkadiy-review/captures/review-research-day-390.webp) · [Night](arkadiy-review/captures/review-research-night-390.webp) |
| Default Home | [Day](arkadiy-review/captures/launch-safe-index-day-1440.webp) · [Night](arkadiy-review/captures/launch-safe-index-night-1440.webp) | [Day](arkadiy-review/captures/launch-safe-index-day-390.webp) · [Night](arkadiy-review/captures/launch-safe-index-night-390.webp) |
| Default Research | [Day](arkadiy-review/captures/launch-safe-research-day-1440.webp) · [Night](arkadiy-review/captures/launch-safe-research-night-1440.webp) | [Day](arkadiy-review/captures/launch-safe-research-day-390.webp) · [Night](arkadiy-review/captures/launch-safe-research-night-390.webp) |

## Completion and remaining gates

The supported PR-preview smoke's maintained names/order expectations now reflect
the default output. Its selector targets acknowledgement article headings rather
than a particular grid layout. `node --test tests/preview-smoke.test.cjs` passed
9/9 existing meaningful identity/served-byte/detail cases; the separate canonical
smoke and required current-head CI remain owned by the execution flow.

| Criterion | This review establishes | Remaining gate |
| --- | --- | --- |
| AD01–03 | Actual review text structure, section explanations, rendered source links | Owner/editorial acceptance and the authoritative source/rights checks remain distinct. |
| AD04 | Default/review candidates are distinct; visible card names differ as required | Default full-output payload absence is established by canonical content checks, not screenshots alone. No consent inferred. |
| AD05 | Sixteen desktop/mobile Day/Night content checks, readable captures, actual bottom and retained navigation motion | Pinned current-head hosted smoke and any existing independently required device review. |
| AD06 | Source/capture/export hashes and raw local evidence retained | Final generated freshness, required CI, issue checkbox reconciliation and PR linkage. |

Issue synopsis: both prepared content states passed the bounded Home/Research
desktop/mobile Day/Night review. Native scrolling kept the camera fixed on all
five routes; existing route flight/fade/movement remained observable. The full
Arkadiy copy is for owner review, and the default launch-admissible output omits
both cards. No merge, launch or new third-party consent is asserted.
