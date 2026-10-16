# Session memory

Dated continuity, not live authority. Last verified: **2026-10-16**.

## Snapshot

- Main315da39d includes merged PR81: Cloudflare PR previews and one permanent
  staging remain; GitHub Pages staging is retired.
- #39 / PR40 remains Draft16d4b1cd, with local main integration and readiness
  corrections preserved separately. Nothing new is staged, merged or published.
- This branch prepares a minimal trusted-main Python audit installer dependency.
  Its review is `review/issue-39/2026-10-16-python-audit-compatibility.md`.

## Decisions

- The maintainer requests PR40 through protected main/permanent staging, then
  production. Stage the open PR first and preserve its admitted tree at merge.
- /stage uses the main workflow installer and PR requirements. The patched SDK
  requires the exact graph-verified installer bridge on main before that request.
- Retain unmodified Semgrep1.179.0; pin MCP1.30.0 and pip26.2.1. Verify the whole
  exact inventory and every active constraint, permitting only the named SDK
  constraint override. No advisory exception or budget change is authorized.
- This dependency preserves every public/runtime/producer byte; only eight exact
  installer paragraphs may differ in the607 protected paths from main315da39d.
- Keep the full feature acceptance policy in PR40 and all actual release gates.
  Self-review, source CI and a dependency merge do not supply release approval.

## Open work

| Owner | Next acceptance route |
| --- | --- |
| #39 installer prerequisite | Freeze exact source, pass Basic/style/format/lint/architecture, RI/coupling/owning/source checks; normal protected merge. |
| #39 / PR40 | Integrate main, prove exact checksum findings, finish compact JSON-LD and clean preflight, then ordinary one-host staging before merge. |
| #1 / #7 / #8 / #13 | Current rights/editorial/reader/device/independent, full/native/performance and live-origin acceptance. |
| #39 / #72 | Actual protected App/environment/immutable release settings, authenticated Pages predecessor, canonical migration and recovery. |

## Next session

1. Revalidate live main, PR40 and prerequisite PR/refs/checks; preserve original
   dirty worktree and failed/raw runtime evidence.
2. Complete and integrate only this public-byte-preserving installer prerequisite.
3. Resume PR40 readiness review, full feature policy and26-family preflight.
4. Obtain exact stable Cloudflare admission before merging the identical PR40 tree.
5. Freeze production from merged main; finish actual full/native/manual release
   gates, then perform only the ready authorized production actions.

## Maintenance

Keep these five sections and at most120lines. Issues/PRs own current acceptance;
replace stale observations at handoff and rebuild RI. Never store secrets or
private correspondence in memory.
