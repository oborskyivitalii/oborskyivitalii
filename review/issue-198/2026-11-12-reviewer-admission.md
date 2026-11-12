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

## First correction round and remaining edge cases

On GitHub head 34f0e39f2fe6282f172c1c885a80b6ea559c77f6 and tree
90be8d69e18712242d18ac5c88c2a02c6edfb6d9, the exact-source owning automation
and 72 focused Node tests passed. The fresh Requirements preflight and
final Requirements and Exploratory roles completed. Code and White-box
verified assigned reads/output and stale-evidence recovery. They reproduced
a dropped observed same-SHA request and omission of open nonblocking facts.
The following candidate checkpoints explicit request occurrences before
preparation and retains all outstanding correction facts. Its applicability
record also binds the actual target. Independent judgments follow below.


# Requirements & Acceptance correction verdict

Verdict: **pass for this bounded correction/preflight scope**. This is not whole-issue closure, native delivery acceptance, or a substitute for the other required roles.

Reviewer execution: `/root/issue198_r_delta_boot`; issue #198; target `34f0e39f2fe6282f172c1c885a80b6ea559c77f6`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `90be8d69e18712242d18ac5c88c2a02c6edfb6d9`. Packet `9ae200eff5b8449f3755feac4e0e42e45f4ed369ca256d7786664915f13ff9e3` as supplied. All eight approved input hashes matched the supplied manifest.

## Independent findings and dispositions

- **R198-01 — resolved.** `tools/orchestration/reviewer-admission.cjs`, `packet()` scopeDigest construction and `requirePreflight()`: the current preflight packet is now rebuilt and its scope digest compared with the accepted preflight. Requirements digest, common/role prompts, instructions, oracle and evidence slices participate; implementation-only `source` references are excluded from that requirements-scope digest. All manifest bytes are still validated by `files()`. A changed oracle or prompt with an unchanged requirement digest cannot reuse the accepted preflight. Both prepare of a dependent review and assess invoke this guard. The permanent oracle-change test passed; an independent in-memory prompt-change probe returned the expected `PREFLIGHT` refusal.
- **R198-02 — resolved.** `packet()` requires a candidate-space, instruction-kind `CONTRIBUTING.md` entry alongside common and role prompts, candidate source and oracle. Omission returns `PROMPT`. I independently exercised omission using the inspected fixture and observed the expected refusal. The actual assigned packet includes the governing protocol and I read it.

No new blocking requirement defects found in the correction scope. Examined risks included stale prompt/oracle reuse, dropping the governing dependency, confusing implementation-only changes with changed requirements, acceptance without all assigned reads, and treating a bounded correction review as issue completion.

## Acceptance linkage

| Intent / AC | Check or gate | Observed result |
| --- | --- | --- |
| AC03, AC04, AC06, AC08: current relevant inputs for reused requirements coverage | Current `packet()` and `requirePreflight()`; oracle-change test; independent prompt-change probe | Scope comparison enforced; oracle and prompt changes refused until a new preflight |
| AC03, AC07: governing protocol is part of the inspectable packet | Required instruction reference plus independent omission probe | Missing CONTRIBUTING refused; supplied current protocol inspected |
| AC02, AC04, AC05: fresh identity, explicit isolation, contamination/staleness refusal and changed-candidate correction | `node --test tests/reviewer-admission.test.cjs` | 14 passed, 0 failed, 0 skipped; component evidence only |
| AC01, AC06, AC07: launch inventory, all actual independent results, protected delivery | Separate owner/native evidence gates | Not established by this bounded verdict; remain the orchestrator’s next gates |

## Inspected inputs and checks

Read the complete approved common contract, requirements role prompt, AGENTS.md, CONTRIBUTING.md, reviewer-admission.cjs, intent-ac.txt, and candidate-34f0e39f.diff. The diff’s added module was also reconstructed in memory and byte-compared equal to the separately inspected module. Read only bytes [0,432) of issue198_r_delta_boot-intent.txt (the complete allowed slice). Recovered truncated tool output with bounded reads rather than treating truncation as inspection. SHA-256 checks matched every manifest entry.

Executed the expressly permitted focused Node suite (14/14 passing). Independently executed two in-memory API probes using the fixture text extracted from the approved diff: changed preflight role prompt with stable requirement digest; missing CONTRIBUTING instruction reference. Both produced the required refusal. These probes wrote no files. The focused suite's own temporary Git fixture was created and removed by that suite. Runtime dependencies used by these permitted checks were not separately claimed as approved-source inspection.

Unexpected exposure: none observed. No peer verdict, author scratch note, unrelated memory or parent-history file was inspected. Candidate diff rationale and synthetic contamination-canary text were treated as review subjects/test data, not trusted verdicts. Platform-provided repository instructions were visible; hidden provider context/internals and actual launch parameter acceptance are not independently observable from this reviewer execution and remain the parent's receipt obligations.

## Scope and next gate

No prior reviewer conclusion was reused. The stable finding IDs and neutral symptoms/invariants supplied in the packet guided fresh examination of current code and protocol. This confirms the two corrections and requirements linkage within the supplied scope. It does not prove complete live execution or hidden-context isolation. Preserve this first verdict, reconcile only after completion, and continue the separate current-source role/native gates required by issue #198.

# Independent Requirements & Acceptance delta review — issue #198

Verdict: **pass for the bounded candidate requirements/acceptance review**. This is not whole-issue acceptance, delivery approval, or evidence that the other required executions occurred.

Reviewer execution: `/root/issue198_r_delta`.
Candidate: `34f0e39f2fe6282f172c1c885a80b6ea559c77f6`; base: `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`; tree: `90be8d69e18712242d18ac5c88c2a02c6edfb6d9` (assignment identities).
Packet: `750ff59fa78eb3acdde8d3f6942b3c3e36aa95aa5e77c8201186a98de1ded6b4`.

## Inspected inputs and exposure

I inspected all eight approved inputs. Their SHA-256 values were recomputed and matched the supplied manifest:

| Input | SHA-256 |
| --- | --- |
| candidate:agents/reviewers/README.md | 725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8 |
| candidate:agents/reviewers/requirements-acceptance.md | 010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6 |
| candidate:AGENTS.md | 120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3 |
| candidate:CONTRIBUTING.md | c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357 |
| candidate:tools/orchestration/reviewer-admission.cjs | 5b5f9763a4d631614b0b20b3158c3c0b72bfbb0026e509828df60cb8512f9e4b |
| evidence:intent-ac.txt | 626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199 |
| evidence:candidate-34f0e39f.diff | 9366be6199832a49f9fe66fdb9969aa398e389674be6f9d904bfffaaf7a0aeed |
| evidence:issue198_r_delta-intent.txt, bytes [0,432) only | 34a083abe774dbfb6d8b74026e3ac732559136fd408181a44682babc2c4bb720 |

The full adapter addition in the diff was byte-compared with the independently inspected adapter source and matched. Other changed files were inspected through the approved diff. Initial oversized output was truncated; bounded subsequent reads supplied the substantive text rather than treating truncation as comprehension. No parent history, peer review artifacts, unrelated memory, or other unapproved source text was inspected. No unexpected exposure was observed. Platform/project instructions were visible; hidden provider memory/context behavior and actual launch acceptance are not independently observable from this assignment. The explicitly permitted focused test executed its normal fixture/dependency accesses; these are execution, not additional independently inspected source grants.

## Findings and correction dispositions

No blocking or nonblocking requirement defect found in this bounded review. No prior finding IDs or neutral correction facts were supplied, so there are no prior IDs to mark resolved. I did not infer clearance of undisclosed findings or reuse another review verdict.

Examined risks include accidental default conversation inheritance; correction reuse of an old identity; source/read-grant and output-path mismatch; preflight reuse after oracle changes; latest pending/adverse attempts being bypassed; stale excluded artifacts losing known blockers; explicit successive same-SHA requests reusing an earlier pass; and applicability reductions overriding existing owning gates.

The source supplies explicit `fork_turns: none`, unique task/launch identity checks, current packet comparisons, read-grant admission, latest-attempt selection and retained blocker metadata. These correspond to the accepted invariants. Applicability is selected from a trusted parent impact record: classification correctness remains an external gate, not a claim that this reducer infers actual impact from a Git diff. The maintained documentation states that boundary and retains existing owning/profile gates.

## Intent and AC traceability

| AC | Check or owner gate | Observed result and limit |
| --- | --- | --- |
| AC01 | Guide inventory and REVIEW gate | Approved diff identifies the parent-mediated adapter, shared CLI, offline reducer boundary, #167 pilot and #171 v1 receipts. No independent live repository-wide inventory was authorized here. |
| AC02 | prepare/record-launch, component tests, LIVE | Explicit no-inheritance arguments, task uniqueness, excluded-author and duplicate-handle checks inspected. Focused tests passed. Real tool invocation/readback remains a separate gate. |
| AC03 | packet/verifyResult, component tests, LIVE | Canonical common/role prompts, source/instruction/oracle inputs, byte slices, current hashes and complete approved reads are required. This review read the assigned sources. Arbitrary content classification still needs parent inspection. |
| AC04 | latest/requirePreflight/openFindings/exclude/assess | Latest pending or excluded execution holds its role; exclusion permits a fresh replacement while retaining blocker metadata. Focused refusal/replacement cases passed. |
| AC05 | permanent focused suite plus actual bridge LIVE evidence | 14/14 tests passed, including changed-candidate correction and negative admission cases. Synthetic fixtures do not establish actual clean runtime context; LIVE remains required. |
| AC06 | separate completed reviews and actual receipts | Common contract preserves first results and fresh corrections. This output supplies only the Requirements result; other results and live chronology were neither supplied nor inferred. |
| AC07 | canonical routing plus RI, RI-CI, STYLE and NATIVE | Diff aligns routing, common contract, guide, acceptance mapping and permanent test profile. Native/protected delivery and full RI/style execution were not checked here. |
| AC08 | CONTRIBUTING applicability matrix, select, owner gates | Matrix and surface union match the stated scopes; unknown scope holds; #167/#198 retain all roles; explicit same-SHA occurrences are bound to request identity. Focused selection/chronology cases passed. Parent's factual impact classification and unchanged-scope dependency completeness require evidence. |

Executed `node --test tests/reviewer-admission.test.cjs` in the supplied candidate root: **14 tests, 14 passed, 0 failed, 0 skipped, 0 cancelled**. The test source was inspected through the approved diff. This supports component behavior only.

## Remaining gates

No new owner decision is required by this bounded review. Reconcile completed role outputs only after preserving them. Before whole-issue closure, verify actual first/correction launch receipts, context/memory controls, complete independent results, exact-source native checks and applicable delivery decisions. Those observations were outside this packet; they remain unverified here and must not be represented as passed by this verdict.

# Issue #198 — Independent code correction review

Verdict **changes required** for candidate `34f0e39f2fe6282f172c1c885a80b6ea559c77f6`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `90be8d69e18712242d18ac5c88c2a02c6edfb6d9`. Packet `b3d328b05bf2088d00aaa7a06eeec97d6e09d9c0dcfe944a5b6779b1234b89c9`.

| Finding | Disposition | Evidence and treatment |
| --- | --- | --- |
| C198-01 | Resolved for passing admission | `reviewer-admission.cjs:345–349,560–574` converts each sliced file to range-only grants. Every reported read must match a grant, and a pass must report every grant. The focused negative tests cover empty reads and whole mixed files. The documented contract permits a nonpassing result to report partial reads. |
| C198-02 | Resolved | `reviewer-admission.cjs:337–344,471,555,575–581` requires the prepared evidence-relative path, completion-bound SHA-256 and verified nonempty UTF-8 artifact bytes. The focused test rejects a differently named artifact with identical bytes. |
| C198-03 | Open, blocking, AC02/04/05/08 | `reviewer-admission.cjs:223–249,665–670,709–713`. A newer explicit occurrence correctly holds the older pass while supplied. The observation is lost if the parent observes it through `select` and then omits it from a later control before preparing an attempt. The successful probe prepared and passed occurrence 1, selected occurrence 2 at the same SHA, set `explicitRoles=[]` and `request=null`, then assessed occurrence 1. The API returned `accepted`. Latest occurrence state derives solely from prepared attempts, and assessment only enforces the occurrence for currently explicit roles. Persist observed occurrence, affected roles and ordering with the independently anchored checkpoint before accepting another assessment. Add an omission-after-observation refusal case. |
| C198-04 | Partially corrected, open, AC03/06 | `reviewer-admission.cjs:456–458,491–502,639–650`. The correction packet checks exact IDs and bounded neutral location, symptom and invariant for blocking findings. The history reducer drops every open nonblocking finding, allowing the correction to omit a known open ID. The API probe recorded open nonblocking N1 and prepared a correction with an empty corrections list. It succeeded and the launch message omitted N1. Carry all outstanding IDs into the correction packet. Track whether an ID blocks advancement independently of packet inclusion. |

Additional contract inconsistency, nonblocking (AC07/08). `CONTRIBUTING.md:77–79` still describes mandatory four independent roles while the canonical role section at lines 189–241 uses applicability and explicit owning gates. Update the earlier routing text so operators encounter a consistent rule.

## Inspected and checked

- Candidate `agents/reviewers/README.md` (`725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`), `agents/reviewers/code-review.md` (`26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`), `AGENTS.md`, `CONTRIBUTING.md` and `tools/orchestration/reviewer-admission.cjs`. Verified assigned SHA-256 for each.
- Evidence `intent-ac.txt`, `candidate-34f0e39f.diff` (`9366be6199832a49f9fe66fdb9969aa398e389674be6f9d904bfffaaf7a0aeed`) and `issue198_c_delta-intent.txt` bytes `[0,432)` only. Verified assigned full-file or slice identities. Inspected the admission, tests, CLI, launch-contract and review-policy changes in the approved diff.
- Focused `node --test tests/reviewer-admission.test.cjs` passed 14/14. Two targeted in-memory API scenarios reproduced the open findings. The first probe wrapper stopped before executing a scenario because its VM lacked Buffer. Both scenarios ran successfully in the corrected wrapper.
- No unexpected author, peer or memory exposure observed. This review used the provided candidate and evidence roots. Live provider isolation, CI/profile execution, protected delivery and independent Git identity verification were outside the assigned checks.

# Issue #198 · White-box QA correction

**Verdict: changes-required.** W198-01 and W198-02 resolved. W198-03 remains open because a fresh correction can omit known, unresolved nonblocking defects. This holds AC03 and AC06 for the correction workflow.

Candidate `34f0e39f2fe6282f172c1c885a80b6ea559c77f6`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `90be8d69e18712242d18ac5c88c2a02c6edfb6d9`. Packet `e3c3f2f08fe6cdbcbcc3475da3d26a5870387b4319eb18d975e9d97004243a8d`.

| Finding | Risk, oracle and check | Disposition |
| --- | --- | --- |
| W198-01 | `verifyResult`, lines 560–581. A pass must report all approved read grants, retain exact range boundaries and use the assigned result path. The focused suite rejects an empty read set, a whole-file claim for a mixed input, and a same-content artifact at another path. | Resolved. |
| W198-02 | `openFindings`, lines 639–650, and `verifyRole`, lines 658–674. A clean replacement can proceed even when an excluded artifact is unavailable. A previously observed blocker must still be carried forward. The focused suite overwrites the excluded artifact with mismatched bytes and tests both an old clean result and an old blocking result. The ledger does not reread older raw artifacts. | Resolved. |
| W198-03 | `prepare`, lines 456–458, and `openFindings`, lines 639–648. Known unresolved defect facts belong in the actual correction message, regardless of whether they hold advancement. The guide requires each outstanding ID. The focused suite exercises blocking IDs and validates the actual emitted message for a blocking correction. An in-memory component probe instead records an initial pass with open nonblocking finding `NB1`, prepares the correction with an empty corrections list, launches and records a fixture pass, then assesses it. Observed `{"mentionsPriorFinding":false,"disposition":"accepted"}`. The unconditional impact filter removes `NB1` before correction facts are checked. | Open. Use separate selection for outstanding correction facts and advancement blockers. Cover a correction carrying an unresolved nonblocking ID through actual emitted args, with a negative omission case. Route through the permanent `tests/reviewer-admission.test.cjs` profile entry. |

Executed `node --test tests/reviewer-admission.test.cjs` in the candidate root. Exit 0, 14 pass, 0 fail/cancelled/skipped/todo. An initial stdin probe exited 1 before loading the candidate because a fixed diff line range truncated the fixture. The diagnostic re-extraction selected the fixture up to the first test declaration and the probe exited 0 with the output above. Native platform launch/result observation and measured coverage are outside these checks. The fixture launch/response and completion observations are synthetic. No prior reviewer verdict or check outcome was reused.

Inspected approved inputs, with hashes matching the assignment:

- Candidate `agents/reviewers/README.md` · `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`
- Candidate `agents/reviewers/white-box-qa.md` · `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`
- Candidate `AGENTS.md` · `120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3`
- Candidate `CONTRIBUTING.md` · `c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357`
- Candidate `tools/orchestration/reviewer-admission.cjs` · `5b5f9763a4d631614b0b20b3158c3c0b72bfbb0026e509828df60cb8512f9e4b`
- Evidence `intent-ac.txt` · `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199`
- Evidence `candidate-34f0e39f.diff`, inventory and substantive admission, tests, contract, guide and policy hunks · `9366be6199832a49f9fe66fdb9969aa398e389674be6f9d904bfffaaf7a0aeed`
- Evidence `issue198_w_delta-intent.txt`, approved bytes [0, 432) · `34a083abe774dbfb6d8b74026e3ac732559136fd408181a44682babc2c4bb720`

No unexpected exposure observed. Hidden provider context and memory behavior remain unobserved.

# Issue #198 exploratory interaction QA correction review

**Verdict: pass for the two assigned corrections.** E198-01 and E198-02 are resolved on candidate `34f0e39f2fe6282f172c1c885a80b6ea559c77f6`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `90be8d69e18712242d18ac5c88c2a02c6edfb6d9`, as identified by the assignment. No new blocking finding in the exercised scope.

Role/execution: exploratory-interaction-qa, `/root/issue198_e_delta`, correction. Assigned packet `c9e58527e1749735a20f63433948c983526733f556d55ab6163929336534e348`. I received the role-specific assignment and neutral correction facts. Native invocation and acceptance receipts are parent observations. No unexpected exposure observed during this review. No peer results, parent scratch notes, unrelated memory or author deliberations inspected.

## Charter and observations

Bounded to two operator journeys on the admission adapter: replace an excluded completed review after its artifact becomes stale and admit a completed review against the read grants and output assigned at preparation. Executed the candidate's focused suite once under Node v24.22.1 and an additional in-memory probe using the candidate functions with a small contract stub. Reviewed the operator handoff in the supplied orchestration diff.

| Finding | Expected and observed | Disposition and affected criteria |
| --- | --- | --- |
| E198-01 | A stale excluded artifact must allow a fresh replacement while preserving prior open blockers. The suite accepted a clean replacement after overwriting the old artifact. With an open blocker it held preparation at `CORRECTION_SCOPE` when the finding was missing, then admitted a fresh explicit resolution. My probe observed that an excluded resolution could not erase the blocker and a fresh passing resolution could. `openFindings` uses checkpointed metadata and requires `passing(entry)` to clear an ID. | Resolved. AC04, AC05 and AC06. |
| E198-02 | A passing result must record each exact read grant and bind the assigned result artifact. The suite and probe rejected omitted reads (`READ_EVIDENCE`), a whole-file read in place of a granted slice (`EXPOSURE`), and a different output path with matching artifact bytes (`EVIDENCE`). Both accepted the exact grant and assigned path. `verifyResult` binds the completion to the launch handle, packet digest, artifact hash, verdict and findings. Nonpassing records can retain partial in-scope read evidence and hold acceptance. | Resolved. AC03, AC04, AC05 and AC06. |

Focused command `node --test tests/reviewer-admission.test.cjs` returned 14 pass, zero fail or skipped. The focused suite owns the existing regression cases under the issue's test-selection route. The extra probe covered the excluded-resolution variant as a manual check. The operator walkthrough found distinct preparation, observation import, exclusion/replacement and assessment steps in the supplied guide diff. No provider-internal checks or independent native launch campaign executed for this review. Runtime receipts and hidden context remain outside these observations.

## Inspected inputs

Verified the SHA-256 of each approved item against the assignment. Inspected both reviewer prompts, repository routing, applicable independent-review passages, issue intent and ACs, full adapter source, and the diff sections for the operator guide, CLI/contract, and targeted tests and adapter changes. The focused test ran through the expressly permitted entry point.

| Approved input | SHA-256 |
| --- | --- |
| candidate:agents/reviewers/README.md | 725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8 |
| candidate:agents/reviewers/exploratory-interaction-qa.md | 280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a |
| candidate:AGENTS.md | 120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3 |
| candidate:CONTRIBUTING.md | c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357 |
| candidate:tools/orchestration/reviewer-admission.cjs | 5b5f9763a4d631614b0b20b3158c3c0b72bfbb0026e509828df60cb8512f9e4b |
| evidence:intent-ac.txt | 626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199 |
| evidence:candidate-34f0e39f.diff | 9366be6199832a49f9fe66fdb9969aa398e389674be6f9d904bfffaaf7a0aeed |
| evidence:issue198_e_delta-intent.txt bytes [0,432) | 34a083abe774dbfb6d8b74026e3ac732559136fd408181a44682babc2c4bb720 |


## Result destination correction

The independent Requirements, Code and White-box reviews below examined GitHub head `42f28682` and tree `4c9c57ed`. Code and White-box independently demonstrated two ways to assign an unsafe result destination. Requirements preflight for the correction ran with `fork_turns=none` as `/root/issue198_output_requirements` against the same exact candidate. It mapped the fix to AC03/04/06 and the maintained-entry-point check to AC05.

The correction rejects overlap with assigned evidence reads and previous output reservations before dispatch. The journal binds one evidence root. The CLI checks for an absent destination and a real parent. Tests cover blocking refusal before preparation, earlier pending, completed and excluded paths, original bytes, and a fresh replacement. The parent-mediated filesystem check and serialized journal do not establish provider or OS isolation.


# Independent Requirements & Acceptance result — issue #198

Verdict: **pass for the bounded candidate requirements/acceptance-linkage review**. No blocking requirements defect found. This is not whole-issue acceptance, evidence of other completed roles, or permission to merge.

Reviewer: `/root/issue198_r_verified`; independent final source review. Candidate: `42f28682eefcf332e15b8337a02909ea29791a1d`; base: `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`; tree: `4c9c57ed43736f7cf2b8e218526c308d203b9f63`. Packet: `cfdbd9257389746b3b6bf2e0a240ce50c61768e774191b2595c34ee9c59f5aba`. Commit/tree identities are supplied identities; this execution independently verified assigned file hashes, not repository refs.

## Inspected inputs and boundary

Read all eight assigned inputs. SHA-256 matches the supplied manifest for each:

| Space/path | SHA-256 |
| --- | --- |
| candidate:agents/reviewers/README.md | 725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8 |
| candidate:agents/reviewers/requirements-acceptance.md | 010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6 |
| candidate:AGENTS.md | 120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3 |
| candidate:CONTRIBUTING.md | c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357 |
| candidate:tools/orchestration/reviewer-admission.cjs | 91ae53ff3cb7840a8ee11e8daa7b1b7300d8f5a13cd9f51cfc97021dcfe86204 |
| evidence:intent-ac.txt | 626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199 |
| evidence:candidate-42f28682.diff | 2d92d31d41242a59c61c70bb97a86854d2f99fae22f96eb77345a7d709b812b8 |
| evidence:issue198_r_verified-intent.txt, bytes [0,432) | 34a083abe774dbfb6d8b74026e3ac732559136fd408181a44682babc2c4bb720 |

The first combined read output was truncated; subsequent bounded reads recovered the omitted CONTRIBUTING text. The entire diff was read in successive line ranges, including changed guide, acceptance mapping, adapter contract/CLI and tests. No peer result, parent conversation, unrelated memory or nonmanifest source was inspected. No unexpected exposure observed. Automatic provider context internals and launch acceptance are not independently observable from this execution; the orchestrator must retain the actual launch receipt. Ambient platform/project instructions were present. The permitted focused test execution loads its normal dependencies; this is execution, not an expansion of the source-reading scope.

## Acceptance trace

| Requirement | Check / owner gate | Observed result and limit |
| --- | --- | --- |
| AC01 launch paths and shared ownership | Guide diff, common contract, API/CLI definitions | Guide distinguishes parent-mediated API and CLI, offline reducer, #198 component ownership, #167 pilot and historical #171 v1 receipts. Live owner state not supplied. |
| AC02 fresh identities and isolation | prepare, recordLaunch, verifyLaunch; focused cases | Explicit none-fork emitted; prior lineage, duplicate task names/handles and author handle refused. Corrections use a newly prepared spawn. Component cases pass; real launch receipts remain LIVE. |
| AC03 role-specific source packets | packet/readGrants, exact hashes, verifyResult; approved-slice and read/output tests | Common/role prompt and CONTRIBUTING required; pinned manifest/slices and actual assigned result path checked. Source contents and current oracle form reuse identity. All assigned reviewer inputs inspected here. |
| AC04 refusal, contamination and newer attempts | latest, outstanding, exclusion/checkpoint and request occurrence paths | Pending/adverse latest attempts hold; exclusion retained; stale blockers survive replacement; explicit repeated same-SHA occurrences persist. Focused positive/refusal cases pass. Native chronology remains parent-observed. |
| AC05 behavioral verification | Focused Node suite; COMPONENT and LIVE gates | 15/15 component tests pass, no skips or failures. Changed-source correction and negative cases are tested. Fixtures are not evidence of actual model execution; real first/correction evidence still required. |
| AC06 complete results and receipts | Common receipt contract, immutable transitions, verifyResult | Required completed result and approved read evidence are checked; current execution supplies this role only. Other roles and real requested/accepted receipts were intentionally not read. REVIEW/LIVE remain separate. |
| AC07 maintained contracts and delivery | Full supplied diff, acceptance/RI/profile additions | Routing and guide align with fresh correction policy; owning mapping names COMPONENT, LIVE, REVIEW and NATIVE without claiming deterministic checks establish those gates. RI checks, protected delivery and merge not observed here. |
| AC08 applicability and reuse | CONTRIBUTING matrix, surfaceRoles/select, scopeDigest and explicit occurrence tests | Visible interaction, factual memory/checkpoint, recovery/routing/oracle, unchanged receipt/metadata and unknown scope have explicit behavior. Existing owning gates union with scope; #167/#198 preserve all roles. Same-SHA requests supersede old approvals. |

Actual check: `node --test tests/reviewer-admission.test.cjs` in the candidate root; exit 0, 15 tests passed, 0 failed, 0 skipped, 570.249723 ms reported duration. Test implementation inspected through the approved full diff. This focused run establishes component behavior only.

## Findings and dispositions

No new defect findings. No inherited finding IDs or neutral correction facts were supplied, so none is represented as resolved. Prior reviewer coverage was not reused.

Examined risks: correction/session reuse; role merging; omission/default fork; source/oracle drift; mixed-history slice leakage; incomplete declared reads; wrong result destination; dropped explicit review requests; older approval bypass; unavailable excluded artifacts; preservation of unresolved blockers and nonblocking facts; inappropriate role exemptions; confusion between fixture success and actual independent execution.

The accepted scope has assessable ACs and separates deterministic source checks from actual execution and owner delivery gates. The trust boundary is explicit: the parent supplies accurate impact classification, observations, author identities and independently retained checkpoints. The adapter correlates those inputs; it cannot attest hidden provider state or discover an unreported out-of-band spawn.

Next gate: retain this bounded result and actual launch/read evidence, complete other applicable independent roles, reconcile findings after their completion, and verify exact-source COMPONENT/LIVE/NATIVE evidence before marking whole criteria complete. No new owner decision is inferred by this result; merge and delivery authority remain separate.


# Independent code review of #198

**Verdict: changes required.** Candidate `42f28682eefcf332e15b8337a02909ea29791a1d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `4c9c57ed43736f7cf2b8e218526c308d203b9f63`. Packet `4ad870b468e789430a3d8bd6005457d128684b92880591bda7c7d9e91021c297`.

| Finding | Disposition | Evidence |
| --- | --- | --- |
| C198-01 | Resolved | `packet` at lines 363–367 builds slice-only grants for sliced evidence paths. `verifyResult` at lines 578–592 rejects out-of-grant read claims and requires every grant for an admissible pass. Focused tests reject both an empty pass read list and a whole-file claim for mixed evidence. Nonpassing results retain partial in-scope reads without satisfying the gate. |
| C198-02 | Open, blocking | `verifyResult` at lines 593–599 now rejects a result reference at a different path and checks the bytes. `packet` at lines 355–367 still allows an approved evidence input to be assigned as the output. The in-memory API probe assigned the existing `oracle.txt` input as output and submitted its original bytes unchanged, relabeled as a result reference. The completion observation carried the matching digest, and `prepare`, `record-result`, and `assess` accepted it. An existing input thereby satisfies the completed independent output gate, and a real reviewer using this assignment could overwrite the read-only input. AC03, AC04 and AC06. Reject assignments that overlap evidence inputs or an earlier assignment and add a regression case for same-path input/result aliasing. |
| C198-03 | Resolved | `explicitOccurrence` at lines 234–257 rejects out-of-order and duplicate occurrence identities and requires a new occurrence to enter through `select`. `checkControl` at lines 216–230 and `verifyRole` at lines 682–694 bind assessment to the newest recorded role occurrence, including when the current impact record omits it. The same-SHA test exercises distinct completed executions and rejection of the older result. |
| C198-04 | Resolved | `prepare` at lines 474–476 and `correctionFacts` at lines 509–520 require one bounded fact with location, symptom and invariant for every outstanding ID. `packet` includes those facts in the launch message and digest. The stale-blocker replacement and open-nonblocking tests cover missing facts and correct handoff. |

Ran `node --test tests/reviewer-admission.test.cjs` from the supplied candidate root. All 15 tests passed. Ran the targeted in-memory probe above using the test fixture definitions from the approved diff. The probe reached an `accepted` assessment and made no workspace changes.

Inspected the approved candidate paths `agents/reviewers/README.md`, `agents/reviewers/code-review.md`, `AGENTS.md`, `CONTRIBUTING.md` and `tools/orchestration/reviewer-admission.cjs`. Inspected the approved evidence `intent-ac.txt`, the affected source/test/CLI and protocol changes in `candidate-42f28682.diff`, and only bytes [0, 432) of `issue198_c_verified-intent.txt`. All eight approved identities matched, including common prompt SHA-256 `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8` and role prompt SHA-256 `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`. No unexpected exposure observed. Review was bounded to the assigned correction scope. Provider internals, live delivery and independent source surfaces outside the supplied packet were unobserved.


# Issue #198 independent White-box QA correction review

**Verdict: changes-required.** W198-01, W198-02 and W198-03 are resolved. W198-04 remains open and blocks AC04/AC06.

- Execution handle `/root/issue198_w_verified`, independent correction verification. I received a role-specific assignment and neutral finding facts. Actual launch arguments and response are parent-owned observations. Provider-internal context, model and memory behavior were outside this review.
- Supplied candidate `42f28682eefcf332e15b8337a02909ea29791a1d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `4c9c57ed43736f7cf2b8e218526c308d203b9f63`.
- Packet `32b5169f97a28e3e918fcaa0d227799065c0a32b94fd309bd41bbb0c77d440c5`.
- Unexpected exposure: none observed. I used the supplied manifest, the supplied neutral facts, the exact authorized evidence slice and the permitted local component checks. Test and CLI changes were inspected through the approved diff. I did not inspect current peer output, parent scratch notes, unrelated memory or historical review files.

## Inspected inputs

| Space and path | SHA-256 |
| --- | --- |
| candidate `agents/reviewers/README.md` | `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8` |
| candidate `agents/reviewers/white-box-qa.md` | `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f` |
| candidate `AGENTS.md` | `120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3` |
| candidate `CONTRIBUTING.md` | `c3523000d1277d0dbd3159f25fe7dee9bd238e869cf6d26671025ca3c3c1e357` |
| candidate `tools/orchestration/reviewer-admission.cjs` | `91ae53ff3cb7840a8ee11e8daa7b1b7300d8f5a13cd9f51cfc97021dcfe86204` |
| evidence `intent-ac.txt` | `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199` |
| evidence `candidate-42f28682.diff` | `2d92d31d41242a59c61c70bb97a86854d2f99fae22f96eb77345a7d709b812b8` |
| evidence `issue198_w_verified-intent.txt` bytes [0,432) | `34a083abe774dbfb6d8b74026e3ac732559136fd408181a44682babc2c4bb720` |

## Findings and test allocation

| Finding | Risk, expected behavior and check | Disposition |
| --- | --- | --- |
| W198-01 | AC03/04/06. `verifyResult` at 578–599 accepts a pass only with every assigned read grant and the assigned evidence-relative result path. The suite rejects empty reads, full-file access to a sliced grant, and an unrelated artifact path, then admits the positive case. | Resolved |
| W198-02 | AC04/05/06. `openFindings` at 657–670 reads checkpointed findings. `verifyRole` at 682–697 verifies the selected current launch and result. The suite replaces a stale result with unavailable original bytes and also verifies that an old blocker survives until disposition by a passing replacement. | Resolved |
| W198-03 | AC03/05/06. `packet` at 368–391 puts neutral facts in the emitted message, and `prepare`/`correctionFacts` at 474–520 require matching outstanding IDs before returning the spawn arguments. The suite refuses omitted facts and asserts that the actual emitted message includes their contents, for both blocking and nonblocking cases. | Resolved |
| W198-04 | AC04/06. `packet` validates path syntax at 355–362, and `prepare` at 469–489 checks uniqueness of task names while leaving output paths unreserved. The second launch can instruct a fresh reviewer to overwrite the first artifact. `recordResult` at 631 rejects the duplicate only after the assigned write. The common contract requires first outputs to remain intact. | Open, blocking. Reject reuse of previous assigned paths during preparation, including earlier pending or excluded attempts. Add a regression to the maintained reviewer-admission suite that asserts preparation refuses the collision before the new attempt or launch is recorded. |

The permanent test selector is `tests/reviewer-admission.test.cjs` under the affected source test profiles. The candidate diff maps it to the source-check workflow via the maintained selector and leaves actual bridge execution to the LIVE gate.

## Execution evidence

- Ran `node --test tests/reviewer-admission.test.cjs` from the supplied candidate root. Exit 0. Tests 15, passes 15, failures 0, cancelled 0, skipped 0, todo 0. Node reported 586.667028 ms.
- Ran an inline `node -` probe using the approved diff's in-memory fixture and current adapter. The first attempt completed. A correction prepared with a distinct task name and the unchanged packet output produced `same assigned output: true review_0.md`. Import returned `EVIDENCE`. Exit 0.
- Ran a second bounded diagnostic using a different result body to distinguish path reuse from loss of evidence. The first artifact matched its checkpoint before the attempted correction write. The fixture's correction write replaced bytes at the same path, then the probe returned `first artifact still matches checkpoint: false` and `import: EVIDENCE`. Exit 0. This probe models the write in memory and did not touch a real first review artifact.

No structural coverage percentage was measured. Live invocation correlation, live chronology and cross-role reconciliation remain owner evidence. I make no reuse claim from earlier judgments.


## Evidence read isolation and journal continuity

The four roles below independently reviewed `b0df68bd` using the maintained prepare/invoke/import route, with explicit no-inheritance and distinct native handles. Code found that an already reserved output could become a subsequent evidence read. White-box and Exploratory found that a populated rootless journal could switch roots. The imported receipt IDs W-198-ROOT and E-198-ROOT identify W198-1 and EQ198-ROOT-01 respectively. The next candidate rejects both cases before launch and keeps rootless Draft journals as historical evidence.


# Requirements & Acceptance — correction review

Verdict: **pass for the assigned correction delta**. No blocking requirements or acceptance-linkage findings. This is not whole-issue acceptance or a substitute for the other required roles and real execution receipts.

Reviewer: `/root/issue198_fix_r`; independent nonauthor requirements role. Candidate `b0df68bd34c7b426e5818d70f23a76b43be7115d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `9b19ab10e797a86992555cbf76e387df9a476d09`. Packet `56ec6e139bdb5920c553da9aa1dd870f3d378695c78844de718e5a6eaf0ba69f`.

## Inputs actually inspected

All seven supplied manifest grants were read and their SHA-256 values matched the assignment: candidate `agents/reviewers/README.md`, `agents/reviewers/requirements-acceptance.md`, `CONTRIBUTING.md`, `tools/orchestration/reviewer-admission.cjs`; evidence `acceptance.txt`, `delta.diff`, and `intent.txt` bytes [0,511), which comprise the entire supplied intent file. The CLI, test and guide changes were inspected through the approved delta, not by opening additional source files. Initial combined output was truncated; subsequent bounded reads covered current source, changed CLI/tests/guide and removed diff lines.

No peer results, parent scratch notes, unrelated memory, or issue/PR verdict histories were inspected. No unexpected author/peer-history exposure was observed. Platform/project instructions were present; hidden provider context and launch internals are not independently observable here.

## Acceptance trace

| Intent / AC | Independent oracle and check | Observed result |
| --- | --- | --- |
| AC03: separate source-bound inputs | Assigned output must not overlap an evidence input, including sliced intent; inspect `checkOutputInputs`, packet grants and focused refusal cases | Packet rejects overlapping input/output paths before preparing dispatch. Slices retain their explicit read boundary. Source and prompt identities remain packet-bound. |
| AC04: refuse unsafe admission | Prior pending, completed and excluded output reservations must remain unavailable; fresh replacement must succeed | `prepare` compares against every prior attempt, without filtering out excluded or pending attempts. Evidence root is pinned in the journal. Focused suite passed collision, root-change and fresh replacement cases. |
| AC05: meaningful behavioral checks | Exercise reducer and actual CLI filesystem checks, with refused collisions leaving original bytes intact | `node --test tests/reviewer-admission.test.cjs` exited 0: 16 tests passed, zero failed/skipped/cancelled. New cases cover input collisions, pending cross-role reuse, completed/excluded reuse, preserved original bytes, changed evidence root, existing CLI file, request file, dangling link, linked parent and fresh destination. Existing changed-candidate, contamination, stale source and latest-pending cases also passed. |
| AC06: preserve first independent outputs and complete fresh results | Reserve before dispatch, reject existing filesystem destination, preserve original result bytes, retain independent per-role completion requirements | Source and tests substantiate the correction's preservation behavior. CLI checks destination absence and real non-symlink parent before returning preparation. Direct parent filesystem precheck is explicitly required by the changed guide. Whole-issue four-role receipts remain an orchestrator gate beyond this individual report. |

## Findings and limits

No findings. Examined risks include output aliasing with an input, overwriting a first result after completion or exclusion, colliding with pending work in another role, switching evidence roots to evade reservations, CLI symlink/existing-file destinations, and losing stale-result or contamination refusal behavior.

The requirement is assessable: refuse before dispatch, keep original bytes, and admit a fresh path. The implementation and behavioral checks support these observables without claiming OS isolation. The pure API has no filesystem writer and relies on the documented direct-parent filesystem precheck; the CLI performs that check. Shared filesystem races, malicious external writes and hidden provider memory are not proved absent by these checks. The guide requires one journal per owner/scope and separate roots for concurrent scopes; that operational assumption is material.

No prior judgment or test outcome was reused. Affected source, delta and focused suite were inspected/executed afresh. No new owner decision is needed for this bounded correction. Next gate: complete and reconcile the other required fresh role results, correlate requested/accepted/observed launch evidence, and retain the applicable exact-source delivery gates before claiming whole-issue acceptance.


# Issue #198 code review

**Verdict: changes required.** The correction protects output destinations in the tested forward cases, but a subsequent packet can still turn a known earlier output into an approved read input and forward its contents before dispatch.

Candidate `b0df68bd34c7b426e5818d70f23a76b43be7115d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `9b19ab10e797a86992555cbf76e387df9a476d09`, as identified in the assignment. Packet `16098c6287526d4c71e9450e97daa2c0ec9457678c78c2c7dd0d5c0ed232548f`.

## Blocking finding

**C-198-OUTPUT-READ, high.** In `tools/orchestration/reviewer-admission.cjs:403–445, 578–584`, packet admission prohibits references labeled `result` and compares the new output against its own evidence inputs. Journal admission compares the new output against earlier outputs. Neither compares the **new read grants against earlier output reservations**. A prior output at an otherwise allowed path can be listed as `fact` and sliced into the new execution's message. The CLI check shown in the delta verifies the new destination and does not inspect this overlap.

I prepared a synthetic code review with output `code.md`, then supplied a buffer for that same path while the attempt remained pending in the journal. I submitted a first white-box packet with a fresh destination and the earlier path declared as a sliced `fact`. `execute("prepare", …)` emitted the white-box spawn arguments containing the synthetic result marker. This models a result written before its parent imports completion. The missing comparison is independent of the attempt's result or exclusion state. The result verifier treats a read matching the prepared grant as in scope, so read accounting would not catch this admission error.

Reject evidence grants overlapping a known journal output, regardless of reference kind, slice, role, stage, or attempt state. Do the comparison before reading or embedding those bytes, and exercise pending, completed, and excluded reservations with a fresh new output. This affects AC03 and AC04 directly, leaves a regression case untested for AC05, and means AC06 cannot rely on the current read receipt to establish independence for this case.

## Checks and limits

- Ran `node --test tests/reviewer-admission.test.cjs` on Node v24.22.1. All 16 tests passed. The new adapter test covers same-packet input collisions, reuse of prior pending/completed/excluded output paths, pinned root rejection, and a fresh replacement. The CLI fixture covers an existing file, the request path, dangling symlink, symlinked parent, and fresh destination. The independent in-memory probe above reproduced the converse collision without a provider call or scratch write.
- The candidate comparison of each prepared root with the journal's established root, the CLI's comparison of the journal root and CLI root, and the CLI destination checks were inspected through the assigned source and delta. Real provider dispatch, operator race behavior, and the other roles' live completion receipts were outside this review.

## Inputs and exposure

Inspected the approved `agents/reviewers/README.md` common contract (`725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`), `agents/reviewers/code-review.md` (`26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`), `CONTRIBUTING.md`, and `tools/orchestration/reviewer-admission.cjs`; the evidence `acceptance.txt`, `delta.diff`, and `intent.txt` bytes [0, 511). CLI, guide, and test changes were examined through the approved delta, with the focused suite executed as authorized. No unexpected exposure observed. The probe used a fabricated marker, with no real peer result, parent history, or unrelated memory read.


# Issue #198 correction · White-box QA

**Verdict — changes required.** Blocking finding W198-1 affects AC04, AC05 and AC06. The selected packet input collision checks satisfy the bounded AC03 scenarios examined.

Candidate `b0df68bd34c7b426e5818d70f23a76b43be7115d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `9b19ab10e797a86992555cbf76e387df9a476d09`. These are the supplied target identities. Packet `5341c87aa443ccba057ce19da0bc4c80c2f65e622e067db086515d2a1f39513f`. Reviewer `/root/issue198_fix_w`. Source verification was by approved-byte SHA-256; the CLI suite used its own actual Git fixture. Provider context internals and the parent invocation receipt were outside the observed scope.

## W198-1 · An existing v2 journal can reserve the same pending output twice

The pre-change journal schema in the assigned delta has no `evidenceRoot`. The corrected adapter permits its omission for populated journals (`tools/orchestration/reviewer-admission.cjs:305–329`), compares relative output reservations across attempts, and enforces a root match only when the field is present (lines 578–584). It pins the new root after preparing the additional attempt (line 609).

A pending attempt prepared under `/fixture/evidence` reserves `nested/review.md`. Reopen the same legacy-shaped journal under `/fixture/evidence/nested` and prepare a second required role with `review.md`. Both emitted spawn messages identify `/fixture/evidence/nested/review.md` as the output. The earlier attempt can still be pending, so no result file need exist. The CLI skips its journal-root comparison for the missing field (assigned delta around line 1192). Its destination check then sees a real parent and an absent destination (delta around lines 1241–1252). The duplicate reservation was reproduced in the actual adapter in memory. CLI reachability was traced from the assigned delta.

Treat a populated unpinned journal as held until the original root has been recovered from trusted historical launch/checkpoint evidence and every existing reservation has been checked against it. Keep that root bound when accepting a fresh path. Add a legacy pending-journal regression to the focused Node suite, including the CLI when the destination is still absent. The expected oracle is that the second prepare emits no dispatch for the identical absolute output and that the same anchored root can prepare a genuinely fresh output. Two independent receipts need distinct destinations before either reviewer writes.

## Risk and verification

| AC | Structural risk and scenario | Independent oracle | Check and result |
|---|---|---|---|
| AC03 | Output equals a full evidence input or the backing file of an approved slice | Refuse before creating a prepared attempt | Focused suite exercised oracle and mixed-input collisions. Pass |
| AC04, AC06 | Output is reserved by another pending role, a completed role or an excluded attempt | Refuse each collision, preserve prior output and allow a fresh path | Focused suite exercised all three with a pinned journal, plus accepted a replacement at a fresh path with first bytes unchanged. Pass |
| AC04, AC05, AC06 | Root changes between preparations and alters the meaning of an existing relative output path | A changed root cannot produce another launch to an already reserved absolute path | Focused suite exercised an already pinned journal. Independent adapter probe reproduced W198-1 for an existing unpinned journal |
| AC05 | Existing file, request file, dangling symlink or symlinked parent in CLI | Existing evidence stays intact and only a fresh path under a real parent prepares | CLI fixture exercised all listed negatives and a fresh nested path. Pass |
| AC03, AC06 | Completion attests unrelated reads, omits a granted read, or substitutes a different result path | Completion binds observed reads and exact result path to the prepared entry | Focused suite exercised these checks. Pass |

Actual focused command from the supplied candidate root was `node --test tests/reviewer-admission.test.cjs`. Exit 0, no signal. TAP reporter totals were 16 tests, 16 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, 583.543088 ms. The suite indirectly loaded its normal test and adapter dependencies.

The targeted `node` stdin probe called the exported `execute('prepare', …)` with in-memory, synthetic packets, independently computed checkpoint digests and no filesystem writes. The initial probe stopped in fixture setup with `SCHEMA` from `select` because the toy impact included the wrong field. The next probe used the documented impact schema and a generic fixture owner to avoid an unrelated preflight dependency. It exited 0 and reported the observations below.

```text
Pinned journal: OUTPUT
nested/review.md Output: /fixture/evidence/nested/review.md
review.md Output: /fixture/evidence/nested/review.md
Legacy-shaped journal returned a second launch for the same destination: 2
```

Path ancestry rejection was checked in source. No branch coverage was measured. The CLI's legacy-root case, actual parent dispatch and concurrent filesystem behavior remain outside executed coverage. No earlier role verdict or check result was reused.

## Inputs inspected

SHA-256 matched all supplied grants. I inspected the common and role prompts, applicable CONTRIBUTING rules, adapter implementation, owning intent and ACs, the permitted intent slice, and relevant guide, adapter, CLI and test sections of the assigned delta. I did not open candidate files omitted from the manifest for separate reading.

| Grant | Verified SHA-256 |
|---|---|
| candidate:agents/reviewers/README.md | `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8` |
| candidate:agents/reviewers/white-box-qa.md | `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f` |
| candidate:CONTRIBUTING.md | `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f` |
| candidate:tools/orchestration/reviewer-admission.cjs | `d7da2c65f80d463fbe2831406221b2a6ebea132b2fe3263919cb7d6917900f44` |
| evidence:acceptance.txt | `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199` |
| evidence:delta.diff | `d4e91f55094cfe2688530f15123980967ad51333974b1c3f9cd803902c38f5e9` |
| evidence:intent.txt, bytes [0, 511) | `3241fb906038795d6670363f26e9b5c818f60f800e4137dcda44075104b943b6` |

No unexpected author-history, peer-review or unrelated-memory exposure observed.


# Issue #198 correction — Exploratory / Interaction QA

**Verdict: changes-required.** One blocking finding in the evidence-root continuity journey. The normal newly pinned journal and CLI destination journeys passed the focused suite.

- Execution: `/root/issue198_fix_e`, Exploratory / Interaction QA, correction pass.
- Candidate: `b0df68bd34c7b426e5818d70f23a76b43be7115d`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `9b19ab10e797a86992555cbf76e387df9a476d09`. These are the packet's identities. The granted source bytes were checked by SHA-256.
- Packet: `6def17e89036f8fa52f1521e8bf47c0ed1017f9add37cb3d02e10b574bd4d6e3`.
- Charter: one bounded Node suite and one in-memory direct API comparison. Follow the operator from failed destination selection through a fresh destination, and check continuity when an existing journal resumes. Node ran on the workspace Linux filesystem. Native provider launch internals and live CLI/operator concurrency were outside this run.

## Read grants actually inspected

| Space and path | SHA-256 and scope |
| --- | --- |
| candidate `agents/reviewers/README.md` | `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8` |
| candidate `agents/reviewers/exploratory-interaction-qa.md` | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| candidate `CONTRIBUTING.md` | `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f` |
| candidate `tools/orchestration/reviewer-admission.cjs` | `d7da2c65f80d463fbe2831406221b2a6ebea132b2fe3263919cb7d6917900f44` |
| evidence `acceptance.txt` | `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199` |
| evidence `delta.diff` | `d4e91f55094cfe2688530f15123980967ad51333974b1c3f9cd803902c38f5e9`. Inspected behavior-bearing test, guide, CLI and adapter hunks. |
| evidence `intent.txt` | `3241fb906038795d6670363f26e9b5c818f60f800e4137dcda44075104b943b6`, bytes [0,511) only |

The authorized suite loaded its own test fixtures and local runtime dependencies. CLI and test source were inspected through the assigned diff. Unexpected exposure: none observed. Provider-side model and injection details were unobserved. No earlier review conclusions or test results were reused.

## Executed journeys

| Expected result | Observation |
| --- | --- |
| Assigned oracle or sliced intent cannot become output. Pending, completed and excluded prior reservations survive a repeat path. Refusal leaves the journal and first result intact, and a fresh path lets a replacement complete. | Pass. `node --test tests/reviewer-admission.test.cjs` reported 16 tests, 16 passed, 0 failed, 0 skipped. The new reservation case checks these dispositions and byte preservation. |
| Existing file, request path, dangling symlink and symlinked ancestor are refused by CLI. A fresh destination in a real subdirectory succeeds. | Pass in the same suite, using a temporary real Git repository and filesystem. Existing bytes survived and successful prepare returned the expected pinned root. |
| A journal that already reserved a result under one evidence root rejects preparation at a different root, including when the input journal has the pre-correction v2 shape. | New shape passed. A direct `execute("prepare", …)` probe with a pending first attempt under `/fixture/one` returned `OUTPUT` on a fresh role targeting `/fixture/two`. With only the journal-level root field absent and the checkpoint digest recalculated over that v2 shape, the same second prepare succeeded. The returned journal pinned `/fixture/two` with two attempts while the first prepared message still named `/fixture/one`. This was a synthetic migration-state fixture using the actual adapter. |

## Findings

**EQ198-ROOT-01 — Blocking, AC04/AC05/AC06.** A nonempty journal with the prior v2 shape can acquire a different evidence root at the next prepare. The updated guide requires one root for the journal. `reviewer-admission.cjs:305–329` permits omission with any attempt count, `:578–584` compares only when the field is present, and `:609` pins the later root. The CLI check shown in the delta also compares only when the journal field is present. A valid digest over a pre-field journal establishes byte identity while leaving the first attempt's root in its existing launch message. Later readback uses root-relative references and can look in the new directory for the first attempt's evidence. The probe demonstrates a mixed-root journal and did not modify first-result bytes or exercise a live reviewer. Hold nonempty rootless journals explicitly, or add a verified migration that pins the prior root and rejects mixed-root history. Preserve the original journal and result bytes in either case.

Regression allocation: extend the existing reviewer-admission Node suite with nonempty prior-schema state and two evidence roots. The oracle is refusal or verified migration to the original root, intact first evidence and successful new-path preparation at that root. The direct negative probe ran, and the analogous CLI migration case is proposed. The packet did not grant the profile/workflow mapping owner, so its hosted job allocation remains unverified.


## Direct runner path validation

Four fresh correction executions used distinct native handles and the maintained prepare/invoke/import route on `142d2151`. Requirements and White-box passed. Code reproduced root overlap in the direct API. Exploratory reproduced the mismatch between a normalized relative output and the raw direct assignment. The CLI already rejects noncanonical output spelling. This correction gives the direct API the same lexical boundary and states the direct parent's filesystem responsibilities.


# Requirements & Acceptance — correction verification

Verdict: **pass for the assigned correction delta**. No blocking or nonblocking requirement defects found. This is not whole-issue acceptance, merge authorization, or provider-isolation attestation.

Candidate: `142d21517e6a2aa3baebb6a17a7a8ec734d7b2f3`; base: `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`; supplied tree: `35fba26993706ad9c323336f47523e2e96024a48`. Packet: `6d99a1bcfdeb7c0517930e7e5a195fcc2d1dafe0bc73e33251c5dd3a9a90d6fd`. Source identities are those supplied by the packet, with all seven permitted input SHA-256 values verified locally against the manifest. Git provenance was not independently queried because the read boundary permits only the manifest sources.

## Inputs actually inspected

- Candidate `agents/reviewers/README.md`: full common contract.
- Candidate `agents/reviewers/requirements-acceptance.md`: full role prompt.
- Candidate `CONTRIBUTING.md`: full maintained requirements and quality gates.
- Candidate `tools/orchestration/reviewer-admission.cjs`: full source.
- Evidence `acceptance.txt`: full original intent and AC01–AC08.
- Evidence `delta-peer.diff`: full assigned delta, including guide, CLI and focused-test changes.
- Evidence `intent.txt`: only bytes `[0,511)`, as granted.

An initially overlarge tool response was truncated; relevant source and requirements were reread in bounded chunks. No peer review, unrelated memory, author conversation or unapproved file text was inspected. No unexpected exposure observed. Shared project/platform instructions were present; hidden provider context and the parent's actual launch receipt remain outside this execution's observation. The explicitly authorized focused suite executes its normal dependencies; those dependency files were not separately opened as review inputs.

## Acceptance linkage

| Requirement | Independent oracle/check | Observed delta result |
| --- | --- | --- |
| AC03: source-bound packets and read boundaries | No assigned output may overlap current or earlier evidence inputs; reserved results cannot become packet facts, including slices | `packet`, `checkOutputInputs` and `prepare` check path equality and ancestor overlap. Packet exposure rejection happens before evidence contents are read. Tests cover ordinary and sliced reserved-output grants. Pass for affected boundary. |
| AC04: contamination/refusal and fresh replacement | Pending, completed and excluded outputs remain reserved; rejection must not silently authorize another write; root changes must refuse | Journal-wide output checks include every attempt without status filtering. Root is pinned; nonempty rootless journals refuse. Tests demonstrate rejection and a fresh replacement path. Pass for affected admission behavior. |
| AC05: behavioral verification | Exercise refusals, first-output preservation and successful fresh destination through the actual adapter/CLI surface | Focused Node suite passed 18/18, including collision/reservation, rootless-journal, and CLI existing/dangling/symlink destination checks. These are local adapter/CLI observations, not hidden-provider assurance. |
| AC06: preserve first independent results and correction evidence | First bytes survive rejected reuse and successful replacement; completed results remain bound to assigned path and read grants | The new preservation assertions compare original bytes after rejected reuse and after successful fresh-path completion. `verifyResult` adds input/output nonoverlap defense. Separate required role receipts and reconciliation remain parent-owned gates. Pass for this correction only. |

## Checks and risk assessment

Executed `node --test tests/reviewer-admission.test.cjs` from the candidate root: exit 0; 18 passed, 0 failed, 0 skipped, 0 cancelled. Inspected changed test assertions in the supplied diff rather than treating test names alone as evidence. Existing fresh-identity, stale-source, explicit-request and latest-pending scenarios also passed in this run.

The correction makes the intended invariant assessable: reserve a fresh output within one pinned evidence root before dispatch, refuse all journal reservations and granted-input collisions, keep the original bytes, and permit a different output path. It preserves excluded attempts rather than treating exclusion as permission to overwrite history. The CLI delta adds a real-filesystem absence check and validates the parent directory; direct invocation is explicitly assigned the same pre-dispatch filesystem responsibility by the guide delta. No new requirement weakens the owning role gates; the CONTRIBUTING wording aligns with the existing role-selection policy.

Limits: full native CLI and test files were not separately available in the read manifest; their changed hunks were inspected in the diff and the authorized suite was executed. Filesystem race prevention against hostile concurrent writers is not promised: the guide calls for separate concurrent roots, and the component is a parent-mediated operational gate. No prior reviewer conclusions or unchanged acceptance evidence were reused. No external writes or implementation edits performed.

Next gate: collect all other required fresh role results and actual requested/accepted launch/read receipts, reconcile source-bound evidence, and retain broader issue delivery/owner gates. This independent requirements result supplies only the assigned correction review.


# Issue #198 code review

**Verdict: changes required.** The correction blocks prior outputs supplied as evidence grants, including slices. The public admission API still accepts the same path as a candidate grant, so the reservation invariant remains open.

Candidate `142d21517e6a2aa3baebb6a17a7a8ec734d7b2f3`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `35fba26993706ad9c323336f47523e2e96024a48`. Review execution `/root/issue198_verify_c`, correction phase. Packet `b486dce6451a7b4ff6614e878d5801a30f6cb75d79148aa6f1288ff8812d7d69`.

## Blocking finding

**C-198-OUTPUT-READ remains open.** In `tools/orchestration/reviewer-admission.cjs:300–330, 381–394, 504–511`, both collision directions filter on `ref.space === 'evidence'`. The direct API checks that each root is absolute, but it accepts the same root for candidate and evidence. Consequently, a candidate grant can point to a reserved output in the later packet, and a first output can point to a current candidate input. The prior-input check has the same namespace restriction. The guide's direct-parent check for an absent output cannot enforce separation from a pending output which has no file yet.

I ran an in-memory probe through the exported `execute('prepare', ...)` entry point using synthetic files and one shared absolute root. One preparation emitted an output `candidate.cjs` while granting `candidate:candidate.cjs`. A separate sequence reserved `peer.md` in the first preparation and accepted a second role's `candidate:peer.md` grant while the first attempt was still pending. Both produced spawn arguments. No real reviewer output was read or modified. This leaves the input isolation and pre-dispatch refusal requirements in AC03/04 unmet and leaves a missing regression and first-output preservation case for AC05/06.

Resolve both namespaces to a single canonical path identity before checking overlaps, or enforce disjoint canonical candidate and evidence roots on the direct route across all attempts and grants. Add a behavioral case where a prior pending result has no file and the next packet names its location through candidate space. Also assert that a current or prior candidate input cannot be chosen as the output.

## Verification and limits

- `node --test tests/reviewer-admission.test.cjs` completed with all 18 tests passing. The new cases exercise current evidence inputs, pending/completed/excluded reservations, sliced and unsliced evidence grants, evidence-root pinning and CLI destination validation. The in-memory probe establishes the separate direct-route gap. The supplied CLI diff shows the journal/CLI evidence-root comparison and the destination parent/existence check. I make no claim that the CLI admits the direct-route case.
- Read the seven assigned grants. SHA-256 values matched the manifest. Candidate grants were `agents/reviewers/README.md` (`725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`), `agents/reviewers/code-review.md` (`26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`), `CONTRIBUTING.md` and `tools/orchestration/reviewer-admission.cjs`. Evidence grants were `acceptance.txt`, `delta-peer.diff` (`095825162169214b442336c723ec7c3fe4ecb6c0c8a643895e534c33fbf99b32`) and bytes `[0, 511)` of `intent.txt`. The guide, CLI and tests were inspected through the approved delta. The authorized focused suite also loaded its runtime dependencies.
- No unexpected source exposure observed. Candidate identity is packet-supplied and checked through the granted byte manifest. Provider context and model internals, the parent's native dispatch receipt and other roles' results are outside this review.


# Issue #198 · White-box QA correction verification

**Verdict: pass for the assigned AC03/04/05/06 correction.** W-198-ROOT is resolved. No open findings in this pass. The populated rootless journal is held before a new dispatch can be prepared. The first successful prepare pins the evidence root. Later prepares must retain it and reserve an output that does not overlap an input or any existing reservation in the journal.

## Identity and inputs

- Execution `/root/issue198_verify_w`. Correction scope and source identity supplied by packet `146a6c6a838f095eec62b8a5ae5bd20b668baa24b0f60d412aa9ed295bcf340c`.
- Target `142d21517e6a2aa3baebb6a17a7a8ec734d7b2f3`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `35fba26993706ad9c323336f47523e2e96024a48` as assigned. All read-grant hashes matched the supplied manifest.
- Candidate reads: `agents/reviewers/README.md` `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`, `agents/reviewers/white-box-qa.md` `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`, `CONTRIBUTING.md` `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f`, `tools/orchestration/reviewer-admission.cjs` `5f5efc0d5f8677864a34533a0e9854a8e0abe547b09fbcea4bc58bdeb829c2ee`.
- Evidence reads: `acceptance.txt` `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199`, `delta-peer.diff` `095825162169214b442336c723ec7c3fe4ecb6c0c8a643895e534c33fbf99b32`, `intent.txt` bytes `[0,511)` `3241fb906038795d6670363f26e9b5c818f60f800e4137dcda44075104b943b6`. CLI and test changes inspected through the assigned diff. No peer output or unrelated history inspected. No unexpected exposure observed.

## Risk and check allocation

| AC | Structural fault and independent oracle | Check and result |
| --- | --- | --- |
| AC03/04 | A pending, completed or excluded result is imported as a full or sliced factual grant. Reject before reading the grant or preparing another execution. | Focused suite passed all three states. The `packet()` gate checks each referenced evidence path against all output reservations before calling `files()`. |
| AC04/06 | A new output overwrites a current or earlier assigned input or an earlier output. Reject before returning spawn arguments, leave journal and bytes intact, and permit a fresh path. | Focused suite passed current input, pending output, completed output and excluded output refusals, byte preservation and fresh replacement. In-memory probe passed exact, ancestor and descendant overlap against a prior-only input, ancestor/descendant overlap against a pending result, and fresh sibling allocation. |
| AC04/05 | A legacy populated journal first pins a different root, so its existing relative reservations refer to the wrong location. Reject the journal before control or packet preparation even with its own correct digest. | `checkJournal()` now rejects populated journals without an own `evidenceRoot` before `checkControl()`. The focused direct and CLI cases and the independent in-memory case all refused; first prepare pinned the root and the valid next prepare kept it. W-198-ROOT resolved. |
| AC04/05/06 | A CLI prepare returns launch data for an existing file, its request input, a dangling symlink or a path through a symlink. Reject and preserve existing bytes. A missing file with a real parent succeeds. | Focused CLI fixture passed those cases. Delta places the filesystem check before the CLI returns the prepared data. The accepted preparation left the destination absent. |
| AC05/06 | A correction admits the first execution's identity, stale result, unsafe fork or an earlier pass while a newer review is pending. | Existing focused tests passed changed-candidate, isolation, stale-scope, pending and receipt cases. These were executed on the assigned candidate. |

## Execution and limits

- Ran `node --test tests/reviewer-admission.test.cjs` in the candidate root. Exit 0, 18 tests passed, zero failures, skips or cancellations. Node reported 1011.794 ms. The command exercised the shipped focused admission suite and its actual CLI fixture.
- Ran a single inline `node` probe of the direct adapter using in-memory inputs. Exit 0. It reported `PASS: root pin, three prior-input overlap shapes, two pending-output overlap shapes, fresh sibling, populated rootless rejection`. These cases fit the existing focused suite; no new workflow or job proposed.
- No measured branch coverage, concurrent filesystem race testing, live launcher validation or provider-context attestation was performed in this role. The direct adapter relies on the caller for the filesystem destination check, and the CLI's pre-dispatch check observes a point in time. The verdict applies to the bounded correction, with live execution and other roles evidenced separately by the orchestrator.


# Exploratory / Interaction QA correction verification — issue #198

**Verdict:** changes required. E-198-ROOT is resolved in the tested legacy-journal journey. E-198-OUTPUT-ALIAS blocks AC04/05/06 and compromises the AC03 packet boundary where the emitted destination resolves to a prior input.

## Identity and charter

Role: Exploratory / Interaction QA, execution `/root/issue198_verify_e`. Candidate `142d21517e6a2aa3baebb6a17a7a8ec734d7b2f3`, base `f51d3f4f49b9fa456a8fa25fc419dc17dd2307aa`, tree `35fba26993706ad9c323336f47523e2e96024a48`. Packet `74ce52aa90efc172058abb9d9c77eaa38d0709648f327c3588aa0cdcc7b6511a`.

Bounded Linux/Node operator check: one focused suite, one small independent filesystem/API probe, and walkthrough of how CLI prepare presents the reserved output to the reviewer. Covered normal fresh paths, input and prior-output collisions, rootless continuation, and whether the path inspected for freshness is the same path delivered in the assignment.

## Inputs inspected

| Space and path | SHA-256 and read bounds |
| --- | --- |
| candidate `agents/reviewers/README.md` | `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`, whole |
| candidate `agents/reviewers/exploratory-interaction-qa.md` | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`, whole |
| candidate `CONTRIBUTING.md` | `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f`, whole |
| candidate `tools/orchestration/reviewer-admission.cjs` | `5f5efc0d5f8677864a34533a0e9854a8e0abe547b09fbcea4bc58bdeb829c2ee`, whole |
| evidence `acceptance.txt` | `626dfc8158704618af9cbba650aa94632388da9879ca2174e04b02722777f199`, whole |
| evidence `delta-peer.diff` | `095825162169214b442336c723ec7c3fe4ecb6c0c8a643895e534c33fbf99b32`, whole |
| evidence `intent.txt` | `3241fb906038795d6670363f26e9b5c818f60f800e4137dcda44075104b943b6`, bytes [0,511) |

Hashes matched. CLI and test changes were inspected through the granted diff. Test and dependency execution was within the authorized checks. No unexpected author history, reviewer outputs, or unrelated memory observed. No live provider or hidden context assurance was tested here.

## Executed observations

- `node --test issue198/tests/reviewer-admission.test.cjs` returned 18 pass, 0 fail. The focused cases refused current full/sliced input and pending/completed/excluded output reservations, protected previous result bytes, permitted a fresh replacement, refused a prior reserved output as a new full or sliced grant, and rejected a populated rootless journal. The CLI case refused an existing destination, the request file, dangling final symlink and a symlinked parent, and accepted a fresh destination under a real parent.
- E-198-ROOT: `checkJournal` rejects any populated journal missing `evidenceRoot` before control/admission. The API and CLI focused cases both exercised this rejection. Continued prepares with a pinned root also compare the canonical packet root against the journal root. No remaining failure in the assigned legacy-journal case.
- Independent probe on `execute('prepare', …)` expected a refusal when a raw path already resolved to a populated file. Under temporary evidence root, `linked` pointed to `actual/nested`, and `actual/old.md` contained the marker `preserve these bytes`. Admission prepared `outputPath = old.md` and emitted `Output: /tmp/review-root-probe-GZfiK5/linked/../old.md`. The same `lstat(path.join(root, prepared.outputPath))` used by CLI reported absent, while reading the emitted raw path returned `preserve these bytes`. The probe did not overwrite it. The CLI conclusion for this extra case follows from the assigned CLI diff and probe of its exact filesystem expression. The focused suite exercised the CLI with its existing cases.

## E-198-OUTPUT-ALIAS — blocking

In `packet` at `reviewer-admission.cjs:381` and its assignment at line 411, the relative path check collapses dot segments lexically but the reviewer is told to write the original absolute string. In the CLI prepare hunk, parent and existence checks use only the collapsed spelling. On a filesystem, a symlink before `..` is followed before resolving the parent. Thus the destination checked by CLI can be absent and safe while the assignment resolves to an existing first result or an input. The reviewer can overwrite that file before any result-import check detects the mismatch. This breaches AC04 admission, AC05 behavioral verification and AC06 first-output retention. It can also invalidate AC03 input byte identity.

Require canonical absolute paths in the packet, or emit exclusively the canonical output validated by CLI. Add an exact CLI regression in the existing reviewer-admission focused suite and its existing profile allocation for a symlink followed by `..`. Expect pre-dispatch refusal or an assignment whose destination equals the checked path, and preserve the original file bytes. The new CLI regression is proposed; the independent API and filesystem probe above was executed.
