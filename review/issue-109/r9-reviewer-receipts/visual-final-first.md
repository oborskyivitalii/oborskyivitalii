# R9 candidate: Exploratory / Interaction QA first verdict

**Date:** 2 November 2026  
**Execution:** `/root/r9_visual_review`, continuation of this role's own baseline assessment  
**Owner:** issue109 / Draft PR110  
**Disposition:** **No blocking visual or audience-reading defect found in the supplied final R9 renders.** The architecture-first order and the reorganization of slides7/8 satisfy the requested clarity direction while retaining meaningful breadth. Two optional refinements and physical-presentation limits remain below.

This is a role continuation with a new neutral candidate packet, **not a newly fresh reviewer launch**. The baseline receipt remains intact. I used my own prior observations, the original request/issue and the final candidate sources; no peer verdicts or author scratch scripts were consumed. Launch/protocol admission and the other required roles remain the orchestrator's responsibility. This result does not alone establish whole-AC completion or conference-final acceptance.

## Exact inspected candidate

| Input | SHA256 |
| --- | --- |
| `r9-input/candidate-visual-manifest.json` | `1a40cdc8b92822a5762f6cc524cd0352413398a25412a973ac2c92d7d7753229` |
| R9 PPTX | `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1` |
| R9 PDF | `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277` |
| Common reviewer contract | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| Exploratory / Interaction QA prompt | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| Original R9 request | `ce63ed80994310bec2aa5f0328198777653ae2879accda12ccc49f799b2dc68d` |
| Supplied issue snapshot | `805159cdc39d91a52ed9496b9dd3371858b26afcb0f6774acc79445ce2ebca33` |

The prepared subset declares base `9330c424b2dd66177de9e5e50db5f132b2c57001`; it is not a native Git checkout. All 28 entries in the candidate manifest matched their declared byte counts and hashes. Byte verification is not a claim that every listed source file was semantically reviewed. The PPTX/PDF/packet identities were rechecked at the end of inspection.

**Only final renders were inspected:** `/workspace/scratch/05b05f9b1c10/build/r9-final-render/slide-1.png` through `slide-9.png`, individually at original resolution. No verdict is based on the superseded `r9-candidate-render` images. In particular, final S03 shows the complete title and full slide contents; no truncated-S03 finding applies to these final images.

## Charter, execution and evidence

The bounded charter was approximately ten minutes, nine final screens and focused inspection of the last act. It covered full-slide reading order, alignment, whitespace, type hierarchy, clipping/overlap and retention of the visible technical qualifications requested for slides7/8. Supporting checks read the PPTX slide relationships and selected text/font properties, and counted the PDF pages. No implementation or test source was changed; only this assigned receipt was written.

| Case | Expected | Actual observation |
| --- | --- | --- |
| F01: final S01–S09 raster inspection | Complete text and diagrams with no unintended overlap or clipped content | **Executed, pass within raster scope.** All nine were individually inspected. No material text clipping, unintended object overlap or off-slide content was observed. |
| F02: native delivery-order read | Nine slides, architecture before operation, evidence/ownership order retained | **Executed, pass.** Delivery S03 uses native `slide4.xml`, S04 uses `slide3.xml`, S07 uses architecture `slide8.xml`, and S08 uses runtime `slide7.xml`. The PDF contains nine pages. |
| F03: audience journey S06→S07→S08→S09 | Runtime judgment introduces the need for a control architecture; architecture supports operating conditions; conclusion connects both research directions | **Executed as a reading walkthrough, pass.** The new order defines the system before asking the audience to monitor and reassess it. This is not a claim of a native slide-show or timed rehearsal. |
| F04: S07 control/commitment trace | Closed feedback loop, constraint enforcement, conditional people dependency and business-case decision remain understandable | **Executed, pass.** The loop, enforcement boundary, return path and three commitment questions are visible. Required breadth is retained. |
| F05: S08 qualification/operation trace | Evaluation veto, conditional exposure, whole-system monitoring and authority responses remain visible | **Executed, pass.** The three numbered sections expose the intended reading path and preserve the material limits. |
| F06: native PowerPoint, projection, rehearsal and physical QR scan | Observe actual presenting behavior and distant legibility | **Not observed: unavailable.** These remain open physical/author gates; no pass or N/A is inferred. |

## Why slides7/8 now work better

### S07 — The Product Includes Its Control System

The title, subtitle and two numbered sections establish a clear argument: the product includes a closed control loop, and the project's delivery commitment needs evidence that this whole system is feasible. The sequence **Observe → Decide → Intervene → Operate** gives accessible verbs before the technical sensor/controller/actuator/system labels. That makes the technical architecture easier to enter without removing its terminology.

The feedback path visibly returns actual outcomes to observation. Permissions and action limits sit over the intervention-to-operation boundary and explicitly precede effects. Conditional human sensing and judgment appear at their relevant components; the dependency sentence below names availability, competence, workload, response time and authority. This is a substantial improvement over repeating the same human framing in several separate areas.

The lower section preserves three distinct project questions: whether the system can be controlled, whether it can be operated with expertise/staffing/capacity/full cost, and whether a simpler viable option is preferable. Discovery, narrowing, redesign and no-go remain visible. The final sentence gives a successful demo evidential value while distinguishing it from a complete operating case. The screen is still substantive; it has not become an empty summary.

### S08 — Validation Continues During Operation

The three numbered stages give a reliable reading route: **admit on evidence; monitor the whole control system; reassess authority and act**. The example and exposure stages now belong to the same first stage, rather than competing with several equal-weight panels.

The illustrative `n = 200`, 196/3/1 outcomes and prohibited-disclosure veto are visible together. Exposure remains conditional on risk; preventive controls precede live exposure, and the canary is explicitly not a safety certificate. The same-application-SHA condition names changes to model/provider, knowledge, policy, users and responder capacity.

All four monitoring domains remain visible: service, behavior, controls and people/capacity. The resulting responses include continuing, narrowing authority, a tested and staffed manual fallback, and stopping/reassessing. The final disclosure-irreversibility statement prevents rollback from being mistaken for adequate harm prevention. These are preserved technical distinctions, not a shorter list of slogans.

## All-slide visual disposition

| Slide | Observation and disposition |
| --- | --- |
| 1 | The HOW/WHAT cover retains its balanced artwork, color distinction and readable title. No blocking defect. |
| 2 | Capacity boxes, pipeline stages and backlog comparison remain aligned. The hypothetical/admission assumption and bounded-WIP response remain visible. No blocking defect. |
| 3 | The complete title, five review functions, local chart, unresolved ownership question, experimental qualification and lower lifecycle illustration are present. It remains a dense, deliberate overview; no text is truncated in the final raster. |
| 4 | All evidence groups remain. Method/proxy qualifications are visibly retained and somewhat larger than baseline. Two captions wrap to two lines, but remain inside their intended groups without collision. Small-type projection risk remains optional/physical, not a demonstrated raster defect. |
| 5 | The six hypotheses now use a consistent unnumbered treatment and much more regular heading, body and question placement. The partial-numbering ambiguity is resolved. Context and no-agent scope remain visible. |
| 6 | The rule/model distinction and comparison rows align cleanly. The final-act header style is consistent with S07/S08. No blocking defect. |
| 7 | The loop and project evidence sections establish clear hierarchy; substantive control and people constraints remain. No blocking defect. |
| 8 | Three stages clearly organize qualification, observation and action; all required monitoring domains and operating responses remain. No blocking defect. |
| 9 | The two research/project identities and prominent QR remain clear. The role strip is visible but smaller than the main close. No clipping; physical/digital QR decoding was not executed in this role. |

## Baseline finding reconciliation

| Baseline finding | Candidate disposition |
| --- | --- |
| V01: operation before the architecture it depends on | **Resolved in the observed delivery order.** |
| V02: several competing reading starts on runtime slide | **Resolved to a clear three-stage reading hierarchy.** Breadth retained. |
| V03: architecture/people/commitment compete for emphasis | **Substantially resolved.** Two major sections and conditional component attachments connect the ideas. Optional wording refinement below. |
| V04: scientific qualifications small relative to claims | **Improved; residual projection consideration.** S03 key caveats are 10.5pt and most S04 labels/caveats are 10.88pt. No claim of back-row readability. |
| V05: incomplete 1/2/3 sequence among six hypotheses | **Resolved.** The partial numbering is removed and card alignment is more regular. |
| V06: inconsistent whole-deck rhythm | **Improved.** Common margins and final-act headers are coherent. The dense S03 composition and cover/closing remain intentional exceptions. Small closing-role type remains optional. |

## Optional recommendations — not delivery blockers

### O01 — Low: final-room legibility of small supporting text

**Evidence:** S03 caveats are 10.5pt; many S04 qualifiers are 10.88pt; S09 role labels remain approximately 9.8–10.1pt. The final raster contains them cleanly, and S04's larger captions sometimes wrap to two lines.

**Mechanism:** A room viewer may see the headline figure before reading its qualification, or miss the small closing-role labels. The actual projection environment is unavailable, so this is a risk to check, not an observed physical failure.

**Treatment:** During the already-required device/projection check, verify these exact areas from the intended audience distance. If they fail, prioritize meaning-changing qualifiers and role actions over decorative spacing. Preserve evidence qualifications rather than hiding them in notes. **AC03/AC06/AC13/AC14/AC19.**

### O02 — Low: one controller phrase can be more literal

**Evidence:** S07's Decide/controller body says “Compare goals and limits.”

**Mechanism:** Read alone, that phrase could mean comparing goals against limits. The incoming outcome-observation arrow provides the intended meaning, so the diagram remains understandable.

**Treatment:** If another authorized text pass is already planned, “Compare outcomes with limits” or “Compare with goals and limits” would make the controller action more literal. No additional iteration is required solely for this preference. **AC18.**

## Limits and allocation

This receipt supplies the exploratory visual/story evidence for the existing issue109 review route. It does not replace source/rights checking, complete notes validation, full repository checks, other independent roles or exact-edition author acceptance. The candidate's own manifested export/assembly files were byte-checked, not treated as a substitute for inspecting the final slides. No claim is made about hidden animations, font substitution in PowerPoint, live links, physical scanning or measured delivery duration.

The executed manual cases above allocate to AC03 and the affected visual aspects of AC17/AC18. Physical device/projector/rehearsal cases remain **not observed**, owned by AC06. No new CI suite, device matrix or release gate is introduced. The prepared-subset and role-continuation limitations remain explicit.

## Final raster identities

| File | SHA256 |
| --- | --- |
| `slide-1.png` | `a580c5c01c23bd49d48ad8498fbbae9dfb17c0f83221dde0dda8aa2b8c14cc36` |
| `slide-2.png` | `e0c79ddb19fa5b79ad95efc8148689699acab2f45a21656265797f1e48d3590a` |
| `slide-3.png` | `3eb7167ea0b7280b7a07fd361cedf483cf78adad8ed236fd4e78ce75caaa456e` |
| `slide-4.png` | `f054b9d98c32cb1c084081ed36a73561ac684be13bb7d8f6280b0a7c48516531` |
| `slide-5.png` | `9369dec88e6cb3e708f73bfaa567b3ff908a67d2fa9af88d6a93f9a9b06482bf` |
| `slide-6.png` | `c3f812f894faa475fa9c083a07daee364a64da249ba9b826971938b6b473fdce` |
| `slide-7.png` | `f66a605692406f2138707a7bfb95f786c915c4fe5913504ebd111ede8458fa5c` |
| `slide-8.png` | `838b3ecedd154edefe68ea486d1ea2a1b789663c7aa04b07fe29532e0cca70b0` |
| `slide-9.png` | `a4bc1248028e960bd8d9e2d492e2a9db62f9116c26a93dd460480d2324c1cd8c` |

