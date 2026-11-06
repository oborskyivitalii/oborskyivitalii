# R6 White-box QA — first independent result

## Verdict and scope

**No blocking implementation or artifact-preservation defect found in this prepared subset.** The exact source and approved donor reproduce the candidate R6 PPTX byte for byte. Only slide 4 and its notes payload change; every other package payload remains byte-identical. The bounded failure checks substantiate rejection of the tested unsupported inputs and refusal to overwrite outputs. This is a first result, preserved before reconciliation; it is not full-edition acceptance or permission to merge, select the event artifact, or publish.

The campaign used **12 logical cases**, with one retained invalid fault-injection attempt and one targeted diagnostic correction within case 12. The initial harness reports 11 passing case assertions and one failing assertion; the failure was caused by targeting an unused donor theme, not by a product defect. The diagnosis and subsequent linked-theme rejection are recorded separately. No failed evidence was overwritten, and no unchanged campaign was rerun.

Package/index/edition metadata being completed separately is excluded. No repository implementation or accepted tests were changed. Writes were limited to this assigned result and `/workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/`. No external writes, websites suites, recursive delegation, peer outputs, private author history or MEMORY were used. The supplied historical issue contains earlier claims; these were treated as review subjects, not test verdicts. Build-receipt claims were not used as an oracle.

## Execution and input identity

- Role: distinct nonauthor **White-box QA**, first phase.
- Task handle: `/root/r6_whitebox_review`.
- Launch supplied by orchestrator: actual `fork_turns="none"`, no model or reasoning-effort override. The orchestrator must retain its accepted launch-tool response alongside this result; this reviewer did not receive that response. Provider model/context/memory internals remain **unknown**. Shared filesystem and platform instructions are not isolated by this operational restriction.
- Repository: `oborskyivitalii/oborskyivitalii`; owner issue **109**, existing Draft PR **110**.
- Prepared subset, **not a clean Git checkout**. Recorded old PR head `327ec57d9c4b7539d83631204b91bdc36545c862`; main base `8cf15883125892710633b17133d9ee0fc4b23b92`.
- Common prompt: `agents/reviewers/README.md`, SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt: `agents/reviewers/white-box-qa.md`, SHA256 `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- CONTRIBUTING SHA256 `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442`.
- Original packet: `artifact-candidate-manifest.json`, SHA256 `c71edff082b7d03bf6df0164991931341ec9e4f17d6c2c5c8831003a074254b9`; all **39** referenced files matched recorded byte counts and hashes.
- Neutral packet supplement received before judgment: `artifact-candidate-manifest-v2.json`, SHA256 `9c5cd97fc8959e3c9110178c5813ecefa36ccff645119ef2789ea1fbda9f2687`; all **42** referenced files matched. It adds CODE-STYLE, SITE-CHECK-PROFILES and the standalone R13 stage script. Initial artifact/helper bytes are unchanged. No peer verdict was provided.
- Actual helper diff: `artifact-candidate.diff`, SHA256 `b03b99daf5b8019e050f374a31ed7869d65d4a3962c62a59d9582936175ab3df`; new 223-line helper. Native artifact changes were independently derived by ZIP payload comparison.
- Primary current request SHA256 `bcfb31ce2b64043f2af5b45f4dbc810fa0b1004cbd7820e053da515e29f76e21`; issue snapshot SHA256 `298caeaea01efa7b07d97fc7a05c61ec78dc3925e4dbbfef8b8aac2da3307b9e`.

### Inspected source identities

Paths below are relative to `/workspace/scratch/d8b65f68acc8/devcon-repo/`.

| Source | SHA256 |
| --- | --- |
| `tools/presentations/integrate_native_slide.py` | `3cae90c8b59665883c887f6df45459972b047e07387ea88baa2c6573e6fefe02` |
| `drafts/devcon-romania-2026/r6/sources/scratch-r13-native-full-deck.pptx` | `6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf` |
| `drafts/devcon-romania-2026/r6/sources/approved-slide-04-native.pptx` | `1741f44748706fae660f442636470c48223f721af567c83315c89e56a52d1c4c` |
| `drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pptx` | `fa461eadcf41cd314b6861be6968824545719254e5430f6de705a2071f8cbd94` |
| `drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pdf` | `2a8d7a63764b014dfc0fdbdf65562296d744f6c527ef1319a2f034465db9fa05` |
| `drafts/devcon-romania-2026/r6/speaker-notes.md` | `3772174bc7e27eb32339a43541cc17191c898bac710ec994ae9c8c30f1d86976` |

All six core source identities remained unchanged after the campaign. Relevant owners read include request/issue, common/role prompts, AGENTS and applicable CONTRIBUTING sections, presentation versioning, input provenance README, the helper and existing validator, and the test-allocation section in SITE-CHECK-PROFILES. Full nine-page PDF text was extracted and inspected; all native notes were parsed and compared to source, Markdown transcription and the standalone R13 speech material.

## Independently derived risk-to-case matrix

| Risk / requirement | Structural fault | Scenario and independent oracle | Cases / route |
| --- | --- | --- | --- |
| Exact-source evidence; current request / AC04–05 | Review stale or substituted bytes | Every declared path must match its packet hash and size; core source bytes must remain unchanged | 01; local bounded evidence |
| Preserve R13 and other slides; current request / AC02, AC04, AC11–19 | Graft modifies unrelated package payloads or becomes nondeterministic | Two integrations from the pinned source and donor must exactly equal candidate; only slide 4 and notes 4 may differ from source | 02–03; local component/CLI |
| Native notes and matching PDF; current request / AC04, AC09–10 | Script drift, lost notes, malformed package/rendition | Parse native XML and PDF, compare nine notes to source; ordered Markdown transcription must match native notes; all nine pages have text | 03; structural/manual evidence |
| Dependency closure / editable slide safety; AC04, AC09 | New media or external relationships survive without import | Add an internal image relation and an external hyperlink to scratch donors; reject before creating an output | 04–05; local CLI fault injection |
| Preserve complete speech; current request / AC14 | Donor rewrites original note text | Alter first original note text; reject and leave output absent | 06; local CLI fault injection |
| Output safety; bounded helper contract | Existing file or symlink overwritten | Pre-existing output and symlink target bytes must remain intact; CLI must refuse | 07–08; local CLI |
| Compatibility / bounded source selection; AC04, AC09 | Wrong size, ambiguous duplicate archive entry, invalid slide position | Alter `sldSz`, duplicate a ZIP member, select slide zero; each must reject without output | 09–11; local CLI fault injection |
| Shared layout/theme meaning; AC04, AC09 | Imported native slide inherits incompatible theme | Change the theme actually referenced by the shared master; reject rather than silently render differently | 12; local diagnostic, initial mis-target retained |

The repository search `rg -n 'integrate_native_slide|validate_edition' tests tools/quality .github/workflows .github/acceptance/issue-109.json` found the policy reference to the edition validator and no dedicated helper test in those searched test/workflow owners. `validate_edition.py` was inspected: its scope is manifest hashes, naming and part/page counts. It was not run against the explicitly excluded unfinished edition metadata. These cases remain **bounded manual/CLI review evidence owned by issue109/PR110**, not a newly registered suite or CI pass. Per SITE-CHECK-PROFILES, any desired persistent regression must be selected and reviewed separately by a nonauthor; this reviewer authored no accepted tests. No broader website campaign is warranted by this artifact-only scope.

## Exact execution and results

Working directory was `/workspace/scratch/d8b65f68acc8/devcon-repo`. Main command:

```bash
python3 /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/check.py
```

The process returned **0**, but that process exit alone is not the case verdict: retained `results.json` explicitly contains the initial case-12 assertion failure. Every helper command, Python executable path, argument, exit, stdout and stderr is retained in that JSON. The helper command pattern was:

```bash
python3 tools/presentations/integrate_native_slide.py \
  --source drafts/devcon-romania-2026/r6/sources/scratch-r13-native-full-deck.pptx \
  --donor <exact donor path recorded in results.json> \
  --slide 4 --donor-slide 1 \
  --output <exact scratch output path recorded in results.json>
```

| Case | Actual result |
| --- | --- |
| 01 Packet hashes | Both manifest digests and all 39/42 file size/hash entries matched. |
| 02 Valid, repeated integration | Both CLI exits **0**; each generated SHA256 exactly `fa461eadcf41cd314b6861be6968824545719254e5430f6de705a2071f8cbd94`, identical to candidate. |
| 03 Package / notes / PDF | **58** package parts; **56** byte-identical to source; changed only `ppt/slides/slide4.xml` and `ppt/notesSlides/notesSlide4.xml`. All **53 XML/rels parts** parsed. All nine source notes retained as complete text prefixes. All nine ordered full Markdown transcriptions equal native note text after whitespace normalization. R13 spoken paragraphs are present in the standalone script. PDF opened with PyMuPDF: **9 nonempty pages**, each approximately **960.009 × 540 pt**. |
| 04 Internal media dependency | Exit **1**: `Unsupported dependencies in ppt/slides/slide1.xml: ['image', 'notesSlide', 'slideLayout']`; no output. |
| 05 External hyperlink | Exit **1**: `External link: ppt/slides/slide1.xml`; no output. |
| 06 Changed original notes | Exit **1**: `Donor notes do not preserve the complete source notes as a prefix`; no output. |
| 07 Existing regular output | Exit **1**, `Refusing to overwrite`; sentinel output bytes unchanged. |
| 08 Symlink output | Exit **1**, `Refusing to overwrite`; symlink target bytes unchanged. |
| 09 Incompatible slide size | Exit **1**: `Incompatible sldSz`; no output. |
| 10 Duplicate ZIP member | Exit **1**: `Duplicate ZIP member names are unsupported`; no output. Python's duplicate-name warning during deliberate fixture creation was expected. |
| 11 Source slide zero | Exit **1**: `Slide 0 is outside this deck's slide list`; no output. |
| 12 Initial theme injection | Exit **0**, causing initial expected-rejection assertion failure. Diagnosis found the mutation changed orphan `ppt/theme/theme1.xml`, while actual shared master theme is `ppt/slideMasters/theme/theme2.xml`. The orphan is not imported, and the output still exactly matched the approved candidate; no unsafe output difference was found. |
| 12 Targeted diagnostic correction | Separate linked-theme fixture; exit **1**: `Shared part differs: ppt/slideMasters/theme/theme2.xml`; no output. |

The diagnosis command was:

```bash
python3 /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/diagnostic.py
```

It returned **0** and retained `case12-diagnostic.json`, including why the first fixture did not exercise the intended branch and the exact changed path, command and result. It also strengthened case 03 to ordered whole-note transcription equality, recorded in `case03-ordered-notes.json`. It did not rerun the original campaign or change the implementation.

Observed PDF link targets are the two research repositories and `https://vitaliioborskyi.ai/`. Existing slide relationships and media payloads are byte-preserved from R13 because every relationship part and every other package part is among the 56 unchanged payloads. QR decoding is not claimed by this check.

### Raw retained evidence

All files below are under `/workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/`:

- `check.py`: exact temporary harness and fixture generation; not an accepted test suite.
- `results.json`: initial results and exact command/stdout/stderr accounting, including initial failed case 12.
- `diagnostic.py`, `case12-diagnostic.json`: retained diagnosis and targeted linked-theme experiment.
- `case03-ordered-notes.json`: all nine ordered note transcription comparisons.
- `pdf-text.txt`, `native-notes.txt`: extraction of the full nine-page PDF and nine native notes.
- Valid repeat outputs, mutated donor fixtures, refusal-output sentinels and the initially accepted orphan-theme result are retained alongside these files.

## Findings, boundaries and remaining acceptance

**No product defect requiring a correction was established by these checks.** The only initial failed assertion was the identified fixture-targeting error described above. It must remain visible in aggregate reporting; do not relabel the initial run “12/12 passed.” After the targeted correction, all intended exercised invariants had the expected outcome.

The implementation is a bounded package graft, not a general PowerPoint importer. Its preflight checks protect the selected native slide and notes relationship closure, inherited size/master/theme compatibility and original note text. The successful source-to-candidate comparison is stronger evidence for this artifact's preservation than a build-receipt claim.

Uncovered paths and limits:

- No disk-full, interrupted write, permission-denied, concurrent source mutation or post-write validation failure was injected. Static inspection shows output is opened directly with exclusive create; there is no temporary-file/atomic-promotion cleanup path, so a mid-write failure may leave a partial **new** output. This is an unexecuted recovery limitation, not evidence of damage to input files or existing outputs. Do not infer transactional cleanup from the overwrite tests.
- Missing relationship targets, duplicate relationship IDs, unresolved relationship references, altered master semantics, missing size tags, malformed XML/ZIP and donor slide bounds were inspected as code paths but not each executed. The selected meaningful negatives are not measured branch coverage.
- PDF parsing/text and native package/XML checks do not constitute complete OOXML schema validation or an independent LibreOffice re-export comparison. Actual PowerPoint opening, animation behavior, font substitution, projection readability and QR scanning on a physical presenting device were **not observed**. No measured render/branch coverage is claimed.
- This role does not independently validate the research findings/citations inside preserved slides or accept their scientific claims. The full PDF text was inspected for presentation structure and preservation; visual/source roles retain their own evidence duties.
- Timed human rehearsal, full-deck author acceptance, actual device/projector acceptance and hosted CI were **not observed**. Historical issue ticks and single-slide preview approval cannot discharge those gates.
- Final edition/index/acceptance metadata and PR updates remain outside this pinned prepared subset. The orchestrator must compare final relevant hashes to these identities and obtain affected re-review if native/helper/notes bytes change. Unchanged deterministic metadata may follow the repository's explicit exemption; changed meaning cannot.

This completes the bounded first White-box QA judgment. Keep this file intact before any reconciliation or correction pass.
