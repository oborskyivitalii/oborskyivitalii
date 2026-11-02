# R8 aggregate-capacity exploratory review

Date: 2026-11-02T13:14:54.109486+00:00

## Verdict

**PASS for this narrow capacity delta.** No blocking correctness or operator-interaction finding was observed. The unmodified CLI admits a repository above the former cap, accepts exactly 260,000,000 hashed bytes, and visibly refuses 260,000,001 bytes without replacing valid generated outputs. Recovery and the unchanged per-file ceiling also behaved as expected. This is an independent first judgment for the capacity correction only.

## Identity, intent and scope

- Role/agent: distinct nonauthor Exploratory / Interaction QA; task handle `/root/r8_capacity_exploratory`.
- Owner: issue 109 / existing PR 110. Supplied original intent is complete R8 PDF/PPTX delivery while preserving historical editions.
- Scope: only `MAX_HASH_TOTAL_BYTES` from 250,000,000 to 260,000,000 and its matching documented decimal-MB value. The relevant acceptance dependency is AC05 current RI/coupling; artifact-retention intent also supports AC02/AC04.
- Base and observed HEAD: `1044c6ee6effc3580ec735ead4f4f7f9ea26a069` / `1044c6ee6effc3580ec735ead4f4f7f9ea26a069`. This is a prepared, dirty working-tree subset, not a clean committed checkout.
- Scoped diff SHA-256: `ba8208530dbc3650ede40d7c3cfba878a611017d00a7bb366a9348dc7adc591c` (1304 bytes; exact command `git diff --no-ext-diff 1044c6ee6effc3580ec735ead4f4f7f9ea26a069 -- tools/repository_intelligence.py .github/REPOSITORY-INTELLIGENCE.md`).
- Read common/role prompts, root AGENTS/CONTRIBUTING, root README, RI contract/producer, relevant issue 109 AC/check mapping, existing hash-bound regression and test-allocation/workflow owners. No peer-report contents, author scratch notes, or unrelated memory were inspected. Git status exposed filenames only.
- I did not author implementation or accepted tests. No delegation or external writes were performed. Only this assigned report persists; the isolated fixture was removed automatically.
- The parent orchestrator owns the actual spawn receipt and must bind requested/accepted isolation parameters. Provider-internal model/context isolation is not independently observable here; no attestation is inferred from the task name.

### Independently recomputed input identities

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| `AGENTS.md` | 6747 | `ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988` |
| `CONTRIBUTING.md` | 19704 | `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442` |
| `agents/reviewers/README.md` | 6964 | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| `agents/reviewers/exploratory-interaction-qa.md` | 2850 | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| `tools/repository_intelligence.py` | 25006 | `9be024a28215c5852bb26893fc5696dc6543d7056f37c40500e796519178d821` |
| `.github/REPOSITORY-INTELLIGENCE.md` | 19524 | `29a6dc08787505c268b5b6e759d5e95949872f740a7ae8dd370d3fb7b7f74e43` |
| `review/issue-109/r8-reviewer-receipts/capacity-delta.json` | 891 | `acfba947c7b85a141d95b847b045b1c1db0fb0d641fcb97e8e802cd92abc161b` |

Both source hashes recorded in `capacity-delta.json` match the independently read current bytes. Those hashes and all prompt/packet identities were unchanged after execution. Byte comparison against the supplied base establishes that the scoped files contain exactly the two authorized replacements; exclusions, scan/error/output behavior, other constants and artifact content are unchanged by this delta.

## Charter and environment

Charter fixed before execution: explore admission above the old aggregate ceiling, exact-boundary success, visible over-limit refusal and recovery while preserving generated outputs; independently check that the per-file ceiling did not move. Bound: six CLI invocations, each with a 45-second timeout, within a 5-minute execution budget. No full suite, presentation render or live workflow execution was included.

Local environment: Linux / Python 3.12.14; actual fixture sequence completed in 1.601 seconds. The runtime skill was read; no `environment_status` tool was exposed. No network or credentials were needed.

Fixture: a temporary complete RI config/catalog, the exact candidate producer, root AGENTS and nine sparse binary payload files. Sparse files avoid allocating the full logical payload while exercising actual 250–260MB streamed hashing with production constants. Thirteen content inputs and both derived outputs were represented; no payload was excluded. The fixture has no Git index; tracked-path behavior is unchanged by inspection and was not dynamically retested.

## Actions, expected results and observations

| Case | Input hash bytes | Expected | Observed | Disposition |
| --- | ---: | --- | --- | --- |
| E1-admit-above-old-cap | 250,000,001 | Build succeeds; all inputs represented | rc0: `Built RI views: 15 files, 5 directories` | Executed/pass |
| E2-build-at-new-cap | 260,000,000 | Build succeeds at inclusive ceiling | rc0: `Built RI views: 15 files, 5 directories` | Executed/pass |
| E3-verify-at-new-cap | 260,000,000 | Generated views verify fresh | rc0: `Repository Intelligence context is fresh.` | Executed/pass |
| E4-reject-cap-plus-one | 260,000,001 | Exit 1, visible bound error; outputs retained | rc1: `RI unavailable: RI content hash bound exceeded at tools/repository_intelligence.py. Read authoritative sources directly.` | Executed/pass |
| E5-verify-after-restoring-cap | 260,000,000 | Existing valid outputs verify fresh | rc0: `Repository Intelligence context is fresh.` | Executed/pass |
| E6-retain-per-file-refusal | 260,000,000 | Exit 1 for 32,000,001-byte file, despite aggregate at cap | rc1: `RI unavailable: RI content hash bound exceeded at payload/00.bin. Read authoritative sources directly.` | Executed/pass |

The two expected refusals are exercised failure paths with successful test oracles, not hidden failed campaigns. Output SHA-256 pairs were identical before/after each refusal. Restoring the aggregate payload to the previously built valid value made `verify` succeed without rebuilding.

### Raw CLI observations

```json
[
  {
    "case": "E1-admit-above-old-cap",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json build",
    "hash_input_bytes": 250000001,
    "returncode": 0,
    "stdout": "Built RI views: 15 files, 5 directories\n",
    "stderr": "",
    "expected_returncode": 0,
    "expected_fragment": "Built RI views:",
    "pass": true
  },
  {
    "case": "E2-build-at-new-cap",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json build",
    "hash_input_bytes": 260000000,
    "returncode": 0,
    "stdout": "Built RI views: 15 files, 5 directories\n",
    "stderr": "",
    "expected_returncode": 0,
    "expected_fragment": "Built RI views:",
    "pass": true
  },
  {
    "case": "E3-verify-at-new-cap",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json verify",
    "hash_input_bytes": 260000000,
    "returncode": 0,
    "stdout": "Repository Intelligence context is fresh.\n",
    "stderr": "",
    "expected_returncode": 0,
    "expected_fragment": "Repository Intelligence context is fresh.",
    "pass": true
  },
  {
    "case": "E4-reject-cap-plus-one",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json build",
    "hash_input_bytes": 260000001,
    "returncode": 1,
    "stdout": "",
    "stderr": "RI unavailable: RI content hash bound exceeded at tools/repository_intelligence.py. Read authoritative sources directly.\n",
    "expected_returncode": 1,
    "expected_fragment": "RI unavailable: RI content hash bound exceeded at ",
    "pass": true,
    "previous_output_hashes_preserved": true
  },
  {
    "case": "E5-verify-after-restoring-cap",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json verify",
    "hash_input_bytes": 260000000,
    "returncode": 0,
    "stdout": "Repository Intelligence context is fresh.\n",
    "stderr": "",
    "expected_returncode": 0,
    "expected_fragment": "Repository Intelligence context is fresh.",
    "pass": true
  },
  {
    "case": "E6-retain-per-file-refusal",
    "command": "python3 -B <fixture>/tools/repository_intelligence.py --root <fixture> --config .github/config.json build",
    "hash_input_bytes": 260000000,
    "returncode": 1,
    "stdout": "",
    "stderr": "RI unavailable: RI content hash bound exceeded at payload/00.bin. Read authoritative sources directly.\n",
    "expected_returncode": 1,
    "expected_fragment": "RI content hash bound exceeded at payload/00.bin",
    "pass": true,
    "previous_output_hashes_preserved": true
  }
]
```

## Independent inventory check

The packet records the earlier measurement of 1,930 files / 252,761,955 bytes. I independently walked current input paths and obtained sizes with `stat`, using the inspected unchanged scan exclusions and derived-output treatment; I did not semantically read peer reports. The live prepared tree includes later receipt growth, so this measurement is a separate observation rather than a claim that the old measurement was reproduced.

```json
{
  "hashed_file_count_by_stat": 1937,
  "hash_input_bytes_by_stat": 252788285,
  "headroom_bytes": 7211715,
  "largest_input_bytes": 11726610
}
```

The current observed total fits the new limit, and the largest input remains within the 32 MB per-file ceiling. This check measures paths/sizes, not final full-repository freshness or a locked tree snapshot.

## Findings and regression allocation

No defect requiring a correction was found. Examined risks were accidental additional source changes, an inclusive/exclusive boundary mistake, silent binary omission, loss of the visible refusal/fallback message, output replacement on refusal, inability to recover, and an unintentionally relaxed per-file bound.

The existing `NavigationSafetyTests.test_hash_bounds_fail_without_silently_omitting_binary` exercises the individual-file negative. These independently executed aggregate-boundary scenarios are retained as manual diagnostic evidence for AC05. A reusable aggregate-cap-plus-one case could be added later to that same permanent class if an independently reviewed test change is desired; it is proposed only, not authored or counted as a new executed permanent test. Its existing route is `python3 -m unittest discover -s tests -p test_repository_intelligence.py`, `.github/workflows/navigation.yml`, job `navigation`, for enabled ready-PR/push/manual events. No new suite or mandatory broad campaign is proposed.

## Limits and next gate

- No presentation/native-device/physical-human behavior was evaluated: the changed surface in this review is RI tooling. This result cannot replace earlier artifact reviews.
- The complete repository `build`/`verify`, RI/CI coupling refresh/verification, full regression campaign and final exact-source AC checks remain the orchestrator’s integration gates. This review did not write generated views into the real repository.
- Live issue/PR state, CI result, publication and release authority were not observed or changed.
- Recheck the recorded source hashes against the eventual candidate before using this result. Receipt/catalog growth can change actual total bytes; the final inventory must remain under 260,000,000.
