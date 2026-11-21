# Issue 213 — independent White-box QA correction review

Verdict: **PASS for the bounded source-context correction and WB213-01 symptom; no new candidate defect found in the inspected/executed scope.** This is not full issue acceptance, a successful complete integration campaign, browser acceptance or publication approval. AC03/04 source integrity has positive bounded evidence; AC05 and all external gates remain pending their own exact-source results.

## Identity and scope

Distinct nonauthor correction reviewer `/root/issue213_whitebox_correction`; no implementation, delegation or external writes. Did not read prior/current peer verdict artifacts or parent scratch conclusions. Candidate authored proposal/evidence was treated as review subject. Shared system/project instructions and filesystem are observable; provider-internal context/model isolation is unknown and the orchestrator must supply its actual launch receipt.

Repository `/workspace/scratch/3f2ba1da2ac8/author-site`; base `3877546d29a04f235f9ec0f3175f4e0d90bfd60d`; inspected and final HEAD `5057b02392e7d308b326ae3923345b2e983e41e7`, tree `368147ef6bcf1fafba82dd4f9039883670d1d3bf`; clean at first/final inspection. Live `git ls-remote origin refs/heads/main` returned the base. Packet `/tmp/issue213-review/correction-5057-packet.json` SHA256 `988a921abdcd90765057a29e950e8d450172a2e53da660c920b440cb9335e2c6`; diff SHA256 `c2470de066d9d687862fb9b7f7f4d367299bf3aa8cd03304994558ff90199e2b`.

Common prompt SHA256 `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`; role prompt `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. Read root AGENTS, README, map, MEMORY, applicable CONTRIBUTING independent-review/check rules, site source/retention contract, SITE-CHECK-PROFILES, issue/request, acceptance policy and actual changed owners/tests. Repository file inventory found only root AGENTS. No author conversation or peer outcome used as oracle.

Inspected correction owners: `tests/fixtures/catalog.cjs`, `tests/fixtures/delivery.cjs`, `tools/staging/color.cjs`, `tools/release/edition.cjs`, `tools/quality/candidate-source.cjs`, `tools/quality/color-motion-contract.cjs`, unchanged `tools/site/edition-retention.cjs`, relevant tests, retained declarations/public bytes, rights diff and registry. Reviewed base-to-candidate owner diffs directly. Runtime/effects, publishing implementation and retention validator have no base-to-head diff; rights additions are exactly R13 PDF plus 20 retained resources under existing bases. This does not independently approve editorial/rights judgment.

## Risk → structure → executed check

| Case / AC | Structural fault and independent oracle | Expected / observed |
| --- | --- | --- |
| WB-C01 / AC03–04 | Complete pre-native frozen seed versus actual Git base manifest; current source and prior public immutable hashes | Seed 63/63 preserved exactly; current declaration count 83; all 120 prior public immutable files byte-identical in candidate docs. PASS. |
| WB-C02 / AC03–04, WB213-01 | `isolateLegacyCatalog` removes only successor additions and restores complete historical declaration/bytes, rather than emptying/truncating retention | Called in a distinct temporary root; resulting declaration deep-equal to base 63-entry manifest and 63/63 bytes exact. PASS. |
| WB-C03 / AC04 | Reviewed Color family must bind exact identity, variant, edition and both canonical/immutable bytes; template fingerprint alone must not widen runtime admission | Actual plain Color admitted as `issue213-discovery-link-plain`; all three editions' five runtime hash maps deep-equal predecessor `issue183-long-article-*`; 5/5 injected wrong baseEngine, fingerprint, canonical space hash, immutable theme hash and production-on-plain edition refused. PASS. |
| WB-C04 / AC04 | Actual Color-to-staging composition must select the explicit successor | Actual staging composition admitted as `issue213-discovery-link-staging`. PASS. |
| WB-C05 / AC03–04, WB213-01 | Retained immutable documents still need native article aliases and local resource closure | 83/83 retained files hash-identical in both authored retained source and docs; 1004 local HTML/CSS/JS/PDF/image dependency references exist, including 10 native `articles/` alias references. PASS. This is existence/byte evidence, not browser behavior. |
| WB-T01 / AC03–04 | Explicit source defaults and missing/malformed/tampered declarations | Existing `explicit retention source preserves defaults and refuses missing or tampered declarations`: PASS, both Color and production, including Color→production parity. |
| WB-T02 / AC04 | Immutable collision/path escape | Existing `retention rejects altered immutable paths rather than replacing them`: PASS. |
| WB-T03 / AC04 | Transitive dependency closure missing script/document | Existing `retained documents keep transitive immutable dependencies while unrelated active files stay excluded`: PASS, missing runtime and snapshot negatives refuse. |
| WB-T04 / AC04 | Declaration absent/wrong schema/null/array | Existing `production retention declaration rejects a missing source map before capture`: PASS. |
| WB-T05 / AC04 | Explicit repoRoot propagation through cold candidate reconstruction and Color/staging | Existing `cold current source reproduces the composed Color and staging candidate exactly`: PASS; altered authored styles subsequently refuse. Its source fixture preserves actual synthetic successors. |
| WB-T06 / AC04 | Historical Home comparison must restore known generated media aliases while retaining semantic/geometry oracle | Existing `source migration preserves publication HTML and thematic geometry when shared vocabulary expands`: PASS. |
| WB-T07 / AC03–04 | Historical source bytes need their actual historical Git HEAD, with independently bound archived rights and substituted digest refusal | Existing `publication preserves an externally bound historical production license without applying today policy` in `tests/release-rights.test.cjs`: PASS, 1/1. Inspected fixture `releasedSourceRoot()` explicitly detaches HEAD to `b7b95a1cfb75a5dc9cd55ca85f3ea375ab2c500a` before extracting matching archived owners. |

## Executions and accounting

1. Command (repo cwd):

```sh
node --test --test-name-pattern='explicit retention source|retention rejects altered|retained documents keep|production retention declaration|cold current source reproduces the composed|source migration preserves publication' tests/edition-retention.test.cjs tests/article-candidate-source.test.cjs tests/site-engine.test.cjs
```

Exit 0. Raw summary: `tests 6; suites 0; pass 6; fail 0; cancelled 0; skipped 0; todo 0; duration_ms 5118.229598`. These are selected cases, not measured branch coverage.

2. Independent read-only temporary-root Node probes used `assert`, direct Git/base bytes, actual fixture/Color/staging producers and unchanged HTML parser. Terminal results:

```text
WB-C01 seed 63/63; current 83/83 declarations; old public immutable bytes 120/120 exact
WB-C02 isolated historical source 63/63 exact, no manifest truncation
WB-C03 plain actual Color admission; three editions x five exact prior-family runtime hashes; 5/5 tamper cases refused
WB-C04 actual staging Color successor admitted
WB-C05 83/83 retained bytes exact in source+public; 1004 local document dependencies exist, including 10 native alias references
```

C01/C02 were observed before the initial combined probe exited 1 due to a reviewer oracle spelling error: expected camelCase family object key `issue213DiscoveryLink-plain`, whereas public `reviewedRuntime` IDs explicitly use the declared hyphenated `id`. Read the declaration/expansion, corrected only the temporary probe expectation, and ran C03/C04 with `issue213-discovery-link-*`; exit 0. This was not a candidate failure. The initial failed assertion is retained in tool execution output and excluded from candidate defect counts.

3. Initially invoked the historical test name on `tests/content-release.test.cjs`, which contains no matching named case: Node reported its module wrapper as 1 passing file in 1454.910607ms. This is **not historical-case coverage** and is excluded. Located the actual declaration with `rg`, then executed:

```sh
node --test --test-name-pattern='^publication preserves an externally bound historical production license without applying today policy$' tests/release-rights.test.cjs
```

Exit 0. Raw actual named result: `publication preserves an externally bound historical production license without applying today policy (16893.94783ms)`; `tests 1; pass 1; fail 0; cancelled 0; skipped 0; todo 0; duration_ms 17020.475086`.

Total meaningful maintained named tests: **7 passed / 7 executed**, zero failures, cancelled, skipped or todo. Independent probes additionally verify inventories/closure and five guard mutations as listed; no blanket test/branch coverage claim. Temporary test sources removed; accepted repository source/tests unchanged.

## Existing evidence and limitations

Read raw archived evidence, not review verdicts: `review/issue-213/context-integration-evidence.tar.xz` contains the earlier **190 total / 180 pass / 10 fail** run and **4 total / 3 pass / 1 fail** delta probe; neither is a passing current full integration campaign. The latter historical license failure now has the independently executed T07 above. The supplied `/tmp/issue213-review/historical-root-probe.tap` also records that case 1/1, but my judgment uses my fresh named execution. Owning acceptance campaign was intentionally not duplicated or read for its verdict. Orchestrator must reconcile its final exact-5057 result with all prior failures before advancement.

Default paths continue to use the trusted module root. Explicit `sourceRoot` only selects the strict retained declaration; effects, origin, social and release policy remain module-owned. Caller-controlled selection is not artifact-controlled fallback. Cold reconstruction passes its already explicit repoRoot into both adapters. `capture` still validates immutable names, bounded inventory, digest equality and transitive closure; `restore` still rejects collisions. Negative and parity executions substantiate these inspected branches.

C03 full production successor admission was compared structurally via its exact five-hash/identity map, rather than building a real production package in this bounded probe. Historical production package behavior is exercised by T07; source-context production/default parity by T01. General performance, every producer/consumer permutation, malformed HTML edge cases, true race behavior, complete browser interactions and physical devices were not measured here. Actual hosted browser was unavailable until PR preparation and local Chromium was declared blocked; neither was retried or bypassed. Hosted/mobile/no-JS reader/PDF checks remain explicit external gates. No fixture, source pass or raw campaign proves release, indexability as observed by Google, demand, indexing, rank or AI/entity inclusion.

No new blocking finding in this bounded correction. WB213-01 is resolved for the inspected synthetic seed/successor and real old-public dependency paths; broader source acceptance remains conditional on the orchestrator's complete current-source campaign and other required reviewers/surfaces.
