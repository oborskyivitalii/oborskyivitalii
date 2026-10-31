# Exploratory / Interaction QA — issue169 R3

Verdict: the composed five-page PDF is suitable to show for author review. No PDF reading/layout blocker was found. HTML mobile preview has a source-confirmed defect, and actual browser interaction remains environment-blocked. This is not publication, repository/native admission, or full AC08/09/10 acceptance.

## Independence and exact scope

Distinct nonauthor reviewer `/root/exploratory_r3`, first judgment. The parent supplied explicit none-fork acceptance; the actual launch tool receipt remains the orchestrator’s responsibility. No author conversation, global memory or current peer verdict was read. Provider model/context internals are unknown. Shared filesystem is not a security sandbox. Read-only candidate inspection; only this report and assigned raw evidence were written. No tests, candidate edits, external writes or delegation.

Owner: issue169 / PR170. Current author scope requires selectively expanding useful supplied-infographic fragments and showing article/PDF before proceeding with publication. Original issue AC07–09 concern coherent source, readable figures, matching 3–5-page PDF/copies; AC10 native related reading and AC11 author approval remain outside this bounded prepared subset.

Prepared subset base packet: `eb20f9cf216740d55f69f5f81c4c092ddb34664018d38cb69e351ac05b8f070b`. Candidate-manifest file SHA256: `abbabf5c0ab41126d5920ec45fa035d445a2444e2a821e6077dc61032c8ce73e`. Every listed path/byte count/hash matched when inspected. This is not a clean Git checkout; native site integration/diff and production are not supplied proof. Original issue, scope, infographic, prompt and independently derived R2→R3 manuscript-diff identities are retained in `exploratory-r3-evidence/receipt-identities.json`.

Common prompt SHA256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt SHA256: `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`. Read AGENTS, CONTRIBUTING, reviewer common/role instructions, repository README, relevant check-allocation contract, original issue and author scope. Did not read MEMORY because clean-context reviewer instructions prohibit unrelated memory. PDF render-and-inspect skill used. Managed-runtime status tool was not exposed; no network work occurred.

## Charter, execution and result

Independent charter designed before observation: within roughly eight minutes, read every full PDF page; check the infographic-to-article journey and meaningful diagram relationships; examine desktop and phone article/copy-ready HTML, assets, links, keyboard focus and figure readability. Planned partitions: five PDF pages, three HTML routes at 1440×1000 desktop and 390×844 mobile emulation, five figure detail views. Missing device or browser observations cannot count as passes.

| Action / independent oracle | Expected | Actual result / raw evidence |
| --- | --- | --- |
| Verify candidate bytes against supplied manifest | Inspected bytes match packet | Pass, no mismatches; `pdf-inspection.json` |
| Render entire actual PDF at 1.5× with PyMuPDF and visually read pages 1–5 | 3–5 pages, coherent flow, no clipping/overlap; text/figure/caption readable at A4 | Pass: five A4 pages; `pdf-page-1.png` through `pdf-page-5.png`. Page 1 graph at opening; page 2 system map; page 3 review functions; page 4 overload and ownership; page 5 response, sources, author footer. All inspected in full. |
| Follow explanatory sequence against supplied infographic and actual R2→R3 manuscript diff | Useful fragments integrated near their discussion; system/workstream distinction; no measured graph or exponential-cost claim introduced | Pass within reading scope. Lifecycle asymmetry and response loop expand the article; system supports stay separate from visible steps. Figure 1 explicitly says illustrative/no measured values; figure 3 distinguishes study functions from synthesis; figure 4 is conditional. Original infographic is not pasted wholesale. |
| Inspect PDF reference/author destinations | Preserved useful URI annotations | Pass structurally: 15 URI link annotations, 10 unique targets, matching evidence/related-work/author links; `pdf-inspection.json`, `static-navigation.json`. Click dispatch and remote destination availability unobserved. |
| Launch supplied pinned Chromium for actual HTML reading/focus/navigation | Browser opens local candidate, then 6 route/viewport observations | Blocked before page creation: process-singleton socket creation denied, SIGABRT. No HTML screenshots, focus, interactions or viewport measurements were produced. Preserved excerpt in `blocked-browser-and-diagnostics.txt`; no unchanged retry or bypass. |
| Static HTML closure on article + LinkedIn + Medium source files | Six images per file resolve, alt descriptions and intended links present | Pass structurally: 18/18 image paths exist with alt text, reference links present. Three HTML files omit viewport metadata (finding EX-R3-01). `static-navigation.json` |

The PDF has useful selectable body/reference text (page word counts 324, 203, 261, 377, 396); illustration text is rasterized, so this does not establish tagged-PDF or screen-reader accessibility. At full-page A4 render the main body, figures and references are legible; page 2/3 have unused lower space but no broken reading order or lost content. Phone readability of the PDF and actual desktop/mobile HTML are unobserved.

## Finding EX-R3-01 — medium: missing mobile viewport in HTML review/copy surfaces

Locations: `r3/article.review.html:1`, `r3/platforms/linkedin-copy-ready.html:1`, `r3/platforms/medium-copy-ready.html:1`. Each declares UTF-8 but lacks `meta name="viewport"`. This is directly confirmed from actual source bytes. On mobile browsers that use a wider default layout viewport, a max-width desktop page is scaled down instead of laying out at the device width; the already dense seven-step/four-column figure labels become harder to read. That effect is a source-based prediction, not an observed mobile screenshot.

Affected scope: author opening the HTML on a phone; AC08 readable mobile rendition / AC09 review delivery. Proposed treatment: add the standard device-width viewport to the HTML owners/derivation, then conduct a bounded phone reading of every diagram. Give figures an enlargement route if their labels remain too small. PDF delivery can still be shown now; do not claim mobile HTML approval from this review.

## Neutral delivery addendum, after first judgment

The parent supplied a deterministic delivery addendum after my first PDF/static assessment, without peer verdicts. Packet `5a3fa3e26a2bc6f9c8beafbff616182bbc7cd5b3b7c74efb720db1cf2e36d2d0`; all listed path/byte/hash checks matched. The delivery PDF hash equals the inspected base PDF: `1ab2cc7cd029647b723239218ebbfe307e7225fdf76b6a8249f034998d5ebcf0`; unchanged PDF visual evidence reused. `delivery-inspection.json` records three self-contained HTML derivatives, each with six embedded PNGs and alt descriptions. They retain the missing viewport metadata, so EX-R3-01 also applies to `delivery/The_SDLC_Is_Out_of_Balance_R3.html`, `delivery/linkedin-copy-ready-R3.html`, and `delivery/medium-copy-ready-R3.html`, each at line 1.

Read `delivery/COPY-INSTRUCTIONS.md`: instructions identify full article copies, preserve image order/captions/references/footer, explicitly require manual PNG upload when native editors drop pasted images, and defer canonical URL until verified site publication. They accurately mark native editor previews/published rendering unobserved. Native-editor login is unnecessary for this draft-copy review; no paste fidelity or native editor acceptance is claimed.

## Regression allocation and limits

| Risk / scenario / oracle | Disposition and owner | Route / actual status |
| --- | --- | --- |
| EX-R3-01: open standalone article and both copies at phone width; body lays out at device width and every diagram can be read/enlarged | Proposed bounded author-review browser check owned by issue169 preparation; add viewport-presence assertion to existing derivative build validation if appropriate | Manual/diagnostic only; no new suite or workflow implemented. Dynamic check blocked in this execution; must be observed on the corrected exact derivative before mobile claim. |
| AC08/09: all PDF pages keep diagram/caption/section flow and 5-page ceiling after any content/layout change | Retain manual visual evidence; issue169 editorial/PDF owner | Executed on exact R3 PDF; any changed PDF requires render/read again. No workflow claim. |
| AC09: all self-contained copy assets survive local open and native editor upload/caption placement | Static closure retained; native platform preview remains author/editor owner | Static paths/embeds observed; browser local open and native editor paste/upload not observed. No platform publication authorized. |

No native website/tag/related-reading component, no-JS profile, live site, CI, physical devices, PDF viewer interaction, external destination fetch, actual LinkedIn/Medium editor or production acceptance was observed. The browser is a local diagnostic, not native supply admission or device proof. The startup failure is environmental evidence, not a product defect. PDF annotation inspection is not actual clicking. Proposed checks are not executed checks. Publication remains paused for author review.


## Correction review — final packet 74e4d506, source fix verified

This is a targeted continuation of the same reviewer, after neutral correction instructions from the parent; it is not a new fresh-context review. The entire first judgment, EX-R3-01 finding, initial packet identities and browser failure above remain preserved. No peer verdicts were supplied. Bound: five minutes; candidate remained read-only. No browser launch was retried, and no implementation/delegation/external write occurred.

Current corrected packet: `74e4d506e370f712e17ececb5593a093acb99abdcc3c1800a0cbe80809d47630`, supplied by `r3/candidate-manifest-corrected.json`. Independently recomputed the documented canonical files-array digest and checked every listed byte count and SHA256: all match. Current PDF: 5 pages, 1,981,992 bytes, SHA256 `70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c`. Delivery PDF has the same listed identity. This supersedes earlier source identities for the corrected artifacts; original observations remain historical evidence.

| Correction journey / oracle | Action and observed result | Disposition |
| --- | --- | --- |
| EX-R3-01: HTML declares device-width viewport | Parsed producer/base, two base copy-ready files and three self-contained derivatives. All six now have exactly one `width=device-width, initial-scale=1` viewport declaration. Producer templates emit it. | **Source defect fixed.** Dynamic mobile readability remains unobserved. |
| Narrow article source stays readable without desktop layout scaling | Inspected source CSS: article review and standalone article derivative include screen max-width 640px rule with 16px body/overload/last text, 18px body padding, 13px references, reset figure margins and uncropped hero. The simpler copy-ready editions use their existing fluid max-width body, 18px text and responsive images, with the new viewport. | Source change verified; no screenshot or mobile behavior pass claimed. |
| PDF page 1 retains opening flow after restoring hero caption | Re-rendered actual corrected PDF at 1.5× and read full page. Caption is visible below hero; title, body, illustrative graph and its caveat/caption remain separated and within page boundaries. | Pass in composed A4 reading scope; `corrected-pdf-page-1.png`. |
| PDF page 4 keeps consequences text inside its three cards | Re-rendered and read full page. People, Product and Business text wraps in taller cards without running over card boundaries; loop arrows, risk/caption context and subsequent ownership section remain legible and non-overlapping. | Pass in composed A4 reading scope; `corrected-pdf-page-4.png`. |
| Unaffected PDF pages retain prior inspected content/layout | Re-rendered pages 2, 3 and 5 using the same 1.5× PyMuPDF matrix; compared RGB dimensions and every pixel with retained initial renders. All three pixel-identical. Also inspected current five-page montage for pagination continuity. | Prior full-page reading reused only for these demonstrably unchanged pages; `correction-pixel-comparison.json`. |
| Portable Markdown copy can resolve illustrations and transfer alt text | All three delivery article Markdown copies use six `images/*.png` paths, all resolve. Read corrected copy instructions and six-entry ALT-TEXT-AND-CAPTIONS: manual native-editor image upload, matching caption, transfer alt text where supported and preview verification are explicit. All six HTML routes retain six images, alt descriptions and visible figcaption elements; static paths/embedded assets present. | Static closure pass; native editor import/upload/paste/alt behavior remains unobserved. |

Raw correction observations: `exploratory-r3-evidence/correction-inspection.json`; page renders and pixel comparison named above. Fonts/inputs appear in the corrected manifest and their listed bytes/hashes were checked; no independent font-reproducibility or build campaign is claimed.

Current verdict: **no remaining observed/source-confirmed blocker to showing the corrected article/PDF for author review**. EX-R3-01’s missing-viewport source condition is resolved on this exact packet. Its proposed phone/browser reading regression remains pending because Chromium’s previously preserved socket-permission failure still prevents actual interaction. Source inspection cannot establish minimum figure-label readability on a phone, keyboard focus, link dispatch, native platform paste/rendering, physical device, live site or native acceptance. No such gate is waived; author review and publication decisions remain pending.
