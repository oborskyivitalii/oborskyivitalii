# Issue acceptance evidence

The owning issue holds original intent and stable acceptance IDs (`AC01`,
`AC02`, …). Before work, make each criterion observable and distinguish what a
deterministic check can prove from editorial, device, rights, review, live-state
or merge decisions. Preserve IDs when adding scope; append dated decisions in
the issue. A test chosen after implementation must still test the original goal,
including meaningful failure cases, rather than merely describe current code.

## Policy and the session handoff

A bounded policy at `acceptance/issue-N.json` maps every criterion to existing
named repository unittest methods or the fixed `node-basic` command, and to
explicit non-automated gates. [Issue #31's policy](acceptance/issue-31.json) is
the first worked mapping. It reuses the focused RI suite, real-repository
assertions and the existing economical basic site check. The linked issue stays
the authority for whether these IDs and check scopes reproduce its intent.

At the end of implementation/session work:

1. Complete or update the criterion mapping and deterministic checks, plus the
   applicable GitHub Actions workflow/policy. A session ending early records
   missing checks honestly instead of claiming the criteria passed.
2. Review affected RI and CI companions against the checked
   [RI architecture map](ri-ci-map.json); rebuild and verify the navigation views.
3. Run the mapping on the exact current source. Capture the report and CI run,
   policy digest, tested commit and tree, criterion results and pending gates in
   the PR. Put a short anchored criterion summary and exact evidence links in
   the issue; refresh MEMORY with the remaining action.

```sh
python3 tools/issue_acceptance.py validate --policy .github/acceptance/issue-31.json
python3 tools/issue_acceptance.py run --policy .github/acceptance/issue-31.json --report /tmp/issue-31-acceptance.json
```

The report must be outside the checkout so its creation cannot change the source
being measured. Local dirty evidence records the Git head/tree, changed-byte
digest and `source_dirty: true`; it cannot be cited as a clean commit check.
After committing, use `--require-clean --expected-source <40-character-sha>`.
The [acceptance workflow](workflows/issue-acceptance.yml) checks the raw PR head
or exact dispatch source with full history for the immutable base comparison,
uses pinned actions, and uploads the JSON even on failure. PR selection requires
exactly one complete local `Refs #N` (or full local issue URL) line; incidental
issue links, fenced/indented code examples and HTML comments never choose the
owner. Missing/ambiguous ownership, absent policies
and invalid policy maps fail with a retained selection report. Dispatch selects
an explicit numeric issue and can check the merged source. An unrelated future
site PR therefore selects its own policy rather than rerunning #31's unchanged
public baseline. It does not run hosted
profiles, publish, merge, edit issues or close them. Navigation/basic CI continues
to own its existing independently required checks.

Ownership selection reuses RI's bounded active-Markdown view, including literal
inline code comment markers; unsupported comment-bearing multiline/unmatched
code spans fail visibly instead of hiding the actual owner.

## What the report establishes

The report maps IDs to each check's result and source file digest, records exact
checkout head/tree, RI digest, policy/producer digests and source cleanliness.
Shared checks run once. Empty criteria/check registries, missing or duplicate
mappings, orphan checks/gates, missing named tests, zero test accounting, skips,
expected failures, failures and errors cannot produce an automated pass. Source
or policy changes during a run invalidate the report and any prior criterion
passes while retaining check diagnostics. Hidden Git index flags are rejected
because they can conceal edited source from an exact clean-head observation.
The policy cannot supply
shell commands, executable expressions, arguments or claimed human approvals.
Only one named stdlib unittest method or `node tools/quality/local.cjs` is allowed.
Named test modules are compiled from the current admitted bytes, bypassing stale
bytecode, and temporarily registered so stdlib module setup/teardown and skips
are honored; prior module registrations are restored after each check.

These are ordinary reviewed repository tests. They execute candidate repository
code and are not a target-owned validator of untrusted changes. Policy coverage
does not prove that the live issue's criteria are complete, that a document is
semantically useful, or that a person approved it. The automated scope of every
criterion states that limitation. `automated-pass` is check evidence;
`ready_for_issue_closure` remains false and human/merge gates remain pending.

## Issue evaluation and closure

When updating/evaluating an issue, rerun the accepted policy on the current exact
source (or inspect matching current-source CI). Compare each stable criterion
with its check evidence and its non-automated requirements. Do not cite an old
green run from another head or a synthetic merge as raw-head evidence. Attach
the report/artifact and exact run/ref links to the issue and PR, then separately
fetch and record current review, PR/commit linkage and merge decisions.

Close only after the original intent and all applicable criteria/gates are
satisfied and the accepted result is merged and checked. Record the merged
commit separately from the tested head, plus any deployment/publication status
required by that issue. Passing this workflow does not make a launch umbrella,
rights/device review or production activation complete. If a gate cannot be
automated, preserve its reviewer/decision/evidence route; do not replace it with
a prose substring or invent an approval in the policy.

When later work intentionally supersedes #31's unchanged-public baseline, keep
the historical intent/evidence and append an explicit approved scope decision
before changing or retiring that policy check. Acceptance criteria must never
be silently weakened to make a new build green.

Issue #33 explicitly supersedes the earlier expanded bootstrap requirement: its
[policy](acceptance/issue-33.json) checks the short router and root organization.
The original #31 policy and accepted evidence remain pinned to the accepted
source. Its unchanged-public assertion is not weakened; #33 has a separate
locator-only exception for the moved provenance guide. Permanent navigation
checks validate current structure; #33’s fixed public/history snapshots execute
only through its selected policy, so later publication work selects its own
acceptance. The scope decision is recorded in [issue #33](https://github.com/oborskyivitalii/oborskyivitalii/issues/33).

The Full-profile Python source preflight uses `tools/run_repository_tests.py`:
all `test_*.py` modules remain enduring checks except the exact numeric pattern
`test_issue[0-9]+_acceptance.py`. Those modules are source-pinned task evidence
selected through their owning policy, including their unchanged historical
assertions; the generic acceptance-runner suite remains a permanent check.
Selection regressions run in navigation, so future public edits do not implicitly
rerun closed tasks against obsolete public snapshots.
