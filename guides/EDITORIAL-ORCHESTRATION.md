# Editorial orchestration

[Issue #217](https://github.com/oborskyivitalii/oborskyivitalii/issues/217) owns the editorial workflow. The first component evaluates a single synthetic article run. Later integration has separate evidence requirements for native launches, private storage, real author decisions, publishing tools and handoff.

## Local article decisions

`tools/orchestration/editorial-article.cjs` exports `evaluate(jsonText)`. Supply a SHA-256 run identifier, a synthetic author ID, the requested `outputs` selected from `html` and `pdf`, and an ordered `events` array. The component replays up to 64 events within 32,768 UTF-8 bytes and returns the current brief, manuscript and individual artifacts. Each artifact includes a SHA-256 identity, a scoped review ID and the latest modeled decision. Invalid events throw before a result is returned. Retain the previously valid history after a refusal.

| Event type | Required inputs beyond `type` |
| --- | --- |
| `brief` | `artifact`, `previous` |
| `manuscript` | `brief` accepted review ID, `artifact`, `previous` |
| `render` | `manuscript` accepted review ID, `output`, `artifact`, `previous` |
| `decision` | `scope`, `review`, `author`, `choice` |

`artifact` identifies the immutable inputs and bytes under review. Include the relevant dependency identities in that hash. Resolve source bytes and actual author identity before evaluating records in any future real adapter. `previous` is the review ID current when the result was prepared, or null for a newly empty slot. Returning a candidate assigns a new review ID to the returned slot, so results prepared before the return are refused. An accepted upstream review must match the one used to prepare the result. The run and output selection are stable for the replay.

- **R1, `brief`.** The author can accept or return the current thesis and outline. The author may stop from a pending, accepted or returned brief before any manuscript has been recorded.
- **R2, `manuscript`.** The accepted brief permits a manuscript. A revision invalidates downstream artifacts. A returned candidate must be resubmitted before it can be accepted.
- **R3, `html` or `pdf`.** The accepted manuscript permits each requested rendition. The author can accept, return or defer each separately. A PDF-only reflow leaves R1, R2 and the current HTML decision in place.

The returned decisions describe the supplied synthetic records. This component performs no native launch, authorization, file write or delivery. The existing [reviewer admission contract](WEB-ORCHESTRATION.md#parent-mediated-reviewer-admission) owns independent technical review. The [publisher](ARTICLE-WORKFLOW.md) owns the actual article and PDF. Exercise the model with `node --test tests/orchestration.test.cjs` through the maintained source suite.
