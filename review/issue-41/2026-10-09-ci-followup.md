# Issue 41 — 2026-10-09 CI follow-up review

Owning issue: https://github.com/oborskyivitalii/oborskyivitalii/issues/41
Owning execution: the same practical-positioning PR, linked in the live issue.
Reviewer: independent `positioning_review` agent for the workflow remedy;
execution/self-review for the two maintained test-fixture corrections.
Inspected before head: `279f9ba51cf597fb1bb067da45416ceab5c5523c`, tree
`4b7320f969d04bedae24b6022967a38a531550e7`. Repairs below are prepared-source
bytes; their eventual clean commit, CI runs and preview are recorded by the PR.

## Intent and acceptance

Retain the accepted content-only positioning and AC05/06/12/13/16 guarantees.
The first raw-head CI exposed a missing dependency for the selected acceptance
policy and two stale source-test assumptions. Repair these existing routes;
do not change public content, generators, runtime, budgets or gate requirements.
This follow-up does not supersede the separate factual/editorial review.

## Findings and dispositions

| ID | Evidence / path | Finding and bounded remedy | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | `.github/workflows/issue-acceptance.yml`, selected Issue41 policy | Formatter parity requires the existing Python toolchain, but the install step ran only for Issue58. Include Issue41 in that same finite selector and describe the step generically. | AC05/06/16 | repaired; new CI remains required |
| F02 | `tests/executive.test.cjs`, Talks negative mutation | The accepted omission of unknown talk-language fields made a replacement of `data-language="unconfirmed"` a no-op. Insert unsupported `data-language="en"` into the actual language-omitted swarchua article instead. Preserve assertions that the mutation is meaningful and reconciliation rejects it. | AC05/13 | verified |
| F03 | Same test, historical PMDay equality | Current Talks formatting differs from the older immutable PMDay amendment. Compare that historical card after reversing only the exact approved positioning amendment, preserving the older recording edition and all current-source negative mutations. | AC05/13 | verified |
| F04 | `tests/preview.test.cjs`, exact main comparison | Preview restoration uses `./` for Home while authored CTA uses `index.html#contact`. Canonicalize only the finite Home href base in the expected source; retain every query/fragment suffix and exact remaining content. | AC05/13/15 | verified |
| F05 | `.github/acceptance/issue-41.json`, new positioning criteria | Map AC13/15 to the focused non-automated positioning browser gate and AC16 to independent positioning review. Preserve original AC01–AC06 check/gate assignments, every preexisting gate definition and all 17 checks; merge and broader browser obligations remain open under their original criteria. | AC13/15/16 | mapping reviewed; current-source gate evidence remains required |

## Independent workflow assessment

The workflow diff changes only the installation step name and condition to
`issue58 || issue41`. `npm ci --ignore-scripts`, its locked manifest, Ruff
`0.16.10` and PyYAML `6.0.3`, all commands, action pins, checkout/source identity,
policy selection, triggers, gate execution and report upload remain unchanged.
No gate is skipped, no result is fabricated and no general installation predicate
is introduced. The guard independently reconstructs the exact two-line metadata
amendment against protected-main `338e3ff`; every other workflow byte must match.
An independent whole-file reconstruction of the prepared workflow passed.

The Issue41 policy records this specific dependency repair and observed Python
`ENOENT` instead of claiming workflows stayed completely byte-identical. Its
criteria and external gates retain their meaning. The task test requires exactly
one original selector and compares the entire resulting file; it cannot admit
unrelated workflow, version, command or gate changes.

The new `POSITIONING-BROWSER` gate matches the user's changed-copy/readability
criterion: ordinary exact-source 1440/390 PR smoke plus actual hosted desktop
and mobile reading/contact observations, with honest viewport, theme and access
limits. The [focused browser review](2026-10-09-positioning-browser.md) records
1363×936 CSS-pixel desktop and a mobile preset with an unknown CSS viewport;
it does not claim four exact manual 1440/390 Day/Night combinations. The new
`POSITIONING-REVIEW` gate covers independent exact-source content/style/scope,
RI/CI routing and evidence mapping without inventing maintainer merge approval.
These are separate requirements for the newly appended content criteria, not
substitutes for the original issue's broader acceptance. Independent parsed-JSON
comparison with raw head `279f9ba` confirmed the original six check/gate mappings,
all old gate definitions and all 17 checks are unchanged. Original AC03/05 retain
`BROWSER`; AC06 retains `REVIEW-MERGE`. Therefore focused PR readiness cannot
establish original issue closure or release, and the repaired clean head still
requires matching CI/source/public-digest reconciliation.

## Local validation and remaining gates

Both maintained test files were run with:
`node --test tests/executive.test.cjs tests/preview.test.cjs`.
The diagnostic run passed all six preview tests and eleven other executive tests;
it exposed the later historical PMDay equality in F03 after F02/F04 were fixed.
The final corrected Talks method passed separately with:
`node --test --test-name-pattern='Talks reconciliation' tests/executive.test.cjs`
(one test, zero failures). Thus all 18 distinct methods have passing local
observations; this is not represented as one successful final-head combined CI
run. The normal current-head source route must verify that observation remotely.
The touched tests use pinned Prettier `3.6.2` with the repository's explicit
100-column/strict-whitespace configuration; no public source was reformatted.

The existing preview fragment-resolution, query/hash preservation, external-link,
manifest identity and unexpected-link rejection checks remain active. No broad
whitespace normalization, source comparison bypass or removed negative mutation
was introduced. Local validation and this independent workflow inspection do not
establish live CI, browser/device, merge or publication acceptance.

## Prepared-source identities

| Owner | SHA256 |
| --- | --- |
| `tests/executive.test.cjs` | `d69b47353fb6d82744e24831e1e8aeb004e4d23bc6e452161cd15a0d56c3b2ce` |
| `tests/preview.test.cjs` | `6f47da67d099d4bd6e6e46b064b89453d4a90b0172624bb1f6a6463bef2bdad6` |
| `.github/workflows/issue-acceptance.yml` | `c25fff96e085686ba944766c41500b9391f34339cd0f30fcaf7ddaf8df757b0a` |
| `.github/acceptance/issue-41.json` | `f1e67b1018b34f1502f9bbfe35ec718908ed185eadac2ab793bda80409aaf833` |
| `tests/test_issue41_acceptance.py` | `afd36a8129c4bf36058e895048cc6b6762e543710a446e0512ee47bfba91392e` |

## Issue synopsis

Repair only the existing selected-policy tool installation and stale maintained
source-test fixtures. Public positioning content and its factual review remain
unchanged. Link this artifact in the same issue/PR, refresh RI and bind new normal
CI results to the repaired clean head before updating whole acceptance criteria.
