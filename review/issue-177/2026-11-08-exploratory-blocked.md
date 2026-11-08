# Issue 177 — independent Exploratory / Interaction QA, first result

Date: 2026-11-08. Reviewer/task handle: `/root/issue177_exploratory`; nonauthor role. First independent judgment: **BLOCKED — required browser interaction not observed**. No product correctness verdict is established by source inspection. No peer reports, author conversation, parent scratch notes or `review/issue-177` report contents were read before this judgment. Repository paths and supplied issue are primary inputs. The repository MEMORY handoff was deliberately not used to import author judgments.

## Identity and scope

- Repository: `/workspace/scratch/538c6c66c100/repo`; observed HEAD/base `fdfc8cb67a6f78996932d9688c563c53c21387f2`; staged/dirty prepared candidate, not a clean commit checkout.
- Packet: `/tmp/issue177-candidate-manifest.json`, SHA-256 `193107691ad6dd16759636ad9bb56d1af1ac52e9fa70e168da53a6c45bdfa9b6` (independently recomputed).
- Actual supplied diff: `/tmp/issue177-candidate.diff`, SHA-256 `f07173dc698f524b856e3fac597e527d734898dec1ea2e905b0428ff31f5c01e` (recomputed); inspected staged build/test diff and compiled source directly, not all unrelated generated preview bytes.
- Issue text: `/tmp/issue177-owner.md`, SHA-256 `e0b6a6dffbe432e14cf5313f1c0f7ad39e04f398fa9d2a552339f6dcf7769f6c`.
- Common prompt: `agents/reviewers/README.md`, SHA-256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt: `agents/reviewers/exploratory-interaction-qa.md`, SHA-256 `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`.
- Launch: task message explicitly states requested/accepted `fork_turns="none"`; actual parent launch tool response is held by orchestrator, not independently visible here. Provider model/context internals unknown. Shared platform instructions/tools/filesystem are not a security sandbox or provider isolation attestation.
- Read root README/AGENTS/CONTRIBUTING, reviewer prompts, repository map navigation, site source contract, analytics contract, relevant check-profile allocation, actual loader/compiler/build/test sources. Only root AGENTS was found in repository inventory.
- Accepted scope: article analytics, QA suppression and bounded checks only, then stop/report. No theme, SEO, staging, merge, deploy, real vendor traffic or external write. No source/test changes or delegation performed.

## Charter and actual execution

Bound: requested approximately five-minute review; one browser campaign attempt, no unchanged retry. Planned Chromium desktop viewport 1280×800, reduced motion, service workers blocked; readiness/SDK 6000 ms and navigation 30000 ms. Every URL would be intercepted, compiled documents/resources fulfilled from local `docs`; SDK stubbed; all other destinations aborted. Configured canonical origin `https://vitaliioborskyi.ai` is a browser fixture origin, not a request to the live site.

| Case | Independent expected result | Actual observation |
| --- | --- | --- |
| Compiled canonical article direct entry with query/fragment and reload | Article renders; one SDK each document | NOT OBSERVED: browser launch failed before page creation |
| Declared extensionless article direct entry and reload | Same admission and document semantics | NOT OBSERVED |
| Article → Writing → Article, Back/Forward | Navigation completes; SDK singleton maintained within document | NOT OBSERVED |
| Blocked SDK on article and internal/history navigation | Loader marks blocked; reader navigation remains usable | NOT OBSERVED |
| Same compiled article on staging origin | No SDK request/element; reader remains usable | NOT OBSERVED |
| Existing `analytics-browser.isolationJourney`, local sink | Isolated six attempts blocked, ordinary six permitted locally; one SDK/document, undeclared forms rejected | NOT EXECUTED: launch failed before invocation |

Actual command: `node /tmp/issue177-exploratory-driver.cjs > /tmp/issue177-exploratory-run.log 2>&1` in repository. Playwright module resolved and attempted `/usr/bin/chromium`; Chromium aborted (SIGABRT) before first context/page: `FATAL:chrome/browser/process_singleton_posix.cc:297 ... socket() failed: Operation not permitted (1)`. Raw launch failure retained at `/tmp/issue177-exploratory-run.log`; bounded driver at `/tmp/issue177-exploratory-driver.cjs`. No screenshot, page observation or final JSON run accounting exists; do not count planned cases as passed.

Diagnosis: environment/browser startup failure, not an observed analytics or navigation failure. Smallest diagnostic action attempted the same fully intercepted command outside default sandbox, solely to distinguish socket restriction. Tool rejected before execution: granular policy `sandbox_approval: false` forbids escalation. No second browser campaign ran and no restriction bypass was attempted. This gate requires an executor able to launch Chromium under approved permissions. Parent was informed of both exact failures.

## Source observations, limits and allocation

The actual compiled loader has exact HTTPS/origin guards, finite principal routes plus `/articles/the-sdlc-is-out-of-balance.html`, its extensionless predicate, singleton element and load/error status. Its SHA-256 is `1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7`; article SHA-256 is `e1e120ebefe1b6b8d0d2846a665ca7b9e3b66f2e0b273de333f7b5fca10b244b`. Build source derives additions from validated catalog local-article records and hashes measurement head into route/article versions. Article has Writing return links. Those are source observations, not execution/collector evidence.

No product defect demonstrated in the inspected source. **Blocking evidence gap:** AC02/AC03 and browser component of AC07 remain unverified by this reviewer because no browser page ran. Keep the role incomplete for advancement; source reasoning or another role's pass cannot substitute for this role's required interaction.

Allocation through existing `guides/SITE-CHECK-PROFILES.md` and `guides/SITE-ANALYTICS.md`: compiled-article journey is bounded manual/exploratory evidence under issue177, existing source admission regressions in `tests/site-articles.test.cjs` own catalog/alias/invalidation boundaries; `tools/quality/analytics-browser.cjs` existing functional analytics/native smoke local-sink contrast owns suppression/ordinary isolation. No new persistent test authored, proposed case not counted executed. If continued by a distinct operator, run compiled article direct/alias/reload/internal/history/blocked-origin journey under existing bounds and retain source identities/raw observations. Live mutable SDK pageview receipt and hosted SDK cost remain separate future owner-authorized provider checks; no current synthetic result could close them.

First result preserved. Stop/report checkpoint respected; no subsequent reconciliation exposure in this result.
