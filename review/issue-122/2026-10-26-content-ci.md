# Issue122 — content CI integration repair — 26 October 2026

Current execution: PR150 published0d42d879/treeaac86c65. Draft preview40366995678
passes build/publish/smoke. First full evidence-only40367093024/1 stops at security
before browser/deployment:25/26 prepublication guards pass. The six exact findings
and their correction are recorded in the final section below; native performance
of the scheduling correction is still unobserved. No article/production publication.

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


## Completed clean enrollment/source checkpoint

Clean local1eeb83f9b13e392b314484d4511e645d6111e657, treedf04063d12c7a92f9952cf80eac5940c5efabf45,
passes76selected PR modules/1145tests with zero fail/skip/cancel/todo and clean
source before/after. Basic, full maintained lint, format532, architecture, style,
RI/coupling,29RI and20coupling regression cases pass at that exact local source.
This receipt does not relabel those executions as later metadata/native results.

Four distinct nonauthoring roles completed actual source delta review:

- repository_delivery_requirements: exact additive tuple and two-client document
  guard satisfy AC04; actual30alias hashes reproduce; original failure/contract
  and native/compatibility decision boundaries remain explicit.
- repository_delivery_code: old registry/selector body and legacy version() remain
  byte-identical; all3derived identities and30physicalaliases match. Only actual
  current-source expectations change; historical and rights cases remain.
- repository_delivery_whitebox:6/6targeted existing cases pass, all139old runtime
  records remain exact and3unique records are added;57output hashes and RI/
  coupling verify. Unknown/mixed/rights/missing-hook paths still reject.
- repository_delivery_exploratory:2/2finite current closure/rights/tamper cases
  pass; actual clean-source artifact verifies with empty article selection;
  deleting the actual Writing document hook rejects; runtime bytes matchcf7 and
  reading text/native links remain unchanged. Export freshness and RI verify.

Earlier scheduling source acceptance remains bound tocf7/treeca811. Actual
browser/Canvas/input latency/cold readiness and original simulated TBT are still
unobserved on this final integration; local VM/CLI observations are not native
acceptance. The authorized next action is Draft PR150 update plus the existing
owner-only staging-regression evidence route. No acceptedS/App/merge or stable/
production promotion follows. Protected-main prospective compatibility remains
a separate explicit maintainer decision after actual candidate evidence.

## Native checksum triage — current evidence candidate

The first owner-label evidence run40367093024/1 binds actual0d42d879/treeaac86c65.
Its build fails prepublication security after25/26 guards pass; the security command
exits1 in138313ms under its unchanged180000ms limit. Semgrep and Bandit pass;
detect-secrets exits0 but admission correctly refuses six unreviewed Hex findings.
All hosted/browser/performance/promotion steps are skipped. This is not a new
performance observation or a successful full stage.

Original artifact12671935855 has313129bytes and native SHA256
`72325873f78cca1a828bc8863959bc1f5f2cb6148ea8390869c5ef7bc30937c8`.
The retained raw detector report has1819242bytes/SHA256
`75b06f0b8e9280cc1f15d1e37ab064d5ba79f892aedf61255dd193712790ee98`.
Existing generated/RI/coupling proof admits their actual computed fields; the
remaining six findings are five distinct public identities at six exact paths:
Color space, base client, plain/staging/production fingerprints in the contract,
and the same base client in the finite document-guard set.

Before editing the ledger, existing producers on clean0d42d879 regenerated the
ordinary base and three Color editions locally, with empty article selection.
The client is independently recomputed from actual runtime files and current
builder input descriptor; Color/edition producers reproduce each fingerprint.
The inert per-value proof is
[2026-10-26-writing-checksum-proof.json.gz](2026-10-26-writing-checksum-proof.json.gz).
It retains actual source/tree, byte hashes, typed oracles, original failure and
two corrected local preparation/API mistakes. Production derivation is solely a
checksum proof and grants no production/hosted acceptance.

The correction appends exactly six path/rule/hashed-value records to the existing
checksum companion ledger. All predecessor records/order/reasons, other three
ledgers, scanner logic,139 historical runtime tuples and all budgets remain.
Requirements accepted this bounded treatment before implementation; completed
four-role correction review and current-source checks remain pending below.
No unchanged failed campaign is rerun. Fresh native execution follows the real
security-input correction, preserving both failed source/run and original TBT
failure. AC03/06/08 and protected-main compatibility/owner admission remain open.

The first RI build correctly refused the new unclassified inert proof path; its
exact history/owner catalog entry was then added before regeneration. This was
a local metadata-preparation failure, not a native security retry.

### Completed checksum-correction source checkpoint

Clean implementationadc50232631fdd39c8b423679eedf14b8f004a00 has tree
`ee93d311f04bbe3990e92f8924805e60f2dcb2ff`. Remote implementationbebc642561a9395f476172fed6edcf5efa5b4872
has the identical tree; local checks are not relabelled as remote execution.
The existing quality-sources module passes38/38, zero failure/skip/cancel/todo.
Basic passes with empty article selection, actualadc source/tree and clean state;
all532 format files, code-style143-source guard, RI freshness and17 coupling
checks pass. No engine, site output, scanner implementation, workflow, test,
archive pin, profile or budget differs from0d in this correction.

Four completed independent correction roles inspect exactadc/treeee93:

- Requirements: accepts six IDs, exact predecessor ledger and source proof;
  actual20 runtime hashes/client recomputation and unknown-value refusal pass.
  Original requirements/AC scope remains; native/compatibility decisions pending.
- Code: accepts exact8-file scope,1533 prior checksum records/order/metadata,
  other3 ledgers and scanner/runtime bytes. Six original IDs/source lines/value
  hashes and30 physical canonical/immutable runtime alias hashes match proof;
  base client/three edition fingerprints independently recompute. No blocker.
- White-box: six actual findings admitted,18 wrong path/type/hash substitutions
  reject; prefix/metadata/source/raw-detector proof passes. Independent temporary
  build and existing edition producers reproduce base/three editions/15 runtime
  hashes. No guard or runtime change; no scoped blocker.
- Exploratory: six exact findings admitted,24 wrong/new hash/path/SecretKeyword/
  Base64 variants reject. All four actual producer artifacts verify, runtime
  hashes/client recompute, original detector bytes/hash match. One existing real
  three-edition producer testcase passes1/1. No operator disposition blocker.

The optional root changed-input fresh detector invocation could not start because
this local quality venv has no detect-secrets executable (FileNotFound before
spawn); no scanner run/pass is claimed and no unchanged retry/install followed.
Existing admission tests and retained-report proof are not fresh native scanning.
First RI preparation also corrected the catalog JSON key before regeneration;
all failed local preparations remain distinct from native acceptance.

These are source/preflight correction acceptances only. New native security and
Writing performance still require the next actual source-bound evidence run.
Original40367093024/1 and e5 TBT failures remain failed. Metadata receipts do not
reset them; the six real security-input changes justify the corrected execution.


## Actual-main integration — 27 October 2026

PR151 is delivered as protected normalmerge
`fc95da63072ecfb65b23f8c37c75659001661e65`, identical tested1d/tree47311cdc.
Genuine App40473720100/1, postmerge40473958278 and mainRI40473958044 pass;
[delivery receipt](https://github.com/oborskyivitalii/oborskyivitalii/pull/151#issuecomment-6437227117).
Its ordinary accepted package stays source1d/stage40467379806. This does not
admit PR150's future integrated source. RemotePR151 remains untouched.

Separate Requirements reviewer /root/requirements accepts integration before
implementation. Reviewed obligations: preserve PR150's exact18derived outputs,
locked tools, Writing scheduling/accounting/document guard and existing tests;
retain main's readiness helper/three regressions and fixture-local maintenance
isolation with all historical negative/rights coverage. No new PR or scope.
The first reviewer launch failed on model capacity; an actual follow-up
completed this source/contract review. No failed launch is counted as a pass.

Local integration starts from remote c0ee1c09 and merges actualmainfc95, keeping
both parents. Runtime registry and compressed producer proof are byte-identical
on both sides. Main's1538 checksum rows are an exact prefix of PR150's1539;
the sole additional path-specific finding is runtime-compatibility.cjs. Retain
PR150's complete1539-row ledger once without altering reasons or adding any
disposition. Catalog common entries match; PR150 has current generated paths
and its content review owner. Preserve it and regenerate context/map/coupling.
Executable Color/content-baseline tests auto-merge; exact source checks and
independent reviews must verify the combined behavior before readiness.

Applicable style obligations CS01/04/05/06/08/10 remain as earlier implementation
and delivered main reviews. No runtime/CSS change beyond original PR150, new
test, budget/scanner waiver or registry expansion is proposed by integration.
Run current-source Basic/relevant source/lint/format/style/RI and four distinct
changed-scope reviews, then fresh native Ready/source/RI/owning/preview and
ordinary full owner staging. Check greatest IDs, serialize push and Ready. Old
c0ee evidence-only and1d owner artifacts retain their original identities.

Human exact-head App trust for this future source, protected merge/postmerge and
whole AC03/06/08 remain open. Later fresh ordinaryS → necessary genuineM →
isolatedTalks/newerHome/selectiveTalksrecovery and contracts/timing remain; no
R38/article publication, production or DNS action.

First RI generation was requested before unmerged index entries were staged;
it correctly refused unresolved tracked merges. This was a local preparation
ordering error, not native acceptance. After resolving/staging the exact union
and creating the merge commit, regenerate/verify RI and coupling on the actual
integrated tree before review or publication. No guard change or evidence reuse.


### Integration verification receipt — local d683441d

Clean implementation d683441d45841944cb56fd7436addebe93730720/tree
786db2b78445ec05c7cff703a79ba8ab265298fa retains merge73248e31 parents
c0ee1c09+fc95da63. Root Basic passes5routes/16theme+archive/10flight; the
complete4affected modules (Color contract, content baseline, content delivery,
space lifecycle) pass128/128, zero failure/skip/cancel/todo,105289.63129ms.
Pinned affected-source ESLint exits0 with max-warnings0. Bounded style143files,
RI freshness and RI/CI17checks17layers pass at that source. Local Node24.22.1/
Python3.12.14 is recorded separately from native pinnedNode24.19.0.

All488maintained non-Python files were checked with pinnedPrettier3.6.2. The
first check fails solely on .github/ri-ci-map.json: Python coupling refresh
rewrote formatting. Parsed mappings are identical to c0ee (Requirements
independently verifies); pinned formatter restores exact c0ee map bytes and
targetedcheckpasses. That changed map hash correctly stales RI; regenerate RI
after this receipt, then verify coupling/freshness. No code, mapping, membership
or formatter configuration is altered. Full native Python formatting/lint/
security/source obligations remain pending rather than inferred from this
non-Python local check.

Requirements ACCEPTS exact d683 integration, actual parent ancestry,1538prefix/
1539ledger, all75current public/offline files and original boundaries. Code
Review independently ACCEPTS exact d683: byte-identical runtime/proof/owners,
preserved readiness/cleanup/negative/rights/cost semantics and clean diffcheck.
Operator QA ACCEPTS local d683: exact18exports admit,6adjacent/control paths
refuse economical reuse,5dependencycondition boundaries pass, default/disabled
article lists empty, unsupportedmode refuses and entire integration selects
platform. No reviewer edits or browser/full diagnostic campaigns were made.
Their accepted scope is integration source; fresh remote/native delivery and
exact-head human trust remain required. White-box result is recorded below
with its actual metadata end-state, not impersonated as clean native evidence.

White-box QA independently ACCEPTS active d683 integration:14/14targeted
oracles,0failure/skip/cancel/todo,7109ms. Covers RAFpause/route/resize/error,
firstpaint and one-time preparation accounting, finite hooks,three-edition
aliases/rights/tamper, exact18exports/6neighbor refusals, locked dependency
condition,3readiness/deadline/cleanup and strict endpoint policy. Structural
cost oracle detects both omitted preparation and repeated charging. Tests
start cleand683; root formats RI/CI metadata concurrently near completion, so
this is explicitly not a clean-before/after claim. Active code is unchanged;
final metadata freshness is separately required. No QA edits or native/browser/
fullsource campaign. All four distinct current integration roles are complete.

Only verbatim execution/review receipts, current MEMORY and deterministic RI
follow these source checks. Final publication must preserve this code/tree
relationship and obtain fresh actual-remote-head native evidence. The final
receipt's new source does not inherit d683's local tests as exact-head native
acceptance.
