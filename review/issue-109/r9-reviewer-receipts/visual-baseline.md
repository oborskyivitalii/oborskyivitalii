# R9 baseline: independent Exploratory / Interaction QA

**Date:** 2 November 2026  
**Reviewer execution:** `/root/r9_visual_review`  
**Phase:** first independent baseline assessment of R8, before an R9 candidate  
**Owner:** issue109 / Draft PR110  
**Verdict:** The requested order change is coherent. The principal problems on R8 slides7/8 are competing reading priorities and small supporting text, not demonstrated text clipping or object overlap. Preserve the technical breadth while giving each screen a clearer route through its details. This assessment does not accept an unprovided R9 candidate.

## Source and independence

The inspected repository material is a **prepared subset**, not a Git checkout. Its declared base is `9330c424b2dd66177de9e5e50db5f132b2c57001`; `git rev-parse` confirmed that the local directory is not a Git repository. No live-ref or clean-tree claim follows.

| Input | SHA256 |
| --- | --- |
| `review/issue-109/r9-input/preflight-manifest.json` | `7ef6cf35f2c2ea084158a5b7d024f18dea722c533777c8935496d0be6e920d74` |
| Common reviewer contract | `11370925623aae0243944cbfa4b59244d0b081149ff15709cf2abe2c586b360b` |
| Exploratory / Interaction QA prompt | `b7cb8786e3ea0507b04f8a4499261484c7cea7af4b110a3520fa1445d6db0af4` |
| Exact R8 PPTX | `ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe` |
| R8 edition manifest | `b32911e6986370d77fe12662495d431f745f560973c91dbc7bf0758ddc470ede` |

All ten preflight entries matched their supplied byte counts and hashes. The role prompt is a separately identified dependency because the preflight manifest lists the Requirements prompt, not this role's prompt. I read the R9 request, supplied issue snapshot, AGENTS, the common/role contracts and applicable CONTRIBUTING review rules. Historical R8 verdicts present inside the supplied issue/edition were treated as historical claims, not as my oracle. I did not read current R9 peer receipts, parent scratch notes, private chat, or the speaker-note content. Hashing the supplied notes is not semantic inspection of those notes.

Only this receipt was written. There were no implementation edits, external writes or recursive delegation. The orchestrator owns launch-parameter evidence; provider-observed context/model internals are unknown to this reviewer.

## Charter and bounded execution

The charter was a conference viewer's reading journey through all nine supplied 1600×900 PNGs, with a second inspection of the final act and targeted native text/geometry reads. The bound was nine baseline screens plus focused source diagnosis, without rendering a new edition or operating unavailable presentation software. I checked visual hierarchy, alignment, whitespace, typography, actual text fit, narrative dependencies and preservation of meaningful detail.

| Case | Expected | Observed / disposition |
| --- | --- | --- |
| B01: inspect slides1–9 in delivery order | All content remains visible; grouping and hierarchy support reading | Executed. No material clipped text or unintended object/text overlap observed in the supplied rasters. Several screens have structural density and small type, detailed below. |
| B02: distinguish raster appearance from source geometry | Suspected edge defects have actual evidence | Executed. Full original-resolution reinspection confirmed complete top labels on S06/S08 and the complete S03 title. These are **not clipping findings**. Native text and font sizes were inspected for diagnosis. |
| B03: follow S06→S07→S08→S09 | The viewer knows the control architecture before being asked to monitor its adequacy | Executed as a reading walkthrough. S07 asks for whole-control-system monitoring before S08 explains that system. The proposed architecture-first order removes that dependency reversal. A changed native slide show was not executed. |
| B04: trace S08 control loop and S07 operating decisions | Feedback and intervention remain visible; caveats survive | Executed. The loop and constraints exist, and all four operating responses are visible. Their perceptual emphasis can improve without dropping functions. |
| B05: native PowerPoint, actual projection, timed delivery and physical QR scan | Test on the intended presentation surface | **Not observed: unavailable.** Raster inspection does not satisfy AC06. No timing or scan success is inferred. |

The native delivery-order relationship was verified: delivery S03 uses `ppt/slides/slide4.xml`; delivery S04 uses `ppt/slides/slide3.xml`. All slide numbers below refer to delivery order.

## Concrete findings

### V01 — Medium: runtime monitoring precedes the architecture it relies on

**Location/evidence:** R8 S07, “AFTER ROLLOUT: MONITOR THE WHOLE CONTROL SYSTEM”; R8 S08 then defines sensors, controller, actuators and controlled system. S06 introduces runtime model judgment.

**Mechanism:** The audience must first imagine an undefined whole control system, then reconstruct it one slide later. This adds explanation overhead at the most conceptually demanding transition.

**Treatment:** Use S06 → current S08 architecture/project feasibility → current S07 runtime qualification/continued operation → S09. Carry stable AC18 with architecture to delivery S07 and AC17 with operation to delivery S08. Adjust transitions and notes in the candidate; do not assume that merely exchanging pages fixes the narration.

**AC impact:** AC01, AC03, AC17, AC18. This supports the requested swap, not an additional slide or a reduced scope.

### V02 — Medium: S07 has several near-equal reading starts

**Location/evidence:** The 196/3/1 example, four exposure stages, same-SHA condition band, four monitoring categories, decision strip and final caveat all share one screen. The native labels inside the exposure stages are 9.5pt; the veto qualification is 10pt; monitoring body is 12.8pt. All fit in the supplied raster.

**Mechanism:** Large numerals pull attention left while the exposure route pulls right. The condition-change band then interrupts the descent toward monitoring and actions. A viewer can read each area but cannot immediately tell the intended hierarchy. This is structural crowding, not an overflow defect.

**Treatment:** Make three connected reading stages explicit: evidence permits a bounded scope; operation depends on current conditions; observations lead to continue/narrow/fallback/stop. Keep the numerical veto, conditional exposure, service/behavior/control/people monitoring and irreversibility qualification. Reduce repeated framing and panel chrome before reducing substantive content. Give the monitoring-to-decision relationship more visual priority than decorative framing. Essential limits should remain visible rather than survive only in notes.

**AC impact:** AC03, AC17; retain human capacity and conditional canary requirements.

### V03 — Medium: S08 presents the architecture, people dependency and commitment test with competing emphasis

**Location/evidence:** A human-role heading above the first two blocks, human lines inside those blocks, a second human-dependency statement below the loop, and a large demo/business-case panel form several separate messages. The yellow constraint banner spans the last two blocks and uses a short leader above the action link. The diagram itself is aligned and its feedback return is visible.

**Mechanism:** The eye can read this as a list of four components plus two add-on arguments. The important relationship between architecture, operational staffing and project feasibility takes more effort to reconstruct than the geometry suggests. Constraint placement is visually less explicit than the component sequence, although the text clearly says enforcement occurs before consequences.

**Treatment:** Keep one dominant control-loop composition and make the constraints visibly attach to the action boundary. Make comparing observed outcomes with approved limits explicit in the controller wording if the candidate permits it. Consolidate the human explanation into one clearly conditional attachment to sensing/decision functions, retaining competence, availability, workload, authority and timely response. Place the commitment test as the consequence of that architecture: detection, harm limitation, timely intervention and full cost, followed by the discovery/narrow/redesign/no-go options. The successful-demo qualification must remain conditional rather than imply demos provide no evidence.

**AC impact:** AC03, AC18. No finding that the existing loop is missing or that human control must always be manual.

### V04 — Medium: some scientific qualifications are much smaller than the claim they qualify

**Location/evidence:** S04 native evidence labels/caveats commonly use 9–11.4pt, including the calendar-duration qualification, observational/proxy distinctions and marketplace-use context. S03 experiment/lifecycle caveats use 9.75pt. Their text is visible at close raster inspection.

**Mechanism:** The large metrics or curves remain easy to see while qualifications demand close reading. In conference use, that risks an audience retaining a stronger claim than the slide intends. Actual back-row readability remains unobserved.

**Treatment:** Preserve the evidence breadth and all material qualifications. Use consistent short qualifier placement adjacent to the associated metric, give meaning-changing caveats more size/contrast, and reclaim repeated headings or interior padding where useful. Do not solve this by hiding caveats in notes or shrinking them further. S03 contains explicitly retained approved content; geometry improvements should preserve its argument and all five review functions.

**AC impact:** AC02, AC03, AC13, AC14. This is a legibility risk, not a claim that the source material is scientifically wrong.

### V05 — Low: the six hypotheses on S05 have an incomplete numbering pattern

**Location/evidence:** The slide says “Six hypotheses to test.” Agentic review, living architecture and disposable implementation are numbered 1, 2 and 3; the other three are unnumbered. Reading across the top row and down the columns yields different implied sequences.

**Mechanism:** The numerals suggest a second organizing system that conflicts with the three outcome columns and is not completed.

**Treatment:** Keep all six hypotheses and the outcome-column organization. Use consistent numbering only if it has a deliberate reading order, or remove the partial numerals. Align the card headings and their explanatory/question baselines as far as differing line lengths permit.

**AC impact:** AC03, AC15; cosmetic/organization correction within the authorized full-deck review.

### V06 — Low: whole-deck header and footer rhythms vary

**Location/evidence:** S03's title and divider sit materially higher than the standard body-slide header; S05 also uses a shallower header than S02/S04. The final-act slides share a more consistent eyebrow/title/subtitle structure. Some short titles end with periods while others do not. S09's role strip uses small labels (approximately 9.8–10.1pt) beneath otherwise large closing content.

**Mechanism:** The changes feel like successive templates rather than intentional section variation. S09's action strip can be missed even though the QR and two research identities are clear.

**Treatment:** Standardize the body-slide left/right guides, rule positions, title spacing and punctuation where practical without compressing diagrams. Keep the intentional cover and closing compositions. If the role actions are meant to be read from the room, grant them more height/type rather than shrinking the QR.

**AC impact:** AC03 and AC19. This is polish, not clipping.

## All-nine-slide disposition

| Slide | Baseline observation |
| --- | --- |
| 1 | Strong two-part HOW/WHAT composition, useful cyan/yellow distinction and balanced artwork. No blocking alignment or clipping defect observed. |
| 2 | The before/after grid, repeated capacities and backlog contrast are clear. Safe margins and aligned columns. Keep the thought-experiment and admission assumptions visible. |
| 3 | Dense but internally structured: systemic review, local gap, consequence, empirical context and lifecycle. Several text sizes/reading layers compete. No actual clipping; preserve approved substance. |
| 4 | Evidence groups align cleanly; major metrics are legible. The smallest method and proxy qualifications are the principal projection risk. |
| 5 | Balanced three-column composition. Partial numbering and different heading/question baselines are the most concrete polish opportunities. |
| 6 | The two models and four comparison rows align well. This is an effective HOW-to-WHAT pivot. Small labels exist, but the main comparison remains visible. |
| 7 | Good contrast and consistent panel geometry. Priority finding is a clearer reading hierarchy and connection between observations and authority decisions. |
| 8 | The closed loop is traceable and body copy is generally larger than S07. Consolidate repeated human framing and clarify its relationship to project commitment. |
| 9 | Clear two-project close and prominent QR; substantial intentional whitespace supports the conclusion. The bottom role strip is less prominent than its importance suggests. QR appearance was inspected, decoding was not executed. |

## Regression allocation and limits

The proposed final R9 manual checks belong to issue109's existing AC03 visual/story review: compare all nine final renders, then trace S06→new S07→new S08→S09; inspect the control/action boundary, conditional staffing dependency, operating veto and all four monitoring categories at full-slide scale. The native notes/order check belongs to the existing presentation/source validation route, not to this raster-only baseline. These are proposed final checks, not results already earned.

`guides/SITE-CHECK-PROFILES.md` was absent from this prepared subset, so no new CI workflow or profile allocation is asserted. Actual PowerPoint behavior, projection, physical scanning, timing and author acceptance remain under AC06 and were not observed. No source-fact validation, complete rights review, release readiness or R9 acceptance is claimed.

## Inspected raster identities

Directory: `/workspace/scratch/05b05f9b1c10/build/r8-render/`.

| File | SHA256 |
| --- | --- |
| `slide-1.png` | `046563c49b222c74ba1ae15d23538dd65cf4001532ddf0a60f2bf37f581f312f` |
| `slide-2.png` | `69ea9cf932b8852f7c02db6360a047c50785ad9791e4f0af4c12a90e9ae40b4c` |
| `slide-3.png` | `1fba8e7f12f10fe7191d6eacb9ff220c2de0709e314aa53fb0299cfdc5fa0b26` |
| `slide-4.png` | `6319f0eb67bf0df4fa03f3f42464d322167b9ec5a88f6ebb027097a061b860e3` |
| `slide-5.png` | `55b3e485157d3d64bf4d55ea19e6661accaa9ddbb4aa147e628b5f3083022a2b` |
| `slide-6.png` | `49ba9bfafaef4a83cf4e8fcb8eda2ae4a70cf862318955fda93506269ded5b3d` |
| `slide-7.png` | `656c158937e8c97fb4fa439add4c88db4f2a9f8b5784ae838b803ef39f4187e8` |
| `slide-8.png` | `5368355fc2882eded07e3b1fe467e720b9c27b57618a7ba81ec620de7db6a5d5` |
| `slide-9.png` | `3b85400ae7f0a2538bea92cc3e509de9df5d3e93ce4d1a7938bb2891bb2c45d9` |

