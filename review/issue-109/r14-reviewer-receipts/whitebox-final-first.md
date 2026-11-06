# White-box QA — first completed R14 candidate result

Date: 2026-11-02. Reviewer/task: `/root/r14_whitebox`. **Continuation of this role's own baseline execution, not a fresh independent context.** The original `whitebox-baseline.md` is preserved unchanged. No peer results or parent scratch notes were read. Actual candidate bytes and permitted source/authority records, including the candidate diff, were the oracles; candidate claims were independently checked.

## Verdict

**PASS within the bounded speech-content and PDF-text scope; no blocking findings.** The standalone script has **1530 spoken words**, **22 fewer than the reproduced 1552-word R13 baseline**. All seven protected bodies remain byte-equal in the required mapping. All nine spoken PDF pages correspond exactly to the script after display-whitespace normalization and removal/accounting of their known nonspoken headings and page furniture. Meaningful architecture, runtime, research-caveat and human-response invariants are retained.

This result does not establish visual-layout acceptance, rehearsal, device compatibility, whole-deck author approval, release readiness or completion of other roles/checks. It does not authorize changing the unchanged R9 package or its native notes.

## Inspected identity and boundaries

- Base: `6bd9e990251a6211f56ce6ba424960fe24879a71`.
- Candidate manifest: `review/issue-109/r14-input/candidate-manifest.json`; SHA-256 `56f4b69d2566cb2a7fc12925a4247a0d2e3b755f4feb13b1ce62759164ce2abb`.
- Actual diff SHA-256: `b1cbb5b3946082d495ec5e54ec19869ac5ea6d7ef42132761ba098a9774f7eea`.
- R14 Markdown: `ea00d981ee541d9316b371da51d26184e1635baa006915c1b1598b2b53b95403`.
- R14 PDF: `f5170f11d8276c279f95be73c52e0ab8b530fbc14f7ba9e9f0fa3a862091230c`.
- Common prompt: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- White-box prompt: `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- Request: `942ea424d158d741b2814bfd71e6956ab4e676c69d63ece1d32a81e0db00c479`.

All 18 manifest file size/hash pairs matched on initial inspection and again immediately before this receipt. Hashing a listed memory file for packet integrity is not treating its narrative as an oracle. The initial native-order/slide-content inspection is reused because exact R9 bytes were reverified. No implementation, repository test execution/authoring, external writes or delegation occurred. Only this assigned receipt was written. Shared filesystem boundaries remain operational; parent launch tool parameters and provider-internal context are not independently observable in this execution.

## Word and preservation checks

Same Python tokenization as the baseline:

```python
r"\b\w+(?:['’\-]\w+)*\b"
```

Bodies are the text after each `## Slide NN` heading until the next level-two heading, excluding boundary blank lines and a terminal Markdown horizontal rule. No internal text/paragraph normalization was applied for the seven-body UTF-8 byte comparison. Headers, delivery notes, sources and revision commentary are not counted as speech.

| R14 slide | R13 source slide | R13 words | R14 words | Protected body equality |
| --- | --- | ---: | ---: | --- |
| 01 | 01 | 153 | 153 | Equal |
| 02 | 02 | 214 | 214 | Equal |
| 03 | 04 | 166 | 166 | Equal |
| 04 | 03 | 168 | 168 | Equal |
| 05 | 05 | 146 | 146 | Equal |
| 06 | 06 | 183 | 183 | Equal |
| 07 | 08 | 238 | 165 | Authorized targeted revision |
| 08 | 07 | 115 | 166 | Authorized targeted revision |
| 09 | 09 | 169 | 169 | Equal |
| **Total** | | **1552** | **1530** | **Seven of seven equal** |

Protected bodies total 1199; revised S07/S08 total 331 against a maximum of 353. The actual order matches [1,2,4,3,5,6,8,7,9]. Delivery cues and source navigation correctly place ownership on S03, evidence on S04, architecture/commitment on S07 and runtime on S08.

R13 SHA-256 remains `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`. Independently enumerated all **18 tracked files under R9** using `git ls-tree` at the pinned base, fetched each base blob with `git show`, and compared complete bytes to current files: **zero differences**. This is broader than checking only native PPTX/PDF/notes. It does not assert absence of unrelated changes elsewhere in the working tree.

## Risk / requirement → observed check

| Requirement / risk | Independent oracle and check | Result |
| --- | --- | --- |
| Request 1–2; AC01/02, AC13/14: wrong order or unauthorized rewriting | Baseline native relationship order plus exact mapped body comparisons | Pass, seven preserved bodies and correct nine-slide order |
| Request 4: inconsistent word accounting or overlong script | Same explicit regex and section boundaries for both source versions | Pass, 1552 → 1530; S07/S08 353 → 331 |
| Request 3; AC18: architecture loses commitment/control meaning | Read new S07 against native delivery S07 and original control material | Pass; loop observes outcomes, compares goals/limits, decides/intervenes and verifies correction; access/permissions outside model and text-disclosure risk remain |
| Request 3; AC18: human premise or project feasibility lost | Read S07 human/cost/commitment paragraphs | Pass; humans conditionally observe/decide with skills, workload, information, authority dependencies; full cost, simpler viable option, narrower scope, R&D and no-go remain; demo alone does not justify full funding |
| Request 3/5; AC17: score masks prohibited outcome or exposure becomes unconditional | Read S08 196/3/1 example and shadow/canary/rollback paragraph | Pass; 98% does not excuse privacy leak; redesign required; exposure remains conditional; preventive controls cannot be replaced; disclosure cannot be undone |
| Request 3/5; AC17: runtime supervision ignores human feasibility | Read S08 ongoing monitoring/intervention paragraphs | Pass; changing users/context/model can stale evidence; monitor outcomes, controls, qualified coverage, queues, workload, response time, information, authority and effective interventions; online presence alone is insufficient; reduce autonomy, tested/staffed fallback or pause |
| Request 5; AC13/14: empirical caveats or research URLs lost | Compare all six research-reference bullet lines as exact strings; inspect PDF annotation URI set | Pass; all six complete source/caveat lines byte-identical to R13, and six PDF link targets exactly match |
| PDF rendering text loses/repeats speech or mixes notes into speech | Poppler text extraction, full-page expected text comparison after whitespace normalization | Pass, all nine pages exact; 11 total pages; appendices explicitly nonspoken |
| Timing estimates misrepresented as rehearsal | Recalculate duration from 1530 tokens, inspect delivery notes and supplied issue/PR snapshots | Pass; 80/90/100/110/120 wpm gives 19:08/17:00/15:18/13:55/12:45 rounded to seconds; 2–3 minute additions correct; explicit scenario disclaimer retained |

The S07/S08 partition is coherent: S07 establishes architecture, human dependencies and the operating business case before budget commitment; S08 places observation of live human/control capacity and intervention with evaluation and continuing operation. No separate runtime-monitoring lecture remains in S07. Conditional human involvement and the option not to proceed survive the compression.

## PDF correspondence and appendix boundary

Poppler `pdftotext <candidate.pdf> -` returned 11 pages. For each of pages 1–9, the independently constructed expected page comprised the fixed document header, numbered slide label, corresponding Markdown heading, the talk subtitle on page 1 only, exact spoken body, presenter/date footer, and `STAGE TEXT | N`. Comparing the entire extracted page using only `re.sub(r"\s+", " ", text).strip()` returned:

`[(1, True), (2, True), (3, True), (4, True), (5, True), (6, True), (7, True), (8, True), (9, True)]`.

Thus this check detects extra or missing text within the complete page, rather than merely locating an expected body substring. No punctuation replacement or sentence normalization was needed. Pages 10–11 use `NOT SPOKEN` footers; headings explicitly say “Delivery notes - not spoken” and “Sources - not spoken”. The revision section is marked “не для сцени”. PDF pypdf annotation inspection found exactly six research URLs matching the Markdown source links. This is text/link correspondence, not proof of unclipped visual presentation.

## Nonblocking observations and execution accounting

Two R13 delivery-rate guidance links (Trent and Kent) are absent in R14, along with the paragraph making their respective rate recommendations. The six research references and all their caveats are retained exactly. This does not leave those deleted guidance claims unattributed, since the claims are removed too; it is recorded explicitly rather than describing every historical URL as preserved. The new delivery notes use rate scenarios and retain the unmeasured-rehearsal qualification. The 23-minute speaking plus 7-minute Q&A limit is supported by the supplied issue/PR snapshots, not invented by the candidate.

First combined extraction command (tool chunk `f545b2`) successfully produced manifest matches, word counts, all seven equality results, revised bodies and source-line equality, then stopped with exit 1: `NameError: name 'Path' is not defined` in the unfinished R9 byte-comparison loop. This was a reviewer command import-name error, not a candidate defect. The failure was retained; no all-success claim was made for that command. A targeted corrected check imported `Path` and completed only the unfinished package comparison plus PDF extraction (chunk `984901`, exit 0): 18 R9 files, zero differences, 11 PDF pages. The following comparison/annotation/timing command (chunk `07eeff`, exit 0) returned nine exact page matches, six exact research link targets and the timing results above. No signals occurred. Final packet integrity recheck returned no mismatches.

Checks are retained bounded manual/source-extraction evidence under this issue and SITE-CHECK-PROFILES, not automated branch-coverage measurements. No new dynamic/UI behavior exists in this prose change. Unobserved gates remain visual review, real delivery/rehearsal/device acceptance, live external issue/PR state, final catalog/RI integration, other required reviewer results and provider-internal launch/context assurance. Any later change to relevant candidate bytes requires affected re-review; deterministic receipt/catalog integration must not silently change the reviewed script/PDF.
