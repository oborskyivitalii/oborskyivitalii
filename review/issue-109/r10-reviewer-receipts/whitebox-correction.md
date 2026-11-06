# White-box QA — issue109 / Draft PR110 — affected correction result

Verdict: affected correction passes bounded White-box QA. WB01 is resolved. No new blocking artifact finding. The first report remains unchanged at `/workspace/scratch/992b55cffd39/reviews/whitebox-final.md`, SHA256 `586e317e78de6aa1fe3b5a77e0eee39ba5aaffbde7843513bc777a40925d6159`.

Reviewer `/root/whitebox_qa`, continuation of the distinct nonauthor White-box execution. This is affected correction review, not a newly fresh-context first judgment. Correction inputs were source locations, intended data-unit invariants and storage facts. I did not read peer verdicts, parent scratch outputs, unrelated MEMORY or author conversation, implement source/test corrections, delegate, or write external services. The unchanged common/role prompt identities, original scope and limitations from the first result apply. Provider model/context internals remain unknown; actual launch evidence belongs to the parent receipt.

Candidate remains a prepared working-tree delta at base/HEAD `3ee7398c48bfedca4a004e50ef72d88df954c8b4`, not an observed clean commit. Correction packet SHA256 `ebed2dffbfe151107e6054e48c10d26d291e10ba39e39e16203c3f17a3d59837`; all 25 referenced-file hashes matched during execution. Acceptance policy and validator hashes are unchanged. Repository metadata/RI paths were visible as changed in `git status`/`git diff --name-only`; their substantive review/full checks remain assigned to the parent.

| Current artifact | SHA256 |
| --- | --- |
| PPTX | `31f45b07224a16e8c4be067c3a3b1579dac3311c14ad78af04798c325f81b7ef` |
| Deck PDF | `24797112ddd150a9141f638994df393c6ea738a8e4cbdedb373028c2f5ddef1f` |
| Full speech Markdown | `b72402da167075b7567a6d20b546995a03e8459ea31953ce8cda2b8363a45fca` |
| Speech PDF | `45378d1089952387d6dfdf757b041802913cebf32cfab62e58321e5f566d1bc9` |
| Manifest | `bd93a7e19e482f8bfa23f9fca88ee96538c33ee764a53dd79623950b34708a77` |
| Raw retained article | `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f` |

## Correction oracles, actual execution and AC mapping

Executed `python3 /workspace/scratch/992b55cffd39/whitebox-work/correction-check.py` from the repository, exit0: **43 checks completed, 43 passed, 0 failed**. Executed existing `python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r10 --json`, exit0, `ok=true`, 9 slides, 9 notes, 9 deck PDF pages and exact required artifact hashes/lengths. The scratch script is diagnostic evidence, not an accepted repository test. No full Basic/RI suite duplicated.

| Risk / AC | Independent source/oracle and affected check | Observation |
| --- | --- | --- |
| WB01; AC02/SOURCE-RIGHTS-REVIEW | Compare corrected article bytes against the raw GitHub immutable article fetched independently in my first execution; recompute SHA256 and Git blob hash; compare current manifest | Exact 17,516 bytes, SHA256 `70386a2d…b3d1f`, blob `972486f459ebbcfd6cc333977d603670a6ea82dc`; manifest length/hash/blob agree. WB01 closed. No repeat remote fetch needed because saved independent immutable bytes remain the oracle. |
| S04 data-unit ambiguity; AC02/13 | Compare corrected native S04 visible text, linked note reference section, Markdown source section and speech-PDF reference page with the requested invariant | Visible header includes `CHEN–STRATTON · AGENTS · 1 NOV 2026 · 655 FIRMS`; caption includes `PR/Jira: per worker-month vs baseline. *Borderline; time ≠ reviewer hours.` Native/Markdown/nonspoken PDF contain the same complete clarification: PR/Jira changes per worker-month relative to baseline means; review-time percentage in elapsed days, not reviewer labour hours. +35.7%, +13.7%, +56.1% remain. Exported deck page4 contains the corrected caption/header. |
| Overbroad native correction; AC01/02/04/09 | Compare current package against exact initial R10 PPTX preserved by my own negative-fixture setup; compare all archive members/bytes | Exactly two changed ZIP members: `ppt/slides/slide3.xml` and `ppt/notesSlides/notesSlide3.xml`. These are delivery S04. Member sets identical; no other native component/media/relationship drift. |
| Render regression; AC01/04/13/16–19 | Same-renderer 72dpi full-sample raster comparison against my preserved initial R10 PDF and exact external R12 baseline | Against original R10, changed pages exactly `[4]`; eight/eight other pages equal. Against external baseline, frozen S06–S09 remain equal at 961×540; four/four full RGB sample hashes equal. This is bounded to that renderer/resolution. |
| Speech synchronization; AC01/04/09, AC11–19 | Independently parse original and corrected Markdown spoken sections; follow actual presentation IDs/relationships to associated native notes; compare all nine reading-PDF spoken bodies | All nine spoken bodies unchanged versus original R10, all nine native-note spoken bodies agree with corrected Markdown, all nine speech-PDF bodies agree. Order still `1,2,4,3,5,6,8,7,9`; native notes map through relationships, not suffix assumptions. Speech PDF remains 10 pages. |
| Frozen content/dependencies; AC02/16–19 | Baseline bytes at packet-supplied `../r12-input` hashes match prior baseline; follow frozen visible dependency closures excluding authorized note-wrapper edges | All four frozen XML bodies, all four spoken bodies, four dependency closures of 4/4/4/5 parts, all 23 relationship parts and 2 media parts exact. Reused first-result six-hypothesis/Agarwal content observation is corroborated by directly reading corrected S04 and unchanged S05 native bytes. |
| Count/history/manifest drift; AC02/04/06/08/09 | Count exactly nine spoken sections; actual manifest artifacts/source lengths/hashes; base historical files | Still 1,434 versus 1,423 (+11); per-slide counts unchanged. Eight/eight current local artifact/source records exact; all 62 pre-existing historical draft files still byte-identical. Timing remains planning only. |
| Source-copy removal loses identity; AC02/04/09 | Compare three external baseline hashes/lengths and file names against actual `../r12-input` bytes and first packet; inspect new manifest URL/ID binding and README references | Three baseline identities preserved: speech `26a2c948…e269`, PDF `78c9b730…d8be`, PPTX `62078b50…07cd`. Manifest records explicit external IDs and matching Library URLs; README describes external rather than in-tree retention. No stale `sources/external-2026-11-03…` references found in R10. Corrected source location does not change the oracle bytes. |
| Import history overwritten; AC04 | Compare original-import hash metadata to first verified packet | Four original artifact hashes and `version_id="0"` metadata retained. Three original byte payloads remain independently inspectable in my own scratch fixture; original speech-PDF hash is the verified initial-packet value. Actual durable Library version availability is not independently fetched in this review. |

The unchanged validator's failure-detection evidence from the first result is reused: the single deliberate scratch `slide_count=8` fixture rejected actual 9 slides, exit1, `PPTX slide count mismatch`. No new fixture is needed because validator source, count contract and fault mechanism are unchanged. First-result instrumentation failures and initial source observation remain preserved; no correction run failed.

Cases remain allocated to issue109 `WHITEBOX-QA`, `ARTIFACT-REVIEW`, `GENERATION-PROOF`, S04 and relevant frozen-slide/source gates, using the existing presentation-validator/manual diagnostic route described in the first report and `guides/SITE-CHECK-PROFILES.md`. No new repository test, Actions job or automated coverage percentage is claimed. Parent retains BASIC/STYLE/CURRENT-RI/RI-CI and final acceptance workflow/check/metadata obligations.

## Evidence and limits

| Evidence | SHA256 |
| --- | --- |
| `whitebox-work/correction-check.py` | `063ddcf0912a7c9236aca996e3d13e0f54fdb7d3ed36b861601e31eb3792d384` |
| `whitebox-work/correction-results.json` | `c88ca48cf7338addbeb9506caf33aedcead24331cabfa1d6debe867479ba2895` |
| `whitebox-work/correction-validator.json` | `26fdf8c5d70a909936534260e1f6cd2efb2f573fcc51621a99a3bc9136ca0a3d` |

Full raw check stdout is `/workspace/scratch/992b55cffd39/whitebox-work/correction.stdout`; detailed results include actual mapping, counts, unchanged dependency/raster hashes, source and historical accounting. Paths in this table are relative to `/workspace/scratch/992b55cffd39`.

This result checks correction propagation and preservation; it does not independently re-establish the primary study's scientific validity or the external baseline's original delivery provenance. Durable Library IDs/URLs are structurally/hash bound to the observed local sources but remote availability/version retrieval was not exercised here. No controlled LibreOffice re-export, GUI edit/Presenter View, real projector, timed rehearsal, author acceptance, full rights review, non-DevCon reuse, final Git delivery linkage, merge or release observed. Those remain explicit gates. Correction packet and artifact hashes above cannot be silently relabelled as evidence for a later substantive candidate.
