# Connected navigation — execution checkpoint, 4 October 2026

Scope follows the maintainer's request in #14 comment 5975175207 and TASKS.md.
The initial implementation is `aaf0a74f61601ad501a52aada9fb278d7c958dbe` in Draft
PR #10. Current result comments on PR #10 and issues #14/#13 supersede this
checkpoint; CI evidence must identify the actual candidate and public digest.

Implemented one persistent document shell, all five route contents/metadata,
fixed 128-unit world spacing, lazy two-room projection and bounded model cache,
reversible flights and text fade. Four shared angular symbols form 56 recursive
objects alongside each page's eight thematic motifs. Off/reduced, hidden/print,
native scrolling, direct HTML and SVG fallbacks retain their previous contracts.

Every v11 interactive HTML embeds all five route payloads and assets. Five
individually copied/renamed files were opened through file URLs in Chromium;
Research/Writing navigation, selected topic and reload restoration passed without
sibling files. A current-source video records Home → Research → Writing and
two browser Back transitions. A 2400px viewport and an empty Writing result
confirmed that destinations settle in their own room rather than the departure.

Initial preflight passed 71 Node and 18 Python tests, exact SEO reconciliation,
export/ZIP/RI freshness, size budgets, 20 Chromium normal cases and four navigation
cases. CI build and static quality/security/advisories passed. The initial Linux
worker stopped in the controlled hosting model: its pre-SPA assertion inspected
the URL immediately after click, before the text fade committed the destination.
Inspection also found that extensionless initial URLs needed explicit route
recognition for Back. The follow-up adds bounded destination waits, retained-shell
checks and extensionless history checks, plus short/empty room regressions.
The follow-up passes 72 Node checks and the complete local controlled-host model
(20 normal views, 10 fallbacks and archive history). A Linux WebKit navigation
case passes as well. The shell assertion now compares the actual Document object
alongside header, Canvas and controls instead of using clock-origin equality as a
proxy; the macOS rerun remains required. The flight state is published when the
journey starts so consumers cannot mistake the previous paint for arrival.

The source HTML keeps publication text, SEO and attribution exact. Review copies
are noindex; no research source or rights decision changed. Runtime/quality budgets
were not relaxed. Exact generated SHA256 baseline entries are identified by
path/type/hash; the existing independent-review requirement remains open.

Staging remains unconfigured as stated by the maintainer. No provider, production,
domain, payment or merge action occurred. Physical iOS/Android and independent
review are outstanding; Playwright engines and mobile viewports are not substitutes.
