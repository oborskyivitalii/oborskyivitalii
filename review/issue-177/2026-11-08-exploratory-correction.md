# Issue 177 — exploratory source correction receipt

2026-11-08. Reviewer/task `/root/issue177_exploratory`, same nonauthor execution continuing after its preserved first result; not a fresh review. Parent supplied a factual correction description and new manifest. No current peer review reports were read. No browser rerun was requested or attempted; denied command was not retried.

**Verdict remains BLOCKED / browser NOT OBSERVED.** Source-only correction review does not satisfy actual interaction for AC02, AC03 or browser AC07.

## Exact inputs and checks

- Corrected manifest `/tmp/issue177-corrected-manifest.json` SHA-256 `64a009193b21487cb31cb4cfcf961dce8efbfe7754f458b9c4c47d6c96c13e41`, independently recomputed. All **56 declared path hashes match** current files. Hash verification read file bytes for identity only, without interpreting excluded review contents.
- Prior first result `/tmp/issue177-exploratory-review.md` remains byte-identical, SHA-256 `fc1368390498922407cb9b64d7da185d1f82be60f34b172f62c507ad98f854ae`.
- Temporary driver remains unchanged, SHA-256 `d26ed2688b3a29eb873567eb75ad444f5f5ae1170984d42dbbe4e84855c7f6c4`.
- Inspected actual staged `tools/site/build.cjs` diff and current fingerprint/compiler/version call sites. Build SHA-256 `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`.
- Common and role prompts remain those identified in first result. Base HEAD remains the supplied prepared-candidate base; no clean commit or new live-source observation is claimed.

## Correction and driver applicability

`analyticsURLs(config, c)` at build line 272 now yields the principal routes plus catalog `local-article` edition URLs. The existing analytics component fingerprint includes that same list at line 357, and compilation receives the same helper at line 839. The prior extra `measurement.head` version inputs are removed; analytics component identity now carries admission changes through existing document component hashing. This is an inspected producer correction, not a measured navigation result.

Generated article bytes changed: SHA-256 `d5e629f29e689c1a412cbdf6892ec9687409d6d582b48df78b779cc1fcb6c61a`. Its loader remains the **same exact** `runtime/1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7/analytics.js`, with matching byte digest; `tools/quality/analytics-browser.cjs` remains SHA-256 `ce24cb33ce805ab4c3dc987289b9eebb5f23b4483b79b2fe2872dea7d6bcdcd0`.

The unexecuted temporary driver's compiled-file routing, canonical/extensionless article paths, `data-article` reader identity, `.reader-back` and Writing article-link selectors still correspond to current compiled HTML. It resolves resources dynamically from current `docs`, so refreshed digest/snapshot names do not require a driver-path edit. Its use of unchanged local-sink `isolationJourney` remains relevant. This confirms intended surface/selector applicability only: the driver itself has never reached a page and its assertions/timing have not been validated by execution. In particular, its vendor-count expectation and history readiness remain unobserved assumptions pending a working approved browser executor.

## Preserved limit and disposition

The first launch failed before page creation with Chromium process-singleton socket EPERM, and attempted escalation was automatically rejected by policy. Those raw failures remain `/tmp/issue177-exploratory-run.log`; no screenshots or successful browser JSON exist. Correction does not resolve that environment blocker. No product failure established, no browser pass fabricated, no new tests/implementation/external writes/delegation performed.

Continue to hold this role's interaction gate open. Existing bounded charter/allocation in first result remains applicable to the corrected candidate; real mutable SDK receipt and hosted cost remain separate future authorized observations. Stop/report scope preserved.
