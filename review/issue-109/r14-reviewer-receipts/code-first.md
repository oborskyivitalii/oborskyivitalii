# R14 first independent Code / changed-artifact review

Date: 2026-11-02. Reviewer task: `/root/r14_code`. Owner: issue109 / Draft PR110.
Base: `6bd9e990251a6211f56ce6ba424960fe24879a71`.

## Verdict

No blocking changed-artifact finding in the inspected R14 script, reading PDF,
source-preservation boundary or current README/policy/MEMORY linkage. The speech
matches the requested R9 sequence, preserves the seven unaffected spoken bodies,
and remains below the reproduced R13 word budget. This is a bounded artifact
review, not whole-AC acceptance, final policy execution, rehearsal, device,
rights, merge, event-selection or release approval.

## Source identity and independent boundary

Inspected the native working repository and its dirty prepared candidate; this
was not represented as a clean candidate commit. Read the request, supplied
primary-source manifest/diff, original issue snapshot, actual R13/R14 text,
actual R9 PDF text and retained native-package bytes, applicable instructions,
acceptance contract and changed metadata. Candidate statements were checked
against source bytes and content rather than accepted as proof.

| Input | SHA-256 |
| --- | --- |
| `r14-input/metadata-candidate-manifest.json` | `4c37cb969affc65d4b3875abef6e2c3514b932fb7798edd5bec65c4f6a814744` |
| `r14-input/metadata-candidate.diff` | `0369aa4fd18972bc3e162a3d2f1b6628cb6dde385a84ac39ed25e41eebe2d989` |
| `r14-input/request.md` | `942ea424d158d741b2814bfd71e6956ab4e676c69d63ece1d32a81e0db00c479` |
| `agents/reviewers/README.md` | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| `agents/reviewers/code-review.md` | `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697` |
| R13 script | `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84` |
| R14 script | `ea00d981ee541d9316b371da51d26184e1635baa006915c1b1598b2b53b95403` |
| R14 PDF | `f5170f11d8276c279f95be73c52e0ab8b530fbc14f7ba9e9f0fa3a862091230c` |
| R9 PDF | `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277` |
| R9 PPTX | `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1` |
| `.github/acceptance/issue-109.json` | `994a5915c703bd212108d5c256de2e7beaa3dee29b9566ee5ba7ff36a4b78e82` |
| `drafts/devcon-romania-2026/README.md` | `20bff8c8da72420163dd8fd23980ff2f1c39f0b47e9a393030838f1f89e71200` |
| `MEMORY.md` | `507f05af9f0e64a98c44cc55a1d249143cc19edbd14d26bc889317030c327300` |

Common/role prompts and all other listed primary-file identities checked during
this review matched the supplied manifest. Current peer output files, parent
scratch notes, unrelated memory and chat history were not read. The supplied
review-owner file was hashed, not used as evidence for its authored conclusions.
This reviewer did not implement changes, author tests, call external services or
delegate. Only this receipt was written. Shared-filesystem reading discipline is
not OS isolation. Actual parent launch arguments/accepted execution receipt must
be recorded by the orchestrator; provider model and context internals are unknown.

## Actual observations and requirement impact

1. **Minimal spoken scope — AC01/AC02 and speech amendment.** Parsed only the nine
   `Slide` sections and compared their body text after removing surrounding
   section whitespace and the newly added Markdown separators. R14→R13 mappings
   `1→1`, `2→2`, `3→4`, `4→3`, `5→5`, `6→6`, `9→9` are exact matches. The relevant
   script diff confines substantive spoken edits to current S07/S08. Header,
   delivery-cue and source-navigation edits follow the new slide positions.

2. **Word budget — AC01/AC06.** Independently applied the documented expression
   `\b\w+(?:[-'’]\w+)*\b` to those spoken bodies only: R13 **1,552**, R14 **1,530**,
   a reduction of **22**. Headings, separators, notes and sources were excluded.
   The timing table is consistent with the stated word count and rounded rate
   arithmetic. It explicitly calls these scenarios rather than measured delivery.

3. **Planning/runtime correspondence — AC17/AC18.** Read actual R9 PDF pages 7/8
   and R14 S07/S08. S07 explains observation, comparison, intervention and verifying
   correction; permissions outside the model; conditional human dependence; full
   operating cost; simpler alternatives; feasibility/R&D/no-go; and evidence
   before the full-development commitment. S08 retains the 196/3/1 example,
   disqualifying disclosure despite 98% acceptable, changing production evidence,
   conditional exposure, preventive controls and irreversible disclosure. It
   places capacity monitoring, authority and effective interventions in operation,
   ending with reduced autonomy, a tested and staffed fallback, or pause. These
   meanings correspond to the actual retained slide emphasis.

4. **Qualified claims — AC02/AC13/AC14/AC17.** The evidence and ownership spoken
   bodies remain verbatim in their new positions. Their population, sample,
   elapsed-time, vendor, noncausal and individual-versus-team limits survive.
   All six research entries retain their qualifications. The edit introduces no
   claimed new research validation. The planning/runtime edits do not imply that
   average success, rollback, canary or mere operator availability guarantee safe
   operation. Human fallback now explicitly requires staffing.

5. **Historical preservation — AC02/AC04.** Compared all 19 base-tracked paths
   comprising the R9 package and standalone R13 Markdown against `git show` of
   the supplied base: no byte changes. The R9 PPTX, PDF and notes remain present.
   Existing notes are deliberately historical and are clearly distinguished from
   current R14 delivery in the edition README and MEMORY.

6. **Reading-PDF content — AC01/AC04.** `pdfinfo` reports 11 A4 pages. Read extracted
   page text: pages 1–9 begin with their corresponding slide labels and titles;
   page 10 is nonspoken delivery notes and page 11 nonspoken sources. Every R14
   spoken body occurs completely in PDF extraction after whitespace normalization.
   This checks textual inclusion and sequence, not raster layout or actual
   presentation-device behavior.

7. **Metadata and gates — AC03/AC05.** Compared parsed base/candidate acceptance
   JSON. Only `automated_scope` fields for AC01–AC06, AC13/14 and AC17/18 change;
   existing IDs, intent fields, check registries and gate assignments do not.
   The dated amendment describes the new speech permission without rewriting
   native notes. README links current R14 and the existing review owner. MEMORY
   identifies the earlier all-nine visual permission as R9 history, describes the
   present speech request, and preserves pending author/rehearsal/device and
   selection boundaries. These are consistent with the request.

## Applicable style and architecture assessment

- **CS01/CS04:** editorial sources remain under `drafts/`, evidence under `review/`,
  acceptance in its existing owner. No new active runtime/build code or competing
  runtime registry appears in this candidate. Historical notes are labeled rather
  than silently made another current editing authority.
- **CS05:** the four touched text owners checked here decode as UTF-8, contain LF
  rather than CRLF, and end with a newline. JSON remains structured/readable;
  the change does not introduce a broad formatting rewrite.
- **CS08/CS09/CS10:** this review does not claim the style guard, Basic, RI or policy
  runner passed. Existing mapped checks and human review gates remain intact.
  Catalog/RI and final exact-source receipts are pending orchestrator finalization.
  Artifact comparisons here are bounded inspection, not a new regression suite.
- **CS02/CS03/CS06/CS07:** no new template, CSS, browser lifecycle, runtime state,
  performance behavior or resource budget changes require a runtime review in
  this speech-only delta. No website matrix or deck redesign replay was performed.

## Findings, evidence limits and disposition

**Blocking findings:** none in the inspected source/artifact delta.

**Nonblocking corrections required:** none identified.

**Remaining gates:** final source-bound policy/check execution, catalog/RI
finalization and the other independent roles are not established by this receipt.
The PDF was text-inspected, not rendered visually by this reviewer. Native
Presenter View, actual device/projection, timed rehearsal and author's acceptance
were not observed. This pass preserves existing source qualifications; it does
not independently revalidate the research literature or rights decisions.
Live GitHub state was not queried; supplied issue/PR snapshots are dated inputs.
Any relevant candidate byte changes require reconciliation against these hashes.
