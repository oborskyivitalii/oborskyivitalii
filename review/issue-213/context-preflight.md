# Issue213 retained-source context: independent requirements preflight

Reviewer: `/root/issue213_context_preflight`, distinct nonauthor Requirements & Acceptance role. Phase: pre-implementation, 2026-11-21. No peer conclusions read; no implementation, test changes, external writes or delegation performed. This is the first judgment for this assigned proposal.

## Verdict

**Proceed boundedly with the source-context adapter correction under issue213, subject to the guards below.** The proposed explicit source-root plumbing addresses an observable mismatch between an already explicit source-reconstruction input and the delivery adapters' ambient retention declaration. It does not need a new product destination, release route, retention exemption or owner. This is permission to implement this bounded correctness change within existing authorization, not acceptance of an unimplemented adapter or any release.

No substantive requirement ambiguity blocks this bounded implementation. Final acceptance remains held for actual implementation, negative/parity checks, test-impact allocation and independent completed-candidate reviews. All six whole original ACs remain open. The common launch contract also requires the orchestrator's explicit `fork_turns="none"` receipt; provider-internal context/model behavior is not independently observable here.

## Inspected identities and scope

Local HEAD: `e0658c100139b35151fc16542227b2ef558ec7ba`. This is a dirty prepared checkout, not clean-head acceptance. At first inspection dirty paths were the owning review, `tests/content.test.cjs`, `tests/fixtures/catalog.cjs`, and `tests/site-articles.test.cjs`. At final status `site/rights.json` also became dirty while this review ran. I did not inspect or accept that concurrent rights correction; it requires its own final exact-source review. The five packet source files stayed byte-identical through the final hash check.

Packet: `/tmp/issue213-review/retained-context-packet.json`, SHA256 `99efee34ccecb9e23188e56a41fd6e6a0b8fd5efa007481ff8294319cf992ff3`. All eight listed hashes matched at initial and final comparison: original request, issue, proposal, and the five assigned source owners. These identify the inspected proposal/source, not future implementation.

Read the root AGENTS, README, REPOSITORY-MAP, MEMORY as dated handoff, CONTRIBUTING independent-role/iteration/failure-diagnosis rules, common and Requirements reviewer contracts, CODE-STYLE, owning acceptance policy and relevant source/check contract sections. Repository inventory advertises only root AGENTS. Independently inspected the complete five assigned owners, their actual dirty fixture diff, affected existing retention and candidate/content reconstruction tests, and the issue213 acceptance selector. No current peer artifacts or private author notes were read. Live GitHub refs/checks/deployments were not independently retrieved in this narrowly assigned local review; the issue snapshot is explicitly dated input.

Additional dependency SHA256 identities:

- AGENTS.md: `120bba8320b0ed2c24fb6ce21cb317b9773490f5fafc19fc780f8b42781caba3`
- CONTRIBUTING.md: `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f`
- agents/reviewers/README.md: `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`
- agents/reviewers/requirements-acceptance.md: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`
- .github/acceptance/issue-213.json: `720e62d12031ddc3210b9a4cb8d34284a4115c9bf6e023225728fa0f7677f9e9`

## Independent observations

1. `tools/staging/color.cjs:99–102` reads its module checkout's `site/retained/manifest.json`, validates it, then captures the supplied public directory. `build:145–151` has no source-context input to carry forward. The artifact directory can therefore derive from one source while the retention requirements derive from another.
2. `tools/release/edition.cjs:87–108` has the same ambient declaration read at lines102–104. Existing production variant and candidate-preview refusals precede it and remain authoritative.
3. `tools/quality/candidate-source.cjs:48` already accepts explicit `repoRoot`. It uses that root for candidate selection, content composition and ordinary source generation (lines72,83,103), but calls `applyDeliveryLayers` at line122 without it. That function calls Color/production without source context at lines36,44. The coupling is independently visible in source, without accepting the proposal's reported failure counts as an oracle.
4. `tools/site/edition-retention.cjs` currently rejects missing/malformed declaration structures (10–17), excessive inventories, nonimmutable paths and wrong digests (19–33); computes immutable dependency closure and refuses absent dependencies (39–69); and refuses immutable overwrite collisions (74–84). Preserve these exact obligations. The declaration loader accepts a valid empty map, so merely retaining its schema validation would not prove that all required actual production resources remain present.
5. Independently compared the frozen `3877546d29a04f235f9ec0f3175f4e0d90bfd60d` declaration with current source: **63 original files;83 current files; all63 original digests still present and every corresponding source file matches its digest.** The20 additions are therefore additional retention, not replacements of the original seed. The proposed fixture copies the full63-file historical seed and keeps ordinary retain/closure behavior. Its same-real-root guard is present at `tests/fixtures/catalog.cjs:77–78`. This static comparison does not establish every original resource assertion passes in execution.
6. Current production preservation has an independent full-current-manifest oracle in `tests/edition-retention.test.cjs:13–59` and article delivery assertions. Those must continue using the actual source declaration. Synthetic fixture scope cannot replace their83-entry production requirement with the63-entry seed.
7. `tests/test_issue213_acceptance.py` currently selects executive/material/site-articles only. That issue-specific DISCOVERY check alone does not execute the adapter/candidate/content/rights suites affected by this new T1 correction. The existing source registry/profile and test-impact route must explicitly allocate those checks before advancement.

## Required guards and observable checks

| Guard / requirement | Independent oracle and required observation | Gate / AC impact |
| --- | --- | --- |
| Trusted context only | Default adapter calls retain module repository root. Only an explicit caller option supplies another root. Artifact JSON, embedded paths, environment variables or public files cannot select it. Invalid/missing explicit declarations fail; no catch-and-use-default or empty-map fallback. | AC04 technical integrity; Code/White-box review |
| Root propagation | Color.decoratePublic and Color.build use the same explicit retention source; production.build does likewise. Candidate reconstruction forwards its existing explicit repoRoot through all applicable delivery layers. | AC04/05; direct adapter and end-to-end candidate/content cases |
| Default parity | Equivalent independent copies of the same input, one using default and one explicit current root, yield identical public file inventories/digests and valid artifact manifests for Color and supported production variants. Same original refusals still hold. | AC04/05; exact-source checks |
| Distinct-source correctness | An isolated source whose declaration differs from ambient current source produces/reconstructs successfully only against its own expected bytes; wrong explicit source fails for the intended missing/digest reason. Test both direct adapters and composed candidate/content paths. | AC04; affected tests |
| Fail closed | Missing manifest, malformed schema/files, missing declared public file, digest tampering, missing transitive immutable dependency and immutable collision continue refusing; no output-size or1000-file cap changes. Preserve candidate-in-production and edition-already-applied refusals. | AC04/05; existing negative tests plus bounded adapter boundary probes |
| Original retention assertions | Run unchanged original resource/closure/recovery assertions against the complete frozen63-file seed and fixture successors. Separately assert actual current production preserves all83 entries and previous known-good closure, including real native article links. No blank retention reset. | AC03–05; site-articles, edition-retention, article-delivery and rights scopes |
| Rights inventory | Account for new current PDF/retained bytes using already applicable bases and exact hashes. Do not alter licensing, source authority, rights approvals or release decisions. | AC03/05; release-rights and independent rights/source review |
| Bounded API semantics | State that this optional sourceRoot selects the retention declaration only. Color effects, production origin/social policy and release trust remain owned by existing trusted modules; no claim of arbitrary full-tree producer portability. Do not expand CLI or host/controller options as a side effect. | AC04 scope clarity; Code review |
| Exact evidence and selection | Record additive T1 scope and CS01/02/04/05/08/09/10 mapping, allocate changed adapter/fixture and refusal cases through existing registry/profile route, preserve raw initial failures, then verify affected scope before required exact-current-source Basic/acceptance. New tests must have a real selection route. | AC04/05; test-impact review and final independent Requirements/Code/White-box gates |

## Findings and treatment

**RCTX-01 — Medium, acceptance coverage allocation required before advancement.** Current issue213 DISCOVERY selector omits adapter/candidate/content/rights suites while the proposal changes their source-context contract. A green DISCOVERY alone could therefore coexist with a broken root propagation/default/refusal contract. Treatment: supplement the existing owning test-impact/acceptance evidence with explicitly selected affected suites and new boundary probes; update maintained mapping if these become issue-owned acceptance checks. This is a recorded implementation/verification obligation, not a reason to create a new pipeline or alter existing budgets. No final gate is satisfied yet.

**RCTX-02 — Low, sourceRoot semantics must stay narrow and explicit.** The adapter's remaining effects/social/origin sources are ambient trusted-module inputs. Calling this full arbitrary-source reconstruction would overstate the proposed behavior. Treatment: document/test that only the retention declaration is selected by this new explicit input; keep broader producer portability out of this correction. No need to expand the API to satisfy that unrequested claim.

The raw failed campaign/probe artifacts were not supplied by immutable path in this packet. Their reported counts remain proposal assertions, not reviewer-observed execution. I neither reran an unchanged failed campaign nor inferred that the proposed correction resolves every reported failure. Before verification, retain raw logs and exact source/accounting in the owning review, distinguish this directly observed root-coupling explanation from the separate rights failure, and record bounded probe information gain/stopping conditions under CONTRIBUTING.

## Acceptance trace and next gate

| Original intent / AC | Proposed correction's limited contribution | Observed status |
| --- | --- | --- |
| AC01 search baseline | None; no ranking/demand inference from source tests | Open, unchanged |
| AC02 one existing destination | Does not change title/slug, canonicals or research owner | Open, unchanged |
| AC03 prose/provenance | Preserves old editions and enables correct source-scoped checks; rights inventory separately pending | Static original63-byte preservation verified; implementation/rights execution unaccepted |
| AC04 technical integrity/style | Explicit source context, unchanged strict retention refusal and test allocation | Preflight supports bounded implementation; no adapter implementation or execution pass claimed |
| AC05 delivery | Supports exact-source reconstruction through existing pipeline | No Ready, merge, stable staging, production or external publication authorization supplied |
| AC06 measurement | None | Open, unchanged |

Proceed with the bounded adapter and call-site change, retain existing retention validator behavior, and resolve RCTX-01/02 as implementation obligations. Then obtain fresh exact-candidate Requirements, Code and White-box reviews, together with any other roles selected by the full parent candidate. This report does not replace those reviews or the original hosted/mobile/no-JavaScript/editorial/release/measurement gates.
