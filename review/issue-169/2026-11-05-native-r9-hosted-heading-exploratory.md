# Hosted R9 heading-animation failure — exploratory diagnosis

Refs #169 / PR170. Reviewer `/root/native_r9_exploratory`, source/artifact inspection only. No application or QA edits, additional browser run, local Chromium retry or peer-result reading. This is a new failure diagnosis, distinct from the earlier bounded loopback footer correction and the separately owned content-retention failure.

**Verdict: the hosted reader gate remains failed.** Actual evidence reports no real CSS keyframes for a departing Writing archive heading. Source inspection identifies a reachable stale-ink ownership defect that is the strongest explanation. The artifact does not preserve the failed flight's DOM/animation inventory or trace, so the exact live-node state and failed leg remain unproven. There is no evidence supporting a frame-count waiver or an unchanged campaign rerun.

## Actual failure and inspection boundary

Run [42095940300](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42095940300), job127487701705, served source `1c060edd33259800420ec314c6245c72be32eda8` / tree `640907753a9a7179612a29f85ca01abda71cf2d2` at `https://86364091.oborskyi-author-ci-staging.pages.dev`.

The actual `preview-smoke.json` is `pass:false` and reports:

```text
actual common CSS animation exists:
{"tag":"H2","classes":"archive-heading","layer":"children",
 "state":"departing","row":4,"frameCount":0}
```

The failing assertion is `validateArticleBlockUnit` in `tools/quality/article-browser.cjs:1263–1285`. A selected visible nonreader heading is expected to expose an actual animated child layer; the validator observed no keyframes for that unit. The complete article observation array is empty because `articleJourney` appends a normal journey only after the whole journey returns successfully. This does not mean that no article interaction occurred.

The artifact retains HTTP identity results, four completed five-route shell rows (1440/390 normal and no-Canvas, all passing), two desktop reader captures and one Research fallback capture. The desktop reader opening visibly shows the R9 title/subtitle/hero and the source badge; the ending capture shows the R9 closing argument, tags, three related recommendations and reference/author controls without visible clipping. These screenshots are not frames of the failing heading animation. The reported checkpoint is a settled article at extensionless `/articles/the-sdlc-is-out-of-balance`, scroll9914, `busy:false`; it does not identify the previous failing flight. No failed-flight `blocks`, native `animationstart/end` inventory, heading child/connection state, or trace is present in the five-file artifact.

The actual Color fingerprint is `1fce9ff8d1acbf867828680a0a68fa386ed8571a4828442ab9167227bffb42e0`, base engine `72702f750f37e9cc6678b2d1181da57aa8c121293ebf70c9deae4e7aec568237`, public artifact digest `48db534cad4386f16e7469eb1e4e0b9fc42061065ae8e2aa6b423d44dbe6697b`. The hosted HTTP report passes its exact-source preview checks. These passing subsets do not replace the failed reader flight.

## Source-confirmed reachable defect; exact failure causality still bounded

All cited application/observer files were inspected at commit `1c060edd33259800420ec314c6245c72be32eda8`. The current local prepared retention changes do not alter those files.

1. `site/engine/archive.js:116–120` unconditionally assigns `heading.textContent` and `countLabel.textContent` during `refresh`. The same refresh runs for filter changes, history/popstate, tag readiness and other archive updates. Assigning parent textContent removes its existing child nodes, including any `[data-scroll-ink]` wrapper.
2. `site/engine/scroll-entry.cjs:221–225` reuses `knownRecords.get(element)` for the retained heading. Its stored `record.ink` reference can remain truthy after the DOM child was removed; `refreshInventory` does not invalidate a detached/replaced ink reference.
3. `wrapInk` at lines255–262 moves the element's childNodes into a real span and stores that span as `record.ink`. Both route preparation at lines701–703 and ordinary reading setup at lines866–867 call it only when `!record.ink`; neither checks that the saved span remains a child of the owner.
4. For native nonreader headings, route preparation selects `layer:children` and leaves the heading itself without `data-route-layer=self`. The real CSS at `scroll-entry.css:134–143` animates direct element children (and a pseudo layer), not bare text. A stale saved span can therefore cause the runtime to skip replacement while visible heading text has no real child animation.

This is a reachable product invariant failure even without assuming a browser timing problem: once a live wrapper exists, an archive refresh can remove it, and the next preparation can trust the detached reference. It is consistent with the actual H2/children/frameCount0 failure. The archive count has the same text-replacement pattern and should be covered by any bounded correction, even though the retained observed error names H2.

The observer itself captures actual `animationstart` keyframes in addition to at most five frame samples. It ignores pseudo-element events and reads a nonself unit's direct children. A pseudo layer alone would not demonstrate that bare heading text moves. The observed zero frames could theoretically also result from incomplete observation/lifecycle ordering; the current artifact lacks the DOM/native-event data needed to exclude that alternative conclusively. The absence of a live wrapper has not been directly observed in this hosted run, so it remains the specific causal hypothesis rather than a falsely claimed captured fact.

The maintained full `normalJourney` additionally selects the article's topic, exercises Back/Forward/filter state, deep refresh and native destinations. The earlier successful28-case loopback charter did not reproduce all those state changes and intentionally did not call the runtime-family block validator. Its16 successful route legs and four footer self-box transitions cannot establish this full hosted gate or refute a mutable archive-heading defect.

## Bounded treatment and next evidence

Do not increase the frame/time budget, remove the H2 unit, accept a pseudo-element animation as text movement, loosen the CSS-keyframe assertion, or reuse the loopback footer result as a hosted pass.

The smallest evidenced correction hypothesis is to restore the motion owner's live-child invariant when an owner has replaced its text: validate/recreate the current owned ink span in both ordinary reading and route preparation rather than treating a nonnull old reference as a live layer. Preserve archive text, semantic DOM, exact child movement, existing bounds and the reader's whole-box policy. Application implementation and independent review belong to their existing owners; no fix is authored here.

Before another full campaign, use a targeted existing-source fixture or bounded diagnostic for this state sequence: create the normal heading/count ink layers; perform an actual archive filter/history text refresh; show that the old span is detached; prepare the departure; verify that the current heading/count text is inside the actual live moving layer. Include Back/Forward and a second preparation, rather than testing an isolated static heading only. A deterministic negative proving the current failure and positive on a source correction would substantiate the invariant without a blind hosted rerun.

If the exact hosted failure remains disputed, use one bounded observation at the same maintained journey point. Retain the failed flight's route/document IDs and complete block units; heading `outerHTML`, child count/text and `[data-scroll-ink]` ownership before/after filter/history refresh; native start/end/cancel events with actual target node IDs and keyframes; phase completion reason and a screenshot/trace. Compare this with the existing frame observer. A live heading layer emitting paired real events but missing from the record would identify an observation defect; absent/detached live ink or absent/cancelled native text-layer animation would identify the product path. This is proposed diagnostic evidence, not an executed case or a new mandatory matrix.

After an evidenced correction, regenerate owned public/runtime bytes, complete affected independent review and the current mapped source/hosted checks. A changed runtime needs exact identity/rights-family handling through the existing route. The content-retention correction and its check remain separate.

## Evidence identity and limits

Downloaded artifact13446304353: `tmp/r9-preview-smoke-failure/smoke.zip`, SHA256 `7b7912d895543637b7cbc8d4889d44a941d3dc180606df29c16e5571e40c5167`, equal to the supplied GitHub digest. All five extracted members were independently byte-compared with this ZIP.

| Inspected bytes | SHA256 |
| --- | --- |
| `preview-smoke.json` | `7ccab21f0a345883ecd7642f52c479b167635cc9ac4d2be38f65205488dd6ccd` |
| `http.json` | `9e92fc42b4a35b9e32102c131d836ba681d0623b30eaa09690a054c1537779f0` |
| Desktop reader opening PNG | `4a4440ae8fcb7fd88ec50aab75e248b75746e1c86730b742ce70b9b4e1970fc4` |
| Desktop reader ending PNG | `c2c8dcb7855bc903afa5346872049cbe2970fc386aee87ec48edae7f7edb5924` |
| `site/engine/archive.js` at1c060 | `01d8803a9cc02edde612fa247a046cc9c295bc088ed8ba64e407ba00e34c35ed` |
| `site/engine/scroll-entry.cjs` at1c060 | `268ed2aed873105d229f54b146f34b5f1fd3c40cad8d83759cc0aa1635619b4d` |
| `site/engine/scroll-entry.css` at1c060 | `5a08c6aa17ef01f398663c428d2c89ea2aefa98956bd4a13806a9702f0dbe915` |
| `tools/quality/article-browser.cjs` at1c060 | `b52c67fca8ce592531d1574b5886b95d2dd95f614b460bcecf460c229f36b05c` |

Observed environment is pinned Linux x64 Chromium lane, Ubuntu image `ubuntu24`/`20261101.360.1`, Nodev24.19.0. The report has `fullGate:false` and `deploymentAuthorized:false`. This inspection does not make new live-browser, physical-device, performance, full article-matrix, staging or production observations. Missing failed-flight evidence remains missing; the hosted failure stays preserved and unresolved pending an evidenced correction/diagnostic.
