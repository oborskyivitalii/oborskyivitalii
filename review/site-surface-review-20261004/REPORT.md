# Surfaces and synchronized arrival — 4 October 2026

Owner: #14, runtime audit #12, maintained gates #13; Draft PR #10.
Authorized input/treatment: #14 comment 5978478114 and the maintainer's same-day
request. Baseline `f89a204a08e842ef5490edd78934196601043be8`, public digest
`45bf8189b9977a712b520434ba3224d740ea942ddbfe9a3c36610604f131a784`.
The private screenshot reports Talks inside the ChatGPT iPad preview. The local
reproducer uses Chromium 154.0.8037.92; it does not identify that embedded browser
or substitute for a physical iPad test. Attached research manuscripts are outside
this presentation/runtime scope; no publication claim or edition changes.

## Confirmed findings and treatment

| Finding | Baseline evidence | Correction |
| --- | --- | --- |
| Header ends before viewport edge | At 1366 px, rectangle spans x=103 to1263; 103 px unpainted right gutter | Full-width sticky surface; inner controls retain the original aligned gutter |
| Hard text-panel edges | Reading surfaces use a flat 86–91% paper rectangle | Feather only the backdrop beyond the protected text area, with static gradient masks; preserve glyph opacity and visible scene |
| Text arrives before camera | Research fully visible at796ms while scene still flying; independent150/480ms text timers | Renderer reports progress after successful paints; exit0–18%, hidden18–72%, entry72–100%; no extra timer/RAF |
| Forward loses early scrolling | Scroll400 immediately after page-ready; after750ms history still stores0 | Save matching rendered route positions during flight and after completion; reject saves into a different pending history route |
| Retargeting flashes hidden text | A second route request cleared the in-flight opacity before starting its next departure | Preserve the displayed departure opacity, including zero; same-route cancellation uses the common flight lifecycle |
| Reduced-motion event race | A route can be requested after the media query changes but before its queued event; cancelled flight stays frozen as flying | Read current media state before travel and avoid cancelling an already stationary route on the redundant event |
| New main requires renewed resize observation | Persistent observer previously bound before content replacement | Reattach on route refresh; disconnect the previous main |

The text transition follows actual painted progress, not wall time. Capped frame
steps therefore delay both the camera and text together during stalls. Destination
content mounts while hidden; header remains usable. Hidden/print/Off/reduced and
render failure finish text immediately so content cannot remain invisible/inert.
The browser test waits for the requested media preference to be applied before
asserting a newly selected static route. Protocol acknowledgement alone can
precede that update in WebKit; an actual mid-flight preference change correctly
freezes the last displayed camera instead of requiring an arrival.
Static-route assertions also wait for the destination's painted route: the
absence of a flight does not mean the scheduled destination paint has run.
Print explicitly prepares a newly mounted filtered Writing archive in the same
print event. Rapid requests abort obsolete fetches and detach obsolete callbacks.

## Security and stability inspection

Inspected route matching, fetch/parse/mount, history and fragment handling,
archive listener cleanup, renderer lifecycle/cache bounds, stylesheet/export
construction and existing scanner/release policies. Routes remain an explicit
same-origin allowlist; modified/external/download links retain native behavior.
Only owned static HTML or the generated embedded bundle supplies imported DOM.
Query/filter strings are not executable HTML sinks. A compromised owned HTML
origin is outside this router's trust boundary; DOMParser is not a sanitizer.
No new runtime package, external resource, eval or dynamic code generation is
introduced. Fetches remain abortable and time out at8s with native navigation
fallback. The geometry cache is bounded to three rooms and one animation loop.

Current automated evidence must be source-bound and is recorded in the PR/issue
completion comment after checks finish. Historical baseline:30 Lighthouse runs,
15 idle/scroll profiles and300s soak passed; those did not quantify route-flight
costs. This increment adds30 measured flights,120 repeated route changes with
DOM/listener comparison, painted-progress text assertions, interruption/early
scroll/header regressions. Missing flight reports or resource growth fail the
maintained gate; existing performance/security thresholds are unchanged.

## Acceptance checklist

- [ ] All Node/Python, lint/security/advisory, export/SEO/RI checks.
- [x] Thirty local Day/Night opening views at390/1024/1440px; no overflow.
  Mobile decoration containment was corrected after the first candidate exposed
  a24px overflow; a specific display-contents pseudo-element override and a
  clipped body formatting context keep feathers outside the scrollable area.
  Contrast is repeated on the final source by CI.
- [ ] Three-engine and native-OS functional/navigation cases.
- [ ]30 startup runs,15 sustained profiles,30 flights and300s soak.
- [x] Five updated standalone HTMLs pass isolated Chromium navigation/filter/reload.
- [ ] Independent review, physical iOS/Android and actual hosted-origin evidence.

This is implementer review, not an independent security certificate. The full
production gate must continue to block missing independent/device evidence.
Staging remains unconfigured. No merge, production, DNS, payment or rights
acceptance is implied by local/CI results.

## Continuation — opacity serialization, 4 October 2026

The maintainer requested the final interactive HTML with all five routes usable.
The `d15fbee` evidence run passed performance and macOS WebKit but the Windows
Firefox mobile Day navigation case failed `no premature full text`. A direct
browser probe confirmed that CSS serializes opacity `0.9999999` as `1`.
The incoming fade now stays at or below `0.999` until the renderer reports the
actual arrival paint. The existing strict timing assertion is retained.

All five interactive copies, the export manifest, offline bundle manifest and
RI context are regenerated. Local validation passes 76 Node and 18 Python tests,
SEO preservation, fallback/export/bundle freshness and RI verification.
The standalone delivery includes embedded route documents and portrait assets;
opening Home is sufficient for navigating the whole site without a server.
New browser/CI results are recorded separately in PR #10 and #14; earlier
performance/native-platform results are baseline evidence, not acceptance of
the amended runtime. Production, independent and physical-device gates remain.

The subsequent static run passed lint, Semgrep and Bandit, then stopped on 13
new entropy findings in the regenerated preview and offline-bundle manifests.
Each was matched to its hashed-only finding and recomputed from
the relevant current file or deterministic ZIP. Exact path/type/hash records
are appended to the existing baseline; all prior dispositions and scanner
rules are retained. This is implementer checksum triage; independent review
is still pending and no credential exception or whole-file exclusion is added.
