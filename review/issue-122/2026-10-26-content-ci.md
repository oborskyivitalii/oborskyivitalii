# Issue122 — content CI integration repair — 26 October 2026

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/122
Execution: a separate control repair from protected main83591bdf; test PR149 stays
Draft, unmerged and frozen atd4ea6bbd. This is implementer analysis; independent
Requirements, Code, White-box and Exploratory results are separate observations.

## Intent and acceptance

The maintainer explicitly requested isolated test-mode content/recovery acceptance
in comment6417255457. No production or new-article publication is authorized.
PR147 ordinary S and PR148 genuine repository M are delivered; original source,
artifact and admission identities remain historical.

Test checkpoints remain Talks marker C1 → retain Talks plus newer Home C2 →
restore only Talks while preserving Home C3. Use the existing owner-only
staging-regression route; it publishes immutable preview and PR alias but cannot
promote stable staging. Do not merge test data. AC03/06/08 remain open.

Before replaying those tests, repair two observed existing CI integration gaps
without changing guards, pins, budgets or introducing another harness.

## Findings

| Finding | Original source/run | Observed failure / supported cause |
| --- | --- | --- |
| CCI01 | Test C1d4ea6bbd, navigation40334261450, job121611486235 | Existing scanner-controlflow case fails because generated checksum proof requires current maintained v11 previews; C1 canonical Talks changed but review exports remained stale. The real prepublication route also independently checks previews and bundle, so isolating that unit test alone cannot fix delivery. |
| CCI02 | Same C1, preview40334261910, build121611744093 | Accepted selector successfully authenticates original PR147 S and genuine M148 and returns modecontent. Content source tests then fail at content-delivery.test because yaml is absent: light preview installs publisher dependencies but not the locked quality Node dependencies required by the content suite. |

Original navigation and preview logs were retained physically under
/tmp/issue122-content-test-native-c1 and by their native GitHub jobs. No unchanged
retry or evidence-label advancement followed these failures. C1 Basic40334261486
and owning40334261565 passed; those successes do not erase failed navigation or
preview or establish an accepted content gate.

Earlier local C1 setup failure remains separate: clean4c2e7a0e produced135/218
passes with83failures because publisher dependencies were absent. Same-pin local
dependency restoration produced225/225 at actual cleanf930bc49. Formatting and
derived-RI-only final local7f5862ef shares tree86b46dd7 with published d4ea6bbd;
that earlier result was never relabelled as final-source execution.

### Independent requirements and design review

Requirements and Code independently diagnosed both actual source paths before
implementation and accepted the bounded guard-preserving treatment below.
They corrected the inventory to18 tracked outputs:15 page HTML, one gallery,
static-preview manifest and offline-bundle manifest. The ZIP is generated outside
the repository; capture evidence is an input, not a derivative.

Final four-role source results remain pending until each role inspects the
completed implementation. No agent conclusion supplies owner control attestation.

## Decisions

- Admit exactly the existing18 tracked export paths as derived content inputs.
  No review glob, invented ZIP path, capture allowance, new publisher or source
  authority. Classification does not prove freshness; all current canonical,
  preview, bundle, checksum and scanner guards remain unchanged.
- Keep maintained repository exports fresh when content changes; report their
  generation cost honestly. Online platform bytes and performance observations
  remain independently inherited. Optional article downloads remain separate.
- After accepted selection returns content, ordinary preview installs the existing
  locked quality Node toolchain before content tests. Explicit staging/evidence
  already installs it and avoids duplicate work. Prototype/platform paths, pins,
  Python behavior, permissions and budgets remain.
- Deliver this protected control fix through its full route and exact-head owner
  attestation. A policy change cannot inherit PR147 S across intervening control
  edits; establish fresh ordinary S and reconcile genuine M before replaying C.
  Never insert these control edits into the test candidate and call it content-only.

## Sol tasks

| Task | Owned change | Verification | State |
| --- | --- | --- | --- |
| T01 | Exact18 derived-input paths in existing registry | Actual protected selector accepts produced paths with authored event change; nearby review/capture/version/ZIP/tool paths reject | Implemented; scoped test passes |
| T02 | Conditional canonical npm install after selection | YAML-decoded ordering and five-condition execution table | Implemented; scoped test passes |
| T03 | Clarify maintained-export obligation in content guide | No claimed offline/performance omission; all security/freshness owners unchanged | Implemented; independent review pending |
| T04 | Refresh derived coupling and RI | Policy body preserved; mapped current inputs/freshness | Pending |
| T05 | Current-source CI/full stage/App/merge/postmerge | Exact source/run/artifacts and human control decision | Pending |

## Acceptance evidence

The two affected existing Node modules pass23/23 prepared checks, zero fail/skip/
cancel/todo, in9.911s. This is a dirty prepared-source observation before final
metadata/commit, not native or clean-source acceptance. New cases retain source/
rights/history and freshness checks; no suite membership or budget is removed.
Actual current-head checks, four completed reviews and delivery are still required.

Whole AC01/02/04/05/07 remain accepted from delivered history. AC03/06/08 remain
open for test-mode content/recovery and final reconciliation. PR79/R38 remain
untouched and unpublished; main editorial content, stable staging and production
are not changed by isolated test candidates.


## Completed clean implementation checkpoint

At clean implementation52f2e32e/treee44ac9a3, all1124 selected PR source tests
across74 modules passed with zero fail/skip/cancel/todo. The separate ordinary
Basic/local build, full maintained lint, format532files, architecture and selected
owning mechanical checks also passed; owning issue closure remained false.

Four distinct nonauthoring agents completed source acceptance:
repository_delivery_requirements, repository_delivery_code,
repository_delivery_whitebox and repository_delivery_exploratory.
Their independent oracles verified exact18 actual producer outputs, all other
registry data, preserved prior workflow steps/conditions/permissions/budgets,
source-test dependency order/condition, unchanged site/docs and freshness/security
owners, and correct full-route classification. White-box independently ran23/23
affected-module tests at exact52, RootLayout15/15 and RI-CI20/20; operator QA ran
preview freshness, bundle freshness, RI and coupling17/17.

T04 is complete at that clean implementation checkpoint. T05 remains pending.
The final receipt only refreshes these observations and dated MEMORY/derived RI;
it does not relabel52 local results as tests of a later commit. Fresh exact-head
native CI and the control delivery gates remain mandatory.

The original failed preview log is now also physically retained alongside the
navigation log: preview-failed.log57348bytes, navigation-failed.log48395bytes.
Both preserve original C1 source/run; no new C1 campaign was started.
