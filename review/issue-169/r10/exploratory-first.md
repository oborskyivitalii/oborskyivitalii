# R10 Exploratory / Interaction QA — first independent judgment

Date: 2026-11-06. Role/task: distinct nonauthor `/root/r10_exploratory`. No implementation, delegation or external writes performed.

## Verdict

**Partial observation; browser acceptance blocked by environment.** No editorial/layout defect was found in the five supplied PDF page renders or in the bounded static reading of the new passage, materials target and platform-copy HTML. Desktop, mobile and no-JS browser readability/navigation were **not observed**. This result cannot establish native interaction acceptance or release readiness.

The candidate manifest also became stale during review: one metadata file differs from the supplied hash. The inspected native HTML, PDF and copy-ready HTML remained bound to the hashes below. Rebind final evidence before relying on the whole-candidate result.

## Independence and source binding

The task requested an explicit none fork; parent launch/provider internals are not observable from this reviewer. I did not read MEMORY, author chat, parent scratch notes, current peer outputs or candidate reviewer reports. The supplied original-intent file and dated issue snapshot were read as requirements/history, not accepted verdicts. No unexpected author/peer exposure occurred. Shared account instructions and filesystem are not an isolation/security attestation.

Read root AGENTS.md, CONTRIBUTING.md, README.md, relevant REPOSITORY-MAP routes, site/README.md, common reviewer contract, role prompt and QA allocation/profile sections. `rg --files -g AGENTS.md .` found only the root guide.

- Repository: `/workspace/scratch/f4dcb060a703/repo`.
- Base: `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`.
- Observed HEAD: `907602667ca447f23359bfa87acc0c191f5e3b8a`; working tree dirty, not a clean checkout.
- Manifest: `review/issue-169/r10/candidate-manifest.json`, SHA256 `6f1754aa68472e2ad5b6e04195ac47af0c5b469a7bdd4afd0856ffcb8dba8fa1`.
- Common contract SHA256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Exploratory prompt SHA256: `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`.
- Original-intent file SHA256: `f34a011f171ad5fd7e5d940e2f9b1e19ddc75fbd1a3df0c4b6876b2a4f833ffc`.
- Dated issue snapshot SHA256: `b8844112ad357ef14e5720259755bb81ba0362e73d6b2f5fa0073fe0b5d8044e`.

Reviewed artifact identities:

| Artifact | SHA256 |
| --- | --- |
| `docs/articles/the-sdlc-is-out-of-balance.html` | `95710d66f0d92ed70b758119c0f484f6731f260d24619cdfb29221aa779b9c2d` |
| Native `reading-r10.pdf` and generated digest-media copy | `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40` |
| Kit `linkedin-copy-ready.html` | `b3e930b61a5663461550f7f57370ad5cb3d02bd3cd040367c1223e37c676dee9` |
| Kit `medium-copy-ready.html` | `b3e930b61a5663461550f7f57370ad5cb3d02bd3cd040367c1223e37c676dee9` |

Kit root: `dist/publications/sdlc-out-of-balance/e7f9e3adda5ff24e5f05ba2581923a808bb2c94c210f0eb05166c6d6fca464de/`.

## Independent charter and actions

Bound: about five minutes, no runtime/source/test edits. Follow the operating-model passage into ownership, pilot and success criteria; examine five-page PDF readability; inspect native materials handoff and complete platform-copy surfaces. Planned browser partitions: desktop 1440×1000, mobile 390×844 and mobile with JavaScript disabled; reduced motion selected to keep this content-only charter bounded. External browser requests were to be blocked.

| Case and oracle | Actual action and observed result | Status |
| --- | --- | --- |
| New passage precedes accountable owner/pilot/success; all delegation choices remain legitimate (R10 intent, AC07/09) | Read generated native HTML and both platform-copy HTML. The exact supplied paragraph appears once in each, followed by enterprise context and the economic/operational aim, then accountable ownership, bounded pilot, recovery drill and system-level success. Extensive delegation, limited assistance and no AI are stated without a backwardness claim. | Executed/pass, static reading only |
| PDF preserves readable new passage within five pages (AC07/09) | `pdfinfo` and `pdftotext` report five A4 pages and the passage on p4. Visually opened supplied PNGs p1–p5: heading hierarchy, five illustrations, captions, references, author footer and page numbering are legible; no clipping/overlap or missing passage observed. P4 passage flows into whole-system aim and accountable owner. | Executed/pass, supplied raster render and extraction |
| Materials control points to the new complete PDF (AC09) | Read the native “Download the illustrated PDF” anchor; resolved the local path, confirmed existence and exact byte equality with authored R10 PDF. Label/description identify a complete five-page R10 reading edition. | Executed/pass, static target resolution; click/download UI not observed |
| Desktop/mobile/no-JS reading and materials navigation (AC07/09/10) | Started an isolated loopback server and attempted installed Playwright Chromium launch. Chromium aborted before page creation. No browser cases, navigation, scroll, screenshot or viewport observation executed. | Not observed/blocked |
| Platform-copy reading and local media (AC04/09) | Read beginning/end and changed passage in both copy-ready HTML files; references, evidence note, author bio/site/LinkedIn/footer remain present. All relative image paths resolve locally. The helper's `hasEndAuthor:false` is a literal whitespace/inline-tag mismatch, not missing bio: the inspected HTML has bold author name followed by the complete bio. | Executed/pass for bounded static content/paths; visual editor/paste not observed |

## Limits and findings

**B1 — Blocking environment limitation, not a product defect.** `/usr/bin/chromium` launched then SIGABRT before browser connection. Exact fatal message: `chrome/browser/process_singleton_posix.cc:297 ... socket() failed: Operation not permitted (1)`; crashpad also reported `ptrace: Operation not permitted (1)`. Raw launch output, arguments and stack are preserved in `/workspace/scratch/f4dcb060a703/r10-exploratory-evidence/observations.json`. `cases` is empty. No retry, alternate flags, escalation or bypass was attempted. Treat browser-dependent acceptance as pending and run the existing hosted content/readability journeys on the final source.

**F1 — Medium, evidence identity drift; AC05/11.** At end-check, `site/publications/sdlc-out-of-balance/publication.json` had actual SHA256 `a8d81de3fc0d42c759e162a91f7c662fb44caf04ee098429fa5368fe5c55ab5a`, while the supplied manifest requires `585060645fdae4101658cfa4f86ce18984873307e71575d5a7b727f5b22322af`. This was the only mismatch across every manifest entry checked. A stale whole-candidate identity cannot cover later metadata bytes. Treatment: regenerate/rebind the final packet and evaluate the metadata delta; reuse this content/PDF observation only while those artifact hashes remain unchanged. This is a review-source consistency finding, not evidence of a reader defect.

Static helper setup initially stopped before observations because system Python lacked `bs4`; the bounded diagnostic changed to stdlib HTMLParser plus installed Poppler. No dependency installation or source correction occurred. Raw static observations and this setup distinction are retained at `/workspace/scratch/f4dcb060a703/r10-exploratory-evidence/static-observations.json`.

No visual/UI claim is made for mobile image-label sizes, focus/keyboard behavior, overflow, no-JS layout, screen readers, actual PDF viewer interaction, network downloads, live URLs, platform editors, pasting or physical devices. Source presence cannot prove these experiences. The supplied page PNGs were opened directly; I did not regenerate or independently authenticate their rendering process. PDF identity/text extraction corroborates content and page count, not every raster pixel's provenance.

## Regression allocation and next gate

No product defect was reproduced, so no new test suite is proposed. Reuse the existing content-update hosted smoke and rebuilt-article desktop/mobile normal/no-JS journeys under `guides/SITE-CHECK-PROFILES.md` and `.github/workflows/site-release-checks.yml`; keep existing budgets and required profile selection. The exact local launch command and failure are retained in this review's raw evidence, not represented as a passed hosted job. Allocation owner: issue169/PR170 execution maintainer. Scenario oracle: the R10 passage is visible, scrolls without overflow, remains before owner/pilot/success, and the materials link returns exact R10 PDF bytes. Existing article/materials source suites can continue to check path/digest identity; they do not replace this pending browser observation.

Retain this five-page visual review as bounded manual evidence for AC09; author visual/editorial and platform-editor decisions keep their existing owners. No merge/publication readiness or whole AC completion is asserted.
