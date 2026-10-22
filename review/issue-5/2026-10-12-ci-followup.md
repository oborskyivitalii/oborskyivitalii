# Issue 5 — current-source CI cost and offline coherence

Owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
execution [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Role: implementation self-review; separate agents review source and execute the
complete bounded test selection. Inspected baseline: clean PR head `27717ab`;
the corrections below are explicitly prepared working-tree source until committed.
The continuation is reconciled onto the subsequently published `0ce2147`
scheduler, preserving its serial-file coverage, worker/host reporting and explicit
Space/executive priority along with the stronger abort/summary cleanup below.
Its F24 scheduler review remains distinct from the native F25 finding here.

## Intent and findings

Finish the authorized publisher/PMDay implementation and its current-source
checks. The two issues keep their original acceptance, independent editorial,
rights, device, upstream and actual-publication decisions.

| ID   | Evidence and implication                                                                                                                                                                                                                       | AC               | Treatment                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| CI01 | Basic38275662062 reaches the complete source selection, then times out at180,000ms with550 reported passing cases and no complete TAP footer.                                                                                                  | AC04, AC11, AC12 | Preserve the selected files and assertions; reduce repeated parser/fixture work and start long modules earlier.           |
| CI02 | Independent clean-head `build_site_bundle.py --check` rejects the general offline manifest after the runtime/previews changed.                                                                                                                 | AC08, AC11       | Regenerate through its existing deterministic generator; inspect exact new checksum dispositions.                         |
| F25  | Actual native scroll queues a350ms save while outgoing route blocks hide an offscreen focused archive control before content becomes inert. The timer replaces the captured focus with null; actual Back restores main instead of the control. | AC08, AC11, AC12 | Freeze history writes during the actual departing/inert phase; retain newer deliberate focus during an asynchronous read. |

The earlier `7b28592` Basic38270688879 passed665/665 in125.320seconds. That
successful observation does not admit the changed `27717ab` source. Its actual
managed hosted preview38275661643 passed the complete existing smoke and article
journeys; the initial image/Back failures remain failed at their original sources.
Local and hosted evidence, complete and timed-out execution stay distinct.

The independently reproduced F25 case uses an actual trusted scroll event and
the unchanged `27717ab` runtime. A shared read-only predicate now recognizes
content inertness or the current main's owned `data-route-blocks=departing`
state. Both timer suppression and interrupted-entry fallback use it. No extra
mutable state or timing allowance is introduced. Two new held-departure/350ms
regressions fail the old source; all44 mapped navigation/fixture cases pass the
correction, including explicit focus/scroll changes during a retargeted read.
The article-save fixture models an ordinary readable main without changing its
original assertions. New generated outputs and a distinct Color departure
family preserve all six previous families/twelve tuples; the existing tuple
and wrong-source guards exercise the new fourteen-tuple inventory.
Independent new-runtime browser proof passes the same trusted native-scroll
case: while the control is hidden and content is not yet inert, history retains
its captured focus; Back restores that control and the same5722px position.
[Retained diagnostics](2026-10-12-ci-followup-evidence.json.gz) keep the old
failure, new prepared/review-only success and earlier timing observations.
Independent final checksum proof reconstructs40 documents,17 preview outputs,
their embedded payloads and the actual58-entry offline ZIP. Exactly184 novel
path/type/SHA1 findings resolve to44 actual public SHA256 values across30 paths;
the ledger appends only those exact findings. All prior records, scanner rules
and the source-bound Color contract remain. The first28-value offline-only phase
is historical after runtime regeneration and was not appended.

## Correction and checks

The primary HTML normalizer gains an explicit bounded factory and exact-byte
LRU cache:128 entries and4MiB combined input/output UTF-8 bytes. Oversized
requests bypass caching; parsing/render failure cannot populate it. Batch
requests validate their original count/byte/type bounds before deduplication,
use the same primary parser, and render every result before adding any entry.
Frozen amendment hashes are all verified before batching their known snapshots.
Every evolving current document still receives full normalization after each
replacement. Current bytes do not become an approved metadata allowance.

AST, Decimal and PyYAML load only for their own Python/JSON/YAML requests.
The HTML parser itself is unchanged. Existing negative diagnoses retain their
exception types and messages, including mixed-language batches. Earlier prepared
comparisons checked16 valid/invalid fixtures, both request orders and50 actual
sources byte for byte;18 focused formatting/parity cases passed. Their timing
observations belong to that prepared source and do not establish current CI.

The Canvas fixture evaluates the same `Number.isFinite` predicate for every
argument and invokes the original assertion on invalid values. Its new actual
fixture regression covers720 invalid method/position/type combinations, finite
extrema/-0, zero/extra arguments and unchanged drawing side effects. All original
Space cases and the already committed reusable `vm.Script` preparation remain.
An earlier guard-only microbenchmark improved13.47%; whole-suite speed requires
a fresh run of this combined source.

Node24 alphabetizes CLI test files regardless of argv order. The existing source
controller therefore executes measured Space/executive files first, then orders
remaining validated regular files by size using the
public `node:test.run` API and a same-file bootstrap. Canonical selection remains
unchanged; execution order and argv are recorded separately. Concurrency remains
two, isolation is per process, and the parent retains180,000ms/16MiB limits,
clean-source checks and strict complete TAP accounting.

SIGTERM/SIGINT and source/reporter/stdout errors abort and reap isolated children;
test failures and unsuccessful summaries produce nonzero exit status. The
maintained selection module passes16/16 on the combined working tree, including
actual order, maximum two workers, independent globals, assertion/rejection/
uncaught failures, empty or exit-before-any-result rejection, and timeout cleanup.
The current baseline's timeout/error/output diagnostic regression is retained.
Independent earlier broken-pipe observation also verified child cleanup.
Native Node can accept a reported passing case followed by a later
`process.exit(0)`; old CLI and this bootstrap share that inherited accounting
limit. The early-exit fixture does not claim detection of unreported declarations.

Earlier prepared two-CPU experiments against the `5a84ef6` baseline failed after
548 and552 completed cases; the ordered675-case attempt passed in178.940seconds
with only1.060seconds margin. Those observations do not admit this newer source.
The unlaunched676-case experiment was cancelled after the newer remote work was
discovered. Its separate prepared checkout was preserved and reconciled without
overwriting newer publisher, navigation, fixture or provenance work.
The first combined277-based staged run also timed out at180,047ms:642 cases
reported pass and no final footer was emitted. Space case durations total154.4s,
executive37.6s; these are case sums, not per-module wall times. Its size-only
schedule leaves nine tail modules unreported. The published0ce scheduler's
actual Basic38279765811 passes671/671 in116.230s on that exact source; its
hosted38279765671 remains failed at mobile Back scroll (3770 expected versus3607
observed, with correct focus). Neither result admits this combined continuation.
Scoped390px inspection of the exact downloaded0ce hosted public artifact
restores3770px at activation, first saved entry, original popped state and Back.
The local review-only Chromium153.0.8010.0 did not reproduce the managed
153.0.8010.12 failure; no causal claim or new allowance follows. The collector
retains bounded activation, cleanup, native-scroll, original popstate and
mount/ready geometry on failure through observational listeners, without
patching runtime or history methods. Its original2px/2000ms assertion stays.
An alternating guard-only experiment found indexed traversal4.1% slower than
the retained for-of loop; no such source change was applied.

## Final prepared-source execution

The integrated two-CPU run completed all683 cases in59 selected modules,
169,262ms, with zero failures, skips, cancellations or TODOs. Its original
180,000ms/16MiB parent bound and two isolated workers remain. This is dirty
prepared-source observation on published0ce baseline/index tree`dbd3e07`, with
exact program fingerprints in the retained report; clean-head CI is separate.
The first completed attempt reported682/683 in176,083ms because a local
`node_modules` symlink was correctly rejected by the authored-source guard.
Real dependency directories replaced that local shortcut; all8 architecture
cases and then this entire repeat pass. The failed observation remains failed.

The independent source/controller/collector review and48 RI/CI regressions
passed before the run. Final report/catalog refresh, formatting/scanners and
clean published-source source/owning/hosted admission remain their own results.

## Managed242 failure and bounded native correction

Published242 source Basic38284606215 passes683/683 in165.190s with two workers;
navigation38284605155 and both owning runs38284605176/38284683092 pass.
Its managed preview38284605794 remains failed. Artifact11763360562 preserves
the first1440px article Back failure on candidate83a005df: activation2297,
saved/pop/Back2004, with correct focus and unchanged height3197/max2297.
Native scroll eases through successive positions during the asynchronous read;
this is departure drift, not remount clamping. The exact focus/actionability
initiator is inferred rather than proved by that checkpoint.

| ID  | Evidence                                                                                                                             | Correction and remaining check                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F26 | Managed same-height progressive native scroll before mount; explicit native-smooth old/new reproduction                              | Copy ordinary viewport or same-page unavailable departure history before interrupt; use the existing instant native helper once after interrupt. Fresh read-time controls/scroll still win at the existing final save. |
| F27 | Collector geometry reads before expected activation capture; an actual adverse fixture changes scroll/focus on its first layout read | Copy primitive expected scroll/focus before all diagnostic geometry; original strict2px/2000ms assertion retained.                                                                                                     |

The [CSSOM View scrolling algorithm](https://drafts.csswg.org/cssom-view/#perform-a-scroll)
describes cancelling an ongoing smooth scroll before an instant scroll. This
8October2026 editor draft is a supporting mechanism reference, not browser
acceptance. The corrected runtime adds one bounded call to the existing native
helper, with no new timer/RAF or CSS preference mutation. Matching saved departure
history is used only for unavailable same-page retargets; popped destination
history cannot replace the outgoing viewport. Ordinary changes during a read
remain saveable. Two new actual-harness cases fail242 and pass the correction;
all46 mapped navigation cases and the scoped article-history case pass.

Independent collector review reproduces the bad measurement order. The adverse
fixture fails committed242 with3607/changed-by-layout versus original3770/link;
all4 current evidence cases pass after the correction. An initial scratch import
failure was setup-only and is not the negative behavior proof.

The bounded native browser proof starts an actual smooth scroll and delays only
the selected article snapshot450ms. The source-exact old242 runtime reproduces
2297→2004 and strict timeout; new runtime preserves2297 through saved/pop/Back
and passes the original2px/2000ms check. Geometry and focus match. No scroll,
history or RAF override is used. These are explicitly review-only153.0.8010.0
observations, not managed or clean-head admission. The older artifact preparation
remains qualified as exact runtime bytes rather than exact242 artifact production.

Authored owners regenerate default documents, previews and the actual offline
bundle. A distinct`issue5Smooth` family binds this correction's plain/staging
bytes, preserving all seven prior families/fourteen tuples; the existing complete
positive/wrong-byte guards cover sixteen tuples. Scoped Color/staging cases pass
24/24. Independent current checksum proof verifies another184 exact public findings
(44 values/30 paths), preserving1186 prior objects and appending only those184
for1370 unique records. The actual58-entry ZIP is2,368,353 bytes; primary
documents, five embedded payload hashes and all65 staged files reproduce.
The87 raw CI findings remain on their existing derived verification route and
are excluded from this append. Final source/RI/scanners and exact-head managed
hosted/staging results are the next admission steps; prior failures stay failed.

## Final native boundary and nonintrusive collector

The earlier46-case/prototype composition and checksum record above remain
historical prepared observations. A final regression exposed an exception path:
the new native restore initially sat outside the existing error boundary.
Moving that synchronous call inside the existing `try`, before the first await,
preserves ordinary HTML fallback and finally cleanup when native scroll throws.
The unsafe preparation fails that case; final authored navigation `9d4d243f`
passes all47 mapped navigation cases and the scoped article-history case.
Query/fragment, no history/flight commit, and busy/inert/route/timer cleanup
are checked rather than inferred.

The collector now makes activation primitive-only: time, scroll and focus with
no rectangle or scroll-height read before the router cancels native motion.
The strengthened existing adverse fixture proves both read counts stay zero,
live values remain unchanged at activation, and later geometry can change live
values without changing the expected departure. All4 evidence cases pass;
the strict browser assertion and24-sample cap remain unchanged. The first
formatter invocation used default settings; the pinned repository settings
restored the narrow change before proof/admission. The intermediate stale-line
checksum helper rejection remains a preparation failure, not scanner admission.

Final composition binds base `2708a2e1`, navigation `f60f16a7`, plain `dc829c53`
and staging `95b145ea`; all14 published historical tuples remain exact and the
16-tuple Color/staging source selection passes24/24. The final review-only
native proof uses those runtime bytes and final collector `c16fbd05`, preserving
2297px through activation/save/pop/Back with unchanged geometry and original
2px/2000ms assertion. It remains explicit Chromium153 review-only observation,
not managed hosted, clean-source, physical-device or publication acceptance.

The final default ZIP has 58 entries, 2368388 bytes and SHA256 `a2ee4a92` (full identity in the generated manifest and retained proof).
Fresh individually proved checksum findings remain184/44values/30paths;
Independent final derivation verifies the exact184 additions and preserves all
1186 published prior objects. The applied publication ledger has1370 unique
entries; the other three ledgers and scanner rules are unchanged. Source proof
`8e1b0ae4` and pre-application proposal `f14e094a` bind this final generation,
not the earlier unpublished prototype.
The whole selected source run, final RI/scanners and exact-head managed preview
then authorized controller staging remain separate delivery observations.

## Final complete prepared-source result

All686 cases in59 selected modules pass in179,167ms on two CPUs, with zero
failures, skips, cancellations or TODOs. Exact prepared index `bb7404b2` and69
selected/critical source fingerprints are retained in `finalNative686FullPass`.
The original180,000ms/16MiB bound, two isolated workers and complete selected
case set remain. This observation has a narrow timing margin and makes no speed
guarantee; fresh clean-head CI remains the delivery source result.
Final direct RI/CI was fresh before that run. Subsequent edits only record this
outcome and regenerate metadata; they do not change the checked runtime/test
program. Final Basic/format/lint/security and exact-head managed admission then
controller staging remain separate observations.

## Managed ad212 admission and original-budget stage failures

Clean source `ad212096` / tree `52f29d83` passes Basic38290118159:
686/686 in59 modules,130,019ms with two workers; navigation38290117033
and owning38290117010/38290133931 pass. Managed preview38290117530 passes
all4 normal/no-Canvas journeys,2 Color cases and5 article observations
(1440/390 normal plus390 Off/no-Canvas/no-JS) on Chromium153.0.8010.12.
The65-file artifact is independently reconstructed from the primary clean source,
including actual native body/head/descriptors/assets, with digest `c9c1134a`.
This establishes the native correction's managed proof; PDF/editorial/device
and actual publication remain separate.

Bounded stage38290814111 remains failed. Its selected source passes649/649
in54 modules142,025ms, plus109 repository cases; host/static gates also pass.
The functional report retains6 journeys,2 navigation and10 failure fixtures,
but Chromium exits before analytics/article collection. Its temporary analytics
source tree omits `quality/artifact.cjs` and `budgets.json`, now required by
`site/offline.cjs`; the resulting missing-module error is the actual startup
cause rather than a failed article navigation. The cold fixture fix copies
only those two canonical owners. Exactad source fails the new cold case;
corrected analytics passes11/11 and separate peer case1/1. It checks all15
exports, dependency bytes, isolation and cleanup before an injected browser
boundary, without claiming fixture output is actual browser evidence.

| ID  | Preserved failure/evidence                                                                     | Bounded correction and remaining admission                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| F28 | Actual temporary-source missing dependency before browser article collection                   | Close the exact offline→artifact→budgets chain; fresh full bounded functional collection remains required.                                    |
| F29 | Writing mobile TBT301.5ms exceeds the original200ms; Research111.5ms, Writing LCP2238.1ms/CLS0 | Snapshot native Y and viewport height once after reading cleanup, before per-unit DOM writes; fresh same-budget measurement remains required. |

The actual timeline has no V8 Profile/ProfileChunk samples. Explicit layout
stacks identify168 `armReading` style/layout events totaling25.422ms raw;
42 of those DCL-path pairs cost14.426ms on Writing. The shared guarded callback
reads `window.innerHeight` and `scrollY` per unit after earlier ink/separator/state
writes, defeating its existing native measurement batch. Direct Writing bootstrap
calls `save`, so the native-cancellation call inside `navigate` is not a cause.
The132ms Lighthouse task is simulated; its actual RunTask65.874ms includes
navigation evaluation24.956ms and DOMContentLoaded36.029ms. These observations
support a specific read/write fix, not exclusive sampled CPU attribution or a
performance guarantee; unchanged Space frames also contribute to the audit.

Final ScrollEntry `ff058c81` passes a fresh batch snapshot to both callers.
Reconcile captures after cleanup/clamp and uses the same Y for `previousY`;
enter snapshots its native viewport before processing IO entries. Eligibility,
focus/visibility, last-block overflow protection, direction/stagger/six-active
bound and existing watchdogs retain their original conditions and values.
Two adverse cases fail exactad and pass the correction (one Y/height read and
zero post-write flushes); mapped ScrollEntry/navigation passes66/66. Separate
peer review verifies both cases and their original-source failures. No timer,
RAF, CSS, animation duration, metric budget or profile is changed.

A distinct ninth Color family/18 tuples binds base `a63e6d65`, composed navigation
`7d8d577c`, plain `695f497e` and staging `cdff9548`, preserving every16 published
historical tuples. Default source owners regenerate all documents, previews and
the actual ZIP. Existing complete Color/stage guards pass24/24; fresh checksum
proof independently verifies184 current public findings/44values/30paths,
preserving the1370 published prefix for1554 total; proof `d6ac61cf` and concrete
proposal `d838a6db` are retained. Three other ledgers remain unchanged. The58-entry
ZIP is2,368,582bytes/SHA `ae8efdbe`. Complete689 selected-source accounting,
final RI/scanners and managed
preview then bounded stage remain required. The original failed run stays failed.

## Complete viewport/closure prepared-source verification

Current prepared index `faf07d7c` passes all689 cases in59 modules in175,205ms
on two CPUs, with no failures/skips/cancellations/TODOs and the unchanged
180,000ms/16MiB parent limits. The retained `readingViewport689FullPass` record
contains complete TAP/accounting and current selected-source fingerprints.
The cold analytics case and both viewport probes participate in this full result;
previous focused author66/66 observations were stdout-only, not invented TAP files.
All subsequent edits only record this result and rebuild its metadata. Final
format/Basic/lint/security and fresh exact-head managed preview then same-budget
stage are still separate delivery results. The actual301.5ms TBT failure remains
failed until a new source-bound measurement establishes the correction's outcome.

## F30 — complete article coverage in the staging aggregate

Clean published `1e15f5b3` / tree `7e37ec91` passes actual Basic/source
`38296000120`:689/689 in100.936s,59modules, two workers, all nonpass counts zero.
Navigation and both owning-policy runs pass; all12 criteria have automated-pass
with human gates still pending. Managed preview `38295999783` passes four route
journeys, two Color cases and five article observations in Chromium153.0.8010.12.
Its65-file artifact `4d0d79de` is independently reconstructed from primary source.

Actual controller run `38296697030` remains **FAILED**. Build passes652/652
selected cases in145.947s and109 repository cases in15.703s. Static, host and
browser/performance jobs all succeed. Strict child validation confirms four
normal/five-room journeys, two no-Canvas journeys, two navigation cases, ten
capability cases, seven analytics fixtures and five article observations.
Two route motion samples, eight windows, four cold/warm flights and two single
mobile Lighthouse trials pass the unchanged limits: Research TBT71.5ms,
Writing129.5ms against200ms; respective LCP2119.9385/2151.1205ms and both CLS0.
These are individual staging trials, not production-release medians.

The final aggregate fails only because `expectedCoverage` omits the
`articleObservations:5` key that strict `validateFunctional` returns after
validating the representative article. F30 adds that conditional exact count;
the empty-catalog shape and every other count, report/source guard and budget
remain unchanged. The bounded profile still exercises one representative even
when multiple editions are available. One new aggregate regression covers
zero/one/two documents in base and Color, preserves all five-room coverage and
rejects omitted/incorrect summary counts and missing/duplicate actual rows.
Focused gate/article checks pass11/11 in344.387ms; scoped format/lint pass.

Original raw reports, both Lighthouse JSON reports, artifact identities and the
failed gate/log are retained in `viewport1e15OriginalStageGateFailure`; original
preview and CI evidence are in `viewport1e15HostedSuccess`. The original38
records remain exact. Revalidating retained measurements uses the reviewed
validator with its own source digest while preserving the original measurement
source/tree/artifact/target; it does not relabel the failed run or supply a new
observation/admission. Fresh final-source CI/preview and the existing full bounded
controller route remain required. No runtime/public/Color/ledger changes,
budget changes, stable promotion, merge or production are part of F30.

Independent pure-aggregate revalidation passes on the unchanged authentic raw
inputs; old-source failure is independently reproduced. Validator `27a64369`
and regression `6274ccad` are bound in `articleCoverageF30RetainedRevalidation`,
with original job/report identities, four verified Lighthouse trace/network
files and explicit historical-only/no-admission qualifications. Genuine focused
TAP is retained in `articleCoverageF30FocusedTests`. The original controller run
and gate remain failed; this does not impersonate a new hosted gate result.

## Tasks and acceptance evidence

| Task | Owner paths                                                                         | Check                                                                                                | Status                                                                                             |
| ---- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| CI01 | SEO/parity/Space fixture and source controller                                      | Exact parser/error/cache negatives; actual isolated order/failure cleanup; complete source selection | Actual1e15 passes689/689 in100.936s; current validator follow-up needs fresh final-source CI       |
| CI02 | General offline handoff manifest                                                    | Existing generator/check; exact bytes and checksum review                                            | Regenerated, independently proved and actual1e15 scanner checks pass; F30 does not change outputs  |
| CI03 | Profile registry, RI/CI and delivery records                                        | Complete inventory, independent review and exact-head source/hosted checks                           | Actual1e15 source/preview pass; F30 final-source controller evidence remains required              |
| F25  | Authored navigation, existing navigation/article fixtures and Color source contract | Old actual native-scroll/Back failure; held timer/read/retarget cases; managed browser observations  | Managed1e15 article/Color/history and bounded functional cases pass; original failures retained    |
| F30  | Staging expected coverage and aggregate regression                                  | Exact0/1/2 catalogs, base/Color and failed summary/raw-row inputs                                    | Focused11/11 passes; retained-data revalidation and fresh controller admission recorded separately |

The whole-source measurement is complete before publication of this correction;
fresh GitHub Basic/navigation/owning/hosted checks then bind the exact clean head.
Existing controller staging remains a separate observed step. No merge,
production activation, external post or upstream disposition is supplied by CI.

## Issue synopsis

The same PR preserves the successful native-history correction and fixes the
observed source-suite cost and stale general offline manifest. Coverage and
budgets remain; final exact-source evidence and separate original gates remain
required.
