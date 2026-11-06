# White-box QA — R14 baseline inspection

Date: 2026-11-02. Reviewer/task: `/root/r14_whitebox`. Phase: first independent baseline result; no R14 candidate was supplied or inspected. **Baseline observations complete; candidate acceptance remains pending.**

## Scope and assurance

Bounded read-only source inspection and deterministic extraction for the R14 speech alignment request, followed only by this assigned receipt. No source edits, test authoring/execution, external writes, delegation, current peer outputs, parent scratch notes or unrelated memory. The checks below are extraction/source inspection, not runtime test coverage. Shared filesystem access is an operational boundary, not OS isolation. Actual parent spawn parameters and provider model/context internals were not independently observable here; the orchestrator must retain the actual launch receipt. No claim of provider-level isolation is made.

The task packet authorizes a new standalone R14 script, exact preservation of R13 and R9, seven unchanged spoken bodies, and targeted new-S07/S08 edits. Existing whole-deck acceptance language preserving R13 remains applicable to the retained R9 package; this speech delta does not authorize changing it or claiming author/rehearsal/device approval.

## Source identity

Repository HEAD observed: `6bd9e990251a6211f56ce6ba424960fe24879a71`.

Preflight manifest: `review/issue-109/r14-input/preflight-manifest.json`, SHA-256 `5a51538e7795d95e66c45bc0c30d146446e8f1590922ac09b3d9ede51f2d754e`. All 14 listed paths matched both recorded byte size and SHA-256 during this inspection. This establishes the supplied pins, not a full clean-tree assertion.

- Common reviewer contract SHA-256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- White-box prompt SHA-256: `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- Request SHA-256: `942ea424d158d741b2814bfd71e6956ab4e676c69d63ece1d32a81e0db00c479`.
- R13 script SHA-256: `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.
- R9 PPTX SHA-256: `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1`.
- R9 PDF SHA-256: `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277`.

Read the common and role prompts, request, AGENTS, presentation-versioning owner, relevant CONTRIBUTING review/failure sections, relevant SITE-CHECK-PROFILES dispositions, issue-109 acceptance criteria and R13 text. Inspected the native PPTX relationship-defined ordering and text, especially delivery slides 7 and 8. No rendering or presentation-device interaction was performed.

## Reproduced spoken word baseline

Extraction used each `## Slide NN` body up to the next level-two heading. Titles, delivery notes, sources and change log were excluded. A terminal Markdown horizontal rule contributes no word tokens. Python `re.findall` token pattern:

```python
r"\b\w+(?:['’\-]\w+)*\b"
```

This counts Unicode word runs with internal straight/curly apostrophes or ASCII hyphens as one token. Numbers and abbreviations are counted as written, not expanded into spoken syllables; comma-separated numeric components follow the same pattern in both versions. Do not change tokenization between baseline and candidate.

| R13 source slide | Body topic | Words | Required R14 delivery slide |
| --- | --- | ---: | ---: |
| 01 | Two problems | 153 | 01 |
| 02 | Whole delivery system | 214 | 02 |
| 03 | Evidence | 168 | 04 |
| 04 | Review and ownership | 166 | 03 |
| 05 | Finding a new balance | 146 | 05 |
| 06 | Decisions inside the product | 183 | 06 |
| 07 | Hypothesis stays alive | 115 | 08, targeted edits allowed |
| 08 | Control system | 238 | 07, targeted edits allowed |
| 09 | Closing | 169 | 09 |
| **Total** | | **1552** | |

The seven unaffected bodies total **1199** tokens. Therefore new S07 plus new S08 have a combined ceiling of **353** tokens if the seven other bodies remain verbatim. Individual S07/S08 counts may change; the combined ceiling is the meaningful invariant.

## Native order and planning/runtime partition

Read `ppt/presentation.xml` and resolve its relationship IDs through `ppt/_rels/presentation.xml.rels`, rather than trusting numeric ZIP filenames. Observed sequence:

`slide1.xml, slide2.xml, slide4.xml, slide3.xml, slide5.xml, slide6.xml, slide8.xml, slide7.xml, slide9.xml`.

Thus the supplied mapping **[1, 2, 4, 3, 5, 6, 8, 7, 9]** is directly supported by the native presentation order. Native delivery S03 is ownership, S04 evidence, S07 architecture/project commitment and S08 runtime validation/intervention.

### Delivery S07 / native slide8.xml

Title: “The Product Includes Its Control System.” Native content presents Observe/Sensors → Decide/Controller → Intervene/Actuators → Operate/Controlled System, feedback verifying the correction, permissions/action limits before effects, and possible human sensing/judgment dependencies. Its commitment questions concern controllability, operability and whether building the system is worthwhile relative to a simpler viable option. Human availability, competence, workload, response time and authority are design dependencies when used. Insufficient evidence allows discovery, narrower scope, redesign or no-go. A demo supplies capability evidence but does not establish the full operating case.

Mechanical/semantic protection: preserve controls outside the model and text-disclosure risk; architecture and operational viability must inform the delivery budget decision. Keep conditionality about needing humans. Do not present a diagram or successful demo as reliability proof, or erase the possibility of feasibility/R&D and not proceeding. The runtime-monitoring paragraphs currently in R13 S08 belong with new S08, while the dependency and costing premise remains on new S07.

### Delivery S08 / native slide7.xml

Title: “Validation Continues During Operation.” Native content keeps the 200-case example (196 acceptable, 3 wrong steps, 1 privacy leak) and states that the prohibited disclosure blocks approval for this scope despite 98% acceptable. Progressive exposure is conditional on risk and includes independent evaluation, no-action shadow, bounded canary and limited operation. Preventive controls precede live exposure. Monitoring covers service, behavior, controls and people/capacity; changed model/provider, knowledge, policy, users or responder capacity can matter without changing application SHA. Actions are continue, narrow authority, tested/staffed manual fallback, or stop/reassess. Rollback cannot undo disclosure.

Mechanical/semantic protection: retain the serious-outcome veto, conditional live exposure, ongoing observation of controls and human response capacity, feasible fallback and authority to intervene. Human presence/online status alone is insufficient. Do not allow a high mean score, canary or rollback to stand in for preventive controls.

## Risk / requirement → check matrix

| Risk and applicable scope | Structural fault | Bounded scenario and independent oracle | Disposition |
| --- | --- | --- | --- |
| Request 1–2; AC01/02, AC13/14 | Filename order mistaken for delivery order; accidentally rewriting unaffected speech | Resolve native relationship order; compare candidate bodies to source mapping [1,2,4,3,5,6,8,7,9] | Native order observed; candidate equality pending |
| Request 4; concise delivery | Counting notes or dropping punctuation inconsistently produces false budget compliance | Extract nine bodies identically and tokenize with explicit regex; total ≤1552 and unchanged seven sum 1199 | Baseline executed: 1552; candidate total pending |
| Request 2–3; AC18 | Runtime paragraphs remain in planning; architecture loses human/cost/commitment premise | Read candidate S07 against native slide8.xml and preserved R13 control claims | Baseline split identified; manual candidate review pending |
| Request 3/5; AC17 | Average score overrides forbidden result; live exposure unconditional; fallback lacks capacity | Read candidate S08 against 196/3/1 veto, risk-conditional exposure, control/human observation and staffed response | Native requirements observed; manual candidate review pending |
| Request 1/5; AC13/14 | Slide references and source caveats still use former positions | Check delivery cues, heading order, evidence S04 and ownership S03 mappings, six research references and qualifiers | R13 stale-for-new-order cues identified; candidate navigation pending |
| Request 4/6; timing/acceptance gates | Arithmetic duration presented as measured rehearsal | Check total/rate arithmetic, pause accounting and explicit rehearsal/device pending status | R13 labels estimates as scenarios; candidate check pending |
| Immutability and scope | R13 or R9 package overwritten during speech revision | Rehash supplied immutable inputs on candidate; compare against manifest | Baseline all 14 file pins match; final rehash pending |

These are bounded manual/source-extraction checks owned by this issue's speech review under SITE-CHECK-PROFILES' retained-manual-evidence disposition. No dynamic application or new interactive behavior is introduced by the standalone prose request; application branch coverage and browser campaigns are not applicable to this baseline. Optional reading-PDF layout, if created, remains a separate observed-render requirement; no such candidate was supplied.

## Results, findings and limits

All extraction commands exited 0 with no signal. Raw observed accounting: manifest mismatches `[]`; native slides 9; spoken bodies 9; word vector `[153,214,168,166,146,183,115,238,169]`; total `1552`; native source-order vector `[1,2,4,3,5,6,8,7,9]`. Native S07 and S08 text independently confirms the planning-before-runtime contract.

No baseline contradiction was found in the checked word count, mapping or targeted split. This is not a no-findings judgment on a candidate. Known update targets include R13 delivery cues referring to old slide 3 for statistics and old slide 8 for both commitment and human-runtime pauses; those references must follow their new delivery positions. Source caveats, rollout limits and human feasibility require substantive review after editing; keyword presence alone is insufficient.

Unobserved: R14 source/diff/counts, any optional reading PDF, rendered layout, native slide interactions, rehearsal, delivery timing, device suitability, author approval, live issue/PR state and provider context internals. No merge, event selection, public release or acceptance checkbox change is authorized by this result. Preserve this first result intact; later candidate verification is a continuation with a pinned candidate packet and separate result.
