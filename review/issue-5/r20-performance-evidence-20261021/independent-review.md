# Independent R20 performance evidence review

Reviewer: `/root/r20_results_review`, separate non-implementing reviewer.
Owner: issue5 / Draft PR79. Date: 21 October 2026.

This review examines measurement integrity, completeness, budget interpretation
and reporting. It does not repeat or replace the prior independent source review,
editorial acceptance, rights, native-device review or release admission.

## Exact inspected identity and material

- Source: `3e12e47953bc8c81316544b1da206a956a337307`.
- Tree: `728b7aee4dcdc3627b1327f90d8df64971d2d816`.
- Public artifact: `aa6490f76bcd05a9e55d42db8ddf97d2bf1e9064618be5c89b4c99e698e99009`.
- Clean detached checkout independently observed at that source/tree.
- `AGENTS.md`, independent-review rules in `CONTRIBUTING.md`, original unchanged
  `tools/quality/budgets.json`, `validate.cjs` motion rules, `performance.cjs`
  checkpoint semantics and `reader-performance.cjs` collection/validation rules.
- Original R20 directory `pr79-opt-r20-performance`; continuation directory
  `pr79-opt-r20-continuation`; recipe `pr79-opt-r20-resume-performance.py`.
- Final report `pr79-opt-r20-final-report.md` SHA256
  `a9bc314ebe2533d7350100b3602d0ba5f0b639b962ae56b57ce049b76537e4df`;
  completed summary `pr79-opt-r20-completed-summary.json` SHA256
  `6646131332be0036e0db1582627bb514b8742b3a3623edd732f46c866665afd0`.

No browser, scanner, source test, package operation or full-tree hashing was run
by this reviewer while the performance collectors were active.

## Findings and dispositions

### ER01 — High: the original R20 wrapper is incomplete

The original `execution.json` lacks a completion timestamp/exit code, and
`performance-suite.json` retains `pass:false`, one completed Lighthouse stage
and `verification.after:false`. Its motion data contains15 samples and one
journey profile; it contains no soak or reader stage. Intermediate
`motion.pass:true` is produced before final validation and cannot establish
completion. The process-stop cause is not proved by these files.

Affected: AC12, CS07; all whole-feature/release claims.

Required disposition: preserve the original files unchanged; identify the
continuation explicitly. Never describe the combined evidence as one completed
uninterrupted `performance.cjs` run or rewrite its original pass value.

### ER02 — High: retain measured Home motion budget misses

Original `motion/motion.json`, index390px/CPU×4: idle paint p95
45.599999994ms and scroll p9538.800000012ms exceed33ms; idle busy21.652570918%
exceeds20%. The aggregate motion stage stopped before final validator execution,
but these already measured budget misses remain observations.

Affected: AC12/CS07. This evidence does not establish a newly introduced runtime
regression or explain host variance; it does prevent silently presenting every
R20 observation as passing.

Required disposition: retain and surface these measurements regardless of the
continuation outcome. Any subsequent passing stage must be reported as its own
observation, with the unexplained original variation visible.

### ER03 — Medium: an individual TBT tail survives passing group medians

The completed30-trial Lighthouse stage has10 route/profile groups, all passing
the original median-of-three rule. Writing mobile run1 records235ms TBT against
the200ms threshold; that group's median is178.5ms. A group PASS is correct under
the existing rule, while an assertion that every individual R20 TBT passed would
be incorrect.

Affected: AC12/CS07, reporting precision.

Required disposition: report the235ms tail alongside passing group medians.

### ER04 — High: completed reader mobile TBT fails the original budget

All six reader Lighthouse trials and all three reader motion profiles completed.
Reader mobile TBT184.5/225.5/204ms has median204ms against200ms. This agrees
with the collector's Lighthouse violation and exit1. Reader mobile LCP
2408.548/2253.114/2252.406ms has median2253.114ms; all trials are below2500ms.
Desktop LCP median521.218ms, TBT median16.5ms, both CLS medians0. These metrics
were independently recomputed from all rows and checked against the six original
Lighthouse JSON audit values.

Affected: AC12/CS07. The4ms TBT overrun cannot be rounded away, attributed to an
unproved cause, or converted to a PASS by the earlier R19 result.

Required disposition: completed assembled R20 coverage is FAIL; retain the
source and all trials and investigate CPU tasks before any bounded correction.
No unchanged-source repeat to obtain a pass is justified by this finding.

### ER05 — Medium: distinguish individual tails from passing medians

The first generated final report labels all three individual TBT exceedances as
being "despite passing group medians". That is true for Writing235ms, but false
for reader225.5/204ms because the reader group fails its median budget. The
report otherwise correctly declares FAIL and supplies all values.

Required disposition: correct that paragraph to distinguish the two group
outcomes. Scope its sentence about all motion checks passing to the completed
continuation, and call the six traces plus six logs six trace/log pairs.

Recheck: all three wording corrections are present in the final report. ER05 is
resolved. The added long-task audit attributions were checked against original
reader trial2/3 LHRs: space129/120/91ms in trial2, navigation103ms and
space89/83/76ms in trial3. The report correctly limits these to audit-level URL
attribution and does not claim a function-level cause or additive TBT identity.

## Completed independent verification

- Original completed Lighthouse:30 trials,10 groups, all group medians pass;
  individual Writing235ms tail retained.
- Continuation motion:15 short profiles/60 windows,24 flights,120 retention
  cycles, ten nonoverlapping soak chunks totaling300072.999999985ms. Motion
  exited0. All30 short Off/Reduced windows and the post-soak Off window record
  zero callbacks/paints. CPU×4 max p9526.8ms; max equivalent readiness2994.6ms,
  actual readiness4121.1ms is reported separately. Nodes/listeners do not grow.
- Independently recomputed percentiles, paint gaps, busy percentages, window
  bounds and counts from29844 raw callbacks across95 motion/flight/soak
  observations; the declared metrics match those raw observations.
- Reader:6 trials/3 short profiles/12 windows; independently checked another
  1247 raw callbacks across12 windows. All6 reader Off/Reduced windows record
  zero work. CPU×4 reader max p9525.1ms. Six original reader LHRs each show one
  image request,95670 image-transfer bytes,226755 total-transfer bytes, no
  Lighthouse run warnings. This supports continued lazy scheduling, not CPU
  budget acceptance.
- Combined completed coverage:36 Lighthouse,72 short motion windows,24 flights,
  120 retention cycles and300.073s soak;36 short zero-work windows. Extra
  interrupted-attempt samples remain separate and preserved.
- Continuation receipt: motion exit0, reader exit1, completed
  `2026-10-21T07:48:38.215074+00:00`; artifact verified before/after and clean
  source. Final checkout independently re-read as source3e12e479/tree728b7aee.
- Forced-GC soak heap3944640→4806652bytes (+862012); this bounded observation
  proves neither a leak nor its absence.
- Prior exact-source source-check receipt has zero exits for owning, formatting,
  lint, RI, RI/CI and Python toolchain checks. Prior bounded reader journey and
  five supplementary functional checks retain exact3e12e479/publicaa6490f7
  identity and passing receipts; they were not rerun as performance evidence.

## Final evidence assessment

**Completed assembled performance coverage: FAIL**, independently confirmed
because reader mobile TBT median204ms exceeds200ms. The original incomplete
wrapper and its observed budget misses remain unchanged. The completed
continuation is not a single uninterrupted wrapper run.

The corrected final report and completed summary agree with the inspected raw
results. ER05 has been corrected and independently rechecked. **No unresolved
blocking finding remains for publication of this reporting iteration.** ER01–ER04
remain explicitly reported observations/acceptance boundaries, not concealed or
fixed by this review; R20 performance acceptance remains FAIL. No independent
source/feature/release approval is supplied. Remote archive upload/readback and
final GitHub comment/PR metadata are outside this local-results review scope.
