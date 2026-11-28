# Author-site editorial skill inventory

Issue [#217](https://github.com/oborskyivitalii/oborskyivitalii/issues/217)
owns the phased inventory. The [article research entry](../../guides/EDITORIAL-ORCHESTRATION.md#article-research-entry)
uses the following packages for research, problem analysis and critique.

| Skill and provenance | Prompt | Trigger and output |
| --- | --- | --- |
| [source-research](source-research/SKILL.md), independently authored here under the repository's code license | [Article source researcher](../../agents/editorial/source-researcher.md) | New article or changed thesis. Returns a proposed argument, outline and literal source excerpts. |
| [problem-space-model](problem-space-model/SKILL.md), independently authored here under the repository's code license | [Article problem analyst](../../agents/editorial/problem-analyst.md) | After source research. Returns a bounded model, candidate thesis, alternatives and discriminating observations. |
| [systems-thinking](systems-thinking/SKILL.md), [pinned upstream](https://github.com/ironyjk/strategy-frameworks/blob/146aa1c4dfe0eccc51a77c25a32f3e1958773f6c/systems-thinking/SKILL.md), [MIT license](systems-thinking/LICENSE) | Article problem analyst | Feedback or accumulation. Retains loop/stock-flow reasoning and removes general editing and tool instructions. |
| [constraint-first](constraint-first/SKILL.md), [pinned upstream](https://github.com/glebis/claude-skills/blob/ea4ef38c40bb5e1541624e2f333d4c736378ef20/the-goal/SKILL.md), [MIT license](constraint-first/LICENSE) | Article problem analyst | Suspected throughput constraint. Adapts the focusing steps for an evidence-bounded article; requires no upstream scoring, UI or automation scripts. |
| [cynefin](cynefin/SKILL.md), [pinned upstream](https://github.com/tjboudreaux/cc-thinking-skills/blob/7b8fece345dfaa11773be7152ccd194589cb5437/skills/thinking-cynefin/SKILL.md), [MIT license](cynefin/LICENSE) | Article problem analyst | Uncertain response mode. Adapts domain selection and the reclassification test into the article problem model. |
| [competing-hypotheses](competing-hypotheses/SKILL.md), [upstream pin and MIT notice](competing-hypotheses/SOURCES.md) | [Independent article hypothesis critic](../../agents/editorial/hypothesis-critic.md) | Independently tests the current proposed argument. Returns a disposition and evidence. Narrowing supplies the new thesis and outline. |

The [issue review](../../review/issue-217/2026-11-27-editorial-review.md)
records the native role execution, exact identities and handoff results.
