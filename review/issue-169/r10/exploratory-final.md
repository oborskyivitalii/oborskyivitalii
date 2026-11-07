# R10 Exploratory QA — frozen V4 static recheck

2026-11-06. Reviewer `/root/r10_exploratory`; same-role correction continuation, not a fresh first judgment. Charter: bounded static final-packet, original-path locator, native material-link and platform-copy verification. No implementation, delegation, external operations or browser retry. Original independent result and correction remain preserved in `r10-exploratory-review.md` and `r10-exploratory-correction.md`.

**Verdict: no remaining finding in this bounded static scope.** The two earlier static findings are resolved: all 56 manifest entries match before and after inspection, and all 12 locator current-evidence links resolve. The earlier PDF visual observation remains reusable at its exact unchanged identity. **Desktop/mobile/no-JS browser interaction remains explicitly unobserved**, owing to the previously recorded Chromium permission failure; this report does not supply browser or release acceptance.

## Source and isolation

Packet `review/issue-169/r10/candidate-manifest-v4.json`: SHA256 `8f782910013c7b85d77fbc93482d617155aee4c61413fe8f2caea031eaf680d5`, 56 entries; base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`, source commit `907602667ca447f23359bfa87acc0c191f5e3b8a`, dirty working tree. Both complete hash scans found zero mismatches; no concurrent source drift observed.

Common reviewer contract SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`. Original-intent and issue identities from the first report remain applicable. No MEMORY, parent/author conversation or peer output was read. The new owning report was checked for path existence only; its conclusions were not consumed. Historical archive bodies were decompressed and hashed without displaying/reading their conclusions. Provider model/context internals remain unknown.

## Executed checks and observations

| Scenario and oracle | Actual observation | Result |
| --- | --- | --- |
| Stable packet identity (AC05/11) | SHA256 matched supplied V4 identity. Every entry, including expected absence, matched at start and finish. | Pass, 56/56 twice |
| Historical locator handoff remains usable (AC05) | Re-read all 12 short original-path locators. Sibling gzip archive links and current `../issue-169/2026-11-06-r10-amendment.md` links resolve locally; valid `gzip -dc review/...md.gz` command remains in each. | Pass, 12/12 |
| Archive recovery preserves original content | Stdlib gzip decompression succeeded 12/12; compressed and decoded SHA256 values matched `history-archive-manifest.json`. Prior comparison of decoded bytes to base originals remains reusable because archive/decoded hashes are unchanged. | Pass; no historical content rewriting observed |
| R10 text and order persist in native/complete platform copies (AC07/09) | Each HTML contains the supplied operating-model passage exactly once, explicitly retains the sound no-AI choice, and places the passage before economic/operational whole-system aim, accountable owner/pilot and success. Author bio remains. | Pass, bounded static reading |
| Corrected hero credit agrees across renditions (AC02/08) | Native and both platform-copy HTML state: web/current PDF use the existing JPEG; platform `hero-web.png` is a lossless decoded copy of that JPEG; original accepted PNG remains in source provenance. No claim that historical R9 PDF contains original PNG remains in that credit. | Pass, source/output text observation |
| Media and PDF handoff (AC08/09) | Five relative image paths resolve in native HTML and each platform-copy HTML. Native materials link points at digest-addressed R10 PDF. Authored and generated PDF bytes match; material target hash agrees. Edition and materials source semantic identities agree. | Pass, static paths/bytes/metadata |
| Five-page layout and changed passage (AC09) | PDF still SHA256 `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40`; manuscript still `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`. `pdftotext` reports five nonempty pages and passage on p4. Reuse prior direct inspection of supplied p1–p5 PNGs: readable, no clipping/overlap observed. | Pass for exact unchanged PDF; reused visual evidence, no new render |

Final inspected native HTML SHA256: `c5d123dc88c815b2b1e57105e30362577b370fa6734ddd1815b2d1b35944274d`.

Final kit: `dist/publications/sdlc-out-of-balance/9dc5a3731cf3f6afba981737df90e35a9b15def44d2e31c53f0dd6156af6b7c4/`. Both `linkedin-copy-ready.html` and `medium-copy-ready.html`: SHA256 `eeb319c0a2817a66f8f2aa239dcb101333882a29397b3b7986e9bad9aba85382`.

## Dispositions and limits

F1 (source drift): resolved for the frozen V4 packet by matching initial/final scans. F2 (missing current-evidence target): resolved; all 12 locator links now resolve. No new product or locator defect found within the inspected static journeys. No new regression suite is proposed; reuse existing repository/link/archive checks and the issue169 test-allocation owner under `guides/SITE-CHECK-PROFILES.md`.

B1 (browser unavailable) remains open for observation. No desktop/mobile/no-JS page, click/download, focus, overflow, physical device, PDF-viewer, live URL or platform-editor interaction was performed. The original Chromium `socket() failed: Operation not permitted` launch failure remains retained; no rerun/bypass occurred. Existing hosted rebuilt-article and content-update browser journeys retain their own gate and source binding.

Archive download/rendering on GitHub and old external section-fragment behavior were not observed. This check establishes accessible local locator targets and recoverable exact bytes; it does not establish preservation of every deep-link UI journey. The full repository 250 MB hash campaign was not measured by this role. No whole AC completion, production readiness or publication outcome is asserted.
