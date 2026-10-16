# Issue 39 — 16 October 2026 Python audit compatibility

Owner: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#python-audit-compatibility-20261016).
Delivery: prerequisite to [PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Executor/reviewer: Codex, self-review. Independent release review remains pending.
Inspected baseline: protected main `315da39d`; preparation is dirty until frozen.
Read the agent, contribution, style, acceptance, RI and release/staging contracts.

## Intent and acceptance

The maintainer requests PR40 through permanent Cloudflare staging and protected
main, then production. Its `/stage` workflow runs from trusted main and installs
the candidate's audit requirements. Main's ordinary resolver cannot install the
patched MCP SDK with Semgrep's exact declared older SDK constraint. Deliver the
minimal installer dependency first, under the existing #39 AC01–AC05. Keep the
full PR40 feature policy and all live release gates with the subsequent candidate.

## Findings

| ID | Evidence and implication | AC | Disposition |
| --- | --- | --- | --- |
| F01 | GHSA-84m7-p3x7-pcfv affects MCP1.29.0; patched1.30.0 is required. | AC03 | Exact patch, no advisory waiver. |
| F02 | Semgrep1.179.0 and newer published1.181.0 still declare MCP==1.29.0. Ordinary dependency resolution rejects the patched pair. | AC03 | One explicitly verified constraint override; Semgrep metadata remains unchanged. |
| F03 | Trusted main supplies the staging installer. Candidate-only installer changes cannot repair admission. | AC04 | Narrow main prerequisite before PR40 staging. |
| F04 | Main's existing controller-dependency policy protects public/runtime bytes. | AC01–AC04 | Update its immutable baseline to current main; reverse only eight exact installer paragraphs before comparing all607 protected blobs and modes. |

## Decisions

Install the complete exact lock with `--no-deps`, then fail closed on the installed
package inventory and every active dependency constraint. Retain Semgrep1.179.0,
pin MCP1.30.0 and pip26.2.1, and change no other original requirement. The sole
permitted conflict is Semgrep's exact MCP==1.29.0 declaration with installed1.30.0.
No package metadata is modified. The advisory engine independently repeats graph
verification and retains mandatory full Python/npm vulnerability checking.

All six full workflow installers use the validator immediately. The two minimal
source/acceptance installers add only the exact packaging pin for graph fixtures.
No runtime, generated public, producer, domain, hosting, budget or scanner rule
changes belong to this prerequisite. CS01/CS05/CS08/CS09/CS10 apply; self-review
checks ownership, complete accounting, failure propagation and bounded negatives.

## Execution tasks

| Task | Paths and result | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Requirements, graph validator, existing workflow/scanner owners | F01–F03 / AC03–AC04 | Actual install, graph, Semgrep and pip-audit | Prepared; actual graph89 packages/143 constraints, Semgrep225 files/0 findings/0 errors and pip-audit89 packages/0 vulnerabilities passed in the isolated delivery environment with these exact files. |
| T02 | Four permanent positive/adversarial tests and existing issue policy | F02/F04 / AC01–AC04 | Missing/changed/duplicate/unfrozen packages, other conflicts, broadened overrides and ambiguous lock failures | Four graph fixtures and both owning preservation/graph assertions pass on this prepared source. |
| T03 | Catalog, review, memory and RI/CI | F03–F04 / AC04 | Basic/style/format/lint/architecture, RI/coupling and owning policy | Prepared Basic24 cases, maintained format, complete lint, style and architecture pass. RI28 regressions and coupling regressions pass. Frozen owning/source CI remains pending. |

## Acceptance evidence

| AC | Check | Result and source | Remaining gate |
| --- | --- | --- | --- |
| AC01 |607 protected blobs/modes, with only exact installer reversal | Pending frozen source | Actual provider inventory before delivery. |
| AC02 | No canonical/domain/DNS change | Outside this increment | Actual PR40 canonical migration and redirects. |
| AC03 | Complete dependency graph, fixture negatives and scanner/advisory diagnostics | Actual isolated toolchain diagnostics above; clean owning checks pending | PR40 exact-source preflight/native/performance, rights/device/independent/settings acceptance. |
| AC04 | Minimal trusted installer, normal protected merge | Pending source/RI/owning CI | Maintainer's delivery instruction authorizes this necessary prerequisite; no production activation follows from it. |
| AC05 | No production or live domain publication | Pending with PR40 | Actual production/live-origin and recovery acceptance. |

Earlier failed or incomplete runtime measurements remain in the PR40 readiness
record. This dependency does not relabel them or claim successful staging. Keep
issue39 open and its full release criteria pending.

## Issue synopsis

The current main installer cannot resolve the patched audit SDK pair. This
public-byte-preserving prerequisite adds one exact graph-verified compatibility
override and keeps every scanner, advisory feed and release budget enforced.
Integrate through normal source/RI/owning checks, then resume PR40 staging.

## Prepared-source verification

The actual pinned detector found one new candidate: the public immutable main
commit literal in the preservation test. `git cat-file -t` confirms a commit;
SHA1 of that exact literal reproduces its hashed detector fingerprint. Append
only this exact path/rule/fingerprint to the existing publication ledger; retain
all previous records. Current RI/CI fields remain dynamically verified, not
baselined. No remaining unreviewed static finding was observed.

Initial local lint invocation lacked its artifact-manifest argument; architecture
was invoked once without the external toolchain environment. Re-running the
normal packaged Basic route with its actual manifest and explicit pinned tools
passes. The first format check observed the refreshed coupling JSON layout;
formatting that owner with the pinned config and repeating passes. These setup
corrections are not release or hosted staging evidence.

The first frozen owning run passed10/11 checks and failed the publication workflow
fixture because it still required the former ordinary pip command. Update that
assertion to require the exact complete-lock installer immediately followed by
the graph validator before prepublication and upload. Retain every publication,
rights, source-identity, failure-retention and upload-order assertion; repeat the
owning policy on the new clean source.

The next clean owning run on3f7b27b / tree813905f passed11/11 checks.
Final graph review then found two dependencies enabled by requested extras
(PyJWT crypto and CacheControl filecache). Propagate extras through the complete
installed graph before checking active constraints; the real graph now verifies
143 constraints across89 packages. The same four tests include valid extras,
transitive missing extras and incompatible extra-enabled dependencies. Freeze
this final validator and repeat exact-source policy/source checks before readiness.

Clean c00dbb2 source selection passed536/536 named Node cases across43 selected
modules in117373ms, within the unchanged180000ms limit, with zero skipped,
failed, cancelled or TODO cases. Inspection of the actual acceptance adapter
then required adding issue39 to its existing minimal-tool installer condition;
otherwise the new graph-fixture subprocess would lack its pinned environment.
The exact preservation assertion reverses that single owner-selection line as
part of the same named installer paragraph. No other workflow condition changes.
Hosted source/RI/owning checks will bind the final branch commit.
