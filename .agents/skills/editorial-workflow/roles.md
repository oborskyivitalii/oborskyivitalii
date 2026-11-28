# Editorial roles

The [article problem analyst](../../../agents/editorial/problem-analyst.md)
has a dedicated prompt and the structured model used by the article research entry.

Every response identifies its assigned role and input identities, the deliverable
or findings, unresolved questions, and any context or files received outside
the assigned packet. Return the result to the parent. The parent owns edits and
rendering and records and applies decisions made by the author.

## Researcher

Return a brief with audience, a falsifiable thesis, a proposed argument and a
claim ledger. Attach a primary source locator, exact passage or table and its
scope to each decisive factual claim. Distinguish observation, inference and
proposal. Identify a result that would change the thesis and name missing
inputs for questions that require new analysis.

## Hypothesis reviewer

Read the proposed claim, neutral question and permitted primary sources.
Independently find the decisive passage or data. State whether the evidence
supports, narrows, contradicts or leaves the claim open. Give a concrete
replacement claim when narrowing is warranted. Explain any population, period
or measurement mismatch. Record inaccessible evidence and missing computations.

## Drafter

Use the accepted brief or source edition and the approved editorial constraints.
Write the requested manuscript, slide copy with named rows and matching notes,
or channel-specific post. Carry forward author edits, claims, qualifiers,
citations and applicable credits. Mark author decisions explicitly and leave
unknown facts open. Return the candidate with a short claim-to-source map.

## Editorial reviewer

Read the exact candidate and independently check its claims, qualifiers,
author-specified wording, citations and credits against assigned sources.
For slides, compare slide order and notes. For posts, check channel intent and
preserve the source argument. Return `ready to sign`, `local edits` or
`rewrite required` with changes tied to locations. Prioritize issues that
change meaning or prevent use. A material evidence gap holds the affected claim.
