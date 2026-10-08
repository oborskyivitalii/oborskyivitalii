# Session memory

Dated continuity, not live authority. Last verified: **2026-10-08**.

## Snapshot

- Checked main `a56b62751f3c0f7e295db07bfc23201dd838510b`: R1 PR #57 is merged;
  issue #56 is closed with all six ACs checked. Pre-merge source/acceptance/preview
  and post-merge Basic, parity and navigation/RI CI pass. Exact source/run evidence
  belongs in [#56](https://github.com/oborskyivitalii/oborskyivitalii/issues/56).
- Standards PR #55 is merged; #54 is closed for audit/guide/guard/plan delivery.
  [CODE-STYLE](guides/CODE-STYLE.md), CS01-CS10 and the bounded guard are active.
  [Original R0-R6 audit](review/issue-54/2026-10-08-analysis.md) stays dated evidence.
- [#58](https://github.com/oborskyivitalii/oborskyivitalii/issues/58) owns complete
  R2-R6 refactoring acceptance. R1 is complete; remaining criteria stay open.
- [PR #60](https://github.com/oborskyivitalii/oborskyivitalii/pull/60) now advances
  R2–R6 in one continuing Draft under issue58. The maintainer approved this on
  2026-10-08: preserve reviewed phase checkpoints; one final merge/main gate.
  [Single handoff](review/issue-58/2026-10-08-handoff.md#current-continuation--same-pr-2026-10-08).
  Verified R2 is immutable `8c6cf877fee92b4d2493b4c1a07df7080b987c29`, tree
  `2725ae4743032b2aeaafd7f2d7f7c91a08265906`; CI/scans/independent review pass.
  AC02 and R2.1–R2.6 are checked; R2.7/final criteria remain open. R3–R6 underway.
  Issue59 remains superseded/closed; retain its dated history.
- PR #51 content/formula/shared reading-backdrop changes are merged and preserved.
  #15 is closed for the earlier engine/content increment; R3 extends its owners.
- #49 is the sole open fragment-flight owner; #50 is closed as its duplicate.
  Draft PR #53 is active; #52 is closed/superseded, with both PRs linked to #49.
  Fragment-flight remains outside refactoring scope.

## Decisions

- One issue58 owns stable AC01–AC10 and phase progress. User-approved revision:
  continue R3–R6 in the same Draft PR60 using exactly one `Refs #58`; no interim
  merge or child issue. Preserve separate phase commits/checks/reviews; final
  maintainer merge decision and actual-main checks remain before closure.
- Read CODE-STYLE before edits; review unautomated rules. Frozen #54 debt cannot
  grow; trim removed exact allowances.
- R2 uses exact Prettier 3.6.2 and Ruff 0.16.10, alongside existing free
  ESLint/SonarJS, Stylelint and security tools. Formatter scope currently includes
  245 maintained inputs: JS 140, CSS 2, HTML 26, Python 26, JSON 34, YAML 17.
  Strict HTML whitespace, embedded formatting off, LF, 100 columns and explicit
  exclusions are checked; missing/untracked/ignored/misclassified sources fail.
- Preserve R2 mechanical proof at the frozen 8c checkpoint using its own tools
  and controls against original2138131. Final R2 parity: 245 maintained/187
  compared/172 changed, 49 reviewed controls/9 new. Current formatter/coverage,
  lint/security/identity/budgets stay permanent; later phases need their own
  semantic contracts. No expanding formatting exclusions for intentional changes.
- Base variant descriptor fingerprint and runtime engine hash already differ at
  baseline `2138131`. Preview/staging consumers must read the canonical variant, retain
  Color fingerprint equality and compare DOM engine with `manifest.components.engine`.
  Four consumer/test adapters and the isolated alias negative are reviewed R2
  controls; Base/Color smoke pass with honest original checkpoint identities.
- Ordinary generation adapters now accept equivalent formatted markers, void tags
  and tag endings without changing raw payloads, inline boundaries or size limits.
  Writing is 99,879 bytes within its original 100,000-byte limit. Exact SEO block
  canonicalization, diagnostic token anchors and CI dependency sequencing have
  named control dispositions and negative tests; they are intentional control edits.
- [Paired visual evidence](review/issue-58/2026-10-08-visual-parity.json) records eight
  pixel-identical Home/Writing Day/Night pairs at widths 1440 and 390, with matching
  text/links/geometry and stable dirty-tree observation. Motion is off/reduced;
  it does not prove every route, Color interaction, device or production performance.
- RI/CI maps 14 checks over 12 layers, including maintained source quality.
  R3–R6 need refreshed RI/security/source-bound evidence after integration.
- Native factory formatting changes serialization/hashes. Preserve executable
  and semantic parity; regenerate legitimate identities. Independently review
  exact complexity/Bandit/public fingerprint refreshes without changing original
  limits, expiry, immutable baselines or removal ownership.
- Versioned [scanner proof](review/issue-58/2026-10-08-scanner-rebinding.json) and
  [Bandit proof](review/issue-58/2026-10-08-bandit-rebinding.json) record equivalent
  existing dispositions: same Ribbon 52/25 warning and 36 Bandit findings over six
  finding sources. They explicitly leave final security/public checksum admission
  pending in that proof; later actual scanner/run evidence belongs in PR60/#58.
- R3 owns records/prose/templates, R4 static CSS, R5 cohesive runtime/build
  seams and R6 demonstrated hotspots plus final integrated acceptance.
- Preserve content/URLs/paint/camera, incremental/no-JS/offline contracts,
  one scene clock, cancellation/cache bounds and original resource budgets.
- PR smoke/targeted, bounded staging and production retain separate profiles.
  Native macOS WebKit/device/rights/release gates stay with release owners.
  Later merge/promotion/publication needs its applicable maintainer decision.

## Open work

| Issue | Remaining intent |
| --- | --- |
| #58 | Full R2-R6 execution and final acceptance; R1 is complete. |
| #58 / PR #60 | R3–R5 implemented/reviewed; R6 measurements, clean integrated CI/staging and final merge/main verification. |
| #48 | PR51 merged; fetch remaining acceptance rather than restore old prose. |
| #49 / Draft PR #53 | Implement the consolidated fragment-flight plan; #50 and PR52 are closed duplicates/history. |
| #45 / #36 / #41 | Original visual, paired, editorial/device and release gates. |
| #1 / #13 | First release, physical devices and production/recovery acceptance. |
| #8 / #39 | Production URL/indexability, domains and analytics activation. |
| #7 | License and editorial/third-party rights. |
| #5 / #6 | Article HTML/PDF edition and cross-repository adapter. |
| #2 / #11 | PMDay edition and post-launch buyer-intent guides. |

## Next session

1. Fetch main, issue58 and DraftPR60; compare refs with immutable R2 checkpoint.
2. Read current R3/R4/R5 implementation/review sections; preserve frozen R2 and
   generation/ownership contracts while finishing the integrated evidence.
3. Complete paired R6 measurements after candidate stabilizes, then regenerate,
   refresh catalogs/RI, scan and verify one exact clean integrated candidate/CI.
4. Reconcile whole AC boxes and evidence; merge only on final maintainer decision.

## Maintenance

Keep these five sections within 120 lines; rebuild RI after changes. Detailed
source/run/review history belongs in its issue/PR artifact. Never store private
correspondence, credentials or inferred approvals.
