# Issue 198 — 2026-11-12 independent reviewer admission

[Owning issue and acceptance criteria](https://github.com/oborskyivitalii/oborskyivitalii/issues/198).
Reviewed baseline f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa.
Historical comparator is Draft #171 at 39afcc67b0b5612a787c82d0574d0468bfb5962c.
Initial source and execution evidence is recorded below as it is obtained.

## Scope and preflight

The owning PR selects #198. The reusable byte/path and receipt checks from
#171 seed one adapter for fresh execution, with separate #167 pilot evidence.
The existing offline reducer does not dispatch reviewers. Code style AC07
covers CS01/04/05/06/08/10 across orchestration, permanent behavioral tests
and the owning acceptance mapping. Navigation, RI and the style guard cover
mechanical checks. Independent C/W reviewers cover code shape, lifecycle,
failure propagation and observable negative cases.

Separate Requirements preflight execution /root/req198_separate_pr requested
explicit none. The parent observed the returned handle. The prepared
requirements/route extract SHA-256 was
8cc49c610d547f00023a41dec6035a01684608122e9d5857cc3371d726f7951e.
The reviewer accepted the separate PR path, keeping all implementation,
real execution and native gates pending. Complete first output follows.

Вердикт R preflight — окремий Draft від main придатний до реалізації. Live refs/heads/main = f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa. Пакет #198 звірено за SHA-256. Один рядок `Refs #198` у PR вибирає .github/acceptance/issue-198.json (AC01–08). #198 володіє правилами вибору ролей і єдиним адаптером. #167 зберігає WEB pilot, свої чотири gates і історичні receipts. Мердж #171 не є передумовою.

- AC01/07 — main і parent #171 8cf15883125892710633b17133d9ee0fc4b23b92 мають той самий blob offline reducer. Три файли reviewer-admission і тест є додатками 39afcc67b0b5612a787c82d0574d0468bfb5962c відносно parent і відсутні на main. Перенести лише потрібні byte/path bounds, hashing, receipt correlation, lineage та CLI/focused tests. 16/16 старих тестів пройшли, але вони підтверджують і старе same-handle правило. Замінити hardcoded WEB-18/#167/RA-06 і обов’язковий preflightHandle на owning policy з окремим R bootstrap. Оновити спільні правила та RI одним PR; reducer лишається offline.
- AC02–06 — direct/manual і CLI мають спільні prepare/admit та parent bridge. Кожен прохід, включно з correction/retry, використовує новий nonauthor handle та explicit none. Зібрати пакет з pinned slices і перевірити фактичні args, response, exposure та completed result. Старий код приймає opaque packet, довіряє caller state і відхиляє nonaccepted launch до запису. Потрібні журнал із незалежним checkpoint, збереження adverse/unknown спроб і відмова за обрізану історію, stale/contaminated evidence та невирішене релевантне memory exposure. Live first і changed-candidate correction мають різні handles; фінальні R/C/W/E потрібні на exact candidate за чинними правилами. Спостереження provider internals обмежені.
- AC07/08 — permanent Node suite у test-profiles і фактичний base/head selector; named style guard та лише підтримувані unittest/node-basic у policy, Node TAP і live receipts — explicit external gates. Потрібні fixtures для applicability, owning gates, reuse і held scope. Protected classifier на pinned base відносить orchestration tools та .github/ACCEPTANCE.md до control поза technical allowlist, тож планувати повний lane і підтвердити на готовому diff. Draft PR jobs acceptance/source/Navigation пропускаються; exact-ref dispatch acceptance може дати ранній звіт, native PR source/RI — після Ready. До exact-source доказів і рішення власника readiness/merge/closure лишаються відкритими.

## Live first pass and corrections

The first supported adapter launch was the Requirements preflight on local
commit ba8ac54aae9f5ecff6bb10a6d1d2e804a0652b19 and tree
bb07b7f9d59e4954ac62943810ab35412ba17382. The CLI prepared explicit
`fork_turns="none"`; the parent submitted those arguments and imported the
returned `/root/issue198_live_r_boot`. Invocation SHA-256
a55ba7cef40b49c371c0c93213bf91e22b3f955ecbc23d45928d2f3b7820d20e;
native response SHA-256
4754eed763e69d6e2e2118b3c9192b4b4c65fc8eb54a0d2ee80321cfce953563.
The adapter retained the adverse first result. Report SHA-256
dbaa94f060ef4c40daaf69a22708efedd0f1ae1599741a4d18c0c8f42ab896c1.
No unexpected exposure was reported. Hidden context remains unverified.

The candidate originally passed 67 focused Node cases. Owning acceptance
failed its RI-CI assertion because the declared layer was missing from the
test's expected inventory. The corrected test explicitly covers that layer.
Initial Basic was blocked first by shallow source history, then by missing
publisher dependencies. Both dependencies have been restored. The protected
base selector classified the candidate as a full executable control and
selected the new reviewer-admission test in the PR source lane.

First reviewer output follows, preserved before reconciliation.

# Issue #198 — independent Requirements & Acceptance first result

Verdict: **changes-required** for the inspected candidate; full AC acceptance is additionally blocked by missing evidence/input dependencies. This is a bounded source/requirements assessment, not a completed runtime or delivery acceptance.

Execution: `/root/issue198_live_r_boot`; role: Requirements & Acceptance; first judgment. Candidate `ba8ac54aae9f5ecff6bb10a6d1d2e804a0652b19`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `bb07b7f9d59e4954ac62943810ab35412ba17382`, as supplied. Packet `cde42f129aeef38c0fe6ed9b5a9795300826289c8979fd0a5f2a576b1c8746d0`.

## Findings

### R198-01 — High, blocking: preflight reuse does not validate unchanged prompt/dependencies

Evidence: `tools/orchestration/reviewer-admission.cjs:360–367` (`requirePreflight`), contrasted with `:567–581` (`verifyRole`); common reviewer contract, “Corrections and evidence reuse”; AC03, AC06 and AC08.

`requirePreflight` checks that the latest preflight passes and that its requirementDigest equals the current value, then validates its historical launch/result. It never compares the current common/role prompt or scoped dependency bytes with the preflight packet. The historical result validation at `:463–513` validates completion/artifact identity but does not reread that packet. Thus an unchanged requirementDigest permits a preflight judgment to authorize a dependent review after a material prompt or oracle/dependency change. The ordinary final-role path does compare a current scope digest, so this is a distinct gap in preflight reuse.

Required treatment: define and validate the current preflight-relevant scope identity (including common/role prompt and requirement/oracle dependencies) before carrying its coverage forward. Preserve legitimate candidate-code changes after requirements preflight, but do not let an unchanged caller-supplied requirement digest silently stand in for unchanged dependencies. Add a negative case changing a relevant prompt/oracle dependency while retaining requirementDigest, and a positive case for a genuinely unchanged preflight scope. This finding is from direct control-flow inspection; I did not execute a reproducer.

### R198-02 — Medium, blocking review-input deficiency: mandatory protocol dependency omitted

Evidence: `agents/reviewers/requirements-acceptance.md`, opening paragraph, requires CONTRIBUTING as an actual dependency and requires a blocked result if inputs are missing. The supplied manifest omits `candidate:CONTRIBUTING.md`; the approved diff contains only selected hunks. It does not contain the full independent-quality protocol or its surrounding acceptance/iteration rules.

Implication: the diff permits review of the proposed changes, but cannot establish the complete operative protocol or preservation of every explicit owning gate. A mandatory dependency cannot be assumed from parent history. AC03/AC07 assessment is incomplete.

Treatment: supply a pinned authoritative protocol file or a sufficient expressly approved authoritative extract in a fresh execution packet. No unapproved file was opened to compensate.

## Intent and acceptance traceability

The intent is coherent and assessable: distinguish each independent judgment from clarification, require fresh nonauthor execution, bind source and oracle, hold latest attempts, preserve first results and report the observable boundary. AC08 refines applicability without authorizing removal of explicit owning gates. No owner decision is supplied by a green unit test.

| AC | Required check or owner gate | Observed result and limits |
| --- | --- | --- |
| AC01 | Inventory supported launch, correction/retry/replacement paths and #167/#171 ownership | Guide diff identifies parent-mediated adapter/CLI and offline reducer boundary; reserves #167 pilot and excludes historical #171 same-handle receipts. Complete live inventory not independently established. |
| AC02 | Fresh identities and exact no-inheritance arguments | Source enforces explicit `none`, unique task names and handles, excluded author handles and fresh lineage. Diff contains negative component cases. Actual invocation/response evidence not supplied. |
| AC03 | Each role gets pinned common/role/intent/source/oracle and bounded reads | Source implements manifests and byte slices; this packet hashes matched supplied identities. R198-01 and R198-02 prevent full acceptance. |
| AC04 | Latest pending/adverse attempt holds; excluded results preserved; replacement fresh | Source uses latest role attempts, exclusions, journal checkpoint and immutable records. Component test source covers recovery. No live recovery/checkpoint transcript supplied. |
| AC05 | Valid first and changed-candidate correction plus meaningful refusal cases on supported path | Tests in approved diff describe component positives/negatives and a CLI clean-Git case. No raw successful test run or native first/correction transcript supplied; source existence is not execution. |
| AC06 | Separate completed required roles, exact receipts and safe reuse | This first result supplies only this role’s judgment. Other results intentionally not read. Preflight safe reuse has R198-01; all-role receipts and fresh correction remain external gates. |
| AC07 | Consistent maintained owners/mappings and protected/native delivery | Diff changes routing, protocol, guide, acceptance and test-profile/RI mappings. Mandatory full protocol unavailable; generated-view/native-check and delivery evidence not supplied. |
| AC08 | Applicability unions, explicit gates, unknown scope, same-SHA request and safe reuse | Source and test diff cover page, factual memory, recovery, oracle, mixed/unknown and receipt scopes; #167/#198 retain all roles. Same-SHA explicit request is held. R198-01 leaves reuse incomplete; independent selection against accepted policy remains a parent/owner obligation. |

## Observations, checks and limits

Read only the seven manifest-approved inputs. SHA-256 matched each supplied identity, including the 435-byte approved intent.txt slice. Independently inspected the AC text, current common/role prompts and AGENTS, actual candidate source, and relevant diff sections (protocol, guide, adapter/CLI/contract/tests and mappings). The first large diff display was truncated; relevant sections were subsequently retrieved individually. No external services, peer outputs, unrelated memory or parent notes were read. No implementation/test files were written and no test suite was run: native test files/dependencies and raw execution logs were not separately authorized inputs. The only output written is this artifact.

No unexpected author/peer-history exposure was observed in the supplied context or approved reads. Shared platform/project instructions are visible; provider-internal memory, isolation and model identity cannot be independently attested here. The requested launch parameters and accepted response must be retained by the parent; this reviewer does not infer them from its task name.

Examined risks include stale coverage, unsafe defaults, author/handle reuse, mixed-history exposure, missing role gates, checkpoint rollback and synthetic evidence being mistaken for real execution. Requirements may proceed to independent remediation and evidence collection, but this result must not be imported as a passing preflight or final acceptance. Next gate: address R198-01, supply the missing protocol dependency, and obtain a fresh Requirements judgment; final closure additionally requires mapped component/native/live evidence and separate required role results.

## Exact GitHub source and independent review

Draft #201 was published at 62dfc4c7b6b00fb6b0d8ff90a43059097459294c,
tree 81d41dfb5af02776b489343103d145b2b167e722. Protected base was
f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa. Full local Basic on that tree
passed, 68 focused Node tests passed on the GitHub head, RI-CI passed 23/23,
RI passed 40/40, and the exact-head owning automation passed. Native
[Draft preview](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43204639055)
succeeded. Draft PR Source, Navigation and Owning acceptance were skipped.

The real correction pass used `/root/issue198_live_r_fix` with explicit none
on the GitHub head. Invocation SHA-256
f3848084c8512965ebef56904d7b0d9f608d93a96ff3b566c5ba240a095003f4.
Native response SHA-256
94c0b8baa671dc5cc5ce4157444a20e9571baec51c6ae26921ce6d1c80f5c315.
The imported correction accepted the two original Requirements findings.
Separate real CLI checks held inherited fork, unsupported runner and stale
journal inputs before dispatch. The component still awaited final reviews.

Four additional distinct handles were actually spawned with explicit none and
imported on that exact GitHub head. Their first verdicts follow. Code and both
QA roles found blocking gaps. The follow-up candidate binds observed read
granularity, required evidence and assigned output, distinguishes explicit
review occurrences, preserves neutral correction facts and recovers from
excluded stale results. First verdicts below are historical, with no
equivalence claim for the follow-up candidate.

| Role | Accepted handle | Invocation SHA-256 | Result SHA-256 |
| --- | --- | --- | --- |
| Requirements | /root/issue198_r_final | 428c9f48047c2a35083152518d7d74627278956d6df2e92a3f41e7279150431c | 93ee88b8d7b9f34ccd627871fbc4971fa4798a282c88c18373ad98908781dd98 |
| Code | /root/issue198_c_final | 998d6748acdf11135867ae38cbb4f0d1d9c8bbfbe3045eb6bdef31d5ca01e966 | 4e5e847d68ae837a71da88f8fd7ea914bb0482e5d6878a19b7fb91636df9605c |
| White-box | /root/issue198_w_final | bea57d342b235027675799e3abfc0b501af39684691f1a726ee2532cd702af1e | d1edc393c8962d8a665d4936d78ce9bbb72c256c29d4f31b11bfa0f470904077 |
| Exploratory | /root/issue198_e_final | 385c961361fc7a87a6d821e69658f4d84acfbf9dd442030160a3d6e356ef416a | 66f9ea7e8341eeffaf715b6bf4b06fb2240f41f066dd740066d49e5e4f7579ab |


# Issue #198 — independent Requirements & Acceptance correction review

Verdict: **PASS for the bounded R198-01/R198-02 correction scope**. This is not whole-issue acceptance or authorization for delivery. No new blocking requirement defect found in the inspected correction. AC05–07 retain external execution, independent-role and native-delivery gates.

Reviewer execution: `/root/issue198_live_r_fix`, first result of this execution; distinct nonauthor review. Candidate: `62dfc4c7b6b00fb6b0d8ff90a43059097459294c`; base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`; declared tree `81d41dfb5af02776b489343103d145b2b167e722`. Packet: `9dcf0e24c4f4fdd410f747b1524d6558b90ccaf1d7aaaf2061b0f9c2a1c96e9e`.

## Individual dispositions

- **R198-01 — resolved.** In `tools/orchestration/reviewer-admission.cjs`, `packet()` computes the preflight scope digest from requirement identity, all non-source references and slices. `requirePreflight()` compares it against the current preflight packet before allowing dependent preparation or assessment. Common prompt, role prompt, instructions and oracle therefore participate; implementation-only source references do not. Independent in-memory checks observed `PREFLIGHT` for each separate common/role/oracle/instruction mutation, with the requirement digest unchanged, and observed successful preparation after an implementation-only source delta. This meets the specified invariant within the parent-maintained current-packet trust boundary.
- **R198-02 — resolved.** The approved packet contains candidate `CONTRIBUTING.md`, SHA-256 `c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357`. I read the governing review/applicability/iteration sections. `packet()` additionally requires a candidate-space instruction reference at that exact path. An independent in-memory omission case observed `PROMPT` refusal.

## Intent and acceptance linkage

| AC | Independent oracle / required check | Observed result and remaining gate |
| --- | --- | --- |
| AC01 | All supported entry points and shared #167/#171 ownership must be identified | Guide diff identifies parent-mediated direct/CLI paths, offline reducer boundary and historical #171 v1 limits. Full inventory completeness beyond the supplied changes was not independently established. |
| AC02 | Every new judgment requires a fresh nonauthor execution and explicit no-inheritance | Prepare emits `fork_turns=none`; launch verifies exact invocation and handle correlation, excludes author/reused handles. Source and fixture review support implementation; actual native launch chronology is outside this packet. |
| AC03 | Role-specific current packet includes required policy, prompts and independent oracle | Packet guards, pinned bytes and bounded slices inspected; all eight supplied file hashes match the approved manifest. R198-02 verified. No provider-internal isolation claim. |
| AC04 | New pending/adverse/contaminated attempts hold acceptance and require replacement | Latest-attempt selection, exclusion, outstanding findings and checkpoint validation inspected. These are parent-observed controls; no trusted external checkpoint receipt was supplied for this execution. |
| AC05 | Meaningful positives/refusals plus actual fresh first/correction calls | Test diff includes selection, bootstrap, contamination, stale result, changed-candidate correction and checkpoint cases. Six independent in-memory correction checks passed. Full native campaign and live first/correction evidence not observed. |
| AC06 | Separate complete required-role outputs and preserved exact-source receipts | Result schema, immutable record operations and revalidation inspected. Peer outputs deliberately not read. Four-role completion remains an orchestration gate. |
| AC07 | Consistent maintained owners, actual supported execution and native delivery | Relevant AGENTS/CONTRIBUTING/common-prompt/guide/acceptance/profile diffs align with fresh correction policy. Native/RI/style/delivery results were not supplied and remain required. |
| AC08 | Scope union and explicit gates cannot silently lose required roles | Surface matrix and tests distinguish visible behavior, factual handoff, memory recovery, oracle/test changes, unknown scope, deterministic exemptions and explicit same-SHA requests. Hard-coded #167/#198 role retention preserves these explicit gates. Actual impact classification remains a trusted parent responsibility. |

## Checks, risks and limits

Read only approved files and the approved 0–686-byte intent slice; no peer reviews, unrelated memory, parent scratch notes or external services were inspected. No unexpected author/peer-history exposure was observed. Platform/project instructions were visible; hidden provider context and accepted spawn parameters cannot be independently attested from inside this reviewer execution.

Verified all eight approved file SHA-256 identities against the launch manifest. Read the candidate adapter in full and targeted actual diff sections for policy, acceptance mapping, guide, test fixture/cases, CLI, adapter contract and test-profile route. Navigation-map/generated diff details were not exhaustively audited. The supplied source identities are byte-verified; I did not independently query Git/GitHub because those are outside the approved packet.

Executed six bounded cases in memory: changed common prompt, changed role prompt, changed oracle, changed instruction, implementation-only source delta, and missing governing CONTRIBUTING input. The candidate adapter was evaluated with its contract and fixture extracted directly from the approved actual diff, avoiding reads of unapproved dependency paths and avoiding fixture filesystem writes. These checks test the specified invariant, not the entire campaign or native launch path. No implementation or tests were changed.

Examined risks: stale preflight reuse despite unchanged intent digest; omission of governing policy; accidental invalidation from implementation-only source changes; confusing synthetic component receipts with live isolation; dropping explicit owning gates; older approval bypass of a newer pass. The fixes address the first three. The latter risks remain bounded by parent trust and external evidence obligations already retained in the maintained contract.

No historical review conclusion was reused. Correction dispositions were derived afresh from current approved bytes and direct observations. Next gate: reconcile this preserved result with independently completed required roles and actual supported-route/native evidence; keep unobserved whole-AC conditions open.

# Issue #198 — independent Requirements & Acceptance final review

Verdict: **pass for the bounded requirements/acceptance review**. No blocking requirement or acceptance-contract defect found in the inspected candidate. This is not whole-issue acceptance: LIVE, complete four-role reconciliation and NATIVE delivery gates remain unverified by this execution and must remain open until separately evidenced.

## Identity and boundary

- Reviewer: `/root/issue198_r_final`; role Requirements & Acceptance; first independent final judgment of this execution.
- Candidate: `62dfc4c7b6b00fb6b0d8ff90a43059097459294c`; base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`; supplied tree `81d41dfb5af02776b489343103d145b2b167e722`.
- Packet: `ac01bb7baf5175850c6c96d5eaa9721751a7af136d97b2e6a3b19b74d7b7dea1`.
- Common prompt SHA-256: `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`; role prompt: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`.
- Checked all thirteen supplied file SHA-256 identities against the manifest; all match. The intent slice is the complete 710-byte supplied intent file. Inspected the approved instructions, acceptance owner, guide, implementation, CLI, contract, tests and supplied diff, including acceptance/profile/RI mapping additions. Other files mentioned by links were not opened.
- No author conversation, peer reviews or unrelated memory inspected or observed. The initial environment includes general platform and user/project instructions; these contain no current author/peer verdict. Provider-internal context, actual parent launch arguments and automatic-memory machinery are not independently observable from this reviewer. No clean-provider or OS-isolation claim is made.

## Requirement quality and traceability

The intent distinguishes fresh execution from a merely renamed role, includes subsequent passes, and defines observable refusal conditions. AC01–08 retain stable meanings and separate implemented behavior from actual live observation. AC08's applicability rule does not override the explicit #198/#167 four-role gates. The maintained contract appropriately assigns semantic packet curation, full-diff impact selection, native observation and checkpoint retention to the parent; the reducer validates their correlation and cannot establish their truth from hashes alone.

| AC | Independent oracle and inspected linkage | Observation and remaining gate |
| --- | --- | --- |
| AC01 | Intent inventory obligation → guide, Parent-mediated reviewer admission | Guide identifies parent tool/CLI paths, canonical adapter, offline reducer's absence of launcher, #167 pilot and #171 historical correction receipts. Inventory is documented; completeness beyond supplied surfaces not independently observed. |
| AC02 | Fresh distinct nonauthor execution → prepare, recordLaunch, verifyLaunch; tests for unsafe fork, author and prior handle | Explicit `fork_turns: none`, new task names, handle exclusion/reuse checks and exact argument correlation inspected. Focused tests pass. Actual first/correction native tool executions remain LIVE evidence. |
| AC03 | Separate role assignment, exact packet and no peer history → packet and verifyResult | Common/role dependencies, UTF-8 slices, hashes, scoped read manifests and exposure refusal inspected. Peer-canary test passes. Content classification and actual observed reads remain parent/reviewer responsibilities; no semantic contamination detector is claimed. |
| AC04 | Newest pending/adverse attempt holds; replacement preserves history → latest, outstanding, exclude, prepare and checkpoint validation | Tests cover pending latest attempt, contaminated replacement, stale journal checkpoint and non-applicable result refusal. Excluded and failed attempts survive in journal. Recovery relies on independently retained parent checkpoint and native observation reconciliation, explicitly documented. |
| AC05 | Meaningful positive/negative behavior → ten permanent Node cases and LIVE gate | All ten cases executed successfully. Tests use synthetic parent observations for adapter behavior, with real temporary Git target for CLI source checking. They do not alone demonstrate live first/correction agent execution; mapping retains LIVE for that requirement. |
| AC06 | Completed separate results and unchanged-only reuse → verifyResult, verifyRole, openFindings, assess; REVIEW/LIVE gates | Source/result/launch correlation, fresh correction lineage, stable blocking finding disposition and reconciliation inspected. Current peer results intentionally not read; their completion and reconciliation cannot be declared by this review. |
| AC07 | Canonical routing, mappings and real delivery → AGENTS, CONTRIBUTING, common prompt, guide, acceptance and supplied mapping diff | Maintained owners consistently require fresh passes and preserve external gates. RI/source-profile additions inspected in diff. RI, style, hosted/native checks, merge and post-merge state not executed/observed here. |
| AC08 | Applicability union and unchanged reuse → CONTRIBUTING matrix, select, requirePreflight, verifyRole | Cases exercise visible page, factual memory/checkpoint, memory recovery, oracle/tests, routing, combined surfaces, unknown scope, receipt metadata, owning gates and explicit same-SHA request. Unknown scope holds. Changed preflight oracle invalidates preflight even without intent-digest change. |

## Checks, examined risks and disposition

Executed `node --test tests/reviewer-admission.test.cjs` in the candidate root: **10 tests, 10 pass, 0 fail/cancelled/skipped/todo**, exit 0. The CLI case creates and removes its own temporary fixture, as permitted by the focused-test authorization. No implementation/test edit or external mutation performed.

Examined risks: silent fallback to inherited context; author/reviewer identity reuse; peer leakage through mixed evidence; missing role prompts; stale candidate and oracle reuse; older approval bypassing a newer pending/adverse result; removal of outstanding roles; loss of failed attempts during recovery; conflation of component tests with actual independent review; and narrowing of longstanding owning gates. No blocking defect established against the declared parent-mediated trust boundary.

No new owner decision is needed for the inspected requirements. The next acceptance gate is parent-side verification of exact-source native launch/readback evidence (including fresh changed-candidate correction), all required completed role results and contradictions, plus mapped current-source RI/style/native delivery evidence. Do not tick whole criteria on this result or the green component suite alone. Unavailable provider internals remain an explicit limitation rather than an invented assurance.

This first output is immutable; no peer reconciliation or earlier review coverage was reused.

# Issue #198 — independent Code / Changed Artifact review

**Verdict: changes required.** Candidate `62dfc4c7b6b00fb6b0d8ff90a43059097459294c`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `81d41dfb5af02776b489343103d145b2b167e722`. Packet `7da26c56aa6920ce866991a4d18c0a78a70cad97865c2373d73f366805f255b5`, diff SHA-256 `ee309489f560e77e4f95a95848deede849dd0b1ac0f313e132223c2d0b445262`. Common prompt SHA-256 `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`, role prompt `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.

## Blocking findings

| ID | Source and impact | Evidence and treatment |
| --- | --- | --- |
| C198-01 | High · `tools/orchestration/reviewer-admission.cjs:258–328,419–422,497–506` · AC03/04/05/06 | The packet allows slices of a mixed file, but the stored receipt allowlist consists of whole-file refs. Reporting the entire mixed file containing the existing test fixture’s peer-verdict canary as the only read was accepted. Reporting `reads: []` with a passing result was also accepted. The receipt cannot express an observed slice or establish that any required source was inspected. Carry the authorized read granularity into the prepared request and completion receipt, reject full reads of slice-only files and require observed inspection of the applicable source set. Test the whole-file and empty-read refusals as well as an accepted slice. |
| C198-02 | High · `tools/orchestration/reviewer-admission.cjs:308–324,474–506,527–541` · AC03/06 | The prepared packet names an exact output, yet a completion for `/fixture/evidence/code-review.md` was accepted with a different artifact, `event-3.json`, and no reads. Admission checks a digest supplied by the completion, path uniqueness and nonempty text, without checking that the artifact is the assigned execution output. Bind the receipt to the assigned path (or an explicit observed immutable capture of that path) and its bytes. Refuse unrelated result paths. |
| C198-03 | High · `tools/orchestration/reviewer-admission.cjs:120–133,413–415,585–596` · AC02/04/08 | The adapter validates an explicit new-review request as nonempty text and considers any existing review with identical text current. In an in-memory probe a first same-SHA explicit request `code review again` passed, an ordinary assessment passed, and a second explicit request with that wording was immediately accepted using the first handle. Bind each explicit request to a distinct observable occurrence ID or checkpointed generation, hold until the required fresh review of that occurrence, and test two requests with identical text. |
| C198-04 | High · `tools/orchestration/reviewer-admission.cjs:283–328,394–430` · AC03/06 | A correction is bound to a predecessor digest in the journal, but `prepare` builds the same generic launch assignment and only requires an intent slice. After admitting a blocker with ID `C1` and symptom `required symptom`, changing the target and preparing a correction with the original brief succeeded. The exact launch message omitted both the ID and symptom. Require a pinned neutral correction brief referencing outstanding IDs and the symptom and expected invariant, without importing prior deliberation or verdict prose. Add a refusal for incomplete briefs. |

## Checks and limits

- Compared manifest hashes for the approved candidate files and evidence diff and intent. Checked the SHA-256 of the approved 0–710 byte role intent slice. Inspected the implementation, CLI, contract, focused suite, prompt and relevant routing, acceptance and RI/profile diff. The guide identifies #198 as the parent-mediated adapter owner and preserves the #167 four-role pilot and historical #171 distinction. This packet did not provide native #171 receipts or unrelated repository history for an independent inventory check.
- Ran `node --test tests/reviewer-admission.test.cjs`. All 10 tests passed. The checked positive and negative paths included explicit no-fork arguments, parent-observed launch correlation, a distinct correction handle, pending and contaminated attempts, an independently pinned journal and actual Git-source validation in the CLI fixture. The additional probes reused the approved in-memory fixture and independently exercised the failing cases above without writing a test or implementation file. The focused suite tests an out-of-manifest read, but its normal receipt reports `prepared.allowedReads` wholesale and its artifact helper already uses a different path from the assigned output.
- AC01 and AC07 have documented ownership and source-selection routes. I did not run the complete RI, source profile, hosted, or protected delivery workflows. AC02 and AC08 show correct scope unions, preservation of the explicit #167 gate and fresh handles when a launch actually happens. C198-03 prevents acceptance of the required repeat-request guarantee. AC03–06 remain affected by the findings above. Separate live parent-observed outcomes for the other roles and exact native delivery are outside this review.
- No unexpected exposure observed. I read only the approved packet inputs, did not inspect parent conversation or current peer outputs, and performed no external mutations. Provider model, hidden context, automatic memory internals and the exact native launch response were not visible to this reviewer. The in-memory launch/completion records are component fixtures, not provider evidence. No owner or release approval is implied.

# White-box QA — issue #198

**Verdict: changes required.** The focused suite passed. Separate component probes found defects in result admission and stale-evidence recovery. Correction assignment also lacks a check that the fresh reviewer receives the prior finding IDs and neutral evidence.

Target `62dfc4c7b6b00fb6b0d8ff90a43059097459294c`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `81d41dfb5af02776b489343103d145b2b167e722`. Packet `795744e7836573be442b98ae442d2138c133ecc361fc34014fc05e4bef28e0d0`. The SHA-256 values for all listed candidate files and the intent/diff evidence matched the supplied manifest. I read only the assigned 710-byte range of the role brief and verified its hash. Common prompt `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`, role prompt `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. No unexpected exposure observed.

## Findings

1. **W198-01 — High — AC03, AC05, AC06. A pass can omit source inspection and return an artifact outside the assignment.** In `tools/orchestration/reviewer-admission.cjs:419`, the prepared execution stores only allowed read refs. At lines 497–506, an empty `completion.reads` passes the membership test, and an arbitrary nonempty evidence artifact passes the artifact checks. The configured output is embedded in the launch message at line 324 but never compared with the imported artifact. The independent probe used an exact emitted invocation, an observed fixture handle, and a parent receipt expressly listing zero reads. Assessment returned `accepted`. The declared output was `/fixture/evidence/code-review.md`; the accepted artifact was `event-3.json`. Bind the output reference to the prepared assignment and require the parent-observed completion record to account for mandatory review inputs and any unavailable surfaces before a pass. Keep the explicit limit on observation of provider internals.
2. **W198-02 — High — AC04, AC05. An excluded stale result can permanently block its fresh replacement.** `exclude` permits stale exclusion of a completed attempt at lines 545–560. After a fresh passing replacement, `verifyRole` still calls `openFindings` at line 599. At lines 564–574, that scan revalidates the excluded predecessor's artifact before checking any finding, including predecessors with zero findings. The probe first admitted a pass, explicitly excluded it as stale, made its old artifact bytes unavailable by replacing them in the fixture store, then launched and completed a fresh replacement. The final assessment returned `STALE` even with zero prior findings. Retain the exclusion and old evidence identity, preserve unresolved material facts through bounded independently verifiable evidence, and let the replacement satisfy the gate without requiring inaccessible excluded bytes. Add a separate regression for a previously admitted result and cases with and without outstanding findings.
3. **W198-03 — Medium — AC03, AC05, AC06. Correction lineage is enforced without binding the actual correction assignment to the outstanding findings.** In `tools/orchestration/reviewer-admission.cjs:394–415`, `prepare` validates the predecessor and builds the generic role packet. The message at lines 311–327 carries neither the phase nor required finding IDs. The packet validator at lines 283–307 requires only an intent slice. In `tests/reviewer-admission.test.cjs:307–328`, finding `C1` is recorded and resolved after the candidate changes, while the corrective launch uses the original generic brief from lines 37–76. The correction result can supply an ID that the checked launch never gave the reviewer. Bind applicable stable IDs and a neutral symptom/invariant reference to the prepared correction packet. Preserve the prior independent verdict outside the packet. Test that omitted correction evidence holds and that the launched message contains the approved material facts.

## Risk-to-test matrix

| AC and risk | Independent oracle | Observed check or gap |
| --- | --- | --- |
| AC01/07 — entry points and ownership | The canonical adapter and CLI share admission rules. The offline reducer does not dispatch; #167 retains its existing gate. | Reviewed candidate diff and named policy files. The guide identifies the parent bridge, CLI, #167 and #171 and separates live and native evidence. Historical inventory and external delivery were outside the approved reads. |
| AC02/05 — first and correction identity | Explicit none on the actual invocation; reject omitted/inherited settings and reused author/reviewer identity. | Component tests reject bad prepare arguments, altered invocation, author handle and prior correction handle. Live provider calls and rejected-tool chronology were not observed. |
| AC03/06 — manifest, assignment and result | Role prompt and bounded evidence match the current source; a completed pass has observed inspection and the assigned immutable result; correction receives applicable neutral facts. | Slice canary and role packet checks pass. W198-01 reproduced and W198-03 observed in source and test fixture. |
| AC04/05 — adverse or pending chronology and recovery | A latest pending/adverse attempt holds; exclusion plus a fresh and complete replacement can recover without relying on stale evidence. | Existing tests cover pending holds, stale checkpoint, declared contamination and failed/rejected-result replacement. W198-02 reproduced after a previously admitted result. |
| AC08 — applicability and reuse | Known affected roles union; owning gates survive; unknown scope holds; explicit same-SHA review supersedes reuse. | Selection tables exercise page behavior, factual tracked and external handoff, recovery, oracle/tests, mixed known surfaces, receipt/metadata exemptions and unknown scope. Separate tests exercise same-SHA request and dependency reuse. Impact classification against an independently selected real diff remains parent-owned and was not measured. |

## Execution and allocation

- Ran `node --test tests/reviewer-admission.test.cjs` against the manifest-matched source. Exit 0, no signal reported, 10 tests passed, 0 failed, 0 cancelled, 0 skipped, 0 todo. This includes the maintained CLI function exercising the pinned checkpoint and a temporary Git target. It exercises `select` through the CLI function; the other lifecycle operations are exercised through the API fixture.
- Ran an in-memory `node` heredoc, reusing only the fixture definitions from the assigned test source and the production admission API. Exit 0, no signal reported. Captured observations: `completion with no observed reads: accepted`; `declared output: /fixture/evidence/code-review.md accepted artifact: event-3.json`; `replacement assessment: STALE`. The probe did not modify repository or external state.
- The approved diff maps this permanent suite to `pr-targeted`, `staging`, and `production`, owned by `guides/WEB-ORCHESTRATION.md`, with `node tools/quality/source-tests.cjs --profile production` as surviving route. Put the proposed component regressions in the same suite. Keep supported live correction and native delivery with the existing owning evidence gates. No native CI, provider internals, role receipts for other roles, or measured branch coverage were observed.

# #198 Exploratory / Interaction QA

**Verdict — changes required.** Two blocking findings affect the parent operator’s recovery and result-admission paths.

## Target and scope

- Candidate `62dfc4c7b6b00fb6b0d8ff90a43059097459294c`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `81d41dfb5af02776b489343103d145b2b167e722`, as assigned. Packet `177159258d5e46b8e7854faf46e99ba81975f560ca56c9d889db8949764295d6`.
- Matched the approved SHA-256 manifest for the common contract (`725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`), Exploratory prompt (`280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`), adapter, CLI, contract, tests, AGENTS, CONTRIBUTING, acceptance policy, orchestration guide, diff, and intent evidence. Read bytes `[0,710)` of the assigned brief. Git identities are supplied by the packet. Local SHA-256 readback covered its approved files.
- Charter — walk the parent operator route from selection and preflight through launch/import/assessment, then try recovery after late contamination and try missing or mismatched completion evidence. Bound to one walkthrough, one focused suite and three in-memory adapter probes. Environment was local Node, the approved candidate sources and read-only packet evidence. No external writes or site/browser work.

## Findings

### E198-01 — Blocking. An excluded completed attempt can defeat clean replacement

`tools/orchestration/reviewer-admission.cjs:545` records the exclusion while retaining the prior result as intended. `openFindings` at `:564` still verifies every prior result and imports its open blocking findings, including results flagged as contaminated or stale. The operator guide at `guides/WEB-ORCHESTRATION.md:182` routes the parent to exclude and replace these attempts. The existing passing recovery test at `tests/reviewer-admission.test.cjs:330` only exercises predecessors with `result: null`.

- Expected — when exposure is discovered after import, the excluded judgment is retained in the journal. A valid fresh replacement can satisfy the gate while independently rechecking material facts carried forward as neutral evidence.
- Observed — imported `changes-required` with an open blocking finding, excluded it as `contaminated`, then prepared, launched and imported a fresh `pass`. Assessment returned `UNRESOLVED_HISTORY`. In a second probe with an excluded completed pass, changing that excluded artifact after recording the fresh pass made assessment return `STALE`.
- AC04 and AC05 are affected. AC06 correction evidence is also affected. Keep exclusion and predecessor evidence in the chronology, and omit excluded judgments from active finding reconciliation. Carry material factual observations into the fresh packet. Add coverage for exclusion after a result was imported, a fresh replacement, and an unavailable or stale excluded artifact.

### E198-02 — Blocking. A completion can count without demonstrated source reads or the assigned output

`tools/orchestration/reviewer-admission.cjs:419` retains the file allowlist without slice boundaries. `verifyResult` at `:497` checks that each listed read is allowed, which accepts an empty array and has no way to record which range of a mixed file was read. At `:505` it accepts any nonempty evidence file of kind `result`. The result is never checked against the designated output path shown in the launch message.

- Expected — the admitted result is the artifact assigned to that execution. Observed essential source reads and declared bounds support a completed review, with exact slice coordinates for mixed files. Missing observations hold the gate.
- Observed — with `completion.reads: []` and designated output `/fixture/evidence/code-review.md`, the probe imported `event-3.json` as the result and returned `accepted`. Existing tests pass synthetic file-level read refs. A file-level ref for a mixed file cannot distinguish the approved slice from a read of the whole file.
- AC03, AC04 and AC06 are affected. Bind each attempt to its assigned output and require a unique output for each execution. Define the essential read observations, including slice identity where required, and hold absent or out-of-bound observations. Add separate tests for empty reads, wrong output, and whole-file versus allowed-slice observations.

## Walkthrough and dispositions

| AC | Exploratory observation |
| --- | --- |
| AC01 | Guide identifies the canonical API/CLI, the offline reducer without a launcher, and the #167/#171 relationship. Parent sequence covers preflight, first launch, correction, exclusion, replacement and resume. Native #171 history and launch-path completeness were outside the approved file scope. |
| AC02 | `node --test tests/reviewer-admission.test.cjs` passed 10/10. The suite covers explicit no-fork, launch argument correlation, author/old handle rejection, fresh changed-candidate correction, and explicit same-SHA review. This execution used the assigned fresh review task. No separate native launch was made by this reviewer. |
| AC03 | Suite exercises pinned brief content and disallowed input paths. E198-02 limits what the imported completion establishes. |
| AC04 | Suite verifies the latest pending attempt holds acceptance, refuses declared exposure, and recovers when the excluded predecessor has no imported result. Probes exercised the failure after late exclusion and the admission of missing completion evidence. |
| AC05 | Local component and CLI suite passed. Probes exposed the two component failures above. A live first/changed-candidate correction and its tool receipts were outside this reviewer’s observation. |
| AC06 | This artifact records one independent role judgment. The other roles, complete native receipts and a fresh correction were outside this reviewer’s observation. E198-02 affects result assurance. |
| AC07 | Walked AGENTS to CONTRIBUTING, common and role prompts, guide and component. Reviewed the acceptance and profile mapping through the approved diff. Exact-head native workflows and protected delivery were outside this reviewer’s observation. |
| AC08 | Suite exercises narrow page behavior, factual cases, recovery, tests/oracles, mixed and unknown scope, receipt/metadata, explicit gates and same-SHA requests. Observed the expected role unions and unknown hold through the focused suite. E198-01 affects subsequent reuse and replacement. |

The profile diff maps `tests/reviewer-admission.test.cjs` to `pr-targeted`, `staging` and `production`. Both proposed regressions belong in that existing component suite and remain unexecuted as permanent tests. The three in-memory probes reused the approved test fixture to drive the actual API with new inputs and used the original issue intent as the expected behavior.

## Context and limits

The runner surfaced a user-level project instruction and incidental personalization in the environment context independently of the bounded packet. I saw no parent implementation conversation or peer verdicts, and did not use the extra material in the review. The parent should record that exposure and determine eligibility under the common contract. Provider internals, automatic memory mechanics, cross-role results and the full native correction lifecycle remain unobserved.
