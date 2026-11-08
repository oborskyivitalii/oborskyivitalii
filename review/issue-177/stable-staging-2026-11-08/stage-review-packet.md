# Stable staging review packet
Original owner issue: https://github.com/oborskyivitalii/oborskyivitalii/issues/177
Original issue intent and ACs (dated fetched state; subsequent authorization below takes precedence):
## Goal / execution owner

Ship a **measurable, discoverable and correctly cross-linked edition** of the new SDLC article without disturbing the existing site architecture or publication flow.

**Article on author site:** https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html  
**Published Medium edition:** https://aiadvances.org/the-sdlc-is-out-of-balance-beyond-the-ai-code-review-bottleneck-ca64e0b10b99  
**Writing index:** https://vitaliioborskyi.ai/writing.html

**Intent for Sol:** implement and validate **everything that is under repo/site control**, move it through the established preview → full stable staging → production route **only with maintainer authorization at the established gates**, then **REMIND THE MAINTAINER TO COMPLETE THE FINAL MEDIUM CANONICAL CHANGE PERSONALLY**. This last external manual step is deliberately **last**, after a verified live production URL; do not mark the entire issue finished before owner confirmation.

**Scope boundary:** This is a publication-specific follow-up to [#159](https://github.com/oborskyivitalii/oborskyivitalii/issues/159) (shared SEO/analytics owner), [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) (Search Console/indexing), and article publication [#169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169). Reuse their infrastructure, tests, reporting, publication/admission workflow and decisions. Do not start a parallel SEO engine, analytics service, CMS, or new Search Console setup. Historical profile consolidation [#162](https://github.com/oborskyivitalii/oborskyivitalii/issues/162) is a **different Medium page** and does not substitute for this article's canonical handoff.

## Observations / initial defect hypotheses — 2026-11-08 (NOT implementation proof)

- Cloudflare RUM observed **2 pageviews** of `/articles/the-sdlc-is-out-of-balance.html` in the recent query; do **not** treat this number as an accurate readership total. Writing had 17 in the same detailed interval.
- The checked `main` generated `docs/runtime/.../analytics.js` has a finite production path allowlist for `/`, `/index.html`, `/research.html`, `/writing.html`, `/talks.html`, `/credits.html`, but **not the new article route**. Because the loader returns on an unsupported path, direct article entry can be untracked. The same generated article HTML includes the loader. Confirm current production's actual served bytes and source generator before changing anything.
- `docs/writing.html` does link to both the site article and published Medium edition. Keep this working link.
- The generated article page's JSON-LD identifies an Article and author, but the inspected source lacks a `datePublished` and explicit HTML `rel=canonical`. The inspected article has no direct link to the new Medium edition. The generated Home/Research paths do not provide a direct contextual link to this specific article. Reconfirm these observations on current source and live production; no speculative claims about what Google has indexed.
- **Do not assume the sitemap/robots are absent:** prior #8 evidence found an actual live `/sitemap.xml` and `robots.txt`. Check their **current coverage for the new article** rather than creating a duplicate sitemap or changing the domain/DNS.
- Historical analytics are sampled; geographic traffic/referrers do not prove source, readership, human identity, or conversion. Existing test isolation from #159 must be retained. Organic rankings and new backlinks have **not** been verified.

## Ordered work plan — Sol-owned until the final human step

### A. Current-source audit and test-impact plan (before implementation)

1. Read `AGENTS.md`, `CONTRIBUTING.md`, `MEMORY.md` (dated handoff only), source/SEO/analytics/article/release contracts, #159/#8/#169 latest statuses and the active production release; identify **editable source owners**, not generated `docs/`.
2. Record a compact route/edition matrix covering **direct article URL**, Home→Writing→Article, Research→Writing→Article, extensionless alias if supported, reload/back/forward, staging/preview/offline, and Media/Medium outbound paths; classify what works, what is uncertain, what is broken.
3. Review impacted existing test profiles/fixtures/route registries **before running the full staging campaign**. Update, remove or replace obsolete hard-coded article/PR79 assumptions in affected tests *based on actual route contracts*, not to silence failures. Keep coverage and budgets; run targeted tests first. No blind rerun cycles.

### B. Fix article analytics without inflating synthetic traffic

4. Extend the **source generator/production allowlist** (likely `site/integrations/cloudflare.cjs` and associated site route registry; verify actual owners) so the **current article and future accepted article routes** can load the Cloudflare beacon on the canonical production origin; use a **bounded, validated route registry**, not an unrestricted `/articles/*` wildcard without assessment.
5. Exercise direct production article entry, internal SPA navigation, back/forward/reload, fragment/query handling and equivalent declared URL forms. Confirm **one SDK instance and one logically intended pageview per navigation**, not double counts. Verify real receipt separately from stubbed assertions.
6. Preserve test/QA isolation introduced in #159, origin guards, staging/preview/offline suppression, privacy, fail-open navigation on blocked analytics, source binding and existing analytics reporting semantics. No spoofed visitor totals, retroactive correction of prior counts, or ranking claims.

### C. Complete article SEO and author/entity graph

7. Add a proper **self-referencing absolute canonical** on the *author-site article* (not the Medium URL), with stable full article URL / `og:url` only as supported by the current SEO owner; align page metadata, JSON-LD `@type: Article`, absolute `url`/`mainEntityOfPage`, and stable site author `Person/@id`. Populate `datePublished` (and `dateModified` only if supported by actual revision facts) from truthful authored publication metadata, not a guessed date.
8. Strengthen discoverability *contextually*: Home and Research → this article as an important current SDLC publication; retain Writing → article and Writing → Medium; add **one clearly labeled Medium edition link from the author-site article**. Preserve existing article-specific research citations/rights; avoid keyword stuffing, duplicated article bodies, and unsolicited site redesign.
9. Inspect live **robots, sitemap and canonical policy**, existing #8 GSC property, search-visible HTML/no-JS behavior, OpenGraph/Twitter fields and structured-data validity. Add article URL to existing sitemap only if missing, via source generator. Work with #8 on a dated new-article Search Console page/query/URL-inspection checkpoint; report unavailable inspection separately, **never equate sitemap inclusion with indexing**.
10. Ensure the graph keeps one author identity and differentiates **original site edition vs published Medium edition**, linking the two accurately. Do not introduce unverifiable `sameAs`, institutional endorsement, duplicate content signals, or schema attributes not supported by the page.

### D. Acceptance and release

11. Regenerate dependent `docs/`, manifests, hashes and applicable review kits; link relevant issue acceptance to source/evidence. Require clean-context independent requirements/source/browser reviews per `CONTRIBUTING.md` and current acceptance mapping. Note impact on test profiles, update affected tests first.
12. Run bounded Basic and relevant SEO, structured-data, analytics, article/direct-route, navigation, QA-isolation, accessibility and no-JS checks; add negative cases (staging suppression, unsupported route, double beacon, blocked vendor, missing edition metadata). Preserve logs and diagnose failures before another campaign.
13. Follow repository's **preview → user review → stable staging/full gate → user review → authorized production** controls. Verify actual production URL, resulting rendered HTML and links, canonical, article included in existing sitemap, SPA + direct-entry telemetry and QA isolation. Record source/commit/artefact/deployment identities and exact receipts. The user, not CI or Sol, authorizes production. A local/generated pass is **not** live proof.
14. Record a *reproducible*, fixed-window Cloudflare before/after report that clearly distinguishes `pageviews`, `visits`, bots, known/unknown referrers and historic sampling; mark pre-fix article counts as **incomplete**, no causal uplift attribution. Maintain a separate later #8 Search Console check after search-provider reporting lag.

### E. **FINAL STEP — USER ONLY (Medium canonical); Sol must remind, not perform**

15. **Only after the new author-site version is VERIFIED LIVE**, Sol must put a highly visible `ACTION REQUIRED — OWNER / MEDIUM CANONICAL` in the PR final handoff and issue comment, with:
    - the exact site original: `https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html`
    - the exact Medium edition: `https://aiadvances.org/the-sdlc-is-out-of-balance-beyond-the-ai-code-review-bottleneck-ca64e0b10b99`
    - a short manual checklist: log into the Medium article's editor/publication settings; find canonical / advanced SEO option **if available to this edition**; point it to the original site URL; save/publish; inspect the live Medium page's actual `rel=canonical` after the change; report result or UI restriction.
    - explicitly ask the maintainer to confirm **DONE / UNAVAILABLE / DECIDED NOT TO SET**. If unavailable or inapplicable, preserve explanation and owner decision; **do not silently claim success**.
16. **Do not set or modify the Medium canonical on behalf of the maintainer**; no external account/browser edits. Do not close this issue as fully complete while this manual handoff is pending. Sol must **remind again in the final completion message after production** and leave an open checkbox/record until owner response. The previous Medium professional-profile task (#162) is separate.

## Acceptance criteria (all begin OPEN; record AC → exact check → evidence)

- [ ] **AC01 — Audited ownership and test impact.** Current live/source route, SEO and analytics gaps are verified; affected tests updated before launching full gates.
- [ ] **AC02 — Correct direct article measurement.** Live direct article entry + supported internal/SPA/reload paths produce intended pageview semantics, exactly one SDK; no blanket host/route admission.
- [ ] **AC03 — Safe analytics isolation.** Synthetic/staging/offline/unsupported routes do not contaminate production collector; fail/blocked-vendor scenarios and valid ordinary readers are covered.
- [ ] **AC04 — Site-original SEO.** Article self-canonical, verifiable date/author Article metadata and appropriate OG/social fields render from authoritative source; identity graph is consistent.
- [ ] **AC05 — Discovery links.** Relevant Home/Research links, existing Writing links and new article→Medium edition link work in desktop/mobile/no-JS; content and claims are preserved.
- [ ] **AC06 — Search infrastructure.** Existing sitemap/robots are retained and actual article inclusion, canonical URLs and indexability are live-verified; #8 Search Console check is linked as observation or explicitly pending.
- [ ] **AC07 — Checks and release.** Independent reviews, impacted tests, exact source-controlled preview, stable staging and separately owner-authorized production pass with documented evidence.
- [ ] **AC08 — Honest measurement baseline.** Before/after reporting defines windows, filters, sample weights, QA contamination, missing referrers and limitations; no unsupported readership/search claims.
- [ ] **AC09 — FINAL OWNER MEDIUM ACTION.** Sol has explicitly reminded the maintainer *after verified production release*; owner has personally set/verified the Medium canonical OR explicitly recorded an accepted unavailable/not-applicable decision. **This AC cannot be checked by Sol alone.**

## Not included

A redesign, domain/DNS migration, extra analytics vendor, new Search Console property, fake/guaranteed rankings, automatic Medium changes, silently deleting old content, blanket test skipping, or changing editorial/scientific claims without separate acceptance.

**Work is not authorized merely by creating this issue**: it is a detailed Sol handoff. Follow existing user-controlled release gates and link PR/commits `Refs #ISSUE`.



## 2026-11-08 — Active work: article analytics; stop and report

The maintainer withdrew the automatic-theme investigation after recognizing that Poland's local time had not yet reached 19:00. **Theme investigation, theme changes and former AC10/AC11 are removed from scope.** No theme implementation was changed. AC01–AC09 retain their original IDs and obligations.

**Current authorized checkpoint:** investigate and implement the article analytics work in original section B, preserve QA/staging/offline isolation, run applicable bounded source/browser checks and independent reviews, then **STOP AND REPORT**. Do not continue into SEO/discovery changes, staging promotion, merge or production deployment in this checkpoint. The other original issue work remains open.

**Execution order for this checkpoint**
1. Revalidate source/production identity, analytics owners, admitted article routes and affected test/profile inventory; independently review requirements before dependent implementation.
2. Confirm direct-route admission and navigation/pageview behavior, separating generated/source observations, actual served bytes and real collector receipt.
3. Correct the source-owned analytics route admission using existing validated publication metadata and preserve origin/QA/vendor guards; update impacted tests before broad execution.
4. Regenerate dependent output and RI, run targeted analytics/navigation/isolation checks and applicable Basic/owning checks; complete distinct requirements, code, white-box and exploratory reviews.
5. Record exact source, implemented behavior, results and unresolved live/provider gates in the Draft PR and this issue; **stop for the maintainer's review**.

**Style subcondition of AC07:** apply CS01–CS10 to touched analytics/build/test owners, run the bounded code-style guard and relevant checks, and independently review rules outside that guard. Keep a single authoritative route/analytics owner; no wildcard article admission, extra vendor, parallel pipeline, blanket exclusions or relaxed budgets.

**Baseline:** main and production refs `fdfc8cb67a6f78996932d9688c563c53c21387f2`; PR176 merged. Live deployment identity must be checked separately. Synced Linear WEB-21 remains In Progress.


### Analytics checkpoint handoff — 2026-11-08

Stopped at Draft [PR178](https://github.com/oborskyivitalii/oborskyivitalii/pull/178), source `8371746dce7eeda64c8662a21bc82c25bf772d2d`. [Versioned checkpoint](https://github.com/oborskyivitalii/oborskyivitalii/blob/8371746dce7eeda64c8662a21bc82c25bf772d2d/review/issue-177/2026-11-08-article-analytics.md); [exact-clean policy receipt](https://github.com/oborskyivitalii/oborskyivitalii/blob/b567be1fed0cf7281fab4ee860c9cd5704fac11d/review/issue-177/2026-11-08-exact-source-policy.json): 5/5 named checks pass, native133/133. Browser interaction remains BLOCKED / NOT OBSERVED after socket EPERM and automatic approval rejection. All original AC01–AC09 remain open; no staging/merge/production/SEO/Medium step occurred.

## Current owner authorization (2026-11-08)
User: “Ок тоді веди в стейбл стейджинг”. Move PR178 analytics candidate through current source admission and stable staging, then stop/report. No merge/production, SEO feature, theme or Medium account edits. Whole original issue ACs remain broader than this checkpoint.

Repository: /workspace/scratch/538c6c66c100/repo
Base: fdfc8cb67a6f78996932d9688c563c53c21387f2
Candidate: 58d89a5b71b41ea995e4b327d07b4052d309ccfa
Tree: 4f52b4a6162fb548d0d4d7446e7d6063d486fb77
PR178, open Draft at packet construction.
Common: agents/reviewers/README.md. Role: corresponding role prompt in same directory. Apply AGENTS.md, CONTRIBUTING.md, .github/ACCEPTANCE.md, guides/CODE-STYLE.md, guides/SITE-CHECK-PROFILES.md, guides/SITE-STAGING.md, guides/SITE-ANALYTICS.md and site/README.md.
Inspect actual full diff base...candidate and authored owners/tests. Allowed source/evidence: repository files EXCEPT current and prior reviewer verdict artifacts, unrelated MEMORY/personal history, parent notes. Candidate review reports may be consulted only for raw check identities/retained facts, not prior reviewer conclusions. API GitHub PR/runs/jobs/artifacts and actual immutable preview are allowed.
Current CI run 42512852807 (candidate exact source); fetch live run/jobs before interpreting. Immutable preview https://4143b5c4.oborskyi-author-ci-staging.pages.dev ; article /articles/the-sdlc-is-out-of-balance.html ; Writing /writing.html. Existing source diagnostics in separate evidence branch evidence/issue177-browser-ci-20261108 may be used for raw logs only. Real vendor collector receipts are a future production gate, not required by staging preview suppression.
Bounded review: inspect and perform relevant read-only checks within 10 minutes; no implementation/test changes, no external writes, no delegation, no full duplicated CI campaign. Output only assigned scratch file; preserve first verdict. State requested vs accepted isolation and provider internals unknown. Assess readiness of analytics-only candidate for stable staging, not completion of entire issue. Pending actual CI may be conditional; never call pending pass.

