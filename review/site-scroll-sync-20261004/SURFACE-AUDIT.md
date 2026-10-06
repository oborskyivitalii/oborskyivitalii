# Reading materials, architecture and security — 2026-10-05

The maintainer asks for practical refactoring across optimization, architecture,
security and performance; reports that Soft/Glass does not work; and asks whether
Astra is required. This is an authorized local continuation under #12/#13/#14.
No push, merge, staging, host or publication is performed.

## Concrete failure and fix

Frozen pre-fix Color HTML SHA-256: `5c9fa8d2b5cf05f9bb90b838ea4fcd4be506cebd863bfd69f5326a4c35d7f06c`.
On 1440px Home, Glass already blurred the hero. At 390px the hero uses
`display:contents`, has no painted pseudo-element, and its separately painted
children were excluded from material admission. Their fixed 92% backgrounds
and absent filter were identical across Soft and Glass. A stripe backdrop probe
confirmed zero pixel difference under the mobile heading when disabling blur;
the desktop surface had a real difference. This is a CSS/admission coverage bug,
not a failed select change listener.

`READING-SURFACES.cjs` now owns preferences, capability fallbacks, responsive
selectors, admission and material CSS. The ribbon module imports it and retains
its existing exported aliases. The desktop/mobile Soft and Glass alpha variables
are shared consistently; glyph opacity stays unchanged. Mobile Home's painted
children participate in admission; zero-sized parents do not. A compact media
change rebinds observed elements, storage events synchronize an existing tab,
and stale observer entries cannot re-admit removed targets. Admission retains a
six-surface desktop / three-surface compact cap and rejects ancestor/descendant overlap. Soft disconnects the
intersection observer and clears active attributes. No new timer, animation
loop, network operation, package or service is introduced.

Flight uses opacity on the content parent, creating a backdrop root. Filtering
the child content buffer no longer samples the distant scene in that phase.
The aria-busy rule removes child blur during travel and restores it at arrival;
the saved Glass choice remains selected. This avoids a filtering operation;
there is no isolated causal claim about total CPU/GPU improvement.
The first repaired candidate (992fdf2d…) still failed the unchanged compact Home scroll budget: p95 35.6ms >33ms. The final compact variant reduces admission from six to three largest panels and blur from 4px to 3px; its measurements are fresh, not inherited from that failed candidate.

Primary browser behavior reference: [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter#backdrop_root).

## Architecture assessment

The shared engine already separates math, immutable geometry, projection,
Canvas command submission and lifecycle/camera coordination. It retains one RAF,
a 24-second displayed phase, shared transformed vertices, bounded visible-room
and model caches, depth ordering and subpixel pruning. The router retains a
five-document cache and persistent header/Canvas. A WebGL migration or complete
engine rewrite is not justified by this change's evidence.

The useful boundary repair is material UI/DOM/CSS ownership outside ribbon
geometry. The optional exporter still replaces asserted exact source markers;
it fails closed on a missing/duplicate marker, but this is a maintenance coupling.
A structured optional-treatment hook is a sensible later change when another
renderer feature needs it. Do not expand the core API solely to remove working
marker checks without a concrete consumer and regression coverage.

## Security assessment and coverage repair

Review inspected the actual navigation, export, theme, archive and material
boundaries. The hosted router restricts routes/origin, checks revision/snapshot
identity and digest, bounds request length/time, and uses DOMParser plus imported
nodes from validated site fragments. Theme/material values are allowlisted and
blocked storage has a usable in-tab fallback. The offline file strips tracking
and embeds trusted generated page snapshots; its schema/script marker strings
are serialized source authored in this repository, not remote code.

The prior production scanner omitted review runtime modules. Its maintained
targets/expected coverage now explicitly include READING-SURFACES, RIBBONS and
FLIGHT. The existing HTML-injection/code-execution rules also cover those three
sources; unrelated historical fixtures are not treated as delivered runtime.
`check-offline-security.py` parses the exact standalone HTML, rejects executable
URLs/event attributes/external scripts/unexpected embedded-document boundaries,
and extracts/checks all six executable scripts. Runtime CI runs these export
checks, and the six exact extracted scripts received a separate two-rule Semgrep
scan with no findings and no parse errors. Two ambiguous compressed numeric
ternaries were spaced to make parser coverage complete without changing values.

These checks are bounded source/runtime checks, not an independent penetration
test or a claim about future hosting policy, hardware GPU cost, or native Safari.

## Exact-file evidence and measurements

Current Color HTML SHA-256: `34baf409c90f656ce182e4145cb9facd3fcb2015487f66dec5dd13ee28bd193b`.
Raw evidence is delivered in the performance archive; the Ukrainian HTML report
contains the measurement tables. No old smoothing/soak/factorial data is relabelled
as this source. Chromium 153 headless uses software rendering; CPU x4 is synthetic.

- 121 Node tests and 21 Python tests pass. Four new material tests cover bounded
  admission, overlap, invalid/detached entries and standalone serialization.
- Four desktop/mobile × Day/Night material profiles pass actual selection,
  reload, responsive changes, reduced-transparency restore, storage-event sync,
  route reuse and returning to Soft. Eight held actual flight phases have zero
  child filters while preserving the Glass selection; arrival restores filters.
  Blocked storage, unsupported blur and missing IntersectionObserver all pass.
- Stripe pixel checks on the current source show real blur in desktop and mobile
  Home in both themes. Frozen mobile pre-fix delta is zero; current mobile mean
  absolute RGB difference is recorded in the source-bound pixel-proof JSON.
- Soft and Glass each pass 80 actual-scene contrast views and 7,180 sampled points:
  zero failures, minimum normal-text ratio 5.630 / 5.514, large text 3.897.
- Seven lifecycle cases pass with Glass selected, including midflight freeze,
  retargeting, print, controlled hidden state, content-flight preference and 40
  warmed route cycles: DOM 4,357 → 4,362 (+5, within the +250 budget), listeners
  69 → 69. Three new Python trust-boundary fixtures verify encoded executable
  URLs, external active content, JSON metadata and legitimate citations/images.

Sequential three-repeat Soft/Glass × content-flight On/Off measurements and the
all-route CPU-x4 budget checks are recorded against the same HTML. Existing
idle/scroll callback p95 ≤33ms and idle busy ≤20% remain unchanged. Content-flight
callbacks are separately reported; they are not silently judged by the idle
budget. Paint trace duration is a browser-pipeline lab signal, not total CPU/GPU,
physical display FPS, energy or an exact real-device slowdown percentage.

Final sequential trace comparison (median Paint ms per trace second, three
repeats per cell):

| Profile | Content flight | Soft | Glass | Glass delta |
|---|---|---:|---:|---:|
| 1440px | On | 5.08 | 7.32 | +44.2% |
| 390px CPU x4 | On | 23.07 | 31.21 | +35.3% |
| 1440px | Off | 3.08 | 5.28 | +71.6% |
| 390px CPU x4 | Off | 13.23 | 23.03 | +74.1% |

The current all-route weak-profile maximum idle/scroll p95 is 29.1ms Soft and
31.9ms Glass, with maximum idle busy 15.62% / 15.50%. The first failed repaired
candidate is preserved separately; no budget was increased. Flight still has
outliers: the worst window p95 was 294.6ms in desktop Soft, Research → Writing,
including one 294.6ms painted callback among 18 paints. Its cause is not localized;
medians and passing idle/scroll gates do not establish smooth flight. A real-device
profile/reproduction of this transition is a concrete next performance target,
rather than attributing every pause to the Glass material.

## Decision

Keep Soft as the default and Glass as an optional material with its six-panel
cap and smaller mobile blur. The material is not free, but a global removal is
not required by the bounded evidence. Prefer profiling an actual slow device
before further renderer changes. This repair/audit is within the current agent's
scope. An Astra pass could provide independent review before adoption or release;
this self-review does not substitute for one. Publication remains paused.
