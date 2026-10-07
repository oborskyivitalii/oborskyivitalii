# Site Repository Intelligence

## Upstream and adapted scope

This adapter follows Uncertainty Architecture's derived projection, source
identity, instruction scope, artifact roles and validation-route pattern. The
current UA source was compared on 2026-10-07 at
[`345c8f50745e5fde1303d0d7952634f7899220c9`](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/tree/345c8f50745e5fde1303d0d7952634f7899220c9):
producer v6 / schema v2,
[producer](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/.github/scripts/repository_intelligence.py),
[architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/.github/REPOSITORY-INTELLIGENCE.md)
and [contract](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/.github/policy/repository-intelligence-contract.json).
Exact upstream paths/blob identities are in
[the site config](repository-intelligence-config.json); license and modification
notices are in [RI-NOTICE](../tools/RI-NOTICE.md).

The existing #4 navigation subset was already pinned to that UA revision. #31
adapts the missing site navigation concerns; it does not pretend an upstream
version changed. Site schema v2 is a separate local contract, not UA schema parity.

| UA pattern | Site adaptation |
| --- | --- |
| One projection, consumer views | One source/catalog projection produces agent JSON and a readable repository map. |
| Concern-based owners and artifact roles | Explicit query aliases plus per-path purpose, role and editing owner; history/drafts/derived files remain distinguishable. |
| Instruction discovery | Root and directory-scoped AGENTS are routed for every file/directory. Archived AGENTS.before is evidence, not an instruction surface. |
| Validation companions | Explicit commands/workflows for RI, site source and release tooling; suggestions never claim execution. |
| Deterministic source identity | All source, code, asset and historical bytes are hashed; generated RI views are verified as outputs. Live PR/deployment state stays outside the projection. |
| Fail-visible fallback | Missing/stale/unknown paths, unsupported input and bounds fail; direct source reading remains available. |

UA's semantic graph, normative metadata/research-register policy, impact
traversal, trusted accepted/proposed Git comparison, checkpoint contracts and
benchmark machinery remain upstream. There is no remote index/cache, new runtime
dependency, measured productivity claim or replacement for #6's cross-repo harness.

## Layers, repository paths and CI companions

This is the architecture map for the local projection and its working protocol.
The checked [ri-ci-map.json](ri-ci-map.json) records concrete paths, test selectors
and exact workflow command arguments. The table explains their responsibility;
the JSON and [coupling validator](../tools/check_ri_ci.py) enforce the routes.

| Layer | Maintained paths and authority | CI companion and what it proves |
| --- | --- | --- |
| Authority and instructions | Root/scoped `AGENTS.md`; [CONTRIBUTING](../CONTRIBUTING.md); [project bootstrap](../PROJECT-BOOTSTRAP.md). Source owners supply meaning; archived guides supply history. | [navigation](workflows/navigation.yml): `NavigationSafetyTests` verifies scope, historical isolation and guide bounds. Issue acceptance tests exercise the documented task/review protocol. |
| Intent and acceptance | Live owning issue with stable AC IDs; [issue templates](ISSUE_TEMPLATE/work-item.md), [research intake](ISSUE_TEMPLATE/research-input.md), [PR template](pull_request_template.md), [acceptance protocol](ACCEPTANCE.md), `.github/acceptance/issue-N.json`; `review/issue-N/` files use [one review format](../review/REVIEW-TEMPLATE.md). | [issue-acceptance](workflows/issue-acceptance.yml): `tools/issue_acceptance.py` executes the selected owning issue policy's named assertions at an exact source, maps evidence back to AC IDs and leaves owner/manual/merge criteria pending. Green automated checks alone cannot close an issue. |
| Path catalog | [repository-paths.json](repository-paths.json): every file/directory's purpose, role and editing owner, including root files. | Navigation's `NavigationSafetyTests` checks unknown/missing paths, kinds, purposes and owners. RI `verify` compares the complete outputs against that catalog. |
| Entry, root and guides | [layout contract](repository-layout.json), [maintained guides](../guides/README.md), [archived originals](../review/root-history-20261007/README.md) and provenance manifest. README owns purpose; AGENTS owns rules; bootstrap only routes. | Navigation runs `RootLayoutTests` for bounded entry points, complete dispositions, exact archive identity, active links and current owners. Issue #33 alone selects its frozen public/history snapshot checks; later site work is not frozen to that base. The enduring-suite selector retains every permanent Python module while task modules stay with their owning policy; its regressions run unconditionally in navigation. |
| Producer and identity | [producer](../tools/repository_intelligence.py), [config](repository-intelligence-config.json), upstream pin and notices; source bytes are data, not automatically accepted meaning. | Navigation's RI regressions exercise byte mutation, bounds, exclusions, unsafe inputs and config/producer invalidation; RI `verify` establishes deterministic freshness. |
| Generated views | [REPOSITORY-MAP](../REPOSITORY-MAP.md) and [agent context](repository-intelligence/agent-context.json), generated from one source projection. | Navigation's `verify` regenerates both and compares them exactly; mutation/missing-output regressions fail. The workflow records checkout/blob/source identity. |
| Lookup and validation routes | Config owner aliases/routes, this architecture and the checked CI map; `query`, `context-for-task` and `inventory` remain navigation. | RI regressions check unresolved queries, aliases, authority boundaries and scoped owners. `check_ri_ci.py verify` resolves declared test selectors and verifies actual unconditional CI command invocation. `RICICouplingTests` checks broken routes, stale mapping and new controls. |
| Continuity | [MEMORY](../MEMORY.md) is a bounded dated snapshot; AGENTS/CONTRIBUTING and config own its maintenance/format contract. Detailed prior state remains in issues, PRs and dated review files. | Navigation checks required sections, size limits and RI freshness after memory edits. The acceptance policy checks the handoff protocol. No deterministic test turns dated facts into live observations. |
| GitHub live overlay and CI boundary | Current issues, refs, reviews, checks and deployment records remain outside RI; `.github/workflows/` defines recorded execution routes. Release/source profiles retain their existing owners. | The map watches every workflow definition and maps the acceptance and [site-basic](workflows/site-checks.yml) entrypoints. Exact-source acceptance reports and artifact checks bind local observations; agents must separately retrieve current GitHub/hosting state. |

Worked mappings include accepted [issue #31](acceptance/issue-31.json) and
[issue #33](acceptance/issue-33.json), with the latter’s
[layout analysis](../review/issue-33/2026-10-07-analysis.md).
The owning live issue selects the applicable policy; these examples do not
perpetually select an active task.
Each later task keeps its own issue/PR links and dated review artifact; do not
create competing task instructions in AGENTS, memory or a second handoff system.

## Reviewing RI changes with CI

Changes to RI interpretation, catalogs, the agent/acceptance protocol or workflow
routes require checking the dependent layer and CI selection in the same PR:

1. For producer/config/bounds changes, review source identity and unsafe-input
   behavior; update behavioral and negative fixtures and the upstream comparison
   when its interpretation changes. For catalog/scope/output changes, exercise
   missing/new paths, owner/instruction routing and output freshness.
2. For issue/review/continuity changes, keep AC IDs linked to the issue intent;
   update the relevant acceptance policy and protocol tests. Distinguish runnable
   assertions from human decisions, merge and release evidence. Review the CI
   workflow's exact source, failure propagation and test selection.
3. Update this table/config routes and `ri-ci-map.json` where dependencies changed.
   New workflows and catalog-owned RI/acceptance controls require explicit map
   entries. Review affected checks before running `check_ri_ci.py refresh`; its
   digest records exact maintained input bytes and map interpretation, rather
   than accepting a meaningless edit to the map file as evidence of review.
4. Run coupling regressions/verification, then rebuild and verify both RI views.
   Re-run the issue policy on the final committed source before deciding closure;
   put the AC/result/evidence mapping and remaining decisions in the issue/PR.

```sh
python3 tools/check_ri_ci.py refresh
python3 tools/check_ri_ci.py verify
python3 -m unittest discover -s tests -p 'test_ri_ci.py'
```

Coupling verification fails for stale source digests, unmapped control files,
missing test selectors or a declared command that is only mentioned, guarded,
optional or absent in the mapped workflow job. The deliberately narrow workflow
reader accepts this repository's explicit YAML job/step/run shape; unsupported
aliases, folded runs or filtered/matrix/dependent-job routes require a reviewed
adapter. Mapped PR triggers cannot filter paths/branches; explicit `types` must
include both `opened` and `synchronize` (the default PR types are admitted).
Mapped-job `needs` is rejected until dependency reachability is supported.
For a clean committed checkout, optional `--base-sha` and `--head-sha` accept only
full immutable commit IDs, require the exact head and report changed controls.
Ordinary verification is content-bound even without that Git comparison.

The coupling digest excludes generated RI views and its own digest field, so it
does not recurse. `MEMORY.md` content and dated review logs remain RI freshness
inputs; their format/protocol controls, rather than each checkpoint's contents,
are CI-coupling inputs. CI invocation/freshness evidence is separate from a live
successful GitHub run, independent review, semantic acceptance or publication.

## Complete path catalog and authority

[repository-paths.json](repository-paths.json) is the maintained description
catalog: every repository file and every ancestor directory, including root,
has a kind, purpose, role and editing owner. Root files have individual purposes;
no unknown-path fallback silently classifies new files. Add/remove entries with
path changes. Missing, stale, blank-purpose and dangling-owner entries fail.

The derived [REPOSITORY-MAP](../REPOSITORY-MAP.md) lists all of those entries.
[agent-context.json](repository-intelligence/agent-context.json) adds exact source
identity, discovered instructions, configured owner aliases and validation routes.
Both are generated from the same projection; do not edit either by hand.

Roles describe navigation: source/configuration, guide, validator/test/workflow,
generated rendition, history, draft, license and memory. The owning issue and
source remain authoritative; an index entry does not grant scientific, rights,
merge or deployment acceptance. This repository has no source/glossary registry
configured; it does not invent local copies of UA/Subprime research status.

## Agent route

Start with root/scoped AGENTS and an owning issue; read MEMORY as a dated hint
and revalidate live facts. Known exact owners can be read directly. With a local
runtime, verify before querying. Reuse that verified surface while source state
is unchanged; inspect the full inventory before proposing a competing owner.

```sh
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json query 'ішью'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json context-for-task 'session memory'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json inventory
python3 -m unittest discover -s tests -p 'test_repository_intelligence.py'
```

A connector-only agent may read the committed map/JSON at a known ref, but must
not claim local verification or CLI execution. Match CI's verified checkout/blob
record (`source_dirty: false`) to that source when relying on freshness; missing or unavailable evidence
requires direct-source fallback. PR checks can run on a synthetic merge, so a run
attached to a head does not prove raw-head JSON freshness. Inspect current issue,
PR, review, checks and deployment state through GitHub separately.

Queries return explainable candidates, including historical matches with their
roles; they do not select authority. Read their sources. A lexical miss or an
untranslated Ukrainian phrase does not establish absence; retry a source-grounded
label/path or use direct search. Validation routes suggest checks, not results.

## Identity, bounds and verification

All non-cache repository files are represented, including untracked additions
so they cannot be forgotten. A Git checkout additionally rejects tracked paths
hidden by exclusions, missing files, symlinks, submodules or unsupported modes.
Local ignored build/cache packages are excluded; exclusions are explicit in the
producer. Empty/untracked directories do not become repository artifacts.

Every input's exact bytes are streamed into SHA-256, including JS/CSS/HTML,
images, compressed logs and archived evidence. Bounds: 5000 files, 32 MB per
hashed file, 250 MB total. Parsed navigation text remains bounded at 2 MB per
file / 50 MB total. These site-specific streaming bounds admit the existing large
review bundles without loading/parsing them as policy or silently dropping them.
Unsafe paths, symlinks, unsupported source tables or bounds fail visibly.

The two RI outputs use `derived` identity records to avoid recursive hashing;
`verify` regenerates and compares the complete JSON and map. Code/config/catalog
or source edits invalidate freshness. Root AGENTS is bounded to 100 lines and
MEMORY to 120 with required sections. Ordinary reviewed local/CI execution is
implementation evidence, not a target-owned candidate security comparison.

Upgrade in an owning issue/PR: compare pinned upstream producer, contract and
architecture; document selected/omitted capabilities and retain notices; update
identities, meaningful negative tests, catalog and both outputs; run verification
and review the full diff. Never blindly copy the UA graph/CI or change research
meaning through a tooling upgrade.
