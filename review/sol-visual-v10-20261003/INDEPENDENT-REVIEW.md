# Independent depth/motion source review — 2026-10-03

Reviewer: `/root/runtime_review`, separate from implementer `/root`. Owners are
runtime #12 and visual #1, continuing Draft PR #10. This is the independent
source/test and exact secret-baseline review requested by AGENTS; it is not
release, merge, deployment or physical-device acceptance.

**Outcome:** scoped source acceptance. Both concrete runtime findings raised by
this reviewer were corrected and have meaningful negative regressions. No
unresolved source or baseline-delta blocker was found in the reviewed material.
New actual browser, visual, sustained-motion and Lighthouse evidence is pending.

## Identity and inspected scope

The reviewed working candidate is based on immutable old commit
`4c3589fb23846677058705876a4e8e9a67ceaa46`. It contains the new frozen runtime
and producer/report changes listed below; it is not the unchanged 4c edition.
Its independently recomputed public digest is
`ee36c6bececcb797aa409418cdb94278b37608d2abf568ecaf0ad69fc8469164`.
All 13 public files match the current local artifact and its manifest, and
maintained raw/transfer/SVG size checks pass. That local manifest correctly marks
the working tree dirty; it is not clean-checkout CI or a published candidate SHA.
The later exact commit/run will be identified in issue/PR evidence.

I read the complete runtime, changed space/quality tests, motion producer,
validator changes, governing amendments and checkpoint. Only this documentation
file was written by the reviewer; no production or test files were edited.

## Findings resolved and observed verification

1. The pure exponential camera helper was correct, but its first runtime step
   still assumed a 60Hz frame. A read-only VM probe found different internal
   poses after the same 200ms at 30/60/120Hz. The first step now uses measured
   frame delta. The added live-RAF regression compares displayed camera to its
   actual displayed phase elapsed, rather than testing only the helper.
2. Writing's direct `initial` focus assignment could bypass device hold, hidden
   and print guards. A VM device-hold probe changed the displayed camera while
   the control remained still. The assignment now observes all frozen-state
   guards. The new test covers held/hidden/printing initialization events.

Independent execution of `node --test tests/space.test.cjs tests/quality.test.cjs`
passed **30/30** cases (25 space, five quality). Separate in-memory mutations
restored each old wiring error; the corresponding new regression rejected both
mutations. Thus these two tests detect the reported failures rather than only
restating the new implementation.

The suite checks cheap 30Hz painting at 60/120Hz RAF, one paint after a stall,
elapsed-time camera response, reverse/latest targets, clipping continuity,
fog bounds, pulse/inverse, quality/cadence recovery and exact displayed detail
freeze. Longer bounded settling replaces the former forced 80ms snap; final
endpoint, reversal and freeze assertions remain. New report tests verify actual
paint-start gaps/rates and reject altered declared summaries. The validator
recomputes these fields from raw callbacks; these are lab paint observations,
not physical display FPS.

An additional independent scalar-trigonometry check covered **647,840 points**
across all five routes, desktop/compact geometry and eight varied phases. It
checked the pulse/rotation/center formula without using the composed matrix as
the reference. Maximum forward and inverse coordinate error was
`1.4210854715202004e-14`; every point stayed inside its animated-center,
pulse-scaled bound (largest radius ratio `0.6114486919958191`). Positive uniform
scale preserves the inverse/Newell face-plane orientation relation.

All ten desktop/compact rest-world JSON records were compared directly against
4c and are **exactly unchanged**: 196 objects, eight route-specific motifs,
three recursive depths and immutable coordinates. The authorized animation
changes spacing by ±6.5% and local scale by ±4%; the 24-second articulation
period and finite topology remain. Existing closure tests check position and
velocity at the cycle boundary.

Near-plane sorting now uses the original face centroid through changes in
clipped vertex count. Fog is a bounded monotone smoothstep over camera depths
12–100, shared by surfaces/edges/seams/lines; no foreground opacity or per-face
filter is introduced. Mobile line batching retains adjacent painter order with
bounded alpha approximation of 1/256 instead of 16-level rounding. New visual
acceptance of that fog/pulse remains pending.

## Exact baseline-delta verification

Compared with 4c, the secret baseline still has **1,231** records: **1,218** are
unchanged; **13** IDs are replaced one for one, confined to seven offline-bundle
metadata findings and six static-preview metadata findings. All other entry
fields, owner, scope, rule and dispositions are unchanged. The additions are
exact Hex High Entropy String false positives; no broad entropy or path
exclusion was added. Scanner rules, scanner implementation, exceptions and
triage helper were not changed by this iteration.

For each added candidate, I independently matched its SHA1 identifier to the
literal SHA256 at the pinned scanner's actual JSON line, then verified the
checksum against the real renderer/generated HTML/ZIP member or whole ZIP.
This check did not rely on the triage helper's reported success.

The current generated ZIP has SHA256
`f78d9af8ab4a101667480ef43b2ba88ed3b41c59cec030c50ebdfe6b19d2ab3d`.
All 31 member hashes match the offline manifest; all 13 public members and all
review members match their current files. All 16 preview-file hashes and all
11 preview-source hashes match actual bytes. Each of the five interactive HTML
copies embeds the exact reviewed renderer. The seven distinct new checksum
values account for all 13 replaced path-bound findings. This is current-tree
false-positive classification, not a Git-history or universal security claim.
Final source-stable security after adding this review is the implementer's next
check and is not claimed as independently executed here.

## Limits and next evidence

All release thresholds are unchanged, including mobile CPU×4 painted-callback
p95≤33ms, idle busy≤20%, Lighthouse route/profile median limits, exact full matrix
and five-minute soak. Runtime cadence shares (17% mobile idle, 40% camera, and
separate desktop estimates) are adaptation targets, not release results or hard
work guarantees; the 7.5Hz floor can exceed a target on sufficiently costly
hardware. Actual CI measurements must pass the existing thresholds. Paint gap
and rate reporting is diagnostic and does not relax those gates.

The old 4c CI evidence establishes the 20/15Hz baseline only. Local browser
launch is blocked by the execution sandbox's Unix-socket policy; this reviewer
ran no new browsers or performance workloads and used no browser workaround.
Fresh exact-source CI must establish real paint gaps/costs, initial-load medians,
soak, all-engine/native behavior, and all-page Day/Night/mobile fog/pulse visuals.
Playwright WebKit is not branded Safari. Physical iOS Safari/Android Chrome and
hosted-origin/release evidence remain absent. Subsequent CI review belongs in
source-bound issue/PR comments, without rewriting this frozen source record.

## Reviewed material SHA256

The hashes exclude this record and later RI regeneration to avoid a circular
identity claim.

| Repository material | SHA256 |
| --- | --- |
| `docs/space.js` | `4b4affb4c3a38d255fa8f8166701bbc0c16a9985be267ffb80f66bc802b43c0b` |
| `tests/space.test.cjs` | `99fb902957bfc9aa2088fb26cea33ee2d0062630862458ca3c42e1d136026246` |
| `tools/quality/motion.cjs` | `ca20e21b0c4a3dbe09c3f487db39233cc93646229ab4029689cff1e31f8b7b3c` |
| `tools/quality/validate.cjs` | `9b2f2c969504a67dba64501766983730e87e5b225a2fa1a7f074a08d7b7e3ddd` |
| `tests/quality.test.cjs` | `0a1e6ec97461e17f2468846d4eb6558a1067869486366bd710ec7004eff7427b` |
| `tools/quality/budgets.json` | `c7f35f0390d472d5a943ff134d193969cab37b6f582f3766efe71012e9e0904b` |
| `tools/quality/secrets-baseline.json` | `7d1efdb12fa54dde12bed5a312370ab293161e3b98998683e290d58bfbac86c2` |
| `tools/quality/scanners.cjs` | `61fba3e843ae310426f85023c9a8ee72ba650233f1df3a8524e90903c9b75060` |
| `tools/quality/security-rules.yml` | `2fcea6e6de768e226d25778ed5bd3d4eb984016699af929ed06068d833c8fac3` |
| `tools/quality/exceptions.json` | `4c4ad9578157a01f59eda2f51ce232dbbbe9dfc4811646ab8bb7dd903eea57cb` |
| `tools/quality/advisory-exceptions.json` | `3e8e02cd4871d81f04562c7709fd7f875f7ac7f45dfc9df0b9317d4eba218e1f` |
| `tools/quality/triage-secrets.py` | `5a3ef05811b6643f51a25616ed368be01f5bcc56814691c88fc939db802ddfa0` |
| `tools/build_site_previews.cjs` | `7ea6faba078eca319b89a9d736069da3906216ed9627a7dbcf1dbd6cfd3889f8` |
| `tools/build_site_bundle.py` | `064710f81f684d88f14ce008c18fe9d36555c533d16d54b302014d411115c0f0` |
| `review/site-v1-offline-bundle-v9.json` | `7eb0f1c1ed3f415e2665f1c72bf6c9d12c10914b22f60add524f6fb1b83a6bc4` |
| `review/site-v1-static-previews-v9.json` | `7747d96c8f253f20df3a72152d602000893054776a76470f897d3e1adc428b30` |
| `AGENTS.md` | `cf8d19389119d28c3419f968786233baad7b8ba07de62e703683c2bd15d094fd` |
| `SOL-HANDOFF.md` | `0de5a2e10801ea6ac58b84008176fc3d6a0e4084e5a4060adec259bd70bf7b93` |
| `SITE-RELEASE-GATES.md` | `6f1fc5456eb33b6e9e577a0110692c30a61d7e6b13b69df9af21725934005593` |
| `review/sol-visual-v10-20261003/CHECKPOINT.md` | `b145a6d25e57469745d0e14be67c7e999f24fa09f3e9bb216c131cf2dffe616d` |

Pinned raw detect-secrets input SHA256: `0a400a3246f2f046cb3ab36ccacc50f08b32a1c246c3c79e4c7052763f30e09e`.

Recorded at `2026-10-03T15:22:16.860900+00:00`.
