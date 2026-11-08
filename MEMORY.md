# Session memory

Dated continuity, not live authority. Last verified: **2026-11-08**.

## Snapshot

- Owning issue177 / Linear WEB-21, In Progress; branch work/issue177-article-analytics-20261108.
- Verified main and production refs fdfc8cb67a6f78996932d9688c563c53c21387f2; PR176 merged.
- HTTP article/loader receipt is in review/issue-177/2026-11-08-live-before.json.
- Live loader omits the article route; direct entry cannot start the SDK.

## Decisions

- User withdrew theme work: Poland had not reached the clock's19:00 boundary.
- Current authorized checkpoint: browser checks in existing CI + exact PR178 preview, then STOP/REPORT.
- No SEO implementation, staging promotion, merge or production in this checkpoint.
- Preserve original issue177 AC01-AC09; final Medium canonical remains owner-only after production.
- One validated public catalog admits article routes; no wildcard or manual pageviews.

## Open work

- Candidate producer admits public catalog articles and binds loader identity into document versions.
- Source report: review/issue-177/2026-11-08-article-analytics.md.
- CI42511286540 at06ffa6fc failed prepublication: 5/1245 source failures, carrier/oracle drift; format RI map.
- Bounded carrier-pin/oracle/format correction reviewed; no feature/scope change. Exact-source recheck next.
- Earlier133/133 scoped source checks passed; current full browser gate is still pending, not green.
- Initial missing-interpreter and stale-output failures are retained in the report.
- Real SDK-generated pageviews and aggregate collector receipt remain unobserved for the correction.

## Next session

1. Revalidate current issue/PR/ref and the report's completed checkpoint before new work.
2. Read final issue/PR receipts for exact-clean policy and Draft PR identity; do not assume deployment.
3. Stop/report; do not advance beyond the user's analytics checkpoint without new steering.
4. Later issue phases retain original SEO, full staging, production and owner Medium gates.

## Maintenance

- Five sections/120lines; issue177 report/PR owns detailed evidence and failures.
- Rebuild and verify RI after indexed source, catalog or memory edits.
- Keep actual collector receipt separate from VM/vendor-stub SDK admission.
- Never store secrets or private correspondence in memory.
