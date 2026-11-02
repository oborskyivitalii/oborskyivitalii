# Issue109 — 2 November 2026 — R14 concise speech alignment

Owner: [issue109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109).
Execution: existing [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).
Base: `6bd9e990251a6211f56ce6ba424960fe24879a71`, complete retained R9 deck.
This record owns the speech-only delta. Exact delivered-commit check results
are recorded in the PR handoff after commit; no self-referential commit is invented here.

## Intent and scope

The [actual request](r14-input/request.md) asks to reorder the concise repository
speech to the changed slides and adjust only the relevant emphasis while keeping
the word budget. The dated amendment in `.github/acceptance/issue-109.json`
distinguishes new standalone speech R14 from immutable deck R9 and historical
speech R13. All 19 stable criterion IDs, check definitions and gate assignments
remain. The R13-preservation requirements continue to describe the R9 package;
the subsequent request authorizes the targeted standalone speech revision.

The R14 order relative to R13 is `1,2,4,3,5,6,8,7,9`. Current S01–S06 and S09
spoken bodies remain verbatim. Current S07/S08 are the only edited spoken bodies:
architecture, human dependency and commitment before runtime validation, human
response-capacity observation and intervention. Six research source bullets and
their qualifications remain exact. Prior generic delivery-rate recommendations
and their two guidance links are omitted with that nonspoken paragraph.

No slide, native note, event selection, site content, merge or release is changed.
R9 notes remain their preserved earlier speech plus references. The README and
R14 tell the speaker to use the standalone R14 for current concise delivery.
The previous all-nine visual-edit permission is labeled as the earlier R9 request
in MEMORY; it does not extend this speech-only amendment.

## Artifact identity and generation

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| R14 Markdown | 18,316 | `ea00d981ee541d9316b371da51d26184e1635baa006915c1b1598b2b53b95403` |
| R14 reading PDF | 72,406 | `f5170f11d8276c279f95be73c52e0ab8b530fbc14f7ba9e9f0fa3a862091230c` |

The PDF is generated directly from the Markdown using ReportLab with embedded
DejaVu Sans. Pages 1–9 each contain one complete slide's spoken body; pages 10–11
hold delivery guidance, source links and the change record, explicitly not spoken.
PyMuPDF rendered all 11 final pages for visual inspection. No presentation package
is regenerated, and no new active repository generator or test is introduced.

The [prepared candidate manifest](r14-input/candidate-manifest.json) pins the
speech, PDF, original sources, instructions and first integration candidate.
The later metadata manifest records the labeled prior-R9 permission. Historical
snapshots and first reviewer results remain immutable. Common/role prompts and
actual launch parameters are recorded in the launch receipt.

## Economy and acceptance mapping

The same regex `\b\w+(?:[-'’]\w+)*\b` counts only the nine spoken bodies:
R13 **1,552**, R14 **1,530**, delta **−22**. Headings, source text and delivery
notes are excluded. The seven unchanged blocks total 1,199; current S07/S08 total
331 against their baseline combined ceiling of 353. Number and acronym pronunciation
can take longer than one counted token. Timing is arithmetic, not measured rehearsal.

| Stable AC / risk | Bounded evidence and check | Remaining scope |
| --- | --- | --- |
| AC01, AC02, AC04 | Nine speech sections, actual R9 order, seven verbatim blocks, byte-preserved R13 and all 18 tracked R9 files | R14 is separate from retained native notes |
| AC03, AC05 | Four independent roles, source-bound packet/results, unchanged check/gate selectors; final BASIC, STYLE, CURRENT-RI and RI-CI run | Exact delivered commit report is linked in the PR |
| AC13, AC14 | Evidence is S04 and ownership S03; six source bullets/caveats remain exact | No fresh research validation is claimed |
| AC17 | S08 retains 196/3/1 veto, conditional shadow/canary, preventive controls, irreversible disclosure, human capacity, tested staffed fallback and pause | Real runtime behavior is not tested by editing prose |
| AC18 | S07 covers control loop, conditional people, full cost, simpler alternative, scope/R&D/no-go and evidence before budget | Diagram or speech alone cannot establish a project's feasibility |
| AC06 and other whole-issue human gates | No change to author/rights, timed rehearsal, device/projector/QR, event-selection or release requirements | Pending; neither math nor repository checks close them |
| AC07–AC12, AC15–AC16, AC19 | Unchanged R9/source evidence is reused only for unchanged scope | Existing limitations and pending decisions remain |

## Independent roles and handoff

Initial launches explicitly request `fork_turns="none"` with no model/effort
override. The returned task handle confirms launch acceptance, not provider
internals. Shared-file read restrictions are an operational boundary, not OS
isolation. Role continuations reuse only their own earlier findings and neutral
source bytes; no newly fresh context is claimed. First results are retained.

All four roles completed their substantive bounded inspections. Actual launch,
prompt, packet and result identities are retained in
[launch-and-results.json](r14-reviewer-receipts/launch-and-results.json).

| Role / separate task | Preserved result and scope | Finding disposition |
| --- | --- | --- |
| Requirements / `/root/r14_requirements` | [Preflight](r14-reviewer-receipts/requirements-preflight.md), [first candidate result](r14-reviewer-receipts/requirements-final-first.md), [metadata correction](r14-reviewer-receipts/requirements-metadata-correction.md) | Speech scope passed; prior-R9 permission label and missing review-owner link corrected and rechecked |
| Code / `/root/r14_code` | [First artifact result](r14-reviewer-receipts/code-first.md) | No blocking findings in script, PDF text, source preservation or primary integration owners |
| White-box / `/root/r14_whitebox` | [Baseline](r14-reviewer-receipts/whitebox-baseline.md), [first completed candidate result](r14-reviewer-receipts/whitebox-final-first.md) | Same-tokenizer counts, verbatim mapping, all original bytes, research bullets/links and exact spoken PDF page text verified |
| Exploratory / `/root/r14_exploratory` | [First result](r14-reviewer-receipts/exploratory-first.md) | Flow and all 11 individual PDF pages inspected; fresh renders pixel-match supplied pages; no clipping, overlap or unreadable text |

The final catalog/RI/coupling refresh and verbatim receipt assembly do not change
speech meaning. Existing policy selectors BASIC, STYLE, CURRENT-RI and RI-CI
remain the final exact-clean-commit gate; the resulting report, source commit,
tree and policy digest are recorded in the PR handoff. The first RI regression campaign executed 29 tests: 27 passed and two real-repo
adapter checks errored because their newly created output log was not yet in the
path catalog. The [original log](r14-reviewer-receipts/ri-regressions-precommit.log)
and [diagnosis](r14-reviewer-receipts/ri-log-diagnosis.json) are retained. The log
was cataloged, and those two selectors were rechecked with output outside the
checkout. The owner check passed; the context-query selector still errored because
generated RI had not been rebuilt after the catalog correction. That
[second result](r14-reviewer-receipts/ri-recheck.log) remains intact. The next
bounded action rebuilt current RI and reran only the query/context selector;
[it passed](r14-reviewer-receipts/ri-context-recheck-passed.log), including all ten
context subprocesses. This closes the two affected selectors without rerunning
the 27 unchanged passing cases. The final copied receipts are cataloged and RI
is regenerated again before exact-source acceptance.
Tests, producer, budgets and original failed evidence are unchanged. No new tests are introduced
for this prose revision, and no hosted/site campaign is selected.

## Decisions and delivery

The current deliverable is speech R14 paired with deck R9, within the existing
issue109 / Draft PR110. R13 and all historical deck editions are preserved.
The event record continues to select R3; author approval of exact R14 delivery,
English rehearsal and physical presenting-device acceptance remain pending.
The final PR and issue handoff will identify the actual committed source and
bounded check outcomes. A green local check does not establish GitHub CI or release.
