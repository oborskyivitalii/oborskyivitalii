# R9 diagnostic result — requirements reconciliation and treatment preflight

Refs #169 / PR170. Independent Requirements & Acceptance readback, 5 November 2026. **The diagnostic failed and the normal footer journey remains a blocking acceptance defect. Proceed only with the bounded destination diagnosis/correction described below; do not waive the failure or admit the runtime family.** Original author production intent and release authorization remain unchanged.

## Actual retained evidence

Observed local source HEAD `3c532d2f23e9568e5d88b9b50139d45a4867829e`, tree `35b45f7b442a771fe646844cfec8c9c07dc0d786`, matching report source/candidate/workflow identities. Run42087148352 attempt1; original ZIP `/workspace/scratch/83aaf5811f83/tmp/r9-diagnostic-results/run42087148352.zip` independently matches supplied SHA256 `1b34f3a662b49ed7fea22e2bd2f2a68a066bfafdcddcc297490e16686d586e1c`. Its `r9-reader-runtime-probe.json` SHA256 is `d2ad9ba5fbf84c1198209525a2a433039a1318cac1e21e31c194ca4bf3525c5c`; adjacent `report.json` is byte-identical. Read raw report/context events and desktop Playwright trace, not peer verdicts. No duplicate full-figure visual review was performed.

The run used script `3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`, actual Linux Chromium153.0.8010.12,1440×900 and390×844 viewports, DPR1/light/no reduced-motion, raw Color fingerprint `985ca46ab97b36c59ae9b1491daee3788debda6eaf125ff11c645702b880aa4f`, input artifact digest `e5178af69a5357026f54eecab1ce954fd6b1c751048b085a4ea689235d8c44fb`. Report is `pass:false`, `fullGate:false`:16 cases passed,2 failed,10 unobserved; normal contexts failed, both no-JS contexts passed. The run ended after58.53s with no evidence errors. Initial exact-byte verification/start clean worktree passed; final byte/clean-source assertions were **not reached**, so they cannot be reported as completed.

## Failure and requirement/oracle defects

**High — native footer destination does not enter the requested next route; AC05/08/10.** Both normal-width `cycle-1-footer-next` cases time out waiting for Talks after the click. The actual footer control is `writing.html?view=talks`. Source `site/effects/flight.cjs:updateHint` unconditionally emits `?view=<route>`. In `site/engine/navigation.js:routeFor`, query-based `view` routing applies only when the embedded bundle exists; ordinary native route resolution uses the pathname and classifies this URL as Writing. Its click handler then follows the same-page branch. This is a concrete source/output mismatch consistent with the observation, not a proven browser scheduling issue.

Raw events strengthen that scope: each normal context has exactly two camera journeys/four block phases for Writing→article and Back; no new camera/departure phase follows the footer click. The footer already emitted real self-box start/end events during the earlier Writing departure/arrival at both widths. Thus the current failure occurs **before a new footer-driven route animation begins**; do not describe it as an absent animationend on an attempted third departure. The exact click trace and retained event streams justify destination diagnosis without another unchanged full run.

**Medium — diagnostic destination extraction is coupled to the faulty query representation.** `reader-runtime-probe.cjs` derives `row.destination` only from the footer URL's `view` parameter. After a correct native destination is emitted, that representation-specific assumption would fail before testing behavior. The oracle must instead express the original semantic obligation: the footer target identifies the next primary route under the relevant native/embedded routing contract, and activating it actually reaches that document with the required normal-motion events. Retain independent expected primary-route order and source-bound public route identity. Do not preserve a wrong query merely to satisfy the diagnostic.

## Carry-forward boundary

| Observed source-bound facts | Permitted reuse | Still pending / invalid inference |
| --- | --- | --- |
| Both widths' current R9 media/title/alt/caption/PDF/local-link checks, viewer open/Escape/close and related results passed | Retain original case records, asset/PDF hashes and screenshots. Unchanged text/image/PDF acceptance does not need another author decision or regenerated artwork. | These16 historical case passes do not supply a full normal reader/native or new-source diagnostic pass. |
| Writing→article and actual Back passed at both widths, including scroll/focus/URL restoration and animationend block completion | Evidence for those two transitions on source3c532d2 only; earlier footer self-box CSS events are concrete partial observations. | Footer activation→Talks, its Back, and all second-cycle normal journeys are failed/unobserved, not passed or inapplicable. |
| Both no-JS contexts and actual native links passed; errors/console/request failures were empty | Bounded local Chromium/light/DPR1 no-JS evidence for this exact input. Fixed PDF/media byte identity can carry where unchanged. | No physical-device, dark-theme, Firefox, live host/TLS/CSP, performance or release claim. Runtime/output changes require affected current-source integration checks. |
| Report/trace supply and initial input/workflow identity verified | Preserve the failed run and original ZIP/report digests. | Unknown family remains unadmitted; final public/source checks were not executed. No hosted/staging/production acceptance follows. |

## Bounded correction preflight

A correction to emit native footer destinations consistent with the existing router is within issue169's already authorized native/runtime release work. Preserve embedded/offline `?view=` semantics, primary-route order, current footer labeling/preferences, article exclusion, native link fallback, real history behavior and all motion/size/timeout/rights guards. Reuse an existing declared navigation/address owner where available; do not introduce another route registry or widen native query routing to mask the mismatch without reviewing its broader effects.

Before dependent correction, retain the above old-source failure and allocate a focused regression that detects the old wrong native destination and verifies the corrected destination, while separately preserving embedded/offline behavior. Update the diagnostic's destination oracle to the same semantic contract without tying it to a particular broken query encoding. This preflight accepts that requirement/oracle clarification; it does not author or accept the implementation/test.

Review changed effect/runtime producer and diagnostic bytes independently. Regenerate exact public/Color inputs; a changed effect changes runtime/fingerprint/artifact identity, so old normal-runtime observations cannot simply be relabelled. Then execute the same bounded28-case/4-context diagnostic on the new coherent source; require both complete normal cycles at both widths, actual self-box CSS start/end and no timeout-only completion, all intended rows and final input/source checks. Keep240-second script/10-minute job caps, fail-closed accounting, raw evidence and `fullGate:false`.

Do not rerun the unchanged failed campaign merely for a green result, increase the settlement deadline, omit footer/cycle cases, force Off/reduced motion or register a family on the strength of partial passes. After a genuine complete diagnostic result, actual runtime-family review plus original source/CI/hosted/staging/protected merge/production route remain required. No issue AC can be closed solely from this diagnostic result.

## Actual footer correction reconciliation — 5 November 2026

**No blocking requirements defect is found in the inspected correction. Proceed with the existing changed-source checks and the bounded diagnostic rerun once the coherent generated candidate is ready.** This source reconciliation does not turn failed run42087148352 into a pass and does not supply runtime-family/hosted/release admission.

Read actual working-tree delta against source3c532d2. Canonical navigation now owns private `routeHref(next)` for its already declared finite routes, using existing `address`, site directory and embedded-file inputs; exposed `SiteNavigation.href` and `go` share that owner. The footer consumer requires that API and uses its URL instead of constructing `?view=`. Native root/project/nested-snapshot cases receive their actual next document URL. Embedded/offline mode retains its one-document view-query address through the existing `address` owner. No parallel route registry, native-query reinterpretation, route-order change or motion/timeout fallback was added.

The corrected diagnostic independently derives the expected next primary route from current Writing state/itinerary and the source-bound public route inventory, checks its canonical native alias against site base, rejects the old offline-only query for this native input, and then still requires actual destination/body settlement and CSS self-box start/end. It does not use `SiteNavigation.href` as its own sole expected-value oracle. Script SHA256 `80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d` retains28 cases/4 contexts,240-second limit and nonadmission/failure accounting. This corrects the previously identified query-coupled oracle without weakening the promised next-route behavior.

New `tests/navigation.test.cjs` boundary test exercises actual source functions plus the footer hint in native root, project/nested and embedded file contexts. It round-trips every declared route and checks the old `writing.html?view=talks` still identifies native Writing, preserving a negative oracle for the observed mechanism. Independent bounded execution `node --test --test-name-pattern='end-scroll hint|navigation href|route href|footer' tests/navigation.test.cjs` passed2 selected cases (the new destination-rule case and existing missing-footer initialization case), zero skipped/failed. New diagnostic syntax check passed. These are focused source checks, not browser or complete CI results.

The publication/figure/PDF/rights and family compatibility owners have no working-tree changes in this correction; their unchanged byte/meaning observations can be retained historically. Native generation was in progress during review, so this report does not accept the complete generated output or a final clean source commit. Changed navigation/effect bytes require a new exact runtime/artifact identity and affected independent review. Complete the original existing mapped source checks and28-case diagnostic with the preserved failed run, then inspect all current raw results; no new author decision or extra release gate is introduced.

Inspected correction SHA256 pins:

```json
{
  "site/engine/navigation.js": "4cfcea740368dfcf9b19f189ccedd93b676df0383f7e29bed1c801b10dc82d24",
  "site/effects/flight.cjs": "3d05d1f26c3f6c791f2ef8777cb523af17ee5b4d7b502020c01d3c61c86bcb47",
  "tests/navigation.test.cjs": "d35f065159d3b446b017d737dc41f491af237355b2b39b198c7e0be96479aece",
  "review/issue-169/r9/reader-runtime-probe.cjs": "80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d"
}
```
