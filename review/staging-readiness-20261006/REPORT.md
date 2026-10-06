# Full staging and merge readiness — 6 October 2026

The maintainer authorizes full staging of open PR #23, successful stable promotion,
then merging that exact reviewed head into protected main. Existing CI resolves
the open PR automatically; only the pinned official Wrangler Action publishes.
The existing ruleset requires PRs and current basic/RI checks. No production
GitHub Pages workflow is active. The earlier Writing-only pause is superseded.

## Initial current-source execution

Owner command [6015877140](https://github.com/oborskyivitalii/oborskyivitalii/pull/23#issuecomment-6015877140)
starts [run 37460990802](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37460990802),
controller main `1490f7d99fa636328cb09bca7eab9e7557d00769`, candidate
`cd257503f75190c5f8afa530550e297d8e17d185`. These are different identities;
the source candidate is published at
[96ad039a](https://96ad039a.oborskyi-author-ci-staging.pages.dev).
Target/build/publication, hosted smoke, full source regressions, hosted exact-byte
checks, captures/contrast, Lighthouse and full CPU/motion/five-minute soak succeed.
Linux functional matrix fails; Color and native collection continue independently.
Full static also fails and blocks promotion/merge.

Fresh static job 112261654080 reports unused world vector imports, new cognitive
complexity over 25 in navigation/Writing helpers, a double-space regex and 580
untriaged entropy candidates. Semgrep and Bandit have zero findings/errors;
advisories pass. Exact raw static artifact 11412468297 is retained in
`first-static.zip`. No thresholds, scanner coverage or exceptions are relaxed.

## Corrections before the next complete gate

- The procedural world factory uses existing `math.owns` in the supported
  missing-Object.hasOwn capability mode. The old full suite has 30 failures;
  isolated VM reproduces its TypeError on unchanged cd2575. All five routes ×
  both detail modes retain exactly the same serialized geometry/glyphs/normals
  as before, including when Object.hasOwn is absent.
- Remove unused vector imports. Extract identical navigation completion into
  one helper and split Writing diagnostic helpers without changing execution
  order or adding complexity exceptions.
- Same-document Back/Forward waits actual URL, restored archive controls and
  completed mounting rather than inspecting the page before popstate finishes.
- Endpoint takeover waits native wheel settlement (150ms quiet, strict 2000ms
  deadline) before footer growth. The original takeover tolerance stays 2px;
  every wheel sample is retained on success and failure.
- Print/Off/hidden fixtures record their actual trigger. Animated paths missing
  their trigger still fail; instant paths trigger at real page arrival. Print
  cannot pass without dispatching beforeprint.
- Color handover requires exactly one real mount event, opacity zero and painted
  camera progress at/after midpoint but before arrival. Every sampled crossing
  must remain hidden. Both departing/arriving planes, their fade/direction and
  bounded opacity remain mandatory. A RAF need not land in a 50ms interval.
  All route samples are retained before assertions, including failed cases.
- Review exact entropy candidates against public Git/source/artifact/checksum
  provenance. 581 exact additions (391 provenance plus 190 regenerated checksums)
  have independent review and a same-settings detect-secrets 1.5.0 scan with zero
  unreviewed non-RI findings. Preserve prior baseline entries, append only exact reviewed
  path/type/hash identities; do not allow arbitrary entropy or unknown values.

Focused regressions cover genuine missing-capability behavior, asynchronous
history restoration, unfinished native wheel, missed animated print triggers,
and invalid visible/premature/missing/duplicate native handovers. Independent
review confirms preserved geometry and substantive browser assertions.
Generation, fallbacks, previews, bundle and RI must be fresh for the new head.
The earlier paired Writing evidence belongs to source 0187dc9, not to these new
bytes; its supported optimization is retained, and the new exact head must pass
its own complete hosted performance gate.

## Acceptance and operation

The new source remains unaccepted until all full jobs and matching reports pass,
then stable alias verification and recovery recording succeed. Record the final
exact source/artifact/run/staging URL in #23 and issues #8/#12/#13/#14 before
merging. Preserve failures rather than treating successful data collection or
preview smoke as release acceptance. Stage while #23 remains open; merge only
after its lease-bound stable promotion. No new PR or custom deployment is needed.
