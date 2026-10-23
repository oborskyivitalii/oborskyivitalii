# Issue122 — 23 October 2026 T04-P setup prerequisite

Owning issue: [approval6370000839](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6370000839).
Base protected main e6ee49696c0cdeaf70bbe72c803281682c7de83d; paused PR13131bb06b.
This is the existing issue's one active prerequisite; PR/source identity follows
after actual publication. Initial implementer analysis, not independent acceptance.

## Intent and acceptance

Original T04 delivery stalled while apt downloaded large Ubuntu packages from
azure.archive.ubuntu.com: both preview39983945852 attempts and owner39984723250
exhausted their unchanged job deadlines. First preview ran only25s of browser work;
second preview and owner browser actions never started.
Source tests and authenticated26-guard prepublication evidence remain historical
at31bb; no passing browser result or source reuse is inferred.

P01: extract the existing production Linux primary-archive/download treatment
into one helper; preserve signed-source metadata and package requests. P02: use
it before dependency installation in the same smoke/staging/Linux jobs. P03:
meaningful fixtures/wiring, permanent Python/navigation/RI routes and four roles.
P04: actual current-source installation and browser evidence. P05: protected
prerequisite delivery/postmerge, followed by PR131 integration/current delivery,
or a precise remaining protected-bootstrap decision. All whole AC01–AC08 stay open.

No package pin, case, job/context, source deadline, hosted budget, signature key,
scanner disposition or authority is relaxed. Ubuntu mirrors may serve differently
synchronised signed versions; actual native versions must remain observable.

## Requirements preflight

Actual separate `/root/t04_setup_requirements` inspected approved6370000839,
existing production Linux owner, both affected jobs and current control guides.
ACCEPT before implementation: P01–P05 adequate; no further decision needed to
implement helper. Require all-input validation before writes, fixed production
CLI, exact endpoint boundaries, preservation/idempotence and unsafe-path tests.
Stdlib-only navigation must inspect real invocation/order/guards and demonstrate
missing, late and skipped invocation faults. Candidate staging is not owner
admission. A protected bootstrap outside the current route remains separate.

## Source owners and style

`tools/quality/ubuntu_downloads.py` owns privileged setup, with explicit API input
for temporary fixtures and fixed `/etc/apt` CLI. The three workflows only call
that owner; existing diagnostic copies are untouched. Plans validate every
input/output path before mutation; source read/write failures stop the job.
It is not an adversarial multi-user filesystem transaction or OS package lock.

CS01/04: one quality owner and three callers, no competing registry. CS05: pinned
format/lint and readable Python. CS06/07: explicit finite setup effects, validation
before writes; failed setup prevents later browser admission. CS08/09: independent
oracles, useful fault fixtures and current bounded guard. CS10: source-bound checks
and independent semantic/architecture review. Guard success alone is insufficient.

## Independent completed-candidate roles

| Role | Actual separate agent | Source and own result |
| --- | --- | --- |
| Requirements | `/root/t04_setup_requirements` | Preflight ACCEPT; completed candidate pending. |
| Code | pending | pending |
| White-box QA | pending | pending |
| Exploratory QA | pending | pending |

## QA allocation and evidence

`test_ubuntu_downloads.py` covers direct `.list`, Deb822 and mirror+file inputs,
exact endpoint replacement, unchanged signing/suites/architectures/unrelated
sources, idempotence, missing/escaping/symlink references and safe output. Actual
workflow wiring checks inspect exact invocation, guards, order and original job
limits, with echo/skip/late fault detection. The same stdlib module runs explicitly
in navigation and automatically in staging/production's enduring Python runner.
The existing RI/CI map binds its named selectors and actual navigation command.

Initial implementer7/7 fixture tests PASS. Completed role results, exact clean
source checks and native evidence remain pending; no network success claimed.

## Protected delivery boundary

Owner `/stage` runs the workflow/reusable controller from protected main e6.
Candidate `staging-regression` is the existing premerge evidence route, not stable
promotion or eligible admission. Before any action outside the current protected
merge route, surface its concrete decision. Approval does not authorise ruleset
bypass, new credentials/services, W3 or production. Preserve every failed attempt.

## Initial review findings and correction

Requirements and Code independently reproduced unanchored command/deadline
oracle defects on36f43d2/tree28c1b9: comment/echo text falsely proved helper
invocation, and changed actual job deadlines could match a substring or comment.
Corrected tests require anchored actual run/job keys and add these negative
fixtures alongside original echo/skip/late cases. Actual helper/workflow bytes
were correctly wired and are unchanged by this oracle correction.

Requirements also found the missing Python test registry row: navigation and
enduring discovery existed, but the complete test inventory rejected the new
module. Add its permanent pr-targeted/staging/production allocation and explicit
helper/workflow inputs to the existing registry. No source-selection algorithm
or old case is removed. Fresh registry, mapped checks and actual affected-delta
reviews remain required. Original initial7/7 did not detect these defects.

## Four completed corrected-candidate reviews

Actual corrected38a97fa30313c7afb0d12d7a25fcb9c965ac62d9/treecffa44b25d6b4c7a5b9099dedf897ea27100d563 accepted independently:

| Role / actual separate agent | Own completed result and limits |
| --- | --- |
| Requirements `/root/t04_setup_requirements` | ACCEPT.7/7 fixtures, original2oracle bypasses rejected, complete registry/targeted Python selection and RI/CI16checks/freshness PASS. RQ-P03-REGISTRY/WIRING and P04-HISTORY closed. Native/delivery pending. |
| Code `/root/t04p_code` | ACCEPT.7/7, isolated canonical Ruff, originalcomment/deadline150 faults reject,3independentdirect/mirror/Deb822 preservation observations, RI/coupling/freshnessPASS. CR-SETUP-01 closed. Receipt SHA256a4d7168fc64a49d26862ac44a6d1c9fbcbafff0e7372c6414d60bd917896f072. Native pending. |
| White-box `/root/t04p_whitebox` | ACCEPT.7/7 plus11independentfixtures and3fault comparisons, original-inline/new-helper4byte-parity cases and an isolated disabled-symlink-guard mutant detected. Complete permanent Python selection/couplingPASS. Receipt SHA2567ba80f2fdc5cd55dbccc8bab8b0345056698e3840769590bbac23b94550c826f. No branch-coverage/network claim. |
| Exploratory `/root/t04_delivery_review` | ACCEPT.7/7, actual temporaryAPT/CLIcharter,6invalidrefs/4unsafetypepaths/3CLInegatives, semantic3-jobYAML parity and5actualcontroller-boundary observations PASS. Registry priorrows unchanged. Receipt SHA256994a91b8c8f71366040f120c66b352b5b7f48bbc343676ab7f543338c7c75fa3. No sudo/hostAPT/native success claim. |

Current clean38 owningpolicy5/5 PASS, automation/evidence true, errors empty,
closurefalse. RI29/29 and coupling20/20PASS. Initial maintained format check
failed only test wrapping because direct Ruff used the environment's88columns;
canonical explicit100column formatting corrects it with independently checked
identical Python AST. No assertion/helper/workflow meaning changes. Full lint and
final exact-source/native checks follow; source test budgets remain unchanged.

Code noted optional historical-source diagnostics require compatible workflow/source
revisions: old candidate checkouts lack this new helper. Archive recovery remains
separate and unchanged. This prerequisite establishes current-source setup, not
universal cross-revision diagnostic compatibility or an OS package-byte lock.

Only factual receipts, deterministic formatting/RI/MEMORY refresh follow accepted
implementation; provenance/AST identity and unchanged meaning must be verified.
Any material correction returns to the actual affected role executions.

## T04-M superseding CI maintenance directive

The owner explicitly requested rewriting the rule that lets broken CI block its
own repair. [Scope6371350643](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6371350643)
records M01–M06 before edits. Separate Requirements preflight ACCEPT and Code
architecture assessment support a durable two-ruleset design: no-bypass source
floor (PR/ref restrictions, strict Basic/RI/owning), separate staging-only exact
owner User248754648 pull-request bypass. This supersedes the earlier no-rule-change
boundary only for the explicit maintenance procedure. No automatic W3 or production.

GitHub's actor/ref privilege is not path/SHA/TTL scoped. The narrower repair
classification and decision are owner procedure, not protection-enforced automatic
admission. Actual administrative support/readback remains pending; the connector
offers no ruleset write. Exact JSON and original rollback are prepared, not applied.

`maintenance-inputs.cjs` inspects every Git parent edge plus the net delta, modes,
blobs and both rename endpoints, with explicit bounded CI paths. `maintenance.cjs`
authenticates an actual unedited owner PR comment, latest decision/expiry/current
source and focus jobs, failed history and live protection. The read-only postmerge
branch keeps normal staging verification separate, verifies approved/merged parents
and tree, and preserves original recovery/site identity without publication or
relabelled website acceptance. Normal stage/production consumers are unchanged.

CS01/04: separate Git/protection input owner and API/decision observer, existing
admission source checks reused. CS05/06/07: pinned formatting, finite read-only API
and bounded Git operations; no settings/deployment side effects in the observer.
CS08/09/10: real temporary Git histories, independent semantic ruleset/fault oracles,
source/proof/owner negatives and actual production rejection; four new completed
role assessments remain required. Metadata review pointers do not prove agents ran.

Initial new Node run10/13: two fixture rename targets lacked their destination
directory; the newer-focus fixture failed through an unintended mock route. Corrected
fixture setup/routing, retained fault assertions; current implementer13/13 PASS.
Stdlib mechanical ruleset/wiring3/3 PASS. These are local dirty implementation
checks, not clean-source/native/admin acceptance. New coherent-candidate four-role
review and final checks follow.

Prior frozen678/treea35 native receipts remain historical and unaltered: preview
smoke passed; label staging installed53.7MB in5s but genuine cold-Writing3566.9/3200
failed. First owner39994526873/1 cancelled after Azure53.7MB/13m20s and840.282s total
install; browser action ran55.603s, no completed reports. Gate/admission failed,
promotion skipped. Candidate receipt SHA2562ee445a44a77c214b14f65b99977094236b4cc8e2b4119d1534be819d46b9775;
owner receipt2ffa5d97697773c12dba3b8e67ea7cc03beeaf669b8cc903e7425fbd75aad478.
No previous failed observation is a current pass; M delivery and PR131 return remain open.

## T04-M completed first-candidate review and correction

All four actual separate agents inspected clean1c2d6b65/treef1732897 and requested
changes. Their independent receipts are retained; the original14/14 Node and3/3
mechanical cases passed but missed the operational defects below.

| Role / actual agent | Source-bound receipt SHA256 and own blocking findings |
| --- | --- |
| Requirements `/root/t04_setup_requirements` | 47c6e45035b425333db00dfc3aaae9c0ea05527901544d77010be65a86f542f5; real collector rejects its own `.test.cjs`; enduring RI test omits the new layer (19/20). |
| Code `/root/t04p_code` | b148fbb0c502a8403044102bffc3598639a4c8a6a93002e6288579f4a66ee289; hidden bypass actors unavailable to read-only CI, stale event/checkout can claim a newer head, actual collector rejects its own test. |
| White-box `/root/t04p_whitebox` | 19769c872503443b3d076ea6fbeb3de93812eced81e10278e32c5d571dd27b77; collector plus final PR/base/Ready/state/source/focus/protection lease gaps, including focus after preflight. Independent Git history mutant caught. |
| Exploratory `/root/t04_delivery_review` | 27087a60010c316a3aa4efb55e239d8998c80c20bdc2dda4680edbfca603f58c; real collector failure and ignored surplus CLI argument;46 separate observations otherwise completed. |

Correction permits only explicit flat `.test.cjs`/`.cjs`/`.py` test names, refuses
surplus CLI arguments, and updates the enduring RI layer set. It binds native PR
event/head/base/merge state and actual checkout, refreshes the final current
PR/base/Ready/state, source and focused jobs, protection and main, and refreshes
focus during accepted-site preservation. Added real temp-Git event/checkout and
late-mutation negatives; actual18/18 implementer Node cases and3/3 Python pass.
The first enduring RI recheck correctly reported stale derived mapping before
refresh; no pass is inferred from it.

GitHub explicitly hides bypass actors without ruleset write access. The corrected
read-only observer compares every visible field and requires an actual owner's
fresh admin-readback receipt bound to exact layer IDs/full semantic payload digests.
If actors are visible they must match exactly; if hidden the record explicitly
states `owner-attested`. No invented empty list, privileged CI token or claim of
automatic hidden-drift detection. This procedural limitation and current native/
admin/delivery pending status remain explicit in the guide; AC05 is still open.

Corrected coherent-source four-role rechecks and clean-source checks follow.

## Four completed T04-M correction rechecks

Each actual same distinct role inspected clean d88f091948d1097a010e9cc2df8d4799e126dc8e /
treecca7b9dadb975bf2e1c62209dc1c9877bfc92da2 and returned bounded source ACCEPT.
The actual documented e6-to-d88 collector passed all28paths/3parent edges, digest
26b8f10413b90771290617eb68cfce7a2cec0393292f2d0def59fee2dc863b8a.

| Role / actual agent | Own completed correction evidence and receipt SHA256 |
| --- | --- |
| Requirements `/root/t04_setup_requirements` | Original2blockers closed;29Node/3Python/20RI, coupling17/freshness/selection/style112 PASS. bccd780333c383594774182a2ab6620d77a2d6736617f304954cbfd3499c5ecd. |
| Code `/root/t04p_code` | CR-M01–03 closed;29Node/3Python/20RI plus8independent capability/source probes PASS. Owner-attested limitation accepted explicitly; unused builtin import removal and final lint pending. 2fe8ad19e9f95d8c9d3e21106c67abcb8174f53e1dd36e64942cc638e50d1274. |
| White-box `/root/t04p_whitebox` | Original collector/7lateleases/postfocus faults reject, controls pass;29Node/3Python/20RI,9event/checkout negatives,4visibility controls/8attestation-drift faults PASS. 14e99090774568999c97d7bbfd13670e5defb864ec6c8ac712adf71cb8beedc9. |
| Exploratory `/root/t04_delivery_review` | Both original findings closed;65independent real CLI/temp-Git/API observations,18Node/3Python PASS. 64c6844c6befa869774e7b11a7bb7d61625cf01773b5aec4805eb513175c1ec7. |

Root clean-d88 owning7/7 passed with automation/evidence true, errors empty and
closurefalse. Source local checks passed. Full source-bound lint found exactly
one unused builtin `fs` import in maintenance.cjs; remove that unused declaration,
which Code independently confirmed has no references. No repair oracle, workflow,
policy, permission, rule payload or runtime behavior changes in this final cleanup.
Final source-bound lint and affected Code recheck follow; factual receipts and
deterministic RI refresh do not substitute for actual native/admin/delivery gates.

Actual previous accepted recovery artifact12511545326 was re-downloaded and its
original ZIPsha2565750d3641c1c402d156155c8ed9acc5db8164530c5d41cdcb183b5b624d1b901
verified; recovery JSONsha2564dc0fcf1453c65d72adff75b2e06d0bf8ea16a881125993e4a709b2e29fab324
matches the retained original. This prepares preservation evidence; it is not a
new-source preflight, admin readback, merge, new staging acceptance or deployment.

## First T04-M native run: documentation inventory correction

Published1a5d15b6/tree f67fc93e equals final reviewed local80053189. Final Code
cleanup recheck ACCEPT, receipt SHA2560bdfced8e1ad88c4cc2b025c4b392e0895d01d8388e0567124caef78ef0b7366.
Root final local clean-owning7/7, local source and full source-bound lint passed.

First actual Ready Navigation40005217482/job120591285192 failed the existing
test_root_layout.py `test_current_active_relative_links_resolve`: the new guide
was catalogued in repository-paths but omitted from repository-layout's separate
active_markdown inventory. Add that exact guide to the existing inventory; keep
the completeness/links oracle and all its omission/broken-reference negatives.
First owning40005217630/job120591285426 failed before execution because the PR
description put text after `Refs #122`; correct it to its required standalone line.
This metadata correction does not change repository code. Both failures remain
historical; no current source/native success is inferred from earlier trees.

The inventory-only correction requires the complete local navigation commands,
actual affected independent rechecks and a new current-source native run. No
maintenance verifier/ruleset/workflow/test-oracle/runtime/budget change is made.
