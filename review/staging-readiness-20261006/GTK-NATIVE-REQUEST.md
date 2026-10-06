# Exact GTK native abort stack — 2026-10-06

This private read-only follow-up continues the authorized causal investigation
in PR #23. The completed fourteen-cell screen retained three exact
WebKitWebProcess SIGABRT records, including full Color constant evaluation with
JavaScript disabled. No crashing native stack or assertion was retained.

One fresh Ubuntu GTK runner retains exactly three fresh browser controls, in
this order: blank constant with JavaScript disabled, unchanged full normal Color
constant with JavaScript enabled, then unchanged full normal Color constant with
JavaScript disabled. Every control uses the original functional probe/capability/
theme init, 320 × 844 light context, GTK/Xvfb launch arguments, shared 30000ms
display/browser startup budget, goto(load) 30000ms, and 180ms settle followed
immediately by its first constant evaluation. There is no warmup, priming, retry,
live debugger attach, source/render intervention or changed acceptance budget.

The existing after-load process observation runs concurrently with the settle
and is awaited only after evaluation/failure. Native-only metadata retains the
current collector-owned MiniBrowser child WebProcess PID, exact /proc executable,
start ticks and boot ID. Ambiguous, vanished or unreadable identities are retained
as unavailable; no newest-core or unrelated-process fallback exists.

Only after a native page-crash, coredumpctl info must yield exactly one matching
PID/executable/boot and trial-time record before offline debugger inspection.
The identical selectors constrain coredumpctl debug, with /usr/bin/gdb explicitly
selected. GDB runs batch with -nx/-nh, early initialization/auto-load/debuginfod
disabled, selected-thread **bt 80** first, **thread apply all bt 20** second, then
**info sharedlibrary**. It reads a saved core and does not attach to a live process
or run/continue any program. A 512MiB file-size cap applies only to this postmortem
subprocess and its descendants; native browser/core limits and core_pattern are
read without modification.

Every diagnostic command has a 30000ms deadline that terminates its isolated
process group, including debugger descendants, and retains exact argv, exit code,
signal, timeout and kill result. Text retains at most 256KiB per stdout/stderr
stream with exact byte/drop counts. Original native error/lifecycle evidence
survives unavailable, nonzero, timed-out, truncated or unverified core inspection.
No stack is claimed merely because a command ran. The separate nativeCaptureComplete
flag requires a matching core, completed untruncated debugger output and retained
stack frames; collectionComplete means only all three primary outcomes were retained.

The official observed Ubuntu runner software manifest lists systemd-coredump and
does not advertise gdb. The workflow records existing debugger availability and
installs gdb only if /usr/bin/gdb is absent, with a five-minute APT step cap,
primary Ubuntu mirror, existing acquisition limits, --no-install-recommends and
--no-upgrade for the listed gdb package. Actual APT dependency changes are retained.
Exact debugger/systemd/prlimit versions and installation output are retained. Locked
Node/WebKit and unchanged normal base/Color manifests preserve source/tree/parent/
runtime identities. The native job retains its original 25-minute limit and
3/5/3-minute Node/dependency/browser install caps; first-evaluation 60000ms and
cleanup 30000ms bounds remain explicit diagnostic collection bounds.

Raw reports, stderr and debugger-install observations always upload. Dedicated
read-only static preflight scans the exact complete source with existing locked
lint/security tools. Every report remains fullGate:false and
performanceAcceptance:false, with no staging, promotion or performance acceptance.
The completed fourteen-cell workflow is now manual only. This dated same-repo
#23 request trigger is removed after collection; later replay is manual only.
