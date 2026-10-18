# Issue39 / PR85 — required-check eligibility after successful staging

Self-analysis,17 October2026 Europe/Warsaw. Inspected c8ff69d4ef1ba58393e5be6e40356a21c45484c0,
tree313e9e09721876cf41206ac4f48cfc9f5245c53e,main96a7a10d. The maintainer has authorized
merge/production continuation and necessary GitHub work. This is the same issue/PR.

## Observed evidence before implementation

- Ready source605/605 plus Basic24/24,owning19/19,RI and hosted preview38978900509 pass.
- Owner /stage38979301255/1 passes26/26 prepublication guards,597 additional permanent
  source,115 Python,static/host,bounded browser/performance,gate,promotion and merge-admission.
  Stable now serves c8ff69d4/publicc5121d2a/packagec139f31d. Previous61 package retained.
- Staging admission117236243178 reports success on c8ff69d4,App15368,external38979301255/1.
  The actual ruleset24568553 requires that exact name/App with strict main and no bypass.
- Actual merge API rejects405:required Staging admission is expected. Fresh reads still
  show blocked;source/merge trees are equal and no merge-commit checks/statuses conflict.
- GitHub documents that Actions workflow checks from issue_comment/workflow_dispatch
  do not qualify for required PR checks;an eligible PR event is required. The API checkpoint
  created during the trusted main staging run is useful evidence,but not a qualifying PR job.
  Its suite105639362348 is an earlier skipped PR suite. No rule/source relaxation is proposed.
  Primary owner:[GitHub required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

## Scoped correction

AC03/AC04 retains CS01/04/05/08/09/10:one staging-proof owner,read-only source/event
verification,meaningful failure cases,unchanged native budgets and original failed runs.

1. Extract authenticated actual staging evidence from the existing postmerge verifier;
   distinguish its external run/attempt checkpoint from ordinary same-name Actions jobs.
   The newest actual attempt must pass;an older green cannot hide a failed/new attempt.
2. Add a read-only eligible PR job in the existing preview/staging workflow. It verifies
   current source/Ready admission,protected main and merge-base/complete tree,actual successful
   owner-main staging run,exact attempt and real promotion/merge-admission. No secret,provider
   write,rebuild or browser matrix. Draft/non-PR/inapplicable events use distinct deferred names.
3. A PR edited event refreshes only this proof;exclude it from publishers and isolate its
   concurrency. After successful /stage,the owner records the actual result in the PR body;
   that ordinary edit supplies the eligible event. Concurrent current-source checks may be
   awaited within a bounded read-only window;failed/missing evidence stays failed.
4. Retain fixture negatives for skipped/stale/failed/missing/wrong-source/wrong-owner/wrong-run,
   wrong-attempt/current-main,unequal tree and same-name self-job ambiguity. Update profiles,
   guide,catalog,memory and RI. Run current-source/owning/Ready checks and ordinary new-source
   staging;never reuse c8 evidence to admit a changed source tree.

The successful c8 staging remains accepted and available while this fix iterates. PR85 is
not merged. Production opt-in=false;canonical configuration/package compensation and exact
native/full plus rights/device/independent/live gates remain open. Whole AC01–AC05 stay open.

## Local implementation checkpoint

The canonical evidence selector now distinguishes actual external run/attempt
checkpoints from regular same-name Actions jobs;postmerge verification uses the
same owner. The eligible PR verifier checks current owner/source/main,actual
completed staging and both promotion jobs,fresh source admission,merge-base and
complete prospective tree,and rechecks live PR/main/latest attempt before returning.
Only current in-progress source jobs may be awaited (240000ms within the existing
5minute read-only job);missing/failed proof fails immediately.

PR edited events have an isolated concurrency group and are excluded from every
publisher. The actual job has only contents/actions/checks/pull-request read,
no protected environment,secrets,provider writes or browser installation. Draft,
non-PR and labeled evidence events use different deferred names. Initial Ready
proof fails closed until its source is staged. Record actual staging completion
in the PR body to refresh the eligible job through the owner connector.

Focused source tests66/66 pass,no skips;Basic24/24,pinned format/lint/architecture
and bounded92-file style with0legacy occurrences pass. The prototype-admission
route adds three meaningful test methods:actual read-only proof with own-job
ambiguity;27 adversarial source/controller/actor/attempt/job/lease mutations;
bounded in-progress wait versus missing/failed/deadline cases. Full current-source,
owning,Ready/new-source staging and actual GitHub required-check eligibility
remain to be verified after this clean implementation checkpoint.

Prior successful staged native evidence is retained unchanged:prepublication ZIP
12081140148 SHA25659fc53b35f8a41e1dafe17eaf25289085216989518bb97c6468fa83e95ed61ef;
regression ZIP12081290854 SHA256c8547a9083dafcf58bec885e14efb41fb5cc902074e17f1f4f0758e67f38c348;
promotion ZIP12080284457 SHA2562e6ca9336958c63e801c8371d50c6584ad384da558d273accdd5c8e798c2aebe.
All are38979301255/1,c8ff69d4/tree313e9e09,with publicc5121d2a/packagec139f31d.
Research mobile TBT9ms/LCP1623.135ms/CLS0;Writing24.5ms/1601.862ms/0.049918.
Two original bounded staging trials,not a full production median or admission.
