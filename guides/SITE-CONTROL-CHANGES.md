# Control changes: structural assessment and contained execution

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

General workflow/test/validator admission, trusted audit integration, per-PR
policy isolation and synchronous stale-green revocation remain later work.

## Single-module execution experiment

The [next two-task decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6386125270)
adds this containment contract and one narrow executable path. It does not
approve lock changes or replace the original source, audit, staging or admission
obligations. Only `tools/quality/delivery-json.cjs` is exercised; npm installation,
package authenticity, dependency compatibility and general control evolution
remain outside its coverage.

`control-runner.cjs` reads exact immutable B/H Git module objects as data. It
requires B ancestry, regular mode100644 and at most64KiB per module; refs,
missing objects, alternate modes and oversized input block before execution.
Git replacements, grafts, inherited Git environment, system/global configuration
and lazy fetching are disabled; repository-local configuration is still read.
Other candidate paths are not executed or assessed for admission. Exact complete
trees identify the sources without claiming their whole delta was approved.

Actual producer P owns ten fixed parse/canonical/path probes, literal expected
outputs and all resource/command choices. It records its commit/tree, dirty state,
actual implementation hashes and Node version. B is the comparison source;
recording B does not make unmerged/dirty P a protected-main policy. The host runs
both B and H against the same inventory. The module executes only inside the
container. Its tests, registries, package metadata and claimed reports cannot
alter the parent-owned probe count or oracle.

### Containment and limits

Supported infrastructure is Linux x64, a local rootful Docker daemon with
cgroupv2 memory/swap/PID/CPU controls and default seccomp. The kernel, daemon,
Docker CLI, host Node executable and its dynamic libraries are trusted platform
inputs, individually identified in the report. The implementation uses only
`unix:///var/run/docker.sock`; ambient contexts, proxies and Docker configuration
are not forwarded. No capability means blocked before candidate execution.
There is no host-execution fallback or daemon setup/permission change.

The host constructs an ephemeral scratch image from a fixed regular-file
inventory: identified Node/ELF libraries, P's driver/probe data and one immutable
candidate module. No registry download, Dockerfile command or package install
runs. Execution uses the imported immutable image ID with pulling disabled.
Image/tar/input hashes are recorded. No host directory, socket, repository,
credential, Git data or cache is mounted into the container.

| Boundary | Required setting and evidence |
| --- | --- |
| Identity/privilege | Numeric65534:65534, all capabilities dropped, no-new-privileges, default seccomp, private PID/IPC/cgroup/UTS context |
| Network | Docker `none`, no published ports, host networking or supplied sockets; native host-listener denial and namespace observation |
| Files/environment | Read-only image; exactly PATH/HOME/HOSTNAME/LANG constants, no inherited descriptors other than captured standard streams; source writes and synthetic host-canary access denied |
| Aggregate resources | Memory256MiB with no swap,32PIDs/threads, oneCPU quota; actual cgroup files and memory/PID failure probes |
| Writable storage | `/tmp`8MiB with noexec/nosuid/nodev; `/dev/shm`1MiB. Docker also supplies private `/proc`, `/dev` and generated hostname/hosts/resolver files; these are platform mounts, not user binds |
| Host supervision |5second attached-execution timeout,64KiB output cap,30second bounded daemon/setup/cleanup commands; logging driver `none` avoids an unbounded daemon log |
| Cleanup | Unique owned resource names, forced whole-container removal, image removal and confirmed absence. Failure/uncertainty blocks success and retains resource identifiers |

Inspect and validate the actual stopped container configuration before start.
Terminal state, exitcode, OOM status, captured streams and cleanup all participate
in the result. The5second attachment watchdog is not a claim that every daemon
cleanup completes in5seconds. Host/daemon crashes or a forced parent kill require
disposable-runner teardown; recorded resource names support recovery. No claim
against kernel/daemon vulnerabilities or universal sandbox certification is made.

The inner Node driver shares a process with hostile H. H can alter globals or
forge output, so inner assertions, TAP and candidate-produced counts are not
trusted evidence. The parent accepts only exact finite expected bytes after
successful terminal execution and verified cleanup. A malicious module can
mimic those finite outputs: `observed` means bounded input/output agreement,
not benign intent, full correctness or trusted admission. All four authority
flags remain false.

### Operator and actual proof

```sh
node tools/quality/control-runner.cjs /path/to/repository BASE_40_CHAR_SHA HEAD_40_CHAR_SHA
node tools/quality/control-runner-proof.cjs BASE_40_CHAR_SHA HEAD_40_CHAR_SHA /outside/report-directory
```

The first command emits JSON and exits0 only for `observed`; blocked results
exit1 with explicit reason. Original hostile streams are Base64 report data,
never printed as workflow commands. The second command is a native diagnostic
with real B/H execution plus synthetic filesystem/environment/network/scratch,
PID/memory/timeout/output/crash, forged-report and wrong-output observations.
It retains original per-case reports and hashes; designed cases are not passes.

Permanent `tests/control-runner.test.cjs` covers immutable extraction, actual
configuration rejection and parent-oracle/fail-closed behavior through existing
selected PR/staging/production source profiles. The separate, nonrequired
`control-runner-probe.yml` runs the native experiment for relevant ready-PR
changes with read-only repository permission, no secrets or deployment environment.
It is ordinary candidate CI, not an authenticated protected-main issuer. A
successful native result is required for completion of this bounded task, but
does not waive any existing full delivery check or make the App accept controls.

TR01–TR08 at the decision anchor own identities, fixed selection, filesystem,
process/network, finite execution, external oracle, capability failures and actual
proof/allocation. CS01/04/05/07/08/09/10 and four separate review roles apply.
Local namespace/Docker unavailability is recorded as blocked, never a synthetic
isolation pass. Report this two-task batch and whole-issue remaining work before
starting another implementation batch.
