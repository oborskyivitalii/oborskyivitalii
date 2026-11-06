# R10 Exploratory QA — same-role delta inspection

2026-11-06. Reviewer `/root/r10_exploratory`. This continues the first judgment in `r10-exploratory-review.md`; it is not a fresh-context review. No peer result, author conversation, MEMORY, implementation or external service was read or changed. The correction packet and necessary historical locator/archive bytes were inspected. Archived report bodies were decompressed only for byte comparison and were not displayed/read as conclusions.

**Result: bounded static checks pass; two evidence/navigation findings remain.** The archive payloads are lossless and their primary links and extraction commands work. All 12 locators also link to an absent R10 amendment file. The candidate changed during this inspection, so this report does not accept the final whole candidate. Browser-dependent scope remains not observed; no browser retry occurred.

## Binding and chronology

Supplied packet: `review/issue-169/r10/candidate-manifest-v2.json`, SHA256 `c17052c42f2cce8cbb0384e3fac0af6b7eec8321e3e6a48d656e599a8e0163c2`. Base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`; source commit `907602667ca447f23359bfa87acc0c191f5e3b8a`; dirty working tree. At the first complete manifest scan, every supplied entry matched. At end-check, 19 entries differed or were absent: publication/edition/material metadata, native article/Writing documents and snapshots, output lock and dependent offline previews. The v2 manifest bytes themselves stayed fixed. This is concurrent candidate drift, not an unchanged-source test failure.

Common reviewer contract and role prompt identities are unchanged from the first report: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` and `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`. The original-intent/issue and source limitations from that report remain applicable.

Unchanged reviewed PDF: `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40`. Unchanged manuscript: `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`. Therefore the prior five-page visual review and passage placement on PDF p4 are reused, without a second visual execution.

## Charter and observed checks

Bound: three minutes; static locator navigation, archival recovery, changed metadata/output consistency and reuse of unchanged visual observations. No product/test/source edits, new runtime check, deployment or platform action.

| Scenario and independent oracle | Actual observation | Result |
| --- | --- | --- |
| Each locator preserves an accessible original report (AC05, repository history continuity) | Read all 12 short Markdown locators. Each names an existing sibling `.md.gz`, decoded/archive SHA256, a valid `gzip -dc review/...md.gz` command and the original directory for relative-link interpretation. | Pass for static locator/archive handoff |
| Archives retain exact historical bytes | Python stdlib `gzip.decompress` succeeded for 12/12; decoded hashes/byte counts and compressed hashes matched archive manifest. Decoded bytes also equalled `git show b75a0a31e36be02bea15bb7a0b269d032fa3cdcb:<original-path>` for 12/12. No historical conclusions were consumed. | Pass, actual byte comparison |
| Locator current-evidence link resolves | For each locator, resolve `../issue-169/2026-11-06-r10-amendment.md` relative to its directory. Target was absent. | Fail, 12/12 current-evidence links |
| Regenerated platform copy preserves R10 argument before ownership and success (AC07/09) | In both supplied kit copy-ready HTML files, paragraph appears once; its location precedes whole-system economic aim, accountable owner/pilot and success. Five image paths resolve. Corrected credit says web/current PDF/platform use the existing JPEG derivative and original PNG remains in provenance/historical R9 PDF. Both copies SHA256 `afa5945d607d2a2783a8f645ae771999b2738502d4fd249d3c5d49e4b57b0c7b`. | Pass for supplied kit static scope |
| Current site metadata/output remains internally coherent | During later source read, native article had moved to SHA256 `9cbc0dc27b261eafa6293f6b218b2755699b93c23fef91e4eb8eb21b82fdaf85`. Its latest credit explicitly states web/current PDF JPEG and platform `hero-web.png` as lossless decoded JPEG copy. Native paragraph remains before owner/success; five image paths resolve; PDF href still targets the exact R10 digest. Latest edition and material source semantic identity both read `12e6f6b3fd9eb77f865ca63e10a3d035b60b3e83ec733c5f44b3b764bae72b2c`. | Observed partial static consistency; newer whole candidate not accepted |
| Visual content is unchanged for reuse | PDF/manuscript hashes unchanged; supplied new and previous kit `hero.png` both hash `3fb21ca8f7aae0ebe85f9da0cc5aaf5e124deb916d9fc625d3a46e4dfd33293f`. | Pass for exact checked assets; no new visual execution |

Archive manifest SHA256: `d5b380ce7247d1b8245ead7f4a3619b6df6f25d33d60d8e9a95d67604bafaaec`. The gzip format requires extraction to read the full Markdown; this is clear in the locator. GitHub gzip download/rendering, existing external section-fragment links and physical/operator usability were not observed. Exact decoded bytes preserve original internal references, but this does not itself prove that all original deep links still navigate to sections in the replacement locator. No deep-link preservation claim is made.

## Findings and treatment

**F2 — Medium, broken locator navigation; AC05.** All 12 original-path locators contain a “Current R10 evidence: issue169 amendment” link targeting absent `review/issue-169/2026-11-06-r10-amendment.md`. The archive-recovery path remains usable, but the explicitly offered current-evidence handoff fails. Create the intended factual target or point to an existing owner; recheck all 12 links. No claim is made that a proposed future file already exists.

**F1 continuation — Medium, candidate changed during review; AC05/11.** V2 initially matched all files, then 19 entries diverged. Examples: `publication.json` expected `a8d81de3fc0d42c759e162a91f7c662fb44caf04ee098429fa5368fe5c55ab5a`, later actual `73362753738a93fc4456dd87656e0f91205e6bee455772d7bd68993212fb1470`; native article expected `4d9444b46e036bd884ab6e6a6226f98852f8628c941ee9a89da62a3a4aead123`, later actual `9cbc0dc27b261eafa6293f6b218b2755699b93c23fef91e4eb8eb21b82fdaf85`. The supplied article snapshot `23377def...` and Writing snapshot `f8a58012...` were removed. Freeze/rebind the next packet and inspect affected deltas before whole-candidate acceptance. Prior PDF observations remain reusable at their unchanged byte identity.

## Allocation and remaining scope

No new product regression suite is proposed. Retain archive byte-equality and locator link resolution as bounded repository/static checks owned by issue169/PR170 execution; route any permanent test through existing repository/source allocation under `guides/SITE-CHECK-PROFILES.md`. No automated workflow pass is claimed from these ad-hoc checks. Preserve the unchanged 250 MB requirement; this review did not measure the complete repository hash campaign or certify its budget.

Desktop/mobile/no-JS browser readability, click/download UI, platform paste/editor previews and live URLs remain unobserved from the first review. The original Chromium `socket() ... Operation not permitted` failure remains retained, without retries. No whole AC completion or release readiness is asserted.
