# R14 Requirements & Acceptance — first preflight

Date: 2026-11-02. Role/task handle: `/root/r14_requirements`. Phase: first independent preflight, before dependent implementation. Scope: speech-only R14 alignment for issue 109 / Draft PR 110, base `6bd9e990251a6211f56ce6ba424960fe24879a71`.

## Verdict

The supplied speech request is sufficiently bounded for implementation. No substantive content or word-budget prerequisite is unresolved. Final requirements acceptance remains pending the actual R14 candidate, its diff, source-bound checks and the orchestrator’s launch evidence. The existing issue policy needs an explicit dated speech-only delta before it can truthfully describe final R14 acceptance; it currently describes R9 and preserved R13 wording.

This is not whole-issue acceptance, deck approval, measured rehearsal, device acceptance, event selection or release authorization.

## Inspected identities and boundaries

- Packet: `review/issue-109/r14-input/preflight-manifest.json`, SHA-256 `5a51538e7795d95e66c45bc0c30d146446e8f1590922ac09b3d9ede51f2d754e`. Every listed path matched both its byte size and SHA-256 when read.
- Common contract SHA-256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt SHA-256: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`.
- Request SHA-256: `942ea424d158d741b2814bfd71e6956ab4e676c69d63ece1d32a81e0db00c479`.
- Original R13 SHA-256: `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.
- Native R9 SHA-256: `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1`; PDF SHA-256: `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277`; notes SHA-256: `eadb088b9121685023c3f96e346ae6d215170b90f89803310b8a2455c9828db2`.
- Read the actual R13 text, R9 notes, native presentation relationship order and native visible text, root AGENTS, CONTRIBUTING review/acceptance sections, presentation-versioning contract, issue-109 acceptance policy and necessary `.github/ACCEPTANCE.md` owner. No nested AGENTS was returned for the scoped directories.
- Did not read current peer findings, parent scratch notes, unrelated memory or private history. Read-only filename discovery exposed historical file paths, not their contents. No implementation/test authoring, tests, external writes or delegation occurred. The only written artifact is this receipt.
- The task arrived without author conversation. Actual spawn parameters and accepted tool response are not visible to this reviewer and must be recorded by the orchestrator. Provider model/context internals and memory behavior remain unknown; shared filesystem access is an operational reading boundary, not OS isolation or provider attestation.

## Findings and treatments

### RA-P01 — Medium: existing policy does not yet express the speech-only delta

Evidence: `.github/acceptance/issue-109.json` AC01/AC02 and repeated `automated_scope` text require preserved R13 spoken wording and describe current R9; AC04 describes the R9 package. The new request explicitly authorizes editing new S07/S08 bodies and a standalone R14 script while preserving R13 and the complete R9 package. AC06/AC08 preserve separate author/device/event gates.

Implication: mechanically carrying the old policy’s preserved-wording language into a claim that all current speech criteria pass would be inaccurate. It could also accidentally imply that native notes must be rewritten, contrary to this request’s immutability boundary.

Treatment: append a dated speech-only acceptance mapping with the existing stable AC IDs, identifying R14 as the standalone delivery script and R9 attached notes as preserved historical package content. Preserve all unobserved human gates. The new request resolves editing authority; no additional owner decision is needed to begin this bounded work. Recheck the actual delta before final acceptance.

### RA-P02 — Admission evidence pending, not an observed isolation failure

Evidence: the common launch contract requires explicit `fork_turns="none"` and a source-bound accepted launch receipt. This reviewer cannot inspect its parent’s tool-call parameters from the supplied packet.

Treatment: the orchestrator must attach the actual launch parameters, accepted response/task handle and requested-versus-observed limits before claiming this role’s acceptance. Do not claim provider internals were verified. If the launch was not explicitly none-fork, this first judgment cannot supply the required fresh-review gate.

### No substantive prerequisite defect in order, feasibility or baseline

The native PPTX’s presentation relationships, not numeric slide XML filenames, establish delivery order `[1,2,4,3,5,6,8,7,9]`. Native visible text independently confirms ownership before evidence and architecture/project commitment before runtime. The original script includes enough material for both revised bodies without new research. Its runtime-human-capacity paragraphs currently sit in R13 S08; they can move to R14 S08 while design-time human dependency remains in R14 S07.

The stated 1,552 baseline is reproducible. Whitespace splitting gives a different count and must not silently replace the reproduced method.

## Bounded acceptance mapping

| Intent / stable linkage | Required observable result | Check or owner gate | Preflight observation |
| --- | --- | --- | --- |
| Speech order; AC01/AC02 | Nine speech bodies follow R13 source positions 1,2,4,3,5,6,8,7,9 | Read native presentation relationship order and compare R14 headings/body mapping | R9 order confirmed from native PPTX and notes; R14 pending |
| Minimal changes; AC02, AC11–AC16, AC19 | R14 S01/S02/S03/S04/S05/S06/S09 bodies equal R13 S01/S02/S04/S03/S05/S06/S09 verbatim | Exact body comparison with headings and nonspoken matter excluded; inspect full diff | Original seven bodies inspected; candidate pending |
| Architecture; AC18 | S07 explains controls, human dependency where needed, full cost/project viability, and evidence before committing the delivery budget; bounded discovery/narrowing/redesign/no-go remain legitimate | Read against actual R9 delivery S07 visible loop and qualification notes | R9 has sensors, controller, actuators, controlled system, constraints and feedback; successful demo is capability evidence but insufficient alone |
| Runtime; AC17 | S08 retains illustrative 196/3/1 and forbidden-outcome veto, evaluates before conditional exposure, monitors behavior/controls and human response capacity, and retains intervention | Read against actual R9 S08 and original speech; check average-versus-prohibited-outcome distinction | Original numerical example and caveats are present; runtime capacity material available for relocation |
| Human fallback; AC17/AC18 | Qualified, informed, authorized people can respond in time; online status alone is insufficient; tested fallback or reduced authority/stop remains available | Substantive content review, not keyword presence | Explicitly required by R9 notes and visible runtime slide |
| Word ceiling; AC01/AC06 planning subcondition | R14 spoken bodies total at most 1,552 under the same tokenization and body extraction as R13 | Reproducible count of only S01–S09 bodies; record per-slide and total values | R13 counts reproduced below; candidate pending |
| Scientific caveats; AC12–AC17 | Preserve source qualifications, observational/causal distinctions, research limitations, forbidden-outcome veto and prevention/rollback limits | Compare seven unchanged bodies, revised S07/S08 and six nonspoken research references | R13 caveats inspected; no new research needed |
| Nonspoken metadata; AC01/AC05 | R14 version, deck mapping, source section, pause cues and internal slide references all match the new order | Read all metadata and cues; verify old evidence S03 becomes S04 and old architecture S08 becomes S07 | Original cues require remapping; operator-at-runtime cue belongs with new S08 |
| Immutable historical sources; AC02/AC04 | R13 and every R9 package file remain byte-identical; R14 is a standalone speech artifact | Compare original and final hashes / exact diff, using complete package scope | Packet’s named R13/R9 bytes matched; final complete-package check pending |
| Timing and delivery; AC06/AC08 | Timing remains arithmetic planning, no rehearsed claim; author/device/event/release gates remain pending | Arithmetic check and actual owner approval records | No timed English rehearsal or device observation supplied |
| Review and repository handoff; AC03/AC05 | Four distinct source-bound role results and required exact-source repository evidence; preserve stable IDs and truthful gate state | Existing CONTRIBUTING and acceptance policy gates | This is one preflight result only; no other role outcome inferred |

## Reproduced word-count oracle

Use Python regex `\b\w+(?:['’\-]\w+)*\b` on each spoken body only, excluding its `## Slide NN` heading and stopping before the next level-two heading. The separator after S09 contributes zero tokens. Contractions and hyphenated compounds count as one token; punctuation separates numeric components. This definition reproduces 1,552 without changing the source. An equivalent ASCII-alphanumeric pattern also produced the same baseline on these English bodies.

| R13 slide | Words | R14 destination |
| --- | ---: | --- |
| 01 | 153 | 01 unchanged |
| 02 | 214 | 02 unchanged |
| 03 | 168 | 04 unchanged |
| 04 | 166 | 03 unchanged |
| 05 | 146 | 05 unchanged |
| 06 | 183 | 06 unchanged |
| 07 | 115 | 08 revised |
| 08 | 238 | 07 revised |
| 09 | 169 | 09 unchanged |
| Total | 1552 | At most 1552 |

The seven untouched bodies total 1,199, leaving at most 353 words jointly for revised S07/S08. This is a combined budget, not a requirement to keep either changed slide’s old individual count. Timing must derive from the actual final total; preserve explicit distinction between speech-rate scenarios and a measured rehearsal, and do not add pause allowances twice.

## Check limits and next gate

Native text/relationship inspection and body counting were read-only inspections, not test-suite execution, visual rendering, live-state verification or measured timing. A first extraction attempt wrongly prefixed an already absolute PPTX relationship path (`ppt//ppt/...`); the diagnostic identified that path-normalization error. A corrected read stripped the leading slash and successfully resolved all nine actual ordered parts. This was an inspection-helper error, not a deck defect.

Final continuation should inspect the candidate manifest/diff, seven exact-body comparisons, revised S07/S08 meaning and total, all nonspoken remapping, preserved R13/R9 bytes, any optional reading-PDF readability evidence, and dated policy linkage. A speech revision alone does not require a new presentation edition or edits to R9’s immutable native notes. No new external research, deck rendering campaign or whole-issue completion claim is supplied by this preflight.
