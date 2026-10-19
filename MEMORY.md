# Session memory

Dated continuity, not live authority. Last verified: **2026-10-19**.

## Snapshot

- Verified main/production:0098f804cb3b0d120173d4c8689043db42231c47.
  .ai production and .com redirect remain owned by #39/#8; no release here.
- Active Draft PR107 / #106: reusable article campaign/public materials plus
  authorized event campaign adapter, offline promotion kits and calendar export.
- Concurrent material/campaign corrections are committed at c7877983ad64480e152d8abbeac97e2a80f2ccc2.
  Its tree matches earlier a68af7d; do not overwrite those corrections.
- Event implementation and self-review:
  review/issue-106/2026-10-19-event-preparation.md and guides/EVENT-DISTRIBUTION.md.
- First real consumer #108: drafts/events/pmday-winter-2027. One authored English
  announcement; five later pieces explicitly planned. Session/deck remain unknown.
- Article/reader work remains PR79 / #2 / #5. Do not alter its manuscript or
  promote it as part of campaign tooling.

## Decisions

- Maintainer approved event source, event-relative/exact dates, typed CTAs,
  presentation-derived promotion, per-piece EN/UA and kit/ICS export on19October.
- #106 / PR107 owns generic preparation; #108 owns real PMDay content and Talks.
  Original article campaign AC02–AC11 remain open and are not replaced by events.
- Calendar output is a file with stable UID/revision, not an account write or
  LinkedIn scheduling. Plain calendar imports may duplicate in some apps.
- Working inputs/kits stay repository-only unless explicitly selected for public
  publication. Actual posting and author/editorial/rights decisions remain manual.
- No paid promotion/services/inference, social credentials or private outreach.

## Open work

- Reconcile current source/CI and independent re-review of F01–F03 corrections;
  old green checks cannot establish those defects were resolved.
- Event source/calendar/kit behavior is implemented; exact-head evidence and
  rendered first announcement kit are linked in the owning PR checkpoint.
  Independent/author/mobile/rights and locked-browser CI gates remain separate.
- The locally locked Chromium download returned invalid ZIPs. A separately
  identified Chromium138.0.7204.0 rendered three card types and rejected overflow.
  That diagnostic is not locked-CI or physical-device acceptance.
- Complete original six-piece article campaign, three carousels, channel review,
  shared actual publication/correction history and D+7/D+21 templates under #106.
- Implement #108 Talks announcement independently; later confirmed title/slot/
  deck updates need revalidation and actual content review.
- Analytics/source-access follow-ups retain #102/#103/#8/#104; this work changes
  neither their evidence nor external account state.

## Next session

1. Revalidate PR107 head, main, owning #106/#108 and exact source/check evidence.
2. Review first event kit; confirm only actual event details. Reuse the canonical
   deck when available instead of substituting the September PMDay presentation.
3. Continue original campaign work and focused independent review in same owners.
4. Merge, stage or publish only with applicable maintainer decision and gates.

## Maintenance

- Keep five sections and120-line cap; rebuild RI after indexed changes.
- Git-backed code and campaign artifacts are not duplicated into file storage.
- Never store private correspondence, credentials or speculative publication state.
