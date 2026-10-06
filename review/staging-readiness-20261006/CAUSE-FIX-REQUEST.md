# Confirm cause corrections and attribute the unresolved native delay

Continue sole PR #23 under #12/#13. Reference is the completed cause-analysis
source db9447d0a6c9755670b9a40009329f183a1d3af9; candidate is this exact PR head.

Supported changes: serialize whole engine leases (including navigation/analytics),
observe actual paints/fallback within the existing 1500ms bound instead of a
180ms assertion, and avoid unused Canvas stroke-state assignments on filled
facets without a contour. No geometry, thresholds or hold policy changes.

Before full staging, retain three balanced normal Research mobile/simulated pairs
and three separately labeled CPU-profiled pairs on one runner, each using fresh
Chromium. Preserve LHR, original Trace and DevtoolsLog, including every outlier.
Normal and profiled values must never be pooled as acceptance.

Cold WebKit remains unproven. Use eight fresh runners: two replicas each of the
normal private traced control, no shape submission, no atmosphere CSS writes and
default canvas backing size. Each runner launches exactly one cold WebKit process
with the original foreground/baseline/next-paint fixture. Recovery is a separate
observation. These private ablations narrow native rendering causes; none is a
proposed public visual omission. Collection green means retained evidence only.

All source/artifact/parent identities are verified; fullGate:false. No deployment
or production changes. Remove the dated PR trigger once all raw results survive.
