# R10 White-box QA — affected correction review

Refs #169 / PR170. Reviewer `/root/r10_whitebox`, same-role continuation of the preserved first review. **Archive correction passes bounded identity/consumer checks. Final publication integration acceptance is blocked on a refreshed final packet because shared sources changed during this review.** This is a source-drift observation, not a conclusion that the in-progress candidate cannot be corrected.

## Inputs and chronology

- Initial first judgment remains `/workspace/scratch/f4dcb060a703/r10-whitebox-review.md`; no peer output or author conversation was read. Correction input supplies factual changed scope; this continuation is not a fresh independent context.
- Base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`; manuscript commit `907602667ca447f23359bfa87acc0c191f5e3b8a`.
- Supplied packet `review/issue-169/r10/candidate-manifest-v2.json`, SHA256 `c17052c42f2cce8cbb0384e3fac0af6b7eec8321e3e6a48d656e599a8e0163c2`; 55 listed entries. At the first inspection all 55 matched. Packet SHA remained unchanged at the final inspection, but 19 referenced source/generated files had changed or disappeared.
- Supplied kit `dist/publications/sdlc-out-of-balance/1bed13d6cbb8e890c753eeab392408a583b66959602e16a584021d1937da973e`; declared semantic `00ca50cd044b3120c3eb26d72c701372fe9eb69ea5a7ab1d24532ca1bc325bfa`.
- Archive manifest `review/issue-169/r10/history-archive-manifest.json`, SHA256 `d5b380ce7247d1b8245ead7f4a3619b6df6f25d33d60d8e9a95d67604bafaaec`.
- Reused first-review root/common/role instructions and source oracles. Read actual changed publication/material/edition/credit owners, archive manifest/locator, declared kit input/output identities, repository-budget guard locations, current RI-CI changes and textual consumers. No implementation/external writes/delegation; only this assigned artifact written.

## Risk / AC → case → oracle → result / allocation

| Risk / AC | Bounded scenario and independent oracle | Executed result / route |
| --- | --- | --- |
| AC05/11 historical evidence loss | Decompress each of twelve archives and compare raw bytes to `git show b75a0a3:<original path>`; independently verify decoded/gzip hashes, lengths and net savings | 12/12 raw byte equality; 12/12 decoded/gzip manifest identities; 12/12 locator archive names and both hashes present. Manual deterministic historical-byte check, no new suite needed. |
| AC05/11 budget mechanism regression | Inspect actual fixed guard and changed executable paths | `tools/publishing/kit.cjs:171`, `tools/publishing/site-event.cjs:117`, `tools/repository_intelligence.py:45` retain 250,000,000-byte bound. No diff under tools/tests/site engine/templates/workflows. Independently measured net archive saving 1,401,835 bytes. Final repository total/RI/Basic remains orchestrator-owned, not inferred from saving. |
| AC05 live parsed-input regression | Search twelve original basenames in tools/tests/site/.github, classify actual references; inspect RI-CI diff | Four original locator paths occur in RI-CI layer inventory. Additional matches exist in repository inventories, generated RI, scanner metadata and four blueprint Markdown links. No executable source/test directly names an archived report as a parser input. RI-CI diff updates identity digest/changed source hashes; its four locator path entries remain valid. Full RI freshness and scanner execution not accepted here. |
| AC04/08/09 retained first-review evidence | Compare manuscript/PDF hashes against first packet and five visual source bytes against base Git objects | Manuscript and PDF unchanged; all five visual source inputs byte-identical to base. Reuse first-review no-AI/order/PDF page/link/paragraph observations on those unchanged bytes. |
| AC04/08/09 credit and semantic closure | Inspect corrected exact hero credit and ensure kit/edition/material/native output agree on current bytes | At initial v2 inspection: kit input hashes and all 28 output hashes/byte lengths matched. During review current credit/edition/material/native changed again, while supplied kit and manifest remained v2. Final agreement fails for the supplied packet; affected recheck required after regeneration. |

## Actual archive accounting

Python `gzip.decompress`, `hashlib.sha256`, byte lengths and `subprocess.check_output(['git','show',BASE+':'+path])` independently checked all twelve manifest records. The raw originals total 2,114,389 bytes; the exact `.gz` files plus locators save **1,401,835 bytes**, equal to the sum of all twelve declared `savedBytes`. Each original `.md` path contains a clear locator with archive link, decoded SHA256, archive SHA256, decode command and original-relative-link guidance. No archived body was accepted from a self-reported digest alone; each was compared to its Git object.

The source-consumer scan also found blueprint links in `site/publications/pmday-ai-both-sides/blueprint.md:178`, `:206`, `:228`, `:245`. These continue to point to existing locator paths and have no fragment anchors in those matches. Scanner catalogs contain historical path/hash/reason data. These are additional textual consumers beyond the four RI-CI entries, but no observed body parser. Archiving changes how a human opens the historical report; decoding remains necessary. Historical internal links/anchors and external GitHub consumers were not exhaustively traversed.

## Finding WB-C1 — source drift prevents final exact-candidate acceptance

**Severity:** blocking review-evidence/integration gate; AC04/05/08/09/11. **Location:** supplied `candidate-manifest-v2.json` versus current publication/edition/material/generated owners and supplied `1bed13d6…` kit.

First v2 identity check found zero mismatches. Later the current hero credit became:

> Web and current PDF use the existing JPEG. Platform kits use hero-web.png, a lossless decoded copy of that JPEG.

Current edition and material semantic hashes both became `12e6f6b3fd9eb77f865ca63e10a3d035b60b3e83ec733c5f44b3b764bae72b2c`, whereas supplied kit remains `00ca50cd044b3120c3eb26d72c701372fe9eb69ea5a7ab1d24532ca1bc325bfa`. Current native HTML has the revised credit; supplied kit article/LinkedIn/Medium/copy-ready HTML does not contain that current exact credit. Final v2 manifest comparison reports **19 mismatched/deleted entries**, including publication, edition, material, material review, output lock, native article, site revision, changed snapshots and dependent preview outputs.

**Failure mechanism:** accepting the initial packet after relevant shared files change would bind a review to stale bytes and conflate two semantic candidates. **Treatment:** supply regenerated final manifest/kit with new source/semantic identity; recheck changed credit, hashes and semantic/material/native/kit closure. Unchanged manuscript/PDF/visual and archive byte evidence can be reused. This observation was sent immediately to the orchestrator; no automatic acceptance or implementation followed.

## Commands, failures and limits

Executed bounded read-only `git status`, scoped `git diff`, `rg` inventory/search, Python manifest/archive/hash checks and actual file comparisons. All archive and pinned-kit identity checks completed with their counts above. No full suites or Basic were duplicated; parent owns final source/Basic execution.

Two search invocations reported missing guessed files (`package.json`, `tools/quality/source-identity.cjs`, `tools/quality/quality-sources.cjs`) with rg exit 2. These are reviewer lookup errors; searches over existing requested roots still returned results. The bounded diagnostic then searched the actual `tools` inventory and found the three unchanged budget guards. No unchanged failed campaign was rerun or source patched.

No peer verdict exposure. Initial prompt/packet isolation limits remain as recorded in the first review. Final RI/catalog freshness, total hash budget, scanner/full-source suite outcomes, browser/native editors/live service/CI/release remain not observed here. No whole AC can be ticked from this correction artifact alone.
