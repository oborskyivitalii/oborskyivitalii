# Requirements & Acceptance — independent first preflight

Date: 2026-11-07. Role: Requirements & Acceptance. Phase: before technical-route implementation. This is a requirements judgment, not implementation acceptance. No repository files edited; no tests executed; no external writes or delegation. Source inspection and live read-only issue/ref retrieval only.

## Verdict

The requested bounded extension is feasible, but dependent implementation needs a dated, stable acceptance amendment under owning issue169/PR174. Existing original AC05/AC11 cover review/hygiene; they do not specify the new classification/security obligations. Current sources explicitly make every executable tools/tests/workflow/action a full-route control. Existing behavior cannot be claimed to already permit this request. A narrow separation of dependency lane from control trust is preferable to weakening control classification.

PR174 starting head183fbbee2f49736d08d1b82409692848a7a718fe and main312fbe4347eda332aa8ade885b07c98beadd6da5 were confirmed by live git ls-remote. Working checkout HEAD matches starting head and was clean. Live issue169 was fetched; its latest body update observed is2026-11-07T07:10:52Z. It retains the article/stable staging STOP/show endpoint and controller ownership. Its body does not yet record this new technical-route acceptance amendment. Task-supplied current user intent is the authority for preparing that amendment; no new owner is necessary. No PR170 merge, production or issue closure is authorized by this work.

The live issue body's earlier controller550c7f evidence is historical. It does not establish acceptance for183fbbee or a future classifier/security candidate.

## Findings and required treatments

**High R1 — Bootstrap cannot authorize itself.** `delivery-observation.cjs::selection` requires complete analysis, control=false and repository lane; `delivery-routing.cjs::control` covers all tools/tests/workflows/actions. `SITE-CHECK-PROFILES.md` R2 and `SITE-STAGING.md` trusted-change table require full work for these. PR174 actually changes source runner, registry, three check/stage workflow definitions and a publication-media composite. A tests-only description would be false. Keep the bootstrap and this mixed PR174 on the old protected-main full route; integrate only after current required checks, full owner staging, four-role review and explicit exact-head reviewed_sha under existing protected admission. Activate exemptions only from the resulting trusted main. Do not use candidate policy or a candidate check named like a trusted producer to omit its own staging.

**High R2 — Security would disappear if the existing repository path were generalized unchanged.** `local.cjs::delivery` returns directly for repositoryOnly. `site-checks.yml` then runs formatting/architecture/lint/source; actual security/advisories are in `local.cjs::preparePrepublication`. A new technical exemption must provide explicit source-bound security evidence in an existing source workflow. Do not fabricate a website artifact/manifest merely to satisfy scanner setup. Wrapper must bind actual checkout commit/tree/cleanliness and full intended inventory, locked engines/config/ledger and complete accounting; failures/missing reports block. State explicitly whether advisory policy applies (retain existing dependency obligations; do not silently remove them).

**High R3 — Candidate registry/runner is not an independent selection oracle.** `source-tests.cjs::selectPRTargets` reads its current registry. Shared runner/registry edits select all permanent JS, but the same edited code can suppress tests/failures. `delivery-routing.cjs`/guide D09 require trusted pre-change union, candidate isolation and protected-producer proof. Preserve a protected-base target plan union current required targets, with reviewed explicit dispositions for deleted/renamed tests and no loss of required baseline/Python/owning suites. Candidate additions may expand coverage. Exact-head maintainer review supplies executable trust, but does not turn missing/failed/unmapped obligations into pass.

**High R4 — Directory names are insufficient eligibility proof.** Tests may be fixtures/publication/provenance inputs; tools/quality includes artifact, content, browser and delivery consumers. Workflow/action setup can change actual production/staging execution. Use a narrow exact allowlist/classification contract, inspected against real consumers. Keep rights/provenance inputs, site/docs/runtime/build/publication/edition/release/staging producers, artifacts, admission/issuer/classifier/selection authority, dependency manifests/locks and deployment workflow/action definitions full. Unknown paths and unsupported modes/types refuse cheap eligibility. `publication-media` specifically affects three actual browser jobs and is outside the new cheap maintenance class.

**Medium R5 — Owning acceptance mapping lacks the new obligations.** `.github/acceptance/issue-169.json` maps primarily RI/style and human article gates. Append stable technical subcriteria/IDs without weakening or ticking whole article ACs. Update canonical guide rows, registry owners and RI/CI routes consistently. Preserve previous failures and head-specific evidence.

## Final bounded first-increment treatment assessed before first result

The orchestrator supplied a narrower concrete scope during this preflight: routine `tests/**` additions/modifications only, regular files with unchanged mode; additive-only registry updates; exact repository executables `tools/repository_intelligence.py`, `tools/check_code_style.py`, `tools/check_ri_ci.py`. Tests deletions/renames/mode/type changes, source runner/worker/selector and registry policy changes, issue acceptance runner, workflows/actions, artifact/build/release/admission remain full controls. Run affected source targets, all enduring Python and source-bound security/advisories; retain control=true and exact-head trust. PR174 bootstrap remains full once.

**Independent assessment: this is a sufficient, safer bounded first increment of the stated intent.** No general source-runner exemption is required. The earlier broader class suggestions below are provisional future scope, not requirements to implement now. In particular source runner/worker/shards must remain excluded in this increment.

The monotonic registry invariant can discharge R3 without building a general dual-runner platform: independently parse/validate base and candidate registries, require every pre-existing row and every other registry field to remain semantically identical, permit added rows only for newly added regular test paths in the actual delta, enforce uniqueness/valid lifecycle/language/owner/profile/self-input rules and preserve complete inventory validation. Reordering must not weaken equality; malformed/ambiguous metadata cannot become eligible. Added rows can select additional tests but cannot remove trusted targets. Nonmonotonic edits conservatively retain full. The exact Python owners must retain explicit source/dependency review; do not generalize their directories.

For TR01 use this narrower allowlist. For TR02 include deletions, renames/copies, modes/types and registry nonmonotonic changes as explicit full-route negative cases. For TR04 the tested monotonic invariant replaces a general pre-change/candidate runner union because the runner/worker/selection code remains trusted and unchanged; preserving the existing registry makes selected obligations a superset for this specific scope. Do not claim this treatment permits future selector changes.

This narrowing is a preflight treatment, not a new user authorization or completed implementation acceptance. R1 bootstrap, R2 security and R5 durable acceptance recording remain mandatory. Append the accepted first-increment criteria under the existing owner before dependent edits, with exact check mappings. No second issue or user decision is needed for routine implementation choices already within authorized scope.

## Proposed bounded acceptance conditions (not owner-accepted yet)

| ID | Observable condition and independent oracle | Required evidence / gate |
| --- | --- | --- |
| TR01 Scope and classification | Allowlisted regular test maintenance and exact repository source-runner/Python owners with proven absence of website/publication output dependency classify technical repository; control remains true for executable changes. Existing documentation repository lane remains compatible. | Real-Git fixture matrix; independently inspect consumer paths. Explicit accepted allowlist in issue/review. |
| TR02 Conservative union | Complete raw base/head delta, both sides of moves/deletions and modes/types participate. Any excluded/website/rights/unknown dependency in a mixed delta retains full work. Candidate registry labels cannot grant eligibility. | Negatives for runtime moved under tests/review, public provenance under tests, deleted control, symlink/gitlink/type/mode, mixed media/workflow/site and unknown path. |
| TR03 Trusted bootstrap | New classifier/admission/security workflow candidate is selected by unchanged main policy and passes its existing full obligations before activation. | Actual immutable bootstrap CI, owner staging, independent reviews and owner exact reviewed_sha; normal protected integration, no rule bypass. |
| TR04 Mandatory technical CI | Eligible future technical deltas run formatting, architecture/style, lint, protected pre-change/current source obligation union, applicable permanent Python, RI freshness/coupling and owning acceptance. Shared runner/registry changes preserve all affected permanent JS rather than an artificially tiny target. | Current-source source reports with complete counts, actual Python/RI/owning runs, test-plan identity and reviewed deleted-test dispositions. Failed/skipped/incomplete stays blocked. |
| TR05 Security | Eligible technical candidate receives real source-only security coverage with pinned tools/config/ledger, actual source identity and complete parsed reports; preserve applicable dependency/advisory checks. No artifact generation required to bind source evidence. | Actual CI security pass and negative fixtures for missing inventory/report, dirty/wrong head and scanner failure. No website artifact claim. |
| TR06 Trust and evidence | Exact reviewed_sha still required for every changed executable/control, including tests. Old/wrong SHA, moved base/head, failed/pending source/security, forged candidate receipt and absent App gate refuse admission. | Protected issuer integration tests plus actual native head-bound admission evidence after activation. Candidate cannot bless its own skip. |
| TR07 Omitted versus passed | Technical lane explicitly reports website build/package/preview/hosted staging/publication inapplicable with reason, while selected source checks remain mandatory. Website/content/full behavior unchanged. | Source/selection/admission reports and existing full/content regression cases; native future eligible PR proves no hosted dispatch/deployment and actual source evidence. |
| TR08 End state | PR170 receives normal current full stable staging after controller integration; actual served reader/PDF inspected; STOP/show. | Actual stable source/run/served bytes. No PR170 merge/production/closure. Whole ACs stay open except already accepted historical milestones. |

A first delivered native technical-only acceptance example is needed to claim operational activation, beyond unit fixtures. It can be an already-authorized genuine follow-up maintenance change, not an artificial no-op PR or a weakening of this bootstrap.

## Scope classes and minimum exclusions

1. Ordinary `tests/**` edits can omit hosted deployment if they are regular repository test inputs only and all selected tests still execute. Tests that build local site fixtures may require local build/media/browser dependencies; absence of a hosted dependency is not permission to skip those test setup requirements.
2. Exact `source-tests`, source worker/shard and registry files can be admitted as technical controls only with trusted pre-change selection, all affected source accounting and exact-head review. A shard file not independently inspected in this bounded preflight is not automatically approved by its name.
3. Repository Python tools can be allowlisted after direct ownership/consumer inspection; retain actual Python checks. This preflight inspected RI routing but does not certify every Python tool as dependency-free.
4. Quality code consumed by artifact/site/release/staging generation, scanner policy/exception changes, general environment/dependency locks and delivery workflows/actions stay conservative full unless a later independent dependency decision with explicit evidence extends scope. The proposed repository-security wrapper itself is a bootstrap control, not instantly exempt.
5. Workflow setup for publication media remains full/targeted actual browser-job integration. Syntax or source fixtures alone do not establish interpreter/Pillow/WebP availability in isolated hosted consumers. Full staging may be skipped only where protected policy has already established hosted obligations inapplicable; PR174's current media/workflow change does not meet that class.

## Intent → checks → observed evidence

| Intent/constraint | Check/gate | First-result observation |
| --- | --- | --- |
| Technical work without unnecessary hosted stage | Dependency classifier + trusted selection | Current code denies it for controls; proposed extension feasible, unimplemented. |
| Preserve source/RI/owning/style | Existing site-checks/navigation/issue-acceptance + registry | Sources inspected; no new execution pass claimed. |
| Preserve security | Existing scanner owners + source-only wrapper | Existing repository-only path lacks actual security execution; explicit implementation required. |
| Preserve trust | Exact-head owner attestation + protected-main App issuer | Code preserves review/full separation today; new lane must keep exact-head gate. |
| Existing article endpoint | Issue169 latest body + supplied accepted STOP/show scope | Full stable PR170 verification remains required; no current acceptance asserted. |

## Limits, assurance and next gate

I did not read author/private history, peer verdicts or current peer output. Launch packet itself is a compact parent instruction rather than a complete hashed source packet; provider memory/context internals and accepted launch parameters cannot be attested by this reviewer. Parent must record actual explicit none-fork launch receipt and bind this result to the exact inspected bytes. Missing packet manifest/unchanged-source comparison blocks formal final acceptance, not this read-only preflight.

No browser/native/security executions were run in this five-minute requirements pass. Issue comments, PR feedback/check inventories and all possible consumer graphs were not exhaustively inspected. No new coverage percentage or runtime guarantee is claimed. Initial source checkout and live refs matched; rehash relevant sources if they change before implementation/final review.

Next gate: record the bounded amendment and target classes; resolve R1–R5 in the implementation plan; implement under existing old-main obligations; obtain final Requirements plus Code/White-box/Exploratory source-bound review on the actual candidate. Exact-head maintainer trust is a final concrete decision after required preparation/evidence, not permission needed to begin authorized reversible implementation.

## Inspected source identities

SHA-256 manifest below binds the principal authoritative/control bytes inspected. Additional direct source reads: README, MEMORY (dated only), repository map (navigation), tools/quality/README, local/scanners, navigation/issue-acceptance workflows and delivery-observation/admission test excerpts. Git commit identities bind these unchanged checkout bytes.

```json
{
  ".github/acceptance/issue-169.json": "8792a5dfca5eefebbdd1ab2f65a641179c6a87253d4906028f0b3cb7f3532471",
  ".github/actions/publication-media/action.yml": "cc2477b02dd5f684e398f87cfb51fd11f3ffcc4be223a31bcc11a70b86208873",
  ".github/workflows/site-checks.yml": "9e5167051fe15c71224ff51ae8e453caf078538ab6d9666541f0e794c62fdbff",
  ".github/workflows/site-color-review.yml": "fc5861456ad5240f1179a68c127593265bc883bac0adebb65cc016d9bcdd76bc",
  ".github/workflows/site-release-checks.yml": "f05ce4a8fbc8bb93f540726d35b9acba344ec0dcb5a3c1b8dcb2ae58014a077d",
  "AGENTS.md": "ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988",
  "CONTRIBUTING.md": "804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442",
  "agents/reviewers/README.md": "2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb",
  "agents/reviewers/requirements-acceptance.md": "010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6",
  "guides/SITE-CHECK-PROFILES.md": "e60dd82f5d3090398a51be5b3181fa3d81737947f8a73e5e4867755d88cf8aee",
  "guides/SITE-STAGING.md": "3d03824d99b3387cd0561486d0ef65f03283cfa1ae3b761f84fd9ebb1a896758",
  "tools/quality/delivery-admission.cjs": "63c2192a0653050e63137368ff7dcfd24ca12429a0136d4a04034b4a40c1cbfb",
  "tools/quality/delivery-observation.cjs": "5446845544e8109f7ce3f99ef95e1660722ca378a180d67fb2083340dfa62d63",
  "tools/quality/delivery-routing.cjs": "87895a82bd35e2396e68915fd202c6a989c1c14c37dced34f1a3d5f692e2e21d",
  "tools/quality/source-tests.cjs": "d9a870982b7ec3698696ce2192c0cfc25ae156785f9ab7cfaa3507c0fd2338cf",
  "tools/quality/test-profiles.json": "4087b6a435796d14ae5e20db29744557e92e5cf37798e533dc873a067dd943b9"
}
```
