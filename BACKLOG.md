# Issue backlog audit — 2026-10-01

## Execution and publication pause — 2026-10-04

The maintainer now authorizes the engine/content plan and Writing fix under
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15)/#12 in stacked
Draft [PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16). Read
[the source/engine contract](site/README.md) and
[execution record](review/site-engine-implementation-20261004/EXECUTION.md).
`site/` is authoritative; `docs/` is generated-only. Every #13 mandatory job and
budget remains. The latest instruction pauses **all publication**, including
staging, superseding the earlier activation amendment below. Both deployment
workflow entry points have explicit false guards; configuration alone cannot
enable publication. No host/account provisioning, upload, production release or
merge is part of this work. Prepared packages/fixtures do not establish real host,
physical-device or independent acceptance. Re-enabling hosting needs a later
maintainer instruction and a separately reviewed change to those guards.

## Engine/content planning intake — 2026-10-04

- [#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15):
  [assessment](review/site-engine-plan-20261004/ASSESSMENT.md) and
  [detailed staged plan](review/site-engine-plan-20261004/PLAN.md) for shared
  templates, independent content/assets/engine and incremental page generation.
  Planning only; not a finished engine, CMS, hosting setup or changed release gate.
- Writing's new first-scroll report stays under #12/#14 and precedes structural
  changes. Exact-user reproduction remains open.
- This plan is a separate Draft PR above the existing #10 candidate. #5 remains
  article/Quartz/PDF owner; #8 hosting and #13 gates are unchanged.
  A universal publisher or engine refactor is not a new first-launch/article
  prerequisite. No issue is closed by this assessment.

## Engineering follow-up — 2026-10-03

- [#12](https://github.com/oborskyivitalii/oborskyivitalii/issues/12): completed v8
  audit; [S1–S4 runtime fixes and re-verification](review/site-audit-v8-20261003/SOL-TASKS.md) remain pending.
- [#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13): turn that
  evidence into recurring security/quality/performance/platform release checks;
  [implementation contract](SITE-RELEASE-GATES.md) is prepared, not implemented.
- Continue Draft PR #10, then the existing #7/#8 launch acceptance and gated
  deployment sequence. These tasks do not duplicate cross-repository harness #6
  or publishing migration #5.

## Current execution checkpoint — 2026-10-02

The dated audit below is historical. Current work is in Draft PR #9 (workflow/RI,
#3/#4) and stacked Draft PR #10 (site #1, release/rights #7/#8). The maintainer
requested a final plan review before a Sol implementation turn. The reviewed
[SOL-HANDOFF](SOL-HANDOFF.md) is now the execution entry point, with
[findings and source-input report](review/sol-plan-20261002/FINAL-REVIEW.md).

Sequence: revised candidate #1/PR #10 → applicable #7/#8 review and release →
PMDay #2 → distinct guides/measurement #11 after an overlap check. Publisher #5
and harness #6 stay separate. English and the five-work selection are settled.
No issue is closed and no merge/publication is implied by this planning record.

## Snapshot and limits

Inspected default-branch tip: `ae6a28391566097bbf1eced6bb013ab70b48fd82`.
This is a dated backlog/readiness audit, not live state or a full independent
semantic review of all old PR implementations. We inspected root/scoped policy,
the repository tree, all open PR declarations/changed-file listings, conversations,
review records, latest named checks and all current issue inputs. Older successful
CI does not establish current-target readiness. All nine pre-existing open PRs
across UA/Subprime were Draft; none is merged or closed by this audit.
Recheck GitHub before selecting work.

Recovered conversation ideas were checked against live owners/roadmaps/registers.
Already merged work and resolved research IDs were not recreated. Public issue
bodies omit private correspondence, employment discussions and confidential cases.
Recovered proposals remain decision candidates, not retrospective approvals.

## Existing PR follow-ups

No existing open PRs in the inspected snapshot. Site implementation begins through separate Draft PRs.

Full immutable head and acceptance details are in each issue. Issue and PR
comments provide bidirectional links without rewriting existing PR intent.

## Owner-scoped backlog

| Issue | Work | State at intake |
| --- | --- | --- |
| [#3](https://github.com/oborskyivitalii/oborskyivitalii/issues/3) | Implement issue workflow and agent guidance for the publication repository | Planned / decision candidate |
| [#4](https://github.com/oborskyivitalii/oborskyivitalii/issues/4) | Adapt UA Repository Intelligence for publication and migration navigation | Planned / decision candidate |
| [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) | Migrate pinned UA publishing mechanics into the personal publication pipeline | Planned / decision candidate |
| [#6](https://github.com/oborskyivitalii/oborskyivitalii/issues/6) | Build cross-repository agent routing and migration harnesses | Planned / decision candidate |
| [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) | Decide licensing and implement publication rights/provenance checks | Planned / decision candidate |
| [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) | Decide URL, deployment and boundaries for up to three sites | Planned / decision candidate |

## Existing launch and first publication

- [#1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1): personal site/about/two research
  directions/published index and precise public recognition.
- [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2): PMDay article and exact slide/PDF
  edition; depends on UA #133 and site publishing/rights decisions.

## Milestone issue sequence

| Milestone | Issues | Completion boundary |
| --- | --- | --- |
| M0 URL/language/architecture | #1, #8 | Recorded decisions before stable links |
| M1 author/about/research/published index | #1 | Inspected preview, checked source/recognition links |
| M2 PMDay article/edition | #2, UA #133 | Editorial/visual/rights approval and actual release decision |
| M3 publishing migration | #5, Subprime #48 | Pinned HTML/PDF adapter, real-artifact manifest and review |
| M4 Subprime capability | Subprime #48 | PR #46 independently reviewed; deployment separate |
| M5 issue/agent/RI/harness | #3, #4, #6; UA #132; Subprime #47/#52 | Local workflow/navigation first, full harness remains #6 |
| M6 licenses/releases | #7, Subprime #55 | Rights/license/edition decision before public reuse claims |

[Roadmap](SITE-ROADMAP.md) describes the milestones; these issues retain the work
and review evidence. No site deployment, Quartz migration or first article is
claimed complete by this workflow/RI implementation.

## Next operator action

Select an issue, recover its initial intent and current decision, inspect the live
owner state, and complete its accepted scope under the local contributor/agent
procedure. Comment in the issue and PR with exact outcome/checks/review before
closing. Parent tasks remain open for unfulfilled dependencies.

Cross-repository research ownership and migration routes:
[Repository map](REPOSITORIES.md).

## S0–S4 execution checkpoint — 2026-10-02

Launch #1 / Draft PR #10 now has the [v4 implementation and evidence](review/sol-execution-20261002/EXECUTION.md). Available checks/exports are complete; actual browser, editorial/rights, #8 URL/release and #9 integration remain. This checkpoint does not close launch or authorize publication. PMDay #2 and later #11 guides follow launch; no new duplicate task is created.
