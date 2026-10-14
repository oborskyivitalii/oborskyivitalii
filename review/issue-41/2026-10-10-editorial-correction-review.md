# Issue 41 — independent editorial correction review, 10 October 2026

Owner: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Execution: [Draft PR #68](https://github.com/oborskyivitalii/oborskyivitalii/pull/68).
Reviewer: independent Codex AI agent `/root/independent_review`; read-only on
implementation. This is an AI source and scoped capture review, not human visual
acceptance, third-party permission, legal clearance or a merge decision.

## Reviewed decision and identities

Read the live issue's **Superseding editorial amendment — 10 October 2026:
topic-first public records**. The owner expressly replaces the earlier requirement
to hide both records until new personal approval with canonical editorial
inclusion. This is a dated successor to the previous delivery, rather than a
claim that the earlier composition or its checks implemented today's decision.

Inspected prepared work is based on raw `ca4ee44e50c70cb036ccca3fa6d97d7108ecd423`,
tree `4dcebf0b223b62064a35144c4b21783336107a90`, and remains dirty. Compared the
complete correction against that commit and the current source contracts. The
hashes below bind inspected bytes; they do not represent a clean current-head
CI run. Final source/tree, hosted preview and CI evidence belong in the
[same task/result record](2026-10-10-arkadiy-content.md).

| Inspected owner | SHA256 |
| --- | --- |
| `site/content/pages/index/acknowledgements.json` | `1e0420c20d78020d6b239727d87fb0f41953bfc1291e8e87bca2240b0590e967` |
| `site/content/pages/research/acknowledgements.json` | `af8f4040b2cc391f47f87e44575fa8835d4aca7d13eb956fca559f7d185ed33a` |
| `site/templates/pages/index/acknowledgements.html` | `97436129684d0f2f2a7cd5919644cb3974a8c60f9617ea84cfab5c8e1aa4bd70` |
| `site/templates/pages/research/acknowledgements.html` | `cd6491ea29207447e1c3aa8fd5473241adf0169710639bf251100135ca601d35` |
| `review/issue-41/2026-10-10-arkadiy-topic-amendment.json` | `2022f352456ca68354a98a456b0155f656c8d53b922f60ce521b7e68b5696fed` |
| `.github/acceptance/issue-41.json` | `b05192cb5e77f145d885c788288a35a645b0720b8c48a5c25522f91cfb44d1ad` |
| `tests/test_issue41_acceptance.py` | `f9c4bb90789a3462e318f6fd1e79068dd21e3bbdd75d83824061a631225b1f3d` |
| `tests/content.test.cjs` | `5b3f712a92dd63c934f4384949d1794ad62ee7e5df67199dd20b34168ffd8007` |
| `tools/check_site_seo.cjs` | `3a14594646a3a8c2db5a98267617269bb159e1dc08ab90c04b76908117f7bffb` |
| `tools/quality/local-browser.cjs` | `2b724b32137c51985f0d3321cda4b89b1a7dc90a86d4b909f0ef9af26e232dac` |
| `site/engine/lifecycle.cjs` | `0923b0b7cba590e18fdfcd2c833b2b1a476d174e98177dc9c414b5be6e232058` |
| `site/engine/styles.css` | `06e5776ee5efe2e66364641f66223d22571e5637344622001467ae7c7346d082` |
| `site/content/pages/credits/main.json` | `a7edc5c2f442403d8560050c71892564a3225997fc5cdaf598e7e408189dc60a` |
| `site/retained/manifest.json` | `5bb6503889b235b9d2043c0587d991a9a022f3acb08088900d82f9afdd05f1f4` |
| `review/issue-41/editorial-captures/browser-observations.json` | `98393a4ef19f2eebf4611241006bd2037af6ccb7b797ec20c67520927b950dbb` |

## Primary sources and access limits

Freshly retrieved these public primary sources on 10 October 2026. No private
correspondence was requested, fetched or copied.

| Source | Observation and bounded implication |
| --- | --- |
| [Dobkin's original public post](https://www.linkedin.com/posts/arkadiydobkin_uncertainty-architecture-thinking-systems-activity-7500661925790240768--I1H) | Read anonymously. It recommends reading the particular article and adds two bets: expanding addressable problems and differentiating domain/client-specific bounding architecture. This supports the editorial summary and conditional treatment; it establishes no website, services or organizational endorsement. |
| [Published Thinking Systems article](https://www.linkedin.com/pulse/thinking-systems-when-controlled-object-changes-vitalii-oborskyi-6k4we) | Followed the article link from the public post; read the August 27 publication and its Acknowledgments and Provenance. It credits the earlier exchange for the formulation, distinguishes the author's subsequent engineering definition and excludes co-authorship or endorsement. The source article was not changed. |
| [Official EPAM biography](https://www.epam.com/about/who-we-are/leadership/executive-management/arkadiy-dobkin) | Current official biography identifies principal founder and executive chairman, supporting the restrained `EPAM founder` identifier. Its Connect link points to the exact retained profile URL. No EPAM participation or approval follows from this biography. |
| [Exact retained profile](https://www.linkedin.com/in/arkadiydobkin/) | Direct retrieval and the official Connect destination returned HTTP 999. Full profile content was not newly inspected; the destination and identity are corroborated by the official biography and public post. |
| [Formulation-provenance record](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/content/research/notes/thinking-systems-formulation-provenance-arkadiy-dobkin.md) | GitHub connector retrieved public blob `8d903b14f63b2ed25878df0a8e427163ef8f24c8`. It calls the dialogue provenance maintainer-attested, separates formulation credit from UA authorship/authority/validation, and records narrow earlier article pre-publication confirmation. It supplies no new personal approval of this website. Browser-style web retrieval of this GitHub URL was unavailable. |

**Public source verified; editorial inclusion instructed by owner; new personal
approval of website unconfirmed.** Live [rights issue #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7)
was read back as open. Neither this review nor inclusion closes that owner.

## Findings

| ID | Evidence | Finding and disposition |
| --- | --- | --- |
| C01 | Four canonical JSON/template owners and current generated routes | Exact current supplied topic-led copy is active through the existing build. Home has `Thinking Systems — public discussion` and ordinary `Arkadiy Dobkin · EPAM founder` byline; Research has the runtime-control/differentiation heading, ordinary source byline, public summary and distinct `Formulation provenance` subheading/paragraph/link. Verified. |
| C02 | Default Home/Research article tokens, authored slots and JSON-LD | Default Home contains three records; Research contains eight with two unchanged formal advisors. Every other person's normalized article DOM, text, destination and order is unchanged from ca4. The new record has no photograph, logo, quote, advisor badge, rating, personal approval or service/programme endorsement. Both routes' JSON-LD is unchanged and contains no new Dobkin identity. Verified. |
| C03 | Templates/shared CSS and current captures | Existing three-column Home and two-column Research classes apply equally to peers; no new CSS or special visual promotion. One exact current section disclaimer appears outside the cards. Plain topic headings and source bylines are readable, with separately presented Research provenance. Verified in source and scoped captures. |
| C04 | Successor amendment, SEO reversal and retained source | Exactly two before/after acknowledgement fragments are hashed against ca4 and current generated pages, each occurring once after the established HTML normalization. They reverse before the unchanged earlier amendment and frozen content/SEO contracts. Historical amendment and four review-source files are byte-identical to ca4; earlier report bodies are exact apart from explicit supersession banners. The two previous retained withdrawals and all unrelated retained bytes remain preserved. Verified. |
| C05 | Complete source delta | Catalog, metadata, article records, upstream research, runtime, shared CSS, effects/scenes/assets, Credits paragraph, build owner, workflows, budgets and profile owners have no correction delta. Stationary scroll camera and retained route flight/fade/movement are unchanged. Generated default/static/offline outputs derive from the canonical owners; no new publishing system or second active source was added. Verified. |
| C06 | Policy and focused negative test | All 35 AC IDs, criterion-to-check/gate arrays, 25 named check keys and nine gate keys are preserved. Original six gate objects are exact; four AD method targets and three AD descriptions evolve only for the explicit successor. Eight negative mutations reject missing records/disclaimer, renamed grouping, person-led heading, wrong post URL, invented approval/advisor role and unrelated-person edits. Verified; single negative test executed and passed. |
| C07 | QA identity record | Eight canonical layout cases and 16 capture byte counts/SHA256 values match the record; four authored source hashes and lifecycle hash match current bytes. A post-observation check-helper formatting change is recorded separately with its actual observed and final hashes. An initially stale final-helper hash and an AI-as-maintainer inspection phrase were corrected before review completion. Resolved evidence defects; no public artifact change. |

No unresolved implementation or policy defect was found in the inspected bounded
correction. Original AC02–AC06 and wider rights/release decisions remain pending.

## Verification and limits

This reviewer independently compared canonical source values and exact existing
URLs, normalized other-person article DOM/order, unchanged JSON-LD, fragment/hash
pairs, all policy ID/mapping/gate objects, old source/history bodies and protected
runtime/build/profile owners. Executed:

```sh
PYTHONPATH=tests python3 -m unittest test_issue41_acceptance.Issue41ImplementationTests.test_arkadiy_missing_topic_records_approval_promotion_wrong_sources_and_other_edits_fail
```

The single focused test passed, including all eight invalid mutations. Pinned
formatting and the exact existing two-level snapshot link-base comparison changed
the test file during preparation; the focused check was rerun on the final
inspected test hash above and passed. Reviewed the snapshot comparison: it uses
the maintained HTML normalizer and rewrites only the two existing relative Home
links to their exact `../../` snapshot bases, preserving the complete canonical
section comparison. The policy agent reports nine focused Python checks and
canonical content tests 10/10 passing. Those reported observations remain distinct
from this reviewer's own focused execution and final clean-source acceptance.

Reviewed the [current browser record](2026-10-10-editorial-browser.md) and verified
all eight Home/Research × 1440/390 × Day/Night cases, 16 lossless capture hashes,
one disclaimer per section, unclipped visible body text and exact bottom targets.
Independently viewed Home Day desktop detail, Home Night mobile section,
Research Day mobile detail and Research Night desktop section. Natural wrapping,
ordinary attribution and the separate formulation paragraph are readable in
those samples. Other cases are supported by the QA observations and image hashes,
not represented as this reviewer's separate browser execution.

Scoped QA used Playwright 1.63.0 with local Chromium 138.0.7204.0 because pinned
Chromium 153 could not be installed locally. Dirty base ca4 is explicit. Existing
canonical base artifact digest is
`1f1dcf1a916017b1c3aedc5b812e953da438a44b81082f4c201db28d1f7288f1`;
the tested ordinary Color derivation is
`cc65e3c4ed3a2b15363698dad9d2d7827149c21846ed9020bdb9de981d16fd24`,
engine `9fd66a22f26b9cb487179db4d38812a1c03627d436506422cd0987cfdd8509c8`.
The record also observes fixed cameras/native bottom on all five routes and
retained navigation camera flight, content fade and movement. This is scoped
loopback evidence, not new physical-device or performance acceptance.

## Completion handoff

The inspected source/editorial boundaries and scoped layout evidence support
the superseding bounded criteria. Before reconciling current checkboxes, the
execution record must bind mandatory Basic/RI/owning acceptance and ordinary
hosted preview/smoke to the final clean raw source/tree and exact artifacts.
Earlier ca4 checks are historical evidence, not current canonical-content CI.
Actual current issue/PR readback and final checklist reconciliation remain with
that result. This review authorizes no merge, stable promotion, production
activation, new third-party permission or original whole-issue closure.
