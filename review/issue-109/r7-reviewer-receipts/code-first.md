# R7 — independent Code / changed-artifact first result

## Verdict

**PASS for the bounded prepared R7 source/artifact change; no blocking code or changed-artifact findings identified.** This is not whole-package author acceptance, conference readiness, merge approval, or verification of every external gate. The requested swap is implemented as source order **1, 2, 4, 3, 5, 6, 7, 8, 9**, with synchronized slide numbers and attached notes and no observed content/layout mutation outside those labels.

The narrative order is reasonable: source section 2 establishes whole-system overload; source section 4 makes the review/understanding/ownership mechanism concrete; source section 3 then examines qualified empirical signals; section 5 turns to responses. I read the actual four spoken sections in this order. Their wording does not require a new spoken transition. The studies remain qualified and should not be represented as measuring the conceptual lifecycle curve. The two less-immediate reference-note transitions are accurately disclosed in the R7 README and remain outside the spoken script. Preserving them meets the explicit no-rewrite boundary.

## Identity and independence

- Role/handle: distinct nonauthor Code / changed-artifact reviewer, `/root/r7_code_review`; first judgment, before reconciliation.
- Launch as reported in the assignment: explicit `fork_turns="none"`; model and reasoning-effort overrides omitted. The parent launch receipt is the authority for actual requested/accepted parameters; it was not independently available inside this reviewer turn. Provider model/context internals and undisclosed platform history injection are unknown. The received conversation contains the task and shared platform instructions; no author conversation or current peer verdict was supplied or consumed.
- Read only supplied sources and necessary repository contracts/dependencies. Did not read MEMORY, requirements-preflight content, current peer reports, private history, or parent scratch notes. No delegation, implementation edits, external service writes, or repository writes. This report is the only file written by the reviewer.
- Repository base/observed HEAD: `75ca39219685dc279ec8301ed7602d4769201b3f`. This is a **prepared staged subset in an intentionally dirty checkout**, not a clean candidate commit.
- Packet: `review/issue-109/r7-reviewer-receipts/final-candidate-packet.json`; independently verified SHA-256 `5d5d4d4e48626c67b8c6efff066309c61b590bf20c8c9d019db3eaae936abc92`. Every listed file's byte count and SHA-256 matched.
- Common prompt: `agents/reviewers/README.md`; verified SHA-256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt: `agents/reviewers/code-review.md`; verified SHA-256 `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.
- Primary request: `review/issue-109/r7-reviewer-receipts/request.md`; SHA-256 `61ec228672cdc8717c2769f7338f49b0c05c9b890a2b8a37f096cfecea26e0e3`, verified with the packet.
- Prepared source diff: `review/issue-109/r7-reviewer-receipts/prepared-source.diff.txt`; SHA-256 `0c88a15e2dcf44192d32ed320d4bfcd9f2774fa4cf60c9b61f2f25d907ceca73`. Independently regenerated the ordinary staged diff for the ten declared authored paths and matched all 123,113 bytes. Native binary content was inspected directly, not inferred from the textual diff.

## Six focused cases actually examined

### 1. Source binding and immutable predecessor — pass

Independently hashed packet sources and compared the working R6 PPTX, PDF, notes, edition manifest and standalone R13 script against `git show` at the supplied base. All five retained sources are byte-identical to that commit. The current HEAD matches the base. Packet SHA and prompt identities match the assignment. No clean-checkout or committed-R7 claim is made.

Relevant requirements: AC01, AC02, AC04, AC05; presentation versioning and source-binding contracts.

### 2. Helper/recipe and bounded failure behavior — no blocking issue found by inspection

Read all of `tools/presentations/reorder_native_slides.py`, the R7 recipe, and the imported `require`, `digest`, namespace and `relationships` definitions in `tools/presentations/integrate_native_slide.py`. Read applicable CS01/02/04/05/08 rules and the iteration contract. The helper keeps active implementation under `tools/presentations`, reuses the existing relationship owner, and pins input bytes and source order. It validates a complete integer permutation, exact moved-footer coverage and shape text, one attached note per moved slide, unique ZIP names, ZIP integrity, replacement overlap, retained inventory, actual replacement bytes and source stability. Exclusive creation refuses existing output. The documented partial-output-on-interruption limitation matches the implementation; atomic promotion is not claimed.

The recipe names the actual source parts, hash and shape IDs. Exact current-output comparison below independently supports its intended effect. The supplied `helper-checks.json` describes useful negative cases (wrong hash, duplicate order, wrong source order/footer and existing output), but I did **not** rerun those tests or treat the receipt alone as proof. No new tests were authored. No unsupported generic-PPTX compatibility is inferred from this pinned-package review.

Relevant requirements: AC02, AC04, AC09, GENERATION-PROOF; CS01/04/05/08.

### 3. Actual native package and payload changes — pass

Read both native ZIP packages directly. Both contain the same 58 members in the same inventory order. Exactly five payloads differ:

- `ppt/presentation.xml`: parsed relationship IDs resolve to slide parts 1, 2, 4, 3, 5, 6, 7, 8, 9.
- `ppt/slides/slide3.xml`: exact sole changed byte region is footer text `03` to `04`.
- `ppt/slides/slide4.xml`: exact sole changed byte region is footer text `04` to `03`.
- `ppt/notesSlides/notesSlide3.xml`: exact sole changed byte region is `R13 STAGE SCRIPT | SLIDE 03 |` to `... SLIDE 04 |`.
- `ppt/notesSlides/notesSlide4.xml`: exact sole changed byte region is `R13 STAGE SCRIPT | SLIDE 04 |` to `... SLIDE 03 |`.

The other 53 payloads are identical, including every relationship part, media, other slide and notes payload. Thus existing layout and spoken/reference wording are preserved at native-source level. The attachment relationships are unchanged while delivery order changes. Native output SHA-256: `ec8478a8c55d7db17a922e761a137759cb4c2de86b135f9153b709f76c7a9b29`.

Relevant requirements: AC01, AC02, AC13, AC14; GENERATION-PROOF.

### 4. Notes correspondence and spoken continuity — pass

Extracted native note paragraphs independently with ElementTree, mapped them using the requested source order, and compared every one of the nine Markdown sections against the matching attached note. All nine wording comparisons pass after removing the Markdown wrapper headings and formatting-only blank lines. Native comparison in case 3 separately establishes exact source wording preservation, including nonspoken references. Read all spoken text for source sections 2, 4, 3 and 5 to assess the new sequence; the assessment above follows those actual sections.

Relevant requirements: AC01, AC02, AC13, AC14; the user's explicit preservation and narrative-assessment request.

### 5. PDF correspondence — pass within text/link scope

Opened the actual R6 and R7 PDFs with PyMuPDF. Each contains nine pages. For all nine mapped pages, extracted text is identical after the two authorized footer substitutions; the URI-link lists also match. R7 PDF SHA-256: `7056f7423652563aaeafe722a22ab6b139e77c4e630710dd90eaf02aa59d8517`.

This directly supports order/content/link correspondence. I did not reproduce LibreOffice export, render/raster comparison, QR decoding, PowerPoint UI behavior or physical projection. The manifest's precise raster-difference counts and finalization/tool-version claims remain supplied evidence claims, not independently repeated observations by this role.

Relevant requirements: AC02, AC04; ARTIFACT-REVIEW and GENERATION-PROOF, limited as stated.

### 6. Manifest, policy and editorial ownership — pass

Read R7 edition manifest and README, current package README and plan amendment, versioning contract, and source differences for acceptance policy. Compared base/current policy structurally: all 19 criterion IDs are retained; check and gate ID inventories are retained; criterion check/gate memberships are unchanged. The changed intent is the current R7 package and authorized source mapping. AC13/SLIDE-03-ACCEPTANCE follow evidence content to R7 S04; AC14/SLIDE-04-ACCEPTANCE follow ownership content to R7 S03. This follows content identity and retains prior approval only for its approved content. Generation, rights, human, rehearsal/device, delivery and release obligations remain explicit. R7 is marked author-review draft, predecessor R6 is pinned and event selection remains separately reported as R3. No source change in the reviewed subset selects/publishes an event or asserts whole-R7 author approval.

Actual candidate binary and notes hashes agree with the manifest. The new helper and recipe are identified, historical R13 identity is retained, and reproduction instructions state the helper's non-atomic-output limitation. Existing evidence gates remain manual/deferred where appropriate; a reusable CI test suite for the reorder helper is not claimed or newly required by this narrow review.

Relevant requirements: AC04, AC05, AC06, AC08, AC09, AC13, AC14 and the immutable-edition contract.

## Findings and evidence questions

**Blocking findings: none within this bounded code/artifact scope. Nonblocking implementation findings: none.** Examined risks include wrong native order, unintended graphic/text mutation, detached or stale notes, unsynchronized footer labels, predecessor overwrites, stale artifact hashes, approval transferred by numeric position, unsupported finality, and helper output overwrites.

Remaining evidence limits are the unobserved human/export/rendering surfaces listed above and final committed delivery. This role does not close those gates, prove all four reviewer executions, verify live PR/Draft state or establish provider isolation beyond the reported launch. The orchestrator must bind this result to its actual launch receipt and recheck reviewed source hashes before later acceptance.

## Check accounting and limits

Read-only, focused local review; no broad website/test campaign. Six risk cases were used. An initial generic whole-XML SequenceMatcher diagnostic was interrupted because it was too slow; it produced no conclusion and was replaced by direct equality plus exact first/last-difference checks. An initial Markdown raw-string comparison exposed formatting separators, so wording was compared after explicit wrapper/blank-line normalization while exact native bytes remained separately checked. A policy-inspection script initially assumed check/gate lists; its type error was corrected to handle the actual dictionaries before completing those comparisons. A binary-patch diff was initially compared to the ordinary-text packet; comparison using the packet's ordinary diff representation then matched exactly. These diagnostic issues are not candidate failures and are not counted as successful tests.

This first result stands independently and is preserved for reconciliation. No peer conclusion was used as an oracle.
