# Control changes: lock-file structural prototype

[Issue122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6385166442)
owns this two-task preparation: the bounded contract and a credential-free
prototype with negative tests. The [existing staging/admission process](SITE-STAGING.md)
remains authoritative. This prototype changes no App, workflow, branch rule,
dependency pin, scanner, installation command, report acceptance or budget.

## What is being checked

Current trusted-main workflow definitions check out the proposed source and run
its quality tools. Passing that route cannot independently approve arbitrary
changes to those tools. An unchanged wrapper also loads dependency code, so a
changed lock is an execution-control change. The current App continues to reject
such changes. This prototype does not remove that restriction.

The prototype reads immutable Git objects as data. It records three separate
identities: producer P and its actual helper hashes/dirty state, baseline B and
candidate H, including complete trees. P is the reviewed program being executed;
an unmerged or dirty P is not described as trusted protected main. The data
repository need not be the producer checkout. H's working files, hooks, scripts,
dependencies and reports are never executed or imported.
Git replacement objects, local graft ancestry and lazy object fetching are
disabled. Missing objects stay unavailable rather than being fetched implicitly.

## Supported structural class

| Condition | Required observable result |
| --- | --- |
| Complete Git inputs | Full 40-character B/H commits exist, B is ancestor of H, and both complete recursive trees contain supported regular file modes/types within limits. Additions, deletions and renames participate in comparison |
| Only changed file | Exactly `tools/quality/toolchain/package-lock.json`, regular mode100644 on both sides. Any other changed path, including proposed report/test/wrapper/manifest/workflow/policy or helper, blocks |
| Lock schema | Duplicate-key-safe lockfile v3 with unchanged header, package inventory and root declarations; package manifest stays unchanged and root dependencies match |
| Changed entry | Exactly one existing top-level unscoped transitive package; only version/resolved/integrity differ. Duplicate installed copies, direct dependencies, dependency/optional/peer/bundled edges, executable/link metadata and absent consumers are unsupported |
| Versions and consumers | Canonical stable M.m.p, forward patch within the same major/minor; every declared dependency consumer admits both versions. Only exact versions or caret ranges with major>=1 are recognized; unsupported syntax blocks |
| Location and SRI | Exact HTTPS npm registry tarball URL for the same package/version; one canonical SHA512 Base64 digest representing64bytes. URL credentials, port, query/fragment, encoding tricks or another registry block |
| Bounds | At most5000tree/package entries,2MiB per Git output/data input and5seconds per Git command. Missing/truncated/oversized/unparseable input fails closed; lazy object fetching is disabled |
| Positive meaning | `structurally-supported` establishes the conditions above only. Merge/deploy/App-check/reuse authority always stays false |

There is no tarball download, signature or fetched-byte verification, vulnerability
audit, installation, functional compatibility or native admission in this stage.
Correct SRI syntax does not authenticate package contents. Those observations
remain explicitly unverified in every positive report. No external candidate
report can supply them to this prototype.

## Operator interface

Run from the producer checkout with explicit immutable data-source commits:

```sh
node tools/quality/control-lock.cjs /path/to/repository BASE_40_CHAR_SHA HEAD_40_CHAR_SHA
```

Stdout is a JSON structural report. Exit0 means structurally supported with
authority false; exit1 means blocked, with a reason, or invalid CLI/producer setup.
The report binds exact lock/manifest hashes and lists all declared consumers.
Human review, audits, full source/compatibility execution and current main
admission remain separate obligations. The prototype's tools-changing PR is
itself outside the supported class and uses the original full delivery route.

## Acceptance and proof boundaries

CR01–CR06 at the issue anchor map complete identities/delta, narrow lock class,
versions/consumers, data limits/location/SRI, meaningful negatives and honest
nonauthority/CI allocation to this implementation. Permanent
`tests/control-lock.test.cjs` is selected by the existing PR-targeted and
staging/production source registry; no second test launcher or hosted profile is
introduced. CS01/04/05/08/09/10 apply to the owned helper, tests, catalog and RI.

The positive historical example is a **synthetic lock-only Git replay** of the
actual fast-uri3.1.8→3.1.9 patch from immutable a7d3d94/ec5d4a2 objects. The actual
PR137 had additional history/RI changes and is not claimed to be a lock-only PR.
Other fixtures use synthetic declared packages and digests, never authenticated
package bytes. Mixed/no-op wrapper, deleted/renamed input, mode/symlink, direct or
non-leaf package, range/version/URL/SRI, malformed/duplicate/oversized and invalid
identity cases must block. Existing App control rejection is tested unchanged.

General workflow/test/validator evolution, independent candidate execution,
trusted audit integration, per-PR policy isolation and synchronous stale-green
revocation remain later work. This batch completes only contract/prototype
preparation and must be reported before starting another implementation task.
