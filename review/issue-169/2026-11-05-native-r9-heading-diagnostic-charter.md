# QA-only heading diagnostic extension — prepared, not executed

Refs #169 / PR170. Author: `/root/native_r9_exploratory`. This is a bounded extension of the existing explicitly dispatched reader diagnostic after the actual hosted H2 keyframe failure in run42095940300. The source/artifact diagnosis remains preserved in [the hosted heading review](2026-11-05-native-r9-hosted-heading-exploratory.md). The earlier28-case results and the failed hosted result remain distinct evidence.

Only `review/issue-169/r9/reader-runtime-probe.cjs` and this receipt were authored in this task. No application, policy, runtime-family, workflow or test-owner implementation was changed by this reviewer. No local/CI browser execution or new browser pass is claimed. The prepared script requires independent Code/White-box review and a new coherent clean workflow/script/application commit before execution.

Observation script SHA256: `09e995a1726da63b7eeea7778f12a1af93a68f79798c35f6b1b36c98975984d9`. Predecessor script SHA256: `80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d`.

## Exact plan and unchanged bounds

| Scope | Existing | Added | Prepared total |
| --- | --- | --- | --- |
| Explicit cases | 28 | 4 filter-refresh + 8 Forward/history | 40 |
| Fresh contexts | 4 | 0 | 4 |
| Normal route legs | 16 | 8 history legs | 24 |
| Widths | 1440×900 and390×844 | 0 | unchanged |
| Normal cycles per width | 2 | 0 | unchanged |
| No-JS cases | 6 | 0 | unchanged |
| Total diagnostic deadline | 240,000 ms | 0 | unchanged |
| Workflow job limit | 10 minutes | 0 | unchanged |

All28 original case IDs remain in the plan, including the original16 normal route legs, reader/images/captions/alt/PDF/link/related checks, image viewer, real footer next/self-box CSS start/end, native Back scroll/focus restoration, error/request checks and all no-JS native link journeys. The four fresh contexts remain normal/no-JS at1440/390 with no reduced-motion or injected application state. The default10-second action/settlement caps, existing smaller evidence/history caps, raw event bounds, pinned browser/archive identity, clean start/end source/workflow binding, complete public-byte checks, screenshots/traces and `fullGate:false`/no runtime admission are retained.

Per normal width/cycle the new explicit IDs are:

- `normal-WIDTH-cycle-N-filter-refresh`: use the actual article's declared topic in the real archive select. When already selected, first choose All and then the actual topic, so this case includes a real value change. Observe the changed URL/heading and retained visible article card.
- `normal-WIDTH-cycle-N-forward-reader`: after the existing reader Back, bring the actual H2 into view, use the real same-topic select refresh and verify the URL is unchanged so native Forward remains available. Record heading HTML/text, direct live ink inventory and, if a previous span existed, its actual detachment after the parent text refresh. Use browser Forward to enter R9 and require the current visible heading text layer's actual native animation evidence.
- `normal-WIDTH-cycle-N-forward-back`: actual browser Back returns to Writing and verifies the newly recorded heading-position scroll/focus/URL. These two route legs are marked separately from the original16.

The sequence is now filter-refresh → original Writing-to-reader → original reader-Back → added Forward-to-reader → added Back → original footer-next → original footer-Back. The first cycle still executes the original reader/media/viewer checks. The same sequence repeats in cycle2 at both widths; no extra browser/theme/device matrix is introduced.

## Heading oracle and failure evidence

The native observer records each target node's identity, connection, text, direct-parent/ink ownership and nearest real route-block owner. On each of the four added Forward departures, the H2 owner must be `archive-heading`, visible in the actual departure viewport, with a real direct ink child or self-moving heading box. Pseudo-element-only motion cannot satisfy text movement.

The current animated layer must contain all current heading text and agree with the post-refresh text. It must emit one actual CSS `animationstart`, contain real keyframes and positive duration, and emit one matching `animationend` on the same node with positive elapsed duration and no cancellation. Existing camera/paint and block completion checks also remain required. No frames, events, fallback completion or successful arrival are synthesized.

If no earlier owned span existed, the report records `previousInkWasPresent:false` honestly; the browser check still proves real refreshed heading movement. It does not claim an old-node detachment it never observed. The separately owned deterministic application regression is responsible for proving the stale cached-reference negative; this diagnostic complements that proof with actual filter/history/motion integration.

Every case/context is predeclared and starts not-observed. Added/original leg accounting separates planned, captured and passed legs. A failure preserves available native animation/block/flight arrays, including when settlement itself fails, plus the existing failure screenshot and context trace. The script stops the dependent cycle on failure; later cases remain explicitly not-observed. No unchanged full hosted campaign is replayed by this author.

Only syntax validation (`node --check`) and canonical pinned Prettier formatting were executed for this script revision. Actual runtime bytes will initially remain unknown/unadmitted to the finite family guard until separately reviewed observations and owner policy are supplied. This QA diagnostic does not waive that guard, establish hosted acceptance, or authorize staging/production.
