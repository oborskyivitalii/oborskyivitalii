# Issue 39 — 2026-10-15 licensing proposal

## Selected policy — 15 October 2026

The maintainer answered **“Ок, давай як ти запропонував”** and selected option 1:
Apache-2.0 for the full original implementation, including CSS/templates and
rendering; CC BY 4.0 for original editorial material and non-brand diagrams;
the stated identity, portrait, third-party, linked-edition and historical
exceptions remain. The actual selection is recorded in
[#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7#licensing-selection-20261015)
and [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#licensing-selection-20261015).
The effective scope is now owned by [LICENSING.md](../../LICENSING.md), the full
code/content licenses, notices and the candidate-bound rights inventory.
Separate exact-edition human acceptance remains pending. Production/domain/DNS
remain paused until changed-content permanent staging and maintainer review.

The proposal below records the inspected source and choice as originally
presented; its pending-selection language is historical, superseded above.

Owner: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
[PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40);
rights policy remains in [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7).
Role: repository scope analysis, with separate upstream/license-source inspection.
Inspected personal-site source: `f5984af5a97628ed61c6f656ecbc04e3a6ec4004`.
Read source contracts, Credits, catalog, provenance, rights compiler and retained
inventory. No license grant, upstream edit or publication is made by this report.

## Intent and recommendation

The maintainer paused production on 15 October to settle repository, website,
article and upstream-project licensing, then review changed content on permanent
staging before resuming production. This supersedes the earlier draft proposal
to confirm restricted reuse. **The following policy is proposed, not effective.**
`site/rights.json` must remain `pending-maintainer-decision` until selection.
Existing AC01–AC05, exact-edition rights acceptance and production gates remain.

Recommend Apache-2.0 for original engineering and CC BY 4.0 for original editorial
material. This supports reuse with attribution, including commercial use and
adaptation; it is not an anti-copying or noncommercial policy. Apache includes a
patent grant and no general trademark permission. CC attribution must identify
changes and must not suggest endorsement. Existing exceptions remain explicit.

| Scope | Proposed treatment | Boundary |
| --- | --- | --- |
| Original repository engineering: tools, tests, CI, technical configuration | Apache-2.0 | Dependencies and imported components keep their own notices/licenses. |
| Website implementation: `site/engine`, `effects`, `scenes`, `templates`, `integrations`, `tools/site` | Apache-2.0, including CSS and rendering implementation | This permits reuse of the implementation and much of its appearance. No incompatible promise that all visual design is exclusive. |
| Original site editorial text, summaries and explanations in `site/content` | CC BY 4.0 | Excludes attributed third-party quotations, names/identity and separately licensed material. Factual metadata is not represented as exclusively owned. |
| New author-owned hosted article text and original diagrams | CC BY 4.0 default, stated per edition | Article-specific notices prevail. Adapted upstream/third-party material retains applicable terms; no blanket override. |
| Existing externally linked articles, videos, slides and PDFs | Their existing edition terms | The current catalog links 29 works / 46 platform editions; it does not host their bodies. Do not retrospectively license them as one collection. |
| Portrait, portrait derivative, identifying favicon and personal branding | Excluded from general grants; contact for reuse | Preserve existing site-use instruction and provenance; do not assert photographer ownership or grant visitors reuse rights. |
| Original non-brand diagram artwork, including `writing-paradigm.svg` | CC BY 4.0 | Rendering code remains Apache; external art/fonts/logos are not introduced. |
| Attributed contributions, public-response excerpts and advisory names | Existing bounded attribution/permission | A site license cannot grant rights belonging to others. Existing Kopko/Basir consent is retained. |
| Historical retained editions and review artifacts | Preserve recorded notices and exact bytes | New policy must not silently rewrite historical packages or imply ownership of third-party inputs. |

## Upstream licenses remain independent

| Project and inspected revision | Verified owners | Website treatment |
| --- | --- | --- |
| UA `345c8f50745e5fde1303d0d7952634f7899220c9` | [Licensing map](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/LICENSING.md), [documentation CC BY 4.0](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/LICENSE-DOCS.md), [original code Apache-2.0](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/LICENSE-CODE.md) | Link these boundaries. Preserve third-party exceptions, including upstream Quartz; do not describe all UA code as Apache. |
| Subprime `06fdd63b332fd4efe27462dbbd648119c3f96ce8` | [License](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/06fdd63b332fd4efe27462dbbd648119c3f96ce8/LICENSE.md), [README](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/06fdd63b332fd4efe27462dbbd648119c3f96ce8/README.md), [contribution terms](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/06fdd63b332fd4efe27462dbbd648119c3f96ce8/CONTRIBUTING.md): CC BY-SA 4.0 | Linked or adapted Subprime material retains its license. Distributed adaptations need the applicable ShareAlike treatment; an independent linked summary is not automatically the whole research work. |

The personal site's RI component already retains Apache-2.0 and UA provenance in
`tools/RI-LICENSE.md` / `tools/RI-NOTICE.md`. Neither project license automatically
licenses the personal site. No upstream license change or maintenance task is a
new launch dependency. Future imports require review of the actual source scope.

## Proposed English Credits copy

**Draft for review after the owner selects this policy; not a current notice.**

> Original website text and original diagrams are © 2026 Vitalii Oborskyi and
> licensed under CC BY 4.0, unless a specific notice says otherwise. Credit the
> author, link the source and license, and indicate changes. Original website
> code, including its rendering implementation, templates and CSS, is available
> under Apache-2.0; see the repository's Code License and licensing map.

> Individual articles and editions may carry different licenses. The Writing
> index links to existing platform editions; their terms and third-party credits
> remain in effect. This site does not reproduce their article bodies, slides,
> recordings or PDFs. A separate notice accompanies each future hosted edition.

> Uncertainty Architecture documentation uses CC BY 4.0; its original code uses
> Apache-2.0, with third-party exceptions. The Subprime Code Crisis uses CC BY-SA
> 4.0. Consult each project's licensing page for its scope and attribution rules.
> These project licenses do not replace this website's licensing map.

> The author portrait, its derivative, personal branding and attributed
> third-party material are excluded from the general grants above. The author
> supplied the photograph for this site; its displayed cutout uses AI-assisted
> background removal. Contact me about reuse of the photograph or personal
> branding. Acknowledgements do not imply institutional endorsement.

Keep the existing footer link to Reuse & credits. Link each named license to its
actual license text and the project names to the verified upstream owners.
Correct the preference sentence to: “Theme and motion preferences are stored
locally in your browser. These controls do not request your location or use an
account or analytics.” Add a separate truthful analytics paragraph: “The
production website uses Cloudflare Web Analytics for aggregate measurement.
Staging and review editions disable it.” Link the provider explanation; source
enablement is not evidence of collected traffic or a completed privacy review.

## Material owner choices

1. **Recommended:** open the full original implementation under Apache-2.0,
   including templates, CSS and rendering code; accept reuse of that appearance.
   Reserve identity/portraits and third-party rights; use CC BY 4.0 for the
   original editorial scope above. Compliant grants allow commercial adaptations.
2. **Alternative:** open delivery/tooling/tests only; keep bespoke website
   engine, effects, scenes, CSS and templates outside that grant. Name this
   narrower scope explicitly rather than claiming both openness and exclusivity.

The owner must select the scope before effective license files/public notices
are installed. This report supplies no reviewer signature or rights approval.

## Execution and acceptance route

| Task | Owners and verification | Status / dependency |
| --- | --- | --- |
| Record selected policy | Root licensing map, full code/content license owners, README/CONTRIBUTING, `site/rights.json`; preserve RI notices and enumerate exceptions. | Pending owner selection; #7 / #39:AC03. |
| Update public legal content | Credits source/template; exact legal-content amendment in SEO preservation; generated public license/notice files with hash-bound rights coverage. Preserve unrelated copy and historical bytes. | Pending selection; source/rights/SEO failure checks. |
| Bind actual edition | Rights compiler/tests, candidate/archive notices and per-edition article metadata; require matching human inventory approval. Register paths/profiles and rebuild RI. | Inventory success does not prove legal acceptance. |
| Publish reviewable staging | Resolve current-main exact-registry compatibility, run ordinary bounded admission, publish both constant staging addresses, verify served identities. | Existing checks/budgets remain; no production cutover. |
| Owner reviews changed content | Supply [permanent Cloudflare staging](https://staging.oborskyi-author-ci-staging.pages.dev) and [current Pages staging](https://oborskyivitalii.github.io/oborskyivitalii/staging/), with exact deployed source. | User review before resuming production. |
| Resume production later | Reconcile settings, full candidate, applicable device/independent/rights gates and explicit release decision. | Production/domain/DNS remain paused. |

Official terms inspected: [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
These license texts control over this practical summary. This proposal changes
no live acceptance checkbox, source policy, deployed content or upstream grant.
