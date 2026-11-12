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
