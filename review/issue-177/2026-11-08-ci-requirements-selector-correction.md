# Issue177 selector correction — Requirements & Acceptance continuation

2026-11-08. Reviewer `/root/issue177_ci_requirements`; correction continuation of my own preserved preflight/final results, not a newly fresh first judgment. No peer results, private conversation or author report bodies inspected. No implementation, external writes or delegation performed.

## Verdict

**PASS for this bounded source correction; no blocking requirements finding.** The selector now supports the actual immutable Writing link as well as the catalog canonical alias, while preserving the same seven-phase article identity/title/SDK oracle. Actual browser execution and exact preview verification remain pending; no whole AC closes.

## Exact inspected identity

HEAD `042a2eacd39b8ce6a6d780e2276182e60c3b2d3d`, with an uncommitted correction to `tools/quality/analytics-browser.cjs`, SHA-256 `9616632ec74ceabe805cf0d9214cd33bc9774c2db6e6fff1721c1a7652ea8907`. Inspected actual source diff against HEAD and relevant unchanged producer/router sources. Other working-tree report files were not read as review evidence. This is a prepared delta, not a clean committed candidate.

## Findings and treatment verification

The previous canonical-only href lookup did not match the producer's immutable Writing snapshot link. Independently inspected `tools/site/articles.cjs:394`: `immutableLinks` rewrites catalog article URLs to exact article snapshots. The emitted current `docs/site-revision.json` descriptor identifies `sdlc-out-of-balance:en`, canonical `articles/the-sdlc-is-out-of-balance.html` and exact digest-addressed snapshot. A read-only extraction of the emitted Writing snapshot confirmed its publication-title points to that snapshot, rebased as `../../article-snapshots/...` in raw snapshot HTML. `site/engine/navigation.js:107–130,1013` resolves fetched resources then rebases them for the mounted principal Writing URL. The correction's root-relative-to-site snapshot href therefore corresponds to the mounted Writing link rather than blindly matching raw snapshot bytes.

The new selector derives its snapshot from the compiled fixture's own `docs/site-revision.json`, requires descriptor alias equality with the validated catalog article route, constrains the snapshot path to the digest-addressed article form, and requires exactly one `a.publication-title` matching canonical or exact descriptor snapshot href. This is a finite source-bound lookup; it does not broadly accept arbitrary article links or substitute a different reader. Canonical/reload/extensionless entry probes still target their original URLs. The subsequent actual body article key, h1 and SDK count checks still identify the intended article after click, Back and Forward. Missing descriptor, invalid snapshot, missing/duplicate link or wrong reader still fails.

No requirement/oracle has been weakened. Read-only selector inventory reports the same intended current article, seven observation phases, full 13 analytics cases/engine and staging 7 cases. No workflow, matrix or budget change is in the inspected correction. No browser execution occurred in this review.

## AC impact and evidence limits

| AC | Result supported here | Remaining gate |
| --- | --- | --- |
| AC01 | Actual source mechanism explains the overly narrow prior selector; corrected lookup matches producer/router contract. | Current-source checks and complete execution evidence. |
| AC02 | Canonical/alias/reload and internal/history oracle unchanged; selector now exercises the existing emitted publication-title route. | Real browser result; later SDK-generated pageview and real provider semantics. |
| AC03 | No isolation, suppression, vendor stub, unsupported-route guard or ordinary-reader contrast changed. | Required current browser/isolation evidence. |
| AC07 | Bounded source correction is acceptable within existing authorized evidence-only CI checkpoint. | All required exact-candidate checks/reviews, immutable preview/artifact identity and observed CI/browser results. |

The supplied cancellation of run42510243025 before upload/browser execution is a cancellation, not a browser failure or pass; I did not independently fetch its run logs. Preserve it with the static selector diagnosis and changed-source identity. A corrected source run is informative because the producer/consumer mismatch is now evidenced; it cannot be reported as a successful rerun until actual execution completes. All original AC01–AC09 remain open and the authorized sequence still ends with exact preview/browser report, before stable promotion, merge or deployment.
