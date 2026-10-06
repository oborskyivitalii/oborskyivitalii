# Bounded first-evaluation target attribution — 2026-10-06

This private read-only screen continues the authorized causal investigation in PR #23 following
[GTK-FOLLOWUP.json](GTK-FOLLOWUP.json): all ten disabled-script observations
emitted native page-crash before cleanup. Native signal and crashing stack are
unknown; the automation-session warning also occurs in passing scenarios.

Two fresh Ubuntu runners compare GTK and WPE. Each of the twelve standard cells
launches its own fresh browser with the exact functional probe/capability/theme
init, 320 × 844 viewport, light color scheme, and original JavaScript preference.
For each port compare JavaScript on/off across blank constant evaluation,
full normal Color constant evaluation, and full normal Color **original state()**
as the first evaluation. GTK adds two explicit init-omission interventions:
disabled-script blank constant and disabled-script full Color original state().
The total is fourteen cells: GTK eight, WPE six. No warmup, priming, retry,
automation flag, shipped-source intervention, deployment or promotion occurs.

The exact blank fixture and its hash are retained; blank and unchanged Color
bytes use the same private loopback origin. Full Color retains its clean source,
tree, runtime variant and artifact identity. GTK display plus browser share the
existing 30000ms startup allowance; goto(load) remains 30000ms. After load,
the original 180ms wait is followed immediately by the chosen first evaluation.
The Node-side process snapshot runs during that wait and is awaited later.
Report disk writes occur after evaluation is launched, preserving its trigger.

Underlying page.evaluate/state() has no new API timeout. A separate **60000ms
diagnostic collection bound** prevents a hung evaluation from monopolizing the
collector. It records CollectorTimeout before teardown, with no acceptance claim.
A **30000ms diagnostic cleanup cap** similarly records CleanupTimeout; it is
never classified as spontaneous native crash. Later cells retain a prior-cleanup
incomplete marker and cannot make the collection valid after failed cleanup.
These are collection bounds, not changes to functional or performance budgets.
The two jobs retain the existing 25-minute limit and 3/5/3-minute install caps.

Every attempted cell retains Node lifecycle events, page errors, external requests,
source/port/version/startup, exact raw result or failure, and native stderr ranges.
Existing core_pattern and inherited limits are read without modification.
Process trees are recorded before evaluation and after failure; kernel journal,
dmesg, coredumpctl and /var/crash availability/errors are retained after failure.
Diagnostic text and native stderr have explicit byte limits and dropped-byte
counts. No debugger is attached and no core setting or limit is changed.

The workflow retains all valid crash/timeout observations and checks collection
completeness, not success of each native evaluation. Dedicated static preflight
checks the complete exact-head source with the existing pinned lint/security
scanners. Every report has fullGate:false and performanceAcceptance:false.
The dated path-scoped #23 trigger must be removed after collection; later replay
is manual only. Results do not complete GTK, full staging, merge or performance
acceptance, and no remedy is selected before the controlled evidence is reviewed.
