---
name: Work item
about: Preserve the intent and checks for a repository or publication task
title: ""
---

## Original intent

What do we want to change, why, and where did the idea/request originate?

Confirmed decisions and unresolved questions: clarify material uncertainty with
the maintainer; label assumptions before treating the scope as agreed intent.

## Owner and scope

Repository/paths, task type, current ref, exclusions, dependencies and open decisions.

## Acceptance criteria

### AC01 — Observable outcome

- [ ] Pass condition:
Deterministic test/policy selector and workflow:
Required human/dependency gate (or none):

Add AC02, AC03, ... with stable IDs before implementation. The PR implements
these criteria; `.github/acceptance/issue-N.json` maps them to executable checks.

## Plan and decisions

Next step and related issue/PR links. Preserve initial intent; append approved changes.

### Review / analysis / model handoff — YYYY-MM-DD

Short synopsis and decision/task status:
Owning PR and exact versioned `review/issue-N/YYYY-MM-DD-kind.md` section link:
Keep technical findings and tasks there; this dated heading is the issue anchor.

## Linked execution

PR URL(s):
Exact implementation commit URL(s), refreshed after rebase/squash:
Technical details and check logs live in the PR/commits; summarize intent and
acceptance here. Start implementation only after an owning issue exists.

## Completion evidence

Merged ref/edition; outcome versus intent; checks/review; deviations; remaining work.
Tested source head and merged commit (or explicitly not merged):
Deployment/publication evidence (or explicitly not deployed/published):
Acceptance policy/run artifact:

| AC | Deterministic check/test | Result | Exact source/run | Remaining gate |
| --- | --- | --- | --- | --- |
| AC01 | | pending | | |

Rerun mapped checks and reconcile this table before declaring ready or closing.
Unmapped, skipped, failed, stale or pending criteria/gates keep the issue open.
Leave open while required publication, deployment or cross-repository results remain.
