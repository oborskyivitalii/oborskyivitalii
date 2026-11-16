# Session memory

Dated handoff. Last verified: **2026-11-16**. Revalidate live sources when resuming.

## Snapshot

- Production source `d37d099` is live in [release prod-2026-11-16.1](https://github.com/oborskyivitalii/oborskyivitalii/releases/tag/prod-2026-11-16.1). [Protected Pages publication](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43898780311) passed live HTTP, policy and browser checks.
- [#187](https://github.com/oborskyivitalii/oborskyivitalii/issues/187) owns the Writing-to-article pulse. [PR #197](https://github.com/oborskyivitalii/oborskyivitalii/pull/197) merged as `b7b95a1` after [exact staging](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43724987839) on `1fb240b`. Production retains the approved pulse and has [live transition evidence](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43898780311/artifacts/14242310497).
- [#196](https://github.com/oborskyivitalii/oborskyivitalii/issues/196) / [PR #195](https://github.com/oborskyivitalii/oborskyivitalii/pull/195) owns platform image export. [#199](https://github.com/oborskyivitalii/oborskyivitalii/issues/199) / [PR #200](https://github.com/oborskyivitalii/oborskyivitalii/pull/200) owns the repository workflow guide and its review gate.

## Decisions

- The maintainer accepted the closed-pulse Preview. Preserve the exact pre-pulse pose and Canvas continuity through article mount.
- The #183 release includes the five initial articles and two approved follow-ups. Original source dates and Writing archive years remain authoritative for the historical editions.

## Open work

- [#187 production closeout](https://github.com/oborskyivitalii/oborskyivitalii/issues/187#production-delivery-and-acceptance--16-november-2026) records the verified runtime and browser evidence. AC06 awaits integration of this tracked handoff.
- [#183](https://github.com/oborskyivitalii/oborskyivitalii/issues/183) records all seven production URLs and the observed author-site publication date of 16 November 2026. Committed site publication events and batch closeout remain open. The existing validator requires a complete archived production package under a path the current RI inventory excludes when tracked.

## Next session

1. Integrate this handoff and close #187 using the recorded release and browser evidence.
2. Resolve the tracked publication-evidence path for #183, then validate events against the frozen release and preserve the historical Writing year filters.
3. Keep exact current production and merge identities in the issue and PR closeout records.

## Maintenance

- Keep the five bounded sections and follow the [continuity protocol](CONTRIBUTING.md#repository-navigation-and-session-memory). Record dynamic admission receipts in the owning issue while a head is frozen.
