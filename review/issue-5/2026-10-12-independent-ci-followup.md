# Issue 5 — 2026-10-12 independent CI continuation review

Owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
execution [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Role: independent implementation reviewer and independent delegated source/checksum
reviewer; neither implemented the reviewed changes. This supplements the earlier
[implementation review](2026-10-12-independent-implementation.md).

Inspected published integration baseline: `0ce2147` (tree `47e225b`), following
`27717ab`, `7b28592` and `5a84ef6`. The final departure/controller corrections
are explicitly dirty staged integration after `0ce2147`; staged program bytes
match the working-tree bytes inspected. Source labels below are abbreviated; exact fingerprints live
in the source contract, generated manifests and retained observations. No clean
head, managed-browser, staging, human editorial or publication acceptance is
inferred from this review.

Read current AGENTS, CODE-STYLE, acceptance/check profiles, article workflow,
REVIEW-TEMPLATE and the affected publisher, navigation, source-controller,
formatter, catalog/output and Color owners. Inspected the actual continuation
diffs and primary installed Node 24 implementation. Checks below identify what
this review actually executed. The final full source/RI/security/hosted runs remain
their own evidence; this reviewer did not replay the complete suite.

The native finding is F25 in the reconciled record because published F24 owns
the source scheduler. Its observed behavior, evidence and fix have not changed.
The integrated runner preserves that published Space-then-executive priority and
worker/host telemetry, followed by descending source size and lexical ties for
remaining selected files. It also preserves the independently reviewed stronger
abort/summary/stream cleanup. Priority changes execution order, not selection.

## Intent and acceptance

Preserve the original #5/#2 route, its native reader and exact-source evidence.
Relevant criteria are AC04 (bounded source checks), AC07/AC09/AC10 (lineage,
editions and observed platform events), AC08 (reader/fallback), AC11 (independent
implementation and inventory review) and AC12 (source-bound delivery). The
continuation does not redefine the separate editorial, rights, device, upstream,
merge or actual-publication gates.

## Findings

| ID      | Evidence/path                                               | Finding and implication                                                                                                                                                                                                                                                   | AC               | Disposition                                                                                                                                                                        |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F25, P2 | `site/engine/navigation.js`; retained native-scroll records | On published `27717ab`, an offscreen archive control loses focus when departure sets visibility hidden while content is still non-inert. The queued 350ms scroll-save overwrites its captured history focus with null; Back focuses main instead of the original control. | AC08, AC11, AC12 | Fixed in prepared navigation source `1a01b9`; independent native positive and 25 navigation cases pass. Final clean-source delivery remains pending.                               |
| O01, P2 | `build_site_bundle.py --check`; general offline manifest    | The committed `27717ab` general offline manifest still described earlier output. The production source workflow runs this guard, so that source could not claim coherent current offline output.                                                                          | AC08, AC11, AC12 | Failed check independently reproduced; deterministic regeneration passes in the working tree. Current checksum/ledger proof passes; final clean-source/RI binding remains pending. |
| C01     | Source-controller and cost owners                           | Alphabetical CLI execution leaves the long Space suite late; earlier complete executions hit the unchanged deadline.                                                                                                                                                      | AC04, AC11, AC12 | Mechanisms independently reviewed; complete combined-source timing and fresh CI are still required.                                                                                |

The [retained diagnostic owner](2026-10-12-ci-followup-evidence.json.gz) preserves
the old native failure, corrected native observation and earlier prepared timing
records with their individual qualifications. It does not turn a failed or
historical observation into current acceptance.

F25 was reproduced against an unchanged retained runtime containing exactly the
published baseline's authored navigation bytes. Focus `archive-topic`, then native
scroll it offscreen to the archive bottom, leaving the control focused. Start the
ordinary Writing-to-Talks navigation and return with Back. The observed scroll
event has `isTrusted: true`; no synthetic scroll dispatch or runtime patch was
used in the decisive records. At scroll 5722, the old runtime first saved the
control, then wrote null during the visibility-only departure. Back restored the
scroll but focused main. With the corrected runtime, the same actual hidden/body
focus interval produces no replacement save, and Back restores `archive-topic`
and scroll 5722. The local browser was explicitly review-only Chromium 153 at 1440px.

The fix reuses the existing owner state: inert content or current main marked
`departing`. The same predicate guards saving and retargeted focus fallback.
Ordinary asynchronous reading still saves actual focus/scroll changes; a stale
departure cannot add a history entry. No new clock, timeout, CSS rule or relaxed
scroll/focus assertion was introduced. Current navigation cases pass 25/25,
including visibility-only held departure, the queued save, retargeting, explicit
control changes during read, inert and initial/pop behavior. The old runtime also
fails the two new focused cases in the implementer's controlled regression.

## Decisions

Root owns implementation, generated output, final ledger/RI and delivery. This
review reported F25 immediately and performed read-only source/behavior checks;
the only repository write by this reviewer is this assigned report. The earlier
prepared cost checkout was preserved when newer remote work was discovered.
Historical results remain qualified rather than overwriting that continuation.

Translation lineage now pins all declared identity fields; retargeting/removal
changes its semantic digest while canonical property order remains stable.
Untranslated PMDay identity remains the prior edition identity. Six malformed
lineage checks and nineteen bounded platform-event negatives reject. The four
declared distribution formats retain exact document/hash/byte/edition inspection.
The historical PMDay kit still names its earlier producer; it is not described
here as newly generated by the continuation.

The new `issue5Departure` Color family adds only its plain/staging tuples. All six
prior families and twelve tuples preserve their fields. Fourteen selectors pass;
266 bounded unknown/contract/edition/canonical/immutable-byte negatives reject.
The new staged artifact verifies all 65 files; composition reproduces base
`c32097`, plain `9f04d3` and staging `de4bc3`, and composed navigation `7ae5bf`
contains the exact authored `1a01b9` bytes used by the native positive.

## Sol tasks

| Task | Paths and expected behavior                                                      | Finding / AC | Check                                                                                                                   | Status                                                                   |
| ---- | -------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T01  | Navigation preserves captured focus through visibility and inert departure       | F25 / AC08   | Independent native old/new comparison and 25-case navigation module                                                     | Prepared implementation reviewed; clean-head delivery pending            |
| T02  | Controller/parser/Canvas owners reduce repeated work while preserving boundaries | C01 / AC04   | Primary-parser/cache/diagnostic comparison; independent integrated 25/25 profile/parser cases and 1/1 Canvas guard case | Mechanics pass; complete current timing pending                          |
| T03  | Offline generator and checksum ledger bind current output                        | O01 / AC11   | Exact generator reproduction and path/type/SHA1 finding verification                                                    | Current checksum/ledger proof passes; final clean-source binding pending |
| T04  | Existing controller admits only exact reviewed Color runtime bytes               | AC08, AC12   | Composer, complete artifact and fourteen-tuple positive/negative checks                                                 | Prepared source passes; hosted/current-source admission pending          |

## Acceptance evidence

| AC               | Check/test                                         | Result and source                                                                                                                                                                                                                                                                                                                                                                                                             | Remaining gate                                                                |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| AC04, AC11       | Source scheduling, parser/cache and fixture review | Two process-isolated workers; exact inventory/order; original 180,000ms and 16MiB bounds. Language-specific imports preserve parser/errors. Exact LRU retains 128 entries/4MiB, validates batch bounds before deduplication and all rows before cache writes. Current metadata never becomes an approved immutable allowance. Canvas checks every argument and retains its original invalid assertion and all original cases. | Complete combined-source timing; exact clean-head CI                          |
| AC07, AC09, AC10 | Publisher continuation                             | Bounded lineage/event negatives pass; real untranslated PMDay semantic identity retained.                                                                                                                                                                                                                                                                                                                                     | Editorial/native platform equivalence, rights and actual observed publication |
| AC08, AC11       | F25 reader comparison                              | Independent local native failure on baseline and positive on prepared source; 25/25 navigation cases pass.                                                                                                                                                                                                                                                                                                                    | Fresh changed-source hosted/staging and applicable device gates               |
| AC08, AC12       | Color composition/admission                        | Fourteen exact tuples, preserved historical families, 266 negatives and complete current 65-file artifact verify.                                                                                                                                                                                                                                                                                                             | Actual controller admission for the final source                              |
| AC11             | Offline checksum provenance                        | First regeneration's 28 findings independently prove one ZIP and 27 entry checksums; its 58-entry ZIP and old committed manifest both reproduce exactly. This phase is historical after F25 regeneration and was not appended as current triage.                                                                                                                                                                              | Final clean-source scanner/RI binding                                         |

The same-file public Node runner preserves the committed diagnostic joining
timeout, stderr and TAP output. SIGTERM/SIGINT and stream/reporter/stdout errors
abort isolated children, retain nonzero status and drain output. Its meaningful
order/isolation/failure/timeout cases remain. Node can accept an already reported
passing test followed by a later `process.exit(0)`; old CLI and this bridge share
that inherited limit. The early-exit negative does not prove detection of every
unreported declaration.

The prior prepared combined profile/parser modules passed 24/24. On the
current integrated source, they independently pass 25/25 (16 selector/controller
and 9 parser cases), with no failed, skipped, cancelled or TODO cases. The current Canvas guard selection
independently passes 1/1; this is a selected guard check, not a full Space replay.
All thirteen published selector/controller cases remain, with three additional
process regressions; staging retains 54 selected modules plus three delegated
local cases, and production retains its exact 57-module inventory. The committed
`vm.Script` still runs each visit in a fresh context. The current
normalizer's `Array.from` also validates sparse later contract rows before any
cache insertion. All prior literal test captions remain; additions do not remove
the original negative coverage.

Earlier 548/552-case timeouts and the prepared 675-case pass in 178.94 seconds
belong to their original source. The 676-case experiment was cancelled. The
reported successful `7b28592` Basic run does not admit `27717ab`; the latter's
managed hosted success and Basic timeout also remain separate. No whole AC is
closed by a partial, historical, local or wrong-source result.

The first combined `27717ab`-based size-only run timed out at 180,047ms after
642 reported passing cases, with no complete TAP footer; it remains failed.
The published `0ce2147` Basic run 38279765811 reports 671/671 in 116.230s on
that exact source. Its hosted run 38279765671 remains failed at 390px Back scroll:
3770 expected, 3607 observed, with correct focus. Neither observation admits the
changed staged integration or resolves that failed hosted result. Root's bounded
review-only replay against its downloaded public closure restores 3770 throughout
activation/save/pop/Back; fresh managed hosted validation is still required.
The reader owner continues that diagnosis; no timeout or scroll tolerance change
is supplied by this review.

The final refreshed checksum phase independently verifies 184 exact unique
findings across 30 paths and 44 distinct SHA256 values: 32 document, 102 preview,
18 output-lock, 28 offline and 4 Color findings. Source reconstruction reproduces
40 default documents, 17 previews and the exact 58-entry ZIP of 2,367,377 bytes.
Every declared path/type/line and scanner SHA1 ID matches the derived public
checksum. The publication ledger preserves its 1,002 prior entries and adds
exactly these 184 IDs, for 1,186 unique entries; the other three ledgers remain
byte-identical. The initial 28-row transient phase was not appended. This is
prepared-source checksum provenance, with final clean-head security/RI and
delivery still required; it supplies no broader entropy exemption or human gate.

The settled collector-only continuation (`d3af6a`, fixture `304b71`) independently
passes 4/4 evidence cases. It records native DOM/event observations, clones the
original popstate separately from later history, and retains scroll-height/maximum
geometry for clamp diagnosis. Twenty-four ordinary samples are capped before
geometry reads; activation, cleanup, pop and ready have bounded one-shot critical
captures. Listeners/observer are removed immediately after the strict Back check
and in finally. The serialized functions use window as their default scope and
retain the original 2-second/2px check. No history/scroll/focus/DOM owner is
replaced, no new timer is added, and this diagnostic is not a runtime fix or proof
that the failed 390px hosted case is resolved.

Root also observed another active `0ce2147` continuation checkout with uncommitted
request-wide history-freeze edits. Those edits are outside this inspected staged
integration. Its reviewed departure-phase predicate preserves deliberate focus
and scroll changes during an asynchronous read. Root owns reconciliation and
fresh remote-head binding; this review does not authorize overwriting that other
active source or infer that either proposal fixes the 163px discrepancy.

## Issue synopsis

Independent review found and reproduced a remaining native history-focus loss,
verified the bounded fix, and checked the continuation's contracts, immutable
composition and cost-controller boundaries. Prepared mechanisms pass their
scoped checks; final current-source timing, checksum/RI/security, hosted delivery
and the original human decisions remain separate requirements.

## Prepared followup after published 242

This additional independent review inspects published `242a4da3`, tree `d0c635bf`,
and its explicitly dirty prepared followup. Staged bytes match inspected source:
navigation `2ce14b3`, navigation fixture `fe063d7`, collector `2ab10f6`, collector
fixture `cfbf1d2` and Color contract `407a2075`. Exact fingerprints and individually
qualified observations remain in the generated manifests and retained diagnostic
owner. This reviewer implemented none of these changes and writes only this report.

Published 242 Basic run 38284606215 passes 683/683 in 165.190s with two workers
and four available CPUs; navigation and both owning runs also pass. Its managed
preview run 38284605794 failed. The inspected 1440px checkpoint retains activation
2297, saved/pop/Back 2004 and correct focus, with unchanged height 3197 and maximum
2297. Progressive trusted native scroll during reading establishes departure
drift rather than remount clamping. The particular focus/actionability initiator
is inferred. That failed run remains failed and does not satisfy the condition
for subsequent controller staging.

| ID | Evidence and bounded correction | Independent disposition |
| --- | --- | --- |
| F26, P2 | Inherited native smooth motion changes the outgoing viewport during asynchronous reading. Capture the live viewport, or matching same-page saved position while content is unavailable, before interrupt; immediately use the existing instant native helper once. | Prepared source and focused regressions pass; fresh clean-head managed admission remains required. |
| F27, P2 | Root identified diagnostic layout reads preceding the expected departure capture. The independent adverse proof changes live scroll/focus on the first geometry read. Copy the primitive expected values before all diagnostic geometry. | Bad order independently reproduced on 242; the corrected existing adverse fixture passes without changing the strict assertion. |

The F26 boundary adds no request-wide freeze, timer, RAF, CSS mutation or second
scroll owner. The final departure save remains after the asynchronous read;
subsequent deliberate controls and native scrolling still win. Matching saved
history is used only for unavailable content with the same current page, preserving
hidden/inert retargets rather than taking a different popped page's position.
The harness now exercises the authored instant helper, not its former stub.
This reviewer independently ran the two changed navigation cases and changed
collector case: 3/3 pass in 107ms, with zero failures, skips, cancellations or TODOs.
The owner's 46 mapped navigation cases and 24 Color/staging cases are separate
reported results, not a full-suite replay by this reviewer.

The inspected native old/new records use the same explicit smooth-scroll API,
immediate programmatic article activation, 450ms delay of only the selected
snapshot response and review-only Chromium 153.0.8010.0 at 1440px. They contain
no scroll/history/RAF overrides. Old runtime `de4bc3` saves and restores 2004 and
times out; new `afa716b7` retains 2297 through save/pop/Back and passes the original
2px/2000ms check, with the same geometry and final focus. These records demonstrate
the bounded mechanism; they do not supply managed-hosted or device acceptance.
F27 retains the 24-sample cap, one-shot captures and cleanup ownership.

Independent composition verifies the fresh 65-file artifact and source-exact
navigation: base `0cda056d`, plain `3b2bc389`, staging `afa716b7`, composed navigation
`4a6204e0` containing authored `2ce14b3`. The distinct `issue5Smooth` family adds
two tuples; all seven prior families and fourteen tuples retain their exact fields
and order. Existing admission guards remain byte-identical. Sixteen positive and
304 bounded negative selector observations pass.

The concrete checksum proposal independently preserves all 1,186 prior finding
objects and appends only 184 proved public IDs, totaling 1,370 unique entries.
All current paths/types/lines/scanner SHA1 IDs match source-derived values:
32 document, 102 preview, 18 output-lock, 28 offline and 4 Color findings across
30 paths and 44 values. Primary reconstruction reproduces 40 documents, 17 previews
and their five inert payload hashes, and the 58-entry ZIP of 2,368,353 bytes with
its manifest. Derived RI/CI findings are excluded from this publication proposal
and retain their existing verification route. An initial helper proposal could
not admit those derived CI rows or omitted payload hashes; the corrected concrete
proposal and independent primary derivation resolve that preparation defect.
Root owns applying the exact proposal, retaining its proof and final scanner/RI
binding; this reviewer did not edit a ledger.

No new source blocker remains in this bounded review. The combined changed-source
run, fresh RI/scanners and exact-head Basic/owning/navigation/managed preview,
then authorized controller staging, remain separate delivery observations.
Historical PMDay kit/PDF producer and review-only qualifications remain unchanged.
All twelve whole #5 criteria stay open; #2 AC01–06 stay open and recording AC07/08
remain checked. Editorial, rights, platform/device, upstream, merge and publication
decisions are not supplied by these prepared checks.

## Final prepared boundary and collector amendment

The preceding unpublished Smooth draft is superseded by another dirty prepared
phase after the same published 242 baseline. Inspected staged and working bytes
match: navigation `9d4d24`, navigation fixture `55013d`, primitive collector
`c16fbd` and collector fixture `d02d16`. Pinned formatting was restored after a
temporary default-configuration rewrite; the new cap branch has expanded braces.
The earlier draft's artifact and checksum assent remain qualified to that draft.

The native instant restore is now the first statement inside the existing try,
before the first await. Cancellation remains synchronous; a native exception
reaches ordinary HTML fallback and finally cleanup instead of escaping navigation.
The added meaningful regression verifies the destination query/fragment, no added
history or flight, and released busy/inert/route/timer ownership. The owner reports
47 mapped navigation cases passing. This reviewer inspected the relocation and
independently ran the native-throw case and amended collector case: 2/2 pass,
zero failed/skipped/cancelled/TODO cases, in 332ms. That selected run preceded
the mechanical pinned-format restoration; its unchanged behavior and expanded
cap braces were inspected afterward. No complete suite or new browser campaign
was performed by this reviewer.

F27 is tightened further: activation only copies primitive time/scroll/focus and
adds that row under the existing 24-sample cap. It does not call snapshot/record
or read scroll height/rectangles before the application's document listener owns
the native cancellation boundary. The adverse existing fixture asserts zero of
both layout-read kinds and unchanged live scroll/focus at activation; later
cleanup geometry changes the live values while the original expected departure
remains retained. Other bounded geometry snapshots, one-shot captures, cleanup
and the original 2px/2000ms assertion remain. This removes the diagnostic delay
left by the preceding capture-first draft without adding a timer or handler.

Regeneration reports base `2708a2`, plain `dc829c`, staging `95b145` and composed
navigation `f60f16`, with 65 files. Final artifact/checksum derivation and exact-head
delivery remain pending at this supplement. The ledger has returned to the
published 1,186-entry prefix for a fresh proposal, replacing the unpublished
184-row draft rather than treating unused draft checksums as final history.
The failed managed 242 run and all original human/issue gates retain their prior
dispositions. Root owns the final source/scanner/RI/controller observations;
this reviewer writes only this report and now holds further writes.

The final concrete delegated checksum review assents to the refreshed proposal
`f14e094a`, finding proof `8e1b0ae4`, bound to the dirty prepared 242 phase with
authored navigation `9d4d24` and primitive collector `c16fbd`. The exact published
1,186 finding objects remain the prefix; only the current 184 public IDs produce
1,370 unique entries, with no RI/CI or superseded prototype additions. Independent
primary reconstruction verifies 40 documents, 17 previews, five inert payload
hashes and the 58-entry ZIP of 2,368,388 bytes (`a2ee4a92`), plus its manifest and
the fresh 65-file composed artifact. All fourteen published prior tuples remain
exact. The retained `nativeFinal9dChecksumFindings` record preserves this proof
and the pre-application proposal identity; earlier unpublished proofs remain
superseded. Root reports applying only those 184 rows with updated new-row reasons
and scope, preserving the prefix and three other ledgers. This reviewer performed
no additional checks after that application and did not edit any ledger.
Final RI/security, the complete changed-source run and clean-head managed/controller
admission remain their own pending observations. This report is staged; all further
repository/index writes by this reviewer are held.
