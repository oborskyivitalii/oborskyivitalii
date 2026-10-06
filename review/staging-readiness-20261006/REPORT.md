# Full staging and merge readiness — 6 October 2026

The maintainer authorizes full staging of open PR #23, successful stable promotion,
then merging that exact reviewed head into protected main. Existing CI resolves
the open PR automatically; only the pinned official Wrangler Action publishes.
The existing ruleset requires PRs and current basic/RI checks. No production
GitHub Pages workflow is active. The earlier Writing-only pause is superseded.

## Initial current-source execution

Owner command [6015877140](https://github.com/oborskyivitalii/oborskyivitalii/pull/23#issuecomment-6015877140)
starts [run 37460990802](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37460990802),
controller main `1490f7d99fa636328cb09bca7eab9e7557d00769`, candidate
`cd257503f75190c5f8afa530550e297d8e17d185`. These are different identities;
the source candidate is published at
[96ad039a](https://96ad039a.oborskyi-author-ci-staging.pages.dev).
Target/build/publication, hosted smoke, full source regressions, hosted exact-byte
checks, captures/contrast, Lighthouse and full CPU/motion/five-minute soak succeed.
Linux functional matrix fails; Color and native collection continue independently.
Full static also fails and blocks promotion/merge.

Fresh static job 112261654080 reports unused world vector imports, new cognitive
complexity over 25 in navigation/Writing helpers, a double-space regex and 580
untriaged entropy candidates. Semgrep and Bandit have zero findings/errors;
advisories pass. Exact raw static artifact 11412468297 is retained in
`first-static.zip`. No thresholds, scanner coverage or exceptions are relaxed.

## Corrections before the next complete gate

- The procedural world factory uses existing `math.owns` in the supported
  missing-Object.hasOwn capability mode. The old full suite has 30 failures;
  isolated VM reproduces its TypeError on unchanged cd2575. All five routes ×
  both detail modes retain exactly the same serialized geometry/glyphs/normals
  as before, including when Object.hasOwn is absent.
- Remove unused vector imports. Extract identical navigation completion into
  one helper and split Writing diagnostic helpers without changing execution
  order or adding complexity exceptions.
- Same-document Back/Forward waits actual URL, restored archive controls and
  completed mounting rather than inspecting the page before popstate finishes.
- Endpoint takeover waits native wheel settlement (150ms quiet, strict 2000ms
  deadline) before footer growth. The original takeover tolerance stays 2px;
  every wheel sample is retained on success and failure.
- Print/Off/hidden fixtures record their actual trigger. Animated paths missing
  their trigger still fail; instant paths trigger at real page arrival. Print
  cannot pass without dispatching beforeprint.
- Color handover requires exactly one real mount event, opacity zero and painted
  camera progress at/after midpoint but before arrival. Every sampled crossing
  must remain hidden. Both departing/arriving planes, their fade/direction and
  bounded opacity remain mandatory. A RAF need not land in a 50ms interval.
  All route samples are retained before assertions, including failed cases.
- Review exact entropy candidates against public Git/source/artifact/checksum
  provenance. 581 exact additions (391 provenance plus 190 regenerated checksums)
  have independent review and a same-settings detect-secrets 1.5.0 scan with zero
  unreviewed non-RI findings. Preserve prior baseline entries, append only exact reviewed
  path/type/hash identities; do not allow arbitrary entropy or unknown values.

Focused regressions cover genuine missing-capability behavior, asynchronous
history restoration, unfinished native wheel, missed animated print triggers,
and invalid visible/premature/missing/duplicate native handovers. Independent
review confirms preserved geometry and substantive browser assertions.
Generation, fallbacks, previews, bundle and RI must be fresh for the new head.
The earlier paired Writing evidence belongs to source 0187dc9, not to these new
bytes; its supported optimization is retained, and the new exact head must pass
its own complete hosted performance gate.

## Second execution and remaining fixture corrections

Owner command 6016216333 starts
[run 37463381318](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37463381318)
for source `3442934`, served at
[f7b90cac](https://f7b90cac.oborskyi-author-ci-staging.pages.dev).
Full static, source checks, hosted bytes, smoke, captures, Lighthouse,
CPU/motion/five-minute soak and all 12 Color cases pass. The Linux matrix stops
after 73/390 rows: a held CSS navigation inspects
DOM before attachment, then closes its context with an unhandled goto promise.
This run cannot be accepted or promoted; successful partial jobs do not replace
the complete matrix.

Fresh functional artifact 11413763600 and the first run's native reports identify
three fixture problems. CSS delay must await attached DOM, hold and assert zero
paints, and release/drain navigation on every outcome. Native camera response
must await the actual target and a changed camera within 2 seconds, rather than
sample after 180ms. History must await the actual saved 400px position before
leaving and the matching URL/page/settled scene and native 400px restoration
after returning; the existing 2px tolerance remains.

An explicit adaptive device hold intentionally freezes camera and ambient phase.
The settling observer records this policy only after a visible, ready, matching
settled route remains quiet for 150ms; the live policy still requires two actual
phase changes at the same camera. Downstream mapping, endpoint and live gesture
assertions remain strict. A separate live-motion group may establish its initial
state through one recorded real public Off/On cycle when earlier heavy fixtures
have induced a device hold. It cannot retry individual gestures or reset a new
hold during that group. Motion/performance/soak budgets and the runtime policy
remain unchanged. Every new bounded observer retains raw timeout samples.

The WebKit opening next-paint timeout retains its original 1500ms requirement;
visibility/focus and observer state are added to failure evidence to distinguish
real scheduling defects from background browser state. No failed scenario is
declared successful merely because a different scenario passes.

Independent fixture review confirms the actual-state waits and preserved strict
downstream contracts. Focused negative regressions exercise DOM absence, early
paint, delayed navigation rejection, wrong native target, unchanged camera,
unsaved history, invalid hold and immediate re-hold. The final public resume must
produce two real phase changes, an active On control and unchanged native scroll.

## Native mode selection correction

The second Windows report (artifact 11415425401) passes functional 40/40,
analytics and navigation 7/8. Firefox desktop/dark retarget fails because the
fixture waits for a flight while its actual public control is Motion Off.
The preceding endpoint fixture treats aria-pressed false as Off, although an
enabled adaptive device hold also reports false. Subsequent unconditional
toggles can therefore choose the wrong mode. This is a reproduced fixture-state
defect, not evidence that a skipped flight satisfies the retarget requirement.

Named Off/On scenario groups must select the declared mode through real public
control events, retain the prior/selected state and establish actual live phase
changes before an animated group. Explicit Off freezing, spatial retarget,
native endpoints and original bounds remain mandatory. Selection happens once
at a group boundary; an unexpected new device hold or absent flight within that
group still fails. No runtime/adaptive policy or performance budget changes.

The third run 37466005422 binds source 428f5ee, immutable
[a5a68aa3](https://a5a68aa3.oborskyi-author-ci-staging.pages.dev).
It cannot serve as acceptance for a subsequent mode-fixture correction: the
final source head needs its own complete matching CI gate and stable promotion.

## Complete matrix findings and bounded causal screen

The third Linux artifact 11416411109 restores the complete collection: 390
functional scenarios, 12 navigation cases and 39 analytics cases. Functional
passes 385/390 and navigation 8/12, so this source is not accepted. Color 12/12,
static, hosted bytes, captures and the uninstrumented Chrome performance/soak
jobs pass. Windows artifact 11416350561 passes 40/40 functional, but only 6/8
navigation. macOS passes 20 functional and four navigation cases.

The first Linux WebKit normal startup repeatedly remains visible/focused with
one Canvas paint, one callback and no recorded error through its original
1500ms next-paint deadline. Later WebKit scenarios animate. Existing public
state does not establish whether a native RAF is pending, cancelled or rejected
by a private lifecycle condition; no scheduler source fix is justified yet.
Firefox records a new adaptive device hold inside live scroll/navigation groups
after a successful public resume. The viewport remains desktop, so the Color
ribbon mesh still uses step 1.25 while model detail and DPR already adapt. The
same Writing pose produces about 238–239 ribbon facets at that step and 99 at
step 3. This is a cost hypothesis, not a measured speedup or accepted remedy.

Run 37467434061 binds fixture head abfb1f2. Its public runtime is byte-identical
to 3442934 and 428f5ee. It corrects actual public mode selection and retains
failed endpoint rows before assertions; it does not fix a mid-group re-hold or
the WebKit first-frame stall. Its full results must remain associated with that
exact head even if further diagnosis advances the PR.

The dated private browser-gate CI screen records actual RAF request/entry/exit/
cancellation and private scheduler/quality state, using two fresh WebKit boots
and a balanced Firefox Writing control/mesh-adaptive pair alone and under the
same three-engine contention. Both variants derive from one exact current Color
parent and have distinct fingerprints with fullGate:false. Mesh adaptation
retains viewport projection, far range and mobile geometry; tier zero is exact.
No public runtime changes or deployments occur in this screen. Trace/stage
instrumentation adds work, so its durations cannot establish final performance
acceptance. A supported correction still needs the normal uninstrumented full
gate and matching stable promotion. Preserve every fixture failure as a failure.

Fourth-run performance artifact 11417463093 fails Research/mobile Lighthouse
TBT: the three trials report 327, 36 and 676.5ms (median 327ms, limit 200ms).
Third-run identical public bytes report 39.5, 103 and 34ms. Both use EPYC 9V74.
Both bind public digest
`0c382abbed60068edf76478d25867fd2dd9b5efd3e583b8c718005e110bb285b`
and Color fingerprint
`510876e970393525cbe5f8387013cef9ca6856f59ae4e2fec98274624452a1bb`.
Third-run performance artifact is 11415956829. Exact ZIP members for both are
`lighthouse-research-mobile-1.json`, `-2.json` and `-3.json`, with their source-
bound `lighthouse.json` wrapper and `lighthouse-summary.json` summary.
The recorded long tasks are assigned to space.js after load: fourth trial one
records 102.142ms at 2536.608ms; trial three records 153.478ms at 2443.953ms and
59.777ms at 2597.439ms. All have the same eight network requests, approximately
70.4KB transferred and zero font requests. The LHR contains no trace/profile/
stack, so attribution to a particular function or proof of infrastructure noise
is not available. This failure also blocks promotion and merge; do not rerun an
unchanged source merely to obtain green or describe diagnostic trace timing as
Lighthouse acceptance.

Late native endpoint growth now requires the actual growth marker and native
end within the existing 1000ms reconciliation lease, retaining every position,
range, motion and body/footer sample. The original 2px tolerance remains. A
supported-capability positive paint probe uses the same original 1500ms bound as
normal startup; it cannot pass on a frozen frame. Neither observer forces a
layout invalidation, resets motion or retries a failed gesture.

## Final acceptance and operation

The new source remains unaccepted until all full jobs and matching reports pass,
then stable alias verification and recovery recording succeed. Record the final
exact source/artifact/run/staging URL in #23 and issues #8/#12/#13/#14 before
merging. Preserve failures rather than treating successful data collection or
preview smoke as release acceptance. Stage while #23 remains open; merge only
after its lease-bound stable promotion. No new PR or custom deployment is needed.
