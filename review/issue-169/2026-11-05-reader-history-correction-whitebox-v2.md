# Reader/history correction v2 — independent White-box QA

2026-11-05 UTC; issue169 / PR170. Same-role affected review, preserving audit v1 and blocked correction v1. No peer current output read, implementation edited, browser/build/campaign run, or external action taken. **BLOCKED by F3 below; v1 F1/F2 are corrected within the tested boundaries.**

## Exact input

Base HEAD `d3a49960714e5f158afba23d02dd0f8e871cb28e`, prepared dirty source. Manifest `review/issue-169/r9/reader-audit-correction-v2-input-manifest.json` SHA-256 `d2ce1de1e0ed8787e2e26298b64eac9101b709350b70e46eeba83c72f7266798`: independently verified all16 declared file lengths/hashes, zero mismatches. Each supplemental source probe checked navigation SHA before executing.

| Semantic owner | SHA-256 |
| --- | --- |
| Navigation | `6638c562fbed4e99076d82fd20082a607d3d82a788fea08d1921c2414605d86a` |
| Navigation tests | `c28e3c47d9b9b522b0f8c1b3d1d725684151010d43227941b3f6918ebe78661e` |
| Article browser validator | `ddb8a9d52b8a5007e11bc71f4b07ad13685114060cdb38a9ebad74dddc5d75b3` |
| Test registry | `56138c3fdaf3aac742344344257fa05a3c34a08904331a60d2498b824fe1f396` |
| Reader-mode tests | `98806b854f08347b4716724162453b214708e418d961d80b50364d50d9fb2876` |

## Actual checks and cleared findings

Independent focused Node execution: **12 pass / 0 fail / 0 skipped, cancelled or todo**, exit0, across navigation/archive/article-browser-evidence/test-profile-selection/reader-mode. Selected names: actual footer owner; foreign archive history; recent Forward/Back; arrival-time timer; direct principal snapshot; duplicate Writing/new branch; immutable article recent position; exact/bounded recent cache; current completion refusal; reader family loop; ten dependency pairs; same-document fragment restoration. This is not the author's98-test run and does not execute a browser.

**v1 F1 cleared for ordinary active arrival:** independently repeated both actual-function counterexamples. Holding Writing arrival, firing the350ms timer causes no transient history write; after release focus is `archive-topic`, scroll574, with final serialization restored. Holding reader arrival with the actual arriving marker likewise restores `reader-citation`, disclosure `[true]` and scroll843 without a transient write. Actual scroll-entry source sets the marker synchronously at phase start and clears it on completion before resolving; the navigation continuation restores focus before the next timer task. Final normal save remains enabled, rather than indiscriminately skipping the whole live request.

A controlled in-memory mutant removed only the arriving guard from actual `save`: current source yields writes0/retainsRecent:true; guard-removed source yields writes1/retainsRecent:false. Both outcomes asserted, exit0. No source file was changed.

**v1 F2 cleared for principal snapshot route/position/focus:** actual router now resolves only the exact original same-origin path after ordinary canonical/article matching. `addressPage` delegates to it. Root and project initial Writing snapshot → article → Back independently mount Writing with the exact original URL, scroll705 and link focus; new maintained test also exercises subsequent recent-state Forward/Back. The first supplemental project harness attempt retained its root-only directory and consequently had no pushed entry; after configuring the harness's project directory, the same actual source passes. This was a probe configuration error, no product change.

Eight additional actual-function address partitions pass: exact initial path with query/hash; different immutable digest refusal; foreign origin same path refusal; sibling project-prefix refusal; native Writing query-view remains Writing; declared article alias/snapshot accepted; unknown article rejected. Maintained exact index/page/URL, request/inert/departing/same-index/unknown/missing-index, 128-entry eviction and new-branch pruning tests pass. Capturing at window capture phase precedes archive bubble mutation; restore listener retains the normal post-filter ordering. No new timer scheduler or deadline change.

Current-family phases now require `animationend` on both departure/arrival whenever reader-paper semantics apply, including Writing phases. Both normal/native-history inventories reject watchdog/cancelled/null/missing completion. Historical evidence shape remains explicitly separate. Issue169 families and the tenth navigation→reader-mode input are present; focused reader fragment test targets the ordinary restoration listener and asserts disclosures before scroll, then focus/resume. No fresh-current runtime-family migration is claimed.

## F3 — high: immutable article history preserves URL but rebases content against its alias

New realistic article-entry test checks URL/scroll but stubs `rebaseResources`, hiding this separate lifecycle defect. In actual navigation a pop URL at `article-snapshots/<digest>/article.html` resolves the article key. `address(url,next)` returns the canonical `articles/article.html` alias; the pop branch retains the browser's exact immutable URL, while `mount(prepared,destination,...)` passes the shallower alias to resource and persistent-header rebasing. Relative depth is therefore one directory too shallow. Tracking `readingAddress=window.location.href` correctly fixes cache identity but does not fix the content base.

Independent source-only counterexample uses actual `address`/`rebaseResources` and an actual generated R9 image, not an invented fixture path:

- Snapshot `docs/article-snapshots/073b23dc1c26a3bf40b2ca7c0dcd5019e917bb855ac5a80ea963f58c45dce4a4/the-sdlc-is-out-of-balance.html`, HTML SHA-256 `261697cae43e3b4cfbf3670e02d545ad1de6786212e5c4f70c77d7486710fc5d`.
- Original hero source `../../article-media/fe76db95cbedba54934895fa21139654399b41b7c820c1974ad3fef410223e5f/hero-web.jpg` correctly resolves from that snapshot.
- With browser URL `/project/article-snapshots/073b23…/the-sdlc-is-out-of-balance.html`, actual mount URL is `/project/articles/the-sdlc-is-out-of-balance.html`.
- Rebased source becomes `../article-media/fe76…/hero-web.jpg`, resolving under `/project/article-snapshots/article-media/…`, rather than `/project/article-media/…`.

Four differential partitions asserted, exit0: root immutable fails resource equality; root alias passes; project immutable fails; project alias passes. Browser/network failure was not executed. The same depth calculation is used for persistent native header destinations and requires affected checking. This is a pre-existing immutable-entry gap exposed by the requested audit; it is not claimed introduced by the recent cache or generic route fallback.

**Required bounded correction:** keep mounted content/resource/header rebasing coherent with the actual pop address while preserving the exact immutable native URL and existing canonical metadata. Add root/project immutable-article Back/Forward checks using actual rebasing and actual relative image/material/header destinations; assert final URL, mounted identity, resolved resources, focus and position together. Keep ordinary aliases, exact original principal path, unknown/foreign/different-snapshot refusal and embedded semantics. Do not normalize away the immutable URL to make this test pass or broaden arbitrary snapshot admission.

## Remaining disposition

The two v1 blockers have substantive corrected source and independent positive/mutant evidence. F3 remains blocking for the requested reader/history completeness. Current runtime admission, generated exact-source artifacts, unchanged40-case actual diagnostic and ordinary delivery gates remain pending. The supplied failed diagnostic metadata is not a new pass. Full hosted regression retains its established optional disposition; this source review supplies neither native CSS frames evidence nor production authorization. Preserve first findings, then provide new exact affected bytes for correction review.

End manifest readback while saving this receipt finds navigation and its test changed concurrently; the other14 paths still match v2. Supplemental source probes explicitly pinned6638c562… at execution and remain evidence for that reviewed version. No verdict is assigned here to the newer navigation/test bytes; an updated manifest is required for their affected review.

## Final affected review — v3, 2026-11-05

**PASS within this source-review scope; F3 cleared.** v2's original finding remains above. Manifest SHA-256 `43e7ed0f846ad9681242ffe5dae6a862d1d84596fc0a69b32392038a056015af`: all16 lengths/hashes matched at start and end. Only navigation (`ed6ac4f157336196c96974bbdb461ec623115d473801cfbc136b54e460beebcd`) and its test (`046ec5abb091497db2221569471e69b5cde9e715e44120f9c91913cd115239cf`) differ from v2; other14 pins, including completion/dependency guards and unchanged browser probe, are preserved.

After push/replace/pop history handling, native mount now receives the actual browser URL. Thus immutable history keeps its exact address and resource/header depth; ordinary new navigation uses the address actually committed. No broader router admission or canonical metadata change.

Independent targeted execution:5/5 pass, exit0: footer destination owner, held-arrival timer, original principal snapshot Back, original immutable article state, and new generated reader resource/header regression. The last records the real mount URL and runs actual rebasing/header code on current R9 hero, PDF and native header links at root/project bases. Separate source-hash-pinned repetition of the original F3 hero/PDF counterexample now resolves correctly at both bases, exit0. v1 arrival/route findings remain cleared; unchanged bounded-cache, completion and selector evidence is reused from v2.

No remaining blocker found in this affected source scope. Browser40-case execution, new runtime tuple/client admission, exact clean-source artifacts and ordinary delivery gates remain pending. No browser/release pass is supplied by this receipt.

## Final fixture/allocation delta — 2026-11-05

PASS. Packet `b8090c1093ca5c9aef5da217817c8e491f17b122a0df21d4ad58ca1cff614b95`: union17/17 hashes/lengths match at start/end; app unchanged from v3. Independently verified frozen projection against actual HTML/revision/navigation digests and exact image/PDF/header values. Dirty provenance and `liveEvidence:false` remain explicit.

Independent4/4 focused tests pass: frozen resource/header regression, direct allocation, forward/reverse sequencing and stale-phase refusal. Controlled root/project hero/PDF probes pass with actual immutable mount base and reject the old alias-base counterexample. Fixture directly selects navigation without unknown fallback; mandatory content inventory remains19. Sequence VM URL/history fidelity reviewed. Historical failure receipts retained; no current generated-doc dependency or browser/live acceptance is inferred from this frozen test input. No source edits or browser run.
