# Issue 41 — 2026-10-09 independent site-case review

Owning issue and scope: [issue41, same-issue AI-assisted delivery extension](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Owning execution: [Draft PR67](https://github.com/oborskyivitalii/oborskyivitalii/pull/67).
Reviewer: delegated `positioning_review` AI agent, independent of the root copy
implementation. This is source/history/editorial review, not human approval.
Baseline: `da36ccf03e1d749a540aa6bb39fe7b4083f1ef66`, tree
`3dba415e37dbbf3830d271ad6208af53043088c9`. Reviewed candidate owners are dirty
prepared-source bytes identified below; no candidate commit or deployment is
invented. Executable reference owners are pinned to protected-main `338e3ff`.

## Intent and inspected materials

Review the maintainer-authorized AC17–26 extension: a short About link to a compact
practical case on existing Credits. Vitalii declares personal direction; AI tools
support execution. Preserve earlier positioning and avoid autonomy, enterprise
effectiveness, production admission or scientific-validation claims.

Read AGENTS, CONTRIBUTING, source/editorial/style and profile owners, live issue41,
the two changed canonical JSON/template pairs, self-analysis and separate
two-fragment amendment. Inspected actual build/content composition, navigation
failure handling, acceptance runner, profile registry and reusable release workflow,
staging/full identity guards and the relevant executable negative tests. Retrieved
live PR63/66 metadata, issue45 and staging run37809312308 with its jobs/steps.
Tests were inspected for what they exercise; this review did not repeat browser,
performance, staging or production suites.

## Findings and dispositions

| ID | Actual evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | `tools/site/build.cjs` route input/fingerprints/output, finite content renderer, `tests/site-engine.test.cjs` Home-only change/full-versus-incremental equality | Content/templates and engine/effects have separate executable owners; authored blocks produce ordinary HTML. This supports the bounded separation claim. | AC19/21/24 | accepted |
| F02 | `site/engine/navigation.js` verified fetch/extraction and native-location failure path; `tools/quality/functional.cjs` readable static no-JS/no-Canvas assertions | Navigation and Canvas enhance the generated HTML; failure/readability assertions exercise the existing fallback. No claim that enhancements are necessary to read the site. | AC19/21/24 | accepted |
| F03 | Live issue65/merged PR66 history; `tools/issue_acceptance.py` source identity, explicit pending gates and closure false; `tests/test_issue_acceptance.py` rejects automatic approval, skipped tests, wrong/dirty source and source changes | Issue/AC/PR discipline and evidence-versus-decision separation are implemented. Human direction is the current maintainer's first-person declaration recorded in issue41, rather than an inference from commit bylines or green tests. | AC18/19/21/22 | accepted within declaration/source limits |
| F04 | `tools/quality/test-profiles.json` hosted preview/staging/production definitions; executable registry equality, release `validation_level` branching, staging/full aggregate and negative tests | Three implemented check tiers and exact source/artifact binding are supported. A successful staging gate remains `fullGate:false`, `productionEligible:false`, `deploymentAuthorized:false`. | AC19/21/22 | accepted |
| F05 | Live merged PR63, active travel-only effect composition, `tests/color-build.test.cjs`, successful bounded staging/gate/promotion jobs, unchanged merged budgets | Ribbons were removed as a completed scoped visual tradeoff. Fractal/navigation/content preservation and unchanged-budget staging are supported by implementation/history. No measured causal speedup or general renderer-resolution claim is introduced. | AC20/21/22 | accepted |
| F06 | Initial Credits profile link exposed only staging's selected matrix | That single link did not establish all three advertised tiers. Root replaced it with the immutable actual registry `#L69-L244`, exposing complete preview/staging/production entries. | AC21 | resolved and final URL inspected |
| F07 | Exact baseline JSON comparisons, prior six-fragment record bytes, new fragment integrity | Existing About biography, Corning sentence/deep link and social links remain exact. All prior Credits text/URLs/attributes remain exact, including omitted-language explanation, portrait/rights and advisor boundaries. Original six-fragment amendment remains immutable. | AC23/24/26 | verified source preservation |
| F08 | Final policy, SEO/test projection, existing mutation test and profile/catalog/RI diff | One exact new successor is reversed before the immutable positioning layer. One task-snapshot provenance check and four added permanent negative mutations cover admission/link faults; factual support remains separate. Existing criteria, runtime protections and normal profile budgets are retained. | AC24/25/26 | accepted bounded check/routing review |

## Public source support and completion boundaries

1. [Build composition/output](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/site/build.cjs#L365-L417),
   [finite content rendering](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/site/render-content.cjs#L37-L109)
   and [incremental equality test](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tests/site-engine.test.cjs#L490-L526)
   support separation, including executable effects/runtime output distinct from prose.
2. [Fallback assertions](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/quality/functional.cjs#L548-L557)
   and actual navigation failure handling support readable ordinary HTML. These
   tests are corroboration of mechanisms, not proof of authorship or governance efficacy.
3. [Merged PR66](https://github.com/oborskyivitalii/oborskyivitalii/pull/66)
   and [acceptance runner](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/issue_acceptance.py#L348-L404)
   support completed workflow history and pending manual decisions. The site-case
   prose clearly attributes direction to the author and assistance to AI tools.
4. [Actual three-tier registry](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/quality/test-profiles.json#L69-L244)
   is the final public profile link. [Staging identity gate](https://github.com/oborskyivitalii/oborskyivitalii/blob/338e3ff341dc35b64cba7854289e1385cbaf1562/tools/quality/staging-gate.cjs#L131-L177)
   and inspected negatives reject wrong-source, substituted/full-profile reports
   and staging-as-production admission. The workflow implements distinct production
   jobs; their existence does not establish completion of issue13 or a public release.
5. [PR63](https://github.com/oborskyivitalii/oborskyivitalii/pull/63) is actually
   merged as `a8149a0a65579d6977ccef9bb0e6e4367fd9e9dd`. Its body records tested
   raw source `3441e80e051d402ad3fd67babd15350d9c43e856`, tree
   `776610667df0c606d29891f582a7fc329faaa570` and
   [stage37809312308](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37809312308).
   Independently retrieved run/job metadata confirms completed successful build,
   static, host, staging, aggregate gate and same-package promotion; production jobs
   are skipped. The workflow run's head is its controller, so it is not substituted
   for the tested candidate identity. This review did not re-download raw report
   ZIPs or infer a performance effect size from the completed pipeline.

Actual Git comparison across PR63's squash commit and parent confirms identical
`tools/quality/budgets.json` bytes, SHA256
`ce7c3a7e8bc70eaeb29d4e72f8c96e36a5aac563badfa8955d5bdd430d8ef567`.
Issue45 remains open; its rejected renderer experiment is not the delivered ribbon
removal. The copy gives no percentage, benchmark causality or general optimization
completion. Enterprise scale, UA implementation and scientific validation remain
explicitly outside the case's claim.

## Editorial and architecture assessment

The one new About paragraph follows the preserved Corning paragraph and reaches
`credits.html#built-with-ai`. Credits adds an existing-style heading, brief author
context, four evidence paragraphs and a clear claim boundary before the preserved
correction/contact section. This keeps detail off Home, avoids Research duplication
and adds no route, form, visual/runtime policy, dependency or reusable layout DSL.
Text/URLs remain in typed JSON; markup remains in the page-specific templates and
uses shared existing classes. No new CSS/inline styling or broad formatter change
is part of this case. Relevant CS01/02/03/04/05/08/09 ownership/readability boundaries
are preserved; guard and CI evidence remain separate from this semantic review.

Both new fragment before/after SHA256 values verify. The public registry link now
supports its associated wording. No remaining editorial or source-support blocker
was found in these reviewed prepared bytes.

## Bounded check, style and routing review

Inspected the actual final diff independently. SEO imports the separate case record
and reverses it before the prior positioning record, then retains the original
whole-page/metadata comparison. It adds no broad normalization or unbounded
admission. The Python projection restores only that exact new record for existing
positioning checks; its new method binds the immutable da36 baseline and before/
after digests, unique existing-page anchor, five pinned code destinations with
actual file/line bounds and two exact PR links. Its docstring accurately limits
this to admission/link structure, not truth or live PR state.

The existing executive negative test now covers both records and rejects a
missing case anchor, autonomous-direction substitution, enterprise-efficacy
overclaim and moving a pinned evidence link to `main`. Earlier negative cases
remain. This extends a maintained fault surface rather than creating another
routine suite. The task-snapshot method remains owned only by the issue policy;
the registry routes lasting semantic negatives through the existing targeted,
staging and production source selections. No browser/performance workload,
workflow, runtime, visual contract, budget or dependency is added.

Independent parsed-JSON comparison with da36 confirmed all prior AC01–AC16 IDs,
intents, check/gate arrays and all 17 existing check definitions are unchanged.
AC17–AC26 append one named check and reuse explicit non-automated gates.
`BROWSER` and `REVIEW-MERGE` definitions remain exact; other gate descriptions
append case-specific requirements after their complete prior text. They preserve
factual review, scoped manual observations and original closure/release limits.
No automated string test supplies human approval or source authenticity.

The four new review artifacts have history roles and explicit source/editorial/
protocol owners in the path catalog. RI/CI adds them to the existing acceptance
layer; the test registry adds actual amendment inputs and honest dispositions.
These changes preserve owner direction, CS01/02/04/08/09 and the existing check
selection. The focused Python/JS formatting follows the owned configuration;
there is no whole-file mechanical rewrite. Root/checks-agent reported targeted
tests, explicit formatting and schema validation separately; this reviewer did
not represent those reports as an independently executed final-head CI run.

Prepared check/metadata identities inspected:

| Owner | SHA256 |
| --- | --- |
| `.github/acceptance/issue-41.json` | `5d79585dcd7bc927487b381769352becd9900715b3c8ca5dd9b75e06ae4ec3d5` |
| `tools/check_site_seo.cjs` | `af21b592bd6db9e085df2596c9d19328d3eba600a2644f597a52549f3b909373` |
| `tests/executive.test.cjs` | `825ae6c5804aca88e2a826105227882ea95970b7f65e2c56ca6750163601a055` |
| `tests/test_issue41_acceptance.py` | `809977718e2c32a2a7f62fedbd2f42f82419fbc37b0a75b6c6eb9c4a96f005ee` |
| `tools/quality/test-profiles.json` | `dd160c8895b4f6b84f7c9ae760147afd94ca421e322b19b6fc6fa6419d63f2e4` |
| `.github/repository-paths.json` | `388a4c4fe78edd851da8b99446de95a03cfe102d4af38198855ea5987b4d865a` |
| `.github/ri-ci-map.json` | `e75046d1dfb93a1222c9d16f2aa9c6407847f1db3a5b5c30a8e9c0159d701764` |

## Exact reviewed prepared-source identities

| Owner | SHA256 |
| --- | --- |
| `site/content/pages/index/about.json` | `9df3c00e6b5299b3083c3fa8237440228e7aafa4edcb8d5c42e961f7c62fc12b` |
| `site/content/pages/credits/main.json` | `793b4964f23b84a3f4371dd10c3ec50e51dcd9195bda4894e1f821efcdc67bc5` |
| `site/templates/pages/index/about.html` | `84289497494d14ed546efe06ff68211a7f6a0cfe3332b221c25f18cdd528fcfd` |
| `site/templates/pages/credits/main.html` | `34598e2e44f39d3abadcf0c440ba0331280f811976c8d3243b8d79850ca60aa6` |
| `review/issue-41/2026-10-09-sitecase.md` | `bb3f375566dab676817294e9849a43859cbbac33ba504a2e68fce44625efaed4` |
| `review/issue-41/2026-10-09-sitecase-amendment.json` | `704df0de9bff6740d29bce76d1226c378605588621e8239406dbd23385f9abcd` |

## Acceptance evidence and remaining tasks

| AC | Review evidence | Disposition / remaining gate |
| --- | --- | --- |
| AC17/18/22/23 | Actual prose/placement, current maintainer declaration and explicit claim boundaries | Accepted independent AI editorial review; no human merge/release decision supplied |
| AC19/20/21 | Executable mechanisms, negative tests, public registry/PR/staging history above | Source support accepted with raw-report/access limits stated |
| AC24 | Preserved baseline JSON and immutable old amendment; scoped canonical diff | Source preservation accepted; exact current generated/source checks remain required |
| AC25 | This review supplies no browser or final-head CI execution | Current-source required checks/preview and focused changed-page reading/contact remain pending |
| AC26 | Exact identities, findings and prior-intent boundaries recorded here | Root must bind final commit/run/preview and actual issue checkboxes; original/release gaps remain open |

Root owns the normal remaining checks, source/RI routing, regenerated exports and
same-issue evidence reconciliation. Existing explicit instruction retains user
confirmation before merge. This independent AI review cannot convert Draft,
implemented, reviewed, merged, staged and published into the same observation.

## Issue synopsis

Independently inspected the practical site case against executable build/fallback,
acceptance/profile/identity code, negative tests and completed ribbon-removal
history. Corrected public profile-link scope is verified; earlier Corning/language
and original positioning evidence are preserved. No remaining source/editorial
blocker; final clean-source checks, focused preview review and maintainer decisions
remain separate and required.
