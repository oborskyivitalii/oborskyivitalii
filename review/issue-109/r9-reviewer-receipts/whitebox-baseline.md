# R9 white-box QA: initial design and R8 baseline

Date: 2 November 2026. Owner: issue 109 / Draft PR 110. Reviewer task: `/root/r9_whitebox_review`. Phase: initial independent preparation, before receipt of an R9 candidate.

## Conclusion and review boundary

The exact supplied R8 PPTX is a usable structural baseline. It contains nine visible presentation entries, nine correctly associated native note parts, editable shape-based content, two image assets, and three external closing-slide hyperlinks. Its ZIP integrity and internal relationship targets pass the bounded read-only inspections described below. All nine Markdown note sections match their attached native note paragraphs after excluding Markdown headings and blank separators.

**This is a QA design and baseline, not acceptance of R9.** No R9 candidate, actual diff, matching final PDF, or final renders were supplied to this execution. R8 visual quality, a successful final export, projector readability, and author acceptance are not inferred from package structure.

Only the supplied input packet, its R8 sources, necessary repository instructions, and the three named presentation helpers were inspected. No current peer reviews, parent scratch author drafts, private conversation, or repository MEMORY were read. Historical review statements inside the issue snapshot and edition metadata were treated as claims about prior work, not evidence of current acceptance. No implementation, regression test, external write, or delegation was performed. The only written artifact is this receipt.

The orchestrator owns the actual `fork_turns="none"` launch receipt. The reviewer cannot independently observe the invocation parameters, accepted provider context, model, or memory internals. The review therefore does not attest to those facts. This is a **prepared subset, not a clean Git checkout**, nominally sourced at `9330c424b2dd66177de9e5e50db5f132b2c57001`.

## Source identity

The preflight manifest has SHA-256 `7ef6cf35f2c2ea084158a5b7d024f18dea722c533777c8935496d0be6e920d74`. All ten listed file byte counts and SHA-256 values were recomputed and match it. The following supplemental sources were also hashed; they should be included in a complete final review packet.

| Source | Observed SHA-256 |
| --- | --- |
| `agents/reviewers/README.md` | `11370925623aae0243944cbfa4b59244d0b081149ff15709cf2abe2c586b360b` |
| `agents/reviewers/white-box-qa.md` | `f94b25874b248be9d340ef2ad3c9c778a1127eefce1b772cf1de500494bc9baf` |
| `AGENTS.md` | `2985c29e16043d810e5efa9184b2f2ecbc467ef0024a2fcbaf64fbc82a16e3dd` |
| `CONTRIBUTING.md` | `cdf4f04358192b2c562d0e15aa34af86f03278d0c417c032df21633a8e3878d4` |
| R8 PPTX | `ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe` |
| R8 `edition.json` | `b32911e6986370d77fe12662495d431f745f560973c91dbc7bf0758ddc470ede` |
| Prepared R8 `speaker-notes.md` | `cc9c3cece8830dcbf9d66dfdeac79a85980a02037e742aac943656fe3c1362a2` |
| `tools/presentations/integrate_native_slide.py` | `f33c7055b033832cbea66d233afa4a31474bf24db91d27e08171848eee37030b` |
| `tools/presentations/reorder_native_slides.py` | `87a53fa03c255293d68fee14a73967aeb516102fcfb6e830e470a7e67f33593b` |
| `tools/presentations/validate_edition.py` | `ed15d0531d760095b77f979e4498bda8799a673f9af34d7fa9d02a84634e9fad` |
| R8 `README.md` | `55eed7d6047c50438b81e751d88385cba45dc659ec975b47fededbd05cde0913` |

Relevant authoritative inputs are `r9-input/request.md`, the current AC01–AC19 section of `r9-input/issue-109-snapshot.md`, and `guides/PRESENTATION-VERSIONING.md`. The request authorizes whole-deck visual alignment and clearer architecture/runtime organization while retaining substantive breadth. Stable AC18 follows architecture to delivery 07; AC17 follows runtime to delivery 08. Older two-slide-only limits are superseded for layout, while scientific meaning, history, rights, and nine-slide scope remain.

The prepared subset contains no additional scoped `AGENTS.md`. `guides/SITE-CHECK-PROFILES.md` and `.github/acceptance/issue-109.json` are absent. Consequently this execution cannot verify the live hosted-profile or acceptance-policy mapping. Their absence is an evidence limit, not a passing or inapplicable result.

## Executed baseline observations

The observations below came from direct `zipfile` / ElementTree / SHA-256 reads, independently of the helpers under review. The helpers were read as source, not executed to modify a package. These are source inspections, not measured branch coverage or an implemented test suite.

| Property | Observed R8 baseline |
| --- | --- |
| PPTX identity | 1,426,852 bytes; exact supplied SHA-256 matches edition metadata |
| ZIP inventory | 58 unique members; zero duplicate names; `testzip()` returned `None` |
| Relationships | 23 relationship parts; zero missing internal targets |
| Canvas | 12,192,000 × 6,858,000 EMU, equivalent to 13⅓ × 7½ inches |
| Presentation order | `slide1, slide2, slide4, slide3, slide5, slide6, slide7, slide8, slide9` |
| Visibility | All nine slide roots have the default visible state |
| Notes | Each slide has exactly one notes relationship; each note links back to that same slide |
| Native versus Markdown notes | 9/9 equal nonempty paragraph sequences in delivery order; paragraph counts 22, 17, 26, 17, 23, 16, 23, 26, 25 |
| Native content | 469 `p:sp` shapes, 9 native connectors on source slide 8, and 2 pictures; no group, table, chart-frame, or full-slide raster replacement was found |
| Fonts | All explicit Latin font declarations in slide XML are Arial |
| Geometry | No explicit shape/picture/connector bounding rectangle has a negative coordinate/extent or exceeds the canvas; no rotation was present. This does not establish text fit, absence of occlusion, or legibility |
| Source slide 7 | 64 native shapes; 42 nonempty text shapes; title at x 0.72, y 0.51 inches; several supporting labels use explicit 9.5–11 pt settings |
| Source slide 8 | 40 native shapes plus 9 connectors; 30 nonempty text shapes; title at x 0.72, y 0.51 inches; component body settings are 15.5 pt, with smaller metadata/footer text |

The package contains these media assets:

| Asset | Bytes | SHA-256 |
| --- | --- | --- |
| `ppt/media/image.png` — opening artwork | 1,322,103 | `fee952d5eb696de3cdcd4609b42587545a56330577acdca8359b76a4d4b22de7` |
| `ppt/media/image2.png` — closing QR asset | 4,422 | `a41f34f3039f8b4673b0f62ecf08c315ebe0ad0f55bcec5b8b8b3544ead8c38e` |

All three external relationships belong to `ppt/slides/_rels/slide9.xml.rels`:

- `https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis`
- `https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture`
- `https://vitaliioborskyi.ai/`

The closing QR picture has an aspect-ratio lock, equal x/y extents of 2,441,448 EMU (approximately 2.67 inches), and a click relationship to the homepage. Its corresponding visible text is `https://vitaliioborskyi.ai/`. This execution checked identity and relationship binding, **not QR decoding**. Available baseline Python did not contain cv2, zxingcpp, or pyzbar. A decoder and the final rendered page remain needed for the final QR check.

### Input discrepancy: prepared notes copy

**WB-B01 — Low severity, provenance/validation limitation.** R8 `edition.json` declares notes of 36,919 bytes with SHA-256 `192dab4a1c2e61508db53fd00cd8b019bdefc9b9d47c68b132c66a08ec9eaa17`. The supplied prepared copy is 36,920 bytes with SHA-256 `cc9c3cece8830dcbf9d66dfdeac79a85980a02037e742aac943656fe3c1362a2`. Removing exactly its final LF in memory reproduces the declared edition hash. Thus the discrepancy is precisely one terminal newline, with no observed note-content difference. The R8 PDF named by the manifest is absent.

Protected requirement: AC02/AC04 provenance and exact artifact identity. Treatment: retain this distinction in source receipts; do not claim the prepared Markdown file is byte-identical to the retained original or use an expected failure of the incomplete R8 package as evidence against R9. Generate and hash R9's own synchronized note export. Do not overwrite historical R8 to conceal the prepared-copy difference.

## Structural risks identified in the actual implementation

### Reordering does not synchronize every delivery reference

`reorder_native_slides.py` resolves the presentation list through relationships, checks a pinned complete permutation, and preserves all relationship parts. For each moved slide it updates one identified footer and one exact `R13 STAGE SCRIPT | SLIDE NN |` token (lines 110–128). It does not update Markdown, edition mappings, other note labels, or narrative transitions.

**WB-B02 — Medium integration risk, not an observed R9 defect.** R8 runtime notes contain `R8 DELIVERY ADDENDUM — SLIDE 07` (`speaker-notes.md` line 272). Architecture notes contain `Transition to S09` in the expanded source-qualification paragraph (line 311). A mechanical 7/8 reorder would leave the former attached to delivery 08 and the latter describing architecture-to-closing adjacency although delivery 08 now intervenes. Correct forward and reverse note relationships alone would not detect either defect.

Protected requirement: AC01/AC03/AC17/AC18 synchronized delivery narration. Minimal treatment: independently read the complete delivered 06→07→08→09 note sequence and inspect every delivery-position label. Preserve source-section identity explicitly when a historical label is retained. Keep historical standalone R13 intact while making current delivery guidance unambiguous.

Expected R9 permutation relative to **R8 delivery positions** is `1,2,3,4,5,6,8,7,9`. Relative to the existing **R6/source-part positions**, it is `1,2,4,3,5,6,8,7,9`. Confusing these two coordinate systems would undo the earlier evidence/ownership exchange.

### Native grafting deliberately has a limited dependency surface

`integrate_native_slide.py` requires exactly `slideLayout` and `notesSlide` dependencies on both selected slides, exactly `slide` and `notesMaster` on notes, and no relationship attributes embedded in the replaced payloads (lines 98–120). It refuses external links, images, charts, and other new dependencies, verifies compatible masters/themes, and requires the entire source note text as a prefix (lines 132–169). Output preservation checks cover member inventory, replacement bytes, and immutable inputs (lines 173–210).

**WB-B03 — Medium integration risk.** The current source's opening and closing slides contain picture dependencies; closing also has external hyperlinks. They are outside this graft helper's admitted slide surface. A successful graft of 7/8 supplies no evidence for whole-deck polish affecting 1/9. Moreover, an append-only note guard can preserve obsolete delivery references just as faithfully as accurate ones.

Protected requirement: AC02/AC07/AC09/AC11/AC19 native editability, artwork, note, and link preservation. Treatment: inspect the final package independently, including all unchanged dependencies and all actually changed slide payloads. Do not broaden a helper or ignore a refusal solely to obtain a green result. This baseline proposes no helper implementation change.

### Edition validation is an identity check, not a semantic or export oracle

`validate_edition.py` counts ZIP members matching slide/note filenames (lines 110–130), rather than traversing visible presentation entries and note relationships. It counts raw `/Type /Page` tokens in PDF bytes (lines 34–37). Its hashes bind files to manifest claims but do not establish that the PDF was exported from the stated PPTX.

**WB-B04 — Coverage limit.** A package with the right part counts but wrong delivery order, misattached notes, clipped text, broken QR/link behavior, flattened content, or a stale nine-page PDF can satisfy those checks if the manifest describes those bytes. The validator is still useful for the final identity gate; it must be supplemented by the smallest checks below. No validator bug fix or expanded test programme is proposed for this slide-edit task.

## Minimal independent R9 oracle matrix

All cases are proposed final checks, not already executed outcomes. They reuse the existing validator and bounded source/manual checks. In the missing `SITE-CHECK-PROFILES` mapping, the explicit owner is issue 109's final presentation review; no hosted job or CI pass is invented.

| Case / risk / AC | Structural fault and scenario | Independent oracle | Smallest useful check / allocation |
| --- | --- | --- | --- |
| WB01 — order and attachment; AC01/17/18 | Swap wrong coordinates; presentation entries point to wrong or hidden slides; notes stay with old numeric position | Architecture is delivery 07, runtime 08; ownership remains 03 and evidence 04; nine unique visible entries; each slide→note→slide round trip agrees | One direct final ZIP/XML traversal in presentation order, resolving relationships rather than sorting filenames; independent white-box review |
| WB02 — current note synchronization; AC01/03/17/18 | A correct relationship graph still carries stale labels or old transition prose | Native paragraphs and Markdown match by delivered subject; headers/footers/addenda agree with delivery position; 06→07→08→09 reads coherently; source R13 section identities remain explicit | One paragraph-sequence comparison plus retained manual reading of the four affected note sections; do not accept a count-only or prefix-only assertion |
| WB03 — retained breadth and limits; AC13/14/16/17/18 | Simplification deletes scientific qualifiers or key control obligations | Architecture shows sensors, controller, actuators, controlled system, outcome feedback, pre-consequence constraints, conditional human dependency, business-case/full-cost assessment, bounded discovery/narrow/redesign/no-go. Runtime retains invented 196/3/1, forbidden-outcome veto, safe-only exposure, changing conditions without app SHA change, service/behavior/control/people observation, qualified response capacity, tested fallback and stop | Source-to-candidate semantic comparison of 7/8, visible text plus notes; verify evidence-slide qualifiers and other scientific text were retained during layout edits; independent review against issue/request, not author's summary |
| WB04 — preservation and editability; AC02/09/11/19 | Whole-slide rasterization, lost artwork, removed dependencies, or mutated predecessor | Native text and diagrams remain editable; original artwork and QR bytes survive; no unexplained master/theme/media/relationship changes; exact R8 PPTX remains unchanged | One ZIP payload diff against pinned R8 plus object-type inventory; shape counts may change with authorized reorganization and are not a golden equality oracle |
| WB05 — geometry and legibility; AC03 | Within-canvas boxes still overlap, clip text, obscure arrows, or shrink caveats beyond use | All nine pages show an intentional alignment grid, complete text, legible source limits, clear arrow direction and closed feedback loop; 7/8 have an obvious reading order without deleting required scope | Explicit bounding-box inspection plus visual review of all nine native/export renders at comparable dimensions; typography minima are diagnostic only, not proof of projector readability |
| WB06 — QR and hyperlinks; AC07/19 | Preserved QR bytes are cropped, obscured, scaled badly, or lose exported link annotations | Exactly one closing QR; native asset and final PDF page decode to the exact homepage; visible URL matches; both project URLs and homepage links remain attached and present in PDF | Decoder on native asset and rendered final page; inspect native relationship references and actual PDF URI annotations; physical-device scan remains AC06 |
| WB07 — exact export parity; AC01/03/04/09 | A stale, reordered, raster-only, font-substituted, or incomplete PDF is paired with the new PPTX | Recorded exporter input hash equals final PPTX; PDF has nine pages in the same subject order, matching key text/symbols, diagrams, and links; final file hashes match manifest | One final export provenance record, PDF parser count/text/URI check, and all-nine-page comparison to native renders; then run the existing edition validator once on the complete R9 package |
| WB08 — scope and final identity; AC02/04/05/06/08/10 | Review result is applied to later changed bytes; preservation is claimed beyond available sources; author/device or event gate is silently closed | Final packet covers exact inspected sources and diff; all prior observed R8 bytes remain unchanged; newer review edition does not imply event selection, publication, rehearsal, or independent non-DevCon reuse | Rehash relevant sources immediately before final receipt; orchestrator reconciles repository/source availability and separate pending gates; no new test suite |

Source-qualifier retention is semantic, not a keyword pass. In particular, preserve the hypothetical fixed-capacity assumptions, the comprehension experiment's limited population and illustrative graph status, distinct observational study methods/denominators, elapsed merge time versus labor, proxy measures versus outcomes/cost, and the conditional nature of human and control requirements. A visual polish must not make a carefully qualified statement appear universal.

## Raw execution accounting and limits

All bounded read-only checks exited 0 without a signal or timeout. The retained tool execution records are:

- `b9f4ea`: `python -` read-only SHA-256/ZIP/XML inspection. Raw key results: `PACKET 7ef6cf35... True` for all ten pins; `PACKAGE {'parts': 58, 'duplicates': 0, 'bad_zip_member': None, 'rels': 23}`; `INTERNAL_REL_TARGETS_MISSING []`; nine forward/reverse note matches; edition notes `matches: False`, `without_one_terminal_newline_matches: True`; edition PDF `missing`.
- `34b3e4`: `python -` read-only note paragraph comparison and geometry/media inventory. Raw comparison results: `1 22 22 True`, `2 17 17 True`, `3 26 26 True`, `4 17 17 True`, `5 23 23 True`, `6 16 16 True`, `7 23 23 True`, `8 26 26 True`, `9 25 25 True`. Every inspected slide returned `axis_aligned_outside [] rotations []`. Full shape IDs, coordinates, explicit text settings, media hashes, and final picture XML were returned in the same record.
- `128c30`: `python -` read-only surface inventory. All nine roots reported `show default visible` and explicit Arial Latin font declarations. Source slide 8 has nine `cxnSp` connectors. `SITE-CHECK-PROFILES.md` and issue-109 acceptance JSON were confirmed absent.
- `f9aa0e`, `65b35d`, `861283`: complete numbered helper source reads. Source analysis only; no claim that rejection, partial-write cleanup, export, or runtime branches were executed.

One inventory command returned an `rg` missing-directory diagnostic for `.github/acceptance`; this led to the explicit file-availability check above. Two initial broad text reads exceeded the display budget; the relevant sources were subsequently read in bounded segments or complete individual helper reads. Neither truncated display nor historical claimed pass was counted as executed verification.

The complete R8 source-package read was successful. No R8 PDF, external source-paper verification, live Git/PR state, final candidate, final PDF export, GUI editing, PowerPoint rendering, QR decode, projector test, or timed rehearsal was observed. These limits remain explicit. Repository CI and full regression campaigns were neither available nor necessary to this initial source-only baseline.

On receipt of the exact final candidate, execute only the applicable matrix checks and preserve this first result unchanged. A changed final source or materially changed oracle requires affected re-review; a final report must name the exact candidate hashes and distinguish reused baseline evidence from newly observed results.
