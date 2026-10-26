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


## Writing bootstrap correction — prepared candidate

Frozen remote e5f9d3b2/tree5863806e passed native Basic40339533065 with
74modules1124/1124, RI/owning and hosted smoke. Owner stage40340587156/1 then
failed Writing simulated TBT245ms >200. Native archives launched successfully;
prepublication26/26, source1124/1124, static and full-host proof passed. No stage
promotion occurred. Preview comment-job HTTP500 is a separate retained reporting
failure. Neither result is replaced by local or diagnostic observations.

The one native startup profile40351209955/1 retains original artifact12664425612,
20147bytes, SHA2564b2e7acc3954098d78ee219720cb8ef8265b090188a8052306225b0c9065ace8.
Ready/active Writing had no page/request errors. Actual CPU4 stage timing shows
model106.9ms nested inside first projection157.9ms, then paint42.1ms. Medians over
30paints are projection5.6ms, sort3.05ms and paint8.35ms. Instrumented loopback
profiling is diagnostic only, not Lighthouse acceptance or CPU-model causation.
The first native setup40348477192 timed out before browser restore/capture on
slow Azure APT downloads. Existing primary-archive setup was reused verbatim on
the never-merged diagnostic branch; it is not a permanent harness addition.

Fixed hosted method pair40355135427/1 retains artifact12665153918,6763928bytes,
SHA256dbdd5f726978bb321798f0edb09428e773080bf820a4869e348e3b23afd9f821.
Simulated281.5ms and DevTools232.729ms both exceed200. Lighthouse also derives
four different quiet windows; late Writing targets were no longer present.
No method switch, acceptance claim or unchanged staging retry follows. The
original simulated method, scenarios, trial counts and numeric limits remain.

The evidenced scheduling hypothesis edits only site/engine/lifecycle.cjs:
prepare the missing cold Writing model inside the existing guarded RAF, yield
through its single pending owner, then actually paint on the next callback.
Fallback/readiness and all ambient/journey clocks stay unchanged until paint.
Preparation stays inside startup traces/callback costs/readiness deadlines;
its measured cost accumulates across variants and joins the first quality vote
once. Off/reduced, hidden/print/failure, early navigation and compact/theme changes
retain their contracts. Other direct-route startup paths are unchanged. Total
readiness includes the extra yield; a native performance pass is not predicted.

Requirements and code roles independently reviewed this hypothesis before code
changes. Completed-source requirements/code/white-box/operator review is pending.
Applicable CS01/04/05/06/07/08/10 map to AC04: canonical lifecycle owner, no second
clock or style/layout owner, unchanged limits, generated dependencies rebuilt,
existing selected lifecycle/geometry suites and actual cold hosted acceptance.

Initial dirty-source existing-space execution retained72tests/62pass/10fail:
the ten failures all assumed Writing painted in its first RAF. Their original
log is retained. The existing initial-route helper now explicitly asserts the
unready/no-paint preparation callback before the real paint; one duplicate
inline charter uses the same oracle. Prepared75/75 then passed. A further focused
quality-cost case passes1/1 and exercises accumulation/one-time consumption;
complete current-source accounting is still pending. Exact old/new model parity
passed all10route/detail worlds and20projected outputs by deep equality.

Four focused cases stay in the existing selected tests/space.test.cjs module;
no profile membership, budget, source/freshness/security guard or historical
fixture policy is reduced. Final source/tree, regenerated output/catalog/RI,
completed role receipts and native stage evidence remain required. PR149/PR79,
production and DNS remain untouched; AC03/06/08 stay open.


## Exact runtime enrollment correction

Clean local cf7bf42e/treeca811899 passed Basic, full lint, format532, architecture,
style, RI/coupling and29RI+20coupling regressions. Full selected PR source checks
then executed75modules/1137tests:1100pass/37fail, zero skip/cancel/todo, clean
before/after. Original pr-source.json/tap/stderr retain that result. All failures
were classified:35 closed-selector `unreviewed Color motion runtime` refusals,
plus2 actual-current comparisons against the former R3 identity. No runtime
failure was waived and no test suite or profile was removed.

Additive family issue122-writing-startup binds base/clientA41ab65b...082b85,
plain628847e5...007b5f, staging993315bb...bd4c5 and production9f647eb0...256c1.
The complete exact literals live in color-motion-contract.cjs. Only space bytes
change (9c12d83a...974fec); all other runtime hashes/styles/reader policies match
R3, and publication rights remain mandatory. Removing the one added family
reproduces the prior registry and all selector code byte-for-byte. Existing
three-edition generation/alias-tamper/unknown/rights tests cover the new tuple;
only genuinely live-source fixture expectations switch to the current family.
Historical R3 assertions and every previous family remain.

The first focused integration execution retained77/78: its sole refusal showed
semantic document verification covered only the old reviewed client. Enroll
exactA41 alongside that old client in runtime-compatibility.cjs document checks;
all runtime/fingerprint checks still precede them. Keep version() unchanged:
only the original client has the legacy43054alias, while A41 maps to itself.
Existing missing/fake hook negatives stay intact. After regeneration, the
current client remainsA41 and all three exact edition runtime closures reproduce;
the affected3module suite passes78/78. This is dirty prepared-source evidence,
not a full clean-source or native pass. Producer provenance and route snapshots
are fresh; no changed bytes are aliased as an older runtime.

Four distinct agents accepted the prior scheduling sourcecf7 within its actual
scope; white-box explicitly blocked readiness on all37 source failures. The
current enrollment/document-guard correction needs its own completed delta
reviews and clean full-source accounting. Earlier approvals are not substituted.

Protected main835 still cannot publish this new family for accepted /stage:
its privileged verifier uses the old closed registry. The existing owner-only
staging-regression PR-label route instead uses the PR merge controller and exact
candidate, so it can collect full unchanged simulated performance evidence
without stable promotion, App admission or accepted S. First obtain that actual
candidate result, then prepare the finite compatibility-only diff for the
maintainer's separate-PR decision. No additional PR/controller redesign is
created or authorized here. Compatibility must precede eventual accepted stage.
