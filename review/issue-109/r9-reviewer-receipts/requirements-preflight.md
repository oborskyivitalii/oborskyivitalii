# R9 requirements preflight — independent first judgment

**Role:** Requirements & Acceptance Reviewer  
**Execution:** /root/r9_requirements_preflight; first preflight judgment, 2 November 2026  
**Owner:** oborskyivitalii/oborskyivitalii issue109 / existing Draft PR110  
**Scope:** requirements review before the R9 implementation; no implementation, test authorship, external write or recursive delegation.

## Verdict

**The supplied request is sufficient to proceed with a bounded R9 draft: architecture/project feasibility first, runtime validation and operation second, plus visual alignment across all nine slides.** The proposed exchange supports the requested story. Preserve AC18 with architecture content at delivery slide7 and AC17 with runtime content at delivery slide8. The existing comprehension/evidence order remains delivery slides3/4.

The request already supersedes the previous two-slide-only geometry/preservation restriction. It does not waive meaningful technical breadth, scientific qualifications, rights, historical-edition preservation, nine-slide scope or acceptance gates. There is no need to obtain a new author decision merely to make this authorized draft. The author has not thereby accepted the resulting rendering, narration, timing or presenting device.

The acceptance record must carry the R9 amendment before the candidate is scored. Findings F01–F05 below identify the necessary treatments. This is a preflight judgment, not a completed-candidate pass, owner approval, closure recommendation or release authorization.

## Inspected sources and limits

- Prepared subset attributed to commit 9330c424b2dd66177de9e5e50db5f132b2c57001. It is **not a Git checkout**; no clean-tree, live-head, PR-state or current CI claim is made.
- Packet: review/issue-109/r9-input/preflight-manifest.json, SHA256 **7ef6cf35f2c2ea084158a5b7d024f18dea722c533777c8935496d0be6e920d74**. Independently recomputed this digest and verified the byte size and SHA256 of all ten listed files against it.
- Common reviewer contract: agents/reviewers/README.md, SHA256 11370925623aae0243944cbfa4b59244d0b081149ff15709cf2abe2c586b360b. Role prompt: agents/reviewers/requirements-acceptance.md, SHA256 44d2431d6de4f3618f90140813c43a994b55e1ea5897064a45adccca33750788. Read both, AGENTS.md and CONTRIBUTING.md, including independent-review and acceptance rules.
- Read the original Ukrainian request and the dated R9 scope in request.md. Read the current R8 AC01–AC19, relevant inherited audience/meaning/author gates and historical scope-amendment rules in issue-109-snapshot.md. Historical completion statements were treated as dated claims, not independent R9 evidence.
- Read guides/PRESENTATION-VERSIONING.md, R8 edition.json, R8 notes, especially slides6–9, and actual R8 native slide text, presentation order, dimensions and slide7/8 note relationships. The PPTX SHA256 is ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe. Its nine-slide presentation uses 12,192,000 × 6,858,000 EMU and delivery order 1,2,4,3,5,6,7,8,9 by native slide part.
- Viewed every supplied source PNG, slide-1.png through slide-9.png, under /workspace/scratch/05b05f9b1c10/build/r8-render/. These are source observations, not final R9 renders. I did not independently regenerate them or verify a repository-PDF-to-PNG production chain.
- The original repository R8 PDF, earlier retained packages, standalone R13 source file, current acceptance JSON and generation/validation implementation were not inspected in this packet. Their existence, preserved bytes, live status and execution cannot be accepted from this review alone. No web research, source-paper revalidation, dynamic application tests, rehearsal or physical-device inspection was performed.
- No parent conversation, current peer outputs or unrelated memory were consulted. The orchestrator must retain the actual accepted launch parameters and tool response separately; this reviewer cannot independently observe that API call or provider context/model internals. This receipt does not claim platform-level isolation. Its admission remains subject to the common contract's launch-evidence gate.

## Findings and required treatments

### F01 — High: old position and preservation wording would mis-score R9

**Evidence:** request.md authorizes whole-deck visual correction and architecture-before-runtime ordering. The current issue snapshot, lines26–45, still describes R8 order, exactly preserved R7 slides1–6/9, changes restricted to S07/S08, R8 deliverables and AC17=S07 / AC18=S08. The snapshot's dated editorial invariants, especially item7, allow later author changes to order/style while preserving history and recording their impact.

**Failure mechanism:** copying the R8 criteria or reuse claims into R9 could either prohibit the requested all-nine alignment, apply runtime requirements to the architecture slide, or label stale R8 checks as current R9 acceptance. Geometry changes to the previously approved ownership slide also cannot inherit exact-render approval automatically.

**Affected requirements:** AC01–AC05, AC14, AC17, AC18 and all changed slide-level gates.

**Treatment:** record a dated R9 amendment in the existing owner/policy. Use source-position delivery order **1,2,4,3,5,6,8,7,9** if the proposed exchange is implemented. Preserve stable IDs by subject: AC13 remains evidence at delivery4, AC14 ownership at delivery3, AC18 architecture at delivery7, AC17 runtime at delivery8. Permit visual alignment of all nine while retaining content/rights constraints. Reassess affected current-edition ticks; retain earlier results only as source-specific history or demonstrably unchanged evidence. The supplied request resolves the scope conflict; no extra permission loop is required.

### F02 — Medium: exchanging slide parts alone leaves narration and references ambiguous

**Evidence:** R8 speaker-notes.md lines233–323 contain source speech labels SLIDE07/SLIDE08 and separate R8 addenda. Architecture notes already contain runtime-monitoring paragraphs. Line311 includes a transition from architecture to S09; line359 describes S07 as runtime and S08 as architecture. R8 edition.json also encodes the old sequence and slide titles.

**Failure mechanism:** a visual-only swap can put the right subject on screen with the wrong delivery label, obsolete transition or duplicated runtime explanation. It can also conceal a substantive script rewrite behind an inaccurate claim that all R13 spoken wording is exact.

**Affected requirements:** AC01, AC02, AC03, AC04, AC16–AC19.

**Treatment:** move each note with its content; distinguish current delivery position from historical R13 source section; update current Markdown headings, provenance mappings, page numbers and R9 connective narration/addenda. Preserve the historical standalone R13 and R8 package. A historical source block may remain verbatim with an explicit source label, but the current delivery instructions must make the new sequence unambiguous. Record any spoken-word change honestly. Keep the architecture-to-runtime-to-closing transition clear, and keep reference material visibly separate from intended stage speech. Do not restore the obsolete 3–5-sentence-only rule: the later selected R13 speech superseded that earlier requirement.

### F03 — Medium: prepared Markdown notes are not byte-identical to the R8 edition pin

**Evidence:** the packet correctly pins the supplied R8 speaker-notes.md as **36,920 bytes**, SHA256 **cc9c3cece8830dcbf9d66dfdeac79a85980a02037e742aac943656fe3c1362a2**. R8 edition.json/artifacts/notes declares **36,919 bytes**, SHA256 **192dab4a1c2e61508db53fd00cd8b019bdefc9b9d47c68b132c66a08ec9eaa17**. A read-only check showed that removing exactly one terminal newline from the supplied bytes produces the edition's declared size and digest. No source file was changed. The actual native slide7/8 note payload hashes match their R8 manifest source-part pins.

**Failure mechanism:** treating the prepared Markdown copy as exact repository bytes would make a historical-preservation or input-binding claim false, even though this particular difference is nonsemantic. The packet manifest is internally consistent; the cross-manifest identity needs an explicit disposition.

**Affected requirements:** AC02, AC04, AC05, AC09.

**Treatment:** retain the supplied packet identity and document the preparation newline difference. Recover or deliberately reconstruct the exact repository notes bytes before claiming exact historical preservation, and identify that action. Generate and hash R9 notes from the actual selected R9 native note text. Do not overwrite the retained R8 edition pin with the prepared-copy digest or claim the separately stamped Library PDF is the repository PDF. This bounded discrepancy does not prevent content planning.

### F04 — Medium: “clearer, aligned and beautiful” needs a content-preserving review oracle

**Evidence:** the original request explicitly rejects an empty presentation containing only a few key ideas. R8 slide7 includes an example, exposure sequence, changed-condition strip, four monitoring categories and operating decisions. Slide8 combines a closed loop, human dependency and project-feasibility decision. The supplied slide8 render places its section label at the upper edge and does not show the full native “ACT II /” label; slides3 and6 likewise put header material unusually close to the top edge compared with slides7/9. These observations justify the whole-deck scope without establishing a final-layout defect inventory.

**Failure mechanism:** deleting mechanisms until the slides are sparse would fail the explicit breadth request. Keeping every block while shrinking type or packing labels would fail clarity. A geometry-only test would miss both failures.

**Affected requirements:** AC02, AC03, AC11–AC19, especially AC17/AC18.

**Treatment:** review the final pair against the content obligations below, using hierarchy and grouping to expose the relationship between evidence, decision and consequence. The essential argument must be followable in the visible slide; notes may hold citations and deeper qualifications, but cannot repair a missing control link or missing runtime consequence. Inspect all nine actual final renders at full-slide size and in a deck overview for clipping, overlap, title/footer consistency, safe margins, legibility, diagram direction, spacing and preserved caveats. Preserve native editability and the existing dimensions/theme. Choose layout measurements during implementation; this review introduces no invented universal font-size or pixel threshold.

### F05 — Low: timing figures describe different editorial assumptions

**Evidence:** R8 edition.json/timing retains a 19:55 talk target, 7:00 Q&A and 3:05 reserve, while speaker-notes.md line359 discusses a likely 20:50–21:05 talk after the revised closing. Both are expressly unverified; R8 addenda are also untimed.

**Failure mechanism:** carrying one number into R9 as measured duration, or expanding explanation to preserve breadth without accounting for time, would misrepresent AC06 and the thirty-minute slot.

**Affected requirements:** AC01, AC03, AC06.

**Treatment:** provide one clearly labeled R9 editorial allocation consistent with the selected delivery script, including Q&A/reserve. Preserve actual rehearsal as pending. Clarity should reduce duplicated explanation, not add a hidden lecture. No word count, slide count or successful export supplies the author's timed rehearsal.

## Required breadth of the reordered pair

These obligations are traced to the current AC17/AC18, their inherited qualifications and the supplied request. They describe protected meaning, not a new template or a requirement to print every reference note on screen.

| Delivery subject | Required observable content and protected qualifications | Evidence/check needed on R9 |
| --- | --- | --- |
| **Slide7 — architecture/project feasibility; AC18** | A clearly traceable closed loop: sensors collect outcome/control evidence; controller interprets it against goals/limits and decides with authority; actuators constrain, reroute, stop or correct the system; real outcomes return as feedback so the intervention can be checked. Action/permission constraints apply before consequences. | Follow the complete path on the actual render, then inspect native connectors/text and related notes. Component names without a usable relationship are insufficient. |
| **Slide7 — human dependency; AC18** | Human sensing and decision/control functions are attached to the relevant components. **Where** the design relies on people, competence, availability, workload, response time, information and authority are dependencies. A universal requirement for human control is not implied. | Inspect visible conditional wording and component association, then verify the supporting note qualifications. |
| **Slide7 — project decision; AC18** | Before full commitment, assess this use case's control evidence, adverse conditions, detection/prevention or harm limitation, timely intervention/recovery and full operating cost. Compare a simpler/current alternative where applicable. A successful happy-path demo supplies capability evidence but does not alone establish control adequacy or viability. Bounded discovery, narrowing, redesign, deterministic/no-AI alternatives or no-go remain legitimate outcomes. No blanket R&D mandate or universal validated architecture. | Visible planning/business decision with a concrete connection to the loop; notes preserve the scope, cost and alternative qualifications. Author review remains necessary. |
| **Slide8 — conditional runtime authority; AC17** | The illustrative **196 acceptable / 3 wrong instructions / 1 prohibited disclosure, n=200** remains a brief example. A 98% aggregate cannot authorize a forbidden outcome in this scope. It is neither production data nor a universal SLO/test-size threshold. | Verify visible numbers/illustrative label, scope of veto, notes and primary runtime argument. The example must not become the whole slide. |
| **Slide8 — safe exposure; AC17** | Independent evaluation, no-action shadow, bounded canary **only where consequences permit**, then bounded operation. Preventive controls precede consequential exposure; rollback cannot undo disclosure. Passing a canary does not grant permanent operating authority. | Inspect progression, qualifications and note semantics; avoid a diagram that implies every case must enter live canary. |
| **Slide8 — continuing observation and response; AC17** | Same application SHA can coexist with changed model/provider route, retrieval, policies, users and human response capacity. Observe service health/cost, useful/harmful behavior, control effectiveness and **qualified people/capacity**, including workload/queues and response time. Online status alone is insufficient. Continue, narrow authority, use tested staffed fallback, or stop/reassess according to evidence. | Verify visible monitoring categories and action choices; inspect notes for competence/authority, fallibility, capacity and irreversible-harm qualifications. No claim of complete semantic visibility. |

The new sequence should read: **slide6 introduces consequential model judgment; slide7 establishes the system and project commitments required to delegate it; slide8 explains how authority remains justified during operation; slide9 alone synthesizes the two research directions and role actions.** Meaningful breadth is preserved by those linked mechanisms and conditional choices, not by a minimum word count or by moving deleted essentials into notes.

## Intent / AC → check or owner gate → observed preflight state

| Requirement | Required R9 check or gate | Observation / remaining obligation |
| --- | --- | --- |
| **AC01 — nine-slide English delivery** | Count nine visible editable slides, nine matching attached notes and nine PDF pages; retain official title and source dimensions; verify new subject order and proposed pacing. | R8 has nine slides and the inspected dimensions. R9 is not yet observed; new order must propagate through all representations. |
| **AC02 — fidelity, rights and retained editions** | Compare R9's meaning, evidence qualifications, credits/source mappings and retained editions against their actual authoritative sources. Preserve R8/R13 historical bytes; allow authorized all-nine layout changes. | Packet and native R8 inspected. F03 bounds the prepared-note copy. Complete rights and earlier-edition preservation are not established here and remain open. |
| **AC03 — current all-nine review** | Inspect final native/PDF renders, visible argument, notes and economy. Obtain four distinct source-bound role results, including completed-candidate Requirements review. | All nine supplied R8 PNGs inspected for preflight. No R9 or other-role verdict is adopted. |
| **AC04 — complete versioned delivery** | R9 editable PPTX, PDF exported from that exact PPTX, synchronized notes, edition manifest, source lineage and index in the existing Draft PR. Return the complete matching pair. | Required by request and versioning contract; no R9 artifacts, repository writes or delivery observed in this review. |
| **AC05 — current owner and evidence** | Reconcile all stable ACs to R9, exact-source checks, path/RI duties and current issue/PR state. Respect the actual delivery lane and distinguish local prepared inputs from a verified committed candidate. | F01 applies. Historical R8 check statements cannot pass R9. Prepared-subset limits remain explicit. |
| **AC06 — author/rehearsal/device** | Exact-edition author review, timed rehearsal within the real thirty-minute slot and presenting-device/projection acceptance. | Pending; F05 applies. No approval inferred from the request or this review. |
| **AC07 — homepage QR** | Exactly one final QR; decode native asset and final PDF render to https://vitaliioborskyi.ai/; readable matching URL. | R8 closing render contains the QR and URL, but this reviewer did not decode them. R9 decode remains required even if the asset is reused. |
| **AC08 — event selection** | Separate deliberate exact-edition choice and existing event-contract binding if later authorized. | Request excludes event changes. Dated snapshot says R3 remains selected; this was not live-verified and must not silently change. |
| **AC09 — native generation workflow** | Reuse the existing repository mechanism; identify actual source, editability, export and manifest evidence. | Requirement retained. Generator/validator implementation and execution not inspected in this packet. |
| **AC10 — bounded independent reuse** | Preserve the outstanding non-DevCon reuse obligation and record only genuinely completed components. | Dated issue marks it open. R9 export cannot by itself satisfy independent non-DevCon reuse; no enlarged testing programme is needed for this preflight. |
| **AC11 / slide1** | Retain authentic two-sided opening/artwork, official title, HOW/WHAT distinction and What if not? argument; compare copy/notes after alignment. | Visible R8 opening inspected. Author gate stays source-specific. |
| **AC12 / slide2** | Retain hypothetical 8/100/8/+92 units and all-admitted/fixed-capacity assumptions, admission/WIP alternatives and possibility of improved downstream capacity. | Visible R8 and source notes inspected for the protected meaning; do not turn the thought experiment into a measured forecast. |
| **AC14 / slide3** | Preserve narrow/systemic review comparison, all five review functions, illustrative comprehension gap and ownership consequence, questions and lifecycle view, experimental caveats and source narration. | Existing content approval is documented in the snapshot. Any changed rendering requires current-source review; whole-deck alignment does not authorize loss of that content. |
| **AC13 / slide4** | Preserve qualified NBER, marketplace, agent-adoption/complexity, DORA and GitClear distinctions, units and noncausal limits; no added on-screen METR. | Source render/text inspected. No underlying empirical claim was revalidated; no source research update is authorized. |
| **AC15 / slide5** | Preserve six contextual hypotheses and interactions across speed/full cost, delivery/product quality and knowledge/ownership; no universal prescription or license-only ROI claim. | Source render/text inspected. Alignment must keep the six mechanisms and their uncertainty visible. |
| **AC16 / slide6** | Preserve HOW-to-WHAT pivot, explicit-rule/model-judgment comparison, account recovery, requirements/bug/DoR/DoD distinctions and bounded authority. | Source render/text/notes inspected. Update forward references for architecture-first ordering. |
| **AC18 / slide7; AC17 / slide8** | Apply the pair-specific obligations above, with stable IDs following content; verify native content, rendered story and synchronized notes. | Authorized direction and loss risks identified; candidate implementation and author acceptance remain unobserved. |
| **AC19 / slide9** | Retain sole closing slide, both research identities/links, separate HOW/WHAT actions, role context, brief conclusion and one homepage QR. | Source closing render/notes inspected. Reconcile old S07/S08 references; no new generalized conclusion on each preceding slide. |

## Next gate

The orchestrator should record the supplied R9 scope and content-position mapping, disposition the prepared-note identity difference, then implement the authorized draft with these preserved obligations. Review the actual complete R9 package and its exact source delta through the four required roles before advancing acceptance. Reuse prior evidence only where the relevant source and claim are demonstrably unchanged.

No extra author clarification is necessary to draft the requested swap and visual cleanup. Exact-render author review, substantive changes beyond this request, rights decisions, rehearsal, presenting-device acceptance, event selection, merge and publication remain their own applicable gates. This first receipt is preserved without peer reconciliation.
