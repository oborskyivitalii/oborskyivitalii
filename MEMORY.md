# Session memory

Dated continuity, not live authority. Last verified: **2026-10-19** for R12 source; technical observations retain their dates.

## Snapshot

- Production/main remains3af9100989c7dd6edc18b0b94c2d59f177cfd465,
  accepted prod-2026-10-17.4. No publication or provider change in this step.
- Owner #5; same Draft PR79. Technical step1 reconciles its54f3a2c2 head
  with released main by normal merge; final source/run links live in issue/PR.
- Record: review/issue-5/2026-10-18-step1-reconciliation.md.
  Plan: review/issue-5/2026-10-18-release-segmentation.md.
- All54 starting files under drafts, site/publications, site/assets/publications
  and review/issue-2 retain their original Git blobs. No editorial changes.
- Current R12 canonical source SHA256: 46ff6a07e8f60119dcf6be352a3d642348c0c2b6f54f348b7b60d599f6f71276.
  Exact supplied R12 is in drafts; canonical differs only by the cover marker.
  Cover02 PNG import is pending; old illustration is not selected.
  Evidence: review/issue-2/pmday-candidate-20261015/README.md.
- Current-main release policy, legal owners, analytics, Cloudflare-only staging,
  native navigation corrections and source worker are preserved.

## Decisions

- User authorizes step1 only, report/reassessment, then small subsequent steps.
  That technical step excluded writing. R12 was separately authorized
  in the editorial conversation and is now the current article input.
- Preserve authored article/edition/media history. Consume the latest editorial
  handoff rather than changing its text or manufacturing acceptance.
- One static monorepo with versioned platform/templates/content/media artifacts
  and one atomic assembler remains recommended. No runtime microservices now.
- First reader integration is a platform change. Later content-only generation
  can reuse an exact compatible admitted platform; unknown/shared changes escalate.
- Full diagnostics stay optional under the accepted17October release policy.
  Staging derives labelled/noindex active HTML, removes prior unlabelled HTML,
  and retains immutable media. Color/source history remains separate.
- Declared candidate media is explicit pending review input, not licensed or
  publication-approved. Current release policy still requires article notices
  admission before a real hosted article can ship.

## Open work

- #5 AC11/12 retain independent and hosted/release gates. AC16–AC20 independent
  production lanes, version boundaries, media/assembly/concurrency remain open.
- Current R10 isolated HTML build fails the existing100000-byte article budget;
  synthetic source checks do not establish real-article preview readiness.
- Next technical increment: reduce reader overhead without changing text/budget,
  exact hosted-article rights/notices admission and
  current immutable HTML preview, using source supplied by the editorial chat.
- After preview acceptance: bounded platform staging and existing controller
  publication; then independent content/media production and real reuse proof.
- #2 original PDF/deck/upstream/editorial/publication gates remain separate;
  transferring source does not accept or publish the article.
- #102 analytics entry/article route coverage; #8/#103 Google/Windsor access;
  #104 conversions after the reader contract. MFA #97 is independent.
- #98/#99/#100 are separately selected, not first-article blockers.
  #6 harness and #11 guides follow the proven publisher lane.
- #39 final independent review remains open. #7/#13 shipped scope is closed;
  #45/#49 superseded; #101 Turnstile not applicable.

## Next session

1. Read issue5/PR79 final checkpoint; revalidate current head and production.
2. Resume the next user-selected technical increment. Do not repeat step1 or
   overwrite concurrent article changes from the other conversation.
3. Keep rights, actual hosted-reader acceptance and release decisions explicit;
   a successful source build is not an article publication event.

## Maintenance

Keep these five sections and at most120lines. Rebuild/verify RI after indexed
changes. Use live issue/refs for current evidence; never store secrets.
