# Session memory

Dated continuity, not live authority. Last verified: **2026-10-22**.

## Snapshot

- Active task: issue122 T02-P, approved audit dependency repair before T02 delivery.
- Branch: work/issue-122-t02p-otel-repair; base main223ddc0c578c1ae357dc3c057cc8b4fa5a531caa.
- T01 delivered in merged PR123; main tree84aa1e581ead80796fb39b11c5a36f32fc613857.
- PR124/T02 is parked Draft at e8a8c54000fd4cca5cd17ab52eb63e6daf97df30.
- Failed T02 stage39819597415/1 found vulnerable OpenTelemetry API1.37.0 before upload.
- Canonical approval, task conditions and live delivery status: issue122.
- Versioned repair review: review/issue-122/2026-10-22-t02p-review.md.
- This is candidate preparation; live review/CI/merge must be revalidated.

## Decisions

- Maintainer explicitly approved T02-P after the proposal and dependency explanation.
- One active delivery: repair through current independent review/CI/staging/main/postmerge.
- Report the repair, then resume already approved T02 on updated main with fresh evidence.
- Keep Semgrep1.179.0/MCP1.30.0; update ten OTEL pins and add two required packages.
- Require exactly four reviewed compatibility records; preserve full graph and advisory checks.
- Scope permits a narrowly verified existing Bandit signature rebind if reproduced.
- All four distinct quality roles run on the candidate and affected corrections.
- No workflow, profile-selection, budget, protection, npm exception or publisher change.
- T03/production are outside approval; issue5/PR79 retains content-delivery work.

## Open work

- Requirements preflight accepted the task and necessary README command correction.
- Verifier/tests and exact91-package lock prepared; actual local graph91/147 passed.
- Nine focused unit methods and existing scanner positive selftest passed on prepared source.
- Independent code review verified the one unchanged Bandit boolean finding; binding updated.
- Candidate review, exact-source full audit/scans and required delivery remain pending.
- Whole AC01–AC08 remain open; T01.1–T01.5 are complete in the issue.
- T02-P.1–T02-P.5 and T02.1–T02.5 remain open until complete evidence is reconciled.
- Retain failed runs; do not retry unchanged vulnerable dependencies.

## Next session

1. Revalidate main, issue122, active repair PR, parked PR124 and exact review/check evidence.
2. Finish approved T02-P through current gates and protected-main postmerge; reconcile/report.
3. Resume T02 from updated main with integration review and fresh delivery checks.
4. After T02 delivery report and propose the next bounded step for separate approval.

## Maintenance

- Keep five sections and 120-line cap; rebuild RI after indexed changes.
- Git-backed website code is not duplicated into file storage.
