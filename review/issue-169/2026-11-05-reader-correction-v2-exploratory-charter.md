# Reader correction v2 — affected exploratory charter review

Refs #169 / PR170. `/root/native_r9_exploratory`, continuation of its own source-bound failure review, not a fresh-context claim. Read-only inspection of the prepared sources/tests, original failed raw report and unchanged diagnostic. No product/probe edits, test/browser rerun or peer-output reading. Production advancement remains paused.

**Verdict: the unchanged40case charter is suitable to revalidate the observed recent-scroll → Forward → Back failure on a new clean candidate. No browser correction pass is claimed.** The prepared implementation is consistent with the observed user-flow problem. Initial snapshot/history compatibility and forced arrival-timer behavior have additional source regressions; they are not automatically browser-proven by the40cases.

## Input and prior-result binding

Prepared input manifest `reader-audit-correction-v2-input-manifest.json` SHA256 `d2ce1de1e0ed8787e2e26298b64eac9101b709350b70e46eeba83c72f7266798` was independently recomputed. All16 listed files match their declared SHA256/size. The packet is explicitly dirty prepared source based on `d3a49960714e5f158afba23d02dd0f8e871cb28e`, not a clean executed commit. Relevant identities: navigation `6638c562fbed4e99076d82fd20082a607d3d82a788fea08d1921c2414605d86a`; navigation tests `c28e3c47d9b9b522b0f8c1b3d1d725684151010d43227941b3f6918ebe78661e`; maintained article observer `ddb8a9d52b8a5007e11bc71f4b07ad13685114060cdb38a9ebad74dddc5d75b3`. The40case probe remains `09e995a1726da63b7eeea7778f12a1af93a68f79798c35f6b1b36c98975984d9`.

Run42105950320 remains20pass,2fail,18not-observed. Raw report SHA256 `a3c12c99aa146b98397d555de2e2214197dad1d9b32ac5f53b127c07b4ce6984` was recomputed unchanged; artifact ZIP remains `b504821653f82db284894a5ab71c66034282584a19c4c0529588896b0718f8af`. The actual first Forward heading/phase checks pass; both next Back restorations return old card scroll2163/3832 instead of newly recorded574/1076. Actual focus was not recorded on the timeout branch, so no focus failure is invented. The original failure and foundation audit remain intact.

## User-flow assessment of the prepared correction

The new capture-phase popstate observer reads the still-mounted outgoing document after browser history has selected the incoming entry. It retains the latest scroll/focus/reader state in bounded per-entry memory rather than writing that outgoing state through the incoming `history.state`. Restoration uses the recent state only when entry index, document page and exact URL agree. Ordinary successful serialization retires the supplemental record; new branches prune abandoned Forward entries; retention is capped at128. The350ms normal persistence interval remains unchanged.

This directly addresses the actual failing user sequence: Back to Writing, move to a new reading position and immediately Forward, then Back again. It avoids requiring the reader to pause before using browser history. The arrival guard also prevents a pending scroll-save timer from serializing a transient arriving frame/focus and prematurely retiring the recent target. These are source observations and intended behavior, not new executed UI observations.

The additional source regressions cover recent traversal before debounce, incoming-state/history-write protection, an explicitly held arrival with a350ms timer firing, duplicate/same-URL entries, new Forward branches, exact URL/page/index matching, bounded eviction and refusal guards. The v2 exact-initial-document recognition uses the existing route resolver for the original validated snapshot path and leaves other unknown principal snapshot paths refused. Direct initial principal/article snapshot history has source fixtures using the actual route resolver.

Those are meaningful test partitions for the foundation gap. The operator's reported98source-test pass is a separate result; this role did not rerun it or convert it into browser proof. Code/White-box review remains responsible for implementation correctness, fixture fidelity, limits and profile allocation.

## What the unchanged40cases can establish next

The existing plan still contains the real failure sequence at1440/390 in both normal cycles, with no added sleep before Forward: topic refresh, original reader/Back, visible new heading position, actual native Forward, then Back to the recorded recent position/focus/URL. The new source must restore whichever actual positions the next run records;574/1076 are prior evidence, not new hardcoded expected values.

For the next exact-source artifact, require all40cases/four contexts, original16normallegs plus8addedhistorylegs, current H2 native text-layer start/end/keyframes/positive elapsed time, no watchdog/cancellation, original footer self-box evidence, no-JS paths, errors and full public/source readback. Independently inspect outgoing topic visibility/count text in the existing traces, as the prior charter specifies. The probe's failed restoration record still lacks direct actual-focus readback; traces/raw data must retain that limit if it fails again.

The maintained article observer's prepared completion check now rejects watchdog/cancellation/absent completion on both departure and arrival for current runtime families. This strengthens the broader current reader gate; it does not execute that gate. There is no assertion relaxation, budget increase or inference from eventual arrival.

The40cases can provide actual integration evidence for recent reading capture/restoration and repeat behavior on canonical native entry. They do not deliberately force the arrival timer to fire at the regression's held point, exercise128-entry eviction, cover every duplicate history branch, or begin from the original immutable principal snapshot. Keep those source-only results labelled accordingly.

## Precise additional snapshot charter, if that native path is to be browser-accepted

No additional case is necessary merely to replay the already observed canonical-entry failure. For a broader foundation claim that explicitly accepts the changed initial-snapshot route behavior, propose **one additional normal desktop context only**, using the same pinned Chromium/source artifact and existing budget. This is a proposed scope, not an authored or executed extension and not a new matrix.

- Start from the actual Writing snapshot URL in the verified manifest's `components.routes.writing.url`, served from the same fixture. Verify the initial response bytes, engine/revision metadata and Writing identity; do not invent another snapshot path.
- Use the real topic control for the R9 article and retain the exact snapshot pathname/query. Enter the article through its real card, then Back: exact original snapshot URL, Writing identity, topic, activation position and focus must return.
- Move to a new archive reading position and immediately Forward, then Back again: restore that new actual position/focus at the same snapshot URL. Preserve actual phase/camera and current text-layer evidence without injected state or a debounce wait.
- Confirm the persistent principal/footer destinations remain their canonical native URLs. Unknown/other snapshot refusal and old-API fallback stay with focused source tests rather than fabricated browser navigation.

Bound this single compound snapshot round-trip to at most60seconds **within** the existing240-second diagnostic ceiling and10-minute job limit; do not duplicate widths/themes or relax timeouts. If no budget remains, report it unobserved. Source review must approve the specific extra case before implementation/execution. If it is not selected, the next result must explicitly leave initial-snapshot browser acceptance pending rather than imply coverage from the40cases.

No execution or readiness is established by this charter. A new coherent clean source/workflow/script/artifact binding, affected independent review, actual observations and separately owned runtime/hosted/delivery requirements remain necessary. Production remains paused for the reader-foundation audit.


## v3 affected recheck — source only

Manifest SHA256 `43e7ed0f846ad9681242ffe5dae6a862d1d84596fc0a69b32392038a056015af` and all16 listed files were verified. Only navigation and its test changed from v2. Mount now uses the actual browser URL after history mutation, preserving immutable-entry depth for image/PDF/header rebasing. The inspected regression uses current generated R9 resources and actual route/rebase/header functions at root and project bases; this is source coverage, not a test rerun or browser observation by this role.

The unchanged40case probe remains suitable for canonical recent-reading revalidation. No optional snapshot context is being added: immutable-pop resource/header behavior remains unobserved in that browser charter. Prior42105950320's20pass/2fail/18not-observed stays intact. No new UI pass or production advancement is claimed.


## Final fixture delta — source only

Packet `b8090c1093ca5c9aef5da217817c8e491f17b122a0df21d4ad58ca1cff614b95` and its v3-plus-overrides union were verified. App/probe/workflow bytes are unchanged. The frozen R9 href projection declares `liveEvidence:false` and dirty provenance: it tests rebasing geometry, not current served resources. The unchanged40case charter remains suitable for canonical history revalidation; snapshot browser coverage stays unobserved. No test/browser execution or new UI pass is claimed.
