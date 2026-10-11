# Issue 69 — 11 October 2026 unified block-motion preview

Owner: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69).
Execution: existing Draft [PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: implementation and self-review; no independent review claimed.
This configuration-only candidate is historical after the
[fractal/focus/Credits cleanup](2026-10-11-preview-cleanup.md).
Base: published7cc plus preserved harness-only follow-up6e7cd70. Earlier local
3400 ms candidate08a2a67 and overlapping candidate5d9d810 are historical; the
current prepared source is dirty.
Exact source hashes and standalone/public identities are in [raw observations](2026-10-11-bounded-preview-observations.json).

## Latest intent and implementation

The maintainer rejected serial row waiting and explicitly requested overlapping
starts, 1–2 seconds for block phases and 1–2 seconds for flight. The prior
3–4 second complete-transition target and preview-first testing instruction remain.

The latest feedback identifies inconsistent departure/arrival styles and asks
for one configuration and one effect control on every page, again preview first.

Both departure and assembly use a fixed1000 ms envelope. A multiple-row
wave uses the same700 ms motion and distributes300 ms
between row starts. The next row starts before the preceding row settles; peers
and their dividers remain one unit. One row uses the complete1000 ms envelope.
Forward order is top-first; reverse is bottom-first. The existing native row
clearance, opaque ink/paper, visible fallback and24-row bound remain.

Camera timing is400 ms centering +1000 ms depth flight +350 ms restoration,
independent of route distance. Total programmed transition is3750 ms on every
page, regardless of visible-row count.

One root configuration in `site/engine/scroll-entry.css` owns row duration,
phase envelope, local reading stagger and easing. Both route phases and ordinary
reading entry use700 ms movement and `cubic-bezier(0.65, 0, 0.35, 1)`; timing
does not change by route or responsive breakpoint. Native row count determines
spacing within the shared wave envelope, rather than selecting another style.
Only ordinary reading distance changes from88 px to56 px at the narrow width.

The existing Color Block transitions checkbox now controls both route movement
and ordinary reading entry on every page. `createPresentation` owns the existing
stored preference; `SiteNavigation.contentFlight` notifies the controller once.
Disabling releases reading/route layers and cancels current block phases.
Re-enabling can observe untouched below-fold units without replaying read units
or resuming a suspended route. Base's implicit enabled preference is preserved.

CS01–CS07 self-review: canonical CSS/entry/scene owners; native layout, semantics,
route cache and cancellation preserved; no new observer, RAF, preference key,
network work or framework. CS08–CS10: prototype-only syntax/build and bounded
source guard; full behavior/style/performance/device acceptance is deferred
until visual approval. No test expectation, scanner rule, budget or workflow is
relaxed. Earlier7cc/V6 reports are not current prototype evidence.

## Limited exact-export observation

Chromium153, exact standalone Color export, ordinary CPU,1440×900 viewport.
Two actual click-to-ready journeys complete with native content settled and no page errors.
At360 ms, multiple native rows are simultaneously in motion:

| Transition | Raw readiness | Simultaneously moving rows |
| --- | --- | --- |
| index → research | 3874.2 ms | 2 |
| research → index | 3865.3 ms | 6 |

Actual CSS keyframes report the same700 ms movement and curve during both
departure and arrival. Both phase probes report1000 ms plans completed by
animation events. Off releases all waiting/active reading markers; the next
Writing route has no block phase and completes in1803.5 ms. On re-arms eligible
Writing content; Off during Research assembly settles its native content and
phase. Exactly one checkbox remains across mounts, and Off survives reload. Re-enabling after that reload also observes untouched
below-fold Research content; scene readiness while disabled does not mark it read.
A390 px configuration read retains the same global duration/phase/stagger/curve.

Syntax checks, pinned formatting of the four changed runtime/CSS owners,
canonical generation, checked Color artifact packaging, CS09's85-file guard
and regenerated RI build/verify pass. Source suites, Basic/full lint/security,
CPU/performance, hosted/device and full lifecycle matrices are deferred by the
maintainer's preview-first instruction; none is represented as current evidence.

This is a brief preview check, not a full browser/performance matrix. The
programmed3750 ms cannot guarantee four seconds on a stalled network or an
overloaded device. Physical Safari/iPad and maintainer appearance remain open.

## Delivery and acceptance

Auto-review rejected public Git pushes twice, requiring explicit publication
consent. The destination/account/scope checks did not resolve its objection;
no connector or indirect upload to GitHub was used as a workaround. Remote
PR71 remains6e7cd70 with the old serial timing. The current local code and
standalone HTML are concrete reviewable results; hosted publication awaits
explicit maintainer consent. No `/stage`, staging-regression or full tests ran.

AC01 retains its original planning evidence. AC02–AC10 and transferred#70
criteria remain open: current prototype observation is partial, not readiness.
After visual approval, update behavior expectations and resume complete testing
in this same owning issue/PR. Merge/stable/production decisions remain separate.
