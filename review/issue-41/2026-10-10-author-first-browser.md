# Issue 41 — 2026-10-10 author-first Home browser review

Owner: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41), Draft
[PR #68](https://github.com/oborskyivitalii/oborskyivitalii/pull/68). This is delegated
execution QA/self-verification for the author-first amendment. Historical browser
records and captures remain unchanged; independent review and current-head CI are
separate.

The ordinary canonical build was copied with `tools/quality/artifact.cjs` and
derived with the existing `tools/staging/color.cjs` producer. No review overlay,
alternate active HTML, publishing pipeline or runtime/design change was introduced.

| Binding                                  | Observed value                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Prepared Git commit / tree               | `e9d273af872e442785a9f183cf23fc31bc877d52` / `cccde540d66e5ef18312f9dc138452ff600b3c8b`; source dirty |
| Base public artifact digest              | `1d3a577038ec1f5713275d72e10ffddf60902d176fa57f4eea05097c4509fc0b`                                    |
| Tested ordinary Color artifact digest    | `970bbcb8a97758b3df2b750c00c79773230fb3aef5eb2983e7da8b43e841c503`                                    |
| Color engine identity                    | `9fd66a22f26b9cb487179db4d38812a1c03627d436506422cd0987cfdd8509c8`                                    |
| Exact assembled Color `space.js` SHA-256 | `443c932e6991cad9027f59b03a69e310765c4c0dd515b57ba1a57889f8b0e864`                                    |

The [raw record](author-first-captures/browser-observations.json) binds exact
authored/public hashes and contains all four layouts, typography, section text,
links, bottom/camera observations and maintained smoke results. Twelve served
public files passed response-byte verification; the complete artifact passed its
canonical verifier before and after observation. Templates, Home metadata,
Home/Research response sources, styles, navigation, camera lifecycle and the preview
helper matched the prepared commit. Dirty preparation is not a final committed CI
identity.

Pinned Playwright 1.63.0 used the previously recovered local Chromium 138.0.7204.0
with the repository's standard two launch arguments. Pinned CI Chromium 153 is a
different browser environment. Setup used `npm ci --prefix tools/quality/toolchain
--ignore-scripts`; canonical artifacts used `node tools/quality/artifact.cjs build
OUT` followed by `node tools/staging/color.cjs OUT`. Scratch orchestration reused
the existing `ready`, `verifyResponse` and normal desktop `scenario` helpers from
`tools/quality/local-browser.cjs`, without changing their assertions or profiles.
These are real loopback observations, not hosted CI, a physical-device review or
performance measurements.

All four Home layouts passed: 1440 × 900 and 390 × 844, each in Day and Night.
The problem-led headline, author/enterprise-leadership identity, contribution
domains and broader Contact invitation are readable at their existing sizes.
Hero body remains 16 px; contribution/public-response bodies and Contact remain
15 px, with existing smaller auxiliary/byline/output styles. No horizontal page
overflow, paragraph text clipping, line clamp, inner scrolling or empty cards
appeared. Sections grow naturally on mobile. Both themes reached the actual native
bottom: 5222 CSS px desktop and 9575 CSS px mobile.

All 45 Home anchor destinations and their order remain exact against the prepared
Home. Booking stays `https://calendar.app.google/zy9rAnUcoWygSdxH7`, email stays
`mailto:oborskyivitalii@gmail.com`, and LinkedIn stays
`https://www.linkedin.com/in/vitaliioborskyi/`. Fragment targets remain present;
the maintained smoke verified response-source navigation, routes and history.

Option A remains appropriate in this execution review: actual rendered order is
Hero → contribution → Research → Writing → public responses → About → Contact.
Responses follow the research/publications, and About separates them from Contact.
The unchanged three-record response section retains its ordinary “Arkadiy Dobkin
· EPAM founder” byline, topic heading and one explicit section disclaimer denying
website/programme/services endorsement and explaining affiliation identification.
This is a layout/editorial assessment, not personal permission or human acceptance.

The unchanged maintained normal desktop smoke passed all five routes. Separate
native-scroll observations kept the exact settled camera on Home, Research,
Writing, Talks and Credits; the Writing topic control also kept its camera fixed.
Home → Research recorded 38 `flying` samples among 40 existing scene DOM mutations,
minimum content opacity 0 and non-`none` transforms. This confirms retained route
flight/fade/content movement without a new performance diagnostic.

Sixteen lossless WebP section captures total 1541576 bytes. Each is an unmodified
browser full-page screenshot cropped to the measured section bounds. Representative
mobile Hero/contribution/Contact and desktop responses were inspected at native
width by this delegated execution agent. Crops document content layout, not motion.

| Section                | Desktop Day / Night                                                                                                                       | Mobile Day / Night                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Hero                   | [Day](author-first-captures/index-day-1440-hero.webp) · [Night](author-first-captures/index-night-1440-hero.webp)                         | [Day](author-first-captures/index-day-390-hero.webp) · [Night](author-first-captures/index-night-390-hero.webp)                         |
| Contribution (`#help`) | [Day](author-first-captures/index-day-1440-help.webp) · [Night](author-first-captures/index-night-1440-help.webp)                         | [Day](author-first-captures/index-day-390-help.webp) · [Night](author-first-captures/index-night-390-help.webp)                         |
| Public responses       | [Day](author-first-captures/index-day-1440-acknowledgements.webp) · [Night](author-first-captures/index-night-1440-acknowledgements.webp) | [Day](author-first-captures/index-day-390-acknowledgements.webp) · [Night](author-first-captures/index-night-390-acknowledgements.webp) |
| Contact                | [Day](author-first-captures/index-day-1440-contact.webp) · [Night](author-first-captures/index-night-1440-contact.webp)                   | [Day](author-first-captures/index-day-390-contact.webp) · [Night](author-first-captures/index-night-390-contact.webp)                   |

This supports the focused rendered conditions of AP07–AP09 and the retained
camera/navigation decision. The owning flow evaluates final checkboxes, independent
review, exact PR/CI linkage and the hosted preview. No merge, production activation,
new rights or third-party website approval is asserted.
