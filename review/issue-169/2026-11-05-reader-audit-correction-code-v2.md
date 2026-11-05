# Reader audit correction v2 — Code continuation

Refs #169 / PR170. Independent nonauthor `/root/native_r9_code`, 5 November 2026. Affected source/fixture/control review on prepared dirty source over d3a4996; no current peer report read, implementation edit, browser or build run. Initial counterexamples remain in `2026-11-05-reader-audit-correction-code-initial.md`.

**C1/C2/C3 resolved on v2.** After this judgment, parent reported an additional immutable-article mount/rebase defect; it remains open for affected review. No final source, browser, CI or runtime acceptance is implied.

Exact input manifest: `r9/reader-audit-correction-v2-input-manifest.json`, SHA256 `d2ce1de1e0ed8787e2e26298b64eac9101b709350b70e46eeba83c72f7266798`. Independently verified every recorded file byte count/hash, including all nine changed semantic sources and unchanged workflow/probe/prompts. Navigation pin `6638c562fbed4e99076d82fd20082a607d3d82a788fea08d1921c2414605d86a`; navigation test pin `c28e3c47d9b9b522b0f8c1b3d1d725684151010d43227941b3f6918ebe78661e`.

- C1: save now refuses the actual arriving phase, preserving recent target state until native completion, focus restoration and final ordinary save. The held-arrival regression executes the350ms callback while inert is false and arrival remains pending; it verifies no premature write/cache retirement and correct final control focus. This closes the independently observed initial focus-loss interval without changing persistence timing.
- C2: routeFor now recognizes only the exact original validated same-origin entry path after existing canonical/article matching. Its original origin guard remains; other snapshots/unknown/off-origin paths stay unresolved. addressPage delegates to that same classifier. Initial snapshot save, capture, popstate and navigate therefore share identity. Actual-source history regressions prove Writing remount/URL/scroll/focus and latest reading across repeated Forward/Back; immutable article history retains its actual URL rather than a rewritten alias.
- C3: the isolated reader fixture targets the ordinary restoration listener; capture has separate real-source coverage. Disclosure geometry precedes scroll, focus and resume. The direct navigation→reader-mode edge completes ten explicit selector mappings.

The128-entry bound, exact index/page/URL reuse, pruning, unknown-address refusal and capture-before-archive ordering remain. Strict native animationend checks for both current phases and legacy evidence compatibility retain previously reviewed bytes.

Own focused checks:7 navigation cases + reader geometry-order1 + ten-edge selector1 =9/9 pass; canonical formatting passes all nine files. Parent supplies98/98 source and46/46 selector totals; those full logs were not independently launched/read here. Initial failures remain failures. QA09e995,40cases/24legs/240s is unchanged; new coherent-source browser/CI evidence and exact runtime-family review remain pending.

## V3 mount correction

Manifest SHA256 `43e7ed0f846ad9681242ffe5dae6a862d1d84596fc0a69b32392038a056015af`: all pins independently match. Navigation `ed6ac4f157336196c96974bbdb461ec623115d473801cfbc136b54e460beebcd`, test `046ec5abb091497db2221569471e69b5cde9e715e44120f9c91913cd115239cf`. Mount now receives the actual browser URL after ordinary history mutation; canonical push and metadata stay unchanged. App correction is sound. Own current root/project resource test1/1 and formatting pass. The same new test against reconstructed exact v2 source (verified6638c562…) rejects the wrong `/article-snapshots/article-media/` URL.

**C4 open: new regression input allocation.** It consumes generated R9/hero/PDF/header bytes, but actual PR plans for R9 profile, shared header, article template and revision changes omit navigation.test with no unknown fallback. Map the new assertion's canonical/generated inputs and test that selection. No full component/browser pass or runtime admission is inferred; no implementation edits or peer reports read.

## Final fixture/allocation readback

**C4 resolved; no scoped Code blocker remains.** Final delta manifest `b8090c1093ca5c9aef5da217817c8e491f17b122a0df21d4ad58ca1cff614b95` and exact parent/override union pins verified. App/probe stay v3. Frozen fixture0d5e693e… matches the declared generated HTML/revision hashes and exact hero/PDF/header projection, with dirty-source provenance and liveEvidence:false. The test now consumes that fixture, not mutable generated output; fixture-only selection includes navigation without fallback. Content policy remains exactly19 mandatory modules (18 targeted plus archive baseline). One reviewer assertion initially confused targeted count with that union; no product/policy failure follows.

Standard URL and native pushState location behavior repair the isolated sequence VM rather than changing application semantics. Own three affected resource/sequence cases pass; final frozen regression still rejects exact v2 source's wrong resource URL. Four-file canonical formatting passes. Earlier failures remain preserved. Full99 run was pending when reviewed, so no full-suite/browser success is claimed. Dynamic browser/CI, generated-source reconciliation and exact runtime admission remain separate gates. No source edits or peer reports consumed.
