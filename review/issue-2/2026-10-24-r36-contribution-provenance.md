# Issue #2 / execution #5 — R36 editorial provenance and authorial mechanism (24 October 2026)

Owner: issue #2 editorial; issue #5 execution; [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79). Baseline R35 commit `8c016b2fe278ff4b2ea2879d59429c96b97ea5af`, manuscript SHA-256 `aa2d8db00076f21c613b657acccd911f217e2a2e8762cbfcb017ec7a03d0c869`.

## Intent, accepted scope and primary sources

Maintain the essay's three sections and its original evidence qualifications; integrate the reviewed authorial-contribution paragraph without claiming global historical priority or universal structural failure. The earliest confirmed displayed publication date is **2 January 2026**, [English LinkedIn essay](https://www.linkedin.com/pulse/ai-cost-cutting-fallacy-why-doing-more-less-breaking-teams-oborskyi-cxuif/); the [related DOU essay](https://dou.ua/forums/topic/57244/) is **5 January 2026**. The public comment dated **7 January 2026** explicitly calls for reconsidering the entire SDLC. The currently visible LinkedIn text may include later edits; a January-day byte-exact text snapshot has not been established. Therefore public provenance, **not proof of exclusivity or exact original text**, is established.

The early essays document code-output/human-reading asymmetry, reviewer fatigue, cognitive load, loss of team understanding and displaced costs. The later author-led Subprime research expands review/integration/maintenance/recovery mechanisms. Uncertainty Architecture is a distinct model-judgment control line. The R36 synthesis is the author’s conceptual framing, not an empirical universal law.

Earlier independent DORA and Google material discusses local-versus-system delivery effects; 'first to describe SDLC imbalance' and 'first to call for full SDLC rebalancing' are **not established**, and are intentionally absent from R36.

## Actual change and source-bound self-check

- Canonical manuscript R36 SHA-256: `bf6136f2b1333b40dbe11a437360c5bd3d028630358770c3c855284d86611b12` / Git source selection id `pmday-ai-both-sides-en-review-20261024-r36`; 52,956 JavaScript character units, 53,309 UTF-8 bytes; unchanged 12 **What if not?** prompts, three core section headers, four figures and two full tables.
- Exactly seven unique text replacement sites: edition cover, one contribution paragraph, combined bibliography note [37], citation metadata, BibTeX id, BibTeX revision note, revision history. Existing reference numbering 1–37 remains intact.
- New `source-46` LinkedIn named link in the existing #37 bibliography entry; DOU remains `source-45`. Metadata semantic SHA-256 recalculated `02a6a643f0d9b42a3efe181006b0fce9f64456deb283e3af65d80d77c38da34c`; profile byline `cad8b01074816d21f8529d170e7c62e17e6be56317899fa9918bddb9012be2fd`; launch SHA-256 `f8bcdac0a3f3fc6df9b23328c5164220cde881ff07a522b6f716622f617ca335`. R35 hashes were recomputed from the current source and checked against the old selected edition, profile and launch before any change. Original R35 edition is retained; new edition is immutable, review status/rightspending remains.
- No changes to code, HTML templates, test harness, global claims, existing rights or prior edition bytes.

## Independent model preflight and formal outstanding gates

The prior separate Llama 3.3 70B author-priority critique (inference `chatcmpl-44d01d20-86e3-49a2-9c3e-b933cfe1107c`) rejected historical first-ever assertions. A new separate Llama 3.3 70B candidate-paragraph critique (inference `chatcmpl-4d616471-5596-4f47-9554-757f5121fb71`) returned *PASS WITH LIMITS*: avoid implying that Subprime/UA mechanics already appeared in January. R36 addresses that concern by differentiating 'described' from 'develops' and 'distinct'. These are **limited independent model opinions supplied with selected source summaries**, not completed repository-autonomous Requirements, Code, White-box or Exploratory agents.

| Gate | Observed disposition |
| --- | --- |
| R36 localized editorial update, chronological public links and char budget | Implementer static check PASS |
| Four independent repository role executions / independent iteration review | NOT OBSERVED; remain pending |
| Current-source native publisher validation, print images and full PDF/LinkedIn/Medium exports | NOT EXECUTED; pending |
| RI + changed dependency generated outputs, Basic and issue acceptance policy | NOT EXECUTED; inherited RI bound/CI mismatch still open |
| PR main merge, staged acceptance, rights/device/editorial/publication decision | OPEN; PR remains Draft |

**Next:** in checkout with original media, generate matching R36 native PDF and platform outputs; verify RI without loosening limits; get four independent roles and current-source checks. Do not merge or publish before the existing gates.