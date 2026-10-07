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
