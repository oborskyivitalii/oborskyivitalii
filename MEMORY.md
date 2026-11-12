# Session memory

Dated handoff. Last verified: **2026-11-12**. Revalidate live sources when resuming.

## Snapshot

- Verified `main` at `f51d3f4` after [PR #192](https://github.com/oborskyivitalii/oborskyivitalii/pull/192). [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188) and [#189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189) are closed.
- Active owner [#198](https://github.com/oborskyivitalii/oborskyivitalii/issues/198), [Draft PR #201](https://github.com/oborskyivitalii/oborskyivitalii/pull/201). The [versioned review](review/issue-198/2026-11-12-reviewer-admission.md) retains the independent findings and exact-source history.

- [#196](https://github.com/oborskyivitalii/oborskyivitalii/issues/196) / [Draft PR #195](https://github.com/oborskyivitalii/oborskyivitalii/pull/195) owns platform image export. See the [versioned review](review/issue-196/2026-11-12-destination-image-review.md) for current implementation and remaining editor evidence.

## Decisions

- #198 has its own PR and acceptance policy. Reuse relevant adapter source from [historical #171](https://github.com/oborskyivitalii/oborskyivitalii/pull/171). The older Draft and [WEB pilot #167](https://github.com/oborskyivitalii/oborskyivitalii/issues/167) retain separate ownership.
- Keep the five MEMORY sections, at most 120 lines and 8,192 UTF-8 bytes. Put detailed history and checkpoints in their issue or review.

## Open work

- #198 review of `42f2868` found two ways to overwrite independent review evidence. The next candidate reserves a new output path before dispatch. Current independent results and exact-head native checks remain required. The protected-base classifier selected the full control route.
- [#187 animation](https://github.com/oborskyivitalii/oborskyivitalii/issues/187) and [PR #79 essay](https://github.com/oborskyivitalii/oborskyivitalii/pull/79) have separate owners.

## Next session

1. Check live #201 head, protected base, role receipts and outstanding findings against the versioned review. Correct remaining findings and recheck affected scope with fresh reviewers.
2. After the required local and independent checks, move the verified Draft to Ready and collect exact-head Source, Navigation and Owning acceptance results.
3. Apply the [protected delivery procedure](guides/SITE-STAGING.md#trusted-change-admission-and-repository-delivery) from the first unfinished action. Reuse successful current evidence. For full control work preserve owner staging, full reviewed SHA, App admission and the matching PR-event admission receipt.
4. Verify protected merge and post-merge tree/public-byte observations before updating #198 acceptance and the handoff.

## Maintenance

- Use the [continuity protocol](CONTRIBUTING.md#repository-navigation-and-session-memory). Replace obsolete entries and rebuild/verify RI after changes. Keep detailed history with the owning issue, PR or versioned review.
