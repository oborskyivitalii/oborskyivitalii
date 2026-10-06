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

Follow-up: the eight 38ee0df observations remain retained; their cold native stall
survives paint omission, small backing store and absent atmosphere writes (the
latter includes a 2172ms requested RAF even though its later fixture passes).
Reference Research collection failed closed before its first browser due to an
incorrect candidateCommit inherited from the candidate environment. Set each
clean source's declared candidate SHA during its own build, then validate both.
The supported desktop ribbon tier is now public, preserving tier-zero and all
mobile geometry; a fixed-mesh diagnostic remains the explicit counterfactual.

Next scoped collection: normal first-process WPE vs GTK and equivalent 2D
atmosphere translation on six fresh runners,
one separately labeled native CPU sample of WPE/browser child processes, complete
source lint/security preflight, and the corrected balanced Research pairs.
Pinned Playwright's Linux headless script selects WPE, whereas headed selects
GTK. GTK-only compositing environment variables are not a WPE diagnosis. No
native backend selection is shipped in the accepting functional gate yet.
