# Author-site editorial skill inventory

Issue [#217](https://github.com/oborskyivitalii/oborskyivitalii/issues/217)
owns the phased inventory. The [article research entry](../../guides/EDITORIAL-ORCHESTRATION.md#article-research-entry)
uses these two packages in its first increment.

| Skill and provenance | Prompt | Trigger and output |
| --- | --- | --- |
| [source-research](source-research/SKILL.md), independently authored here under the repository's code license | [Article source researcher](../../agents/editorial/source-researcher.md) | New article or changed thesis. Returns a proposed argument, outline and literal source excerpts. |
| [competing-hypotheses](competing-hypotheses/SKILL.md), [upstream pin and MIT notice](competing-hypotheses/SOURCES.md) | [Independent article hypothesis critic](../../agents/editorial/hypothesis-critic.md) | Independently tests the current proposed argument. Returns a disposition and evidence. Narrowing supplies the new thesis and outline. |

The [issue review](../../review/issue-217/2026-11-27-editorial-review.md)
records the native role execution, exact identities and handoff results.
