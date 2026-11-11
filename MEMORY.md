# Session memory

Dated handoff. Last verified: **2026-11-11**. Revalidate live sources when resuming.

## Snapshot

- Verified `main` at `0394f52` after [PR #190](https://github.com/oborskyivitalii/oborskyivitalii/pull/190). [#189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189) is closed. Its [post-merge check](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42993357348) verified the reviewed tree and unchanged public bytes.
- Latest production tag is `prod-2026-11-10.1` at `ca756417`. [#184 records delivery](https://github.com/oborskyivitalii/oborskyivitalii/issues/184). PR #190 had no production release.
- Active owner [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188) and [PR #192](https://github.com/oborskyivitalii/oborskyivitalii/pull/192). The [versioned review](review/issue-188/2026-11-11-analysis.md) records the Markdown and handoff corrections and the checked source.

## Decisions

- Keep the five MEMORY sections, at most 120 lines and 8,192 UTF-8 bytes. Refresh the same handoff as progress, interruptions and actual delivery change where work resumes. The preimplementation decision is in [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188).
- The maintainer split capacity, MEMORY and animation into [#189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189), [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188) and [#187](https://github.com/oborskyivitalii/oborskyivitalii/issues/187). #189 delivered 10,516,300 bytes of RI hash-input headroom with the existing caps.

## Open work

- At the last verified Ready checkpoint, PR #192 was at `4e6c128` with the Markdown correction reviewed and [Source](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43040441968), [Navigation](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43040438809) and [Owning acceptance](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43040438855) passing. [Admission for that SHA](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43040441950/job/130590483703) reported `missing staging admission`.
- This revision addresses the review finding on handoff freshness. Use [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188) to resolve the intended correction, current ACs and check evidence. AC04 requires owner admission and protected merge.
- [#187 animation](https://github.com/oborskyivitalii/oborskyivitalii/issues/187), [PR #171 reviewer admission](https://github.com/oborskyivitalii/oborskyivitalii/pull/171) and [PR #79 essay](https://github.com/oborskyivitalii/oborskyivitalii/pull/79) remain separately owned.

## Next session

1. Compare the live PR head with the intended correction from [#188](https://github.com/oborskyivitalii/oborskyivitalii/issues/188) and any unpublished work. If the correction is missing from the head, return the PR to Draft if needed, finish independent review and affected local checks, then publish the reviewed correction.
2. Verify the published head contains the intended correction and is covered by completed independent review, whether the PR is Draft or Ready. Finish missing review and affected local checks before advancing. Mark a verified Draft Ready to collect any missing native checks.
3. Require successful Source, Navigation and Owning acceptance runs for that exact live SHA and the owner's review before admission. Follow the [repository delivery procedure](guides/SITE-STAGING.md#trusted-change-admission-and-repository-delivery). The owner runs **Change admission preparation** on `main` for PR #192 with `reviewed_sha` set to the full live SHA. After admission succeeds, refresh the conditional check with a PR description edit.
4. After authorized protected merge, verify the repository post-merge result and refresh this checkpoint with the observed outcome.

## Maintenance

- Use the [continuity protocol](CONTRIBUTING.md#repository-navigation-and-session-memory). Replace obsolete entries and rebuild/verify RI after changes. Keep detailed history with the owning issue, PR or versioned review.
