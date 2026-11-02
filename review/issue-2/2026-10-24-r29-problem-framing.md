# Issue 2 / issue 5 — R29 problem statements and planning — 24 October 2026

Editorial/publication owner: [issue 2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution owner and dated amendment: [issue 5 — R29 emphasis correction](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6383375681).
Delivery surface: [existing Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Final clean-source policy and remote readback: [delivery checkpoint](https://github.com/oborskyivitalii/oborskyivitalii/pull/79#issuecomment-6382894842).

Root implemented the authorized revision. Separate Requirements, Code/Artifact, White-box and Exploratory agents inspect the requirements, actual source and affected artifacts. Their original receipts are preserved below, with distinct candidate identities and boundaries. This record describes the prepared working tree based on `e877de50dfa4aa3ce7cf9fed937bc8ea63de4d46`, tree `f7136a92f0457c1e46584a745f1992c2d3a74c4f`. The checkpoint binds the final clean commit without circular self-pinning in a committed report. The remote branch before delivery is `56daee1bde31c64fd2f56db72b8e7676f62fb631`.

## Intent and acceptance

The author found that R28 did not make the two engineering problems central to **How We Build** and **What We Build**, and did not explain clearly enough how correct diagnosis changes planning before implementation. This supersedes the earlier restriction to four short insertions. R29 gives the two problems structural priority and makes their planning consequences explicit. It does not retrospectively label R28 as having met this later emphasis requirement.

| Obligation | Observable result | Evidence and boundary |
| --- | --- | --- |
| R29.1 | A bold delivery-system problem immediately follows Part I's heading, before vendor examples | Source reconstruction and current native source/layout review |
| R29.2 | A distinct bold runtime-control problem immediately follows Part II's heading, including necessary human dependencies | Source/artifact review; reliability and value still require evidence |
| R29.3 | A causal explanation connects framing with pre-implementation risk maps, staffing and operating budgets | Planning paragraph precedes the existing illustrative pilot table |
| R29.4 | Preserve the argument, evidence, qualifications, prompts, figures, tables and contributor dispositions | Exact bounded replacement reconstruction and protected-content comparisons |
| R29.5 | A new current R29 edition and truthful author-origin change record preserve R28 as history | Source/semantic/launch/native identities, history and provenance review |
| R29.6 | Actual native output within unchanged bounds, four executed reviews, unchanged exact-clean-source policy and same Draft PR delivery | Native verification and original reports below; final policy/readback at the checkpoint |

These are scoped obligations beneath the original owning issue criteria. The Requirements preflight preceded implementation. No new approval or publication gate is introduced by this revision.

## Findings and editorial decisions

### How We Build — physical PDF page 3

The first paragraph under `I. How We Build` starts with:

> **The engineering problem is to rebalance the SDLC so that local AI acceleration becomes reliable end-to-end delivery.**

The paragraph explains that code generators and agent workflows **can** accelerate stages, while constraints, quality controls and the capacity to understand and operate the result govern the whole chain. The problem now organizes the following evidence; it no longer appears as a short consequence after an example. The article does not assert that every current SDLC is universally broken or that local improvements can never help overall delivery.

### What We Build — physical PDF page 8

The first paragraph under `II. What We Build` starts with:

> **The engineering problem is to make a system built around stochastic model judgment controllable in a noisy, changing environment.**

The following sentences identify enforceable limits, meaningful signals and timely correction. Where intervention is required, human capacity and authority are architectural dependencies. Reliability and economic value must be established for the whole arrangement. This expresses the author's stochastic-system concern without implying that a control loop guarantees stability or ROI, or that every agent architecture needs identical human intervention.

### Project planning — physical PDF pages 13–14

Before the pilot table, the article now states:

> **Correct problem framing changes the project plan before implementation.** For AI-assisted delivery, plan around the actual constraint and measure whole-system gains. For agentic products, fund evaluation, controls, incident response and human coverage. These dependencies shape risk maps, staffing and operating budgets. Pricing only a generator or workflow hides the system’s full cost.

This is the explicit causal connection requested by the author: diagnosis identifies the work and dependencies; those dependencies determine risk, required capabilities and full operating cost. The next paragraph makes the existing illustrative pilot table a practical consequence of that framing. The table retains its predeclared, illustrative, non-measured and non-universal qualifications.

The sentence **“Faster implementation does not authorise broader runtime judgment.”** remains after the table. Delivery improvements and expansion of runtime authority remain separate decisions.

### Integration and preservation

The opening retains engineering as a cycle of definition, proposed solution, implementation, testing and revision, and explicitly says that a mistaken problem statement can make an efficient solution irrelevant. Eight declared prose replacement regions and three metadata/history replacement regions reconstruct R29 exactly from frozen R28. To fit the unchanged profile, redundant orientation and planning prose is removed and a vendor paragraph is shortened without changing its empirical qualifications.

All 94 ordered Markdown destinations, 49 numeric citation links, 12 standalone prompts, four visible figures, two tables and 36 reference entries with their qualification notes remain. The two contextual destinations for source31 remain distinct. The selected Maximiliano Armesto and Pasquale Langella contributions retain their existing attribution; Olivier Leturcq's feedback remains under consideration. The new emphasis comes from the author. No pending external suggestion is silently accepted, and no private correspondence is reproduced.

R28's source, edition and completed native technical package remain unchanged during this R29 step. Its original failed policy and subsequent technical corrections remain historical evidence with their own identities. Earlier editions are preserved.

## Artifact and provenance identity

| Item | Current R29 identity |
| --- | --- |
| Canonical source | `site/publications/pmday-ai-both-sides/manuscript.en.md`, 50,569 bytes |
| Source SHA256 | `9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e` |
| Edition | `pmday-ai-both-sides-en-review-20261024-r29` |
| Semantic SHA256 | `5b88219df109fc0510deef572baed2c88c7fc2602e3a560cfffae7f4271759d4` |
| Authored launch SHA256 | `33cc5a02419866a26b55ffa59a1a3b65717c8d9636e8b389cefe796696e2480d` |
| Native kit | `8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592` |
| PDF | 22 pages; 1,417,566 bytes; SHA256 `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1` |
| Complete TAR.XZ | 34 exact native members; 3,418,440 bytes; SHA256 `038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089` |
| Generic compiled text | 50,992 Unicode code points, leaving 8 within the unchanged 51,000 bound |
| Emitted article / LinkedIn / Medium TXT | 50,829 code points each |

The [native package README](r29-20261024/README.md) provides deliverables and practical use instructions. [Artifact evidence](r29-20261024/artifact-evidence.json) records full source, edition, producer and member identities. The native pipeline uses Node24.19.0, Chromium153.0.8010.0 and Playwright1.63.0 with the explicit `managedBrowser:false`, `reviewOnly:true` producer. There is no PDF postprocessing. Canonical/accepted-source pins and pending rights are not promoted by a review build.

## Retained technical correction and verification scope

The prior [R28 review](2026-10-24-r28-problem-framing.md) preserves the full original technical correction receipts. Its first exact-clean-source policy on e877 failed four of twelve groups; [the complete original failure](r28-20261024/acceptance-e877-failed.json) remains unchanged. That failure is not attributed to Node and is not relabelled as a pass.

The correction separates canonical upload paths from deployment-specific HTML URLs, preventing hosted image routes from inflating the generic text count. The meaningful boundary test covers both default/custom routes at the exact limit and one code point beyond it. The native print-list correction remains in the producer; generated site identities, Color contract identities and mandatory rights registrations are regenerated/registered coherently. All five browser runtime files remain byte-identical. No existing deadline, count limit, acceptance policy or rejection assertion is relaxed.

Those technical inputs did not change in R29. Their completed independent reviews remain valid for that unchanged scope. R29 adds source/artifact reviews and actual new-page visual checks because the new prose changes layout. The unchanged twelve-group issue5 policy must run once on the final clean commit; preflight, source review or native verification is not a substitute. The final receipt and actual remote readback belong to the linked delivery checkpoint.

## QA design and dispositions

| Risk / obligation | Independent oracle and bounded check | Disposition |
| --- | --- | --- |
| Problem statements remain implicit, R29.1/2 | Actual source order and bold native paragraphs before examples | Source and current-artifact reviews below |
| Planning is merely a list, R29.3 | Read causal dependency-to-risk/staffing/budget sentences before the pilot | Requirements and Code/Artifact semantic review |
| Evidence or caveats lost to fit the budget, R29.4 | Exact declared replacement reversal plus links, prompts, figures, tables, Sources and provenance comparisons | Read-only invariant checks; no new prose-mirroring test |
| Wrong/current edition or incomplete archive, R29.5/6 | Native verifier, semantic digest, PDF/manifest pair, exact archive membership and bytes | Current R29 native checks |
| New prose loses prominence or breaks pagination, R29.1–3/6 | Actual 22-page render and focused pages 3, 8 and 13–14, Contents and bibliography inspection | Current Exploratory report |
| Corrected publishing integration regresses, R29.6 | Existing meaningful route/limit, Color/rights and native checks; final unchanged owning policy | Reuse unchanged correction review; final source-bound run |
| Broad platform/device/publication acceptance inferred from local review | Explicit artifact/producer/origin scope | Native-editor, hosted, device, rights and publication gates stay separate |

## Independent role executions

| Role | Separate agent | Completed result and actual scope |
| --- | --- | --- |
| Requirements / Acceptance | `/root/r28_requirements` | PASS prepared final source/native package; R29.1–5 and artifact/review portion of R29.6 satisfied; exact-clean policy/remote reconciliation pending at checkpoint |
| Code / Artifact Review | `/root/r28_code_correction` | PASS actual final prose and native HTML/PDF/ZIP closure; no blocking finding |
| White-box QA | `/root/r28_whitebox` | PASS exact reconstruction, protected content, native identity/limits and preserved history; no blocking finding |
| Exploratory / Interaction QA | `/root/r28_exploratory` | PASS actual 22-page visual review, navigation and both native copy/paste flows; planning spans pages 13–14; no blocking finding |

The original reports appended below own each review's exact candidate, methods, findings and limits. Earlier proposal reviews retain their earlier source identity; completed final-source reviews identify `9c75ec7b…`. Root's synthesis above does not replace a separate reviewer's decision. Final acceptance and remote reconciliation are appended to the checkpoint after the clean run so that no post-test repository edit invalidates it.

## Sol tasks and ownership

| Task | Owned paths / expected outcome | Obligation | Status route |
| --- | --- | --- | --- |
| T01 | Canonical manuscript, new edition, profile, launch and blueprint; central theses and causal planning | R29.1–5 | Implemented; independent source review |
| T02 | Native R29 package and evidence; current page-level review | R29.5/6 | Built and byte-verified; independent artifact review |
| T03 | Versioned report, repository path inventory and continuity; current RI/CI projection | R29.5/6 | Prepared and refreshed before final commit |
| T04 | Unchanged exact-clean-source policy, same Draft PR and actual issue checkbox reconciliation | R29.6 | Delivery checkpoint owns final result |

## Issue synopsis

R29 makes the two engineering problems the bold opening statements of Parts I and II and explains their consequences for planning before implementation in Part III. Current native PDF locations are pages 3, 8 and 13–14. The evidence, caveats and contributor dispositions remain; R28 and its failure/correction record stay historical. See this report, the package evidence and the final checkpoint for the separate reviewed, tested and delivered states. No merge, staging, platform post or publication is implied.

## Original Requirements preflight (earlier candidate)

Original independent report: `r28-editorial-emphasis-requirements.md`; 13802 bytes; SHA256 `f6e46bf34418c455234f46470b9067fc356485202481c73eb4d4ca4655cd7f63`. The JSON `originalUtf8` field preserves the complete original report, including its intentional Markdown trailing spaces, without adding trailing whitespace to this enclosing file. Decode that field as UTF-8 to recover the exact bytes.

```json
{
  "originalUtf8": "# R29 editorial emphasis — Requirements preflight\n\nDate: 24 October 2026  \nRole: independent Requirements & Acceptance Reviewer  \nExecution owner: issue #5; publication owner: issue #2; delivery surface: existing Draft PR #79  \nDecision: **PASS to implement and compile the inspected R29 editorial candidate.** This is a preflight decision, not final artifact, policy, or remote-delivery acceptance.\n\n## Author intent and why the scope changed\n\nThe latest author feedback says that R28 did not make the two central ideas important and visible in “How We Build” and “What We Build,” and did not clearly explain how understanding those problems changes project planning before implementation. That feedback supersedes the earlier working restriction to four exact insertions. Satisfying this correction requires stronger structure and causal explanation, rather than preserving those four strings for their own sake.\n\nA new R29 is appropriate. R28 remains a real historical edition, including its underemphasis, its review history, its failed exact-source policy attempt, and its subsequently corrected technical artifacts. Existing R28 receipts do not become R29 receipts. No additional user clarification is needed for this bounded editorial correction and its necessary native artifact regeneration.\n\n## Inspected candidate and independent checks\n\nI read the actual candidate and all replacement regions, including the latest three refinements requested during preflight:\n\n- Candidate: /tmp/r29-emphasis-candidate.md\n- Candidate SHA-256: e1ff2ccbfee751e512741ba2f41fda381de8fabe92d04bc73d6449963d468824\n- Candidate size: 50,602 UTF-8 bytes. This is not the native generic-text profile measurement.\n- Replacement specification: /tmp/r29-emphasis-replacements.json\n- Replacement specification SHA-256: 3e37399a1a45bf7b78dd3de26e9afdcf57baeb0715af2884888bf4f53a2a8bc4\n- R28 comparison source: review/issue-2/r28-20261024/The_Sum_of_Our_Technology_R28_2026-10-24.md\n- R28 SHA-256 independently read: 4bc0136b86e46c4792c61791612243e2c0d0b513c2012cbe9baa1bab97223650\n\nApplying the eight declared prose replacement regions and the three declared revision/metadata regions to that R28 source reproduces the candidate exactly. Every prose old-region occurs once; the “Editorial draft R28” metadata label occurs three times and is correctly replaced in all three locations. There is no additional undeclared manuscript change in the inspected candidate.\n\nRead-only structural comparison finds twelve standalone “What if not?” prompts in both versions, four Markdown images, two table separators, and the same 94 Markdown link targets in the same order. The last count includes all kinds of Markdown link targets; it is not a claim of 94 distinct sources or 94 numeric citations. The headings and section organization remain intact. These checks establish the bounded source delta; final native compilation still owns profile measurements and rendered outputs.\n\nNo repository or remote files were modified by this reviewer, and no test suite was run for this preflight.\n\n## Assessment of the actual wording\n\n### How We Build: the first problem is now prominent and distinct\n\nThe first paragraph after the section H2 opens with a bold thesis:\n\n> The engineering problem is to rebalance the SDLC so that local AI acceleration becomes reliable end-to-end delivery.\n\nThe following sentences name code generators and agent workflows as tools that **can** accelerate individual stages, explicitly deny automatic acceleration of the whole chain, and identify constraints, quality controls, and the ability to understand and operate the result as governing delivery. Readers encounter this problem before the vendor discussion and before the existing evidence and examples. That placement remedies the reported visibility problem.\n\n“Can accelerate” is the correct bounded wording. Categorical “optimise” would overstate a positive result that the article's own empirical discussion does not establish for every context. The inspected candidate already includes the correction.\n\nThe first sentence states the engineering objective; it is not presented as a guarantee that rebalancing always succeeds. The conditional argument and existing counterarguments remain important. The text does not need a universal assertion that every current SDLC is broken, or an unsupported general claim that agents can never improve a system.\n\n### What We Build: system control and human dependencies are explicit\n\nThe first paragraph after this section's H2 begins:\n\n> The engineering problem is to make a system built around stochastic model judgment controllable in a noisy, changing environment.\n\nIt then specifies enforceable limits, meaningful signals, timely correction, and conditional human capacity and authority as architectural dependencies. Reliability and economic value must be established for the whole arrangement. This directly expresses the author's second engineering problem, rather than merely announcing the presence of a model or an agent workflow.\n\nThe conditional phrase “Where human intervention is required” is valuable: it makes people explicit where the design depends on them without claiming that every agent architecture always needs the same human role. “Must be established” preserves the need for evidence; it does not promise guaranteed stability, reliability, or ROI.\n\nThe replacement of the old generic runtime orientation and removal of a repeated control paragraph are justified. The existing account-recovery example, implementation definition, sources, and six assumptions carry the thesis into concrete cases.\n\n### Planning: the causal link is now stated rather than implied\n\nThe bold planning sentence says:\n\n> Correct problem framing changes the project plan before implementation.\n\nThe paragraph then distinguishes the two project contexts. AI-assisted delivery must be planned around the actual constraint and assessed through whole-system gains. Agentic products must fund evaluation, controls, incident response, and human coverage. The next sentence links those dependencies to risk maps, staffing, and operating budgets, and the final sentence identifies the cost error in pricing only a generator or a workflow.\n\nThis is a causal explanation with operational consequences, not simply a list of things a project manager should consider. Its position before the pilot decision table makes that table a practical consequence of the framing. The existing “illustrative,” predeclared-criteria, and non-universal-threshold qualifications remain intact.\n\nThe wording “actual constraint” is required here. The initially proposed “fund downstream capacity” would have generalized the particular downstream-bottleneck example into a universal funding prescription. The inspected candidate already corrects it.\n\n### Keep the explicit distinction between implementation speed and runtime authority\n\nThe retained closing sentence is material:\n\n> Faster implementation does not authorise broader runtime judgment.\n\nKeep this sentence. It prevents readers from treating success on the delivery axis as permission to expand consequential runtime judgment on the product axis. The two theses are related, but their evidence and adoption decisions remain separable.\n\nIt is reasonable to remove the repeated instruction to fund and rehearse controls and the generic “expand what works” paragraph when the planning paragraph, pilot decisions, and remaining conclusion already supply those functions. Removing the explicit authority distinction as well would weaken a useful guard in the argument.\n\n### Small surrounding copyedits are bounded\n\nThe vendor paragraph's shortening preserves the date, percentages, forecast horizon, “potentially essentially all” qualification, unverified industry-wide share, vendor-team scope, and lack of independent corroboration. The manuscript link targets remain unchanged. This is acceptable budget recovery; it does not justify cutting empirical caveats elsewhere.\n\nThe revision history is concise and records what R29 actually changes. The candidate's introduction still presents engineering as a cycle and explains that an efficient solution can be irrelevant when the problem statement is mistaken. It also previews the two distinct problems. Additional introductory expansion is unnecessary.\n\n## R29 requirements and observable acceptance\n\n### R29.1 — A visible system-level delivery problem\n\nImmediately after “I. How We Build,” a prominent thesis must identify the system-level problem before examples or vendor claims. The accompanying explanation must distinguish a possible local AI gain from end-to-end SDLC performance, preserve actual-constraint reasoning, and retain the quality and operating capabilities needed to use the result responsibly.\n\n**Prepared candidate:** PASS. The bold thesis and its paragraph satisfy this requirement. Final rendering must preserve the emphasis and location.\n\n### R29.2 — A visible control problem for agentic products\n\nImmediately after “II. What We Build,” a separate prominent thesis must identify control of consequential stochastic judgment in a noisy or changing environment. Its explanation must connect enforceable limits, observable signals, and timely correction to the whole system, including human capacity and authority when intervention is required. Reliability and economics require evidence; they must not be promised as automatic outcomes.\n\n**Prepared candidate:** PASS. The actual first paragraph satisfies the requirement without a universal human-in-the-loop mandate.\n\n### R29.3 — An explicit causal effect on planning\n\nBefore implementation and before the illustrative pilot decisions, the article must explain how correct problem framing changes the project plan. It must connect actual delivery constraints or runtime-control dependencies to risk maps, staffing, and operating budgets, and identify why counting only a generator or agent workflow understates the project.\n\n**Prepared candidate:** PASS. Both problem types have specific planning consequences, followed by an explicit dependency-to-plan connection.\n\n### R29.4 — Integration and preservation of the existing argument\n\nThe stronger theses must organize the existing article rather than duplicate it. Preserve the explicit distinction between faster implementation and broader runtime authority, all twelve standalone “What if not?” prompts, all four figures and two tables, cited evidence and its material qualifications, contributor dispositions, and source links. Do not silently adopt previously pending Olivier proposals. Budget recovery may remove genuinely repeated orientation or planning prose and make meaning-preserving copyedits.\n\n**Prepared candidate:** PASS for the inspected bounded manuscript delta. The exact declared replacements reproduce it, link targets are unchanged, the twelve prompts remain, and the authority distinction is retained. Final artifact review must confirm the corresponding rendered content and current provenance.\n\n### R29.5 — Honest versioning and provenance\n\nCreate R29 as the new current edition dated 24 October 2026, with internally consistent manuscript/citation metadata, current source identity, native package identity, launch/review references, and a provenance account of the author's emphasis correction. Preserve the immutable R28 edition/source and the final R28 technical package already produced, along with earlier review/failure evidence and supersession history. Do not retroactively label R28 reviews or policy results as R29 acceptance.\n\n**Prepared candidate:** Textual R29 identity and concise history are prepared. Edition registration, native outputs, exact hashes, current review records, and preservation of the final R28 package remain to be verified after implementation. The R28 comparison source is independently verified as unchanged at the hash above.\n\n### R29.6 — Native output and exact final delivery evidence\n\nCompile the actual final R29 source through the existing native pipeline, preserve the authored 51,000 generic-text bound and other existing policy requirements, and measure the finished edition after metadata/history are included. The approved print-list repair and canonical profile-path correction must remain effective. Obtain bounded actual reviews of the new source and affected artifacts, then run the unchanged required policy on the exact clean final commit and verify the existing Draft PR's actual head and issue references. Preserve the prior failed R28 exact-source acceptance report rather than treating subsequent repairs as a retroactive pass.\n\n**Prepared candidate:** PENDING implementation and native evidence. The 50,602-byte source length is not a substitute for the compiler's profile count, and prior R28 PDF/page/link observations are not R29 PDF observations. This preflight introduces no additional optional suite or publication approval flow. Merge, stage acceptance, and public release remain distinct from draft delivery.\n\n## Disposition\n\nProceed with the inspected candidate. It resolves the author's complaint through placement, emphasis, and explicit planning causality; the three necessary wording refinements are already present. Freeze the substantive wording for native compilation. If the final native generic-text measurement needs a few characters of margin, shorten ordinary connective prose while preserving the two leading theses, the causal planning paragraph, the authority distinction, and all material empirical qualifications.\n\nFinal acceptance must be based on the resulting R29 source and actual artifacts. There is no unresolved editorial preflight blocker and no reason to ask the author to approve the same intent again.\n\n"
}
```

## Original editorial proposal review (earlier candidate)

Original independent report: `r29-editorial-proposal-review.md`; 5400 bytes; SHA256 `1ba339aa755a170536c70b8a7c130a5efd45047f2f46f9a191fe0f2c9cc6762e`. The following fenced text preserves the original report verbatim.

````markdown
# R29 emphasis correction — independent editorial review of proposal

Reviewer: `r28_code_correction`, independent Code/Editorial reviewer. Date: 24 October 2026. Same issue5/PR79 execution route, issue2 editorial owner. This evaluates the proposed editorial correction after the author said R28 did not make the two section-defining ideas and their planning consequence sufficiently visible. It is not final artifact or clean-source acceptance.

## Inputs inspected

Original author intent in the inherited conversation; the author's objection as forwarded by the orchestrator; the complete proposed replacement list and its placement in the candidate article. No external factual research or technical tests were performed.

- `/tmp/r29-emphasis-candidate.md`: SHA-256 `e1ff2ccbfee751e512741ba2f41fda381de8fabe92d04bc73d6449963d468824`.
- `/tmp/r29-emphasis-replacements.json`: SHA-256 `3e37399a1a45bf7b78dd3de26e9afdcf57baeb0715af2884888bf4f53a2a8bc4`.

## Verdict

**The proposed structure corrects the main editorial failure.** The statements immediately below “I. How We Build” and “II. What We Build” establish the object of engineering before examples or evidence. Part I now names SDLC rebalancing and explicitly denies automatic conversion from local acceleration to whole-chain improvement. Part II now names the system around stochastic judgment, changing conditions, enforceable boundaries, meaningful signals and timely correction, and identifies human capacity/authority as architectural dependencies where intervention is required. These are distinguishable engineering problems, not buried additions to unrelated paragraphs.

Part III makes the practical causal consequence explicit before the pilot table: correct framing changes planning before implementation; the two types of project have dependencies that affect risk, staffing and operating budgets. This answers the author's stated purpose that a company should budget and staff the real engineering problem, rather than price only the visible generator/workflow.

The opening presents engineering as an iterative problem/solution/implementation/test cycle without turning a particular process model into an exhaustive definition. The sentence about an efficiently solved wrong problem establishes why framing matters.

## Recommended refinements

1. Replace the blanket prescription “For AI-assisted delivery, fund downstream capacity” with “For AI-assisted delivery, plan around the actual constraint”, retaining measurement of whole-system gains. Funding more downstream capacity is only one possible treatment; better requirements, intake limits, changed controls or existing spare capacity may be relevant. The framing should guide diagnosis before choosing spend.
2. Restore the concise bridge “Faster implementation does not authorise broader runtime judgment.” This is a distinct logical boundary between the two halves, not just repeated planning advice. Removing it weakens the separation the author wants readers to understand. It can sit between the planning paragraph and the pilot or near the close.
3. Prefer “Code generators and agent workflows can accelerate individual stages” to the categorical “optimise individual stages”. The narrower wording accommodates workflows affecting several stages without conceding automatic end-to-end gains.

A literal “black box” label is unnecessary. The proposed whole-system framing, noisy/changing environment and explicit control dependencies convey the intended challenge more accurately than implying that every component is wholly opaque or that a control loop guarantees stability/ROI. “Reliability and economic value must be established for this whole arrangement” properly states an obligation to produce evidence, not a promised result.

## Compression and preservation assessment

Removing the weaker later delivery sentence and repeated runtime orientation is appropriate because the stronger section openings now perform those jobs. Removing the closing invitation to expand what works/restrict what fails is acceptable: the pilot table and reassessment material already express those decisions. Retain the implementation-versus-runtime-authority bridge noted above.

The vendor paragraph compression retains the stated dates, percentages, source links and limits on inference: vendor self-report remains distinct from independent industry-wide evidence. The construction “Those dates passed” is less natural than “Those dates have passed”; restore “have” if space permits. No new empirical claim is required for these emphasis changes.

The proposal leaves the evidence-bearing body, statistical qualifications, human-control detail and contributor dispositions in place. Exact source reversal, complete citation/prompt inventories, R29 history/current selectors and new native artifact identity remain final-candidate verification obligations; this editorial assessment does not assert they have already executed.

## Outcome

Proceed with the proposed three prominent blocks and the refinements above. The emphasis and placement now match the author's stated intent. Preserve R28 as history and record this as the author's requested emphasis correction; do not attribute it to an external reviewer or claim new empirical findings. Final source/artifact review will assess the actual implemented candidate.
````

## Original final Code / Artifact Review

Original independent report: `r29-code-review.md`; 10814 bytes; SHA256 `6898abff5dd819c829de77858e99875834727798ba202ebb182f55890ebcfa29`. The following fenced text preserves the original report verbatim.

````markdown
# R29 — independent Code / Artifact Review

Date: 24 October 2026. Reviewer: `r28_code_correction`, independently executed Code / Artifact role. Execution owner issue5 / Draft PR79; editorial owner issue2. Scope anchor: https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6383375681.

**Decision: PASS for the inspected R29 source and native artifact scope.** The actual edition now gives the two engineering problems clear section-level prominence and connects them explicitly to planning before implementation. No blocking editorial or artifact finding remains in this review. Final authorial approval, Exploratory visual/interaction results, final clean owning policy and remote delivery are separate gates.

## Inputs and inspected identity

Reviewed the author's original explanation, the explicit objection that R28 did not sufficiently foreground the two problems or the planning consequence, the proposed changes and their actual final implementation. The original proposal review is `/tmp/r29-editorial-proposal-review.md`, SHA256 `1ba339aa755a170536c70b8a7c130a5efd45047f2f46f9a191fe0f2c9cc6762e`.

Git HEAD remains `e877de50dfa4aa3ce7cf9fed937bc8ea63de4d46`; this is a prepared dirty candidate, not an assertion of a checked clean final commit. The content edition is `pmday-ai-both-sides-en-review-20261024-r29`, dated 24 October 2026. Declared semantic SHA256: `5b88219df109fc0510deef572baed2c88c7fc2602e3a560cfffae7f4271759d4`. Canonical source is 50,569 bytes.

Paths below are relative to `site/publications/pmday-ai-both-sides/`.

| Source | SHA-256 |
| --- | --- |
| `manuscript.en.md` | `9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e` |
| `blueprint.md` | `4873d3dd4438840c610ecd0fca88ff53333147910cefdbec3bcf77b41448c15c` |
| `launch-post.en.md` | `33cc5a02419866a26b55ffa59a1a3b65717c8d9636e8b389cefe796696e2480d` |
| `profile.json` | `5b35262a4b2ba539996278ccc1dbeede00f287724fad4bbc30007570bbf00b94` |
| `publication.json` | `8aa99012a3c5a9bbef6f141e96268b5e4ccd40701899d9478aa13f7f744ce664` |
| `editions/pmday-ai-both-sides-en-review-20261024-r29.json` | `201e232b540a950d59b43edf2f2dc73105d73eca71ed2b5bfa9bd734f0ca07d9` |

Current native kit: `8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592`.

## Editorial assessment against the author's intent

### Part I — the delivery system

The first paragraph after “I. How We Build” begins with a bold problem statement about rebalancing the SDLC to convert local AI acceleration into reliable end-to-end delivery. It appears before the vendor examples, empirical findings and queue illustration. The following sentences explain why generators or agent workflows can accelerate stages without automatically accelerating the chain, and retain constraints, quality controls, understanding and operation as system dependencies.

This is now the section's organising proposition rather than a later aside. The qualification “can accelerate” accommodates different tools/workflows; the existing discussion of spare capacity and actual constraints still prevents an assertion that every team has the same bottleneck. The unchanged discussion of functional substitution prevents rebalancing from being read as mandatory preservation of all manual review.

### Part II — the system around runtime judgment

The first paragraph after “II. What We Build” now begins with a bold problem statement about controllable operation around stochastic judgment in a noisy, changing environment. Its immediate continuation identifies enforceable limits, meaningful signals, timely correction, and human capacity/authority where intervention is required. It assigns reliability and economic value to the whole arrangement.

That makes the engineering object larger than a successfully orchestrated agent workflow. It expresses the author's intended control problem without claiming that a model becomes deterministic, a control loop guarantees stability, humans are mandatory in every path, or ROI is guaranteed. The detailed six-assumption discussion remains available to substantiate the framing.

### Part III — why this changes planning

The bold planning sentence explicitly names the project plan and says this happens before implementation. The next sentences distinguish delivery planning around the actual constraint from product planning for evaluation, controls, incident response and human coverage. They connect those dependencies to risk maps, staffing and operating budgets, and identify the cost omitted by pricing only a generator/workflow.

The paragraph directly introduces the pilot decisions, so it has a practical consequence in the article rather than appearing as a general aspiration. My proposed refinement from “fund downstream capacity” to planning around the actual constraint is incorporated. The distinct boundary “Faster implementation does not authorise broader runtime judgment” is restored after the pilot. The other redundant closing/orientation cuts are acceptable compression.

The opening retains the engineering cycle and explains why solving a misframed problem efficiently is insufficient. Tiny later compression changes do not alter those meanings. The vendor paragraph preserves dates, percentages, source destinations, the unverified industry-wide share and the limits of vendor self-report; it introduces no new empirical assertion.

## Preservation and edition currentness

Independently reconstructed the complete final canonical article from e877's R28 source using exactly `/tmp/r29-emphasis-replacements.json`. The reconstructed bytes equal the actual manuscript; no undeclared extra prose change was found.

- All **49 numbered citation number/URL pairs** remain in their original sequence, including the two contextual source31 destinations.
- All **12 standalone “What if not?” prompts**, **four figures** and **two tables** remain. Table lines and the complete Sources & references section are byte-identical.
- The complete contributor provenance block is byte-identical: Maximiliano/Pasquale accepted contributions remain, Olivier's proposals remain under consideration, and the author's editorial responsibility remains explicit.
- The new dated R29 history entry identifies the author's emphasis change; the R28 and earlier history remains.
- The authored launch states the two problems and planning implication; its acknowledgment/status tail is exact. Its actual digest matches the profile.
- Profile changes are only current profile ID and launch digest; both 51,000 limits and every reader/rendition policy remain exact. Publication metadata changes only the current edition selector.
- The earlier R28 edition JSON is byte-identical to e877. R28 canonical Markdown and the completed kit4bf1bc PDF/ZIP remain exact; the new revision does not overwrite them.
- The real-article media test changes only its current revision label, source digest and edition ID. Assertions and reading/media budgets remain.

## Native artifact inspection performed

Directly verified all **11 source inputs**, **16 producer inputs** and **33 declared outputs** against current bytes. The ZIP contains exactly **34 unique native files**, with exact native member names and bytes. Delivered Markdown equals canonical source and native `article.md`; delivered PDF equals native `article.pdf`.

Parsed all six actual HTML forms using the standard-library HTML parser: ordinary article, print, LinkedIn, Medium and both copy-ready forms. In every form, each Part I/II heading is followed by the expected problem paragraph with its leading sentence in a `strong` element. The explicit bold planning paragraph precedes the pilot introduction; the implementation/authority boundary and prompt inventory remain. This structural check supplements the editorial reading; it is not described as visual/browser interaction testing.

Read the actual PDF with `pdfinfo` and extracted its text. It has **22 pages**; the delivery problem is on **page3**, runtime problem on **page8**, and planning implication on **page13**. Visual legibility, clipping, navigation and actual copy/paste are owned by the separate Exploratory role.

| Artifact / metric | Actual value |
| --- | --- |
| PDF | 1,417,566 bytes; SHA256 `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1` |
| ZIP | 6,525,139 bytes; SHA256 `40c376d6139d6d551a1a429e5a5dbb3e0a9807246b618bb9711af85546635117` |
| Generic compiled text | 50,992 Unicode code points, recorded in the native build receipt; eight below the unchanged local bound |
| Emitted article / LinkedIn / Medium TXT | 50,829 code points each, independently counted from actual files |

The package README and evidence agree with the inspected identities and correctly disclose review-only Chromium153.0.8010.0 / Playwright1.63.0, Node24.19.0, pending rights and null accepted-source/canonical pins. A local profile bound is not misrepresented as a platform-wide service limit.

## Technical scope and remaining gates

All nine source/test files from my preceding technical-correction review retain exactly the hashes recorded in `/tmp/r28-code-policyfix-final.md`. There is no new publisher, print, runtime, rights-guard, test-policy or deadline change for this editorial revision. The earlier source-bound correction review remains applicable to those unchanged files. Its original failed policy and failed diagnostic remain preserved rather than being relabelled as a current pass.

`git diff --check` passed. No broad or additional technical test suite was run for this editorial review. The final unchanged issue5 policy must still run on the final clean candidate or be established by matching exact-source CI. Reviewed prepared source, complete automated acceptance, author approval, hosted admission and publication are distinct observations.

Applicable style dispositions: CS01/02/04 canonical prose/profile/edition and generated-artifact ownership; CS05 focused source/identity changes; CS08 meaningful reuse of unchanged implementation tests plus actual changed-artifact inspection; CS09 bounded guard remains a separate final check; CS10 dated author scope, preserved history and exact evidence. No new CSS/lifecycle/performance behavior invokes a fresh CS03/06/07 implementation review.

## Original supporting receipts

- `/tmp/r29-code-source-evidence.json`: SHA256 `04c7b085e1b8cbdbccbd1039a62ade24398656f2243286759a5dc0aae9db5158`.
- `/tmp/r29-code-artifact-evidence.json`: SHA256 `2317377f397a0827c5cc54954bcaaaa5823c65ff20c17c0fce5415fff531dde8`.

No repository source or remote state was edited by this reviewer. Final clean policy, final metadata/RI freshness and Draft PR delivery remain orchestrator-owned; merge, rebase, staging and public posting are not authorized by this review.
````

## Original final White-box QA

Original independent report: `r29-whitebox.md`; 9104 bytes; SHA256 `72140cc68bead85a4826f2e138a5ed4e858149c412d0a48473296ed41f37c636`. The following fenced text preserves the original report verbatim.

````markdown
# R29 independent White-box QA

**Reviewer:** `/root/r28_whitebox`. **Date:** 24 October 2026. **Disposition: PASS for the bounded R29 source, native artifact and delivery-byte scope.** No blocking structural defect found. This report does not establish a final clean-source owning-policy pass or replace Exploratory visual/interaction review.

## Scope and inspected candidate

Reviewed `/workspace/scratch/c91ea22e72f1/author-site`, prepared on `e877de50dfa4aa3ce7cf9fed937bc8ea63de4d46`, under [issue5's R29 scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6383375681). The author requested stronger emphasis after R28: make the two engineering problems section-defining statements and expose the causal consequence for risk, staffing and budgets before implementation.

Inputs inspected include the actual source/profile/publication/launch/test diffs, `/tmp/r29-emphasis-replacements.json`, the independent editorial proposal review, the frozen R28 manuscript and kit, the complete R29 native manifest/resources/outputs, and the refreshed R29 README and artifact evidence. This role made no repository or remote changes. Only original temporary QA receipts and this report were written.

## Independent risk-to-oracle results

| Risk | Actual independent oracle | Result |
| --- | --- | --- |
| Unapproved extra wording or missing requested changes | Apply all eight prose replacement rules and three metadata rules to the exact frozen R28 Markdown; compare the complete result with current source | PASS, byte-exact reconstruction. Each prose rule occurs once; the shared revision-label rule updates three occurrences. |
| Stronger emphasis displaces evidence or qualifications | Compare complete Sources and Review provenance blocks, old revision history after removing only the new R29 line, all ordered link destinations, prompts, image definitions and table rows | PASS: 36 bibliography entries, 49 numeric source markers, 12 standalone prompts, four figures and two tables retained; previous contributor dispositions remain exact. |
| Edition or launch pins do not describe actual bytes | Run native `semanticDigest` and `loadArticle`; hash source and launch; compare normalized metadata/profile to R28 | PASS: new source and semantic identities agree; publication changes only edition, profile semantics only ID and launch hash; existing controls/limits remain unchanged. |
| Hosted rendering again inflates the count | Execute default and actual `assetName`-mapped `loadArticle` routes with pinned Node 24.19.0; compare text, Markdown and mapped HTML | PASS: both count 50,992; text/Markdown exact; HTML differs only by requested image URL mapping. Both authored limits remain 51,000. |
| Artifact source, producer or resource identities are stale | Run current `verifyKit` and `verifyPrintPair`; independently hash all source inputs, producer inputs, PDF resources and complete output inventory | PASS: 11 source inputs, 16 producer inputs, seven print resources, 33 declared outputs plus manifest. All producer inputs match the reviewed R28 technical correction exactly. |
| New passages are absent from an output | Parse paragraphs in all six HTML forms; independently extract complete critical paragraphs from the PDF | PASS: all six checked paragraphs are present in every HTML form and the 22-page PDF. The section statements are on pages 3 and 8; planning consequence is on page 13. |
| Delivered files differ from verified native files | Compare every ZIP member, inventory and alias; reconcile all evidence hashes and sizes to actual files | PASS: 34 unique ZIP members, no missing/extra member, every member byte-exact; delivered Markdown/PDF equal native aliases. |
| Historical artifacts or existing technical controls are silently rewritten | Compare 52 baseline frozen edition/review files, R28 edition record and delivered MD/PDF/ZIP; verify immutable R28 kit; check previously reviewed mechanism hashes | PASS: all preserved. The only new article-media test changes are the current test name, source SHA and edition ID. |

The two bold statements are the first paragraphs immediately below Parts I and II. The planning statement precedes the pilot table, and the bridge distinguishing implementation speed from broader runtime authority remains. Full-source reconstruction bounds the compression to the declared edits; the evidence-bearing tables and existing control detail are unchanged.

The complete source gains 105 code points while the body before Sources gains 34. The generic rendered text gains 89, reaching **50,992**, with **eight code points of headroom**. Each emitted article/LinkedIn/Medium TXT contains **50,829** code points; the three TXT files are byte-identical. These are local authored profile bounds, not independently established service limits. Any further source addition requires a fresh count and identity refresh.

## Exact current identities

| Item | Verified identity |
| --- | --- |
| Edition | `pmday-ai-both-sides-en-review-20261024-r29` |
| Manuscript SHA256 | `9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e` |
| Manuscript size | 50,569 bytes |
| Semantic SHA256 | `5b88219df109fc0510deef572baed2c88c7fc2602e3a560cfffae7f4271759d4` |
| Launch SHA256 | `33cc5a02419866a26b55ffa59a1a3b65717c8d9636e8b389cefe796696e2480d` |
| Native kit | `8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592` |
| PDF SHA256 | `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1` |
| PDF size/pages | 1,417,566 bytes / 22 actual pages |
| ZIP SHA256 | `40c376d6139d6d551a1a429e5a5dbb3e0a9807246b618bb9711af85546635117` |
| ZIP size/members | 6,525,139 bytes / 34 unique members |

The native kit is under `dist/publications/pmday-ai-both-sides/`; delivered aliases and evidence are under `review/issue-2/r29-20261024/`. The PDF render artifact is `d6892f183263122fd370e50026aee1dd85d44c1f89ff513b23a1d9175e79c0e1`.

Source status remains `working-tree-review`; accepted-source commit/blob pins and canonical URL remain null, with rights pending. The same disclosed review producer remains Chromium 153.0.8010.0 / Playwright 1.63.0, `managedBrowser:false`, `reviewOnly:true`, Node 24.19.0. Browser/package identities and resource limits match the preceding reviewed kit.

## Evidence boundaries and preserved history

The native compiler's child process was initially blocked by the sandbox. The identical bounded read-only verification then executed with approved subprocess escalation. No generation, download or broad test suite was run by this reviewer. Native semantic/count verification was independently executed, not inferred from root's build-result summary.

PDF paragraph comparison is an extraction oracle. It removes verified leading page-number lines, normalizes whitespace, and joins hyphenated line wraps such as `AI-` followed by `assisted`; it removes no article words. It does not establish visual hierarchy, marker visibility, navigation behavior or actual copy interactions. Those require the separate Exploratory report. The new PDF is not declared pixel-equivalent to R28 because R29 intentionally changes its text and flow.

The R28 source and immutable kit `4bf1bcf7c8346d312a7f59299c4fe5c472bd91f79231be806d801f0c8e871996` remain verified historical artifacts. Its delivered Markdown, PDF and ZIP retain the exact hashes in the preceding technical White-box report. The original failed e877 acceptance report remains byte-exact with SHA256 `066c5dd5fac7b74847a9e0627d746d8b87627a46f249fb6e710547448d9242c9`; it is not treated as R29 passing evidence.

The reviewed stable-upload-path correction, its boundary regression, Color runtime identities and licensed-package checks retain their previously verified hashes. Their unchanged mechanisms may reuse that technical evidence; this report newly verifies the R29 content and its outputs. It does not repeat the initial R28 blanket protected-file count as a claim about the final corrective worktree.

Final exact-clean-source policy, actual Draft PR delivery/readback, author approval, rights clearance, native-editor transfer, hosted/device acceptance, publication and merge remain separate gates. No such completion is claimed here.

## Original supporting receipts

- `/tmp/r29-whitebox-source.json` — SHA256 `a71134d11285d9c99bef65a627fa4d0cd01f075086d36e13aba857fd6b1cbcec`.
- `/tmp/r29-whitebox-native.json` — SHA256 `04a3c6623c49b4f32019ec6de4481bd44879d9c981c079d6727572697e685e55`.
- `/tmp/r29-whitebox-closure.json` — SHA256 `e949792cfd37fa6032d4334cf8cf172b9005afd8b5160f17872923ca8b7dcce6`.
- `/tmp/r29-whitebox-delivery.json` — SHA256 `52fb24c393b0276534b8f9e83613b1952c840e26a68010ff8c40d86ed66bab0d`.

**Conclusion:** R29 implements the declared emphasis correction without changing the preserved evidence and control detail, satisfies the unchanged authored bounds on both routes, and closes its final delivered native package to the actual reviewed source and producer inputs. No additional broad suite is required from this role; the root-owned final policy remains authoritative.
````

## Original final Exploratory / Interaction QA

Original independent report: `r29-exploratory.md`; 12662 bytes; SHA256 `9ffae900a336feae7770765088beeae57b236b5cdf9c4d166dff386293fc073b`. The following fenced text preserves the original report verbatim.

````markdown
# R29 independent exploratory / interaction QA

Date: 24 October 2026. Reviewer: `/root/r28_exploratory`.
Repository: `/workspace/scratch/c91ea22e72f1/author-site`.
Execution owner issue 5 / Draft PR 79; editorial owner issue 2.

## Conclusion

**PASS within the native-artifact, layout, navigation and local-copy charter. No blocking issue found.** The actual R29 PDF foregrounds the delivery problem directly below Part I and the runtime-control problem directly below Part II. The planning paragraph has a bold causal opening and connects these problems to risk maps, staffing and operating budgets. Its physical extent is **pages 13–14**, not page 13 alone.

All 22 actual PDF pages were rendered and visually inspected through six contact sheets, followed by individual full-page inspection of pages 3, 8, 13 and 14. All bibliography numbers 1–36 are visible, with no recurrence of the inherited EQ01 clipping. Current PDF/HTML navigation and actual local clipboard checks passed. The report approves this bounded artifact experience; it is not final author acceptance, platform upload acceptance or a claim of whole-policy success.

## Exact artifact and source

| Item | Identity |
| --- | --- |
| Native kit | `dist/publications/pmday-ai-both-sides/8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592` |
| Source SHA256 | `9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e` |
| Semantic SHA256 | `5b88219df109fc0510deef572baed2c88c7fc2602e3a560cfffae7f4271759d4` |
| Content edition | `pmday-ai-both-sides-en-review-20261024-r29` |
| PDF SHA256 | `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1` |
| PDF size / pages | 1,417,566 bytes / 22 physical pages |
| Export stylesheet SHA256 | `45b6773ce87ae21198bc2b5ca2ec2711e1a0c242e61a9fc88b94aef528752a27` |
| Reviewed state | Working-tree review source, exact kit bytes; no repository mutation by reviewer |

Independently hashed the native Markdown and PDF. The delivered MD and PDF aliases under `review/issue-2/r29-20261024/` match those native files byte for byte. The build metadata used for artifact selection is `/tmp/r29-build-result.json`; identity and checks above were executed on the actual files, not inferred solely from that metadata.

## Charter, risk and coverage

| Risk | Case and oracle | Result |
| --- | --- | --- |
| Revised emphasis is present in text but weak or clipped in the actual PDF | View all native pages, then inspect the two bold opening theses and planning paragraph at full page size | Clear Part I thesis on p3; Part II thesis on p8; planning on pp13–14; no lost/clipped text |
| New prose causes harmful reflow or restores clipped numbered references | Inspect page continuity, margins, figures, tables, references and historical sections across all 22 pages | No harmful reflow or marker clipping; ordinary page splits recorded below |
| PDF Contents/outline points to stale page positions | Resolve all actual Contents targets and outline entries against actual destination-page heading text; outline vertical target within 8 points of heading | 23 Contents destinations and 24 outline entries pass; no duplicated labels |
| Native forms drop new prose, citations, contributors or structural content | Parse all six actual HTML forms; compare ordered numeric citation number/URL pairs to source and PDF; open all six forms in Chromium | 49 numeric citation pairs exact; 23 Contents anchors per form; four decoded figures; declared tables/row fallback intact |
| Copy-ready HTML loses emphasis or resources during paste | Actual keyboard Copy/Paste for each platform form into a local contenteditable surface, then inspect pasted DOM and screenshots | Both retain four data-URI images, 49 numeric links, eight labelled table rows, new text and all three bold thesis openings |

Root AGENTS, the relevant CONTRIBUTING independent four-role/exploratory protocol and the PDF skill were already read during this continuous review. The R29 task narrows the follow-up to current native artifacts and reader interactions. Unchanged producer/code and runtime reviews were not repeated. No broad hosted/device, performance or unrelated test campaign was run.

## Actual visual observations

Rendered `article.pdf` with Poppler `pdftoppm -png -r 105`. Original page PNGs are `/tmp/r29-exploratory-pages/page-01.png` through `page-22.png` (868×1228). Six contact sheets cover pages 1–4, 5–8, 9–12, 13–16, 17–20 and 21–22; each was actually opened with `view_image` at original detail. Pages 3, 8, 13 and 14 were then individually opened at original detail. Text extraction supplemented these visual observations and did not replace them.

- **Reader orientation:** p1 shows the R29 edition, title, author, summary and readable Contents. P2 retains the cover, credit, introductory scenario, engineering cycle and the two-problem orientation. The prior R28 lone “consciousness.” continuation at the top of p3 is absent; the complete paragraph now fits on p2.
- **Delivery thesis, p3:** the bold sentence beginning “The engineering problem is to rebalance the SDLC…” sits immediately below “I. How We Build”, before the first subordinate heading and its empirical discussion. The whole paragraph is on the same page and clearly legible. This gives the thesis clear structural prominence.
- **Runtime thesis, p8:** the bold sentence beginning “The engineering problem is to make a system built around stochastic model judgment…” sits immediately below “II. What We Build”. The supporting sentences about enforceable limits, signals, correction, human capacity/authority, reliability and economic value remain together on that page. The following subsection is separated by appropriate spacing.
- **Planning, pp13–14:** the bold causal sentence “Correct problem framing changes the project plan before implementation.” and the delivery/product-specific planning examples appear at the bottom of p13. The paragraph continues at the top of p14 with risk maps, staffing, operating budgets and full system cost. No words are missing or clipped. This is a normal multi-line paragraph split, not an orphaned heading or a blocking defect. Root was notified and will describe the extent as pp13–14.
- **Figures:** the four retained figures are visible and legible: cover p2, delivery illustration p4, requirements/boundaries illustration p9, production control-loop illustration p13. Captions and credits remain visible. The synthetic/illustrative qualifications remain present.
- **Tables:** the observed-outcome table spans pp9–10 with a repeated header and intact rows. The five-row pilot-decision table remains complete and legible on p14. No cell overflow, overlapping text or lost row was observed.
- **References:** numbers 1–5 appear on p15, 6–10 on p16, 11–17 on p17, 18–24 on p18, 25–31 on p19 and 32–36 on p20. Every marker is visibly complete, including all two-digit tens digits. Independent text/coordinate enumeration also finds exactly 1–36 in order, with two-digit marker x0 approximately 52.84 PDF points. This confirms the R28 print-indent repair remains effective on actual R29 output.
- **Provenance/history:** p21 contains the R29 citation example and BibTeX, all three contributor paragraphs, Olivier’s pending editorial consideration and the author’s retained responsibility. Revision history begins on p21 with R29; p22 continues R28 and older entries. The continuation is complete and the short final page is readable.
- **Bounded typography observations:** ordinary paragraph continuations remain, including one line at the top of p4 and the planning split across pp13–14. Standalone “What if not?” prompts still sit near the bottoms of pp4–5. The final history page is short. These are nonblocking cosmetics, not a basis for expanding this revision or changing approved prose. There is no body overlap, cropped figure, missing content page or visible reference-number loss.

## Source, navigation and native HTML checks

The Python audit uses PyMuPDF, pypdf and Python’s standard HTMLParser. It checks all six actual native forms: `article.html`, `print.html`, `linkedin.html`, `medium.html`, `linkedin-copy-ready.html` and `medium-copy-ready.html`.

All six contain the same 49 ordered numeric citation number/URL pairs, each found in order in the exact R29 source. The actual PDF’s 49 numeric URI links match those pairs. All 23 HTML Contents links resolve to a heading with matching text; all 23 actual PDF Contents destinations resolve to the destination page containing that heading. All 24 PDF outline entries have clean labels and target the corresponding heading’s page and vertical location. No old duplicated-outline-label issue reproduces.

All four revised opening sentences were independently located in extracted PDF text: engineering cycle p2, delivery thesis p3, runtime thesis p8 and planning causal opening p13. The planning continuation was additionally inspected visually on p14. Current R29 history is present. These are exact checks of the changed passages and citation/navigation contracts, not a claim that extraction alone proves complete visual fidelity.

The two native article/print forms have four figures, two native tables and 23 h2/h3 headings. The four platform forms have four figures and the declared eight labelled row sections instead of native tables, giving 31 h2/h3 headings. This matches the unchanged platform transformation contract; it is not a table omission defect.

## Actual local browser and clipboard interaction

Environment: Chromium 153.0.8010.0, Playwright 1.63.0, pinned Node v24.19.0, viewport 1280×900, local ephemeral loopback server serving exact kit bytes. Nonlocal browser requests were blocked. No sign-in, platform editor, message, deployment or posting was used.

Opened all six native HTML forms and decoded all four article images in each. Every form exposes the R29 edition/history and all three contributor names. In the actual `article.html`, clicked **all 23 Contents links**, verifying the intended hash, exact heading text and an on-screen heading position.

For **each** of LinkedIn and Medium copy-ready forms, selected the article and used actual keyboard `Control+C` and `Control+V` into a local contenteditable surface. Each pasted result retained:

- Four embedded data-URI images and all 49 numeric citation URLs.
- All four revised passages and the three bold thesis openings for delivery, runtime and planning.
- All eight labelled table-row sections, with no unplanned native table conversion.
- Maximiliano Armesto, Pasquale Langella and Olivier Leturcq; Olivier’s pending editorial disposition; author responsibility; R29 and prior history.

Both local-paste screenshots were successfully captured and actually viewed. They show readable R29 citation/provenance/history content and preserved contributor/history emphasis. The full pasted DOM checks establish the other retained passages and structures. This is evidence for local rich-text copying, not a claim that either proprietary editor will import every format unchanged. The earlier R28 hosted-preview screenshot timeout is a separate historical environment limitation; it did not recur in these current native screenshot captures.

## Original receipts and reproducibility

| Evidence | SHA256 |
| --- | --- |
| `/tmp/r29-exploratory-artifact.json` | `74580ea73e09206bdd9e97b608a717d83fedcf88d93136c91f54642c84b85c6d` |
| `/tmp/r29-exploratory-browser.json` | `acf334c6f13741bcf0a19b210238f00b41ca406aa6c4d0e853cc887ec3d1ed31` |
| `/tmp/r29-exploratory-linkedin-paste.png` | `3721073397e7ec40d04b9b103a17ec550e80e91e3fe6dcefb557495f54b1bb4e` |
| `/tmp/r29-exploratory-medium-paste.png` | `3721073397e7ec40d04b9b103a17ec550e80e91e3fe6dcefb557495f54b1bb4e` |

Drivers: `/tmp/r29-exploratory-audit.py` and `/tmp/r29-exploratory-browser.cjs`. Original page PNG hashes are retained in the artifact receipt. Both scripts completed successfully. Earlier R28 reports/receipts remain unchanged and are not relabelled R29 evidence.

## Boundaries

No manuscript, stylesheet, source code or delivered artifact was edited by this reviewer. No claim is made about external source availability, renewed factual research, a hosted R29 preview, a device matrix, accessibility/performance certification, publication rights, native LinkedIn/Medium acceptance or the final owning-policy gate. Those are outside this bounded review. On the actual source-bound R29 native artifact, layout, navigability, new emphasis and local-copy preservation pass with only the nonblocking pagination observations above.
````

## Original final Requirements / Acceptance Review

Original independent report: `r29-requirements-final.md`; 15851 bytes; SHA256 `684d987aa6a7aacde560266dad617b05f5763c69370c4f1f7169cbd51d391006`. The JSON `originalUtf8` field preserves the complete original report, including its intentional Markdown trailing spaces, without adding trailing whitespace to this enclosing file. Decode that field as UTF-8 to recover the exact bytes.

```json
{
  "originalUtf8": "# R29 independent Requirements & Acceptance review\n\nDate: 24 October 2026  \nReviewer: /root/r28_requirements  \nExecution owner: issue #5; editorial/publication owner: issue #2; delivery surface: existing Draft PR #79\n\n**Decision: PASS for the prepared R29 source and native artifact requirements. R29.1–R29.5 are satisfied within this inspected scope. The artifact/review portion of R29.6 passes; final clean-source policy, repository metadata closure, and actual remote delivery remain pending and require their own receipt.** No additional editorial or artifact change is requested by this review.\n\n## Intent and applicable acceptance\n\nThe author's latest objection was that R28 did not make the two engineering problems central to “How We Build” and “What We Build,” and did not explain their effect on planning before implementation. This overrides the earlier working restriction to four exact insertions. The accepted scope is a new R29 edition with prominent, distinct problem statements and a causal planning explanation, preserving the prior argument, evidence, qualifications, and history.\n\nThe Requirements preflight at /tmp/r28-editorial-emphasis-requirements.md preceded implementation. Its original bytes remain unchanged: SHA256 f6e46bf34418c455234f46470b9067fc356485202481c73eb4d4ca4655cd7f63. This completed review assesses the actual final source and artifacts rather than silently changing that earlier proposal's identity.\n\nR29.1–R29.6 are bounded obligations beneath the existing issue criteria; they do not replace or weaken the owning acceptance policy. The unchanged .github/acceptance/issue-5.json still has SHA256 27ad8e1dd6f328c5cfeebd48b572abc365e9fdd9c3296be06ea6bd0f4c451429. The four independently executed review roles and the final exact-clean-source policy remain distinct evidence.\n\n## Actual inspected identities\n\nThe worktree is prepared on e877de50dfa4aa3ce7cf9fed937bc8ea63de4d46. This report does not claim the candidate is already a new clean commit or that the remote PR has advanced.\n\n| Item | Inspected identity |\n| --- | --- |\n| Canonical manuscript | site/publications/pmday-ai-both-sides/manuscript.en.md |\n| Source SHA256 | 9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e |\n| Source size | 50,569 UTF-8 bytes |\n| Current edition | pmday-ai-both-sides-en-review-20261024-r29 |\n| Semantic SHA256 | 5b88219df109fc0510deef572baed2c88c7fc2602e3a560cfffae7f4271759d4 |\n| Authored launch SHA256 | 33cc5a02419866a26b55ffa59a1a3b65717c8d9636e8b389cefe796696e2480d |\n| Native kit | 8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592 |\n| PDF | 22 pages; SHA256 7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1 |\n| Complete native ZIP | 34 unique members; SHA256 40c376d6139d6d551a1a429e5a5dbb3e0a9807246b618bb9711af85546635117 |\n| Native generic compiled text | 50,992 Unicode code points against the unchanged 51,000 bound |\n| Emitted article / LinkedIn / Medium TXT | 50,829 code points each |\n\nThe delivered files are under review/issue-2/r29-20261024/. I independently compared the delivered Markdown to canonical source and native article.md, the delivered PDF to native article.pdf, and every one of the 34 ZIP members to its actual native bytes. All match. The three emitted TXT counts were independently counted from their actual files. White-box QA independently executed the native compiler and verified the 50,992 generic count on both default and actual mapped-asset routes.\n\nThe review-only producer and rights boundaries remain explicit: Node24.19.0, Chromium153.0.8010.0, Playwright1.63.0, managedBrowser:false, reviewOnly:true; source commit/blob and canonical URL remain null; rights remain review-pending. A local profile limit is not presented as an independently established LinkedIn or Medium service limit.\n\n## Final-source reconciliation with the preflight\n\nThe preflight reviewed candidate e1ff2ccbfee751e512741ba2f41fda381de8fabe92d04bc73d6449963d468824. Only two subsequent compressions distinguish it from the final source:\n\n1. The introduction's “implement it, test it, and revise in light of the results” becomes “implement, test, and revise against evidence.”\n2. The R29 history entry becomes “Foregrounded both problems and their planning implications.”\n\nBoth keep their meaning. The final manuscript is 33 UTF-8 bytes smaller than the proposal. I reversed exactly these two changes in memory and reproduced the original preflight SHA256, proving that the leading theses, their supporting paragraphs, the complete causal planning paragraph, and the implementation/authority distinction did not change after that review.\n\nI also applied all eight final declared prose replacement regions and three revision/metadata regions to the exact frozen R28 source. The resulting bytes equal the actual final canonical R29 source and delivered alias. This bounds the complete editorial change rather than relying on a summary of intent.\n\nNo further compression of the main theses is needed. The actual generic count is within the unchanged bound, with eight code points remaining. Additional manuscript changes would require new source/native identities and a refreshed count; no such change is part of this disposition.\n\n## Requirement-by-requirement adjudication\n\n### R29.1 — A visible system-level delivery problem: PASS\n\nThe bold problem statement is the first paragraph immediately after “I. How We Build,” before the vendor claims and examples:\n\n> The engineering problem is to rebalance the SDLC so that local AI acceleration becomes reliable end-to-end delivery.\n\nIts continuation explains that generators and agent workflows **can** accelerate individual stages, while local gains do not automatically accelerate the chain. Constraints, quality controls, understanding and operation remain delivery dependencies. The later planning paragraph explicitly says to plan around the actual constraint.\n\nThis expresses the author's system-level problem with appropriate qualifications. It does not turn one queue illustration into a universal downstream-bottleneck rule, claim that local improvements can never help, or declare every SDLC universally broken. The existing counterarguments and discussion of replacing functions responsibly remain.\n\nCode/Artifact and Exploratory separately confirm the structural placement in all six HTML forms and clear visible emphasis on physical PDF page 3. The thesis and its supporting paragraph remain together there.\n\n### R29.2 — A visible control problem for agentic products: PASS\n\nThe bold first paragraph after “II. What We Build” identifies a system built around stochastic model judgment in a noisy, changing environment. It names enforceable limits, meaningful signals and timely correction as necessary design work. Where human intervention is required, human capacity and authority are architectural dependencies. Reliability and economic value must be established for the whole arrangement.\n\nThis is the intended second problem at section level, not merely an announcement that the product uses an agent. The conditional human wording avoids prescribing the same human role for every architecture. The need to establish reliability and value avoids promising deterministic model behavior, guaranteed stability or guaranteed ROI.\n\nThe actual HTML forms retain this emphasis. Exploratory directly inspected the full opening paragraph on PDF page 8 and found it legible and visually prominent.\n\n### R29.3 — An explicit causal effect on planning: PASS\n\nThe paragraph before the pilot table begins in bold:\n\n> Correct problem framing changes the project plan before implementation.\n\nThe following sentences distinguish delivery planning around the actual constraint and whole-system gains from product planning for evaluation, controls, incident response and human coverage. Those dependencies explicitly shape risk maps, staffing and operating budgets. The final sentence explains the cost omitted by pricing only a generator or workflow.\n\nThe reasoning now has a visible causal chain: identifying the real problem reveals necessary work and dependencies; those dependencies change the plan before implementation. The illustrative pilot table follows as an application of that framing. Its original predeclared, non-measured and non-universal qualifications remain.\n\nThe actual planning paragraph starts on PDF page 13 and continues onto page 14. Exploratory inspected both pages and found no loss or clipping; the normal paragraph split does not invalidate the emphasis or cause a blocking layout defect. I requested that the location metadata reflect the full span. Root updated artifact-evidence.json to planningConsequence:[13,14] and aligned the README, report and MEMORY. I independently read the corrected evidence field. This is a locator correction, not an artifact change or reason to rebuild.\n\n### R29.4 — Integration and preservation of the argument: PASS\n\nThe introduction still presents engineering as a cycle and explains why a mistaken problem statement can make an efficient solution irrelevant. Repeated orientation and planning sentences are removed to make space for stronger structural framing. The retained sentence “Faster implementation does not authorise broader runtime judgment” preserves the distinction between the delivery and product-authority decisions.\n\nIndependent comparisons establish:\n\n- All 94 Markdown link targets remain in their original order; the separate Code/White-box/Exploratory checks confirm all 49 numbered citation number/URL pairs.\n- The entire Sources & references section and all table lines are byte-identical.\n- All twelve standalone “What if not?” prompts, all four figures, and both tables remain.\n- The complete contributor-provenance block is byte-identical. Maximiliano Armesto and Pasquale Langella retain their existing attributions; Olivier Leturcq's feedback remains under consideration.\n- The vendor-paragraph shortening preserves its dates, percentages, forecast qualification, unverified industry-wide share, vendor-report scope and lack of independent corroboration.\n- Earlier revision history is preserved, with one new R29 entry.\n\nThe source reconstruction excludes undeclared manuscript changes. The source and native checks therefore support preservation as well as the positive emphasis change. No pending external proposal has been silently adopted.\n\n### R29.5 — Honest versioning and provenance: PASS for the prepared current edition\n\nR29 is the current edition, dated 24 October 2026. Its header, prose citation and BibTeX agree. The new source and semantic identities, launch digest, edition selector, native package and delivered aliases describe the same candidate. The authored launch now states both engineering problems and their planning implication while retaining the contributor dispositions and draft-review status.\n\nI read the main R29 review, package README and artifact evidence. They describe the author's emphasis objection and resulting correction, preserve the distinction between the earlier proposal and actual final source, and keep draft review separate from publication. The final planning locator is current at pages 13–14. Root's record is a synthesis and route to the original role receipts, not a substitute for their separate decisions.\n\nThe frozen R28 source independently retains SHA256 4bc0136b86e46c4792c61791612243e2c0d0b513c2012cbe9baa1bab97223650, and its edition record is byte-identical to e877. Code and White-box also verified the complete historical R28 technical kit 4bf1bcf7c8346d312a7f59299c4fe5c472bd91f79231be806d801f0c8e871996 and older frozen records. The original failed e877 policy remains byte-exact at SHA256 066c5dd5fac7b74847a9e0627d746d8b87627a46f249fb6e710547448d9242c9. I independently hashed that preserved failure. It is not relabelled as R29 passing evidence.\n\nDurable inclusion of all final original reports, deterministic RI/CI refresh and clean-commit closure belong to the remaining final delivery step. Their completion is not inferred from the prepared source.\n\n### R29.6 — Native output, independent reviews and exact delivery: PARTIAL, with final policy/delivery explicitly PENDING\n\nThe current native artifact component passes. The unchanged authored count bound is met on both native routes; all aliases and ZIP members close to the actual source and producer. The previously approved print-indent and canonical-upload-path fixes remain, with no further producer or runtime change for R29.\n\nI read the three other original completed role reports, not just their summaries:\n\n| Role and original report | SHA256 | Actual scope |\n| --- | --- | --- |\n| Code/Artifact — /tmp/r29-code-review.md | 6898abff5dd819c829de77858e99875834727798ba202ebb182f55890ebcfa29 | Source meaning and preservation, edition/launch identity, all six native HTML forms, native source/producer/output closure |\n| White-box — /tmp/r29-whitebox.md | 72140cc68bead85a4826f2e138a5ed4e858149c412d0a48473296ed41f37c636 | Independently executed compiler/semantic/native verification, default and mapped route counts, declared replacement reconstruction, immutable history and complete delivered-byte comparison |\n| Exploratory — /tmp/r29-exploratory.md | 9ffae900a336feae7770765088beeae57b236b5cdf9c4d166dff386293fc073b | Actual all-page visual inspection, key-page emphasis, marker visibility, PDF/HTML navigation, real local Copy/Paste |\n\nExploratory viewed all 22 current pages through six contact sheets and separately inspected pages 3, 8, 13 and 14. All bibliography markers 1–36 are visible. All 49 PDF citation pairs, 23 Contents destinations and 24 outline entries passed. The six HTML forms retain their expected content and structure. All 23 actual Contents clicks and both actual local clipboard transfers passed, preserving four embedded images, 49 numeric links, eight platform table-row fallbacks, the new emphases and contributor/history content. These are current R29 observations, not inherited R28 visual approval.\n\nThe remaining work is bounded: preserve the original reports, finish current repository metadata/RI closure, run the unchanged owning policy on the exact clean final commit, then verify the existing Draft PR's actual head/draft/Refs and reconcile issue state against that real result. The prior failed clean-source run cannot establish current automated acceptance. Code, native artifact or local-copy success cannot substitute for the whole required policy.\n\nFinal remote delivery, authorial approval, rights clearance, hosted/device acceptance, native platform-editor transfer, merge and publication are distinct observations. None is claimed complete by this prepared-candidate assessment.\n\n## Method and limits\n\nThis role directly read the source changes, final manuscript passages, launch, profile/edition/publication metadata, native evidence, README and main review; independently reconstructed the source, compared protected text/links, hashed and compared actual artifacts, and read the original Code/White-box/Exploratory reports. The read-only supporting receipt is /tmp/r29-requirements-source-artifact-checks.json.\n\nNo repository source or remote state was edited by this reviewer. No additional suite, browser campaign or PDF renderer was run by this role; visual and native compiler observations are explicitly attributed to the independently executed reports above. The original preflight remains unmodified. No extra author clarification or optional test expansion is required.\n\n**Disposition:** the final source and actual native artifacts resolve the author's emphasis complaint. Proceed to the existing exact-clean-source acceptance and Draft PR delivery steps. This report supplies no retrospective pass for R28 and no premature final-policy or remote-delivery claim.\n\n"
}
```

## Final delivery-container correction

The first RI refresh after adding R29 rejected the prepared repository at the unchanged cumulative content-hash limit: **251,815,573 bytes / 250,000,000**, an excess of 1,815,573 bytes. The exact error was `RI content hash bound exceeded at tools/quality/secrets-reviewed.json`; the final visited file was not a defective ledger. The two real-adapter tests in the 29-case RI regression also rejected that same over-budget inventory; the other 27 passed. RI/CI's 20-case regression passed. No RI limit, scan exclusion, source test, ledger or acceptance policy was changed.

The final R29 transport is a lossless **TAR.XZ** archive of the same 34 native files, using PAX tar and LZMA2 preset 6. It is **3,418,440 bytes**, SHA256 `038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089`, saving **3,106,699 bytes** relative to the first 6,525,139-byte R29 ZIP. Every relative member name and byte is preserved. No symlink, path escape, sparse member or content omission is introduced. Source, edition, PDF, native manifest and all frozen R28/earlier artifacts are unchanged. The original R29 ZIP was an uncommitted transport candidate; original reviews of it remain accurate historical receipts above. The package README, catalog and artifact evidence now identify the TAR.XZ carrier and retain the former ZIP identity as superseded transport evidence.

The independently observed post-correction inventory was **248,710,325 hashed bytes**, leaving **1,289,675** below the original bound before these supplemental reports. Normal staging of the declared generated-file replacements resolved the expected tracked-old-path check. The actual unchanged RI producer then built all **1,693 file records and 187 directories**. Final report additions are included in the subsequent fresh projection and clean-source policy, whose receipt belongs to the checkpoint. The separate archive-only role supplements follow; their narrow checks do not rerender or reapprove unchanged article content.

## Original transport Code / Artifact supplement

Original independent report: `r29-ri-bound-review.md`; 7391 bytes; SHA256 `d58b018aba861cb2952e484bba987c43fdfc64423d736731ff228df0d2b128fb`.

````markdown
# R29 RI byte-bound diagnosis and archive correction — independent Code/Artifact review

Reviewer: `/root/r28_code_correction`. Prepared working tree based on `e877de50dfa4aa3ce7cf9fed937bc8ea63de4d46`. This is a narrow supplement to the original R29 Code/Artifact report, not a replacement for it. No repository source, scanner, policy, test, historical artifact or delivery state was modified by this reviewer.

## Decision

**PASS for the storage-only correction.** The replacement TAR.XZ contains all 34 exact native files. It changes the review package's transport format, byte size and archive digest; it does not change the article, PDF, native kit, producer, historical R28 package or verification limits. The actual unchanged RI scanner now completes its read-only scan of the prepared working tree within its original bounds.

This finding does not claim generated RI freshness, successful reruns of the two previously failing adapter cases, final clean-source policy acceptance or completed Draft PR delivery. Those remain execution-owner checks after the final review metadata is incorporated.

## Diagnosis and scope

The execution owner reported 251,815,573 cumulative hashed bytes across 1,691 content files before this correction: 1,815,573 bytes above the existing 250,000,000-byte limit. The reported two adapter errors share `RI content hash bound exceeded at tools/quality/secrets-reviewed.json`.

Inspection of `tools/repository_intelligence.py:143–215` confirms that `scan` adds each file's size to cumulative `hash_total` before testing the 32,000,000-byte per-file and 250,000,000-byte cumulative limits. Therefore the named ledger is the point at which the cumulative scan crossed the bound; the message does not establish a defect or oversized individual file in that ledger. Its actual size is 1,999,068 bytes, below both its 2,000,000-byte parsed-text limit and the per-file hash limit. Its bytes remain equal to HEAD.

The RI contract at `.github/REPOSITORY-INTELLIGENCE.md`, “Identity, bounds and verification,” requires exact-byte hashing of non-cache inputs, explicitly including compressed logs and archived evidence. The scanner also rejects tracked files concealed by exclusions. Replacing a complete, new, uncommitted transport archive with a smaller lossless transport preserves this contract. Raising limits, excluding the new artifact, modifying the unrelated ledger, deleting frozen history, or publishing a partial kit would be materially broader or would weaken the established coverage. None is needed here.

## Direct archive and safety checks

I opened the actual repository TAR.XZ using Python's standard `tarfile` reader without extracting it to the filesystem. I enumerated every member and compared its complete bytes with the corresponding file under the already reviewed native directory:

`dist/publications/pmday-ai-both-sides/8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592`.

| Property | Independent observation |
| --- | --- |
| Archive | `review/issue-2/r29-20261024/The_Sum_of_Our_Technology_R29_2026-10-24_Native_Review_Kit.tar.xz` |
| Compressed bytes | 3,418,440 |
| SHA256 | `038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089` |
| Members | 34 unique paths; exactly the complete native file set |
| Uncompressed member bytes | 8,144,868 |
| Exact member identity | All 34 member bodies equal their native source files byte for byte |
| Path safety | Relative normalized POSIX paths; no absolute paths, `..`, backslashes, null characters or duplicate names |
| Header types | All ordinary regular-file headers, type `0`, mode `0644` |
| Link and sparse behavior | No symlinks, hard links, devices, link targets or sparse members |
| Extended path overrides | No global or member PAX keys in this archive |
| Earlier R29 ZIP | 6,525,139 bytes; SHA256 `40c376d6139d6d551a1a429e5a5dbb3e0a9807246b618bb9711af85546635117` |
| Transport saving | 3,106,699 bytes, exceeding the reported overrun by 1,291,126 bytes before subsequent metadata changes |

This is ordinary complete archive storage, not a manifest standing in for omitted contents. Solid compression can remove repetition across the native package while retaining independently inspectable, exact members. No extraction or runtime change is required in the publishing code.

## Preservation and current metadata

The R29 PDF remains 1,417,566 bytes with SHA256 `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1`. The frozen R28 ZIP remains 6,521,711 bytes with SHA256 `7280ee7b976a9d1ae267ae05dc875683ac18323db57544e8aa09bda9da8df698`. The archive's full member equivalence preserves every native article/platform rendition, authored launch, original presentation and manifest checked in the original R29 review.

I checked the updated R29 README, artifact evidence, catalog entry and current report summary. They name TAR.XZ and its actual identity; the README explains extraction and provides `tar -xf` usage. Artifact evidence separately records the previous uncommitted ZIP identity and the reason for the transport correction. Earlier ZIP observations remain historical observations: all four original R29 Requirements, Code/Artifact, White-box and Exploratory reports are still embedded verbatim in the current review report. In particular, the original Code/Artifact report retains SHA256 `6898abff5dd819c829de77858e99875834727798ba202ebb182f55890ebcfa29`.

Direct byte comparison against HEAD confirms no changes to the RI producer, RI config, RI contract or `tests/test_repository_intelligence.py`. The existing binary-bound rejection regression is retained. The secrets ledger is also unchanged. `git diff --check` passes.

## Actual read-only RI scan

I imported the current unchanged RI producer, loaded its normal config and called its actual `scan` with its two configured derived outputs. This completed successfully, including its tracked-path coverage checks, without writing generated views or running a broad test suite.

| Scanner observation | Result |
| --- | --- |
| Content files | 1,691 |
| Derived-output records | 2 |
| Cumulative hashed bytes at this snapshot | 248,710,325 / 250,000,000 |
| Remaining cumulative headroom | 1,289,675 bytes |
| Largest hashed file | 11,726,610 / 32,000,000 bytes |
| Parsed text total | 19,192,438 / 50,000,000 bytes |

The exact total can increase as final review receipts and continuity notes are added. The execution owner should regenerate and verify RI after those ordinary updates and rerun the bounded adapter failures under the unchanged policy. This observation does not warrant another limit adjustment or a scanner exclusion.

## Original supplemental receipts

- `/tmp/r29-ri-bound-independent.json`: complete 34-member paths, sizes, hashes, safe-header/body checks and preserved-source/artifact comparisons; SHA256 `f03cc32a5d3556797b3759073ac367cc48f4028c56646c0de0637ee7d5028f4c`.
- `/tmp/r29-ri-bound-scan.json`: actual read-only scan outcome, bounds, ledger preservation and header summary; SHA256 `3a6fa330ca3421a062704b1c804451f3434bbbc15f1c53b26b078628a8f0938a`.

The conclusion is limited to this independently inspected archive and prepared working-tree snapshot. The original R29 content/layout approvals remain applicable because the reviewed native bytes are unchanged; the new transport identity is established by this supplement.
````

## Original transport White-box supplement

Original independent report: `r29-whitebox-transport.md`; 3872 bytes; SHA256 `6dda11b804800052534f7d43da4884948dca4812ef5360d3fb63822826fca93e`.

````markdown
# R29 White-box transport supplement

**Role:** independent White-box QA (`/root/r28_whitebox`). **Date:** 24 October 2026. **Disposition: PASS for this container-only correction.** The original `/tmp/r29-whitebox.md` remains intact (SHA256 `72140cc68bead85a4826f2e138a5ed4e858149c412d0a48473296ed41f37c636`). Its ZIP identity is historical; this supplement establishes the current delivered archive.

## Actual independent checks

Read the completed TAR.XZ without extracting it, the preserved prior ZIP in `/tmp/r29-pre-containerfix/`, the actual native directory, current artifact evidence, README and repository catalog. Compared every member to both the native file and prior ZIP bytes.

- Exactly **34 unique members**, all regular files with safe relative paths. No absolute/traversal path, backslash, drive prefix, link, sparse entry or special file; all permissions are `0644`.
- Complete path-set equality with the native kit and original ZIP. All **8,144,868 uncompressed bytes** are preserved exactly, including both manifests, PDF, images and platform forms.
- Current archive and delivery entries in `artifact-evidence.json` match actual hashes and sizes. The catalog owns the TAR.XZ path and has no current R29 ZIP entry; the ZIP file is absent from the current delivery directory. README and current review identity table identify TAR.XZ. The old ZIP identity is explicitly retained as superseded transport history, including verbatim earlier role receipts.
- R28 delivered Markdown/PDF/ZIP, its frozen edition record and failed acceptance report retain their prior verified bytes. R29 delivered Markdown/PDF and every native member retain their approved bytes. No rerender, manuscript reanalysis or technical suite was performed.

## Current archive identity

| Item | Verified value |
| --- | --- |
| Archive | `review/issue-2/r29-20261024/The_Sum_of_Our_Technology_R29_2026-10-24_Native_Review_Kit.tar.xz` |
| SHA256 | `038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089` |
| Compressed bytes | 3,418,440 |
| Members | 34 |
| Unchanged native kit | `8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592` |
| Previous ZIP SHA256 | `40c376d6139d6d551a1a429e5a5dbb3e0a9807246b618bb9711af85546635117` |
| Archive bytes saved | 3,106,699 |

## Unchanged RI budget

Independently enumerated current repository files using the inclusion/exclusion and generated-output rules read from the actual RI scanner and config. The TAR.XZ is included in that inventory. `tools/repository_intelligence.py` and `.github/repository-intelligence-config.json` are byte-identical to e877; the scanner SHA256 remains `dad68d88d241c2cd223081d6a28961c1aa7abc19c0f4c223c9c3382c562aa792`. The original cumulative limit is still **250,000,000 bytes**.

The observed inventory is **1,691 files / 248,710,325 bytes**, leaving **1,289,675 bytes**. Every counted file also remains below the unchanged individual hashing bound. Compression therefore resolves the measured aggregate overflow without a cap increase, exemption, new ignored path or removal of historical artifacts.

This is a bounded read-only size measurement, not full RI projection or owning-policy verification. Appending final review receipts changes the exact total; root's deterministic refresh and final clean-source policy remain the gates for the assembled commit. This supplement claims no new visual/platform review, author/rights approval, remote delivery, merge or publication.

Original executable receipt: `/tmp/r29-whitebox-transport-checks.json`, SHA256 `26917cd5b29a63540ff6daebf915a72487600943d588b380306f1a2b9907be0f`.

**Conclusion:** current TAR.XZ transport preserves the entire reviewed native package and satisfies the unchanged cumulative RI size budget at the inspected snapshot. The original source/artifact reviews remain applicable to their byte-identical contents.
````

## Original transport Requirements supplement

Original independent report: `r29-requirements-transport.md`; 7072 bytes; SHA256 `e4589ad93f4bc78b9815c03aa20c740cec5aeb0fc68b98efe732e911938a5f7d`.

````markdown
# R29 delivery transport — Requirements supplement

Date: 24 October 2026
Reviewer: /root/r28_requirements
Execution owner: issue #5; editorial/publication owner: issue #2; existing Draft PR #79

**Decision: PASS for the prepared transport correction.** The complete R29 native kit may be delivered as TAR.XZ instead of the earlier uncommitted ZIP. The author requested a complete new version and provenance, not a particular compression container. The source, edition, PDF, native kit and editorial decisions remain unchanged. Final exact-clean-source acceptance and remote delivery are still pending.

## Requirement and authorization assessment

The first RI refresh rejected the larger prepared inventory at 251,815,573 cumulative hashed bytes against the existing 250,000,000-byte bound. This is a real repository integration failure, not a manuscript or native-output defect. The correction reduces the new delivery archive's storage without raising the bound, adding exclusions, deleting historical editions, weakening assertions or omitting any native member.

I checked AGENTS, CONTRIBUTING, the owning acceptance policy and current profile for an explicit ZIP-only requirement. None was present. The blueprint's instruction to inspect the delivered ZIP is inside the expressly historical R21 scope, which states that earlier notes are not restrictions on the current scope. That historical statement should remain unchanged. Current R29 delivery instructions can accurately name the final archive format.

TAR.GZ was initially considered; the actual selected container is TAR.XZ. This does not alter the requirement: a standard lossless container with the exact native inventory satisfies the requested complete package. The current README explicitly names TAR.XZ and provides extraction instructions. No additional author clarification or new content edition is required for this packaging-only correction.

## Independent inspection of the final archive

I opened both the measured scratch TAR.XZ and the actual delivered TAR.XZ under review/issue-2/r29-20261024/ with Python's tarfile reader. The actual delivered result is:

| Property | Observed value |
| --- | --- |
| File | The_Sum_of_Our_Technology_R29_2026-10-24_Native_Review_Kit.tar.xz |
| Size | 3,418,440 bytes |
| SHA256 | 038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089 |
| Logical members | 34, all unique |
| Membership | Exactly the 33 declared native outputs plus manifest.json |
| Paths and member types | Regular files with safe relative paths; no absolute path, traversal component, backslash path, symlink, hardlink or duplicate |
| Member contents | Every member byte-identical to its file in native kit 8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592 |

The earlier ZIP was 6,525,139 bytes. The final TAR.XZ saves 3,106,699 bytes while retaining the exact same files. Current manuscript, native PDF and delivered PDF still have the previously reviewed hashes:

- Source: 9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e.
- Native and delivered PDF: 7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1.
- Native manifest: e2a33adeb7cec28e89beaa89cf24886aab3e39ff83b4e3d87255e509b1e4276a.

The source/artifact checks are retained in /tmp/r29-requirements-transport-checks.json. This member-level equality permits reuse of the completed content, layout, navigation and local-copy observations. Re-rendering the same PDF or repeating those interactions would not resolve any new transport risk.

## Currentness, history and evidence

I read the current README, archive evidence and repository path inventory. They name the TAR.XZ file and its current size/hash. The README explains extraction, retains the complete native kit's intended use, and distinguishes the earlier ZIP observations from the final transport. The prepared R29 ZIP no longer occupies the repository delivery directory; previous R28 and older deliverables are not replaced by this change.

The main R29 review's current artifact table names the TAR.XZ identity. Its transport correction preserves the original over-budget failure and explains the actual remedy. Earlier role reports remain historical observations of the ZIP carrier and the same native members; they are not relabelled as inspections of the TAR.XZ.

The two original Requirements reports contained intentional Markdown trailing spaces. Their durable copies are now JSON originalUtf8 string fields rather than whitespace-normalized approximations. I parsed the actual JSON blocks and independently reconstructed their UTF-8 bytes:

- Preflight: 13,802 bytes, SHA256 f6e46bf34418c455234f46470b9067fc356485202481c73eb4d4ca4655cd7f63; exactly equals the original scratch report.
- Prepared final assessment: 15,851 bytes, SHA256 684d987aa6a7aacde560266dad617b05f5763c69370c4f1f7169cbd51d391006; exactly equals the original scratch report.

This encoding preserves the complete original reports and their hashes without rewriting their content. Both JSON blocks parse successfully. The current transport supplement supplies the changed delivery-container disposition.

The original failed e877 policy also remains byte-exact at SHA256 066c5dd5fac7b74847a9e0627d746d8b87627a46f249fb6e710547448d9242c9. It remains a failed historical run.

## Budget and acceptance disposition

I read the current inventory receipt, which records 248,710,325 hashed bytes against 250,000,000, leaving 1,289,675 bytes before the final supplemental-report additions. Code and White-box independently measured this inventory. Root reports that the unchanged RI producer then built 1,693 file records and 187 directories and that fresh verification passed after normal index closure of declared generated-file replacements.

I independently verified that tools/repository_intelligence.py has no change from e877 and still declares MAX_HASH_TOTAL_BYTES = 250_000_000. The owning policy remains SHA256 27ad8e1dd6f328c5cfeebd48b572abc365e9fdd9c3296be06ea6bd0f4c451429. The original over-budget failure is therefore resolved through lossless storage reduction, not a relaxed guard.

R29.1–R29.4 are unaffected. R29.5 remains satisfied with the corrected current transport identity and recoverable original provenance. The archive portion of R29.6 passes on the actual final delivered container. Final report inclusion, deterministic projection for the complete final candidate, exact-clean-source policy and real Draft PR readback remain separate final observations; the pre-supplement inventory is not presented as the final committed inventory.

No repository, remote, test policy, source or artifact was edited by this reviewer. No broad suite or rendering was run. This report authorizes no merge, stage deployment, public post or publication.

**Disposition:** retain the current TAR.XZ delivery and all historical artifacts/receipts; proceed with the final unchanged acceptance and Draft PR delivery steps. No further compression experiment, native rebuild, editorial change or author confirmation is required.

````

## Original transport Exploratory / Interaction supplement

Original independent report: `r29-exploratory-transport.md`; 5748 bytes; SHA256 `fc81691612874c139fe75757d34d0d337b6b3315aaec8011f691fc0d4bfe2c2d`.

````markdown
# R29 independent exploratory supplement — final TAR.XZ transport

Reviewer: `/root/r28_exploratory`. Date: 24 October 2026.
Repository: `/workspace/scratch/c91ea22e72f1/author-site`.

## Disposition

**PASS for the final transport delta.** The current TAR.XZ extracts successfully using the README's `tar -xf` method. Its 34 extracted files match the previously reviewed native kit byte for byte. The extracted `article.html` opens directly as a local file, and all four relative article images resolve and decode. Current README delivery links and extraction instructions agree with the actual files. No blocking transport issue was found.

No article, PDF, producer or layout change was introduced by this transport check. The original all-22-page, navigation and local-copy report remains `/tmp/r29-exploratory.md`, SHA256 `9ffae900a336feae7770765088beeae57b236b5cdf9c4d166dff386293fc073b`. Its observations remain bound to the same bytes; they were not relabelled as newly executed tests. No rerender, Contents campaign or clipboard retest was necessary.

## Exact current carrier

| Item | Identity |
| --- | --- |
| Delivered archive | `review/issue-2/r29-20261024/The_Sum_of_Our_Technology_R29_2026-10-24_Native_Review_Kit.tar.xz` |
| Archive bytes | 3,418,440 |
| Archive SHA256 | `038392346ededf1852b91981ae8f8826551e5202ce6ddfaa6d57e81d1ff1e089` |
| Native kit | `8b1686cb3f856fab534418d9e191db7aeb30c127a2404604a428b59b2913d592` |
| Source SHA256, unchanged | `9c75ec7b9372e159cc33c332e25e68010fcedd81293c838ba53ce1bf7f679d1e` |
| PDF SHA256, unchanged | `7939f15ebfe1ac2588c0cedc79f53f4400d1a0271b174df732e4b0c2447ed7d1` |
| README inspected SHA256 | `783b9791ed634328891235b72872475f49054fbab21a9d7dced2dc34dc9fa0d4` |

## Executed smoke check and oracle

1. Independently hashed the actual delivered TAR.XZ and confirmed its stated size and identity. Inspected the archive member paths before extraction: no absolute or parent-traversal paths and no link/special-file members.
2. Created an empty temporary directory, `/tmp/r29-exploratory-transport-_h5vsuf2`, and executed `tar -xf` with the delivered archive as the argument and that directory as the working directory. Extraction completed successfully.
3. Enumerated the extracted files and compared their names and bytes with the exact reviewed native kit. **All 34 files match**, with no missing or extra file. Independently compared the standalone delivered Markdown/PDF aliases with extracted `article.md` and `article.pdf`: both are exact.
4. Opened the extracted `article.html` directly through a local `file:` URL in the existing Chromium 153.0.8010.0 / Playwright 1.63.0 environment, pinned Node v24.19.0, viewport 1280×900. Browser routing allowed only the extracted directory and data URLs; no hosted server or external deployment was involved.
5. Confirmed the title, R29 edition/history and two native tables. Awaited decoding of all four article images and checked that each resolved inside the extracted directory:

| Relative image | Decoded dimensions |
| --- | --- |
| `images/01-cover.png` | 1280×398 |
| `images/03-pmday-slide-03.png` | 1921×1080 |
| `images/04-pmday-slide-09.png` | 1921×1080 |
| `images/05-pmday-slide-12.png` | 1921×1080 |

There were **zero page errors and zero failed requests**. A screenshot of the opened extracted document was captured and actually viewed: title, edition, author and Contents are readable and the ordinary local HTML styling is intact. This single opening is the complete requested browser smoke; it is not a new all-figure visual campaign.

## README and direct deliverables

The README links the actual `.pdf`, `.md`, `.tar.xz` and `artifact-evidence.json` files. All six local links in the README resolve, including the retained R29 review and historical R28 failed-policy record. The current archive download link uses TAR.XZ; ZIP appears only as an accurately labelled historical carrier in explanatory text.

The instructions explicitly require extraction before opening ordinary HTML or `review.md`, explain the local image paths, and give `tar -xf The_Sum_of_Our_Technology_R29_2026-10-24_Native_Review_Kit.tar.xz`. That method was exercised in this review. The standalone manuscript is described accurately as canonical Markdown using asset identifiers, while the extracted review rendition supplies local image paths. The standalone PDF remains directly usable. Planning locations remain correctly documented as pages 13–14.

## Original evidence

| Evidence | SHA256 |
| --- | --- |
| `/tmp/r29-exploratory-transport-extract.json` | `92405bfa68495ae5dcef1101546e1e6640a1328d8dbc1780b984de3fdd8c2cb0` |
| `/tmp/r29-exploratory-transport-browser.json` | `cf44456e49db4fac19efc8a29ccfed5a66f39f2458dac0325c7d5982b0e448b2` |
| `/tmp/r29-exploratory-transport-readme.json` | `d637f5ae2890354fd5c553d2162f9b0ed8405edc0dd5261eea38e50f7a19197e` |
| `/tmp/r29-exploratory-transport-open.png` | `456310359d9aaec04668c7d0a97eef9c8feeef909bbc1ad505f0ce5313e8dd03` |

The browser driver is `/tmp/r29-exploratory-transport-browser.cjs`. Extraction receipt records every extracted file hash, the exact command and working directory. Earlier PDF/page/copy evidence remains unchanged.

## Limits

This is an independent user-facing extraction/opening check and exact-byte transport comparison. It does not certify every OS/archive application, proprietary platform transfer, repository inventory policy or the final full gate. Those owning-policy claims remain with their respective evidence. No repository source, delivered artifact, historical R28 file or remote state was changed by this reviewer. Only temporary extraction and QA evidence were written. No further transport check is needed within this charter.
````
