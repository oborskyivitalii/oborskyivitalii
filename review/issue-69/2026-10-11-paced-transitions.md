# Issue 69 — 11 October 2026 readable pacing analysis

Owning issue: [#69, readable pacing amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/69#readable-pacing-amendment--11-october-2026).
Execution: [Draft PR #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: primary-agent implementation analysis and self-review; independent findings
have a separate [review](2026-10-11-slower-pacing-review.md).
Inspected baseline: `214cdca976a2fd25166be361623e9f15a30a49e5`, tree
`d7096bb1d5475d8f7398742c986a22b228afc0d4`. New evidence is prepared on an
explicitly dirty descendant; final commit/tree and hosted checks belong to the
live issue and PR. The earlier preview is not evidence for the new pacing.

## Intent and stable acceptance

The maintainer found the block motion, fractal centering and flight too fast to
understand. This amendment preserves AC01–AC10 and all transferred #70 gates.
It changes presentation time while retaining native scrolling, a stationary
reading camera, opaque blocks with moving separators, and bottom-first reverse
departure/assembly. No merge or stable/production promotion follows.

| Motion                      |      Desktop | Narrow layout |
| --------------------------- | -----------: | ------------: |
| One departing visual row    |       600 ms |        500 ms |
| Fractal centering           |       900 ms |        900 ms |
| Actual route travel         | 1500–2200 ms |  1500–2200 ms |
| Reading framing restoration |       800 ms |        800 ms |
| One arriving visual row     |       700 ms |        600 ms |
| Native reading reveal       |       750 ms |        650 ms |

Rows have fixed serial slots, with no extra gap. Each row uses the clearance
needed by its complete visual envelope, with the same distance for all peers.
The first longer V5 candidate used one viewport-wide distance; actual review
found excessive offscreen waiting. Final V6 keeps more of each fixed slot visible.
Peers share their slot; native
dividers and paper follow the same path. The arrival curve accelerates gently
and settles instead of completing most of the movement at the start. Camera
legs add together: centering/restoration do not consume transit time. Regular
Home↔Research journeys take roughly 8–10 seconds; dense pages can take longer.

## Bounds and meaningful evidence

Actual native visual rows remain the grouping authority. A 24-row exceptional
guard returns the complete visible native content; it never compresses slots,
merges distinct rows or silently hides excess content. A phase watchdog is its
programmed duration plus 1000 ms. Fallback, watchdog and cancelled dispositions
cannot receive successful-animation credit. The independent 8000 ms holding
and network guards remain unchanged. The scene retains one finite clock/RAF;
CSS owns row motion and native reading reveals.

Raw navigation readiness remains reported. The revised quality contract only
credits additional **verified programmed presentation** relative to the frozen
214 schedule: `equivalentReadyMs = rawReadyMs - newPlannedMs + baselinePlannedMs`.
It retains the existing 3200 ms limit and 80/200 ms callback, 160 ms preparation,
300 ms paint-gap and resource limits. The selected 390 px Research/Writing
baseline presentation is 2258/2512 ms, preserving 942/688 ms execution headroom.
Actual wall-clock phase lengths are never subtracted; excess delays remain cost.
The existing 15-minute hosted browser bound remains. Its two independent
functional engine groups overlap with bounded concurrency two, preserving each
engine's serial cases and deterministic output. Both cleanup paths join before
the original serial CPU×4/Lighthouse measurements; a failed close suppresses
benchmarks. No cases or physical animation time are shortened.

Plans must match approved row slots and camera legs, the correct navigation
identity, complete ordered phases, and actual minimum exposure. Forged/missing
plans, overlaps, early completion and stalls are meaningful negative cases.

The almost-full historical reviewed-checksum ledger is frozen byte-for-byte.
One explicitly named companion ledger retains the same full exact-record shape
and independently proved public values. Its closed loader rejects malformed,
duplicate, missing and oversized inputs. All 4367 prior records, frozen baseline,
entropy rules and the original RI 2 MB source bound remain unchanged.

## Historical versus current evidence

[Historical selected run 38126522300](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38126522300)
passed for 214, including four CPU×4 flights and two Lighthouse trials. Its
readiness values were 2500.6/2388.4 ms for Research and 2792.2/2630.6 ms for
Writing. Its successful [immutable preview](https://d5dd2344.oborskyi-author-ci-staging.pages.dev/)
is the version the maintainer found too fast. Earlier failed runs and source
diagnoses remain in the preceding versioned refinement evidence. Neither is
reinterpreted as new pacing success.

Current explicitly dirty V6 evidence is retained in the separate
[summary](2026-10-11-paced-transitions-summary.json) and
[archive](2026-10-11-paced-transitions-evidence.tar.gz). The archive indexes 65
payloads and independently streams all 66 members including its index.
Registered source tests pass 411/411, and selected actual-browser cases pass
36/36 across Base/Color, desktop/mobile and both themes. Independent checks
pass ten native geometry/separator cases, sixteen sampled trajectories, twenty
lifecycle observations plus twelve actual interior-camera interruptions,
four generated Base camera model cases and eight
visual route journeys plus an actual mid-arrival Off cancellation.

Four isolated local CPU×4 cold/warm flights pass the existing execution guards.
Research raw readiness is 9586.7/9356.9 ms with 9202 ms programmed presentation;
equivalent readiness is 2642.7/2412.9 ms. Writing is 9319.1/9092.7 ms with 8856 ms
programmed presentation; equivalent readiness is 2975.1/2748.7 ms. Raw records
retain all work/paint/resource samples and actual phase completions. These local
results do not claim clean-head hosted, physical-device or release admission.

The exact checksum companion admits 193 individually proved public values after
separate independent verification. The [compressed proof](2026-10-11-paced-security-proof.json.gz)
retains the complete creation report, exact source lines, canonical producers,
artifact/archive bindings and the independent verifier, result and receipt.
The original 4957-record baseline and 4367-record reviewed ledger remain
byte-identical. Full security admission and final clean-head CI are separately
identified in that proof and the live issue/PR.

CS01, CS03–CS10 apply to lifecycle, native row CSS/controller,
navigation telemetry and quality/storage owners. Pinned formatting, source
lint, the bounded style guard, Basic, registered source tests, RI/CI coupling,
full static/security checks and independent review supply their stated scope.
Local actual-browser trajectories and lifecycle interruptions supply functional
evidence; they do not replace maintainer aesthetic or physical Safari/iPad review.
All whole criteria needing those, actual bfcache/find, full soak and delivery
decisions remain open.
