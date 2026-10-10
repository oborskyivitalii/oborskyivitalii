# Issue 41 — 2026-10-09 site-case browser review

Owning issue: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Owning PR: [#67](https://github.com/oborskyivitalii/oborskyivitalii/pull/67).
Reviewer: delegated browser reviewer, `/root/positioning_visual`.
Status: **focused desktop/mobile reading and link review complete; viewport limits recorded**.

## Intent and acceptance

Inspect the same-issue continuation: a short Home About link to the existing
Credits page's `#built-with-ai` anchor and four compact technical examples.
Verify new-block reading, actual About-to-Credits navigation, evidence destinations
and the existing Credits contact path. AC17–AC25 source/editorial acceptance remains
separate from these browser observations; rendered copy cannot prove a technical claim.

## Inspected source and limits

Inspected <https://32a36a7b.oborskyi-author-ci-staging.pages.dev/>. The root agent
verified its deployment/package records against source
`bcab6a5b59806c7073f5d680fc36e611a704a5c6`, tree
`261d08c2a48b27160febd731a01b817926511ce8`, hosted Color public digest
`571b95fefe48b84a3dd3b81e0d00174a750f70c6b765cbaaa3a948a2c5c1fa88`
and package digest `b57082535a40f42ba6cdfb4fde30025ea8c3c868a009960f61014554a3c4d375`.
This reviewer directly observed the matching loaded Color engine
`a2e20893134e76f273b5eb80699bd22652c5381b3490a7c654d34d9c9458e4d3`.
Earlier previews are not evidence for this extension. This is an immutable PR
preview, not stable staging, merged-source or production acceptance.

Cloud Chrome's actual viewport was **1363 × 936 CSS pixels**. Its JPEG viewport
captures are 1348 × 926 pixels. Existing theme controls produced observed Day and
Night views. HYPD's Day mobile preset returned **739 × 1600 pixel** viewport JPEGs;
its CSS viewport/DPR were not exposed. Initial ordinary-anchor captures did not
reach the new copy, and its whole-page JPEG was only **132 × 1600** pixels, including
at original image detail. Those initial views were insufficient for full body-text
reading. Native Chrome text-fragment URLs subsequently exposed the requested copy
at readable viewport size; the observations below distinguish the root agent's
first capture from this reviewer's independent captures. The purple text-fragment
highlight is browser selection evidence, not a site style change. No browser
download or full/native/physical-device regression was attempted.
One documented Chrome zoom shortcut left the CSS viewport unchanged; default zoom
was restored. This browser did not supply a narrow zoom-emulated reading view.

## Findings

| ID | Evidence | Finding / implication | Disposition |
| --- | --- | --- | --- |
| F01 | Home About desktop Day screenshot | One compact build sentence/link fits the existing About block; no new large section or visual layout. | Passed observed reading |
| F02 | Actual About link click | Reached `credits.html#built-with-ai`; heading top 97.05 CSS pixels is below the 81-pixel header. No desktop horizontal overflow. | Passed navigation |
| F03 | Credits Day/Night screenshots and scrolling | All introduction, four technical examples, final enterprise/research boundary and existing corrections/contact remain legible; link labels wrap within the reading column. | Passed desktop reading |
| F04 | Rendered evidence destinations | Seven destinations retain five immutable 338e3ff file/line links and PR66 / PR63. Browser inspection verified hrefs, not the truth of their claims. | Passed destination inspection; source review separate |
| F05 | Credits contact/footer | Existing issue/LinkedIn correction links remain; actual footer Contact click reaches Home `/#contact`, showing existing booking/email/LinkedIn paths. No external booking or communication submitted. | Passed contact navigation |
| F06 | HYPD Day mobile preset, native text-fragment viewport captures | Complete Home build sentence/link, four technical examples and final boundary are readable within the narrow column. The root agent read the heading and both introductory paragraphs; this reviewer independently read all four examples, all seven proof labels, complete final boundary and the visible start of corrections/contact. No clipped new text or link label was observed. | Passed focused mobile reading; exact CSS dimensions and mobile Night remain unobserved |

### Mobile capture observations

All captures below use the same immutable preview, Day mobile preset and
`fullPage:false`, returning 739 × 1600 JPEGs. These native URL fragments scroll and
highlight existing text; they do not change the page's DOM, styles or runtime.

| Requested text fragment | Actual visible reading | Observer / transient capture |
| --- | --- | --- |
| `/credits#built-with-ai:~:text=Built%20through%20AI-assisted%20delivery` | Heading, both complete introductory paragraphs, complete architecture/fallback example and both proof links. | Root agent's directly observed tool image; not saved in this reviewer's inventory |
| `/credits#built-with-ai:~:text=Changes%20and%20acceptance.` | Complete architecture/fallback and changes/acceptance examples, including four proof labels. | This reviewer; `issue41-sitecase-mobile-acceptance-text.jpg` |
| `/credits#built-with-ai:~:text=Checks%20and%20releases.` | Complete changes/acceptance and checks/releases examples, including their proof labels. | This reviewer; `issue41-sitecase-mobile-checks-text.jpg` |
| `/credits#built-with-ai:~:text=A%20visual%20tradeoff.` | Complete checks/releases and visual-tradeoff examples; final boundary starts but continues below viewport. | This reviewer; `issue41-sitecase-mobile-tradeoff-text.jpg` |
| `/credits#built-with-ai:~:text=This%20is%20a%20personal%20engineering%20example` | Complete visual-tradeoff example and final enterprise/UA/research boundary; Corrections and contact heading, issue link and beginning of LinkedIn sentence below. | This reviewer; `issue41-sitecase-mobile-boundary-text.jpg` |
| `/#about:~:text=This%20site%20is%20also%20a%20practical%20example` | Complete new About sentence and About the build link, with existing social links below. | This reviewer; `issue41-sitecase-mobile-about-text.jpg` |

## Decisions and execution

Continue within issue41 and PR67; only this review artifact changed. No public
source, style, runtime, route, test infrastructure or GitHub record was edited.
Independent technical/source review remains in [the site-case record](2026-10-09-sitecase.md).

| Task | Observation | Status |
| --- | --- | --- |
| T01 | Read complete new block on desktop Day/Night; combine root heading/intro observation with independent mobile viewport reading of Home sentence, four examples and final boundary. | Focused reading complete; viewport limits above |
| T02 | Click Home About → Credits anchor and Credits footer → Home contact; inspect seven evidence hrefs. | Complete |
| T03 | Record exact source/digests and transient screenshots. | Complete |

## Acceptance evidence

| Scope | Check | Result | Remaining gate |
| --- | --- | --- | --- |
| AC23/24 focused Home/link observation | New About sentence stays compact; existing utility route/anchor works. | Passed observation | Whole source/style acceptance remains separate |
| AC21 focused destination observation | Seven public evidence hrefs inspected; no private evidence endpoint. | Passed observation | Technical authenticity is source-review evidence |
| AC25 focused reading/contact observation | Desktop complete block Day/Night and actual contact paths; Day mobile text-fragment captures cover the complete new copy with observer attribution above. | Focused desktop/mobile reading and link paths passed | No exact 1440/390 manual matrix, mobile Night or physical-device claim |
| AC25 normal hosted automation | Root agent verified [preview run 37956804978](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37956804978) PASS at 1440/390 with normal/no-Canvas cases, bound to the source/public identity above; acceptance 37956804047, navigation 37956804153 and Basic 37956805288 also passed. | Pipeline passed, distinct from manual reading | Any successor needs its own CI/source reconciliation |

Screenshot inventory with dimensions/SHA256 is transiently retained in
`/tmp/issue41-sitecase-browser-captures.json`. Basenames include
`issue41-sitecase-about-day-desktop.jpg`, `issue41-sitecase-credits-day-desktop.jpg`,
`issue41-sitecase-credits-night-desktop.jpg`, `issue41-sitecase-case-night-lower-desktop.jpg`,
`issue41-sitecase-contact-night-desktop.jpg`, the three initial limited mobile
captures and five independent native text-fragment mobile viewport captures above.
Screenshots are not committed. No full performance/browser campaign, physical
device, full original BROWSER gate or release acceptance is claimed.

## Issue synopsis

The new immutable preview's complete site-case text was read on desktop Day/Night.
Day mobile viewport captures now cover the complete new copy, using the root
agent's heading/intro observation and this reviewer's independent paragraph views.
Home About → Credits anchor and Credits → existing Home contact worked. Evidence
destinations remained public and source-pinned. No focused reading/link blocker was
observed. The mobile preset's CSS dimensions are unknown; exact 390 CI layout is
separate evidence. The original issue's broader BROWSER gate remains partial.
