# Heading/Forward diagnostic failure — actual exploratory diagnosis

Refs #169 / PR170. Reviewer `/root/native_r9_exploratory`, nonauthor of the application changes and author of the observation harness. This result independently inspects the new raw report, native events, trace DOM snapshots and selected screenshots. No app/QA edits, additional run or current peer diagnosis was used. Provider model/context internals remain unknown.

**Verdict: real departure-phase product defect; no observer waiver.** The actual Forward journey mutates the outgoing Writing archive after its route units have been prepared. The heading/count become bare replacement text, and a selected topic landing becomes hidden while still marked departing. The phase consequently completes by watchdog. Arrival eventually succeeds, but that does not satisfy the original animation-completion invariant.

This is distinct from the earlier cached detached-ink-reference defect. The new pre-Forward observations honestly contain zero owned heading ink, so this execution does not prove that an old wrapper was present before the explicit same-topic refresh. It does directly expose a subsequent history-driven mutation during departure, after the corrected motion owner has prepared its units.

## Actual result and causal evidence

Run [42100535479 attempt 1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42100535479), clean source/candidate/workflow `299c39a66de16cd28c8b64c8054c4bb213adf996`, tree `dccbec1018e4ae25ae5a4015590139ebaca19029`. All40 planned IDs remain accounted:18pass,2fail,20not-observed. The original first Writing→reader and reader→Back legs pass at both widths, along with first filter/reader/viewer/error cases and all six no-JS cases. Both first added `forward-reader` cases fail. Later Forward-Back, footer and cycle2 cases remain not-observed.

The failure is the existing transition assertion:

```text
No timeout/fallback completion
actual: 'watchdog'
expected: 'animationend'
```

It occurs before the new heading-pair validator is reached. The saved raw evidence nevertheless explains why that validator also could not establish current moving heading text.

| Evidence | 1440×900 | 390×844 |
| --- | --- | --- |
| Before Forward URL | `/writing.html?topic=delivery` | `/writing.html?topic=delivery` |
| Heading before and after explicit refresh | `AI-assisted delivery · All years · EN + UA`; no owned ink | Same; no owned ink |
| Selected departure units / retained visible unit observations | 8 / 7 | 6 / 5 |
| Departure completion | watchdog | watchdog |
| Arrival completion | animationend | animationend |
| Heading/count actual text-layer native events | zero | zero |
| Selected topic-landing native events | zero | zero |

The mobile trace's actual `goForward` call is `call@793`; its after snapshot at37210.205ms has the article URL but still contains the outgoing Writing DOM:

- `#topic-delivery`: `data-route-block=departing`, row0, **hidden**.
- `#archive-heading`: `data-route-block=departing`, row1, **no child elements**, text now `All topics · All years · EN + UA`.
- `#archive-count`: `data-route-block=departing`, row2, **no child elements**, text now `30 articles`.
- The neighbouring ordinary section-note still contains its real `[data-scroll-ink]` child and emits native text-layer start/end events.

Desktop `goForward` is `call@386`; its after snapshot at19815.718ms shows the same mutation, with the hidden topic landing at row1, heading at row2 and count at row3. The pre-Forward screenshots visibly show the delivery topic and `6 of30 articles`, confirming the subsequent text/filter change rather than an initial All-topics state.

Native heading and count records contain only `::before` start/end events, each with0.7s elapsed duration. There are **no** non-pseudo heading/count ink-layer events. The topic landing has no native events at all. The real heading text has changed to All topics by the time the pseudo animation starts. A pseudo background animation cannot demonstrate that the replacement bare text moves. A hidden selected unit cannot supply the completion event the phase is waiting for.

The reported selected-unit totals and omitted hidden topic unit agree with those trace snapshots. Other visible units have real keyframes and native events. This is not a broad browser inability to observe animations or merely a missed frame sample. The watchdog is an actual product phase disposition, not the10-second diagnostic settlement timeout. The camera subsequently records an arrived article flight and article arrival completes by animationend; the failure screenshot therefore shows readable article content after the fallback release.

## Source mechanism and next bounded treatment

Inspected exact application source at299c39:

1. `navigation.js` changes document history through browser Forward before replacing the outgoing document. Its `navigate` sets the existing content busy, admits/reads the destination, prepares outgoing route blocks and awaits departure before camera/mount.
2. The still-mounted archive's independent `popstate` listener in `archive.js:155` calls `onNavigation('history')` unconditionally. That function restores filter controls from the now-current URL and refreshes the existing archive.
3. The incoming article URL contains no topic filter. Refresh therefore hides the delivery landing and replaces heading/count text with All topics/30articles, despite those same outgoing nodes already carrying departing state.
4. The corrected `wrapInk` can repair ownership **at preparation time**. It cannot prevent a separate archive history callback from deleting a freshly prepared child or hiding a prepared unit afterward. The trace proves that outgoing nodes with prepared route attributes have then received exactly that mutation.

The bounded fix hypothesis belongs at archive/navigation lifecycle ownership: suppress or defer an outgoing archive's history/filter refresh when a cross-document navigation owns the busy/departure phase; let the destination's normal mount apply its own URL state. Preserve ordinary same-document Writing filter Back/Forward and normal initial/tag/filter refresh. The existing `#site-content[aria-busy]` lifecycle and document identity can provide an observable owner boundary; the implementation owner should choose the narrow canonical rule and review its invocation ordering. No implementation is authored here.

A focused regression should model an outgoing archive receiving Forward/popstate while a native departure is pending: its selected landing must remain present, and heading/count owned text layers must remain intact through the wave. Also prove that same-document Writing history still updates the filters and a newly mounted Writing document applies incoming state. This should fail the current source and pass the correction before another browser campaign. The observer's current raw target/node ownership and snapshots are sufficient for the affected real-browser recheck; an unchanged rerun or more timing slack would not repair this product mutation.

After an evidenced correction, repeat the affected40-case diagnostic on a new coherent clean source, keeping40cases/24normallegs, the original28 IDs, all native H2/footer start/end/frames/positive-duration checks, existing time limits, source/browser/archive bindings and exact public bytes. Current runtime remains unadmitted; changed application bytes require the existing independent review and finite-family handling. Full hosted smoke remains a separate subsequent gate. Do not accept pseudo-element events as text motion, ignore selected hidden units or convert watchdog completion into animationend.

## Exact evidence and limits

- Public artifact digest `1abf690c0b15df3d9f7bae237d7c79cfc3359a1b34c280d841ebf2928ca9dded`; Color `634e6479f53cc7e367c3b6f35ba52ebfe08e130f51a09663d9d808cc2e13ca7f`; base engine `7663db9d0489123d242cda1c3ffadbae83170add3c35a717ba42b1bf5021a363`.
- Observation script SHA256 `09e995a1726da63b7eeea7778f12a1af93a68f79798c35f6b1b36c98975984d9`; manifest SHA256 `f17ef9d2cb9cdca560f12f66726d14db70e6346a403efd029cbabe2be2b1b7ce`. Start public verification and clean Git checks passed; final success-only public/Git checks were not reached.
- Actual Chromium153.0.8010.12 in the existing pinned Linux lane. Elapsed49,771ms within the unchanged240,000ms bound. No console/page/request or evidence-capture errors are reported in any context.
- Verified artifact13450480530: `tmp/r9-heading-diagnostic-failure/diagnostic.zip`, SHA256 `c245f96f74f2c3fee05b592741ac985b61982a6a78ff58603f9fa542d97328ed`, matching the supplied GitHub digest.49members. The extracted raw report was directly compared with its ZIP member.
- Raw report SHA256 `bca30e292cf41361c6ad4a2027847d12e0caf3ea183e1e15477a08daf0a63740`.

| Inspected evidence | SHA256 |
| --- | --- |
| Desktop trace ZIP member | `2e84be91d51c5bfc79064b56a1a08032d486373e6ace5d5ce91b4161374fc44b` |
| Mobile trace ZIP member | `96b829cdefff989c4b4b9de4b6e4883a435ec8f659cce9a7bb84d5664a9c3211` |
| Desktop heading-refreshed PNG | `5729eac3d0c17ad58637e8172baf859ee5d52c8cfb7766aa3973522038db8002` |
| Mobile heading-refreshed PNG | `61c9c680be4e1d441088182b2ce60c0d49621650b1474b9c86ba82f9adab51b8` |
| Mobile failure PNG | `6a9e25fb525fbf3ccad8327004e742964bdaf1034c9e02c6cec1581c4e4e2207` |
| `archive.js` at299c39 | `01d8803a9cc02edde612fa247a046cc9c295bc088ed8ba64e407ba00e34c35ed` |
| `navigation.js` at299c39 | `4cfcea740368dfcf9b19f189ccedd93b676df0383f7e29bed1c801b10dc82d24` |
| `scroll-entry.cjs` at299c39 | `c3a51a1148da710c2fd0add270cb8615bac6a5dd71a3430db5c6e5f32b83252e` |

This diagnosis does not claim the preceding18case passes establish the full charter. The two added Forward legs reached the article but failed required departure completion;20dependent cases remain not-observed. The earlier loopback footer pass and initial hosted H2 failure stay preserved. No physical-device, performance, new hosted, staging or production acceptance is implied.
