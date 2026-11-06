# Issue 169 — 6 November 2026 staging timing investigation

Owner: #169; execution PR: #170. Investigation only, requested after the single
retry also timed out. No implementation, new full campaign, merge or production.
The staging candidate remains `e50c63de071de6837cf9b6405569bb9a68afd5da`, tree
`1c9d8054afdb0e13377c6ccbcd14b92860653d99`; protected base remains
`8cf15883125892710633b17133d9ee0fc4b23b92`.

This report and its evidence live on a separate evidence branch. They do not
relabel the candidate, supply staging admission or establish whole-issue ACs.
Parent analysis is distinguished from the four separate role observations.
The source packet is SHA256
`fca1c5dacd743fd251528077caeba3f2d71e0ae137921cf09d6c5a9ae9e99ea2`.
The compact `staging-timing-proof.json.gz` beside this file retains native
artifact identities, hardware records and the local observed counts. Full role
reports, commands and CPU samples are in the separate
[diagnostic artifact](https://github.com/oborskyivitalii/oborskyivitalii/blob/5176ec9ae8b481d48dc00842b171fb527e470c99/review/issue-169/staging-timing-evidence.tar.xz), SHA256
`ce19366542316449e94f2fc499dad49249bbd0eccd13578a1efe6e94e2f62ede`.
Its artifact-only evidence branch is not an executable checkout or deployment
source. The compact proof preserves source identities, measurements and
reviewer-file hashes; original native records remain linked at their actual
GitHub Actions artifacts. Later storage-location amendments do not alter the
substantive report findings reviewed at SHA2569758cc553d6e8be666132dfcdf171c6de3980989e449626fd47b70f6bfa81b73.

## Findings

### F01 — The deadline mechanism is established; hardware is the strongest grouping

The latest source-test child reaches its unchanged 300000ms deadline with 75
modules selected, 60 started, 56 completed, four active and fifteen unstarted.
Both attempts have incomplete terminal TAP accounting and no explicit `not ok`
line in the partial stream. This is not a successful test result. The later
prepublication step is cancelled near the enclosing ten-minute build bound;
deployable artifact upload/publish/hosted regression/promotion are skipped. Raw logs do not explicitly
name the cancellation trigger, so elapsed time and workflow policy are not
represented as a separate provider attestation.

Native `lint.json` retains CPU models on the same build runner that executes the
source tests. All six November records expose Node24.19.0, four allocated CPUs,
four workers, Ubuntu image20261101.360.1 and kernel7.0.0-1017-azure.

| Run | Source | CPU host model | Source observation |
| --- | --- | --- | --- |
| 42119802341 | b75a0a31 | EPYC7763 | 300s timeout; 24/75 modules completed |
| 42196241166 | 95d3e78d | EPYC9V45 | 1198 tests pass; about224s |
| 42207436828 | d5e915fe | EPYC7763 | 300s timeout; 62/75 modules completed |
| 42227207673 | 186f28c0 | EPYC9V45 | 1202 tests pass; about202s |
| 42233889474 | e50c63de | EPYC7763 | 300s timeout; 56/75 modules completed |
| 42237763419 | e50c63de | EPYC7763 | 300s timeout; 56/75 modules completed |

These are source observations, not six successful/failed whole staging gates.
Both November source-pass runs subsequently fail security. The 64/96-core host
model strings do not describe allocated capacity: every record exposes four CPUs.
Across the 56 completed modules shared with186f28c, median slowdown is about
1.64–1.65x; eight longer paired modules have median slowdown about1.57x. Different
aggregation populations explain those figures. Several expensive module owners,
their runtime inputs, worker and workflow are unchanged across186f28c→e50c63de.

### F02 — The phenomenon predates R10 and has an exact-source historical comparison

Downloaded original native artifacts from run40215263460, attempts1and2, dated
25October2026. Both bind clean source
`808dae28fb65c5d39ceb16bec89cf5ab82e9c958`, tree
`67040e44a85e2340a4c770061c55cbf1bf3e072b`, identical ordered79-module arguments,
Node24.19.0, image20261023.334.3, kernel6.17.0-1022-azure and RAM.

| Attempt | CPU host model | Observation |
| --- | --- | --- |
| 1, artifact12607311711 | EPYC7763 | Historical180s timeout, incomplete accounting |
| 2, artifact12607671843 | EPYC9V45 | 1156/1156 pass,142.059s enclosing source result |

This same-source pair is stronger than comparing different November revisions.
The problem is therefore evidenced **at least since25October**, not first
introduced by the latest security correction. First-ever occurrence was not
established; commit history contains earlier scheduling/deadline work.

The supported explanation is environment-dependent throughput interacting with
expensive test work and fixed deadlines. CPU model is the strongest recorded
discriminator in these samples. Frequency, host load, contention, actual CPU
quota/throttling and disk performance were not measured on those native runs;
CPU model alone is not proved to be the sole cause. No general claim that every
7763 run fails, or that selecting a CPU model would solve acceptance, follows.

### F03 — Repeated article preparation is a measured cost surface

One existing named case in `tests/release-rights.test.cjs:797` mutates full
license HTML into sixteen hidden/commented/inert forms. Each iteration invokes
`rights.compile`. That calls `hostedInventory` and `reader.select`, which reload
the article and prepare its lossless media **before** later rights validation
rejects the candidate. Exact legal-copy checks are owned by `publicNotices`;
the observational counter does not capture the caught exception identity.

Executed two bounded, local diagnostics on unchanged candidate sources:

1. V8 sampling of that one case:1/1 pass, about30.26s wall time,
   30.166s sampled elapsed intervals. About87% of sampled elapsed time occurs at
   synchronous child-call frames; roughly52% corresponds to the media encoder path and30% to article
   AST subprocess paths. These samples do not measure child CPU self-time.
2. A separate observational wrapper counted child invocations for that same
   case:1/1 pass, about30.67s command wall time. No assertion, producer or fixture edit.

| Calls observed through `cp.spawnSync` | Count | Observed child-call wall time |
| --- | ---: | ---: |
| Python `web-media.py` | 17 | 15.65s |
| Node article AST parser | 51 | 9.51s |
| Local Git object/provenance commands | 357 | 1.58s |

The observer wraps `cp.spawnSync` only. These are observed calls, not a complete
count of every process or Git call: `execFileSync` paths are outside this counter.

Sixteen rejected HTML variants plus initial fixture preparation explain the
seventeen media preparations. Current code provides no shared reuse at this
selection boundary. PNG decoding, WebP encoding and exact pixel/ICC verification
are performed repeatedly for unchanged article image inputs. The test is about
license visibility, but it repeatedly traverses that full hosted-article path.

Both diagnostics used local Node24.22.1, rather than native CI24.19.0; invocation
counting adds observer overhead and execution used one selected case rather than
four competing module workers. Their absolute times cannot be substituted for
CI or extrapolated into a guaranteed whole-suite saving. The first launch failed
before Node because `/usr/bin/time` was absent; that setup error is retained and
Python resource/timing collection was used for the actual successful invocation.

### F04 — Source history explains the accumulated workload, not a new e50 regression

| Date | Exact source/history | Relation established |
| --- | --- | --- |
| 15Oct | 1f791427 | The16 malformed-wrapper cases and actual edition/package CLI tests already exist. |
| 19Oct | 9dc0d425, f9b98f79 | Hosted rights verification selects full articles; selection prepares lossless images through Python. This is the measured expensive call path. |
| 20Oct | e24168ea | WebP method6→4 and exclusive heavy guards mitigate cost; they do not remove repeated preparation. |
| 25Oct | 40215263460/1, /2; f2f2ac25 | Exact-source hardware contrast above; source deadline later increased180→300s with30s reporting grace. This gave headroom without removing the cost path. |
| 1Nov | 39b681ee | Longest-observed-first ordering changes which modules start first; selection, four workers and300s deadline remain. |
| 5Nov | 42119802341, b75a0a31 | Original raw PR170 staging source timeout already exists before R10/site-first/current security correction. |
| 6Nov | 2353b7c8 | Native gzip-size reuse reduces a separate repeated cost; later complete source passes take about224s/202s. It does not cache the media/AST path measured above. |
| 6Nov | fc205b17 | Site-first launch destination validation adds an AST compile during profile loading. Profiling identifies this as a contributor, but it cannot explain the5Nov or25Oct failures. |
| 6Nov | e50c63de | Exact scanner tuples and refusal-test extension; expensive rights/controller/Space owners and source scheduling remain unchanged. No evidence supports naming this patch as first onset or sole cause. |

The native rights module rises from about129s on9V45 to205s on7763 in the latest
pair of source revisions, while controller, Space and other modules also slow.
It finishes successfully and is not a demonstrated infinite loop/deadlock.

## Independent review and limits

Four distinct roles were launched with explicit `fork_turns="none"` and no model
or effort override. Actual returned handles are `/root/timing_requirements`,
`/root/timing_code`, `/root/timing_whitebox`, `/root/timing_exploratory`. The bundle
retains each first result before factual evidence-delta continuations. Original
packets forbid parent/peer narrative and unrelated history; provider-side memory
and isolation internals remain unknown. Tool acceptance establishes requested
launch mechanics, not an independent provider attestation.

Requirements distinguishes failure mechanism from causality and first-ever onset;
Code traces unchanged owners and repeated article preparation; White-box recomputes
partial accounting, module timing and CPU comparison; Exploratory inspects CI
guard/cancellation/report-retention paths. All are investigation observations,
not release approval. Initial limited reports are retained alongside later
evidence, rather than rewritten as if the broader evidence was initially present.

Requirements also found stale scheduling terminology in the check-profile guide:
actual prepublication uses one75-module/four-worker invocation, distinct from PR
Basic's eight shards. Final security/prepublication aggregates are missing after
outer cancellation because the current collector finalizes only after all
guards return. Semgrep/Bandit/Python partial success cannot fill those missing gates.

## Recommended next work — not implemented

1. First examine moving the existing exact public-notice validation ahead of
   expensive hosted media reconstruction. Hidden legal-copy mutations could then
   fail before unrelated image preparation. Every original negative case and all
   successful-path source/media/pixel/rights checks must remain independently
   exercised. Validate changed failure precedence against existing contracts.
2. Profile remaining actual edition/package CLI work, then consider exact-input
   media/AST reuse only with byte/toolchain identity, bounded state and demonstrated
   invalidation. No broad bypass, removed case or assumed cached correctness.
3. Measure the corrected complete source suite and prepublication critical path
   with sufficient margin under observed slower runner classes. A source-only
   pass still does not supply complete staging or promotion.

No third staging retry, deadline increase, worker/selection change, source fix,
merge or production was performed for this investigation. Existing issue ACs and
failed/incomplete evidence remain unchanged; accepted stable staging is pending.

## Evidence and publication links

- Historical exact-source pair: [run40215263460](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/40215263460), artifacts12607311711/12607671843.
- Earliest inspected current-wave failure: [run42119802341](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42119802341), artifact13457983011.
- Further primary records: runs42196241166/artifact13492353165,
  42207436828/13498231842,42227207673/13505454566,
  42233889474/13511850494,42237763419/13515515607.
- Each downloaded original ZIP SHA256 is retained in the compact proof;
  selected report member hashes and original bytes are in the full bundle.
  No narrative-only historical assertion supplies the
  exact-source hardware comparison.

Issue synopsis: at least25October's native exact-source hardware contrast and
the current six-run split support environment throughput as the strongest
discriminator. Repeated media/AST/provenance reconstruction is measured inside
one legal-visibility test. Preserve the current candidate and target that work
before another full staging attempt; sole CPU-model causality and first-ever
onset remain explicitly unproved.
