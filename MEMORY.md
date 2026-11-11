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

- The [11 November #188 checkpoint](https://github.com/oborskyivitalii/oborskyivitalii/pull/192#issuecomment-6805331637) records the latest verified SHA, the RI and handoff corrections, exact check results, and the next action. AC04 requires exact-head owner admission and protected merge.
- [#187 animation](https://github.com/oborskyivitalii/oborskyivitalii/issues/187), [PR #171 reviewer admission](https://github.com/oborskyivitalii/oborskyivitalii/pull/171) and [PR #79 essay](https://github.com/oborskyivitalii/oborskyivitalii/pull/79) remain separately owned.

## Next session

1. Check the live state of PR #192. **Merged:** go directly to step 5. **Closed without merge:** stop this procedure and confirm the next action with the owning issue. **Open:** continue with step 2.
2. Compare the live head with the intended correction from the dated checkpoint and any unpublished work. If the correction is missing, return the PR to Draft if needed, finish independent review and affected local checks, then publish the reviewed correction.
3. Verify the published head contains the intended correction and has completed independent review. Finish missing review and affected local checks before advancing. Mark a verified Draft Ready to collect missing native checks.
4. Recheck the full live head and protected `main` SHA against the reviewed identities. If either differs, return to step 2 and update the PR from current `main` if needed. Require current-head Source, Navigation and Owning acceptance success and the owner's exact-head review. Follow the [repository delivery procedure](guides/SITE-STAGING.md#trusted-change-admission-and-repository-delivery) from the first unfinished action.
   - Check the latest owner issuer run and dedicated App **Change admission** for this PR, head, base and attempt. For admission or refresh work whose identity is unclear, reconcile the recorded action with the owner and the workflow before deciding it is missing. Wait for matching queued or running work. Diagnose and resolve a failed or cancelled current attempt before retrying. If admission is missing, the owner runs **Change admission preparation** on `main` for PR #192 with the full live head as `reviewed_sha`.
   - Once App admission is valid, look for the PR-event `pr-admission` job in `site-color-review.yml`. Its successful `staging-admission.json` must match the current App check ID, run, attempt and protected base. The issuer publishes a separate check with the same display name. If the owner refresh is missing for this admission, the owner edits the PR description once. Record both owner actions and their run links in the dated checkpoint as soon as available.
   - Reuse successful current evidence. Proceed to the authorized protected merge only when the matching conditional check and the latest Owning acceptance are green, including the Owning run triggered by any refresh edit.
5. Verify the repository post-merge result for the actual merge commit, the reviewed tree and unchanged public bytes. Refresh this checkpoint with the observed outcome.

## Maintenance

- Use the [continuity protocol](CONTRIBUTING.md#repository-navigation-and-session-memory). Replace obsolete entries and rebuild/verify RI after changes. Keep detailed history with the owning issue, PR or versioned review.
